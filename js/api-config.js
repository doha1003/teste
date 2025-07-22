
// 안전한 Kakao SDK 초기화
window.initKakao = function() {
    try {
        if (typeof Kakao !== 'undefined' && Kakao.isInitialized && !Kakao.isInitialized()) {
            // 실제 앱 키는 환경변수나 설정파일에서 가져와야 함
            const kakaoKey = window.KAKAO_APP_KEY || window.API_CONFIG?.KAKAO_JS_KEY || window.API_CONFIG?.kakao?.appKey || 'your_kakao_app_key_here';
            if (kakaoKey && kakaoKey !== 'your_kakao_app_key_here') {
                Kakao.init(kakaoKey);
                console.log('Kakao SDK 초기화 완료');
            } else {
                console.warn('Kakao 앱 키가 설정되지 않았습니다.');
            }
        } else if (typeof Kakao !== 'undefined' && Kakao.isInitialized && Kakao.isInitialized()) {
            console.log('Kakao SDK 이미 초기화됨');
        } else {
            console.warn('Kakao SDK가 로드되지 않았습니다.');
        }
    } catch (error) {
        console.warn('Kakao SDK 초기화 실패:', error.message);
    }
};

// DOM 로드 후 초기화 시도
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(window.initKakao, 100);
    });
} else {
    setTimeout(window.initKakao, 100);
}

/**
 * API 설정 및 보안 관리
 * 이 파일은 민감한 정보를 포함하므로 절대 공개 저장소에 올리지 마세요!
 */

// API 엔드포인트 설정
const API_CONFIG = {
    // Gemini API
    gemini: {
        endpoint: '/api/fortune',
        timeout: 30000
    },
    
    // 카카오 SDK
    kakao: {
        appKey: '8b5c6e8f97ec3d51a6f784b8b4b5ed99'
    },
    
    // 카카오 JS 키 (호환성을 위해 추가)
    KAKAO_JS_KEY: '8b5c6e8f97ec3d51a6f784b8b4b5ed99',
    
    // Google AdSense
    adsense: {
        client: 'ca-pub-7905640648499222'
    }
};

// API 보안 설정
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
        'http://localhost:8000' // 개발용
    ]
};

// 환경별 설정
const ENV = window.location.hostname === 'localhost' ? 'development' : 'production';

// API 헬퍼 함수
const ApiHelper = {
    // 안전한 API 호출
    async secureRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'same-origin'
        };

        // CSRF 토큰 추가
        if (SECURITY_CONFIG.csrf.enabled && window.csrfToken) {
            defaultOptions.headers[SECURITY_CONFIG.csrf.headerName] = window.csrfToken;
        }

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    },

    // Rate Limiting 체크
    checkRateLimit(key) {
        const now = Date.now();
        const limit = this.rateLimits[key] || { count: 0, resetTime: now };
        
        if (now > limit.resetTime) {
            limit.count = 0;
            limit.resetTime = now + SECURITY_CONFIG.rateLimit.windowMs;
        }
        
        if (limit.count >= SECURITY_CONFIG.rateLimit.maxRequests) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        limit.count++;
        this.rateLimits[key] = limit;
    },

    rateLimits: {}
};

// 전역 객체에 추가 (다른 스크립트에서 사용 가능)
window.API_CONFIG = API_CONFIG;
window.ApiHelper = ApiHelper;