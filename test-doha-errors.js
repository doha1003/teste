import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DohaErrorTester {
  constructor() {
    this.errors = [];
    this.testResults = {
      totalErrors: 0,
      networkErrors: 0,
      jsErrors: 0,
      cssErrors: 0,
      pathErrors: 0,
      missingFiles: 0,
      passed: 0,
    };
  }

  async testAllPages() {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      // HTML 파일 목록 가져오기
      const htmlFiles = this.getHtmlFiles();
      console.log(`📄 ${htmlFiles.length}개 HTML 파일 테스트 시작...`);

      for (const file of htmlFiles) {
        await this.testPage(browser, file);
      }

      await this.generateReport();
    } finally {
      await browser.close();
    }
  }

  getHtmlFiles() {
    const files = [];
    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          if (!item.startsWith('.') && !['node_modules', 'dist'].includes(item)) {
            scanDir(fullPath);
          }
        } else if (item.endsWith('.html')) {
          files.push(fullPath);
        }
      }
    };

    scanDir('.');
    return files;
  }

  async testPage(browser, filePath) {
    const page = await browser.newPage();
    const pageErrors = [];

    // Console 오류 수집
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        pageErrors.push({
          type: 'console-error',
          file: filePath,
          message: msg.text(),
          location: msg.location(),
        });
      }
    });

    // 네트워크 오류 수집
    page.on('response', (response) => {
      if (response.status() >= 400) {
        pageErrors.push({
          type: 'network-error',
          file: filePath,
          message: `${response.status()} - ${response.url()}`,
          status: response.status(),
          url: response.url(),
        });
      }
    });

    // JavaScript 오류 수집
    page.on('pageerror', (error) => {
      pageErrors.push({
        type: 'js-error',
        file: filePath,
        message: error.message,
        stack: error.stack,
      });
    });

    try {
      const urlPath = filePath.replace(/\\/g, '/');
      const url = `http://localhost:3000/${urlPath}`;
      console.log(`🔍 테스트 중: ${path.relative('.', filePath)}`);

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 10000,
      });

      // 페이지 로드 후 약간 대기
      await page.waitForTimeout(1000);

      // HTML 내 경로 분석
      await this.analyzePagePaths(page, filePath, pageErrors);
    } catch (error) {
      pageErrors.push({
        type: 'page-error',
        file: filePath,
        message: error.message,
      });
    }

    // 오류 통계 업데이트
    this.errors.push(...pageErrors);
    this.updateStats(pageErrors);

    if (pageErrors.length === 0) {
      this.testResults.passed++;
      console.log(`✅ ${path.relative('.', filePath)} - 오류 없음`);
    } else {
      console.log(`❌ ${path.relative('.', filePath)} - ${pageErrors.length}개 오류`);
    }

    await page.close();
  }

  async analyzePagePaths(page, filePath, pageErrors) {
    const results = await page.evaluate(() => {
      const errors = [];

      // CSS 링크 확인
      const cssLinks = document.querySelectorAll('link[rel="stylesheet"], link[href$=".css"]');
      cssLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('//')) {
          errors.push({
            type: 'css-path',
            element: 'link',
            path: href,
            absolute: href.startsWith('/'),
          });
        }
      });

      // JS 스크립트 확인
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach((script) => {
        const src = script.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('//')) {
          errors.push({
            type: 'js-path',
            element: 'script',
            path: src,
            absolute: src.startsWith('/'),
          });
        }
      });

      // 이미지 확인
      const images = document.querySelectorAll('img[src]');
      images.forEach((img) => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
          errors.push({
            type: 'image-path',
            element: 'img',
            path: src,
            absolute: src.startsWith('/'),
          });
        }
      });

      return errors;
    });

    results.forEach((result) => {
      pageErrors.push({
        type: 'path-analysis',
        file: filePath,
        ...result,
      });
    });
  }

  updateStats(pageErrors) {
    this.testResults.totalErrors += pageErrors.length;

    pageErrors.forEach((error) => {
      switch (error.type) {
        case 'network-error':
          this.testResults.networkErrors++;
          if (error.status === 404) {
            this.testResults.missingFiles++;
          }
          break;
        case 'js-error':
        case 'console-error':
          this.testResults.jsErrors++;
          break;
        case 'path-analysis':
          this.testResults.pathErrors++;
          break;
      }
    });
  }

  async generateReport() {
    const report = {
      summary: this.testResults,
      timestamp: new Date().toISOString(),
      errors: this.errors,
      recommendations: this.generateRecommendations(),
    };

    // 콘솔 출력
    console.log('\n📊 테스트 결과 요약:');
    console.log('='.repeat(50));
    console.log(`총 오류: ${this.testResults.totalErrors}개`);
    console.log(`네트워크 오류: ${this.testResults.networkErrors}개`);
    console.log(`JavaScript 오류: ${this.testResults.jsErrors}개`);
    console.log(`경로 문제: ${this.testResults.pathErrors}개`);
    console.log(`404 파일 누락: ${this.testResults.missingFiles}개`);
    console.log(`통과한 페이지: ${this.testResults.passed}개`);

    // 파일별 오류 분석
    console.log('\n🔍 주요 문제점:');
    this.analyzeMainIssues();

    // 상세 보고서 저장
    fs.writeFileSync('doha-error-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 상세 보고서: doha-error-report.json');

    return report;
  }

  analyzeMainIssues() {
    const pathErrors = this.errors.filter((e) => e.type === 'path-analysis');
    const networkErrors = this.errors.filter((e) => e.type === 'network-error');

    // 절대 경로 vs 상대 경로 분석
    const absolutePaths = pathErrors.filter((e) => e.absolute);
    const relativePaths = pathErrors.filter((e) => !e.absolute);

    console.log(`- 절대 경로 사용: ${absolutePaths.length}개`);
    console.log(`- 상대 경로 사용: ${relativePaths.length}개`);

    // 가장 많이 누락된 파일들
    const missing404 = networkErrors
      .filter((e) => e.status === 404)
      .map((e) => e.url)
      .reduce((acc, url) => {
        acc[url] = (acc[url] || 0) + 1;
        return acc;
      }, {});

    console.log('\n📋 가장 많이 누락된 파일:');
    Object.entries(missing404)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([url, count]) => {
        console.log(`  ${count}회: ${url}`);
      });
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.testResults.pathErrors > 0) {
      recommendations.push({
        priority: 'high',
        issue: 'Path Resolution Issues',
        solution: '모든 HTML 파일의 CSS/JS 경로를 상대 경로로 통일하여 수정',
      });
    }

    if (this.testResults.missingFiles > 0) {
      recommendations.push({
        priority: 'high',
        issue: 'Missing Files',
        solution: '누락된 핵심 JS/CSS 파일들을 생성하거나 경로 수정',
      });
    }

    if (this.testResults.jsErrors > 0) {
      recommendations.push({
        priority: 'medium',
        issue: 'JavaScript Errors',
        solution: 'import/export 구문 및 모듈 로딩 오류 수정',
      });
    }

    return recommendations;
  }
}

// 실행
const tester = new DohaErrorTester();
tester.testAllPages().catch(console.error);

export default DohaErrorTester;
