// Vercel 서버리스 함수 - 운세 API (최적화 버전)
import { GoogleGenerativeAI } from '@google/generative-ai';
import { performance } from 'node:perf_hooks';
import { sanitizeInput, validateFortuneRequest, checkRateLimit } from './validation.js';
import { setCorsHeaders, validateRequest } from './cors-config.js';
import { serverLogger, withLogging } from './logging-middleware.js';
import { getCache } from './cache-manager.js';

// Gemini API 초기화 및 캐시 설정
// API 키 검증
if (!process.env.GEMINI_API_KEY) {
  // Always log missing API key errors
  console.error('GEMINI_API_KEY environment variable is not set');
}

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// 캐시 인스턴스 초기화
const fortuneCache = getCache('fortune', {
  maxSize: 500,
  defaultTtl: 1800000, // 30분
  enableCompression: true,
});

// 프롬프트 최적화를 위한 템플릿 캐시
const promptTemplates = new Map();

// Cold start 최적화를 위한 전역 변수
let initTime = Date.now();
let requestCount = 0;
let lastOptimization = 0;

// Gemini 모델 인스턴스 캐싱 (콜드 스타트 최적화)
let modelInstance = null;
let modelPromise = null;

function getModel() {
  if (!modelInstance && genAI) {
    // 모델 인스턴스가 없으면 비동기로 초기화
    if (!modelPromise) {
      modelPromise = initializeModel();
    }
    return modelPromise;
  }
  return Promise.resolve(modelInstance);
}

async function initializeModel() {
  try {
    if (!genAI) {
      throw new Error('Gemini AI not available');
    }

    modelInstance = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    console.log('Gemini model initialized successfully');
    return modelInstance;
  } catch (error) {
    console.error('Model initialization failed:', error);
    modelPromise = null; // 실패시 재시도 가능하도록 리셋
    throw error;
  }
}

// 주기적 최적화 함수
function performPeriodicOptimization() {
  const now = Date.now();
  if (now - lastOptimization > 300000) {
    // 5분마다
    lastOptimization = now;

    // 메모리 사용량 체크 및 캐시 정리
    const memUsage = process.memoryUsage();
    if (memUsage.heapUsed > 100 * 1024 * 1024) {
      // 100MB 초과시
      fortuneCache.clear();
      promptTemplates.clear();

      // 강제 가비지 컬렉션 (가능한 경우)
      if (global.gc) {
        global.gc();
      }
    }
  }
}

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
    requestId,
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
        retryAfter: rateLimitCheck.retryAfter,
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
        errors: validation.errors,
      });
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors,
      });
    }

    // 캐시 키 생성 (사용자 데이터 기반)
    const cacheKeyData = {
      type,
      data: sanitizeDataForCache(data),
      date: todayDate || new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }),
    };

    // 캐시에서 조회 시도
    const cacheKey = fortuneCache.generateKey('fortune', cacheKeyData);
    const cachedResult = fortuneCache.get(cacheKey);

    if (cachedResult) {
      const totalDuration = performance.now() - startTime;

      serverLogger.info('Fortune API Cache Hit', {
        requestId,
        type,
        totalDuration: Math.round(totalDuration),
        cached: true,
      });

      return res.status(200).json({
        ...cachedResult.result,
        cached: true,
        cacheAge: Date.now() - cachedResult.cachedAt,
      });
    }

    const model = getModel();
    if (!model) {
      throw new Error('AI 모델 초기화 실패');
    }

    let aiPrompt = getOptimizedPrompt(type, data, todayDate);
    if (!aiPrompt) {
      serverLogger.warn('Unsupported fortune type', { requestId, type });
      return res.status(400).json({
        success: false,
        error: `지원하지 않는 타입입니다: ${type}`,
      });
    }

    serverLogger.info('Generating AI content', {
      requestId,
      type,
      promptLength: aiPrompt.length,
    });

    const aiStartTime = performance.now();

    // 최적화된 타임아웃 설정 (10초로 단축)
    const timeoutMs = 10000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI 응답 타임아웃')), timeoutMs);
    });

    try {
      // 병렬 처리 최적화
      const [result] = await Promise.allSettled([
        Promise.race([model.generateContent(aiPrompt), timeoutPromise]),
      ]);

      if (result.status === 'rejected') {
        throw result.reason;
      }

      const response = await result.value.response;
      const text = response.text();
      const aiDuration = performance.now() - aiStartTime;

      serverLogger.info('AI content generated', {
        requestId,
        type,
        responseLength: text.length,
        aiDuration: Math.round(aiDuration),
      });

      // 최적화된 응답 파싱
      let parsedData;
      const parseStartTime = performance.now();

      if (type === 'general' || type === 'tarot') {
        parsedData = text;
      } else if (type === 'zodiac' || type === 'zodiac-animal') {
        parsedData = parseZodiacResponseOptimized(text);
      } else {
        parsedData = parseFortuneResponseOptimized(text, type);
      }

      const parseDuration = performance.now() - parseStartTime;
      const totalDuration = performance.now() - startTime;

      // 성공한 결과를 캐시에 저장
      const responseData = {
        success: true,
        data: parsedData,
        aiGenerated: true,
        date: todayDate || new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }),
      };

      // 30분 캐시 (같은 사용자 같은 날 같은 타입은 같은 결과)
      fortuneCache.set(cacheKey, { result: responseData }, 1800000);

      serverLogger.info('Fortune API Response', {
        requestId,
        type,
        success: true,
        totalDuration: Math.round(totalDuration),
        aiDuration: Math.round(aiDuration),
        parseDuration: Math.round(parseDuration),
        responseSize: JSON.stringify(parsedData).length,
        cached: false,
      });

      res.status(200).json(responseData);
    } catch (aiError) {
      const aiDuration = performance.now() - aiStartTime;

      // 타임아웃 또는 네트워크 오류에 대한 fallback 응답
      if (aiError.message === 'AI 응답 타임아웃' || aiError.message.includes('fetch')) {
        serverLogger.warn('AI timeout - using fallback response', {
          requestId,
          error: aiError.message,
          duration: Math.round(aiDuration),
        });

        // 최적화된 fallback 응답 제공
        const fallbackResponse = generateOptimizedFallbackResponse(type, data);

        const totalDuration = performance.now() - startTime;

        serverLogger.info('Fortune API Fallback Response', {
          requestId,
          type,
          success: true,
          totalDuration: Math.round(totalDuration),
          aiDuration: Math.round(aiDuration),
          fallback: true,
        });

        const fallbackData = {
          success: true,
          data: fallbackResponse,
          aiGenerated: false,
          fallback: true,
          message: '운세 서비스가 지연되어 기본 운세를 제공합니다.',
          date: todayDate || new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }),
        };

        // fallback 응답도 짧은 시간 캐시 (5분)
        fortuneCache.set(cacheKey, { result: fallbackData }, 300000);

        return res.status(200).json(fallbackData);
      }

      serverLogger.warn('AI generation error', {
        requestId,
        error: aiError.message,
        duration: Math.round(aiDuration),
      });
      throw aiError; // 다른 오류는 외부 catch로 전달
    }
  } catch (error) {
    const totalDuration = performance.now() - startTime;

    serverLogger.error('Fortune API Error', {
      requestId,
      type: req.body?.type,
      error: error.message,
      stack: error.stack,
      duration: Math.round(totalDuration),
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

// 데이터 캐시용 정리 함수
function sanitizeDataForCache(data) {
  if (!data || typeof data !== 'object') return data;

  // 민감한 정보 제거하고 캐시 키 생성용으로만 사용
  const sanitized = { ...data };

  // 개인정보는 해시화하거나 제거
  if (sanitized.name) {
    sanitized.nameHash = sanitized.name.length + '_' + sanitized.name.charAt(0);
    delete sanitized.name;
  }

  return sanitized;
}

// 최적화된 프롬프트 생성
function getOptimizedPrompt(type, data, todayDate) {
  const templateKey = `${type}_${JSON.stringify(data).length > 100 ? 'detailed' : 'simple'}`;

  if (promptTemplates.has(templateKey)) {
    const template = promptTemplates.get(templateKey);
    return template(data, todayDate);
  }

  let template;

  switch (type) {
    case 'daily':
      template = (data, todayDate) => {
        const { name, birthDate, gender, birthTime, manseryeok } = data;
        const safeName = sanitizeInput(name);
        const safeGender = gender === 'male' ? '남성' : '여성';
        const today =
          todayDate || new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });

        return `한국 사주 전문가로서 오늘의 운세를 분석해주세요.

이름: ${safeName}
생년월일: ${birthDate}
성별: ${safeGender}
${birthTime ? `출생시간: ${birthTime}` : ''}
${manseryeok ? `만세력: ${JSON.stringify(manseryeok).substring(0, 300)}` : ''}
오늘: ${today}

다음 형식으로 답변:
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
      };
      break;

    case 'zodiac':
      template = (data, todayDate) => {
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
        const today =
          todayDate || new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });

        return `전문 점성술사로서 오늘 ${today} ${zodiacKorean[zodiac]}의 운세를 분석해주세요.

종합운: [3문장]
애정운: [0-100점] [2문장]
금전운: [0-100점] [2문장]
직장운: [0-100점] [2문장]
건강운: [0-100점] [2문장]
오늘의 조언: [2문장]
행운의 숫자: [숫자 2개]
행운의 색상: [색상]`;
      };
      break;

    case 'zodiac-animal':
      template = (data, todayDate) => {
        const { animalName, animalHanja } = data;
        const today =
          todayDate || new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });

        return `전문 운세가로서 오늘 ${today} ${animalName}(${animalHanja})의 운세를 분석해주세요.

종합운: [3문장]
애정운: [0-100점] [2문장]
금전운: [0-100점] [2문장]
직장운: [0-100점] [2문장]
건강운: [0-100점] [2문장]
오늘의 조언: [2문장]
행운의 숫자: [숫자 2개]
행운의 색상: [색상]`;
      };
      break;

    case 'saju':
      template = (data, todayDate) => {
        return `한국 사주명리학 전문가로서 사주팔자를 분석해주세요.

${data.yearPillar} ${data.monthPillar} ${data.dayPillar} ${data.hourPillar}

1. 전체 특징 [2문장]
2. 오행 균형 [2문장]
3. 재물운 [2문장]
4. 연애운 [2문장]
5. 건강운 [2문장]
6. 대운 흐름 [2문장]
7. 올해 운세 [2문장]
8. 인생 조언 [2문장]`;
      };
      break;

    default:
      return null;
  }

  promptTemplates.set(templateKey, template);
  return template(data, todayDate);
}

// 최적화된 별자리/띠 운세 파싱
function parseZodiacResponseOptimized(text) {
  // 정규식 기반 최적화된 파싱
  const result = {
    overall: '',
    scores: { love: 0, money: 0, work: 0, health: 0 },
    advice: '',
    luckyNumber: '',
    luckyColor: '',
  };

  // 한 번의 순회로 모든 패턴 매치
  const patterns = {
    overall: /종합운:?\s*(.+?)(?=\n|애정운|$)/s,
    love: /애정운:?\s*\[?(\d+)점?\]?\s*(.+?)(?=\n|금전운|$)/s,
    money: /금전운:?\s*\[?(\d+)점?\]?\s*(.+?)(?=\n|직장운|$)/s,
    work: /직장운:?\s*\[?(\d+)점?\]?\s*(.+?)(?=\n|건강운|$)/s,
    health: /건강운:?\s*\[?(\d+)점?\]?\s*(.+?)(?=\n|오늘의|$)/s,
    advice: /오늘의 조언:?\s*(.+?)(?=\n|행운의|$)/s,
    luckyNumber: /행운의 숫자:?\s*(.+?)(?=\n|행운의 색상|$)/s,
    luckyColor: /행운의 색상:?\s*(.+?)(?=\n|$)/s,
  };

  // 종합운
  const overallMatch = text.match(patterns.overall);
  if (overallMatch) result.overall = overallMatch[1].trim();

  // 애정운
  const loveMatch = text.match(patterns.love);
  if (loveMatch) {
    result.scores.love = parseInt(loveMatch[1]) || 0;
    result.loveDesc = loveMatch[2].trim();
  }

  // 금전운
  const moneyMatch = text.match(patterns.money);
  if (moneyMatch) {
    result.scores.money = parseInt(moneyMatch[1]) || 0;
    result.moneyDesc = moneyMatch[2].trim();
  }

  // 직장운
  const workMatch = text.match(patterns.work);
  if (workMatch) {
    result.scores.work = parseInt(workMatch[1]) || 0;
    result.workDesc = workMatch[2].trim();
  }

  // 건강운
  const healthMatch = text.match(patterns.health);
  if (healthMatch) {
    result.scores.health = parseInt(healthMatch[1]) || 0;
    result.healthDesc = healthMatch[2].trim();
  }

  // 조언
  const adviceMatch = text.match(patterns.advice);
  if (adviceMatch) result.advice = adviceMatch[1].trim();

  // 행운의 숫자
  const numberMatch = text.match(patterns.luckyNumber);
  if (numberMatch) result.luckyNumber = numberMatch[1].trim();

  // 행운의 색상
  const colorMatch = text.match(patterns.luckyColor);
  if (colorMatch) result.luckyColor = colorMatch[1].trim();

  return result;
}

// 최적화된 일반 운세 파싱
function parseFortuneResponseOptimized(text, type) {
  if (type !== 'daily') {
    // 기존 로직 유지
    return parseFortuneResponse(text, type);
  }

  const result = {
    scores: {},
    descriptions: {},
    luck: {},
  };

  // 정규식 패턴 최적화
  const patterns = {
    overall: /종합운:?\s*\[?(\d+)점?\]?\s*(.+?)(?=\n|애정운|$)/s,
    love: /애정운:?\s*\[?(\d+)점?\]?\s*(.+?)(?=\n|금전운|$)/s,
    money: /금전운:?\s*\[?(\d+)점?\]?\s*(.+?)(?=\n|건강운|$)/s,
    health: /건강운:?\s*\[?(\d+)점?\]?\s*(.+?)(?=\n|직장운|$)/s,
    work: /직장운:?\s*\[?(\d+)점?\]?\s*(.+?)(?=\n|오늘의|$)/s,
    advice: /오늘의 조언:?\s*(.+?)(?=\n|행운의|$)/s,
    time: /행운의 시간:?\s*(.+?)(?=\n|행운의 방향|$)/s,
    direction: /행운의 방향:?\s*(.+?)(?=\n|행운의 색상|$)/s,
    color: /행운의 색상:?\s*(.+?)(?=\n|행운의 숫자|$)/s,
    numbers: /행운의 숫자:?\s*(.+?)(?=\n|$)/s,
  };

  // 병렬 매칭 처리
  const matches = {};
  Object.entries(patterns).forEach(([key, pattern]) => {
    matches[key] = text.match(pattern);
  });

  // 결과 할당
  if (matches.overall) {
    result.scores.overall = parseInt(matches.overall[1]) || 0;
    result.descriptions.overall = matches.overall[2].trim();
  }
  if (matches.love) {
    result.scores.love = parseInt(matches.love[1]) || 0;
    result.descriptions.love = matches.love[2].trim();
  }
  if (matches.money) {
    result.scores.money = parseInt(matches.money[1]) || 0;
    result.descriptions.money = matches.money[2].trim();
  }
  if (matches.health) {
    result.scores.health = parseInt(matches.health[1]) || 0;
    result.descriptions.health = matches.health[2].trim();
  }
  if (matches.work) {
    result.scores.work = parseInt(matches.work[1]) || 0;
    result.descriptions.work = matches.work[2].trim();
  }
  if (matches.advice) result.luck.caution = matches.advice[1].trim();
  if (matches.time) result.luck.time = matches.time[1].trim();
  if (matches.direction) result.luck.direction = matches.direction[1].trim();
  if (matches.color) result.luck.color = matches.color[1].trim();
  if (matches.numbers) result.luck.numbers = matches.numbers[1].trim();

  return result;
}

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

function generateOptimizedFallbackResponse(type, data) {
  // 사용자 데이터 기반 개인화된 fallback
  const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
  const hour = new Date().getHours();

  // 시간대별 다른 조언
  const timeBasedAdvice = {
    morning: '아침 일찍 시작하는 하루, 긍정적인 에너지로 시작해보세요.',
    afternoon: '오후 시간, 차분하게 집중력을 유지하며 진행하세요.',
    evening: '저녁 시간, 하루를 마무리하며 내일을 준비하는 시간입니다.',
  };

  const timeType = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  if (type === 'daily') {
    const baseScore = 70 + Math.floor(Math.random() * 20); // 70-89 랜덤

    return {
      scores: {
        overall: baseScore,
        love: baseScore + Math.floor(Math.random() * 10) - 5,
        money: baseScore + Math.floor(Math.random() * 10) - 5,
        health: baseScore + Math.floor(Math.random() * 10) - 5,
        work: baseScore + Math.floor(Math.random() * 10) - 5,
      },
      descriptions: {
        overall: `오늘은 전반적으로 안정적인 하루가 될 것 같습니다. ${timeBasedAdvice[timeType]}`,
        love: '인간관계에서 따뜻한 소통이 이루어질 것 같습니다.',
        money: '금전적으로는 신중한 판단이 필요한 시기입니다.',
        health: '규칙적인 생활 패턴을 유지하며 건강 관리에 신경쓰세요.',
        work: '업무에 집중할 수 있는 좋은 날입니다.',
      },
      luck: {
        time: hour < 12 ? '오전 10-12시' : hour < 18 ? '오후 2-4시' : '저녁 7-9시',
        direction: ['동쪽', '서쪽', '남쪽', '북쪽'][Math.floor(Math.random() * 4)],
        color: ['파란색', '빨간색', '노란색', '초록색'][Math.floor(Math.random() * 4)],
        numbers: `${Math.floor(Math.random() * 45) + 1}, ${Math.floor(Math.random() * 45) + 1}`,
        caution: timeBasedAdvice[timeType],
      },
    };
  } else if (type === 'zodiac' || type === 'zodiac-animal') {
    return {
      overall: `오늘은 차분하고 안정적인 하루가 될 것 같습니다. ${timeBasedAdvice[timeType]}`,
      scores: {
        love: 70 + Math.floor(Math.random() * 15),
        money: 70 + Math.floor(Math.random() * 15),
        work: 70 + Math.floor(Math.random() * 15),
        health: 70 + Math.floor(Math.random() * 15),
      },
      loveDesc: '소중한 사람들과 따뜻한 시간을 보내보세요.',
      moneyDesc: '계획적인 소비가 도움이 될 것 같습니다.',
      workDesc: '차근차근 진행하면 좋은 결과를 얻을 수 있습니다.',
      healthDesc: '규칙적인 생활과 충분한 휴식이 필요합니다.',
      advice: timeBasedAdvice[timeType],
      luckyNumber: `${Math.floor(Math.random() * 45) + 1}, ${Math.floor(Math.random() * 45) + 1}`,
      luckyColor: ['녹색', '파란색', '빨간색', '노란색'][Math.floor(Math.random() * 4)],
    };
  } else {
    return `오늘은 전반적으로 안정적이고 평화로운 하루가 될 것 같습니다. ${timeBasedAdvice[timeType]} 새로운 시작보다는 현재 상황을 정리하고 미래를 준비하는 시간으로 활용해보세요.`;
  }
}

// 로깅 미들웨어와 함께 내보내기
export default withLogging(handler, {
  enableRequestLogging: true,
  enablePerformanceLogging: true,
  enableErrorDetails: process.env.NODE_ENV === 'development',
});
