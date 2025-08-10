/**
 * MBTI Introduction Page JavaScript
 * MBTI 성격유형 검사 소개 페이지 기능 구현
 */

(function () {
  'use strict';

  class MBTIIntroPage {
    constructor() {
      this.config = {
        animation: {
          fadeDelay: 200,
          observerThreshold: 0.1,
          typeCardDelay: 100,
        },
        analytics: {
          trackClicks: true,
          trackTypeViews: true,
          trackFAQ: true,
        },
      };

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
      this.initScrollAnimations();
      this.initFAQ();
      this.initTypeCards();
      this.initCTAButtons();
      this.initSectionObserver();
    }

    /**
     * 페이지 로드 완료시 실행
     */
    onPageLoad() {
      this.initAdSense();
      this.initKakaoSDK();
      this.trackPageView();
      this.initTypeAnimations();
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
                  entry.target.classList.add('dh-u-visible');
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
        animatedElements.forEach((el) => el.classList.add('dh-u-visible'));
      }
    }

    /**
     * FAQ 기능 초기화
     */
    initFAQ() {
      const faqQuestions = document.querySelectorAll('.faq-question');

      faqQuestions.forEach((question) => {
        question.addEventListener('click', () => {
          const faqItem = question.parentElement;
          const wasActive = faqItem.classList.contains('dh-state-active');

          // 다른 FAQ 항목들 닫기
          document.querySelectorAll('.faq-item.active').forEach((item) => {
            if (item !== faqItem) {
              item.classList.remove('dh-state-active');
            }
          });

          // 현재 항목 토글
          if (wasActive) {
            faqItem.classList.remove('dh-state-active');
          } else {
            faqItem.classList.add('dh-state-active');
          }

          // FAQ 클릭 추적
          if (this.config.analytics.trackFAQ) {
            const faqId = faqItem.dataset.faq;
            this.trackEvent('faq_click', {
              faq_id: faqId,
              action: wasActive ? 'close' : 'open',
              page_type: 'mbti_intro',
            });
          }
        });
      });
    }

    /**
     * 성격 유형 카드 초기화
     */
    initTypeCards() {
      const typeCards = document.querySelectorAll('.type-card[data-type]');

      typeCards.forEach((card) => {
        // 카드 호버 효과
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-4px)';
          card.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
          card.style.boxShadow = '';
        });

        // 카드 클릭 시 상세 정보 모달이나 페이지로 이동
        card.addEventListener('click', () => {
          const mbtiType = card.dataset.type;

          // 유형 카드 클릭 추적
          if (this.config.analytics.trackClicks) {
            this.trackEvent('type_card_click', {
              mbti_type: mbtiType,
              page_type: 'mbti_intro',
            });
          }

          // 클릭 애니메이션
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.transform = 'translateY(-4px)';
          }, 150);

          // 향후 상세 페이지 구현시 이동
          // console.log(`Type ${mbtiType} clicked`);
        });
      });
    }

    /**
     * CTA 버튼 초기화
     */
    initCTAButtons() {
      const ctaButtons = document.querySelectorAll('[data-action]');

      ctaButtons.forEach((button) => {
        button.addEventListener('click', (_e) => {
          const { action } = button.dataset;

          // 버튼 클릭 애니메이션
          button.style.transform = 'scale(0.95)';
          setTimeout(() => {
            button.style.transform = '';
          }, 150);

          // CTA 클릭 추적
          if (this.config.analytics.trackClicks) {
            this.trackEvent('cta_click', {
              action,
              button_text: button.textContent.trim(),
              section: this.getButtonSection(button),
              page_type: 'mbti_intro',
            });
          }
        });
      });
    }

    /**
     * 버튼이 속한 섹션 확인
     */
    getButtonSection(button) {
      const dh-l-section = button.closest('section');
      if (section) {
        if (section.classList.contains('hero')) {
          return 'hero';
        }
        if (section.classList.contains('cta')) {
          return 'cta';
        }
      }
      return 'unknown';
    }

    /**
     * 섹션 관찰자 초기화
     */
    initSectionObserver() {
      const sections = document.querySelectorAll('section[class]');

      if ('IntersectionObserver' in window && this.config.analytics.trackTypeViews) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const sectionClass = Array.from(entry.target.classList)[0];
                this.trackSectionView(sectionClass);
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
     * 유형 카드 애니메이션 초기화
     */
    initTypeAnimations() {
      const typeCards = document.querySelectorAll('.type-card');

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry, index) => {
              if (entry.isIntersecting) {
                setTimeout(() => {
                  entry.target.style.opacity = '1';
                  entry.target.style.transform = 'translateY(0)';
                }, index * this.config.animation.typeCardDelay);
                observer.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.3,
          }
        );

        // 초기 스타일 설정
        typeCards.forEach((card) => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });

        typeCards.forEach((card) => observer.observe(card));
      }
    }

    /**
     * 섹션 조회 추적
     */
    trackSectionView(sectionName) {
      this.trackEvent('section_view', {
        section_name: sectionName,
        page_type: 'mbti_intro',
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
        page_type: 'mbti_intro',
        page_url: window.location.pathname,
        content_type: 'test_introduction',
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
  window.mbtiIntroPage = new MBTIIntroPage();
})();
