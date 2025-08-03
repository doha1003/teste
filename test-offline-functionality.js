/**
 * 오프라인 기능 테스트 도구
 * 서비스 워커, 캐시 전략, 오프라인 페이지 등을 검증합니다.
 */

import fs from 'fs';

console.log('🔌 오프라인 기능 테스트 시작');
console.log('==============================\n');

// 서비스 워커 구성 분석
function analyzeServiceWorker() {
  console.log('⚙️ 서비스 워커 상세 분석:');

  try {
    const swContent = fs.readFileSync('sw.js', 'utf8');

    // 캐시 이름과 버전 확인
    const versionMatch = swContent.match(/SW_VERSION\s*=\s*['"`]([^'"`]+)['"`]/);
    const version = versionMatch ? versionMatch[1] : 'Unknown';
    console.log(`  📋 서비스 워커 버전: ${version}`);

    // 캐시 전략 분석
    const cacheNames = [];
    const cacheMatches = swContent.match(/const\s+(\w*CACHE\w*)\s*=/g);
    if (cacheMatches) {
      cacheMatches.forEach((match) => {
        const name = match.match(/const\s+(\w+)/)[1];
        cacheNames.push(name);
      });
    }
    console.log(`  💾 정의된 캐시: ${cacheNames.join(', ')}`);

    // 캐싱 전략 확인
    const strategies = {
      cacheFirst: swContent.includes('cacheFirst'),
      networkFirst: swContent.includes('networkFirst'),
      staleWhileRevalidate: swContent.includes('staleWhileRevalidate'),
    };

    console.log('  🎯 구현된 캐시 전략:');
    Object.entries(strategies).forEach(([strategy, implemented]) => {
      console.log(`    ${implemented ? '✅' : '❌'} ${strategy}`);
    });

    // 오프라인 지원 확인
    const offlineFeatures = {
      offlinePage: swContent.includes('offline.html') || swContent.includes('getOfflinePage'),
      apiCaching: swContent.includes('/api/'),
      backgroundSync: swContent.includes('sync'),
      updateNotification: swContent.includes('SW_UPDATED'),
    };

    console.log('  🌐 오프라인 기능:');
    Object.entries(offlineFeatures).forEach(([feature, implemented]) => {
      const labels = {
        offlinePage: '오프라인 페이지',
        apiCaching: 'API 캐싱',
        backgroundSync: '백그라운드 동기화',
        updateNotification: '업데이트 알림',
      };
      console.log(`    ${implemented ? '✅' : '❌'} ${labels[feature]}`);
    });

    return {
      version,
      strategies,
      offlineFeatures,
      cacheNames,
    };
  } catch (error) {
    console.log(`  ❌ 서비스 워커 분석 실패: ${error.message}`);
    return null;
  }
}

// 오프라인 페이지 분석
function analyzeOfflinePage() {
  console.log('\n📄 오프라인 페이지 분석:');

  try {
    const offlineContent = fs.readFileSync('offline.html', 'utf8');

    // 필수 메타 태그 확인
    const hasViewport = offlineContent.includes('viewport');
    const hasCharset = offlineContent.includes('charset');
    const hasCSP = offlineContent.includes('Content-Security-Policy');

    console.log('  📱 메타 태그:');
    console.log(`    ${hasViewport ? '✅' : '❌'} Viewport 설정`);
    console.log(`    ${hasCharset ? '✅' : '❌'} Charset 설정`);
    console.log(`    ${hasCSP ? '✅' : '❌'} CSP 헤더`);

    // UI 요소 확인
    const hasRetryButton = offlineContent.includes('retry') || offlineContent.includes('다시 시도');
    const hasHomeButton = offlineContent.includes('home') || offlineContent.includes('홈');
    const hasConnectionStatus = offlineContent.includes('connection-status');

    console.log('  🎨 UI 요소:');
    console.log(`    ${hasRetryButton ? '✅' : '❌'} 재시도 버튼`);
    console.log(`    ${hasHomeButton ? '✅' : '❌'} 홈 버튼`);
    console.log(`    ${hasConnectionStatus ? '✅' : '❌'} 연결 상태 표시`);

    // 인라인 CSS 확인
    const hasInlineCSS = offlineContent.includes('<style>');
    const hasExternalCSS = offlineContent.includes('.css');

    console.log('  🎨 스타일링:');
    console.log(`    ${hasInlineCSS ? '✅' : '❌'} 인라인 CSS (오프라인 보장)`);
    console.log(`    ${hasExternalCSS ? '✅' : '❌'} 외부 CSS`);

    // 접근성 확인
    const hasAltText = offlineContent.includes('alt=');
    const hasAriaLabels = offlineContent.includes('aria-');
    const hasSemanticHTML =
      offlineContent.includes('<main>') || offlineContent.includes('<section>');

    console.log('  ♿ 접근성:');
    console.log(`    ${hasAltText ? '✅' : '❌'} 이미지 대체 텍스트`);
    console.log(`    ${hasAriaLabels ? '✅' : '❌'} ARIA 레이블`);
    console.log(`    ${hasSemanticHTML ? '✅' : '❌'} 시맨틱 HTML`);

    return {
      metaTags: { hasViewport, hasCharset, hasCSP },
      uiElements: { hasRetryButton, hasHomeButton, hasConnectionStatus },
      styling: { hasInlineCSS, hasExternalCSS },
      accessibility: { hasAltText, hasAriaLabels, hasSemanticHTML },
    };
  } catch (error) {
    console.log(`  ❌ 오프라인 페이지 분석 실패: ${error.message}`);
    return null;
  }
}

// 핵심 자산 캐시 대상 분석
function analyzeCacheTargets() {
  console.log('\n🎯 캐시 대상 분석:');

  try {
    const swContent = fs.readFileSync('sw.js', 'utf8');

    // CRITICAL_ASSETS 추출
    const criticalAssetsMatch = swContent.match(/CRITICAL_ASSETS\s*=\s*\[([\s\S]*?)\]/);
    if (criticalAssetsMatch) {
      const assetsText = criticalAssetsMatch[1];
      const assets = assetsText.match(/'([^']+)'/g) || [];
      const assetPaths = assets.map((asset) => asset.replace(/'/g, ''));

      console.log('  📦 핵심 자산 목록:');
      assetPaths.forEach((asset) => {
        const exists = fs.existsSync(asset.startsWith('/') ? asset.slice(1) : asset);
        console.log(`    ${exists ? '✅' : '❌'} ${asset}`);
      });

      const existingAssets = assetPaths.filter((asset) => {
        const path = asset.startsWith('/') ? asset.slice(1) : asset;
        return fs.existsSync(path);
      });

      console.log(`  📊 결과: ${existingAssets.length}/${assetPaths.length} 자산 존재`);

      return {
        total: assetPaths.length,
        existing: existingAssets.length,
        missing: assetPaths.filter((asset) => {
          const path = asset.startsWith('/') ? asset.slice(1) : asset;
          return !fs.existsSync(path);
        }),
      };
    } else {
      console.log('  ❌ CRITICAL_ASSETS 정의를 찾을 수 없음');
      return null;
    }
  } catch (error) {
    console.log(`  ❌ 캐시 대상 분석 실패: ${error.message}`);
    return null;
  }
}

// 오프라인 성능 점수 계산
function calculateOfflineScore(swAnalysis, offlineAnalysis, cacheAnalysis) {
  console.log('\n🏆 오프라인 기능 점수:');

  let score = 0;
  let maxScore = 0;

  // 서비스 워커 기본 기능 (40점)
  if (swAnalysis) {
    const swScore =
      Object.values(swAnalysis.strategies).filter(Boolean).length * 8 +
      Object.values(swAnalysis.offlineFeatures).filter(Boolean).length * 4;
    score += Math.min(swScore, 40);
    maxScore += 40;
    console.log(`  ⚙️ 서비스 워커: ${Math.min(swScore, 40)}/40점`);
  }

  // 오프라인 페이지 (30점)
  if (offlineAnalysis) {
    const pageScore =
      Object.values(offlineAnalysis.metaTags).filter(Boolean).length * 3 +
      Object.values(offlineAnalysis.uiElements).filter(Boolean).length * 5 +
      Object.values(offlineAnalysis.styling).filter(Boolean).length * 3 +
      Object.values(offlineAnalysis.accessibility).filter(Boolean).length * 2;
    score += Math.min(pageScore, 30);
    maxScore += 30;
    console.log(`  📄 오프라인 페이지: ${Math.min(pageScore, 30)}/30점`);
  }

  // 캐시 커버리지 (30점)
  if (cacheAnalysis) {
    const cacheScore = Math.round((cacheAnalysis.existing / cacheAnalysis.total) * 30);
    score += cacheScore;
    maxScore += 30;
    console.log(`  💾 캐시 커버리지: ${cacheScore}/30점`);
  }

  const percentage = Math.round((score / maxScore) * 100);
  console.log(`\n  🎯 총 오프라인 점수: ${score}/${maxScore}점 (${percentage}%)`);

  return { score, maxScore, percentage };
}

// 개선 권장사항
function generateOfflineRecommendations(swAnalysis, offlineAnalysis, cacheAnalysis) {
  console.log('\n💡 오프라인 기능 개선 권장사항:');

  const recommendations = [];

  // 서비스 워커 개선사항
  if (swAnalysis) {
    if (!swAnalysis.strategies.cacheFirst) {
      recommendations.push('정적 자산용 Cache First 전략 구현');
    }
    if (!swAnalysis.strategies.networkFirst) {
      recommendations.push('HTML 페이지용 Network First 전략 구현');
    }
    if (!swAnalysis.offlineFeatures.backgroundSync) {
      recommendations.push('백그라운드 동기화 기능 추가');
    }
  }

  // 오프라인 페이지 개선사항
  if (offlineAnalysis) {
    if (!offlineAnalysis.styling.hasInlineCSS) {
      recommendations.push('오프라인 페이지에 인라인 CSS 추가 (외부 CSS 의존성 제거)');
    }
    if (!offlineAnalysis.accessibility.hasAriaLabels) {
      recommendations.push('오프라인 페이지 접근성 개선 (ARIA 레이블 추가)');
    }
  }

  // 캐시 커버리지 개선사항
  if (cacheAnalysis && cacheAnalysis.missing.length > 0) {
    recommendations.push('누락된 핵심 자산 파일 생성:');
    cacheAnalysis.missing.forEach((asset) => {
      console.log(`    • ${asset}`);
    });
  }

  if (recommendations.length === 0) {
    console.log('  🎉 오프라인 기능이 완벽하게 구현되었습니다!');
  } else {
    recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  return recommendations;
}

// 메인 테스트 실행
async function runOfflineTest() {
  const swAnalysis = analyzeServiceWorker();
  const offlineAnalysis = analyzeOfflinePage();
  const cacheAnalysis = analyzeCacheTargets();

  const score = calculateOfflineScore(swAnalysis, offlineAnalysis, cacheAnalysis);
  const recommendations = generateOfflineRecommendations(
    swAnalysis,
    offlineAnalysis,
    cacheAnalysis
  );

  console.log('\n✅ 오프라인 기능 테스트 완료');

  return {
    swAnalysis,
    offlineAnalysis,
    cacheAnalysis,
    score,
    recommendations,
  };
}

// 스크립트 실행
runOfflineTest().catch(console.error);
