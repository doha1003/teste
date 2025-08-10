/**
 * 실사용자 모니터링 (RUM) 메트릭 수집기
 * Core Web Vitals 및 사용자 경험 지표를 실시간으로 수집합니다.
 */

class RUMCollector {
  constructor(options = {}) {
    this.config = {
      endpoint: options.endpoint || '/api/rum-metrics',
      sessionId: this.generateSessionId(),
      userId: this.getUserId(),
      sampleRate: options.sampleRate || 1.0, // 100% 샘플링
      batchSize: options.batchSize || 10,
      flushInterval: options.flushInterval || 30000, // 30초
      ...options,
    };

    this.metrics = [];
    this.vitals = {};
    this.interactions = [];
    this.errors = [];
    this.navigationStart = performance.timeOrigin || performance.timing.navigationStart;

    this.init();
  }

  /**
   * 초기화
   */
  init() {
    if (Math.random() > this.config.sampleRate) {
      console.log('RUM: 샘플링에서 제외됨');
      return;
    }

    this.collectPageInfo();
    this.setupWebVitalsTracking();
    this.setupNavigationTracking();
    this.setupResourceTracking();
    this.setupInteractionTracking();
    this.setupErrorTracking();
    this.setupVisibilityTracking();
    this.setupPWATracking();

    // 정기적으로 메트릭 전송
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);

    // 페이지 언로드 시 남은 메트릭 전송
    window.addEventListener('beforeunload', () => {
      this.flush(true);
    });

    // 페이지 숨김 시 메트릭 전송
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'dh-u-hidden') {
        this.flush(true);
      }
    });

    console.log('RUM 컬렉터가 초기화되었습니다.');
  }

  /**
   * 페이지 정보 수집
   */
  collectPageInfo() {
    const pageInfo = {
      type: 'page_info',
      timestamp: Date.now(),
      url: window.location.href,
      pathname: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      connectionType: this.getConnectionType(),
      deviceType: this.getDeviceType(),
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
    };

    this.addMetric(pageInfo);
  }

  /**
   * Web Vitals 추적 설정
   */
  setupWebVitalsTracking() {
    // LCP (Largest Contentful Paint)
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      const lcp = entries[entries.length - 1];
      this.vitals.lcp = lcp.renderTime || lcp.loadTime;
      this.addMetric({
        type: 'web_vital',
        name: 'lcp',
        value: this.vitals.lcp,
        timestamp: Date.now(),
        element: lcp.element?.tagName || null,
      });
    });

    // FID (First Input Delay) - 실제 상호작용에서 측정
    let isFirstInteraction = true;
    ['mousedown', 'keydown', 'touchstart', 'pointerdown'].forEach((type) => {
      document.addEventListener(
        type,
        (event) => {
          if (isFirstInteraction) {
            isFirstInteraction = false;
            const processingStart = performance.now();

            requestIdleCallback(() => {
              const fid = performance.now() - processingStart;
              this.vitals.fid = fid;
              this.addMetric({
                type: 'web_vital',
                name: 'fid',
                value: fid,
                timestamp: Date.now(),
                eventType: event.type,
              });
            });
          }
        },
        { once: true, passive: true }
      );
    });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    this.observePerformanceEntry('layout-shift', (entries) => {
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      this.vitals.cls = clsValue;
      this.addMetric({
        type: 'web_vital',
        name: 'cls',
        value: clsValue,
        timestamp: Date.now(),
      });
    });

    // FCP (First Contentful Paint)
    this.observePerformanceEntry('paint', (entries) => {
      const fcp = entries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcp) {
        this.vitals.fcp = fcp.startTime;
        this.addMetric({
          type: 'web_vital',
          name: 'fcp',
          value: fcp.startTime,
          timestamp: Date.now(),
        });
      }
    });

    // TTFB (Time to First Byte)
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      this.addMetric({
        type: 'web_vital',
        name: 'ttfb',
        value: ttfb,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 내비게이션 추적
   */
  setupNavigationTracking() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      this.addMetric({
        type: 'navigation',
        timestamp: Date.now(),
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.navigationStart,
        redirectCount: navigation.redirectCount,
        transferSize: navigation.transferSize,
        encodedBodySize: navigation.encodedBodySize,
        decodedBodySize: navigation.decodedBodySize,
      });
    }
  }

  /**
   * 리소스 성능 추적
   */
  setupResourceTracking() {
    this.observePerformanceEntry('resource', (entries) => {
      entries.forEach((entry) => {
        // 중요한 리소스만 추적 (크기가 크거나 느린 것들)
        if (entry.transferSize > 10000 || entry.duration > 1000) {
          this.addMetric({
            type: 'resource',
            timestamp: Date.now(),
            name: entry.name.split('/').pop(), // 파일명만
            duration: entry.duration,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
            initiatorType: entry.initiatorType,
            renderBlockingStatus: entry.renderBlockingStatus,
          });
        }
      });
    });
  }

  /**
   * 사용자 상호작용 추적
   */
  setupInteractionTracking() {
    let interactionCount = 0;
    let totalInteractionTime = 0;

    // 클릭 추적
    document.addEventListener('click', (event) => {
      const startTime = performance.now();

      // 다음 프레임에서 처리 시간 측정
      requestAnimationFrame(() => {
        const interactionTime = performance.now() - startTime;
        interactionCount++;
        totalInteractionTime += interactionTime;

        this.addMetric({
          type: 'interaction',
          timestamp: Date.now(),
          eventType: 'click',
          targetElement: event.target.tagName,
          targetId: event.target.id || null,
          targetClass: event.target.className || null,
          processingTime: interactionTime,
          x: event.clientX,
          y: event.clientY,
        });
      });
    });

    // 스크롤 추적 (throttled)
    let lastScrollTime = 0;
    let maxScrollDepth = 0;

    document.addEventListener(
      'scroll',
      () => {
        const now = Date.now();
        if (now - lastScrollTime > 1000) {
          // 1초마다
          lastScrollTime = now;

          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const scrollDepth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);

          if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;

            this.addMetric({
              type: 'scroll',
              timestamp: now,
              scrollDepth,
              scrollTop,
            });
          }
        }
      },
      { passive: true }
    );

    // 정기적으로 상호작용 요약 전송
    setInterval(() => {
      if (interactionCount > 0) {
        this.addMetric({
          type: 'interaction_summary',
          timestamp: Date.now(),
          totalInteractions: interactionCount,
          averageInteractionTime: totalInteractionTime / interactionCount,
          maxScrollDepth,
        });

        interactionCount = 0;
        totalInteractionTime = 0;
      }
    }, 60000); // 1분마다
  }

  /**
   * 오류 추적
   */
  setupErrorTracking() {
    // JavaScript 오류
    window.addEventListener('error', (event) => {
      this.addMetric({
        type: 'javascript_error',
        timestamp: Date.now(),
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack || null,
      });
    });

    // Promise rejection 오류
    window.addEventListener('unhandledrejection', (event) => {
      this.addMetric({
        type: 'promise_rejection',
        timestamp: Date.now(),
        reason: event.reason?.message || event.reason,
        stack: event.reason?.stack || null,
      });
    });

    // 리소스 로딩 오류
    document.addEventListener(
      'error',
      (event) => {
        if (event.target !== window) {
          this.addMetric({
            type: 'resource_error',
            timestamp: Date.now(),
            elementType: event.target.tagName,
            source: event.target.src || event.target.href,
            message: 'Resource dh-u-loading failed',
          });
        }
      },
      true
    );
  }

  /**
   * 페이지 가시성 추적
   */
  setupVisibilityTracking() {
    let visibilityStart = Date.now();
    let totalVisibleTime = 0;

    document.addEventListener('visibilitychange', () => {
      const now = Date.now();

      if (document.visibilityState === 'dh-u-visible') {
        visibilityStart = now;
      } else {
        const visibleDuration = now - visibilityStart;
        totalVisibleTime += visibleDuration;

        this.addMetric({
          type: 'visibility',
          timestamp: now,
          state: 'dh-u-hidden',
          visibleDuration,
          totalVisibleTime,
        });
      }
    });
  }

  /**
   * PWA 관련 추적
   */
  setupPWATracking() {
    // Service Worker 상태
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        this.addMetric({
          type: 'pwa',
          timestamp: Date.now(),
          feature: 'service_worker',
          status: 'ready',
          scope: registration.scope,
        });
      });
    }

    // 설치 프롬프트
    window.addEventListener('beforeinstallprompt', (event) => {
      this.addMetric({
        type: 'pwa',
        timestamp: Date.now(),
        feature: 'install_prompt',
        status: 'shown',
      });
    });

    // 앱 설치 완료
    window.addEventListener('appinstalled', () => {
      this.addMetric({
        type: 'pwa',
        timestamp: Date.now(),
        feature: 'app_install',
        status: 'completed',
      });
    });

    // 스탠드얼론 모드 감지
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.addMetric({
        type: 'pwa',
        timestamp: Date.now(),
        feature: 'display_mode',
        value: 'standalone',
      });
    }
  }

  /**
   * Performance Observer 설정
   */
  observePerformanceEntry(type, callback) {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          callback(list.getEntries());
        });
        observer.observe({ type, buffered: true });
      } catch (e) {
        console.warn(`Performance Observer for ${type} not supported:`, e);
      }
    }
  }

  /**
   * 메트릭 추가
   */
  addMetric(metric) {
    const enrichedMetric = {
      ...metric,
      sessionId: this.config.sessionId,
      userId: this.config.userId,
      timestamp: metric.timestamp || Date.now(),
      page: window.location.pathname,
    };

    this.metrics.push(enrichedMetric);

    // 배치 크기에 도달하면 전송
    if (this.metrics.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * 메트릭 전송
   */
  async flush(immediate = false) {
    if (this.metrics.length === 0) {
      return;
    }

    const payload = {
      metrics: [...this.metrics],
      sessionInfo: {
        sessionId: this.config.sessionId,
        userId: this.config.userId,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
    };

    // 메트릭 초기화
    this.metrics = [];

    try {
      if (immediate && 'sendBeacon' in navigator) {
        // 페이지 언로드 시 beacon 사용
        navigator.sendBeacon(this.config.endpoint, JSON.stringify(payload));
      } else {
        // 일반적인 fetch 요청
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      }

      console.log(`RUM: ${payload.metrics.length}개 메트릭 전송 완료`);
    } catch (error) {
      console.error('RUM 메트릭 전송 실패:', error);
      // 실패한 메트릭을 다시 큐에 추가 (과도한 누적 방지)
      if (this.metrics.length < 100) {
        this.metrics.unshift(...payload.metrics);
      }
    }
  }

  /**
   * 유틸리티 메서드들
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getUserId() {
    let userId = localStorage.getItem('rum_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('rum_user_id', userId);
    }
    return userId;
  }

  getConnectionType() {
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection
      ? {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        }
      : null;
  }

  getDeviceType() {
    const { userAgent } = navigator;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent
      )
    ) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * 수동 메트릭 기록
   */
  recordCustomMetric(name, value, attributes = {}) {
    this.addMetric({
      type: 'custom',
      name,
      value,
      timestamp: Date.now(),
      ...attributes,
    });
  }

  /**
   * 현재 Web Vitals 반환
   */
  getWebVitals() {
    return { ...this.vitals };
  }

  /**
   * RUM 컬렉터 종료
   */
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush(true);
  }
}

// 전역으로 사용할 수 있도록 설정
window.RUMCollector = RUMCollector;

// 자동 초기화 (옵션)
if (document.readyState === 'dh-u-loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.rumCollector = new RUMCollector();
  });
} else {
  window.rumCollector = new RUMCollector();
}

export default RUMCollector;
