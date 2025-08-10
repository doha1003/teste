const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// doha.kr 프로젝트 전체 QA 검증 스크립트
class DohaQAValidator {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.browser = null;
        this.page = null;
        this.report = {
            timestamp: new Date().toISOString(),
            testEnvironment: {
                baseUrl: this.baseUrl,
                browser: 'Chrome',
                viewport: { width: 1920, height: 1080 }
            },
            summary: {
                totalPages: 0,
                pagesWithErrors: 0,
                totalErrors: 0,
                performanceScore: 0,
                accessibilityIssues: 0
            },
            pages: {},
            criticalIssues: [],
            recommendations: []
        };
    }

    async init() {
        console.log('🚀 doha.kr 종합 QA 검증 시작...\n');
        
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--allow-running-insecure-content'
            ]
        });

        this.page = await this.browser.newPage();
        
        // 뷰포트 설정 (데스크톱)
        await this.page.setViewport({ width: 1920, height: 1080 });
        
        // 사용자 에이전트 설정
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    }

    async testPage(url, pageName) {
        console.log(`🔍 테스트 중: ${pageName} (${url})`);
        
        const pageReport = {
            name: pageName,
            url: url,
            status: 'unknown',
            loadTime: 0,
            errors: {
                console: [],
                network: [],
                javascript: []
            },
            performance: {},
            accessibility: [],
            resources: {
                css: [],
                js: [],
                images: [],
                fonts: []
            },
            seo: {}
        };

        try {
            const startTime = Date.now();

            // 네트워크 요청 모니터링
            const failedRequests = [];
            this.page.on('requestfailed', request => {
                failedRequests.push({
                    url: request.url(),
                    method: request.method(),
                    failure: request.failure()
                });
            });

            // 콘솔 에러 모니터링
            const consoleErrors = [];
            this.page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push({
                        type: 'error',
                        text: msg.text(),
                        location: msg.location()
                    });
                }
                if (msg.type() === 'warning') {
                    consoleErrors.push({
                        type: 'warning',
                        text: msg.text(),
                        location: msg.location()
                    });
                }
            });

            // JavaScript 런타임 에러 모니터링
            const jsErrors = [];
            this.page.on('pageerror', error => {
                jsErrors.push({
                    message: error.message || error.toString(),
                    stack: error.stack || 'No stack trace',
                    name: error.name || 'UnknownError'
                });
            });

            // 페이지 로드
            const response = await this.page.goto(url, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            const loadTime = Date.now() - startTime;
            pageReport.loadTime = loadTime;
            pageReport.status = response.status();

            // 리소스 로드 검증
            await this.validateResources(pageReport);

            // 기본 접근성 검사
            await this.checkBasicAccessibility(pageReport);

            // 폰트 로딩 확인
            await this.checkFontLoading(pageReport);

            // SEO 기본 요소 확인
            await this.checkBasicSEO(pageReport);

            // 에러 정리
            pageReport.errors.console = consoleErrors;
            pageReport.errors.network = failedRequests;
            pageReport.errors.javascript = jsErrors;

            // 성능 메트릭 수집
            const performanceMetrics = await this.page.evaluate(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                return {
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                    firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0,
                    firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0
                };
            });
            pageReport.performance = performanceMetrics;

            // 상태 판정
            const totalErrors = consoleErrors.length + failedRequests.length + jsErrors.length;
            if (totalErrors === 0 && response.status() === 200) {
                pageReport.status = 'success';
                console.log(`   ✅ 성공 (${loadTime}ms)`);
            } else if (totalErrors > 0) {
                pageReport.status = 'warning';
                console.log(`   ⚠️  경고: ${totalErrors}개 이슈 (${loadTime}ms)`);
            } else {
                pageReport.status = 'error';
                console.log(`   ❌ 오류: HTTP ${response.status()} (${loadTime}ms)`);
            }

        } catch (error) {
            pageReport.status = 'error';
            pageReport.errors.javascript.push({
                message: error.message || error.toString(),
                stack: error.stack || 'No stack trace',
                name: error.name || 'UnknownError'
            });
            console.log(`   ❌ 페이지 로드 실패: ${error.message || error.toString()}`);
        }

        return pageReport;
    }

    async validateResources(pageReport) {
        try {
            // CSS 파일 확인
            const cssLinks = await this.page.$$eval('link[rel="stylesheet"]', links =>
                links.map(link => ({
                    href: link.href,
                    loaded: link.sheet !== null
                }))
            );
            pageReport.resources.css = cssLinks;

            // JavaScript 파일 확인
            const jsScripts = await this.page.$$eval('script[src]', scripts =>
                scripts.map(script => ({
                    src: script.src,
                    loaded: true // 스크립트가 DOM에 있다면 로드됨
                }))
            );
            pageReport.resources.js = jsScripts;

            // 이미지 확인
            const images = await this.page.$$eval('img', imgs =>
                imgs.map(img => ({
                    src: img.src,
                    loaded: img.complete && img.naturalHeight !== 0,
                    alt: img.alt || null
                }))
            );
            pageReport.resources.images = images;

        } catch (error) {
            console.log(`   리소스 검증 오류: ${error.message}`);
        }
    }

    async checkBasicAccessibility(pageReport) {
        try {
            // 기본 접근성 검사
            const accessibilityIssues = await this.page.evaluate(() => {
                const issues = [];

                // alt 속성 누락 이미지
                const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
                if (imagesWithoutAlt.length > 0) {
                    issues.push({
                        type: 'missing-alt',
                        count: imagesWithoutAlt.length,
                        severity: 'medium',
                        description: 'alt 속성이 없는 이미지'
                    });
                }

                // 빈 링크
                const emptyLinks = document.querySelectorAll('a:empty');
                if (emptyLinks.length > 0) {
                    issues.push({
                        type: 'empty-links',
                        count: emptyLinks.length,
                        severity: 'high',
                        description: '텍스트가 없는 링크'
                    });
                }

                // 폼 라벨 누락
                const inputsWithoutLabels = document.querySelectorAll('input:not([type="hidden"]):not([id]), input[id]:not([id=""])')
                    .length - document.querySelectorAll('label[for]').length;
                if (inputsWithoutLabels > 0) {
                    issues.push({
                        type: 'missing-labels',
                        count: inputsWithoutLabels,
                        severity: 'high',
                        description: '라벨이 없는 입력 필드'
                    });
                }

                return issues;
            });

            pageReport.accessibility = accessibilityIssues;

        } catch (error) {
            console.log(`   접근성 검사 오류: ${error.message}`);
        }
    }

    async checkFontLoading(pageReport) {
        try {
            const fontStatus = await this.page.evaluate(() => {
                const computed = window.getComputedStyle(document.body);
                return {
                    fontFamily: computed.fontFamily,
                    koreanSupport: computed.fontFamily.includes('Pretendard') || 
                                  computed.fontFamily.includes('Noto') ||
                                  computed.fontFamily.includes('Malgun')
                };
            });

            pageReport.resources.fonts = [fontStatus];

        } catch (error) {
            console.log(`   폰트 검사 오류: ${error.message}`);
        }
    }

    async checkBasicSEO(pageReport) {
        try {
            const seoData = await this.page.evaluate(() => {
                const title = document.querySelector('title')?.textContent || '';
                const description = document.querySelector('meta[name="description"]')?.content || '';
                const h1Count = document.querySelectorAll('h1').length;
                const metaKeywords = document.querySelector('meta[name="keywords"]')?.content || '';

                return {
                    title: title,
                    titleLength: title.length,
                    description: description,
                    descriptionLength: description.length,
                    h1Count: h1Count,
                    hasKeywords: !!metaKeywords,
                    hasOgImage: !!document.querySelector('meta[property="og:image"]'),
                    hasCanonical: !!document.querySelector('link[rel="canonical"]')
                };
            });

            pageReport.seo = seoData;

        } catch (error) {
            console.log(`   SEO 검사 오류: ${error.message}`);
        }
    }

    async testMobileView(url, pageName) {
        console.log(`📱 모바일 테스트: ${pageName}`);
        
        try {
            // 모바일 뷰포트로 전환
            await this.page.setViewport({ width: 375, height: 667 });
            await this.page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1');

            const mobileReport = await this.testPage(url, `${pageName} (Mobile)`);
            
            // 데스크톱 뷰포트로 복원
            await this.page.setViewport({ width: 1920, height: 1080 });
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            return mobileReport;

        } catch (error) {
            console.log(`   모바일 테스트 오류: ${error.message}`);
            return null;
        }
    }

    async runComprehensiveTest() {
        await this.init();

        // 테스트할 페이지 목록
        const testPages = [
            { url: `${this.baseUrl}/`, name: '홈페이지' },
            { url: `${this.baseUrl}/about/`, name: '소개 페이지' },
            { url: `${this.baseUrl}/fortune/`, name: 'AI 운세 메인' },
            { url: `${this.baseUrl}/fortune/daily/`, name: '오늘의 운세' },
            { url: `${this.baseUrl}/fortune/saju/`, name: 'AI 사주팔자' },
            { url: `${this.baseUrl}/fortune/tarot/`, name: 'AI 타로 리딩' },
            { url: `${this.baseUrl}/fortune/zodiac/`, name: '별자리 운세' },
            { url: `${this.baseUrl}/fortune/zodiac-animal/`, name: '띠별 운세' },
            { url: `${this.baseUrl}/tests/`, name: '심리테스트 메인' },
            { url: `${this.baseUrl}/tests/mbti/`, name: 'MBTI 테스트' },
            { url: `${this.baseUrl}/tests/love-dna/`, name: 'Love DNA 테스트' },
            { url: `${this.baseUrl}/tests/teto-egen/`, name: 'Teto-Egen 테스트' },
            { url: `${this.baseUrl}/tools/`, name: '실용도구 메인' },
            { url: `${this.baseUrl}/tools/bmi-calculator.html`, name: 'BMI 계산기' },
            { url: `${this.baseUrl}/tools/salary-calculator.html`, name: '연봉 계산기' },
            { url: `${this.baseUrl}/tools/text-counter.html`, name: '글자수 세기' },
            { url: `${this.baseUrl}/contact/`, name: '문의하기' },
            { url: `${this.baseUrl}/faq/`, name: 'FAQ' },
            { url: `${this.baseUrl}/privacy/`, name: '개인정보처리방침' },
            { url: `${this.baseUrl}/terms/`, name: '이용약관' }
        ];

        console.log(`📊 총 ${testPages.length}개 페이지 테스트 시작\n`);

        for (const testPage of testPages) {
            // 데스크톱 테스트
            const desktopResult = await this.testPage(testPage.url, testPage.name);
            this.report.pages[testPage.name] = desktopResult;

            // 중요 페이지만 모바일 테스트
            if (['홈페이지', 'MBTI 테스트', 'Love DNA 테스트', '오늘의 운세'].includes(testPage.name)) {
                const mobileResult = await this.testMobileView(testPage.url, testPage.name);
                if (mobileResult) {
                    this.report.pages[`${testPage.name} (Mobile)`] = mobileResult;
                }
            }

            this.report.summary.totalPages++;

            // 에러 통계
            const totalErrors = desktopResult.errors.console.length + 
                              desktopResult.errors.network.length + 
                              desktopResult.errors.javascript.length;
            
            if (totalErrors > 0) {
                this.report.summary.pagesWithErrors++;
                this.report.summary.totalErrors += totalErrors;
            }

            // 심각한 이슈 수집
            if (desktopResult.status === 'error') {
                this.report.criticalIssues.push({
                    page: testPage.name,
                    type: 'page-load-error',
                    message: `페이지 로드 실패: ${testPage.url}`
                });
            }

            if (desktopResult.errors.network.length > 0) {
                this.report.criticalIssues.push({
                    page: testPage.name,
                    type: 'network-errors',
                    count: desktopResult.errors.network.length,
                    message: `네트워크 요청 실패: ${desktopResult.errors.network.length}건`
                });
            }

            // 짧은 대기
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await this.generateRecommendations();
        await this.browser.close();

        return this.report;
    }

    async generateRecommendations() {
        const { summary, pages, criticalIssues } = this.report;

        // 성능 기반 권장사항
        if (summary.pagesWithErrors > 0) {
            this.report.recommendations.push({
                priority: 'high',
                category: 'reliability',
                message: `${summary.pagesWithErrors}개 페이지에서 오류 발견. 즉시 수정 필요.`,
                details: criticalIssues.slice(0, 5)
            });
        }

        // 접근성 권장사항
        const accessibilityIssueCount = Object.values(pages)
            .reduce((sum, page) => sum + page.accessibility.length, 0);
        
        if (accessibilityIssueCount > 0) {
            this.report.recommendations.push({
                priority: 'medium',
                category: 'accessibility',
                message: `총 ${accessibilityIssueCount}개 접근성 이슈 발견. WCAG 2.1 AA 준수를 위해 개선 필요.`
            });
        }

        // SEO 권장사항
        const seoIssues = Object.values(pages).filter(page => 
            !page.seo.title || page.seo.titleLength < 10 || page.seo.titleLength > 60 ||
            !page.seo.description || page.seo.descriptionLength < 120 || page.seo.descriptionLength > 160
        );

        if (seoIssues.length > 0) {
            this.report.recommendations.push({
                priority: 'medium',
                category: 'seo',
                message: `${seoIssues.length}개 페이지의 SEO 메타데이터 개선 필요.`
            });
        }

        // 성능 권장사항
        const slowPages = Object.values(pages).filter(page => page.loadTime > 3000);
        if (slowPages.length > 0) {
            this.report.recommendations.push({
                priority: 'medium',
                category: 'performance',
                message: `${slowPages.length}개 페이지의 로딩 속도가 3초 이상. 최적화 필요.`
            });
        }

        // 전체 성공률 계산
        const successfulPages = Object.values(pages).filter(page => page.status === 'success').length;
        const successRate = ((successfulPages / summary.totalPages) * 100).toFixed(1);
        
        this.report.summary.successRate = successRate;

        if (successRate < 90) {
            this.report.recommendations.push({
                priority: 'high',
                category: 'overall',
                message: `전체 성공률 ${successRate}%. 90% 이상 목표로 개선 필요.`
            });
        }
    }
}

const main = async () => {
    try {
        const validator = new DohaQAValidator();
        const report = await validator.runComprehensiveTest();

        // 결과 출력
        console.log('\n' + '='.repeat(50));
        console.log('🎯 doha.kr 종합 QA 검증 결과');
        console.log('='.repeat(50));
        
        console.log(`📊 테스트 완료: ${report.summary.totalPages}개 페이지`);
        console.log(`✅ 성공률: ${report.summary.successRate}%`);
        console.log(`⚠️  문제 페이지: ${report.summary.pagesWithErrors}개`);
        console.log(`🐛 총 오류: ${report.summary.totalErrors}개`);
        
        console.log('\n🔥 심각한 이슈:');
        if (report.criticalIssues.length === 0) {
            console.log('   없음 ✅');
        } else {
            report.criticalIssues.forEach(issue => {
                console.log(`   - [${issue.page}] ${issue.message}`);
            });
        }

        console.log('\n💡 권장사항:');
        report.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
        });

        // 리포트 저장
        const reportFile = `comprehensive-qa-report-${Date.now()}.json`;
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
        console.log(`\n📋 상세 리포트: ${reportFile}`);

        return report;

    } catch (error) {
        console.error('QA 검증 중 오류 발생:', error);
        throw error;
    }
};

if (require.main === module) {
    main().then(report => {
        console.log('\n✨ QA 검증 완료!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ QA 검증 실패:', error);
        process.exit(1);
    });
}

module.exports = { DohaQAValidator, main };