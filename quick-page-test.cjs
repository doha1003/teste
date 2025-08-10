const puppeteer = require('puppeteer-core');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    });
    
    const page = await browser.newPage();
    
    console.log('🔍 페이지 검증 시작...');
    
    // 홈페이지 테스트
    console.log('1. 홈페이지 테스트 중...');
    await page.goto('file:///C:/Users/pc/teste/index.html');
    await page.waitForSelector('body', {timeout: 3000});
    
    const homeContent = await page.$eval('body', el => el.innerText.length);
    console.log('   콘텐츠 길이:', homeContent > 100 ? '✅ OK (' + homeContent + ' chars)' : '❌ EMPTY');
    
    // Linear 클래스 확인
    const linearButtons = await page.$$('.linear-button--primary');
    console.log('   Linear 버튼:', linearButtons.length > 0 ? '✅ ' + linearButtons.length + '개' : '❌ 없음');
    
    const linearCards = await page.$$('.linear-card');
    console.log('   Linear 카드:', linearCards.length > 0 ? '✅ ' + linearCards.length + '개' : '❌ 없음');
    
    // CSS 로딩 확인
    const cssLinks = await page.$$eval('link[rel="stylesheet"]', links => 
      links.map(link => link.href).filter(href => href.includes('styles'))
    );
    console.log('   CSS 파일:', cssLinks.length > 0 ? '✅ ' + cssLinks[0] : '❌ 없음');
    
    // MBTI 페이지 테스트
    console.log('\\n2. MBTI 페이지 테스트 중...');
    await page.goto('file:///C:/Users/pc/teste/tests/mbti/index.html');
    await page.waitForSelector('body', {timeout: 3000});
    
    const mbtiContent = await page.$eval('body', el => el.innerText.length);
    console.log('   콘텐츠 길이:', mbtiContent > 100 ? '✅ OK (' + mbtiContent + ' chars)' : '❌ EMPTY');
    
    const mbtiCards = await page.$$('.linear-card');
    console.log('   Linear 카드:', mbtiCards.length > 0 ? '✅ ' + mbtiCards.length + '개' : '❌ 없음');
    
    const mbtiButtons = await page.$$('.linear-button--primary');
    console.log('   Linear 버튼:', mbtiButtons.length > 0 ? '✅ ' + mbtiButtons.length + '개' : '❌ 없음');
    
    console.log('\\n🎉 페이지 검증 완료!');
    console.log('\\n📊 결과 요약:');
    console.log('- 홈페이지: ' + (homeContent > 100 && linearButtons.length > 0 ? '✅ 정상' : '❌ 문제 있음'));
    console.log('- MBTI 페이지: ' + (mbtiContent > 100 && mbtiCards.length > 0 ? '✅ 정상' : '❌ 문제 있음'));
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    if (browser) await browser.close();
  }
})();