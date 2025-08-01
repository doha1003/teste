/**
 * @fileoverview 운세 API 엔드포인트 - /api/v2/fortune
 * @version 2.0.0
 * @author doha.kr Backend Team
 */

import { withMiddleware, createResponse, createErrorResponse, getKoreanErrorMessage } from '../core/middleware.js';
import { ValidationSchemas } from '../core/validation.js';
import { createLogger } from '../core/logger.js';

// 서비스 임포트
import dailyFortuneService from '../services/fortune/daily.js';
import sajuFortuneService from '../services/fortune/saju.js';
import tarotFortuneService from '../services/fortune/tarot.js';
import zodiacFortuneService from '../services/fortune/zodiac.js';
import animalFortuneService from '../services/fortune/animal.js';

const logger = createLogger('fortune-api');

/**
 * 메인 운세 API 핸들러
 */
async function fortuneHandler(req, res, { requestId, clientIp, tracker }) {
  const { type, data = {}, options = {} } = req.body;

  if (!type) {
    return res.status(400).json(
      createErrorResponse(400, getKoreanErrorMessage('validation_failed'), {
        field: 'type',
        message: '운세 유형을 지정해주세요.'
      })
    );
  }

  try {
    let result;

    switch (type) {
      case 'daily':
        result = await handleDailyFortune(data, options, requestId);
        break;
      
      case 'saju':
        result = await handleSajuFortune(data, options, requestId);
        break;
      
      case 'tarot':
        result = await handleTarotFortune(data, options, requestId);
        break;
      
      case 'zodiac':
        result = await handleZodiacFortune(data, options, requestId);
        break;
      
      case 'animal':
        result = await handleAnimalFortune(data, options, requestId);
        break;
      
      default:
        return res.status(400).json(
          createErrorResponse(400, '지원하지 않는 운세 유형입니다.', {
            supportedTypes: ['daily', 'saju', 'tarot', 'zodiac', 'animal']
          })
        );
    }

    const duration = tracker.end();
    
    logger.info('Fortune API success', {
      requestId,
      type,
      duration,
      clientIp: clientIp.substring(0, 10) + '***'
    });

    return res.status(200).json(
      createResponse(true, result, null, {
        type,
        duration,
        requestId
      })
    );

  } catch (error) {
    const duration = tracker.end();
    
    logger.error('Fortune API error', {
      requestId,
      type,
      error: error.message,
      duration
    });

    const statusCode = error.statusCode || 500;
    const message = error.message.includes('API') 
      ? getKoreanErrorMessage('gemini_api_error')
      : getKoreanErrorMessage('internal_error');

    return res.status(statusCode).json(
      createErrorResponse(statusCode, message, {
        type,
        requestId
      })
    );
  }
}

/**
 * 일일 운세 처리
 */
async function handleDailyFortune(data, options, requestId) {
  const validation = ValidationSchemas.dailyFortune.validate(data);
  if (!validation.valid) {
    throw new Error(`입력 데이터 검증 실패: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  const { name, birthDate, gender, birthTime, manseryeok } = validation.data;
  
  const userData = {
    name,
    birthDate,
    gender,
    birthTime,
    manseryeok
  };

  const fortuneOptions = {
    includeDetailed: options.includeDetailed !== false,
    includeLucky: options.includeLucky !== false,
    todayDate: options.todayDate
  };

  return await dailyFortuneService.generateDailyFortune(userData, fortuneOptions);
}

/**
 * 사주 운세 처리
 */
async function handleSajuFortune(data, options, requestId) {
  const validation = ValidationSchemas.sajuFortune.validate(data);
  if (!validation.valid) {
    throw new Error(`사주 데이터 검증 실패: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  const sajuOptions = {
    includeDetailed: options.includeDetailed !== false,
    includeYearly: options.includeYearly !== false,
    includeAdvice: options.includeAdvice !== false
  };

  return await sajuFortuneService.analyzeSaju(validation.data, sajuOptions);
}

/**
 * 타로 운세 처리
 */
async function handleTarotFortune(data, options, requestId) {
  const { cardNumbers, question, spread = 'single' } = data;

  if (!cardNumbers || !Array.isArray(cardNumbers)) {
    throw new Error('카드 번호가 필요합니다.');
  }

  // 카드 번호 검증 (0-77)
  for (const cardNum of cardNumbers) {
    if (!Number.isInteger(cardNum) || cardNum < 0 || cardNum > 77) {
      throw new Error(`유효하지 않은 카드 번호: ${cardNum} (0-77 범위)`);
    }
  }

  const tarotOptions = {
    includeReversed: options.includeReversed !== false,
    includeAdvice: options.includeAdvice !== false,
    includeTimeframe: options.includeTimeframe !== false
  };

  switch (spread) {
    case 'single':
      if (cardNumbers.length !== 1) {
        throw new Error('단일 카드 리딩은 1장의 카드가 필요합니다.');
      }
      return await tarotFortuneService.performSingleCardReading(cardNumbers[0], question, tarotOptions);
    
    case 'three-card':
      if (cardNumbers.length !== 3) {
        throw new Error('3장 카드 스프레드는 3장의 카드가 필요합니다.');
      }
      return await tarotFortuneService.performThreeCardSpread(cardNumbers, question);
    
    case 'celtic-cross':
      if (cardNumbers.length !== 10) {
        throw new Error('켈틱 크로스 스프레드는 10장의 카드가 필요합니다.');
      }
      return await tarotFortuneService.performCelticCrossSpread(cardNumbers, question);
    
    default:
      throw new Error('지원하지 않는 스프레드 유형입니다.');
  }
}

/**
 * 별자리 운세 처리
 */
async function handleZodiacFortune(data, options, requestId) {
  const validation = ValidationSchemas.zodiacFortune.validate(data);
  if (!validation.valid) {
    throw new Error(`별자리 데이터 검증 실패: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  const { zodiac } = validation.data;
  
  const zodiacOptions = {
    includeWeekly: options.includeWeekly === true,
    includeMonthly: options.includeMonthly === true,
    includeCompatibility: options.includeCompatibility !== false,
    todayDate: options.todayDate
  };

  return await zodiacFortuneService.generateZodiacFortune(zodiac, zodiacOptions);
}

/**
 * 12띠 운세 처리
 */
async function handleAnimalFortune(data, options, requestId) {
  const validation = ValidationSchemas.animalFortune.validate(data);
  if (!validation.valid) {
    throw new Error(`12띠 데이터 검증 실패: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  const { animal } = validation.data;
  
  const animalOptions = {
    includeYearly: options.includeYearly !== false,
    includeMonthly: options.includeMonthly === true,
    includeCompatibility: options.includeCompatibility !== false,
    todayDate: options.todayDate
  };

  return await animalFortuneService.generateAnimalFortune(animal, animalOptions);
}

/**
 * 운세 궁합 분석 핸들러
 */
async function compatibilityHandler(req, res, { requestId, clientIp, tracker }) {
  const { type, data } = req.body;

  if (!type || !data) {
    return res.status(400).json(
      createErrorResponse(400, getKoreanErrorMessage('validation_failed'))
    );
  }

  try {
    let result;

    switch (type) {
      case 'zodiac':
        const { sign1, sign2 } = data;
        if (!sign1 || !sign2) {
          throw new Error('두 개의 별자리가 필요합니다.');
        }
        result = await zodiacFortuneService.analyzeCompatibility(sign1, sign2);
        break;
      
      case 'animal':
        const { animal1, animal2 } = data;
        if (!animal1 || !animal2) {
          throw new Error('두 개의 띠가 필요합니다.');
        }
        result = await animalFortuneService.analyzeAnimalCompatibility(animal1, animal2);
        break;
      
      default:
        return res.status(400).json(
          createErrorResponse(400, '지원하지 않는 궁합 유형입니다.', {
            supportedTypes: ['zodiac', 'animal']
          })
        );
    }

    const duration = tracker.end();
    
    logger.info('Compatibility API success', {
      requestId,
      type,
      duration
    });

    return res.status(200).json(
      createResponse(true, result, null, {
        type: 'compatibility',
        subType: type,
        duration,
        requestId
      })
    );

  } catch (error) {
    const duration = tracker.end();
    
    logger.error('Compatibility API error', {
      requestId,
      type,
      error: error.message,
      duration
    });

    return res.status(500).json(
      createErrorResponse(500, getKoreanErrorMessage('internal_error'))
    );
  }
}

/**
 * 랜덤 카드 뽑기 핸들러
 */
async function randomCardsHandler(req, res, { requestId, clientIp, tracker }) {
  const { count = 1, exclude = [] } = req.query;
  
  const cardCount = parseInt(count);
  if (isNaN(cardCount) || cardCount < 1 || cardCount > 10) {
    return res.status(400).json(
      createErrorResponse(400, '카드 수는 1-10 사이여야 합니다.')
    );
  }

  try {
    const excludeNumbers = Array.isArray(exclude) ? exclude.map(n => parseInt(n)).filter(n => !isNaN(n)) : [];
    const cards = tarotFortuneService.drawRandomCards(cardCount, excludeNumbers);
    
    const duration = tracker.end();
    
    return res.status(200).json(
      createResponse(true, { cards }, null, {
        count: cardCount,
        duration,
        requestId
      })
    );

  } catch (error) {
    const duration = tracker.end();
    
    logger.error('Random cards API error', {
      requestId,
      error: error.message,
      duration
    });

    return res.status(500).json(
      createErrorResponse(500, getKoreanErrorMessage('internal_error'))
    );
  }
}

/**
 * 건강 상태 확인 핸들러
 */
async function healthHandler(req, res, { requestId, clientIp, tracker }) {
  try {
    const [dailyStatus, sajuStatus, tarotStatus, zodiacStatus, animalStatus] = await Promise.all([
      dailyFortuneService.healthCheck(),
      sajuFortuneService.healthCheck(), 
      tarotFortuneService.healthCheck(),
      zodiacFortuneService.healthCheck(),
      animalFortuneService.healthCheck()
    ]);

    const overallStatus = [dailyStatus, sajuStatus, tarotStatus, zodiacStatus, animalStatus]
      .every(status => status.status === 'healthy') ? 'healthy' : 'degraded';

    const result = {
      status: overallStatus,
      services: {
        daily: dailyStatus,
        saju: sajuStatus,
        tarot: tarotStatus,
        zodiac: zodiacStatus,
        animal: animalStatus
      },
      timestamp: new Date().toISOString()
    };

    const duration = tracker.end();
    
    return res.status(200).json(
      createResponse(true, result, null, {
        duration,
        requestId
      })
    );

  } catch (error) {
    const duration = tracker.end();
    
    logger.error('Health check error', {
      requestId,
      error: error.message,
      duration
    });

    return res.status(500).json(
      createErrorResponse(500, '서비스 상태 확인 중 오류가 발생했습니다.')
    );
  }
}

// 메인 핸들러 - 경로별 분기
async function mainHandler(req, res, context) {
  const { url } = req;
  
  if (url === '/api/v2/fortune' && req.method === 'POST') {
    return await fortuneHandler(req, res, context);
  } else if (url === '/api/v2/fortune/compatibility' && req.method === 'POST') {
    return await compatibilityHandler(req, res, context);
  } else if (url === '/api/v2/fortune/random-cards' && req.method === 'GET') {
    return await randomCardsHandler(req, res, context);
  } else if (url === '/api/v2/fortune/health' && req.method === 'GET') {
    return await healthHandler(req, res, context);
  } else {
    return res.status(404).json(
      createErrorResponse(404, '요청하신 API 엔드포인트를 찾을 수 없습니다.')
    );
  }
}

// 미들웨어 적용
export default withMiddleware(mainHandler, {
  enableRateLimit: true,
  enableCache: false, // 운세는 매번 새로 생성
  enableValidation: true,
  enableLogging: true,
  allowedMethods: ['GET', 'POST'],
  rateLimit: { requests: 30, window: 60000 }, // 30 requests per minute
});

// 명명된 내보내기 (테스트용)
export {
  fortuneHandler,
  compatibilityHandler,
  randomCardsHandler,
  healthHandler
};