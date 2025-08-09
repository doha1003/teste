/**
 * App Shell Manager
 * PWA App Shell 아키텍처 구현
 * 
 * Features:
 * - Critical UI 빠른 로딩
 * - 점진적 콘텐츠 로딩
 * - 오프라인 shell 지원
 * - 네이티브 앱 수준의 사용자 경험
 */

class AppShell {
  constructor() {
    this.config = {
      // App Shell 컴포넌트들
      shell: {
        navbar: '#navbar-placeholder',
        footer: '#footer-placeholder',
        mainContent: 'main',
        loadingIndicator: '.loading-indicator',
      },
      
      // 로딩 상태
      loading: {
        shellLoaded: false,
        contentLoaded: false,
        componentsLoaded: new Set(),
      },
      
      // 캐시 설정
      cache: {
        shellComponents: [
          '/includes/navbar.html',
          '/includes/footer.html',
        ],
        criticalCSS: [
          '/dist/styles.min.css',
          '/css/design-system/tokens.css',
        ],
        criticalJS: [
          '/js/app.js',
          '/js/core/common-init.js',
        ],
      },
      
      // 성능 임계값
      performance: {
        shellTimeout: 2000,  // 2초 내 Shell 로딩
        contentTimeout: 5000, // 5초 내 콘텐츠 로딩
        criticalResourceTimeout: 3000, // 3초 내 핵심 리소스
      },
      
      // 애니메이션 설정
      animations: {
        shellFadeIn: 200,
        contentSlideIn: 300,
        skeletonPulse: 1500,
      },
    };
    
    this.loadStartTime = performance.now();
    this.metrics = {
      shellLoadTime: 0,
      contentLoadTime: 0,
      totalLoadTime: 0,
      resourceLoadTimes: new Map(),
    };
    
    this.init();
  }
  
  /**
   * App Shell 초기화
   */
  init() {
    // 성능 측정 시작
    this.startPerformanceTracking();
    
    // Shell 우선 로딩
    this.loadShell();
    
    // 컨텐츠 지연 로딩
    this.scheduleContentLoading();
    
    // 오프라인 감지 및 처리
    this.setupOfflineHandling();
    
    // 설치 프롬프트 관리
    this.setupInstallPrompt();
  }
  
  /**
   * App Shell 로딩
   */
  async loadShell() {
    try {
      // 스켈레톤 UI 표시
      this.showSkeletonUI();
      
      // 병렬로 Shell 컴포넌트 로딩
      const shellPromises = [
        this.loadComponent('navbar', this.config.shell.navbar),
        this.loadComponent('footer', this.config.shell.footer),
        this.preloadCriticalResources(),
      ];
      
      await Promise.allSettled(shellPromises);
      
      // Shell 로딩 완료
      this.config.loading.shellLoaded = true;
      this.metrics.shellLoadTime = performance.now() - this.loadStartTime;
      
      // Shell UI 표시
      this.showShell();
      
      // Shell 로딩 이벤트 발송
      this.dispatchEvent('shell:loaded', {
        loadTime: this.metrics.shellLoadTime,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('[App Shell] Shell 로딩 실패:', error);
      this.handleShellLoadError(error);
    }
  }
  
  /**
   * 컴포넌트 로딩
   */
  async loadComponent(name, selector) {
    const startTime = performance.now();
    
    try {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      // 캐시에서 먼저 확인
      let html = await this.getFromCache(`component:${name}`);
      
      if (!html) {
        // 네트워크에서 로딩
        const response = await fetch(`/includes/${name}.html`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        html = await response.text();
        
        // 캐시에 저장
        await this.saveToCache(`component:${name}`, html);
      }
      
      // DOM에 삽입
      element.innerHTML = html;
      
      // 컴포넌트별 초기화
      await this.initializeComponent(name, element);
      
      // 로딩 완료 표시
      this.config.loading.componentsLoaded.add(name);
      
      const loadTime = performance.now() - startTime;
      this.metrics.resourceLoadTimes.set(name, loadTime);
      
      console.log(`[App Shell] ${name} 컴포넌트 로딩 완료 (${loadTime.toFixed(2)}ms)`);
      
    } catch (error) {
      console.error(`[App Shell] ${name} 컴포넌트 로딩 실패:`, error);
      
      // 오프라인 폴백
      await this.loadOfflineFallback(name, selector);
    }
  }
  
  /**
   * 핵심 리소스 프리로딩
   */
  async preloadCriticalResources() {
    const preloadPromises = [];
    
    // CSS 프리로딩
    for (const cssUrl of this.config.cache.criticalCSS) {
      preloadPromises.push(this.preloadResource(cssUrl, 'style'));
    }
    
    // JS 프리로딩 (이미 로드된 것 제외)
    for (const jsUrl of this.config.cache.criticalJS) {
      if (!this.isScriptLoaded(jsUrl)) {
        preloadPromises.push(this.preloadResource(jsUrl, 'script'));
      }
    }
    
    await Promise.allSettled(preloadPromises);
  }
  
  /**
   * 리소스 프리로딩
   */
  async preloadResource(url, type) {
    return new Promise((resolve, reject) => {
      const element = document.createElement('link');
      element.rel = 'preload';
      element.href = url;
      element.as = type;
      
      if (type === 'style') {
        element.onload = () => {
          // CSS를 실제로 적용
          const linkElement = document.createElement('link');
          linkElement.rel = 'stylesheet';
          linkElement.href = url;
          document.head.appendChild(linkElement);
          resolve();
        };
      } else {
        element.onload = resolve;
      }
      
      element.onerror = reject;
      
      // 타임아웃 설정
      setTimeout(() => {
        reject(new Error(`Preload timeout: ${url}`));
      }, this.config.performance.criticalResourceTimeout);
      
      document.head.appendChild(element);
    });
  }
  
  /**
   * 컨텐츠 로딩 스케줄링
   */
  scheduleContentLoading() {
    // Shell 로딩 후 컨텐츠 로딩
    const checkShellReady = () => {
      if (this.config.loading.shellLoaded) {
        this.loadContent();
      } else {
        setTimeout(checkShellReady, 50);
      }
    };
    
    setTimeout(checkShellReady, 100);
  }
  
  /**
   * 컨텐츠 로딩
   */
  async loadContent() {
    try {
      const contentStartTime = performance.now();
      
      // 페이지별 컨텐츠 로딩
      await this.loadPageContent();
      
      // 비핵심 리소스 지연 로딩
      this.scheduleNonCriticalLoading();
      
      // 컨텐츠 로딩 완료
      this.config.loading.contentLoaded = true;
      this.metrics.contentLoadTime = performance.now() - contentStartTime;
      this.metrics.totalLoadTime = performance.now() - this.loadStartTime;
      
      // 스켈레톤 UI 숨기기
      this.hideSkeletonUI();
      
      // 컨텐츠 표시
      this.showContent();
      
      // 로딩 완료 이벤트
      this.dispatchEvent('content:loaded', {
        contentLoadTime: this.metrics.contentLoadTime,
        totalLoadTime: this.metrics.totalLoadTime,
      });
      
      // 성능 메트릭 보고
      this.reportPerformanceMetrics();
      
    } catch (error) {
      console.error('[App Shell] 컨텐츠 로딩 실패:', error);
      this.handleContentLoadError(error);
    }
  }
  
  /**
   * 페이지별 컨텐츠 로딩
   */
  async loadPageContent() {
    const page = document.documentElement.dataset.page || 'home';
    
    try {
      // 페이지별 스크립트 동적 로딩
      const pageScript = `/js/pages/${page}.js`;
      if (await this.resourceExists(pageScript)) {
        await this.loadScript(pageScript);
      }
      
      // 페이지별 추가 리소스 로딩
      await this.loadPageSpecificResources(page);
      
    } catch (error) {
      console.warn(`[App Shell] 페이지 컨텐츠 로딩 경고 (${page}):`, error);
    }
  }
  
  /**
   * 스켈레톤 UI 표시
   */
  showSkeletonUI() {
    // 스켈레톤 HTML 생성
    const skeletonHTML = this.generateSkeletonHTML();
    
    // 메인 컨텐츠 영역에 스켈레톤 삽입
    const mainElement = document.querySelector(this.config.shell.mainContent);
    if (mainElement) {
      const skeletonContainer = document.createElement('div');
      skeletonContainer.id = 'app-shell-skeleton';
      skeletonContainer.innerHTML = skeletonHTML;
      skeletonContainer.style.cssText = `
        opacity: 1;
        transition: opacity ${this.config.animations.shellFadeIn}ms ease;
      `;
      
      mainElement.appendChild(skeletonContainer);
    }
  }
  
  /**
   * 스켈레톤 HTML 생성
   */
  generateSkeletonHTML() {
    return `
      <div class="skeleton-container">
        <div class="skeleton-header">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-subtitle"></div>
        </div>
        
        <div class="skeleton-content">
          <div class="skeleton-card">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
          
          <div class="skeleton-card">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
          
          <div class="skeleton-card">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      </div>
      
      <style>
        .skeleton-container {
          padding: 2rem 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .skeleton-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .skeleton-line {
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading ${this.config.animations.skeletonPulse}ms infinite;
          border-radius: 4px;
          margin-bottom: 12px;
        }
        
        .skeleton-title {
          height: 32px;
          width: 60%;
          margin: 0 auto 16px;
        }
        
        .skeleton-subtitle {
          height: 20px;
          width: 40%;
          margin: 0 auto;
        }
        
        .skeleton-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .skeleton-card {
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
        }
        
        .skeleton-line.short {
          width: 60%;
        }
        
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        @media (max-width: 768px) {
          .skeleton-container { padding: 1rem; }
          .skeleton-content { grid-template-columns: 1fr; }
        }
      </style>
    `;
  }
  
  /**
   * Shell 표시
   */
  showShell() {
    document.body.classList.add('shell-loaded');
    
    // Shell 컴포넌트들 fade-in 애니메이션
    const shellElements = [
      document.querySelector(this.config.shell.navbar),
      document.querySelector(this.config.shell.footer),
    ];
    
    shellElements.forEach((element, index) => {
      if (element) {
        element.style.cssText = `
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity ${this.config.animations.shellFadeIn}ms ease ${index * 100}ms,
                      transform ${this.config.animations.shellFadeIn}ms ease ${index * 100}ms;
        `;
        
        // 애니메이션 트리거
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, 50);
      }
    });
  }
  
  /**
   * 컨텐츠 표시
   */
  showContent() {
    const mainElement = document.querySelector(this.config.shell.mainContent);
    if (mainElement) {
      mainElement.classList.add('content-loaded');
      
      // 컨텐츠 slide-in 애니메이션
      const contentElements = mainElement.querySelectorAll(':scope > *:not(#app-shell-skeleton)');
      
      contentElements.forEach((element, index) => {
        element.style.cssText = `
          opacity: 0;
          transform: translateY(20px);
          transition: opacity ${this.config.animations.contentSlideIn}ms ease ${index * 50}ms,
                      transform ${this.config.animations.contentSlideIn}ms ease ${index * 50}ms;
        `;
        
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, 100);
      });
    }
  }
  
  /**
   * 스켈레톤 UI 숨기기
   */
  hideSkeletonUI() {
    const skeleton = document.getElementById('app-shell-skeleton');
    if (skeleton) {
      skeleton.style.opacity = '0';
      
      setTimeout(() => {
        skeleton.remove();
      }, this.config.animations.shellFadeIn);
    }
  }
  
  /**
   * 오프라인 처리 설정
   */
  setupOfflineHandling() {
    window.addEventListener('online', () => {
      this.handleOnlineStateChange(true);
    });
    
    window.addEventListener('offline', () => {
      this.handleOnlineStateChange(false);
    });
    
    // 초기 온라인 상태 확인
    this.updateOnlineStatus(navigator.onLine);
  }
  
  /**
   * 온라인 상태 변경 처리
   */
  handleOnlineStateChange(isOnline) {
    this.updateOnlineStatus(isOnline);
    
    if (isOnline) {
      // 온라인 복구 시 대기 중인 리소스 로딩
      this.retryFailedLoading();
    } else {
      // 오프라인 모드 UI 표시
      this.showOfflineIndicator();
    }
  }
  
  /**
   * 온라인 상태 업데이트
   */
  updateOnlineStatus(isOnline) {
    document.body.classList.toggle('offline', !isOnline);
    document.body.classList.toggle('online', isOnline);
    
    // 이벤트 발송
    this.dispatchEvent('connectivity:changed', {
      online: isOnline,
      timestamp: Date.now(),
    });
  }
  
  /**
   * 설치 프롬프트 설정
   */
  setupInstallPrompt() {
    let deferredPrompt = null;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // 설치 프롬프트 UI 표시
      this.showInstallPrompt(deferredPrompt);
    });
    
    // 설치 완료 감지
    window.addEventListener('appinstalled', () => {
      this.handleAppInstalled();
    });
  }
  
  /**
   * 설치 프롬프트 표시
   */
  showInstallPrompt(deferredPrompt) {
    // 이미 설치된 경우 프롬프트 표시하지 않음
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }
    
    // 사용자가 이미 거부한 경우 확인
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return; // 7일 동안 표시하지 않음
    }
    
    // 설치 프롬프트 UI 생성
    const installBanner = this.createInstallPromptUI(deferredPrompt);
    document.body.appendChild(installBanner);
    
    // 애니메이션과 함께 표시
    setTimeout(() => {
      installBanner.classList.add('visible');
    }, 2000); // 2초 후 표시
  }
  
  /**
   * 설치 프롬프트 UI 생성
   */
  createInstallPromptUI(deferredPrompt) {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="install-content">
        <div class="install-icon">📱</div>
        <div class="install-text">
          <div class="install-title">앱으로 설치하기</div>
          <div class="install-subtitle">더 빠르고 편리하게 이용하세요</div>
        </div>
        <div class="install-actions">
          <button class="install-btn install-btn--primary" id="install-accept">
            설치
          </button>
          <button class="install-btn install-btn--secondary" id="install-dismiss">
            나중에
          </button>
        </div>
      </div>
    `;
    
    // 스타일 적용
    banner.style.cssText = `
      position: fixed;
      bottom: -120px;
      left: 16px;
      right: 16px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      z-index: 1000;
      transition: bottom 300ms ease;
      border: 1px solid #e5e7eb;
      max-width: 400px;
      margin: 0 auto;
    `;
    
    // 이벤트 리스너
    banner.querySelector('#install-accept').addEventListener('click', async () => {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        this.trackInstallPromptResult(choiceResult.outcome);
        banner.remove();
        
      } catch (error) {
        console.error('설치 프롬프트 오류:', error);
      }
    });
    
    banner.querySelector('#install-dismiss').addEventListener('click', () => {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      banner.classList.remove('visible');
      setTimeout(() => banner.remove(), 300);
      
      this.trackInstallPromptResult('dismissed');
    });
    
    // CSS 추가
    if (!document.getElementById('install-prompt-styles')) {
      const styles = document.createElement('style');
      styles.id = 'install-prompt-styles';
      styles.textContent = `
        #pwa-install-banner.visible { bottom: 16px; }
        
        .install-content {
          display: flex;
          align-items: center;
          padding: 16px;
          gap: 12px;
        }
        
        .install-icon {
          font-size: 24px;
          flex-shrink: 0;
        }
        
        .install-text {
          flex: 1;
          min-width: 0;
        }
        
        .install-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
        }
        
        .install-subtitle {
          font-size: 14px;
          color: #6b7280;
        }
        
        .install-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        
        .install-btn {
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease;
        }
        
        .install-btn--primary {
          background: #6366f1;
          color: white;
        }
        
        .install-btn--primary:hover {
          background: #5856eb;
        }
        
        .install-btn--secondary {
          background: #f3f4f6;
          color: #374151;
        }
        
        .install-btn--secondary:hover {
          background: #e5e7eb;
        }
        
        @media (max-width: 480px) {
          .install-actions {
            flex-direction: column;
          }
          
          .install-btn {
            width: 100%;
          }
        }
      `;
      document.head.appendChild(styles);
    }
    
    return banner;
  }
  
  /**
   * 앱 설치 완료 처리
   */
  handleAppInstalled() {
    // 설치 완료 알림
    this.showInstallSuccessMessage();
    
    // 설치 프롬프트 제거
    const installBanner = document.getElementById('pwa-install-banner');
    if (installBanner) {
      installBanner.remove();
    }
    
    // 설치 완료 추적
    this.trackEvent('pwa_installed', {
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
    });
  }
  
  /**
   * 성능 메트릭 보고
   */
  reportPerformanceMetrics() {
    const metrics = {
      ...this.metrics,
      timestamp: Date.now(),
      page: document.documentElement.dataset.page || 'unknown',
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      connection: this.getConnectionInfo(),
    };
    
    // 분석 도구로 전송
    this.trackEvent('app_shell_performance', metrics);
    
    // 콘솔에 성능 요약 출력
    console.group('[App Shell] 성능 메트릭');
    console.log('Shell 로딩 시간:', `${metrics.shellLoadTime.toFixed(2)}ms`);
    console.log('컨텐츠 로딩 시간:', `${metrics.contentLoadTime.toFixed(2)}ms`);
    console.log('총 로딩 시간:', `${metrics.totalLoadTime.toFixed(2)}ms`);
    console.log('컴포넌트 로딩 시간:', Object.fromEntries(metrics.resourceLoadTimes));
    console.groupEnd();
  }
  
  /**
   * 유틸리티 메서드들
   */
  
  async getFromCache(key) {
    try {
      const cache = await caches.open('app-shell-v1');
      const response = await cache.match(key);
      return response ? await response.text() : null;
    } catch {
      return null;
    }
  }
  
  async saveToCache(key, data) {
    try {
      const cache = await caches.open('app-shell-v1');
      await cache.put(key, new Response(data));
    } catch (error) {
      console.warn('캐시 저장 실패:', error);
    }
  }
  
  isScriptLoaded(src) {
    return Array.from(document.scripts).some(script => script.src.includes(src));
  }
  
  async resourceExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  async loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'module';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  getConnectionInfo() {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
      };
    }
    return null;
  }
  
  dispatchEvent(eventName, detail) {
    window.dispatchEvent(new CustomEvent(`appshell:${eventName}`, { detail }));
  }
  
  trackEvent(eventName, eventData) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, eventData);
    }
  }
  
  trackInstallPromptResult(outcome) {
    this.trackEvent('pwa_install_prompt', {
      outcome,
      timestamp: Date.now(),
    });
  }
  
  // ... 기타 유틸리티 메서드들
  
  /**
   * 오류 처리 메서드들
   */
  
  handleShellLoadError(error) {
    console.error('[App Shell] Shell 로딩 실패, 기본 UI로 전환');
    
    // 기본 네비게이션 표시
    this.showFallbackNavigation();
    
    // 오류 추적
    this.trackEvent('app_shell_error', {
      type: 'shell_load_failed',
      error: error.message,
      timestamp: Date.now(),
    });
  }
  
  handleContentLoadError(error) {
    console.error('[App Shell] 컨텐츠 로딩 실패');
    
    // 스켈레톤 UI는 유지하되 오류 메시지 표시
    this.showContentLoadError();
    
    // 오류 추적
    this.trackEvent('app_shell_error', {
      type: 'content_load_failed',
      error: error.message,
      timestamp: Date.now(),
    });
  }
  
  showFallbackNavigation() {
    // 간단한 네비게이션 HTML 생성
    const fallbackNav = `
      <nav style="background: #6366f1; padding: 1rem; color: white;">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <h1 style="margin: 0; font-size: 1.5rem;">doha.kr</h1>
          <div>
            <a href="/" style="color: white; text-decoration: none; margin: 0 1rem;">홈</a>
            <a href="/tests/" style="color: white; text-decoration: none; margin: 0 1rem;">테스트</a>
            <a href="/tools/" style="color: white; text-decoration: none; margin: 0 1rem;">도구</a>
          </div>
        </div>
      </nav>
    `;
    
    const navElement = document.querySelector(this.config.shell.navbar);
    if (navElement) {
      navElement.innerHTML = fallbackNav;
    }
  }
  
  showContentLoadError() {
    const mainElement = document.querySelector(this.config.shell.mainContent);
    if (mainElement) {
      const errorHTML = `
        <div style="text-align: center; padding: 3rem 1rem; max-width: 500px; margin: 0 auto;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
          <h2 style="color: #374151; margin-bottom: 1rem;">컨텐츠 로딩 실패</h2>
          <p style="color: #6b7280; margin-bottom: 2rem;">페이지를 불러오는데 문제가 발생했습니다.</p>
          <button onclick="window.location.reload()" 
                  style="background: #6366f1; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer;">
            페이지 새로고침
          </button>
        </div>
      `;
      
      mainElement.innerHTML = errorHTML;
    }
  }
  
  showInstallSuccessMessage() {
    // 설치 성공 토스트 메시지
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1001;
      font-weight: 500;
      transform: translateX(100%);
      transition: transform 300ms ease;
    `;
    
    toast.textContent = '앱이 성공적으로 설치되었습니다!';
    document.body.appendChild(toast);
    
    // 애니메이션
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // 3초 후 제거
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  // ... 기타 메서드들 계속
}

// 전역 인스턴스 생성
if (typeof window !== 'undefined') {
  window.AppShell = AppShell;
  
  // DOM 준비 시 자동 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.appShell = new AppShell();
    });
  } else {
    window.appShell = new AppShell();
  }
}

export default AppShell;