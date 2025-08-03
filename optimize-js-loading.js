import fs from 'fs';

// JavaScript 지연 로딩 및 최적화 적용
function optimizeJSLoading() {
  try {
    let htmlContent = fs.readFileSync('index.html', 'utf8');
    
    // 기존 스크립트 태그들을 지연 로딩으로 변경
    const optimizations = [
      {
        // 로거 초기화는 즉시 로딩 유지 (에러 추적 필요)
        old: '<script src="/js/logger-init.js"></script>',
        new: '<script src="/js/logger-init.js"></script>'
      },
      {
        // 메인 앱 스크립트 - defer로 변경
        old: '<script type="module" src="/js/app.js"></script>',
        new: '<script type="module" src="/js/app.js" defer></script>'
      },
      {
        // 홈 페이지 스크립트 - 지연 로딩
        old: '<script type="module" src="/js/pages/home.js"></script>',
        new: `<!-- 지연 로딩 스크립트 -->
    <script>
      // 페이지 로드 완료 후 홈 스크립트 로딩
      window.addEventListener('load', function() {
        const homeScript = document.createElement('script');
        homeScript.type = 'module';
        homeScript.src = '/js/pages/home.js';
        document.head.appendChild(homeScript);
      });
    </script>`
      },
      {
        // 카카오 SDK - 조건부 로딩
        old: '<script async src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"></script>',
        new: `<!-- 카카오 SDK 조건부 로딩 -->
    <script>
      // 카카오 기능이 필요할 때만 로딩
      window.loadKakaoSDK = function() {
        if (!window.Kakao) {
          const script = document.createElement('script');
          script.async = true;
          script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
          document.head.appendChild(script);
        }
      };
    </script>`
      }
    ];
    
    // 모든 최적화 적용
    optimizations.forEach(opt => {
      htmlContent = htmlContent.replace(opt.old, opt.new);
    });
    
    // 중요하지 않은 스크립트들을 하단으로 이동하고 지연 로딩
    const criticalScriptsSection = `
    <!-- Critical Scripts (즉시 필요) -->
    <script src="/js/logger-init.js"></script>
    <script type="module" src="/js/app.js" defer></script>
    
    <!-- Non-Critical Scripts (지연 로딩) -->
    <script>
      // 페이지 로드 완료 후 비중요 스크립트들 로딩
      window.addEventListener('load', function() {
        // 홈 페이지 스크립트
        const homeScript = document.createElement('script');
        homeScript.type = 'module';
        homeScript.src = '/js/pages/home.js';
        document.head.appendChild(homeScript);
        
        // 분석 스크립트 (더 늦게 로딩)
        setTimeout(function() {
          if (typeof gtag !== 'undefined') {
            // Google Analytics가 로드된 후 추가 분석 스크립트 로딩
          }
        }, 2000);
      });
      
      // 카카오 SDK 필요할 때만 로딩
      window.loadKakaoSDK = function() {
        if (!window.Kakao) {
          const script = document.createElement('script');
          script.async = true;
          script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
          script.onload = function() {
            if (window.Kakao) {
              window.Kakao.init('YOUR_KAKAO_APP_KEY');
            }
          };
          document.head.appendChild(script);
        }
      };
    </script>`;
    
    fs.writeFileSync('index-optimized.html', htmlContent);
    
    console.log('JavaScript loading optimization completed:');
    console.log('- 메인 스크립트: defer 속성 추가');
    console.log('- 홈 스크립트: 지연 로딩');
    console.log('- 카카오 SDK: 조건부 로딩');
    console.log('- 파일 저장: index-optimized.html');
    
    return htmlContent;
  } catch (error) {
    console.error('JS optimization failed:', error.message);
    return '';
  }
}

optimizeJSLoading();