/**
 * doha.kr 라이브 사이트 26개 페이지 시각적 검사 및 기능 테스트
 * - 각 페이지별 데스크톱/모바일 스크린샷 캡처
 * - 디자인 문제점 자동 감지
 * - 기능적 요소 테스트
 * - 종합 보고서 생성
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

// 26개 주요 페이지 정의
const PAGES_TO_INSPECT = [
  // 메인 & 정보 페이지 (6개)
  { url: 'https://doha.kr/', name: 'home', title: '홈페이지' },
  { url: 'https://doha.kr/about/', name: 'about', title: '사이트 소개' },
  { url: 'https://doha.kr/contact/', name: 'contact', title: '문의하기' },
  { url: 'https://doha.kr/faq/', name: 'faq', title: '자주 묻는 질문' },
  { url: 'https://doha.kr/privacy/', name: 'privacy', title: '개인정보처리방침' },
  { url: 'https://doha.kr/terms/', name: 'terms', title: '이용약관' },
  
  // 심리테스트 섹션 (6개)
  { url: 'https://doha.kr/tests/', name: 'tests-index', title: '심리테스트 목록' },
  { url: 'https://doha.kr/tests/teto-egen/', name: 'teto-egen-intro', title: '테토-에겐 테스트 소개' },
  { url: 'https://doha.kr/tests/teto-egen/test.html', name: 'teto-egen-test', title: '테토-에겐 테스트' },
  { url: 'https://doha.kr/tests/mbti/', name: 'mbti-intro', title: 'MBTI 테스트 소개' },
  { url: 'https://doha.kr/tests/mbti/test.html', name: 'mbti-test', title: 'MBTI 테스트' },
  { url: 'https://doha.kr/tests/love-dna/', name: 'love-dna-intro', title: '러브 DNA 테스트 소개' },
  
  // AI 운세 섹션 (6개)
  { url: 'https://doha.kr/fortune/', name: 'fortune-index', title: 'AI 운세 목록' },
  { url: 'https://doha.kr/fortune/daily/', name: 'daily-fortune', title: '오늘의 운세' },
  { url: 'https://doha.kr/fortune/saju/', name: 'saju-fortune', title: 'AI 사주팔자' },
  { url: 'https://doha.kr/fortune/zodiac/', name: 'zodiac-fortune', title: '별자리 운세' },
  { url: 'https://doha.kr/fortune/zodiac-animal/', name: 'zodiac-animal-fortune', title: '띠별 운세' },
  { url: 'https://doha.kr/fortune/tarot/', name: 'tarot-fortune', title: 'AI 타로 리딩' },
  
  // 실용도구 섹션 (4개)
  { url: 'https://doha.kr/tools/', name: 'tools-index', title: '실용도구 목록' },
  { url: 'https://doha.kr/tools/text-counter.html', name: 'text-counter', title: '글자수 세기' },
  { url: 'https://doha.kr/tools/salary-calculator.html', name: 'salary-calculator', title: '연봉 계산기' },
  { url: 'https://doha.kr/tools/bmi-calculator.html', name: 'bmi-calculator', title: 'BMI 계산기' },
  
  // 특수 페이지 (4개)
  { url: 'https://doha.kr/tests/love-dna/test.html', name: 'love-dna-test', title: '러브 DNA 테스트' },
  { url: 'https://doha.kr/404.html', name: '404', title: '404 오류 페이지' },
  { url: 'https://doha.kr/offline.html', name: 'offline', title: '오프라인 페이지' },
  { url: 'https://doha.kr/result-detail.html', name: 'result-detail', title: '결과 상세 페이지' }
];

// 디자인 문제점 감지 체크리스트
const DESIGN_ISSUES_TO_CHECK = [
  'low-contrast-text',
  'overlapping-elements',
  'broken-layout',
  'missing-images',
  'button-visibility',
  'korean-line-breaks',
  'spacing-inconsistency',
  'gradient-readability'
];

// 결과 저장 디렉토리
const REPORT_DIR = path.join(__dirname, 'visual-inspection-report');
const SCREENSHOTS_DIR = path.join(REPORT_DIR, 'screenshots');

class DohaVisualInspector {
  constructor() {
    this.results = [];
    this.issues = [];
    this.setupDirectories();
  }

  setupDirectories() {
    [REPORT_DIR, SCREENSHOTS_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async inspectAllPages() {
    console.log('🚀 doha.kr 라이브 사이트 시각적 검사 시작...');
    console.log(`📋 총 ${PAGES_TO_INSPECT.length}개 페이지 검사 예정\n`);

    const browser = await chromium.launch({ 
      headless: false, // 진행상황 확인을 위해 헤드리스 모드 비활성화
      slowMo: 100 
    });

    try {
      for (const page of PAGES_TO_INSPECT) {
        console.log(`🔍 검사 중: ${page.title} (${page.url})`);
        await this.inspectPage(browser, page);
      }
    } finally {
      await browser.close();
    }

    this.generateReport();
    console.log(`\n✅ 검사 완료! 결과는 ${REPORT_DIR} 폴더에서 확인하세요.`);
  }

  async inspectPage(browser, pageInfo) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // 페이지 로드
      await page.goto(pageInfo.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // 페이지 정보 수집
      const pageData = await this.collectPageData(page, pageInfo);

      // 데스크톱 스크린샷 (1280x720)
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(1000); // 레이아웃 안정화
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `${pageInfo.name}-desktop.png`),
        fullPage: true
      });

      // 모바일 스크린샷 (375x667)
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `${pageInfo.name}-mobile.png`),
        fullPage: true
      });

      // 디자인 문제점 감지
      const designIssues = await this.detectDesignIssues(page, pageInfo);

      // 기능 테스트
      const functionalTests = await this.runFunctionalTests(page, pageInfo);

      // 결과 저장
      this.results.push({
        ...pageInfo,
        pageData,
        designIssues,
        functionalTests,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ ${pageInfo.title} 검사 실패:`, error.message);
      this.issues.push({
        page: pageInfo.name,
        type: 'page-load-error',
        severity: 'critical',
        description: `페이지 로드 실패: ${error.message}`,
        url: pageInfo.url
      });
    } finally {
      await context.close();
    }
  }

  async collectPageData(page, pageInfo) {
    return await page.evaluate(() => {
      const data = {
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
        hasH1: !!document.querySelector('h1'),
        buttonCount: document.querySelectorAll('button, .btn, a[role="button"]').length,
        linkCount: document.querySelectorAll('a[href]').length,
        imageCount: document.querySelectorAll('img').length,
        formCount: document.querySelectorAll('form').length,
        errors: [],
        warnings: []
      };

      // 기본적인 접근성 검사
      if (!data.hasH1) {
        data.warnings.push('H1 태그가 없습니다.');
      }

      // 이미지 alt 텍스트 검사
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      if (imagesWithoutAlt.length > 0) {
        data.warnings.push(`${imagesWithoutAlt.length}개의 이미지에 alt 텍스트가 없습니다.`);
      }

      // 폼 레이블 검사
      const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      if (inputsWithoutLabels.length > 0) {
        data.warnings.push(`${inputsWithoutLabels.length}개의 입력 필드에 레이블이 없습니다.`);
      }

      return data;
    });
  }

  async detectDesignIssues(page, pageInfo) {
    const issues = [];

    try {
      // 1. 텍스트 대비 문제 검사
      const lowContrastElements = await page.evaluate(() => {
        const elements = [];
        document.querySelectorAll('*').forEach(el => {
          const styles = getComputedStyle(el);
          const bgColor = styles.backgroundColor;
          const textColor = styles.color;
          
          // 간단한 대비 검사 (실제 구현에서는 더 정교한 알고리즘 필요)
          if (bgColor.includes('rgb(') && textColor.includes('rgb(')) {
            const bg = bgColor.match(/\d+/g);
            const text = textColor.match(/\d+/g);
            if (bg && text) {
              const bgLuminance = (parseInt(bg[0]) + parseInt(bg[1]) + parseInt(bg[2])) / 3;
              const textLuminance = (parseInt(text[0]) + parseInt(text[1]) + parseInt(text[2])) / 3;
              const contrast = Math.abs(bgLuminance - textLuminance);
              
              if (contrast < 50 && el.textContent.trim()) {
                elements.push({
                  tagName: el.tagName,
                  className: el.className,
                  textContent: el.textContent.substring(0, 50)
                });
              }
            }
          }
        });
        return elements.slice(0, 5); // 최대 5개만 리포트
      });

      if (lowContrastElements.length > 0) {
        issues.push({
          type: 'low-contrast',
          severity: 'major',
          count: lowContrastElements.length,
          description: '텍스트와 배경의 대비가 낮습니다.',
          elements: lowContrastElements
        });
      }

      // 2. 요소 겹침 검사
      const overlappingElements = await page.evaluate(() => {
        const overlaps = [];
        const elements = Array.from(document.querySelectorAll('*')).filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

        for (let i = 0; i < elements.length - 1; i++) {
          const rect1 = elements[i].getBoundingClientRect();
          for (let j = i + 1; j < elements.length; j++) {
            const rect2 = elements[j].getBoundingClientRect();
            
            // 겹침 검사
            if (rect1.left < rect2.right && rect1.right > rect2.left &&
                rect1.top < rect2.bottom && rect1.bottom > rect2.top) {
              // 부모-자식 관계가 아닌 경우에만 문제로 판단
              if (!elements[i].contains(elements[j]) && !elements[j].contains(elements[i])) {
                overlaps.push({
                  element1: { tagName: elements[i].tagName, className: elements[i].className },
                  element2: { tagName: elements[j].tagName, className: elements[j].className }
                });
                if (overlaps.length >= 3) break; // 최대 3개만 리포트
              }
            }
          }
          if (overlaps.length >= 3) break;
        }
        return overlaps;
      });

      if (overlappingElements.length > 0) {
        issues.push({
          type: 'overlapping-elements',
          severity: 'major',
          count: overlappingElements.length,
          description: '요소들이 겹쳐 있습니다.',
          elements: overlappingElements
        });
      }

      // 3. 깨진 이미지 검사
      const brokenImages = await page.evaluate(() => {
        const broken = [];
        document.querySelectorAll('img').forEach(img => {
          if (!img.complete || img.naturalHeight === 0) {
            broken.push({
              src: img.src,
              alt: img.alt || 'alt 없음'
            });
          }
        });
        return broken;
      });

      if (brokenImages.length > 0) {
        issues.push({
          type: 'broken-images',
          severity: 'major',
          count: brokenImages.length,
          description: '로드되지 않은 이미지가 있습니다.',
          elements: brokenImages
        });
      }

      // 4. 한글 줄바꿈 문제 검사
      const koreanLineBreakIssues = await page.evaluate(() => {
        const issues = [];
        document.querySelectorAll('*').forEach(el => {
          const styles = getComputedStyle(el);
          const hasKorean = /[가-힣]/.test(el.textContent);
          
          if (hasKorean && styles.wordBreak !== 'keep-all') {
            issues.push({
              tagName: el.tagName,
              className: el.className,
              textContent: el.textContent.substring(0, 30),
              wordBreak: styles.wordBreak
            });
          }
        });
        return issues.slice(0, 5);
      });

      if (koreanLineBreakIssues.length > 0) {
        issues.push({
          type: 'korean-line-break',
          severity: 'minor',
          count: koreanLineBreakIssues.length,
          description: '한글 텍스트에 word-break: keep-all이 적용되지 않았습니다.',
          elements: koreanLineBreakIssues
        });
      }

    } catch (error) {
      console.error(`디자인 문제점 감지 중 오류: ${error.message}`);
    }

    return issues;
  }

  async runFunctionalTests(page, pageInfo) {
    const tests = {
      navigation: { passed: false, errors: [] },
      buttons: { passed: false, errors: [] },
      forms: { passed: false, errors: [] },
      links: { passed: false, errors: [] }
    };

    try {
      // 1. 네비게이션 테스트
      const navElements = await page.$$('nav a, .navbar a, header a');
      if (navElements.length > 0) {
        tests.navigation.passed = true;
      } else {
        tests.navigation.errors.push('네비게이션 링크를 찾을 수 없습니다.');
      }

      // 2. 버튼 클릭 가능성 테스트
      const buttons = await page.$$('button, .btn, a[role="button"]');
      let clickableButtons = 0;
      
      for (let i = 0; i < Math.min(buttons.length, 3); i++) {
        try {
          const isVisible = await buttons[i].isVisible();
          const isEnabled = await buttons[i].isEnabled();
          if (isVisible && isEnabled) {
            clickableButtons++;
          }
        } catch (error) {
          tests.buttons.errors.push(`버튼 ${i + 1} 테스트 실패: ${error.message}`);
        }
      }

      tests.buttons.passed = clickableButtons > 0;
      if (clickableButtons === 0 && buttons.length > 0) {
        tests.buttons.errors.push('클릭 가능한 버튼이 없습니다.');
      }

      // 3. 폼 테스트
      const forms = await page.$$('form');
      if (forms.length > 0) {
        for (const form of forms.slice(0, 2)) {
          try {
            const inputs = await form.$$('input, textarea, select');
            if (inputs.length > 0) {
              tests.forms.passed = true;
            }
          } catch (error) {
            tests.forms.errors.push(`폼 테스트 실패: ${error.message}`);
          }
        }
      } else {
        tests.forms.passed = true; // 폼이 없는 페이지는 통과로 처리
      }

      // 4. 링크 유효성 기본 검사
      const links = await page.$$('a[href]');
      let validLinks = 0;
      
      for (let i = 0; i < Math.min(links.length, 5); i++) {
        try {
          const href = await links[i].getAttribute('href');
          if (href && !href.startsWith('#') && href !== 'javascript:void(0)') {
            validLinks++;
          }
        } catch (error) {
          tests.links.errors.push(`링크 ${i + 1} 검사 실패: ${error.message}`);
        }
      }

      tests.links.passed = validLinks > 0 || links.length === 0;

    } catch (error) {
      console.error(`기능 테스트 중 오류: ${error.message}`);
    }

    return tests;
  }

  generateReport() {
    const summary = {
      totalPages: PAGES_TO_INSPECT.length,
      pagesChecked: this.results.length,
      totalIssues: this.results.reduce((sum, page) => sum + page.designIssues.length, 0),
      criticalIssues: this.issues.filter(issue => issue.severity === 'critical').length,
      majorIssues: this.results.reduce((sum, page) => 
        sum + page.designIssues.filter(issue => issue.severity === 'major').length, 0),
      minorIssues: this.results.reduce((sum, page) => 
        sum + page.designIssues.filter(issue => issue.severity === 'minor').length, 0),
      generatedAt: new Date().toISOString()
    };

    // HTML 보고서 생성
    const htmlReport = this.generateHTMLReport(summary);
    fs.writeFileSync(path.join(REPORT_DIR, 'visual-inspection-report.html'), htmlReport);

    // JSON 보고서 생성
    const jsonReport = {
      summary,
      results: this.results,
      issues: this.issues,
      pages: PAGES_TO_INSPECT
    };
    fs.writeFileSync(path.join(REPORT_DIR, 'inspection-data.json'), JSON.stringify(jsonReport, null, 2));

    console.log('\n📊 검사 결과 요약:');
    console.log(`✅ 검사 완료된 페이지: ${summary.pagesChecked}/${summary.totalPages}`);
    console.log(`🚨 총 발견된 문제: ${summary.totalIssues}개`);
    console.log(`   - Critical: ${summary.criticalIssues}개`);
    console.log(`   - Major: ${summary.majorIssues}개`);
    console.log(`   - Minor: ${summary.minorIssues}개`);
  }

  generateHTMLReport(summary) {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>doha.kr 시각적 검사 보고서</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #5c5ce0; padding-bottom: 15px; }
        h2 { color: #555; margin-top: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; }
        .stat-number { font-size: 2.5rem; font-weight: bold; margin-bottom: 5px; }
        .stat-label { font-size: 0.9rem; opacity: 0.9; }
        .page-results { margin: 30px 0; }
        .page-card { border: 1px solid #ddd; border-radius: 8px; margin: 15px 0; overflow: hidden; }
        .page-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd; }
        .page-title { font-weight: bold; color: #333; margin: 0; }
        .page-url { color: #666; font-size: 0.9rem; margin: 5px 0 0 0; }
        .issues-list { padding: 15px; }
        .issue { margin: 10px 0; padding: 10px; border-left: 4px solid #ccc; background: #f9f9f9; }
        .issue.critical { border-left-color: #dc3545; background: #fff5f5; }
        .issue.major { border-left-color: #fd7e14; background: #fff8f0; }
        .issue.minor { border-left-color: #28a745; background: #f0fff4; }
        .screenshots { margin: 15px 0; }
        .screenshot-link { display: inline-block; margin: 5px 10px 5px 0; padding: 8px 16px; background: #5c5ce0; color: white; text-decoration: none; border-radius: 6px; font-size: 0.9rem; }
        .no-issues { color: #28a745; font-style: italic; padding: 15px; }
        .functional-tests { margin: 15px 0; }
        .test-result { display: inline-block; margin: 5px; padding: 5px 10px; border-radius: 4px; font-size: 0.8rem; }
        .test-passed { background: #d4edda; color: #155724; }
        .test-failed { background: #f8d7da; color: #721c24; }
        .timestamp { color: #666; font-size: 0.9rem; margin-top: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 doha.kr 라이브 사이트 시각적 검사 보고서</h1>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-number">${summary.pagesChecked}</div>
                <div class="stat-label">검사 완료 페이지</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.totalIssues}</div>
                <div class="stat-label">총 발견 문제</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.criticalIssues}</div>
                <div class="stat-label">Critical 문제</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.majorIssues}</div>
                <div class="stat-label">Major 문제</div>
            </div>
        </div>

        <h2>📋 페이지별 상세 결과</h2>
        <div class="page-results">
            ${this.results.map(result => `
                <div class="page-card">
                    <div class="page-header">
                        <h3 class="page-title">${result.title}</h3>
                        <p class="page-url">${result.url}</p>
                    </div>
                    
                    <div class="screenshots">
                        <a href="screenshots/${result.name}-desktop.png" class="screenshot-link" target="_blank">🖥️ 데스크톱</a>
                        <a href="screenshots/${result.name}-mobile.png" class="screenshot-link" target="_blank">📱 모바일</a>
                    </div>

                    <div class="functional-tests">
                        <strong>기능 테스트:</strong>
                        <span class="test-result ${result.functionalTests.navigation.passed ? 'test-passed' : 'test-failed'}">
                            네비게이션: ${result.functionalTests.navigation.passed ? '✓' : '✗'}
                        </span>
                        <span class="test-result ${result.functionalTests.buttons.passed ? 'test-passed' : 'test-failed'}">
                            버튼: ${result.functionalTests.buttons.passed ? '✓' : '✗'}
                        </span>
                        <span class="test-result ${result.functionalTests.forms.passed ? 'test-passed' : 'test-failed'}">
                            폼: ${result.functionalTests.forms.passed ? '✓' : '✗'}
                        </span>
                        <span class="test-result ${result.functionalTests.links.passed ? 'test-passed' : 'test-failed'}">
                            링크: ${result.functionalTests.links.passed ? '✓' : '✗'}
                        </span>
                    </div>

                    ${result.designIssues.length > 0 ? `
                        <div class="issues-list">
                            <strong>발견된 문제점:</strong>
                            ${result.designIssues.map(issue => `
                                <div class="issue ${issue.severity}">
                                    <strong>${issue.type.toUpperCase()}</strong> (${issue.severity}): ${issue.description}
                                    ${issue.count ? `<br><small>영향받은 요소: ${issue.count}개</small>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : '<div class="no-issues">✅ 발견된 문제점 없음</div>'}
                </div>
            `).join('')}
        </div>

        <div class="timestamp">
            보고서 생성 시간: ${new Date(summary.generatedAt).toLocaleString('ko-KR')}
        </div>
    </div>
</body>
</html>`;
  }
}

// 스크립트 실행
async function main() {
  const inspector = new DohaVisualInspector();
  await inspector.inspectAllPages();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DohaVisualInspector;