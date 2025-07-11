// =============================================
// DOHA.KR 설정 파일 - PRODUCTION VERSION
// =============================================
// Created: 2025-01-10
// Purpose: 실제 API 키 및 사이트 설정

const Config = {
    // Kakao API 설정 (실제 키)
    kakao: {
        appKey: '8b5c6e8f97ec3d51a6f784b8b4b5ed99', // 실제 Kakao JavaScript Key
        allowedDomains: ['doha.kr', 'www.doha.kr', 'localhost', '127.0.0.1', 'doha1003.github.io']
    },
    
    // Google Analytics 설정
    analytics: {
        trackingId: 'G-XXXXXXXXXX', // 실제 GA4 ID로 교체 필요
        enabled: true
    },
    
    // AdSense 설정
    adsense: {
        publisherId: 'ca-pub-XXXXXXXXXX', // 실제 AdSense ID로 교체 필요
        enabled: true
    },
    
    // 사이트 정보
    site: {
        url: 'https://doha.kr',
        title: 'doha.kr - 심리테스트와 실용도구',
        description: '무료 심리테스트, AI 운세, 실용도구를 제공하는 한국 웹사이트',
        keywords: '심리테스트, MBTI, 테토에겐, 타로, 운세, 사주팔자, BMI계산기, 실용도구',
        author: 'doha.kr',
        language: 'ko-KR',
        charset: 'UTF-8'
    },
    
    // 환경 설정
    environment: {
        isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        isProduction: window.location.hostname === 'doha.kr' || window.location.hostname === 'www.doha.kr',
        isGithubPages: window.location.hostname.includes('github.io')
    },
    
    // API 엔드포인트
    api: {
        fortune: '/api/fortune.php',
        feedback: '/api/feedback.php',
        analytics: '/api/analytics.php'
    },
    
    // 소셜 공유 설정
    share: {
        kakao: {
            enabled: true,
            defaultImage: '/images/og-default.png',
            fallbackImage: '/images/og-image.svg'
        },
        facebook: {
            enabled: true,
            appId: '' // 필요시 추가
        },
        twitter: {
            enabled: true,
            via: 'doha_kr' // 트위터 계정
        }
    },
    
    // 테스트별 설정
    tests: {
        mbti: {
            title: 'MBTI 성격유형 테스트',
            description: '정확한 MBTI 성격유형을 알아보세요',
            image: '/images/mbti-og.png',
            url: '/tests/mbti/'
        },
        tetoEgen: {
            title: '테토-에겐 연애유형 테스트',
            description: '당신의 연애 스타일을 알아보세요',
            image: '/images/teto-egen-og.png',
            url: '/tests/teto-egen/'
        },
        loveDna: {
            title: 'Love DNA 테스트',
            description: '사랑의 유전자를 분석해보세요',
            image: '/images/love-dna-og.png',
            url: '/tests/love-dna/'
        }
    },
    
    // 도구별 설정
    tools: {
        textCounter: {
            title: '글자수 세기',
            description: '텍스트의 글자수, 바이트, 단어수를 확인하세요',
            maxLength: 50000
        },
        bmiCalculator: {
            title: 'BMI 계산기',
            description: '체질량지수를 계산하고 건강상태를 확인하세요'
        }
    },
    
    // 운세 설정
    fortune: {
        daily: {
            title: '오늘의 운세',
            description: 'AI가 분석하는 오늘의 운세를 확인하세요'
        },
        saju: {
            title: 'AI 사주팔자',
            description: '생년월일로 사주팔자를 분석해드립니다'
        },
        tarot: {
            title: 'AI 타로 리딩',
            description: '타로카드로 미래를 점쳐보세요'
        }
    },
    
    // 도메인 검증 함수
    validateDomain: function() {
        const currentDomain = window.location.hostname;
        return this.kakao.allowedDomains.some(domain => currentDomain.includes(domain));
    },
    
    // 환경별 설정 가져오기
    getEnvironmentConfig: function() {
        if (this.environment.isDevelopment) {
            return {
                apiUrl: 'http://localhost:8000',
                debug: true,
                logLevel: 'debug'
            };
        } else if (this.environment.isProduction) {
            return {
                apiUrl: 'https://doha.kr',
                debug: false,
                logLevel: 'error'
            };
        } else {
            return {
                apiUrl: window.location.origin,
                debug: false,
                logLevel: 'warn'
            };
        }
    },
    
    // 테스트 설정 가져오기
    getTestConfig: function(testType) {
        const baseConfig = this.tests[testType];
        if (!baseConfig) return null;
        
        return {
            ...baseConfig,
            shareUrl: this.site.url + baseConfig.url,
            ogImage: this.site.url + baseConfig.image
        };
    },
    
    // Kakao SDK 초기화 헬퍼
    initKakao: function() {
        if (typeof Kakao === 'undefined') {
            console.error('Kakao SDK not loaded');
            return false;
        }
        
        if (!this.validateDomain()) {
            console.warn('Domain validation failed for Kakao SDK');
            return false;
        }
        
        try {
            Kakao.init(this.kakao.appKey);
            console.log('Kakao SDK initialized successfully');
            return true;
        } catch (error) {
            console.error('Kakao SDK initialization failed:', error);
            return false;
        }
    },
    
    // 메타데이터 설정 헬퍼
    setPageMeta: function(pageConfig) {
        // Title
        if (pageConfig.title) {
            document.title = pageConfig.title + ' - ' + this.site.title;
        }
        
        // Description
        if (pageConfig.description) {
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.content = pageConfig.description;
            }
        }
        
        // Open Graph
        if (pageConfig.image) {
            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage) {
                ogImage.content = this.site.url + pageConfig.image;
            }
        }
        
        if (pageConfig.url) {
            const ogUrl = document.querySelector('meta[property="og:url"]');
            if (ogUrl) {
                ogUrl.content = this.site.url + pageConfig.url;
            }
        }
    }
};

// 전역 객체에 등록
window.Config = Config;

// 자동 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Kakao SDK 자동 초기화
        Config.initKakao();
    });
} else {
    Config.initKakao();
}

console.log('Config loaded successfully for:', window.location.hostname);