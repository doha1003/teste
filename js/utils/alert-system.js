/**
 * 🚨 통합 알림 시스템
 * Lighthouse 점수 모니터링, GitHub Issues 자동 생성, 실시간 알림
 */

class AlertSystem {
  constructor() {
    this.config = {
      lighthouseThreshold: 85,
      criticalThreshold: 50,
      performanceCheckInterval: 300000, // 5분
      alertCooldown: 900000, // 15분 쿨다운
      enableWebhooks: true,
      enableNotifications: true,
      githubRepo: 'doha-kr/doha.kr', // GitHub 저장소
      slackWebhook: process.env.SLACK_WEBHOOK_URL,
      discordWebhook: process.env.DISCORD_WEBHOOK_URL,
    };

    this.alertHistory = [];
    this.lastAlertTimes = new Map();
    this.isRunning = false;

    this.init();
  }

  // 알림 시스템 초기화
  async init() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    console.log('Alert System initialized');

    // 주기적 성능 체크
    this.startPerformanceMonitoring();

    // 브라우저 알림 권한 요청
    if (typeof window !== 'undefined' && 'Notification' in window) {
      await this.requestNotificationPermission();
    }

    // 이벤트 리스너 설정
    this.setupEventListeners();
  }

  // 브라우저 알림 권한 요청
  async requestNotificationPermission() {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    // Analytics 이벤트 리스너
    if (typeof window !== 'undefined' && window.Analytics) {
      // 성능 메트릭 수집 완료 시
      window.addEventListener('lighthouseMetricsCollected', (event) => {
        this.checkLighthouseScore(event.detail);
      });

      // Critical 에러 발생 시
      window.addEventListener('criticalErrorDetected', (event) => {
        this.handleCriticalError(event.detail);
      });
    }
  }

  // 성능 모니터링 시작
  startPerformanceMonitoring() {
    setInterval(async () => {
      await this.performPerformanceCheck();
    }, this.config.performanceCheckInterval);

    console.log(
      `Performance monitoring started (${this.config.performanceCheckInterval}ms interval)`
    );
  }

  // 성능 체크 수행
  async performPerformanceCheck() {
    try {
      // 현재 Lighthouse 메트릭 수집
      const metrics = await this.getCurrentLighthouseMetrics();

      if (metrics) {
        await this.checkLighthouseScore(metrics);

        // 성능 트렌드 분석
        const trend = await this.analyzePerformanceTrend();
        if (trend.needsAlert) {
          await this.sendPerformanceTrendAlert(trend);
        }
      }
    } catch (error) {
      console.error('Performance check failed:', error);

      // 모니터링 시스템 자체 에러도 알림
      await this.sendSystemAlert({
        type: 'monitoring_system_error',
        message: '성능 모니터링 시스템에 오류가 발생했습니다',
        error: error.message,
      });
    }
  }

  // 현재 Lighthouse 메트릭 가져오기
  async getCurrentLighthouseMetrics() {
    try {
      // Analytics에서 최신 메트릭 가져오기
      if (window.Analytics?.lighthouseMetrics) {
        return window.Analytics.lighthouseMetrics;
      }

      // API에서 최신 메트릭 가져오기
      const response = await fetch('/api/lighthouse-metrics?latest=true');
      if (response.ok) {
        const result = await response.json();
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('Failed to get current metrics:', error);
      return null;
    }
  }

  // Lighthouse 점수 확인
  async checkLighthouseScore(metrics) {
    if (!metrics || !metrics.performanceScore) {
      return;
    }

    const score = metrics.performanceScore;
    const alertKey = 'lighthouse_score';

    // 85점 미만 알림
    if (score < this.config.lighthouseThreshold) {
      if (this.shouldSendAlert(alertKey)) {
        await this.sendLighthouseAlert({
          score,
          threshold: this.config.lighthouseThreshold,
          metrics,
          severity: score < this.config.criticalThreshold ? 'critical' : 'warning',
        });

        this.recordAlert(alertKey);
      }
    }

    // Critical 점수 알림
    if (score < this.config.criticalThreshold) {
      const criticalKey = 'lighthouse_critical';
      if (this.shouldSendAlert(criticalKey)) {
        await this.sendCriticalPerformanceAlert({
          score,
          metrics,
        });

        this.recordAlert(criticalKey);
      }
    }
  }

  // Lighthouse 알림 전송
  async sendLighthouseAlert(alertData) {
    const alert = {
      type: 'lighthouse_performance',
      timestamp: Date.now(),
      data: alertData,

      korean: {
        title: `성능 점수 ${alertData.severity === 'critical' ? 'Critical' : '경고'}`,
        message: `Lighthouse 성능 점수가 ${alertData.score}점으로 목표(${alertData.threshold}점) 미달입니다.`,
        severity: alertData.severity === 'critical' ? '심각' : '경고',
        action: '즉시 성능 최적화가 필요합니다.',
      },
    };

    // 다양한 채널로 알림 전송
    await Promise.all([
      this.sendBrowserNotification(alert),
      this.sendWebhookAlert(alert),
      this.createGitHubIssue(alert),
      this.saveAlert(alert),
    ]);

    console.warn(
      `Lighthouse Alert: Score ${alertData.score} below threshold ${alertData.threshold}`
    );
  }

  // Critical 성능 알림
  async sendCriticalPerformanceAlert(alertData) {
    const alert = {
      type: 'critical_performance',
      timestamp: Date.now(),
      data: alertData,

      korean: {
        title: 'Critical 성능 이슈',
        message: `성능 점수가 ${alertData.score}점으로 Critical 수준입니다.`,
        severity: 'Critical',
        action: '즉시 조치가 필요합니다.',
      },
    };

    // Critical 알림은 모든 채널 사용
    await Promise.all([
      this.sendBrowserNotification(alert, { requireInteraction: true }),
      this.sendWebhookAlert(alert, 'critical'),
      this.createGitHubIssue(alert, 'critical'),
      this.sendEmailAlert(alert), // Critical은 이메일도 전송
      this.saveAlert(alert),
    ]);

    console.error(`Critical Performance Alert: Score ${alertData.score}`);
  }

  // Critical 에러 처리
  async handleCriticalError(errorData) {
    const alert = {
      type: 'critical_error',
      timestamp: Date.now(),
      data: errorData,

      korean: {
        title: 'Critical 에러 발생',
        message: `${errorData.type} 에러가 발생했습니다: ${errorData.message}`,
        severity: 'Critical',
        action: '즉시 확인이 필요합니다.',
      },
    };

    const alertKey = `critical_error_${errorData.type}`;
    if (this.shouldSendAlert(alertKey)) {
      await Promise.all([
        this.sendBrowserNotification(alert, { requireInteraction: true }),
        this.sendWebhookAlert(alert, 'critical'),
        this.createGitHubIssue(alert, 'critical'),
        this.saveAlert(alert),
      ]);

      this.recordAlert(alertKey);
    }
  }

  // 브라우저 알림 전송
  async sendBrowserNotification(alert, options = {}) {
    if (!this.config.enableNotifications || typeof window === 'undefined') {
      return;
    }

    try {
      if (Notification.permission === 'granted') {
        const notification = new Notification(alert.korean.title, {
          body: alert.korean.message,
          icon: '/images/icon-192x192.png',
          badge: '/images/icon-48x48.png',
          tag: alert.type,
          requireInteraction: options.requireInteraction || false,
          silent: false,
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          this.showAlertDetails(alert);
          notification.close();
        };

        // 자동 닫기 (Critical 제외)
        if (!options.requireInteraction) {
          setTimeout(() => notification.close(), 10000);
        }
      }
    } catch (error) {
      console.error('Browser notification failed:', error);
    }
  }

  // 웹훅 알림 전송
  async sendWebhookAlert(alert, priority = 'normal') {
    if (!this.config.enableWebhooks) {
      return;
    }

    const webhookData = {
      alert,
      priority,
      timestamp: new Date().toISOString(),
      site: 'doha.kr',
      korean: alert.korean,
    };

    // Slack 웹훅
    if (this.config.slackWebhook) {
      await this.sendSlackAlert(webhookData);
    }

    // Discord 웹훅
    if (this.config.discordWebhook) {
      await this.sendDiscordAlert(webhookData);
    }

    // 커스텀 웹훅
    await this.sendCustomWebhook(webhookData);
  }

  // Slack 알림
  async sendSlackAlert(data) {
    try {
      const color = data.priority === 'critical' ? 'danger' : 'warning';
      const payload = {
        channel: '#alerts',
        username: 'doha.kr 모니터링',
        icon_emoji: ':warning:',
        attachments: [
          {
            color,
            title: data.alert.korean.title,
            text: data.alert.korean.message,
            fields: [
              {
                title: '심각도',
                value: data.alert.korean.severity,
                short: true,
              },
              {
                title: '시간',
                value: new Date(data.alert.timestamp).toLocaleString('ko-KR'),
                short: true,
              },
            ],
            footer: 'doha.kr Performance Monitor',
            ts: Math.floor(data.alert.timestamp / 1000),
          },
        ],
      };

      await fetch(this.config.slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Slack alert failed:', error);
    }
  }

  // Discord 알림
  async sendDiscordAlert(data) {
    try {
      const embed = {
        title: data.alert.korean.title,
        description: data.alert.korean.message,
        color: data.priority === 'critical' ? 15158332 : 16776960, // Red : Yellow
        fields: [
          {
            name: '심각도',
            value: data.alert.korean.severity,
            inline: true,
          },
          {
            name: '시간',
            value: new Date(data.alert.timestamp).toLocaleString('ko-KR'),
            inline: true,
          },
        ],
        footer: {
          text: 'doha.kr Performance Monitor',
        },
        timestamp: new Date(data.alert.timestamp).toISOString(),
      };

      await fetch(this.config.discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'doha.kr 모니터링',
          embeds: [embed],
        }),
      });
    } catch (error) {
      console.error('Discord alert failed:', error);
    }
  }

  // GitHub Issues 자동 생성
  async createGitHubIssue(alert, priority = 'normal') {
    try {
      const issueData = this.generateGitHubIssueData(alert, priority);

      // GitHub API 호출을 위한 서버 사이드 엔드포인트 사용
      const response = await fetch('/api/github-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`GitHub Issue created: ${result.issueUrl}`);

        // 생성된 이슈 정보를 알림에 추가
        alert.githubIssue = {
          url: result.issueUrl,
          number: result.issueNumber,
        };
      }
    } catch (error) {
      console.error('GitHub Issue creation failed:', error);
    }
  }

  // GitHub Issue 데이터 생성
  generateGitHubIssueData(alert, priority) {
    const title = `[${priority.toUpperCase()}] ${alert.korean.title}`;

    let body = `## 📊 성능 알림\n\n`;
    body += `**유형**: ${alert.type}\n`;
    body += `**심각도**: ${alert.korean.severity}\n`;
    body += `**발생시간**: ${new Date(alert.timestamp).toLocaleString('ko-KR')}\n\n`;

    body += `### 📋 상세내용\n`;
    body += `${alert.korean.message}\n\n`;

    if (alert.data) {
      body += `### 📈 메트릭 정보\n`;

      if (alert.data.score) {
        body += `- **성능 점수**: ${alert.data.score}점\n`;
      }

      if (alert.data.metrics) {
        const { metrics } = alert.data;
        if (metrics.fcp) {
          body += `- **FCP**: ${Math.round(metrics.fcp)}ms\n`;
        }
        if (metrics.lcp) {
          body += `- **LCP**: ${Math.round(metrics.lcp)}ms\n`;
        }
        if (metrics.cls) {
          body += `- **CLS**: ${metrics.cls.toFixed(3)}\n`;
        }
        if (metrics.fid) {
          body += `- **FID**: ${Math.round(metrics.fid)}ms\n`;
        }
      }
    }

    body += `\n### 🔧 권장조치\n`;
    body += `${alert.korean.action}\n\n`;

    body += `### 🔗 관련링크\n`;
    body += `- [성능 대시보드](https://doha.kr/monitoring)\n`;
    body += `- [Lighthouse 리포트](https://doha.kr/lighthouse)\n\n`;

    body += `---\n`;
    body += `*이 이슈는 자동으로 생성되었습니다.*`;

    const labels = ['performance'];
    if (priority === 'critical') {
      labels.push('critical');
    }
    if (alert.type.includes('lighthouse')) {
      labels.push('lighthouse');
    }
    if (alert.type.includes('error')) {
      labels.push('bug');
    }

    return {
      title,
      body,
      labels,
      priority,
    };
  }

  // 성능 트렌드 분석
  async analyzePerformanceTrend() {
    try {
      // AnalyticsAggregator를 사용하여 주간 트렌드 분석
      if (window.AnalyticsAggregator) {
        const weeklyData = await window.AnalyticsAggregator.getWeeklyAggregation();

        if (weeklyData.trends && weeklyData.trends.trend === 'declining') {
          return {
            needsAlert: true,
            trend: 'declining',
            data: weeklyData,
            korean: {
              message: '주간 성능 트렌드가 하락세를 보이고 있습니다',
              recommendation: '성능 최적화 작업이 필요합니다',
            },
          };
        }
      }

      return { needsAlert: false };
    } catch (error) {
      console.error('Performance trend analysis failed:', error);
      return { needsAlert: false };
    }
  }

  // 성능 트렌드 알림
  async sendPerformanceTrendAlert(trendData) {
    const alert = {
      type: 'performance_trend',
      timestamp: Date.now(),
      data: trendData,

      korean: {
        title: '성능 트렌드 경고',
        message: trendData.korean.message,
        severity: '경고',
        action: trendData.korean.recommendation,
      },
    };

    await Promise.all([
      this.sendBrowserNotification(alert),
      this.sendWebhookAlert(alert),
      this.saveAlert(alert),
    ]);
  }

  // 시스템 알림
  async sendSystemAlert(alertData) {
    const alert = {
      type: 'system_alert',
      timestamp: Date.now(),
      data: alertData,

      korean: {
        title: '시스템 알림',
        message: alertData.message,
        severity: '시스템',
        action: '시스템 상태를 확인하세요',
      },
    };

    await Promise.all([this.sendWebhookAlert(alert), this.saveAlert(alert)]);
  }

  // 커스텀 웹훅
  async sendCustomWebhook(data) {
    try {
      await fetch('/api/alert-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Custom webhook failed:', error);
    }
  }

  // 이메일 알림 (Critical 전용)
  async sendEmailAlert(alert) {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'critical_alert',
          alert,
        }),
      });
    } catch (error) {
      console.error('Email alert failed:', error);
    }
  }

  // 알림 발송 여부 판단 (쿨다운 체크)
  shouldSendAlert(alertKey) {
    const lastAlertTime = this.lastAlertTimes.get(alertKey);
    const now = Date.now();

    if (!lastAlertTime || now - lastAlertTime > this.config.alertCooldown) {
      return true;
    }

    return false;
  }

  // 알림 기록
  recordAlert(alertKey) {
    this.lastAlertTimes.set(alertKey, Date.now());
  }

  // 알림 저장
  async saveAlert(alert) {
    try {
      // 로컬 스토리지에 저장
      const existing = JSON.parse(localStorage.getItem('alertHistory') || '[]');
      existing.push(alert);

      // 최대 100개 유지
      if (existing.length > 100) {
        existing.splice(0, existing.length - 100);
      }

      localStorage.setItem('alertHistory', JSON.stringify(existing));

      // 메모리에도 저장
      this.alertHistory.push(alert);
      if (this.alertHistory.length > 100) {
        this.alertHistory.shift();
      }

      // API에도 저장
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'alert_sent',
          data: alert,
        }),
      });
    } catch (error) {
      console.error('Failed to save alert:', error);
    }
  }

  // 알림 상세 표시
  showAlertDetails(alert) {
    // 모달이나 새 탭에서 알림 상세 정보 표시
    const detailsUrl = `/monitoring/alert/${alert.type}?timestamp=${alert.timestamp}`;
    window.open(detailsUrl, '_blank');
  }

  // 알림 기록 조회
  getAlertHistory(type = null, limit = 50) {
    let alerts = this.alertHistory;

    if (type) {
      alerts = alerts.filter((alert) => alert.type === type);
    }

    return alerts.slice(-limit);
  }

  // 알림 통계
  getAlertStats() {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const recentAlerts = this.alertHistory.filter((alert) => alert.timestamp > oneDayAgo);
    const weeklyAlerts = this.alertHistory.filter((alert) => alert.timestamp > oneWeekAgo);

    return {
      total: this.alertHistory.length,
      today: recentAlerts.length,
      thisWeek: weeklyAlerts.length,
      byType: this.groupBy(this.alertHistory, 'type'),
      recentCritical: this.alertHistory
        .filter((alert) => alert.korean?.severity === 'Critical')
        .slice(-10),
    };
  }

  // 유틸리티: 그룹화
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      result[group] = result[group] || [];
      result[group].push(item);
      return result;
    }, {});
  }

  // 알림 시스템 정지
  stop() {
    this.isRunning = false;
    console.log('Alert System stopped');
  }

  // 설정 업데이트
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('Alert System config updated');
  }
}

// 전역 인스턴스 생성
if (typeof window !== 'undefined') {
  window.AlertSystem = new AlertSystem();
}

export default AlertSystem;
