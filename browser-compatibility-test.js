/**
 * Browser Compatibility Test for Highlighter Patterns
 * 하이라이터 패턴 브라우저 호환성 테스트
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

class BrowserCompatibilityTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      browsers: {},
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        compatibility: {},
      },
    };
  }

  async testChrome() {
    console.log('🌐 Chrome 테스트 중...');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    try {
      await page.goto('http://localhost:3000/index.html', {
        waitUntil: 'networkidle0',
      });

      // CSS gradient 지원 확인
      const gradientSupport = await page.evaluate(() => {
        const testEl = document.createElement('div');
        testEl.style.background = 'linear-gradient(45deg, red, blue)';
        return testEl.style.background.includes('gradient');
      });

      // CSS Grid 지원 확인
      const gridSupport = await page.evaluate(() => {
        return CSS.supports('display', 'grid');
      });

      // 하이라이터 패턴 렌더링 확인
      const patternRendering = await page.evaluate(() => {
        const highlightElements = document.querySelectorAll('[class*="highlight-"]');
        let renderingScore = 0;

        highlightElements.forEach((el) => {
          const styles = window.getComputedStyle(el);
          if (styles.backgroundImage !== 'none') renderingScore++;
          if (styles.opacity !== '0') renderingScore++;
        });

        return {
          elements: highlightElements.length,
          rendered: renderingScore,
          score: highlightElements.length > 0 ? renderingScore / highlightElements.length : 0,
        };
      });

      this.results.browsers.chrome = {
        userAgent: await page.evaluate(() => navigator.userAgent),
        gradientSupport,
        gridSupport,
        patternRendering,
        performance: await this.measurePerformance(page),
        status: 'passed',
      };
    } catch (error) {
      this.results.browsers.chrome = {
        status: 'failed',
        error: error.message,
      };
    } finally {
      await browser.close();
    }
  }

  async measurePerformance(page) {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const paintEntries = entries.filter((entry) => entry.entryType === 'paint');

          if (paintEntries.length > 0) {
            observer.disconnect();
            resolve({
              firstPaint: paintEntries.find((e) => e.name === 'first-paint')?.startTime || 0,
              firstContentfulPaint:
                paintEntries.find((e) => e.name === 'first-contentful-paint')?.startTime || 0,
            });
          }
        });

        observer.observe({ entryTypes: ['paint'] });

        // Fallback after 3 seconds
        setTimeout(() => {
          observer.disconnect();
          resolve({ firstPaint: 0, firstContentfulPaint: 0 });
        }, 3000);
      });
    });
  }

  async testMobileChrome() {
    console.log('📱 Mobile Chrome 테스트 중...');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // 모바일 뷰포트 설정
    await page.setViewport({
      width: 375,
      height: 667,
      isMobile: true,
      hasTouch: true,
    });

    try {
      await page.goto('http://localhost:3000/index.html', {
        waitUntil: 'networkidle0',
      });

      const mobileTests = await page.evaluate(() => {
        const results = {};

        // 터치 이벤트 지원
        results.touchSupport = 'ontouchstart' in window;

        // 모바일에서 패턴 가시성
        const highlightElements = document.querySelectorAll('[class*="highlight-"]');
        results.patternVisibility = Array.from(highlightElements).map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            visible: rect.width > 0 && rect.height > 0,
            size: { width: rect.width, height: rect.height },
          };
        });

        // 스크롤 성능 테스트
        const startTime = performance.now();
        window.scrollTo(0, 100);
        const scrollTime = performance.now() - startTime;
        results.scrollPerformance = scrollTime;

        return results;
      });

      this.results.browsers.mobileChrome = {
        userAgent: await page.evaluate(() => navigator.userAgent),
        viewport: await page.viewport(),
        mobileTests,
        status: 'passed',
      };
    } catch (error) {
      this.results.browsers.mobileChrome = {
        status: 'failed',
        error: error.message,
      };
    } finally {
      await browser.close();
    }
  }

  generateCompatibilityReport() {
    const browsers = Object.keys(this.results.browsers);
    let totalTests = 0;
    let passedTests = 0;

    browsers.forEach((browser) => {
      totalTests++;
      if (this.results.browsers[browser].status === 'passed') {
        passedTests++;
      }
    });

    this.results.summary = {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      compatibilityRate: Math.round((passedTests / totalTests) * 100),
      recommendations: [],
    };

    // 권장사항 생성
    browsers.forEach((browser) => {
      const browserData = this.results.browsers[browser];
      if (browserData.status === 'passed') {
        if (browserData.patternRendering && browserData.patternRendering.score < 0.8) {
          this.results.summary.recommendations.push({
            browser,
            issue: '패턴 렌더링 품질이 낮음',
            solution: 'CSS fallback 추가 및 vendor prefix 사용 검토',
          });
        }

        if (browserData.performance && browserData.performance.firstContentfulPaint > 2000) {
          this.results.summary.recommendations.push({
            browser,
            issue: 'First Contentful Paint 시간이 느림',
            solution: '패턴 복잡도 최적화 및 critical CSS 분리',
          });
        }
      }
    });

    return this.results;
  }

  async generateHtmlReport() {
    const reportHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Browser Compatibility Report - Highlighter Patterns</title>
    <style>
        body { font-family: 'Pretendard', sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; }
        header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 40px; border-radius: 12px; margin-bottom: 20px; }
        .score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .score-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .score { font-size: 2em; font-weight: bold; color: #10b981; }
        .browser-card { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status-passed { color: #10b981; font-weight: bold; }
        .status-failed { color: #ef4444; font-weight: bold; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0; }
        .feature-item { padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; text-align: center; }
        .feature-supported { background: #dcfce7; border-color: #10b981; }
        .feature-unsupported { background: #fee2e2; border-color: #ef4444; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f8fafc; font-weight: 600; }
        .recommendation { background: #fef3c7; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #f59e0b; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🌐 Browser Compatibility Report</h1>
            <p>Highlighter Patterns - 생성일시: ${new Date().toLocaleString('ko-KR')}</p>
        </header>

        <div class="score-grid">
            <div class="score-card">
                <h3>🎯 호환성 점수</h3>
                <div class="score">${this.results.summary.compatibilityRate || 0}%</div>
                <p>전체 브라우저 테스트 통과율</p>
            </div>
            <div class="score-card">
                <h3>🧪 테스트 브라우저</h3>
                <div class="score">${this.results.summary.totalTests || 0}</div>
                <p>테스트된 브라우저 수</p>
            </div>
            <div class="score-card">
                <h3>✅ 통과</h3>
                <div class="score">${this.results.summary.passedTests || 0}</div>
                <p>정상 작동 브라우저</p>
            </div>
            <div class="score-card">
                <h3>❌ 실패</h3>
                <div class="score">${this.results.summary.failedTests || 0}</div>
                <p>문제가 있는 브라우저</p>
            </div>
        </div>

        ${Object.entries(this.results.browsers)
          .map(
            ([browser, data]) => `
            <div class="browser-card">
                <h2>
                    ${browser === 'chrome' ? '🌐 Chrome' : '📱 Mobile Chrome'} 
                    <span class="status-${data.status}">${data.status === 'passed' ? '✅ 통과' : '❌ 실패'}</span>
                </h2>
                
                ${
                  data.status === 'passed'
                    ? `
                    <div class="feature-grid">
                        <div class="feature-item ${data.gradientSupport ? 'feature-supported' : 'feature-unsupported'}">
                            <strong>CSS Gradient</strong><br>
                            ${data.gradientSupport ? '✅ 지원' : '❌ 미지원'}
                        </div>
                        <div class="feature-item ${data.gridSupport ? 'feature-supported' : 'feature-unsupported'}">
                            <strong>CSS Grid</strong><br>
                            ${data.gridSupport ? '✅ 지원' : '❌ 미지원'}
                        </div>
                        ${
                          data.patternRendering
                            ? `
                            <div class="feature-item ${data.patternRendering.score > 0.8 ? 'feature-supported' : 'feature-unsupported'}">
                                <strong>패턴 렌더링</strong><br>
                                ${Math.round(data.patternRendering.score * 100)}% 품질
                            </div>
                        `
                            : ''
                        }
                    </div>
                    
                    ${
                      data.performance
                        ? `
                        <h3>성능 메트릭</h3>
                        <table>
                            <tr><th>메트릭</th><th>값</th><th>평가</th></tr>
                            <tr>
                                <td>First Paint</td>
                                <td>${Math.round(data.performance.firstPaint)}ms</td>
                                <td>${data.performance.firstPaint < 1000 ? '✅ 우수' : data.performance.firstPaint < 2000 ? '⚠️ 보통' : '❌ 개선필요'}</td>
                            </tr>
                            <tr>
                                <td>First Contentful Paint</td>
                                <td>${Math.round(data.performance.firstContentfulPaint)}ms</td>
                                <td>${data.performance.firstContentfulPaint < 1500 ? '✅ 우수' : data.performance.firstContentfulPaint < 2500 ? '⚠️ 보통' : '❌ 개선필요'}</td>
                            </tr>
                        </table>
                    `
                        : ''
                    }
                    
                    ${
                      data.mobileTests
                        ? `
                        <h3>모바일 특화 테스트</h3>
                        <ul>
                            <li>터치 지원: ${data.mobileTests.touchSupport ? '✅' : '❌'}</li>
                            <li>패턴 가시성: ${data.mobileTests.patternVisibility.filter((p) => p.visible).length}/${data.mobileTests.patternVisibility.length} 요소</li>
                            <li>스크롤 성능: ${Math.round(data.mobileTests.scrollPerformance)}ms</li>
                        </ul>
                    `
                        : ''
                    }
                `
                    : `
                    <div class="recommendation">
                        <strong>오류:</strong> ${data.error}
                    </div>
                `
                }
            </div>
        `
          )
          .join('')}

        ${
          this.results.summary.recommendations && this.results.summary.recommendations.length > 0
            ? `
            <div class="browser-card">
                <h2>💡 개선 권장사항</h2>
                ${this.results.summary.recommendations
                  .map(
                    (rec) => `
                    <div class="recommendation">
                        <strong>[${rec.browser}]</strong> ${rec.issue}<br>
                        <strong>해결방안:</strong> ${rec.solution}
                    </div>
                `
                  )
                  .join('')}
            </div>
        `
            : ''
        }
    </div>
</body>
</html>`;

    fs.writeFileSync('browser-compatibility-report.html', reportHtml);
    console.log('📊 브라우저 호환성 보고서 생성: browser-compatibility-report.html');
  }

  async run() {
    try {
      console.log('🚀 브라우저 호환성 테스트 시작...');

      await this.testChrome();
      await this.testMobileChrome();

      this.generateCompatibilityReport();
      await this.generateHtmlReport();

      // JSON 보고서도 저장
      fs.writeFileSync('browser-compatibility-report.json', JSON.stringify(this.results, null, 2));

      console.log('\n✅ 브라우저 호환성 테스트 완료!');
      console.log(`📊 호환성 점수: ${this.results.summary.compatibilityRate}%`);
      console.log(`🧪 테스트 브라우저: ${this.results.summary.totalTests}개`);
      console.log(`✅ 통과: ${this.results.summary.passedTests}개`);
      console.log(`❌ 실패: ${this.results.summary.failedTests}개`);
    } catch (error) {
      console.error('❌ 테스트 실행 중 오류:', error);
    }
  }
}

// 실행
const tester = new BrowserCompatibilityTester();
tester.run().catch(console.error);

export default BrowserCompatibilityTester;
