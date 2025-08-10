import https from 'https';
import http from 'http';

const endpoints = [
  'https://doha-kr-8f3cg28hm-dohas-projects-4691afdc.vercel.app/api/logs',
  'https://doha.kr/api/logs'
];

async function testLogEndpoint(url, method = 'GET') {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const postData = method === 'POST' ? JSON.stringify({
      level: 'info',
      message: 'Test log message',
      timestamp: new Date().toISOString(),
      component: 'api-test'
    }) : '';
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'doha.kr-health-check/1.0',
        'Origin': 'https://doha.kr',
        ...(method === 'POST' ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        } : {})
      },
      timeout: 10000
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          method,
          status: res.statusCode,
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
        error: 'Request timeout (10s)'
      });
    });

    if (method === 'POST') {
      req.write(postData);
    }
    
    req.end();
  });
}

async function runLogTests() {
  console.log('🔍 API Logs Endpoint Test Results:');
  console.log('====================================');
  
  for (const endpoint of endpoints) {
    // Test GET request
    console.log(`\nTesting GET: ${endpoint}`);
    const getResult = await testLogEndpoint(endpoint, 'GET');
    
    console.log(`Status: ${getResult.status}`);
    if (getResult.error) {
      console.log(`❌ Error: ${getResult.error}`);
    } else {
      console.log(`✅ GET Success!`);
      console.log(`CORS Origin: ${getResult.headers['access-control-allow-origin'] || 'Not set'}`);
      
      if (getResult.data) {
        try {
          const parsed = JSON.parse(getResult.data);
          console.log(`Response: ${JSON.stringify(parsed, null, 2)}`);
        } catch (e) {
          console.log(`Raw Response: ${getResult.data.substring(0, 200)}...`);
        }
      }
    }

    // Test POST request
    console.log(`\nTesting POST: ${endpoint}`);
    const postResult = await testLogEndpoint(endpoint, 'POST');
    
    console.log(`Status: ${postResult.status}`);
    if (postResult.error) {
      console.log(`❌ Error: ${postResult.error}`);
    } else {
      console.log(`✅ POST Success!`);
      console.log(`CORS Origin: ${postResult.headers['access-control-allow-origin'] || 'Not set'}`);
      
      if (postResult.data) {
        try {
          const parsed = JSON.parse(postResult.data);
          console.log(`Response: ${JSON.stringify(parsed, null, 2)}`);
        } catch (e) {
          console.log(`Raw Response: ${postResult.data.substring(0, 200)}...`);
        }
      }
    }
  }
}

runLogTests().catch(console.error);