/**
 * Zodiac Animal Fortune Service
 * 띠별 운세 서비스 구현
 */

undefined;

export class ZodiacAnimalFortuneService extends FortuneService {
  constructor() {
    super({
      serviceName: 'zodiac-animal-fortune',
      fortuneType: 'zodiac-animal',
      resultContainer: '#fortuneResult',
    });

    // 띠별 데이터
    this.zodiacAnimals = {
      rat: {
        korean: '쥐띠',
        emoji: '🐀',
        element: '水',
        hanja: '子',
        description: '지혜롭고 재빠른 쥐띠는 오늘 좋은 기회를 포착할 수 있습니다.',
        years: [1948, 1960, 1972, 1984, 1996, 2008, 2020],
      },
      ox: {
        korean: '소띠',
        emoji: '🐂',
        element: '土',
        hanja: '丑',
        description: '성실하고 근면한 소띠는 꾸준한 노력이 결실을 맺는 날입니다.',
        years: [1949, 1961, 1973, 1985, 1997, 2009, 2021],
      },
      tiger: {
        korean: '호랑이띠',
        emoji: '🐅',
        element: '木',
        hanja: '寅',
        description: '용맹하고 진취적인 호랑이띠는 도전 정신이 빛을 발하는 날입니다.',
        years: [1950, 1962, 1974, 1986, 1998, 2010, 2022],
      },
      rabbit: {
        korean: '토끼띠',
        emoji: '🐇',
        element: '木',
        hanja: '卯',
        description: '온화하고 신중한 토끼띠는 인간관계에서 좋은 소식이 있을 것입니다.',
        years: [1951, 1963, 1975, 1987, 1999, 2011, 2023],
      },
      dragon: {
        korean: '용띠',
        emoji: '🐉',
        element: '土',
        hanja: '辰',
        description: '위풍당당한 용띠는 리더십을 발휘하기 좋은 날입니다.',
        years: [1952, 1964, 1976, 1988, 2000, 2012, 2024],
      },
      snake: {
        korean: '뱀띠',
        emoji: '🐍',
        element: '火',
        hanja: '巳',
        description: '지혜롭고 신비로운 뱀띠는 직감을 믿고 행동하세요.',
        years: [1953, 1965, 1977, 1989, 2001, 2013, 2025],
      },
      horse: {
        korean: '말띠',
        emoji: '🐎',
        element: '火',
        hanja: '午',
        description: '활동적이고 자유로운 말띠는 새로운 도전에 나서기 좋은 날입니다.',
        years: [1954, 1966, 1978, 1990, 2002, 2014, 2026],
      },
      sheep: {
        korean: '양띠',
        emoji: '🐑',
        element: '土',
        hanja: '未',
        description: '온순하고 배려심 깊은 양띠는 주변 사람들과의 화합이 중요한 날입니다.',
        years: [1955, 1967, 1979, 1991, 2003, 2015, 2027],
      },
      monkey: {
        korean: '원숭이띠',
        emoji: '🐒',
        element: '金',
        hanja: '申',
        description: '영리하고 재치 있는 원숭이띠는 창의적인 아이디어가 빛을 발할 것입니다.',
        years: [1956, 1968, 1980, 1992, 2004, 2016, 2028],
      },
      rooster: {
        korean: '닭띠',
        emoji: '🐓',
        element: '金',
        hanja: '酉',
        description: '부지런하고 정확한 닭띠는 계획한 일들이 순조롭게 진행될 것입니다.',
        years: [1957, 1969, 1981, 1993, 2005, 2017, 2029],
      },
      dog: {
        korean: '개띠',
        emoji: '🐕',
        element: '土',
        hanja: '戌',
        description: '충실하고 정의로운 개띠는 신뢰받는 하루가 될 것입니다.',
        years: [1958, 1970, 1982, 1994, 2006, 2018, 2030],
      },
      pig: {
        korean: '돼지띠',
        emoji: '🐖',
        element: '水',
        hanja: '亥',
        description: '관대하고 복이 많은 돼지띠는 예상치 못한 행운이 찾아올 것입니다.',
        years: [1959, 1971, 1983, 1995, 2007, 2019, 2031],
      },
    };

    this.selectedAnimal = null;
  }

  /**
   * 서비스 초기화 (오버라이드)
   */
  initializeService() {
    // 오늘 날짜 표시
    this.displayTodayDate();

    // 띠 선택 이벤트 바인딩
    this.initZodiacAnimalSelection();
  }

  /**
   * 오늘 날짜 표시
   */
  displayTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[today.getDay()];

    const todayDateElement = document.getElementById('todayDate');
    if (todayDateElement) {
      todayDateElement.textContent = `${year}년 ${month}월 ${day}일 (${weekday})의 띠별 운세`;
    }
  }

  /**
   * 띠 선택 초기화 (오버라이드)
   */
  initZodiacAnimalSelection() {
    const cards = document.querySelectorAll('[data-animal]');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const { animal } = card.dataset;
        this.selectZodiacAnimal(animal);
      });
    });
  }

  /**
   * 띠 선택
   */
  selectZodiacAnimal(animal) {
    const animalData = this.zodiacAnimals[animal];
    if (!animalData) {
      return;
    }

    this.selectedAnimal = animal;

    const resultDiv = document.querySelector(this.config.resultContainer);
    if (resultDiv) {
      resultDiv.classList.remove('d-none-init');
      resultDiv.style.display = 'block';
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    this.showLoading(`🔮 AI가 ${animalData.korean} 운세를 분석하고 있습니다...`);
    this.fetchZodiacAnimalFortune(animal);
  }

  /**
   * 띠별 운세 API 호출
   */
  async fetchZodiacAnimalFortune(animal) {
    try {
      const animalData = this.zodiacAnimals[animal];
      const today = new Date();

      // AI API 호출 시도
      if (window.API_CONFIG && window.API_CONFIG.FORTUNE_API_URL) {
        try {
          const response = await fetch(`${window.API_CONFIG.FORTUNE_API_URL}/fortune`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'zodiac-animal',
              animal,
              animalData,
              date: today.toLocaleDateString('ko-KR'),
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const fortune = this.parseZodiacAnimalAIResponse(result.data);
              this.showResult({
                animal,
                animalData,
                fortune,
                isAIGenerated: true,
              });
              return;
            }
          }
        } catch (error) {
          // 에러가 발생해도 기본 운세로 계속 진행
        }
      }

      // 기본 운세 생성
      const fallbackFortune = this.generateFallbackFortune(animal, animalData);
      this.showResult({
        animal,
        animalData,
        fortune: fallbackFortune,
        isAIGenerated: false,
      });
    } catch (error) {
      this.showError('운세 분석 중 오류가 발생했습니다.');
    }
  }

  /**
   * Gemini API로 운세 생성
   */
  async generateAnimalFortuneWithGemini(animal, animalData) {
    const today = new Date();
    const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

    const prompt = `오늘은 ${dateStr}입니다. ${animalData.korean}의 오늘 운세를 상세히 분석해주세요.
            
            다음 형식으로 응답해주세요:
            {
                "overall": "전체 운세 (80-120자)",
                "love": "연애운 (60-80자)",
                "money": "재물운 (60-80자)",
                "career": "직업운 (60-80자)",
                "health": "건강운 (60-80자)",
                "lucky": {
                    "number": 1~99 사이의 숫자,
                    "color": "행운의 색깔",
                    "direction": "행운의 방향"
                },
                "advice": "오늘의 조언 (80-100자)"
            }
            
            ${animalData.korean}의 특성을 고려하여 실용적이고 긍정적인 운세를 제공해주세요.`;

    try {
      const aiResponse = await window.callGeminiAPI(prompt);
      if (aiResponse) {
        const cleanResponse = aiResponse.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanResponse);
      }
    } catch (error) {}

    return null;
  }

  /**
   * 기본 운세 생성
   */
  generateFallbackFortune(animal, animalData) {
    const today = new Date();
    const seed = today.getDate() + today.getMonth() + animal.length;

    const fortunes = {
      rat: {
        overall:
          '쥐띠에게는 새로운 기회가 열리는 날입니다. 평소보다 더 적극적으로 행동하면 좋은 결과를 얻을 수 있습니다.',
        love: '상대방의 마음을 열기 위해서는 진심 어린 대화가 필요합니다.',
        money: '예상치 못한 수입이 있을 수 있으니 재정 계획을 세워보세요.',
        career: '동료들과의 협업이 중요한 시기입니다. 소통에 신경쓰세요.',
        health: '충분한 수면과 규칙적인 식사로 컨디션을 유지하세요.',
      },
      ox: {
        overall: '소띠의 꾸준함이 빛을 발하는 날입니다. 인내심을 가지고 목표를 향해 나아가세요.',
        love: '연인과의 관계에서 안정감을 느낄 수 있는 좋은 시기입니다.',
        money: '절약하는 습관이 미래의 큰 자산이 될 것입니다.',
        career: '맡은 일을 성실히 수행하면 상사의 인정을 받을 수 있습니다.',
        health: '무리하지 말고 적당한 휴식을 취하는 것이 중요합니다.',
      },
      tiger: {
        overall:
          '호랑이띠의 용기와 추진력이 돋보이는 날입니다. 과감한 도전이 성공으로 이어질 수 있습니다.',
        love: '적극적인 표현이 상대방의 마음을 움직일 수 있습니다.',
        money: '투자에 대한 좋은 정보를 얻을 수 있으니 귀를 열어두세요.',
        career: '리더십을 발휘할 수 있는 기회가 찾아올 것입니다.',
        health: '활동적인 운동으로 에너지를 충전하세요.',
      },
      rabbit: {
        overall: '토끼띠의 세심함과 신중함이 좋은 결과를 가져다주는 날입니다.',
        love: '부드러운 마음씨로 상대방을 배려하면 관계가 더욱 깊어집니다.',
        money: '충동적인 소비를 자제하고 계획적인 지출을 하세요.',
        career: '세부사항에 주의를 기울이면 실수를 방지할 수 있습니다.',
        health: '스트레스 관리에 신경쓰고 마음의 평화를 찾으세요.',
      },
      dragon: {
        overall: '용띠의 카리스마가 빛나는 날입니다. 자신감을 가지고 목표를 향해 전진하세요.',
        love: '매력이 상승하는 시기로 새로운 만남의 기회가 있을 수 있습니다.',
        money: '큰 수익을 기대할 수 있지만 과욕은 금물입니다.',
        career: '중요한 프로젝트를 성공적으로 이끌 수 있는 능력을 보여주세요.',
        health: '자신의 한계를 인지하고 무리하지 않는 것이 중요합니다.',
      },
      snake: {
        overall: '뱀띠의 지혜와 직관력이 빛을 발하는 날입니다. 내면의 목소리에 귀를 기울이세요.',
        love: '깊이 있는 대화로 서로를 더 잘 이해할 수 있는 시기입니다.',
        money: '신중한 투자 결정이 장기적인 이익으로 이어질 것입니다.',
        career: '전략적인 사고로 복잡한 문제를 해결할 수 있습니다.',
        health: '명상이나 요가로 정신적 안정을 찾으세요.',
      },
      horse: {
        overall: '말띠의 활력과 자유로움이 새로운 가능성을 열어주는 날입니다.',
        love: '자유로운 영혼끼리 만나면 특별한 인연이 될 수 있습니다.',
        money: '모험적인 투자보다는 안정적인 선택이 좋습니다.',
        career: '새로운 분야에 도전하면 예상외의 성과를 얻을 수 있습니다.',
        health: '야외 활동으로 신선한 에너지를 충전하세요.',
      },
      sheep: {
        overall: '양띠의 온화함과 예술적 감각이 인정받는 날입니다.',
        love: '따뜻한 마음으로 상대방을 대하면 사랑이 깊어집니다.',
        money: '예술이나 창작 활동으로 수익을 얻을 수 있는 기회가 있습니다.',
        career: '팀워크를 중시하면 좋은 성과를 낼 수 있습니다.',
        health: '정서적 안정이 신체 건강으로 이어집니다.',
      },
      monkey: {
        overall: '원숭이띠의 재치와 영리함이 문제 해결의 열쇠가 되는 날입니다.',
        love: '유머러스한 대화로 상대방의 마음을 사로잡을 수 있습니다.',
        money: '창의적인 아이디어가 수익으로 연결될 가능성이 있습니다.',
        career: '혁신적인 제안으로 주목받을 수 있는 시기입니다.',
        health: '두뇌 활동과 신체 활동의 균형을 맞추세요.',
      },
      rooster: {
        overall: '닭띠의 성실함과 정확성이 좋은 결과를 만들어내는 날입니다.',
        love: '진실한 마음으로 다가가면 상대방도 마음을 열 것입니다.',
        money: '계획적인 저축과 투자로 재산을 늘릴 수 있습니다.',
        career: '꼼꼼한 업무 처리로 신뢰를 쌓을 수 있습니다.',
        health: '규칙적인 생활 리듬을 유지하는 것이 건강의 비결입니다.',
      },
      dog: {
        overall: '개띠의 충성심과 정직함이 신뢰를 얻는 날입니다.',
        love: '진심을 다한 사랑이 상대방에게 전달될 것입니다.',
        money: '정직한 거래가 장기적인 이익으로 돌아옵니다.',
        career: '책임감 있는 모습으로 승진의 기회를 잡을 수 있습니다.',
        health: '스트레스를 해소할 수 있는 취미 활동을 찾으세요.',
      },
      pig: {
        overall: '돼지띠의 복과 낙천성이 행운을 가져다주는 날입니다.',
        love: '관대한 마음으로 상대방을 포용하면 사랑이 더욱 깊어집니다.',
        money: '예상치 못한 횡재수가 있을 수 있으니 기대해보세요.',
        career: '동료들과의 화합으로 업무 효율이 높아집니다.',
        health: '즐거운 마음으로 생활하면 건강도 좋아집니다.',
      },
    };

    const luckyNumbers = [7, 13, 21, 27, 33, 42, 51, 67, 73, 88, 91, 99];
    const luckyColors = [
      '빨간색',
      '파란색',
      '노란색',
      '초록색',
      '보라색',
      '주황색',
      '분홍색',
      '하늘색',
    ];
    const luckyDirections = [
      '동쪽',
      '서쪽',
      '남쪽',
      '북쪽',
      '동남쪽',
      '서남쪽',
      '동북쪽',
      '서북쪽',
    ];

    const animalFortune = fortunes[animal] || fortunes.rat;

    return {
      overall: animalFortune.overall,
      love: animalFortune.love,
      money: animalFortune.money,
      career: animalFortune.career,
      health: animalFortune.health,
      lucky: {
        number: luckyNumbers[seed % luckyNumbers.length],
        color: luckyColors[seed % luckyColors.length],
        direction: luckyDirections[seed % luckyDirections.length],
      },
      advice: `${animalData.korean}의 특성을 살려 오늘 하루를 긍정적으로 보내세요. 작은 행운들이 모여 큰 행복이 될 것입니다.`,
    };
  }

  /**
   * AI 응답 파싱
   */
  parseZodiacAnimalAIResponse(aiData) {
    // AI 응답을 기본 형식으로 변환
    return {
      overall: aiData.overall || '오늘은 좋은 기운이 가득한 날입니다.',
      love: aiData.love || '사랑하는 마음을 표현하기 좋은 날입니다.',
      money: aiData.money || '재정 관리에 신경쓰면 좋은 결과가 있을 것입니다.',
      career: aiData.career || '업무에서 좋은 성과를 기대할 수 있습니다.',
      health: aiData.health || '건강 관리에 주의를 기울이세요.',
      lucky: {
        number: aiData.lucky?.number || 7,
        color: aiData.lucky?.color || '파란색',
        direction: aiData.lucky?.direction || '동쪽',
      },
      advice: aiData.advice || '긍정적인 마음가짐으로 하루를 시작하세요.',
    };
  }

  /**
   * 띠별 운세 결과 카드 생성
   */
  createZodiacAnimalResultCard(result) {
    const { animal } = result;
    const { animalData } = result;
    const { fortune } = result;
    const today = new Date();
    const isAIGenerated = result.isAIGenerated || false;

    return `
                <div class="result-card">
                    <div class="result-card-header">
                        <span class="result-icon">${animalData.emoji}</span>
                        <div class="result-type">${animalData.korean} 운세</div>
                        <h2 class="result-title">${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일</h2>
                        <p class="result-subtitle">오행: ${animalData.element} | 지지: ${animalData.hanja}</p>
                    </div>
                    <div class="result-card-body">
                        <!-- 전체 운세 -->
                        <div class="result-overall">
                            <h3 class="result-section-title">
                                <span>🔮</span>
                                전체 운세
                            </h3>
                            <p class="result-section-content">
                                ${this.escapeHtml(fortune.overall)}
                            </p>
                        </div>
                        
                        <!-- 카테고리별 운세 -->
                        <div class="result-sections">
                            ${this.createFortuneSection('💕', '연애운', fortune.love, '#ec4899')}
                            ${this.createFortuneSection('💰', '재물운', fortune.money, '#10b981')}
                            ${this.createFortuneSection('💼', '직업운', fortune.career, '#3b82f6')}
                            ${this.createFortuneSection('💪', '건강운', fortune.health, '#f59e0b')}
                        </div>
                        
                        <!-- 행운 정보 -->
                        <div class="result-lucky-items">
                            <h3 class="result-section-title">🍀 오늘의 행운</h3>
                            <div class="result-items">
                                <div class="result-item">
                                    <strong>행운의 숫자</strong>
                                    <span>${fortune.lucky.number}</span>
                                </div>
                                <div class="result-item">
                                    <strong>행운의 색깔</strong>
                                    <span>${fortune.lucky.color}</span>
                                </div>
                                <div class="result-item">
                                    <strong>행운의 방향</strong>
                                    <span>${fortune.lucky.direction}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 오늘의 조언 -->
                        <div class="result-advice-section">
                            <h3 class="result-section-title">
                                <span>💡</span>
                                오늘의 조언
                            </h3>
                            <p class="result-advice-text">
                                ${this.escapeHtml(fortune.advice)}
                            </p>
                        </div>
                        
                        <!-- 띠 정보 -->
                        <div class="result-animal-info">
                            <h3 class="result-section-title">띠 정보</h3>
                            <p class="result-section-content">
                                ${this.escapeHtml(animalData.description)}
                            </p>
                            <div class="result-years">
                                <strong>해당 년도:</strong>
                                ${animalData.years.slice(-3).join(', ')}...
                            </div>
                        </div>
                        
                        ${isAIGenerated ? '<div class="ai-badge">🤖 AI 실시간 분석</div>' : ''}
                        
                        <div class="result-disclaimer">
                            <small>※ 본 운세는 AI가 분석한 참고용 정보입니다.</small>
                        </div>
                    </div>
                </div>
            `;
  }

  /**
   * 운세 섹션 생성
   */
  createFortuneSection(icon, title, content, color) {
    return `
                <div class="result-section" style="--section-color: ${color}">
                    <h3 class="result-section-title">
                        <span>${icon}</span>
                        ${title}
                    </h3>
                    <p class="result-section-content">
                        ${this.escapeHtml(content)}
                    </p>
                </div>
            `;
  }

  /**
   * 공유 데이터 가져오기 (오버라이드)
   */
  getShareData() {
    const animalData = this.zodiacAnimals[this.selectedAnimal];

    return {
      title: `${animalData.korean} 오늘의 운세`,
      description: `${animalData.emoji} ${animalData.korean}의 상세한 운세를 확인해보세요!`,
      imageUrl: 'https://doha.kr/images/zodiac-animal-share.jpg',
      url: window.location.href,
      buttonText: '띠별 운세 보기',
    };
  }
}

// 페이지 로드 시 자동 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ZodiacAnimalFortuneService();
  });
} else {
  new ZodiacAnimalFortuneService();
}
