import puppeteer from 'puppeteer';

async function quickFortuneTest() {
  console.log('🔮 doha.kr 운세 서비스 빠른 테스트');
  console.log('='.repeat(50));

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // API 요청 모니터링
  const apiCalls = [];
  page.on('request', (request) => {
    if (request.url().includes('api/fortune') || request.url().includes('doha-kr-ap.vercel.app')) {
      apiCalls.push({
        url: request.url(),
        method: request.method(),
      });
      console.log(`📡 API 호출: ${request.method()} ${request.url()}`);
    }
  });

  // API 응답 모니터링
  const apiResponses = [];
  page.on('response', async (response) => {
    if (
      response.url().includes('api/fortune') ||
      response.url().includes('doha-kr-ap.vercel.app')
    ) {
      const status = response.status();
      apiResponses.push({
        url: response.url(),
        status: status,
      });
      console.log(`📥 API 응답: ${status} ${response.url()}`);

      if (status === 200) {
        try {
          const responseText = await response.text();
          console.log(`✅ 응답 내용 길이: ${responseText.length}자`);
        } catch (e) {
          console.log('응답 내용 확인 실패');
        }
      }
    }
  });

  const results = {
    daily: false,
    zodiac: false,
    apiWorking: false,
  };

  try {
    // 1. 일일운세 테스트
    console.log('\n📅 일일운세 페이지 테스트...');
    await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'domcontentloaded' });

    // 페이지 로딩 완료 대기
    await page.waitForFunction(() => document.readyState === 'complete');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 운세 생성 테스트
    const nameInput = await page.$('#userName');
    const yearSelect = await page.$('#birthYear');
    const monthSelect = await page.$('#birthMonth');
    const daySelect = await page.$('#birthDay');
    const generateBtn = await page.$('button[type="submit"], .linear-button-primary');

    if (nameInput && yearSelect && monthSelect && daySelect && generateBtn) {
      console.log('📝 폼 요소 발견, 데이터 입력 중...');

      await nameInput.type('테스트');
      await yearSelect.select('1990');
      await monthSelect.select('5');

      // 일 선택을 위해 잠시 대기 (월이 변경되면 일 옵션이 업데이트됨)
      await new Promise((resolve) => setTimeout(resolve, 500));
      await daySelect.select('15');

      console.log('🔄 운세 생성 버튼 클릭...');
      await generateBtn.click();

      // API 응답 대기
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // 결과 확인
      const resultElement = await page.$('#fortuneResult, .fortune-result, .result-content');
      if (resultElement) {
        const resultText = await resultElement.evaluate((el) => el.textContent);
        if (resultText && resultText.trim().length > 50) {
          results.daily = true;
          console.log(`✅ 일일운세 생성 성공! (${resultText.trim().length}자)`);
        } else {
          console.log('❌ 일일운세 결과가 비어있거나 너무 짧음');
        }
      } else {
        console.log('❌ 일일운세 결과 요소를 찾을 수 없음');
      }
    } else {
      console.log('❌ 일일운세 폼 요소를 찾을 수 없음');
    }

    // 2. 별자리 운세 테스트
    console.log('\n⭐ 별자리 운세 페이지 테스트...');
    await page.goto('https://doha.kr/fortune/zodiac/', { waitUntil: 'domcontentloaded' });

    await page.waitForFunction(() => document.readyState === 'complete');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const nameInputZodiac = await page.$('#userName');
    const ariesRadio = await page.$('#zodiac-aries'); // 양자리 라디오 버튼
    const zodiacBtn = await page.$('button[type="submit"], .btn-primary');

    if (nameInputZodiac && ariesRadio && zodiacBtn) {
      console.log('📝 별자리 폼 입력 시작...');

      await nameInputZodiac.type('테스트');
      await ariesRadio.click(); // 양자리 선택

      console.log('🔄 별자리 운세 생성 버튼 클릭...');
      await zodiacBtn.click();

      // API 응답 대기
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // 결과 확인
      const zodiacResult = await page.$('#zodiacResult, .fortune-result, .result-content');
      if (zodiacResult) {
        const zodiacText = await zodiacResult.evaluate((el) => el.textContent);
        if (zodiacText && zodiacText.trim().length > 50) {
          results.zodiac = true;
          console.log(`✅ 별자리 운세 생성 성공! (${zodiacText.trim().length}자)`);
        } else {
          console.log('❌ 별자리 운세 결과가 비어있거나 너무 짧음');
        }
      } else {
        console.log('❌ 별자리 운세 결과 요소를 찾을 수 없음');
      }
    } else {
      console.log('❌ 별자리 운세 폼 요소를 찾을 수 없음');
    }
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
  }

  await browser.close();

  // API 작동 여부 확인
  results.apiWorking = apiResponses.some((resp) => resp.status === 200);

  // 결과 요약
  console.log('\n' + '='.repeat(50));
  console.log('📊 테스트 결과 요약');
  console.log('='.repeat(50));
  console.log(`일일운세: ${results.daily ? '✅ 성공' : '❌ 실패'}`);
  console.log(`별자리운세: ${results.zodiac ? '✅ 성공' : '❌ 실패'}`);
  console.log(`API 연결: ${results.apiWorking ? '✅ 성공' : '❌ 실패'}`);

  console.log(`\nAPI 호출 횟수: ${apiCalls.length}`);
  apiCalls.forEach((call, i) => {
    console.log(`  ${i + 1}. ${call.method} ${call.url}`);
  });

  console.log(`\nAPI 응답 횟수: ${apiResponses.length}`);
  apiResponses.forEach((resp, i) => {
    console.log(`  ${i + 1}. ${resp.status} ${resp.url}`);
  });

  // 최종 판정
  console.log('\n🏆 최종 판정:');
  if (results.daily && results.zodiac && results.apiWorking) {
    console.log('✅ 모든 기능이 정상 작동합니다! doha.kr 운세 서비스가 완벽하게 작동 중입니다.');
  } else if (results.apiWorking) {
    console.log('🟡 API는 작동하지만 일부 운세 기능에 문제가 있습니다.');
  } else {
    console.log(
      '❌ API 연결에 문제가 있습니다. https://doha-kr-ap.vercel.app/api/fortune 을 확인해주세요.'
    );
  }

  return results;
}

// 실행
quickFortuneTest().catch(console.error);
