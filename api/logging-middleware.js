/**
 * 서버 로깅 미들웨어
 * - 요청/응답 로깅
 * - 에러 로깅
 * - 성능 메트릭
 * - 보안 로깅
 */

import { performance } from 'perf_hooks';

// 로그 레벨 정의
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4,
};

const LOG_LEVEL_NAMES = Object.fromEntries(
  Object.entries(LOG_LEVELS).map(([key, value]) => [value, key])
);

// 환경별 설정
const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';

  const configs = {
    development: {
      minLevel: LOG_LEVELS.DEBUG,
      enableConsole: true,
      enableRequestLogging: true,
      enablePerformanceLogging: true,
      enableErrorDetails: true,
    },
    production: {
      minLevel: LOG_LEVELS.INFO,
      enableConsole: false,
      enableRequestLogging: true,
      enablePerformanceLogging: true,
      enableErrorDetails: false,
    },
    test: {
      minLevel: LOG_LEVELS.WARN,
      enableConsole: false,
      enableRequestLogging: false,
      enablePerformanceLogging: false,
      enableErrorDetails: false,
    },
  };

  return configs[env] || configs.production;
};

class ServerLogger {
  constructor(options = {}) {
    this.config = { ...getConfig(), ...options };
    this.requestCounter = 0;
    this.errorCounter = 0;
    this.startTime = Date.now();
  }

  /**
   * 로그 엔트리 생성
   */
  createLogEntry(level, message, data = {}, context = {}) {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;

    return {
      timestamp,
      level: LOG_LEVEL_NAMES[level],
      message,
      data,
      context: {
        environment: process.env.NODE_ENV || 'development',
        service: 'doha-api',
        version: process.env.npm_package_version || '1.0.0',
        uptime,
        ...context,
      },
      metadata: {
        memory: process.memoryUsage(),
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version,
      },
    };
  }

  /**
   * 로그 출력
   */
  log(level, message, data = {}, context = {}) {
    if (level < this.config.minLevel) return;

    const logEntry = this.createLogEntry(level, message, data, context);

    if (this.config.enableConsole) {
      this.outputToConsole(logEntry);
    }

    // 여기서 추가적인 로그 전송 로직을 구현할 수 있습니다
    // (예: 외부 로깅 서비스, 파일 시스템 등)

    return logEntry;
  }

  /**
   * 콘솔 출력
   */
  outputToConsole(logEntry) {
    const { level, message, data, context, timestamp } = logEntry;
    const time = new Date(timestamp).toISOString();

    const logString = JSON.stringify({
      time,
      level,
      message,
      ...data,
      context,
    });

    switch (level) {
      case 'DEBUG':
        console.debug(logString);
        break;
      case 'INFO':
        console.info(logString);
        break;
      case 'WARN':
        console.warn(logString);
        break;
      case 'ERROR':
      case 'CRITICAL':
        console.error(logString);
        break;
      default:
        console.log(logString);
    }
  }

  /**
   * 레벨별 로깅 메소드
   */
  debug(message, data = {}, context = {}) {
    return this.log(LOG_LEVELS.DEBUG, message, data, context);
  }

  info(message, data = {}, context = {}) {
    return this.log(LOG_LEVELS.INFO, message, data, context);
  }

  warn(message, data = {}, context = {}) {
    return this.log(LOG_LEVELS.WARN, message, data, context);
  }

  error(message, data = {}, context = {}) {
    return this.log(LOG_LEVELS.ERROR, message, data, context);
  }

  critical(message, data = {}, context = {}) {
    return this.log(LOG_LEVELS.CRITICAL, message, data, context);
  }

  /**
   * 요청 로깅 미들웨어
   */
  requestLogger() {
    return (req, res, next) => {
      if (!this.config.enableRequestLogging) {
        if (next) next();
        return;
      }

      const startTime = performance.now();
      const requestId = this.generateRequestId();
      const requestData = this.extractRequestData(req);

      // 요청 카운터 증가
      this.requestCounter++;

      // 요청 로그
      this.info(
        'HTTP Request',
        {
          requestId,
          method: req.method,
          url: req.url,
          userAgent: req.headers['user-agent'],
          ip: this.getClientIP(req),
          contentLength: req.headers['content-length'],
          requestNumber: this.requestCounter,
          type: 'request',
        },
        {
          requestId,
          headers: this.sanitizeHeaders(req.headers),
        }
      );

      // 응답 가로채기
      const originalSend = res.send;
      const originalJson = res.json;
      const originalEnd = res.end;

      let responseBody = null;
      let responseSent = false;

      const logResponse = (body = null) => {
        if (responseSent) return;
        responseSent = true;

        const endTime = performance.now();
        const duration = Math.round((endTime - startTime) * 100) / 100;

        const responseData = {
          requestId,
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          contentLength: res.get('content-length'),
          type: 'response',
        };

        const logLevel =
          res.statusCode >= 500
            ? LOG_LEVELS.ERROR
            : res.statusCode >= 400
              ? LOG_LEVELS.WARN
              : LOG_LEVELS.INFO;

        this.log(logLevel, 'HTTP Response', responseData, {
          requestId,
          responseHeaders: this.sanitizeHeaders(res.getHeaders()),
        });

        // 성능 로깅
        if (this.config.enablePerformanceLogging) {
          this.logPerformanceMetrics(req, res, duration, requestId);
        }
      };

      res.send = function (body) {
        responseBody = body;
        logResponse(body);
        return originalSend.call(this, body);
      };

      res.json = function (body) {
        responseBody = body;
        logResponse(body);
        return originalJson.call(this, body);
      };

      res.end = function (chunk, encoding) {
        if (chunk) responseBody = chunk;
        logResponse(chunk);
        return originalEnd.call(this, chunk, encoding);
      };

      if (next) next();
    };
  }

  /**
   * 에러 로깅 미들웨어
   */
  errorLogger() {
    return (error, req, res, next) => {
      this.errorCounter++;

      const requestId = req.requestId || this.generateRequestId();
      const errorData = {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: error.statusCode || 500,
        errorMessage: error.message,
        errorCode: error.code,
        errorNumber: this.errorCounter,
        type: 'error',
      };

      const context = {
        requestId,
        userAgent: req.headers['user-agent'],
        ip: this.getClientIP(req),
        headers: this.sanitizeHeaders(req.headers),
      };

      if (this.config.enableErrorDetails) {
        errorData.stack = error.stack;
        errorData.errorDetails = {
          name: error.name,
          constructor: error.constructor.name,
        };
      }

      this.error('HTTP Error', errorData, context);

      if (next) next(error);
    };
  }

  /**
   * 요청 ID 생성
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 클라이언트 IP 추출
   */
  getClientIP(req) {
    return (
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
      'unknown'
    );
  }

  /**
   * 요청 데이터 추출
   */
  extractRequestData(req) {
    return {
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer'] || req.headers['referrer'],
      acceptLanguage: req.headers['accept-language'],
      acceptEncoding: req.headers['accept-encoding'],
    };
  }

  /**
   * 헤더 정리 (민감한 정보 제거)
   */
  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token', 'set-cookie'];

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * 성능 메트릭 로깅
   */
  logPerformanceMetrics(req, res, duration, requestId) {
    const memoryUsage = process.memoryUsage();

    this.info('Performance Metrics', {
      requestId,
      duration,
      memory: {
        heapUsed: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotal: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        external: Math.round((memoryUsage.external / 1024 / 1024) * 100) / 100,
      },
      uptime: process.uptime(),
      type: 'performance',
    });

    // 느린 요청 경고
    if (duration > 1000) {
      this.warn('Slow Request', {
        requestId,
        duration,
        method: req.method,
        url: req.url,
        type: 'slow_request',
      });
    }
  }

  /**
   * 보안 이벤트 로깅
   */
  logSecurityEvent(eventType, req, data = {}) {
    const requestId = req.requestId || this.generateRequestId();

    this.warn('Security Event', {
      requestId,
      eventType,
      method: req.method,
      url: req.url,
      ip: this.getClientIP(req),
      userAgent: req.headers['user-agent'],
      type: 'security',
      ...data,
    });
  }

  /**
   * 통계 정보 가져오기
   */
  getStats() {
    return {
      uptime: Date.now() - this.startTime,
      requestCount: this.requestCounter,
      errorCount: this.errorCounter,
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}

// 전역 로거 인스턴스
let globalServerLogger = null;

/**
 * 서버 로거 인스턴스 가져오기
 */
function getServerLogger(options = {}) {
  if (!globalServerLogger) {
    globalServerLogger = new ServerLogger(options);
  }
  return globalServerLogger;
}

/**
 * Vercel Function용 로깅 래퍼
 */
function withLogging(handler, options = {}) {
  const logger = getServerLogger(options);

  return async (req, res) => {
    const requestLogger = logger.requestLogger();
    const errorLogger = logger.errorLogger();

    try {
      // 요청 로깅 실행
      requestLogger(req, res, () => {});

      // 원본 핸들러 실행
      await handler(req, res);
    } catch (error) {
      // 에러 로깅 실행
      errorLogger(error, req, res, () => {});

      // 에러 응답
      if (!res.headersSent) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
          error: true,
          message: error.message || 'Internal Server Error',
          ...(logger.config.enableErrorDetails && { details: error.stack }),
        });
      }
    }
  };
}

/**
 * 편의 함수들
 */
const serverLogger = {
  debug: (message, data, context) => getServerLogger().debug(message, data, context),
  info: (message, data, context) => getServerLogger().info(message, data, context),
  warn: (message, data, context) => getServerLogger().warn(message, data, context),
  error: (message, data, context) => getServerLogger().error(message, data, context),
  critical: (message, data, context) => getServerLogger().critical(message, data, context),

  logSecurityEvent: (eventType, req, data) =>
    getServerLogger().logSecurityEvent(eventType, req, data),
  getStats: () => getServerLogger().getStats(),
  getInstance: getServerLogger,
};

export { ServerLogger, serverLogger, withLogging, getServerLogger };
