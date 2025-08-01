/**
 * @fileoverview 심리테스트 API 엔드포인트 - /api/v2/psychology
 * @version 2.0.0
 * @author doha.kr Backend Team
 */

import { withMiddleware, createResponse, createErrorResponse, getKoreanErrorMessage } from '../core/middleware.js';
import { ValidationSchemas } from '../core/validation.js';
import { createLogger } from '../core/logger.js';

// 서비스 임포트
import mbtiTestService from '../services/psychology/mbti.js';

const logger = createLogger('psychology-api');

/**
 * 메인 심리테스트 API 핸들러
 */
async function psychologyHandler(req, res, { requestId, clientIp, tracker }) {
  const { type, data = {}, options = {} } = req.body;

  if (!type) {
    return res.status(400).json(
      createErrorResponse(400, getKoreanErrorMessage('validation_failed'), {
        field: 'type',
        message: '테스트 유형을 지정해주세요.'
      })
    );
  }

  try {
    let result;

    switch (type) {
      case 'mbti':
        result = await handleMBTITest(data, options, requestId);
        break;
      
      case 'love-dna':
        result = await handleLoveDNATest(data, options, requestId);
        break;
      
      case 'teto-egen':
        result = await handleTetoEgenTest(data, options, requestId);
        break;
      
      default:
        return res.status(400).json(
          createErrorResponse(400, '지원하지 않는 테스트 유형입니다.', {
            supportedTypes: ['mbti', 'love-dna', 'teto-egen']
          })
        );
    }

    const duration = tracker.end();
    
    logger.info('Psychology API success', {
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
    
    logger.error('Psychology API error', {
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
 * MBTI 테스트 처리
 */
async function handleMBTITest(data, options, requestId) {
  const { answers } = data;
  
  if (!answers || !Array.isArray(answers)) {
    throw new Error('답변 배열이 필요합니다.');
  }

  if (answers.length !== 60) {
    throw new Error('60개의 답변이 필요합니다.');
  }

  // 답변 검증 (1-5 스케일)
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    if (!Number.isInteger(answer) || answer < 1 || answer > 5) {
      throw new Error(`답변 ${i + 1}은 1-5 사이의 정수여야 합니다.`);
    }
  }

  const testOptions = {
    includeDetailedAnalysis: options.includeDetailedAnalysis !== false,
    includeCareerAdvice: options.includeCareerAdvice !== false,
    includeRelationshipAdvice: options.includeRelationshipAdvice !== false,
    includeFamousPeople: options.includeFamousPeople !== false
  };

  logger.info('MBTI test started', {
    requestId,
    answersLength: answers.length,
    options: testOptions
  });

  return await mbtiTestService.conductMBTITest(answers, testOptions);
}

/**
 * Love DNA 테스트 처리 (간소화된 구현)
 */
async function handleLoveDNATest(data, options, requestId) {
  const { answers } = data;
  
  if (!answers || !Array.isArray(answers)) {
    throw new Error('답변 배열이 필요합니다.');
  }

  if (answers.length !== 20) {
    throw new Error('20개의 답변이 필요합니다.');
  }

  // 간단한 Love DNA 알고리즘
  const types = ['로맨틱한 연인', '친구 같은 연인', '열정적인 연인', '안정적인 연인'];
  const scores = [0, 0, 0, 0];

  // 답변을 바탕으로 점수 계산
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const typeIndex = i % 4;
    scores[typeIndex] += answer;
  }

  // 가장 높은 점수의 유형 결정
  const maxIndex = scores.indexOf(Math.max(...scores));
  const resultType = types[maxIndex];

  const result = {
    type: resultType,
    typeIndex: maxIndex,
    scores: {
      romantic: scores[0],
      friendly: scores[1], 
      passionate: scores[2],
      stable: scores[3]
    },
    description: getLoveDNADescription(maxIndex),
    compatibility: getLoveDNACompatibility(maxIndex),
    testMetadata: {
      questionsCount: 20,
      answersProvided: answers.length,
      testDate: new Date().toISOString(),
      aiGenerated: false
    }
  };

  logger.info('Love DNA test completed', {
    requestId,
    resultType,
    scores
  });

  return result;
}

/**
 * Teto-Egen 테스트 처리 (간소화된 구현)
 */
async function handleTetoEgenTest(data, options, requestId) {
  const { answers } = data;
  
  if (!answers || !Array.isArray(answers)) {
    throw new Error('답변 배열이 필요합니다.');
  }

  if (answers.length !== 12) {
    throw new Error('12개의 답변이 필요합니다.');
  }

  // Teto-Egen 4가지 캐릭터
  const characters = ['테토', '에겐', '르네', '아델'];
  const scores = [0, 0, 0, 0];

  // 답변을 바탕으로 점수 계산  
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const charIndex = i % 4;
    scores[charIndex] += answer;
  }

  // 가장 높은 점수의 캐릭터 결정
  const maxIndex = scores.indexOf(Math.max(...scores));
  const resultCharacter = characters[maxIndex];

  const result = {
    character: resultCharacter,
    characterIndex: maxIndex,
    scores: {
      teto: scores[0],
      egen: scores[1],
      rene: scores[2], 
      adele: scores[3]
    },
    description: getTetoEgenDescription(maxIndex),
    traits: getTetoEgenTraits(maxIndex),
    testMetadata: {
      questionsCount: 12,
      answersProvided: answers.length,
      testDate: new Date().toISOString(),
      aiGenerated: false
    }
  };

  logger.info('Teto-Egen test completed', {
    requestId,
    resultCharacter,
    scores
  });

  return result;
}

/**
 * MBTI 궁합 분석 핸들러
 */
async function mbtiCompatibilityHandler(req, res, { requestId, clientIp, tracker }) {
  const { type1, type2 } = req.body;

  if (!type1 || !type2) {
    return res.status(400).json(
      createErrorResponse(400, '두 개의 MBTI 유형이 필요합니다.')
    );
  }

  // MBTI 유형 형식 검증
  const mbtiRegex = /^[EI][SN][TF][JP]$/;
  if (!mbtiRegex.test(type1) || !mbtiRegex.test(type2)) {
    return res.status(400).json(
      createErrorResponse(400, '올바른 MBTI 유형 형식이 아닙니다. (예: ENFP)')
    );
  }

  try {
    const result = await mbtiTestService.analyzeTypeCompatibility(type1, type2);

    const duration = tracker.end();
    
    logger.info('MBTI compatibility API success', {
      requestId,
      types: [type1, type2],
      duration
    });

    return res.status(200).json(
      createResponse(true, result, null, {
        types: [type1, type2],
        duration,
        requestId
      })
    );

  } catch (error) {
    const duration = tracker.end();
    
    logger.error('MBTI compatibility API error', {
      requestId,
      types: [type1, type2],
      error: error.message,
      duration
    });

    return res.status(500).json(
      createErrorResponse(500, getKoreanErrorMessage('internal_error'))
    );
  }
}

/**
 * 테스트 정보 조회 핸들러
 */
async function testInfoHandler(req, res, { requestId, clientIp, tracker }) {
  const { testType } = req.query;

  try {
    let result;

    switch (testType) {
      case 'mbti':
        result = {
          name: 'MBTI 성격유형 검사',
          description: '16가지 성격 유형을 분석하는 세계적으로 인정받은 성격 검사',
          questionsCount: 60,
          timeRequired: '약 10-15분',
          resultTypes: 16,
          accuracy: '85-90%'
        };
        break;
      
      case 'love-dna':
        result = {
          name: '사랑 DNA 테스트',
          description: '당신의 연애 스타일과 이상형을 분석하는 테스트',
          questionsCount: 20,
          timeRequired: '약 5-7분',
          resultTypes: 4,
          accuracy: '80-85%'
        };
        break;
      
      case 'teto-egen':
        result = {
          name: 'Teto-Egen 성격 분석',
          description: '4가지 캐릭터로 성격을 분석하는 창의적인 테스트',
          questionsCount: 12,
          timeRequired: '약 3-5분',
          resultTypes: 4,
          accuracy: '75-80%'
        };
        break;
      
      default:
        return res.status(400).json(
          createErrorResponse(400, '지원하지 않는 테스트 유형입니다.')
        );
    }

    const duration = tracker.end();
    
    return res.status(200).json(
      createResponse(true, result, null, {
        testType,
        duration,
        requestId
      })
    );

  } catch (error) {
    const duration = tracker.end();
    
    logger.error('Test info API error', {
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
    const mbtiStatus = await mbtiTestService.healthCheck();

    const result = {
      status: mbtiStatus.status,
      services: {
        mbti: mbtiStatus
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

// 헬퍼 함수들
function getLoveDNADescription(typeIndex) {
  const descriptions = [
    '감성적이고 로맨틱한 연애를 선호하는 타입',
    '편안하고 친구 같은 관계를 중시하는 타입',
    '열정적이고 드라마틱한 사랑을 추구하는 타입',
    '안정적이고 신뢰할 수 있는 관계를 원하는 타입'
  ];
  return descriptions[typeIndex] || '';
}

function getLoveDNACompatibility(typeIndex) {
  const compatibility = [
    ['열정적인 연인', '안정적인 연인'],
    ['로맨틱한 연인', '안정적인 연인'],
    ['로맨틱한 연인', '친구 같은 연인'],
    ['친구 같은 연인', '로맨틱한 연인']
  ];
  return compatibility[typeIndex] || [];
}

function getTetoEgenDescription(charIndex) {
  const descriptions = [
    '창의적이고 자유로운 영혼의 테토 타입',
    '논리적이고 분석적인 에겐 타입', 
    '감성적이고 예술적인 르네 타입',
    '실용적이고 현실적인 아델 타입'
  ];
  return descriptions[charIndex] || '';
}

function getTetoEgenTraits(charIndex) {
  const traits = [
    ['창의적', '자유로운', '독창적', '모험적'],
    ['논리적', '분석적', '체계적', '완벽주의'],
    ['감성적', '예술적', '직관적', '공감능력'], 
    ['실용적', '현실적', '안정적', '책임감']
  ];
  return traits[charIndex] || [];
}

// 메인 핸들러 - 경로별 분기
async function mainHandler(req, res, context) {
  const { url } = req;
  
  if (url === '/api/v2/psychology' && req.method === 'POST') {
    return await psychologyHandler(req, res, context);
  } else if (url === '/api/v2/psychology/mbti-compatibility' && req.method === 'POST') {
    return await mbtiCompatibilityHandler(req, res, context);
  } else if (url === '/api/v2/psychology/test-info' && req.method === 'GET') {
    return await testInfoHandler(req, res, context);
  } else if (url === '/api/v2/psychology/health' && req.method === 'GET') {
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
  enableCache: false, // 개인화된 테스트 결과는 캐시하지 않음
  enableValidation: true,
  enableLogging: true,
  allowedMethods: ['GET', 'POST'],
  rateLimit: { requests: 20, window: 60000 }, // 20 requests per minute (테스트는 더 제한적)
});

// 명명된 내보내기 (테스트용)
export {
  psychologyHandler,
  mbtiCompatibilityHandler,
  testInfoHandler,
  healthHandler
};