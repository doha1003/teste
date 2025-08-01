/**
 * Home Page JavaScript
 * 메인 홈페이지 기능 구현 - 모듈화된 구조
 */

class HomePage {
  constructor() {
    this.config = {
      tabs: {
        activeClass: 'active',
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
    this.initServiceTabs();
    this.initServiceCounter();
    this.initScrollAnimations();
    this.initHeroButtons();
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
        tabButtons.forEach((btn) => btn.classList.remove('active'));
        this.classList.add('active');

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
            entry.target.classList.add('visible');
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
    }
  }
}

// 모듈 export
export const homePage = new HomePage();

// 전역에도 연결 (레거시 코드 호환성)
window.homePage = homePage;
