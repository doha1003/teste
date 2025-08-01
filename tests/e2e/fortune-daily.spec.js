/**
 * 오늘의 운세 E2E 테스트
 */

import { test, expect } from '@playwright/test';

test.describe('오늘의 운세 기능', () => {
  test.beforeEach(async ({ page }) => {
    // 운세 페이지로 이동
    await page.goto('/fortune/daily/');

    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
  });

  test('페이지가 올바르게 로드되어야 함', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/오늘의 운세/);

    // 주요 요소 확인
    await expect(page.locator('h1')).toContainText('오늘의 운세');
    await expect(page.locator('form[data-form="true"]')).toBeVisible();

    // 입력 필드 확인
    await expect(page.locator('#userName')).toBeVisible();
    await expect(page.locator('#birthYear')).toBeVisible();
    await expect(page.locator('#birthMonth')).toBeVisible();
    await expect(page.locator('#birthDay')).toBeVisible();
  });

  test('폼 유효성 검사가 작동해야 함', async ({ page }) => {
    // 빈 폼 제출
    await page.locator('button[type="submit"]').click();

    // 경고 다이얼로그 확인
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('모든 필수 항목을 입력해주세요');
      await dialog.accept();
    });
  });

  test('생년월일 선택이 올바르게 작동해야 함', async ({ page }) => {
    // 연도 선택
    await page.selectOption('#birthYear', '1990');

    // 월 선택
    await page.selectOption('#birthMonth', '2');

    // 일 옵션 확인 (2월은 28일 또는 29일까지)
    const dayOptions = await page.locator('#birthDay option').count();
    expect(dayOptions).toBeLessThanOrEqual(30); // 기본 옵션 + 최대 29일

    // 4월 선택
    await page.selectOption('#birthMonth', '4');

    // 일 옵션 확인 (4월은 30일까지)
    const aprilDayOptions = await page.locator('#birthDay option').count();
    expect(aprilDayOptions).toBe(31); // 기본 옵션 + 30일
  });

  test('운세 조회 전체 시나리오', async ({ page }) => {
    // 사용자 정보 입력
    await page.fill('#userName', '홍길동');
    await page.selectOption('#birthYear', '1990');
    await page.selectOption('#birthMonth', '5');
    await page.selectOption('#birthDay', '15');

    // 선택사항 입력
    await page.selectOption('#birthTime', '0'); // 자시
    await page.check('#isLunar'); // 음력 체크

    // API 응답 대기를 위한 Promise
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/fortune') && response.status() === 200
    );

    // 폼 제출
    await page.locator('button[type="submit"]').click();

    // 로딩 상태 확인
    await expect(page.locator('.spinner')).toBeVisible();

    // API 응답 대기
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();

    // 결과 표시 확인
    await expect(page.locator('#fortuneResult')).toBeVisible();

    // 결과 내용 확인
    const resultText = await page.locator('#fortuneResult').textContent();
    expect(resultText).toBeTruthy();
    expect(resultText.length).toBeGreaterThan(50); // 충분한 내용이 있는지 확인

    // 로딩 스피너 숨김 확인
    await expect(page.locator('.spinner')).toBeHidden();
  });

  test('에러 처리가 올바르게 작동해야 함', async ({ page }) => {
    // API 에러 시뮬레이션을 위한 route 설정
    await page.route('**/api/fortune', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    // 폼 입력
    await page.fill('#userName', '테스트');
    await page.selectOption('#birthYear', '2000');
    await page.selectOption('#birthMonth', '1');
    await page.selectOption('#birthDay', '1');

    // 에러 다이얼로그 리스너 설정
    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    // 폼 제출
    await page.locator('button[type="submit"]').click();

    // 에러 메시지 확인
    await page.waitForTimeout(1000); // 다이얼로그 대기
    expect(dialogMessage).toContain('오류가 발생했습니다');
  });

  test('반응형 디자인이 올바르게 작동해야 함', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });

    // 페이지 리로드
    await page.reload();

    // 모바일에서도 모든 요소가 표시되는지 확인
    await expect(page.locator('form[data-form="true"]')).toBeVisible();
    await expect(page.locator('#userName')).toBeVisible();

    // 가로 스크롤이 없는지 확인
    const bodyWidth = await page.locator('body').evaluate((el) => el.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('접근성 요구사항을 충족해야 함', async ({ page }) => {
    // 키보드 네비게이션 테스트
    await page.keyboard.press('Tab'); // 첫 번째 입력 필드로 이동
    const focusedElement = await page.evaluate(() => document.activeElement.id);
    expect(focusedElement).toBe('userName');

    // 라벨 연결 확인
    const userNameLabel = await page.locator('label[for="userName"]');
    await expect(userNameLabel).toContainText('이름');

    // ARIA 속성 확인
    const form = page.locator('form[data-form="true"]');
    const ariaLabel = await form.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('로컬 스토리지에 폼 데이터가 저장되어야 함', async ({ page }) => {
    // 폼 데이터 입력
    await page.fill('#userName', '김철수');
    await page.selectOption('#birthYear', '1985');

    // 페이지 새로고침
    await page.reload();

    // 저장된 데이터 확인
    const savedName = await page.inputValue('#userName');
    const savedYear = await page.inputValue('#birthYear');

    expect(savedName).toBe('김철수');
    expect(savedYear).toBe('1985');
  });

  test('다크 모드에서도 올바르게 표시되어야 함', async ({ page }) => {
    // 다크 모드 설정
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    });

    // 페이지 리로드
    await page.reload();

    // 다크 모드 적용 확인
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');

    // 텍스트 가독성 확인 (대비율)
    const backgroundColor = await page
      .locator('body')
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const textColor = await page.locator('h1').evaluate((el) => window.getComputedStyle(el).color);

    // 다크 모드에서는 어두운 배경과 밝은 텍스트여야 함
    expect(backgroundColor).toMatch(/rgb.*0|#0|black/i);
    expect(textColor).toMatch(/rgb.*255|#f|white/i);
  });
});
