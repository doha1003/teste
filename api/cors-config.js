// CORS 설정을 위한 공통 모듈
// 환경별로 다른 도메인을 허용하며 보안 헤더를 추가

// 환경별 허용 도메인 설정
const getAllowedOrigins = () => {
  const env = process.env.NODE_ENV || 'development';

  // 기본 허용 도메인
  const allowedOrigins = [
    'https://doha.kr',
    'https://www.doha.kr',
    'https://sunro76.github.io', // GitHub Pages 도메인
  ];

  // 개발 환경에서만 localhost 허용
  if (env === 'development' || !process.env.VERCEL_ENV) {
    allowedOrigins.push(
      'http://localhost:5173', // Vite 개발 서버
      'http://localhost:5174', // Vite 대체 포트
      'http://localhost:3000', // 기타 개발 서버
      'http://localhost:8080', // Webpack 개발 서버
      'http://127.0.0.1:5173', // Vite IP 주소
      'http://127.0.0.1:3000', // 기타 IP 주소
      'null' // 파일:// 프로토콜 지원
    );
  }

  // 스테이징 환경 (Vercel 프리뷰 배포)
  if (env === 'staging' || process.env.VERCEL_ENV === 'preview') {
    // Vercel 프리뷰 URL 패턴 허용
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) {
      allowedOrigins.push(
        `https://${vercelUrl}`,
        `https://*.vercel.app` // 모든 Vercel 프리뷰 도메인
      );
    }
  }

  // 환경변수를 통한 추가 도메인 설정
  const additionalOrigins = process.env.ADDITIONAL_ALLOWED_ORIGINS;
  if (additionalOrigins) {
    const customOrigins = additionalOrigins.split(',').map((origin) => origin.trim());
    allowedOrigins.push(...customOrigins);
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

// CORS 및 보안 헤더 설정 함수
export const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin;

  // Origin이 허용 목록에 있는 경우에만 설정
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // 기본 CORS 헤더
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24시간 캐시

  // 보안 헤더 추가
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // CSP 헤더 (API 응답용 기본 설정)
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");

  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );
};

// OPTIONS 요청 처리를 위한 헬퍼 함수
export const handleOptions = (req, res) => {
  setCorsHeaders(req, res);
  res.status(204).end();
  return true;
};

// 요청 검증 미들웨어
export const validateRequest = (req, res, allowedMethods = ['GET', 'POST']) => {
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  // 허용된 메소드 확인
  if (!allowedMethods.includes(req.method)) {
    res.status(405).json({
      error: 'Method not allowed',
      allowed: allowedMethods,
    });
    return true;
  }

  // Content-Type 검증 (POST 요청인 경우) - 더 유연한 처리
  if (req.method === 'POST') {
    const contentType = req.headers['content-type'];
    // JSON 또는 form-urlencoded 허용, Content-Type이 없는 경우도 허용
    if (contentType && 
        !contentType.includes('application/json') && 
        !contentType.includes('application/x-www-form-urlencoded') &&
        !contentType.includes('text/plain')) {
      res.status(400).json({
        error: 'Content-Type must be application/json, application/x-www-form-urlencoded, or text/plain',
      });
      return true;
    }
  }

  return false;
};

// 환경 정보 로깅 (디버깅용)
export const logEnvironment = () => {
  const env = process.env.NODE_ENV || 'production';
  const allowedOrigins = getAllowedOrigins();

  // Use serverLogger in production
  if (env === 'development') {
    console.log('CORS Configuration:', {
      environment: env,
      vercelEnv: process.env.VERCEL_ENV,
      allowedOrigins: allowedOrigins,
    });
  }
};
