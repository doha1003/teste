// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('성능 테스트', () => {
  test('메인 페이지 로딩 성능', async ({ page }) => {
    const metrics = {
      domContentLoaded: 0,
      load: 0,
      firstPaint: 0,
      firstContentfulPaint: 0
    };

    // 성능 측정 시작
    await page.goto('/', {
      waitUntil: 'networkidle'
    });

    // 성능 지표 수집
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        load: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      };
    });

    console.log('성능 지표:', performanceMetrics);
    
    // 성능 기준 확인
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(3000); // FCP < 3초
    expect(performanceMetrics.load).toBeLessThan(5000); // 전체 로드 < 5초
  });

  test('운세 페이지 만세력 API 성능', async ({ page }) => {
    await page.goto('/fortune/daily/');
    
    // API 호출 성능 측정
    const apiPerformance = await page.evaluate(async () => {
      const startTime = performance.now();
      const response = await fetch('https://doha-kr-ap.vercel.app/api/manseryeok?year=2024&month=1&day=15&hour=12');
      await response.json();
      const endTime = performance.now();
      
      return {
        responseTime: endTime - startTime,
        ok: response.ok
      };
    });
    
    console.log('API 응답 시간:', apiPerformance.responseTime + 'ms');
    
    expect(apiPerformance.ok).toBeTruthy();
    expect(apiPerformance.responseTime).toBeLessThan(1000); // API 응답 < 1초
  });

  test('리소스 로딩 확인', async ({ page }) => {
    const failedResources = [];
    
    page.on('requestfailed', request => {
      failedResources.push({
        url: request.url(),
        failure: request.failure()
      });
    });
    
    await page.goto('/fortune/saju/');
    await page.waitForLoadState('networkidle');
    
    // 실패한 리소스 확인
    if (failedResources.length > 0) {
      console.log('실패한 리소스:', failedResources);
    }
    
    expect(failedResources.length).toBe(0);
  });

  test('이미지 최적화 확인', async ({ page }) => {
    await page.goto('/');
    
    const images = await page.evaluate(() => {
      return Array.from(document.images).map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: img.clientWidth,
        displayHeight: img.clientHeight,
        loading: img.loading
      }));
    });
    
    // 이미지 최적화 확인
    for (const img of images) {
      // 표시 크기보다 지나치게 큰 이미지 확인
      if (img.displayWidth > 0) {
        const sizeRatio = img.naturalWidth / img.displayWidth;
        expect(sizeRatio).toBeLessThan(3); // 3배 이상 크지 않아야 함
      }
    }
  });

  test('CSS 번들 크기 확인', async ({ page }) => {
    const response = await page.goto('/');
    
    // CSS 파일 크기 확인
    const cssFiles = await page.evaluate(() => {
      return Array.from(document.styleSheets)
        .filter(sheet => sheet.href && sheet.href.includes('.css'))
        .map(sheet => sheet.href);
    });
    
    let totalCssSize = 0;
    
    for (const cssFile of cssFiles) {
      const response = await page.request.get(cssFile);
      const size = (await response.body()).length;
      totalCssSize += size;
      console.log(`CSS 파일: ${cssFile.split('/').pop()} - ${(size / 1024).toFixed(2)}KB`);
    }
    
    console.log(`총 CSS 크기: ${(totalCssSize / 1024).toFixed(2)}KB`);
    
    // CSS 총 크기가 200KB 미만인지 확인
    expect(totalCssSize).toBeLessThan(200 * 1024);
  });
});