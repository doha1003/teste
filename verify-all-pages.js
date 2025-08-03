#!/usr/bin/env node

/**
 * 전체 26페이지 검증 스크립트
 * 각 페이지의 CSS 로딩, 네비게이션, 푸터, 기본 레이아웃을 확인
 */

import https from 'https';
import http from 'http';
import fs from 'fs';

// 검증할 페이지 목록
const pages = [
  // 핵심 페이지 (우선순위 1)
  { url: 'https://doha.kr/', name: '메인 홈페이지', category: 'core', priority: 1 },
  { url: 'https://doha.kr/404.html', name: '404 에러 페이지', category: 'core', priority: 1 },
  {
    url: 'https://doha.kr/offline.html',
    name: 'PWA 오프라인 페이지',
    category: 'core',
    priority: 1,
  },
  {
    url: 'https://doha.kr/result-detail.html',
    name: '결과 상세 페이지',
    category: 'core',
    priority: 1,
  },

  // 운세 서비스 (우선순위 2)
  { url: 'https://doha.kr/fortune/', name: '운세 메인', category: 'fortune', priority: 2 },
  { url: 'https://doha.kr/fortune/daily/', name: '일일 운세', category: 'fortune', priority: 2 },
  { url: 'https://doha.kr/fortune/saju/', name: '사주 운세', category: 'fortune', priority: 2 },
  { url: 'https://doha.kr/fortune/tarot/', name: '타로 운세', category: 'fortune', priority: 2 },
  { url: 'https://doha.kr/fortune/zodiac/', name: '별자리 운세', category: 'fortune', priority: 2 },
  {
    url: 'https://doha.kr/fortune/zodiac-animal/',
    name: '띠별 운세',
    category: 'fortune',
    priority: 2,
  },

  // 심리 테스트 (우선순위 2)
  { url: 'https://doha.kr/tests/', name: '테스트 메인', category: 'tests', priority: 2 },
  { url: 'https://doha.kr/tests/mbti/', name: 'MBTI 소개', category: 'tests', priority: 2 },
  {
    url: 'https://doha.kr/tests/mbti/test.html',
    name: 'MBTI 테스트',
    category: 'tests',
    priority: 2,
  },
  { url: 'https://doha.kr/tests/love-dna/', name: '연애 DNA 소개', category: 'tests', priority: 2 },
  {
    url: 'https://doha.kr/tests/love-dna/test.html',
    name: '연애 DNA 테스트',
    category: 'tests',
    priority: 2,
  },
  {
    url: 'https://doha.kr/tests/teto-egen/',
    name: '테토에겐 소개',
    category: 'tests',
    priority: 2,
  },
  {
    url: 'https://doha.kr/tests/teto-egen/test.html',
    name: '테토에겐 테스트',
    category: 'tests',
    priority: 2,
  },

  // 유틸리티 도구 (우선순위 3)
  { url: 'https://doha.kr/tools/', name: '도구 메인', category: 'tools', priority: 3 },
  {
    url: 'https://doha.kr/tools/bmi-calculator.html',
    name: 'BMI 계산기',
    category: 'tools',
    priority: 3,
  },
  {
    url: 'https://doha.kr/tools/salary-calculator.html',
    name: '급여 계산기',
    category: 'tools',
    priority: 3,
  },
  {
    url: 'https://doha.kr/tools/text-counter.html',
    name: '텍스트 카운터',
    category: 'tools',
    priority: 3,
  },

  // 정보 페이지 (우선순위 4)
  { url: 'https://doha.kr/about/', name: '사이트 소개', category: 'info', priority: 4 },
  { url: 'https://doha.kr/contact/', name: '연락처', category: 'info', priority: 4 },
  { url: 'https://doha.kr/faq/', name: '자주 묻는 질문', category: 'info', priority: 4 },
  { url: 'https://doha.kr/privacy/', name: '개인정보처리방침', category: 'info', priority: 4 },
  { url: 'https://doha.kr/terms/', name: '이용약관', category: 'info', priority: 4 },
];

// 검증 결과를 저장할 객체
const results = {
  success: [],
  errors: [],
  warnings: [],
  summary: {},
};

/**
 * HTTP(S) 요청을 Promise로 래핑
 */
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * 페이지 검증 함수
 */
async function verifyPage(page) {
  console.log(`🔍 검증 중: ${page.name} (${page.url})`);

  try {
    const response = await fetchPage(page.url);
    const { statusCode, headers, body } = response;

    const checks = {
      httpStatus: statusCode === 200,
      hasHtml: body.includes('<html'),
      hasHead: body.includes('<head>'),
      hasBody: body.includes('<body'),
      hasCssBundle: body.includes('/dist/styles.min.css'),
      hasNavbar: body.includes('navbar-placeholder') || body.includes('nav'),
      hasFooter: body.includes('footer-placeholder') || body.includes('<footer'),
      hasMetaViewport: body.includes('name="viewport"'),
      hasTitle: body.includes('<title>'),
      hasLang: body.includes('lang="ko"'),
      contentLength: body.length,
    };

    const issues = [];
    const warnings = [];

    // 필수 검사
    if (!checks.httpStatus) issues.push(`HTTP 상태 코드: ${statusCode}`);
    if (!checks.hasHtml) issues.push('HTML 태그 누락');
    if (!checks.hasHead) issues.push('HEAD 태그 누락');
    if (!checks.hasBody) issues.push('BODY 태그 누락');
    if (!checks.hasCssBundle) issues.push('CSS 번들 링크 누락 (/dist/styles.min.css)');
    if (!checks.hasNavbar) warnings.push('네비게이션 바 요소 없음');
    if (!checks.hasFooter) warnings.push('푸터 요소 없음');

    // 권장 검사
    if (!checks.hasMetaViewport) warnings.push('뷰포트 메타 태그 누락');
    if (!checks.hasTitle) warnings.push('타이틀 태그 누락');
    if (!checks.hasLang) warnings.push('한국어 lang 속성 누락');
    if (checks.contentLength < 1000) warnings.push('페이지 콘텐츠가 너무 짧음');

    const result = {
      page,
      checks,
      issues,
      warnings,
      status: issues.length === 0 ? 'success' : 'error',
    };

    if (result.status === 'success') {
      results.success.push(result);
      console.log(`✅ ${page.name}: 정상`);
    } else {
      results.errors.push(result);
      console.log(`❌ ${page.name}: ${issues.length}개 문제 발견`);
      issues.forEach((issue) => console.log(`   - ${issue}`));
    }

    if (warnings.length > 0) {
      results.warnings.push(result);
      console.log(`⚠️  ${page.name}: ${warnings.length}개 주의사항`);
      warnings.forEach((warning) => console.log(`   - ${warning}`));
    }

    return result;
  } catch (error) {
    const result = {
      page,
      error: error.message,
      status: 'error',
    };

    results.errors.push(result);
    console.log(`❌ ${page.name}: 요청 실패 - ${error.message}`);
    return result;
  }
}

/**
 * 모든 페이지 검증 실행
 */
async function verifyAllPages() {
  console.log('🚀 doha.kr 전체 페이지 검증 시작\n');
  console.log(`📄 총 ${pages.length}개 페이지 검증 예정\n`);

  const startTime = Date.now();

  // 우선순위별로 정렬
  const sortedPages = pages.sort((a, b) => a.priority - b.priority);

  // 페이지별 검증 (순차 실행으로 서버 부하 방지)
  for (const page of sortedPages) {
    await verifyPage(page);
    // 요청 간 짧은 대기시간
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);

  // 결과 요약 생성
  results.summary = {
    total: pages.length,
    success: results.success.length,
    errors: results.errors.length,
    warnings: results.warnings.length,
    duration: `${duration}초`,
    categories: {},
  };

  // 카테고리별 통계
  pages.forEach((page) => {
    if (!results.summary.categories[page.category]) {
      results.summary.categories[page.category] = { total: 0, success: 0, errors: 0 };
    }
    results.summary.categories[page.category].total++;
  });

  results.success.forEach((result) => {
    results.summary.categories[result.page.category].success++;
  });

  results.errors.forEach((result) => {
    results.summary.categories[result.page.category].errors++;
  });

  // 최종 보고서 출력
  console.log('\n' + '='.repeat(60));
  console.log('📊 검증 결과 요약');
  console.log('='.repeat(60));
  console.log(`전체 페이지: ${results.summary.total}개`);
  console.log(
    `성공: ${results.summary.success}개 (${Math.round((results.summary.success / results.summary.total) * 100)}%)`
  );
  console.log(`오류: ${results.summary.errors}개`);
  console.log(`경고: ${results.summary.warnings}개`);
  console.log(`검증 시간: ${results.summary.duration}`);

  console.log('\n📋 카테고리별 결과:');
  Object.keys(results.summary.categories).forEach((category) => {
    const stats = results.summary.categories[category];
    const successRate = Math.round((stats.success / stats.total) * 100);
    console.log(`  ${category}: ${stats.success}/${stats.total} (${successRate}%)`);
  });

  if (results.errors.length > 0) {
    console.log('\n❌ 오류가 발견된 페이지:');
    results.errors.forEach((result) => {
      console.log(
        `  - ${result.page.name}: ${result.issues ? result.issues.join(', ') : result.error}`
      );
    });
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  주의사항이 있는 페이지:');
    results.warnings.forEach((result) => {
      if (result.warnings && result.warnings.length > 0) {
        console.log(`  - ${result.page.name}: ${result.warnings.join(', ')}`);
      }
    });
  }

  // CSS 번들 특별 검증
  console.log('\n🎨 CSS 번들 검증:');
  const pagesWithCss = results.success.filter((r) => r.checks && r.checks.hasCssBundle);
  const pagesWithoutCss = pages.length - pagesWithCss.length;
  console.log(`CSS 번들 로딩: ${pagesWithCss.length}/${pages.length}개 페이지`);

  if (pagesWithoutCss > 0) {
    console.log('❌ CSS 번들이 없는 페이지들을 확인이 필요합니다.');
  } else {
    console.log('✅ 모든 페이지에서 CSS 번들이 정상적으로 로딩됩니다.');
  }

  console.log('\n' + '='.repeat(60));
  console.log('검증 완료! 🎉');

  // JSON 결과도 저장
  fs.writeFileSync('page-verification-results.json', JSON.stringify(results, null, 2));
  console.log('📄 상세 결과가 page-verification-results.json에 저장되었습니다.');

  return results;
}

// 스크립트 실행
verifyAllPages().catch(console.error);
