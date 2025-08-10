// 빠른 페이지 검증 스크립트
import puppeteer from 'puppeteer';
import fs from 'fs';

const testPages = [
  { name: '홈페이지', url: '/' },
  { name: 'MBTI 테스트', url: '/tests/mbti/test.html' },
  { name: '오늘의 운세', url: '/fortune/daily/' },
  { name: 'BMI 계산기', url: '/tools/bmi-calculator.html' },
  { name: '글자수 세기', url: '/tools/text-counter.html' }
];

async function quickTest() {
  console.log('🚀 빠른 페이지 검증 시작...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });
  
  const results = {
    total: testPages.length,
    success: 0,
    errors: 0,
    warnings: 0
  };
  
  for (const testPage of testPages) {
    const page = await browser.newPage();
    const errors = [];
    const warnings = [];
    
    // 콘솔 메시지 수집
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    // 페이지 에러 수집
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    try {
      console.log(`📄 ${testPage.name} 검증 중...`);
      
      await page.goto(`http://localhost:3000${testPage.url}`, {
        waitUntil: 'networkidle2',
        timeout: 10000
      });
      
      // CSS 로드 확인
      const cssLoaded = await page.evaluate(() => {
        const styles = document.querySelectorAll('link[rel="stylesheet"]');
        return styles.length > 0;
      });
      
      // JavaScript 에러 확인
      const jsErrors = errors.filter(e => e.includes('SyntaxError') || e.includes('ReferenceError'));
      
      if (jsErrors.length === 0 && cssLoaded) {
        console.log(`   ✅ 성공`);
        results.success++;
      } else if (jsErrors.length > 0) {
        console.log(`   ❌ 실패: ${jsErrors.length}개 JS 오류`);
        console.log(`      ${jsErrors[0]}`);
        results.errors++;
      } else {
        console.log(`   ⚠️ 경고: CSS 로드 문제`);
        results.warnings++;
      }
      
    } catch (error) {
      console.log(`   ❌ 실패: ${error.message}`);
      results.errors++;
    }
    
    await page.close();
  }
  
  await browser.close();
  
  // 결과 요약
  console.log('\n' + '='.repeat(40));
  console.log('📊 검증 결과 요약');
  console.log('='.repeat(40));
  console.log(`총 ${results.total}개 페이지 중:`);
  console.log(`✅ 성공: ${results.success}`);
  console.log(`❌ 오류: ${results.errors}`);
  console.log(`⚠️ 경고: ${results.warnings}`);
  
  const successRate = (results.success / results.total * 100).toFixed(1);
  console.log(`\n성공률: ${successRate}%`);
  
  if (successRate >= 80) {
    console.log('🎉 대부분의 페이지가 정상 작동합니다!');
  } else if (successRate >= 60) {
    console.log('⚠️ 일부 페이지에 문제가 있습니다.');
  } else {
    console.log('❌ 많은 페이지에 문제가 있습니다.');
  }
}

quickTest().catch(console.error);