/**
 * Enhanced CORS configuration for doha.kr API endpoints
 * Supports all deployment scenarios including Vercel preview URLs
 * 
 * @version 3.0.0 - Enhanced for 401/CORS issue resolution
 * @created 2025-08-10
 */

// 환경별 허용 도메인 설정 (확장된 버전)
const getAllowedOrigins = () => {
  const env = process.env.NODE_ENV || 'production';

  // 기본 허용 도메인 (모든 환경에서 허용)
  const allowedOrigins = [
    'https://doha.kr',
    'https://www.doha.kr',
    'https://sunro76.github.io', // GitHub Pages 도메인
    
    // Vercel 배포 URL 패턴 (모든 버전 지원)
    'https://doha-kr-8f3cg28hm-dohas-projects-4691afdc.vercel.app', // 현재 배포 URL
    'https://doha-kr.vercel.app', // 기본 프로젝트 URL
    'https://teste-doha.vercel.app', // 대체 프로젝트 URL
  ];

  // 모든 환경에서 localhost 허용 (API 테스트 및 개발용)
  allowedOrigins.push(
    'http://localhost:3000',
    'http://localhost:5173', // Vite 개발 서버
    'http://localhost:5174', // Vite 대체 포트
    'http://localhost:8000', // Python 서버
    'http://localhost:8080', // Webpack 개발 서버
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8000',
    'null' // 파일:// 프로토콜 지원 (로컬 HTML 파일)
  );

  // 모든 Vercel 프리뷰 URL 지원 (동적 URL 처리용)
  allowedOrigins.push(
    'https://*.vercel.app', // 와일드카드 패턴
    'https://doha-kr-*.vercel.app', // 프로젝트별 패턴
    'https://*-dohas-projects-*.vercel.app' // 계정별 패턴
  );

  // 환경변수를 통한 추가 도메인 설정
  const additionalOrigins = process.env.ADDITIONAL_ALLOWED_ORIGINS;
  if (additionalOrigins) {
    const customOrigins = additionalOrigins.split(',').map((origin) => origin.trim());
    allowedOrigins.push(...customOrigins);
  }

  // 현재 Vercel URL 자동 추가
  if (process.env.VERCEL_URL) {
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }

  return allowedOrigins;
};

// Origin 검증 함수
const isOriginAllowed = (origin) => {
  if (!origin) return false;

  const allowedOrigins = getAllowedOrigins();

  // 정확한 매치 확인
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // 와일드카드 패턴 확인 (예: *.vercel.app)
  for (const allowed of allowedOrigins) {
    if (allowed.includes('*')) {
      const pattern = allowed.replace('*', '.*');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(origin)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Enhanced CORS 및 보안 헤더 설정 함수
 * 모든 API 엔드포인트에서 401/CORS 오류 해결을 위한 포괄적 설정
 */
export const setCorsHeaders = (req, res, options = {}) => {
  const {
    allowAllOrigins = false,
    publicEndpoint = false,
    allowedMethods = ['GET', 'POST', 'OPTIONS', 'HEAD'],
    allowCredentials = false
  } = options;

  const origin = req.headers.origin;

  // Public endpoints (health, logs)는 모든 Origin 허용
  if (allowAllOrigins || publicEndpoint) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
  } else {
    // Origin 검증 후 허용
    if (origin && isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', allowCredentials ? 'true' : 'false');
    } else {
      // Fallback: 주요 도메인 허용 (CORS 오류 방지)
      res.setHeader('Access-Control-Allow-Origin', 'https://doha.kr');
      res.setHeader('Access-Control-Allow-Credentials', 'false');
      
      // 디버깅을 위한 로깅
      console.warn('CORS: Unknown origin attempted access:', origin);
    }
  }

  // 확장된 CORS 헤더
  res.setHeader('Access-Control-Allow-Methods', allowedMethods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', [
    'Content-Type',
    'Accept',
    'X-Requested-With',
    'Authorization',
    'Origin',
    'User-Agent',
    'Cache-Control',
    'Pragma',
    'X-API-Key',
    'X-Client-Version'
  ].join(', '));
  res.setHeader('Access-Control-Max-Age', '86400'); // 24시간 캐시
  res.setHeader('Access-Control-Expose-Headers', 'X-Request-ID, X-Response-Time');

  // API 응답용 기본 보안 헤더 (덜 제한적)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // API 전용 캐시 헤더
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // 요청 추적용 헤더
  res.setHeader('X-Request-ID', generateRequestId());
  res.setHeader('X-Response-Time', Date.now());
  res.setHeader('X-API-Version', '3.1.0');
};


/**
 * 요청 ID 생성 함수
 */
const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * OPTIONS 요청 처리 함수
 */
export const handleOptions = (req, res, corsOptions = {}) => {
  setCorsHeaders(req, res, { ...corsOptions, publicEndpoint: true });
  res.status(200).end();
  return true;
};

/**
 * 요청 검증 및 CORS 적용 통합 함수
 */
export const validateRequest = (req, res, options = {}) => {
  const {
    allowedMethods = ['GET', 'POST'],
    corsOptions = {},
    requireAuth = false
  } = options;

  // CORS 헤더 설정
  setCorsHeaders(req, res, corsOptions);

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res, corsOptions);
  }

  // 허용된 메소드 확인
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({
      error: 'Method not allowed',
      allowed: allowedMethods,
      received: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // Content-Type 검증 (POST/PUT 요청)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (contentType && !contentType.includes('application/json') && 
        !contentType.includes('application/x-www-form-urlencoded') &&
        !contentType.includes('text/plain') && 
        !contentType.includes('multipart/form-data')) {
      return res.status(400).json({
        error: 'Unsupported Content-Type',
        supported: ['application/json', 'application/x-www-form-urlencoded', 'text/plain'],
        received: contentType,
        timestamp: new Date().toISOString()
      });
    }
  }

  return false; // 검증 통과
};

/**
 * 통합 에러 응답 함수
 */
export const sendErrorResponse = (res, status, message, details = {}) => {
  return res.status(status).json({
    error: true,
    status,
    message,
    details,
    timestamp: new Date().toISOString(),
    requestId: res.getHeader('X-Request-ID') || generateRequestId()
  });
};

/**
 * 통합 성공 응답 함수
 */
export const sendSuccessResponse = (res, data, status = 200) => {
  return res.status(status).json({
    success: true,
    status,
    data,
    timestamp: new Date().toISOString(),
    requestId: res.getHeader('X-Request-ID') || generateRequestId()
  });
};

// 환경 정보 로깅 (디버깅용)
export const logEnvironment = () => {
  const env = process.env.NODE_ENV || 'production';
  const allowedOrigins = getAllowedOrigins();

  // 환경 정보 로깅 (개발/스테이징 환경에서만)
  if (env !== 'production') {
    console.log('CORS Configuration v3.0:', {
      environment: env,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL,
      allowedOrigins: allowedOrigins.slice(0, 10), // 처음 10개만 표시
      totalOrigins: allowedOrigins.length
    });
  }
};

/**
 * API 상태 확인 함수
 */
export const getApiStatus = () => {
  return {
    cors: {
      version: '3.0.0',
      allowedOrigins: getAllowedOrigins().length,
      environment: process.env.NODE_ENV || 'production',
      vercelEnv: process.env.VERCEL_ENV || 'none'
    },
    timestamp: new Date().toISOString(),
    healthy: true
  };
};

// 초기화 시 환경 정보 로깅
logEnvironment();
