/**
 * 만세력 데이터베이스 (최적화 버전)
 * 기존 34MB 파일을 API 기반으로 변경
 * 실제 데이터는 서버 API를 통해 제공됩니다
 */

// manseryeok-loader-optimized.js 자동 로드
(function() {
  if (!window.ManseryeokDatabase || !window.ManseryeokDatabase.getDateData) {
    const script = document.createElement('script');
    script.src = '/js/manseryeok-loader-optimized.js';
    script.async = false;
    document.head.appendChild(script);
  }
})();

// 하위 호환성을 위한 더미 객체
if (!window.ManseryeokDatabase) {
  window.ManseryeokDatabase = {
    getDateData: async function(dateString) {
      
      return null;
    }
  };
}