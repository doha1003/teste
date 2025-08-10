/**
 * 브라우저 콘솔에서 실행할 수 있는 PWA 기능 확인 스크립트
 * 
 * 사용법: 
 * 1. http://localhost:3000 접속
 * 2. F12로 콘솔 열기
 * 3. 이 스크립트 내용을 복사해서 붙여넣기
 */

(async function checkPWAFeatures() {
  console.log('🔍 PWA 기능 검증 시작...\n');

  // 1. Service Worker 상태 확인
  console.log('1️⃣ Service Worker 상태');
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`✅ Service Worker 등록됨 (${registrations.length}개)`);
      
      registrations.forEach((reg, i) => {
        console.log(`   [${i + 1}] Scope: ${reg.scope}`);
        console.log(`   [${i + 1}] State: ${reg.active ? reg.active.state : '상태불명'}`);
      });
      
      if (navigator.serviceWorker.controller) {
        console.log('✅ 현재 페이지가 Service Worker에 의해 제어됨');
      } else {
        console.log('⚠️  현재 페이지가 Service Worker에 의해 제어되지 않음');
      }
    } catch (error) {
      console.log('❌ Service Worker 확인 오류:', error);
    }
  } else {
    console.log('❌ Service Worker 미지원 브라우저');
  }

  // 2. 캐시 상태 확인  
  console.log('\n2️⃣ 캐시 상태');
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      console.log(`✅ ${cacheNames.length}개 캐시 생성됨:`);
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        console.log(`   📦 ${cacheName}: ${requests.length}개 항목`);
      }
    } catch (error) {
      console.log('❌ 캐시 확인 오류:', error);
    }
  } else {
    console.log('❌ Cache API 미지원');
  }

  // 3. Manifest 확인
  console.log('\n3️⃣ PWA Manifest');
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    console.log(`✅ Manifest 링크: ${manifestLink.href}`);
    
    try {
      const response = await fetch(manifestLink.href);
      const manifest = await response.json();
      console.log(`✅ 앱 이름: ${manifest.name}`);
      console.log(`✅ 짧은 이름: ${manifest.short_name}`);
      console.log(`✅ 시작 URL: ${manifest.start_url}`);
      console.log(`✅ 디스플레이: ${manifest.display}`);
      console.log(`✅ 아이콘 개수: ${manifest.icons?.length || 0}`);
    } catch (error) {
      console.log('❌ Manifest 읽기 오류:', error);
    }
  } else {
    console.log('❌ Manifest 링크 없음');
  }

  // 4. PWA 메타 태그 확인
  console.log('\n4️⃣ PWA 메타 태그');
  const checks = [
    { name: 'viewport', selector: 'meta[name="viewport"]' },
    { name: 'theme-color', selector: 'meta[name="theme-color"]' },
    { name: 'apple-mobile-web-app-capable', selector: 'meta[name="apple-mobile-web-app-capable"]' },
    { name: 'apple-touch-icon', selector: 'link[rel="apple-touch-icon"]' }
  ];

  checks.forEach(({ name, selector }) => {
    const element = document.querySelector(selector);
    if (element) {
      const content = element.content || element.href || '존재함';
      console.log(`✅ ${name}: ${content}`);
    } else {
      console.log(`❌ ${name}: 없음`);
    }
  });

  // 5. 네트워크 상태
  console.log('\n5️⃣ 네트워크 상태');
  console.log(`📶 현재 상태: ${navigator.onLine ? '온라인' : '오프라인'}`);

  // 6. PWA 설치 가능성
  console.log('\n6️⃣ PWA 설치 기능');
  if ('BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window) {
    console.log('✅ PWA 설치 프롬프트 지원');
  } else {
    console.log('⚠️  PWA 설치 프롬프트 미지원 (또는 이미 설치됨)');
  }

  // 7. 캐시된 핵심 자산 확인
  console.log('\n7️⃣ 핵심 자산 캐시 상태');
  const criticalAssets = [
    '/',
    '/manifest.json', 
    '/images/logo.svg',
    '/images/icon-192x192.png',
    '/images/icon-512x512.png',
    '/offline.html'
  ];

  for (const asset of criticalAssets) {
    try {
      const response = await caches.match(asset);
      console.log(`${response ? '✅' : '❌'} ${asset}: ${response ? '캐시됨' : '캐시 안됨'}`);
    } catch (error) {
      console.log(`❌ ${asset}: 확인 오류`);
    }
  }

  // 8. 테스트 기능들
  console.log('\n8️⃣ 테스트 함수들');
  console.log('다음 함수들로 추가 테스트 가능:');
  
  window.testPWAOffline = async function() {
    console.log('🔌 오프라인 테스트 시작...');
    console.log('Network 탭에서 "Offline"을 체크한 후 페이지를 새로고침하세요.');
  };
  
  window.checkPWAInstall = function() {
    console.log('📱 PWA 설치 테스트');
    console.log('주소창에서 설치 아이콘(⊕)을 확인하거나');
    console.log('모바일에서는 브라우저 메뉴 > "홈 화면에 추가"를 확인하세요.');
  };
  
  window.clearPWACache = async function() {
    console.log('🗑️  PWA 캐시 삭제 중...');
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log(`✅ ${cacheNames.length}개 캐시 삭제 완료`);
  };

  console.log('   testPWAOffline() - 오프라인 테스트 가이드');
  console.log('   checkPWAInstall() - PWA 설치 확인');  
  console.log('   clearPWACache() - 캐시 삭제');

  console.log('\n🎉 PWA 검증 완료!\n');
  console.log('💡 추가 테스트: Chrome DevTools > Application 탭에서 더 자세한 정보를 확인할 수 있습니다.');
})();