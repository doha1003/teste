import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

// 26개 전체 페이지 목록 (기존 체크리스트 사용)
const pages = [
  // 홈
  { name: '홈페이지', url: 'https://doha.kr/', type: 'static' },
  
  // 심리테스트 (10개)
  { name: '심리테스트 메인', url: 'https://doha.kr/tests/', type: 'static' },
  { name: 'MBTI 소개', url: 'https://doha.kr/tests/mbti/', type: 'static' },
  { name: 'MBTI 테스트', url: 'https://doha.kr/tests/mbti/test.html', type: 'interactive' },
  { name: 'MBTI 결과', url: 'https://doha.kr/tests/mbti/result.html', type: 'result' },
  { name: 'Teto-Egen 소개', url: 'https://doha.kr/tests/teto-egen/', type: 'static' },
  { name: 'Teto-Egen 테스트', url: 'https://doha.kr/tests/teto-egen/test.html', type: 'interactive' },
  { name: 'Teto-Egen 결과', url: 'https://doha.kr/tests/teto-egen/result.html', type: 'result' },
  { name: 'Love DNA 소개', url: 'https://doha.kr/tests/love-dna/', type: 'static' },
  { name: 'Love DNA 테스트', url: 'https://doha.kr/tests/love-dna/test.html', type: 'interactive' },
  { name: 'Love DNA 결과', url: 'https://doha.kr/tests/love-dna/result.html', type: 'result' },
  
  // 운세 (6개)
  { name: '운세 메인', url: 'https://doha.kr/fortune/', type: 'static' },
  { name: '오늘의 운세', url: 'https://doha.kr/fortune/daily/', type: 'api' },
  { name: 'AI 사주팔자', url: 'https://doha.kr/fortune/saju/', type: 'api' },
  { name: 'AI 타로 리딩', url: 'https://doha.kr/fortune/tarot/', type: 'api' },
  { name: '별자리 운세', url: 'https://doha.kr/fortune/zodiac/', type: 'api' },
  { name: '띠별 운세', url: 'https://doha.kr/fortune/zodiac-animal/', type: 'api' },
  
  // 실용도구 (4개)
  { name: '실용도구 메인', url: 'https://doha.kr/tools/', type: 'static' },
  { name: 'BMI 계산기', url: 'https://doha.kr/tools/bmi/', type: 'calculator' },
  { name: '글자수 세기', url: 'https://doha.kr/tools/text-counter.html', type: 'calculator' },
  { name: '연봉계산기', url: 'https://doha.kr/tools/salary-calculator.html', type: 'calculator' },
  
  // 기타 (5개)
  { name: '소개 페이지', url: 'https://doha.kr/about.html', type: 'static' },
  { name: '문의하기', url: 'https://doha.kr/contact.html', type: 'static' },
  { name: 'FAQ', url: 'https://doha.kr/faq.html', type: 'static' },
  { name: '개인정보처리방침', url: 'https://doha.kr/privacy.html', type: 'static' },
  { name: '이용약관', url: 'https://doha.kr/terms.html', type: 'static' }
];

const SCREENSHOTS_DIR = 'comprehensive-test-screenshots';

class ComprehensiveTestRunner {
  constructor() {
    this.browser = null;
    this.results = [];
    this.startTime = Date.now();
  }

  async init() {
    console.log('🚀 종합 크로스브라우저 테스트 시작...\n');
    
    // 스크린샷 디렉토리 생성
    try {
      await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
    } catch (e) { /* 디렉토리가 이미 존재 */ }

    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
  }

  async testPage(pageInfo, index) {
    const { name, url, type } = pageInfo;
    console.log(`\n[${index + 1}/26] 🔍 ${name} 테스트 중...`);
    console.log(`URL: ${url}`);
    console.log(`Type: ${type}`);

    const page = await this.browser.newPage();
    
    // 에러 수집 배열
    const consoleErrors = [];
    const networkErrors = [];
    const pageErrors = [];
    const warnings = [];

    // 콘솔 메시지 수집
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push({
          type: 'console',
          message: text,
          location: msg.location()
        });
      } else if (msg.type() === 'warning') {
        warnings.push({
          type: 'warning', 
          message: text
        });
      }
    });

    // 페이지 에러 수집
    page.on('pageerror', error => {
      pageErrors.push({
        type: 'javascript',
        message: error.message,
        stack: error.stack
      });
    });

    // 네트워크 에러 수집
    page.on('response', response => {
      if (!response.ok() && response.status() !== 304) {
        networkErrors.push({
          type: 'network',
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    let testResult = {
      name,
      url,
      type,
      timestamp: new Date().toISOString(),
      success: false,
      errors: {
        console: consoleErrors,
        network: networkErrors,
        page: pageErrors,
        warnings: warnings
      },
      metrics: {},
      screenshots: {},
      interactions: {}
    };

    try {
      // 페이지 로드
      console.log(`   📄 페이지 로딩...`);
      const loadStart = Date.now();
      
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      const loadTime = Date.now() - loadStart;
      console.log(`   ⏱️  로드 시간: ${loadTime}ms`);

      // 페이지 로드 후 잠시 대기
      await new Promise(r => setTimeout(r, 2000));

      // 기본 페이지 정보 수집
      const pageInfo = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          hasContent: document.body && document.body.innerText.length > 100,
          contentLength: document.body ? document.body.innerText.length : 0,
          hasCSS: document.styleSheets.length > 0,
          hasJS: document.scripts.length > 0,
          fontFamily: window.getComputedStyle(document.body).fontFamily,
          isPretendard: window.getComputedStyle(document.body).fontFamily.includes('Pretendard'),
          hasKorean: /[가-힣]/.test(document.body.innerText),
          buttonsCount: document.querySelectorAll('button, .btn').length,
          formsCount: document.querySelectorAll('form').length,
          linksCount: document.querySelectorAll('a[href]').length,
          imagesTotal: document.images.length,
          imagesLoaded: Array.from(document.images).filter(img => img.complete && img.naturalHeight !== 0).length,
          imagesBroken: Array.from(document.images).filter(img => !img.complete || img.naturalHeight === 0).length,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        };
      });

      testResult.metrics = {
        loadTime,
        ...pageInfo
      };

      // 스크린샷 촬영 (데스크톱)
      console.log(`   📸 데스크톱 스크린샷 촬영...`);
      await page.setViewport({ width: 1920, height: 1080 });
      await new Promise(r => setTimeout(r, 1000));
      const desktopScreenshot = `${SCREENSHOTS_DIR}/${name}-desktop.png`;
      await page.screenshot({ 
        path: desktopScreenshot, 
        fullPage: true
      });
      testResult.screenshots.desktop = desktopScreenshot;

      // 스크린샷 촬영 (모바일)
      console.log(`   📱 모바일 스크린샷 촬영...`);
      await page.setViewport({ width: 375, height: 667 });
      await new Promise(r => setTimeout(r, 1000));
      const mobileScreenshot = `${SCREENSHOTS_DIR}/${name}-mobile.png`;
      await page.screenshot({ 
        path: mobileScreenshot, 
        fullPage: true
      });
      testResult.screenshots.mobile = mobileScreenshot;

      // 타입별 상세 테스트
      await this.performTypeSpecificTests(page, type, testResult);

      // 접근성 및 성능 기본 체크
      await this.performAccessibilityCheck(page, testResult);

      testResult.success = true;
      
      // 상태 판정
      const totalErrors = consoleErrors.length + networkErrors.length + pageErrors.length;
      let status = '✅ 정상';
      
      if (totalErrors > 5) {
        status = '❌ 심각';
      } else if (totalErrors > 0) {
        status = '⚠️ 경고';
      } else if (!pageInfo.hasContent && type !== 'error' && type !== 'result') {
        status = '❌ 빈페이지';
      } else if (!pageInfo.isPretendard) {
        status = '⚠️ 폰트미적용';
      }

      console.log(`   ${status} - 오류: ${totalErrors}개 (콘솔: ${consoleErrors.length}, 네트워크: ${networkErrors.length}, JS: ${pageErrors.length})`);

    } catch (error) {
      console.log(`   ❌ 테스트 실패: ${error.message}`);
      testResult.success = false;
      testResult.error = {
        message: error.message,
        stack: error.stack
      };
    } finally {
      await page.close();
    }

    return testResult;
  }

  async performTypeSpecificTests(page, type, result) {
    console.log(`   🎯 ${type} 타입별 테스트 수행...`);
    
    switch (type) {
      case 'interactive':
        await this.testInteractiveFeatures(page, result);
        break;
      case 'api':
        await this.testAPIFeatures(page, result);
        break;
      case 'calculator':
        await this.testCalculatorFeatures(page, result);
        break;
      case 'result':
        await this.testResultPageFeatures(page, result);
        break;
      default:
        await this.testBasicFeatures(page, result);
    }
  }

  async testInteractiveFeatures(page, result) {
    try {
      // 버튼 클릭 테스트
      const buttons = await page.$$('button:not([disabled])');
      result.interactions.buttonsClickable = buttons.length;
      
      if (buttons.length > 0) {
        // 첫 번째 버튼 클릭 테스트
        await buttons[0].click();
        await new Promise(r => setTimeout(r, 500));
        result.interactions.firstButtonClicked = true;
      }

      // 폼 요소 테스트
      const inputs = await page.$$('input, select, textarea');
      result.interactions.formElementsCount = inputs.length;

      if (inputs.length > 0) {
        // 첫 번째 입력 필드에 테스트 값 입력
        const firstInput = inputs[0];
        const inputType = await firstInput.evaluate(el => el.type);
        
        if (inputType === 'text' || inputType === 'email') {
          await firstInput.type('테스트');
          result.interactions.inputTested = true;
        } else if (inputType === 'radio') {
          await firstInput.click();
          result.interactions.radioTested = true;
        }
      }

    } catch (error) {
      result.interactions.error = error.message;
    }
  }

  async testAPIFeatures(page, result) {
    try {
      // API 기반 페이지의 폼 제출 테스트
      const forms = await page.$$('form');
      result.interactions.formsCount = forms.length;

      if (forms.length > 0) {
        // 필수 입력 필드 채우기
        const nameInput = await page.$('input[name="name"], input[placeholder*="이름"]');
        const birthInput = await page.$('input[name="birth"], input[type="date"]');
        const genderSelect = await page.$('select[name="gender"]');

        if (nameInput) {
          await nameInput.type('테스트유저');
          result.interactions.nameInputFilled = true;
        }

        if (birthInput) {
          await birthInput.type('1990-01-01');
          result.interactions.birthInputFilled = true;
        }

        if (genderSelect) {
          await genderSelect.select('male');
          result.interactions.genderSelected = true;
        }

        // 제출 버튼 찾기 및 클릭 준비
        const submitButton = await page.$('button[type="submit"], .submit-btn');
        if (submitButton) {
          result.interactions.submitButtonFound = true;
          // 실제 제출은 하지 않음 (API 부하 방지)
        }
      }

    } catch (error) {
      result.interactions.error = error.message;
    }
  }

  async testCalculatorFeatures(page, result) {
    try {
      // 계산기 기능 테스트
      const inputs = await page.$$('input[type="number"], input[type="text"]');
      result.interactions.calculatorInputs = inputs.length;

      if (inputs.length >= 2) {
        // BMI 계산기의 경우
        if (page.url().includes('bmi')) {
          const heightInput = await page.$('input[name="height"], #height');
          const weightInput = await page.$('input[name="weight"], #weight');
          
          if (heightInput && weightInput) {
            await heightInput.type('170');
            await weightInput.type('65');
            result.interactions.bmiInputsFilled = true;

            const calculateBtn = await page.$('button:contains("계산"), .calculate-btn');
            if (calculateBtn) {
              await calculateBtn.click();
              await new Promise(r => setTimeout(r, 1000));
              result.interactions.bmiCalculated = true;
            }
          }
        }

        // 글자수 세기의 경우
        if (page.url().includes('text-counter')) {
          const textarea = await page.$('textarea');
          if (textarea) {
            await textarea.type('안녕하세요. 글자수 테스트입니다.');
            await new Promise(r => setTimeout(r, 500));
            result.interactions.textCounterTested = true;
          }
        }
      }

    } catch (error) {
      result.interactions.error = error.message;
    }
  }

  async testResultPageFeatures(page, result) {
    try {
      // 결과 페이지는 URL 파라미터나 localStorage가 필요할 수 있음
      const hasResults = await page.evaluate(() => {
        const resultContent = document.querySelector('.result-content, .test-result, #result');
        return resultContent && resultContent.innerText.length > 50;
      });

      result.interactions.hasResultContent = hasResults;

      // 공유 버튼 테스트
      const shareButtons = await page.$$('.share-btn, .btn-share');
      result.interactions.shareButtonsCount = shareButtons.length;

      // 다시하기 버튼 테스트
      const retryButtons = await page.$$('.retry-btn, .btn-retry');
      result.interactions.retryButtonsCount = retryButtons.length;

    } catch (error) {
      result.interactions.error = error.message;
    }
  }

  async testBasicFeatures(page, result) {
    try {
      // 기본 네비게이션 테스트
      const navLinks = await page.$$('nav a, .nav-link');
      result.interactions.navigationLinksCount = navLinks.length;

      // 메뉴 토글 테스트 (모바일)
      const menuToggle = await page.$('.menu-toggle, .hamburger');
      if (menuToggle) {
        await menuToggle.click();
        await new Promise(r => setTimeout(r, 500));
        result.interactions.menuToggleTested = true;
      }

    } catch (error) {
      result.interactions.error = error.message;
    }
  }

  async performAccessibilityCheck(page, result) {
    try {
      const a11yChecks = await page.evaluate(() => {
        return {
          hasLangAttribute: !!document.documentElement.lang,
          hasMetaViewport: !!document.querySelector('meta[name="viewport"]'),
          hasSkipLinks: !!document.querySelector('a[href="#main"], .skip-link'),
          imagesWithoutAlt: Array.from(document.images).filter(img => !img.alt).length,
          buttonsWithoutText: Array.from(document.querySelectorAll('button')).filter(btn => 
            !btn.textContent.trim() && !btn.getAttribute('aria-label')
          ).length,
          headingStructure: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.tagName),
          colorContrast: getComputedStyle(document.body).color !== getComputedStyle(document.body).backgroundColor
        };
      });

      result.accessibility = a11yChecks;

    } catch (error) {
      result.accessibility = { error: error.message };
    }
  }

  async runAllTests() {
    await this.init();

    console.log(`📋 총 ${pages.length}개 페이지 테스트 예정\n`);

    for (let i = 0; i < pages.length; i++) {
      const result = await this.testPage(pages[i], i);
      this.results.push(result);
      
      // 진행률 표시
      const progress = Math.round(((i + 1) / pages.length) * 100);
      console.log(`   📊 진행률: ${progress}% (${i + 1}/${pages.length})\n`);
    }

    await this.generateReport();
    await this.browser.close();
  }

  async generateReport() {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;

    const summary = {
      testInfo: {
        timestamp: new Date().toISOString(),
        totalTime: `${Math.round(totalTime / 1000)}초`,
        totalPages: pages.length
      },
      stats: {
        success: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        withErrors: this.results.filter(r => {
          const total = r.errors.console.length + r.errors.network.length + r.errors.page.length;
          return total > 0;
        }).length,
        withCriticalErrors: this.results.filter(r => {
          const total = r.errors.console.length + r.errors.network.length + r.errors.page.length;
          return total > 5;
        }).length
      },
      results: this.results
    };

    // JSON 보고서 저장
    const reportFile = `comprehensive-test-report-${Date.now()}.json`;
    await fs.writeFile(reportFile, JSON.stringify(summary, null, 2));

    // HTML 보고서 생성
    await this.generateHTMLReport(summary);

    // 콘솔 요약 출력
    this.printSummary(summary);

    console.log(`\n📄 상세 보고서: ${reportFile}`);
    console.log(`📄 HTML 보고서: comprehensive-test-report.html`);
    console.log(`📁 스크린샷: ${SCREENSHOTS_DIR}/`);
  }

  async generateHTMLReport(summary) {
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>doha.kr 종합 테스트 보고서</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; line-height: 1.6; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: white; border: 1px solid #e9ecef; padding: 15px; border-radius: 6px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #495057; }
        .page-result { border: 1px solid #dee2e6; margin: 10px 0; border-radius: 6px; overflow: hidden; }
        .page-header { padding: 15px; background: #f8f9fa; cursor: pointer; }
        .page-details { padding: 15px; display: none; background: white; }
        .error-list { background: #fff5f5; border-left: 4px solid #e53e3e; padding: 10px; margin: 10px 0; }
        .success { border-left-color: #38a169; background-color: #f0fff4; }
        .warning { border-left-color: #d69e2e; background-color: #fffbeb; }
        .screenshots img { max-width: 300px; margin: 10px; border: 1px solid #ddd; }
        .toggle-btn { background: none; border: none; font-size: 1.2em; cursor: pointer; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 doha.kr 종합 테스트 보고서</h1>
        <p>생성일시: ${summary.testInfo.timestamp}</p>
        <p>소요시간: ${summary.testInfo.totalTime}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number" style="color: #38a169;">${summary.stats.success}</div>
            <div>성공</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" style="color: #e53e3e;">${summary.stats.failed}</div>
            <div>실패</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" style="color: #d69e2e;">${summary.stats.withErrors}</div>
            <div>오류 있음</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" style="color: #e53e3e;">${summary.stats.withCriticalErrors}</div>
            <div>심각한 오류</div>
        </div>
    </div>

    <h2>📋 페이지별 결과</h2>
    ${summary.results.map((result, index) => {
      const totalErrors = result.errors.console.length + result.errors.network.length + result.errors.page.length;
      const statusIcon = result.success ? (totalErrors > 5 ? '❌' : totalErrors > 0 ? '⚠️' : '✅') : '💥';
      
      return `
      <div class="page-result">
        <div class="page-header" onclick="toggleDetails(${index})">
          <button class="toggle-btn" id="toggle-${index}">▼</button>
          ${statusIcon} <strong>${result.name}</strong>
          <span style="color: #666;">- 오류: ${totalErrors}개</span>
          <small style="float: right;">${result.url}</small>
        </div>
        <div class="page-details" id="details-${index}">
          ${result.error ? `<div class="error-list"><strong>테스트 실패:</strong> ${result.error.message}</div>` : ''}
          
          ${result.errors.console.length > 0 ? `
          <div class="error-list">
            <strong>콘솔 오류 (${result.errors.console.length}개):</strong>
            <ul>${result.errors.console.map(err => `<li>${err.message}</li>`).join('')}</ul>
          </div>` : ''}
          
          ${result.errors.network.length > 0 ? `
          <div class="error-list">
            <strong>네트워크 오류 (${result.errors.network.length}개):</strong>
            <ul>${result.errors.network.map(err => `<li>${err.status} - ${err.url}</li>`).join('')}</ul>
          </div>` : ''}
          
          ${result.errors.page.length > 0 ? `
          <div class="error-list">
            <strong>JavaScript 오류 (${result.errors.page.length}개):</strong>
            <ul>${result.errors.page.map(err => `<li>${err.message}</li>`).join('')}</ul>
          </div>` : ''}
          
          ${result.metrics ? `
          <div class="success">
            <strong>페이지 정보:</strong>
            <ul>
              <li>제목: ${result.metrics.title}</li>
              <li>로드 시간: ${result.metrics.loadTime}ms</li>
              <li>콘텐츠 길이: ${result.metrics.contentLength}자</li>
              <li>폰트: ${result.metrics.isPretendard ? '✅ Pretendard' : '❌ Pretendard 미적용'}</li>
              <li>버튼: ${result.metrics.buttonsCount}개, 링크: ${result.metrics.linksCount}개</li>
              <li>이미지: ${result.metrics.imagesLoaded}/${result.metrics.imagesTotal}개 로드됨</li>
            </ul>
          </div>` : ''}
          
          ${result.screenshots ? `
          <div class="screenshots">
            <h4>스크린샷:</h4>
            <img src="${result.screenshots.desktop}" alt="데스크톱 스크린샷" title="데스크톱">
            <img src="${result.screenshots.mobile}" alt="모바일 스크린샷" title="모바일">
          </div>` : ''}
        </div>
      </div>
      `;
    }).join('')}

    <script>
      function toggleDetails(index) {
        const details = document.getElementById('details-' + index);
        const toggle = document.getElementById('toggle-' + index);
        if (details.style.display === 'none' || details.style.display === '') {
          details.style.display = 'block';
          toggle.textContent = '▲';
        } else {
          details.style.display = 'none';
          toggle.textContent = '▼';
        }
      }
    </script>
</body>
</html>`;

    await fs.writeFile('comprehensive-test-report.html', html);
  }

  printSummary(summary) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 종합 테스트 완료');
    console.log('='.repeat(80));
    console.log(`⏱️  총 소요시간: ${summary.testInfo.totalTime}`);
    console.log(`📄 총 페이지: ${summary.testInfo.totalPages}개`);
    console.log(`✅ 성공: ${summary.stats.success}개`);
    console.log(`❌ 실패: ${summary.stats.failed}개`);
    console.log(`⚠️  오류 있음: ${summary.stats.withErrors}개`);
    console.log(`🚨 심각한 오류: ${summary.stats.withCriticalErrors}개`);

    // 심각한 문제가 있는 페이지 목록
    const criticalPages = this.results.filter(r => {
      const total = r.errors.console.length + r.errors.network.length + r.errors.page.length;
      return total > 5 || !r.success;
    });

    if (criticalPages.length > 0) {
      console.log('\n🚨 즉시 수정이 필요한 페이지:');
      criticalPages.forEach(page => {
        const total = page.errors.console.length + page.errors.network.length + page.errors.page.length;
        console.log(`   - ${page.name}: ${total}개 오류`);
      });
    }

    console.log('\n✅ 테스트 완료!');
  }
}

// 실행
const testRunner = new ComprehensiveTestRunner();
testRunner.runAllTests().catch(console.error);