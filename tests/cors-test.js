// CORS 설정 테스트 스크립트
import { isOriginAllowed } from '../api/cors-config.js';

// 테스트 케이스
const testCases = [
  // 프로덕션 도메인 - 항상 허용되어야 함
  { origin: 'https://doha.kr', expected: true, description: '메인 도메인' },
  { origin: 'https://www.doha.kr', expected: true, description: 'www 서브도메인' },
  { origin: 'https://sunro76.github.io', expected: true, description: 'GitHub Pages' },

  // 개발 환경에서만 허용
  {
    origin: 'http://localhost:5173',
    expected: process.env.NODE_ENV === 'development',
    description: 'Vite 개발 서버',
  },
  {
    origin: 'http://localhost:3000',
    expected: process.env.NODE_ENV === 'development',
    description: '일반 개발 서버',
  },
  {
    origin: 'http://127.0.0.1:5173',
    expected: process.env.NODE_ENV === 'development',
    description: 'IP 주소 개발 서버',
  },

  // 허용되지 않아야 하는 도메인
  { origin: 'https://malicious-site.com', expected: false, description: '알 수 없는 도메인' },
  { origin: 'http://doha.kr', expected: false, description: 'HTTP 프로토콜 (HTTPS가 아님)' },
  { origin: 'https://doha.kr.fake.com', expected: false, description: '위장 도메인' },
  { origin: 'https://subdomain.doha.kr', expected: false, description: '허용되지 않은 서브도메인' },
  { origin: null, expected: false, description: 'Origin 헤더 없음' },
  { origin: '', expected: false, description: '빈 Origin' },
];

// 테스트 실행
console.log('CORS 설정 테스트 시작...\n');
console.log(`환경: ${process.env.NODE_ENV || 'production'}\n`);

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = isOriginAllowed(testCase.origin);
  const success = result === testCase.expected;

  if (success) {
    console.log(`✅ 테스트 ${index + 1} 통과: ${testCase.description}`);
    console.log(`   Origin: ${testCase.origin} → ${result ? '허용' : '차단'}`);
    passed++;
  } else {
    console.log(`❌ 테스트 ${index + 1} 실패: ${testCase.description}`);
    console.log(`   Origin: ${testCase.origin}`);
    console.log(
      `   예상: ${testCase.expected ? '허용' : '차단'}, 실제: ${result ? '허용' : '차단'}`
    );
    failed++;
  }
});

console.log(`\n테스트 결과: ${passed}개 통과, ${failed}개 실패`);

// 와일드카드 패턴 테스트 (Vercel 프리뷰 환경)
if (process.env.VERCEL_ENV === 'preview') {
  console.log('\nVercel 프리뷰 환경 테스트:');
  const previewTests = [
    'https://doha-preview-abc123.vercel.app',
    'https://doha-staging.vercel.app',
    'https://feature-branch.vercel.app',
  ];

  previewTests.forEach((origin) => {
    const result = isOriginAllowed(origin);
    console.log(`${result ? '✅' : '❌'} ${origin} → ${result ? '허용' : '차단'}`);
  });
}

// 환경변수 추가 도메인 테스트
if (process.env.ADDITIONAL_ALLOWED_ORIGINS) {
  console.log('\n환경변수 추가 도메인 테스트:');
  const additionalOrigins = process.env.ADDITIONAL_ALLOWED_ORIGINS.split(',');

  additionalOrigins.forEach((origin) => {
    const result = isOriginAllowed(origin.trim());
    console.log(`${result ? '✅' : '❌'} ${origin} → ${result ? '허용' : '차단'}`);
  });
}

// 테스트 실패 시 프로세스 종료 코드 설정
if (failed > 0) {
  process.exit(1);
}
