/**
 * Tools Index Page JavaScript
 * 실용도구 목록 페이지 기능 구현
 */

(function () {
  'use strict';

  class ToolsIndexPage {
    constructor() {
      this.config = {
        animation: {
          fadeDelay: 100,
          observerThreshold: 0.1,
        },
        tools: [
          {
            id: 'salary',
            name: '연봉 실수령액 계산기',
            icon: '💰',
            url: '/tools/salary-calculator.html',
            description: '2025년 최신 세율과 4대보험료 적용',
            features: ['2025년 세율', '4대보험료', '상세 분석'],
            status: 'active',
            usage: 0,
          },
          {
            id: 'text-counter',
            name: '텍스트 글자수 세기',
            icon: '📝',
            url: '/tools/text-counter.html',
            description: '실시간 글자수, 단어수, 문단수 계산',
            features: ['실시간 계산', '텍스트 저장', '빠른 처리'],
            status: 'active',
            usage: 0,
          },
          {
            id: 'bmi',
            name: 'BMI 계산기',
            icon: '⚖️',
            url: '/tools/bmi-calculator.html',
            description: 'WHO 아시아-태평양 기준 BMI 계산',
            features: ['BMI 지수', '건강 조언', '모바일 최적화'],
            status: 'active',
            usage: 0,
          },
          {
            id: 'password-generator',
            name: '비밀번호 생성기',
            icon: '🔐',
            description: '안전한 비밀번호 자동 생성',
            features: ['보안', '랜덤 생성', '옵션 설정'],
            status: 'coming-soon',
          },
          {
            id: 'color-palette',
            name: '색상 팔레트',
            icon: '🎨',
            description: '색상 코드 찾기 및 복사',
            features: ['다양한 색상', '코드 복사', '미리보기'],
            status: 'coming-soon',
          },
          {
            id: 'qr-generator',
            name: 'QR코드 생성기',
            icon: '📱',
            description: 'URL을 QR코드로 변환',
            features: ['이미지 다운로드', 'URL 변환', '즉시 생성'],
            status: 'coming-soon',
          },
        ],
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
      this.initToolCards();
      this.loadToolUsageStats();
      this.initGuideSection();
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
     * 도구 카드 초기화
     */
    initToolCards() {
      const toolCards = document.querySelectorAll('.tool-card');

      toolCards.forEach((card, index) => {
        // 준비중인 카드는 클릭 이벤트 제외
        if (card.classList.contains('coming-soon')) {
          card.addEventListener('click', (e) => {
            e.preventDefault();
            this.showComingSoonMessage();
          });
          return;
        }

        // 호버 효과
        card.addEventListener('mouseenter', (e) => {
          this.handleCardHover(e.currentTarget, true);
        });

        card.addEventListener('mouseleave', (e) => {
          this.handleCardHover(e.currentTarget, false);
        });

        // 클릭 추적
        card.addEventListener('click', () => {
          const toolId = card.dataset.tool;
          this.trackToolClick(toolId);
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
      const icon = card.querySelector('.tool-icon');
      const button = card.querySelector('.tool-button');

      if (icon) {
        if (isHovering) {
          icon.style.transform = 'scale(1.1) rotate(5deg)';
        } else {
          icon.style.transform = 'scale(1) rotate(0deg)';
        }
      }

      if (button && !button.classList.contains('coming-soon')) {
        if (isHovering) {
          button.style.transform = 'translateY(-2px)';
        } else {
          button.style.transform = 'translateY(0)';
        }
      }
    }

    /**
     * 준비중 메시지 표시
     */
    showComingSoonMessage() {
      const message = document.createElement('div');
      message.className = 'coming-soon-message';
      message.textContent = '곧 출시 예정입니다!';
      message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px 40px;
                border-radius: 8px;
                font-size: 1.1rem;
                z-index: 9999;
                animation: fadeInOut 2s ease;
            `;

      document.body.appendChild(message);

      setTimeout(() => {
        message.remove();
      }, 2000);
    }

    /**
     * 도구 사용 통계 로드
     */
    loadToolUsageStats() {
      // 로컬 스토리지에서 사용 통계 가져오기
      const stats = this.getLocalStats();

      // 각 도구별 사용 횟수 표시
      this.config.tools.forEach((tool) => {
        if (tool.status === 'active' && stats[tool.id]) {
          const card = document.querySelector(`[data-tool="${tool.id}"]`);
          if (card) {
            this.updateToolUsageDisplay(card, stats[tool.id]);
          }
        }
      });
    }

    /**
     * 로컬 통계 가져오기
     */
    getLocalStats() {
      try {
        const stats = localStorage.getItem('toolStats');
        return stats ? JSON.parse(stats) : {};
      } catch (e) {
        return {};
      }
    }

    /**
     * 도구 사용 횟수 표시 업데이트
     */
    updateToolUsageDisplay(card, count) {
      if (count > 5) {
        const badge = document.createElement('span');
        badge.className = 'popular-badge';
        badge.textContent = '인기';
        badge.style.cssText = `
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: #ef4444;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                `;
        card.appendChild(badge);
      }
    }

    /**
     * 도구 클릭 추적
     */
    trackToolClick(toolId) {
      const tool = this.config.tools.find((t) => t.id === toolId);
      if (!tool || tool.status !== 'active') {
        return;
      }

      // 로컬 통계 업데이트
      const stats = this.getLocalStats();
      stats[toolId] = (stats[toolId] || 0) + 1;
      try {
        localStorage.setItem('toolStats', JSON.stringify(stats));
      } catch (e) {
        
      }

      // 이벤트 추적
      this.trackEvent('tool_click', {
        tool_id: toolId,
        tool_name: tool.name,
        tool_url: tool.url,
      });
    }

    /**
     * 가이드 섹션 초기화
     */
    initGuideSection() {
      const guideSection = document.querySelector('.tool-guide-container');
      if (!guideSection) {
        return;
      }

      // 가이드 섹션 접기/펼치기 기능 추가 (선택적)
      const title = guideSection.querySelector('.tool-guide-title');
      if (title) {
        title.style.cursor = 'pointer';
        title.addEventListener('click', () => {
          const content = guideSection.querySelector('.tool-guide-content');
          if (content) {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
          }
        });
      }
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
        page_type: 'tools_index',
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
  window.toolsIndexPage = new ToolsIndexPage();

  // Coming soon 메시지 CSS 추가
  const style = document.createElement('style');
  style.textContent = `
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; }
            20%, 80% { opacity: 1; }
        }
    `;
  document.head.appendChild(style);
})();
