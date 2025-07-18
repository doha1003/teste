#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testMainPage() {
    console.log('🔍 doha.kr 메인 페이지 최종 테스트 시작...\n');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // 콘솔 로그 캡처
        const consoleMessages = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleMessages.push(`❌ ${msg.text()}`);
            }
        });
        
        // 페이지 로드
        console.log('📄 페이지 로딩 중...');
        await page.goto('https://doha.kr', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // CSS 로딩 확인
        console.log('🎨 CSS 파일 로딩 확인...');
        const cssLoaded = await page.evaluate(() => {
            const link = document.querySelector('link[href*="styles-complete.min.css"]');
            return link && link.sheet && link.sheet.cssRules.length > 0;
        });
        
        console.log(`CSS 로딩: ${cssLoaded ? '✅ 성공' : '❌ 실패'}`);
        
        // navbar 클래스 확인
        console.log('🧭 네비게이션 바 확인...');
        const navbarExists = await page.$('.navbar');
        const navbarStyles = await page.evaluate(() => {
            const navbar = document.querySelector('.navbar');
            if (!navbar) return null;
            const computed = window.getComputedStyle(navbar);
            return {
                background: computed.background,
                position: computed.position,
                zIndex: computed.zIndex
            };
        });
        
        console.log(`네비게이션 바: ${navbarExists ? '✅ 존재' : '❌ 없음'}`);
        if (navbarStyles) {
            console.log(`  - 배경: ${navbarStyles.background.substring(0, 50)}...`);
            console.log(`  - 위치: ${navbarStyles.position}`);
            console.log(`  - z-index: ${navbarStyles.zIndex}`);
        }
        
        // 푸터 클래스 확인  
        console.log('🦶 푸터 확인...');
        const footerExists = await page.$('.footer');
        const footerStyles = await page.evaluate(() => {
            const footer = document.querySelector('.footer');
            if (!footer) return null;
            const computed = window.getComputedStyle(footer);
            return {
                background: computed.background,
                color: computed.color
            };
        });
        
        console.log(`푸터: ${footerExists ? '✅ 존재' : '❌ 없음'}`);
        if (footerStyles) {
            console.log(`  - 배경: ${footerStyles.background.substring(0, 50)}...`);
            console.log(`  - 색상: ${footerStyles.color}`);
        }
        
        // 히어로 섹션 확인
        console.log('🦸 히어로 섹션 확인...');
        const heroExists = await page.$('.hero');
        const heroStyles = await page.evaluate(() => {
            const hero = document.querySelector('.hero');
            if (!hero) return null;
            const computed = window.getComputedStyle(hero);
            return {
                background: computed.background,
                padding: computed.padding
            };
        });
        
        console.log(`히어로 섹션: ${heroExists ? '✅ 존재' : '❌ 없음'}`);
        if (heroStyles) {
            console.log(`  - 배경: ${heroStyles.background.substring(0, 50)}...`);
            console.log(`  - 패딩: ${heroStyles.padding}`);
        }
        
        // 서비스 카드들 확인
        console.log('🃏 서비스 카드 확인...');
        const serviceCards = await page.$$('.service-card');
        console.log(`서비스 카드 개수: ${serviceCards.length}개`);
        
        // CSS 클래스 검사
        console.log('🔍 중요 CSS 클래스 존재 확인...');
        const importantClasses = [
            '.navbar', '.footer', '.hero', '.container',
            '.service-card', '.feature-card', '.btn'
        ];
        
        for (const className of importantClasses) {
            const exists = await page.$(className);
            console.log(`  ${className}: ${exists ? '✅' : '❌'}`);
        }
        
        // 콘솔 오류 보고
        if (consoleMessages.length > 0) {
            console.log('\n⚠️  콘솔 오류:');
            consoleMessages.forEach(msg => console.log(`  ${msg}`));
        } else {
            console.log('\n✅ 콘솔 오류 없음');
        }
        
        console.log('\n🎉 테스트 완료!');
        
    } catch (error) {
        console.error('❌ 테스트 오류:', error.message);
    } finally {
        await browser.close();
    }
}

testMainPage().catch(console.error);