import puppeteer from 'puppeteer';
import fs from 'fs/promises';

async function checkLiveErrors() {
  console.log('🔍 doha.kr 라이브 사이트 오류 검사 시작...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // GUI 모드로 실행
    devtools: true,  // 개발자 도구 자동 열기
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {
    timestamp: new Date().toISOString(),
    pages: [],
    summary: {
      totalErrors: 0,
      totalWarnings: 0,
      total404s: 0,
      totalCorsErrors: 0,
      totalTypeErrors: 0
    }
  };

  const pagesToTest = [
    { name: '홈페이지', url: 'https://doha.kr' },
    { name: 'MBTI 테스트', url: 'https://doha.kr/tests/mbti/' },
    { name: '일일 운세', url: 'https://doha.kr/fortune/daily/' },
    { name: 'BMI 계산기', url: 'https://doha.kr/tools/bmi/' },
    { name: '타로 카드', url: 'https://doha.kr/fortune/tarot/' },
    { name: '사주팔자', url: 'https://doha.kr/fortune/saju/' },
    { name: '별자리 운세', url: 'https://doha.kr/fortune/zodiac/' }
  ];

  for (const pageInfo of pagesToTest) {
    console.log(`\n📄 ${pageInfo.name} 테스트 중...`);
    console.log(`   URL: ${pageInfo.url}`);
    
    const page = await browser.newPage();
    const pageResult = {
      name: pageInfo.name,
      url: pageInfo.url,
      consoleErrors: [],
      networkErrors: [],
      pageErrors: []
    };

    // 콘솔 메시지 수집
    page.on('console', message => {
      const type = message.type();
      const text = message.text();
      
      if (type === 'error') {
        console.log(`   ❌ 콘솔 오류: ${text.substring(0, 100)}...`);
        pageResult.consoleErrors.push({
          type: 'error',
          text: text,
          location: message.location()
        });
        results.summary.totalErrors++;
        
        if (text.includes('CORS')) results.summary.totalCorsErrors++;
        if (text.includes('TypeError') || text.includes('ReferenceError')) results.summary.totalTypeErrors++;
      } else if (type === 'warning') {
        console.log(`   ⚠️  경고: ${text.substring(0, 100)}...`);
        pageResult.consoleErrors.push({
          type: 'warning',
          text: text
        });
        results.summary.totalWarnings++;
      }
    });

    // 페이지 오류 수집
    page.on('pageerror', error => {
      console.log(`   💥 페이지 오류: ${error.message.substring(0, 100)}...`);
      pageResult.pageErrors.push(error.message);
      results.summary.totalErrors++;
    });

    // 네트워크 오류 수집
    page.on('response', response => {
      if (response.status() >= 400) {
        const url = response.url();
        console.log(`   🔴 ${response.status()} 오류: ${url.substring(0, 80)}...`);
        pageResult.networkErrors.push({
          status: response.status(),
          url: url,
          statusText: response.statusText()
        });
        if (response.status() === 404) results.summary.total404s++;
      }
    });

    // 요청 실패 수집
    page.on('requestfailed', request => {
      console.log(`   ⛔ 요청 실패: ${request.url().substring(0, 80)}...`);
      pageResult.networkErrors.push({
        status: 'failed',
        url: request.url(),
        error: request.failure()?.errorText
      });
    });

    try {
      // 페이지 로드
      await page.goto(pageInfo.url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // 추가 대기 (동적 콘텐츠 로딩)
      await page.waitForTimeout(3000);

      // 페이지에서 직접 오류 확인
      const jsErrors = await page.evaluate(() => {
        const errors = [];
        
        // window.onerror로 잡힌 오류 확인
        if (window.__errors) {
          errors.push(...window.__errors);
        }
        
        // Promise rejection 확인
        if (window.__unhandledRejections) {
          errors.push(...window.__unhandledRejections);
        }
        
        return errors;
      });

      if (jsErrors.length > 0) {
        pageResult.consoleErrors.push(...jsErrors);
      }

      // 스크린샷 저장
      await page.screenshot({
        path: `live-test-${pageInfo.name.replace(/\s+/g, '-')}.png`,
        fullPage: true
      });

    } catch (error) {
      console.log(`   ⚠️  페이지 로드 오류: ${error.message}`);
      pageResult.pageErrors.push(`Load error: ${error.message}`);
    }

    results.pages.push(pageResult);
    await page.close();
  }

  // 결과 저장
  await fs.writeFile(
    'live-site-errors.json',
    JSON.stringify(results, null, 2)
  );

  // 요약 출력
  console.log('\n' + '='.repeat(60));
  console.log('📊 오류 검사 요약');
  console.log('='.repeat(60));
  console.log(`총 콘솔 오류: ${results.summary.totalErrors}개`);
  console.log(`총 경고: ${results.summary.totalWarnings}개`);
  console.log(`404 오류: ${results.summary.total404s}개`);
  console.log(`CORS 오류: ${results.summary.totalCorsErrors}개`);
  console.log(`Type 오류: ${results.summary.totalTypeErrors}개`);
  console.log('\n✅ 결과가 live-site-errors.json에 저장되었습니다.');
  console.log('📸 스크린샷이 저장되었습니다.');

  // 브라우저는 열어둠 (수동 확인용)
  console.log('\n브라우저를 수동으로 확인하려면 그대로 두세요.');
  console.log('종료하려면 Ctrl+C를 누르세요.');
}

checkLiveErrors().catch(console.error);