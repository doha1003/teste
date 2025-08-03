/**
 * 📊 애널리틱스 API 엔드포인트
 * 실시간 사용자 분석 및 성능 모니터링
 */

const MAX_REQUESTS_PER_MINUTE = 60;
const requestCounts = new Map();

// 간단한 레이트 리미팅
function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - 60000; // 1분 전

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const requests = requestCounts.get(ip);
  // 오래된 요청 제거
  const recentRequests = requests.filter((time) => time > windowStart);
  requestCounts.set(ip, recentRequests);

  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  recentRequests.push(now);
  return true;
}

export default async function handler(req, res) {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', 'https://doha.kr');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 레이트 리미팅 체크
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({
      error: '요청 한도 초과',
      message: '분당 요청 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.',
      retryAfter: 60,
    });
  }

  try {
    if (req.method === 'GET') {
      // 기본 통계 조회
      const stats = {
        timestamp: new Date().toISOString(),
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.version,
        },
        korean: {
          timezone: 'Asia/Seoul',
          locale: 'ko-KR',
          currentTime: new Date().toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
          }),
        },
      };

      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.status(200).json(stats);
    }

    if (req.method === 'POST') {
      const { event, data } = req.body;

      if (!event) {
        return res.status(400).json({
          error: '잘못된 요청',
          message: 'event 필드가 필요합니다',
        });
      }

      // 이벤트 타입별 처리
      const eventData = {
        event,
        timestamp: new Date().toISOString(),
        ip: clientIP,
        userAgent: req.headers['user-agent'],
        referer: req.headers.referer,
        data: data || {},
      };

      // 한국어 페이지 방문 추적
      if (event === 'page_view') {
        eventData.korean = {
          page: data?.page || 'unknown',
          isKoreanContent: true,
          userLocale: req.headers['accept-language']?.includes('ko') || false,
        };
      }

      // 운세/테스트 완료 추적
      if (event === 'test_complete' || event === 'fortune_complete') {
        eventData.korean = {
          serviceType: data?.type || 'unknown',
          completionTime: data?.duration || 0,
          satisfied: data?.rating > 3 || false,
        };
      }

      // 성능 메트릭 추적
      if (event === 'performance') {
        eventData.metrics = {
          loadTime: data?.loadTime || 0,
          renderTime: data?.renderTime || 0,
          apiResponseTime: data?.apiTime || 0,
          isOptimal: (data?.loadTime || 0) < 3000,
        };
      }

      // 실제 환경에서는 데이터베이스나 외부 분석 서비스로 전송
      // Log analytics events in development only
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event:', JSON.stringify(eventData, null, 2));
      }

      // PWA 설치 추적
      if (event === 'pwa_install') {
        eventData.pwa = {
          platform: data?.platform || 'unknown',
          installMethod: data?.method || 'unknown',
          isKoreanUser: true,
        };
      }

      return res.status(200).json({
        success: true,
        message: '이벤트가 기록되었습니다',
        eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        korean: {
          message: '사용자 활동이 성공적으로 기록되었습니다',
          timestamp: new Date().toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
          }),
        },
      });
    }

    return res.status(405).json({
      error: '허용되지 않는 메서드',
      message: 'GET 또는 POST 요청만 지원됩니다',
    });
  } catch (error) {
    // Always log analytics errors for debugging
    console.error('Analytics error:', error);

    return res.status(500).json({
      error: '서버 오류',
      message: '분석 데이터 처리 중 오류가 발생했습니다',
      korean: {
        message: '일시적인 오류입니다. 잠시 후 다시 시도해주세요.',
      },
    });
  }
}

// 일일 리포트 생성 (크론잡용)
export async function generateDailyReport() {
  const today = new Date().toISOString().split('T')[0];

  const report = {
    date: today,
    korean: {
      date: new Date().toLocaleDateString('ko-KR'),
      summary: '일일 사용자 활동 보고서',
    },
    metrics: {
      totalVisits: 0, // 실제 데이터로 교체
      uniqueUsers: 0,
      averageSessionDuration: 0,
      topPages: [],
      deviceTypes: {
        mobile: 0,
        desktop: 0,
        tablet: 0,
      },
      korean: {
        popularServices: [
          { name: 'MBTI 테스트', count: 0 },
          { name: '오늘의 운세', count: 0 },
          { name: '사주보기', count: 0 },
          { name: '타로점', count: 0 },
        ],
      },
    },
    performance: {
      averageLoadTime: 0,
      errorRate: 0,
      apiResponseTime: 0,
    },
  };

  return report;
}
