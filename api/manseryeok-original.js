// Manseryeok API endpoint for Vercel
// This file should be in /api/manseryeok.js for Vercel to recognize it

// 만세력 데이터를 동적으로 로드
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { setCorsHeaders, validateRequest } from './cors-config.js';
import { serverLogger, withLogging } from './logging-middleware.js';
import { performance } from 'perf_hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let manseryeokData;
try {
  const dataPath = join(__dirname, '..', 'data', 'manseryeok-compact.json');
  const rawData = readFileSync(dataPath, 'utf8');
  manseryeokData = JSON.parse(rawData);
  // Log data loading success in development only
  if (process.env.NODE_ENV === 'development') {
    console.log('만세력 데이터 로드 완료');
  }
} catch (error) {
  // Always log data loading errors (critical for API functionality)
  console.error('만세력 데이터 로드 실패:', error.message);
  manseryeokData = {};
}

// 날짜 유효성 검사
function isValidDate(year, month, day) {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() == year && date.getMonth() == month - 1 && date.getDate() == day;
}

// 월간지 계산
function calculateMonthGanji(year, month, yearStem) {
  const monthStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const monthBranches = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];

  // 절기 기준 월
  const solarMonth = month <= 2 ? month + 10 : month - 2;

  // 년간에 따른 월간 계산
  const yearStemIndex = monthStems.indexOf(yearStem);
  const monthStemIndex = (yearStemIndex * 2 + Math.floor((solarMonth - 1) / 2)) % 10;

  const monthStem = monthStems[monthStemIndex];
  const monthBranch = monthBranches[(solarMonth - 1) % 12];

  return monthStem + monthBranch;
}

// 시간 간지 계산
function getHourGanji(hour, dayStem) {
  const hourBranches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  const hourStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

  const hourIndex = Math.floor((hour + 1) / 2) % 12;
  const hourBranch = hourBranches[hourIndex];

  const dayStemIndex = hourStems.indexOf(dayStem);
  const hourStemStartIndex = (dayStemIndex % 5) * 2;
  const hourStemIndex = (hourStemStartIndex + hourIndex) % 10;
  const hourStem = hourStems[hourStemIndex];

  return {
    stem: hourStem,
    branch: hourBranch,
    ganji: hourStem + hourBranch,
  };
}

// 만세력 데이터 조회
function getManseryeokData(year, month, day, hour) {
  try {
    if (
      !manseryeokData[year] ||
      !manseryeokData[year][month] ||
      !manseryeokData[year][month][day]
    ) {
      return null;
    }

    const dayData = manseryeokData[year][month][day];
    const monthGanji = calculateMonthGanji(year, month, dayData.ys);

    const result = {
      year,
      month,
      day,
      yearGanji: dayData.yg || '',
      monthGanji: monthGanji,
      dayGanji: dayData.dg || '',
      yearStem: dayData.ys || '',
      yearBranch: dayData.yb || '',
      monthStem: monthGanji.charAt(0) || '',
      monthBranch: monthGanji.charAt(1) || '',
      dayStem: dayData.ds || '',
      dayBranch: dayData.db || '',
      lunarMonth: dayData.lm || 0,
      lunarDay: dayData.ld || 0,
      isLeapMonth: dayData.lp || false,
    };

    // 시간이 제공된 경우 시간 간지 추가
    if (hour !== null && hour !== undefined && hour >= 0 && hour <= 23) {
      const hourGanji = getHourGanji(hour, dayData.ds);
      result.hourStem = hourGanji.stem;
      result.hourBranch = hourGanji.branch;
      result.hourGanji = hourGanji.ganji;
      result.hour = hour;
    }

    return result;
  } catch (error) {
    serverLogger.error('Manseryeok data error', { error: error.message, year, month, day, hour });
    return null;
  }
}

// API 핸들러
function handler(req, res) {
  // CORS 및 보안 헤더 설정
  setCorsHeaders(req, res);

  // 요청 검증 (OPTIONS 및 메소드 체크 포함) - GET과 POST 모두 허용
  if (validateRequest(req, res, ['GET', 'POST'])) {
    return;
  }

  const startTime = performance.now();
  const requestId = `manseryeok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const clientIp = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';

  serverLogger.info('Manseryeok API Request', {
    query: req.query,
    ip: clientIp,
    userAgent: req.headers['user-agent'],
    requestId
  });

  try {
    // 데이터 로드 확인
    if (!manseryeokData || Object.keys(manseryeokData).length === 0) {
      serverLogger.error('Manseryeok data not loaded', { requestId });
      return res.status(503).json({
        error: 'Service temporarily unavailable - data not loaded',
      });
    }

    // 쿼리 파라미터 또는 요청 바디에서 데이터 추출
    const params = req.method === 'POST' ? req.body : req.query;
    const { year, month, day, hour } = params;

    // 필수 파라미터 검증
    if (!year || !month || !day) {
      serverLogger.warn('Missing required parameters', { requestId, query: req.query });
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['year', 'month', 'day'],
      });
    }

    // 숫자 변환 및 검증
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    const h = hour ? parseInt(hour) : null;

    // 날짜 범위 검증
    if (y < 1841 || y > 2100) {
      serverLogger.warn('Invalid year range', { requestId, year: y });
      return res.status(400).json({
        error: 'Year must be between 1841 and 2100',
      });
    }

    if (m < 1 || m > 12) {
      serverLogger.warn('Invalid month range', { requestId, month: m });
      return res.status(400).json({
        error: 'Month must be between 1 and 12',
      });
    }

    if (d < 1 || d > 31) {
      serverLogger.warn('Invalid day range', { requestId, day: d });
      return res.status(400).json({
        error: 'Day must be between 1 and 31',
      });
    }

    if (!isValidDate(y, m, d)) {
      serverLogger.warn('Invalid date', { requestId, year: y, month: m, day: d });
      return res.status(400).json({
        error: 'Invalid date',
      });
    }

    // 만세력 데이터 조회 (타임아웃 보호)
    const queryStartTime = performance.now();
    
    // 5초 타임아웃으로 만세력 데이터 조회
    const timeoutMs = 5000;
    let manseryeok;
    
    try {
      const queryPromise = new Promise((resolve, reject) => {
        try {
          const result = getManseryeokData(y, m, d, h);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('만세력 조회 타임아웃')), timeoutMs);
      });
      
      manseryeok = await Promise.race([queryPromise, timeoutPromise]);
    } catch (error) {
      if (error.message === '만세력 조회 타임아웃') {
        serverLogger.warn('Manseryeok query timeout', { requestId, year: y, month: m, day: d, hour: h });
        return res.status(408).json({
          error: 'Request timeout',
          message: '만세력 데이터 조회 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
        });
      }
      throw error; // 다른 오류는 외부 catch로 전달
    }
    
    const queryDuration = performance.now() - queryStartTime;

    if (!manseryeok) {
      serverLogger.warn('Manseryeok data not found', { 
        requestId, 
        year: y, 
        month: m, 
        day: d, 
        hour: h,
        queryDuration: Math.round(queryDuration)
      });
      return res.status(404).json({
        error: 'Manseryeok data not found for this date',
        date: `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
      });
    }

    // 캐시 헤더 설정 (1일)
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

    const totalDuration = performance.now() - startTime;
    
    serverLogger.info('Manseryeok API Response', {
      requestId,
      success: true,
      year: y, month: m, day: d, hour: h,
      totalDuration: Math.round(totalDuration),
      hasHourData: !!manseryeok.hourGanji
    });

    return res.status(200).json({
      success: true,
      data: manseryeok,
    });
  } catch (error) {
    const totalDuration = performance.now() - startTime;
    
    serverLogger.error('Manseryeok API Error', {
      requestId,
      error: error.message,
      stack: error.stack,
      query: req.query,
      duration: Math.round(totalDuration)
    });
    
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
    });
  }
}

// 로깅 미들웨어와 함께 내보내기
export default withLogging(handler, {
  enableRequestLogging: true,
  enablePerformanceLogging: true,
  enableErrorDetails: process.env.NODE_ENV === 'development'
});
