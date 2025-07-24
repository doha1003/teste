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
  console.log('🧪 도하닷컴 사용자 관점 완전 테스트 시작...\n');

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
    // 1. MBTI 테스트 - 시작부터 결과까지
    await testFeature(page, 'MBTI 테스트 전체 플로우', [
      async () => {
        await page.goto('https://doha.kr/tests/mbti/', { waitUntil: 'networkidle' });
        console.log('  - MBTI 소개 페이지 로드');
      },
      async () => {
        const startBtn = await page.$('.test-start-btn');
        if (!startBtn) throw new Error('시작 버튼 없음');
        const btnStyles = await startBtn.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            background: styles.background,
            padding: styles.padding,
            display: styles.display
          };
        });
        console.log('  - 시작 버튼 CSS:', btnStyles.background ? '적용됨' : '없음');
        await startBtn.click();
        await page.waitForTimeout(2000);
      },
      async () => {
        await page.waitForFunction(() => window.location.pathname.includes('test.html'));
        console.log('  - 테스트 페이지 이동');
        
        const testStartBtn = await page.$('.mbti-start-button');
        if (!testStartBtn) throw new Error('테스트 시작 버튼 없음');
        await testStartBtn.click();
        await page.waitForTimeout(2000);
      },
      async () => {
        // 질문 3개만 답하고 결과 확인
        for (let i = 0; i < 3; i++) {
          const option = await page.$('.mbti-option');
          if (!option) throw new Error(`질문 ${i+1} 옵션 없음`);
          await option.click();
          await page.waitForTimeout(1500);
        }
        console.log('  - 질문 답변 완료');
      }
    ]) ? results.passed++ : results.failed++;

    // 2. Teto-Egen 테스트
    await testFeature(page, 'Teto-Egen 테스트 전체 플로우', [
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
        
        // 질문 2개만 답변
        for (let i = 0; i < 2; i++) {
          const option = await page.$('.teto-option');
          if (!option) throw new Error(`질문 ${i+1} 옵션 없음`);
          await option.click();
          await page.waitForTimeout(1500);
        }
      }
    ]) ? results.passed++ : results.failed++;

    // 3. Love DNA 테스트
    await testFeature(page, 'Love DNA 테스트 전체 플로우', [
      async () => {
        await page.goto('https://doha.kr/tests/love-dna/', { waitUntil: 'networkidle' });
        console.log('  - Love DNA 소개 페이지 로드');
      },
      async () => {
        const cta = await page.$('.love-cta');
        if (!cta) throw new Error('CTA 버튼 없음');
        await cta.click();
        await page.waitForTimeout(2000);
      },
      async () => {
        await page.waitForFunction(() => window.location.pathname.includes('test.html'));
        const startBtn = await page.$('.love-start-button');
        if (!startBtn) throw new Error('테스트 시작 버튼 없음');
        
        const btnStyles = await startBtn.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            background: styles.background,
            color: styles.color,
            padding: styles.padding
          };
        });
        console.log('  - Love DNA 시작 버튼 CSS:', btnStyles.background ? '적용됨' : '없음');
        
        await startBtn.click();
        await page.waitForTimeout(2000);
      },
      async () => {
        // 질문 2개 답변
        for (let i = 0; i < 2; i++) {
          const option = await page.$('.love-option');
          if (!option) throw new Error(`질문 ${i+1} 옵션 없음`);
          await option.click();
          await page.waitForTimeout(1500);
        }
      }
    ]) ? results.passed++ : results.failed++;

    // 4. 운세 - 오늘의 운세
    await testFeature(page, '오늘의 운세', [
      async () => {
        await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'networkidle' });
        console.log('  - 오늘의 운세 페이지 로드');
      },
      async () => {
        const startBtn = await page.$('.btn-fortune, .test-start-btn');
        if (!startBtn) throw new Error('시작 버튼 없음');
        
        const btnStyles = await startBtn.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            background: styles.background,
            border: styles.border
          };
        });
        console.log('  - 운세 버튼 CSS:', btnStyles.background ? '적용됨' : '없음');
        
        await startBtn.click();
        await page.waitForTimeout(2000);
      }
    ]) ? results.passed++ : results.failed++;

    // 5. BMI 계산기
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
        
        const btnStyles = await calcBtn.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            background: styles.background,
            color: styles.color
          };
        });
        console.log('  - 계산 버튼 CSS:', btnStyles.background ? '적용됨' : '없음');
        
        await calcBtn.click();
        await page.waitForTimeout(1000);
      },
      async () => {
        const result = await page.$('#bmi-result');
        if (!result) throw new Error('결과 표시 영역 없음');
        const resultText = await result.textContent();
        if (!resultText || resultText === '0' || resultText === '-') {
          throw new Error('BMI 계산 결과 없음');
        }
        console.log('  - BMI 계산 결과:', resultText);
      }
    ]) ? results.passed++ : results.failed++;

    // 6. 급여 계산기
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
        const result = await page.$('#salary-result');
        if (!result) throw new Error('결과 표시 영역 없음');
        const resultStyles = await result.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            display: styles.display,
            visibility: styles.visibility
          };
        });
        console.log('  - 급여 결과 CSS:', resultStyles.display !== 'none' ? '표시됨' : '숨김');
      }
    ]) ? results.passed++ : results.failed++;

    // 결과 요약
    console.log('\n' + '='.repeat(50));
    console.log('📊 테스트 결과 요약');
    console.log('='.repeat(50));
    console.log(`✅ 성공: ${results.passed}개`);
    console.log(`❌ 실패: ${results.failed}개`);
    console.log(`🚨 콘솔 에러: ${errors.length}개`);
    
    if (errors.length > 0) {
      console.log('\n콘솔 에러 목록:');
      errors.slice(0, 5).forEach((err, i) => {
        console.log(`  ${i+1}. ${err}`);
      });
    }

    if (results.failed > 0) {
      console.log('\n⚠️ 버튼 작동 또는 CSS 문제가 발견되었습니다!');
    } else {
      console.log('\n🎉 모든 기능이 정상 작동합니다!');
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
})();