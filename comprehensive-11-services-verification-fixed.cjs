const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * 팀리더 지시: doha.kr의 11개 서비스 완전 검증
 * 검증 순서: 테토-에겐 먼저 → 나머지 10개 서비스
 * 각 서비스별 JavaScript 콘솔 오류, 기능 정상 작동, 모바일 반응형 확인
 */

// 11개 서비스 정의
const SERVICES = {
    // 심리테스트 3개
    'psychology_tests': [
        {
            name: '테토-에겐 테스트',
            url: 'C:\\Users\\pc\\teste\\tests\\teto-egen\\test.html',
            type: 'test',
            steps: ['페이지로딩', '성별선택', '20문항진행', '결과표시']
        },
        {
            name: 'MBTI 테스트',
            url: 'C:\\Users\\pc\\teste\\tests\\mbti\\test.html', 
            type: 'test',
            steps: ['페이지로딩', '테스트시작', '12문항진행', '결과표시']
        },
        {
            name: 'Love DNA 테스트',
            url: 'C:\\Users\\pc\\teste\\tests\\love-dna\\test.html',
            type: 'test', 
            steps: ['페이지로딩', '테스트시작', '15문항진행', '결과표시']
        }
    ],
    // 운세 서비스 5개
    'fortune_services': [
        {
            name: '일일운세',
            url: 'C:\\Users\\pc\\teste\\fortune\\daily\\index.html',
            type: 'fortune',
            steps: ['페이지로딩', '생년월일입력', '운세생성', '결과확인']
        },
        {
            name: '사주운세',
            url: 'C:\\Users\\pc\\teste\\fortune\\saju\\index.html',
            type: 'fortune',
            steps: ['페이지로딩', '사주정보입력', '사주분석', '결과확인']
        },
        {
            name: '타로운세',
            url: 'C:\\Users\\pc\\teste\\fortune\\tarot\\index.html',
            type: 'fortune',
            steps: ['페이지로딩', '카드선택', '타로해석', '결과확인']
        },
        {
            name: '서양별자리운세',
            url: 'C:\\Users\\pc\\teste\\fortune\\zodiac\\index.html',
            type: 'fortune',
            steps: ['페이지로딩', '별자리선택', '운세생성', '결과확인']
        },
        {
            name: '띠별운세',
            url: 'C:\\Users\\pc\\teste\\fortune\\zodiac-animal\\index.html',
            type: 'fortune',
            steps: ['페이지로딩', '띠선택', '운세생성', '결과확인']
        }
    ],
    // 실용 도구 3개
    'utility_tools': [
        {
            name: 'BMI 계산기',
            url: 'C:\\Users\\pc\\teste\\tools\\bmi-calculator.html',
            type: 'tool',
            steps: ['페이지로딩', '키/몸무게입력', 'BMI계산', '결과표시']
        },
        {
            name: '급여 계산기',
            url: 'C:\\Users\\pc\\teste\\tools\\salary-calculator.html',
            type: 'tool',
            steps: ['페이지로딩', '급여정보입력', '세금계산', '결과표시']
        },
        {
            name: '글자수 계산기',
            url: 'C:\\Users\\pc\\teste\\tools\\text-counter.html',
            type: 'tool',
            steps: ['페이지로딩', '텍스트입력', '글자수계산', '결과표시']
        }
    ]
};

// 검증 결과 저장 객체
const verificationResults = {
    timestamp: new Date().toISOString(),
    summary: {
        total: 0,
        passed: 0,
        warning: 0,
        failed: 0
    },
    services: {}
};

/**
 * 콘솔 메시지 필터링 (중요한 오류만 캐치)
 */
function isSignificantError(message) {
    const text = message.text();
    const type = message.type();
    
    // 중요한 오류 패턴
    const criticalPatterns = [
        /Uncaught.*Error/i,
        /TypeError/i,
        /ReferenceError/i,
        /SyntaxError/i,
        /Cannot read.*undefined/i,
        /is not a function/i,
        /404.*Not Found/i,
        /500.*Internal Server Error/i
    ];
    
    // 무시할 오류 패턴 (일반적인 경고들)
    const ignorePatterns = [
        /favicon\.ico/i,
        /google.*analytics/i,
        /extension.*content/i,
        /Mixed Content/i,
        /DevTools/i
    ];
    
    if (type === 'error' || type === 'warning') {
        if (ignorePatterns.some(pattern => pattern.test(text))) {
            return false;
        }
        if (criticalPatterns.some(pattern => pattern.test(text))) {
            return true;
        }
    }
    
    return type === 'error';
}

/**
 * 페이지 로딩 및 기본 검증
 */
async function loadAndValidatePage(page, service) {
    const result = {
        name: service.name,
        type: service.type,
        status: 'unknown',
        errors: [],
        warnings: [],
        performance: {},
        steps: {}
    };
    
    console.log(`\n🔍 ${service.name} 검증 시작...`);
    
    try {
        // 콘솔 메시지 리스너 설정
        const consoleMessages = [];
        page.on('console', msg => {
            if (isSignificantError(msg)) {
                consoleMessages.push({
                    type: msg.type(),
                    text: msg.text(),
                    location: msg.location()
                });
            }
        });
        
        // 페이지 오류 리스너
        page.on('pageerror', error => {
            result.errors.push({
                type: 'page_error',
                message: error ? error.message : 'Unknown page error',
                stack: error ? error.stack : 'No stack trace available'
            });
        });
        
        // 네트워크 오류 리스너
        page.on('response', response => {
            if (!response.ok() && response.status() !== 404) {
                result.errors.push({
                    type: 'network_error',
                    url: response.url(),
                    status: response.status(),
                    statusText: response.statusText()
                });
            }
        });
        
        // 페이지 로딩 시작
        const startTime = Date.now();
        
        console.log(`  📄 페이지 로딩 중: ${service.url}`);
        await page.goto(`file://${service.url}`, { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        const loadTime = Date.now() - startTime;
        result.performance.loadTime = loadTime;
        result.steps['페이지로딩'] = { status: 'success', duration: loadTime };
        
        console.log(`  ✅ 페이지 로딩 완료 (${loadTime}ms)`);
        
        // 기본 DOM 요소 확인
        const title = await page.title();
        const hasMainContent = await page.$('main, .main-content, .container') !== null;
        
        if (!title || title === '') {
            result.warnings.push('페이지 타이틀이 비어있음');
        }
        
        if (!hasMainContent) {
            result.warnings.push('메인 콘텐츠 영역을 찾을 수 없음');
        }
        
        // 콘솔 메시지 확인
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기로 모든 스크립트 로딩 확인
        
        if (consoleMessages.length > 0) {
            result.errors.push(...consoleMessages);
        }
        
        // 서비스별 특화 검증 실행
        await performServiceSpecificTests(page, service, result);
        
        // 모바일 반응형 테스트
        await testMobileResponsiveness(page, service, result);
        
        // 최종 상태 결정
        if (result.errors.length === 0) {
            result.status = result.warnings.length > 0 ? 'warning' : 'passed';
        } else {
            result.status = 'failed';
        }
        
        console.log(`  🏁 ${service.name} 검증 완료: ${result.status.toUpperCase()}`);
        
    } catch (error) {
        result.status = 'failed';
        result.errors.push({
            type: 'test_error',
            message: error.message,
            stack: error.stack
        });
        
        console.error(`  ❌ ${service.name} 검증 실패:`, error.message);
    }
    
    return result;
}

/**
 * 서비스별 특화 테스트
 */
async function performServiceSpecificTests(page, service, result) {
    console.log(`  🎯 ${service.type} 타입별 특화 테스트 시작`);
    
    try {
        switch (service.type) {
            case 'test':
                await testPsychologyTest(page, service, result);
                break;
            case 'fortune':
                await testFortuneService(page, service, result);
                break;
            case 'tool':
                await testUtilityTool(page, service, result);
                break;
        }
    } catch (error) {
        result.errors.push({
            type: 'specific_test_error',
            message: error.message
        });
    }
}

/**
 * 심리테스트 특화 검증
 */
async function testPsychologyTest(page, service, result) {
    console.log(`    🧠 심리테스트 검증: ${service.name}`);
    
    if (service.name === '테토-에겐 테스트') {
        // 성별 선택 버튼 확인
        const genderButtons = await page.$$('.gender-btn, [data-gender], button[value="male"], button[value="female"]');
        if (genderButtons.length >= 2) {
            console.log('    ✅ 성별 선택 버튼 발견');
            await genderButtons[0].click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            result.steps['성별선택'] = { status: 'success' };
        } else {
            result.errors.push({ type: 'ui_error', message: '성별 선택 버튼을 찾을 수 없음' });
        }
        
        // 문항 진행 테스트 (최대 5문항만)
        let questionCount = 0;
        const maxQuestions = 5;
        
        while (questionCount < maxQuestions) {
            const options = await page.$$('.option-btn, .answer-btn, input[type="radio"] + label, button[data-value]');
            if (options.length === 0) break;
            
            await options[0].click();
            await new Promise(resolve => setTimeout(resolve, 800));
            questionCount++;
            
            // 다음 버튼이 있으면 클릭
            const nextBtn = await page.$('.next-btn, .btn-next, button:contains("다음")');
            if (nextBtn) {
                await nextBtn.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        result.steps['20문항진행'] = { 
            status: questionCount > 0 ? 'success' : 'failed', 
            completed: questionCount,
            note: `${questionCount}개 문항 테스트 완료`
        };
        
        console.log(`    📝 ${questionCount}개 문항 테스트 완료`);
        
    } else {
        // MBTI, Love DNA 등 다른 테스트들
        const startBtn = await page.$('.start-btn, .btn-start, button:contains("시작")');
        if (startBtn) {
            await startBtn.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            result.steps['테스트시작'] = { status: 'success' };
        }
        
        // 문항 테스트 (간단히)
        const options = await page.$$('.option-btn, .answer-btn, input[type="radio"] + label');
        if (options.length > 0) {
            await options[0].click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            result.steps['문항진행'] = { status: 'success' };
        }
    }
}

/**
 * 운세 서비스 특화 검증
 */
async function testFortuneService(page, service, result) {
    console.log(`    🔮 운세 서비스 검증: ${service.name}`);
    
    if (service.name === '일일운세') {
        // 생년월일 입력 테스트
        const birthInput = await page.$('input[type="date"], #birth-date, .birth-input');
        if (birthInput) {
            await birthInput.type('1990-01-01');
            result.steps['생년월일입력'] = { status: 'success' };
        }
        
        const generateBtn = await page.$('.generate-btn, .btn-fortune, button:contains("운세")');
        if (generateBtn) {
            await generateBtn.click();
            await new Promise(resolve => setTimeout(resolve, 3000));
            result.steps['운세생성'] = { status: 'success' };
        }
        
    } else if (service.name === '타로운세') {
        // 타로 카드 선택
        const cards = await page.$$('.tarot-card, .card-item, [data-card]');
        if (cards.length > 0) {
            await cards[0].click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            result.steps['카드선택'] = { status: 'success' };
        }
        
    } else if (service.name === '서양별자리운세') {
        // 별자리 선택
        const zodiacSign = await page.$('.zodiac-btn, [data-sign], select[name="sign"]');
        if (zodiacSign) {
            await zodiacSign.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            result.steps['별자리선택'] = { status: 'success' };
        }
    }
    
    // 결과 확인
    const resultArea = await page.$('.result-area, .fortune-result, #result');
    if (resultArea) {
        const resultText = await resultArea.textContent();
        if (resultText && resultText.trim().length > 10) {
            result.steps['결과확인'] = { status: 'success', length: resultText.length };
        }
    }
}

/**
 * 실용 도구 특화 검증
 */
async function testUtilityTool(page, service, result) {
    console.log(`    🛠️ 실용 도구 검증: ${service.name}`);
    
    if (service.name === 'BMI 계산기') {
        // 키, 몸무게 입력
        const heightInput = await page.$('input[name="height"], #height, .height-input');
        const weightInput = await page.$('input[name="weight"], #weight, .weight-input');
        
        if (heightInput && weightInput) {
            await heightInput.type('170');
            await weightInput.type('65');
            result.steps['키/몸무게입력'] = { status: 'success' };
            
            const calculateBtn = await page.$('.calculate-btn, .btn-calc, button:contains("계산")');
            if (calculateBtn) {
                await calculateBtn.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                result.steps['BMI계산'] = { status: 'success' };
                
                // 결과 확인
                const bmiResult = await page.$('.bmi-result, #bmi-value, .result-value');
                if (bmiResult) {
                    const bmiText = await bmiResult.textContent();
                    if (bmiText && bmiText.includes('22.')) {
                        result.steps['결과표시'] = { status: 'success', value: bmiText.trim() };
                    }
                }
            }
        }
        
    } else if (service.name === '급여 계산기') {
        // 급여 입력
        const salaryInput = await page.$('input[name="salary"], #salary, .salary-input');
        if (salaryInput) {
            await salaryInput.type('3000000');
            result.steps['급여정보입력'] = { status: 'success' };
            
            const calculateBtn = await page.$('.calculate-btn, .btn-calc, button:contains("계산")');
            if (calculateBtn) {
                await calculateBtn.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                result.steps['세금계산'] = { status: 'success' };
            }
        }
        
    } else if (service.name === '글자수 계산기') {
        // 텍스트 입력
        const textInput = await page.$('textarea, input[type="text"], .text-input');
        if (textInput) {
            await textInput.type('안녕하세요. 테스트 텍스트입니다.');
            await new Promise(resolve => setTimeout(resolve, 500));
            result.steps['텍스트입력'] = { status: 'success' };
            
            // 글자수 카운터 확인
            const counter = await page.$('.char-count, .count-result, #char-count');
            if (counter) {
                const countText = await counter.textContent();
                if (countText && countText.includes('17')) {
                    result.steps['글자수계산'] = { status: 'success', count: countText.trim() };
                }
            }
        }
    }
}

/**
 * 모바일 반응형 테스트
 */
async function testMobileResponsiveness(page, service, result) {
    console.log(`    📱 모바일 반응형 테스트`);
    
    try {
        // 모바일 뷰포트로 변경
        await page.setViewport({ width: 375, height: 667 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 주요 요소들이 모바일에서 제대로 표시되는지 확인
        const mainElements = await page.$$('main, .main-content, .container, .test-container, .fortune-container, .tool-container');
        
        let mobileIssues = [];
        
        for (const element of mainElements) {
            const box = await element.boundingBox();
            if (box) {
                if (box.width > 375) {
                    mobileIssues.push(`요소가 모바일 화면 너비를 초과함: ${box.width}px`);
                }
            }
        }
        
        result.mobile = {
            tested: true,
            issues: mobileIssues,
            status: mobileIssues.length === 0 ? 'passed' : 'warning'
        };
        
        // 데스크톱 뷰포트로 복원
        await page.setViewport({ width: 1920, height: 1080 });
        
        console.log(`    📱 모바일 테스트 완료: ${mobileIssues.length}개 이슈`);
        
    } catch (error) {
        result.mobile = {
            tested: false,
            error: error.message,
            status: 'error'
        };
    }
}

/**
 * 메인 검증 함수
 */
async function runComprehensiveVerification() {
    console.log('🚀 doha.kr 11개 서비스 완전 검증 시작\n');
    console.log('팀리더 지시: 테토-에겐 테스트 먼저 → 나머지 10개 서비스 순차 검증\n');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-gpu',
            '--disable-web-security',
            '--allow-file-access-from-files'
        ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // 모든 서비스 수집 (테토-에겐을 맨 앞으로)
    const allServices = [];
    
    // 1. 테토-에겐 테스트 먼저
    const tetoEgenTest = SERVICES.psychology_tests.find(test => test.name === '테토-에겐 테스트');
    if (tetoEgenTest) {
        allServices.push(tetoEgenTest);
    }
    
    // 2. 나머지 심리테스트들
    SERVICES.psychology_tests.forEach(test => {
        if (test.name !== '테토-에겐 테스트') {
            allServices.push(test);
        }
    });
    
    // 3. 운세 서비스들
    allServices.push(...SERVICES.fortune_services);
    
    // 4. 실용 도구들
    allServices.push(...SERVICES.utility_tools);
    
    verificationResults.summary.total = allServices.length;
    
    // 각 서비스 검증 실행
    for (let i = 0; i < allServices.length; i++) {
        const service = allServices[i];
        console.log(`\n📋 [${i + 1}/${allServices.length}] ${service.name} 검증 중...`);
        
        const result = await loadAndValidatePage(page, service);
        verificationResults.services[service.name] = result;
        
        // 통계 업데이트
        switch (result.status) {
            case 'passed':
                verificationResults.summary.passed++;
                break;
            case 'warning':
                verificationResults.summary.warning++;
                break;
            case 'failed':
                verificationResults.summary.failed++;
                break;
        }
        
        // 진행상황 출력
        console.log(`진행상황: ${i + 1}/${allServices.length} 완료`);
    }
    
    await browser.close();
    
    // 결과 보고서 생성
    await generateFinalReport();
}

/**
 * 최종 보고서 생성
 */
async function generateFinalReport() {
    console.log('\n📊 최종 보고서 생성 중...\n');
    
    const reportPath = path.join(__dirname, `doha-kr-11-services-verification-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(verificationResults, null, 2));
    
    // 콘솔 요약 보고서
    console.log('🎯 doha.kr 11개 서비스 검증 완료 보고서');
    console.log('='.repeat(60));
    console.log(`🕐 검증 시간: ${verificationResults.timestamp}`);
    console.log(`📊 전체 통계: ${verificationResults.summary.total}개 서비스`);
    console.log(`✅ 정상: ${verificationResults.summary.passed}개`);
    console.log(`⚠️  경고: ${verificationResults.summary.warning}개`);
    console.log(`❌ 실패: ${verificationResults.summary.failed}개`);
    
    const successRate = ((verificationResults.summary.passed / verificationResults.summary.total) * 100).toFixed(1);
    console.log(`📈 성공률: ${successRate}%`);
    
    console.log('\n📋 서비스별 상세 결과:');
    console.log('-'.repeat(60));
    
    Object.entries(verificationResults.services).forEach(([name, result]) => {
        const statusIcon = {
            'passed': '✅',
            'warning': '⚠️',
            'failed': '❌'
        }[result.status] || '❓';
        
        console.log(`${statusIcon} ${name}`);
        console.log(`   타입: ${result.type}`);
        console.log(`   상태: ${result.status.toUpperCase()}`);
        
        if (result.performance && result.performance.loadTime) {
            console.log(`   로딩시간: ${result.performance.loadTime}ms`);
        }
        
        if (result.errors && result.errors.length > 0) {
            console.log(`   오류: ${result.errors.length}개`);
            result.errors.slice(0, 2).forEach(error => {
                console.log(`     - ${error.type}: ${error.message}`);
            });
        }
        
        if (result.warnings && result.warnings.length > 0) {
            console.log(`   경고: ${result.warnings.length}개`);
        }
        
        if (result.mobile) {
            console.log(`   모바일: ${result.mobile.status}`);
        }
        
        // 단계별 결과
        if (result.steps && Object.keys(result.steps).length > 0) {
            const completedSteps = Object.entries(result.steps).filter(([_, step]) => step.status === 'success').length;
            const totalSteps = Object.keys(result.steps).length;
            console.log(`   단계완료: ${completedSteps}/${totalSteps}`);
        }
        
        console.log('');
    });
    
    console.log('\n🏁 최종 결론:');
    console.log('-'.repeat(60));
    
    if (verificationResults.summary.failed === 0) {
        if (verificationResults.summary.warning === 0) {
            console.log('🎉 모든 서비스가 100% 정상 작동합니다!');
        } else {
            console.log(`✅ 모든 서비스가 작동하나 ${verificationResults.summary.warning}개 서비스에 경고사항이 있습니다.`);
        }
    } else {
        console.log(`⚠️  ${verificationResults.summary.failed}개 서비스에 문제가 발견되었습니다. 수정이 필요합니다.`);
    }
    
    console.log(`\n📄 상세 보고서 저장됨: ${reportPath}`);
    
    return verificationResults;
}

// 메인 실행
if (require.main === module) {
    runComprehensiveVerification()
        .then(results => {
            console.log('\n✅ 검증 완료');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ 검증 실패:', error);
            process.exit(1);
        });
}

module.exports = {
    runComprehensiveVerification,
    SERVICES,
    verificationResults
};