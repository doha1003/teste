import puppeteer from 'puppeteer';
import fs from 'fs/promises';

// 25개 전체 페이지 목록
const pages = [
  { name: '홈페이지', url: 'https://doha.kr/' },
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
  { name: '운세 메인', url: 'https://doha.kr/fortune/' },
  { name: '오늘의 운세', url: 'https://doha.kr/fortune/daily/' },
  { name: 'AI 사주팔자', url: 'https://doha.kr/fortune/saju/' },
  { name: 'AI 타로 리딩', url: 'https://doha.kr/fortune/tarot/' },
  { name: '별자리 운세', url: 'https://doha.kr/fortune/zodiac/' },
  { name: '띠별 운세', url: 'https://doha.kr/fortune/zodiac-animal/' },
  { name: '실용도구 메인', url: 'https://doha.kr/tools/' },
  { name: 'BMI 계산기', url: 'https://doha.kr/tools/bmi/' },
  { name: '글자수 세기', url: 'https://doha.kr/tools/text-counter.html' },
  { name: '연봉계산기', url: 'https://doha.kr/tools/salary-calculator.html' },
  { name: '소개 페이지', url: 'https://doha.kr/about.html' },
  { name: '문의하기', url: 'https://doha.kr/contact.html' },
  { name: 'FAQ', url: 'https://doha.kr/faq.html' },
  { name: '개인정보처리방침', url: 'https://doha.kr/privacy.html' },
  { name: '이용약관', url: 'https://doha.kr/terms.html' }
];

async function scanPageForErrors(browser, pageInfo, index) {
  const { name, url } = pageInfo;
  console.log(`\n[${index + 1}/26] 🔍 ${name} 검사 중...`);
  
  const page = await browser.newPage();
  const errors = {
    console: [],
    network: [],
    javascript: [],
    warnings: []
  };

  // 에러 수집 리스너 설정
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' && !text.includes('Lighthouse')) {
      errors.console.push({
        message: text,
        type: msg.type(),
        location: msg.location()
      });
    } else if (msg.type() === 'warning') {
      errors.warnings.push(text);
    }
  });

  page.on('pageerror', error => {
    errors.javascript.push({
      message: error.message,
      stack: error.stack
    });
  });

  page.on('response', response => {
    if (!response.ok() && response.status() !== 304) {
      errors.network.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  let result = {
    name,
    url,
    timestamp: new Date().toISOString(),
    success: false,
    errors,
    pageInfo: {},
    loadTime: 0
  };

  try {
    const startTime = Date.now();
    
    // 페이지 로드
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 15000
    });
    
    result.loadTime = Date.now() - startTime;
    
    // 2초 대기
    await new Promise(r => setTimeout(r, 2000));
    
    // 페이지 정보 수집
    result.pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        hasContent: document.body && document.body.innerText.length > 100,
        contentLength: document.body ? document.body.innerText.length : 0,
        hasCSS: document.styleSheets.length > 0,
        cssCount: document.styleSheets.length,
        hasJS: document.scripts.length > 0,
        jsCount: document.scripts.length,
        fontFamily: window.getComputedStyle(document.body).fontFamily,
        isPretendard: window.getComputedStyle(document.body).fontFamily.includes('Pretendard'),
        hasKorean: /[가-힣]/.test(document.body.innerText),
        buttonsCount: document.querySelectorAll('button, .btn').length,
        formsCount: document.querySelectorAll('form').length,
        linksCount: document.querySelectorAll('a[href]').length,
        imagesTotal: document.images.length,
        imagesLoaded: Array.from(document.images).filter(img => img.complete && img.naturalHeight !== 0).length,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    });

    result.success = true;
    
    // 상태 판정
    const totalErrors = errors.console.length + errors.network.length + errors.javascript.length;
    let status = '✅ 정상';
    
    if (totalErrors > 5) {
      status = '❌ 심각';
    } else if (totalErrors > 0) {
      status = '⚠️ 경고';
    } else if (!result.pageInfo.hasContent && !url.includes('result.html')) {
      status = '❌ 빈페이지';
    } else if (!result.pageInfo.isPretendard) {
      status = '⚠️ 폰트미적용';
    }

    console.log(`   ${status} - ${result.loadTime}ms - 오류: ${totalErrors}개`);
    console.log(`   콘솔: ${errors.console.length}, 네트워크: ${errors.network.length}, JS: ${errors.javascript.length}`);

  } catch (error) {
    console.log(`   ❌ 로드 실패: ${error.message}`);
    result.success = false;
    result.error = {
      message: error.message,
      stack: error.stack
    };
  }

  await page.close();
  return result;
}

async function runErrorScan() {
  console.log('🚀 doha.kr 26개 페이지 오류 스캔 시작...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const results = [];
  
  try {
    for (let i = 0; i < pages.length; i++) {
      const result = await scanPageForErrors(browser, pages[i], i);
      results.push(result);
      
      // 진행률 표시
      const progress = Math.round(((i + 1) / pages.length) * 100);
      console.log(`   📊 진행률: ${progress}%`);
    }

    // 결과 분석 및 저장
    await generateErrorReport(results);

  } finally {
    await browser.close();
  }
}

async function generateErrorReport(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // 통계 계산
  const stats = {
    total: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    withErrors: results.filter(r => {
      const total = r.errors.console.length + r.errors.network.length + r.errors.javascript.length;
      return total > 0;
    }).length,
    critical: results.filter(r => {
      const total = r.errors.console.length + r.errors.network.length + r.errors.javascript.length;
      return total > 5 || !r.success;
    }).length
  };

  // 에러별 분류
  const errorAnalysis = {
    consoleErrors: [],
    networkErrors: [],
    javascriptErrors: [],
    frequentErrors: {}
  };

  results.forEach(result => {
    // 콘솔 에러 수집
    result.errors.console.forEach(error => {
      errorAnalysis.consoleErrors.push({
        page: result.name,
        message: error.message,
        location: error.location
      });
    });

    // 네트워크 에러 수집
    result.errors.network.forEach(error => {
      errorAnalysis.networkErrors.push({
        page: result.name,
        url: error.url,
        status: error.status
      });
    });

    // JavaScript 에러 수집
    result.errors.javascript.forEach(error => {
      errorAnalysis.javascriptErrors.push({
        page: result.name,
        message: error.message
      });
      
      // 빈도수 계산
      const key = error.message.substring(0, 100);
      errorAnalysis.frequentErrors[key] = (errorAnalysis.frequentErrors[key] || 0) + 1;
    });
  });

  const report = {
    timestamp,
    stats,
    errorAnalysis,
    results
  };

  // JSON 보고서 저장
  const reportFile = `error-scan-report-${timestamp}.json`;
  await fs.writeFile(reportFile, JSON.stringify(report, null, 2));

  // 콘솔 요약 출력
  console.log('\n' + '='.repeat(80));
  console.log('📊 오류 스캔 완료');
  console.log('='.repeat(80));
  console.log(`📄 총 페이지: ${stats.total}개`);
  console.log(`✅ 성공: ${stats.successful}개`);
  console.log(`❌ 실패: ${stats.failed}개`);
  console.log(`⚠️ 오류 있음: ${stats.withErrors}개`);
  console.log(`🚨 심각한 문제: ${stats.critical}개`);

  // 가장 심각한 문제들
  const criticalPages = results.filter(r => {
    const total = r.errors.console.length + r.errors.network.length + r.errors.javascript.length;
    return total > 5 || !r.success;
  });

  if (criticalPages.length > 0) {
    console.log('\n🚨 즉시 수정 필요한 페이지:');
    criticalPages.forEach(page => {
      const total = page.errors.console.length + page.errors.network.length + page.errors.javascript.length;
      console.log(`   - ${page.name}: ${total}개 오류`);
    });
  }

  // 가장 빈번한 오류
  const frequentErrors = Object.entries(errorAnalysis.frequentErrors)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  if (frequentErrors.length > 0) {
    console.log('\n🔥 가장 빈번한 오류:');
    frequentErrors.forEach(([error, count]) => {
      console.log(`   - (${count}회) ${error}...`);
    });
  }

  // 네트워크 오류 요약
  if (errorAnalysis.networkErrors.length > 0) {
    console.log('\n🌐 네트워크 오류 요약:');
    const networkSummary = {};
    errorAnalysis.networkErrors.forEach(error => {
      const key = `${error.status} - ${error.url}`;
      networkSummary[key] = (networkSummary[key] || 0) + 1;
    });
    
    Object.entries(networkSummary)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([error, count]) => {
        console.log(`   - (${count}회) ${error}`);
      });
  }

  console.log(`\n📄 상세 보고서: ${reportFile}`);
  console.log('✅ 오류 스캔 완료!');

  return report;
}

// 실행
runErrorScan().catch(console.error);