// Gemini API 직접 테스트
import https from 'https';

// 실제 운세 요청 테스트
function testFortuneAPI() {
    return new Promise((resolve, reject) => {
        console.log('\n=== Gemini API를 통한 운세 테스트 ===');
        
        const postData = JSON.stringify({
            type: 'daily',
            userData: {
                name: '홍길동',
                birthDate: '1990-01-01',
                gender: '남'
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
                    
                    // Gemini 테스트 결과 확인
                    if (json.geminiTest) {
                        console.log('\n🤖 Gemini API 테스트 결과:');
                        console.log('- 연결 상태:', json.geminiTest.success ? '✅ 성공' : '❌ 실패');
                        
                        if (json.geminiTest.response) {
                            console.log('- AI 응답:', json.geminiTest.response);
                        }
                        
                        if (json.geminiTest.error) {
                            console.log('- 오류:', json.geminiTest.error);
                        }
                    }
                    
                    // 환경 정보
                    if (json.environment) {
                        console.log('\n📋 환경 정보:');
                        console.log('- API 키 설정:', json.environment.hasApiKey ? '✅' : '❌');
                        console.log('- API 키 길이:', json.environment.apiKeyLength);
                    }
                    
                    // 테스트 운세
                    if (json.testResponse) {
                        console.log('\n🔮 테스트 운세:');
                        console.log('- 종합운:', json.testResponse.fortune?.overall);
                        console.log('- 애정운:', json.testResponse.fortune?.love);
                        console.log('- 금전운:', json.testResponse.fortune?.money);
                        console.log('- 건강운:', json.testResponse.fortune?.health);
                    }
                    
                } catch (e) {
                    console.log('파싱 오류:', e.message);
                    console.log('원본 응답:', data.substring(0, 500));
                }
                resolve({ status: res.statusCode, data });
            });
        });
        
        req.on('error', (err) => {
            console.error('요청 오류:', err.message);
            reject(err);
        });
        
        req.write(postData);
        req.end();
    });
}

// 여러 타입의 운세 테스트
async function testMultipleTypes() {
    const types = [
        { type: 'daily', name: '오늘의 운세' },
        { type: 'zodiac', name: '별자리 운세', zodiac: '양자리' },
        { type: 'tarot', name: '타로 운세' },
        { type: 'saju', name: '사주 운세' }
    ];
    
    for (const testType of types) {
        console.log(`\n\n${'='.repeat(50)}`);
        console.log(`테스트: ${testType.name}`);
        console.log('='.repeat(50));
        
        const postData = JSON.stringify({
            type: testType.type,
            userData: {
                name: '테스트',
                birthDate: '1990-05-15',
                gender: '여',
                ...testType
            }
        });
        
        await new Promise((resolve) => {
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
                    try {
                        const json = JSON.parse(data);
                        
                        if (json.geminiTest) {
                            console.log(`${testType.name} Gemini 응답:`, 
                                json.geminiTest.success ? '✅' : '❌',
                                json.geminiTest.response ? json.geminiTest.response.substring(0, 100) : json.geminiTest.error
                            );
                        }
                    } catch (e) {
                        console.log(`${testType.name} 오류:`, e.message);
                    }
                    resolve();
                });
            });
            
            req.on('error', (err) => {
                console.error(`${testType.name} 요청 실패:`, err.message);
                resolve();
            });
            
            req.write(postData);
            req.end();
        });
        
        // 1초 대기 (Rate limiting 방지)
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// 실행
console.log('🚀 Gemini API 테스트 시작\n');
console.log('1. 단일 운세 상세 테스트');

testFortuneAPI().then(() => {
    console.log('\n2. 다양한 운세 타입 테스트');
    return testMultipleTypes();
}).then(() => {
    console.log('\n\n✅ 모든 테스트 완료!');
}).catch(err => {
    console.error('테스트 실패:', err);
});