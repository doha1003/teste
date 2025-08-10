/**
 * Quick API Test for doha.kr Fortune API
 * Tests the actual API endpoint with proper request format
 */

async function testFortuneAPI() {
  console.log('🧪 Testing doha.kr Fortune API...');

  const testData = {
    type: 'daily',
    userData: {
      birthDate: '1990-01-01',
      gender: 'male',
      name: '테스트',
    },
  };

  try {
    console.log('📤 Sending request to: https://doha.kr/api/fortune');
    console.log('📝 Request data:', JSON.stringify(testData, null, 2));

    const response = await fetch('https://doha.kr/api/fortune', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'doha-api-test/1.0',
      },
      body: JSON.stringify(testData),
    });

    console.log('📬 Response status:', response.status);
    console.log('📬 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📬 Response body:', responseText);

    if (response.ok) {
      console.log('✅ API test successful!');
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log('📊 Parsed response:', jsonResponse);
      } catch (e) {
        console.log('📝 Response is not JSON, might be plain text or HTML');
      }
    } else {
      console.log('❌ API test failed with status:', response.status);
    }
  } catch (error) {
    console.error('❌ API test error:', error.message);
  }
}

// Test Vercel dev endpoint as well
async function testLocalAPI() {
  console.log('\n🧪 Testing local Vercel dev API...');

  const testData = {
    type: 'daily',
    userData: {
      birthDate: '1990-01-01',
      gender: 'male',
      name: '테스트',
    },
  };

  try {
    const response = await fetch('http://localhost:3000/api/fortune', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📬 Local API status:', response.status);
    const responseText = await response.text();
    console.log('📬 Local API response:', responseText);
  } catch (error) {
    console.log('ℹ️ Local API not available (this is expected if not running vercel dev)');
  }
}

// Run tests
testFortuneAPI()
  .then(() => {
    return testLocalAPI();
  })
  .catch(console.error);
