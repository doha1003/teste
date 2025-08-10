// API 직접 테스트
const API_ENDPOINT = 'https://doha-kr-ap.vercel.app/api/fortune';

async function testFortuneAPI() {
  console.log('🧪 Fortune API 직접 테스트 시작');
  console.log('API 엔드포인트:', API_ENDPOINT);

  try {
    const testData = {
      type: 'daily',
      data: {
        name: '테스트유저',
        birth: '1990-05-15',
        gender: 'male',
        hour: 12,
      },
    };

    console.log('📤 요청 데이터:', JSON.stringify(testData, null, 2));

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📡 응답 상태:', response.status);
    console.log('📡 응답 헤더:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 오류 응답:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ API 응답 성공:', JSON.stringify(result, null, 2));

    if (result.success && result.data) {
      console.log('🎉 Fortune 데이터 수신 성공!');
      console.log('운세 내용 길이:', result.data.fortune?.length || 0);
      if (result.data.fortune) {
        console.log('운세 샘플:', result.data.fortune.substring(0, 100) + '...');
      }
    } else {
      console.log('⚠️ API는 성공했지만 운세 데이터가 없음');
    }

    return result;
  } catch (error) {
    console.error('💥 API 테스트 실패:', error.message);
    throw error;
  }
}

async function testZodiacAPI() {
  console.log('\n⭐ Zodiac API 직접 테스트 시작');

  try {
    const testData = {
      type: 'zodiac',
      data: {
        zodiac: 'aries',
      },
    };

    console.log('📤 별자리 요청 데이터:', JSON.stringify(testData, null, 2));

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📡 별자리 응답 상태:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 별자리 API 오류:', errorText);
      return null;
    }

    const result = await response.json();
    console.log('✅ 별자리 API 응답 성공:', JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error('💥 별자리 API 테스트 실패:', error.message);
    return null;
  }
}

// 테스트 실행
async function runTests() {
  console.log('🚀 doha.kr Fortune API 종합 테스트');
  console.log('='.repeat(50));

  try {
    // 1. 일일운세 API 테스트
    await testFortuneAPI();

    // 2. 별자리 운세 API 테스트
    await testZodiacAPI();

    console.log('\n' + '='.repeat(50));
    console.log('✅ 모든 API 테스트 완료!');
  } catch (error) {
    console.log('\n' + '='.repeat(50));
    console.log('❌ API 테스트 중 오류 발생:', error.message);
  }
}

// Node.js 환경에서 fetch 사용을 위한 설정
if (typeof fetch === 'undefined') {
  const { default: fetch } = await import('node-fetch');
  globalThis.fetch = fetch;
}

runTests();
