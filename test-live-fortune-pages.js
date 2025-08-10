import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 테스트 결과를 저장할 디렉토리 생성
const screenshotDir = path.join(__dirname, 'test-screenshots', 'fortune-live-test');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

// 운세 페이지 설정
const fortunePages = [
    {
        name: '일일 운세',
        url: 'https://doha.kr/fortune/daily/',
        type: 'daily',
        testConfig: {
            hasForm: true,
            formSelector: 'form',
            requiredFields: ['name', 'birthdate'],
            submitSelector: 'button[type="submit"]',
            resultSelector: '.fortune-result, .result-container, #result'
        }
    },
    {
        name: '사주 운세',
        url: 'https://doha.kr/fortune/saju/',
        type: 'saju',
        testConfig: {
            hasForm: true,
            formSelector: 'form',
            requiredFields: ['name', 'birthdate', 'birth-time', 'gender'],
            submitSelector: 'button[type="submit"]',
            resultSelector: '.fortune-result, .result-container, #result'
        }
    },
    {
        name: '타로 운세',
        url: 'https://doha.kr/fortune/tarot/',
        type: 'tarot',
        testConfig: {
            hasForm: true,
            formSelector: 'form',
            cardSelector: '.tarot-card, .card',
            submitSelector: 'button[type="submit"]',
            resultSelector: '.fortune-result, .result-container, #result'
        }
    },
    {
        name: '별자리 운세',
        url: 'https://doha.kr/fortune/zodiac/',
        type: 'zodiac',
        testConfig: {
            hasForm: true,
            formSelector: 'form',
            zodiacSelector: 'select[name="zodiac"], input[name="zodiac"]',
            submitSelector: 'button[type="submit"]',
            resultSelector: '.fortune-result, .result-container, #result'
        }
    },
    {
        name: '띠별 운세',
        url: 'https://doha.kr/fortune/zodiac-animal/',
        type: 'zodiac-animal',
        testConfig: {
            hasForm: true,
            formSelector: 'form',
            animalSelector: 'select[name="zodiac-animal"], input[name="zodiac-animal"]',
            submitSelector: 'button[type="submit"]',
            resultSelector: '.fortune-result, .result-container, #result'
        }
    }
];

let testResults = [];

async function testFortunePage(browser, page, pageConfig) {
    const result = {
        name: pageConfig.name,
        url: pageConfig.url,
        type: pageConfig.type,
        success: false,
        errors: [],
        warnings: [],
        details: {
            pageLoaded: false,
            jsErrors: [],
            networkErrors: [],
            formFound: false,
            functionTested: false,
            apiCallSuccess: false,
            resultGenerated: false
        }
    };

    try {
        console.log(`\n🧪 테스트 시작: ${pageConfig.name} (${pageConfig.url})`);

        // 콘솔 오류 캡처 설정
        page.on('console', msg => {
            if (msg.type() === 'error') {
                result.details.jsErrors.push(msg.text());
                console.log(`❌ Console Error: ${msg.text()}`);
            } else if (msg.type() === 'warn') {
                result.warnings.push(msg.text());
                console.log(`⚠️ Console Warning: ${msg.text()}`);
            }
        });

        // 네트워크 오류 캡처
        page.on('requestfailed', request => {
            const failure = request.failure();
            const errorText = failure ? failure.errorText : 'Unknown error';
            result.details.networkErrors.push(`${request.method()} ${request.url()} - ${errorText}`);
            console.log(`🌐 Network Error: ${request.url()} - ${errorText}`);
        });

        // 페이지 로드
        console.log(`📱 페이지 로딩 중...`);
        const response = await page.goto(pageConfig.url, { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });

        if (response.status() >= 400) {
            result.errors.push(`HTTP ${response.status()} 오류`);
            return result;
        }

        result.details.pageLoaded = true;
        console.log(`✅ 페이지 로드 완료`);

        // 초기 페이지 스크린샷
        await page.screenshot({
            path: path.join(screenshotDir, `${pageConfig.type}-01-initial.png`),
            fullPage: true
        });

        // DOM 로드 대기
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 폼 존재 확인
        const formExists = await page.$eval(pageConfig.testConfig.formSelector, () => true).catch(() => false);
        if (formExists) {
            result.details.formFound = true;
            console.log(`✅ 폼 발견됨`);
        } else {
            result.errors.push('폼을 찾을 수 없음');
            console.log(`❌ 폼을 찾을 수 없음`);
        }

        // 각 운세 타입별 테스트 수행
        let testSuccess = false;
        
        if (pageConfig.type === 'daily') {
            testSuccess = await testDailyFortune(page, result);
        } else if (pageConfig.type === 'saju') {
            testSuccess = await testSajuFortune(page, result);
        } else if (pageConfig.type === 'tarot') {
            testSuccess = await testTarotFortune(page, result);
        } else if (pageConfig.type === 'zodiac') {
            testSuccess = await testZodiacFortune(page, result);
        } else if (pageConfig.type === 'zodiac-animal') {
            testSuccess = await testZodiacAnimalFortune(page, result);
        }

        result.details.functionTested = testSuccess;

        // 결과 스크린샷
        await page.screenshot({
            path: path.join(screenshotDir, `${pageConfig.type}-02-result.png`),
            fullPage: true
        });

        result.success = result.details.pageLoaded && result.details.formFound && testSuccess;

    } catch (error) {
        console.log(`❌ 오류 발생: ${error.message}`);
        result.errors.push(error.message);
        
        // 오류 발생 시 스크린샷
        await page.screenshot({
            path: path.join(screenshotDir, `${pageConfig.type}-error.png`),
            fullPage: true
        }).catch(() => {});
    }

    return result;
}

async function testDailyFortune(page, result) {
    try {
        console.log(`🔮 일일 운세 테스트 중...`);

        // 이름 입력
        const nameInput = await page.$('input[name="name"], #name');
        if (nameInput) {
            await nameInput.type('테스트유저');
            console.log(`✅ 이름 입력 완료`);
        }

        // 생년월일 입력
        const birthdateInput = await page.$('input[name="birthdate"], #birthdate, input[type="date"]');
        if (birthdateInput) {
            await birthdateInput.type('1990-05-15');
            console.log(`✅ 생년월일 입력 완료`);
        }

        // 폼 제출
        await page.click('button[type="submit"], .submit-btn, .fortune-btn');
        console.log(`📤 폼 제출 완료`);

        // 결과 대기 (API 호출 완료까지)
        await new Promise(resolve => setTimeout(resolve, 5000));

        // API 응답 및 결과 확인
        const resultElement = await page.$('.fortune-result, .result-container, #result, .daily-result');
        if (resultElement) {
            const resultText = await resultElement.evaluate(el => el.innerText);
            if (resultText && resultText.trim().length > 10) {
                result.details.apiCallSuccess = true;
                result.details.resultGenerated = true;
                console.log(`✅ 운세 결과 생성됨: ${resultText.substring(0, 50)}...`);
                return true;
            }
        }

        console.log(`❌ 운세 결과가 생성되지 않음`);
        return false;

    } catch (error) {
        console.log(`❌ 일일 운세 테스트 실패: ${error.message}`);
        result.errors.push(`일일 운세 테스트 실패: ${error.message}`);
        return false;
    }
}

async function testSajuFortune(page, result) {
    try {
        console.log(`🔮 사주 운세 테스트 중...`);

        // 이름 입력
        const nameInput = await page.$('input[name="name"], #name');
        if (nameInput) {
            await nameInput.type('테스트유저');
        }

        // 생년월일 입력
        const birthdateInput = await page.$('input[name="birthdate"], #birthdate, input[type="date"]');
        if (birthdateInput) {
            await birthdateInput.type('1990-05-15');
        }

        // 출생시간 입력
        const timeInput = await page.$('input[name="birth-time"], #birth-time, select[name="birth-time"]');
        if (timeInput) {
            const tagName = await timeInput.evaluate(el => el.tagName.toLowerCase());
            if (tagName === 'select') {
                await timeInput.select('14'); // 14시 선택
            } else {
                await timeInput.type('14:30');
            }
        }

        // 성별 선택
        const genderInput = await page.$('select[name="gender"], input[name="gender"][value="male"]');
        if (genderInput) {
            const tagName = await genderInput.evaluate(el => el.tagName.toLowerCase());
            if (tagName === 'select') {
                await genderInput.select('male');
            } else {
                await genderInput.click();
            }
        }

        await page.click('button[type="submit"], .submit-btn, .fortune-btn');
        await new Promise(resolve => setTimeout(resolve, 8000)); // 사주는 더 복잡한 계산

        const resultElement = await page.$('.fortune-result, .result-container, #result, .saju-result');
        if (resultElement) {
            const resultText = await resultElement.evaluate(el => el.innerText);
            if (resultText && resultText.trim().length > 20) {
                result.details.apiCallSuccess = true;
                result.details.resultGenerated = true;
                console.log(`✅ 사주 결과 생성됨`);
                return true;
            }
        }

        return false;

    } catch (error) {
        console.log(`❌ 사주 운세 테스트 실패: ${error.message}`);
        result.errors.push(`사주 운세 테스트 실패: ${error.message}`);
        return false;
    }
}

async function testTarotFortune(page, result) {
    try {
        console.log(`🔮 타로 운세 테스트 중...`);

        // 타로 카드 선택 (첫 번째 카드 클릭)
        const cardElement = await page.$('.tarot-card, .card, .card-item');
        if (cardElement) {
            await cardElement.click();
            console.log(`✅ 타로 카드 선택됨`);
        }

        // 질문이나 이름 입력 필드가 있는지 확인
        const nameInput = await page.$('input[name="name"], #name');
        if (nameInput) {
            await nameInput.type('테스트유저');
        }

        await page.click('button[type="submit"], .submit-btn, .fortune-btn');
        await new Promise(resolve => setTimeout(resolve, 5000));

        const resultElement = await page.$('.fortune-result, .result-container, #result, .tarot-result');
        if (resultElement) {
            const resultText = await resultElement.evaluate(el => el.innerText);
            if (resultText && resultText.trim().length > 10) {
                result.details.apiCallSuccess = true;
                result.details.resultGenerated = true;
                console.log(`✅ 타로 결과 생성됨`);
                return true;
            }
        }

        return false;

    } catch (error) {
        console.log(`❌ 타로 운세 테스트 실패: ${error.message}`);
        result.errors.push(`타로 운세 테스트 실패: ${error.message}`);
        return false;
    }
}

async function testZodiacFortune(page, result) {
    try {
        console.log(`🔮 별자리 운세 테스트 중...`);

        // 별자리 선택
        const zodiacSelect = await page.$('select[name="zodiac"], #zodiac');
        if (zodiacSelect) {
            await zodiacSelect.select('aries'); // 양자리 선택
            console.log(`✅ 별자리 선택됨`);
        } else {
            // 라디오 버튼이나 다른 형태일 수 있음
            const zodiacInput = await page.$('input[value="aries"], .zodiac-aries');
            if (zodiacInput) {
                await zodiacInput.click();
            }
        }

        await page.click('button[type="submit"], .submit-btn, .fortune-btn');
        await new Promise(resolve => setTimeout(resolve, 5000));

        const resultElement = await page.$('.fortune-result, .result-container, #result, .zodiac-result');
        if (resultElement) {
            const resultText = await resultElement.evaluate(el => el.innerText);
            if (resultText && resultText.trim().length > 10) {
                result.details.apiCallSuccess = true;
                result.details.resultGenerated = true;
                console.log(`✅ 별자리 결과 생성됨`);
                return true;
            }
        }

        return false;

    } catch (error) {
        console.log(`❌ 별자리 운세 테스트 실패: ${error.message}`);
        result.errors.push(`별자리 운세 테스트 실패: ${error.message}`);
        return false;
    }
}

async function testZodiacAnimalFortune(page, result) {
    try {
        console.log(`🔮 띠별 운세 테스트 중...`);

        // 띠 선택
        const animalSelect = await page.$('select[name="zodiac-animal"], #zodiac-animal');
        if (animalSelect) {
            await animalSelect.select('tiger'); // 호랑이띠 선택
            console.log(`✅ 띠 선택됨`);
        } else {
            // 다른 형태의 선택 요소
            const animalInput = await page.$('input[value="tiger"], .animal-tiger');
            if (animalInput) {
                await animalInput.click();
            }
        }

        await page.click('button[type="submit"], .submit-btn, .fortune-btn');
        await new Promise(resolve => setTimeout(resolve, 5000));

        const resultElement = await page.$('.fortune-result, .result-container, #result, .animal-result');
        if (resultElement) {
            const resultText = await resultElement.evaluate(el => el.innerText);
            if (resultText && resultText.trim().length > 10) {
                result.details.apiCallSuccess = true;
                result.details.resultGenerated = true;
                console.log(`✅ 띠별 결과 생성됨`);
                return true;
            }
        }

        return false;

    } catch (error) {
        console.log(`❌ 띠별 운세 테스트 실패: ${error.message}`);
        result.errors.push(`띠별 운세 테스트 실패: ${error.message}`);
        return false;
    }
}

function generateReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, `live-fortune-test-report-${timestamp}.html`);
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    const successRate = ((successCount / totalCount) * 100).toFixed(1);

    let html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>doha.kr 운세 페이지 라이브 테스트 보고서</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .test-result { border: 1px solid #dee2e6; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .test-success { border-left: 5px solid #28a745; }
        .test-failure { border-left: 5px solid #dc3545; }
        .details { background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .screenshot { max-width: 300px; margin: 10px; border: 1px solid #ddd; }
        ul { margin: 5px 0; }
        li { margin: 2px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔮 doha.kr 운세 페이지 라이브 테스트 보고서</h1>
        <p><strong>테스트 일시:</strong> ${new Date().toLocaleString('ko-KR')}</p>
        <p><strong>테스트 사이트:</strong> https://doha.kr</p>
        <p><strong>성공률:</strong> <span class="${successRate >= 80 ? 'success' : 'error'}">${successCount}/${totalCount} (${successRate}%)</span></p>
    </div>

    <h2>📊 테스트 요약</h2>
    <ul>`;

    results.forEach(result => {
        html += `<li><strong>${result.name}:</strong> <span class="${result.success ? 'success' : 'error'}">${result.success ? '✅ 성공' : '❌ 실패'}</span></li>`;
    });

    html += `</ul>

    <h2>📝 상세 테스트 결과</h2>`;

    results.forEach((result, index) => {
        html += `
        <div class="test-result ${result.success ? 'test-success' : 'test-failure'}">
            <h3>${index + 1}. ${result.name} (${result.type})</h3>
            <p><strong>URL:</strong> <a href="${result.url}" target="_blank">${result.url}</a></p>
            <p><strong>결과:</strong> <span class="${result.success ? 'success' : 'error'}">${result.success ? '✅ 성공' : '❌ 실패'}</span></p>
            
            <div class="details">
                <h4>테스트 세부사항</h4>
                <ul>
                    <li>페이지 로드: ${result.details.pageLoaded ? '✅' : '❌'}</li>
                    <li>폼 발견: ${result.details.formFound ? '✅' : '❌'}</li>
                    <li>기능 테스트: ${result.details.functionTested ? '✅' : '❌'}</li>
                    <li>API 호출 성공: ${result.details.apiCallSuccess ? '✅' : '❌'}</li>
                    <li>결과 생성: ${result.details.resultGenerated ? '✅' : '❌'}</li>
                </ul>
            </div>`;

        if (result.details.jsErrors.length > 0) {
            html += `
            <div class="details">
                <h4 class="error">❌ JavaScript 오류 (${result.details.jsErrors.length}개)</h4>
                <ul>`;
            result.details.jsErrors.forEach(error => {
                html += `<li>${error}</li>`;
            });
            html += `</ul></div>`;
        }

        if (result.details.networkErrors.length > 0) {
            html += `
            <div class="details">
                <h4 class="error">🌐 네트워크 오류 (${result.details.networkErrors.length}개)</h4>
                <ul>`;
            result.details.networkErrors.forEach(error => {
                html += `<li>${error}</li>`;
            });
            html += `</ul></div>`;
        }

        if (result.warnings.length > 0) {
            html += `
            <div class="details">
                <h4 class="warning">⚠️ 경고 (${result.warnings.length}개)</h4>
                <ul>`;
            result.warnings.forEach(warning => {
                html += `<li>${warning}</li>`;
            });
            html += `</ul></div>`;
        }

        if (result.errors.length > 0) {
            html += `
            <div class="details">
                <h4 class="error">❌ 오류 (${result.errors.length}개)</h4>
                <ul>`;
            result.errors.forEach(error => {
                html += `<li>${error}</li>`;
            });
            html += `</ul></div>`;
        }

        html += `</div>`;
    });

    html += `
    <h2>🎯 권장사항</h2>
    <ul>`;

    const failedTests = results.filter(r => !r.success);
    if (failedTests.length > 0) {
        html += `<li><strong>실패한 테스트 수정:</strong> ${failedTests.map(t => t.name).join(', ')}</li>`;
    }

    const jsErrorCount = results.reduce((sum, r) => sum + r.details.jsErrors.length, 0);
    if (jsErrorCount > 0) {
        html += `<li><strong>JavaScript 오류 해결:</strong> 총 ${jsErrorCount}개의 오류 발견</li>`;
    }

    if (successRate < 100) {
        html += `<li><strong>API 연동 점검:</strong> fortune API 호출 및 응답 확인 필요</li>`;
    }

    html += `</ul>

    <footer style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <p><strong>테스트 도구:</strong> Puppeteer (Headless Chrome)</p>
        <p><strong>생성 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
        <p><strong>스크린샷 위치:</strong> ${screenshotDir}</p>
    </footer>
</body>
</html>`;

    fs.writeFileSync(reportPath, html, 'utf8');
    console.log(`\n📋 상세 보고서가 생성되었습니다: ${reportPath}`);
    return reportPath;
}

async function runLiveFortuneTests() {
    console.log('🚀 doha.kr 운세 페이지 라이브 테스트 시작');
    console.log('=' .repeat(60));

    const browser = await puppeteer.launch({
        headless: 'new', // 안정성을 위해 headless 모드 사용
        defaultViewport: { width: 1280, height: 720 },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-features=VizDisplayCompositor'
        ]
    });

    const page = await browser.newPage();
    
    // 한국어 설정
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
    });

    for (const pageConfig of fortunePages) {
        const result = await testFortunePage(browser, page, pageConfig);
        testResults.push(result);
        
        console.log(`\n결과: ${pageConfig.name} - ${result.success ? '✅ 성공' : '❌ 실패'}`);
        if (result.errors.length > 0) {
            console.log(`오류: ${result.errors.join(', ')}`);
        }
        
        // 페이지 간 간격
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await browser.close();

    // 보고서 생성
    const reportPath = generateReport(testResults);
    
    // 콘솔 요약 출력
    console.log('\n' + '='.repeat(60));
    console.log('🎯 테스트 완료 요약');
    console.log('='.repeat(60));
    
    const successCount = testResults.filter(r => r.success).length;
    const totalCount = testResults.length;
    console.log(`총 테스트: ${totalCount}개`);
    console.log(`성공: ${successCount}개`);
    console.log(`실패: ${totalCount - successCount}개`);
    console.log(`성공률: ${((successCount / totalCount) * 100).toFixed(1)}%`);
    
    console.log('\n📋 개별 결과:');
    testResults.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}: ${result.success ? '✅' : '❌'}`);
        if (!result.success && result.errors.length > 0) {
            console.log(`   오류: ${result.errors[0]}`);
        }
    });
    
    console.log(`\n📊 상세 보고서: ${reportPath}`);
    console.log(`📷 스크린샷: ${screenshotDir}`);
}

// 테스트 실행
runLiveFortuneTests().catch(console.error);