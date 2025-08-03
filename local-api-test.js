#!/usr/bin/env node

/**
 * 로컬 API 직접 테스트
 * Vercel 개발 서버 없이 API 함수 직접 실행
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 설정
process.env.NODE_ENV = 'development';
process.env.GEMINI_API_KEY = 'test-key'; // 테스트용

console.log('🧪 doha.kr API 로컬 테스트 시작\n');

// Mock Request/Response 객체
class MockRequest {
  constructor(method, body = null, query = {}, headers = {}) {
    this.method = method;
    this.body = body;
    this.query = query;
    this.headers = {
      'content-type': 'application/json',
      'user-agent': 'api-test',
      'x-forwarded-for': '127.0.0.1',
      ...headers
    };
  }
}

class MockResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this.data = null;
    this.ended = false;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  setHeader(name, value) {
    this.headers[name] = value;
    return this;
  }

  get(name) {
    return this.headers[name];
  }

  getHeaders() {
    return this.headers;
  }

  json(data) {
    this.data = data;
    this.ended = true;
    return this;
  }

  end() {
    this.ended = true;
    return this;
  }
}

// 1. Fortune API 테스트
async function testFortuneAPI() {
  console.log('🔮 Fortune API 테스트');

  try {
    // Fortune API 모듈 동적 임포트
    const fortuneModule = await import('./api/fortune.js');
    const fortuneHandler = fortuneModule.default;

    const tests = [
      {
        name: '잘못된 메소드 (GET)',
        request: new MockRequest('GET'),
        expectedStatus: 405
      },
      {
        name: '빈 POST 요청',
        request: new MockRequest('POST', {}),
        expectedStatus: 400
      },
      {
        name: '유효한 일일운세 요청',
        request: new MockRequest('POST', {
          type: 'daily',
          data: {
            name: '홍길동',
            birthDate: '1990-01-01',
            gender: 'male',
            birthTime: '14:30'
          },
          todayDate: '2025-08-03'
        }),
        expectedStatus: [200, 503] // 503은 API 키 설정 안됨
      },
      {
        name: '유효한 별자리 운세 요청',
        request: new MockRequest('POST', {
          type: 'zodiac',
          data: {
            zodiac: 'aries'
          }
        }),
        expectedStatus: [200, 503]
      },
      {
        name: '잘못된 타입',
        request: new MockRequest('POST', {
          type: 'invalid_type',
          data: {}
        }),
        expectedStatus: 400
      }
    ];

    for (const test of tests) {
      try {
        console.log(`  🧪 ${test.name}...`);
        
        const res = new MockResponse();
        await fortuneHandler(test.request, res);
        
        const expectedStatuses = Array.isArray(test.expectedStatus) 
          ? test.expectedStatus 
          : [test.expectedStatus];
        
        const passed = expectedStatuses.includes(res.statusCode);
        
        console.log(`    ${passed ? '✅' : '❌'} Status: ${res.statusCode}`);
        
        if (res.data) {
          if (res.data.error) {
            console.log(`    📝 Error: ${res.data.error}`);
          } else if (res.data.success) {
            console.log(`    ✨ Success: ${res.data.message || 'Data received'}`);
          }
        }
        
      } catch (error) {
        console.log(`    ❌ Exception: ${error.message}`);
      }
    }

  } catch (error) {
    console.log(`  ❌ 모듈 로드 실패: ${error.message}`);
  }
}

// 2. Manseryeok API 테스트
async function testManseryeokAPI() {
  console.log('\n📅 Manseryeok API 테스트');

  try {
    const manseryeokModule = await import('./api/manseryeok.js');
    const manseryeokHandler = manseryeokModule.default;

    const tests = [
      {
        name: 'GET 요청 - 쿼리 파라미터',
        request: new MockRequest('GET', null, {
          year: '2025',
          month: '8',
          day: '3',
          hour: '14'
        }),
        expectedStatus: [200, 404]
      },
      {
        name: 'POST 요청 - JSON 바디',
        request: new MockRequest('POST', {
          year: 2025,
          month: 8,
          day: 3,
          hour: 14
        }),
        expectedStatus: [200, 404]
      },
      {
        name: '필수 파라미터 누락',
        request: new MockRequest('POST', {
          year: 2025,
          month: 8
          // day 누락
        }),
        expectedStatus: 400
      },
      {
        name: '잘못된 날짜',
        request: new MockRequest('POST', {
          year: 2025,
          month: 13, // 잘못된 월
          day: 3
        }),
        expectedStatus: 400
      },
      {
        name: '지원 범위 밖 연도',
        request: new MockRequest('POST', {
          year: 1800, // 1841 이전
          month: 1,
          day: 1
        }),
        expectedStatus: 400
      }
    ];

    for (const test of tests) {
      try {
        console.log(`  🧪 ${test.name}...`);
        
        const res = new MockResponse();
        await manseryeokHandler(test.request, res);
        
        const expectedStatuses = Array.isArray(test.expectedStatus) 
          ? test.expectedStatus 
          : [test.expectedStatus];
        
        const passed = expectedStatuses.includes(res.statusCode);
        
        console.log(`    ${passed ? '✅' : '❌'} Status: ${res.statusCode}`);
        
        if (res.data?.data?.yearGanji) {
          console.log(`    📊 Year Ganji: ${res.data.data.yearGanji}`);
        }
        
        if (res.data?.error) {
          console.log(`    📝 Error: ${res.data.error}`);
        }
        
      } catch (error) {
        console.log(`    ❌ Exception: ${error.message}`);
      }
    }

  } catch (error) {
    console.log(`  ❌ 모듈 로드 실패: ${error.message}`);
  }
}

// 3. Validation 모듈 테스트
async function testValidation() {
  console.log('\n🔒 Validation 테스트');

  try {
    const validationModule = await import('./api/validation.js');
    const { 
      sanitizeInput, 
      validateDate, 
      validateZodiac, 
      validateFortuneRequest,
      checkRateLimit 
    } = validationModule;

    // 입력 정제 테스트
    console.log('  🧪 Input Sanitization...');
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    console.log(`    ${sanitized.includes('<') ? '❌' : '✅'} XSS Prevention: "${sanitized}"`);

    // 날짜 검증 테스트
    console.log('  🧪 Date Validation...');
    const validDate = validateDate('1990-01-01');
    const invalidDate = validateDate('invalid-date');
    const outOfRange = validateDate('1800-01-01');
    
    console.log(`    ${validDate.valid ? '✅' : '❌'} Valid date: 1990-01-01`);
    console.log(`    ${!invalidDate.valid ? '✅' : '❌'} Invalid date: invalid-date`);
    console.log(`    ${!outOfRange.valid ? '✅' : '❌'} Out of range: 1800-01-01`);

    // 별자리 검증 테스트
    console.log('  🧪 Zodiac Validation...');
    const validZodiac = validateZodiac('aries');
    const invalidZodiac = validateZodiac('invalid');
    
    console.log(`    ${validZodiac ? '✅' : '❌'} Valid zodiac: aries`);
    console.log(`    ${!invalidZodiac ? '✅' : '❌'} Invalid zodiac: invalid`);

    // 요청 검증 테스트
    console.log('  🧪 Request Validation...');
    const validRequest = validateFortuneRequest('daily', {
      name: '홍길동',
      birthDate: '1990-01-01',
      gender: 'male'
    });
    const invalidRequest = validateFortuneRequest('daily', {
      name: '', // 빈 이름
      birthDate: 'invalid-date',
      gender: 'invalid'
    });
    
    console.log(`    ${validRequest.valid ? '✅' : '❌'} Valid request`);
    console.log(`    ${!invalidRequest.valid ? '✅' : '❌'} Invalid request (${invalidRequest.errors.length} errors)`);

    // Rate Limiting 테스트
    console.log('  🧪 Rate Limiting...');
    const ip = '127.0.0.1';
    
    // 정상 요청
    const firstRequest = checkRateLimit(ip);
    console.log(`    ${firstRequest.allowed ? '✅' : '❌'} First request allowed`);
    
    // 다중 요청 시뮬레이션
    let allowedCount = 0;
    let blockedCount = 0;
    
    for (let i = 0; i < 35; i++) { // 제한이 30이므로 35개 요청
      const result = checkRateLimit(ip);
      if (result.allowed) {
        allowedCount++;
      } else {
        blockedCount++;
      }
    }
    
    console.log(`    📊 Rate limit test: ${allowedCount} allowed, ${blockedCount} blocked`);
    console.log(`    ${blockedCount > 0 ? '✅' : '❌'} Rate limiting working (threshold: 30)`);

  } catch (error) {
    console.log(`  ❌ 모듈 로드 실패: ${error.message}`);
  }
}

// 4. CORS 설정 테스트
async function testCORS() {
  console.log('\n🌐 CORS 설정 테스트');

  try {
    const corsModule = await import('./api/cors-config.js');
    const { setCorsHeaders, validateRequest } = corsModule;

    const tests = [
      {
        name: '허용된 Origin (doha.kr)',
        headers: { origin: 'https://doha.kr' },
        shouldAllow: true
      },
      {
        name: '허용되지 않은 Origin',
        headers: { origin: 'https://malicious.com' },
        shouldAllow: false
      },
      {
        name: '개발 환경 localhost',
        headers: { origin: 'http://localhost:3000' },
        shouldAllow: true // NODE_ENV가 development로 설정됨
      }
    ];

    for (const test of tests) {
      console.log(`  🧪 ${test.name}...`);
      
      const req = { headers: test.headers };
      const res = new MockResponse();
      
      setCorsHeaders(req, res);
      
      const hasOriginHeader = res.headers['Access-Control-Allow-Origin'];
      const passed = test.shouldAllow ? !!hasOriginHeader : !hasOriginHeader;
      
      console.log(`    ${passed ? '✅' : '❌'} Origin ${test.shouldAllow ? 'allowed' : 'blocked'}`);
      console.log(`    📝 CORS Origin: ${res.headers['Access-Control-Allow-Origin'] || 'Not set'}`);
    }

    // 보안 헤더 확인
    console.log('  🧪 Security Headers...');
    const req = { headers: { origin: 'https://doha.kr' } };
    const res = new MockResponse();
    setCorsHeaders(req, res);

    const securityHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security'
    ];

    securityHeaders.forEach(header => {
      const present = !!res.headers[header];
      console.log(`    ${present ? '✅' : '❌'} ${header}: ${res.headers[header] || 'Not set'}`);
    });

  } catch (error) {
    console.log(`  ❌ 모듈 로드 실패: ${error.message}`);
  }
}

// 메인 실행
async function runTests() {
  try {
    await testValidation();
    await testCORS();
    await testFortuneAPI();
    await testManseryeokAPI();
    
    console.log('\n✅ 로컬 API 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  }
}

runTests().catch(console.error);