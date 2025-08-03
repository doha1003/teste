/**
 * 한국어 사용자 기본 플로우 검증
 * 페이지 로딩, 한국어 텍스트, 반응형 등 기본 요소 검증
 */

async function testKoreanUserFlow() {
  const BASE_URL = 'https://doha.kr';

  console.log('🚀 한국어 사용자 플로우 검증 시작\n');

  // 주요 페이지 URL들
  const testPages = [
    { url: '/', name: '홈페이지' },
    { url: '/fortune/daily/', name: '일일 운세' },
    { url: '/tests/mbti/', name: 'MBTI 테스트' },
    { url: '/tools/bmi-calculator.html', name: 'BMI 계산기' },
    { url: '/tools/salary-calculator.html', name: '급여 계산기' },
    { url: '/about/', name: '사이트 소개' },
  ];

  const results = {
    pageLoads: 0,
    koreanText: 0,
    mobileResponsive: 0,
    errors: [],
  };

  for (const page of testPages) {
    try {
      console.log(`📄 테스트 중: ${page.name} (${page.url})`);

      // 실제 페이지 검증을 위한 fetch 요청
      const response = await fetch(BASE_URL + page.url);

      if (response.ok) {
        results.pageLoads++;
        console.log(`✅ ${page.name}: 페이지 로드 성공 (${response.status})`);

        // HTML 컨텐츠 확인
        const html = await response.text();

        // 한국어 텍스트 검증
        if (/[가-힣]/.test(html)) {
          results.koreanText++;
          console.log(`✅ ${page.name}: 한국어 텍스트 확인`);
        }

        // 모바일 뷰포트 메타태그 검증
        if (html.includes('viewport') && html.includes('width=device-width')) {
          results.mobileResponsive++;
          console.log(`✅ ${page.name}: 모바일 반응형 메타태그 확인`);
        }
      } else {
        console.log(`❌ ${page.name}: 페이지 로드 실패 (${response.status})`);
        results.errors.push(`${page.name}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${page.name}: 오류 - ${error.message}`);
      results.errors.push(`${page.name}: ${error.message}`);
    }

    console.log(''); // 빈 줄 추가
  }

  // 워크플로우 시나리오 검증
  console.log('📋 주요 워크플로우 시나리오 검증\n');

  // 시나리오 1: 홈 → 운세 → 테스트 → 도구 네비게이션
  console.log('🔄 시나리오 1: 사이트 네비게이션 플로우');
  try {
    // 각 카테고리 페이지 접근성 확인
    const navPages = ['/fortune/', '/tests/', '/tools/'];

    for (const navUrl of navPages) {
      const response = await fetch(BASE_URL + navUrl);
      if (response.ok) {
        console.log(`✅ 네비게이션: ${navUrl} 접근 가능`);
      } else {
        console.log(`❌ 네비게이션: ${navUrl} 접근 불가`);
      }
    }
  } catch (error) {
    console.log(`❌ 네비게이션 테스트 오류: ${error.message}`);
  }

  console.log('\n📊 검증 결과 요약');
  console.log('===============================');
  console.log(`페이지 로드 성공: ${results.pageLoads}/${testPages.length}`);
  console.log(`한국어 텍스트 확인: ${results.koreanText}/${testPages.length}`);
  console.log(`모바일 반응형: ${results.mobileResponsive}/${testPages.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ 발견된 오류:');
    results.errors.forEach((error) => console.log(`  - ${error}`));
  }

  // 한국어 특화 기능 검증
  console.log('\n🇰🇷 한국어 특화 기능 검증');
  console.log('===============================');

  // 한국어 폰트 사용 확인
  const homeResponse = await fetch(BASE_URL);
  const homeHtml = await homeResponse.text();

  if (homeHtml.includes('Noto Sans KR') || homeHtml.includes('korean')) {
    console.log('✅ 한국어 전용 폰트 적용');
  } else {
    console.log('⚠️ 한국어 전용 폰트 미확인');
  }

  // 한국 문화 요소 확인
  const koreanCulturalTerms = ['사주', '운세', '타로', '별자리', '띠'];
  const foundTerms = koreanCulturalTerms.filter((term) => homeHtml.includes(term));

  console.log(`✅ 한국 문화 요소 발견: ${foundTerms.join(', ')}`);

  // PWA 기능 확인
  if (homeHtml.includes('manifest.json')) {
    console.log('✅ PWA 지원 (manifest.json)');
  }

  if (homeHtml.includes('service-worker') || homeHtml.includes('sw.js')) {
    console.log('✅ 서비스 워커 등록');
  }

  console.log('\n🎉 한국어 사용자 플로우 검증 완료!');

  return results;
}

// 실행
testKoreanUserFlow().catch(console.error);
