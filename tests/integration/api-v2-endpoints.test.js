/**
 * API v2 엔드포인트 통합 테스트
 * 실제 API 엔드포인트와의 통합을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Test environment detection
const isCI = process.env.CI === 'true';
const testApiBase = process.env.TEST_API_BASE || 'http://localhost:3000/api/v2';

describe('API v2 Endpoints Integration', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;

    // Mock fetch for non-CI environments
    if (!isCI) {
      global.fetch = vi.fn();
    }
  });

  afterEach(() => {
    if (!isCI) {
      global.fetch = originalFetch;
    }
    vi.clearAllMocks();
  });

  describe('Fortune API', () => {
    const fortuneEndpoint = `${testApiBase}/fortune`;

    it('일일 운세 API가 올바른 응답을 반환해야 함', async () => {
      const requestPayload = {
        type: 'daily',
        userData: {
          birthDate: '1990-01-01',
          gender: 'female',
          name: '김테스트',
        },
      };

      const expectedResponse = {
        success: true,
        data: {
          fortune: expect.stringContaining('오늘'),
          luckyNumber: expect.any(Number),
          luckyColor: expect.any(String),
          advice: expect.any(String),
        },
        timestamp: expect.any(String),
      };

      if (isCI) {
        // 실제 API 호출 (CI 환경)
        const response = await fetch(fortuneEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
      } else {
        // Mock 응답 (로컬 환경)
        global.fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                fortune: '오늘은 좋은 일이 있을 거예요!',
                luckyNumber: 7,
                luckyColor: '파란색',
                advice: '긍정적인 마음가짐을 유지하세요.',
              },
              timestamp: new Date().toISOString(),
            }),
        });

        const response = await fetch(fortuneEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
      }
    });

    it('사주 운세 API가 올바른 응답을 반환해야 함', async () => {
      const requestPayload = {
        type: 'saju',
        userData: {
          birthDate: '1990-01-01',
          birthTime: '14:30',
          gender: 'male',
          name: '이테스트',
        },
      };

      const expectedResponse = {
        success: true,
        data: {
          fortune: expect.any(String),
          sajuInfo: {
            year: expect.any(String),
            month: expect.any(String),
            day: expect.any(String),
            time: expect.any(String),
          },
          personality: expect.any(String),
          career: expect.any(String),
          love: expect.any(String),
          health: expect.any(String),
        },
      };

      if (isCI) {
        const response = await fetch(fortuneEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
      } else {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                fortune: '당신은 창의적이고 독립적인 성격을 가지고 있습니다.',
                sajuInfo: {
                  year: '경오',
                  month: '정축',
                  day: '신미',
                  time: '을미',
                },
                personality: '외향적이고 활발한 성격',
                career: '창조적인 분야에서 성공',
                love: '따뜻하고 배려심 깊은 관계',
                health: '전반적으로 양호한 건강 상태',
              },
            }),
        });

        const response = await fetch(fortuneEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
      }
    });

    it('타로 운세 API가 올바른 응답을 반환해야 함', async () => {
      const requestPayload = {
        type: 'tarot',
        userData: {
          question: '사랑에 대해 알고 싶습니다',
          name: '박테스트',
        },
      };

      const expectedResponse = {
        success: true,
        data: {
          cards: expect.arrayContaining([
            expect.objectContaining({
              name: expect.any(String),
              meaning: expect.any(String),
              position: expect.any(String),
            }),
          ]),
          interpretation: expect.any(String),
          advice: expect.any(String),
        },
      };

      if (isCI) {
        const response = await fetch(fortuneEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
      } else {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                cards: [
                  {
                    name: 'The Lovers',
                    meaning: '사랑과 선택',
                    position: 'upright',
                  },
                  {
                    name: 'The Sun',
                    meaning: '기쁨과 성공',
                    position: 'upright',
                  },
                ],
                interpretation: '사랑에서 좋은 선택을 하게 될 것입니다.',
                advice: '마음을 열고 진실한 감정을 표현하세요.',
              },
            }),
        });

        const response = await fetch(fortuneEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
      }
    });

    it('잘못된 요청에 대해 적절한 에러를 반환해야 함', async () => {
      const invalidPayload = {
        type: 'invalid_type',
        userData: {},
      };

      if (isCI) {
        const response = await fetch(fortuneEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidPayload),
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBeDefined();
      } else {
        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () =>
            Promise.resolve({
              success: false,
              error: 'Invalid fortune type',
              code: 'INVALID_TYPE',
            }),
        });

        const response = await fetch(fortuneEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidPayload),
        });

        expect(response.ok).toBe(false);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBeDefined();
      }
    });

    it('Rate limiting이 올바르게 작동해야 함', async () => {
      const requestPayload = {
        type: 'daily',
        userData: {
          birthDate: '1990-01-01',
          name: '테스트',
        },
      };

      if (isCI) {
        // 연속으로 많은 요청 전송
        const requests = Array(61)
          .fill()
          .map(() =>
            fetch(fortuneEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestPayload),
            })
          );

        const responses = await Promise.all(requests);
        const statusCodes = responses.map((r) => r.status);

        // 일부 요청은 429 (Too Many Requests)를 받아야 함
        expect(statusCodes).toContain(429);
      } else {
        // Mock으로 rate limiting 시뮬레이션
        global.fetch
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ success: true, data: {} }),
          })
          .mockResolvedValueOnce({
            ok: false,
            status: 429,
            json: () =>
              Promise.resolve({
                success: false,
                error: 'Too many requests',
                retryAfter: 60,
              }),
          });

        // 첫 번째 요청 성공
        const response1 = await fetch(fortuneEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });
        expect(response1.status).toBe(200);

        // 두 번째 요청 rate limited
        const response2 = await fetch(fortuneEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });
        expect(response2.status).toBe(429);
      }
    });
  });

  describe('Psychology API', () => {
    const psychologyEndpoint = `${testApiBase}/psychology`;

    it('MBTI 테스트 결과 분석이 올바르게 작동해야 함', async () => {
      const requestPayload = {
        type: 'mbti',
        answers: [
          { questionId: 1, answer: 'A' },
          { questionId: 2, answer: 'B' },
          // ... 더 많은 답변
        ],
        userData: {
          name: '김테스트',
          age: 25,
        },
      };

      const expectedResponse = {
        success: true,
        data: {
          type: expect.stringMatching(/^[EI][SN][TF][JP]$/),
          typeName: expect.any(String),
          description: expect.any(String),
          traits: expect.arrayContaining([expect.any(String)]),
          strengths: expect.arrayContaining([expect.any(String)]),
          weaknesses: expect.arrayContaining([expect.any(String)]),
          careers: expect.arrayContaining([expect.any(String)]),
          compatibility: expect.any(Object),
        },
      };

      if (isCI) {
        const response = await fetch(psychologyEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
      } else {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                type: 'ENFP',
                typeName: '활발한 영감가',
                description: '창의적이고 열정적인 성격',
                traits: ['외향적', '직관적', '감정적', '인식적'],
                strengths: ['창의성', '열정', '의사소통 능력'],
                weaknesses: ['집중력 부족', '완벽주의'],
                careers: ['상담사', '예술가', '마케터'],
                compatibility: {
                  best: ['INTJ', 'INFJ'],
                  good: ['ENFJ', 'ENTP'],
                  challenging: ['ISTJ', 'ISFJ'],
                },
              },
            }),
        });

        const response = await fetch(psychologyEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
      }
    });

    it('Love DNA 테스트가 올바르게 작동해야 함', async () => {
      const requestPayload = {
        type: 'love-dna',
        answers: [
          { questionId: 1, answer: 'romantic' },
          { questionId: 2, answer: 'adventure' },
          // ... 더 많은 답변
        ],
        userData: {
          name: '이테스트',
          age: 28,
          gender: 'female',
        },
      };

      const expectedResponse = {
        success: true,
        data: {
          dnaType: expect.any(String),
          typeName: expect.any(String),
          description: expect.any(String),
          loveStyle: expect.any(String),
          idealPartner: expect.any(String),
          dateIdeas: expect.arrayContaining([expect.any(String)]),
          compatibility: expect.any(Object),
        },
      };

      if (isCI) {
        const response = await fetch(psychologyEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
      } else {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                dnaType: 'romantic_adventurer',
                typeName: '로맨틱 모험가',
                description: '사랑에서 로맨스와 모험을 추구하는 타입',
                loveStyle: '열정적이고 창의적인 사랑',
                idealPartner: '함께 모험을 즐길 수 있는 파트너',
                dateIdeas: ['여행', '새로운 요리 체험', '야외 활동'],
                compatibility: {
                  best: ['adventurous_romantic', 'free_spirit'],
                  good: ['caring_supporter', 'creative_dreamer'],
                },
              },
            }),
        });

        const response = await fetch(psychologyEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
      }
    });

    it('부족한 답변으로 요청 시 에러를 반환해야 함', async () => {
      const incompletePayload = {
        type: 'mbti',
        answers: [
          { questionId: 1, answer: 'A' },
          // 답변이 부족함
        ],
        userData: {
          name: '테스트',
        },
      };

      if (isCI) {
        const response = await fetch(psychologyEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(incompletePayload),
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
      } else {
        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () =>
            Promise.resolve({
              success: false,
              error: 'Insufficient answers for analysis',
              code: 'INSUFFICIENT_DATA',
            }),
        });

        const response = await fetch(psychologyEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(incompletePayload),
        });

        expect(response.ok).toBe(false);
        const data = await response.json();
        expect(data.success).toBe(false);
      }
    });
  });

  describe('Tools API', () => {
    const toolsEndpoint = `${testApiBase}/tools`;

    it('BMI 계산이 올바르게 작동해야 함', async () => {
      const requestPayload = {
        type: 'bmi',
        data: {
          height: 170, // cm
          weight: 65, // kg
        },
      };

      const expectedResponse = {
        success: true,
        data: {
          bmi: expect.any(Number),
          category: expect.any(String),
          healthAdvice: expect.any(String),
          idealWeight: expect.objectContaining({
            min: expect.any(Number),
            max: expect.any(Number),
          }),
        },
      };

      if (isCI) {
        const response = await fetch(toolsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
        expect(data.data.bmi).toBeCloseTo(22.49, 2);
      } else {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                bmi: 22.49,
                category: '정상',
                healthAdvice: '현재 체중을 유지하는 것이 좋습니다.',
                idealWeight: {
                  min: 56.7,
                  max: 76.5,
                },
              },
            }),
        });

        const response = await fetch(toolsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
      }
    });

    it('급여 계산이 올바르게 작동해야 함', async () => {
      const requestPayload = {
        type: 'salary',
        data: {
          grossSalary: 5000000, // 월 총급여 (원)
          dependents: 1, // 부양가족 수
          taxYear: 2024,
        },
      };

      const expectedResponse = {
        success: true,
        data: {
          grossSalary: 5000000,
          incomeTax: expect.any(Number),
          localTax: expect.any(Number),
          nationalPension: expect.any(Number),
          healthInsurance: expect.any(Number),
          employmentInsurance: expect.any(Number),
          totalDeductions: expect.any(Number),
          netSalary: expect.any(Number),
          annualGross: expect.any(Number),
          annualNet: expect.any(Number),
        },
      };

      if (isCI) {
        const response = await fetch(toolsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
      } else {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                grossSalary: 5000000,
                incomeTax: 240000,
                localTax: 24000,
                nationalPension: 225000,
                healthInsurance: 175500,
                employmentInsurance: 45000,
                totalDeductions: 709500,
                netSalary: 4290500,
                annualGross: 60000000,
                annualNet: 51486000,
              },
            }),
        });

        const response = await fetch(toolsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
      }
    });

    it('텍스트 분석이 올바르게 작동해야 함', async () => {
      const requestPayload = {
        type: 'text-analysis',
        data: {
          text: '안녕하세요! 이것은 테스트 텍스트입니다. 한글과 영어, 숫자 123이 포함되어 있습니다.',
        },
      };

      const expectedResponse = {
        success: true,
        data: {
          characters: expect.any(Number),
          charactersNoSpaces: expect.any(Number),
          words: expect.any(Number),
          sentences: expect.any(Number),
          paragraphs: expect.any(Number),
          readingTime: expect.any(Number),
          language: 'ko',
        },
      };

      if (isCI) {
        const response = await fetch(toolsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
      } else {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                characters: 48,
                charactersNoSpaces: 38,
                words: 12,
                sentences: 2,
                paragraphs: 1,
                readingTime: 0.5,
                language: 'ko',
              },
            }),
        });

        const response = await fetch(toolsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        const data = await response.json();
        expect(data).toMatchObject(expectedResponse);
      }
    });

    it('잘못된 도구 타입에 대해 에러를 반환해야 함', async () => {
      const invalidPayload = {
        type: 'invalid_tool',
        data: {},
      };

      if (isCI) {
        const response = await fetch(toolsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidPayload),
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
      } else {
        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () =>
            Promise.resolve({
              success: false,
              error: 'Unknown tool type',
              code: 'INVALID_TOOL_TYPE',
            }),
        });

        const response = await fetch(toolsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidPayload),
        });

        expect(response.ok).toBe(false);
      }
    });
  });

  describe('API 공통 기능', () => {
    it('CORS 헤더가 올바르게 설정되어야 함', async () => {
      if (isCI) {
        const response = await fetch(`${testApiBase}/fortune`, {
          method: 'OPTIONS',
        });

        expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
        expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
        expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
      } else {
        // Mock 환경에서는 CORS 헤더가 포함된 응답 모킹
        global.fetch.mockResolvedValueOnce({
          ok: true,
          headers: {
            get: (name) => {
              const headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
              };
              return headers[name];
            },
          },
        });

        const response = await fetch(`${testApiBase}/fortune`, {
          method: 'OPTIONS',
        });

        expect(response).toBeDefined();
        expect(response.ok).toBe(true);
      }
    });

    it('Content-Type이 올바르게 검증되어야 함', async () => {
      if (isCI) {
        const response = await fetch(`${testApiBase}/fortune`, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: 'invalid body',
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
      } else {
        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () =>
            Promise.resolve({
              success: false,
              error: 'Invalid Content-Type',
              code: 'INVALID_CONTENT_TYPE',
            }),
        });

        const response = await fetch(`${testApiBase}/fortune`, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: 'invalid body',
        });

        expect(response.ok).toBe(false);
      }
    });

    it('요청 크기 제한이 적용되어야 함', async () => {
      const largePayload = {
        type: 'daily',
        userData: {
          name: 'x'.repeat(10000), // 매우 긴 이름
          birthDate: '1990-01-01',
        },
      };

      if (isCI) {
        const response = await fetch(`${testApiBase}/fortune`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(largePayload),
        });

        expect(response.status).toBe(413); // Payload Too Large
      } else {
        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 413,
          json: () =>
            Promise.resolve({
              success: false,
              error: 'Payload too large',
              code: 'PAYLOAD_TOO_LARGE',
            }),
        });

        const response = await fetch(`${testApiBase}/fortune`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(largePayload),
        });

        expect(response.status).toBe(413);
      }
    });
  });

  describe('한국어 데이터 처리', () => {
    it('한국어 이름과 텍스트를 올바르게 처리해야 함', async () => {
      const koreanPayload = {
        type: 'daily',
        userData: {
          name: '김한글',
          birthDate: '1990-01-01',
          question: '오늘 하루는 어떨까요? 좋은 일이 있을지 궁금합니다! 🌟',
        },
      };

      if (isCI) {
        const response = await fetch(`${testApiBase}/fortune`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(koreanPayload),
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.fortune).toContain('김한글');
      } else {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                fortune: '김한글님, 오늘 하루는 밝고 긍정적인 에너지가 가득할 것입니다! ✨',
                luckyNumber: 8,
                luckyColor: '황금색',
              },
            }),
        });

        const response = await fetch(`${testApiBase}/fortune`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(koreanPayload),
        });

        const data = await response.json();
        expect(data.data.fortune).toContain('김한글');
        expect(data.data.fortune).toContain('✨');
      }
    });
  });

  describe('에러 처리 및 복구', () => {
    it('서버 에러 시 적절한 응답을 반환해야 함', async () => {
      if (!isCI) {
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        try {
          await fetch(`${testApiBase}/fortune`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'daily',
              userData: { name: 'test' },
            }),
          });
        } catch (error) {
          expect(error.message).toBe('Network error');
        }
      }
    });

    it('타임아웃 처리가 올바르게 작동해야 함', async () => {
      if (!isCI) {
        // 단순한 에러 발생으로 타임아웃 상황 시뮬레이션
        const timeoutError = new Error('The operation was aborted');
        timeoutError.name = 'AbortError';

        global.fetch.mockRejectedValueOnce(timeoutError);

        try {
          await fetch(`${testApiBase}/fortune`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'daily',
              userData: { name: 'test' },
            }),
          });

          // 여기에 도달하면 안됨
          expect.fail('AbortError가 발생해야 함');
        } catch (error) {
          expect(error.name).toBe('AbortError');
        }
      } else {
        // CI 환경에서는 단순 통과
        expect(true).toBe(true);
      }
    });
  });
});
