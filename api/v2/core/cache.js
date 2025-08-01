/**
 * @fileoverview 메모리 기반 캐싱 시스템 - Vercel Functions 최적화
 * @version 2.0.0
 * @author doha.kr Backend Team
 */

import { createLogger } from './logger.js';

const logger = createLogger('cache');

/**
 * LRU (Least Recently Used) 캐시 구현
 */
class LRUCache {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };
  }

  /**
   * 캐시에서 값 조회
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      logger.debug('Cache miss', { key: this.maskKey(key) });
      return null;
    }

    // TTL 확인
    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.stats.misses++;
      logger.debug('Cache expired', { key: this.maskKey(key) });
      return null;
    }

    // LRU 업데이트 - 맨 뒤로 이동
    this.cache.delete(key);
    this.cache.set(key, {
      ...item,
      lastAccessed: Date.now()
    });

    this.stats.hits++;
    logger.debug('Cache hit', { key: this.maskKey(key) });
    
    return item.value;
  }

  /**
   * 캐시에 값 저장
   */
  set(key, value, ttl = 300000) { // 기본 5분
    const now = Date.now();
    const item = {
      value,
      createdAt: now,
      lastAccessed: now,
      expiresAt: now + ttl
    };

    // 크기 제한 확인
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, item);
    this.stats.sets++;
    
    logger.debug('Cache set', { 
      key: this.maskKey(key), 
      ttl,
      size: this.cache.size 
    });
  }

  /**
   * 캐시에서 값 삭제
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      logger.debug('Cache delete', { key: this.maskKey(key) });
    }
    return deleted;
  }

  /**
   * 키 존재 여부 확인
   */
  has(key) {
    const item = this.cache.get(key);
    return item && !this.isExpired(item);
  }

  /**
   * 만료된 항목인지 확인
   */
  isExpired(item) {
    return Date.now() > item.expiresAt;
  }

  /**
   * LRU 항목 제거
   */
  evictLRU() {
    // Map의 첫 번째 항목이 가장 오래된 항목
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
      this.stats.evictions++;
      logger.debug('Cache eviction', { key: this.maskKey(firstKey) });
    }
  }

  /**
   * 만료된 항목들 정리
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('Cache cleanup', { cleaned, remaining: this.cache.size });
    }

    return cleaned;
  }

  /**
   * 전체 캐시 비우기
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    logger.info('Cache cleared', { previousSize: size });
  }

  /**
   * 캐시 통계
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      maxSize: this.maxSize,
      memoryUsage: this.cache.size * 500 // 대략적인 메모리 사용량
    };
  }

  /**
   * 키 마스킹 (로깅용)
   */
  maskKey(key) {
    if (key.length <= 10) return key;
    return key.substring(0, 5) + '...' + key.substring(key.length - 5);
  }
}

/**
 * 다중 레벨 캐시 시스템
 */
class MultiLevelCache {
  constructor() {
    // 레벨별 캐시
    this.l1Cache = new LRUCache(500);  // 빠른 액세스, 작은 크기
    this.l2Cache = new LRUCache(2000); // 중간 속도, 큰 크기
    
    this.cleanupInterval = null;
    this.startCleanup();
  }

  /**
   * 캐시에서 값 조회 (L1 -> L2 순서)
   */
  async get(key) {
    // L1 캐시 확인
    let value = this.l1Cache.get(key);
    if (value !== null) {
      return value;
    }

    // L2 캐시 확인
    value = this.l2Cache.get(key);
    if (value !== null) {
      // L1 캐시에 승격
      this.l1Cache.set(key, value, 300000); // 5분
      return value;
    }

    return null;
  }

  /**
   * 캐시에 값 저장
   */
  async set(key, value, ttl = 300000) {
    // 작은 데이터는 L1에, 큰 데이터는 L2에
    const valueSize = JSON.stringify(value).length;
    
    if (valueSize < 1024) { // 1KB 미만
      this.l1Cache.set(key, value, ttl);
    } else {
      this.l2Cache.set(key, value, ttl);
    }
  }

  /**
   * 캐시에서 값 삭제
   */
  async delete(key) {
    const deleted1 = this.l1Cache.delete(key);
    const deleted2 = this.l2Cache.delete(key);
    return deleted1 || deleted2;
  }

  /**
   * 키 존재 여부 확인
   */
  async has(key) {
    return this.l1Cache.has(key) || this.l2Cache.has(key);
  }

  /**
   * 전체 캐시 비우기
   */
  async clear() {
    this.l1Cache.clear();
    this.l2Cache.clear();
  }

  /**
   * 통합 통계
   */
  getStats() {
    const l1Stats = this.l1Cache.getStats();
    const l2Stats = this.l2Cache.getStats();

    return {
      l1: l1Stats,
      l2: l2Stats,
      total: {
        hits: l1Stats.hits + l2Stats.hits,
        misses: l1Stats.misses + l2Stats.misses,
        size: l1Stats.size + l2Stats.size,
        memoryUsage: l1Stats.memoryUsage + l2Stats.memoryUsage
      }
    };
  }

  /**
   * 주기적 정리 시작
   */
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.l1Cache.cleanup();
      this.l2Cache.cleanup();
    }, 5 * 60 * 1000); // 5분마다
  }

  /**
   * 정리 중지
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

/**
 * 캐시 키 생성 헬퍼
 */
export class CacheKeyBuilder {
  constructor(prefix = 'doha') {
    this.prefix = prefix;
  }

  /**
   * 기본 키 생성
   */
  build(...parts) {
    return `${this.prefix}:${parts.join(':')}`;
  }

  /**
   * API 응답 키 생성
   */
  apiResponse(endpoint, params = {}) {
    const paramStr = Object.keys(params).length > 0 
      ? ':' + Object.entries(params)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}=${v}`)
          .join('&')
      : '';
    return this.build('api', endpoint + paramStr);
  }

  /**
   * 사용자별 키 생성
   */
  userSpecific(userId, ...parts) {
    return this.build('user', userId, ...parts);
  }

  /**
   * 임시 키 생성 (짧은 TTL용)
   */
  temporary(...parts) {
    return this.build('temp', Date.now(), ...parts);
  }
}

/**
 * 캐시 래퍼 클래스 - 비즈니스 로직과 캐시 분리
 */
export class CacheWrapper {
  constructor(cache, keyBuilder) {
    this.cache = cache;
    this.keyBuilder = keyBuilder;
  }

  /**
   * 함수 결과 캐싱
   */
  async memoize(fn, keyParts, ttl = 300000) {
    const key = this.keyBuilder.build(...keyParts);
    
    // 캐시에서 확인
    let result = await this.cache.get(key);
    if (result !== null) {
      return result;
    }

    // 함수 실행 및 캐싱
    result = await fn();
    if (result !== null && result !== undefined) {
      await this.cache.set(key, result, ttl);
    }

    return result;
  }

  /**
   * API 응답 캐싱
   */
  async cacheApiResponse(endpoint, params, responseFn, ttl = 300000) {
    const key = this.keyBuilder.apiResponse(endpoint, params);
    return await this.memoize(responseFn, [key], ttl);
  }

  /**
   * 조건부 캐싱
   */
  async conditionalCache(condition, keyParts, fn, ttl = 300000) {
    if (!condition) {
      return await fn();
    }
    return await this.memoize(fn, keyParts, ttl);
  }
}

// 싱글톤 캐시 인스턴스
const cache = new MultiLevelCache();
const keyBuilder = new CacheKeyBuilder();
const cacheWrapper = new CacheWrapper(cache, keyBuilder);

/**
 * 캐시 태깅 시스템
 */
const cacheTags = new Map();

export const CacheTagManager = {
  /**
   * 태그 추가
   */
  addTag(key, tags) {
    if (!Array.isArray(tags)) tags = [tags];
    
    tags.forEach(tag => {
      if (!cacheTags.has(tag)) {
        cacheTags.set(tag, new Set());
      }
      cacheTags.get(tag).add(key);
    });
  },

  /**
   * 태그로 캐시 무효화
   */
  async invalidateByTag(tag) {
    const keys = cacheTags.get(tag);
    if (!keys) return 0;

    let invalidated = 0;
    for (const key of keys) {
      const deleted = await cache.delete(key);
      if (deleted) invalidated++;
    }

    cacheTags.delete(tag);
    logger.info('Cache invalidated by tag', { tag, invalidated });
    
    return invalidated;
  },

  /**
   * 모든 태그 제거
   */
  clearTags() {
    cacheTags.clear();
  }
};

export {
  cache,
  keyBuilder,
  cacheWrapper,
  LRUCache,
  MultiLevelCache
};

export default cache;