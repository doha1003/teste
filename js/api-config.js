// Prevent multiple declarations
(function() {
  'use strict';

  // Check if APIManager already exists
  if (window.APIManager) {
    console.log('APIManager already initialized, skipping...');
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
          const defaultOptions = {
              headers: {
                  'Content-Type': 'application/json',
                  ...options.headers
              },
              credentials: 'same-origin'
          };
          // CSRF 토큰 추가
          if (this.securityConfig.csrf.enabled && window.csrfToken) {
              defaultOptions.headers[this.securityConfig.csrf.headerName] = window.csrfToken;
          }
          try {
              const response = await fetch(url, { ...defaultOptions, ...options });
              if (!response.ok) {
                  throw new Error(`API Error: ${response.status} ${response.statusText}`);
              }
              const data = await response.json();
              return data;
          }
          catch (error) {
              console.warn('API Request Failed:', error);
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
          const hostname = window.location.hostname;
          if (hostname === 'localhost' || hostname === '127.0.0.1') {
              return 'development';
          }
          else if (hostname.includes('test') || hostname.includes('staging')) {
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
          this.checkRateLimit('fortune-api');
          
          const apiUrl = this.config.endpoints.fortune || 'https://doha-kr-api.vercel.app/api/fortune';
          
          return this.secureRequest(apiUrl, {
              method: 'POST',
              body: JSON.stringify(payload)
          });
      }
      /**
       * 카카오 SDK 초기화
       */
      initKakao() {
          try {
              if (typeof window.Kakao === 'undefined') {
                  if (this.detectEnvironment() === 'development') {
                      console.info('Kakao SDK not loaded');
                  }
                  else {
                      console.warn('Kakao SDK not available');
                  }
                  return;
              }
              if (window.Kakao.isInitialized && window.Kakao.isInitialized()) {
                  if (this.detectEnvironment() === 'development') {
                      console.info('Kakao SDK already initialized');
                  }
                  return;
              }
              const kakaoKey = this.getKakaoKey();
              if (kakaoKey && kakaoKey !== 'KAKAO_APP_KEY_PLACEHOLDER') {
                  window.Kakao.init(kakaoKey);
                  if (this.detectEnvironment() === 'development') {
                      console.info('Kakao SDK initialized successfully');
                  }
              }
              else {
                  if (this.detectEnvironment() === 'development') {
                      console.info('Kakao SDK key not configured for development');
                  }
                  else {
                      console.warn('Kakao SDK key not configured');
                  }
              }
          }
          catch (error) {
              console.warn('Failed to initialize Kakao SDK:', error);
          }
      }
      /**
       * 카카오 키 가져오기
       */
      getKakaoKey() {
          return (window.KAKAO_APP_KEY ||
              (window.API_CONFIG && window.API_CONFIG.KAKAO_JS_KEY) ||
              (window.API_CONFIG && window.API_CONFIG.kakao && window.API_CONFIG.kakao.appKey) ||
              this.config.KAKAO_JS_KEY);
      }
      /**
       * Fortune API 호출
       */
      async callFortuneAPI(payload) {
          this.checkRateLimit('fortune-api');
          return this.secureRequest(this.config.gemini.endpoint, {
              method: 'POST',
              body: JSON.stringify(payload),
              signal: AbortSignal.timeout(this.config.gemini.timeout)
          });
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
          }
          else {
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
      KAKAO_JS_KEY: window.KAKAO_JS_KEY || '',
      GEMINI_API_KEY: window.GEMINI_API_KEY || '',
      
      // Gemini API
      gemini: {
          endpoint: 'https://doha-kr-ap.vercel.app/api/fortune',
          timeout: 30000
      },
      // 카카오 SDK - 환경변수나 빌드 시 주입되어야 함
      kakao: {
          appKey: window.KAKAO_APP_KEY || getEnvValue('KAKAO_APP_KEY', 'KAKAO_APP_KEY_PLACEHOLDER')
      },
      // 카카오 JS 키 (호환성을 위해 추가)
      KAKAO_JS_KEY: window.KAKAO_APP_KEY || getEnvValue('KAKAO_APP_KEY', 'KAKAO_APP_KEY_PLACEHOLDER'),
      // Google AdSense - 공개되어도 상대적으로 안전
      adsense: {
          client: 'ca-pub-7905640648499222'
      },
      // Vercel API 베이스 URL
      VERCEL_API_BASE: 'https://doha-kr-ap.vercel.app/api'
  };
  /**
   * API 보안 설정
   */
  const SECURITY_CONFIG = {
      // CSRF 토큰 설정
      csrf: {
          enabled: true,
          headerName: 'X-CSRF-Token'
      },
      // Rate Limiting
      rateLimit: {
          maxRequests: 100,
          windowMs: 60000 // 1분
      },
      // 허용된 도메인
      allowedOrigins: [
          'https://doha.kr',
          'https://www.doha.kr',
          'http://localhost:8000', // 개발용
          'http://localhost:3000', // 개발용 대체
          'http://127.0.0.1:8000' // 개발용 대체
      ]
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
      if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
              setTimeout(initKakao, 100);
          });
      }
      else {
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
      }
  };
  
  // 전역으로 노출
  window.apiHelpers = apiHelpers;
  // export { APIManager, API_CONFIG, SECURITY_CONFIG, apiManager };
  // export default apiManager;
  //# sourceMappingURL=api-config.js.map

  // Export to global scope
  window.APIManager = APIManager;

})();
