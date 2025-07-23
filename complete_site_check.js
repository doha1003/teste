const { chromium } = require('playwright');
const fs = require('fs');

// 전체 26페이지 URL 목록
const allPages = [
    // 메인 페이지
    { name: '메인페이지', url: 'https://doha.kr/' },
    
    // 테스트 페이지들 (9개)
    { name: '테스트메인', url: 'https://doha.kr/tests/' },
    { name: 'MBTI소개', url: 'https://doha.kr/tests/mbti/' },
    { name: 'MBTI테스트', url: 'https://doha.kr/tests/mbti/test.html' },
    { name: '테토에겐소개', url: 'https://doha.kr/tests/teto-egen/' },
    { name: '테토에겐시작', url: 'https://doha.kr/tests/teto-egen/start.html' },
    { name: '테토에겐테스트', url: 'https://doha.kr/tests/teto-egen/test.html' },
    { name: '러브DNA소개', url: 'https://doha.kr/tests/love-dna/' },
    { name: '러브DNA테스트', url: 'https://doha.kr/tests/love-dna/test.html' },
    
    // 도구 페이지들 (4개)
    { name: '도구메인', url: 'https://doha.kr/tools/' },
    { name: '글자수세기', url: 'https://doha.kr/tools/text-counter.html' },
    { name: 'BMI계산기', url: 'https://doha.kr/tools/bmi-calculator.html' },
    { name: '연봉계산기', url: 'https://doha.kr/tools/salary-calculator.html' },
    
    // 운세 페이지들 (6개)
    { name: '운세메인', url: 'https://doha.kr/fortune/' },
    { name: '오늘의운세', url: 'https://doha.kr/fortune/daily/' },
    { name: 'AI사주팔자', url: 'https://doha.kr/fortune/saju/' },
    { name: 'AI타로', url: 'https://doha.kr/fortune/tarot/' },
    { name: '별자리운세', url: 'https://doha.kr/fortune/zodiac/' },
    { name: '띠별운세', url: 'https://doha.kr/fortune/zodiac-animal/' },
    
    // 기타 페이지들 (5개)
    { name: '소개페이지', url: 'https://doha.kr/about/' },
    { name: '문의페이지', url: 'https://doha.kr/contact/' },
    { name: 'FAQ페이지', url: 'https://doha.kr/faq/' },
    { name: '개인정보처리방침', url: 'https://doha.kr/privacy/' },
    { name: '이용약관', url: 'https://doha.kr/terms/' },
    
    // 특수 페이지들 (2개)
    { name: '오프라인페이지', url: 'https://doha.kr/offline.html' },
    { name: '404페이지', url: 'https://doha.kr/404.html' }
];

async function checkAllPages() {
    console.log('🚀 doha.kr 전체 26페이지 체크 시작...\n');
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const results = [];
    let successCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < allPages.length; i++) {
        const pageInfo = allPages[i];
        const page = await browser.newPage();
        
        try {
            console.log(`🔍 [${i+1}/26] ${pageInfo.name} 체크 중...`);
            
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
            const response = await page.goto(pageInfo.url, { 
                waitUntil: 'domcontentloaded', 
                timeout: 10000 
            });
            const loadTime = Date.now() - startTime;
            
            // 페이지 분석
            await page.waitForTimeout(1000); // 1초 대기
            
            const analysis = await page.evaluate(() => {
                const issues = [];
                const title = document.title;
                const bodyText = document.body.textContent || '';
                
                // 한글 깨짐 체크
                const hasBrokenKorean = /\?�/.test(bodyText);
                const hasKoreanText = /[가-힣]/.test(bodyText);
                
                if (hasBrokenKorean) {
                    issues.push('❌ 한글 깨짐 발견');
                }
                
                // 네비게이션 체크
                const navbar = document.querySelector('#navbar-placeholder');
                const hasNavigation = navbar && navbar.innerHTML.trim() !== '';
                if (!hasNavigation) {
                    issues.push('⚠️ 네비게이션 없음');
                }
                
                // 푸터 체크
                const footer = document.querySelector('#footer-placeholder');
                const hasFooter = footer && footer.innerHTML.trim() !== '';
                if (!hasFooter) {
                    issues.push('⚠️ 푸터 없음');
                }
                
                // CSS 로딩 체크
                const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
                const hasStyles = stylesheets.length > 0;
                if (!hasStyles) {
                    issues.push('⚠️ CSS 없음');
                }
                
                // 기본 콘텐츠 체크
                const mainContent = document.querySelector('main, .main-content, .container, .hero, section');
                if (!mainContent) {
                    issues.push('⚠️ 메인콘텐츠 없음');
                }
                
                return {
                    title,
                    hasKoreanText,
                    hasBrokenKorean,
                    hasNavigation,
                    hasFooter,
                    hasStyles,
                    issues
                };
            });
            
            // 결과 분류
            let status = '✅ 정상';
            let statusEmoji = '✅';
            
            const totalIssues = consoleErrors.length + networkErrors.length + analysis.issues.length;
            
            if (analysis.hasBrokenKorean || consoleErrors.length > 5 || networkErrors.length > 0) {
                status = '❌ 심각';
                statusEmoji = '❌';
                errorCount++;
            } else if (totalIssues > 0) {
                status = '⚠️ 주의';
                statusEmoji = '⚠️';
                warningCount++;
            } else {
                successCount++;
            }
            
            const result = {
                순번: i + 1,
                페이지명: pageInfo.name,
                URL: pageInfo.url,
                상태: status,
                제목: analysis.title,
                로딩시간: `${loadTime}ms`,
                콘솔에러: consoleErrors.length,
                네트워크에러: networkErrors.length,
                레이아웃이슈: analysis.issues.length,
                한글상태: analysis.hasKoreanText ? (analysis.hasBrokenKorean ? '❌ 깨짐' : '✅ 정상') : '⚪ 없음',
                세부이슈: [
                    ...analysis.issues,
                    ...consoleErrors.slice(0, 2).map(e => `콘솔: ${e.substring(0, 30)}...`),
                    ...networkErrors.slice(0, 2).map(e => `${e.status}: ${e.url.split('/').pop()}`)
                ]
            };
            
            results.push(result);
            console.log(`   ${statusEmoji} ${pageInfo.name} (${loadTime}ms) - 이슈 ${totalIssues}개`);
            
        } catch (error) {
            const result = {
                순번: i + 1,
                페이지명: pageInfo.name,
                URL: pageInfo.url,
                상태: '❌ 에러',
                에러: error.message,
                세부이슈: [error.message]
            };
            results.push(result);
            errorCount++;
            console.log(`   ❌ ${pageInfo.name} - 에러: ${error.message.substring(0, 50)}...`);
        }
        
        await page.close();
        await new Promise(resolve => setTimeout(resolve, 300)); // 0.3초 대기
    }
    
    await browser.close();
    
    // 결과 리포트 생성
    console.log('\n📊 전체 사이트 체크 결과');
    console.log('═'.repeat(80));
    console.log(`📄 총 페이지: ${allPages.length}개`);
    console.log(`✅ 정상: ${successCount}개`);
    console.log(`⚠️ 주의: ${warningCount}개`);
    console.log(`❌ 에러/심각: ${errorCount}개`);
    
    // 상세 결과
    console.log('\n📋 페이지별 상세 결과');
    console.log('─'.repeat(80));
    
    results.forEach(result => {
        console.log(`\n${result.순번}. ${result.페이지명} ${result.상태}`);
        if (result.제목) console.log(`   제목: ${result.제목}`);
        if (result.로딩시간) console.log(`   로딩: ${result.로딩시간}`);
        if (result.한글상태) console.log(`   한글: ${result.한글상태}`);
        if (result.세부이슈 && result.세부이슈.length > 0) {
            console.log(`   이슈:`);
            result.세부이슈.forEach(issue => console.log(`     - ${issue}`));
        }
    });
    
    // 공통 문제 분석
    const allIssues = results.flatMap(r => r.세부이슈 || []);
    const issueCount = {};
    allIssues.forEach(issue => {
        const key = issue.replace(/콘솔:.*/, '콘솔 에러').replace(/\d+:.*/, '네트워크 에러');
        issueCount[key] = (issueCount[key] || 0) + 1;
    });
    
    if (Object.keys(issueCount).length > 0) {
        console.log('\n🔍 공통 문제점');
        console.log('─'.repeat(40));
        Object.entries(issueCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .forEach(([issue, count]) => {
                console.log(`  ${count}회: ${issue}`);
            });
    }
    
    // JSON 파일로 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const filename = `site_check_report_${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify({
        summary: {
            총페이지: allPages.length,
            정상: successCount,
            주의: warningCount,
            에러: errorCount,
            체크시간: new Date().toISOString()
        },
        results: results,
        commonIssues: issueCount
    }, null, 2));
    
    console.log(`\n💾 상세 리포트 저장: ${filename}`);
    console.log('🎉 전체 사이트 체크 완료!');
    
    return results;
}

checkAllPages().catch(console.error);