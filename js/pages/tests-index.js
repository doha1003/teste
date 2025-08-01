/**
 * Tests Index Page JavaScript
 * 심리테스트 목록 페이지 기능 구현
 */

(function () {
  'use strict';

  class TestsIndexPage {
    constructor() {
      this.config = {
        animation: {
          fadeDelay: 100,
          observerThreshold: 0.1,
        },
        tests: [
          {
            id: 'teto-egen',
            name: '테토-에겐 테스트',
            icon: '🦋',
            url: '/tests/teto-egen/',
            description: '당신의 성격이 테토형인지 에겐형인지 알아보는 독특한 성격 분석 테스트',
            duration: '5분',
            questions: '10문항',
            badge: '인기',
            popularity: 98,
          },
          {
            id: 'mbti',
            name: 'MBTI 성격유형 검사',
            icon: '🎭',
            url: '/tests/mbti/',
            description: '16가지 성격 유형 중 나의 유형을 찾는 과학적인 심리테스트',
            duration: '10분',
            questions: '24문항',
            badge: '정확',
            popularity: 95,
          },
          {
            id: 'love-dna',
            name: '러브 DNA 테스트',
            icon: '💕',
            url: '/tests/love-dna/',
            description: 'L-O-V-E-D 5축 분석으로 나만의 연애 스타일을 발견',
            duration: '8분',
            questions: '25문항',
            badge: 'NEW',
            popularity: 93,
          },
        ],
        stats: {
          totalTests: '100만+',
          satisfaction: '98%',
          testCount: '3개',
          price: '무료',
        },
      };

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
      this.initTestCards();
      this.initStatsAnimation();
      this.loadTestStatistics();
    }

    /**
     * 페이지 로드 완료시 실행
     */
    onPageLoad() {
      this.initAdSense();
      this.initKakaoSDK();
      this.trackPageView();
    }

    /**
     * 스크롤 애니메이션 초기화
     */
    initScrollAnimations() {
      const animatedElements = document.querySelectorAll('.fade-in');

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
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
     * 테스트 카드 초기화
     */
    initTestCards() {
      const testCards = document.querySelectorAll('.test-card');

      testCards.forEach((card, index) => {
        // 호버 효과 강화
        card.addEventListener('mouseenter', (e) => {
          this.handleCardHover(e.currentTarget, true);
        });

        card.addEventListener('mouseleave', (e) => {
          this.handleCardHover(e.currentTarget, false);
        });

        // 클릭 추적
        card.addEventListener('click', () => {
          const testId = card.dataset.test;
          this.trackTestClick(testId);
        });

        // 순차적 애니메이션
        setTimeout(() => {
          card.classList.add('animated');
        }, index * this.config.animation.fadeDelay);
      });
    }

    /**
     * 카드 호버 효과
     */
    handleCardHover(card, isHovering) {
      const icon = card.querySelector('.test-icon');
      const button = card.querySelector('.test-button');

      if (icon) {
        if (isHovering) {
          icon.style.transform = 'scale(1.1) rotate(5deg)';
        } else {
          icon.style.transform = 'scale(1) rotate(0deg)';
        }
      }

      if (button) {
        if (isHovering) {
          button.style.transform = 'translateX(5px)';
        } else {
          button.style.transform = 'translateX(0)';
        }
      }
    }

    /**
     * 통계 애니메이션 초기화
     */
    initStatsAnimation() {
      const statNumbers = document.querySelectorAll('.stat-number');

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                this.animateStatNumber(entry.target);
                observer.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.5,
          }
        );

        statNumbers.forEach((stat) => observer.observe(stat));
      }
    }

    /**
     * 통계 숫자 애니메이션
     */
    animateStatNumber(element) {
      const text = element.textContent;
      const hasPlus = text.includes('+');
      const hasPercent = text.includes('%');
      const number = parseInt(text.replace(/[^0-9]/g, ''));

      if (isNaN(number)) {
        return;
      }

      let current = 0;
      const increment = number / 30;
      const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
          current = number;
          clearInterval(timer);
        }

        let display = Math.floor(current).toString();
        if (hasPlus) {
          display += '+';
        }
        if (hasPercent) {
          display += '%';
        }
        if (text.includes('개')) {
          display += '개';
        }
        if (text.includes('무료')) {
          display = '무료';
        }

        element.textContent = display;
      }, 50);
    }

    /**
     * 테스트 통계 로드
     */
    loadTestStatistics() {
      // 로컬 스토리지에서 테스트 참여 횟수 가져오기
      const stats = this.getLocalStats();

      // 테스트별 인기도 표시
      this.config.tests.forEach((test) => {
        const card = document.querySelector(`[data-test="${test.id}"]`);
        if (card && stats[test.id]) {
          this.updateTestPopularity(card, stats[test.id]);
        }
      });
    }

    /**
     * 로컬 통계 가져오기
     */
    getLocalStats() {
      try {
        const stats = localStorage.getItem('testStats');
        return stats ? JSON.parse(stats) : {};
      } catch (e) {
        return {};
      }
    }

    /**
     * 테스트 인기도 업데이트
     */
    updateTestPopularity(card, count) {
      const badge = card.querySelector('.test-stat:last-child');
      if (badge && count > 10) {
        badge.textContent = '🔥 인기';
      }
    }

    /**
     * 테스트 클릭 추적
     */
    trackTestClick(testId) {
      const test = this.config.tests.find((t) => t.id === testId);
      if (!test) {
        return;
      }

      // 로컬 통계 업데이트
      const stats = this.getLocalStats();
      stats[testId] = (stats[testId] || 0) + 1;
      try {
        localStorage.setItem('testStats', JSON.stringify(stats));
      } catch (e) {
        
      }

      // 이벤트 추적
      this.trackEvent('test_click', {
        test_id: testId,
        test_name: test.name,
        test_url: test.url,
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

      setTimeout(() => this.loadAds(), 1000);
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

      if (!window.API_CONFIG || !window.API_CONFIG.KAKAO_JS_KEY) {
        
        return;
      }

      if (!Kakao.isInitialized()) {
        try {
          Kakao.init(window.API_CONFIG.KAKAO_JS_KEY);
          
        } catch (e) {
          
        }
      }
    }

    /**
     * 페이지뷰 추적
     */
    trackPageView() {
      this.trackEvent('page_view', {
        page_type: 'tests_index',
        page_url: window.location.pathname,
      });
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

  // 전역 인스턴스 생성
  window.testsIndexPage = new TestsIndexPage();
})();
