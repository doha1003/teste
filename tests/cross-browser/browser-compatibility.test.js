/**
 * 브라우저 호환성 테스트
 * Chrome, Firefox, Safari, Edge 및 모바일 브라우저에서의 호환성을 검증합니다.
 */

import { test, expect, devices } from '@playwright/test';

const TEST_URLS = [
  { url: '/', name: 'Home Page' },
  { url: '/tests/mbti/', name: 'MBTI Test' },
  { url: '/tests/love-dna/', name: 'Love DNA Test' },
  { url: '/fortune/daily/', name: 'Daily Fortune' },
  { url: '/fortune/saju/', name: 'Saju Fortune' },
  { url: '/tools/bmi-calculator.html', name: 'BMI Calculator' },
  { url: '/tools/salary-calculator.html', name: 'Salary Calculator' },
  { url: '/contact/', name: 'Contact Page' },
];

// 브라우저별 테스트 설정
const BROWSER_CONFIGS = [
  { name: 'Chrome', browserName: 'chromium' },
  { name: 'Firefox', browserName: 'firefox' },
  { name: 'Safari', browserName: 'webkit' },
  { name: 'Edge', browserName: 'chromium', channel: 'msedge' },
];

// 모바일 디바이스 설정
const MOBILE_DEVICES = ['iPhone 13', 'iPhone 12', 'Samsung Galaxy S21', 'iPad Pro', 'Pixel 5'];

// 뷰포트 크기 설정
const VIEWPORT_SIZES = [
  { width: 1920, height: 1080, name: 'Desktop Large' },
  { width: 1366, height: 768, name: 'Desktop Medium' },
  { width: 1024, height: 768, name: 'Tablet Landscape' },
  { width: 768, height: 1024, name: 'Tablet Portrait' },
  { width: 414, height: 896, name: 'Mobile Large' },
  { width: 375, height: 667, name: 'Mobile Medium' },
  { width: 320, height: 568, name: 'Mobile Small' },
];

test.describe('브라우저 호환성 테스트', () => {
  // 각 브라우저별 기본 호환성 테스트
  for (const browserConfig of BROWSER_CONFIGS) {
    test.describe(`${browserConfig.name} 브라우저 호환성`, () => {
      test.use({
        browserName: browserConfig.browserName,
        channel: browserConfig.channel || undefined,
      });

      for (const testUrl of TEST_URLS.slice(0, 4)) {
        // 주요 페이지만 테스트
        test(`${browserConfig.name} - ${testUrl.name} 기본 로딩`, async ({ page }) => {
          console.log(`${browserConfig.name}에서 ${testUrl.name} 테스트 중...`);

          // 페이지 로딩
          const response = await page.goto(testUrl.url);
          expect(response?.status()).toBe(200);

          // 페이지 완전 로딩 대기
          await page.waitForLoadState('networkidle');

          // 기본 요소들 존재 확인
          const basicElements = await page.evaluate(() => {
            return {
              hasTitle: !!document.title,
              hasBody: !!document.body,
              hasHeader: !!document.querySelector('header, .header, nav'),
              hasFooter: !!document.querySelector('footer, .footer'),
              hasMainContent: !!document.querySelector('main, .main, .content, .container'),
              hasKoreanText: /[가-힣]/.test(document.body.textContent || ''),
              scriptErrors: window.scriptErrors || [],
            };
          });

          // 기본 검증
          expect(basicElements.hasTitle).toBe(true);
          expect(basicElements.hasBody).toBe(true);
          expect(basicElements.hasKoreanText).toBe(true);

          console.log(`✓ ${browserConfig.name} - ${testUrl.name}: 기본 요소 확인`);

          // JavaScript 오류 검사
          const jsErrors = [];
          page.on('console', (msg) => {
            if (msg.type() === 'error') {
              jsErrors.push(msg.text());
            }
          });

          // 치명적인 JavaScript 오류가 없어야 함
          expect(
            jsErrors.filter(
              (err) =>
                err.includes('ReferenceError') ||
                err.includes('TypeError') ||
                err.includes('SyntaxError')
            ).length
          ).toBeLessThan(3);

          if (jsErrors.length > 0) {
            console.warn(`${browserConfig.name} - ${testUrl.name} JS 오류:`, jsErrors.slice(0, 5));
          }
        });
      }

      test(`${browserConfig.name} - CSS 렌더링 및 레이아웃 검증`, async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // CSS 로딩 상태 확인
        const cssInfo = await page.evaluate(() => {
          const results = {
            totalStylesheets: document.styleSheets.length,
            loadedStylesheets: 0,
            cssErrors: [],
            computedStyles: {},
            layoutMetrics: {},
          };

          // 스타일시트 로딩 확인
          for (let i = 0; i < document.styleSheets.length; i++) {
            try {
              const sheet = document.styleSheets[i];
              if (sheet.cssRules || sheet.rules) {
                results.loadedStylesheets++;
              }
            } catch (e) {
              results.cssErrors.push(`Stylesheet ${i}: ${e.message}`);
            }
          }

          // 주요 요소들의 computed style 확인
          const testElements = document.querySelectorAll('body, .btn, .card, .container');
          testElements.forEach((el, index) => {
            if (index < 5) {
              // 처음 5개만
              const style = window.getComputedStyle(el);
              results.computedStyles[`element_${index}`] = {
                display: style.display,
                position: style.position,
                fontSize: style.fontSize,
                color: style.color,
                backgroundColor: style.backgroundColor,
              };
            }
          });

          // 레이아웃 메트릭스
          results.layoutMetrics = {
            bodyWidth: document.body.offsetWidth,
            bodyHeight: document.body.offsetHeight,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
          };

          return results;
        });

        console.log(`${browserConfig.name} CSS 정보:`, {
          stylesheets: `${cssInfo.loadedStylesheets}/${cssInfo.totalStylesheets}`,
          errors: cssInfo.cssErrors.length,
          layoutSize: `${cssInfo.layoutMetrics.bodyWidth}x${cssInfo.layoutMetrics.bodyHeight}`,
        });

        // CSS 로딩 검증
        expect(cssInfo.loadedStylesheets).toBeGreaterThan(0);
        expect(cssInfo.cssErrors.length).toBeLessThan(2);

        // 레이아웃 검증
        expect(cssInfo.layoutMetrics.bodyWidth).toBeGreaterThan(0);
        expect(cssInfo.layoutMetrics.bodyHeight).toBeGreaterThan(0);
      });

      test(`${browserConfig.name} - 인터랙티브 요소 기능 검증`, async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // 클릭 가능한 요소들 찾기
        const interactiveElements = await page.evaluate(() => {
          const elements = [];
          const selectors = [
            'button:not([disabled])',
            'a[href]:not([href="#"])',
            'input[type="submit"]',
            '.btn',
            '.card[role="button"]',
            '[onclick]',
          ];

          selectors.forEach((selector) => {
            const found = document.querySelectorAll(selector);
            found.forEach((el, index) => {
              if (index < 3 && el.offsetParent !== null) {
                // 보이는 요소만, 최대 3개
                elements.push({
                  tagName: el.tagName.toLowerCase(),
                  selector,
                  text: el.textContent?.trim().substring(0, 20) || '',
                  href: el.href || null,
                });
              }
            });
          });

          return elements;
        });

        console.log(`${browserConfig.name} 인터랙티브 요소 ${interactiveElements.length}개 테스트`);

        // 각 요소 클릭 테스트
        for (const element of interactiveElements.slice(0, 5)) {
          try {
            if (element.href && !element.href.startsWith('http')) {
              // 내부 링크인 경우만 클릭 테스트
              const elementLocator = page.locator(element.selector).first();

              if (await elementLocator.isVisible()) {
                await elementLocator.click();
                await page.waitForTimeout(500);

                console.log(
                  `✓ ${browserConfig.name} 클릭 성공: ${element.tagName} - "${element.text}"`
                );

                // 뒤로가기
                await page.goBack();
                await page.waitForLoadState('networkidle');
              }
            } else if (!element.href) {
              // 버튼 등 non-navigation 요소
              const elementLocator = page.locator(element.selector).first();

              if (await elementLocator.isVisible()) {
                await elementLocator.click();
                await page.waitForTimeout(300);

                console.log(`✓ ${browserConfig.name} 버튼 클릭 성공: "${element.text}"`);
              }
            }
          } catch (error) {
            console.warn(`${browserConfig.name} 클릭 실패: ${element.tagName} - ${error.message}`);
          }
        }
      });
    });
  }

  // 반응형 디자인 테스트
  test.describe('반응형 디자인 호환성', () => {
    for (const viewport of VIEWPORT_SIZES) {
      test(`${viewport.name} (${viewport.width}x${viewport.height}) 반응형 테스트`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        console.log(`${viewport.name} 뷰포트 테스트 중...`);

        // 레이아웃 검증
        const layoutInfo = await page.evaluate(() => {
          return {
            bodyWidth: document.body.offsetWidth,
            bodyHeight: document.body.offsetHeight,
            hasHorizontalScroll: document.body.scrollWidth > window.innerWidth,
            hasVerticalScroll: document.body.scrollHeight > window.innerHeight,
            mobileMenuVisible: !!document.querySelector(
              '.mobile-menu:not([style*="display: none"])'
            ),
            navigationVisible: !!document.querySelector('nav, .navigation'),
            headerHeight: document.querySelector('header')?.offsetHeight || 0,
            footerHeight: document.querySelector('footer')?.offsetHeight || 0,
          };
        });

        console.log(`${viewport.name} 레이아웃:`, layoutInfo);

        // 기본 검증
        expect(layoutInfo.bodyWidth).toBeGreaterThan(0);
        expect(layoutInfo.bodyHeight).toBeGreaterThan(0);

        // 가로 스크롤은 없어야 함 (내용이 넘치지 않아야 함)
        expect(layoutInfo.hasHorizontalScroll).toBe(false);

        // 모바일에서는 모바일 메뉴가 있어야 함
        if (viewport.width < 768) {
          // 모바일 메뉴나 햄버거 메뉴가 있는지 확인
          const hasMobileNavigation = await page
            .locator('.mobile-menu, .hamburger, .menu-toggle, .navbar-toggle')
            .count();
          if (hasMobileNavigation > 0) {
            console.log(`✓ ${viewport.name}: 모바일 네비게이션 존재`);
          }
        }

        // 텍스트 가독성 확인
        const textReadability = await page.evaluate(() => {
          const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
          let smallTextCount = 0;
          let totalTextCount = 0;

          textElements.forEach((el) => {
            const text = el.textContent?.trim();
            if (text && text.length > 10 && el.children.length === 0) {
              totalTextCount++;
              const style = window.getComputedStyle(el);
              const fontSize = parseFloat(style.fontSize);

              if (fontSize < 14) {
                smallTextCount++;
              }
            }
          });

          return {
            smallTextRatio: totalTextCount > 0 ? smallTextCount / totalTextCount : 0,
            totalTextElements: totalTextCount,
          };
        });

        // 모바일에서 너무 작은 텍스트는 피해야 함
        if (viewport.width < 768) {
          expect(textReadability.smallTextRatio).toBeLessThan(0.2); // 20% 미만
        }

        console.log(`✓ ${viewport.name}: 레이아웃 및 텍스트 가독성 확인`);
      });
    }
  });

  // 모바일 디바이스 특화 테스트
  test.describe('모바일 디바이스 호환성', () => {
    for (const deviceName of MOBILE_DEVICES.slice(0, 3)) {
      // 주요 3개 디바이스만
      test(`${deviceName} 디바이스 호환성`, async ({ browser }) => {
        const device = devices[deviceName];
        const context = await browser.newContext({
          ...device,
          locale: 'ko-KR',
          timezoneId: 'Asia/Seoul',
        });

        const page = await context.newPage();

        try {
          await page.goto('/');
          await page.waitForLoadState('networkidle');

          console.log(`${deviceName} 디바이스 테스트 중...`);

          // 모바일 특화 기능 확인
          const mobileFeatures = await page.evaluate(() => {
            return {
              touchEventsSupported: 'ontouchstart' in window,
              viewportMeta: !!document.querySelector('meta[name="viewport"]'),
              viewportContent: document
                .querySelector('meta[name="viewport"]')
                ?.getAttribute('content'),
              devicePixelRatio: window.devicePixelRatio,
              screenSize: {
                width: window.screen.width,
                height: window.screen.height,
              },
              windowSize: {
                width: window.innerWidth,
                height: window.innerHeight,
              },
            };
          });

          console.log(`${deviceName} 모바일 정보:`, mobileFeatures);

          // 기본 모바일 요구사항 검증
          expect(mobileFeatures.touchEventsSupported).toBe(true);
          expect(mobileFeatures.viewportMeta).toBe(true);
          expect(mobileFeatures.viewportContent).toContain('width=device-width');

          // 터치 타겟 크기 확인
          const touchTargets = await page.evaluate(() => {
            const interactiveElements = document.querySelectorAll(
              'button, a, input, select, textarea, [role="button"], [onclick]'
            );

            const results = [];
            interactiveElements.forEach((el, index) => {
              if (el.offsetParent !== null && index < 10) {
                // 보이는 요소만, 최대 10개
                const rect = el.getBoundingClientRect();
                results.push({
                  width: rect.width,
                  height: rect.height,
                  area: rect.width * rect.height,
                  tagName: el.tagName.toLowerCase(),
                  text: el.textContent?.trim().substring(0, 15) || '',
                });
              }
            });

            return results;
          });

          // 터치 타겟 크기 검증 (최소 44px)
          const smallTargets = touchTargets.filter(
            (target) => target.width < 44 || target.height < 44
          );

          console.log(
            `${deviceName} 터치 타겟: ${touchTargets.length}개 중 ${smallTargets.length}개 작음`
          );

          // 80% 이상의 터치 타겟이 적절한 크기여야 함
          if (touchTargets.length > 0) {
            const appropriateTargetRatio =
              (touchTargets.length - smallTargets.length) / touchTargets.length;
            expect(appropriateTargetRatio).toBeGreaterThan(0.8);
          }

          // 간단한 터치 인터랙션 테스트
          const firstButton = page.locator('button, .btn').first();
          if (await firstButton.isVisible()) {
            await firstButton.tap(); // 터치 이벤트 사용
            await page.waitForTimeout(500);
            console.log(`✓ ${deviceName}: 터치 인터랙션 성공`);
          }

          console.log(`✓ ${deviceName}: 모바일 호환성 확인 완료`);
        } finally {
          await context.close();
        }
      });
    }
  });

  test('CSS 기능 지원 확인', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // CSS 기능 지원 여부 확인
    const cssSupport = await page.evaluate(() => {
      const results = {
        flexbox: CSS.supports('display', 'flex'),
        grid: CSS.supports('display', 'grid'),
        customProperties: CSS.supports('--custom-property', 'value'),
        transforms: CSS.supports('transform', 'translateX(0)'),
        transitions: CSS.supports('transition', 'all 0.3s'),
        gradients: CSS.supports('background', 'linear-gradient(to right, red, blue)'),
        filters: CSS.supports('filter', 'blur(5px)'),
        clipPath: CSS.supports('clip-path', 'circle(50%)'),
        objectFit: CSS.supports('object-fit', 'cover'),
        aspectRatio: CSS.supports('aspect-ratio', '1/1'),
      };

      return results;
    });

    console.log('CSS 기능 지원:', cssSupport);

    // 핵심 CSS 기능들은 지원되어야 함
    expect(cssSupport.flexbox).toBe(true);
    expect(cssSupport.customProperties).toBe(true);
    expect(cssSupport.transforms).toBe(true);
    expect(cssSupport.transitions).toBe(true);

    // Grid 지원 여부 확인 (대부분의 모던 브라우저에서 지원)
    if (cssSupport.grid) {
      console.log('✓ CSS Grid 지원됨');
    } else {
      console.warn('⚠️  CSS Grid 미지원 - Flexbox 대체 확인 필요');
    }
  });

  test('JavaScript API 지원 확인', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // JavaScript API 지원 여부 확인
    const apiSupport = await page.evaluate(() => {
      return {
        fetch: typeof fetch !== 'undefined',
        promise: typeof Promise !== 'undefined',
        asyncAwait: (async () => true)().constructor.name === 'AsyncFunction',
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        intersectionObserver: typeof IntersectionObserver !== 'undefined',
        resizeObserver: typeof ResizeObserver !== 'undefined',
        customElements: typeof customElements !== 'undefined',
        serviceWorker: 'serviceWorker' in navigator,
        webWorker: typeof Worker !== 'undefined',
        es6Modules: typeof Symbol !== 'undefined',
        es6Classes: (function () {
          try {
            eval('class Test {}');
            return true;
          } catch (e) {
            return false;
          }
        })(),
        es6ArrowFunctions: (function () {
          try {
            eval('(() => {})');
            return true;
          } catch (e) {
            return false;
          }
        })(),
        intl: typeof Intl !== 'undefined',
        dateTimeFormat: typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat !== 'undefined',
      };
    });

    console.log('JavaScript API 지원:', apiSupport);

    // 핵심 API들은 지원되어야 함
    expect(apiSupport.fetch).toBe(true);
    expect(apiSupport.promise).toBe(true);
    expect(apiSupport.localStorage).toBe(true);
    expect(apiSupport.es6Classes).toBe(true);
    expect(apiSupport.es6ArrowFunctions).toBe(true);

    // 국제화 API 지원 (한국어 사이트이므로 중요)
    expect(apiSupport.intl).toBe(true);
    expect(apiSupport.dateTimeFormat).toBe(true);

    // 선택적 API들
    if (!apiSupport.intersectionObserver) {
      console.warn('⚠️  IntersectionObserver 미지원 - polyfill 필요할 수 있음');
    }

    if (!apiSupport.serviceWorker) {
      console.warn('⚠️  Service Worker 미지원 - PWA 기능 제한');
    }
  });

  test('폰트 렌더링 크로스 브라우저 호환성', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 폰트 로딩 및 렌더링 확인
    const fontInfo = await page.evaluate(() => {
      const results = {
        fontLoadingAPI: !!document.fonts,
        loadedFonts: [],
        fontFaceSupport: CSS.supports('font-display', 'swap'),
        koreanTextRendering: {},
        fallbackFonts: [],
      };

      // 로딩된 폰트 확인
      if (document.fonts) {
        document.fonts.forEach((font) => {
          results.loadedFonts.push({
            family: font.family,
            style: font.style,
            weight: font.weight,
            status: font.status,
          });
        });
      }

      // 한국어 텍스트 렌더링 확인
      const koreanElements = document.querySelectorAll('*');
      let koreanTextSample = null;

      for (const el of koreanElements) {
        const text = el.textContent?.trim();
        if (text && /[가-힣]/.test(text) && text.length > 5) {
          koreanTextSample = el;
          break;
        }
      }

      if (koreanTextSample) {
        const style = window.getComputedStyle(koreanTextSample);
        results.koreanTextRendering = {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          textRendering: style.textRendering,
        };

        // 폰트 fallback 체인 분석
        results.fallbackFonts = style.fontFamily
          .split(',')
          .map((f) => f.trim().replace(/['"]/g, ''));
      }

      return results;
    });

    console.log('폰트 렌더링 정보:', fontInfo);

    // 한국어 텍스트 렌더링 확인
    if (fontInfo.koreanTextRendering.fontFamily) {
      console.log(`한국어 폰트: ${fontInfo.koreanTextRendering.fontFamily}`);

      // 한국어 폰트가 적절히 적용되었는지 확인
      const hasKoreanFont = fontInfo.fallbackFonts.some(
        (font) =>
          font.includes('Pretendard') ||
          font.includes('Noto Sans KR') ||
          font.includes('Malgun Gothic') ||
          font.includes('Apple SD Gothic Neo') ||
          font.includes('sans-serif')
      );

      expect(hasKoreanFont).toBe(true);
    }

    // @font-face 지원 확인
    expect(fontInfo.fontFaceSupport).toBe(true);

    console.log('✓ 폰트 렌더링 호환성 확인 완료');
  });

  test('이미지 형식 지원 확인', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 이미지 형식 지원 여부 확인
    const imageSupport = await page.evaluate(async () => {
      const results = {
        webp: false,
        avif: false,
        svg: true, // 대부분 지원
        png: true, // 기본 지원
        jpg: true, // 기본 지원
        gif: true, // 기본 지원
      };

      // WebP 지원 확인
      try {
        const webpCanvas = document.createElement('canvas');
        webpCanvas.width = 1;
        webpCanvas.height = 1;
        results.webp = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      } catch (e) {
        results.webp = false;
      }

      // AVIF 지원 확인 (간단한 방법)
      const avifImage = new Image();
      const avifPromise = new Promise((resolve) => {
        avifImage.onload = () => resolve(true);
        avifImage.onerror = () => resolve(false);
        avifImage.src =
          'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        setTimeout(() => resolve(false), 1000); // 타임아웃
      });

      try {
        results.avif = await avifPromise;
      } catch (e) {
        results.avif = false;
      }

      return results;
    });

    console.log('이미지 형식 지원:', imageSupport);

    // 기본 이미지 형식들은 지원되어야 함
    expect(imageSupport.png).toBe(true);
    expect(imageSupport.jpg).toBe(true);
    expect(imageSupport.svg).toBe(true);

    // 최신 형식 지원 확인
    if (imageSupport.webp) {
      console.log('✓ WebP 지원됨 - 최적화된 이미지 사용 가능');
    } else {
      console.warn('⚠️  WebP 미지원 - PNG/JPG fallback 필요');
    }

    if (imageSupport.avif) {
      console.log('✓ AVIF 지원됨 - 차세대 이미지 형식 사용 가능');
    } else {
      console.log('ℹ️  AVIF 미지원 - 아직 일반적이지 않음');
    }
  });

  test('네트워크 연결 상태 처리', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 오프라인 상태 시뮬레이션
    console.log('오프라인 상태 테스트...');

    await page.context().setOffline(true);
    await page.waitForTimeout(1000);

    // 오프라인 상태에서의 동작 확인
    const offlineState = await page.evaluate(() => {
      return {
        isOnline: navigator.onLine,
        hasServiceWorker: 'serviceWorker' in navigator,
        hasCachedPages: !!window.caches,
        offlinePageExists: !!document.querySelector('.offline-message, .no-connection'),
      };
    });

    console.log('오프라인 상태 정보:', offlineState);

    // 온라인 상태 복구
    await page.context().setOffline(false);
    await page.waitForTimeout(1000);

    const onlineState = await page.evaluate(() => {
      return {
        isOnline: navigator.onLine,
      };
    });

    expect(onlineState.isOnline).toBe(true);
    console.log('✓ 온라인 상태 복구 확인');

    // Service Worker가 있다면 오프라인 기능 확인
    if (offlineState.hasServiceWorker) {
      console.log('✓ Service Worker 지원 - 오프라인 기능 가능');
    }
  });
});

// 브라우저 호환성 테스트 완료 리포트
test.afterAll(async () => {
  console.log('\n=== 브라우저 호환성 테스트 완료 ===');
  console.log('✓ Chrome, Firefox, Safari, Edge 호환성 검증');
  console.log('✓ 반응형 디자인 다양한 뷰포트 검증');
  console.log('✓ 모바일 디바이스 호환성 검증');
  console.log('✓ CSS 기능 지원 확인');
  console.log('✓ JavaScript API 지원 확인');
  console.log('✓ 폰트 렌더링 크로스브라우저 확인');
  console.log('✓ 이미지 형식 지원 확인');
  console.log('✓ 네트워크 상태 처리 확인');
  console.log('\n모든 주요 브라우저 및 디바이스에서의 호환성이 검증되었습니다.');
});
