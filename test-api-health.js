import https from 'https';
import http from 'http';

const endpoints = [
  'https://doha-kr-8f3cg28hm-dohas-projects-4691afdc.vercel.app/api/health',
  'https://doha.kr/api/health',
  'http://localhost:3000/api/health'
];

async function testEndpoint(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'doha.kr-health-check/1.0'
      },
      timeout: 10000
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timeout (10s)'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 API Health Check Test Results:');
  console.log('=====================================');
  
  for (const endpoint of endpoints) {
    console.log(`\nTesting: ${endpoint}`);
    const result = await testEndpoint(endpoint);
    
    console.log(`Status: ${result.status}`);
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    } else if (result.headers) {
      console.log(`✅ Success!`);
      console.log(`CORS Origin: ${result.headers['access-control-allow-origin'] || 'Not set'}`);
      console.log(`Content-Type: ${result.headers['content-type'] || 'Not set'}`);
      
      if (result.data) {
        try {
          const parsed = JSON.parse(result.data);
          console.log(`Service: ${parsed.service || 'Unknown'}`);
          console.log(`Version: ${parsed.version || 'Unknown'}`);
          console.log(`Environment: ${parsed.environment || 'Unknown'}`);
        } catch (e) {
          console.log(`Raw Response: ${result.data.substring(0, 100)}...`);
        }
      }
    }
  }
}

runTests().catch(console.error);