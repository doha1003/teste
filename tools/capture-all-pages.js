import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 모든 페이지 URL
const pages = [
    { name: 'home', url: 'https://doha.kr/' },
    { name: 'about', url: 'https://doha.kr/about/' },
    { name: 'contact', url: 'https://doha.kr/contact/' },
    { name: 'privacy', url: 'https://doha.kr/privacy/' },
    { name: 'terms', url: 'https://doha.kr/terms/' },
    { name: 'faq', url: 'https://doha.kr/faq/' },
    { name: 'tests', url: 'https://doha.kr/tests/' },
    { name: 'tests-mbti', url: 'https://doha.kr/tests/mbti/' },
    { name: 'tests-love-dna', url: 'https://doha.kr/tests/love-dna/' },
    { name: 'tests-teto-egen', url: 'https://doha.kr/tests/teto-egen/' },
    { name: 'tools', url: 'https://doha.kr/tools/' },
    { name: 'tools-bmi', url: 'https://doha.kr/tools/bmi/' },
    { name: 'tools-text-counter', url: 'https://doha.kr/tools/text-counter/' },
    { name: 'tools-salary', url: 'https://doha.kr/tools/salary/' },
    { name: 'fortune', url: 'https://doha.kr/fortune/' },
    { name: 'fortune-daily', url: 'https://doha.kr/fortune/daily/' },
    { name: 'fortune-saju', url: 'https://doha.kr/fortune/saju/' },
    { name: 'fortune-tarot', url: 'https://doha.kr/fortune/tarot/' },
    { name: 'fortune-zodiac', url: 'https://doha.kr/fortune/zodiac/' },
    { name: 'fortune-zodiac-animal', url: 'https://doha.kr/fortune/zodiac-animal/' },
    { name: '404', url: 'https://doha.kr/404.html' },
    { name: 'offline', url: 'https://doha.kr/offline/' },
    // 추가 페이지들
    { name: 'tests-mbti-test', url: 'https://doha.kr/tests/mbti/test.html' },
    { name: 'tests-love-dna-test', url: 'https://doha.kr/tests/love-dna/test.html' },
    { name: 'tests-teto-egen-test', url: 'https://doha.kr/tests/teto-egen/test.html' },
    { name: 'design-demo', url: 'https://doha.kr/design-system/comprehensive-demo.html' }
];

async function captureAllPages() {
    console.log('🚀 26개 페이지 스크린샷 캡처 시작...\n');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // 스크린샷 저장 디렉토리 생성
    const screenshotDir = path.join(__dirname, 'screenshots');
    await fs.mkdir(screenshotDir, { recursive: true });
    
    const results = [];
    
    for (const pageInfo of pages) {
        console.log(`📸 캡처 중: ${pageInfo.name} (${pageInfo.url})`);
        
        const page = await browser.newPage();
        
        // 뷰포트 설정 (데스크톱 & 모바일)
        const viewports = [
            { name: 'desktop', width: 1920, height: 1080 },
            { name: 'mobile', width: 390, height: 844 }
        ];
        
        for (const viewport of viewports) {
            await page.setViewport(viewport);
            
            try {
                // 페이지 로드
                await page.goto(pageInfo.url, {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });
                
                // 페이지 로드 대기
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // 스크롤하여 lazy loading 요소 로드
                await page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });
                await new Promise(resolve => setTimeout(resolve, 1000));
                await page.evaluate(() => {
                    window.scrollTo(0, 0);
                });
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 전체 페이지 스크린샷
                const screenshotPath = path.join(screenshotDir, `${pageInfo.name}-${viewport.name}.png`);
                await page.screenshot({
                    path: screenshotPath,
                    fullPage: true
                });
                
                // 페이지 분석
                const analysis = await page.evaluate(() => {
                    const issues = [];
                    
                    // 1. 레이아웃 오버플로우 체크
                    const overflowElements = Array.from(document.querySelectorAll('*')).filter(el => {
                        const rect = el.getBoundingClientRect();
                        return rect.width > window.innerWidth || rect.right > window.innerWidth;
                    });
                    if (overflowElements.length > 0) {
                        issues.push(`레이아웃 오버플로우: ${overflowElements.length}개 요소`);
                    }
                    
                    // 2. 텍스트 겹침 체크
                    const textElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button'));
                    const overlappingTexts = [];
                    for (let i = 0; i < textElements.length; i++) {
                        for (let j = i + 1; j < textElements.length; j++) {
                            const rect1 = textElements[i].getBoundingClientRect();
                            const rect2 = textElements[j].getBoundingClientRect();
                            if (rect1.left < rect2.right && rect1.right > rect2.left &&
                                rect1.top < rect2.bottom && rect1.bottom > rect2.top) {
                                overlappingTexts.push({
                                    el1: textElements[i].tagName,
                                    el2: textElements[j].tagName
                                });
                            }
                        }
                    }
                    if (overlappingTexts.length > 0) {
                        issues.push(`텍스트 겹침: ${overlappingTexts.length}개 발견`);
                    }
                    
                    // 3. 애니메이션 체크
                    const animatedElements = Array.from(document.querySelectorAll('*')).filter(el => {
                        const style = window.getComputedStyle(el);
                        return style.animation !== 'none' || style.transition !== 'none 0s ease 0s';
                    });
                    
                    // 4. 빈 콘텐츠 체크
                    const emptyContainers = Array.from(document.querySelectorAll('.card, .section, .container')).filter(el => {
                        return el.textContent.trim() === '' && el.children.length === 0;
                    });
                    if (emptyContainers.length > 0) {
                        issues.push(`빈 콘텐츠 컨테이너: ${emptyContainers.length}개`);
                    }
                    
                    // 5. 폰트 로딩 체크
                    const koreanText = document.body.textContent.match(/[가-힣]/g);
                    const hasKoreanFont = document.fonts.check('16px Pretendard') || document.fonts.check('16px "Noto Sans KR"');
                    if (koreanText && !hasKoreanFont) {
                        issues.push('한글 폰트 로딩 실패');
                    }
                    
                    // 6. 색상 대비 체크 (접근성)
                    const primaryButtons = document.querySelectorAll('.btn-primary, .button-primary');
                    const lowContrastButtons = Array.from(primaryButtons).filter(btn => {
                        const style = window.getComputedStyle(btn);
                        const bgColor = style.backgroundColor;
                        const textColor = style.color;
                        // 간단한 대비 체크 (실제로는 더 복잡한 계산 필요)
                        return bgColor === textColor;
                    });
                    if (lowContrastButtons.length > 0) {
                        issues.push(`낮은 색상 대비: ${lowContrastButtons.length}개 버튼`);
                    }
                    
                    return {
                        issues,
                        animationCount: animatedElements.length,
                        hasDesignSystem: !!document.querySelector('[class*="color-primary"]'),
                        hasMobileMenu: !!document.querySelector('.mobile-menu-toggle'),
                        fontLoaded: hasKoreanFont
                    };
                });
                
                results.push({
                    page: pageInfo.name,
                    url: pageInfo.url,
                    viewport: viewport.name,
                    screenshot: screenshotPath,
                    analysis
                });
                
                console.log(`  ✅ ${viewport.name} 캡처 완료`);
                if (analysis.issues.length > 0) {
                    console.log(`  ⚠️  이슈 발견: ${analysis.issues.join(', ')}`);
                }
                
            } catch (error) {
                console.error(`  ❌ 에러: ${error.message}`);
                results.push({
                    page: pageInfo.name,
                    url: pageInfo.url,
                    viewport: viewport.name,
                    error: error.message
                });
            }
        }
        
        await page.close();
    }
    
    await browser.close();
    
    // 결과 저장
    const reportPath = path.join(__dirname, 'design-analysis-report.json');
    await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
    
    // 요약 출력
    console.log('\n================================================================================');
    console.log('📊 디자인 분석 요약');
    console.log('================================================================================');
    
    const issuePages = results.filter(r => r.analysis && r.analysis.issues.length > 0);
    console.log(`\n총 페이지: ${pages.length}개`);
    console.log(`문제 있는 페이지: ${issuePages.length}개`);
    
    if (issuePages.length > 0) {
        console.log('\n🚨 발견된 문제들:');
        issuePages.forEach(page => {
            console.log(`\n${page.page} (${page.viewport}):`);
            page.analysis.issues.forEach(issue => {
                console.log(`  - ${issue}`);
            });
        });
    }
    
    console.log(`\n📁 스크린샷 저장 위치: ${screenshotDir}`);
    console.log(`📄 분석 리포트: ${reportPath}`);
}

// 실행
captureAllPages().catch(console.error);