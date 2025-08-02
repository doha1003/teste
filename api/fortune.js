// Vercel 서버리스 함수 - 운세 API
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sanitizeInput, validateFortuneRequest, checkRateLimit } from './validation.js';
import { setCorsHeaders, validateRequest } from './cors-config.js';
import { serverLogger, withLogging } from './logging-middleware.js';

// Gemini API 초기화
// API 키 검증
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is not set');
}

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

async function handler(req, res) {
  // CORS 및 보안 헤더 설정
  setCorsHeaders(req, res);

  // 요청 검증 (OPTIONS 및 메소드 체크 포함)
  if (validateRequest(req, res, ['POST'])) {
    return;
  }

  const startTime = performance.now();
  const requestId = `fortune_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  serverLogger.info('Fortune API Request', {
    type: req.body?.type,
    hasData: !!req.body?.data,
    ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
    requestId
  });

  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || !genAI) {
      serverLogger.error('Gemini API key not configured', { requestId });
      return res.status(503).json({
        success: false,
        error: '운세 서비스가 일시적으로 이용할 수 없습니다. 관리자에게 문의해주세요.',
      });
    }

    // Get client IP for rate limiting
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

    // Check rate limit
    const rateLimitCheck = checkRateLimit(clientIp);
    if (!rateLimitCheck.allowed) {
      serverLogger.warn('Rate limit exceeded', { 
        clientIp, 
        requestId,
        retryAfter: rateLimitCheck.retryAfter
      });
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter: rateLimitCheck.retryAfter,
      });
    }

    // Validate request body
    if (!req.body || !req.body.type) {
      serverLogger.warn('Invalid request body', { requestId, body: req.body });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const { type, data, prompt, todayDate } = req.body;

    // Validate request based on type
    const validation = validateFortuneRequest(type, data || {});
    if (!validation.valid) {
      serverLogger.warn('Request validation failed', { 
        requestId, 
        type, 
        errors: validation.errors 
      });
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors,
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let aiPrompt = '';

    switch (type) {
      case 'daily':
        const { name, birthDate, gender, birthTime, manseryeok } = data;
        // Sanitize user inputs
        const safeName = sanitizeInput(name);
        const safeGender = gender === 'male' ? '남성' : '여성';
        // 클라이언트에서 보낸 날짜 사용, 없으면 서버 날짜
        const today =
          todayDate || new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
        aiPrompt = `
당신은 한국 최고의 사주 전문가입니다. 다음 정보를 바탕으로 오늘의 운세를 전문적으로 분석해주세요.

이름: ${safeName}
생년월일: ${birthDate}
성별: ${safeGender}
${birthTime ? `출생시간: ${birthTime}` : ''}
${manseryeok ? `만세력 사주: ${JSON.stringify(manseryeok).substring(0, 500)}` : ''}
오늘 날짜: ${today}

다음 형식으로 상세하게 답변해주세요:

종합운: [0-100점] [오늘의 전반적인 운세를 사주 관점에서 3-4문장으로 상세히 설명]
애정운: [0-100점] [연애운과 인간관계를 2-3문장으로 설명]
금전운: [0-100점] [재물운과 투자운을 2-3문장으로 설명]
건강운: [0-100점] [건강 상태와 주의사항을 2-3문장으로 설명]
직장운: [0-100점] [업무운과 승진운을 2-3문장으로 설명]

오늘의 조언: [오늘 하루를 위한 구체적인 행동 지침 2-3문장]
행운의 시간: [가장 운이 좋은 시간대]
행운의 방향: [길한 방향]
행운의 색상: [오늘의 행운색]
행운의 숫자: [1-45 사이 숫자 2개]
`;
        break;

      case 'zodiac':
        const { zodiac } = data;
        const zodiacKorean = {
          aries: '양자리',
          taurus: '황소자리',
          gemini: '쌍둥이자리',
          cancer: '게자리',
          leo: '사자자리',
          virgo: '처녀자리',
          libra: '천칭자리',
          scorpio: '전갈자리',
          sagittarius: '사수자리',
          capricorn: '염소자리',
          aquarius: '물병자리',
          pisces: '물고기자리',
        };
        const todayZodiac =
          todayDate || new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
        aiPrompt = `
당신은 전문 점성술사입니다. 오늘 ${todayZodiac} ${zodiacKorean[zodiac]}의 운세를 상세히 분석해주세요.

종합운: [오늘의 전체적인 운세를 3-4문장으로 상세히]
애정운: [0-100점] [연애운 2문장]
금전운: [0-100점] [재물운 2문장]
직장운: [0-100점] [업무운 2문장]
건강운: [0-100점] [건강운 2문장]

오늘의 조언: [구체적인 행동 지침 2-3문장]
행운의 숫자: [1-45 사이 숫자 2개]
행운의 색상: [색상명]
`;
        break;

      case 'saju':
        const sajuData = data;
        aiPrompt = `
당신은 한국의 사주명리학 전문가입니다. 다음 사주팔자를 분석해주세요.

${sajuData.yearPillar} ${sajuData.monthPillar} ${sajuData.dayPillar} ${sajuData.hourPillar}

다음 내용을 포함하여 전문적으로 분석해주세요:
1. 사주의 전체적인 특징과 기질
2. 오행의 균형과 용신
3. 재물운과 직업운
4. 연애운과 결혼운
5. 건강운과 주의사항
6. 대운의 흐름
7. 올해와 내년 운세
8. 인생 전반의 조언

각 항목을 2-3문장으로 상세히 설명해주세요.
`;
        break;

      case 'zodiac-animal':
        const { animal, animalName, animalHanja } = data;
        const todayAnimal =
          todayDate || new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
        aiPrompt = `
당신은 전문 운세가입니다. 오늘 ${todayAnimal} ${animalName}(${animalHanja})의 운세를 상세히 분석해주세요.

종합운: [오늘의 전체적인 운세를 3-4문장으로]
애정운: [0-100점] [연애운 2문장]
금전운: [0-100점] [재물운 2문장]
직장운: [0-100점] [업무운 2문장]
건강운: [0-100점] [건강운 2문장]

오늘의 조언: [구체적인 행동 지침 2-3문장]
행운의 숫자: [1-45 사이 숫자 2개]
행운의 색상: [색상명]

${animalName}의 특성과 2025년 을사년(뱀의 해) 에너지를 고려하여 분석해주세요.
`;
        break;

      case 'general':
        // 일반적인 프롬프트 처리
        aiPrompt = prompt || data.prompt || '';
        break;

      default:
        serverLogger.warn('Unsupported fortune type', { requestId, type });
        return res.status(400).json({
          success: false,
          error: `지원하지 않는 타입입니다: ${type}`,
        });
    }

    serverLogger.info('Generating AI content', { 
      requestId, 
      type, 
      promptLength: aiPrompt.length 
    });

    const aiStartTime = performance.now();
    
    // 타임아웃 설정 (25초, Vercel 함수 제한 고려)
    const timeoutMs = 25000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI 응답 타임아웃')), timeoutMs);
    });
    
    try {
      const result = await Promise.race([
        model.generateContent(aiPrompt),
        timeoutPromise
      ]);
      const response = await result.response;
      const text = response.text();
      const aiDuration = performance.now() - aiStartTime;

      serverLogger.info('AI content generated', { 
        requestId, 
        type, 
        responseLength: text.length,
        aiDuration: Math.round(aiDuration)
      });

      // 응답 파싱 - 각 타입별로 구조화된 JSON 반환
      let parsedData;
      if (type === 'general' || type === 'tarot') {
        parsedData = text;
      } else if (type === 'zodiac' || type === 'zodiac-animal') {
        parsedData = parseZodiacResponse(text);
      } else {
        parsedData = parseFortuneResponse(text, type);
      }

      const totalDuration = performance.now() - startTime;
      
      serverLogger.info('Fortune API Response', {
        requestId,
        type,
        success: true,
        totalDuration: Math.round(totalDuration),
        aiDuration: Math.round(aiDuration),
        responseSize: JSON.stringify(parsedData).length
      });

      res.status(200).json({
        success: true,
        data: parsedData,
        aiGenerated: true,
        date: todayDate || new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }),
      });
      
    } catch (aiError) {
      serverLogger.warn('AI generation timeout or error', {
        requestId,
        error: aiError.message,
        duration: Math.round(performance.now() - aiStartTime)
      });
      throw aiError; // 외부 catch로 전달
    }
  } catch (error) {
    const totalDuration = performance.now() - startTime;
    
    serverLogger.error('Fortune API Error', {
      requestId,
      type: req.body?.type,
      error: error.message,
      stack: error.stack,
      duration: Math.round(totalDuration)
    });

    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(500).json({
      success: false,
      error: 'AI 분석 중 오류가 발생했습니다.',
      ...(isDevelopment && { message: error.message }),
    });
  }
}

// 별자리/띠 운세 파싱
function parseZodiacResponse(text) {
  const lines = text.split('\n').filter((line) => line.trim());
  const result = {
    overall: '',
    scores: { love: 0, money: 0, work: 0, health: 0 },
    advice: '',
    luckyNumber: '',
    luckyColor: '',
  };

  lines.forEach((line) => {
    if (line.includes('종합운:')) {
      result.overall = line.replace(/종합운:?\s*/, '').trim();
    } else if (line.includes('애정운:')) {
      const match = line.match(/(\d+)/);
      if (match) result.scores.love = parseInt(match[1]);
      const desc = line.replace(/애정운:?\s*\[?\d+점\]?\s*/, '').trim();
      if (desc) result.loveDesc = desc;
    } else if (line.includes('금전운:')) {
      const match = line.match(/(\d+)/);
      if (match) result.scores.money = parseInt(match[1]);
      const desc = line.replace(/금전운:?\s*\[?\d+점\]?\s*/, '').trim();
      if (desc) result.moneyDesc = desc;
    } else if (line.includes('직장운:')) {
      const match = line.match(/(\d+)/);
      if (match) result.scores.work = parseInt(match[1]);
      const desc = line.replace(/직장운:?\s*\[?\d+점\]?\s*/, '').trim();
      if (desc) result.workDesc = desc;
    } else if (line.includes('건강운:')) {
      const match = line.match(/(\d+)/);
      if (match) result.scores.health = parseInt(match[1]);
      const desc = line.replace(/건강운:?\s*\[?\d+점\]?\s*/, '').trim();
      if (desc) result.healthDesc = desc;
    } else if (line.includes('오늘의 조언:')) {
      result.advice = line.replace(/오늘의 조언:?\s*/, '').trim();
    } else if (line.includes('행운의 숫자:')) {
      result.luckyNumber = line.replace(/행운의 숫자:?\s*/, '').trim();
    } else if (line.includes('행운의 색상:')) {
      result.luckyColor = line.replace(/행운의 색상:?\s*/, '').trim();
    }
  });

  return result;
}

// 로깅 미들웨어와 함께 내보내기
export default withLogging(handler, {
  enableRequestLogging: true,
  enablePerformanceLogging: true,
  enableErrorDetails: process.env.NODE_ENV === 'development'
});

function parseFortuneResponse(text, type) {
  const lines = text.split('\n').filter((line) => line.trim());
  const result = {};

  if (type === 'daily') {
    result.scores = {};
    result.descriptions = {};
    result.luck = {};

    lines.forEach((line) => {
      if (line.includes('종합운:')) {
        const match = line.match(/(\d+)점?\s*(.+)/);
        if (match) {
          result.scores.overall = parseInt(match[1]);
          result.descriptions.overall = match[2].trim();
        }
      } else if (line.includes('애정운:')) {
        const match = line.match(/(\d+)점?\s*(.+)/);
        if (match) {
          result.scores.love = parseInt(match[1]);
          result.descriptions.love = match[2].trim();
        }
      } else if (line.includes('금전운:')) {
        const match = line.match(/(\d+)점?\s*(.+)/);
        if (match) {
          result.scores.money = parseInt(match[1]);
          result.descriptions.money = match[2].trim();
        }
      } else if (line.includes('건강운:')) {
        const match = line.match(/(\d+)점?\s*(.+)/);
        if (match) {
          result.scores.health = parseInt(match[1]);
          result.descriptions.health = match[2].trim();
        }
      } else if (line.includes('직장운:')) {
        const match = line.match(/(\d+)점?\s*(.+)/);
        if (match) {
          result.scores.work = parseInt(match[1]);
          result.descriptions.work = match[2].trim();
        }
      } else if (line.includes('오늘의 조언:')) {
        result.luck.caution = line.replace('오늘의 조언:', '').trim();
      } else if (line.includes('행운의 시간:')) {
        result.luck.time = line.replace('행운의 시간:', '').trim();
      } else if (line.includes('행운의 방향:')) {
        result.luck.direction = line.replace('행운의 방향:', '').trim();
      } else if (line.includes('행운의 색상:')) {
        result.luck.color = line.replace('행운의 색상:', '').trim();
      } else if (line.includes('행운의 숫자:')) {
        result.luck.numbers = line.replace('행운의 숫자:', '').trim();
      }
    });
  }

  return result;
}
