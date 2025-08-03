/**
 * Lighthouse CI 자동화 스케줄러
 * 정기적으로 Lighthouse 감사를 실행하고 결과를 저장하는 시스템
 *
 * 기능:
 * - 스케줄된 Lighthouse 감사 실행
 * - 성능 지표 추적 및 기록
 * - 임계값 기반 알림 시스템
 * - 보고서 자동 생성
 * - GitHub Actions 연동
 */

import { spawn } from 'child_process';
import { writeFile, readFile, mkdir, access } from 'fs/promises';
import { createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Lighthouse CI 스케줄러 클래스
 */
class LighthouseCIScheduler {
  constructor(options = {}) {
    this.config = {
      // 기본 설정
      baseUrl: options.baseUrl || 'https://doha.kr',
      localUrl: options.localUrl || 'http://localhost:3000',
      outputDir: options.outputDir || join(__dirname, 'lighthouse-reports'),
      schedules: options.schedules || {
        // 매일 오전 9시
        daily: '0 9 * * *',
        // 매주 월요일 오전 6시
        weekly: '0 6 * * 1',
        // 매시간 (업무시간 중)
        hourly: '0 9-18 * * 1-5',
        // 배포 후 검증 (수동 트리거)
        onDemand: null,
      },
      thresholds: {
        performance: { min: 80, target: 90 },
        accessibility: { min: 95, target: 98 },
        bestPractices: { min: 90, target: 95 },
        seo: { min: 95, target: 100 },
        pwa: { min: 95, target: 100 },
        lcp: { max: 2500, target: 2000 }, // ms
        fid: { max: 100, target: 50 }, // ms
        cls: { max: 0.1, target: 0.05 }, // score
      },
      devices: ['desktop', 'mobile'],
      notifications: {
        slack: options.slackWebhook || null,
        email: options.emailConfig || null,
        github: options.githubConfig || null,
      },
      ...options,
    };

    this.isRunning = false;
    this.scheduledJobs = new Map();
    this.history = [];
    this.alerts = [];
  }

  /**
   * 스케줄러 시작
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Lighthouse CI 스케줄러가 이미 실행 중입니다.');
      return;
    }

    console.log('🚀 Lighthouse CI 스케줄러 시작...');

    try {
      // 출력 디렉토리 생성
      await this.ensureOutputDirectory();

      // 히스토리 로드
      await this.loadHistory();

      // 스케줄 작업 등록
      this.setupScheduledJobs();

      // 초기 감사 실행 (옵션)
      if (this.config.runOnStart) {
        await this.runAudit('startup', 'desktop');
      }

      this.isRunning = true;
      console.log('✅ Lighthouse CI 스케줄러가 시작되었습니다.');
      console.log(
        '📊 등록된 스케줄:',
        Object.keys(this.config.schedules).filter((key) => this.config.schedules[key])
      );
    } catch (error) {
      console.error('❌ Lighthouse CI 스케줄러 시작 실패:', error);
      throw error;
    }
  }

  /**
   * 스케줄러 중지
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Lighthouse CI 스케줄러가 실행되지 않고 있습니다.');
      return;
    }

    console.log('🛑 Lighthouse CI 스케줄러 중지 중...');

    // 모든 스케줄 작업 중지
    this.scheduledJobs.forEach((job, name) => {
      job.stop();
      console.log(`  ✓ ${name} 스케줄 중지됨`);
    });

    this.scheduledJobs.clear();
    this.isRunning = false;

    console.log('✅ Lighthouse CI 스케줄러가 중지되었습니다.');
  }

  /**
   * 출력 디렉토리 확인/생성
   */
  async ensureOutputDirectory() {
    try {
      await access(this.config.outputDir);
    } catch {
      await mkdir(this.config.outputDir, { recursive: true });
      console.log(`📁 출력 디렉토리 생성: ${this.config.outputDir}`);
    }

    // 서브 디렉토리 생성
    const subdirs = ['reports', 'json', 'screenshots', 'trends'];
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
   * 스케줄 작업 설정
   */
  setupScheduledJobs() {
    Object.entries(this.config.schedules).forEach(([name, schedule]) => {
      if (!schedule) return;

      console.log(`⏰ ${name} 스케줄 등록: ${schedule}`);

      const job = cron.schedule(
        schedule,
        async () => {
          console.log(`🔄 ${name} 스케줄 감사 시작...`);

          try {
            // 각 디바이스에 대해 감사 실행
            for (const device of this.config.devices) {
              await this.runAudit(name, device);
            }

            // 트렌드 분석
            await this.analyzeTrends();

            console.log(`✅ ${name} 스케줄 감사 완료`);
          } catch (error) {
            console.error(`❌ ${name} 스케줄 감사 실패:`, error);
            await this.recordError(name, error);
          }
        },
        {
          scheduled: false,
          timezone: 'Asia/Seoul',
        }
      );

      this.scheduledJobs.set(name, job);
      job.start();
    });
  }

  /**
   * Lighthouse 감사 실행
   */
  async runAudit(trigger = 'manual', device = 'desktop') {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const reportId = `${timestamp.split('T')[0]}_${trigger}_${device}_${Date.now()}`;

    console.log(`📊 Lighthouse 감사 시작 (${trigger}/${device})...`);

    try {
      // Chrome 인스턴스 시작
      const chrome = await chromeLauncher.launch({
        chromeFlags: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-extensions',
          '--disable-web-security',
          '--disable-features=TranslateUI',
        ],
      });

      // Lighthouse 설정
      const lighthouseConfig = this.getLighthouseConfig(device);
      const options = {
        logLevel: 'error',
        output: ['json', 'html'],
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
        port: chrome.port,
      };

      // 감사 실행
      const result = await lighthouse(this.config.baseUrl, options, lighthouseConfig);

      // Chrome 종료
      await chrome.kill();

      if (!result || !result.lhr) {
        throw new Error('Lighthouse 감사 결과가 유효하지 않습니다.');
      }

      // 결과 분석
      const analysis = this.analyzeResults(result.lhr);

      // 결과 저장
      await this.saveResults(reportId, result, analysis, trigger, device);

      // 임계값 검사 및 알림
      await this.checkThresholds(analysis, trigger, device);

      // 히스토리 업데이트
      this.updateHistory(analysis, trigger, device, reportId);

      const duration = Date.now() - startTime;
      console.log(`✅ Lighthouse 감사 완료 (${duration}ms): ${reportId}`);

      return {
        reportId,
        analysis,
        duration,
        timestamp,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Lighthouse 감사 실패 (${duration}ms):`, error.message);

      await this.recordError(trigger, error, { device, reportId });
      throw error;
    }
  }

  /**
   * Lighthouse 설정 반환
   */
  getLighthouseConfig(device) {
    const baseConfig = {
      extends: 'lighthouse:default',
      settings: {
        onlyAudits: [
          'first-contentful-paint',
          'largest-contentful-paint',
          'first-meaningful-paint',
          'speed-index',
          'interactive',
          'total-blocking-time',
          'cumulative-layout-shift',
          'max-potential-fid',
        ],
      },
    };

    if (device === 'mobile') {
      baseConfig.settings.formFactor = 'mobile';
      baseConfig.settings.throttling = {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4,
      };
      baseConfig.settings.screenEmulation = {
        mobile: true,
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
      };
    } else {
      baseConfig.settings.formFactor = 'desktop';
      baseConfig.settings.throttling = {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
      };
      baseConfig.settings.screenEmulation = {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
      };
    }

    return baseConfig;
  }

  /**
   * Lighthouse 결과 분석
   */
  analyzeResults(lhr) {
    const { audits, categories } = lhr;

    const scores = {};
    Object.keys(categories).forEach((categoryId) => {
      scores[categoryId] = Math.round(categories[categoryId].score * 100);
    });

    const vitals = {
      fcp: audits['first-contentful-paint']?.numericValue || 0,
      lcp: audits['largest-contentful-paint']?.numericValue || 0,
      fmp: audits['first-meaningful-paint']?.numericValue || 0,
      si: audits['speed-index']?.numericValue || 0,
      tti: audits['interactive']?.numericValue || 0,
      tbt: audits['total-blocking-time']?.numericValue || 0,
      cls: audits['cumulative-layout-shift']?.numericValue || 0,
      fid: audits['max-potential-fid']?.numericValue || 0,
    };

    const resources = {
      totalByteWeight: audits['total-byte-weight']?.numericValue || 0,
      unusedCss: audits['unused-css-rules']?.details?.overallSavingsBytes || 0,
      unusedJs: audits['unused-javascript']?.details?.overallSavingsBytes || 0,
      optimizedImages: audits['uses-optimized-images']?.details?.overallSavingsBytes || 0,
      nextGenFormats: audits['uses-webp-images']?.details?.overallSavingsBytes || 0,
    };

    const opportunities = [];
    Object.keys(audits).forEach((auditId) => {
      const audit = audits[auditId];
      if (audit.details && audit.details.overallSavingsMs > 100) {
        opportunities.push({
          audit: auditId,
          title: audit.title,
          savings: audit.details.overallSavingsMs,
          description: audit.description,
        });
      }
    });

    return {
      timestamp: new Date().toISOString(),
      url: lhr.finalUrl,
      device: lhr.configSettings.formFactor,
      scores,
      vitals,
      resources,
      opportunities: opportunities.sort((a, b) => b.savings - a.savings).slice(0, 5),
      fetchTime: lhr.fetchTime,
      userAgent: lhr.userAgent,
    };
  }

  /**
   * 결과 저장
   */
  async saveResults(reportId, result, analysis, trigger, device) {
    try {
      // JSON 결과 저장
      const jsonPath = join(this.config.outputDir, 'json', `${reportId}.json`);
      await writeFile(
        jsonPath,
        JSON.stringify(
          {
            reportId,
            trigger,
            device,
            analysis,
            raw: result.lhr,
          },
          null,
          2
        )
      );

      // HTML 보고서 저장
      const htmlPath = join(this.config.outputDir, 'reports', `${reportId}.html`);
      await writeFile(htmlPath, result.report);

      // 스크린샷 저장 (있는 경우)
      if (result.artifacts && result.artifacts.FullPageScreenshot) {
        const screenshotPath = join(this.config.outputDir, 'screenshots', `${reportId}.png`);
        const screenshotData = result.artifacts.FullPageScreenshot.screenshot.data;
        const buffer = Buffer.from(screenshotData, 'base64');
        await writeFile(screenshotPath, buffer);
      }

      console.log(`💾 결과 저장됨: ${reportId}`);
    } catch (error) {
      console.error('❌ 결과 저장 실패:', error);
      throw error;
    }
  }

  /**
   * 임계값 검사
   */
  async checkThresholds(analysis, trigger, device) {
    const violations = [];
    const warnings = [];

    // Lighthouse 점수 검사
    Object.entries(this.config.thresholds).forEach(([metric, threshold]) => {
      if (analysis.scores[metric] !== undefined) {
        const score = analysis.scores[metric];

        if (score < threshold.min) {
          violations.push({
            type: 'score',
            metric,
            current: score,
            threshold: threshold.min,
            target: threshold.target,
            severity: 'critical',
          });
        } else if (score < threshold.target) {
          warnings.push({
            type: 'score',
            metric,
            current: score,
            threshold: threshold.target,
            severity: 'warning',
          });
        }
      }
    });

    // Core Web Vitals 검사
    if (analysis.vitals.lcp > this.config.thresholds.lcp.max) {
      violations.push({
        type: 'vital',
        metric: 'lcp',
        current: Math.round(analysis.vitals.lcp),
        threshold: this.config.thresholds.lcp.max,
        target: this.config.thresholds.lcp.target,
        severity:
          analysis.vitals.lcp > this.config.thresholds.lcp.max * 1.5 ? 'critical' : 'warning',
      });
    }

    if (analysis.vitals.fid > this.config.thresholds.fid.max) {
      violations.push({
        type: 'vital',
        metric: 'fid',
        current: Math.round(analysis.vitals.fid),
        threshold: this.config.thresholds.fid.max,
        target: this.config.thresholds.fid.target,
        severity: 'warning',
      });
    }

    if (analysis.vitals.cls > this.config.thresholds.cls.max) {
      violations.push({
        type: 'vital',
        metric: 'cls',
        current: analysis.vitals.cls.toFixed(3),
        threshold: this.config.thresholds.cls.max,
        target: this.config.thresholds.cls.target,
        severity: 'warning',
      });
    }

    // 알림 발송
    if (violations.length > 0 || warnings.length > 0) {
      await this.sendNotifications({
        trigger,
        device,
        violations,
        warnings,
        analysis,
        timestamp: analysis.timestamp,
      });
    }

    return { violations, warnings };
  }

  /**
   * 알림 발송
   */
  async sendNotifications(alertData) {
    const { trigger, device, violations, warnings, analysis } = alertData;

    console.log(`🚨 임계값 초과 알림 (${trigger}/${device}):`);

    violations.forEach((v) => {
      console.log(`  ❌ ${v.metric}: ${v.current} (임계값: ${v.threshold})`);
    });

    warnings.forEach((w) => {
      console.log(`  ⚠️  ${w.metric}: ${w.current} (목표: ${w.threshold})`);
    });

    // Slack 알림 (설정된 경우)
    if (this.config.notifications.slack) {
      await this.sendSlackNotification(alertData);
    }

    // GitHub 이슈 생성 (설정된 경우)
    if (this.config.notifications.github && violations.length > 0) {
      await this.createGitHubIssue(alertData);
    }

    // 이메일 알림 (설정된 경우)
    if (this.config.notifications.email) {
      await this.sendEmailNotification(alertData);
    }

    // 알림 히스토리에 추가
    this.alerts.push({
      ...alertData,
      id: `alert_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });

    // 최근 100개 알림만 유지
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  /**
   * Slack 알림 발송
   */
  async sendSlackNotification(alertData) {
    // Slack 웹훅 구현
    console.log('📱 Slack 알림 발송 준비됨');
  }

  /**
   * GitHub 이슈 생성
   */
  async createGitHubIssue(alertData) {
    // GitHub API 구현
    console.log('🐙 GitHub 이슈 생성 준비됨');
  }

  /**
   * 이메일 알림 발송
   */
  async sendEmailNotification(alertData) {
    // 이메일 발송 구현
    console.log('📧 이메일 알림 발송 준비됨');
  }

  /**
   * 히스토리 업데이트
   */
  updateHistory(analysis, trigger, device, reportId) {
    this.history.push({
      reportId,
      timestamp: analysis.timestamp,
      trigger,
      device,
      scores: analysis.scores,
      vitals: analysis.vitals,
    });

    // 최근 1000개 기록만 유지
    if (this.history.length > 1000) {
      this.history = this.history.slice(-1000);
    }
  }

  /**
   * 히스토리 로드
   */
  async loadHistory() {
    try {
      const historyPath = join(this.config.outputDir, 'history.json');
      const historyData = await readFile(historyPath, 'utf8');
      this.history = JSON.parse(historyData);
      console.log(`📚 히스토리 로드됨: ${this.history.length}개 기록`);
    } catch (error) {
      console.log('📚 새로운 히스토리 시작');
      this.history = [];
    }
  }

  /**
   * 히스토리 저장
   */
  async saveHistory() {
    try {
      const historyPath = join(this.config.outputDir, 'history.json');
      await writeFile(historyPath, JSON.stringify(this.history, null, 2));
    } catch (error) {
      console.error('❌ 히스토리 저장 실패:', error);
    }
  }

  /**
   * 트렌드 분석
   */
  async analyzeTrends() {
    if (this.history.length < 2) {
      console.log('📈 트렌드 분석을 위한 충분한 데이터가 없습니다.');
      return;
    }

    const recent = this.history.slice(-10); // 최근 10개 기록
    const trends = {};

    // 각 메트릭별 트렌드 계산
    ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'].forEach((metric) => {
      const scores = recent.map((h) => h.scores[metric]).filter((s) => s !== undefined);
      if (scores.length >= 2) {
        const latest = scores[scores.length - 1];
        const previous = scores[scores.length - 2];
        const change = latest - previous;
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;

        trends[metric] = {
          latest,
          previous,
          change,
          average: Math.round(average),
          trend: change > 2 ? 'improving' : change < -2 ? 'declining' : 'stable',
        };
      }
    });

    // Core Web Vitals 트렌드
    ['lcp', 'fid', 'cls'].forEach((vital) => {
      const values = recent.map((h) => h.vitals[vital]).filter((v) => v !== undefined && v > 0);
      if (values.length >= 2) {
        const latest = values[values.length - 1];
        const previous = values[values.length - 2];
        const change = latest - previous;
        const average = values.reduce((a, b) => a + b, 0) / values.length;

        trends[vital] = {
          latest,
          previous,
          change,
          average,
          trend: change < -100 ? 'improving' : change > 100 ? 'declining' : 'stable',
        };
      }
    });

    // 트렌드 보고서 저장
    const trendReport = {
      timestamp: new Date().toISOString(),
      period: {
        from: recent[0].timestamp,
        to: recent[recent.length - 1].timestamp,
        count: recent.length,
      },
      trends,
    };

    const trendPath = join(this.config.outputDir, 'trends', `trend-${Date.now()}.json`);
    await writeFile(trendPath, JSON.stringify(trendReport, null, 2));

    console.log('📈 트렌드 분석 완료:', Object.keys(trends).length, '개 메트릭');

    return trendReport;
  }

  /**
   * 오류 기록
   */
  async recordError(trigger, error, context = {}) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      trigger,
      message: error.message,
      stack: error.stack,
      context,
    };

    console.error('❌ 오류 기록:', errorRecord);

    // 오류 로그 파일에 저장
    const errorLogPath = join(this.config.outputDir, 'errors.jsonl');
    const errorLine = JSON.stringify(errorRecord) + '\n';

    try {
      const stream = createWriteStream(errorLogPath, { flags: 'a' });
      stream.write(errorLine);
      stream.end();
    } catch (logError) {
      console.error('❌ 오류 로그 저장 실패:', logError);
    }
  }

  /**
   * 수동 감사 실행
   */
  async runManualAudit(device = 'desktop') {
    console.log(`🎯 수동 감사 실행 (${device})...`);
    return await this.runAudit('manual', device);
  }

  /**
   * 상태 반환
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      scheduledJobs: Array.from(this.scheduledJobs.keys()),
      historyCount: this.history.length,
      alertsCount: this.alerts.length,
      lastRun: this.history.length > 0 ? this.history[this.history.length - 1].timestamp : null,
      config: {
        baseUrl: this.config.baseUrl,
        devices: this.config.devices,
        outputDir: this.config.outputDir,
        schedules: Object.keys(this.config.schedules).filter((key) => this.config.schedules[key]),
      },
    };
  }

  /**
   * 정리 및 종료
   */
  async cleanup() {
    console.log('🧹 Lighthouse CI 스케줄러 정리 중...');

    // 히스토리 저장
    await this.saveHistory();

    // 스케줄 중지
    this.stop();

    console.log('✅ 정리 완료');
  }
}

export default LighthouseCIScheduler;

// CLI에서 직접 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  const scheduler = new LighthouseCIScheduler({
    baseUrl: process.env.LIGHTHOUSE_URL || 'https://doha.kr',
    runOnStart: true,
    schedules: {
      // 개발 중에는 더 자주 실행
      frequent: '*/5 * * * *', // 5분마다
      daily: '0 9 * * *', // 매일 오전 9시
      weekly: '0 6 * * 1', // 매주 월요일 오전 6시
    },
  });

  // 이벤트 핸들러
  process.on('SIGINT', async () => {
    console.log('\n🛑 종료 신호 받음...');
    await scheduler.cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 종료 신호 받음...');
    await scheduler.cleanup();
    process.exit(0);
  });

  // 스케줄러 시작
  try {
    await scheduler.start();

    // 상태 출력
    console.log('\n📊 스케줄러 상태:', scheduler.getStatus());

    // 수동 감사 실행 (테스트)
    if (process.argv.includes('--run-now')) {
      console.log('\n🎯 즉시 감사 실행...');
      await scheduler.runManualAudit('desktop');
      await scheduler.runManualAudit('mobile');
    }

    console.log('\n✅ Lighthouse CI 스케줄러가 실행 중입니다. Ctrl+C로 종료하세요.');
  } catch (error) {
    console.error('❌ 스케줄러 시작 실패:', error);
    process.exit(1);
  }
}
