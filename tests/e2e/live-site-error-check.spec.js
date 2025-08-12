import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 테스트 결과를 저장할 디렉토리 생성
const resultsDir = path.join(__dirname, '../..', 'live-site-test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// 콘솔 로그 수집을 위한 설정
test.describe('도하 라이브 사이트 오류 검사', () => {
  const siteUrl = 'https://doha.kr';
  const consoleErrors = [];
  const networkErrors = [];
  let page;

  test.beforeEach(async ({ page: testPage, context }) => {
    page = testPage;
    
    // 콘솔 메시지 수집
    page.on('console', msg => {
      const msgType = msg.type();
      const text = msg.text();
      
      if (msgType === 'error' || msgType === 'warning') {
        consoleErrors.push({
          type: msgType,
          text: text,
          url: page.url(),
          timestamp: new Date().toISOString()
        });
        console.log(`[${msgType.toUpperCase()}] ${text}`);
      }
    });

    // 네트워크 오류 수집
    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        failure: request.failure(),
        method: request.method(),
        pageUrl: page.url(),
        timestamp: new Date().toISOString()
      });
      console.log(`[NETWORK ERROR] ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Response 오류 수집 (404, 500 등)
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          method: response.request().method(),
          pageUrl: page.url(),
          timestamp: new Date().toISOString()
        });
        console.log(`[HTTP ERROR] ${response.status()} ${response.statusText()} - ${response.url()}`);
      }
    });
  });

  test.afterEach(async () => {
    // 각 테스트 후 결과 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultFile = path.join(resultsDir, `test-results-${timestamp}.json`);
    
    fs.writeFileSync(resultFile, JSON.stringify({
      consoleErrors,
      networkErrors,
      url: page.url(),
      timestamp: new Date().toISOString()
    }, null, 2));
  });

  test('홈페이지 오류 검사', async () => {
    console.log('\n=== 홈페이지 테스트 시작 ===');
    
    await page.goto(siteUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // 페이지 완전 로딩 대기

    // 스크린샷 캡처
    await page.screenshot({ 
      path: path.join(resultsDir, 'homepage-screenshot.png'),
      fullPage: true 
    });

    // 기본 요소들이 로딩되었는지 확인
    await expect(page.locator('body')).toBeVisible();
    
    // 메인 네비게이션 체크
    const nav = page.locator('.main-nav, nav, .navbar');
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }

    // 메인 콘텐츠 영역 체크
    const mainContent = page.locator('main, .main-content, .container');
    if (await mainContent.count() > 0) {
      await expect(mainContent.first()).toBeVisible();
    }

    console.log(`홈페이지 콘솔 오류: ${consoleErrors.length}개`);
    console.log(`홈페이지 네트워크 오류: ${networkErrors.length}개`);
  });

  test('MBTI 테스트 페이지 오류 검사', async () => {
    console.log('\n=== MBTI 테스트 페이지 테스트 시작 ===');
    
    await page.goto(`${siteUrl}/tests/mbti/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: path.join(resultsDir, 'mbti-test-screenshot.png'),
      fullPage: true 
    });

    // MBTI 테스트 시작 버튼 확인
    const startButton = page.locator('button:has-text("테스트 시작"), .btn:has-text("시작"), a:has-text("테스트")');
    if (await startButton.count() > 0) {
      await expect(startButton.first()).toBeVisible();
      
      // 버튼 클릭 테스트
      try {
        await startButton.first().click();
        await page.waitForTimeout(2000);
        console.log('MBTI 테스트 시작 버튼 클릭 성공');
      } catch (error) {
        console.log('MBTI 테스트 시작 버튼 클릭 실패:', error.message);
      }
    }

    console.log(`MBTI 페이지 콘솔 오류: ${consoleErrors.length}개`);
    console.log(`MBTI 페이지 네트워크 오류: ${networkErrors.length}개`);
  });

  test('일일 운세 페이지 오류 검사', async () => {
    console.log('\n=== 일일 운세 페이지 테스트 시작 ===');
    
    await page.goto(`${siteUrl}/fortune/daily/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: path.join(resultsDir, 'daily-fortune-screenshot.png'),
      fullPage: true 
    });

    // 운세 관련 폼이나 버튼 확인
    const fortuneForm = page.locator('form, .fortune-form');
    const fortuneButton = page.locator('button:has-text("운세"), button:has-text("확인"), .btn');
    
    if (await fortuneForm.count() > 0) {
      await expect(fortuneForm.first()).toBeVisible();
      console.log('운세 폼 발견');
    }

    if (await fortuneButton.count() > 0) {
      await expect(fortuneButton.first()).toBeVisible();
      console.log('운세 버튼 발견');
      
      // 폼 데이터 입력 후 버튼 클릭 테스트
      try {
        const nameInput = page.locator('input[name="name"], input[type="text"]').first();
        if (await nameInput.count() > 0) {
          await nameInput.fill('테스트용자');
        }
        
        const birthInput = page.locator('input[name="birth"], input[type="date"]').first();
        if (await birthInput.count() > 0) {
          await birthInput.fill('1990-01-01');
        }

        await fortuneButton.first().click();
        await page.waitForTimeout(3000);
        console.log('일일 운세 API 호출 테스트 완료');
      } catch (error) {
        console.log('일일 운세 기능 테스트 실패:', error.message);
      }
    }

    console.log(`일일 운세 페이지 콘솔 오류: ${consoleErrors.length}개`);
    console.log(`일일 운세 페이지 네트워크 오류: ${networkErrors.length}개`);
  });

  test('BMI 계산기 페이지 오류 검사', async () => {
    console.log('\n=== BMI 계산기 페이지 테스트 시작 ===');
    
    await page.goto(`${siteUrl}/tools/bmi/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: path.join(resultsDir, 'bmi-calculator-screenshot.png'),
      fullPage: true 
    });

    // BMI 계산기 폼 테스트
    const heightInput = page.locator('input[name="height"], input[placeholder*="키"], input[placeholder*="height"]').first();
    const weightInput = page.locator('input[name="weight"], input[placeholder*="체중"], input[placeholder*="weight"]').first();
    const calculateButton = page.locator('button:has-text("계산"), button:has-text("BMI"), .btn');

    if (await heightInput.count() > 0 && await weightInput.count() > 0) {
      try {
        await heightInput.fill('170');
        await weightInput.fill('65');
        
        if (await calculateButton.count() > 0) {
          await calculateButton.first().click();
          await page.waitForTimeout(2000);
          console.log('BMI 계산 기능 테스트 완료');
        }
      } catch (error) {
        console.log('BMI 계산기 기능 테스트 실패:', error.message);
      }
    }

    console.log(`BMI 계산기 페이지 콘솔 오류: ${consoleErrors.length}개`);
    console.log(`BMI 계산기 페이지 네트워크 오류: ${networkErrors.length}개`);
  });

  test('타로 카드 페이지 오류 검사', async () => {
    console.log('\n=== 타로 카드 페이지 테스트 시작 ===');
    
    await page.goto(`${siteUrl}/fortune/tarot/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: path.join(resultsDir, 'tarot-card-screenshot.png'),
      fullPage: true 
    });

    // 타로 카드 관련 요소들 확인
    const tarotCards = page.locator('.card, .tarot-card, img[alt*="tarot"], img[alt*="타로"]');
    const tarotButton = page.locator('button:has-text("카드"), button:has-text("타로"), .btn');

    if (await tarotCards.count() > 0) {
      console.log(`타로 카드 이미지 발견: ${await tarotCards.count()}개`);
      
      // 첫 번째 카드 클릭 테스트
      try {
        await tarotCards.first().click();
        await page.waitForTimeout(2000);
        console.log('타로 카드 클릭 테스트 완료');
      } catch (error) {
        console.log('타로 카드 클릭 테스트 실패:', error.message);
      }
    }

    if (await tarotButton.count() > 0) {
      try {
        await tarotButton.first().click();
        await page.waitForTimeout(2000);
        console.log('타로 카드 버튼 클릭 테스트 완료');
      } catch (error) {
        console.log('타로 카드 버튼 클릭 테스트 실패:', error.message);
      }
    }

    console.log(`타로 카드 페이지 콘솔 오류: ${consoleErrors.length}개`);
    console.log(`타로 카드 페이지 네트워크 오류: ${networkErrors.length}개`);
  });

  test('모바일 메뉴 및 반응형 테스트', async () => {
    console.log('\n=== 모바일 메뉴 및 반응형 테스트 시작 ===');
    
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(siteUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: path.join(resultsDir, 'mobile-view-screenshot.png'),
      fullPage: true 
    });

    // 햄버거 메뉴 버튼 찾기 및 클릭 테스트
    const hamburgerMenu = page.locator('.hamburger, .menu-toggle, .mobile-menu-btn, [aria-label="menu"]');
    const mobileNav = page.locator('.mobile-nav, .mobile-menu, .nav-mobile');

    if (await hamburgerMenu.count() > 0) {
      try {
        await hamburgerMenu.first().click();
        await page.waitForTimeout(1000);
        
        if (await mobileNav.count() > 0) {
          await expect(mobileNav.first()).toBeVisible();
          console.log('모바일 메뉴 열기 성공');
          
          // 메뉴 닫기 테스트
          await hamburgerMenu.first().click();
          await page.waitForTimeout(1000);
          console.log('모바일 메뉴 닫기 성공');
        }
      } catch (error) {
        console.log('모바일 메뉴 테스트 실패:', error.message);
      }
    }

    // 데스크톱 뷰포트로 복원
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log(`모바일 테스트 콘솔 오류: ${consoleErrors.length}개`);
    console.log(`모바일 테스트 네트워크 오류: ${networkErrors.length}개`);
  });

  test('전체 사이트 링크 및 네비게이션 테스트', async () => {
    console.log('\n=== 전체 사이트 링크 테스트 시작 ===');
    
    await page.goto(siteUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 모든 링크 수집
    const links = await page.locator('a[href]').all();
    console.log(`총 ${links.length}개의 링크 발견`);

    const testedLinks = [];
    
    // 내부 링크만 필터링하고 테스트 (최대 10개)
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      try {
        const href = await links[i].getAttribute('href');
        if (href && (href.startsWith('/') || href.includes('doha.kr'))) {
          const linkText = await links[i].textContent();
          console.log(`링크 테스트: ${linkText} -> ${href}`);
          
          await links[i].click();
          await page.waitForTimeout(2000);
          
          const currentUrl = page.url();
          testedLinks.push({
            text: linkText?.trim(),
            href: href,
            currentUrl: currentUrl,
            success: !currentUrl.includes('404')
          });
          
          // 홈으로 다시 돌아가기
          await page.goto(siteUrl, { waitUntil: 'networkidle' });
          await page.waitForTimeout(1000);
        }
      } catch (error) {
        console.log(`링크 테스트 실패: ${error.message}`);
      }
    }

    // 링크 테스트 결과 저장
    fs.writeFileSync(
      path.join(resultsDir, 'link-test-results.json'),
      JSON.stringify(testedLinks, null, 2)
    );

    console.log(`링크 테스트 완료: ${testedLinks.length}개 테스트됨`);
    console.log(`전체 사이트 테스트 콘솔 오류: ${consoleErrors.length}개`);
    console.log(`전체 사이트 테스트 네트워크 오류: ${networkErrors.length}개`);
  });
});

// 최종 테스트 결과 요약 생성
test.afterAll(async () => {
  console.log('\n=== 최종 테스트 결과 요약 ===');
  console.log(`총 콘솔 오류: ${consoleErrors.length}개`);
  console.log(`총 네트워크 오류: ${networkErrors.length}개`);
  
  // 최종 요약 리포트 생성
  const finalReport = {
    summary: {
      totalConsoleErrors: consoleErrors.length,
      totalNetworkErrors: networkErrors.length,
      testCompletedAt: new Date().toISOString()
    },
    consoleErrors,
    networkErrors
  };
  
  fs.writeFileSync(
    path.join(resultsDir, 'final-error-report.json'),
    JSON.stringify(finalReport, null, 2)
  );
  
  console.log(`최종 리포트 저장: ${path.join(resultsDir, 'final-error-report.json')}`);
});