import fs from 'fs';

try {
  const report = JSON.parse(fs.readFileSync('./lighthouse-pwa-report.json', 'utf8'));

  console.log('🎯 Lighthouse PWA 점수:', Math.round(report.categories.pwa.score * 100) + '점');
  console.log('\n📊 PWA 감사 결과:');

  const pwaAudits = [
    'is-on-https',
    'viewport',
    'without-javascript',
    'first-contentful-paint',
    'largest-contentful-paint',
    'first-meaningful-paint',
    'load-fast-enough-for-pwa',
    'works-offline',
    'installable-manifest',
    'splash-screen',
    'themed-omnibox',
    'content-width',
    'apple-touch-icon',
    'maskable-icon',
  ];

  pwaAudits.forEach((auditId) => {
    const audit = report.audits[auditId];
    if (audit && audit.score !== null) {
      const icon = audit.score === 1 ? '✅' : audit.score > 0.5 ? '⚠️' : '❌';
      console.log(`${icon} ${audit.title}: ${Math.round(audit.score * 100)}점`);
    }
  });

  // 주요 PWA 요소들 체크
  console.log('\n🔍 주요 PWA 요소 상세:');

  if (report.audits['installable-manifest']) {
    console.log(
      '📱 PWA 설치 가능성:',
      report.audits['installable-manifest'].score === 1 ? '✅ 가능' : '❌ 불가능'
    );
    if (report.audits['installable-manifest'].details) {
      console.log('   세부사항:', report.audits['installable-manifest'].explanation);
    }
  }

  if (report.audits['works-offline']) {
    console.log(
      '🔌 오프라인 동작:',
      report.audits['works-offline'].score === 1 ? '✅ 가능' : '❌ 불가능'
    );
  }

  if (report.audits['maskable-icon']) {
    console.log(
      '🎭 Maskable 아이콘:',
      report.audits['maskable-icon'].score === 1 ? '✅ 존재' : '❌ 없음'
    );
  }

  console.log('\n💡 개선 제안:');
  pwaAudits.forEach((auditId) => {
    const audit = report.audits[auditId];
    if (audit && audit.score !== null && audit.score < 1) {
      console.log(`- ${audit.title}: ${audit.explanation || audit.description}`);
    }
  });
} catch (error) {
  console.error('❌ Lighthouse 리포트 파싱 오류:', error.message);
}
