/**
 * 일일 운세 서비스 E2E 테스트
 * 사용자가 일일 운세를 조회하는 전체 과정을 테스트합니다.
 */

import { test, expect } from '@playwright/test';

test.describe('일일 운세 서비스', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('홈페이지에서 일일 운세 서비스로 이동', async ({ page }) => {
    // 운세 서비스 카드 찾기
    const dailyFortuneCard = page.locator('.service-card, .fortune-card').filter({
      hasText: /일일|오늘.*운세|데일리/,
    });
    await expect(dailyFortuneCard).toBeVisible();

    // 카드 설명 확인
    await expect(dailyFortuneCard).toContainText(/오늘|일일|데일리/);

    // 카드 클릭
    await dailyFortuneCard.click();

    // 운세 페이지로 이동 확인
    await expect(page).toHaveURL(/fortune.*daily|daily.*fortune/);
    await expect(page.locator('h1')).toContainText(/일일.*운세|오늘.*운세/);
  });

  test('사용자 정보 입력 폼 처리', async ({ page }) => {
    await page.goto('/fortune/daily/');

    // 사용자 정보 입력 폼 확인
    const userForm = page.locator('form, .user-info-form, .fortune-form');
    await expect(userForm).toBeVisible();

    // 이름 입력 필드
    const nameInput = page.locator('input[name="name"], input[placeholder*="이름"], #name');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('김테스트');

    // 생년월일 입력
    const birthDateInput = page.locator('input[name="birthDate"], input[type="date"], #birthDate');
    if (await birthDateInput.isVisible()) {
      await birthDateInput.fill('1990-01-01');
    }

    // 형식 유효성 검사
    const nameValue = await nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(1);

    if (await birthDateInput.isVisible()) {
      const dateValue = await birthDateInput.inputValue();
      expect(dateValue).toMatch(/\d{4}-\d{2}-\d{2}/);
    }
  });

  test('운세 조회 버튼 클릭 및 로딩 처리', async ({ page }) => {
    await page.goto('/fortune/daily/');

    // 사용자 정보 입력
    await page.fill('input[name="name"], #name', '이테스트');

    const birthDateInput = page.locator('input[name="birthDate"], input[type="date"]');
    if (await birthDateInput.isVisible()) {
      await birthDateInput.fill('1995-06-15');
    }

    // 운세 보기 버튼 클릭
    const fortuneButton = page.locator('button').filter({
      hasText: /운세.*보기|조회|확인|Get.*Fortune/,
    });
    await expect(fortuneButton).toBeVisible();
    await expect(fortuneButton).toBeEnabled();

    await fortuneButton.click();

    // 로딩 상태 확인
    const loadingElement = page.locator('.loading, .spinner, .fortune-loading');
    if (await loadingElement.isVisible()) {
      await expect(loadingElement).toContainText(/로딩|분석|생성/);

      // 로딩 완료 대기 (최대 15초)
      await expect(loadingElement).not.toBeVisible({ timeout: 15000 });
    }
  });

  test('운세 결과 표시 및 내용 검증', async ({ page }) => {
    await page.goto('/fortune/daily/');

    // Mock 데이터로 결과 표시 시뮬레이션
    await page.evaluate(() => {
      // 전역 변수로 Mock 데이터 설정
      window.mockFortuneData = {
        success: true,
        data: {
          fortune: '오늘은 새로운 기회가 찾아올 것입니다. 긍정적인 마음가짐으로 하루를 시작하세요.',
          luckyNumber: 7,
          luckyColor: '파란색',
          advice: '새로운 사람들과의 만남을 두려워하지 마세요.',
          mood: '운세가 좋은 날',
          timestamp: new Date().toISOString(),
        },
      };
    });

    // 사용자 정보 입력 및 제출
    await page.fill('input[name="name"]', '박테스트');
    if (await page.locator('input[type="date"]').isVisible()) {
      await page.fill('input[type="date"]', '1992-03-20');
    }

    const submitButton = page.locator('button').filter({ hasText: /운세/ });
    await submitButton.click();

    // 결과 컨테이너 확인
    const resultContainer = page.locator(
      '.fortune-result, .result-container, .daily-fortune-result'
    );
    await expect(resultContainer).toBeVisible({ timeout: 10000 });

    // 주요 운세 내용 확인
    const fortuneText = page.locator('.fortune-text, .main-fortune, .fortune-content');
    await expect(fortuneText).toBeVisible();
    await expect(fortuneText).toContainText(/기회|마음가짐|하루/);
  });

  test('모바일에서의 일일 운세 서비스', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/fortune/daily/');

    // 모바일에서 폼이 잘 보이는지 확인
    const form = page.locator('form, .fortune-form');
    await expect(form).toBeVisible();

    const formBox = await form.boundingBox();
    expect(formBox.width).toBeLessThan(400); // 모바일 너비에 맞음

    // 입력 필드들이 터치하기 적절한 크기인지 확인
    const nameInput = page.locator('input[name="name"]');
    if (await nameInput.isVisible()) {
      const inputBox = await nameInput.boundingBox();
      expect(inputBox.height).toBeGreaterThan(44); // 최소 터치 타겟 크기
    }

    // 버튼들이 적절한 크기인지 확인
    const submitButton = page.locator('button').filter({ hasText: /운세/ });
    if (await submitButton.isVisible()) {
      const buttonBox = await submitButton.boundingBox();
      expect(buttonBox.height).toBeGreaterThan(44);
      expect(buttonBox.width).toBeGreaterThan(80);
    }
  });

  test('에러 처리 및 사용자 안내', async ({ page }) => {
    await page.goto('/fortune/daily/');

    // 빈 정보로 제출 시도
    const submitButton = page.locator('button').filter({ hasText: /운세/ });
    await submitButton.click();

    // 유효성 검사 에러 메시지 확인
    const errorMessage = page.locator('.error-message, .validation-error, .form-error');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText(/이름|생년월일|필수/);
    }
  });

  test('일일 운세 페이지 접근성', async ({ page }) => {
    await page.goto('/fortune/daily/');

    // 페이지 제목 및 메타 정보 확인
    await expect(page).toHaveTitle(/일일.*운세|오늘.*운세/);

    // 주요 landmark 요소들
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();

    // 폼 라벨과 입력 요소 연결 확인
    const nameLabel = page.locator('label[for="name"], label').filter({ hasText: /이름/ });
    if (await nameLabel.isVisible()) {
      const forAttr = await nameLabel.getAttribute('for');
      const nameInput = page.locator(`#${forAttr}`);
      await expect(nameInput).toBeVisible();
    }
  });

  test('일일 운세 키보드 네비게이션', async ({ page }) => {
    await page.goto('/fortune/daily/');

    // Tab 키로 폼 요소들 순회
    await page.keyboard.press('Tab');

    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // 이름 필드에 포커스가 있을 것
    const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
    expect(['input', 'select', 'textarea']).toContain(tagName);

    // 다음 필드로 이동
    await page.keyboard.press('Tab');

    // 생년월일이나 성별 필드
    focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // 제출 버튼으로 이동
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // 더 탭이 필요할 수 있음

    focusedElement = page.locator(':focus');
    const buttonText = await focusedElement.textContent();
    expect(buttonText).toMatch(/운세|조회|확인/);
  });
});
