// API 직접 테스트 스크립트 (ES Module)
import https from 'https';

// 1. Health API 테스트
function testHealthAPI() {
    return new Promise((resolve, reject) => {
        console.log('\n=== Health API 테스트 ===');
        
        https.get('https://doha-kr-ap.vercel.app/api/health', (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${data}`);
                resolve({ status: res.statusCode, data });
            });
        }).on('error', (err) => {
            console.error('Error:', err.message);
            reject(err);
        });
    });
}

// 2. Fortune API 테스트
function testFortuneAPI() {
    return new Promise((resolve, reject) => {
        console.log('\n=== Fortune API 테스트 ===');
        
        const postData = JSON.stringify({
            type: 'daily',
            userData: {
                name: '테스트',
                birthDate: '1990-01-01',
                gender: '남'
            }
        });
        
        const options = {
            hostname: 'doha-kr-ap.vercel.app',
            port: 443,
            path: '/api/fortune',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${data.substring(0, 500)}...`);
                resolve({ status: res.statusCode, data });
            });
        });
        
        req.on('error', (err) => {
            console.error('Error:', err.message);
            reject(err);
        });
        
        req.write(postData);
        req.end();
    });
}

// 3. Manseryeok API 테스트
function testManseryeokAPI() {
    return new Promise((resolve, reject) => {
        console.log('\n=== Manseryeok API 테스트 ===');
        
        const postData = JSON.stringify({
            action: 'getManseryeok',
            year: 2025,
            month: 1,
            day: 10
        });
        
        const options = {
            hostname: 'doha-kr-ap.vercel.app',
            port: 443,
            path: '/api/manseryeok',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${data.substring(0, 500)}...`);
                resolve({ status: res.statusCode, data });
            });
        });
        
        req.on('error', (err) => {
            console.error('Error:', err.message);
            reject(err);
        });
        
        req.write(postData);
        req.end();
    });
}

// 모든 테스트 실행
async function runAllTests() {
    console.log('🔍 Vercel API 테스트 시작 (doha-kr-ap.vercel.app)');
    console.log('=' .repeat(50));
    
    try {
        // Health API 테스트
        const healthResult = await testHealthAPI();
        
        // Fortune API 테스트
        const fortuneResult = await testFortuneAPI();
        
        // Manseryeok API 테스트
        const manseryeokResult = await testManseryeokAPI();
        
        // 결과 요약
        console.log('\n' + '=' .repeat(50));
        console.log('📊 테스트 결과 요약:');
        console.log(`- Health API: ${healthResult.status === 200 ? '✅ 성공' : `❌ 실패 (${healthResult.status})`}`);
        console.log(`- Fortune API: ${fortuneResult.status === 200 ? '✅ 성공' : `❌ 실패 (${fortuneResult.status})`}`);
        console.log(`- Manseryeok API: ${manseryeokResult.status === 200 ? '✅ 성공' : `❌ 실패 (${manseryeokResult.status})`}`);
        
        // 문제 진단
        if (fortuneResult.status === 405) {
            console.log('\n⚠️ 405 Method Not Allowed 오류 발견!');
            console.log('가능한 원인:');
            console.log('1. Vercel Functions가 제대로 배포되지 않음');
            console.log('2. vercel.json의 함수 설정 문제');
            console.log('3. API 파일의 export default handler 누락');
        }
        
        if (fortuneResult.status === 500 || fortuneResult.status === 503) {
            console.log('\n⚠️ 서버 오류 발견!');
            console.log('가능한 원인:');
            console.log('1. GEMINI_API_KEY 환경 변수 누락');
            console.log('2. API 파일의 import 오류');
            console.log('3. 서버리스 함수 메모리 부족');
        }
        
    } catch (error) {
        console.error('테스트 중 오류 발생:', error);
    }
}

// 테스트 실행
runAllTests();