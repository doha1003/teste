/**
 * API Mock 시스템
 * 모든 API 호출에 대한 모킹을 제공합니다.
 */

import { vi } from 'vitest';

// Gemini API Mock
export const createGeminiMock = () => {
  return vi.fn().mockImplementation((requestData) => {
    const { type, userData } = requestData;

    // Mock 응답 데이터
    const mockResponses = {
      daily: {
        success: true,
        data: {
          content: '오늘은 새로운 기회가 찾아올 날입니다. 긍정적인 마음가짐으로 하루를 시작하세요.',
          mood: '긍정적',
          lucky_number: 7,
          lucky_color: '파란색',
          recommendation: '새로운 도전을 해보는 것이 좋겠습니다.',
        },
      },
      tarot: {
        success: true,
        data: {
          card: '정의',
          content:
            '정의는 균형과 공정함을 상징합니다. 현재 상황에서 올바른 판단을 내리려고 노력하고 있음을 보여줍니다.',
          interpretation: '앞으로의 결정에서 공정함과 진실을 중시하세요.',
          advice: '감정보다는 이성적 판단을 우선시하는 것이 좋겠습니다.',
        },
      },
      saju: {
        success: true,
        data: {
          analysis: '갑자년생으로 물의 기운이 강합니다.',
          personality: '침착하고 신중한 성격으로 깊이 있는 사고를 합니다.',
          fortune: '올해는 새로운 변화의 시기입니다.',
          recommendation: '꾸준함을 유지하며 차근차근 목표를 향해 나아가세요.',
        },
      },
      zodiac: {
        success: true,
        data: {
          sign: userData?.birthMonth >= 3 && userData?.birthMonth <= 4 ? '양자리' : '처녀자리',
          content: '오늘은 창의적인 아이디어가 샘솟는 날입니다.',
          compatibility: '전갈자리와 궁합이 좋습니다.',
          lucky_item: '은반지',
        },
      },
      'zodiac-animal': {
        success: true,
        data: {
          animal: '토끼',
          content: '토끼해생은 온화하고 평화를 사랑하는 성격입니다.',
          year_fortune: '올해는 인간관계에서 좋은 변화가 있을 것입니다.',
          monthly_advice: '이달에는 새로운 사람들과의 만남을 중시하세요.',
        },
      },
    };

    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponses[type] || mockResponses.daily),
      text: () => Promise.resolve(JSON.stringify(mockResponses[type] || mockResponses.daily)),
      headers: new Headers({
        'content-type': 'application/json',
      }),
    });
  });
};

// Manseryeok API Mock
export const createManseryeokMock = () => {
  return vi.fn().mockImplementation((requestData) => {
    const { year, month, day, isLunar } = requestData;

    return Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            solar: {
              year: isLunar ? year + 1 : year,
              month: isLunar ? month + 1 : month,
              day: isLunar ? day + 1 : day,
            },
            lunar: {
              year: isLunar ? year : year - 1,
              month: isLunar ? month : month - 1,
              day: isLunar ? day : day - 1,
            },
            gapja: '갑자',
            animal: '쥐',
            element: '목',
            constellation: '미수',
          },
        }),
      headers: new Headers({
        'content-type': 'application/json',
      }),
    });
  });
};

// Rate Limiting Mock (실패 시뮬레이션)
export const createRateLimitMock = () => {
  return vi.fn().mockImplementation(() => {
    return Promise.resolve({
      ok: false,
      status: 429,
      json: () =>
        Promise.resolve({
          success: false,
          error: 'Rate limit exceeded',
          message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
        }),
      headers: new Headers({
        'content-type': 'application/json',
        'retry-after': '60',
      }),
    });
  });
};

// Network Error Mock
export const createNetworkErrorMock = () => {
  return vi.fn().mockImplementation(() => {
    return Promise.reject(new Error('Network request failed'));
  });
};

// Generic API Response Mock
export const createMockResponse = (data, status = 200, delay = 0) => {
  return vi.fn().mockImplementation(() => {
    const response = {
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      headers: new Headers({
        'content-type': 'application/json',
      }),
    };

    if (delay > 0) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(response), delay);
      });
    }

    return Promise.resolve(response);
  });
};

// Fetch Mock Setup
export const setupFetchMocks = () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  return {
    mockGeminiAPI: () => {
      global.fetch.mockImplementation((url, options) => {
        if (url.includes('/api/fortune')) {
          return createGeminiMock()(JSON.parse(options.body));
        }
        return originalFetch(url, options);
      });
    },

    mockManseryeokAPI: () => {
      global.fetch.mockImplementation((url, options) => {
        if (url.includes('/api/manseryeok')) {
          return createManseryeokMock()(JSON.parse(options.body));
        }
        return originalFetch(url, options);
      });
    },

    mockAllAPIs: () => {
      global.fetch.mockImplementation((url, options) => {
        if (url.includes('/api/fortune')) {
          return createGeminiMock()(JSON.parse(options.body));
        }
        if (url.includes('/api/manseryeok')) {
          return createManseryeokMock()(JSON.parse(options.body));
        }
        return originalFetch(url, options);
      });
    },

    mockRateLimit: () => {
      global.fetch.mockImplementation(() => createRateLimitMock()());
    },

    mockNetworkError: () => {
      global.fetch.mockImplementation(() => createNetworkErrorMock()());
    },
  };
};

// 전역 Mock 헬퍼들
export const mockHelpers = {
  // 성공적인 API 응답
  successResponse: (data) => createMockResponse(data, 200),

  // 에러 응답들
  notFoundResponse: () => createMockResponse({ error: 'Not Found' }, 404),
  serverErrorResponse: () => createMockResponse({ error: 'Internal Server Error' }, 500),
  rateLimitResponse: () => createMockResponse({ error: 'Rate Limit Exceeded' }, 429),

  // 지연된 응답
  delayedResponse: (data, delay = 1000) => createMockResponse(data, 200, delay),

  // 타임아웃 시뮬레이션
  timeoutResponse: () => {
    return vi.fn().mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });
    });
  },
};
