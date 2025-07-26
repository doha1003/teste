const { chromium } = require('playwright');
const fs = require('fs').promises;

const BASE_URL = 'https://doha.kr';
const results = {
    timestamp: new Date().toISOString(),
    pages: {},
    errors: [],
    summary: {
        totalPages: 0,
        successfulPages: 0,
        failedPages: 0,
        jsErrors: 0,
        consoleLogs: 0
    }
};

async function checkPage(browser, pageName, url) {
    // console.log removed(`\n검증 중: ${pageName} (${url})`);
    const context = await browser.newContext();
    const page = await context.newPage();
    const pageResult = {
        url: url,
        loadSuccess: false,
        jsErrors: [],
        consoleMessages: [],
        functionTests: {}
    };

    // 콘솔 메시지 수집
    page.on('console', msg => {
        const msgText = msg.text();
        pageResult.consoleMessages.push({
            type: msg.type(),
            text: msgText
        });
        
        if (msg.type() === 'error') {
            pageResult.jsErrors.push(msgText);
        }
        
        // DEBUG 메시지 확인
        if (msgText.includes('DEBUG')) {
            pageResult.functionTests.hasDebugLogs = true;
            results.summary.consoleLogs++;
        }
    });

    // 페이지 에러 수집
    page.on('pageerror', error => {
        pageResult.jsErrors.push(error.message);
    });

    try {
        // 페이지 로드
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        pageResult.loadSuccess = true;
        // console.log removed(`✅ ${pageName} 로드 성공`);

        // 동적 컨텐츠 로드를 위한 추가 대기 (특히 사주 페이지)
        if (url.includes('/fortune/saju/')) {
            await page.waitForTimeout(2000);
        }

        // 기본 요소 확인
        const hasNavbar = await page.locator('.navbar, nav').count() > 0;
        const hasFooter = await page.locator('footer').count() > 0;
        pageResult.functionTests.hasNavbar = hasNavbar;
        pageResult.functionTests.hasFooter = hasFooter;

        // 페이지별 특수 테스트
        if (url.includes('/tests/mbti/test.html')) {
            // MBTI 테스트 페이지
            const startButton = await page.locator('#start-test-btn, .start-btn').first();
            if (await startButton.count() > 0) {
                await startButton.click();
                await page.waitForTimeout(1000);
                const testScreen = await page.locator('#test-screen:not(.mbti-hidden)').count();
                pageResult.functionTests.mbtiTestStart = testScreen > 0;
                
                // 첫 번째 질문 옵션 클릭 테스트
                const firstOption = await page.locator('.mbti-option').first();
                if (await firstOption.count() > 0) {
                    await firstOption.click();
                    await page.waitForTimeout(1500);
                    const nextQuestion = await page.locator('#question-number').textContent();
                    pageResult.functionTests.mbtiAutoProgress = nextQuestion && nextQuestion.includes('Q2');
                }
            }
        } else if (url.includes('/tests/love-dna/test.html')) {
            // Love DNA 테스트 페이지
            const startButton = await page.locator('#start-btn').first();
            if (await startButton.count() > 0) {
                await startButton.click();
                await page.waitForTimeout(1000);
                const testScreen = await page.locator('#test-screen:not(.hidden)').count();
                pageResult.functionTests.loveDnaTestStart = testScreen > 0;
                
                // 첫 번째 질문 옵션 클릭 테스트
                const firstOption = await page.locator('.love-option').first();
                if (await firstOption.count() > 0) {
                    await firstOption.click();
                    await page.waitForTimeout(1500);
                    const progress = await page.locator('.progress-bar').getAttribute('style');
                    pageResult.functionTests.loveDnaAutoProgress = progress && !progress.includes('width: 0%');
                }
            }
        } else if (url.includes('/tests/teto-egen/test.html')) {
            // Teto-Egen 테스트 페이지
            const startButton = await page.locator('#start-btn').first();
            if (await startButton.count() > 0) {
                await startButton.click();
                await page.waitForTimeout(1000);
                const questionElement = await page.locator('#question').count();
                pageResult.functionTests.tetoEgenTestStart = questionElement > 0;
            }
        } else if (url === BASE_URL || url === BASE_URL + '/') {
            // 메인 페이지
            const serviceCards = await page.locator('.service-card').count();
            pageResult.functionTests.serviceCardsCount = serviceCards;
            
            // 탭 버튼 테스트
            const tabButtons = await page.locator('.tab-button');
            const tabCount = await tabButtons.count();
            if (tabCount > 1) {
                await tabButtons.nth(1).click(); // 두 번째 탭 클릭
                await page.waitForTimeout(500);
                const visibleCards = await page.locator('.service-card:not(.hidden)').count();
                pageResult.functionTests.tabFunctionality = visibleCards > 0;
            }
        }

        // main.js 함수 확인
        const hasMainFunctions = await page.evaluate(() => {
            return {
                smoothScroll: typeof window.smoothScroll === 'function',
                validateForm: typeof window.validateForm === 'function',
                debounce: typeof window.debounce === 'function',
                toggleMobileMenu: typeof window.toggleMobileMenu === 'function',
                showServices: typeof window.showServices === 'function'
            };
        });
        pageResult.functionTests.mainJsFunctions = hasMainFunctions;

        // CSS 로딩 확인
        const cssFiles = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
            return links.map(link => ({
                href: link.href,
                loaded: link.sheet !== null
            }));
        });
        pageResult.functionTests.cssFiles = cssFiles;

    } catch (error) {
        pageResult.error = error.message;
        // console.error removed(`❌ ${pageName} 에러:`, error.message);
    } finally {
        await context.close();
    }

    return pageResult;
}

async function runVerification() {
    // console.log removed('🔍 doha.kr 최종 사이트 검증 시작...\n');
    const browser = await chromium.launch({ 
        headless: true
    });

    try {
        // 주요 페이지 목록
        const pagesToCheck = [
            { name: '메인 페이지', url: BASE_URL },
            { name: 'MBTI 테스트', url: `${BASE_URL}/tests/mbti/test.html` },
            { name: 'Love DNA 테스트', url: `${BASE_URL}/tests/love-dna/test.html` },
            { name: 'Teto-Egen 테스트', url: `${BASE_URL}/tests/teto-egen/test.html` },
            { name: '사주 운세', url: `${BASE_URL}/fortune/saju/` },
            { name: '타로 운세', url: `${BASE_URL}/fortune/tarot/` },
            { name: 'BMI 계산기', url: `${BASE_URL}/tools/bmi-calculator.html` },
            { name: '글자수 세기', url: `${BASE_URL}/tools/text-counter.html` }
        ];

        for (const pageInfo of pagesToCheck) {
            const result = await checkPage(browser, pageInfo.name, pageInfo.url);
            results.pages[pageInfo.name] = result;
            results.summary.totalPages++;
            
            if (result.loadSuccess) {
                results.summary.successfulPages++;
            } else {
                results.summary.failedPages++;
            }
            
            if (result.jsErrors.length > 0) {
                results.summary.jsErrors += result.jsErrors.length;
                results.errors.push({
                    page: pageInfo.name,
                    errors: result.jsErrors
                });
            }
        }

    } finally {
        await browser.close();
    }

    // 결과 저장
    await fs.writeFile(
        'final_site_verification_report.json',
        JSON.stringify(results, null, 2)
    );

    // 요약 출력
    // console.log removed('\n📊 검증 결과 요약:');
    // console.log removed(`- 총 페이지: ${results.summary.totalPages}`);
    // console.log removed(`- 성공: ${results.summary.successfulPages}`);
    // console.log removed(`- 실패: ${results.summary.failedPages}`);
    // console.log removed(`- JS 에러: ${results.summary.jsErrors}`);
    // console.log removed(`- DEBUG 로그: ${results.summary.consoleLogs}`);

    if (results.errors.length > 0) {
        // console.log removed('\n⚠️ 발견된 에러:');
        results.errors.forEach(error => {
            // console.log removed(`\n${error.page}:`);
            error.errors.forEach(e => // console.log removed(`  - ${e}`));
        });
    }

    // 중복 함수 및 정리 상태 확인
    // console.log removed('\n🔧 코드 정리 상태:');
    let allFunctionsAvailable = true;
    for (const [pageName, result] of Object.entries(results.pages)) {
        if (result.functionTests.mainJsFunctions) {
            const funcs = result.functionTests.mainJsFunctions;
            if (!funcs.smoothScroll || !funcs.validateForm || !funcs.debounce) {
                allFunctionsAvailable = false;
                // console.log removed(`❌ ${pageName}: 일부 main.js 함수 누락`);
            }
        }
    }
    if (allFunctionsAvailable) {
        // console.log removed('✅ 모든 페이지에서 main.js 함수 정상 작동');
    }

    // console.log removed('\n✅ 검증 완료! 상세 결과는 final_site_verification_report.json 파일을 확인하세요.');
}

// 실행
runVerification().catch(err => {
        // Error handling
    });