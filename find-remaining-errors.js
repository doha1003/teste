// 남은 TypeScript 구문 찾기
import { chromium } from 'playwright';

const ERROR_PAGES = [
    'https://doha.kr/tests/love-dna/',
    'https://doha.kr/tools/',
    'https://doha.kr/fortune/',
    'https://doha.kr/fortune/saju/',
    'https://doha.kr/fortune/zodiac/',
    'https://doha.kr/fortune/zodiac-animal/',
    'https://doha.kr/tests/love-dna/test.html'
];

async function findErrors() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    
    console.log('🔍 에러가 발생하는 페이지의 콘솔 메시지 수집...\n');
    
    for (const url of ERROR_PAGES) {
        console.log(`\n📄 ${url}`);
        const page = await context.newPage();
        
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push({
                    text: msg.text(),
                    location: msg.location()
                });
            }
        });
        
        page.on('pageerror', error => {
            errors.push({
                text: error.message,
                stack: error.stack
            });
        });
        
        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForTimeout(2000);
            
            if (errors.length > 0) {
                console.log(`   ❌ ${errors.length}개 에러 발견:`);
                errors.forEach((err, idx) => {
                    console.log(`   ${idx + 1}. ${err.text}`);
                    if (err.location?.url) {
                        console.log(`      파일: ${err.location.url}`);
                        console.log(`      위치: 줄 ${err.location.lineNumber}, 열 ${err.location.columnNumber}`);
                    }
                });
            } else {
                console.log('   ✅ 에러 없음');
            }
        } catch (e) {
            console.log(`   ⚠️  페이지 로드 실패: ${e.message}`);
        }
        
        await page.close();
    }
    
    await browser.close();
}

findErrors().catch(console.error);