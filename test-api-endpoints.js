/**
 * API 엔드포인트 실제 테스트 스크립트
 * 수정된 API들의 동작을 검증합니다.
 */

const baseURL = 'http://localhost:3001/api';

// API 테스트 헬퍼 함수
async function testEndpoint(endpoint, method = 'GET', data = null, headers = {}) {
    const url = `${baseURL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };
    
    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }
    
    console.log(`\n🧪 Testing ${method} ${endpoint}`);
    console.log('Request data:', data);
    
    try {
        const response = await fetch(url, options);
        const responseText = await response.text();
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        
        // JSON 파싱 시도
        try {
            const jsonData = JSON.parse(responseText);
            console.log('Response:', JSON.stringify(jsonData, null, 2));
            return { status: response.status, data: jsonData, headers: response.headers };
        } catch {
            console.log('Response (text):', responseText);
            return { status: response.status, data: responseText, headers: response.headers };
        }
    } catch (error) {
        console.error('❌ Request failed:', error.message);
        return { error: error.message };
    }
}

// 1. Health Check API 테스트
async function testHealthCheck() {
    console.log('\n=== 1. Health Check API 테스트 ===');
    return await testEndpoint('/health');
}

// 2. Fortune API 테스트
async function testFortuneAPI() {
    console.log('\n=== 2. Fortune API 테스트 ===');
    
    const testCases = [
        {
            name: 'Daily Fortune',
            data: {
                type: 'daily',
                userData: {
                    name: '김철수',
                    birth: { year: 1990, month: 5, day: 15 },
                    gender: 'male'
                }
            }
        },
        {
            name: 'Saju Fortune',
            data: {
                type: 'saju',
                userData: {
                    name: '이영희',
                    birth: { year: 1985, month: 12, day: 3 },
                    gender: 'female',
                    time: { hour: 14, minute: 30 }
                }
            }
        },
        {
            name: 'Zodiac Fortune',
            data: {
                type: 'zodiac',
                userData: {
                    name: '박민수',
                    birth: { year: 1995, month: 8, day: 22 },
                    zodiacSign: 'virgo'
                }
            }
        },
        {
            name: 'Tarot Fortune',
            data: {
                type: 'tarot',
                userData: {
                    name: '최지영',
                    question: '올해 연애운은 어떨까요?',
                    cards: ['fool', 'lovers', 'star']
                }
            }
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n--- ${testCase.name} ---`);
        await testEndpoint('/fortune', 'POST', testCase.data);
        
        // Rate limiting 테스트를 위한 짧은 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Invalid request 테스트
    console.log('\n--- Invalid Request Test ---');
    await testEndpoint('/fortune', 'POST', { invalid: 'data' });
}

// 3. Manseryeok API 테스트
async function testManseryeokAPI() {
    console.log('\n=== 3. Manseryeok API 테스트 ===');
    
    const testCases = [
        {
            name: '양력 → 음력 변환',
            data: {
                type: 'solar_to_lunar',
                year: 2024,
                month: 8,
                day: 10
            }
        },
        {
            name: '음력 → 양력 변환',
            data: {
                type: 'lunar_to_solar',
                year: 2024,
                month: 7,
                day: 7,
                isLeapMonth: false
            }
        },
        {
            name: '60갑자 계산',
            data: {
                type: 'gapja',
                year: 2024,
                month: 8,
                day: 10,
                hour: 14
            }
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n--- ${testCase.name} ---`);
        await testEndpoint('/manseryeok', 'POST', testCase.data);
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// 4. CSP Report API 테스트
async function testCSPReport() {
    console.log('\n=== 4. CSP Report API 테스트 ===');
    
    const mockCSPReport = {
        'csp-report': {
            'document-uri': 'https://doha.kr/tests/mbti',
            'referrer': '',
            'violated-directive': 'script-src',
            'effective-directive': 'script-src',
            'original-policy': 'default-src \'self\'',
            'disposition': 'enforce',
            'blocked-uri': 'eval',
            'status-code': 200,
            'script-sample': ''
        }
    };
    
    return await testEndpoint('/csp-report', 'POST', mockCSPReport);
}

// 5. Rate Limiting 테스트
async function testRateLimiting() {
    console.log('\n=== 5. Rate Limiting 테스트 ===');
    
    const testData = {
        type: 'daily',
        userData: {
            name: '테스트',
            birth: { year: 1990, month: 1, day: 1 },
            gender: 'male'
        }
    };
    
    // 빠른 연속 요청으로 rate limiting 테스트
    console.log('빠른 연속 요청으로 rate limiting 테스트...');
    
    for (let i = 1; i <= 5; i++) {
        console.log(`\n--- Request ${i} ---`);
        await testEndpoint('/fortune', 'POST', testData);
        
        // 매우 짧은 간격으로 요청
        if (i < 5) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}

// 6. CORS 테스트
async function testCORS() {
    console.log('\n=== 6. CORS 테스트 ===');
    
    // OPTIONS preflight 요청 테스트
    console.log('\n--- OPTIONS Preflight Request ---');
    await testEndpoint('/fortune', 'OPTIONS', null, {
        'Origin': 'https://doha.kr',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
    });
    
    // 다른 origin에서 요청 테스트
    console.log('\n--- Cross-Origin Request ---');
    await testEndpoint('/fortune', 'POST', {
        type: 'daily',
        userData: { name: 'test', birth: { year: 2000, month: 1, day: 1 }, gender: 'male' }
    }, {
        'Origin': 'https://example.com'
    });
}

// 메인 테스트 실행
async function runAllTests() {
    console.log('🚀 doha.kr API 엔드포인트 테스트 시작\n');
    console.log('Base URL:', baseURL);
    
    try {
        await testHealthCheck();
        await testFortuneAPI();
        await testManseryeokAPI();
        await testCSPReport();
        await testRateLimiting();
        await testCORS();
        
        console.log('\n✅ 모든 API 테스트 완료!');
        
    } catch (error) {
        console.error('\n❌ 테스트 중 오류 발생:', error);
    }
}

// 실행
if (typeof window === 'undefined') {
    // Node.js 환경에서 실행 (fetch는 Node 18+에서 기본 제공)
    runAllTests();
} else {
    // 브라우저 환경에서 실행
    window.runAPITests = runAllTests;
    console.log('브라우저 콘솔에서 window.runAPITests() 를 실행하세요.');
}