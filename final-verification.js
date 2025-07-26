import fetch from 'node-fetch';
import { promises as fs } from 'fs';

async function finalVerification() {
    console.log('🎯 doha.kr 최종 검증 시작...\n');
    
    const results = {
        timestamp: new Date().toISOString(),
        summary: {
            totalPages: 0,
            successPages: 0,
            issues: []
        },
        details: {}
    };
    
    // 1. 핵심 페이지 로드 테스트
    console.log('1️⃣ 핵심 페이지 로드 테스트');
    const pages = [
        { url: 'https://doha.kr/', name: '메인' },
        { url: 'https://doha.kr/fortune/daily/', name: '일일운세' },
        { url: 'https://doha.kr/fortune/saju/', name: '사주팔자' },
        { url: 'https://doha.kr/fortune/tarot/', name: '타로' },
        { url: 'https://doha.kr/tests/mbti/', name: 'MBTI' },
        { url: 'https://doha.kr/tools/bmi-calculator.html', name: 'BMI계산기' }
    ];
    
    for (const page of pages) {
        results.summary.totalPages++;
        console.log(`\n  📄 ${page.name}: ${page.url}`);
        
        try {
            const response = await fetch(page.url);
            const html = await response.text();
            
            if (!response.ok) {
                console.log(`    ❌ HTTP ${response.status}`);
                results.issues.push(`${page.name}: HTTP ${response.status}`);
                continue;
            }
            
            // 필수 요소 체크
            const checks = {
                csp: html.includes('Content-Security-Policy') && html.includes('cdnjs.cloudflare.com'),
                domPurify: html.includes('dompurify/3.0.6/purify.min.js'),
                securityConfig: html.includes('security-config.js'),
                fortuneCards: page.url.includes('fortune') ? html.includes('fortune-result-cards.css') : true,
                manseryeokOldDB: !html.includes('manseryeok-database.js'),
                manseryeokClient: page.url.includes('fortune') ? html.includes('manseryeok-client.js') : true
            };
            
            const allPassed = Object.values(checks).every(v => v === true);
            
            console.log(`    CSP + cdnjs: ${checks.csp ? '✅' : '❌'}`);
            console.log(`    DOMPurify: ${checks.domPurify ? '✅' : '❌'}`);
            console.log(`    보안 설정: ${checks.securityConfig ? '✅' : '❌'}`);
            
            if (page.url.includes('fortune')) {
                console.log(`    카드 디자인: ${checks.fortuneCards ? '✅' : '❌'}`);
                console.log(`    구 DB 제거: ${checks.manseryeokOldDB ? '✅' : '❌'}`);
                console.log(`    API 클라이언트: ${checks.manseryeokClient ? '✅' : '❌'}`);
            }
            
            if (allPassed) {
                console.log(`    ✅ 모든 체크 통과`);
                results.summary.successPages++;
            } else {
                const failed = Object.entries(checks).filter(([k, v]) => !v).map(([k]) => k);
                if (results.summary && results.summary.issues) {
                    results.summary.issues.push(`${page.name}: ${failed.join(', ')} 실패`);
                }
            }
            
            results.details[page.name] = checks;
            
        } catch (error) {
            console.log(`    ❌ 오류: ${error.message}`);
            results.summary.issues.push(`${page.name}: ${error.message}`);
        }
    }
    
    // 2. API 엔드포인트 테스트
    console.log('\n\n2️⃣ API 엔드포인트 테스트');
    
    // GitHub Pages는 정적 호스팅이므로 API는 Vercel에서만 작동
    console.log('  ℹ️  GitHub Pages는 정적 호스팅이므로 API는 Vercel 도메인에서만 작동합니다.');
    console.log('  ℹ️  Vercel 프로젝트가 별도로 설정되어 있어야 합니다.');
    
    // 3. 리소스 로드 테스트
    console.log('\n3️⃣ 주요 리소스 로드 테스트');
    const resources = [
        { url: 'https://doha.kr/js/manseryeok-client.js', name: 'manseryeok-client.js' },
        { url: 'https://doha.kr/js/security-config.js', name: 'security-config.js' },
        { url: 'https://doha.kr/css/fortune-result-cards.css', name: 'fortune-result-cards.css' },
        { url: 'https://doha.kr/data/manseryeok-compact.json', name: 'manseryeok-compact.json' }
    ];
    
    for (const resource of resources) {
        try {
            const response = await fetch(resource.url, { method: 'HEAD' });
            console.log(`  ${resource.name}: ${response.ok ? '✅ 200 OK' : `❌ ${response.status}`}`);
            
            if (!response.ok) {
                results.summary.issues.push(`리소스 404: ${resource.name}`);
            }
        } catch (error) {
            console.log(`  ${resource.name}: ❌ ${error.message}`);
            results.summary.issues.push(`리소스 오류: ${resource.name}`);
        }
    }
    
    // 4. 최종 결과
    console.log('\n' + '='.repeat(60));
    console.log('🏁 최종 검증 결과');
    console.log('='.repeat(60));
    console.log(`검사한 페이지: ${results.summary.totalPages}개`);
    console.log(`성공한 페이지: ${results.summary.successPages}개`);
    console.log(`발견된 문제: ${results.summary.issues.length}개`);
    
    if (results.summary.issues.length > 0) {
        console.log('\n🚨 남은 문제들:');
        results.summary.issues.forEach((issue, i) => {
            console.log(`${i + 1}. ${issue}`);
        });
    } else {
        console.log('\n✅ 모든 검증을 통과했습니다! 100% 완료!');
    }
    
    // 결과 저장
    await fs.mkdir('final-verification', { recursive: true });
    await fs.writeFile(
        `final-verification/result-${Date.now()}.json`,
        JSON.stringify(results, null, 2)
    );
    
    return results;
}

// 실행
finalVerification().catch(console.error);