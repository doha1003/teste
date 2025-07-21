const https = require('https');
const fs = require('fs');

// 페이지 목록을 카테고리별로 정리
const PAGES = {
    main: ['/'],
    fortune: [
        '/fortune/saju/',
        '/fortune/daily/',
        '/fortune/tarot/',
        '/fortune/zodiac/',
        '/fortune/zodiac-animal/'
    ],
    tests: [
        '/tests/mbti/',
        '/tests/teto-egen/',
        '/tests/love-dna/',
        '/tests/leadership/',
        '/tests/personality/'
    ],
    tools: [
        '/tools/text-counter.html',
        '/tools/bmi-calculator.html',
        '/tools/salary-calculator.html',
        '/tools/qr-generator.html',
        '/tools/color-picker.html'
    ],
    etc: [
        '/about/',
        '/contact/',
        '/privacy/',
        '/terms/'
    ]
};

// HTML 내용을 가져와서 CSS/JS 링크 확인
function fetchPageContent(path) {
    return new Promise((resolve) => {
        const url = `https://doha.kr${path}`;
        
        const req = https.request(url, { method: 'GET', timeout: 15000 }, (res) => {
            let data = '';
            
            res.on('data', chunk => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    path,
                    status: res.statusCode,
                    content: data,
                    headers: res.headers,
                    success: res.statusCode >= 200 && res.statusCode < 400
                });
            });
        });
        
        req.on('error', (error) => {
            resolve({
                path,
                status: 'ERROR',
                error: error.message,
                success: false
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve({
                path,
                status: 'TIMEOUT',
                error: 'Request timeout',
                success: false
            });
        });
        
        req.end();
    });
}

// HTML에서 CSS/JS 링크 추출
function analyzePageContent(content) {
    if (!content) return { css: [], js: [], errors: ['No content'] };
    
    const cssLinks = [];
    const jsLinks = [];
    const errors = [];
    
    // CSS 링크 찾기
    const cssRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi;
    let match;
    while ((match = cssRegex.exec(content)) !== null) {
        cssLinks.push(match[1]);
    }
    
    // JS 스크립트 찾기
    const jsRegex = /<script[^>]*src=["']([^"']+)["']/gi;
    while ((match = jsRegex.exec(content)) !== null) {
        jsLinks.push(match[1]);
    }
    
    // 기본 요소들 확인
    if (!content.includes('<nav') && !content.includes('navbar')) {
        errors.push('네비게이션 바를 찾을 수 없음');
    }
    
    if (!content.includes('<footer')) {
        errors.push('푸터를 찾을 수 없음');
    }
    
    // 메타 태그 확인
    if (!content.includes('<meta name="viewport"')) {
        errors.push('모바일 viewport 메타태그 누락');
    }
    
    return { css: cssLinks, js: jsLinks, errors };
}

async function checkCategory(categoryName, pages) {
    console.log(`\n=== ${categoryName.toUpperCase()} 페이지 검증 ===`);
    
    const results = [];
    
    for (const path of pages) {
        console.log(`확인 중: ${path}`);
        
        const pageResult = await fetchPageContent(path);
        
        if (pageResult.success) {
            const analysis = analyzePageContent(pageResult.content);
            pageResult.analysis = analysis;
            
            console.log(`  ✅ ${path} - ${pageResult.status}`);
            console.log(`     CSS: ${analysis.css.length}개, JS: ${analysis.js.length}개`);
            
            if (analysis.errors.length > 0) {
                console.log(`     ⚠️  경고: ${analysis.errors.join(', ')}`);
            }
        } else {
            console.log(`  ❌ ${path} - ${pageResult.status || pageResult.error}`);
        }
        
        results.push(pageResult);
        
        // 요청 간 짧은 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
}

async function generateReport(allResults) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total: 0,
            success: 0,
            failed: 0,
            warnings: 0
        },
        categories: {},
        commonIssues: [],
        recommendations: []
    };
    
    for (const [category, results] of Object.entries(allResults)) {
        const categoryStats = {
            total: results.length,
            success: 0,
            failed: 0,
            pages: []
        };
        
        for (const result of results) {
            report.summary.total++;
            
            if (result.success) {
                report.summary.success++;
                categoryStats.success++;
                
                if (result.analysis && result.analysis.errors.length > 0) {
                    report.summary.warnings++;
                }
            } else {
                report.summary.failed++;
                categoryStats.failed++;
            }
            
            categoryStats.pages.push({
                path: result.path,
                status: result.status,
                success: result.success,
                cssCount: result.analysis ? result.analysis.css.length : 0,
                jsCount: result.analysis ? result.analysis.js.length : 0,
                issues: result.analysis ? result.analysis.errors : [result.error]
            });
        }
        
        report.categories[category] = categoryStats;
    }
    
    // 공통 문제점 분석
    const allIssues = [];
    for (const categoryResults of Object.values(allResults)) {
        for (const result of categoryResults) {
            if (result.analysis && result.analysis.errors.length > 0) {
                allIssues.push(...result.analysis.errors);
            }
        }
    }
    
    // 가장 빈번한 문제점들
    const issueCounts = {};
    allIssues.forEach(issue => {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
    });
    
    report.commonIssues = Object.entries(issueCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([issue, count]) => ({ issue, count }));
    
    // 권장사항
    if (report.summary.failed > 0) {
        report.recommendations.push('실패한 페이지들의 URL과 라우팅을 확인하세요.');
    }
    
    if (report.commonIssues.length > 0) {
        report.recommendations.push('공통 문제점들을 우선적으로 해결하세요.');
    }
    
    const successRate = (report.summary.success / report.summary.total * 100).toFixed(1);
    if (successRate < 90) {
        report.recommendations.push('전체 성공률이 90% 미만입니다. 전반적인 점검이 필요합니다.');
    }
    
    return report;
}

async function main() {
    console.log('doha.kr 전체 사이트 검증 시작...');
    
    const allResults = {};
    
    // 카테고리별로 검증
    for (const [category, pages] of Object.entries(PAGES)) {
        allResults[category] = await checkCategory(category, pages);
    }
    
    // 보고서 생성
    const report = await generateReport(allResults);
    
    // 결과 출력
    console.log('\n=== 전체 검증 결과 ===');
    console.log(`총 페이지: ${report.summary.total}`);
    console.log(`성공: ${report.summary.success}`);
    console.log(`실패: ${report.summary.failed}`);
    console.log(`경고: ${report.summary.warnings}`);
    console.log(`성공률: ${(report.summary.success / report.summary.total * 100).toFixed(1)}%`);
    
    console.log('\n=== 카테고리별 결과 ===');
    for (const [category, stats] of Object.entries(report.categories)) {
        console.log(`${category}: ${stats.success}/${stats.total} 성공`);
    }
    
    if (report.commonIssues.length > 0) {
        console.log('\n=== 공통 문제점 ===');
        report.commonIssues.forEach(({ issue, count }) => {
            console.log(`  - ${issue} (${count}회)`);
        });
    }
    
    if (report.recommendations.length > 0) {
        console.log('\n=== 권장사항 ===');
        report.recommendations.forEach(rec => {
            console.log(`  - ${rec}`);
        });
    }
    
    // 보고서 파일로 저장
    fs.writeFileSync('site-validation-report.json', JSON.stringify(report, null, 2));
    console.log('\n📊 상세 보고서가 site-validation-report.json에 저장되었습니다.');
    
    return report;
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, checkCategory, analyzePageContent };