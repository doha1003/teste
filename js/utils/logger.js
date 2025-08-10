/**
 * 종합적인 로깅 시스템
 * - 구조화된 로깅 (JSON 형식)
 * - 환경별 로깅 설정
 * - 원격 로깅 지원
 * - 성능 모니터링
 * - 에러 추적
 */

// 로그 레벨 정의
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4,
};

const LOG_LEVEL_NAMES = {
  0: 'DEBUG',
  1: 'INFO',
  2: 'WARN',
  3: 'ERROR',
  4: 'CRITICAL',
};

// 환경별 설정
const CONFIG = {
  development: {
    minLevel: LOG_LEVELS.DEBUG,
    enableConsole: true,
    enableRemote: false,
    enablePerformance: true,
    enableUserTracking: false,
  },
  production: {
    minLevel: LOG_LEVELS.INFO,
    enableConsole: false,
    enableRemote: true,
    enablePerformance: true,
    enableUserTracking: true,
  },
  test: {
    minLevel: LOG_LEVELS.WARN,
    enableConsole: false,
    enableRemote: false,
    enablePerformance: false,
    enableUserTracking: false,
  },
};

class Logger {
  constructor(options = {}) {
    this.environment = this.detectEnvironment();
    this.config = { ...CONFIG[this.environment], ...options };
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.remoteBuffer = [];
    this.remoteUrl = '/api/logs';
    this.flushInterval = 5000; // 5초마다 원격 로그 전송
    this.maxBufferSize = 100;

    this.initializeRemoteLogging();
    this.setupUnhandledErrorCapture();
    this.setupPerformanceMonitoring();
  }

  /**
   * 환경 감지
   */
  detectEnvironment() {
    if (typeof window === 'undefined') {
      return 'test';
    }

    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }
    return 'production';
  }

  /**
   * 세션 ID 생성
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 사용자 ID 가져오기 (익명화된 ID)
   */
  getUserId() {
    if (!this.config.enableUserTracking) {
      return null;
    }

    let userId = localStorage.getItem('doha_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('doha_user_id', userId);
    }
    return userId;
  }

  /**
   * 원격 로깅 초기화
   */
  initializeRemoteLogging() {
    if (!this.config.enableRemote) {
      return;
    }

    // 주기적으로 원격 로그 전송
    this.flushTimer = setInterval(() => {
      this.flushRemoteLogs();
    }, this.flushInterval);

    // 페이지 언로드 시 남은 로그 전송
    window.addEventListener('beforeunload', () => {
      this.flushRemoteLogs(true);
    });

    // 가시성 변화 시 로그 전송
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'dh-u-hidden') {
        this.flushRemoteLogs();
      }
    });
  }

  /**
   * 전역 에러 캐처 설정
   */
  setupUnhandledErrorCapture() {
    window.addEventListener('error', (event) => {
      this.error('Unhandled Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        type: 'javascript_error',
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise,
        type: 'promise_rejection',
      });
    });
  }

  /**
   * 성능 모니터링 설정
   */
  setupPerformanceMonitoring() {
    if (!this.config.enablePerformance) {
      return;
    }

    // 페이지 로드 성능
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = this.getPerformanceData();
        this.info('Page Performance', perfData);
      }, 1000);
    });

    // Core Web Vitals 모니터링
    this.observeWebVitals();
  }

  /**
   * Web Vitals 관찰
   */
  observeWebVitals() {
    try {
      // LCP (Largest Contentful Paint)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.info('LCP Metric', {
          value: lastEntry.startTime,
          element: lastEntry.element?.tagName,
          type: 'web_vital',
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.info('FID Metric', {
            value: entry.processingStart - entry.startTime,
            type: 'web_vital',
          });
        }
      }).observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.info('CLS Metric', {
          value: clsValue,
          type: 'web_vital',
        });
      }).observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      this.debug('Web Vitals monitoring not supported', { error: error.message });
    }
  }

  /**
   * 성능 데이터 수집
   */
  getPerformanceData() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    const fcp = paint.find((entry) => entry.name === 'first-contentful-paint');
    const lcp = paint.find((entry) => entry.name === 'largest-contentful-paint');

    return {
      page_load_time: navigation.loadEventEnd - navigation.fetchStart,
      dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      first_contentful_paint: fcp?.startTime || null,
      largest_contentful_paint: lcp?.startTime || null,
      dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp_connection: navigation.connectEnd - navigation.connectStart,
      request_response: navigation.responseEnd - navigation.requestStart,
      type: 'performance_metrics',
    };
  }

  /**
   * 로그 엔트리 생성
   */
  createLogEntry(level, message, data = {}, context = {}) {
    const timestamp = new Date().toISOString();
    const url = window.location?.href || 'unknown';
    const userAgent = navigator?.userAgent || 'unknown';

    return {
      timestamp,
      level: LOG_LEVEL_NAMES[level],
      message,
      data,
      context: {
        url,
        userAgent,
        sessionId: this.sessionId,
        userId: this.userId,
        environment: this.environment,
        ...context,
      },
      metadata: {
        viewport: {
          width: window.innerWidth || 0,
          height: window.innerHeight || 0,
        },
        screen: {
          width: screen.width || 0,
          height: screen.height || 0,
        },
        connection: navigator.connection
          ? {
              effectiveType: navigator.connection.effectiveType,
              downlink: navigator.connection.downlink,
              rtt: navigator.connection.rtt,
            }
          : null,
      },
    };
  }

  /**
   * 로그 출력 (레벨별)
   */
  log(level, message, data = {}, context = {}) {
    if (level < this.config.minLevel) {
      return;
    }

    const logEntry = this.createLogEntry(level, message, data, context);

    // 콘솔 출력
    if (this.config.enableConsole) {
      this.outputToConsole(logEntry);
    }

    // 원격 로깅 버퍼에 추가
    if (this.config.enableRemote) {
      this.addToRemoteBuffer(logEntry);
    }

    return logEntry;
  }

  /**
   * 콘솔 출력
   */
  outputToConsole(logEntry) {
    const { level, message, data, context } = logEntry;
    const style = this.getConsoleStyle(level);

    const prefix = `[${level}] ${new Date(logEntry.timestamp).toLocaleTimeString()}`;

    if (Object.keys(data).length > 0) {
      console.groupCollapsed(`%c${prefix} ${message}`, style); // eslint-disable-line no-console
      console.log('Data:', data); // eslint-disable-line no-console
      console.log('Context:', context); // eslint-disable-line no-console
      console.groupEnd(); // eslint-disable-line no-console
    } else {
      const consoleFn = this.getConsoleFn(level);
      consoleFn(`%c${prefix} ${message}`, style);
    }
  }

  /**
   * 콘솔 스타일 가져오기
   */
  getConsoleStyle(level) {
    const styles = {
      DEBUG: 'color: #888; font-size: 11px;',
      INFO: 'color: #2196F3; font-weight: bold;',
      WARN: 'color: #FF9800; font-weight: bold;',
      ERROR: 'color: #F44336; font-weight: bold; background: #ffebee; padding: 2px 4px;',
      CRITICAL: 'color: white; background: #D32F2F; font-weight: bold; padding: 2px 4px;',
    };
    return styles[level] || styles.INFO;
  }

  /**
   * 콘솔 함수 가져오기
   */
  getConsoleFn(level) {
    const consoleFns = {
      DEBUG: console.debug, // eslint-disable-line no-console
      INFO: console.info, // eslint-disable-line no-console
      WARN: console.warn, // eslint-disable-line no-console
      ERROR: console.error, // eslint-disable-line no-console
      CRITICAL: console.error, // eslint-disable-line no-console
    };
    return consoleFns[level] || console.log; // eslint-disable-line no-console
  }

  /**
   * 원격 버퍼에 추가
   */
  addToRemoteBuffer(logEntry) {
    this.remoteBuffer.push(logEntry);

    if (this.remoteBuffer.length >= this.maxBufferSize) {
      this.flushRemoteLogs();
    }
  }

  /**
   * 원격 로그 전송
   */
  async flushRemoteLogs(isBeforeUnload = false) {
    if (this.remoteBuffer.length === 0) {
      return;
    }

    const logs = [...this.remoteBuffer];
    this.remoteBuffer = [];

    try {
      const payload = {
        logs,
        session: {
          sessionId: this.sessionId,
          userId: this.userId,
          environment: this.environment,
        },
      };

      if (isBeforeUnload && navigator.sendBeacon) {
        // 페이지 언로드 시 beacon API 사용
        navigator.sendBeacon(this.remoteUrl, JSON.stringify(payload));
      } else {
        // 일반적인 fetch 요청
        await fetch(this.remoteUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      // 전송 실패 시 버퍼에 다시 추가 (최대 크기 제한)
      if (!isBeforeUnload && this.remoteBuffer.length < this.maxBufferSize) {
        this.remoteBuffer.unshift(...logs.slice(0, this.maxBufferSize - this.remoteBuffer.length));
      }
      console.warn('Failed to send remote logs:', error); // eslint-disable-line no-console
    }
  }

  /**
   * 로그 레벨별 메소드
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
   * 성능 측정 시작
   */
  startTimer(label) {
    const startTime = performance.now();
    return {
      label,
      startTime,
      end: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        this.info(`Timer: ${label}`, {
          duration: Math.round(duration * 100) / 100,
          type: 'performance_timer',
        });
        return duration;
      },
    };
  }

  /**
   * 사용자 행동 로깅
   */
  logUserAction(action, data = {}) {
    if (!this.config.enableUserTracking) {
      return;
    }

    this.info(`User Action: ${action}`, {
      ...data,
      type: 'user_action',
      timestamp: Date.now(),
    });
  }

  /**
   * API 호출 로깅
   */
  logApiCall(endpoint, method, status, duration, data = {}) {
    const level = status >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
    this.log(level, `API Call: ${method} ${endpoint}`, {
      endpoint,
      method,
      status,
      duration,
      type: 'api_call',
      ...data,
    });
  }

  /**
   * 종료 처리
   */
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushRemoteLogs();
  }
}

// 전역 로거 인스턴스 생성
let globalLogger = null;

/**
 * 로거 인스턴스 가져오기
 */
function getLogger(options = {}) {
  if (!globalLogger) {
    globalLogger = new Logger(options);
  }
  return globalLogger;
}

/**
 * 편의 함수들
 */
const logger = {
  debug: (message, data, context) => getLogger().debug(message, data, context),
  info: (message, data, context) => getLogger().info(message, data, context),
  warn: (message, data, context) => getLogger().warn(message, data, context),
  error: (message, data, context) => getLogger().error(message, data, context),
  critical: (message, data, context) => getLogger().critical(message, data, context),

  startTimer: (label) => getLogger().startTimer(label),
  logUserAction: (action, data) => getLogger().logUserAction(action, data),
  logApiCall: (endpoint, method, status, duration, data) =>
    getLogger().logApiCall(endpoint, method, status, duration, data),

  getInstance: getLogger,
};

// ES6 모듈로 내보내기
export { Logger, logger, LOG_LEVELS };

// 전역 객체에도 추가 (이전 버전 호환성)
if (typeof window !== 'undefined') {
  window.DohaLogger = logger;
}
