/**
 * Tool Service Base
 * 도구 서비스 공통 기능 (각 도구별 고유 기능 유지)
 */

import { ServiceBase } from '../../core/service-base.js';

export class ToolService extends ServiceBase {
  constructor(config) {
    super({
      serviceType: 'tool',
      loadingText: '계산 중...',
      ...config,
    });

    // 도구 서비스 공통 상태
    this.toolState = {
      toolType: config.toolType || 'text-counter', // text-counter, salary-calculator, bmi-calculator
      isRealtime: config.isRealtime || false, // 실시간 계산 여부
      currentValues: {},
      result: null,
    };

    // config에도 저장 (하위 호환성)
    this.config.toolType = this.toolState.toolType;
    this.config.isRealtime = this.toolState.isRealtime;
  }

  /**
   * 도구 서비스 초기화
   */
  initializeService() {
    // 입력 폼 초기화
    this.initInputForm();

    // 결과 영역 초기화
    this.initResultArea();

    // 도구별 추가 초기화
    this.initToolSpecific();
  }

  /**
   * 입력 폼 초기화
   */
  initInputForm() {
    const form = document.querySelector('[data-form="tool-input"]');
    if (!form) {
      return;
    }

    // 실시간 계산이면 input 이벤트
    if (this.toolState.isRealtime) {
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        input.addEventListener('input', () => this.handleInputChange());
        input.addEventListener('change', () => this.handleInputChange());
      });
    }

    // 폼 제출 (비실시간)
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(e);
    });

    // 초기화 버튼
    const resetBtn = form.querySelector('[data-action="reset"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetForm());
    }
  }

  /**
   * 결과 영역 초기화
   */
  initResultArea() {
    const resultArea = document.querySelector(this.config.resultContainer);
    if (!resultArea) {
      return;
    }

    // 초기 상태 설정
    if (this.toolState.isRealtime) {
      // 실시간 도구는 기본 결과 표시
      this.showDefaultResult();
    } else {
      // 비실시간 도구는 숨김
      resultArea.style.display = 'none';
    }
  }

  /**
   * 도구별 추가 초기화 - 하위 클래스에서 구현
   */
  initToolSpecific() {
    // Override in each tool class
  }

  /**
   * 입력 변경 처리 (실시간)
   */
  handleInputChange() {
    // 현재 값 수집
    this.collectInputValues();

    // 계산 수행
    const result = this.calculate();

    // 결과 표시
    this.showResult(result);
  }

  /**
   * 폼 제출 처리 (비실시간)
   */
  handleFormSubmit(event) {
    // 유효성 검사
    if (!this.validateInputs()) {
      return;
    }

    // 현재 값 수집
    this.collectInputValues();

    // 로딩 표시
    this.showLoading();

    // 계산 수행 (비동기 가능)
    setTimeout(() => {
      const result = this.calculate();
      this.showResult(result);
    }, 500);
  }

  /**
   * 입력값 수집
   */
  collectInputValues() {
    const form = document.querySelector('[data-form="tool-input"]');
    if (!form) {
      return;
    }

    const formData = new FormData(form);
    this.toolState.currentValues = {};

    for (const [key, value] of formData.entries()) {
      this.toolState.currentValues[key] = value;
    }
  }

  /**
   * 입력 유효성 검사 - 각 도구별 구현
   */
  validateInputs() {
    // Override in each tool class
    return true;
  }

  /**
   * 계산 수행 - 각 도구별 구현
   */
  calculate() {
    // Override in each tool class
    return {};
  }

  /**
   * 기본 결과 표시 (실시간)
   */
  showDefaultResult() {
    const defaultResult = this.getDefaultResult();
    this.showResult(defaultResult);
  }

  /**
   * 기본 결과 가져오기 - 각 도구별 구현
   */
  getDefaultResult() {
    // Override in each tool class
    return {};
  }

  /**
   * 결과 HTML 생성 (도구 공통)
   */
  createResultHTML(result) {
    const type = this.toolState.toolType;
    const className = `tool-${type} tool-result`;

    return `
                <div class="result-container ${className}">
                    ${this.createToolResultCard(result)}
                    ${this.createToolActions()}
                </div>
            `;
  }

  /**
   * 도구 결과 카드 생성
   */
  createToolResultCard(result) {
    // 각 도구별로 다른 구조
    switch (this.toolState.toolType) {
      case 'text-counter':
        return this.createTextCounterResult(result);
      case 'salary-calculator':
        return this.createSalaryResult(result);
      case 'bmi-calculator':
        return this.createBMIResult(result);
      default:
        return '';
    }
  }

  /**
   * 글자수 세기 결과
   */
  createTextCounterResult(result) {
    return `
                <div class="result-card">
                    <div class="result-card-header">
                        <span class="result-icon">📝</span>
                        <h2 class="result-title">글자수 분석 결과</h2>
                    </div>
                    <div class="result-card-body">
                        <div class="result-stats">
                            <div class="result-stat">
                                <span class="result-stat-value">${this.formatNumber(result.charCount || 0)}</span>
                                <span class="result-stat-label">글자수</span>
                            </div>
                            <div class="result-stat">
                                <span class="result-stat-value">${this.formatNumber(result.charCountNoSpace || 0)}</span>
                                <span class="result-stat-label">공백 제외</span>
                            </div>
                            <div class="result-stat">
                                <span class="result-stat-value">${this.formatNumber(result.wordCount || 0)}</span>
                                <span class="result-stat-label">단어수</span>
                            </div>
                            <div class="result-stat">
                                <span class="result-stat-value">${this.formatNumber(result.byteCount || 0)}</span>
                                <span class="result-stat-label">바이트</span>
                            </div>
                        </div>
                        ${
                          result.details
                            ? `
                            <div class="result-sections">
                                ${this.createTextAnalysisSection(result.details)}
                            </div>
                        `
                            : ''
                        }
                    </div>
                </div>
            `;
  }

  /**
   * 연봉 계산기 결과 - 하위 클래스에서 상세 구현
   */
  createSalaryResult(result) {
    // Override in salary calculator class
    return '';
  }

  /**
   * BMI 계산기 결과 - 하위 클래스에서 상세 구현
   */
  createBMIResult(result) {
    // Override in BMI calculator class
    return '';
  }

  /**
   * 도구 액션 버튼
   */
  createToolActions() {
    const actions = [];

    // 공유 버튼 (선택적)
    if (this.config.enableShare !== false) {
      actions.push(`
                    <button class="result-action-btn result-action-secondary" data-action="share-kakao">
                        <span>📱</span> 공유하기
                    </button>
                `);
    }

    // 복사 버튼 (text-counter)
    if (this.toolState.toolType === 'text-counter') {
      actions.push(`
                    <button class="result-action-btn result-action-secondary" data-action="copy-result">
                        <span>📋</span> 결과 복사
                    </button>
                `);
    }

    // 초기화 버튼
    actions.push(`
                <button class="result-action-btn result-action-primary" data-action="reset">
                    <span>🔄</span> 초기화
                </button>
            `);

    return actions.length > 0
      ? `
                <div class="result-actions">
                    ${actions.join('')}
                </div>
            `
      : '';
  }

  /**
   * 폼 초기화
   */
  resetForm() {
    const form = document.querySelector('[data-form="tool-input"]');
    if (form) {
      form.reset();
      this.toolState.currentValues = {};

      if (this.toolState.isRealtime) {
        this.showDefaultResult();
      } else {
        const resultArea = document.querySelector(this.config.resultContainer);
        if (resultArea) {
          resultArea.style.display = 'none';
        }
      }
    }
  }

  /**
   * 결과 복사 (text-counter)
   */
  copyResult() {
    const { result } = this.toolState;
    if (!result) {
      return;
    }

    const text =
      `글자수: ${result.charCount}
` +
      `공백제외: ${result.charCountNoSpace}
` +
      `단어수: ${result.wordCount}
` +
      `바이트: ${result.byteCount}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => this.showNotification('결과가 복사되었습니다!'))
        .catch(() => this.fallbackCopyToClipboard(text));
    } else {
      this.fallbackCopyToClipboard(text);
    }
  }

  /**
   * 공유 데이터 가져오기
   */
  getShareData() {
    const { result } = this.state;
    const typeNames = {
      'text-counter': '글자수 세기',
      'salary-calculator': '연봉 실수령액 계산기',
      'bmi-calculator': 'BMI 계산기',
    };

    return {
      title: `${typeNames[this.toolState.toolType]} 결과`,
      description: '유용한 도구를 사용해보세요!',
      imageUrl: 'https://doha.kr/images/tools-share.jpg',
      url: window.location.href,
      buttonText: '도구 사용하기',
    };
  }

  /**
   * 추가 이벤트 바인딩
   */
  bindCommonEvents() {
    super.bindCommonEvents();

    // 결과 복사
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="copy-result"]')) {
        this.copyResult();
      }
      if (e.target.matches('[data-action="reset"]')) {
        this.resetForm();
      }
    });
  }
}

// 전역으로도 내보내기 (레거시 코드 호환성)
window.ToolService = ToolService;
