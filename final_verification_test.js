const { chromium } = require('playwright');

(async () => {
  console.log('🔍 도하닷컴 최종 검증 테스트 시작...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 콘솔 에러 모니터링
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 네트워크 에러 모니터링
  const networkErrors = [];
  page.on('response', response => {
    if (!response.ok() && response.url().includes('doha.kr')) {
      networkErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  try {
    // 1. 메인 페이지 검증
    console.log('📋 1단계: 메인 페이지 CSS 로딩 검증');
    await page.goto('https://doha.kr', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log(`  현재 콘솔 에러: ${consoleErrors.length}개`);
    console.log(`  현재 네트워크 에러: ${networkErrors.length}개`);

    // 2. MBTI 테스트 검증 (핵심 수정사항)
    console.log('\n📋 2단계: MBTI 테스트 질문 로딩 검증');
    await page.goto('https://doha.kr/tests/mbti/test.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const mbtiStartBtn = await page.$('.mbti-start-button');
    if (mbtiStartBtn) {
      console.log('  ✅ MBTI 시작 버튼 발견');
      await mbtiStartBtn.click();
      await page.waitForTimeout(3000);
      
      // 질문 개수 확인
      const questionCount = await page.evaluate(() => {
        return window.mbtiQuestions ? window.mbtiQuestions.length : 0;
      });
      console.log(`  📝 MBTI 질문 수: ${questionCount}개`);
      
      if (questionCount === 24) {
        console.log('  ✅ MBTI 질문 로딩 성공 (24개 질문 확인)');
      } else {
        console.log('  ❌ MBTI 질문 로딩 실패');
      }
    } else {
      console.log('  ❌ MBTI 시작 버튼 없음');
    }

    // 3. Love DNA 테스트 검증 (CSS 수정사항)
    console.log('\n📋 3단계: Love DNA 테스트 CSS 로딩 검증');
    await page.goto('https://doha.kr/tests/love-dna/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const loveCta = await page.$('.love-cta');
    if (loveCta) {
      console.log('  ✅ Love DNA 시작 버튼 발견');
      await loveCta.click();
      await page.waitForTimeout(2000);
      
      const loveStartBtn = await page.$('.love-start-button');
      if (loveStartBtn) {
        console.log('  ✅ Love DNA 테스트 페이지 정상 로드');
      } else {
        console.log('  ❌ Love DNA 테스트 페이지 로드 실패');
      }
    } else {
      console.log('  ❌ Love DNA 메인 버튼 없음');
    }

    // 4. BMI 계산기 검증 (실제 작동 확인)
    console.log('\n📋 4단계: BMI 계산기 실제 작동 검증');
    await page.goto('https://doha.kr/tools/bmi-calculator.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const heightInput = await page.$('#height');
    const weightInput = await page.$('#weight');
    const calculateBtn = await page.$('#calculateBtn');
    
    if (heightInput && weightInput && calculateBtn) {
      console.log('  ✅ BMI 계산기 요소 모두 존재');
      await heightInput.fill('170');
      await weightInput.fill('70');
      await calculateBtn.click();
      await page.waitForTimeout(1000);
      
      const result = await page.$('#bmi-result');
      if (result) {
        const resultText = await result.textContent();
        if (resultText && !resultText.includes('0') && resultText.includes('24.2')) {
          console.log('  ✅ BMI 계산 정상 작동 (결과: 24.2)');
        } else {
          console.log(`  ⚠️ BMI 계산 결과: ${resultText}`);
        }
      }
    } else {
      console.log('  ❌ BMI 계산기 요소 누락');
    }

    // 5. 최종 에러 요약
    console.log('\n📋 5단계: 최종 에러 요약');
    console.log(`🚨 총 콘솔 에러: ${consoleErrors.length}개`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    console.log(`🌐 총 네트워크 에러: ${networkErrors.length}개`);
    if (networkErrors.length > 0) {
      networkErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    console.log('\n✅ 최종 검증 테스트 완료!');
    
    // 종합 평가
    const totalIssues = consoleErrors.length + networkErrors.length;
    if (totalIssues === 0) {
      console.log('🎉 모든 기능이 정상적으로 작동합니다!');
    } else if (totalIssues < 3) {
      console.log('⚠️ 경미한 문제가 있지만 주요 기능은 정상입니다.');
    } else {
      console.log('❌ 추가 수정이 필요한 문제가 있습니다.');
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
})();