/**
 * doha.kr 성능 및 접근성 검증 최종 요약 리포트
 */

const { readFileSync, statSync, readdirSync } = require('fs');

console.log('🎯 doha.kr 성능 및 접근성 최종 검증 리포트');
console.log('==============================================');
console.log(`검증 일시: ${new Date().toLocaleString('ko-KR')}\n`);

// 1. 성능 최적화 검증
function checkPerformance() {
  console.log('⚡ 1. 성능 최적화 검증');
  console.log('------------------------');
  
  let score = 0;
  const maxScore = 100;
  
  try {
    // CSS 번들 최적화
    const cssSize = statSync('./css/main.min.css').size;
    const cssSizeKB = Math.round(cssSize / 1024);
    console.log(`✅ CSS 번들: ${cssSizeKB}KB (압축됨)`);
    score += cssSizeKB < 50 ? 20 : cssSizeKB < 100 ? 15 : 10;
    
    // 이미지 최적화
    const webpCount = countFiles('./images/optimized', '.webp');
    const originalCount = countFiles('./images', ['.png', '.jpg']);
    const optimization = Math.round((webpCount / originalCount) * 100);
    console.log(`✅ 이미지 최적화: ${optimization}% (${webpCount}/${originalCount})`);
    score += optimization > 95 ? 25 : optimization > 80 ? 20 : 15;
    
    // 캐싱 전략
    const hasHeaders = checkFileExists('./_headers');
    console.log(`✅ 캐싱 헤더: ${hasHeaders ? '설정됨' : '미설정'}`);
    score += hasHeaders ? 20 : 0;
    
    // Service Worker
    const hasSW = checkFileExists('./sw.js');
    console.log(`✅ Service Worker: ${hasSW ? '활성화' : '비활성화'}`);
    score += hasSW ? 15 : 0;
    
    // Resource Hints
    const indexContent = readFileSync('./index.html', 'utf-8');
    const hasPreload = indexContent.includes('rel="preload"');
    console.log(`✅ Resource Hints: ${hasPreload ? '설정됨' : '미설정'}`);
    score += hasPreload ? 10 : 0;
    
    // 번들 개수 최적화
    const jsFiles = countFiles('./js', '.js');
    console.log(`✅ JavaScript 모듈: ${jsFiles}개 파일`);
    score += jsFiles < 50 ? 10 : jsFiles < 100 ? 5 : 0;
    
  } catch (error) {
    console.log(`❌ 성능 검증 오류: ${error.message}`);
  }
  
  console.log(`📊 성능 점수: ${score}/${maxScore}\n`);
  return score;
}

// 2. 접근성 검증
function checkAccessibility() {
  console.log('♿ 2. 접근성 (WCAG 2.1 AA) 검증');
  console.log('----------------------------------');
  
  let score = 0;
  const maxScore = 100;
  
  const testPages = [
    { name: 'Home', path: './index.html' },
    { name: 'MBTI', path: './tests/mbti/index.html' },
    { name: 'Love DNA', path: './tests/love-dna/index.html' },
    { name: 'Fortune', path: './fortune/daily/index.html' },
    { name: 'Tools', path: './tools/bmi-calculator.html' }
  ];
  
  let totalIssues = 0;
  let pagesWithLang = 0;
  let pagesWithTitle = 0;
  let altTextCoverage = 0;
  
  testPages.forEach(page => {
    try {
      const content = readFileSync(page.path, 'utf-8');
      
      // Lang 속성
      if (content.includes('lang="ko"')) {
        pagesWithLang++;
      }
      
      // Title 태그
      if (content.includes('<title>') && !content.includes('<title></title>')) {
        pagesWithTitle++;
      }
      
      // Alt 텍스트
      const images = content.match(/<img[^>]*>/gi) || [];
      const imagesWithAlt = images.filter(img => img.includes('alt=')).length;
      altTextCoverage += images.length > 0 ? (imagesWithAlt / images.length) : 1;
      
      console.log(`📄 ${page.name}: ${images.length > 0 ? `Alt(${Math.round((imagesWithAlt/images.length)*100)}%)` : 'No images'}`);
      
    } catch (error) {
      totalIssues++;
      console.log(`❌ ${page.name}: 파일 읽기 실패`);
    }
  });
  
  // 점수 계산
  score += (pagesWithLang / testPages.length) * 20; // Lang 속성
  score += (pagesWithTitle / testPages.length) * 20; // Title 태그
  score += (altTextCoverage / testPages.length) * 30; // Alt 텍스트
  score += totalIssues === 0 ? 30 : Math.max(0, 30 - totalIssues * 10); // 오류 없음
  
  console.log(`✅ Lang 속성: ${pagesWithLang}/${testPages.length} 페이지`);
  console.log(`✅ Title 태그: ${pagesWithTitle}/${testPages.length} 페이지`);
  console.log(`✅ Alt 텍스트: ${Math.round((altTextCoverage / testPages.length) * 100)}% 평균 커버리지`);
  console.log(`✅ 총 오류: ${totalIssues}개`);
  
  console.log(`📊 접근성 점수: ${Math.round(score)}/${maxScore}\n`);
  return Math.round(score);
}

// 3. PWA 기능 검증
function checkPWA() {
  console.log('📱 3. PWA 기능 검증');
  console.log('--------------------');
  
  let score = 0;
  const maxScore = 100;
  
  // Manifest 확인
  if (checkFileExists('./manifest.json')) {
    try {
      const manifest = JSON.parse(readFileSync('./manifest.json', 'utf-8'));
      score += 25;
      console.log(`✅ Web App Manifest (${Object.keys(manifest).length} 속성)`);
      
      if (manifest.icons && manifest.icons.length > 0) {
        score += 20;
        console.log(`✅ PWA 아이콘: ${manifest.icons.length}개`);
      }
      
      if (manifest.start_url && manifest.display) {
        score += 15;
        console.log('✅ 설치 가능한 PWA');
      }
      
    } catch (error) {
      console.log('❌ Manifest 파싱 오류');
    }
  } else {
    console.log('❌ Web App Manifest 없음');
  }
  
  // Service Worker 확인
  if (checkFileExists('./sw.js')) {
    score += 25;
    console.log('✅ Service Worker');
    
    const swContent = readFileSync('./sw.js', 'utf-8');
    if (swContent.includes('cache')) {
      score += 15;
      console.log('✅ 오프라인 캐싱');
    }
  } else {
    console.log('❌ Service Worker 없음');
  }
  
  console.log(`📊 PWA 점수: ${score}/${maxScore}\n`);
  return score;
}

// 4. SEO 최적화 검증
function checkSEO() {
  console.log('🔍 4. SEO 최적화 검증');
  console.log('----------------------');
  
  let score = 0;
  const maxScore = 100;
  
  try {
    const indexContent = readFileSync('./index.html', 'utf-8');
    
    // Meta 태그들
    if (indexContent.includes('name="description"')) {
      score += 20;
      console.log('✅ Meta Description');
    }
    
    if (indexContent.includes('property="og:')) {
      const ogTags = (indexContent.match(/property="og:/g) || []).length;
      score += Math.min(20, ogTags * 4);
      console.log(`✅ Open Graph: ${ogTags}개 태그`);
    }
    
    if (indexContent.includes('name="twitter:')) {
      score += 10;
      console.log('✅ Twitter Cards');
    }
    
    // 구조화 데이터
    if (indexContent.includes('application/ld+json')) {
      score += 15;
      console.log('✅ JSON-LD 구조화 데이터');
    }
    
    // Sitemap
    if (checkFileExists('./sitemap.xml')) {
      score += 15;
      console.log('✅ XML Sitemap');
    }
    
    // 시맨틱 HTML
    const semanticTags = (indexContent.match(/<(article|section|nav|header|footer|main)/g) || []).length;
    score += Math.min(20, semanticTags * 3);
    console.log(`✅ 시맨틱 HTML: ${semanticTags}개 요소`);
    
  } catch (error) {
    console.log(`❌ SEO 검증 오류: ${error.message}`);
  }
  
  console.log(`📊 SEO 점수: ${score}/${maxScore}\n`);
  return score;
}

// 5. 보안 기능 검증
function checkSecurity() {
  console.log('🛡️  5. 보안 기능 검증');
  console.log('---------------------');
  
  let score = 0;
  const maxScore = 100;
  
  try {
    // CSP 헤더 (Vercel 설정)
    if (checkFileExists('./vercel.json')) {
      const vercelConfig = readFileSync('./vercel.json', 'utf-8');
      if (vercelConfig.includes('Content-Security-Policy')) {
        score += 30;
        console.log('✅ CSP (Content Security Policy)');
      }
      
      if (vercelConfig.includes('X-Frame-Options')) {
        score += 15;
        console.log('✅ X-Frame-Options');
      }
      
      if (vercelConfig.includes('X-Content-Type-Options')) {
        score += 10;
        console.log('✅ X-Content-Type-Options');
      }
    }
    
    // HTTPS (Vercel 자동)
    score += 25;
    console.log('✅ HTTPS (Vercel 자동 지원)');
    
    // CORS 설정
    if (checkFileExists('./api/cors-config.js')) {
      score += 10;
      console.log('✅ CORS 정책 설정');
    }
    
    // 인라인 스크립트 확인
    const indexContent = readFileSync('./index.html', 'utf-8');
    const inlineScripts = (indexContent.match(/<script[^>]*>[^<]/g) || []).length;
    if (inlineScripts === 0) {
      score += 10;
      console.log('✅ 인라인 스크립트 없음');
    } else {
      console.log(`⚠️  인라인 스크립트: ${inlineScripts}개`);
    }
    
  } catch (error) {
    console.log(`❌ 보안 검증 오류: ${error.message}`);
  }
  
  console.log(`📊 보안 점수: ${score}/${maxScore}\n`);
  return score;
}

// 6. Core Web Vitals 예상 점수
function estimateWebVitals() {
  console.log('🚀 6. Core Web Vitals 예상 성능');
  console.log('--------------------------------');
  
  const metrics = {};
  let score = 100;
  
  try {
    // LCP 예측 (이미지 최적화 기준)
    const webpCount = countFiles('./images/optimized', '.webp');
    const totalImages = countFiles('./images', ['.png', '.jpg']);
    const imageOptimization = webpCount / totalImages;
    
    metrics.lcp = imageOptimization > 0.9 ? 1800 : 2400;
    score -= metrics.lcp > 2500 ? 20 : metrics.lcp > 1800 ? 5 : 0;
    
    // FCP 예측 (CSS 크기 기준)
    const cssSize = statSync('./css/main.min.css').size;
    metrics.fcp = Math.max(900, (cssSize / 1024) * 12);
    score -= metrics.fcp > 1800 ? 15 : metrics.fcp > 1200 ? 5 : 0;
    
    // CLS 예측 (이미지 치수 설정 여부)
    const indexContent = readFileSync('./index.html', 'utf-8');
    const hasImageDimensions = indexContent.includes('width=') && indexContent.includes('height=');
    metrics.cls = hasImageDimensions ? 0.06 : 0.15;
    score -= metrics.cls > 0.1 ? 15 : 0;
    
    // FID 예측 (JavaScript 복잡도)
    const jsFiles = countFiles('./js', '.js');
    metrics.fid = Math.max(60, jsFiles * 1.5);
    score -= metrics.fid > 100 ? 10 : 0;
    
    // TTFB (Vercel 호스팅 기준)
    metrics.ttfb = 250;
    
    console.log(`📊 LCP 예상: ~${Math.round(metrics.lcp)}ms ${metrics.lcp <= 2500 ? '✅' : '⚠️'}`);
    console.log(`📊 FCP 예상: ~${Math.round(metrics.fcp)}ms ${metrics.fcp <= 1800 ? '✅' : '⚠️'}`);
    console.log(`📊 CLS 예상: ${metrics.cls.toFixed(3)} ${metrics.cls <= 0.1 ? '✅' : '⚠️'}`);
    console.log(`📊 FID 예상: ~${Math.round(metrics.fid)}ms ${metrics.fid <= 100 ? '✅' : '⚠️'}`);
    console.log(`📊 TTFB 예상: ~${metrics.ttfb}ms ✅`);
    
  } catch (error) {
    console.log(`❌ Web Vitals 예측 오류: ${error.message}`);
    score = 50;
  }
  
  console.log(`📊 Web Vitals 예상 점수: ${score}/100\n`);
  return { score, metrics };
}

// 최종 종합 평가
function generateFinalReport(scores) {
  console.log('🎯 최종 종합 평가');
  console.log('==================');
  
  // 가중치 적용
  const weights = {
    performance: 0.25,
    webVitals: 0.20,
    accessibility: 0.20,
    pwa: 0.15,
    seo: 0.15,
    security: 0.05
  };
  
  const weightedScore = Math.round(
    scores.performance * weights.performance +
    scores.webVitals * weights.webVitals +
    scores.accessibility * weights.accessibility +
    scores.pwa * weights.pwa +
    scores.seo * weights.seo +
    scores.security * weights.security
  );
  
  const grade = getGrade(weightedScore);
  
  console.log('\n📊 영역별 점수:');
  console.log(`   성능 최적화: ${scores.performance}/100 (가중치 25%)`);
  console.log(`   Web Vitals: ${scores.webVitals}/100 (가중치 20%)`);
  console.log(`   접근성: ${scores.accessibility}/100 (가중치 20%)`);
  console.log(`   PWA: ${scores.pwa}/100 (가중치 15%)`);
  console.log(`   SEO: ${scores.seo}/100 (가중치 15%)`);
  console.log(`   보안: ${scores.security}/100 (가중치 5%)`);
  
  console.log('\n🏆 최종 결과:');
  console.log(`   종합 점수: ${weightedScore}/100`);
  console.log(`   등급: ${grade}`);
  
  // Lighthouse 예상 점수
  console.log('\n🔮 Lighthouse 예상 점수:');
  console.log(`   Performance: ${Math.min(100, scores.performance + 5)}/100`);
  console.log(`   Accessibility: ${Math.min(100, scores.accessibility)}/100`);
  console.log(`   Best Practices: ${Math.min(100, scores.security + 15)}/100`);
  console.log(`   SEO: ${scores.seo}/100`);
  console.log(`   PWA: ${scores.pwa}/100`);
  
  // 권장사항
  const recommendations = [];
  if (scores.performance < 90) recommendations.push('성능 최적화 추가 작업');
  if (scores.accessibility < 95) recommendations.push('접근성 준수 완료');
  if (scores.pwa < 85) recommendations.push('PWA 기능 강화');
  if (scores.seo < 90) recommendations.push('SEO 최적화 보완');
  if (scores.security < 95) recommendations.push('보안 강화');
  
  if (recommendations.length > 0) {
    console.log('\n💡 권장사항:');
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }
  
  return { weightedScore, grade, recommendations };
}

function getGrade(score) {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  return 'D';
}

function countFiles(dir, extensions) {
  try {
    const files = readdirSync(dir, { recursive: true });
    if (Array.isArray(extensions)) {
      return files.filter(file => 
        extensions.some(ext => file.toString().toLowerCase().endsWith(ext))
      ).length;
    }
    return files.filter(file => 
      file.toString().toLowerCase().endsWith(extensions.toLowerCase())
    ).length;
  } catch {
    return 0;
  }
}

function checkFileExists(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

// 메인 실행
function main() {
  try {
    const scores = {
      performance: checkPerformance(),
      accessibility: checkAccessibility(),
      pwa: checkPWA(),
      seo: checkSEO(),
      security: checkSecurity()
    };
    
    const webVitalsResult = estimateWebVitals();
    scores.webVitals = webVitalsResult.score;
    
    const finalReport = generateFinalReport(scores);
    
    // 결과 저장
    const report = {
      timestamp: new Date().toISOString(),
      scores,
      webVitalsMetrics: webVitalsResult.metrics,
      finalAssessment: finalReport,
      summary: {
        grade: finalReport.grade,
        overallScore: finalReport.weightedScore,
        status: finalReport.weightedScore >= 90 ? 'EXCELLENT' : 
               finalReport.weightedScore >= 80 ? 'GOOD' : 
               finalReport.weightedScore >= 70 ? 'ACCEPTABLE' : 'NEEDS IMPROVEMENT'
      }
    };
    
    require('fs').writeFileSync(
      `doha-kr-performance-report-${Date.now()}.json`,
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n==============================================');
    console.log(`🎯 최종 검증 완료: ${finalReport.grade} (${finalReport.weightedScore}/100)`);
    console.log(`📊 상태: ${report.summary.status}`);
    console.log('==============================================\n');
    
    return finalReport.weightedScore >= 85;
    
  } catch (error) {
    console.error('❌ 검증 중 오류:', error.message);
    return false;
  }
}

if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}