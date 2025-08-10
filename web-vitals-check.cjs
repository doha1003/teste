/**
 * Core Web Vitals 및 실제 웹 성능 측정
 * Chrome DevTools Protocol을 사용하여 실제 성능 데이터 수집
 */

const { readFileSync } = require('fs');
const puppeteer = require('puppeteer');

const TEST_PAGES = [
  { name: 'Home', url: 'http://localhost:3000/' },
  { name: 'MBTI Test', url: 'http://localhost:3000/tests/mbti/' },
  { name: 'Love DNA Test', url: 'http://localhost:3000/tests/love-dna/' },
  { name: 'Daily Fortune', url: 'http://localhost:3000/fortune/daily/' },
  { name: 'BMI Calculator', url: 'http://localhost:3000/tools/bmi-calculator.html' }
];

// Core Web Vitals 임계값
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 600, poor: 1500 }
};

async function measureWebVitals(page, url) {
  console.log(`📊 Measuring Web Vitals for: ${url}`);
  
  // Performance API 주입
  await page.evaluateOnNewDocument(() => {
    window.webVitals = {};
    
    // CLS 측정
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      window.webVitals.cls = clsValue;
    }).observe({ type: 'layout-shift', buffered: true });
    
    // FCP, LCP 측정
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          window.webVitals.fcp = entry.startTime;
        }
      }
    }).observe({ type: 'paint', buffered: true });
    
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      window.webVitals.lcp = lastEntry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    
    // TTFB 측정
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      window.webVitals.ttfb = navigation.responseStart - navigation.requestStart;
    }
  });
  
  const startTime = Date.now();
  
  // 페이지 로드
  await page.goto(url, { 
    waitUntil: 'networkidle0',
    timeout: 30000 
  });
  
  const loadTime = Date.now() - startTime;
  
  // 2초 대기하여 CLS 안정화
  await page.waitForTimeout(2000);
  
  // Web Vitals 데이터 수집
  const vitals = await page.evaluate(() => window.webVitals || {});
  
  // 추가 성능 메트릭 수집
  const metrics = await page.metrics();
  const performanceEntries = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      loadComplete: navigation.loadEventEnd - navigation.navigationStart,
      firstByte: navigation.responseStart - navigation.navigationStart,
      domInteractive: navigation.domInteractive - navigation.navigationStart,
      resources: performance.getEntriesByType('resource').length
    };
  });
  
  return {
    url,
    loadTime,
    vitals: {
      lcp: vitals.lcp || 0,
      fcp: vitals.fcp || 0,
      cls: vitals.cls || 0,
      ttfb: vitals.ttfb || performanceEntries.firstByte
    },
    performance: {
      domContentLoaded: performanceEntries.domContentLoaded,
      loadComplete: performanceEntries.loadComplete,
      domInteractive: performanceEntries.domInteractive,
      resourceCount: performanceEntries.resources
    },
    memory: {
      jsHeapSizeLimit: metrics.JSHeapSizeLimit,
      jsHeapTotalSize: metrics.JSHeapTotalSize,
      jsHeapUsedSize: metrics.JSHeapUsedSize
    }
  };
}

async function checkAccessibility(page, url) {
  console.log(`♿ Running accessibility audit for: ${url}`);
  
  // 기본 접근성 검사
  const accessibilityIssues = await page.evaluate(() => {
    const issues = [];
    
    // 이미지 Alt 텍스트 검사
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push(`Image ${index + 1} missing alt text`);
      }
    });
    
    // 제목 구조 검사
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.push('No heading elements found');
    }
    
    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 0) {
      issues.push('No H1 element found');
    } else if (h1s.length > 1) {
      issues.push('Multiple H1 elements found');
    }
    
    // 링크 텍스트 검사
    const links = document.querySelectorAll('a');
    links.forEach((link, index) => {
      const text = link.textContent.trim();
      const ariaLabel = link.getAttribute('aria-label');
      if (!text && !ariaLabel) {
        issues.push(`Link ${index + 1} has no accessible text`);
      }
      if (text.toLowerCase().includes('click here') || text.toLowerCase().includes('read more')) {
        issues.push(`Link ${index + 1} has generic text: "${text}"`);
      }
    });
    
    // 폼 레이블 검사
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const id = input.id;
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (!label && !ariaLabel && !ariaLabelledBy) {
        issues.push(`Form input ${index + 1} has no associated label`);
      }
    });
    
    // 색상 대비 기본 검사 (간단한 검사)
    const elementsWithBackground = document.querySelectorAll('[style*="background"], [style*="color"]');
    if (elementsWithBackground.length > 10) {
      issues.push('Many elements with inline styles detected - check color contrast');
    }
    
    // Focus 관리 검사
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    let focusableCount = 0;
    interactiveElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex !== '-1') {
        focusableCount++;
      }
    });
    
    return {
      issues,
      stats: {
        totalImages: images.length,
        totalHeadings: headings.length,
        totalLinks: links.length,
        totalInputs: inputs.length,
        focusableElements: focusableCount
      }
    };
  });
  
  // 키보드 접근성 테스트
  await page.keyboard.press('Tab');
  const focusedElement = await page.evaluate(() => {
    const focused = document.activeElement;
    return focused ? {
      tagName: focused.tagName,
      hasVisibleFocus: window.getComputedStyle(focused).outline !== 'none'
    } : null;
  });
  
  if (!focusedElement) {
    accessibilityIssues.issues.push('No element receives keyboard focus');
  }
  
  return accessibilityIssues;
}

function evaluateWebVitals(vitals) {
  const results = {};
  
  for (const [metric, value] of Object.entries(vitals)) {
    const threshold = THRESHOLDS[metric.toUpperCase()];
    if (threshold) {
      if (value <= threshold.good) {
        results[metric] = 'Good';
      } else if (value <= threshold.poor) {
        results[metric] = 'Needs Improvement';
      } else {
        results[metric] = 'Poor';
      }
    } else {
      results[metric] = 'N/A';
    }
  }
  
  return results;
}

function generateReport(results) {
  console.log('\n📋 DETAILED PERFORMANCE & ACCESSIBILITY REPORT');
  console.log('===============================================\n');
  
  const summary = {
    totalPages: results.length,
    averageMetrics: {},
    overallGrade: 'A+',
    totalIssues: 0,
    recommendations: []
  };
  
  // 각 페이지 결과 출력
  results.forEach(result => {
    console.log(`🌐 ${result.name} (${result.data.url})`);
    console.log('─'.repeat(50));
    
    // Core Web Vitals
    const vitalEvals = evaluateWebVitals(result.data.vitals);
    console.log('📊 Core Web Vitals:');
    console.log(`   LCP: ${Math.round(result.data.vitals.lcp)}ms (${vitalEvals.lcp})`);
    console.log(`   FCP: ${Math.round(result.data.vitals.fcp)}ms (${vitalEvals.fcp})`);
    console.log(`   CLS: ${result.data.vitals.cls.toFixed(3)} (${vitalEvals.cls})`);
    console.log(`   TTFB: ${Math.round(result.data.vitals.ttfb)}ms (${vitalEvals.ttfb})`);
    
    // 성능 메트릭
    console.log('\n⚡ Performance:');
    console.log(`   DOM Content Loaded: ${Math.round(result.data.performance.domContentLoaded)}ms`);
    console.log(`   Load Complete: ${Math.round(result.data.performance.loadComplete)}ms`);
    console.log(`   Resources: ${result.data.performance.resourceCount}`);
    console.log(`   Memory Used: ${Math.round(result.data.memory.jsHeapUsedSize / 1024 / 1024)}MB`);
    
    // 접근성 결과
    console.log('\n♿ Accessibility:');
    if (result.accessibility.issues.length === 0) {
      console.log('   ✅ No accessibility issues found');
    } else {
      console.log(`   ❌ ${result.accessibility.issues.length} issues found:`);
      result.accessibility.issues.forEach(issue => {
        console.log(`      - ${issue}`);
      });
    }
    
    console.log(`   Stats: ${result.accessibility.stats.totalImages} images, ${result.accessibility.stats.totalLinks} links, ${result.accessibility.stats.focusableElements} focusable`);
    console.log('\n' + '='.repeat(50) + '\n');
    
    summary.totalIssues += result.accessibility.issues.length;
  });
  
  // 전체 평가 계산
  const avgLCP = results.reduce((sum, r) => sum + r.data.vitals.lcp, 0) / results.length;
  const avgFCP = results.reduce((sum, r) => sum + r.data.vitals.fcp, 0) / results.length;
  const avgCLS = results.reduce((sum, r) => sum + r.data.vitals.cls, 0) / results.length;
  const avgTTFB = results.reduce((sum, r) => sum + r.data.vitals.ttfb, 0) / results.length;
  
  summary.averageMetrics = { lcp: avgLCP, fcp: avgFCP, cls: avgCLS, ttfb: avgTTFB };
  
  // 등급 계산
  let gradePoints = 100;
  if (avgLCP > THRESHOLDS.LCP.good) gradePoints -= 10;
  if (avgFCP > THRESHOLDS.FCP.good) gradePoints -= 10;
  if (avgCLS > THRESHOLDS.CLS.good) gradePoints -= 10;
  if (avgTTFB > THRESHOLDS.TTFB.good) gradePoints -= 5;
  if (summary.totalIssues > 0) gradePoints -= (summary.totalIssues * 2);
  
  if (gradePoints >= 95) summary.overallGrade = 'A+';
  else if (gradePoints >= 90) summary.overallGrade = 'A';
  else if (gradePoints >= 85) summary.overallGrade = 'B+';
  else if (gradePoints >= 80) summary.overallGrade = 'B';
  else summary.overallGrade = 'C';
  
  // 최종 요약
  console.log('🎯 OVERALL SUMMARY');
  console.log('==================');
  console.log(`Grade: ${summary.overallGrade} (${gradePoints}/100)`);
  console.log(`Pages Tested: ${summary.totalPages}`);
  console.log(`Total Accessibility Issues: ${summary.totalIssues}`);
  console.log('\n📊 Average Core Web Vitals:');
  console.log(`   LCP: ${Math.round(avgLCP)}ms ${avgLCP <= THRESHOLDS.LCP.good ? '✅' : '⚠️'}`);
  console.log(`   FCP: ${Math.round(avgFCP)}ms ${avgFCP <= THRESHOLDS.FCP.good ? '✅' : '⚠️'}`);
  console.log(`   CLS: ${avgCLS.toFixed(3)} ${avgCLS <= THRESHOLDS.CLS.good ? '✅' : '⚠️'}`);
  console.log(`   TTFB: ${Math.round(avgTTFB)}ms ${avgTTFB <= THRESHOLDS.TTFB.good ? '✅' : '⚠️'}`);
  
  return summary;
}

async function main() {
  console.log('🚀 Starting Core Web Vitals & Accessibility Audit');
  console.log('==================================================');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  
  const results = [];
  
  try {
    for (const testPage of TEST_PAGES) {
      const page = await browser.newPage();
      
      // 모바일 화면으로 테스트
      await page.setViewport({ width: 375, height: 667 });
      
      try {
        const performanceData = await measureWebVitals(page, testPage.url);
        const accessibilityData = await checkAccessibility(page, testPage.url);
        
        results.push({
          name: testPage.name,
          data: performanceData,
          accessibility: accessibilityData
        });
        
      } catch (error) {
        console.error(`❌ Failed to test ${testPage.name}: ${error.message}`);
        results.push({
          name: testPage.name,
          error: error.message,
          data: { vitals: {}, performance: {}, memory: {} },
          accessibility: { issues: [`Test failed: ${error.message}`], stats: {} }
        });
      }
      
      await page.close();
    }
    
    const summary = generateReport(results);
    
    // 결과를 파일로 저장
    require('fs').writeFileSync(
      `web-vitals-report-${Date.now()}.json`,
      JSON.stringify({ summary, details: results }, null, 2)
    );
    
    console.log('\n💾 Detailed report saved to JSON file');
    console.log(`🎯 Final Grade: ${summary.overallGrade}`);
    
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  main().catch(console.error);
}