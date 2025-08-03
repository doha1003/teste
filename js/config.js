// doha.kr 설정 파일
// 주의: 이 파일은 민감한 정보를 포함하고 있으므로 보안에 유의하세요.

const Config = {
  // Kakao API 설정
  kakao: {
    appKey: '8b5c6e8f97ec3d51a6f784b8b4b5ed99', // doha.kr 카카오 JavaScript 키
    allowedDomains: ['doha.kr', 'localhost', '127.0.0.1'],
  },

  // 사이트 정보
  site: {
    url: 'https://doha.kr',
    title: 'doha.kr',
    description: '심리테스트와 실용도구를 제공하는 웹사이트',
  },

  // 개발 모드 여부
  isDevelopment:
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

  // 도메인 검증 함수
  validateDomain() {
    const currentDomain = window.location.hostname;
    return this.kakao.allowedDomains.some((domain) => currentDomain.includes(domain));
  },
};

// 전역 객체에 등록
window.Config = Config;
