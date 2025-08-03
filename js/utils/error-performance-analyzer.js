/**
 * 🔍 에러-성능 상관관계 분석기
 * JavaScript 에러와 성능 메트릭 간의 상관관계를 분석
 */

class ErrorPerformanceAnalyzer {
  constructor() {
    this.errorData = [];
    this.performanceData = [];
    this.correlationCache = new Map();
    this.analysisInterval = 300000; // 5분마다 분석
    this.maxDataPoints = 100; // 최대 데이터 포인트

    this.startAnalysis();
  }

  // 분석 시작
  startAnalysis() {
    // 주기적 분석
    setInterval(() => {
      this.performCorrelationAnalysis();
    }, this.analysisInterval);

    // 에러 이벤트 리스너 설정
    this.setupErrorTracking();

    console.log('Error-Performance correlation analysis started');
  }

  // 에러 추적 설정
  setupErrorTracking() {
    // JavaScript 에러 추적
    window.addEventListener('error', (event) => {
      this.recordError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: window.location.href,
      });
    });

    // Promise rejection 추적
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        type: 'promise_rejection',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        reason: event.reason,
        timestamp: Date.now(),
        url: window.location.href,
      });
    });

    // 리소스 로딩 에러 추적
    window.addEventListener(
      'error',
      (event) => {
        if (event.target !== window) {
          this.recordError({
            type: 'resource_error',
            resource: event.target.tagName,
            src: event.target.src || event.target.href,
            timestamp: Date.now(),
            url: window.location.href,
          });
        }
      },
      true
    );

    // Network 에러 추적 (fetch 래퍼)
    this.wrapFetchForErrorTracking();
  }

  // Fetch API 에러 추적 래퍼
  wrapFetchForErrorTracking() {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const startTime = performance.now();

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();

        // 응답 시간이 느린 경우 기록
        if (endTime - startTime > 5000) {
          this.recordError({
            type: 'slow_request',
            url: args[0],
            duration: endTime - startTime,
            status: response.status,
            timestamp: Date.now(),
          });
        }

        // HTTP 에러 상태 기록
        if (!response.ok) {
          this.recordError({
            type: 'http_error',
            url: args[0],
            status: response.status,
            statusText: response.statusText,
            timestamp: Date.now(),
          });
        }

        return response;
      } catch (error) {
        // Network 에러 기록
        this.recordError({
          type: 'network_error',
          url: args[0],
          message: error.message,
          timestamp: Date.now(),
        });

        throw error;
      }
    };
  }

  // 에러 기록
  recordError(errorInfo) {
    // 성능 메트릭도 함께 수집
    const performanceSnapshot = this.getCurrentPerformanceSnapshot();

    const errorRecord = {
      ...errorInfo,
      id: this.generateId(),
      performance: performanceSnapshot,
      sessionId: window.Analytics?.sessionId,
      userId: window.Analytics?.userId,
    };

    this.errorData.push(errorRecord);

    // 최대 데이터 포인트 제한
    if (this.errorData.length > this.maxDataPoints) {
      this.errorData.shift();
    }

    // 에러 발생 시 즉시 분석 수행
    this.performImmediateAnalysis(errorRecord);

    // GA4에 전송
    if (window.Analytics?.trackGA4Event) {
      window.Analytics.trackGA4Event('error_performance_correlation', {
        error_type: errorInfo.type,
        has_performance_impact: performanceSnapshot.score < 70,
      });
    }
  }

  // 현재 성능 스냅샷 수집
  getCurrentPerformanceSnapshot() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paintEntries = performance.getEntriesByType('paint');

    return {
      timestamp: Date.now(),

      // Core Web Vitals
      fcp: paintEntries.find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0,

      // Navigation Timing
      domContentLoaded: navigation
        ? navigation.domContentLoadedEventEnd - navigation.navigationStart
        : 0,
      loadComplete: navigation ? navigation.loadEventEnd - navigation.navigationStart : 0,

      // Memory usage (if available)
      memory: performance.memory
        ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
          }
        : null,

      // Page state
      scrollY: window.scrollY,
      isVisible: !document.hidden,

      // Calculate simple performance score
      score: this.calculateSimplePerformanceScore(navigation, paintEntries),
    };
  }

  // 간단한 성능 점수 계산
  calculateSimplePerformanceScore(navigation, paintEntries) {
    if (!navigation) {
      return 50;
    }

    const fcp =
      paintEntries.find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0;
    const loadTime = navigation.loadEventEnd - navigation.navigationStart;

    let score = 100;

    // FCP 기준 점수 차감
    if (fcp > 2000) {
      score -= 20;
    }
    if (fcp > 4000) {
      score -= 30;
    }

    // Load time 기준 점수 차감
    if (loadTime > 3000) {
      score -= 20;
    }
    if (loadTime > 5000) {
      score -= 30;
    }

    return Math.max(0, score);
  }

  // 즉시 분석 수행
  performImmediateAnalysis(errorRecord) {
    // Critical 에러 감지
    if (this.isCriticalError(errorRecord)) {
      this.handleCriticalError(errorRecord);
    }

    // 성능 저하와 연관된 에러 감지
    if (this.isPerformanceRelatedError(errorRecord)) {
      this.handlePerformanceRelatedError(errorRecord);
    }
  }

  // Critical 에러 판단
  isCriticalError(errorRecord) {
    const criticalPatterns = [
      /cannot read property/i,
      /is not a function/i,
      /network error/i,
      /failed to fetch/i,
      /chunkloaderror/i,
      /script error/i,
    ];

    const isCriticalType = ['network_error', 'resource_error'].includes(errorRecord.type);
    const isCriticalMessage = criticalPatterns.some((pattern) =>
      pattern.test(errorRecord.message || '')
    );

    return isCriticalType || isCriticalMessage;
  }

  // 성능 관련 에러 판단
  isPerformanceRelatedError(errorRecord) {
    return (
      errorRecord.type === 'slow_request' ||
      errorRecord.performance?.score < 50 ||
      errorRecord.performance?.memory?.used / errorRecord.performance?.memory?.limit > 0.9
    );
  }

  // Critical 에러 처리
  handleCriticalError(errorRecord) {
    const criticalData = {
      errorId: errorRecord.id,
      type: errorRecord.type,
      message: errorRecord.message,
      url: errorRecord.url,
      timestamp: errorRecord.timestamp,
      performanceImpact: errorRecord.performance?.score || 0,

      korean: {
        severity: 'Critical',
        message: 'Critical 에러가 감지되었습니다',
        impact: errorRecord.performance?.score < 50 ? '성능에 심각한 영향' : '성능 영향 제한적',
      },
    };

    // 즉시 알림 전송
    this.sendCriticalAlert(criticalData);

    // 로컬 스토리지에 저장
    this.saveCriticalError(criticalData);
  }

  // 성능 관련 에러 처리
  handlePerformanceRelatedError(errorRecord) {
    const performanceData = {
      errorId: errorRecord.id,
      type: 'performance_degradation',
      cause: errorRecord.type,
      performanceScore: errorRecord.performance?.score,
      timestamp: errorRecord.timestamp,

      korean: {
        message: '성능 저하와 관련된 에러가 감지되었습니다',
        recommendation: this.getPerformanceRecommendation(errorRecord),
      },
    };

    this.recordPerformanceDegradation(performanceData);
  }

  // 상관관계 분석 수행
  async performCorrelationAnalysis() {
    if (this.errorData.length < 5) {
      return; // 충분한 데이터가 없음
    }

    try {
      const analysis = {
        timestamp: Date.now(),
        period: {
          start: this.errorData[0].timestamp,
          end: this.errorData[this.errorData.length - 1].timestamp,
          duration:
            this.errorData[this.errorData.length - 1].timestamp - this.errorData[0].timestamp,
        },

        // 에러 통계
        errorStats: this.calculateErrorStats(),

        // 성능 통계
        performanceStats: this.calculatePerformanceStats(),

        // 상관관계 분석
        correlations: this.calculateCorrelations(),

        // 패턴 분석
        patterns: this.analyzePatterns(),

        // 한국어 요약
        korean: {},
      };

      analysis.korean = this.generateKoreanAnalysis(analysis);

      // 결과 저장
      this.saveAnalysisResult(analysis);

      // 임계값 확인 및 알림
      this.checkThresholds(analysis);

      return analysis;
    } catch (error) {
      console.error('Correlation analysis failed:', error);
    }
  }

  // 에러 통계 계산
  calculateErrorStats() {
    const errorTypes = {};
    const errorFrequency = {};
    const totalErrors = this.errorData.length;

    this.errorData.forEach((error) => {
      // 타입별 분류
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;

      // 시간대별 빈도
      const hour = new Date(error.timestamp).getHours();
      errorFrequency[hour] = (errorFrequency[hour] || 0) + 1;
    });

    return {
      total: totalErrors,
      types: errorTypes,
      frequency: errorFrequency,
      averagePerHour: totalErrors / 24,
      mostCommonType: Object.keys(errorTypes).reduce((a, b) =>
        errorTypes[a] > errorTypes[b] ? a : b
      ),
    };
  }

  // 성능 통계 계산
  calculatePerformanceStats() {
    const scores = this.errorData
      .map((error) => error.performance?.score)
      .filter((score) => score !== undefined);

    if (scores.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        degradationEvents: 0,
      };
    }

    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const degradationEvents = scores.filter((score) => score < 50).length;

    return {
      average: Math.round(average),
      min,
      max,
      degradationEvents,
      degradationRate: (degradationEvents / scores.length) * 100,
    };
  }

  // 상관관계 계산
  calculateCorrelations() {
    const correlations = {};

    // 에러 발생과 성능 점수 상관관계
    const errorTimes = this.errorData.map((error) => error.timestamp);
    const performanceScores = this.errorData.map((error) => error.performance?.score || 50);

    if (errorTimes.length > 1 && performanceScores.length > 1) {
      correlations.errorPerformance = this.calculatePearsonCorrelation(
        errorTimes,
        performanceScores
      );
    }

    // 에러 타입별 성능 영향
    const errorTypes = ['javascript_error', 'network_error', 'resource_error', 'slow_request'];

    errorTypes.forEach((type) => {
      const typeErrors = this.errorData.filter((error) => error.type === type);
      if (typeErrors.length > 0) {
        const avgPerformance =
          typeErrors.reduce((sum, error) => sum + (error.performance?.score || 50), 0) /
          typeErrors.length;

        correlations[`${type}_performance`] = {
          count: typeErrors.length,
          averagePerformanceScore: Math.round(avgPerformance),
          impact: avgPerformance < 60 ? 'high' : avgPerformance < 80 ? 'medium' : 'low',
        };
      }
    });

    return correlations;
  }

  // 피어슨 상관계수 계산
  calculatePearsonCorrelation(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 2) {
      return 0;
    }

    const xMean = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;

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

    const denominator = Math.sqrt(xDenominator * yDenominator);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  // 패턴 분석
  analyzePatterns() {
    const patterns = {
      timePatterns: this.analyzeTimePatterns(),
      errorBursts: this.detectErrorBursts(),
      performanceDegradation: this.detectPerformanceDegradation(),
      cascadingErrors: this.detectCascadingErrors(),
    };

    return patterns;
  }

  // 시간 패턴 분석
  analyzeTimePatterns() {
    const hourlyDistribution = {};

    this.errorData.forEach((error) => {
      const hour = new Date(error.timestamp).getHours();
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
    });

    // 피크 시간대 찾기
    const peakHour = Object.keys(hourlyDistribution).reduce((a, b) =>
      hourlyDistribution[a] > hourlyDistribution[b] ? a : b
    );

    return {
      distribution: hourlyDistribution,
      peakHour: parseInt(peakHour),
      peakCount: hourlyDistribution[peakHour] || 0,
    };
  }

  // 에러 버스트 감지
  detectErrorBursts() {
    const bursts = [];
    const timeWindow = 60000; // 1분 윈도우

    for (let i = 0; i < this.errorData.length; i++) {
      const currentTime = this.errorData[i].timestamp;
      const errorsInWindow = this.errorData.filter(
        (error) => error.timestamp >= currentTime && error.timestamp <= currentTime + timeWindow
      );

      if (errorsInWindow.length >= 3) {
        // 1분에 3개 이상 에러
        bursts.push({
          startTime: currentTime,
          count: errorsInWindow.length,
          types: [...new Set(errorsInWindow.map((e) => e.type))],
        });
      }
    }

    return bursts;
  }

  // 성능 저하 감지
  detectPerformanceDegradation() {
    const degradationEvents = [];
    let consecutiveLowScores = 0;

    this.errorData.forEach((error, index) => {
      const score = error.performance?.score || 50;

      if (score < 50) {
        consecutiveLowScores++;
      } else {
        if (consecutiveLowScores >= 3) {
          degradationEvents.push({
            startIndex: index - consecutiveLowScores,
            endIndex: index - 1,
            duration: consecutiveLowScores,
            averageScore:
              this.errorData
                .slice(index - consecutiveLowScores, index)
                .reduce((sum, e) => sum + (e.performance?.score || 50), 0) / consecutiveLowScores,
          });
        }
        consecutiveLowScores = 0;
      }
    });

    return degradationEvents;
  }

  // 연쇄 에러 감지
  detectCascadingErrors() {
    const cascades = [];
    const timeWindow = 5000; // 5초 윈도우

    this.errorData.forEach((error, index) => {
      if (error.type === 'javascript_error') {
        const subsequentErrors = this.errorData
          .slice(index + 1)
          .filter(
            (e) => e.timestamp - error.timestamp <= timeWindow && e.type !== 'javascript_error'
          );

        if (subsequentErrors.length >= 2) {
          cascades.push({
            initialError: error,
            cascadedErrors: subsequentErrors,
            totalImpact: subsequentErrors.length + 1,
          });
        }
      }
    });

    return cascades;
  }

  // 한국어 분석 결과 생성
  generateKoreanAnalysis(analysis) {
    const { errorStats, performanceStats, correlations } = analysis;

    return {
      summary: `${errorStats.total}개의 에러가 발생했으며, 평균 성능 점수는 ${performanceStats.average}점입니다.`,

      errorSeverity: errorStats.total > 50 ? '높음' : errorStats.total > 20 ? '보통' : '낮음',

      performanceImpact:
        performanceStats.average < 50 ? '심각' : performanceStats.average < 70 ? '보통' : '경미',

      recommendation: this.getAnalysisRecommendation(analysis),

      actionRequired: this.determineActionRequired(analysis),
    };
  }

  // 분석 기반 권장사항
  getAnalysisRecommendation(analysis) {
    const { errorStats, performanceStats } = analysis;

    if (performanceStats.degradationRate > 30) {
      return '성능 저하 이벤트가 빈번합니다. 코드 최적화와 리소스 최적화를 검토하세요.';
    }

    if (errorStats.types.network_error > errorStats.total * 0.3) {
      return '네트워크 에러가 많습니다. API 안정성과 CDN 설정을 확인하세요.';
    }

    if (errorStats.types.javascript_error > errorStats.total * 0.5) {
      return 'JavaScript 에러가 많습니다. 코드 리뷰와 에러 핸들링을 강화하세요.';
    }

    return '전반적으로 안정적입니다. 지속적인 모니터링을 유지하세요.';
  }

  // 필요한 조치 결정
  determineActionRequired(analysis) {
    const { errorStats, performanceStats } = analysis;

    if (performanceStats.average < 40 || errorStats.total > 100) {
      return 'immediate'; // 즉시 조치 필요
    }

    if (performanceStats.average < 60 || errorStats.total > 50) {
      return 'soon'; // 빠른 시일 내 조치 필요
    }

    return 'monitor'; // 지속 모니터링
  }

  // 성능 권장사항
  getPerformanceRecommendation(errorRecord) {
    switch (errorRecord.type) {
      case 'slow_request':
        return 'API 응답 시간을 개선하거나 캐싱을 고려하세요';
      case 'resource_error':
        return '리소스 로딩 실패를 방지하기 위해 CDN과 폴백을 설정하세요';
      case 'javascript_error':
        return 'JavaScript 에러를 수정하여 성능 저하를 방지하세요';
      default:
        return '에러 빈도를 줄여 전체적인 성능을 개선하세요';
    }
  }

  // Critical 알림 전송
  async sendCriticalAlert(criticalData) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'critical_error_alert',
          data: criticalData,
        }),
      });
    } catch (error) {
      console.error('Failed to send critical alert:', error);
    }
  }

  // Critical 에러 로컬 저장
  saveCriticalError(criticalData) {
    try {
      const existing = JSON.parse(localStorage.getItem('criticalErrors') || '[]');
      existing.push(criticalData);

      // 최대 50개만 유지
      if (existing.length > 50) {
        existing.splice(0, existing.length - 50);
      }

      localStorage.setItem('criticalErrors', JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to save critical error:', error);
    }
  }

  // 성능 저하 기록
  recordPerformanceDegradation(performanceData) {
    try {
      const existing = JSON.parse(localStorage.getItem('performanceDegradations') || '[]');
      existing.push(performanceData);

      if (existing.length > 100) {
        existing.splice(0, existing.length - 100);
      }

      localStorage.setItem('performanceDegradations', JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to record performance degradation:', error);
    }
  }

  // 분석 결과 저장
  async saveAnalysisResult(analysis) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'correlation_analysis',
          data: analysis,
        }),
      });
    } catch (error) {
      console.error('Failed to save analysis result:', error);
    }
  }

  // 임계값 확인
  checkThresholds(analysis) {
    const { errorStats, performanceStats } = analysis;

    // Critical 임계값 확인
    if (errorStats.total > 100 || performanceStats.average < 40) {
      this.triggerCriticalAlert(analysis);
    }

    // 성능 저하 임계값 확인
    if (performanceStats.degradationRate > 50) {
      this.triggerPerformanceAlert(analysis);
    }
  }

  // Critical 알림 발동
  triggerCriticalAlert(analysis) {
    const alertData = {
      type: 'critical_threshold_exceeded',
      analysis,
      timestamp: Date.now(),
      korean: {
        message: 'Critical 임계값을 초과했습니다',
        recommendation: '즉시 조치가 필요합니다',
      },
    };

    this.sendCriticalAlert(alertData);
  }

  // 성능 알림 발동
  triggerPerformanceAlert(analysis) {
    const alertData = {
      type: 'performance_degradation_alert',
      analysis,
      timestamp: Date.now(),
      korean: {
        message: '성능 저하가 감지되었습니다',
        recommendation: '성능 최적화가 필요합니다',
      },
    };

    this.sendCriticalAlert(alertData);
  }

  // ID 생성
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 분석 데이터 가져오기
  getAnalysisData() {
    return {
      errorData: this.errorData,
      totalErrors: this.errorData.length,
      recentAnalysis: this.correlationCache.get('latest'),
      criticalErrors: JSON.parse(localStorage.getItem('criticalErrors') || '[]'),
      performanceDegradations: JSON.parse(localStorage.getItem('performanceDegradations') || '[]'),
    };
  }

  // 분석 초기화
  reset() {
    this.errorData = [];
    this.performanceData = [];
    this.correlationCache.clear();
    localStorage.removeItem('criticalErrors');
    localStorage.removeItem('performanceDegradations');
  }
}

// 전역 인스턴스 생성
if (typeof window !== 'undefined') {
  window.ErrorPerformanceAnalyzer = new ErrorPerformanceAnalyzer();
}

export default ErrorPerformanceAnalyzer;
