/**
 * Advanced Offline Manager for PWA
 * 고급 오프라인 경험 관리
 */

class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.offlineQueue = [];
    this.syncInProgress = false;
    this.retryAttempts = new Map();
    this.maxRetries = 3;

    // 오프라인 콘텐츠 캐시
    this.offlineContent = new Map();

    // 한국어 메시지
    this.messages = {
      offline: '인터넷 연결이 끊어졌습니다',
      online: '인터넷에 다시 연결되었습니다',
      syncInProgress: '데이터를 동기화하는 중입니다...',
      syncComplete: '동기화가 완료되었습니다',
      syncFailed: '일부 데이터 동기화에 실패했습니다',
      offlineMode: '오프라인 모드로 전환되었습니다',
      limitedFeatures: '일부 기능이 제한됩니다',
    };

    // 이벤트 리스너
    this.listeners = new Map();

    this.init();
  }

  init() {
    // 온라인/오프라인 이벤트 리스너
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // 페이지 가시성 변경 감지
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Service Worker 메시지 리스너
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));
    }

    // 주기적 연결 상태 확인
    this.startConnectionMonitoring();

    // 오프라인 콘텐츠 미리 로드
    this.preloadOfflineContent();

    // UI 업데이트
    this.updateUI();
  }

  // 온라인 상태로 전환
  async handleOnline() {
    this.isOnline = true;
    this.updateUI();
    this.showNotification(this.messages.online, 'success');

    // 대기 중인 요청들 동기화
    await this.syncOfflineQueue();

    // Service Worker에 온라인 상태 알림
    this.notifyServiceWorker('ONLINE');

    // 이벤트 발생
    this.emit('online');
  }

  // 오프라인 상태로 전환
  handleOffline() {
    this.isOnline = false;
    this.updateUI();
    this.showNotification(this.messages.offline, 'warning');
    this.showNotification(this.messages.limitedFeatures, 'info');

    // Service Worker에 오프라인 상태 알림
    this.notifyServiceWorker('OFFLINE');

    // 이벤트 발생
    this.emit('offline');
  }

  // 페이지 가시성 변경 처리
  handleVisibilityChange() {
    if (!document.hidden && this.isOnline && this.offlineQueue.length > 0) {
      // 페이지가 다시 보이고 온라인 상태일 때 동기화
      this.syncOfflineQueue();
    }
  }

  // Service Worker 메시지 처리
  handleSWMessage(event) {
    const { data } = event;

    switch (data.type) {
      case 'SYNC_COMPLETE':
        this.showNotification(this.messages.syncComplete, 'success');
        break;
      case 'CACHE_UPDATED':
        this.emit('cacheUpdated', data.url);
        break;
      case 'REQUEST_QUEUED':
        this.addToOfflineQueue(data.request);
        break;
    }
  }

  // 연결 상태 모니터링
  startConnectionMonitoring() {
    setInterval(async () => {
      const isReallyOnline = await this.checkRealConnection();

      if (navigator.onLine !== isReallyOnline) {
        // 브라우저의 navigator.onLine과 실제 연결 상태가 다른 경우
        if (isReallyOnline) {
          this.handleOnline();
        } else {
          this.handleOffline();
        }
      }
    }, 30000); // 30초마다 체크
  }

  // 실제 연결 상태 확인
  async checkRealConnection() {
    try {
      // 작은 이미지로 연결 테스트
      const response = await fetch('/images/logo.svg', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5초 타임아웃
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // 오프라인 콘텐츠 미리 로드
  async preloadOfflineContent() {
    const criticalContent = ['/', '/offline.html', '/tests/', '/tools/', '/fortune/'];

    for (const url of criticalContent) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const content = await response.text();
          this.offlineContent.set(url, content);
        }
      } catch (error) {
        console.warn('오프라인 캐시 실패:', error);
      }
    }
  }

  // 오프라인 큐에 요청 추가
  addToOfflineQueue(request) {
    const queueItem = {
      id: this.generateId(),
      request: this.serializeRequest(request),
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.offlineQueue.push(queueItem);
    this.saveQueueToStorage();

    this.updateUI();
  }

  // 요청 직렬화
  serializeRequest(request) {
    return {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.body,
    };
  }

  // 오프라인 큐 동기화
  async syncOfflineQueue() {
    if (this.syncInProgress || this.offlineQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    this.showNotification(this.messages.syncInProgress, 'info');

    const results = {
      success: 0,
      failed: 0,
    };

    // 큐의 복사본으로 작업 (동시 수정 방지)
    const queueCopy = [...this.offlineQueue];

    for (const item of queueCopy) {
      try {
        const success = await this.retryRequest(item);

        if (success) {
          this.removeFromQueue(item.id);
          results.success++;
        } else {
          results.failed++;
        }
      } catch (error) {
        results.failed++;
      }
    }

    this.syncInProgress = false;
    this.saveQueueToStorage();
    this.updateUI();

    // 결과 알림
    if (results.success > 0) {
      this.showNotification(`${results.success}개 요청이 성공적으로 동기화되었습니다`, 'success');
    }

    if (results.failed > 0) {
      this.showNotification(`${results.failed}개 요청 동기화에 실패했습니다`, 'error');
    }
  }

  // 요청 재시도
  async retryRequest(item) {
    const { request } = item;

    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        signal: AbortSignal.timeout(10000), // 10초 타임아웃
      });

      if (response.ok) {
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      item.retryCount++;

      if (item.retryCount >= this.maxRetries) {
        console.warn(`오프라인 요청 최대 재시도 횟수 초과: ${item.request.url}`);
        this.removeFromQueue(item.id);
        return false;
      }

      console.warn(`오프라인 요청 재시도 실패: ${item.request.url}`);
      return false;
    }
  }

  // 큐에서 항목 제거
  removeFromQueue(id) {
    const index = this.offlineQueue.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.offlineQueue.splice(index, 1);
    }
  }

  // 로컬 스토리지에 큐 저장
  saveQueueToStorage() {
    try {
      localStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      // localStorage write 실패 시 무시 (용량 부족 등)
      console.warn('Failed to save offline queue to storage:', error);
    }
  }

  // 로컬 스토리지에서 큐 복원
  loadQueueFromStorage() {
    try {
      const stored = localStorage.getItem('offline_queue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
      }
    } catch (error) {
      // localStorage read/parse 실패 시 빈 큐로 초기화
      console.warn('Failed to load offline queue from storage:', error);
      this.offlineQueue = [];
    }
  }

  // Service Worker에 메시지 전송
  notifyServiceWorker(type, data = {}) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type,
        ...data,
      });
    }
  }

  // 알림 표시
  showNotification(message, type = 'info') {
    // 커스텀 알림 UI 구현
    const notification = this.createNotificationElement(message, type);
    document.body.appendChild(notification);

    // 3초 후 자동 제거
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);

    // 이벤트 발생
    this.emit('notification', { message, type });
  }

  // 알림 요소 생성
  createNotificationElement(message, type) {
    const notification = document.createElement('div');
    notification.className = `offline-notification offline-notification--${type}`;

    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    };

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      max-width: 300px;
      font-size: 14px;
      line-height: 1.4;
      animation: slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>${icons[type] || icons.info}</span>
        <span>${message}</span>
      </div>
    `;

    // 애니메이션 CSS 추가 (한 번만)
    if (!document.getElementById('offline-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'offline-notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return notification;
  }

  // UI 상태 업데이트
  updateUI() {
    // 온라인/오프라인 상태 표시
    this.updateConnectionStatus();

    // 큐 상태 표시
    this.updateQueueStatus();

    // 페이지별 UI 업데이트
    this.updatePageUI();
  }

  // 연결 상태 표시 업데이트
  updateConnectionStatus() {
    const statusElement =
      document.getElementById('connection-status') || this.createConnectionStatusElement();

    if (this.isOnline) {
      statusElement.className = 'connection-status connection-status--online';
      statusElement.innerHTML = '🟢 온라인';
    } else {
      statusElement.className = 'connection-status connection-status--offline';
      statusElement.innerHTML = '🔴 오프라인';
    }
  }

  // 연결 상태 요소 생성
  createConnectionStatusElement() {
    const element = document.createElement('div');
    element.id = 'connection-status';
    element.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      z-index: 1000;
      transition: all 0.3s ease;
    `;

    document.body.appendChild(element);
    return element;
  }

  // 큐 상태 업데이트
  updateQueueStatus() {
    if (this.offlineQueue.length > 0) {
      const queueElement =
        document.getElementById('queue-status') || this.createQueueStatusElement();

      queueElement.innerHTML = `📋 대기 중인 요청: ${this.offlineQueue.length}개`;
      queueElement.style.display = 'block';
    } else {
      const queueElement = document.getElementById('queue-status');
      if (queueElement) {
        queueElement.style.display = 'none';
      }
    }
  }

  // 큐 상태 요소 생성
  createQueueStatusElement() {
    const element = document.createElement('div');
    element.id = 'queue-status';
    element.style.cssText = `
      position: fixed;
      bottom: 60px;
      left: 20px;
      padding: 8px 12px;
      background: #f59e0b;
      color: white;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      z-index: 1000;
      display: none;
    `;

    document.body.appendChild(element);
    return element;
  }

  // 페이지별 UI 업데이트
  updatePageUI() {
    // 오프라인 상태에서 특정 기능 비활성화
    const formsToDisable = document.querySelectorAll('form[data-requires-online="true"]');
    const buttonsToDisable = document.querySelectorAll('button[data-requires-online="true"]');

    const elements = [...formsToDisable, ...buttonsToDisable];

    elements.forEach((element) => {
      if (this.isOnline) {
        element.disabled = false;
        element.classList.remove('offline-disabled');
      } else {
        element.disabled = true;
        element.classList.add('offline-disabled');
      }
    });
  }

  // 오프라인 콘텐츠 제공
  getOfflineContent(url) {
    return this.offlineContent.get(url);
  }

  // 이벤트 리스너 등록
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // 이벤트 리스너 제거
  off(event, callback) {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event);
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 이벤트 발생
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.warn(`오프라인 매니저 이벤트 콜백 오류:`, error);
        }
      });
    }
  }

  // ID 생성
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 현재 상태 반환
  getStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.offlineQueue.length,
      syncInProgress: this.syncInProgress,
      offlineContentCount: this.offlineContent.size,
    };
  }

  // 수동 동기화 트리거
  async forcSync() {
    if (this.isOnline) {
      await this.syncOfflineQueue();
    } else {
      this.showNotification('온라인 상태에서만 동기화할 수 있습니다', 'warning');
    }
  }

  // 정리
  destroy() {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', this.handleSWMessage.bind(this));
    }

    this.listeners.clear();
  }
}

// 전역으로 내보내기
window.OfflineManager = OfflineManager;

// 자동 초기화
if (document.readyState === 'dh-u-loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const offlineManager = new OfflineManager();
    window.offlineManager = offlineManager;
  });
} else {
  const offlineManager = new OfflineManager();
  window.offlineManager = offlineManager;
}

export default OfflineManager;
