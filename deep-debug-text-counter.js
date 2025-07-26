import { chromium } from 'playwright';

async function deepDebugTextCounter() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Enable verbose console logging
    page.on('console', msg => {
        console.log(`[${msg.type()}] ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
        console.log(`[PAGE ERROR] ${error.message}`);
    });
    
    console.log('🔍 텍스트 카운터 심층 디버깅...\n');
    
    await page.goto('https://doha.kr/tools/text-counter.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 1. DOMPurify 로드 확인
    console.log('\n1. DOMPurify 상태:');
    const domPurifyStatus = await page.evaluate(() => {
        return {
            loaded: typeof DOMPurify !== 'undefined',
            version: typeof DOMPurify !== 'undefined' ? DOMPurify.version : 'not loaded'
        };
    });
    console.log('DOMPurify:', domPurifyStatus);
    
    // 2. 함수 존재 확인
    console.log('\n2. JavaScript 함수 상태:');
    const functions = await page.evaluate(() => {
        const funcs = ['validateInput', 'handleTextInput', 'updateCount', 'clearText'];
        const status = {};
        funcs.forEach(func => {
            status[func] = typeof window[func];
        });
        return status;
    });
    console.log('Functions:', functions);
    
    // 3. validateInput 함수 테스트
    console.log('\n3. validateInput 함수 직접 테스트:');
    try {
        const validateResult = await page.evaluate(() => {
            if (typeof validateInput === 'function') {
                return validateInput('테스트 텍스트');
            }
            return 'function not found';
        });
        console.log('validateInput 결과:', validateResult);
    } catch (error) {
        console.log('validateInput 에러:', error.message);
    }
    
    // 4. 수동으로 updateCount 호출
    console.log('\n4. updateCount 함수 수동 호출:');
    try {
        await page.evaluate(() => {
            document.getElementById('textInput').value = '테스트';
            if (typeof updateCount === 'function') {
                updateCount();
            }
        });
        
        const charCount = await page.textContent('#totalChars');
        console.log('글자수:', charCount);
    } catch (error) {
        console.log('updateCount 에러:', error.message);
    }
    
    // 5. 전체 스크립트 블록 확인
    console.log('\n5. 인라인 스크립트 확인:');
    const scriptContent = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'));
        const textCounterScript = scripts.find(s => 
            s.textContent && s.textContent.includes('validateInput')
        );
        
        if (textCounterScript) {
            // Check first few lines
            const lines = textCounterScript.textContent.split('\n').slice(0, 10);
            return {
                found: true,
                firstLines: lines.join('\n'),
                hasDebounceTimer: textCounterScript.textContent.includes('debounceTimer'),
                hasValidateInput: textCounterScript.textContent.includes('function validateInput'),
                hasUpdateCount: textCounterScript.textContent.includes('function updateCount')
            };
        }
        return { found: false };
    });
    console.log('Script analysis:', scriptContent);
    
    await browser.close();
}

deepDebugTextCounter().catch(console.error);