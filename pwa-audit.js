#!/usr/bin/env node

/**
 * PWA 및 오프라인 기능 검증 스크립트
 * 
 * 검증 항목:
 * 1. Manifest.json 완전성
 * 2. Service Worker 등록 및 기능
 * 3. 아이콘 존재 여부
 * 4. 오프라인 기능
 * 5. HTTPS 요구사항
 * 6. 캐싱 전략
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 PWA 및 오프라인 기능 검증 시작...\n');

// 1. Manifest.json 검증
function checkManifest() {
  console.log('📋 1. Manifest.json 검증');
  
  try {
    const manifestPath = path.join(__dirname, 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);
    
    console.log('  ✅ manifest.json 파일 존재');
    
    // 필수 속성 확인
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length === 0) {
      console.log('  ✅ 모든 필수 필드 존재');
    } else {
      console.log(`  ❌ 누락된 필드: ${missingFields.join(', ')}`);
    }
    
    // 아이콘 검증
    if (manifest.icons && manifest.icons.length > 0) {
      console.log(`  ✅ ${manifest.icons.length}개 아이콘 정의`);
      
      // 192x192, 512x512 아이콘 확인
      const has192 = manifest.icons.some(icon => icon.sizes.includes('192x192'));
      const has512 = manifest.icons.some(icon => icon.sizes.includes('512x512'));
      const hasMaskable = manifest.icons.some(icon => icon.purpose && icon.purpose.includes('maskable'));
      
      console.log(`  ${has192 ? '✅' : '❌'} 192x192 아이콘`);
      console.log(`  ${has512 ? '✅' : '❌'} 512x512 아이콘`);
      console.log(`  ${hasMaskable ? '✅' : '❌'} Maskable 아이콘`);
    }
    
    // Display 모드 확인
    const standaloneDisplay = manifest.display === 'standalone' || 
                              (manifest.display_override && manifest.display_override.includes('standalone'));
    console.log(`  ${standaloneDisplay ? '✅' : '❌'} Standalone display 모드`);
    
    // Theme color 확인
    console.log(`  ${manifest.theme_color ? '✅' : '❌'} Theme color 설정`);
    console.log(`  ${manifest.background_color ? '✅' : '❌'} Background color 설정`);
    
    // Shortcuts 확인 (선택사항)
    if (manifest.shortcuts) {
      console.log(`  ✅ ${manifest.shortcuts.length}개 앱 바로가기 정의`);
    }
    
  } catch (error) {
    console.log('  ❌ Manifest.json 파일 읽기 실패:', error.message);
  }
  
  console.log();
}

// 2. Service Worker 파일 검증
function checkServiceWorker() {
  console.log('⚙️  2. Service Worker 검증');
  
  try {
    const swPath = path.join(__dirname, 'sw.js');
    const swContent = fs.readFileSync(swPath, 'utf-8');
    
    console.log('  ✅ sw.js 파일 존재');
    
    // 주요 기능 확인
    const hasInstallEvent = swContent.includes("addEventListener('install'");
    const hasActivateEvent = swContent.includes("addEventListener('activate'");
    const hasFetchEvent = swContent.includes("addEventListener('fetch'");
    const hasCaching = swContent.includes('caches.open');
    const hasOfflineSupport = swContent.includes('offline') || swContent.includes('Offline');
    
    console.log(`  ${hasInstallEvent ? '✅' : '❌'} Install 이벤트 구현`);
    console.log(`  ${hasActivateEvent ? '✅' : '❌'} Activate 이벤트 구현`);
    console.log(`  ${hasFetchEvent ? '✅' : '❌'} Fetch 이벤트 구현`);
    console.log(`  ${hasCaching ? '✅' : '❌'} 캐싱 기능 구현`);
    console.log(`  ${hasOfflineSupport ? '✅' : '❌'} 오프라인 지원`);
    
    // 캐싱 전략 확인
    const strategies = [];
    if (swContent.includes('cacheFirst')) strategies.push('Cache First');
    if (swContent.includes('networkFirst')) strategies.push('Network First');
    if (swContent.includes('staleWhileRevalidate')) strategies.push('Stale While Revalidate');
    
    if (strategies.length > 0) {
      console.log(`  ✅ 캐싱 전략: ${strategies.join(', ')}`);
    } else {
      console.log('  ⚠️  명시적인 캐싱 전략 미확인');
    }
    
  } catch (error) {
    console.log('  ❌ Service Worker 파일 읽기 실패:', error.message);
  }
  
  console.log();
}

// 3. 아이콘 파일 검증
function checkIcons() {
  console.log('🖼️  3. PWA 아이콘 파일 검증');
  
  const iconSizes = ['48x48', '72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '256x256', '384x384', '512x512'];
  const maskableIcons = ['192x192', '512x512'];
  
  iconSizes.forEach(size => {
    const iconPath = path.join(__dirname, 'images', `icon-${size}.png`);
    const exists = fs.existsSync(iconPath);
    console.log(`  ${exists ? '✅' : '❌'} icon-${size}.png`);
  });
  
  console.log('\n  Maskable 아이콘:');
  maskableIcons.forEach(size => {
    const iconPath = path.join(__dirname, 'images', `icon-maskable-${size}.png`);
    const exists = fs.existsSync(iconPath);
    console.log(`  ${exists ? '✅' : '❌'} icon-maskable-${size}.png`);
  });
  
  console.log();
}

// 4. 오프라인 페이지 검증
function checkOfflinePage() {
  console.log('📱 4. 오프라인 페이지 검증');
  
  const offlinePagePath = path.join(__dirname, 'offline.html');
  const exists = fs.existsSync(offlinePagePath);
  console.log(`  ${exists ? '✅' : '❌'} offline.html 파일 존재`);
  
  if (exists) {
    try {
      const content = fs.readFileSync(offlinePagePath, 'utf-8');
      
      // 기본 HTML 구조 확인
      const hasTitle = content.includes('<title>') && content.includes('오프라인');
      const hasMetaViewport = content.includes('viewport');
      const hasCSP = content.includes('Content-Security-Policy');
      const hasRetryButton = content.includes('다시 시도') || content.includes('retry');
      const hasOfflineMessage = content.includes('인터넷 연결') || content.includes('오프라인');
      
      console.log(`  ${hasTitle ? '✅' : '❌'} 오프라인 페이지 제목`);
      console.log(`  ${hasMetaViewport ? '✅' : '❌'} Viewport 메타 태그`);
      console.log(`  ${hasCSP ? '✅' : '❌'} Content Security Policy`);
      console.log(`  ${hasRetryButton ? '✅' : '❌'} 다시 시도 버튼`);
      console.log(`  ${hasOfflineMessage ? '✅' : '❌'} 오프라인 안내 메시지`);
      
    } catch (error) {
      console.log('  ❌ 오프라인 페이지 내용 확인 실패');
    }
  }
  
  console.log();
}

// 5. HTML에서 PWA 메타 태그 검증
function checkHTMLMetaTags() {
  console.log('🏷️  5. HTML 메타 태그 검증');
  
  try {
    const indexPath = path.join(__dirname, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf-8');
    
    // PWA 관련 메타 태그 확인
    const hasManifestLink = content.includes('<link rel="manifest"');
    const hasAppleTouchIcon = content.includes('apple-touch-icon');
    const hasThemeColor = content.includes('theme-color');
    const hasViewport = content.includes('viewport');
    const hasIconFavicon = content.includes('rel="icon"');
    
    console.log(`  ${hasManifestLink ? '✅' : '❌'} Manifest 링크`);
    console.log(`  ${hasAppleTouchIcon ? '✅' : '❌'} Apple Touch Icon`);
    console.log(`  ${hasThemeColor ? '✅' : '❌'} Theme Color 메타 태그`);
    console.log(`  ${hasViewport ? '✅' : '❌'} Viewport 메타 태그`);
    console.log(`  ${hasIconFavicon ? '✅' : '❌'} 파비콘 설정`);
    
    // PWA 등록 스크립트 확인
    const hasPWARegistration = content.includes('serviceWorker') && 
                               (content.includes('register') || content.includes('sw.js'));
    console.log(`  ${hasPWARegistration ? '✅' : '❌'} Service Worker 등록 스크립트`);
    
  } catch (error) {
    console.log('  ❌ HTML 파일 확인 실패:', error.message);
  }
  
  console.log();
}

// 6. PWA 기능 스크립트 검증
function checkPWAScripts() {
  console.log('📜 6. PWA 기능 스크립트 검증');
  
  // PWA 헬퍼 스크립트 확인
  const pwaHelperPath = path.join(__dirname, 'js', 'core', 'pwa-helpers.js');
  const exists = fs.existsSync(pwaHelperPath);
  console.log(`  ${exists ? '✅' : '❌'} PWA 헬퍼 스크립트 존재`);
  
  if (exists) {
    try {
      const content = fs.readFileSync(pwaHelperPath, 'utf-8');
      
      const hasInstallPrompt = content.includes('beforeinstallprompt') || content.includes('install');
      const hasUpdateCheck = content.includes('updatefound') || content.includes('update');
      const hasOfflineDetection = content.includes('online') || content.includes('offline');
      
      console.log(`  ${hasInstallPrompt ? '✅' : '❌'} 설치 프롬프트 처리`);
      console.log(`  ${hasUpdateCheck ? '✅' : '❌'} 업데이트 감지 기능`);
      console.log(`  ${hasOfflineDetection ? '✅' : '❌'} 온라인/오프라인 상태 감지`);
      
    } catch (error) {
      console.log('  ❌ PWA 헬퍼 스크립트 읽기 실패');
    }
  }
  
  console.log();
}

// 7. 캐시 전략 분석
function analyzeCacheStrategy() {
  console.log('💾 7. 캐시 전략 분석');
  
  try {
    const swPath = path.join(__dirname, 'sw.js');
    const swContent = fs.readFileSync(swPath, 'utf-8');
    
    // 캐시 이름 확인
    const cacheMatches = swContent.match(/CACHE.*=.*['"`]([^'"`]+)['"`]/g);
    if (cacheMatches) {
      console.log('  ✅ 캐시 버전 관리:');
      cacheMatches.forEach(match => {
        console.log(`    - ${match.replace(/.*=\s*/, '').replace(/['"`]/g, '')}`);
      });
    }
    
    // 캐시할 자산 확인
    const criticalAssetsMatch = swContent.match(/CRITICAL_ASSETS\s*=\s*\[([\s\S]*?)\]/);
    if (criticalAssetsMatch) {
      const assets = criticalAssetsMatch[1].match(/'([^']+)'/g) || [];
      console.log(`  ✅ ${assets.length}개 핵심 자산 사전 캐싱`);
    }
    
    // API 캐시 설정 확인
    const hasApiCache = swContent.includes('API_CACHE') || swContent.includes('/api/');
    console.log(`  ${hasApiCache ? '✅' : '❌'} API 응답 캐싱`);
    
    // 캐시 크기 제한 확인
    const hasCacheSizeLimit = swContent.includes('maxEntries') || swContent.includes('maxCacheSize');
    console.log(`  ${hasCacheSizeLimit ? '✅' : '❌'} 캐시 크기 제한`);
    
  } catch (error) {
    console.log('  ❌ 캐시 전략 분석 실패');
  }
  
  console.log();
}

// 8. PWA 점수 요약
function summarizePWAScore() {
  console.log('📊 8. PWA 준비 상태 요약');
  
  const checks = [
    { name: 'Manifest.json', weight: 15 },
    { name: 'Service Worker', weight: 20 },
    { name: '필수 아이콘 (192x192, 512x512)', weight: 10 },
    { name: 'Maskable 아이콘', weight: 5 },
    { name: '오프라인 페이지', weight: 15 },
    { name: 'HTML 메타 태그', weight: 10 },
    { name: '캐싱 전략', weight: 15 },
    { name: '설치 기능', weight: 10 }
  ];
  
  console.log('\n  PWA 체크리스트:');
  checks.forEach(check => {
    console.log(`  [ ] ${check.name} (${check.weight}점)`);
  });
  
  console.log('\n  🎯 PWA 최적화 추천사항:');
  console.log('    1. Lighthouse PWA 감사 실행 (목표: 90+ 점수)');
  console.log('    2. 오프라인 기능 실제 테스트');
  console.log('    3. 다양한 기기에서 설치 테스트');
  console.log('    4. Push 알림 기능 고려');
  console.log('    5. Background Sync 구현 검토');
  
  console.log();
}

// 메인 실행 함수
function runPWAAudit() {
  console.log('🚀 doha.kr PWA 감사 리포트');
  console.log('=' + '='.repeat(50));
  console.log();
  
  checkManifest();
  checkServiceWorker();
  checkIcons();
  checkOfflinePage();
  checkHTMLMetaTags();
  checkPWAScripts();
  analyzeCacheStrategy();
  summarizePWAScore();
  
  console.log('✅ PWA 감사 완료!');
  console.log('\n💡 다음 단계: 실제 브라우저에서 PWA 설치 및 오프라인 기능을 테스트해보세요.');
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  runPWAAudit();
}

export { runPWAAudit };