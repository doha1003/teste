// 러브 DNA 테스트 질문 데이터
const loveDNAQuestions = [
  {
    id: 1,
    question: '이상적인 데이트 장소는 어디인가요?',
    category: 'dating',
    axis: 'adventure_stability',
    options: [
      { text: '새로운 도시 탐험하기', score: { A: 3, S: -1 } },
      { text: '테마파크나 액티비티', score: { A: 2, S: 0 } },
      { text: '조용한 카페에서 대화', score: { A: -1, S: 2 } },
      { text: '집에서 영화 보기', score: { A: -2, S: 3 } }
    ]
  },
  {
    id: 2,
    question: '연인이 깜짝 선물을 줄 때 어떤 게 가장 좋을까요?',
    category: 'gifts',
    axis: 'practical_romantic',
    options: [
      { text: '실용적이고 필요한 물건', score: { P: 3, R: -1 } },
      { text: '함께 쓸 수 있는 커플 아이템', score: { P: 1, R: 2 } },
      { text: '로맨틱한 편지나 꽃', score: { P: -2, R: 3 } },
      { text: '특별한 경험이나 추억', score: { P: -1, R: 2, A: 1 } }
    ]
  },
  {
    id: 3,
    question: '연인과 갈등이 생겼을 때 어떻게 해결하시나요?',
    category: 'conflict',
    axis: 'direct_indirect',
    options: [
      { text: '바로 대화해서 해결하려고 함', score: { D: 3, I: -2 } },
      { text: '시간을 두고 차분히 이야기', score: { D: 1, I: 1 } },
      { text: '상대방이 먼저 말할 때까지 기다림', score: { D: -1, I: 2 } },
      { text: '자연스럽게 넘어가길 바람', score: { D: -3, I: 3 } }
    ]
  },
  {
    id: 4,
    question: '사랑을 표현할 때 주로 어떤 방식을 사용하나요?',
    category: 'expression',
    axis: 'verbal_action',
    options: [
      { text: '직접적인 말로 사랑한다고 표현', score: { V: 3, A: -1 } },
      { text: '문자나 편지로 감정 전달', score: { V: 2, A: 0 } },
      { text: '행동과 배려로 보여줌', score: { V: -1, A: 3 } },
      { text: '작은 선물이나 서프라이즈', score: { V: 0, A: 2 } }
    ]
  },
  {
    id: 5,
    question: '연인과 함께 있을 때 가장 행복한 순간은?',
    category: 'togetherness',
    axis: 'active_passive',
    options: [
      { text: '함께 새로운 곳을 여행할 때', score: { A: 3, P: -1 } },
      { text: '같이 운동이나 활동할 때', score: { A: 2, P: 0 } },
      { text: '조용히 대화를 나눌 때', score: { A: -1, P: 2 } },
      { text: '아무것도 안 하고 그냥 함께 있을 때', score: { A: -2, P: 3 } }
    ]
  },
  {
    id: 6,
    question: '연인의 과거 연애사에 대해 어떻게 생각하시나요?',
    category: 'past',
    axis: 'open_closed',
    options: [
      { text: '서로 솔직하게 다 얘기하는 게 좋음', score: { O: 3, C: -2 } },
      { text: '궁금하지만 굳이 묻지는 않음', score: { O: 0, C: 1 } },
      { text: '과거는 과거, 알고 싶지 않음', score: { O: -2, C: 3 } },
      { text: '자연스럽게 알게 되면 괜찮음', score: { O: 1, C: 1 } }
    ]
  },
  {
    id: 7,
    question: '연인이 바쁠 때 당신의 반응은?',
    category: 'independence',
    axis: 'clingy_independent',
    options: [
      { text: '같이 시간 보내고 싶어서 아쉬워함', score: { C: 3, I: -2 } },
      { text: '이해하지만 연락은 계속 하고 싶음', score: { C: 1, I: 0 } },
      { text: '바쁜 만큼 나도 내 일에 집중함', score: { C: -1, I: 2 } },
      { text: '완전히 이해하고 기다려줌', score: { C: -2, I: 3 } }
    ]
  },
  {
    id: 8,
    question: '미래 계획을 세울 때 어떤 스타일인가요?',
    category: 'future',
    axis: 'planned_spontaneous',
    options: [
      { text: '구체적인 계획을 세우고 준비함', score: { P: 3, S: -2 } },
      { text: '대략적인 방향은 정하지만 유연하게', score: { P: 1, S: 1 } },
      { text: '그때그때 상황에 맞춰서', score: { P: -1, S: 2 } },
      { text: '계획 없이 즉흥적으로 사는 게 좋음', score: { P: -3, S: 3 } }
    ]
  },
  {
    id: 9,
    question: '연인의 친구들과 어떻게 지내고 싶나요?',
    category: 'social',
    axis: 'social_private',
    options: [
      { text: '적극적으로 어울리며 친해지고 싶음', score: { S: 3, P: -1 } },
      { text: '자연스럽게 친해질 수 있으면 좋겠음', score: { S: 1, P: 1 } },
      { text: '인사 정도만 하고 적당한 거리 유지', score: { S: -1, P: 2 } },
      { text: '연인과 둘만의 시간이 더 소중함', score: { S: -2, P: 3 } }
    ]
  },
  {
    id: 10,
    question: '연인에게 실망했을 때 어떻게 하시나요?',
    category: 'disappointment',
    axis: 'express_suppress',
    options: [
      { text: '바로 감정을 표현하고 이야기함', score: { E: 3, S: -2 } },
      { text: '조금 진정하고 나서 대화함', score: { E: 1, S: 0 } },
      { text: '혼자서 생각을 정리한 후에 말함', score: { E: -1, S: 2 } },
      { text: '내 마음속에만 간직함', score: { E: -3, S: 3 } }
    ]
  },
  {
    id: 11,
    question: '연인과 취미가 다를 때 어떻게 하시나요?',
    category: 'hobbies',
    axis: 'compromise_maintain',
    options: [
      { text: '연인의 취미를 배워보려고 노력', score: { C: 3, M: -1 } },
      { text: '서로의 취미를 번갈아가며 함께', score: { C: 2, M: 1 } },
      { text: '각자 취미는 따로, 만날 땐 다른 활동', score: { C: 0, M: 2 } },
      { text: '각자 자기 취미를 유지하는 게 좋음', score: { C: -2, M: 3 } }
    ]
  },
  {
    id: 12,
    question: '연인과 함께하는 여행 스타일은?',
    category: 'travel',
    axis: 'adventure_comfort',
    options: [
      { text: '새로운 곳 탐험하고 모험 즐기기', score: { A: 3, C: -1 } },
      { text: '유명한 관광지 위주로 알차게', score: { A: 1, C: 1 } },
      { text: '편안한 휴양지에서 힐링', score: { A: -1, C: 2 } },
      { text: '익숙한 곳에서 안전하게', score: { A: -2, C: 3 } }
    ]
  },
  {
    id: 13,
    question: '연인의 가족과의 관계는 어떻게 생각하시나요?',
    category: 'family',
    axis: 'close_distant',
    options: [
      { text: '가족처럼 가깝게 지내고 싶음', score: { C: 3, D: -2 } },
      { text: '좋은 관계를 유지하고 싶음', score: { C: 2, D: -1 } },
      { text: '예의를 지키며 적당한 거리감 유지', score: { C: 0, D: 1 } },
      { text: '개입하지 않고 연인과만 관계', score: { C: -2, D: 3 } }
    ]
  },
  {
    id: 14,
    question: '기념일을 어떻게 보내고 싶나요?',
    category: 'anniversary',
    axis: 'grand_simple',
    options: [
      { text: '특별한 장소에서 화려하게', score: { G: 3, S: -2 } },
      { text: '의미 있는 선물과 함께', score: { G: 2, S: -1 } },
      { text: '소소하지만 따뜻하게', score: { G: -1, S: 2 } },
      { text: '평상시와 다르지 않게 자연스럽게', score: { G: -3, S: 3 } }
    ]
  },
  {
    id: 15,
    question: '연인에게 조언을 해줄 때 어떤 방식인가요?',
    category: 'advice',
    axis: 'direct_gentle',
    options: [
      { text: '솔직하고 직접적으로 말함', score: { D: 3, G: -1 } },
      { text: '논리적으로 설명하며 조언', score: { D: 2, G: 0 } },
      { text: '부드럽게 돌려서 표현', score: { D: -1, G: 2 } },
      { text: '상처주지 않게 매우 조심스럽게', score: { D: -2, G: 3 } }
    ]
  },
  {
    id: 16,
    question: '연인과의 스킨십에 대한 생각은?',
    category: 'intimacy',
    axis: 'expressive_reserved',
    options: [
      { text: '자연스럽고 자유롭게 표현', score: { E: 3, R: -2 } },
      { text: '상황에 맞게 적절히', score: { E: 1, R: 0 } },
      { text: '은은하고 절제된 표현', score: { E: -1, R: 2 } },
      { text: '매우 사적이고 조심스럽게', score: { E: -3, R: 3 } }
    ]
  },
  {
    id: 17,
    question: '연인이 힘들어할 때 어떻게 도와주시나요?',
    category: 'support',
    axis: 'active_passive',
    options: [
      { text: '적극적으로 해결책을 찾아줌', score: { A: 3, P: -1 } },
      { text: '함께 고민하며 조언해줌', score: { A: 2, P: 0 } },
      { text: '곁에서 조용히 지켜봄', score: { A: -1, P: 2 } },
      { text: '혼자 시간을 갖게 해줌', score: { A: -2, P: 3 } }
    ]
  },
  {
    id: 18,
    question: '연인과의 대화에서 중요하게 생각하는 것은?',
    category: 'communication',
    axis: 'deep_light',
    options: [
      { text: '철학적이고 깊은 주제', score: { D: 3, L: -2 } },
      { text: '서로의 진솔한 마음', score: { D: 2, L: -1 } },
      { text: '일상적이고 편안한 이야기', score: { D: -1, L: 2 } },
      { text: '재미있고 유쾌한 대화', score: { D: -2, L: 3 } }
    ]
  },
  {
    id: 19,
    question: '연인과 함께 성장하는 방식은?',
    category: 'growth',
    axis: 'together_individual',
    options: [
      { text: '모든 것을 함께 배우고 경험', score: { T: 3, I: -2 } },
      { text: '주요한 것들은 함께 공유', score: { T: 2, I: -1 } },
      { text: '각자 성장하되 결과를 나눔', score: { T: -1, I: 2 } },
      { text: '개인의 성장을 우선시', score: { T: -2, I: 3 } }
    ]
  },
  {
    id: 20,
    question: '연인 관계에서 가장 중요하다고 생각하는 것은?',
    category: 'values',
    axis: 'trust_passion',
    options: [
      { text: '서로에 대한 신뢰와 믿음', score: { T: 3, P: -1 } },
      { text: '깊은 이해와 소통', score: { T: 2, P: 0 } },
      { text: '뜨거운 사랑과 열정', score: { T: -1, P: 3 } },
      { text: '로맨틱하고 설레는 감정', score: { T: -2, P: 2 } }
    ]
  }
];

// 전역 스코프에 변수 노출 (모듈 호환성을 위해)
if (typeof window !== 'undefined') {
  window.loveDNAQuestions = loveDNAQuestions;
}

// ES6 모듈 export
export { loveDNAQuestions };