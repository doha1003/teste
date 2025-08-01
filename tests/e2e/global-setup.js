/**
 * Playwright 전역 설정
 * 모든 테스트 실행 전에 한 번 실행됩니다.
 */

import { chromium } from '@playwright/test';

async function globalSetup(config) {
  console.log('🚀 E2E 테스트 환경 설정 중...');

  // 브라우저 컨텍스트 생성
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // 기본 URL 접근 가능 여부 확인
    await page.goto(config.projects[0].use.baseURL, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    console.log('✅ 웹 서버가 정상적으로 실행 중입니다.');

    // 필요한 경우 인증 토큰 저장
    // await page.context().storageState({ path: 'tests/e2e/.auth/user.json' });
  } catch (error) {
    console.error('❌ 웹 서버 접근 실패:', error.message);
    throw new Error('웹 서버가 실행되고 있는지 확인해주세요.');
  } finally {
    await browser.close();
  }

  // 환경 변수 설정
  process.env.TEST_ENV = 'e2e';

  console.log('✅ E2E 테스트 환경 설정 완료');
}

export default globalSetup;
