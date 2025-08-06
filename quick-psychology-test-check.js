import puppeteer from 'puppeteer';

/**
 * 빠른 심리테스트 검증 도구
 * 각 테스트 페이지의 기본 로딩과 오류를 확인
 */
async function quickTestCheck() {
    console.log('🚀 심리테스트 빠른 검증 시작...');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 720 }
    });

    const tests = [
        {
            name: '테토-에겐 테스트',
            url: 'http://localhost:3000/tests/teto-egen/test.html',
            expectedElements: ['.teto-test-container', '.teto-gender-btn', '.teto-start-button']
        },
        {
            name: '러브 DNA 테스트', 
            url: 'http://localhost:3000/tests/love-dna/test.html',
            expectedElements: ['.love-test-container', '.test-start-button', '.love-start-button']
        },
        {
            name: 'MBTI 테스트',
            url: 'http://localhost:3000/tests/mbti/test.html', 
            expectedElements: ['.mbti-test-container', '.test-start-button', '.mbti-start-button']
        }
    ];

    const results = [];

    for (const test of tests) {
        console.log(`\n🔍 ${test.name} 검증 중...`);
        
        const page = await browser.newPage();
        const testResult = {
            name: test.name,
            url: test.url,
            status: 'success',
            errors: [],
            warnings: [],
            elements: {}
        };

        try {
            // 콘솔 오류 수집
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            page.on('pageerror', error => {
                consoleErrors.push(`Page Error: ${error.message}`);
            });

            // 페이지 로드
            await page.goto(test.url, { 
                waitUntil: 'networkidle0', 
                timeout: 15000 
            });

            // 기본 요소 확인
            for (const selector of test.expectedElements) {
                const element = await page.$(selector);
                testResult.elements[selector] = !!element;
                
                if (!element) {
                    testResult.warnings.push(`요소를 찾을 수 없음: ${selector}`);
                }
            }

            // 자바스크립트 오류 확인
            if (consoleErrors.length > 0) {
                testResult.errors.push(...consoleErrors);
                testResult.status = 'failed';
            }

            // 페이지 타이틀 확인
            const title = await page.title();
            if (!title || title.includes('404') || title.includes('Error')) {
                testResult.errors.push(`비정상적인 페이지 타이틀: ${title}`);
                testResult.status = 'failed';
            }

            console.log(`  ✅ 페이지 로드: ${title}`);
            
            // 요소 상태 출력
            for (const [selector, found] of Object.entries(testResult.elements)) {
                console.log(`  ${found ? '✅' : '❌'} ${selector}: ${found ? '발견됨' : '찾을 수 없음'}`);
            }

            if (testResult.errors.length > 0) {
                console.log(`  ❌ 오류 ${testResult.errors.length}개 발견`);
            }

        } catch (error) {
            testResult.status = 'failed';
            testResult.errors.push(`페이지 로드 실패: ${error.message}`);
            console.log(`  ❌ 페이지 로드 실패: ${error.message}`);
        }

        results.push(testResult);
        await page.close();
    }

    await browser.close();

    // 최종 결과 요약
    console.log('\n' + '='.repeat(60));
    console.log('📊 심리테스트 검증 결과 요약');
    console.log('='.repeat(60));

    let passCount = 0;
    let failCount = 0;

    for (const result of results) {
        const status = result.status === 'success' ? '✅ 통과' : '❌ 실패';
        console.log(`\n${result.name}: ${status}`);
        
        if (result.status === 'success') {
            passCount++;
            console.log(`  • 모든 기본 요소 정상 작동`);
        } else {
            failCount++;
            if (result.errors.length > 0) {
                console.log(`  • 오류:`);
                result.errors.forEach(error => {
                    console.log(`    - ${error}`);
                });
            }
            if (result.warnings.length > 0) {
                console.log(`  • 경고:`);
                result.warnings.forEach(warning => {
                    console.log(`    - ${warning}`);
                });
            }
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📈 전체 결과: 통과 ${passCount}개 / 실패 ${failCount}개 / 총 ${passCount + failCount}개`);
    
    if (failCount > 0) {
        console.log('\n🔧 권장 조치 사항:');
        console.log('1. JavaScript 파일의 import/export 구문 확인');
        console.log('2. HTML에서 누락된 CSS 클래스나 ID 확인');  
        console.log('3. 서버가 올바른 포트(3000)에서 실행 중인지 확인');
        console.log('4. 브라우저 콘솔에서 네트워크 탭 오류 확인');
    }

    return results;
}

// 실행
if (import.meta.url.startsWith('file:')) {
    quickTestCheck().catch(console.error);
}

export { quickTestCheck };