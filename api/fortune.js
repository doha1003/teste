// Vercel 서버리스 함수 - 운세 API (통합 버전)
import { GoogleGenerativeAI } from '@google/generative-ai';

// 간단한 로그 함수
const log = (message, data = {}) => {
  console.log(JSON.stringify({ 
    timestamp: new Date().toISOString(), 
    message, 
    ...data 
  }));
};

// API 키 검증
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is not set');
}

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// 간단한 캐시 (메모리 기반)
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30분

// 캐시 정리
function cleanCache() {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expireAt) {
      cache.delete(key);
    }
  }
}

// 캐시 키 생성
function getCacheKey(type, data) {
  return `${type}:${JSON.stringify(data)}`;
}

// Rate limiting (간단한 구현)
const rateLimits = new Map();
const RATE_LIMIT = 60; // 분당 요청 수
const RATE_WINDOW = 60 * 1000; // 1분

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimits.get(ip) || [];
  
  // 1분 이전 요청 제거
  const validRequests = userRequests.filter(time => now - time < RATE_WINDOW);
  
  if (validRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  validRequests.push(now);
  rateLimits.set(ip, validRequests);
  
  return true;
}

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  try {
    // API 키 확인
    if (!process.env.GEMINI_API_KEY || !genAI) {
      log('API key not configured', { requestId });
      return res.status(503).json({
        success: false,
        error: '운세 서비스가 일시적으로 이용할 수 없습니다.'
      });
    }

    // Rate limiting
    const clientIp = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      log('Rate limit exceeded', { clientIp, requestId });
      return res.status(429).json({
        success: false,
        error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
      });
    }

    // 요청 검증
    if (!req.body || !req.body.type) {
      log('Invalid request body', { requestId, body: req.body });
      return res.status(400).json({
        success: false,
        error: '요청 데이터가 올바르지 않습니다.'
      });
    }

    const { type, data, prompt } = req.body;
    
    log('Fortune API request', { requestId, type, hasData: !!data });

    // 캐시 확인
    cleanCache(); // 만료된 캐시 정리
    const cacheKey = getCacheKey(type, data);
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult && Date.now() < cachedResult.expireAt) {
      log('Cache hit', { requestId, type });
      return res.status(200).json({
        ...cachedResult.data,
        cached: true
      });
    }

    // Gemini AI 호출
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    });

    // 프롬프트 생성
    const aiPrompt = generatePrompt(type, data);
    if (!aiPrompt) {
      log('Unsupported fortune type', { requestId, type });
      return res.status(400).json({
        success: false,
        error: `지원하지 않는 운세 타입입니다: ${type}`
      });
    }

    log('Calling Gemini API', { requestId, type, promptLength: aiPrompt.length });

    // AI 응답 생성 (10초 타임아웃)
    const result = await Promise.race([
      model.generateContent(aiPrompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('타임아웃')), 10000)
      )
    ]);

    const response = await result.response;
    const text = response.text();
    
    log('AI response generated', { 
      requestId, 
      type, 
      responseLength: text.length,
      duration: Date.now() - startTime 
    });

    // 응답 파싱
    let parsedData;
    if (type === 'general' || type === 'tarot') {
      parsedData = text;
    } else {
      parsedData = parseFortuneResponse(text, type);
    }

    // 응답 데이터
    const responseData = {
      success: true,
      data: parsedData,
      aiGenerated: true,
      date: new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }),
      requestId
    };

    // 캐시에 저장
    cache.set(cacheKey, {
      data: responseData,
      expireAt: Date.now() + CACHE_TTL
    });

    log('Fortune API success', { 
      requestId, 
      type, 
      totalDuration: Date.now() - startTime 
    });

    return res.status(200).json(responseData);

  } catch (error) {
    log('Fortune API error', { 
      requestId, 
      type: req.body?.type,
      error: error.message,
      duration: Date.now() - startTime 
    });

    // Fallback 응답 제공 (AI 실패 시)
    if (error.message.includes('타임아웃') || error.message.includes('fetch')) {
      const fallbackData = {
        success: true,
        data: generateFallbackResponse(type, data),
        aiGenerated: false,
        fallback: true,
        message: '운세 서비스가 지연되어 기본 운세를 제공합니다.',
        date: new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }),
        requestId
      };

      // 짧은 시간 캐시 (5분)
      cache.set(cacheKey, {
        data: fallbackData,
        expireAt: Date.now() + (5 * 60 * 1000)
      });

      log('Fallback response provided', { requestId, type });
      return res.status(200).json(fallbackData);
    }

    // 기타 오류
    return res.status(500).json({
      success: false,
      error: 'AI 분석 중 오류가 발생했습니다.',
      requestId,
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message 
      })
    });
  }
}

// 프롬프트 생성 함수
function generatePrompt(type, data) {
  const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
  
  switch (type) {
    case 'daily':
      const { name, birthDate, gender } = data;
      const safeName = name ? name.substring(0, 10) : '익명';
      const safeGender = gender === 'male' ? '남성' : '여성';
      
      return `한국 사주 전문가로서 ${safeName}님의 오늘 ${today} 운세를 분석해주세요.

생년월일: ${birthDate}
성별: ${safeGender}

다음 형식으로 답변해주세요:
종합운: [0-100점] [3문장]
애정운: [0-100점] [2문장]
금전운: [0-100점] [2문장]
건강운: [0-100점] [2문장]
직장운: [0-100점] [2문장]
오늘의 조언: [2문장]
행운의 시간: [시간대]
행운의 방향: [방향]
행운의 색상: [색상]
행운의 숫자: [숫자 2개]`;

    case 'zodiac':
      const zodiacKorean = {
        aries: '양자리', taurus: '황소자리', gemini: '쌍둥이자리',
        cancer: '게자리', leo: '사자자리', virgo: '처녀자리',
        libra: '천칭자리', scorpio: '전갈자리', sagittarius: '사수자리',
        capricorn: '염소자리', aquarius: '물병자리', pisces: '물고기자리'
      };
      
      return `전문 점성술사로서 오늘 ${today} ${zodiacKorean[data.zodiac]}의 운세를 분석해주세요.

종합운: [3문장]
애정운: [0-100점] [2문장]
금전운: [0-100점] [2문장]
직장운: [0-100점] [2문장]
건강운: [0-100점] [2문장]
오늘의 조언: [2문장]
행운의 숫자: [숫자 2개]
행운의 색상: [색상]`;

    case 'saju':
      return `한국 사주명리학 전문가로서 다음 사주팔자를 분석해주세요.

년주: ${data.yearPillar}
월주: ${data.monthPillar}
일주: ${data.dayPillar}
시주: ${data.hourPillar}

1. 전체 특징 [2문장]
2. 오행 균형 [2문장]
3. 재물운 [2문장]
4. 연애운 [2문장]
5. 건강운 [2문장]
6. 대운 흐름 [2문장]
7. 올해 운세 [2문장]
8. 인생 조언 [2문장]`;

    case 'general':
    case 'tarot':
      return data.prompt || '오늘의 운세를 알려주세요.';

    default:
      return null;
  }
}

// 응답 파싱 함수
function parseFortuneResponse(text, type) {
  if (type === 'general' || type === 'tarot') {
    return text;
  }

  const result = {
    scores: {},
    descriptions: {},
    luck: {}
  };

  // 정규식 패턴으로 파싱
  const patterns = {
    overall: /종합운:?\s*\[?(\d+)점?\]?\s*(.+?)(?=애정운|$)/s,
    love: /애정운:?\s*\[?(\d+)점?\]?\s*(.+?)(?=금전운|$)/s,
    money: /금전운:?\s*\[?(\d+)점?\]?\s*(.+?)(?=건강운|직장운|$)/s,
    health: /건강운:?\s*\[?(\d+)점?\]?\s*(.+?)(?=직장운|오늘의|$)/s,
    work: /직장운:?\s*\[?(\d+)점?\]?\s*(.+?)(?=오늘의|$)/s,
    advice: /오늘의 조언:?\s*(.+?)(?=행운의|$)/s,
    time: /행운의 시간:?\s*(.+?)(?=행운의|$)/s,
    direction: /행운의 방향:?\s*(.+?)(?=행운의|$)/s,
    color: /행운의 색상:?\s*(.+?)(?=행운의|$)/s,
    numbers: /행운의 숫자:?\s*(.+?)$/s
  };

  // 각 패턴 매치
  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = text.match(pattern);
    if (match) {
      if (['overall', 'love', 'money', 'health', 'work'].includes(key) && match[1]) {
        result.scores[key] = parseInt(match[1]) || 0;
        result.descriptions[key] = match[2] ? match[2].trim() : '';
      } else if (['advice', 'time', 'direction', 'color', 'numbers'].includes(key)) {
        result.luck[key] = match[1] ? match[1].trim() : '';
      }
    }
  });

  return result;
}

// Fallback 응답 생성 함수
function generateFallbackResponse(type, data) {
  const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
  const hour = new Date().getHours();
  
  const timeAdvice = hour < 12 ? '오전 시간을 잘 활용하세요.' : 
                    hour < 18 ? '오후에도 좋은 기운이 계속됩니다.' : 
                    '저녁 시간을 편안하게 보내세요.';

  if (type === 'daily') {
    const baseScore = 70 + Math.floor(Math.random() * 20);
    
    return {
      scores: {
        overall: baseScore,
        love: baseScore + Math.floor(Math.random() * 10) - 5,
        money: baseScore + Math.floor(Math.random() * 10) - 5,
        health: baseScore + Math.floor(Math.random() * 10) - 5,
        work: baseScore + Math.floor(Math.random() * 10) - 5
      },
      descriptions: {
        overall: `오늘은 전반적으로 안정적인 하루가 될 것 같습니다. ${timeAdvice}`,
        love: '인간관계에서 따뜻한 소통이 이루어질 것 같습니다.',
        money: '금전적으로는 신중한 판단이 필요한 시기입니다.',
        health: '규칙적인 생활 패턴을 유지하며 건강 관리에 신경쓰세요.',
        work: '업무에 집중할 수 있는 좋은 날입니다.'
      },
      luck: {
        time: hour < 12 ? '오전 10-12시' : hour < 18 ? '오후 2-4시' : '저녁 7-9시',
        direction: ['동쪽', '서쪽', '남쪽', '북쪽'][Math.floor(Math.random() * 4)],
        color: ['파란색', '빨간색', '노란색', '초록색'][Math.floor(Math.random() * 4)],
        numbers: `${Math.floor(Math.random() * 45) + 1}, ${Math.floor(Math.random() * 45) + 1}`,
        advice: timeAdvice
      }
    };
  }
  
  return `오늘은 전반적으로 안정적이고 평화로운 하루가 될 것 같습니다. ${timeAdvice} 새로운 시작보다는 현재 상황을 정리하고 미래를 준비하는 시간으로 활용해보세요.`;
}

