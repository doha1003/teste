/**
 * PWA 기능 검증 도구 - doha.kr
 * manifest.json, 서비스 워커, 아이콘 세트 등을 검증합니다.
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 PWA 기능 검증 시작 - doha.kr');
console.log('=====================================\n');

// 필수 PWA 파일들
const requiredFiles = ['manifest.json', 'sw.js', 'offline.html'];

// 아이콘 파일들
const iconFiles = [
  'images/icon-48x48.png',
  'images/icon-72x72.png',
  'images/icon-96x96.png',
  'images/icon-128x128.png',
  'images/icon-144x144.png',
  'images/icon-152x152.png',
  'images/icon-192x192.png',
  'images/icon-384x384.png',
  'images/icon-512x512.png',
  'images/icon-maskable-192x192.png',
  'images/icon-maskable-512x512.png',
];

// 스크린샷 파일들
const screenshotFiles = [
  'images/screenshots/mobile-home.png',
  'images/screenshots/mobile-tests.png',
  'images/screenshots/mobile-tools.png',
  'images/screenshots/desktop-home.png',
  'images/screenshots/desktop-mbti.png',
];

// Shortcut 아이콘들
const shortcutFiles = [
  'images/shortcuts/mbti-icon.png',
  'images/shortcuts/teto-icon.png',
  'images/shortcuts/saju-icon.png',
  'images/shortcuts/tools-icon.png',
];

function checkFileExists(files, category) {
  console.log(`📋 ${category} 파일 검증:`);

  const results = {
    total: files.length,
    existing: 0,
    missing: [],
  };

  files.forEach((file) => {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`);
      results.existing++;
    } else {
      console.log(`  ❌ ${file}`);
      results.missing.push(file);
    }
  });

  console.log(`  📊 결과: ${results.existing}/${results.total} 파일 존재\n`);
  return results;
}

async function validateManifest() {
  console.log('🔍 manifest.json 검증:');

  try {
    const manifestContent = fs.readFileSync('manifest.json', 'utf8');
    const manifest = JSON.parse(manifestContent);

    // 필수 필드 확인
    const requiredFields = [
      'name',
      'short_name',
      'start_url',
      'display',
      'background_color',
      'theme_color',
      'icons',
    ];
    const missingFields = requiredFields.filter((field) => !manifest[field]);

    if (missingFields.length === 0) {
      console.log('  ✅ 모든 필수 필드 존재');
    } else {
      console.log(`  ❌ 누락된 필드: ${missingFields.join(', ')}`);
    }

    // 아이콘 개수 확인
    console.log(`  📱 등록된 아이콘: ${manifest.icons?.length || 0}개`);
    console.log(`  🖼️ 등록된 스크린샷: ${manifest.screenshots?.length || 0}개`);
    console.log(`  🔗 등록된 바로가기: ${manifest.shortcuts?.length || 0}개`);

    return {
      valid: missingFields.length === 0,
      missingFields,
      iconsCount: manifest.icons?.length || 0,
      screenshotsCount: manifest.screenshots?.length || 0,
      shortcutsCount: manifest.shortcuts?.length || 0,
    };
  } catch (error) {
    console.log(`  ❌ manifest.json 파싱 오류: ${error.message}`);
    return { valid: false, error: error.message };
  } finally {
    console.log('');
  }
}

async function validateServiceWorker() {
  console.log('⚙️ 서비스 워커 검증:');

  try {
    const swContent = fs.readFileSync('sw.js', 'utf8');

    // 필수 이벤트 리스너 확인
    const hasInstall = swContent.includes('install');
    const hasActivate = swContent.includes('activate');
    const hasFetch = swContent.includes('fetch');

    console.log(`  ${hasInstall ? '✅' : '❌'} Install 이벤트 핸들러`);
    console.log(`  ${hasActivate ? '✅' : '❌'} Activate 이벤트 핸들러`);
    console.log(`  ${hasFetch ? '✅' : '❌'} Fetch 이벤트 핸들러`);

    // 캐시 전략 확인
    const hasCacheFirst = swContent.includes('cacheFirst');
    const hasNetworkFirst = swContent.includes('networkFirst');
    const hasStaleWhileRevalidate = swContent.includes('staleWhileRevalidate');

    console.log(`  ${hasCacheFirst ? '✅' : '❌'} Cache First 전략`);
    console.log(`  ${hasNetworkFirst ? '✅' : '❌'} Network First 전략`);
    console.log(`  ${hasStaleWhileRevalidate ? '✅' : '❌'} Stale While Revalidate 전략`);

    // 오프라인 지원 확인
    const hasOfflineSupport = swContent.includes('offline') || swContent.includes('getOfflinePage');
    console.log(`  ${hasOfflineSupport ? '✅' : '❌'} 오프라인 지원`);

    return {
      hasBasicEvents: hasInstall && hasActivate && hasFetch,
      hasCacheStrategies: hasCacheFirst || hasNetworkFirst || hasStaleWhileRevalidate,
      hasOfflineSupport,
    };
  } catch (error) {
    console.log(`  ❌ sw.js 읽기 오류: ${error.message}`);
    return { error: error.message };
  } finally {
    console.log('');
  }
}

function generatePWAScore(results) {
  console.log('🎯 PWA 점수 계산:');

  let score = 0;
  let maxScore = 0;
  let details = [];

  // 필수 파일 (30점)
  const requiredScore = (results.required.existing / results.required.total) * 30;
  score += requiredScore;
  maxScore += 30;
  details.push(`필수 파일: ${Math.round(requiredScore)}/30점`);

  // 아이콘 (25점)
  const iconScore = (results.icons.existing / results.icons.total) * 25;
  score += iconScore;
  maxScore += 25;
  details.push(`아이콘: ${Math.round(iconScore)}/25점`);

  // manifest.json (20점)
  const manifestScore = results.manifest.valid ? 20 : 0;
  score += manifestScore;
  maxScore += 20;
  details.push(`Manifest: ${manifestScore}/20점`);

  // 서비스 워커 (20점)
  let swScore = 0;
  if (results.serviceWorker.hasBasicEvents) swScore += 10;
  if (results.serviceWorker.hasCacheStrategies) swScore += 5;
  if (results.serviceWorker.hasOfflineSupport) swScore += 5;
  score += swScore;
  maxScore += 20;
  details.push(`서비스 워커: ${swScore}/20점`);

  // 스크린샷 (5점) - 옵션
  const screenshotScore = Math.min(
    (results.screenshots.existing / results.screenshots.total) * 5,
    5
  );
  score += screenshotScore;
  maxScore += 5;
  details.push(`스크린샷: ${Math.round(screenshotScore)}/5점`);

  const percentage = Math.round((score / maxScore) * 100);

  console.log(`  📊 총점: ${Math.round(score)}/${maxScore}점 (${percentage}%)`);
  details.forEach((detail) => console.log(`  • ${detail}`));

  console.log('');

  return {
    score: Math.round(score),
    maxScore,
    percentage,
    details,
  };
}

function generateRecommendations(results) {
  console.log('💡 개선 권장사항:');

  const recommendations = [];

  // 누락된 필수 파일
  if (results.required.missing.length > 0) {
    recommendations.push('🔴 HIGH: 누락된 필수 파일 생성');
    results.required.missing.forEach((file) => {
      console.log(`  • ${file} 생성 필요`);
    });
  }

  // 누락된 아이콘
  if (results.icons.missing.length > 0) {
    recommendations.push('🟡 MEDIUM: 누락된 아이콘 생성');
    const criticalIcons = results.icons.missing.filter(
      (icon) => icon.includes('48x48') || icon.includes('maskable')
    );
    if (criticalIcons.length > 0) {
      console.log('  우선순위 높음:');
      criticalIcons.forEach((icon) => console.log(`    • ${icon}`));
    }
  }

  // manifest.json 문제
  if (!results.manifest.valid) {
    recommendations.push('🔴 HIGH: manifest.json 수정');
    if (results.manifest.missingFields) {
      results.manifest.missingFields.forEach((field) => {
        console.log(`  • ${field} 필드 추가 필요`);
      });
    }
  }

  // 서비스 워커 문제
  if (!results.serviceWorker.hasBasicEvents) {
    recommendations.push('🔴 HIGH: 서비스 워커 기본 이벤트 핸들러 추가');
  }
  if (!results.serviceWorker.hasCacheStrategies) {
    recommendations.push('🟡 MEDIUM: 캐시 전략 구현');
  }
  if (!results.serviceWorker.hasOfflineSupport) {
    recommendations.push('🟡 MEDIUM: 오프라인 지원 강화');
  }

  // 스크린샷 누락
  if (results.screenshots.existing === 0) {
    recommendations.push('🟢 LOW: 앱 스크린샷 생성 (앱스토어 스타일)');
  }

  if (recommendations.length === 0) {
    console.log('  🎉 모든 PWA 요구사항이 완벽합니다!');
  }

  console.log('');
  return recommendations;
}

// 메인 검증 실행
async function runPWAValidation() {
  const results = {
    required: checkFileExists(requiredFiles, '필수 PWA'),
    icons: checkFileExists(iconFiles, 'PWA 아이콘'),
    screenshots: checkFileExists(screenshotFiles, '스크린샷'),
    shortcuts: checkFileExists(shortcutFiles, 'Shortcut 아이콘'),
    manifest: await validateManifest(),
    serviceWorker: await validateServiceWorker(),
  };

  const score = generatePWAScore(results);
  const recommendations = generateRecommendations(results);

  console.log('📈 PWA 성능 요약:');
  console.log(`  현재 PWA 점수: ${score.percentage}%`);
  console.log(`  Lighthouse PWA 예상 점수: ${Math.min(score.percentage + 10, 100)}%`);
  console.log(`  개선 필요 항목: ${recommendations.length}개`);

  return {
    results,
    score,
    recommendations,
  };
}

// 스크립트 실행
runPWAValidation()
  .then((report) => {
    console.log('\n✅ PWA 검증 완료');
  })
  .catch(console.error);
