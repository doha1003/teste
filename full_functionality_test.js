const { chromium } = require('playwright');

// 전체 사이트 모든 기능 완전 테스트
async function fullFunctionalityTest() {
    console.log('🧪 전체 사이트 모든 기능 완전 테스트 시작...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        slowMo: 300
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const testResults = [];
    
    // 콘솔 에러 및 알림 모니터링 함수
    function setupMonitoring() {
        const consoleErrors = [];
        const alerts = [];
        
        page.removeAllListeners('console');
        page.removeAllListeners('dialog');
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        page.on('dialog', dialog => {
            alerts.push(dialog.message());
            dialog.accept();
        });
        
        return { consoleErrors, alerts };
    }

    try {
        // 1. 심리테스트 전체 테스트
        console.log('🧠 === 심리테스트 완전 테스트 ===');
        
        // 1-1. MBTI 테스트 완전 플로우
        console.log('\n🔍 MBTI 테스트 완전 플로우');
        await page.goto('https://doha.kr/tests/mbti/test.html', { waitUntil: 'networkidle' });
        const mbtiMonitor = setupMonitoring();
        
        // 테스트 시작
        await page.click('.mbti-start-button');
        await page.waitForTimeout(2000);
        
        // 24개 질문 모두 답변
        for (let i = 0; i < 24; i++) {
            try {
                await page.waitForSelector('.mbti-option', { timeout: 5000 });
                await page.click('.mbti-option:first-child');
                await page.waitForTimeout(500);
                
                // 마지막 질문이 아니면 다음 버튼 클릭
                if (i < 23) {
                    const nextBtn = await page.locator('#next-btn:not([disabled])');
                    if (await nextBtn.count() > 0) {
                        await nextBtn.click();
                        await page.waitForTimeout(500);
                    }
                }
            } catch (error) {
                console.log(`   질문 ${i+1} 처리 중 에러: ${error.message}`);
                break;
            }
        }
        
        // 결과 확인
        await page.waitForTimeout(3000);
        const mbtiResult = await page.locator('#result-screen').isVisible();
        const mbtiType = await page.locator('#result-type').textContent().catch(() => '');
        const mbtiDescription = await page.locator('#result-description').textContent().catch(() => '');
        
        testResults.push({
            test: 'MBTI 완전 테스트',
            resultDisplayed: mbtiResult,
            resultType: mbtiType,
            descriptionLength: mbtiDescription.length,
            consoleErrors: mbtiMonitor.consoleErrors.length,
            alerts: mbtiMonitor.alerts.length,
            status: mbtiResult && mbtiType && mbtiDescription.length > 100 ? '✅ 완전 성공' : '❌ 실패'
        });
        
        // 1-2. 테토-에겐 테스트 완전 플로우
        console.log('\n🔍 테토-에겐 테스트 완전 플로우');
        await page.goto('https://doha.kr/tests/teto-egen/test.html', { waitUntil: 'networkidle' });
        const tetoMonitor = setupMonitoring();
        
        await page.click('.teto-start-button');
        await page.waitForTimeout(2000);
        
        // 10개 질문 답변
        for (let i = 0; i < 10; i++) {
            try {
                await page.waitForSelector('.teto-option', { timeout: 5000 });
                await page.click('.teto-option:first-child');
                await page.waitForTimeout(500);
                
                if (i < 9) {
                    const nextBtn = await page.locator('#next-btn:not([disabled])');
                    if (await nextBtn.count() > 0) {
                        await nextBtn.click();
                        await page.waitForTimeout(500);
                    }
                }
            } catch (error) {
                console.log(`   테토 질문 ${i+1} 처리 중 에러: ${error.message}`);
                break;
            }
        }
        
        await page.waitForTimeout(3000);
        const tetoResult = await page.locator('#result-screen').isVisible();
        const tetoType = await page.locator('#result-type').textContent().catch(() => '');
        
        testResults.push({
            test: '테토-에겐 완전 테스트',
            resultDisplayed: tetoResult,
            resultType: tetoType,
            consoleErrors: tetoMonitor.consoleErrors.length,
            alerts: tetoMonitor.alerts.length,
            status: tetoResult && tetoType ? '✅ 완전 성공' : '❌ 실패'
        });
        
        // 1-3. 러브 DNA 테스트 완전 플로우
        console.log('\n🔍 러브 DNA 테스트 완전 플로우');
        await page.goto('https://doha.kr/tests/love-dna/test.html', { waitUntil: 'networkidle' });
        const loveMonitor = setupMonitoring();
        
        await page.click('.love-start-button');
        await page.waitForTimeout(2000);
        
        // 25개 질문 답변
        for (let i = 0; i < 25; i++) {
            try {
                await page.waitForSelector('.love-option', { timeout: 5000 });
                await page.click('.love-option:first-child');
                await page.waitForTimeout(500);
                
                if (i < 24) {
                    const nextBtn = await page.locator('#next-btn:not([disabled])');
                    if (await nextBtn.count() > 0) {
                        await nextBtn.click();
                        await page.waitForTimeout(500);
                    }
                }
            } catch (error) {
                console.log(`   러브DNA 질문 ${i+1} 처리 중 에러: ${error.message}`);
                break;
            }
        }
        
        await page.waitForTimeout(3000);
        const loveResult = await page.locator('#result-screen').isVisible();
        const loveDNA = await page.locator('#result-dna').textContent().catch(() => '');
        
        testResults.push({
            test: '러브 DNA 완전 테스트',
            resultDisplayed: loveResult,
            resultType: loveDNA,
            consoleErrors: loveMonitor.consoleErrors.length,
            alerts: loveMonitor.alerts.length,
            status: loveResult && loveDNA ? '✅ 완전 성공' : '❌ 실패'
        });
        
        // 2. 운세 기능 전체 테스트
        console.log('\n🔮 === 운세 기능 완전 테스트 ===');
        
        // 2-1. 오늘의 운세
        console.log('\n🔍 오늘의 운세 완전 플로우');
        await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'networkidle' });
        const dailyMonitor = setupMonitoring();
        
        await page.fill('input[name="userName"]', '홍길동');
        await page.selectOption('select[name="birthYear"]', '1990');
        await page.selectOption('select[name="birthMonth"]', '5');
        await page.selectOption('select[name="birthDay"]', '15');
        await page.selectOption('select[name="birthTime"]', '12');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(5000);
        
        const dailyResult = await page.locator('#fortuneResult').count() > 0;
        const sajuInfo = await page.locator('.saju-brief').count() > 0;
        const fortuneContent = await page.locator('#fortuneResult').textContent().catch(() => '');
        
        testResults.push({
            test: '오늘의 운세 완전 테스트',
            resultDisplayed: dailyResult,
            sajuInfoPresent: sajuInfo,
            contentLength: fortuneContent.length,
            consoleErrors: dailyMonitor.consoleErrors.length,
            alerts: dailyMonitor.alerts.length,
            status: dailyResult && sajuInfo && fortuneContent.length > 1000 ? '✅ 완전 성공' : '❌ 실패'
        });
        
        // 2-2. AI 사주팔자
        console.log('\n🔍 AI 사주팔자 완전 플로우');
        await page.goto('https://doha.kr/fortune/saju/', { waitUntil: 'networkidle' });
        const sajuMonitor = setupMonitoring();
        
        // 사주팔자 폼 입력 및 결과 확인
        try {
            await page.fill('input[name="name"]', '김철수');
            await page.selectOption('select[name="year"]', '1985');
            await page.selectOption('select[name="month"]', '3');
            await page.selectOption('select[name="day"]', '20');
            await page.selectOption('select[name="hour"]', '14');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(5000);
            
            const sajuResult = await page.locator('.saju-result').count() > 0;
            testResults.push({
                test: 'AI 사주팔자 완전 테스트',
                resultDisplayed: sajuResult,
                consoleErrors: sajuMonitor.consoleErrors.length,
                status: sajuResult ? '✅ 완전 성공' : '❌ 실패'
            });
        } catch (error) {
            testResults.push({
                test: 'AI 사주팔자 완전 테스트',
                error: error.message,
                status: '❌ 에러'
            });
        }
        
        // 2-3. AI 타로
        console.log('\n🔍 AI 타로 완전 플로우');
        await page.goto('https://doha.kr/fortune/tarot/', { waitUntil: 'networkidle' });
        const tarotMonitor = setupMonitoring();
        
        try {
            // 타로 카드 선택 및 결과 확인
            const tarotCards = await page.locator('.tarot-card').count();
            if (tarotCards > 0) {
                await page.click('.tarot-card:first-child');
                await page.waitForTimeout(3000);
                
                const tarotResult = await page.locator('.tarot-result').count() > 0;
                testResults.push({
                    test: 'AI 타로 완전 테스트',
                    cardsAvailable: tarotCards,
                    resultDisplayed: tarotResult,
                    consoleErrors: tarotMonitor.consoleErrors.length,
                    status: tarotResult ? '✅ 완전 성공' : '❌ 실패'
                });
            } else {
                testResults.push({
                    test: 'AI 타로 완전 테스트',
                    error: '타로 카드가 표시되지 않음',
                    status: '❌ 실패'
                });
            }
        } catch (error) {
            testResults.push({
                test: 'AI 타로 완전 테스트',
                error: error.message,
                status: '❌ 에러'
            });
        }
        
        // 3. 실용도구 전체 테스트
        console.log('\n🛠️ === 실용도구 완전 테스트 ===');
        
        // 3-1. 글자수 세기
        console.log('\n🔍 글자수 세기 완전 테스트');
        await page.goto('https://doha.kr/tools/text-counter.html', { waitUntil: 'networkidle' });
        const textMonitor = setupMonitoring();
        
        const testText = '안녕하세요. 이것은 테스트 텍스트입니다. 글자수를 세어보겠습니다.';
        await page.fill('textarea', testText);
        await page.waitForTimeout(1000);
        
        const charCount = await page.locator('.char-count').textContent().catch(() => '');
        const wordCount = await page.locator('.word-count').textContent().catch(() => '');
        
        testResults.push({
            test: '글자수 세기 완전 테스트',
            inputWorking: true,
            charCountDisplayed: charCount.includes('33'), // 실제 글자수
            wordCountDisplayed: wordCount.length > 0,
            consoleErrors: textMonitor.consoleErrors.length,
            status: charCount.includes('33') ? '✅ 완전 성공' : '❌ 실패'
        });
        
        // 3-2. BMI 계산기
        console.log('\n🔍 BMI 계산기 완전 테스트');
        await page.goto('https://doha.kr/tools/bmi-calculator.html', { waitUntil: 'networkidle' });
        const bmiMonitor = setupMonitoring();
        
        await page.fill('input[name="height"]', '170');
        await page.fill('input[name="weight"]', '70');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);
        
        const bmiResult = await page.locator('.bmi-result').textContent().catch(() => '');
        const bmiCategory = await page.locator('.bmi-category').textContent().catch(() => '');
        
        testResults.push({
            test: 'BMI 계산기 완전 테스트',
            calculationWorking: bmiResult.includes('24.2'), // 70/(1.7*1.7) = 24.22
            categoryDisplayed: bmiCategory.length > 0,
            consoleErrors: bmiMonitor.consoleErrors.length,
            status: bmiResult.includes('24') ? '✅ 완전 성공' : '❌ 실패'
        });
        
        // 3-3. 연봉 계산기
        console.log('\n🔍 연봉 계산기 완전 테스트');
        await page.goto('https://doha.kr/tools/salary-calculator.html', { waitUntil: 'networkidle' });
        const salaryMonitor = setupMonitoring();
        
        await page.fill('input[name="salary"]', '50000000');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);
        
        const salaryResult = await page.locator('.salary-result').count() > 0;
        const monthlyPay = await page.locator('.monthly-pay').textContent().catch(() => '');
        
        testResults.push({
            test: '연봉 계산기 완전 테스트',
            resultDisplayed: salaryResult,
            monthlyPayCalculated: monthlyPay.length > 0,
            consoleErrors: salaryMonitor.consoleErrors.length,
            status: salaryResult && monthlyPay.length > 0 ? '✅ 완전 성공' : '❌ 실패'
        });
        
    } catch (error) {
        console.error('전체 테스트 중 오류:', error);
        testResults.push({
            test: '전체 기능 테스트',
            error: error.message,
            status: '❌ 에러'
        });
    }
    
    await browser.close();
    
    // 결과 출력
    console.log('\n📊 전체 사이트 모든 기능 완전 테스트 결과');
    console.log('═'.repeat(80));
    
    let totalSuccess = 0;
    let totalTests = testResults.length;
    
    testResults.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.test} ${result.status}`);
        
        if (result.status.includes('✅')) totalSuccess++;
        
        // 상세 정보 출력
        Object.keys(result).forEach(key => {
            if (key !== 'test' && key !== 'status') {
                console.log(`   ${key}: ${result[key]}`);
            }
        });
    });
    
    console.log(`\n🎯 전체 기능 성공률: ${totalSuccess}/${totalTests} (${Math.round(totalSuccess/totalTests*100)}%)`);
    
    // 카테고리별 성공률
    const psychTests = testResults.filter(r => r.test.includes('테스트'));
    const fortuneTests = testResults.filter(r => r.test.includes('운세') || r.test.includes('사주') || r.test.includes('타로'));
    const toolTests = testResults.filter(r => r.test.includes('계산기') || r.test.includes('글자수'));
    
    console.log(`\n📋 카테고리별 결과:`);
    console.log(`🧠 심리테스트: ${psychTests.filter(r => r.status.includes('✅')).length}/${psychTests.length}`);
    console.log(`🔮 운세 기능: ${fortuneTests.filter(r => r.status.includes('✅')).length}/${fortuneTests.length}`);
    console.log(`🛠️ 실용도구: ${toolTests.filter(r => r.status.includes('✅')).length}/${toolTests.length}`);
    
    if (totalSuccess === totalTests) {
        console.log('\n🎉 모든 기능이 완벽하게 작동합니다!');
    } else {
        console.log('\n❌ 일부 기능에 문제가 있습니다. 수정이 필요합니다.');
    }
    
    console.log('\n🎉 전체 사이트 모든 기능 완전 테스트 완료!');
    
    return testResults;
}

fullFunctionalityTest().catch(console.error);