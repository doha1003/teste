import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugFortuneTest() {
    console.log('🔍 doha.kr 운세 서비스 디버그 테스트');
    console.log('='.repeat(50));

    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,  // 개발자 도구 열기
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // 스크린샷 저장 디렉토리 생성
    const screenshotDir = path.join(__dirname, 'debug-screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // 모든 네트워크 요청 모니터링
    page.on('request', request => {
        const url = request.url();
        if (url.includes('api') || url.includes('vercel') || url.includes('fortune')) {
            console.log(`🌐 요청: ${request.method()} ${url}`);
        }
    });

    // 모든 응답 모니터링
    page.on('response', async response => {
        const url = response.url();
        if (url.includes('api') || url.includes('vercel') || url.includes('fortune')) {
            console.log(`📡 응답: ${response.status()} ${url}`);
            if (response.status() === 200) {
                try {
                    const text = await response.text();
                    console.log(`응답 길이: ${text.length}자`);
                    if (text.length < 200) {
                        console.log(`응답 내용: ${text.substring(0, 100)}...`);
                    }
                } catch (e) {
                    console.log('응답 텍스트 읽기 실패');
                }
            }
        }
    });

    // 콘솔 로그 모니터링
    page.on('console', msg => {
        if (msg.type() === 'log' && (msg.text().includes('API') || msg.text().includes('fortune') || msg.text().includes('운세'))) {
            console.log(`🖥️ 브라우저: ${msg.text()}`);
        }
        if (msg.type() === 'error') {
            console.log(`❌ 브라우저 오류: ${msg.text()}`);
        }
    });

    try {
        // 1. 일일운세 테스트
        console.log('\n📅 일일운세 디버그 테스트...');
        await page.goto('https://doha.kr/fortune/daily/', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // 페이지 로드 후 스크린샷
        await page.screenshot({ 
            path: path.join(screenshotDir, '01-daily-loaded.png'),
            fullPage: true 
        });
        
        console.log('페이지 로드 완료. 5초 대기...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 폼 요소들 확인
        const nameInput = await page.$('#userName');
        const yearSelect = await page.$('#birthYear');
        const monthSelect = await page.$('#birthMonth');
        const daySelect = await page.$('#birthDay');
        const submitBtn = await page.$('button[type="submit"]');

        console.log('폼 요소 존재 여부:');
        console.log(`- 이름: ${nameInput ? '✅' : '❌'}`);
        console.log(`- 연도: ${yearSelect ? '✅' : '❌'}`);
        console.log(`- 월: ${monthSelect ? '✅' : '❌'}`);
        console.log(`- 일: ${daySelect ? '✅' : '❌'}`);
        console.log(`- 제출: ${submitBtn ? '✅' : '❌'}`);

        if (nameInput && yearSelect && monthSelect && daySelect && submitBtn) {
            console.log('📝 폼 데이터 입력 중...');
            
            await nameInput.type('디버그테스트');
            await yearSelect.select('1990');
            await monthSelect.select('5');
            
            // 월 선택 후 일 옵션이 로드될 때까지 대기
            await new Promise(resolve => setTimeout(resolve, 1000));
            await daySelect.select('15');

            console.log('✅ 데이터 입력 완료. 폼 제출...');

            // 폼 제출 후 스크린샷
            await page.screenshot({ 
                path: path.join(screenshotDir, '02-daily-before-submit.png'),
                fullPage: true 
            });

            await submitBtn.click();

            console.log('🔄 운세 생성 요청 후 15초 대기...');
            await new Promise(resolve => setTimeout(resolve, 15000));

            // 결과 스크린샷
            await page.screenshot({ 
                path: path.join(screenshotDir, '03-daily-result.png'),
                fullPage: true 
            });

            // 결과 확인
            const resultDiv = await page.$('#fortuneResult');
            if (resultDiv) {
                const isVisible = await resultDiv.evaluate(el => 
                    !el.classList.contains('d-none') && 
                    !el.classList.contains('d-none-init') && 
                    el.style.display !== 'none'
                );
                console.log(`결과 영역 가시성: ${isVisible ? '✅ 보임' : '❌ 숨김'}`);
                
                const resultText = await resultDiv.evaluate(el => el.textContent);
                console.log(`결과 텍스트 길이: ${resultText ? resultText.trim().length : 0}자`);
                
                if (resultText && resultText.trim().length > 100) {
                    console.log('✅ 일일운세 성공!');
                    console.log(`샘플: ${resultText.substring(0, 100)}...`);
                }
            }
        }

        // 2. 별자리 운세 테스트
        console.log('\n⭐ 별자리 운세 디버그 테스트...');
        await page.goto('https://doha.kr/fortune/zodiac/', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '04-zodiac-loaded.png'),
            fullPage: true 
        });
        
        console.log('별자리 페이지 로드 완료. 5초 대기...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 별자리 폼 요소들 확인
        const zodiacNameInput = await page.$('#userName');
        const ariesRadio = await page.$('#zodiac-aries');
        const zodiacSubmitBtn = await page.$('button[type="submit"]');

        console.log('별자리 폼 요소 존재 여부:');
        console.log(`- 이름: ${zodiacNameInput ? '✅' : '❌'}`);
        console.log(`- 양자리 라디오: ${ariesRadio ? '✅' : '❌'}`);
        console.log(`- 제출 버튼: ${zodiacSubmitBtn ? '✅' : '❌'}`);

        if (zodiacNameInput && ariesRadio && zodiacSubmitBtn) {
            console.log('📝 별자리 폼 입력 중...');
            
            await zodiacNameInput.type('별자리테스트');
            await ariesRadio.click();

            await page.screenshot({ 
                path: path.join(screenshotDir, '05-zodiac-before-submit.png'),
                fullPage: true 
            });

            await zodiacSubmitBtn.click();

            console.log('🔄 별자리 운세 생성 요청 후 15초 대기...');
            await new Promise(resolve => setTimeout(resolve, 15000));

            await page.screenshot({ 
                path: path.join(screenshotDir, '06-zodiac-result.png'),
                fullPage: true 
            });

            // 별자리 결과 확인
            const zodiacResultDiv = await page.$('#zodiacResult');
            if (zodiacResultDiv) {
                const isZodiacVisible = await zodiacResultDiv.evaluate(el => 
                    !el.classList.contains('d-none') && 
                    !el.classList.contains('d-none-init') && 
                    el.style.display !== 'none'
                );
                console.log(`별자리 결과 영역 가시성: ${isZodiacVisible ? '✅ 보임' : '❌ 숨김'}`);
                
                const zodiacResultText = await zodiacResultDiv.evaluate(el => el.textContent);
                console.log(`별자리 결과 텍스트 길이: ${zodiacResultText ? zodiacResultText.trim().length : 0}자`);
                
                if (zodiacResultText && zodiacResultText.trim().length > 100) {
                    console.log('✅ 별자리 운세 성공!');
                }
            }
        }

    } catch (error) {
        console.error('❌ 디버그 테스트 중 오류:', error);
    }

    console.log('\n📸 스크린샷 저장 위치:', screenshotDir);
    
    // 브라우저를 자동으로 닫지 않고 사용자가 확인할 수 있도록 대기
    console.log('\n🔍 브라우저를 열어두었습니다. 결과를 확인하세요.');
    console.log('테스트가 완료되면 브라우저를 닫아주세요.');
    
    // 사용자가 확인할 수 있도록 브라우저를 열어둡니다
    // await browser.close();

    return screenshotDir;
}

// 실행
debugFortuneTest().catch(console.error);