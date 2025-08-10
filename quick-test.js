import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testHomePage() {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // 브라우저 콘솔 로그 캐치
    page.on('console', (msg) => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });

    // 에러 캐치
    page.on('error', (err) => {
      console.error(`[PAGE ERROR] ${err.message}`);
    });

    page.on('pageerror', (err) => {
      console.error(`[PAGE ERROR] ${err.message}`);
    });

    // 네트워크 요청 실패 캐치
    page.on('requestfailed', (request) => {
      console.error(`[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`);
    });

    // 파일 URL로 페이지 로드
    const indexPath = path.join(__dirname, 'index.html');
    await page.goto(`file://${indexPath}`, { waitUntil: 'networkidle0' });

    // 1초 대기 후 요소들 확인
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 중요한 요소들이 로드되었는지 확인
    const elements = await page.evaluate(() => {
      return {
        navbar: !!document.querySelector('.navbar'),
        heroTitle: !!document.querySelector('.hero-title'),
        services: !!document.querySelectorAll('.service-card').length,
        mobileMenuBtn: !!document.querySelector('.mobile-menu-btn'),
        cssLoaded:
          getComputedStyle(document.body).fontFamily.includes('Pretendard') ||
          getComputedStyle(document.body).fontFamily !== 'Times',
      };
    });

    console.log('\n=== 페이지 요소 확인 ===');
    console.log('네비게이션:', elements.navbar ? '✅' : '❌');
    console.log('히어로 제목:', elements.heroTitle ? '✅' : '❌');
    console.log('서비스 카드:', elements.services, '개');
    console.log('모바일 메뉴 버튼:', elements.mobileMenuBtn ? '✅' : '❌');
    console.log('CSS 로드:', elements.cssLoaded ? '✅' : '❌');

    // 스크린샷 찍기
    await page.screenshot({ path: 'homepage-test.png', fullPage: true });
    console.log('\n스크린샷 저장됨: homepage-test.png');

    // 5초 대기 후 닫기
    await new Promise((resolve) => setTimeout(resolve, 5000));
  } catch (error) {
    console.error('테스트 에러:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testHomePage();
