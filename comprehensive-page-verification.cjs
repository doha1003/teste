const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ComprehensivePageVerification {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            summary: {
                totalPages: 0,
                passedPages: 0,
                failedPages: 0,
                criticalIssues: 0,
                warnings: 0
            },
            pageResults: {},
            criticalFlows: {},
            overallHealth: 'unknown'
        };
        
        this.testPages = [
            // 심리테스트 페이지 (최우선)
            { name: 'MBTI 테스트 소개', url: 'tests/mbti/index.html', category: 'psychology', priority: 'critical' },
            { name: 'MBTI 테스트 실행', url: 'tests/mbti/test.html', category: 'psychology', priority: 'critical' },
            { name: '테토-에겐 테스트 소개', url: 'tests/teto-egen/index.html', category: 'psychology', priority: 'critical' },
            { name: '테토-에겐 테스트 실행', url: 'tests/teto-egen/test.html', category: 'psychology', priority: 'critical' },
            { name: '러브 DNA 테스트 소개', url: 'tests/love-dna/index.html', category: 'psychology', priority: 'critical' },
            { name: '러브 DNA 테스트 실행', url: 'tests/love-dna/test.html', category: 'psychology', priority: 'critical' },
            
            // 메인 페이지들
            { name: '홈페이지', url: 'index.html', category: 'main', priority: 'high' },
            { name: '심리테스트 메인', url: 'tests/index.html', category: 'main', priority: 'high' },
            { name: '실용도구 메인', url: 'tools/index.html', category: 'main', priority: 'high' },
            { name: 'AI 운세 메인', url: 'fortune/index.html', category: 'main', priority: 'high' },
            
            // 운세 서비스
            { name: '오늘의 운세', url: 'fortune/daily/index.html', category: 'fortune', priority: 'medium' },
            { name: '사주 운세', url: 'fortune/saju/index.html', category: 'fortune', priority: 'medium' },
            { name: '타로 운세', url: 'fortune/tarot/index.html', category: 'fortune', priority: 'medium' },
            { name: '띠별 운세', url: 'fortune/zodiac-animal/index.html', category: 'fortune', priority: 'medium' },
            { name: '별자리 운세', url: 'fortune/zodiac/index.html', category: 'fortune', priority: 'medium' },
            
            // 실용도구
            { name: 'BMI 계산기', url: 'tools/bmi-calculator.html', category: 'tools', priority: 'medium' },
            { name: '연봉 계산기', url: 'tools/salary-calculator.html', category: 'tools', priority: 'medium' },
            { name: '글자수 세기', url: 'tools/text-counter.html', category: 'tools', priority: 'medium' },
            
            // 기타 페이지
            { name: '소개', url: 'about/index.html', category: 'info', priority: 'low' },
            { name: '연락처', url: 'contact/index.html', category: 'info', priority: 'low' },
            { name: 'FAQ', url: 'faq/index.html', category: 'info', priority: 'low' },
            { name: '개인정보처리방침', url: 'privacy/index.html', category: 'legal', priority: 'low' },
            { name: '이용약관', url: 'terms/index.html', category: 'legal', priority: 'low' },
            { name: '404 오류', url: '404.html', category: 'error', priority: 'low' },
            { name: '오프라인', url: 'offline.html', category: 'pwa', priority: 'low' },
        ];
        
        this.baseUrl = 'http://localhost:3000';
    }

    async init() {
        console.log('🚀 종합 페이지 검증 시작...');
        
        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1280, height: 720 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        this.page = await this.browser.newPage();
        
        // 한국어 설정
        await this.page.setExtraHTTPHeaders({
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
        });
        
        return this;
    }

    async verifyAllPages() {
        console.log(`📋 총 ${this.testPages.length}개 페이지 검증 시작`);
        
        for (const pageInfo of this.testPages) {
            try {
                console.log(`\n🔍 검증 중: ${pageInfo.name} (${pageInfo.priority})`);
                const result = await this.verifyPage(pageInfo);
                this.results.pageResults[pageInfo.name] = result;
                
                this.results.summary.totalPages++;
                if (result.status === 'pass') {
                    this.results.summary.passedPages++;
                } else {
                    this.results.summary.failedPages++;
                }
                
                this.results.summary.criticalIssues += result.criticalIssues || 0;
                this.results.summary.warnings += result.warnings || 0;
                
                // 잠시 대기 (서버 부하 방지)
                await this.page.waitForTimeout(500);
                
            } catch (error) {
                console.error(`❌ ${pageInfo.name} 검증 실패:`, error.message);
                this.results.pageResults[pageInfo.name] = {
                    status: 'error',
                    url: pageInfo.url,
                    error: error.message,
                    criticalIssues: 1,
                    warnings: 0
                };
                this.results.summary.totalPages++;
                this.results.summary.failedPages++;
                this.results.summary.criticalIssues++;
            }
        }
        
        await this.verifyPsychologyTestFlows();
        this.calculateOverallHealth();
    }

    async verifyPage(pageInfo) {
        const fullUrl = `${this.baseUrl}/${pageInfo.url}`;
        const result = {
            name: pageInfo.name,
            url: pageInfo.url,
            category: pageInfo.category,
            priority: pageInfo.priority,
            status: 'unknown',
            loadTime: 0,
            errors: [],
            warnings: [],
            criticalIssues: 0,
            checks: {
                pageLoads: false,
                cssApplied: false,
                jsLoaded: false,
                navigation: false,
                mobileMenu: false,
                designSystem: false,
                interactions: false
            }
        };

        const startTime = Date.now();
        
        try {
            // 콘솔 에러 수집
            const consoleErrors = [];
            this.page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });
            
            // 네트워크 실패 수집
            const networkErrors = [];
            this.page.on('requestfailed', request => {
                networkErrors.push(`${request.url()} - ${request.failure().errorText}`);
            });

            // 페이지 로드
            const response = await this.page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 10000 });
            result.loadTime = Date.now() - startTime;
            result.checks.pageLoads = response && response.status() < 400;
            
            if (!result.checks.pageLoads) {
                result.errors.push(`페이지 로드 실패: ${response ? response.status() : 'No response'}`);
                result.criticalIssues++;
            }

            // CSS 적용 확인
            const hasStyles = await this.page.evaluate(() => {
                const body = document.body;
                const computedStyle = window.getComputedStyle(body);
                return computedStyle.fontFamily !== 'Times' && computedStyle.margin !== '8px';
            });
            result.checks.cssApplied = hasStyles;
            if (!hasStyles) {
                result.warnings.push('CSS가 제대로 적용되지 않음');
            }

            // Linear.app 디자인 시스템 확인
            const hasDesignSystem = await this.page.evaluate(() => {
                const root = document.documentElement;
                const primaryColor = getComputedStyle(root).getPropertyValue('--color-primary');
                return primaryColor && primaryColor.trim() !== '';
            });
            result.checks.designSystem = hasDesignSystem;
            if (!hasDesignSystem) {
                result.warnings.push('Linear.app 디자인 시스템이 적용되지 않음');
            }

            // JavaScript 로딩 확인
            const hasJS = await this.page.evaluate(() => {
                return typeof window.APIManager !== 'undefined' || 
                       typeof window.ErrorHandler !== 'undefined' ||
                       document.querySelector('script[src]') !== null;
            });
            result.checks.jsLoaded = hasJS;
            if (!hasJS) {
                result.errors.push('JavaScript가 로드되지 않음');
                result.criticalIssues++;
            }

            // 모바일 메뉴 버튼 확인
            const hasMobileMenuButton = await this.page.$('.mobile-menu-toggle, .hamburger-menu, [data-mobile-menu]');
            result.checks.mobileMenu = !!hasMobileMenuButton;
            if (!hasMobileMenuButton) {
                result.warnings.push('모바일 메뉴 버튼이 없음');
            }

            // 네비게이션 링크 확인
            const navLinks = await this.page.$$('nav a, .nav-link, .navigation a');
            result.checks.navigation = navLinks.length > 0;
            if (navLinks.length === 0) {
                result.warnings.push('네비게이션 링크가 없음');
            }

            // 페이지별 특수 검증
            await this.pageSpecificVerification(pageInfo, result);

            // 콘솔 및 네트워크 에러 추가
            if (consoleErrors.length > 0) {
                result.errors.push(...consoleErrors.map(err => `Console: ${err}`));
                result.criticalIssues += consoleErrors.length;
            }
            
            if (networkErrors.length > 0) {
                result.errors.push(...networkErrors.map(err => `Network: ${err}`));
                result.criticalIssues += networkErrors.length;
            }

            // 상태 결정
            if (result.criticalIssues === 0 && result.errors.length === 0) {
                result.status = 'pass';
            } else if (result.criticalIssues > 0) {
                result.status = 'fail';
            } else {
                result.status = 'warning';
            }

        } catch (error) {
            result.status = 'error';
            result.errors.push(error.message);
            result.criticalIssues++;
        }

        return result;
    }

    async pageSpecificVerification(pageInfo, result) {
        try {
            if (pageInfo.category === 'psychology') {
                // 심리테스트 특수 검증
                if (pageInfo.url.includes('test.html')) {
                    // 테스트 실행 페이지
                    const hasQuestions = await this.page.$('.question, .test-question, [data-question]');
                    const hasNextButton = await this.page.$('.next-button, .btn-next, [data-next]');
                    const hasProgressBar = await this.page.$('.progress, .progress-bar, [data-progress]');
                    
                    result.checks.testQuestions = !!hasQuestions;
                    result.checks.nextButton = !!hasNextButton;
                    result.checks.progressBar = !!hasProgressBar;
                    
                    if (!hasQuestions) result.errors.push('테스트 질문이 없음');
                    if (!hasNextButton) result.errors.push('다음 버튼이 없음');
                    if (!hasProgressBar) result.warnings.push('진행률 표시가 없음');
                    
                    result.interactions = await this.testButtonClicks();
                    
                } else {
                    // 테스트 소개 페이지
                    const hasStartButton = await this.page.$('.start-button, .btn-start, [data-start]');
                    const hasDescription = await this.page.$('.description, .test-description, .intro-text');
                    
                    result.checks.startButton = !!hasStartButton;
                    result.checks.description = !!hasDescription;
                    
                    if (!hasStartButton) result.errors.push('시작 버튼이 없음');
                    if (!hasDescription) result.warnings.push('테스트 설명이 없음');
                }
            }
            
            if (pageInfo.category === 'tools') {
                // 실용도구 특수 검증
                const hasInputFields = await this.page.$$('input, select, textarea');
                const hasCalculateButton = await this.page.$('.calculate, .btn-calculate, [data-calculate]');
                
                result.checks.inputFields = hasInputFields.length > 0;
                result.checks.calculateButton = !!hasCalculateButton;
                
                if (hasInputFields.length === 0) result.errors.push('입력 필드가 없음');
                if (!hasCalculateButton) result.errors.push('계산 버튼이 없음');
            }
            
        } catch (error) {
            result.warnings.push(`특수 검증 실패: ${error.message}`);
        }
    }

    async testButtonClicks() {
        const interactions = { clickable: 0, responsive: 0 };
        
        try {
            // 클릭 가능한 버튼들 찾기
            const buttons = await this.page.$$('button, .btn, [role="button"], .clickable');
            interactions.clickable = buttons.length;
            
            // 처음 몇 개 버튼의 반응성 테스트
            const testButtons = buttons.slice(0, 3);
            for (const button of testButtons) {
                try {
                    const isVisible = await button.isIntersectingViewport();
                    if (isVisible) {
                        await button.click();
                        await this.page.waitForTimeout(100);
                        interactions.responsive++;
                    }
                } catch (e) {
                    // 클릭 실패는 무시 (일부 버튼은 특별한 조건이 필요할 수 있음)
                }
            }
            
        } catch (error) {
            console.warn('버튼 상호작용 테스트 실패:', error.message);
        }
        
        return interactions;
    }

    async verifyPsychologyTestFlows() {
        console.log('\n🧠 심리테스트 전체 플로우 검증...');
        
        const testFlows = [
            { name: 'MBTI', introUrl: 'tests/mbti/index.html', testUrl: 'tests/mbti/test.html' },
            { name: '테토-에겐', introUrl: 'tests/teto-egen/index.html', testUrl: 'tests/teto-egen/test.html' },
            { name: '러브 DNA', introUrl: 'tests/love-dna/index.html', testUrl: 'tests/love-dna/test.html' }
        ];
        
        for (const flow of testFlows) {
            try {
                console.log(`\n🔄 ${flow.name} 플로우 테스트...`);
                const flowResult = await this.testPsychologyFlow(flow);
                this.results.criticalFlows[flow.name] = flowResult;
                
            } catch (error) {
                console.error(`❌ ${flow.name} 플로우 실패:`, error.message);
                this.results.criticalFlows[flow.name] = {
                    status: 'error',
                    error: error.message
                };
            }
        }
    }

    async testPsychologyFlow(flow) {
        const result = {
            name: flow.name,
            status: 'unknown',
            steps: {},
            totalTime: 0,
            issues: []
        };
        
        const startTime = Date.now();
        
        try {
            // 1단계: 소개 페이지 로드
            console.log(`  📄 ${flow.name} 소개 페이지 로드...`);
            await this.page.goto(`${this.baseUrl}/${flow.introUrl}`, { waitUntil: 'networkidle2' });
            result.steps.introLoaded = true;
            
            // 시작 버튼 찾기 및 클릭
            const startButton = await this.page.$('.start-button, .btn-start, [data-start], .btn-primary');
            if (startButton) {
                console.log(`  ▶️ ${flow.name} 시작 버튼 클릭...`);
                await startButton.click();
                await this.page.waitForTimeout(1000);
                result.steps.startButtonClicked = true;
            } else {
                result.issues.push('시작 버튼을 찾을 수 없음');
            }
            
            // 2단계: 테스트 페이지로 이동 (자동 이동되지 않으면 직접 이동)
            const currentUrl = this.page.url();
            if (!currentUrl.includes('test.html')) {
                console.log(`  🔗 ${flow.name} 테스트 페이지로 직접 이동...`);
                await this.page.goto(`${this.baseUrl}/${flow.testUrl}`, { waitUntil: 'networkidle2' });
            }
            result.steps.testPageLoaded = true;
            
            // 3단계: 질문 및 다음 버튼 확인
            const questions = await this.page.$$('.question, .test-question, [data-question]');
            const nextButtons = await this.page.$$('.next-button, .btn-next, [data-next], .btn-primary');
            
            result.steps.questionsFound = questions.length > 0;
            result.steps.nextButtonsFound = nextButtons.length > 0;
            
            console.log(`  ❓ ${flow.name} 질문 ${questions.length}개, 다음 버튼 ${nextButtons.length}개 발견`);
            
            if (questions.length === 0) {
                result.issues.push('테스트 질문이 없음');
            }
            if (nextButtons.length === 0) {
                result.issues.push('다음 버튼이 없음');
            }
            
            // 4단계: 간단한 상호작용 테스트
            if (nextButtons.length > 0) {
                try {
                    // 첫 번째 옵션 선택 (있다면)
                    const firstOption = await this.page.$('input[type="radio"], .option, .answer-option');
                    if (firstOption) {
                        await firstOption.click();
                        result.steps.optionSelected = true;
                        console.log(`  ✅ ${flow.name} 첫 번째 옵션 선택됨`);
                    }
                    
                    // 다음 버튼 클릭
                    await nextButtons[0].click();
                    await this.page.waitForTimeout(500);
                    result.steps.nextButtonClicked = true;
                    console.log(`  👆 ${flow.name} 다음 버튼 클릭됨`);
                    
                } catch (error) {
                    result.issues.push(`상호작용 테스트 실패: ${error.message}`);
                }
            }
            
            result.totalTime = Date.now() - startTime;
            
            // 상태 결정
            const criticalSteps = ['introLoaded', 'testPageLoaded', 'questionsFound', 'nextButtonsFound'];
            const passedCriticalSteps = criticalSteps.filter(step => result.steps[step]).length;
            
            if (passedCriticalSteps === criticalSteps.length && result.issues.length === 0) {
                result.status = 'pass';
            } else if (passedCriticalSteps >= criticalSteps.length * 0.75) {
                result.status = 'warning';
            } else {
                result.status = 'fail';
            }
            
            console.log(`  📊 ${flow.name} 플로우 완료: ${result.status} (${result.totalTime}ms)`);
            
        } catch (error) {
            result.status = 'error';
            result.issues.push(error.message);
            result.totalTime = Date.now() - startTime;
        }
        
        return result;
    }

    calculateOverallHealth() {
        const { summary } = this.results;
        
        if (summary.criticalIssues === 0 && summary.failedPages <= 2) {
            this.results.overallHealth = 'excellent';
        } else if (summary.criticalIssues <= 5 && summary.passedPages >= summary.totalPages * 0.8) {
            this.results.overallHealth = 'good';
        } else if (summary.criticalIssues <= 10 && summary.passedPages >= summary.totalPages * 0.6) {
            this.results.overallHealth = 'fair';
        } else {
            this.results.overallHealth = 'poor';
        }
    }

    async captureScreenshots() {
        console.log('\n📸 중요 페이지 스크린샷 캡처...');
        
        const screenshotDir = 'verification-screenshots';
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir);
        }
        
        const importantPages = this.testPages.filter(p => p.priority === 'critical' || p.priority === 'high');
        
        for (const pageInfo of importantPages) {
            try {
                await this.page.goto(`${this.baseUrl}/${pageInfo.url}`, { waitUntil: 'networkidle2' });
                await this.page.waitForTimeout(1000);
                
                const filename = `${pageInfo.name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}.png`;
                await this.page.screenshot({
                    path: path.join(screenshotDir, filename),
                    fullPage: true
                });
                
                console.log(`  📷 ${pageInfo.name} 스크린샷 저장됨`);
                
            } catch (error) {
                console.error(`❌ ${pageInfo.name} 스크린샷 실패:`, error.message);
            }
        }
    }

    generateReport() {
        const reportData = {
            ...this.results,
            generatedAt: new Date().toISOString(),
            recommendations: this.generateRecommendations()
        };
        
        // JSON 리포트 저장
        const reportPath = `verification-report-${Date.now()}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        
        // HTML 리포트 생성
        const htmlReport = this.generateHtmlReport(reportData);
        const htmlPath = `verification-report-${Date.now()}.html`;
        fs.writeFileSync(htmlPath, htmlReport);
        
        console.log(`\n📋 보고서 생성 완료:`);
        console.log(`  📄 JSON: ${reportPath}`);
        console.log(`  🌐 HTML: ${htmlPath}`);
        
        return { reportPath, htmlPath, data: reportData };
    }

    generateRecommendations() {
        const recommendations = [];
        const { summary, pageResults, criticalFlows } = this.results;
        
        // 우선순위별 권장사항
        if (summary.criticalIssues > 0) {
            recommendations.push({
                priority: 'high',
                category: 'critical',
                title: 'JavaScript 모듈 로딩 문제 해결',
                description: `${summary.criticalIssues}개의 심각한 오류가 발견되었습니다. JavaScript 모듈 로딩과 API 연결을 우선 확인하세요.`
            });
        }
        
        // 심리테스트 플로우 문제
        const failedFlows = Object.values(criticalFlows).filter(f => f.status === 'fail' || f.status === 'error');
        if (failedFlows.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'functionality',
                title: '심리테스트 플로우 수정 필요',
                description: `${failedFlows.length}개의 심리테스트에서 플로우 문제가 발견되었습니다. 버튼 클릭과 페이지 전환을 확인하세요.`
            });
        }
        
        // CSS 적용 문제
        const cssIssues = Object.values(pageResults).filter(r => !r.checks?.cssApplied).length;
        if (cssIssues > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'design',
                title: 'CSS 스타일 적용 확인',
                description: `${cssIssues}개의 페이지에서 CSS 스타일이 제대로 적용되지 않았습니다. CSS 번들링과 링크를 확인하세요.`
            });
        }
        
        // 모바일 메뉴 문제
        const mobileMenuIssues = Object.values(pageResults).filter(r => !r.checks?.mobileMenu).length;
        if (mobileMenuIssues > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'ui',
                title: '모바일 네비게이션 개선',
                description: `${mobileMenuIssues}개의 페이지에서 모바일 메뉴 버튼이 없습니다. 반응형 네비게이션을 확인하세요.`
            });
        }
        
        return recommendations;
    }

    generateHtmlReport(data) {
        const { summary, pageResults, criticalFlows, recommendations } = data;
        
        return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>도하닷kr 종합 검증 리포트</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .value { font-size: 2em; font-weight: bold; color: #007bff; }
        .health-excellent { color: #28a745; }
        .health-good { color: #17a2b8; }
        .health-fair { color: #ffc107; }
        .health-poor { color: #dc3545; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .page-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
        .page-card { border: 1px solid #ddd; border-radius: 6px; padding: 15px; background: white; }
        .status-pass { border-left: 4px solid #28a745; }
        .status-warning { border-left: 4px solid #ffc107; }
        .status-fail { border-left: 4px solid #dc3545; }
        .status-error { border-left: 4px solid #6c757d; }
        .page-title { font-weight: bold; margin-bottom: 5px; }
        .page-category { color: #666; font-size: 0.9em; }
        .page-details { margin-top: 10px; font-size: 0.9em; }
        .flow-results { margin-top: 20px; }
        .flow-card { background: #f8f9fa; border-radius: 6px; padding: 15px; margin-bottom: 15px; }
        .recommendations { background: #fff3cd; border-radius: 6px; padding: 20px; }
        .recommendation { margin-bottom: 15px; padding: 10px; border-left: 4px solid #ffc107; background: white; }
        .priority-high { border-left-color: #dc3545; }
        .priority-medium { border-left-color: #ffc107; }
        .priority-low { border-left-color: #17a2b8; }
        .timestamp { color: #666; font-size: 0.9em; }
        .error-list { list-style: none; padding: 0; }
        .error-item { background: #f8d7da; color: #721c24; padding: 5px 10px; margin: 2px 0; border-radius: 3px; font-size: 0.8em; }
        .warning-item { background: #fff3cd; color: #856404; padding: 5px 10px; margin: 2px 0; border-radius: 3px; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 도하닷kr 종합 검증 리포트</h1>
            <p class="timestamp">생성일시: ${new Date(data.timestamp).toLocaleString('ko-KR')}</p>
            <div class="health-status">
                <h2>전체 상태: <span class="health-${data.overallHealth}">${this.getHealthText(data.overallHealth)}</span></h2>
            </div>
        </div>

        <div class="section">
            <h2>📊 요약 통계</h2>
            <div class="summary">
                <div class="summary-card">
                    <h3>전체 페이지</h3>
                    <div class="value">${summary.totalPages}</div>
                </div>
                <div class="summary-card">
                    <h3>통과</h3>
                    <div class="value" style="color: #28a745;">${summary.passedPages}</div>
                </div>
                <div class="summary-card">
                    <h3>실패</h3>
                    <div class="value" style="color: #dc3545;">${summary.failedPages}</div>
                </div>
                <div class="summary-card">
                    <h3>심각한 오류</h3>
                    <div class="value" style="color: #dc3545;">${summary.criticalIssues}</div>
                </div>
                <div class="summary-card">
                    <h3>경고</h3>
                    <div class="value" style="color: #ffc107;">${summary.warnings}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🧠 심리테스트 플로우 결과</h2>
            <div class="flow-results">
                ${Object.entries(criticalFlows).map(([name, flow]) => `
                    <div class="flow-card status-${flow.status}">
                        <h3>${name} 테스트</h3>
                        <p><strong>상태:</strong> ${this.getStatusText(flow.status)}</p>
                        <p><strong>소요시간:</strong> ${flow.totalTime}ms</p>
                        ${flow.steps ? `
                            <div class="page-details">
                                <strong>단계별 결과:</strong>
                                <ul>
                                    <li>소개 페이지 로드: ${flow.steps.introLoaded ? '✅' : '❌'}</li>
                                    <li>테스트 페이지 로드: ${flow.steps.testPageLoaded ? '✅' : '❌'}</li>
                                    <li>질문 발견: ${flow.steps.questionsFound ? '✅' : '❌'}</li>
                                    <li>다음 버튼 발견: ${flow.steps.nextButtonsFound ? '✅' : '❌'}</li>
                                    <li>옵션 선택: ${flow.steps.optionSelected ? '✅' : '❌'}</li>
                                    <li>다음 버튼 클릭: ${flow.steps.nextButtonClicked ? '✅' : '❌'}</li>
                                </ul>
                            </div>
                        ` : ''}
                        ${flow.issues && flow.issues.length > 0 ? `
                            <ul class="error-list">
                                ${flow.issues.map(issue => `<li class="error-item">${issue}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <h2>📋 페이지별 검증 결과</h2>
            <div class="page-grid">
                ${Object.entries(pageResults).map(([name, result]) => `
                    <div class="page-card status-${result.status}">
                        <div class="page-title">${name}</div>
                        <div class="page-category">${result.category} • ${result.priority}</div>
                        <div class="page-details">
                            <p><strong>상태:</strong> ${this.getStatusText(result.status)}</p>
                            <p><strong>로드시간:</strong> ${result.loadTime}ms</p>
                            <p><strong>URL:</strong> ${result.url}</p>
                            ${result.checks ? `
                                <div style="margin-top: 10px;">
                                    <strong>검증 항목:</strong><br>
                                    페이지 로드: ${result.checks.pageLoads ? '✅' : '❌'}<br>
                                    CSS 적용: ${result.checks.cssApplied ? '✅' : '❌'}<br>
                                    JS 로딩: ${result.checks.jsLoaded ? '✅' : '❌'}<br>
                                    네비게이션: ${result.checks.navigation ? '✅' : '❌'}<br>
                                    모바일 메뉴: ${result.checks.mobileMenu ? '✅' : '❌'}<br>
                                    디자인 시스템: ${result.checks.designSystem ? '✅' : '❌'}
                                </div>
                            ` : ''}
                            ${result.errors && result.errors.length > 0 ? `
                                <ul class="error-list">
                                    ${result.errors.map(error => `<li class="error-item">${error}</li>`).join('')}
                                </ul>
                            ` : ''}
                            ${result.warnings && result.warnings.length > 0 ? `
                                <ul class="error-list">
                                    ${result.warnings.map(warning => `<li class="warning-item">${warning}</li>`).join('')}
                                </ul>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        ${recommendations.length > 0 ? `
            <div class="section">
                <h2>💡 개선 권장사항</h2>
                <div class="recommendations">
                    ${recommendations.map(rec => `
                        <div class="recommendation priority-${rec.priority}">
                            <h4>${rec.title}</h4>
                            <p>${rec.description}</p>
                            <small>우선순위: ${rec.priority} | 카테고리: ${rec.category}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    </div>
</body>
</html>
        `;
    }

    getHealthText(health) {
        const healthMap = {
            'excellent': '우수',
            'good': '양호',
            'fair': '보통',
            'poor': '취약'
        };
        return healthMap[health] || health;
    }

    getStatusText(status) {
        const statusMap = {
            'pass': '통과',
            'warning': '경고',
            'fail': '실패',
            'error': '오류',
            'unknown': '알 수 없음'
        };
        return statusMap[status] || status;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async run() {
        try {
            await this.init();
            await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
            
            await this.verifyAllPages();
            await this.captureScreenshots();
            
            const report = this.generateReport();
            
            console.log('\n🎉 종합 검증 완료!');
            console.log(`📊 전체 상태: ${this.getHealthText(this.results.overallHealth)}`);
            console.log(`✅ 통과: ${this.results.summary.passedPages}/${this.results.summary.totalPages}`);
            console.log(`❌ 실패: ${this.results.summary.failedPages}`);
            console.log(`🚨 심각한 오류: ${this.results.summary.criticalIssues}`);
            console.log(`⚠️ 경고: ${this.results.summary.warnings}`);
            
            return report;
            
        } catch (error) {
            console.error('❌ 종합 검증 실패:', error);
            throw error;
        } finally {
            await this.cleanup();
        }
    }
}

// 직접 실행
if (require.main === module) {
    const verifier = new ComprehensivePageVerification();
    verifier.run().catch(console.error);
}

module.exports = ComprehensivePageVerification;