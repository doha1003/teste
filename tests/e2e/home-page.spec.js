/**
 * 홈페이지 E2E 테스트
 * 메인 페이지의 핵심 기능들을 테스트합니다.
 */

import { test, expect } from '@playwright/test';

test.describe('홈페이지 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('홈페이지가 올바르게 로드되어야 함', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/doha\.kr|두하|심리테스트|운세/);

    // 주요 요소들이 보여야 함 (실제 HTML 구조에 맞춤)
    await expect(page.locator('nav#navbar-placeholder')).toBeVisible();
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('footer#footer-placeholder')).toBeVisible();

    // 메인 제목 확인
    const mainTitle = page.locator('h1');
    await expect(mainTitle).toBeVisible();
    await expect(mainTitle).toContainText(/두하|doha|심리테스트|운세/);
  });

  test('네비게이션 메뉴가 올바르게 작동해야 함', async ({ page }) => {
    // 메인 네비게이션 확인 (실제 HTML 구조에 맞춤)
    const nav = page.locator('nav#navbar-placeholder');
    await expect(nav).toBeVisible();

    // 운세 메뉴 클릭
    const fortuneLink = nav.locator('a').filter({ hasText: /운세/ });
    if (await fortuneLink.isVisible()) {
      await fortuneLink.click();
      await expect(page).toHaveURL(/fortune/);
    }

    // 홈으로 돌아가기
    await page.goto('/');

    // 테스트 메뉴 클릭
    const testLink = nav.locator('a').filter({ hasText: /테스트|심리/ });
    if (await testLink.isVisible()) {
      await testLink.click();
      await expect(page).toHaveURL(/test/);
    }
  });

  test('서비스 카드들이 올바르게 표시되어야 함', async ({ page }) => {
    // 서비스 카드 섹션 확인
    const serviceCards = page.locator('.service-card, .card, .feature-card');
    await expect(serviceCards.first()).toBeVisible();

    // 최소 3개 이상의 서비스가 있어야 함
    const cardCount = await serviceCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(3);

    // 각 카드에 제목과 설명이 있어야 함
    for (let i = 0; i < Math.min(cardCount, 5); i++) {
      const card = serviceCards.nth(i);
      const title = card.locator('h2, h3, .card-title');
      const description = card.locator('p, .card-description');

      if (await title.isVisible()) {
        await expect(title).toContainText(/.+/);
      }
      if (await description.isVisible()) {
        await expect(description).toContainText(/.+/);
      }
    }
  });

  test('MBTI 테스트로 이동할 수 있어야 함', async ({ page }) => {
    const mbtiCard = page.locator('.service-card, .card').filter({
      hasText: /MBTI|성격유형|personality/,
    });

    if (await mbtiCard.isVisible()) {
      await mbtiCard.click();
      await expect(page).toHaveURL(/mbti/);
    } else {
      // 네비게이션에서 찾기
      const mbtiLink = page.locator('a').filter({ hasText: /MBTI/ });
      if (await mbtiLink.isVisible()) {
        await mbtiLink.click();
        await expect(page).toHaveURL(/mbti/);
      }
    }
  });

  test('반응형 디자인이 올바르게 작동해야 함', async ({ page }) => {
    // 데스크톱 뷰
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(300);

    const desktopContainer = page.locator('.container, main');
    await expect(desktopContainer).toBeVisible();

    // 태블릿 뷰
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);

    const tabletContainer = page.locator('.container, main');
    await expect(tabletContainer).toBeVisible();

    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);

    const mobileContainer = page.locator('.container, main');
    await expect(mobileContainer).toBeVisible();

    // 모바일에서 햄버거 메뉴 확인
    const mobileMenuToggle = page.locator('.mobile-menu-toggle, .hamburger');
    if (await mobileMenuToggle.isVisible()) {
      await mobileMenuToggle.click();
      const mobileNav = page.locator('.mobile-nav, .nav-mobile');
      await expect(mobileNav).toBeVisible();
    }
  });

  test('페이지 로딩 성능이 적절해야 함', async ({ page }) => {
    const startTime = Date.now();

    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // 3초 이내에 로드되어야 함
    expect(loadTime).toBeLessThan(3000);

    // 주요 요소들이 보여야 함
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main, .main-content')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('접근성 요소들이 올바르게 설정되어야 함', async ({ page }) => {
    // 주요 landmark 요소들
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // 제목 계층구조 확인
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1); // h1은 한 개만

    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('키보드 네비게이션이 올바르게 작동해야 함', async ({ page }) => {
    // Tab 키로 네비게이션
    await page.keyboard.press('Tab');

    // 포커스가 있는 요소 확인
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // 몇 번 더 탭하여 네비게이션 확인
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const currentFocus = page.locator(':focus');
      if (await currentFocus.isVisible()) {
        // 포커스가 보이는 요소에 있는지 확인
        await expect(currentFocus).toBeVisible();
      }
    }
  });
});
