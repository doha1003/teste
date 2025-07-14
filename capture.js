const puppeteer = require('puppeteer');

async function captureWebsite() {
    console.log('🎯 doha.kr 웹사이트 스크린샷 캡처 시작...');
    
    let browser;
    try {
        // Puppeteer 브라우저 실행
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });
        
        const page = await browser.newPage();
        
        // 뷰포트 설정 (데스크톱 해상도)
        await page.setViewport({ 
            width: 1920, 
            height: 1080,
            deviceScaleFactor: 1
        });
        
        // doha.kr 접속
        console.log('🌐 https://doha.kr 접속 중...');
        await page.goto('https://doha.kr', { 
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // 페이지 로딩 완료 대기
        await page.waitForTimeout(3000);
        
        // 스크린샷 캡처
        console.log('📸 스크린샷 캡처 중...');
        await page.screenshot({ 
            path: 'screenshot.png', 
            fullPage: true,
            quality: 85
        });
        
        console.log('✅ 스크린샷 캡처 완료: screenshot.png');
        
        // 페이지 정보 수집
        const pageInfo = await page.evaluate(() => ({
            title: document.title,
            url: window.location.href,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            timestamp: new Date().toISOString()
        }));
        
        console.log('📋 페이지 정보:');
        console.log(`  제목: ${pageInfo.title}`);
        console.log(`  URL: ${pageInfo.url}`);
        console.log(`  뷰포트: ${pageInfo.viewport.width}x${pageInfo.viewport.height}`);
        console.log(`  캡처 시간: ${pageInfo.timestamp}`);
        
    } catch (error) {
        console.error('❌ 스크린샷 캡처 실패:', error.message);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 스크립트가 직접 실행된 경우
if (require.main === module) {
    captureWebsite();
}

module.exports = { captureWebsite };