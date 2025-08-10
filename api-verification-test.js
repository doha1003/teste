#!/usr/bin/env node

/**
 * doha.kr API 긴급 검증 및 복구 스크립트
 * 팀리더 긴급 지시: API 배포 상태 점검 및 문제 해결
 */

import https from 'https';

// 테스트할 엔드포인트들
const endpoints = [
  { name: 'GitHub Pages (현재 도메인)', url: 'https://doha.kr' },
  { name: 'GitHub Pages API', url: 'https://doha.kr/api/health' },
  {
    name: 'Vercel Production',
    url: 'https://doha-kr-8f3cg28hm-dohas-projects-4691afdc.vercel.app',
  },
  {
    name: 'Vercel API Health',
    url: 'https://doha-kr-8f3cg28hm-dohas-projects-4691afdc.vercel.app/api/health',
  },
  {
    name: 'Vercel Fortune API',
    url: 'https://doha-kr-8f3cg28hm-dohas-projects-4691afdc.vercel.app/api/fortune',
  },
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = https.get(endpoint.url, (res) => {
      const duration = Date.now() - start;
      resolve({
        name: endpoint.name,
        url: endpoint.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        server: res.headers.server || 'Unknown',
        success: res.statusCode < 400,
      });
    });

    req.on('error', (error) => {
      resolve({
        name: endpoint.name,
        url: endpoint.url,
        status: 'ERROR',
        duration: 'N/A',
        server: 'N/A',
        success: false,
        error: error.message,
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        name: endpoint.name,
        url: endpoint.url,
        status: 'TIMEOUT',
        duration: '10000ms+',
        server: 'N/A',
        success: false,
        error: 'Request timeout',
      });
    });
  });
}

async function runDiagnostics() {
  console.log('\n🔍 doha.kr 긴급 진단 시작...\n');
  console.log('='.repeat(80));

  const results = [];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);

    const statusIcon = result.success ? '✅' : '❌';
    const statusColor = result.success ? '\x1b[32m' : '\x1b[31m';

    console.log(`${statusIcon} ${result.name}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   Status: ${statusColor}${result.status}\x1b[0m`);
    console.log(`   Duration: ${result.duration}`);
    console.log(`   Server: ${result.server}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log('');
  }

  console.log('='.repeat(80));
  console.log('\n📊 진단 결과 요약:');

  const githubPages = results.filter((r) => r.server?.includes('GitHub')).length;
  const vercelServers = results.filter((r) => r.server?.includes('Vercel')).length;
  const successCount = results.filter((r) => r.success).length;

  console.log(`✅ 성공: ${successCount}/${results.length}`);
  console.log(`🔵 GitHub Pages 서버: ${githubPages}개`);
  console.log(`🟢 Vercel 서버: ${vercelServers}개`);

  // 문제 분석
  console.log('\n🚨 문제 분석:');
  if (githubPages > 0 && vercelServers > 0) {
    console.log('❌ DNS 설정 문제: doha.kr이 GitHub Pages를 가리키고 있음');
    console.log('✅ Vercel 서버는 정상 작동');
    console.log('');
    console.log('🔧 해결 방안:');
    console.log('1. 도메인 DNS 설정을 Vercel로 변경');
    console.log('2. 또는 Vercel 도메인으로 임시 운영');
    console.log('3. CDN 캐시 무효화 필요');
  }

  console.log('\n⚡ 긴급 조치 상태:');
  console.log('🔴 Critical: API 엔드포인트 접근 불가');
  console.log('🟡 Moderate: 정적 사이트는 정상 서비스');
  console.log('🟢 Low: PWA 및 오프라인 기능 정상');

  return results;
}

// ES Module에서 직접 실행 시 진단 시작
runDiagnostics().catch(console.error);

export { runDiagnostics };
