/**
 * Daily Fortune Service
 * 오늘의 운세 서비스 구현
 */

import { FortuneService } from './fortune-service.js';

export class DailyFortuneService extends FortuneService {
  constructor() {
    super({
      serviceName: 'daily-fortune',
      fortuneType: 'daily',
      resultContainer: '#fortuneResult',
    });
  }

  /**
   * 메인 운세 생성 메서드 (HTML에서 호출됨)
   */
  async generateFortune(userData) {
    try {
      console.log('🔮 generateFortune 호출됨:', userData);

      // 생년월일 데이터 저장
      this.fortuneState.birthData = {
        name: userData.name,
        year: userData.year,
        month: userData.month,
        day: userData.day,
        hour: userData.time !== -1 ? userData.time : null,
        isLunar: userData.isLunar,
      };

      console.log('💾 Fortune State 저장됨:', this.fortuneState.birthData);

      // 로딩 표시
      this.showLoading('오늘의 운세를 분석하고 있습니다...');

      // 운세 데이터 생성
      const result = await this.fetchDailyFortune();

      console.log('✨ 운세 결과:', result);

      // 결과 표시
      this.showResult(result);

      return result;
    } catch (error) {
      console.error('❌ generateFortune 오류:', error);
      this.showError('운세 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      throw error;
    }
  }

  /**
   * 일일 운세 생성 (통합 API 사용)
   */
  async fetchDailyFortune() {
    const { birthData } = this.fortuneState;

    try {
      // 만세력 데이터 계산 (클라이언트 사이드)
      const manseryeokData = this.calculateManseryeok(birthData);

      // 기본 운세 데이터 생성 (Fallback)
      const fortuneData = this.generateDailyFortune(birthData, manseryeokData);

      // 통합 API 호출
      if (window.FortuneAPI) {
        try {
          console.log('🔮 통합 API로 일일 운세 생성 중...');

          const apiData = await window.FortuneAPI.daily(
            birthData.name,
            `${birthData.year}-${String(birthData.month).padStart(2, '0')}-${String(birthData.day).padStart(2, '0')}`,
            birthData.gender || 'male',
            birthData.hour
          );

          if (apiData) {
            console.log('✅ API 운세 데이터 수신:', apiData);
            return { ...fortuneData, ...apiData, manseryeokData, source: 'api' };
          }
        } catch (error) {
          console.warn('⚠️ API 운세 실패, 기본 운세 사용:', error.message);
        }
      }

      console.log('📱 클라이언트 사이드 운세 사용');
      return { ...fortuneData, manseryeokData, source: 'client' };
    } catch (error) {
      console.error('❌ 운세 생성 실패:', error);
      // 모든 계산 실패 시에도 최소한의 운세 제공
      return { ...this.generateDailyFortune(birthData, null), source: 'fallback' };
    }
  }

  /**
   * 클라이언트 사이드 만세력 계산
   */
  calculateManseryeok(birthData) {
    try {
      let { year, month, day } = birthData;

      // 음력 변환 (있는 경우)
      if (birthData.isLunar && window.lunarToSolar) {
        const solarDate = window.lunarToSolar(year, month, day);
        if (solarDate) {
          year = solarDate.year;
          month = solarDate.month;
          day = solarDate.day;
        }
      }

      // 사주 계산 (있는 경우)
      if (window.calculateSaju) {
        const sajuData = window.calculateSaju(year, month, day, birthData.hour || 12);
        if (sajuData) {
          return {
            yearPillar: sajuData.year,
            monthPillar: sajuData.month,
            dayPillar: sajuData.day,
            hourPillar: sajuData.hour,
            dayMaster: sajuData.day ? sajuData.day.substring(0, 1) : null,
          };
        }
      }

      // 기본 만세력 데이터 생성 (간단한 계산)
      return this.generateBasicManseryeok(year, month, day, birthData.hour || 12);
    } catch (error) {
      return null;
    }
  }

  /**
   * 기본 만세력 생성
   */
  generateBasicManseryeok(year, month, day, hour) {
    const stems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
    const branches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

    // 간단한 60갑자 계산
    const yearIndex = (year - 4) % 60;
    const monthIndex = ((year - 4) * 12 + month - 1) % 60;
    const dayIndex =
      Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 1)) / (1000 * 60 * 60 * 24)) %
      60;
    const hourIndex = Math.floor(hour / 2) % 12;

    return {
      yearPillar: stems[yearIndex % 10] + branches[yearIndex % 12],
      monthPillar: stems[monthIndex % 10] + branches[monthIndex % 12],
      dayPillar: stems[dayIndex % 10] + branches[dayIndex % 12],
      hourPillar: stems[Math.floor(hour / 2) % 10] + branches[hourIndex],
      dayMaster: stems[dayIndex % 10],
    };
  }

  /**
   * 기본 일일 운세 생성
   */
  generateDailyFortune(birthData, manseryeokData) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const seed = birthData.day + birthData.month + dayOfWeek;

    // 운세 템플릿
    const templates = {
      general: [
        '오늘은 새로운 기회가 찾아올 수 있는 날입니다. 긍정적인 마음가짐으로 하루를 시작해보세요.',
        '평소보다 더 활기찬 에너지가 느껴지는 날입니다. 적극적으로 행동해보세요.',
        '조금은 휴식이 필요한 때입니다. 무리하지 말고 여유를 가져보세요.',
        '중요한 결정을 내리기 좋은 날입니다. 직감을 믿고 행동하세요.',
        '인간관계에서 좋은 소식이 있을 수 있습니다. 열린 마음으로 소통하세요.',
        '예상치 못한 행운이 찾아올 수 있는 날입니다. 주변을 잘 살펴보세요.',
        '노력한 만큼의 성과가 나타날 수 있는 시기입니다. 꾸준히 노력하세요.',
      ],
      love: [
        '인연과의 만남에 주의를 기울여보세요. 주변에 좋은 사람이 있을 수 있습니다.',
        '연인과의 관계가 더욱 깊어질 수 있는 날입니다. 진솔한 대화를 나눠보세요.',
        '혼자만의 시간도 소중합니다. 자신을 돌아보는 시간을 가져보세요.',
        '새로운 만남의 기회가 있을 수 있습니다. 적극적으로 나서보세요.',
        '사랑하는 사람에게 마음을 표현하기 좋은 날입니다.',
        '지금의 관계에 충실하는 것이 중요합니다. 믿음을 주고받으세요.',
        '감정의 기복이 있을 수 있지만, 긍정적인 마음을 유지하세요.',
      ],
      money: [
        '재정적인 결정은 신중하게 하는 것이 좋습니다. 충동적인 소비를 피하세요.',
        '예상치 못한 수입이 있을 수 있습니다. 하지만 절약은 계속하세요.',
        '투자에 대해 신중하게 생각해볼 때입니다. 전문가의 조언을 구하세요.',
        '금전운이 상승하고 있습니다. 계획적인 소비를 하세요.',
        '저축을 시작하기 좋은 날입니다. 작은 금액부터 시작해보세요.',
        '금전적인 어려움이 있을 수 있지만, 이를 극복할 방법이 보일 것입니다.',
        '부업이나 새로운 수입원을 고려해볼 수 있는 시기입니다.',
      ],
      work: [
        '업무에서 좋은 성과를 기대할 수 있습니다. 동료들과의 협력이 중요합니다.',
        '새로운 프로젝트를 시작하기 좋은 날입니다. 창의적인 아이디어를 발휘하세요.',
        '집중력이 높아지는 날입니다. 중요한 업무를 처리하세요.',
        '팀워크가 빛을 발하는 날입니다. 소통을 중시하세요.',
        '자신의 능력을 인정받을 수 있는 기회가 올 수 있습니다.',
        '업무상 스트레스가 있을 수 있지만, 잘 극복할 수 있을 것입니다.',
        '새로운 기술을 배우거나 역량을 개발하기 좋은 시기입니다.',
      ],
      lucky: {
        colors: ['빨강', '파랑', '녹색', '노랑', '보라', '하양', '검정', '분홍', '주황', '회색'],
        numbers: [
          [7, 14, 21],
          [3, 9, 15],
          [1, 8, 16],
          [4, 11, 22],
          [5, 13, 20],
          [2, 10, 18],
          [6, 12, 24],
        ],
        directions: ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '동북쪽', '서남쪽', '서북쪽'],
        items: [
          '행운의 동전',
          '네 잎 클로버',
          '파란색 펜',
          '향기로운 꽃',
          '작은 돌멩',
          '반짝이는 액세서리',
        ],
      },
    };

    // 운세 선택
    const getFortuneByIndex = (array, index) => array[index % array.length];

    const generalIndex = (seed * 7) % templates.general.length;
    const loveIndex = (seed * 5) % templates.love.length;
    const moneyIndex = (seed * 3) % templates.money.length;
    const workIndex = (seed * 11) % templates.work.length;

    // 행운 아이템
    const luckyColor = getFortuneByIndex(templates.lucky.colors, seed);
    const luckyNumbers = getFortuneByIndex(templates.lucky.numbers, dayOfWeek);
    const luckyDirection = getFortuneByIndex(templates.lucky.directions, seed % 8);
    const luckyItem = getFortuneByIndex(templates.lucky.items, (seed + dayOfWeek) % 6);

    // 특별 메시지 (생일, 특별한 날)
    let specialMessage = '';
    if (birthData.month === today.getMonth() + 1 && birthData.day === today.getDate()) {
      specialMessage = '🎉 생일을 축하합니다! 특별한 하루가 되길 바랍니다.';
    }

    return {
      general: templates.general[generalIndex],
      love: templates.love[loveIndex],
      money: templates.money[moneyIndex],
      work: templates.work[workIndex],
      advice: `오늘의 행운의 색은 ${luckyColor}입니다. ${luckyDirection} 방향에서 좋은 기운이 온다고 합니다.`,
      luckyNumbers,
      luckyColor,
      luckyDirection,
      luckyItem,
      specialMessage,
      date: this.formatDate(today),
      manseryeokData,
    };
  }

  /**
   * 일일 운세 결과 카드 오버라이드
   */
  createDailyResultCard(result) {
    return `
                <div class="result-card">
                    <div class="result-card-header">
                        <span class="result-icon">✨</span>
                        <div class="result-type">오늘의 운세</div>
                        <h2 class="result-title highlight-diagonal highlight-korean animated">${this.escapeHtml(this.fortuneState.birthData.name)}님의 운세</h2>
                        <p class="result-subtitle">${result.date}</p>
                    </div>
                    <div class="result-card-body">
                        ${
                          result.specialMessage
                            ? `
                            <div class="result-special-message highlight-geometric highlight-korean">
                                ${this.escapeHtml(result.specialMessage)}
                            </div>
                        `
                            : ''
                        }
                        
                        <div class="result-sections">
                            ${this.createDailyFortuneSections(result)}
                        </div>
                        
                        <div class="result-advice">
                            <p class="result-advice-text">
                                ${this.escapeHtml(result.advice)}
                            </p>
                        </div>
                        
                        <div class="result-lucky-items">
                            <h3 class="result-section-title">🍀 오늘의 행운 아이템</h3>
                            <div class="result-items">
                                <div class="result-item" style="--item-bg: ${this.getColorCode(result.luckyColor)}20; --item-color: ${this.getColorCode(result.luckyColor)}">
                                    🎨 ${result.luckyColor}
                                </div>
                                ${result.luckyNumbers
                                  .map(
                                    (num) => `
                                    <div class="result-item">🎰 ${num}</div>
                                `
                                  )
                                  .join('')}
                                <div class="result-item">🧭 ${result.luckyDirection}</div>
                                <div class="result-item">✨ ${result.luckyItem}</div>
                            </div>
                        </div>
                        
                        ${result.manseryeokData ? this.createManseryeokSection(result.manseryeokData) : ''}
                    </div>
                </div>
            `;
  }

  /**
   * 만세력 섹션 생성
   */
  createManseryeokSection(data) {
    if (!data || !data.yearPillar) {
      return '';
    }

    return `
                <div class="result-manseryeok">
                    <h3 class="result-section-title">🎴 사주팔자</h3>
                    <div class="result-stats">
                        <div class="result-stat">
                            <span class="result-stat-value">${data.yearPillar}</span>
                            <span class="result-stat-label">년주</span>
                        </div>
                        <div class="result-stat">
                            <span class="result-stat-value">${data.monthPillar}</span>
                            <span class="result-stat-label">월주</span>
                        </div>
                        <div class="result-stat">
                            <span class="result-stat-value">${data.dayPillar}</span>
                            <span class="result-stat-label">일주</span>
                        </div>
                        ${
                          data.hourPillar
                            ? `
                            <div class="result-stat">
                                <span class="result-stat-value">${data.hourPillar}</span>
                                <span class="result-stat-label">시주</span>
                            </div>
                        `
                            : ''
                        }
                    </div>
                </div>
            `;
  }

  /**
   * 색상 코드 변환
   */
  getColorCode(colorName) {
    const colors = {
      빨강: '#ef4444',
      파랑: '#3b82f6',
      녹색: '#10b981',
      노랑: '#f59e0b',
      보라: '#8b5cf6',
      하양: '#f3f4f6',
      검정: '#1f2937',
      분홍: '#ec4899',
      주황: '#f97316',
      회색: '#6b7280',
    };
    return colors[colorName] || '#8b5cf6';
  }
}

// 인스턴스 생성 및 export
export const dailyFortune = new DailyFortuneService();

// 전역에도 연결 (레거시 코드 호환성)
window.dailyFortune = dailyFortune;
