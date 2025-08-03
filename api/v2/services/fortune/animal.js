/**
 * @fileoverview 동양 12띠 운세 서비스 - 한국 전통 띠별 운세
 * @version 2.0.0
 * @author doha.kr Backend Team
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createLogger } from '../../core/logger.js';
import { cache, keyBuilder } from '../../core/cache.js';

const logger = createLogger('animal-fortune');

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
 * 12띠 운세 서비스
 */
export class AnimalFortuneService {
  constructor() {
    this.model = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.initializeAnimalData();
  }

  /**
   * 12띠 데이터 초기화
   */
  initializeAnimalData() {
    this.animalInfo = {
      rat: {
        name: '쥐',
        hanja: '子',
        nameEn: 'Rat',
        years: [1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020, 2032],
        element: '물',
        direction: '북',
        time: '23:00-01:00',
        season: '겨울',
        traits: ['영리함', '적응력', '근면함', '사교성', '기회주의'],
        lucky: {
          numbers: [2, 3],
          colors: ['파랑', '금색', '초록'],
          directions: ['동남', '동북'],
        },
        compatibility: {
          best: ['dragon', 'monkey', 'ox'],
          worst: ['horse', 'goat', 'rooster'],
        },
        career: ['비즈니스', '금융', '연구', '예술'],
        personality:
          '똑똑하고 재치있으며 적응력이 뛰어남. 기회를 잘 포착하고 사교적이지만 때로는 이기적일 수 있음.',
      },
      ox: {
        name: '소',
        hanja: '丑',
        nameEn: 'Ox',
        years: [1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021, 2033],
        element: '흙',
        direction: '동북',
        time: '01:00-03:00',
        season: '겨울',
        traits: ['성실함', '인내심', '신뢰성', '보수적', '고집'],
        lucky: {
          numbers: [1, 9],
          colors: ['빨강', '파랑', '보라'],
          directions: ['북', '남'],
        },
        compatibility: {
          best: ['rat', 'snake', 'rooster'],
          worst: ['tiger', 'dragon', 'goat', 'dog'],
        },
        career: ['농업', '부동산', '교육', '의료'],
        personality:
          '근면하고 신뢰할 수 있으며 끈기가 있음. 전통을 중시하고 안정을 추구하지만 변화에 둔감할 수 있음.',
      },
      tiger: {
        name: '호랑이',
        hanja: '寅',
        nameEn: 'Tiger',
        years: [1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022, 2034],
        element: '목',
        direction: '동남',
        time: '03:00-05:00',
        season: '봄',
        traits: ['용맹함', '리더십', '정의감', '충동적', '자신감'],
        lucky: {
          numbers: [1, 3, 4],
          colors: ['파랑', '회색', '주황'],
          directions: ['동', '남'],
        },
        compatibility: {
          best: ['horse', 'dog', 'pig'],
          worst: ['ox', 'tiger', 'snake', 'monkey'],
        },
        career: ['경영', '정치', '군사', '스포츠'],
        personality:
          '용감하고 카리스마가 있으며 정의감이 강함. 리더십이 뛰어나지만 때로는 성급하고 고집스러울 수 있음.',
      },
      rabbit: {
        name: '토끼',
        hanja: '卯',
        nameEn: 'Rabbit',
        years: [1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023, 2035],
        element: '목',
        direction: '동',
        time: '05:00-07:00',
        season: '봄',
        traits: ['온화함', '세심함', '예술성', '소심함', '평화주의'],
        lucky: {
          numbers: [3, 4, 6],
          colors: ['빨강', '분홍', '보라', '파랑'],
          directions: ['동', '남동', '남'],
        },
        compatibility: {
          best: ['goat', 'pig', 'dog'],
          worst: ['rat', 'ox', 'dragon', 'rooster'],
        },
        career: ['예술', '디자인', '상담', '교육'],
        personality:
          '온순하고 배려심이 깊으며 예술적 감각이 뛰어남. 평화를 사랑하지만 때로는 우유부단하고 소극적일 수 있음.',
      },
      dragon: {
        name: '용',
        hanja: '辰',
        nameEn: 'Dragon',
        years: [1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024, 2036],
        element: '흙',
        direction: '동남',
        time: '07:00-09:00',
        season: '봄',
        traits: ['카리스마', '야심', '창조력', '자존심', '완벽주의'],
        lucky: {
          numbers: [1, 6, 7],
          colors: ['금색', '은색', '회색'],
          directions: ['동', '남', '서'],
        },
        compatibility: {
          best: ['rat', 'monkey', 'rooster'],
          worst: ['ox', 'rabbit', 'dog', 'dragon'],
        },
        career: ['경영', '연예', '정치', 'IT'],
        personality:
          '카리스마가 넘치고 야심만만하며 창조적임. 리더 기질이 있지만 때로는 거만하고 독선적일 수 있음.',
      },
      snake: {
        name: '뱀',
        hanja: '巳',
        nameEn: 'Snake',
        years: [1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025, 2037],
        element: '화',
        direction: '남남동',
        time: '09:00-11:00',
        season: '여름',
        traits: ['지혜', '직관력', '신비로움', '질투심', '집착'],
        lucky: {
          numbers: [2, 8, 9],
          colors: ['빨강', '연노랑', '검정'],
          directions: ['동북', '남서', '남'],
        },
        compatibility: {
          best: ['ox', 'rooster', 'dragon'],
          worst: ['tiger', 'monkey', 'pig'],
        },
        career: ['학술', '의학', '심리학', '금융'],
        personality:
          '지혜롭고 직관력이 뛰어나며 신비로운 매력이 있음. 깊이 있는 사고를 하지만 때로는 의심이 많고 질투심이 강할 수 있음.',
      },
      horse: {
        name: '말',
        hanja: '午',
        nameEn: 'Horse',
        years: [1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026, 2038],
        element: '화',
        direction: '남',
        time: '11:00-13:00',
        season: '여름',
        traits: ['활발함', '자유로움', '열정적', '변덕스러움', '모험심'],
        lucky: {
          numbers: [2, 3, 7],
          colors: ['노랑', '초록'],
          directions: ['남서', '서북'],
        },
        compatibility: {
          best: ['tiger', 'goat', 'dog'],
          worst: ['rat', 'ox', 'rabbit', 'horse'],
        },
        career: ['여행', '스포츠', '언론', '영업'],
        personality:
          '활발하고 자유분방하며 열정적임. 모험을 좋아하고 독립적이지만 때로는 변덕스럽고 조급할 수 있음.',
      },
      goat: {
        name: '양',
        hanja: '未',
        nameEn: 'Goat',
        years: [1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027, 2039],
        element: '흙',
        direction: '남서',
        time: '13:00-15:00',
        season: '여름',
        traits: ['온순함', '창조성', '감성적', '의존적', '비관적'],
        lucky: {
          numbers: [3, 4, 5],
          colors: ['초록', '빨강', '보라'],
          directions: ['북', '서북'],
        },
        compatibility: {
          best: ['rabbit', 'horse', 'pig'],
          worst: ['ox', 'tiger', 'dog'],
        },
        career: ['예술', '디자인', '복지', '종교'],
        personality:
          '온순하고 창조적이며 감성이 풍부함. 협조적이고 친화력이 있지만 때로는 의존적이고 우유부단할 수 있음.',
      },
      monkey: {
        name: '원숭이',
        hanja: '申',
        nameEn: 'Monkey',
        years: [1944, 1956, 1968, 1980, 1992, 2004, 2016, 2028, 2040],
        element: '금',
        direction: '서남',
        time: '15:00-17:00',
        season: '가을',
        traits: ['영민함', '유머감각', '호기심', '교활함', '변덕'],
        lucky: {
          numbers: [1, 7, 8],
          colors: ['흰색', '금색', '파랑'],
          directions: ['북', '서북', '서'],
        },
        compatibility: {
          best: ['rat', 'dragon', 'snake'],
          worst: ['tiger', 'snake', 'pig'],
        },
        career: ['IT', '연예', '교육', '연구'],
        personality:
          '영리하고 재치있으며 호기심이 많음. 적응력이 뛰어나고 유머러스하지만 때로는 교활하고 일관성이 부족할 수 있음.',
      },
      rooster: {
        name: '닭',
        hanja: '酉',
        nameEn: 'Rooster',
        years: [1945, 1957, 1969, 1981, 1993, 2005, 2017, 2029, 2041],
        element: '금',
        direction: '서',
        time: '17:00-19:00',
        season: '가을',
        traits: ['정직함', '근면함', '완벽주의', '비판적', '자존심'],
        lucky: {
          numbers: [5, 7, 8],
          colors: ['금색', '갈색', '노랑'],
          directions: ['서', '남서', '동북'],
        },
        compatibility: {
          best: ['ox', 'dragon', 'snake'],
          worst: ['rat', 'rabbit', 'horse', 'rooster'],
        },
        career: ['회계', '법률', '행정', '언론'],
        personality:
          '정직하고 근면하며 완벽주의적임. 시간 관념이 뚜렷하고 책임감이 강하지만 때로는 비판적이고 까다로울 수 있음.',
      },
      dog: {
        name: '개',
        hanja: '戌',
        nameEn: 'Dog',
        years: [1946, 1958, 1970, 1982, 1994, 2006, 2018, 2030, 2042],
        element: '흙',
        direction: '서북',
        time: '19:00-21:00',
        season: '가을',
        traits: ['충성심', '정의감', '책임감', '비관적', '걱정많음'],
        lucky: {
          numbers: [3, 4, 9],
          colors: ['빨강', '초록', '보라'],
          directions: ['동', '남', '서북'],
        },
        compatibility: {
          best: ['tiger', 'rabbit', 'horse'],
          worst: ['ox', 'dragon', 'goat', 'rooster'],
        },
        career: ['공무원', '사회복지', '보안', '법률'],
        personality:
          '충성스럽고 정의감이 강하며 책임감이 있음. 신뢰할 수 있고 보호 본능이 있지만 때로는 비관적이고 걱정이 많을 수 있음.',
      },
      pig: {
        name: '돼지',
        hanja: '亥',
        nameEn: 'Pig',
        years: [1947, 1959, 1971, 1983, 1995, 2007, 2019, 2031, 2043],
        element: '물',
        direction: '북서',
        time: '21:00-23:00',
        season: '겨울',
        traits: ['관대함', '성실함', '낙천적', '욕심많음', '게으름'],
        lucky: {
          numbers: [2, 5, 8],
          colors: ['노랑', '회색', '갈색', '금색'],
          directions: ['남서', '동북'],
        },
        compatibility: {
          best: ['tiger', 'rabbit', 'goat'],
          worst: ['snake', 'monkey', 'pig'],
        },
        career: ['요식업', '유통', '금융', '복지'],
        personality:
          '관대하고 성실하며 낙천적임. 인정이 많고 포용력이 있지만 때로는 욕심이 많고 게으를 수 있음.',
      },
    };

    // 2025년 을사년(뱀의 해) 특별 운세 정보
    this.yearInfo2025 = {
      yearAnimal: 'snake',
      yearElement: '목',
      yearName: '을사년',
      characteristics: '지혜와 변화의 해, 내적 성장과 직관력 발달의 시기',
    };
  }

  /**
   * 12띠 일일 운세 생성
   */
  async generateAnimalFortune(animal, options = {}) {
    const {
      includeYearly = true,
      includeMonthly = false,
      includeCompatibility = true,
      todayDate = null,
    } = options;

    if (!this.model) {
      throw new Error('Gemini API가 설정되지 않았습니다.');
    }

    const animalData = this.animalInfo[animal];
    if (!animalData) {
      throw new Error('유효하지 않은 띠입니다.');
    }

    const today = todayDate || new Date().toISOString().split('T')[0];

    // 캐시 키 생성
    const cacheKey = keyBuilder.build('animal-fortune', animal, today);

    // 캐시에서 확인
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info('Animal fortune cache hit', { animal, date: today });
      return cached;
    }

    try {
      const prompt = this.buildAnimalPrompt(
        animalData,
        today,
        includeYearly,
        includeMonthly,
        includeCompatibility
      );

      logger.info('Generating animal fortune', {
        animal,
        date: today,
        promptLength: prompt.length,
      });

      const startTime = performance.now();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const duration = performance.now() - startTime;

      logger.info('Animal fortune generated', {
        animal,
        responseLength: text.length,
        duration: Math.round(duration),
      });

      // 응답 파싱
      const parsedFortune = this.parseAnimalResponse(text);

      const fortuneData = {
        ...parsedFortune,
        animal: {
          sign: animal,
          name: animalData.name,
          hanja: animalData.hanja,
          element: animalData.element,
          direction: animalData.direction,
          personality: animalData.personality,
        },
        date: today,
        year2025Influence: this.calculateYearInfluence(animal),
        generatedAt: new Date().toISOString(),
        aiGenerated: true,
      };

      // 캐시에 저장 (하루 동안)
      await cache.set(cacheKey, fortuneData, 24 * 60 * 60 * 1000);

      return fortuneData;
    } catch (error) {
      logger.error('Animal fortune generation failed', {
        error: error.message,
        animal,
        date: today,
      });
      throw error;
    }
  }

  /**
   * 12띠 궁합 분석
   */
  async analyzeAnimalCompatibility(animal1, animal2) {
    const animalData1 = this.animalInfo[animal1];
    const animalData2 = this.animalInfo[animal2];

    if (!animalData1 || !animalData2) {
      throw new Error('유효하지 않은 띠입니다.');
    }

    // 캐시 키 생성 (순서 정규화)
    const sortedAnimals = [animal1, animal2].sort();
    const cacheKey = keyBuilder.build('animal-compatibility', ...sortedAnimals);

    // 캐시에서 확인
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info('Animal compatibility cache hit', { animals: sortedAnimals });
      return cached;
    }

    try {
      const compatibility = this.calculateAnimalCompatibility(animalData1, animalData2);
      const prompt = this.buildAnimalCompatibilityPrompt(animalData1, animalData2, compatibility);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const compatibilityAnalysis = {
        animals: {
          animal1: { sign: animal1, name: animalData1.name, hanja: animalData1.hanja },
          animal2: { sign: animal2, name: animalData2.name, hanja: animalData2.hanja },
        },
        score: compatibility.score,
        level: compatibility.level,
        type: compatibility.type,
        analysis: text.trim(),
        strengths: compatibility.strengths,
        challenges: compatibility.challenges,
        generatedAt: new Date().toISOString(),
      };

      // 캐시에 저장 (궁합은 변하지 않으므로 긴 캐시)
      await cache.set(cacheKey, compatibilityAnalysis, 7 * 24 * 60 * 60 * 1000);

      return compatibilityAnalysis;
    } catch (error) {
      logger.error('Animal compatibility analysis failed', {
        error: error.message,
        animals: [animal1, animal2],
      });
      throw error;
    }
  }

  /**
   * 12띠 운세 프롬프트 구성
   */
  buildAnimalPrompt(animalData, date, includeYearly, includeMonthly, includeCompatibility) {
    let prompt = `당신은 전문 동양 점술가입니다. ${date} ${animalData.name}(${animalData.hanja})띠의 운세를 상세히 분석해주세요.

띠 정보:
- 오행: ${animalData.element}
- 방위: ${animalData.direction}
- 성격 특징: ${animalData.traits.join(', ')}
- 대표 성격: ${animalData.personality}

다음 형식으로 해석해주세요:

종합운: [오늘의 전체적인 운세를 3-4문장으로 상세히]
애정운: [0-100점] [연애운과 인간관계 2-3문장]
금전운: [0-100점] [재물운과 투자운 2-3문장]
직장운: [0-100점] [업무운과 성과 2-3문장]
건강운: [0-100점] [건강 상태와 주의사항 2-3문장]

오늘의 조언: [구체적인 행동 지침 2-3문장]
행운의 숫자: [1-45 사이 숫자 2개]
행운의 색상: [색상명]
행운의 방향: [길한 방향]`;

    if (includeCompatibility) {
      prompt += `
궁합이 좋은 띠: [오늘 특히 좋은 관계를 가질 띠]`;
    }

    if (includeYearly) {
      prompt += `
2025년 을사년 운세: [뱀의 해가 ${animalData.name}띠에게 미치는 영향 3문장]`;
    }

    if (includeMonthly) {
      const currentMonth = new Date().getMonth() + 1;
      prompt += `
${currentMonth}월 전망: [이번 달 운세 요약 2-3문장]`;
    }

    prompt += `

${animalData.name}띠의 특성과 2025년 을사년(뱀의 해) 에너지를 고려하여 분석해주세요.`;

    return prompt;
  }

  /**
   * 12띠 궁합 프롬프트 구성
   */
  buildAnimalCompatibilityPrompt(animalData1, animalData2, compatibility) {
    return `${animalData1.name}(${animalData1.hanja})띠와 ${animalData2.name}(${animalData2.hanja})띠의 궁합을 분석해주세요.

${animalData1.name}띠: ${animalData1.element} 오행, ${animalData1.direction} 방위
${animalData2.name}띠: ${animalData2.element} 오행, ${animalData2.direction} 방위

궁합 유형: ${compatibility.type}
궁합 점수: ${compatibility.score}/100점 (${compatibility.level})

다음 내용을 포함하여 3-4문장으로 분석해주세요:
1. 두 띠의 기본적인 궁합과 특징
2. 연애 관계에서의 장단점
3. 결혼이나 사업 파트너로서의 적합성
4. 조화로운 관계를 위한 조언`;
  }

  /**
   * 12띠 응답 파싱
   */
  parseAnimalResponse(text) {
    const lines = text.split('\n').filter((line) => line.trim());
    const result = {
      overall: '',
      scores: {},
      descriptions: {},
      advice: '',
      lucky: {},
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
        result.lucky.numbers = numbers
          .split(/[,\s]+/)
          .map((n) => parseInt(n))
          .filter((n) => !isNaN(n));
      } else if (trimmed.includes('행운의 색상:')) {
        result.lucky.color = trimmed.replace(/행운의 색상:\s*/, '').trim();
      } else if (trimmed.includes('행운의 방향:')) {
        result.lucky.direction = trimmed.replace(/행운의 방향:\s*/, '').trim();
      } else if (trimmed.includes('궁합이 좋은 띠:')) {
        result.lucky.compatibleAnimal = trimmed.replace(/궁합이 좋은 띠:\s*/, '').trim();
      } else if (trimmed.includes('2025년 을사년 운세:')) {
        result.yearly2025 = trimmed.replace(/2025년 을사년 운세:\s*/, '').trim();
      } else if (trimmed.includes('월 전망:')) {
        result.monthly = trimmed.replace(/\d+월 전망:\s*/, '').trim();
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
   * 12띠 궁합 점수 계산
   */
  calculateAnimalCompatibility(animalData1, animalData2) {
    let score = 50; // 기본 점수
    let type = '보통';

    // 최고 궁합 확인
    if (
      animalData1.compatibility.best.includes(animalData2.name.toLowerCase()) ||
      animalData2.compatibility.best.includes(animalData1.name.toLowerCase())
    ) {
      score += 30;
      type = '상생';
    }

    // 최악 궁합 확인
    if (
      animalData1.compatibility.worst.includes(animalData2.name.toLowerCase()) ||
      animalData2.compatibility.worst.includes(animalData1.name.toLowerCase())
    ) {
      score -= 25;
      type = '상극';
    }

    // 오행 궁합
    const elementCompatibility = this.getElementCompatibilityForAnimals(
      animalData1.element,
      animalData2.element
    );
    score += elementCompatibility;

    // 같은 띠인 경우
    if (animalData1.name === animalData2.name) {
      score -= 10;
      type = '동갑내기';
    }

    // 점수 범위 조정
    score = Math.max(0, Math.min(100, score));

    let level;
    if (score >= 85) level = '천생연분';
    else if (score >= 75) level = '매우 좋음';
    else if (score >= 65) level = '좋음';
    else if (score >= 55) level = '보통';
    else if (score >= 40) level = '주의 필요';
    else level = '어려움';

    return {
      score,
      level,
      type,
      strengths: this.getAnimalCompatibilityStrengths(animalData1, animalData2),
      challenges: this.getAnimalCompatibilityChallenges(animalData1, animalData2),
    };
  }

  /**
   * 12띠 오행 궁합 계산
   */
  getElementCompatibilityForAnimals(element1, element2) {
    // 오행 상생: 목→화→흙→금→물→목
    // 오행 상극: 목→흙, 화→금, 흙→물, 금→목, 물→화
    const compatibility = {
      목: { 목: 5, 화: 15, 흙: -10, 금: -5, 물: 10 },
      화: { 목: 10, 화: 5, 흙: 15, 금: -10, 물: -5 },
      흙: { 목: -5, 화: 10, 흙: 5, 금: 15, 물: -10 },
      금: { 목: -10, 화: -5, 흙: 10, 금: 5, 물: 15 },
      물: { 목: 15, 화: -10, 흙: -5, 금: 10, 물: 5 },
    };

    return compatibility[element1]?.[element2] || 0;
  }

  /**
   * 2025년 을사년 영향 계산
   */
  calculateYearInfluence(animal) {
    const animalData = this.animalInfo[animal];
    const yearAnimal = this.yearInfo2025.yearAnimal; // snake

    // 올해 동물인 경우
    if (animal === yearAnimal) {
      return {
        level: '본명년',
        influence: '높음',
        description: '본명년으로 변화와 도전의 해. 신중한 판단과 적극적인 자세가 필요.',
      };
    }

    // 궁합이 좋은 경우
    if (animalData.compatibility.best.includes(yearAnimal)) {
      return {
        level: '길년',
        influence: '좋음',
        description: '뱀띠와 좋은 궁합으로 성장과 발전의 기회가 많은 해.',
      };
    }

    // 궁합이 나쁜 경우
    if (animalData.compatibility.worst.includes(yearAnimal)) {
      return {
        level: '주의년',
        influence: '주의',
        description: '뱀띠와 상극으로 신중함과 인내심이 필요한 해.',
      };
    }

    return {
      level: '평년',
      influence: '보통',
      description: '안정적인 한 해. 꾸준한 노력으로 좋은 결과를 얻을 수 있음.',
    };
  }

  /**
   * 12띠 궁합의 장점 분석
   */
  getAnimalCompatibilityStrengths(animalData1, animalData2) {
    // 실제로는 더 복잡한 로직이 필요하지만 예시로 구현
    return [
      `${animalData1.name}띠의 ${animalData1.traits[0]}과 ${animalData2.name}띠의 ${animalData2.traits[0]}이 조화`,
      '상호 보완적 관계',
      '공통 가치관',
    ];
  }

  /**
   * 12띠 궁합의 주의점 분석
   */
  getAnimalCompatibilityChallenges(animalData1, animalData2) {
    // 실제로는 더 복잡한 로직이 필요하지만 예시로 구현
    return ['성격 차이로 인한 갈등', '가치관 차이', '소통 방식 차이'];
  }

  /**
   * 서비스 상태 확인
   */
  async healthCheck() {
    return {
      service: 'animal-fortune',
      status: genAI ? 'healthy' : 'error',
      model: this.model ? 'gemini-1.5-flash' : null,
      supportedAnimals: Object.keys(this.animalInfo),
      currentYear: this.yearInfo2025.yearName,
      timestamp: new Date().toISOString(),
    };
  }
}

// 싱글톤 인스턴스 생성
const animalFortuneService = new AnimalFortuneService();

export default animalFortuneService;
