/**
 * 🔧 GitHub Issues 자동 생성 API
 * 성능 알림과 에러를 GitHub Issues로 자동 생성
 */

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'doha-kr/doha.kr';

const MAX_REQUESTS_PER_HOUR = 100;
const requestCounts = new Map();

// 레이트 리미팅
function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - 3600000; // 1시간 전

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const requests = requestCounts.get(ip);
  const recentRequests = requests.filter((time) => time > windowStart);
  requestCounts.set(ip, recentRequests);

  if (recentRequests.length >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }

  recentRequests.push(now);
  return true;
}

// GitHub API 요청
async function githubRequest(endpoint, method = 'GET', data = null) {
  const url = `${GITHUB_API_BASE}${endpoint}`;

  const options = {
    method,
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'doha-kr-monitoring',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`GitHub API error: ${response.status} - ${error.message || 'Unknown error'}`);
  }

  return response.json();
}

// 이슈 중복 확인
async function checkDuplicateIssue(title, labels) {
  try {
    // 최근 7일간의 open 이슈 검색
    const query = `repo:${GITHUB_REPO} is:issue is:open created:>=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`;

    const searchResponse = await githubRequest(`/search/issues?q=${encodeURIComponent(query)}`);

    // 제목이나 라벨이 유사한 이슈 찾기
    const similarIssues = searchResponse.items.filter((issue) => {
      const titleSimilarity = calculateSimilarity(issue.title, title);
      const labelOverlap = issue.labels.some((issueLabel) => labels.includes(issueLabel.name));

      return titleSimilarity > 0.7 || labelOverlap;
    });

    return similarIssues.length > 0 ? similarIssues[0] : null;
  } catch (error) {
    console.error('Failed to check duplicate issues:', error);
    return null;
  }
}

// 문자열 유사도 계산 (Levenshtein distance 기반)
function calculateSimilarity(str1, str2) {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : (maxLen - matrix[len2][len1]) / maxLen;
}

// 이슈 생성
async function createIssue(issueData) {
  const { title, body, labels, priority } = issueData;

  // 중복 이슈 확인
  const duplicate = await checkDuplicateIssue(title, labels);
  if (duplicate) {
    return {
      success: true,
      duplicate: true,
      issueUrl: duplicate.html_url,
      issueNumber: duplicate.number,
      message: '유사한 이슈가 이미 존재합니다',
    };
  }

  // assignees 설정 (priority에 따라)
  const assignees = priority === 'critical' ? ['doha-kr-admin'] : [];

  // milestone 설정
  let milestone = null;
  if (priority === 'critical') {
    milestone = await findOrCreateMilestone('Critical Issues');
  }

  const payload = {
    title,
    body,
    labels,
    assignees,
  };

  if (milestone) {
    payload.milestone = milestone.number;
  }

  const issue = await githubRequest(`/repos/${GITHUB_REPO}/issues`, 'POST', payload);

  // Critical 이슈는 즉시 알림 추가
  if (priority === 'critical') {
    await addCriticalComment(issue.number);
  }

  return {
    success: true,
    duplicate: false,
    issueUrl: issue.html_url,
    issueNumber: issue.number,
    message: '새 이슈가 생성되었습니다',
  };
}

// Milestone 찾기 또는 생성
async function findOrCreateMilestone(title) {
  try {
    // 기존 milestone 검색
    const milestones = await githubRequest(`/repos/${GITHUB_REPO}/milestones`);
    const existing = milestones.find((m) => m.title === title);

    if (existing) {
      return existing;
    }

    // 새 milestone 생성
    const milestone = await githubRequest(`/repos/${GITHUB_REPO}/milestones`, 'POST', {
      title,
      description: '자동 생성된 Critical Issues 마일스톤',
      due_on: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후
    });

    return milestone;
  } catch (error) {
    console.error('Milestone operation failed:', error);
    return null;
  }
}

// Critical 이슈에 긴급 코멘트 추가
async function addCriticalComment(issueNumber) {
  try {
    const comment = `🚨 **Critical Issue Alert**

이 이슈는 Critical 우선순위로 분류되었습니다.

**즉시 조치 사항:**
1. 성능 영향도 분석
2. 원인 파악 및 수정
3. 모니터링 강화

**담당자:** @doha-kr-admin
**예상 해결 시간:** 24시간 이내

---
*자동 생성된 Critical 알림입니다.*`;

    await githubRequest(`/repos/${GITHUB_REPO}/issues/${issueNumber}/comments`, 'POST', {
      body: comment,
    });
  } catch (error) {
    console.error('Failed to add critical comment:', error);
  }
}

// 이슈 업데이트 (해결 시)
async function updateIssue(issueNumber, updateData) {
  const { state, labels, resolution } = updateData;

  const payload = {};

  if (state) {
    payload.state = state; // 'open' or 'closed'
  }

  if (labels) {
    payload.labels = labels;
  }

  const issue = await githubRequest(
    `/repos/${GITHUB_REPO}/issues/${issueNumber}`,
    'PATCH',
    payload
  );

  // 해결 시 해결 사항 코멘트 추가
  if (state === 'closed' && resolution) {
    await githubRequest(`/repos/${GITHUB_REPO}/issues/${issueNumber}/comments`, 'POST', {
      body: `## ✅ 이슈 해결

**해결 방법:**
${resolution}

**해결 시간:** ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}

---
*자동으로 이슈가 닫혔습니다.*`,
    });
  }

  return issue;
}

// 이슈 통계 조회
async function getIssueStats() {
  try {
    const [openIssues, closedIssues] = await Promise.all([
      githubRequest(`/repos/${GITHUB_REPO}/issues?state=open&labels=performance`),
      githubRequest(
        `/repos/${GITHUB_REPO}/issues?state=closed&labels=performance&since=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}`
      ),
    ]);

    const criticalOpen = openIssues.filter((issue) =>
      issue.labels.some((label) => label.name === 'critical')
    );

    return {
      open: openIssues.length,
      closed: closedIssues.length,
      critical: criticalOpen.length,
      recentResolutions: closedIssues.slice(0, 5).map((issue) => ({
        number: issue.number,
        title: issue.title,
        closedAt: issue.closed_at,
      })),
    };
  } catch (error) {
    console.error('Failed to get issue stats:', error);
    return null;
  }
}

export default async function handler(req, res) {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', 'https://doha.kr');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 인증 확인
  if (!GITHUB_TOKEN) {
    return res.status(500).json({
      error: '서버 설정 오류',
      korean: 'GitHub 토큰이 설정되지 않았습니다',
    });
  }

  // 레이트 리미팅
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({
      error: '요청 한도 초과',
      korean: '시간당 GitHub API 요청 한도를 초과했습니다',
    });
  }

  try {
    if (req.method === 'POST') {
      const issueData = req.body;

      // 데이터 검증
      if (!issueData.title || !issueData.body) {
        return res.status(400).json({
          error: '잘못된 요청',
          korean: 'title과 body가 필요합니다',
        });
      }

      const result = await createIssue(issueData);

      return res.status(200).json({
        success: true,
        data: result,
        korean: {
          message: result.duplicate ? '유사한 이슈가 존재합니다' : '새 이슈가 생성되었습니다',
          issueNumber: result.issueNumber,
        },
      });
    }

    if (req.method === 'PATCH') {
      const { issueNumber } = req.query;
      const updateData = req.body;

      if (!issueNumber) {
        return res.status(400).json({
          error: '잘못된 요청',
          korean: 'issueNumber가 필요합니다',
        });
      }

      const result = await updateIssue(parseInt(issueNumber), updateData);

      return res.status(200).json({
        success: true,
        data: result,
        korean: {
          message: '이슈가 업데이트되었습니다',
        },
      });
    }

    if (req.method === 'GET') {
      const { stats } = req.query;

      if (stats === 'true') {
        const statsData = await getIssueStats();

        res.setHeader('Cache-Control', 'public, max-age=300'); // 5분 캐시
        return res.status(200).json({
          success: true,
          data: statsData,
          korean: {
            message: '이슈 통계 데이터',
            summary: statsData
              ? `열린 이슈: ${statsData.open}개, Critical: ${statsData.critical}개`
              : '데이터 없음',
          },
        });
      }

      return res.status(400).json({
        error: '잘못된 요청',
        korean: '지원되지 않는 GET 요청입니다',
      });
    }

    return res.status(405).json({
      error: '허용되지 않는 메서드',
      korean: 'POST, PATCH, GET 요청만 지원됩니다',
    });
  } catch (error) {
    console.error('GitHub Issue API error:', error);

    return res.status(500).json({
      error: '서버 오류',
      message: error.message,
      korean: {
        message: 'GitHub 이슈 처리 중 오류가 발생했습니다',
        details: error.message.includes('rate limit')
          ? 'GitHub API 요청 한도 초과'
          : '일시적인 오류입니다',
      },
    });
  }
}

// 수동 이슈 생성 함수 (외부에서 사용 가능)
export async function createPerformanceIssue(performanceData) {
  const { score, metrics, url } = performanceData;

  const title = `[PERFORMANCE] Lighthouse 점수 ${score}점 - 성능 개선 필요`;

  let body = `## 📊 성능 이슈 보고\n\n`;
  body += `**URL**: ${url}\n`;
  body += `**Lighthouse 점수**: ${score}점\n`;
  body += `**측정 시간**: ${new Date().toLocaleString('ko-KR')}\n\n`;

  body += `### 📈 Core Web Vitals\n`;
  if (metrics.fcp) body += `- **FCP**: ${Math.round(metrics.fcp)}ms\n`;
  if (metrics.lcp) body += `- **LCP**: ${Math.round(metrics.lcp)}ms\n`;
  if (metrics.cls) body += `- **CLS**: ${metrics.cls.toFixed(3)}\n`;
  if (metrics.fid) body += `- **FID**: ${Math.round(metrics.fid)}ms\n`;

  body += `\n### 🎯 개선 목표\n`;
  body += `- Lighthouse 점수 85점 이상 달성\n`;
  body += `- Core Web Vitals 모든 지표 Good 등급 달성\n\n`;

  body += `### 🔧 권장 개선사항\n`;
  if (metrics.fcp && metrics.fcp > 2000) {
    body += `- First Contentful Paint 개선 (현재: ${Math.round(metrics.fcp)}ms)\n`;
  }
  if (metrics.lcp && metrics.lcp > 2500) {
    body += `- Largest Contentful Paint 개선 (현재: ${Math.round(metrics.lcp)}ms)\n`;
  }
  if (metrics.cls && metrics.cls > 0.1) {
    body += `- Cumulative Layout Shift 개선 (현재: ${metrics.cls.toFixed(3)})\n`;
  }

  body += `\n---\n*자동 생성된 성능 이슈입니다.*`;

  const labels = ['performance', 'lighthouse'];
  if (score < 50) labels.push('critical');

  return await createIssue({
    title,
    body,
    labels,
    priority: score < 50 ? 'critical' : 'normal',
  });
}
