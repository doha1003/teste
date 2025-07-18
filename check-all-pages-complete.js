#!/usr/bin/env node

const puppeteer = require('puppeteer');

const ALL_PAGES = [
    // 메인
    { url: 'https://doha.kr', name: '메인' },
    
    // 심리테스트
    { url: 'https://doha.kr/tests/', name: '심리테스트 메인' },
    { url: 'https://doha.kr/tests/mbti/', name: 'MBTI 테스트' },
    { url: 'https://doha.kr/tests/teto-egen/', name: '테토-에겐 테스트' },
    { url: 'https://doha.kr/tests/love-dna/', name: '러브 DNA 테스트' },
    
    // 운세
    { url: 'https://doha.kr/fortune/', name: '운세 메인' },
    { url: 'https://doha.kr/fortune/daily/', name: '오늘의 운세' },
    { url: 'https://doha.kr/fortune/saju/', name: '사주팔자' },
    { url: 'https://doha.kr/fortune/tarot/', name: '타로 카드' },
    { url: 'https://doha.kr/fortune/zodiac/', name: '별자리 운세' },
    { url: 'https://doha.kr/fortune/zodiac-animal/', name: '띠별 운세' },
    
    // 실용도구
    { url: 'https://doha.kr/tools/', name: '실용도구 메인' },
    { url: 'https://doha.kr/tools/text-counter.html', name: '글자수 세기' },
    { url: 'https://doha.kr/tools/salary-calculator.html', name: '연봉계산기' },
    { url: 'https://doha.kr/tools/bmi-calculator.html', name: 'BMI 계산기' },
    
    // 기타
    { url: 'https://doha.kr/about/', name: '소개' },
    { url: 'https://doha.kr/contact/', name: '문의' },
    { url: 'https://doha.kr/privacy/', name: '개인정보처리방침' },
    { url: 'https://doha.kr/terms/', name: '이용약관' }
];

async function checkAllPages() {
    console.log('🔍 doha.kr 전체 페이지 검사 시작...\n');
    console.log(`총 ${ALL_PAGES.length}개 페이지 검사 예정\n`);
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const issues = [];
    let successCount = 0;
    
    for (const pageInfo of ALL_PAGES) {
        console.log(`\n📄 [${pageInfo.name}] 검사 중...`);
        console.log(`   URL: ${pageInfo.url}`);
        
        try {
            const page = await browser.newPage();
            const pageIssues = [];
            
            // 콘솔 에러 캡처
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });
            
            // 페이지 로드
            const response = await page.goto(pageInfo.url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            
            const status = response.status();
            if (status !== 200) {
                pageIssues.push(`HTTP ${status} 오류`);
            }
            
            // CSS 로딩 확인
            const cssLoaded = await page.evaluate(() => {
                const links = document.querySelectorAll('link[rel="stylesheet"]');
                return Array.from(links).map(link => ({
                    href: link.href,
                    loaded: link.sheet !== null
                }));
            });
            
            const failedCSS = cssLoaded.filter(css => !css.loaded);
            if (failedCSS.length > 0) {
                pageIssues.push(`CSS 로딩 실패: ${failedCSS.map(css => css.href).join(', ')}`);
            }
            
            // 필수 요소 확인
            const elements = await page.evaluate(() => {
                return {
                    navbar: !!document.querySelector('.navbar'),
                    footer: !!document.querySelector('.footer'),
                    container: !!document.querySelector('.container'),
                    hasContent: document.body.innerText.trim().length > 100
                };
            });
            
            if (!elements.navbar) pageIssues.push('네비게이션 바 없음');
            if (!elements.footer) pageIssues.push('푸터 없음');
            if (!elements.hasContent) pageIssues.push('콘텐츠 부족');
            
            // 레이아웃 문제 확인
            const layoutIssues = await page.evaluate(() => {
                const issues = [];
                const body = document.body;
                const computedStyle = window.getComputedStyle(body);
                
                if (computedStyle.width !== window.innerWidth + 'px') {
                    issues.push('body 너비 문제');
                }
                
                // overflow 체크
                if (body.scrollWidth > window.innerWidth) {
                    issues.push('가로 스크롤 발생');
                }
                
                return issues;
            });
            
            pageIssues.push(...layoutIssues);
            
            // 콘솔 에러 추가
            if (consoleErrors.length > 0) {
                pageIssues.push(`콘솔 에러 ${consoleErrors.length}개`);
            }
            
            // 결과 출력
            if (pageIssues.length === 0) {
                console.log('   ✅ 정상');
                successCount++;
            } else {
                console.log('   ❌ 문제 발견:');
                pageIssues.forEach(issue => console.log(`      - ${issue}`));
                issues.push({ page: pageInfo.name, url: pageInfo.url, issues: pageIssues });
            }
            
            await page.close();
            
        } catch (error) {
            console.log(`   ❌ 페이지 로드 실패: ${error.message}`);
            issues.push({ 
                page: pageInfo.name, 
                url: pageInfo.url, 
                issues: [`페이지 로드 실패: ${error.message}`] 
            });
        }
    }
    
    // 최종 보고서
    console.log('\n' + '='.repeat(60));
    console.log('📊 전체 검사 결과');
    console.log('='.repeat(60));
    console.log(`✅ 정상: ${successCount}개`);
    console.log(`❌ 문제: ${issues.length}개`);
    
    if (issues.length > 0) {
        console.log('\n🚨 문제가 있는 페이지 목록:');
        issues.forEach(({ page, url, issues }) => {
            console.log(`\n[${page}]`);
            console.log(`URL: ${url}`);
            issues.forEach(issue => console.log(`- ${issue}`));
        });
    }
    
    await browser.close();
}

checkAllPages().catch(console.error);