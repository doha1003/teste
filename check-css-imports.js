const puppeteer = require('puppeteer');

async function checkCSSImports() {
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true
    });

    try {
        const page = await browser.newPage();
        
        // 네트워크 응답 추적
        const responses = new Map();
        page.on('response', response => {
            responses.set(response.url(), {
                status: response.status(),
                headers: response.headers()
            });
        });

        console.log('🌐 doha.kr 접속 중...');
        await page.goto('https://doha.kr', { waitUntil: 'networkidle2' });

        // styles.css 내용 확인
        const stylesContent = await page.evaluate(async () => {
            const response = await fetch('/css/styles.css');
            return await response.text();
        });

        console.log('\n📄 styles.css 내용 (첫 500자):');
        console.log(stylesContent.substring(0, 500));

        // 각 @import 파일 확인
        const imports = stylesContent.match(/@import\s+['"]([^'"]+)['"]/g);
        if (imports) {
            console.log('\n🔍 발견된 @import 구문:');
            for (const imp of imports) {
                const url = imp.match(/['"]([^'"]+)['"]/)[1];
                console.log(`  - ${url}`);
                
                // 각 import 파일 접근 가능 여부 확인
                const checkResponse = await page.evaluate(async (url) => {
                    try {
                        const response = await fetch(url);
                        return {
                            url: url,
                            status: response.status,
                            ok: response.ok,
                            contentLength: (await response.text()).length
                        };
                    } catch (e) {
                        return { url: url, error: e.message };
                    }
                }, url);
                
                if (checkResponse.error) {
                    console.log(`    ❌ 오류: ${checkResponse.error}`);
                } else {
                    console.log(`    ${checkResponse.ok ? '✅' : '❌'} 상태: ${checkResponse.status}, 크기: ${checkResponse.contentLength}자`);
                }
            }
        }

        // 실제 로드된 CSS 확인
        const loadedStyles = await page.evaluate(() => {
            const sheets = Array.from(document.styleSheets);
            return sheets.map(sheet => {
                try {
                    const rules = sheet.cssRules || sheet.rules;
                    return {
                        href: sheet.href,
                        rulesCount: rules ? rules.length : 0,
                        disabled: sheet.disabled
                    };
                } catch (e) {
                    return {
                        href: sheet.href,
                        error: 'CORS or access error'
                    };
                }
            });
        });

        console.log('\n📊 실제 로드된 스타일시트:');
        loadedStyles.forEach(sheet => {
            if (sheet.error) {
                console.log(`  ❌ ${sheet.href} - ${sheet.error}`);
            } else {
                console.log(`  ✅ ${sheet.href} - ${sheet.rulesCount}개 규칙`);
            }
        });

        // 주요 CSS 변수 확인
        const cssVariables = await page.evaluate(() => {
            const root = document.documentElement;
            const computedStyle = getComputedStyle(root);
            const variables = {};
            
            // 주요 CSS 변수 확인
            const checkVars = ['--primary', '--secondary', '--gray-50', '--container-max-width'];
            checkVars.forEach(varName => {
                variables[varName] = computedStyle.getPropertyValue(varName).trim();
            });
            
            return variables;
        });

        console.log('\n🎨 CSS 변수 상태:');
        Object.entries(cssVariables).forEach(([key, value]) => {
            console.log(`  ${key}: ${value || '❌ 정의되지 않음'}`);
        });

        // 특정 요소의 스타일 확인
        const elementStyles = await page.evaluate(() => {
            const navbar = document.querySelector('.navbar');
            const hero = document.querySelector('.hero-section') || document.querySelector('.hero-title');
            
            const getComputedStyles = (element, name) => {
                if (!element) return { name, exists: false };
                const styles = getComputedStyle(element);
                return {
                    name,
                    exists: true,
                    display: styles.display,
                    background: styles.backgroundColor,
                    color: styles.color,
                    padding: styles.padding,
                    margin: styles.margin
                };
            };

            return [
                getComputedStyles(navbar, 'Navbar'),
                getComputedStyles(hero, 'Hero')
            ];
        });

        console.log('\n🔍 주요 요소 스타일:');
        elementStyles.forEach(el => {
            if (!el.exists) {
                console.log(`  ❌ ${el.name} - 요소를 찾을 수 없음`);
            } else {
                console.log(`  ✅ ${el.name}:`);
                console.log(`     Display: ${el.display}`);
                console.log(`     Background: ${el.background}`);
                console.log(`     Color: ${el.color}`);
            }
        });

        console.log('\n⏸️  브라우저가 열려있습니다. 개발자 도구에서 확인하세요.');
        console.log('종료하려면 Ctrl+C를 누르세요.');
        
        // 브라우저 열어둠
        await new Promise(() => {});

    } catch (error) {
        console.error('❌ 오류 발생:', error);
    }
}

checkCSSImports();