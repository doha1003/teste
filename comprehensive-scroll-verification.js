import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 26개 모든 페이지 검사
const allPages = [
  { path: 'index.html', name: '홈페이지' },
  { path: 'about/index.html', name: '소개' },
  { path: 'contact/index.html', name: '문의' },
  { path: 'privacy/index.html', name: '개인정보처리방침' },
  { path: 'terms/index.html', name: '이용약관' },
  { path: 'faq/index.html', name: 'FAQ' },
  { path: '404.html', name: '404 페이지' },
  { path: 'offline.html', name: '오프라인 페이지' },
  { path: 'tests/index.html', name: '심리테스트 메인' },
  { path: 'tests/mbti/index.html', name: 'MBTI 소개' },
  { path: 'tests/mbti/test.html', name: 'MBTI 테스트' },
  { path: 'tests/love-dna/index.html', name: 'Love DNA 소개' },
  { path: 'tests/love-dna/test.html', name: 'Love DNA 테스트' },
  { path: 'tests/teto-egen/index.html', name: 'Teto-Egen 소개' },
  { path: 'tests/teto-egen/test.html', name: 'Teto-Egen 테스트' },
  { path: 'fortune/index.html', name: 'AI 운세 메인' },
  { path: 'fortune/daily/index.html', name: '오늘의 운세' },
  { path: 'fortune/saju/index.html', name: '사주운세' },
  { path: 'fortune/tarot/index.html', name: '타로운세' },
  { path: 'fortune/zodiac/index.html', name: '별자리운세' },
  { path: 'fortune/zodiac-animal/index.html', name: '띠별운세' },
  { path: 'tools/index.html', name: '실용도구 메인' },
  { path: 'tools/bmi-calculator.html', name: 'BMI 계산기' },
  { path: 'tools/salary-calculator.html', name: '연봉 계산기' },
  { path: 'tools/text-counter.html', name: '글자수 세기' },
  { path: 'result-detail.html', name: '결과 상세' }
];

async function comprehensiveScrollVerification() {
  console.log('🔍 전체 26개 페이지 수평 스크롤 검증 시작...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let totalIssues = 0;
  let successfulPages = 0;
  let failedPages = 0;
  const results = [];

  console.log('진행 상황:');
  for (let i = 0; i < allPages.length; i++) {
    const page = allPages[i];
    const pageObj = await browser.newPage();
    
    try {
      const progress = `[${i + 1}/${allPages.length}]`;
      process.stdout.write(`${progress} ${page.name}...`);
      
      const fullPath = path.resolve(__dirname, page.path);
      const baseUrl = 'file://' + fullPath.replace(/\\/g, '/');
      await pageObj.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      
      // 빠른 검증: 모바일과 데스크톱만
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 1280, height: 720, name: 'Desktop' }
      ];
      
      let pageHasIssues = false;
      
      for (const viewport of viewports) {
        await pageObj.setViewport(viewport);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const scrollInfo = await pageObj.evaluate(() => {
          const body = document.body;
          const html = document.documentElement;
          
          const scrollWidth = Math.max(body.scrollWidth, html.scrollWidth);
          const clientWidth = Math.max(body.clientWidth, html.clientWidth);
          const hasHorizontalScroll = scrollWidth > clientWidth;
          
          return {
            hasHorizontalScroll,
            overflowAmount: Math.max(0, scrollWidth - clientWidth)
          };
        });
        
        if (scrollInfo.hasHorizontalScroll) {
          pageHasIssues = true;
          totalIssues++;
        }
      }
      
      if (pageHasIssues) {
        console.log(' ❌');
        failedPages++;
      } else {
        console.log(' ✅');
        successfulPages++;
      }
      
      results.push({
        page: page.name,
        path: page.path,
        hasIssues: pageHasIssues
      });
      
    } catch (error) {
      console.log(' ⚠️');
      failedPages++;
      results.push({
        page: page.name,
        path: page.path,
        error: error.message
      });
    }
    
    await pageObj.close();
  }

  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log('📊 전체 페이지 수평 스크롤 검증 최종 결과');
  console.log('='.repeat(60));
  console.log(`총 검사 페이지: ${allPages.length}개`);
  console.log(`✅ 성공: ${successfulPages}개 페이지`);
  console.log(`❌ 실패: ${failedPages}개 페이지`);
  console.log(`🚫 수평 스크롤 문제: ${totalIssues}건`);
  
  const successRate = ((successfulPages / allPages.length) * 100).toFixed(1);
  console.log(`📈 성공률: ${successRate}%`);
  
  if (totalIssues === 0) {
    console.log('\n🎉 모든 페이지에서 수평 스크롤 문제가 해결되었습니다!');
    console.log('✨ 수평 스크롤 방지 작업이 성공적으로 완료되었습니다.');
  } else {
    console.log('\n⚠️  일부 페이지에서 여전히 문제가 있습니다:');
    const problemPages = results.filter(r => r.hasIssues);
    problemPages.forEach(page => {
      console.log(`  - ${page.page} (${page.path})`);
    });
  }
  
  // 결과 저장
  const reportPath = path.join(__dirname, 'horizontal-scroll-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: allPages.length,
      successfulPages,
      failedPages,
      totalIssues,
      successRate: parseFloat(successRate)
    },
    results
  }, null, 2));
  
  console.log(`\n📄 상세 리포트 저장: ${reportPath}`);
  
  return { totalIssues, successfulPages, failedPages, successRate };
}

comprehensiveScrollVerification().catch(console.error);