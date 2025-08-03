/**
 * 모바일 디바이스 에뮬레이션 테스트
 * 다양한 모바일 디바이스에서의 렌더링 및 기능 검증
 */

import puppeteer from 'puppeteer';

const BASE_URL = 'https://doha.kr';

// 테스트할 모바일 디바이스 설정
const mobileDevices = [
  {
    name: 'iPhone 12',
    viewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  },
  {
    name: 'Galaxy S21',
    viewport: { width: 360, height: 800, isMobile: true, hasTouch: true },
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
  },
  {
    name: 'iPad',
    viewport: { width: 768, height: 1024, isMobile: true, hasTouch: true },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  },
];

async function testMobileDevices() {
  console.log('📱 모바일 디바이스 에뮬레이션 테스트 시작\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const testResults = {
    devices: [],
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
    },
  };

  for (const device of mobileDevices) {
    console.log(`🔍 디바이스 테스트: ${device.name}`);
    console.log(`   해상도: ${device.viewport.width}x${device.viewport.height}`);

    const page = await browser.newPage();
    await page.setViewport(device.viewport);
    await page.setUserAgent(device.userAgent);

    const deviceResult = {
      device: device.name,
      tests: [],
      score: 0,
    };

    try {
      // 1. 홈페이지 로딩 테스트
      console.log('   📄 홈페이지 로딩 테스트...');
      await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 10000 });

      const title = await page.title();
      if (title.includes('doha.kr')) {
        deviceResult.tests.push({ name: '홈페이지 로딩', status: 'PASS' });
        console.log('   ✅ 홈페이지 로딩 성공');
      } else {
        deviceResult.tests.push({ name: '홈페이지 로딩', status: 'FAIL' });
        console.log('   ❌ 홈페이지 로딩 실패');
      }

      // 2. 모바일 네비게이션 테스트
      console.log('   📱 모바일 네비게이션 테스트...');
      const mobileMenu = await page.$('.mobile-menu-toggle');
      if (mobileMenu) {
        await page.click('.mobile-menu-toggle');
        await page.waitForTimeout(500);

        const isMenuVisible = await page.evaluate(() => {
          const menu = document.querySelector('.mobile-menu');
          return menu && (menu.offsetWidth > 0 || menu.offsetHeight > 0);
        });

        if (isMenuVisible) {
          deviceResult.tests.push({ name: '모바일 메뉴', status: 'PASS' });
          console.log('   ✅ 모바일 메뉴 작동');
        } else {
          deviceResult.tests.push({ name: '모바일 메뉴', status: 'FAIL' });
          console.log('   ❌ 모바일 메뉴 미작동');
        }
      } else {
        deviceResult.tests.push({ name: '모바일 메뉴', status: 'SKIP' });
        console.log('   ⚠️  모바일 메뉴 버튼 없음');
      }

      // 3. 터치 인터랙션 테스트
      console.log('   👆 터치 인터랙션 테스트...');
      const buttons = await page.$$('button, .btn, a[href*="test"], a[href*="fortune"]');
      if (buttons.length > 0) {
        // 첫 번째 버튼 클릭 테스트
        await buttons[0].tap();
        await page.waitForTimeout(1000);

        deviceResult.tests.push({ name: '터치 인터랙션', status: 'PASS' });
        console.log('   ✅ 터치 인터랙션 성공');
      } else {
        deviceResult.tests.push({ name: '터치 인터랙션', status: 'FAIL' });
        console.log('   ❌ 터치 가능한 요소 없음');
      }

      // 4. 폰트 렌더링 테스트
      console.log('   🔤 폰트 렌더링 테스트...');
      const koreanText = await page.evaluate(() => {
        const elements = document.querySelectorAll('h1, h2, p');
        for (let el of elements) {
          if (/[가-힣]/.test(el.textContent)) {
            const style = window.getComputedStyle(el);
            return {
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              hasKorean: true,
            };
          }
        }
        return { hasKorean: false };
      });

      if (koreanText.hasKorean) {
        deviceResult.tests.push({ name: '한국어 폰트', status: 'PASS' });
        console.log(`   ✅ 한국어 폰트 렌더링 (${koreanText.fontFamily})`);
      } else {
        deviceResult.tests.push({ name: '한국어 폰트', status: 'FAIL' });
        console.log('   ❌ 한국어 텍스트 없음');
      }

      // 5. 반응형 레이아웃 테스트
      console.log('   📐 반응형 레이아웃 테스트...');
      const layoutMetrics = await page.evaluate(() => {
        const body = document.body;
        const hasHorizontalScroll = body.scrollWidth > window.innerWidth;
        const containers = document.querySelectorAll('.container, .content, main');
        const hasFlexLayout = Array.from(containers).some((el) => {
          const style = window.getComputedStyle(el);
          return style.display === 'flex' || style.display === 'grid';
        });

        return {
          hasHorizontalScroll,
          hasFlexLayout,
          viewportWidth: window.innerWidth,
        };
      });

      if (!layoutMetrics.hasHorizontalScroll) {
        deviceResult.tests.push({ name: '반응형 레이아웃', status: 'PASS' });
        console.log('   ✅ 반응형 레이아웃 적절');
      } else {
        deviceResult.tests.push({ name: '반응형 레이아웃', status: 'FAIL' });
        console.log('   ❌ 가로 스크롤 발생');
      }

      // 6. 성능 메트릭 수집
      console.log('   ⚡ 성능 메트릭 수집...');
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');

        return {
          loadTime: navigation
            ? Math.round(navigation.loadEventEnd - navigation.loadEventStart)
            : 0,
          domContentLoaded: navigation
            ? Math.round(
                navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
              )
            : 0,
          firstPaint: paint.find((p) => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint:
            paint.find((p) => p.name === 'first-contentful-paint')?.startTime || 0,
        };
      });

      if (performanceMetrics.firstContentfulPaint < 3000) {
        deviceResult.tests.push({ name: '로딩 성능', status: 'PASS' });
        console.log(
          `   ✅ 로딩 성능 양호 (FCP: ${Math.round(performanceMetrics.firstContentfulPaint)}ms)`
        );
      } else {
        deviceResult.tests.push({ name: '로딩 성능', status: 'FAIL' });
        console.log(
          `   ❌ 로딩 성능 부족 (FCP: ${Math.round(performanceMetrics.firstContentfulPaint)}ms)`
        );
      }
    } catch (error) {
      console.log(`   ❌ 테스트 중 오류: ${error.message}`);
      deviceResult.tests.push({ name: '전체 테스트', status: 'ERROR', error: error.message });
    }

    await page.close();

    // 디바이스별 점수 계산
    const passedTests = deviceResult.tests.filter((t) => t.status === 'PASS').length;
    const totalTests = deviceResult.tests.filter((t) => t.status !== 'SKIP').length;
    deviceResult.score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    testResults.devices.push(deviceResult);
    testResults.summary.totalTests += totalTests;
    testResults.summary.passedTests += passedTests;
    testResults.summary.failedTests += totalTests - passedTests;

    console.log(`   📊 ${device.name} 점수: ${deviceResult.score}%\n`);
  }

  await browser.close();

  // 결과 요약 출력
  console.log('📊 모바일 디바이스 테스트 결과');
  console.log('=================================');

  testResults.devices.forEach((device) => {
    console.log(`${device.device}: ${device.score}%`);
    device.tests.forEach((test) => {
      const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`  ${icon} ${test.name}`);
    });
    console.log('');
  });

  const overallScore =
    testResults.summary.totalTests > 0
      ? Math.round((testResults.summary.passedTests / testResults.summary.totalTests) * 100)
      : 0;

  console.log(`전체 점수: ${overallScore}%`);
  console.log(`통과: ${testResults.summary.passedTests}/${testResults.summary.totalTests}`);

  // 모바일 사용성 권장사항
  console.log('\n💡 모바일 사용성 권장사항');
  console.log('=========================');

  if (overallScore >= 80) {
    console.log('✅ 모바일 사용성이 우수합니다!');
  } else if (overallScore >= 60) {
    console.log('⚠️ 모바일 사용성 개선이 필요합니다.');
    console.log('- 터치 타겟 크기 확인 (최소 44px)');
    console.log('- 로딩 성능 최적화');
  } else {
    console.log('❌ 모바일 사용성 개선이 시급합니다.');
    console.log('- 반응형 레이아웃 점검');
    console.log('- 모바일 네비게이션 구현');
    console.log('- 성능 최적화');
  }

  return testResults;
}

// 테스트 실행
testMobileDevices().catch(console.error);
