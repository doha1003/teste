import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFortunePages() {
  console.log('🔮 doha.kr 운세 페이지 최종 종합 테스트 시작');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: false, // 테스트 과정을 볼 수 있도록
    devtools: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // 스크린샷 저장 디렉토리 생성
  const screenshotDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // 네트워크 요청 모니터링
  const requests = [];
  page.on('request', (request) => {
    if (request.url().includes('api/fortune') || request.url().includes('doha-kr-ap.vercel.app')) {
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString(),
      });
      console.log(`📡 API 요청 감지: ${request.method()} ${request.url()}`);
    }
  });

  // 응답 모니터링
  const responses = [];
  page.on('response', (response) => {
    if (
      response.url().includes('api/fortune') ||
      response.url().includes('doha-kr-ap.vercel.app')
    ) {
      responses.push({
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString(),
      });
      console.log(`📥 API 응답: ${response.status()} ${response.url()}`);
    }
  });

  // 콘솔 로그 모니터링
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('❌ 브라우저 오류:', msg.text());
    }
  });

  const testResults = {
    dailyFortune: null,
    zodiacFortune: null,
    apiRequests: [],
    errors: [],
  };

  try {
    // 1. 일일운세 테스트
    console.log('\n📅 1. 일일운세 테스트 시작...');
    await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'networkidle2' });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 스크린샷 저장
    await page.screenshot({
      path: path.join(screenshotDir, '01-daily-fortune-loaded.png'),
      fullPage: true,
    });

    // 운세 생성 폼 작성
    const nameInput = await page.$('#name');
    const birthInput = await page.$('#birth');
    const genderSelect = await page.$('#gender');

    if (nameInput && birthInput && genderSelect) {
      await nameInput.type('테스트유저');
      await birthInput.type('1990-05-15');
      await genderSelect.select('남성');

      console.log('✅ 폼 입력 완료');

      // 운세 생성 버튼 클릭
      const generateBtn = await page.$('button[onclick*="generateFortune"], .btn-primary');
      if (generateBtn) {
        await generateBtn.click();
        console.log('🔄 운세 생성 요청...');

        // 로딩 대기 및 결과 확인
        await new Promise((resolve) => setTimeout(resolve, 8000)); // API 응답 대기

        // 결과 스크린샷
        await page.screenshot({
          path: path.join(screenshotDir, '02-daily-fortune-result.png'),
          fullPage: true,
        });

        // 운세 결과 확인
        const fortuneResult = await page.$('#fortuneResult, .fortune-result, .result-content');
        if (fortuneResult) {
          const fortuneText = await fortuneResult.evaluate((el) => el.textContent);
          if (fortuneText && fortuneText.trim().length > 50) {
            testResults.dailyFortune = {
              success: true,
              message: '일일운세 생성 성공',
              contentLength: fortuneText.trim().length,
            };
            console.log('✅ 일일운세 생성 성공 (내용 길이:', fortuneText.trim().length, '자)');
          } else {
            testResults.dailyFortune = {
              success: false,
              message: '운세 내용이 너무 짧거나 없음',
              content: fortuneText,
            };
          }
        } else {
          testResults.dailyFortune = {
            success: false,
            message: '운세 결과 요소를 찾을 수 없음',
          };
        }
      } else {
        testResults.dailyFortune = {
          success: false,
          message: '운세 생성 버튼을 찾을 수 없음',
        };
      }
    } else {
      testResults.dailyFortune = {
        success: false,
        message: '폼 입력 요소를 찾을 수 없음',
      };
    }

    // 2. 별자리 운세 테스트
    console.log('\n⭐ 2. 별자리 운세 테스트 시작...');
    await page.goto('https://doha.kr/fortune/zodiac/', { waitUntil: 'networkidle2' });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 스크린샷 저장
    await page.screenshot({
      path: path.join(screenshotDir, '03-zodiac-fortune-loaded.png'),
      fullPage: true,
    });

    // 별자리 선택
    const zodiacSelect = await page.$('#zodiacSign, select[name="zodiac"]');
    if (zodiacSelect) {
      await zodiacSelect.select('양자리');
      console.log('✅ 별자리 선택 완료 (양자리)');

      // 운세 생성 버튼 클릭
      const zodiacBtn = await page.$('button[onclick*="generateZodiacFortune"], .btn-primary');
      if (zodiacBtn) {
        await zodiacBtn.click();
        console.log('🔄 별자리 운세 생성 요청...');

        // 로딩 대기 및 결과 확인
        await new Promise((resolve) => setTimeout(resolve, 8000)); // API 응답 대기

        // 결과 스크린샷
        await page.screenshot({
          path: path.join(screenshotDir, '04-zodiac-fortune-result.png'),
          fullPage: true,
        });

        // 운세 결과 확인
        const zodiacResult = await page.$('#zodiacResult, .fortune-result, .result-content');
        if (zodiacResult) {
          const zodiacText = await zodiacResult.evaluate((el) => el.textContent);
          if (zodiacText && zodiacText.trim().length > 50) {
            testResults.zodiacFortune = {
              success: true,
              message: '별자리 운세 생성 성공',
              contentLength: zodiacText.trim().length,
            };
            console.log('✅ 별자리 운세 생성 성공 (내용 길이:', zodiacText.trim().length, '자)');
          } else {
            testResults.zodiacFortune = {
              success: false,
              message: '운세 내용이 너무 짧거나 없음',
              content: zodiacText,
            };
          }
        } else {
          testResults.zodiacFortune = {
            success: false,
            message: '운세 결과 요소를 찾을 수 없음',
          };
        }
      } else {
        testResults.zodiacFortune = {
          success: false,
          message: '운세 생성 버튼을 찾을 수 없음',
        };
      }
    } else {
      testResults.zodiacFortune = {
        success: false,
        message: '별자리 선택 요소를 찾을 수 없음',
      };
    }
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    testResults.errors.push(error.message);
  }

  // API 요청/응답 정리
  testResults.apiRequests = requests;
  testResults.apiResponses = responses;

  await browser.close();

  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log('📊 최종 테스트 결과 요약');
  console.log('='.repeat(60));

  if (testResults.dailyFortune) {
    console.log(`일일운세: ${testResults.dailyFortune.success ? '✅ 성공' : '❌ 실패'}`);
    console.log(`  - ${testResults.dailyFortune.message}`);
  }

  if (testResults.zodiacFortune) {
    console.log(`별자리운세: ${testResults.zodiacFortune.success ? '✅ 성공' : '❌ 실패'}`);
    console.log(`  - ${testResults.zodiacFortune.message}`);
  }

  console.log(`\nAPI 요청 수: ${requests.length}`);
  requests.forEach((req, idx) => {
    console.log(`  ${idx + 1}. ${req.method} ${req.url}`);
  });

  console.log(`\nAPI 응답 수: ${responses.length}`);
  responses.forEach((res, idx) => {
    console.log(`  ${idx + 1}. ${res.status} ${res.url}`);
  });

  if (testResults.errors.length > 0) {
    console.log('\n❌ 발견된 오류:');
    testResults.errors.forEach((error, idx) => {
      console.log(`  ${idx + 1}. ${error}`);
    });
  }

  // 최종 판정
  const dailySuccess = testResults.dailyFortune?.success || false;
  const zodiacSuccess = testResults.zodiacFortune?.success || false;
  const apiCalled = requests.some((req) => req.url.includes('doha-kr-ap.vercel.app'));

  console.log('\n' + '='.repeat(60));
  console.log('🏆 최종 판정');
  console.log('='.repeat(60));

  if (dailySuccess && zodiacSuccess && apiCalled) {
    console.log('✅ 모든 테스트 통과! doha.kr 운세 서비스가 정상 작동합니다.');
  } else if (apiCalled) {
    console.log('🟡 API는 호출되지만 일부 기능에 문제가 있습니다.');
  } else {
    console.log('❌ 심각한 문제가 발견되었습니다. API 호출이 정상적으로 이루어지지 않습니다.');
  }

  console.log(`\n스크린샷 저장 위치: ${screenshotDir}`);

  return testResults;
}

// 스크립트 실행
testFortunePages()
  .then((results) => {
    console.log('\n테스트 완료! 결과를 확인해주세요.');
  })
  .catch((error) => {
    console.error('테스트 실행 중 오류:', error);
  });
