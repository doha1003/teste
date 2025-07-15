/**
 * doha.kr 통합 설정 파일
 * 이 파일은 민감한 정보를 포함하므로 보안에 유의하세요.
 * Created: 2025-01-16
 */

(function() {
    'use strict';

    // 통합 설정 객체
    const DohaConfig = {
        // 환경 설정
        env: {
            isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
            isProduction: window.location.hostname === 'doha.kr' || window.location.hostname === 'www.doha.kr'
        },

        // 사이트 정보
        site: {
            url: 'https://doha.kr',
            title: 'doha.kr',
            description: '심리테스트와 실용도구를 제공하는 웹사이트',
            version: '2.0.0'
        },

        // API 설정
        api: {
            // Gemini AI
            gemini: {
                endpoint: '/api/fortune',
                timeout: 30000
            },
            
            // 카카오 SDK (통합된 설정)
            kakao: {
                appKey: '8b5c6e8f97ec3d51a6f784b8b4b5ed99',
                allowedDomains: ['doha.kr', 'www.doha.kr', 'localhost', '127.0.0.1']
            },
            
            // Google AdSense
            adsense: {
                client: 'ca-pub-7905640648499222'
            }
        },

        // 보안 설정
        security: {
            // CSRF 보호
            csrf: {
                enabled: true,
                headerName: 'X-CSRF-Token'
            },
            
            // Rate Limiting
            rateLimit: {
                maxRequests: 100,
                windowMs: 60000 // 1분
            },
            
            // CORS 허용 도메인
            allowedOrigins: [
                'https://doha.kr',
                'https://www.doha.kr'
            ]
        },

        // 기능별 설정
        features: {
            // PWA 설정
            pwa: {
                enabled: true,
                serviceWorker: '/sw.js'
            },
            
            // 애널리틱스
            analytics: {
                enabled: true,
                debugMode: false
            },
            
            // 광고
            ads: {
                enabled: true,
                testMode: false
            }
        },

        // 유틸리티 함수들
        utils: {
            // 현재 도메인이 허용된 도메인인지 검증
            validateDomain() {
                const currentDomain = window.location.hostname;
                return DohaConfig.api.kakao.allowedDomains.some(domain => 
                    currentDomain === domain || currentDomain.endsWith('.' + domain)
                );
            },

            // 환경에 따른 API URL 생성
            getApiUrl(endpoint) {
                const baseUrl = DohaConfig.env.isDevelopment 
                    ? 'http://localhost:3000' 
                    : DohaConfig.site.url;
                return baseUrl + endpoint;
            },

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
                if (DohaConfig.security.csrf.enabled && window.csrfToken) {
                    defaultOptions.headers[DohaConfig.security.csrf.headerName] = window.csrfToken;
                }

                // Rate limiting 체크
                this.checkRateLimit(url);

                try {
                    const response = await fetch(url, { ...defaultOptions, ...options });
                    
                    if (!response.ok) {
                        throw new Error(`API Error: ${response.status} ${response.statusText}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('API Request Failed:', error);
                    throw error;
                }
            },

            // Rate limiting 구현
            rateLimits: new Map(),
            
            checkRateLimit(key) {
                const now = Date.now();
                const limit = this.rateLimits.get(key) || { count: 0, resetTime: now };
                
                if (now > limit.resetTime) {
                    limit.count = 0;
                    limit.resetTime = now + DohaConfig.security.rateLimit.windowMs;
                }
                
                if (limit.count >= DohaConfig.security.rateLimit.maxRequests) {
                    throw new Error('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
                }
                
                limit.count++;
                this.rateLimits.set(key, limit);
            }
        }
    };

    // 개발 환경에서만 설정 로그 출력
    if (DohaConfig.env.isDevelopment) {
        console.log('DohaConfig initialized:', {
            env: DohaConfig.env,
            site: DohaConfig.site,
            features: DohaConfig.features
        });
    }

    // 전역 객체로 등록 (하나의 통합된 설정)
    window.DohaConfig = DohaConfig;

    // 기존 코드와의 호환성을 위한 별칭 (점진적 마이그레이션용)
    // 추후 제거 예정
    window.Config = {
        kakao: DohaConfig.api.kakao,
        site: DohaConfig.site,
        isDevelopment: DohaConfig.env.isDevelopment,
        validateDomain: DohaConfig.utils.validateDomain
    };
    
    window.API_CONFIG = {
        gemini: DohaConfig.api.gemini,
        kakao: DohaConfig.api.kakao,
        adsense: DohaConfig.api.adsense
    };
    
    window.ApiHelper = {
        secureRequest: DohaConfig.utils.secureRequest.bind(DohaConfig.utils),
        checkRateLimit: DohaConfig.utils.checkRateLimit.bind(DohaConfig.utils)
    };

})();