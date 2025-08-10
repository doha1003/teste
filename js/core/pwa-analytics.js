/**
 * PWA Analytics & Monitoring System
 * 실시간 성능 모니터링 및 사용자 분석
 */

class PWAAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.startTime = Date.now();

    // 분석 데이터 버퍼
    this.analyticsBuffer = [];
    this.performanceBuffer = [];
    this.errorBuffer = [];

    // 전송 설정
    this.config = {
      batchSize: 10,
      flushInterval: 30000, // 30초
      maxRetries: 3,
      endpoint: '/api/analytics',
    };

    // 메트릭 수집기
    this.collectors = new Map();

    // 이벤트 추적
    this.events = {
      pageViews: 0,
      interactions: 0,
      errors: 0,
      swUpdates: 0,
      offlineEvents: 0,
    };

    this.init();
  }

  init() {
    // 기본 수집기 등록
    this.registerCollectors();

    // 이벤트 리스너 설정
    this.setupEventListeners();

    // 주기적 데이터 전송
    this.startPeriodicFlush();

    // 페이지 언로드 시 데이터 전송
    this.setupUnloadHandler();

    // 초기 페이지뷰 기록
    this.trackPageView();
  }

  // 데이터 수집기 등록
  registerCollectors() {
    // Core Web Vitals 수집기
    this.collectors.set('webVitals', () => {
      if (window.performanceMonitor) {
        return window.performanceMonitor.getMetrics();
      }
      return null;
    });

    // 네트워크 정보 수집기
    this.collectors.set('network', () => {
      if ('connection' in navigator) {
        const conn = navigator.connection;
        return {
          effectiveType: conn.effectiveType,
          downlink: conn.downlink,
          rtt: conn.rtt,
          saveData: conn.saveData,
        };
      }
      return null;
    });

    // 디바이스 정보 수집기
    this.collectors.set('device', () => ({
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pixelDensity: window.devicePixelRatio,
    }));

    // 메모리 정보 수집기
    this.collectors.set('memory', () => {
      if ('memory' in performance) {
        const { memory } = performance;
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
        };
      }
      return null;
    });

    // PWA 상태 수집기
    this.collectors.set('pwa', () => ({
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      installed: window.matchMedia('(display-mode: standalone)').matches,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      serviceWorkerActive: !!navigator.serviceWorker?.controller,
      notificationPermission: 'Notification' in window ? Notification.permission : 'unsupported',
      offlineCapable: 'serviceWorker' in navigator && 'caches' in window,
    }));

    // 한국어 최적화 수집기
    this.collectors.set('korean', () => {
      if (window.koreanOptimizer) {
        return window.koreanOptimizer.getMetrics();
      }
      return null;
    });

    // 오프라인 상태 수집기
    this.collectors.set('offline', () => {
      if (window.offlineManager) {
        return window.offlineManager.getStatus();
      }
      return null;
    });
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    // 페이지 가시성 변경
    document.addEventListener('visibilitychange', () => {
      this.track('visibilityChange', {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
      });
    });

    // 클릭 이벤트 추적
    document.addEventListener('click', (event) => {
      this.trackInteraction('click', event.target);
    });

    // 폼 제출 추적
    document.addEventListener('submit', (event) => {
      this.trackInteraction('formSubmit', event.target);
    });

    // 에러 추적
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
      });
    });

    // Promise rejection 추적
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'unhandledRejection',
        reason: event.reason?.toString(),
      });
    });

    // Service Worker 업데이트 추적
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SW_UPDATED') {
          this.track('serviceWorkerUpdate', {
            version: event.data.version,
          });
          this.events.swUpdates++;
        }
      });
    }

    // 네트워크 상태 변경 추적
    window.addEventListener('online', () => {
      this.track('networkStatusChange', { online: true });
    });

    window.addEventListener('offline', () => {
      this.track('networkStatusChange', { online: false });
      this.events.offlineEvents++;
    });

    // 앱 설치 프롬프트 추적
    window.addEventListener('beforeinstallprompt', () => {
      this.track('installPromptShown');
    });
  }

  // 페이지뷰 추적
  trackPageView(customData = {}) {
    const pageData = {
      url: location.href,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
      ...customData,
    };

    this.track('pageView', pageData);
    this.events.pageViews++;
  }

  // 사용자 상호작용 추적
  trackInteraction(type, element) {
    const data = {
      type,
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      text: element.textContent?.substring(0, 100),
      url: location.href,
      timestamp: Date.now(),
    };

    this.track('interaction', data);
    this.events.interactions++;
  }

  // 에러 추적
  trackError(errorData) {
    const data = {
      ...errorData,
      url: location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.errorBuffer.push(data);
    this.events.errors++;

    // 즉시 전송 (에러는 중요함)
    this.flushErrors();
  }

  // 성능 메트릭 추적
  trackPerformance(metricName, value, metadata = {}) {
    const data = {
      metric: metricName,
      value,
      metadata,
      url: location.href,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.performanceBuffer.push(data);
  }

  // 사용자 정의 이벤트 추적
  track(eventName, data = {}) {
    const eventData = {
      event: eventName,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      url: location.href,
      ...data,
    };

    this.analyticsBuffer.push(eventData);

    // 버퍼가 가득 찬 경우 즉시 전송
    if (this.analyticsBuffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  // A/B 테스트 추적
  trackExperiment(experimentName, variant, data = {}) {
    this.track('experiment', {
      experimentName,
      variant,
      ...data,
    });
  }

  // 전환 추적
  trackConversion(conversionType, value = null, metadata = {}) {
    this.track('conversion', {
      conversionType,
      value,
      metadata,
    });
  }

  // 수집된 데이터 전송
  async flush() {
    if (this.analyticsBuffer.length === 0) {
      return;
    }

    const batch = {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      events: [...this.analyticsBuffer],
      performance: [...this.performanceBuffer],
      context: this.collectContext(),
    };

    // 버퍼 초기화
    this.analyticsBuffer = [];
    this.performanceBuffer = [];

    try {
      await this.sendBatch(batch);
    } catch (error) {
      // 실패한 데이터를 다시 버퍼에 추가 (재시도용)
      this.analyticsBuffer.unshift(...batch.events);
      this.performanceBuffer.unshift(...batch.performance);
    }
  }

  // 에러 데이터만 전송
  async flushErrors() {
    if (this.errorBuffer.length === 0) {
      return;
    }

    const errors = [...this.errorBuffer];
    this.errorBuffer = [];

    try {
      await this.sendBatch({
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now(),
        errors,
        context: this.collectContext(),
      });
    } catch (error) {
      // 실패한 에러를 다시 버퍼에 추가
      this.errorBuffer.unshift(...errors);
    }
  }

  // 컨텍스트 정보 수집
  collectContext() {
    const context = {};

    // 각 수집기에서 데이터 수집
    this.collectors.forEach((collector, name) => {
      try {
        const data = collector();
        if (data !== null) {
          context[name] = data;
        }
      } catch (error) {
        // 컨텍스트 수집 실패 시 무시
        console.warn('Failed to collect context data:', error);
      }
    });

    return context;
  }

  // 배치 데이터 전송
  async sendBatch(batch) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    };

    // 오프라인 상태에서는 Service Worker를 통해 큐에 추가
    if (!navigator.onLine) {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'QUEUE_REQUEST',
          request: {
            url: this.config.endpoint,
            method: 'POST',
            headers: options.headers,
            body: options.body,
          },
        });
      }
      return;
    }

    const response = await fetch(this.config.endpoint, options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // 주기적 데이터 전송
  startPeriodicFlush() {
    setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // 페이지 언로드 시 데이터 전송
  setupUnloadHandler() {
    // beforeunload 이벤트
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
      this.sendBeacon();
    });

    // pagehide 이벤트 (더 안정적)
    window.addEventListener('pagehide', () => {
      this.trackSessionEnd();
      this.sendBeacon();
    });

    // visibilitychange 이벤트 (백그라운드로 이동 시)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.sendBeacon();
      }
    });
  }

  // Beacon API를 사용한 안정적 전송
  sendBeacon() {
    if (this.analyticsBuffer.length === 0 && this.performanceBuffer.length === 0) {
      return;
    }

    const data = {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      events: [...this.analyticsBuffer],
      performance: [...this.performanceBuffer],
      context: this.collectContext(),
    };

    if ('sendBeacon' in navigator) {
      const success = navigator.sendBeacon(this.config.endpoint, JSON.stringify(data));

      if (success) {
        this.analyticsBuffer = [];
        this.performanceBuffer = [];
      }
    } else {
      // Beacon이 지원되지 않는 경우 fetch 시도
      fetch(this.config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(() => {
        // 실패해도 무시 (페이지 언로드 시)
      });
    }
  }

  // 세션 종료 추적
  trackSessionEnd() {
    const sessionDuration = Date.now() - this.startTime;

    this.track('sessionEnd', {
      duration: sessionDuration,
      pageViews: this.events.pageViews,
      interactions: this.events.interactions,
      errors: this.events.errors,
      swUpdates: this.events.swUpdates,
      offlineEvents: this.events.offlineEvents,
    });
  }

  // 사용자 ID 생성/조회
  getUserId() {
    let userId = localStorage.getItem('pwa_user_id');

    if (!userId) {
      userId = this.generateUserId();
      localStorage.setItem('pwa_user_id', userId);
    }

    return userId;
  }

  // 세션 ID 생성
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 사용자 ID 생성
  generateUserId() {
    return `user_${Date.now().toString(36)}_${Math.random().toString(36).substr(2)}`;
  }

  // 실시간 대시보드 (개발 모드)
  showDebugDashboard() {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const dashboard = document.createElement('div');
    dashboard.id = 'analytics-dashboard';
    dashboard.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      min-width: 250px;
      max-height: 400px;
      overflow-y: auto;
    `;

    document.body.appendChild(dashboard);

    // 주기적 업데이트
    setInterval(() => {
      const context = this.collectContext();
      const html = `
        <strong>PWA Analytics Dashboard</strong><br>
        <hr style="margin: 10px 0;">
        세션 ID: ${this.sessionId.substr(-8)}<br>
        페이지뷰: ${this.events.pageViews}<br>
        상호작용: ${this.events.interactions}<br>
        에러: ${this.events.errors}<br>
        버퍼: ${this.analyticsBuffer.length}개<br>
        <hr style="margin: 10px 0;">
        ${Object.entries(context)
          .map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              return `<strong>${key}:</strong><br>${JSON.stringify(value, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')}`;
            }
            return `<strong>${key}:</strong> ${value}`;
          })
          .join('<br>')}
      `;

      dashboard.innerHTML = html;
    }, 2000);
  }

  // 공개 API
  setUserId(userId) {
    this.userId = userId;
    localStorage.setItem('pwa_user_id', userId);
  }

  setUserProperties(properties) {
    this.track('userProperties', properties);
  }

  getSessionId() {
    return this.sessionId;
  }

  getEvents() {
    return { ...this.events };
  }

  // 수동 플러시
  forceFlush() {
    return this.flush();
  }
}

// 전역으로 내보내기
window.PWAAnalytics = PWAAnalytics;

// 자동 초기화
if (document.readyState === 'dh-u-loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const analytics = new PWAAnalytics();
    window.pwaAnalytics = analytics;

    // 개발 모드에서 대시보드 표시
    if (process.env.NODE_ENV === 'development') {
      analytics.showDebugDashboard();
    }
  });
} else {
  const analytics = new PWAAnalytics();
  window.pwaAnalytics = analytics;
}

export default PWAAnalytics;
