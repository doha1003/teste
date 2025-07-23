const { chromium } = require('playwright');

// 실제 사용자 시나리오 테스트
async function realUserScenarioTest() {
    console.log('🧪 실제 사용자 시나리오 테스트 시작...\n');
    
    const browser = await chromium.launch({ 
        headless: false, // 실제 브라우저로 보기
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        slowMo: 1000 // 천천히 실행
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const testResults = [];
    
    try {
        // 테스트 1: 오늘의 운세 페이지 실제 사용
        console.log('🔍 테스트 1: 오늘의 운세 기능 테스트');
        await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'networkidle' });
        
        // 폼 입력
        await page.fill('input[name="userName"]', '테스트유저');
        await page.selectOption('select[name="birthYear"]', '1990');
        await page.selectOption('select[name="birthMonth"]', '5');
        await page.selectOption('select[name="birthDay"]', '15');
        await page.selectOption('select[name="birthTime"]', '12');
        
        // 버튼 클릭 (CSS 확인)
        const submitButton = page.locator('button[type="submit"]');
        const buttonClass = await submitButton.getAttribute('class');
        console.log(`   버튼 클래스: ${buttonClass}`);
        
        // 실제 버튼 클릭
        await submitButton.click();
        
        // 결과 대기
        await page.waitForTimeout(3000);
        
        // 에러 메시지 확인
        const alerts = [];
        page.on('dialog', dialog => {
            alerts.push(dialog.message());
            dialog.accept();
        });
        
        // 결과 화면 확인
        const resultSection = await page.locator('#fortuneResult').count();
        
        testResults.push({
            test: '오늘의 운세',
            buttonClass: buttonClass,
            resultDisplayed: resultSection > 0,
            alerts: alerts,
            status: alerts.length === 0 && resultSection > 0 ? '✅ 성공' : '❌ 실패'
        });
        
        // 테스트 2: MBTI 테스트 페이지
        console.log('🔍 테스트 2: MBTI 테스트 기능 테스트');
        await page.goto('https://doha.kr/tests/mbti/test.html', { waitUntil: 'networkidle' });
        
        // 테스트 시작 버튼 클릭
        const startButton = page.locator('.mbti-start-button');
        const startButtonClass = await startButton.getAttribute('class');
        await startButton.click();
        
        // 첫 번째 질문 응답
        await page.waitForTimeout(2000);
        const firstOption = page.locator('.mbti-option').first();
        if (await firstOption.count() > 0) {
            await firstOption.click();
        }
        
        testResults.push({
            test: 'MBTI 테스트',
            buttonClass: startButtonClass,
            testStarted: await page.locator('#test-screen').isVisible(),
            status: await page.locator('#test-screen').isVisible() ? '✅ 성공' : '❌ 실패'
        });
        
        // 테스트 3: 문의 페이지
        console.log('🔍 테스트 3: 문의 페이지 폼 테스트');
        await page.goto('https://doha.kr/contact/', { waitUntil: 'networkidle' });
        
        const contactButton = page.locator('button[type="submit"]');
        const contactButtonClass = await contactButton.getAttribute('class');
        
        testResults.push({
            test: '문의 페이지',
            buttonClass: contactButtonClass,
            status: contactButtonClass.includes('btn') ? '✅ 성공' : '❌ 실패'
        });
        
    } catch (error) {
        console.error('테스트 중 오류:', error);
        testResults.push({
            test: '전체 테스트',
            error: error.message,
            status: '❌ 에러'
        });
    }
    
    await browser.close();
    
    // 결과 출력
    console.log('\n📊 실제 사용자 시나리오 테스트 결과');
    console.log('═'.repeat(60));
    
    testResults.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.test} ${result.status}`);
        if (result.buttonClass) console.log(`   버튼 클래스: ${result.buttonClass}`);
        if (result.alerts && result.alerts.length > 0) {
            console.log(`   알림 메시지: ${result.alerts.join(', ')}`);
        }
        if (result.error) console.log(`   에러: ${result.error}`);
    });
    
    const successCount = testResults.filter(r => r.status.includes('✅')).length;
    const totalCount = testResults.length;
    
    console.log(`\n🎯 전체 성공률: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
    console.log('\n🎉 실제 사용자 시나리오 테스트 완료!');
    
    return testResults;
}

realUserScenarioTest().catch(console.error);