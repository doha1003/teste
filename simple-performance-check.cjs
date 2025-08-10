/**
 * 간단한 성능 및 접근성 검증 스크립트
 */

const { readFileSync, statSync, readdirSync } = require('fs');
const path = require('path');

console.log('🚀 doha.kr 성능 및 접근성 검증 시작');
console.log('================================================\n');

// 1. 번들 크기 분석
function analyzeBundleSize() {
  console.log('📦 BUNDLE SIZE ANALYSIS');
  console.log('------------------------');
  
  try {
    // CSS 번들 크기 확인
    const cssStats = statSync('./css/main.css');
    const cssMinStats = statSync('./css/main.min.css');
    
    console.log(`CSS Bundle (개발): ${Math.round(cssStats.size / 1024)} KB`);
    console.log(`CSS Bundle (운영): ${Math.round(cssMinStats.size / 1024)} KB`);
    console.log(`CSS 압축률: ${Math.round((1 - cssMinStats.size / cssStats.size) * 100)}%`);
    
    // 개별 CSS 파일 수 확인
    const cssFiles = countFiles('./css', '.css');
    console.log(`총 CSS 파일 수: ${cssFiles}`);
    
    return {
      cssDevSize: cssStats.size,
      cssProdSize: cssMinStats.size,
      cssCompression: Math.round((1 - cssMinStats.size / cssStats.size) * 100),
      cssFileCount: cssFiles
    };
  } catch (error) {
    console.log(`❌ CSS 번들 분석 실패: ${error.message}`);
    return null;
  }
}

// 2. 이미지 최적화 상태 확인
function analyzeImageOptimization() {
  console.log('\n🖼️ IMAGE OPTIMIZATION ANALYSIS');
  console.log('--------------------------------');
  
  try {
    const imagesDir = './images';
    const optimizedDir = './images/optimized';
    
    const originalImages = countFiles(imagesDir, ['.png', '.jpg', '.jpeg']);
    const webpImages = countFiles(optimizedDir, '.webp');
    const avifImages = countFiles(optimizedDir, '.avif');
    
    console.log(`원본 이미지: ${originalImages}개`);
    console.log(`WebP 이미지: ${webpImages}개`);
    console.log(`AVIF 이미지: ${avifImages}개`);
    
    const optimizationRatio = webpImages / originalImages;
    console.log(`이미지 최적화율: ${Math.round(optimizationRatio * 100)}%`);
    
    return {
      originalCount: originalImages,
      webpCount: webpImages,
      avifCount: avifImages,
      optimizationRatio: optimizationRatio
    };
  } catch (error) {
    console.log(`❌ 이미지 최적화 분석 실패: ${error.message}`);
    return null;
  }
}

// 3. HTML 접근성 기본 검증
function analyzeAccessibility() {
  console.log('\n♿ ACCESSIBILITY BASIC CHECK');
  console.log('-----------------------------');
  
  const htmlFiles = [
    './index.html',
    './tests/mbti/index.html',
    './tests/love-dna/index.html',
    './fortune/daily/index.html',
    './tools/bmi-calculator.html'
  ];
  
  const results = {
    totalPages: htmlFiles.length,
    pagesWithLang: 0,
    pagesWithViewport: 0,
    pagesWithTitle: 0,
    pagesWithMeta: 0,
    avgAltTextCoverage: 0
  };
  
  htmlFiles.forEach(filePath => {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const pageName = path.basename(path.dirname(filePath)) || 'home';
      
      // 기본 접근성 요소 확인
      const hasLang = content.includes('lang="ko"');
      const hasViewport = content.includes('viewport');
      const hasTitle = /<title>.*<\/title>/.test(content);
      const hasMeta = content.includes('<meta charset="UTF-8">');
      
      // 이미지 Alt 텍스트 확인
      const imgMatches = content.match(/<img[^>]*>/gi) || [];
      const imgWithAlt = imgMatches.filter(img => img.includes('alt=')).length;
      const altCoverage = imgMatches.length > 0 ? (imgWithAlt / imgMatches.length) : 1;
      
      console.log(`${pageName}: Lang(${hasLang ? '✅' : '❌'}) Viewport(${hasViewport ? '✅' : '❌'}) Title(${hasTitle ? '✅' : '❌'}) Alt(${Math.round(altCoverage * 100)}%)`);
      
      if (hasLang) results.pagesWithLang++;
      if (hasViewport) results.pagesWithViewport++;
      if (hasTitle) results.pagesWithTitle++;
      if (hasMeta) results.pagesWithMeta++;
      results.avgAltTextCoverage += altCoverage;
      
    } catch (error) {
      console.log(`❌ ${filePath} 분석 실패: ${error.message}`);
    }
  });
  
  results.avgAltTextCoverage = Math.round((results.avgAltTextCoverage / htmlFiles.length) * 100);
  
  return results;
}

// 4. PWA 기능 확인
function analyzePWA() {
  console.log('\n📱 PWA FEATURES CHECK');
  console.log('----------------------');
  
  const checks = {
    hasManifest: false,
    hasServiceWorker: false,
    hasIcons: false,
    hasOfflinePage: false
  };
  
  try {
    // Manifest 확인
    const manifestStats = statSync('./manifest.json');
    checks.hasManifest = true;
    console.log(`✅ Manifest: ${Math.round(manifestStats.size / 1024)} KB`);
  } catch {
    console.log('❌ Manifest 없음');
  }
  
  try {
    // Service Worker 확인
    const swStats = statSync('./sw.js');
    checks.hasServiceWorker = true;
    console.log(`✅ Service Worker: ${Math.round(swStats.size / 1024)} KB`);
  } catch {
    console.log('❌ Service Worker 없음');
  }
  
  try {
    // 아이콘 확인
    const iconCount = countFiles('./images', '.png');
    checks.hasIcons = iconCount > 0;
    console.log(`✅ PWA 아이콘: ${iconCount}개`);
  } catch {
    console.log('❌ PWA 아이콘 없음');
  }
  
  try {
    // 오프라인 페이지 확인
    statSync('./offline.html');
    checks.hasOfflinePage = true;
    console.log('✅ 오프라인 페이지 있음');
  } catch {
    console.log('❌ 오프라인 페이지 없음');
  }
  
  return checks;
}

// 5. 성능 최적화 요소 확인
function analyzePerformanceOptimizations() {
  console.log('\n⚡ PERFORMANCE OPTIMIZATIONS');
  console.log('-----------------------------');
  
  const optimizations = {
    hasCSPHeaders: false,
    hasCacheHeaders: false,
    hasCompression: false,
    hasPreload: false,
    hasCriticalCSS: false
  };
  
  try {
    // CSP 헤더 확인 (vercel.json)
    const vercelConfig = readFileSync('./vercel.json', 'utf-8');
    optimizations.hasCSPHeaders = vercelConfig.includes('Content-Security-Policy');
    console.log(`CSP 헤더: ${optimizations.hasCSPHeaders ? '✅' : '❌'}`);
  } catch {
    console.log('CSP 헤더: ❌');
  }
  
  try {
    // 캐시 헤더 확인 (_headers)
    const headersConfig = readFileSync('./_headers', 'utf-8');
    optimizations.hasCacheHeaders = headersConfig.includes('Cache-Control');
    console.log(`캐시 헤더: ${optimizations.hasCacheHeaders ? '✅' : '❌'}`);
  } catch {
    console.log('캐시 헤더: ❌');
  }
  
  try {
    // 압축 확인 (minified 파일)
    statSync('./css/main.min.css');
    optimizations.hasCompression = true;
    console.log('파일 압축: ✅');
  } catch {
    console.log('파일 압축: ❌');
  }
  
  try {
    // Preload 확인
    const indexContent = readFileSync('./index.html', 'utf-8');
    optimizations.hasPreload = indexContent.includes('rel="preload"');
    console.log(`리소스 Preload: ${optimizations.hasPreload ? '✅' : '❌'}`);
  } catch {
    console.log('리소스 Preload: ❌');
  }
  
  return optimizations;
}

// 유틸리티 함수
function countFiles(dir, extensions) {
  try {
    const files = readdirSync(dir, { recursive: true });
    if (Array.isArray(extensions)) {
      return files.filter(file => 
        extensions.some(ext => file.toString().endsWith(ext))
      ).length;
    }
    return files.filter(file => file.toString().endsWith(extensions)).length;
  } catch {
    return 0;
  }
}

// 전체 평가 함수
function generateOverallAssessment(bundleData, imageData, accessibilityData, pwaData, perfData) {
  console.log('\n🎯 OVERALL ASSESSMENT');
  console.log('=====================');
  
  let score = 100;
  const issues = [];
  const recommendations = [];
  
  // 번들 크기 평가
  if (bundleData && bundleData.cssProdSize > 100 * 1024) { // 100KB 초과
    score -= 10;
    issues.push('CSS 번들이 100KB를 초과함');
    recommendations.push('불필요한 CSS 규칙 제거 및 트리 쉐이킹 적용');
  }
  
  // 이미지 최적화 평가
  if (imageData && imageData.optimizationRatio < 0.8) { // 80% 미만
    score -= 15;
    issues.push('이미지 최적화율이 80% 미만');
    recommendations.push('WebP/AVIF 형식으로 더 많은 이미지 변환');
  }
  
  // 접근성 평가
  if (accessibilityData.avgAltTextCoverage < 90) {
    score -= 10;
    issues.push('이미지 Alt 텍스트 커버리지가 90% 미만');
    recommendations.push('모든 이미지에 적절한 Alt 텍스트 추가');
  }
  
  if (accessibilityData.pagesWithLang < accessibilityData.totalPages) {
    score -= 5;
    issues.push('일부 페이지에 lang 속성 누락');
    recommendations.push('모든 HTML 페이지에 lang="ko" 속성 추가');
  }
  
  // PWA 평가
  const pwaFeatures = Object.values(pwaData).filter(Boolean).length;
  if (pwaFeatures < 3) {
    score -= 10;
    issues.push('PWA 기능이 부족함');
    recommendations.push('Manifest, Service Worker, 아이콘 등 PWA 필수 요소 보완');
  }
  
  // 성능 최적화 평가
  const perfFeatures = Object.values(perfData).filter(Boolean).length;
  if (perfFeatures < 3) {
    score -= 10;
    issues.push('성능 최적화 요소 부족');
    recommendations.push('CSP, 캐싱, 압축 등 성능 최적화 요소 추가');
  }
  
  console.log(`전체 점수: ${score}/100`);
  console.log(`등급: ${getGrade(score)}`);
  
  if (issues.length > 0) {
    console.log('\n🔴 발견된 문제점:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  if (recommendations.length > 0) {
    console.log('\n💡 개선 권장사항:');
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }
  
  return { score, grade: getGrade(score), issues, recommendations };
}

function getGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  return 'D';
}

// 메인 실행
async function main() {
  const bundleData = analyzeBundleSize();
  const imageData = analyzeImageOptimization();
  const accessibilityData = analyzeAccessibility();
  const pwaData = analyzePWA();
  const perfData = analyzePerformanceOptimizations();
  
  const assessment = generateOverallAssessment(
    bundleData, imageData, accessibilityData, pwaData, perfData
  );
  
  console.log('\n================================================');
  console.log(`🎯 FINAL RESULT: ${assessment.grade} (${assessment.score}/100)`);
  console.log('================================================\n');
  
  // 결과를 JSON 파일로 저장
  const report = {
    timestamp: new Date().toISOString(),
    score: assessment.score,
    grade: assessment.grade,
    bundle: bundleData,
    images: imageData,
    accessibility: accessibilityData,
    pwa: pwaData,
    performance: perfData,
    issues: assessment.issues,
    recommendations: assessment.recommendations
  };
  
  require('fs').writeFileSync(
    `performance-analysis-${Date.now()}.json`,
    JSON.stringify(report, null, 2)
  );
  
  console.log('📊 상세 리포트가 JSON 파일로 저장되었습니다.');
}

if (require.main === module) {
  main().catch(console.error);
}