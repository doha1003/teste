const { chromium } = require('playwright');

// 완전한 사용자 플로우 테스트 (결과까지 확인)
async function completeFlowTest() {
    console.log('🧪 완전한 사용자 플로우 테스트 시작...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        slowMo: 500
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const testResults = [];
    
    try {
        // 오늘의 운세 완벽 테스트
        console.log('🔍 오늘의 운세 완전한 플로우 테스트');
        await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'networkidle' });
        
        // 콘솔 에러 모니터링
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // 알림 창 모니터링
        const alerts = [];
        page.on('dialog', dialog => {
            alerts.push(dialog.message());
            dialog.accept();
        });
        
        // 폼 입력
        console.log('   📝 폼 입력 중...');
        await page.fill('input[name="userName"]', '홍길동');
        await page.selectOption('select[name="birthYear"]', '1990');
        await page.selectOption('select[name="birthMonth"]', '5');
        await page.selectOption('select[name="birthDay"]', '15');
        await page.selectOption('select[name="birthTime"]', '12');
        
        console.log('   🔘 제출 버튼 클릭...');
        await page.click('button[type="submit"]');
        
        // 결과 로딩 대기 (최대 10초)
        console.log('   ⏳ 결과 생성 대기...');
        await page.waitForTimeout(5000);
        
        // 결과 확인
        const fortuneResult = await page.locator('#fortuneResult').count();
        const resultContent = fortuneResult > 0 ? await page.locator('#fortuneResult').textContent() : '';
        
        // 사주팔자 정보 확인
        const sajuInfo = await page.locator('.saju-brief').count();
        const fortuneCards = await page.locator('.fortune-card').count();
        
        // 결과 버튼들 확인
        const reloadButton = await page.locator('button:has-text("다시 보기")').count();
        const shareButton = await page.locator('button:has-text("공유하기")').count();
        
        testResults.push({
            test: '오늘의 운세 완전 플로우',
            formFilled: true,
            resultDisplayed: fortuneResult > 0,
            sajuInfoPresent: sajuInfo > 0,
            fortuneCardsPresent: fortuneCards > 0,
            actionButtonsPresent: reloadButton > 0 && shareButton > 0,
            consoleErrors: consoleErrors.length,
            alerts: alerts.length,
            resultLength: resultContent.length,
            status: (fortuneResult > 0 && sajuInfo > 0 && consoleErrors.length === 0) ? '✅ 완전 성공' : '❌ 실패'
        });
        
        // MBTI 테스트 완전 플로우
        console.log('\n🔍 MBTI 테스트 완전한 플로우 테스트');
        await page.goto('https://doha.kr/tests/mbti/test.html', { waitUntil: 'networkidle' });
        
        const mbtiErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                mbtiErrors.push(msg.text());
            }
        });
        
        // 테스트 시작
        console.log('   🚀 테스트 시작...');
        await page.click('.mbti-start-button');
        await page.waitForTimeout(2000);
        
        // 첫 3개 질문 답변
        for (let i = 0; i < 3; i++) {
            const options = await page.locator('.mbti-option').count();
            if (options > 0) {
                await page.click('.mbti-option:first-child');
                await page.waitForTimeout(1000);
                
                // 다음 버튼 클릭
                const nextBtn = await page.locator('#next-btn').count();
                if (nextBtn > 0) {
                    await page.click('#next-btn');
                    await page.waitForTimeout(1000);
                }
            }
        }
        
        // 진행 상황 확인
        const progressText = await page.locator('#progress-text').textContent();
        const currentScreen = await page.locator('#test-screen').isVisible();
        
        testResults.push({
            test: 'MBTI 테스트 부분 플로우',
            testStarted: currentScreen,
            questionsAnswered: progressText ? progressText.includes('질문') : false,
            consoleErrors: mbtiErrors.length,
            status: (currentScreen && mbtiErrors.length === 0) ? '✅ 진행 중' : '❌ 실패'
        });
        
    } catch (error) {
        console.error('테스트 중 오류:', error);
        testResults.push({
            test: '전체 플로우 테스트',
            error: error.message,
            status: '❌ 에러'
        });
    }
    
    await browser.close();
    
    // 결과 출력
    console.log('\n📊 완전한 사용자 플로우 테스트 결과');
    console.log('═'.repeat(70));
    
    testResults.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.test} ${result.status}`);
        
        if (result.test.includes('오늘의 운세')) {
            console.log(`   📝 폼 입력: ${result.formFilled ? '✅' : '❌'}`);
            console.log(`   📄 결과 표시: ${result.resultDisplayed ? '✅' : '❌'}`);
            console.log(`   📊 사주 정보: ${result.sajuInfoPresent ? '✅' : '❌'}`);
            console.log(`   🎴 운세 카드: ${result.fortuneCardsPresent ? '✅' : '❌'}`);
            console.log(`   🔘 액션 버튼: ${result.actionButtonsPresent ? '✅' : '❌'}`);
            console.log(`   📏 결과 길이: ${result.resultLength} 글자`);
            console.log(`   ⚠️ 콘솔 에러: ${result.consoleErrors}개`);
            console.log(`   🚨 알림 창: ${result.alerts}개`);
        }
        
        if (result.error) console.log(`   💥 에러: ${result.error}`);
    });
    
    const successCount = testResults.filter(r => r.status.includes('✅')).length;
    const totalCount = testResults.length;
    
    console.log(`\n🎯 전체 성공률: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
    
    // 결과 판정
    const fortuneTest = testResults.find(r => r.test.includes('오늘의 운세'));
    if (fortuneTest) {
        if (fortuneTest.resultDisplayed && fortuneTest.sajuInfoPresent && fortuneTest.consoleErrors === 0) {
            console.log('\n🎉 오늘의 운세 기능이 완벽하게 작동합니다!');
        } else {
            console.log('\n❌ 오늘의 운세 기능에 문제가 있습니다.');
            if (!fortuneTest.resultDisplayed) console.log('   - 결과가 표시되지 않음');
            if (!fortuneTest.sajuInfoPresent) console.log('   - 사주 정보가 없음');
            if (fortuneTest.consoleErrors > 0) console.log('   - 콘솔 에러 발생');
        }
    }
    
    console.log('\n🎉 완전한 사용자 플로우 테스트 완료!');
    
    return testResults;
}

completeFlowTest().catch(console.error);