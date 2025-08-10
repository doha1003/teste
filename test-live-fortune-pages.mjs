// 라이브 운세 페이지 빠른 테스트
import https from 'https';

const pages = [
    { name: '일일 운세', url: 'https://doha.kr/fortune/daily/' },
    { name: '사주 운세', url: 'https://doha.kr/fortune/saju/' },
    { name: '타로 운세', url: 'https://doha.kr/fortune/tarot/' },
    { name: '별자리 운세', url: 'https://doha.kr/fortune/zodiac/' },
    { name: '띠별 운세', url: 'https://doha.kr/fortune/zodiac-animal/' }
];

async function testPage(page) {
    return new Promise((resolve) => {
        const url = new URL(page.url);
        
        https.get({
            hostname: url.hostname,
            path: url.pathname,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const hasFortuneService = data.includes('FortuneService') || data.includes('fortune-service');
                const hasAPIConfig = data.includes('api-config') || data.includes('APIManager');
                const hasGeminiAPI = data.includes('gemini-api') || data.includes('FortuneAPI');
                
                console.log(`\n${page.name}:`);
                console.log(`  상태: ${res.statusCode === 200 ? '✅' : '❌'} (${res.statusCode})`);
                console.log(`  FortuneService: ${hasFortuneService ? '✅' : '❌'}`);
                console.log(`  API Config: ${hasAPIConfig ? '✅' : '❌'}`);
                console.log(`  Gemini API: ${hasGeminiAPI ? '✅' : '❌'}`);
                
                resolve();
            });
        }).on('error', (err) => {
            console.log(`\n${page.name}: ❌ 오류 - ${err.message}`);
            resolve();
        });
    });
}

async function testAPI() {
    console.log('\n=== API 테스트 ===');
    
    const postData = JSON.stringify({
        type: 'daily',
        data: {
            name: '테스트',
            birthDate: '1990-01-01'
        }
    });
    
    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'doha-kr-ap.vercel.app',
            path: '/api/fortune',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`  API 상태: ${res.statusCode === 200 ? '✅' : '❌'} (${res.statusCode})`);
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        console.log(`  AI 생성: ${json.aiGenerated ? '✅' : '❌'}`);
                        console.log(`  운세 데이터: ${json.data ? '✅' : '❌'}`);
                    } catch (e) {
                        console.log(`  파싱 오류: ❌`);
                    }
                }
                resolve();
            });
        });
        
        req.on('error', (err) => {
            console.log(`  API 오류: ❌ - ${err.message}`);
            resolve();
        });
        
        req.write(postData);
        req.end();
    });
}

console.log('🔮 doha.kr 운세 페이지 라이브 테스트');
console.log('=' .repeat(50));

async function runTests() {
    console.log('\n📄 페이지 로드 테스트:');
    for (const page of pages) {
        await testPage(page);
    }
    
    await testAPI();
    
    console.log('\n' + '=' .repeat(50));
    console.log('✨ 테스트 완료!');
}

runTests();