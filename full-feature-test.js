import { chromium } from 'playwright';

async function testAllFeatures() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 전체 기능 테스트 시작...\n');
    
    const results = [];
    
    // 1. 사주 운세 테스트
    console.log('1️⃣ 사주 운세 테스트');
    try {
        await page.goto('https://doha.kr/fortune/saju/');
        await page.waitForTimeout(3000);
        
        // 폼 입력
        await page.fill('#userName', '테스트');
        await page.selectOption('#gender', 'male');
        await page.fill('#birthYear', '1990');
        await page.fill('#birthMonth', '5');
        await page.fill('#birthDay', '15');
        await page.selectOption('#birthTime', '12');
        
        // 제출
        await page.click('button[type="submit"]');
        await page.waitForTimeout(5000);
        
        // 결과 확인
        const resultVisible = await page.isVisible('#sajuResult');
        const resultCard = await page.$('.fortune-result-card');
        const hasCardStyle = resultCard !== null;
        
        results.push({
            name: '사주 운세',
            formSubmit: '✅',
            resultShown: resultVisible ? '✅' : '❌',
            cardDesign: hasCardStyle ? '✅' : '❌'
        });
        
        await page.screenshot({ path: 'test-saju-result-full.png', fullPage: true });
    } catch (error) {
        console.error('사주 운세 테스트 실패:', error);
        results.push({
            name: '사주 운세',
            formSubmit: '❌',
            resultShown: '❌',
            cardDesign: '❌'
        });
    }
    
    // 2. 일일 운세 테스트
    console.log('\n2️⃣ 일일 운세 테스트');
    try {
        await page.goto('https://doha.kr/fortune/daily/');
        await page.waitForTimeout(3000);
        
        // 폼 입력
        await page.fill('#userName', '테스트');
        await page.selectOption('#birthYear', '1990');
        await page.selectOption('#birthMonth', '5');
        await page.selectOption('#birthDay', '15');
        
        // 제출
        await page.click('button[type="submit"]');
        await page.waitForTimeout(5000);
        
        // 결과 확인
        const resultVisible = await page.isVisible('#fortuneResult');
        const resultCard = await page.$('.fortune-result-card');
        const hasCardStyle = resultCard !== null;
        
        results.push({
            name: '일일 운세',
            formSubmit: '✅',
            resultShown: resultVisible ? '✅' : '❌',
            cardDesign: hasCardStyle ? '✅' : '❌'
        });
        
        await page.screenshot({ path: 'test-daily-result-full.png', fullPage: true });
    } catch (error) {
        console.error('일일 운세 테스트 실패:', error);
        results.push({
            name: '일일 운세',
            formSubmit: '❌',
            resultShown: '❌',
            cardDesign: '❌'
        });
    }
    
    // 3. 타로 운세 테스트
    console.log('\n3️⃣ 타로 운세 테스트');
    try {
        await page.goto('https://doha.kr/fortune/tarot/');
        await page.waitForTimeout(3000);
        
        // 카드 선택
        const cards = await page.$$('.tarot-card');
        if (cards.length >= 3) {
            await cards[0].click();
            await page.waitForTimeout(500);
            await cards[1].click();
            await page.waitForTimeout(500);
            await cards[2].click();
            await page.waitForTimeout(3000);
        }
        
        // 결과 확인
        const resultVisible = await page.isVisible('.tarot-result');
        const hasCardStyle = (await page.$('.fortune-result-card')) !== null;
        
        results.push({
            name: '타로 운세',
            formSubmit: '✅',
            resultShown: resultVisible ? '✅' : '❌',
            cardDesign: hasCardStyle ? '✅' : '❌'
        });
        
        await page.screenshot({ path: 'test-tarot-result-full.png', fullPage: true });
    } catch (error) {
        console.error('타로 운세 테스트 실패:', error);
        results.push({
            name: '타로 운세',
            formSubmit: '❌',
            resultShown: '❌',
            cardDesign: '❌'
        });
    }
    
    // 4. MBTI 테스트
    console.log('\n4️⃣ MBTI 테스트');
    try {
        await page.goto('https://doha.kr/tests/mbti/');
        await page.waitForTimeout(3000);
        
        // 테스트 시작
        const startBtn = await page.$('button:has-text("테스트 시작")');
        if (startBtn) {
            await startBtn.click();
            await page.waitForTimeout(2000);
        }
        
        // 질문에 답하기 (처음 3개만)
        for (let i = 0; i < 3; i++) {
            const options = await page.$$('.option-button, .answer-option');
            if (options.length > 0) {
                await options[0].click();
                await page.waitForTimeout(1000);
            }
        }
        
        const resultVisible = await page.isVisible('.result-card, .test-result');
        
        results.push({
            name: 'MBTI 테스트',
            formSubmit: '✅',
            resultShown: resultVisible ? '✅' : '❌',
            cardDesign: resultVisible ? '✅' : '❌'
        });
        
        await page.screenshot({ path: 'test-mbti-progress.png', fullPage: true });
    } catch (error) {
        console.error('MBTI 테스트 실패:', error);
        results.push({
            name: 'MBTI 테스트',
            formSubmit: '❌',
            resultShown: '❌',
            cardDesign: '❌'
        });
    }
    
    // 5. BMI 계산기 테스트
    console.log('\n5️⃣ BMI 계산기 테스트');
    try {
        await page.goto('https://doha.kr/tools/bmi-calculator.html');
        await page.waitForTimeout(3000);
        
        // 입력
        await page.fill('#height', '170');
        await page.fill('#weight', '70');
        
        // 계산
        const calcBtn = await page.$('button:has-text("계산")');
        if (calcBtn) {
            await calcBtn.click();
            await page.waitForTimeout(1000);
        }
        
        // 결과 확인
        const resultVisible = await page.isVisible('#bmiResult, .bmi-result');
        const hasCardStyle = (await page.$('.result-card, .bmi-result-card')) !== null;
        
        results.push({
            name: 'BMI 계산기',
            formSubmit: '✅',
            resultShown: resultVisible ? '✅' : '❌',
            cardDesign: hasCardStyle ? '✅' : '❌'
        });
        
        await page.screenshot({ path: 'test-bmi-result.png', fullPage: true });
    } catch (error) {
        console.error('BMI 계산기 테스트 실패:', error);
        results.push({
            name: 'BMI 계산기',
            formSubmit: '❌',
            resultShown: '❌',
            cardDesign: '❌'
        });
    }
    
    // 6. 글자수 세기 테스트
    console.log('\n6️⃣ 글자수 세기 테스트');
    try {
        await page.goto('https://doha.kr/tools/text-counter.html');
        await page.waitForTimeout(3000);
        
        // 텍스트 입력
        await page.fill('textarea', '안녕하세요. 이것은 테스트 문장입니다.');
        await page.waitForTimeout(1000);
        
        // 결과 확인
        const charCount = await page.$('.char-count, #charCount');
        const resultVisible = charCount !== null;
        
        results.push({
            name: '글자수 세기',
            formSubmit: '✅',
            resultShown: resultVisible ? '✅' : '❌',
            cardDesign: '✅' // 실시간 표시
        });
        
        await page.screenshot({ path: 'test-text-counter.png', fullPage: true });
    } catch (error) {
        console.error('글자수 세기 테스트 실패:', error);
        results.push({
            name: '글자수 세기',
            formSubmit: '❌',
            resultShown: '❌',
            cardDesign: '❌'
        });
    }
    
    // 결과 출력
    console.log('\n📊 테스트 결과 요약:');
    console.log('━'.repeat(60));
    console.log('서비스명\t\t폼 제출\t결과 표시\t카드 디자인');
    console.log('━'.repeat(60));
    
    results.forEach(result => {
        console.log(`${result.name}\t\t${result.formSubmit}\t${result.resultShown}\t\t${result.cardDesign}`);
    });
    
    console.log('━'.repeat(60));
    
    // 문제가 있는 항목 표시
    const issues = results.filter(r => r.resultShown === '❌' || r.cardDesign === '❌');
    if (issues.length > 0) {
        console.log('\n⚠️  문제가 발견된 서비스:');
        issues.forEach(issue => {
            console.log(`- ${issue.name}: 결과표시(${issue.resultShown}) 카드디자인(${issue.cardDesign})`);
        });
    } else {
        console.log('\n✅ 모든 서비스가 정상 작동합니다!');
    }
    
    await browser.close();
}

testAllFeatures().catch(console.error);