/**
 * QUICK QA TEST FOR DOHA.KR LIVE SITE
 * Tests the most critical pages with essential quality metrics
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

class QuickQATest {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            summary: { total: 0, passed: 0, failed: 0 },
            pages: {}
        };
        
        // Critical pages to test
        this.testPages = [
            { name: 'Homepage', url: 'https://doha.kr/', priority: 'critical' },
            { name: 'MBTI Test', url: 'https://doha.kr/tests/mbti/test.html', priority: 'high' },
            { name: 'Saju Fortune', url: 'https://doha.kr/fortune/saju/', priority: 'high' },
            { name: 'Text Counter', url: 'https://doha.kr/tools/text-counter.html', priority: 'medium' },
            { name: 'About Page', url: 'https://doha.kr/about/', priority: 'medium' }
        ];
    }
    
    async runQuickTest() {
        // console.log removed('🔍 STARTING QUICK QA TEST FOR DOHA.KR');
        // console.log removed('=====================================');
        
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        
        try {
            for (const testPage of this.testPages) {
                // console.log removed(`\n📄 Testing: ${testPage.name}`);
                
                const result = await this.testPage(browser, testPage);
                this.results.pages[testPage.name] = result;
                this.results.summary.total++;
                
                if (result.overall === 'passed') {
                    this.results.summary.passed++;
                    // console.log removed(`  ✅ ${testPage.name}: PASSED`);
                } else {
                    this.results.summary.failed++;
                    // console.log removed(`  ❌ ${testPage.name}: FAILED`);
                }
            }
        } catch (error) {
            // console.error removed('Error during testing:', error);
        } finally {
            await browser.close();
        }
        
        await this.generateReport();
        this.printSummary();
    }
    
    async testPage(browser, testPage) {
        const page = await browser.newPage();
        const result = {
            url: testPage.url,
            priority: testPage.priority,
            loading: { passed: false, loadTime: 0 },
            rendering: { passed: false, issues: [] },
            functionality: { passed: false, issues: [] },
            performance: { passed: false, score: 0 },
            overall: 'failed'
        };
        
        try {
            // Test 1: Loading
            const startTime = Date.now();
            await page.goto(testPage.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            const loadTime = Date.now() - startTime;
            
            result.loading.loadTime = loadTime;
            result.loading.passed = loadTime < 5000; // 5 second threshold
            
            // Test 2: Basic Rendering
            await page.waitForLoadState('networkidle');
            
            const hasTitle = await page.title();
            const hasNavigation = await page.$('nav, .navbar, header') !== null;
            const hasMainContent = await page.$('main, .content, .container, .page-content') !== null;
            const hasFooter = await page.$('footer') !== null;
            
            if (!hasTitle) result.rendering.issues.push('Missing page title');
            if (!hasNavigation) result.rendering.issues.push('Missing navigation');
            if (!hasMainContent) result.rendering.issues.push('Missing main content');
            if (!hasFooter) result.rendering.issues.push('Missing footer');
            
            result.rendering.passed = result.rendering.issues.length === 0;
            
            // Test 3: Functionality
            const hasWorkingCSS = await page.evaluate(() => {
                const computedStyle = window.getComputedStyle(document.body);
                return computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
                       computedStyle.fontSize !== '16px';
            });
            
            const hasWorkingJS = await page.evaluate(() => {
                return typeof window !== 'undefined' && 
                       (typeof window.analytics !== 'undefined' || 
                        typeof window.gtag !== 'undefined' ||
                        document.querySelectorAll('script').length > 0);
            });
            
            if (!hasWorkingCSS) result.functionality.issues.push('CSS not loading properly');
            if (!hasWorkingJS) result.functionality.issues.push('JavaScript not executing');
            
            result.functionality.passed = result.functionality.issues.length === 0;
            
            // Test 4: Performance Score
            const resourceCount = await page.evaluate(() => {
                return performance.getEntriesByType('resource').length;
            });
            
            let score = 100;
            if (loadTime > 3000) score -= 30;
            else if (loadTime > 2000) score -= 15;
            if (resourceCount > 50) score -= 20;
            if (!hasWorkingCSS || !hasWorkingJS) score -= 25;
            
            result.performance.score = Math.max(0, score);
            result.performance.passed = score >= 70;
            
            // Overall Status
            const testsPassed = [
                result.loading.passed,
                result.rendering.passed,
                result.functionality.passed,
                result.performance.passed
            ].filter(Boolean).length;
            
            result.overall = testsPassed >= 3 ? 'passed' : 'failed';
            
        } catch (error) {
            result.error = error.message;
            result.overall = 'failed';
        } finally {
            await page.close();
        }
        
        return result;
    }
    
    async generateReport() {
        const report = `# DOHA.KR QUICK QA REPORT
Generated: ${new Date().toLocaleString()}

## 📊 SUMMARY
- **Total Pages Tested**: ${this.results.summary.total}
- **Pages Passed**: ${this.results.summary.passed}
- **Pages Failed**: ${this.results.summary.failed}
- **Success Rate**: ${(this.results.summary.passed / this.results.summary.total * 100).toFixed(1)}%

## 📋 DETAILED RESULTS

${Object.entries(this.results.pages).map(([name, result]) => `
### ${name}
**URL**: ${result.url}
**Priority**: ${result.priority.toUpperCase()}
**Overall Status**: ${result.overall.toUpperCase()}

**Loading**: ${result.loading.passed ? '✅' : '❌'} (${result.loading.loadTime}ms)
**Rendering**: ${result.rendering.passed ? '✅' : '❌'} ${result.rendering.issues.length > 0 ? `(Issues: ${result.rendering.issues.join(', ')})` : ''}
**Functionality**: ${result.functionality.passed ? '✅' : '❌'} ${result.functionality.issues.length > 0 ? `(Issues: ${result.functionality.issues.join(', ')})` : ''}
**Performance**: ${result.performance.passed ? '✅' : '❌'} (Score: ${result.performance.score}/100)

${result.error ? `**Error**: ${result.error}` : ''}
`).join('\n')}

## 🎯 RECOMMENDATIONS

${this.generateRecommendations()}

---
*Quick QA Test - Enterprise Quality Assurance*`;

        await fs.writeFile('quick-qa-report.md', report);
        await fs.writeFile('quick-qa-results.json', JSON.stringify(this.results, null, 2));
    }
    
    generateRecommendations() {
        const failedPages = Object.entries(this.results.pages)
            .filter(([_, result]) => result.overall === 'failed');
        
        if (failedPages.length === 0) {
            return '✅ All tested pages are performing well. Continue monitoring quality metrics.';
        }
        
        const recs = ['🚨 **IMMEDIATE ACTIONS REQUIRED**:'];
        
        failedPages.forEach(([name, result]) => {
            if (result.priority === 'critical') {
                recs.push(`- **CRITICAL**: Fix ${name} immediately - core functionality compromised`);
            } else {
                recs.push(`- **${result.priority.toUpperCase()}**: Address issues on ${name}`);
            }
        });
        
        return recs.join('\n');
    }
    
    printSummary() {
        // console.log removed('\n🎉 QUICK QA TEST COMPLETE');
        // console.log removed('========================');
        // console.log removed(`📊 Total: ${this.results.summary.total}`);
        // console.log removed(`✅ Passed: ${this.results.summary.passed}`);
        // console.log removed(`❌ Failed: ${this.results.summary.failed}`);
        
        const successRate = (this.results.summary.passed / this.results.summary.total * 100).toFixed(1);
        // console.log removed(`📈 Success Rate: ${successRate}%`);
        
        // console.log removed('\n📋 Reports Generated:');
        // console.log removed('- quick-qa-report.md');
        // console.log removed('- quick-qa-results.json');
    }
}

// Run the test
const qa = new QuickQATest();
qa.runQuickTest().catch(err => {
        // Error handling
    });