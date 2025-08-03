/**
 * 실시간 모니터링 대시보드
 * 성능 지표, Lighthouse 점수, PWA 메트릭을 실시간으로 추적합니다.
 */

import { EventEmitter } from 'events';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { performance } from 'perf_hooks';

class RealTimeMonitor extends EventEmitter {
  constructor(options = {}) {
    super();

    this.config = {
      baseUrl: options.baseUrl || 'http://localhost:3000',
      interval: options.interval || 300000, // 5분마다
      thresholds: {
        performance: 95,
        accessibility: 95,
        bestPractices: 90,
        seo: 100,
        pwa: 100,
        lcp: 2500,
        fid: 100,
        cls: 0.1,
      },
      ...options,
    };

    this.metrics = {
      lighthouse: {},
      rum: {},
      pwa: {},
      errors: [],
      uptime: 0,
      lastUpdate: null,
    };

    this.isMonitoring = false;
    this.intervalId = null;
    this.startTime = Date.now();
  }

  /**
   * 모니터링 시작
   */
  async start() {
    if (this.isMonitoring) {
      console.log('모니터링이 이미 실행 중입니다.');
      return;
    }

    console.log('🚀 실시간 모니터링 시작...');
    this.isMonitoring = true;
    this.startTime = Date.now();

    // 초기 성능 측정
    await this.runPerformanceAudit();

    // 정기적인 모니터링 시작
    this.intervalId = setInterval(async () => {
      try {
        await this.runPerformanceAudit();
        await this.collectRUMMetrics();
        await this.checkPWAMetrics();
        this.emit('metrics-updated', this.getMetricsSummary());
      } catch (error) {
        console.error('모니터링 중 오류 발생:', error);
        this.recordError(error);
      }
    }, this.config.interval);

    console.log(`✅ 모니터링 시작됨 (${this.config.interval / 1000}초 간격)`);
  }

  /**
   * 모니터링 중지
   */
  stop() {
    if (!this.isMonitoring) {
      console.log('모니터링이 실행되지 않고 있습니다.');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isMonitoring = false;
    console.log('🛑 모니터링 중지됨');
  }

  /**
   * Lighthouse 성능 측정
   */
  async runPerformanceAudit() {
    const startTime = performance.now();

    try {
      console.log('📊 Lighthouse 감사 실행 중...');

      const chrome = await launch({
        chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
      });

      const lighthouseOptions = {
        logLevel: 'error',
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
        port: chrome.port,
      };

      const config = {
        extends: 'lighthouse:default',
        settings: {
          formFactor: 'desktop',
          throttling: {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
          },
        },
      };

      const result = await lighthouse(this.config.baseUrl, lighthouseOptions, config);
      await chrome.kill();

      if (result && result.lhr) {
        const metrics = this.analyzeLighthouseResults(result.lhr);
        this.metrics.lighthouse = {
          ...metrics,
          timestamp: new Date().toISOString(),
          auditDuration: performance.now() - startTime,
        };

        console.log('✅ Lighthouse 감사 완료:', {
          performance: metrics.scores.performance,
          accessibility: metrics.scores.accessibility,
          duration: `${Math.round(performance.now() - startTime)}ms`,
        });

        // 임계값 검사
        this.checkThresholds(metrics);
      }
    } catch (error) {
      console.error('❌ Lighthouse 감사 실패:', error.message);
      this.recordError(error);
    }
  }

  /**
   * Lighthouse 결과 분석
   */
  analyzeLighthouseResults(lhr) {
    const { audits, categories } = lhr;

    return {
      scores: {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        bestPractices: Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100),
        pwa: categories.pwa ? Math.round(categories.pwa.score * 100) : null,
      },
      vitals: {
        lcp: audits['largest-contentful-paint']?.numericValue || 0,
        fid: audits['max-potential-fid']?.numericValue || 0,
        cls: audits['cumulative-layout-shift']?.numericValue || 0,
        fcp: audits['first-contentful-paint']?.numericValue || 0,
        si: audits['speed-index']?.numericValue || 0,
        tti: audits['interactive']?.numericValue || 0,
        tbt: audits['total-blocking-time']?.numericValue || 0,
      },
      resources: {
        totalByteWeight: audits['total-byte-weight']?.numericValue || 0,
        unusedCssBytes: audits['unused-css-rules']?.details?.overallSavingsBytes || 0,
        unusedJsBytes: audits['unused-javascript']?.details?.overallSavingsBytes || 0,
      },
    };
  }

  /**
   * 실제 사용자 메트릭 수집 (RUM)
   */
  async collectRUMMetrics() {
    try {
      console.log('📈 RUM 메트릭 수집 중...');

      // 여기서는 시뮬레이션된 데이터를 사용
      // 실제 환경에서는 Google Analytics, New Relic 등의 API를 사용
      this.metrics.rum = {
        pageViews: Math.floor(Math.random() * 1000) + 500,
        uniqueUsers: Math.floor(Math.random() * 300) + 150,
        bounceRate: (Math.random() * 0.3 + 0.1).toFixed(2), // 10-40%
        avgSessionDuration: Math.floor(Math.random() * 300) + 120, // 2-7분
        conversionRate: (Math.random() * 0.05 + 0.02).toFixed(3), // 2-7%
        timestamp: new Date().toISOString(),
      };

      console.log('✅ RUM 메트릭 수집 완료');
    } catch (error) {
      console.error('❌ RUM 메트릭 수집 실패:', error.message);
      this.recordError(error);
    }
  }

  /**
   * PWA 메트릭 확인
   */
  async checkPWAMetrics() {
    try {
      console.log('📱 PWA 메트릭 확인 중...');

      // PWA 설치율과 사용 패턴 시뮬레이션
      this.metrics.pwa = {
        installPrompts: Math.floor(Math.random() * 50) + 10,
        installs: Math.floor(Math.random() * 20) + 5,
        installRate: ((Math.random() * 0.3 + 0.1) * 100).toFixed(1), // 10-40%
        offlineUsage: Math.floor(Math.random() * 100) + 20,
        pushNotificationClicks: Math.floor(Math.random() * 30) + 5,
        timestamp: new Date().toISOString(),
      };

      console.log('✅ PWA 메트릭 확인 완료');
    } catch (error) {
      console.error('❌ PWA 메트릭 확인 실패:', error.message);
      this.recordError(error);
    }
  }

  /**
   * 임계값 검사
   */
  checkThresholds(metrics) {
    const alerts = [];

    // Lighthouse 점수 검사
    Object.entries(this.config.thresholds).forEach(([key, threshold]) => {
      if (metrics.scores[key] && metrics.scores[key] < threshold) {
        alerts.push({
          type: 'performance',
          metric: key,
          current: metrics.scores[key],
          threshold,
          severity: metrics.scores[key] < threshold * 0.8 ? 'critical' : 'warning',
        });
      }
    });

    // Core Web Vitals 검사
    if (metrics.vitals.lcp > this.config.thresholds.lcp) {
      alerts.push({
        type: 'vitals',
        metric: 'lcp',
        current: metrics.vitals.lcp,
        threshold: this.config.thresholds.lcp,
        severity: metrics.vitals.lcp > this.config.thresholds.lcp * 1.5 ? 'critical' : 'warning',
      });
    }

    if (metrics.vitals.cls > this.config.thresholds.cls) {
      alerts.push({
        type: 'vitals',
        metric: 'cls',
        current: metrics.vitals.cls,
        threshold: this.config.thresholds.cls,
        severity: 'warning',
      });
    }

    if (alerts.length > 0) {
      console.warn('⚠️  성능 임계값 초과:', alerts);
      this.emit('threshold-exceeded', alerts);
    }
  }

  /**
   * 오류 기록
   */
  recordError(error) {
    this.metrics.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // 최근 100개 오류만 유지
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }

    this.emit('error-recorded', error);
  }

  /**
   * 메트릭 요약 반환
   */
  getMetricsSummary() {
    this.metrics.uptime = Date.now() - this.startTime;
    this.metrics.lastUpdate = new Date().toISOString();

    return {
      ...this.metrics,
      status: this.isMonitoring ? 'active' : 'stopped',
      uptimeFormatted: this.formatUptime(this.metrics.uptime),
    };
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

  /**
   * 대시보드 HTML 생성
   */
  generateDashboardHTML() {
    const metrics = this.getMetricsSummary();

    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>doha.kr 실시간 모니터링 대시보드</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea;
        }
        .metric-value {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            margin: 0.5rem 0;
        }
        .metric-label { color: #666; font-size: 0.9rem; }
        .status-good { color: #10b981; }
        .status-warning { color: #f59e0b; }
        .status-critical { color: #ef4444; }
        .timestamp { color: #888; font-size: 0.8rem; margin-top: 1rem; }
        .lighthouse-scores {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        .score-item {
            text-align: center;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            margin: 0.5rem 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #667eea);
            transition: width 0.3s ease;
        }
        .error-list {
            max-height: 200px;
            overflow-y: auto;
            background: #fef2f2;
            border-radius: 6px;
            padding: 1rem;
            margin-top: 1rem;
        }
        .error-item {
            padding: 0.5rem;
            border-left: 3px solid #ef4444;
            margin-bottom: 0.5rem;
            background: white;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        .refresh-btn {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 50px;
            padding: 1rem 2rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            font-weight: bold;
        }
        .refresh-btn:hover { background: #5a67d8; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 doha.kr 실시간 모니터링</h1>
        <p>성능 지표 및 품질 메트릭 대시보드</p>
        <p>마지막 업데이트: ${metrics.lastUpdate || '데이터 없음'}</p>
        <p>업타임: ${metrics.uptimeFormatted || '0초'}</p>
    </div>

    <div class="container">
        <div class="grid">
            <!-- Lighthouse 점수 -->
            <div class="card">
                <h3>📊 Lighthouse 점수</h3>
                <div class="lighthouse-scores">
                    ${
                      metrics.lighthouse.scores
                        ? Object.entries(metrics.lighthouse.scores)
                            .map(([key, score]) => {
                              const status =
                                score >= 90
                                  ? 'status-good'
                                  : score >= 70
                                    ? 'status-warning'
                                    : 'status-critical';
                              return `
                        <div class="score-item">
                            <div class="metric-label">${key}</div>
                            <div class="metric-value ${status}">${score || 0}</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${score || 0}%"></div>
                            </div>
                        </div>
                      `;
                            })
                            .join('')
                        : '<p>데이터 없음</p>'
                    }
                </div>
                <div class="timestamp">
                    ${metrics.lighthouse.timestamp ? `측정 시간: ${new Date(metrics.lighthouse.timestamp).toLocaleString('ko-KR')}` : ''}
                </div>
            </div>

            <!-- Core Web Vitals -->
            <div class="card">
                <h3>⚡ Core Web Vitals</h3>
                ${
                  metrics.lighthouse.vitals
                    ? `
                    <div>
                        <div class="metric-label">LCP (Largest Contentful Paint)</div>
                        <div class="metric-value ${metrics.lighthouse.vitals.lcp <= 2500 ? 'status-good' : 'status-warning'}">${Math.round(metrics.lighthouse.vitals.lcp)}ms</div>
                    </div>
                    <div>
                        <div class="metric-label">FID (First Input Delay)</div>
                        <div class="metric-value ${metrics.lighthouse.vitals.fid <= 100 ? 'status-good' : 'status-warning'}">${Math.round(metrics.lighthouse.vitals.fid)}ms</div>
                    </div>
                    <div>
                        <div class="metric-label">CLS (Cumulative Layout Shift)</div>
                        <div class="metric-value ${metrics.lighthouse.vitals.cls <= 0.1 ? 'status-good' : 'status-warning'}">${metrics.lighthouse.vitals.cls.toFixed(3)}</div>
                    </div>
                `
                    : '<p>데이터 없음</p>'
                }
            </div>

            <!-- 실사용자 메트릭 -->
            <div class="card">
                <h3>👥 실사용자 메트릭 (RUM)</h3>
                ${
                  metrics.rum.timestamp
                    ? `
                    <div>
                        <div class="metric-label">페이지뷰</div>
                        <div class="metric-value">${metrics.rum.pageViews?.toLocaleString()}</div>
                    </div>
                    <div>
                        <div class="metric-label">순 사용자</div>
                        <div class="metric-value">${metrics.rum.uniqueUsers?.toLocaleString()}</div>
                    </div>
                    <div>
                        <div class="metric-label">이탈률</div>
                        <div class="metric-value">${metrics.rum.bounceRate}%</div>
                    </div>
                    <div>
                        <div class="metric-label">평균 세션 시간</div>
                        <div class="metric-value">${Math.floor(metrics.rum.avgSessionDuration / 60)}분 ${metrics.rum.avgSessionDuration % 60}초</div>
                    </div>
                `
                    : '<p>데이터 수집 중...</p>'
                }
                <div class="timestamp">
                    ${metrics.rum.timestamp ? `수집 시간: ${new Date(metrics.rum.timestamp).toLocaleString('ko-KR')}` : ''}
                </div>
            </div>

            <!-- PWA 메트릭 -->
            <div class="card">
                <h3>📱 PWA 메트릭</h3>
                ${
                  metrics.pwa.timestamp
                    ? `
                    <div>
                        <div class="metric-label">설치 프롬프트</div>
                        <div class="metric-value">${metrics.pwa.installPrompts}</div>
                    </div>
                    <div>
                        <div class="metric-label">실제 설치</div>
                        <div class="metric-value">${metrics.pwa.installs}</div>
                    </div>
                    <div>
                        <div class="metric-label">설치율</div>
                        <div class="metric-value">${metrics.pwa.installRate}%</div>
                    </div>
                    <div>
                        <div class="metric-label">오프라인 사용</div>
                        <div class="metric-value">${metrics.pwa.offlineUsage}</div>
                    </div>
                `
                    : '<p>데이터 수집 중...</p>'
                }
                <div class="timestamp">
                    ${metrics.pwa.timestamp ? `수집 시간: ${new Date(metrics.pwa.timestamp).toLocaleString('ko-KR')}` : ''}
                </div>
            </div>

            <!-- 시스템 상태 -->
            <div class="card">
                <h3>🔧 시스템 상태</h3>
                <div>
                    <div class="metric-label">모니터링 상태</div>
                    <div class="metric-value ${metrics.status === 'active' ? 'status-good' : 'status-warning'}">${metrics.status === 'active' ? '활성' : '비활성'}</div>
                </div>
                <div>
                    <div class="metric-label">총 오류 수</div>
                    <div class="metric-value ${metrics.errors.length === 0 ? 'status-good' : 'status-warning'}">${metrics.errors.length}</div>
                </div>
                <div>
                    <div class="metric-label">업타임</div>
                    <div class="metric-value status-good">${metrics.uptimeFormatted}</div>
                </div>
            </div>

            <!-- 최근 오류 -->
            ${
              metrics.errors.length > 0
                ? `
            <div class="card">
                <h3>🚨 최근 오류</h3>
                <div class="error-list">
                    ${metrics.errors
                      .slice(-5)
                      .reverse()
                      .map(
                        (error) => `
                        <div class="error-item">
                            <strong>${error.message}</strong><br>
                            <small>${new Date(error.timestamp).toLocaleString('ko-KR')}</small>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            </div>
            `
                : ''
            }
        </div>
    </div>

    <button class="refresh-btn" onclick="location.reload()">🔄 새로고침</button>

    <script>
        // 자동 새로고침 (30초마다)
        setTimeout(() => {
            location.reload();
        }, 30000);
        
        // 실시간 시계
        setInterval(() => {
            const now = new Date().toLocaleString('ko-KR');
            document.title = 'doha.kr 모니터링 - ' + now;
        }, 1000);
    </script>
</body>
</html>
    `;
  }

  /**
   * 대시보드 파일 저장
   */
  async saveDashboard() {
    const html = this.generateDashboardHTML();
    const fs = await import('fs/promises');

    try {
      await fs.writeFile('monitoring-dashboard.html', html, 'utf8');
      console.log('✅ 대시보드 저장됨: monitoring-dashboard.html');
    } catch (error) {
      console.error('❌ 대시보드 저장 실패:', error.message);
    }
  }
}

export default RealTimeMonitor;

// 명령줄에서 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new RealTimeMonitor({
    baseUrl: 'http://localhost:3000',
    interval: 60000, // 1분마다 테스트
  });

  // 이벤트 리스너 등록
  monitor.on('metrics-updated', (metrics) => {
    console.log('📊 메트릭 업데이트됨:', {
      lighthouse: metrics.lighthouse.scores,
      timestamp: metrics.lastUpdate,
    });
  });

  monitor.on('threshold-exceeded', (alerts) => {
    console.warn('⚠️  성능 경고:', alerts);
  });

  monitor.on('error-recorded', (error) => {
    console.error('🚨 오류 기록됨:', error.message);
  });

  // 모니터링 시작
  await monitor.start();

  // 대시보드 주기적 저장 (5분마다)
  setInterval(async () => {
    await monitor.saveDashboard();
  }, 300000);

  // 초기 대시보드 생성
  await monitor.saveDashboard();

  // 종료 시 정리
  process.on('SIGINT', () => {
    console.log('\n🛑 모니터링 종료 중...');
    monitor.stop();
    process.exit(0);
  });

  console.log('✅ 실시간 모니터링 시작됨. Ctrl+C로 종료하세요.');
  console.log('📊 대시보드: monitoring-dashboard.html');
}
