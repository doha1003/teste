import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testToolsPage() {
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
    const toolsPath = path.join(__dirname, 'tools', 'text-counter.html');
    await page.goto(`file://${toolsPath}`, { waitUntil: 'networkidle0' });

    // 1초 대기 후 요소들 확인
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 중요한 요소들이 로드되었는지 확인
    const elements = await page.evaluate(() => {
      return {
        textArea: !!document.querySelector('#textInput'),
        charCount: !!document.querySelector('#totalChars'),
        wordCount: !!document.querySelector('#words'),
        buttons: document.querySelectorAll('button').length,
        cssLoaded: getComputedStyle(document.body).fontFamily !== 'Times',
        // 추가 정보
        allIds: Array.from(document.querySelectorAll('[id]')).map((el) => el.id),
      };
    });

    console.log('\n=== 글자수 세기 도구 확인 ===');
    console.log('텍스트 입력창:', elements.textArea ? '✅' : '❌');
    console.log('글자수 표시:', elements.charCount ? '✅' : '❌');
    console.log('단어수 표시:', elements.wordCount ? '✅' : '❌');
    console.log('버튼 개수:', elements.buttons, '개');
    console.log('CSS 로드:', elements.cssLoaded ? '✅' : '❌');
    console.log('페이지의 모든 ID들:', elements.allIds);

    // 기능 테스트: 텍스트 입력 (올바른 ID 사용)
    if (elements.textArea) {
      await page.type('#textInput', '안녕하세요! 이것은 테스트 메시지입니다.');
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const results = await page.evaluate(() => {
      const textArea = document.querySelector('#textInput');
      const charCountElement = document.querySelector('#totalChars');

      return {
        inputValue: textArea ? textArea.value : null,
        charCountText: charCountElement ? charCountElement.textContent : null,
      };
    });

    console.log('\n=== 기능 테스트 결과 ===');
    console.log('입력된 텍스트:', results.inputValue);
    console.log('글자수 표시:', results.charCountText);

    // 스크린샷 찍기
    await page.screenshot({ path: 'tools-test.png', fullPage: true });
    console.log('\n스크린샷 저장됨: tools-test.png');

    // 3초 대기 후 닫기
    await new Promise((resolve) => setTimeout(resolve, 3000));
  } catch (error) {
    console.error('테스트 에러:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testToolsPage();
