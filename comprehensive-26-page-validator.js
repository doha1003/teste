#!/usr/bin/env node

/**
 * doha.kr 26개 주요 페이지 완전 자동화 검증 시스템
 * 
 * 기능:
 * - 스크린샷 캡처 (데스크톱/모바일)
 * - 콘솔 에러 수집
 * - CSS 적용 여부 확인
 * - 깨진 요소 검출
 * - JavaScript 에러 확인
 * - 네트워크 리소스 로드 실패 검출
 * - HTML 리포트 생성
 */

import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import http from 'http';
import { createReadStream, statSync, existsSync } from 'fs';
import { extname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Comprehensive26PageValidator {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.resultsDir = path.join(process.cwd(), 'test-results-comprehensive');
    this.screenshotDir = path.join(this.resultsDir, 'screenshots');
    this.reportPath = path.join(this.resultsDir, 'comprehensive-report.html');
    this.jsonReportPath = path.join(this.resultsDir, 'comprehensive-report.json');
    
    // 26개 주요 페이지 정의
    this.pages = [
      // 메인 페이지들
      { name: '홈페이지', url: '/', selector: 'main', critical: true },
      { name: '404 페이지', url: '/404.html', selector: 'body', critical: false },
      { name: '오프라인 페이지', url: '/offline.html', selector: 'body', critical: false },
      
      // 심리테스트 섹션 (8개)
      { name: '심리테스트 메인', url: '/tests/', selector: '.tests-grid', critical: true },
      { name: 'MBTI 소개', url: '/tests/mbti/', selector: '.test-intro', critical: true },
      { name: 'MBTI 테스트', url: '/tests/mbti/test.html', selector: '.question-container', critical: true },
      { name: 'MBTI 결과', url: '/tests/mbti/result.html', selector: '.result-content', critical: true },
      { name: 'Teto-Egen 소개', url: '/tests/teto-egen/', selector: '.test-intro', critical: true },
      { name: 'Teto-Egen 테스트', url: '/tests/teto-egen/test.html', selector: '.question-container', critical: true },
      { name: 'Teto-Egen 결과', url: '/tests/teto-egen/result.html', selector: '.result-content', critical: true },
      { name: 'Love DNA 소개', url: '/tests/love-dna/', selector: '.test-intro', critical: true },
      { name: 'Love DNA 테스트', url: '/tests/love-dna/test.html', selector: '.question-container', critical: true },
      { name: 'Love DNA 결과', url: '/tests/love-dna/result.html', selector: '.result-content', critical: true },
      
      // 운세 섹션 (6개)
      { name: '운세 메인', url: '/fortune/', selector: '.fortune-grid', critical: true },
      { name: '오늘의 운세', url: '/fortune/daily/', selector: '.daily-fortune-form', critical: true },
      { name: 'AI 사주팔자', url: '/fortune/saju/', selector: '.saju-form', critical: true },
      { name: 'AI 타로 리딩', url: '/fortune/tarot/', selector: '.tarot-deck', critical: true },
      { name: '별자리 운세', url: '/fortune/zodiac/', selector: '.zodiac-grid', critical: true },
      { name: '띠별 운세', url: '/fortune/zodiac-animal/', selector: '.animal-grid', critical: true },
      
      // 도구 섹션 (4개)
      { name: '실용도구 메인', url: '/tools/', selector: '.tools-grid', critical: true },
      { name: 'BMI 계산기', url: '/tools/bmi-calculator.html', selector: '.calculator-form', critical: true },
      { name: '연봉 계산기', url: '/tools/salary-calculator.html', selector: '.calculator-form', critical: true },
      { name: '글자수 세기', url: '/tools/text-counter.html', selector: '.text-counter-form', critical: true },
      
      // 정보 페이지들 (5개)
      { name: '소개 페이지', url: '/about/', selector: '.about-content', critical: false },
      { name: '문의하기', url: '/contact/', selector: '.contact-form', critical: false },
      { name: 'FAQ', url: '/faq/', selector: '.faq-content', critical: false },
      { name: '개인정보처리방침', url: '/privacy/', selector: '.legal-content', critical: false },
      { name: '이용약관', url: '/terms/', selector: '.legal-content', critical: false }
    ];
    
    this.results = [];
    this.server = null;
  }

  async startServer() {
    console.log('🚀 Node.js HTTP 서버 시작...');
    
    return new Promise((resolve, reject) => {
      const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'font/eot'
      };

      this.server = http.createServer((req, res) => {
        let filePath = path.join(process.cwd(), req.url === '/' ? '/index.html' : req.url);
        
        // URL 쿼리 파라미터 제거
        filePath = filePath.split('?')[0];
        
        // 디렉토리 요청시 index.html 추가
        try {
          if (statSync(filePath).isDirectory()) {
            filePath = path.join(filePath, 'index.html');
          }
        } catch (e) {
          // 파일이 없으면 무시
        }

        if (!existsSync(filePath)) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 Not Found</h1>');
          return;
        }

        const ext = extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'text/plain';

        res.writeHead(200, { 'Content-Type': contentType });
        const fileStream = createReadStream(filePath);
        fileStream.pipe(res);
        
        fileStream.on('error', (error) => {
          res.writeHead(500);
          res.end('Internal Server Error');
        });
      });

      this.server.listen(3000, 'localhost', () => {
        console.log('✅ 서버가 http://localhost:3000에서 실행 중입니다');
        setTimeout(resolve, 1000); // 1초 대기
      });

      this.server.on('error', (error) => {
        console.error('서버 시작 실패:', error);
        reject(error);
      });
    });
  }

  async stopServer() {
    if (this.server) {
      console.log('🛑 서버 종료 중...');
      this.server.close(() => {
        console.log('✅ 서버가 정상적으로 종료되었습니다');
      });
      this.server = null;
    }
  }

  async setupDirectories() {
    await fs.ensureDir(this.resultsDir);
    await fs.ensureDir(this.screenshotDir);
    console.log(`📁 결과 디렉토리 생성: ${this.resultsDir}`);
  }

  async validatePage(browser, pageInfo) {
    const { name, url, selector, critical } = pageInfo;
    const fullUrl = `${this.baseUrl}${url}`;
    
    console.log(`🔍 검증 중: ${name} (${fullUrl})`);
    
    const page = await browser.newPage();
    const result = {
      name,
      url,
      fullUrl,
      critical,
      timestamp: new Date().toISOString(),
      status: 'unknown',
      errors: [],
      warnings: [],
      screenshots: {},
      performance: {},
      validation: {
        cssLoaded: false,
        jsLoaded: false,
        selectorExists: false,
        networkErrors: [],
        consoleErrors: [],
        brokenElements: []
      }
    };

    try {
      // 네트워크 요청 모니터링
      const networkErrors = [];
      page.on('response', response => {
        if (!response.ok() && response.status() !== 304) {
          networkErrors.push({
            url: response.url(),
            status: response.status(),
            statusText: response.statusText()
          });
        }
      });

      // 콘솔 에러 모니터링
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
          });
        }
      });

      // 페이지 자바스크립트 에러 모니터링
      page.on('pageerror', error => {
        consoleErrors.push({
          type: 'pageerror',
          text: error.message,
          stack: error.stack
        });
      });

      // 페이지 로드
      const startTime = Date.now();
      const response = await page.goto(fullUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      const loadTime = Date.now() - startTime;

      result.performance.loadTime = loadTime;
      result.performance.status = response.status();

      // 기본 검증
      if (!response.ok()) {
        result.status = 'error';
        result.errors.push(`HTTP 오류: ${response.status()}`);
        return result;
      }

      // CSS 로드 확인
      const cssLinks = await page.$$eval('link[rel="stylesheet"]', links => 
        links.map(link => ({ href: link.href, loaded: true }))
      );
      result.validation.cssLoaded = cssLinks.length > 0;

      // JavaScript 로드 확인
      const scriptTags = await page.$$eval('script[src]', scripts =>
        scripts.map(script => ({ src: script.src, loaded: true }))
      );
      result.validation.jsLoaded = scriptTags.length > 0;

      // 핵심 selector 확인
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        result.validation.selectorExists = true;
      } catch (e) {
        result.validation.selectorExists = false;
        result.warnings.push(`핵심 요소 누락: ${selector}`);
      }

      // CSS 적용 상태 확인 (computed styles)
      const cssValidation = await page.evaluate((sel) => {
        const elements = document.querySelectorAll(sel);
        const results = [];
        
        elements.forEach((el, index) => {
          const styles = window.getComputedStyle(el);
          results.push({
            selector: sel,
            index,
            hasStyles: styles.cssText.length > 0,
            visibility: styles.visibility,
            display: styles.display,
            opacity: styles.opacity,
            color: styles.color
          });
        });
        
        return results;
      }, selector);

      result.validation.computedStyles = cssValidation;

      // 깨진 이미지 검출
      const brokenImages = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        const broken = [];
        
        images.forEach((img, index) => {
          if (img.naturalWidth === 0 || img.naturalHeight === 0) {
            broken.push({
              src: img.src,
              alt: img.alt,
              index
            });
          }
        });
        
        return broken;
      });
      
      result.validation.brokenElements = brokenImages;

      // 폼 검증 (해당되는 경우)
      if (url.includes('calculator') || url.includes('test') || url.includes('fortune')) {
        const formValidation = await page.evaluate(() => {
          const forms = document.querySelectorAll('form');
          return Array.from(forms).map(form => ({
            hasInputs: form.querySelectorAll('input, select, textarea').length > 0,
            hasSubmitButton: form.querySelectorAll('button[type="submit"], input[type="submit"]').length > 0
          }));
        });
        result.validation.forms = formValidation;
      }

      // 스크린샷 캡처 - 데스크톱
      await page.setViewport({ width: 1920, height: 1080 });
      const desktopScreenshot = `${name}-desktop.png`;
      await page.screenshot({
        path: path.join(this.screenshotDir, desktopScreenshot),
        fullPage: true
      });
      result.screenshots.desktop = desktopScreenshot;

      // 스크린샷 캡처 - 모바일
      await page.setViewport({ width: 375, height: 667 });
      const mobileScreenshot = `${name}-mobile.png`;
      await page.screenshot({
        path: path.join(this.screenshotDir, mobileScreenshot),
        fullPage: true
      });
      result.screenshots.mobile = mobileScreenshot;

      // 에러 수집
      result.validation.networkErrors = networkErrors;
      result.validation.consoleErrors = consoleErrors;

      // 상태 결정
      if (networkErrors.length > 0) {
        result.errors.push(`네트워크 오류 ${networkErrors.length}개`);
      }
      if (consoleErrors.length > 0) {
        result.warnings.push(`콘솔 오류 ${consoleErrors.length}개`);
      }
      if (brokenImages.length > 0) {
        result.warnings.push(`깨진 이미지 ${brokenImages.length}개`);
      }

      // 최종 상태 결정
      if (result.errors.length === 0 && result.validation.selectorExists && result.validation.cssLoaded) {
        result.status = 'success';
      } else if (result.errors.length > 0) {
        result.status = 'error';
      } else {
        result.status = 'warning';
      }

      console.log(`✅ ${name}: ${result.status} (${loadTime}ms)`);

    } catch (error) {
      result.status = 'error';
      result.errors.push(`검증 실패: ${error.message}`);
      console.error(`❌ ${name}: ${error.message}`);
    } finally {
      await page.close();
    }

    return result;
  }

  async generateHtmlReport() {
    const totalPages = this.results.length;
    const successPages = this.results.filter(r => r.status === 'success').length;
    const errorPages = this.results.filter(r => r.status === 'error').length;
    const warningPages = this.results.filter(r => r.status === 'warning').length;
    
    const criticalPages = this.results.filter(r => r.critical);
    const criticalSuccess = criticalPages.filter(r => r.status === 'success').length;
    
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>doha.kr 26개 페이지 완전 검증 리포트</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 3rem 2rem;
            border-radius: 16px;
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        
        .summary-card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            text-align: center;
            border-top: 4px solid;
        }
        
        .summary-card.success { border-top-color: #10b981; }
        .summary-card.error { border-top-color: #ef4444; }
        .summary-card.warning { border-top-color: #f59e0b; }
        .summary-card.total { border-top-color: #6366f1; }
        
        .summary-number {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .success .summary-number { color: #10b981; }
        .error .summary-number { color: #ef4444; }
        .warning .summary-number { color: #f59e0b; }
        .total .summary-number { color: #6366f1; }
        
        .results-grid {
            display: grid;
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        
        .result-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            border-left: 6px solid;
        }
        
        .result-card.success { border-left-color: #10b981; }
        .result-card.error { border-left-color: #ef4444; }
        .result-card.warning { border-left-color: #f59e0b; }
        
        .result-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .result-title {
            font-size: 1.25rem;
            font-weight: 600;
        }
        
        .result-badge {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 500;
            text-transform: uppercase;
        }
        
        .success .result-badge {
            background: #d1fae5;
            color: #065f46;
        }
        
        .error .result-badge {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .warning .result-badge {
            background: #fef3c7;
            color: #92400e;
        }
        
        .result-content {
            padding: 1.5rem;
        }
        
        .result-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .info-item {
            padding: 1rem;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        
        .info-label {
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 0.25rem;
        }
        
        .info-value {
            font-weight: 500;
        }
        
        .screenshots {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .screenshot-item {
            text-align: center;
        }
        
        .screenshot-item img {
            max-width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        
        .screenshot-label {
            margin-top: 0.5rem;
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .errors-list, .warnings-list {
            margin-top: 1rem;
        }
        
        .errors-list ul, .warnings-list ul {
            list-style-position: inside;
            padding-left: 1rem;
        }
        
        .errors-list li {
            color: #dc2626;
            margin-bottom: 0.5rem;
        }
        
        .warnings-list li {
            color: #d97706;
            margin-bottom: 0.5rem;
        }
        
        .validation-details {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
        }
        
        .validation-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .validation-item:last-child {
            border-bottom: none;
        }
        
        .validation-status {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .validation-status.pass {
            background: #d1fae5;
            color: #065f46;
        }
        
        .validation-status.fail {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .critical-badge {
            background: #fef3c7;
            color: #92400e;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            margin-left: 0.5rem;
        }
        
        @media (max-width: 768px) {
            .container { padding: 1rem; }
            .header { padding: 2rem 1rem; }
            .header h1 { font-size: 2rem; }
            .screenshots { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🔍 doha.kr 완전 검증 리포트</h1>
            <p>26개 주요 페이지 자동화 검증 결과</p>
            <p>검증 시간: ${new Date().toLocaleString('ko-KR')}</p>
        </header>

        <section class="summary">
            <div class="summary-card total">
                <div class="summary-number">${totalPages}</div>
                <div>전체 페이지</div>
            </div>
            <div class="summary-card success">
                <div class="summary-number">${successPages}</div>
                <div>정상 페이지</div>
            </div>
            <div class="summary-card warning">
                <div class="summary-number">${warningPages}</div>
                <div>경고 페이지</div>
            </div>
            <div class="summary-card error">
                <div class="summary-number">${errorPages}</div>
                <div>오류 페이지</div>
            </div>
        </section>

        <div class="results-grid">
            ${this.results.map(result => `
            <div class="result-card ${result.status}">
                <div class="result-header">
                    <div>
                        <div class="result-title">${result.name}${result.critical ? '<span class="critical-badge">핵심 페이지</span>' : ''}</div>
                        <div style="font-size: 0.875rem; color: #6b7280;">${result.url}</div>
                    </div>
                    <div class="result-badge">${result.status}</div>
                </div>
                <div class="result-content">
                    <div class="result-info">
                        <div class="info-item">
                            <div class="info-label">로드 시간</div>
                            <div class="info-value">${result.performance.loadTime || 0}ms</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">HTTP 상태</div>
                            <div class="info-value">${result.performance.status || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">네트워크 오류</div>
                            <div class="info-value">${result.validation.networkErrors?.length || 0}개</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">콘솔 오류</div>
                            <div class="info-value">${result.validation.consoleErrors?.length || 0}개</div>
                        </div>
                    </div>

                    <div class="validation-details">
                        <div class="validation-item">
                            <span>CSS 로드</span>
                            <span class="validation-status ${result.validation.cssLoaded ? 'pass' : 'fail'}">
                                ${result.validation.cssLoaded ? '✅ 정상' : '❌ 실패'}
                            </span>
                        </div>
                        <div class="validation-item">
                            <span>JavaScript 로드</span>
                            <span class="validation-status ${result.validation.jsLoaded ? 'pass' : 'fail'}">
                                ${result.validation.jsLoaded ? '✅ 정상' : '❌ 실패'}
                            </span>
                        </div>
                        <div class="validation-item">
                            <span>핵심 요소 존재</span>
                            <span class="validation-status ${result.validation.selectorExists ? 'pass' : 'fail'}">
                                ${result.validation.selectorExists ? '✅ 정상' : '❌ 실패'}
                            </span>
                        </div>
                        <div class="validation-item">
                            <span>깨진 이미지</span>
                            <span class="validation-status ${result.validation.brokenElements?.length === 0 ? 'pass' : 'fail'}">
                                ${result.validation.brokenElements?.length || 0}개
                            </span>
                        </div>
                    </div>

                    ${result.errors?.length > 0 ? `
                    <div class="errors-list">
                        <h4 style="color: #dc2626; margin-bottom: 0.5rem;">❌ 오류</h4>
                        <ul>
                            ${result.errors.map(error => `<li>${error}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    ${result.warnings?.length > 0 ? `
                    <div class="warnings-list">
                        <h4 style="color: #d97706; margin-bottom: 0.5rem;">⚠️ 경고</h4>
                        <ul>
                            ${result.warnings.map(warning => `<li>${warning}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    <div class="screenshots">
                        <div class="screenshot-item">
                            <img src="screenshots/${result.screenshots?.desktop}" alt="데스크톱 스크린샷">
                            <div class="screenshot-label">데스크톱 (1920x1080)</div>
                        </div>
                        <div class="screenshot-item">
                            <img src="screenshots/${result.screenshots?.mobile}" alt="모바일 스크린샷">
                            <div class="screenshot-label">모바일 (375x667)</div>
                        </div>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>

        <footer style="text-align: center; padding: 2rem; color: #6b7280;">
            <p>🚀 doha.kr 자동화 검증 시스템 v1.0</p>
            <p>핵심 페이지 성공률: ${Math.round((criticalSuccess / criticalPages.length) * 100)}% (${criticalSuccess}/${criticalPages.length})</p>
        </footer>
    </div>
</body>
</html>
    `;

    await fs.writeFile(this.reportPath, html);
    console.log(`📊 HTML 리포트 생성: ${this.reportPath}`);
  }

  async generateJsonReport() {
    const summary = {
      timestamp: new Date().toISOString(),
      totalPages: this.results.length,
      successPages: this.results.filter(r => r.status === 'success').length,
      errorPages: this.results.filter(r => r.status === 'error').length,
      warningPages: this.results.filter(r => r.status === 'warning').length,
      criticalPages: {
        total: this.results.filter(r => r.critical).length,
        success: this.results.filter(r => r.critical && r.status === 'success').length
      },
      averageLoadTime: Math.round(
        this.results.reduce((sum, r) => sum + (r.performance.loadTime || 0), 0) / this.results.length
      )
    };

    const jsonReport = {
      summary,
      results: this.results
    };

    await fs.writeFile(this.jsonReportPath, JSON.stringify(jsonReport, null, 2));
    console.log(`📊 JSON 리포트 생성: ${this.jsonReportPath}`);
  }

  async run() {
    try {
      console.log('🎯 doha.kr 26개 페이지 완전 자동화 검증 시작');
      
      await this.setupDirectories();
      await this.startServer();

      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      console.log(`📋 검증할 페이지: ${this.pages.length}개`);

      for (let i = 0; i < this.pages.length; i++) {
        const page = this.pages[i];
        console.log(`\n[${i + 1}/${this.pages.length}] ${page.name} 검증 중...`);
        
        const result = await this.validatePage(browser, page);
        this.results.push(result);

        // 진행률 표시
        const progress = Math.round(((i + 1) / this.pages.length) * 100);
        console.log(`📊 진행률: ${progress}%`);
      }

      await browser.close();
      await this.stopServer();

      // 리포트 생성
      await this.generateHtmlReport();
      await this.generateJsonReport();

      // 결과 요약
      console.log('\n🎉 검증 완료!');
      console.log('=' * 50);
      console.log(`총 페이지: ${this.results.length}개`);
      console.log(`정상: ${this.results.filter(r => r.status === 'success').length}개`);
      console.log(`경고: ${this.results.filter(r => r.status === 'warning').length}개`);
      console.log(`오류: ${this.results.filter(r => r.status === 'error').length}개`);
      
      const criticalPages = this.results.filter(r => r.critical);
      const criticalSuccess = criticalPages.filter(r => r.status === 'success').length;
      console.log(`핵심 페이지 성공률: ${Math.round((criticalSuccess / criticalPages.length) * 100)}%`);
      
      console.log(`\n📊 상세 리포트: ${this.reportPath}`);
      console.log(`📋 JSON 데이터: ${this.jsonReportPath}`);

    } catch (error) {
      console.error('❌ 검증 실패:', error);
      await this.stopServer();
      process.exit(1);
    }
  }
}

// 자동 실행
const validator = new Comprehensive26PageValidator();
validator.run();

export default Comprehensive26PageValidator;