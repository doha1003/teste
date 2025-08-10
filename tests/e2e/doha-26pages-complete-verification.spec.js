/**
 * doha.kr 라이브 사이트 26개 전체 페이지 완전 검증
 * QA 전문가: 실제 사용자 시나리오 기반 E2E 테스트
 * 
 * @version 2.0.0
 * @description 실제 라이브 사이트의 모든 페이지를 검증하여 완전한 품질 보증
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 테스트 대상: 라이브 사이트
const BASE_URL = 'https://doha.kr';

// 리포트 저장 디렉토리
const REPORT_DIR = path.join(__dirname, '../../doha-26pages-verification');

// 페이지 목록 정의
const PAGES = [
  // 메인 페이지 (6개)
  { url: '/', title: '홈페이지', category: 'main', critical: true },
  { url: '/about/', title: '소개 페이지', category: 'main' },
  { url: '/contact/', title: '문의하기', category: 'main' },
  { url: '/faq/', title: 'FAQ', category: 'main' },
  { url: '/privacy/', title: '개인정보처리방침', category: 'main' },
  { url: '/terms/', title: '이용약관', category: 'main' },
  
  // 심리테스트 (7페이지)
  { url: '/tests/', title: '심리테스트 메인', category: 'tests', critical: true },
  { url: '/tests/mbti/', title: 'MBTI 소개', category: 'tests' },
  { url: '/tests/mbti/test.html', title: 'MBTI 테스트', category: 'tests', interactive: true },
  { url: '/tests/teto-egen/', title: 'Teto-Egen 소개', category: 'tests' },
  { url: '/tests/teto-egen/test.html', title: 'Teto-Egen 테스트', category: 'tests', interactive: true },
  { url: '/tests/love-dna/', title: 'Love DNA 소개', category: 'tests' },
  { url: '/tests/love-dna/test.html', title: 'Love DNA 테스트', category: 'tests', interactive: true },
  
  // 운세 서비스 (6페이지)
  { url: '/fortune/', title: '운세 메인', category: 'fortune', critical: true },
  { url: '/fortune/daily/', title: '오늘의 운세', category: 'fortune', api: true },
  { url: '/fortune/saju/', title: 'AI 사주팔자', category: 'fortune', api: true },
  { url: '/fortune/tarot/', title: 'AI 타로 리딩', category: 'fortune', api: true },
  { url: '/fortune/zodiac/', title: '별자리 운세', category: 'fortune', api: true },
  { url: '/fortune/zodiac-animal/', title: '띠별 운세', category: 'fortune', api: true },
  
  // 실용도구 (4페이지)
  { url: '/tools/', title: '도구 메인', category: 'tools', critical: true },
  { url: '/tools/bmi-calculator.html', title: 'BMI 계산기', category: 'tools', functional: true },
  { url: '/tools/salary-calculator.html', title: '연봉 계산기', category: 'tools', functional: true },
  { url: '/tools/text-counter.html', title: '글자수 세기', category: 'tools', functional: true },
  
  // 특수 페이지 (3페이지)
  { url: '/404.html', title: '404 오류 페이지', category: 'special' },
  { url: '/offline.html', title: '오프라인 페이지', category: 'special' },
  { url: '/result-detail.html', title: '결과 상세 페이지', category: 'special' }
];

// 전역 결과 저장소
let globalResults = {
  startTime: new Date().toISOString(),
  endTime: null,
  summary: {
    total: PAGES.length,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  pages: []
};

// 헬퍼 함수들
const utils = {
  /**
   * 페이지 상태 검증
   */
  async validatePageStatus(page) {
    try {
      // 기본 검증
      const title = await page.title();
      const url = page.url();
      
      // 네비게이션 요소 확인
      const hasHeader = await page.locator('header, .header, nav, .navbar').count() > 0;
      const hasFooter = await page.locator('footer, .footer').count() > 0;
      const hasMain = await page.locator('main, .main, .content, .page-main').count() > 0;
      
      return {
        title,
        url,
        hasTitle: title && title.length > 0,
        hasHeader,
        hasFooter, 
        hasMain,
        isValid: title && title.length > 0 && (hasHeader || hasFooter || hasMain)
      };
    } catch (error) {
      return {
        title: '',
        url: page.url(),
        hasTitle: false,
        hasHeader: false,
        hasFooter: false,
        hasMain: false,
        isValid: false,
        error: error.message
      };
    }
  },

  /**
   * 콘솔 에러 수집
   */
  async collectConsoleErrors(page) {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  },

  /**
   * 네트워크 에러 수집  
   */
  async collectNetworkErrors(page) {
    const errors = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        errors.push(`${response.status()} - ${response.url()}`);
      }
    });
    return errors;
  },

  /**
   * 스크린샷 촬영
   */
  async takeScreenshot(page, pageInfo, index) {
    try {
      if (!fs.existsSync(REPORT_DIR)) {
        fs.mkdirSync(REPORT_DIR, { recursive: true });
      }
      
      const screenshotDir = path.join(REPORT_DIR, 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      const filename = `${String(index + 1).padStart(2, '0')}-${pageInfo.title.replace(/[^a-zA-Z0-9가-힣]/g, '-')}.png`;
      const screenshotPath = path.join(screenshotDir, filename);
      
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true,
        timeout: 10000
      });
      
      return screenshotPath;
    } catch (error) {
      console.warn(`스크린샷 실패 (${pageInfo.title}):`, error.message);
      return null;
    }
  }
};

// 메인 테스트 스위트
test.describe('doha.kr 라이브 사이트 26개 페이지 완전 검증', () => {
  test.beforeAll(async () => {
    console.log('\n🚀 doha.kr 26개 페이지 완전 검증 시작');
    console.log(`📍 Base URL: ${BASE_URL}`);
    console.log(`📊 총 페이지 수: ${PAGES.length}개\n`);
    
    // 리포트 디렉토리 생성
    if (!fs.existsSync(REPORT_DIR)) {
      fs.mkdirSync(REPORT_DIR, { recursive: true });
    }
  });

  // 각 페이지별 검증 테스트
  PAGES.forEach((pageInfo, index) => {
    test(`${index + 1}. ${pageInfo.title} 검증`, async ({ page }) => {
      const testStartTime = Date.now();
      let pageResult = {
        index: index + 1,
        url: pageInfo.url,
        fullUrl: `${BASE_URL}${pageInfo.url}`,
        title: pageInfo.title,
        category: pageInfo.category,
        status: 'unknown',
        timestamp: new Date().toISOString(),
        httpStatus: null,
        loadTime: 0,
        consoleErrors: [],
        networkErrors: [],
        pageValidation: null,
        screenshot: null,
        error: null
      };

      try {
        console.log(`🔍 [${index + 1}/${PAGES.length}] 검증 중: ${pageInfo.title} (${pageInfo.url})`);

        // 콘솔 및 네트워크 에러 수집 시작
        utils.collectConsoleErrors(page);
        utils.collectNetworkErrors(page);

        // 페이지 로드
        const response = await page.goto(`${BASE_URL}${pageInfo.url}`, {
          waitUntil: 'domcontentloaded',
          timeout: 60000
        });

        pageResult.httpStatus = response?.status() || 0;
        pageResult.loadTime = Date.now() - testStartTime;

        // HTTP 상태 확인
        if (!response || response.status() >= 400) {
          throw new Error(`HTTP ${response?.status() || 'Unknown'}: ${response?.statusText() || 'Failed to load'}`);
        }

        // 페이지 안정화 대기
        await page.waitForTimeout(2000);

        // 페이지 상태 검증
        pageResult.pageValidation = await utils.validatePageStatus(page);

        // 스크린샷 촬영
        pageResult.screenshot = await utils.takeScreenshot(page, pageInfo, index);

        // 특별 검증 (운세 페이지의 경우)
        if (pageInfo.api) {
          try {
            // Emergency API 시스템 확인
            const emergencySystem = await page.evaluate(() => {
              return {
                hasEmergencyManager: typeof window.EmergencyAPIManager !== 'undefined',
                hasAPIHelpers: typeof window.apiHelpers !== 'undefined'
              };
            });
            pageResult.emergencySystem = emergencySystem;
          } catch (err) {
            pageResult.emergencySystemError = err.message;
          }
        }

        // 인터랙티브 요소 확인 (테스트 페이지)
        if (pageInfo.interactive) {
          try {
            const interactiveElements = {
              startButtons: await page.locator('.start-btn, .test-start, [data-action="start"], .btn-start').count(),
              questions: await page.locator('.question, .test-question, .quiz-question').count(),
              forms: await page.locator('form, .test-form').count()
            };
            pageResult.interactiveElements = interactiveElements;
          } catch (err) {
            pageResult.interactiveError = err.message;
          }
        }

        // 기능 테스트 (도구 페이지)
        if (pageInfo.functional) {
          try {
            const functionalElements = {
              inputs: await page.locator('input[type="number"], input[type="text"], textarea').count(),
              calcButtons: await page.locator('.calculate, .calc-btn, [data-action="calculate"], button[type="submit"]').count()
            };
            pageResult.functionalElements = functionalElements;
          } catch (err) {
            pageResult.functionalError = err.message;
          }
        }

        // 성공 판정
        if (pageResult.pageValidation.isValid) {
          pageResult.status = 'passed';
          globalResults.summary.passed++;
          console.log(`✅ [${index + 1}/${PAGES.length}] ${pageInfo.title}: 검증 성공 (${pageResult.loadTime}ms)`);
        } else {
          pageResult.status = 'warning';
          pageResult.error = 'Page validation failed';
          globalResults.summary.warnings++;
          console.log(`⚠️ [${index + 1}/${PAGES.length}] ${pageInfo.title}: 검증 경고`);
        }

      } catch (error) {
        pageResult.status = 'failed';
        pageResult.error = error.message;
        globalResults.summary.failed++;
        
        console.log(`❌ [${index + 1}/${PAGES.length}] ${pageInfo.title}: 검증 실패 - ${error.message}`);
        
        // 실패한 경우에도 스크린샷 시도
        try {
          pageResult.screenshot = await utils.takeScreenshot(page, pageInfo, index);
        } catch (screenshotError) {
          console.warn(`스크린샷 실패: ${screenshotError.message}`);
        }
      }

      // 결과 저장
      globalResults.pages.push(pageResult);
      
      // 테스트 assertion
      if (pageInfo.critical) {
        // 중요 페이지는 반드시 성공해야 함
        expect(pageResult.status).toBe('passed');
      } else {
        // 일반 페이지는 실패가 아니면 OK
        expect(pageResult.status).not.toBe('failed');
      }
    });
  });

  test.afterAll(async () => {
    // 최종 결과 계산
    globalResults.endTime = new Date().toISOString();
    const duration = Math.round((new Date(globalResults.endTime) - new Date(globalResults.startTime)) / 1000);
    const successRate = ((globalResults.summary.passed / globalResults.summary.total) * 100).toFixed(1);

    console.log('\n🏁 검증 완료!');
    console.log(`📊 결과: ${globalResults.summary.passed}/${globalResults.summary.total} 성공 (${successRate}%)`);
    console.log(`⚠️ 경고: ${globalResults.summary.warnings}개`);
    console.log(`❌ 실패: ${globalResults.summary.failed}개`);
    console.log(`⏱️ 소요 시간: ${duration}초\n`);

    // 카테고리별 통계
    const categoryStats = globalResults.pages.reduce((acc, page) => {
      if (!acc[page.category]) acc[page.category] = { total: 0, passed: 0, failed: 0, warnings: 0 };
      acc[page.category].total++;
      acc[page.category][page.status]++;
      return acc;
    }, {});

    console.log('📈 카테고리별 결과:');
    Object.entries(categoryStats).forEach(([category, stats]) => {
      console.log(`  ${category}: ${stats.passed}/${stats.total} (${(stats.passed/stats.total*100).toFixed(1)}%)`);
    });

    // HTML 리포트 생성
    const reportHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>doha.kr 26페이지 완전 검증 리포트</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header p { font-size: 1.1rem; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: white; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .stat-number { font-size: 3rem; font-weight: bold; margin-bottom: 10px; }
        .stat-card.success .stat-number { color: #10b981; }
        .stat-card.warning .stat-number { color: #f59e0b; }
        .stat-card.error .stat-number { color: #ef4444; }
        .stat-card.info .stat-number { color: #3b82f6; }
        .stat-label { color: #6b7280; font-weight: 500; }
        .page-results { display: grid; gap: 20px; }
        .page-result { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .page-header { padding: 20px; border-left: 5px solid #e5e7eb; }
        .page-header.passed { border-left-color: #10b981; background: #ecfdf5; }
        .page-header.warning { border-left-color: #f59e0b; background: #fffbeb; }
        .page-header.failed { border-left-color: #ef4444; background: #fef2f2; }
        .page-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 5px; }
        .page-url { color: #6b7280; font-size: 0.9rem; }
        .page-details { padding: 0 20px 20px; }
        .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0; }
        .detail-item { background: #f9fafb; padding: 12px; border-radius: 6px; }
        .detail-label { font-weight: 600; color: #374151; font-size: 0.85rem; }
        .detail-value { color: #6b7280; font-size: 0.9rem; }
        .screenshot { margin: 15px 0; text-align: center; }
        .screenshot img { max-width: 300px; height: auto; border: 1px solid #e5e7eb; border-radius: 8px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .status-passed { background: #ecfdf5; color: #065f46; }
        .status-warning { background: #fffbeb; color: #92400e; }
        .status-failed { background: #fef2f2; color: #991b1b; }
        .category-stats { background: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
        .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }
        .category-item { text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px; }
        .progress-bar { width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; margin: 10px 0; }
        .progress-fill { height: 100%; background: #10b981; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 doha.kr 26페이지 완전 검증 리포트</h1>
            <p>검증 일시: ${globalResults.startTime} ~ ${globalResults.endTime}</p>
            <p>소요 시간: ${duration}초 | 대상 사이트: ${BASE_URL}</p>
        </div>

        <div class="summary">
            <div class="stat-card success">
                <div class="stat-number">${successRate}%</div>
                <div class="stat-label">성공률</div>
            </div>
            <div class="stat-card info">
                <div class="stat-number">${globalResults.summary.total}</div>
                <div class="stat-label">총 페이지</div>
            </div>
            <div class="stat-card success">
                <div class="stat-number">${globalResults.summary.passed}</div>
                <div class="stat-label">성공</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-number">${globalResults.summary.warnings}</div>
                <div class="stat-label">경고</div>
            </div>
            <div class="stat-card error">
                <div class="stat-number">${globalResults.summary.failed}</div>
                <div class="stat-label">실패</div>
            </div>
        </div>

        <div class="category-stats">
            <h2>📊 카테고리별 분석</h2>
            <div class="category-grid">
                ${Object.entries(categoryStats).map(([category, stats]) => `
                    <div class="category-item">
                        <h3>${category}</h3>
                        <div class="stat-number" style="font-size: 1.5rem; color: #3b82f6;">${stats.passed}/${stats.total}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(stats.passed/stats.total*100)}%"></div>
                        </div>
                        <div class="stat-label">${(stats.passed/stats.total*100).toFixed(1)}% 성공</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="page-results">
            <h2>📋 페이지별 상세 결과</h2>
            ${globalResults.pages.map(page => `
                <div class="page-result">
                    <div class="page-header ${page.status}">
                        <div class="page-title">
                            ${page.status === 'passed' ? '✅' : page.status === 'warning' ? '⚠️' : '❌'} 
                            [${page.index}] ${page.title}
                            <span class="status-badge status-${page.status}">${page.status.toUpperCase()}</span>
                        </div>
                        <div class="page-url">
                            <a href="${page.fullUrl}" target="_blank">${page.fullUrl}</a>
                        </div>
                    </div>
                    <div class="page-details">
                        <div class="detail-grid">
                            <div class="detail-item">
                                <div class="detail-label">HTTP 상태</div>
                                <div class="detail-value">${page.httpStatus || 'N/A'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">로딩 시간</div>
                                <div class="detail-value">${page.loadTime}ms</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">카테고리</div>
                                <div class="detail-value">${page.category}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">페이지 검증</div>
                                <div class="detail-value">${page.pageValidation?.isValid ? '✅ 통과' : '❌ 실패'}</div>
                            </div>
                        </div>

                        ${page.pageValidation ? `
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <div class="detail-label">제목</div>
                                    <div class="detail-value">${page.pageValidation.hasTitle ? '✅' : '❌'} ${page.pageValidation.title}</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">헤더/네비</div>
                                    <div class="detail-value">${page.pageValidation.hasHeader ? '✅' : '❌'} 존재</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">푸터</div>
                                    <div class="detail-value">${page.pageValidation.hasFooter ? '✅' : '❌'} 존재</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">메인 콘텐츠</div>
                                    <div class="detail-value">${page.pageValidation.hasMain ? '✅' : '❌'} 존재</div>
                                </div>
                            </div>
                        ` : ''}

                        ${page.emergencySystem ? `
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <div class="detail-label">Emergency API</div>
                                    <div class="detail-value">${page.emergencySystem.hasEmergencyManager ? '✅' : '❌'} Manager</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">API 헬퍼</div>
                                    <div class="detail-value">${page.emergencySystem.hasAPIHelpers ? '✅' : '❌'} Helpers</div>
                                </div>
                            </div>
                        ` : ''}

                        ${page.interactiveElements ? `
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <div class="detail-label">시작 버튼</div>
                                    <div class="detail-value">${page.interactiveElements.startButtons}개</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">질문/폼</div>
                                    <div class="detail-value">${page.interactiveElements.questions + page.interactiveElements.forms}개</div>
                                </div>
                            </div>
                        ` : ''}

                        ${page.functionalElements ? `
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <div class="detail-label">입력 필드</div>
                                    <div class="detail-value">${page.functionalElements.inputs}개</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">계산 버튼</div>
                                    <div class="detail-value">${page.functionalElements.calcButtons}개</div>
                                </div>
                            </div>
                        ` : ''}

                        ${page.error ? `
                            <div class="detail-item" style="background: #fef2f2; border: 1px solid #fecaca;">
                                <div class="detail-label" style="color: #991b1b;">오류</div>
                                <div class="detail-value" style="color: #dc2626;">${page.error}</div>
                            </div>
                        ` : ''}

                        ${page.screenshot ? `
                            <div class="screenshot">
                                <img src="${path.relative(REPORT_DIR, page.screenshot)}" alt="${page.title} 스크린샷" loading="lazy">
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>

        <div style="margin-top: 40px; text-align: center; color: #6b7280;">
            <p>리포트 생성 시간: ${new Date().toLocaleString('ko-KR')}</p>
            <p>QA 전문가 검증 완료</p>
        </div>
    </div>
</body>
</html>`;

    // 리포트 파일 저장
    const reportPath = path.join(REPORT_DIR, 'doha-26pages-verification-report.html');
    const jsonPath = path.join(REPORT_DIR, 'doha-26pages-verification-data.json');

    try {
      fs.writeFileSync(reportPath, reportHtml, 'utf8');
      fs.writeFileSync(jsonPath, JSON.stringify(globalResults, null, 2), 'utf8');
      
      console.log(`📄 HTML 리포트: ${reportPath}`);
      console.log(`📊 JSON 데이터: ${jsonPath}`);
    } catch (error) {
      console.error('리포트 저장 실패:', error);
    }
  });
});