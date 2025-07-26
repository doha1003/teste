import fetch from 'node-fetch';
import { promises as fs } from 'fs';

async function quickSiteCheck() {
    console.log('🔍 doha.kr 빠른 사이트 검증...\n');
    
    const results = {
        timestamp: new Date().toISOString(),
        checks: []
    };
    
    // 1. 메인 페이지 체크
    console.log('1️⃣ 메인 페이지 체크');
    try {
        const mainResponse = await fetch('https://doha.kr/');
        const mainHtml = await mainResponse.text();
        
        // CSP 헤더 확인
        const cspMatch = mainHtml.match(/Content-Security-Policy.*?content="([^"]+)"/);
        const hasCDNJS = cspMatch && cspMatch[1].includes('cdnjs.cloudflare.com');
        console.log(`  - CSP cdnjs 허용: ${hasCDNJS ? '✅' : '❌'}`);
        
        // DOMPurify 스크립트 태그 확인
        const hasDOMPurifyScript = mainHtml.includes('cdnjs.cloudflare.com/ajax/libs/dompurify');
        console.log(`  - DOMPurify 스크립트: ${hasDOMPurifyScript ? '✅' : '❌'}`);
        
        results.checks.push({
            page: 'main',
            cspCDNJS: hasCDNJS,
            domPurifyScript: hasDOMPurifyScript
        });
    } catch (error) {
        console.log(`  ❌ 메인 페이지 로드 실패: ${error.message}`);
    }
    
    // 2. 만세력 API 체크
    console.log('\n2️⃣ 만세력 API 체크');
    try {
        const apiResponse = await fetch('https://doha-kr-ap.vercel.app/api/manseryeok?year=2024&month=1&day=15');
        const apiData = await apiResponse.json();
        
        console.log(`  - API 상태: ${apiResponse.ok ? '✅ 정상' : '❌ 오류'}`);
        console.log(`  - 응답 데이터: ${apiData.success ? '✅ 있음' : '❌ 없음'}`);
        
        if (apiData.data) {
            console.log(`  - 년간지: ${apiData.data.yearGanji}`);
            console.log(`  - 일간지: ${apiData.data.dayGanji}`);
        }
        
        results.checks.push({
            api: 'manseryeok',
            status: apiResponse.ok,
            hasData: !!apiData.success
        });
    } catch (error) {
        console.log(`  ❌ API 호출 실패: ${error.message}`);
    }
    
    // 3. 운세 페이지들 체크
    console.log('\n3️⃣ 운세 페이지 체크');
    const fortunePages = [
        { url: 'https://doha.kr/fortune/daily/', name: '일일운세' },
        { url: 'https://doha.kr/fortune/saju/', name: '사주팔자' },
        { url: 'https://doha.kr/fortune/tarot/', name: '타로' }
    ];
    
    for (const page of fortunePages) {
        console.log(`\n  📄 ${page.name}`);
        try {
            const response = await fetch(page.url);
            const html = await response.text();
            
            // 만세력 데이터베이스 로드 확인
            const hasOldDB = html.includes('manseryeok-database.js');
            const hasNewClient = html.includes('manseryeok-client.js');
            const hasSecurityConfig = html.includes('security-config.js');
            const hasFortuneCards = html.includes('fortune-result-cards.css');
            
            console.log(`    - 구 만세력 DB (38MB): ${hasOldDB ? '❌ 여전히 로드' : '✅ 제거됨'}`);
            console.log(`    - 신 만세력 Client: ${hasNewClient ? '✅ 있음' : '❌ 없음'}`);
            console.log(`    - 보안 설정: ${hasSecurityConfig ? '✅' : '❌'}`);
            console.log(`    - 카드 디자인: ${hasFortuneCards ? '✅' : '❌'}`);
            
            results.checks.push({
                page: page.name,
                oldDB: hasOldDB,
                newClient: hasNewClient,
                security: hasSecurityConfig,
                cardDesign: hasFortuneCards
            });
        } catch (error) {
            console.log(`    ❌ 페이지 로드 실패: ${error.message}`);
        }
    }
    
    // 4. 주요 리소스 로드 테스트
    console.log('\n4️⃣ 주요 리소스 체크');
    const resources = [
        { url: 'https://doha.kr/js/manseryeok-client.js', name: 'manseryeok-client.js' },
        { url: 'https://doha.kr/js/security-config.js', name: 'security-config.js' },
        { url: 'https://doha.kr/css/fortune-result-cards.css', name: 'fortune-result-cards.css' }
    ];
    
    for (const resource of resources) {
        try {
            const response = await fetch(resource.url);
            console.log(`  - ${resource.name}: ${response.ok ? '✅ 로드 가능' : '❌ 404'}`);
            
            results.checks.push({
                resource: resource.name,
                available: response.ok
            });
        } catch (error) {
            console.log(`  - ${resource.name}: ❌ 접근 불가`);
        }
    }
    
    // 결과 저장
    await fs.mkdir('verification-results', { recursive: true });
    const filename = `verification-results/quick-check-${Date.now()}.json`;
    await fs.writeFile(filename, JSON.stringify(results, null, 2));
    
    // 문제점 요약
    console.log('\n' + '='.repeat(60));
    console.log('🚨 발견된 문제점들:');
    console.log('='.repeat(60));
    
    let problemCount = 0;
    
    // CSP 문제 확인
    const mainCheck = results.checks.find(c => c.page === 'main');
    if (mainCheck && !mainCheck.cspCDNJS) {
        console.log(`${++problemCount}. CSP 헤더에 cdnjs.cloudflare.com이 허용되지 않음`);
    }
    
    // 구 DB 로드 확인
    const oldDBPages = results.checks.filter(c => c.oldDB === true);
    if (oldDBPages.length > 0) {
        console.log(`${++problemCount}. 다음 페이지들이 여전히 38MB 만세력 DB를 로드함:`);
        oldDBPages.forEach(p => console.log(`   - ${p.page}`));
    }
    
    // 리소스 404 확인
    const missing = results.checks.filter(c => c.resource && !c.available);
    if (missing.length > 0) {
        console.log(`${++problemCount}. 다음 리소스들이 404 오류:`);
        missing.forEach(r => console.log(`   - ${r.resource}`));
    }
    
    if (problemCount === 0) {
        console.log('✅ 모든 검증 통과!');
    } else {
        console.log(`\n총 ${problemCount}개의 문제 발견됨`);
    }
    
    return results;
}

// node-fetch 설치 확인
import('node-fetch').then(() => {
    quickSiteCheck().catch(console.error);
}).catch(() => {
    console.log('node-fetch를 먼저 설치해주세요: npm install node-fetch');
});