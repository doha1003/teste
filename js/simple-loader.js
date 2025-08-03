// 간단한 컴포넌트 로더
async function loadComponents() {
  try {
    // 네비게이션 로드
    const navPlaceholder = document.getElementById('navbar-placeholder');
    if (navPlaceholder) {
      const navResponse = await fetch('/includes/navbar.html');
      if (navResponse.ok) {
        const navHtml = await navResponse.text();
        navPlaceholder.innerHTML = navHtml;
      } else {
      }
    }

    // 푸터 로드
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      const footerResponse = await fetch('/includes/footer.html');
      if (footerResponse.ok) {
        const footerHtml = await footerResponse.text();
        footerPlaceholder.innerHTML = footerHtml;
      } else {
      }
    }

    // Kakao SDK 초기화
    if (typeof window.initKakao === 'function') {
      window.initKakao();
    } else if (typeof Kakao !== 'undefined' && window.KAKAO_KEY) {
      try {
        if (!Kakao.isInitialized()) {
          Kakao.init(window.KAKAO_KEY);
        }
      } catch (error) {}
    }
  } catch (error) {}
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', loadComponents);

// 전역으로 노출
window.loadComponents = loadComponents;
