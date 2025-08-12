/**
 * PWA 설치 관리자
 * 크로스 플랫폼 PWA 설치 경험 개선
 * 
 * Features:
 * - 브라우저별 설치 프롬프트 최적화
 * - 설치 상태 추적 및 분석
 * - 사용자 친화적 설치 안내
 * - A/B 테스트 지원
 */

class PWAInstallManager {
  constructor() {
    this.config = {
      // 프롬프트 설정
      prompt: {
        minSessionTime: 30000, // 30초 후 프롬프트 표시
        minPageViews: 3, // 3페이지 방문 후
        cooldownPeriod: 7 * 24 * 60 * 60 * 1000, // 7일 쿨다운
        maxDismissCount: 3, // 최대 3회 거부시 영구 숨김
        abTestVariants: ['default', 'benefit_focused', 'minimal'],
      },
      
      // 브라우저별 설정
      browsers: {
        chrome: {
          supportBeforeInstallPrompt: true,
          customPromptDelay: 2000,
        },
        edge: {
          supportBeforeInstallPrompt: true,
          customPromptDelay: 2000,
        },
        firefox: {
          supportBeforeInstallPrompt: false,
          showInstructions: true,
        },
        safari: {
          supportBeforeInstallPrompt: false,
          showIOSInstructions: true,
        },
      },
      
      // 메트릭 추적
      analytics: {
        trackPromptShown: true,
        trackInstallAccepted: true,
        trackInstallCompleted: true,
        trackUsageAfterInstall: true,
      },
      
      // UI 설정
      ui: {
        animationDuration: 300,
        backdropBlur: true,
        preventBodyScroll: false,
        autoHideDelay: 8000,
      },
    };
    
    this.state = {
      browserInfo: null,
      installPromptEvent: null,
      isInstalled: false,
      hasBeenPrompted: false,
      dismissCount: 0,
      sessionStartTime: Date.now(),
      pageViewCount: 0,
      currentVariant: null,
      userEngagement: {
        timeOnSite: 0,
        interactionCount: 0,
        scrollDepth: 0,
      },
    };
    
    this.elements = {
      promptContainer: null,
      backdropElement: null,
    };
    
    this.init();
  }
 
  /**
   * 초기화
   */
  init() {
    this.detectBrowserEnvironment();
    this.loadUserState();
    this.setupEventListeners();
    this.trackUserEngagement();
    this.evaluateInstallPromptTrigger();
    
    console.log('[PWA Install] 설치 관리자 초기화됨:', this.state);
  }
 
  /**
   * 브라우저 환경 감지
   */
  detectBrowserEnvironment() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    this.state.browserInfo = {
      isChrome: /chrome/.test(userAgent) && !/edge/.test(userAgent),
      isEdge: /edge/.test(userAgent),
      isFirefox: /firefox/.test(userAgent),
      isSafari: /safari/.test(userAgent) && !/chrome/.test(userAgent),
      isIOSDevice: /ipad|iphone|ipod/.test(userAgent),
      isAndroid: /android/.test(userAgent),
      isPWAMode: window.matchMedia('(display-mode: standalone)').matches,
      supportsInstallPrompt: 'BeforeInstallPromptEvent' in window,
    };
    
    // A/B 테스트 변형 선택
    this.selectABTestVariant();
  }
 
  /**
   * 사용자 상태 로드
   */
  loadUserState() {
    try {
      const storedState = localStorage.getItem('pwa-install-state');
      if (storedState) {
        const parsed = JSON.parse(storedState);
        this.state.dismissCount = parsed.dismissCount || 0;
        this.state.hasBeenPrompted = parsed.hasBeenPrompted || false;
        this.state.currentVariant = parsed.currentVariant;
      }
      
      // 페이지 뷰 카운트 증가
      this.state.pageViewCount = this.getSessionPageViews() + 1;
      this.saveSessionPageViews(this.state.pageViewCount);
      
    } catch (error) {
      console.warn('[PWA Install] 사용자 상태 로드 실패:', error);
    }
  }
 
  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // beforeinstallprompt 이벤트 (Chrome, Edge)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.state.installPromptEvent = e;
      console.log('[PWA Install] beforeinstallprompt 이벤트 캐치됨');
    });
    
    // 앱 설치 완료 감지
    window.addEventListener('appinstalled', () => {
      this.handleInstallCompleted();
    });
    
    // PWA 디스플레이 모드 변경 감지
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      if (e.matches) {
        this.handleInstallCompleted();
      }
    });
    
    // 페이지 언로드시 상태 저장
    window.addEventListener('beforeunload', () => {
      this.saveUserState();
    });
    
    // 가시성 변경 추적 (사용자 참여도 측정)
    document.addEventListener('visibilitychange', () => {
      this.trackVisibilityChange();
    });
  }
 
  /**
   * 사용자 참여도 추적
   */
  trackUserEngagement() {
    // 스크롤 깊이 추적
    let maxScrollDepth = 0;
    window.addEventListener('scroll', this.throttle(() => {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      maxScrollDepth = Math.max(maxScrollDepth, scrollPercent);
      this.state.userEngagement.scrollDepth = Math.min(maxScrollDepth, 1);
    }, 1000));
    
    // 클릭/터치 상호작용 추적
    ['click', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.state.userEngagement.interactionCount++;
      }, { passive: true });
    });
    
    // 사이트 체류시간 추적
    setInterval(() => {
      if (!document.hidden) {
        this.state.userEngagement.timeOnSite = Date.now() - this.state.sessionStartTime;
      }
    }, 5000);
  }
 
  /**
   * 설치 프롬프트 트리거 평가
   */
  evaluateInstallPromptTrigger() {
    // 이미 설치된 경우 프롬프트 표시하지 않음
    if (this.state.browserInfo.isPWAMode || this.state.isInstalled) {
      return;
    }
    
    // 최대 거부 횟수 초과시
    if (this.state.dismissCount >= this.config.prompt.maxDismissCount) {
      console.log('[PWA Install] 최대 거부 횟수 초과, 프롬프트 비활성화');
      return;
    }
    
    // 쿨다운 기간 확인
    const lastDismissTime = this.getLastDismissTime();
    if (lastDismissTime && Date.now() - lastDismissTime < this.config.prompt.cooldownPeriod) {
      console.log('[PWA Install] 쿨다운 기간 중, 프롬프트 대기');
      return;
    }
    
    // 트리거 조건 확인
    setTimeout(() => {
      this.checkPromptTriggerConditions();
    }, this.config.prompt.minSessionTime);
  }
 
  /**
   * 프롬프트 트리거 조건 확인
   */
  checkPromptTriggerConditions() {
    const conditions = {
      timeOnSite: this.state.userEngagement.timeOnSite >= this.config.prompt.minSessionTime,
      pageViews: this.state.pageViewCount >= this.config.prompt.minPageViews,
      userEngagement: this.state.userEngagement.interactionCount > 0,
      scrollDepth: this.state.userEngagement.scrollDepth > 0.3,
    };
    
    const conditionsMet = Object.values(conditions).filter(Boolean).length >= 2;
    
    if (conditionsMet) {
      console.log('[PWA Install] 프롬프트 조건 충족:', conditions);
      this.showInstallPrompt();
    } else {
      console.log('[PWA Install] 프롬프트 조건 미충족:', conditions);
    }
  }
 
  /**
   * 설치 프롬프트 표시
   */
  async showInstallPrompt() {
    if (this.state.hasBeenPrompted) {
      return;
    }
    
    this.state.hasBeenPrompted = true;
    
    try {
      // 브라우저별 프롬프트 처리
      if (this.state.browserInfo.isIOSDevice && this.state.browserInfo.isSafari) {
        await this.showIOSInstallInstructions();
      } else if (this.state.installPromptEvent) {
        await this.showNativeInstallPrompt();
      } else {
        await this.showCustomInstallPrompt();
      }
      
      // 분석 추적
      this.trackEvent('install_prompt_shown', {
        variant: this.state.currentVariant,
        browser: this.getBrowserName(),
        trigger_conditions: this.getEngagementMetrics(),
      });
      
    } catch (error) {
      console.error('[PWA Install] 프롬프트 표시 오류:', error);
    }
  }
 
  /**
   * 네이티브 설치 프롬프트 표시
   */
  async showNativeInstallPrompt() {
    try {
      const promptResult = await this.state.installPromptEvent.prompt();
      const choiceResult = await this.state.installPromptEvent.userChoice;
      
      console.log('[PWA Install] 네이티브 프롬프트 결과:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        this.handleInstallAccepted();
      } else {
        this.handleInstallDismissed();
      }
      
      // 이벤트 객체 정리
      this.state.installPromptEvent = null;
      
    } catch (error) {
      console.error('[PWA Install] 네이티브 프롬프트 오류:', error);
      // 폴백으로 커스텀 프롬프트 표시
      await this.showCustomInstallPrompt();
    }
  }
 
  /**
   * 커스텀 설치 프롬프트 표시
   */
  async showCustomInstallPrompt() {
    const promptElement = this.createCustomPromptElement();
    this.elements.promptContainer = promptElement;
    
    // 백드롭 생성
    if (this.config.ui.backdropBlur) {
      this.createBackdrop();
    }
    
    // 바디 스크롤 방지
    if (this.config.ui.preventBodyScroll) {
      document.body.style.overflow = 'dh-u-hidden';
    }
    
    // DOM에 추가
    document.body.appendChild(promptElement);
    
    // 애니메이션과 함께 표시
    await this.animatePromptIn(promptElement);
    
    // 자동 숨김 타이머
    setTimeout(() => {
      if (this.elements.promptContainer) {
        this.hideInstallPrompt();
      }
    }, this.config.ui.autoHideDelay);
  }
 
  /**
   * 커스텀 프롬프트 요소 생성
   */
  createCustomPromptElement() {
    const variant = this.state.currentVariant;
    const content = this.getPromptContent(variant);
    
    const element = document.createElement('div');
    element.id = 'pwa-install-prompt';
    element.className = `pwa-prompt pwa-prompt--${variant}`;
    
    element.innerHTML = `
      <div class="pwa-prompt__content">
        <div class="pwa-prompt__header">
          <div class="pwa-prompt__icon">${content.icon}</div>
          <h3 class="pwa-prompt__title">${content.title}</h3>
          <button class="pwa-prompt__close" aria-label="닫기">&times;</button>
        </div>
        
        <div class="pwa-prompt__body">
          <p class="pwa-prompt__description">${content.description}</p>
          
          ${content.benefits ? `
            <ul class="pwa-prompt__benefits">
              ${content.benefits.map(benefit => `
                <li class="pwa-prompt__benefit">
                  <span class="benefit__icon">${benefit.icon}</span>
                  <span class="benefit__text">${benefit.text}</span>
                </li>
              `).join('')}
            </ul>
          ` : ''}
        </div>
        
        <div class="pwa-prompt__footer">
          <button class="pwa-prompt__button pwa-prompt__button--primary" id="install-accept">
            ${content.acceptText}
          </button>
          <button class="pwa-prompt__button pwa-prompt__button--secondary" id="install-dismiss">
            ${content.dismissText}
          </button>
        </div>
      </div>
    `;
    
    // 이벤트 리스너 연결
    this.attachPromptEventListeners(element);
    
    // 스타일 적용
    this.applyPromptStyles();
    
    return element;
  }
 
  /**
   * 프롬프트 콘텐츠 가져오기
   */
  getPromptContent(variant) {
    const contents = {
      default: {
        icon: '📱',
        title: '앱으로 설치하기',
        description: 'doha.kr을 홈 화면에 추가하여 더 빠르고 편리하게 이용하세요.',
        acceptText: '설치하기',
        dismissText: '나중에',
      },
      
      benefit_focused: {
        icon: '🚀',
        title: '더 나은 경험을 위해',
        description: '앱으로 설치하면 다음과 같은 혜택을 누릴 수 있습니다:',
        benefits: [
          { icon: '⚡', text: '더 빠른 로딩 속도' },
          { icon: '📵', text: '오프라인에서도 이용 가능' },
          { icon: '🔔', text: '새로운 콘텐츠 알림' },
          { icon: '🏠', text: '홈 화면에서 바로 접근' },
        ],
        acceptText: '지금 설치',
        dismissText: '건너뛰기',
      },
      
      minimal: {
        icon: '⬇️',
        title: '설치',
        description: '홈 화면에 추가',
        acceptText: '추가',
        dismissText: '취소',
      },
    };
    
    return contents[variant] || contents.default;
  }
 
  /**
   * iOS 설치 안내 표시
   */
  async showIOSInstallInstructions() {
    const instructionsElement = this.createIOSInstructionsElement();
    this.elements.promptContainer = instructionsElement;
    
    document.body.appendChild(instructionsElement);
    await this.animatePromptIn(instructionsElement);
  }
 
  /**
   * iOS 설치 안내 요소 생성
   */
  createIOSInstructionsElement() {
    const element = document.createElement('div');
    element.id = 'ios-install-instructions';
    element.className = 'ios-instructions';
    
    element.innerHTML = `
      <div class="ios-instructions__content">
        <div class="ios-instructions__header">
          <h3>홈 화면에 추가하기</h3>
          <button class="ios-instructions__close">&times;</button>
        </div>
        
        <div class="ios-instructions__body">
          <p>Safari에서 홈 화면에 추가하여 앱처럼 사용하세요:</p>
          
          <div class="ios-instructions__steps">
            <div class="step">
              <div class="step__number">1</div>
              <div class="step__content">
                <div class="step__icon">📤</div>
                <p>하단의 <strong>공유</strong> 버튼을 누르세요</p>
              </div>
            </div>
            
            <div class="step">
              <div class="step__number">2</div>
              <div class="step__content">
                <div class="step__icon">➕</div>
                <p><strong>"홈 화면에 추가"</strong>를 선택하세요</p>
              </div>
            </div>
            
            <div class="step">
              <div class="step__number">3</div>
              <div class="step__content">
                <div class="step__icon">✅</div>
                <p><strong>"추가"</strong>를 눌러 완료하세요</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="ios-instructions__footer">
          <button class="ios-instructions__dismiss">확인했습니다</button>
        </div>
      </div>
    `;
    
    // iOS 전용 스타일 적용
    this.applyIOSInstructionStyles();
    
    // 이벤트 리스너
    element.querySelector('.ios-instructions__close').addEventListener('click', () => {
      this.hideInstallPrompt();
      this.handleInstallDismissed();
    });
    
    element.querySelector('.ios-instructions__dismiss').addEventListener('click', () => {
      this.hideInstallPrompt();
      this.handleInstallDismissed();
    });
    
    return element;
  }
 
  /**
   * 설치 수락 처리
   */
  handleInstallAccepted() {
    console.log('[PWA Install] 설치 수락됨');
    
    this.trackEvent('install_accepted', {
      variant: this.state.currentVariant,
      browser: this.getBrowserName(),
      session_metrics: this.getEngagementMetrics(),
    });
    
    this.hideInstallPrompt();
  }
 
  /**
   * 설치 거부 처리
   */
  handleInstallDismissed() {
    console.log('[PWA Install] 설치 거부됨');
    
    this.state.dismissCount++;
    this.setLastDismissTime(Date.now());
    
    this.trackEvent('install_dismissed', {
      variant: this.state.currentVariant,
      dismiss_count: this.state.dismissCount,
      browser: this.getBrowserName(),
    });
    
    this.hideInstallPrompt();
    this.saveUserState();
  }
 
  /**
   * 설치 완료 처리
   */
  handleInstallCompleted() {
    console.log('[PWA Install] 설치 완료됨');
    
    this.state.isInstalled = true;
    
    this.trackEvent('install_completed', {
      variant: this.state.currentVariant,
      browser: this.getBrowserName(),
      installation_method: this.getInstallationMethod(),
    });
    
    // 설치 완료 알림 표시
    this.showInstallSuccessMessage();
    
    // 설치 후 사용 추적 시작
    this.startPostInstallTracking();
    
    this.saveUserState();
  }
 
  /**
   * 프롬프트 숨기기
   */
  async hideInstallPrompt() {
    if (!this.elements.promptContainer) {return;}
    
    await this.animatePromptOut(this.elements.promptContainer);
    
    // DOM에서 제거
    if (this.elements.promptContainer.parentNode) {
      this.elements.promptContainer.parentNode.removeChild(this.elements.promptContainer);
    }
    
    // 백드롭 제거
    if (this.elements.backdropElement) {
      this.elements.backdropElement.remove();
      this.elements.backdropElement = null;
    }
    
    // 바디 스크롤 복원
    if (this.config.ui.preventBodyScroll) {
      document.body.style.overflow = '';
    }
    
    this.elements.promptContainer = null;
  }
 
  /**
   * 프롬프트 애니메이션 인
   */
  async animatePromptIn(element) {
    element.style.cssText = `
      opacity: 0;
      transform: translateY(100%);
      transition: all ${this.config.ui.animationDuration}ms ease;
    `;
    
    // 다음 프레임에서 애니메이션 시작
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
    
    // 애니메이션 완료 대기
    await new Promise(resolve => 
      setTimeout(resolve, this.config.ui.animationDuration)
    );
  }
 
  /**
   * 프롬프트 애니메이션 아웃
   */
  async animatePromptOut(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(100%)';
    
    await new Promise(resolve => 
      setTimeout(resolve, this.config.ui.animationDuration)
    );
  }
 
  /**
   * 유틸리티 메서드들
   */
 
  selectABTestVariant() {
    if (!this.state.currentVariant) {
      const variants = this.config.prompt.abTestVariants;
      const randomIndex = Math.floor(Math.random() * variants.length);
      this.state.currentVariant = variants[randomIndex];
    }
  }
 
  getBrowserName() {
    const info = this.state.browserInfo;
    if (info.isChrome) {return 'chrome';}
    if (info.isEdge) {return 'edge';}
    if (info.isFirefox) {return 'firefox';}
    if (info.isSafari) {return 'safari';}
    return 'unknown';
  }
 
  getEngagementMetrics() {
    return {
      time_on_site: this.state.userEngagement.timeOnSite,
      interaction_count: this.state.userEngagement.interactionCount,
      scroll_depth: this.state.userEngagement.scrollDepth,
      page_views: this.state.pageViewCount,
    };
  }
 
  getInstallationMethod() {
    if (this.state.installPromptEvent) {return 'native_prompt';}
    if (this.state.browserInfo.isIOSDevice) {return 'ios_manual';}
    return 'unknown';
  }
 
  saveUserState() {
    try {
      const stateToSave = {
        dismissCount: this.state.dismissCount,
        hasBeenPrompted: this.state.hasBeenPrompted,
        currentVariant: this.state.currentVariant,
        isInstalled: this.state.isInstalled,
      };
      
      localStorage.setItem('pwa-install-state', JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('[PWA Install] 상태 저장 실패:', error);
    }
  }
 
  getSessionPageViews() {
    return parseInt(sessionStorage.getItem('pwa-session-page-views') || '0');
  }
 
  saveSessionPageViews(count) {
    sessionStorage.setItem('pwa-session-page-views', count.toString());
  }
 
  getLastDismissTime() {
    const stored = localStorage.getItem('pwa-install-last-dismiss');
    return stored ? parseInt(stored) : null;
  }
 
  setLastDismissTime(timestamp) {
    localStorage.setItem('pwa-install-last-dismiss', timestamp.toString());
  }
 
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
 
  trackEvent(eventName, eventData) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        ...eventData,
        timestamp: Date.now(),
      });
    }
    
    console.log(`[PWA Install] Event: ${eventName}`, eventData);
  }
 
  // ... 기타 메서드들 (스타일 적용, 이벤트 처리 등)
 
  applyPromptStyles() {
    if (document.getElementById('pwa-prompt-styles')) {return;}
    
    const style = document.createElement('style');
    style.id = 'pwa-prompt-styles';
    style.textContent = `
      /* PWA 설치 프롬프트 스타일 */
      .pwa-prompt {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 10000;
        max-width: 500px;
        margin: 0 auto;
        background: white;
        border-radius: 16px 16px 0 0;
        box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
        border: 1px solid #e5e7eb;
      }
      
      .pwa-prompt__content {
        padding: 24px;
      }
      
      .pwa-prompt__header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      
      .pwa-prompt__icon {
        font-size: 24px;
        flex-shrink: 0;
      }
      
      .pwa-prompt__title {
        flex: 1;
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #111827;
      }
      
      .pwa-prompt__close {
        background: none;
        border: none;
        font-size: 24px;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        flex-shrink: 0;
      }
      
      .pwa-prompt__close:hover {
        background: #f3f4f6;
      }
      
      .pwa-prompt__description {
        margin: 0 0 16px;
        color: #374151;
        line-height: 1.6;
      }
      
      .pwa-prompt__benefits {
        list-style: none;
        margin: 0 0 20px;
        padding: 0;
      }
      
      .pwa-prompt__benefit {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 14px;
        color: #374151;
      }
      
      .benefit__icon {
        font-size: 16px;
        flex-shrink: 0;
      }
      
      .pwa-prompt__footer {
        display: flex;
        gap: 12px;
      }
      
      .pwa-prompt__button {
        flex: 1;
        padding: 12px 16px;
        border-radius: 8px;
        border: none;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 150ms ease;
      }
      
      .pwa-prompt__button--primary {
        background: #6366f1;
        color: white;
      }
      
      .pwa-prompt__button--primary:hover {
        background: #5856eb;
      }
      
      .pwa-prompt__button--secondary {
        background: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
      }
      
      .pwa-prompt__button--secondary:hover {
        background: #e5e7eb;
      }
      
      @media (max-width: 480px) {
        .pwa-prompt {
          left: 8px;
          right: 8px;
          border-radius: 16px;
          bottom: 8px;
        }
        
        .pwa-prompt__footer {
          flex-direction: column;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
 
  attachPromptEventListeners(element) {
    element.querySelector('#install-accept').addEventListener('click', () => {
      this.handleInstallAccepted();
    });
    
    element.querySelector('#install-dismiss').addEventListener('click', () => {
      this.handleInstallDismissed();
    });
    
    element.querySelector('.pwa-prompt__close').addEventListener('click', () => {
      this.handleInstallDismissed();
    });
  }
 
  createBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 9999;
      opacity: 0;
      transition: opacity ${this.config.ui.animationDuration}ms ease;
    `;
    
    document.body.appendChild(backdrop);
    this.elements.backdropElement = backdrop;
    
    // 애니메이션
    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
    });
    
    // 클릭시 닫기
    backdrop.addEventListener('click', () => {
      this.hideInstallPrompt();
      this.handleInstallDismissed();
    });
  }
 
  showInstallSuccessMessage() {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10001;
      font-weight: 500;
      transform: translateX(100%);
      transition: transform 300ms ease;
    `;
    
    toast.textContent = '✅ 앱이 성공적으로 설치되었습니다!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
 
  startPostInstallTracking() {
    // 설치 후 사용 패턴 추적
    const trackingData = {
      installDate: Date.now(),
      sessionCount: 0,
      totalUsageTime: 0,
    };
    
    localStorage.setItem('pwa-post-install-tracking', JSON.stringify(trackingData));
    
    // 일주일 후 만족도 조사 (예시)
    setTimeout(() => {
      this.showPostInstallSurvey();
    }, 7 * 24 * 60 * 60 * 1000);
  }
 
  // ... 기타 메서드들 계속
}

// 전역 인스턴스 생성
if (typeof window !== 'undefined') {
  window.PWAInstallManager = PWAInstallManager;
  
  // 자동 초기화
  if (document.readyState === 'dh-u-loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.pwaInstallManager = new PWAInstallManager();
    });
  } else {
    window.pwaInstallManager = new PWAInstallManager();
  }
}

export default PWAInstallManager;