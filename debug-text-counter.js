import { chromium } from 'playwright';

async function debugTextCounter() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Capture console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
        errors.push(`PAGE ERROR: ${error.message}`);
    });
    
    console.log('🔍 디버깅 텍스트 카운터 페이지...\n');
    
    await page.goto('https://doha.kr/tools/text-counter.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 1. 에러 확인
    console.log('1. 콘솔 에러:');
    if (errors.length === 0) {
        console.log('✅ 에러 없음');
    } else {
        errors.forEach(err => console.log(`❌ ${err}`));
    }
    
    // 2. DOMPurify 스크립트 태그 확인
    console.log('\n2. DOMPurify 스크립트 태그 분석:');
    const domPurifyInfo = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script')).filter(s => 
            s.src && s.src.includes('dompurify')
        );
        
        return scripts.map(script => ({
            src: script.src,
            integrity: script.getAttribute('integrity'),
            crossorigin: script.getAttribute('crossorigin')
        }));
    });
    
    if (domPurifyInfo.length === 0) {
        console.log('❌ DOMPurify 스크립트를 찾을 수 없음');
    } else {
        domPurifyInfo.forEach(info => {
            console.log(`  - URL: ${info.src}`);
            console.log(`  - Integrity: ${info.integrity || 'none'}`);
            console.log(`  - Crossorigin: ${info.crossorigin || 'none'}`);
        });
    }
    
    // 3. 전체 HTML 소스에서 DOMPurify 검색
    console.log('\n3. HTML 소스에서 DOMPurify 검색:');
    const htmlContent = await page.content();
    const domPurifyMatches = htmlContent.match(/<script[^>]*dompurify[^>]*>.*?<\/script>/gi);
    
    if (domPurifyMatches) {
        console.log(`Found ${domPurifyMatches.length} DOMPurify script references`);
        domPurifyMatches.forEach((match, i) => {
            console.log(`\nMatch ${i + 1}:`);
            console.log(match.substring(0, 200) + '...');
        });
    }
    
    // 4. 네트워크 요청 확인
    console.log('\n4. DOMPurify 관련 네트워크 요청:');
    const requests = [];
    page.on('request', request => {
        if (request.url().includes('dompurify')) {
            requests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers()
            });
        }
    });
    
    // 페이지 새로고침하여 네트워크 요청 캡처
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    if (requests.length > 0) {
        requests.forEach(req => {
            console.log(`  - ${req.method} ${req.url}`);
        });
    } else {
        console.log('  - DOMPurify 네트워크 요청 없음');
    }
    
    // 5. JavaScript 함수 확인
    console.log('\n5. JavaScript 함수 상태:');
    const functionStatus = await page.evaluate(() => {
        const funcs = ['handleTextInput', 'updateCount', 'clearText', 'copyText', 'pasteText', 'validateInput'];
        const status = {};
        
        funcs.forEach(func => {
            try {
                status[func] = {
                    exists: typeof window[func] === 'function',
                    type: typeof window[func]
                };
            } catch (e) {
                status[func] = {
                    exists: false,
                    error: e.message
                };
            }
        });
        
        return status;
    });
    
    Object.entries(functionStatus).forEach(([func, info]) => {
        console.log(`  - ${func}: ${info.exists ? '✅ 존재' : '❌ 없음'} (${info.type || info.error})`);
    });
    
    // 6. 실제 테스트
    console.log('\n6. 기능 테스트:');
    try {
        await page.fill('#textInput', '테스트 텍스트');
        await page.waitForTimeout(500);
        
        const charCount = await page.textContent('#totalChars');
        console.log(`  - 입력된 글자수: ${charCount}`);
        console.log(`  - 기능 상태: ${charCount !== '0' ? '✅ 정상' : '❌ 비정상'}`);
    } catch (e) {
        console.log(`  - 테스트 실패: ${e.message}`);
    }
    
    await browser.close();
}

debugTextCounter().catch(console.error);