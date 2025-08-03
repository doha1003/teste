/**
 * PWA 설치율 및 사용 패턴 분석 시스템
 * PWA 관련 메트릭을 수집하고 분석합니다.
 */

class PWAAnalytics {
  constructor(options = {}) {
    this.config = {
      endpoint: options.endpoint || '/api/pwa-analytics',
      trackingEnabled: options.trackingEnabled !== false,
      debugMode: options.debugMode || false,
      ...options,
    };

    this.installPromptEvent = null;
    this.metrics = {
      promptShown: false,
      installAttempted: false,
      installed: false,
      installMethod: null,
      usagePatterns: {
        standAloneUsage: 0,
        offlineUsage: 0,
        pushNotifications: 0,
        backgroundSync: 0,
      },
      sessionData: {
        startTime: Date.now(),
        isStandalone: false,
        isOffline: false,
        interactions: [],
      },
    };

    this.init();
  }

  /**
   * 초기화
   */
  init() {
    if (!this.config.trackingEnabled) {
      console.log('PWA Analytics: 추적이 비활성화됨');
      return;
    }

    this.detectInstallationState();
    this.setupInstallPromptTracking();
    this.setupStandaloneTracking();
    this.setupOfflineTracking();
    this.setupServiceWorkerTracking();
    this.setupUsageTracking();
    this.setupPeriodicReporting();

    // 페이지 언로드 시 최종 리포트 전송
    window.addEventListener('beforeunload', () => {
      this.sendFinalReport();
    });

    console.log('PWA Analytics 초기화 완료');
  }

  /**
   * 설치 상태 감지
   */
  detectInstallationState() {
    // 스탠드얼론 모드 감지
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    this.metrics.sessionData.isStandalone = isStandalone;

    if (isStandalone) {
      this.metrics.installed = true;
      this.metrics.installMethod = 'detected_standalone';
      this.trackEvent('pwa_usage', 'standalone_launch');
    }

    // 설치 여부를 localStorage에서 확인
    const installData = localStorage.getItem('pwa_install_data');
    if (installData) {
      try {
        const data = JSON.parse(installData);
        Object.assign(this.metrics, data);
      } catch (e) {
        console.warn('PWA install data 파싱 실패:', e);
      }
    }

    this.logDebug('Installation state detected:', {
      isStandalone,
      installed: this.metrics.installed,
    });
  }

  /**
   * 설치 프롬프트 추적
   */
  setupInstallPromptTracking() {
    // beforeinstallprompt 이벤트 리스너
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault(); // 기본 프롬프트 방지
      this.installPromptEvent = event;

      this.metrics.promptShown = true;
      this.trackEvent('pwa_install', 'prompt_available');

      this.logDebug('Install prompt available');

      // 사용자 정의 설치 버튼 표시 로직 트리거
      this.showCustomInstallPrompt();
    });

    // 앱 설치 완료 이벤트
    window.addEventListener('appinstalled', () => {
      this.metrics.installed = true;
      this.metrics.installMethod = 'prompt';
      this.metrics.installAttempted = true;

      this.trackEvent('pwa_install', 'completed');
      this.saveInstallData();

      // 설치 성공 후 프롬프트 이벤트 정리
      this.installPromptEvent = null;

      this.logDebug('App installed successfully');

      // 설치 완료 후 온보딩 트리거
      this.triggerPostInstallOnboarding();
    });
  }

  /**
   * 사용자 정의 설치 프롬프트 표시
   */
  showCustomInstallPrompt() {
    // 사용자 정의 설치 버튼이 있다면 표시
    const installButton = document.querySelector('[data-pwa-install]');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.onclick = () => this.triggerInstallPrompt();
    }

    // 설치 배너 표시 (있다면)
    const installBanner = document.querySelector('[data-pwa-banner]');
    if (installBanner) {
      installBanner.classList.add('show');
    }

    this.trackEvent('pwa_install', 'custom_prompt_shown');
  }

  /**
   * 설치 프롬프트 트리거
   */
  async triggerInstallPrompt() {
    if (!this.installPromptEvent) {
      this.logDebug('Install prompt not available');
      return false;
    }

    this.metrics.installAttempted = true;
    this.trackEvent('pwa_install', 'prompt_triggered');

    try {
      // 설치 프롬프트 표시
      this.installPromptEvent.prompt();

      // 사용자 선택 대기
      const { outcome } = await this.installPromptEvent.userChoice;

      this.trackEvent('pwa_install', 'user_choice', { outcome });

      if (outcome === 'accepted') {
        this.logDebug('User accepted install prompt');
        // 설치는 appinstalled 이벤트에서 처리
      } else {
        this.logDebug('User dismissed install prompt');
        this.trackEvent('pwa_install', 'dismissed');
      }

      return outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt error:', error);
      this.trackEvent('pwa_install', 'error', { error: error.message });
      return false;
    } finally {
      this.installPromptEvent = null;
    }
  }

  /**
   * 스탠드얼론 모드 추적
   */
  setupStandaloneTracking() {
    if (this.metrics.sessionData.isStandalone) {
      // 스탠드얼론 세션 시작
      this.trackEvent('pwa_usage', 'standalone_session_start');

      // 정기적으로 스탠드얼론 사용 시간 기록
      setInterval(() => {
        this.metrics.usagePatterns.standAloneUsage += 30; // 30초씩 증가
        this.trackEvent('pwa_usage', 'standalone_time', {
          totalTime: this.metrics.usagePatterns.standAloneUsage,
        });
      }, 30000);
    }

    // display-mode 변경 감지 (가능한 경우)
    if (window.matchMedia) {
      const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');
      standaloneMediaQuery.addListener((e) => {
        if (e.matches) {
          this.trackEvent('pwa_usage', 'switched_to_standalone');
        } else {
          this.trackEvent('pwa_usage', 'switched_to_browser');
        }
      });
    }
  }

  /**
   * 오프라인 사용 추적
   */
  setupOfflineTracking() {
    const updateOnlineStatus = () => {
      const wasOffline = this.metrics.sessionData.isOffline;
      const isOffline = !navigator.onLine;

      this.metrics.sessionData.isOffline = isOffline;

      if (isOffline && !wasOffline) {
        // 오프라인이 됨
        this.trackEvent('pwa_offline', 'went_offline');
        this.offlineStartTime = Date.now();
      } else if (!isOffline && wasOffline) {
        // 온라인이 됨
        this.trackEvent('pwa_offline', 'went_online');
        if (this.offlineStartTime) {
          const offlineTime = Date.now() - this.offlineStartTime;
          this.metrics.usagePatterns.offlineUsage += offlineTime;
          this.trackEvent('pwa_offline', 'offline_session', {
            duration: offlineTime,
          });
        }
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // 초기 상태 설정
    updateOnlineStatus();
  }

  /**
   * Service Worker 추적
   */
  setupServiceWorkerTracking() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        this.trackEvent('pwa_sw', 'ready');

        // 업데이트 감지
        registration.addEventListener('updatefound', () => {
          this.trackEvent('pwa_sw', 'update_found');

          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              this.trackEvent('pwa_sw', 'update_installed');
            }
          });
        });
      });

      // Service Worker 메시지 수신
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data } = event.data;

        if (type === 'BACKGROUND_SYNC') {
          this.metrics.usagePatterns.backgroundSync++;
          this.trackEvent('pwa_sw', 'background_sync', data);
        } else if (type === 'PUSH_NOTIFICATION') {
          this.metrics.usagePatterns.pushNotifications++;
          this.trackEvent('pwa_sw', 'push_notification', data);
        } else if (type === 'CACHE_HIT') {
          this.trackEvent('pwa_sw', 'cache_hit', data);
        }
      });
    }
  }

  /**
   * 사용 패턴 추적
   */
  setupUsageTracking() {
    // 페이지 탐색 추적
    let pageViews = 0;
    const trackPageView = () => {
      pageViews++;
      this.trackEvent('pwa_usage', 'page_view', {
        page: window.location.pathname,
        totalViews: pageViews,
      });
    };

    // 초기 페이지뷰
    trackPageView();

    // SPA 라우팅 감지 (History API)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      trackPageView();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      trackPageView();
    };

    window.addEventListener('popstate', trackPageView);

    // 상호작용 추적
    let interactions = 0;
    ['click', 'touch', 'keydown'].forEach((eventType) => {
      document.addEventListener(
        eventType,
        () => {
          interactions++;
          this.metrics.sessionData.interactions.push({
            type: eventType,
            timestamp: Date.now(),
          });
        },
        { passive: true }
      );
    });

    // 정기적으로 상호작용 리포트
    setInterval(() => {
      if (interactions > 0) {
        this.trackEvent('pwa_usage', 'interactions', {
          count: interactions,
          standalone: this.metrics.sessionData.isStandalone,
        });
        interactions = 0;
      }
    }, 60000); // 1분마다

    // 세션 시간 추적
    setInterval(() => {
      const sessionDuration = Date.now() - this.metrics.sessionData.startTime;
      this.trackEvent('pwa_usage', 'session_duration', {
        duration: sessionDuration,
        standalone: this.metrics.sessionData.isStandalone,
      });
    }, 300000); // 5분마다
  }

  /**
   * 정기적 리포팅 설정
   */
  setupPeriodicReporting() {
    // 10분마다 메트릭 요약 전송
    setInterval(() => {
      this.sendMetricsReport();
    }, 600000);

    // 페이지 가시성 변경 시 리포트
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendMetricsReport();
      }
    });
  }

  /**
   * 이벤트 추적
   */
  trackEvent(category, action, data = {}) {
    const event = {
      category,
      action,
      timestamp: Date.now(),
      url: window.location.href,
      standalone: this.metrics.sessionData.isStandalone,
      offline: this.metrics.sessionData.isOffline,
      ...data,
    };

    this.logDebug('PWA Event:', event);

    // 이벤트를 큐에 추가 (배치로 전송)
    this.eventQueue = this.eventQueue || [];
    this.eventQueue.push(event);

    // Google Analytics 연동 (선택사항)
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        custom_map: data,
      });
    }
  }

  /**
   * 메트릭 리포트 전송
   */
  async sendMetricsReport() {
    const report = {
      sessionId: this.generateSessionId(),
      timestamp: Date.now(),
      metrics: { ...this.metrics },
      events: this.eventQueue || [],
      sessionDuration: Date.now() - this.metrics.sessionData.startTime,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      this.logDebug('PWA metrics report sent');

      // 이벤트 큐 초기화
      this.eventQueue = [];
    } catch (error) {
      console.error('PWA metrics report failed:', error);
    }
  }

  /**
   * 최종 리포트 전송 (페이지 언로드 시)
   */
  sendFinalReport() {
    const finalReport = {
      sessionId: this.generateSessionId(),
      timestamp: Date.now(),
      type: 'session_end',
      metrics: { ...this.metrics },
      events: this.eventQueue || [],
      sessionDuration: Date.now() - this.metrics.sessionData.startTime,
    };

    // sendBeacon 사용 (더 안정적)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.config.endpoint, JSON.stringify(finalReport));
    }
  }

  /**
   * 설치 데이터 저장
   */
  saveInstallData() {
    const installData = {
      installed: this.metrics.installed,
      installMethod: this.metrics.installMethod,
      installDate: new Date().toISOString(),
      promptShown: this.metrics.promptShown,
      installAttempted: this.metrics.installAttempted,
    };

    localStorage.setItem('pwa_install_data', JSON.stringify(installData));
  }

  /**
   * 설치 후 온보딩 트리거
   */
  triggerPostInstallOnboarding() {
    // 설치 완료 알림
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('앱이 설치되었습니다!', {
        body: 'doha.kr을 이제 앱으로 사용하실 수 있습니다.',
        icon: '/images/icon-192x192.png',
      });
    }

    // 온보딩 이벤트 발생
    window.dispatchEvent(
      new CustomEvent('pwa-installed', {
        detail: { method: this.metrics.installMethod },
      })
    );

    this.trackEvent('pwa_onboarding', 'post_install_started');
  }

  /**
   * 수동 설치 통계 리포트
   */
  getInstallStats() {
    return {
      promptAvailable: this.metrics.promptShown,
      installAttempted: this.metrics.installAttempted,
      installed: this.metrics.installed,
      installMethod: this.metrics.installMethod,
      usagePatterns: { ...this.metrics.usagePatterns },
      isCurrentlyStandalone: this.metrics.sessionData.isStandalone,
      isCurrentlyOffline: this.metrics.sessionData.isOffline,
    };
  }

  /**
   * 설치 가능 여부 확인
   */
  canInstall() {
    return this.installPromptEvent !== null;
  }

  /**
   * 수동 설치 버튼 표시 제어
   */
  showInstallButton(selector) {
    const button = document.querySelector(selector);
    if (button && this.canInstall()) {
      button.style.display = 'block';
      button.onclick = () => this.triggerInstallPrompt();
      return true;
    }
    return false;
  }

  /**
   * 유틸리티 메서드들
   */
  generateSessionId() {
    return `pwa_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  logDebug(...args) {
    if (this.config.debugMode) {
      console.log('[PWA Analytics]', ...args);
    }
  }

  /**
   * PWA Analytics 종료
   */
  destroy() {
    this.sendFinalReport();
  }
}

// 전역 사용을 위한 설정
window.PWAAnalytics = PWAAnalytics;

// 자동 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pwaAnalytics = new PWAAnalytics({
      debugMode: process.env.NODE_ENV === 'development',
    });
  });
} else {
  window.pwaAnalytics = new PWAAnalytics({
    debugMode: process.env.NODE_ENV === 'development',
  });
}

export default PWAAnalytics;
