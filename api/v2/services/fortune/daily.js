/**
 * @fileoverview 일일 운세 서비스 - 사주 기반 개인화 운세 제공
 * @version 2.0.0
 * @author doha.kr Backend Team
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createLogger } from '../../core/logger.js';
import { cache, keyBuilder } from '../../core/cache.js';

const logger = createLogger('daily-fortune');

/**
 * Gemini AI 초기화
 */
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  logger.error('GEMINI_API_KEY not configured');
}

/**
 * 일일 운세 생성 클래스
 */
export class DailyFortuneService {
  constructor() {
    this.model = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * 개인화된 일일 운세 생성
   */
  async generateDailyFortune(userData, options = {}) {
    const { includeDetailed = true, includeLucky = true, todayDate = null } = options;

    if (!this.model) {
      throw new Error('Gemini API가 설정되지 않았습니다.');
    }

    // 캐시 키 생성 (같은 날짜, 같은 사용자는 같은 결과)
    const today = todayDate || new Date().toISOString().split('T')[0];
    const cacheKey = keyBuilder.build('daily-fortune', today, this.getUserHash(userData));

    // 캐시에서 확인
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info('Daily fortune cache hit', { date: today });
      return cached;
    }

    try {
      const prompt = this.buildFortunePrompt(userData, today, includeDetailed, includeLucky);

      logger.info('Generating daily fortune', {
        date: today,
        hasUserData: !!userData,
        promptLength: prompt.length,
      });

      const startTime = performance.now();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const duration = performance.now() - startTime;

      logger.info('Daily fortune generated', {
        date: today,
        responseLength: text.length,
        duration: Math.round(duration),
      });

      // 응답 파싱
      const parsedFortune = this.parseFortuneResponse(text);

      // 메타데이터 추가
      const fortuneData = {
        ...parsedFortune,
        date: today,
        generatedAt: new Date().toISOString(),
        aiGenerated: true,
        userData: {
          name: userData.name,
          birthDate: userData.birthDate,
          gender: userData.gender,
        },
      };

      // 캐시에 저장 (하루 동안)
      await cache.set(cacheKey, fortuneData, 24 * 60 * 60 * 1000);

      return fortuneData;
    } catch (error) {
      logger.error('Daily fortune generation failed', {
        error: error.message,
        date: today,
        userData: this.sanitizeUserData(userData),
      });
      throw error;
    }
  }

  /**
   * 운세 프롬프트 구성
   */
  buildFortunePrompt(userData, date, includeDetailed, includeLucky) {
    const { name, birthDate, gender, birthTime, manseryeok } = userData;
    const genderKorean = gender === 'male' ? '남성' : '여성';

    let prompt = `당신은 한국 최고의 사주명리학 전문가입니다. 다음 정보를 바탕으로 ${date}의 운세를 전문적으로 분석해주세요.

이름: ${name}
생년월일: ${birthDate}
성별: ${genderKorean}`;

    if (birthTime) {
      prompt += `\n출생시간: ${birthTime}시`;
    }

    if (manseryeok) {
      prompt += `\n만세력 정보: ${JSON.stringify(manseryeok).substring(0, 500)}`;
    }

    prompt += `\n오늘 날짜: ${date}

다음 형식으로 상세하게 답변해주세요:

종합운: [0-100점] [오늘의 전반적인 운세를 사주 관점에서 3-4문장으로 상세히 설명]
애정운: [0-100점] [연애운과 인간관계를 2-3문장으로 설명]
금전운: [0-100점] [재물운과 투자운을 2-3문장으로 설명]
건강운: [0-100점] [건강 상태와 주의사항을 2-3문장으로 설명]
직장운: [0-100점] [업무운과 승진운을 2-3문장으로 설명]`;

    if (includeLucky) {
      prompt += `

오늘의 조언: [오늘 하루를 위한 구체적인 행동 지침 2-3문장]
행운의 시간: [가장 운이 좋은 시간대]
행운의 방향: [길한 방향]
행운의 색상: [오늘의 행운색]
행운의 숫자: [1-45 사이 숫자 2개]`;
    }

    if (includeDetailed) {
      prompt += `

주의사항: [오늘 특별히 주의해야 할 사항 2문장]
추천 활동: [오늘 하면 좋은 활동 2-3가지]`;
    }

    prompt += `

사주의 오행 균형과 ${new Date().getFullYear()}년 을사년(뱀의 해) 에너지를 고려하여 분석해주세요.`;

    return prompt;
  }

  /**
   * AI 응답 파싱
   */
  parseFortuneResponse(text) {
    const lines = text.split('\n').filter((line) => line.trim());
    const result = {
      scores: {},
      descriptions: {},
      luck: {},
      advice: {},
      overall: null,
    };

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.includes('종합운:')) {
        const match = trimmed.match(/종합운:\s*\[?(\d+)점?\]?\s*(.+)/);
        if (match) {
          result.scores.overall = parseInt(match[1]);
          result.descriptions.overall = match[2].trim();
          result.overall = result.scores.overall;
        }
      } else if (trimmed.includes('애정운:')) {
        const match = trimmed.match(/애정운:\s*\[?(\d+)점?\]?\s*(.+)/);
        if (match) {
          result.scores.love = parseInt(match[1]);
          result.descriptions.love = match[2].trim();
        }
      } else if (trimmed.includes('금전운:')) {
        const match = trimmed.match(/금전운:\s*\[?(\d+)점?\]?\s*(.+)/);
        if (match) {
          result.scores.money = parseInt(match[1]);
          result.descriptions.money = match[2].trim();
        }
      } else if (trimmed.includes('건강운:')) {
        const match = trimmed.match(/건강운:\s*\[?(\d+)점?\]?\s*(.+)/);
        if (match) {
          result.scores.health = parseInt(match[1]);
          result.descriptions.health = match[2].trim();
        }
      } else if (trimmed.includes('직장운:')) {
        const match = trimmed.match(/직장운:\s*\[?(\d+)점?\]?\s*(.+)/);
        if (match) {
          result.scores.work = parseInt(match[1]);
          result.descriptions.work = match[2].trim();
        }
      } else if (trimmed.includes('오늘의 조언:')) {
        result.advice.daily = trimmed.replace(/오늘의 조언:\s*/, '').trim();
      } else if (trimmed.includes('행운의 시간:')) {
        result.luck.time = trimmed.replace(/행운의 시간:\s*/, '').trim();
      } else if (trimmed.includes('행운의 방향:')) {
        result.luck.direction = trimmed.replace(/행운의 방향:\s*/, '').trim();
      } else if (trimmed.includes('행운의 색상:')) {
        result.luck.color = trimmed.replace(/행운의 색상:\s*/, '').trim();
      } else if (trimmed.includes('행운의 숫자:')) {
        const numbers = trimmed.replace(/행운의 숫자:\s*/, '').trim();
        result.luck.numbers = numbers
          .split(/[,\s]+/)
          .map((n) => parseInt(n))
          .filter((n) => !isNaN(n));
      } else if (trimmed.includes('주의사항:')) {
        result.advice.caution = trimmed.replace(/주의사항:\s*/, '').trim();
      } else if (trimmed.includes('추천 활동:')) {
        result.advice.recommended = trimmed.replace(/추천 활동:\s*/, '').trim();
      }
    }

    // 평균 점수 계산
    const scores = Object.values(result.scores).filter((s) => typeof s === 'number');
    if (scores.length > 0) {
      result.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    return result;
  }

  /**
   * 사용자 데이터 해시 생성 (캐시 키용)
   */
  getUserHash(userData) {
    const { name, birthDate, gender, birthTime } = userData;
    const str = `${name}_${birthDate}_${gender}_${birthTime || ''}`;

    // 간단한 해시 생성
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 로깅용 사용자 데이터 정제
   */
  sanitizeUserData(userData) {
    return {
      name: userData.name?.substring(0, 1) + '*',
      birthDate: userData.birthDate,
      gender: userData.gender,
      hasTime: !!userData.birthTime,
      hasManseryeok: !!userData.manseryeok,
    };
  }

  /**
   * 운세 등급 계산
   */
  getFortuneGrade(score) {
    if (score >= 90) return { grade: 'S', description: '최상' };
    if (score >= 80) return { grade: 'A', description: '상' };
    if (score >= 70) return { grade: 'B', description: '중상' };
    if (score >= 60) return { grade: 'C', description: '중' };
    if (score >= 50) return { grade: 'D', description: '중하' };
    return { grade: 'F', description: '하' };
  }

  /**
   * 운세 요약 생성
   */
  generateFortuneSummary(fortuneData) {
    const { scores, averageScore } = fortuneData;
    const grade = this.getFortuneGrade(averageScore);

    // 가장 높은/낮은 운세 찾기
    const sortedScores = Object.entries(scores)
      .filter(([key, value]) => typeof value === 'number')
      .sort(([, a], [, b]) => b - a);

    const best = sortedScores[0];
    const worst = sortedScores[sortedScores.length - 1];

    const categoryNames = {
      overall: '종합운',
      love: '애정운',
      money: '금전운',
      health: '건강운',
      work: '직장운',
    };

    return {
      grade: grade.grade,
      gradeDescription: grade.description,
      averageScore,
      bestCategory: {
        name: categoryNames[best[0]],
        score: best[1],
      },
      worstCategory: {
        name: categoryNames[worst[0]],
        score: worst[1],
      },
      summary: `오늘의 운세는 ${grade.description} 등급입니다. ${categoryNames[best[0]]}이 ${best[1]}점으로 가장 좋고, ${categoryNames[worst[0]]}은 ${worst[1]}점으로 주의가 필요합니다.`,
    };
  }

  /**
   * 서비스 상태 확인
   */
  async healthCheck() {
    return {
      service: 'daily-fortune',
      status: genAI ? 'healthy' : 'error',
      model: this.model ? 'gemini-1.5-flash' : null,
      timestamp: new Date().toISOString(),
    };
  }
}

// 싱글톤 인스턴스 생성
const dailyFortuneService = new DailyFortuneService();

export default dailyFortuneService;
