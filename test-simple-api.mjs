// 간단한 test API 확인
import https from 'https';

function testAPI(path) {
    return new Promise((resolve, reject) => {
        console.log(`\n=== ${path} API 테스트 ===`);
        
        https.get(`https://doha-kr-ap.vercel.app${path}`, (res) => {
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

// 테스트 실행
async function runTests() {
    try {
        await testAPI('/api/test');
        await testAPI('/api/health');
    } catch (error) {
        console.error('테스트 실패:', error);
    }
}

runTests();