const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 모든 페이지 URL 목록
const pages = [
    // 메인 페이지
    { name: 'Homepage', url: 'https://doha.kr/' },
    
    // 테스트 페이지들
    { name: 'Tests Main', url: 'https://doha.kr/tests/' },
    { name: 'MBTI Test', url: 'https://doha.kr/tests/mbti/' },
    { name: 'MBTI Test Page', url: 'https://doha.kr/tests/mbti/test.html' },
    { name: 'Teto-Egen Test', url: 'https://doha.kr/tests/teto-egen/' },
    { name: 'Teto-Egen Start', url: 'https://doha.kr/tests/teto-egen/start.html' },
    { name: 'Teto-Egen Test Page', url: 'https://doha.kr/tests/teto-egen/test.html' },
    { name: 'Love DNA Test', url: 'https://doha.kr/tests/love-dna/' },
    { name: 'Love DNA Test Page', url: 'https://doha.kr/tests/love-dna/test.html' },
    
    // 도구 페이지들
    { name: 'Tools Main', url: 'https://doha.kr/tools/' },
    { name: 'Text Counter', url: 'https://doha.kr/tools/text-counter.html' },
    { name: 'BMI Calculator', url: 'https://doha.kr/tools/bmi-calculator.html' },
    { name: 'Salary Calculator', url: 'https://doha.kr/tools/salary-calculator.html' },
    
    // 운세 페이지들
    { name: 'Fortune Main', url: 'https://doha.kr/fortune/' },
    { name: 'Daily Fortune', url: 'https://doha.kr/fortune/daily/' },
    { name: 'Saju Fortune', url: 'https://doha.kr/fortune/saju/' },
    { name: 'Tarot Fortune', url: 'https://doha.kr/fortune/tarot/' },
    { name: 'Zodiac Fortune', url: 'https://doha.kr/fortune/zodiac/' },
    { name: 'Zodiac Animal Fortune', url: 'https://doha.kr/fortune/zodiac-animal/' },
    
    // 기타 페이지들
    { name: 'About', url: 'https://doha.kr/about/' },
    { name: 'Contact', url: 'https://doha.kr/contact/' },
    { name: 'FAQ', url: 'https://doha.kr/faq/' },
    { name: 'Privacy Policy', url: 'https://doha.kr/privacy/' },
    { name: 'Terms of Service', url: 'https://doha.kr/terms/' },
    
    // 오프라인 페이지
    { name: 'Offline Page', url: 'https://doha.kr/offline.html' },
    
    // 404 페이지
    { name: '404 Page', url: 'https://doha.kr/404.html' }
];

async function checkPage(browser, pageInfo) {
    const page = await browser.newPage();
    const results = {
        name: pageInfo.name,
        url: pageInfo.url,
        status: 'unknown',
        consoleErrors: [],
        networkErrors: [],
        layoutIssues: [],
        loadTime: 0,
        screenshot: null
    };
    
    try {
        console.log(`🔍 Checking: ${pageInfo.name} (${pageInfo.url})`);
        
        // 콘솔 에러 수집
        page.on('console', msg => {
            if (msg.type() === 'error') {
                results.consoleErrors.push({
                    type: 'console',
                    message: msg.text(),
                    location: msg.location()
                });
            }
        });
        
        // 네트워크 에러 수집
        page.on('response', response => {
            if (response.status() >= 400) {
                results.networkErrors.push({
                    url: response.url(),
                    status: response.status(),
                    statusText: response.statusText()
                });
            }
        });
        
        // 페이지 로드 시간 측정
        const startTime = Date.now();
        
        // 페이지 로드 (30초 타임아웃)
        const response = await page.goto(pageInfo.url, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        results.loadTime = Date.now() - startTime;
        results.status = response.status();
        
        // 페이지가 완전히 로드될 때까지 대기
        await page.waitForTimeout(3000);
        
        // 기본 레이아웃 체크
        const layoutChecks = await page.evaluate(() => {
            const issues = [];
            
            // 1. 네비게이션 바 체크
            const navbar = document.querySelector('#navbar-placeholder, .navbar, nav');
            if (!navbar || navbar.innerHTML.trim() === '') {
                issues.push('Navigation bar is missing or empty');
            }
            
            // 2. 푸터 체크
            const footer = document.querySelector('#footer-placeholder, .footer, footer');
            if (!footer || footer.innerHTML.trim() === '') {
                issues.push('Footer is missing or empty');
            }
            
            // 3. 메인 콘텐츠 체크
            const mainContent = document.querySelector('main, .main-content, .container, .hero');
            if (!mainContent) {
                issues.push('Main content area not found');
            }
            
            // 4. 한글 깨짐 체크
            const koreanTextElements = document.querySelectorAll('h1, h2, h3, p, span, div');
            let hasKoreanText = false;
            let hasBrokenKorean = false;
            
            koreanTextElements.forEach(el => {
                const text = el.textContent;
                if (text && /[가-힣]/.test(text)) {
                    hasKoreanText = true;
                }
                if (text && /\?�/.test(text)) {
                    hasBrokenKorean = true;
                }
            });
            
            if (hasBrokenKorean) {
                issues.push('Korean text encoding is broken (contains ?� characters)');
            }
            
            // 5. CSS 로딩 체크
            const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
            const loadedStylesheets = Array.from(stylesheets).filter(link => {
                try {
                    return link.sheet && link.sheet.cssRules;
                } catch (e) {
                    return false;
                }
            });
            
            if (stylesheets.length > 0 && loadedStylesheets.length === 0) {
                issues.push('No CSS stylesheets loaded successfully');
            }
            
            // 6. JavaScript 기본 기능 체크
            if (typeof loadComponents !== 'function' && document.querySelector('#navbar-placeholder')) {
                issues.push('Main JavaScript (loadComponents) not loaded');
            }
            
            return {
                issues,
                hasKoreanText,
                title: document.title,
                hasNavbar: !!navbar,
                hasFooter: !!footer,
                stylesheetCount: stylesheets.length,
                loadedStylesheetCount: loadedStylesheets.length
            };
        });
        
        results.layoutIssues = layoutChecks.issues;
        results.metadata = {
            hasKoreanText: layoutChecks.hasKoreanText,
            title: layoutChecks.title,
            hasNavbar: layoutChecks.hasNavbar,
            hasFooter: layoutChecks.hasFooter,
            stylesheetCount: layoutChecks.stylesheetCount,
            loadedStylesheetCount: layoutChecks.loadedStylesheetCount
        };
        
        // 스크린샷 촬영 (데스크톱과 모바일)
        const screenshotDir = './screenshots';
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        // 데스크톱 스크린샷
        await page.setViewportSize({ width: 1920, height: 1080 });
        const desktopScreenshot = `${screenshotDir}/${pageInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}_desktop.png`;
        await page.screenshot({ 
            path: desktopScreenshot, 
            fullPage: true 
        });
        
        // 모바일 스크린샷
        await page.setViewportSize({ width: 375, height: 667 });
        const mobileScreenshot = `${screenshotDir}/${pageInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}_mobile.png`;
        await page.screenshot({ 
            path: mobileScreenshot, 
            fullPage: true 
        });
        
        results.screenshots = {
            desktop: desktopScreenshot,
            mobile: mobileScreenshot
        };
        
        console.log(`✅ ${pageInfo.name}: ${results.status} (${results.loadTime}ms) - ${results.consoleErrors.length} errors, ${results.layoutIssues.length} layout issues`);
        
    } catch (error) {
        results.status = 'error';
        results.consoleErrors.push({
            type: 'system',
            message: error.message,
            stack: error.stack
        });
        console.log(`❌ ${pageInfo.name}: ERROR - ${error.message}`);
    } finally {
        await page.close();
    }
    
    return results;
}

async function generateReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = `doha_kr_site_check_${timestamp}.json`;
    
    // 전체 결과를 JSON으로 저장
    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
    
    // 요약 리포트 생성
    const summary = {
        totalPages: results.length,
        successfulPages: results.filter(r => r.status >= 200 && r.status < 400).length,
        pagesWithErrors: results.filter(r => r.consoleErrors.length > 0).length,
        pagesWithLayoutIssues: results.filter(r => r.layoutIssues.length > 0).length,
        averageLoadTime: Math.round(results.reduce((sum, r) => sum + r.loadTime, 0) / results.length),
        commonIssues: {}
    };
    
    // 공통 이슈 분석
    const allIssues = results.flatMap(r => [...r.consoleErrors.map(e => e.message), ...r.layoutIssues]);
    allIssues.forEach(issue => {
        summary.commonIssues[issue] = (summary.commonIssues[issue] || 0) + 1;
    });
    
    console.log('\n📊 SITE CHECK SUMMARY');
    console.log('═'.repeat(50));
    console.log(`📄 Total Pages Checked: ${summary.totalPages}`);
    console.log(`✅ Successful Pages: ${summary.successfulPages}`);
    console.log(`⚠️  Pages with Errors: ${summary.pagesWithErrors}`);
    console.log(`🔧 Pages with Layout Issues: ${summary.pagesWithLayoutIssues}`);
    console.log(`⏱️  Average Load Time: ${summary.averageLoadTime}ms`);
    
    if (Object.keys(summary.commonIssues).length > 0) {
        console.log('\n🔍 COMMON ISSUES:');
        Object.entries(summary.commonIssues)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .forEach(([issue, count]) => {
                console.log(`  ${count}x: ${issue}`);
            });
    }
    
    console.log(`\n📄 Detailed report saved: ${reportFile}`);
    
    return { summary, reportFile };
}

async function main() {
    console.log('🚀 Starting doha.kr site check with Playwright...\n');
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const results = [];
    
    // 모든 페이지를 순차적으로 체크 (병렬 처리하면 서버에 부하가 갈 수 있음)
    for (const pageInfo of pages) {
        const result = await checkPage(browser, pageInfo);
        results.push(result);
        
        // 각 페이지 사이에 1초 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await browser.close();
    
    // 리포트 생성
    await generateReport(results);
    
    console.log('\n🎉 Site check completed!');
}

// 스크립트 실행
main().catch(console.error);