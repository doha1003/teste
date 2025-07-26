// Lighthouse Performance Testing Script
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const TEST_CONFIG = {
    baseUrl: 'https://doha.kr',
    outputDir: './lighthouse-reports',
    pages: [
        { name: 'homepage', url: '/' },
        { name: 'tests', url: '/tests/' },
        { name: 'mbti-test', url: '/tests/mbti/' },
        { name: 'tools', url: '/tools/' },
        { name: 'text-counter', url: '/tools/text-counter.html' },
        { name: 'fortune', url: '/fortune/' },
        { name: 'saju', url: '/fortune/saju/' }
    ],
    lighthouseConfig: {
        extends: 'lighthouse:default',
        settings: {
            onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
            emulatedFormFactor: 'desktop',
            throttling: {
                rttMs: 40,
                throughputKbps: 10 * 1024,
                cpuSlowdownMultiplier: 1
            }
        }
    }
};

// Performance thresholds
const THRESHOLDS = {
    performance: 90,
    accessibility: 95,
    'best-practices': 90,
    seo: 95,
    pwa: 90
};

class LighthouseRunner {
    constructor(config) {
        this.config = config;
        this.results = [];
        this.browser = null;
    }
    
    async init() {
        // Create output directory
        await fs.mkdir(this.config.outputDir, { recursive: true });
        
        // Launch Puppeteer
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
    
    async runTest(page) {
        const url = this.config.baseUrl + page.url;
        // console.log removed(`\n🔍 Testing: ${page.name} (${url})`);
        
        try {
            // Run Lighthouse
            const { lhr } = await lighthouse(url, {
                port: new URL(this.browser.wsEndpoint()).port,
                output: 'json',
                ...this.config.lighthouseConfig
            });
            
            // Extract scores
            const scores = {};
            for (const [key, category] of Object.entries(lhr.categories)) {
                scores[key] = Math.round(category.score * 100);
            }
            
            // Check thresholds
            const issues = [];
            for (const [category, threshold] of Object.entries(THRESHOLDS)) {
                if (scores[category] < threshold) {
                    issues.push({
                        category,
                        score: scores[category],
                        threshold,
                        delta: threshold - scores[category]
                    });
                }
            }
            
            // Extract key metrics
            const metrics = {
                FCP: lhr.audits['first-contentful-paint'].numericValue,
                LCP: lhr.audits['largest-contentful-paint'].numericValue,
                TTI: lhr.audits['interactive'].numericValue,
                TBT: lhr.audits['total-blocking-time'].numericValue,
                CLS: lhr.audits['cumulative-layout-shift'].numericValue,
                SI: lhr.audits['speed-index'].numericValue
            };
            
            // Get improvement opportunities
            const opportunities = lhr.audits
                .filter(audit => audit.score < 1 && audit.details && audit.details.type === 'opportunity')
                .map(audit => ({
                    title: audit.title,
                    impact: audit.details.overallSavingsMs || 0,
                    description: audit.description
                }))
                .sort((a, b) => b.impact - a.impact)
                .slice(0, 5);
            
            // Save detailed report
            await fs.writeFile(
                path.join(this.config.outputDir, `${page.name}-report.json`),
                JSON.stringify(lhr, null, 2)
            );
            
            // Save HTML report
            const htmlReport = await lighthouse.generateReport(lhr, 'html');
            await fs.writeFile(
                path.join(this.config.outputDir, `${page.name}-report.html`),
                htmlReport
            );
            
            const result = {
                page: page.name,
                url,
                scores,
                metrics,
                issues,
                opportunities,
                passed: issues.length === 0
            };
            
            this.results.push(result);
            
            // Display results
            this.displayPageResults(result);
            
            return result;
            
        } catch (error) {
            // console.error removed(`❌ Error testing ${page.name}:`, error.message);
            return {
                page: page.name,
                url,
                error: error.message,
                passed: false
            };
        }
    }
    
    displayPageResults(result) {
        // console.log removed('\n📊 Scores:');
        for (const [category, score] of Object.entries(result.scores)) {
            const emoji = score >= THRESHOLDS[category] ? '✅' : '⚠️';
            // console.log removed(`${emoji} ${category}: ${score}/100`);
        }
        
        if (result.metrics) {
            // console.log removed('\n⚡ Performance Metrics:');
            // console.log removed(`   FCP: ${Math.round(result.metrics.FCP)}ms`);
            // console.log removed(`   LCP: ${Math.round(result.metrics.LCP)}ms`);
            // console.log removed(`   TTI: ${Math.round(result.metrics.TTI)}ms`);
            // console.log removed(`   TBT: ${Math.round(result.metrics.TBT)}ms`);
            // console.log removed(`   CLS: ${result.metrics.CLS.toFixed(3)}`);
            // console.log removed(`   SI: ${Math.round(result.metrics.SI)}ms`);
        }
        
        if (result.issues.length > 0) {
            // console.log removed('\n⚠️  Issues:');
            result.issues.forEach(issue => {
                // console.log removed(`   ${issue.category}: ${issue.score} (needs ${issue.threshold})`);
            });
        }
        
        if (result.opportunities && result.opportunities.length > 0) {
            // console.log removed('\n💡 Top Opportunities:');
            result.opportunities.forEach(opp => {
                if (opp.impact > 0) {
                    // console.log removed(`   - ${opp.title} (${Math.round(opp.impact)}ms potential savings)`);
                }
            });
        }
    }
    
    async runAllTests() {
        await this.init();
        
        // console.log removed('🚀 Starting Lighthouse tests for doha.kr...\n');
        
        // Run tests for each page
        for (const page of this.config.pages) {
            await this.runTest(page);
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Generate summary report
        await this.generateSummaryReport();
        
        // Cleanup
        await this.browser.close();
        
        return this.results;
    }
    
    async generateSummaryReport() {
        const summary = {
            timestamp: new Date().toISOString(),
            baseUrl: this.config.baseUrl,
            totalPages: this.results.length,
            passed: this.results.filter(r => r.passed).length,
            failed: this.results.filter(r => !r.passed).length,
            averageScores: {},
            commonIssues: {},
            results: this.results
        };
        
        // Calculate average scores
        const categories = ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'];
        categories.forEach(category => {
            const scores = this.results
                .filter(r => r.scores && r.scores[category])
                .map(r => r.scores[category]);
            
            if (scores.length > 0) {
                summary.averageScores[category] = Math.round(
                    scores.reduce((a, b) => a + b, 0) / scores.length
                );
            }
        });
        
        // Find common issues
        this.results.forEach(result => {
            if (result.issues) {
                result.issues.forEach(issue => {
                    if (!summary.commonIssues[issue.category]) {
                        summary.commonIssues[issue.category] = 0;
                    }
                    summary.commonIssues[issue.category]++;
                });
            }
        });
        
        // Save summary
        await fs.writeFile(
            path.join(this.config.outputDir, 'summary.json'),
            JSON.stringify(summary, null, 2)
        );
        
        // Display summary
        // console.log removed('\n' + '='.repeat(60));
        // console.log removed('📊 LIGHTHOUSE TEST SUMMARY');
        // console.log removed('='.repeat(60));
        // console.log removed(`\n📅 Date: ${new Date().toLocaleString()}`);
        // console.log removed(`🌐 Site: ${this.config.baseUrl}`);
        // console.log removed(`📄 Pages tested: ${summary.totalPages}`);
        // console.log removed(`✅ Passed: ${summary.passed}`);
        // console.log removed(`❌ Failed: ${summary.failed}`);
        
        // console.log removed('\n📈 Average Scores:');
        for (const [category, score] of Object.entries(summary.averageScores)) {
            const emoji = score >= THRESHOLDS[category] ? '✅' : '⚠️';
            // console.log removed(`${emoji} ${category}: ${score}/100`);
        }
        
        if (Object.keys(summary.commonIssues).length > 0) {
            // console.log removed('\n🔍 Common Issues:');
            for (const [issue, count] of Object.entries(summary.commonIssues)) {
                // console.log removed(`   ${issue}: ${count} pages affected`);
            }
        }
        
        // console.log removed('\n📁 Reports saved to:', path.resolve(this.config.outputDir));
        // console.log removed('   - Individual HTML reports for each page');
        // console.log removed('   - summary.json with all results');
        
        // Generate markdown report
        await this.generateMarkdownReport(summary);
    }
    
    async generateMarkdownReport(summary) {
        let markdown = `# Lighthouse Test Report - doha.kr

📅 **Date:** ${new Date().toLocaleString()}  
🌐 **Site:** ${this.config.baseUrl}  
📄 **Pages tested:** ${summary.totalPages}  

## 📊 Overall Results

| Status | Count |
|--------|-------|
| ✅ Passed | ${summary.passed} |
| ❌ Failed | ${summary.failed} |

## 📈 Average Scores

| Category | Score | Target | Status |
|----------|-------|--------|--------|
`;
        
        for (const [category, score] of Object.entries(summary.averageScores)) {
            const target = THRESHOLDS[category];
            const status = score >= target ? '✅' : '❌';
            markdown += `| ${category} | ${score}/100 | ${target}/100 | ${status} |\n`;
        }
        
        markdown += `\n## 📄 Page Results\n\n`;
        
        this.results.forEach(result => {
            markdown += `### ${result.page}\n`;
            markdown += `**URL:** ${result.url}\n\n`;
            
            if (result.error) {
                markdown += `❌ **Error:** ${result.error}\n\n`;
            } else {
                markdown += `| Category | Score | Status |\n`;
                markdown += `|----------|-------|--------|\n`;
                
                for (const [category, score] of Object.entries(result.scores)) {
                    const status = score >= THRESHOLDS[category] ? '✅' : '❌';
                    markdown += `| ${category} | ${score}/100 | ${status} |\n`;
                }
                
                if (result.opportunities && result.opportunities.length > 0) {
                    markdown += `\n**💡 Top Opportunities:**\n`;
                    result.opportunities.forEach(opp => {
                        if (opp.impact > 0) {
                            markdown += `- ${opp.title} (${Math.round(opp.impact)}ms)\n`;
                        }
                    });
                }
            }
            
            markdown += `\n---\n\n`;
        });
        
        if (Object.keys(summary.commonIssues).length > 0) {
            markdown += `## 🔍 Common Issues\n\n`;
            markdown += `| Issue | Pages Affected |\n`;
            markdown += `|-------|----------------|\n`;
            
            for (const [issue, count] of Object.entries(summary.commonIssues)) {
                markdown += `| ${issue} | ${count} |\n`;
            }
        }
        
        markdown += `\n## 🎯 Recommendations\n\n`;
        
        // Add recommendations based on common issues
        if (summary.commonIssues.performance) {
            markdown += `### Performance\n`;
            markdown += `- Optimize images (convert to WebP, implement lazy loading)\n`;
            markdown += `- Minimize JavaScript execution time\n`;
            markdown += `- Reduce server response times\n`;
            markdown += `- Implement resource hints (preconnect, prefetch)\n\n`;
        }
        
        if (summary.commonIssues.accessibility) {
            markdown += `### Accessibility\n`;
            markdown += `- Ensure all images have alt text\n`;
            markdown += `- Improve color contrast ratios\n`;
            markdown += `- Add proper ARIA labels\n`;
            markdown += `- Ensure keyboard navigation works properly\n\n`;
        }
        
        if (summary.commonIssues.seo) {
            markdown += `### SEO\n`;
            markdown += `- Ensure all pages have unique meta descriptions\n`;
            markdown += `- Implement structured data\n`;
            markdown += `- Optimize heading hierarchy\n`;
            markdown += `- Create XML sitemap\n\n`;
        }
        
        await fs.writeFile(
            path.join(this.config.outputDir, 'lighthouse-report.md'),
            markdown
        );
        
        // console.log removed('\n📝 Markdown report saved:', path.join(this.config.outputDir, 'lighthouse-report.md'));
    }
}

// Run tests if called directly
if (require.main === module) {
    const runner = new LighthouseRunner(TEST_CONFIG);
    
    runner.runAllTests()
        .then(results => {
            const passed = results.filter(r => r.passed).length;
            const total = results.length;
            
            // console.log removed(`\n✨ Testing complete! ${passed}/${total} pages passed all thresholds.`);
            process.exit(passed === total ? 0 : 1);
        })
        .catch(error => {
            // console.error removed('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { LighthouseRunner, TEST_CONFIG };