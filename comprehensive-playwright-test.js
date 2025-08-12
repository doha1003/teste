/**
 * Comprehensive 26-Page Playwright Test
 * doha.kr의 모든 26개 페이지를 완벽하게 테스트
 */

import { chromium, firefox, webkit } from 'playwright';
import fs from 'fs/promises';

const BROWSERS = ['chromium']; // 초기 테스트는 chromium만
const SCREENSHOTS_DIR = 'comprehensive-test-screenshots';

// 전체 26개 페이지 정의
const allPages = [
  // 1. 기본 페이지들
  { name: '홈페이지', url: 'https://doha.kr/', category: 'main' },
  { name: '소개 페이지', url: 'https://doha.kr/about/', category: 'main' },
  { name: '문의하기', url: 'https://doha.kr/contact/', category: 'main' },
  { name: 'FAQ', url: 'https://doha.kr/faq/', category: 'main' },
  { name: '개인정보처리방침', url: 'https://doha.kr/privacy/', category: 'legal' },
  { name: '이용약관', url: 'https://doha.kr/terms/', category: 'legal' },
  
  // 2. 심리테스트 (7개)
  { name: '심리테스트 메인', url: 'https://doha.kr/tests/', category: 'tests' },
  { name: 'MBTI 소개', url: 'https://doha.kr/tests/mbti/', category: 'tests' },
  { name: 'MBTI 테스트', url: 'https://doha.kr/tests/mbti/test.html', category: 'tests', hasInteraction: true },
  { name: 'Teto-Egen 소개', url: 'https://doha.kr/tests/teto-egen/', category: 'tests' },
  { name: 'Teto-Egen 테스트', url: 'https://doha.kr/tests/teto-egen/test.html', category: 'tests', hasInteraction: true },
  { name: 'Love DNA 소개', url: 'https://doha.kr/tests/love-dna/', category: 'tests' },
  { name: 'Love DNA 테스트', url: 'https://doha.kr/tests/love-dna/test.html', category: 'tests', hasInteraction: true },
  
  // 3. 운세 (6개)
  { name: '운세 메인', url: 'https://doha.kr/fortune/', category: 'fortune' },
  { name: '오늘의 운세', url: 'https://doha.kr/fortune/daily/', category: 'fortune', hasInteraction: true },
  { name: 'AI 사주팔자', url: 'https://doha.kr/fortune/saju/', category: 'fortune', hasInteraction: true },
  { name: 'AI 타로 리딩', url: 'https://doha.kr/fortune/tarot/', category: 'fortune', hasInteraction: true },
  { name: '별자리 운세', url: 'https://doha.kr/fortune/zodiac/', category: 'fortune', hasInteraction: true },
  { name: '띠별 운세', url: 'https://doha.kr/fortune/zodiac-animal/', category: 'fortune', hasInteraction: true },
  
  // 4. 실용도구 (4개)
  { name: '실용도구 메인', url: 'https://doha.kr/tools/', category: 'tools' },
  { name: 'BMI 계산기', url: 'https://doha.kr/tools/bmi-calculator.html', category: 'tools', hasInteraction: true },
  { name: '연봉 계산기', url: 'https://doha.kr/tools/salary-calculator.html', category: 'tools', hasInteraction: true },
  { name: '글자수 세기', url: 'https://doha.kr/tools/text-counter.html', category: 'tools', hasInteraction: true },
  
  // 5. 특수 페이지 (3개)
  { name: '404 페이지', url: 'https://doha.kr/404.html', category: 'special' },
  { name: '오프라인 페이지', url: 'https://doha.kr/offline.html', category: 'special' },
  { name: '결과 상세 페이지', url: 'https://doha.kr/result-detail.html', category: 'special' }
];

class ComprehensivePlaywrightTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.totalErrors = 0;
    this.errorsByType = {};
  }

  async init() {
    console.log('🎭 26개 페이지 완벽 테스트 시작...\n');
    
    try {
      await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
    } catch (e) { /* 디렉토리가 이미 존재 */ }
  }

  async testPageComprehensive(pageInfo, browser, browserName) {
    const { name, url, category, hasInteraction } = pageInfo;
    console.log(`\n🔍 [${browserName}] ${name} 테스트 중... (${category})`);

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'ko-KR',
      timezoneId: 'Asia/Seoul',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    
    const errors = [];
    const networkErrors = [];
    const performance = {};
    
    const testResult = {
      page: name,
      url,
      category,
      browser: browserName,
      timestamp: new Date().toISOString(),
      success: false,
      loadTime: 0,
      errors: [],
      networkErrors: [],
      performance: {},
      accessibility: {},
      interactions: {},
      screenshots: []
    };

    // 네트워크 요청 모니터링
    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        failure: request.failure()?.errorText,
        method: request.method()
      });
    });

    // 콘솔 에러 수집
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          type: 'console',
          message: msg.text(),
          location: msg.location()
        });
      }
    });

    // JavaScript 에러 수집
    page.on('pageerror', error => {
      errors.push({
        type: 'javascript',
        message: error.message,
        stack: error.stack
      });
    });

    try {
      // 페이지 로드 성능 측정
      const startLoad = Date.now();
      
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      // DOM 완전 로드 대기
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      const loadTime = Date.now() - startLoad;
      testResult.loadTime = loadTime;

      console.log(`     ⏱️ 로드 시간: ${loadTime}ms`);

      // 초기 스크린샷
      const initialScreenshot = `${SCREENSHOTS_DIR}/${name}-${browserName}-initial.png`;
      await page.screenshot({ 
        path: initialScreenshot, 
        fullPage: true,
        animations: 'disabled'
      });
      testResult.screenshots.push(initialScreenshot);

      // 기본 페이지 검증
      await this.performBasicValidation(page, testResult);

      // 접근성 검증
      await this.performAccessibilityCheck(page, testResult);

      // 인터랙션 테스트 (필요한 경우)
      if (hasInteraction) {
        await this.performInteractionTests(page, name, testResult);
      }

      // 성능 메트릭 수집
      await this.collectPerformanceMetrics(page, testResult);

      // 최종 스크린샷
      const finalScreenshot = `${SCREENSHOTS_DIR}/${name}-${browserName}-final.png`;
      await page.screenshot({ 
        path: finalScreenshot, 
        fullPage: true,
        animations: 'disabled'
      });
      testResult.screenshots.push(finalScreenshot);

      // 에러 집계
      testResult.errors = errors;
      testResult.networkErrors = networkErrors;
      testResult.success = errors.length === 0 && networkErrors.length === 0;

      // 결과 출력
      const errorCount = errors.length + networkErrors.length;
      this.totalErrors += errorCount;
      
      if (errorCount === 0) {
        console.log(`     ✅ 완벽함 (${loadTime}ms)`);
      } else {
        console.log(`     ⚠️ ${errorCount}개 이슈 (${loadTime}ms)`);
        
        // 주요 에러 유형 분류
        errors.forEach(error => {
          const type = error.message.includes('Cannot read properties') ? 'undefined-property' :
                      error.message.includes('Unexpected token') ? 'syntax-error' :
                      error.message.includes('network') ? 'network-error' : 'other';
          this.errorsByType[type] = (this.errorsByType[type] || 0) + 1;
        });
      }

    } catch (error) {
      console.log(`     ❌ 치명적 오류: ${error.message}`);
      testResult.success = false;
      testResult.errors.push({
        type: 'critical',
        message: error.message,
        stack: error.stack
      });
    } finally {
      await context.close();
    }

    return testResult;
  }

  async performBasicValidation(page, result) {
    try {
      // 페이지 제목 확인
      const title = await page.title();
      result.validation = { title: title.length > 0 };

      // 필수 메타태그 확인
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
      result.validation.metaDescription = !!metaDescription;

      // 폰트 로딩 확인
      const fontLoaded = await page.evaluate(() => {
        return document.fonts.ready.then(() => true).catch(() => false);
      });
      result.validation.fontLoaded = fontLoaded;

      // 이미지 로딩 확인
      const brokenImages = await page.evaluate(() => {
        const images = Array.from(document.images);
        return images.filter(img => !img.complete || img.naturalWidth === 0).length;
      });
      result.validation.brokenImages = brokenImages;

    } catch (error) {
      result.validation = { error: error.message };
    }
  }

  async performAccessibilityCheck(page, result) {
    try {
      // 기본 접근성 검사
      const accessibilityIssues = await page.evaluate(() => {
        const issues = [];
        
        // alt 속성 누락 이미지
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
        if (imagesWithoutAlt.length > 0) {
          issues.push(`${imagesWithoutAlt.length}개 이미지에 alt 속성 누락`);
        }

        // 헤딩 구조 확인
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) {
          issues.push('헤딩 요소 없음');
        }

        // 링크 텍스트 확인
        const linksWithoutText = document.querySelectorAll('a:empty');
        if (linksWithoutText.length > 0) {
          issues.push(`${linksWithoutText.length}개 빈 링크`);
        }

        return issues;
      });

      result.accessibility = {
        issues: accessibilityIssues,
        score: Math.max(0, 100 - (accessibilityIssues.length * 10))
      };

    } catch (error) {
      result.accessibility = { error: error.message };
    }
  }

  async performInteractionTests(page, pageName, result) {
    console.log(`       🎯 인터랙션 테스트...`);
    
    try {
      switch (pageName) {
        case 'MBTI 테스트':
          await this.testMBTIInteraction(page, result);
          break;
        case 'AI 타로 리딩':
          await this.testTarotInteraction(page, result);
          break;
        case '오늘의 운세':
          await this.testDailyFortuneInteraction(page, result);
          break;
        case 'BMI 계산기':
          await this.testBMICalculatorInteraction(page, result);
          break;
        case '글자수 세기':
          await this.testTextCounterInteraction(page, result);
          break;
        default:
          result.interactions.note = '인터랙션 테스트 미구현';
      }
    } catch (error) {
      result.interactions.error = error.message;
    }
  }

  async testBMICalculatorInteraction(page, result) {
    try {
      // 키 입력
      const heightInput = page.locator('input[name="height"]');
      if (await heightInput.count() > 0) {
        await heightInput.fill('170');
        result.interactions.heightEntered = true;
      }

      // 몸무게 입력
      const weightInput = page.locator('input[name="weight"]');
      if (await weightInput.count() > 0) {
        await weightInput.fill('65');
        result.interactions.weightEntered = true;
      }

      // 계산 버튼 클릭 (더 구체적인 선택자 사용)
      const calculateButton = page.locator('button[type="submit"][data-action="calculate"]');
      if (await calculateButton.count() > 0) {
        await calculateButton.click();
        await page.waitForTimeout(1000);
        result.interactions.calculationPerformed = true;

        // 결과 확인
        const resultElement = page.locator('#result');
        if (await resultElement.count() > 0) {
          const isVisible = await resultElement.isVisible();
          result.interactions.resultDisplayed = isVisible;
        }
      }
    } catch (error) {
      result.interactions.error = error.message;
    }
  }

  async testTextCounterInteraction(page, result) {
    try {
      const testText = '한글 텍스트 카운터 테스트입니다. 글자수와 단어수를 정확히 계산하는지 확인합니다.';
      
      const textarea = page.locator('textarea');
      if (await textarea.count() > 0) {
        await textarea.fill(testText);
        await page.waitForTimeout(500);
        result.interactions.textEntered = true;

        // 글자수 확인
        const charCount = page.locator('.char-count, #charCount');
        if (await charCount.count() > 0) {
          const countText = await charCount.textContent();
          result.interactions.charCountDisplayed = countText;
        }
      }
    } catch (error) {
      result.interactions.error = error.message;
    }
  }

  async testMBTIInteraction(page, result) {
    try {
      // 시작 버튼 찾기
      const startButton = page.locator('button:has-text("시작"), .start-btn');
      if (await startButton.count() > 0) {
        await startButton.first().click();
        await page.waitForTimeout(1000);
        result.interactions.testStarted = true;
      }

      // 첫 번째 질문에 답변
      const firstOption = page.locator('input[type="radio"]').first();
      if (await firstOption.count() > 0) {
        await firstOption.click();
        result.interactions.questionAnswered = true;
      }
    } catch (error) {
      result.interactions.error = error.message;
    }
  }

  async testTarotInteraction(page, result) {
    try {
      // 이름 입력
      const nameInput = page.locator('input[name="userName"]');
      if (await nameInput.count() > 0) {
        await nameInput.fill('테스트');
        result.interactions.nameEntered = true;
      }

      // 질문 입력
      const questionInput = page.locator('textarea[name="question"]');
      if (await questionInput.count() > 0) {
        await questionInput.fill('오늘의 운세는?');
        result.interactions.questionEntered = true;
      }

      // 폼 제출 버튼 확인
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.count() > 0) {
        result.interactions.submitButtonFound = true;
      }
    } catch (error) {
      result.interactions.error = error.message;
    }
  }

  async testDailyFortuneInteraction(page, result) {
    try {
      // 이름 입력
      const nameInput = page.locator('input[name="name"]');
      if (await nameInput.count() > 0) {
        await nameInput.fill('홍길동');
        result.interactions.nameEntered = true;
      }

      // 생년월일 입력
      const birthInput = page.locator('input[type="date"]');
      if (await birthInput.count() > 0) {
        await birthInput.fill('1990-01-01');
        result.interactions.birthEntered = true;
      }
    } catch (error) {
      result.interactions.error = error.message;
    }
  }

  async collectPerformanceMetrics(page, result) {
    try {
      const metrics = await page.evaluate(() => {
        const timing = performance.timing;
        const navigation = performance.getEntriesByType('navigation')[0];
        
        return {
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          fullyLoaded: timing.loadEventEnd - timing.navigationStart,
          firstPaint: navigation ? navigation.loadEventEnd : 0,
          resourceCount: performance.getEntriesByType('resource').length
        };
      });

      result.performance = metrics;
    } catch (error) {
      result.performance = { error: error.message };
    }
  }

  async runAllTests() {
    await this.init();

    for (const browserName of BROWSERS) {
      console.log(`\n🌐 ${browserName.toUpperCase()} 브라우저로 26개 페이지 테스트`);
      
      let browser;
      try {
        browser = await chromium.launch({ 
          headless: true,
          args: ['--disable-dev-shm-usage', '--no-sandbox']
        });

        // 카테고리별로 그룹화하여 테스트
        const categories = [...new Set(allPages.map(p => p.category))];
        
        for (const category of categories) {
          const categoryPages = allPages.filter(p => p.category === category);
          console.log(`\n📂 ${category.toUpperCase()} 카테고리 (${categoryPages.length}개 페이지)`);
          
          for (const pageInfo of categoryPages) {
            const result = await this.testPageComprehensive(pageInfo, browser, browserName);
            this.results.push(result);
          }
        }

      } catch (error) {
        console.log(`❌ ${browserName} 브라우저 실행 실패: ${error.message}`);
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    }

    await this.generateComprehensiveReport();
  }

  async generateComprehensiveReport() {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;

    const summary = {
      testInfo: {
        timestamp: new Date().toISOString(),
        totalTime: `${Math.round(totalTime / 1000)}초`,
        totalPages: this.results.length,
        browsers: BROWSERS
      },
      stats: {
        successful: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        withErrors: this.results.filter(r => r.errors.length > 0).length,
        totalErrors: this.totalErrors,
        errorsByType: this.errorsByType
      },
      categoryStats: this.getCategoryStats(),
      performanceStats: this.getPerformanceStats(),
      results: this.results
    };

    // JSON 보고서 저장
    const reportFile = `comprehensive-test-report-${Date.now()}.json`;
    await fs.writeFile(reportFile, JSON.stringify(summary, null, 2));

    // HTML 보고서 생성
    await this.generateComprehensiveHTMLReport(summary);

    // 콘솔 요약 출력
    this.printSummary(summary);
  }

  getCategoryStats() {
    const categories = {};
    this.results.forEach(result => {
      if (!categories[result.category]) {
        categories[result.category] = { total: 0, success: 0, failed: 0 };
      }
      categories[result.category].total++;
      if (result.success) {
        categories[result.category].success++;
      } else {
        categories[result.category].failed++;
      }
    });
    return categories;
  }

  getPerformanceStats() {
    const loadTimes = this.results.map(r => r.loadTime).filter(t => t > 0);
    return {
      averageLoadTime: Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length),
      minLoadTime: Math.min(...loadTimes),
      maxLoadTime: Math.max(...loadTimes),
      slowPages: this.results.filter(r => r.loadTime > 3000).map(r => ({ name: r.page, time: r.loadTime }))
    };
  }

  async generateComprehensiveHTMLReport(summary) {
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>doha.kr 26개 페이지 완벽 테스트 보고서</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .number { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .success { color: #27ae60; }
        .failed { color: #e74c3c; }
        .warning { color: #f39c12; }
        .category-section { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .test-result { border: 1px solid #ddd; margin: 10px 0; border-radius: 6px; overflow: hidden; }
        .test-header { padding: 15px; background: #f8f9fa; border-bottom: 1px solid #ddd; cursor: pointer; }
        .test-header:hover { background: #e9ecef; }
        .test-content { padding: 15px; display: none; }
        .test-content.expanded { display: block; }
        .error-list { background: #fff5f5; border: 1px solid #fed7d7; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .performance-chart { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .screenshots img { max-width: 200px; margin: 5px; border: 1px solid #ddd; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎭 doha.kr 완벽 테스트 보고서</h1>
        <p>전체 26개 페이지 comprehensive 테스트 결과</p>
        <p>생성일시: ${summary.testInfo.timestamp} | 소요시간: ${summary.testInfo.totalTime}</p>
    </div>

    <div class="summary-grid">
        <div class="summary-card">
            <h3>총 페이지</h3>
            <div class="number">${summary.testInfo.totalPages}</div>
        </div>
        <div class="summary-card">
            <h3>성공</h3>
            <div class="number success">${summary.stats.successful}</div>
        </div>
        <div class="summary-card">
            <h3>실패</h3>
            <div class="number failed">${summary.stats.failed}</div>
        </div>
        <div class="summary-card">
            <h3>총 오류</h3>
            <div class="number warning">${summary.stats.totalErrors}</div>
        </div>
    </div>

    <div class="performance-chart">
        <h2>📊 성능 통계</h2>
        <p><strong>평균 로드 시간:</strong> ${summary.performanceStats.averageLoadTime}ms</p>
        <p><strong>최고 속도:</strong> ${summary.performanceStats.minLoadTime}ms</p>
        <p><strong>최저 속도:</strong> ${summary.performanceStats.maxLoadTime}ms</p>
        ${summary.performanceStats.slowPages.length > 0 ? `
        <p><strong>느린 페이지 (3초 이상):</strong></p>
        <ul>
            ${summary.performanceStats.slowPages.map(p => `<li>${p.name}: ${p.time}ms</li>`).join('')}
        </ul>` : ''}
    </div>

    <div class="category-section">
        <h2>📂 카테고리별 현황</h2>
        ${Object.entries(summary.categoryStats).map(([category, stats]) => `
        <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px;">
            <strong>${category.toUpperCase()}:</strong> 
            ${stats.total}개 페이지 | 
            <span class="success">${stats.success}개 성공</span> | 
            <span class="failed">${stats.failed}개 실패</span>
        </div>`).join('')}
    </div>

    <div class="category-section">
        <h2>🔍 오류 유형별 분석</h2>
        ${Object.entries(summary.stats.errorsByType).map(([type, count]) => `
        <div style="margin: 5px 0;">
            <strong>${type}:</strong> ${count}회 발생
        </div>`).join('')}
    </div>

    <h2>📋 상세 테스트 결과</h2>
    ${summary.results.map((result, index) => `
      <div class="test-result ${result.success ? 'success' : 'failed'}">
        <div class="test-header" onclick="toggleResult(${index})">
          <h3>${result.success ? '✅' : '❌'} ${result.page} (${result.category})</h3>
          <p><strong>URL:</strong> ${result.url} | <strong>로드시간:</strong> ${result.loadTime}ms</p>
        </div>
        <div class="test-content" id="result-${index}">
          ${result.errors.length > 0 ? `
          <div class="error-list">
            <strong>JavaScript 오류 (${result.errors.length}개):</strong>
            <ul>
              ${result.errors.map(error => `<li>[${error.type}] ${error.message}</li>`).join('')}
            </ul>
          </div>` : ''}
          
          ${result.networkErrors.length > 0 ? `
          <div class="error-list">
            <strong>네트워크 오류 (${result.networkErrors.length}개):</strong>
            <ul>
              ${result.networkErrors.map(error => `<li>${error.url} - ${error.failure}</li>`).join('')}
            </ul>
          </div>` : ''}
          
          ${Object.keys(result.interactions).length > 0 ? `
          <div style="background: #f0f8ff; padding: 10px; margin: 10px 0; border-radius: 4px;">
            <strong>인터랙션 테스트:</strong>
            <ul>
              ${Object.entries(result.interactions).map(([key, value]) => 
                `<li><strong>${key}:</strong> ${value}</li>`
              ).join('')}
            </ul>
          </div>` : ''}
          
          ${result.screenshots.length > 0 ? `
          <div class="screenshots">
            <strong>스크린샷:</strong><br>
            ${result.screenshots.map(screenshot => 
              `<img src="${screenshot}" alt="스크린샷" title="${screenshot}">`
            ).join('')}
          </div>` : ''}
        </div>
      </div>
    `).join('')}

    <script>
      function toggleResult(index) {
        const content = document.getElementById('result-' + index);
        content.classList.toggle('expanded');
      }
    </script>
</body>
</html>`;

    await fs.writeFile('comprehensive-test-report.html', html);
  }

  printSummary(summary) {
    console.log('\n' + '='.repeat(80));
    console.log('🎭 DOHA.KR 26개 페이지 완벽 테스트 완료');
    console.log('='.repeat(80));
    console.log(`⏱️  총 소요시간: ${summary.testInfo.totalTime}`);
    console.log(`📄 테스트한 페이지: ${summary.testInfo.totalPages}개`);
    console.log(`✅ 성공: ${summary.stats.successful}개`);
    console.log(`❌ 실패: ${summary.stats.failed}개`);
    console.log(`⚠️  총 오류: ${summary.stats.totalErrors}개`);
    
    console.log('\n📊 성능 요약:');
    console.log(`   평균 로드시간: ${summary.performanceStats.averageLoadTime}ms`);
    console.log(`   가장 빠른 페이지: ${summary.performanceStats.minLoadTime}ms`);
    console.log(`   가장 느린 페이지: ${summary.performanceStats.maxLoadTime}ms`);
    
    console.log('\n📂 카테고리별 현황:');
    Object.entries(summary.categoryStats).forEach(([category, stats]) => {
      console.log(`   ${category}: ${stats.success}/${stats.total} 성공`);
    });
    
    if (Object.keys(summary.stats.errorsByType).length > 0) {
      console.log('\n🔍 주요 오류 유형:');
      Object.entries(summary.stats.errorsByType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}회`);
      });
    }

    console.log(`\n📄 상세 보고서: comprehensive-test-report.html`);
    console.log(`📁 스크린샷: ${SCREENSHOTS_DIR}/`);
    console.log('='.repeat(80));
  }
}

// 실행
const comprehensiveTester = new ComprehensivePlaywrightTester();
comprehensiveTester.runAllTests().catch(console.error);