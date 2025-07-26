// 더 자세한 에러 분석
import { chromium } from 'playwright';

async function analyzeErrorsDetail() {
    const browser = await chromium.launch({ 
        headless: false,
        devtools: true 
    });
    
    console.log('🔍 상세 에러 분석...\n');
    
    // 테스트 페이지들
    const testPages = [
        'https://doha.kr/',
        'https://doha.kr/fortune/daily/',
        'https://doha.kr/tools/'
    ];
    
    for (const url of testPages) {
        console.log(`\n📄 ${url} 분석:`);
        const page = await browser.newPage();
        
        const errors = {
            console: [],
            network: [],
            duplicate: [],
            syntaxError: []
        };
        
        // 콘솔 로그 수집
        page.on('console', msg => {
            const text = msg.text();
            const type = msg.type();
            
            if (type === 'log' && text.includes('initialized')) {
                console.log(`   ✅ ${text}`);
            } else if (type === 'error') {
                const location = msg.location();
                errors.console.push({
                    text: text,
                    url: location?.url,
                    line: location?.lineNumber
                });
                
                if (text.includes('has already been declared')) {
                    errors.duplicate.push(text);
                } else if (text.includes('Unexpected')) {
                    errors.syntaxError.push({
                        text: text,
                        location: location
                    });
                }
            }
        });
        
        // 네트워크 에러
        page.on('requestfailed', request => {
            errors.network.push({
                url: request.url(),
                failure: request.failure()
            });
        });
        
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // HTML 분석
        const scriptAnalysis = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script'));
            return {
                total: scripts.length,
                withSrc: scripts.filter(s => s.src).map(s => ({
                    src: s.src,
                    isTS: s.src.includes('.ts'),
                    hasQuery: s.src.includes('?')
                })),
                inline: scripts.filter(s => !s.src).map(s => ({
                    length: s.textContent.length,
                    preview: s.textContent.substring(0, 100)
                }))
            };
        });
        
        console.log(`\n   스크립트 분석:`);
        console.log(`   - 총 스크립트: ${scriptAnalysis.total}개`);
        console.log(`   - 외부 스크립트: ${scriptAnalysis.withSrc.length}개`);
        console.log(`   - 인라인 스크립트: ${scriptAnalysis.inline.length}개`);
        
        if (errors.duplicate.length > 0) {
            console.log(`\n   ❌ 중복 선언 에러: ${errors.duplicate.length}개`);
            errors.duplicate.forEach(err => {
                console.log(`      - ${err}`);
            });
        }
        
        if (errors.syntaxError.length > 0) {
            console.log(`\n   ❌ 구문 에러: ${errors.syntaxError.length}개`);
            errors.syntaxError.forEach(err => {
                console.log(`      - ${err.text}`);
                if (err.location?.url) {
                    console.log(`        파일: ${err.location.url}`);
                    console.log(`        위치: ${err.location.lineNumber}:${err.location.columnNumber}`);
                }
            });
        }
        
        // TypeScript 파일 확인
        const tsFiles = scriptAnalysis.withSrc.filter(s => s.isTS);
        if (tsFiles.length > 0) {
            console.log(`\n   ⚠️  TypeScript 파일 직접 로드:`);
            tsFiles.forEach(file => {
                console.log(`      - ${file.src}`);
            });
        }
        
        // 동일 파일 중복 로드 확인
        const scriptUrls = scriptAnalysis.withSrc.map(s => s.src.split('?')[0]);
        const duplicates = scriptUrls.filter((url, index) => scriptUrls.indexOf(url) !== index);
        if (duplicates.length > 0) {
            console.log(`\n   ⚠️  중복 로드된 스크립트:`);
            [...new Set(duplicates)].forEach(url => {
                console.log(`      - ${url}`);
            });
        }
        
        await page.close();
    }
    
    await browser.close();
}

analyzeErrorsDetail().catch(console.error);