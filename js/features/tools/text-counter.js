/**
 * Text Counter Service
 * 글자수 세기 도구 구현
 */

import { ToolService } from './tool-service.js';

export class TextCounterService extends ToolService {
  constructor() {
    super({
      serviceName: 'text-counter',
      toolType: 'text-counter',
      isRealtime: true,
      resultContainer: '.results-grid',
      ui: {
        textInput: '#textInput',
        totalChars: '#totalChars',
        charsNoSpaces: '#charsNoSpaces',
        bytes: '#bytes',
        manuscript: '#manuscript',
        words: '#words',
        sentences: '#sentences',
        koreanCount: '#koreanCount',
        englishCount: '#englishCount',
        numberCount: '#numberCount',
        spaceCount: '#spaceCount',
        specialCount: '#specialCount',
        newlineCount: '#newlineCount',
      },
    });

    // 디바운스 타이머
    this.debounceTimer = null;

    // 최대 글자수
    this.maxLength = 100000;

    // 이벤트 리스너 참조 저장
    this.eventListeners = [];
  }

  /**
   * 도구별 추가 초기화
   */
  initToolSpecific() {
    // DOM 요소 안전성 검사
    const textInput = document.querySelector(this.ui.textInput);
    if (!textInput) {
      console.warn('⚠️ 텍스트 입력창을 찾을 수 없습니다:', this.ui.textInput);
      return;
    }

    // 텍스트 입력 이벤트 바인딩
    textInput.addEventListener('input', () => this.handleTextInput());
    textInput.setAttribute('maxlength', this.maxLength);

    // 버튼 이벤트 바인딩
    this.bindButtonEvents();

    // 체크박스 이벤트 바인딩
    this.bindCheckboxEvents();

    // FAQ 아코디언 초기화
    this.initFAQAccordion();

    // 초기 계산
    this.updateCount();
  }

  /**
   * 텍스트 입력 핸들러
   */
  handleTextInput() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.updateCount();
    }, 100);
  }

  /**
   * 버튼 이벤트 바인딩
   */
  bindButtonEvents() {
    // 모든 컨트롤 버튼에 이벤트 위임 사용
    const controlsContainer = document.querySelector('.text-counter-controls');
    if (controlsContainer) {
      controlsContainer.addEventListener('click', (e) => {
        const button = e.target.closest('[data-action]');
        if (!button) {
          return;
        }

        const { action } = button.dataset;
        switch (action) {
          case 'clear':
            this.clearText();
            break;
          case 'copy':
            this.copyText();
            break;
          case 'paste':
            this.pasteText();
            break;
        }
      });
    }
  }

  /**
   * 체크박스 이벤트 바인딩
   */
  bindCheckboxEvents() {
    const checkboxes = document.querySelectorAll('.setting-checkbox');
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        // 체크박스 설정에 따른 UI 업데이트
        this.updateDisplayOptions();
        this.updateCount();
      });
    });
  }
  
  /**
   * 표시 옵션 업데이트
   */
  updateDisplayOptions() {
    const settings = {
      includeSpaces: document.getElementById('includeSpaces')?.checked ?? true,
      includeNewlines: document.getElementById('includeNewlines')?.checked ?? true,
      showBytes: document.getElementById('showBytes')?.checked ?? true,
      showManuscript: document.getElementById('showManuscript')?.checked ?? true
    };
    
    // UI 요소 표시/숨김 처리
    const bytesCard = document.querySelector('#bytes')?.closest('.result-card');
    const manuscriptCard = document.querySelector('#manuscript')?.closest('.result-card');
    
    if (bytesCard) {
      bytesCard.style.display = settings.showBytes ? 'block' : 'none';
    }
    if (manuscriptCard) {
      manuscriptCard.style.display = settings.showManuscript ? 'block' : 'none';
    }
  }

  /**
   * 입력값 검증
   */
  validateInput(text) {
    if (text.length > this.maxLength) {
      return text.substring(0, this.maxLength);
    }

    // DOMPurify 사용 (이미 로드되어 있다고 가정)
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
    }

    return text;
  }

  /**
   * 글자수 계산 및 업데이트
   */
  updateCount() {
    const textInput = document.querySelector(this.ui.textInput);
    if (!textInput) {
      return;
    }

    let text = textInput.value;

    // 입력값 검증
    text = this.validateInput(text);
    if (text !== textInput.value) {
      textInput.value = text;
    }

    // 모든 통계 계산
    const stats = this.calculateStats(text);

    // UI 업데이트
    this.updateUI(stats);

    // 상태 저장
    this.toolState.currentValues = { text };
    this.toolState.result = stats;
  }

  /**
   * 통계 계산
   */
  calculateStats(text) {
    // 기본 계산
    const totalChars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const bytes = new Blob([text]).size;
    const manuscript = Math.ceil(totalChars / 200);

    // 단어수 계산 (공백으로 구분)
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    // 문장수 계산 (마침표, 느낌표, 물음표로 구분)
    const sentences = text.trim()
      ? text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
      : 0;

    // 문자 유형별 카운트
    const koreanCount = (text.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g) || []).length;
    const englishCount = (text.match(/[a-zA-Z]/g) || []).length;
    const numberCount = (text.match(/[0-9]/g) || []).length;
    const spaceCount = (text.match(/\s/g) || []).length;
    const specialCount = totalChars - koreanCount - englishCount - numberCount - spaceCount;
    const newlineCount = (text.match(/\n/g) || []).length;

    return {
      totalChars,
      charsNoSpaces,
      bytes,
      manuscript,
      words,
      sentences,
      koreanCount,
      englishCount,
      numberCount,
      spaceCount,
      specialCount,
      newlineCount,
    };
  }

  /**
   * UI 업데이트
   */
  updateUI(stats) {
    // 숫자 포맷팅
    const format = (num) => num.toLocaleString();

    // 기본 통계 업데이트
    this.updateElement(this.ui.totalChars, format(stats.totalChars));
    this.updateElement(this.ui.charsNoSpaces, format(stats.charsNoSpaces));
    this.updateElement(this.ui.bytes, format(stats.bytes));
    this.updateElement(this.ui.manuscript, format(stats.manuscript));
    this.updateElement(this.ui.words, format(stats.words));
    this.updateElement(this.ui.sentences, format(stats.sentences));

    // 문자 유형별 통계 업데이트
    this.updateElement(this.ui.koreanCount, format(stats.koreanCount));
    this.updateElement(this.ui.englishCount, format(stats.englishCount));
    this.updateElement(this.ui.numberCount, format(stats.numberCount));
    this.updateElement(this.ui.spaceCount, format(stats.spaceCount));
    this.updateElement(this.ui.specialCount, format(stats.specialCount));
    this.updateElement(this.ui.newlineCount, format(stats.newlineCount));
  }

  /**
   * 요소 업데이트 헬퍼
   */
  updateElement(selector, value) {
    // 다양한 셀렉터로 요소 찾기
    const selectors = [
      selector,
      selector.replace('#', '.'), // id를 class로도 시도
      `[data-count="${selector.replace('#', '')}"]`,
      `.count-value.${selector.replace('#', '')}`,
      `.result-value.${selector.replace('#', '')}`
    ];
    
    let updated = false;
    for (const sel of selectors) {
      const elements = document.querySelectorAll(sel);
      elements.forEach(element => {
        if (element) {
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = value;
          } else {
            element.textContent = value;
          }
          updated = true;
        }
      });
      if (updated) {break;}
    }
    
    // 추가적으로 일반적인 카운트 ID 업데이트
    if (!updated) {
      const id = selector.replace('#', '');
      // charCount, wordCount 등의 일반적인 ID로도 시도
      const commonIds = {
        'totalChars': 'charCount',
        'words': 'wordCount', 
        'sentences': 'lineCount',
        'bytes': 'byteCount'
      };
      
      if (commonIds[id]) {
        const commonElement = document.querySelector(`#${commonIds[id]}, .${commonIds[id]}`);
        if (commonElement) {
          if (commonElement.tagName === 'INPUT') {
            commonElement.value = value;
          } else {
            commonElement.textContent = value;
          }
        }
      }
    }
  }

  /**
   * 텍스트 지우기
   */
  clearText() {
    if (confirm('입력한 텍스트를 모두 지우시겠습니까?')) {
      const textInput = document.querySelector(this.ui.textInput);
      if (textInput) {
        textInput.value = '';
        this.updateCount();
      }
    }
  }

  /**
   * 텍스트 복사
   */
  copyText() {
    const textInput = document.querySelector(this.ui.textInput);
    if (!textInput) {
      return;
    }

    textInput.select();

    try {
      document.execCommand('copy');
      this.showNotification('텍스트가 복사되었습니다!');
    } catch (err) {
      this.showNotification('복사에 실패했습니다.');
    }
  }

  /**
   * 텍스트 붙여넣기
   */
  async pasteText() {
    try {
      const text = await navigator.clipboard.readText();
      const validatedText = this.validateInput(text);

      const textInput = document.querySelector(this.ui.textInput);
      if (textInput) {
        textInput.value = validatedText;
        this.updateCount();

        if (text.length > this.maxLength) {
          this.showNotification(
            `텍스트가 ${this.maxLength.toLocaleString()}자를 초과하여 잘렸습니다.`
          );
        }
      }
    } catch (err) {
      this.showNotification(
        '클립보드에서 텍스트를 가져올 수 없습니다. 브라우저 권한을 확인해주세요.'
      );
    }
  }

  /**
   * 결과 복사 (오버라이드)
   */
  copyResult() {
    const { result } = this.toolState;
    if (!result) {
      return;
    }

    const text =
      `글자수: ${result.totalChars.toLocaleString()}
` +
      `공백제외: ${result.charsNoSpaces.toLocaleString()}
` +
      `단어수: ${result.words.toLocaleString()}
` +
      `바이트: ${result.bytes.toLocaleString()}
` +
      `원고지: ${result.manuscript.toLocaleString()}매`;

    navigator.clipboard
      .writeText(text)
      .then(() => this.showNotification('결과가 복사되었습니다!'))
      .catch(() => this.showNotification('복사에 실패했습니다.'));
  }

  /**
   * FAQ 아코디언 초기화
   */
  initFAQAccordion() {
    const faqSection = document.querySelector('.faq-section');
    if (!faqSection) {
      return;
    }

    // 이벤트 위임 사용
    faqSection.addEventListener('click', (e) => {
      const question = e.target.closest('.faq-question');
      if (!question) {
        return;
      }

      const item = question.closest('.faq-item');
      if (!item) {
        return;
      }

      this.toggleFAQItem(item, question);
    });

    // 키보드 접근성
    faqSection.addEventListener('keydown', (e) => {
      const question = e.target.closest('.faq-question');
      if (!question) {
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const item = question.closest('.faq-item');
        if (item) {
          this.toggleFAQItem(item, question);
        }
      }
    });
  }

  /**
   * FAQ 아이템 토글
   */
  toggleFAQItem(item, question) {
    const faqItems = document.querySelectorAll('.faq-item');
    const isActive = item.classList.contains('dh-state-active');
    const answer = item.querySelector('.faq-answer');

    // 모든 FAQ 닫기
    faqItems.forEach((otherItem) => {
      otherItem.classList.remove('dh-state-active');
      const otherQuestion = otherItem.querySelector('.faq-question');
      const otherAnswer = otherItem.querySelector('.faq-answer');
      if (otherQuestion) {
        otherQuestion.setAttribute('aria-expanded', 'false');
      }
      if (otherAnswer) {
        otherAnswer.hidden = true;
      }
    });

    // 현재 아이템 토글
    if (!isActive) {
      item.classList.add('dh-state-active');
      question.setAttribute('aria-expanded', 'true');
      if (answer) {
        answer.hidden = false;
      }
    }
  }

  /**
   * 공유 데이터 가져오기 (오버라이드)
   */
  getShareData() {
    const { result } = this.toolState;
    if (!result) {
      return super.getShareData();
    }

    return {
      title: '글자수 세기 결과',
      description: `글자수: ${result.totalChars.toLocaleString()}자, 단어수: ${result.words.toLocaleString()}개`,
      imageUrl: 'https://doha.kr/images/text-counter-share.jpg',
      url: window.location.href,
      buttonText: '글자수 세기 사용하기',
    };
  }

  /**
   * 알림 표시
   */
  showNotification(message) {
    // 기존 알림 제거
    const existingToast = document.querySelector('.text-counter-toast');
    if (existingToast) {
      existingToast.remove();
    }

    // 새 알림 생성
    const toast = document.createElement('div');
    toast.className = 'text-counter-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 애니메이션
    setTimeout(() => toast.classList.add('show'), 100);

    // 자동 제거
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  /**
   * 정리 메서드 - 메모리 누수 방지
   */
  cleanup() {
    // 디바운스 타이머 정리
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // 저장된 이벤트 리스너 제거
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    // 알림 토스트 제거
    const toasts = document.querySelectorAll('.text-counter-toast');
    toasts.forEach((toast) => toast.remove());

    // 부모 클래스의 cleanup 호출
    if (super.cleanup) {
      super.cleanup();
    }
  }

  /**
   * 이벤트 리스너 추가 헬퍼
   */
  addEventListener(element, event, handler) {
    if (!element) {
      return;
    }

    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }
}

// 전역 인스턴스 생성
export const textCounterService = new TextCounterService();

// 전역에도 연결 (레거시 코드 호환성)
window.textCounterService = textCounterService;

// 레거시 함수 지원 (기존 HTML과의 호환성)
window.updateCount = () => window.textCounterService.updateCount();
window.clearText = () => window.textCounterService.clearText();
window.copyText = () => window.textCounterService.copyText();
window.pasteText = () => window.textCounterService.pasteText();
window.handleTextInput = () => window.textCounterService.handleTextInput();

// 페이지 언로드 시 cleanup 호출
window.addEventListener('beforeunload', () => {
  if (window.textCounterService && window.textCounterService.cleanup) {
    window.textCounterService.cleanup();
  }
});
