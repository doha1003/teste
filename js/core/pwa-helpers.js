/**
 * PWA Helper Functions - Enhanced
 * PWA 관련 유틸리티 함수들 (설치 프롬프트 및 향상된 기능 포함)
 */

// PWA 설치 관련 전역 변수
let deferredPrompt = null;
let installPromptShown = false;

/**
 * 오프라인 데이터 저장
 */
export function saveOfflineData(key, data) {
  try {
    const offlineData = JSON.parse(localStorage.getItem('offline-data') || '{}');
    offlineData[key] = {
      data,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('offline-data', JSON.stringify(offlineData));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 오프라인 데이터 가져오기
 */
export function getOfflineData(key) {
  try {
    const offlineData = JSON.parse(localStorage.getItem('offline-data') || '{}');
    return offlineData[key] || null;
  } catch (error) {
    return null;
  }
}

/**
 * 오프라인 양식 데이터 큐에 추가
 */
export function queueFormSubmission(url, formData) {
  try {
    const queue = JSON.parse(localStorage.getItem('form-queue') || '[]');
    queue.push({
      url,
      data: formData,
      timestamp: new Date().toISOString(),
      id: Date.now(),
    });
    localStorage.setItem('form-queue', JSON.stringify(queue));

    // Service Worker에 동기화 요청
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register('form-sync');
      });
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 네트워크 상태 확인
 */
export async function checkNetworkStatus() {
  if (!navigator.onLine) {
    return false;
  }

  try {
    const response = await fetch('/manifest.json', {
      method: 'HEAD',
      cache: 'no-cache',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * PWA 설치 상태 확인
 */
export function isPWAInstalled() {
  // 여러 방법으로 설치 상태 확인
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * 캐시된 페이지 목록 가져오기
 */
export async function getCachedPages() {
  if (!('caches' in window)) {
    return [];
  }

  try {
    const cacheNames = await caches.keys();
    const cachedUrls = [];

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      requests.forEach((request) => {
        if (request.url.includes('.html') || request.url.endsWith('/')) {
          cachedUrls.push(request.url);
        }
      });
    }

    return [...new Set(cachedUrls)]; // 중복 제거
  } catch (error) {
    return [];
  }
}

/**
 * 페이지 사전 캐싱
 */
export async function precachePage(url) {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const response = await fetch(url);
    if (response.ok) {
      // Service Worker에 캐싱 요청 메시지 전송
      const registration = await navigator.serviceWorker.ready;
      registration.active.postMessage({
        type: 'CACHE_PAGE',
        url,
      });
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * 오프라인 사용 가능한 페이지인지 확인
 */
export async function isPageAvailableOffline(url) {
  if (!('caches' in window)) {
    return false;
  }

  try {
    const cache = await caches.open('doha-dynamic-v1');
    const response = await cache.match(url);
    return response !== undefined;
  } catch (error) {
    return false;
  }
}

/**
 * PWA 업데이트 확인
 */
export async function checkForUpdates() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 배터리 상태 모니터링
 */
export async function getBatteryStatus() {
  if (!('getBattery' in navigator)) {
    return null;
  }

  try {
    const battery = await navigator.getBattery();
    return {
      level: battery.level * 100,
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
    };
  } catch (error) {
    return null;
  }
}

/**
 * 데이터 절약 모드 확인
 */
export function isDataSaverEnabled() {
  if (!('connection' in navigator)) {
    return false;
  }

  return navigator.connection.saveData === true;
}

/**
 * 오프라인 알림 표시
 */
export function showOfflineNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'offline-notification';
  notification.innerHTML = `
            <div class="offline-notification-content">
                <span class="offline-icon">📵</span>
                <span class="offline-message">${message || '현재 오프라인 상태입니다'}</span>
            </div>
        `;

  document.body.appendChild(notification);

  // 5초 후 제거
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}

/**
 * 온라인 복귀 알림 표시
 */
export function showOnlineNotification() {
  const notification = document.createElement('div');
  notification.className = 'online-notification';
  notification.innerHTML = `
            <div class="online-notification-content">
                <span class="online-icon">📶</span>
                <span class="online-message">인터넷 연결이 복구되었습니다</span>
            </div>
        `;

  document.body.appendChild(notification);

  // 3초 후 제거
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

/**
 * PWA 설치 프롬프트 이벤트 설정
 */
export function setupInstallPrompt() {
  // beforeinstallprompt 이벤트 리스너
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA: Install prompt available');

    // 기본 프롬프트 방지
    e.preventDefault();

    deferredPrompt = e;

    // 커스텀 설치 프롬프트 표시 (5초 후)
    setTimeout(() => {
      if (!installPromptShown && !isPWAInstalled()) {
        showInstallPrompt();
      }
    }, 5000);

    // 분석 이벤트
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install_prompt_available');
    }
  });

  // 설치 완료 이벤트
  window.addEventListener('appinstalled', (_e) => {
    console.log('PWA: App installed successfully');

    hideInstallPrompt();
    showInstallSuccessNotification();

    // 분석 이벤트
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_installed');
    }
  });
}

/**
 * 커스텀 설치 프롬프트 표시
 */
export function showInstallPrompt() {
  if (installPromptShown || isPWAInstalled() || !deferredPrompt) {
    return;
  }

  // 기존 프롬프트가 있으면 제거
  const existing = document.getElementById('pwa-install-prompt');
  if (existing) {
    existing.remove();
  }

  const prompt = createInstallPromptHTML();
  document.body.appendChild(prompt);

  installPromptShown = true;

  // 애니메이션 적용
  requestAnimationFrame(() => {
    prompt.classList.add('show');
  });

  // 30초 후 자동 숨김
  setTimeout(() => {
    hideInstallPrompt();
  }, 30000);
}

/**
 * 설치 프롬프트 HTML 생성
 */
function createInstallPromptHTML() {
  const prompt = document.createElement('div');
  prompt.id = 'pwa-install-prompt';
  prompt.innerHTML = `
    <div class="pwa-install-overlay">
      <div class="pwa-install-dialog">
        <div class="pwa-install-header">
          <div class="pwa-install-icon">📱</div>
          <h3>앱으로 설치하기</h3>
          <button class="pwa-install-close" id="pwa-install-close" aria-label="닫기">×</button>
        </div>
        <div class="pwa-install-content">
          <p>doha.kr을 홈 화면에 추가하여 앱처럼 사용하세요!</p>
          <ul class="pwa-install-benefits">
            <li>✨ 빠른 실행 속도</li>
            <li>📱 앱처럼 사용</li>
            <li>🔄 오프라인 지원</li>
            <li>🔔 푸시 알림</li>
          </ul>
        </div>
        <div class="pwa-install-actions">
          <button class="pwa-install-btn" id="pwa-install-btn">설치하기</button>
          <button class="pwa-install-cancel" id="pwa-install-cancel">나중에</button>
        </div>
      </div>
    </div>
  `;

  // 스타일 추가
  addInstallPromptStyles();

  // 이벤트 리스너 추가
  setupInstallPromptEvents(prompt);

  return prompt;
}

/**
 * 설치 프롬프트 스타일 추가
 */
function addInstallPromptStyles() {
  if (document.getElementById('pwa-install-styles')) {
    return;
  }

  const styles = document.createElement('style');
  styles.id = 'pwa-install-styles';
  styles.textContent = `
    #pwa-install-prompt {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    #pwa-install-prompt.show {
      opacity: 1;
      visibility: visible;
    }

    .pwa-install-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .pwa-install-dialog {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      max-width: 400px;
      width: 100%;
      transform: translateY(20px);
      transition: transform 0.3s ease;
    }

    #pwa-install-prompt.show .pwa-install-dialog {
      transform: translateY(0);
    }

    .pwa-install-header {
      padding: 24px 24px 0;
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
    }

    .pwa-install-icon {
      font-size: 24px;
    }

    .pwa-install-header h3 {
      margin: 0;
      flex: 1;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .pwa-install-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      font-size: 24px;
      color: #6b7280;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
    }

    .pwa-install-close:hover {
      color: #374151;
    }

    .pwa-install-content {
      padding: 16px 24px;
    }

    .pwa-install-content p {
      margin: 0 0 16px;
      color: #4b5563;
      line-height: 1.5;
    }

    .pwa-install-benefits {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 8px;
    }

    .pwa-install-benefits li {
      color: #059669;
      font-size: 14px;
      font-weight: 500;
    }

    .pwa-install-actions {
      padding: 16px 24px 24px;
      display: flex;
      gap: 12px;
    }

    .pwa-install-btn {
      flex: 1;
      background: #6366f1;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .pwa-install-btn:hover {
      background: #5856eb;
    }

    .pwa-install-cancel {
      background: none;
      border: 1px solid #d1d5db;
      color: #6b7280;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .pwa-install-cancel:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    @media (max-width: 480px) {
      .pwa-install-dialog {
        margin: 20px;
      }
      
      .pwa-install-actions {
        flex-direction: column;
      }
    }
  `;

  document.head.appendChild(styles);
}

/**
 * 설치 프롬프트 이벤트 설정
 */
function setupInstallPromptEvents(prompt) {
  const installBtn = prompt.querySelector('#pwa-install-btn');
  const cancelBtn = prompt.querySelector('#pwa-install-cancel');
  const closeBtn = prompt.querySelector('#pwa-install-close');

  // 설치 버튼 클릭
  installBtn.addEventListener('click', () => {
    installApp();
  });

  // 취소/닫기 버튼 클릭
  const hidePrompt = () => {
    hideInstallPrompt();
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install_prompt_dismissed');
    }
  };

  cancelBtn.addEventListener('click', hidePrompt);
  closeBtn.addEventListener('click', hidePrompt);

  // 오버레이 클릭으로 닫기
  prompt.querySelector('.pwa-install-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      hidePrompt();
    }
  });
}

/**
 * 앱 설치 실행
 */
export async function installApp() {
  if (!deferredPrompt) {
    console.warn('PWA: No deferred prompt available');
    return false;
  }

  try {
    // 설치 프롬프트 표시
    deferredPrompt.prompt();

    // 사용자 선택 대기
    const { outcome } = await deferredPrompt.userChoice;

    console.log('PWA: User choice:', outcome);

    // 분석 이벤트
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install_user_choice', { outcome });
    }

    // 프롬프트 초기화
    deferredPrompt = null;
    hideInstallPrompt();

    return outcome === 'accepted';
  } catch (error) {
    console.error('PWA: Install failed:', error);
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install_error', { error: error.message });
    }
    return false;
  }
}

/**
 * 설치 프롬프트 숨기기
 */
export function hideInstallPrompt() {
  const prompt = document.getElementById('pwa-install-prompt');
  if (prompt) {
    prompt.classList.remove('show');
    setTimeout(() => {
      if (prompt.parentNode) {
        prompt.remove();
      }
    }, 300);
  }
  installPromptShown = false;
}

/**
 * 설치 성공 알림 표시
 */
function showInstallSuccessNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10001;
    font-weight: 600;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span>🎉</span>
      <span>앱이 성공적으로 설치되었습니다!</span>
    </div>
  `;

  document.body.appendChild(notification);

  // 애니메이션
  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
  });

  // 5초 후 제거
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 5000);
}

/**
 * 서비스 워커 등록
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('PWA: Service Worker not supported');
    return false;
  }

  try {
    console.log('PWA: Registering Service Worker...');
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    // 업데이트 감지
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // 새 버전 사용 가능
              showUpdateAvailableNotification();
            } else {
              // 첫 설치 완료
              console.log('PWA: Service Worker installed for the first time');
            }
          }
        });
      }
    });

    console.log('PWA: Service Worker registered successfully');
    return true;
    
  } catch (error) {
    console.error('PWA: Service Worker registration failed:', error);
    return false;
  }
}

/**
 * 업데이트 사용 가능 알림
 */
function showUpdateAvailableNotification() {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      z-index: 10000;
      max-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    ">
      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
        <span style="font-size: 1.2rem;">🔄</span>
        <strong>업데이트 사용 가능</strong>
      </div>
      <p style="margin: 0 0 0.75rem; font-size: 0.9rem; opacity: 0.9;">
        새로운 버전이 준비되었습니다.
      </p>
      <button id="update-app-btn" style="
        background: white;
        color: #3b82f6;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        margin-right: 0.5rem;
      ">업데이트</button>
      <button id="dismiss-update-btn" style="
        background: transparent;
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
      ">나중에</button>
    </div>
  `;

  document.body.appendChild(notification);

  // 애니메이션
  requestAnimationFrame(() => {
    notification.firstElementChild.style.transform = 'translateX(0)';
  });

  // 이벤트 리스너
  notification.querySelector('#update-app-btn').addEventListener('click', () => {
    window.location.reload();
  });

  notification.querySelector('#dismiss-update-btn').addEventListener('click', () => {
    notification.firstElementChild.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  });

  // 10초 후 자동 제거
  setTimeout(() => {
    if (notification.parentNode) {
      notification.firstElementChild.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 10000);
}

/**
 * PWA 초기화 함수
 */
export async function initializePWA() {
  // 서비스 워커 등록
  await registerServiceWorker();
  
  // 설치 프롬프트 설정
  setupInstallPrompt();

  // 네트워크 상태 모니터링
  window.addEventListener('online', showOnlineNotification);
  window.addEventListener('offline', () => showOfflineNotification());

  console.log('PWA: Helper functions initialized');
}
