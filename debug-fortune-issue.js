// 운세 페이지 문제 디버깅
import { chromium } from 'playwright';

async function debugIssue() {
    const browser = await chromium.launch({ 
        headless: false,
        devtools: true 
    });
    
    const page = await browser.newPage();
    
    // 콘솔 메시지 캡처
    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push({
            type: msg.type(),
            text: msg.text()
        });
    });
    
    await page.goto('https://doha.kr/fortune/daily/', { 
        waitUntil: 'networkidle' 
    });
    
    // JavaScript 상태 확인
    const checks = await page.evaluate(() => {
        return {
            // 함수 존재 여부
            hasGenerateDailyFortune: typeof generateDailyFortune !== 'undefined',
            hasSafeHTML: typeof safeHTML !== 'undefined',
            hasLoadComponents: typeof loadComponents !== 'undefined',
            
            // form 요소 확인
            formExists: !!document.querySelector('form'),
            formHasDataAttribute: !!document.querySelector('form[data-form="true"]'),
            
            // 이벤트 리스너 확인
            formListeners: (() => {
                const form = document.querySelector('form');
                if (!form) return 'No form';
                // 간접적으로 확인
                const oldSubmit = form.submit;
                form.submit = function() {
                    console.log('Form submit called');
                    oldSubmit.call(this);
                };
                return 'Checked';
            })(),
            
            // 스크립트 로드 확인
            scriptsLoaded: Array.from(document.querySelectorAll('script[src*=".js"]')).map(s => {
                const url = new URL(s.src);
                return url.pathname;
            })
        };
    });
    
    console.log('🔍 JavaScript 상태 확인:\n');
    console.log('함수 존재 여부:');
    console.log(`  - generateDailyFortune: ${checks.hasGenerateDailyFortune ? '✅' : '❌'}`);
    console.log(`  - safeHTML: ${checks.hasSafeHTML ? '✅' : '❌'}`);
    console.log(`  - loadComponents: ${checks.hasLoadComponents ? '✅' : '❌'}`);
    
    console.log('\nForm 상태:');
    console.log(`  - Form 존재: ${checks.formExists ? '✅' : '❌'}`);
    console.log(`  - data-form 속성: ${checks.formHasDataAttribute ? '✅' : '❌'}`);
    
    console.log('\n로드된 스크립트:');
    checks.scriptsLoaded.forEach(script => {
        console.log(`  - ${script}`);
    });
    
    // 실제 폼 제출 테스트
    console.log('\n📝 폼 제출 테스트...');
    
    await page.fill('#userName', '테스트');
    await page.selectOption('#birthYear', '1990');
    await page.selectOption('#birthMonth', '5');
    await page.selectOption('#birthDay', '15');
    
    // 제출 버튼 클릭
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // 3초 대기
    await page.waitForTimeout(3000);
    
    // 결과 확인
    const afterSubmit = await page.evaluate(() => {
        const resultDiv = document.getElementById('fortuneResult');
        return {
            resultVisible: resultDiv ? getComputedStyle(resultDiv).display !== 'none' : false,
            resultHTML: resultDiv ? resultDiv.innerHTML.substring(0, 100) : 'No result div',
            hasD_none_init: resultDiv ? resultDiv.classList.contains('d-none-init') : false
        };
    });
    
    console.log('\n결과 상태:');
    console.log(`  - 결과 표시: ${afterSubmit.resultVisible ? '✅' : '❌'}`);
    console.log(`  - d-none-init 클래스: ${afterSubmit.hasD_none_init ? '있음' : '없음'}`);
    console.log(`  - 결과 HTML: ${afterSubmit.resultHTML}`);
    
    console.log('\n콘솔 로그:');
    consoleLogs.filter(log => log.type === 'error').forEach(log => {
        console.log(`  ❌ ${log.text}`);
    });
    consoleLogs.filter(log => log.type === 'log').forEach(log => {
        console.log(`  📝 ${log.text}`);
    });
    
    await browser.close();
}

debugIssue().catch(console.error);