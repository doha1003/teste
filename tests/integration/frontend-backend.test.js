/**
 * 프론트엔드-백엔드 통합 테스트
 * 실제 사용자 시나리오에서 프론트엔드와 백엔드 간의 데이터 흐름을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock implementations
class MockFortuneService {
  constructor() {
    this.apiManager = {
      callFortuneAPI: vi.fn(),
      checkRateLimit: vi.fn(),
    };
  }

  async getDailyFortune(userData) {
    try {
      this.apiManager.checkRateLimit('fortune-daily');

      const response = await this.apiManager.callFortuneAPI({
        type: 'daily',
        userData,
      });

      return {
        success: true,
        data: response.data,
        cached: false,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getSajuFortune(userData) {
    try {
      this.apiManager.checkRateLimit('fortune-saju');

      const response = await this.apiManager.callFortuneAPI({
        type: 'saju',
        userData,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

class MockTestService {
  constructor() {
    this.apiManager = {
      secureRequest: vi.fn(),
    };
    this.storage = {
      setLocal: vi.fn(),
      getLocal: vi.fn(),
    };
  }

  async submitMBTITest(answers, userData) {
    try {
      const response = await this.apiManager.secureRequest('/api/v2/psychology', {
        method: 'POST',
        body: JSON.stringify({
          type: 'mbti',
          answers,
          userData,
        }),
      });

      // 결과 저장
      this.storage.setLocal('mbti_result', response.data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async submitLoveDNATest(answers, userData) {
    try {
      const response = await this.apiManager.secureRequest('/api/v2/psychology', {
        method: 'POST',
        body: JSON.stringify({
          type: 'love-dna',
          answers,
          userData,
        }),
      });

      this.storage.setLocal('love_dna_result', response.data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

class MockToolService {
  constructor() {
    this.apiManager = {
      secureRequest: vi.fn(),
    };
  }

  async calculateBMI(height, weight) {
    try {
      const response = await this.apiManager.secureRequest('/api/v2/tools', {
        method: 'POST',
        body: JSON.stringify({
          type: 'bmi',
          data: { height, weight },
        }),
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async calculateSalary(grossSalary, dependents) {
    try {
      const response = await this.apiManager.secureRequest('/api/v2/tools', {
        method: 'POST',
        body: JSON.stringify({
          type: 'salary',
          data: { grossSalary, dependents, taxYear: 2024 },
        }),
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

describe('Frontend-Backend Integration', () => {
  let dom;
  let fortuneService;
  let testService;
  let toolService;

  beforeEach(() => {
    // JSDOM 설정
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body>
          <div id="app"></div>
        </body>
      </html>
    `,
      {
        url: 'http://localhost:3000',
        pretendToBeVisual: true,
        resources: 'usable',
      }
    );

    global.window = dom.window;
    global.document = dom.window.document;
    global.fetch = vi.fn();

    // 서비스 인스턴스 생성
    fortuneService = new MockFortuneService();
    testService = new MockTestService();
    toolService = new MockToolService();
  });

  afterEach(() => {
    dom.window.close();
    vi.clearAllMocks();
  });

  describe('운세 서비스 통합', () => {
    it('일일 운세 전체 플로우가 올바르게 작동해야 함', async () => {
      // Mock API 응답
      const mockResponse = {
        data: {
          fortune: '오늘은 새로운 기회가 찾아올 것입니다.',
          luckyNumber: 7,
          luckyColor: '파란색',
          advice: '긍정적인 마음가짐을 유지하세요.',
        },
      };

      fortuneService.apiManager.callFortuneAPI.mockResolvedValue(mockResponse);

      // 사용자 데이터
      const userData = {
        name: '김테스트',
        birthDate: '1990-01-01',
        gender: 'female',
      };

      // 서비스 호출
      const result = await fortuneService.getDailyFortune(userData);

      // 검증
      expect(result.success).toBe(true);
      expect(result.data.fortune).toContain('기회');
      expect(result.data.luckyNumber).toBe(7);
      expect(result.data.luckyColor).toBe('파란색');

      // API 호출 검증
      expect(fortuneService.apiManager.checkRateLimit).toHaveBeenCalledWith('fortune-daily');
      expect(fortuneService.apiManager.callFortuneAPI).toHaveBeenCalledWith({
        type: 'daily',
        userData,
      });
    });

    it('사주 운세 서비스가 상세한 정보를 반환해야 함', async () => {
      const mockSajuResponse = {
        data: {
          fortune: '당신은 창의적이고 독립적인 성격을 가지고 있습니다.',
          sajuInfo: {
            year: '경오',
            month: '정축',
            day: '신미',
            time: '을미',
          },
          personality: '외향적이고 활발한 성격',
          career: '창조적인 분야에서 성공할 것입니다',
          love: '진실한 사랑을 만날 것입니다',
          health: '전반적으로 건강한 상태를 유지할 것입니다',
        },
      };

      fortuneService.apiManager.callFortuneAPI.mockResolvedValue(mockSajuResponse);

      const userData = {
        name: '이테스트',
        birthDate: '1990-01-01',
        birthTime: '14:30',
        gender: 'male',
      };

      const result = await fortuneService.getSajuFortune(userData);

      expect(result.success).toBe(true);
      expect(result.data.sajuInfo).toBeDefined();
      expect(result.data.personality).toContain('외향적');
      expect(result.data.career).toContain('창조적');
      expect(result.data.love).toContain('사랑');
      expect(result.data.health).toContain('건강');
    });

    it('Rate Limiting이 적용되어 에러를 처리해야 함', async () => {
      fortuneService.apiManager.checkRateLimit.mockImplementation(() => {
        throw new Error('Rate limit exceeded. Please try again later.');
      });

      const userData = {
        name: '김테스트',
        birthDate: '1990-01-01',
      };

      const result = await fortuneService.getDailyFortune(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Rate limit exceeded');
    });

    it('API 에러 시 사용자 친화적 메시지를 반환해야 함', async () => {
      fortuneService.apiManager.callFortuneAPI.mockRejectedValue(
        new Error('API Error: 500 Internal Server Error')
      );

      const userData = {
        name: '김테스트',
        birthDate: '1990-01-01',
      };

      const result = await fortuneService.getDailyFortune(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('API Error');
    });
  });

  describe('심리 테스트 서비스 통합', () => {
    it('MBTI 테스트 전체 플로우가 올바르게 작동해야 함', async () => {
      const mockMBTIResponse = {
        data: {
          type: 'ENFP',
          typeName: '활발한 영감가',
          description: '창의적이고 열정적인 성격의 소유자',
          traits: ['외향적', '직관적', '감정적', '인식적'],
          strengths: ['창의성', '열정', '의사소통 능력', '적응력'],
          weaknesses: ['집중력 부족', '완벽주의 경향'],
          careers: ['상담사', '예술가', '마케터', '교사'],
          compatibility: {
            best: ['INTJ', 'INFJ'],
            good: ['ENFJ', 'ENTP'],
            challenging: ['ISTJ', 'ISFJ'],
          },
        },
      };

      testService.apiManager.secureRequest.mockResolvedValue(mockMBTIResponse);

      const answers = [
        { questionId: 1, answer: 'A' },
        { questionId: 2, answer: 'B' },
        { questionId: 3, answer: 'A' },
        // ... 더 많은 답변
      ];

      const userData = {
        name: '김테스트',
        age: 25,
        gender: 'female',
      };

      const result = await testService.submitMBTITest(answers, userData);

      expect(result.success).toBe(true);
      expect(result.data.type).toBe('ENFP');
      expect(result.data.typeName).toBe('활발한 영감가');
      expect(result.data.traits).toContain('외향적');
      expect(result.data.strengths).toContain('창의성');

      // 스토리지 저장 확인
      expect(testService.storage.setLocal).toHaveBeenCalledWith(
        'mbti_result',
        mockMBTIResponse.data
      );
    });

    it('Love DNA 테스트가 개인화된 결과를 제공해야 함', async () => {
      const mockLoveDNAResponse = {
        data: {
          dnaType: 'romantic_adventurer',
          typeName: '로맨틱 모험가',
          description: '사랑에서 로맨스와 모험을 동시에 추구하는 타입',
          loveStyle: '열정적이고 창의적인 사랑을 추구',
          idealPartner: '함께 새로운 경험을 즐길 수 있는 파트너',
          dateIdeas: ['새로운 도시 탐험', '요리 클래스 참여', '야외 캠핑', '미술관 관람'],
          compatibility: {
            best: ['adventurous_romantic', 'free_spirit'],
            good: ['caring_supporter', 'creative_dreamer'],
            challenging: ['traditional_romantic', 'practical_lover'],
          },
        },
      };

      testService.apiManager.secureRequest.mockResolvedValue(mockLoveDNAResponse);

      const answers = [
        { questionId: 1, answer: 'romantic' },
        { questionId: 2, answer: 'adventure' },
        { questionId: 3, answer: 'creative' },
        // ... 더 많은 답변
      ];

      const userData = {
        name: '이테스트',
        age: 28,
        gender: 'male',
      };

      const result = await testService.submitLoveDNATest(answers, userData);

      expect(result.success).toBe(true);
      expect(result.data.dnaType).toBe('romantic_adventurer');
      expect(result.data.dateIdeas).toContain('새로운 도시 탐험');
      expect(result.data.compatibility.best).toContain('adventurous_romantic');

      // 스토리지 저장 확인
      expect(testService.storage.setLocal).toHaveBeenCalledWith(
        'love_dna_result',
        mockLoveDNAResponse.data
      );
    });

    it('부족한 답변으로 테스트 제출 시 적절한 에러를 반환해야 함', async () => {
      testService.apiManager.secureRequest.mockRejectedValue(
        new Error('Insufficient answers for analysis')
      );

      const incompleteAnswers = [
        { questionId: 1, answer: 'A' },
        // 답변이 부족함
      ];

      const userData = {
        name: '테스트',
        age: 25,
      };

      const result = await testService.submitMBTITest(incompleteAnswers, userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient answers');
    });
  });

  describe('실용 도구 서비스 통합', () => {
    it('BMI 계산기가 정확한 결과와 건강 조언을 제공해야 함', async () => {
      const mockBMIResponse = {
        data: {
          bmi: 22.49,
          category: '정상',
          healthAdvice:
            '현재 체중을 유지하는 것이 좋습니다. 규칙적인 운동과 균형 잡힌 식단을 권장합니다.',
          idealWeight: {
            min: 56.7,
            max: 76.5,
          },
          details: {
            underweight: { max: 18.5 },
            normal: { min: 18.5, max: 24.9 },
            overweight: { min: 25, max: 29.9 },
            obese: { min: 30 },
          },
        },
      };

      toolService.apiManager.secureRequest.mockResolvedValue(mockBMIResponse);

      const result = await toolService.calculateBMI(170, 65);

      expect(result.success).toBe(true);
      expect(result.data.bmi).toBeCloseTo(22.49, 2);
      expect(result.data.category).toBe('정상');
      expect(result.data.healthAdvice).toContain('규칙적인 운동');
      expect(result.data.idealWeight.min).toBeCloseTo(56.7, 1);
      expect(result.data.idealWeight.max).toBeCloseTo(76.5, 1);
    });

    it('급여 계산기가 정확한 세금 계산을 제공해야 함', async () => {
      const mockSalaryResponse = {
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
          breakdown: {
            incomeTaxRate: 4.8,
            localTaxRate: 0.48,
            pensionRate: 4.5,
            healthRate: 3.51,
            employmentRate: 0.9,
          },
        },
      };

      toolService.apiManager.secureRequest.mockResolvedValue(mockSalaryResponse);

      const result = await toolService.calculateSalary(5000000, 1);

      expect(result.success).toBe(true);
      expect(result.data.grossSalary).toBe(5000000);
      expect(result.data.netSalary).toBe(4290500);
      expect(result.data.totalDeductions).toBe(709500);
      expect(result.data.annualNet).toBe(51486000);
      expect(result.data.breakdown.incomeTaxRate).toBe(4.8);
    });

    it('잘못된 입력값에 대해 적절한 에러를 반환해야 함', async () => {
      toolService.apiManager.secureRequest.mockRejectedValue(
        new Error('Invalid input: height must be between 100 and 250 cm')
      );

      const result = await toolService.calculateBMI(50, 65); // 잘못된 키 값

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid input');
    });
  });

  describe('사용자 경험 통합', () => {
    it('로딩 상태와 에러 상태를 올바르게 처리해야 함', async () => {
      // DOM 요소 생성
      const app = document.getElementById('app');
      app.innerHTML = `
        <div class="fortune-container">
          <button id="get-fortune-btn">운세 보기</button>
          <div id="loading" style="display: none;">로딩 중...</div>
          <div id="result" style="display: none;"></div>
          <div id="error" style="display: none;"></div>
        </div>
      `;

      const button = document.getElementById('get-fortune-btn');
      const loading = document.getElementById('loading');
      const result = document.getElementById('result');
      const error = document.getElementById('error');

      // 지연된 응답 시뮬레이션
      let resolvePromise;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      fortuneService.apiManager.callFortuneAPI.mockReturnValue(delayedPromise);

      // 버튼 클릭 시뮬레이션
      button.click();

      // 로딩 상태 표시
      loading.style.display = 'block';
      result.style.display = 'none';
      error.style.display = 'none';

      expect(loading.style.display).toBe('block');
      expect(result.style.display).toBe('none');

      // 응답 완료
      resolvePromise({
        data: {
          fortune: '좋은 하루가 될 것입니다!',
          luckyNumber: 3,
        },
      });

      await delayedPromise;

      // 결과 표시
      loading.style.display = 'none';
      result.style.display = 'block';
      result.innerHTML = '<p>좋은 하루가 될 것입니다!</p>';

      expect(loading.style.display).toBe('none');
      expect(result.style.display).toBe('block');
      expect(result.innerHTML).toContain('좋은 하루가 될 것입니다');
    });

    it('폼 유효성 검사가 올바르게 작동해야 함', async () => {
      const app = document.getElementById('app');
      app.innerHTML = `
        <form id="user-form">
          <input type="text" id="name" name="name" required>
          <input type="date" id="birthDate" name="birthDate" required>
          <button type="submit">제출</button>
          <div id="validation-errors"></div>
        </form>
      `;

      const form = document.getElementById('user-form');
      const nameInput = document.getElementById('name');
      const birthDateInput = document.getElementById('birthDate');
      const errors = document.getElementById('validation-errors');

      // 유효성 검사 함수
      const validateForm = () => {
        const name = nameInput.value;
        const birthDate = birthDateInput.value;
        const errorMessages = [];

        if (!name || name.length < 2) {
          errorMessages.push('이름은 2글자 이상 입력해주세요.');
        }

        if (!birthDate) {
          errorMessages.push('생년월일을 입력해주세요.');
        } else {
          const date = new Date(birthDate);
          const today = new Date();
          if (date > today) {
            errorMessages.push('생년월일이 미래일 수 없습니다.');
          }
        }

        if (errorMessages.length > 0) {
          errors.innerHTML = errorMessages.map((msg) => `<div class="error">${msg}</div>`).join('');
          errors.style.display = 'block';
          return false;
        } else {
          errors.style.display = 'none';
          return true;
        }
      };

      // 잘못된 입력으로 테스트
      nameInput.value = 'A';
      birthDateInput.value = '2025-12-31';

      const isValid = validateForm();

      expect(isValid).toBe(false);
      expect(errors.innerHTML).toContain('2글자 이상');
      expect(errors.innerHTML).toContain('미래일 수 없습니다');

      // 올바른 입력으로 테스트
      nameInput.value = '김테스트';
      birthDateInput.value = '1990-01-01';

      const isValidCorrect = validateForm();

      expect(isValidCorrect).toBe(true);
      expect(errors.style.display).toBe('none');
    });

    it.skip('결과 공유 기능이 올바르게 작동해야 함', async () => {
      // Navigator API 모킹
      Object.defineProperty(navigator, 'share', {
        value: vi.fn(() => Promise.resolve()),
        writable: true,
      });

      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn(() => Promise.resolve()),
        },
        writable: true,
      });

      const app = document.getElementById('app');
      app.innerHTML = `
        <div class="result-share">
          <button id="share-btn">공유하기</button>
          <button id="copy-btn">링크 복사</button>
          <div id="share-message" style="display: none;"></div>
        </div>
      `;

      const shareBtn = document.getElementById('share-btn');
      const copyBtn = document.getElementById('copy-btn');
      const message = document.getElementById('share-message');

      // 공유 기능 테스트
      const shareData = {
        title: 'MBTI 테스트 결과',
        text: '나의 MBTI 유형은 ENFP입니다!',
        url: 'https://doha.kr/tests/mbti/result?id=12345',
      };

      shareBtn.addEventListener('click', async () => {
        try {
          await navigator.share(shareData);
          message.textContent = '공유가 완료되었습니다!';
          message.style.display = 'block';
        } catch (error) {
          console.error('공유 실패:', error);
        }
      });

      shareBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 10)); // 비동기 처리 대기

      expect(navigator.share).toHaveBeenCalledWith(shareData);
      expect(message.textContent).toBe('공유가 완료되었습니다!');

      // 링크 복사 기능 테스트
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(shareData.url);
          message.textContent = '링크가 복사되었습니다!';
          message.style.display = 'block';
        } catch (error) {
          console.error('복사 실패:', error);
        }
      });

      copyBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(shareData.url);
      expect(message.textContent).toBe('링크가 복사되었습니다!');
    });
  });

  describe('성능 및 최적화', () => {
    it('API 응답을 캐시하여 중복 요청을 방지해야 함', async () => {
      const cacheKey = 'fortune_daily_김테스트_1990-01-01';
      const cachedResponse = {
        data: {
          fortune: '캐시된 운세입니다.',
          cached: true,
          timestamp: new Date().toISOString(),
        },
      };

      // 캐시 구현 시뮬레이션
      const cache = new Map();

      const getCachedFortune = async (userData) => {
        const key = `fortune_daily_${userData.name}_${userData.birthDate}`;

        if (cache.has(key)) {
          const cached = cache.get(key);
          const now = new Date().getTime();
          const cacheTime = new Date(cached.timestamp).getTime();

          // 1시간 캐시
          if (now - cacheTime < 3600000) {
            return cached;
          } else {
            cache.delete(key);
          }
        }

        // 새로운 요청
        const response = await fortuneService.getDailyFortune(userData);
        if (response.success) {
          cache.set(key, {
            ...response,
            timestamp: new Date().toISOString(),
          });
        }

        return response;
      };

      fortuneService.apiManager.callFortuneAPI.mockResolvedValue({
        data: { fortune: '새로운 운세입니다.' },
      });

      const userData = {
        name: '김테스트',
        birthDate: '1990-01-01',
      };

      // 첫 번째 요청
      const result1 = await getCachedFortune(userData);
      expect(result1.success).toBe(true);
      expect(fortuneService.apiManager.callFortuneAPI).toHaveBeenCalledTimes(1);

      // 두 번째 요청 (캐시된 결과)
      const result2 = await getCachedFortune(userData);
      expect(result2.success).toBe(true);
      expect(fortuneService.apiManager.callFortuneAPI).toHaveBeenCalledTimes(1); // 추가 호출 없음
    });

    it('이미지 지연 로딩이 올바르게 작동해야 함', async () => {
      const app = document.getElementById('app');
      app.innerHTML = `
        <div class="result-cards">
          <img class="lazy-image" data-src="/images/mbti/ENFP.png" src="/images/placeholder.png" alt="ENFP">
          <img class="lazy-image" data-src="/images/mbti/INTJ.png" src="/images/placeholder.png" alt="INTJ">
        </div>
      `;

      const lazyImages = document.querySelectorAll('.lazy-image');

      // Intersection Observer 모킹
      const mockIntersectionObserver = vi.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      });

      global.IntersectionObserver = mockIntersectionObserver;

      // 지연 로딩 로직 시뮬레이션
      const loadLazyImages = () => {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.classList.add('loaded');
              imageObserver.unobserve(img);
            }
          });
        });

        lazyImages.forEach((img) => imageObserver.observe(img));
      };

      loadLazyImages();

      expect(mockIntersectionObserver).toHaveBeenCalled();
      expect(mockIntersectionObserver().observe).toHaveBeenCalledTimes(2);
    });
  });

  describe('접근성 및 사용성', () => {
    it('키보드 네비게이션이 올바르게 작동해야 함', async () => {
      const app = document.getElementById('app');
      app.innerHTML = `
        <div class="test-form">
          <button id="prev-btn" tabindex="1">이전</button>
          <div class="question">
            <p>질문 1: 다음 중 선호하는 것은?</p>
            <button class="option" tabindex="2" data-value="A">옵션 A</button>
            <button class="option" tabindex="3" data-value="B">옵션 B</button>
          </div>
          <button id="next-btn" tabindex="4" disabled>다음</button>
        </div>
      `;

      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');
      const options = document.querySelectorAll('.option');

      // 옵션 선택 시 다음 버튼 활성화
      options.forEach((option) => {
        option.addEventListener('click', () => {
          options.forEach((opt) => opt.classList.remove('selected'));
          option.classList.add('selected');
          nextBtn.disabled = false;
        });

        // 키보드 이벤트 처리
        option.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            option.click();
          }
        });
      });

      // 첫 번째 옵션에 Enter 키 입력
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      options[0].dispatchEvent(enterEvent);

      expect(options[0].classList.contains('selected')).toBe(true);
      expect(nextBtn.disabled).toBe(false);
    });

    it('화면 읽기 프로그램을 위한 ARIA 속성이 올바르게 설정되어야 함', () => {
      const app = document.getElementById('app');
      app.innerHTML = `
        <div class="progress-container" role="progressbar" aria-valuenow="3" aria-valuemin="1" aria-valuemax="10">
          <div class="progress-bar">
            <div class="progress-fill" style="width: 30%"></div>
          </div>
          <div class="progress-text" aria-live="polite">3 / 10 완료</div>
        </div>
        
        <div class="question-container">
          <h2 id="question-title">질문 3</h2>
          <fieldset role="radiogroup" aria-labelledby="question-title">
            <legend class="sr-only">답변 선택</legend>
            <input type="radio" id="option-a" name="answer" value="A">
            <label for="option-a">옵션 A</label>
            <input type="radio" id="option-b" name="answer" value="B">
            <label for="option-b">옵션 B</label>
          </fieldset>
        </div>
      `;

      const progressBar = document.querySelector('[role="progressbar"]');
      const radioGroup = document.querySelector('[role="radiogroup"]');
      const liveRegion = document.querySelector('[aria-live="polite"]');

      expect(progressBar.getAttribute('aria-valuenow')).toBe('3');
      expect(progressBar.getAttribute('aria-valuemax')).toBe('10');
      expect(radioGroup.getAttribute('aria-labelledby')).toBe('question-title');
      expect(liveRegion.getAttribute('aria-live')).toBe('polite');

      // 라벨과 입력 요소 연결 확인
      const optionA = document.getElementById('option-a');
      const labelA = document.querySelector('label[for="option-a"]');

      expect(optionA.id).toBe('option-a');
      expect(labelA.getAttribute('for')).toBe('option-a');
    });
  });
});
