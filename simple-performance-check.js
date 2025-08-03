import puppeteer from 'puppeteer';

async function simplePerformanceCheck() {
  let browser;
  try {
    console.log('🚀 간단한 성능 체크 시작...');
    
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // 성능 메트릭 수집 시작
    await page.setCacheEnabled(false);
    
    const startTime = Date.now();
    
    // 페이지 로드
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    
    // 페이지 로드 완료 후 메트릭 수집
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        largestContentfulPaint: 0 // LCP는 별도 측정 필요
      };
    });
    
    // CSS 로딩 확인
    const cssLoaded = await page.evaluate(() => {
      const mainStyles = document.getElementById('main-styles');
      return mainStyles && mainStyles.sheet ? true : false;
    });
    
    // Critical CSS 적용 확인
    const criticalCSSApplied = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      return styles.fontFamily.includes('Pretendard') || styles.fontFamily.includes('apple-system');
    });
    
    console.log('\n📊 성능 체크 결과:');
    console.log('==================');
    console.log(`⏱️ 총 로딩 시간: ${loadTime}ms`);
    console.log(`🎭 First Paint: ${metrics.firstPaint.toFixed(0)}ms`);
    console.log(`🎯 First Contentful Paint: ${metrics.firstContentfulPaint.toFixed(0)}ms`);
    console.log(`📋 DOM Content Loaded: ${metrics.domContentLoaded.toFixed(0)}ms`);
    console.log(`✅ CSS 로딩 완료: ${cssLoaded ? 'YES' : 'NO'}`);
    console.log(`🎨 Critical CSS 적용: ${criticalCSSApplied ? 'YES' : 'NO'}`);
    
    // 성능 평가
    const performanceGrade = loadTime < 3000 ? 'EXCELLENT' : 
                            loadTime < 5000 ? 'GOOD' : 
                            loadTime < 8000 ? 'FAIR' : 'POOR';
    
    console.log('\n🎯 성능 평가:');
    console.log('=============');
    console.log(`📈 전체 등급: ${performanceGrade}`);
    console.log(`⚡ FCP 평가: ${metrics.firstContentfulPaint < 2000 ? 'GOOD' : 'NEEDS IMPROVEMENT'}`);
    
    // Phase 3 목표 평가
    const phase3Success = loadTime < 5000 && metrics.firstContentfulPaint < 3000 && criticalCSSApplied;
    
    console.log('\n🎯 Phase 3 목표 달성:');
    console.log('===================');
    console.log(`✅ 성능 개선 성공: ${phase3Success ? 'YES' : 'NO'}`);
    console.log(`📋 로딩 속도 개선: ${loadTime < 5000 ? 'YES' : 'NO'} (${loadTime}ms < 5000ms)`);
    console.log(`🎨 Critical CSS 적용: ${criticalCSSApplied ? 'YES' : 'NO'}`);
    
    return {
      loadTime,
      metrics,
      cssLoaded,
      criticalCSSApplied,
      performanceGrade,
      phase3Success
    };
    
  } catch (error) {
    console.error('성능 체크 실패:', error.message);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

simplePerformanceCheck();