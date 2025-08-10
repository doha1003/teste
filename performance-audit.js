/**
 * doha.kr 성능 및 접근성 검증 스크립트
 * Lighthouse를 사용하여 Core Web Vitals와 접근성을 측정합니다.
 */

import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 테스트할 URL 목록
const TEST_URLS = [
  'http://localhost:3000/',
  'http://localhost:3000/tests/mbti/',
  'http://localhost:3000/tests/love-dna/',
  'http://localhost:3000/fortune/daily/',
  'http://localhost:3000/tools/bmi-calculator.html'
];

// 성능 기준치
const THRESHOLDS = {
  performance: 90,
  accessibility: 95,
  bestPractices: 90,
  seo: 100,
  pwa: 85,
  lcp: 2500,  // Largest Contentful Paint (ms)
  fcp: 1800,  // First Contentful Paint (ms) 
  cls: 0.1,   // Cumulative Layout Shift
  si: 3400,   // Speed Index (ms)
  tti: 3800   // Time to Interactive (ms)
};

async function runLighthouseAudit(url, mobile = false) {
  console.log(`\n🔍 Running ${mobile ? 'Mobile' : 'Desktop'} audit for: ${url}`);
  
  const chrome = await launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
  });

  const config = {
    extends: 'lighthouse:default',
    settings: {
      formFactor: mobile ? 'mobile' : 'desktop',
      throttling: mobile ? {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4
      } : {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1
      },
      screenEmulation: mobile ? {
        mobile: true,
        width: 375,
        height: 667,
        deviceScaleFactor: 2
      } : {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1
      }
    }
  };

  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    port: chrome.port
  };

  try {
    const runnerResult = await lighthouse(url, options, config);
    await chrome.kill();
    return runnerResult.lhr;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

function analyzeResults(lhr) {
  const { audits, categories } = lhr;
  
  const scores = {
    performance: Math.round(categories.performance.score * 100),
    accessibility: Math.round(categories.accessibility.score * 100),
    bestPractices: Math.round(categories['best-practices'].score * 100),
    seo: Math.round(categories.seo.score * 100),
    pwa: categories.pwa ? Math.round(categories.pwa.score * 100) : null
  };

  const vitals = {
    lcp: Math.round(audits['largest-contentful-paint']?.numericValue || 0),
    fcp: Math.round(audits['first-contentful-paint']?.numericValue || 0),
    cls: parseFloat((audits['cumulative-layout-shift']?.numericValue || 0).toFixed(3)),
    si: Math.round(audits['speed-index']?.numericValue || 0),
    tti: Math.round(audits['interactive']?.numericValue || 0),
    tbt: Math.round(audits['total-blocking-time']?.numericValue || 0)
  };

  const resources = {
    totalSize: Math.round((audits['total-byte-weight']?.numericValue || 0) / 1024), // KB
    unusedCss: Math.round((audits['unused-css-rules']?.details?.overallSavingsBytes || 0) / 1024),
    unusedJs: Math.round((audits['unused-javascript']?.details?.overallSavingsBytes || 0) / 1024),
    imageOptimization: Math.round((audits['uses-optimized-images']?.details?.overallSavingsBytes || 0) / 1024)
  };

  // 개선 기회 분석
  const opportunities = Object.keys(audits)
    .filter(key => audits[key].score !== null && audits[key].score < 0.9)
    .map(key => ({
      audit: key,
      title: audits[key].title,
      score: Math.round(audits[key].score * 100),
      savings: audits[key].details?.overallSavingsMs || 0,
      description: audits[key].description
    }))
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 5);

  return { scores, vitals, resources, opportunities };
}

function evaluatePerformance(results, url, mobile = false) {
  const { scores, vitals, resources } = results;
  const issues = [];
  const device = mobile ? 'Mobile' : 'Desktop';
  
  console.log(`\n📊 ${device} Results for ${url}:`);
  console.log('┌─────────────────┬──────┬─────────┐');
  console.log('│ Category        │ Score│ Status  │');
  console.log('├─────────────────┼──────┼─────────┤');
  console.log(`│ Performance     │ ${scores.performance.toString().padStart(3)} │ ${scores.performance >= THRESHOLDS.performance ? '✅ Pass' : '❌ Fail'} │`);
  console.log(`│ Accessibility   │ ${scores.accessibility.toString().padStart(3)} │ ${scores.accessibility >= THRESHOLDS.accessibility ? '✅ Pass' : '❌ Fail'} │`);
  console.log(`│ Best Practices  │ ${scores.bestPractices.toString().padStart(3)} │ ${scores.bestPractices >= THRESHOLDS.bestPractices ? '✅ Pass' : '❌ Fail'} │`);
  console.log(`│ SEO             │ ${scores.seo.toString().padStart(3)} │ ${scores.seo >= THRESHOLDS.seo ? '✅ Pass' : '❌ Fail'} │`);
  if (scores.pwa !== null) {
    console.log(`│ PWA             │ ${scores.pwa.toString().padStart(3)} │ ${scores.pwa >= THRESHOLDS.pwa ? '✅ Pass' : '❌ Fail'} │`);
  }
  console.log('└─────────────────┴──────┴─────────┘');

  console.log('\n🚀 Core Web Vitals:');
  console.log('┌─────────────────┬─────────┬─────────┐');
  console.log('│ Metric          │ Value   │ Status  │');
  console.log('├─────────────────┼─────────┼─────────┤');
  console.log(`│ LCP (ms)        │ ${vitals.lcp.toString().padStart(6)} │ ${vitals.lcp <= THRESHOLDS.lcp ? '✅ Good' : '❌ Poor'} │`);
  console.log(`│ FCP (ms)        │ ${vitals.fcp.toString().padStart(6)} │ ${vitals.fcp <= THRESHOLDS.fcp ? '✅ Good' : '❌ Poor'} │`);
  console.log(`│ CLS             │ ${vitals.cls.toString().padStart(6)} │ ${vitals.cls <= THRESHOLDS.cls ? '✅ Good' : '❌ Poor'} │`);
  console.log(`│ Speed Index     │ ${vitals.si.toString().padStart(6)} │ ${vitals.si <= THRESHOLDS.si ? '✅ Good' : '❌ Poor'} │`);
  console.log(`│ TTI (ms)        │ ${vitals.tti.toString().padStart(6)} │ ${vitals.tti <= THRESHOLDS.tti ? '✅ Good' : '❌ Poor'} │`);
  console.log('└─────────────────┴─────────┴─────────┘');

  console.log('\n📦 Resources:');
  console.log(`   Total Size: ${resources.totalSize} KB`);
  console.log(`   Unused CSS: ${resources.unusedCss} KB`);
  console.log(`   Unused JS: ${resources.unusedJs} KB`);
  console.log(`   Image Optimization: ${resources.imageOptimization} KB`);

  // 문제점 수집
  if (scores.performance < THRESHOLDS.performance) {
    issues.push(`Performance score too low: ${scores.performance} (target: ${THRESHOLDS.performance})`);
  }
  if (scores.accessibility < THRESHOLDS.accessibility) {
    issues.push(`Accessibility score too low: ${scores.accessibility} (target: ${THRESHOLDS.accessibility})`);
  }
  if (vitals.lcp > THRESHOLDS.lcp) {
    issues.push(`LCP too slow: ${vitals.lcp}ms (target: ${THRESHOLDS.lcp}ms)`);
  }
  if (vitals.cls > THRESHOLDS.cls) {
    issues.push(`CLS too high: ${vitals.cls} (target: ${THRESHOLDS.cls})`);
  }

  return { scores, vitals, resources, issues };
}

function generateReport(allResults) {
  console.log('\n📋 PERFORMANCE & ACCESSIBILITY AUDIT REPORT');
  console.log('================================================');
  
  let totalIssues = 0;
  const summaryData = {
    timestamp: new Date().toISOString(),
    totalPages: allResults.length,
    averageScores: {
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      seo: 0
    },
    coreWebVitals: {
      averageLCP: 0,
      averageFCP: 0,
      averageCLS: 0
    },
    commonIssues: {},
    recommendations: []
  };

  // 평균 점수 계산
  allResults.forEach(result => {
    summaryData.averageScores.performance += result.scores.performance;
    summaryData.averageScores.accessibility += result.scores.accessibility;
    summaryData.averageScores.bestPractices += result.scores.bestPractices;
    summaryData.averageScores.seo += result.scores.seo;
    
    summaryData.coreWebVitals.averageLCP += result.vitals.lcp;
    summaryData.coreWebVitals.averageFCP += result.vitals.fcp;
    summaryData.coreWebVitals.averageCLS += result.vitals.cls;
    
    totalIssues += result.issues.length;
    
    result.issues.forEach(issue => {
      summaryData.commonIssues[issue] = (summaryData.commonIssues[issue] || 0) + 1;
    });
  });

  const pageCount = allResults.length;
  summaryData.averageScores.performance = Math.round(summaryData.averageScores.performance / pageCount);
  summaryData.averageScores.accessibility = Math.round(summaryData.averageScores.accessibility / pageCount);
  summaryData.averageScores.bestPractices = Math.round(summaryData.averageScores.bestPractices / pageCount);
  summaryData.averageScores.seo = Math.round(summaryData.averageScores.seo / pageCount);
  
  summaryData.coreWebVitals.averageLCP = Math.round(summaryData.coreWebVitals.averageLCP / pageCount);
  summaryData.coreWebVitals.averageFCP = Math.round(summaryData.coreWebVitals.averageFCP / pageCount);
  summaryData.coreWebVitals.averageCLS = parseFloat((summaryData.coreWebVitals.averageCLS / pageCount).toFixed(3));

  console.log('\n🎯 OVERALL SUMMARY:');
  console.log(`   Pages Tested: ${pageCount}`);
  console.log(`   Total Issues: ${totalIssues}`);
  console.log('\n📊 Average Scores:');
  console.log(`   Performance: ${summaryData.averageScores.performance}/100 ${summaryData.averageScores.performance >= THRESHOLDS.performance ? '✅' : '❌'}`);
  console.log(`   Accessibility: ${summaryData.averageScores.accessibility}/100 ${summaryData.averageScores.accessibility >= THRESHOLDS.accessibility ? '✅' : '❌'}`);
  console.log(`   Best Practices: ${summaryData.averageScores.bestPractices}/100 ${summaryData.averageScores.bestPractices >= THRESHOLDS.bestPractices ? '✅' : '❌'}`);
  console.log(`   SEO: ${summaryData.averageScores.seo}/100 ${summaryData.averageScores.seo >= THRESHOLDS.seo ? '✅' : '❌'}`);

  console.log('\n🚀 Average Core Web Vitals:');
  console.log(`   LCP: ${summaryData.coreWebVitals.averageLCP}ms ${summaryData.coreWebVitals.averageLCP <= THRESHOLDS.lcp ? '✅' : '❌'}`);
  console.log(`   FCP: ${summaryData.coreWebVitals.averageFCP}ms ${summaryData.coreWebVitals.averageFCP <= THRESHOLDS.fcp ? '✅' : '❌'}`);
  console.log(`   CLS: ${summaryData.coreWebVitals.averageCLS} ${summaryData.coreWebVitals.averageCLS <= THRESHOLDS.cls ? '✅' : '❌'}`);

  // 공통 문제점 분석
  const commonIssues = Object.entries(summaryData.commonIssues)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  if (commonIssues.length > 0) {
    console.log('\n🔴 Common Issues:');
    commonIssues.forEach(([issue, count]) => {
      console.log(`   ${issue} (${count} pages)`);
    });
  }

  // 추천사항 생성
  if (summaryData.averageScores.performance < THRESHOLDS.performance) {
    summaryData.recommendations.push('성능 최적화: 이미지 압축, CSS/JS 미니파이, 캐싱 개선');
  }
  if (summaryData.averageScores.accessibility < THRESHOLDS.accessibility) {
    summaryData.recommendations.push('접근성 개선: Alt 텍스트, 키보드 네비게이션, 색상 대비 개선');
  }
  if (summaryData.coreWebVitals.averageLCP > THRESHOLDS.lcp) {
    summaryData.recommendations.push('LCP 개선: Critical CSS, 이미지 최적화, 서버 응답 시간 단축');
  }
  if (summaryData.coreWebVitals.averageCLS > THRESHOLDS.cls) {
    summaryData.recommendations.push('CLS 개선: 이미지/광고 크기 지정, 폰트 로딩 최적화');
  }

  if (summaryData.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    summaryData.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }

  // 결과를 파일로 저장
  const reportPath = path.join(__dirname, `performance-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(summaryData, null, 2));
  console.log(`\n💾 Report saved to: ${reportPath}`);

  const passCount = allResults.filter(r => r.issues.length === 0).length;
  const overall = passCount === pageCount ? 'PASS' : 'FAIL';
  
  console.log('\n================================================');
  console.log(`🎯 OVERALL RESULT: ${overall} (${passCount}/${pageCount} pages passed)`);
  console.log('================================================\n');

  return { overall, summaryData };
}

async function main() {
  console.log('🚀 Starting Performance & Accessibility Audit for doha.kr');
  console.log('================================================================');
  
  const allResults = [];

  try {
    for (const url of TEST_URLS) {
      try {
        // Desktop 테스트
        const desktopResult = await runLighthouseAudit(url, false);
        const desktopAnalysis = analyzeResults(desktopResult);
        const desktopEval = evaluatePerformance(desktopAnalysis, url, false);
        
        allResults.push({
          url,
          device: 'Desktop',
          ...desktopEval
        });

        // 개선 기회 출력
        if (desktopAnalysis.opportunities.length > 0) {
          console.log('\n💡 Top Improvement Opportunities:');
          desktopAnalysis.opportunities.forEach((opp, index) => {
            console.log(`   ${index + 1}. ${opp.title} (Score: ${opp.score}/100)`);
          });
        }

        console.log('\n' + '─'.repeat(60));

      } catch (error) {
        console.error(`❌ Failed to audit ${url}:`, error.message);
        allResults.push({
          url,
          device: 'Desktop',
          error: error.message,
          scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
          vitals: { lcp: 999999, fcp: 999999, cls: 999, si: 999999, tti: 999999 },
          resources: { totalSize: 0, unusedCss: 0, unusedJs: 0 },
          issues: [`Audit failed: ${error.message}`]
        });
      }
    }

    // 최종 리포트 생성
    const { overall } = generateReport(allResults);
    
    process.exit(overall === 'PASS' ? 0 : 1);

  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runLighthouseAudit, analyzeResults, evaluatePerformance };