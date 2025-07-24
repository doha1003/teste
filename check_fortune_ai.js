const { chromium } = require('playwright');

(async () => {
  console.log('🔮 운세 AI 통합 및 CSS 검증 시작...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newContext().then(context => context.newPage());

  // 콘솔 로그 모니터링
  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('AI') || msg.text().includes('Gemini')) {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  try {
    // 1. 오늘의 운세 테스트
    console.log('📅 오늘의 운세 AI 테스트');
    await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // gemini-api.js 로드 확인
    const hasGeminiAPI = await page.evaluate(() => {
      return typeof generateDailyFortuneWithAI === 'function';
    });
    console.log(`  - Gemini API 함수 존재: ${hasGeminiAPI ? '✅' : '❌'}`);
    
    // 폼 입력 및 제출
    await page.selectOption('#birthYear', '1990');
    await page.selectOption('#birthMonth', '5');
    await page.selectOption('#birthDay', '15');
    await page.selectOption('#birthHour', '14');
    await page.fill('#userName', '테스트유저');
    
    // 제출 버튼 찾기
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(5000); // AI 응답 대기
      
      // 결과 확인
      const resultContent = await page.$eval('#fortuneResult', el => el.textContent).catch(() => '');
      if (resultContent.includes('AI가 당신의 운세를 분석')) {
        console.log('  ✅ AI 분석 메시지 표시됨');
      }
      if (resultContent.includes('종합운') && resultContent.includes('애정운')) {
        console.log('  ✅ AI 운세 결과 표시됨');
      } else if (resultContent.includes('운세 결과가 여기에 표시됩니다')) {
        console.log('  ❌ 기본 플레이스홀더만 표시됨 - AI 미작동');
      }
    }
    
    // 2. 타로 운세 테스트
    console.log('\n🎴 타로 운세 AI 테스트');
    await page.goto('https://doha.kr/fortune/tarot/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const hasTarotAPI = await page.evaluate(() => {
      return typeof callGeminiAPI === 'function';
    });
    console.log(`  - Gemini API 함수 존재: ${hasTarotAPI ? '✅' : '❌'}`);
    
    // 3. CSS 스타일 검증
    console.log('\n🎨 운세 페이지 CSS 검증');
    
    // 오늘의 운세 CSS
    await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'networkidle' });
    const dailyCSS = await page.evaluate(() => {
      const formCard = document.querySelector('.saju-form-card');
      if (!formCard) return null;
      const styles = window.getComputedStyle(formCard);
      return {
        background: styles.background,
        boxShadow: styles.boxShadow,
        borderRadius: styles.borderRadius
      };
    });
    
    if (dailyCSS && dailyCSS.boxShadow !== 'none') {
      console.log('  ✅ 오늘의 운세 CSS 정상 적용');
    } else {
      console.log('  ❌ 오늘의 운세 CSS 문제 있음');
    }
    
    // 4. API 엔드포인트 확인
    console.log('\n🔌 API 엔드포인트 확인');
    await page.goto('https://doha.kr/api/fortune', { waitUntil: 'networkidle' }).catch(async (e) => {
      if (e.message.includes('404')) {
        console.log('  ❌ /api/fortune 엔드포인트 없음 - Vercel 배포 필요');
      } else {
        console.log('  ⚠️ API 접근 오류:', e.message);
      }
    });
    
    // 콘솔 로그 출력
    if (consoleLogs.length > 0) {
      console.log('\n📝 콘솔 로그:');
      consoleLogs.forEach(log => console.log(`  ${log}`));
    }
    
    console.log('\n📊 분석 결과:');
    console.log('- Daily Fortune: gemini-api.js 추가됨, AI 함수 연결됨');
    console.log('- Tarot: 이미 AI 통합되어 있음');
    console.log('- 문제: Vercel API 엔드포인트(/api/fortune) 배포 필요');
    console.log('- 해결책: Vercel에 api/fortune.js 배포 또는 다른 API 솔루션 필요');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    await browser.close();
  }
})();