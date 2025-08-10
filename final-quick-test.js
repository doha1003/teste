import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 doha.kr 일일 운세 최종 테스트 시작...');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. 페이지 로드
    await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'networkidle2' });
    console.log('✅ 페이지 로드 완료');

    // 2. 폼 입력
    await page.type('#userName', '테스트');
    await page.select('#birthYear', '1990');
    await page.select('#birthMonth', '5');
    await page.select('#birthDay', '15');
    console.log('✅ 폼 입력 완료');

    // 3. 제출 버튼 클릭
    await page.click('button[type="submit"]');
    console.log('⏳ 운세 생성 중...');

    // 4. 결과 대기 (최대 10초)
    await page.waitForSelector('#result-container .result-card', { timeout: 10000 });

    // 5. 결과 확인
    const resultText = await page.$eval('#result-container', (el) => el.innerText);
    const hasResult = resultText.includes('운세') || resultText.includes('종합운');

    if (hasResult) {
      console.log('🎉 성공! 운세가 정상적으로 생성되고 표시됩니다.');
      console.log(`📊 결과 길이: ${resultText.length}자`);
    } else {
      console.log('❌ 실패: 운세 결과가 표시되지 않습니다.');
    }
  } catch (error) {
    console.log('❌ 오류 발생:', error.message);
  }

  await browser.close();
  console.log('✨ 테스트 완료');
})();
