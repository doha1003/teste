import fetch from 'node-fetch';

async function checkCSPErrors() {
    console.log('🔍 CSP 에러 확인 중...\n');
    
    const response = await fetch('https://doha.kr/');
    const html = await response.text();
    
    // CSP 헤더 추출
    const cspMatch = html.match(/Content-Security-Policy.*?content="([^"]+)"/);
    if (cspMatch) {
        const csp = cspMatch[1];
        console.log('현재 CSP 정책:');
        console.log(csp.split(';').map(d => d.trim()).join(';\n'));
        
        console.log('\n문제 분석:');
        
        // unsafe-inline 체크
        if (!csp.includes("'unsafe-inline'")) {
            console.log('❌ 인라인 스크립트가 차단됨 (unsafe-inline 없음)');
            console.log('   → SHA-256 해시만으로는 모든 인라인 스크립트를 허용할 수 없음');
        }
        
        // connect-src 체크
        if (csp.includes('connect-src')) {
            const connectSrc = csp.match(/connect-src\s+([^;]+)/)?.[1];
            console.log(`\n✅ connect-src: ${connectSrc}`);
            
            if (!connectSrc.includes('doha-kr-ap.vercel.app')) {
                console.log('❌ Vercel API 도메인이 connect-src에 없음');
            }
        }
    }
    
    // 인라인 스크립트 개수 확인
    const inlineScripts = (html.match(/<script(?![^>]*src)[^>]*>[\s\S]*?<\/script>/g) || []).length;
    console.log(`\n📊 인라인 스크립트 개수: ${inlineScripts}개`);
    
    // safeHTML 사용 확인
    const safeHTMLCalls = (html.match(/safeHTML\(/g) || []).length;
    console.log(`📊 safeHTML 호출 횟수: ${safeHTMLCalls}회`);
}

checkCSPErrors().catch(console.error);