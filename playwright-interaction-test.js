import { chromium, firefox, webkit } from 'playwright';
import fs from 'fs/promises';

const BROWSERS = ['chromium']; // 빠른 테스트를 위해 chromium만 사용
const SCREENSHOTS_DIR = 'playwright-test-screenshots';

// 핵심 인터랙션 테스트 페이지들
const interactionPages = [
  { 
    name: 'MBTI 테스트', 
    url: 'https://doha.kr/tests/mbti/test.html',
    interactions: ['startTest', 'answerQuestions', 'submitTest']
  },
  { 
    name: 'AI 타로 리딩', 
    url: 'https://doha.kr/fortune/tarot/',
    interactions: ['selectCards', 'submitForm']
  },
  { 
    name: '오늘의 운세', 
    url: 'https://doha.kr/fortune/daily/',
    interactions: ['fillUserInfo', 'submitFortune']
  },
  { 
    name: 'BMI 계산기', 
    url: 'https://doha.kr/tools/bmi/',
    interactions: ['inputHeight', 'inputWeight', 'calculate']
  },
  { 
    name: '글자수 세기', 
    url: 'https://doha.kr/tools/text-counter.html',
    interactions: ['inputText', 'countCharacters']
  }
];

class PlaywrightInteractionTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async init() {
    console.log('🎭 Playwright 인터랙션 테스트 시작...\n');
    
    try {
      await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
    } catch (e) { /* 디렉토리가 이미 존재 */ }
  }

  async testPageInteractions(pageInfo, browser, browserName) {
    const { name, url, interactions } = pageInfo;
    console.log(`\n🔍 [${browserName}] ${name} 인터랙션 테스트...`);

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'ko-KR',
      timezoneId: 'Asia/Seoul'
    });

    const page = await context.newPage();
    
    const errors = [];
    const testResult = {
      page: name,
      url,
      browser: browserName,
      timestamp: new Date().toISOString(),
      success: false,
      interactions: {},
      errors: [],
      screenshots: []
    };

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

    page.on('pageerror', error => {
      errors.push({
        type: 'javascript',
        message: error.message,
        stack: error.stack
      });
    });

    try {
      // 페이지 로드
      console.log(`   📄 페이지 로딩...`);
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // 초기 스크린샷
      const initialScreenshot = `${SCREENSHOTS_DIR}/${name}-${browserName}-initial.png`;
      await page.screenshot({ path: initialScreenshot, fullPage: true });
      testResult.screenshots.push(initialScreenshot);

      // 페이지별 인터랙션 테스트
      await this.performPageSpecificInteractions(page, name, testResult);

      // 최종 스크린샷
      const finalScreenshot = `${SCREENSHOTS_DIR}/${name}-${browserName}-final.png`;
      await page.screenshot({ path: finalScreenshot, fullPage: true });
      testResult.screenshots.push(finalScreenshot);

      testResult.success = errors.length === 0;
      testResult.errors = errors;

      const status = errors.length === 0 ? '✅ 성공' : `⚠️ ${errors.length}개 오류`;
      console.log(`   ${status}`);

    } catch (error) {
      console.log(`   ❌ 실패: ${error.message}`);
      testResult.success = false;
      testResult.errors.push({
        type: 'test-error',
        message: error.message,
        stack: error.stack
      });
    } finally {
      await context.close();
    }

    return testResult;
  }

  async performPageSpecificInteractions(page, pageName, result) {
    switch (pageName) {
      case 'MBTI 테스트':
        await this.testMBTI(page, result);
        break;
      case 'AI 타로 리딩':
        await this.testTarot(page, result);
        break;
      case '오늘의 운세':
        await this.testDailyFortune(page, result);
        break;
      case 'BMI 계산기':
        await this.testBMICalculator(page, result);
        break;
      case '글자수 세기':
        await this.testTextCounter(page, result);
        break;
    }
  }

  async testMBTI(page, result) {
    console.log(`     🧠 MBTI 테스트 시나리오 실행...`);
    
    try {
      // 테스트 시작 버튼 클릭
      const startButton = page.locator('button:has-text("시작"), .start-btn, .btn-start');
      if (await startButton.count() > 0) {
        await startButton.first().click();
        await page.waitForTimeout(1000);
        result.interactions.testStarted = true;
        console.log(`       ✅ 테스트 시작`);
      }

      // 질문에 답변하기 (첫 5개 질문만)
      for (let i = 0; i < 5; i++) {
        const radioButtons = page.locator('input[type="radio"]');
        const count = await radioButtons.count();
        
        if (count > i * 2) {
          await radioButtons.nth(i * 2).click(); // 첫 번째 선택지 선택
          await page.waitForTimeout(500);
          result.interactions[`question_${i + 1}_answered`] = true;
        }
      }

      // 다음 버튼 클릭
      const nextButton = page.locator('button:has-text("다음"), .next-btn, .btn-next');
      if (await nextButton.count() > 0) {
        await nextButton.first().click();
        await page.waitForTimeout(1000);
        result.interactions.nextButtonClicked = true;
        console.log(`       ✅ 다음 버튼 클릭`);
      }

      // 결과 확인
      const resultContent = page.locator('.result, .test-result, #result');
      if (await resultContent.count() > 0) {
        result.interactions.resultDisplayed = true;
        console.log(`       ✅ 결과 표시됨`);
      }

    } catch (error) {
      result.interactions.error = error.message;
      console.log(`       ❌ MBTI 테스트 오류: ${error.message}`);
    }
  }

  async testTarot(page, result) {
    console.log(`     🔮 타로 카드 테스트 시나리오 실행...`);
    
    try {
      // 카드 클릭
      const cards = page.locator('.card, .tarot-card, [data-card]');
      const cardCount = await cards.count();
      
      if (cardCount > 0) {
        // 첫 번째 카드 클릭
        await cards.first().click();
        await page.waitForTimeout(1000);
        result.interactions.cardSelected = true;
        console.log(`       ✅ 카드 선택됨 (총 ${cardCount}개 카드)`);
      }

      // 폼 입력
      const nameInput = page.locator('input[name="name"], input[placeholder*="이름"]');
      if (await nameInput.count() > 0) {
        await nameInput.fill('테스트유저');
        result.interactions.nameEntered = true;
        console.log(`       ✅ 이름 입력`);
      }

      const questionInput = page.locator('textarea, input[name="question"]');
      if (await questionInput.count() > 0) {
        await questionInput.fill('오늘의 운세는 어떨까요?');
        result.interactions.questionEntered = true;
        console.log(`       ✅ 질문 입력`);
      }

      // 제출 버튼 클릭 (실제로는 클릭하지 않음 - API 부하 방지)
      const submitButton = page.locator('button[type="submit"], .submit-btn');
      if (await submitButton.count() > 0) {
        result.interactions.submitButtonFound = true;
        console.log(`       ✅ 제출 버튼 발견`);
        // await submitButton.click(); // 실제 제출은 하지 않음
      }

    } catch (error) {
      result.interactions.error = error.message;
      console.log(`       ❌ 타로 테스트 오류: ${error.message}`);
    }
  }

  async testDailyFortune(page, result) {
    console.log(`     🌟 일일 운세 테스트 시나리오 실행...`);
    
    try {
      // 이름 입력
      const nameInput = page.locator('input[name="name"], input[placeholder*="이름"]');
      if (await nameInput.count() > 0) {
        await nameInput.fill('테스트유저');
        result.interactions.nameEntered = true;
        console.log(`       ✅ 이름 입력`);
      }

      // 생년월일 입력
      const birthInput = page.locator('input[type="date"], input[name="birth"]');
      if (await birthInput.count() > 0) {
        await birthInput.fill('1990-01-01');
        result.interactions.birthEntered = true;
        console.log(`       ✅ 생년월일 입력`);
      }

      // 성별 선택
      const genderSelect = page.locator('select[name="gender"], input[name="gender"]');
      if (await genderSelect.count() > 0) {
        const elementType = await genderSelect.first().evaluate(el => el.tagName.toLowerCase());
        if (elementType === 'select') {
          await genderSelect.selectOption('male');
        } else {
          await genderSelect.first().click();
        }
        result.interactions.genderSelected = true;
        console.log(`       ✅ 성별 선택`);
      }

      // 시간 입력 (선택사항)
      const timeInput = page.locator('input[type="time"], input[name="time"]');
      if (await timeInput.count() > 0) {
        await timeInput.fill('09:30');
        result.interactions.timeEntered = true;
        console.log(`       ✅ 시간 입력`);
      }

      // 제출 버튼 확인 (실제 제출은 하지 않음)
      const submitButton = page.locator('button[type="submit"], .submit-btn');
      if (await submitButton.count() > 0) {
        result.interactions.submitButtonFound = true;
        console.log(`       ✅ 제출 버튼 발견`);
      }

    } catch (error) {
      result.interactions.error = error.message;
      console.log(`       ❌ 일일운세 테스트 오류: ${error.message}`);
    }
  }

  async testBMICalculator(page, result) {
    console.log(`     📏 BMI 계산기 테스트 시나리오 실행...`);
    
    try {
      // 키 입력
      const heightInput = page.locator('input[name="height"], #height, input[placeholder*="키"]');
      if (await heightInput.count() > 0) {
        await heightInput.fill('170');
        result.interactions.heightEntered = true;
        console.log(`       ✅ 키 입력 (170cm)`);
      }

      // 몸무게 입력
      const weightInput = page.locator('input[name="weight"], #weight, input[placeholder*="몸무게"]');
      if (await weightInput.count() > 0) {
        await weightInput.fill('65');
        result.interactions.weightEntered = true;
        console.log(`       ✅ 몸무게 입력 (65kg)`);
      }

      // 계산 버튼 클릭 (더 구체적인 선택자 사용)
      const calculateButton = page.locator('button[type="submit"][data-action="calculate"]');
      if (await calculateButton.count() > 0) {
        await calculateButton.click();
        await page.waitForTimeout(1000);
        result.interactions.calculationPerformed = true;
        console.log(`       ✅ 계산 수행`);

        // 결과 확인
        const resultElement = page.locator('.result, .bmi-result, #result');
        if (await resultElement.count() > 0) {
          const resultText = await resultElement.first().textContent();
          result.interactions.resultDisplayed = true;
          result.interactions.resultText = resultText?.substring(0, 100); // 처음 100자만
          console.log(`       ✅ 결과 표시: ${resultText?.substring(0, 50)}...`);
        }
      }

    } catch (error) {
      result.interactions.error = error.message;
      console.log(`       ❌ BMI 계산기 오류: ${error.message}`);
    }
  }

  async testTextCounter(page, result) {
    console.log(`     📝 글자수 세기 테스트 시나리오 실행...`);
    
    try {
      const testText = '안녕하세요. 이것은 글자수 테스트입니다. 한글과 영어 English 123 숫자가 포함되어 있습니다.';
      
      // 텍스트 영역에 입력
      const textarea = page.locator('textarea, .text-input');
      if (await textarea.count() > 0) {
        await textarea.fill(testText);
        await page.waitForTimeout(500);
        result.interactions.textEntered = true;
        console.log(`       ✅ 텍스트 입력 (${testText.length}자)`);

        // 글자수 확인
        const charCount = page.locator('.char-count, .character-count, #charCount');
        if (await charCount.count() > 0) {
          const countText = await charCount.first().textContent();
          result.interactions.charCountDisplayed = true;
          result.interactions.displayedCount = countText;
          console.log(`       ✅ 글자수 표시: ${countText}`);
        }

        // 단어수 확인
        const wordCount = page.locator('.word-count, #wordCount');
        if (await wordCount.count() > 0) {
          const wordText = await wordCount.first().textContent();
          result.interactions.wordCountDisplayed = true;
          result.interactions.displayedWordCount = wordText;
          console.log(`       ✅ 단어수 표시: ${wordText}`);
        }
      }

      // 초기화 버튼 테스트
      const clearButton = page.locator('button:has-text("초기화"), .clear-btn, .btn-clear');
      if (await clearButton.count() > 0) {
        await clearButton.click();
        await page.waitForTimeout(500);
        result.interactions.textCleared = true;
        console.log(`       ✅ 텍스트 초기화`);
      }

    } catch (error) {
      result.interactions.error = error.message;
      console.log(`       ❌ 글자수 세기 오류: ${error.message}`);
    }
  }

  async runAllTests() {
    await this.init();

    for (const browserName of BROWSERS) {
      console.log(`\n🌐 ${browserName.toUpperCase()} 브라우저 테스트 시작`);
      
      let browser;
      try {
        switch (browserName) {
          case 'chromium':
            browser = await chromium.launch({ headless: true });
            break;
          case 'firefox':
            browser = await firefox.launch({ headless: true });
            break;
          case 'webkit':
            browser = await webkit.launch({ headless: true });
            break;
        }

        for (const pageInfo of interactionPages) {
          const result = await this.testPageInteractions(pageInfo, browser, browserName);
          this.results.push(result);
        }

      } catch (error) {
        console.log(`❌ ${browserName} 브라우저 실행 실패: ${error.message}`);
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    }

    await this.generateReport();
  }

  async generateReport() {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;

    const summary = {
      testInfo: {
        timestamp: new Date().toISOString(),
        totalTime: `${Math.round(totalTime / 1000)}초`,
        totalTests: this.results.length,
        browsers: BROWSERS
      },
      stats: {
        successful: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        withErrors: this.results.filter(r => r.errors.length > 0).length
      },
      results: this.results
    };

    // JSON 보고서 저장
    const reportFile = `playwright-interaction-report-${Date.now()}.json`;
    await fs.writeFile(reportFile, JSON.stringify(summary, null, 2));

    // HTML 보고서 생성
    await this.generateHTMLReport(summary);

    // 콘솔 요약 출력
    console.log('\n' + '='.repeat(60));
    console.log('🎭 Playwright 인터랙션 테스트 완료');
    console.log('='.repeat(60));
    console.log(`⏱️  소요시간: ${summary.testInfo.totalTime}`);
    console.log(`📄 총 테스트: ${summary.testInfo.totalTests}개`);
    console.log(`✅ 성공: ${summary.stats.successful}개`);
    console.log(`❌ 실패: ${summary.stats.failed}개`);
    console.log(`⚠️  오류 있음: ${summary.stats.withErrors}개`);

    console.log(`\n📄 상세 보고서: ${reportFile}`);
    console.log(`📄 HTML 보고서: playwright-interaction-report.html`);
    console.log(`📁 스크린샷: ${SCREENSHOTS_DIR}/`);
  }

  async generateHTMLReport(summary) {
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playwright 인터랙션 테스트 보고서</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; line-height: 1.6; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: white; border: 1px solid #e9ecef; padding: 15px; border-radius: 6px; text-align: center; }
        .test-result { border: 1px solid #dee2e6; margin: 10px 0; border-radius: 6px; padding: 15px; }
        .success { border-left: 4px solid #38a169; background-color: #f0fff4; }
        .failed { border-left: 4px solid #e53e3e; background-color: #fff5f5; }
        .interactions { background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .screenshots img { max-width: 300px; margin: 10px; border: 1px solid #ddd; }
        .error-list { background: #fff5f5; border: 1px solid #fed7d7; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎭 Playwright 인터랙션 테스트 보고서</h1>
        <p>생성일시: ${summary.testInfo.timestamp}</p>
        <p>소요시간: ${summary.testInfo.totalTime}</p>
        <p>테스트 브라우저: ${summary.testInfo.browsers.join(', ')}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div style="font-size: 2em; font-weight: bold; color: #38a169;">${summary.stats.successful}</div>
            <div>성공</div>
        </div>
        <div class="stat-card">
            <div style="font-size: 2em; font-weight: bold; color: #e53e3e;">${summary.stats.failed}</div>
            <div>실패</div>
        </div>
        <div class="stat-card">
            <div style="font-size: 2em; font-weight: bold; color: #d69e2e;">${summary.stats.withErrors}</div>
            <div>오류 있음</div>
        </div>
    </div>

    <h2>📋 테스트 결과</h2>
    ${summary.results.map(result => `
      <div class="test-result ${result.success ? 'success' : 'failed'}">
        <h3>${result.success ? '✅' : '❌'} ${result.page} [${result.browser}]</h3>
        <p><strong>URL:</strong> ${result.url}</p>
        <p><strong>테스트 시간:</strong> ${result.timestamp}</p>
        
        ${Object.keys(result.interactions).length > 0 ? `
        <div class="interactions">
          <strong>인터랙션 결과:</strong>
          <ul>
            ${Object.entries(result.interactions).map(([key, value]) => 
              `<li><strong>${key}:</strong> ${value}</li>`
            ).join('')}
          </ul>
        </div>` : ''}
        
        ${result.errors.length > 0 ? `
        <div class="error-list">
          <strong>오류 목록 (${result.errors.length}개):</strong>
          <ul>
            ${result.errors.map(error => `<li>[${error.type}] ${error.message}</li>`).join('')}
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
    `).join('')}
</body>
</html>`;

    await fs.writeFile('playwright-interaction-report.html', html);
  }
}

// 실행
const interactionTester = new PlaywrightInteractionTester();
interactionTester.runAllTests().catch(console.error);