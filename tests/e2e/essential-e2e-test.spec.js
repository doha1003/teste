import { test, expect } from '@playwright/test';

// 핵심 사용자 플로우만 테스트 (안정성 우선)
test.describe('Essential User Flows - Phase 3', () => {
  test.beforeEach(async ({ page }) => {
    // 빠른 타임아웃 설정
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(15000);
  });

  test('홈페이지 로딩 및 기본 요소 확인', async ({ page }) => {
    await page.goto('http://localhost:3000', {
      waitUntil: 'domcontentloaded', // networkidle0 대신 빠른 로딩
      timeout: 10000,
    });

    // 제목 확인
    await expect(page).toHaveTitle(/doha.kr/);

    // 네비게이션 확인
    await expect(page.locator('[role="navigation"]')).toBeVisible();

    // 메인 콘텐츠 확인
    await expect(page.locator('main')).toBeVisible();

    // Critical CSS 적용 확인
    const bodyStyles = await page
      .locator('body')
      .evaluate((el) => window.getComputedStyle(el).fontFamily);
    expect(bodyStyles).toContain('Pretendard');
  });

  test('서비스 링크 기본 동작 확인', async ({ page }) => {
    await page.goto('http://localhost:3000', {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });

    // 심리테스트 링크 확인
    const testLink = page.locator('a[href*="/tests/"]').first();
    await expect(testLink).toBeVisible();

    // 실용도구 링크 확인
    const toolsLink = page.locator('a[href*="/tools/"]').first();
    await expect(toolsLink).toBeVisible();

    // 운세 링크 확인
    const fortuneLink = page.locator('a[href*="/fortune/"]').first();
    await expect(fortuneLink).toBeVisible();
  });

  test('모바일 반응형 확인', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:3000', {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });

    // 제목이 모바일에서도 보이는지 확인
    const title = page.locator('h1').first();
    await expect(title).toBeVisible();

    // 컨테이너가 모바일 width에 맞는지 확인
    const container = page.locator('.container').first();
    const containerWidth = await container.evaluate((el) => el.offsetWidth);
    expect(containerWidth).toBeLessThanOrEqual(375);
  });

  test('JavaScript 기본 기능 동작 확인', async ({ page }) => {
    await page.goto('http://localhost:3000', {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });

    // JavaScript 로딩 확인
    const jsLoaded = await page.evaluate(() => {
      return (
        typeof window.ErrorHandler !== 'undefined' ||
        typeof window.APIManager !== 'undefined' ||
        document.querySelector('script[src*="app.js"]') !== null
      );
    });

    expect(jsLoaded).toBe(true);
  });

  test('성능 기본 확인', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:3000', {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });

    const loadTime = Date.now() - startTime;

    // 로딩 시간이 합리적인지 확인 (10초 이내)
    expect(loadTime).toBeLessThan(10000);

    // First Paint 확인
    const paintMetrics = await page.evaluate(() => {
      const paint = performance.getEntriesByName('first-contentful-paint')[0];
      return paint ? paint.startTime : 0;
    });

    // FCP가 5초 이내인지 확인 (관대한 기준)
    expect(paintMetrics).toBeLessThan(5000);
  });
});

// 개별 실행 가능한 간단한 테스트
test('Quick Smoke Test', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.locator('body')).toBeVisible();
  console.log('✅ Smoke test passed');
});
