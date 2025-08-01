/**
 * @fileoverview 타로 카드 분석 서비스 - 78장 풀덱 타로 해석
 * @version 2.0.0
 * @author doha.kr Backend Team
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createLogger } from '../../core/logger.js';
import { cache, keyBuilder } from '../../core/cache.js';

const logger = createLogger('tarot-fortune');

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
 * 타로 카드 분석 서비스
 */
export class TarotFortuneService {
  constructor() {
    this.model = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.initializeTarotData();
  }

  /**
   * 타로 카드 데이터 초기화
   */
  initializeTarotData() {
    // 메이저 아르카나 (0-21)
    this.majorArcana = {
      0: { name: '바보', nameEn: 'The Fool', element: '바람', keywords: ['새로운 시작', '모험', '순수'] },
      1: { name: '마법사', nameEn: 'The Magician', element: '불', keywords: ['의지력', '창조', '행동'] },
      2: { name: '여교황', nameEn: 'The High Priestess', element: '물', keywords: ['직관', '신비', '내적 지혜'] },
      3: { name: '여황제', nameEn: 'The Empress', element: '흙', keywords: ['풍요', '모성', '창조력'] },
      4: { name: '황제', nameEn: 'The Emperor', element: '불', keywords: ['권위', '안정', '리더십'] },
      5: { name: '교황', nameEn: 'The Hierophant', element: '흙', keywords: ['전통', '가르침', '영적 지도'] },
      6: { name: '연인', nameEn: 'The Lovers', element: '바람', keywords: ['사랑', '선택', '조화'] },
      7: { name: '전차', nameEn: 'The Chariot', element: '물', keywords: ['승리', '의지력', '진보'] },
      8: { name: '힘', nameEn: 'Strength', element: '불', keywords: ['용기', '인내', '내적 힘'] },
      9: { name: '은둔자', nameEn: 'The Hermit', element: '흙', keywords: ['성찰', '지혜', '고독'] },
      10: { name: '운명의 수레바퀴', nameEn: 'Wheel of Fortune', element: '불', keywords: ['운명', '변화', '순환'] },
      11: { name: '정의', nameEn: 'Justice', element: '바람', keywords: ['공정', '균형', '진실'] },
      12: { name: '매달린 사람', nameEn: 'The Hanged Man', element: '물', keywords: ['희생', '기다림', '새로운 관점'] },
      13: { name: '죽음', nameEn: 'Death', element: '물', keywords: ['변화', '끝과 시작', '변환'] },
      14: { name: '절제', nameEn: 'Temperance', element: '불', keywords: ['조화', '균형', '치유'] },
      15: { name: '악마', nameEn: 'The Devil', element: '흙', keywords: ['유혹', '속박', '물질주의'] },
      16: { name: '탑', nameEn: 'The Tower', element: '불', keywords: ['파괴', '각성', '급격한 변화'] },
      17: { name: '별', nameEn: 'The Star', element: '바람', keywords: ['희망', '영감', '치유'] },
      18: { name: '달', nameEn: 'The Moon', element: '물', keywords: ['환상', '무의식', '두려움'] },
      19: { name: '태양', nameEn: 'The Sun', element: '불', keywords: ['성공', '기쁨', '활력'] },
      20: { name: '심판', nameEn: 'Judgement', element: '불', keywords: ['부활', '각성', '용서'] },
      21: { name: '세계', nameEn: 'The World', element: '흙', keywords: ['완성', '성취', '통합'] }
    };

    // 마이너 아르카나 - 완드 (지팡이)
    this.wands = {
      1: { name: '완드 에이스', keywords: ['새로운 아이디어', '창조적 에너지', '영감'] },
      2: { name: '완드 2', keywords: ['계획', '미래 전망', '개인적 힘'] },
      3: { name: '완드 3', keywords: ['확장', '먼 안목', '리더십'] },
      4: { name: '완드 4', keywords: ['축하', '조화', '안정'] },
      5: { name: '완드 5', keywords: ['갈등', '경쟁', '도전'] },
      6: { name: '완드 6', keywords: ['승리', '성공', '인정'] },
      7: { name: '완드 7', keywords: ['방어', '도전', '용기'] },
      8: { name: '완드 8', keywords: ['빠른 행동', '소통', '진보'] },
      9: { name: '완드 9', keywords: ['방어 자세', '인내', '마지막 노력'] },
      10: { name: '완드 10', keywords: ['과부하', '책임감', '완성 직전'] },
      11: { name: '완드 페이지', keywords: ['열정', '학습', '새로운 소식'] },
      12: { name: '완드 나이트', keywords: ['모험', '충동적', '용감함'] },
      13: { name: '완드 퀸', keywords: ['자신감', '결단력', '독립성'] },
      14: { name: '완드 킹', keywords: ['리더십', '비전', '기업가 정신'] }
    };

    // 마이너 아르카나 - 컵 (성배)
    this.cups = {
      1: { name: '컵 에이스', keywords: ['새로운 사랑', '감정적 시작', '영적 선물'] },
      2: { name: '컵 2', keywords: ['파트너십', '사랑', '상호 매력'] },
      3: { name: '컵 3', keywords: ['우정', '축하', '공동체'] },
      4: { name: '컵 4', keywords: ['무관심', '명상', '재평가'] },
      5: { name: '컵 5', keywords: ['실망', '후회', '감정적 손실'] },
      6: { name: '컵 6', keywords: ['향수', '순수함', '어린 시절'] },
      7: { name: '컵 7', keywords: ['환상', '선택의 혼란', '꿈'] },
      8: { name: '컵 8', keywords: ['포기', '실망', '영적 탐구'] },
      9: { name: '컵 9', keywords: ['만족', '감정적 안정', '소원 성취'] },
      10: { name: '컵 10', keywords: ['행복', '가족', '감정적 성취'] },
      11: { name: '컵 페이지', keywords: ['창의적 기회', '직관적 메시지', '감정적 학습'] },
      12: { name: '컵 나이트', keywords: ['로맨스', '매력', '예술적 재능'] },
      13: { name: '컵 퀸', keywords: ['감정적 성숙', '직관력', '배려'] },
      14: { name: '컵 킹', keywords: ['감정적 균형', '외교술', '관용'] }
    };

    // 마이너 아르카나 - 소드 (검)
    this.swords = {
      // 1-14 소드 카드들...
    };

    // 마이너 아르카나 - 펜타클 (금화)
    this.pentacles = {
      // 1-14 펜타클 카드들...
    };
  }

  /**
   * 단일 카드 타로 리딩
   */
  async performSingleCardReading(cardNumber, question = null, options = {}) {
    const {
      includeReversed = true,
      includeAdvice = true,
      includeTimeframe = true
    } = options;

    if (!this.model) {
      throw new Error('Gemini API가 설정되지 않았습니다.');
    }

    // 카드 정보 조회
    const cardInfo = this.getCardInfo(cardNumber);
    if (!cardInfo) {
      throw new Error('유효하지 않은 카드 번호입니다.');
    }

    // 뒤집힌 카드 여부 결정 (랜덤 또는 지정)
    const isReversed = includeReversed ? Math.random() > 0.5 : false;

    // 캐시 키 생성
    const cacheKey = keyBuilder.build('tarot-single', cardNumber, isReversed ? 'r' : 'u', question ? 'q' : 'n');

    // 캐시 확인 (같은 카드에 대한 일반적 해석은 캐시)
    let cached = null;
    if (!question) {
      cached = await cache.get(cacheKey);
      if (cached) {
        logger.info('Tarot reading cache hit', { cardNumber, isReversed });
        return cached;
      }
    }

    try {
      const prompt = this.buildTarotPrompt(cardInfo, isReversed, question, includeAdvice, includeTimeframe);
      
      logger.info('Generating tarot reading', {
        cardNumber,
        cardName: cardInfo.name,
        isReversed,
        hasQuestion: !!question,
        promptLength: prompt.length
      });

      const startTime = performance.now();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const duration = performance.now() - startTime;

      logger.info('Tarot reading generated', {
        cardNumber,
        responseLength: text.length,
        duration: Math.round(duration)
      });

      // 응답 파싱
      const parsedReading = this.parseTarotResponse(text, cardInfo, isReversed);
      
      const tarotReading = {
        ...parsedReading,
        card: cardInfo,
        isReversed,
        question,
        generatedAt: new Date().toISOString(),
        aiGenerated: true
      };

      // 일반적인 해석은 캐시 (질문 특화가 아닌 경우)
      if (!question) {
        await cache.set(cacheKey, tarotReading, 24 * 60 * 60 * 1000); // 24시간
      }

      return tarotReading;

    } catch (error) {
      logger.error('Tarot reading failed', {
        error: error.message,
        cardNumber,
        isReversed
      });
      throw error;
    }
  }

  /**
   * 3장 카드 스프레드 (과거-현재-미래)
   */
  async performThreeCardSpread(cardNumbers, question = null) {
    if (!Array.isArray(cardNumbers) || cardNumbers.length !== 3) {
      throw new Error('3장의 카드가 필요합니다.');
    }

    const positions = ['과거', '현재', '미래'];
    const readings = [];

    for (let i = 0; i < 3; i++) {
      const reading = await this.performSingleCardReading(cardNumbers[i], null, {
        includeReversed: true,
        includeAdvice: false,
        includeTimeframe: false
      });
      
      readings.push({
        ...reading,
        position: positions[i],
        positionDescription: this.getPositionDescription(positions[i])
      });
    }

    // 종합 해석 생성
    const overallReading = await this.generateOverallReading(readings, question);

    return {
      spread: 'three-card',
      question,
      cards: readings,
      overall: overallReading,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * 켈틱 크로스 스프레드 (10장)
   */
  async performCelticCrossSpread(cardNumbers, question = null) {
    if (!Array.isArray(cardNumbers) || cardNumbers.length !== 10) {
      throw new Error('10장의 카드가 필요합니다.');
    }

    const positions = [
      '현재 상황', '도전과 기회', '먼 과거', '가까운 과거', '가능한 미래',
      '가까운 미래', '당신의 접근법', '외부 영향', '희망과 두려움', '최종 결과'
    ];

    const readings = [];

    for (let i = 0; i < 10; i++) {
      const reading = await this.performSingleCardReading(cardNumbers[i], null, {
        includeReversed: true,
        includeAdvice: false,
        includeTimeframe: false
      });
      
      readings.push({
        ...reading,
        position: positions[i],
        positionDescription: this.getCelticCrossDescription(positions[i])
      });
    }

    // 종합 해석 생성
    const overallReading = await this.generateCelticCrossReading(readings, question);

    return {
      spread: 'celtic-cross',
      question,
      cards: readings,
      overall: overallReading,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * 카드 정보 조회
   */
  getCardInfo(cardNumber) {
    if (cardNumber >= 0 && cardNumber <= 21) {
      return { ...this.majorArcana[cardNumber], number: cardNumber, type: 'major' };
    } else if (cardNumber >= 22 && cardNumber <= 35) {
      const index = cardNumber - 21;
      return { ...this.wands[index], number: cardNumber, type: 'wands' };
    } else if (cardNumber >= 36 && cardNumber <= 49) {
      const index = cardNumber - 35;
      return { ...this.cups[index], number: cardNumber, type: 'cups' };
    }
    // 소드와 펜타클도 추가...
    return null;
  }

  /**
   * 타로 해석 프롬프트 구성
   */
  buildTarotPrompt(cardInfo, isReversed, question, includeAdvice, includeTimeframe) {
    let prompt = `당신은 전문 타로 리더입니다. 다음 타로 카드를 해석해주세요.

카드: ${cardInfo.name} (${cardInfo.nameEn})
방향: ${isReversed ? '역방향 (뒤집힌 카드)' : '정방향'}
키워드: ${cardInfo.keywords?.join(', ')}`;

    if (question) {
      prompt += `\n질문: ${question}`;
    }

    prompt += `

다음 형식으로 해석해주세요:

1. 카드의 기본 의미: [${isReversed ? '역방향' : '정방향'} 의미를 2-3문장으로]
2. 현재 상황: [카드가 나타내는 현재 상황 3문장]
3. 감정과 관계: [연애, 인간관계 관련 해석 2-3문장]  
4. 직업과 재물: [일, 돈과 관련된 해석 2-3문장]
5. 영적 메시지: [카드가 전하는 영적, 정신적 의미 2문장]`;

    if (includeAdvice) {
      prompt += `
6. 조언: [카드를 바탕으로 한 구체적인 행동 지침 3문장]`;
    }

    if (includeTimeframe) {
      prompt += `
7. 시기: [카드의 에너지가 나타날 예상 시기]`;
    }

    prompt += `

${isReversed ? '역방향 카드의 의미를 중심으로 ' : ''}각 항목을 상세하고 실용적으로 해석해주세요.`;

    return prompt;
  }

  /**
   * AI 응답 파싱
   */
  parseTarotResponse(text, cardInfo, isReversed) {
    const sections = {};
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.match(/^\d+\.\s/)) {
        if (currentSection) {
          sections[currentSection] = currentContent.join(' ').trim();
        }
        
        const sectionMatch = trimmed.match(/^\d+\.\s(.+?):\s*(.*)$/);
        if (sectionMatch) {
          currentSection = this.getTarotSectionKey(sectionMatch[1]);
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
      basicMeaning: sections.basicMeaning || '',
      currentSituation: sections.currentSituation || '',
      relationships: sections.relationships || '',
      careerMoney: sections.careerMoney || '',
      spiritualMessage: sections.spiritualMessage || '',
      advice: sections.advice || '',
      timeframe: sections.timeframe || ''
    };
  }

  /**
   * 타로 섹션명을 키로 변환
   */
  getTarotSectionKey(sectionName) {
    const keyMap = {
      '카드의 기본 의미': 'basicMeaning',
      '현재 상황': 'currentSituation', 
      '감정과 관계': 'relationships',
      '직업과 재물': 'careerMoney',
      '영적 메시지': 'spiritualMessage',
      '조언': 'advice',
      '시기': 'timeframe'
    };

    return keyMap[sectionName] || sectionName.toLowerCase().replace(/\s/g, '');
  }

  /**
   * 종합 해석 생성 (3장 스프레드용)
   */
  async generateOverallReading(readings, question) {
    const prompt = `다음 3장의 타로 카드 해석을 바탕으로 종합적인 메시지를 제공해주세요.

과거: ${readings[0].card.name} ${readings[0].isReversed ? '(역방향)' : ''}
현재: ${readings[1].card.name} ${readings[1].isReversed ? '(역방향)' : ''}
미래: ${readings[2].card.name} ${readings[2].isReversed ? '(역방향)' : ''}

${question ? `질문: ${question}` : ''}

과거에서 현재, 미래로 이어지는 흐름을 해석하고 전체적인 조언을 3-4문장으로 제공해주세요.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      logger.error('Overall reading generation failed', { error: error.message });
      return '종합 해석을 생성하는 중 오류가 발생했습니다.';
    }
  }

  /**
   * 유틸리티 메소드들
   */
  getPositionDescription(position) {
    const descriptions = {
      '과거': '과거의 영향과 배경',
      '현재': '현재 상황과 에너지',
      '미래': '앞으로의 가능성과 방향'
    };
    return descriptions[position] || '';
  }

  getCelticCrossDescription(position) {
    const descriptions = {
      '현재 상황': '현재의 핵심 이슈',
      '도전과 기회': '극복해야 할 장애물 또는 기회',
      '먼 과거': '상황의 근본 원인',
      '가까운 과거': '최근 영향',
      '가능한 미래': '현재 방향으로 갈 경우의 결과',
      '가까운 미래': '가까운 시일 내 일어날 일',
      '당신의 접근법': '당신의 마음가짐과 접근 방식',
      '외부 영향': '주변 환경과 타인의 영향',
      '희망과 두려움': '당신의 내적 기대와 우려',
      '최종 결과': '모든 요소를 고려한 최종 결과'
    };
    return descriptions[position] || '';
  }

  /**
   * 랜덤 카드 선택
   */
  drawRandomCards(count = 1) {
    const cards = [];
    const usedNumbers = new Set();
    
    while (cards.length < count) {
      const cardNumber = Math.floor(Math.random() * 78); // 0-77
      if (!usedNumbers.has(cardNumber)) {
        usedNumbers.add(cardNumber);
        cards.push(cardNumber);
      }
    }
    
    return cards;
  }

  /**
   * 서비스 상태 확인
   */
  async healthCheck() {
    return {
      service: 'tarot-fortune',
      status: genAI ? 'healthy' : 'error',
      model: this.model ? 'gemini-1.5-flash' : null,
      totalCards: 78,
      timestamp: new Date().toISOString()
    };
  }
}

// 싱글톤 인스턴스 생성
const tarotFortuneService = new TarotFortuneService();

export default tarotFortuneService;