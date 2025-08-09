/**
 * Cache Manager - Vercel Functions용 메모리 캐시 시스템
 * 서버리스 환경에 최적화된 캐싱 솔루션
 */

import { createHash } from 'crypto';

// 글로벌 캐시 저장소 (서버리스 함수 간 공유)
const globalCaches = new Map();

class MemoryCache {
  constructor(name, options = {}) {
    this.name = name;
    this.options = {
      maxSize: options.maxSize || 1000,
      defaultTtl: options.defaultTtl || 300000, // 5분
      enableCompression: options.enableCompression || false,
      cleanupInterval: options.cleanupInterval || 60000, // 1분
      ...options,
    };

    this.data = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      cleanups: 0,
      createdAt: Date.now(),
    };

    // 자동 정리 타이머 (서버리스 환경에서는 제한적)
    this.setupCleanup();
  }

  /**
   * 캐시 키 생성
   */
  generateKey(prefix, data) {
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    const hash = createHash('md5').update(dataStr).digest('hex');
    return `${prefix}:${hash}`;
  }

  /**
   * 데이터 조회
   */
  get(key) {
    const entry = this.data.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // TTL 확인
    if (entry.expireAt && Date.now() > entry.expireAt) {
      this.data.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return this.decompressValue(entry.value);
  }

  /**
   * 데이터 저장
   */
  set(key, value, ttl = null) {
    const expireAt = ttl ? Date.now() + ttl : Date.now() + this.options.defaultTtl;
    
    // 크기 제한 확인
    if (this.data.size >= this.options.maxSize && !this.data.has(key)) {
      this.evictOldest();
    }

    const compressedValue = this.compressValue(value);
    
    this.data.set(key, {
      value: compressedValue,
      createdAt: Date.now(),
      expireAt: expireAt,
      accessCount: 0,
      size: this.getValueSize(compressedValue),
    });

    this.stats.sets++;
    return true;
  }

  /**
   * 데이터 삭제
   */
  delete(key) {
    const deleted = this.data.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * 캐시 전체 정리
   */
  clear() {
    const size = this.data.size;
    this.data.clear();
    this.stats.cleanups++;
    return size;
  }

  /**
   * 만료된 항목 정리
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.data.entries()) {
      if (entry.expireAt && now > entry.expireAt) {
        this.data.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.cleanups++;
    }

    return cleaned;
  }

  /**
   * 가장 오래된 항목 제거 (LRU)
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.data.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.data.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * 값 압축 (선택적)
   */
  compressValue(value) {
    if (!this.options.enableCompression) {
      return value;
    }

    // 간단한 JSON 압축 (실제 구현에서는 더 정교한 압축을 사용할 수 있음)
    if (typeof value === 'object') {
      return {
        compressed: true,
        data: JSON.stringify(value),
        originalType: 'object',
      };
    }

    return value;
  }

  /**
   * 값 압축 해제
   */
  decompressValue(value) {
    if (!this.options.enableCompression || !value?.compressed) {
      return value;
    }

    if (value.originalType === 'object') {
      return JSON.parse(value.data);
    }

    return value;
  }

  /**
   * 값 크기 계산
   */
  getValueSize(value) {
    try {
      return JSON.stringify(value).length;
    } catch {
      return String(value).length;
    }
  }

  /**
   * 자동 정리 설정
   */
  setupCleanup() {
    // 서버리스 환경에서는 장기 실행 타이머가 의미가 없으므로
    // 요청 시마다 정리를 수행하는 방식으로 변경
    this.lastCleanup = Date.now();
  }

  /**
   * 주기적 정리 확인
   */
  maybeCleanup() {
    const now = Date.now();
    if (now - this.lastCleanup > this.options.cleanupInterval) {
      this.cleanup();
      this.lastCleanup = now;
    }
  }

  /**
   * 통계 정보
   */
  getStats() {
    const now = Date.now();
    const uptime = now - this.stats.createdAt;
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    let totalSize = 0;
    let expiredCount = 0;

    for (const [key, entry] of this.data.entries()) {
      totalSize += entry.size || 0;
      if (entry.expireAt && now > entry.expireAt) {
        expiredCount++;
      }
    }

    return {
      name: this.name,
      size: this.data.size,
      maxSize: this.options.maxSize,
      totalSizeBytes: totalSize,
      expiredCount,
      hitRate: parseFloat(hitRate),
      uptime,
      stats: { ...this.stats },
      memory: {
        used: totalSize,
        efficiency: this.data.size > 0 ? (totalSize / this.data.size).toFixed(2) : 0,
      },
    };
  }

  /**
   * 캐시 상태 확인
   */
  has(key) {
    const entry = this.data.get(key);
    if (!entry) return false;
    
    // TTL 확인
    if (entry.expireAt && Date.now() > entry.expireAt) {
      this.data.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * 모든 키 목록
   */
  keys() {
    const validKeys = [];
    const now = Date.now();

    for (const [key, entry] of this.data.entries()) {
      if (!entry.expireAt || now <= entry.expireAt) {
        validKeys.push(key);
      }
    }

    return validKeys;
  }

  /**
   * 키 패턴 매칭
   */
  getByPattern(pattern) {
    const regex = new RegExp(pattern);
    const matches = {};

    for (const key of this.keys()) {
      if (regex.test(key)) {
        matches[key] = this.get(key);
      }
    }

    return matches;
  }
}

/**
 * 캐시 인스턴스 생성/조회
 */
export function getCache(name, options = {}) {
  if (!globalCaches.has(name)) {
    const cache = new MemoryCache(name, options);
    globalCaches.set(name, cache);
  }

  const cache = globalCaches.get(name);
  
  // 주기적 정리 수행
  cache.maybeCleanup();
  
  return cache;
}

/**
 * 모든 캐시 통계
 */
export function getAllCacheStats() {
  const stats = {};
  
  for (const [name, cache] of globalCaches.entries()) {
    stats[name] = cache.getStats();
  }

  return {
    caches: stats,
    totalCaches: globalCaches.size,
    globalMemory: process.memoryUsage(),
  };
}

/**
 * 모든 캐시 정리
 */
export function clearAllCaches() {
  let totalCleared = 0;
  
  for (const [name, cache] of globalCaches.entries()) {
    totalCleared += cache.clear();
  }
  
  return totalCleared;
}

/**
 * 만료된 모든 항목 정리
 */
export function cleanupAllCaches() {
  let totalCleaned = 0;
  
  for (const [name, cache] of globalCaches.entries()) {
    totalCleaned += cache.cleanup();
  }
  
  return totalCleaned;
}

/**
 * 캐시 삭제
 */
export function deleteCache(name) {
  const cache = globalCaches.get(name);
  if (cache) {
    cache.clear();
    globalCaches.delete(name);
    return true;
  }
  return false;
}

// 기본 내보내기
export default {
  getCache,
  getAllCacheStats,
  clearAllCaches,
  cleanupAllCaches,
  deleteCache,
  MemoryCache,
};