/**
 * API 엔드포인트 통합 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockApiResponse, mockApiError, mockNetworkError } from '../utils/test-helpers.js';

describe('API Endpoints Integration', () => {
  let apiManager;

  beforeEach(async () => {
    // Mock fetch globally with proper API responses
    global.fetch = vi.fn();

    // Setup API mocks using global helpers
    if (global.fetchMocks) {
      global.fetchMocks.mockAllAPIs();
    }

    // API 설정 모듈 로드 - 안전하게
    try {
      await import('../../js/api-config.js');
      apiManager = window.ApiHelper;
    } catch (error) {
      // Fallback API manager
      apiManager = {
        config: {
          GEMINI_API_KEY: 'test-api-key',
          BASE_URL: 'http://localhost:3000',
        },
        makeRequest: vi
          .fn()
          .mockImplementation(() =>
            Promise.resolve({ success: true, data: { content: 'Mock response' } })
          ),
        clearRateLimit: vi.fn(),
        rateLimitCheck: vi.fn().mockReturnValue(true),
      };
      window.ApiHelper = apiManager;
    }

    // API 키 설정
    if (apiManager.config) {
      apiManager.config.GEMINI_API_KEY = 'test-api-key';
    }

    // Rate limit 초기화
    if (apiManager.clearRateLimit) {
      apiManager.clearRateLimit();
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Fortune API Integration', () => {
    const fortuneEndpoint = 'https://doha-kr-ap.vercel.app/api/fortune';

    it('일일 운세 요청을 처리해야 함', { timeout: 2000 }, async () => {
      const payload = {
        type: 'daily',
        userData: {
          name: '홍길동',
          birthDate: '1990-05-15',
          birthHour: null,
          isLunar: false,
        },
      };

      const expectedResponse = {
        success: true,
        fortune: '오늘은 좋은 일이 생길 것입니다.',
        luckyColor: '파란색',
        luckyNumber: 7,
        advice: '긍정적인 마음을 유지하세요.',
      };

      // Mock the API response
      global.fetch.mockResolvedValue(global.createMockResponse(expectedResponse));

      const result = await apiManager.callFortuneAPI(payload);

      expect(result).toEqual(expectedResponse);
      expect(fetch).toHaveBeenCalledWith(
        fortuneEndpoint,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('타로 운세 요청을 처리해야 함', { timeout: 2000 }, async () => {
      const payload = {
        type: 'tarot',
        userData: {
          name: '김철수',
          question: '연애운이 궁금합니다',
        },
        cards: ['major_00', 'major_01', 'major_02'],
      };

      const expectedResponse = {
        success: true,
        interpretation: '현재 상황은 새로운 시작을 암시합니다...',
        cardMeanings: {
          past: '과거의 경험이 현재에 영향을 미치고 있습니다.',
          present: '현재는 선택의 기로에 서 있습니다.',
          future: '미래에는 긍정적인 변화가 예상됩니다.',
        },
      };

      // Mock the API response
      global.fetch.mockResolvedValue(global.createMockResponse(expectedResponse));

      const result = await apiManager.callFortuneAPI(payload);

      expect(result).toEqual(expectedResponse);
      expect(result.cardMeanings).toBeDefined();
    });

    it('사주 운세 요청을 처리해야 함', { timeout: 2000 }, async () => {
      const payload = {
        type: 'saju',
        userData: {
          name: '이영희',
          birthYear: 1985,
          birthMonth: 10,
          birthDay: 20,
          birthHour: 14,
          isLunar: true,
        },
      };

      const expectedResponse = {
        success: true,
        saju: {
          yearPillar: '을축',
          monthPillar: '정해',
          dayPillar: '무진',
          hourPillar: '신미',
        },
        interpretation: '당신의 사주는 목화통명격으로...',
        yearlyFortune: '올해는 대운이 바뀌는 시기입니다.',
      };

      // Mock the API response
      global.fetch.mockResolvedValue(global.createMockResponse(expectedResponse));

      const result = await apiManager.callFortuneAPI(payload);

      expect(result.saju).toBeDefined();
      expect(result.saju.yearPillar).toBe('을축');
    });

    it('API 에러 응답을 적절히 처리해야 함', async () => {
      const payload = {
        type: 'daily',
        userData: { name: 'test' },
      };

      // Mock error response
      global.fetch.mockResolvedValue(
        global.createMockResponse(
          {
            success: false,
            error: 'Bad Request',
          },
          400
        )
      );

      await expect(apiManager.callFortuneAPI(payload)).rejects.toThrow();
    });

    it('Rate Limiting이 적용되어야 함', { timeout: 2000 }, async () => {
      const payload = { type: 'daily', userData: { name: 'test' } };

      // Mock rate limit response
      global.fetch.mockResolvedValue(
        global.createMockResponse(
          {
            success: false,
            error: 'Rate limit exceeded',
          },
          429
        )
      );

      // Simulate rate limit check
      if (apiManager.rateLimitCheck) {
        apiManager.rateLimitCheck.mockReturnValue(false);
      }

      await expect(apiManager.callFortuneAPI(payload)).rejects.toThrow();
    });

    it('네트워크 오류를 처리해야 함', async () => {
      const payload = {
        type: 'daily',
        userData: { name: 'test' },
      };

      // Mock network error
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(apiManager.callFortuneAPI(payload)).rejects.toThrow('Network error');
    });
  });

  describe('Manseryeok API Integration', () => {
    const manseryeokEndpoint = 'https://doha-kr-ap.vercel.app/api/manseryeok';

    it('만세력 변환 요청을 처리해야 함', { timeout: 2000 }, async () => {
      const requestData = {
        year: 2024,
        month: 3,
        day: 15,
        hour: 10,
        isLunar: false,
      };

      const expectedResponse = {
        success: true,
        ganjiData: {
          year: { gan: '갑', ji: '진', combined: '갑진' },
          month: { gan: '정', ji: '묘', combined: '정묘' },
          day: { gan: '임', ji: '오', combined: '임오' },
          hour: { gan: '을', ji: '사', combined: '을사' },
        },
        lunarDate: {
          year: 2024,
          month: 2,
          day: 6,
          isLeapMonth: false,
        },
      };

      // Mock the API response
      global.fetch.mockResolvedValue(global.createMockResponse(expectedResponse));

      const result = await apiManager.secureRequest(manseryeokEndpoint, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      expect(result).toEqual(expectedResponse);
      expect(result.ganjiData.year.combined).toBe('갑진');
    });

    it('음력 날짜 변환을 처리해야 함', { timeout: 2000 }, async () => {
      const requestData = {
        year: 2024,
        month: 1,
        day: 1,
        isLunar: true,
      };

      const expectedResponse = {
        success: true,
        solarDate: {
          year: 2024,
          month: 2,
          day: 10,
        },
        ganjiData: {
          year: { combined: '갑진' },
          month: { combined: '병인' },
          day: { combined: '계미' },
        },
      };

      // Mock the API response
      global.fetch.mockResolvedValue(global.createMockResponse(expectedResponse));

      const result = await apiManager.secureRequest(manseryeokEndpoint, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      expect(result.solarDate).toBeDefined();
      expect(result.solarDate.month).toBe(2);
      expect(result.solarDate.day).toBe(10);
    });
  });

  describe('Cross-API Integration', () => {
    it.skip('운세와 만세력 API를 연계하여 사용할 수 있어야 함', { timeout: 2000 }, async () => {
      // 1. 먼저 만세력 API로 날짜 변환
      const manseryeokEndpoint = 'https://doha-kr-ap.vercel.app/api/manseryeok';
      const dateConversionRequest = {
        year: 1990,
        month: 10,
        day: 15,
        isLunar: true,
      };

      const manseryeokResponse = {
        success: true,
        solarDate: { year: 1990, month: 11, day: 20 },
        ganjiData: {
          year: { combined: '경오' },
          month: { combined: '정해' },
          day: { combined: '갑자' },
        },
      };

      mockApiResponse(manseryeokEndpoint, manseryeokResponse);

      const dateResult = await apiManager.secureRequest(manseryeokEndpoint, {
        method: 'POST',
        body: JSON.stringify(dateConversionRequest),
      });

      // 2. 변환된 날짜로 운세 요청
      const fortuneEndpoint = 'https://doha-kr-ap.vercel.app/api/fortune';
      const fortuneRequest = {
        type: 'saju',
        userData: {
          name: '홍길동',
          birthDate: `${dateResult.solarDate.year}-${dateResult.solarDate.month}-${dateResult.solarDate.day}`,
          ganjiData: dateResult.ganjiData,
        },
      };

      const fortuneResponse = {
        success: true,
        interpretation: '경오년 정해월 갑자일생은...',
        yearlyFortune: '올해 운세는...',
      };

      mockApiResponse(fortuneEndpoint, fortuneResponse);

      const fortuneResult = await apiManager.callFortuneAPI(fortuneRequest);

      expect(fortuneResult.interpretation).toContain('경오년');
      expect(fortuneResult.success).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    it.skip('일시적 오류 후 재시도가 성공해야 함', { timeout: 2000 }, async () => {
      const payload = {
        type: 'daily',
        userData: { name: 'test' },
      };

      // 첫 번째 시도는 실패
      mockApiError('fortune', 503, 'Service Unavailable');

      try {
        await apiManager.callFortuneAPI(payload);
      } catch (error) {
        expect(error.message).toContain('503');
      }

      // 두 번째 시도는 성공
      mockApiResponse('fortune', { success: true, fortune: '재시도 성공' });

      const result = await apiManager.callFortuneAPI(payload);
      expect(result.success).toBe(true);
      expect(result.fortune).toBe('재시도 성공');
    });
  });

  describe('Security Headers', () => {
    it.skip('CSRF 토큰이 포함되어야 함', { timeout: 2000 }, async () => {
      window.csrfToken = 'test-csrf-token-123';

      mockApiResponse('test', { success: true });

      await apiManager.secureRequest('/api/test');

      expect(fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-CSRF-Token': 'test-csrf-token-123',
          }),
        })
      );
    });

    it.skip('올바른 Content-Type 헤더가 설정되어야 함', { timeout: 2000 }, async () => {
      mockApiResponse('test', { success: true });

      await apiManager.secureRequest('/api/test', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });
});
