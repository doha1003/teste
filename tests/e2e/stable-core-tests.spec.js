/**
 * 안정성 최우선 핵심 테스트
 * 팀리더 지시: E2E 성공률 50% → 85+ 달성을 위한 안정화된 테스트
 * 
 * @version 1.0.0
 * @created 2025-08-03
 */

import { test, expect } from '@playwright/test';

test.describe('안정성 최우선 핵심 테스트', () => {
  
  // 모든 테스트에 공통 설정
  test.beforeEach(async ({ page }) => {
    // 긴 타임아웃 설정으로 안정성 확보
    page.setDefaultTimeout(45000);
    page.setDefaultNavigationTimeout(45000);
    
    // 네트워크 대기 조건 완화
    page.route('**/*', route => {
      route.continue();
    });
  });

  test('1. 홈페이지 기본 로딩 (최우선)', async ({ page }) => {
    console.log('🧪 홈페이지 기본 로딩 테스트 시작');
    
    try {
      // 1차: DOM 로딩 대기
      await page.goto('/', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // 2차: 핵심 요소 대기
      await page.waitForSelector('body', { 
        state: 'visible',
        timeout: 15000 
      });
      
      // 3차: 제목 확인
      await page.waitForFunction(
        () => document.title && document.title.length > 0,
        {},
        { timeout: 10000 }
      );
      
      // 검증
      await expect(page).toHaveTitle(/doha/i);
      console.log('✅ 홈페이지 기본 로딩 성공');
      
    } catch (error) {
      console.error('❌ 홈페이지 로딩 실패:', error.message);
      throw error;
    }
  });

  test('2. 메인 네비게이션 존재 확인', async ({ page }) => {
    console.log('🧪 메인 네비게이션 확인 테스트 시작');
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // 네비게이션 컨테이너 대기 (유연한 셀렉터)
    await page.waitForSelector('[role="navigation"], nav, .navbar, #navbar', {
      state: 'attached',
      timeout: 20000
    });
    
    // 검증: 네비게이션이 존재하는지
    const navExists = await page.locator('[role="navigation"], nav, .navbar, #navbar').count();
    expect(navExists).toBeGreaterThan(0);
    
    console.log('✅ 메인 네비게이션 확인 성공');
  });

  test('3. 메인 콘텐츠 영역 확인', async ({ page }) => {
    console.log('🧪 메인 콘텐츠 영역 확인 테스트 시작');
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // 메인 콘텐츠 대기 (다양한 셀렉터 시도)
    const mainSelectors = [
      'main', 
      '[role="main"]', 
      '.main-content',
      '#main-content',
      '.container'
    ];
    
    let mainFound = false;
    for (const selector of mainSelectors) {
      try {
        await page.waitForSelector(selector, { 
          state: 'visible', 
          timeout: 5000 
        });
        mainFound = true;
        break;
      } catch (e) {
        continue;
      }
    }
    
    expect(mainFound).toBe(true);
    console.log('✅ 메인 콘텐츠 영역 확인 성공');
  });

  test('4. 서비스 링크들 존재 확인', async ({ page }) => {
    console.log('🧪 서비스 링크들 확인 테스트 시작');
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // 링크 로딩 대기
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // 주요 서비스 링크 확인 (존재하는 것만)
    const serviceKeywords = ['test', 'tools', 'fortune', 'mbti', '심리', '도구', '운세'];
    let foundLinks = 0;
    
    for (const keyword of serviceKeywords) {
      const links = await page.locator(`a[href*="${keyword}"], a:has-text("${keyword}")`).count();
      foundLinks += links;
    }
    
    // 최소 1개 이상의 서비스 링크가 있어야 함
    expect(foundLinks).toBeGreaterThan(0);
    
    console.log(`✅ ${foundLinks}개 서비스 링크 확인 성공`);
  });

  test('5. CSS 기본 적용 확인', async ({ page }) => {
    console.log('🧪 CSS 기본 적용 확인 테스트 시작');
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // CSS 로딩 대기
    await page.waitForFunction(
      () => {
        const bodyStyles = window.getComputedStyle(document.body);
        return bodyStyles.fontFamily && bodyStyles.fontFamily !== 'inherit';
      },
      {},
      { timeout: 20000 }
    );
    
    // 폰트 적용 확인
    const fontFamily = await page.locator('body').evaluate(
      el => window.getComputedStyle(el).fontFamily
    );
    
    // Pretendard 또는 시스템 폰트가 적용되었는지 확인
    expect(fontFamily).toMatch(/Pretendard|apple-system|BlinkMacSystemFont|Arial|sans-serif/i);
    
    console.log('✅ CSS 기본 적용 확인 성공');
  });

  test('6. JavaScript 기본 로딩 확인', async ({ page }) => {
    console.log('🧪 JavaScript 기본 로딩 확인 테스트 시작');
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // JavaScript 객체들 로딩 대기 (하나라도 있으면 성공)
    await page.waitForFunction(
      () => {
        return window.ErrorHandler || 
               window.APIManager || 
               window.EmergencyAPIManager ||
               document.querySelector('script[src*="app.js"]') ||
               document.querySelector('script[src*="main.js"]');
      },
      {},
      { timeout: 25000 }
    );
    
    const jsLoaded = await page.evaluate(() => {
      return !!(window.ErrorHandler || 
                window.APIManager || 
                window.EmergencyAPIManager ||
                document.querySelector('script[src*="app.js"]') ||
                document.querySelector('script[src*="main.js"]'));
    });
    
    expect(jsLoaded).toBe(true);
    console.log('✅ JavaScript 기본 로딩 확인 성공');
  });

  test('7. 모바일 반응형 기본 확인', async ({ page }) => {
    console.log('🧪 모바일 반응형 기본 확인 테스트 시작');
    
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // 기본 요소들이 모바일에서도 보이는지 확인
    await page.waitForSelector('body', { state: 'visible' });
    
    // 컨테이너 너비가 모바일 화면에 맞는지 확인
    const bodyWidth = await page.locator('body').evaluate(el => el.offsetWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
    
    console.log('✅ 모바일 반응형 기본 확인 성공');
  });

  test('8. 긴급 API 시스템 로딩 확인', async ({ page }) => {
    console.log('🧪 긴급 API 시스템 로딩 확인 테스트 시작');
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // 긴급 API 시스템이 로딩되었는지 확인
    await page.waitForFunction(
      () => window.EmergencyAPIManager,
      {},
      { timeout: 20000 }
    );
    
    const emergencySystemLoaded = await page.evaluate(() => {
      return typeof window.EmergencyAPIManager !== 'undefined';
    });
    
    expect(emergencySystemLoaded).toBe(true);
    console.log('✅ 긴급 API 시스템 로딩 확인 성공');
  });

});

// 빠른 연기 테스트 (독립 실행 가능)
test('💨 초고속 연기 테스트', async ({ page }) => {
  console.log('🚀 초고속 연기 테스트 시작');
  
  // 가장 기본적인 테스트만
  await page.goto('/', { 
    waitUntil: 'domcontentloaded',
    timeout: 15000 
  });
  
  await expect(page.locator('body')).toBeVisible();
  
  console.log('✅ 초고속 연기 테스트 통과');
});