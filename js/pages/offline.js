/**
 * Offline Page JavaScript
 * 오프라인 페이지 기능 구현
 */

(function () {
  'use strict';

  class OfflinePage {
    constructor() {
      this.config = {
        animation: {
          fadeDelay: 200,
          observerThreshold: 0.1,
        },
        connection: {
          retryInterval: 30000, // 30초마다 자동 재시도
          checkTimeout: 5000, // 연결 확인 타임아웃
        },
        analytics: {
          trackOffline: true,
          trackRetries: true,
        },
      };

      this.retryTimer = null;
      this.connectionCheckInProgress = false;
      this.init();
    }

    /**
     * 초기화
     */
    init() {
      // DOM이 준비되면 실행
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
      } else {
        this.onDOMReady();
      }

      // 페이지 로드 완료시 실행
      window.addEventListener('load', () => this.onPageLoad());
    }

    /**
     * DOM 준비 완료시 실행
     */
    onDOMReady() {
      this.initScrollAnimations();
      this.initActionButtons();
      this.initConnectionMonitoring();
      this.initKeyboardShortcuts();
      this.updateConnectionStatus();
    }

    /**
     * 페이지 로드 완료시 실행
     */
    onPageLoad() {
      this.initKakaoSDK();
      this.trackOfflineEvent();
      this.startAutoRetry();
      this.initServiceWorkerListener();
    }

    /**
     * 스크롤 애니메이션 초기화
     */
    initScrollAnimations() {
      const animatedElements = document.querySelectorAll('.fade-in');

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry, index) => {
              if (entry.isIntersecting) {
                // 순차적 애니메이션을 위한 지연
                setTimeout(() => {
                  entry.target.classList.add('visible');
                }, index * this.config.animation.fadeDelay);
                observer.unobserve(entry.target);
              }
            });
          },
          {
            threshold: this.config.animation.observerThreshold,
            rootMargin: '0px 0px -50px 0px',
          }
        );

        animatedElements.forEach((el) => observer.observe(el));
      } else {
        // 폴백: 모든 요소 즉시 표시
        animatedElements.forEach((el) => el.classList.add('visible'));
      }
    }

    /**
     * 액션 버튼 초기화
     */
    initActionButtons() {
      const retryBtn = document.getElementById('retry-btn');
      const homeBtn = document.getElementById('home-btn');

      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          this.retryConnection();
          this.trackEvent('offline_retry_click', {
            method: 'button',
          });
        });
      }

      if (homeBtn) {
        homeBtn.addEventListener('click', () => {
          this.goHome();
          this.trackEvent('offline_home_click', {
            method: 'button',
          });
        });
      }
    }

    /**
     * 연결 모니터링 초기화
     */
    initConnectionMonitoring() {
      // 온라인/오프라인 이벤트 리스너
      window.addEventListener('online', () => {
        this.updateConnectionStatus();
        this.trackEvent('connection_restored', {
          page_type: 'offline',
        });
      });

      window.addEventListener('offline', () => {
        this.updateConnectionStatus();
        this.trackEvent('connection_lost', {
          page_type: 'offline',
        });
      });
    }

    /**
     * 키보드 단축키 초기화
     */
    initKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this.retryConnection();
          this.trackEvent('offline_retry_click', {
            method: 'keyboard',
          });
        } else if (e.key === 'h' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this.goHome();
          this.trackEvent('offline_home_click', {
            method: 'keyboard',
          });
        }
      });
    }

    /**
     * 연결 상태 업데이트
     */
    updateConnectionStatus() {
      const statusElement = document.getElementById('connection-status');
      const statusText = document.getElementById('status-text');
      const retryBtn = document.getElementById('retry-btn');

      if (!statusElement || !statusText || !retryBtn) {
        return;
      }

      if (navigator.onLine) {
        statusElement.className = 'connection-status connection-status--online';
        statusText.textContent = '온라인 상태 - 페이지를 새로고침하세요';
        retryBtn.innerHTML = '<span>🔄</span><span>페이지 새로고침</span>';
      } else {
        statusElement.className = 'connection-status connection-status--offline';
        statusText.textContent = '오프라인 상태';
        retryBtn.innerHTML = '<span>🔄</span><span>다시 시도</span>';
      }
    }

    /**
     * 연결 재시도
     */
    retryConnection() {
      if (this.connectionCheckInProgress) {
        return;
      }

      this.connectionCheckInProgress = true;
      const statusElement = document.getElementById('connection-status');
      const statusText = document.getElementById('status-text');

      if (statusElement && statusText) {
        statusElement.className = 'connection-status checking-connection';
        statusText.textContent = '연결 확인 중...';
      }

      // 연결 테스트
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.connection.checkTimeout);

      fetch('/', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      })
        .then((response) => {
          clearTimeout(timeoutId);
          if (response.ok) {
            // 연결 성공
            this.trackEvent('connection_retry_success', {
              response_status: response.status,
            });
            window.location.reload();
          } else {
            throw new Error('Network response was not ok');
          }
        })
        .catch((error) => {
          clearTimeout(timeoutId);

          this.trackEvent('connection_retry_failed', {
            error_type: error.name,
            error_message: error.message,
          });

          // 2초 후 상태 복원
          setTimeout(() => {
            this.connectionCheckInProgress = false;
            this.updateConnectionStatus();
          }, 2000);
        });
    }

    /**
     * 홈으로 이동
     */
    goHome() {
      try {
        window.location.href = '/';
      } catch (error) {
        // 폴백: 현재 페이지 새로고침
        window.location.reload();
      }
    }

    /**
     * 자동 재시도 시작
     */
    startAutoRetry() {
      this.retryTimer = setInterval(() => {
        if (!navigator.onLine && !this.connectionCheckInProgress) {
          this.retryConnection();
          this.trackEvent('auto_retry_attempt', {
            interval: this.config.connection.retryInterval,
          });
        }
      }, this.config.connection.retryInterval);
    }

    /**
     * Service Worker 리스너 초기화
     */
    initServiceWorkerListener() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'CACHE_UPDATED') {
            this.showCacheUpdateNotification();
          }
        });
      }
    }

    /**
     * 캐시 업데이트 알림 표시
     */
    showCacheUpdateNotification() {
      const notification = document.createElement('div');
      notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                z-index: 1000;
                font-size: 14px;
                font-weight: 500;
                font-family: var(--font-sans);
            `;
      notification.textContent = '새 콘텐츠가 사용 가능합니다';

      document.body.appendChild(notification);

      // 5초 후 제거
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 5000);

      this.trackEvent('cache_update_notification', {
        page_type: 'offline',
      });
    }

    /**
     * 오프라인 이벤트 추적
     */
    trackOfflineEvent() {
      if (!this.config.analytics.trackOffline) {
        return;
      }

      const referrer = document.referrer || 'direct';
      const { userAgent } = navigator;

      this.trackEvent('offline_page_view', {
        referrer,
        user_agent: userAgent,
        connection_type: navigator.connection ? navigator.connection.type : 'unknown',
        timestamp: new Date().toISOString(),
      });
    }

    /**
     * 카카오 SDK 초기화 (조건부)
     */
    initKakaoSDK() {
      // 오프라인 상태에서는 카카오 SDK 초기화를 건너뜀
      if (!navigator.onLine) {
        return;
      }

      if (typeof Kakao === 'undefined') {
        return;
      }

      if (!window.API_CONFIG || !window.API_CONFIG.KAKAO_JS_KEY) {
        return;
      }

      if (!Kakao.isInitialized()) {
        try {
          Kakao.init(window.API_CONFIG.KAKAO_JS_KEY);
        } catch (e) {
          // Error handling - see console
        }
      }
    }

    /**
     * 이벤트 추적
     */
    trackEvent(eventName, eventData) {
      // Google Analytics 또는 다른 분석 도구로 이벤트 전송
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
      }

      // 개발 환경에서 로그
      if (window.location.hostname === 'localhost') {
        console.log('Development mode'); // eslint-disable-line no-console
      }
    }

    /**
     * 정리 함수
     */
    destroy() {
      if (this.retryTimer) {
        clearInterval(this.retryTimer);
        this.retryTimer = null;
      }
    }
  }

  // 전역 인스턴스 생성
  window.offlinePage = new OfflinePage();

  // 페이지 언로드시 정리
  window.addEventListener('beforeunload', () => {
    if (window.offlinePage) {
      window.offlinePage.destroy();
    }
  });
})();
