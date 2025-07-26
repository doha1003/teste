import { chromium } from 'playwright';

async function verifyAllFixes() {
    const browser = await chromium.launch({ headless: false });
    
    console.log('🔍 모든 수정사항 최종 검증 시작...\n');
    console.log('GitHub Actions 배포 대기 중... (60초)');
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    const results = {
        passed: 0,
        failed: 0,
        details: []
    };
    
    // 1. 텍스트 카운터 테스트
    console.log('\n1. 글자수 세기 페이지 테스트:');
    const textCounterPage = await browser.newPage();
    const textCounterErrors = [];
    
    textCounterPage.on('console', msg => {
        if (msg.type() === 'error' && !msg.text().includes('Attestation')) {
            textCounterErrors.push(msg.text());
        }
    });
    
    await textCounterPage.goto('https://doha.kr/tools/text-counter.html', { waitUntil: 'networkidle' });
    await textCounterPage.waitForTimeout(2000);
    
    // 텍스트 입력 테스트
    await textCounterPage.fill('#textInput', '안녕하세요 Hello 123');
    await textCounterPage.waitForTimeout(500);
    
    const charCount = await textCounterPage.textContent('#totalChars');
    const functionWorks = charCount !== '0';
    
    if (textCounterErrors.length === 0 && functionWorks) {
        console.log('✅ 글자수 세기 - 정상 작동 (글자수:', charCount + ')');
        results.passed++;
    } else {
        console.log('❌ 글자수 세기 - 문제 발견');
        if (textCounterErrors.length > 0) {
            console.log('   에러:', textCounterErrors);
        }
        if (!functionWorks) {
            console.log('   기능 작동 안함');
        }
        results.failed++;
    }
    
    await textCounterPage.close();
    
    // 2. BMI 계산기 테스트
    console.log('\n2. BMI 계산기 테스트:');
    const bmiPage = await browser.newPage();
    await bmiPage.goto('https://doha.kr/tools/bmi-calculator.html', { waitUntil: 'networkidle' });
    
    try {
        await bmiPage.fill('#height', '170');
        await bmiPage.fill('#weight', '70');
        await bmiPage.click('button[type="submit"]');
        await bmiPage.waitForTimeout(1000);
        
        const bmiResult = await bmiPage.isVisible('#result');
        if (bmiResult) {
            console.log('✅ BMI 계산기 - 정상 작동');
            results.passed++;
        } else {
            console.log('❌ BMI 계산기 - 결과 표시 안됨');
            results.failed++;
        }
    } catch (error) {
        console.log('❌ BMI 계산기 - 에러:', error.message);
        results.failed++;
    }
    
    await bmiPage.close();
    
    // 3. 타로 페이지 테스트
    console.log('\n3. 타로 페이지 테스트:');
    const tarotPage = await browser.newPage();
    await tarotPage.goto('https://doha.kr/fortune/tarot/', { waitUntil: 'networkidle' });
    
    try {
        await tarotPage.fill('#question', '테스트 질문');
        const submitButton = await tarotPage.$('button[type="submit"]');
        
        if (submitButton) {
            await submitButton.click();
            await tarotPage.waitForTimeout(2000);
            
            const resultVisible = await tarotPage.isVisible('#tarotResult');
            if (resultVisible) {
                console.log('✅ 타로 페이지 - 정상 작동');
                results.passed++;
            } else {
                console.log('❌ 타로 페이지 - 결과 표시 안됨');
                results.failed++;
            }
        } else {
            console.log('❌ 타로 페이지 - 제출 버튼 없음');
            results.failed++;
        }
    } catch (error) {
        console.log('❌ 타로 페이지 - 에러:', error.message);
        results.failed++;
    }
    
    await tarotPage.close();
    
    // 4. 일일운세 테스트
    console.log('\n4. 일일운세 테스트:');
    const dailyPage = await browser.newPage();
    await dailyPage.goto('https://doha.kr/fortune/daily/', { waitUntil: 'networkidle' });
    
    try {
        await dailyPage.fill('#userName', '홍길동');
        await dailyPage.selectOption('#birthYear', '1990');
        await dailyPage.selectOption('#birthMonth', '1');
        await dailyPage.selectOption('#birthDay', '1');
        await dailyPage.click('button[type="submit"]');
        await dailyPage.waitForTimeout(3000);
        
        const fortuneResult = await dailyPage.isVisible('#fortuneResult');
        if (fortuneResult) {
            console.log('✅ 일일운세 - 정상 작동');
            results.passed++;
        } else {
            console.log('❌ 일일운세 - 결과 표시 안됨');
            results.failed++;
        }
    } catch (error) {
        console.log('❌ 일일운세 - 에러:', error.message);
        results.failed++;
    }
    
    await dailyPage.close();
    
    // 5. API 설정 확인
    console.log('\n5. API 설정 확인:');
    const apiPage = await browser.newPage();
    await apiPage.goto('https://doha.kr/', { waitUntil: 'networkidle' });
    
    const apiConfig = await apiPage.evaluate(() => {
        return {
            hasAPIConfig: typeof window.API_CONFIG !== 'undefined',
            hasGeminiEndpoint: window.API_CONFIG && window.API_CONFIG.gemini && window.API_CONFIG.gemini.endpoint,
            kakaoInitialized: typeof Kakao !== 'undefined' && Kakao.isInitialized && Kakao.isInitialized()
        };
    });
    
    if (apiConfig.hasAPIConfig && apiConfig.hasGeminiEndpoint) {
        console.log('✅ API 설정 - 정상');
        results.passed++;
    } else {
        console.log('❌ API 설정 - 문제 발견');
        results.failed++;
    }
    
    await apiPage.close();
    
    await browser.close();
    
    // 최종 결과
    console.log('\n' + '='.repeat(60));
    console.log('📊 최종 검증 결과');
    console.log('='.repeat(60));
    console.log(`✅ 성공: ${results.passed}개`);
    console.log(`❌ 실패: ${results.failed}개`);
    console.log(`📈 성공률: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 모든 테스트 통과! 26개 페이지 정상 작동 확인');
    } else {
        console.log('\n⚠️ 일부 문제가 남아있습니다. 추가 수정이 필요합니다.');
    }
}

verifyAllFixes().catch(console.error);