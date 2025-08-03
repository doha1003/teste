import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 검사할 HTML 페이지 목록
const pages = [
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

async function checkHorizontalScroll() {
  console.log('🔍 수평 스크롤 문제 자동 검사 시작...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];
  let totalIssues = 0;

  for (const page of pages) {
    const pageObj = await browser.newPage();
    
    try {
      console.log(`📄 검사 중: ${page.name} (${page.path})`);
      
      // 페이지 로드
      const fullPath = path.resolve(__dirname, page.path);
      const baseUrl = 'file://' + fullPath.replace(/\\/g, '/');
      console.log(`  📂 경로: ${baseUrl}`);
      await pageObj.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // 다양한 뷰포트 크기에서 테스트
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },    // iPhone SE
        { width: 768, height: 1024, name: 'Tablet' },   // iPad
        { width: 1024, height: 768, name: 'Desktop' },  // 소형 데스크톱
        { width: 1440, height: 900, name: 'Large Desktop' } // 대형 데스크톱
      ];
      
      const pageResults = [];
      
      for (const viewport of viewports) {
        await pageObj.setViewport(viewport);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 레이아웃 재계산 대기
        
        // 수평 스크롤 여부 확인
        const scrollInfo = await pageObj.evaluate(() => {
          const body = document.body;
          const html = document.documentElement;
          
          const scrollWidth = Math.max(body.scrollWidth, html.scrollWidth);
          const clientWidth = Math.max(body.clientWidth, html.clientWidth);
          const hasHorizontalScroll = scrollWidth > clientWidth;
          
          // 문제가 있는 요소들 찾기
          const problematicElements = [];
          const allElements = document.querySelectorAll('*');
          
          allElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(el);
            
            // 뷰포트를 벗어나는 요소 확인
            if (rect.right > clientWidth && computedStyle.position !== 'fixed') {
              problematicElements.push({
                tag: el.tagName.toLowerCase(),
                id: el.id || '',
                className: el.className || '',
                right: rect.right,
                width: rect.width,
                overflowX: computedStyle.overflowX,
                position: computedStyle.position
              });
            }
          });
          
          return {
            hasHorizontalScroll,
            scrollWidth,
            clientWidth,
            overflowAmount: Math.max(0, scrollWidth - clientWidth),
            problematicElements: problematicElements.slice(0, 10) // 상위 10개만
          };
        });
        
        if (scrollInfo.hasHorizontalScroll) {
          totalIssues++;
          pageResults.push({
            viewport: viewport.name,
            ...scrollInfo
          });
        }
      }
      
      results.push({
        page: page.name,
        path: page.path,
        issues: pageResults
      });
      
      if (pageResults.length > 0) {
        console.log(`  ❌ 수평 스크롤 문제 발견: ${pageResults.length}개 뷰포트`);
      } else {
        console.log(`  ✅ 문제 없음`);
      }
      
    } catch (error) {
      console.log(`  ⚠️  페이지 로드 실패: ${error.message}`);
      results.push({
        page: page.name,
        path: page.path,
        error: error.message,
        issues: []
      });
    }
    
    await pageObj.close();
  }

  await browser.close();

  // 결과 리포트 생성
  console.log('\n📊 수평 스크롤 검사 결과 요약');
  console.log('='.repeat(50));
  console.log(`총 검사 페이지: ${pages.length}개`);
  console.log(`수평 스크롤 문제 발견: ${totalIssues}건`);
  
  const problemPages = results.filter(r => r.issues && r.issues.length > 0);
  console.log(`문제 페이지 수: ${problemPages.length}개\n`);

  if (problemPages.length > 0) {
    console.log('🔴 문제가 발견된 페이지들:');
    problemPages.forEach(page => {
      console.log(`\n📄 ${page.page} (${page.path})`);
      page.issues.forEach(issue => {
        console.log(`  - ${issue.viewport}: ${issue.overflowAmount}px 초과`);
        if (issue.problematicElements.length > 0) {
          console.log(`    문제 요소 예시: ${issue.problematicElements[0].tag}${issue.problematicElements[0].className ? '.' + issue.problematicElements[0].className.split(' ')[0] : ''}`);
        }
      });
    });
  }

  // JSON 리포트 저장
  const reportPath = path.join(__dirname, 'horizontal-scroll-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: pages.length,
      totalIssues,
      problemPages: problemPages.length
    },
    results
  }, null, 2));

  console.log(`\n📄 상세 리포트 저장: ${reportPath}`);
  
  return { totalIssues, problemPages: problemPages.length, results };
}

// ES 모듈에서는 require.main을 사용할 수 없으므로 직접 실행
checkHorizontalScroll().catch(console.error);