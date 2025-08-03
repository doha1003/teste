import { execSync } from 'child_process';
import fs from 'fs';

async function quickPerformanceTest() {
  try {
    console.log('🚀 Phase 3 성능 개선 효과 측정 중...');
    
    // Lighthouse 성능 측정
    const lighthouse = execSync(
      'lighthouse http://localhost:3000 --only-categories=performance --output=json --chrome-flags="--headless --no-sandbox" --quiet',
      { encoding: 'utf8', timeout: 60000 }
    );
    
    const results = JSON.parse(lighthouse);
    const performance = results.lhr.categories.performance.score * 100;
    
    // Core Web Vitals 추출
    const audits = results.lhr.audits;
    const lcp = audits['largest-contentful-paint'].displayValue || 'N/A';
    const fid = audits['max-potential-fid'].displayValue || 'N/A';
    const cls = audits['cumulative-layout-shift'].displayValue || 'N/A';
    const fcp = audits['first-contentful-paint'].displayValue || 'N/A';
    
    console.log('\n📊 성능 측정 결과:');
    console.log('==================');
    console.log(`🎯 Performance Score: ${performance.toFixed(1)}/100 (목표: 75+)`);
    console.log(`⚡ LCP (Largest Contentful Paint): ${lcp} (목표: <4.0s)`);
    console.log(`🎭 FCP (First Contentful Paint): ${fcp}`);
    console.log(`📐 CLS (Cumulative Layout Shift): ${cls}`);
    console.log(`🖱️ FID (First Input Delay): ${fid}`);
    
    // Phase 3 목표 달성 여부 확인
    const targetMet = performance >= 75;
    
    console.log('\n🎯 Phase 3 목표 달성 여부:');
    console.log('========================');
    console.log(`✅ Performance 75+ 달성: ${targetMet ? 'SUCCESS' : 'FAILED'} (${performance.toFixed(1)}/100)`);
    
    // 성능 개선 효과 요약
    console.log('\n🔧 적용된 최적화:');
    console.log('================');
    console.log('✅ Critical CSS 인라인화 (1.7KB)');
    console.log('✅ CSS 비동기 로딩');
    console.log('✅ JavaScript 지연 로딩 (defer)');
    console.log('✅ 폰트 최적화 (preload)');
    console.log('✅ 카카오 SDK 조건부 로딩');
    
    // 간단한 결과 저장
    const summary = {
      timestamp: new Date().toISOString(),
      performance: performance,
      lcp: lcp,
      fcp: fcp,
      cls: cls,
      fid: fid,
      targetMet: targetMet,
      optimizations: [
        'Critical CSS 인라인화',
        'CSS 비동기 로딩',
        'JavaScript 지연 로딩',
        '폰트 최적화',
        'SDK 조건부 로딩'
      ]
    };
    
    fs.writeFileSync('phase3-performance-results.json', JSON.stringify(summary, null, 2));
    console.log('\n📁 결과 저장: phase3-performance-results.json');
    
    return targetMet;
    
  } catch (error) {
    console.error('성능 측정 실패:', error.message);
    return false;
  }
}

quickPerformanceTest();