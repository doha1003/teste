/**
 * Saju Fortune Service
 * 사주팔자 서비스 구현
 */

undefined;

export class SajuFortuneService extends FortuneService {
  constructor() {
    super({
      serviceName: 'saju-fortune',
      fortuneType: 'saju',
      resultContainer: '#sajuResult',
    });

    // 사주 관련 데이터
    this.sajuData = null;
  }

  /**
   * 사주 운세 API 호출 및 계산
   */
  async fetchSajuFortune() {
    const birthData = this.fortuneState.birthData;

    try {
      // 음력 변환 처리
      let year = birthData.year;
      let month = birthData.month;
      let day = birthData.day;

      if (birthData.isLunar && window.lunarToSolar) {
        const solarDate = window.lunarToSolar(year, month, day);
        if (solarDate) {
          year = solarDate.year;
          month = solarDate.month;
          day = solarDate.day;
        }
      }

      // 만세력 계산
      let saju = null;
      if (window.calculateSaju) {
        saju = window.calculateSaju(year, month, day, birthData.hour || 12);
      }

      // 만세력 API 호출
      if (window.manseryeokClient) {
        try {
          const manseryeokData = await window.manseryeokClient.getDate(
            year,
            month,
            day,
            birthData.hour || 12
          );
          if (manseryeokData) {
            saju = this.mergeManseryeokData(saju, manseryeokData);
          }
        } catch (error) {
          
        }
      }

      // 사주 데이터 저장
      this.sajuData = saju;

      // 해석 생성
      const interpretation = this.generateSajuInterpretation(saju);

      // AI API 호출 시도
      if (window.generateSajuWithAI) {
        try {
          const aiResult = await window.generateSajuWithAI({
            yearPillar: this.formatPillar(saju.yearPillar),
            monthPillar: this.formatPillar(saju.monthPillar),
            dayPillar: this.formatPillar(saju.dayPillar),
            hourPillar: this.formatPillar(saju.hourPillar),
          });

          if (aiResult) {
            interpretation.aiAnalysis = aiResult;
          }
        } catch (error) {
          
          // 에러가 발생해도 기본 분석으로 계속 진행
        }
      }

      return {
        saju: saju,
        interpretation: interpretation,
        birthData: birthData,
      };
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * 만세력 데이터 병합
   */
  mergeManseryeokData(saju, manseryeokData) {
    if (!saju) saju = {};

    saju.yearPillar = {
      stem: manseryeokData.yearStem,
      branch: manseryeokData.yearBranch,
    };

    saju.monthPillar = {
      stem: manseryeokData.monthStem,
      branch: manseryeokData.monthBranch,
    };

    saju.dayPillar = {
      stem: manseryeokData.dayStem,
      branch: manseryeokData.dayBranch,
    };

    if (manseryeokData.hourStem) {
      saju.hourPillar = {
        stem: manseryeokData.hourStem,
        branch: manseryeokData.hourBranch,
      };
    }

    saju.dayMaster = saju.dayPillar.stem;

    return saju;
  }

  /**
   * 기둥 포맷팅
   */
  formatPillar(pillar) {
    if (!pillar) return '';
    if (typeof pillar === 'string') return pillar;
    return `${pillar.stem || ''}${pillar.branch || ''}`;
  }

  /**
   * 사주 해석 생성
   */
  generateSajuInterpretation(saju) {
    const elements = this.analyzeElements(saju);
    const personality = this.analyzePersonality(saju);
    const fortune = this.analyzeFortune(saju);
    const compatibility = this.analyzeCompatibility(saju);

    return {
      elements: elements,
      personality: personality,
      fortune: fortune,
      compatibility: compatibility,
      advice: this.generateAdvice(saju, elements),
    };
  }

  /**
   * 오행 분석
   */
  analyzeElements(saju) {
    const elements = {
      목: 0,
      화: 0,
      토: 0,
      금: 0,
      수: 0,
    };

    const pillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.hourPillar];

    pillars.forEach((pillar) => {
      if (!pillar) return;

      const stem = pillar.stem || (typeof pillar === 'string' ? pillar.charAt(0) : '');
      const branch = pillar.branch || (typeof pillar === 'string' ? pillar.charAt(1) : '');

      // 천간 오행
      if ('갑을'.includes(stem)) elements.목++;
      else if ('병정'.includes(stem)) elements.화++;
      else if ('무기'.includes(stem)) elements.토++;
      else if ('경신'.includes(stem)) elements.금++;
      else if ('임계'.includes(stem)) elements.수++;

      // 지지 오행
      if ('인묘'.includes(branch)) elements.목++;
      else if ('사오'.includes(branch)) elements.화++;
      else if ('진술축미'.includes(branch)) elements.토++;
      else if ('신유'.includes(branch)) elements.금++;
      else if ('해자'.includes(branch)) elements.수++;
    });

    const total = Object.values(elements).reduce((sum, count) => sum + count, 0);
    const average = total / 5;
    const variance =
      Object.values(elements).reduce((sum, count) => {
        return sum + Math.pow(count - average, 2);
      }, 0) / 5;

    let balance = '매우 균형적';
    if (variance >= 2) balance = '불균형';
    else if (variance >= 1) balance = '약간 불균형';
    else if (variance >= 0.5) balance = '균형적';

    const maxElement = Object.entries(elements).reduce((a, b) =>
      elements[a[0]] > elements[b[0]] ? a : b
    )[0];
    const minElement = Object.entries(elements).reduce((a, b) =>
      elements[a[0]] < elements[b[0]] ? a : b
    )[0];

    return {
      distribution: elements,
      dominant: maxElement,
      lacking: minElement,
      balance: balance,
    };
  }

  /**
   * 성격 분석
   */
  analyzePersonality(saju) {
    const dayMaster = saju.dayMaster || (saju.dayPillar ? saju.dayPillar.stem : null);

    const personalities = {
      갑: '리더십이 강하고 진취적이며 정의감이 강합니다.',
      을: '유연하고 적응력이 뛰어나며 예술적 감각이 있습니다.',
      병: '열정적이고 활발하며 사교성이 좋습니다.',
      정: '따뜻하고 배려심이 깊으며 봉사정신이 강합니다.',
      무: '신뢰감을 주고 포용력이 크며 중재 능력이 뛰어납니다.',
      기: '실용적이고 꼼꼼하며 계획성이 뛰어납니다.',
      경: '결단력이 있고 추진력이 강하며 정의롭습니다.',
      신: '예리하고 분석적이며 완벽주의 성향이 있습니다.',
      임: '지혜롭고 통찰력이 뛰어나며 적응력이 좋습니다.',
      계: '섬세하고 직관력이 뛰어나며 창의적입니다.',
    };

    const strengths = {
      갑: ['리더십', '정의감', '추진력'],
      을: ['유연성', '예술성', '협조성'],
      병: ['열정', '사교성', '긍정성'],
      정: ['배려심', '봉사정신', '온화함'],
      무: ['신뢰성', '포용력', '안정감'],
      기: ['실용성', '계획성', '꼼꼼함'],
      경: ['결단력', '정직성', '용기'],
      신: ['예리함', '분석력', '정확성'],
      임: ['지혜', '통찰력', '유연성'],
      계: ['직관력', '창의성', '섬세함'],
    };

    const weaknesses = {
      갑: ['고집', '융통성 부족', '독단적'],
      을: ['우유부단', '소극적', '의존적'],
      병: ['충동적', '변덕', '과시욕'],
      정: ['감정적', '현실감각 부족', '희생적'],
      무: ['느림', '변화 거부', '고집'],
      기: ['소심함', '비판적', '완고함'],
      경: ['급진적', '타협 부족', '공격적'],
      신: ['차가움', '비판적', '완벽주의'],
      임: ['불안정', '과도한 생각', '우유부단'],
      계: ['예민함', '변덕', '비밀주의'],
    };

    const advice = {
      갑: '때로는 타인의 의견에 귀 기울이는 유연함이 필요합니다.',
      을: '자신감을 가지고 주도적으로 행동해보세요.',
      병: '충동적인 결정보다는 신중한 판단이 중요합니다.',
      정: '자신을 위한 시간도 소중히 여기세요.',
      무: '변화를 두려워하지 말고 새로운 도전을 해보세요.',
      기: '완벽하지 않아도 괜찮다는 것을 받아들이세요.',
      경: '부드러운 카리스마로 사람들을 이끌어보세요.',
      신: '따뜻한 마음을 표현하는 연습을 해보세요.',
      임: '직관을 믿고 과감하게 행동해보세요.',
      계: '자신의 감정을 솔직하게 표현해보세요.',
    };

    return {
      basic: personalities[dayMaster] || '독특한 개성을 가지고 있습니다.',
      strengths: strengths[dayMaster] || ['개성', '독창성', '잠재력'],
      weaknesses: weaknesses[dayMaster] || ['극복해야 할 부분이 있습니다'],
      advice: advice[dayMaster] || '자신만의 장점을 살려 발전해 나가세요.',
    };
  }

  /**
   * 운세 분석
   */
  analyzeFortune(saju) {
    // 간단한 기본 운세 분석
    return {
      overall: '안정과 성장의 균형이 잡힌 시기입니다.',
      career: '새로운 기회가 찾아올 가능성이 높습니다.',
      wealth: '재물운이 점진적으로 상승하는 편입니다.',
      health: '건강 관리에 꾸준한 관심이 필요합니다.',
      relationship: '인간관계에서 긍정적인 변화가 기대됩니다.',
    };
  }

  /**
   * 궁합 분석
   */
  analyzeCompatibility(saju) {
    const dayBranch = saju.dayPillar ? saju.dayPillar.branch || saju.dayPillar.charAt?.(1) : null;

    const compatibilityMap = {
      자: { best: ['신', '진'], good: ['용', '원숭이'], challenging: ['말'] },
      축: { best: ['사', '유'], good: ['뱀', '닭'], challenging: ['양'] },
      인: { best: ['해', '오'], good: ['말', '개'], challenging: ['원숭이'] },
      묘: { best: ['술', '미'], good: ['양', '돼지'], challenging: ['닭'] },
      진: { best: ['유', '자'], good: ['쥐', '원숭이'], challenging: ['개'] },
      사: { best: ['신', '축'], good: ['소', '닭'], challenging: ['돼지'] },
      오: { best: ['미', '인'], good: ['호랑이', '개'], challenging: ['쥐'] },
      미: { best: ['오', '묘'], good: ['토끼', '돼지'], challenging: ['소'] },
      신: { best: ['사', '자'], good: ['쥐', '용'], challenging: ['호랑이'] },
      유: { best: ['진', '축'], good: ['소', '뱀'], challenging: ['토끼'] },
      술: { best: ['묘', '인'], good: ['호랑이', '말'], challenging: ['용'] },
      해: { best: ['인', '미'], good: ['토끼', '양'], challenging: ['뱀'] },
    };

    const data = compatibilityMap[dayBranch] || {
      best: ['조화로운 관계를 만들 수 있습니다'],
      good: ['좋은 관계를 유지할 수 있습니다'],
      challenging: ['노력이 필요한 관계입니다'],
    };

    return data;
  }

  /**
   * 종합 조언 생성
   */
  generateAdvice(saju, elements) {
    const lackingElement = elements.lacking;

    const healthAdvice = {
      목: '간과 눈 건강에 신경쓰고, 스트레스 관리가 중요합니다.',
      화: '심장 건강과 혈액순환에 주의하고, 규칙적인 운동이 필요합니다.',
      토: '소화기 건강에 신경쓰고, 규칙적인 식사가 중요합니다.',
      금: '호흡기와 피부 건강에 주의하고, 충분한 수분 섭취가 필요합니다.',
      수: '신장과 방광 건강에 신경쓰고, 충분한 휴식이 필요합니다.',
    };

    const luckyItems = {
      목: '초록색 계열, 나무 소재, 관엽식물',
      화: '빨강/분홍 계열, 삼각형 모양, 향초',
      토: '노랑/갈색 계열, 도자기, 천연석',
      금: '흰색/금색 계열, 금속 액세서리, 크리스탈',
      수: '검정/파랑 계열, 유리 소품, 물 관련 아이템',
    };

    return {
      career: '창의성과 실용성을 조화롭게 발휘할 수 있는 분야가 적합합니다.',
      wealth: '꾸준한 저축과 현명한 투자로 안정적인 재산을 형성할 수 있습니다.',
      health: healthAdvice[lackingElement] || '균형잡힌 생활습관으로 건강을 유지하세요.',
      relationship: '진심어린 소통과 배려로 깊은 신뢰관계를 형성할 수 있습니다.',
      lucky: luckyItems[lackingElement] || '자연 소재의 아이템들이 도움이 됩니다.',
    };
  }

  /**
   * 사주 결과 카드 생성
   */
  createSajuResultCard(result) {
    const saju = result.saju;
    const interpretation = result.interpretation;
    const today = new Date();

    return `
                <div class="result-card">
                    <div class="result-card-header">
                        <span class="result-icon">🔮</span>
                        <div class="result-type">AI 사주팔자</div>
                        <h2 class="result-title">${this.escapeHtml(this.fortuneState.birthData.name)}님의 사주팔자 분석</h2>
                        <p class="result-subtitle">분석일: ${this.formatDate(today)}</p>
                    </div>
                    <div class="result-card-body">
                        <!-- 사주팔자 표 -->
                        <div class="result-manseryeok">
                            <h3 class="result-section-title">🎯 사주팔자 구성</h3>
                            <div class="result-stats">
                                <div class="result-stat">
                                    <span class="result-stat-label">연주</span>
                                    <span class="result-stat-value">${this.formatPillar(saju.yearPillar)}</span>
                                </div>
                                <div class="result-stat">
                                    <span class="result-stat-label">월주</span>
                                    <span class="result-stat-value">${this.formatPillar(saju.monthPillar)}</span>
                                </div>
                                <div class="result-stat">
                                    <span class="result-stat-label">일주</span>
                                    <span class="result-stat-value">${this.formatPillar(saju.dayPillar)}</span>
                                </div>
                                <div class="result-stat">
                                    <span class="result-stat-label">시주</span>
                                    <span class="result-stat-value">${this.formatPillar(saju.hourPillar)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 오행 분석 -->
                        <div class="result-elements">
                            <h3 class="result-section-title">🌊 오행 분석</h3>
                            <div class="result-chart">
                                ${this.createElementsChart(interpretation.elements)}
                            </div>
                            <div class="result-advice">
                                <p class="result-advice-text">
                                    오행 균형도: <strong>${interpretation.elements.balance}</strong><br>
                                    ${interpretation.elements.dominant}이(가) 강하고 ${interpretation.elements.lacking}이(가) 부족합니다.
                                </p>
                            </div>
                        </div>
                        
                        <!-- 성격 분석 -->
                        <div class="result-personality">
                            <h3 class="result-section-title">👤 성격 분석</h3>
                            <p class="result-section-content">${interpretation.personality.basic}</p>
                            
                            <div class="result-traits">
                                <div class="result-trait-box">
                                    <h4>강점</h4>
                                    <ul>
                                        ${interpretation.personality.strengths
                                          .map((s) => `<li>${this.escapeHtml(s)}</li>`)
                                          .join('')}
                                    </ul>
                                </div>
                                <div class="result-trait-box">
                                    <h4>약점</h4>
                                    <ul>
                                        ${interpretation.personality.weaknesses
                                          .map((w) => `<li>${this.escapeHtml(w)}</li>`)
                                          .join('')}
                                    </ul>
                                </div>
                            </div>
                            
                            <p class="result-advice-text">
                                <strong>조언:</strong> ${interpretation.personality.advice}
                            </p>
                        </div>
                        
                        <!-- 운세 섹션 -->
                        <div class="result-sections">
                            ${this.createFortuneSections(interpretation.fortune)}
                        </div>
                        
                        <!-- 궁합 분석 -->
                        <div class="result-compatibility">
                            <h3 class="result-section-title">💑 궁합 분석</h3>
                            <div class="result-items">
                                <div class="result-item">
                                    <strong>최고의 궁합:</strong> 
                                    ${
                                      Array.isArray(interpretation.compatibility.best)
                                        ? interpretation.compatibility.best.join(', ')
                                        : interpretation.compatibility.best
                                    }
                                </div>
                                <div class="result-item">
                                    <strong>좋은 궁합:</strong> 
                                    ${
                                      Array.isArray(interpretation.compatibility.good)
                                        ? interpretation.compatibility.good.join(', ')
                                        : interpretation.compatibility.good
                                    }
                                </div>
                                <div class="result-item">
                                    <strong>도전적인 궁합:</strong> 
                                    ${
                                      Array.isArray(interpretation.compatibility.challenging)
                                        ? interpretation.compatibility.challenging.join(', ')
                                        : interpretation.compatibility.challenging
                                    }
                                </div>
                            </div>
                        </div>
                        
                        <!-- 종합 조언 -->
                        <div class="result-advice-section">
                            <h3 class="result-section-title">💡 종합 조언</h3>
                            ${this.createAdviceSections(interpretation.advice)}
                            
                            <div class="result-lucky-items">
                                <h4>🍀 행운의 아이템</h4>
                                <p class="result-advice-text">${interpretation.advice.lucky}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
  }

  /**
   * 오행 차트 생성
   */
  createElementsChart(elements) {
    const maxCount = Math.max(...Object.values(elements.distribution));

    return `
                <div class="elements-chart">
                    ${Object.entries(elements.distribution)
                      .map(([element, count]) => {
                        const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        const colorClass = element.includes('목')
                          ? 'wood'
                          : element.includes('화')
                            ? 'fire'
                            : element.includes('토')
                              ? 'earth'
                              : element.includes('금')
                                ? 'metal'
                                : 'water';

                        return `
                            <div class="element-bar ${colorClass}" style="height: ${height}%">
                                <div class="element-value">${count}</div>
                                <div class="element-label">${element}</div>
                            </div>
                        `;
                      })
                      .join('')}
                </div>
            `;
  }

  /**
   * 운세 섹션 생성
   */
  createFortuneSections(fortune) {
    const sections = [
      {
        icon: '🔮',
        title: '전체운',
        content: fortune.overall,
        color: '#8b5cf6',
      },
      {
        icon: '💼',
        title: '직업운',
        content: fortune.career,
        color: '#3b82f6',
      },
      {
        icon: '💰',
        title: '재물운',
        content: fortune.wealth,
        color: '#10b981',
      },
      {
        icon: '❤️',
        title: '건강운',
        content: fortune.health,
        color: '#ef4444',
      },
      {
        icon: '🤝',
        title: '인간관계',
        content: fortune.relationship,
        color: '#f59e0b',
      },
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
   * 조언 섹션 생성
   */
  createAdviceSections(advice) {
    const sections = [
      { title: '직업', content: advice.career },
      { title: '재물', content: advice.wealth },
      { title: '건강', content: advice.health },
      { title: '인간관계', content: advice.relationship },
    ];

    return `
                <div class="result-advice-grid">
                    ${sections
                      .map(
                        (section) => `
                        <div class="result-advice-item">
                            <h4>${section.title}</h4>
                            <p>${this.escapeHtml(section.content)}</p>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            `;
  }

  /**
   * 공유 데이터 가져오기 (오버라이드)
   */
  getShareData() {
    const result = this.state.result;

    return {
      title: '나의 사주팔자 분석 결과',
      description: '만세력 기반 정확한 사주팔자 분석을 확인해보세요!',
      imageUrl: 'https://doha.kr/images/saju-og.png',
      url: window.location.href,
      buttonText: '사주팔자 보기',
    };
  }
}

// 페이지 로드 시 자동 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SajuFortuneService();
  });
} else {
  new SajuFortuneService();
}
