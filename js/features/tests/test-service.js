/**
 * Test Service Base Class
 * 심리테스트 공통 기능을 제공하는 기본 클래스
 */

import { ServiceBase } from '../../core/service-base.js';

export class TestService extends ServiceBase {
  constructor(config) {
    super({
      serviceType: 'test',
      loadingText: '결과를 분석하고 있습니다...',
      errorText: '테스트 처리 중 오류가 발생했습니다.',
      ...config,
    });

    // 테스트 상태 관리
    this.testState = {
      testType: config.testType || 'mbti', // teto-egen, mbti, love-dna
      questions: config.questions || [],
      currentQuestion: 0,
      answers: [],
      userData: {},
      testStarted: false,
      testCompleted: false,
      totalQuestions: config.questions ? config.questions.length : 0,
    };

    // UI 요소 선택자
    this.ui = {
      introScreen: config.introScreen || '#intro-screen',
      testScreen: config.testScreen || '#test-screen',
      resultScreen: config.resultScreen || '#result-screen',
      questionContainer: config.questionContainer || '#question',
      optionsContainer: config.optionsContainer || '#options',
      progressBar: config.progressBar || '#progress',
      progressText: config.progressText || '#progress-text',
      progressPercent: config.progressPercent || '#progress-percent',
      questionNumber: config.questionNumber || '#question-number',
      prevBtn: config.prevBtn || '#prev-btn',
      nextBtn: config.nextBtn || '#next-btn',
      startBtn: config.startBtn || '.test-start-button',
    };

    // 테스트 구성
    this.testConfig = {
      allowBack: config.allowBack !== false,
      showProgress: config.showProgress !== false,
      autoSubmit: config.autoSubmit || false,
      randomizeQuestions: config.randomizeQuestions || false,
      randomizeOptions: config.randomizeOptions || false,
      ...config.testConfig,
    };
  }

  /**
   * 테스트 초기화
   */
  initialize() {
    // 시작 버튼 바인딩
    const startBtn = document.querySelector(this.ui.startBtn);
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startTest());
    }

    // 네비게이션 버튼 바인딩
    const prevBtn = document.querySelector(this.ui.prevBtn);
    const nextBtn = document.querySelector(this.ui.nextBtn);

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousQuestion());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextQuestion());
    }

    // 공통 초기화 (광고, 공유 등)
    this.initializeCommon();

    // 서비스별 초기화
    if (typeof this.initializeService === 'function') {
      this.initializeService();
    }
  }

  /**
   * 테스트 시작
   */
  startTest() {
    if (this.testState.testStarted) {
      return;
    }

    this.testState.testStarted = true;
    this.testState.currentQuestion = 0;
    this.testState.answers = [];

    // 질문 순서 무작위화
    if (this.testConfig.randomizeQuestions) {
      this.shuffleQuestions();
    }

    // 화면 전환
    this.hideElement(this.ui.introScreen);
    this.showElement(this.ui.testScreen);

    // 첫 질문 표시
    this.showQuestion();

    // 테스트 시작 추적
    if (typeof gtag !== 'undefined') {
      gtag('event', 'test_start', {
        event_category: 'Test',
        event_label: this.config.serviceName,
      });
    }
  }

  /**
   * 현재 질문 표시
   */
  showQuestion() {
    const question = this.testState.questions[this.testState.currentQuestion];
    if (!question) {
      return;
    }

    // 진행도 업데이트
    this.updateProgress();

    // 질문 표시
    const questionEl = document.querySelector(this.ui.questionContainer);
    if (questionEl) {
      questionEl.innerHTML = this.escapeHtml(question.question);
    }

    // 질문 번호 표시
    const questionNumEl = document.querySelector(this.ui.questionNumber);
    if (questionNumEl) {
      questionNumEl.textContent = `Q${this.testState.currentQuestion + 1}`;
    }

    // 옵션 표시
    this.showOptions(question);

    // 네비게이션 버튼 상태 업데이트
    this.updateNavigationButtons();
  }

  /**
   * 옵션 표시
   */
  showOptions(question) {
    const optionsContainer = document.querySelector(this.ui.optionsContainer);
    if (!optionsContainer) {
      return;
    }

    let options = [...question.options];

    // 옵션 순서 무작위화
    if (this.testConfig.randomizeOptions) {
      options = this.shuffleArray(options);
    }

    // 현재 답변 가져오기
    const currentAnswer = this.testState.answers[this.testState.currentQuestion];

    optionsContainer.innerHTML = options
      .map((option, index) => {
        const isSelected = currentAnswer && currentAnswer.value === option.value;
        return `
                    <div class="test-option ${isSelected ? 'selected' : ''}" 
                         data-value="${this.escapeHtml(option.value || index)}">
                        <span class="option-text">${this.escapeHtml(option.text)}</span>
                        ${option.emoji ? `<span class="option-emoji">${option.emoji}</span>` : ''}
                    </div>
                `;
      })
      .join('');

    // 옵션 클릭 이벤트 바인딩
    optionsContainer.querySelectorAll('.test-option').forEach((option) => {
      option.addEventListener('click', () => this.selectAnswer(option));
    });
  }

  /**
   * 답변 선택
   */
  selectAnswer(optionElement) {
    const { value } = optionElement.dataset;
    const question = this.testState.questions[this.testState.currentQuestion];
    const selectedOption = question.options.find(
      (opt) => (opt.value || question.options.indexOf(opt)).toString() === value
    );

    if (!selectedOption) {
      return;
    }

    // 이전 선택 제거
    const container = optionElement.parentElement;
    container.querySelectorAll('.test-option').forEach((opt) => {
      opt.classList.remove('selected');
    });

    // 새 선택 표시
    optionElement.classList.add('selected');

    // 답변 저장
    this.testState.answers[this.testState.currentQuestion] = {
      questionIndex: this.testState.currentQuestion,
      question: question.question,
      value,
      answer: selectedOption,
    };

    // 자동 진행
    if (this.testConfig.autoSubmit) {
      setTimeout(() => this.nextQuestion(), 500);
    }
  }

  /**
   * 이전 질문으로
   */
  previousQuestion() {
    if (!this.testConfig.allowBack) {
      return;
    }
    if (this.testState.currentQuestion <= 0) {
      return;
    }

    this.testState.currentQuestion--;
    this.showQuestion();
  }

  /**
   * 다음 질문으로
   */
  nextQuestion() {
    // 답변 확인
    if (!this.testState.answers[this.testState.currentQuestion]) {
      this.showNotification('답변을 선택해주세요.', 'warning');
      return;
    }

    // 마지막 질문인 경우
    if (this.testState.currentQuestion >= this.testState.totalQuestions - 1) {
      this.completeTest();
      return;
    }

    this.testState.currentQuestion++;
    this.showQuestion();
  }

  /**
   * 테스트 완료
   */
  completeTest() {
    if (this.testState.testCompleted) {
      return;
    }

    this.testState.testCompleted = true;

    // 화면 전환
    this.hideElement(this.ui.testScreen);
    this.showElement(this.ui.resultScreen);

    // 로딩 표시
    this.showLoading();

    // 결과 계산
    const result = this.calculateResult();

    // 결과 표시
    this.showResult(result);

    // 완료 추적
    if (typeof gtag !== 'undefined') {
      gtag('event', 'test_complete', {
        event_category: 'Test',
        event_label: this.config.serviceName,
        value: result.type || result.score,
      });
    }
  }

  /**
   * 결과 계산 (오버라이드 필요)
   */
  calculateResult() {
    // 각 테스트별로 구현
    throw new Error('calculateResult must be implemented by subclass');
  }

  /**
   * 진행도 업데이트
   */
  updateProgress() {
    if (!this.testConfig.showProgress) {
      return;
    }

    const current = this.testState.currentQuestion + 1;
    const total = this.testState.totalQuestions;
    const percentage = Math.round((current / total) * 100);

    // 프로그레스 바
    const progressBar = document.querySelector(this.ui.progressBar);
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }

    // 프로그레스 텍스트
    const progressText = document.querySelector(this.ui.progressText);
    if (progressText) {
      progressText.textContent = `질문 ${current} / ${total}`;
    }

    // 프로그레스 퍼센트
    const progressPercent = document.querySelector(this.ui.progressPercent);
    if (progressPercent) {
      progressPercent.textContent = `${percentage}%`;
    }
  }

  /**
   * 네비게이션 버튼 상태 업데이트
   */
  updateNavigationButtons() {
    const prevBtn = document.querySelector(this.ui.prevBtn);
    const nextBtn = document.querySelector(this.ui.nextBtn);

    if (prevBtn) {
      prevBtn.disabled = this.testState.currentQuestion === 0 || !this.testConfig.allowBack;
      prevBtn.style.visibility = this.testConfig.allowBack ? 'dh-u-visible' : 'dh-u-hidden';
    }

    if (nextBtn) {
      const isLastQuestion = this.testState.currentQuestion === this.testState.totalQuestions - 1;
      nextBtn.textContent = isLastQuestion ? '결과 보기' : '다음';
    }
  }

  /**
   * 테스트 재시작
   */
  restartTest() {
    this.testState = {
      ...this.testState,
      currentQuestion: 0,
      answers: [],
      testStarted: false,
      testCompleted: false,
    };

    // 화면 초기화
    this.hideElement(this.ui.resultScreen);
    this.hideElement(this.ui.testScreen);
    this.showElement(this.ui.introScreen);
  }

  /**
   * 배열 섞기
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 질문 섞기
   */
  shuffleQuestions() {
    this.testState.questions = this.shuffleArray(this.testState.questions);
  }

  /**
   * 알림 표시
   */
  showNotification(message, type = 'info') {
    // 간단한 알림 구현 (토스트 메시지)
    const notification = document.createElement('div');
    notification.className = `test-notification test-notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // 애니메이션
    setTimeout(() => notification.classList.add('show'), 10);

    // 자동 제거
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * 결과 카드 생성 (테스트용 기본 구현)
   */
  createTestResultCard(result) {
    return `
                <div class="result-card">
                    <div class="result-card-header">
                        <h2 class="result-title">${this.escapeHtml(result.title || '테스트 결과')}</h2>
                        ${result.subtitle ? `<p class="result-subtitle">${this.escapeHtml(result.subtitle)}</p>` : ''}
                    </div>
                    <div class="result-card-body">
                        ${result.description ? `<p class="result-description">${this.escapeHtml(result.description)}</p>` : ''}
                        ${result.details ? `<div class="result-details">${result.details}</div>` : ''}
                    </div>
                </div>
            `;
  }

  /**
   * 공유 데이터 가져오기 (기본 구현)
   */
  getShareData() {
    const typeNames = {
      'teto-egen': '테토-에겐 성격유형',
      mbti: 'MBTI 성격유형',
      'love-dna': '러브 DNA',
    };

    return {
      title: `나의 ${typeNames[this.testState.testType]} 결과`,
      description: '나의 테스트 결과를 확인해보세요!',
      url: window.location.href,
    };
  }

  /**
   * 요소 표시
   */
  showElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.remove('dh-u-hidden', 'mbti-hidden', 'd-none');
      element.style.display = 'block';
    }
  }

  /**
   * 요소 숨기기
   */
  hideElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('dh-u-hidden');
      element.style.display = 'none';
    }
  }
}

// 전역으로도 내보내기 (레거시 코드 호환성)
window.TestService = TestService;
