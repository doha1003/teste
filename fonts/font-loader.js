/**
 * Font Loading Detection and Fallback System
 * 폰트 로딩 감지 및 폴백 시스템
 */

(function() {
  'use strict';

  // Font loading status tracking
  const fontStatus = {
    pretendardVariable: false,
    pretendardStatic: false,
    notoSansKR: false,
    systemFont: true // Always available
  };

  // Font loading detection utility
  function checkFontLoaded(fontFamily, testText = '한글테스트ABCabc') {
    return new Promise((resolve) => {
      if ('fonts' in document) {
        // Modern browsers with FontFace API
        document.fonts.load(`16px "${fontFamily}"`).then(() => {
          const availableFonts = [...document.fonts].map(font => font.family);
          resolve(availableFonts.includes(`"${fontFamily}"`));
        }).catch(() => resolve(false));
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
    const loadedFonts = Object.keys(fontStatus).filter(font => fontStatus[font]);
    
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
      checkFontLoaded('Noto Sans KR')
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
          custom_parameter_2: Object.values(fontStatus).filter(Boolean).length
        });
      }
    });
  }

  // Font loading optimization
  function optimizeFontLoading() {
    // Add font-display: swap to existing @font-face rules
    const styleSheets = Array.from(document.styleSheets);
    
    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules);
        rules.forEach(rule => {
          if (rule.type === CSSRule.FONT_FACE_RULE) {
            if (!rule.style.fontDisplay) {
              rule.style.fontDisplay = 'swap';
            }
          }
        });
      } catch (e) {
        // Cross-origin stylesheets might throw errors
        console.warn('스타일시트 접근 불가:', e.message);
      }
    });
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
  window.addEventListener('error', function(e) {
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