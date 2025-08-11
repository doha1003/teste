/**
 * 긴급 API 완화 조치 시스템
 * 팀리더 지시: API 장애 상황에서 사용자 경험 보호
 *
 * @version 1.0.0
 * @created 2025-08-03
 * @purpose 도메인 DNS 문제로 인한 API 접근 불가 상황 대응
 */

(function () {
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
      // 긴급 상황: API 완전 차단 상태이므로 즉시 Emergency 모드 활성화
      console.warn('🚨 긴급 상황 감지: API 서비스 접근 불가 - Emergency 모드 활성화');
      this.isEmergencyMode = true;
      this.showEmergencyNotification();

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
     * 향상된 API 엔드포인트 헬스 체크 (CORS 문제 해결 포함)
     */
    async performHealthCheck() {
      const endpoints = [
        {
          name: 'Vercel Primary (Enhanced)',
          url: 'https://doha-kr-8f3cg28hm-dohas-projects-4691afdc.vercel.app/api/health',
          type: 'vercel-primary',
        },
        {
          name: 'Vercel Generic',
          url: 'https://doha-kr.vercel.app/api/health',
          type: 'vercel-generic',
        },
        {
          name: 'Local Development',
          url: 'http://localhost:3000/api/health',
          type: 'local',
        }
        // GitHub Pages는 정적 호스팅이므로 API 지원 안함 - 제거
      ];

      this.workingEndpoints = [];
      let anyWorking = false;
      const healthResults = [];

      for (const endpoint of endpoints) {
        try {
          // 더 포괄적인 fetch 옵션
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃

          const response = await fetch(endpoint.url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'X-Requested-With': 'XMLHttpRequest'
            },
            mode: 'cors',
            credentials: 'omit'
          });

          clearTimeout(timeoutId);

          const result = {
            endpoint: endpoint.name,
            url: endpoint.url,
            status: response.status,
            ok: response.ok,
            timestamp: new Date().toISOString()
          };

          // 200 OK 또는 기타 성공적인 응답 처리
          if (response.ok) {
            try {
              const data = await response.json();
              result.data = data;
              result.healthy = true;
            } catch (jsonError) {
              result.healthy = true; // JSON 파싱 실패해도 200이면 서버는 작동 중
              result.warning = 'JSON parsing failed but server responded';
            }

            this.workingEndpoints.push({...endpoint, lastCheck: Date.now(), healthy: true});
            anyWorking = true;
            console.log(`✅ ${endpoint.name} 정상 작동 (${response.status})`);

          } else if (response.status === 401 || response.status === 403) {
            // 인증/권한 오류는 서버가 작동 중임을 의미
            result.healthy = true;
            result.authIssue = true;
            this.workingEndpoints.push({...endpoint, lastCheck: Date.now(), healthy: true, authIssue: true});
            anyWorking = true;
            console.warn(`⚠️ ${endpoint.name} 인증 문제 있으나 서버 작동 중 (${response.status})`);

          } else {
            result.healthy = false;
            result.error = `HTTP ${response.status}`;
            console.warn(`❌ ${endpoint.name} HTTP 오류: ${response.status}`);
          }

          healthResults.push(result);

        } catch (error) {
          const result = {
            endpoint: endpoint.name,
            url: endpoint.url,
            healthy: false,
            error: error.message,
            timestamp: new Date().toISOString()
          };

          // 특정 오류 타입 처리
          if (error.name === 'AbortError') {
            result.error = 'Request timeout (8s)';
          } else if (error.message.includes('CORS')) {
            result.error = 'CORS policy error';
            result.corsIssue = true;
          } else if (error.message.includes('Failed to fetch')) {
            result.error = 'Network connection failed';
            result.networkIssue = true;
          }

          healthResults.push(result);
          console.warn(`❌ ${endpoint.name} 접근 불가:`, error.message);
        }
      }

      // 상태 업데이트
      const wasEmergencyMode = this.isEmergencyMode;
      this.isEmergencyMode = !anyWorking;
      this.lastHealthCheck = Date.now();
      this.lastHealthResults = healthResults;

      // 헬스체크 결과 상세 로그
      console.log('🔍 Health Check Results:', {
        totalEndpoints: endpoints.length,
        workingEndpoints: this.workingEndpoints.length,
        emergencyMode: this.isEmergencyMode,
        timestamp: new Date().toISOString()
      });

      // 상태 변경 시 사용자에게 알림
      if (wasEmergencyMode !== this.isEmergencyMode) {
        this.notifyUserIfNeeded();
      }

      return {
        working: this.workingEndpoints,
        results: healthResults,
        emergency: this.isEmergencyMode
      };
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
      if (existing) {
        existing.remove();
      }

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
          '계획했던 일들이 순조롭게 진행될 수 있습니다. 자신감을 가지세요.',
        ],
        love: [
          '진실한 마음이 상대방에게 전해질 때입니다.',
          '소통을 통해 더 깊은 이해가 가능할 것입니다.',
          '새로운 만남의 기회가 생길 수 있습니다.',
          '기존 관계를 되돌아보는 시간을 가져보세요.',
          '서로를 배려하는 마음이 관계를 발전시킬 것입니다.',
        ],
        career: [
          '노력의 결실을 맺을 때가 다가오고 있습니다.',
          '새로운 도전의 기회가 찾아올 수 있습니다.',
          '동료들과의 협력이 좋은 성과를 낼 것입니다.',
          '창의적인 접근이 문제 해결의 열쇠가 될 것입니다.',
          '차근차근 계획을 실행하면 좋은 결과를 얻을 수 있습니다.',
        ],
      };

      const selectedFortunes = fortunes[type] || fortunes.daily;
      const fortune = selectedFortunes[seed % selectedFortunes.length];

      return {
        success: true,
        fortune,
        isOffline: true,
        type,
        timestamp: date.toISOString(),
        notice:
          '현재 오프라인 모드로 운영 중입니다. 서비스 복구 후 더 정확한 운세를 제공받으실 수 있습니다.',
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
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }

      return Math.abs(hash);
    }

    /**
     * 상태 정보 반환 (확장된 버전)
     */
    getStatus() {
      return {
        isEmergencyMode: this.isEmergencyMode,
        workingEndpoints: this.workingEndpoints,
        workingEndpointsCount: this.workingEndpoints.length,
        lastHealthCheck: this.lastHealthCheck,
        healthCheckAge: this.lastHealthCheck ? Date.now() - this.lastHealthCheck : null,
        healthCheckInterval: this.healthCheckInterval,
        lastHealthResults: this.lastHealthResults || [],
        corsVersion: '3.0.0',
        systemStatus: {
          apiAvailable: !this.isEmergencyMode,
          offlineMode: this.isEmergencyMode,
          autoRecovery: true,
          monitoringActive: true
        },
        recommendations: this.getRecommendations()
      };
    }

    /**
     * 시스템 권장사항 생성
     */
    getRecommendations() {
      const recommendations = [];
      
      if (this.isEmergencyMode) {
        recommendations.push('현재 오프라인 모드로 동작 중입니다. 기본 기능은 계속 사용 가능합니다.');
        recommendations.push('서비스 복구를 위해 자동 재시도가 진행 중입니다.');
      } else if (this.workingEndpoints.length === 1) {
        recommendations.push('일부 서버만 작동 중입니다. 서비스가 일시적으로 불안정할 수 있습니다.');
      } else if (this.workingEndpoints.length > 1) {
        recommendations.push('여러 서버가 정상 작동 중입니다. 서비스 이용에 문제가 없습니다.');
      }

      return recommendations;
    }

    /**
     * 디버깅 정보 반환
     */
    getDebugInfo() {
      return {
        ...this.getStatus(),
        currentUrl: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        endpoints: {
          total: 4,
          types: ['vercel-primary', 'vercel-generic', 'github', 'local']
        }
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
      window.apiHelpers.fortune = async function (payload) {
        try {
          return await originalCallAPI(payload);
        } catch (error) {
          console.warn('API 호출 실패, 오프라인 모드로 전환:', error.message);
          return emergencyManager.generateOfflineFortune(payload.type, payload.userData);
        }
      };
    }
  }

  // APIManager가 없는 경우 직접 대체 (GitHub Pages 환경)
  if (!window.APIManager && !window.apiHelpers) {
    console.log('🚑 API Manager 없음 - 완전 오프라인 모드 활성화');

    window.apiHelpers = {
      async fortune(payload) {
        console.log('🔄 오프라인 운세 생성:', payload.type);
        return emergencyManager.generateOfflineFortune(payload.type, payload.userData);
      },
    };

    // APIManager 대체
    window.APIManager = {
      async callAPI(endpoint, payload) {
        if (endpoint === 'fortune') {
          return window.apiHelpers.fortune(payload);
        }
        throw new Error(`오프라인 모드: ${endpoint} 엔드포인트 지원되지 않음`);
      },
    };
  }

  // 전역 노출
  window.EmergencyAPIManager = emergencyManager;

  console.log('🚑 긴급 API 완화 시스템 활성화됨');

  // UI/UX 문제 디버깅을 위한 추가 검증
  if (window.location.pathname.includes('/tests/')) {
    // 심리테스트 페이지 전용 검증
    const checkTestEnvironment = () => {
      const issues = [];

      // CSS 로딩 확인
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      if (stylesheets.length === 0) {
        issues.push('CSS 파일이 로딩되지 않았습니다');
      }

      // JavaScript 모듈 로딩 확인
      const scripts = document.querySelectorAll('script[type="module"]');
      if (scripts.length === 0) {
        issues.push('ES6 모듈이 로딩되지 않았습니다');
      }

      // 네비게이션 로딩 확인
      const nav = document.querySelector('#navbar-placeholder');
      if (nav && nav.innerHTML.trim() === '') {
        issues.push('네비게이션이 로딩되지 않았습니다');
      }

      // 모바일 메뉴 버튼 확인
      const mobileMenuBtn = document.querySelector(
        '.mobile-menu-btn, .mobile-menu-toggle, .navbar-toggle'
      );
      if (window.innerWidth <= 768 && !mobileMenuBtn) {
        issues.push('모바일 메뉴 버튼을 찾을 수 없습니다');
      }

      // 테스트 서비스 클래스 확인
      const testContainer = document.querySelector('#test-screen, #intro-screen, .test-container');
      if (!testContainer) {
        issues.push('테스트 컨테이너를 찾을 수 없습니다');
      }

      if (issues.length > 0) {
        console.warn('🚨 UI/UX 문제 감지:', issues);
        // 사용자에게 문제 알림 (개발환경에서만)
        if (
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.search.includes('debug=true')
        ) {
          const notification = document.createElement('div');
          notification.style.cssText = `
            position: fixed; top: 70px; right: 10px; 
            background: #ff6b6b; color: white; 
            padding: 10px 15px; border-radius: 8px; 
            z-index: 10000; font-size: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            max-width: 300px; word-break: keep-all;
          `;
          notification.innerHTML = `⚠️ UI 문제 ${issues.length}개 감지`;
          notification.onclick = () => {
            alert(`감지된 문제:\\n• ${issues.join('\\n• ')}`);
            notification.remove();
          };
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 8000);
        }
      } else {
        console.log('✅ UI/UX 검증 완료: 모든 항목 정상');
      }
    };

    // 페이지 로드 후 검증 실행
    if (document.readyState === 'dh-u-loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(checkTestEnvironment, 2000);
      });
    } else {
      setTimeout(checkTestEnvironment, 2000);
    }
  }
})();
