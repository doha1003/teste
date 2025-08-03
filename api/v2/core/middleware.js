/**
 * @fileoverview 공통 미들웨어 시스템 - Vercel Serverless Functions 최적화
 * @version 2.0.0
 * @author doha.kr Backend Team
 */

import { createLogger } from './logger.js';
import { rateLimiter } from './rate-limiter.js';
import { cache } from './cache.js';
import { validateInput } from './validation.js';

const logger = createLogger('middleware');

/**
 * CORS 헤더 설정 - doha.kr 도메인 최적화
 */
export function setCorsHeaders(req, res) {
  const allowedOrigins = [
    'https://doha.kr',
    'https://www.doha.kr',
    'https://doha-kr.vercel.app',
    ...(process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:3000',
          'http://localhost:8080',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:8080',
        ]
      : []),
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24시간
  res.setHeader('Vary', 'Origin');
}

/**
 * 보안 헤더 설정
 */
export function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // CSP 헤더
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://generativelanguage.googleapis.com https://www.google-analytics.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);
}

/**
 * 요청 검증 미들웨어
 */
export function validateRequest(req, res, allowedMethods = ['POST']) {
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    setSecurityHeaders(res);
    res.status(200).end();
    return true;
  }

  // 허용된 메소드 검증
  if (!allowedMethods.includes(req.method)) {
    logger.warn('Method not allowed', {
      method: req.method,
      allowed: allowedMethods,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
    });

    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      allowed: allowedMethods,
    });
    return true;
  }

  return false;
}

/**
 * 클라이언트 IP 추출
 */
export function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * 요청 ID 생성
 */
export function generateRequestId(prefix = 'req') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 성능 측정 헬퍼
 */
export function createPerformanceTracker() {
  const startTime = performance.now();

  return {
    start: startTime,
    elapsed: () => Math.round(performance.now() - startTime),
    end: () => {
      const duration = performance.now() - startTime;
      return Math.round(duration);
    },
  };
}

/**
 * API 응답 표준화
 */
export function createResponse(success, data = null, error = null, meta = {}) {
  const response = {
    success,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (success) {
    response.data = data;
  } else {
    response.error = error;
  }

  return response;
}

/**
 * 에러 응답 생성
 */
export function createErrorResponse(statusCode, message, details = null) {
  const response = {
    success: false,
    error: {
      code: statusCode,
      message,
      timestamp: new Date().toISOString(),
    },
  };

  if (details && process.env.NODE_ENV !== 'production') {
    response.error.details = details;
  }

  return response;
}

/**
 * 메인 미들웨어 체인
 */
export function withMiddleware(handler, options = {}) {
  const {
    enableRateLimit = true,
    enableCache = false,
    enableValidation = true,
    enableLogging = true,
    allowedMethods = ['POST'],
    rateLimit = { requests: 60, window: 60000 }, // 60 requests per minute
    cacheOptions = { ttl: 300 }, // 5 minutes
  } = options;

  return async (req, res) => {
    const requestId = generateRequestId();
    const tracker = createPerformanceTracker();
    const clientIp = getClientIp(req);

    // CORS 및 보안 헤더 설정
    setCorsHeaders(req, res);
    setSecurityHeaders(res);

    // 요청 검증
    if (validateRequest(req, res, allowedMethods)) {
      return;
    }

    // 로깅 시작
    if (enableLogging) {
      logger.info('Request started', {
        requestId,
        method: req.method,
        url: req.url,
        ip: clientIp,
        userAgent: req.headers['user-agent'],
      });
    }

    try {
      // Rate Limiting
      if (enableRateLimit) {
        const rateLimitResult = await rateLimiter.check(clientIp, rateLimit);
        if (!rateLimitResult.allowed) {
          logger.warn('Rate limit exceeded', {
            requestId,
            ip: clientIp,
            retryAfter: rateLimitResult.retryAfter,
          });

          res
            .status(429)
            .json(
              createErrorResponse(429, 'Too many requests. Please try again later.', {
                retryAfter: rateLimitResult.retryAfter,
              })
            );
          return;
        }
      }

      // 캐시 확인 (GET 요청만)
      let cacheKey = null;
      if (enableCache && req.method === 'GET') {
        cacheKey = `${req.url}_${JSON.stringify(req.query)}`;
        const cachedResponse = await cache.get(cacheKey);

        if (cachedResponse) {
          logger.info('Cache hit', { requestId, cacheKey });
          res.status(200).json(cachedResponse);
          return;
        }
      }

      // 입력 검증
      if (enableValidation && req.method === 'POST') {
        const validationResult = validateInput(req.body);
        if (!validationResult.valid) {
          logger.warn('Validation failed', {
            requestId,
            errors: validationResult.errors,
          });

          res
            .status(400)
            .json(createErrorResponse(400, 'Validation failed', validationResult.errors));
          return;
        }
      }

      // 핸들러 실행
      const result = await handler(req, res, { requestId, clientIp, tracker });

      // 결과 캐싱 (성공 응답만)
      if (enableCache && cacheKey && result && result.success) {
        await cache.set(cacheKey, result, cacheOptions.ttl);
      }

      // 성공 로깅
      if (enableLogging) {
        logger.info('Request completed', {
          requestId,
          duration: tracker.end(),
          success: true,
        });
      }
    } catch (error) {
      const duration = tracker.end();

      logger.error('Request failed', {
        requestId,
        error: error.message,
        stack: error.stack,
        duration,
      });

      // 에러 응답
      const statusCode = error.statusCode || 500;
      const message =
        process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message;

      res.status(statusCode).json(createErrorResponse(statusCode, message, error.details));
    }
  };
}

/**
 * 한국어 에러 메시지 변환
 */
export function getKoreanErrorMessage(errorType) {
  const messages = {
    validation_failed: '입력 데이터가 올바르지 않습니다.',
    rate_limit_exceeded: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
    unauthorized: '인증이 필요합니다.',
    forbidden: '접근 권한이 없습니다.',
    not_found: '요청하신 리소스를 찾을 수 없습니다.',
    method_not_allowed: '허용되지 않은 요청 방법입니다.',
    internal_error: '서버 내부 오류가 발생했습니다.',
    service_unavailable: '서비스를 일시적으로 사용할 수 없습니다.',
    gemini_api_error: 'AI 분석 중 오류가 발생했습니다.',
    manseryeok_error: '만세력 데이터 처리 중 오류가 발생했습니다.',
  };

  return messages[errorType] || messages['internal_error'];
}

export default {
  setCorsHeaders,
  setSecurityHeaders,
  validateRequest,
  getClientIp,
  generateRequestId,
  createPerformanceTracker,
  createResponse,
  createErrorResponse,
  withMiddleware,
  getKoreanErrorMessage,
};
