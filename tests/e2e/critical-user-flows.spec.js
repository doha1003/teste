/**
 * 핵심 사용자 플로우 E2E 테스트
 */

import { test, expect } from '@playwright/test';

test.describe('핵심 사용자 플로우', () => {
  test('홈페이지에서 심리테스트 완료까지의 전체 플로우', async ({ page }) => {
    // 1. 홈페이지 방문
    await page.goto('/');
    await expect(page).toHaveTitle(/doha.kr/);

    // 2. MBTI 테스트 선택
    await page.click('text=MBTI 성격유형 테스트');
    await page.waitForLoadState('networkidle');

    // 3. 테스트 시작
    await expect(page.locator('h1')).toContainText('MBTI');
    await page.click('button:has-text("테스트 시작")');

    // 4. 질문에 답변 (12개 질문)
    for (let i = 0; i < 12; i++) {
      await page.waitForSelector('.question-container');

      // 랜덤하게 답변 선택
      const options = page.locator('.option-button');
      const count = await options.count();
      const randomIndex = Math.floor(Math.random() * count);
      await options.nth(randomIndex).click();

      // 다음 질문 로드 대기
      await page.waitForTimeout(300);
    }

    // 5. 결과 확인
    await page.waitForSelector('.result-container');
    const resultTitle = await page.locator('.result-title').textContent();
    expect(resultTitle).toMatch(/[A-Z]{4}/); // MBTI 타입 (예: INTJ)

    // 6. 결과 공유 기능 확인
    await expect(page.locator('button:has-text("카카오톡 공유")')).toBeVisible();
    await expect(page.locator('button:has-text("링크 복사")')).toBeVisible();
  });

  test('운세 서비스 전체 플로우', async ({ page }) => {
    // 1. 홈페이지에서 운세 섹션으로 이동
    await page.goto('/');
    await page.click('text=운세');

    // 2. 타로 운세 선택
    await page.click('text=타로카드 운세');
    await page.waitForLoadState('networkidle');

    // 3. 질문 입력
    await page.fill('input[name="question"]', '올해 나의 연애운은 어떨까요?');

    // 4. 카드 선택 (3장)
    const cards = page.locator('.tarot-card');
    await expect(cards).toHaveCount(78); // 전체 타로 카드 수

    // 랜덤하게 3장 선택
    const selectedIndices = new Set();
    while (selectedIndices.size < 3) {
      const index = Math.floor(Math.random() * 78);
      if (!selectedIndices.has(index)) {
        await cards.nth(index).click();
        selectedIndices.add(index);
        await page.waitForTimeout(500); // 애니메이션 대기
      }
    }

    // 5. 결과 보기
    await page.click('button:has-text("운세 보기")');

    // 6. AI 결과 대기 및 확인
    await page.waitForSelector('.fortune-result', { timeout: 30000 });
    const resultText = await page.locator('.fortune-result').textContent();
    expect(resultText.length).toBeGreaterThan(100); // 충분한 내용 확인
  });

  test('도구 사용 플로우 - BMI 계산기', async ({ page }) => {
    // 1. 도구 페이지로 이동
    await page.goto('/tools/bmi/');

    // 2. 신체 정보 입력
    await page.fill('input[name="height"]', '175');
    await page.fill('input[name="weight"]', '70');

    // 3. 계산하기
    await page.click('button:has-text("계산하기")');

    // 4. 결과 확인
    await expect(page.locator('.bmi-value')).toBeVisible();
    const bmiValue = await page.locator('.bmi-value').textContent();
    expect(parseFloat(bmiValue)).toBeCloseTo(22.86, 1);

    // 5. 건강 조언 확인
    await expect(page.locator('.health-advice')).toContainText('정상 체중');
  });

  test('다국어 및 테마 전환 플로우', async ({ page }) => {
    // 1. 홈페이지 방문
    await page.goto('/');

    // 2. 다크 모드 전환
    await page.click('button[aria-label="테마 전환"]');
    await page.waitForTimeout(500); // 트랜지션 대기

    const darkTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );
    expect(darkTheme).toBe('dark');

    // 3. 페이지 새로고침 후에도 유지되는지 확인
    await page.reload();
    const persistedTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );
    expect(persistedTheme).toBe('dark');
  });

  test('모바일 네비게이션 플로우', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    // 1. 모바일 뷰포트에서 홈페이지 방문
    await page.goto('/');

    // 2. 햄버거 메뉴 열기
    await page.click('button[aria-label="메뉴"]');
    await expect(page.locator('.mobile-menu')).toBeVisible();

    // 3. 메뉴 항목 선택
    await page.click('.mobile-menu >> text=심리테스트');

    // 4. 메뉴 자동 닫힘 확인
    await expect(page.locator('.mobile-menu')).toBeHidden();

    // 5. 페이지 이동 확인
    await expect(page).toHaveURL(/psychological-test/);
  });

  test('오류 복구 플로우', async ({ page }) => {
    // 1. 네트워크 오류 시뮬레이션
    await page.route('**/api/**', (route) => route.abort());

    // 2. 운세 페이지 방문
    await page.goto('/fortune/daily/');

    // 3. 폼 작성 및 제출
    await page.fill('#userName', '테스트');
    await page.selectOption('#birthYear', '1990');
    await page.selectOption('#birthMonth', '1');
    await page.selectOption('#birthDay', '1');
    await page.click('button[type="submit"]');

    // 4. 오류 메시지 확인
    const errorNotification = page.locator('.notification-error');
    await expect(errorNotification).toBeVisible();
    await expect(errorNotification).toContainText('네트워크');

    // 5. 네트워크 복구
    await page.unroute('**/api/**');

    // 6. 재시도
    await page.click('button:has-text("다시 시도")');

    // 7. 성공 확인
    await expect(page.locator('#fortuneResult')).toBeVisible({
      timeout: 10000,
    });
  });

  test('PWA 설치 및 오프라인 플로우', async ({ page }) => {
    // 1. 홈페이지 방문
    await page.goto('/');

    // 2. PWA 설치 프롬프트 확인
    const installButton = page.locator('button:has-text("앱 설치")');
    if (await installButton.isVisible()) {
      await installButton.click();
      // 실제 설치는 브라우저 권한이 필요하므로 스킵
    }

    // 3. 오프라인 모드 시뮬레이션
    await page.context().setOffline(true);

    // 4. 페이지 새로고침
    await page.reload();

    // 5. 오프라인 페이지 확인
    await expect(page.locator('text=오프라인')).toBeVisible();
    await expect(page.locator('text=인터넷 연결을 확인해주세요')).toBeVisible();

    // 6. 온라인 복구
    await page.context().setOffline(false);
    await page.reload();

    // 7. 정상 작동 확인
    await expect(page.locator('h1')).toBeVisible();
  });
});
