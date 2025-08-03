/**
 * 모바일 성능 분석 도구
 * CSS, JS 번들 크기, 이미지 최적화, 모바일 사용성 등을 분석합니다.
 */

import fs from 'fs';
import path from 'path';

console.log('📱 모바일 성능 분석 시작 - doha.kr');
console.log('==================================\n');

// 파일 크기 계산 (KB)
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return Math.round((stats.size / 1024) * 100) / 100; // KB, 소수점 2자리
  } catch {
    return 0;
  }
}

// CSS 번들 분석
function analyzeCSSBundle() {
  console.log('🎨 CSS 번들 분석:');

  const cssFiles = [
    'dist/styles.min.css', // 번들된 CSS
    'css/main.css', // 메인 CSS
    'css/mobile-optimizations.css', // 모바일 최적화 CSS
  ];

  let totalSize = 0;
  let existingFiles = 0;

  cssFiles.forEach((file) => {
    const size = getFileSize(file);
    if (size > 0) {
      console.log(`  📄 ${file}: ${size}KB`);
      totalSize += size;
      existingFiles++;
    } else {
      console.log(`  ❌ ${file}: 파일 없음`);
    }
  });

  console.log(`  📊 총 CSS 크기: ${totalSize}KB`);

  // CSS 성능 분석
  const recommendations = [];
  if (totalSize > 150) {
    recommendations.push('CSS 번들 크기가 큽니다 (권장: <150KB)');
  }
  if (totalSize > 50 && !fs.existsSync('dist/styles.min.css')) {
    recommendations.push('CSS 번들링 및 minification 필요');
  }

  return { totalSize, existingFiles, recommendations };
}

// JavaScript 번들 분석
function analyzeJSBundle() {
  console.log('\n💻 JavaScript 번들 분석:');

  const jsFiles = [
    'js/app.js',
    'js/core/common-init.js',
    'js/main.js',
    'dist/bundle.min.js', // 번들된 JS (있다면)
  ];

  let totalSize = 0;
  let existingFiles = 0;

  jsFiles.forEach((file) => {
    const size = getFileSize(file);
    if (size > 0) {
      console.log(`  📄 ${file}: ${size}KB`);
      totalSize += size;
      existingFiles++;
    } else {
      console.log(`  ❌ ${file}: 파일 없음`);
    }
  });

  console.log(`  📊 총 JS 크기: ${totalSize}KB`);

  // JS 성능 분석
  const recommendations = [];
  if (totalSize > 200) {
    recommendations.push('JavaScript 번들 크기가 큽니다 (권장: <200KB)');
  }
  if (existingFiles > 3) {
    recommendations.push('JavaScript 파일 번들링으로 HTTP 요청 수 줄이기');
  }

  return { totalSize, existingFiles, recommendations };
}

// 이미지 최적화 분석
function analyzeImages() {
  console.log('\n🖼️ 이미지 최적화 분석:');

  const imageDir = 'images';
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

  let totalSize = 0;
  let imageCount = 0;
  let largeImages = [];

  try {
    const files = fs.readdirSync(imageDir, { recursive: true });

    files.forEach((file) => {
      const filePath = path.join(imageDir, file);
      const ext = path.extname(file).toLowerCase();

      if (imageExtensions.includes(ext)) {
        const size = getFileSize(filePath);
        if (size > 0) {
          totalSize += size;
          imageCount++;

          if (size > 100) {
            // 100KB 이상의 큰 이미지
            largeImages.push({ file: filePath, size });
          }

          if (size > 10) {
            // 10KB 이상만 표시
            console.log(`  📷 ${filePath}: ${size}KB`);
          }
        }
      }
    });

    console.log(`  📊 총 이미지: ${imageCount}개, ${totalSize}KB`);

    if (largeImages.length > 0) {
      console.log('  ⚠️ 큰 이미지 파일 (>100KB):');
      largeImages.forEach((img) => {
        console.log(`    • ${img.file}: ${img.size}KB`);
      });
    }
  } catch (error) {
    console.log(`  ❌ 이미지 분석 실패: ${error.message}`);
  }

  return { totalSize, imageCount, largeImages };
}

// 모바일 사용성 분석
function analyzeMobileUsability() {
  console.log('\n📱 모바일 사용성 분석:');

  try {
    // 모바일 최적화 CSS 확인
    const mobileCSS = fs.existsSync('css/mobile-optimizations.css');
    console.log(`  ${mobileCSS ? '✅' : '❌'} 모바일 최적화 CSS`);

    // 터치 친화적 크기 확인 (CSS에서)
    let hasTouchFriendly = false;
    if (mobileCSS) {
      const content = fs.readFileSync('css/mobile-optimizations.css', 'utf8');
      hasTouchFriendly =
        content.includes('44px') || content.includes('48px') || content.includes('touch');
    }
    console.log(`  ${hasTouchFriendly ? '✅' : '❌'} 터치 친화적 크기 (44px+)`);

    // Viewport 메타 태그 확인
    const hasViewport =
      fs.existsSync('index.html') && fs.readFileSync('index.html', 'utf8').includes('viewport');
    console.log(`  ${hasViewport ? '✅' : '❌'} Viewport 메타 태그`);

    // 모바일 네비게이션 확인
    const hasMobileMenu =
      fs.existsSync('js/core/mobile-menu.js') || fs.existsSync('css/components/mobile-menu.css');
    console.log(`  ${hasMobileMenu ? '✅' : '❌'} 모바일 네비게이션`);

    // 한글 최적화 확인
    const hasKoreanOptimization = fs.existsSync('css/korean-optimization.css');
    console.log(`  ${hasKoreanOptimization ? '✅' : '❌'} 한글 최적화`);

    return {
      mobileCSS,
      hasTouchFriendly,
      hasViewport,
      hasMobileMenu,
      hasKoreanOptimization,
    };
  } catch (error) {
    console.log(`  ❌ 모바일 사용성 분석 실패: ${error.message}`);
    return {};
  }
}

// 성능 점수 계산
function calculatePerformanceScore(cssAnalysis, jsAnalysis, imageAnalysis, usabilityAnalysis) {
  console.log('\n🏆 모바일 성능 점수 계산:');

  let score = 0;
  let maxScore = 100;

  // CSS 최적화 (25점)
  let cssScore = 25;
  if (cssAnalysis.totalSize > 150) cssScore -= 10;
  if (cssAnalysis.totalSize > 250) cssScore -= 10;
  if (!fs.existsSync('dist/styles.min.css')) cssScore -= 5;
  cssScore = Math.max(cssScore, 0);
  score += cssScore;

  // JavaScript 최적화 (25점)
  let jsScore = 25;
  if (jsAnalysis.totalSize > 200) jsScore -= 10;
  if (jsAnalysis.totalSize > 400) jsScore -= 10;
  if (jsAnalysis.existingFiles > 5) jsScore -= 5;
  jsScore = Math.max(jsScore, 0);
  score += jsScore;

  // 이미지 최적화 (25점)
  let imageScore = 25;
  if (imageAnalysis.largeImages.length > 5) imageScore -= 10;
  if (imageAnalysis.totalSize > 2000) imageScore -= 10; // 2MB 이상
  if (imageAnalysis.largeImages.length > 10) imageScore -= 5;
  imageScore = Math.max(imageScore, 0);
  score += imageScore;

  // 모바일 사용성 (25점)
  const usabilityFeatures = Object.values(usabilityAnalysis).filter(Boolean).length;
  const usabilityScore = Math.round((usabilityFeatures / 5) * 25);
  score += usabilityScore;

  console.log(`  🎨 CSS 최적화: ${cssScore}/25점`);
  console.log(`  💻 JavaScript 최적화: ${jsScore}/25점`);
  console.log(`  🖼️ 이미지 최적화: ${imageScore}/25점`);
  console.log(`  📱 모바일 사용성: ${usabilityScore}/25점`);
  console.log(`  🎯 총점: ${score}/${maxScore}점 (${score}%)`);

  return {
    total: score,
    breakdown: {
      css: cssScore,
      js: jsScore,
      images: imageScore,
      usability: usabilityScore,
    },
  };
}

// 개선 권장사항 생성
function generatePerformanceRecommendations(cssAnalysis, jsAnalysis, imageAnalysis, score) {
  console.log('\n💡 성능 개선 권장사항:');

  const recommendations = [];

  // 우선순위 HIGH (60% 미만인 경우)
  if (score.total < 60) {
    console.log('\n🔴 HIGH 우선순위:');

    if (score.breakdown.css < 20) {
      recommendations.push('CSS 번들링 및 minification 구현');
      console.log('  • CSS 번들링 및 minification 구현');
    }

    if (score.breakdown.js < 20) {
      recommendations.push('JavaScript 번들링 및 코드 스플리팅');
      console.log('  • JavaScript 번들링 및 코드 스플리팅');
    }

    if (imageAnalysis.largeImages.length > 5) {
      recommendations.push('큰 이미지 파일 최적화 (WebP 변환, 압축)');
      console.log('  • 큰 이미지 파일 최적화 (WebP 변환, 압축)');
    }
  }

  // 우선순위 MEDIUM (60-80% 범위)
  if (score.total >= 60 && score.total < 80) {
    console.log('\n🟡 MEDIUM 우선순위:');

    if (cssAnalysis.totalSize > 100) {
      recommendations.push('CSS 크기 추가 최적화');
      console.log('  • CSS 크기 추가 최적화');
    }

    if (jsAnalysis.existingFiles > 3) {
      recommendations.push('JavaScript 파일 수 줄이기 (번들링)');
      console.log('  • JavaScript 파일 수 줄이기 (번들링)');
    }

    if (score.breakdown.usability < 20) {
      recommendations.push('모바일 사용성 개선');
      console.log('  • 터치 친화적 버튼 크기 조정');
      console.log('  • 모바일 네비게이션 개선');
    }
  }

  // 우선순위 LOW (80% 이상)
  if (score.total >= 80) {
    console.log('\n🟢 LOW 우선순위 (미세 조정):');
    console.log('  • 이미지 lazy loading 구현');
    console.log('  • 폰트 로딩 최적화');
    console.log('  • Service Worker 캐시 전략 세부 조정');
  }

  if (score.total >= 90) {
    console.log('\n🎉 성능이 매우 우수합니다!');
    console.log('  • 현재 상태를 유지하세요');
    console.log('  • 정기적인 성능 모니터링 권장');
  }

  return recommendations;
}

// 메인 분석 실행
async function runMobilePerformanceAnalysis() {
  const cssAnalysis = analyzeCSSBundle();
  const jsAnalysis = analyzeJSBundle();
  const imageAnalysis = analyzeImages();
  const usabilityAnalysis = analyzeMobileUsability();

  const score = calculatePerformanceScore(
    cssAnalysis,
    jsAnalysis,
    imageAnalysis,
    usabilityAnalysis
  );
  const recommendations = generatePerformanceRecommendations(
    cssAnalysis,
    jsAnalysis,
    imageAnalysis,
    score
  );

  console.log('\n📊 모바일 성능 요약:');
  console.log(`  현재 성능 점수: ${score.total}%`);
  console.log(`  목표 달성 여부: ${score.total >= 60 ? '✅ 달성' : '❌ 미달성'} (목표: 60%+)`);
  console.log(`  개선 권장사항: ${recommendations.length}개`);

  console.log('\n✅ 모바일 성능 분석 완료');

  return {
    cssAnalysis,
    jsAnalysis,
    imageAnalysis,
    usabilityAnalysis,
    score,
    recommendations,
  };
}

// 스크립트 실행
runMobilePerformanceAnalysis().catch(console.error);
