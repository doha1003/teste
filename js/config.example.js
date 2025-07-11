// 설정 파일 템플릿 - config.js 생성 시 참고용
// 주의: 실제 API 키는 이 파일에 입력하지 마세요.

const Config = {
    // Kakao API 설정
    kakao: {
        appKey: 'YOUR_KAKAO_JAVASCRIPT_KEY_HERE', // 실제 키로 교체 필요
        allowedDomains: ['doha.kr', 'localhost', '127.0.0.1']
    },
    
    // 사이트 정보
    site: {
        url: 'https://doha.kr',
        title: 'doha.kr',
        description: '심리테스트와 실용도구를 제공하는 웹사이트'
    },
    
    // 개발 모드 여부
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // 도메인 검증 함수
    validateDomain: function() {
        const currentDomain = window.location.hostname;
        return this.kakao.allowedDomains.some(domain => currentDomain.includes(domain));
    }
};

// 전역 객체에 등록
window.Config = Config;