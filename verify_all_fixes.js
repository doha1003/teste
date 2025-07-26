const { chromium } = require('playwright');

(async () => {
  // 🔍 모든 수정사항 최종 검증...

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newContext().then(context => context.newPage());

  const results = [];

  try {
    // 1. BMI 계산기 테스트
    // 📊 BMI 계산기 테스트
    await page.goto('https://doha.kr/tools/bmi-calculator.html');
    await page.waitForTimeout(2000);
    
    await page.fill('#height', '170');
    await page.fill('#weight', '70');
    await page.click('#calculateBtn');
    await page.waitForTimeout(1500);
    
    const bmiValue = await page.$eval('#bmiValue', el => el.textContent);
    const resultSection = await page.$eval('#resultSection', el => !el.classList.contains('hidden'));
    
    if (bmiValue && bmiValue !== '0' && resultSection) {
      // ✅ BMI 계산 성공
      results.push({ name: 'BMI 계산기', status: 'PASS' });
    } else {
      // ❌ BMI 계산 실패
      results.push({ name: 'BMI 계산기', status: 'FAIL' });
    }

    // 2. 급여 계산기 테스트
    // 💰 급여 계산기 테스트
    await page.goto('https://doha.kr/tools/salary-calculator.html');
    await page.waitForTimeout(2000);
    
    await page.fill('#annualSalary', '5000');
    await page.click('.calculate-btn');
    await page.waitForTimeout(1500);
    
    const hasResult = await page.$eval('#resultContainer', el => el.classList.contains('show'));
    const monthlyNet = await page.$eval('#monthlyNet', el => el.textContent).catch(() => null);
    
    if (hasResult && monthlyNet) {
      // ✅ 급여 계산 성공
      results.push({ name: '급여 계산기', status: 'PASS' });
    } else {
      // ❌ 급여 계산 실패
      results.push({ name: '급여 계산기', status: 'FAIL' });
    }

    // 3. MBTI 테스트 CSS 확인
    // 🧠 MBTI 테스트 CSS 확인
    await page.goto('https://doha.kr/tests/mbti/');
    await page.waitForTimeout(2000);
    
    const mbtiBtn = await page.$('.test-start-btn');
    if (mbtiBtn) {
      const btnStyles = await mbtiBtn.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          hasBackground: styles.background !== 'none' && styles.background !== '',
          hasPadding: styles.padding !== '0px',
          display: styles.display
        };
      });
      
      if (btnStyles.hasBackground && btnStyles.hasPadding) {
        // ✅ MBTI 버튼 CSS 적용됨
        results.push({ name: 'MBTI 버튼 CSS', status: 'PASS' });
      } else {
        // ❌ MBTI 버튼 CSS 누락
        results.push({ name: 'MBTI 버튼 CSS', status: 'FAIL' });
      }
    }

    // 4. Love DNA 테스트 CSS 확인
    // 💕 Love DNA 테스트 CSS 확인
    await page.goto('https://doha.kr/tests/love-dna/');
    await page.waitForTimeout(2000);
    
    const loveCta = await page.$('.love-cta');
    if (loveCta) {
      const ctaStyles = await loveCta.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          hasGradient: styles.background.includes('gradient'),
          hasBoxShadow: styles.boxShadow !== 'none'
        };
      });
      
      if (ctaStyles.hasGradient && ctaStyles.hasBoxShadow) {
        // ✅ Love DNA 버튼 CSS 적용됨
        results.push({ name: 'Love DNA 버튼 CSS', status: 'PASS' });
      } else {
        // ❌ Love DNA 버튼 CSS 누락
        results.push({ name: 'Love DNA 버튼 CSS', status: 'FAIL' });
      }
    }

    // 5. 오늘의 운세 폼 확인
    // 🔮 오늘의 운세 폼 확인
    await page.goto('https://doha.kr/fortune/daily/');
    await page.waitForTimeout(2000);
    
    await page.fill('#birthdate', '1990-01-01');
    const fortuneBtn = await page.$('button[type="submit"].btn.btn-primary');
    
    if (fortuneBtn) {
      const btnText = await fortuneBtn.textContent();
      // ✅ 운세 버튼 발견
      results.push({ name: '오늘의 운세 버튼', status: 'PASS' });
    } else {
      // ❌ 운세 버튼 없음
      results.push({ name: '오늘의 운세 버튼', status: 'FAIL' });
    }

    // 결과 요약
    // ===============================
    // 📊 최종 검증 결과
    // ===============================
    
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    
    results.forEach(r => {
      // 검증 결과 출력
    });
    
    // 테스트 결과 요약
    
    if (failed === 0) {
      // 🎉 모든 테스트 통과!
    } else {
      // ⚠️ 일부 테스트 실패 - 추가 수정 필요
    }

  } catch (error) {
    // ❌ 테스트 오류
  } finally {
    await browser.close();
  }
})();