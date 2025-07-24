const { chromium } = require('playwright');

// 60초 대기 후 테스트 시작 (GitHub Pages 배포 대기)
console.log('⏳ GitHub Pages 배포 대기 중... (60초)');
setTimeout(async () => {
  console.log('🔍 라이브 사이트 수정사항 검증 시작...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newContext().then(context => context.newPage());

  try {
    // 1. MBTI 테스트 - 광고 간섭 해결 확인
    console.log('🧠 MBTI 테스트 검증');
    await page.goto('https://doha.kr/tests/mbti/test.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 시작 버튼 클릭
    const startBtn = await page.$('.mbti-start-button');
    if (startBtn) {
      await startBtn.click();
      await page.waitForTimeout(1500);
      
      // 첫 번째 옵션 클릭 시도
      const firstOption = await page.$('.mbti-option');
      if (firstOption) {
        await firstOption.click();
        console.log('  ✅ MBTI 테스트 버튼 클릭 가능 - 광고 간섭 해결됨');
      } else {
        console.log('  ❌ MBTI 옵션을 찾을 수 없음');
      }
    } else {
      console.log('  ❌ MBTI 시작 버튼을 찾을 수 없음');
    }
    
    // 2. 오늘의 운세 - 타임아웃 해결 확인
    console.log('\n🔮 오늘의 운세 검증');
    await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 연도 드롭다운 확인
    const yearSelect = await page.$('#birthYear');
    if (yearSelect) {
      const optionCount = await page.$$eval('#birthYear option', options => options.length);
      console.log(`  📅 연도 드롭다운 옵션 수: ${optionCount}개`);
      
      if (optionCount > 100) {
        console.log('  ✅ 연도 드롭다운 정상 초기화됨');
        
        // 폼 입력 테스트
        await page.selectOption('#birthYear', '1990');
        await page.selectOption('#birthMonth', '1');
        await page.selectOption('#birthDay', '1');
        await page.selectOption('#birthHour', '0');
        
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) {
          console.log('  ✅ 폼 입력 정상 작동');
        }
      } else {
        console.log('  ❌ 연도 드롭다운 초기화 실패');
      }
    } else {
      console.log('  ❌ 연도 드롭다운을 찾을 수 없음');
    }
    
    // 3. 실용도구 재확인
    console.log('\n💰 실용도구 재확인');
    
    // BMI 계산기
    await page.goto('https://doha.kr/tools/bmi-calculator.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.fill('#height', '170');
    await page.fill('#weight', '70');
    await page.click('#calculateBtn');
    await page.waitForTimeout(1000);
    
    const bmiValue = await page.$eval('#bmiValue', el => el.textContent).catch(() => '0');
    if (bmiValue !== '0') {
      console.log(`  ✅ BMI 계산기 정상: ${bmiValue}`);
    } else {
      console.log('  ❌ BMI 계산기 문제 있음');
    }
    
    console.log('\n✅ 검증 완료');
    
  } catch (error) {
    console.error('❌ 검증 오류:', error);
  } finally {
    await browser.close();
  }
}, 60000);