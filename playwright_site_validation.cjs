const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class SiteValidator {
    constructor() {
        this.baseUrl = 'https://doha.kr';
        this.results = {
            timestamp: new Date().toISOString(),
            pages: {},
            summary: {
                totalPages: 0,
                passed: 0,
                failed: 0,
                issues: []
            }
        };
    }

    async init() {
        this.browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.context = await this.browser.newContext({
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });
    }

    async checkPage(pagePath, pageName) {
        const url = `${this.baseUrl}${pagePath}`;
        const pageResult = {
            url,
            name: pageName,
            status: 'pass',
            issues: [],
            consoleErrors: [],
            networkErrors: [],
            loadTime: 0,
            navigationOk: false,
            footerOk: false,
            functionality: {},
            visualIssues: []
        };

        const page = await this.context.newPage();

        try {
            // 콘솔 에러 수집
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    pageResult.consoleErrors.push(msg.text());
                }
            });

            // 네트워크 에러 수집
            page.on('requestfailed', request => {
                pageResult.networkErrors.push({
                    url: request.url(),
                    failure: request.failure()?.errorText || 'Unknown error'
                });
            });

            // 페이지 로드
            const startTime = Date.now();
            await page.goto(url, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            pageResult.loadTime = (Date.now() - startTime) / 1000;

            // 추가 대기
            await page.waitForTimeout(2000);

            // 네비게이션 체크
            try {
                const nav = await page.$('nav');
                if (nav) {
                    const isVisible = await nav.isVisible();
                    pageResult.navigationOk = isVisible;
                    if (!isVisible) {
                        pageResult.issues.push('네비게이션이 표시되지 않음');
                    }
                } else {
                    pageResult.issues.push('네비게이션 요소를 찾을 수 없음');
                }
            } catch (e) {
                pageResult.issues.push(`네비게이션 체크 실패: ${e.message}`);
            }

            // 푸터 체크
            try {
                const footer = await page.$('footer');
                if (footer) {
                    const isVisible = await footer.isVisible();
                    pageResult.footerOk = isVisible;
                    if (!isVisible) {
                        pageResult.issues.push('푸터가 표시되지 않음');
                    }
                } else {
                    pageResult.issues.push('푸터 요소를 찾을 수 없음');
                }
            } catch (e) {
                pageResult.issues.push(`푸터 체크 실패: ${e.message}`);
            }

            // 페이지별 특수 검증
            if (pagePath.includes('fortune')) {
                await this.checkFortunePage(page, pageResult);
            } else if (pagePath.includes('mbti/test')) {
                await this.checkMbtiTest(page, pageResult);
            } else if (pagePath.includes('tarot')) {
                await this.checkTarotPage(page, pageResult);
            } else if (pagePath.includes('saju')) {
                await this.checkSajuPage(page, pageResult);
            } else if (pagePath.includes('test')) {
                await this.checkTestPage(page, pageResult);
            }

            // 깨진 이미지 체크
            const brokenImages = await page.evaluate(() => {
                const images = Array.from(document.images);
                return images
                    .filter(img => !img.complete || img.naturalHeight === 0)
                    .map(img => img.src);
            });
            if (brokenImages.length > 0) {
                pageResult.issues.push(`깨진 이미지 ${brokenImages.length}개 발견`);
                pageResult.visualIssues.push(...brokenImages.slice(0, 5));
            }

            // 스크린샷 저장
            const screenshotDir = 'validation_screenshots';
            await fs.mkdir(screenshotDir, { recursive: true });
            const screenshotPath = path.join(screenshotDir, `${pageName.replace(/ /g, '_')}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            pageResult.screenshot = screenshotPath;

            // 모바일 뷰 스크린샷
            await page.setViewportSize({ width: 375, height: 667 });
            const mobileScreenshotPath = path.join(screenshotDir, `${pageName.replace(/ /g, '_')}_mobile.png`);
            await page.screenshot({ path: mobileScreenshotPath, fullPage: true });
            pageResult.mobileScreenshot = mobileScreenshotPath;

        } catch (error) {
            pageResult.status = 'fail';
            pageResult.issues.push(`페이지 로드 실패: ${error.message}`);
            console.error(`Error checking ${url}:`, error);
        } finally {
            await page.close();
        }

        // 결과 판정
        if (pageResult.issues.length > 0 || pageResult.consoleErrors.length > 0) {
            pageResult.status = 'fail';
            this.results.summary.failed++;
        } else {
            this.results.summary.passed++;
        }

        this.results.pages[pageName] = pageResult;
        this.results.summary.totalPages++;

        // 콘솔 에러를 이슈에 추가
        if (pageResult.consoleErrors.length > 0) {
            pageResult.issues.push(`콘솔 에러 ${pageResult.consoleErrors.length}개 발견`);
        }

        return pageResult;
    }

    async checkFortunePage(page, pageResult) {
        try {
            // 폼 요소 체크
            const forms = await page.$$('form');
            pageResult.functionality.formsFound = forms.length;

            // 입력 필드 체크
            const inputs = await page.$$('input, select');
            pageResult.functionality.inputFields = inputs.length;

            // 버튼 체크
            const buttons = await page.$$('button, input[type="submit"]');
            pageResult.functionality.buttons = buttons.length;

            if (buttons.length === 0) {
                pageResult.issues.push('제출 버튼을 찾을 수 없음');
            }

            // 실제 폼 제출 테스트 (운세 페이지의 경우)
            if (forms.length > 0 && pageResult.url.includes('daily')) {
                try {
                    // 이름 입력
                    const nameInput = await page.$('input[name="name"], input[type="text"]');
                    if (nameInput) {
                        await nameInput.fill('테스트');
                        
                        // 제출 버튼 클릭
                        const submitButton = await page.$('button[type="submit"], input[type="submit"]');
                        if (submitButton) {
                            await submitButton.click();
                            
                            // 결과 대기
                            await page.waitForTimeout(2000);
                            
                            // 결과 요소 체크
                            const resultElement = await page.$('.result, #result, .fortune-result');
                            if (resultElement) {
                                pageResult.functionality.formSubmissionWorks = true;
                            } else {
                                pageResult.issues.push('폼 제출 후 결과가 표시되지 않음');
                            }
                        }
                    }
                } catch (e) {
                    pageResult.issues.push(`폼 제출 테스트 실패: ${e.message}`);
                }
            }

        } catch (e) {
            pageResult.issues.push(`운세 페이지 기능 검증 실패: ${e.message}`);
        }
    }

    async checkMbtiTest(page, pageResult) {
        try {
            // 질문 요소 체크
            const questions = await page.$$('.question, .question-container, .mbti-question');
            pageResult.functionality.questionsFound = questions.length;

            // 선택지 체크
            const options = await page.$$('input[type="radio"], .option, .choice, button.option');
            pageResult.functionality.optionsFound = options.length;

            // 진행 버튼 체크
            const nextButtons = await page.$$('button.next, #nextBtn, button:has-text("다음")');
            pageResult.functionality.navigationButtons = nextButtons.length;

            if (questions.length === 0) {
                pageResult.issues.push('MBTI 질문을 찾을 수 없음');
            }

            // 실제 테스트 진행 시도
            if (options.length > 0) {
                try {
                    const firstOption = options[0];
                    await firstOption.click();
                    await page.waitForTimeout(500);
                    
                    // 다음 버튼 클릭 시도
                    if (nextButtons.length > 0) {
                        await nextButtons[0].click();
                        await page.waitForTimeout(1000);
                        
                        // 다음 질문이 나타났는지 확인
                        const newQuestions = await page.$$('.question:visible, .question-container:visible');
                        if (newQuestions.length > 0) {
                            pageResult.functionality.navigationWorks = true;
                        }
                    }
                } catch (e) {
                    pageResult.issues.push(`MBTI 테스트 진행 시뮬레이션 실패: ${e.message}`);
                }
            }

        } catch (e) {
            pageResult.issues.push(`MBTI 테스트 기능 검증 실패: ${e.message}`);
        }
    }

    async checkTarotPage(page, pageResult) {
        try {
            // 카드 요소 체크
            const cards = await page.$$('.card, .tarot-card, .card-item');
            pageResult.functionality.cardsFound = cards.length;

            // 카드 선택 버튼 체크
            const cardButtons = await page.$$('.card-select, button.card, .card-button');
            pageResult.functionality.cardButtons = cardButtons.length;

            // 카드 뽑기 버튼 체크
            const drawButton = await page.$('button:has-text("카드 뽑기"), button:has-text("타로 시작")');
            if (drawButton) {
                pageResult.functionality.drawButtonFound = true;
            }

            if (cards.length === 0 && cardButtons.length === 0) {
                pageResult.issues.push('타로 카드 요소를 찾을 수 없음');
            }

        } catch (e) {
            pageResult.issues.push(`타로 페이지 기능 검증 실패: ${e.message}`);
        }
    }

    async checkSajuPage(page, pageResult) {
        try {
            // 생년월일 입력 필드 체크
            const dateInputs = await page.$$('input[type="date"], select[name*="year"], select[name*="month"], select[name*="day"]');
            pageResult.functionality.dateInputs = dateInputs.length;

            // 시간 선택 체크
            const timeInputs = await page.$$('select[name*="hour"], input[name*="time"], select[name*="time"]');
            pageResult.functionality.timeInputs = timeInputs.length;

            // 성별 선택 체크
            const genderInputs = await page.$$('input[name*="gender"], select[name*="gender"], input[type="radio"][name="gender"]');
            pageResult.functionality.genderInputs = genderInputs.length;

            // 음력/양력 선택 체크
            const calendarInputs = await page.$$('input[name*="calendar"], select[name*="calendar"], input[name*="lunar"]');
            pageResult.functionality.calendarInputs = calendarInputs.length;

            if (dateInputs.length === 0) {
                pageResult.issues.push('생년월일 입력 필드를 찾을 수 없음');
            }

        } catch (e) {
            pageResult.issues.push(`사주 페이지 기능 검증 실패: ${e.message}`);
        }
    }

    async checkTestPage(page, pageResult) {
        try {
            // 시작 버튼 체크
            const startButtons = await page.$$('button:has-text("시작"), button:has-text("테스트 시작"), a:has-text("시작")');
            pageResult.functionality.startButtons = startButtons.length;

            // 설명 텍스트 체크
            const descriptions = await page.$$('.description, .test-description, .intro');
            pageResult.functionality.hasDescription = descriptions.length > 0;

        } catch (e) {
            pageResult.issues.push(`테스트 페이지 기능 검증 실패: ${e.message}`);
        }
    }

    async runValidation() {
        const pagesToCheck = [
            ['/', '홈페이지'],
            ['/fortune/', '운세 메인'],
            ['/fortune/daily/', '오늘의 운세'],
            ['/fortune/saju/', '사주 운세'],
            ['/fortune/tarot/', '타로 운세'],
            ['/fortune/zodiac/', '별자리 운세'],
            ['/fortune/zodiac-animal/', '띠 운세'],
            ['/tests/', '테스트 메인'],
            ['/tests/mbti/', 'MBTI 테스트 소개'],
            ['/tests/mbti/test', 'MBTI 테스트'],
            ['/tests/love-dna/', '연애 DNA 테스트 소개'],
            ['/tests/love-dna/test', '연애 DNA 테스트'],
            ['/tests/teto-egen/', '테토이젠 테스트 소개'],
            ['/tests/teto-egen/test', '테토이젠 테스트'],
            ['/tools/', '도구 모음'],
            ['/tools/bmi-calculator', 'BMI 계산기'],
            ['/tools/salary-calculator', '연봉 계산기'],
            ['/tools/text-counter', '글자수 세기'],
            ['/about/', '소개'],
            ['/contact/', '문의하기'],
            ['/faq/', '자주 묻는 질문'],
            ['/privacy/', '개인정보처리방침'],
            ['/terms/', '이용약관']
        ];

        console.log(`검증 시작: ${pagesToCheck.length}개 페이지`);

        for (const [pagePath, pageName] of pagesToCheck) {
            console.log(`검증 중: ${pageName} (${pagePath})`);
            await this.checkPage(pagePath, pageName);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 서버 부하 방지
        }

        // 주요 이슈 요약
        for (const [pageName, result] of Object.entries(this.results.pages)) {
            if (result.issues.length > 0) {
                result.issues.forEach(issue => {
                    this.results.summary.issues.push(`${pageName}: ${issue}`);
                });
            }
        }

        // 결과 저장
        await fs.writeFile(
            'playwright_validation_report.json',
            JSON.stringify(this.results, null, 2),
            'utf-8'
        );

        await this.generateReport();
    }

    async generateReport() {
        let report = `# doha.kr 웹사이트 검증 보고서

생성 시간: ${this.results.timestamp}

## 요약
- 총 페이지: ${this.results.summary.totalPages}
- 통과: ${this.results.summary.passed}
- 실패: ${this.results.summary.failed}

## 주요 문제점
`;

        if (this.results.summary.issues.length > 0) {
            const uniqueIssues = [...new Set(this.results.summary.issues)];
            uniqueIssues.slice(0, 20).forEach(issue => {
                report += `- ${issue}\n`;
            });
        } else {
            report += '- 발견된 문제 없음\n';
        }

        report += '\n## 페이지별 상세 결과\n';

        for (const [pageName, result] of Object.entries(this.results.pages)) {
            report += `\n### ${pageName}\n`;
            report += `- URL: ${result.url}\n`;
            report += `- 상태: ${result.status}\n`;
            report += `- 로드 시간: ${result.loadTime.toFixed(2)}초\n`;
            report += `- 네비게이션: ${result.navigationOk ? '✓' : '✗'}\n`;
            report += `- 푸터: ${result.footerOk ? '✓' : '✗'}\n`;

            if (result.issues.length > 0) {
                report += '- 문제점:\n';
                result.issues.forEach(issue => {
                    report += `  - ${issue}\n`;
                });
            }

            if (result.consoleErrors.length > 0) {
                report += '- 콘솔 에러:\n';
                result.consoleErrors.slice(0, 5).forEach(error => {
                    report += `  - ${error}\n`;
                });
            }

            if (Object.keys(result.functionality).length > 0) {
                report += '- 기능 요소:\n';
                for (const [key, value] of Object.entries(result.functionality)) {
                    report += `  - ${key}: ${value}\n`;
                }
            }
        }

        await fs.writeFile('playwright_validation_report.md', report, 'utf-8');
        console.log('검증 완료. 보고서가 생성되었습니다.');
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

async function main() {
    const validator = new SiteValidator();
    try {
        await validator.init();
        await validator.runValidation();
    } catch (error) {
        console.error('Validation error:', error);
    } finally {
        await validator.cleanup();
    }
}

main().catch(console.error);