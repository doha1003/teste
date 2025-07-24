const { chromium } = require('playwright');

async function testFeature(page, name, steps) {
  console.log(`\n🔍 ${name} 테스트 중...`);
  try {
    for (const step of steps) {
      await step();
    }
    console.log(`✅ ${name} 성공`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} 실패: ${error.message}`);
    return false;
  }
}

(async () => {
  console.log('🧪 도하닷컴 수정된 선택자로 재테스트...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 에러 모니터링
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  try {
    // 1. Teto-Egen 테스트 (수정된 선택자)
    await testFeature(page, 'Teto-Egen 테스트', [
      async () => {
        await page.goto('https://doha.kr/tests/teto-egen/', { waitUntil: 'networkidle' });
        console.log('  - Teto-Egen 소개 페이지 로드');
      },
      async () => {
        const startBtn = await page.$('.test-start-btn');
        if (!startBtn) throw new Error('시작 버튼 없음');
        await startBtn.click();
        await page.waitForTimeout(2000);
      },
      async () => {
        await page.waitForFunction(() => window.location.pathname.includes('test.html'));
        const genderBtn = await page.$('button[onclick*="selectGender"]');
        if (!genderBtn) throw new Error('성별 선택 버튼 없음');
        await genderBtn.click();
        await page.waitForTimeout(1000);
      },
      async () => {
        const testStartBtn = await page.$('button[onclick*="startTest"]');
        if (!testStartBtn) throw new Error('테스트 시작 버튼 없음');
        await testStartBtn.click();
        await page.waitForTimeout(2000);
        
        // 수정된 선택자: .option-btn
        for (let i = 0; i < 2; i++) {
          const option = await page.$('.option-btn');
          if (!option) throw new Error(`질문 ${i+1} 옵션 없음`);
          await option.click();
          await page.waitForTimeout(1500);
        }
      }
    ]) ? results.passed++ : results.failed++;

    // 2. 오늘의 운세 (수정된 선택자)
    await testFeature(page, '오늘의 운세', [
      async () => {
        await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'networkidle' });
        console.log('  - 오늘의 운세 페이지 로드');
      },
      async () => {
        // 수정된 선택자: button[type="submit"]
        const startBtn = await page.$('button[type="submit"].btn.btn-primary');
        if (!startBtn) throw new Error('시작 버튼 없음');
        
        const btnStyles = await startBtn.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            background: styles.background,
            padding: styles.padding,
            color: styles.color
          };
        });
        console.log('  - 운세 버튼 CSS:', btnStyles);
        
        // 생년월일 입력
        await page.fill('#birthdate', '1990-01-01');
        await startBtn.click();
        await page.waitForTimeout(2000);
      }
    ]) ? results.passed++ : results.failed++;

    // 3. BMI 계산기 (수정된 선택자)
    await testFeature(page, 'BMI 계산기', [
      async () => {
        await page.goto('https://doha.kr/tools/bmi-calculator.html', { waitUntil: 'networkidle' });
        console.log('  - BMI 계산기 페이지 로드');
      },
      async () => {
        await page.fill('#height', '170');
        await page.fill('#weight', '70');
        const calcBtn = await page.$('#calculateBtn');
        if (!calcBtn) throw new Error('계산 버튼 없음');
        
        await calcBtn.click();
        await page.waitForTimeout(1000);
      },
      async () => {
        // 수정된 선택자: #bmiValue
        const result = await page.$('#bmiValue');
        if (!result) throw new Error('BMI 값 표시 영역 없음');
        
        const resultText = await result.textContent();
        if (!resultText || resultText === '0') {
          throw new Error('BMI 계산 결과 없음');
        }
        
        // 결과 섹션이 표시되는지 확인
        const resultSection = await page.$('#resultSection:not(.hidden)');
        if (!resultSection) throw new Error('결과 섹션이 표시되지 않음');
        
        console.log('  - BMI 계산 결과:', resultText);
      }
    ]) ? results.passed++ : results.failed++;

    // 4. 급여 계산기 (수정된 선택자)
    await testFeature(page, '급여 계산기', [
      async () => {
        await page.goto('https://doha.kr/tools/salary-calculator.html', { waitUntil: 'networkidle' });
        console.log('  - 급여 계산기 페이지 로드');
      },
      async () => {
        await page.fill('#annualSalary', '4000');
        const calcBtn = await page.$('.calculate-btn');
        if (!calcBtn) throw new Error('계산 버튼 없음');
        await calcBtn.click();
        await page.waitForTimeout(1000);
      },
      async () => {
        // 수정된 선택자: #resultContainer
        const resultContainer = await page.$('#resultContainer.show');
        if (!resultContainer) throw new Error('결과 컨테이너가 표시되지 않음');
        
        const monthlyNet = await page.$('#monthlyNet');
        if (!monthlyNet) throw new Error('월 실수령액 표시 영역 없음');
        
        const monthlyAmount = await monthlyNet.textContent();
        console.log('  - 월 실수령액:', monthlyAmount);
        
        const resultStyles = await resultContainer.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            display: styles.display,
            opacity: styles.opacity
          };
        });
        console.log('  - 결과 CSS:', resultStyles);
      }
    ]) ? results.passed++ : results.failed++;

    // 5. 각 테스트의 결과 페이지 CSS 확인
    await testFeature(page, 'MBTI 결과 페이지 CSS', [
      async () => {
        await page.goto('https://doha.kr/tests/mbti/test.html', { waitUntil: 'networkidle' });
        await page.$eval('.mbti-start-button', el => el.click());
        await page.waitForTimeout(1000);
        
        // 24개 질문 모두 답변 (빠르게)
        for (let i = 0; i < 24; i++) {
          const option = await page.$('.mbti-option');
          if (option) {
            await option.click();
            await page.waitForTimeout(500);
          }
        }
        
        // 결과 화면 대기
        await page.waitForTimeout(2000);
      },
      async () => {
        const resultCard = await page.$('.mbti-type-card');
        if (!resultCard) throw new Error('MBTI 결과 카드 없음');
        
        const cardStyles = await resultCard.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            background: styles.background,
            padding: styles.padding,
            borderRadius: styles.borderRadius
          };
        });
        
        console.log('  - MBTI 결과 카드 CSS:', cardStyles.background ? '적용됨' : '없음');
      }
    ]) ? results.passed++ : results.failed++;

    // 결과 요약
    console.log('\n' + '='.repeat(50));
    console.log('📊 수정된 테스트 결과');
    console.log('='.repeat(50));
    console.log(`✅ 성공: ${results.passed}개`);
    console.log(`❌ 실패: ${results.failed}개`);
    console.log(`🚨 콘솔 에러: ${errors.length}개`);
    
    if (results.failed > 0) {
      console.log('\n⚠️ 아직도 문제가 있습니다!');
    } else {
      console.log('\n🎉 모든 기능이 정상 작동합니다!');
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
})();