/**
 * Fortune Service Base
 * 운세 서비스 공통 기능 (각 운세별 고유 기능 유지)
 */

import { ServiceBase } from '../../core/service-base.js';
import { logger } from '../../utils/logger.js';

export class FortuneService extends ServiceBase {
  constructor(config) {
    super({
      serviceType: 'fortune',
      loadingText: '운세를 분석하고 있습니다...',
      ...config,
    });

    // 운세 서비스 공통 상태
    this.fortuneState = {
      birthData: null,
      fortuneType: config.fortuneType || 'daily', // daily, saju, tarot, zodiac, zodiac-animal
    };

    // config에도 fortuneType 저장 (하위 호환성)
    this.config.fortuneType = this.fortuneState.fortuneType;
  }

  /**
   * 운세 서비스 초기화
   */
  initializeService() {
    logger.info('Fortune Service Initializing', {
      fortuneType: this.fortuneState.fortuneType,
      serviceId: this.serviceId,
    });

    // 각 운세 타입별 초기화
    switch (this.fortuneState.fortuneType) {
      case 'daily':
      case 'saju':
        this.initBirthDataForm();
        break;
      case 'tarot':
        this.initTarotForm();
        break;
      case 'zodiac':
        this.initZodiacSelection();
        break;
      case 'zodiac-animal':
        this.initZodiacAnimalSelection();
        break;
    }

    logger.info('Fortune Service Initialized', {
      fortuneType: this.fortuneState.fortuneType,
      serviceId: this.serviceId,
    });
  }

  /**
   * 생년월일 입력 폼 초기화 (daily, saju)
   */
  initBirthDataForm() {
    const form = document.querySelector('[data-form="birth-data"]');
    if (!form) {
      return;
    }

    // 연도 드롭다운 채우기
    this.populateYearDropdown();

    // 월 변경 시 일 업데이트
    const monthSelect = form.querySelector('#birthMonth');
    if (monthSelect) {
      monthSelect.addEventListener('change', () => this.updateDayOptions());
    }

    // 폼 제출
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleBirthDataSubmit(e);
    });
  }

  /**
   * 타로 폼 초기화
   */
  initTarotForm() {
    const form = document.querySelector('[data-form="tarot"]');
    if (!form) {
      return;
    }

    // 카드 선택 이벤트
    const cards = form.querySelectorAll('.tarot-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => this.selectTarotCard(card));
    });

    // 폼 제출
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleTarotSubmit(e);
    });
  }

  /**
   * 별자리 선택 초기화
   */
  initZodiacSelection() {
    const buttons = document.querySelectorAll('[data-zodiac]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const { zodiac } = btn.dataset;
        this.showLoading();
        this.fetchZodiacFortune(zodiac);
      });
    });
  }

  /**
   * 띠 선택 초기화
   */
  initZodiacAnimalSelection() {
    const buttons = document.querySelectorAll('[data-zodiac-animal]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const animal = btn.dataset.zodiacAnimal;
        this.showLoading();
        this.fetchZodiacAnimalFortune(animal);
      });
    });
  }

  /**
   * 연도 드롭다운 채우기
   */
  populateYearDropdown() {
    const yearSelect = document.querySelector('#birthYear');
    if (!yearSelect) {
      return;
    }

    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '<option value="">연도 선택</option>';

    for (let year = currentYear; year >= 1920; year--) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = `${year}년`;
      yearSelect.appendChild(option);
    }
  }

  /**
   * 일 옵션 업데이트
   */
  updateDayOptions() {
    const monthSelect = document.querySelector('#birthMonth');
    const daySelect = document.querySelector('#birthDay');
    const yearSelect = document.querySelector('#birthYear');

    if (!monthSelect || !daySelect) {
      return;
    }

    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value) || new Date().getFullYear();

    daySelect.innerHTML = '<option value="">일 선택</option>';

    if (!month) {
      return;
    }

    let days = 31;
    if ([4, 6, 9, 11].includes(month)) {
      days = 30;
    } else if (month === 2) {
      days = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
    }

    for (let day = 1; day <= days; day++) {
      const option = document.createElement('option');
      option.value = day;
      option.textContent = `${day}일`;
      daySelect.appendChild(option);
    }
  }

  /**
   * 생년월일 폼 제출 처리
   */
  async handleBirthDataSubmit(event) {
    const timer = logger.startTimer('Fortune Birth Data Submit');
    const formData = new FormData(event.target);

    // 유효성 검사
    const required = ['userName', 'birthYear', 'birthMonth', 'birthDay'];
    for (const field of required) {
      if (!formData.get(field)) {
        logger.warn('Missing required birth data field', {
          field,
          fortuneType: this.fortuneState.fortuneType,
        });
        this.showNotification('모든 필수 항목을 입력해주세요.', 'error');
        return;
      }
    }

    // 생년월일 데이터 저장
    this.fortuneState.birthData = {
      name: formData.get('userName'),
      year: parseInt(formData.get('birthYear')),
      month: parseInt(formData.get('birthMonth')),
      day: parseInt(formData.get('birthDay')),
      hour: parseInt(formData.get('birthTime')) || null,
      isLunar: formData.get('isLunar') === 'on',
    };

    logger.logUserAction('fortune_birth_data_submit', {
      fortuneType: this.fortuneState.fortuneType,
      hasName: !!this.fortuneState.birthData.name,
      year: this.fortuneState.birthData.year,
      hasHour: !!this.fortuneState.birthData.hour,
      isLunar: this.fortuneState.birthData.isLunar,
    });

    this.showLoading();

    try {
      let result;

      if (this.fortuneState.fortuneType === 'daily') {
        result = await this.fetchDailyFortune();
      } else if (this.fortuneState.fortuneType === 'saju') {
        result = await this.fetchSajuFortune();
      }

      timer.end();
      logger.info('Fortune analysis completed', {
        fortuneType: this.fortuneState.fortuneType,
        hasResult: !!result,
      });

      this.showResult(result);
    } catch (error) {
      timer.end();
      logger.error('Fortune analysis failed', {
        fortuneType: this.fortuneState.fortuneType,
        error: error.message,
        birthData: this.fortuneState.birthData,
      });
      this.showError('운세 분석 중 오류가 발생했습니다.');
    }
  }

  /**
   * 결과 HTML 생성 (운세 공통)
   */
  createResultHTML(result) {
    const type = this.fortuneState.fortuneType;
    const className = `fortune-${type} fortune-result`;

    return `
                <div class="result-container ${className}">
                    ${this.createFortuneResultCard(result)}
                    ${this.createFortuneActions()}
                </div>
            `;
  }

  /**
   * 운세 결과 카드 생성
   */
  createFortuneResultCard(result) {
    // 각 운세 타입별로 다른 구조
    switch (this.fortuneState.fortuneType) {
      case 'daily':
        return this.createDailyResultCard(result);
      case 'saju':
        return this.createSajuResultCard(result);
      case 'tarot':
        return this.createTarotResultCard(result);
      case 'zodiac':
        return this.createZodiacResultCard(result);
      case 'zodiac-animal':
        return this.createZodiacAnimalResultCard(result);
      default:
        return '';
    }
  }

  /**
   * 오늘의 운세 결과 카드
   */
  createDailyResultCard(result) {
    return `
                <div class="result-card">
                    <div class="result-card-header">
                        <span class="result-icon">✨</span>
                        <div class="result-type">오늘의 운세</div>
                        <h2 class="result-title">${this.escapeHtml(this.fortuneState.birthData.name)}님의 운세</h2>
                        <p class="result-subtitle">${this.formatDate(new Date())}</p>
                    </div>
                    <div class="result-card-body">
                        <div class="result-sections">
                            ${this.createDailyFortuneSections(result)}
                        </div>
                    </div>
                </div>
            `;
  }

  /**
   * 일일 운세 섹션들
   */
  createDailyFortuneSections(result) {
    const sections = [
      { icon: '📅', title: '종합운', content: result.general, color: '#8b5cf6' },
      { icon: '💕', title: '애정운', content: result.love, color: '#ec4899' },
      { icon: '💰', title: '재물운', content: result.money, color: '#10b981' },
      { icon: '💼', title: '직장운', content: result.work, color: '#3b82f6' },
    ];

    return sections
      .map(
        (section) => `
                <div class="result-section" style="--section-color: ${section.color}">
                    <h3 class="result-section-title">
                        <span>${section.icon}</span>
                        ${section.title}
                    </h3>
                    <p class="result-section-content">
                        ${this.escapeHtml(section.content)}
                    </p>
                </div>
            `
      )
      .join('');
  }

  /**
   * 공유 및 액션 버튼
   */
  createFortuneActions() {
    return `
                <div class="result-actions">
                    <button class="result-action-btn result-action-kakao" data-action="share-kakao">
                        <span>📱</span> 카카오톡 공유
                    </button>
                    <button class="result-action-btn result-action-secondary" data-action="copy-link">
                        <span>🔗</span> 링크 복사
                    </button>
                    <button class="result-action-btn result-action-primary" data-action="retry">
                        <span>🔄</span> 다시 보기
                    </button>
                </div>
            `;
  }

  /**
   * 공유 데이터 가져오기
   */
  getShareData() {
    const { result } = this.state;
    const typeNames = {
      daily: '오늘의 운세',
      saju: '사주팔자',
      tarot: '타로 운세',
      zodiac: '별자리 운세',
      'zodiac-animal': '띠별 운세',
    };

    return {
      title: `나의 ${typeNames[this.fortuneState.fortuneType]} 결과`,
      description: '자세한 운세를 확인해보세요!',
      imageUrl: 'https://doha.kr/images/fortune-share.jpg',
      url: window.location.href,
      buttonText: '운세 확인하기',
    };
  }

  /**
   * 각 운세별 API 호출은 하위 클래스에서 구현
   */
  async fetchDailyFortune() {
    // Override in daily fortune class
  }

  async fetchSajuFortune() {
    // Override in saju fortune class
  }

  // ... 기타 운세별 메서드
}

// 전역으로도 내보내기 (레거시 코드 호환성)
window.FortuneService = FortuneService;
