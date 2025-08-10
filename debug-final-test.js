import puppeteer from 'puppeteer';

(async () => {
  console.log('🔍 doha.kr 디버그 테스트...');
  
  const browser = await puppeteer.launch({ headless: false }); // 브라우저 보이기
  const page = await browser.newPage();
  
  // 콘솔 메시지 캡처
  page.on('console', msg => console.log('콘솔:', msg.text()));
  page.on('pageerror', error => console.log('페이지 오류:', error.message));
  
  try {
    await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'networkidle2' });
    
    // gemini-api.js 로드 확인
    const hasGeminiAPI = await page.evaluate(() => {
      return typeof window.callFortuneAPI !== 'undefined';
    });
    console.log('Gemini API 로드:', hasGeminiAPI ? '✅' : '❌');
    
    // 폼 입력
    await page.type('#userName', '테스트');
    await page.select('#birthYear', '1990');
    await page.select('#birthMonth', '5');
    await page.select('#birthDay', '15');
    
    // 제출
    await page.click('button[type="submit"]');
    
    // 10초 대기
    await page.waitForTimeout(10000);
    
    // 결과 컨테이너 내용 확인
    const resultHTML = await page.$eval('#result-container', el => el.innerHTML);
    console.log('결과 컨테이너:', resultHTML.substring(0, 200));
    
    await page.screenshot({ path: 'final-test-result.png' });
    console.log('스크린샷 저장: final-test-result.png');
    
  } catch (error) {
    console.log('오류:', error.message);
  }
  
  await browser.close();
})();