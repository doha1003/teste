const puppeteer = require('puppeteer');

async function checkOtherPages() {
    const browser = await puppeteer.launch({
        headless: false
    });

    try {
        const page = await browser.newPage();
        
        const pagesToCheck = [
            'https://doha.kr',
            'https://doha.kr/tests/mbti/',
            'https://doha.kr/tools/text-counter.html'
        ];

        for (const url of pagesToCheck) {
            console.log(`\n🌐 ${url} 확인 중...`);
            
            await page.goto(url, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // CSS 파일 확인
            const cssInfo = await page.evaluate(() => {
                const sheets = Array.from(document.styleSheets);
                return sheets.map(sheet => {
                    let rulesCount = 'blocked';
                    try {
                        if (sheet.cssRules) {
                            rulesCount = sheet.cssRules.length;
                        }
                    } catch (e) {
                        // CORS 에러 무시
                    }
                    return {
                        href: sheet.href,
                        disabled: sheet.disabled,
                        rulesCount: rulesCount
                    };
                });
            });
            
            console.log('  CSS 파일:');
            cssInfo.forEach(css => {
                console.log(`    - ${css.href || 'inline'} (${css.rulesCount} rules)`);
            });
            
            // 주요 요소 스타일 확인
            const elementStyles = await page.evaluate(() => {
                const checkElement = (selector) => {
                    const el = document.querySelector(selector);
                    if (!el) return null;
                    const styles = getComputedStyle(el);
                    return {
                        display: styles.display,
                        width: styles.width,
                        background: styles.backgroundColor,
                        font: styles.fontSize + ' ' + styles.fontFamily
                    };
                };
                
                return {
                    body: checkElement('body'),
                    navbar: checkElement('.navbar'),
                    container: checkElement('.container'),
                    firstButton: checkElement('button, .btn')
                };
            });
            
            console.log('  주요 요소 스타일:');
            Object.entries(elementStyles).forEach(([name, styles]) => {
                if (styles) {
                    console.log(`    ${name}: display=${styles.display}, width=${styles.width}`);
                }
            });
            
            // 스크린샷
            const filename = url.replace('https://doha.kr', '').replace(/\//g, '-') || 'main';
            await page.screenshot({
                path: `check-${filename}.png`,
                fullPage: false
            });
            console.log(`  스크린샷: check-${filename}.png`);
        }
        
        console.log('\n✅ 검사 완료. 스크린샷 파일들을 확인하세요.');

    } catch (error) {
        console.error('❌ 오류:', error);
    } finally {
        await browser.close();
    }
}

checkOtherPages();