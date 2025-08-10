/**
 * doha.kr 운세 페이지 최종 검증 테스트
 * Puppeteer를 사용한 E2E 테스트
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FortuneVerificationTest {
  constructor() {
    this.browser = null;
    this.results = [];
    this.screenshotDir = path.join(__dirname, 'test-screenshots');

    // 스크린샷 디렉토리 생성
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async initialize() {
    console.log('브라우저 초기화 중...');
    this.browser = await puppeteer.launch({
      headless: true, // 백그라운드에서 실행
      defaultViewport: { width: 1280, height: 720 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage',
      ],
    });
  }

  async createPage() {
    const page = await this.browser.newPage();

    // 한국어 설정
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
    });

    // 네트워크 요청 모니터링
    const networkRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('api/fortune')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
        });
      }
    });

    page.on('response', (response) => {
      if (response.url().includes('api/fortune')) {
        networkRequests.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
        });
      }
    });

    page.networkRequests = networkRequests;
    return page;
  }

  async testDailyFortune() {
    console.log('\n=== 일일 운세 테스트 시작 ===');
    const page = await this.createPage();
    const testResult = {
      page: '일일 운세',
      url: 'https://doha.kr/fortune/daily/',
      success: false,
      errors: [],
      apiCalls: [],
      screenshots: [],
    };

    try {
      // 페이지 로드
      console.log('일일 운세 페이지 로드 중...');
      await page.goto('https://doha.kr/fortune/daily/', {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // 페이지 로드 스크린샷
      const loadScreenshot = `daily-fortune-loaded-${Date.now()}.png`;
      await page.screenshot({
        path: path.join(this.screenshotDir, loadScreenshot),
        fullPage: true,
      });
      testResult.screenshots.push(loadScreenshot);
      console.log(`스크린샷 저장: ${loadScreenshot}`);

      // 폼 요소 확인
      await page.waitForSelector('#userName', { timeout: 10000 });
      await page.waitForSelector('#birthYear', { timeout: 10000 });
      await page.waitForSelector('#birthMonth', { timeout: 10000 });
      await page.waitForSelector('#birthDay', { timeout: 10000 });

      console.log('사용자 정보 입력 중...');
      // 사용자 정보 입력
      await page.type('#userName', '홍길동');
      await page.select('#birthYear', '1990');
      await page.select('#birthMonth', '5');
      await page.select('#birthDay', '15');

      // 입력 완료 스크린샷
      const inputScreenshot = `daily-fortune-input-${Date.now()}.png`;
      await page.screenshot({
        path: path.join(this.screenshotDir, inputScreenshot),
        fullPage: true,
      });
      testResult.screenshots.push(inputScreenshot);

      console.log('운세 생성 버튼 클릭...');
      // 운세 생성 버튼 클릭
      await page.click('.btn-primary');

      // 로딩 표시 확인
      try {
        await page.waitForSelector('.loading, .spinner', { timeout: 2000 });
        console.log('로딩 표시 확인됨');
      } catch (e) {
        console.log('로딩 표시 없음 (정상일 수 있음)');
      }

      // 결과 대기
      console.log('운세 결과 대기 중...');
      await page.waitForSelector('#fortuneResult', {
        visible: true,
        timeout: 30000,
      });

      // 결과 내용 확인
      const fortuneText = await page.$eval('#fortuneResult', (el) => el.textContent.trim());
      if (fortuneText.length > 10) {
        console.log(`✅ 운세 생성 성공: ${fortuneText.substring(0, 100)}...`);
        testResult.success = true;
      } else {
        testResult.errors.push('운세 내용이 너무 짧음');
      }

      // 최종 결과 스크린샷
      const resultScreenshot = `daily-fortune-result-${Date.now()}.png`;
      await page.screenshot({
        path: path.join(this.screenshotDir, resultScreenshot),
        fullPage: true,
      });
      testResult.screenshots.push(resultScreenshot);

      // API 호출 정보 수집
      testResult.apiCalls = page.networkRequests;
    } catch (error) {
      console.error('❌ 일일 운세 테스트 실패:', error.message);
      testResult.errors.push(error.message);

      // 에러 스크린샷
      const errorScreenshot = `daily-fortune-error-${Date.now()}.png`;
      await page.screenshot({
        path: path.join(this.screenshotDir, errorScreenshot),
        fullPage: true,
      });
      testResult.screenshots.push(errorScreenshot);
    }

    await page.close();
    this.results.push(testResult);
    return testResult;
  }

  async testZodiacFortune() {
    console.log('\n=== 별자리 운세 테스트 시작 ===');
    const page = await this.createPage();
    const testResult = {
      page: '별자리 운세',
      url: 'https://doha.kr/fortune/zodiac/',
      success: false,
      errors: [],
      apiCalls: [],
      screenshots: [],
    };

    try {
      console.log('별자리 운세 페이지 로드 중...');
      await page.goto('https://doha.kr/fortune/zodiac/', {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // 페이지 로드 스크린샷
      const loadScreenshot = `zodiac-fortune-loaded-${Date.now()}.png`;
      await page.screenshot({
        path: path.join(this.screenshotDir, loadScreenshot),
        fullPage: true,
      });
      testResult.screenshots.push(loadScreenshot);

      // 별자리 선택 대기
      await page.waitForSelector('.zodiac-card', { timeout: 10000 });

      console.log('별자리 선택 중 (물병자리)...');
      // 물병자리 선택 (또는 첫 번째 별자리)
      await page.click('.zodiac-card[data-zodiac="aquarius"], .zodiac-card:first-child');

      // 선택 후 스크린샷
      const selectScreenshot = `zodiac-fortune-selected-${Date.now()}.png`;
      await page.screenshot({
        path: path.join(this.screenshotDir, selectScreenshot),
        fullPage: true,
      });
      testResult.screenshots.push(selectScreenshot);

      // 결과 대기
      console.log('별자리 운세 결과 대기 중...');
      await page.waitForSelector('#fortuneResult, .fortune-content', {
        visible: true,
        timeout: 30000,
      });

      // 결과 내용 확인
      const fortuneText = await page.$eval('#fortuneResult, .fortune-content', (el) =>
        el.textContent.trim()
      );
      if (fortuneText.length > 10) {
        console.log(`✅ 별자리 운세 생성 성공: ${fortuneText.substring(0, 100)}...`);
        testResult.success = true;
      } else {
        testResult.errors.push('운세 내용이 너무 짧음');
      }

      // 최종 결과 스크린샷
      const resultScreenshot = `zodiac-fortune-result-${Date.now()}.png`;
      await page.screenshot({
        path: path.join(this.screenshotDir, resultScreenshot),
        fullPage: true,
      });
      testResult.screenshots.push(resultScreenshot);

      testResult.apiCalls = page.networkRequests;
    } catch (error) {
      console.error('❌ 별자리 운세 테스트 실패:', error.message);
      testResult.errors.push(error.message);

      const errorScreenshot = `zodiac-fortune-error-${Date.now()}.png`;
      await page.screenshot({
        path: path.join(this.screenshotDir, errorScreenshot),
        fullPage: true,
      });
      testResult.screenshots.push(errorScreenshot);
    }

    await page.close();
    this.results.push(testResult);
    return testResult;
  }

  async testZodiacAnimalFortune() {
    console.log('\n=== 띠별 운세 테스트 시작 ===');
    const page = await this.createPage();
    const testResult = {
      page: '띠별 운세',
      url: 'https://doha.kr/fortune/zodiac-animal/',
      success: false,
      errors: [],
      apiCalls: [],
      screenshots: [],
    };

    try {
      console.log('띠별 운세 페이지 로드 중...');
      await page.goto('https://doha.kr/fortune/zodiac-animal/', {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // 페이지 로드 스크린샷
      const loadScreenshot = `zodiac-animal-loaded-${Date.now()}.png`;
      await page.screenshot({
        path: path.join(this.screenshotDir, loadScreenshot),
        fullPage: true,
      });
      testResult.screenshots.push(loadScreenshot);

      // 띠 선택 대기
      await page.waitForSelector('.animal-card, .zodiac-animal-card', { timeout: 10000 });

      console.log('띠 선택 중 (호랑이)...');
      // 호랑이띠 선택 (또는 첫 번째 띠)
      await page.click(
        '.animal-card[data-animal="tiger"], .zodiac-animal-card[data-animal="tiger"], .animal-card:first-child, .zodiac-animal-card:first-child'
      );

      // 선택 후 스크린샷
      const selectScreenshot = `zodiac-animal-selected-${Date.now()}.png`;
      await page.screenshot({
        path: path.join(this.screenshotDir, selectScreenshot),
        fullPage: true,
      });
      testResult.screenshots.push(selectScreenshot);

      // 결과 대기
      console.log('띠별 운세 결과 대기 중...');
      await page.waitForSelector('#fortuneResult, .fortune-content', {
        visible: true,
        timeout: 30000,
      });

      // 결과 내용 확인
      const fortuneText = await page.$eval('#fortuneResult, .fortune-content', (el) =>
        el.textContent.trim()
      );
      if (fortuneText.length > 10) {
        console.log(`✅ 띠별 운세 생성 성공: ${fortuneText.substring(0, 100)}...`);
        testResult.success = true;
      } else {
        testResult.errors.push('운세 내용이 너무 짧음');
      }

      // 최종 결과 스크린샷
      const resultScreenshot = `zodiac-animal-result-${Date.now()}.png`;
      await page.screenshot({
        path: path.join(this.screenshotDir, resultScreenshot),
        fullPage: true,
      });
      testResult.screenshots.push(resultScreenshot);

      testResult.apiCalls = page.networkRequests;
    } catch (error) {
      console.error('❌ 띠별 운세 테스트 실패:', error.message);
      testResult.errors.push(error.message);

      const errorScreenshot = `zodiac-animal-error-${Date.now()}.png`;
      await page.screenshot({
        path: path.join(this.screenshotDir, errorScreenshot),
        fullPage: true,
      });
      testResult.screenshots.push(errorScreenshot);
    }

    await page.close();
    this.results.push(testResult);
    return testResult;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 doha.kr 운세 페이지 최종 검증 보고서');
    console.log('='.repeat(60));

    let successCount = 0;
    let totalTests = this.results.length;

    this.results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.page}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   결과: ${result.success ? '✅ 성공' : '❌ 실패'}`);

      if (result.success) successCount++;

      if (result.errors.length > 0) {
        console.log(`   오류: ${result.errors.join(', ')}`);
      }

      if (result.apiCalls.length > 0) {
        console.log(`   API 호출: ${result.apiCalls.length}개`);
        result.apiCalls.forEach((call) => {
          if (call.status) {
            console.log(
              `     - ${call.method || 'GET'} ${call.url} → ${call.status} ${call.statusText}`
            );
          } else if (call.method) {
            console.log(`     - ${call.method} ${call.url}`);
          }
        });
      }

      console.log(`   스크린샷: ${result.screenshots.length}개 저장됨`);
      result.screenshots.forEach((screenshot) => {
        console.log(`     - ${screenshot}`);
      });
    });

    console.log('\n' + '='.repeat(60));
    console.log(
      `📊 전체 결과: ${successCount}/${totalTests} 성공 (${Math.round((successCount / totalTests) * 100)}%)`
    );
    console.log(`📁 스크린샷 저장 위치: ${this.screenshotDir}`);

    if (successCount === totalTests) {
      console.log('🎉 모든 운세 페이지가 정상 작동합니다!');
    } else {
      console.log('⚠️  일부 페이지에서 문제가 발견되었습니다.');
    }

    console.log('='.repeat(60));

    return {
      total: totalTests,
      success: successCount,
      failure: totalTests - successCount,
      rate: Math.round((successCount / totalTests) * 100),
      details: this.results,
    };
  }

  async run() {
    try {
      await this.initialize();

      // 각 운세 페이지 테스트 실행
      await this.testDailyFortune();
      await this.testZodiacFortune();
      await this.testZodiacAnimalFortune();

      // 보고서 생성
      const report = this.generateReport();

      return report;
    } catch (error) {
      console.error('❌ 테스트 실행 중 오류:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
        console.log('\n브라우저 종료됨');
      }
    }
  }
}

// 테스트 실행
async function runFortuneVerification() {
  const tester = new FortuneVerificationTest();

  try {
    const report = await tester.run();

    // 결과를 JSON 파일로도 저장
    const reportPath = path.join(__dirname, 'fortune-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n📄 상세 보고서 저장: ${reportPath}`);

    return report;
  } catch (error) {
    console.error('테스트 실행 실패:', error);
    process.exit(1);
  }
}

// 직접 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  runFortuneVerification();
}

export { FortuneVerificationTest, runFortuneVerification };
