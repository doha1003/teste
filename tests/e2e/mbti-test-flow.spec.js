/**
 * MBTI 테스트 E2E 테스트
 * MBTI 성격유형 테스트의 전체 플로우를 테스트합니다.
 */

import { test, expect } from '@playwright/test';

test.describe('MBTI 테스트 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/mbti/');
  });

  test('MBTI 테스트 소개 페이지 확인', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/MBTI|성격유형|personality/);

    // 주요 섹션들 확인
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText(/MBTI|성격유형/);

    // 테스트 시작 버튼 확인 (실제 HTML 구조에 맞춤)
    const startButton = page.locator('a.test-start-btn, a.cta-btn-primary').first();
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveText(/테스트.*시작/);
  });

  test('MBTI 테스트 시작 및 첫 질문 확인', async ({ page }) => {
    // 테스트 시작 (실제 버튼 클래스 사용)
    const startButton = page.locator('a.test-start-btn, a.cta-btn-primary').first();

    if (await startButton.isVisible()) {
      await startButton.click();
    } else {
      await page.goto('/tests/mbti/test.html');
    }

    // 첫 번째 질문 확인 (실제 DOM 구조에 맞게 수정)
    const question = page.locator('#question');
    await expect(question).toBeVisible();

    // 답변 옵션 확인 (실제 DOM 구조에 맞게 수정)
    const options = page.locator('.mbti-option-btn');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThanOrEqual(2);

    // 진행률 표시 확인
    const progress = page.locator('.progress, .step-indicator');
    if (await progress.isVisible()) {
      await expect(progress).toContainText(/1|첫/);
    }
  });

  test('MBTI 질문에 순차적으로 답변', async ({ page }) => {
    await page.goto('/tests/mbti/test.html');

    // 첫 번째 질문 확인
    const questionTitle = page.locator('.question-title, .question h2, h2');
    await expect(questionTitle).toBeVisible();

    // 5개 질문에 답변 (테스트 간소화)
    const maxQuestions = 5;
    let currentQuestion = 1;

    while (currentQuestion <= maxQuestions) {
      // 현재 질문 확인 (실제 DOM 구조에 맞게 수정)
      const question = page.locator('#question');
      await expect(question).toBeVisible();

      // 답변 옵션 확인
      const options = page.locator('.mbti-option-btn');
      const optionCount = await options.count();

      if (optionCount === 0) {
        break;
      }

      expect(optionCount).toBeGreaterThanOrEqual(2);

      // 첫 번째 옵션 선택
      const chosenOption = options.first();

      if ((await chosenOption.getAttribute('type')) === 'radio') {
        await chosenOption.check();
      } else {
        await chosenOption.click();
      }

      // 다음 버튼 클릭
      const nextButton = page.locator('button').filter({ hasText: /다음|Next/ });
      if ((await nextButton.isVisible()) && !(await nextButton.isDisabled())) {
        await nextButton.click();
        await page.waitForTimeout(500);
        currentQuestion++;
      } else {
        break;
      }

      if (currentQuestion > maxQuestions) {
        break;
      }
    }

    // 테스트 완료 후 결과 확인
    const submitButton = page.locator('button').filter({ hasText: /완료|결과.*보기|Submit/ });
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }
  });

  test('모바일에서의 MBTI 테스트', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tests/mbti/test.html');

    // 모바일에서 질문과 옵션이 잘 보이는지 확인
    const question = page.locator('#question');
    await expect(question).toBeVisible();

    const questionBox = await question.boundingBox();
    expect(questionBox.width).toBeLessThan(400);

    // 옵션 버튼들이 터치하기 적절한 크기인지 확인
    const options = page.locator('.option, button[data-value]');
    if (await options.first().isVisible()) {
      const optionBox = await options.first().boundingBox();
      expect(optionBox.height).toBeGreaterThan(44);
    }

    // 터치 이벤트로 옵션 선택 테스트
    if (await options.first().isVisible()) {
      await options.first().tap();
      await expect(options.first()).toHaveClass(/selected|active/);
    }
  });

  test('접근성 - 키보드 네비게이션', async ({ page }) => {
    await page.goto('/tests/mbti/test.html');

    // Tab 키로 네비게이션
    await page.keyboard.press('Tab');

    // 포커스가 첫 번째 옵션에 있는지 확인
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // 화살표 키로 옵션 간 이동
    await page.keyboard.press('ArrowDown');

    // Space 키로 선택
    await page.keyboard.press('Space');

    // 선택되었는지 확인
    const selectedOption = page.locator(':focus');
    await expect(selectedOption)
      .toHaveClass(/selected|active/)
      .or(expect(selectedOption).toBeChecked());

    // Tab으로 다음 버튼으로 이동
    await page.keyboard.press('Tab');
    const nextButton = page.locator(':focus');
    await expect(nextButton).toContainText(/다음|Next/);

    // Enter로 다음 질문으로
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // 다음 질문이 나타났는지 확인
    const nextQuestion = page.locator('.question');
    await expect(nextQuestion).toBeVisible();
  });
});
