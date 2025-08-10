/**
 * Font Loading Detection and Fallback System
 * 폰트 로딩 감지 및 폴백 시스템
 */

(function () {
  'use strict';

  // Font loading status tracking
  const fontStatus = {
    pretendardVariable: false,
    pretendardStatic: false,
    notoSansKR: false,
    systemFont: true, // Always available
  };

  // Font loading detection utility
  function checkFontLoaded(fontFamily, testText = '한글테스트ABCabc') {
    return new Promise((resolve) => {
      if ('fonts' in document) {
        // Modern browsers with FontFace API
        document.fonts
          .load(`16px "${fontFamily}"`)
          .then(() => {
            const availableFonts = [...document.fonts].map((font) => font.family);
            resolve(availableFonts.includes(`"${fontFamily}"`));
          })
          .catch(() => resolve(false));
      } else {
        // Fallback detection method
        const testElement = document.createElement('div');
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        testElement.style.fontSize = '16px';
        testElement.style.fontFamily = 'monospace';
        testElement.textContent = testText;
        document.body.appendChild(testElement);

        const monospaceWidth = testElement.offsetWidth;
        testElement.style.fontFamily = `"${fontFamily}", monospace`;
        const testWidth = testElement.offsetWidth;

        document.body.removeChild(testElement);
        resolve(monospaceWidth !== testWidth);
      }
    });
  }

  // Apply font loading classes
  function updateFontClasses() {
    const body = document.body;
    const loadedFonts = Object.keys(fontStatus).filter((font) => fontStatus[font]);

    body.classList.remove('fonts-loading');
    body.classList.add('fonts-loaded');

    if (fontStatus.pretendardVariable) {
      body.classList.add('pretendard-variable-loaded');
      console.log('✅ Pretendard Variable 폰트 로딩 성공');
    } else if (fontStatus.pretendardStatic) {
      body.classList.add('pretendard-static-loaded');
      console.log('✅ Pretendard Static 폰트 로딩 성공');
    } else if (fontStatus.notoSansKR) {
      body.classList.add('noto-sans-kr-loaded');
      console.log('✅ Noto Sans KR 폰트 로딩 성공');
    } else {
      body.classList.add('system-font-fallback');
      console.log('⚠️ 시스템 폰트로 폴백');
    }
  }

  // Font loading performance monitor
  function monitorFontLoading() {
    const startTime = performance.now();

    Promise.all([
      checkFontLoaded('Pretendard Variable'),
      checkFontLoaded('Pretendard'),
      checkFontLoaded('Noto Sans KR'),
    ]).then(([pretendardVar, pretendardStatic, notoSansKR]) => {
      const endTime = performance.now();
      const loadTime = Math.round(endTime - startTime);

      fontStatus.pretendardVariable = pretendardVar;
      fontStatus.pretendardStatic = pretendardStatic;
      fontStatus.notoSansKR = notoSansKR;

      updateFontClasses();

      // Performance logging
      console.log(`📊 폰트 로딩 완료: ${loadTime}ms`);
      console.log('폰트 상태:', fontStatus);

      // Report to analytics if available
      if (typeof gtag === 'function') {
        gtag('event', 'font_loading_complete', {
          custom_parameter_1: loadTime,
          custom_parameter_2: Object.values(fontStatus).filter(Boolean).length,
        });
      }
    });
  }

  // Font loading optimization - CORS 문제 해결
  function optimizeFontLoading() {
    // 로컬 스타일시트만 처리하고 CORS 에러 방지
    const styleSheets = Array.from(document.styleSheets);

    styleSheets.forEach((sheet) => {
      try {
        // CORS 문제 방지: 로컬 스타일시트만 처리
        if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
          return; // 외부 스타일시트는 건너뛰기
        }

        // cssRules에 안전하게 접근
        let rules = null;
        try {
          rules = Array.from(sheet.cssRules || sheet.rules || []);
        } catch (corsError) {
          // CORS 에러인 경우 조용히 건너뛰기
          return;
        }

        rules.forEach((rule) => {
          if (rule.type === CSSRule.FONT_FACE_RULE) {
            try {
              if (!rule.style.fontDisplay) {
                rule.style.fontDisplay = 'swap';
                console.log('✅ font-display: swap 추가됨:', rule.style.fontFamily);
              }
            } catch (ruleError) {
              // 개별 룰 수정 실패는 무시
            }
          }
        });
      } catch (e) {
        // 전체 시트 접근 실패 - 로그 없이 건너뛰기
      }
    });

    // CSS에서 font-display 지원 추가
    injectFontDisplayCSS();
  }

  // font-display: swap을 CSS로 강제 적용
  function injectFontDisplayCSS() {
    const style = document.createElement('style');
    style.id = 'font-display-swap';
    style.textContent = `
      @font-face {
        font-family: 'Pretendard Variable';
        font-display: swap;
      }
      @font-face {
        font-family: 'Pretendard';
        font-display: swap;
      }
      @font-face {
        font-family: 'Noto Sans KR';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
    console.log('✅ font-display: swap CSS 인젝션 완료');
  }

  // Initialize font loading system
  function initFontLoader() {
    // Set initial loading state
    document.body.classList.add('fonts-loading');

    // Start monitoring
    monitorFontLoading();

    // Optimize existing fonts
    optimizeFontLoading();

    // Fallback timeout (3 seconds)
    setTimeout(() => {
      if (document.body.classList.contains('fonts-loading')) {
        console.warn('⏰ 폰트 로딩 타임아웃 - 시스템 폰트로 폴백');
        document.body.classList.remove('fonts-loading');
        document.body.classList.add('fonts-loaded', 'system-font-fallback');
      }
    }, 3000);
  }

  // Font loading error handler
  window.addEventListener('error', function (e) {
    if (e.message && e.message.includes('font')) {
      console.error('❌ 폰트 로딩 에러:', e.message);
      // Ensure fallback fonts are used
      if (!document.body.classList.contains('fonts-loaded')) {
        document.body.classList.remove('fonts-loading');
        document.body.classList.add('fonts-loaded', 'system-font-fallback');
      }
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFontLoader);
  } else {
    initFontLoader();
  }

  // Expose font status for debugging
  window.dohaFontStatus = fontStatus;
  window.checkFontLoaded = checkFontLoaded;
})();
