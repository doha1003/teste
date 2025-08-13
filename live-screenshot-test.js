import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// 테스트할 모든 페이지 정의
const allPages = [
  // 메인 페이지들
  { url: '', name: '홈페이지', category: '메인' },
  { url: 'about', name: '소개 페이지', category: '메인' },
  { url: 'contact', name: '문의하기', category: '메인' },
  { url: 'offline', name: '오프라인 페이지', category: '메인' },
  { url: '404', name: '404 페이지', category: '메인' },
  
  // 심리테스트
  { url: 'tests', name: '심리테스트 메인', category: '심리테스트' },
  { url: 'tests/mbti', name: 'MBTI 소개', category: '심리테스트' },
  { url: 'tests/mbti/test', name: 'MBTI 테스트', category: '심리테스트' },
  { url: 'tests/mbti/result?type=ENFP', name: 'MBTI 결과', category: '심리테스트' },
  { url: 'tests/teto-egen', name: 'Teto-Egen 소개', category: '심리테스트' },
  { url: 'tests/teto-egen/test', name: 'Teto-Egen 테스트', category: '심리테스트' },
  { url: 'tests/love-dna', name: 'Love DNA 소개', category: '심리테스트' },
  { url: 'tests/love-dna/test', name: 'Love DNA 테스트', category: '심리테스트' },
  { url: 'tests/love-dna/result?result=compatible', name: 'Love DNA 결과', category: '심리테스트' },
  
  // 운세
  { url: 'fortune', name: '운세 메인', category: '운세' },
  { url: 'fortune/saju', name: 'AI 사주팔자', category: '운세' },
  { url: 'fortune/tarot', name: 'AI 타로 리딩', category: '운세' },
  { url: 'fortune/zodiac', name: '별자리 운세', category: '운세' },
  { url: 'fortune/twelve-zodiac', name: '띠별 운세', category: '운세' },
  
  // 실용도구
  { url: 'tools', name: '실용도구 메인', category: '실용도구' },
  { url: 'tools/text-counter', name: '글자수 세기', category: '실용도구' },
  { url: 'tools/bmi-calculator', name: 'BMI 계산기', category: '실용도구' },
  { url: 'tools/salary-calculator', name: '연봉 계산기', category: '실용도구' },
  
  // 테스트 페이지들 - 제거됨 (실제 배포되지 않음)
];

async function testAllPages() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'] 
  });
  
  console.log(`🚀 doha.kr 라이브 사이트 전체 테스트 시작 (${allPages.length}개 페이지)\n`);
  
  const results = [];
  const globalErrors = new Set();
  
  // 결과 저장 디렉토리 생성
  const screenshotDir = 'live-test-results';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  for (let i = 0; i < allPages.length; i++) {
    const pageData = allPages[i];
    const url = `https://doha.kr/${pageData.url}`;
    
    console.log(`[${i + 1}/${allPages.length}] 테스트 중: ${pageData.name}`);
    console.log(`URL: ${url}`);
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    const errors = [];
    const warnings = [];
    
    // 콘솔 메시지 수집
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        errors.push(text);
        globalErrors.add(text);
      } else if (msg.type() === 'warning') {
        warnings.push(text);
      }
    });
    
    // JavaScript 오류 수집
    page.on('pageerror', error => {
      const errorMsg = error.message;
      errors.push(errorMsg);
      globalErrors.add(errorMsg);
    });
    
    // 네트워크 오류 수집
    page.on('response', response => {
      if (response.status() >= 400) {
        const errorMsg = `Network Error: ${response.status()} - ${response.url()}`;
        errors.push(errorMsg);
        globalErrors.add(errorMsg);
      }
    });
    
    try {
      // 페이지 로드
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 15000
      });
      
      // 페이지 정보 수집
      const pageInfo = await page.evaluate(() => {
        const getComputedColor = (selector) => {
          const element = document.querySelector(selector);
          return element ? window.getComputedStyle(element).color : 'not found';
        };
        
        return {
          title: document.title,
          hasNavbar: !!document.querySelector('.navbar, nav, header, .header'),
          hasContent: document.body.innerText.length > 50,
          hasCSS: window.getComputedStyle(document.body).fontFamily.includes('Pretendard') || 
                  window.getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)',
          contentLength: document.body.innerText.length,
          hasMainContent: !!document.querySelector('main, .main, .content, .container'),
          hasFooter: !!document.querySelector('footer, .footer'),
          backgroundColor: window.getComputedStyle(document.body).backgroundColor,
          textColor: getComputedColor('body, p, .text, h1, h2, h3'),
          hasForm: !!document.querySelector('form'),
          hasButtons: !!document.querySelector('button, .btn'),
          metaDescription: document.querySelector('meta[name="description"]')?.content || 'missing',
          hasServiceWorker: 'serviceWorker' in navigator,
          isResponsive: !!document.querySelector('meta[name="viewport"]')
        };
      });
      
      // 스크린샷 저장
      const screenshotName = `${pageData.name.replace(/[/\\:*?"<>|]/g, '-')}.png`;
      const screenshotPath = path.join(screenshotDir, screenshotName);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true,
        type: 'png'
      });
      
      // 결과 저장
      const result = {
        name: pageData.name,
        category: pageData.category,
        url: url,
        status: 'success',
        errors: errors,
        warnings: warnings,
        pageInfo: pageInfo,
        screenshot: screenshotPath,
        timestamp: new Date().toISOString()
      };
      
      results.push(result);
      
      // 진행 상황 출력
      console.log(`✅ 완료 - 오류: ${errors.length}개, 제목: "${pageInfo.title}"`);
      
    } catch (error) {
      const result = {
        name: pageData.name,
        category: pageData.category,
        url: url,
        status: 'failed',
        errors: [...errors, error.message],
        warnings: warnings,
        pageInfo: null,
        screenshot: null,
        timestamp: new Date().toISOString()
      };
      
      results.push(result);
      console.log(`❌ 실패 - ${error.message}`);
    }
    
    await page.close();
    console.log('');
  }
  
  await browser.close();
  
  // 결과 분석 및 리포트 생성
  generateReport(results, globalErrors);
}

function generateReport(results, globalErrors) {
  console.log('📊 테스트 결과 분석\n');
  
  const totalPages = results.length;
  const successfulPages = results.filter(r => r.status === 'success').length;
  const failedPages = results.filter(r => r.status === 'failed').length;
  const pagesWithErrors = results.filter(r => r.errors.length > 0).length;
  
  console.log(`총 페이지: ${totalPages}`);
  console.log(`성공: ${successfulPages}개`);
  console.log(`실패: ${failedPages}개`);
  console.log(`오류 있는 페이지: ${pagesWithErrors}개\n`);
  
  // 카테고리별 결과
  const categories = [...new Set(results.map(r => r.category))];
  categories.forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    const categoryErrors = categoryResults.filter(r => r.errors.length > 0).length;
    console.log(`${category}: ${categoryResults.length}개 페이지, ${categoryErrors}개 오류`);
  });
  
  console.log('\n🚨 전체 오류 현황:');
  if (globalErrors.size === 0) {
    console.log('✅ 오류가 발견되지 않았습니다!');
  } else {
    console.log(`총 ${globalErrors.size}개의 고유 오류 발견:`);
    Array.from(globalErrors).slice(0, 20).forEach((error, index) => {
      console.log(`${index + 1}. ${error.substring(0, 100)}${error.length > 100 ? '...' : ''}`);
    });
    
    if (globalErrors.size > 20) {
      console.log(`... 그리고 ${globalErrors.size - 20}개 추가 오류`);
    }
  }
  
  // 상세 페이지별 결과
  console.log('\n📋 페이지별 상세 결과:');
  results.forEach((result, index) => {
    const statusIcon = result.status === 'success' ? '✅' : '❌';
    const errorCount = result.errors.length;
    const title = result.pageInfo?.title || 'No title';
    
    console.log(`${index + 1}. ${statusIcon} ${result.name}`);
    console.log(`   제목: ${title}`);
    console.log(`   오류: ${errorCount}개`);
    
    if (errorCount > 0) {
      result.errors.slice(0, 3).forEach(error => {
        console.log(`   - ${error.substring(0, 80)}${error.length > 80 ? '...' : ''}`);
      });
      if (errorCount > 3) {
        console.log(`   - ... 그리고 ${errorCount - 3}개 추가 오류`);
      }
    }
    console.log('');
  });
  
  // JSON 리포트 저장
  const reportPath = 'live-test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalPages,
      successfulPages,
      failedPages,
      pagesWithErrors,
      totalUniqueErrors: globalErrors.size
    },
    results: results,
    globalErrors: Array.from(globalErrors)
  }, null, 2));
  
  console.log(`📁 상세 리포트 저장됨: ${reportPath}`);
  console.log(`📸 스크린샷 저장 위치: live-test-results/`);
  console.log('\n🎯 다음 단계: 발견된 오류들을 하나씩 수정하세요.');
}

testAllPages().catch(console.error);