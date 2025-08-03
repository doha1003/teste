/**
 * API 성능 모니터링 및 분석 시스템
 * - 실시간 성능 메트릭 수집
 * - API 응답 시간 추적
 * - 에러율 모니터링
 * - 캐시 히트율 분석
 * - 처리량 측정
 */

import { performance } from 'perf_hooks';
import { serverLogger } from './logging-middleware.js';
import { getAllCacheStats } from './cache-manager.js';

class PerformanceMonitor {
  constructor(options = {}) {
    this.config = {
      enableMetrics: options.enableMetrics !== false,
      enableAlerting: options.enableAlerting !== false,
      sampleRate: options.sampleRate || 1.0, // 100% 샘플링
      alertThresholds: {
        responseTime: options.responseTimeThreshold || 1000, // 1초
        errorRate: options.errorRateThreshold || 0.05, // 5%
        cacheHitRate: options.cacheHitRateThreshold || 0.8, // 80%
      },
      windowSize: options.windowSize || 300000, // 5분 윈도우
      maxDataPoints: options.maxDataPoints || 1000,
    };

    // 메트릭 데이터 저장소
    this.metrics = {
      requests: [],
      errors: [],
      responseTime: [],
      cacheHits: [],
      apiEndpoints: new Map(),
      systemHealth: [],
    };

    // 실시간 통계
    this.currentStats = {
      totalRequests: 0,
      totalErrors: 0,
      avgResponseTime: 0,
      currentThroughput: 0,
      cacheHitRate: 0,
      startTime: Date.now(),
    };

    // 정리 타이머
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // 1분마다

    // 통계 갱신 타이머
    this.statsInterval = setInterval(() => this.updateStats(), 10000); // 10초마다
  }

  /**
   * 요청 시작 추적
   */
  startRequest(requestId, endpoint, metadata = {}) {
    if (!this.config.enableMetrics || Math.random() > this.config.sampleRate) {
      return null;
    }

    const startTime = performance.now();
    const timestamp = Date.now();

    const requestData = {
      requestId,
      endpoint,
      startTime,
      timestamp,
      metadata: {
        userAgent: metadata.userAgent,
        ip: metadata.ip,
        method: metadata.method,
        contentLength: metadata.contentLength,
      },
    };

    return requestData;
  }

  /**
   * 요청 완료 추적
   */
  endRequest(requestData, statusCode, responseSize = 0, cached = false) {
    if (!requestData || !this.config.enableMetrics) {
      return;
    }

    const endTime = performance.now();
    const duration = endTime - requestData.startTime;
    const timestamp = Date.now();

    const completedRequest = {
      ...requestData,
      endTime,
      duration,
      statusCode,
      responseSize,
      cached,
      success: statusCode < 400,
    };

    // 메트릭 데이터 저장
    this.recordRequest(completedRequest);
    this.recordResponseTime(duration, requestData.endpoint);

    if (cached) {
      this.recordCacheHit(requestData.endpoint);
    } else {
      this.recordCacheMiss(requestData.endpoint);
    }

    if (!completedRequest.success) {
      this.recordError(completedRequest);
    }

    // 경고 확인
    this.checkAlerts(completedRequest);

    return completedRequest;
  }

  /**
   * 요청 데이터 기록
   */
  recordRequest(requestData) {
    this.metrics.requests.push({
      timestamp: requestData.timestamp,
      endpoint: requestData.endpoint,
      duration: requestData.duration,
      statusCode: requestData.statusCode,
      cached: requestData.cached,
      responseSize: requestData.responseSize,
    });

    // 엔드포인트별 통계 업데이트
    const endpointStats = this.metrics.apiEndpoints.get(requestData.endpoint) || {
      count: 0,
      totalDuration: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };

    endpointStats.count++;
    endpointStats.totalDuration += requestData.duration;

    if (!requestData.success) {
      endpointStats.errors++;
    }

    if (requestData.cached) {
      endpointStats.cacheHits++;
    } else {
      endpointStats.cacheMisses++;
    }

    this.metrics.apiEndpoints.set(requestData.endpoint, endpointStats);
    this.currentStats.totalRequests++;
  }

  /**
   * 응답 시간 기록
   */
  recordResponseTime(duration, endpoint) {
    this.metrics.responseTime.push({
      timestamp: Date.now(),
      endpoint,
      duration,
    });
  }

  /**
   * 캐시 히트 기록
   */
  recordCacheHit(endpoint) {
    this.metrics.cacheHits.push({
      timestamp: Date.now(),
      endpoint,
      hit: true,
    });
  }

  /**
   * 캐시 미스 기록
   */
  recordCacheMiss(endpoint) {
    this.metrics.cacheHits.push({
      timestamp: Date.now(),
      endpoint,
      hit: false,
    });
  }

  /**
   * 에러 기록
   */
  recordError(requestData) {
    this.metrics.errors.push({
      timestamp: requestData.timestamp,
      endpoint: requestData.endpoint,
      statusCode: requestData.statusCode,
      duration: requestData.duration,
      requestId: requestData.requestId,
      metadata: requestData.metadata,
    });

    this.currentStats.totalErrors++;
  }

  /**
   * 시스템 상태 기록
   */
  recordSystemHealth() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    this.metrics.systemHealth.push({
      timestamp: Date.now(),
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
      },
      cpu: cpuUsage,
      uptime: process.uptime(),
    });
  }

  /**
   * 실시간 통계 업데이트
   */
  updateStats() {
    const now = Date.now();
    const windowStart = now - this.config.windowSize;

    // 윈도우 내 요청들 필터링
    const recentRequests = this.metrics.requests.filter((r) => r.timestamp > windowStart);
    const recentErrors = this.metrics.errors.filter((e) => e.timestamp > windowStart);
    const recentCacheHits = this.metrics.cacheHits.filter((c) => c.timestamp > windowStart);

    // 평균 응답 시간 계산
    const avgResponseTime =
      recentRequests.length > 0
        ? recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length
        : 0;

    // 현재 처리량 계산 (요청/초)
    const currentThroughput = recentRequests.length / (this.config.windowSize / 1000);

    // 캐시 히트율 계산
    const cacheHitRate =
      recentCacheHits.length > 0
        ? recentCacheHits.filter((c) => c.hit).length / recentCacheHits.length
        : 0;

    // 에러율 계산
    const errorRate = recentRequests.length > 0 ? recentErrors.length / recentRequests.length : 0;

    this.currentStats = {
      ...this.currentStats,
      avgResponseTime: Math.round(avgResponseTime),
      currentThroughput: Math.round(currentThroughput * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 1000) / 10, // 퍼센트로 변환
      errorRate: Math.round(errorRate * 1000) / 10,
      uptime: now - this.currentStats.startTime,
    };

    // 시스템 상태 기록
    this.recordSystemHealth();
  }

  /**
   * 경고 확인
   */
  checkAlerts(requestData) {
    if (!this.config.enableAlerting) return;

    const { responseTime, errorRate, cacheHitRate } = this.config.alertThresholds;

    // 응답 시간 경고
    if (requestData.duration > responseTime) {
      this.sendAlert('SLOW_RESPONSE', {
        endpoint: requestData.endpoint,
        duration: requestData.duration,
        threshold: responseTime,
        requestId: requestData.requestId,
      });
    }

    // 에러율 경고 (현재 윈도우 기준)
    if (this.currentStats.errorRate > errorRate * 100) {
      this.sendAlert('HIGH_ERROR_RATE', {
        currentRate: this.currentStats.errorRate,
        threshold: errorRate * 100,
        timeWindow: this.config.windowSize,
      });
    }

    // 캐시 히트율 경고
    if (this.currentStats.cacheHitRate < cacheHitRate * 100) {
      this.sendAlert('LOW_CACHE_HIT_RATE', {
        currentRate: this.currentStats.cacheHitRate,
        threshold: cacheHitRate * 100,
      });
    }
  }

  /**
   * 경고 전송
   */
  sendAlert(type, data) {
    const alert = {
      type,
      timestamp: new Date().toISOString(),
      data,
      severity: this.getAlertSeverity(type, data),
    };

    serverLogger.warn('Performance Alert', alert);

    // 여기서 외부 알림 시스템 연동 가능
    // (예: Slack, Discord, 이메일 등)
  }

  /**
   * 경고 심각도 결정
   */
  getAlertSeverity(type, data) {
    switch (type) {
      case 'SLOW_RESPONSE':
        return data.duration > 5000 ? 'CRITICAL' : 'WARNING';
      case 'HIGH_ERROR_RATE':
        return data.currentRate > 10 ? 'CRITICAL' : 'WARNING';
      case 'LOW_CACHE_HIT_RATE':
        return data.currentRate < 50 ? 'CRITICAL' : 'WARNING';
      default:
        return 'INFO';
    }
  }

  /**
   * 성능 보고서 생성
   */
  generateReport(timeRange = 3600000) {
    // 기본 1시간
    const now = Date.now();
    const startTime = now - timeRange;

    const requests = this.metrics.requests.filter((r) => r.timestamp > startTime);
    const errors = this.metrics.errors.filter((e) => e.timestamp > startTime);
    const cacheData = this.metrics.cacheHits.filter((c) => c.timestamp > startTime);

    // 엔드포인트별 성능 분석
    const endpointAnalysis = {};
    for (const [endpoint, stats] of this.metrics.apiEndpoints) {
      const endpointRequests = requests.filter((r) => r.endpoint === endpoint);

      if (endpointRequests.length > 0) {
        const durations = endpointRequests.map((r) => r.duration);

        endpointAnalysis[endpoint] = {
          totalRequests: endpointRequests.length,
          avgResponseTime: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
          minResponseTime: Math.min(...durations),
          maxResponseTime: Math.max(...durations),
          p95ResponseTime: this.calculatePercentile(durations, 95),
          p99ResponseTime: this.calculatePercentile(durations, 99),
          errorRate: (
            (errors.filter((e) => e.endpoint === endpoint).length / endpointRequests.length) *
            100
          ).toFixed(2),
          cacheHitRate: this.calculateCacheHitRate(endpoint, cacheData),
          throughput: (endpointRequests.length / (timeRange / 1000)).toFixed(2),
        };
      }
    }

    return {
      timeRange: {
        start: new Date(startTime).toISOString(),
        end: new Date(now).toISOString(),
        durationMs: timeRange,
      },
      overall: {
        totalRequests: requests.length,
        totalErrors: errors.length,
        errorRate: requests.length > 0 ? ((errors.length / requests.length) * 100).toFixed(2) : 0,
        avgResponseTime:
          requests.length > 0
            ? Math.round(requests.reduce((sum, r) => sum + r.duration, 0) / requests.length)
            : 0,
        throughput: (requests.length / (timeRange / 1000)).toFixed(2),
        cacheHitRate: this.calculateOverallCacheHitRate(cacheData),
      },
      endpoints: endpointAnalysis,
      cache: getAllCacheStats(),
      systemHealth: this.getLatestSystemHealth(),
      currentStats: this.currentStats,
    };
  }

  /**
   * 백분위수 계산
   */
  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return Math.round(sorted[index] || 0);
  }

  /**
   * 엔드포인트별 캐시 히트율 계산
   */
  calculateCacheHitRate(endpoint, cacheData) {
    const endpointCacheData = cacheData.filter((c) => c.endpoint === endpoint);
    if (endpointCacheData.length === 0) return 0;

    const hits = endpointCacheData.filter((c) => c.hit).length;
    return ((hits / endpointCacheData.length) * 100).toFixed(2);
  }

  /**
   * 전체 캐시 히트율 계산
   */
  calculateOverallCacheHitRate(cacheData) {
    if (cacheData.length === 0) return 0;

    const hits = cacheData.filter((c) => c.hit).length;
    return ((hits / cacheData.length) * 100).toFixed(2);
  }

  /**
   * 최신 시스템 상태 조회
   */
  getLatestSystemHealth() {
    const latest = this.metrics.systemHealth[this.metrics.systemHealth.length - 1];
    if (!latest) return null;

    return {
      timestamp: new Date(latest.timestamp).toISOString(),
      memory: {
        heapUsedMB: Math.round(latest.memory.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(latest.memory.heapTotal / 1024 / 1024),
        rssMB: Math.round(latest.memory.rss / 1024 / 1024),
      },
      uptimeSeconds: Math.round(latest.uptime),
    };
  }

  /**
   * 오래된 데이터 정리
   */
  cleanup() {
    const cutoff = Date.now() - this.config.windowSize * 2; // 윈도우 크기의 2배만큼 보관

    this.metrics.requests = this.metrics.requests.filter((r) => r.timestamp > cutoff);
    this.metrics.errors = this.metrics.errors.filter((e) => e.timestamp > cutoff);
    this.metrics.responseTime = this.metrics.responseTime.filter((r) => r.timestamp > cutoff);
    this.metrics.cacheHits = this.metrics.cacheHits.filter((c) => c.timestamp > cutoff);
    this.metrics.systemHealth = this.metrics.systemHealth.filter((s) => s.timestamp > cutoff);

    // 메모리 사용량 제한
    if (this.metrics.requests.length > this.config.maxDataPoints) {
      this.metrics.requests = this.metrics.requests.slice(-this.config.maxDataPoints);
    }
  }

  /**
   * 실시간 대시보드 데이터
   */
  getDashboardData() {
    return {
      current: this.currentStats,
      recent: {
        requests: this.metrics.requests.slice(-100),
        errors: this.metrics.errors.slice(-50),
        responseTime: this.metrics.responseTime.slice(-100),
      },
      health: this.getLatestSystemHealth(),
    };
  }

  /**
   * 모니터 정리
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
  }
}

// 전역 성능 모니터 인스턴스
let globalMonitor = null;

/**
 * 성능 모니터 인스턴스 가져오기
 */
export function getPerformanceMonitor(options = {}) {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor(options);
  }
  return globalMonitor;
}

/**
 * Express 미들웨어용 성능 추적기
 */
export function performanceMiddleware(options = {}) {
  const monitor = getPerformanceMonitor(options);

  return (req, res, next) => {
    const requestData = monitor.startRequest(
      req.requestId || `req_${Date.now()}`,
      req.route?.path || req.url,
      {
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection?.remoteAddress,
        method: req.method,
        contentLength: req.headers['content-length'],
      }
    );

    // 응답 완료 시 추적
    const originalSend = res.send;
    res.send = function (body) {
      if (requestData) {
        monitor.endRequest(
          requestData,
          res.statusCode,
          body ? JSON.stringify(body).length : 0,
          res.locals?.cached || false
        );
      }
      return originalSend.call(this, body);
    };

    if (next) next();
  };
}

/**
 * Vercel Function용 성능 추적 래퍼
 */
export function withPerformanceTracking(handler, endpoint) {
  const monitor = getPerformanceMonitor();

  return async (req, res) => {
    const requestData = monitor.startRequest(
      `${endpoint}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      endpoint,
      {
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
        method: req.method,
        contentLength: req.headers['content-length'],
      }
    );

    try {
      await handler(req, res);

      if (requestData) {
        monitor.endRequest(
          requestData,
          res.statusCode || 200,
          res.get('content-length') || 0,
          res.locals?.cached || false
        );
      }
    } catch (error) {
      if (requestData) {
        monitor.endRequest(requestData, 500, 0, false);
      }
      throw error;
    }
  };
}

export { PerformanceMonitor };
