/**
 * @fileoverview 구조화된 로깅 시스템 - Vercel Functions 최적화
 * @version 2.0.0
 * @author doha.kr Backend Team
 */

/**
 * 로그 레벨 정의
 */
export const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

/**
 * 로그 레벨 문자열 매핑
 */
const LogLevelNames = {
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.TRACE]: 'TRACE'
};

/**
 * 현재 로그 레벨 설정
 */
const currentLogLevel = process.env.LOG_LEVEL 
  ? parseInt(process.env.LOG_LEVEL) 
  : (process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG);

/**
 * 로그 포맷터
 */
function formatLog(level, namespace, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const levelName = LogLevelNames[level];
  
  const logEntry = {
    timestamp,
    level: levelName,
    namespace,
    message,
    ...meta
  };

  // 민감한 정보 마스킹
  const sanitized = sanitizeLogData(logEntry);
  
  return JSON.stringify(sanitized);
}

/**
 * 민감한 정보 마스킹
 */
function sanitizeLogData(data) {
  const sensitiveKeys = [
    'password', 'token', 'key', 'secret', 'auth',
    'GEMINI_API_KEY', 'API_KEY', 'authorization'
  ];

  function maskSensitiveData(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(maskSensitiveData);
    }

    const masked = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(sensitive => 
        lowerKey.includes(sensitive.toLowerCase())
      );

      if (isSensitive && typeof value === 'string') {
        masked[key] = '*'.repeat(Math.min(value.length, 8));
      } else if (typeof value === 'object') {
        masked[key] = maskSensitiveData(value);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }

  return maskSensitiveData(data);
}

/**
 * Logger 클래스
 */
class Logger {
  constructor(namespace = 'api') {
    this.namespace = namespace;
  }

  /**
   * 로그 출력 (레벨 확인 포함)
   */
  _log(level, message, meta = {}) {
    if (level > currentLogLevel) {
      return;
    }

    const formattedLog = formatLog(level, this.namespace, message, meta);
    
    // Vercel Functions에서는 console.log가 자동으로 수집됨
    if (level <= LogLevel.WARN) {
      console.error(formattedLog);
    } else {
      console.log(formattedLog);
    }
  }

  /**
   * 에러 로그
   */
  error(message, meta = {}) {
    this._log(LogLevel.ERROR, message, {
      ...meta,
      severity: 'error'
    });
  }

  /**
   * 경고 로그
   */
  warn(message, meta = {}) {
    this._log(LogLevel.WARN, message, {
      ...meta,
      severity: 'warning'
    });
  }

  /**
   * 정보 로그
   */
  info(message, meta = {}) {
    this._log(LogLevel.INFO, message, {
      ...meta,
      severity: 'info'
    });
  }

  /**
   * 디버그 로그
   */
  debug(message, meta = {}) {
    this._log(LogLevel.DEBUG, message, {
      ...meta,
      severity: 'debug'
    });
  }

  /**
   * 추적 로그
   */
  trace(message, meta = {}) {
    this._log(LogLevel.TRACE, message, {
      ...meta,
      severity: 'trace'
    });
  }

  /**
   * 성능 측정 시작
   */
  startTimer(label) {
    const startTime = performance.now();
    return {
      end: (meta = {}) => {
        const duration = Math.round(performance.now() - startTime);
        this.info(`Timer: ${label}`, {
          ...meta,
          duration,
          unit: 'ms'
        });
        return duration;
      }
    };
  }

  /**
   * HTTP 요청 로깅
   */
  logRequest(req, meta = {}) {
    this.info('HTTP Request', {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      ...meta
    });
  }

  /**
   * HTTP 응답 로깅
   */
  logResponse(statusCode, meta = {}) {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this._log(level, 'HTTP Response', {
      statusCode,
      ...meta
    });
  }

  /**
   * API 에러 로깅
   */
  logApiError(error, context = {}) {
    this.error('API Error', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    });
  }

  /**
   * 비즈니스 메트릭 로깅
   */
  logMetric(name, value, unit = 'count', meta = {}) {
    this.info('Metric', {
      metric: name,
      value,
      unit,
      ...meta
    });
  }

  /**
   * 사용자 액션 로깅
   */
  logUserAction(action, userId = null, meta = {}) {
    this.info('User Action', {
      action,
      userId,
      ...meta
    });
  }

  /**
   * 보안 이벤트 로깅
   */
  logSecurityEvent(event, severity = 'medium', meta = {}) {
    this.warn('Security Event', {
      event,
      severity,
      ...meta
    });
  }
}

/**
 * 로거 팩토리 함수
 */
export function createLogger(namespace) {
  return new Logger(namespace);
}

/**
 * 글로벌 로거 인스턴스
 */
export const logger = new Logger('global');

/**
 * 구조화된 로깅을 위한 헬퍼 함수들
 */
export const LogHelpers = {
  /**
   * 요청 시작 로그
   */
  logRequestStart: (logger, req, requestId) => {
    logger.info('Request started', {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      contentType: req.headers['content-type']
    });
  },

  /**
   * 요청 완료 로그
   */
  logRequestEnd: (logger, requestId, statusCode, duration, meta = {}) => {
    logger.logResponse(statusCode, {
      requestId,
      duration,
      unit: 'ms',
      ...meta
    });
  },

  /**
   * Gemini API 호출 로그
   */
  logGeminiCall: (logger, requestId, model, promptLength, duration, success) => {
    logger.info('Gemini API call', {
      requestId,
      model,
      promptLength,
      duration,
      unit: 'ms',
      success
    });
  },

  /**
   * 캐시 이벤트 로그
   */
  logCacheEvent: (logger, event, key, hit = null, ttl = null) => {
    logger.debug('Cache event', {
      event, // 'hit', 'miss', 'set', 'delete'
      key: key.substring(0, 50), // 키 길이 제한
      hit,
      ttl
    });
  },

  /**
   * Rate limit 이벤트 로그
   */
  logRateLimit: (logger, ip, allowed, remaining, resetTime) => {
    logger.info('Rate limit check', {
      ip: ip.substring(0, 15), // IP 부분 마스킹
      allowed,
      remaining,
      resetTime
    });
  },

  /**
   * 검증 실패 로그
   */
  logValidationError: (logger, requestId, errors) => {
    logger.warn('Validation failed', {
      requestId,
      errorCount: errors.length,
      errors: errors.slice(0, 5) // 최대 5개 에러만 로깅
    });
  }
};

export default {
  LogLevel,
  createLogger,
  logger,
  LogHelpers
};