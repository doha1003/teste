import playwright from 'playwright';
import { promises as fs } from 'fs';

async function checkBrowserConsole() {
    console.log('🌐 실제 브라우저 콘솔 에러 체크...\n');
    
    const browser = await playwright.chromium.launch({ 
        headless: true,
        channel: 'chrome'  // 시스템 Chrome 사용
    });
    
    const results = {
        timestamp: new Date().toISOString(),
        pages: {}
    };
    
    const pagesToCheck = [
        'https://doha.kr/',
        'https://doha.kr/fortune/daily/',
        'https://doha.kr/fortune/saju/',
        'https://doha.kr/fortune/tarot/'
    ];
    
    for (const url of pagesToCheck) {
        console.log(`\n📄 검사 중: ${url}`);
        const page = await browser.newPage();
        
        const pageErrors = [];
        const pageWarnings = [];
        const networkFailures = [];
        const cspViolations = [];
        
        // 콘솔 메시지 수집
        page.on('console', msg => {
            const text = msg.text();
            const type = msg.type();
            
            if (type === 'error') {
                pageErrors.push(text);
                console.log(`  ❌ 에러: ${text}`);
            } else if (type === 'warning') {
                pageWarnings.push(text);
                console.log(`  ⚠️  경고: ${text}`);
            }
        });
        
        // 네트워크 실패 감지
        page.on('requestfailed', request => {
            const failure = {
                url: request.url(),
                reason: request.failure()?.errorText || 'Unknown'
            };
            networkFailures.push(failure);
            console.log(`  🚫 네트워크 실패: ${failure.url}`);
        });
        
        // CSP 위반 감지
        await page.evaluateOnNewDocument(() => {
            window.addEventListener('securitypolicyviolation', (e) => {
                window.__cspViolations = window.__cspViolations || [];
                window.__cspViolations.push({
                    directive: e.violatedDirective,
                    source: e.sourceFile,
                    line: e.lineNumber,
                    column: e.columnNumber
                });
            });
        });
        
        try {
            // 페이지 로드
            await page.goto(url, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            // 2초 대기 (동적 스크립트 실행 대기)
            await page.waitForTimeout(2000);
            
            // CSP 위반 수집
            const violations = await page.evaluate(() => window.__cspViolations || []);
            cspViolations.push(...violations);
            
            if (violations.length > 0) {
                console.log(`  🔒 CSP 위반: ${violations.length}건`);
                violations.forEach(v => {
                    console.log(`     - ${v.directive} at ${v.source}:${v.line}`);
                });
            }
            
            // 중요 기능 확인
            const checks = await page.evaluate(() => {
                return {
                    domPurify: typeof window.DOMPurify !== 'undefined',
                    safeHTML: typeof window.safeHTML === 'function',
                    manseryeokDB: typeof window.ManseryeokDatabase !== 'undefined',
                    manseryeokClient: typeof window.manseryeokClient !== 'undefined',
                    kakao: typeof window.Kakao !== 'undefined'
                };
            });
            
            console.log(`\n  📊 기능 체크:`);
            console.log(`     DOMPurify: ${checks.domPurify ? '✅' : '❌'}`);
            console.log(`     safeHTML: ${checks.safeHTML ? '✅' : '❌'}`);
            console.log(`     구 만세력 DB: ${checks.manseryeokDB ? '❌ 여전히 로드됨' : '✅ 제거됨'}`);
            console.log(`     신 만세력 Client: ${checks.manseryeokClient ? '✅' : '❌'}`);
            console.log(`     Kakao SDK: ${checks.kakao ? '✅' : '❌'}`);
            
            results.pages[url] = {
                errors: pageErrors,
                warnings: pageWarnings,
                networkFailures,
                cspViolations,
                checks
            };
            
        } catch (error) {
            console.log(`  💥 페이지 로드 실패: ${error.message}`);
            results.pages[url] = {
                loadError: error.message
            };
        }
        
        await page.close();
    }
    
    await browser.close();
    
    // 결과 저장
    await fs.mkdir('browser-check-results', { recursive: true });
    await fs.writeFile(
        `browser-check-results/console-check-${Date.now()}.json`,
        JSON.stringify(results, null, 2)
    );
    
    // 요약
    console.log('\n' + '='.repeat(60));
    console.log('📊 전체 요약');
    console.log('='.repeat(60));
    
    let totalErrors = 0;
    let totalWarnings = 0;
    let totalCSPViolations = 0;
    
    for (const [url, data] of Object.entries(results.pages)) {
        if (data.errors) {
            totalErrors += data.errors.length;
            totalWarnings += data.warnings.length;
            totalCSPViolations += data.cspViolations.length;
        }
    }
    
    console.log(`총 에러: ${totalErrors}개`);
    console.log(`총 경고: ${totalWarnings}개`);
    console.log(`총 CSP 위반: ${totalCSPViolations}개`);
    
    if (totalErrors === 0 && totalCSPViolations === 0) {
        console.log('\n✅ 모든 페이지가 에러 없이 정상 작동합니다!');
    } else {
        console.log('\n❌ 아직 해결해야 할 문제가 있습니다.');
    }
}

// 실행
checkBrowserConsole().catch(console.error);