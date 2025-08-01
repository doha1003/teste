/**
 * @fileoverview 사주 분석 서비스 - 60갑자 기반 전문 사주 해석
 * @version 2.0.0
 * @author doha.kr Backend Team
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createLogger } from '../../core/logger.js';
import { cache, keyBuilder } from '../../core/cache.js';

const logger = createLogger('saju-fortune');

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
 * 사주 분석 서비스
 */
export class SajuFortuneService {
  constructor() {
    this.model = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.initializeSajuData();
  }

  /**
   * 사주 기초 데이터 초기화
   */
  initializeSajuData() {
    // 천간 (Heavenly Stems)
    this.heavenlyStems = {
      '갑': { element: '목', nature: '양', description: '큰 나무' },
      '을': { element: '목', nature: '음', description: '작은 나무' },
      '병': { element: '화', nature: '양', description: '태양' },
      '정': { element: '화', nature: '음', description: '촛불' },
      '무': { element: '토', nature: '양', description: '산' },
      '기': { element: '토', nature: '음', description: '들판' },
      '경': { element: '금', nature: '양', description: '쇠' },
      '신': { element: '금', nature: '음', description: '보석' },
      '임': { element: '수', nature: '양', description: '바다' },
      '계': { element: '수', nature: '음', description: '샘물' }
    };

    // 지지 (Earthly Branches)
    this.earthlyBranches = {
      '자': { element: '수', season: '겨울', animal: '쥐', time: '23-01시' },
      '축': { element: '토', season: '겨울', animal: '소', time: '01-03시' },
      '인': { element: '목', season: '봄', animal: '호랑이', time: '03-05시' },
      '묘': { element: '목', season: '봄', animal: '토끼', time: '05-07시' },
      '진': { element: '토', season: '봄', animal: '용', time: '07-09시' },
      '사': { element: '화', season: '여름', animal: '뱀', time: '09-11시' },
      '오': { element: '화', season: '여름', animal: '말', time: '11-13시' },
      '미': { element: '토', season: '여름', animal: '양', time: '13-15시' },
      '신': { element: '금', season: '가을', animal: '원숭이', time: '15-17시' },
      '유': { element: '금', season: '가을', animal: '닭', time: '17-19시' },
      '술': { element: '토', season: '가을', animal: '개', time: '19-21시' },
      '해': { element: '수', season: '겨울', animal: '돼지', time: '21-23시' }
    };

    // 오행 상생상극
    this.fiveElements = {
      relations: {
        생: { // 상생
          목: '화', 화: '토', 토: '금', 금: '수', 수: '목'
        },
        극: { // 상극
          목: '토', 화: '금', 토: '수', 금: '목', 수: '화'
        }
      }
    };
  }

  /**
   * 사주 팔자 분석
   */
  async analyzeSaju(sajuData, options = {}) {
    const {
      includeDetailed = true,
      includeYearly = true,
      includeAdvice = true
    } = options;

    if (!this.model) {
      throw new Error('Gemini API가 설정되지 않았습니다.');
    }

    const { yearPillar, monthPillar, dayPillar, hourPillar } = sajuData;
    
    // 캐시 키 생성
    const cacheKey = keyBuilder.build('saju-analysis', `${yearPillar}_${monthPillar}_${dayPillar}_${hourPillar}`);

    // 캐시에서 확인 (사주는 변하지 않으므로 긴 캐시)
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info('Saju analysis cache hit');
      return cached;
    }

    try {
      // 사주 기본 분석
      const basicAnalysis = this.analyzeSajuBasics(sajuData);
      
      // AI 분석 프롬프트 생성
      const prompt = this.buildSajuPrompt(sajuData, basicAnalysis, includeDetailed, includeYearly, includeAdvice);
      
      logger.info('Generating saju analysis', {
        pillars: `${yearPillar}_${monthPillar}_${dayPillar}_${hourPillar}`,
        promptLength: prompt.length
      });

      const startTime = performance.now();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const duration = performance.now() - startTime;

      logger.info('Saju analysis generated', {
        responseLength: text.length,
        duration: Math.round(duration)
      });

      // 응답 파싱
      const parsedAnalysis = this.parseSajuResponse(text);
      
      // 종합 결과
      const sajuAnalysis = {
        ...parsedAnalysis,
        basic: basicAnalysis,
        pillars: {
          year: yearPillar,
          month: monthPillar,
          day: dayPillar,
          hour: hourPillar
        },
        generatedAt: new Date().toISOString(),
        aiGenerated: true
      };

      // 캐시에 저장 (7일간)
      await cache.set(cacheKey, sajuAnalysis, 7 * 24 * 60 * 60 * 1000);

      return sajuAnalysis;

    } catch (error) {
      logger.error('Saju analysis failed', {
        error: error.message,
        pillars: `${yearPillar}_${monthPillar}_${dayPillar}_${hourPillar}`
      });
      throw error;
    }
  }

  /**
   * 사주 기본 분석 (오행, 강약 등)
   */
  analyzeSajuBasics(sajuData) {
    const { yearPillar, monthPillar, dayPillar, hourPillar } = sajuData;
    
    // 각 기둥의 천간, 지지 분리
    const pillars = {
      year: { stem: yearPillar[0], branch: yearPillar[1] },
      month: { stem: monthPillar[0], branch: monthPillar[1] },
      day: { stem: dayPillar[0], branch: dayPillar[1] },
      hour: { stem: hourPillar[0], branch: hourPillar[1] }
    };

    // 오행 분석
    const elements = this.analyzeElements(pillars);
    
    // 일간 분석 (주인)
    const dayMaster = this.analyzeDayMaster(pillars.day, pillars);
    
    // 계절 분석
    const season = this.analyzeSeason(pillars.month.branch);
    
    return {
      pillars,
      elements,
      dayMaster,
      season,
      strength: this.calculateStrength(pillars, elements),
      harmony: this.calculateHarmony(pillars)
    };
  }

  /**
   * 오행 분석
   */
  analyzeElements(pillars) {
    const elementCount = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    
    // 천간 오행 계산
    Object.values(pillars).forEach(pillar => {
      const stemElement = this.heavenlyStems[pillar.stem]?.element;
      const branchElement = this.earthlyBranches[pillar.branch]?.element;
      
      if (stemElement) elementCount[stemElement]++;
      if (branchElement) elementCount[branchElement]++;
    });

    // 가장 많은/적은 오행
    const sortedElements = Object.entries(elementCount).sort(([,a], [,b]) => b - a);
    
    return {
      count: elementCount,
      strongest: sortedElements[0][0],
      weakest: sortedElements[sortedElements.length - 1][0],
      balance: this.calculateElementBalance(elementCount)
    };
  }

  /**
   * 일간 분석 (사주의 주인)
   */
  analyzeDayMaster(dayPillar, allPillars) {
    const dayStem = dayPillar.stem;
    const dayBranch = dayPillar.branch;
    
    const stemInfo = this.heavenlyStems[dayStem];
    const branchInfo = this.earthlyBranches[dayBranch];
    
    return {
      stem: dayStem,
      branch: dayBranch,
      element: stemInfo.element,
      nature: stemInfo.nature,
      description: stemInfo.description,
      seasonalStrength: this.calculateSeasonalStrength(stemInfo.element, allPillars.month.branch)
    };
  }

  /**
   * 계절 분석
   */
  analyzeSeason(monthBranch) {
    const branchInfo = this.earthlyBranches[monthBranch];
    return {
      season: branchInfo.season,
      element: branchInfo.element,
      characteristics: this.getSeasonCharacteristics(branchInfo.season)
    };
  }

  /**
   * 사주 강약 계산
   */
  calculateStrength(pillars, elements) {
    const dayElement = this.heavenlyStems[pillars.day.stem].element;
    let strength = 0;

    // 같은 오행 개수
    strength += elements.count[dayElement] * 2;
    
    // 생하는 오행 개수
    const supportElement = Object.entries(this.fiveElements.relations.생)
      .find(([key, value]) => value === dayElement)?.[0];
    if (supportElement) {
      strength += elements.count[supportElement];
    }

    // 극하는 오행 개수 (빼기)
    const weakenElement = this.fiveElements.relations.극[dayElement];
    if (weakenElement) {
      strength -= elements.count[weakenElement];
    }

    return {
      score: strength,
      level: strength > 3 ? '강' : strength > 0 ? '중' : '약',
      description: this.getStrengthDescription(strength)
    };
  }

  /**
   * 사주 조화 계산
   */
  calculateHarmony(pillars) {
    let harmonyScore = 0;
    const conflicts = [];
    const supports = [];

    // 천간 관계 분석
    // 지지 관계 분석
    // (복잡한 로직이므로 간소화)
    
    return {
      score: harmonyScore,
      level: harmonyScore > 5 ? '상' : harmonyScore > 0 ? '중' : '하',
      conflicts,
      supports
    };
  }

  /**
   * 사주 분석 프롬프트 구성
   */
  buildSajuPrompt(sajuData, basicAnalysis, includeDetailed, includeYearly, includeAdvice) {
    const { yearPillar, monthPillar, dayPillar, hourPillar } = sajuData;
    const { dayMaster, elements, strength, season } = basicAnalysis;

    let prompt = `당신은 한국의 사주명리학 전문가입니다. 다음 사주팔자를 전문적으로 분석해주세요.

사주팔자: ${yearPillar} ${monthPillar} ${dayPillar} ${hourPillar}

일간 정보:
- 일간: ${dayMaster.stem} (${dayMaster.element}, ${dayMaster.nature})
- 계절: ${season.season}
- 오행 분포: 목(${elements.count.목}) 화(${elements.count.화}) 토(${elements.count.토}) 금(${elements.count.금}) 수(${elements.count.수})
- 일간 강약: ${strength.level}

다음 내용을 포함하여 분석해주세요:

1. 성격과 기질: [일간과 사주 전체의 특성을 바탕으로 3-4문장]
2. 오행의 균형: [오행 배치의 특징과 보완점 2-3문장]
3. 재물운: [재성과 관련된 운세 3문장]
4. 직업운: [관성, 식상과 관련된 직업 적성 3문장]
5. 연애운: [배우자궁과 관련된 결혼운 3문장]
6. 건강운: [신체적 특징과 주의사항 2-3문장]`;

    if (includeYearly) {
      const currentYear = new Date().getFullYear();
      prompt += `
7. ${currentYear}년 운세: [올해의 대운과 세운 영향 3문장]
8. ${currentYear + 1}년 전망: [내년의 운세 전망 2-3문장]`;
    }

    if (includeAdvice) {
      prompt += `
9. 개운법: [오행 보완을 위한 구체적인 방법 3가지]
10. 인생 조언: [사주를 바탕으로 한 인생 방향 제시 3-4문장]`;
    }

    if (includeDetailed) {
      prompt += `
11. 대운 흐름: [10년 단위 대운의 특징 간략히]
12. 궁합: [좋은 배우자의 특징 2문장]`;
    }

    prompt += `

각 항목을 2-4문장으로 구체적이고 실용적으로 설명해주세요.`;

    return prompt;
  }

  /**
   * AI 응답 파싱
   */
  parseSajuResponse(text) {
    const sections = {};
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // 섹션 헤더 확인
      if (trimmed.match(/^\d+\.\s/)) {
        if (currentSection) {
          sections[currentSection] = currentContent.join(' ').trim();
        }
        
        const sectionMatch = trimmed.match(/^\d+\.\s(.+?):\s*(.*)$/);
        if (sectionMatch) {
          currentSection = this.getSectionKey(sectionMatch[1]);
          currentContent = sectionMatch[2] ? [sectionMatch[2]] : [];
        }
      } else if (currentSection && trimmed) {
        currentContent.push(trimmed);
      }
    }

    // 마지막 섹션 처리
    if (currentSection) {
      sections[currentSection] = currentContent.join(' ').trim();
    }

    return {
      personality: sections.personality || '',
      elementBalance: sections.elementBalance || '',
      wealth: sections.wealth || '',
      career: sections.career || '',
      love: sections.love || '',
      health: sections.health || '',
      thisYear: sections.thisYear || '',
      nextYear: sections.nextYear || '',
      remedy: sections.remedy || '',
      advice: sections.advice || '',
      majorCycles: sections.majorCycles || '',
      compatibility: sections.compatibility || ''
    };
  }

  /**
   * 섹션명을 키로 변환
   */
  getSectionKey(sectionName) {
    const keyMap = {
      '성격과 기질': 'personality',
      '오행의 균형': 'elementBalance',
      '재물운': 'wealth',
      '직업운': 'career',
      '연애운': 'love',
      '건강운': 'health',
      '개운법': 'remedy',
      '인생 조언': 'advice',
      '대운 흐름': 'majorCycles',
      '궁합': 'compatibility'
    };

    // 연도가 포함된 경우
    if (sectionName.includes('년 운세')) {
      return 'thisYear';
    }
    if (sectionName.includes('년 전망')) {
      return 'nextYear';
    }

    return keyMap[sectionName] || sectionName.toLowerCase().replace(/\s/g, '');
  }

  /**
   * 유틸리티 메소드들
   */
  calculateElementBalance(elementCount) {
    const values = Object.values(elementCount);
    const max = Math.max(...values);
    const min = Math.min(...values);
    return max - min <= 2 ? '균형' : '불균형';
  }

  calculateSeasonalStrength(element, monthBranch) {
    const season = this.earthlyBranches[monthBranch].season;
    const seasonElements = {
      '봄': '목', '여름': '화', '가을': '금', '겨울': '수'
    };
    
    return seasonElements[season] === element ? '강' : '약';
  }

  getSeasonCharacteristics(season) {
    const characteristics = {
      '봄': '성장과 발전의 기운',
      '여름': '활발하고 역동적인 에너지',
      '가을': '결실과 수확의 시기',
      '겨울': '침착하고 깊이 있는 성격'
    };
    return characteristics[season] || '';
  }

  getStrengthDescription(strength) {
    if (strength > 5) return '매우 강한 사주';
    if (strength > 3) return '강한 사주';
    if (strength > 0) return '보통 사주';
    if (strength > -3) return '약한 사주';
    return '매우 약한 사주';
  }

  /**
   * 서비스 상태 확인
   */
  async healthCheck() {
    return {
      service: 'saju-fortune',
      status: genAI ? 'healthy' : 'error',
      model: this.model ? 'gemini-1.5-flash' : null,
      timestamp: new Date().toISOString()
    };
  }
}

// 싱글톤 인스턴스 생성
const sajuFortuneService = new SajuFortuneService();

export default sajuFortuneService;