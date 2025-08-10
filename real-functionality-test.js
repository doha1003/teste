import puppeteer from 'puppeteer';
import fs from 'fs';

async function testRealFunctionality() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: { width: 1200, height: 800 },
  });

  const page = await browser.newPage();

  // 콘솔 에러 수집
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });

  // 네트워크 실패 수집
  page.on('response', (response) => {
    if (response.status() >= 400) {
      errors.push(`Network Error: ${response.status()} - ${response.url()}`);
    }
  });

  const results = {
    homepage: { pass: false, errors: [] },
    mbtiTest: { pass: false, errors: [], steps: [] },
    loveDnaTest: { pass: false, errors: [], steps: [] },
    tetoEgenTest: { pass: false, errors: [], steps: [] },
    fortuneServices: { pass: false, errors: [], steps: [] },
    tools: { pass: false, errors: [], steps: [] },
  };

  try {
    console.log('🏠 홈페이지 테스트 중...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // 홈페이지 기본 요소 확인
    const title = await page.$eval('h1', (el) => el.textContent);
    const servicesExist = await page.$$('.service-card');
    const navigationWorks = await page.$('.navbar');

    if (title && servicesExist.length > 0 && navigationWorks) {
      results.homepage.pass = true;
      results.homepage.steps = [
        `제목 존재: ${title}`,
        `서비스 카드 ${servicesExist.length}개 발견`,
        '네비게이션 존재',
      ];
    }
    results.homepage.errors = [...errors];
    errors.length = 0;

    console.log('🧠 MBTI 테스트 진행 중...');
    await page.goto('http://localhost:3000/tests/mbti/test.html', { waitUntil: 'networkidle0' });

    // MBTI 테스트 단계별 진행
    let currentQuestion = 1;
    const maxQuestions = 24;

    results.mbtiTest.steps.push(`페이지 로드됨`);

    // 첫 번째 질문 존재 확인
    const firstQuestion = await page.$('.question-container');
    if (!firstQuestion) {
      results.mbtiTest.errors.push('질문 컨테이너를 찾을 수 없음');
    } else {
      results.mbtiTest.steps.push('첫 번째 질문 발견');

      // 질문 진행 (10개만 테스트)
      for (let i = 0; i < Math.min(10, maxQuestions); i++) {
        try {
          // 첫 번째 선택지 클릭
          const option = await page.$('.option-button');
          if (option) {
            await option.click();
            await page.waitForTimeout(500);
            results.mbtiTest.steps.push(`질문 ${i + 1} 답변 완료`);
            currentQuestion++;
          } else {
            results.mbtiTest.errors.push(`질문 ${i + 1}에서 선택지 버튼을 찾을 수 없음`);
            break;
          }
        } catch (err) {
          results.mbtiTest.errors.push(`질문 ${i + 1} 진행 중 오류: ${err.message}`);
          break;
        }
      }

      if (currentQuestion > 10) {
        results.mbtiTest.pass = true;
        results.mbtiTest.steps.push(`${currentQuestion - 1}개 질문 성공적으로 완료`);
      }
    }
    results.mbtiTest.errors = [...results.mbtiTest.errors, ...errors];
    errors.length = 0;

    console.log('💕 러브 DNA 테스트 확인 중...');
    await page.goto('http://localhost:3000/tests/love-dna/test.html', {
      waitUntil: 'networkidle0',
    });

    // 기본적인 페이지 로드 확인
    const loveDnaLoaded =
      (await page.$('.test-container')) || (await page.$('.question-container'));
    if (loveDnaLoaded) {
      results.loveDnaTest.pass = true;
      results.loveDnaTest.steps.push('페이지가 정상적으로 로드됨');
    } else {
      results.loveDnaTest.errors.push('테스트 컨테이너를 찾을 수 없음');
    }
    results.loveDnaTest.errors = [...results.loveDnaTest.errors, ...errors];
    errors.length = 0;

    console.log('🌟 테토 에겐 테스트 확인 중...');
    await page.goto('http://localhost:3000/tests/teto-egen/test.html', {
      waitUntil: 'networkidle0',
    });

    const tetoEgenLoaded =
      (await page.$('.test-container')) || (await page.$('.question-container'));
    if (tetoEgenLoaded) {
      results.tetoEgenTest.pass = true;
      results.tetoEgenTest.steps.push('페이지가 정상적으로 로드됨');
    } else {
      results.tetoEgenTest.errors.push('테스트 컨테이너를 찾을 수 없음');
    }
    results.tetoEgenTest.errors = [...results.tetoEgenTest.errors, ...errors];
    errors.length = 0;

    console.log('🔮 운세 서비스 확인 중...');
    await page.goto('http://localhost:3000/fortune/daily/', { waitUntil: 'networkidle0' });

    const fortuneForm = (await page.$('#fortune-form')) || (await page.$('.fortune-form'));
    if (fortuneForm) {
      results.fortuneServices.pass = true;
      results.fortuneServices.steps.push('운세 입력 폼이 존재함');
    } else {
      results.fortuneServices.errors.push('운세 입력 폼을 찾을 수 없음');
    }
    results.fortuneServices.errors = [...results.fortuneServices.errors, ...errors];
    errors.length = 0;

    console.log('🛠️ 도구 페이지 확인 중...');
    await page.goto('http://localhost:3000/tools/bmi-calculator.html', {
      waitUntil: 'networkidle0',
    });

    const bmiCalculator = (await page.$('#bmi-form')) || (await page.$('.calculator-form'));
    if (bmiCalculator) {
      results.tools.pass = true;
      results.tools.steps.push('BMI 계산기가 정상 로드됨');
    } else {
      results.tools.errors.push('BMI 계산기 폼을 찾을 수 없음');
    }
    results.tools.errors = [...results.tools.errors, ...errors];
  } catch (error) {
    console.error('테스트 중 오류:', error);
  }

  // 결과 리포트 생성
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: Object.keys(results).length,
      passed: Object.values(results).filter((r) => r.pass).length,
      failed: Object.values(results).filter((r) => !r.pass).length,
    },
    details: results,
  };

  fs.writeFileSync('real-functionality-report.json', JSON.stringify(report, null, 2));

  console.log('\n📊 실제 기능 테스트 결과:');
  console.log('==================================');
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result.pass ? '✅' : '❌'} ${test}: ${result.pass ? 'PASS' : 'FAIL'}`);
    if (result.steps.length > 0) {
      result.steps.forEach((step) => console.log(`   📝 ${step}`));
    }
    if (result.errors.length > 0) {
      result.errors.forEach((err) => console.log(`   ⚠️ ${err}`));
    }
  });

  console.log(
    `\n📋 총 ${report.summary.totalTests}개 테스트 중 ${report.summary.passed}개 통과, ${report.summary.failed}개 실패`
  );
  console.log('📄 상세 보고서: real-functionality-report.json');

  await browser.close();
}

testRealFunctionality().catch(console.error);
