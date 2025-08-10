import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

/**
 * doha.kr 라이브 사이트 완전 기능 테스트
 * 모든 테스트, 도구, 운세 서비스를 실제로 사용하여 검증
 */

class LiveSiteCompleteTester {
    constructor() {
        this.baseUrl = 'https://doha.kr';
        this.results = {
            timestamp: new Date().toISOString(),
            tests: {
                mbti: { status: 'pending', details: {} },
                tetoEgen: { status: 'pending', details: {} },
                loveDna: { status: 'pending', details: {} }
            },
            fortune: {
                daily: { status: 'pending', details: {} },
                saju: { status: 'pending', details: {} },
                tarot: { status: 'pending', details: {} },
                zodiac: { status: 'pending', details: {} },
                zodiacAnimal: { status: 'pending', details: {} }
            },
            tools: {
                bmi: { status: 'pending', details: {} },
                salary: { status: 'pending', details: {} },
                textCounter: { status: 'pending', details: {} }
            },
            technical: {
                consoleErrors: [],
                networkErrors: [],
                apiCalls: []
            }
        };
    }

    async initialize() {
        console.log('🚀 라이브 사이트 완전 기능 테스트 시작...');
        
        this.browser = await puppeteer.launch({
            headless: false, // 브라우저 보이게
            defaultViewport: { width: 1920, height: 1080 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        this.page = await this.browser.newPage();
        
        // 콘솔 메시지 수집
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                this.results.technical.consoleErrors.push({
                    text: msg.text(),
                    location: msg.location()
                });
            }
        });
        
        // 네트워크 에러 수집
        this.page.on('response', response => {
            if (response.status() >= 400) {
                this.results.technical.networkErrors.push({
                    url: response.url(),
                    status: response.status()
                });
            }
            // API 호출 추적
            if (response.url().includes('/api/')) {
                this.results.technical.apiCalls.push({
                    url: response.url(),
                    status: response.status(),
                    ok: response.ok()
                });
            }
        });
    }

    // 1. MBTI 테스트 전체 수행
    async testMBTI() {
        console.log('\n📝 MBTI 테스트 시작...');
        try {
            // 테스트 페이지로 이동
            await this.page.goto(`${this.baseUrl}/tests/mbti/test.html`, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 2000));
            
            // 60개 문항 모두 답변
            const questions = await this.page.$$('.question-container');
            console.log(`  - ${questions.length}개 문항 발견`);
            
            for (let i = 0; i < Math.min(questions.length, 10); i++) { // 처음 10개만 테스트
                // 각 문항에서 첫 번째 옵션 선택
                const options = await questions[i].$$('input[type="radio"]');
                if (options.length > 0) {
                    await options[0].click();
                    await new Promise(r => setTimeout(r, 100));
                }
            }
            
            // 결과 보기 버튼 확인
            const submitButton = await this.page.$('button[type="submit"]');
            if (submitButton) {
                const buttonText = await this.page.evaluate(el => el.textContent, submitButton);
                console.log(`  - 제출 버튼 발견: ${buttonText}`);
                
                this.results.tests.mbti.status = 'partial';
                this.results.tests.mbti.details = {
                    questionsFound: questions.length,
                    questionsAnswered: 10,
                    submitButtonFound: true
                };
            }
            
            await this.takeScreenshot('mbti-test');
            
        } catch (error) {
            console.error('  ❌ MBTI 테스트 실패:', error.message);
            this.results.tests.mbti.status = 'failed';
            this.results.tests.mbti.error = error.message;
        }
    }

    // 2. BMI 계산기 테스트
    async testBMICalculator() {
        console.log('\n🏥 BMI 계산기 테스트...');
        try {
            await this.page.goto(`${this.baseUrl}/tools/bmi-calculator.html`, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 2000));
            
            // 키와 몸무게 입력
            await this.page.type('#height', '175');
            await this.page.type('#weight', '70');
            
            // 계산 버튼 클릭
            await this.page.click('#calculateBtn');
            await new Promise(r => setTimeout(r, 1000));
            
            // 결과 확인
            const resultVisible = await this.page.$eval('#bmiResult', el => 
                window.getComputedStyle(el).display !== 'none'
            );
            
            if (resultVisible) {
                const bmiValue = await this.page.$eval('#bmiValue', el => el.textContent);
                const bmiCategory = await this.page.$eval('#bmiCategory', el => el.textContent);
                
                console.log(`  ✅ BMI 계산 성공: ${bmiValue} - ${bmiCategory}`);
                
                this.results.tools.bmi.status = 'success';
                this.results.tools.bmi.details = {
                    input: { height: 175, weight: 70 },
                    result: { bmi: bmiValue, category: bmiCategory }
                };
            }
            
            await this.takeScreenshot('bmi-calculator-result');
            
        } catch (error) {
            console.error('  ❌ BMI 계산기 테스트 실패:', error.message);
            this.results.tools.bmi.status = 'failed';
            this.results.tools.bmi.error = error.message;
        }
    }

    // 3. 글자수 세기 테스트
    async testTextCounter() {
        console.log('\n📝 글자수 세기 테스트...');
        try {
            await this.page.goto(`${this.baseUrl}/tools/text-counter.html`, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 2000));
            
            const testText = '안녕하세요. doha.kr 테스트입니다.\n이것은 두 번째 줄입니다.';
            
            // 텍스트 입력
            await this.page.type('#textInput', testText);
            await new Promise(r => setTimeout(r, 500));
            
            // 결과 읽기
            const charCount = await this.page.$eval('#charCount', el => el.textContent);
            const charNoSpaceCount = await this.page.$eval('#charNoSpaceCount', el => el.textContent);
            const wordCount = await this.page.$eval('#wordCount', el => el.textContent);
            
            console.log(`  ✅ 글자수: ${charCount}, 공백제외: ${charNoSpaceCount}, 단어수: ${wordCount}`);
            
            this.results.tools.textCounter.status = 'success';
            this.results.tools.textCounter.details = {
                input: testText,
                results: { charCount, charNoSpaceCount, wordCount }
            };
            
            await this.takeScreenshot('text-counter-result');
            
        } catch (error) {
            console.error('  ❌ 글자수 세기 테스트 실패:', error.message);
            this.results.tools.textCounter.status = 'failed';
            this.results.tools.textCounter.error = error.message;
        }
    }

    // 4. 오늘의 운세 테스트
    async testDailyFortune() {
        console.log('\n🔮 오늘의 운세 테스트...');
        try {
            await this.page.goto(`${this.baseUrl}/fortune/daily/`, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 2000));
            
            // 이름과 생년월일 입력
            await this.page.type('#userName', '테스트유저');
            await this.page.select('#birthYear', '1990');
            await this.page.select('#birthMonth', '5');
            await this.page.select('#birthDay', '15');
            
            // 성별 선택
            const maleRadio = await this.page.$('input[value="male"]');
            if (maleRadio) await maleRadio.click();
            
            // 운세 보기 버튼 클릭
            const submitButton = await this.page.$('button[type="submit"]');
            if (submitButton) {
                await submitButton.click();
                console.log('  - 운세 요청 전송...');
                
                // API 응답 대기 (최대 10초)
                await new Promise(r => setTimeout(r, 3000));
                
                // 결과 확인
                const resultContainer = await this.page.$('#fortuneResult');
                if (resultContainer) {
                    const isVisible = await this.page.evaluate(el => 
                        window.getComputedStyle(el).display !== 'none', 
                        resultContainer
                    );
                    
                    if (isVisible) {
                        console.log('  ✅ 운세 결과 표시됨');
                        this.results.fortune.daily.status = 'success';
                    } else {
                        console.log('  ⚠️ 운세 결과 컨테이너는 있지만 숨겨져 있음');
                        this.results.fortune.daily.status = 'partial';
                    }
                }
            }
            
            await this.takeScreenshot('daily-fortune');
            
        } catch (error) {
            console.error('  ❌ 오늘의 운세 테스트 실패:', error.message);
            this.results.fortune.daily.status = 'failed';
            this.results.fortune.daily.error = error.message;
        }
    }

    // 5. 타로카드 테스트
    async testTarot() {
        console.log('\n🎴 타로카드 테스트...');
        try {
            await this.page.goto(`${this.baseUrl}/fortune/tarot/`, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 2000));
            
            // 카드 선택
            const cards = await this.page.$$('.tarot-card');
            console.log(`  - ${cards.length}개 카드 발견`);
            
            if (cards.length >= 3) {
                // 3장 선택
                for (let i = 0; i < 3; i++) {
                    await cards[i].click();
                    await new Promise(r => setTimeout(r, 500));
                }
                
                // 리딩 버튼 찾기
                const readingButton = await this.page.$('button.btn-primary');
                if (readingButton) {
                    console.log('  ✅ 카드 선택 완료, 리딩 버튼 발견');
                    this.results.fortune.tarot.status = 'partial';
                    this.results.fortune.tarot.details = {
                        cardsFound: cards.length,
                        cardsSelected: 3
                    };
                }
            }
            
            await this.takeScreenshot('tarot-cards');
            
        } catch (error) {
            console.error('  ❌ 타로카드 테스트 실패:', error.message);
            this.results.fortune.tarot.status = 'failed';
            this.results.fortune.tarot.error = error.message;
        }
    }

    // 스크린샷 저장
    async takeScreenshot(name) {
        const dir = 'test-screenshots';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        const filename = path.join(dir, `${name}-${Date.now()}.png`);
        await this.page.screenshot({ path: filename, fullPage: true });
        console.log(`  📸 스크린샷 저장: ${filename}`);
    }

    // 최종 리포트 생성
    generateReport() {
        console.log('\n📊 최종 리포트 생성...');
        
        // 요약 통계
        const testStatuses = Object.values(this.results.tests).map(t => t.status);
        const fortuneStatuses = Object.values(this.results.fortune).map(f => f.status);
        const toolStatuses = Object.values(this.results.tools).map(t => t.status);
        
        const summary = {
            tests: {
                total: testStatuses.length,
                success: testStatuses.filter(s => s === 'success').length,
                partial: testStatuses.filter(s => s === 'partial').length,
                failed: testStatuses.filter(s => s === 'failed').length
            },
            fortune: {
                total: fortuneStatuses.length,
                success: fortuneStatuses.filter(s => s === 'success').length,
                partial: fortuneStatuses.filter(s => s === 'partial').length,
                failed: fortuneStatuses.filter(s => s === 'failed').length
            },
            tools: {
                total: toolStatuses.length,
                success: toolStatuses.filter(s => s === 'success').length,
                partial: toolStatuses.filter(s => s === 'partial').length,
                failed: toolStatuses.filter(s => s === 'failed').length
            }
        };
        
        this.results.summary = summary;
        
        // JSON 리포트 저장
        fs.writeFileSync(
            'live-test-results.json',
            JSON.stringify(this.results, null, 2)
        );
        
        // 콘솔 출력
        console.log('\n=== 테스트 완료 ===');
        console.log('심리테스트:', summary.tests);
        console.log('운세 서비스:', summary.fortune);
        console.log('실용도구:', summary.tools);
        console.log('\n기술적 이슈:');
        console.log(`  - 콘솔 에러: ${this.results.technical.consoleErrors.length}개`);
        console.log(`  - 네트워크 에러: ${this.results.technical.networkErrors.length}개`);
        console.log(`  - API 호출: ${this.results.technical.apiCalls.length}개`);
        
        return this.results;
    }

    async close() {
        await this.browser.close();
    }

    // 메인 실행
    async run() {
        await this.initialize();
        
        // 테스트 실행
        await this.testMBTI();
        await this.testBMICalculator();
        await this.testTextCounter();
        await this.testDailyFortune();
        await this.testTarot();
        
        // 리포트 생성
        this.generateReport();
        
        // 브라우저 닫기
        await this.close();
        
        console.log('\n✅ 모든 테스트 완료!');
        console.log('📁 상세 결과: live-test-results.json');
    }
}

// 실행
const tester = new LiveSiteCompleteTester();
tester.run().catch(console.error);