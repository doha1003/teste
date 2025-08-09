/**
 * Service Base Module
 * 각 서비스의 공통 기능 제공 (고유 기능은 유지)
 */

/**
 * 기본 서비스 클래스
 * 각 서비스가 상속받아 확장
 */
export class ServiceBase {
  constructor(config) {
    this.config = {
      serviceType: '', // fortune, test, tool
      serviceName: '', // daily, mbti, text-counter 등
      resultContainer: '#result-container',
      loadingText: '분석 중...',
      errorText: '오류가 발생했습니다.',
      ...config,
    };

    this.state = {
      isLoading: false,
      result: null,
      error: null,
    };

    this.init();
  }

  /**
   * 초기화 - 하위 클래스에서 재정의 가능
   */
  init() {
    this.bindCommonEvents();
    this.initializeService();
  }

  /**
   * 공통 이벤트 바인딩
   */
  bindCommonEvents() {
    // 공유 버튼
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="share-kakao"]')) {
        this.shareKakao();
      }
      if (e.target.matches('[data-action="copy-link"]')) {
        this.copyLink();
      }
      if (e.target.matches('[data-action="retry"]')) {
        this.retry();
      }
    });
  }

  /**
   * 서비스별 초기화 - 하위 클래스에서 구현
   */
  initializeService() {
    // Override in subclass
  }

  /**
   * 공통 초기화 (광고, 공유, 분석 등)
   */
  initializeCommon() {
    // 광고 초기화
    this.initializeAds();
    
    // 카카오 SDK 초기화 (지연 로딩)
    if (typeof window.Kakao !== 'undefined' && !window.Kakao.isInitialized()) {
      try {
        window.Kakao.init('YOUR_KAKAO_APP_KEY'); // 실제 키로 교체 필요
      } catch (e) {
        console.warn('Kakao SDK initialization failed:', e);
      }
    }
    
    // 전역 에러 핸들러
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
    });
  }

  /**
   * 로딩 표시
   */
  showLoading(text) {
    this.state.isLoading = true;
    const container = document.querySelector(this.config.resultContainer);
    if (container) {
      container.innerHTML = this.createLoadingHTML(text || this.config.loadingText);
      container.style.display = 'block';
    }
  }

  /**
   * 에러 표시
   */
  showError(message) {
    this.state.isLoading = false;
    this.state.error = message;
    const container = document.querySelector(this.config.resultContainer);
    if (container) {
      container.innerHTML = this.createErrorHTML(message || this.config.errorText);
    }
  }

  /**
   * 결과 표시 - 각 서비스에서 재정의
   */
  showResult(result) {
    this.state.isLoading = false;
    this.state.result = result;
    const container = document.querySelector(this.config.resultContainer);
    if (container) {
      container.innerHTML = this.createResultHTML(result);
      container.style.display = 'block';
      this.afterShowResult();
    }
  }

  /**
   * 결과 표시 후 처리
   */
  afterShowResult() {
    // 애니메이션 효과
    this.animateResult();

    // 광고 초기화
    this.initializeAds();
  }

  /**
   * 로딩 HTML 생성
   */
  createLoadingHTML(text) {
    return `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">${this.escapeHtml(text)}</p>
                </div>
            `;
  }

  /**
   * 에러 HTML 생성
   */
  createErrorHTML(message) {
    return `
                <div class="error-container">
                    <div class="error-icon">⚠️</div>
                    <p class="error-message">${this.escapeHtml(message)}</p>
                    <button class="btn btn-primary" data-action="retry">
                        다시 시도
                    </button>
                </div>
            `;
  }

  /**
   * 결과 HTML 생성 - 하위 클래스에서 구현
   */
  createResultHTML(_result) {
    // Override in subclass
    return '';
  }

  /**
   * 카카오톡 공유
   */
  shareKakao() {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      this.showNotification('카카오 SDK가 초기화되지 않았습니다.', 'error');
      return;
    }

    const shareData = this.getShareData();

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: shareData.title,
        description: shareData.description,
        imageUrl: shareData.imageUrl,
        link: {
          mobileWebUrl: shareData.url,
          webUrl: shareData.url,
        },
      },
      buttons: [
        {
          title: shareData.buttonText || '결과 보기',
          link: {
            mobileWebUrl: shareData.url,
            webUrl: shareData.url,
          },
        },
      ],
    });
  }

  /**
   * 공유 데이터 가져오기 - 하위 클래스에서 구현
   */
  getShareData() {
    return {
      title: document.title,
      description: '결과를 확인해보세요!',
      imageUrl: 'https://doha.kr/images/og-image.jpg',
      url: window.location.href,
    };
  }

  /**
   * 링크 복사
   */
  copyLink() {
    const url = window.location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => this.showNotification('링크가 복사되었습니다!'))
        .catch(() => this.fallbackCopyToClipboard(url));
    } else {
      this.fallbackCopyToClipboard(url);
    }
  }

  /**
   * 클립보드 복사 폴백
   */
  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      this.showNotification('링크가 복사되었습니다!');
    } catch (err) {
      this.showNotification('복사에 실패했습니다.', 'error');
    }

    document.body.removeChild(textArea);
  }

  /**
   * 다시 시도
   */
  retry() {
    location.reload();
  }

  /**
   * 알림 표시
   */
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * 결과 애니메이션
   */
  animateResult() {
    const elements = document.querySelectorAll('.result-section, .result-stat, .result-item');
    elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';

      setTimeout(() => {
        el.style.transition = 'all 0.5s ease-out';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  /**
   * 광고 초기화
   */
  initializeAds() {
    if ('IntersectionObserver' in window) {
      const adContainers = document.querySelectorAll('.ad-container:not([data-loaded])');

      const adObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !entry.target.dataset.loaded) {
              this.loadAd(entry.target);
              entry.target.dataset.loaded = 'true';
              adObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '50px' }
      );

      adContainers.forEach((container) => {
        adObserver.observe(container);
      });
    }
  }

  /**
   * 광고 로드
   */
  loadAd(container) {
    const adSlot = container.dataset.adSlot || '1234567890';
    container.innerHTML = `
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-7905640648499222"
                     data-ad-slot="${adSlot}"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            `;

    if (typeof adsbygoogle !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // AdSense 로딩 실패 시 무시
        console.warn('AdSense loading failed:', e);
      }
    }
  }

  /**
   * HTML 이스케이프
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 숫자 포맷팅
   */
  formatNumber(num) {
    return new Intl.NumberFormat('ko-KR').format(num);
  }

  /**
   * 한국식 날짜 포맷팅
   */
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: options.includeWeekday ? 'long' : undefined,
      ...options,
    };

    const formatted = new Intl.DateTimeFormat('ko-KR', defaultOptions).format(date);

    // 한국식 날짜 형식으로 변환 (YYYY년 MM월 DD일)
    if (options.koreanStyle !== false) {
      return formatted.replace(/\s/g, ' ');
    }

    return formatted;
  }

  /**
   * 한국식 시간 포맷팅
   */
  formatTime(date, options = {}) {
    const defaultOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: options.hour12 !== false, // 기본값: 12시간 형식
      ...options,
    };

    return new Intl.DateTimeFormat('ko-KR', defaultOptions).format(date);
  }

  /**
   * 상대적 시간 표시 (한국어)
   */
  formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return '방금 전';
    }
    if (diffMin < 60) {
      return `${diffMin}분 전`;
    }
    if (diffHour < 24) {
      return `${diffHour}시간 전`;
    }
    if (diffDay < 7) {
      return `${diffDay}일 전`;
    }

    return this.formatDate(date);
  }

  /**
   * 존댓말/반말 설정에 따른 텍스트 변환
   */
  formatSpeechLevel(text, formal = true) {
    if (!formal) {
      // 반말 변환 규칙
      return text
        .replace(/습니다/g, '어')
        .replace(/입니다/g, '야')
        .replace(/됩니다/g, '돼')
        .replace(/하세요/g, '해')
        .replace(/해주세요/g, '해줘')
        .replace(/드립니다/g, '줄게')
        .replace(/십시오/g, '어');
    }

    return text; // 존댓말은 기본값
  }

  /**
   * 한국 나이 계산 (만 나이)
   */
  calculateKoreanAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return {
      age,
      formatted: `만 ${age}세`,
    };
  }

  /**
   * 한국 전통 나이 계산 (세는 나이)
   */
  calculateTraditionalAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear() + 1;

    return {
      age,
      formatted: `${age}세`,
    };
  }
}

// Export ServiceBase class
