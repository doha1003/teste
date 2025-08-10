// Fortune Simple API 테스트
import https from 'https';

function testFortuneSimple() {
    return new Promise((resolve, reject) => {
        console.log('\n=== Fortune Simple API 디버깅 테스트 ===');
        
        const postData = JSON.stringify({
            type: 'daily',
            userData: {
                name: '테스트',
                birthDate: '1990-01-01'
            }
        });
        
        const options = {
            hostname: 'doha-kr-ap.vercel.app',
            port: 443,
            path: '/api/fortune-simple',
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
                try {
                    const json = JSON.parse(data);
                    console.log('\n디버깅 정보:');
                    console.log('- API 키 존재:', json.environment?.hasApiKey ? '✅' : '❌');
                    console.log('- API 키 길이:', json.environment?.apiKeyLength || 0);
                    console.log('- Node 버전:', json.environment?.nodeVersion);
                    
                    if (json.geminiTest) {
                        console.log('\nGemini API 테스트:');
                        console.log('- 성공:', json.geminiTest.success ? '✅' : '❌');
                        if (json.geminiTest.error) {
                            console.log('- 오류:', json.geminiTest.error);
                        }
                        if (json.geminiTest.response) {
                            console.log('- 응답:', json.geminiTest.response);
                        }
                    }
                    
                    console.log('\n전체 응답:');
                    console.log(JSON.stringify(json, null, 2));
                } catch (e) {
                    console.log('Response:', data);
                }
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

// 테스트 실행
testFortuneSimple().then(() => {
    console.log('\n테스트 완료!');
}).catch(err => {
    console.error('테스트 실패:', err);
});