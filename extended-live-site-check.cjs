/**
 * doha.kr 라이브 사이트 확장 체크
 * 더 많은 페이지들을 체크하여 종합적인 문제점 파악
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 전체 26개 페이지 (우선순위별 정렬)
const ALL_PAGES = [
  // 높은 우선순위 (핵심 페이지)
  { url: 'https://doha.kr/', name: 'home', title: '홈페이지', priority: 'high' },
  { url: 'https://doha.kr/tests/', name: 'tests-index', title: '심리테스트 목록', priority: 'high' },
  { url: 'https://doha.kr/fortune/', name: 'fortune-index', title: 'AI 운세 목록', priority: 'high' },
  { url: 'https://doha.kr/tools/', name: 'tools-index', title: '실용도구 목록', priority: 'high' },
  
  // 중간 우선순위 (주요 서비스 페이지)
  { url: 'https://doha.kr/tests/mbti/', name: 'mbti-intro', title: 'MBTI 테스트 소개', priority: 'medium' },
  { url: 'https://doha.kr/tests/teto-egen/', name: 'teto-egen-intro', title: '테토-에겐 테스트 소개', priority: 'medium' },
  { url: 'https://doha.kr/tests/love-dna/', name: 'love-dna-intro', title: '러브 DNA 테스트 소개', priority: 'medium' },
  { url: 'https://doha.kr/fortune/daily/', name: 'daily-fortune', title: '오늘의 운세', priority: 'medium' },
  { url: 'https://doha.kr/fortune/saju/', name: 'saju-fortune', title: 'AI 사주팔자', priority: 'medium' },
  { url: 'https://doha.kr/tools/text-counter.html', name: 'text-counter', title: '글자수 세기', priority: 'medium' },
  { url: 'https://doha.kr/tools/salary-calculator.html', name: 'salary-calculator', title: '연봉 계산기', priority: 'medium' },
  
  // 낮은 우선순위 (부가 기능 및 정보 페이지)
  { url: 'https://doha.kr/fortune/zodiac/', name: 'zodiac-fortune', title: '별자리 운세', priority: 'low' },
  { url: 'https://doha.kr/fortune/zodiac-animal/', name: 'zodiac-animal-fortune', title: '띠별 운세', priority: 'low' },
  { url: 'https://doha.kr/fortune/tarot/', name: 'tarot-fortune', title: 'AI 타로 리딩', priority: 'low' },
  { url: 'https://doha.kr/tools/bmi-calculator.html', name: 'bmi-calculator', title: 'BMI 계산기', priority: 'low' },
  { url: 'https://doha.kr/tests/mbti/test.html', name: 'mbti-test', title: 'MBTI 테스트', priority: 'low' },
  { url: 'https://doha.kr/tests/teto-egen/test.html', name: 'teto-egen-test', title: '테토-에겐 테스트', priority: 'low' },
  { url: 'https://doha.kr/tests/love-dna/test.html', name: 'love-dna-test', title: '러브 DNA 테스트', priority: 'low' },
  { url: 'https://doha.kr/about/', name: 'about', title: '사이트 소개', priority: 'low' },
  { url: 'https://doha.kr/contact/', name: 'contact', title: '문의하기', priority: 'low' },
  { url: 'https://doha.kr/faq/', name: 'faq', title: '자주 묻는 질문', priority: 'low' },
  { url: 'https://doha.kr/privacy/', name: 'privacy', title: '개인정보처리방침', priority: 'low' },
  { url: 'https://doha.kr/terms/', name: 'terms', title: '이용약관', priority: 'low' },
  { url: 'https://doha.kr/404.html', name: '404', title: '404 오류 페이지', priority: 'low' },
  { url: 'https://doha.kr/offline.html', name: 'offline', title: '오프라인 페이지', priority: 'low' },
  { url: 'https://doha.kr/result-detail.html', name: 'result-detail', title: '결과 상세 페이지', priority: 'low' }
];

class ExtendedLiveSiteChecker {
  constructor() {
    this.results = [];
    this.setupDirectories();
  }

  setupDirectories() {
    const reportDir = path.join(__dirname, 'extended-check-report');
    const screenshotsDir = path.join(reportDir, 'screenshots');
    
    [reportDir, screenshotsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    this.reportDir = reportDir;
    this.screenshotsDir = screenshotsDir;
  }

  async checkAllPages() {
    console.log('🚀 doha.kr 라이브 사이트 확장 체크 시작...');
    console.log(`📋 총 ${ALL_PAGES.length}개 페이지 검사 예정\n`);
    
    const browser = await chromium.launch({ 
      headless: true, // 빠른 처리를 위해 헤드리스 모드
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    try {
      // 우선순위별로 그룹화하여 처리
      const priorityGroups = {
        high: ALL_PAGES.filter(p => p.priority === 'high'),
        medium: ALL_PAGES.filter(p => p.priority === 'medium'),
        low: ALL_PAGES.filter(p => p.priority === 'low')
      };

      for (const [priority, pages] of Object.entries(priorityGroups)) {
        console.log(`\n🎯 ${priority.toUpperCase()} 우선순위 페이지 체크 중...`);
        
        for (const page of pages) {
          console.log(`🔍 체크 중: ${page.title}`);
          await this.checkPage(browser, page);
          
          // 서버 부하 방지를 위한 딜레이
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } finally {
      await browser.close();
    }

    this.analyzeResults();
    this.generateDetailedReport();
    console.log(`\n✅ 확장 체크 완료! 결과는 ${this.reportDir} 폴더에서 확인하세요.`);
  }

  async checkPage(browser, pageInfo) {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    try {
      // 네트워크 및 콘솔 로그 모니터링
      const networkErrors = [];
      const consoleErrors = [];
      
      page.on('response', response => {
        if (response.status() >= 400) {
          networkErrors.push({
            url: response.url(),
            status: response.status(),
            statusText: response.statusText()
          });
        }
      });

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // 페이지 로드
      await page.goto(pageInfo.url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 15000 
      });

      // 페이지 로딩 완료 대기
      await page.waitForTimeout(3000);

      // 데스크톱 뷰 스크린샷
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(this.screenshotsDir, `${pageInfo.name}-desktop.png`),
        fullPage: true
      });

      // 모바일 뷰 스크린샷
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(this.screenshotsDir, `${pageInfo.name}-mobile.png`),
        fullPage: true
      });

      // 상세한 페이지 분석
      const pageAnalysis = await this.performDetailedAnalysis(page);

      this.results.push({
        ...pageInfo,
        analysis: pageAnalysis,
        networkErrors: networkErrors.slice(0, 5),
        consoleErrors: consoleErrors.slice(0, 5),
        timestamp: new Date().toISOString(),
        status: this.calculatePageStatus(pageAnalysis, networkErrors, consoleErrors)
      });

      const issueCount = pageAnalysis.issues.length + networkErrors.length + consoleErrors.length;
      console.log(`   - 총 발견된 문제: ${issueCount}개`);

    } catch (error) {
      console.error(`❌ ${pageInfo.title} 체크 실패:`, error.message);
      this.results.push({
        ...pageInfo,
        error: error.message,
        status: 'error',
        timestamp: new Date().toISOString()
      });
    } finally {
      await context.close();
    }
  }

  async performDetailedAnalysis(page) {
    return await page.evaluate(() => {
      const analysis = {
        seo: {},
        accessibility: {},
        performance: {},
        design: {},
        korean: {},
        issues: []
      };

      // SEO 분석
      analysis.seo = {
        title: document.title,
        titleLength: document.title.length,
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
        metaDescriptionLength: (document.querySelector('meta[name="description"]')?.content || '').length,
        h1Count: document.querySelectorAll('h1').length,
        h1Text: document.querySelector('h1')?.textContent || '',
        hasCanonical: !!document.querySelector('link[rel="canonical"]'),
        hasOgTags: !!document.querySelector('meta[property^="og:"]'),
        hasStructuredData: !!document.querySelector('script[type="application/ld+json"]')
      };

      // SEO 이슈 체크
      if (!analysis.seo.title) analysis.issues.push({ type: 'seo', severity: 'critical', message: '페이지 제목이 없습니다.' });
      if (analysis.seo.titleLength > 60) analysis.issues.push({ type: 'seo', severity: 'warning', message: '페이지 제목이 너무 깁니다 (60자 초과).' });
      if (!analysis.seo.metaDescription) analysis.issues.push({ type: 'seo', severity: 'major', message: 'meta description이 없습니다.' });
      if (analysis.seo.metaDescriptionLength > 160) analysis.issues.push({ type: 'seo', severity: 'warning', message: 'meta description이 너무 깁니다 (160자 초과).' });
      if (analysis.seo.h1Count === 0) analysis.issues.push({ type: 'seo', severity: 'major', message: 'H1 태그가 없습니다.' });
      if (analysis.seo.h1Count > 1) analysis.issues.push({ type: 'seo', severity: 'warning', message: 'H1 태그가 여러 개 있습니다.' });

      // 접근성 분석
      analysis.accessibility = {
        imagesWithoutAlt: document.querySelectorAll('img:not([alt])').length,
        emptyAltImages: document.querySelectorAll('img[alt=""]').length,
        linksWithoutText: document.querySelectorAll('a:not([aria-label]):empty').length,
        buttonsWithoutText: document.querySelectorAll('button:not([aria-label]):empty').length,
        inputsWithoutLabels: document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').length,
        headingStructure: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
          level: parseInt(h.tagName.substring(1)),
          text: h.textContent.substring(0, 50)
        })),
        hasSkipLink: !!document.querySelector('a[href="#main-content"], .skip-link'),
        colorContrastIssues: 0 // 간단한 체크만 수행
      };

      // 접근성 이슈 체크
      if (analysis.accessibility.imagesWithoutAlt > 0) {
        analysis.issues.push({ 
          type: 'accessibility', 
          severity: 'major', 
          message: `${analysis.accessibility.imagesWithoutAlt}개 이미지에 alt 텍스트가 없습니다.` 
        });
      }
      if (analysis.accessibility.inputsWithoutLabels > 0) {
        analysis.issues.push({ 
          type: 'accessibility', 
          severity: 'major', 
          message: `${analysis.accessibility.inputsWithoutLabels}개 입력 필드에 레이블이 없습니다.` 
        });
      }

      // 성능 분석
      analysis.performance = {
        imageCount: document.querySelectorAll('img').length,
        largeImages: document.querySelectorAll('img[width], img[height]').length,
        externalScripts: document.querySelectorAll('script[src^="http"]').length,
        inlineStyles: document.querySelectorAll('[style]').length,
        bodySize: {
          width: document.body.scrollWidth,
          height: document.body.scrollHeight
        },
        viewportSize: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };

      // 성능 이슈 체크
      if (analysis.performance.bodySize.width > analysis.performance.viewportSize.width * 1.1) {
        analysis.issues.push({ type: 'performance', severity: 'warning', message: '수평 스크롤이 발생할 수 있습니다.' });
      }
      if (analysis.performance.inlineStyles > 10) {
        analysis.issues.push({ type: 'performance', severity: 'minor', message: '인라인 스타일이 많습니다. CSS 파일 사용을 권장합니다.' });
      }

      // 디자인 분석
      analysis.design = {
        buttonCount: document.querySelectorAll('button, .btn, a[role="button"]').length,
        linkCount: document.querySelectorAll('a[href]').length,
        emptyLinks: document.querySelectorAll('a:not([href]), a[href=""], a[href="#"]').length,
        formsCount: document.querySelectorAll('form').length,
        hasServiceWorker: 'serviceWorker' in navigator,
        hasManifest: !!document.querySelector('link[rel="manifest"]'),
        themeColor: document.querySelector('meta[name="theme-color"]')?.content || ''
      };

      // 디자인 이슈 체크
      if (analysis.design.emptyLinks > 0) {
        analysis.issues.push({ 
          type: 'design', 
          severity: 'minor', 
          message: `${analysis.design.emptyLinks}개의 빈 링크가 있습니다.` 
        });
      }

      // 한글 최적화 분석
      analysis.korean = {
        hasKoreanText: /[가-힣]/.test(document.body.textContent),
        elementsWithWordBreak: document.querySelectorAll('[style*="word-break"]').length,
        koreanTextElements: Array.from(document.querySelectorAll('*')).filter(el => 
          /[가-힣]/.test(el.textContent) && el.children.length === 0
        ).length,
        fontFamily: window.getComputedStyle(document.body).fontFamily
      };

      // 한글 최적화 이슈 체크
      if (analysis.korean.hasKoreanText && !analysis.korean.fontFamily.includes('Pretendard')) {
        analysis.issues.push({ 
          type: 'korean', 
          severity: 'minor', 
          message: '한글 최적화 폰트(Pretendard) 사용을 권장합니다.' 
        });
      }

      return analysis;
    });
  }

  calculatePageStatus(analysis, networkErrors, consoleErrors) {
    const criticalIssues = analysis.issues.filter(issue => issue.severity === 'critical').length;
    const majorIssues = analysis.issues.filter(issue => issue.severity === 'major').length;
    const totalErrors = networkErrors.length + consoleErrors.length;

    if (criticalIssues > 0 || totalErrors > 0) return 'critical';
    if (majorIssues > 0) return 'major';
    if (analysis.issues.length > 0) return 'minor';
    return 'good';
  }

  analyzeResults() {
    const summary = {
      total: this.results.length,
      byStatus: {
        good: this.results.filter(r => r.status === 'good').length,
        minor: this.results.filter(r => r.status === 'minor').length,
        major: this.results.filter(r => r.status === 'major').length,
        critical: this.results.filter(r => r.status === 'critical').length,
        error: this.results.filter(r => r.status === 'error').length
      },
      byPriority: {
        high: this.results.filter(r => r.priority === 'high'),
        medium: this.results.filter(r => r.priority === 'medium'),
        low: this.results.filter(r => r.priority === 'low')
      },
      commonIssues: this.findCommonIssues(),
      totalIssues: this.results.reduce((sum, r) => sum + (r.analysis?.issues?.length || 0), 0)
    };

    this.summary = summary;

    console.log('\n📊 전체 검사 결과 요약:');
    console.log(`✅ 정상: ${summary.byStatus.good}개`);
    console.log(`⚠️  경고: ${summary.byStatus.minor}개`);
    console.log(`🚨 주요 문제: ${summary.byStatus.major}개`);
    console.log(`🔥 심각한 문제: ${summary.byStatus.critical}개`);
    console.log(`❌ 오류: ${summary.byStatus.error}개`);
    console.log(`🔍 총 발견된 문제: ${summary.totalIssues}개`);
  }

  findCommonIssues() {
    const issueMap = new Map();
    
    this.results.forEach(result => {
      if (result.analysis?.issues) {
        result.analysis.issues.forEach(issue => {
          const key = `${issue.type}:${issue.message}`;
          if (!issueMap.has(key)) {
            issueMap.set(key, { ...issue, count: 0, pages: [] });
          }
          issueMap.get(key).count++;
          issueMap.get(key).pages.push(result.name);
        });
      }
    });

    return Array.from(issueMap.values())
      .filter(issue => issue.count > 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  generateDetailedReport() {
    const htmlReport = this.generateHTMLReport();
    fs.writeFileSync(path.join(this.reportDir, 'detailed-report.html'), htmlReport);
    
    const jsonReport = {
      summary: this.summary,
      results: this.results,
      generatedAt: new Date().toISOString()
    };
    fs.writeFileSync(path.join(this.reportDir, 'detailed-data.json'), JSON.stringify(jsonReport, null, 2));
  }

  generateHTMLReport() {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>doha.kr 라이브 사이트 상세 검사 보고서</title>
    <style>
        * { box-sizing: border-box; }
        body { 
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; 
          margin: 0; padding: 20px; background: #f5f7fa; line-height: 1.6; 
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 2px 20px rgba(0,0,0,0.1); }
        h1 { color: #2d3748; margin: 0 0 10px 0; font-size: 2.5rem; }
        .subtitle { color: #718096; font-size: 1.1rem; margin: 0; }
        
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .summary-card { background: white; padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 2px 20px rgba(0,0,0,0.05); }
        .summary-card.good { border-left: 5px solid #48bb78; }
        .summary-card.minor { border-left: 5px solid #ed8936; }
        .summary-card.major { border-left: 5px solid #f56565; }
        .summary-card.critical { border-left: 5px solid #e53e3e; }
        .summary-card.error { border-left: 5px solid #9f7aea; }
        .summary-number { font-size: 2.5rem; font-weight: bold; margin-bottom: 10px; }
        .summary-label { color: #718096; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
        
        .section { background: white; margin: 30px 0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.05); }
        .section-header { background: #667eea; color: white; padding: 20px 30px; }
        .section-title { margin: 0; font-size: 1.5rem; }
        .section-content { padding: 30px; }
        
        .common-issues { margin: 20px 0; }
        .issue-item { display: flex; align-items: center; padding: 15px; margin: 10px 0; background: #f7fafc; border-radius: 8px; border-left: 4px solid #e2e8f0; }
        .issue-item.critical { border-left-color: #e53e3e; background: #fed7d7; }
        .issue-item.major { border-left-color: #f56565; background: #fee2e2; }
        .issue-item.warning { border-left-color: #ed8936; background: #feebc8; }
        .issue-item.minor { border-left-color: #38b2ac; background: #e6fffa; }
        .issue-count { background: #667eea; color: white; padding: 4px 8px; border-radius: 20px; font-size: 0.8rem; margin-right: 15px; min-width: 30px; text-align: center; }
        
        .pages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px; }
        .page-card { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; transition: transform 0.2s ease; }
        .page-card:hover { transform: translateY(-5px); box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
        .page-header { padding: 20px; }
        .page-header.good { background: linear-gradient(135deg, #68d391, #48bb78); color: white; }
        .page-header.minor { background: linear-gradient(135deg, #f6ad55, #ed8936); color: white; }
        .page-header.major { background: linear-gradient(135deg, #fc8181, #f56565); color: white; }
        .page-header.critical { background: linear-gradient(135deg, #e53e3e, #c53030); color: white; }
        .page-header.error { background: linear-gradient(135deg, #b794f6, #9f7aea); color: white; }
        .page-title { margin: 0 0 5px 0; font-size: 1.2rem; font-weight: 600; }
        .page-url { font-size: 0.9rem; opacity: 0.9; word-break: break-all; }
        .page-content { padding: 20px; }
        
        .screenshots { margin: 15px 0; }
        .screenshot-link { 
          display: inline-block; margin: 5px 10px 5px 0; padding: 8px 16px; 
          background: #667eea; color: white; text-decoration: none; border-radius: 6px; 
          font-size: 0.9rem; transition: all 0.2s ease; 
        }
        .screenshot-link:hover { background: #5a67d8; transform: translateY(-2px); }
        
        .page-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0; }
        .stat-item { background: #f7fafc; padding: 12px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 1.5rem; font-weight: bold; color: #2d3748; }
        .stat-label { font-size: 0.8rem; color: #718096; margin-top: 5px; }
        
        .issues-list { margin: 15px 0; }
        .page-issue { margin: 8px 0; padding: 10px 12px; border-radius: 6px; font-size: 0.9rem; }
        .page-issue.critical { background: #fed7d7; color: #822727; border-left: 3px solid #e53e3e; }
        .page-issue.major { background: #fee2e2; color: #822727; border-left: 3px solid #f56565; }
        .page-issue.warning { background: #feebc8; color: #744210; border-left: 3px solid #ed8936; }
        .page-issue.minor { background: #e6fffa; color: #234e52; border-left: 3px solid #38b2ac; }
        
        .no-issues { text-align: center; padding: 20px; color: #48bb78; font-weight: bold; }
        .priority-badge { 
          display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; 
          text-transform: uppercase; letter-spacing: 1px; margin-left: 10px; 
        }
        .priority-high { background: #e53e3e; color: white; }
        .priority-medium { background: #ed8936; color: white; }
        .priority-low { background: #38b2ac; color: white; }
        
        .footer { text-align: center; padding: 30px; color: #718096; background: white; border-radius: 12px; margin-top: 30px; }
        
        @media (max-width: 768px) {
          .summary-grid { grid-template-columns: 1fr; }
          .pages-grid { grid-template-columns: 1fr; }
          .page-stats { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 doha.kr 라이브 사이트 상세 검사 보고서</h1>
            <p class="subtitle">26개 페이지 전체 품질 분석 및 개선사항 도출</p>
        </div>

        <div class="summary-grid">
            <div class="summary-card good">
                <div class="summary-number">${this.summary.byStatus.good}</div>
                <div class="summary-label">정상 페이지</div>
            </div>
            <div class="summary-card minor">
                <div class="summary-number">${this.summary.byStatus.minor}</div>
                <div class="summary-label">경고 페이지</div>
            </div>
            <div class="summary-card major">
                <div class="summary-number">${this.summary.byStatus.major}</div>
                <div class="summary-label">주요 문제</div>
            </div>
            <div class="summary-card critical">
                <div class="summary-number">${this.summary.byStatus.critical}</div>
                <div class="summary-label">심각한 문제</div>
            </div>
            <div class="summary-card error">
                <div class="summary-number">${this.summary.byStatus.error}</div>
                <div class="summary-label">오류 페이지</div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2 class="section-title">🔄 공통 문제점 분석</h2>
            </div>
            <div class="section-content">
                <div class="common-issues">
                    ${this.summary.commonIssues.length > 0 ? this.summary.commonIssues.map(issue => `
                        <div class="issue-item ${issue.severity}">
                            <span class="issue-count">${issue.count}</span>
                            <div>
                                <strong>${issue.message}</strong>
                                <div style="font-size: 0.8rem; color: #718096; margin-top: 5px;">
                                    영향받은 페이지: ${issue.pages.slice(0, 3).join(', ')}${issue.pages.length > 3 ? ` 외 ${issue.pages.length - 3}개` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('') : '<div class="no-issues">공통 문제점이 발견되지 않았습니다.</div>'}
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2 class="section-title">📋 페이지별 상세 분석</h2>
            </div>
            <div class="section-content">
                <div class="pages-grid">
                    ${this.results.map(result => `
                        <div class="page-card">
                            <div class="page-header ${result.status}">
                                <h3 class="page-title">
                                    ${result.title}
                                    <span class="priority-badge priority-${result.priority}">${result.priority}</span>
                                </h3>
                                <p class="page-url">${result.url}</p>
                            </div>
                            <div class="page-content">
                                <div class="screenshots">
                                    <a href="screenshots/${result.name}-desktop.png" class="screenshot-link" target="_blank">🖥️ 데스크톱</a>
                                    <a href="screenshots/${result.name}-mobile.png" class="screenshot-link" target="_blank">📱 모바일</a>
                                </div>
                                
                                ${result.analysis ? `
                                    <div class="page-stats">
                                        <div class="stat-item">
                                            <div class="stat-value">${result.analysis.issues.length}</div>
                                            <div class="stat-label">발견된 문제</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-value">${result.analysis.design.linkCount}</div>
                                            <div class="stat-label">링크 수</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-value">${result.analysis.accessibility.imagesWithoutAlt}</div>
                                            <div class="stat-label">Alt 없는 이미지</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-value">${result.analysis.seo.h1Count}</div>
                                            <div class="stat-label">H1 태그 수</div>
                                        </div>
                                    </div>
                                    
                                    ${result.analysis.issues.length > 0 ? `
                                        <div class="issues-list">
                                            <strong>발견된 문제점:</strong>
                                            ${result.analysis.issues.map(issue => `
                                                <div class="page-issue ${issue.severity}">
                                                    <strong>[${issue.type.toUpperCase()}]</strong> ${issue.message}
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : '<div class="no-issues">✅ 발견된 문제점 없음</div>'}
                                ` : `<div class="page-issue critical">페이지 로딩 실패: ${result.error}</div>`}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="footer">
            <p>보고서 생성 시간: ${new Date().toLocaleString('ko-KR')}</p>
            <p>총 ${this.results.length}개 페이지 분석 완료 | 발견된 총 문제: ${this.summary.totalIssues}개</p>
        </div>
    </div>
</body>
</html>`;
  }
}

async function main() {
  const checker = new ExtendedLiveSiteChecker();
  await checker.checkAllPages();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ExtendedLiveSiteChecker;