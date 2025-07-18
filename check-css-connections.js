#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const ALL_PAGES = [
    // 메인
    { url: 'https://doha.kr', name: '메인', path: '/index.html' },
    
    // 심리테스트
    { url: 'https://doha.kr/tests/', name: '심리테스트 메인', path: '/tests/index.html' },
    { url: 'https://doha.kr/tests/mbti/', name: 'MBTI 테스트', path: '/tests/mbti/index.html' },
    { url: 'https://doha.kr/tests/teto-egen/', name: '테토-에겐 테스트', path: '/tests/teto-egen/index.html' },
    { url: 'https://doha.kr/tests/love-dna/', name: '러브 DNA 테스트', path: '/tests/love-dna/index.html' },
    
    // 운세
    { url: 'https://doha.kr/fortune/', name: '운세 메인', path: '/fortune/index.html' },
    { url: 'https://doha.kr/fortune/daily/', name: '오늘의 운세', path: '/fortune/daily/index.html' },
    { url: 'https://doha.kr/fortune/saju/', name: '사주팔자', path: '/fortune/saju/index.html' },
    { url: 'https://doha.kr/fortune/tarot/', name: '타로 카드', path: '/fortune/tarot/index.html' },
    { url: 'https://doha.kr/fortune/zodiac/', name: '별자리 운세', path: '/fortune/zodiac/index.html' },
    { url: 'https://doha.kr/fortune/zodiac-animal/', name: '띠별 운세', path: '/fortune/zodiac-animal/index.html' },
    
    // 실용도구
    { url: 'https://doha.kr/tools/', name: '실용도구 메인', path: '/tools/index.html' },
    { url: 'https://doha.kr/tools/text-counter.html', name: '글자수 세기', path: '/tools/text-counter.html' },
    { url: 'https://doha.kr/tools/salary-calculator.html', name: '연봉계산기', path: '/tools/salary-calculator.html' },
    { url: 'https://doha.kr/tools/bmi-calculator.html', name: 'BMI 계산기', path: '/tools/bmi-calculator.html' },
    { url: 'https://doha.kr/tools/age-calculator.html', name: '만 나이 계산기', path: '/tools/age-calculator.html' },
    { url: 'https://doha.kr/tools/percentage-calculator.html', name: '퍼센트 계산기', path: '/tools/percentage-calculator.html' },
    { url: 'https://doha.kr/tools/discount-calculator.html', name: '할인율 계산기', path: '/tools/discount-calculator.html' },
    { url: 'https://doha.kr/tools/unit-converter.html', name: '단위 변환기', path: '/tools/unit-converter.html' },
    { url: 'https://doha.kr/tools/loan-calculator.html', name: '대출 이자 계산기', path: '/tools/loan-calculator.html' },
    
    // 기타
    { url: 'https://doha.kr/about/', name: '소개', path: '/about/index.html' },
    { url: 'https://doha.kr/contact/', name: '문의', path: '/contact/index.html' },
    { url: 'https://doha.kr/privacy/', name: '개인정보처리방침', path: '/privacy/index.html' },
    { url: 'https://doha.kr/terms/', name: '이용약관', path: '/terms/index.html' },
    { url: 'https://doha.kr/community/', name: '커뮤니티', path: '/community/index.html' },
    { url: 'https://doha.kr/search/', name: '검색', path: '/search/index.html' }
];

async function checkCSSConnections() {
    console.log('🔍 doha.kr 전체 CSS 연결 상태 검사 시작...\n');
    console.log(`총 ${ALL_PAGES.length}개 페이지 검사 예정\n`);
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const cssStats = {
        totalPages: ALL_PAGES.length,
        cssFiles: new Map(), // CSS 파일별 사용 페이지
        duplicateCSS: [],    // 중복 CSS
        missingCSS: [],      // 404 CSS
        inlineStyles: [],    // 인라인 스타일 사용 페이지
        noCSS: [],          // CSS 없는 페이지
        correctPages: 0
    };
    
    for (const pageInfo of ALL_PAGES) {
        console.log(`\n📄 [${pageInfo.name}] 검사 중...`);
        
        try {
            const page = await browser.newPage();
            
            // 네트워크 요청 모니터링
            const cssRequests = [];
            page.on('response', response => {
                const url = response.url();
                if (url.endsWith('.css')) {
                    cssRequests.push({
                        url,
                        status: response.status(),
                        ok: response.ok()
                    });
                }
            });
            
            // 페이지 로드
            await page.goto(pageInfo.url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            
            // CSS 정보 수집
            const cssInfo = await page.evaluate(() => {
                const links = document.querySelectorAll('link[rel="stylesheet"]');
                const cssFiles = Array.from(links).map(link => ({
                    href: link.href,
                    media: link.media || 'all',
                    disabled: link.disabled
                }));
                
                // 인라인 스타일 확인
                const inlineStyles = document.querySelectorAll('style').length;
                const elementsWithStyle = document.querySelectorAll('[style]').length;
                
                // 중복 CSS 확인
                const cssUrls = cssFiles.map(f => f.href);
                const duplicates = cssUrls.filter((url, index) => cssUrls.indexOf(url) !== index);
                
                return {
                    cssFiles,
                    inlineStyles,
                    elementsWithStyle,
                    duplicates: [...new Set(duplicates)]
                };
            });
            
            // 결과 분석
            console.log(`   CSS 파일: ${cssInfo.cssFiles.length}개`);
            cssInfo.cssFiles.forEach(css => {
                console.log(`   - ${css.href.replace('https://doha.kr', '')}`);
                
                // CSS 파일별 사용 통계
                if (!cssStats.cssFiles.has(css.href)) {
                    cssStats.cssFiles.set(css.href, []);
                }
                cssStats.cssFiles.get(css.href).push(pageInfo.name);
            });
            
            // 404 CSS 체크
            const missing404 = cssRequests.filter(req => !req.ok);
            if (missing404.length > 0) {
                console.log(`   ❌ 404 CSS: ${missing404.length}개`);
                missing404.forEach(css => {
                    cssStats.missingCSS.push({
                        page: pageInfo.name,
                        css: css.url,
                        status: css.status
                    });
                });
            }
            
            // 중복 CSS 체크
            if (cssInfo.duplicates.length > 0) {
                console.log(`   ⚠️  중복 CSS: ${cssInfo.duplicates.length}개`);
                cssStats.duplicateCSS.push({
                    page: pageInfo.name,
                    duplicates: cssInfo.duplicates
                });
            }
            
            // 인라인 스타일 체크
            if (cssInfo.inlineStyles > 0 || cssInfo.elementsWithStyle > 0) {
                console.log(`   ⚠️  인라인 스타일: <style> ${cssInfo.inlineStyles}개, style속성 ${cssInfo.elementsWithStyle}개`);
                cssStats.inlineStyles.push({
                    page: pageInfo.name,
                    styleTags: cssInfo.inlineStyles,
                    styleAttrs: cssInfo.elementsWithStyle
                });
            }
            
            // CSS 없는 페이지
            if (cssInfo.cssFiles.length === 0) {
                console.log(`   ❌ CSS 파일 없음!`);
                cssStats.noCSS.push(pageInfo.name);
            }
            
            // 정상 페이지 카운트
            if (missing404.length === 0 && cssInfo.duplicates.length === 0 && cssInfo.cssFiles.length > 0) {
                cssStats.correctPages++;
            }
            
            await page.close();
            
        } catch (error) {
            console.log(`   ❌ 페이지 로드 실패: ${error.message}`);
        }
    }
    
    // 최종 보고서
    console.log('\n' + '='.repeat(80));
    console.log('📊 CSS 연결 상태 종합 보고서');
    console.log('='.repeat(80));
    
    console.log(`\n✅ 정상 페이지: ${cssStats.correctPages}/${cssStats.totalPages}`);
    console.log(`❌ CSS 없는 페이지: ${cssStats.noCSS.length}개`);
    console.log(`⚠️  404 CSS: ${cssStats.missingCSS.length}개`);
    console.log(`⚠️  중복 CSS: ${cssStats.duplicateCSS.length}개 페이지`);
    console.log(`⚠️  인라인 스타일: ${cssStats.inlineStyles.length}개 페이지`);
    
    // CSS 파일별 사용 현황
    console.log('\n📁 CSS 파일별 사용 현황:');
    const sortedCSS = [...cssStats.cssFiles.entries()].sort((a, b) => b[1].length - a[1].length);
    sortedCSS.forEach(([css, pages]) => {
        console.log(`\n${css.replace('https://doha.kr', '')}`);
        console.log(`   사용 페이지: ${pages.length}개`);
    });
    
    // 문제 상세
    if (cssStats.missingCSS.length > 0) {
        console.log('\n❌ 404 CSS 상세:');
        cssStats.missingCSS.forEach(({ page, css, status }) => {
            console.log(`   [${page}] ${css} (${status})`);
        });
    }
    
    if (cssStats.duplicateCSS.length > 0) {
        console.log('\n⚠️  중복 CSS 상세:');
        cssStats.duplicateCSS.forEach(({ page, duplicates }) => {
            console.log(`   [${page}]`);
            duplicates.forEach(dup => console.log(`      - ${dup}`));
        });
    }
    
    if (cssStats.noCSS.length > 0) {
        console.log('\n❌ CSS 없는 페이지:');
        cssStats.noCSS.forEach(page => console.log(`   - ${page}`));
    }
    
    if (cssStats.inlineStyles.length > 0) {
        console.log('\n⚠️  인라인 스타일 사용 페이지:');
        cssStats.inlineStyles.forEach(({ page, styleTags, styleAttrs }) => {
            console.log(`   [${page}] <style> ${styleTags}개, style="" ${styleAttrs}개`);
        });
    }
    
    await browser.close();
}

checkCSSConnections().catch(console.error);