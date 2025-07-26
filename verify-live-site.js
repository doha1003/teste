// 실제 사이트에서 변경사항 확인
import { chromium } from 'playwright';

async function verifyChanges() {
    const browser = await chromium.launch({ 
        headless: false,
        devtools: true 
    });
    
    const context = await browser.newContext({
        // 캐시 무시 설정
        bypassCSP: true,
        ignoreHTTPSErrors: true,
        extraHTTPHeaders: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    });
    
    console.log('🔍 실제 사이트 변경사항 확인...\n');
    
    // 1. 일일운세 테스트
    console.log('1️⃣ 일일운세 페이지 테스트');
    const dailyPage = await context.newPage();
    
    // 강제 새로고침
    await dailyPage.goto('https://doha.kr/fortune/daily/', { 
        waitUntil: 'networkidle',
        timeout: 30000 
    });
    
    // Ctrl+F5로 강제 새로고침
    await dailyPage.keyboard.down('Control');
    await dailyPage.keyboard.press('F5');
    await dailyPage.keyboard.up('Control');
    await dailyPage.waitForLoadState('networkidle');
    
    // HTML 소스 확인
    const dailyHtml = await dailyPage.content();
    const hasCacheBusting = dailyHtml.includes('.js?v=');
    const hasCdnJsdelivr = dailyHtml.includes('cdn.jsdelivr.net');
    
    console.log(`   캐시 버스팅 적용: ${hasCacheBusting ? '✅' : '❌'}`);
    console.log(`   CDN 변경 적용: ${hasCdnJsdelivr ? '✅' : '❌'}`);
    
    // 폼 테스트
    await dailyPage.fill('#userName', '테스트');
    await dailyPage.selectOption('#birthYear', '1990');
    await dailyPage.selectOption('#birthMonth', '5');
    await dailyPage.selectOption('#birthDay', '15');
    await dailyPage.selectOption('#birthTime', '12');
    
    // 제출 전 스크린샷
    await dailyPage.screenshot({ path: 'daily-before.png' });
    
    // 폼 제출
    await dailyPage.locator('form').evaluate(form => form.submit());
    await dailyPage.waitForTimeout(3000);
    
    // 결과 확인
    const resultVisible = await dailyPage.isVisible('#fortuneResult');
    const hasResultCard = await dailyPage.locator('.fortune-result-card').count() > 0;
    
    console.log(`   결과 영역 표시: ${resultVisible ? '✅' : '❌'}`);
    console.log(`   결과 카드 표시: ${hasResultCard ? '✅' : '❌'}`);
    
    // 제출 후 스크린샷
    await dailyPage.screenshot({ path: 'daily-after.png' });
    
    // 2. 사주팔자 테스트
    console.log('\n2️⃣ 사주팔자 페이지 테스트');
    const sajuPage = await context.newPage();
    
    await sajuPage.goto('https://doha.kr/fortune/saju/', { 
        waitUntil: 'networkidle',
        timeout: 30000 
    });
    
    // 강제 새로고침
    await sajuPage.keyboard.down('Control');
    await sajuPage.keyboard.press('F5');
    await sajuPage.keyboard.up('Control');
    await sajuPage.waitForLoadState('networkidle');
    
    // JavaScript 소스 확인
    const sajuJs = await sajuPage.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[src*="saju-fortune-inline.js"]'));
        return scripts.map(s => s.src);
    });
    
    console.log(`   JS 파일 URL: ${sajuJs[0] || 'Not found'}`);
    
    // 콘솔 에러 체크
    const errors = [];
    sajuPage.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    
    await sajuPage.waitForTimeout(2000);
    console.log(`   콘솔 에러: ${errors.length}개`);
    if (errors.length > 0) {
        errors.slice(0, 3).forEach(err => console.log(`      - ${err}`));
    }
    
    await browser.close();
    
    console.log('\n💡 변경사항이 보이지 않는다면:');
    console.log('   1. 브라우저에서 Ctrl+Shift+Delete로 캐시 삭제');
    console.log('   2. 또는 시크릿/프라이빗 모드에서 확인');
    console.log('   3. GitHub Pages는 최대 10분까지 캐시될 수 있음');
}

verifyChanges().catch(console.error);