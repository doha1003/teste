const https = require('https');
const http = require('http');
const fs = require('fs');

// doha.kr API 엔드포인트 검증 스크립트
class APIEndpointValidator {
    constructor() {
        this.report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalEndpoints: 0,
                availableEndpoints: 0,
                unavailableEndpoints: 0,
                averageResponseTime: 0
            },
            endpoints: {},
            recommendations: []
        };
    }

    async makeRequest(url, method = 'GET', postData = null) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: method,
                timeout: 10000,
                headers: {
                    'User-Agent': 'doha.kr-qa-validator/1.0',
                    'Accept': 'application/json, text/html, */*'
                }
            };

            if (postData) {
                options.headers['Content-Type'] = 'application/json';
                options.headers['Content-Length'] = Buffer.byteLength(postData);
            }

            const client = isHttps ? https : http;
            
            const req = client.request(options, (res) => {
                let responseBody = '';
                
                res.on('data', (chunk) => {
                    responseBody += chunk;
                });

                res.on('end', () => {
                    const endTime = Date.now();
                    resolve({
                        success: true,
                        statusCode: res.statusCode,
                        statusMessage: res.statusMessage,
                        responseTime: endTime - startTime,
                        headers: res.headers,
                        body: responseBody.substring(0, 1000), // 응답 본문 일부만
                        bodyLength: responseBody.length
                    });
                });
            });

            req.on('error', (error) => {
                const endTime = Date.now();
                resolve({
                    success: false,
                    error: error.message,
                    responseTime: endTime - startTime,
                    statusCode: 0
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    success: false,
                    error: 'Request timeout (10s)',
                    responseTime: 10000,
                    statusCode: 0
                });
            });

            if (postData) {
                req.write(postData);
            }

            req.end();
        });
    }

    async testVercelEndpoints() {
        console.log('🌐 Vercel API 엔드포인트 테스트...\n');

        const vercelEndpoints = [
            {
                name: 'Fortune API Health Check',
                url: 'https://doha.kr/api/health',
                method: 'GET',
                expectedStatus: [200, 404] // 404도 허용 (엔드포인트가 없을 수 있음)
            },
            {
                name: 'Fortune API - Daily Fortune',
                url: 'https://doha.kr/api/fortune',
                method: 'POST',
                data: JSON.stringify({
                    type: 'daily',
                    userData: {
                        birth: '1990-01-01',
                        gender: 'male',
                        name: '테스트'
                    }
                }),
                expectedStatus: [200, 400, 429] // 400: 잘못된 요청, 429: Rate limit
            },
            {
                name: 'Manseryeok API - Date Conversion',
                url: 'https://doha.kr/api/manseryeok',
                method: 'POST',
                data: JSON.stringify({
                    year: 2024,
                    month: 1,
                    day: 1
                }),
                expectedStatus: [200, 400, 404]
            }
        ];

        for (const endpoint of vercelEndpoints) {
            console.log(`🔍 테스트: ${endpoint.name}`);
            
            const result = await this.makeRequest(
                endpoint.url, 
                endpoint.method, 
                endpoint.data
            );

            const endpointReport = {
                name: endpoint.name,
                url: endpoint.url,
                method: endpoint.method,
                success: result.success,
                statusCode: result.statusCode,
                responseTime: result.responseTime,
                expected: endpoint.expectedStatus,
                isHealthy: result.success && endpoint.expectedStatus.includes(result.statusCode),
                details: result
            };

            this.report.endpoints[endpoint.name] = endpointReport;
            this.report.summary.totalEndpoints++;

            if (endpointReport.isHealthy) {
                this.report.summary.availableEndpoints++;
                console.log(`   ✅ 정상 (${result.statusCode}, ${result.responseTime}ms)`);
            } else {
                this.report.summary.unavailableEndpoints++;
                console.log(`   ❌ 이상 (${result.statusCode || 'TIMEOUT'}, ${result.responseTime}ms)`);
                console.log(`      오류: ${result.error || result.statusMessage}`);
            }

            // API 호출 간 지연 (Rate Limit 방지)
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    async testLocalEndpoints() {
        console.log('\n🏠 로컬 서버 엔드포인트 테스트...\n');

        const localEndpoints = [
            {
                name: 'Local Server Root',
                url: 'http://localhost:3000/',
                method: 'GET',
                expectedStatus: [200]
            },
            {
                name: 'Local PWA Manifest',
                url: 'http://localhost:3000/manifest.json',
                method: 'GET',
                expectedStatus: [200]
            },
            {
                name: 'Local Service Worker',
                url: 'http://localhost:3000/sw.js',
                method: 'GET',
                expectedStatus: [200]
            },
            {
                name: 'Local CSS Bundle',
                url: 'http://localhost:3000/dist/styles.css',
                method: 'GET',
                expectedStatus: [200]
            },
            {
                name: 'Local Font File',
                url: 'http://localhost:3000/fonts/PretendardVariable.woff2',
                method: 'GET',
                expectedStatus: [200, 404] // 폰트 파일이 없을 수 있음
            }
        ];

        for (const endpoint of localEndpoints) {
            console.log(`🔍 테스트: ${endpoint.name}`);
            
            const result = await this.makeRequest(endpoint.url, endpoint.method);

            const endpointReport = {
                name: endpoint.name,
                url: endpoint.url,
                method: endpoint.method,
                success: result.success,
                statusCode: result.statusCode,
                responseTime: result.responseTime,
                expected: endpoint.expectedStatus,
                isHealthy: result.success && endpoint.expectedStatus.includes(result.statusCode),
                details: result
            };

            this.report.endpoints[endpoint.name] = endpointReport;
            this.report.summary.totalEndpoints++;

            if (endpointReport.isHealthy) {
                this.report.summary.availableEndpoints++;
                console.log(`   ✅ 정상 (${result.statusCode}, ${result.responseTime}ms)`);
            } else {
                this.report.summary.unavailableEndpoints++;
                console.log(`   ❌ 이상 (${result.statusCode || 'TIMEOUT'}, ${result.responseTime}ms)`);
                console.log(`      오류: ${result.error || result.statusMessage}`);
            }

            // 요청 간 지연
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    async generateRecommendations() {
        const { summary, endpoints } = this.report;

        // 평균 응답시간 계산
        const responseTimes = Object.values(endpoints)
            .filter(ep => ep.success)
            .map(ep => ep.responseTime);
        
        summary.averageResponseTime = responseTimes.length > 0 
            ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
            : 0;

        // 권장사항 생성
        if (summary.unavailableEndpoints > 0) {
            this.report.recommendations.push({
                priority: 'high',
                category: 'availability',
                message: `${summary.unavailableEndpoints}개 엔드포인트가 비정상 상태입니다.`,
                details: Object.values(endpoints)
                    .filter(ep => !ep.isHealthy)
                    .map(ep => `${ep.name}: ${ep.details.error || ep.statusCode}`)
            });
        }

        if (summary.averageResponseTime > 2000) {
            this.report.recommendations.push({
                priority: 'medium',
                category: 'performance',
                message: `평균 응답시간이 ${summary.averageResponseTime}ms로 느립니다. 2초 이하 목표.`
            });
        }

        // API별 특별 권장사항
        const fortuneAPI = endpoints['Fortune API - Daily Fortune'];
        if (fortuneAPI && !fortuneAPI.isHealthy) {
            this.report.recommendations.push({
                priority: 'high',
                category: 'business-critical',
                message: '운세 API가 작동하지 않습니다. 핵심 기능 영향.'
            });
        }

        const manseryeokAPI = endpoints['Manseryeok API - Date Conversion'];
        if (manseryeokAPI && !manseryeokAPI.isHealthy) {
            this.report.recommendations.push({
                priority: 'medium',
                category: 'business-critical',
                message: '만세력 API가 작동하지 않습니다. 사주 기능 영향.'
            });
        }

        // 성공률 계산
        const successRate = ((summary.availableEndpoints / summary.totalEndpoints) * 100).toFixed(1);
        summary.successRate = successRate;

        if (parseFloat(successRate) < 90) {
            this.report.recommendations.push({
                priority: 'high',
                category: 'overall',
                message: `API 성공률 ${successRate}%. 90% 이상 목표로 개선 필요.`
            });
        }
    }

    async runValidation() {
        console.log('🔧 doha.kr API 엔드포인트 검증 시작...\n');

        try {
            // Vercel 배포 API 테스트
            await this.testVercelEndpoints();

            // 로컬 서버 테스트
            await this.testLocalEndpoints();

            // 권장사항 생성
            await this.generateRecommendations();

            return this.report;

        } catch (error) {
            console.error('API 검증 중 오류:', error);
            this.report.error = error.message;
            return this.report;
        }
    }
}

const main = async () => {
    try {
        const validator = new APIEndpointValidator();
        const report = await validator.runValidation();

        console.log('\n' + '='.repeat(50));
        console.log('🎯 API 엔드포인트 검증 결과');
        console.log('='.repeat(50));
        
        console.log(`📊 테스트 완료: ${report.summary.totalEndpoints}개 엔드포인트`);
        console.log(`✅ 정상: ${report.summary.availableEndpoints}개`);
        console.log(`❌ 이상: ${report.summary.unavailableEndpoints}개`);
        console.log(`🎯 성공률: ${report.summary.successRate}%`);
        console.log(`⏱️  평균 응답시간: ${report.summary.averageResponseTime}ms`);

        console.log('\n💡 권장사항:');
        if (report.recommendations.length === 0) {
            console.log('   모든 API 엔드포인트가 정상 작동 중입니다. ✅');
        } else {
            report.recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
                if (rec.details) {
                    rec.details.forEach(detail => {
                        console.log(`      - ${detail}`);
                    });
                }
            });
        }

        // 리포트 저장
        const reportFile = `api-endpoint-validation-${Date.now()}.json`;
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
        console.log(`\n📋 상세 리포트: ${reportFile}`);

        return report;

    } catch (error) {
        console.error('API 검증 실패:', error);
        return null;
    }
};

if (require.main === module) {
    main().then(() => {
        console.log('\n✨ API 검증 완료!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ API 검증 실패:', error);
        process.exit(1);
    });
}

module.exports = { APIEndpointValidator, main };