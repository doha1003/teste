const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// doha.kr 사이트의 모든 주요 페이지 목록
const pages = [
    { name: 'Home', url: 'https://doha.kr/' },
    { name: 'Tests Index', url: 'https://doha.kr/tests/' },
    { name: 'MBTI Test', url: 'https://doha.kr/tests/mbti/' },
    { name: 'MBTI Test Page', url: 'https://doha.kr/tests/mbti/test.html' },
    { name: 'Teto-Egen Test', url: 'https://doha.kr/tests/teto-egen/' },
    { name: 'Teto-Egen Start', url: 'https://doha.kr/tests/teto-egen/start.html' },
    { name: 'Love DNA Test', url: 'https://doha.kr/tests/love-dna/' },
    { name: 'Tools Index', url: 'https://doha.kr/tools/' },
    { name: 'Text Counter', url: 'https://doha.kr/tools/text-counter.html' },
    { name: 'BMI Calculator', url: 'https://doha.kr/tools/bmi-calculator.html' },
    { name: 'Salary Calculator', url: 'https://doha.kr/tools/salary-calculator.html' },
    { name: 'Fortune Index', url: 'https://doha.kr/fortune/' },
    { name: 'Daily Fortune', url: 'https://doha.kr/fortune/daily/' },
    { name: 'Saju', url: 'https://doha.kr/fortune/saju/' },
    { name: 'Tarot', url: 'https://doha.kr/fortune/tarot/' },
    { name: 'Zodiac', url: 'https://doha.kr/fortune/zodiac/' },
    { name: 'Zodiac Animal', url: 'https://doha.kr/fortune/zodiac-animal/' },
    { name: 'About', url: 'https://doha.kr/about/' },
    { name: 'Contact', url: 'https://doha.kr/contact/' },
    { name: 'FAQ', url: 'https://doha.kr/faq/' },
    { name: 'Privacy', url: 'https://doha.kr/privacy/' },
    { name: 'Terms', url: 'https://doha.kr/terms/' },
    { name: '404', url: 'https://doha.kr/404.html' },
    // Test result pages
    { name: 'MBTI Result Detail', url: 'https://doha.kr/tests/mbti/result-detail.html' },
    { name: 'Teto-Egen Result Detail', url: 'https://doha.kr/tests/teto-egen/result-detail.html' },
    { name: 'Love DNA Result Detail', url: 'https://doha.kr/tests/love-dna/result-detail.html' }
];

async function checkPage(page, pageInfo) {
    const results = {
        name: pageInfo.name,
        url: pageInfo.url,
        status: 'unknown',
        errors: [],
        warnings: [],
        navbarPresent: false,
        footerPresent: false,
        consoleErrors: [],
        networkErrors: [],
        loadTime: 0
    };

    const startTime = Date.now();

    try {
        // 콘솔 오류 수집
        page.on('console', msg => {
            if (msg.type() === 'error') {
                results.consoleErrors.push({
                    text: msg.text(),
                    location: msg.location()
                });
            }
        });

        // 네트워크 오류 수집
        page.on('requestfailed', request => {
            results.networkErrors.push({
                url: request.url(),
                error: request.failure().errorText
            });
        });

        // 페이지 로드
        const response = await page.goto(pageInfo.url, { 
            waitUntil: 'domcontentloaded',  // networkidle 대신 domcontentloaded 사용
            timeout: 15000  // 타임아웃 단축
        });

        results.loadTime = Date.now() - startTime;

        if (response && response.ok()) {
            results.status = 'loaded';
        } else {
            results.status = 'failed';
            results.errors.push(`HTTP ${response ? response.status() : 'unknown'}`);
        }

        // JavaScript 실행 완료 대기
        await page.waitForTimeout(2000);

        // 네비게이션 바 확인
        const navbar = await page.$('nav.navbar, .navbar, #navbar-placeholder');
        if (navbar) {
            const navbarContent = await navbar.textContent();
            results.navbarPresent = navbarContent && navbarContent.trim().length > 0;
            if (!results.navbarPresent) {
                results.warnings.push('Navbar element exists but appears empty');
            }
        } else {
            results.warnings.push('No navbar element found');
        }

        // 푸터 확인
        const footer = await page.$('footer.footer, .footer, #footer-placeholder');
        if (footer) {
            const footerContent = await footer.textContent();
            results.footerPresent = footerContent && footerContent.trim().length > 0;
            if (!results.footerPresent) {
                results.warnings.push('Footer element exists but appears empty');
            }
        } else {
            results.warnings.push('No footer element found');
        }

        // loadComponentById 함수 확인
        const loadComponentByIdExists = await page.evaluate(() => {
            return typeof window.loadComponentById === 'function';
        });

        if (!loadComponentByIdExists) {
            results.warnings.push('loadComponentById function not found in global scope');
        }

        // 컴포넌트 로딩 시도 확인 (콘솔에서 확인)
        const componentLoadingAttempts = results.consoleErrors.filter(error => 
            error.text.includes('Failed to load component') || 
            error.text.includes('loadComponentById')
        );

        if (componentLoadingAttempts.length > 0) {
            results.errors.push(`Component loading errors: ${componentLoadingAttempts.length}`);
        }

        // JavaScript 오류 분석
        const criticalErrors = results.consoleErrors.filter(error => 
            error.text.includes('TypeError') ||
            error.text.includes('ReferenceError') ||
            error.text.includes('SyntaxError')
        );

        if (criticalErrors.length > 0) {
            results.errors.push(`Critical JS errors: ${criticalErrors.length}`);
        }

    } catch (error) {
        results.status = 'error';
        results.errors.push(error.message);
    }

    return results;
}

async function runFullSiteCheck() {
    // console.log removed('🔍 Starting full site check with Playwright...');
    // console.log removed(`📄 Checking ${pages.length} pages for JavaScript errors and component loading`);

    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    const results = [];

    for (let i = 0; i < pages.length; i++) {
        const pageInfo = pages[i];
        // console.log removed(`🔄 Checking ${i + 1}/${pages.length}: ${pageInfo.name}`);
        
        const result = await checkPage(page, pageInfo);
        results.push(result);
        
        // 결과 요약 출력
        const statusEmoji = result.status === 'loaded' ? '✅' : 
                           result.status === 'failed' ? '❌' : '⚠️';
        const navFooter = `Nav:${result.navbarPresent ? '✅' : '❌'} Footer:${result.footerPresent ? '✅' : '❌'}`;
        const errorCount = `Errors:${result.errors.length} Console:${result.consoleErrors.length}`;
        
        // console.log removed(`   ${statusEmoji} ${navFooter} ${errorCount} (${result.loadTime}ms)`);
        
        // 중요한 오류가 있으면 즉시 출력
        if (result.errors.length > 0) {
            result.errors.forEach(error => // console.log removed(`     🚨 ${error}`));
        }
        
        // 페이지 간 간격
        await page.waitForTimeout(1000);
    }

    await browser.close();

    // 상세 결과 분석 및 저장
    const summary = {
        totalPages: pages.length,
        successful: results.filter(r => r.status === 'loaded').length,
        failed: results.filter(r => r.status !== 'loaded').length,
        navbarIssues: results.filter(r => !r.navbarPresent).length,
        footerIssues: results.filter(r => !r.footerPresent).length,
        pagesWithErrors: results.filter(r => r.errors.length > 0).length,
        pagesWithConsoleErrors: results.filter(r => r.consoleErrors.length > 0).length,
        totalConsoleErrors: results.reduce((sum, r) => sum + r.consoleErrors.length, 0),
        totalNetworkErrors: results.reduce((sum, r) => sum + r.networkErrors.length, 0)
    };

    // 결과 리포트 생성
    const reportPath = path.join(__dirname, `site-check-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify({ summary, results }, null, 2));

    // 콘솔 요약 출력
    // console.log removed('\n📊 FULL SITE CHECK SUMMARY');
    // console.log removed('═'.repeat(50));
    // console.log removed(`📄 Total Pages Checked: ${summary.totalPages}`);
    // console.log removed(`✅ Successfully Loaded: ${summary.successful}`);
    // console.log removed(`❌ Failed to Load: ${summary.failed}`);
    // console.log removed(`🚫 Navbar Issues: ${summary.navbarIssues}`);
    // console.log removed(`🚫 Footer Issues: ${summary.footerIssues}`);
    // console.log removed(`🐛 Pages with Errors: ${summary.pagesWithErrors}`);
    // console.log removed(`💥 Pages with Console Errors: ${summary.pagesWithConsoleErrors}`);
    // console.log removed(`📋 Total Console Errors: ${summary.totalConsoleErrors}`);
    // console.log removed(`🌐 Total Network Errors: ${summary.totalNetworkErrors}`);

    // 가장 문제가 많은 페이지들
    const problematicPages = results
        .filter(r => r.errors.length > 0 || r.consoleErrors.length > 0)
        .sort((a, b) => (b.errors.length + b.consoleErrors.length) - (a.errors.length + a.consoleErrors.length))
        .slice(0, 5);

    if (problematicPages.length > 0) {
        // console.log removed('\n🔴 TOP 5 PROBLEMATIC PAGES:');
        problematicPages.forEach((page, index) => {
            // console.log removed(`${index + 1}. ${page.name} (${page.url})`);
            // console.log removed(`   Errors: ${page.errors.length}, Console Errors: ${page.consoleErrors.length}`);
            if (page.errors.length > 0) {
                page.errors.forEach(error => // console.log removed(`   🚨 ${error}`));
            }
        });
    }

    // 네비게이션/푸터 문제 상세
    const navFooterIssues = results.filter(r => !r.navbarPresent || !r.footerPresent);
    if (navFooterIssues.length > 0) {
        // console.log removed('\n🚫 NAVIGATION/FOOTER ISSUES:');
        navFooterIssues.forEach(page => {
            const issues = [];
            if (!page.navbarPresent) issues.push('Missing Navbar');
            if (!page.footerPresent) issues.push('Missing Footer');
            // console.log removed(`- ${page.name}: ${issues.join(', ')}`);
        });
    }

    // console.log removed(`\n📁 Detailed report saved: ${reportPath}`);
    
    return { summary, results };
}

// 실행
if (require.main === module) {
    runFullSiteCheck().catch(err => {
        // Error handling
    });
}

module.exports = { runFullSiteCheck };