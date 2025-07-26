// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('콘텐츠 품질 테스트', () => {
  const pages = [
    { url: '/', title: 'doha.kr', mustHave: ['심리테스트', '운세', 'AI'] },
    { url: '/fortune/daily/', title: '오늘의 운세', mustHave: ['사주팔자', '만세력'] },
    { url: '/fortune/saju/', title: 'AI 사주팔자', mustHave: ['사주팔자', '오행', '성격'] },
    { url: '/fortune/tarot/', title: 'AI 타로', mustHave: ['타로', '카드', '리딩'] },
    { url: '/tests/mbti/', title: 'MBTI', mustHave: ['성격', '유형', '검사'] },
    { url: '/tools/bmi-calculator.html', title: 'BMI', mustHave: ['체질량', '건강', '계산'] }
  ];

  for (const pageInfo of pages) {
    test(`${pageInfo.title} 페이지 콘텐츠 품질`, async ({ page }) => {
      await page.goto(pageInfo.url);
      
      // 타이틀 확인
      await expect(page).toHaveTitle(new RegExp(pageInfo.title));
      
      // 필수 콘텐츠 확인
      const content = await page.textContent('body');
      for (const keyword of pageInfo.mustHave) {
        expect(content).toContain(keyword);
      }
      
      // 깨진 링크 확인
      const links = await page.locator('a[href]').all();
      const brokenLinks = [];
      
      for (const link of links.slice(0, 10)) { // 처음 10개만 테스트
        const href = await link.getAttribute('href');
        if (href && href.startsWith('http')) {
          try {
            const response = await page.request.head(href);
            if (!response.ok()) {
              brokenLinks.push(href);
            }
          } catch (e) {
            // 외부 링크는 실패 가능
          }
        }
      }
      
      expect(brokenLinks.length).toBe(0);
      
      // 메타 데이터 확인
      const metaDescription = await page.getAttribute('meta[name="description"]', 'content');
      expect(metaDescription).toBeTruthy();
      expect(metaDescription.length).toBeGreaterThan(50);
      
      // Open Graph 태그 확인
      const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
      const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content');
      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
    });
  }

  test('광고 표시 확인', async ({ page }) => {
    await page.goto('/fortune/daily/');
    
    // 광고 컨테이너 확인
    const adContainers = await page.locator('.ad-container').count();
    expect(adContainers).toBeGreaterThan(0);
    
    // 광고 레이블 확인
    await expect(page.locator('.ad-label')).toBeVisible();
  });

  test('네비게이션 일관성', async ({ page }) => {
    const pagesToCheck = ['/', '/fortune/daily/', '/tests/mbti/', '/tools/bmi-calculator.html'];
    
    for (const url of pagesToCheck) {
      await page.goto(url);
      
      // 네비게이션 바 확인
      await expect(page.locator('#navbar-placeholder')).toBeVisible();
      
      // 푸터 확인
      await expect(page.locator('#footer-placeholder')).toBeVisible();
      
      // 네비게이션 메뉴 항목 확인
      const navLoaded = await page.waitForFunction(
        () => document.querySelector('#navbar-placeholder').innerHTML.length > 0,
        { timeout: 5000 }
      );
      expect(navLoaded).toBeTruthy();
    }
  });

  test('폼 검증 기능', async ({ page }) => {
    await page.goto('/fortune/daily/');
    
    // 빈 폼 제출 시도
    await page.click('button[type="submit"]');
    
    // HTML5 검증 메시지 확인
    const userNameValid = await page.locator('#userName').evaluate(el => el.validity.valid);
    expect(userNameValid).toBeFalsy();
    
    // 필수 필드만 채우고 제출
    await page.fill('#userName', '테스트');
    await page.selectOption('#birthYear', '1990');
    await page.selectOption('#birthMonth', '1');
    await page.selectOption('#birthDay', '1');
    
    // 이제 제출 가능해야 함
    const formValid = await page.evaluate(() => {
      const form = document.querySelector('form');
      return form.checkValidity();
    });
    expect(formValid).toBeTruthy();
  });

  test('한글 인코딩 확인', async ({ page }) => {
    await page.goto('/fortune/saju/');
    
    // 한글 텍스트가 깨지지 않는지 확인
    const koreanText = await page.textContent('h1');
    expect(koreanText).toContain('사주팔자');
    expect(koreanText).not.toContain('???');
    expect(koreanText).not.toContain('□');
    
    // charset 확인
    const charset = await page.getAttribute('meta[charset]', 'charset');
    expect(charset.toLowerCase()).toBe('utf-8');
  });
});