/**
 * Korean Input Helper
 * 모바일 한글 입력 최적화 유틸리티
 */

export class KoreanInputHelper {
  constructor() {
    this.keyboardVisible = false;
    this.originalViewportHeight = window.innerHeight;
    this.compositionActive = false;

    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.bindEvents();
    this.setupViewportHandler();
    this.enhanceInputFields();
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 뷰포트 크기 변화 감지 (가상 키보드)
    window.addEventListener('resize', this.handleViewportResize.bind(this));
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));

    // 전역 입력 이벤트
    document.addEventListener('focusin', this.handleInputFocus.bind(this));
    document.addEventListener('focusout', this.handleInputBlur.bind(this));

    // 한글 입력 상태 감지
    document.addEventListener('compositionstart', this.handleCompositionStart.bind(this));
    document.addEventListener('compositionend', this.handleCompositionEnd.bind(this));
    document.addEventListener('compositionupdate', this.handleCompositionUpdate.bind(this));
  }

  /**
   * 뷰포트 핸들러 설정
   */
  setupViewportHandler() {
    // iOS Safari 대응
    if (this.isIOS()) {
      this.setupIOSViewport();
    }

    // Android 대응
    if (this.isAndroid()) {
      this.setupAndroidViewport();
    }
  }

  /**
   * 입력 필드 강화
   */
  enhanceInputFields() {
    const inputs = document.querySelectorAll(
      '.korean-input, input[type="text"], input[type="search"], textarea'
    );

    inputs.forEach((input) => {
      this.enhanceInput(input);
    });
  }

  /**
   * 개별 입력 필드 강화
   */
  enhanceInput(input) {
    // 한글 입력 최적화 속성 추가
    input.setAttribute('lang', 'ko');
    input.setAttribute('inputmode', 'text');

    // 모바일에서 폰트 크기 조정 (확대 방지)
    if (this.isMobile()) {
      const computedStyle = window.getComputedStyle(input);
      const fontSize = parseFloat(computedStyle.fontSize);

      if (fontSize < 16) {
        input.style.fontSize = '16px';
      }
    }

    // 자동완성 설정
    this.setupAutocomplete(input);

    // 문자 카운터 설정
    this.setupCharacterCounter(input);

    // 클리어 버튼 설정
    this.setupClearButton(input);
  }

  /**
   * 자동완성 설정
   */
  setupAutocomplete(input) {
    const autocompleteData = input.dataset.autocomplete;
    if (!autocompleteData) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'korean-input-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const dropdown = document.createElement('div');
    dropdown.className = 'korean-autocomplete';
    dropdown.style.display = 'none';
    wrapper.appendChild(dropdown);

    input.addEventListener('input', (e) => {
      this.handleAutocomplete(e.target, dropdown);
    });

    // 외부 클릭 시 드롭다운 숨김
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }

  /**
   * 자동완성 처리
   */
  async handleAutocomplete(input, dropdown) {
    const query = input.value.trim();
    if (query.length < 2) {
      dropdown.style.display = 'none';
      return;
    }

    try {
      const suggestions = await this.fetchSuggestions(query, input.dataset.autocomplete);
      this.renderSuggestions(suggestions, dropdown, input);
    } catch (error) {
      console.warn('자동완성 가져오기 실패:', error);
      dropdown.style.display = 'none';
    }
  }

  /**
   * 제안 가져오기
   */
  async fetchSuggestions(query, type) {
    // 로컬 제안 데이터
    const localSuggestions = {
      'korean-names': ['김민수', '이영희', '박지훈', '최서연', '정우진'],
      'korean-cities': ['서울', '부산', '대구', '인천', '광주', '대전', '울산'],
      'korean-foods': ['김치찌개', '불고기', '비빔밥', '냉면', '갈비탕'],
    };

    if (localSuggestions[type]) {
      return localSuggestions[type].filter((item) => item.includes(query)).slice(0, 5);
    }

    return [];
  }

  /**
   * 제안 렌더링
   */
  renderSuggestions(suggestions, dropdown, input) {
    dropdown.innerHTML = '';

    if (suggestions.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    suggestions.forEach((suggestion, _index) => {
      const item = document.createElement('div');
      item.className = 'korean-autocomplete__item';
      item.textContent = suggestion;

      item.addEventListener('click', () => {
        input.value = suggestion;
        dropdown.style.display = 'none';
        input.focus();
      });

      dropdown.appendChild(item);
    });

    dropdown.style.display = 'block';
  }

  /**
   * 문자 카운터 설정
   */
  setupCharacterCounter(input) {
    const maxLength = input.getAttribute('maxlength');
    if (!maxLength) {
      return;
    }

    const counter = document.createElement('div');
    counter.className = 'korean-input-counter';

    const updateCounter = () => {
      const current = this.getKoreanLength(input.value);
      const max = parseInt(maxLength);

      counter.textContent = `${current}/${max}`;

      // 경고 및 에러 상태
      counter.classList.remove('warning', 'error');
      if (current > max * 0.9) {
        counter.classList.add('warning');
      }
      if (current > max) {
        counter.classList.add('error');
      }
    };

    input.addEventListener('input', updateCounter);
    input.parentNode.appendChild(counter);
    updateCounter();
  }

  /**
   * 클리어 버튼 설정
   */
  setupClearButton(input) {
    if (input.dataset.clearable === 'false') {
      return;
    }

    let wrapper = input.closest('.korean-input-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'korean-input-wrapper';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
    }

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'korean-input-clear';
    clearBtn.innerHTML = '✕';
    clearBtn.setAttribute('aria-label', '입력 내용 지우기');

    clearBtn.addEventListener('click', () => {
      input.value = '';
      input.focus();
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const toggleClearButton = () => {
      clearBtn.style.display = input.value ? 'block' : 'none';
    };

    input.addEventListener('input', toggleClearButton);
    wrapper.appendChild(clearBtn);
    toggleClearButton();
  }

  /**
   * 뷰포트 크기 변화 처리
   */
  handleViewportResize() {
    const currentHeight = window.innerHeight;
    const heightDiff = this.originalViewportHeight - currentHeight;

    // 가상 키보드 표시 감지
    if (heightDiff > 150) {
      this.keyboardVisible = true;
      document.body.classList.add('keyboard-open');
      this.adjustLayoutForKeyboard();
    } else {
      this.keyboardVisible = false;
      document.body.classList.remove('keyboard-open');
      this.restoreLayout();
    }
  }

  /**
   * 화면 회전 처리
   */
  handleOrientationChange() {
    setTimeout(() => {
      this.originalViewportHeight = window.innerHeight;
      this.handleViewportResize();
    }, 500);
  }

  /**
   * 입력 포커스 처리
   */
  handleInputFocus(e) {
    const input = e.target;
    if (!this.isTextInput(input)) {
      return;
    }

    // 모바일에서 입력 필드를 뷰포트 중앙으로 스크롤
    if (this.isMobile()) {
      setTimeout(() => {
        this.scrollInputIntoView(input);
      }, 300);
    }

    // IME 상태 초기화
    this.compositionActive = false;
  }

  /**
   * 입력 블러 처리
   */
  handleInputBlur(e) {
    const input = e.target;
    if (!this.isTextInput(input)) {
      return;
    }

    // 조합 상태 해제
    input.removeAttribute('data-composing');
  }

  /**
   * 한글 조합 시작
   */
  handleCompositionStart(e) {
    this.compositionActive = true;
    e.target.setAttribute('data-composing', 'true');
  }

  /**
   * 한글 조합 업데이트
   */
  handleCompositionUpdate(e) {
    // 조합 중인 텍스트 처리
    const composingText = e.data;
    if (composingText) {
      // 조합 상태 시각적 표시 유지
      e.target.setAttribute('data-composing', 'true');
    }
  }

  /**
   * 한글 조합 종료
   */
  handleCompositionEnd(e) {
    this.compositionActive = false;
    e.target.removeAttribute('data-composing');

    // 조합 완료 후 이벤트 발생
    setTimeout(() => {
      e.target.dispatchEvent(new Event('input', { bubbles: true }));
    }, 0);
  }

  /**
   * 키보드용 레이아웃 조정
   */
  adjustLayoutForKeyboard() {
    // 고정 푸터나 하단 버튼 조정
    const footer = document.querySelector('.keyboard-adaptive-footer');
    if (footer) {
      footer.style.transform = 'translateY(0)';
    }

    // 스크롤 컨테이너 높이 조정
    const content = document.querySelector('.keyboard-adaptive-content');
    if (content) {
      content.style.maxHeight = `${window.innerHeight - 100}px`;
    }
  }

  /**
   * 레이아웃 복원
   */
  restoreLayout() {
    const footer = document.querySelector('.keyboard-adaptive-footer');
    if (footer) {
      footer.style.transform = '';
    }

    const content = document.querySelector('.keyboard-adaptive-content');
    if (content) {
      content.style.maxHeight = '';
    }
  }

  /**
   * 입력 필드를 화면에 표시
   */
  scrollInputIntoView(input) {
    const rect = input.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // 입력 필드가 화면 하단에 가려졌는지 확인
    if (rect.bottom > viewportHeight * 0.5) {
      input.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }

  /**
   * iOS Safari 뷰포트 설정
   */
  setupIOSViewport() {
    // iOS Safari의 가상 키보드 대응
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      const currentContent = meta.getAttribute('content');
      if (!currentContent.includes('viewport-fit=cover')) {
        meta.setAttribute('content', `${currentContent}, viewport-fit=cover`);
      }
    }
  }

  /**
   * Android 뷰포트 설정
   */
  setupAndroidViewport() {
    // Android 키보드 대응
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        this.handleViewportResize();
      });
    }
  }

  /**
   * 한글 문자 길이 계산
   */
  getKoreanLength(text) {
    // 한글, 영문, 숫자, 특수문자 길이 계산
    let length = 0;
    for (const char of text) {
      // 한글 문자는 2, 나머지는 1로 계산
      if (/[가-힣]/.test(char)) {
        length += 2;
      } else {
        length += 1;
      }
    }
    return length;
  }

  /**
   * 텍스트 입력 필드 확인
   */
  isTextInput(element) {
    if (element.tagName === 'TEXTAREA') {
      return true;
    }
    if (element.tagName === 'INPUT') {
      const type = element.type.toLowerCase();
      return ['text', 'search', 'url', 'email', 'password'].includes(type);
    }
    return false;
  }

  /**
   * 모바일 기기 확인
   */
  isMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * iOS 기기 확인
   */
  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  /**
   * Android 기기 확인
   */
  isAndroid() {
    return /Android/.test(navigator.userAgent);
  }

  /**
   * 정리
   */
  destroy() {
    window.removeEventListener('resize', this.handleViewportResize);
    window.removeEventListener('orientationchange', this.handleOrientationChange);
    document.removeEventListener('focusin', this.handleInputFocus);
    document.removeEventListener('focusout', this.handleInputBlur);
    document.removeEventListener('compositionstart', this.handleCompositionStart);
    document.removeEventListener('compositionend', this.handleCompositionEnd);
    document.removeEventListener('compositionupdate', this.handleCompositionUpdate);
  }
}

// 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window !== 'undefined') {
    window.koreanInputHelper = new KoreanInputHelper();
  }
});
