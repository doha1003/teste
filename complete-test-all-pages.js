import { chromium } from 'playwright';
import fs from 'fs';

// 모든 페이지 목록
const ALL_PAGES = [
    { path: '/', name: '홈페이지' },
    { path: '/404.html', name: '404 페이지' },
    { path: '/fortune/', name: '운세 메인' },
    { path: '/fortune/daily/', name: '일일 운세' },
    { path: '/fortune/saju/', name: '사주 운세' },
    { path: '/fortune/tarot/', name: '타로 운세' },
    { path: '/fortune/zodiac/', name: '별자리 운세' },
    { path: '/fortune/zodiac-animal/', name: '띠 운세' },
    { path: '/tests/', name: '테스트 메인' },
    { path: '/tests/mbti/', name: 'MBTI 테스트' },
    { path: '/tests/mbti/test.html', name: 'MBTI 테스트 진행' },
    { path: '/tests/love-dna/', name: '러브 DNA 테스트' },
    { path: '/tests/love-dna/test.html', name: '러브 DNA 테스트 진행' },
    { path: '/tests/teto-egen/', name: '테토이젠 테스트' },
    { path: '/tests/teto-egen/start.html', name: '테토이젠 시작' },
    { path: '/tests/teto-egen/test.html', name: '테토이젠 테스트 진행' },
    { path: '/tools/', name: '도구 메인' },
    { path: '/tools/bmi-calculator.html', name: 'BMI 계산기' },
    { path: '/tools/text-counter.html', name: '글자수 세기' },
    { path: '/tools/salary-calculator.html', name: '연봉 계산기' },
    { path: '/about/', name: '소개' },
    { path: '/contact/', name: '문의' },
    { path: '/faq/', name: 'FAQ' },
    { path: '/privacy/', name: '개인정보처리방침' },
    { path: '/terms/', name: '이용약관' },
    { path: '/offline.html', name: '오프라인 페이지' }
];

async function completeTestAllPages() {
    console.log('🔍 전체 페이지 완전 테스트 시작...\n');
    console.log(`총 ${ALL_PAGES.length}개 페이지 테스트\n`);
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--disable-blink-features=AutomationControlled']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 }
    });
    
    const page = await context.newPage();
    
    const results = {
        timestamp: new Date().toISOString(),
        totalPages: ALL_PAGES.length,
        summary: {
            passed: 0,
            failed: 0,
            warnings: 0
        },
        pages: []
    };
    
    // 각 페이지 테스트
    for (let i = 0; i < ALL_PAGES.length; i++) {
        const pageInfo = ALL_PAGES[i];
        console.log(`\n[${i + 1}/${ALL_PAGES.length}] ${pageInfo.name} 테스트 중...`);
        
        const pageResult = {
            name: pageInfo.name,
            path: pageInfo.path,
            url: `https://doha.kr${pageInfo.path}`,
            passed: true,
            issues: [],
            warnings: [],
            csp: {},
            features: {}
        };
        
        try {
            // 페이지 로드
            const response = await page.goto(pageResult.url, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            // HTTP 상태 확인
            pageResult.httpStatus = response.status();
            if (response.status() !== 200) {
                pageResult.issues.push(`HTTP ${response.status()} 에러`);
                pageResult.passed = false;
            }
            
            // CSP 헤더 확인
            const cspHeader = await page.$eval('meta[http-equiv="Content-Security-Policy"]', 
                el => el.getAttribute('content')
            ).catch(() => null);
            
            if (cspHeader) {
                pageResult.csp.exists = true;
                pageResult.csp.hasUnsafeInline = cspHeader.includes('unsafe-inline');
                pageResult.csp.visible = await page.isVisible('meta[http-equiv="Content-Security-Policy"]');
                
                if (pageResult.csp.visible) {
                    pageResult.issues.push('CSP 메타 태그가 화면에 노출됨');
                    pageResult.passed = false;
                }
            }
            
            // 기본 요소 확인
            await page.waitForTimeout(3000);
            
            pageResult.features.navigation = await page.$('nav') !== null;
            pageResult.features.footer = await page.$('footer') !== null;
            pageResult.features.content = await page.evaluate(() => 
                document.body.textContent.trim().length > 100
            );
            
            if (!pageResult.features.navigation) {
                pageResult.issues.push('네비게이션 없음');
                pageResult.passed = false;
            }
            
            if (!pageResult.features.footer) {
                pageResult.issues.push('푸터 없음');
                pageResult.passed = false;
            }
            
            // CSS 로드 확인
            pageResult.features.cssLoaded = await page.evaluate(() => {
                const styles = window.getComputedStyle(document.body);
                return styles.fontFamily && !styles.fontFamily.includes('Times New Roman');
            });
            
            if (!pageResult.features.cssLoaded) {
                pageResult.warnings.push('CSS가 제대로 로드되지 않음');
            }
            
            // fortune-result-cards.css 확인 (해당되는 페이지만)
            if (pageInfo.path.includes('fortune') || pageInfo.path.includes('test') || pageInfo.path.includes('tool')) {
                const hasCardCSS = await page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
                    return links.some(link => link.href.includes('fortune-result-cards.css'));
                });
                
                pageResult.features.hasCardCSS = hasCardCSS;
                if (!hasCardCSS) {
                    pageResult.warnings.push('fortune-result-cards.css가 포함되지 않음');
                }
            }
            
            // 콘솔 에러 수집
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });
            
            // 페이지별 특수 테스트
            if (pageInfo.path === '/fortune/daily/') {
                // 일일 운세 폼 테스트
                const yearDropdown = await page.$('#birthYear');
                if (yearDropdown) {
                    await page.waitForTimeout(2000);
                    const yearOptions = await page.$$eval('#birthYear option', opts => opts.length);
                    pageResult.features.yearDropdownOptions = yearOptions;
                    if (yearOptions <= 1) {
                        pageResult.issues.push('년도 드롭다운이 채워지지 않음');
                        pageResult.passed = false;
                    }
                }
            }
            
            if (pageInfo.path === '/fortune/saju/') {
                // 사주 운세 결과 테스트
                try {
                    await page.fill('#userName', '테스트');
                    await page.selectOption('#gender', 'male');
                    await page.fill('#birthYear', '1990');
                    await page.fill('#birthMonth', '5');
                    await page.fill('#birthDay', '15');
                    await page.selectOption('#birthTime', '11');
                    await page.click('button[type="submit"]');
                    await page.waitForTimeout(5000);
                    
                    const resultVisible = await page.isVisible('#sajuResult');
                    const hasCardDesign = await page.$('.fortune-result-card') !== null;
                    
                    pageResult.features.resultShown = resultVisible;
                    pageResult.features.cardDesignApplied = hasCardDesign;
                    
                    if (!resultVisible) {
                        pageResult.issues.push('사주 결과가 표시되지 않음');
                        pageResult.passed = false;
                    }
                    if (!hasCardDesign) {
                        pageResult.warnings.push('결과 카드 디자인이 적용되지 않음');
                    }
                } catch (e) {
                    pageResult.warnings.push(`사주 테스트 실패: ${e.message}`);
                }
            }
            
            if (pageInfo.path === '/tools/bmi-calculator.html') {
                // BMI 계산기 테스트
                try {
                    await page.fill('#height', '170');
                    await page.fill('#weight', '70');
                    const calcBtn = await page.$('button:has-text("계산")');
                    if (calcBtn) {
                        await calcBtn.click();
                        await page.waitForTimeout(2000);
                        
                        const resultVisible = await page.isVisible('#bmiResult, .bmi-result');
                        const hasCardDesign = await page.$('.fortune-result-card, .result-card') !== null;
                        
                        pageResult.features.resultShown = resultVisible;
                        pageResult.features.cardDesignApplied = hasCardDesign;
                        
                        if (!resultVisible) {
                            pageResult.issues.push('BMI 결과가 표시되지 않음');
                            pageResult.passed = false;
                        }
                    }
                } catch (e) {
                    pageResult.warnings.push(`BMI 테스트 실패: ${e.message}`);
                }
            }
            
            // 네트워크 에러 확인
            const failedRequests = [];
            page.on('requestfailed', request => {
                failedRequests.push({
                    url: request.url(),
                    error: request.failure().errorText
                });
            });
            
            await page.waitForTimeout(1000);
            
            if (failedRequests.length > 0) {
                pageResult.networkErrors = failedRequests;
                pageResult.warnings.push(`${failedRequests.length}개의 네트워크 오류`);
            }
            
            if (consoleErrors.length > 0) {
                pageResult.consoleErrors = consoleErrors.slice(0, 5);
                pageResult.warnings.push(`${consoleErrors.length}개의 콘솔 에러`);
            }
            
            // 스크린샷 (실패한 페이지만)
            if (!pageResult.passed || pageResult.warnings.length > 0) {
                const screenshotName = `error-${pageInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
                await page.screenshot({ 
                    path: screenshotName,
                    fullPage: true 
                });
                pageResult.screenshot = screenshotName;
            }
            
            // 결과 요약
            console.log(`  상태: ${pageResult.passed ? '✅ 통과' : '❌ 실패'}`);
            if (pageResult.issues.length > 0) {
                console.log(`  문제: ${pageResult.issues.join(', ')}`);
            }
            if (pageResult.warnings.length > 0) {
                console.log(`  경고: ${pageResult.warnings.join(', ')}`);
            }
            
        } catch (error) {
            pageResult.passed = false;
            pageResult.issues.push(`페이지 로드 실패: ${error.message}`);
            console.log(`  ❌ 에러: ${error.message}`);
        }
        
        results.pages.push(pageResult);
        
        if (pageResult.passed) {
            results.summary.passed++;
        } else {
            results.summary.failed++;
        }
        
        if (pageResult.warnings.length > 0) {
            results.summary.warnings += pageResult.warnings.length;
        }
    }
    
    // 결과 저장
    fs.writeFileSync('complete-test-results.json', JSON.stringify(results, null, 2));
    
    // 최종 요약
    console.log('\n' + '='.repeat(80));
    console.log('📊 전체 테스트 결과 요약');
    console.log('='.repeat(80));
    console.log(`총 페이지: ${results.totalPages}개`);
    console.log(`✅ 통과: ${results.summary.passed}개`);
    console.log(`❌ 실패: ${results.summary.failed}개`);
    console.log(`⚠️  경고: ${results.summary.warnings}개`);
    
    // 실패한 페이지 목록
    const failedPages = results.pages.filter(p => !p.passed);
    if (failedPages.length > 0) {
        console.log('\n❌ 실패한 페이지:');
        failedPages.forEach(p => {
            console.log(`  - ${p.name}: ${p.issues.join(', ')}`);
        });
    }
    
    // 주요 문제점
    const cspIssues = results.pages.filter(p => p.csp.visible);
    if (cspIssues.length > 0) {
        console.log(`\n🚨 CSP 태그가 노출된 페이지: ${cspIssues.length}개`);
    }
    
    const noCardCSS = results.pages.filter(p => 
        p.features.hasCardCSS === false && 
        (p.path.includes('fortune') || p.path.includes('test') || p.path.includes('tool'))
    );
    if (noCardCSS.length > 0) {
        console.log(`\n⚠️  카드 CSS가 없는 페이지: ${noCardCSS.length}개`);
        noCardCSS.forEach(p => console.log(`  - ${p.name}`));
    }
    
    await browser.close();
    console.log('\n✅ 전체 테스트 완료!');
}

completeTestAllPages().catch(console.error);