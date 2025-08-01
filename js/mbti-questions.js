// MBTI 질문 데이터
const mbtiQuestions = [
  // E vs I (외향-내향) 질문들
  {
    question: '새로운 환경에서 사람들과 만날 때 당신은?',
    options: [
      { text: '먼저 다가가서 대화를 시작한다', type: 'E', score: 2 },
      { text: '자연스럽게 대화에 참여한다', type: 'E', score: 1 },
      { text: '상황을 지켜보며 적절한 때를 기다린다', type: 'I', score: 1 },
      { text: '누군가가 먼저 말을 걸기를 기다린다', type: 'I', score: 2 },
    ],
  },
  {
    question: '에너지를 얻는 방식은?',
    options: [
      { text: '사람들과 어울리며 활동할 때', type: 'E', score: 2 },
      { text: '적당히 사람들과 어울릴 때', type: 'E', score: 1 },
      { text: '혼자만의 시간을 가질 때', type: 'I', score: 1 },
      { text: '완전히 혼자서 조용히 있을 때', type: 'I', score: 2 },
    ],
  },
  {
    question: '파티나 모임에서 당신은?',
    options: [
      { text: '여러 그룹을 돌아다니며 많은 사람과 대화', type: 'E', score: 2 },
      { text: '친한 사람들과 함께 어울린다', type: 'E', score: 1 },
      { text: '한두 명과 깊은 대화를 나눈다', type: 'I', score: 1 },
      { text: '조용한 곳에서 관찰자 역할을 한다', type: 'I', score: 2 },
    ],
  },
  {
    question: '문제해결 시 선호하는 방식은?',
    options: [
      { text: '다른 사람들과 토론하며 해결', type: 'E', score: 2 },
      { text: '몇 명과 상의한 후 결정', type: 'E', score: 1 },
      { text: '혼자 충분히 생각한 후 결정', type: 'I', score: 1 },
      { text: '완전히 혼자 깊이 사고한 후 결정', type: 'I', score: 2 },
    ],
  },
  {
    question: '휴식을 취하는 방법은?',
    options: [
      { text: '친구들과 함께 활동적인 것', type: 'E', score: 2 },
      { text: '가벼운 사람들과의 만남', type: 'E', score: 1 },
      { text: '혼자서 취미활동이나 독서', type: 'I', score: 1 },
      { text: '완전히 혼자 조용한 공간에서', type: 'I', score: 2 },
    ],
  },
  {
    question: '스트레스를 받을 때는?',
    options: [
      { text: '사람들과 이야기하며 털어놓는다', type: 'E', score: 2 },
      { text: '가까운 사람에게 조언을 구한다', type: 'E', score: 1 },
      { text: '혼자 생각하며 정리한다', type: 'I', score: 1 },
      { text: '완전히 혼자만의 시간을 갖는다', type: 'I', score: 2 },
    ],
  },

  // S vs N (감각-직관) 질문들
  {
    question: '정보를 받아들일 때 주로 집중하는 것은?',
    options: [
      { text: '구체적인 사실과 세부사항', type: 'S', score: 2 },
      { text: '명확한 정보와 경험', type: 'S', score: 1 },
      { text: '전체적인 패턴과 의미', type: 'N', score: 1 },
      { text: '가능성과 잠재적 연결점', type: 'N', score: 2 },
    ],
  },
  {
    question: '일을 처리할 때 선호하는 방식은?',
    options: [
      { text: '단계별로 체계적으로 진행', type: 'S', score: 2 },
      { text: '계획을 세워 순서대로', type: 'S', score: 1 },
      { text: '창의적이고 유연하게', type: 'N', score: 1 },
      { text: '직감과 영감에 따라', type: 'N', score: 2 },
    ],
  },
  {
    question: '학습할 때 효과적인 방법은?',
    options: [
      { text: '실습과 반복을 통한 학습', type: 'S', score: 2 },
      { text: '구체적인 예시와 설명', type: 'S', score: 1 },
      { text: '이론과 개념적 이해', type: 'N', score: 1 },
      { text: '상상력과 연상을 통한 학습', type: 'N', score: 2 },
    ],
  },
  {
    question: '대화할 때 선호하는 주제는?',
    options: [
      { text: '실제 경험과 현실적인 이야기', type: 'S', score: 2 },
      { text: '구체적인 사실과 정보', type: 'S', score: 1 },
      { text: '미래의 가능성과 아이디어', type: 'N', score: 1 },
      { text: '추상적 개념과 이론', type: 'N', score: 2 },
    ],
  },
  {
    question: '문제를 해결할 때 중요하게 생각하는 것은?',
    options: [
      { text: '검증된 방법과 경험', type: 'S', score: 2 },
      { text: '실용적이고 현실적인 접근', type: 'S', score: 1 },
      { text: '혁신적인 아이디어', type: 'N', score: 1 },
      { text: '창의적이고 독창적인 해결책', type: 'N', score: 2 },
    ],
  },
  {
    question: '미래를 계획할 때 당신은?',
    options: [
      { text: '구체적이고 실현 가능한 계획을 세운다', type: 'S', score: 2 },
      { text: '현실적인 목표를 설정한다', type: 'S', score: 1 },
      { text: '큰 그림과 비전을 그린다', type: 'N', score: 1 },
      { text: '무한한 가능성을 상상한다', type: 'N', score: 2 },
    ],
  },

  // T vs F (사고-감정) 질문들
  {
    question: '결정을 내릴 때 우선시하는 것은?',
    options: [
      { text: '논리와 객관적 사실', type: 'T', score: 2 },
      { text: '합리적인 분석', type: 'T', score: 1 },
      { text: '타인의 감정과 가치', type: 'F', score: 1 },
      { text: '개인적 가치와 인간관계', type: 'F', score: 2 },
    ],
  },
  {
    question: '비판을 받았을 때 반응은?',
    options: [
      { text: '논리적으로 타당한지 분석한다', type: 'T', score: 2 },
      { text: '객관적으로 받아들이려 노력한다', type: 'T', score: 1 },
      { text: '감정적으로 상처받을 수 있다', type: 'F', score: 1 },
      { text: '개인적인 공격으로 느낀다', type: 'F', score: 2 },
    ],
  },
  {
    question: '팀에서 갈등이 생겼을 때?',
    options: [
      { text: '공정하고 논리적인 해결책을 찾는다', type: 'T', score: 2 },
      { text: '객관적인 중재자 역할을 한다', type: 'T', score: 1 },
      { text: '모두의 감정을 고려한다', type: 'F', score: 1 },
      { text: '화합과 조화를 최우선으로 한다', type: 'F', score: 2 },
    ],
  },
  {
    question: '칭찬할 때 당신의 방식은?',
    options: [
      { text: '구체적인 성과와 결과를 인정한다', type: 'T', score: 2 },
      { text: '객관적인 평가를 전달한다', type: 'T', score: 1 },
      { text: '따뜻한 격려와 응원을 한다', type: 'F', score: 1 },
      { text: '진심 어린 감정을 표현한다', type: 'F', score: 2 },
    ],
  },
  {
    question: '중요한 선택을 할 때?',
    options: [
      { text: '장단점을 분석하고 최선의 선택을 한다', type: 'T', score: 2 },
      { text: '논리적으로 타당한 결정을 내린다', type: 'T', score: 1 },
      { text: '마음이 이끄는 대로 따른다', type: 'F', score: 1 },
      { text: '가치관과 신념에 따라 결정한다', type: 'F', score: 2 },
    ],
  },
  {
    question: '타인을 평가할 때 중시하는 것은?',
    options: [
      { text: '능력과 성과', type: 'T', score: 2 },
      { text: '효율성과 생산성', type: 'T', score: 1 },
      { text: '인간성과 따뜻함', type: 'F', score: 1 },
      { text: '진정성과 선의', type: 'F', score: 2 },
    ],
  },

  // J vs P (판단-인식) 질문들
  {
    question: '일상생활에서 선호하는 방식은?',
    options: [
      { text: '계획을 세우고 그대로 실행한다', type: 'J', score: 2 },
      { text: '어느 정도 계획을 따른다', type: 'J', score: 1 },
      { text: '상황에 따라 유연하게 대처한다', type: 'P', score: 1 },
      { text: '즉흥적이고 자유롭게 행동한다', type: 'P', score: 2 },
    ],
  },
  {
    question: '프로젝트를 진행할 때?',
    options: [
      { text: '마감일보다 훨씬 전에 완성한다', type: 'J', score: 2 },
      { text: '계획대로 차근차근 진행한다', type: 'J', score: 1 },
      { text: '마감일이 가까워지면 집중한다', type: 'P', score: 1 },
      { text: '마지막 순간의 압박감을 즐긴다', type: 'P', score: 2 },
    ],
  },
  {
    question: '여행을 갈 때 당신은?',
    options: [
      { text: '상세한 일정표를 미리 짠다', type: 'J', score: 2 },
      { text: '대략적인 계획을 세운다', type: 'J', score: 1 },
      { text: '현지에서 즉흥적으로 결정한다', type: 'P', score: 1 },
      { text: '계획 없이 자유롭게 떠난다', type: 'P', score: 2 },
    ],
  },
  {
    question: '변화에 대한 태도는?',
    options: [
      { text: '예측 가능한 것을 선호한다', type: 'J', score: 2 },
      { text: '안정적인 환경을 좋아한다', type: 'J', score: 1 },
      { text: '새로운 변화를 즐긴다', type: 'P', score: 1 },
      { text: '끊임없는 변화를 추구한다', type: 'P', score: 2 },
    ],
  },
  {
    question: '업무 스타일은?',
    options: [
      { text: '체계적이고 조직적으로 일한다', type: 'J', score: 2 },
      { text: '정리정돈을 중요시한다', type: 'J', score: 1 },
      { text: '유연하고 적응적으로 일한다', type: 'P', score: 1 },
      { text: '자유롭고 창의적으로 일한다', type: 'P', score: 2 },
    ],
  },
  {
    question: '결정을 내리는 방식은?',
    options: [
      { text: '신속하고 확실하게 결정한다', type: 'J', score: 2 },
      { text: '충분히 고려 후 결정한다', type: 'J', score: 1 },
      { text: '여러 옵션을 열어둔다', type: 'P', score: 1 },
      { text: '최대한 결정을 미룬다', type: 'P', score: 2 },
    ],
  },
];
