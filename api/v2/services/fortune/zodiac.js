/**
 * @fileoverview 서양 별자리 운세 서비스 - 12별자리 기반 점성술
 * @version 2.0.0
 * @author doha.kr Backend Team
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createLogger } from '../../core/logger.js';
import { cache, keyBuilder } from '../../core/cache.js';

const logger = createLogger('zodiac-fortune');

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
 * 별자리 운세 서비스
 */
export class ZodiacFortuneService {
  constructor() {
    this.model = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.initializeZodiacData();
  }

  /**
   * 별자리 데이터 초기화
   */
  initializeZodiacData() {
    this.zodiacInfo = {
      aries: {
        name: '양자리',
        nameEn: 'Aries',
        symbol: '♈',
        element: '불',
        quality: '활동궁',
        rulingPlanet: '화성',
        dates: '3.21 - 4.19',
        traits: ['적극적', '열정적', '리더십', '충동적', '용감한'],
        luckyNumbers: [1, 8, 17],
        luckyColors: ['빨강', '주황'],
        compatibility: ['사자자리', '사수자리', '쌍둥이자리']
      },
      taurus: {
        name: '황소자리',
        nameEn: 'Taurus',
        symbol: '♉',
        element: '흙',
        quality: '고정궁',
        rulingPlanet: '금성',
        dates: '4.20 - 5.20',
        traits: ['안정적', '실용적', '끈기있는', '고집스러운', '감각적'],
        luckyNumbers: [2, 6, 9, 12, 24],
        luckyColors: ['초록', '분홍'],
        compatibility: ['처녀자리', '염소자리', '게자리']
      },
      gemini: {
        name: '쌍둥이자리',
        nameEn: 'Gemini',
        symbol: '♊',
        element: '바람',
        quality: '변동궁',
        rulingPlanet: '수성',
        dates: '5.21 - 6.21',
        traits: ['호기심많은', '적응력있는', '소통능력', '다재다능', '변덕스러운'],
        luckyNumbers: [5, 7, 14, 23],
        luckyColors: ['노랑', '연두'],
        compatibility: ['천칭자리', '물병자리', '양자리']
      },
      cancer: {
        name: '게자리',
        nameEn: 'Cancer',
        symbol: '♋',
        element: '물',
        quality: '활동궁',
        rulingPlanet: '달',
        dates: '6.22 - 7.22',
        traits: ['감정적', '배려심', '가족중심', '직관적', '보호본능'],
        luckyNumbers: [2, 7, 11, 16, 20, 25],
        luckyColors: ['은색', '흰색', '바다색'],
        compatibility: ['전갈자리', '물고기자리', '황소자리']
      },
      leo: {
        name: '사자자리',
        nameEn: 'Leo',
        symbol: '♌',
        element: '불',
        quality: '고정궁',
        rulingPlanet: '태양',
        dates: '7.23 - 8.22',
        traits: ['자신감', '관대함', '창조적', '드라마틱', '자존심'],
        luckyNumbers: [1, 3, 10, 19],
        luckyColors: ['금색', '주황', '빨강'],
        compatibility: ['양자리', '사수자리', '쌍둥이자리']
      },
      virgo: {
        name: '처녀자리',
        nameEn: 'Virgo',
        symbol: '♍',
        element: '흙',
        quality: '변동궁',
        rulingPlanet: '수성',
        dates: '8.23 - 9.22',
        traits: ['완벽주의', '분석적', '실용적', '신중한', '봉사정신'],
        luckyNumbers: [3, 15, 6, 27],
        luckyColors: ['네이비', '갈색', '회색'],
        compatibility: ['황소자리', '염소자리', '게자리']
      },
      libra: {
        name: '천칭자리',
        nameEn: 'Libra',
        symbol: '♎',
        element: '바람',
        quality: '활동궁',
        rulingPlanet: '금성',
        dates: '9.23 - 10.22',
        traits: ['균형감각', '공정함', '사교적', '우유부단', '예술적'],
        luckyNumbers: [4, 6, 13, 15, 24],
        luckyColors: ['파스텔톤', '분홍', '하늘색'],
        compatibility: ['쌍둥이자리', '물병자리', '사자자리']
      },
      scorpio: {
        name: '전갈자리',
        nameEn: 'Scorpio',
        symbol: '♏',
        element: '물',
        quality: '고정궁',
        rulingPlanet: '명왕성',
        dates: '10.23 - 11.21',
        traits: ['강렬함', '신비로운', '집중력', '질투심', '변화력'],
        luckyNumbers: [8, 11, 18, 22],
        luckyColors: ['짙은빨강', '검정', '자주'],
        compatibility: ['게자리', '물고기자리', '처녀자리']
      },
      sagittarius: {
        name: '사수자리',
        nameEn: 'Sagittarius',
        symbol: '♐',
        element: '불',
        quality: '변동궁',
        rulingPlanet: '목성',
        dates: '11.22 - 12.21',
        traits: ['자유로운', '낙천적', '모험적', '솔직한', '철학적'],
        luckyNumbers: [3, 9, 15, 21, 33],
        luckyColors: ['보라', '터키석', '진청'],
        compatibility: ['양자리', '사자자리', '천칭자리']
      },
      capricorn: {
        name: '염소자리',
        nameEn: 'Capricorn',
        symbol: '♑',
        element: '흙',
        quality: '활동궁',
        rulingPlanet: '토성',
        dates: '12.22 - 1.19',
        traits: ['야심적', '책임감', '현실적', '인내심', '보수적'],
        luckyNumbers: [6, 9, 8, 26],
        luckyColors: ['검정', '갈색', '회색'],
        compatibility: ['황소자리', '처녀자리', '전갈자리']
      },
      aquarius: {
        name: '물병자리',
        nameEn: 'Aquarius',
        symbol: '♒',
        element: '바람',
        quality: '고정궁',
        rulingPlanet: '천왕성',
        dates: '1.20 - 2.18',
        traits: ['독창적', '진보적', '인도주의', '독립적', '예측불가'],
        luckyNumbers: [4, 7, 11, 22, 29],
        luckyColors: ['전기색', '터키석', '은색'],
        compatibility: ['쌍둥이자리', '천칭자리', '사수자리']
      },
      pisces: {
        name: '물고기자리',
        nameEn: 'Pisces',
        symbol: '♓',
        element: '물',
        quality: '변동궁',
        rulingPlanet: '해왕성',
        dates: '2.19 - 3.20',
        traits: ['감성적', '직관적', '예술적', '공감능력', '몽상적'],
        luckyNumbers: [3, 9, 12, 15, 18, 24],
        luckyColors: ['바다색', '라벤더', '은색'],
        compatibility: ['게자리', '전갈자리', '염소자리']
      }
    };

    // 행성의 운행과 영향
    this.planetaryInfluences = {
      mercury: { name: '수성', influence: '소통, 학습, 여행' },
      venus: { name: '금성', influence: '사랑, 관계, 예술, 돈' },
      mars: { name: '화성', influence: '에너지, 행동, 갈등' },
      jupiter: { name: '목성', influence: '확장, 행운, 성장' },
      saturn: { name: '토성', influence: '제한, 책임, 교훈' }
    };
  }

  /**
   * 별자리 일일 운세 생성
   */
  async generateZodiacFortune(zodiacSign, options = {}) {
    const {
      includeWeekly = false,
      includeMonthly = false,
      includeCompatibility = true,
      todayDate = null
    } = options;

    if (!this.model) {
      throw new Error('Gemini API가 설정되지 않았습니다.');
    }

    const zodiacData = this.zodiacInfo[zodiacSign];
    if (!zodiacData) {
      throw new Error('유효하지 않은 별자리입니다.');
    }

    const today = todayDate || new Date().toISOString().split('T')[0];
    
    // 캐시 키 생성
    const cacheKey = keyBuilder.build('zodiac-fortune', zodiacSign, today);

    // 캐시에서 확인
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info('Zodiac fortune cache hit', { zodiac: zodiacSign, date: today });
      return cached;
    }

    try {
      const prompt = this.buildZodiacPrompt(zodiacData, today, includeWeekly, includeMonthly, includeCompatibility);
      
      logger.info('Generating zodiac fortune', {
        zodiac: zodiacSign,
        date: today,
        promptLength: prompt.length
      });

      const startTime = performance.now();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const duration = performance.now() - startTime;

      logger.info('Zodiac fortune generated', {
        zodiac: zodiacSign,
        responseLength: text.length,
        duration: Math.round(duration)
      });

      // 응답 파싱
      const parsedFortune = this.parseZodiacResponse(text);
      
      const fortuneData = {
        ...parsedFortune,
        zodiac: {
          sign: zodiacSign,
          name: zodiacData.name,
          symbol: zodiacData.symbol,
          element: zodiacData.element,
          rulingPlanet: zodiacData.rulingPlanet
        },
        date: today,
        generatedAt: new Date().toISOString(),
        aiGenerated: true
      };

      // 캐시에 저장 (하루 동안)
      await cache.set(cacheKey, fortuneData, 24 * 60 * 60 * 1000);

      return fortuneData;

    } catch (error) {
      logger.error('Zodiac fortune generation failed', {
        error: error.message,
        zodiac: zodiacSign,
        date: today
      });
      throw error;
    }
  }

  /**
   * 별자리 궁합 분석
   */
  async analyzeCompatibility(sign1, sign2) {
    const zodiac1 = this.zodiacInfo[sign1];
    const zodiac2 = this.zodiacInfo[sign2];
    
    if (!zodiac1 || !zodiac2) {
      throw new Error('유효하지 않은 별자리입니다.');
    }

    // 캐시 키 생성 (순서 정규화)
    const sortedSigns = [sign1, sign2].sort();
    const cacheKey = keyBuilder.build('zodiac-compatibility', ...sortedSigns);

    // 캐시에서 확인
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info('Zodiac compatibility cache hit', { signs: sortedSigns });
      return cached;
    }

    try {
      const compatibility = this.calculateCompatibility(zodiac1, zodiac2);
      const prompt = this.buildCompatibilityPrompt(zodiac1, zodiac2, compatibility);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const compatibilityAnalysis = {
        signs: {
          sign1: { sign: sign1, name: zodiac1.name },
          sign2: { sign: sign2, name: zodiac2.name }
        },
        score: compatibility.score,
        level: compatibility.level,
        analysis: text.trim(),
        strengths: compatibility.strengths,
        challenges: compatibility.challenges,
        generatedAt: new Date().toISOString()
      };

      // 캐시에 저장 (궁합은 변하지 않으므로 긴 캐시)
      await cache.set(cacheKey, compatibilityAnalysis, 7 * 24 * 60 * 60 * 1000);

      return compatibilityAnalysis;

    } catch (error) {
      logger.error('Compatibility analysis failed', {
        error: error.message,
        signs: [sign1, sign2]
      });
      throw error;
    }
  }

  /**
   * 별자리 운세 프롬프트 구성
   */
  buildZodiacPrompt(zodiacData, date, includeWeekly, includeMonthly, includeCompatibility) {
    let prompt = `당신은 전문 점성술사입니다. ${date} ${zodiacData.name}(${zodiacData.nameEn})의 운세를 상세히 분석해주세요.

별자리 정보:
- 원소: ${zodiacData.element}
- 지배행성: ${zodiacData.rulingPlanet}
- 성격 특징: ${zodiacData.traits.join(', ')}

다음 형식으로 해석해주세요:

종합운: [오늘의 전체적인 운세를 3-4문장으로 상세히]
애정운: [0-100점] [연애운과 인간관계 2-3문장]
금전운: [0-100점] [재물운과 투자운 2-3문장]
직장운: [0-100점] [업무운과 성과 2-3문장]
건강운: [0-100점] [건강 상태와 주의사항 2-3문장]

오늘의 조언: [구체적인 행동 지침 2-3문장]
행운의 숫자: [1-45 사이 숫자 2개]
행운의 색상: [색상명]
행운의 시간: [가장 좋은 시간대]`;

    if (includeCompatibility) {
      prompt += `
궁합이 좋은 별자리: [오늘 특히 좋은 관계를 가질 별자리]`;
    }

    if (includeWeekly) {
      prompt += `
이번 주 전망: [주간 운세 요약 2-3문장]`;
    }

    if (includeMonthly) {
      prompt += `
이번 달 전망: [월간 운세 요약 2-3문장]`;
    }

    prompt += `

${new Date().getFullYear()}년 을사년(뱀의 해)과 ${zodiacData.element} 원소의 에너지를 고려하여 분석해주세요.`;

    return prompt;
  }

  /**
   * 궁합 분석 프롬프트 구성
   */
  buildCompatibilityPrompt(zodiac1, zodiac2, compatibility) {
    return `${zodiac1.name}과 ${zodiac2.name}의 궁합을 분석해주세요.

${zodiac1.name}: ${zodiac1.element} 원소, ${zodiac1.rulingPlanet} 지배
${zodiac2.name}: ${zodiac2.element} 원소, ${zodiac2.rulingPlanet} 지배

궁합 점수: ${compatibility.score}/100점 (${compatibility.level})

다음 내용을 포함하여 3-4문장으로 분석해주세요:
1. 두 별자리의 기본적인 궁합
2. 연애 관계에서의 특징
3. 친구나 동료 관계에서의 특징
4. 주의해야 할 점과 조화 방법`;
  }

  /**
   * 별자리 응답 파싱
   */
  parseZodiacResponse(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const result = {
      overall: '',
      scores: {},
      descriptions: {},
      advice: '',
      lucky: {}
    };

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.includes('종합운:')) {
        result.overall = trimmed.replace(/종합운:\s*/, '').trim();
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
      } else if (trimmed.includes('직장운:')) {
        const match = trimmed.match(/직장운:\s*\[?(\d+)점?\]?\s*(.+)/);
        if (match) {
          result.scores.work = parseInt(match[1]);
          result.descriptions.work = match[2].trim();
        }
      } else if (trimmed.includes('건강운:')) {
        const match = trimmed.match(/건강운:\s*\[?(\d+)점?\]?\s*(.+)/);
        if (match) {
          result.scores.health = parseInt(match[1]);
          result.descriptions.health = match[2].trim();
        }
      } else if (trimmed.includes('오늘의 조언:')) {
        result.advice = trimmed.replace(/오늘의 조언:\s*/, '').trim();
      } else if (trimmed.includes('행운의 숫자:')) {
        const numbers = trimmed.replace(/행운의 숫자:\s*/, '').trim();
        result.lucky.numbers = numbers.split(/[,\s]+/).map(n => parseInt(n)).filter(n => !isNaN(n));
      } else if (trimmed.includes('행운의 색상:')) {
        result.lucky.color = trimmed.replace(/행운의 색상:\s*/, '').trim();
      } else if (trimmed.includes('행운의 시간:')) {
        result.lucky.time = trimmed.replace(/행운의 시간:\s*/, '').trim();
      } else if (trimmed.includes('궁합이 좋은 별자리:')) {
        result.lucky.compatibleSign = trimmed.replace(/궁합이 좋은 별자리:\s*/, '').trim();
      } else if (trimmed.includes('이번 주 전망:')) {
        result.weekly = trimmed.replace(/이번 주 전망:\s*/, '').trim();
      } else if (trimmed.includes('이번 달 전망:')) {
        result.monthly = trimmed.replace(/이번 달 전망:\s*/, '').trim();
      }
    }

    // 평균 점수 계산
    const scores = Object.values(result.scores).filter(s => typeof s === 'number');
    if (scores.length > 0) {
      result.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    return result;
  }

  /**
   * 궁합 점수 계산
   */
  calculateCompatibility(zodiac1, zodiac2) {
    let score = 50; // 기본 점수
    
    // 원소 궁합
    const elementCompatibility = this.getElementCompatibility(zodiac1.element, zodiac2.element);
    score += elementCompatibility;

    // 성질 궁합 (활동궁, 고정궁, 변동궁)
    const qualityCompatibility = this.getQualityCompatibility(zodiac1.quality, zodiac2.quality);
    score += qualityCompatibility;

    // 특별 궁합 (미리 정의된 궁합)
    if (zodiac1.compatibility.includes(zodiac2.name) || zodiac2.compatibility.includes(zodiac1.name)) {
      score += 20;
    }

    // 점수 범위 조정
    score = Math.max(0, Math.min(100, score));

    let level;
    if (score >= 80) level = '매우 좋음';
    else if (score >= 70) level = '좋음';
    else if (score >= 60) level = '보통';
    else if (score >= 40) level = '주의 필요';
    else level = '어려움';

    return {
      score,
      level,
      strengths: this.getCompatibilityStrengths(zodiac1, zodiac2),
      challenges: this.getCompatibilityChallenges(zodiac1, zodiac2)
    };
  }

  /**
   * 원소 궁합 계산
   */
  getElementCompatibility(element1, element2) {
    const compatibility = {
      '불': { '불': 15, '흙': 5, '바람': 10, '물': -10 },
      '흙': { '불': 5, '흙': 10, '바람': -5, '물': 0 },
      '바람': { '불': 10, '흙': -5, '바람': 15, '물': 5 },
      '물': { '불': -10, '흙': 0, '바람': 5, '물': 10 }
    };
    
    return compatibility[element1]?.[element2] || 0;
  }

  /**
   * 성질 궁합 계산
   */
  getQualityCompatibility(quality1, quality2) {
    if (quality1 === quality2) return 10;
    if ((quality1 === '활동궁' && quality2 === '변동궁') || 
        (quality1 === '변동궁' && quality2 === '활동궁')) return 5;
    return 0;
  }

  /**
   * 궁합의 장점 분석
   */
  getCompatibilityStrengths(zodiac1, zodiac2) {
    // 간단한 예시 - 실제로는 더 복잡한 로직 필요
    return ['서로 다른 매력', '상호 보완', '성장 동기'];
  }

  /**
   * 궁합의 주의점 분석
   */
  getCompatibilityChallenges(zodiac1, zodiac2) {
    // 간단한 예시 - 실제로는 더 복잡한 로직 필요
    return ['소통 방식 차이', '가치관 차이', '속도 차이'];
  }

  /**
   * 서비스 상태 확인
   */
  async healthCheck() {
    return {
      service: 'zodiac-fortune',
      status: genAI ? 'healthy' : 'error',
      model: this.model ? 'gemini-1.5-flash' : null,
      supportedSigns: Object.keys(this.zodiacInfo),
      timestamp: new Date().toISOString()
    };
  }
}

// 싱글톤 인스턴스 생성
const zodiacFortuneService = new ZodiacFortuneService();

export default zodiacFortuneService;