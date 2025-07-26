const { chromium } = require('playwright');
const fs = require('fs').promises;

// 테스트할 주요 페이지 목록
const pages = [
  { url: 'https://doha.kr', name: '메인 페이지' },
  { url: 'https://doha.kr/fortune/daily/', name: '일일 운세' },
  { url: 'https://doha.kr/fortune/saju/', name: 'AI 사주팔자' },
  { url: 'https://doha.kr/fortune/tarot/', name: 'AI 타로' },
  { url: 'https://doha.kr/tests/mbti/test', name: 'MBTI 테스트' },
  { url: 'https://doha.kr/tools/text-counter', name: '글자수 세기' }
];

// 테스트 결과 저장 객체
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    totalPages: pages.length,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  security: {
    cspHeaders: {},
    domPurifyUsage: {},
    httpsUsage: {},
    sensitiveDataExposure: {}
  },
  performance: {
    loadTimes: {},
    resourceSizes: {},
    apiResponseTimes: {}
  },
  ux: {
    mobileResponsiveness: {},
    navigationUsability: {},
    errorHandling: {}
  },
  content: {
    seoMetadata: {},
    accessibility: {},
    koreanLocalization: {}
  },
  pageDetails: []
};

async function runComprehensiveTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  for (const pageInfo of pages) {
    console.log(`\n📍 검증 중: ${pageInfo.name} (${pageInfo.url})`);
    
    const page = await context.newPage();
    const pageResult = {
      name: pageInfo.name,
      url: pageInfo.url,
      issues: [],
      warnings: [],
      successes: []
    };

    try {
      // 콘솔 메시지 수집
      const consoleLogs = [];
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        } else {
          consoleLogs.push({ type: msg.type(), text: msg.text() });
        }
      });

      // 네트워크 요청 모니터링
      const networkRequests = [];
      page.on('request', request => {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType()
        });
      });

      // 페이지 로드 시작
      const startTime = Date.now();
      const response = await page.goto(pageInfo.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      const loadTime = Date.now() - startTime;

      // 1. 보안 검증
      console.log('  🔒 보안 검증...');
      
      // CSP 헤더 확인
      const cspHeader = await page.evaluate(() => {
        const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        return meta ? meta.getAttribute('content') : null;
      });
      
      if (cspHeader) {
        if (cspHeader.includes('unsafe-inline') || cspHeader.includes('unsafe-eval')) {
          pageResult.issues.push('CSP 헤더에 unsafe-inline 또는 unsafe-eval 포함');
        } else {
          pageResult.successes.push('CSP 헤더가 적절하게 설정됨');
        }
      } else {
        pageResult.warnings.push('CSP 헤더가 없음');
      }

      // DOMPurify 사용 확인
      const hasDOMPurify = await page.evaluate(() => {
        return typeof window.DOMPurify !== 'undefined' && typeof window.safeHTML === 'function';
      });
      
      if (hasDOMPurify) {
        pageResult.successes.push('DOMPurify가 로드되고 safeHTML 함수 사용 가능');
      } else {
        pageResult.issues.push('DOMPurify 또는 safeHTML 함수가 없음');
      }

      // HTTPS 사용 확인
      if (response.url().startsWith('https://')) {
        pageResult.successes.push('HTTPS 사용 중');
      } else {
        pageResult.issues.push('HTTP 사용 중 (보안 위험)');
      }

      // 2. 성능 검증
      console.log('  ⚡ 성능 검증...');
      
      testResults.performance.loadTimes[pageInfo.name] = loadTime;
      
      if (loadTime > 3000) {
        pageResult.warnings.push(`페이지 로드 시간이 3초 초과: ${(loadTime/1000).toFixed(2)}초`);
      } else {
        pageResult.successes.push(`빠른 로드 시간: ${(loadTime/1000).toFixed(2)}초`);
      }

      // 만세력 DB 크기 확인 (사주/일일운세 페이지)
      if (pageInfo.url.includes('saju') || pageInfo.url.includes('daily')) {
        const hasLargeManseryeok = networkRequests.some(req => 
          req.url.includes('manseryeok-database.js')
        );
        
        if (hasLargeManseryeok) {
          pageResult.issues.push('38MB 만세력 DB를 직접 로드 중 (성능 문제)');
        } else {
          // API 사용 확인
          const usesAPI = networkRequests.some(req => 
            req.url.includes('/api/manseryeok')
          );
          if (usesAPI) {
            pageResult.successes.push('만세력 API 사용 중 (성능 최적화됨)');
          }
        }
      }

      // 3. UX 검증
      console.log('  🎨 UX 검증...');
      
      // 모바일 뷰포트 테스트
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      const isMobileResponsive = await page.evaluate(() => {
        const viewport = window.innerWidth;
        const content = document.querySelector('.container') || document.querySelector('main');
        return content && content.offsetWidth <= viewport;
      });
      
      if (isMobileResponsive) {
        pageResult.successes.push('모바일 반응형 디자인 작동');
      } else {
        pageResult.warnings.push('모바일 반응형 디자인 문제 가능성');
      }
      
      // 다시 데스크톱으로
      await page.setViewportSize({ width: 1280, height: 720 });

      // 네비게이션 확인
      const hasNavigation = await page.evaluate(() => {
        return document.querySelector('nav') !== null || 
               document.querySelector('.navbar') !== null;
      });
      
      if (hasNavigation) {
        pageResult.successes.push('네비게이션 메뉴 존재');
      } else {
        pageResult.warnings.push('네비게이션 메뉴가 없을 수 있음');
      }

      // 4. 콘텐츠 검증
      console.log('  📝 콘텐츠 검증...');
      
      // SEO 메타데이터
      const seoData = await page.evaluate(() => {
        return {
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.content,
          ogTitle: document.querySelector('meta[property="og:title"]')?.content,
          ogImage: document.querySelector('meta[property="og:image"]')?.content
        };
      });
      
      if (seoData.title && seoData.description) {
        pageResult.successes.push('SEO 메타데이터 적절함');
      } else {
        pageResult.warnings.push('SEO 메타데이터 누락');
      }

      // 한국어 콘텐츠 확인
      const hasKoreanContent = await page.evaluate(() => {
        const text = document.body.innerText;
        return /[가-힣]/.test(text);
      });
      
      if (hasKoreanContent) {
        pageResult.successes.push('한국어 콘텐츠 확인됨');
      } else {
        pageResult.issues.push('한국어 콘텐츠가 없음');
      }

      // 5. 기능 테스트 (페이지별)
      console.log('  🔧 기능 테스트...');
      
      if (pageInfo.url.includes('saju') || pageInfo.url.includes('daily')) {
        // 날짜 입력 폼 테스트
        const hasDateInput = await page.evaluate(() => {
          return document.querySelector('input[type="date"]') !== null ||
                 document.querySelector('select[name*="year"]') !== null;
        });
        
        if (hasDateInput) {
          pageResult.successes.push('날짜 입력 폼 존재');
        } else {
          pageResult.warnings.push('날짜 입력 폼이 없을 수 있음');
        }
      }

      if (pageInfo.url.includes('text-counter')) {
        // 글자수 세기 기능 테스트
        const textarea = await page.$('textarea');
        if (textarea) {
          await textarea.type('테스트 문장입니다.');
          await page.waitForTimeout(500);
          
          const hasResult = await page.evaluate(() => {
            const results = document.querySelectorAll('.result, .count, #result');
            return Array.from(results).some(el => el.textContent.includes('5') || el.textContent.includes('9'));
          });
          
          if (hasResult) {
            pageResult.successes.push('글자수 세기 기능 정상 작동');
          } else {
            pageResult.warnings.push('글자수 세기 결과 표시 문제 가능성');
          }
        }
      }

      // 콘솔 에러 체크
      if (consoleErrors.length > 0) {
        pageResult.issues.push(`콘솔 에러 ${consoleErrors.length}개: ${consoleErrors.slice(0, 3).join(', ')}`);
      } else {
        pageResult.successes.push('콘솔 에러 없음');
      }

      // 결과 집계
      testResults.pageDetails.push(pageResult);
      
      if (pageResult.issues.length > 0) {
        testResults.summary.failed++;
      } else if (pageResult.warnings.length > 0) {
        testResults.summary.warnings++;
      } else {
        testResults.summary.passed++;
      }

    } catch (error) {
      console.error(`  ❌ 에러 발생: ${error.message}`);
      pageResult.issues.push(`페이지 로드 실패: ${error.message}`);
      testResults.summary.failed++;
      testResults.pageDetails.push(pageResult);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // 종합 분석
  console.log('\n\n📊 종합 검증 결과');
  console.log('='.repeat(50));
  console.log(`✅ 통과: ${testResults.summary.passed}개`);
  console.log(`⚠️  경고: ${testResults.summary.warnings}개`);
  console.log(`❌ 실패: ${testResults.summary.failed}개`);

  // 주요 발견사항
  console.log('\n🔍 주요 발견사항:');
  
  const allIssues = testResults.pageDetails.flatMap(p => p.issues);
  const uniqueIssues = [...new Set(allIssues)];
  
  if (uniqueIssues.length > 0) {
    console.log('\n심각한 문제:');
    uniqueIssues.forEach(issue => {
      console.log(`  - ${issue}`);
    });
  }

  const allWarnings = testResults.pageDetails.flatMap(p => p.warnings);
  const uniqueWarnings = [...new Set(allWarnings)];
  
  if (uniqueWarnings.length > 0) {
    console.log('\n개선 필요:');
    uniqueWarnings.forEach(warning => {
      console.log(`  - ${warning}`);
    });
  }

  // 결과 저장
  const reportPath = `comprehensive-verification-${Date.now()}.json`;
  await fs.writeFile(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 상세 보고서 저장됨: ${reportPath}`);

  return testResults;
}

// 실행
runComprehensiveTest().catch(console.error);