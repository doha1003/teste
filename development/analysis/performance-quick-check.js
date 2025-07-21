// Quick Performance Check for doha.kr
// This script performs a basic performance analysis without external dependencies

const https = require('https');
const http = require('http');
const { URL } = require('url');
const { performance } = require('perf_hooks');

const PAGES_TO_TEST = [
    'https://doha.kr/',
    'https://doha.kr/tests/',
    'https://doha.kr/tests/mbti/',
    'https://doha.kr/tools/',
    'https://doha.kr/tools/text-counter.html',
    'https://doha.kr/fortune/',
    'https://doha.kr/fortune/saju/'
];

// Performance thresholds
const THRESHOLDS = {
    ttfb: 600,      // Time to First Byte (ms)
    totalTime: 3000, // Total load time (ms)
    size: 500000,    // Page size (bytes)
    resources: 50    // Number of external resources
};

class PerformanceChecker {
    constructor() {
        this.results = [];
    }
    
    async checkPage(url) {
        console.log(`\n🔍 Checking: ${url}`);
        const startTime = performance.now();
        
        try {
            const result = await this.fetchPageWithMetrics(url);
            const endTime = performance.now();
            
            const totalTime = Math.round(endTime - startTime);
            const issues = [];
            
            // Check TTFB
            if (result.ttfb > THRESHOLDS.ttfb) {
                issues.push(`High TTFB: ${result.ttfb}ms (threshold: ${THRESHOLDS.ttfb}ms)`);
            }
            
            // Check total time
            if (totalTime > THRESHOLDS.totalTime) {
                issues.push(`Slow load time: ${totalTime}ms (threshold: ${THRESHOLDS.totalTime}ms)`);
            }
            
            // Check page size
            if (result.size > THRESHOLDS.size) {
                const sizeKB = Math.round(result.size / 1024);
                const thresholdKB = Math.round(THRESHOLDS.size / 1024);
                issues.push(`Large page size: ${sizeKB}KB (threshold: ${thresholdKB}KB)`);
            }
            
            // Count external resources
            const resourceCount = result.externalResources.length;
            if (resourceCount > THRESHOLDS.resources) {
                issues.push(`Too many resources: ${resourceCount} (threshold: ${THRESHOLDS.resources})`);
            }
            
            const pageResult = {
                url,
                ttfb: result.ttfb,
                totalTime,
                size: result.size,
                sizeKB: Math.round(result.size / 1024),
                compression: result.compression,
                resourceCount,
                issues,
                passed: issues.length === 0,
                headers: result.headers,
                externalResources: result.externalResources
            };
            
            this.displayPageResult(pageResult);
            this.results.push(pageResult);
            
            return pageResult;
            
        } catch (error) {
            console.error(`❌ Error checking ${url}:`, error.message);
            return {
                url,
                error: error.message,
                passed: false
            };
        }
    }
    
    fetchPageWithMetrics(url) {
        return new Promise((resolve, reject) => {
            const startTime = performance.now();
            let ttfb = null;
            
            const urlObj = new URL(url);
            const client = urlObj.protocol === 'https:' ? https : http;
            
            const req = client.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br'
                }
            }, (res) => {
                if (!ttfb) {
                    ttfb = Math.round(performance.now() - startTime);
                }
                
                let data = '';
                let size = 0;
                
                res.on('data', chunk => {
                    data += chunk;
                    size += chunk.length;
                });
                
                res.on('end', () => {
                    // Parse HTML to find external resources
                    const externalResources = this.extractExternalResources(data, urlObj.origin);
                    
                    resolve({
                        ttfb,
                        size,
                        compression: res.headers['content-encoding'],
                        headers: res.headers,
                        statusCode: res.statusCode,
                        externalResources
                    });
                });
            });
            
            req.on('error', reject);
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }
    
    extractExternalResources(html, origin) {
        const resources = [];
        
        // Find CSS files
        const cssRegex = /<link[^>]+href=["']([^"']+\.css[^"']*)/gi;
        let match;
        while ((match = cssRegex.exec(html)) !== null) {
            resources.push({ type: 'css', url: match[1] });
        }
        
        // Find JavaScript files
        const jsRegex = /<script[^>]+src=["']([^"']+)/gi;
        while ((match = jsRegex.exec(html)) !== null) {
            resources.push({ type: 'js', url: match[1] });
        }
        
        // Find images
        const imgRegex = /<img[^>]+src=["']([^"']+)/gi;
        while ((match = imgRegex.exec(html)) !== null) {
            resources.push({ type: 'img', url: match[1] });
        }
        
        // Filter external resources
        return resources.filter(r => {
            return r.url.startsWith('http') || r.url.startsWith('//');
        });
    }
    
    displayPageResult(result) {
        const status = result.passed ? '✅' : '❌';
        console.log(`\n${status} ${result.url}`);
        
        if (!result.error) {
            console.log(`   TTFB: ${result.ttfb}ms`);
            console.log(`   Total Time: ${result.totalTime}ms`);
            console.log(`   Size: ${result.sizeKB}KB`);
            console.log(`   Compression: ${result.compression || 'none'}`);
            console.log(`   External Resources: ${result.resourceCount}`);
            
            if (result.issues.length > 0) {
                console.log(`   Issues:`);
                result.issues.forEach(issue => {
                    console.log(`     - ${issue}`);
                });
            }
            
            // Check important headers
            const importantHeaders = [
                'cache-control',
                'x-frame-options',
                'x-content-type-options',
                'strict-transport-security',
                'content-security-policy'
            ];
            
            console.log(`   Security Headers:`);
            importantHeaders.forEach(header => {
                const value = result.headers[header];
                const status = value ? '✓' : '✗';
                console.log(`     ${status} ${header}: ${value || 'missing'}`);
            });
        }
    }
    
    async runAllChecks() {
        console.log('🚀 Starting performance check for doha.kr...\n');
        console.log('⚡ Performance Thresholds:');
        console.log(`   TTFB: ${THRESHOLDS.ttfb}ms`);
        console.log(`   Total Time: ${THRESHOLDS.totalTime}ms`);
        console.log(`   Page Size: ${Math.round(THRESHOLDS.size / 1024)}KB`);
        console.log(`   Resource Count: ${THRESHOLDS.resources}`);
        
        for (const url of PAGES_TO_TEST) {
            await this.checkPage(url);
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        this.displaySummary();
    }
    
    displaySummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 PERFORMANCE CHECK SUMMARY');
        console.log('='.repeat(60));
        
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        
        console.log(`\nTotal Pages: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${total - passed}`);
        
        // Calculate averages
        const validResults = this.results.filter(r => !r.error);
        if (validResults.length > 0) {
            const avgTTFB = Math.round(
                validResults.reduce((sum, r) => sum + r.ttfb, 0) / validResults.length
            );
            const avgTime = Math.round(
                validResults.reduce((sum, r) => sum + r.totalTime, 0) / validResults.length
            );
            const avgSize = Math.round(
                validResults.reduce((sum, r) => sum + r.sizeKB, 0) / validResults.length
            );
            
            console.log(`\n📈 Averages:`);
            console.log(`   TTFB: ${avgTTFB}ms`);
            console.log(`   Load Time: ${avgTime}ms`);
            console.log(`   Page Size: ${avgSize}KB`);
        }
        
        // Common issues
        const allIssues = this.results.flatMap(r => r.issues || []);
        const issueTypes = {};
        
        allIssues.forEach(issue => {
            const type = issue.split(':')[0];
            issueTypes[type] = (issueTypes[type] || 0) + 1;
        });
        
        if (Object.keys(issueTypes).length > 0) {
            console.log(`\n🔍 Common Issues:`);
            Object.entries(issueTypes)
                .sort((a, b) => b[1] - a[1])
                .forEach(([type, count]) => {
                    console.log(`   ${type}: ${count} pages`);
                });
        }
        
        // Recommendations
        console.log(`\n💡 Recommendations:`);
        
        if (issueTypes['High TTFB']) {
            console.log(`   - Optimize server response time`);
            console.log(`   - Consider using a CDN`);
            console.log(`   - Enable server-side caching`);
        }
        
        if (issueTypes['Large page size']) {
            console.log(`   - Compress images (use WebP format)`);
            console.log(`   - Minify CSS and JavaScript`);
            console.log(`   - Enable GZIP compression`);
        }
        
        if (issueTypes['Too many resources']) {
            console.log(`   - Bundle CSS and JavaScript files`);
            console.log(`   - Implement lazy loading for images`);
            console.log(`   - Use HTTP/2 server push`);
        }
        
        // Missing security headers
        const securityHeaders = ['x-frame-options', 'x-content-type-options', 'strict-transport-security'];
        const missingHeaders = new Set();
        
        this.results.forEach(result => {
            if (result.headers) {
                securityHeaders.forEach(header => {
                    if (!result.headers[header]) {
                        missingHeaders.add(header);
                    }
                });
            }
        });
        
        if (missingHeaders.size > 0) {
            console.log(`\n🔒 Missing Security Headers:`);
            missingHeaders.forEach(header => {
                console.log(`   - ${header}`);
            });
        }
        
        console.log('\n✨ Performance check complete!');
    }
}

// Run the checker
const checker = new PerformanceChecker();
checker.runAllChecks().catch(console.error);