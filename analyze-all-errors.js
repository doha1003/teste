// 26개 페이지 전체 에러 분석
import { chromium } from 'playwright';
import fs from 'fs';

const ALL_PAGES = [
    { url: 'https://doha.kr/', name: '메인 페이지' },
    { url: 'https://doha.kr/tests/', name: '심리테스트 메인' },
    { url: 'https://doha.kr/tests/teto-egen/', name: '테토-에겐' },
    { url: 'https://doha.kr/tests/mbti/', name: 'MBTI' },
    { url: 'https://doha.kr/tests/mbti/test.html', name: 'MBTI 테스트' },
    { url: 'https://doha.kr/tests/love-dna/', name: '러브 DNA' },
    { url: 'https://doha.kr/tests/love-dna/test.html', name: '러브 DNA 테스트' },
    { url: 'https://doha.kr/tests/teto-egen/start.html', name: '테토-에겐 시작' },
    { url: 'https://doha.kr/tests/teto-egen/test.html', name: '테토-에겐 테스트' },
    { url: 'https://doha.kr/tools/', name: '실용도구 메인' },
    { url: 'https://doha.kr/tools/text-counter.html', name: '글자수 세기' },
    { url: 'https://doha.kr/tools/bmi-calculator.html', name: 'BMI 계산기' },
    { url: 'https://doha.kr/tools/salary-calculator.html', name: '연봉 계산기' },
    { url: 'https://doha.kr/fortune/', name: 'AI 운세 메인' },
    { url: 'https://doha.kr/fortune/daily/', name: '일일운세' },
    { url: 'https://doha.kr/fortune/saju/', name: '사주팔자' },
    { url: 'https://doha.kr/fortune/tarot/', name: '타로' },
    { url: 'https://doha.kr/fortune/zodiac/', name: '별자리' },
    { url: 'https://doha.kr/fortune/zodiac-animal/', name: '띠별' },
    { url: 'https://doha.kr/about/', name: '소개' },
    { url: 'https://doha.kr/contact/', name: '문의' },
    { url: 'https://doha.kr/privacy/', name: '개인정보' },
    { url: 'https://doha.kr/terms/', name: '이용약관' },
    { url: 'https://doha.kr/faq/', name: 'FAQ' },
    { url: 'https://doha.kr/404.html', name: '404' },
    { url: 'https://doha.kr/offline.html', name: '오프라인' }
];

async function analyzeAllErrors() {
    const browser = await chromium.launch({ 
        headless: false,
        devtools: true 
    });
    
    const errorSummary = {
        'Identifier has already been declared': new Set(),
        'Unexpected end of input': new Set(),
        'Unexpected token': new Set(),
        'TypeScript files': new Set(),
        'Other errors': new Set()
    };
    
    console.log('🔍 26개 페이지 전체 에러 분석 시작...\n');
    
    for (let i = 0; i < ALL_PAGES.length; i++) {
        const pageInfo = ALL_PAGES[i];
        console.log(`[${i + 1}/26] ${pageInfo.name} 분석 중...`);
        
        const page = await browser.newPage();
        const pageErrors = [];
        
        // 네트워크 요청 감시
        page.on('response', response => {
            const url = response.url();
            if (url.endsWith('.ts')) {
                errorSummary['TypeScript files'].add(url);
            }
        });
        
        // 콘솔 에러 수집
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                pageErrors.push({
                    text: text,
                    location: msg.location()
                });
                
                // 에러 분류
                if (text.includes('has already been declared')) {
                    const match = text.match(/Identifier '(\w+)' has already been declared/);
                    if (match) {
                        errorSummary['Identifier has already been declared'].add(match[1]);
                    }
                } else if (text.includes('Unexpected end of input')) {
                    const location = msg.location();
                    if (location?.url) {
                        errorSummary['Unexpected end of input'].add(location.url);
                    }
                } else if (text.includes('Unexpected token')) {
                    errorSummary['Unexpected token'].add(text);
                } else if (!text.includes('Attestation check')) {
                    errorSummary['Other errors'].add(text);
                }
            }
        });
        
        // 페이지 에러
        page.on('pageerror', error => {
            pageErrors.push({
                text: error.message,
                stack: error.stack
            });
        });
        
        try {
            await page.goto(pageInfo.url, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            await page.waitForTimeout(2000);
            
            // HTML에서 스크립트 태그 확인
            const scripts = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('script[src]')).map(s => ({
                    src: s.src,
                    isTypeScript: s.src.endsWith('.ts'),
                    hasVersion: s.src.includes('?v=')
                }));
            });
            
            const tsScripts = scripts.filter(s => s.isTypeScript);
            if (tsScripts.length > 0) {
                console.log(`   ⚠️  TypeScript 파일 직접 로드: ${tsScripts.length}개`);
                tsScripts.forEach(s => {
                    console.log(`      - ${s.src}`);
                });
            }
            
            if (pageErrors.length > 0) {
                console.log(`   ❌ 에러 발생: ${pageErrors.length}개`);
            } else {
                console.log(`   ✅ 에러 없음`);
            }
            
        } catch (e) {
            console.log(`   ⚠️  페이지 로드 실패: ${e.message}`);
        }
        
        await page.close();
    }
    
    // 에러 요약
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 에러 분석 요약');
    console.log('='.repeat(60));
    
    console.log('\n1. 중복 선언된 식별자:');
    errorSummary['Identifier has already been declared'].forEach(id => {
        console.log(`   - ${id}`);
    });
    
    console.log('\n2. Unexpected end of input 에러 파일:');
    errorSummary['Unexpected end of input'].forEach(url => {
        console.log(`   - ${url}`);
    });
    
    console.log('\n3. TypeScript 파일 직접 로드:');
    errorSummary['TypeScript files'].forEach(url => {
        console.log(`   - ${url}`);
    });
    
    console.log('\n4. 기타 에러:');
    errorSummary['Other errors'].forEach(err => {
        console.log(`   - ${err.substring(0, 100)}...`);
    });
    
    // 해결 방안 제시
    console.log('\n\n' + '='.repeat(60));
    console.log('🔧 해결 방안');
    console.log('='.repeat(60));
    
    if (errorSummary['Identifier has already been declared'].size > 0) {
        console.log('\n1. 중복 선언 문제:');
        console.log('   - JavaScript 파일이 여러 번 로드되고 있습니다.');
        console.log('   - HTML에서 동일한 스크립트를 중복으로 포함하고 있는지 확인 필요');
    }
    
    if (errorSummary['TypeScript files'].size > 0) {
        console.log('\n2. TypeScript 파일 문제:');
        console.log('   - .ts 파일을 직접 로드하면 안 됩니다.');
        console.log('   - .js 파일로 변경 필요');
    }
    
    if (errorSummary['Unexpected end of input'].size > 0) {
        console.log('\n3. Unexpected end of input:');
        console.log('   - 인라인 스크립트에 구문 에러가 있습니다.');
        console.log('   - HTML 파일의 <script> 태그 확인 필요');
    }
    
    await browser.close();
}

analyzeAllErrors().catch(console.error);