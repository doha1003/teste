const { chromium } = require('playwright');

async function checkDohaSite() {
    const browser = await chromium.launch({ 
        headless: false,
        devtools: true 
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // 콘솔 에러 수집
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push({
                text: msg.text(),
                location: msg.location()
            });
        }
    });
    
    // 네트워크 404 에러 수집
    const network404Errors = [];
    page.on('response', response => {
        if (response.status() === 404) {
            network404Errors.push({
                url: response.url(),
                status: response.status()
            });
        }
    });
    
    console.log('=== 1. 메인 페이지 검사 ===');
    
    try {
        // 메인 페이지 로드
        await page.goto('https://doha.kr', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // 스크린샷
        await page.screenshot({ 
            path: 'doha-main-desktop.png',
            fullPage: true 
        });
        console.log('✓ 데스크톱 스크린샷 저장: doha-main-desktop.png');
        
        // CSS 로드 확인
        const cssFiles = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
            return links.map(link => ({
                href: link.href,
                loaded: link.sheet !== null
            }));
        });
        
        console.log('\nCSS 파일 로드 상태:');
        cssFiles.forEach(css => {
            console.log(`${css.loaded ? '✓' : '✗'} ${css.href}`);
        });
        
        // 버튼 스타일 확인
        const buttonStyles = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('.category-item'));
            return buttons.map(btn => {
                const computed = window.getComputedStyle(btn);
                return {
                    text: btn.innerText,
                    backgroundColor: computed.backgroundColor,
                    color: computed.color,
                    display: computed.display,
                    width: computed.width,
                    height: computed.height
                };
            });
        });
        
        console.log('\n버튼 렌더링 상태:');
        buttonStyles.forEach(btn => {
            console.log(`- ${btn.text}: bg=${btn.backgroundColor}, color=${btn.color}, size=${btn.width}x${btn.height}`);
        });
        
        // 레이아웃 문제 확인
        const layoutIssues = await page.evaluate(() => {
            const issues = [];
            
            // 오버플로우 체크
            const elements = document.querySelectorAll('*');
            elements.forEach(el => {
                if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
                    issues.push({
                        type: 'overflow',
                        element: el.tagName + (el.className ? '.' + el.className : ''),
                        scrollWidth: el.scrollWidth,
                        clientWidth: el.clientWidth
                    });
                }
            });
            
            return issues;
        });
        
        if (layoutIssues.length > 0) {
            console.log('\n레이아웃 문제:');
            layoutIssues.forEach(issue => {
                console.log(`- ${issue.type}: ${issue.element} (${issue.scrollWidth} > ${issue.clientWidth})`);
            });
        }
        
        // 모바일 뷰 테스트
        console.log('\n=== 2. 모바일 뷰 검사 ===');
        await page.setViewportSize({ width: 375, height: 667 });
        await page.screenshot({ 
            path: 'doha-main-mobile.png',
            fullPage: true 
        });
        console.log('✓ 모바일 스크린샷 저장: doha-main-mobile.png');
        
        // 모바일 네비게이션 확인
        const mobileNavExists = await page.evaluate(() => {
            const hamburger = document.querySelector('.navbar-toggler, .mobile-menu-toggle, #mobile-menu-toggle');
            return hamburger !== null;
        });
        console.log(`모바일 메뉴 버튼: ${mobileNavExists ? '있음' : '없음'}`);
        
        // 다른 페이지들 검사
        const pagesToCheck = [
            { url: 'https://doha.kr/tests/mbti/', name: 'MBTI 테스트' },
            { url: 'https://doha.kr/tools/text-counter.html', name: '글자수 세기' },
            { url: 'https://doha.kr/fortune/daily/', name: '오늘의 운세' }
        ];
        
        for (const pageInfo of pagesToCheck) {
            console.log(`\n=== ${pageInfo.name} 검사 ===`);
            
            // 새 페이지에서 에러 초기화
            consoleErrors.length = 0;
            network404Errors.length = 0;
            
            await page.goto(pageInfo.url, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            await page.screenshot({ 
                path: `doha-${pageInfo.name.replace(/\s+/g, '-')}.png`,
                fullPage: true 
            });
            
            console.log(`✓ 스크린샷 저장: doha-${pageInfo.name.replace(/\s+/g, '-')}.png`);
            
            if (consoleErrors.length > 0) {
                console.log('콘솔 에러:');
                consoleErrors.forEach(err => {
                    console.log(`- ${err.text}`);
                });
            }
            
            if (network404Errors.length > 0) {
                console.log('404 에러:');
                network404Errors.forEach(err => {
                    console.log(`- ${err.url}`);
                });
            }
        }
        
    } catch (error) {
        console.error('검사 중 오류 발생:', error);
    }
    
    // 브라우저 열어둠 (수동 검사용)
    console.log('\n브라우저를 열어두었습니다. 수동 검사 후 닫아주세요.');
}

checkDohaSite();