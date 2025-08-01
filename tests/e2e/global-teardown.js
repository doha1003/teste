/**
 * Playwright 전역 정리
 * 모든 테스트 실행 후에 한 번 실행됩니다.
 */

async function globalTeardown(config) {
  console.log('🧹 E2E 테스트 환경 정리 중...');

  // 테스트 아티팩트 정리
  // 필요한 경우 임시 파일 삭제 등

  console.log('✅ E2E 테스트 환경 정리 완료');
}

export default globalTeardown;
