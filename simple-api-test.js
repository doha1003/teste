#!/usr/bin/env node

/**
 * 간단한 API 연결 테스트
 */

import https from 'https';

function testConnection(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'HEAD',
      timeout: 5000
    }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        headers: res.headers
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 API 연결 테스트');

  const urls = [
    'https://doha.kr',
    'https://doha.kr/api/health',
    'https://doha.kr/api/fortune',
    'https://doha.kr/api/manseryeok'
  ];

  for (const url of urls) {
    console.log(`\n🧪 Testing: ${url}`);
    
    const result = await testConnection(url);
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    } else {
      console.log(`✅ Status: ${result.status}`);
      console.log(`📋 Server: ${result.headers.server || 'Unknown'}`);
      
      if (result.headers['x-vercel-id']) {
        console.log(`🚀 Vercel ID: ${result.headers['x-vercel-id']}`);
      }
    }
  }
}

runTests().catch(console.error);