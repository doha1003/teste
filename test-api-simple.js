/**
 * 간단한 API 테스트 스크립트 (Node.js 내장 fetch 사용)
 */

const BASE_URL = 'https://doha.kr';

async function testAPI() {
  console.log('🚀 API 기본 테스트 시작\n');

  // 1. Fortune API 단일 테스트
  console.log('🔮 Fortune API 테스트...');
  try {
    const fortuneStart = performance.now();
    const fortuneResponse = await fetch(`${BASE_URL}/api/fortune`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'daily',
        data: { name: '테스트', birthDate: '1990-01-01', gender: 'male' },
      }),
    });
    const fortuneTime = performance.now() - fortuneStart;
    const fortuneData = await fortuneResponse.json();

    console.log(`   상태: ${fortuneResponse.status}`);
    console.log(`   응답 시간: ${Math.round(fortuneTime)}ms`);
    console.log(`   성공: ${fortuneResponse.ok ? '✅' : '❌'}`);
    if (fortuneData.error) console.log(`   에러: ${fortuneData.error}`);
  } catch (error) {
    console.log(`   ❌ 에러: ${error.message}`);
  }

  // 2. Manseryeok API 단일 테스트
  console.log('\n📅 Manseryeok API 테스트...');
  try {
    const manseryeokStart = performance.now();
    const manseryeokResponse = await fetch(`${BASE_URL}/api/manseryeok`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: 2025, month: 8, day: 2, hour: 14 }),
    });
    const manseryeokTime = performance.now() - manseryeokStart;
    const manseryeokData = await manseryeokResponse.json();

    console.log(`   상태: ${manseryeokResponse.status}`);
    console.log(`   응답 시간: ${Math.round(manseryeokTime)}ms`);
    console.log(`   성공: ${manseryeokResponse.ok ? '✅' : '❌'}`);
    console.log(`   500ms 미만: ${manseryeokTime < 500 ? '✅' : '❌'}`);
    if (manseryeokData.error) console.log(`   에러: ${manseryeokData.error}`);
  } catch (error) {
    console.log(`   ❌ 에러: ${error.message}`);
  }

  // 3. 보안 헤더 확인
  console.log('\n🔒 보안 헤더 확인...');
  try {
    const headResponse = await fetch(`${BASE_URL}/`, { method: 'HEAD' });
    const headers = {
      'X-Content-Type-Options': headResponse.headers.get('X-Content-Type-Options'),
      'X-Frame-Options': headResponse.headers.get('X-Frame-Options'),
      'Strict-Transport-Security': headResponse.headers.get('Strict-Transport-Security'),
      'Content-Security-Policy': headResponse.headers.get('Content-Security-Policy'),
    };

    Object.entries(headers).forEach(([name, value]) => {
      console.log(`   ${name}: ${value ? '✅' : '❌'}`);
    });
  } catch (error) {
    console.log(`   ❌ 에러: ${error.message}`);
  }

  console.log('\n✅ 기본 테스트 완료');
}

testAPI().catch(console.error);
