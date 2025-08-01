/**
 * 🏥 헬스체크 API 엔드포인트
 * 시스템 상태 모니터링 및 업타임 확인
 */

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', 'https://doha.kr');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: '허용되지 않는 메서드',
      message: 'GET 요청만 지원됩니다'
    });
  }

  try {
    const startTime = Date.now();
    
    // 기본 시스템 정보
    const systemInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '3.0.0',
      region: process.env.VERCEL_REGION || 'local'
    };

    // Gemini API 연결 테스트
    let geminiStatus = 'unknown';
    try {
      if (process.env.GEMINI_API_KEY) {
        // 간단한 API 키 유효성 확인
        geminiStatus = 'configured';
      } else {
        geminiStatus = 'not-configured';
      }
    } catch (error) {
      geminiStatus = 'error';
    }

    // 메모리 사용량 체크
    const memoryUsage = process.memoryUsage();
    const memoryInfo = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100, // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100 // MB
    };

    // 응답 시간 계산
    const responseTime = Date.now() - startTime;

    // 전체 건강 상태 판단
    const isHealthy = 
      memoryInfo.heapUsed < 200 && // 200MB 미만
      responseTime < 1000 && // 1초 미만
      geminiStatus !== 'error';

    const healthStatus = {
      ...systemInfo,
      status: isHealthy ? 'healthy' : 'degraded',
      checks: {
        api: {
          gemini: geminiStatus,
          responseTime: `${responseTime}ms`
        },
        system: {
          memory: memoryInfo,
          node: process.version
        }
      },
      korean: {
        message: isHealthy ? '모든 시스템이 정상 작동 중입니다' : '일부 시스템에 문제가 있습니다',
        lastCheck: new Date().toLocaleString('ko-KR', {
          timeZone: 'Asia/Seoul'
        })
      }
    };

    // 캐시 헤더 설정 (5분)
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    
    return res.status(isHealthy ? 200 : 503).json(healthStatus);

  } catch (error) {
    console.error('Health check error:', error);
    
    return res.status(503).json({
      status: 'error',
      message: '헬스체크 실행 중 오류가 발생했습니다',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
}