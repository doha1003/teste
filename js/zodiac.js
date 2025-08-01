// 별자리 운세 JavaScript

const zodiacData = {
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
async function selectZodiac(zodiacSign) {
  document.getElementById('zodiacSelection').style.display = 'none';
  const resultDiv = document.getElementById('zodiacResult');
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = ` <div class="zodiac-ai-analyzing"> ⭐ AI가 별자리 운세를 분석하고 있습니다... <div class="fortune-loading-info"> ${zodiacData[zodiacSign].name} 운세 분석 중 </div> </div> `;
  try {
    const aiAnalysis = await generateZodiacFortuneWithAI(zodiacSign);
    displayZodiacResult(zodiacSign, aiAnalysis);
  } catch (error) {
    
    const fallbackFortune = generateFallbackFortune(zodiacSign);
    displayZodiacResult(zodiacSign, fallbackFortune);
  }
}
async function generateZodiacFortuneWithAI(zodiacSign) {
  const zodiac = zodiacData[zodiacSign];
  const today = new Date();
  const dateStr = today.toLocaleDateString('ko-KR');
  const prompt = `당신은 전문 점성술사입니다. ${zodiac.name}(${zodiac.symbol})의 오늘(${dateStr}) 운세를 분석해주세요. 별자리 정보: - 원소: ${zodiac.element} - 지배행성: ${zodiac.planet} - 특성: ${zodiac.traits.join(', ')} 다음 형식으로 응답해주세요: { "totalScore": 70-95 사이의 점수, "loveScore": 65-95 사이의 점수, "moneyScore": 65-95 사이의 점수, "healthScore": 65-95 사이의 점수, "overallMessage": "전체적인 운세 메시지 (150-250자, 구체적이고 상세하게)", "loveMessage": "애정운 메시지 (100-150자, 구체적인 상황과 조언)", "moneyMessage": "금전운 메시지 (100-150자, 구체적인 투자/소비 조언)", "healthMessage": "건강운 메시지 (100-150자, 구체적인 건강 관리 방법)", "advice": "구체적인 조언 (200-300자, 실행 가능한 행동 지침)", "luckyColor": "오늘의 행운 색상", "luckyNumber": 1-30 사이의 숫자, "luckyDirection": "행운의 방향 (동/서/남/북/동남/서남/동북/서북 중 하나)" } ${zodiac.name}의 특성과 2025년 을사년 에너지를 고려하여 구체적이고 실용적인 조언을 포함해주세요. 뻔한 내용이 아닌 개인적이고 디테일한 내용으로 작성해주세요.`;
  try {
    const aiResponse = await callGeminiAPI(prompt);
    if (aiResponse) {
      const cleanResponse = aiResponse.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanResponse);
      return parsed;
    }
  } catch (error) {
    
  }
  return null;
}
function generateFallbackFortune(zodiacSign) {
  const zodiac = zodiacData[zodiacSign];
  const today = new Date();
  const seed = today.getDate() + today.getMonth() + zodiacSign.length;
  const totalScore = 65 + Math.floor(seededRandom(seed) * 30);
  const loveScore = 65 + Math.floor(seededRandom(seed * 2) * 30);
  const moneyScore = 65 + Math.floor(seededRandom(seed * 3) * 30);
  const healthScore = 65 + Math.floor(seededRandom(seed * 4) * 30);
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
  const luckyDirections = ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '서남쪽', '동북쪽', '서북쪽'];
  const luckyNumber = Math.floor(seededRandom(seed * 5) * 30) + 1;
  const luckyColor = luckyColors[Math.floor(seededRandom(seed * 6) * luckyColors.length)];
  const luckyDirection =
    luckyDirections[Math.floor(seededRandom(seed * 7) * luckyDirections.length)];
  return {
    totalScore,
    loveScore,
    moneyScore,
    healthScore,
    overallMessage: generateDetailedZodiacMessage(zodiacSign, 'overall'),
    loveMessage: generateDetailedZodiacMessage(zodiacSign, 'love'),
    moneyMessage: generateDetailedZodiacMessage(zodiacSign, 'money'),
    healthMessage: generateDetailedZodiacMessage(zodiacSign, 'health'),
    advice: generateDetailedZodiacAdvice(zodiacSign),
    luckyColor,
    luckyNumber,
    luckyDirection,
  };
}
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function generateDetailedZodiacMessage(zodiacSign, type) {
  const messages = {
    aries: {
      overall:
        '화성의 강력한 에너지가 당신의 행동력을 극대화시키는 날입니다.

오전 10시경부터 오후 2시까지가 가장 활발한 시간대이며, 이 시간에 중요한 회의나 프레젠테이션을 잡으면 좋은 결과를 얻을 수 있습니다.

다만 과도한 경쟁심으로 인해 주변 사람들과 마찰이 생길 수 있으니 한 템포 늦추는 여유가 필요합니다.',
      love: '연인과의 관계에서 주도권을 잡고 싶은 욕구가 강해지는 날입니다.

특히 데이트 장소나 만날 시간을 정할 때 자신의 의견을 강하게 어필하게 될 것입니다.

솔로라면 오늘 새로운 사람과의 만남에서 첫인상을 강하게 남길 수 있으니 자신감 있게 어필해보세요.',
      money:
        '주식이나 암호화폐 같은 변동성 높은 투자보다는 안정적인 적금이나 국채에 관심을 가져보세요.

오늘 오후 3시 이후에 금융 상품 관련 좋은 정보를 접할 수 있습니다.

충동적인 쇼핑 욕구가 강해지니 고액 구매는 24시간 후에 다시 생각해보세요.',
      health:
        '목과 어깨 근육의 긴장이 심해질 수 있는 날입니다.

30분마다 목 돌리기와 어깨 스트레칭을 해주세요.

매운 음식이나 자극적인 음식은 피하고, 차가운 물보다는 미지근한 물을 자주 마시는 것이 좋습니다.',
    },
    taurus: {
      overall:
        '금성의 안정적인 에너지가 당신의 일상에 평온함을 가져다주는 날입니다.

급한 변화보다는 천천히 현재 상황을 개선해 나가는 것이 좋습니다.

특히 오후 시간대에 중요한 결정을 내리면 현명한 선택을 할 수 있습니다. 새로운 시작보다는 기존 계획을 점검하고 보완하는 데 집중하세요.',
      love: '연인이나 배우자와의 관계에서 물질적인 안정감을 추구하게 됩니다.

함께 미래 계획을 세우거나 공동 목표를 정하는 대화를 나누기 좋은 날입니다.

솔로라면 경제적으로 안정된 상대에게 더 끌리게 될 것입니다. 성급한 고백보다는 천천히 감정을 키워나가세요.',
      money:
        '부동산이나 금과 같은 실물 자산에 관심을 갖기 좋은 시기입니다.

오늘 받은 투자 정보 중에서 장기적으로 안정적인 수익을 보장하는 것이 있다면 신중히 검토해보세요.

가계부를 점검하고 불필요한 고정비를 줄이는 것도 좋은 방법입니다.',
      health:
        '소화기관이 예민해질 수 있으니 기름진 음식이나 인스턴트 식품은 피하세요.

규칙적인 식사 시간을 지키고, 식사 후 10분 정도 가벼운 산책을 하면 소화에 도움이 됩니다.

목욕이나 반신욕으로 몸을 따뜻하게 데우는 것이 컨디션 회복에 효과적입니다.',
    },
    gemini: {
      overall:
        '수성의 활발한 에너지가 당신의 소통 능력을 극대화시키는 날입니다.

여러 사람과의 네트워킹이나 새로운 정보 습득에 매우 유리한 시기입니다.

오늘 받은 정보나 들은 이야기 중에 향후 중요한 기회로 이어질 수 있는 것이 있으니 메모해두세요.

다만 너무 많은 일을 동시에 처리하려 하지 마세요.',
      love: '대화를 통해 상대방과 더 깊이 이해하게 되는 날입니다.

특히 SNS나 메신저를 통한 소통이 활발해지며, 멀리 있는 사람과도 좋은 관계를 유지할 수 있습니다.

솔로라면 온라인 모임이나 스터디 그룹에서 좋은 인연을 만날 가능성이 높습니다.',
      money:
        '정보 수집과 분석을 통해 좋은 투자 기회를 찾을 수 있는 날입니다.

특히 IT 관련 주식이나 코인에 대한 유용한 정보를 얻을 수 있습니다.

여러 사람의 의견을 들어보되, 최종 결정은 신중하게 내리세요. 작은 금액부터 시작하는 것이 좋습니다.',
      health:
        '신경이 예민해지고 집중력이 떨어질 수 있는 날입니다.

카페인 섭취를 줄이고 대신 허브차나 따뜻한 우유를 마시는 것이 좋습니다.

뇌 활동을 위해 견과류나 등푸른 생선을 섭취하세요. 잠들기 전 스마트폰 사용을 줄이고 독서나 명상을 해보세요.',
    },
    cancer: {
      overall:
        '달의 정서적 에너지가 당신의 감수성을 높이는 날입니다.

가족이나 가까운 사람들과의 관계에서 깊은 유대감을 느낄 수 있습니다.

직감이 예리해지는 시기이므로 중요한 결정을 내릴 때 논리적 판단과 함께 내면의 목소리에도 귀를 기울여보세요.

집에서 보내는 시간이 특히 의미 있을 것입니다.',
      love: '상대방의 감정 상태를 세심하게 파악하고 배려하는 모습을 보이게 됩니다.

연인과의 관계에서 더욱 깊은 정서적 유대감을 형성할 수 있으며, 진솔한 대화를 통해 서로를 더 잘 이해하게 될 것입니다.

솔로라면 편안하고 안정적인 분위기에서 만난 사람에게 끌리게 됩니다.',
      money:
        '장기적인 재정 계획을 세우기 좋은 시기입니다.

가족을 위한 투자나 보험 상품에 관심을 가져보세요.

부동산이나 생활용품 관련 투자가 유리할 수 있습니다. 감정적인 소비보다는 실용적이고 꼭 필요한 것에 돈을 쓰는 것이 좋습니다.',
      health:
        '감정 기복이 심해지면서 식욕에도 변화가 있을 수 있습니다.

스트레스성 과식이나 식욕 부진을 주의하세요.

따뜻한 음식과 충분한 수분 섭취가 중요합니다. 가벼운 요가나 명상을 통해 마음의 안정을 찾는 것이 건강 관리에 도움이 됩니다.',
    },
    leo: {
      overall:
        '태양의 찬란한 에너지가 당신의 존재감을 극대화시키는 날입니다.

어떤 모임이든 자연스럽게 중심인물이 되며, 사람들의 주목을 받게 됩니다.

창의적인 아이디어나 독창적인 제안이 좋은 평가를 받을 수 있습니다.

다만 너무 자신만만해하지 말고 다른 사람들의 의견도 겸허히 수용하는 자세가 필요합니다.',
      love: '당신의 매력이 최고조에 달하는 날입니다.

연인과의 관계에서 로맨틱한 이벤트를 준비하거나 특별한 데이트를 계획해보세요.

솔로라면 파티나 모임에서 많은 사람의 관심을 받을 수 있습니다. 자신감 있는 모습으로 어필하되, 상대방의 마음도 세심하게 배려하세요.',
      money:
        '투자나 사업에서 큰 성과를 얻을 수 있는 가능성이 높습니다.

특히 엔터테인먼트, 패션, 뷰티 관련 분야에 관심을 가져보세요.

다만 자신감이 과도해져서 리스크가 큰 투자에 뛰어들지 않도록 주의하세요. 전문가의 조언을 구하는 것이 좋습니다.',
      health:
        '에너지가 넘치는 하루이지만, 무리한 활동은 피하세요.

심장과 등 부위를 특히 주의해야 합니다.

격렬한 운동보다는 요가나 필라테스 같은 균형 잡힌 운동이 좋습니다. 비타민 D 섭취를 위해 적당한 일광욕을 하거나 보충제를 고려해보세요.',
    },
    virgo: {
      overall:
        '수성의 분석적 에너지가 당신의 완벽주의 성향을 더욱 강화시키는 날입니다.

세심한 관찰력과 체계적인 접근으로 문제를 해결하는 능력이 돋보입니다.

업무나 학업에서 놓쳤던 부분을 발견하고 개선할 수 있는 기회가 있습니다.

다만 너무 완벽을 추구하다 보면 스트레스가 쌓일 수 있으니 적당한 선에서 만족하는 것도 필요합니다.',
      love: '상대방의 작은 변화나 필요한 것을 민감하게 감지하고 도움을 주려는 마음이 강해집니다.

연인과의 관계에서 실용적이고 현실적인 조언을 해주며 든든한 지지자 역할을 하게 됩니다.

솔로라면 신중하고 안정적인 사람에게 끌리며, 조건보다는 인품을 중시하게 됩니다.',
      money:
        '재정 관리와 계획 수립에 특히 능한 날입니다.

가계부를 정리하고 불필요한 지출을 찾아내어 절약할 수 있는 방법을 발견할 것입니다.

보험이나 연금 상품 검토, 재테크 공부에 집중하기 좋은 시기입니다. 작은 금액이라도 체계적으로 관리하면 큰 효과를 볼 수 있습니다.',
      health:
        '건강 관리에 대한 관심이 높아지며, 체계적인 건강 계획을 세우기 좋은 시기입니다.

정기 건강검진이나 영양 상담을 받아보세요.

소화기관이 예민할 수 있으니 규칙적인 식사와 적절한 운동을 통해 컨디션을 관리하세요. 과로는 금물입니다.',
    },
    libra: {
      overall:
        '금성의 조화로운 에너지가 당신의 밸런스 감각을 극대화시키는 특별한 날입니다.

대인관계에서 중재자 역할을 하며 갈등을 해결하는 능력이 돋보입니다.

미적 감각이 뛰어나 예술 활동이나 인테리어, 패션 관련 일에서 좋은 성과를 거둘 수 있습니다.

다만 우유부단한 성격 때문에 중요한 결정을 계속 미루지 말고 적절한 시점에 결단을 내리세요.',
      love: '연인과의 관계에서 서로의 다른 점을 이해하고 타협점을 찾아가는 성숙한 모습을 보이게 됩니다.

미술관이나 콘서트 같은 문화적인 데이트가 특히 좋은 분위기를 만들어줄 것입니다.

솔로라면 세련되고 교양 있는 사람과의 만남에서 특별한 감정을 느낄 수 있습니다. 외모보다는 내면의 아름다움에 더 끌리게 됩니다.',
      money:
        '투자 포트폴리오의 균형을 맞추기 좋은 시기입니다.

위험 자산과 안전 자산의 적절한 비율을 고려해서 자산 배분을 조정해보세요.

예술품이나 명품 같은 가치 투자도 고려해볼 만합니다. 파트너나 가족과 함께하는 공동 투자나 저축 계획을 세우는 것도 좋습니다.',
      health:
        '심리적 안정이 신체 건강에 큰 영향을 미치는 날입니다.

스트레스 관리를 위해 명상이나 아로마 테라피를 시도해보세요.

신장과 허리 건강을 특히 주의하고, 물을 충분히 섭취하세요. 균형 잡힌 식단과 적당한 운동으로 몸의 밸런스를 유지하는 것이 중요합니다.',
    },
    scorpio: {
      overall:
        '명왕성의 강렬한 변화 에너지가 당신의 통찰력을 극대화시키는 날입니다.

표면적으로 보이지 않는 진실이나 숨겨진 의도를 파악하는 능력이 뛰어납니다.

연구나 조사 활동에서 중요한 발견을 할 수 있으며, 투자나 사업에서도 남들이 놓치는 기회를 포착할 수 있습니다.

강한 집중력을 발휘하되, 때로는 휴식도 필요합니다.',
      love: '연인과의 관계에서 더욱 깊은 정서적 유대감을 추구하게 됩니다.

표면적인 대화보다는 진솔하고 솔직한 마음을 나누는 시간을 가져보세요.

솔로라면 신비롭고 깊이 있는 사람에게 끌리게 됩니다. 첫 만남에서부터 강한 호감을 느낄 수 있지만, 성급하게 다가가지 말고 천천히 마음을 열어가세요.',
      money:
        '투자에 대한 날카로운 직감이 빛나는 날입니다.

특히 부동산이나 자원 관련 투자에서 좋은 기회를 발견할 수 있습니다.

다만 높은 수익률에 현혹되지 말고 철저한 분석과 검증을 거쳐 결정하세요. 세금이나 보험 관련 재정 계획을 점검하기에도 좋은 시기입니다.',
      health:
        '신체의 재생 능력이 높아지는 시기입니다.

디톡스나 단식 요법 등을 통해 몸을 정화하는 것이 효과적입니다.

생식기나 배설기관 건강을 특히 주의하고, 충분한 수분 섭취와 휴식을 취하세요. 감정적 스트레스가 몸에 미치는 영향이 크니 마음의 평정을 유지하는 것이 중요합니다.',
    },
    sagittarius: {
      overall:
        '목성의 확장적인 에너지가 당신의 모험심을 자극하는 날입니다.

새로운 경험이나 학습에 대한 열망이 강해지며, 해외 관련 일이나 철학적 사고에 관심을 갖게 됩니다.

여행 계획을 세우거나 새로운 언어나 기술을 배우기 시작하기 좋은 시기입니다.

다만 너무 많은 것을 한꺼번에 하려 하지 말고 우선순위를 정하세요.',
      love: '자유롭고 개방적인 관계를 추구하게 됩니다.

연인과 함께 새로운 장소를 탐험하거나 모험적인 활동을 해보세요.

서로의 꿈과 목표에 대해 이야기하며 미래를 계획하는 대화가 관계를 더욱 돈독하게 만들어줄 것입니다. 솔로라면 여행지나 학습 모임에서 좋은 인연을 만날 수 있습니다.',
      money:
        '해외 투자나 글로벌 펀드에 관심을 가져보세요.

교육이나 여행 관련 지출이 늘어날 수 있지만, 이는 장기적으로 자신에게 도움이 되는 투자입니다.

암호화폐나 새로운 기술 분야의 투자 정보를 접할 수 있으니 신중히 검토해보세요. 무분별한 도박성 투자는 피하세요.',
      health:
        '야외 활동과 운동을 통해 건강을 증진시키기 좋은 시기입니다.

등산이나 조깅, 자전거 타기 등 활동적인 운동이 특히 좋습니다.

허벅지와 엉덩이 부위의 근육을 강화하는 운동에 집중하세요. 새로운 운동법이나 건강 관리 방법을 시도해보는 것도 좋습니다.',
    },
    capricorn: {
      overall:
        '토성의 체계적인 에너지가 당신의 책임감과 인내력을 강화시키는 날입니다.

장기적인 목표를 향해 꾸준히 노력하는 모습이 주변 사람들에게 인정받게 됩니다.

업무나 학업에서 리더십을 발휘할 기회가 있으며, 체계적인 계획과 실행력으로 좋은 성과를 거둘 수 있습니다.

성급함보다는 차근차근 단계별로 접근하는 것이 중요합니다.',
      love: '연인과의 관계에서 안정감과 신뢰를 바탕으로 한 깊은 유대감을 형성하게 됩니다.

미래에 대한 구체적인 계획을 함께 세우거나 현실적인 문제들을 해결해나가는 과정에서 서로에 대한 의존도가 높아집니다.

솔로라면 성숙하고 책임감 있는 사람에게 끌리며, 진지한 만남을 추구하게 됩니다.',
      money:
        '장기적인 재정 계획을 세우기 매우 좋은 시기입니다.

연금이나 보험 상품, 부동산 투자 등 안정적인 자산 형성에 집중하세요.

단기적인 수익보다는 장기적인 안정성을 추구하는 것이 현명합니다. 가족이나 배우자와 함께 재정 계획을 세우는 것도 좋은 방법입니다.',
      health:
        '규칙적인 생활 패턴과 꾸준한 건강 관리가 중요한 시기입니다.

무릎과 관절 건강을 특히 주의하고, 칼슘과 비타민 D 섭취를 늘리세요.

스트레스 관리를 위해 취미 활동이나 휴식 시간을 규칙적으로 가져보세요. 과로는 금물이며, 적절한 휴식과 수면이 필수입니다.',
    },
    aquarius: {
      overall:
        '천왕성의 혁신적인 에너지가 당신의 독창성을 극대화시키는 날입니다.

기존의 관습이나 틀에서 벗어나 새로운 접근 방식을 시도하게 됩니다.

기술이나 과학 분야에 대한 관심이 높아지며, 미래 지향적인 아이디어로 주목받을 수 있습니다.

친구나 동료들과의 협업을 통해 혁신적인 결과를 만들어낼 수 있습니다.',
      love: '연인과의 관계에서 자유롭고 평등한 파트너십을 추구하게 됩니다.

서로의 개성과 독립성을 존중하면서도 깊은 우정을 바탕으로 한 사랑을 키워나가게 됩니다.

솔로라면 온라인이나 소셜 미디어를 통해 비슷한 관심사를 가진 사람과 만날 수 있습니다. 독특하고 개성 있는 사람에게 끌리게 됩니다.',
      money:
        '혁신적인 기술이나 미래 산업에 대한 투자를 고려해볼 시기입니다.

특히 AI, 블록체인, 환경 기술 관련 분야에 관심을 가져보세요.

크라우드 펀딩이나 P2P 투자 등 새로운 형태의 투자 방식도 검토해볼 만합니다. 다만 너무 급진적인 투자는 피하고 충분한 정보 수집 후 결정하세요.',
      health:
        '새로운 건강 관리 방법이나 운동법을 시도해보기 좋은 시기입니다.

웨어러블 기기나 헬스 앱을 활용한 스마트 헬스케어에 관심을 가져보세요.

순환기계와 신경계 건강을 특히 주의하고, 규칙적인 운동과 충분한 수면을 통해 몸의 리듬을 유지하세요.',
    },
    pisces: {
      overall:
        '해왕성의 신비로운 에너지가 당신의 직감과 창의력을 극대화시키는 날입니다.

예술적 감각이 뛰어나며, 음악이나 그림, 문학 등 창작 활동에서 영감을 받을 수 있습니다.

타인의 감정을 민감하게 파악하는 능력이 높아져 상담이나 치유 관련 일에서 좋은 성과를 거둘 수 있습니다.

다만 현실적인 문제들을 너무 회피하지 말고 균형을 유지하세요.',
      love: '연인과의 관계에서 깊은 감정적 교감을 나누게 됩니다.

말보다는 마음으로 소통하는 시간이 많아지며, 상대방의 기분이나 상태를 직감적으로 파악하게 됩니다.

솔로라면 우연한 만남에서 운명적인 느낌을 받을 수 있습니다. 감성적이고 로맨틱한 분위기에서 사랑이 싹틀 가능성이 높습니다.',
      money:
        '직감적인 투자 판단이 좋은 결과를 가져올 수 있는 시기입니다.

특히 예술품이나 수집품, 주얼리 등 가치 투자에 관심을 가져보세요.

자선 활동이나 기부에 참여하는 것도 좋은 에너지를 가져다줄 것입니다. 감정적인 소비는 피하고, 진정으로 필요한 것에만 돈을 사용하세요.',
      health:
        '정신적 안정과 영적 균형이 신체 건강에 큰 영향을 미치는 시기입니다.

명상이나 요가, 태극권 등 몸과 마음을 동시에 치유하는 활동을 추천합니다.

발과 면역 체계를 특히 주의하고, 충분한 수분 섭취와 휴식을 취하세요. 알코올이나 카페인 섭취는 줄이는 것이 좋습니다.',
    },
  };
  return messages[zodiacSign][type] || messages['libra'][type];
}
function generateDetailedZodiacAdvice(zodiacSign) {
  const advices = {
    aries:
      '오늘은 리더십을 발휘하되 독단적이지 않게 조심하세요.

중요한 결정을 내리기 전에 최소 3명 이상의 신뢰할 만한 사람들과 상의해보세요.

오전 10시부터 오후 2시 사이에 중요한 업무를 처리하면 좋은 결과를 얻을 수 있습니다.

운동할 때는 무리하지 말고 워밍업을 충분히 하세요. 빨간색 계열의 옷을 입으면 자신감이 높아집니다.',
    taurus:
      '안정을 추구하는 것은 좋지만 너무 변화를 거부하지는 마세요.

새로운 기회가 왔을 때 최소 24시간은 생각해본 후 결정하세요.

오후 3시 이후의 시간대에 중요한 상담이나 회의를 잡으면 유리합니다.

목이나 어깨 마사지를 받으면 컨디션이 좋아집니다. 초록색 계열의 소품을 착용하면 마음이 평온해집니다.',
    gemini:
      '다양한 정보를 접하는 것은 좋지만 너무 산만해지지 않도록 주의하세요.

하루에 처리할 일을 3가지 이내로 제한하고 우선순위를 정하세요.

소셜 미디어나 메신저를 통한 소통이 특히 활발해지니 좋은 정보를 놓치지 마세요.

독서나 팟캐스트 청취로 새로운 지식을 습득하기 좋은 시기입니다. 노란색 계열의 색상이 행운을 가져다줍니다.',
    cancer:
      '감정 기복이 심할 수 있으니 중요한 결정은 감정이 안정된 후에 내리세요.

가족이나 가까운 친구와의 시간을 늘리면 마음의 평화를 찾을 수 있습니다.

집안 정리나 인테리어 변경으로 환경을 개선해보세요.

따뜻한 음식과 충분한 수분 섭취가 컨디션 관리에 도움이 됩니다. 흰색이나 은색 계열의 액세서리를 착용해보세요.',
    leo: '자신감이 높아지는 것은 좋지만 다른 사람들의 의견도 귀담아 들으세요.

창의적인 아이디어를 실현하기 위해 구체적인 계획을 세우고 실행에 옮기세요.

무대나 발표 기회가 있다면 적극적으로 참여해보세요.

심장 건강을 위해 과도한 운동은 피하고 적당한 강도를 유지하세요. 골든 계열의 액세서리가 당신의 매력을 더해줍니다.',
    virgo:
      '완벽을 추구하는 것은 좋지만 너무 세부사항에 얽매이지 마세요.

80% 정도의 완성도로도 충분히 좋은 결과를 얻을 수 있습니다.

건강 관리에 특별히 신경 쓰고 정기 검진을 받아보세요.

업무나 학습에서 체계적인 접근 방식을 사용하면 효율성이 높아집니다. 네이비나 브라운 계열의 옷이 신뢰감을 줍니다.',
    libra:
      '중요한 결정을 계속 미루지 말고 적절한 시점에 결단을 내리세요.

장단점을 종이에 적어보고 객관적으로 분석해보세요.

예술이나 문화 활동에 참여하면 창의력이 향상됩니다.

파트너나 친구와의 관계에서 균형을 맞추려 노력하세요. 조화로운 인간관계가 당신에게 큰 힘이 됩니다.

파스텔 톤의 색상이 당신의 우아함을 강조해줍니다.',
    scorpio:
      '강한 직감을 믿되 객관적인 검증도 함께 하세요.

비밀스러운 일이나 숨겨진 진실을 파악하는 능력이 뛰어나니 이를 활용해보세요.

투자나 재정 관리에서 신중한 접근이 필요합니다.

감정적인 에너지가 강하니 적절한 휴식과 명상으로 마음을 다스리세요. 깊은 보라색이나 버건디 계열의 색상이 당신의 신비로운 매력을 높여줍니다.',
    sagittarius:
      '모험심이 강해지지만 무모한 도전은 피하세요.

새로운 경험을 하기 전에 충분한 준비와 계획을 세우세요.

해외 관련 일이나 학습에 관심을 가져보세요.

여행을 계획하고 있다면 안전에 특히 주의하세요. 자유롭고 개방적인 사고방식이 새로운 기회를 가져다줄 것입니다.

터키석이나 청록색 계열의 색상이 행운을 가져다줍니다.',
    capricorn:
      '목표를 향해 꾸준히 나아가되 때로는 휴식도 취하세요.

일과 개인 생활의 균형을 맞추는 것이 중요합니다.

장기적인 계획을 세우고 단계별로 실행해나가세요.

연장자나 경험 많은 사람들의 조언을 구하면 도움이 됩니다. 건강 관리를 소홀히 하지 말고 규칙적인 생활 패턴을 유지하세요.

검은색이나 진한 갈색 계열의 옷이 당신의 권위를 높여줍니다.',
    aquarius:
      '독창적인 아이디어는 좋지만 현실적인 실현 가능성도 고려하세요.

새로운 기술이나 트렌드에 관심을 가지고 학습해보세요.

친구들과의 네트워킹을 통해 새로운 기회를 발견할 수 있습니다.

사회적인 활동이나 봉사 활동에 참여하면 뜻밖의 보람을 느낄 수 있습니다. 전기 블루나 메탈릭 색상이 당신의 미래 지향적인 이미지를 강조해줍니다.',
    pisces:
      '직감과 감정에 의존하는 것도 좋지만 현실적인 계획도 세우세요.

예술적 재능을 발휘할 수 있는 기회를 찾아보세요.

타인의 감정에 너무 휩쓸리지 말고 자신의 감정도 소중히 여기세요.

명상이나 요가 등 영적인 활동이 마음의 안정을 가져다줍니다. 물가나 조용한 자연 환경에서 시간을 보내면 창의력이 향상됩니다.

바다색이나 라벤더 계열의 색상이 당신의 감성을 돋보이게 해줍니다.',
  };
  return advices[zodiacSign] || advices['libra'];
}
function displayZodiacResult(zodiacSign, fortune) {
  const today = new Date();
  const zodiac = zodiacData[zodiacSign];
  const resultDiv = document.getElementById('zodiacResult');
  resultDiv.innerHTML = ` <div class="fortune-result-container"> <div class="fortune-result-card"> <div class="result-header"> <h2>${zodiac.symbol} ${zodiac.name} 운세</h2> <p class="result-date"> ${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 </p> </div> <div class="zodiac-info"> <div class="zodiac-details"> <h3>별자리 정보</h3> <div class="detail-grid"> <div class="detail-item"> <strong>기간:</strong> ${zodiac.date} </div> <div class="detail-item"> <strong>원소:</strong> ${zodiac.element} </div> <div class="detail-item"> <strong>지배행성:</strong> ${zodiac.planet} </div> </div> </div> <div class="zodiac-traits"> <h3>성격 특징</h3> <div class="traits-list"> ${zodiac.traits.map((trait) => `<span class="trait-tag">${trait}</span>`).join('')} </div> </div> </div> <div class="fortune-scores"> <div class="score-item"> <h4>💫 총운</h4> <div class="score-bar"> <div class="score-fill" style="width: ${fortune.totalScore}%"></div> </div> <span class="score-number">${fortune.totalScore}점</span> </div> <div class="score-item"> <h4>💕 애정운</h4> <div class="score-bar"> <div class="score-fill" style="width: ${fortune.loveScore}%"></div> </div> <span class="score-number">${fortune.loveScore}점</span> </div> <div class="score-item"> <h4>💰 금전운</h4> <div class="score-bar"> <div class="score-fill" style="width: ${fortune.moneyScore}%"></div> </div> <span class="score-number">${fortune.moneyScore}점</span> </div> <div class="score-item"> <h4>🏃 건강운</h4> <div class="score-bar"> <div class="score-fill" style="width: ${fortune.healthScore}%"></div> </div> <span class="score-number">${fortune.healthScore}점</span> </div> </div> <div class="fortune-messages"> <div class="message-item"> <h4>🌟 전체 운세</h4> <div class="message-content">${fortune.overallMessage}</div> </div> <div class="message-item"> <h4>💕 애정운</h4> <div class="message-content">${fortune.loveMessage}</div> </div> <div class="message-item"> <h4>💰 금전운</h4> <div class="message-content">${fortune.moneyMessage}</div> </div> <div class="message-item"> <h4>🏃 건강운</h4> <div class="message-content">${fortune.healthMessage}</div> </div> </div> <div class="advice-section"> <h3>💡 오늘의 조언</h3> <div class="advice-content">${fortune.advice}</div> </div> <div class="lucky-info"> <h3>🍀 행운 정보</h3> <div class="lucky-grid"> <div class="lucky-item"> <strong>행운의 숫자</strong> <span>${fortune.luckyNumber}</span> </div> <div class="lucky-item"> <strong>행운의 색상</strong> <span>${fortune.luckyColor}</span> </div> <div class="lucky-item"> <strong>행운의 방향</strong> <span>${fortune.luckyDirection}</span> </div> </div> </div> <div class="compatibility"> <h3>💘 궁합이 좋은 별자리</h3> <div class="compatibility-list"> ${zodiac.compatibility.map((sign) => `<span class="compatibility-tag">${sign}</span>`).join('')} </div> </div> <div class="ai-disclaimer"> <small>※ 본 운세는 AI가 분석한 참고용 정보입니다. doha.kr 독자적인 해석을 제공합니다.</small> </div> <div class="action-buttons"> <button onclick="location.reload()" class="btn btn-secondary"> 다른 별자리 보기 </button> </div> </div> </div> `;
}

// 전역 스코프에 함수 노출
window.selectZodiac = selectZodiac;
