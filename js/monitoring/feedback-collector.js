/**
 * 사용자 피드백 수집 시스템
 * 한국어 UX 및 모바일 사용성에 대한 피드백을 수집합니다.
 */

class FeedbackCollector {
  constructor(options = {}) {
    this.config = {
      endpoint: options.endpoint || '/api/feedback',
      autoTrigger: options.autoTrigger !== false,
      triggers: {
        timeOnPage: options.timeOnPage || 120000, // 2분 후
        scrollDepth: options.scrollDepth || 80, // 80% 스크롤 후
        interactionCount: options.interactionCount || 10, // 10회 상호작용 후
        errorOccurred: options.errorOccurred !== false,
        testCompleted: options.testCompleted !== false,
      },
      positioning: {
        mobile: options.mobilePosition || 'bottom-right',
        desktop: options.desktopPosition || 'bottom-right',
      },
      ...options,
    };

    this.state = {
      isVisible: false,
      hasTriggered: false,
      feedbackGiven: false,
      interactions: 0,
      scrollDepth: 0,
      timeOnPage: 0,
      errors: [],
    };

    this.startTime = Date.now();
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.createFeedbackUI();
    this.setupTriggers();
    this.setupEventListeners();

    // 피드백 제출 이력 확인
    const lastFeedback = localStorage.getItem('last_feedback_date');
    if (lastFeedback) {
      const daysSinceLastFeedback = (Date.now() - parseInt(lastFeedback)) / (1000 * 60 * 60 * 24);
      if (daysSinceLastFeedback < 7) {
        this.state.feedbackGiven = true; // 최근 7일 내 피드백 제출
      }
    }

    console.log('피드백 수집기가 초기화되었습니다.');
  }

  /**
   * 피드백 UI 생성
   */
  createFeedbackUI() {
    // 피드백 트리거 버튼
    this.triggerButton = this.createElement('div', {
      id: 'feedback-trigger',
      className: 'feedback-trigger',
      innerHTML: `
        <div class="feedback-trigger-content">
          <span class="feedback-icon">💬</span>
          <span class="feedback-text">피드백</span>
        </div>
      `,
      style: `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 25px;
        padding: 12px 20px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
      `,
    });

    // 피드백 모달
    this.modal = this.createElement('div', {
      id: 'feedback-modal',
      className: 'feedback-modal',
      innerHTML: this.createModalHTML(),
      style: `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      `,
    });

    // 스타일 추가
    this.addStyles();

    // DOM에 추가
    document.body.appendChild(this.triggerButton);
    document.body.appendChild(this.modal);

    // 이벤트 리스너
    this.triggerButton.addEventListener('click', () => this.showModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hideModal();
      }
    });
  }

  /**
   * 모달 HTML 생성
   */
  createModalHTML() {
    return `
      <div class="feedback-modal-content">
        <div class="feedback-header">
          <h2>사용 경험을 알려주세요</h2>
          <button class="feedback-close" onclick="window.feedbackCollector.hideModal()">×</button>
        </div>
        
        <div class="feedback-body">
          <!-- 1단계: 전반적 만족도 -->
          <div class="feedback-step dh-state-active" data-step="1">
            <h3>doha.kr 사용은 어떠셨나요?</h3>
            <div class="rating-container">
              <div class="emoji-rating">
                <div class="emoji-option" data-rating="1">
                  <div class="emoji">😞</div>
                  <div class="label">매우 불만</div>
                </div>
                <div class="emoji-option" data-rating="2">
                  <div class="emoji">😕</div>
                  <div class="label">불만</div>
                </div>
                <div class="emoji-option" data-rating="3">
                  <div class="emoji">😐</div>
                  <div class="label">보통</div>
                </div>
                <div class="emoji-option" data-rating="4">
                  <div class="emoji">😊</div>
                  <div class="label">만족</div>
                </div>
                <div class="emoji-option" data-rating="5">
                  <div class="emoji">😍</div>
                  <div class="label">매우 만족</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2단계: 세부 평가 -->
          <div class="feedback-step" data-step="2">
            <h3>다음 항목들을 평가해주세요</h3>
            <div class="detailed-rating">
              <div class="rating-item">
                <label>디자인 및 시각적 요소</label>
                <div class="star-rating" data-category="design">
                  ${this.createStarRating()}
                </div>
              </div>
              <div class="rating-item">
                <label>사용 편의성 (UI/UX)</label>
                <div class="star-rating" data-category="usability">
                  ${this.createStarRating()}
                </div>
              </div>
              <div class="rating-item">
                <label>모바일 사용성</label>
                <div class="star-rating" data-category="mobile">
                  ${this.createStarRating()}
                </div>
              </div>
              <div class="rating-item">
                <label>콘텐츠 품질</label>
                <div class="star-rating" data-category="dh-l-content">
                  ${this.createStarRating()}
                </div>
              </div>
              <div class="rating-item">
                <label>페이지 로딩 속도</label>
                <div class="star-rating" data-category="performance">
                  ${this.createStarRating()}
                </div>
              </div>
            </div>
          </div>

          <!-- 3단계: 구체적 피드백 -->
          <div class="feedback-step" data-step="3">
            <h3>더 자세한 의견을 들려주세요</h3>
            
            <div class="feedback-categories">
              <h4>어떤 부분에 대한 피드백인가요? (복수 선택 가능)</h4>
              <div class="checkbox-group">
                <label><input type="checkbox" value="korean-ui"> 한국어 인터페이스</label>
                <label><input type="checkbox" value="mobile-layout"> 모바일 레이아웃</label>
                <label><input type="checkbox" value="test-experience"> 심리테스트 경험</label>
                <label><input type="checkbox" value="fortune-service"> 운세 서비스</label>
                <label><input type="checkbox" value="tool-usability"> 도구 사용성</label>
                <label><input type="checkbox" value="performance"> 성능/속도</label>
                <label><input type="checkbox" value="accessibility"> 접근성</label>
                <label><input type="checkbox" value="other"> 기타</label>
              </div>
            </div>

            <div class="comment-section">
              <h4>구체적인 의견이나 제안사항</h4>
              <textarea 
                id="feedback-comment" 
                placeholder="좋았던 점, 개선이 필요한 점, 제안사항 등을 자유롭게 작성해주세요..."
                rows="4"
              ></textarea>
            </div>

            <div class="device-info">
              <h4>사용 환경 (자동 수집)</h4>
              <div class="device-details">
                <span class="device-type"></span>
                <span class="browser-info"></span>
                <span class="screen-size"></span>
              </div>
            </div>
          </div>

          <!-- 4단계: 완료 -->
          <div class="feedback-step" data-step="4">
            <div class="feedback-success">
              <div class="success-icon">✅</div>
              <h3>피드백이 전송되었습니다!</h3>
              <p>소중한 의견 감사합니다. 더 나은 서비스를 위해 참고하겠습니다.</p>
              
              <div class="follow-up">
                <h4>추가로 도움이 되실만한 것들:</h4>
                <ul>
                  <li><a href="/faq/">자주 묻는 질문</a></li>
                  <li><a href="/contact/">문의하기</a></li>
                  <li><a href="https://forms.gle/example" target="_blank">상세 사용성 테스트 참여</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="feedback-footer">
          <div class="step-indicator">
            <div class="step-dot dh-state-active" data-step="1"></div>
            <div class="step-dot" data-step="2"></div>
            <div class="step-dot" data-step="3"></div>
            <div class="step-dot" data-step="4"></div>
          </div>
          
          <div class="feedback-actions">
            <button class="btn-secondary" id="feedback-prev" style="display: none;">이전</button>
            <button class="btn-primary" id="feedback-next">다음</button>
            <button class="btn-primary" id="feedback-submit" style="display: none;">전송</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 별점 HTML 생성
   */
  createStarRating() {
    return Array.from(
      { length: 5 },
      (_, i) => `<span class="star" data-rating="${i + 1}">⭐</span>`
    ).join('');
  }

  /**
   * 스타일 추가
   */
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .feedback-trigger:hover {
        background: #5a67d8 !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4) !important;
      }

      .feedback-modal-content {
        background: white;
        border-radius: 16px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        margin: 5vh auto;
        position: relative;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .feedback-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 24px 16px;
        border-bottom: 1px solid #e5e7eb;
      }

      .feedback-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #1f2937;
      }

      .feedback-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6b7280;
        padding: 4px;
        line-height: 1;
      }

      .feedback-body {
        padding: 24px;
        max-height: 50vh;
        overflow-y: auto;
      }

      .feedback-step {
        display: none;
      }

      .feedback-step.active {
        display: block;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .feedback-step h3 {
        margin: 0 0 20px;
        font-size: 18px;
        font-weight: 600;
        color: #374151;
      }

      .emoji-rating {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin: 20px 0;
      }

      .emoji-option {
        text-align: center;
        cursor: pointer;
        padding: 16px 12px;
        border-radius: 12px;
        transition: all 0.2s ease;
        flex: 1;
      }

      .emoji-option:hover {
        background: #f3f4f6;
        transform: translateY(-2px);
      }

      .emoji-option.selected {
        background: #667eea;
        color: white;
      }

      .emoji {
        font-size: 32px;
        margin-bottom: 8px;
      }

      .label {
        font-size: 12px;
        font-weight: 500;
      }

      .detailed-rating {
        space-y: 20px;
      }

      .rating-item {
        margin-bottom: 20px;
      }

      .rating-item label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #374151;
      }

      .star-rating {
        display: flex;
        gap: 4px;
      }

      .star {
        font-size: 24px;
        cursor: pointer;
        opacity: 0.3;
        transition: opacity 0.2s ease;
      }

      .star.active {
        opacity: 1;
      }

      .checkbox-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
        margin: 16px 0;
      }

      .checkbox-group label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;
      }

      .comment-section {
        margin: 24px 0;
      }

      .comment-section h4 {
        margin-bottom: 8px;
        font-weight: 500;
        color: #374151;
      }

      #feedback-comment {
        width: 100%;
        padding: 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
        min-height: 80px;
      }

      .device-info {
        margin-top: 20px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .device-details {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        font-size: 12px;
        color: #6b7280;
      }

      .feedback-success {
        text-align: center;
        padding: 40px 20px;
      }

      .success-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      .follow-up {
        margin-top: 24px;
        text-align: left;
      }

      .follow-up ul {
        list-style: none;
        padding: 0;
      }

      .follow-up li {
        margin-bottom: 8px;
      }

      .follow-up a {
        color: #667eea;
        text-decoration: none;
      }

      .feedback-footer {
        padding: 20px 24px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .step-indicator {
        display: flex;
        gap: 8px;
      }

      .step-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #d1d5db;
        transition: background 0.2s ease;
      }

      .step-dot.active {
        background: #667eea;
      }

      .feedback-actions {
        display: flex;
        gap: 12px;
      }

      .btn-primary, .btn-secondary {
        padding: 8px 16px;
        border-radius: 6px;
        border: none;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background: #667eea;
        color: white;
      }

      .btn-primary:hover {
        background: #5a67d8;
      }

      .btn-secondary {
        background: #f3f4f6;
        color: #374151;
      }

      .btn-secondary:hover {
        background: #e5e7eb;
      }

      @media (max-width: 768px) {
        .feedback-modal-content {
          width: 95%;
          margin: 2vh auto;
          max-height: 95vh;
        }

        .feedback-trigger {
          bottom: 16px !important;
          right: 16px !important;
          padding: 10px 16px !important;
          font-size: 13px !important;
        }

        .emoji-rating {
          gap: 8px;
        }

        .emoji {
          font-size: 28px !important;
        }

        .checkbox-group {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 트리거 조건 설정
   */
  setupTriggers() {
    if (!this.config.autoTrigger) {
      return;
    }

    // 시간 기반 트리거
    setTimeout(() => {
      if (!this.state.hasTriggered && !this.state.feedbackGiven) {
        this.showTrigger('time');
      }
    }, this.config.triggers.timeOnPage);

    // 스크롤 기반 트리거
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollDepth = ((scrollTop + windowHeight) / documentHeight) * 100;

      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        this.state.scrollDepth = scrollDepth;

        if (
          scrollDepth >= this.config.triggers.scrollDepth &&
          !this.state.hasTriggered &&
          !this.state.feedbackGiven
        ) {
          this.showTrigger('scroll');
        }
      }
    });

    // 상호작용 기반 트리거
    ['click', 'touchstart', 'keydown'].forEach((event) => {
      document.addEventListener(event, () => {
        this.state.interactions++;
        if (
          this.state.interactions >= this.config.triggers.interactionCount &&
          !this.state.hasTriggered &&
          !this.state.feedbackGiven
        ) {
          this.showTrigger('interaction');
        }
      });
    });

    // 오류 발생 시 트리거
    if (this.config.triggers.errorOccurred) {
      window.addEventListener('error', (error) => {
        this.state.errors.push(error);
        if (!this.state.hasTriggered && !this.state.feedbackGiven) {
          setTimeout(() => this.showTrigger('error'), 3000); // 3초 후
        }
      });
    }

    // 테스트 완료 시 트리거
    if (this.config.triggers.testCompleted) {
      window.addEventListener('test-completed', () => {
        if (!this.state.hasTriggered && !this.state.feedbackGiven) {
          setTimeout(() => this.showTrigger('test-completion'), 2000); // 2초 후
        }
      });
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // 모달 내 이벤트 위임
    this.modal.addEventListener('click', (e) => {
      // 이모지 평점
      if (e.target.closest('.emoji-option')) {
        const option = e.target.closest('.emoji-option');
        const { rating } = option.dataset;

        // 기존 선택 해제
        option.parentElement.querySelectorAll('.emoji-option').forEach((opt) => {
          opt.classList.remove('selected');
        });

        // 새 선택 적용
        option.classList.add('selected');
        this.feedbackData = this.feedbackData || {};
        this.feedbackData.overallRating = parseInt(rating);
      }

      // 별점 평점
      if (e.target.classList.contains('star')) {
        const star = e.target;
        const rating = parseInt(star.dataset.rating);
        const container = star.parentElement;
        const { category } = container.dataset;

        // 별점 표시 업데이트
        container.querySelectorAll('.star').forEach((s, index) => {
          s.classList.toggle('dh-state-active', index < rating);
        });

        // 데이터 저장
        this.feedbackData = this.feedbackData || {};
        this.feedbackData.detailRatings = this.feedbackData.detailRatings || {};
        this.feedbackData.detailRatings[category] = rating;
      }

      // 단계 이동 버튼
      if (e.target.id === 'feedback-next') {
        this.nextStep();
      } else if (e.target.id === 'feedback-prev') {
        this.prevStep();
      } else if (e.target.id === 'feedback-submit') {
        this.submitFeedback();
      }
    });
  }

  /**
   * 트리거 표시
   */
  showTrigger(reason) {
    if (this.state.hasTriggered || this.state.feedbackGiven) {
      return;
    }

    this.state.hasTriggered = true;
    this.triggerReason = reason;

    // 트리거 버튼 표시
    this.triggerButton.style.opacity = '1';
    this.triggerButton.style.transform = 'translateY(0)';
    this.triggerButton.style.pointerEvents = 'auto';

    // 자동 숨김 (30초 후)
    setTimeout(() => {
      if (this.triggerButton.style.opacity === '1') {
        this.hideTrigger();
      }
    }, 30000);

    console.log(`피드백 트리거 표시됨: ${reason}`);
  }

  /**
   * 트리거 숨김
   */
  hideTrigger() {
    this.triggerButton.style.opacity = '0';
    this.triggerButton.style.transform = 'translateY(20px)';
    this.triggerButton.style.pointerEvents = 'none';
  }

  /**
   * 모달 표시
   */
  showModal() {
    this.currentStep = 1;
    this.feedbackData = {
      triggerReason: this.triggerReason,
      timestamp: new Date().toISOString(),
      sessionData: {
        timeOnPage: Date.now() - this.startTime,
        scrollDepth: this.state.scrollDepth,
        interactions: this.state.interactions,
        errors: this.state.errors.length,
      },
      deviceInfo: this.getDeviceInfo(),
    };

    // 기기 정보 표시
    this.updateDeviceInfo();

    this.modal.style.display = 'block';
    setTimeout(() => {
      this.modal.style.opacity = '1';
    }, 10);

    this.hideTrigger();
  }

  /**
   * 모달 숨김
   */
  hideModal() {
    this.modal.style.opacity = '0';
    setTimeout(() => {
      this.modal.style.display = 'none';
    }, 300);
  }

  /**
   * 다음 단계
   */
  nextStep() {
    if (this.currentStep < 4) {
      this.updateStep(this.currentStep + 1);
    }
  }

  /**
   * 이전 단계
   */
  prevStep() {
    if (this.currentStep > 1) {
      this.updateStep(this.currentStep - 1);
    }
  }

  /**
   * 단계 업데이트
   */
  updateStep(step) {
    // 현재 단계 숨김
    const currentStepEl = this.modal.querySelector(`[data-step="${this.currentStep}"]`);
    if (currentStepEl) {
      currentStepEl.classList.remove('dh-state-active');
    }

    // 새 단계 표시
    const newStepEl = this.modal.querySelector(`.feedback-step[data-step="${step}"]`);
    if (newStepEl) {
      newStepEl.classList.add('dh-state-active');
    }

    // 단계 인디케이터 업데이트
    this.modal.querySelectorAll('.step-dot').forEach((dot, index) => {
      dot.classList.toggle('dh-state-active', index < step);
    });

    // 버튼 상태 업데이트
    const prevBtn = this.modal.querySelector('#feedback-prev');
    const nextBtn = this.modal.querySelector('#feedback-next');
    const submitBtn = this.modal.querySelector('#feedback-submit');

    prevBtn.style.display = step > 1 ? 'block' : 'none';
    nextBtn.style.display = step < 3 ? 'block' : 'none';
    submitBtn.style.display = step === 3 ? 'block' : 'none';

    this.currentStep = step;
  }

  /**
   * 피드백 제출
   */
  async submitFeedback() {
    // 3단계 데이터 수집
    const categories = Array.from(this.modal.querySelectorAll('.checkbox-group input:checked')).map(
      (input) => input.value
    );

    const comment = this.modal.querySelector('#feedback-comment').value.trim();

    this.feedbackData.categories = categories;
    this.feedbackData.comment = comment;
    this.feedbackData.submittedAt = new Date().toISOString();

    try {
      // API로 전송
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.feedbackData),
      });

      if (response.ok) {
        // 성공 시 4단계로 이동
        this.updateStep(4);
        this.state.feedbackGiven = true;

        // 로컬 스토리지에 제출 날짜 저장
        localStorage.setItem('last_feedback_date', Date.now().toString());

        console.log('피드백이 성공적으로 제출되었습니다.');

        // 3초 후 모달 자동 닫기
        setTimeout(() => {
          this.hideModal();
        }, 3000);
      } else {
        throw new Error('서버 오류');
      }
    } catch (error) {
      console.error('피드백 제출 실패:', error);
      alert('피드백 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }

  /**
   * 기기 정보 수집
   */
  getDeviceInfo() {
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
    const isTablet = /iPad|Android.*Tablet/i.test(navigator.userAgent);

    return {
      userAgent: navigator.userAgent,
      deviceType: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
      screenSize: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      platform: navigator.platform,
      touchSupport: 'ontouchstart' in window,
      connectionType: this.getConnectionType(),
    };
  }

  /**
   * 연결 타입 확인
   */
  getConnectionType() {
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection
      ? {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        }
      : null;
  }

  /**
   * 기기 정보 UI 업데이트
   */
  updateDeviceInfo() {
    const { deviceInfo } = this.feedbackData;
    const container = this.modal.querySelector('.device-details');

    if (container) {
      container.innerHTML = `
        <span class="device-type">기기: ${deviceInfo.deviceType}</span>
        <span class="browser-info">브라우저: ${this.getBrowserName(deviceInfo.userAgent)}</span>
        <span class="screen-size">화면: ${deviceInfo.viewportSize}</span>
      `;
    }
  }

  /**
   * 브라우저 이름 추출
   */
  getBrowserName(userAgent) {
    if (userAgent.includes('Chrome')) {
      return 'Chrome';
    }
    if (userAgent.includes('Firefox')) {
      return 'Firefox';
    }
    if (userAgent.includes('Safari')) {
      return 'Safari';
    }
    if (userAgent.includes('Edge')) {
      return 'Edge';
    }
    return 'Unknown';
  }

  /**
   * DOM 요소 생성 헬퍼
   */
  createElement(tag, options = {}) {
    const element = document.createElement(tag);

    Object.entries(options).forEach(([key, value]) => {
      if (key === 'style') {
        element.style.cssText = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else {
        element[key] = value;
      }
    });

    return element;
  }

  /**
   * 수동 피드백 트리거
   */
  trigger(reason = 'manual') {
    this.showTrigger(reason);
  }

  /**
   * 즉시 모달 표시
   */
  show() {
    this.showModal();
  }

  /**
   * 피드백 수집기 종료
   */
  destroy() {
    if (this.triggerButton) {
      this.triggerButton.remove();
    }
    if (this.modal) {
      this.modal.remove();
    }
  }
}

// 전역 사용을 위한 설정
window.FeedbackCollector = FeedbackCollector;

// 자동 초기화
if (document.readyState === 'dh-u-loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.feedbackCollector = new FeedbackCollector();
  });
} else {
  window.feedbackCollector = new FeedbackCollector();
}

export default FeedbackCollector;
