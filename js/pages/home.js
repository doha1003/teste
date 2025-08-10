/**
 * Home Page JavaScript
 * 메인 홈페이지 기능 구현 - 모듈화된 구조
 */

import { installApp, isPWAInstalled } from '../core/pwa-helpers.js';

class HomePage {
  constructor() {
    this.config = {
      tabs: {
        activeClass: 'dh-state-active',
        defaultTab: 'all',
      },
      animation: {
        countDuration: 2000,
        countSteps: 30,
        fadeDelay: 50,
      },
      ads: {
        loadDelay: 1000,
        retryDelay: 500,
        maxRetries: 5,
      },
    };

    // 서비스 데이터
    // PWA 설치 프롬프트
    this.pwaPrompt = {
      element: null,
      installButton: null,
      closeButton: null,
      isVisible: false,
    };

    this.services = [
      {
        name: '테토-에겐 테스트',
        desc: '당신의 성격이 테토형인지 에겐형인지 알아보세요',
        emoji: '🦋',
        url: '/tests/teto-egen/',
        category: 'tests',
        badge: 'HOT',
        badgeClass: '',
      },
      {
        name: 'MBTI 성격유형 검사',
        desc: '16가지 성격 유형 중 나는 어떤 유형일까?',
        emoji: '🎭',
        url: '/tests/mbti/',
        category: 'tests',
        badge: '인기',
        badgeClass: '',
      },
      {
        name: '글자수 세기',
        desc: '자소서, 리포트 작성 시 필수! 글자수를 확인하세요',
        emoji: '📝',
        url: '/tools/text-counter.html',
        category: 'tools',
        badge: '',
        badgeClass: '',
      },
      {
        name: '연봉 실수령액 계산기',
        desc: '세금 공제 후 실제 받는 금액을 계산해보세요',
        emoji: '💰',
        url: '/tools/salary-calculator.html',
        category: 'tools',
        badge: 'NEW',
        badgeClass: 'new-green',
      },
      {
        name: '러브 DNA 테스트',
        desc: '당신만의 연애 스타일을 5축 DNA로 분석해보세요',
        emoji: '💕',
        url: '/tests/love-dna/',
        category: 'tests',
        badge: 'NEW',
        badgeClass: 'new-pink',
      },
      {
        name: 'BMI 계산기',
        desc: '키와 몸무게로 체질량지수를 확인하세요',
        emoji: '🏃',
        url: '/tools/bmi-calculator.html',
        category: 'tools',
        badge: 'NEW',
        badgeClass: 'new-green',
      },
      {
        name: '오늘의 운세',
        desc: 'AI가 분석하는 개인 맞춤형 상세 운세를 확인하세요',
        emoji: '🔮',
        url: '/fortune/daily/',
        category: 'fortune',
        badge: 'HOT',
        badgeClass: 'fortune-gradient',
      },
      {
        name: 'AI 사주팔자',
        desc: '생년월일시로 AI가 분석하는 상세한 사주팔자 풀이',
        emoji: '🎴',
        url: '/fortune/saju/',
        category: 'fortune',
        badge: '인기',
        badgeClass: 'fortune-gradient',
      },
      {
        name: '별자리 운세',
        desc: '12궁도 별자리별 오늘의 상세 운세를 확인하세요',
        emoji: '♈',
        url: '/fortune/zodiac/',
        category: 'fortune',
        badge: '인기',
        badgeClass: 'fortune-gradient',
      },
      {
        name: 'AI 타로 리딩',
        desc: '질문을 입력하면 AI가 타로카드로 답을 찾아드려요',
        emoji: '🃏',
        url: '/fortune/tarot/',
        category: 'fortune',
        badge: 'NEW',
        badgeClass: 'fortune-gradient',
      },
      {
        name: '띠별 운세',
        desc: '12간지 띠별 상세한 오늘의 운세를 확인하세요',
        emoji: '🐲',
        url: '/fortune/zodiac-animal/',
        category: 'fortune new',
        badge: 'NEW',
        badgeClass: 'fortune-gradient',
      },
    ];

    this.init();
  }

  /**
   * 초기화
   */
  init() {
    // DOM이 준비되면 실행
    if (document.readyState === 'dh-u-loading') {
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
    this.initServiceTabs();
    this.initServiceCounter();
    this.initScrollAnimations();
    this.initHeroButtons();
    this.initPWAPrompt();
  }

  /**
   * 페이지 로드 완료시 실행
   */
  onPageLoad() {
    this.initAdSense();
    this.initKakaoSDK();
    this.trackPerformance();
  }

  /**
   * 서비스 카드 생성
   */
  createServiceCard(service) {
    const badgeHtml = service.badge
      ? `<span class="service-badge ${service.badgeClass}">${service.badge}</span>`
      : '';

    return `
                <a href="${service.url}" class="service-card" data-category="${service.category}">
                    <span class="service-emoji">${service.emoji}</span>
                    <h3 class="service-name">${service.name}</h3>
                    <p class="service-desc">${service.desc}</p>
                    ${badgeHtml}
                </a>
            `;
  }

  /**
   * 서비스 목록 렌더링
   */
  renderServices(category = 'all') {
    const grid = document.getElementById('services-grid');
    if (!grid) {
      return;
    }

    const filteredServices =
      category === 'all' ? this.services : this.services.filter((s) => s.category === category);

    grid.innerHTML = filteredServices.map((service) => this.createServiceCard(service)).join('');

    // 애니메이션 재적용
    const cards = grid.querySelectorAll('.service-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'all 0.3s ease-out';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * this.config.animation.fadeDelay);
    });
  }

  /**
   * 서비스 탭 초기화
   */
  initServiceTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');

    tabButtons.forEach((button) => {
      button.addEventListener('click', function () {
        // 활성 탭 변경
        // 활성 탭 업데이트
        tabButtons.forEach((btn) => btn.classList.remove('dh-state-active'));
        this.classList.add('dh-state-active');

        // 서비스 필터링
        const tab = this.getAttribute('data-tab') || this.dataset.category;
        window.homePage.showServices(tab);
      });
    });
  }

  /**
   * 카운터 애니메이션
   */
  animateCounter(element, start, end, duration) {
    const steps = this.config.animation.countSteps;
    const stepDuration = duration / steps;
    const increment = (end - start) / steps;

    let current = start;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;

      if (step >= steps) {
        current = end;
        clearInterval(timer);
      }

      element.textContent = `${Math.round(current)}개`;
    }, stepDuration);
  }

  /**
   * 서비스 카운터 초기화
   */
  initServiceCounter() {
    const counters = document.querySelectorAll('[data-count]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            const target = parseInt(entry.target.dataset.count) || this.services.length;
            this.animateCounter(entry.target, 0, target, this.config.animation.countDuration);
            entry.target.classList.add('counted');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    // 기본 카운터 처리
    const serviceCountEl = document.getElementById('service-count');
    if (serviceCountEl && !serviceCountEl.classList.contains('counted')) {
      const activeServices = document.querySelectorAll('.service-card:not(.disabled)').length;
      this.animateCounter(serviceCountEl, 0, activeServices, this.config.animation.countDuration);
      serviceCountEl.classList.add('counted');
    }

    counters.forEach((counter) => observer.observe(counter));
  }

  /**
   * 스크롤 애니메이션 초기화
   */
  initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('dh-u-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    animatedElements.forEach((element) => observer.observe(element));
  }

  /**
   * 서비스 필터링 표시
   */
  showServices(category) {
    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach((card) => {
      if (category === 'all') {
        card.style.display = '';
      } else {
        const cardCategories = card.dataset.category.split(' ');
        if (cardCategories.includes(category)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      }
    });

    // 그리드 애니메이션 재시작
    const grid = document.querySelector('.services-grid');
    if (grid) {
      grid.classList.remove('animated');
      void grid.offsetWidth; // 리플로우 강제
      grid.classList.add('animated');
    }
  }

  /**
   * 히어로 버튼 초기화
   */
  initHeroButtons() {
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');

    heroButtons.forEach((button) => {
      button.addEventListener('click', (_e) => {
        const { category } = button.dataset;
        if (category) {
          // 카테고리 추적
          this.trackEvent('hero_button_click', {
            category,
          });
        }
      });
    });
  }

  /**
   * AdSense 초기화
   */
  initAdSense() {
    if (window.__adsenseInitialized) {
      return;
    }
    window.__adsenseInitialized = true;

    // 광고 로드
    setTimeout(() => this.loadAds(), this.config.ads.loadDelay);
  }

  /**
   * 광고 로드
   */
  loadAds() {
    const adContainers = document.querySelectorAll('[data-ad-slot]');

    adContainers.forEach((container) => {
      if (container.querySelector('.adsbygoogle')) {
        return;
      }

      const { adSlot } = container.dataset;
      const ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.setAttribute('data-ad-client', 'ca-pub-7905640648499222');
      ins.setAttribute('data-ad-slot', adSlot);
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');

      container.innerHTML = '';
      container.appendChild(ins);

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Error handled - see console for details
        // Error handled - development logging only
        if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
          console.warn('Caught error:', e);
        }
      }
    });
  }

  /**
   * 카카오 SDK 초기화
   */
  initKakaoSDK() {
    if (typeof Kakao === 'undefined') {
      return;
    }

    // API 키 확인
    if (!window.API_CONFIG || !window.API_CONFIG.KAKAO_JS_KEY) {
      return;
    }

    // 초기화
    if (!Kakao.isInitialized()) {
      try {
        Kakao.init(window.API_CONFIG.KAKAO_JS_KEY);
      } catch (e) {
        // Error handled - see console for details
        // Error handled - development logging only
        if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
          console.warn('Caught error:', e);
        }
      }
    }
  }

  /**
   * 성능 추적
   */
  trackPerformance() {
    if (!window.performance || !window.performance.timing) {
      return;
    }

    const { timing } = window.performance;
    const loadTime = timing.loadEventEnd - timing.navigationStart;

    if (loadTime > 5000) {
      // 로딩 시간이 5초 이상인 경우 성능 경고
      // Performance warning - development only
      if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
        console.warn('Page load time exceeded 5 seconds:', loadTime);
      }
    }
  }

  /**
   * PWA 설치 프롬프트 초기화
   */
  initPWAPrompt() {
    this.pwaPrompt.element = document.getElementById('pwa-install-prompt');
    this.pwaPrompt.installButton = document.getElementById('pwa-install-btn');
    this.pwaPrompt.closeButton = document.getElementById('pwa-close-btn');

    if (!this.pwaPrompt.element) {
      return;
    }

    // 이벤트 리스너 설정
    this.setupPWAEventListeners();

    // 초기 상태 확인
    this.checkPWAInstallAvailability();
  }

  /**
   * PWA 이벤트 리스너 설정
   */
  setupPWAEventListeners() {
    // 설치 버튼 클릭
    this.pwaPrompt.installButton?.addEventListener('click', () => {
      this.handlePWAInstall();
    });

    // 닫기 버튼 클릭
    this.pwaPrompt.closeButton?.addEventListener('click', () => {
      this.hidePWAPrompt();
      sessionStorage.setItem('pwa-prompt-dismissed', 'true');
      this.trackEvent('pwa_prompt_dismissed', { source: 'home_page' });
    });

    // PWA 이벤트
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      this.updatePWAInstallButton();
      this.showPWAPrompt();
      this.trackEvent('pwa_prompt_available', { source: 'home_page' });
    });

    window.addEventListener('appinstalled', () => {
      this.updatePWAInstallButton();
      this.hidePWAPrompt();
      this.showPWAInstallSuccessNotification();
      this.trackEvent('pwa_installed', { source: 'home_page' });
    });
  }

  /**
   * PWA 설치 가능 여부 확인
   */
  checkPWAInstallAvailability() {
    const isDismissed = sessionStorage.getItem('pwa-prompt-dismissed');
    const isInstalled = isPWAInstalled();

    // 이미 설치되었거나 사용자가 거부한 경우
    if (isDismissed || isInstalled) {
      this.hidePWAPrompt();
      return;
    }

    // 버튼 상태 업데이트
    this.updatePWAInstallButton();

    // 5초 후 프롬프트 표시
    setTimeout(() => {
      if (!isPWAInstalled() && !sessionStorage.getItem('pwa-prompt-dismissed')) {
        this.showPWAPrompt();
      }
    }, 5000);
  }

  /**
   * PWA 프롬프트 표시
   */
  showPWAPrompt() {
    if (!this.pwaPrompt.element || this.pwaPrompt.isVisible || isPWAInstalled()) {
      return;
    }

    this.pwaPrompt.element.style.display = 'block';

    // 애니메이션을 위한 지연
    requestAnimationFrame(() => {
      this.pwaPrompt.element.style.opacity = '1';
      this.pwaPrompt.element.style.transform = 'translateY(0)';
      this.pwaPrompt.isVisible = true;
    });

    this.trackEvent('pwa_prompt_shown', { source: 'home_page' });
  }

  /**
   * PWA 프롬프트 숨기기
   */
  hidePWAPrompt() {
    if (!this.pwaPrompt.element || !this.pwaPrompt.isVisible) {
      return;
    }

    this.pwaPrompt.element.style.opacity = '0';
    this.pwaPrompt.element.style.transform = 'translateY(-10px)';

    setTimeout(() => {
      this.pwaPrompt.element.style.display = 'none';
      this.pwaPrompt.isVisible = false;
    }, 300);
  }

  /**
   * PWA 설치 버튼 상태 업데이트
   */
  updatePWAInstallButton() {
    if (!this.pwaPrompt.installButton) {
      return;
    }

    const isInstalled = isPWAInstalled();
    const hasPrompt = !!window.deferredPrompt;
    const buttonIcon = this.pwaPrompt.installButton.querySelector('.btn-icon');
    const buttonText = this.pwaPrompt.installButton.querySelector('.btn-text');

    // 버튼 요소가 없는 경우 안전하게 처리
    if (!buttonIcon || !buttonText) {
      return;
    }

    if (isInstalled) {
      this.pwaPrompt.installButton.disabled = true;
      this.pwaPrompt.installButton.className =
        'dh-c-btn btn--primary pwa-install-dh-c-button installed';
      buttonIcon.textContent = '✅';
      buttonText.textContent = '설치 완료';
    } else if (hasPrompt) {
      this.pwaPrompt.installButton.disabled = false;
      this.pwaPrompt.installButton.className =
        'dh-c-btn btn--primary pwa-install-dh-c-button ready';
      buttonIcon.textContent = '📲';
      buttonText.textContent = '지금 설치';
    } else {
      this.pwaPrompt.installButton.disabled = true;
      this.pwaPrompt.installButton.className = 'dh-c-btn btn--primary pwa-install-dh-c-button';
      buttonIcon.textContent = '⏳';
      buttonText.textContent = '설치 준비 중...';
    }
  }

  /**
   * PWA 설치 처리
   */
  async handlePWAInstall() {
    if (!window.deferredPrompt || isPWAInstalled()) {
      return;
    }

    try {
      this.trackEvent('pwa_install_clicked', { source: 'home_page' });

      const result = await installApp();

      if (result) {
        this.hidePWAPrompt();
        this.trackEvent('pwa_install_success', { source: 'home_page' });
      } else {
        this.showManualInstallGuide();
        this.trackEvent('pwa_install_failed', { source: 'home_page' });
      }
    } catch (error) {
      console.error('PWA install error:', error);
      this.showManualInstallGuide();
      this.trackEvent('pwa_install_error', {
        source: 'home_page',
        error: error.message,
      });
    }
  }

  /**
   * PWA 설치 성공 알림 표시
   */
  showPWAInstallSuccessNotification() {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 2px solid #10b981;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(16, 185, 129, 0.2);
        padding: 1rem 1.5rem;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 320px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      ">
        <span style="font-size: 1.5rem;">🎉</span>
        <div>
          <strong style="color: #065f46; display: block; margin-bottom: 0.25rem;">설치 완료!</strong>
          <p style="margin: 0; color: #10b981; font-size: 0.9rem;">홈 화면에서 doha.kr 앱을 확인하세요.</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // 애니메이션
    requestAnimationFrame(() => {
      notification.firstElementChild.style.transform = 'translateX(0)';
    });

    // 5초 후 제거
    setTimeout(() => {
      notification.firstElementChild.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 5000);
  }

  /**
   * 수동 설치 안내 표시
   */
  showManualInstallGuide() {
    const toast = document.createElement('div');
    toast.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #1f2937;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        max-width: 90%;
        text-align: center;
        font-size: 0.9rem;
        line-height: 1.4;
      ">
        브라우저 메뉴에서 '홈 화면에 추가' 또는 '앱 설치'를 선택하세요 📱
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 4000);
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
      console.log(`Event: ${eventName}`, eventData); // eslint-disable-line no-console
    }
  }
}

// 모듈 export
export const homePage = new HomePage();

// 전역에도 연결 (레거시 코드 호환성)
window.homePage = homePage;
