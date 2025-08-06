import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 스크린샷 저장 디렉토리 생성
const screenshotDir = './screenshots';

async function ensureScreenshotDir() {
    try {
        await fs.mkdir(screenshotDir, { recursive: true });
    } catch (error) {
        // 디렉토리가 이미 존재하면 무시
    }
}

class PsychologyTestValidator {
    constructor() {
        this.browser = null;
        this.results = {
            'teto-egen': { status: 'pending', errors: [], screenshots: [] },
            'love-dna': { status: 'pending', errors: [], screenshots: [] },
            'mbti': { status: 'pending', errors: [], screenshots: [] }
        };
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: false, // 테스트 진행 상황을 볼 수 있도록
            defaultViewport: { width: 1280, height: 720 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async captureScreenshot(page, testName, step) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${testName}-${step}-${timestamp}.png`;
        const filepath = path.join(screenshotDir, filename);
        
        await page.screenshot({ 
            path: filepath, 
            fullPage: true 
        });
        
        this.results[testName].screenshots.push({
            step: step,
            filename: filename,
            path: filepath
        });
        
        return filename;
    }

    async validateTetoEgenTest() {
        console.log('🔍 테토-에겐 테스트 검증 시작...');
        const page = await this.browser.newPage();
        
        try {
            // 콘솔 오류 모니터링
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            page.on('pageerror', error => {
                consoleErrors.push(`Page Error: ${error.message}`);
            });

            // 1. 페이지 로딩
            await page.goto('http://localhost:3000/tests/teto-egen/test.html', { 
                waitUntil: 'networkidle0',
                timeout: 30000 
            });
            
            await this.captureScreenshot(page, 'teto-egen', '01-page-load');

            // 페이지 로딩 시 JavaScript 오류 확인
            if (consoleErrors.length > 0) {
                this.results['teto-egen'].errors.push(...consoleErrors);
            }

            // 2. 시작 버튼 클릭
            await page.waitForSelector('.start-button, #start-button, button:contains("시작")', { timeout: 10000 });
            await page.click('.start-button, #start-button, button');
            await page.waitForTimeout(2000);
            
            await this.captureScreenshot(page, 'teto-egen', '02-start-clicked');

            // 3. 첫 질문 표시 확인
            const firstQuestion = await page.$('.question, .question-container, .test-question');
            if (!firstQuestion) {
                this.results['teto-egen'].errors.push('첫 질문이 표시되지 않음');
            }

            // 4. 질문 진행 (최대 10개 질문 시뮬레이션)
            let questionCount = 0;
            const maxQuestions = 10;
            
            while (questionCount < maxQuestions) {
                try {
                    // 선택지 찾기
                    const options = await page.$$('.option, .answer-option, button[data-value], .choice-button');
                    if (options.length === 0) {
                        console.log('선택지를 찾을 수 없음. 테스트 완료 확인...');
                        break;
                    }

                    // 첫 번째 선택지 클릭
                    await options[0].click();
                    await page.waitForTimeout(1500);
                    
                    questionCount++;
                    console.log(`질문 ${questionCount} 완료`);
                    
                    if (questionCount % 3 === 0) {
                        await this.captureScreenshot(page, 'teto-egen', `03-question-${questionCount}`);
                    }
                } catch (error) {
                    console.log('질문 진행 중 오류 또는 완료:', error.message);
                    break;
                }
            }

            // 5. 결과 화면 확인
            await page.waitForTimeout(3000);
            const resultElements = await page.$$('.result, .test-result, .result-container, .final-result');
            
            if (resultElements.length === 0) {
                this.results['teto-egen'].errors.push('결과 화면이 표시되지 않음');
            }
            
            await this.captureScreenshot(page, 'teto-egen', '04-final-result');

            // 최종 콘솔 오류 수집
            if (consoleErrors.length > 0) {
                this.results['teto-egen'].errors.push(...consoleErrors);
            }

            this.results['teto-egen'].status = this.results['teto-egen'].errors.length === 0 ? 'success' : 'failed';
            console.log(`✅ 테토-에겐 테스트 검증 완료: ${this.results['teto-egen'].status}`);

        } catch (error) {
            this.results['teto-egen'].status = 'failed';
            this.results['teto-egen'].errors.push(`테스트 실행 오류: ${error.message}`);
            console.error('❌ 테토-에겐 테스트 실패:', error.message);
        } finally {
            await page.close();
        }
    }

    async validateLoveDnaTest() {
        console.log('🔍 러브 DNA 테스트 검증 시작...');
        const page = await this.browser.newPage();
        
        try {
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            page.on('pageerror', error => {
                consoleErrors.push(`Page Error: ${error.message}`);
            });

            // 1. 페이지 로딩
            await page.goto('http://localhost:3000/tests/love-dna/test.html', { 
                waitUntil: 'networkidle0',
                timeout: 30000 
            });
            
            await this.captureScreenshot(page, 'love-dna', '01-page-load');

            // 2. 시작 버튼 클릭
            await page.waitForSelector('.start-button, #start-button, button:contains("시작")', { timeout: 10000 });
            await page.click('.start-button, #start-button, button');
            await page.waitForTimeout(2000);
            
            await this.captureScreenshot(page, 'love-dna', '02-start-clicked');

            // 3. 5개 축 질문 진행
            let axisCount = 0;
            const maxAxis = 5;
            
            while (axisCount < maxAxis) {
                try {
                    const options = await page.$$('.option, .answer-option, button[data-value], .choice-button');
                    if (options.length === 0) {
                        console.log('선택지를 찾을 수 없음. 다음 축 또는 완료 확인...');
                        break;
                    }

                    // 랜덤 선택지 클릭 (러브 DNA는 스펙트럼 형태)
                    const randomOption = Math.floor(Math.random() * options.length);
                    await options[randomOption].click();
                    await page.waitForTimeout(1500);
                    
                    axisCount++;
                    console.log(`축 ${axisCount} 완료`);
                    
                    await this.captureScreenshot(page, 'love-dna', `03-axis-${axisCount}`);
                } catch (error) {
                    console.log('축 진행 중 오류 또는 완료:', error.message);
                    break;
                }
            }

            // 4. DNA 유형 결과 확인
            await page.waitForTimeout(3000);
            const dnaResult = await page.$('.dna-type, .result-type, .love-dna-result, .final-result');
            
            if (!dnaResult) {
                this.results['love-dna'].errors.push('DNA 유형 결과가 표시되지 않음');
            }
            
            await this.captureScreenshot(page, 'love-dna', '04-dna-result');

            if (consoleErrors.length > 0) {
                this.results['love-dna'].errors.push(...consoleErrors);
            }

            this.results['love-dna'].status = this.results['love-dna'].errors.length === 0 ? 'success' : 'failed';
            console.log(`✅ 러브 DNA 테스트 검증 완료: ${this.results['love-dna'].status}`);

        } catch (error) {
            this.results['love-dna'].status = 'failed';
            this.results['love-dna'].errors.push(`테스트 실행 오류: ${error.message}`);
            console.error('❌ 러브 DNA 테스트 실패:', error.message);
        } finally {
            await page.close();
        }
    }

    async validateMbtiTest() {
        console.log('🔍 MBTI 테스트 검증 시작...');
        const page = await this.browser.newPage();
        
        try {
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            page.on('pageerror', error => {
                consoleErrors.push(`Page Error: ${error.message}`);
            });

            // 1. 페이지 로딩
            await page.goto('http://localhost:3000/tests/mbti/test.html', { 
                waitUntil: 'networkidle0',
                timeout: 30000 
            });
            
            await this.captureScreenshot(page, 'mbti', '01-page-load');

            // 2. 시작 버튼 클릭
            await page.waitForSelector('.start-button, #start-button, button:contains("시작")', { timeout: 10000 });
            await page.click('.start-button, #start-button, button');
            await page.waitForTimeout(2000);
            
            await this.captureScreenshot(page, 'mbti', '02-start-clicked');

            // 3. 60개 질문 진행 (빠른 테스트를 위해 15개만 시뮬레이션)
            let questionCount = 0;
            const maxQuestions = 15; // 실제 60개 대신 샘플링
            
            while (questionCount < maxQuestions) {
                try {
                    const options = await page.$$('.option, .answer-option, button[data-value], .choice-button, .mbti-option');
                    if (options.length === 0) {
                        console.log('선택지를 찾을 수 없음. 테스트 완료 확인...');
                        break;
                    }

                    // 랜덤 선택지 클릭 (MBTI는 보통 2-5개 선택지)
                    const randomOption = Math.floor(Math.random() * options.length);
                    await options[randomOption].click();
                    await page.waitForTimeout(1000);
                    
                    questionCount++;
                    console.log(`MBTI 질문 ${questionCount} 완료`);
                    
                    if (questionCount % 5 === 0) {
                        await this.captureScreenshot(page, 'mbti', `03-question-${questionCount}`);
                    }
                } catch (error) {
                    console.log('MBTI 질문 진행 중 오류 또는 완료:', error.message);
                    break;
                }
            }

            // 4. MBTI 유형 결과 확인
            await page.waitForTimeout(3000);
            const mbtiResult = await page.$('.mbti-type, .result-type, .mbti-result, .personality-type, .final-result');
            
            if (!mbtiResult) {
                this.results['mbti'].errors.push('MBTI 유형 결과가 표시되지 않음');
            }
            
            await this.captureScreenshot(page, 'mbti', '04-mbti-result');

            if (consoleErrors.length > 0) {
                this.results['mbti'].errors.push(...consoleErrors);
            }

            this.results['mbti'].status = this.results['mbti'].errors.length === 0 ? 'success' : 'failed';
            console.log(`✅ MBTI 테스트 검증 완료: ${this.results['mbti'].status}`);

        } catch (error) {
            this.results['mbti'].status = 'failed';
            this.results['mbti'].errors.push(`테스트 실행 오류: ${error.message}`);
            console.error('❌ MBTI 테스트 실패:', error.message);
        } finally {
            await page.close();
        }
    }

    async generateReport() {
        console.log('\n📊 심리테스트 검증 보고서');
        console.log('='.repeat(50));
        
        let totalPassed = 0;
        let totalFailed = 0;

        for (const [testName, result] of Object.entries(this.results)) {
            const status = result.status === 'success' ? '✅ 통과' : '❌ 실패';
            const koreanName = {
                'teto-egen': '테토-에겐 테스트',
                'love-dna': '러브 DNA 테스트',
                'mbti': 'MBTI 테스트'
            }[testName];

            console.log(`\n${koreanName}: ${status}`);
            
            if (result.errors.length > 0) {
                console.log('  발견된 오류:');
                result.errors.forEach(error => {
                    console.log(`    - ${error}`);
                });
                totalFailed++;
            } else {
                totalPassed++;
            }
            
            if (result.screenshots.length > 0) {
                console.log('  캡처된 스크린샷:');
                result.screenshots.forEach(screenshot => {
                    console.log(`    - ${screenshot.step}: ${screenshot.filename}`);
                });
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`📈 전체 결과: 통과 ${totalPassed}개, 실패 ${totalFailed}개`);
        console.log(`📷 스크린샷 저장 위치: ${path.resolve(screenshotDir)}`);
        
        return {
            summary: {
                passed: totalPassed,
                failed: totalFailed,
                total: totalPassed + totalFailed
            },
            details: this.results
        };
    }

    async runAllValidations() {
        await this.init();
        await ensureScreenshotDir();
        
        try {
            // 병렬 실행하지 않고 순차 실행 (리소스 절약)
            await this.validateTetoEgenTest();
            await this.validateLoveDnaTest();
            await this.validateMbtiTest();
            
            return await this.generateReport();
        } finally {
            await this.cleanup();
        }
    }
}

// 실행
async function main() {
    console.log('🚀 심리테스트 자동화 검증 시작');
    console.log('⚠️  로컬 서버가 http://localhost:3000에서 실행 중인지 확인하세요');
    
    const validator = new PsychologyTestValidator();
    
    try {
        const report = await validator.runAllValidations();
        
        // JSON 보고서 저장
        const reportPath = './psychology-test-validation-report.json';
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`\n📄 상세 보고서 저장: ${path.resolve(reportPath)}`);
        
    } catch (error) {
        console.error('❌ 검증 프로세스 실패:', error);
        process.exit(1);
    }
}

// 스크립트 직접 실행 시
if (import.meta.url.startsWith('file:') && process.argv.length > 1) {
    main();
}

export default PsychologyTestValidator;