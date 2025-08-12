import puppeteer from 'puppeteer';
import fs from 'fs/promises';

// 26개 전체 페이지 목록
const pages = [
  // 홈
  { name: '홈페이지', url: 'https://doha.kr/' },
  
  // 심리테스트 (6개)
  { name: '심리테스트 메인', url: 'https://doha.kr/tests/' },
  { name: 'MBTI 소개', url: 'https://doha.kr/tests/mbti/' },
  { name: 'MBTI 테스트', url: 'https://doha.kr/tests/mbti/test.html' },
  { name: 'MBTI 결과', url: 'https://doha.kr/tests/mbti/result.html' },
  { name: 'Teto-Egen 소개', url: 'https://doha.kr/tests/teto-egen/' },
  { name: 'Teto-Egen 테스트', url: 'https://doha.kr/tests/teto-egen/test.html' },
  { name: 'Teto-Egen 결과', url: 'https://doha.kr/tests/teto-egen/result.html' },
  { name: 'Love DNA 소개', url: 'https://doha.kr/tests/love-dna/' },
  { name: 'Love DNA 테스트', url: 'https://doha.kr/tests/love-dna/test.html' },
  { name: 'Love DNA 결과', url: 'https://doha.kr/tests/love-dna/result.html' },
  
  // 운세 (6개)
  { name: '운세 메인', url: 'https://doha.kr/fortune/' },
  { name: '오늘의 운세', url: 'https://doha.kr/fortune/daily/' },
  { name: 'AI 사주팔자', url: 'https://doha.kr/fortune/saju/' },
  { name: 'AI 타로 리딩', url: 'https://doha.kr/fortune/tarot/' },
  { name: '별자리 운세', url: 'https://doha.kr/fortune/zodiac/' },
  { name: '띠별 운세', url: 'https://doha.kr/fortune/zodiac-animal/' },
  
  // 실용도구 (4개)
  { name: '실용도구 메인', url: 'https://doha.kr/tools/' },
  { name: 'BMI 계산기', url: 'https://doha.kr/tools/bmi/' },
  { name: '글자수 세기', url: 'https://doha.kr/tools/text-counter.html' },
  { name: '연봉계산기', url: 'https://doha.kr/tools/salary-calculator.html' },
  
  // 기타 (5개)
  { name: '소개 페이지', url: 'https://doha.kr/about.html' },
  { name: '문의하기', url: 'https://doha.kr/contact.html' },
  { name: 'FAQ', url: 'https://doha.kr/faq.html' },
  { name: '개인정보처리방침', url: 'https://doha.kr/privacy.html' },
  { name: '이용약관', url: 'https://doha.kr/terms.html' }
];

async function checkAllPages() {
  console.log('🔍 doha.kr 26개 페이지 완전 검사 시작...\n');
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox'] 
  });
  
  const results = [];
  
  for (let i = 0; i < pages.length; i++) {
    const pageInfo = pages[i];
    console.log(`[${i+1}/26] ${pageInfo.name} 검사 중...`);
    
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
      await page.goto(pageInfo.url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // 2초 대기
      await new Promise(r => setTimeout(r, 2000));
      
      // 페이지 상태 체크
      const pageState = await page.evaluate(() => {
        return {
          title: document.title,
          hasContent: document.body && document.body.innerText.length > 100,
          hasCSS: document.styleSheets.length > 0,
          hasJS: document.scripts.length > 0,
          fontFamily: window.getComputedStyle(document.body).fontFamily,
          isPretendard: window.getComputedStyle(document.body).fontFamily.includes('Pretendard'),
          hasKorean: /[가-힣]/.test(document.body.innerText),
          buttonsWork: document.querySelectorAll('button, .btn').length,
          formsWork: document.querySelectorAll('form').length,
          linksWork: document.querySelectorAll('a[href]').length,
          imagesLoaded: Array.from(document.images).filter(img => img.complete).length,
          imagesBroken: Array.from(document.images).filter(img => !img.complete).length
        };
      });
      
      // 상태 판정
      let status = '✅';
      let statusText = '정상';
      
      if (errors.length > 5) {
        status = '❌';
        statusText = '심각';
      } else if (errors.length > 0) {
        status = '⚠️';
        statusText = '경고';
      } else if (!pageState.hasContent) {
        status = '❌';
        statusText = '빈페이지';
      } else if (!pageState.isPretendard) {
        status = '⚠️';
        statusText = '폰트미적용';
      }
      
      console.log(`   ${status} ${statusText} - 오류: ${errors.length}개`);
      
      results.push({
        name: pageInfo.name,
        url: pageInfo.url,
        status: statusText,
        errors: errors.length,
        warnings: warnings.length,
        state: pageState
      });
      
    } catch (error) {
      console.log(`   ❌ 로드 실패: ${error.message}`);
      results.push({
        name: pageInfo.name,
        url: pageInfo.url,
        status: '실패',
        errors: 999,
        warnings: 0,
        error: error.message
      });
    }
    
    await page.close();
  }
  
  // 결과 저장
  await fs.writeFile(
    'all-pages-check-result.json',
    JSON.stringify(results, null, 2)
  );
  
  // 요약 출력
  console.log('\n' + '='.repeat(60));
  console.log('📊 26개 페이지 검사 완료');
  console.log('='.repeat(60));
  
  const normal = results.filter(r => r.status === '정상').length;
  const warning = results.filter(r => r.status === '경고' || r.status === '폰트미적용').length;
  const critical = results.filter(r => r.status === '심각' || r.status === '실패' || r.status === '빈페이지').length;
  
  console.log(`✅ 정상: ${normal}개`);
  console.log(`⚠️ 경고: ${warning}개`);
  console.log(`❌ 심각: ${critical}개`);
  
  // 문제 페이지 목록
  if (critical > 0) {
    console.log('\n❌ 심각한 문제가 있는 페이지:');
    results.filter(r => r.status === '심각' || r.status === '실패' || r.status === '빈페이지')
      .forEach(r => console.log(`   - ${r.name}: ${r.errors}개 오류`));
  }
  
  if (warning > 0) {
    console.log('\n⚠️ 경고가 있는 페이지:');
    results.filter(r => r.status === '경고' || r.status === '폰트미적용')
      .forEach(r => console.log(`   - ${r.name}: ${r.errors}개 오류`));
  }
  
  await browser.close();
  console.log('\n✅ 검사 완료. 결과: all-pages-check-result.json');
}

checkAllPages().catch(console.error);