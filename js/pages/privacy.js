/**
 * Privacy Policy Page JavaScript
 * 개인정보처리방침 페이지 기능 구현
 */

(function () {
  'use strict';

  class PrivacyPage {
    constructor() {
      this.config = {
        animation: {
          fadeDelay: 100,
          observerThreshold: 0.1,
        },
        smoothScroll: {
          duration: 800,
          offset: 80, // 헤더 높이 고려
        },
        analytics: {
          sectionViewThreshold: 0.5,
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
      this.initTOCNavigation();
      this.initSectionObserver();
      this.highlightCurrentSection();
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
     * 목차 네비게이션 초기화
     */
    initTOCNavigation() {
      const tocLinks = document.querySelectorAll('.toc-link');

      tocLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();

          const targetId = link.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            this.smoothScrollTo(targetElement);

            // TOC 클릭 추적
            this.trackEvent('toc_click', {
              section_id: targetId,
              section_title: link.textContent.trim(),
            });
          }
        });
      });
    }

    /**
     * 부드러운 스크롤
     */
    smoothScrollTo(target) {
      const startPosition = window.pageYOffset;
      const targetPosition =
        target.getBoundingClientRect().top + window.pageYOffset - this.config.smoothScroll.offset;
      const distance = targetPosition - startPosition;
      const { duration } = this.config.smoothScroll;
      let start = null;

      const step = (timestamp) => {
        if (!start) {
          start = timestamp;
        }
        const progress = timestamp - start;
        const percentage = Math.min(progress / duration, 1);

        // Easing function (easeInOutCubic)
        const easing =
          percentage < 0.5
            ? 4 * percentage * percentage * percentage
            : 1 - Math.pow(-2 * percentage + 2, 3) / 2;

        window.scrollTo(0, startPosition + distance * easing);

        if (progress < duration) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    }

    /**
     * 현재 섹션 하이라이트
     */
    highlightCurrentSection() {
      const sections = document.querySelectorAll('.policy-section[id]');
      const tocLinks = document.querySelectorAll('.toc-link');

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const sectionId = entry.target.id;

                // 모든 링크에서 active 클래스 제거
                tocLinks.forEach((link) => link.classList.remove('active'));

                // 현재 섹션 링크에 active 클래스 추가
                const activeLink = document.querySelector(`.toc-link[href="#${sectionId}"]`);
                if (activeLink) {
                  activeLink.classList.add('active');
                }
              }
            });
          },
          {
            threshold: 0.5,
            rootMargin: '-20% 0px -70% 0px',
          }
        );

        sections.forEach((section) => observer.observe(section));
      }
    }

    /**
     * 섹션 관찰자 초기화
     */
    initSectionObserver() {
      const sections = document.querySelectorAll('.policy-section[data-section]');

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
            threshold: this.config.analytics.sectionViewThreshold,
          }
        );

        sections.forEach((section) => observer.observe(section));
      }
    }

    /**
     * 섹션 조회 추적
     */
    trackSectionView(sectionName) {
      this.trackEvent('section_view', {
        section_name: sectionName,
        page_type: 'privacy',
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
          // Error handling - see console
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
          // Error handling - see console
        }
      }
    }

    /**
     * 페이지뷰 추적
     */
    trackPageView() {
      this.trackEvent('page_view', {
        page_type: 'privacy',
        page_url: window.location.pathname,
        content_type: 'legal',
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
        console.log('Development mode'); // eslint-disable-line no-console
      }
    }
  }

  // 전역 인스턴스 생성
  window.privacyPage = new PrivacyPage();
})();
