import { chromium } from 'playwright';

async function testFortunePages() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 운세 페이지 간단 테스트...\n');
    
    // 페이지별 스크린샷만 찍기
    const pages = [
        { name: '홈페이지', url: 'https://doha.kr/' },
        { name: '사주 운세', url: 'https://doha.kr/fortune/saju/' },
        { name: '일일 운세', url: 'https://doha.kr/fortune/daily/' }
    ];
    
    for (const pageInfo of pages) {
        console.log(`📸 ${pageInfo.name} 스크린샷...`);
        await page.goto(pageInfo.url);
        await page.waitForTimeout(5000); // 5초 대기
        
        // 스크린샷
        await page.screenshot({ 
            path: `test-${pageInfo.name.replace(' ', '-')}.png`, 
            fullPage: true 
        });
        
        // 네비게이션 체크
        const navVisible = await page.isVisible('nav');
        console.log(`   네비게이션: ${navVisible ? '✅ 표시됨' : '❌ 표시안됨'}`);
        
        // 푸터 체크
        const footerVisible = await page.isVisible('footer');
        console.log(`   푸터: ${footerVisible ? '✅ 표시됨' : '❌ 표시안됨'}\n`);
    }
    
    console.log('✅ 테스트 완료');
    
    await browser.close();
}

testFortunePages().catch(console.error);