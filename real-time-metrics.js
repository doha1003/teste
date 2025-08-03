/**
 * 실시간 성능 메트릭 수집기
 * doha.kr 웹사이트의 실시간 성능 지표를 수집하고 분석하는 시스템
 *
 * 기능:
 * - Real User Monitoring (RUM) 데이터 수집
 * - Core Web Vitals 실시간 추적
 * - API 성능 모니터링
 * - 사용자 행동 분석
 * - 성능 이상 감지 및 알림
 */

import { EventEmitter } from 'events';
import { writeFile, readFile, mkdir, access } from 'fs/promises';
import { createWriteStream } from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';

/**
 * 실시간 메트릭 수집기 클래스
 */
class RealTimeMetrics extends EventEmitter {
  constructor(options = {}) {
    super();

    this.config = {
      // 기본 설정
      baseUrl: options.baseUrl || 'https://doha.kr',
      apiEndpoints: options.apiEndpoints || ['/api/fortune', '/api/manseryeok', '/api/health'],
      collectInterval: options.collectInterval || 60000, // 1분
      batchSize: options.batchSize || 100,
      retentionDays: options.retentionDays || 30,
      outputDir: options.outputDir || './metrics-data',

      // 성능 임계값
      thresholds: {
        responseTime: 2000, // ms
        errorRate: 0.05, // 5%
        throughput: 10, // requests/sec
        availability: 0.99, // 99%
      },

      // 알림 설정
      alerting: {
        enabled: options.alerting?.enabled || true,
        channels: options.alerting?.channels || ['console'],
        cooldown: options.alerting?.cooldown || 300000, // 5분
      },

      ...options,
    };

    // 내부 상태
    this.isCollecting = false;
    this.collectInterval = null;
    this.metrics = {
      rum: [],
      vitals: [],
      api: [],
      errors: [],
      alerts: [],
    };
    this.lastAlerts = new Map(); // 알림 쿨다운 관리
    this.startTime = Date.now();
  }

  /**
   * 메트릭 수집 시작
   */
  async start() {
    if (this.isCollecting) {
      console.log('⚠️  실시간 메트릭 수집이 이미 실행 중입니다.');
      return;
    }

    console.log('🚀 실시간 메트릭 수집 시작...');

    try {
      // 출력 디렉토리 생성
      await this.ensureOutputDirectory();

      // 기존 데이터 로드
      await this.loadExistingData();

      // 수집 시작
      this.isCollecting = true;
      this.startTime = Date.now();

      // 초기 수집
      await this.collectAllMetrics();

      // 정기 수집 시작
      this.collectInterval = setInterval(async () => {
        try {
          await this.collectAllMetrics();
        } catch (error) {
          console.error('❌ 메트릭 수집 오류:', error);
          this.recordError('collection', error);
        }
      }, this.config.collectInterval);

      console.log(
        `✅ 실시간 메트릭 수집이 시작되었습니다 (${this.config.collectInterval / 1000}초 간격)`
      );

      // 주기적 데이터 저장 (5분마다)
      setInterval(() => this.saveMetricsData(), 300000);

      // 정리 작업 (1시간마다)
      setInterval(() => this.cleanup(), 3600000);
    } catch (error) {
      console.error('❌ 실시간 메트릭 수집 시작 실패:', error);
      throw error;
    }
  }

  /**
   * 메트릭 수집 중지
   */
  stop() {
    if (!this.isCollecting) {
      console.log('⚠️  실시간 메트릭 수집이 실행되지 않고 있습니다.');
      return;
    }

    console.log('🛑 실시간 메트릭 수집 중지 중...');

    if (this.collectInterval) {
      clearInterval(this.collectInterval);
      this.collectInterval = null;
    }

    this.isCollecting = false;

    // 최종 데이터 저장
    this.saveMetricsData();

    console.log('✅ 실시간 메트릭 수집이 중지되었습니다.');
  }

  /**
   * 출력 디렉토리 확인/생성
   */
  async ensureOutputDirectory() {
    try {
      await access(this.config.outputDir);
    } catch {
      await mkdir(this.config.outputDir, { recursive: true });
      console.log(`📁 메트릭 디렉토리 생성: ${this.config.outputDir}`);
    }

    // 서브 디렉토리 생성
    const subdirs = ['rum', 'vitals', 'api', 'errors', 'summaries'];
    for (const subdir of subdirs) {
      const fullPath = join(this.config.outputDir, subdir);
      try {
        await access(fullPath);
      } catch {
        await mkdir(fullPath, { recursive: true });
      }
    }
  }

  /**
   * 모든 메트릭 수집
   */
  async collectAllMetrics() {
    const timestamp = new Date().toISOString();
    console.log(`📊 메트릭 수집 중... (${new Date().toLocaleTimeString('ko-KR')})`);

    try {
      // 병렬로 모든 메트릭 수집
      const [rumData, vitalsData, apiData] = await Promise.allSettled([
        this.collectRUMMetrics(),
        this.collectWebVitals(),
        this.collectAPIMetrics(),
      ]);

      // 수집 결과 처리
      const collectionResult = {
        timestamp,
        rum: rumData.status === 'fulfilled' ? rumData.value : null,
        vitals: vitalsData.status === 'fulfilled' ? vitalsData.value : null,
        api: apiData.status === 'fulfilled' ? apiData.value : null,
        errors: [
          ...(rumData.status === 'rejected'
            ? [{ type: 'rum', error: rumData.reason.message }]
            : []),
          ...(vitalsData.status === 'rejected'
            ? [{ type: 'vitals', error: vitalsData.reason.message }]
            : []),
          ...(apiData.status === 'rejected'
            ? [{ type: 'api', error: apiData.reason.message }]
            : []),
        ],
      };

      // 메트릭 저장
      this.storeMetrics(collectionResult);

      // 임계값 검사 및 알림
      await this.checkThresholds(collectionResult);

      // 이벤트 발생
      this.emit('metrics-collected', collectionResult);

      console.log('✅ 메트릭 수집 완료');

      return collectionResult;
    } catch (error) {
      console.error('❌ 메트릭 수집 실패:', error);
      this.recordError('collection', error);
      throw error;
    }
  }

  /**
   * RUM (Real User Monitoring) 메트릭 수집
   */
  async collectRUMMetrics() {
    try {
      // 실제 환경에서는 Google Analytics, Adobe Analytics 등의 API 사용
      // 여기서는 시뮬레이션된 데이터 생성

      const rumData = {
        timestamp: new Date().toISOString(),
        pageViews: this.generateRealisticPageViews(),
        uniqueUsers: this.generateRealisticUsers(),
        sessions: this.generateRealisticSessions(),
        bounceRate: this.generateRealisticBounceRate(),
        avgSessionDuration: this.generateRealisticSessionDuration(),
        topPages: this.generateTopPages(),
        deviceBreakdown: this.generateDeviceBreakdown(),
        geographicData: this.generateGeographicData(),
        trafficSources: this.generateTrafficSources(),
      };

      return rumData;
    } catch (error) {
      console.error('❌ RUM 메트릭 수집 실패:', error);
      throw error;
    }
  }

  /**
   * Core Web Vitals 메트릭 수집
   */
  async collectWebVitals() {
    try {
      // 실제 환경에서는 PageSpeed Insights API, CrUX API 사용
      // 여기서는 시뮬레이션된 데이터 생성

      const vitalsData = {
        timestamp: new Date().toISOString(),
        lcp: this.generateRealisticLCP(),
        fid: this.generateRealisticFID(),
        cls: this.generateRealisticCLS(),
        fcp: this.generateRealisticFCP(),
        ttfb: this.generateRealisticTTFB(),
        tti: this.generateRealisticTTI(),
        percentiles: {
          p75: this.generatePercentileData(75),
          p90: this.generatePercentileData(90),
          p95: this.generatePercentileData(95),
        },
        deviceType: ['desktop', 'mobile'][Math.floor(Math.random() * 2)],
        connectionType: this.generateConnectionType(),
      };

      return vitalsData;
    } catch (error) {
      console.error('❌ Web Vitals 메트릭 수집 실패:', error);
      throw error;
    }
  }

  /**
   * API 성능 메트릭 수집
   */
  async collectAPIMetrics() {
    try {
      const apiMetrics = {};

      // 각 API 엔드포인트 테스트
      for (const endpoint of this.config.apiEndpoints) {
        const url = `${this.config.baseUrl}${endpoint}`;
        const metrics = await this.measureAPIPerformance(url, endpoint);
        apiMetrics[endpoint] = metrics;
      }

      return {
        timestamp: new Date().toISOString(),
        endpoints: apiMetrics,
        overall: this.calculateOverallAPIMetrics(apiMetrics),
      };
    } catch (error) {
      console.error('❌ API 메트릭 수집 실패:', error);
      throw error;
    }
  }

  /**
   * API 성능 측정
   */
  async measureAPIPerformance(url, endpoint) {
    const startTime = Date.now();
    let success = false;
    let statusCode = 0;
    let responseTime = 0;
    let errorMessage = null;

    try {
      const response = await fetch(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'doha-kr-metrics-collector/1.0',
        },
      });

      responseTime = Date.now() - startTime;
      statusCode = response.status;
      success = response.ok;

      if (!response.ok) {
        errorMessage = `HTTP ${response.status} ${response.statusText}`;
      }
    } catch (error) {
      responseTime = Date.now() - startTime;
      errorMessage = error.message;

      if (error.code === 'ENOTFOUND') {
        statusCode = 0; // DNS 오류
      } else if (error.code === 'ETIMEDOUT') {
        statusCode = 408; // 타임아웃
      } else {
        statusCode = 500; // 기타 서버 오류
      }
    }

    return {
      endpoint,
      timestamp: new Date().toISOString(),
      responseTime,
      statusCode,
      success,
      errorMessage,
      availability: success ? 1 : 0,
    };
  }

  /**
   * 전체 API 메트릭 계산
   */
  calculateOverallAPIMetrics(apiMetrics) {
    const metrics = Object.values(apiMetrics);

    if (metrics.length === 0) {
      return {
        avgResponseTime: 0,
        successRate: 0,
        availability: 0,
        errorCount: 0,
      };
    }

    const totalResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0);
    const successCount = metrics.filter((m) => m.success).length;
    const availabilitySum = metrics.reduce((sum, m) => sum + m.availability, 0);

    return {
      avgResponseTime: Math.round(totalResponseTime / metrics.length),
      successRate: successCount / metrics.length,
      availability: availabilitySum / metrics.length,
      errorCount: metrics.length - successCount,
      totalRequests: metrics.length,
    };
  }

  /**
   * 메트릭 저장
   */
  storeMetrics(collectionResult) {
    const { timestamp, rum, vitals, api } = collectionResult;

    // 메모리에 저장
    if (rum) this.metrics.rum.push(rum);
    if (vitals) this.metrics.vitals.push(vitals);
    if (api) this.metrics.api.push(api);

    // 메모리 제한 (최근 1000개 항목만 유지)
    Object.keys(this.metrics).forEach((key) => {
      if (this.metrics[key].length > 1000) {
        this.metrics[key] = this.metrics[key].slice(-1000);
      }
    });

    // 이벤트 발생
    this.emit('metrics-stored', { timestamp, count: this.getTotalMetricsCount() });
  }

  /**
   * 임계값 검사 및 알림
   */
  async checkThresholds(collectionResult) {
    const alerts = [];
    const now = Date.now();

    // API 성능 임계값 검사
    if (collectionResult.api) {
      const { overall } = collectionResult.api;

      // 응답 시간 임계값
      if (overall.avgResponseTime > this.config.thresholds.responseTime) {
        alerts.push({
          type: 'api_response_time',
          severity: 'warning',
          message: `평균 API 응답 시간이 임계값을 초과했습니다: ${overall.avgResponseTime}ms > ${this.config.thresholds.responseTime}ms`,
          value: overall.avgResponseTime,
          threshold: this.config.thresholds.responseTime,
        });
      }

      // 오류율 임계값
      if (overall.successRate < 1 - this.config.thresholds.errorRate) {
        alerts.push({
          type: 'api_error_rate',
          severity: 'critical',
          message: `API 오류율이 임계값을 초과했습니다: ${((1 - overall.successRate) * 100).toFixed(2)}% > ${(this.config.thresholds.errorRate * 100).toFixed(2)}%`,
          value: 1 - overall.successRate,
          threshold: this.config.thresholds.errorRate,
        });
      }

      // 가용성 임계값
      if (overall.availability < this.config.thresholds.availability) {
        alerts.push({
          type: 'api_availability',
          severity: 'critical',
          message: `API 가용성이 임계값 이하입니다: ${(overall.availability * 100).toFixed(2)}% < ${(this.config.thresholds.availability * 100).toFixed(2)}%`,
          value: overall.availability,
          threshold: this.config.thresholds.availability,
        });
      }
    }

    // Core Web Vitals 임계값 검사
    if (collectionResult.vitals) {
      const { lcp, fid, cls } = collectionResult.vitals;

      if (lcp > 2500) {
        alerts.push({
          type: 'lcp_threshold',
          severity: 'warning',
          message: `LCP가 임계값을 초과했습니다: ${lcp}ms > 2500ms`,
          value: lcp,
          threshold: 2500,
        });
      }

      if (fid > 100) {
        alerts.push({
          type: 'fid_threshold',
          severity: 'warning',
          message: `FID가 임계값을 초과했습니다: ${fid}ms > 100ms`,
          value: fid,
          threshold: 100,
        });
      }

      if (cls > 0.1) {
        alerts.push({
          type: 'cls_threshold',
          severity: 'warning',
          message: `CLS가 임계값을 초과했습니다: ${cls} > 0.1`,
          value: cls,
          threshold: 0.1,
        });
      }
    }

    // 알림 발송 (쿨다운 확인)
    for (const alert of alerts) {
      const lastAlert = this.lastAlerts.get(alert.type);

      if (!lastAlert || now - lastAlert > this.config.alerting.cooldown) {
        await this.sendAlert(alert);
        this.lastAlerts.set(alert.type, now);
      }
    }

    if (alerts.length > 0) {
      this.metrics.alerts.push(
        ...alerts.map((alert) => ({
          ...alert,
          timestamp: collectionResult.timestamp,
        }))
      );
    }

    return alerts;
  }

  /**
   * 알림 발송
   */
  async sendAlert(alert) {
    if (!this.config.alerting.enabled) return;

    const alertMessage = `🚨 [${alert.severity.toUpperCase()}] ${alert.message}`;

    console.warn(alertMessage);

    // 이벤트 발생
    this.emit('alert', alert);

    // 추가 알림 채널 (Slack, 이메일 등) 구현 가능
    for (const channel of this.config.alerting.channels) {
      switch (channel) {
        case 'console':
          console.warn(alertMessage);
          break;
        case 'slack':
          await this.sendSlackAlert(alert);
          break;
        case 'email':
          await this.sendEmailAlert(alert);
          break;
      }
    }
  }

  /**
   * 기존 데이터 로드
   */
  async loadExistingData() {
    try {
      const dataTypes = ['rum', 'vitals', 'api', 'errors'];

      for (const type of dataTypes) {
        try {
          const filePath = join(this.config.outputDir, `${type}-latest.json`);
          const data = await readFile(filePath, 'utf8');
          const parsedData = JSON.parse(data);

          if (Array.isArray(parsedData)) {
            this.metrics[type] = parsedData.slice(-100); // 최근 100개만 로드
          }
        } catch (error) {
          // 파일이 없으면 빈 배열로 시작
          this.metrics[type] = [];
        }
      }

      console.log('📚 기존 메트릭 데이터 로드 완료');
    } catch (error) {
      console.error('❌ 기존 데이터 로드 실패:', error);
      // 오류가 있어도 빈 상태로 시작
      Object.keys(this.metrics).forEach((key) => {
        this.metrics[key] = [];
      });
    }
  }

  /**
   * 메트릭 데이터 저장
   */
  async saveMetricsData() {
    try {
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // 각 메트릭 타입별로 저장
      for (const [type, data] of Object.entries(this.metrics)) {
        if (data.length === 0) continue;

        // 최신 데이터 저장
        const latestPath = join(this.config.outputDir, `${type}-latest.json`);
        await writeFile(latestPath, JSON.stringify(data, null, 2));

        // 일별 데이터 저장
        const dailyPath = join(this.config.outputDir, type, `${timestamp}.json`);
        await writeFile(dailyPath, JSON.stringify(data, null, 2));
      }

      // 요약 데이터 생성 및 저장
      const summary = this.generateSummary();
      const summaryPath = join(this.config.outputDir, 'summaries', `${timestamp}.json`);
      await writeFile(summaryPath, JSON.stringify(summary, null, 2));

      console.log('💾 메트릭 데이터 저장 완료');
    } catch (error) {
      console.error('❌ 메트릭 데이터 저장 실패:', error);
    }
  }

  /**
   * 요약 데이터 생성
   */
  generateSummary() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);

    return {
      timestamp: now.toISOString(),
      period: {
        start: oneHourAgo.toISOString(),
        end: now.toISOString(),
      },
      uptime: Date.now() - this.startTime,
      collections: {
        rum: this.metrics.rum.length,
        vitals: this.metrics.vitals.length,
        api: this.metrics.api.length,
        errors: this.metrics.errors.length,
        alerts: this.metrics.alerts.length,
      },
      latest: {
        rum: this.metrics.rum[this.metrics.rum.length - 1] || null,
        vitals: this.metrics.vitals[this.metrics.vitals.length - 1] || null,
        api: this.metrics.api[this.metrics.api.length - 1] || null,
      },
      trends: this.calculateTrends(),
    };
  }

  /**
   * 트렌드 계산
   */
  calculateTrends() {
    // 최근 10개 데이터포인트로 트렌드 계산
    const recentVitals = this.metrics.vitals.slice(-10);
    const recentAPI = this.metrics.api.slice(-10);

    const trends = {};

    // Web Vitals 트렌드
    if (recentVitals.length >= 2) {
      const latest = recentVitals[recentVitals.length - 1];
      const previous = recentVitals[recentVitals.length - 2];

      trends.vitals = {
        lcp: this.calculateTrend(latest.lcp, previous.lcp),
        fid: this.calculateTrend(latest.fid, previous.fid),
        cls: this.calculateTrend(latest.cls, previous.cls),
      };
    }

    // API 성능 트렌드
    if (recentAPI.length >= 2) {
      const latest = recentAPI[recentAPI.length - 1];
      const previous = recentAPI[recentAPI.length - 2];

      trends.api = {
        responseTime: this.calculateTrend(
          latest.overall.avgResponseTime,
          previous.overall.avgResponseTime
        ),
        successRate: this.calculateTrend(
          latest.overall.successRate,
          previous.overall.successRate,
          true
        ),
        availability: this.calculateTrend(
          latest.overall.availability,
          previous.overall.availability,
          true
        ),
      };
    }

    return trends;
  }

  /**
   * 개별 트렌드 계산
   */
  calculateTrend(current, previous, higherIsBetter = false) {
    if (previous === 0) return 'stable';

    const change = ((current - previous) / previous) * 100;
    const threshold = 5; // 5% 변화를 의미있는 변화로 간주

    if (Math.abs(change) < threshold) {
      return 'stable';
    }

    if (higherIsBetter) {
      return change > 0 ? 'improving' : 'declining';
    } else {
      return change > 0 ? 'declining' : 'improving';
    }
  }

  /**
   * 정리 작업
   */
  async cleanup() {
    console.log('🧹 메트릭 데이터 정리 중...');

    // 메모리에서 오래된 데이터 제거
    const cutoffTime = Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000;

    Object.keys(this.metrics).forEach((key) => {
      this.metrics[key] = this.metrics[key].filter((item) => {
        const itemTime = new Date(item.timestamp).getTime();
        return itemTime > cutoffTime;
      });
    });

    console.log('✅ 메트릭 데이터 정리 완료');
  }

  /**
   * 오류 기록
   */
  recordError(type, error, context = {}) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      type,
      message: error.message,
      stack: error.stack,
      context,
    };

    this.metrics.errors.push(errorRecord);
    this.emit('error-recorded', errorRecord);

    // 최근 100개 오류만 유지
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }
  }

  /**
   * 현재 상태 반환
   */
  getStatus() {
    const now = Date.now();

    return {
      isCollecting: this.isCollecting,
      uptime: now - this.startTime,
      uptimeFormatted: this.formatUptime(now - this.startTime),
      lastCollection:
        this.metrics.rum.length > 0
          ? this.metrics.rum[this.metrics.rum.length - 1].timestamp
          : null,
      totalCollections: this.getTotalMetricsCount(),
      errorCount: this.metrics.errors.length,
      alertCount: this.metrics.alerts.length,
      config: {
        collectInterval: this.config.collectInterval,
        baseUrl: this.config.baseUrl,
        thresholds: this.config.thresholds,
      },
    };
  }

  /**
   * 총 메트릭 수 계산
   */
  getTotalMetricsCount() {
    return Object.values(this.metrics).reduce((sum, arr) => sum + arr.length, 0);
  }

  /**
   * 업타임 포맷팅
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 ${hours % 24}시간`;
    if (hours > 0) return `${hours}시간 ${minutes % 60}분`;
    if (minutes > 0) return `${minutes}분 ${seconds % 60}초`;
    return `${seconds}초`;
  }

  // 시뮬레이션 데이터 생성 메서드들
  generateRealisticPageViews() {
    const hour = new Date().getHours();
    const baseViews = hour >= 9 && hour <= 21 ? 50 : 20; // 업무시간 vs 야간
    return baseViews + Math.floor(Math.random() * 30);
  }

  generateRealisticUsers() {
    return Math.floor(this.generateRealisticPageViews() * 0.7); // 70% unique users
  }

  generateRealisticSessions() {
    return Math.floor(this.generateRealisticUsers() * 1.2); // 120% sessions per user
  }

  generateRealisticBounceRate() {
    return (25 + Math.random() * 20) / 100; // 25-45%
  }

  generateRealisticSessionDuration() {
    return 120 + Math.floor(Math.random() * 300); // 2-7분
  }

  generateTopPages() {
    const pages = [
      '/',
      '/tests/mbti',
      '/fortune/daily',
      '/tests/teto-egen',
      '/tools/bmi-calculator',
    ];
    return pages
      .map((page) => ({
        path: page,
        views: Math.floor(Math.random() * 100) + 10,
      }))
      .sort((a, b) => b.views - a.views);
  }

  generateDeviceBreakdown() {
    const mobile = 60 + Math.random() * 20; // 60-80%
    return {
      mobile: mobile,
      desktop: 100 - mobile,
    };
  }

  generateGeographicData() {
    return {
      'South Korea': 85 + Math.random() * 10,
      'United States': 5 + Math.random() * 5,
      Japan: 3 + Math.random() * 3,
      Other: 2 + Math.random() * 5,
    };
  }

  generateTrafficSources() {
    return {
      direct: 40 + Math.random() * 20,
      search: 30 + Math.random() * 15,
      social: 15 + Math.random() * 10,
      referral: 10 + Math.random() * 10,
      email: 5 + Math.random() * 5,
    };
  }

  generateRealisticLCP() {
    return 1500 + Math.random() * 1000; // 1.5-2.5초
  }

  generateRealisticFID() {
    return 50 + Math.random() * 100; // 50-150ms
  }

  generateRealisticCLS() {
    return Math.random() * 0.15; // 0-0.15
  }

  generateRealisticFCP() {
    return 800 + Math.random() * 700; // 0.8-1.5초
  }

  generateRealisticTTFB() {
    return 200 + Math.random() * 300; // 200-500ms
  }

  generateRealisticTTI() {
    return 2000 + Math.random() * 2000; // 2-4초
  }

  generatePercentileData(percentile) {
    const base = this.generateRealisticLCP();
    const multiplier = percentile === 75 ? 1.2 : percentile === 90 ? 1.5 : 2.0;
    return base * multiplier;
  }

  generateConnectionType() {
    const types = ['4g', 'wifi', '3g', '5g'];
    const weights = [40, 35, 15, 10]; // 가중치
    const random = Math.random() * 100;
    let cumulative = 0;

    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return types[i];
      }
    }

    return '4g';
  }

  // 알림 메서드들 (구현 필요 시 확장)
  async sendSlackAlert(alert) {
    console.log('📱 Slack 알림:', alert.message);
  }

  async sendEmailAlert(alert) {
    console.log('📧 이메일 알림:', alert.message);
  }
}

export default RealTimeMetrics;

// CLI에서 직접 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  const metrics = new RealTimeMetrics({
    baseUrl: process.env.METRICS_URL || 'https://doha.kr',
    collectInterval: 30000, // 30초 (테스트용)
    alerting: {
      enabled: true,
      channels: ['console'],
    },
  });

  // 이벤트 리스너 등록
  metrics.on('metrics-collected', (data) => {
    console.log('📊 메트릭 수집됨:', {
      timestamp: data.timestamp,
      hasRum: !!data.rum,
      hasVitals: !!data.vitals,
      hasApi: !!data.api,
    });
  });

  metrics.on('alert', (alert) => {
    console.warn(`🚨 알림: [${alert.severity}] ${alert.message}`);
  });

  metrics.on('error-recorded', (error) => {
    console.error('❌ 오류 기록됨:', error.message);
  });

  // 종료 처리
  process.on('SIGINT', async () => {
    console.log('\n🛑 종료 신호 받음...');
    metrics.stop();
    await metrics.saveMetricsData();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 종료 신호 받음...');
    metrics.stop();
    await metrics.saveMetricsData();
    process.exit(0);
  });

  // 메트릭 수집 시작
  try {
    await metrics.start();

    console.log('\n📊 실시간 메트릭 수집기가 실행 중입니다.');
    console.log('상태:', metrics.getStatus());
    console.log('Ctrl+C로 종료하세요.\n');
  } catch (error) {
    console.error('❌ 메트릭 수집기 시작 실패:', error);
    process.exit(1);
  }
}
