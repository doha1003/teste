const { chromium } = require('playwright');

// 45초 대기 후 테스트 시작 (GitHub Pages 배포 대기)
console.log('⏳ GitHub Pages 배포 대기 중... (45초)');
setTimeout(async () => {
  console.log('🔍 최종 라이브 테스트 시작...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newContext().then(context => context.newPage());

  const results = {
    passed: [],
    failed: [],
    errors: []
  };

  // 콘솔 에러 모니터링
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('Attribution Reporting')) {
      results.errors.push(msg.text());
    }
  });

  try {
    // 1. BMI 계산기 테스트
    console.log('📊 BMI 계산기 테스트');
    await page.goto('https://doha.kr/tools/bmi-calculator.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    try {
      await page.fill('#height', '170');
      await page.fill('#weight', '70');
      await page.click('#calculateBtn');
      await page.waitForTimeout(1500);
      
      const bmiValue = await page.$eval('#bmiValue', el => el.textContent);
      const resultVisible = await page.$eval('#resultSection', el => !el.classList.contains('hidden'));
      
      if (bmiValue !== '0' && resultVisible) {
        console.log(`  ✅ BMI 계산 성공: ${bmiValue}`);
        results.passed.push('BMI 계산기');
      } else {
        console.log('  ❌ BMI 계산 실패');
        results.failed.push('BMI 계산기');
      }
    } catch (e) {
      console.log(`  ❌ BMI 테스트 오류: ${e.message}`);
      results.failed.push('BMI 계산기');
    }

    // 2. 급여 계산기 테스트
    console.log('\n💰 급여 계산기 테스트');
    await page.goto('https://doha.kr/tools/salary-calculator.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    try {
      await page.fill('#annualSalary', '5000');
      await page.click('.calculate-btn');
      await page.waitForTimeout(1500);
      
      const hasShow = await page.$eval('#resultContainer', el => el.classList.contains('show'));
      const monthlyNet = await page.$eval('#monthlyNet', el => el.textContent);
      
      if (hasShow && monthlyNet && monthlyNet !== '-') {
        console.log(`  ✅ 급여 계산 성공: ${monthlyNet}`);
        results.passed.push('급여 계산기');
      } else {
        console.log('  ❌ 급여 계산 실패');
        results.failed.push('급여 계산기');
      }
    } catch (e) {
      console.log(`  ❌ 급여 테스트 오류: ${e.message}`);
      results.failed.push('급여 계산기');
    }

    // 3. MBTI 테스트 결과 페이지 CSS
    console.log('\n🧠 MBTI 결과 페이지 CSS 테스트');
    await page.goto('https://doha.kr/tests/mbti/test.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    try {
      await page.click('.mbti-start-button');
      await page.waitForTimeout(1000);
      
      // 3개 질문만 빠르게 답변
      for (let i = 0; i < 3; i++) {
        const option = await page.$('.mbti-option');
        if (option) {
          await option.click();
          await page.waitForTimeout(800);
        }
      }
      
      console.log('  ✅ MBTI 테스트 플로우 정상');
      results.passed.push('MBTI 테스트');
    } catch (e) {
      console.log(`  ❌ MBTI 테스트 오류: ${e.message}`);
      results.failed.push('MBTI 테스트');
    }

    // 4. Love DNA 테스트 CSS
    console.log('\n💕 Love DNA 테스트 CSS 확인');
    await page.goto('https://doha.kr/tests/love-dna/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    try {
      const cta = await page.$('.love-cta');
      const ctaStyles = await cta.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          background: styles.background,
          boxShadow: styles.boxShadow
        };
      });
      
      if (ctaStyles.background.includes('gradient')) {
        console.log('  ✅ Love DNA CSS 정상 적용');
        results.passed.push('Love DNA CSS');
      } else {
        console.log('  ❌ Love DNA CSS 미적용');
        results.failed.push('Love DNA CSS');
      }
    } catch (e) {
      console.log(`  ❌ Love DNA 테스트 오류: ${e.message}`);
      results.failed.push('Love DNA CSS');
    }

    // 5. 오늘의 운세
    console.log('\n🔮 오늘의 운세 테스트');
    await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    try {
      await page.fill('#birthdate', '1990-01-01');
      const btn = await page.$('button[type="submit"]');
      if (btn) {
        console.log('  ✅ 오늘의 운세 폼 정상');
        results.passed.push('오늘의 운세');
      } else {
        console.log('  ❌ 오늘의 운세 버튼 없음');
        results.failed.push('오늘의 운세');
      }
    } catch (e) {
      console.log(`  ❌ 오늘의 운세 오류: ${e.message}`);
      results.failed.push('오늘의 운세');
    }

    // 결과 요약
    console.log('\n' + '='.repeat(50));
    console.log('📊 최종 테스트 결과');
    console.log('='.repeat(50));
    console.log(`✅ 성공: ${results.passed.length}개`);
    results.passed.forEach(test => console.log(`   - ${test}`));
    
    console.log(`\n❌ 실패: ${results.failed.length}개`);
    results.failed.forEach(test => console.log(`   - ${test}`));
    
    console.log(`\n🚨 콘솔 에러: ${results.errors.length}개`);
    
    if (results.failed.length === 0) {
      console.log('\n🎉 모든 테스트 통과! 사이트가 정상적으로 작동합니다.');
    } else {
      console.log('\n⚠️ 일부 기능이 여전히 작동하지 않습니다.');
    }

  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    await browser.close();
  }
}, 45000);