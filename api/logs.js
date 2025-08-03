/**
 * 클라이언트 로그 수집 API 엔드포인트
 * - 클라이언트에서 전송된 로그 수신
 * - 로그 검증 및 필터링
 * - 로그 저장/전달
 * - 로그 분석 및 통계
 */

import { serverLogger, withLogging } from './logging-middleware.js';
import { validateRequest, sanitizeInput } from './validation.js';

// 로그 레벨 검증
const VALID_LOG_LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];

// 최대 로그 배치 크기
const MAX_BATCH_SIZE = 100;

// 허용된 로그 타입
const VALID_LOG_TYPES = [
  'user_action',
  'performance_metrics',
  'web_vital',
  'performance_timer',
  'api_call',
  'javascript_error',
  'promise_rejection',
  'navigation',
  'security_event',
];

class LogProcessor {
  constructor() {
    this.processedLogs = 0;
    this.errorLogs = 0;
    this.startTime = Date.now();
  }

  /**
   * 로그 배치 검증
   */
  validateLogBatch(logs) {
    if (!Array.isArray(logs)) {
      throw new Error('Logs must be an array');
    }

    if (logs.length === 0) {
      throw new Error('Logs array cannot be empty');
    }

    if (logs.length > MAX_BATCH_SIZE) {
      throw new Error(`Batch size cannot exceed ${MAX_BATCH_SIZE} logs`);
    }

    return true;
  }

  /**
   * 개별 로그 엔트리 검증
   */
  validateLogEntry(log) {
    const requiredFields = ['timestamp', 'level', 'message'];

    for (const field of requiredFields) {
      if (!log[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!VALID_LOG_LEVELS.includes(log.level)) {
      throw new Error(`Invalid log level: ${log.level}`);
    }

    // 타임스탬프 검증
    const timestamp = new Date(log.timestamp);
    if (isNaN(timestamp.getTime())) {
      throw new Error('Invalid timestamp format');
    }

    // 로그가 너무 오래된 경우 (24시간 이상)
    const hoursDiff = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      throw new Error('Log entry is too old');
    }

    return true;
  }

  /**
   * 로그 엔트리 정리
   */
  sanitizeLogEntry(log) {
    const sanitized = {
      timestamp: log.timestamp,
      level: log.level,
      message: sanitizeInput(log.message),
      data: this.sanitizeLogData(log.data || {}),
      context: this.sanitizeLogContext(log.context || {}),
      metadata: this.sanitizeLogMetadata(log.metadata || {}),
    };

    return sanitized;
  }

  /**
   * 로그 데이터 정리
   */
  sanitizeLogData(data) {
    const sanitized = {};

    // 허용된 데이터 필드만 포함
    const allowedFields = [
      'type',
      'duration',
      'status',
      'endpoint',
      'method',
      'value',
      'element',
      'page_load_time',
      'dom_content_loaded',
      'first_contentful_paint',
      'largest_contentful_paint',
      'dns_lookup',
      'tcp_connection',
      'request_response',
      'message',
      'filename',
      'lineno',
      'colno',
      'stack',
      'reason',
      'promise',
      'label',
      'action',
    ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        sanitized[field] = this.sanitizeValue(data[field]);
      }
    });

    return sanitized;
  }

  /**
   * 로그 컨텍스트 정리
   */
  sanitizeLogContext(context) {
    const sanitized = {};

    // URL 정리 (쿼리 파라미터에서 민감한 정보 제거)
    if (context.url) {
      sanitized.url = this.sanitizeUrl(context.url);
    }

    // 사용자 에이전트 정리
    if (context.userAgent) {
      sanitized.userAgent = sanitizeInput(context.userAgent);
    }

    // 세션 ID (검증)
    if (context.sessionId && typeof context.sessionId === 'string') {
      sanitized.sessionId = context.sessionId.substring(0, 50);
    }

    // 사용자 ID (검증)
    if (context.userId && typeof context.userId === 'string') {
      sanitized.userId = context.userId.substring(0, 50);
    }

    // 환경 정보
    if (context.environment) {
      sanitized.environment = context.environment;
    }

    return sanitized;
  }

  /**
   * 로그 메타데이터 정리
   */
  sanitizeLogMetadata(metadata) {
    const sanitized = {};

    // 뷰포트 정보
    if (metadata.viewport) {
      sanitized.viewport = {
        width: this.sanitizeNumber(metadata.viewport.width, 0, 10000),
        height: this.sanitizeNumber(metadata.viewport.height, 0, 10000),
      };
    }

    // 스크린 정보
    if (metadata.screen) {
      sanitized.screen = {
        width: this.sanitizeNumber(metadata.screen.width, 0, 10000),
        height: this.sanitizeNumber(metadata.screen.height, 0, 10000),
      };
    }

    // 연결 정보
    if (metadata.connection) {
      sanitized.connection = {
        effectiveType: metadata.connection.effectiveType,
        downlink: this.sanitizeNumber(metadata.connection.downlink, 0, 1000),
        rtt: this.sanitizeNumber(metadata.connection.rtt, 0, 10000),
      };
    }

    return sanitized;
  }

  /**
   * URL 정리 (민감한 쿼리 파라미터 제거)
   */
  sanitizeUrl(url) {
    try {
      const urlObj = new URL(url);

      // 민감한 쿼리 파라미터 제거
      const sensitiveParams = ['token', 'key', 'password', 'secret', 'auth'];
      sensitiveParams.forEach((param) => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '[REDACTED]');
        }
      });

      return urlObj.toString();
    } catch (error) {
      return sanitizeInput(url);
    }
  }

  /**
   * 값 정리
   */
  sanitizeValue(value) {
    if (typeof value === 'string') {
      return sanitizeInput(value);
    }
    if (typeof value === 'number') {
      return isFinite(value) ? value : 0;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (value === null || value === undefined) {
      return value;
    }

    // 객체나 배열은 JSON으로 변환 후 정리
    try {
      return JSON.parse(sanitizeInput(JSON.stringify(value)));
    } catch (error) {
      return '[INVALID_DATA]';
    }
  }

  /**
   * 숫자 정리 (범위 검증)
   */
  sanitizeNumber(value, min = -Infinity, max = Infinity) {
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return 0;
    return Math.max(min, Math.min(max, num));
  }

  /**
   * 로그 배치 처리
   */
  async processLogBatch(logs, session, clientInfo) {
    const processedLogs = [];
    const errors = [];

    for (let i = 0; i < logs.length; i++) {
      try {
        this.validateLogEntry(logs[i]);
        const sanitizedLog = this.sanitizeLogEntry(logs[i]);

        // 클라이언트 정보 추가
        sanitizedLog.client = {
          ip: clientInfo.ip,
          userAgent: clientInfo.userAgent,
          referer: clientInfo.referer,
        };

        // 세션 정보 추가
        sanitizedLog.session = session;

        processedLogs.push(sanitizedLog);
        this.processedLogs++;

        // 에러 로그 카운팅
        if (['ERROR', 'CRITICAL'].includes(sanitizedLog.level)) {
          this.errorLogs++;
        }
      } catch (error) {
        errors.push({
          index: i,
          error: error.message,
          log: logs[i],
        });
      }
    }

    return { processedLogs, errors };
  }

  /**
   * 로그 저장/전달
   */
  async storeLogs(logs) {
    // 여기서 실제 로그 저장 로직을 구현할 수 있습니다
    // 예: 데이터베이스 저장, 외부 로깅 서비스 전송 등

    for (const log of logs) {
      // 로그 레벨에 따른 서버 로깅
      switch (log.level) {
        case 'DEBUG':
          serverLogger.debug(`Client Log: ${log.message}`, log.data, log.context);
          break;
        case 'INFO':
          serverLogger.info(`Client Log: ${log.message}`, log.data, log.context);
          break;
        case 'WARN':
          serverLogger.warn(`Client Log: ${log.message}`, log.data, log.context);
          break;
        case 'ERROR':
        case 'CRITICAL':
          serverLogger.error(`Client Log: ${log.message}`, log.data, log.context);
          break;
      }
    }

    // 에러 로그의 경우 추가 처리
    const errorLogs = logs.filter((log) => ['ERROR', 'CRITICAL'].includes(log.level));
    if (errorLogs.length > 0) {
      await this.processErrorLogs(errorLogs);
    }

    return true;
  }

  /**
   * 에러 로그 특별 처리
   */
  async processErrorLogs(errorLogs) {
    for (const log of errorLogs) {
      // JavaScript 에러 분석
      if (log.data.type === 'javascript_error') {
        serverLogger.critical('JavaScript Error Detected', {
          message: log.data.message,
          filename: log.data.filename,
          line: log.data.lineno,
          column: log.data.colno,
          stack: log.data.stack,
          url: log.context.url,
          userAgent: log.context.userAgent,
          sessionId: log.context.sessionId,
        });
      }

      // Promise Rejection 분석
      if (log.data.type === 'promise_rejection') {
        serverLogger.critical('Unhandled Promise Rejection', {
          reason: log.data.reason,
          url: log.context.url,
          sessionId: log.context.sessionId,
        });
      }
    }
  }

  /**
   * 통계 정보
   */
  getStats() {
    return {
      processedLogs: this.processedLogs,
      errorLogs: this.errorLogs,
      uptime: Date.now() - this.startTime,
      errorRate: this.processedLogs > 0 ? this.errorLogs / this.processedLogs : 0,
    };
  }
}

// 로그 프로세서 인스턴스
const logProcessor = new LogProcessor();

/**
 * 클라이언트 로그 수집 핸들러
 */
async function handleClientLogs(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: true,
      message: 'Method not allowed',
    });
  }

  try {
    // 요청 검증
    const validation = validateRequest(req, {
      requiredFields: ['logs'],
      maxBodySize: 1024 * 1024, // 1MB
      allowedContentTypes: ['application/json'],
    });

    if (!validation.isValid) {
      return res.status(400).json({
        error: true,
        message: validation.message,
      });
    }

    const { logs, session } = req.body;

    // 로그 배치 검증
    logProcessor.validateLogBatch(logs);

    // 세션 정보 검증
    if (!session || !session.sessionId) {
      return res.status(400).json({
        error: true,
        message: 'Session information is required',
      });
    }

    // 클라이언트 정보 추출
    const clientInfo = {
      ip:
        req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      referer: req.headers['referer'] || req.headers['referrer'] || null,
    };

    // 로그 처리
    const { processedLogs, errors } = await logProcessor.processLogBatch(logs, session, clientInfo);

    // 로그 저장
    if (processedLogs.length > 0) {
      await logProcessor.storeLogs(processedLogs);
    }

    // 응답
    const response = {
      success: true,
      processed: processedLogs.length,
      errors: errors.length,
      message: `Successfully processed ${processedLogs.length} logs`,
    };

    // 에러가 있는 경우 에러 정보 포함
    if (errors.length > 0) {
      response.errorDetails = errors;
      serverLogger.warn('Log processing errors', {
        errorCount: errors.length,
        totalLogs: logs.length,
        sessionId: session.sessionId,
      });
    }

    res.status(200).json(response);
  } catch (error) {
    serverLogger.error('Log collection error', {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });

    res.status(500).json({
      error: true,
      message: 'Failed to process logs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * 로그 통계 핸들러
 */
async function handleLogStats(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: true,
      message: 'Method not allowed',
    });
  }

  try {
    const stats = {
      logProcessor: logProcessor.getStats(),
      server: serverLogger.getStats(),
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    serverLogger.error('Stats retrieval error', {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      error: true,
      message: 'Failed to retrieve stats',
    });
  }
}

/**
 * 메인 핸들러
 */
const handler = async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', 'https://doha.kr');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 라우팅
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  if (pathname === '/api/logs' || pathname === '/api/logs/') {
    return await handleClientLogs(req, res);
  }

  if (pathname === '/api/logs/stats') {
    return await handleLogStats(req, res);
  }

  // 404
  res.status(404).json({
    error: true,
    message: 'Endpoint not found',
  });
};

// 로깅 미들웨어와 함께 내보내기
export default withLogging(handler, {
  enableRequestLogging: true,
  enablePerformanceLogging: true,
  enableErrorDetails: process.env.NODE_ENV === 'development',
});
