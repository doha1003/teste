const { chromium } = require('playwright');

// 수정한 페이지들만 다시 테스트
const fixedPages = [
    { name: 'MBTI테스트', url: 'https://doha.kr/tests/mbti/test.html' },
    { name: '테토에겐시작', url: 'https://doha.kr/tests/teto-egen/start.html' },
    { name: '테토에겐테스트', url: 'https://doha.kr/tests/teto-egen/test.html' },
    { name: '러브DNA테스트', url: 'https://doha.kr/tests/love-dna/test.html' },
    { name: '글자수세기', url: 'https://doha.kr/tools/text-counter.html' },
    { name: 'BMI계산기', url: 'https://doha.kr/tools/bmi-calculator.html' },
    { name: '연봉계산기', url: 'https://doha.kr/tools/salary-calculator.html' }
];

async function testFixes() {
    console.log('🧪 수정된 페이지들 검증 시작...\n');
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const results = [];
    
    for (let i = 0; i < fixedPages.length; i++) {
        const pageInfo = fixedPages[i];
        const page = await browser.newPage();
        
        try {
            console.log(`🔍 [${i+1}/${fixedPages.length}] ${pageInfo.name} 검증 중...`);
            
            const consoleErrors = [];
            const networkErrors = [];
            
            // 이벤트 리스너 설정
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });
            
            page.on('response', response => {
                if (response.status() >= 400) {
                    networkErrors.push({
                        status: response.status(),
                        url: response.url()
                    });
                }
            });
            
            const startTime = Date.now();
            await page.goto(pageInfo.url, { 
                waitUntil: 'domcontentloaded', 
                timeout: 10000 
            });
            const loadTime = Date.now() - startTime;
            
            // 페이지 분석
            await page.waitForTimeout(2000);
            
            const analysis = await page.evaluate(() => {
                const issues = [];
                
                // main 태그 체크
                const mainElement = document.querySelector('main');
                const hasMain = !!mainElement;
                if (!hasMain) {
                    issues.push('❌ main 태그 없음');
                }
                
                // 한글 깨짐 체크
                const bodyText = document.body.textContent || '';
                const hasBrokenKorean = /\?�/.test(bodyText);
                if (hasBrokenKorean) {
                    issues.push('❌ 한글 깨짐');
                }
                
                // JavaScript 파일 로딩 체크 (러브DNA 전용)
                if (window.location.pathname.includes('love-dna')) {
                    const scripts = Array.from(document.querySelectorAll('script[src]'));
                    const loveDnaScript = scripts.find(s => s.src.includes('love-dna-test.js'));
                    if (!loveDnaScript) {
                        issues.push('❌ love-dna-test.js 없음');
                    }
                }
                
                return {
                    hasMain,
                    hasBrokenKorean: hasBrokenKorean,
                    issues
                };
            });
            
            // 결과 평가
            let status = '✅ 해결됨';
            const totalIssues = consoleErrors.length + networkErrors.length + analysis.issues.length;
            
            if (analysis.hasBrokenKorean || networkErrors.length > 0) {
                status = '❌ 여전히 문제';
            } else if (totalIssues > 0) {
                status = '⚠️ 부분 해결';
            }
            
            const result = {
                페이지: pageInfo.name,
                상태: status,
                로딩시간: `${loadTime}ms`,
                main태그: analysis.hasMain ? '✅' : '❌',
                한글상태: analysis.hasBrokenKorean ? '❌ 깨짐' : '✅ 정상',
                콘솔에러: consoleErrors.length,
                네트워크에러: networkErrors.length,
                이슈: [
                    ...analysis.issues,
                    ...consoleErrors.slice(0, 2).map(e => `콘솔: ${e.substring(0, 40)}...`),
                    ...networkErrors.slice(0, 2).map(e => `${e.status}: ${e.url.split('/').pop()}`)
                ]
            };
            
            results.push(result);
            
            const statusEmoji = status.charAt(0);
            console.log(`   ${statusEmoji} ${pageInfo.name} (${loadTime}ms) - 이슈 ${totalIssues}개`);
            
        } catch (error) {
            results.push({
                페이지: pageInfo.name,
                상태: '❌ 에러',
                이슈: [error.message]
            });
            console.log(`   ❌ ${pageInfo.name} - 에러: ${error.message}`);
        }
        
        await page.close();
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    await browser.close();
    
    // 결과 요약
    console.log('\n📊 수정사항 검증 결과');
    console.log('═'.repeat(60));
    
    const resolved = results.filter(r => r.상태 === '✅ 해결됨').length;
    const partial = results.filter(r => r.상태 === '⚠️ 부분 해결').length;
    const failed = results.filter(r => r.상태.includes('❌')).length;
    
    console.log(`📄 검증 페이지: ${results.length}개`);
    console.log(`✅ 완전 해결: ${resolved}개`);
    console.log(`⚠️ 부분 해결: ${partial}개`);
    console.log(`❌ 여전히 문제: ${failed}개`);
    
    // 상세 결과
    console.log('\n📋 상세 결과');
    console.log('─'.repeat(60));
    
    results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.페이지} ${result.상태}`);
        if (result.main태그) console.log(`   Main태그: ${result.main태그}`);
        if (result.한글상태) console.log(`   한글: ${result.한글상태}`);
        if (result.로딩시간) console.log(`   로딩: ${result.로딩시간}`);
        if (result.이슈 && result.이슈.length > 0) {
            console.log(`   남은이슈:`);
            result.이슈.forEach(issue => console.log(`     - ${issue}`));
        }
    });
    
    console.log('\n🎉 수정사항 검증 완료!');
    
    return results;
}

testFixes().catch(console.error);