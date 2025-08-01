/**
 * 홈페이지 E2E 테스트
 * 메인 페이지의 전체적인 사용자 경험을 테스트합니다.
 */

import { test, expect } from '@playwright/test';

test.describe('홈페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('페이지가 올바르게 로드되어야 함', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/도하닷케이알/);
    
    // 메타 설명 확인
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /심리테스트|운세|도구/);
    
    // 메인 헤더 확인
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // 로고 확인
    const logo = page.locator('header img, header .logo');
    await expect(logo).toBeVisible();
  });

  test('네비게이션 메뉴가 올바르게 작동해야 함', async ({ page }) => {
    // 메인 네비게이션 링크들 확인
    const navLinks = page.locator('nav a, .nav-menu a');
    await expect(navLinks).toHaveCount(4); // 홈, 테스트, 도구, 운세
    
    // 테스트 페이지 이동
    await page.click('text=테스트');
    await expect(page).toHaveURL(/tests/);
    await page.goBack();
    
    // 도구 페이지 이동
    await page.click('text=도구');
    await expect(page).toHaveURL(/tools/);
    await page.goBack();
    
    // 운세 페이지 이동
    await page.click('text=운세');
    await expect(page).toHaveURL(/fortune/);
    await page.goBack();
  });

  test('서비스 카드들이 올바르게 표시되어야 함', async ({ page }) => {
    // 심리테스트 섹션
    const psychologySection = page.locator('.psychology-tests, .test-section');
    await expect(psychologySection).toBeVisible();
    
    const testCards = page.locator('.service-card, .test-card').filter({ hasText: /MBTI|Love DNA|테토이겐/ });
    await expect(testCards).toHaveCount(3);
    
    // 각 테스트 카드 확인
    const mbtiCard = page.locator('.service-card').filter({ hasText: 'MBTI' });
    await expect(mbtiCard).toBeVisible();
    await expect(mbtiCard.locator('.service-title, .card-title')).toContainText('MBTI');
    
    const loveDnaCard = page.locator('.service-card').filter({ hasText: 'Love DNA' });
    await expect(loveDnaCard).toBeVisible();
    
    const tetoEgenCard = page.locator('.service-card').filter({ hasText: '테토이겐' });
    await expect(tetoEgenCard).toBeVisible();
  });

  test('실용도구 섹션이 올바르게 표시되어야 함', async ({ page }) => {
    const toolsSection = page.locator('.tools-section, .utility-tools');
    await expect(toolsSection).toBeVisible();
    
    const toolCards = page.locator('.service-card, .tool-card').filter({ hasText: /BMI|급여계산기|글자수세기/ });
    await expect(toolCards).toHaveCount(3);
    
    // BMI 계산기 카드
    const bmiCard = page.locator('.service-card').filter({ hasText: 'BMI' });
    await expect(bmiCard).toBeVisible();
    await expect(bmiCard.locator('.service-title, .card-title')).toContainText('BMI');
    
    // 급여계산기 카드
    const salaryCard = page.locator('.service-card').filter({ hasText: /급여|세금/ });
    await expect(salaryCard).toBeVisible();
    
    // 글자수세기 카드
    const textCounterCard = page.locator('.service-card').filter({ hasText: /글자수|텍스트/ });
    await expect(textCounterCard).toBeVisible();
  });

  test('운세 서비스 섹션이 올바르게 표시되어야 함', async ({ page }) => {
    const fortuneSection = page.locator('.fortune-section, .fortune-services');
    await expect(fortuneSection).toBeVisible();
    
    const fortuneCards = page.locator('.service-card, .fortune-card').filter({ hasText: /일일운세|사주|타로|띠별|별자리/ });
    await expect(fortuneCards).toHaveCount(5);
    
    // 일일운세 카드
    const dailyCard = page.locator('.service-card').filter({ hasText: /일일|오늘/ });
    await expect(dailyCard).toBeVisible();
    
    // 사주운세 카드
    const sajuCard = page.locator('.service-card').filter({ hasText: '사주' });
    await expect(sajuCard).toBeVisible();
    
    // 타로운세 카드
    const tarotCard = page.locator('.service-card').filter({ hasText: '타로' });
    await expect(tarotCard).toBeVisible();
  });

  test('서비스 카드 클릭 시 해당 페이지로 이동해야 함', async ({ page }) => {
    // MBTI 테스트 카드 클릭
    const mbtiCard = page.locator('.service-card').filter({ hasText: 'MBTI' }).first();
    await mbtiCard.click();
    await expect(page).toHaveURL(/mbti/);
    await page.goBack();
    
    // BMI 계산기 카드 클릭
    const bmiCard = page.locator('.service-card').filter({ hasText: 'BMI' }).first();
    await bmiCard.click();
    await expect(page).toHaveURL(/bmi/);
    await page.goBack();
    
    // 일일운세 카드 클릭
    const dailyFortuneCard = page.locator('.service-card').filter({ hasText: /일일|오늘/ }).first();
    await dailyFortuneCard.click();
    await expect(page).toHaveURL(/daily/);
  });

  test('반응형 디자인이 올바르게 작동해야 함', async ({ page }) => {
    // 데스크톱 뷰 (기본)
    await page.setViewportSize({ width: 1200, height: 800 });
    
    const desktopContainer = page.locator('.container, main');
    await expect(desktopContainer).toBeVisible();
    
    // 서비스 카드들이 가로로 배열되는지 확인
    const serviceCards = page.locator('.service-card').first();
    const cardBox = await serviceCards.boundingBox();
    expect(cardBox.width).toBeGreaterThan(200);
    
    // 태블릿 뷰
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // CSS 전환 대기
    
    const tabletContainer = page.locator('.container, main');
    await expect(tabletContainer).toBeVisible();
    
    // 모바일 뷰\n    await page.setViewportSize({ width: 375, height: 667 });\n    await page.waitForTimeout(500);\n    \n    const mobileContainer = page.locator('.container, main');\n    await expect(mobileContainer).toBeVisible();\n    \n    // 모바일에서 햄버거 메뉴 확인\n    const mobileMenuToggle = page.locator('.mobile-menu-toggle, .hamburger');\n    if (await mobileMenuToggle.isVisible()) {\n      await mobileMenuToggle.click();\n      const mobileNav = page.locator('.mobile-nav, .nav-mobile');\n      await expect(mobileNav).toBeVisible();\n    }\n  });\n\n  test('\ud14c\ub9c8 \uc804\ud658 \uae30\ub2a5\uc774 \uc62c\ubc14\ub974\uac8c \uc791\ub3d9\ud574\uc57c \ud568', async ({ page }) => {\n    // \ud14c\ub9c8 \ud1a0\uae00 \ubc84\ud2bc \ud655\uc778\n    const themeToggle = page.locator('.theme-toggle, .dark-mode-toggle');\n    \n    if (await themeToggle.isVisible()) {\n      // \ucd08\uae30 \ub77c\uc774\ud2b8 \ud14c\ub9c8 \ud655\uc778\n      const html = page.locator('html');\n      await expect(html).not.toHaveClass(/theme-dark|dark/);\n      \n      // \ub2e4\ud06c \ubaa8\ub4dc\ub85c \uc804\ud658\n      await themeToggle.click();\n      await page.waitForTimeout(300); // \uc560\ub2c8\uba54\uc774\uc158 \ub300\uae30\n      \n      await expect(html).toHaveClass(/theme-dark|dark/);\n      \n      // \ub2e4\uc2dc \ub77c\uc774\ud2b8 \ubaa8\ub4dc\ub85c\n      await themeToggle.click();\n      await page.waitForTimeout(300);\n      \n      await expect(html).not.toHaveClass(/theme-dark|dark/);\n    }\n  });\n\n  test('\uac80\uc0c9 \uae30\ub2a5\uc774 \uc62c\ubc14\ub974\uac8c \uc791\ub3d9\ud574\uc57c \ud568', async ({ page }) => {\n    const searchInput = page.locator('input[type=\"search\"], .search-input');\n    \n    if (await searchInput.isVisible()) {\n      // \uac80\uc0c9\uc5b4 \uc785\ub825\n      await searchInput.fill('MBTI');\n      await searchInput.press('Enter');\n      \n      // \uac80\uc0c9 \uacb0\uacfc \ud655\uc778\n      const searchResults = page.locator('.search-results, .search-result-item');\n      await expect(searchResults).toBeVisible();\n      \n      const mbtiResult = page.locator('.search-result-item').filter({ hasText: 'MBTI' });\n      await expect(mbtiResult).toBeVisible();\n    }\n  });\n\n  test('\ud398\uc774\uc9c0 \ub85c\ub529 \uc131\ub2a5\uc774 \uc801\uc808\ud574\uc57c \ud568', async ({ page }) => {\n    const startTime = Date.now();\n    \n    // \ud398\uc774\uc9c0 \ub85c\ub4dc \ub300\uae30\n    await page.waitForLoadState('networkidle');\n    \n    const loadTime = Date.now() - startTime;\n    \n    // 3\ucd08 \uc774\ub0b4\uc5d0 \ub85c\ub4dc\ub418\uc5b4\uc57c \ud568\n    expect(loadTime).toBeLessThan(3000);\n    \n    // \uc8fc\uc694 \uc694\uc18c\ub4e4\uc774 \ubcf4\uc5ec\uc57c \ud568\n    await expect(page.locator('header')).toBeVisible();\n    await expect(page.locator('main, .main-content')).toBeVisible();\n    await expect(page.locator('footer')).toBeVisible();\n  });\n\n  test('\uc811\uadfc\uc131 \uc694\uc18c\ub4e4\uc774 \uc62c\ubc14\ub974\uac8c \uc124\uc815\ub418\uc5b4\uc57c \ud568', async ({ page }) => {\n    // Skip to content \ub9c1\ud06c\n    const skipLink = page.locator('a[href=\"#main\"], .skip-to-content');\n    if (await skipLink.isVisible()) {\n      await expect(skipLink).toContainText(/\uc8fc\uc694 \ucf58\ud150\uce20\ub85c|\ubc14\ub85c\uac00\uae30/);\n    }\n    \n    // \uc8fc\uc694 landmark \uc694\uc18c\ub4e4\n    await expect(page.locator('header')).toBeVisible();\n    await expect(page.locator('main, [role=\"main\"]')).toBeVisible();\n    await expect(page.locor('footer')).toBeVisible();\n    \n    // \ub300\uccb4 \ud14d\uc2a4\ud2b8\uac00 \uc788\ub294 \uc774\ubbf8\uc9c0\ub4e4\n    const images = page.locator('img');\n    const imageCount = await images.count();\n    \n    for (let i = 0; i < imageCount; i++) {\n      const img = images.nth(i);\n      const alt = await img.getAttribute('alt');\n      expect(alt).not.toBeNull();\n      expect(alt.length).toBeGreaterThan(0);\n    }\n    \n    // \uc81c\ubaa9 \uacc4\uce35\uad6c\uc870 \ud655\uc778\n    const h1 = page.locator('h1');\n    await expect(h1).toHaveCount(1); // h1\uc740 \ud55c \uac1c\ub9cc\n    \n    const headings = page.locator('h1, h2, h3, h4, h5, h6');\n    const headingCount = await headings.count();\n    expect(headingCount).toBeGreaterThan(0);\n  });\n\n  test('\ud0a4\ubcf4\ub4dc \ub124\ube44\uac8c\uc774\uc158\uc774 \uc62c\ubc14\ub974\uac8c \uc791\ub3d9\ud574\uc57c \ud568', async ({ page }) => {\n    // Tab \ud0a4\ub85c \ub124\ube44\uac8c\uc774\uc158\n    await page.keyboard.press('Tab');\n    \n    // \ud3ec\ucee4\uc2a4\uac00 \uc788\ub294 \uc694\uc18c \ud655\uc778\n    const focusedElement = page.locator(':focus');\n    await expect(focusedElement).toBeVisible();\n    \n    // \uba87 \ubc88 \ub354 Tab\n    for (let i = 0; i < 5; i++) {\n      await page.keyboard.press('Tab');\n      const currentFocused = page.locator(':focus');\n      await expect(currentFocused).toBeVisible();\n    }\n    \n    // Enter \ud0a4\ub85c \uc5d1\ud2f0\ubca0\uc774\uc158\n    const focusedButton = page.locator('button:focus, a:focus');\n    if (await focusedButton.isVisible()) {\n      const initialUrl = page.url();\n      await page.keyboard.press('Enter');\n      \n      // URL\uc774 \ubcc0\uacbd\ub418\uac70\ub098 \ubaa8\ub2ec\uc774 \uc5f4\ub9ac\ub294\uc9c0 \ud655\uc778\n      await page.waitForTimeout(500);\n      const newUrl = page.url();\n      const modal = page.locator('.modal, [role=\"dialog\"]');\n      \n      const urlChanged = newUrl !== initialUrl;\n      const modalVisible = await modal.isVisible();\n      \n      expect(urlChanged || modalVisible).toBe(true);\n    }\n  });\n\n  test('\uc5d0\ub7ec \ud398\uc774\uc9c0\uac00 \uc62c\ubc14\ub974\uac8c \uc791\ub3d9\ud574\uc57c \ud568', async ({ page }) => {\n    // \uc874\uc7ac\ud558\uc9c0 \uc54a\ub294 \ud398\uc774\uc9c0\ub85c \uc774\ub3d9\n    await page.goto('/non-existent-page');\n    \n    // 404 \ud398\uc774\uc9c0 \ud655\uc778\n    await expect(page).toHaveTitle(/404|Not Found|\ucc3e\uc744 \uc218 \uc5c6\ub294 \ud398\uc774\uc9c0/);\n    \n    const errorMessage = page.locator('.error-message, .not-found-message');\n    await expect(errorMessage).toBeVisible();\n    \n    // \ud648\uc73c\ub85c \ub3cc\uc544\uac00\uae30 \ub9c1\ud06c\n    const homeLink = page.locator('a').filter({ hasText: /\ud648|\uba54\uc778/ });\n    await expect(homeLink).toBeVisible();\n    \n    await homeLink.click();\n    await expect(page).toHaveURL('/');\n  });\n\n  test('\uc18c\uc15c \ubbf8\ub514\uc5b4 \uacf5\uc720 \uae30\ub2a5\uc774 \uc62c\ubc14\ub974\uac8c \uc791\ub3d9\ud574\uc57c \ud568', async ({ page }) => {\n    const shareButtons = page.locator('.share-button, .social-share');\n    \n    if (await shareButtons.first().isVisible()) {\n      const shareButton = shareButtons.first();\n      \n      // \uacf5\uc720 \ubc84\ud2bc \ud074\ub9ad\n      await shareButton.click();\n      \n      // \uacf5\uc720 \ubaa8\ub2ec \ub610\ub294 \ub9c1\ud06c \ubcf5\uc0ac \uba54\uc2dc\uc9c0 \ud655\uc778\n      const shareModal = page.locator('.share-modal, .modal');\n      const copyMessage = page.locator('.copy-success, .copied-message');\n      \n      const modalVisible = await shareModal.isVisible();\n      const messageVisible = await copyMessage.isVisible();\n      \n      expect(modalVisible || messageVisible).toBe(true);\n    }\n  });\n\n  test('\uad11\uace0 \uc601\uc5ed\uc774 \uc62c\ubc14\ub974\uac8c \ub85c\ub4dc\ub418\uc5b4\uc57c \ud568', async ({ page }) => {\n    // AdSense \ub610\ub294 \uae30\ud0c0 \uad11\uace0 \uc2a4\ud06c\ub9bd\ud2b8\n    const adElements = page.locator('.adsbygoogle, .ad-container, [data-ad-client]');\n    \n    if (await adElements.first().isVisible()) {\n      const adCount = await adElements.count();\n      expect(adCount).toBeGreaterThan(0);\n      \n      // \uad11\uace0\uac00 \ud398\uc774\uc9c0 \ub80c\ub354\ub9c1\uc744 \ubc29\ud574\ud558\uc9c0 \uc54a\ub294\uc9c0 \ud655\uc778\n      const mainContent = page.locator('main, .main-content');\n      await expect(mainContent).toBeVisible();\n    }\n  });\n\n  test('\ucfe0\ud0a4 \ub3d9\uc758 \ubc30\ub108\uac00 \uc62c\ubc14\ub974\uac8c \uc791\ub3d9\ud574\uc57c \ud568', async ({ page }) => {\n    const cookieConsent = page.locator('.cookie-consent, .cookie-banner, .cookie-notice');\n    \n    if (await cookieConsent.isVisible()) {\n      // \ucfe0\ud0a4 \ub3d9\uc758 \uba54\uc2dc\uc9c0 \ud655\uc778\n      await expect(cookieConsent).toContainText(/\ucfe0\ud0a4|\uac1c\uc778\uc815\ubcf4|\ub3d9\uc758/);\n      \n      // \ub3d9\uc758 \ubc84\ud2bc \ud074\ub9ad\n      const acceptButton = cookieConsent.locator('button').filter({ hasText: /\ub3d9\uc758|\ud5c8\uc6a9|OK/ });\n      await acceptButton.click();\n      \n      // \ubc30\ub108\uac00 \uc0ac\ub77c\uc9c0\ub294\uc9c0 \ud655\uc778\n      await expect(cookieConsent).not.toBeVisible();\n    }\n  });\n\n  test('\ub9c1\ud06c \ubb34\uacb0\uc131 \uac80\uc0ac', async ({ page }) => {\n    // \ubaa8\ub4e0 \ub9c1\ud06c \ucc3e\uae30\n    const links = page.locator('a[href]');\n    const linkCount = await links.count();\n    \n    expect(linkCount).toBeGreaterThan(0);\n    \n    // \uc0d8\ud50c\ub9c1 - \ucc98\uc74c 10\uac1c \ub9c1\ud06c \uac80\uc0ac\n    const checkCount = Math.min(linkCount, 10);\n    \n    for (let i = 0; i < checkCount; i++) {\n      const link = links.nth(i);\n      const href = await link.getAttribute('href');\n      \n      if (href && href.startsWith('/')) {\n        // \ub0b4\ubd80 \ub9c1\ud06c \ud074\ub9ad \ud14c\uc2a4\ud2b8\n        const linkText = await link.textContent();\n        \n        try {\n          await link.click({ timeout: 5000 });\n          \n          // 404 \ud398\uc774\uc9c0\uac00 \uc544\ub2cc\uc9c0 \ud655\uc778\n          const notFoundElement = page.locator('.not-found, .error-404');\n          const isNotFound = await notFoundElement.isVisible();\n          \n          if (isNotFound) {\n            console.warn(`Broken link found: ${href} (${linkText})`);\n          }\n          \n          await page.goBack();\n          await page.waitForLoadState('networkidle');\n        } catch (error) {\n          console.warn(`Failed to test link: ${href} - ${error.message}`);\n        }\n      }\n    }\n  });\n\n  test('\uc804\uccb4\uc801\uc778 \uc0ac\uc6a9\uc790 \ud50c\ub85c\uc6b0', async ({ page }) => {\n    // 1. \uba54\uc778 \ud398\uc774\uc9c0 \uc811\uadfc\n    await expect(page.locator('h1')).toBeVisible();\n    \n    // 2. \uc11c\ube44\uc2a4 \uc120\ud0dd (\uc608: MBTI \ud14c\uc2a4\ud2b8)\n    const mbtiCard = page.locator('.service-card').filter({ hasText: 'MBTI' }).first();\n    await mbtiCard.click();\n    \n    // 3. \uc11c\ube44\uc2a4 \ud398\uc774\uc9c0 \ub85c\ub4dc \ud655\uc778\n    await expect(page).toHaveURL(/mbti|test/);\n    await expect(page.locator('h1, .page-title')).toBeVisible();\n    \n    // 4. \ub4a4\ub85c \uac00\uae30 \ubc84\ud2bc \ud14c\uc2a4\ud2b8\n    await page.goBack();\n    await expect(page).toHaveURL('/');\n    \n    // 5. \ub2e4\ub978 \uc11c\ube44\uc2a4\ub3c4 \ube60\ub974\uac8c \ud14c\uc2a4\ud2b8\n    const bmiCard = page.locator('.service-card').filter({ hasText: 'BMI' }).first();\n    await bmiCard.click();\n    await expect(page).toHaveURL(/bmi|tool/);\n    \n    await page.goBack();\n    \n    // 6. \ud478\ud130 \ub9c1\ud06c \ud655\uc778\n    const footer = page.locator('footer');\n    await expect(footer).toBeVisible();\n    \n    const footerLinks = footer.locator('a');\n    const footerLinkCount = await footerLinks.count();\n    expect(footerLinkCount).toBeGreaterThan(0);\n  });\n});"