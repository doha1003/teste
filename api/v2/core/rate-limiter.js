/**
 * @fileoverview Rate Limiting 시스템 - 메모리 기반 고성능 구현
 * @version 2.0.0
 * @author doha.kr Backend Team
 */

import { createLogger } from './logger.js';

const logger = createLogger('rate-limiter');

/**
 * 메모리 기반 Rate Limiter 클래스
 * Vercel Functions의 특성상 메모리 기반으로 구현
 */
class MemoryRateLimiter {
  constructor() {
    this.requests = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  /**
   * Rate limit 확인
   * @param {string} key - IP 주소 또는 사용자 식별자
   * @param {Object} options - Rate limit 옵션
   * @returns {Promise<Object>} - 허용 여부와 메타데이터
   */
  async check(key, options = {}) {
    const {
      requests = 60,     // 허용 요청 수
      window = 60000,    // 시간 윈도우 (ms)
      skipSuccessfulRequests = false,
      skipFailedRequests = false
    } = options;

    const now = Date.now();
    const hashedKey = this.hashKey(key);
    
    // 기존 요청 데이터 가져오기
    let requestData = this.requests.get(hashedKey);
    
    if (!requestData) {
      // 첫 번째 요청
      requestData = {
        count: 1,
        resetTime: now + window,
        firstRequest: now
      };
      this.requests.set(hashedKey, requestData);
      
      logger.debug('Rate limit - first request', {
        key: this.maskKey(key),
        window,
        maxRequests: requests
      });
      
      return {
        allowed: true,
        remaining: requests - 1,
        resetTime: requestData.resetTime,
        totalHits: 1
      };
    }

    // 윈도우 리셋 확인
    if (now >= requestData.resetTime) {
      requestData.count = 1;
      requestData.resetTime = now + window;
      requestData.firstRequest = now;
      
      logger.debug('Rate limit - window reset', {
        key: this.maskKey(key),
        newResetTime: requestData.resetTime
      });
      
      return {
        allowed: true,
        remaining: requests - 1,
        resetTime: requestData.resetTime,
        totalHits: 1
      };
    }

    // 요청 수 증가
    requestData.count++;
    
    const allowed = requestData.count <= requests;
    const remaining = Math.max(0, requests - requestData.count);
    const retryAfter = allowed ? null : Math.ceil((requestData.resetTime - now) / 1000);

    if (!allowed) {
      logger.warn('Rate limit exceeded', {
        key: this.maskKey(key),
        count: requestData.count,
        limit: requests,
        retryAfter,
        windowStart: requestData.firstRequest
      });
    }

    return {
      allowed,
      remaining,
      resetTime: requestData.resetTime,
      totalHits: requestData.count,
      retryAfter
    };
  }

  /**
   * Rate limit 정보 조회 (요청 수 증가 없이)
   */
  async get(key) {
    const hashedKey = this.hashKey(key);
    const requestData = this.requests.get(hashedKey);
    
    if (!requestData) {
      return null;
    }

    const now = Date.now();
    if (now >= requestData.resetTime) {
      return null;
    }

    return {
      totalHits: requestData.count,
      resetTime: requestData.resetTime,
      remaining: Math.max(0, 60 - requestData.count) // 기본값 60
    };
  }

  /**
   * 특정 키의 Rate limit 리셋
   */
  async reset(key) {
    const hashedKey = this.hashKey(key);
    const deleted = this.requests.delete(hashedKey);
    
    if (deleted) {
      logger.info('Rate limit reset', {
        key: this.maskKey(key)
      });
    }
    
    return deleted;
  }

  /**
   * 키 해싱 (개인정보 보호)
   */
  hashKey(key) {
    // 간단한 해싱 (프로덕션에서는 더 강력한 해싱 사용 권장)
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit 정수로 변환
    }
    return hash.toString();
  }

  /**
   * 키 마스킹 (로깅용)
   */
  maskKey(key) {
    if (key.length <= 4) return '*'.repeat(key.length);
    return key.substring(0, 2) + '*'.repeat(key.length - 4) + key.substring(key.length - 2);
  }

  /**
   * 만료된 엔트리 정리
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, data] of this.requests.entries()) {
      if (now >= data.resetTime) {
        this.requests.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('Rate limiter cleanup', {
        cleaned,
        remaining: this.requests.size
      });
    }
  }

  /**
   * 주기적 정리 시작
   */
  startCleanup() {
    // 5분마다 정리
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
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

  /**
   * 통계 정보 반환
   */
  getStats() {
    return {
      totalKeys: this.requests.size,
      memoryUsage: this.requests.size * 100 // 대략적인 메모리 사용량 (바이트)
    };
  }
}

/**
 * 다중 정책 Rate Limiter
 */
class MultiPolicyRateLimiter {
  constructor() {
    this.limiter = new MemoryRateLimiter();
    this.policies = new Map();
  }

  /**
   * 정책 등록
   */
  addPolicy(name, config) {
    this.policies.set(name, {
      requests: config.requests || 60,
      window: config.window || 60000,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false
    });
  }

  /**
   * 정책 기반 Rate limit 확인
   */
  async checkWithPolicy(key, policyName) {
    const policy = this.policies.get(policyName);
    if (!policy) {
      throw new Error(`Policy not found: ${policyName}`);
    }

    const keyWithPolicy = `${policyName}:${key}`;
    return await this.limiter.check(keyWithPolicy, policy);
  }

  /**
   * 기본 확인 (정책 없음)
   */
  async check(key, options) {
    return await this.limiter.check(key, options);
  }
}

// 싱글톤 인스턴스
const rateLimiter = new MultiPolicyRateLimiter();

// 기본 정책들 설정
rateLimiter.addPolicy('api', {
  requests: 60,
  window: 60000 // 1분
});

rateLimiter.addPolicy('fortune', {
  requests: 30,
  window: 60000 // 1분
});

rateLimiter.addPolicy('psychology', {
  requests: 20,
  window: 60000 // 1분
});

rateLimiter.addPolicy('tools', {
  requests: 100,
  window: 60000 // 1분
});

rateLimiter.addPolicy('strict', {
  requests: 10,
  window: 60000 // 1분
});

/**
 * IP 기반 Rate Limiting 헬퍼
 */
export async function checkIpRateLimit(ip, policy = 'api') {
  try {
    return await rateLimiter.checkWithPolicy(ip, policy);
  } catch (error) {
    logger.error('Rate limit check failed', {
      ip: rateLimiter.limiter.maskKey(ip),
      policy,
      error: error.message
    });
    
    // 에러 시 허용 (fail-open)
    return {
      allowed: true,
      remaining: 1,
      resetTime: Date.now() + 60000,
      totalHits: 0
    };
  }
}

/**
 * 사용자 기반 Rate Limiting 헬퍼
 */
export async function checkUserRateLimit(userId, policy = 'api') {
  const key = `user:${userId}`;
  return await rateLimiter.checkWithPolicy(key, policy);
}

/**
 * API 엔드포인트 기반 Rate Limiting
 */
export async function checkEndpointRateLimit(ip, endpoint, customLimit = null) {
  const key = `${ip}:${endpoint}`;
  
  if (customLimit) {
    return await rateLimiter.check(key, customLimit);
  } else {
    // 엔드포인트별 기본 정책
    const endpointPolicies = {
      '/api/v2/fortune': 'fortune',
      '/api/v2/psychology': 'psychology',
      '/api/v2/tools': 'tools'
    };
    
    const policy = endpointPolicies[endpoint] || 'api';
    return await rateLimiter.checkWithPolicy(key, policy);
  }
}

/**
 * Rate limit 미들웨어
 */
export function rateLimitMiddleware(options = {}) {
  return async (req, res, next) => {
    const {
      keyGenerator = (req) => req.ip,
      policy = 'api',
      onLimitReached = null,
      skip = () => false
    } = options;

    // 스킵 조건 확인
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const result = await rateLimiter.checkWithPolicy(key, policy);

    // 헤더 설정
    res.setHeader('X-RateLimit-Limit', result.totalHits || 60);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      if (result.retryAfter) {
        res.setHeader('Retry-After', result.retryAfter);
      }

      if (onLimitReached) {
        return onLimitReached(req, res, result);
      }

      return res.status(429).json({
        success: false,
        error: {
          code: 429,
          message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: result.retryAfter
        }
      });
    }

    next();
  };
}

export { rateLimiter };
export default rateLimiter;