/**
 * Logger Initialization Script
 * 로깅 시스템 초기화 및 전역 로거 설정
 */

(function () {
  'use strict';

  // 로거가 이미 초기화되었는지 확인
  if (window.DohaLoggerInitialized) {
    return;
  }

  // Logger 모듈 동적 로드
  const loadLogger = async () => {
    try {
      // ES6 모듈로 logger 로드
      const { logger } = await import('./utils/logger.js');

      // 전역 로거 설정
      window.DohaLogger = logger;

      // 로거 초기화 완료 플래그
      window.DohaLoggerInitialized = true;

      // 초기화 성공 로그
      logger.info('DohaLogger initialized successfully', {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });

      // 페이지 로드 성능 측정
      if (window.performance && window.performance.timing) {
        const perfData = {
          navigationStart: window.performance.timing.navigationStart,
          loadEventEnd: window.performance.timing.loadEventEnd,
          domContentLoaded: window.performance.timing.domContentLoadedEventEnd,
          pageLoadTime:
            window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
        };

        logger.info('Page Load Performance', perfData);
      }

      // 사용자 행동 추적 이벤트 설정
      setupUserActionTracking(logger);

      // 초기화 완료 이벤트 발생
      const event = new CustomEvent('DohaLoggerReady', {
        detail: { logger },
      });
      document.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to load DohaLogger:', error);

      // 로거 로드 실패 시 최소한의 폴백 로거 제공
      window.DohaLogger = createFallbackLogger();
      window.DohaLoggerInitialized = true;
    }
  };

  // 폴백 로거 생성 (로거 로드 실패 시)
  const createFallbackLogger = () => {
    return {
      debug: (msg, data) => console.debug(`[DEBUG] ${msg}`, data), // eslint-disable-line no-console
      info: (msg, data) => console.info(`[INFO] ${msg}`, data), // eslint-disable-line no-console
      warn: (msg, data) => console.warn(`[WARN] ${msg}`, data), // eslint-disable-line no-console
      error: (msg, data) => console.error(`[ERROR] ${msg}`, data), // eslint-disable-line no-console
      critical: (msg, data) => console.error(`[CRITICAL] ${msg}`, data), // eslint-disable-line no-console
      logUserAction: (action, data) => console.info(`[USER_ACTION] ${action}`, data), // eslint-disable-line no-console
      logApiCall: (endpoint, method, status, duration, data) =>
        console.info(`[API_CALL] ${method} ${endpoint}`, { status, duration, ...data }), // eslint-disable-line no-console
      startTimer: (label) => {
        const start = performance.now();
        return {
          end: () => {
            const duration = performance.now() - start;
            console.info(`[TIMER] ${label}: ${Math.round(duration)}ms`); // eslint-disable-line no-console
            return duration;
          },
        };
      },
    };
  };

  // 사용자 행동 추적 설정
  const setupUserActionTracking = (logger) => {
    // 클릭 이벤트 추적
    document.addEventListener('click', (event) => {
      const { target } = event;

      // 중요한 요소들의 클릭 추적
      if (target.matches('button, .btn, [role="dh-c-button"], a[href]')) {
        const actionData = {
          element: target.tagName.toLowerCase(),
          text: target.textContent?.trim().substring(0, 50) || '',
          href: target.href || null,
          className: target.className || null,
          id: target.id || null,
        };

        logger.logUserAction('click', actionData);
      }
    });

    // 폼 제출 추적
    document.addEventListener('submit', (event) => {
      const form = event.target;
      if (form.tagName === 'FORM') {
        logger.logUserAction('form_submit', {
          formId: form.id || null,
          formClass: form.className || null,
          action: form.action || null,
          method: form.method || 'GET',
        });
      }
    });

    // 스크롤 깊이 추적 (throttled)
    let scrollDepthTracked = false;
    let scrollTimer = null;

    window.addEventListener('scroll', () => {
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }

      scrollTimer = setTimeout(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        // 50%, 75%, 90% 스크롤 시점에서 로그
        if (
          !scrollDepthTracked &&
          (scrollPercent >= 50 || scrollPercent >= 75 || scrollPercent >= 90)
        ) {
          logger.logUserAction('scroll_depth', { scrollPercent });

          if (scrollPercent >= 90) {
            scrollDepthTracked = true; // 90% 이후로는 더 이상 추적하지 않음
          }
        }
      }, 250);
    });

    // 페이지 이탈 추적
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - window.DohaPageStartTime;
      logger.logUserAction('page_exit', {
        timeOnPage,
        url: window.location.href,
      });
    });

    // 페이지 시작 시간 기록
    window.DohaPageStartTime = Date.now();
  };

  // DOM이 준비되면 로거 초기화
  if (document.readyState === 'dh-u-loading') {
    document.addEventListener('DOMContentLoaded', loadLogger);
  } else {
    loadLogger();
  }
})();
