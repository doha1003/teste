/**
 * PWA Install Page Script
 * PWA 설치 관련 페이지 스크립트
 */

import { installApp, isPWAInstalled, hideInstallPrompt } from '../core/pwa-helpers.js';

class PWAInstallManager {
  constructor() {
    this.installButton = null;
    this.statusElement = null;
    this.init();
  }

  init() {
    this.createInstallUI();
    this.setupEventListeners();
    this.updateInstallStatus();
    
    // PWA 상태 주기적 체크
    setInterval(() => {
      this.updateInstallStatus();
    }, 2000);
  }

  createInstallUI() {
    // 기존 설치 UI가 있으면 제거
    const existingUI = document.getElementById('pwa-install-ui');
    if (existingUI) {
      existingUI.remove();
    }

    // PWA 설치 UI 생성
    const installUI = document.createElement('div');
    installUI.id = 'pwa-install-ui';
    installUI.innerHTML = `
      <div class="pwa-install-container">
        <div class="pwa-install-header">
          <div class="pwa-install-icon">📱</div>
          <h2>앱으로 설치하기</h2>
          <div id="pwa-install-status" class="pwa-install-status"></div>
        </div>
        
        <div class="pwa-install-benefits">
          <h3>PWA 앱의 장점</h3>
          <ul>
            <li>✨ 빠른 로딩 속도</li>
            <li>📱 네이티브 앱 같은 경험</li>
            <li>🔄 오프라인에서도 사용 가능</li>
            <li>🔔 푸시 알림 지원</li>
            <li>💾 데이터 절약</li>
            <li>🚀 홈 화면에서 바로 접근</li>
          </ul>
        </div>

        <div class="pwa-install-actions">
          <button id="pwa-install-btn" class="dh-c-btn btn--primary" disabled>
            <span class="btn-icon">📲</span>
            <span class="btn-text">설치 대기 중...</span>
          </button>
          <button id="pwa-check-btn" class="dh-c-btn btn--secondary">
            <span class="btn-icon">🔄</span>
            <span class="btn-text">상태 확인</span>
          </button>
        </div>

        <div class="pwa-install-instructions">
          <h3>수동 설치 방법</h3>
          <div class="install-steps">
            <div class="step">
              <strong>Chrome (Android/Desktop):</strong>
              <p>주소창 옆 설치 아이콘 클릭 또는 메뉴 > '앱 설치'</p>
            </div>
            <div class="step">
              <strong>Safari (iOS):</strong>
              <p>공유 버튼 > '홈 화면에 추가'</p>
            </div>
            <div class="step">
              <strong>Edge:</strong>
              <p>메뉴(⋯) > '앱' > '이 사이트를 앱으로 설치'</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // 스타일 추가
    this.addInstallUIStyles();

    // 페이지에 추가
    const dh-l-main = document.querySelector('main') || document.body;
    main.appendChild(installUI);

    // 요소 참조 저장
    this.installButton = document.getElementById('pwa-install-btn');
    this.statusElement = document.getElementById('pwa-install-status');
  }

  addInstallUIStyles() {
    if (document.getElementById('pwa-install-ui-styles')) {
      return;
    }

    const styles = document.createElement('style');
    styles.id = 'pwa-install-ui-styles';
    styles.textContent = `
      .pwa-install-container {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }

      .pwa-install-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .pwa-install-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      .pwa-install-header h2 {
        margin: 0 0 1rem;
        color: #1f2937;
        font-size: 1.75rem;
      }

      .pwa-install-status {
        padding: 0.75rem;
        border-radius: 8px;
        font-weight: 500;
        margin: 1rem 0;
      }

      .pwa-install-status.installed {
        background: #ecfdf5;
        color: #065f46;
        border: 1px solid #10b981;
      }

      .pwa-install-status.available {
        background: #eff6ff;
        color: #1e40af;
        border: 1px solid #3b82f6;
      }

      .pwa-install-status.waiting {
        background: #fef3c7;
        color: #92400e;
        border: 1px solid #f59e0b;
      }

      .pwa-install-benefits {
        margin-bottom: 2rem;
      }

      .pwa-install-benefits h3 {
        color: #374151;
        margin-bottom: 1rem;
      }

      .pwa-install-benefits ul {
        list-style: none;
        padding: 0;
        display: grid;
        gap: 0.5rem;
      }

      .pwa-install-benefits li {
        color: #059669;
        font-weight: 500;
        padding: 0.5rem 0;
      }

      .pwa-install-actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .pwa-install-actions .btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.2s ease;
        cursor: pointer;
        border: none;
      }

      .btn--primary {
        background: #3b82f6;
        color: white;
      }

      .btn--primary:hover:not(:disabled) {
        background: #2563eb;
        transform: translateY(-1px);
      }

      .btn--primary:disabled {
        background: #9ca3af;
        cursor: not-allowed;
        transform: none;
      }

      .btn--secondary {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
      }

      .btn--secondary:hover {
        background: #f9fafb;
        border-color: #9ca3af;
      }

      .pwa-install-instructions {
        border-top: 1px solid #e5e7eb;
        padding-top: 2rem;
      }

      .pwa-install-instructions h3 {
        color: #374151;
        margin-bottom: 1rem;
      }

      .install-steps {
        display: grid;
        gap: 1rem;
      }

      .step {
        padding: 1rem;
        background: #f9fafb;
        border-radius: 8px;
        border-left: 4px solid #3b82f6;
      }

      .step strong {
        color: #1f2937;
        display: block;
        margin-bottom: 0.5rem;
      }

      .step p {
        margin: 0;
        color: #6b7280;
        font-size: 0.9rem;
      }

      @media (max-width: 640px) {
        .pwa-install-container {
          margin: 1rem;
          padding: 1.5rem;
        }

        .pwa-install-actions {
          flex-direction: column;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  setupEventListeners() {
    // 설치 버튼 클릭
    document.addEventListener('click', async (e) => {
      if (e.target.closest('#pwa-install-btn')) {
        await this.handleInstallClick();
      }
      
      if (e.target.closest('#pwa-check-btn')) {
        this.updateInstallStatus();
      }
    });

    // PWA 설치 상태 변경 감지
    window.addEventListener('beforeinstallprompt', () => {
      this.updateInstallStatus();
    });

    window.addEventListener('appinstalled', () => {
      this.updateInstallStatus();
    });
  }

  async handleInstallClick() {
    const success = await installApp();
    if (success) {
      this.showInstallSuccess();
    } else {
      this.showInstallError();
    }
    
    // 상태 업데이트
    setTimeout(() => {
      this.updateInstallStatus();
    }, 1000);
  }

  updateInstallStatus() {
    if (!this.statusElement || !this.installButton) {return;}

    const isInstalled = isPWAInstalled();
    
    if (isInstalled) {
      this.statusElement.textContent = '✅ 이미 앱으로 설치되어 있습니다';
      this.statusElement.className = 'pwa-install-status installed';
      
      this.installButton.disabled = true;
      this.installButton.querySelector('.btn-text').textContent = '설치 완료';
      this.installButton.querySelector('.btn-icon').textContent = '✅';
      
    } else if (window.deferredPrompt) {
      this.statusElement.textContent = '📱 앱 설치가 가능합니다';
      this.statusElement.className = 'pwa-install-status available';
      
      this.installButton.disabled = false;
      this.installButton.querySelector('.btn-text').textContent = '지금 설치하기';
      this.installButton.querySelector('.btn-icon').textContent = '📲';
      
    } else {
      this.statusElement.textContent = '⏳ 설치 프롬프트 대기 중 (수동 설치 가능)';
      this.statusElement.className = 'pwa-install-status waiting';
      
      this.installButton.disabled = true;
      this.installButton.querySelector('.btn-text').textContent = '설치 대기 중';
      this.installButton.querySelector('.btn-icon').textContent = '⏳';
    }
  }

  showInstallSuccess() {
    this.showNotification('🎉 앱이 성공적으로 설치되었습니다!', 'success');
  }

  showInstallError() {
    this.showNotification('❌ 설치에 실패했습니다. 수동으로 설치해 보세요.', 'error');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `pwa-notification pwa-notification--${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      ${type === 'success' ? 'background: #10b981;' : ''}
      ${type === 'error' ? 'background: #ef4444;' : ''}
      ${type === 'info' ? 'background: #3b82f6;' : ''}
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
}

// DOM이 로드되면 PWA 설치 매니저 초기화
if (document.readyState === 'dh-u-loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PWAInstallManager();
  });
} else {
  new PWAInstallManager();
}

export default PWAInstallManager;