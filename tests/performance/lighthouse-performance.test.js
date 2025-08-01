/**
 * Lighthouse 성능 테스트
 * Core Web Vitals 및 전반적인 웹 성능을 측정합니다.
 */

import { test, expect } from '@playwright/test';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

// 성능 기준치 설정
const PERFORMANCE_THRESHOLDS = {
  // Lighthouse 점수 (0-100)
  performance: 90,
  accessibility: 95,
  bestPractices: 90,
  seo: 100,
  pwa: 85,
  
  // Core Web Vitals
  lcp: 2500,    // Largest Contentful Paint (ms)
  fid: 100,     // First Input Delay (ms)
  cls: 0.1,     // Cumulative Layout Shift
  fcp: 1800,    // First Contentful Paint (ms)
  si: 3400,     // Speed Index (ms)
  tti: 3800,    // Time to Interactive (ms)
  
  // 기타 성능 메트릭
  totalBlockingTime: 300,  // Total Blocking Time (ms)
  maxPotentialFid: 130,    // Max Potential First Input Delay (ms)
  
  // 리소스 크기 제한
  totalByteWeight: 1600000, // 1.6MB
  unusedCssRatio: 0.2,      // 20% 이하
  unusedJsRatio: 0.2,       // 20% 이하
};

const TEST_URLS = [
  '/',
  '/tests/mbti/',
  '/tests/love-dna/',
  '/fortune/daily/',
  '/fortune/saju/',
  '/tools/bmi-calculator.html',
  '/tools/salary-calculator.html'
];

async function runLighthouseAudit(url, options = {}) {
  const chrome = await launch({
    chromeFlags: [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions'
    ]
  });

  const lighthouseOptions = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    port: chrome.port,
    disableStorageReset: false,
    ...options
  };

  const config = {
    extends: 'lighthouse:default',
    settings: {
      formFactor: options.mobile ? 'mobile' : 'desktop',
      throttling: options.mobile ? {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 150,
        downloadThroughputKbps: 1638.4,
        uploadThroughputKbps: 675
      } : {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      },
      screenEmulation: options.mobile ? {
        mobile: true,
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        disabled: false
      } : {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false
      }
    }
  };

  try {
    const runnerResult = await lighthouse(url, lighthouseOptions, config);
    await chrome.kill();
    return runnerResult;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

function analyzePerformanceMetrics(lhr) {
  const { audits, categories } = lhr;
  
  return {
    // Lighthouse 점수
    scores: {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
      pwa: categories.pwa ? Math.round(categories.pwa.score * 100) : null
    },
    
    // Core Web Vitals
    vitals: {
      lcp: audits['largest-contentful-paint']?.numericValue || 0,
      fid: audits['max-potential-fid']?.numericValue || 0,
      cls: audits['cumulative-layout-shift']?.numericValue || 0,
      fcp: audits['first-contentful-paint']?.numericValue || 0,
      si: audits['speed-index']?.numericValue || 0,
      tti: audits['interactive']?.numericValue || 0,
      tbt: audits['total-blocking-time']?.numericValue || 0
    },
    
    // 리소스 분석
    resources: {
      totalByteWeight: audits['total-byte-weight']?.numericValue || 0,
      unusedCssBytes: audits['unused-css-rules']?.details?.overallSavingsBytes || 0,
      unusedJsBytes: audits['unused-javascript']?.details?.overallSavingsBytes || 0,
      imageOptimization: audits['uses-optimized-images']?.details?.overallSavingsBytes || 0,
      textCompression: audits['uses-text-compression']?.details?.overallSavingsBytes || 0
    },
    
    // 기회 개선사항
    opportunities: Object.keys(audits)
      .filter(key => audits[key].score !== null && audits[key].score < 1)
      .map(key => ({
        audit: key,
        title: audits[key].title,
        score: audits[key].score,
        numericValue: audits[key].numericValue,
        displayValue: audits[key].displayValue,
        description: audits[key].description
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 10) // 상위 10개 개선사항
  };
}

test.describe('Lighthouse 성능 테스트', () => {
  test.setTimeout(120000); // 2분 타임아웃

  for (const url of TEST_URLS) {
    test(`데스크톱 성능 측정: ${url}`, async ({ page }) => {
      const fullUrl = `http://localhost:3000${url}`;
      
      console.log(`Running Lighthouse audit for: ${fullUrl}`);
      
      const result = await runLighthouseAudit(fullUrl, { mobile: false });
      const metrics = analyzePerformanceMetrics(result.lhr);
      
      console.log(`Performance metrics for ${url}:`, {
        scores: metrics.scores,
        vitals: metrics.vitals
      });
      
      // Lighthouse 점수 검증
      expect(metrics.scores.performance).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.performance);
      expect(metrics.scores.accessibility).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.accessibility);
      expect(metrics.scores.bestPractices).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.bestPractices);
      expect(metrics.scores.seo).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.seo);
      
      if (metrics.scores.pwa !== null) {
        expect(metrics.scores.pwa).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.pwa);
      }
      
      // Core Web Vitals 검증
      expect(metrics.vitals.lcp).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.lcp);
      expect(metrics.vitals.fcp).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.fcp);
      expect(metrics.vitals.cls).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.cls);
      expect(metrics.vitals.si).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.si);
      expect(metrics.vitals.tti).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.tti);
      expect(metrics.vitals.tbt).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.totalBlockingTime);
      
      // 리소스 크기 검증
      expect(metrics.resources.totalByteWeight).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.totalByteWeight);
      
      // 개선사항이 있다면 로그로 출력
      if (metrics.opportunities.length > 0) {\n        console.log(`Improvement opportunities for ${url}:`);\n        metrics.opportunities.forEach(opportunity => {\n          console.log(`- ${opportunity.title}: ${opportunity.displayValue || 'N/A'}`);\n        });\n      }\n    });\n\n    test(`모바일 성능 측정: ${url}`, async ({ page }) => {\n      const fullUrl = `http://localhost:3000${url}`;\n      \n      console.log(`Running mobile Lighthouse audit for: ${fullUrl}`);\n      \n      const result = await runLighthouseAudit(fullUrl, { mobile: true });\n      const metrics = analyzePerformanceMetrics(result.lhr);\n      \n      console.log(`Mobile performance metrics for ${url}:`, {\n        scores: metrics.scores,\n        vitals: metrics.vitals\n      });\n      \n      // 모바일에서는 약간 낮은 기준 적용\n      const mobileThresholds = {\n        ...PERFORMANCE_THRESHOLDS,\n        performance: 85, // 모바일에서는 85점 이상\n        lcp: 3000,       // 3초 이하\n        fcp: 2200,       // 2.2초 이하\n        si: 4000,        // 4초 이하\n        tti: 4500        // 4.5초 이하\n      };\n      \n      expect(metrics.scores.performance).toBeGreaterThanOrEqual(mobileThresholds.performance);\n      expect(metrics.scores.accessibility).toBeGreaterThanOrEqual(mobileThresholds.accessibility);\n      expect(metrics.scores.bestPractices).toBeGreaterThanOrEqual(mobileThresholds.bestPractices);\n      expect(metrics.scores.seo).toBeGreaterThanOrEqual(mobileThresholds.seo);\n      \n      expect(metrics.vitals.lcp).toBeLessThanOrEqual(mobileThresholds.lcp);\n      expect(metrics.vitals.fcp).toBeLessThanOrEqual(mobileThresholds.fcp);\n      expect(metrics.vitals.cls).toBeLessThanOrEqual(mobileThresholds.cls);\n      expect(metrics.vitals.si).toBeLessThanOrEqual(mobileThresholds.si);\n      expect(metrics.vitals.tti).toBeLessThanOrEqual(mobileThresholds.tti);\n    });\n  }\n\n  test('전체 사이트 성능 요약 및 분석', async ({ page }) => {\n    const performanceResults = [];\n    \n    for (const url of TEST_URLS) {\n      const fullUrl = `http://localhost:3000${url}`;\n      \n      try {\n        const result = await runLighthouseAudit(fullUrl, { mobile: false });\n        const metrics = analyzePerformanceMetrics(result.lhr);\n        \n        performanceResults.push({\n          url,\n          ...metrics\n        });\n      } catch (error) {\n        console.error(`Failed to audit ${url}:`, error.message);\n      }\n    }\n    \n    // 평균 성능 점수 계산\n    const averageScores = {\n      performance: performanceResults.reduce((sum, r) => sum + r.scores.performance, 0) / performanceResults.length,\n      accessibility: performanceResults.reduce((sum, r) => sum + r.scores.accessibility, 0) / performanceResults.length,\n      bestPractices: performanceResults.reduce((sum, r) => sum + r.scores.bestPractices, 0) / performanceResults.length,\n      seo: performanceResults.reduce((sum, r) => sum + r.scores.seo, 0) / performanceResults.length\n    };\n    \n    console.log('전체 사이트 평균 성능 점수:', averageScores);\n    \n    // 전체 평균이 기준을 만족하는지 확인\n    expect(averageScores.performance).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.performance);\n    expect(averageScores.accessibility).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.accessibility);\n    expect(averageScores.bestPractices).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.bestPractices);\n    expect(averageScores.seo).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.seo);\n    \n    // 가장 느린 페이지와 빠른 페이지 식별\n    const sortedByPerformance = performanceResults.sort((a, b) => b.scores.performance - a.scores.performance);\n    const fastestPage = sortedByPerformance[0];\n    const slowestPage = sortedByPerformance[sortedByPerformance.length - 1];\n    \n    console.log(`가장 빠른 페이지: ${fastestPage.url} (${fastestPage.scores.performance}점)`);\n    console.log(`가장 느린 페이지: ${slowestPage.url} (${slowestPage.scores.performance}점)`);\n    \n    // 공통 개선사항 분석\n    const allOpportunities = performanceResults.flatMap(r => r.opportunities);\n    const opportunityCount = {};\n    \n    allOpportunities.forEach(opp => {\n      opportunityCount[opp.audit] = (opportunityCount[opp.audit] || 0) + 1;\n    });\n    \n    const commonIssues = Object.entries(opportunityCount)\n      .filter(([, count]) => count >= performanceResults.length * 0.5) // 50% 이상의 페이지에서 발견\n      .sort(([, a], [, b]) => b - a)\n      .slice(0, 5);\n    \n    if (commonIssues.length > 0) {\n      console.log('공통 개선사항 (50% 이상 페이지에서 발견):');\n      commonIssues.forEach(([audit, count]) => {\n        const example = allOpportunities.find(opp => opp.audit === audit);\n        console.log(`- ${example.title} (${count}/${performanceResults.length} 페이지)`);\n      });\n    }\n    \n    // 성능 리포트 생성\n    const performanceReport = {\n      timestamp: new Date().toISOString(),\n      averageScores,\n      fastestPage: {\n        url: fastestPage.url,\n        score: fastestPage.scores.performance,\n        lcp: fastestPage.vitals.lcp\n      },\n      slowestPage: {\n        url: slowestPage.url,\n        score: slowestPage.scores.performance,\n        lcp: slowestPage.vitals.lcp\n      },\n      commonIssues: commonIssues.map(([audit, count]) => ({\n        audit,\n        frequency: count,\n        percentage: Math.round(count / performanceResults.length * 100)\n      }))\n    };\n    \n    // 리포트를 파일로 저장 (선택사항)\n    console.log('Performance Report:', JSON.stringify(performanceReport, null, 2));\n  });\n\n  test('Critical Resource Hints 검증', async ({ page }) => {\n    await page.goto('http://localhost:3000/');\n    \n    // Preload 힌트 확인\n    const preloadLinks = page.locator('link[rel=\"preload\"]');\n    const preloadCount = await preloadLinks.count();\n    \n    if (preloadCount > 0) {\n      console.log(`Found ${preloadCount} preload hints`);\n      \n      for (let i = 0; i < preloadCount; i++) {\n        const link = preloadLinks.nth(i);\n        const href = await link.getAttribute('href');\n        const as = await link.getAttribute('as');\n        \n        expect(href).toBeTruthy();\n        expect(as).toBeTruthy();\n        \n        console.log(`Preload: ${href} (as: ${as})`);\n      }\n    }\n    \n    // DNS prefetch 힌트 확인\n    const dnsPrefetchLinks = page.locator('link[rel=\"dns-prefetch\"]');\n    const dnsPrefetchCount = await dnsPrefetchLinks.count();\n    \n    if (dnsPrefetchCount > 0) {\n      console.log(`Found ${dnsPrefetchCount} DNS prefetch hints`);\n    }\n    \n    // Preconnect 힌트 확인\n    const preconnectLinks = page.locator('link[rel=\"preconnect\"]');\n    const preconnectCount = await preconnectLinks.count();\n    \n    if (preconnectCount > 0) {\n      console.log(`Found ${preconnectCount} preconnect hints`);\n    }\n  });\n\n  test('이미지 최적화 검증', async ({ page }) => {\n    await page.goto('http://localhost:3000/');\n    \n    // 모든 이미지 요소 찾기\n    const images = page.locator('img');\n    const imageCount = await images.count();\n    \n    console.log(`Found ${imageCount} images`);\n    \n    let webpCount = 0;\n    let lazyLoadCount = 0;\n    let altMissingCount = 0;\n    \n    for (let i = 0; i < imageCount; i++) {\n      const img = images.nth(i);\n      const src = await img.getAttribute('src');\n      const loading = await img.getAttribute('loading');\n      const alt = await img.getAttribute('alt');\n      \n      // WebP 형식 확인\n      if (src && src.includes('.webp')) {\n        webpCount++;\n      }\n      \n      // Lazy loading 확인\n      if (loading === 'lazy') {\n        lazyLoadCount++;\n      }\n      \n      // Alt 텍스트 확인\n      if (!alt) {\n        altMissingCount++;\n      }\n    }\n    \n    console.log(`WebP images: ${webpCount}/${imageCount}`);\n    console.log(`Lazy loaded images: ${lazyLoadCount}/${imageCount}`);\n    console.log(`Images missing alt text: ${altMissingCount}/${imageCount}`);\n    \n    // 이미지 최적화 기준 검증\n    if (imageCount > 0) {\n      // 최소 50%의 이미지가 lazy loading을 사용해야 함\n      expect(lazyLoadCount / imageCount).toBeGreaterThan(0.5);\n      \n      // Alt 텍스트 누락은 10% 이하여야 함\n      expect(altMissingCount / imageCount).toBeLessThan(0.1);\n    }\n  });\n\n  test('JavaScript 번들 크기 분석', async ({ page }) => {\n    const jsRequests = [];\n    const cssRequests = [];\n    \n    // 네트워크 요청 모니터링\n    page.on('response', response => {\n      const url = response.url();\n      const contentType = response.headers()['content-type'] || '';\n      \n      if (contentType.includes('javascript') || url.endsWith('.js')) {\n        jsRequests.push({\n          url,\n          size: parseInt(response.headers()['content-length'] || '0'),\n          status: response.status()\n        });\n      } else if (contentType.includes('css') || url.endsWith('.css')) {\n        cssRequests.push({\n          url,\n          size: parseInt(response.headers()['content-length'] || '0'),\n          status: response.status()\n        });\n      }\n    });\n    \n    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });\n    \n    // JavaScript 번들 분석\n    const totalJSSize = jsRequests.reduce((sum, req) => sum + req.size, 0);\n    const totalCSSSize = cssRequests.reduce((sum, req) => sum + req.size, 0);\n    \n    console.log(`Total JavaScript size: ${Math.round(totalJSSize / 1024)} KB`);\n    console.log(`Total CSS size: ${Math.round(totalCSSSize / 1024)} KB`);\n    \n    // 번들 크기 제한 검증\n    expect(totalJSSize).toBeLessThan(300 * 1024); // 300KB 이하\n    expect(totalCSSSize).toBeLessThan(100 * 1024); // 100KB 이하\n    \n    // 개별 파일 크기 확인\n    jsRequests.forEach(req => {\n      if (req.size > 100 * 1024) { // 100KB 초과\n        console.warn(`Large JS file detected: ${req.url} (${Math.round(req.size / 1024)} KB)`);\n      }\n    });\n    \n    cssRequests.forEach(req => {\n      if (req.size > 50 * 1024) { // 50KB 초과\n        console.warn(`Large CSS file detected: ${req.url} (${Math.round(req.size / 1024)} KB)`);\n      }\n    });\n  });\n\n  test('캐싱 헤더 검증', async ({ page }) => {\n    const cachingHeaders = [];\n    \n    page.on('response', response => {\n      const url = response.url();\n      const headers = response.headers();\n      \n      // 정적 리소스만 확인\n      if (url.match(/\\.(js|css|png|jpg|jpeg|gif|webp|svg|woff|woff2)$/)) {\n        cachingHeaders.push({\n          url,\n          cacheControl: headers['cache-control'],\n          expires: headers['expires'],\n          etag: headers['etag'],\n          lastModified: headers['last-modified']\n        });\n      }\n    });\n    \n    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });\n    \n    console.log(`Checked caching headers for ${cachingHeaders.length} static resources`);\n    \n    let properCachingCount = 0;\n    \n    cachingHeaders.forEach(resource => {\n      const hasProperCaching = \n        resource.cacheControl || \n        resource.expires || \n        resource.etag || \n        resource.lastModified;\n      \n      if (hasProperCaching) {\n        properCachingCount++;\n      } else {\n        console.warn(`Resource without caching headers: ${resource.url}`);\n      }\n    });\n    \n    // 최소 80%의 정적 리소스가 적절한 캐싱 헤더를 가져야 함\n    if (cachingHeaders.length > 0) {\n      const cachingRatio = properCachingCount / cachingHeaders.length;\n      expect(cachingRatio).toBeGreaterThan(0.8);\n      \n      console.log(`Resources with proper caching: ${properCachingCount}/${cachingHeaders.length} (${Math.round(cachingRatio * 100)}%)`);\n    }\n  });\n\n  test('제3자 스크립트 영향 분석', async ({ page }) => {\n    const thirdPartyRequests = [];\n    const firstPartyRequests = [];\n    \n    page.on('response', response => {\n      const url = response.url();\n      const contentType = response.headers()['content-type'] || '';\n      \n      if (contentType.includes('javascript')) {\n        const isThirdParty = !url.includes('localhost') && !url.includes('doha.kr');\n        \n        const requestInfo = {\n          url,\n          size: parseInt(response.headers()['content-length'] || '0'),\n          isThirdParty\n        };\n        \n        if (isThirdParty) {\n          thirdPartyRequests.push(requestInfo);\n        } else {\n          firstPartyRequests.push(requestInfo);\n        }\n      }\n    });\n    \n    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });\n    \n    const thirdPartySize = thirdPartyRequests.reduce((sum, req) => sum + req.size, 0);\n    const firstPartySize = firstPartyRequests.reduce((sum, req) => sum + req.size, 0);\n    const totalSize = thirdPartySize + firstPartySize;\n    \n    console.log(`Third-party JS: ${Math.round(thirdPartySize / 1024)} KB`);\n    console.log(`First-party JS: ${Math.round(firstPartySize / 1024)} KB`);\n    \n    if (totalSize > 0) {\n      const thirdPartyRatio = thirdPartySize / totalSize;\n      console.log(`Third-party ratio: ${Math.round(thirdPartyRatio * 100)}%`);\n      \n      // 제3자 스크립트가 전체의 30% 미만이어야 함\n      expect(thirdPartyRatio).toBeLessThan(0.3);\n    }\n    \n    // 주요 제3자 서비스 식별\n    const thirdPartyDomains = {};\n    thirdPartyRequests.forEach(req => {\n      try {\n        const domain = new URL(req.url).hostname;\n        thirdPartyDomains[domain] = (thirdPartyDomains[domain] || 0) + req.size;\n      } catch (e) {\n        // URL 파싱 실패 무시\n      }\n    });\n    \n    Object.entries(thirdPartyDomains)\n      .sort(([, a], [, b]) => b - a)\n      .slice(0, 5)\n      .forEach(([domain, size]) => {\n        console.log(`Third-party domain: ${domain} (${Math.round(size / 1024)} KB)`);\n      });\n  });\n});"