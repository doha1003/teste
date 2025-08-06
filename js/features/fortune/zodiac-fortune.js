/**
 * Zodiac Fortune Service
 * 별자리 운세 서비스 구현
 */

import { FortuneService } from "./fortune-service.js";

export class ZodiacFortuneService extends FortuneService {
  constructor() {
    super({
      serviceName: 'zodiac-fortune',
      fortuneType: 'zodiac',
      resultContainer: '#zodiacResult',
    });

    // 별자리 데이터
    this.zodiacData = {
      aries: {
        symbol: '♈',
        name: '양자리',
        date: '3.21 - 4.19',
        element: '불',
        planet: '화성',
        traits: ['적극적', '열정적', '리더십', '용감한'],
        compatibility: ['사자자리', '사수자리', '쌍둥이자리'],
      },
      taurus: {
        symbol: '♉',
        name: '황소자리',
        date: '4.20 - 5.20',
        element: '흙',
        planet: '금성',
        traits: ['안정적', '현실적', '고집스러운', '성실한'],
        compatibility: ['처녀자리', '염소자리', '게자리'],
      },
      gemini: {
        symbol: '♊',
        name: '쌍둥이자리',
        date: '5.21 - 6.21',
        element: '바람',
        planet: '수성',
        traits: ['호기심', '적응력', '소통능력', '다재다능'],
        compatibility: ['천칭자리', '물병자리', '양자리'],
      },
      cancer: {
        symbol: '♋',
        name: '게자리',
        date: '6.22 - 7.22',
        element: '물',
        planet: '달',
        traits: ['감정적', '가족중심', '직감적', '보호본능'],
        compatibility: ['전갈자리', '물고기자리', '황소자리'],
      },
      leo: {
        symbol: '♌',
        name: '사자자리',
        date: '7.23 - 8.22',
        element: '불',
        planet: '태양',
        traits: ['자신감', '관대함', '창조적', '드라마틱'],
        compatibility: ['양자리', '사수자리', '쌍둥이자리'],
      },
      virgo: {
        symbol: '♍',
        name: '처녀자리',
        date: '8.23 - 9.22',
        element: '흙',
        planet: '수성',
        traits: ['완벽주의', '분석적', '실용적', '섬세한'],
        compatibility: ['황소자리', '염소자리', '게자리'],
      },
      libra: {
        symbol: '♎',
        name: '천칭자리',
        date: '9.23 - 10.22',
        element: '바람',
        planet: '금성',
        traits: ['균형감', '미적감각', '사교적', '평화주의'],
        compatibility: ['쌍둥이자리', '물병자리', '사자자리'],
      },
      scorpio: {
        symbol: '♏',
        name: '전갈자리',
        date: '10.23 - 11.22',
        element: '물',
        planet: '명왕성',
        traits: ['강렬함', '신비로움', '집중력', '변화'],
        compatibility: ['게자리', '물고기자리', '처녀자리'],
      },
      sagittarius: {
        symbol: '♐',
        name: '사수자리',
        date: '11.23 - 12.21',
        element: '불',
        planet: '목성',
        traits: ['자유로움', '모험심', '철학적', '낙관적'],
        compatibility: ['양자리', '사자자리', '천칭자리'],
      },
      capricorn: {
        symbol: '♑',
        name: '염소자리',
        date: '12.22 - 1.19',
        element: '흙',
        planet: '토성',
        traits: ['야심적', '책임감', '인내심', '현실적'],
        compatibility: ['황소자리', '처녀자리', '전갈자리'],
      },
      aquarius: {
        symbol: '♒',
        name: '물병자리',
        date: '1.20 - 2.18',
        element: '바람',
        planet: '천왕성',
        traits: ['독창적', '미래지향', '인도주의', '독립적'],
        compatibility: ['쌍둥이자리', '천칭자리', '사수자리'],
      },
      pisces: {
        symbol: '♓',
        name: '물고기자리',
        date: '2.19 - 3.20',
        element: '물',
        planet: '해왕성',
        traits: ['감성적', '상상력', '직관적', '동정심'],
        compatibility: ['게자리', '전갈자리', '염소자리'],
      },
    };

    this.selectedZodiac = null;
  }

  /**
   * 별자리 선택 초기화 (오버라이드)
   */
  initZodiacSelection() {
    const buttons = document.querySelectorAll('[data-zodiac]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const { zodiac } = btn.dataset;
        this.selectZodiac(zodiac);
      });
    });
  }

  /**
   * 별자리 선택
   */
  selectZodiac(zodiacSign) {
    this.selectedZodiac = zodiacSign;

    // 선택 영역 숨기기
    const selectionDiv = document.getElementById('zodiacSelection');
    if (selectionDiv) {
      selectionDiv.style.display = 'none';
    }

    // 결과 영역 표시
    const resultDiv = document.querySelector(this.config.resultContainer);
    if (resultDiv) {
      resultDiv.classList.remove('d-none-init');
      resultDiv.style.display = 'block';
    }

    this.showLoading('⭐ AI가 별자리 운세를 분석하고 있습니다...');
    this.fetchZodiacFortune(zodiacSign);
  }

  /**
   * 별자리 운세 API 호출
   */
  async fetchZodiacFortune(zodiacSign) {
    try {
      const zodiac = this.zodiacData[zodiacSign];
      const today = new Date();
      const dateStr = today.toLocaleDateString('ko-KR');

      // AI API 호출 시도
      if (window.generateZodiacFortuneWithAI) {
        try {
          const aiResult = await window.generateZodiacFortuneWithAI(zodiacSign);

          if (aiResult) {
            const fortune = this.parseZodiacAIResponse(aiResult);
            this.showResult({
              zodiac,
              fortune,
              isAIGenerated: true,
            });
            return;
          }
        } catch (error) {
          // 에러가 발생해도 기본 운세로 계속 진행
        }
      }

      // 기본 운세 생성
      const fallbackFortune = this.generateFallbackFortune(zodiacSign);
      this.showResult({
        zodiac,
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
  async generateZodiacFortuneWithGemini(zodiacSign) {
    const zodiac = this.zodiacData[zodiacSign];
    const today = new Date();
    const dateStr = today.toLocaleDateString('ko-KR');

    const prompt = `당신은 전문 점성술사입니다. ${zodiac.name}(${zodiac.symbol})의 오늘(${dateStr}) 운세를 분석해주세요.
            
            별자리 정보:
            - 원소: ${zodiac.element}
            - 지배행성: ${zodiac.planet}
            - 특성: ${zodiac.traits.join(', ')}
            
            다음 형식으로 응답해주세요:
            {
                "totalScore": 70-95 사이의 점수,
                "loveScore": 65-95 사이의 점수,
                "moneyScore": 65-95 사이의 점수,
                "healthScore": 65-95 사이의 점수,
                "overallMessage": "전체적인 운세 메시지 (150-250자, 구체적이고 상세하게)",
                "loveMessage": "애정운 메시지 (100-150자, 구체적인 상황과 조언)",
                "moneyMessage": "금전운 메시지 (100-150자, 구체적인 투자/소비 조언)",
                "healthMessage": "건강운 메시지 (100-150자, 구체적인 건강 관리 방법)",
                "advice": "구체적인 조언 (200-300자, 실행 가능한 행동 지침)",
                "luckyColor": "오늘의 행운 색상",
                "luckyNumber": 1-30 사이의 숫자,
                "luckyDirection": "행운의 방향 (동/서/남/북/동남/서남/동북/서북 중 하나)"
            }
            
            ${zodiac.name}의 특성과 2025년 을사년 에너지를 고려하여 구체적이고 실용적인 조언을 포함해주세요.`;

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
  generateFallbackFortune(zodiacSign) {
    const today = new Date();
    const seed = today.getDate() + today.getMonth() + zodiacSign.length;

    const totalScore = 65 + Math.floor(this.seededRandom(seed) * 30);
    const loveScore = 65 + Math.floor(this.seededRandom(seed * 2) * 30);
    const moneyScore = 65 + Math.floor(this.seededRandom(seed * 3) * 30);
    const healthScore = 65 + Math.floor(this.seededRandom(seed * 4) * 30);

    const luckyColors = [
      '딥 레드',
      '로열 블루',
      '골든 옐로우',
      '포레스트 그린',
      '아메시스트 퍼플',
      '선셋 오렌지',
      '로즈 핑크',
      '터쿼이즈',
      '샴페인 골드',
      '문스톤 실버',
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

    const luckyNumber = Math.floor(this.seededRandom(seed * 5) * 30) + 1;
    const luckyColor = luckyColors[Math.floor(this.seededRandom(seed * 6) * luckyColors.length)];
    const luckyDirection =
      luckyDirections[Math.floor(this.seededRandom(seed * 7) * luckyDirections.length)];

    return {
      totalScore,
      loveScore,
      moneyScore,
      healthScore,
      overallMessage: this.getDetailedMessage(zodiacSign, 'overall'),
      loveMessage: this.getDetailedMessage(zodiacSign, 'love'),
      moneyMessage: this.getDetailedMessage(zodiacSign, 'money'),
      healthMessage: this.getDetailedMessage(zodiacSign, 'health'),
      advice: this.getDetailedAdvice(zodiacSign),
      luckyColor,
      luckyNumber,
      luckyDirection,
    };
  }

  /**
   * 시드 기반 랜덤
   */
  seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * 상세 메시지 가져오기
   */
  getDetailedMessage(zodiacSign, type) {
    const messages = {
      aries: {
        overall:
          '화성의 강력한 에너지가 당신의 행동력을 극대화시키는 날입니다. 오전 10시경부터 오후 2시까지가 가장 활발한 시간대이며, 이 시간에 중요한 회의나 프레젠테이션을 잡으면 좋은 결과를 얻을 수 있습니다.',
        love: '연인과의 관계에서 주도권을 잡고 싶은 욕구가 강해지는 날입니다. 솔로라면 오늘 새로운 사람과의 만남에서 첫인상을 강하게 남길 수 있으니 자신감 있게 어필해보세요.',
        money:
          '주식이나 암호화폐 같은 변동성 높은 투자보다는 안정적인 적금이나 국채에 관심을 가져보세요. 충동적인 쇼핑 욕구가 강해지니 고액 구매는 24시간 후에 다시 생각해보세요.',
        health:
          '목과 어깨 근육의 긴장이 심해질 수 있는 날입니다. 30분마다 목 돌리기와 어깨 스트레칭을 해주세요.',
      },
      taurus: {
        overall:
          '금성의 안정적인 에너지가 당신의 일상에 평온함을 가져다주는 날입니다. 급한 변화보다는 천천히 현재 상황을 개선해 나가는 것이 좋습니다.',
        love: '연인이나 배우자와의 관계에서 물질적인 안정감을 추구하게 됩니다. 함께 미래 계획을 세우거나 공동 목표를 정하는 대화를 나누기 좋은 날입니다.',
        money:
          '부동산이나 금과 같은 실물 자산에 관심을 갖기 좋은 시기입니다. 가계부를 점검하고 불필요한 고정비를 줄이는 것도 좋은 방법입니다.',
        health:
          '소화기관이 예민해질 수 있으니 기름진 음식이나 인스턴트 식품은 피하세요. 규칙적인 식사 시간을 지키는 것이 중요합니다.',
      },
      gemini: {
        overall:
          '수성의 활발한 에너지가 당신의 소통 능력을 극대화시키는 날입니다. 여러 사람과의 네트워킹이나 새로운 정보 습득에 매우 유리한 시기입니다.',
        love: '대화를 통해 상대방과 더 깊이 이해하게 되는 날입니다. 특히 SNS나 메신저를 통한 소통이 활발해지며, 멀리 있는 사람과도 좋은 관계를 유지할 수 있습니다.',
        money:
          '정보 수집과 분석을 통해 좋은 투자 기회를 찾을 수 있는 날입니다. 여러 사람의 의견을 들어보되, 최종 결정은 신중하게 내리세요.',
        health:
          '신경이 예민해지고 집중력이 떨어질 수 있는 날입니다. 카페인 섭취를 줄이고 대신 허브차나 따뜻한 우유를 마시는 것이 좋습니다.',
      },
      cancer: {
        overall:
          '달의 정서적 에너지가 당신의 감수성을 높이는 날입니다. 가족이나 가까운 사람들과의 관계에서 깊은 유대감을 느낄 수 있습니다.',
        love: '상대방의 감정 상태를 세심하게 파악하고 배려하는 모습을 보이게 됩니다. 진솔한 대화를 통해 서로를 더 잘 이해하게 될 것입니다.',
        money:
          '장기적인 재정 계획을 세우기 좋은 시기입니다. 가족을 위한 투자나 보험 상품에 관심을 가져보세요.',
        health:
          '감정 기복이 심해지면서 식욕에도 변화가 있을 수 있습니다. 스트레스성 과식이나 식욕 부진을 주의하세요.',
      },
      leo: {
        overall:
          '태양의 찬란한 에너지가 당신의 존재감을 극대화시키는 날입니다. 어떤 모임이든 자연스럽게 중심인물이 되며, 사람들의 주목을 받게 됩니다.',
        love: '당신의 매력이 최고조에 달하는 날입니다. 연인과의 관계에서 로맨틱한 이벤트를 준비하거나 특별한 데이트를 계획해보세요.',
        money:
          '투자나 사업에서 큰 성과를 얻을 수 있는 가능성이 높습니다. 특히 엔터테인먼트, 패션, 뷰티 관련 분야에 관심을 가져보세요.',
        health:
          '에너지가 넘치는 하루이지만, 무리한 활동은 피하세요. 심장과 등 부위를 특히 주의해야 합니다.',
      },
      virgo: {
        overall:
          '수성의 분석적 에너지가 당신의 완벽주의 성향을 더욱 강화시키는 날입니다. 세심한 관찰력과 체계적인 접근으로 문제를 해결하는 능력이 돋보입니다.',
        love: '상대방의 작은 변화나 필요한 것을 민감하게 감지하고 도움을 주려는 마음이 강해집니다. 실용적이고 현실적인 조언을 해주며 든든한 지지자 역할을 하게 됩니다.',
        money:
          '재정 관리와 계획 수립에 특히 능한 날입니다. 보험이나 연금 상품 검토, 재테크 공부에 집중하기 좋은 시기입니다.',
        health:
          '건강 관리에 대한 관심이 높아지며, 체계적인 건강 계획을 세우기 좋은 시기입니다. 정기 건강검진이나 영양 상담을 받아보세요.',
      },
      libra: {
        overall:
          '금성의 조화로운 에너지가 당신의 밸런스 감각을 극대화시키는 특별한 날입니다. 대인관계에서 중재자 역할을 하며 갈등을 해결하는 능력이 돋보입니다.',
        love: '연인과의 관계에서 서로의 다른 점을 이해하고 타협점을 찾아가는 성숙한 모습을 보이게 됩니다. 문화적인 데이트가 특히 좋은 분위기를 만들어줄 것입니다.',
        money:
          '투자 포트폴리오의 균형을 맞추기 좋은 시기입니다. 예술품이나 명품 같은 가치 투자도 고려해볼 만합니다.',
        health:
          '심리적 안정이 신체 건강에 큰 영향을 미치는 날입니다. 스트레스 관리를 위해 명상이나 아로마 테라피를 시도해보세요.',
      },
      scorpio: {
        overall:
          '명왕성의 강렬한 변화 에너지가 당신의 통찰력을 극대화시키는 날입니다. 표면적으로 보이지 않는 진실이나 숨겨진 의도를 파악하는 능력이 뛰어납니다.',
        love: '연인과의 관계에서 더욱 깊은 정서적 유대감을 추구하게 됩니다. 표면적인 대화보다는 진솔하고 솔직한 마음을 나누는 시간을 가져보세요.',
        money:
          '투자에 대한 날카로운 직감이 빛나는 날입니다. 특히 부동산이나 자원 관련 투자에서 좋은 기회를 발견할 수 있습니다.',
        health:
          '신체의 재생 능력이 높아지는 시기입니다. 디톡스나 단식 요법 등을 통해 몸을 정화하는 것이 효과적입니다.',
      },
      sagittarius: {
        overall:
          '목성의 확장적인 에너지가 당신의 모험심을 자극하는 날입니다. 새로운 경험이나 학습에 대한 열망이 강해지며, 해외 관련 일이나 철학적 사고에 관심을 갖게 됩니다.',
        love: '자유롭고 개방적인 관계를 추구하게 됩니다. 연인과 함께 새로운 장소를 탐험하거나 모험적인 활동을 해보세요.',
        money:
          '해외 투자나 글로벌 펀드에 관심을 가져보세요. 교육이나 여행 관련 지출이 늘어날 수 있지만, 이는 장기적으로 도움이 되는 투자입니다.',
        health:
          '야외 활동과 운동을 통해 건강을 증진시키기 좋은 시기입니다. 등산이나 조깅, 자전거 타기 등 활동적인 운동이 특히 좋습니다.',
      },
      capricorn: {
        overall:
          '토성의 체계적인 에너지가 당신의 책임감과 인내력을 강화시키는 날입니다. 장기적인 목표를 향해 꾸준히 노력하는 모습이 인정받게 됩니다.',
        love: '연인과의 관계에서 안정감과 신뢰를 바탕으로 한 깊은 유대감을 형성하게 됩니다. 미래에 대한 구체적인 계획을 함께 세워보세요.',
        money:
          '장기적인 재정 계획을 세우기 매우 좋은 시기입니다. 연금이나 보험 상품, 부동산 투자 등 안정적인 자산 형성에 집중하세요.',
        health:
          '규칙적인 생활 패턴과 꾸준한 건강 관리가 중요한 시기입니다. 무릎과 관절 건강을 특히 주의하세요.',
      },
      aquarius: {
        overall:
          '천왕성의 혁신적인 에너지가 당신의 독창성을 극대화시키는 날입니다. 기존의 관습이나 틀에서 벗어나 새로운 접근 방식을 시도하게 됩니다.',
        love: '연인과의 관계에서 자유롭고 평등한 파트너십을 추구하게 됩니다. 서로의 개성과 독립성을 존중하면서도 깊은 우정을 바탕으로 한 사랑을 키워나가게 됩니다.',
        money:
          '혁신적인 기술이나 미래 산업에 대한 투자를 고려해볼 시기입니다. 특히 AI, 블록체인, 환경 기술 관련 분야에 관심을 가져보세요.',
        health:
          '새로운 건강 관리 방법이나 운동법을 시도해보기 좋은 시기입니다. 웨어러블 기기나 헬스 앱을 활용한 스마트 헬스케어에 관심을 가져보세요.',
      },
      pisces: {
        overall:
          '해왕성의 신비로운 에너지가 당신의 직감과 창의력을 극대화시키는 날입니다. 예술적 감각이 뛰어나며, 창작 활동에서 영감을 받을 수 있습니다.',
        love: '연인과의 관계에서 깊은 감정적 교감을 나누게 됩니다. 말보다는 마음으로 소통하는 시간이 많아지며, 상대방의 기분이나 상태를 직감적으로 파악하게 됩니다.',
        money:
          '직감적인 투자 판단이 좋은 결과를 가져올 수 있는 시기입니다. 특히 예술품이나 수집품, 주얼리 등 가치 투자에 관심을 가져보세요.',
        health:
          '정신적 안정과 영적 균형이 신체 건강에 큰 영향을 미치는 시기입니다. 명상이나 요가, 태극권 등 몸과 마음을 동시에 치유하는 활동을 추천합니다.',
      },
    };

    return messages[zodiacSign]?.[type] || '오늘은 특별한 에너지가 느껴지는 날입니다.';
  }

  /**
   * 상세 조언 가져오기
   */
  getDetailedAdvice(zodiacSign) {
    const advices = {
      aries:
        '오늘은 리더십을 발휘하되 독단적이지 않게 조심하세요. 중요한 결정을 내리기 전에 최소 3명 이상의 신뢰할 만한 사람들과 상의해보세요.',
      taurus:
        '안정을 추구하는 것은 좋지만 너무 변화를 거부하지는 마세요. 새로운 기회가 왔을 때 최소 24시간은 생각해본 후 결정하세요.',
      gemini:
        '다양한 정보를 접하는 것은 좋지만 너무 산만해지지 않도록 주의하세요. 하루에 처리할 일을 3가지 이내로 제한하고 우선순위를 정하세요.',
      cancer:
        '감정 기복이 심할 수 있으니 중요한 결정은 감정이 안정된 후에 내리세요. 가족이나 가까운 친구와의 시간을 늘리면 마음의 평화를 찾을 수 있습니다.',
      leo: '자신감이 높아지는 것은 좋지만 다른 사람들의 의견도 귀담아 들으세요. 창의적인 아이디어를 실현하기 위해 구체적인 계획을 세우고 실행에 옮기세요.',
      virgo:
        '완벽을 추구하는 것은 좋지만 너무 세부사항에 얽매이지 마세요. 80% 정도의 완성도로도 충분히 좋은 결과를 얻을 수 있습니다.',
      libra:
        '중요한 결정을 계속 미루지 말고 적절한 시점에 결단을 내리세요. 장단점을 종이에 적어보고 객관적으로 분석해보세요.',
      scorpio:
        '강한 직감을 믿되 객관적인 검증도 함께 하세요. 비밀스러운 일이나 숨겨진 진실을 파악하는 능력이 뛰어나니 이를 활용해보세요.',
      sagittarius:
        '모험심이 강해지지만 무모한 도전은 피하세요. 새로운 경험을 하기 전에 충분한 준비와 계획을 세우세요.',
      capricorn:
        '목표를 향해 꾸준히 나아가되 때로는 휴식도 취하세요. 일과 개인 생활의 균형을 맞추는 것이 중요합니다.',
      aquarius:
        '독창적인 아이디어는 좋지만 현실적인 실현 가능성도 고려하세요. 새로운 기술이나 트렌드에 관심을 가지고 학습해보세요.',
      pisces:
        '직감과 감정에 의존하는 것도 좋지만 현실적인 계획도 세우세요. 예술적 재능을 발휘할 수 있는 기회를 찾아보세요.',
    };

    return (
      advices[zodiacSign] || '오늘은 자신의 장점을 활용하여 목표를 향해 나아가기 좋은 날입니다.'
    );
  }

  /**
   * AI 응답 파싱
   */
  parseZodiacAIResponse(aiData) {
    // AI 응답을 기본 형식으로 변환
    return {
      totalScore: aiData.totalScore || 75,
      loveScore: aiData.loveScore || 70,
      moneyScore: aiData.moneyScore || 70,
      healthScore: aiData.healthScore || 75,
      overallMessage:
        aiData.overallMessage || this.getDetailedMessage(this.selectedZodiac, 'overall'),
      loveMessage: aiData.loveMessage || this.getDetailedMessage(this.selectedZodiac, 'love'),
      moneyMessage: aiData.moneyMessage || this.getDetailedMessage(this.selectedZodiac, 'money'),
      healthMessage: aiData.healthMessage || this.getDetailedMessage(this.selectedZodiac, 'health'),
      advice: aiData.advice || this.getDetailedAdvice(this.selectedZodiac),
      luckyColor: aiData.luckyColor || '골든 옐로우',
      luckyNumber: aiData.luckyNumber || 7,
      luckyDirection: aiData.luckyDirection || '동쪽',
    };
  }

  /**
   * 별자리 결과 카드 생성
   */
  createZodiacResultCard(result) {
    const { zodiac } = result;
    const { fortune } = result;
    const today = new Date();
    const isAIGenerated = result.isAIGenerated || false;

    return `
                <div class="result-card">
                    <div class="result-card-header">
                        <span class="result-icon">${zodiac.symbol}</span>
                        <div class="result-type">${zodiac.name} 운세</div>
                        <h2 class="result-title">${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일</h2>
                        <p class="result-subtitle">${zodiac.date}</p>
                    </div>
                    <div class="result-card-body">
                        <!-- 별자리 정보 -->
                        <div class="result-zodiac-info">
                            <h3 class="result-section-title">별자리 정보</h3>
                            <div class="result-stats">
                                <div class="result-stat">
                                    <span class="result-stat-label">원소</span>
                                    <span class="result-stat-value">${zodiac.element}</span>
                                </div>
                                <div class="result-stat">
                                    <span class="result-stat-label">지배행성</span>
                                    <span class="result-stat-value">${zodiac.planet}</span>
                                </div>
                            </div>
                            <div class="result-traits">
                                <h4>성격 특징</h4>
                                <div class="result-items">
                                    ${zodiac.traits
                                      .map((trait) => `<div class="result-item">${trait}</div>`)
                                      .join('')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- 운세 점수 -->
                        <div class="result-scores">
                            <h3 class="result-section-title">오늘의 운세 점수</h3>
                            ${this.createScoreSection('💫', '총운', fortune.totalScore)}
                            ${this.createScoreSection('💕', '애정운', fortune.loveScore)}
                            ${this.createScoreSection('💰', '금전운', fortune.moneyScore)}
                            ${this.createScoreSection('🏃', '건강운', fortune.healthScore)}
                        </div>
                        
                        <!-- 운세 메시지 -->
                        <div class="result-sections">
                            ${this.createFortuneSection('🌟', '전체 운세', fortune.overallMessage)}
                            ${this.createFortuneSection('💕', '애정운', fortune.loveMessage)}
                            ${this.createFortuneSection('💰', '금전운', fortune.moneyMessage)}
                            ${this.createFortuneSection('🏃', '건강운', fortune.healthMessage)}
                        </div>
                        
                        <!-- 조언 -->
                        <div class="result-advice-section">
                            <h3 class="result-section-title">
                                <span>💡</span>
                                오늘의 조언
                            </h3>
                            <p class="result-advice-text">${this.escapeHtml(fortune.advice)}</p>
                        </div>
                        
                        <!-- 행운 정보 -->
                        <div class="result-lucky-items">
                            <h3 class="result-section-title">🍀 행운 정보</h3>
                            <div class="result-items">
                                <div class="result-item">
                                    <strong>행운의 숫자</strong>
                                    <span>${fortune.luckyNumber}</span>
                                </div>
                                <div class="result-item">
                                    <strong>행운의 색상</strong>
                                    <span>${fortune.luckyColor}</span>
                                </div>
                                <div class="result-item">
                                    <strong>행운의 방향</strong>
                                    <span>${fortune.luckyDirection}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 궁합 -->
                        <div class="result-compatibility">
                            <h3 class="result-section-title">💘 궁합이 좋은 별자리</h3>
                            <div class="result-items">
                                ${zodiac.compatibility
                                  .map((sign) => `<div class="result-item">${sign}</div>`)
                                  .join('')}
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
   * 점수 섹션 생성
   */
  createScoreSection(icon, title, score) {
    return `
                <div class="score-item">
                    <h4>${icon} ${title}</h4>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${score}%"></div>
                    </div>
                    <span class="score-number">${score}점</span>
                </div>
            `;
  }

  /**
   * 운세 섹션 생성
   */
  createFortuneSection(icon, title, content) {
    return `
                <div class="result-section">
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
    const zodiac = this.zodiacData[this.selectedZodiac];

    return {
      title: `${zodiac.name} 오늘의 운세`,
      description: `${zodiac.symbol} ${zodiac.name}의 상세한 운세를 확인해보세요!`,
      imageUrl: 'https://doha.kr/images/zodiac-share.jpg',
      url: window.location.href,
      buttonText: '별자리 운세 보기',
    };
  }
}

// HTML에서 명시적으로 초기화하므로 자동 초기화 제거
