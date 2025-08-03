/**
 * 테스트용 데이터 fixtures
 */

export const testUsers = {
  valid: {
    name: '홍길동',
    birthYear: 1990,
    birthMonth: 5,
    birthDay: 15,
    birthHour: 14,
    isLunar: false,
  },

  lunarUser: {
    name: '김철수',
    birthYear: 1985,
    birthMonth: 10,
    birthDay: 20,
    birthHour: 23,
    isLunar: true,
  },

  minimal: {
    name: '이영희',
    birthYear: 1995,
    birthMonth: 3,
    birthDay: 8,
  },
};

export const mbtiQuestions = [
  {
    id: 1,
    question: '나는 주로',
    options: [
      { value: 'E', text: '사람들과 어울리는 것을 좋아한다' },
      { value: 'I', text: '혼자 있는 시간을 즐긴다' },
    ],
  },
  {
    id: 2,
    question: '일을 할 때 나는',
    options: [
      { value: 'S', text: '구체적이고 현실적인 것을 선호한다' },
      { value: 'N', text: '가능성과 미래를 상상하는 것을 좋아한다' },
    ],
  },
];

export const tarotCards = {
  major: [
    { id: 'major_00', name: '바보', nameEn: 'The Fool' },
    { id: 'major_01', name: '마법사', nameEn: 'The Magician' },
    { id: 'major_02', name: '여사제', nameEn: 'The High Priestess' },
  ],

  minor: {
    wands: [
      { id: 'wands_01', name: '완드의 에이스' },
      { id: 'wands_02', name: '완드의 2' },
    ],
    cups: [
      { id: 'cups_01', name: '컵의 에이스' },
      { id: 'cups_02', name: '컵의 2' },
    ],
  },
};

export const fortuneResponses = {
  daily: {
    success: true,
    fortune:
      '오늘은 새로운 기회가 찾아올 것입니다. 평소 미뤄두었던 일을 시작하기 좋은 날이며, 대인관계에서도 긍정적인 변화가 예상됩니다.',
    luckyColor: '파란색',
    luckyNumber: 7,
    luckyDirection: '동쪽',
    advice: '오늘은 적극적인 자세로 임하세요. 망설이지 말고 도전하는 것이 중요합니다.',
    warning: '지나친 자신감은 실수를 부를 수 있으니 신중함도 잊지 마세요.',
  },

  tarot: {
    success: true,
    cards: {
      past: { card: 'major_00', meaning: '과거에는 순수한 마음으로 시작했습니다.' },
      present: { card: 'major_01', meaning: '현재는 능력을 발휘할 때입니다.' },
      future: { card: 'major_21', meaning: '미래에는 완성과 성취가 기다립니다.' },
    },
    interpretation:
      '당신의 여정은 순수한 시작에서 출발하여 현재 능력을 발휘하는 단계에 있으며, 궁극적으로는 큰 성취를 이룰 것입니다.',
    advice: '자신의 능력을 믿고 꾸준히 나아가세요.',
  },

  saju: {
    success: true,
    pillars: {
      year: { gan: '갑', ji: '자', combined: '갑자' },
      month: { gan: '을', ji: '축', combined: '을축' },
      day: { gan: '병', ji: '인', combined: '병인' },
      hour: { gan: '정', ji: '묘', combined: '정묘' },
    },
    interpretation: '목화통명격으로 창의적이고 열정적인 기질을 가지고 있습니다.',
    yearlyFortune: '올해는 새로운 도전을 시작하기 좋은 해입니다.',
    monthlyFortune: '이번 달은 인간관계에서 좋은 소식이 있을 것입니다.',
    characteristics: [
      '리더십이 강하고 추진력이 있습니다.',
      '창의적이고 예술적 감각이 뛰어납니다.',
      '때로는 너무 이상적인 목표를 추구할 수 있습니다.',
    ],
  },
};

export const apiErrors = {
  rateLimit: {
    success: false,
    error: 'Rate limit exceeded',
    message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
  },

  invalidInput: {
    success: false,
    error: 'Invalid input',
    message: '입력값이 올바르지 않습니다.',
  },

  serverError: {
    success: false,
    error: 'Internal server error',
    message: '서버 오류가 발생했습니다.',
  },
};

export const mockLocalStorage = {
  theme: 'light',
  userName: '홍길동',
  lastVisit: '2024-03-15',
  preferences: {
    notifications: true,
    autoSave: true,
  },
};

export const accessibilityChecks = {
  contrast: {
    light: {
      background: '#ffffff',
      text: '#000000',
      ratio: 21,
    },
    dark: {
      background: '#000000',
      text: '#ffffff',
      ratio: 21,
    },
  },

  focusIndicators: {
    outline: '2px solid #4CAF50',
    offset: '2px',
  },

  ariaLabels: {
    navigation: '주 메뉴',
    search: '검색',
    submit: '제출',
    close: '닫기',
  },
};
