/**
 * Korean Language Optimization for PWA
 * 한국어 사용자를 위한 특화 최적화
 */

class KoreanOptimizer {
  constructor() {
    this.isKoreanUser = this.detectKoreanUser();
    this.fontLoadingStrategy = 'swap';
    this.textRenderingOptimized = false;

    // 한국어 최적화 설정
    this.config = {
      // 폰트 최적화
      fonts: {
        primary: 'Pretendard Variable',
        fallback: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'sans-serif',
        ],
        weights: [300, 400, 500, 600, 700],
        unicodeRanges: {
          korean: 'U+AC00-D7AF, U+1100-11FF, U+3130-318F, U+A960-A97F, U+D7B0-D7FF',
          latin:
            'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
        },
      },

      // 텍스트 렌더링 최적화
      textRendering: {
        wordBreak: 'keep-all',
        wordWrap: 'break-word',
        lineHeight: 1.7,
        letterSpacing: '-0.01em',
        textSizeAdjust: '100%',
      },

      // 입력 최적화
      input: {
        ime: true,
        autocomplete: 'off', // 한글 IME와 충돌 방지
        spellcheck: false,
      },

      // 지역화 설정
      locale: {
        language: 'ko-KR',
        timezone: 'Asia/Seoul',
        currency: 'KRW',
        dateFormat: 'YYYY년 MM월 DD일',
        timeFormat: 'HH:mm',
      },
    };

    this.init();
  }

  init() {
    if (this.isKoreanUser) {
      this.applyKoreanOptimizations();
    }

    // 동적 최적화
    this.setupDynamicOptimizations();

    // 폰트 로딩 최적화
    this.optimizeFontLoading();

    // 텍스트 입력 최적화
    this.optimizeTextInput();

    // 날짜/시간 지역화
    this.setupLocalization();
  }

  // 한국어 사용자 감지
  detectKoreanUser() {
    const checks = [
      // 브라우저 언어 설정
      navigator.language?.startsWith('ko'),
      navigator.languages?.some((lang) => lang.startsWith('ko')),

      // 시간대 확인
      Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Seoul',

      // URL 파라미터 확인
      new URLSearchParams(location.search).get('lang') === 'ko',

      // 로컬 스토리지 설정
      localStorage.getItem('preferred_language') === 'ko',

      // 페이지 언어 속성
      document.documentElement.lang === 'ko' || document.documentElement.lang === 'ko-KR',
    ];

    const isKorean = checks.some((check) => check === true);

    return isKorean;
  }

  // 한국어 최적화 적용
  applyKoreanOptimizations() {
    // HTML lang 속성 설정
    if (!document.documentElement.lang) {
      document.documentElement.lang = 'ko-KR';
    }

    // 메타 태그 추가
    this.addKoreanMetaTags();

    // CSS 최적화 적용
    this.applyCSSOptimizations();

    // 폰트 프리로드
    this.preloadKoreanFonts();
  }

  // 한국어 메타 태그 추가
  addKoreanMetaTags() {
    const metaTags = [
      {
        name: 'format-detection',
        content: 'telephone=no, date=no, email=no, address=no',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'doha.kr',
      },
      {
        name: 'application-name',
        content: 'doha.kr - 심리테스트, 실용도구, AI 운세',
      },
      {
        name: 'msapplication-TileColor',
        content: '#5c5ce0',
      },
      {
        name: 'theme-color',
        content: '#5c5ce0',
      },
    ];

    metaTags.forEach(({ name, content }) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    });
  }

  // CSS 최적화 적용
  applyCSSOptimizations() {
    const style = document.createElement('style');
    style.id = 'korean-optimization-dynamic';

    style.textContent = `
      /* 한국어 텍스트 최적화 */
      html {
        -webkit-text-size-adjust: 100%;
        -moz-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        text-size-adjust: 100%;
      }
      
      body, input, textarea, select, dh-c-button {
        font-family: ${this.config.fonts.primary}, ${this.config.fonts.fallback.join(', ')};
        word-break: ${this.config.textRendering.wordBreak};
        word-wrap: ${this.config.textRendering.wordWrap};
        line-height: ${this.config.textRendering.lineHeight};
        letter-spacing: ${this.config.textRendering.letterSpacing};
      }
      
      /* 한글 입력 최적화 */
      input[type="text"], input[type="search"], textarea {
        ime-mode: active;
        -webkit-ime-mode: active;
      }
      
      /* 한글 폰트 렌더링 최적화 */
      .korean-text {
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-feature-settings: "kern" 1;
      }
      
      /* 모바일 한글 최적화 */
      @media (max-width: 768px) {
        body {
          line-height: 1.8;
          letter-spacing: -0.005em;
        }
        
        input, textarea {
          font-size: 16px; /* iOS zoom 방지 */
        }
      }
      
      /* 한글 줄바꿈 최적화 */
      p, div, span, h1, h2, h3, h4, h5, h6 {
        word-break: ${this.config.textRendering.wordBreak};
        overflow-wrap: break-word;
      }
      
      /* 한국어 숫자 표시 최적화 */
      .korean-number {
        font-variant-numeric: proportional-nums;
        font-feature-settings: "tnum" 0, "pnum" 1;
      }
      
      /* 날짜 표시 최적화 */
      .korean-date {
        white-space: nowrap;
      }
    `;

    document.head.appendChild(style);
    this.textRenderingOptimized = true;
  }

  // 한국어 폰트 프리로드
  preloadKoreanFonts() {
    const fontFiles = [
      '/fonts/Pretendard-Regular.woff2',
      '/fonts/Pretendard-Medium.woff2',
      '/fonts/Pretendard-Bold.woff2',
    ];

    fontFiles.forEach((fontFile) => {
      if (!document.querySelector(`link[href="${fontFile}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = fontFile;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
  }

  // 동적 최적화 설정
  setupDynamicOptimizations() {
    // 텍스트 노드 관찰
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              this.optimizeTextNode(node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              this.optimizeElement(node);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 초기 최적화
    this.optimizeExistingContent();
  }

  // 기존 콘텐츠 최적화
  optimizeExistingContent() {
    // 모든 텍스트 요소에 한국어 클래스 추가
    const textElements = document.querySelectorAll(
      'p, div, span, h1, h2, h3, h4, h5, h6, li, td, th'
    );

    textElements.forEach((element) => {
      if (this.containsKorean(element.textContent)) {
        element.classList.add('korean-text');
      }
    });

    // 숫자 요소 최적화
    this.optimizeNumbers();

    // 날짜 요소 최적화
    this.optimizeDates();
  }

  // 텍스트 노드 최적화
  optimizeTextNode(textNode) {
    if (this.containsKorean(textNode.textContent)) {
      const parent = textNode.parentElement;
      if (parent && !parent.classList.contains('korean-text')) {
        parent.classList.add('korean-text');
      }
    }
  }

  // 요소 최적화
  optimizeElement(element) {
    if (element.tagName) {
      // 입력 요소 최적화
      if (['INPUT', 'TEXTAREA'].includes(element.tagName)) {
        this.optimizeInputElement(element);
      }

      // 텍스트 요소 최적화
      if (this.containsKorean(element.textContent)) {
        element.classList.add('korean-text');
      }
    }
  }

  // 한국어 포함 여부 확인
  containsKorean(text) {
    if (!text) {
      return false;
    }

    // 한글 음절, 자모, 호환 자모 범위
    const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/;
    return koreanRegex.test(text);
  }

  // 폰트 로딩 최적화
  optimizeFontLoading() {
    // Font Display API 사용
    if ('fonts' in document) {
      const fontFaces = [
        new FontFace('Pretendard Variable', 'url(/fonts/PretendardVariable.woff2)', {
          display: 'swap',
          unicodeRange: this.config.fonts.unicodeRanges.korean,
        }),
      ];

      fontFaces.forEach(async (fontFace) => {
        try {
          await fontFace.load();
          document.fonts.add(fontFace);
        } catch (error) {
          // 폰트 로딩 실패 시 기본 폰트 사용
          console.warn('Font dh-u-loading failed:', error);
        }
      });
    }

    // 폰트 로딩 이벤트 리스너
    document.fonts.addEventListener('loadingdone', (_event) => {
      this.onFontsLoaded();
    });
  }

  // 폰트 로딩 완료 후 처리
  onFontsLoaded() {
    // FOUT(Flash of Unstyled Text) 방지
    document.body.classList.add('fonts-loaded');

    // 텍스트 재렌더링 트리거
    if (this.textRenderingOptimized) {
      document.body.style.visibility = 'dh-u-hidden';
      document.body.offsetHeight; // 강제 리플로우
      document.body.style.visibility = 'dh-u-visible';
    }
  }

  // 텍스트 입력 최적화
  optimizeTextInput() {
    // 모든 입력 요소에 한글 최적화 적용
    const inputs = document.querySelectorAll('input[type="text"], input[type="search"], textarea');

    inputs.forEach((input) => {
      this.optimizeInputElement(input);
    });

    // 동적으로 추가되는 입력 요소 처리
    document.addEventListener('focusin', (event) => {
      if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        this.optimizeInputElement(event.target);
      }
    });
  }

  // 개별 입력 요소 최적화
  optimizeInputElement(input) {
    // IME 모드 설정
    if (this.config.input.ime) {
      input.style.imeMode = 'dh-state-active';
    }

    // 자동완성 비활성화 (한글 IME 충돌 방지)
    if (this.config.input.autocomplete === 'off') {
      input.setAttribute('autocomplete', 'off');
    }

    // 맞춤법 검사 비활성화
    if (!this.config.input.spellcheck) {
      input.setAttribute('spellcheck', 'false');
    }

    // 모바일에서 폰트 크기 16px 이상 설정 (줌 방지)
    if (this.isMobile() && parseInt(getComputedStyle(input).fontSize) < 16) {
      input.style.fontSize = '16px';
    }

    // 한글 입력 이벤트 처리
    this.setupKoreanInputHandlers(input);
  }

  // 한글 입력 이벤트 핸들러 설정
  setupKoreanInputHandlers(input) {
    let composing = false;

    // 조합 시작
    input.addEventListener('compositionstart', () => {
      composing = true;
    });

    // 조합 종료
    input.addEventListener('compositionend', () => {
      composing = false;
    });

    // 입력 이벤트
    input.addEventListener('input', (_event) => {
      // 한글 조합 중이 아닐 때만 처리
      if (!composing) {
        this.handleKoreanInput(event);
      }
    });
  }

  // 한글 입력 처리
  handleKoreanInput(event) {
    const input = event.target;
    const { value } = input;

    // 한글 자동 완성 (예: ㅎㅏㄴㄱㅡㄹ → 한글)
    if (this.containsKorean(value)) {
      // 여기에 한글 자동 완성 로직 추가 가능
    }
  }

  // 지역화 설정
  setupLocalization() {
    // 날짜/시간 형식 설정
    this.dateFormatter = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: this.config.locale.timezone,
    });

    this.timeFormatter = new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: this.config.locale.timezone,
    });

    // 숫자 형식 설정
    this.numberFormatter = new Intl.NumberFormat('ko-KR');

    // 통화 형식 설정
    this.currencyFormatter = new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: this.config.locale.currency,
    });
  }

  // 숫자 최적화
  optimizeNumbers() {
    const numberElements = document.querySelectorAll('[data-type="number"], .number');

    numberElements.forEach((element) => {
      const text = element.textContent;
      const number = parseInt(text.replace(/[^0-9]/g, ''));

      if (!isNaN(number)) {
        element.textContent = this.numberFormatter.format(number);
        element.classList.add('korean-number');
      }
    });
  }

  // 날짜 최적화
  optimizeDates() {
    const dateElements = document.querySelectorAll('[data-type="date"], .date, time');

    dateElements.forEach((element) => {
      const dateStr = element.textContent || element.getAttribute('datetime');

      if (dateStr) {
        try {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            element.textContent = this.dateFormatter.format(date);
            element.classList.add('korean-date');
          }
        } catch (error) {
          // 날짜 파싱 실패 시 무시
          console.warn('Date parsing failed:', error);
        }
      }
    });
  }

  // 모바일 환경 감지
  isMobile() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 0 && window.innerWidth < 768)
    );
  }

  // 텍스트 방향 최적화 (한국어는 LTR이지만 혼합 텍스트 처리)
  optimizeTextDirection() {
    const elements = document.querySelectorAll('[dir], .rtl, .ltr');

    elements.forEach((element) => {
      const text = element.textContent;

      if (this.containsKorean(text)) {
        element.dir = 'ltr';
      }
    });
  }

  // 한국어 검색 최적화
  optimizeSearch() {
    const searchInputs = document.querySelectorAll(
      'input[type="search"], input[name*="search"], input[placeholder*="검색"]'
    );

    searchInputs.forEach((input) => {
      // 한글 초성 검색 지원
      input.addEventListener('input', (event) => {
        const query = event.target.value;
        if (this.containsKorean(query)) {
          // 초성 검색 로직 추가 가능
          this.handleKoreanSearch(query, input);
        }
      });
    });
  }

  // 한글 검색 처리
  handleKoreanSearch(_query, _input) {
    // 초성 검색, 자동완성 등의 로직 구현 가능
  }

  // 접근성 개선
  improveAccessibility() {
    // 한국어 스크린 리더 최적화
    document.documentElement.setAttribute('xml:lang', 'ko');

    // ARIA 레이블 한국어 최적화
    const ariaElements = document.querySelectorAll(
      '[aria-label], [aria-labelledby], [aria-describedby]'
    );

    ariaElements.forEach((element) => {
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel && this.containsKorean(ariaLabel)) {
        // 한국어 ARIA 레이블 최적화
        element.setAttribute('lang', 'ko-KR');
      }
    });
  }

  // 성능 메트릭 수집
  collectKoreanMetrics() {
    const metrics = {
      isKoreanUser: this.isKoreanUser,
      textRenderingOptimized: this.textRenderingOptimized,
      koreanTextElements: document.querySelectorAll('.korean-text').length,
      optimizedInputs: document.querySelectorAll('input[style*="ime-mode"]').length,
      fontLoadingTime: performance
        .getEntriesByType('resource')
        .filter((entry) => entry.name.includes('Pretendard'))
        .reduce((sum, entry) => sum + entry.duration, 0),
    };

    return metrics;
  }

  // 공개 API
  formatNumber(number) {
    return this.numberFormatter.format(number);
  }

  formatCurrency(amount) {
    return this.currencyFormatter.format(amount);
  }

  formatDate(date) {
    return this.dateFormatter.format(date);
  }

  formatTime(date) {
    return this.timeFormatter.format(date);
  }

  isKoreanText(text) {
    return this.containsKorean(text);
  }

  getMetrics() {
    return this.collectKoreanMetrics();
  }
}

// 전역으로 내보내기
window.KoreanOptimizer = KoreanOptimizer;

// 자동 초기화
if (document.readyState === 'dh-u-loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const koreanOptimizer = new KoreanOptimizer();
    window.koreanOptimizer = koreanOptimizer;
  });
} else {
  const koreanOptimizer = new KoreanOptimizer();
  window.koreanOptimizer = koreanOptimizer;
}

export default KoreanOptimizer;
