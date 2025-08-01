/**
 * @fileoverview 실용도구 API 엔드포인트 - /api/v2/tools
 * @version 2.0.0
 * @author doha.kr Backend Team
 */

import { withMiddleware, createResponse, createErrorResponse, getKoreanErrorMessage } from '../core/middleware.js';
import { ValidationSchemas } from '../core/validation.js';
import { createLogger } from '../core/logger.js';

const logger = createLogger('tools-api');

/**
 * 메인 도구 API 핸들러
 */
async function toolsHandler(req, res, { requestId, clientIp, tracker }) {
  const { type, data = {}, options = {} } = req.body;

  if (!type) {
    return res.status(400).json(
      createErrorResponse(400, getKoreanErrorMessage('validation_failed'), {
        field: 'type',
        message: '도구 유형을 지정해주세요.'
      })
    );
  }

  try {
    let result;

    switch (type) {
      case 'bmi':
        result = await handleBMICalculator(data, options, requestId);
        break;
      
      case 'salary':
        result = await handleSalaryCalculator(data, options, requestId);
        break;
      
      case 'text-counter':
        result = await handleTextCounter(data, options, requestId);
        break;
      
      default:
        return res.status(400).json(
          createErrorResponse(400, '지원하지 않는 도구 유형입니다.', {
            supportedTypes: ['bmi', 'salary', 'text-counter']
          })
        );
    }

    const duration = tracker.end();
    
    logger.info('Tools API success', {
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
    
    logger.error('Tools API error', {
      requestId,
      type,
      error: error.message,
      duration
    });

    const statusCode = error.statusCode || 500;
    const message = getKoreanErrorMessage('internal_error');

    return res.status(statusCode).json(
      createErrorResponse(statusCode, message, {
        type,
        requestId
      })
    );
  }
}

/**
 * BMI 계산기 처리
 */
async function handleBMICalculator(data, options, requestId) {
  const validation = ValidationSchemas.bmiCalculator.validate(data);
  if (!validation.valid) {
    throw new Error(`BMI 계산 데이터 검증 실패: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  const { height, weight } = validation.data;
  
  // BMI 계산
  const heightInMeter = height / 100;
  const bmi = weight / (heightInMeter * heightInMeter);
  const roundedBMI = Math.round(bmi * 10) / 10;

  // BMI 범주 및 해석
  const { category, status, description, risks, recommendations } = getBMIAnalysis(roundedBMI);

  // 표준 체중 계산 (BMI 22 기준)
  const idealWeight = Math.round(22 * heightInMeter * heightInMeter * 10) / 10;
  const weightDifference = Math.round((weight - idealWeight) * 10) / 10;

  const result = {
    input: { height, weight },
    bmi: roundedBMI,
    category,
    status,
    description,
    analysis: {
      idealWeight,
      weightDifference,
      risks,
      recommendations
    },
    calculatedAt: new Date().toISOString()
  };

  logger.info('BMI calculation completed', {
    requestId,
    bmi: roundedBMI,
    category,
    status
  });

  return result;
}

/**
 * 연봉 계산기 처리 (한국 세법 기준)
 */
async function handleSalaryCalculator(data, options, requestId) {
  const { annualSalary, dependents = 1, isMarried = false, taxYear = 2025 } = data;

  if (!annualSalary || annualSalary <= 0 || annualSalary > 1000000000) {
    throw new Error('연봉은 1원 이상 10억원 이하여야 합니다.');
  }

  if (!Number.isInteger(dependents) || dependents < 0 || dependents > 20) {
    throw new Error('부양가족 수는 0명 이상 20명 이하의 정수여야 합니다.');
  }

  // 한국 세금 계산 (간소화)
  const taxes = calculateKoreanTax(annualSalary, dependents, isMarried);
  
  const result = {
    input: {
      annualSalary,
      dependents,
      isMarried,
      taxYear
    },
    breakdown: {
      grossSalary: annualSalary,
      totalDeductions: taxes.totalDeductions,
      taxableIncome: taxes.taxableIncome,
      incomeTax: taxes.incomeTax,
      localTax: taxes.localTax,
      nationalPension: taxes.nationalPension,
      healthInsurance: taxes.healthInsurance,
      employmentInsurance: taxes.employmentInsurance,
      totalTax: taxes.totalTax,
      netSalary: taxes.netSalary
    },
    monthly: {
      grossMonthly: Math.round(annualSalary / 12),
      netMonthly: Math.round(taxes.netSalary / 12),
      deductionsMonthly: Math.round(taxes.totalTax / 12)
    },
    taxRate: Math.round((taxes.totalTax / annualSalary) * 100 * 10) / 10,
    calculatedAt: new Date().toISOString(),
    disclaimer: '이 계산은 추정치이며, 실제 세액과 다를 수 있습니다.'
  };

  logger.info('Salary calculation completed', {
    requestId,
    annualSalary,
    netSalary: taxes.netSalary,
    taxRate: result.taxRate
  });

  return result;
}

/**
 * 텍스트 카운터 처리
 */
async function handleTextCounter(data, options, requestId) {
  const { text } = data;

  if (typeof text !== 'string') {
    throw new Error('텍스트가 필요합니다.');
  }

  if (text.length > 100000) {
    throw new Error('텍스트는 10만자 이하여야 합니다.');
  }

  // 다양한 카운트 계산
  const analysis = analyzeText(text);
  
  const result = {
    input: {
      textLength: text.length,
      textPreview: text.length > 100 ? text.substring(0, 100) + '...' : text
    },
    counts: {
      characters: analysis.characters,
      charactersNoSpaces: analysis.charactersNoSpaces,
      words: analysis.words,
      sentences: analysis.sentences,
      paragraphs: analysis.paragraphs,
      lines: analysis.lines
    },
    korean: {
      koreanCharacters: analysis.koreanCharacters,
      englishCharacters: analysis.englishCharacters,
      numbers: analysis.numbers,
      punctuation: analysis.punctuation,
      koreanWords: analysis.koreanWords,
      englishWords: analysis.englishWords
    },
    statistics: {
      averageWordsPerSentence: analysis.averageWordsPerSentence,
      averageCharactersPerWord: analysis.averageCharactersPerWord,
      readingTimeMinutes: analysis.readingTimeMinutes
    },
    analyzedAt: new Date().toISOString()
  };

  logger.info('Text analysis completed', {
    requestId,
    textLength: text.length,
    words: analysis.words,
    koreanCharacters: analysis.koreanCharacters
  });

  return result;
}

/**
 * BMI 분석 함수
 */
function getBMIAnalysis(bmi) {
  let category, status, description, risks, recommendations;

  if (bmi < 18.5) {
    category = 'underweight';
    status = '저체중';
    description = '체중이 정상보다 낮습니다.';
    risks = ['영양실조 위험', '면역력 저하', '골밀도 감소'];
    recommendations = ['균형잡힌 식단 섭취', '근력 운동', '충분한 칼로리 섭취', '의사 상담'];
  } else if (bmi < 23) {
    category = 'normal';
    status = '정상체중';
    description = '건강한 체중입니다.';
    risks = ['현재 건강한 상태'];
    recommendations = ['현재 체중 유지', '규칙적인 운동', '균형잡힌 식단', '정기 건강검진'];
  } else if (bmi < 25) {
    category = 'overweight';
    status = '과체중';
    description = '체중이 정상보다 약간 높습니다.';
    risks = ['당뇨병 위험 증가', '고혈압 위험', '심혈관 질환 위험'];
    recommendations = ['체중 감량 (2-3kg)', '유산소 운동', '식단 조절', '생활습관 개선'];
  } else if (bmi < 30) {
    category = 'obese1';
    status = '경도비만';
    description = '비만 1단계입니다.';
    risks = ['당뇨병', '고혈압', '심혈관 질환', '관절 질환'];
    recommendations = ['체중 감량 (5-10%)', '전문의 상담', '운동 프로그램', '식단 관리'];
  } else if (bmi < 35) {
    category = 'obese2';
    status = '중등도비만';
    description = '비만 2단계입니다.';
    risks = ['대사증후군', '수면무호흡증', '골관절염', '우울증'];
    recommendations = ['적극적 체중 감량', '전문의 치료', '약물치료 고려', '생활습관 전면 개선'];
  } else {
    category = 'obese3';
    status = '고도비만';
    description = '비만 3단계입니다.';
    risks = ['생명 위험', '각종 만성질환', '수술 위험 증가', '기대수명 단축'];
    recommendations = ['즉시 전문의 상담', '수술적 치료 고려', '집중 관리 프로그램', '응급상황 대비'];
  }

  return { category, status, description, risks, recommendations };
}

/**
 * 한국 세금 계산 함수 (간소화)
 */
function calculateKoreanTax(annualSalary, dependents, isMarried) {
  // 근로소득공제
  let employmentDeduction = 0;
  if (annualSalary <= 5000000) {
    employmentDeduction = annualSalary * 0.7;
  } else if (annualSalary <= 15000000) {
    employmentDeduction = 3500000 + (annualSalary - 5000000) * 0.4;
  } else if (annualSalary <= 45000000) {
    employmentDeduction = 7500000 + (annualSalary - 15000000) * 0.15;
  } else if (annualSalary <= 100000000) {
    employmentDeduction = 12000000 + (annualSalary - 45000000) * 0.05;
  } else {
    employmentDeduction = 14750000 + (annualSalary - 100000000) * 0.02;
  }
  employmentDeduction = Math.min(employmentDeduction, 20000000);

  // 인적공제
  const personalDeduction = (dependents + 1) * 1500000; // 본인 + 부양가족
  const marriageDeduction = isMarried ? 500000 : 0;

  // 표준공제
  const standardDeduction = 1300000;

  const totalDeductions = employmentDeduction + personalDeduction + marriageDeduction + standardDeduction;
  const taxableIncome = Math.max(0, annualSalary - totalDeductions);

  // 소득세 계산 (간소화된 구간)
  let incomeTax = 0;
  if (taxableIncome <= 14000000) {
    incomeTax = taxableIncome * 0.06;
  } else if (taxableIncome <= 50000000) {
    incomeTax = 840000 + (taxableIncome - 14000000) * 0.15;
  } else if (taxableIncome <= 88000000) {
    incomeTax = 6240000 + (taxableIncome - 50000000) * 0.24;
  } else {
    incomeTax = 15360000 + (taxableIncome - 88000000) * 0.35;
  }

  // 지방소득세 (소득세의 10%)
  const localTax = incomeTax * 0.1;

  // 4대보험
  const nationalPension = Math.min(annualSalary * 0.045, 2340000); // 국민연금
  const healthInsurance = annualSalary * 0.0335; // 건강보험
  const employmentInsurance = annualSalary * 0.008; // 고용보험

  const totalTax = incomeTax + localTax + nationalPension + healthInsurance + employmentInsurance;
  const netSalary = annualSalary - totalTax;

  return {
    totalDeductions: Math.round(totalDeductions),
    taxableIncome: Math.round(taxableIncome),
    incomeTax: Math.round(incomeTax),
    localTax: Math.round(localTax),
    nationalPension: Math.round(nationalPension),
    healthInsurance: Math.round(healthInsurance),
    employmentInsurance: Math.round(employmentInsurance),
    totalTax: Math.round(totalTax),
    netSalary: Math.round(netSalary)
  };
}

/**
 * 텍스트 분석 함수
 */
function analyzeText(text) {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  
  // 단어 카운트
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  
  // 문장 카운트
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  
  // 단락 카운트
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
  
  // 줄 카운트
  const lines = text.split('\n').length;

  // 한글 문자 카운트
  const koreanCharacters = (text.match(/[가-힣]/g) || []).length;
  
  // 영문 문자 카운트
  const englishCharacters = (text.match(/[a-zA-Z]/g) || []).length;
  
  // 숫자 카운트
  const numbers = (text.match(/[0-9]/g) || []).length;
  
  // 구두점 카운트
  const punctuation = (text.match(/[^\w\s가-힣]/g) || []).length;

  // 한글 단어와 영문 단어 구분
  const koreanWords = (text.match(/[가-힣]+/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

  // 통계
  const averageWordsPerSentence = sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0;
  const averageCharactersPerWord = words > 0 ? Math.round((charactersNoSpaces / words) * 10) / 10 : 0;
  
  // 읽기 시간 (분당 200단어 기준)
  const readingTimeMinutes = Math.ceil(words / 200);

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    koreanCharacters,
    englishCharacters,
    numbers,
    punctuation,
    koreanWords,
    englishWords,
    averageWordsPerSentence,
    averageCharactersPerWord,
    readingTimeMinutes
  };
}

/**
 * 건강 상태 확인 핸들러
 */
async function healthHandler(req, res, { requestId, clientIp, tracker }) {
  try {
    const result = {
      status: 'healthy',
      services: {
        bmi: { status: 'healthy', service: 'bmi-calculator' },
        salary: { status: 'healthy', service: 'salary-calculator' },
        textCounter: { status: 'healthy', service: 'text-counter' }
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
  
  if (url === '/api/v2/tools' && req.method === 'POST') {
    return await toolsHandler(req, res, context);
  } else if (url === '/api/v2/tools/health' && req.method === 'GET') {
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
  enableCache: true, // 계산 결과는 캐시 가능
  enableValidation: true,
  enableLogging: true,
  allowedMethods: ['GET', 'POST'],
  rateLimit: { requests: 100, window: 60000 }, // 100 requests per minute
  cacheOptions: { ttl: 300000 } // 5분 캐시
});

// 명명된 내보내기 (테스트용)
export {
  toolsHandler,
  healthHandler
};