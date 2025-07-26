import { chromium } from 'playwright';

async function quickVisualTest() {
    console.log('🔍 빠른 시각적 테스트 시작...\n');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    const testPages = [
        { name: '홈페이지', url: 'https://doha.kr/' },
        { name: '사주 운세', url: 'https://doha.kr/fortune/saju/' },
        { name: '일일 운세', url: 'https://doha.kr/fortune/daily/' },
        { name: '타로 운세', url: 'https://doha.kr/fortune/tarot/' },
        { name: 'MBTI 테스트', url: 'https://doha.kr/tests/mbti/' },
        { name: 'BMI 계산기', url: 'https://doha.kr/tools/bmi-calculator.html' }
    ];
    
    console.log('페이지별 빠른 체크:');
    console.log('━'.repeat(70));
    
    for (const testPage of testPages) {
        try {
            await page.goto(testPage.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForTimeout(3000);
            
            // 기본 요소 체크
            const navExists = await page.$('nav') !== null;
            const footerExists = await page.$('footer') !== null;
            const hasContent = await page.evaluate(() => document.body.textContent.length > 100);
            
            // CSS 로드 체크
            const cssLoaded = await page.evaluate(() => {
                const styles = window.getComputedStyle(document.body);
                return styles.fontFamily !== 'Times New Roman';
            });
            
            // 콘솔 에러 체크
            const errors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') errors.push(msg.text());
            });
            
            console.log(`\n${testPage.name}:`);
            console.log(`  URL: ${testPage.url}`);
            console.log(`  네비게이션: ${navExists ? '✅' : '❌'}`);
            console.log(`  푸터: ${footerExists ? '✅' : '❌'}`);
            console.log(`  콘텐츠: ${hasContent ? '✅' : '❌'}`);
            console.log(`  CSS 로드: ${cssLoaded ? '✅' : '❌'}`);
            
            // 스크린샷
            await page.screenshot({ 
                path: `quick-test-${testPage.name.replace(/\s+/g, '-')}.png`,
                fullPage: false 
            });
            
        } catch (error) {
            console.log(`\n${testPage.name}: ❌ 에러 - ${error.message}`);
        }
    }
    
    console.log('\n' + '━'.repeat(70));
    console.log('✅ 빠른 테스트 완료');
    
    await browser.close();
}

quickVisualTest().catch(console.error);