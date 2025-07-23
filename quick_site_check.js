const { chromium } = require('playwright');

// 주요 페이지 URL 목록 (빠른 체크용)
const pages = [
    { name: '메인페이지', url: 'https://doha.kr/' },
    { name: 'MBTI테스트', url: 'https://doha.kr/tests/mbti/' },
    { name: '테토에겐', url: 'https://doha.kr/tests/teto-egen/' },
    { name: '글자수세기', url: 'https://doha.kr/tools/text-counter.html' },
    { name: 'AI사주', url: 'https://doha.kr/fortune/saju/' },
    { name: '소개페이지', url: 'https://doha.kr/about/' },
];

async function quickCheck() {
    console.log('🚀 doha.kr 빠른 사이트 체크 시작...\n');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const results = [];
    
    for (const pageInfo of pages) {
        try {
            console.log(`🔍 체크 중: ${pageInfo.name}`);
            
            const consoleErrors = [];
            const networkErrors = [];
            
            // 콘솔 에러 수집
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });
            
            // 네트워크 에러 수집
            page.on('response', response => {
                if (response.status() >= 400) {
                    networkErrors.push(`${response.status()} - ${response.url()}`);
                }
            });
            
            const startTime = Date.now();
            await page.goto(pageInfo.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            const loadTime = Date.now() - startTime;
            
            // 기본 체크
            const check = await page.evaluate(() => {
                const issues = [];
                const title = document.title;
                
                // 한글 깨짐 체크
                const text = document.body.textContent;
                const hasBrokenKorean = /\?�/.test(text);
                const hasKoreanText = /[가-힣]/.test(text);
                
                if (hasBrokenKorean) {
                    issues.push('한글 깨짐 발견');
                }
                
                // 네비게이션 체크
                const navbar = document.querySelector('#navbar-placeholder, .navbar');
                if (!navbar || navbar.innerHTML.trim() === '') {
                    issues.push('네비게이션 없음');
                }
                
                // 푸터 체크
                const footer = document.querySelector('#footer-placeholder, .footer');
                if (!footer || footer.innerHTML.trim() === '') {
                    issues.push('푸터 없음');
                }
                
                return {
                    title,
                    hasKoreanText,
                    hasBrokenKorean,
                    issues
                };
            });
            
            const result = {
                name: pageInfo.name,
                url: pageInfo.url,
                loadTime: `${loadTime}ms`,
                title: check.title,
                status: '✅ 정상',
                consoleErrors: consoleErrors.length,
                networkErrors: networkErrors.length,
                layoutIssues: check.issues.length,
                issues: [
                    ...consoleErrors.slice(0, 3).map(e => `콘솔: ${e.substring(0, 50)}...`),
                    ...networkErrors.slice(0, 3),
                    ...check.issues
                ]
            };
            
            if (consoleErrors.length > 0 || networkErrors.length > 0 || check.issues.length > 0) {
                result.status = '⚠️ 문제있음';
            }
            
            results.push(result);
            console.log(`   ${result.status} (${result.loadTime})`);
            
        } catch (error) {
            results.push({
                name: pageInfo.name,
                url: pageInfo.url,
                status: '❌ 에러',
                error: error.message
            });
            console.log(`   ❌ 에러: ${error.message}`);
        }
        
        await page.waitForTimeout(500); // 0.5초 대기
    }
    
    await browser.close();
    
    // 결과 출력
    console.log('\n📊 사이트 체크 결과');
    console.log('═'.repeat(60));
    
    results.forEach(result => {
        console.log(`\n📄 ${result.name}`);
        console.log(`   URL: ${result.url}`);
        console.log(`   상태: ${result.status}`);
        if (result.title) console.log(`   제목: ${result.title}`);
        if (result.loadTime) console.log(`   로딩: ${result.loadTime}`);
        if (result.consoleErrors) console.log(`   콘솔에러: ${result.consoleErrors}개`);
        if (result.networkErrors) console.log(`   네트워크에러: ${result.networkErrors}개`);
        if (result.layoutIssues) console.log(`   레이아웃이슈: ${result.layoutIssues}개`);
        if (result.issues && result.issues.length > 0) {
            console.log(`   세부사항:`);
            result.issues.forEach(issue => console.log(`     - ${issue}`));
        }
        if (result.error) console.log(`   에러: ${result.error}`);
    });
    
    // 요약
    const summary = {
        총페이지: results.length,
        정상: results.filter(r => r.status === '✅ 정상').length,
        문제있음: results.filter(r => r.status === '⚠️ 문제있음').length,
        에러: results.filter(r => r.status === '❌ 에러').length,
    };
    
    console.log('\n📈 요약');
    console.log('─'.repeat(30));
    console.log(`총 페이지: ${summary.총페이지}개`);
    console.log(`정상: ${summary.정상}개`);
    console.log(`문제있음: ${summary.문제있음}개`);
    console.log(`에러: ${summary.에러}개`);
    
    return results;
}

quickCheck().catch(console.error);