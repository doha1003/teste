/**
 * 모바일 사용성 개선 분석 도구
 * UX/UI, 접근성, 한글 최적화, 터치 인터페이스 등을 종합 분석합니다.
 */

import fs from 'fs';
import path from 'path';

console.log('📱 모바일 사용성 분석 시작 - doha.kr');
console.log('====================================\n');

// 한글 텍스트 최적화 분석
function analyzeKoreanOptimization() {
  console.log('🇰🇷 한글 최적화 분석:');

  try {
    const koreanCSS = fs.readFileSync('css/korean-optimization.css', 'utf8');

    // 주요 한글 최적화 요소 확인
    const optimizations = {
      wordBreak: koreanCSS.includes('word-break: keep-all'),
      lineHeight: koreanCSS.includes('line-height') && koreanCSS.includes('1.7'),
      fontFamily: koreanCSS.includes('Pretendard') || koreanCSS.includes('Noto Sans KR'),
      textOverflow: koreanCSS.includes('text-overflow'),
      whiteSpace: koreanCSS.includes('white-space'),
    };

    console.log(`  ${optimizations.wordBreak ? '✅' : '❌'} word-break: keep-all (한글 줄바꿈)`);
    console.log(`  ${optimizations.lineHeight ? '✅' : '❌'} line-height 최적화 (1.7)`);
    console.log(`  ${optimizations.fontFamily ? '✅' : '❌'} 한글 폰트 (Pretendard/Noto Sans KR)`);
    console.log(`  ${optimizations.textOverflow ? '✅' : '❌'} 텍스트 오버플로우 처리`);
    console.log(`  ${optimizations.whiteSpace ? '✅' : '❌'} 공백 처리 최적화`);

    const score = Object.values(optimizations).filter(Boolean).length;
    console.log(`  📊 한글 최적화 점수: ${score}/5`);

    return { optimizations, score };
  } catch (error) {
    console.log(`  ❌ 한글 최적화 CSS 분석 실패: ${error.message}`);
    return { optimizations: {}, score: 0 };
  }
}

// 터치 인터페이스 분석
function analyzeTouchInterface() {
  console.log('\n👆 터치 인터페이스 분석:');

  try {
    // 모바일 CSS에서 터치 관련 요소 확인
    const mobileCSS = fs.readFileSync('css/mobile-optimizations.css', 'utf8');

    const touchFeatures = {
      touchTargetSize: mobileCSS.includes('44px') || mobileCSS.includes('48px'),
      touchAction: mobileCSS.includes('touch-action'),
      tapHighlight: mobileCSS.includes('-webkit-tap-highlight-color'),
      userSelect: mobileCSS.includes('user-select'),
      touchCallout: mobileCSS.includes('-webkit-touch-callout'),
    };

    console.log(`  ${touchFeatures.touchTargetSize ? '✅' : '❌'} 터치 타겟 크기 (44px+)`);
    console.log(`  ${touchFeatures.touchAction ? '✅' : '❌'} 터치 액션 최적화`);
    console.log(`  ${touchFeatures.tapHighlight ? '✅' : '❌'} 탭 하이라이트 제거`);
    console.log(`  ${touchFeatures.userSelect ? '✅' : '❌'} 텍스트 선택 제어`);
    console.log(`  ${touchFeatures.touchCallout ? '✅' : '❌'} 터치 콜아웃 제어`);

    const score = Object.values(touchFeatures).filter(Boolean).length;
    console.log(`  📊 터치 인터페이스 점수: ${score}/5`);

    return { touchFeatures, score };
  } catch (error) {
    console.log(`  ❌ 터치 인터페이스 분석 실패: ${error.message}`);
    return { touchFeatures: {}, score: 0 };
  }
}

// 모바일 네비게이션 분석
function analyzeMobileNavigation() {
  console.log('\n🧭 모바일 네비게이션 분석:');

  try {
    const mobileMenuJS = fs.readFileSync('js/core/mobile-menu.js', 'utf8');
    const mobileMenuCSS = fs.readFileSync('css/components/mobile-menu.css', 'utf8');

    const navFeatures = {
      hamburgerMenu: mobileMenuCSS.includes('hamburger') || mobileMenuCSS.includes('menu-toggle'),
      overlay: mobileMenuCSS.includes('overlay') || mobileMenuCSS.includes('backdrop'),
      animations: mobileMenuCSS.includes('transition') || mobileMenuCSS.includes('transform'),
      closeButton: mobileMenuJS.includes('close') || mobileMenuJS.includes('hide'),
      keyboardSupport: mobileMenuJS.includes('keydown') || mobileMenuJS.includes('Escape'),
      swipeGesture: mobileMenuJS.includes('touch') || mobileMenuJS.includes('swipe'),
    };

    console.log(`  ${navFeatures.hamburgerMenu ? '✅' : '❌'} 햄버거 메뉴`);
    console.log(`  ${navFeatures.overlay ? '✅' : '❌'} 오버레이/배경`);
    console.log(`  ${navFeatures.animations ? '✅' : '❌'} 애니메이션`);
    console.log(`  ${navFeatures.closeButton ? '✅' : '❌'} 닫기 기능`);
    console.log(`  ${navFeatures.keyboardSupport ? '✅' : '❌'} 키보드 지원`);
    console.log(`  ${navFeatures.swipeGesture ? '✅' : '❌'} 스와이프 제스처`);

    const score = Object.values(navFeatures).filter(Boolean).length;
    console.log(`  📊 모바일 네비게이션 점수: ${score}/6`);

    return { navFeatures, score };
  } catch (error) {
    console.log(`  ❌ 모바일 네비게이션 분석 실패: ${error.message}`);
    return { navFeatures: {}, score: 0 };
  }
}

// 반응형 디자인 분석
function analyzeResponsiveDesign() {
  console.log('\n📐 반응형 디자인 분석:');

  try {
    // 주요 CSS 파일들에서 미디어 쿼리 확인
    const cssFiles = ['css/mobile-optimizations.css', 'css/main.css', 'dist/styles.min.css'];

    let mediaQueries = new Set();
    let hasFlexbox = false;
    let hasGrid = false;
    let hasContainerQueries = false;

    cssFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');

        // 미디어 쿼리 추출
        const queries = content.match(/@media[^{]+/g) || [];
        queries.forEach((query) => mediaQueries.add(query.trim()));

        // 현대적 레이아웃 기술 확인
        if (content.includes('display: flex') || content.includes('display:flex'))
          hasFlexbox = true;
        if (content.includes('display: grid') || content.includes('display:grid')) hasGrid = true;
        if (content.includes('@container')) hasContainerQueries = true;
      }
    });

    console.log(`  📱 미디어 쿼리 개수: ${mediaQueries.size}개`);
    console.log(`  ${hasFlexbox ? '✅' : '❌'} Flexbox 레이아웃`);
    console.log(`  ${hasGrid ? '✅' : '❌'} CSS Grid 레이아웃`);
    console.log(`  ${hasContainerQueries ? '✅' : '❌'} Container Queries`);

    // 주요 브레이크포인트 확인
    const commonBreakpoints = ['640px', '768px', '1024px', '1280px'];
    const foundBreakpoints = commonBreakpoints.filter((bp) =>
      Array.from(mediaQueries).some((query) => query.includes(bp))
    );

    console.log(`  📏 표준 브레이크포인트: ${foundBreakpoints.length}/4개`);
    if (foundBreakpoints.length > 0) {
      console.log(`    • ${foundBreakpoints.join(', ')}`);
    }

    const score =
      (mediaQueries.size > 3 ? 2 : mediaQueries.size > 0 ? 1 : 0) +
      (hasFlexbox ? 1 : 0) +
      (hasGrid ? 1 : 0) +
      (foundBreakpoints.length >= 3 ? 1 : foundBreakpoints.length >= 1 ? 0.5 : 0);

    console.log(`  📊 반응형 디자인 점수: ${Math.round(score * 2)}/10`);

    return {
      mediaQueries: Array.from(mediaQueries),
      hasFlexbox,
      hasGrid,
      hasContainerQueries,
      foundBreakpoints,
      score: Math.round(score * 2),
    };
  } catch (error) {
    console.log(`  ❌ 반응형 디자인 분석 실패: ${error.message}`);
    return { score: 0 };
  }
}

// 접근성 분석
function analyzeAccessibility() {
  console.log('\n♿ 접근성 분석:');

  try {
    // HTML 파일들에서 접근성 요소 확인
    const htmlFiles = ['index.html', 'offline.html'];

    let accessibilityFeatures = {
      altTags: false,
      ariaLabels: false,
      semanticHTML: false,
      skipLinks: false,
      focusManagement: false,
      colorContrast: false,
    };

    htmlFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');

        if (content.includes('alt=')) accessibilityFeatures.altTags = true;
        if (content.includes('aria-')) accessibilityFeatures.ariaLabels = true;
        if (
          content.includes('<main>') ||
          content.includes('<section>') ||
          content.includes('<nav>')
        ) {
          accessibilityFeatures.semanticHTML = true;
        }
        if (content.includes('skip') && content.includes('content'))
          accessibilityFeatures.skipLinks = true;
      }
    });

    // CSS에서 포커스 관리 확인
    const cssFiles = ['css/main.css', 'dist/styles.min.css'];
    cssFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes(':focus') || content.includes('focus-visible')) {
          accessibilityFeatures.focusManagement = true;
        }
        if (content.includes('contrast') || content.includes('color-contrast')) {
          accessibilityFeatures.colorContrast = true;
        }
      }
    });

    console.log(`  ${accessibilityFeatures.altTags ? '✅' : '❌'} 이미지 대체 텍스트`);
    console.log(`  ${accessibilityFeatures.ariaLabels ? '✅' : '❌'} ARIA 레이블`);
    console.log(`  ${accessibilityFeatures.semanticHTML ? '✅' : '❌'} 시맨틱 HTML`);
    console.log(`  ${accessibilityFeatures.skipLinks ? '✅' : '❌'} 스킵 링크`);
    console.log(`  ${accessibilityFeatures.focusManagement ? '✅' : '❌'} 포커스 관리`);
    console.log(`  ${accessibilityFeatures.colorContrast ? '✅' : '❌'} 색상 대비 고려`);

    const score = Object.values(accessibilityFeatures).filter(Boolean).length;
    console.log(`  📊 접근성 점수: ${score}/6`);

    return { accessibilityFeatures, score };
  } catch (error) {
    console.log(`  ❌ 접근성 분석 실패: ${error.message}`);
    return { accessibilityFeatures: {}, score: 0 };
  }
}

// 전체 사용성 점수 계산
function calculateUsabilityScore(korean, touch, navigation, responsive, accessibility) {
  console.log('\n🎯 모바일 사용성 종합 점수:');

  const maxScores = {
    korean: 5,
    touch: 5,
    navigation: 6,
    responsive: 10,
    accessibility: 6,
  };

  const normalizedScores = {
    korean: Math.round((korean.score / maxScores.korean) * 20),
    touch: Math.round((touch.score / maxScores.touch) * 20),
    navigation: Math.round((navigation.score / maxScores.navigation) * 20),
    responsive: Math.round((responsive.score / maxScores.responsive) * 20),
    accessibility: Math.round((accessibility.score / maxScores.accessibility) * 20),
  };

  const totalScore = Object.values(normalizedScores).reduce((a, b) => a + b, 0) / 5;

  console.log(`  🇰🇷 한글 최적화: ${normalizedScores.korean}/20점`);
  console.log(`  👆 터치 인터페이스: ${normalizedScores.touch}/20점`);
  console.log(`  🧭 모바일 네비게이션: ${normalizedScores.navigation}/20점`);
  console.log(`  📐 반응형 디자인: ${normalizedScores.responsive}/20점`);
  console.log(`  ♿ 접근성: ${normalizedScores.accessibility}/20점`);
  console.log(`  🏆 총 사용성 점수: ${Math.round(totalScore)}/100점 (${Math.round(totalScore)}%)`);

  return {
    breakdown: normalizedScores,
    total: Math.round(totalScore),
  };
}

// 개선 권장사항 생성
function generateUsabilityRecommendations(
  korean,
  touch,
  navigation,
  responsive,
  accessibility,
  score
) {
  console.log('\n💡 모바일 사용성 개선 권장사항:');

  const recommendations = [];

  // 우선순위 HIGH (80% 미만)
  if (score.total < 80) {
    console.log('\n🔴 HIGH 우선순위:');

    if (score.breakdown.korean < 16) {
      console.log('  • 한글 텍스트 최적화 강화');
      console.log('    - word-break: keep-all 적용');
      console.log('    - line-height 1.7 설정');
      recommendations.push('한글 텍스트 최적화');
    }

    if (score.breakdown.touch < 16) {
      console.log('  • 터치 인터페이스 개선');
      console.log('    - 버튼 크기 44px 이상으로 확대');
      console.log('    - 터치 피드백 개선');
      recommendations.push('터치 인터페이스 개선');
    }

    if (score.breakdown.accessibility < 16) {
      console.log('  • 접근성 개선');
      console.log('    - ARIA 레이블 추가');
      console.log('    - 포커스 관리 개선');
      console.log('    - 색상 대비 향상');
      recommendations.push('접근성 개선');
    }
  }

  // 우선순위 MEDIUM (80-90% 범위)
  if (score.total >= 80 && score.total < 90) {
    console.log('\n🟡 MEDIUM 우선순위:');

    if (score.breakdown.navigation < 18) {
      console.log('  • 모바일 네비게이션 세부 개선');
      console.log('    - 스와이프 제스처 추가');
      console.log('    - 키보드 네비게이션 강화');
      recommendations.push('모바일 네비게이션 개선');
    }

    if (score.breakdown.responsive < 18) {
      console.log('  • 반응형 디자인 세부 조정');
      console.log('    - 추가 브레이크포인트 고려');
      console.log('    - Container Queries 활용');
      recommendations.push('반응형 디자인 개선');
    }
  }

  // 우선순위 LOW (90% 이상)
  if (score.total >= 90) {
    console.log('\n🟢 LOW 우선순위 (고급 최적화):');
    console.log('  • 고급 터치 제스처 구현');
    console.log('  • 다크모드 접근성 최적화');
    console.log('  • 마이크로 인터랙션 추가');
    console.log('  • 성능 모니터링 구현');
  }

  if (score.total >= 95) {
    console.log('\n🎉 모바일 사용성이 매우 우수합니다!');
    console.log('  • 현재 수준을 유지하세요');
    console.log('  • 사용자 피드백을 통한 지속적 개선');
  }

  return recommendations;
}

// 메인 분석 실행
async function runMobileUsabilityAnalysis() {
  const korean = analyzeKoreanOptimization();
  const touch = analyzeTouchInterface();
  const navigation = analyzeMobileNavigation();
  const responsive = analyzeResponsiveDesign();
  const accessibility = analyzeAccessibility();

  const score = calculateUsabilityScore(korean, touch, navigation, responsive, accessibility);
  const recommendations = generateUsabilityRecommendations(
    korean,
    touch,
    navigation,
    responsive,
    accessibility,
    score
  );

  console.log('\n📊 모바일 사용성 요약:');
  console.log(`  현재 사용성 점수: ${score.total}%`);
  console.log(`  목표 달성 여부: ${score.total >= 80 ? '✅ 달성' : '❌ 미달성'} (목표: 80%+)`);
  console.log(`  개선 권장사항: ${recommendations.length}개`);

  console.log('\n✅ 모바일 사용성 분석 완료');

  return {
    korean,
    touch,
    navigation,
    responsive,
    accessibility,
    score,
    recommendations,
  };
}

// 스크립트 실행
runMobileUsabilityAnalysis().catch(console.error);
