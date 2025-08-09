import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugMBTIPage() {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // 브라우저 콘솔 로그 캐치
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });

    // 파일 URL로 페이지 로드
    const mbtiPath = path.join(__dirname, 'tests', 'mbti', 'test.html');
    await page.goto(`file://${mbtiPath}`, { waitUntil: 'networkidle0' });

    // 2초 대기
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 페이지의 모든 정보 확인
    const debug = await page.evaluate(() => {
      return {
        title: document.title,
        bodyClasses: Array.from(document.body.classList),
        allElements: Array.from(document.querySelectorAll('*')).map(el => ({
          tagName: el.tagName.toLowerCase(),
          id: el.id,
          classList: Array.from(el.classList),
          textContent: el.textContent ? el.textContent.substring(0, 50) : ''
        })).filter(el => el.id || el.classList.length > 0 || el.textContent.includes('MBTI') || el.textContent.includes('시작')),
        
        // 특정 요소들 확인
        headerTitle: document.querySelector('.mbti-header-title'),
        startButton: document.querySelector('.mbti-start-button'),
        testButton: document.querySelector('.test-start-button'),
        introScreen: document.querySelector('#intro-screen'),
        
        // 버튼들 확인
        allButtons: Array.from(document.querySelectorAll('button')).map(btn => ({
          textContent: btn.textContent.trim(),
          classList: Array.from(btn.classList),
          id: btn.id,
          style: btn.style.display
        })),
        
        // div들 확인
        allDivs: Array.from(document.querySelectorAll('div')).map(div => ({
          id: div.id,
          classList: Array.from(div.classList),
          textContent: div.textContent ? div.textContent.substring(0, 30) : '',
          style: div.style.display
        })).filter(div => div.id || div.classList.some(cls => cls.includes('mbti') || cls.includes('intro') || cls.includes('start')))
      };
    });

    console.log('\n🔍 MBTI 페이지 디버그 정보:');
    console.log('제목:', debug.title);
    console.log('Body 클래스:', debug.bodyClasses);
    
    console.log('\n📋 주요 요소들:');
    console.log('헤더 제목 존재:', !!debug.headerTitle);
    console.log('MBTI 시작 버튼 존재:', !!debug.startButton);
    console.log('테스트 시작 버튼 존재:', !!debug.testButton);
    console.log('인트로 화면 존재:', !!debug.introScreen);
    
    console.log('\n🔘 모든 버튼들:');
    debug.allButtons.forEach((btn, i) => {
      console.log(`  ${i + 1}. "${btn.textContent}" - 클래스: [${btn.classList.join(', ')}] - ID: ${btn.id} - Display: ${btn.style}`);
    });
    
    console.log('\n📦 MBTI 관련 DIV들:');
    debug.allDivs.forEach((div, i) => {
      console.log(`  ${i + 1}. ID: ${div.id} - 클래스: [${div.classList.join(', ')}] - 텍스트: "${div.textContent}" - Display: ${div.style}`);
    });
    
    console.log('\n🎯 중요 요소들 (ID나 클래스 있는 것들):');
    debug.allElements.slice(0, 20).forEach((el, i) => {
      console.log(`  ${i + 1}. <${el.tagName}> ID: ${el.id} - 클래스: [${el.classList.join(', ')}] - 텍스트: "${el.textContent}"`);
    });

    // 스크린샷 찍기
    await page.screenshot({path: 'mbti-debug.png', fullPage: true});
    console.log('\n📸 스크린샷 저장됨: mbti-debug.png');

    // 5초 대기 후 닫기
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.error('디버그 에러:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugMBTIPage();