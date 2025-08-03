/**
 * 🚨 Critical 알림 웹훅 API
 * 즉시 알림이 필요한 Critical 에러와 성능 이슈를 처리
 */

const MAX_REQUESTS_PER_MINUTE = 30;
const requestCounts = new Map();

// Critical 알림 분류
const CRITICAL_TYPES = {
  PERFORMANCE: 'performance',
  ERROR: 'error',
  SECURITY: 'security',
  AVAILABILITY: 'availability',
};

// 알림 우선순위
const PRIORITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// 레이트 리미팅
function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - 60000;

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const requests = requestCounts.get(ip);
  const recentRequests = requests.filter((time) => time > windowStart);
  requestCounts.set(ip, recentRequests);

  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  recentRequests.push(now);
  return true;
}

// Critical 에러 감지
function isCriticalAlert(alertData) {
  const { alert, priority } = alertData;

  // 명시적 Critical 우선순위
  if (priority === PRIORITY_LEVELS.CRITICAL) {
    return true;
  }

  // 성능 점수 기반
  if (alert.type === 'lighthouse_performance' && alert.data?.score < 50) {
    return true;
  }

  // 에러 타입 기반
  const criticalErrorTypes = [
    'network_error',
    'javascript_error',
    'system_alert',
    'critical_performance',
  ];

  if (criticalErrorTypes.includes(alert.type)) {
    return true;
  }

  // 성능 저하가 심각한 경우
  if (alert.data?.performanceScore && alert.data.performanceScore < 40) {
    return true;
  }

  return false;
}

// 알림 데이터 검증
function validateAlertData(data) {
  const required = ['alert', 'timestamp'];
  const missing = required.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  if (!data.alert.type || !data.alert.korean) {
    throw new Error('Alert must have type and korean fields');
  }

  return true;
}

// Slack 웹훅 전송
async function sendSlackAlert(alertData) {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhookUrl) {
    console.warn('Slack webhook URL not configured');
    return null;
  }

  const { alert, priority } = alertData;
  const isCritical = priority === 'critical';

  const color = isCritical ? 'danger' : 'warning';
  const emoji = isCritical ? '🚨' : '⚠️';

  const payload = {
    channel: isCritical ? '#critical-alerts' : '#alerts',
    username: 'doha.kr 모니터링',
    icon_emoji: emoji,
    text: `${emoji} ${alert.korean.title}`,
    attachments: [
      {
        color: color,
        title: alert.korean.title,
        text: alert.korean.message,
        fields: [
          {
            title: '심각도',
            value: alert.korean.severity,
            short: true,
          },
          {
            title: '시간',
            value: new Date(alert.timestamp).toLocaleString('ko-KR', {
              timeZone: 'Asia/Seoul',
            }),
            short: true,
          },
          {
            title: '타입',
            value: alert.type,
            short: true,
          },
          {
            title: '조치사항',
            value: alert.korean.action,
            short: false,
          },
        ],
        footer: 'doha.kr Performance Monitor',
        ts: Math.floor(alert.timestamp / 1000),
      },
    ],
  };

  // Critical 알림에는 멘션 추가
  if (isCritical) {
    payload.text = `<!channel> ${payload.text}`;
  }

  try {
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('Slack alert sent successfully');
      return { success: true, channel: 'slack' };
    } else {
      throw new Error(`Slack API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Slack alert failed:', error);
    return { success: false, error: error.message };
  }
}

// Discord 웹훅 전송
async function sendDiscordAlert(alertData) {
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!discordWebhookUrl) {
    console.warn('Discord webhook URL not configured');
    return null;
  }

  const { alert, priority } = alertData;
  const isCritical = priority === 'critical';

  const embed = {
    title: `${isCritical ? '🚨' : '⚠️'} ${alert.korean.title}`,
    description: alert.korean.message,
    color: isCritical ? 15158332 : 16776960, // Red : Yellow
    fields: [
      {
        name: '심각도',
        value: alert.korean.severity,
        inline: true,
      },
      {
        name: '타입',
        value: alert.type,
        inline: true,
      },
      {
        name: '시간',
        value: new Date(alert.timestamp).toLocaleString('ko-KR', {
          timeZone: 'Asia/Seoul',
        }),
        inline: true,
      },
    ],
    footer: {
      text: 'doha.kr Performance Monitor',
    },
    timestamp: new Date(alert.timestamp).toISOString(),
  };

  // 성능 데이터가 있는 경우 추가
  if (alert.data?.score) {
    embed.fields.push({
      name: '성능 점수',
      value: `${alert.data.score}점`,
      inline: true,
    });
  }

  if (alert.data?.metrics) {
    const metrics = alert.data.metrics;
    let metricsText = '';
    if (metrics.fcp) metricsText += `FCP: ${Math.round(metrics.fcp)}ms\n`;
    if (metrics.lcp) metricsText += `LCP: ${Math.round(metrics.lcp)}ms\n`;
    if (metrics.cls) metricsText += `CLS: ${metrics.cls.toFixed(3)}\n`;

    if (metricsText) {
      embed.fields.push({
        name: 'Core Web Vitals',
        value: metricsText,
        inline: true,
      });
    }
  }

  const payload = {
    username: 'doha.kr 모니터링',
    embeds: [embed],
  };

  // Critical 알림에는 역할 멘션 추가
  if (isCritical) {
    payload.content = '@here Critical 알림이 발생했습니다!';
  }

  try {
    const response = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('Discord alert sent successfully');
      return { success: true, channel: 'discord' };
    } else {
      throw new Error(`Discord API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Discord alert failed:', error);
    return { success: false, error: error.message };
  }
}

// 이메일 알림 전송 (Critical 전용)
async function sendEmailAlert(alertData) {
  const { alert, priority } = alertData;

  // Critical 알림만 이메일 전송
  if (priority !== 'critical') {
    return null;
  }

  const emailData = {
    to: process.env.ADMIN_EMAIL || 'admin@doha.kr',
    subject: `🚨 [CRITICAL] ${alert.korean.title}`,

    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🚨 Critical Alert</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">${alert.korean.title}</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">알림 상세정보</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; width: 120px;">발생시간</td>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${new Date(alert.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">타입</td>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${alert.type}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold;">심각도</td>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="color: #dc3545; font-weight: bold;">${alert.korean.severity}</span></td>
            </tr>
          </table>
          
          <div style="background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #dc3545; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #dc3545;">문제 상황</h3>
            <p style="margin-bottom: 0; line-height: 1.6;">${alert.korean.message}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #007bff;">
            <h3 style="margin-top: 0; color: #007bff;">필요한 조치</h3>
            <p style="margin-bottom: 0; line-height: 1.6;">${alert.korean.action}</p>
          </div>
          
          ${
            alert.data?.score
              ? `
          <div style="background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #28a745; margin-top: 20px;">
            <h3 style="margin-top: 0; color: #28a745;">성능 데이터</h3>
            <p><strong>성능 점수:</strong> ${alert.data.score}점</p>
            ${
              alert.data.metrics
                ? `
              <p><strong>Core Web Vitals:</strong></p>
              <ul>
                ${alert.data.metrics.fcp ? `<li>FCP: ${Math.round(alert.data.metrics.fcp)}ms</li>` : ''}
                ${alert.data.metrics.lcp ? `<li>LCP: ${Math.round(alert.data.metrics.lcp)}ms</li>` : ''}
                ${alert.data.metrics.cls ? `<li>CLS: ${alert.data.metrics.cls.toFixed(3)}</li>` : ''}
              </ul>
            `
                : ''
            }
          </div>
          `
              : ''
          }
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://doha.kr/monitoring" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">모니터링 대시보드 확인</a>
          </div>
        </div>
        
        <div style="background: #6c757d; color: white; padding: 15px; text-align: center; font-size: 12px;">
          이 알림은 doha.kr 자동 모니터링 시스템에서 발송되었습니다.
        </div>
      </div>
    `,

    text: `
🚨 Critical Alert: ${alert.korean.title}

발생시간: ${new Date(alert.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
타입: ${alert.type}
심각도: ${alert.korean.severity}

문제 상황:
${alert.korean.message}

필요한 조치:
${alert.korean.action}

${alert.data?.score ? `성능 점수: ${alert.data.score}점` : ''}

모니터링 대시보드: https://doha.kr/monitoring
    `,
  };

  try {
    // 이메일 발송 서비스 호출 (예: SendGrid, Nodemailer 등)
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });

    if (response.ok) {
      console.log('Email alert sent successfully');
      return { success: true, channel: 'email' };
    } else {
      throw new Error(`Email API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Email alert failed:', error);
    return { success: false, error: error.message };
  }
}

// SMS 알림 전송 (Critical 전용)
async function sendSMSAlert(alertData) {
  const { alert, priority } = alertData;

  // Critical 알림만 SMS 전송
  if (priority !== 'critical') {
    return null;
  }

  const phoneNumber = process.env.ADMIN_PHONE;
  if (!phoneNumber) {
    console.warn('Admin phone number not configured');
    return null;
  }

  const message = `🚨 doha.kr Critical Alert
${alert.korean.title}
시간: ${new Date(alert.timestamp).toLocaleTimeString('ko-KR')}
${alert.korean.action}
상세: https://doha.kr/monitoring`;

  try {
    // SMS 발송 서비스 호출 (예: Twilio, AWS SNS 등)
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phoneNumber,
        message: message,
      }),
    });

    if (response.ok) {
      console.log('SMS alert sent successfully');
      return { success: true, channel: 'sms' };
    } else {
      throw new Error(`SMS API error: ${response.status}`);
    }
  } catch (error) {
    console.error('SMS alert failed:', error);
    return { success: false, error: error.message };
  }
}

// 알림 로깅
async function logAlert(alertData, results) {
  const logEntry = {
    timestamp: Date.now(),
    alert: alertData.alert,
    priority: alertData.priority,
    isCritical: isCriticalAlert(alertData),
    channels: results.filter((r) => r && r.success).map((r) => r.channel),
    failures: results
      .filter((r) => r && !r.success)
      .map((r) => ({ channel: r.channel, error: r.error })),
    korean: {
      timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      summary: `${alertData.alert.korean.title} 알림 전송`,
      status: results.some((r) => r && r.success) ? '성공' : '실패',
    },
  };

  try {
    // 로그 저장
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'alert_webhook',
        data: logEntry,
      }),
    });
  } catch (error) {
    console.error('Failed to log alert:', error);
  }

  return logEntry;
}

export default async function handler(req, res) {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', 'https://doha.kr');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: '허용되지 않는 메서드',
      korean: 'POST 요청만 지원됩니다',
    });
  }

  // 레이트 리미팅
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({
      error: '요청 한도 초과',
      korean: '분당 알림 요청 한도를 초과했습니다',
    });
  }

  try {
    const alertData = req.body;

    // 데이터 검증
    validateAlertData(alertData);

    // Critical 여부 판단
    const isCritical = isCriticalAlert(alertData);
    const priority = isCritical ? 'critical' : alertData.priority || 'medium';

    console.log(`Processing ${priority} alert: ${alertData.alert.type}`);

    // 알림 전송 (병렬 처리)
    const alertPromises = [
      sendSlackAlert({ ...alertData, priority }),
      sendDiscordAlert({ ...alertData, priority }),
    ];

    // Critical 알림은 추가 채널 사용
    if (isCritical) {
      alertPromises.push(
        sendEmailAlert({ ...alertData, priority }),
        sendSMSAlert({ ...alertData, priority })
      );
    }

    const results = await Promise.allSettled(alertPromises);
    const processedResults = results.map((result) =>
      result.status === 'fulfilled'
        ? result.value
        : { success: false, error: result.reason?.message }
    );

    // 성공한 채널 수 계산
    const successfulChannels = processedResults.filter((r) => r && r.success).length;
    const totalChannels = processedResults.filter((r) => r !== null).length;

    // 알림 로깅
    const logEntry = await logAlert({ ...alertData, priority }, processedResults);

    return res.status(200).json({
      success: true,
      critical: isCritical,
      priority: priority,
      channels: {
        attempted: totalChannels,
        successful: successfulChannels,
        results: processedResults.filter((r) => r !== null),
      },
      korean: {
        message: `${successfulChannels}/${totalChannels} 채널로 알림 전송 완료`,
        priority: priority === 'critical' ? 'Critical' : '일반',
        status: successfulChannels > 0 ? '성공' : '실패',
      },
      logId: logEntry.timestamp,
    });
  } catch (error) {
    console.error('Alert webhook error:', error);

    return res.status(500).json({
      error: '서버 오류',
      message: error.message,
      korean: {
        message: '알림 전송 중 오류가 발생했습니다',
        details: '시스템 관리자에게 문의하세요',
      },
    });
  }
}

// 테스트용 알림 전송 함수
export async function sendTestAlert() {
  const testAlert = {
    alert: {
      type: 'test_alert',
      timestamp: Date.now(),
      data: { score: 45 },
      korean: {
        title: '테스트 알림',
        message: '알림 시스템 테스트입니다',
        severity: 'Critical',
        action: '이것은 테스트 알림이므로 조치가 필요하지 않습니다',
      },
    },
    priority: 'critical',
    timestamp: Date.now(),
  };

  try {
    const response = await fetch('/api/alert-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testAlert),
    });

    return await response.json();
  } catch (error) {
    console.error('Test alert failed:', error);
    throw error;
  }
}
