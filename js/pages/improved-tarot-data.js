// 개선된 타로카드 해석 데이터
// 22장 메이저 아르카나와 3가지 스프레드 구성

// 메이저 아르카나 상세 해석
const detailedMajorArcana = {
  0: {
    name: 'The Fool',
    korean: '바보',
    element: '공기',
    planet: '천왕성',
    upright: {
      keywords: ['새로운 시작', '순수함', '모험', '자유', '신뢰'],
      general:
        '새로운 시작과 가능성이 가득한 시기입니다. 순수한 마음으로 도전해보세요.',
      love: '새로운 연애가 시작되거나 기존 관계에 새로운 활력이 생깁니다. 순수한 마음으로 사랑하세요.',
      career:
        '새로운 직장이나 사업을 시작하기 좋은 시기입니다. 두려워하지 말고 도전하세요.',
      money:
        '새로운 투자 기회가 있지만 신중하게 접근하세요. 무모한 투자는 피하는 것이 좋습니다.',
      health:
        '전반적으로 건강하고 활력이 넘칩니다. 새로운 운동이나 건강법을 시도해보세요.',
      advice:
        '과거에 얽매이지 말고 새로운 가능성을 믿고 도전해보세요. 실패를 두려워하지 마세요.',
    },
    reversed: {
      keywords: ['무모함', '경솔함', '방향감각 상실', '어리석음'],
      general: '성급한 결정이나 무모한 행동을 조심해야 하는 시기입니다.',
      love: '연애에서 너무 성급하게 행동하거나 상대방을 제대로 알아보지 않고 사랑에 빠질 위험이 있습니다.',
      career:
        '준비 없는 이직이나 창업은 위험합니다. 더 신중하게 계획을 세우세요.',
      money:
        '충동적인 소비나 투자로 손실을 볼 수 있습니다. 계획적인 지출이 필요합니다.',
      health: '부주의로 인한 사고나 부상에 주의하세요.',
      advice: '좀 더 신중하게 생각하고 계획을 세운 후 행동하세요.',
    },
  },
  1: {
    name: 'The Magician',
    korean: '마법사',
    element: '수성',
    planet: '수성',
    upright: {
      keywords: ['의지력', '창조력', '능력', '집중', '실현'],
      general:
        '원하는 것을 이룰 수 있는 능력과 의지가 있는 시기입니다. 집중해서 목표를 달성하세요.',
      love: '자신의 매력을 발휘하여 원하는 상대를 얻을 수 있습니다. 적극적으로 어필하세요.',
      career: '뛰어난 능력을 인정받고 중요한 프로젝트를 맡게 될 수 있습니다.',
      money: '자신의 재능과 능력을 통해 수입을 늘릴 수 있는 기회가 있습니다.',
      health: '의지력으로 건강을 개선할 수 있습니다. 목표를 정하고 실천하세요.',
      advice:
        '자신의 능력을 믿고 목표에 집중하세요. 의지력이 현실을 만들어낼 것입니다.',
    },
    reversed: {
      keywords: ['속임수', '능력 부족', '자만심', '조작', '악용'],
      general: '능력을 과신하거나 잘못된 방법을 사용할 위험이 있습니다.',
      love: '상대방을 속이거나 조작하려는 마음은 관계를 망칠 수 있습니다.',
      career:
        '실력 부족이 드러나거나 부정한 방법을 사용하고 싶은 유혹이 있습니다.',
      money: '투기나 사기에 연루될 위험이 있습니다. 정직한 방법을 택하세요.',
      health: '잘못된 건강법이나 과도한 자신감으로 건강을 해칠 수 있습니다.',
      advice:
        '겸손한 마음으로 정직한 방법을 사용하세요. 실력을 더 기르는 것이 중요합니다.',
    },
  },
  2: {
    name: 'The High Priestess',
    korean: '여교황',
    element: '물',
    planet: '달',
    upright: {
      keywords: ['직관', '신비', '내면의 지혜', '잠재의식', '영성'],
      general: '직감을 믿고 내면의 목소리에 귀를 기울여야 하는 시기입니다.',
      love: '영적이고 깊은 사랑을 경험하게 됩니다. 상대방과의 정신적 교감이 중요합니다.',
      career: '직관력이 중요한 역할을 하는 시기입니다. 감을 믿고 행동하세요.',
      money:
        '투자에서 직감이 도움이 될 수 있지만, 너무 충동적이지는 말아야 합니다.',
      health: '몸의 신호에 귀를 기울이고 정신 건강에 신경 쓰세요.',
      advice: '논리보다는 직감을 믿고, 명상이나 성찰의 시간을 가지세요.',
    },
    reversed: {
      keywords: ['비밀', '무지', '표면적 지식', '직감 무시'],
      general: '중요한 정보가 숨겨져 있거나 직감을 무시하고 있을 수 있습니다.',
      love: '상대방이나 자신이 숨기는 것이 있어 진정한 소통이 어려울 수 있습니다.',
      career: '필요한 정보를 얻지 못하거나 잘못된 판단을 할 위험이 있습니다.',
      money: '숨겨진 비용이나 함정이 있을 수 있으니 주의하세요.',
      health: '증상을 간과하거나 몸의 신호를 무시하고 있을 수 있습니다.',
      advice: '더 깊이 있게 상황을 파악하고 직감에 귀를 기울이세요.',
    },
  },
  // ... 나머지 카드들도 동일한 방식으로 구성
  21: {
    name: 'The World',
    korean: '세계',
    element: '토성',
    planet: '토성',
    upright: {
      keywords: ['완성', '성취', '통합', '성공', '여행'],
      general:
        '목표를 달성하고 완성에 이르는 시기입니다. 모든 것이 조화를 이루고 있습니다.',
      love: '완벽한 사랑을 찾거나 관계가 완성 단계에 이릅니다. 결혼이나 약혼의 가능성이 있습니다.',
      career:
        '프로젝트가 성공적으로 완료되고 인정을 받게 됩니다. 승진이나 성공이 예상됩니다.',
      money: '재정적으로 안정되고 목표했던 액수에 도달할 수 있습니다.',
      health: '건강이 회복되고 몸과 마음이 조화를 이룹니다.',
      advice:
        '지금까지의 노력이 결실을 맺는 시기입니다. 성취를 축하하고 다음 목표를 세우세요.',
    },
    reversed: {
      keywords: ['미완성', '좌절', '부족함', '지연'],
      general: '목표에 거의 다다랐지만 마지막 단계에서 어려움을 겪고 있습니다.',
      love: '관계가 완성되지 못하고 어중간한 상태에 머물러 있습니다.',
      career:
        '프로젝트가 마무리되지 못하거나 예상한 성과를 얻지 못할 수 있습니다.',
      money: '목표 금액에 조금 못 미치거나 지출이 예상보다 많을 수 있습니다.',
      health: '완전한 회복까지는 시간이 더 필요합니다.',
      advice:
        '조금 더 인내심을 갖고 마지막까지 최선을 다하세요. 포기하기에는 너무 가까이 왔습니다.',
    },
  },
};

// 3가지 스프레드 구성
const tarotSpreads = {
  pastPresentFuture: {
    name: '과거-현재-미래 스프레드',
    description: '시간의 흐름에 따른 상황 분석',
    positions: [
      {
        position: 1,
        name: '과거',
        meaning: '현재 상황에 영향을 준 과거의 요인이나 원인',
      },
      {
        position: 2,
        name: '현재',
        meaning: '현재의 상황, 당면한 문제나 기회',
      },
      {
        position: 3,
        name: '미래',
        meaning: '현재의 흐름이 계속될 때 예상되는 결과',
      },
    ],
  },
  loveSpread: {
    name: '연애운 스프레드',
    description: '연애와 관련된 상황 분석',
    positions: [
      {
        position: 1,
        name: '내 마음',
        meaning: '연애에 대한 나의 현재 마음상태와 감정',
      },
      {
        position: 2,
        name: '상대방의 마음',
        meaning: '상대방의 마음이나 관심사 (있다면)',
      },
      {
        position: 3,
        name: '관계의 현재',
        meaning: '현재 연애 상황이나 관계의 상태',
      },
      {
        position: 4,
        name: '장애물',
        meaning: '연애에 방해가 되는 요소나 극복해야 할 것',
      },
      {
        position: 5,
        name: '조언',
        meaning: '연애 성공을 위한 구체적인 조언',
      },
      {
        position: 6,
        name: '결과',
        meaning: '노력했을 때 예상되는 연애의 결과',
      },
    ],
  },
  moneySpread: {
    name: '재물운 스프레드',
    description: '재정 상황과 돈 관련 분석',
    positions: [
      {
        position: 1,
        name: '현재 재정상태',
        meaning: '현재의 경제적 상황과 재정 상태',
      },
      {
        position: 2,
        name: '수입원',
        meaning: '돈이 들어오는 주요 경로나 기회',
      },
      {
        position: 3,
        name: '지출 패턴',
        meaning: '돈이 나가는 주요 요인이나 소비 패턴',
      },
      {
        position: 4,
        name: '투자 기회',
        meaning: '유망한 투자 분야나 재테크 방향',
      },
      {
        position: 5,
        name: '주의사항',
        meaning: '돈 관리에서 주의해야 할 점이나 위험 요소',
      },
      {
        position: 6,
        name: '재정 전망',
        meaning: '앞으로의 재정 상황과 재물운 전망',
      },
    ],
  },
};

// 카드 해석 도우미 함수들
const tarotHelpers = {
  // 카드 조합 분석
  analyzeCardCombination(cards) {
    const elements = cards.map(
      (card) => detailedMajorArcana[card.id]?.element || ''
    );
    const dominantElement = this.getDominantElement(elements);

    return {
      dominantElement,
      energy: this.getElementEnergy(dominantElement),
      advice: this.getCombinationAdvice(cards),
    };
  },

  // 주요 원소 찾기
  getDominantElement(elements) {
    const count = {};
    elements.forEach((el) => {
      if (el) {
        count[el] = (count[el] || 0) + 1;
      }
    });
    return Object.keys(count).reduce((a, b) => (count[a] > count[b] ? a : b));
  },

  // 원소별 에너지
  getElementEnergy(element) {
    const energies = {
      공기: '변화와 소통의 에너지',
      불: '열정과 행동의 에너지',
      물: '감정과 직감의 에너지',
      흙: '안정과 현실의 에너지',
    };
    return energies[element] || '균형의 에너지';
  },

  // 조합 조언
  getCombinationAdvice(cards) {
    if (cards.length <= 1) {
      return '단일 카드의 메시지에 집중하세요.';
    }

    const hasReversed = cards.some((card) => card.reversed);
    if (hasReversed) {
      return '역방향 카드가 있으니 더욱 신중하게 접근하세요. 부정적인 측면을 개선할 기회로 보세요.';
    }

    return '카드들의 메시지가 서로 조화를 이루고 있습니다. 균형잡힌 접근이 필요합니다.';
  },

  // 한국적 해석 추가
  addKoreanContext(cardInterpretation, question) {
    const koreanKeywords = {
      연애: '썸, 소개팅, 연애운, 궁합, 결혼',
      직장: '취업, 승진, 이직, 사업, 성공',
      돈: '재테크, 투자, 부동산, 적금, 로또',
      건강: '다이어트, 운동, 병원, 컨디션, 면역력',
      인간관계: '친구, 가족, 상사, 동료, 갈등',
    };

    let context = '';
    for (const [key, keywords] of Object.entries(koreanKeywords)) {
      if (question.includes(key)) {
        context = `한국의 ${key} 문화를 고려할 때, `;
        break;
      }
    }

    return context + cardInterpretation;
  },
};

// 타로 카드별 상세 메시지 생성
const generateDetailedMessage = function (card, position, question) {
  const cardData = detailedMajorArcana[card.id];
  if (!cardData) {
    return '카드 정보를 찾을 수 없습니다.';
  }

  const orientation = card.reversed ? 'reversed' : 'upright';
  const cardInfo = cardData[orientation];

  // 질문과 포지션에 따른 맞춤형 해석
  let message = '';

  if (question.includes('연애') || question.includes('사랑')) {
    message = cardInfo.love || cardInfo.general;
  } else if (question.includes('직업') || question.includes('일')) {
    message = cardInfo.career || cardInfo.general;
  } else if (question.includes('돈') || question.includes('재물')) {
    message = cardInfo.money || cardInfo.general;
  } else if (question.includes('건강')) {
    message = cardInfo.health || cardInfo.general;
  } else {
    message = cardInfo.general;
  }

  // 한국적 맥락 추가
  return tarotHelpers.addKoreanContext(message, question);
};

// 월별 타로 테마
const monthlyTarotThemes = {
  1: {
    theme: '새로운 시작',
    cards: [0, 1, 19],
    message: '새해를 맞아 새로운 가능성을 탐색해보세요.',
  },
  2: {
    theme: '사랑과 관계',
    cards: [2, 6, 17],
    message: '사랑의 달, 인간관계에 집중하기 좋은 시기입니다.',
  },
  3: {
    theme: '성장과 발전',
    cards: [3, 8, 11],
    message: '봄의 시작과 함께 성장 에너지가 강한 시기입니다.',
  },
  4: {
    theme: '안정과 건설',
    cards: [4, 5, 15],
    message: '기반을 다지고 안정을 추구하기 좋은 시기입니다.',
  },
  5: {
    theme: '자유와 모험',
    cards: [0, 7, 14],
    message: '자유롭게 도전하고 새로운 경험을 쌓아보세요.',
  },
  6: {
    theme: '사랑과 결합',
    cards: [6, 2, 19],
    message: '사랑이 결실을 맺는 달, 관계 발전에 좋습니다.',
  },
  7: {
    theme: '열정과 성취',
    cars: [1, 8, 19],
    message: '뜨거운 여름처럼 열정적으로 목표를 추진하세요.',
  },
  8: {
    theme: '힘과 용기',
    cards: [8, 1, 7],
    message: '내면의 힘을 발휘하여 어려움을 극복하는 시기입니다.',
  },
  9: {
    theme: '지혜와 성찰',
    cards: [9, 12, 20],
    message: '가을처럼 성찰하고 지혜를 얻는 시기입니다.',
  },
  10: {
    theme: '변화와 운명',
    cards: [10, 13, 16],
    message: '큰 변화의 시기, 운명의 전환점에 있습니다.',
  },
  11: {
    theme: '균형과 조화',
    cards: [11, 14, 2],
    message: '균형을 찾고 조화로운 상태를 만들어가세요.',
  },
  12: {
    theme: '완성과 마무리',
    cards: [21, 20, 10],
    message: '한 해를 마무리하고 완성을 향해 나아가세요.',
  },
};

// 내보내기
if (typeof window !== 'undefined') {
  window.detailedMajorArcana = detailedMajorArcana;
  window.tarotSpreads = tarotSpreads;
  window.tarotHelpers = tarotHelpers;
  window.generateDetailedMessage = generateDetailedMessage;
  window.monthlyTarotThemes = monthlyTarotThemes;
}
