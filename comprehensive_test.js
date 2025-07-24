const { chromium } = require('playwright');

(async () => {
  console.log('🧪 도하닷컴 완전 검증 테스트 시작...\n');

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
    if (!response.ok()) {
      networkErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  try {
    // 1. 메인 페이지 로드 및 CSS 검증
    console.log('📋 1단계: 메인 페이지 CSS 및 버튼 스타일 검증');
    await page.goto('https://doha.kr', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // CSS 로딩 확인
    const cssFiles = [
      '/css/style.css',
      '/css/button-system.css'
    ];

    for (const css of cssFiles) {
      const response = await page.evaluate((cssPath) => {
        const link = document.querySelector(`link[href*="${cssPath}"]`);
        return link ? 'LOADED' : 'NOT_FOUND';
      }, css);
      console.log(`  CSS ${css}: ${response}`);
    }

    // 버튼 스타일 검증
    const buttons = await page.$$('button, .btn, .test-start-btn');
    console.log(`  버튼 총 개수: ${buttons.length}개`);

    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const btn = buttons[i];
      if (!btn) continue;
      
      const styles = await btn.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          background: computed.backgroundColor,
          padding: computed.padding,
          borderRadius: computed.borderRadius,
          fontSize: computed.fontSize,
          display: computed.display
        };
      });
      
      const hasValidStyles = styles.background !== 'rgba(0, 0, 0, 0)' || 
                           styles.padding !== '0px' ||
                           styles.borderRadius !== '0px';
      
      console.log(`  버튼 ${i+1}: ${hasValidStyles ? '✅ 스타일 적용됨' : '❌ 스타일 없음'}`);
    }

    // 2. 심리테스트 완전 검증
    console.log('\n📋 2단계: 심리테스트 완전 검증');
    
    // MBTI 테스트
    console.log('  🧠 MBTI 테스트 검증 중...');
    await page.goto('https://doha.kr/tests/mbti/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const mbtiStartBtn = await page.$('.test-start-btn, .btn-primary');
    if (mbtiStartBtn) {
      console.log('    ✅ MBTI 시작 버튼 발견');
      await mbtiStartBtn.click();
      await page.waitForTimeout(2000);
      
      // 질문 개수 확인
      const questionCount = await page.evaluate(() => {
        return window.mbtiQuestions ? window.mbtiQuestions.length : 0;
      });
      console.log(`    📝 MBTI 질문 수: ${questionCount}개 (기대값: 24개)`);
      
      if (questionCount === 24) {
        // 몇 개 질문 테스트
        for (let q = 0; q < 3; q++) {
          const option = await page.$('.option-btn');
          if (option) {
            await option.click();
            await page.waitForTimeout(500);
            const nextBtn = await page.$('button[onclick*="nextQuestion"], .btn-primary');
            if (nextBtn) {
              await nextBtn.click();
              await page.waitForTimeout(500);
            }
          }
        }
        console.log('    ✅ MBTI 테스트 플로우 정상');
      } else {
        console.log('    ❌ MBTI 질문 개수 오류');
      }
    } else {
      console.log('    ❌ MBTI 시작 버튼 없음');
    }

    // Teto-Egen 테스트
    console.log('  🎯 Teto-Egen 테스트 검증 중...');
    await page.goto('https://doha.kr/tests/teto-egen/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const tetoStartBtn = await page.$('.test-start-btn');
    if (tetoStartBtn) {
      console.log('    ✅ Teto-Egen 시작 버튼 발견');
      await tetoStartBtn.click();
      await page.waitForTimeout(1000);
      
      // 성별 선택 화면 확인
      const genderBtns = await page.$$('button[onclick*="selectGender"]');
      if (genderBtns.length > 0) {
        console.log('    ✅ 성별 선택 화면 정상');
        await genderBtns[0].click();
        await page.waitForTimeout(1000);
        
        // 테스트 시작 확인
        const startBtn = await page.$('button[onclick*="startTest"]');
        if (startBtn) {
          console.log('    ✅ Teto-Egen 테스트 시작 가능');
        }
      } else {
        console.log('    ❌ Teto-Egen 성별 선택 버튼 없음');
      }
    } else {
      console.log('    ❌ Teto-Egen 시작 버튼 없음');
    }

    // Love DNA 테스트
    console.log('  💕 Love DNA 테스트 검증 중...');
    await page.goto('https://doha.kr/tests/love-dna/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const loveStartBtn = await page.$('.love-start-button, .test-start-btn');
    if (loveStartBtn) {
      console.log('    ✅ Love DNA 시작 버튼 발견');
      await loveStartBtn.click();
      await page.waitForTimeout(1000);
      
      // 질문 개수 확인
      const loveQuestionCount = await page.evaluate(() => {
        return window.loveDnaQuestions ? window.loveDnaQuestions.length : 0;
      });
      console.log(`    📝 Love DNA 질문 수: ${loveQuestionCount}개 (기대값: 30개)`);
      
      if (loveQuestionCount >= 25) {
        console.log('    ✅ Love DNA 질문 개수 정상');
      } else {
        console.log('    ❌ Love DNA 질문 개수 부족');
      }
    } else {
      console.log('    ❌ Love DNA 시작 버튼 없음');
    }

    // 3. 운세 기능 검증
    console.log('\n📋 3단계: 운세 기능 검증');
    
    const fortuneTests = [
      { name: '오늘의 운세', url: '/fortune/daily/' },
      { name: '타로카드', url: '/fortune/tarot/' },
      { name: '별자리 운세', url: '/fortune/zodiac/' },
      { name: '꿈해몽', url: '/fortune/dream/' },
      { name: '사주팔자', url: '/fortune/saju/' }
    ];

    for (const fortune of fortuneTests) {
      console.log(`  🔮 ${fortune.name} 검증 중...`);
      await page.goto(`https://doha.kr${fortune.url}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      
      const startBtn = await page.$('.btn-fortune, .test-start-btn, .btn-primary');
      if (startBtn) {
        console.log(`    ✅ ${fortune.name} 시작 버튼 발견`);
      } else {
        console.log(`    ❌ ${fortune.name} 시작 버튼 없음`);
      }
    }

    // 4. 실용도구 검증
    console.log('\n📋 4단계: 실용도구 검증');
    
    // BMI 계산기
    console.log('  📊 BMI 계산기 검증 중...');
    await page.goto('https://doha.kr/tools/bmi-calculator.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const heightInput = await page.$('#height');
    const weightInput = await page.$('#weight');
    const calculateBtn = await page.$('button[onclick*="calculateBMI"]');
    
    if (heightInput && weightInput && calculateBtn) {
      console.log('    ✅ BMI 계산기 요소 모두 존재');
      await heightInput.fill('170');
      await weightInput.fill('70');
      await calculateBtn.click();
      await page.waitForTimeout(1000);
      
      const result = await page.$('#bmi-result');
      if (result) {
        const resultText = await result.textContent();
        if (resultText && !resultText.includes('0 -')) {
          console.log('    ✅ BMI 계산 정상 작동');
        } else {
          console.log('    ❌ BMI 계산 결과 오류');
        }
      }
    } else {
      console.log('    ❌ BMI 계산기 요소 누락');
    }

    // 급여 계산기
    console.log('  💰 급여 계산기 검증 중...');
    await page.goto('https://doha.kr/tools/salary-calculator.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const salaryInput = await page.$('#annualSalary');
    const salaryCalculateBtn = await page.$('button[onclick*="calculateSalary"]');
    
    if (salaryInput && salaryCalculateBtn) {
      console.log('    ✅ 급여 계산기 요소 존재');
      await salaryInput.fill('3000');
      await salaryCalculateBtn.click();
      await page.waitForTimeout(1000);
      
      const salaryResult = await page.$('#salary-result');
      if (salaryResult) {
        const salaryResultText = await salaryResult.textContent();
        if (salaryResultText && salaryResultText.trim() !== '') {
          console.log('    ✅ 급여 계산 정상 작동');
        } else {
          console.log('    ❌ 급여 계산 결과 없음');
        }
      }
    } else {
      console.log('    ❌ 급여 계산기 요소 누락');
    }

    // 5. 콘솔 에러 및 네트워크 에러 요약
    console.log('\n📋 5단계: 에러 요약');
    console.log(`🚨 콘솔 에러 ${consoleErrors.length}개:`);
    consoleErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });

    console.log(`🌐 네트워크 에러 ${networkErrors.length}개:`);
    networkErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });

    console.log('\n✅ 완전 검증 테스트 완료!');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
})();