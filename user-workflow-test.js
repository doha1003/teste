/**
 * 한국어 사용자 워크플로우 시나리오 테스트
 * doha.kr 주요 사용자 경험 플로우 검증
 */

import puppeteer from 'puppeteer';

const BASE_URL = 'https://doha.kr';

async function testWorkflow() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();

  try {
    console.log('🚀 한국어 사용자 워크플로우 테스트 시작\n');

    // 시나리오 1: 신규 방문자 운세 확인 플로우
    console.log('📊 시나리오 1: 신규 방문자 운세 확인 플로우');
    await page.goto(BASE_URL);
    await page.waitForSelector('h1', { timeout: 10000 });

    const title = await page.$eval('h1', (el) => el.textContent);
    console.log(`✅ 홈페이지 로드 완료: ${title}`);

    // 일일 운세 서비스로 이동
    await page.click('a[href="/fortune/daily/"]');
    await page.waitForSelector('h1', { timeout: 5000 });

    const fortuneTitle = await page.$eval('h1', (el) => el.textContent);
    console.log(`✅ 일일 운세 페이지 로드: ${fortuneTitle}`);

    // 사용자 정보 입력
    await page.type('#userName', '김테스트');
    await page.type('#birthDate', '1990-01-01');
    await page.type('#birthTime', '10:30');
    await page.select('#gender', 'male');
    await page.click('button[type="submit"]');

    // 운세 결과 대기
    await page.waitForSelector('.fortune-result', { timeout: 15000 });
    console.log('✅ 운세 결과 표시 완료');

    console.log('🎯 시나리오 1 완료\n');

    // 시나리오 2: MBTI 테스트 완주 플로우
    console.log('📊 시나리오 2: MBTI 테스트 완주 플로우');
    await page.goto(`${BASE_URL}/tests/mbti/`);
    await page.waitForSelector('h1', { timeout: 5000 });

    const mbtiTitle = await page.$eval('h1', (el) => el.textContent);
    console.log(`✅ MBTI 소개 페이지 로드: ${mbtiTitle}`);

    // 테스트 시작
    await page.click('a[href="test.html"]');
    await page.waitForSelector('.question-container', { timeout: 5000 });
    console.log('✅ MBTI 테스트 시작');

    // 10개 질문 자동 답변 (빠른 테스트를 위해)
    for (let i = 0; i < 10; i++) {
      await page.waitForSelector('.option-button:first-child', { timeout: 2000 });
      await page.click('.option-button:first-child');
      await page.waitForTimeout(500); // 애니메이션 대기
    }

    // 결과 페이지 대기
    await page.waitForSelector('.result-container', { timeout: 10000 });
    console.log('✅ MBTI 테스트 결과 표시 완료');

    console.log('🎯 시나리오 2 완료\n');

    // 시나리오 3: 급여 계산기 사용 플로우
    console.log('📊 시나리오 3: 급여 계산기 사용 플로우');
    await page.goto(`${BASE_URL}/tools/salary-calculator.html`);
    await page.waitForSelector('h1', { timeout: 5000 });

    const salaryTitle = await page.$eval('h1', (el) => el.textContent);
    console.log(`✅ 급여 계산기 페이지 로드: ${salaryTitle}`);

    // 급여 정보 입력
    await page.type('input[name="baseSalary"]', '3000000');
    await page.type('input[name="bonus"]', '500000');
    await page.select('select[name="dependents"]', '2');
    await page.click('button[type="submit"]');

    // 계산 결과 대기
    await page.waitForSelector('.calculation-result', { timeout: 5000 });
    console.log('✅ 급여 계산 결과 표시 완료');

    console.log('🎯 시나리오 3 완료\n');

    // 한국어 텍스트 렌더링 검증
    console.log('📊 한국어 텍스트 렌더링 검증');
    const koreanTexts = await page.evaluate(() => {
      const elements = document.querySelectorAll('h1, h2, h3, p, button, a');
      const texts = [];
      elements.forEach((el) => {
        const text = el.textContent.trim();
        if (text && /[가-힣]/.test(text)) {
          texts.push(text.substring(0, 30));
        }
      });
      return texts.slice(0, 10); // 처음 10개만
    });

    console.log('✅ 한국어 텍스트 샘플:', koreanTexts);

    // 테마 전환 기능 검증
    console.log('📊 테마 전환 기능 검증');
    const themeToggle = await page.$('.theme-toggle');
    if (themeToggle) {
      await page.click('.theme-toggle');
      await page.waitForTimeout(1000);
      console.log('✅ 다크모드 전환 완료');

      await page.click('.theme-toggle');
      await page.waitForTimeout(1000);
      console.log('✅ 라이트모드 전환 완료');
    } else {
      console.log('⚠️  테마 토글 버튼을 찾을 수 없음');
    }

    console.log('\n🎉 모든 워크플로우 테스트 완료!');
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);

    // 스크린샷 저장
    await page.screenshot({
      path: 'workflow-test-error.png',
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testWorkflow().catch(console.error);
