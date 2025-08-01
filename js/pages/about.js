/**
 * About Page JavaScript
 * 소개 페이지 기능 구현
 */

(function () {
  'use strict';

  class AboutPage {
    constructor() {
      this.config = {
        animation: {
          fadeDelay: 100,
          observerThreshold: 0.1,
        },
        sections: ['mission', 'services', 'values', 'vision'],
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
      this.initSectionObserver();
      this.initCTAInteractions();
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
     * 섹션 관찰자 초기화
     */
    initSectionObserver() {
      const sections = document.querySelectorAll('.section[data-section]');

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const sectionName = entry.target.dataset.section;
                this.trackSectionView(sectionName);
                observer.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.5,
          }
        );

        sections.forEach((section) => observer.observe(section));
      }
    }

    /**
     * CTA 상호작용 초기화
     */
    initCTAInteractions() {
      // 문의하기 링크 추적
      const contactLink = document.querySelector('.link-primary');
      if (contactLink) {
        contactLink.addEventListener('click', () => {
          this.trackEvent('cta_click', {
            cta_type: 'contact_link',
            from_page: 'about',
          });
        });
      }

      // 가치 카드 호버 효과
      const valueCards = document.querySelectorAll('.value-showcase-card');
      valueCards.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-4px)';
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
        });

        // 순차적 애니메이션
        setTimeout(() => {
          card.classList.add('animated');
        }, index * this.config.animation.fadeDelay);
      });
    }

    /**
     * 섹션 조회 추적
     */
    trackSectionView(sectionName) {
      this.trackEvent('section_view', {
        section_name: sectionName,
        page_type: 'about',
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
        ins.style.minHeight = '90px';
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
        page_type: 'about',
        page_url: window.location.pathname,
        content_type: 'information',
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
  window.aboutPage = new AboutPage();
})();
