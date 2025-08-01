/**
 * PWA Helper Functions
 * PWA 관련 유틸리티 함수들
 */

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
