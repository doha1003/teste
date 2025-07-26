// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('운세 페이지 테스트', () => {
  test('일일운세 페이지 로딩 및 기능 테스트', async ({ page }) => {
    await page.goto('/fortune/daily/');
    
    // 페이지 로드 확인
    await expect(page).toHaveTitle(/오늘의 운세/);
    
    // 필수 요소 확인
    await expect(page.locator('h1')).toContainText('오늘의 운세');
    await expect(page.locator('#userName')).toBeVisible();
    await expect(page.locator('#birthYear')).toBeVisible();
    
    // 만세력 API 클라이언트 로드 확인
    const manseryeokClient = await page.evaluate(() => window.manseryeokClient);
    expect(manseryeokClient).toBeTruthy();
    
    // 폼 입력 테스트
    await page.fill('#userName', '테스트');
    await page.selectOption('#birthYear', '1990');
    await page.selectOption('#birthMonth', '5');
    await page.selectOption('#birthDay', '15');
    
    // 성능 측정
    const startTime = Date.now();
    await page.click('button[type="submit"]');
    
    // 결과 대기 (최대 10초)
    await page.waitForSelector('.fortune-result-card', { timeout: 10000 });
    const loadTime = Date.now() - startTime;
    
    console.log(`일일운세 결과 로딩 시간: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000); // 5초 이내
    
    // 카드 디자인 확인
    const resultCard = page.locator('.fortune-result-card');
    await expect(resultCard).toBeVisible();
    await expect(resultCard).toHaveCSS('background', /gradient/);
  });

  test('사주팔자 페이지 로딩 및 기능 테스트', async ({ page }) => {
    await page.goto('/fortune/saju/');
    
    await expect(page).toHaveTitle(/AI 사주팔자/);
    await expect(page.locator('h1')).toContainText('AI 사주팔자');
    
    // 만세력 API 통합 확인
    const hasAsync = await page.evaluate(() => {
      return typeof window.calculateSajuWithManseryeok === 'function';
    });
    expect(hasAsync).toBeTruthy();
    
    // 폼 입력
    await page.fill('#userName', '테스트');
    await page.selectOption('#gender', '남');
    await page.selectOption('#birthYear', '1985');
    await page.selectOption('#birthMonth', '3');
    await page.selectOption('#birthDay', '20');
    await page.selectOption('#birthTime', '14');
    
    // 결과 생성
    await page.click('button[type="submit"]');
    await page.waitForSelector('.fortune-result-card', { timeout: 10000 });
    
    // 사주 구성 요소 확인
    await expect(page.locator('.saju-table')).toBeVisible();
    await expect(page.locator('.elements-chart')).toBeVisible();
  });

  test('타로 페이지 로딩 및 기능 테스트', async ({ page }) => {
    await page.goto('/fortune/tarot/');
    
    await expect(page).toHaveTitle(/AI 타로 리딩/);
    
    // 질문 입력
    await page.fill('#question', '앞으로의 인생 방향에 대해 조언을 주세요');
    await page.selectOption('#spreadType', 'threeCard');
    
    // 리딩 시작
    await page.click('button[onclick="startTarotReading()"]');
    
    // 결과 대기
    await page.waitForSelector('.fortune-result-card', { timeout: 15000 });
    
    // 카드 표시 확인
    const cards = page.locator('.card-container');
    await expect(cards).toHaveCount(3); // 3장 스프레드
  });

  test('보안 기능 테스트', async ({ page }) => {
    await page.goto('/fortune/daily/');
    
    // DOMPurify 로드 확인
    const hasDOMPurify = await page.evaluate(() => typeof window.DOMPurify !== 'undefined');
    expect(hasDOMPurify).toBeTruthy();
    
    // safeHTML 함수 확인
    const hasSafeHTML = await page.evaluate(() => typeof window.safeHTML === 'function');
    expect(hasSafeHTML).toBeTruthy();
    
    // XSS 방지 테스트
    const xssTest = await page.evaluate(() => {
      const dirty = '<img src=x onerror=alert(1)>';
      const clean = window.safeHTML(dirty);
      return !clean.includes('onerror');
    });
    expect(xssTest).toBeTruthy();
  });

  test('만세력 API 응답 테스트', async ({ page }) => {
    const response = await page.request.get('https://doha-kr-ap.vercel.app/api/manseryeok?year=2024&month=1&day=1');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.success).toBeTruthy();
    expect(data.data).toBeTruthy();
    expect(data.data.yearGanji).toBeTruthy();
    expect(data.data.dayGanji).toBeTruthy();
  });

  test('모바일 반응형 테스트', async ({ page, browserName }) => {
    if (browserName !== 'chromium') return;
    
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/fortune/daily/');
    
    // 모바일에서 요소 표시 확인
    await expect(page.locator('.page-header')).toBeVisible();
    await expect(page.locator('.fortune-form-container')).toBeVisible();
    
    // 폼 요소가 세로로 정렬되는지 확인
    const formRow = page.locator('.form-row').first();
    const flexDirection = await formRow.evaluate(el => 
      window.getComputedStyle(el).flexDirection
    );
    expect(flexDirection).toBe('column');
  });
});