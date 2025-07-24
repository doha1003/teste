const { chromium } = require('playwright');

(async () => {
  console.log('🔍 시각적 디버깅 테스트 시작...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newContext().then(context => context.newPage());

  try {
    // 1. BMI 계산기 디버깅
    console.log('📊 BMI 계산기 상세 디버깅');
    await page.goto('https://doha.kr/tools/bmi-calculator.html');
    await page.waitForTimeout(3000);
    
    // 입력 필드 확인
    const heightExists = await page.$('#height') !== null;
    const weightExists = await page.$('#weight') !== null;
    const btnExists = await page.$('#calculateBtn') !== null;
    
    console.log(`  - 키 입력 필드: ${heightExists ? '있음' : '없음'}`);
    console.log(`  - 몸무게 입력 필드: ${weightExists ? '있음' : '없음'}`);
    console.log(`  - 계산 버튼: ${btnExists ? '있음' : '없음'}`);
    
    if (heightExists && weightExists && btnExists) {
      // 값 입력
      await page.fill('#height', '170');
      await page.fill('#weight', '70');
      
      // 버튼 클릭 전 스크린샷
      await page.screenshot({ path: 'bmi_before_click.png' });
      console.log('  - 스크린샷 저장: bmi_before_click.png');
      
      // 버튼 클릭
      await page.click('#calculateBtn');
      await page.waitForTimeout(2000);
      
      // 버튼 클릭 후 스크린샷
      await page.screenshot({ path: 'bmi_after_click.png' });
      console.log('  - 스크린샷 저장: bmi_after_click.png');
      
      // 결과 확인
      const resultSection = await page.$('#resultSection');
      if (resultSection) {
        const isHidden = await resultSection.evaluate(el => el.classList.contains('hidden'));
        console.log(`  - 결과 섹션 상태: ${isHidden ? '숨김' : '표시'}`);
        
        const bmiValue = await page.$eval('#bmiValue', el => el.textContent).catch(() => 'NOT FOUND');
        console.log(`  - BMI 값: ${bmiValue}`);
      }
      
      // 콘솔 에러 확인
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(`${msg.type()}: ${msg.text()}`));
      
      // calculateBMI 함수 실행 테스트
      const funcExists = await page.evaluate(() => typeof calculateBMI === 'function');
      console.log(`  - calculateBMI 함수 존재: ${funcExists ? '예' : '아니오'}`);
      
      if (funcExists) {
        // 직접 함수 호출
        await page.evaluate(() => {
          document.getElementById('height').value = '170';
          document.getElementById('weight').value = '70';
          calculateBMI();
        });
        await page.waitForTimeout(1000);
        
        const afterDirectCall = await page.$eval('#bmiValue', el => el.textContent).catch(() => 'ERROR');
        console.log(`  - 직접 함수 호출 후 BMI 값: ${afterDirectCall}`);
      }
    }
    
    // 2. 급여 계산기 디버깅
    console.log('\n💰 급여 계산기 상세 디버깅');
    await page.goto('https://doha.kr/tools/salary-calculator.html');
    await page.waitForTimeout(3000);
    
    // 입력 필드 확인
    const salaryExists = await page.$('#annualSalary') !== null;
    const calcBtnExists = await page.$('.calculate-btn') !== null;
    
    console.log(`  - 연봉 입력 필드: ${salaryExists ? '있음' : '없음'}`);
    console.log(`  - 계산 버튼: ${calcBtnExists ? '있음' : '없음'}`);
    
    if (salaryExists && calcBtnExists) {
      await page.fill('#annualSalary', '5000');
      
      // 버튼 클릭 전 스크린샷
      await page.screenshot({ path: 'salary_before_click.png' });
      console.log('  - 스크린샷 저장: salary_before_click.png');
      
      // 버튼 클릭
      await page.click('.calculate-btn');
      await page.waitForTimeout(2000);
      
      // 버튼 클릭 후 스크린샷
      await page.screenshot({ path: 'salary_after_click.png' });
      console.log('  - 스크린샷 저장: salary_after_click.png');
      
      // 결과 확인
      const resultContainer = await page.$('#resultContainer');
      if (resultContainer) {
        const hasShow = await resultContainer.evaluate(el => el.classList.contains('show'));
        console.log(`  - 결과 컨테이너 show 클래스: ${hasShow ? '있음' : '없음'}`);
        
        const monthlyNet = await page.$eval('#monthlyNet', el => el.textContent).catch(() => 'NOT FOUND');
        console.log(`  - 월 실수령액: ${monthlyNet}`);
      }
    }
    
    console.log('\n✅ 디버깅 완료 - 스크린샷을 확인하세요');
    
  } catch (error) {
    console.error('❌ 디버깅 오류:', error);
  } finally {
    await browser.close();
  }
})();