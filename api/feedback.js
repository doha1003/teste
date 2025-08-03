/**
 * 사용자 피드백 수집 API
 * 한국어 UX 및 모바일 사용성 피드백을 수집하고 분석합니다.
 */

import { headers } from '../api/cors-config.js';

// 피드백 데이터 저장소
const feedbackStore = {
  submissions: [],
  analytics: {
    totalSubmissions: 0,
    averageRatings: {
      overall: 0,
      design: 0,
      usability: 0,
      mobile: 0,
      content: 0,
      performance: 0,
    },
    categoryFrequency: {},
    deviceBreakdown: {
      mobile: 0,
      tablet: 0,
      desktop: 0,
    },
    browserBreakdown: {},
    triggerReasons: {},
    satisfactionTrends: [],
  },
};

// 피드백 검증
function validateFeedback(feedback) {
  const requiredFields = ['overallRating', 'timestamp', 'deviceInfo'];

  for (const field of requiredFields) {
    if (!feedback[field]) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // 평점 범위 검증
  if (feedback.overallRating < 1 || feedback.overallRating > 5) {
    return { valid: false, error: 'Overall rating must be between 1 and 5' };
  }

  // 세부 평점 검증
  if (feedback.detailRatings) {
    for (const [category, rating] of Object.entries(feedback.detailRatings)) {
      if (rating < 1 || rating > 5) {
        return { valid: false, error: `Detail rating for ${category} must be between 1 and 5` };
      }
    }
  }

  // 타임스탬프 유효성 검사
  const submissionTime = new Date(feedback.timestamp).getTime();
  const now = Date.now();
  if (Math.abs(now - submissionTime) > 24 * 60 * 60 * 1000) {
    // 24시간 이내
    return { valid: false, error: 'Timestamp is too old or invalid' };
  }

  // 댓글 길이 제한
  if (feedback.comment && feedback.comment.length > 2000) {
    return { valid: false, error: 'Comment is too long (max 2000 characters)' };
  }

  return { valid: true };
}

// 피드백 처리 및 강화
function processFeedback(feedback) {
  const processed = {
    ...feedback,
    id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    processedAt: new Date().toISOString(),
    metadata: {
      source: 'feedback-collector',
      version: '1.0',
    },
  };

  // 기기 정보 분석
  if (feedback.deviceInfo) {
    processed.deviceAnalysis = analyzeDevice(feedback.deviceInfo);
  }

  // 감정 분석 (간단한 키워드 기반)
  if (feedback.comment) {
    processed.sentimentAnalysis = analyzeSentiment(feedback.comment);
  }

  // 카테고리 분석
  if (feedback.categories && feedback.categories.length > 0) {
    processed.categoryAnalysis = analyzeCategories(feedback.categories);
  }

  // 우선순위 계산
  processed.priority = calculatePriority(feedback);

  return processed;
}

// 기기 분석
function analyzeDevice(deviceInfo) {
  const analysis = {
    deviceType: deviceInfo.deviceType,
    isMobile: deviceInfo.deviceType === 'mobile',
    isTablet: deviceInfo.deviceType === 'tablet',
    browserFamily: getBrowserFamily(deviceInfo.userAgent),
    screenCategory: categorizeScreen(deviceInfo.screenSize),
    touchSupport: deviceInfo.touchSupport,
    connectionQuality: analyzeConnection(deviceInfo.connectionType),
  };

  return analysis;
}

function getBrowserFamily(userAgent) {
  if (userAgent.includes('Chrome')) return 'chrome';
  if (userAgent.includes('Firefox')) return 'firefox';
  if (userAgent.includes('Safari')) return 'safari';
  if (userAgent.includes('Edge')) return 'edge';
  return 'other';
}

function categorizeScreen(screenSize) {
  const [width, height] = screenSize.split('x').map(Number);
  const minDimension = Math.min(width, height);

  if (minDimension < 600) return 'small';
  if (minDimension < 1024) return 'medium';
  return 'large';
}

function analyzeConnection(connectionType) {
  if (!connectionType) return 'unknown';

  const effectiveType = connectionType.effectiveType;
  if (effectiveType === '4g') return 'fast';
  if (effectiveType === '3g') return 'medium';
  if (effectiveType === '2g' || effectiveType === 'slow-2g') return 'slow';
  return 'unknown';
}

// 감정 분석 (한국어 키워드 기반)
function analyzeSentiment(comment) {
  const positiveKeywords = [
    '좋',
    '훌륭',
    '편리',
    '만족',
    '쉬',
    '빠름',
    '깔끔',
    '예쁘',
    '유용',
    '도움',
    '완벽',
    '최고',
    '추천',
    '감사',
    '멋지',
    '간편',
    '직관적',
    '사용하기좋',
    '디자인좋',
  ];

  const negativeKeywords = [
    '나쁘',
    '불편',
    '어려움',
    '복잡',
    '느림',
    '오류',
    '버그',
    '문제',
    '실망',
    '아쉬',
    '개선',
    '고쳐',
    '수정',
    '틀렸',
    '잘못',
    '불만',
    '화남',
    '짜증',
    '답답',
  ];

  const neutralKeywords = ['보통', '그냥', '평범', '무난', '괜찮', '상관없', '그럭저럭'];

  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;

  const lowercaseComment = comment.toLowerCase();

  positiveKeywords.forEach((keyword) => {
    if (lowercaseComment.includes(keyword)) positiveScore++;
  });

  negativeKeywords.forEach((keyword) => {
    if (lowercaseComment.includes(keyword)) negativeScore++;
  });

  neutralKeywords.forEach((keyword) => {
    if (lowercaseComment.includes(keyword)) neutralScore++;
  });

  const totalKeywords = positiveScore + negativeScore + neutralScore;

  if (totalKeywords === 0) {
    return {
      sentiment: 'neutral',
      confidence: 0,
      scores: { positive: 0, negative: 0, neutral: 0 },
    };
  }

  const scores = {
    positive: positiveScore / totalKeywords,
    negative: negativeScore / totalKeywords,
    neutral: neutralScore / totalKeywords,
  };

  let sentiment = 'neutral';
  let confidence = 0;

  if (scores.positive > scores.negative && scores.positive > scores.neutral) {
    sentiment = 'positive';
    confidence = scores.positive;
  } else if (scores.negative > scores.positive && scores.negative > scores.neutral) {
    sentiment = 'negative';
    confidence = scores.negative;
  } else {
    sentiment = 'neutral';
    confidence = scores.neutral;
  }

  return { sentiment, confidence, scores };
}

// 카테고리 분석
function analyzeCategories(categories) {
  const categoryPriority = {
    'korean-ui': 'high',
    'mobile-layout': 'high',
    performance: 'high',
    accessibility: 'high',
    'test-experience': 'medium',
    'fortune-service': 'medium',
    'tool-usability': 'medium',
    other: 'low',
  };

  const analysis = {
    primaryCategory: categories[0] || 'other',
    categoryCount: categories.length,
    highPriorityCount: categories.filter((cat) => categoryPriority[cat] === 'high').length,
    categories: categories.map((cat) => ({
      name: cat,
      priority: categoryPriority[cat] || 'low',
    })),
  };

  return analysis;
}

// 우선순위 계산
function calculatePriority(feedback) {
  let score = 0;

  // 낮은 전체 평점 (높은 우선순위)
  if (feedback.overallRating <= 2) score += 30;
  else if (feedback.overallRating === 3) score += 15;

  // 세부 평점 중 낮은 것들
  if (feedback.detailRatings) {
    Object.values(feedback.detailRatings).forEach((rating) => {
      if (rating <= 2) score += 10;
      else if (rating === 3) score += 5;
    });
  }

  // 중요 카테고리
  if (feedback.categories) {
    const highPriorityCategories = ['korean-ui', 'mobile-layout', 'performance', 'accessibility'];
    feedback.categories.forEach((cat) => {
      if (highPriorityCategories.includes(cat)) score += 15;
    });
  }

  // 댓글 있음 (더 많은 정보)
  if (feedback.comment && feedback.comment.length > 50) score += 10;

  // 모바일 사용자
  if (feedback.deviceInfo && feedback.deviceInfo.deviceType === 'mobile') score += 5;

  // 오류로 인한 트리거
  if (feedback.triggerReason === 'error') score += 20;

  // 우선순위 레벨 결정
  if (score >= 50) return 'critical';
  if (score >= 30) return 'high';
  if (score >= 15) return 'medium';
  return 'low';
}

// 분석 데이터 업데이트
function updateAnalytics(feedback) {
  const analytics = feedbackStore.analytics;

  // 총 제출 수
  analytics.totalSubmissions++;

  // 평균 평점 업데이트
  const totalCount = analytics.totalSubmissions;
  analytics.averageRatings.overall =
    (analytics.averageRatings.overall * (totalCount - 1) + feedback.overallRating) / totalCount;

  // 세부 평점 평균 업데이트
  if (feedback.detailRatings) {
    Object.entries(feedback.detailRatings).forEach(([category, rating]) => {
      const currentAvg = analytics.averageRatings[category] || 0;
      analytics.averageRatings[category] = (currentAvg * (totalCount - 1) + rating) / totalCount;
    });
  }

  // 카테고리 빈도
  if (feedback.categories) {
    feedback.categories.forEach((category) => {
      analytics.categoryFrequency[category] = (analytics.categoryFrequency[category] || 0) + 1;
    });
  }

  // 기기 분포
  if (feedback.deviceInfo) {
    const deviceType = feedback.deviceInfo.deviceType;
    analytics.deviceBreakdown[deviceType] = (analytics.deviceBreakdown[deviceType] || 0) + 1;

    // 브라우저 분포
    const browser = getBrowserFamily(feedback.deviceInfo.userAgent);
    analytics.browserBreakdown[browser] = (analytics.browserBreakdown[browser] || 0) + 1;
  }

  // 트리거 이유
  if (feedback.triggerReason) {
    analytics.triggerReasons[feedback.triggerReason] =
      (analytics.triggerReasons[feedback.triggerReason] || 0) + 1;
  }

  // 만족도 트렌드 (일일 평균)
  const today = new Date().toISOString().split('T')[0];
  let todayTrend = analytics.satisfactionTrends.find((t) => t.date === today);
  if (!todayTrend) {
    todayTrend = { date: today, ratings: [], average: 0 };
    analytics.satisfactionTrends.push(todayTrend);
  }
  todayTrend.ratings.push(feedback.overallRating);
  todayTrend.average =
    todayTrend.ratings.reduce((sum, r) => sum + r, 0) / todayTrend.ratings.length;

  // 최근 30일만 유지
  analytics.satisfactionTrends = analytics.satisfactionTrends
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 30);
}

// 인사이트 생성
function generateInsights() {
  const analytics = feedbackStore.analytics;
  const insights = [];

  // 전체 만족도
  const overallSatisfaction = analytics.averageRatings.overall;
  if (overallSatisfaction < 3) {
    insights.push({
      type: 'warning',
      category: 'satisfaction',
      message: `전체 만족도가 낮습니다 (${overallSatisfaction.toFixed(1)}/5). 우선적인 개선이 필요합니다.`,
      priority: 'critical',
    });
  } else if (overallSatisfaction >= 4.5) {
    insights.push({
      type: 'success',
      category: 'satisfaction',
      message: `전체 만족도가 매우 높습니다 (${overallSatisfaction.toFixed(1)}/5). 현재 품질을 유지하세요.`,
      priority: 'low',
    });
  }

  // 모바일 사용성
  const mobileRatio = analytics.deviceBreakdown.mobile / analytics.totalSubmissions;
  const mobileUsability = analytics.averageRatings.mobile;
  if (mobileRatio > 0.5 && mobileUsability < 3.5) {
    insights.push({
      type: 'warning',
      category: 'mobile',
      message: `모바일 사용자 비율이 높은데 (${(mobileRatio * 100).toFixed(1)}%) 모바일 사용성 점수가 낮습니다 (${mobileUsability.toFixed(1)}/5).`,
      priority: 'high',
    });
  }

  // 성능 이슈
  const performanceRating = analytics.averageRatings.performance;
  if (performanceRating < 3) {
    insights.push({
      type: 'warning',
      category: 'performance',
      message: `성능 평점이 낮습니다 (${performanceRating.toFixed(1)}/5). 페이지 로딩 속도를 개선해보세요.`,
      priority: 'high',
    });
  }

  // 가장 많이 언급된 카테고리
  const topCategory = Object.entries(analytics.categoryFrequency).sort(([, a], [, b]) => b - a)[0];
  if (topCategory && topCategory[1] > analytics.totalSubmissions * 0.3) {
    insights.push({
      type: 'info',
      category: 'focus',
      message: `'${topCategory[0]}' 카테고리에 대한 피드백이 가장 많습니다 (${topCategory[1]}건). 이 영역에 집중적인 개선이 필요할 수 있습니다.`,
      priority: 'medium',
    });
  }

  return insights;
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
    // 피드백 분석 데이터 조회
    const { type = 'summary', limit = 50 } = req.query;

    try {
      if (type === 'summary') {
        // 요약 통계
        const insights = generateInsights();
        const summary = {
          totalSubmissions: feedbackStore.analytics.totalSubmissions,
          averageRatings: feedbackStore.analytics.averageRatings,
          deviceBreakdown: feedbackStore.analytics.deviceBreakdown,
          topCategories: Object.entries(feedbackStore.analytics.categoryFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5),
          insights,
          lastUpdate: new Date().toISOString(),
        };

        res.status(200).json(summary);
      } else if (type === 'detailed') {
        // 상세 데이터
        const recentFeedback = feedbackStore.submissions
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, parseInt(limit));

        res.status(200).json({
          feedback: recentFeedback,
          analytics: feedbackStore.analytics,
          insights: generateInsights(),
        });
      } else if (type === 'trends') {
        // 트렌드 데이터
        res.status(200).json({
          satisfactionTrends: feedbackStore.analytics.satisfactionTrends,
          categoryTrends: feedbackStore.analytics.categoryFrequency,
          deviceTrends: feedbackStore.analytics.deviceBreakdown,
        });
      }
    } catch (error) {
      console.error('Feedback GET Error:', error);
      res.status(500).json({ error: 'Failed to retrieve feedback data' });
    }
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const feedback = req.body;

    // 피드백 검증
    const validation = validateFeedback(feedback);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid feedback data',
        message: validation.error,
      });
    }

    // 피드백 처리
    const processedFeedback = processFeedback(feedback);

    // 저장
    feedbackStore.submissions.push(processedFeedback);

    // 최근 1000개만 유지 (메모리 관리)
    if (feedbackStore.submissions.length > 1000) {
      feedbackStore.submissions = feedbackStore.submissions.slice(-1000);
    }

    // 분석 데이터 업데이트
    updateAnalytics(processedFeedback);

    // 응답 생성
    const response = {
      success: true,
      feedbackId: processedFeedback.id,
      priority: processedFeedback.priority,
      analysis: {
        sentiment: processedFeedback.sentimentAnalysis?.sentiment || 'neutral',
        deviceType: processedFeedback.deviceAnalysis?.deviceType || 'unknown',
        categoryCount: processedFeedback.categoryAnalysis?.categoryCount || 0,
      },
      message: '소중한 피드백 감사합니다. 더 나은 서비스를 위해 활용하겠습니다.',
      timestamp: processedFeedback.processedAt,
    };

    // 개발 환경에서 추가 정보 제공
    if (process.env.NODE_ENV === 'development') {
      response.debug = {
        processedData: processedFeedback,
        currentAnalytics: feedbackStore.analytics,
      };
    }

    console.log(`피드백 수집됨: ${processedFeedback.id} (우선순위: ${processedFeedback.priority})`);

    // 중요 피드백 알림 (실제 환경에서는 Slack, 이메일 등)
    if (processedFeedback.priority === 'critical') {
      console.warn('🚨 중요 피드백 수집됨:', {
        id: processedFeedback.id,
        rating: processedFeedback.overallRating,
        categories: processedFeedback.categories,
        comment: processedFeedback.comment?.substring(0, 100),
      });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Feedback API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process feedback',
      timestamp: new Date().toISOString(),
    });
  }
}

// 피드백 대시보드 데이터 (관리자용)
export async function getFeedbackDashboard(req, res) {
  try {
    const dashboard = {
      overview: {
        totalSubmissions: feedbackStore.analytics.totalSubmissions,
        averageRating: feedbackStore.analytics.averageRatings.overall,
        responseRate: calculateResponseRate(),
        lastSubmission:
          feedbackStore.submissions.length > 0
            ? feedbackStore.submissions[feedbackStore.submissions.length - 1].timestamp
            : null,
      },
      ratings: feedbackStore.analytics.averageRatings,
      distribution: {
        devices: feedbackStore.analytics.deviceBreakdown,
        browsers: feedbackStore.analytics.browserBreakdown,
        categories: feedbackStore.analytics.categoryFrequency,
        triggers: feedbackStore.analytics.triggerReasons,
      },
      trends: feedbackStore.analytics.satisfactionTrends.slice(-7), // 최근 7일
      insights: generateInsights(),
      recentFeedback: feedbackStore.submissions
        .filter((f) => f.priority === 'critical' || f.priority === 'high')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10),
    };

    res.status(200).json(dashboard);
  } catch (error) {
    console.error('Feedback Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to generate dashboard' });
  }
}

function calculateResponseRate() {
  // 실제 환경에서는 방문자 수 대비 피드백 수로 계산
  // 여기서는 시뮬레이션된 값 반환
  return Math.min((feedbackStore.analytics.totalSubmissions / 1000) * 100, 100);
}
