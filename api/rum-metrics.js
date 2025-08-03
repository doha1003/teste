/**
 * 실사용자 모니터링 (RUM) 메트릭 수집 API
 * 클라이언트에서 전송된 성능 데이터를 처리하고 저장합니다.
 */

import { headers } from '../api/cors-config.js';

// 메트릭 데이터 저장소 (실제 환경에서는 데이터베이스 사용)
const metricsStore = {
  sessions: new Map(),
  dailyMetrics: new Map(),
  alerts: [],
};

// 성능 임계값 설정
const THRESHOLDS = {
  lcp: 2500, // LCP > 2.5초
  fid: 100, // FID > 100ms
  cls: 0.1, // CLS > 0.1
  fcp: 1800, // FCP > 1.8초
  ttfb: 800, // TTFB > 800ms
  errorRate: 0.05, // 에러율 > 5%
};

// 사용자 에이전트 파싱
function parseUserAgent(userAgent) {
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const isTablet = /iPad|Android.*Tablet/i.test(userAgent);
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  // 브라우저 감지
  let browser = 'unknown';
  if (userAgent.includes('Chrome')) browser = 'chrome';
  else if (userAgent.includes('Firefox')) browser = 'firefox';
  else if (userAgent.includes('Safari')) browser = 'safari';
  else if (userAgent.includes('Edge')) browser = 'edge';

  return { deviceType, browser, isMobile, isTablet };
}

// 메트릭 검증
function validateMetric(metric) {
  const requiredFields = ['type', 'timestamp'];

  for (const field of requiredFields) {
    if (!metric[field]) {
      return false;
    }
  }

  // 타임스탬프 유효성 검사 (24시간 이내)
  const now = Date.now();
  const metricTime = new Date(metric.timestamp).getTime();
  if (Math.abs(now - metricTime) > 24 * 60 * 60 * 1000) {
    return false;
  }

  return true;
}

// 메트릭 처리
function processMetrics(metrics, sessionInfo) {
  const processedMetrics = [];
  const webVitals = {};
  const errors = [];

  for (const metric of metrics) {
    if (!validateMetric(metric)) {
      continue;
    }

    // 사용자 에이전트 정보 추가
    const userAgentInfo = parseUserAgent(sessionInfo.userAgent);
    const enrichedMetric = {
      ...metric,
      ...userAgentInfo,
      sessionId: sessionInfo.sessionId,
      userId: sessionInfo.userId,
    };

    processedMetrics.push(enrichedMetric);

    // Web Vitals 수집
    if (metric.type === 'web_vital') {
      webVitals[metric.name] = metric.value;
    }

    // 에러 수집
    if (metric.type.includes('error')) {
      errors.push(enrichedMetric);
    }
  }

  return { processedMetrics, webVitals, errors };
}

// 성능 분석
function analyzePerformance(webVitals, errors, sessionInfo) {
  const analysis = {
    sessionId: sessionInfo.sessionId,
    timestamp: Date.now(),
    performance: 'good',
    issues: [],
    score: 100,
  };

  let scoreDeduction = 0;

  // Web Vitals 분석
  Object.entries(webVitals).forEach(([metric, value]) => {
    const threshold = THRESHOLDS[metric];
    if (threshold && value > threshold) {
      analysis.issues.push({
        type: 'performance',
        metric,
        value,
        threshold,
        severity: value > threshold * 1.5 ? 'critical' : 'warning',
      });

      scoreDeduction += value > threshold * 1.5 ? 20 : 10;
    }
  });

  // 에러율 분석
  if (errors.length > 0) {
    const errorRate = errors.length / Math.max(processedMetrics.length, 1);
    if (errorRate > THRESHOLDS.errorRate) {
      analysis.issues.push({
        type: 'error_rate',
        value: errorRate,
        threshold: THRESHOLDS.errorRate,
        severity: errorRate > THRESHOLDS.errorRate * 2 ? 'critical' : 'warning',
      });

      scoreDeduction += errorRate > THRESHOLDS.errorRate * 2 ? 30 : 15;
    }
  }

  analysis.score = Math.max(0, 100 - scoreDeduction);
  analysis.performance = analysis.score >= 80 ? 'good' : analysis.score >= 60 ? 'fair' : 'poor';

  return analysis;
}

// 일일 메트릭 집계
function aggregateDailyMetrics(metrics) {
  const today = new Date().toISOString().split('T')[0];

  if (!metricsStore.dailyMetrics.has(today)) {
    metricsStore.dailyMetrics.set(today, {
      date: today,
      pageViews: 0,
      uniqueSessions: new Set(),
      webVitals: {
        lcp: [],
        fid: [],
        cls: [],
        fcp: [],
        ttfb: [],
      },
      errors: [],
      devices: {
        mobile: 0,
        tablet: 0,
        desktop: 0,
      },
      browsers: {},
      interactions: 0,
      totalTime: 0,
    });
  }

  const dailyData = metricsStore.dailyMetrics.get(today);

  metrics.forEach((metric) => {
    // 세션 추가
    dailyData.uniqueSessions.add(metric.sessionId);

    // 페이지뷰 계산
    if (metric.type === 'page_info') {
      dailyData.pageViews++;
    }

    // Web Vitals 수집
    if (metric.type === 'web_vital') {
      if (dailyData.webVitals[metric.name]) {
        dailyData.webVitals[metric.name].push(metric.value);
      }
    }

    // 에러 수집
    if (metric.type.includes('error')) {
      dailyData.errors.push(metric);
    }

    // 디바이스 타입 계산
    if (metric.deviceType) {
      dailyData.devices[metric.deviceType] = (dailyData.devices[metric.deviceType] || 0) + 1;
    }

    // 브라우저 계산
    if (metric.browser) {
      dailyData.browsers[metric.browser] = (dailyData.browsers[metric.browser] || 0) + 1;
    }

    // 상호작용 계산
    if (metric.type === 'interaction') {
      dailyData.interactions++;
    }
  });

  // 고유 세션 수를 숫자로 변환
  dailyData.uniqueSessionsCount = dailyData.uniqueSessions.size;
}

// 알림 생성
function createAlert(analysis, sessionInfo) {
  const criticalIssues = analysis.issues.filter((issue) => issue.severity === 'critical');

  if (criticalIssues.length > 0) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      sessionId: sessionInfo.sessionId,
      type: 'performance_critical',
      message: `Critical performance issues detected`,
      issues: criticalIssues,
      url: sessionInfo.url,
      userAgent: sessionInfo.userAgent,
    };

    metricsStore.alerts.push(alert);

    // 최근 100개 알림만 유지
    if (metricsStore.alerts.length > 100) {
      metricsStore.alerts = metricsStore.alerts.slice(-100);
    }

    console.warn('Performance Alert:', alert);
  }
}

export default async function handler(req, res) {
  // CORS 헤더 설정
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are supported',
    });
  }

  try {
    const { metrics, sessionInfo } = req.body;

    // 입력 데이터 검증
    if (!metrics || !Array.isArray(metrics) || !sessionInfo) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Missing or invalid metrics data',
      });
    }

    if (metrics.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No metrics to process',
      });
    }

    // 메트릭 처리
    const { processedMetrics, webVitals, errors } = processMetrics(metrics, sessionInfo);

    if (processedMetrics.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No valid metrics to process',
      });
    }

    // 세션 정보 저장/업데이트
    if (!metricsStore.sessions.has(sessionInfo.sessionId)) {
      metricsStore.sessions.set(sessionInfo.sessionId, {
        sessionId: sessionInfo.sessionId,
        userId: sessionInfo.userId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        pageViews: 0,
        webVitals: {},
        totalErrors: 0,
        userAgent: sessionInfo.userAgent,
      });
    }

    const session = metricsStore.sessions.get(sessionInfo.sessionId);
    session.lastActivity = Date.now();
    session.webVitals = { ...session.webVitals, ...webVitals };
    session.totalErrors += errors.length;

    // 성능 분석
    const analysis = analyzePerformance(webVitals, errors, sessionInfo);

    // 일일 메트릭 집계
    aggregateDailyMetrics(processedMetrics);

    // 알림 생성
    createAlert(analysis, sessionInfo);

    // 응답 생성
    const response = {
      success: true,
      processed: processedMetrics.length,
      sessionId: sessionInfo.sessionId,
      analysis: {
        performance: analysis.performance,
        score: analysis.score,
        issueCount: analysis.issues.length,
      },
      timestamp: Date.now(),
    };

    // 개발 환경에서 상세 정보 포함
    if (process.env.NODE_ENV === 'development') {
      response.debug = {
        webVitals,
        errorCount: errors.length,
        issues: analysis.issues,
      };
    }

    console.log(
      `RUM API: Processed ${processedMetrics.length} metrics for session ${sessionInfo.sessionId}`
    );

    res.status(200).json(response);
  } catch (error) {
    console.error('RUM API Error:', error);

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process metrics',
      timestamp: Date.now(),
    });
  }
}

// 메트릭 조회 API (개발/관리용)
export async function getMetrics(req, res) {
  const { sessionId, date, type } = req.query;

  try {
    let result = {};

    if (sessionId) {
      // 특정 세션의 메트릭 조회
      result = metricsStore.sessions.get(sessionId) || null;
    } else if (date) {
      // 특정 날짜의 집계 데이터 조회
      const dailyData = metricsStore.dailyMetrics.get(date);
      if (dailyData) {
        // Set을 배열로 변환
        result = {
          ...dailyData,
          uniqueSessions: undefined,
          uniqueSessionsCount: dailyData.uniqueSessionsCount,
        };
      }
    } else {
      // 전체 요약 정보
      const today = new Date().toISOString().split('T')[0];
      const todayData = metricsStore.dailyMetrics.get(today);

      result = {
        activeSessions: metricsStore.sessions.size,
        todayMetrics: todayData
          ? {
              pageViews: todayData.pageViews,
              uniqueSessions: todayData.uniqueSessionsCount,
              errorCount: todayData.errors.length,
            }
          : null,
        recentAlerts: metricsStore.alerts.slice(-10),
      };
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Get Metrics Error:', error);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
}
