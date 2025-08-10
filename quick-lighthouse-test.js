// 빠른 Lighthouse 성능 테스트
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import fs from 'fs';

console.log('🚀 Lighthouse 성능 분석 시작...\n');

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  
  const options = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'seo', 'pwa'],
    port: chrome.port
  };
  
  const runnerResult = await lighthouse('http://localhost:3000', options);
  
  // 점수 추출
  const scores = {
    performance: Math.round(runnerResult.lhr.categories.performance.score * 100),
    accessibility: Math.round(runnerResult.lhr.categories.accessibility.score * 100),
    seo: Math.round(runnerResult.lhr.categories.seo.score * 100),
    pwa: Math.round(runnerResult.lhr.categories.pwa.score * 100)
  };
  
  console.log('📊 Lighthouse 점수:\n');
  console.log('================================');
  console.log(`⚡ Performance:   ${scores.performance}/100 ${getEmoji(scores.performance)}`);
  console.log(`♿ Accessibility: ${scores.accessibility}/100 ${getEmoji(scores.accessibility)}`);
  console.log(`🔍 SEO:          ${scores.seo}/100 ${getEmoji(scores.seo)}`);
  console.log(`📱 PWA:          ${scores.pwa}/100 ${getEmoji(scores.pwa)}`);
  console.log('================================\n');
  
  // 주요 메트릭
  const metrics = runnerResult.lhr.audits;
  console.log('⏱️ 주요 성능 메트릭:');
  console.log(`- First Contentful Paint: ${metrics['first-contentful-paint'].displayValue}`);
  console.log(`- Largest Contentful Paint: ${metrics['largest-contentful-paint'].displayValue}`);
  console.log(`- Total Blocking Time: ${metrics['total-blocking-time'].displayValue}`);
  console.log(`- Cumulative Layout Shift: ${metrics['cumulative-layout-shift'].displayValue}`);
  
  // 개선 제안
  if (scores.performance < 90) {
    console.log('\n⚠️ 성능 개선이 필요합니다:');
    const opportunities = runnerResult.lhr.audits;
    Object.values(opportunities).forEach(audit => {
      if (audit.score !== null && audit.score < 0.9 && audit.details?.type === 'opportunity') {
        console.log(`  - ${audit.title}`);
      }
    });
  }
  
  // 결과 저장
  const reportDate = new Date().toISOString().split('T')[0];
  fs.writeFileSync(
    `lighthouse-report-${reportDate}.json`,
    JSON.stringify(runnerResult.lhr, null, 2)
  );
  
  console.log(`\n📄 상세 보고서 저장됨: lighthouse-report-${reportDate}.json`);
  
  await chrome.kill();
  
  return scores;
}

function getEmoji(score) {
  if (score >= 90) return '🟢';
  if (score >= 50) return '🟡';
  return '🔴';
}

// 실행
runLighthouse().catch(console.error);