import { chromium } from 'playwright';
import fs from 'fs';

const WAIT_TIME = 5000; // 배포 반영을 위해 대기 시간 증가

async function comprehensiveTest() {
    console.log('🔍 종합 테스트 시작 (배포 반영 대기)...\n');
    
    // 먼저 30초 대기 (GitHub Pages 배포 반영)
    console.log('⏳ GitHub Pages 배포 반영 대기 중 (30초)...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const browser = await chromium.launch({ 
        headless: false,
        viewport: { width: 1280, height: 800 }
    });
    
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    const testResults = {
        timestamp: new Date().toISOString(),
        tests: []
    };
    
    // 콘솔 메시지 수집
    const consoleMessages = [];
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error' || type === 'warning') {
            consoleMessages.push({ type, text, url: page.url() });
        }
    });
    
    // 네트워크 에러 감지
    const networkErrors = [];
    page.on('requestfailed', request => {
        networkErrors.push({
            url: request.url(),
            failure: request.failure(),
            method: request.method()
        });
    });
    
    // 1. 홈페이지 테스트
    console.log('\n1️⃣ 홈페이지 테스트');
    const homeResult = await testPage(page, 'https://doha.kr/', '홈페이지');
    testResults.tests.push(homeResult);
    
    // 2. 사주 운세 전체 플로우 테스트
    console.log('\n2️⃣ 사주 운세 전체 플로우 테스트');
    const sajuResult = await testSajuFlow(page);
    testResults.tests.push(sajuResult);
    
    // 3. 일일 운세 전체 플로우 테스트
    console.log('\n3️⃣ 일일 운세 전체 플로우 테스트');
    const dailyResult = await testDailyFortuneFlow(page);
    testResults.tests.push(dailyResult);
    
    // 4. 타로 운세 테스트
    console.log('\n4️⃣ 타로 운세 테스트');
    const tarotResult = await testTarotFlow(page);
    testResults.tests.push(tarotResult);
    
    // 5. MBTI 테스트
    console.log('\n5️⃣ MBTI 테스트');
    const mbtiResult = await testMBTIFlow(page);
    testResults.tests.push(mbtiResult);
    
    // 6. BMI 계산기 테스트
    console.log('\n6️⃣ BMI 계산기 테스트');
    const bmiResult = await testBMICalculator(page);
    testResults.tests.push(bmiResult);
    
    // 7. 글자수 세기 테스트
    console.log('\n7️⃣ 글자수 세기 테스트');
    const textCounterResult = await testTextCounter(page);
    testResults.tests.push(textCounterResult);
    
    // 8. 모바일 반응형 테스트
    console.log('\n8️⃣ 모바일 반응형 테스트');
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileResult = await testMobileResponsive(page);
    testResults.tests.push(mobileResult);
    
    // 결과 분석
    testResults.summary = analyzeResults(testResults.tests);
    testResults.consoleErrors = consoleMessages;
    testResults.networkErrors = networkErrors;
    
    // 결과 저장
    fs.writeFileSync('comprehensive-test-results.json', JSON.stringify(testResults, null, 2));
    
    // 결과 출력
    console.log('\n' + '='.repeat(80));
    console.log('📊 종합 테스트 결과');
    console.log('='.repeat(80));
    console.log(`총 테스트: ${testResults.tests.length}개`);
    console.log(`성공: ${testResults.summary.passed}개`);
    console.log(`실패: ${testResults.summary.failed}개`);
    console.log(`경고: ${testResults.summary.warnings}개`);
    console.log('\n상세 결과:');
    
    testResults.tests.forEach(test => {
        const status = test.passed ? '✅' : '❌';
        console.log(`\n${status} ${test.name}`);
        if (!test.passed) {
            test.issues.forEach(issue => {
                console.log(`   - ${issue}`);
            });
        }
        if (test.warnings && test.warnings.length > 0) {
            console.log('   ⚠️  경고:');
            test.warnings.forEach(warning => {
                console.log(`   - ${warning}`);
            });
        }
    });
    
    if (consoleMessages.length > 0) {
        console.log('\n🚨 콘솔 에러/경고:');
        consoleMessages.slice(0, 10).forEach(msg => {
            console.log(`   [${msg.type}] ${msg.text.substring(0, 100)}...`);
        });
        if (consoleMessages.length > 10) {
            console.log(`   ... 그리고 ${consoleMessages.length - 10}개 더`);
        }
    }
    
    await browser.close();
}

// 페이지 기본 테스트
async function testPage(page, url, name) {
    const result = {
        name,
        url,
        passed: true,
        issues: [],
        warnings: [],
        metrics: {}
    };
    
    try {
        const response = await page.goto(url, { waitUntil: 'networkidle' });
        result.metrics.loadTime = Date.now() - response.timing().requestTime;
        
        // HTTP 상태 확인
        if (response.status() !== 200) {
            result.issues.push(`HTTP ${response.status()} 에러`);
            result.passed = false;
        }
        
        // 네비게이션 확인
        const nav = await page.$('nav');
        if (!nav) {
            result.issues.push('네비게이션 없음');
            result.passed = false;
        }
        
        // 푸터 확인
        const footer = await page.$('footer');
        if (!footer) {
            result.issues.push('푸터 없음');
            result.passed = false;
        }
        
        // 주요 콘텐츠 확인
        const mainContent = await page.$('main, .container, section');
        if (!mainContent) {
            result.warnings.push('주요 콘텐츠 컨테이너 없음');
        }
        
        // 성능 메트릭
        const metrics = await page.evaluate(() => {
            const perf = window.performance.timing;
            return {
                domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
                loadComplete: perf.loadEventEnd - perf.navigationStart
            };
        });
        result.metrics = { ...result.metrics, ...metrics };
        
        // 스크린샷
        await page.screenshot({ 
            path: `screenshots/${name.replace(/[^a-zA-Z0-9]/g, '_')}.png`,
            fullPage: true 
        });
        
    } catch (error) {
        result.passed = false;
        result.issues.push(`테스트 실패: ${error.message}`);
    }
    
    return result;
}

// 사주 운세 플로우 테스트
async function testSajuFlow(page) {
    const result = {
        name: '사주 운세 전체 플로우',
        url: 'https://doha.kr/fortune/saju/',
        passed: true,
        issues: [],
        warnings: []
    };
    
    try {
        await page.goto(result.url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(WAIT_TIME);
        
        // 폼 요소 확인
        const nameInput = await page.$('#userName');
        const genderSelect = await page.$('#gender');
        const yearInput = await page.$('#birthYear');
        const monthInput = await page.$('#birthMonth');
        const dayInput = await page.$('#birthDay');
        const timeSelect = await page.$('#birthTime');
        
        if (!nameInput || !genderSelect || !yearInput || !monthInput || !dayInput || !timeSelect) {
            result.issues.push('필수 입력 필드 누락');
            result.passed = false;
            return result;
        }
        
        // 폼 입력
        await nameInput.fill('테스트사용자');
        await genderSelect.selectOption('male');
        await yearInput.fill('1990');
        await monthInput.fill('5');
        await dayInput.fill('15');
        await timeSelect.selectOption('12');
        
        // 제출 버튼 찾기
        const submitBtn = await page.$('button[type="submit"]');
        if (!submitBtn) {
            result.issues.push('제출 버튼 없음');
            result.passed = false;
            return result;
        }
        
        // 제출
        await submitBtn.click();
        await page.waitForTimeout(WAIT_TIME);
        
        // 결과 확인
        const resultDiv = await page.$('#sajuResult');
        if (!resultDiv) {
            result.issues.push('결과 영역 없음');
            result.passed = false;
        } else {
            const isVisible = await resultDiv.isVisible();
            if (!isVisible) {
                result.issues.push('결과가 표시되지 않음');
                result.passed = false;
            }
            
            // 카드 디자인 확인
            const resultCard = await page.$('.fortune-result-card');
            if (!resultCard) {
                result.warnings.push('카드 디자인이 적용되지 않음');
            }
            
            // 결과 내용 확인
            const resultText = await resultDiv.textContent();
            if (!resultText || resultText.length < 100) {
                result.warnings.push('결과 내용이 너무 짧음');
            }
        }
        
        await page.screenshot({ 
            path: 'screenshots/saju_result.png',
            fullPage: true 
        });
        
    } catch (error) {
        result.passed = false;
        result.issues.push(`테스트 실패: ${error.message}`);
    }
    
    return result;
}

// 일일 운세 플로우 테스트
async function testDailyFortuneFlow(page) {
    const result = {
        name: '일일 운세 전체 플로우',
        url: 'https://doha.kr/fortune/daily/',
        passed: true,
        issues: [],
        warnings: []
    };
    
    try {
        await page.goto(result.url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(WAIT_TIME);
        
        // 폼 입력
        await page.fill('#userName', '테스트사용자');
        
        // 년도 선택 대기
        await page.waitForSelector('#birthYear option:nth-child(2)', { timeout: 10000 });
        await page.selectOption('#birthYear', '1990');
        await page.selectOption('#birthMonth', '5');
        
        // 일 선택 대기
        await page.waitForSelector('#birthDay option:nth-child(2)', { timeout: 10000 });
        await page.selectOption('#birthDay', '15');
        
        // 제출
        const submitBtn = await page.$('button[type="submit"]');
        await submitBtn.click();
        await page.waitForTimeout(WAIT_TIME);
        
        // 결과 확인
        const resultDiv = await page.$('#fortuneResult');
        if (resultDiv && await resultDiv.isVisible()) {
            const resultCard = await page.$('.fortune-result-card');
            if (!resultCard) {
                result.warnings.push('카드 디자인이 적용되지 않음');
            }
        } else {
            result.issues.push('결과가 표시되지 않음');
            result.passed = false;
        }
        
        await page.screenshot({ 
            path: 'screenshots/daily_fortune_result.png',
            fullPage: true 
        });
        
    } catch (error) {
        result.passed = false;
        result.issues.push(`테스트 실패: ${error.message}`);
    }
    
    return result;
}

// 타로 운세 테스트
async function testTarotFlow(page) {
    const result = {
        name: '타로 운세 플로우',
        url: 'https://doha.kr/fortune/tarot/',
        passed: true,
        issues: [],
        warnings: []
    };
    
    try {
        await page.goto(result.url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(WAIT_TIME);
        
        // 타로 카드 선택
        const cards = await page.$$('.tarot-card');
        if (cards.length < 3) {
            result.issues.push('타로 카드가 충분하지 않음');
            result.passed = false;
            return result;
        }
        
        // 3장 선택
        for (let i = 0; i < 3; i++) {
            await cards[i].click();
            await page.waitForTimeout(1000);
        }
        
        // 결과 확인
        await page.waitForTimeout(WAIT_TIME);
        const resultDiv = await page.$('.tarot-result, #tarotResult');
        if (!resultDiv || !await resultDiv.isVisible()) {
            result.issues.push('타로 결과가 표시되지 않음');
            result.passed = false;
        }
        
        await page.screenshot({ 
            path: 'screenshots/tarot_result.png',
            fullPage: true 
        });
        
    } catch (error) {
        result.passed = false;
        result.issues.push(`테스트 실패: ${error.message}`);
    }
    
    return result;
}

// MBTI 테스트
async function testMBTIFlow(page) {
    const result = {
        name: 'MBTI 테스트 플로우',
        url: 'https://doha.kr/tests/mbti/',
        passed: true,
        issues: [],
        warnings: []
    };
    
    try {
        await page.goto(result.url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(WAIT_TIME);
        
        // 시작 버튼 찾기
        const startBtn = await page.$('button:has-text("시작"), a:has-text("시작")');
        if (startBtn) {
            await startBtn.click();
            await page.waitForTimeout(2000);
        }
        
        // 질문에 답하기 (최대 5개)
        for (let i = 0; i < 5; i++) {
            const options = await page.$$('.option-button, .answer-option, button.option');
            if (options.length === 0) break;
            
            await options[0].click();
            await page.waitForTimeout(1500);
        }
        
        // 결과 확인
        const resultCheck = await page.$('.result-card, .test-result, #testResult');
        if (resultCheck) {
            result.warnings.push('일부 질문만 답했지만 결과 영역 발견');
        }
        
        await page.screenshot({ 
            path: 'screenshots/mbti_test.png',
            fullPage: true 
        });
        
    } catch (error) {
        result.passed = false;
        result.issues.push(`테스트 실패: ${error.message}`);
    }
    
    return result;
}

// BMI 계산기 테스트
async function testBMICalculator(page) {
    const result = {
        name: 'BMI 계산기',
        url: 'https://doha.kr/tools/bmi-calculator.html',
        passed: true,
        issues: [],
        warnings: []
    };
    
    try {
        await page.goto(result.url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(WAIT_TIME);
        
        // 입력 필드
        await page.fill('#height', '170');
        await page.fill('#weight', '70');
        
        // 계산 버튼
        const calcBtn = await page.$('button:has-text("계산")');
        if (calcBtn) {
            await calcBtn.click();
            await page.waitForTimeout(2000);
            
            // 결과 확인
            const resultDiv = await page.$('#bmiResult, .bmi-result');
            if (!resultDiv || !await resultDiv.isVisible()) {
                result.issues.push('BMI 결과가 표시되지 않음');
                result.passed = false;
            } else {
                // 카드 스타일 확인
                const resultCard = await page.$('.result-card, .bmi-result-card, .fortune-result-card');
                if (!resultCard) {
                    result.warnings.push('결과 카드 스타일이 적용되지 않음');
                }
            }
        } else {
            result.issues.push('계산 버튼을 찾을 수 없음');
            result.passed = false;
        }
        
        await page.screenshot({ 
            path: 'screenshots/bmi_result.png',
            fullPage: true 
        });
        
    } catch (error) {
        result.passed = false;
        result.issues.push(`테스트 실패: ${error.message}`);
    }
    
    return result;
}

// 글자수 세기 테스트
async function testTextCounter(page) {
    const result = {
        name: '글자수 세기',
        url: 'https://doha.kr/tools/text-counter.html',
        passed: true,
        issues: [],
        warnings: []
    };
    
    try {
        await page.goto(result.url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(WAIT_TIME);
        
        // 텍스트 입력
        const textarea = await page.$('textarea');
        if (textarea) {
            await textarea.fill('안녕하세요. 이것은 테스트 문장입니다. 한글과 영어 English를 섞어서 테스트합니다.');
            await page.waitForTimeout(1000);
            
            // 결과 확인
            const charCount = await page.$('.char-count, #charCount, .count-display');
            if (!charCount) {
                result.issues.push('글자수 표시 영역을 찾을 수 없음');
                result.passed = false;
            } else {
                const countText = await charCount.textContent();
                if (!countText || countText === '0') {
                    result.warnings.push('글자수가 업데이트되지 않음');
                }
            }
        } else {
            result.issues.push('텍스트 입력 영역을 찾을 수 없음');
            result.passed = false;
        }
        
        await page.screenshot({ 
            path: 'screenshots/text_counter.png',
            fullPage: true 
        });
        
    } catch (error) {
        result.passed = false;
        result.issues.push(`테스트 실패: ${error.message}`);
    }
    
    return result;
}

// 모바일 반응형 테스트
async function testMobileResponsive(page) {
    const result = {
        name: '모바일 반응형',
        passed: true,
        issues: [],
        warnings: []
    };
    
    try {
        // 홈페이지 모바일 테스트
        await page.goto('https://doha.kr/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // 모바일 메뉴 버튼 확인
        const mobileMenuBtn = await page.$('.mobile-menu-btn, .menu-toggle, .hamburger');
        if (!mobileMenuBtn) {
            result.warnings.push('모바일 메뉴 버튼이 없음');
        }
        
        // 가로 스크롤 확인
        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        if (hasHorizontalScroll) {
            result.issues.push('모바일에서 가로 스크롤 발생');
            result.passed = false;
        }
        
        // 주요 페이지 모바일 테스트
        const mobilePages = [
            '/fortune/daily/',
            '/tests/mbti/',
            '/tools/bmi-calculator.html'
        ];
        
        for (const path of mobilePages) {
            await page.goto(`https://doha.kr${path}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(1000);
            
            const pageHasScroll = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            });
            
            if (pageHasScroll) {
                result.warnings.push(`${path}에서 가로 스크롤 발생`);
            }
        }
        
        await page.screenshot({ 
            path: 'screenshots/mobile_home.png',
            fullPage: true 
        });
        
    } catch (error) {
        result.passed = false;
        result.issues.push(`테스트 실패: ${error.message}`);
    }
    
    return result;
}

// 결과 분석
function analyzeResults(tests) {
    const summary = {
        total: tests.length,
        passed: 0,
        failed: 0,
        warnings: 0
    };
    
    tests.forEach(test => {
        if (test.passed) {
            summary.passed++;
        } else {
            summary.failed++;
        }
        
        if (test.warnings && test.warnings.length > 0) {
            summary.warnings += test.warnings.length;
        }
    });
    
    return summary;
}

// 스크린샷 디렉토리 생성
if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
}

// 테스트 실행
comprehensiveTest().catch(console.error);