import fs from 'fs';

// JSON 파일 읽기
const data = JSON.parse(
  fs.readFileSync('test-results-comprehensive/comprehensive-report.json', 'utf8')
);

// 콘솔 에러 수집
const consoleErrors = [];
data.results.forEach((page) => {
  if (page.validation && page.validation.consoleMessages) {
    page.validation.consoleMessages.forEach((msg) => {
      if (msg.type === 'error') {
        consoleErrors.push({
          page: page.name,
          error: msg.text,
        });
      }
    });
  }
});

// 에러 카운트
const errorCounts = {};
consoleErrors.forEach((e) => {
  const errorKey = e.error.split(' at ')[0].substring(0, 100);
  if (!errorCounts[errorKey]) {
    errorCounts[errorKey] = {
      count: 0,
      pages: [],
    };
  }
  errorCounts[errorKey].count++;
  if (!errorCounts[errorKey].pages.includes(e.page)) {
    errorCounts[errorKey].pages.push(e.page);
  }
});

// 정렬 및 출력
console.log('🔴 JavaScript 에러 분석 결과');
console.log('='.repeat(80));
console.log('\n📊 가장 많이 발생한 에러 TOP 10:\n');

Object.entries(errorCounts)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 10)
  .forEach(([error, info], index) => {
    console.log(`${index + 1}. [${info.count}회] ${error}`);
    console.log(
      `   발생 페이지: ${info.pages.slice(0, 3).join(', ')}${info.pages.length > 3 ? ' 외 ' + (info.pages.length - 3) + '개' : ''}`
    );
    console.log();
  });

// 페이지별 에러 수 통계
const pageErrorCounts = {};
consoleErrors.forEach((e) => {
  pageErrorCounts[e.page] = (pageErrorCounts[e.page] || 0) + 1;
});

console.log('\n📋 페이지별 에러 수:\n');
Object.entries(pageErrorCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([page, count]) => {
    console.log(`  ${page}: ${count}개`);
  });

console.log('\n💡 주요 문제 패턴:');
console.log('  1. Cannot read properties of null - DOM 요소 찾기 실패');
console.log('  2. ... is not a constructor - 클래스/생성자 정의 누락');
console.log('  3. Failed to load resource - 리소스 로드 실패');
