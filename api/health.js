/**
 * Health Check API for Blue-Green Deployment
 * 블루-그린 배포를 위한 헬스체크 API
 */

// Cold start 최적화를 위한 전역 변수
let startTime = Date.now();
let deploymentEnv = process.env.DEPLOY_ENV || 'production';
let healthCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30초 캐시

export default async function handler(req, res) {
  const requestStart = Date.now();

  try {
    // CORS 및 보안 헤더 설정 (통합 방식 사용)
    const { setCorsHeaders, validateRequest } = await import('./cors-config.js');
    setCorsHeaders(req, res);

    // 요청 검증 (OPTIONS 및 메소드 체크 포함)
    if (validateRequest(req, res, ['GET'])) {
      return;
    }

    // 캐시된 응답 확인 (성능 최적화)
    const now = Date.now();
    if (healthCache && now - cacheTimestamp < CACHE_DURATION) {
      const cachedResponse = {
        ...healthCache,
        responseTime: now - requestStart,
        cached: true,
      };

      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60');
      return res.status(200).json(cachedResponse);
    }

    // 시스템 상태 점검
    const healthData = await performHealthCheck(requestStart);

    // 캐시 업데이트
    healthCache = healthData;
    cacheTimestamp = now;

    // 응답 헤더 설정
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // Blue-Green 배포 상태에 따른 응답
    if (healthData.status === 'healthy') {
      res.status(200).json(healthData);
    } else {
      res.status(503).json(healthData);
    }
  } catch (error) {
    console.error('Health check error:', error);

    // 에러 응답
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      environment: deploymentEnv,
      responseTime: Date.now() - requestStart,
      error: {
        message: error.message,
        code: error.code,
      },
    });
  }
}

/**
 * 헬스체크 수행
 */
async function performHealthCheck(requestStart) {
  const timestamp = new Date().toISOString();
  const uptime = Date.now() - startTime;

  // 기본 시스템 정보
  const systemInfo = {
    status: 'healthy',
    timestamp,
    environment: deploymentEnv,
    uptime: Math.floor(uptime / 1000), // 초 단위
    responseTime: Date.now() - requestStart,
    cached: false,
    deployment: {
      env: deploymentEnv,
      region: process.env.VERCEL_REGION || 'unknown',
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
    },
  };

  // 외부 서비스 연결 테스트
  const serviceChecks = await Promise.allSettled([
    checkGeminiAPI(),
    checkDatabaseConnection(),
    checkCDNStatus(),
  ]);

  // 서비스 상태 집계
  systemInfo.services = {
    gemini: getCheckResult(serviceChecks[0]),
    database: getCheckResult(serviceChecks[1]),
    cdn: getCheckResult(serviceChecks[2]),
  };

  // 전체 상태 결정
  const hasFailure = Object.values(systemInfo.services).some(
    (service) => service.status === 'unhealthy'
  );

  if (hasFailure) {
    systemInfo.status = 'degraded';
  }

  // 성능 메트릭
  systemInfo.metrics = {
    responseTime: systemInfo.responseTime,
    memoryUsage: {
      rss: Math.round(systemInfo.deployment.memory.rss / 1024 / 1024), // MB
      heapUsed: Math.round(systemInfo.deployment.memory.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(systemInfo.deployment.memory.heapTotal / 1024 / 1024), // MB
    },
    cpuUsage: process.cpuUsage(),
  };

  return systemInfo;
}

/**
 * Gemini API 연결 확인
 */
async function checkGeminiAPI() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // 단순 연결 테스트 (실제 API 호출 없이)
    const response = await fetchWithTimeout(
      'https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY,
      {
        method: 'GET',
        timeout: 3000,
        headers: {
          'User-Agent': 'doha.kr/health-check',
        },
      }
    );

    if (response.ok) {
      return { status: 'healthy', latency: Date.now() };
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      latency: -1,
    };
  }
}

/**
 * 데이터베이스 연결 확인 (향후 확장용)
 */
async function checkDatabaseConnection() {
  try {
    // 현재는 파일시스템 기반이므로 간단한 확인
    const testStart = Date.now();

    // 기본 파일시스템 접근 테스트
    if (typeof require !== 'undefined') {
      const fs = require('fs');
      await fs.promises.access('/tmp', fs.constants.R_OK | fs.constants.W_OK);
    }

    return {
      status: 'healthy',
      latency: Date.now() - testStart,
      type: 'filesystem',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      latency: -1,
      type: 'filesystem',
    };
  }
}

/**
 * CDN 상태 확인
 */
async function checkCDNStatus() {
  try {
    const testStart = Date.now();

    // Cloudflare CDN 상태 확인
    const response = await fetchWithTimeout('https://doha.kr/manifest.json', {
      method: 'HEAD',
      timeout: 3000,
      headers: {
        'User-Agent': 'doha.kr/health-check',
      },
    });

    if (response.ok) {
      return {
        status: 'healthy',
        latency: Date.now() - testStart,
        cdnHeaders: {
          cfRay: response.headers.get('cf-ray'),
          cfCache: response.headers.get('cf-cache-status'),
          server: response.headers.get('server'),
        },
      };
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      latency: -1,
    };
  }
}

/**
 * Promise settled 결과 파싱
 */
function getCheckResult(settledResult) {
  if (settledResult.status === 'fulfilled') {
    return settledResult.value;
  } else {
    return {
      status: 'unhealthy',
      error: settledResult.reason?.message || 'Unknown error',
      latency: -1,
    };
  }
}

/**
 * fetch with timeout 구현 (Node.js 환경 호환성)
 */
async function fetchWithTimeout(url, options = {}) {
  const { timeout = 5000, ...fetchOptions } = options;

  // Vercel의 Node.js 환경에서 fetch 사용
  const fetchFn = globalThis.fetch || require('node-fetch');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetchFn(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}
