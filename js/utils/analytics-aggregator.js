/**
 * 📊 Analytics 데이터 집계 유틸리티
 * 주간/월간 단위로 성능 및 사용자 데이터를 집계 분석
 */

class AnalyticsAggregator {
  constructor() {
    this.apiEndpoint = '/api/lighthouse-metrics';
    this.cache = new Map();
    this.cacheTTL = 300000; // 5분 캐시
  }

  // 주간 데이터 집계
  async getWeeklyAggregation() {
    const cacheKey = 'weekly_aggregation';
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

      const data = await this.fetchAggregatedData('week');
      const result = {
        period: 'weekly',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        ...data,

        // 한국어 요약
        korean: {
          period: '주간',
          summary: this.generateKoreanSummary(data, 'week'),
          recommendations: this.generateRecommendations(data),
        },

        // 트렌드 분석
        trends: await this.analyzeTrends(data, 'week'),

        // 개선 포인트
        improvements: this.identifyImprovements(data),
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Weekly aggregation failed:', error);
      throw error;
    }
  }

  // 월간 데이터 집계
  async getMonthlyAggregation() {
    const cacheKey = 'monthly_aggregation';
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      const data = await this.fetchAggregatedData('month');
      const result = {
        period: 'monthly',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        ...data,

        // 한국어 요약
        korean: {
          period: '월간',
          summary: this.generateKoreanSummary(data, 'month'),
          recommendations: this.generateRecommendations(data),
        },

        // 트렌드 분석
        trends: await this.analyzeTrends(data, 'month'),

        // 월간 목표 달성도
        goals: this.calculateGoalAchievement(data),
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Monthly aggregation failed:', error);
      throw error;
    }
  }

  // API에서 집계 데이터 가져오기
  async fetchAggregatedData(period) {
    try {
      const response = await fetch(`${this.apiEndpoint}?aggregate=true&period=${period}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to fetch aggregated data:', error);
      // 실패 시 로컬 데이터 사용
      return this.getLocalFallbackData(period);
    }
  }

  // 트렌드 분석
  async analyzeTrends(data, period) {
    try {
      const days = period === 'week' ? 7 : 30;
      const dailyData = await this.getDailyData(days);

      if (dailyData.length < 2) {
        return {
          trend: 'insufficient_data',
          direction: 'stable',
          korean: '데이터가 부족하여 트렌드를 분석할 수 없습니다',
        };
      }

      // 성능 점수 트렌드
      const performanceScores = dailyData
        .filter((day) => day.averageScore)
        .map((day) => day.averageScore);

      const trend = this.calculateTrend(performanceScores);

      return {
        trend: trend.direction,
        slope: trend.slope,
        correlation: trend.correlation,
        korean: {
          direction: this.getTrendKorean(trend.direction),
          description: this.generateTrendDescription(trend, period),
        },

        // 메트릭별 트렌드
        metrics: {
          fcp: this.calculateMetricTrend(dailyData, 'fcp'),
          lcp: this.calculateMetricTrend(dailyData, 'lcp'),
          cls: this.calculateMetricTrend(dailyData, 'cls'),
          fid: this.calculateMetricTrend(dailyData, 'fid'),
        },
      };
    } catch (error) {
      console.error('Trend analysis failed:', error);
      return {
        trend: 'error',
        korean: '트렌드 분석 중 오류가 발생했습니다',
      };
    }
  }

  // 일별 데이터 수집
  async getDailyData(days) {
    const dailyData = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      try {
        const response = await fetch(`${this.apiEndpoint}?date=${dateStr}&limit=1000`);
        if (response.ok) {
          const result = await response.json();
          const metrics = result.data;

          if (metrics.length > 0) {
            // 일별 평균 계산
            const avgScore =
              metrics.reduce((sum, m) => sum + (m.performanceScore || 0), 0) / metrics.length;
            const avgFcp = metrics.reduce((sum, m) => sum + (m.fcp || 0), 0) / metrics.length;
            const avgLcp = metrics.reduce((sum, m) => sum + (m.lcp || 0), 0) / metrics.length;
            const avgCls = metrics.reduce((sum, m) => sum + (m.cls || 0), 0) / metrics.length;
            const avgFid = metrics.reduce((sum, m) => sum + (m.fid || 0), 0) / metrics.length;

            dailyData.push({
              date: dateStr,
              count: metrics.length,
              averageScore: Math.round(avgScore),
              fcp: Math.round(avgFcp),
              lcp: Math.round(avgLcp),
              cls: Math.round(avgCls * 1000) / 1000, // CLS는 소수점 3자리
              fid: Math.round(avgFid),
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch data for ${dateStr}`);
      }
    }

    return dailyData.reverse(); // 시간순 정렬
  }

  // 트렌드 계산 (선형 회귀)
  calculateTrend(values) {
    if (values.length < 2) {
      return { direction: 'stable', slope: 0, correlation: 0 };
    }

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    // 평균 계산
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;

    // 기울기와 상관관계 계산
    let numerator = 0;
    let xDenominator = 0;
    let yDenominator = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;

      numerator += xDiff * yDiff;
      xDenominator += xDiff * xDiff;
      yDenominator += yDiff * yDiff;
    }

    const slope = xDenominator === 0 ? 0 : numerator / xDenominator;
    const correlation =
      Math.sqrt(xDenominator * yDenominator) === 0
        ? 0
        : numerator / Math.sqrt(xDenominator * yDenominator);

    let direction = 'stable';
    if (Math.abs(slope) > 0.5) {
      direction = slope > 0 ? 'improving' : 'declining';
    }

    return { direction, slope, correlation };
  }

  // 메트릭별 트렌드 계산
  calculateMetricTrend(dailyData, metric) {
    const values = dailyData.filter((day) => day[metric] !== undefined).map((day) => day[metric]);

    if (values.length < 2) {
      return { trend: 'stable', korean: '데이터 부족' };
    }

    const trend = this.calculateTrend(values);

    return {
      trend: trend.direction,
      slope: trend.slope,
      korean: this.getMetricTrendKorean(metric, trend.direction),
    };
  }

  // 한국어 요약 생성
  generateKoreanSummary(data, period) {
    const score = data.averageScores?.performanceScore || 0;
    const periodKorean = period === 'week' ? '주간' : '월간';

    let status = '';
    if (score >= 90) {
      status = '우수';
    } else if (score >= 75) {
      status = '양호';
    } else if (score >= 60) {
      status = '보통';
    } else {
      status = '개선필요';
    }

    return {
      overall: `${periodKorean} 평균 성능 점수는 ${score}점으로 ${status} 수준입니다.`,
      samples: `총 ${data.totalSamples || 0}개의 성능 측정 데이터를 기반으로 분석했습니다.`,
      status,
    };
  }

  // 권장사항 생성
  generateRecommendations(data) {
    const recommendations = [];
    const scores = data.averageScores || {};

    // FCP 개선 권장사항
    if (scores.fcp && scores.fcp > 2000) {
      recommendations.push({
        metric: 'FCP',
        issue: 'First Contentful Paint가 느림',
        recommendation: 'CSS 최적화, 폰트 프리로딩, 이미지 최적화를 고려하세요',
        priority: scores.fcp > 4000 ? 'high' : 'medium',
      });
    }

    // LCP 개선 권장사항
    if (scores.lcp && scores.lcp > 2500) {
      recommendations.push({
        metric: 'LCP',
        issue: 'Largest Contentful Paint가 느림',
        recommendation: '주요 이미지 최적화, 서버 응답 시간 개선을 고려하세요',
        priority: scores.lcp > 4000 ? 'high' : 'medium',
      });
    }

    // CLS 개선 권장사항
    if (scores.cls && scores.cls > 0.1) {
      recommendations.push({
        metric: 'CLS',
        issue: 'Cumulative Layout Shift가 높음',
        recommendation: '이미지 크기 명시, 동적 콘텐츠 영역 예약을 고려하세요',
        priority: scores.cls > 0.25 ? 'high' : 'medium',
      });
    }

    // 전체 성능 점수 기반 권장사항
    if (scores.performanceScore && scores.performanceScore < 75) {
      recommendations.push({
        metric: 'Overall',
        issue: '전체 성능 점수가 낮음',
        recommendation: '코드 스플리팅, 번들 크기 최적화, CDN 도입을 고려하세요',
        priority: 'high',
      });
    }

    return recommendations;
  }

  // 개선 포인트 식별
  identifyImprovements(data) {
    const improvements = [];
    const scores = data.averageScores || {};

    // 가장 낮은 점수의 메트릭 찾기
    const metrics = ['fcp', 'lcp', 'cls', 'fid'];
    const metricScores = metrics
      .filter((metric) => scores[metric] !== undefined)
      .map((metric) => ({
        name: metric,
        score: this.calculateMetricScore(metric, scores[metric]),
      }))
      .sort((a, b) => a.score - b.score);

    if (metricScores.length > 0) {
      const worst = metricScores[0];
      improvements.push({
        type: 'priority',
        metric: worst.name,
        score: worst.score,
        korean: this.getImprovementKorean(worst.name),
      });
    }

    return improvements;
  }

  // 메트릭 점수 계산
  calculateMetricScore(metric, value) {
    switch (metric) {
      case 'fcp':
        return value <= 2000 ? 100 : value <= 4000 ? 50 : 0;
      case 'lcp':
        return value <= 2500 ? 100 : value <= 4000 ? 50 : 0;
      case 'cls':
        return value <= 0.1 ? 100 : value <= 0.25 ? 50 : 0;
      case 'fid':
        return value <= 100 ? 100 : value <= 300 ? 50 : 0;
      default:
        return 0;
    }
  }

  // 목표 달성도 계산 (월간)
  calculateGoalAchievement(data) {
    const score = data.averageScores?.performanceScore || 0;
    const target = 85; // 목표 점수

    return {
      target,
      current: score,
      achievement: Math.round((score / target) * 100),
      status: score >= target ? 'achieved' : 'in_progress',
      korean: {
        target: `목표: ${target}점`,
        current: `현재: ${score}점`,
        status: score >= target ? '목표 달성' : '개선 중',
        message:
          score >= target
            ? '축하합니다! 성능 목표를 달성했습니다.'
            : `목표까지 ${target - score}점 더 필요합니다.`,
      },
    };
  }

  // 캐시 관리
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // 로컬 폴백 데이터
  getLocalFallbackData(period) {
    return {
      period,
      totalSamples: 0,
      averageScores: {},
      korean: {
        message: '데이터를 불러올 수 없습니다. 로컬 데이터를 사용합니다.',
      },
    };
  }

  // 헬퍼 메서드들
  getTrendKorean(direction) {
    switch (direction) {
      case 'improving':
        return '개선 중';
      case 'declining':
        return '악화 중';
      case 'stable':
        return '안정';
      default:
        return '알 수 없음';
    }
  }

  generateTrendDescription(trend, period) {
    const periodKorean = period === 'week' ? '주간' : '월간';
    const direction = this.getTrendKorean(trend.direction);

    if (trend.direction === 'improving') {
      return `${periodKorean} 성능이 지속적으로 개선되고 있습니다.`;
    } else if (trend.direction === 'declining') {
      return `${periodKorean} 성능이 하락 추세에 있습니다. 점검이 필요합니다.`;
    } else {
      return `${periodKorean} 성능이 안정적으로 유지되고 있습니다.`;
    }
  }

  getMetricTrendKorean(metric, direction) {
    const metricKorean = {
      fcp: 'First Contentful Paint',
      lcp: 'Largest Contentful Paint',
      cls: 'Cumulative Layout Shift',
      fid: 'First Input Delay',
    };

    const directionKorean = this.getTrendKorean(direction);
    return `${metricKorean[metric]} ${directionKorean}`;
  }

  getImprovementKorean(metric) {
    const improvements = {
      fcp: '첫 번째 콘텐츠 표시 속도 개선이 필요합니다',
      lcp: '주요 콘텐츠 로딩 속도 개선이 필요합니다',
      cls: '레이아웃 안정성 개선이 필요합니다',
      fid: '사용자 입력 응답 속도 개선이 필요합니다',
    };

    return improvements[metric] || '성능 개선이 필요합니다';
  }
}

// 전역 인스턴스 생성
if (typeof window !== 'undefined') {
  window.AnalyticsAggregator = new AnalyticsAggregator();
}

export default AnalyticsAggregator;
