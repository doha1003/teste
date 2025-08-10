/**
 * 간단한 라이브 API 수동 테스트
 * 실제 브라우저에서 API 호출이 가능한지 확인
 */

const testConfigurations = [
  {
    name: 'Vercel API 테스트',
    url: 'https://doha-kr-api.vercel.app/api/fortune',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      type: 'daily',
      userData: {
        name: '테스트유저',
        birthDate: '1990-05-15',
        gender: 'male',
      },
    },
  },
  {
    name: 'GitHub Pages API 테스트',
    url: 'https://doha.kr/api/fortune',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      type: 'daily',
      userData: {
        name: '테스트유저',
        birthDate: '1990-05-15',
        gender: 'male',
      },
    },
  },
];

async function testAPIEndpoint(config) {
  console.log(`\n🔍 ${config.name} 시작`);
  console.log(`URL: ${config.url}`);

  try {
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: JSON.stringify(config.body),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers));

    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ 응답 성공:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log('❌ 응답 실패:', errorText);
      return { success: false, error: errorText, status: response.status };
    }
  } catch (error) {
    console.log('❌ 네트워크 오류:', error.message);
    return { success: false, error: error.message };
  }
}

async function runManualAPITests() {
  console.log('🚀 라이브 API 수동 테스트 시작');
  console.log('='.repeat(60));

  const results = [];

  for (const config of testConfigurations) {
    const result = await testAPIEndpoint(config);
    results.push({
      name: config.name,
      url: config.url,
      ...result,
    });

    // API 사이 간격
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 테스트 결과 요약');
  console.log('='.repeat(60));

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}: ${result.success ? '✅ 성공' : '❌ 실패'}`);
    if (!result.success) {
      console.log(`   오류: ${result.error}`);
      if (result.status) {
        console.log(`   HTTP Status: ${result.status}`);
      }
    }
  });

  const successCount = results.filter((r) => r.success).length;
  console.log(
    `\n성공률: ${successCount}/${results.length} (${((successCount / results.length) * 100).toFixed(1)}%)`
  );

  return results;
}

// Node.js 환경에서 실행
if (typeof window === 'undefined') {
  // fetch polyfill for Node.js
  const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
  global.fetch = fetch;

  runManualAPITests().catch(console.error);
}
