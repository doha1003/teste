/**
 * 모바일 네비게이션 향상 시스템
 * 팀리더 지시: 모바일 UX 개선을 위한 햄버거 메뉴 및 터치 최적화
 * 
 * @version 1.0.0
 * @created 2025-08-03
 */

(function() {
  'use strict';

  class MobileNavigationEnhancer {
    constructor() {
      this.isMobile = window.innerWidth <= 768;
      this.menuOpen = false;
      this.touchStartY = 0;
      this.touchStartX = 0;
      
      this.init();
    }

    init() {
      this.createMobileNavigation();
      this.setupTouchOptimization();
      this.setupViewportHandler();
      this.enhanceExistingButtons();
      
      console.log('📱 모바일 네비게이션 향상 시스템 활성화됨');
    }

    createMobileNavigation() {
      // 네비게이션 placeholder가 로드될 때까지 기다림
      const checkNavigation = () => {
        const nav = document.querySelector('nav, [role="navigation"], .navbar, #navbar-placeholder');
        
        if (!nav) {
          // 1초 후 재시도
          setTimeout(checkNavigation, 1000);
          return;
        }

        // placeholder가 있다면 실제 네비게이션 로드를 기다림
        if (nav.id === 'navbar-placeholder' && !nav.querySelector('.navbar')) {
          setTimeout(checkNavigation, 500);
          return;
        }

        // 실제 네비게이션 요소 찾기
        const actualNav = nav.querySelector('.navbar') || nav;

        // 기존 모바일 메뉴 버튼이 있는지 확인
        const existingToggle = actualNav.querySelector('.mobile-menu-btn, .navbar-toggle, .mobile-menu-toggle');
        
        if (!existingToggle && !document.querySelector('.mobile-menu-toggle-enhanced')) {
          const hamburger = this.createHamburgerMenu();
          hamburger.classList.add('mobile-menu-toggle-enhanced'); // 중복 방지용 클래스
          const container = actualNav.querySelector('.navbar-container') || actualNav;
          container.appendChild(hamburger);
        }

        // 모바일 메뉴 오버레이 생성 (기존 것이 없을 때만)
        if (!document.querySelector('.mobile-menu-overlay-enhanced')) {
          const overlay = this.createMobileOverlay();
          overlay.classList.add('mobile-menu-overlay-enhanced'); // 중복 방지용 클래스
          document.body.appendChild(overlay);
        }

        // 네비게이션 링크들 터치 최적화
        this.optimizeNavigationLinks(actualNav);
      };

      checkNavigation();
    }

    createHamburgerMenu() {
      const hamburger = document.createElement('button');
      hamburger.className = 'mobile-menu-toggle';
      hamburger.setAttribute('aria-label', '메뉴 열기');
      hamburger.setAttribute('aria-expanded', 'false');
      
      hamburger.innerHTML = `
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      `;

      hamburger.addEventListener('click', () => this.toggleMobileMenu());
      
      return hamburger;
    }

    createMobileOverlay() {
      const overlay = document.createElement('div');
      overlay.className = 'mobile-menu-overlay';
      overlay.innerHTML = `
        <div class="mobile-menu-content">
          <div class="mobile-menu-header">
            <h3>메뉴</h3>
            <button class="mobile-menu-close" aria-label="메뉴 닫기">×</button>
          </div>
          <nav class="mobile-menu-nav">
            <a href="/" class="mobile-menu-link">🏠 홈</a>
            <a href="/tests/" class="mobile-menu-link">🧠 심리테스트</a>
            <a href="/fortune/" class="mobile-menu-link">🔮 AI 운세</a>
            <a href="/tools/" class="mobile-menu-link">🛠️ 실용도구</a>
            <a href="/about/" class="mobile-menu-link">ℹ️ 소개</a>
            <a href="/contact/" class="mobile-menu-link">📞 문의</a>
          </nav>
          <div class="mobile-menu-footer">
            <p>doha.kr - 일상을 더 재미있게</p>
          </div>
        </div>
      `;

      // 닫기 버튼 이벤트
      overlay.querySelector('.mobile-menu-close').addEventListener('click', () => {
        this.toggleMobileMenu(false);
      });

      // 오버레이 클릭 시 닫기
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.toggleMobileMenu(false);
        }
      });

      return overlay;
    }

    toggleMobileMenu(open = null) {
      const hamburger = document.querySelector('.mobile-menu-toggle-enhanced') || document.querySelector('.mobile-menu-toggle');
      const overlay = document.querySelector('.mobile-menu-overlay-enhanced') || document.querySelector('.mobile-menu-overlay');
      
      if (!hamburger || !overlay) return;

      this.menuOpen = open !== null ? open : !this.menuOpen;

      if (this.menuOpen) {
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', '메뉴 닫기');
        overlay.classList.add('active');
        document.body.classList.add('mobile-menu-open');
      } else {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', '메뉴 열기');
        overlay.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
      }
    }

    optimizeNavigationLinks(nav) {
      const links = nav.querySelectorAll('a');
      
      links.forEach(link => {
        // 터치 영역 확대
        link.style.minHeight = '44px';
        link.style.display = 'flex';
        link.style.alignItems = 'center';
        link.style.padding = '12px 16px';
        
        // 터치 피드백 추가
        link.addEventListener('touchstart', this.handleTouchFeedback);
        link.addEventListener('touchend', this.handleTouchEnd);
      });
    }

    setupTouchOptimization() {
      // 모든 버튼과 링크에 터치 최적화 적용
      const interactiveElements = document.querySelectorAll('button, a, [role="button"]');
      
      interactiveElements.forEach(element => {
        this.optimizeTouchTarget(element);
      });

      // 스와이프 제스처 지원
      this.setupSwipeGestures();
    }

    optimizeTouchTarget(element) {
      const styles = window.getComputedStyle(element);
      const currentHeight = parseInt(styles.height);
      const currentPadding = parseInt(styles.padding);
      
      // 최소 44px 터치 영역 보장 (Apple HIG 권장사항)
      if (currentHeight < 44) {
        const additionalPadding = Math.max(0, (44 - currentHeight) / 2);
        element.style.paddingTop = `${currentPadding + additionalPadding}px`;
        element.style.paddingBottom = `${currentPadding + additionalPadding}px`;
      }

      // 터치 피드백 이벤트
      element.addEventListener('touchstart', this.handleTouchFeedback);
      element.addEventListener('touchend', this.handleTouchEnd);
    }

    handleTouchFeedback = (e) => {
      e.currentTarget.classList.add('touch-feedback');
    }

    handleTouchEnd = (e) => {
      setTimeout(() => {
        e.currentTarget.classList.remove('touch-feedback');
      }, 150);
    }

    setupSwipeGestures() {
      let startTime = 0;
      
      document.addEventListener('touchstart', (e) => {
        this.touchStartY = e.touches[0].clientY;
        this.touchStartX = e.touches[0].clientX;
        startTime = Date.now();
      }, { passive: true });

      document.addEventListener('touchend', (e) => {
        if (!this.touchStartY || !this.touchStartX) return;
        
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        const diffY = this.touchStartY - touchEndY;
        const diffX = this.touchStartX - touchEndX;
        const timeDiff = Date.now() - startTime;
        
        // 빠른 스와이프 감지 (500ms 이내, 50px 이상)
        if (timeDiff < 500 && Math.abs(diffX) > 50 && Math.abs(diffY) < 100) {
          if (diffX > 0) {
            // 왼쪽 스와이프: 메뉴 닫기
            if (this.menuOpen) {
              this.toggleMobileMenu(false);
            }
          } else {
            // 오른쪽 스와이프: 메뉴 열기 (화면 왼쪽 끝에서만)
            if (!this.menuOpen && this.touchStartX < 50) {
              this.toggleMobileMenu(true);
            }
          }
        }
        
        this.touchStartY = 0;
        this.touchStartX = 0;
      }, { passive: true });
    }

    setupViewportHandler() {
      // 뷰포트 변화 감지 (회전 등)
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 768;
        
        if (!this.isMobile && this.menuOpen) {
          this.toggleMobileMenu(false);
        }
      });

      // iOS Safari 주소창 숨김 대응
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        this.handleIOSViewport();
      }
    }

    handleIOSViewport() {
      // iOS에서 주소창이 숨겨질 때 화면 높이 변화 대응
      let initialViewportHeight = window.innerHeight;
      
      window.addEventListener('resize', () => {
        const currentHeight = window.innerHeight;
        const heightDiff = initialViewportHeight - currentHeight;
        
        // 주소창 숨김/표시로 인한 높이 변화 감지
        if (Math.abs(heightDiff) > 60) {
          document.documentElement.style.setProperty(
            '--viewport-height', 
            `${currentHeight}px`
          );
        }
      });
    }

    enhanceExistingButtons() {
      // 기존 버튼들의 터치 반응성 개선
      const buttons = document.querySelectorAll('.btn, .button, button');
      
      buttons.forEach(button => {
        if (!button.classList.contains('touch-optimized')) {
          button.classList.add('touch-optimized');
          
          // 리플 효과 추가
          button.addEventListener('click', this.createRippleEffect);
        }
      });
    }

    createRippleEffect = (e) => {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      button.appendChild(ripple);
      
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    }
  }

  // CSS 스타일 추가
  const style = document.createElement('style');
  style.textContent = `
    /* 모바일 햄버거 메뉴 */
    .mobile-menu-toggle {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 44px;
      height: 44px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      position: relative;
      z-index: 1001;
    }

    .hamburger-line {
      width: 24px;
      height: 3px;
      background: var(--text-primary, #333);
      margin: 2px 0;
      transition: all 0.3s ease;
      border-radius: 2px;
    }

    .mobile-menu-toggle.active .hamburger-line:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }

    .mobile-menu-toggle.active .hamburger-line:nth-child(2) {
      opacity: 0;
    }

    .mobile-menu-toggle.active .hamburger-line:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -6px);
    }

    /* 모바일 메뉴 오버레이 */
    .mobile-menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .mobile-menu-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .mobile-menu-content {
      position: absolute;
      top: 0;
      right: 0;
      width: 280px;
      height: 100%;
      background: var(--bg-primary, #fff);
      padding: 20px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
      overflow-y: auto;
    }

    .mobile-menu-overlay.active .mobile-menu-content {
      transform: translateX(0);
    }

    .mobile-menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 1px solid var(--border-color, #eee);
    }

    .mobile-menu-header h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary, #333);
    }

    .mobile-menu-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--text-secondary, #666);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s ease;
    }

    .mobile-menu-close:hover {
      background: var(--bg-secondary, #f5f5f5);
    }

    .mobile-menu-nav {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mobile-menu-link {
      display: flex;
      align-items: center;
      padding: 16px 12px;
      text-decoration: none;
      color: var(--text-primary, #333);
      font-size: 1.1rem;
      border-radius: 8px;
      transition: all 0.2s ease;
      min-height: 44px;
    }

    .mobile-menu-link:hover {
      background: var(--bg-secondary, #f5f5f5);
      color: var(--color-primary, #5c5ce0);
    }

    .mobile-menu-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color, #eee);
      text-align: center;
    }

    .mobile-menu-footer p {
      margin: 0;
      color: var(--text-secondary, #666);
      font-size: 0.9rem;
    }

    /* 터치 피드백 */
    .touch-feedback {
      background: var(--bg-secondary, #f0f0f0) !important;
      transform: scale(0.98);
    }

    /* 리플 효과 */
    .ripple-effect {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      pointer-events: none;
      transform: scale(0);
      animation: ripple 0.6s linear;
    }

    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }

    /* 스크롤 방지 */
    body.mobile-menu-open {
      overflow: hidden;
    }

    /* 모바일에서만 표시 */
    @media (max-width: 768px) {
      .mobile-menu-toggle {
        display: flex;
      }
    }

    /* 터치 최적화 */
    .touch-optimized {
      position: relative;
      overflow: hidden;
    }

    /* iOS Safari 주소창 대응 */
    @supports (-webkit-touch-callout: none) {
      .mobile-menu-content {
        height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
      }
    }
  `;
  document.head.appendChild(style);

  // DOM 로드 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new MobileNavigationEnhancer();
    });
  } else {
    new MobileNavigationEnhancer();
  }

  console.log('📱 모바일 네비게이션 향상 모듈 로드됨');
})();