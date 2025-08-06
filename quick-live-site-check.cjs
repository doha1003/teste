/**
 * doha.kr 라이브 사이트 빠른 체크
 * 주요 페이지들의 기본적인 문제점만 신속하게 확인
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 우선순위 높은 페이지들
const PRIORITY_PAGES = [
  { url: 'https://doha.kr/', name: 'home', title: '홈페이지' },
  { url: 'https://doha.kr/tests/', name: 'tests-index', title: '심리테스트 목록' },
  { url: 'https://doha.kr/tests/mbti/', name: 'mbti-intro', title: 'MBTI 테스트 소개' },
  { url: 'https://doha.kr/fortune/', name: 'fortune-index', title: 'AI 운세 목록' },
  { url: 'https://doha.kr/tools/', name: 'tools-index', title: '실용도구 목록' },
  { url: 'https://doha.kr/tools/text-counter.html', name: 'text-counter', title: '글자수 세기' }
];

class QuickLiveSiteChecker {
  constructor() {
    this.results = [];
    this.setupDirectories();
  }

  setupDirectories() {
    const reportDir = path.join(__dirname, 'quick-check-report');
    const screenshotsDir = path.join(reportDir, 'screenshots');
    
    [reportDir, screenshotsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    this.reportDir = reportDir;
    this.screenshotsDir = screenshotsDir;
  }

  async checkSite() {
    console.log('🚀 doha.kr 라이브 사이트 빠른 체크 시작...');
    
    const browser = await chromium.launch({ headless: false });
    
    try {
      for (const page of PRIORITY_PAGES) {
        console.log(`🔍 체크 중: ${page.title}`);
        await this.checkPage(browser, page);
        
        // 페이지 간 딜레이
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } finally {
      await browser.close();
    }

    this.generateQuickReport();
    console.log(`\n✅ 빠른 체크 완료! 결과는 ${this.reportDir} 폴더에서 확인하세요.`);
  }

  async checkPage(browser, pageInfo) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // 짧은 타임아웃으로 빠르게 체크
      await page.goto(pageInfo.url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 10000 
      });

      // 잠시 기다려서 페이지 로딩 완료
      await page.waitForTimeout(2000);

      // 데스크톱 스크린샷
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(this.screenshotsDir, `${pageInfo.name}-desktop.png`),
        fullPage: false // 뷰포트만 캡처하여 속도 향상
      });

      // 모바일 스크린샷
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(this.screenshotsDir, `${pageInfo.name}-mobile.png`),
        fullPage: false
      });

      // 기본적인 페이지 정보 수집
      const pageData = await page.evaluate(() => {
        const issues = [];
        
        // 1. 기본 SEO 체크
        if (!document.title) issues.push('페이지 제목이 없습니다.');
        if (!document.querySelector('meta[name="description"]')) {
          issues.push('meta description이 없습니다.');
        }
        
        // 2. H1 체크
        const h1s = document.querySelectorAll('h1');
        if (h1s.length === 0) issues.push('H1 태그가 없습니다.');
        if (h1s.length > 1) issues.push('H1 태그가 여러 개 있습니다.');
        
        // 3. 이미지 alt 체크
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
        if (imagesWithoutAlt.length > 0) {
          issues.push(`${imagesWithoutAlt.length}개 이미지에 alt 텍스트가 없습니다.`);
        }
        
        // 4. 링크 체크
        const emptyLinks = document.querySelectorAll('a:not([href]), a[href=""], a[href="#"]');
        if (emptyLinks.length > 0) {
          issues.push(`${emptyLinks.length}개의 빈 링크가 있습니다.`);
        }
        
        // 5. 기본적인 레이아웃 문제 체크
        const bodyWidth = document.body.scrollWidth;
        const viewportWidth = window.innerWidth;
        if (bodyWidth > viewportWidth * 1.1) {
          issues.push('수평 스크롤이 발생할 수 있습니다.');
        }
        
        // 6. 폰트 로딩 체크
        if (!document.fonts || document.fonts.status !== 'loaded') {
          issues.push('폰트 로딩이 완료되지 않았습니다.');
        }
        
        // 7. 에러 메시지 체크
        const errorElements = document.querySelectorAll('.error, .alert-danger, [class*="error"]');
        if (errorElements.length > 0) {
          issues.push('페이지에 에러 메시지가 표시되고 있습니다.');
        }

        return {
          title: document.title,
          url: window.location.href,
          issues: issues,
          h1Count: h1s.length,
          h1Text: h1s[0]?.textContent || '',
          imageCount: document.querySelectorAll('img').length,
          linkCount: document.querySelectorAll('a[href]').length,
          buttonCount: document.querySelectorAll('button, .btn').length,
          hasServiceWorker: 'serviceWorker' in navigator,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          bodySize: {
            width: document.body.scrollWidth,
            height: document.body.scrollHeight
          }
        };
      });

      // Console 에러 체크
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // 네트워크 에러 체크
      const networkErrors = [];
      page.on('response', response => {
        if (response.status() >= 400) {
          networkErrors.push({
            url: response.url(),
            status: response.status()
          });
        }
      });

      this.results.push({
        ...pageInfo,
        pageData,
        consoleErrors: consoleErrors.slice(0, 5), // 최대 5개만
        networkErrors: networkErrors.slice(0, 5),
        timestamp: new Date().toISOString(),
        status: pageData.issues.length === 0 ? 'good' : 'needs-attention'
      });

      console.log(`   - 발견된 문제: ${pageData.issues.length}개`);
      if (pageData.issues.length > 0) {
        pageData.issues.forEach(issue => console.log(`     • ${issue}`));
      }

    } catch (error) {
      console.error(`❌ ${pageInfo.title} 체크 실패:`, error.message);
      this.results.push({
        ...pageInfo,
        error: error.message,
        status: 'error'
      });
    } finally {
      await context.close();
    }
  }

  generateQuickReport() {
    const summary = {
      totalPages: PRIORITY_PAGES.length,
      checkedPages: this.results.length,
      goodPages: this.results.filter(r => r.status === 'good').length,
      problemPages: this.results.filter(r => r.status === 'needs-attention').length,
      errorPages: this.results.filter(r => r.status === 'error').length,
      totalIssues: this.results.reduce((sum, r) => sum + (r.pageData?.issues?.length || 0), 0)
    };

    const htmlReport = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>doha.kr 빠른 체크 보고서</title>
    <style>
        body { font-family: 'Pretendard', -apple-system, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #5c5ce0; padding-bottom: 15px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { padding: 15px; border-radius: 8px; text-align: center; color: white; }
        .stat-card.good { background: linear-gradient(135deg, #28a745, #20c997); }
        .stat-card.warning { background: linear-gradient(135deg, #fd7e14, #e83e8c); }
        .stat-card.error { background: linear-gradient(135deg, #dc3545, #6f42c1); }
        .stat-card.info { background: linear-gradient(135deg, #007bff, #6610f2); }
        .stat-number { font-size: 2rem; font-weight: bold; }
        .stat-label { font-size: 0.9rem; margin-top: 5px; }
        .page-result { border: 1px solid #ddd; border-radius: 8px; margin: 15px 0; overflow: hidden; }
        .page-header { padding: 15px; background: #f8f9fa; border-bottom: 1px solid #ddd; }
        .page-header.good { background: #d4edda; border-bottom-color: #c3e6cb; }
        .page-header.warning { background: #fff3cd; border-bottom-color: #ffeaa7; }
        .page-header.error { background: #f8d7da; border-bottom-color: #f5c6cb; }
        .page-title { margin: 0; font-weight: bold; }
        .page-url { color: #666; font-size: 0.9rem; margin: 5px 0 0 0; }
        .page-content { padding: 15px; }
        .issues-list { margin: 10px 0; }
        .issue { margin: 5px 0; padding: 8px 12px; background: #fff5f5; border-left: 4px solid #dc3545; border-radius: 4px; }
        .page-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0; }
        .info-item { background: #f8f9fa; padding: 10px; border-radius: 6px; }
        .info-label { font-weight: bold; color: #555; font-size: 0.9rem; }
        .info-value { color: #333; }
        .screenshots { margin: 15px 0; }
        .screenshot-link { display: inline-block; margin: 5px 10px 5px 0; padding: 8px 16px; background: #5c5ce0; color: white; text-decoration: none; border-radius: 6px; font-size: 0.9rem; }
        .status-good { color: #28a745; font-weight: bold; }
        .status-warning { color: #fd7e14; font-weight: bold; }
        .status-error { color: #dc3545; font-weight: bold; }
        .timestamp { text-align: center; color: #666; margin-top: 30px; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 doha.kr 라이브 사이트 빠른 체크 보고서</h1>
        
        <div class="summary">
            <div class="stat-card good">
                <div class="stat-number">${summary.goodPages}</div>
                <div class="stat-label">정상 페이지</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-number">${summary.problemPages}</div>
                <div class="stat-label">주의 필요</div>
            </div>
            <div class="stat-card error">
                <div class="stat-number">${summary.errorPages}</div>
                <div class="stat-label">오류 페이지</div>
            </div>
            <div class="stat-card info">
                <div class="stat-number">${summary.totalIssues}</div>
                <div class="stat-label">총 발견 문제</div>
            </div>
        </div>

        <h2>📋 페이지별 체크 결과</h2>
        ${this.results.map(result => `
            <div class="page-result">
                <div class="page-header ${result.status}">
                    <h3 class="page-title">
                        ${result.title} 
                        <span class="status-${result.status}">
                            ${result.status === 'good' ? '✓ 정상' : 
                              result.status === 'needs-attention' ? '⚠ 주의' : '❌ 오류'}
                        </span>
                    </h3>
                    <p class="page-url">${result.url}</p>
                </div>
                
                <div class="page-content">
                    <div class="screenshots">
                        <a href="screenshots/${result.name}-desktop.png" class="screenshot-link" target="_blank">🖥️ 데스크톱</a>
                        <a href="screenshots/${result.name}-mobile.png" class="screenshot-link" target="_blank">📱 모바일</a>
                    </div>
                    
                    ${result.pageData ? `
                        <div class="page-info">
                            <div class="info-item">
                                <div class="info-label">H1 제목</div>
                                <div class="info-value">${result.pageData.h1Text || '없음'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">이미지</div>
                                <div class="info-value">${result.pageData.imageCount}개</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">링크</div>
                                <div class="info-value">${result.pageData.linkCount}개</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">버튼</div>
                                <div class="info-value">${result.pageData.buttonCount}개</div>
                            </div>
                        </div>
                        
                        ${result.pageData.issues.length > 0 ? `
                            <div class="issues-list">
                                <strong>발견된 문제점:</strong>
                                ${result.pageData.issues.map(issue => `<div class="issue">${issue}</div>`).join('')}
                            </div>
                        ` : '<div style="color: #28a745; font-weight: bold;">✅ 발견된 문제점 없음</div>'}
                    ` : `<div class="issue">페이지 로딩 실패: ${result.error}</div>`}
                </div>
            </div>
        `).join('')}

        <div class="timestamp">
            보고서 생성 시간: ${new Date().toLocaleString('ko-KR')}
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(this.reportDir, 'quick-check-report.html'), htmlReport);
    
    console.log('\n📊 빠른 체크 결과 요약:');
    console.log(`✅ 정상 페이지: ${summary.goodPages}개`);
    console.log(`⚠️  주의 필요: ${summary.problemPages}개`);
    console.log(`❌ 오류 페이지: ${summary.errorPages}개`);
    console.log(`🔍 총 발견된 문제: ${summary.totalIssues}개`);
  }
}

async function main() {
  const checker = new QuickLiveSiteChecker();
  await checker.checkSite();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = QuickLiveSiteChecker;