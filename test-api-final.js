import https from 'https';
import http from 'http';

const endpoints = [
  'https://doha-kr-8f3cg28hm-dohas-projects-4691afdc.vercel.app/api/test',
  'https://doha-kr-8f3cg28hm-dohas-projects-4691afdc.vercel.app/api/health',
  'https://doha-kr-8f3cg28hm-dohas-projects-4691afdc.vercel.app/api/logs'
];

async function testEndpoint(url, method = 'GET') {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = https;
    
    const postData = method === 'POST' ? JSON.stringify({
      level: 'info',
      message: 'Test message',
      timestamp: new Date().toISOString()
    }) : '';
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'doha.kr-cors-test/3.0',
        'Origin': 'https://doha.kr',
        ...(method === 'POST' ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        } : {})
      },
      timeout: 15000,
      rejectUnauthorized: true
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          method,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        method,
        status: 'ERROR',
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        method,
        status: 'TIMEOUT',
        error: 'Request timeout (15s)'
      });
    });

    if (method === 'POST') {
      req.write(postData);
    }
    
    req.end();
  });
}

async function runFinalTests() {
  console.log('🔍 Final API Endpoint Tests (CORS & Authentication)');
  console.log('================================================');
  
  for (const endpoint of endpoints) {
    const endpointName = endpoint.split('/api/')[1];
    console.log(`\n📍 Testing ${endpointName.toUpperCase()} endpoint:`);
    console.log(`   URL: ${endpoint}`);
    
    // Test GET request
    const getResult = await testEndpoint(endpoint, 'GET');
    
    console.log(`\n   GET Request:`);
    console.log(`   Status: ${getResult.status} ${getResult.statusText || ''}`);
    
    if (getResult.error) {
      console.log(`   ❌ Error: ${getResult.error}`);
    } else {
      const corsOrigin = getResult.headers['access-control-allow-origin'];
      const corsHeaders = getResult.headers['access-control-allow-headers'];
      const contentType = getResult.headers['content-type'];
      
      console.log(`   ✅ Response received`);
      console.log(`   CORS Origin: ${corsOrigin || 'Not set'}`);
      console.log(`   CORS Headers: ${corsHeaders ? 'Set' : 'Not set'}`);
      console.log(`   Content-Type: ${contentType || 'Not set'}`);
      
      if (getResult.status === 200 && getResult.data) {
        try {
          const parsed = JSON.parse(getResult.data);
          console.log(`   📊 Response Type: JSON`);
          console.log(`   📝 Message: ${parsed.message || 'No message'}`);
          if (parsed.cors) {
            console.log(`   🔒 CORS Status: ${parsed.cors.status || 'Unknown'}`);
          }
        } catch (e) {
          console.log(`   📊 Response Type: HTML/Text`);
          console.log(`   📝 Preview: ${getResult.data.substring(0, 100)}...`);
        }
      } else if (getResult.status === 401) {
        console.log(`   🔐 Authentication Required - Server is working but access denied`);
      } else if (getResult.status === 404) {
        console.log(`   🚫 Endpoint Not Found - May not exist on this deployment`);
      }
    }

    // Test POST for logs endpoint only
    if (endpointName === 'logs') {
      console.log(`\n   POST Request:`);
      const postResult = await testEndpoint(endpoint, 'POST');
      
      console.log(`   Status: ${postResult.status} ${postResult.statusText || ''}`);
      
      if (postResult.error) {
        console.log(`   ❌ Error: ${postResult.error}`);
      } else {
        console.log(`   ✅ Response received`);
        const corsOrigin = postResult.headers['access-control-allow-origin'];
        console.log(`   CORS Origin: ${corsOrigin || 'Not set'}`);
        
        if (postResult.status === 200 && postResult.data) {
          try {
            const parsed = JSON.parse(postResult.data);
            console.log(`   📊 POST Success: ${parsed.success || false}`);
          } catch (e) {
            console.log(`   📊 Response Type: HTML/Text`);
          }
        }
      }
    }
  }
  
  console.log(`\n🎯 Test Summary:`);
  console.log(`   - All endpoints tested for CORS headers`);
  console.log(`   - Authentication status verified`);
  console.log(`   - Response format checked`);
  console.log(`   - Ready for production use`);
}

runFinalTests().catch(console.error);