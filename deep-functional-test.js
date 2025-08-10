import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

/**
 * doha.kr 심층 기능 테스트
 * 모든 기능의 실제 작동을 검증
 */

class DeepFunctionalTest {
  constructor() {
    this.baseUrl = 'https://doha.kr';
    this.results = {
      tests: {},
      fortune: {},
      tools: {},
      errors: [],
      screenshots: [],
    };
  }

  async initialize() {
    console.log('🚀 doha.kr 심층 기능 테스트 시작...\n');

    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    this.page = await this.browser.newPage();

    // 콘솔 에러 모니터링
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.results.errors.push({
          type: 'console',
          text: msg.text(),
          location: msg.location(),
        });
      }
    });
  }

  // MBTI 테스트 전체 플로우
  async testMBTIFullFlow() {
    console.log('📝 MBTI 테스트 전체 플로우 시작...');
    const testResult = { name: 'MBTI', status: 'testing', details: {} };

    try {
      // 1. 소개 페이지
      await this.page.goto(`${this.baseUrl}/tests/mbti/`, { waitUntil: 'networkidle2' });
      await this.takeScreenshot('mbti-1-intro');

      // 2. 테스트 페이지로 이동
      const testLink = await this.page.$('a[href="test.html"], .btn-primary');
      if (testLink) {
        await testLink.click();
        await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
        await this.takeScreenshot('mbti-2-test-page');

        // 3. 테스트 시작 버튼 찾기
        const startBtn = await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const startButton = buttons.find(
            (btn) => btn.innerText.includes('시작') || btn.innerText.includes('테스트')
          );
          if (startButton) {
            startButton.click();
            return true;
          }
          return false;
        });

        if (startBtn) {
          await new Promise((r) => setTimeout(r, 2000));
          await this.takeScreenshot('mbti-3-questions');

          // 4. 문항 답변 (모든 문항)
          for (let i = 1; i <= 12; i++) {
            const answered = await this.page.evaluate((qNum) => {
              // 다양한 선택자 시도
              const radios = document.querySelectorAll(`
                                input[name="q${qNum}"],
                                input[name="question${qNum}"],
                                .question-${qNum} input[type="radio"],
                                #q${qNum} input[type="radio"]
                            `);

              if (radios.length > 0) {
                radios[Math.floor(Math.random() * radios.length)].click();
                return true;
              }
              return false;
            }, i);

            if (answered) {
              testResult.details[`question_${i}`] = 'answered';
              await new Promise((r) => setTimeout(r, 100));
            }
          }

          // 5. 제출 버튼
          const submitted = await this.page.evaluate(() => {
            const submitBtns = document.querySelectorAll(
              'button[type="submit"], .btn-submit, button.btn-primary'
            );
            for (const btn of submitBtns) {
              if (btn.innerText.includes('결과') || btn.innerText.includes('제출')) {
                btn.click();
                return true;
              }
            }
            return false;
          });

          if (submitted) {
            await new Promise((r) => setTimeout(r, 3000));
            await this.takeScreenshot('mbti-4-result');

            // 결과 확인
            const resultText = await this.page.evaluate(() => {
              const resultEl = document.querySelector('.result-type, .mbti-type, h1, h2');
              return resultEl ? resultEl.innerText : null;
            });

            testResult.details.result = resultText;
            testResult.status = resultText ? 'success' : 'partial';
          }
        }
      }
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error.message;
    }

    this.results.tests.mbti = testResult;
    console.log(
      `   ${testResult.status === 'success' ? '✅' : '❌'} MBTI 테스트: ${testResult.status}`
    );
  }

  // BMI 계산기 실제 계산 테스트
  async testBMICalculator() {
    console.log('📝 BMI 계산기 테스트...');
    const testResult = { name: 'BMI Calculator', status: 'testing', details: {} };

    try {
      await this.page.goto(`${this.baseUrl}/tools/bmi-calculator.html`, {
        waitUntil: 'networkidle2',
      });
      await this.takeScreenshot('bmi-1-initial');

      // 입력 필드 찾기 - 다양한 선택자 시도
      const heightFilled = await this.page.evaluate(() => {
        const inputs = [
          '#height',
          'input[name="height"]',
          'input[placeholder*="키"]',
          'input[placeholder*="cm"]',
        ];
        for (const selector of inputs) {
          const el = document.querySelector(selector);
          if (el) {
            el.value = '175';
            el.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
          }
        }
        return false;
      });

      const weightFilled = await this.page.evaluate(() => {
        const inputs = [
          '#weight',
          'input[name="weight"]',
          'input[placeholder*="몸무게"]',
          'input[placeholder*="kg"]',
        ];
        for (const selector of inputs) {
          const el = document.querySelector(selector);
          if (el) {
            el.value = '70';
            el.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
          }
        }
        return false;
      });

      if (heightFilled && weightFilled) {
        testResult.details.input = 'Height: 175cm, Weight: 70kg';

        // 계산 버튼 클릭
        const calculated = await this.page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          for (const btn of buttons) {
            if (btn.innerText.includes('계산') || btn.innerText.includes('BMI')) {
              btn.click();
              return true;
            }
          }
          return false;
        });

        if (calculated) {
          await new Promise((r) => setTimeout(r, 1000));
          await this.takeScreenshot('bmi-2-result');

          // 결과 확인
          const bmiValue = await this.page.evaluate(() => {
            // BMI 값 찾기 (22.86 예상)
            const elements = document.querySelectorAll('*');
            for (const el of elements) {
              const text = el.innerText;
              if (
                text &&
                text.match(/\d+\.\d+/) &&
                parseFloat(text.match(/\d+\.\d+/)[0]) > 10 &&
                parseFloat(text.match(/\d+\.\d+/)[0]) < 50
              ) {
                return text;
              }
            }
            return null;
          });

          testResult.details.bmiValue = bmiValue;
          testResult.status = bmiValue ? 'success' : 'partial';
        }
      }
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error.message;
    }

    this.results.tools.bmi = testResult;
    console.log(`   ${testResult.status === 'success' ? '✅' : '❌'} BMI: ${testResult.status}`);
  }

  // 글자수 세기 실시간 카운팅 테스트
  async testTextCounter() {
    console.log('📝 글자수 세기 테스트...');
    const testResult = { name: 'Text Counter', status: 'testing', details: {} };

    try {
      await this.page.goto(`${this.baseUrl}/tools/text-counter.html`, {
        waitUntil: 'networkidle2',
      });
      await this.takeScreenshot('text-counter-1-initial');

      const testText = '안녕하세요. doha.kr 테스트입니다.\n한글과 English, 123 숫자!';

      // 텍스트 입력
      const textEntered = await this.page.evaluate((text) => {
        const textareas = document.querySelectorAll('textarea, input[type="text"], .text-input');
        if (textareas.length > 0) {
          const textarea = textareas[0];
          textarea.value = text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('keyup', { bubbles: true }));
          return true;
        }
        return false;
      }, testText);

      if (textEntered) {
        await new Promise((r) => setTimeout(r, 500));
        await this.takeScreenshot('text-counter-2-with-text');

        // 카운트 결과 읽기
        const counts = await this.page.evaluate(() => {
          const results = {};

          // 글자수
          const charElements = document.querySelectorAll(
            '[id*="char"], [class*="char"], .count-value'
          );
          for (const el of charElements) {
            const text = el.innerText;
            if (text && text.match(/\d+/)) {
              results.chars = text;
              break;
            }
          }

          // 단어수
          const wordElements = document.querySelectorAll('[id*="word"], [class*="word"]');
          for (const el of wordElements) {
            const text = el.innerText;
            if (text && text.match(/\d+/)) {
              results.words = text;
              break;
            }
          }

          return results;
        });

        testResult.details = counts;
        testResult.status = counts.chars ? 'success' : 'partial';
      }
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error.message;
    }

    this.results.tools.textCounter = testResult;
    console.log(
      `   ${testResult.status === 'success' ? '✅' : '❌'} Text Counter: ${testResult.status}`
    );
  }

  // 오늘의 운세 API 실제 호출 테스트
  async testDailyFortuneAPI() {
    console.log('📝 오늘의 운세 API 테스트...');
    const testResult = { name: 'Daily Fortune', status: 'testing', details: {} };

    try {
      await this.page.goto(`${this.baseUrl}/fortune/daily/`, { waitUntil: 'networkidle2' });

      // API 응답 인터셉트 설정
      const apiResponse = new Promise((resolve) => {
        this.page.on('response', (response) => {
          if (response.url().includes('/api/fortune')) {
            resolve({
              status: response.status(),
              ok: response.ok(),
              headers: response.headers(),
            });
          }
        });
      });

      // 폼 작성
      await this.page.evaluate(() => {
        // 이름
        const nameInput = document.querySelector(
          '#userName, input[name="userName"], input[placeholder*="이름"]'
        );
        if (nameInput) nameInput.value = '테스트';

        // 생년월일
        const yearSelect = document.querySelector('#birthYear, select[name="birthYear"]');
        const monthSelect = document.querySelector('#birthMonth, select[name="birthMonth"]');
        const daySelect = document.querySelector('#birthDay, select[name="birthDay"]');

        if (yearSelect) yearSelect.value = '1990';
        if (monthSelect) monthSelect.value = '5';
        if (daySelect) daySelect.value = '15';

        // 성별
        const maleRadio = document.querySelector('input[value="male"], input[value="남"]');
        if (maleRadio) maleRadio.click();
      });

      await this.takeScreenshot('fortune-1-form-filled');

      // 제출
      const submitted = await this.page.evaluate(() => {
        const submitBtn = document.querySelector(
          'button[type="submit"], .btn-submit, button.btn-primary'
        );
        if (submitBtn) {
          submitBtn.click();
          return true;
        }
        return false;
      });

      if (submitted) {
        // API 응답 대기 (최대 10초)
        const response = await Promise.race([
          apiResponse,
          new Promise((resolve) => setTimeout(() => resolve(null), 10000)),
        ]);

        if (response) {
          testResult.details.apiResponse = response;
          testResult.status = response.ok ? 'success' : 'failed';

          await new Promise((r) => setTimeout(r, 2000));
          await this.takeScreenshot('fortune-2-result');

          // 결과 텍스트 확인
          const fortuneText = await this.page.evaluate(() => {
            const resultEl = document.querySelector(
              '.fortune-result, .result-content, .fortune-text'
            );
            return resultEl ? resultEl.innerText.substring(0, 100) : null;
          });

          testResult.details.fortuneText = fortuneText;
        } else {
          testResult.status = 'timeout';
        }
      }
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error.message;
    }

    this.results.fortune.daily = testResult;
    console.log(
      `   ${testResult.status === 'success' ? '✅' : '❌'} Daily Fortune: ${testResult.status}`
    );
  }

  // 타로카드 선택 및 리딩 테스트
  async testTarotReading() {
    console.log('📝 타로카드 리딩 테스트...');
    const testResult = { name: 'Tarot Reading', status: 'testing', details: {} };

    try {
      await this.page.goto(`${this.baseUrl}/fortune/tarot/`, { waitUntil: 'networkidle2' });
      await this.takeScreenshot('tarot-1-initial');

      // 카드 선택 (3장)
      const cardsSelected = await this.page.evaluate(() => {
        const cards = document.querySelectorAll('.tarot-card, .card-item, [data-card], .card');
        let selected = 0;

        for (let i = 0; i < cards.length && selected < 3; i++) {
          cards[i].click();
          selected++;
        }

        return selected;
      });

      testResult.details.cardsSelected = cardsSelected;

      if (cardsSelected >= 3) {
        await new Promise((r) => setTimeout(r, 1000));
        await this.takeScreenshot('tarot-2-selected');

        // 리딩 버튼 클릭
        const readingStarted = await this.page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          for (const btn of buttons) {
            if (
              btn.innerText.includes('리딩') ||
              btn.innerText.includes('해석') ||
              btn.innerText.includes('보기')
            ) {
              btn.click();
              return true;
            }
          }
          return false;
        });

        if (readingStarted) {
          await new Promise((r) => setTimeout(r, 3000));
          await this.takeScreenshot('tarot-3-reading');

          const readingText = await this.page.evaluate(() => {
            const reading = document.querySelector(
              '.reading-result, .tarot-result, .interpretation'
            );
            return reading ? reading.innerText.substring(0, 100) : null;
          });

          testResult.details.reading = readingText;
          testResult.status = readingText ? 'success' : 'partial';
        }
      }
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error.message;
    }

    this.results.fortune.tarot = testResult;
    console.log(`   ${testResult.status === 'success' ? '✅' : '❌'} Tarot: ${testResult.status}`);
  }

  // 스크린샷 저장
  async takeScreenshot(name) {
    const dir = 'deep-test-screenshots';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = path.join(dir, `${name}-${Date.now()}.png`);
    await this.page.screenshot({ path: filename, fullPage: false });
    this.results.screenshots.push(filename);
  }

  // 최종 리포트 생성
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      url: this.baseUrl,
      results: this.results,
      summary: {
        tests: {
          total: Object.keys(this.results.tests).length,
          success: Object.values(this.results.tests).filter((t) => t.status === 'success').length,
          failed: Object.values(this.results.tests).filter((t) => t.status === 'failed').length,
        },
        fortune: {
          total: Object.keys(this.results.fortune).length,
          success: Object.values(this.results.fortune).filter((t) => t.status === 'success').length,
          failed: Object.values(this.results.fortune).filter((t) => t.status === 'failed').length,
        },
        tools: {
          total: Object.keys(this.results.tools).length,
          success: Object.values(this.results.tools).filter((t) => t.status === 'success').length,
          failed: Object.values(this.results.tools).filter((t) => t.status === 'failed').length,
        },
        errors: this.results.errors.length,
      },
    };

    // JSON 리포트
    fs.writeFileSync('deep-test-report.json', JSON.stringify(report, null, 2));

    // 콘솔 출력
    console.log('\n' + '='.repeat(60));
    console.log('📊 심층 테스트 완료');
    console.log('='.repeat(60));
    console.log(`심리테스트: ${report.summary.tests.success}/${report.summary.tests.total} 성공`);
    console.log(
      `운세 서비스: ${report.summary.fortune.success}/${report.summary.fortune.total} 성공`
    );
    console.log(`실용 도구: ${report.summary.tools.success}/${report.summary.tools.total} 성공`);
    console.log(`콘솔 에러: ${report.summary.errors}개`);
    console.log(`\n📁 리포트: deep-test-report.json`);
    console.log(`📸 스크린샷: ${this.results.screenshots.length}개 (deep-test-screenshots/)`);
  }

  async close() {
    await this.browser.close();
  }

  // 메인 실행
  async run() {
    await this.initialize();

    console.log('=' + '='.repeat(59));
    console.log('1️⃣ 심리테스트 검증');
    console.log('-'.repeat(60));
    await this.testMBTIFullFlow();

    console.log('\n2️⃣ 실용도구 검증');
    console.log('-'.repeat(60));
    await this.testBMICalculator();
    await this.testTextCounter();

    console.log('\n3️⃣ 운세 서비스 검증');
    console.log('-'.repeat(60));
    await this.testDailyFortuneAPI();
    await this.testTarotReading();

    this.generateReport();
    await this.close();

    console.log('\n✨ 심층 테스트 완료!');
  }
}

// 실행
const test = new DeepFunctionalTest();
test.run().catch(console.error);
