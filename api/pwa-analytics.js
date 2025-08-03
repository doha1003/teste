/**
 * PWA 분석 데이터 수집 API
 * PWA 설치율, 사용 패턴 등을 수집하고 분석합니다.
 */

import { headers } from '../api/cors-config.js';

// PWA 데이터 저장소
const pwaStore = {
  sessions: new Map(),
  dailyStats: new Map(),
  installFunnel: {
    promptsShown: 0,
    installsAttempted: 0,
    installsCompleted: 0,
    dismissals: 0,
  },
  usagePatterns: {
    standaloneUsage: [],
    offlineUsage: [],
    pageViews: [],
    interactions: [],
  },
};

// 설치 퍼널 분석
function analyzeInstallFunnel(events) {
  const funnelData = {
    promptShown: 0,
    promptTriggered: 0,
    userAccepted: 0,
    userDismissed: 0,
    installCompleted: 0,
    conversionRate: 0,
  };

  events.forEach((event) => {
    if (event.category === 'pwa_install') {
      switch (event.action) {
        case 'prompt_available':
        case 'custom_prompt_shown':
          funnelData.promptShown++;
          break;
        case 'prompt_triggered':
          funnelData.promptTriggered++;
          break;
        case 'user_choice':
          if (event.outcome === 'accepted') {
            funnelData.userAccepted++;
          } else {
            funnelData.userDismissed++;
          }
          break;
        case 'completed':
          funnelData.installCompleted++;
          break;
      }
    }
  });

  // 전환율 계산
  if (funnelData.promptShown > 0) {
    funnelData.conversionRate = (funnelData.installCompleted / funnelData.promptShown) * 100;
  }

  return funnelData;
}

// 사용 패턴 분석
function analyzeUsagePatterns(events, metrics) {
  const patterns = {
    sessionType: metrics.sessionData?.isStandalone ? 'standalone' : 'browser',
    sessionDuration: 0,
    pageViews: 0,
    interactions: 0,
    offlineTime: metrics.usagePatterns?.offlineUsage || 0,
    standaloneTime: metrics.usagePatterns?.standAloneUsage || 0,
    features: {
      serviceWorker: false,
      notifications: false,
      offlineCapable: false,
    },
  };

  events.forEach((event) => {
    switch (event.category) {
      case 'pwa_usage':
        if (event.action === 'page_view') {
          patterns.pageViews++;
        } else if (event.action === 'interactions') {
          patterns.interactions += event.count || 1;
        } else if (event.action === 'session_duration') {
          patterns.sessionDuration = event.duration || 0;
        }
        break;
      case 'pwa_sw':
        patterns.features.serviceWorker = true;
        if (event.action === 'push_notification') {
          patterns.features.notifications = true;
        }
        break;
      case 'pwa_offline':
        patterns.features.offlineCapable = true;
        break;
    }
  });

  return patterns;
}

// 기기 및 브라우저 분석
function analyzeDeviceAndBrowser(userAgent, events) {
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const isTablet = /iPad|Android.*Tablet/i.test(userAgent);
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  let browser = 'unknown';
  if (userAgent.includes('Chrome')) browser = 'chrome';
  else if (userAgent.includes('Firefox')) browser = 'firefox';
  else if (userAgent.includes('Safari')) browser = 'safari';
  else if (userAgent.includes('Edge')) browser = 'edge';

  // 설치 가능성 분석
  const installCapable =
    browser === 'chrome' || browser === 'edge' || (browser === 'safari' && (isMobile || isTablet));

  return {
    deviceType,
    browser,
    isMobile,
    isTablet,
    installCapable,
    supportLevel: getSuportLevel(browser, deviceType),
  };
}

function getSuportLevel(browser, deviceType) {
  // PWA 지원 수준 평가
  if (browser === 'chrome' || browser === 'edge') {
    return 'full'; // 완전 지원
  } else if (browser === 'firefox') {
    return 'partial'; // 부분 지원
  } else if (browser === 'safari') {
    return deviceType === 'mobile' ? 'limited' : 'minimal'; // 제한적 지원
  }
  return 'none';
}

// 일일 통계 업데이트
function updateDailyStats(sessionData, events, metrics) {
  const today = new Date().toISOString().split('T')[0];

  if (!pwaStore.dailyStats.has(today)) {
    pwaStore.dailyStats.set(today, {
      date: today,
      sessions: {
        total: 0,
        standalone: 0,
        browser: 0,
      },
      install: {
        promptsShown: 0,
        promptsTriggered: 0,
        installs: 0,
        dismissals: 0,
      },
      usage: {
        totalTime: 0,
        standaloneTime: 0,
        offlineTime: 0,
        pageViews: 0,
        interactions: 0,
      },
      devices: {
        mobile: 0,
        tablet: 0,
        desktop: 0,
      },
      browsers: {},
      features: {
        serviceWorker: 0,
        notifications: 0,
        offline: 0,
      },
    });
  }

  const dailyData = pwaStore.dailyStats.get(today);

  // 세션 타입
  dailyData.sessions.total++;
  if (metrics.sessionData?.isStandalone) {
    dailyData.sessions.standalone++;
  } else {
    dailyData.sessions.browser++;
  }

  // 설치 관련
  events.forEach((event) => {
    if (event.category === 'pwa_install') {
      switch (event.action) {
        case 'prompt_available':
        case 'custom_prompt_shown':
          dailyData.install.promptsShown++;
          break;
        case 'prompt_triggered':
          dailyData.install.promptsTriggered++;
          break;
        case 'completed':
          dailyData.install.installs++;
          break;
        case 'dismissed':
          dailyData.install.dismissals++;
          break;
      }
    }
  });

  // 사용 패턴
  if (sessionData.sessionDuration) {
    dailyData.usage.totalTime += sessionData.sessionDuration;
  }
  if (metrics.usagePatterns?.standAloneUsage) {
    dailyData.usage.standaloneTime += metrics.usagePatterns.standAloneUsage;
  }
  if (metrics.usagePatterns?.offlineUsage) {
    dailyData.usage.offlineTime += metrics.usagePatterns.offlineUsage;
  }

  // 기기 정보
  const deviceInfo = analyzeDeviceAndBrowser(sessionData.userAgent || '', events);
  dailyData.devices[deviceInfo.deviceType]++;
  dailyData.browsers[deviceInfo.browser] = (dailyData.browsers[deviceInfo.browser] || 0) + 1;

  // 기능 사용
  events.forEach((event) => {
    if (event.category === 'pwa_sw') {
      dailyData.features.serviceWorker++;
      if (event.action === 'push_notification') {
        dailyData.features.notifications++;
      }
    } else if (event.category === 'pwa_offline') {
      dailyData.features.offline++;
    }
  });
}

// PWA 성능 점수 계산
function calculatePWAScore(metrics, events) {
  let score = 0;
  let maxScore = 100;

  // 설치율 (30점)
  const installEvents = events.filter((e) => e.category === 'pwa_install');
  const promptEvents = installEvents.filter((e) => e.action.includes('prompt'));
  const installCompleted = installEvents.filter((e) => e.action === 'completed');

  if (promptEvents.length > 0) {
    const installRate = installCompleted.length / promptEvents.length;
    score += installRate * 30;
  }

  // 스탠드얼론 사용률 (25점)
  if (metrics.sessionData?.isStandalone) {
    score += 25;
  }

  // 오프라인 기능 사용 (20점)
  const offlineEvents = events.filter((e) => e.category === 'pwa_offline');
  if (offlineEvents.length > 0) {
    score += 20;
  }

  // Service Worker 활용 (15점)
  const swEvents = events.filter((e) => e.category === 'pwa_sw');
  if (swEvents.length > 0) {
    score += 15;
  }

  // 사용자 참여도 (10점)
  const usageEvents = events.filter((e) => e.category === 'pwa_usage');
  const engagementScore = Math.min(usageEvents.length / 10, 1); // 최대 10개 이벤트
  score += engagementScore * 10;

  return Math.round(score);
}

// 개선 권장사항 생성
function generateRecommendations(metrics, events, score) {
  const recommendations = [];

  // 설치율 개선
  const installEvents = events.filter((e) => e.category === 'pwa_install');
  const promptEvents = installEvents.filter((e) => e.action.includes('prompt'));
  const installCompleted = installEvents.filter((e) => e.action === 'completed');

  if (promptEvents.length > 0) {
    const installRate = installCompleted.length / promptEvents.length;
    if (installRate < 0.1) {
      recommendations.push({
        category: 'install',
        priority: 'high',
        message: '설치율이 낮습니다. 설치 프롬프트 타이밍과 UX를 개선해보세요.',
        metric: 'install_rate',
        current: (installRate * 100).toFixed(1) + '%',
        target: '15-25%',
      });
    }
  }

  // 스탠드얼론 사용 개선
  if (!metrics.sessionData?.isStandalone && metrics.installed) {
    recommendations.push({
      category: 'usage',
      priority: 'medium',
      message: '앱이 설치되었지만 브라우저에서 접근하고 있습니다. 스탠드얼론 사용을 유도해보세요.',
      metric: 'standalone_usage',
      current: '브라우저 사용',
      target: '스탠드얼론 사용',
    });
  }

  // 오프라인 기능 활용
  const offlineEvents = events.filter((e) => e.category === 'pwa_offline');
  if (offlineEvents.length === 0) {
    recommendations.push({
      category: 'features',
      priority: 'medium',
      message: '오프라인 기능이 활용되지 않고 있습니다. 오프라인 콘텐츠를 개선해보세요.',
      metric: 'offline_usage',
      current: '미사용',
      target: '활용',
    });
  }

  // 푸시 알림
  const notificationEvents = events.filter(
    (e) => e.category === 'pwa_sw' && e.action === 'push_notification'
  );
  if (notificationEvents.length === 0) {
    recommendations.push({
      category: 'engagement',
      priority: 'low',
      message: '푸시 알림을 통한 사용자 재참여를 고려해보세요.',
      metric: 'push_notifications',
      current: '미사용',
      target: '활용',
    });
  }

  return recommendations;
}

export default async function handler(req, res) {
  // CORS 헤더 설정
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // PWA 통계 조회
    const { period = 'today', type = 'summary' } = req.query;

    try {
      if (type === 'summary') {
        // 요약 통계
        const today = new Date().toISOString().split('T')[0];
        const todayData = pwaStore.dailyStats.get(today) || {
          sessions: { total: 0, standalone: 0, browser: 0 },
          install: { promptsShown: 0, installs: 0 },
          usage: { totalTime: 0, standaloneTime: 0 },
        };

        const summary = {
          today: todayData,
          totalSessions: pwaStore.sessions.size,
          installFunnel: pwaStore.installFunnel,
          conversionRate:
            pwaStore.installFunnel.promptsShown > 0
              ? (
                  (pwaStore.installFunnel.installsCompleted / pwaStore.installFunnel.promptsShown) *
                  100
                ).toFixed(2)
              : 0,
        };

        res.status(200).json(summary);
      } else if (type === 'detailed') {
        // 상세 분석
        const dates = Array.from(pwaStore.dailyStats.keys()).sort().slice(-7); // 최근 7일
        const detailedData = dates.map((date) => ({
          date,
          ...pwaStore.dailyStats.get(date),
        }));

        res.status(200).json({ period, data: detailedData });
      }
    } catch (error) {
      console.error('PWA Analytics GET Error:', error);
      res.status(500).json({ error: 'Failed to retrieve analytics' });
    }
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, timestamp, metrics, events, sessionDuration, userAgent, url, type } =
      req.body;

    // 입력 데이터 검증
    if (!sessionId || !events || !Array.isArray(events)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Missing required fields: sessionId, events',
      });
    }

    // 세션 데이터 저장/업데이트
    const sessionData = {
      sessionId,
      timestamp,
      sessionDuration,
      userAgent,
      url,
      type: type || 'regular',
      lastUpdate: Date.now(),
    };

    pwaStore.sessions.set(sessionId, sessionData);

    // 이벤트 분석
    const installFunnel = analyzeInstallFunnel(events);
    const usagePatterns = analyzeUsagePatterns(events, metrics);
    const deviceInfo = analyzeDeviceAndBrowser(userAgent || '', events);

    // 글로벌 설치 퍼널 업데이트
    pwaStore.installFunnel.promptsShown += installFunnel.promptShown;
    pwaStore.installFunnel.installsAttempted += installFunnel.promptTriggered;
    pwaStore.installFunnel.installsCompleted += installFunnel.installCompleted;
    pwaStore.installFunnel.dismissals += installFunnel.userDismissed;

    // 일일 통계 업데이트
    updateDailyStats(sessionData, events, metrics);

    // PWA 성능 점수 계산
    const pwaScore = calculatePWAScore(metrics, events);

    // 개선 권장사항 생성
    const recommendations = generateRecommendations(metrics, events, pwaScore);

    // 응답 생성
    const response = {
      success: true,
      sessionId,
      processed: events.length,
      analysis: {
        installFunnel,
        usagePatterns,
        deviceInfo,
        pwaScore,
        recommendations: recommendations.slice(0, 3), // 상위 3개만
      },
      timestamp: Date.now(),
    };

    // 개발 환경에서 추가 정보 제공
    if (process.env.NODE_ENV === 'development') {
      response.debug = {
        metricsReceived: metrics,
        eventsProcessed: events.length,
        sessionType: type,
      };
    }

    console.log(`PWA Analytics: Processed ${events.length} events for session ${sessionId}`);

    res.status(200).json(response);
  } catch (error) {
    console.error('PWA Analytics Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process PWA analytics',
      timestamp: Date.now(),
    });
  }
}

// PWA 대시보드 데이터 조회 (관리자용)
export async function getPWADashboard(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const todayData = pwaStore.dailyStats.get(today) || {};
    const yesterdayData = pwaStore.dailyStats.get(yesterday) || {};

    // 주간 데이터 (최근 7일)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const data = pwaStore.dailyStats.get(date);
      if (data) {
        weeklyData.push(data);
      }
    }

    const dashboard = {
      summary: {
        totalSessions: pwaStore.sessions.size,
        activeSessions: Array.from(pwaStore.sessions.values()).filter(
          (s) => Date.now() - s.lastUpdate < 30 * 60 * 1000
        ).length, // 30분 이내
        installConversion:
          pwaStore.installFunnel.promptsShown > 0
            ? (
                (pwaStore.installFunnel.installsCompleted / pwaStore.installFunnel.promptsShown) *
                100
              ).toFixed(2)
            : 0,
      },
      today: todayData,
      yesterday: yesterdayData,
      weeklyTrend: weeklyData,
      installFunnel: pwaStore.installFunnel,
      topRecommendations: [
        // 전체 데이터 기반 권장사항을 여기에 추가할 수 있음
      ],
    };

    res.status(200).json(dashboard);
  } catch (error) {
    console.error('PWA Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to generate dashboard' });
  }
}
