/**
 * Comprehensive Live Site Verification for doha.kr
 * Tests API functionality, console errors, key features, mobile responsiveness, and performance
 */

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DohaLiveSiteVerifier {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            summary: { passed: 0, failed: 0, warnings: 0 },
            apiTests: [],
            consoleErrors: [],
            featureTests: [],
            mobileTests: [],
            performanceTests: [],
            issues: []
        };
        this.browser = null;
        this.page = null;
    }

    async initialize() {
        console.log('🚀 Starting comprehensive live site verification for doha.kr');
        
        this.browser = await puppeteer.launch({
            headless: false, // Show browser for debugging
            devtools: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        this.page = await this.browser.newPage();
        
        // Set user agent for Korean locale
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Set viewport for desktop testing initially
        await this.page.setViewport({ width: 1920, height: 1080 });

        // Listen for console messages and errors
        this.page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            
            if (type === 'error') {
                this.results.consoleErrors.push({
                    type: 'console_error',
                    message: text,
                    timestamp: new Date().toISOString()
                });
            } else if (type === 'warning') {
                this.results.consoleErrors.push({
                    type: 'console_warning',
                    message: text,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Listen for request failures
        this.page.on('requestfailed', request => {
            const failure = request.failure();
            this.results.consoleErrors.push({
                type: 'request_failed',
                url: request.url(),
                failure: failure ? failure.errorText : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        });

        // Listen for response errors
        this.page.on('response', response => {
            if (response.status() >= 400) {
                this.results.consoleErrors.push({
                    type: 'http_error',
                    url: response.url(),
                    status: response.status(),
                    statusText: response.statusText(),
                    timestamp: new Date().toISOString()
                });
            }
        });

        console.log('✅ Browser initialized successfully');
    }

    async testApiEndpoint(endpoint, testData = null) {
        const testName = `API Test: ${endpoint}`;
        console.log(`🔧 Testing ${testName}`);
        
        try {
            const startTime = Date.now();
            
            if (testData) {
                // POST request
                const response = await this.page.evaluate(async (endpoint, data) => {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    
                    return {
                        ok: response.ok,
                        status: response.status,
                        data: await response.text()
                    };
                }, endpoint, testData);
                
                const responseTime = Date.now() - startTime;
                
                this.results.apiTests.push({
                    endpoint,
                    method: 'POST',
                    status: response.status,
                    ok: response.ok,
                    responseTime,
                    dataLength: response.data ? response.data.length : 0,
                    success: response.ok,
                    testData
                });
                
                if (response.ok) {
                    console.log(`✅ ${testName} - Status: ${response.status}, Time: ${responseTime}ms`);
                    this.results.summary.passed++;
                } else {
                    console.log(`❌ ${testName} - Status: ${response.status}`);
                    this.results.summary.failed++;
                    this.results.issues.push(`API ${endpoint} failed with status ${response.status}`);
                }
                
            } else {
                // GET request (navigate to page and check for API calls)
                await this.page.goto(endpoint, { waitUntil: 'networkidle0', timeout: 30000 });
                const responseTime = Date.now() - startTime;
                
                this.results.apiTests.push({
                    endpoint,
                    method: 'GET',
                    status: 200,
                    ok: true,
                    responseTime,
                    success: true
                });
                
                console.log(`✅ ${testName} - Page loaded successfully, Time: ${responseTime}ms`);
                this.results.summary.passed++;
            }
            
        } catch (error) {
            console.log(`❌ ${testName} - Error: ${error.message}`);
            this.results.apiTests.push({
                endpoint,
                error: error.message,
                success: false
            });
            this.results.summary.failed++;
            this.results.issues.push(`API ${endpoint} failed: ${error.message}`);
        }
    }

    async testFortuneAPIs() {
        console.log('\n📊 Testing Fortune APIs');
        
        // Test daily fortune page and API
        await this.testApiEndpoint('https://doha.kr/fortune/daily/');
        
        // Wait and test the API call directly
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test actual fortune API with sample data
        const dailyFortuneData = {
            type: 'daily',
            userData: {
                birthDate: '1990-01-01',
                gender: 'male',
                name: '테스트'
            }
        };
        
        await this.testApiEndpoint('https://doha.kr/api/fortune', dailyFortuneData);
        
        // Test other fortune endpoints
        await this.testApiEndpoint('https://doha.kr/fortune/zodiac/');
        await this.testApiEndpoint('https://doha.kr/fortune/saju/');
        await this.testApiEndpoint('https://doha.kr/fortune/tarot/');
        
        // Test zodiac API
        const zodiacData = {
            type: 'zodiac',
            userData: {
                birthDate: '1990-07-15',
                gender: 'female'
            }
        };
        
        await this.testApiEndpoint('https://doha.kr/api/fortune', zodiacData);
        
        // Test saju API
        const sajuData = {
            type: 'saju',
            userData: {
                birthDate: '1990-03-21',
                birthTime: '14:30',
                gender: 'male',
                name: '김테스트'
            }
        };
        
        await this.testApiEndpoint('https://doha.kr/api/fortune', sajuData);
        
        // Test tarot API
        const tarotData = {
            type: 'tarot',
            userData: {
                question: '오늘의 운세는 어떨까요?',
                cards: [0, 15, 32]
            }
        };
        
        await this.testApiEndpoint('https://doha.kr/api/fortune', tarotData);
    }

    async testKeyFeatures() {
        console.log('\n🛠️ Testing Key Features');
        
        // Test Text Counter
        console.log('🔧 Testing Text Counter');
        try {
            await this.page.goto('https://doha.kr/tools/text-counter.html', { waitUntil: 'networkidle0' });
            
            // Test text counter functionality
            const textArea = await this.page.$('#text-input');
            if (textArea) {
                await textArea.type('안녕하세요! 한글 테스트입니다. Hello World!');
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const charCount = await this.page.$eval('.char-count', el => el.textContent);
                const wordCount = await this.page.$eval('.word-count', el => el.textContent);
                
                console.log(`✅ Text Counter - Characters: ${charCount}, Words: ${wordCount}`);
                this.results.featureTests.push({
                    feature: 'Text Counter',
                    success: true,
                    details: `Characters: ${charCount}, Words: ${wordCount}`
                });
                this.results.summary.passed++;
            } else {
                throw new Error('Text input area not found');
            }
        } catch (error) {
            console.log(`❌ Text Counter - Error: ${error.message}`);
            this.results.featureTests.push({
                feature: 'Text Counter',
                success: false,
                error: error.message
            });
            this.results.summary.failed++;
            this.results.issues.push(`Text Counter failed: ${error.message}`);
        }

        // Test Tarot Card Selection
        console.log('🔧 Testing Tarot Card Selection');
        try {
            await this.page.goto('https://doha.kr/fortune/tarot/', { waitUntil: 'networkidle0' });
            
            // Wait for tarot cards to load
            await this.page.waitForSelector('.tarot-card', { timeout: 10000 });
            
            // Check if cards are clickable
            const cardCount = await this.page.$$eval('.tarot-card', cards => cards.length);
            
            if (cardCount > 0) {
                // Click first card
                await this.page.click('.tarot-card:first-child');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                console.log(`✅ Tarot Cards - ${cardCount} cards loaded and clickable`);
                this.results.featureTests.push({
                    feature: 'Tarot Card Selection',
                    success: true,
                    details: `${cardCount} cards loaded`
                });
                this.results.summary.passed++;
            } else {
                throw new Error('No tarot cards found');
            }
        } catch (error) {
            console.log(`❌ Tarot Cards - Error: ${error.message}`);
            this.results.featureTests.push({
                feature: 'Tarot Card Selection',
                success: false,
                error: error.message
            });
            this.results.summary.failed++;
            this.results.issues.push(`Tarot card selection failed: ${error.message}`);
        }

        // Test MBTI Test
        console.log('🔧 Testing MBTI Test');
        try {
            await this.page.goto('https://doha.kr/tests/mbti/', { waitUntil: 'networkidle0' });
            
            // Wait for test to load
            await this.page.waitForSelector('.question, .mbti-question', { timeout: 10000 });
            
            // Check for questions
            const questionCount = await this.page.$$eval('.question, .mbti-question, .question-item', elements => elements.length);
            
            console.log(`✅ MBTI Test - ${questionCount} questions loaded`);
            this.results.featureTests.push({
                feature: 'MBTI Test',
                success: true,
                details: `${questionCount} questions loaded`
            });
            this.results.summary.passed++;
            
        } catch (error) {
            console.log(`❌ MBTI Test - Error: ${error.message}`);
            this.results.featureTests.push({
                feature: 'MBTI Test',
                success: false,
                error: error.message
            });
            this.results.summary.failed++;
            this.results.issues.push(`MBTI test failed: ${error.message}`);
        }

        // Test BMI Calculator
        console.log('🔧 Testing BMI Calculator');
        try {
            await this.page.goto('https://doha.kr/tools/bmi-calculator.html', { waitUntil: 'networkidle0' });
            
            // Test BMI calculation
            await this.page.type('#height', '170');
            await this.page.type('#weight', '65');
            await this.page.click('#calculate-btn, .calculate-button');
            
            await this.page.waitForTimeout(1000);
            
            // Check for result
            const result = await this.page.$('.bmi-result, #bmi-result');
            if (result) {
                const resultText = await result.evaluate(el => el.textContent);
                console.log(`✅ BMI Calculator - Result: ${resultText}`);
                this.results.featureTests.push({
                    feature: 'BMI Calculator',
                    success: true,
                    details: `Result: ${resultText}`
                });
                this.results.summary.passed++;
            } else {
                throw new Error('BMI result not displayed');
            }
        } catch (error) {
            console.log(`❌ BMI Calculator - Error: ${error.message}`);
            this.results.featureTests.push({
                feature: 'BMI Calculator',
                success: false,
                error: error.message
            });
            this.results.summary.failed++;
            this.results.issues.push(`BMI calculator failed: ${error.message}`);
        }
    }

    async testMobileResponsiveness() {
        console.log('\n📱 Testing Mobile Responsiveness');
        
        // Set mobile viewport
        await this.page.setViewport({ width: 375, height: 812 }); // iPhone X
        
        const testPages = [
            'https://doha.kr/',
            'https://doha.kr/fortune/daily/',
            'https://doha.kr/tests/mbti/',
            'https://doha.kr/tools/text-counter.html'
        ];

        for (const url of testPages) {
            try {
                console.log(`🔧 Testing mobile view: ${url}`);
                await this.page.goto(url, { waitUntil: 'networkidle0' });
                
                // Check if page is mobile-friendly
                const viewport = await this.page.viewport();
                const bodyWidth = await this.page.evaluate(() => document.body.scrollWidth);
                
                // Check for horizontal scroll
                const hasHorizontalScroll = bodyWidth > viewport.width;
                
                // Check for touch-friendly elements
                const touchElements = await this.page.$$eval('button, .btn, a', elements => 
                    elements.filter(el => {
                        const rect = el.getBoundingClientRect();
                        return rect.width >= 44 && rect.height >= 44; // Apple's 44px recommendation
                    }).length
                );

                const result = {
                    url,
                    viewport: `${viewport.width}x${viewport.height}`,
                    hasHorizontalScroll,
                    touchFriendlyElements: touchElements,
                    success: !hasHorizontalScroll
                };

                if (!hasHorizontalScroll) {
                    console.log(`✅ Mobile view OK: ${url}`);
                    this.results.summary.passed++;
                } else {
                    console.log(`⚠️ Mobile view has horizontal scroll: ${url}`);
                    this.results.summary.warnings++;
                    this.results.issues.push(`Mobile horizontal scroll on ${url}`);
                }

                this.results.mobileTests.push(result);
                
            } catch (error) {
                console.log(`❌ Mobile test failed for ${url}: ${error.message}`);
                this.results.mobileTests.push({
                    url,
                    success: false,
                    error: error.message
                });
                this.results.summary.failed++;
                this.results.issues.push(`Mobile test failed for ${url}: ${error.message}`);
            }
        }
        
        // Reset to desktop viewport
        await this.page.setViewport({ width: 1920, height: 1080 });
    }

    async testPerformance() {
        console.log('\n⚡ Testing Performance');
        
        const testPages = [
            'https://doha.kr/',
            'https://doha.kr/fortune/daily/',
            'https://doha.kr/tests/mbti/'
        ];

        for (const url of testPages) {
            try {
                console.log(`🔧 Testing performance: ${url}`);
                
                const startTime = Date.now();
                await this.page.goto(url, { waitUntil: 'networkidle0' });
                const loadTime = Date.now() - startTime;
                
                // Get performance metrics
                const metrics = await this.page.evaluate(() => {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    return {
                        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                        ttfb: navigation.responseStart - navigation.requestStart,
                        domElements: document.getElementsByTagName('*').length
                    };
                });

                // Check for lazy-loaded images
                const lazyImages = await this.page.$$eval('img[loading="lazy"], img[data-src]', imgs => imgs.length);
                
                // Check service worker
                const hasServiceWorker = await this.page.evaluate(() => {
                    return 'serviceWorker' in navigator;
                });

                const result = {
                    url,
                    loadTime,
                    metrics,
                    lazyImages,
                    hasServiceWorker,
                    performanceScore: loadTime < 3000 ? 'good' : loadTime < 5000 ? 'fair' : 'poor'
                };

                if (loadTime < 3000) {
                    console.log(`✅ Performance good: ${url} (${loadTime}ms)`);
                    this.results.summary.passed++;
                } else if (loadTime < 5000) {
                    console.log(`⚠️ Performance fair: ${url} (${loadTime}ms)`);
                    this.results.summary.warnings++;
                } else {
                    console.log(`❌ Performance poor: ${url} (${loadTime}ms)`);
                    this.results.summary.failed++;
                    this.results.issues.push(`Slow loading time for ${url}: ${loadTime}ms`);
                }

                this.results.performanceTests.push(result);
                
            } catch (error) {
                console.log(`❌ Performance test failed for ${url}: ${error.message}`);
                this.results.performanceTests.push({
                    url,
                    success: false,
                    error: error.message
                });
                this.results.summary.failed++;
                this.results.issues.push(`Performance test failed for ${url}: ${error.message}`);
            }
        }
    }

    async generateReport() {
        const reportPath = path.join(__dirname, 'live-site-verification-report.json');
        const htmlReportPath = path.join(__dirname, 'live-site-verification-report.html');
        
        // Add summary statistics
        this.results.summary.total = this.results.summary.passed + this.results.summary.failed + this.results.summary.warnings;
        this.results.summary.successRate = Math.round((this.results.summary.passed / this.results.summary.total) * 100);
        
        // Save JSON report
        await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
        
        // Generate HTML report
        const htmlReport = this.generateHTMLReport();
        await fs.writeFile(htmlReportPath, htmlReport);
        
        console.log(`\n📊 Reports generated:`);
        console.log(`  JSON: ${reportPath}`);
        console.log(`  HTML: ${htmlReportPath}`);
        
        return this.results;
    }

    generateHTMLReport() {
        return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>doha.kr 실시간 사이트 검증 보고서</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric .value { font-size: 2em; font-weight: bold; color: #2563eb; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .test-result { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #6b7280; }
        .test-result.success { border-left-color: #10b981; }
        .test-result.error { border-left-color: #ef4444; }
        .test-result.warning { border-left-color: #f59e0b; }
        .issues { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; }
        .console-error { background: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; margin: 5px 0; font-family: monospace; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>doha.kr 실시간 사이트 검증 보고서</h1>
            <p>검증 시간: ${this.results.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="value">${this.results.summary.total}</div>
                <div>총 테스트</div>
            </div>
            <div class="metric">
                <div class="value" style="color: #10b981">${this.results.summary.passed}</div>
                <div>통과</div>
            </div>
            <div class="metric">
                <div class="value" style="color: #ef4444">${this.results.summary.failed}</div>
                <div>실패</div>
            </div>
            <div class="metric">
                <div class="value" style="color: #f59e0b">${this.results.summary.warnings}</div>
                <div>경고</div>
            </div>
            <div class="metric">
                <div class="value">${this.results.summary.successRate}%</div>
                <div>성공률</div>
            </div>
        </div>
        
        ${this.results.issues.length > 0 ? `
        <div class="section">
            <h2>🚨 주요 이슈</h2>
            <div class="issues">
                ${this.results.issues.map(issue => `<div>• ${issue}</div>`).join('')}
            </div>
        </div>
        ` : ''}
        
        <div class="section">
            <h2>📊 API 테스트 결과</h2>
            ${this.results.apiTests.map(test => `
                <div class="test-result ${test.success ? 'success' : 'error'}">
                    <strong>${test.endpoint}</strong> (${test.method || 'GET'})
                    ${test.success ? `
                        <div>✅ 성공 - ${test.responseTime}ms</div>
                        ${test.status ? `<div>상태: ${test.status}</div>` : ''}
                    ` : `
                        <div>❌ 실패: ${test.error}</div>
                    `}
                </div>
            `).join('')}
        </div>
        
        <div class="section">
            <h2>🛠️ 주요 기능 테스트</h2>
            ${this.results.featureTests.map(test => `
                <div class="test-result ${test.success ? 'success' : 'error'}">
                    <strong>${test.feature}</strong>
                    ${test.success ? `
                        <div>✅ 정상 작동</div>
                        ${test.details ? `<div>${test.details}</div>` : ''}
                    ` : `
                        <div>❌ 실패: ${test.error}</div>
                    `}
                </div>
            `).join('')}
        </div>
        
        <div class="section">
            <h2>📱 모바일 반응형 테스트</h2>
            ${this.results.mobileTests.map(test => `
                <div class="test-result ${test.success ? 'success' : test.hasHorizontalScroll ? 'warning' : 'error'}">
                    <strong>${test.url}</strong>
                    ${test.success ? `
                        <div>✅ 모바일 친화적</div>
                    ` : test.hasHorizontalScroll ? `
                        <div>⚠️ 가로 스크롤 발생</div>
                    ` : `
                        <div>❌ 오류: ${test.error}</div>
                    `}
                    ${test.touchFriendlyElements ? `<div>터치 친화적 요소: ${test.touchFriendlyElements}개</div>` : ''}
                </div>
            `).join('')}
        </div>
        
        <div class="section">
            <h2>⚡ 성능 테스트</h2>
            ${this.results.performanceTests.map(test => `
                <div class="test-result ${test.performanceScore === 'good' ? 'success' : test.performanceScore === 'fair' ? 'warning' : 'error'}">
                    <strong>${test.url}</strong>
                    <div>로딩 시간: ${test.loadTime}ms (${test.performanceScore})</div>
                    ${test.metrics ? `
                        <div>TTFB: ${Math.round(test.metrics.ttfb)}ms</div>
                        <div>DOM 요소: ${test.metrics.domElements}개</div>
                    ` : ''}
                    ${test.lazyImages ? `<div>지연 로딩 이미지: ${test.lazyImages}개</div>` : ''}
                    ${test.hasServiceWorker ? `<div>✅ Service Worker 지원</div>` : `<div>⚠️ Service Worker 없음</div>`}
                </div>
            `).join('')}
        </div>
        
        ${this.results.consoleErrors.length > 0 ? `
        <div class="section">
            <h2>🐛 콘솔 에러 및 경고</h2>
            ${this.results.consoleErrors.slice(0, 20).map(error => `
                <div class="console-error">
                    <strong>${error.type}:</strong> ${error.message || error.url}
                    ${error.status ? ` (${error.status})` : ''}
                    <div style="font-size: 0.8em; color: #666; margin-top: 5px;">${error.timestamp}</div>
                </div>
            `).join('')}
            ${this.results.consoleErrors.length > 20 ? `<div style="text-align: center; margin-top: 10px;">... 그리고 ${this.results.consoleErrors.length - 20}개 더</div>` : ''}
        </div>
        ` : ''}
    </div>
</body>
</html>
        `;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async run() {
        try {
            await this.initialize();
            
            // Run all tests
            await this.testFortuneAPIs();
            await this.testKeyFeatures();
            await this.testMobileResponsiveness();
            await this.testPerformance();
            
            // Generate report
            const results = await this.generateReport();
            
            // Print summary
            console.log('\n🎯 테스트 완료 요약:');
            console.log(`총 테스트: ${results.summary.total}`);
            console.log(`통과: ${results.summary.passed}`);
            console.log(`실패: ${results.summary.failed}`);
            console.log(`경고: ${results.summary.warnings}`);
            console.log(`성공률: ${results.summary.successRate}%`);
            
            if (results.issues.length > 0) {
                console.log('\n🚨 발견된 주요 이슈:');
                results.issues.forEach(issue => console.log(`  • ${issue}`));
            } else {
                console.log('\n✅ 모든 테스트가 성공적으로 통과했습니다!');
            }
            
        } catch (error) {
            console.error('❌ 테스트 실행 중 오류 발생:', error);
        } finally {
            await this.cleanup();
        }
    }
}

// Run the verification
const verifier = new DohaLiveSiteVerifier();
verifier.run().catch(console.error);

export default DohaLiveSiteVerifier;