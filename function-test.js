import { chromium } from 'playwright';

async function functionTest() {
    console.log('🔧 기능 테스트 시작...\n');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // 1. 일일 운세 기능 테스트
    console.log('1️⃣ 일일 운세 기능 테스트');
    try {
        await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // 폼 입력
        await page.fill('#userName', '테스트');
        
        // 년도 드롭다운 확인
        const yearOptions = await page.$$eval('#birthYear option', options => options.length);
        console.log(`  년도 옵션 개수: ${yearOptions}`);
        
        if (yearOptions > 1) {
            await page.selectOption('#birthYear', '1990');
            await page.selectOption('#birthMonth', '5');
            
            // 일 드롭다운 업데이트 대기
            await page.waitForTimeout(1000);
            const dayOptions = await page.$$eval('#birthDay option', options => options.length);
            console.log(`  일 옵션 개수: ${dayOptions}`);
            
            if (dayOptions > 1) {
                await page.selectOption('#birthDay', '15');
                
                // 제출
                await page.click('button[type="submit"]');
                await page.waitForTimeout(5000);
                
                // 결과 확인
                const resultVisible = await page.isVisible('#fortuneResult');
                const resultCard = await page.$('.fortune-result-card');
                
                console.log(`  결과 표시: ${resultVisible ? '✅' : '❌'}`);
                console.log(`  카드 디자인: ${resultCard ? '✅' : '❌'}`);
                
                if (resultVisible) {
                    const resultText = await page.$eval('#fortuneResult', el => el.textContent);
                    console.log(`  결과 텍스트 길이: ${resultText.length}`);
                }
            }
        }
        
        await page.screenshot({ path: 'daily-fortune-test.png', fullPage: true });
    } catch (error) {
        console.log(`  ❌ 에러: ${error.message}`);
    }
    
    // 2. BMI 계산기 테스트
    console.log('\n2️⃣ BMI 계산기 테스트');
    try {
        await page.goto('https://doha.kr/tools/bmi-calculator.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        await page.fill('#height', '170');
        await page.fill('#weight', '70');
        
        // 계산 버튼 찾기
        const calcButtons = await page.$$('button');
        let calcBtn = null;
        
        for (const btn of calcButtons) {
            const text = await btn.textContent();
            if (text.includes('계산') || text.includes('BMI')) {
                calcBtn = btn;
                break;
            }
        }
        
        if (calcBtn) {
            await calcBtn.click();
            await page.waitForTimeout(2000);
            
            // 결과 확인
            const bmiResult = await page.$('#bmiResult, .bmi-result, .result-card');
            const resultVisible = bmiResult ? await bmiResult.isVisible() : false;
            
            console.log(`  결과 표시: ${resultVisible ? '✅' : '❌'}`);
            
            if (resultVisible) {
                const hasCardStyle = await page.$('.fortune-result-card, .result-card');
                console.log(`  카드 스타일: ${hasCardStyle ? '✅' : '❌'}`);
            }
        } else {
            console.log('  ❌ 계산 버튼을 찾을 수 없음');
        }
        
        await page.screenshot({ path: 'bmi-test.png', fullPage: true });
    } catch (error) {
        console.log(`  ❌ 에러: ${error.message}`);
    }
    
    // 3. 타로 카드 테스트
    console.log('\n3️⃣ 타로 카드 테스트');
    try {
        await page.goto('https://doha.kr/fortune/tarot/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // 카드 선택
        const cards = await page.$$('.tarot-card, .card');
        console.log(`  타로 카드 개수: ${cards.length}`);
        
        if (cards.length >= 3) {
            for (let i = 0; i < 3; i++) {
                await cards[i].click();
                await page.waitForTimeout(1000);
            }
            
            await page.waitForTimeout(3000);
            
            // 결과 확인
            const result = await page.$('.tarot-result, #tarotResult, .result-container');
            const resultVisible = result ? await result.isVisible() : false;
            
            console.log(`  결과 표시: ${resultVisible ? '✅' : '❌'}`);
        } else {
            console.log('  ⚠️  타로 카드가 충분하지 않음');
        }
        
        await page.screenshot({ path: 'tarot-test.png', fullPage: true });
    } catch (error) {
        console.log(`  ❌ 에러: ${error.message}`);
    }
    
    // 4. 사주 운세 테스트 (input type 확인)
    console.log('\n4️⃣ 사주 운세 입력 필드 확인');
    try {
        await page.goto('https://doha.kr/fortune/saju/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // 입력 필드 타입 확인
        const yearType = await page.$eval('#birthYear', el => el.tagName + ':' + el.type);
        const monthType = await page.$eval('#birthMonth', el => el.tagName + ':' + el.type);
        const dayType = await page.$eval('#birthDay', el => el.tagName + ':' + el.type);
        
        console.log(`  년도 필드: ${yearType}`);
        console.log(`  월 필드: ${monthType}`);
        console.log(`  일 필드: ${dayType}`);
        
        // 폼 제출 테스트
        await page.fill('#userName', '테스트');
        await page.selectOption('#gender', 'male');
        
        if (yearType.includes('INPUT')) {
            await page.fill('#birthYear', '1990');
            await page.fill('#birthMonth', '5');
            await page.fill('#birthDay', '15');
        } else {
            await page.selectOption('#birthYear', '1990');
            await page.selectOption('#birthMonth', '5');
            await page.selectOption('#birthDay', '15');
        }
        
        await page.selectOption('#birthTime', '11');
        
        // 스크린샷 (폼 입력 상태)
        await page.screenshot({ path: 'saju-form.png' });
        
    } catch (error) {
        console.log(`  ❌ 에러: ${error.message}`);
    }
    
    // 5. MBTI 테스트 시작 확인
    console.log('\n5️⃣ MBTI 테스트 시작 확인');
    try {
        await page.goto('https://doha.kr/tests/mbti/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // 시작 버튼 찾기
        const links = await page.$$('a');
        let startLink = null;
        
        for (const link of links) {
            const text = await link.textContent();
            if (text.includes('시작') || text.includes('테스트')) {
                const href = await link.getAttribute('href');
                console.log(`  시작 링크 발견: ${href}`);
                startLink = link;
                break;
            }
        }
        
        if (startLink) {
            await startLink.click();
            await page.waitForTimeout(3000);
            console.log(`  현재 URL: ${page.url()}`);
            
            // 질문 화면 확인
            const hasQuestions = await page.$('.question, .test-question');
            console.log(`  질문 화면: ${hasQuestions ? '✅' : '❌'}`);
        }
        
        await page.screenshot({ path: 'mbti-test.png' });
    } catch (error) {
        console.log(`  ❌ 에러: ${error.message}`);
    }
    
    console.log('\n✅ 기능 테스트 완료');
    
    await browser.close();
}

functionTest().catch(console.error);