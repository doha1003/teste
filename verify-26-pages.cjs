const puppeteer = require('puppeteer');
const fs = require('fs');

class PageVerification {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
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
            overallHealth: 'unknown'
        };
        
        // 26개 페이지 정의
        this.testPages = [
            // 심리테스트 (6개) - 최우선
            { name: 'MBTI 테스트 소개', url: 'tests/mbti/index.html', category: 'psychology', priority: 'critical' },
            { name: 'MBTI 테스트 실행', url: 'tests/mbti/test.html', category: 'psychology', priority: 'critical' },
            { name: '테토-에겐 테스트 소개', url: 'tests/teto-egen/index.html', category: 'psychology', priority: 'critical' },
            { name: '테토-에겐 테스트 실행', url: 'tests/teto-egen/test.html', category: 'psychology', priority: 'critical' },
            { name: '러브 DNA 테스트 소개', url: 'tests/love-dna/index.html', category: 'psychology', priority: 'critical' },
            { name: '러브 DNA 테스트 실행', url: 'tests/love-dna/test.html', category: 'psychology', priority: 'critical' },
            
            // 메인 페이지들 (4개)
            { name: '홈페이지', url: 'index.html', category: 'main', priority: 'high' },
            { name: '심리테스트 메인', url: 'tests/index.html', category: 'main', priority: 'high' },
            { name: '실용도구 메인', url: 'tools/index.html', category: 'main', priority: 'high' },
            { name: 'AI 운세 메인', url: 'fortune/index.html', category: 'main', priority: 'high' },
            
            // 운세 서비스 (5개)
            { name: '오늘의 운세', url: 'fortune/daily/index.html', category: 'fortune', priority: 'medium' },
            { name: '사주 운세', url: 'fortune/saju/index.html', category: 'fortune', priority: 'medium' },
            { name: '타로 운세', url: 'fortune/tarot/index.html', category: 'fortune', priority: 'medium' },
            { name: '띠별 운세', url: 'fortune/zodiac-animal/index.html', category: 'fortune', priority: 'medium' },
            { name: '별자리 운세', url: 'fortune/zodiac/index.html', category: 'fortune', priority: 'medium' },
            
            // 실용도구 (3개)
            { name: 'BMI 계산기', url: 'tools/bmi-calculator.html', category: 'tools', priority: 'medium' },
            { name: '연봉 계산기', url: 'tools/salary-calculator.html', category: 'tools', priority: 'medium' },
            { name: '글자수 세기', url: 'tools/text-counter.html', category: 'tools', priority: 'medium' },
            
            // 결과 상세 페이지 (1개)
            { name: '결과 상세', url: 'result-detail.html', category: 'result', priority: 'medium' },
            
            // 기타 페이지 (7개)
            { name: '소개', url: 'about/index.html', category: 'info', priority: 'low' },
            { name: '연락처', url: 'contact/index.html', category: 'info', priority: 'low' },
            { name: 'FAQ', url: 'faq/index.html', category: 'info', priority: 'low' },
            { name: '개인정보처리방침', url: 'privacy/index.html', category: 'legal', priority: 'low' },
            { name: '이용약관', url: 'terms/index.html', category: 'legal', priority: 'low' },
            { name: '404 오류', url: '404.html', category: 'error', priority: 'low' },
            { name: '오프라인', url: 'offline.html', category: 'pwa', priority: 'low' }
        ];
        
        console.log(`📋 검증할 페이지 수: ${this.testPages.length}개`);
    }

    async init() {
        console.log('🚀 26개 페이지 체계적 검증 시작...');
        
        this.browser = await puppeteer.launch({
            headless: "new",
            defaultViewport: { width: 1280, height: 720 },
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        
        this.page = await this.browser.newPage();
        
        // 한국어 설정
        await this.page.setExtraHTTPHeaders({
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
        });
        
        // 콘솔 메시지 수집
        this.consoleMessages = [];
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                this.consoleMessages.push(`Console Error: ${msg.text()}`);
            }
        });
        
        // 네트워크 실패 수집
        this.networkErrors = [];
        this.page.on('requestfailed', request => {
            const failure = request.failure();
            if (failure) {
                this.networkErrors.push(`${request.url()} - ${failure.errorText}`);
            }
        });
        
        return this;
    }

    async verifyAllPages() {
        console.log(`\n📊 총 ${this.testPages.length}개 페이지 검증 시작\n`);
        
        for (let i = 0; i < this.testPages.length; i++) {
            const pageInfo = this.testPages[i];
            
            console.log(`🔍 [${i+1}/${this.testPages.length}] ${pageInfo.name} (${pageInfo.priority})`);
            
            try {
                // 콘솔과 네트워크 에러 초기화
                this.consoleMessages = [];
                this.networkErrors = [];
                
                const result = await this.verifyPage(pageInfo);
                this.results.pageResults[pageInfo.name] = result;
                
                this.results.summary.totalPages++;
                if (result.status === 'pass') {
                    this.results.summary.passedPages++;
                    console.log(`  ✅ 통과 (${result.loadTime}ms)`);
                } else {
                    this.results.summary.failedPages++;
                    console.log(`  ❌ 실패: ${result.errors.join(', ')}`);
                }
                
                this.results.summary.criticalIssues += result.criticalIssues || 0;
                this.results.summary.warnings += result.warnings || 0;
                
                // 잠시 대기
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                console.error(`  💥 검증 오류: ${error.message}`);
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
        
        await this.testPsychologyFlows();
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
            // 페이지 로드
            const response = await this.page.goto(fullUrl, { 
                waitUntil: 'networkidle0', 
                timeout: 15000 
            });
            
            result.loadTime = Date.now() - startTime;
            result.checks.pageLoads = response && response.status() < 400;
            
            if (!result.checks.pageLoads) {
                result.errors.push(`페이지 로드 실패: ${response ? response.status() : 'No response'}`);
                result.criticalIssues++;
                return result;
            }

            // 페이지 제목 확인
            const title = await this.page.title();
            if (!title || title.includes('404') || title === 'Document') {
                result.warnings.push('페이지 제목이 설정되지 않음');
            }

            // CSS 적용 확인
            const hasStyles = await this.page.evaluate(() => {
                const body = document.body;
                if (!body) return false;
                const computedStyle = window.getComputedStyle(body);
                return computedStyle.fontFamily !== 'Times' && computedStyle.margin !== '8px';
            });
            result.checks.cssApplied = hasStyles;
            if (!hasStyles) {
                result.warnings.push('CSS가 제대로 적용되지 않음');
            }

            // JavaScript 로딩 확인
            const hasJS = await this.page.evaluate(() => {
                return typeof window.APIManager !== 'undefined' || 
                       typeof window.ErrorHandler !== 'undefined' ||
                       document.querySelector('script[src]') !== null;
            });
            result.checks.jsLoaded = hasJS;
            if (!hasJS) {
                result.warnings.push('JavaScript가 로드되지 않음');
            }

            // 네비게이션 확인
            const navLinks = await this.page.$$('nav a, .nav-link, .navigation a, header a');
            result.checks.navigation = navLinks.length > 0;
            if (navLinks.length === 0) {
                result.warnings.push('네비게이션 링크가 없음');
            }

            // 모바일 메뉴 버튼 확인
            const mobileMenuElements = await this.page.$$('.mobile-menu-toggle, .hamburger-menu, [data-mobile-menu], .menu-toggle');
            result.checks.mobileMenu = mobileMenuElements.length > 0;
            if (mobileMenuElements.length === 0) {
                result.warnings.push('모바일 메뉴 버튼이 없음');
            }

            // 디자인 시스템 확인
            const hasDesignSystem = await this.page.evaluate(() => {
                const root = document.documentElement;
                const primaryColor = getComputedStyle(root).getPropertyValue('--color-primary');
                return primaryColor && primaryColor.trim() !== '';
            });
            result.checks.designSystem = hasDesignSystem;
            if (!hasDesignSystem) {
                result.warnings.push('Linear.app 디자인 시스템이 적용되지 않음');
            }

            // 페이지별 특수 검증
            await this.pageSpecificVerification(pageInfo, result);

            // 콘솔 및 네트워크 에러 추가
            if (this.consoleMessages.length > 0) {
                result.errors.push(...this.consoleMessages);
                result.criticalIssues += this.consoleMessages.length;
            }
            
            if (this.networkErrors.length > 0) {
                result.errors.push(...this.networkErrors);
                result.criticalIssues += this.networkErrors.length;
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
                if (pageInfo.url.includes('test.html')) {
                    // 테스트 실행 페이지
                    const questions = await this.page.$$('.question, .test-question, [data-question]');
                    const nextButtons = await this.page.$$('.next-button, .btn-next, [data-next], .btn-primary');
                    const progressBars = await this.page.$$('.progress, .progress-bar, [data-progress]');
                    
                    result.checks.testQuestions = questions.length > 0;
                    result.checks.nextButton = nextButtons.length > 0;
                    result.checks.progressBar = progressBars.length > 0;
                    
                    if (questions.length === 0) result.errors.push('테스트 질문이 없음');
                    if (nextButtons.length === 0) result.errors.push('다음 버튼이 없음');
                    if (progressBars.length === 0) result.warnings.push('진행률 표시가 없음');
                    
                } else {
                    // 테스트 소개 페이지
                    const startButtons = await this.page.$$('.start-button, .btn-start, [data-start], .btn-primary');
                    const descriptions = await this.page.$$('.description, .test-description, .intro-text');
                    
                    result.checks.startButton = startButtons.length > 0;
                    result.checks.description = descriptions.length > 0;
                    
                    if (startButtons.length === 0) result.errors.push('시작 버튼이 없음');
                    if (descriptions.length === 0) result.warnings.push('테스트 설명이 없음');
                }
            }
            
            if (pageInfo.category === 'tools') {
                // 실용도구 특수 검증
                const inputFields = await this.page.$$('input, select, textarea');
                const calculateButtons = await this.page.$$('.calculate, .btn-calculate, [data-calculate], .btn-primary');
                
                result.checks.inputFields = inputFields.length > 0;
                result.checks.calculateButton = calculateButtons.length > 0;
                
                if (inputFields.length === 0) result.errors.push('입력 필드가 없음');
                if (calculateButtons.length === 0) result.errors.push('계산 버튼이 없음');
            }
            
        } catch (error) {
            result.warnings.push(`특수 검증 실패: ${error.message}`);
        }
    }

    async testPsychologyFlows() {
        console.log('\n🧠 심리테스트 3개 전체 플로우 검증...');
        
        const testFlows = [
            { 
                name: 'MBTI', 
                introUrl: 'tests/mbti/index.html', 
                testUrl: 'tests/mbti/test.html',
                expectedQuestions: 60
            },
            { 
                name: '테토-에겐', 
                introUrl: 'tests/teto-egen/index.html', 
                testUrl: 'tests/teto-egen/test.html',
                expectedQuestions: 12
            },
            { 
                name: '러브 DNA', 
                introUrl: 'tests/love-dna/index.html', 
                testUrl: 'tests/love-dna/test.html',
                expectedQuestions: 5
            }
        ];
        
        this.results.criticalFlows = {};
        
        for (const flow of testFlows) {
            try {
                console.log(`\n🔄 ${flow.name} 테스트 플로우 검증...`);
                const flowResult = await this.testPsychologyFlow(flow);
                this.results.criticalFlows[flow.name] = flowResult;
                
                if (flowResult.status === 'pass') {
                    console.log(`  ✅ ${flow.name} 플로우 통과`);
                } else {
                    console.log(`  ❌ ${flow.name} 플로우 실패: ${flowResult.issues.join(', ')}`);
                }
                
            } catch (error) {
                console.error(`  💥 ${flow.name} 플로우 오류: ${error.message}`);
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
            issues: [],
            details: {
                questionsFound: 0,
                buttonsFound: 0,
                interactionWorking: false
            }
        };
        
        const startTime = Date.now();
        
        try {
            // 1단계: 소개 페이지 로드
            await this.page.goto(`${this.baseUrl}/${flow.introUrl}`, { waitUntil: 'networkidle0' });
            result.steps.introLoaded = true;
            
            // 2단계: 테스트 페이지로 이동
            await this.page.goto(`${this.baseUrl}/${flow.testUrl}`, { waitUntil: 'networkidle0' });
            result.steps.testPageLoaded = true;
            
            // 3단계: 질문 및 버튼 확인
            const questions = await this.page.$$('.question, .test-question, [data-question], .test-item');
            const nextButtons = await this.page.$$('.next-button, .btn-next, [data-next], .btn-primary, button');
            const options = await this.page.$$('input[type="radio"], .option, .answer-option, input[type="checkbox"]');
            
            result.details.questionsFound = questions.length;
            result.details.buttonsFound = nextButtons.length;
            
            result.steps.questionsFound = questions.length > 0;
            result.steps.nextButtonsFound = nextButtons.length > 0;
            result.steps.optionsFound = options.length > 0;
            
            if (questions.length === 0) {
                result.issues.push('테스트 질문이 없음');
            } else if (flow.expectedQuestions && questions.length < flow.expectedQuestions * 0.5) {
                result.issues.push(`예상 질문 수보다 적음 (${questions.length}/${flow.expectedQuestions})`);
            }
            
            if (nextButtons.length === 0) {
                result.issues.push('다음 버튼이 없음');
            }
            
            if (options.length === 0) {
                result.issues.push('선택 옵션이 없음');
            }
            
            // 4단계: 간단한 상호작용 테스트
            if (options.length > 0 && nextButtons.length > 0) {
                try {
                    await options[0].click();
                    await new Promise(resolve => setTimeout(resolve, 100));
                    await nextButtons[0].click();
                    await new Promise(resolve => setTimeout(resolve, 200));
                    result.steps.interactionWorking = true;
                    result.details.interactionWorking = true;
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

    generateSummaryTable() {
        const categorySummary = {};
        
        // 카테고리별 집계
        Object.values(this.results.pageResults).forEach(result => {
            if (!categorySummary[result.category]) {
                categorySummary[result.category] = {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    issues: 0
                };
            }
            
            categorySummary[result.category].total++;
            if (result.status === 'pass') {
                categorySummary[result.category].passed++;
            } else {
                categorySummary[result.category].failed++;
            }
            categorySummary[result.category].issues += result.criticalIssues || 0;
        });
        
        return categorySummary;
    }

    generateReport() {
        const reportData = {
            ...this.results,
            categorySummary: this.generateSummaryTable(),
            generatedAt: new Date().toISOString(),
            recommendations: this.generateRecommendations()
        };
        
        // JSON 리포트 저장
        const reportPath = `26-pages-verification-report-${Date.now()}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        
        // 요약 텍스트 리포트 생성
        const textReport = this.generateTextReport(reportData);
        const textPath = `26-pages-summary-${Date.now()}.md`;
        fs.writeFileSync(textPath, textReport);
        
        console.log(`\n📋 보고서 생성 완료:`);
        console.log(`  📄 JSON: ${reportPath}`);
        console.log(`  📝 요약: ${textPath}`);
        
        return { reportPath, textPath, data: reportData };
    }

    generateRecommendations() {
        const recommendations = [];
        const { summary, pageResults, criticalFlows } = this.results;
        
        // 우선순위별 권장사항
        if (summary.criticalIssues > 10) {
            recommendations.push({
                priority: 'high',
                category: 'critical',
                title: 'JavaScript 및 CSS 로딩 문제 해결',
                description: `${summary.criticalIssues}개의 심각한 오류가 발견되었습니다. 리소스 로딩과 API 연결을 우선 확인하세요.`
            });
        }
        
        // 심리테스트 플로우 문제
        const failedFlows = Object.values(criticalFlows).filter(f => f.status === 'fail' || f.status === 'error');
        if (failedFlows.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'functionality',
                title: '심리테스트 플로우 수정 필요',
                description: `${failedFlows.length}개의 심리테스트에서 플로우 문제가 발견되었습니다.`
            });
        }
        
        return recommendations;
    }

    generateTextReport(data) {
        const { summary, pageResults, criticalFlows, categorySummary } = data;
        
        let report = `# 도하닷kr 26개 페이지 검증 리포트\n\n`;
        report += `**생성일시:** ${new Date(data.timestamp).toLocaleString('ko-KR')}\n`;
        report += `**전체상태:** ${this.getHealthText(data.overallHealth)}\n\n`;
        
        // 전체 요약
        report += `## 📊 전체 요약\n\n`;
        report += `| 항목 | 수치 |\n`;
        report += `|------|------|\n`;
        report += `| 전체 페이지 | ${summary.totalPages}개 |\n`;
        report += `| 통과 | ${summary.passedPages}개 |\n`;
        report += `| 실패 | ${summary.failedPages}개 |\n`;
        report += `| 심각한 오류 | ${summary.criticalIssues}개 |\n`;
        report += `| 경고 | ${summary.warnings}개 |\n\n`;
        
        // 카테고리별 요약
        report += `## 📋 카테고리별 상태\n\n`;
        report += `| 카테고리 | 전체 | 통과 | 실패 | 문제 |\n`;
        report += `|----------|------|------|------|------|\n`;
        Object.entries(categorySummary).forEach(([category, stats]) => {
            report += `| ${category} | ${stats.total} | ${stats.passed} | ${stats.failed} | ${stats.issues} |\n`;
        });
        report += `\n`;
        
        // 심리테스트 플로우 결과
        report += `## 🧠 심리테스트 플로우 결과\n\n`;
        Object.entries(criticalFlows).forEach(([name, flow]) => {
            report += `### ${name} 테스트\n`;
            report += `- **상태:** ${this.getStatusText(flow.status)}\n`;
            report += `- **소요시간:** ${flow.totalTime}ms\n`;
            if (flow.details) {
                report += `- **질문 수:** ${flow.details.questionsFound}개\n`;
                report += `- **버튼 수:** ${flow.details.buttonsFound}개\n`;
                report += `- **상호작용:** ${flow.details.interactionWorking ? '작동' : '미작동'}\n`;
            }
            if (flow.issues && flow.issues.length > 0) {
                report += `- **문제점:**\n`;
                flow.issues.forEach(issue => {
                    report += `  - ${issue}\n`;
                });
            }
            report += `\n`;
        });
        
        // 우선순위별 문제 페이지
        report += `## ❌ 실패한 페이지 목록\n\n`;
        const failedPages = Object.entries(pageResults).filter(([_, result]) => result.status === 'fail' || result.status === 'error');
        if (failedPages.length > 0) {
            failedPages.forEach(([name, result]) => {
                report += `### ${name}\n`;
                report += `- **URL:** ${result.url}\n`;
                report += `- **카테고리:** ${result.category}\n`;
                report += `- **우선순위:** ${result.priority}\n`;
                report += `- **상태:** ${this.getStatusText(result.status)}\n`;
                report += `- **문제점:**\n`;
                result.errors.forEach(error => {
                    report += `  - ${error}\n`;
                });
                report += `\n`;
            });
        } else {
            report += `모든 페이지가 정상 작동합니다! 🎉\n\n`;
        }
        
        // 권장사항
        if (data.recommendations && data.recommendations.length > 0) {
            report += `## 💡 우선순위별 개선사항\n\n`;
            data.recommendations.forEach((rec, index) => {
                report += `### ${index + 1}. ${rec.title}\n`;
                report += `**우선순위:** ${rec.priority.toUpperCase()}\n`;
                report += `**카테고리:** ${rec.category}\n`;
                report += `**설명:** ${rec.description}\n\n`;
            });
        }
        
        return report;
    }

    getHealthText(health) {
        const healthMap = {
            'excellent': '우수 🟢',
            'good': '양호 🟡',
            'fair': '보통 🟠',
            'poor': '취약 🔴'
        };
        return healthMap[health] || health;
    }

    getStatusText(status) {
        const statusMap = {
            'pass': '통과 ✅',
            'warning': '경고 ⚠️',
            'fail': '실패 ❌',
            'error': '오류 💥',
            'unknown': '알 수 없음 ❓'
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
            
            // 홈페이지 접근 가능 확인
            console.log('🌐 로컬 서버 접근 확인...');
            await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
            console.log('✅ 로컬 서버 접근 성공');
            
            await this.verifyAllPages();
            
            const report = this.generateReport();
            
            console.log('\n🎉 26개 페이지 검증 완료!');
            console.log(`📊 전체 상태: ${this.getHealthText(this.results.overallHealth)}`);
            console.log(`✅ 통과: ${this.results.summary.passedPages}/${this.results.summary.totalPages}`);
            console.log(`❌ 실패: ${this.results.summary.failedPages}`);
            console.log(`🚨 심각한 오류: ${this.results.summary.criticalIssues}`);
            console.log(`⚠️ 경고: ${this.results.summary.warnings}`);
            
            // 심리테스트 플로우 요약
            console.log('\n🧠 심리테스트 플로우 요약:');
            Object.entries(this.results.criticalFlows).forEach(([name, flow]) => {
                console.log(`  ${name}: ${this.getStatusText(flow.status)} (${flow.totalTime}ms)`);
            });
            
            return report;
            
        } catch (error) {
            console.error('❌ 검증 실패:', error);
            throw error;
        } finally {
            await this.cleanup();
        }
    }
}

// 직접 실행
if (require.main === module) {
    const verifier = new PageVerification();
    verifier.run().catch(console.error);
}

module.exports = PageVerification;