import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';

async function verifyRealSite() {
    console.log('🔍 doha.kr 실제 사이트 검증 시작...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const results = {
        timestamp: new Date().toISOString(),
        pages: [],
        summary: {
            totalErrors: 0,
            blockedResources: 0,
            apiCalls: 0,
            domPurifyWorking: false,
            manseryeokApiUsed: false
        }
    };
    
    const pagesToTest = [
        { url: 'https://doha.kr/', name: '메인 페이지' },
        { url: 'https://doha.kr/fortune/daily/', name: '일일운세' },
        { url: 'https://doha.kr/fortune/saju/', name: '사주팔자' },
        { url: 'https://doha.kr/fortune/tarot/', name: '타로' }
    ];
    
    for (const pageInfo of pagesToTest) {
        console.log(`\n📄 테스트 중: ${pageInfo.name} (${pageInfo.url})`);
        
        const page = await browser.newPage();
        const pageResults = {
            url: pageInfo.url,
            name: pageInfo.name,
            errors: [],
            warnings: [],
            blockedRequests: [],
            apiCalls: [],
            metrics: {}
        };
        
        // 콘솔 메시지 수집
        page.on('console', msg => {
            const text = msg.text();
            if (msg.type() === 'error') {
                pageResults.errors.push(text);
                results.summary.totalErrors++;
                console.log(`  ❌ 에러: ${text}`);
            } else if (msg.type() === 'warning') {
                pageResults.warnings.push(text);
                console.log(`  ⚠️  경고: ${text}`);
            }
        });
        
        // 차단된 요청 감지
        page.on('requestfailed', request => {
            const url = request.url();
            const reason = request.failure()?.errorText || 'Unknown';
            pageResults.blockedRequests.push({ url, reason });
            results.summary.blockedResources++;
            console.log(`  🚫 차단됨: ${url} - ${reason}`);
        });
        
        // API 호출 감지
        page.on('request', request => {
            const url = request.url();
            if (url.includes('api/manseryeok') || url.includes('api/fortune')) {
                pageResults.apiCalls.push(url);
                results.summary.apiCalls++;
                console.log(`  🌐 API 호출: ${url}`);
                if (url.includes('api/manseryeok')) {
                    results.summary.manseryeokApiUsed = true;
                }
            }
        });
        
        try {
            // 페이지 로드
            const startTime = Date.now();
            await page.goto(pageInfo.url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            const loadTime = Date.now() - startTime;
            
            pageResults.metrics.loadTime = loadTime;
            console.log(`  ⏱️  로드 시간: ${loadTime}ms`);
            
            // DOMPurify 확인
            const hasDOMPurify = await page.evaluate(() => {
                return typeof window.DOMPurify !== 'undefined';
            });
            
            const hasSafeHTML = await page.evaluate(() => {
                return typeof window.safeHTML === 'function';
            });
            
            pageResults.domPurify = { loaded: hasDOMPurify, safeHTML: hasSafeHTML };
            if (hasDOMPurify) results.summary.domPurifyWorking = true;
            
            console.log(`  🛡️  DOMPurify: ${hasDOMPurify ? '✅ 로드됨' : '❌ 없음'}`);
            console.log(`  🛡️  safeHTML: ${hasSafeHTML ? '✅ 있음' : '❌ 없음'}`);
            
            // 만세력 데이터베이스 로드 확인
            const manseryeokDBLoaded = await page.evaluate(() => {
                return typeof window.ManseryeokDatabase !== 'undefined';
            });
            
            const manseryeokClientLoaded = await page.evaluate(() => {
                return typeof window.manseryeokClient !== 'undefined';
            });
            
            pageResults.manseryeok = {
                databaseLoaded: manseryeokDBLoaded,
                clientLoaded: manseryeokClientLoaded
            };
            
            console.log(`  📊 만세력 DB: ${manseryeokDBLoaded ? '❌ 여전히 로드됨 (38MB)' : '✅ 로드 안 됨'}`);
            console.log(`  📊 만세력 Client: ${manseryeokClientLoaded ? '✅ API 클라이언트 있음' : '❌ 없음'}`);
            
            // 폼 테스트 (운세 페이지인 경우)
            if (pageInfo.url.includes('fortune')) {
                await page.waitForTimeout(2000); // 폼 초기화 대기
                
                const formExists = await page.$('form');
                if (formExists) {
                    console.log(`  📝 폼 발견, 테스트 시작...`);
                    
                    // 폼 채우기
                    await page.evaluate(() => {
                        const userName = document.getElementById('userName');
                        const birthYear = document.getElementById('birthYear');
                        const birthMonth = document.getElementById('birthMonth');
                        const birthDay = document.getElementById('birthDay');
                        
                        if (userName) userName.value = '테스트';
                        if (birthYear) birthYear.value = '1990';
                        if (birthMonth) birthMonth.value = '5';
                        if (birthDay) birthDay.value = '15';
                    });
                    
                    // 제출 버튼 찾기
                    const submitButton = await page.$('button[type="submit"]');
                    if (submitButton) {
                        // API 호출 대기
                        const apiPromise = page.waitForRequest(
                            req => req.url().includes('api/'),
                            { timeout: 5000 }
                        ).catch(() => null);
                        
                        await submitButton.click();
                        const apiRequest = await apiPromise;
                        
                        if (apiRequest) {
                            console.log(`  ✅ API 호출 확인: ${apiRequest.url()}`);
                        } else {
                            console.log(`  ❌ API 호출 없음`);
                        }
                    }
                }
            }
            
            // 스크린샷
            await page.screenshot({ 
                path: `screenshots/${pageInfo.name.replace(/\//g, '-')}-${Date.now()}.png`,
                fullPage: true 
            });
            
        } catch (error) {
            pageResults.errors.push(`페이지 로드 실패: ${error.message}`);
            console.log(`  💥 치명적 오류: ${error.message}`);
        }
        
        results.pages.push(pageResults);
        await page.close();
    }
    
    await browser.close();
    
    // 결과 저장
    await fs.mkdir('verification-results', { recursive: true });
    await fs.writeFile(
        `verification-results/real-site-check-${Date.now()}.json`,
        JSON.stringify(results, null, 2)
    );
    
    // 요약 출력
    console.log('\n' + '='.repeat(60));
    console.log('📊 검증 결과 요약');
    console.log('='.repeat(60));
    console.log(`총 에러 수: ${results.summary.totalErrors}`);
    console.log(`차단된 리소스: ${results.summary.blockedResources}`);
    console.log(`API 호출 수: ${results.summary.apiCalls}`);
    console.log(`DOMPurify 작동: ${results.summary.domPurifyWorking ? '✅' : '❌'}`);
    console.log(`만세력 API 사용: ${results.summary.manseryeokApiUsed ? '✅' : '❌'}`);
    
    return results;
}

// 실행
verifyRealSite().catch(console.error);