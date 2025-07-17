const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function checkCSSLoading() {
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true
    });

    try {
        const page = await browser.newPage();
        
        // 네트워크 요청 추적
        const requests = [];
        page.on('request', request => {
            if (request.resourceType() === 'stylesheet') {
                requests.push({
                    url: request.url(),
                    method: request.method()
                });
            }
        });

        // 네트워크 응답 추적
        const responses = [];
        page.on('response', response => {
            const url = response.url();
            if (url.includes('.css')) {
                responses.push({
                    url: url,
                    status: response.status(),
                    headers: response.headers()
                });
            }
        });

        console.log('🌐 doha.kr 접속 중...');
        await page.goto('https://doha.kr', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('\n📊 CSS 요청 현황:');
        requests.forEach(req => {
            console.log(`  - ${req.method} ${req.url}`);
        });

        console.log('\n📡 CSS 응답 현황:');
        responses.forEach(res => {
            console.log(`  - ${res.status} ${res.url}`);
            if (res.headers['content-type']) {
                console.log(`    Content-Type: ${res.headers['content-type']}`);
            }
        });

        // styles-combined.css 내용 확인
        const cssContent = await page.evaluate(async () => {
            try {
                const response = await fetch('/css/styles-combined.css');
                const text = await response.text();
                return {
                    status: response.status,
                    length: text.length,
                    firstChars: text.substring(0, 200),
                    lastChars: text.substring(text.length - 200),
                    contentType: response.headers.get('content-type')
                };
            } catch (e) {
                return { error: e.message };
            }
        });

        console.log('\n📄 styles-combined.css 상태:');
        if (cssContent.error) {
            console.log(`  ❌ 오류: ${cssContent.error}`);
        } else {
            console.log(`  - 상태 코드: ${cssContent.status}`);
            console.log(`  - Content-Type: ${cssContent.contentType}`);
            console.log(`  - 파일 크기: ${cssContent.length}자`);
            console.log(`  - 첫 200자:\n${cssContent.firstChars}`);
            console.log(`  - 마지막 200자:\n${cssContent.lastChars}`);
        }

        // 실제 적용된 스타일 확인
        const appliedStyles = await page.evaluate(() => {
            const navbar = document.querySelector('.navbar');
            const hero = document.querySelector('.hero');
            
            const checkElement = (selector) => {
                const el = document.querySelector(selector);
                if (!el) return { selector, exists: false };
                
                const styles = getComputedStyle(el);
                const sheet = Array.from(document.styleSheets).find(s => 
                    s.href && s.href.includes('styles-combined.css')
                );
                
                let rulesCount = 0;
                if (sheet) {
                    try {
                        rulesCount = sheet.cssRules.length;
                    } catch (e) {
                        rulesCount = 'CORS blocked';
                    }
                }
                
                return {
                    selector,
                    exists: true,
                    display: styles.display,
                    background: styles.backgroundColor,
                    width: styles.width,
                    height: styles.height,
                    padding: styles.padding,
                    margin: styles.margin,
                    rulesInSheet: rulesCount
                };
            };
            
            return {
                navbar: checkElement('.navbar'),
                hero: checkElement('.hero'),
                heroTitle: checkElement('.hero-title'),
                serviceCard: checkElement('.service-card')
            };
        });

        console.log('\n🎨 적용된 스타일 검사:');
        Object.entries(appliedStyles).forEach(([name, data]) => {
            if (!data.exists) {
                console.log(`  ❌ ${data.selector} - 요소 없음`);
            } else {
                console.log(`  ✅ ${data.selector}:`);
                console.log(`     - Display: ${data.display}`);
                console.log(`     - Background: ${data.background}`);
                console.log(`     - Width: ${data.width}`);
                console.log(`     - Padding: ${data.padding}`);
                console.log(`     - CSS Rules in sheet: ${data.rulesInSheet}`);
            }
        });

        // 스타일시트 직접 확인
        const stylesheetInfo = await page.evaluate(() => {
            const sheets = Array.from(document.styleSheets);
            return sheets.map(sheet => {
                let rulesCount = 0;
                let sampleRules = [];
                try {
                    const rules = sheet.cssRules || sheet.rules;
                    rulesCount = rules ? rules.length : 0;
                    
                    // 처음 5개 규칙 샘플
                    for (let i = 0; i < Math.min(5, rulesCount); i++) {
                        sampleRules.push(rules[i].cssText.substring(0, 100));
                    }
                } catch (e) {
                    rulesCount = 'CORS blocked';
                }
                
                return {
                    href: sheet.href,
                    disabled: sheet.disabled,
                    rulesCount: rulesCount,
                    sampleRules: sampleRules
                };
            });
        });

        console.log('\n📚 로드된 스타일시트 상세:');
        stylesheetInfo.forEach((sheet, i) => {
            console.log(`\n  [${i + 1}] ${sheet.href || 'Inline'}`);
            console.log(`      - Disabled: ${sheet.disabled}`);
            console.log(`      - Rules: ${sheet.rulesCount}`);
            if (sheet.sampleRules.length > 0) {
                console.log(`      - 샘플 규칙:`);
                sheet.sampleRules.forEach(rule => {
                    console.log(`        ${rule}...`);
                });
            }
        });

        console.log('\n⏸️  브라우저가 열려있습니다. 개발자 도구에서 확인하세요.');
        console.log('종료하려면 Ctrl+C를 누르세요.');
        
        await new Promise(() => {});

    } catch (error) {
        console.error('❌ 오류 발생:', error);
    }
}

checkCSSLoading();