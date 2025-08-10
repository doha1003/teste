// Manseryeok API endpoint for Vercel (최적화 버전)
// 성능 최적화: 메모리 캐싱, 데이터 압축, 병렬 처리

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { setCorsHeaders, validateRequest } from './cors-config.js';
import { serverLogger, withLogging } from './logging-middleware.js';
import { performance } from 'node:perf_hooks';
import { getCache } from './cache-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 글로벌 데이터 캐시 (서버리스 함수 간 공유)
let manseryeokData = null;
let dataLoadTime = null;
let dataStats = null;

// 만세력 캐시 인스턴스
const manseryeokCache = getCache('manseryeok', {
  maxSize: 2000,
  defaultTtl: 86400000, // 24시간 (만세력은 불변)
  enableCompression: true,
});

// 최적화된 데이터 로더
async function loadManseryeokData() {
  if (manseryeokData && dataLoadTime && Date.now() - dataLoadTime < 3600000) {
    // 1시간 이내에 로드된 데이터가 있으면 재사용
    return manseryeokData;
  }

  const loadStartTime = performance.now();

  try {
    const dataPath = join(__dirname, '..', 'data', 'manseryeok-compact.json');
    const rawData = readFileSync(dataPath, 'utf8');
    const parsedData = JSON.parse(rawData);

    // 데이터 통계 수집
    const loadDuration = performance.now() - loadStartTime;
    const dataSize = rawData.length;
    const yearCount = Object.keys(parsedData).length;

    manseryeokData = parsedData;
    dataLoadTime = Date.now();
    dataStats = {
      loadDuration: Math.round(loadDuration),
      dataSize: dataSize,
      yearCount: yearCount,
      loadedAt: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('만세력 데이터 로드 완료:', dataStats);
    }

    return parsedData;
  } catch (error) {
    console.error('만세력 데이터 로드 실패:', error.message);
    throw new Error('만세력 데이터 로드 실패');
  }
}

// 날짜 유효성 검사 (최적화)
const isValidDate = (() => {
  const cache = new Map();

  return (year, month, day) => {
    const key = `${year}-${month}-${day}`;

    if (cache.has(key)) {
      return cache.get(key);
    }

    const date = new Date(year, month - 1, day);
    const isValid =
      date.getFullYear() == year && date.getMonth() == month - 1 && date.getDate() == day;

    // 최대 1000개까지만 캐시
    if (cache.size < 1000) {
      cache.set(key, isValid);
    }

    return isValid;
  };
})();

// 월간지 계산 (최적화된 버전)
const calculateMonthGanji = (() => {
  const monthStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const monthBranches = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
  const cache = new Map();

  return (year, month, yearStem) => {
    const key = `${year}-${month}-${yearStem}`;

    if (cache.has(key)) {
      return cache.get(key);
    }

    // 절기 기준 월
    const solarMonth = month <= 2 ? month + 10 : month - 2;

    // 년간에 따른 월간 계산
    const yearStemIndex = monthStems.indexOf(yearStem);
    const monthStemIndex = (yearStemIndex * 2 + Math.floor((solarMonth - 1) / 2)) % 10;

    const monthStem = monthStems[monthStemIndex];
    const monthBranch = monthBranches[(solarMonth - 1) % 12];
    const result = monthStem + monthBranch;

    // 최대 500개까지만 캐시
    if (cache.size < 500) {
      cache.set(key, result);
    }

    return result;
  };
})();

// 시간 간지 계산 (최적화된 버전)
const getHourGanji = (() => {
  const hourBranches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  const hourStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const cache = new Map();

  return (hour, dayStem) => {
    const key = `${hour}-${dayStem}`;

    if (cache.has(key)) {
      return cache.get(key);
    }

    const hourIndex = Math.floor((hour + 1) / 2) % 12;
    const hourBranch = hourBranches[hourIndex];

    const dayStemIndex = hourStems.indexOf(dayStem);
    const hourStemStartIndex = (dayStemIndex % 5) * 2;
    const hourStemIndex = (hourStemStartIndex + hourIndex) % 10;
    const hourStem = hourStems[hourStemIndex];

    const result = {
      stem: hourStem,
      branch: hourBranch,
      ganji: hourStem + hourBranch,
    };

    // 최대 300개까지만 캐시
    if (cache.size < 300) {
      cache.set(key, result);
    }

    return result;
  };
})();

// 최적화된 만세력 데이터 조회
async function getManseryeokDataOptimized(year, month, day, hour) {
  const startTime = performance.now();

  try {
    // 캐시에서 먼저 조회
    const cacheKey = manseryeokCache.generateKey('manseryeok', { year, month, day, hour });
    const cached = manseryeokCache.get(cacheKey);

    if (cached) {
      serverLogger.debug('Manseryeok cache hit', { year, month, day, hour });
      return cached;
    }

    // 데이터 로드 확인
    if (!manseryeokData) {
      await loadManseryeokData();
    }

    if (
      !manseryeokData[year] ||
      !manseryeokData[year][month] ||
      !manseryeokData[year][month][day]
    ) {
      return null;
    }

    const dayData = manseryeokData[year][month][day];

    // 병렬 계산
    const [monthGanji, hourGanji] = await Promise.all([
      Promise.resolve(calculateMonthGanji(year, month, dayData.ys)),
      hour !== null && hour !== undefined && hour >= 0 && hour <= 23
        ? Promise.resolve(getHourGanji(hour, dayData.ds))
        : Promise.resolve(null),
    ]);

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
    if (hourGanji) {
      result.hourStem = hourGanji.stem;
      result.hourBranch = hourGanji.branch;
      result.hourGanji = hourGanji.ganji;
      result.hour = hour;
    }

    // 결과를 캐시에 저장 (24시간)
    manseryeokCache.set(cacheKey, result, 86400000);

    const duration = performance.now() - startTime;
    serverLogger.debug('Manseryeok data computed', {
      year,
      month,
      day,
      hour,
      duration: Math.round(duration),
      cached: false,
    });

    return result;
  } catch (error) {
    serverLogger.error('Manseryeok data error', {
      error: error.message,
      year,
      month,
      day,
      hour,
    });
    return null;
  }
}

// API 핸들러 (최적화된 버전)
async function handler(req, res) {
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
    body: req.body,
    ip: clientIp,
    userAgent: req.headers['user-agent'],
    requestId,
  });

  try {
    // 쿼리 파라미터 또는 요청 바디에서 데이터 추출
    const params = req.method === 'POST' ? req.body : req.query;
    const { year, month, day, hour } = params;

    // 필수 파라미터 검증
    if (!year || !month || !day) {
      serverLogger.warn('Missing required parameters', { requestId, params });
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['year', 'month', 'day'],
      });
    }

    // 숫자 변환 및 검증 (병렬 처리)
    const [y, m, d, h] = await Promise.all([
      Promise.resolve(parseInt(year)),
      Promise.resolve(parseInt(month)),
      Promise.resolve(parseInt(day)),
      Promise.resolve(hour ? parseInt(hour) : null),
    ]);

    // 입력값 범위 검증 (빠른 실패)
    const validationErrors = [];

    if (y < 1841 || y > 2100) validationErrors.push('Year must be between 1841 and 2100');
    if (m < 1 || m > 12) validationErrors.push('Month must be between 1 and 12');
    if (d < 1 || d > 31) validationErrors.push('Day must be between 1 and 31');
    if (h !== null && (h < 0 || h > 23)) validationErrors.push('Hour must be between 0 and 23');

    if (validationErrors.length > 0) {
      serverLogger.warn('Validation errors', { requestId, errors: validationErrors });
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors,
      });
    }

    if (!isValidDate(y, m, d)) {
      serverLogger.warn('Invalid date', { requestId, year: y, month: m, day: d });
      return res.status(400).json({
        error: 'Invalid date',
      });
    }

    // 만세력 데이터 조회
    const queryStartTime = performance.now();

    try {
      const manseryeok = await getManseryeokDataOptimized(y, m, d, h);
      const queryDuration = performance.now() - queryStartTime;

      if (!manseryeok) {
        serverLogger.warn('Manseryeok data not found', {
          requestId,
          year: y,
          month: m,
          day: d,
          hour: h,
          queryDuration: Math.round(queryDuration),
        });
        return res.status(404).json({
          error: 'Manseryeok data not found for this date',
          date: `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
        });
      }

      // 최적화된 캐시 헤더 설정
      res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
      res.setHeader('ETag', `"${cacheKey}-v1"`);

      const totalDuration = performance.now() - startTime;

      serverLogger.info('Manseryeok API Response', {
        requestId,
        success: true,
        year: y,
        month: m,
        day: d,
        hour: h,
        totalDuration: Math.round(totalDuration),
        queryDuration: Math.round(queryDuration),
        hasHourData: !!manseryeok.hourGanji,
        cacheHit: queryDuration < 1, // 1ms 미만이면 캐시 히트로 간주
      });

      return res.status(200).json({
        success: true,
        data: manseryeok,
        meta: {
          requestId,
          processTime: Math.round(totalDuration),
          dataStats: dataStats,
          cached: queryDuration < 1,
        },
      });
    } catch (queryError) {
      const queryDuration = performance.now() - queryStartTime;

      if (queryError.message.includes('타임아웃')) {
        serverLogger.warn('Manseryeok query timeout', {
          requestId,
          year: y,
          month: m,
          day: d,
          hour: h,
          duration: Math.round(queryDuration),
        });
        return res.status(408).json({
          error: 'Request timeout',
          message: '만세력 데이터 조회 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
        });
      }
      throw queryError;
    }
  } catch (error) {
    const totalDuration = performance.now() - startTime;

    serverLogger.error('Manseryeok API Error', {
      requestId,
      error: error.message,
      stack: error.stack,
      params: req.method === 'POST' ? req.body : req.query,
      duration: Math.round(totalDuration),
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
      requestId,
    });
  }
}

// 캐시 상태 조회 엔드포인트 (개발용)
export async function getCacheStats() {
  return {
    manseryeokCache: manseryeokCache.getStats(),
    dataStats: dataStats,
    memoryUsage: process.memoryUsage(),
  };
}

// 데이터 사전 로드 (서버리스 함수 워밍업용)
export async function warmup() {
  try {
    await loadManseryeokData();
    return { success: true, stats: dataStats };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 로깅 미들웨어와 함께 내보내기
export default withLogging(handler, {
  enableRequestLogging: true,
  enablePerformanceLogging: true,
  enableErrorDetails: process.env.NODE_ENV === 'development',
});
