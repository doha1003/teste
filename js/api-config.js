// Prevent multiple declarations
(function () {
  'use strict';

  // Check if APIManager already exists
  if (window.APIManager) {
    return;
  }

  // Original code
  // Browser-compatible version - no ES6 exports
  /**
   * API 설정 및 보안 관리 모듈 (TypeScript)
   * 안전한 API 호출과 환경별 설정을 관리합니다
   *
   * @version 3.0.0
   * @author doha.kr
   * @warning 이 파일은 민감한 정보를 포함하므로 절대 공개 저장소에 올리지 마세요!
   */
  /**
   * API 헬퍼 클래스
   */
  class APIManager {
    constructor(config, securityConfig) {
      this.config = config;
      this.securityConfig = securityConfig;
      this.rateLimits = new Map();
    }
    /**
     * 안전한 API 호출
     */
    async secureRequest(url, options = {}) {
      const startTime = performance.now();
      const requestId = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'same-origin',
      };

      // CSRF 토큰 추가
      if (this.securityConfig.csrf.enabled && window.csrfToken) {
        defaultOptions.headers[this.securityConfig.csrf.headerName] = window.csrfToken;
      }

      // 로깅이 가능한 경우 요청 로그
      if (typeof window.DohaLogger !== 'undefined') {
        window.DohaLogger.info('API Request Started', {
          requestId,
          url,
          method: options.method || 'GET',
          hasBody: !!options.body,
        });
      }

      try {
        // 타임아웃 설정 (30초)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch(url, { 
          ...defaultOptions, 
          ...options,
          signal: options.signal || controller.signal
        });
        
        clearTimeout(timeoutId);
        const duration = performance.now() - startTime;

        if (!response.ok) {
          const error = new Error(`API Error: ${response.status} ${response.statusText}`);

          // 에러 로깅
          if (typeof window.DohaLogger !== 'undefined') {
            window.DohaLogger.logApiCall(url, options.method || 'GET', response.status, duration, {
              requestId,
              statusText: response.statusText,
              error: true,
            });
          }

          throw error;
        }

        const data = await response.json();

        // 성공 로깅
        if (typeof window.DohaLogger !== 'undefined') {
          window.DohaLogger.logApiCall(url, options.method || 'GET', response.status, duration, {
            requestId,
            responseSize: JSON.stringify(data).length,
            success: true,
          });
        }

        return data;
      } catch (error) {
        const duration = performance.now() - startTime;

        // 에러 로깅
        if (typeof window.DohaLogger !== 'undefined') {
          window.DohaLogger.error('API Request Failed', {
            requestId,
            url,
            method: options.method || 'GET',
            error: error.message,
            duration,
          });
        } else {
        }

        throw error;
      }
    }
    /**
     * Rate Limiting 체크
     */
    checkRateLimit(key) {
      const now = Date.now();
      const limit = this.rateLimits.get(key) || { count: 0, resetTime: now };
      if (now > limit.resetTime) {
        limit.count = 0;
        limit.resetTime = now + this.securityConfig.rateLimit.windowMs;
      }
      if (limit.count >= this.securityConfig.rateLimit.maxRequests) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      limit.count++;
      this.rateLimits.set(key, limit);
    }
    /**
     * 현재 환경 감지
     */
    detectEnvironment() {
      const { hostname } = window.location;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
      } else if (hostname.includes('test') || hostname.includes('staging')) {
        return 'test';
      }
      return 'production';
    }
    /**
     * 도메인 검증
     */
    isOriginAllowed(origin) {
      return this.securityConfig.allowedOrigins.includes(origin);
    }
    /**
     * Fortune API 호출
     */
    async callFortuneAPI(payload) {
      // API 키 확인
      if (!this.config.GEMINI_API_KEY) {
        throw new Error('운세 서비스를 이용하려면 API 키가 필요합니다. 관리자에게 문의해주세요.');
      }

      this.checkRateLimit('fortune-api');

      const apiUrl = this.config.endpoints.fortune || '/api/fortune';

      return this.secureRequest(apiUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    /**
     * 카카오 SDK 초기화
     */
    initKakao() {
      try {
        if (typeof window.Kakao === 'undefined') {
          if (this.detectEnvironment() === 'development') {
          } else {
          }
          return;
        }
        if (window.Kakao.isInitialized && window.Kakao.isInitialized()) {
          if (this.detectEnvironment() === 'development') {
          }
          return;
        }
        const kakaoKey = this.getKakaoKey();
        if (kakaoKey && kakaoKey !== 'KAKAO_APP_KEY_PLACEHOLDER') {
          window.Kakao.init(kakaoKey);
          if (this.detectEnvironment() === 'development') {
          }
        } else {
          if (this.detectEnvironment() === 'development') {
          } else {
          }
        }
      } catch (error) {}
    }
    /**
     * 카카오 키 가져오기
     */
    getKakaoKey() {
      return (
        window.KAKAO_APP_KEY ||
        (window.API_CONFIG && window.API_CONFIG.KAKAO_JS_KEY) ||
        (window.API_CONFIG && window.API_CONFIG.kakao && window.API_CONFIG.kakao.appKey) ||
        this.config.KAKAO_JS_KEY
      );
    }
    /**
     * 설정 정보 반환
     */
    getConfig() {
      return Object.freeze({ ...this.config });
    }
    /**
     * 보안 설정 정보 반환
     */
    getSecurityConfig() {
      return Object.freeze({ ...this.securityConfig });
    }
    /**
     * Rate Limit 상태 반환
     */
    getRateLimitStatus(key) {
      return this.rateLimits.get(key);
    }
    /**
     * Rate Limit 초기화
     */
    clearRateLimit(key) {
      if (key) {
        this.rateLimits.delete(key);
      } else {
        this.rateLimits.clear();
      }
    }
  }
  /**
   * 환경 변수에서 설정값 가져오기
   */
  function getEnvValue(key, fallback) {
    // 브라우저 환경에서는 process.env가 빌드 시점에 주입됨
    // TypeScript에서는 any로 캐스팅하여 에러 방지
    const env = globalThis.process?.env || {};
    return env[key] || fallback;
  }
  /**
   * API 설정 객체
   */
  const API_CONFIG = {
    // API Keys - Vercel 환경변수에서 주입됨
    // API 키는 빈 문자열 폴백 없이 명시적으로 체크
    KAKAO_JS_KEY: window.KAKAO_JS_KEY || null,
    GEMINI_API_KEY: window.GEMINI_API_KEY || null,

    // Gemini API
    gemini: {
      endpoint: '/api/fortune',
      timeout: 30000,
    },

    // Fortune API 엔드포인트 (레거시 호환성)
    endpoints: {
      fortune: '/api/fortune',
    },
    // 카카오 SDK - 환경변수나 빌드 시 주입되어야 함
    kakao: {
      appKey: window.KAKAO_APP_KEY || getEnvValue('KAKAO_APP_KEY', null),
    },
    // Google AdSense - 공개되어도 상대적으로 안전
    adsense: {
      client: 'ca-pub-7905640648499222',
    },
    // Vercel API 베이스 URL
    VERCEL_API_BASE: 'https://doha-kr-api.vercel.app/api',
  };
  /**
   * API 보안 설정
   */
  const SECURITY_CONFIG = {
    // CSRF 토큰 설정
    csrf: {
      enabled: true,
      headerName: 'X-CSRF-Token',
    },
    // Rate Limiting
    rateLimit: {
      maxRequests: 100,
      windowMs: 60000, // 1분
    },
    // 허용된 도메인
    allowedOrigins: [
      'https://doha.kr',
      'https://www.doha.kr',
      'http://localhost:8000', // 개발용
      'http://localhost:3000', // 개발용 대체
      'http://127.0.0.1:8000', // 개발용 대체
    ],
  };
  /**
   * API 매니저 인스턴스 생성
   */
  const apiManager = new APIManager(API_CONFIG, SECURITY_CONFIG);
  /**
   * 카카오 SDK 초기화 함수 (전역)
   */
  function initKakao() {
    apiManager.initKakao();
  }
  /**
   * DOM 로드 후 초기화
   */
  function initializeAPIConfig() {
    if (document.readyState === 'dh-u-loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initKakao, 100);
      });
    } else {
      setTimeout(initKakao, 100);
    }
  }
  // 즉시 초기화
  initializeAPIConfig();
  window.API_CONFIG = API_CONFIG;
  window.ApiHelper = apiManager;
  window.initKakao = initKakao;
  /**
   * 타입 안전 API 헬퍼 함수들
   */
  const apiHelpers = {
    /**
     * Fortune API 호출
     */
    fortune: (payload) => {
      return apiManager.callFortuneAPI(payload);
    },
    /**
     * 일반 API 호출
     */
    request: (url, options) => {
      return apiManager.secureRequest(url, options);
    },
    /**
     * Rate Limit 체크
     */
    checkRateLimit: (key) => {
      apiManager.checkRateLimit(key);
    },
    /**
     * 설정 가져오기
     */
    getConfig: () => {
      return apiManager.getConfig();
    },
    /**
     * 환경 감지
     */
    getEnvironment: () => {
      return apiManager.detectEnvironment();
    },
  };

  // 전역으로 노출
  window.apiHelpers = apiHelpers;
  // export { APIManager, API_CONFIG, SECURITY_CONFIG, apiManager };
  // export default apiManager;
  //# sourceMappingURL=api-config.js.map

  // Export to global scope
  window.APIManager = APIManager;
})();
