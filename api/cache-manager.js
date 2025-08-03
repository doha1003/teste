/**
 * API 캐싱 관리자
 * - 메모리 기반 LRU 캐시
 * - TTL 지원
 * - 압축 지원
 * - 캐시 히트율 추적
 */

import crypto from 'crypto';
import { performance } from 'perf_hooks';

class CacheManager {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000;
    this.defaultTtl = options.defaultTtl || 300000; // 5분
    this.compressionThreshold = options.compressionThreshold || 1024; // 1KB
    this.enableCompression = options.enableCompression !== false;

    // 캐시 저장소
    this.cache = new Map();
    this.accessOrder = new Map(); // LRU 관리

    // 통계
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      compressionSaves: 0,
      totalRequests: 0,
      createdAt: Date.now(),
    };

    // 정리 타이머
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // 1분마다
  }

  /**
   * 캐시 키 생성
   */
  generateKey(namespace, data) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const hash = crypto.createHash('sha256').update(dataString).digest('hex');
    return `${namespace}:${hash.substring(0, 16)}`;
  }

  /**
   * 데이터 압축 (간단한 JSON 최적화)
   */
  compress(data) {
    if (!this.enableCompression) return data;

    const stringified = JSON.stringify(data);
    if (stringified.length < this.compressionThreshold) return data;

    try {
      // JSON 압축 최적화 (공백 제거, 키 단축 등)
      const compressed = stringified.replace(/\s+/g, '').replace(/"([^"]+)":/g, (match, key) => {
        // 자주 사용되는 키들을 짧게 변환
        const keyMap = {
          success: 's',
          data: 'd',
          error: 'e',
          message: 'm',
          timestamp: 't',
          scores: 'sc',
          descriptions: 'de',
          overall: 'o',
          love: 'l',
          money: 'mo',
          health: 'h',
          work: 'w',
        };
        return `"${keyMap[key] || key}":`;
      });

      if (compressed.length < stringified.length) {
        this.stats.compressionSaves++;
        return { _compressed: true, _data: compressed };
      }
    } catch (error) {
      // 압축 실패 시 원본 반환
    }

    return data;
  }

  /**
   * 데이터 압축 해제
   */
  decompress(data) {
    if (!data || typeof data !== 'object' || !data._compressed) {
      return data;
    }

    try {
      let decompressed = data._data;

      // 키 복원
      const keyMap = {
        s: 'success',
        d: 'data',
        e: 'error',
        m: 'message',
        t: 'timestamp',
        sc: 'scores',
        de: 'descriptions',
        o: 'overall',
        l: 'love',
        mo: 'money',
        h: 'health',
        w: 'work',
      };

      Object.entries(keyMap).forEach(([short, long]) => {
        const regex = new RegExp(`"${short}":`, 'g');
        decompressed = decompressed.replace(regex, `"${long}":`);
      });

      return JSON.parse(decompressed);
    } catch (error) {
      return data._data || data;
    }
  }

  /**
   * 캐시에서 데이터 조회
   */
  get(key) {
    this.stats.totalRequests++;

    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    // TTL 확인
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      this.stats.misses++;
      return null;
    }

    // 액세스 순서 업데이트 (LRU)
    this.accessOrder.set(key, Date.now());
    this.stats.hits++;

    // 압축 해제 후 반환
    return this.decompress(item.value);
  }

  /**
   * 캐시에 데이터 저장
   */
  set(key, value, ttl = null) {
    const actualTtl = ttl || this.defaultTtl;
    const expiresAt = actualTtl > 0 ? Date.now() + actualTtl : null;

    // 캐시 크기 제한 확인 및 정리
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    // 데이터 압축
    const compressedValue = this.compress(value);

    // 캐시에 저장
    this.cache.set(key, {
      value: compressedValue,
      expiresAt,
      createdAt: Date.now(),
      accessCount: 1,
    });

    this.accessOrder.set(key, Date.now());
  }

  /**
   * LRU 기반 캐시 제거
   */
  evictLRU() {
    // 가장 오래된 항목 찾기
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, time] of this.accessOrder) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * 만료된 항목 정리
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, item] of this.cache) {
      if (item.expiresAt && now > item.expiresAt) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => {
      this.cache.delete(key);
      this.accessOrder.delete(key);
    });

    if (expiredKeys.length > 0) {
      console.debug(`Cache cleanup: removed ${expiredKeys.length} expired items`);
    }
  }

  /**
   * 캐시 통계 조회
   */
  getStats() {
    const hitRate =
      this.stats.totalRequests > 0
        ? ((this.stats.hits / this.stats.totalRequests) * 100).toFixed(2)
        : 0;

    const memoryUsage = this.getMemoryUsage();

    return {
      ...this.stats,
      hitRate: parseFloat(hitRate),
      size: this.cache.size,
      maxSize: this.maxSize,
      memoryUsage,
      uptime: Date.now() - this.stats.createdAt,
    };
  }

  /**
   * 메모리 사용량 추정
   */
  getMemoryUsage() {
    let totalSize = 0;

    for (const [key, item] of this.cache) {
      totalSize += JSON.stringify(key).length;
      totalSize += JSON.stringify(item).length;
    }

    return {
      bytes: totalSize,
      kb: Math.round((totalSize / 1024) * 100) / 100,
      mb: Math.round((totalSize / 1024 / 1024) * 100) / 100,
    };
  }

  /**
   * 캐시 클리어
   */
  clear() {
    this.cache.clear();
    this.accessOrder.clear();
    this.stats = {
      ...this.stats,
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
    };
  }

  /**
   * 특정 네임스페이스의 캐시 무효화
   */
  invalidateNamespace(namespace) {
    const keysToDelete = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith(`${namespace}:`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.accessOrder.delete(key);
    });

    return keysToDelete.length;
  }

  /**
   * 캐시된 함수 호출 래퍼
   */
  cached(namespace, keyData, fn, ttl = null) {
    const key = this.generateKey(namespace, keyData);

    // 캐시에서 조회
    const cachedResult = this.get(key);
    if (cachedResult !== null) {
      return Promise.resolve(cachedResult);
    }

    // 캐시 미스 - 함수 실행 후 캐시에 저장
    const startTime = performance.now();

    return Promise.resolve(fn())
      .then((result) => {
        const duration = performance.now() - startTime;

        // 성공한 결과만 캐시에 저장
        if (result !== null && result !== undefined) {
          this.set(
            key,
            {
              result,
              cached: true,
              cachedAt: Date.now(),
              computeDuration: Math.round(duration),
            },
            ttl
          );
        }

        return result;
      })
      .catch((error) => {
        // 에러는 캐시하지 않음
        throw error;
      });
  }

  /**
   * 인스턴스 정리
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// 전역 캐시 인스턴스들
const globalCaches = {
  fortune: null,
  manseryeok: null,
  general: null,
};

/**
 * 캐시 인스턴스 팩토리
 */
export function getCache(type = 'general', options = {}) {
  const defaultOptions = {
    fortune: {
      maxSize: 500,
      defaultTtl: 1800000, // 30분 (운세는 하루 종일 유효)
      enableCompression: true,
    },
    manseryeok: {
      maxSize: 2000,
      defaultTtl: 86400000, // 24시간 (만세력은 불변)
      enableCompression: true,
    },
    general: {
      maxSize: 1000,
      defaultTtl: 300000, // 5분
      enableCompression: true,
    },
  };

  if (!globalCaches[type]) {
    const config = { ...defaultOptions[type], ...options };
    globalCaches[type] = new CacheManager(config);
  }

  return globalCaches[type];
}

/**
 * 모든 캐시 통계 조회
 */
export function getAllCacheStats() {
  const stats = {};

  Object.entries(globalCaches).forEach(([type, cache]) => {
    if (cache) {
      stats[type] = cache.getStats();
    }
  });

  return stats;
}

/**
 * 전체 캐시 무효화
 */
export function clearAllCaches() {
  Object.values(globalCaches).forEach((cache) => {
    if (cache) cache.clear();
  });
}

export { CacheManager };
