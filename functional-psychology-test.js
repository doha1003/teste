import puppeteer from 'puppeteer';

/**
 * 심리테스트 실제 기능 검증
 * 버튼 클릭 및 상호작용 테스트
 */
async function functionalTest() {
    console.log('🎯 심리테스트 기능 검증 시작...');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 720 },
        slowMo: 1000 // 1초씩 천천히 실행
    });

    const tests = [
        {
            name: '테토-에겐 테스트',
            url: 'http://localhost:3000/tests/teto-egen/test.html',
            actions: [
                { type: 'click', selector: '.teto-gender-btn[data-gender="female"]', description: '여성 선택' },
                { type: 'waitAndClick', selector: '.teto-start-button', description: '테스트 시작' },
                { type: 'waitForElement', selector: '.teto-question-container', description: '질문 화면 대기' }
            ]
        },
        {
            name: '러브 DNA 테스트',
            url: 'http://localhost:3000/tests/love-dna/test.html',
            actions: [
                { type: 'click', selector: '.love-start-button', description: '테스트 시작' },
                { type: 'waitForElement', selector: '.love-question-container', description: '질문 화면 대기' }
            ]
        },
        {
            name: 'MBTI 테스트',
            url: 'http://localhost:3000/tests/mbti/test.html',
            actions: [
                { type: 'click', selector: '.mbti-start-button', description: '테스트 시작' },
                { type: 'waitForElement', selector: '.mbti-question-container', description: '질문 화면 대기' }
            ]
        }
    ];

    const results = [];

    for (const test of tests) {
        console.log(`\n🧪 ${test.name} 기능 테스트 시작...`);
        
        const page = await browser.newPage();
        const testResult = {
            name: test.name,
            url: test.url,
            status: 'success',
            completedActions: 0,
            totalActions: test.actions.length,
            errors: []
        };

        try {
            // 페이지 로드
            await page.goto(test.url, { waitUntil: 'networkidle0', timeout: 15000 });
            console.log(`  ✅ 페이지 로드 완료`);

            // 각 액션 수행
            for (let i = 0; i < test.actions.length; i++) {
                const action = test.actions[i];
                console.log(`  🔄 ${action.description}...`);

                try {
                    switch (action.type) {
                        case 'click':
                            await page.waitForSelector(action.selector, { timeout: 5000 });
                            await page.click(action.selector);
                            testResult.completedActions++;
                            console.log(`    ✅ 클릭 성공: ${action.selector}`);
                            break;

                        case 'waitAndClick':
                            await page.waitForSelector(action.selector, { visible: true, timeout: 5000 });
                            await page.click(action.selector);
                            testResult.completedActions++;
                            console.log(`    ✅ 대기 후 클릭 성공: ${action.selector}`);
                            break;

                        case 'waitForElement':
                            await page.waitForSelector(action.selector, { visible: true, timeout: 5000 });
                            testResult.completedActions++;
                            console.log(`    ✅ 요소 대기 성공: ${action.selector}`);
                            break;
                    }

                    // 각 액션 후 잠시 대기
                    await page.waitForTimeout(1500);

                } catch (actionError) {
                    console.log(`    ❌ 액션 실패: ${actionError.message}`);
                    testResult.errors.push(`${action.description}: ${actionError.message}`);
                    
                    // 스크린샷 캡처
                    await page.screenshot({ 
                        path: `./error-${test.name.replace(/\s+/g, '-')}-action-${i}.png`,
                        fullPage: true 
                    });
                    break; // 실패하면 다음 액션은 건너뛰기
                }
            }

            // 최종 스크린샷
            await page.screenshot({ 
                path: `./final-${test.name.replace(/\s+/g, '-')}.png`,
                fullPage: true 
            });

            if (testResult.errors.length > 0) {
                testResult.status = 'partial';
            }

        } catch (error) {
            testResult.status = 'failed';
            testResult.errors.push(`테스트 실행 오류: ${error.message}`);
            console.log(`  ❌ 테스트 실패: ${error.message}`);
        }

        results.push(testResult);
        await page.close();
    }

    await browser.close();

    // 결과 요약
    console.log('\n' + '='.repeat(60));
    console.log('🎯 심리테스트 기능 검증 결과');
    console.log('='.repeat(60));

    let fullSuccess = 0;
    let partialSuccess = 0;
    let failed = 0;

    for (const result of results) {
        let statusIcon = '';
        let statusText = '';
        
        switch (result.status) {
            case 'success':
                statusIcon = '✅';
                statusText = '완전 성공';
                fullSuccess++;
                break;
            case 'partial':
                statusIcon = '⚠️';
                statusText = '부분 성공';
                partialSuccess++;
                break;
            case 'failed':
                statusIcon = '❌';
                statusText = '실패';
                failed++;
                break;
        }

        console.log(`\n${result.name}: ${statusIcon} ${statusText}`);
        console.log(`  • 완료된 액션: ${result.completedActions}/${result.totalActions}`);
        
        if (result.errors.length > 0) {
            console.log(`  • 오류:`);
            result.errors.forEach(error => {
                console.log(`    - ${error}`);
            });
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 전체 결과: 완전성공 ${fullSuccess}개 / 부분성공 ${partialSuccess}개 / 실패 ${failed}개`);
    
    const totalTests = fullSuccess + partialSuccess + failed;
    const successRate = ((fullSuccess + partialSuccess * 0.5) / totalTests * 100).toFixed(1);
    console.log(`🎯 성공률: ${successRate}%`);

    return results;
}

// 실행
if (import.meta.url.startsWith('file:')) {
    functionalTest().catch(console.error);
}

export { functionalTest };