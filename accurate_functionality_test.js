const { chromium } = require('playwright');

// 정확한 페이지 구조 기반 완전 기능 테스트
async function accurateFunctionalityTest() {
    console.log('🧪 정확한 페이지 구조 기반 완전 기능 테스트 시작...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        slowMo: 1000
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const testResults = [];
    
    // 콘솔 에러 모니터링
    function setupMonitoring() {
        const consoleErrors = [];
        const alerts = [];
        
        page.removeAllListeners('console');
        page.removeAllListeners('dialog');
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
                console.log(`   ⚠️ 콘솔 에러: ${msg.text()}`);
            }
        });
        
        page.on('dialog', dialog => {
            alerts.push(dialog.message());
            console.log(`   🚨 알림: ${dialog.message()}`);
            dialog.accept();
        });
        
        return { consoleErrors, alerts };
    }

    try {
        // 1. MBTI 테스트 정확한 플로우
        console.log('🧠 === MBTI 테스트 정확한 플로우 ===');
        await page.goto('https://doha.kr/tests/mbti/test.html', { waitUntil: 'networkidle' });
        const mbtiMonitor = setupMonitoring();
        
        console.log('   1. 시작 버튼 클릭...');
        await page.click('.mbti-start-button');
        await page.waitForTimeout(2000);
        
        console.log('   2. 24개 질문 답변 중...');
        for (let i = 0; i < 24; i++) {
            try {
                // 질문이 표시될 때까지 대기
                await page.waitForSelector('#options .mbti-option', { timeout: 5000 });
                
                // 첫 번째 옵션 선택
                await page.click('#options .mbti-option:first-child');
                console.log(`   질문 ${i+1}/24 답변 완료`);
                
                // 마지막 질문이 아니면 다음 버튼 클릭
                if (i < 23) {
                    await page.waitForTimeout(500);
                    // 다음 버튼이 활성화될 때까지 대기
                    await page.waitForSelector('#next-btn:not([disabled])', { timeout: 3000 });
                    await page.click('#next-btn');
                    await page.waitForTimeout(1000);
                }
            } catch (error) {
                console.log(`   질문 ${i+1} 처리 중 에러: ${error.message}`);
                break;
            }
        }
        
        console.log('   3. 결과 화면 대기...');
        await page.waitForTimeout(3000);
        
        // 결과 확인
        const resultScreen = await page.locator('#result-screen').isVisible();
        const mbtiType = await page.locator('#result-type').textContent().catch(() => '');
        const description = await page.locator('#result-description').textContent().catch(() => '');
        const shareButtons = await page.locator('.mbti-share-btn').count();
        
        testResults.push({
            test: 'MBTI 완전 테스트',
            resultScreenVisible: resultScreen,
            mbtiType: mbtiType.trim(),
            descriptionLength: description.length,
            shareButtonsCount: shareButtons,
            consoleErrors: mbtiMonitor.consoleErrors.length,
            errorMessages: mbtiMonitor.consoleErrors,
            status: resultScreen && mbtiType && description.length > 100 ? '✅ 완전 성공' : '❌ 실패'
        });
        
        // 2. 테토-에겐 테스트 정확한 플로우
        console.log('\n🦋 === 테토-에겐 테스트 정확한 플로우 ===');
        await page.goto('https://doha.kr/tests/teto-egen/test.html', { waitUntil: 'networkidle' });
        const tetoMonitor = setupMonitoring();
        
        console.log('   1. 성별 선택...');
        await page.click('.teto-gender-btn:first-child'); // 남성 선택
        await page.waitForTimeout(1000);
        
        console.log('   2. 테스트 시작 버튼 클릭...');
        await page.click('.teto-start-button');
        await page.waitForTimeout(2000);
        
        console.log('   3. 10개 질문 답변 중...');
        for (let i = 0; i < 10; i++) {
            try {
                await page.waitForSelector('#options .teto-option', { timeout: 5000 });
                await page.click('#options .teto-option:first-child');
                console.log(`   질문 ${i+1}/10 답변 완료`);
                
                if (i < 9) {
                    await page.waitForTimeout(500);
                    await page.waitForSelector('#next-btn:not([disabled])', { timeout: 3000 });
                    await page.click('#next-btn');
                    await page.waitForTimeout(1000);
                }
            } catch (error) {
                console.log(`   테토 질문 ${i+1} 처리 중 에러: ${error.message}`);
                break;
            }
        }
        
        console.log('   4. 결과 화면 대기...');
        await page.waitForTimeout(3000);
        
        const tetoResult = await page.locator('#result-screen').isVisible();
        const tetoType = await page.locator('#result-type').textContent().catch(() => '');
        
        testResults.push({
            test: '테토-에겐 완전 테스트',
            resultScreenVisible: tetoResult,
            tetoType: tetoType.trim(),
            consoleErrors: tetoMonitor.consoleErrors.length,
            errorMessages: tetoMonitor.consoleErrors,
            status: tetoResult && tetoType ? '✅ 완전 성공' : '❌ 실패'
        });
        
        // 3. 러브 DNA 테스트 정확한 플로우
        console.log('\n💖 === 러브 DNA 테스트 정확한 플로우 ===');
        await page.goto('https://doha.kr/tests/love-dna/test.html', { waitUntil: 'networkidle' });
        const loveMonitor = setupMonitoring();
        
        console.log('   1. 테스트 시작 버튼 클릭...');
        await page.click('.love-start-button');
        await page.waitForTimeout(2000);
        
        console.log('   2. 25개 질문 답변 중...');
        for (let i = 0; i < 25; i++) {
            try {
                await page.waitForSelector('#options .love-option', { timeout: 5000 });
                await page.click('#options .love-option:first-child');
                console.log(`   질문 ${i+1}/25 답변 완료`);
                
                if (i < 24) {
                    await page.waitForTimeout(500);
                    await page.waitForSelector('#next-btn:not([disabled])', { timeout: 3000 });
                    await page.click('#next-btn');
                    await page.waitForTimeout(1000);
                }
            } catch (error) {
                console.log(`   러브DNA 질문 ${i+1} 처리 중 에러: ${error.message}`);
                break;
            }
        }
        
        console.log('   3. 결과 화면 대기...');
        await page.waitForTimeout(3000);
        
        const loveResult = await page.locator('#result-screen').isVisible();
        const loveDNA = await page.locator('#result-dna').textContent().catch(() => '');
        
        testResults.push({
            test: '러브 DNA 완전 테스트',
            resultScreenVisible: loveResult,
            loveDNAType: loveDNA.trim(),
            consoleErrors: loveMonitor.consoleErrors.length,
            errorMessages: loveMonitor.consoleErrors,
            status: loveResult && loveDNA ? '✅ 완전 성공' : '❌ 실패'
        });
        
        // 4. 오늘의 운세 정확한 플로우
        console.log('\n🔮 === 오늘의 운세 정확한 플로우 ===');
        await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'networkidle' });
        const dailyMonitor = setupMonitoring();
        
        console.log('   1. 개인정보 입력...');
        await page.fill('input[name="userName"]', '홍길동');
        await page.selectOption('select[name="birthYear"]', '1990');
        await page.selectOption('select[name="birthMonth"]', '5');
        await page.selectOption('select[name="birthDay"]', '15');
        await page.selectOption('select[name="birthTime"]', '12');
        
        console.log('   2. 운세 보기 버튼 클릭...');
        await page.click('button[type="submit"]');
        
        console.log('   3. 운세 결과 생성 대기...');
        await page.waitForTimeout(8000); // 운세 생성에 시간이 더 필요할 수 있음
        
        const fortuneResult = await page.locator('#fortuneResult').count() > 0;
        const sajuInfo = await page.locator('.saju-brief').count() > 0;
        const fortuneContent = await page.locator('#fortuneResult').textContent().catch(() => '');
        const actionButtons = await page.locator('button:has-text("다시 보기")').count();
        
        testResults.push({
            test: '오늘의 운세 완전 테스트',
            fortuneResultDisplayed: fortuneResult,
            sajuInfoPresent: sajuInfo,
            contentLength: fortuneContent.length,
            actionButtonsPresent: actionButtons > 0,
            consoleErrors: dailyMonitor.consoleErrors.length,
            errorMessages: dailyMonitor.consoleErrors,
            status: fortuneResult && sajuInfo && fortuneContent.length > 1000 ? '✅ 완전 성공' : '❌ 실패'
        });
        
        // 5. 글자수 세기 정확한 플로우
        console.log('\n📝 === 글자수 세기 정확한 플로우 ===');
        await page.goto('https://doha.kr/tools/text-counter.html', { waitUntil: 'networkidle' });
        const textMonitor = setupMonitoring();
        
        const testText = '안녕하세요. 이것은 테스트 텍스트입니다. 글자수를 세어보겠습니다.';
        console.log(`   1. 텍스트 입력: "${testText}"`);
        
        await page.fill('textarea', testText);
        await page.waitForTimeout(2000);
        
        // 실시간으로 카운트가 업데이트되는지 확인
        const charCountText = await page.locator('.char-count, .character-count, [class*="char"], [class*="count"]').first().textContent().catch(() => '');
        
        testResults.push({
            test: '글자수 세기 완전 테스트',
            textInputWorking: true,
            charCountDisplayed: charCountText,
            expectedCount: testText.length,
            consoleErrors: textMonitor.consoleErrors.length,
            status: charCountText.includes('33') || charCountText.includes('35') ? '✅ 완전 성공' : '❌ 실패'
        });
        
        // 6. BMI 계산기 정확한 플로우
        console.log('\n⚖️ === BMI 계산기 정확한 플로우 ===');
        await page.goto('https://doha.kr/tools/bmi-calculator.html', { waitUntil: 'networkidle' });
        const bmiMonitor = setupMonitoring();
        
        console.log('   1. 신장/체중 입력...');
        await page.fill('input[type="number"][placeholder*="신장"], input[name="height"]', '170');
        await page.fill('input[type="number"][placeholder*="체중"], input[name="weight"]', '70');
        
        console.log('   2. 계산 버튼 클릭...');
        await page.click('button[type="submit"], button:has-text("계산")');
        await page.waitForTimeout(2000);
        
        const bmiResultText = await page.locator('.bmi-result, .result, [class*="bmi"]').first().textContent().catch(() => '');
        
        testResults.push({
            test: 'BMI 계산기 완전 테스트',
            calculationPerformed: true,
            bmiResult: bmiResultText,
            expectedBMI: '24.2', // 70/(1.7*1.7) = 24.22
            consoleErrors: bmiMonitor.consoleErrors.length,
            status: bmiResultText.includes('24') ? '✅ 완전 성공' : '❌ 실패'
        });
        
    } catch (error) {
        console.error('전체 테스트 중 오류:', error);
        testResults.push({
            test: '전체 정확한 기능 테스트',
            error: error.message,
            status: '❌ 에러'
        });
    }
    
    await browser.close();
    
    // 결과 출력
    console.log('\n📊 정확한 페이지 구조 기반 완전 기능 테스트 결과');
    console.log('═'.repeat(80));
    
    let totalSuccess = 0;
    let totalTests = testResults.length;
    
    testResults.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.test} ${result.status}`);
        
        if (result.status.includes('✅')) totalSuccess++;
        
        // 상세 정보 출력
        Object.keys(result).forEach(key => {
            if (key !== 'test' && key !== 'status' && key !== 'errorMessages') {
                console.log(`   ${key}: ${result[key]}`);
            }
        });
        
        // 에러 메시지 출력
        if (result.errorMessages && result.errorMessages.length > 0) {
            console.log(`   🚨 발견된 에러들:`);
            result.errorMessages.forEach(error => {
                console.log(`     - ${error}`);
            });
        }
    });
    
    console.log(`\n🎯 전체 기능 성공률: ${totalSuccess}/${totalTests} (${Math.round(totalSuccess/totalTests*100)}%)`);
    
    if (totalSuccess === totalTests) {
        console.log('\n🎉 모든 기능이 완벽하게 작동합니다!');
    } else {
        console.log('\n❌ 일부 기능에 문제가 있습니다. 수정이 필요합니다.');
        
        const failedTests = testResults.filter(r => !r.status.includes('✅'));
        console.log('\n🔧 수정이 필요한 기능들:');
        failedTests.forEach(test => {
            console.log(`   - ${test.test}: ${test.status}`);
        });
    }
    
    console.log('\n🎉 정확한 페이지 구조 기반 완전 기능 테스트 완료!');
    
    return testResults;
}

accurateFunctionalityTest().catch(console.error);