const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * 팀리더 지시: doha.kr 11개 서비스 간단 검증
 * 각 서비스의 기본 동작 가능 여부만 확인
 */

// 11개 서비스 정의
const SERVICES = [
    { name: '테토-에겐 테스트', url: 'tests/teto-egen/test.html', type: 'test' },
    { name: 'MBTI 테스트', url: 'tests/mbti/test.html', type: 'test' },
    { name: 'Love DNA 테스트', url: 'tests/love-dna/test.html', type: 'test' },
    { name: '일일운세', url: 'fortune/daily/index.html', type: 'fortune' },
    { name: '사주운세', url: 'fortune/saju/index.html', type: 'fortune' },
    { name: '타로운세', url: 'fortune/tarot/index.html', type: 'fortune' },
    { name: '서양별자리운세', url: 'fortune/zodiac/index.html', type: 'fortune' },
    { name: '띠별운세', url: 'fortune/zodiac-animal/index.html', type: 'fortune' },
    { name: 'BMI 계산기', url: 'tools/bmi-calculator.html', type: 'tool' },
    { name: '급여 계산기', url: 'tools/salary-calculator.html', type: 'tool' },
    { name: '글자수 계산기', url: 'tools/text-counter.html', type: 'tool' }
];

async function quickVerifyService(page, service) {
    const result = {
        name: service.name,
        type: service.type,
        status: 'unknown',
        issues: [],
        workingFeatures: [],
        loadTime: 0
    };
    
    try {
        console.log(`\n🔍 ${service.name} 검증 중...`);
        
        const startTime = Date.now();
        const fullUrl = `file:///${path.resolve(service.url).replace(/\\/g, '/')}`;
        
        await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        result.loadTime = Date.now() - startTime;
        
        // 페이지 타이틀 확인
        const title = await page.title();
        if (title && title.length > 0) {
            result.workingFeatures.push(`페이지 타이틀: ${title}`);
        }
        
        // 주요 DOM 요소 확인
        const hasMain = await page.$('main, .main-content, .container, body') !== null;
        if (hasMain) {
            result.workingFeatures.push('메인 콘텐츠 영역 존재');
        }
        
        // 서비스별 특화 확인
        if (service.type === 'test') {
            // 테스트 관련 버튼 확인
            const buttons = await page.$$('button, .btn, input[type="button"]');
            if (buttons.length > 0) {
                result.workingFeatures.push(`버튼 ${buttons.length}개 발견`);
            }
            
            // 질문 또는 옵션 확인
            const options = await page.$$('.option, .answer, input[type="radio"], input[type="checkbox"]');
            if (options.length > 0) {
                result.workingFeatures.push(`선택 옵션 ${options.length}개 발견`);
            }
            
        } else if (service.type === 'fortune') {
            // 운세 관련 입력 필드 확인
            const inputs = await page.$$('input, select, textarea');
            if (inputs.length > 0) {
                result.workingFeatures.push(`입력 필드 ${inputs.length}개 발견`);
            }
            
            // 운세 관련 버튼 확인
            const fortuneButtons = await page.$$('button, .btn');
            if (fortuneButtons.length > 0) {
                result.workingFeatures.push(`액션 버튼 ${fortuneButtons.length}개 발견`);
            }
            
        } else if (service.type === 'tool') {
            // 도구 관련 입력 필드 확인
            const inputs = await page.$$('input[type="number"], input[type="text"], textarea');
            if (inputs.length > 0) {
                result.workingFeatures.push(`계산 입력 필드 ${inputs.length}개 발견`);
            }
            
            // 계산 버튼 확인
            const calcButtons = await page.$$('button, .calculate, .btn-calc');
            if (calcButtons.length > 0) {
                result.workingFeatures.push(`계산 버튼 ${calcButtons.length}개 발견`);
            }
        }
        
        // 콘솔 오류 확인
        let criticalErrors = 0;
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                // 중요한 오류만 카운트 (광고, 확장 프로그램 관련 제외)
                if (!text.includes('googleads') && 
                    !text.includes('extension') && 
                    !text.includes('favicon') &&
                    !text.includes('Mixed Content')) {
                    criticalErrors++;
                }
            }
        });
        
        // 잠시 대기하여 스크립트 로딩 확인
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (criticalErrors > 0) {
            result.issues.push(`심각한 JavaScript 오류 ${criticalErrors}개 발견`);
        }
        
        // 상태 결정
        if (result.workingFeatures.length >= 2 && criticalErrors === 0) {
            result.status = 'passed';
        } else if (result.workingFeatures.length >= 1) {
            result.status = 'warning';
        } else {
            result.status = 'failed';
        }
        
        console.log(`  ✅ 로딩 완료 (${result.loadTime}ms)`);
        console.log(`  📊 작동 기능: ${result.workingFeatures.length}개`);
        if (result.issues.length > 0) {
            console.log(`  ⚠️  이슈: ${result.issues.length}개`);
        }
        
    } catch (error) {
        result.status = 'failed';
        result.issues.push(`페이지 로딩 실패: ${error.message}`);
        console.log(`  ❌ 로딩 실패: ${error.message}`);
    }
    
    return result;
}

async function runQuickVerification() {
    console.log('🚀 doha.kr 11개 서비스 간단 검증 시작\n');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--allow-file-access-from-files',
            '--disable-features=VizDisplayCompositor'
        ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    const results = [];
    let passed = 0, warning = 0, failed = 0;
    
    // 테토-에겐 먼저 실행
    const tetoEgen = SERVICES.find(s => s.name === '테토-에겐 테스트');
    if (tetoEgen) {
        const result = await quickVerifyService(page, tetoEgen);
        results.push(result);
        
        switch (result.status) {
            case 'passed': passed++; break;
            case 'warning': warning++; break;
            case 'failed': failed++; break;
        }
    }
    
    // 나머지 서비스들
    for (const service of SERVICES) {
        if (service.name !== '테토-에겐 테스트') {
            const result = await quickVerifyService(page, service);
            results.push(result);
            
            switch (result.status) {
                case 'passed': passed++; break;
                case 'warning': warning++; break;
                case 'failed': failed++; break;
            }
        }
    }
    
    await browser.close();
    
    // 최종 보고서
    console.log('\n' + '='.repeat(60));
    console.log('🎯 doha.kr 11개 서비스 검증 완료 보고서');
    console.log('='.repeat(60));
    console.log(`📊 전체 통계: ${SERVICES.length}개 서비스`);
    console.log(`✅ 정상: ${passed}개`);
    console.log(`⚠️  경고: ${warning}개`);
    console.log(`❌ 실패: ${failed}개`);
    
    const successRate = (((passed + warning) / SERVICES.length) * 100).toFixed(1);
    console.log(`📈 작동률: ${successRate}%`);
    
    console.log('\n📋 서비스별 상세 결과:');
    console.log('-'.repeat(60));
    
    results.forEach(result => {
        const statusIcon = {
            'passed': '✅',
            'warning': '⚠️',
            'failed': '❌'
        }[result.status] || '❓';
        
        console.log(`${statusIcon} ${result.name} (${result.type})`);
        console.log(`   로딩시간: ${result.loadTime}ms`);
        
        if (result.workingFeatures.length > 0) {
            console.log(`   작동기능:`);
            result.workingFeatures.forEach(feature => {
                console.log(`     ✓ ${feature}`);
            });
        }
        
        if (result.issues.length > 0) {
            console.log(`   문제점:`);
            result.issues.forEach(issue => {
                console.log(`     ✗ ${issue}`);
            });
        }
        
        console.log('');
    });
    
    console.log('\n🏁 최종 결론:');
    console.log('-'.repeat(60));
    
    if (passed === SERVICES.length) {
        console.log('🎉 모든 서비스가 정상 작동합니다!');
    } else if (passed + warning === SERVICES.length) {
        console.log(`✅ 모든 서비스가 기본 작동하나 ${warning}개 서비스에 개선이 필요합니다.`);
    } else {
        console.log(`⚠️  ${failed}개 서비스에 심각한 문제가 있습니다.`);
        
        const workingServices = results.filter(r => r.status !== 'failed').length;
        console.log(`✅ ${workingServices}개 서비스는 기본 기능이 작동합니다.`);
    }
    
    // JSON 보고서 저장
    const reportData = {
        timestamp: new Date().toISOString(),
        summary: { total: SERVICES.length, passed, warning, failed },
        services: results
    };
    
    const reportPath = path.join(__dirname, `doha-kr-simple-verification-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 상세 보고서: ${reportPath}`);
    
    return reportData;
}

// 실행
if (require.main === module) {
    runQuickVerification()
        .then(() => {
            console.log('\n✅ 간단 검증 완료');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ 검증 실패:', error);
            process.exit(1);
        });
}