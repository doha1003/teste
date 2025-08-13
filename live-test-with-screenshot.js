import puppeteer from 'puppeteer';

async function testLiveSite() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox'] 
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else if (msg.type() === 'warning') {
      warnings.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  console.log('Testing https://doha.kr ...');
  
  await page.goto('https://doha.kr', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  await page.screenshot({ path: 'live-homepage-current.png', fullPage: true });
  
  // Check CSS loading
  const hasCSS = await page.evaluate(() => {
    const styles = window.getComputedStyle(document.body);
    return styles.fontFamily.includes('Pretendard');
  });
  
  // Check content
  const pageInfo = await page.evaluate(() => {
    return {
      title: document.title,
      hasNavbar: \!\!document.querySelector('.navbar, nav, header'),
      hasContent: document.body.innerText.length > 100,
      backgroundColor: window.getComputedStyle(document.body).backgroundColor,
      primaryColor: window.getComputedStyle(document.querySelector('h1, .hero-title, .page-title') || document.body).color
    };
  });
  
  console.log('\n=== 홈페이지 상태 ===');
  console.log('Title:', pageInfo.title);
  console.log('Has CSS:', hasCSS);
  console.log('Has Navbar:', pageInfo.hasNavbar);
  console.log('Has Content:', pageInfo.hasContent);
  console.log('Background:', pageInfo.backgroundColor);
  console.log('Text Color:', pageInfo.primaryColor);
  console.log('Console Errors:', errors.length);
  console.log('Warnings:', warnings.length);
  
  if (errors.length > 0) {
    console.log('\n=== 오류 목록 ===');
    errors.slice(0, 5).forEach(e => console.log('- ', e.substring(0, 100)));
  }
  
  console.log('\n스크린샷 저장: live-homepage-current.png');
  
  await browser.close();
}

testLiveSite().catch(console.error);
