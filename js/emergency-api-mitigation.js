/**
 * 긴급 API 완화 조치 시스템
 * 팀리더 지시: API 장애 상황에서 사용자 경험 보호
 * 
 * @version 1.0.0
 * @created 2025-08-03
 * @purpose 도메인 DNS 문제로 인한 API 접근 불가 상황 대응
 */

(function() {
  'use strict';

  // 긴급 상황 감지 및 대응 시스템
  class EmergencyAPIManager {
    constructor() {
      this.isEmergencyMode = false;
      this.workingEndpoints = [];
      this.lastHealthCheck = null;
      this.healthCheckInterval = 30000; // 30초마다 체크
      this.offlineStorage = new Map();
      
      this.init();
    }

    async init() {
      // 즉시 헬스 체크 실행
      await this.performHealthCheck();
      
      // 주기적 헬스 체크 설정
      setInterval(() => {
        this.performHealthCheck();
      }, this.healthCheckInterval);

      // 사용자에게 상황 알림
      this.notifyUserIfNeeded();
    }

    /**
     * API 엔드포인트 헬스 체크
     */
    async performHealthCheck() {
      const endpoints = [
        {
          name: 'Vercel Primary',
          url: 'https://doha-kr-8f3cg28hm-dohas-projects-4691afdc.vercel.app/api/health',
          type: 'vercel'
        },
        {
          name: 'GitHub Pages',
          url: 'https://doha.kr/api/health',
          type: 'github'
        }
      ];

      this.workingEndpoints = [];
      let anyWorking = false;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'GET',
            timeout: 5000,
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok || response.status === 401) { // 401은 인증 오류지만 서버가 작동 중
            this.workingEndpoints.push(endpoint);
            anyWorking = true;
            console.log(`✅ ${endpoint.name} 정상 작동`);
          }
        } catch (error) {
          console.warn(`❌ ${endpoint.name} 접근 불가:`, error.message);
        }
      }

      const wasEmergencyMode = this.isEmergencyMode;
      this.isEmergencyMode = !anyWorking;
      this.lastHealthCheck = Date.now();

      // 상태 변경 시 사용자에게 알림
      if (wasEmergencyMode !== this.isEmergencyMode) {
        this.notifyUserIfNeeded();
      }

      return this.workingEndpoints;
    }

    /**
     * 사용자에게 상황 알림
     */
    notifyUserIfNeeded() {
      if (this.isEmergencyMode) {
        this.showEmergencyNotification();
      } else if (this.workingEndpoints.length > 0) {
        this.showRecoveryNotification();
      }
    }

    /**
     * 긴급 상황 알림 표시
     */
    showEmergencyNotification() {
      const notification = document.createElement('div');
      notification.id = 'emergency-notification';
      notification.className = 'emergency-notification';
      notification.innerHTML = `
        <div class="emergency-content">
          <div class="emergency-icon">⚠️</div>
          <div class="emergency-text">
            <div class="emergency-title">서비스 일시 중단 안내</div>
            <div class="emergency-message">
              API 서비스 복구 중입니다. 기본적인 운세 서비스는 계속 이용하실 수 있습니다.
            </div>
          </div>
          <button class="emergency-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
      `;

      // 기존 알림 제거
      const existing = document.getElementById('emergency-notification');
      if (existing) existing.remove();

      document.body.appendChild(notification);

      // 5초 후 자동 제거
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 10000);
    }

    /**
     * 복구 알림 표시
     */
    showRecoveryNotification() {
      const notification = document.createElement('div');
      notification.className = 'recovery-notification';
      notification.innerHTML = `
        <div class="recovery-content">
          <div class="recovery-icon">✅</div>
          <div class="recovery-text">서비스가 정상 복구되었습니다!</div>
          <button class="recovery-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 5000);
    }

    /**
     * 오프라인 운세 생성
     */
    generateOfflineFortune(type = 'daily', userData = {}) {
      const date = new Date();
      const seed = this.createDateSeed(date, userData);
      
      const fortunes = {
        daily: [
          '오늘은 새로운 가능성이 열리는 날입니다. 작은 변화에도 주의를 기울여보세요.',
          '인간관계에서 좋은 소식이 있을 수 있습니다. 진심 어린 대화를 나누어보세요.',
          '창의적인 아이디어가 떠오를 수 있는 하루입니다. 영감을 놓치지 마세요.',
          '건강과 활력이 넘치는 날입니다. 적극적으로 활동해보세요.',
          '계획했던 일들이 순조롭게 진행될 수 있습니다. 자신감을 가지세요.'
        ],
        love: [
          '진실한 마음이 상대방에게 전해질 때입니다.',
          '소통을 통해 더 깊은 이해가 가능할 것입니다.',
          '새로운 만남의 기회가 생길 수 있습니다.',
          '기존 관계를 되돌아보는 시간을 가져보세요.',
          '서로를 배려하는 마음이 관계를 발전시킬 것입니다.'
        ],
        career: [
          '노력의 결실을 맺을 때가 다가오고 있습니다.',
          '새로운 도전의 기회가 찾아올 수 있습니다.',
          '동료들과의 협력이 좋은 성과를 낼 것입니다.',
          '창의적인 접근이 문제 해결의 열쇠가 될 것입니다.',
          '차근차근 계획을 실행하면 좋은 결과를 얻을 수 있습니다.'
        ]
      };

      const selectedFortunes = fortunes[type] || fortunes.daily;
      const fortune = selectedFortunes[seed % selectedFortunes.length];

      return {
        success: true,
        fortune: fortune,
        isOffline: true,
        type: type,
        timestamp: date.toISOString(),
        notice: '현재 오프라인 모드로 운영 중입니다. 서비스 복구 후 더 정확한 운세를 제공받으실 수 있습니다.'
      };
    }

    /**
     * 날짜 기반 시드 생성
     */
    createDateSeed(date, userData = {}) {
      const dateStr = date.toDateString();
      const userStr = JSON.stringify(userData);
      let hash = 0;
      
      for (let i = 0; i < (dateStr + userStr).length; i++) {
        const char = (dateStr + userStr).charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      return Math.abs(hash);
    }

    /**
     * 상태 정보 반환
     */
    getStatus() {
      return {
        isEmergencyMode: this.isEmergencyMode,
        workingEndpoints: this.workingEndpoints,
        lastHealthCheck: this.lastHealthCheck,
        healthCheckAge: this.lastHealthCheck ? Date.now() - this.lastHealthCheck : null
      };
    }
  }

  // CSS 스타일 추가
  const style = document.createElement('style');
  style.textContent = `
    .emergency-notification, .recovery-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      animation: slideIn 0.3s ease-out;
    }

    .emergency-notification {
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      color: white;
    }

    .recovery-notification {
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
    }

    .emergency-content, .recovery-content {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 12px;
    }

    .emergency-icon, .recovery-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .emergency-text {
      flex: 1;
    }

    .emergency-title {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .emergency-message, .recovery-text {
      font-size: 14px;
      opacity: 0.95;
      line-height: 1.4;
    }

    .emergency-close, .recovery-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .emergency-close:hover, .recovery-close:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
    }

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

    @media (max-width: 480px) {
      .emergency-notification, .recovery-notification {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }
    }
  `;
  document.head.appendChild(style);

  // 전역 인스턴스 생성
  const emergencyManager = new EmergencyAPIManager();

  // API Manager와 통합
  if (window.APIManager) {
    // 기존 API Manager의 fortune 호출을 래핑
    const originalCallAPI = window.apiHelpers?.fortune;
    if (originalCallAPI) {
      window.apiHelpers.fortune = async function(payload) {
        try {
          return await originalCallAPI(payload);
        } catch (error) {
          console.warn('API 호출 실패, 오프라인 모드로 전환:', error.message);
          return emergencyManager.generateOfflineFortune(payload.type, payload.userData);
        }
      };
    }
  }

  // 전역 노출
  window.EmergencyAPIManager = emergencyManager;

  console.log('🚑 긴급 API 완화 시스템 활성화됨');
})();