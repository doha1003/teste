const fs = require('fs');
const path = require('path');

// doha.kr 프로젝트의 모든 HTML 파일에서 CSS/JS 참조를 검증하는 스크립트

const main = async () => {
    console.log('=== doha.kr HTML 참조 검증 시작 ===\n');
    
    const baseDir = __dirname;
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalFiles: 0,
            filesWithIssues: 0,
            totalReferences: 0,
            brokenReferences: 0
        },
        htmlFiles: {},
        missingFiles: new Set(),
        recommendations: []
    };

    // 주요 HTML 파일들 경로
    const htmlFiles = [
        'index.html',
        '404.html',
        'about/index.html',
        'contact/index.html',
        'faq/index.html',
        'privacy/index.html',
        'terms/index.html',
        'offline.html',
        'fortune/index.html',
        'fortune/daily/index.html',
        'fortune/saju/index.html',
        'fortune/tarot/index.html',
        'fortune/zodiac/index.html',
        'fortune/zodiac-animal/index.html',
        'tests/index.html',
        'tests/love-dna/index.html',
        'tests/mbti/index.html',
        'tests/teto-egen/index.html',
        'tests/love-dna/intro.html',
        'tests/mbti/intro.html',
        'tests/teto-egen/intro.html',
        'tools/index.html',
        'tools/bmi-calculator.html',
        'tools/salary-calculator.html',
        'tools/text-counter.html',
        'result-detail.html'
    ];

    const checkFileExists = (filePath) => {
        const fullPath = path.resolve(baseDir, filePath);
        return fs.existsSync(fullPath);
    };

    const extractReferences = (htmlContent) => {
        const cssReferences = [];
        const jsReferences = [];
        const imageReferences = [];
        const iconReferences = [];

        // CSS 참조 추출
        const cssMatches = htmlContent.match(/<link[^>]*href=["'](.*?)["'][^>]*>/gi);
        if (cssMatches) {
            cssMatches.forEach(match => {
                const hrefMatch = match.match(/href=["'](.*?)["']/i);
                if (hrefMatch && hrefMatch[1]) {
                    const href = hrefMatch[1];
                    if (href.endsWith('.css') && !href.startsWith('http')) {
                        cssReferences.push(href);
                    }
                }
            });
        }

        // JS 참조 추출
        const jsMatches = htmlContent.match(/<script[^>]*src=["'](.*?)["'][^>]*>/gi);
        if (jsMatches) {
            jsMatches.forEach(match => {
                const srcMatch = match.match(/src=["'](.*?)["']/i);
                if (srcMatch && srcMatch[1]) {
                    const src = srcMatch[1];
                    if (src.endsWith('.js') && !src.startsWith('http')) {
                        jsReferences.push(src);
                    }
                }
            });
        }

        // 이미지 참조 추출
        const imgMatches = htmlContent.match(/<img[^>]*src=["'](.*?)["'][^>]*>/gi);
        if (imgMatches) {
            imgMatches.forEach(match => {
                const srcMatch = match.match(/src=["'](.*?)["']/i);
                if (srcMatch && srcMatch[1]) {
                    const src = srcMatch[1];
                    if (!src.startsWith('http') && !src.startsWith('data:')) {
                        imageReferences.push(src);
                    }
                }
            });
        }

        // 아이콘 참조 추출
        const iconMatches = htmlContent.match(/<link[^>]*rel=["']icon["'][^>]*>/gi);
        if (iconMatches) {
            iconMatches.forEach(match => {
                const hrefMatch = match.match(/href=["'](.*?)["']/i);
                if (hrefMatch && hrefMatch[1]) {
                    const href = hrefMatch[1];
                    if (!href.startsWith('http')) {
                        iconReferences.push(href);
                    }
                }
            });
        }

        return { cssReferences, jsReferences, imageReferences, iconReferences };
    };

    const validateReferences = (references, baseDir, htmlFilePath) => {
        const issues = [];
        const htmlDir = path.dirname(htmlFilePath);

        for (const ref of references) {
            let actualPath;
            
            if (ref.startsWith('/')) {
                // 절대 경로
                actualPath = path.join(baseDir, ref.substring(1));
            } else {
                // 상대 경로
                actualPath = path.resolve(baseDir, htmlDir, ref);
            }

            if (!fs.existsSync(actualPath)) {
                issues.push({
                    reference: ref,
                    expectedPath: actualPath,
                    type: 'missing'
                });
                report.missingFiles.add(actualPath);
            }
        }

        return issues;
    };

    console.log('HTML 파일 스캔 중...\n');

    for (const htmlFile of htmlFiles) {
        const fullPath = path.resolve(baseDir, htmlFile);
        
        if (!fs.existsSync(fullPath)) {
            console.log(`⚠️  파일 없음: ${htmlFile}`);
            continue;
        }

        const htmlContent = fs.readFileSync(fullPath, 'utf8');
        const references = extractReferences(htmlContent);
        
        const fileReport = {
            path: htmlFile,
            exists: true,
            cssReferences: references.cssReferences,
            jsReferences: references.jsReferences,
            imageReferences: references.imageReferences,
            iconReferences: references.iconReferences,
            issues: []
        };

        // CSS 참조 검증
        const cssIssues = validateReferences(references.cssReferences, baseDir, htmlFile);
        fileReport.issues.push(...cssIssues.map(issue => ({...issue, category: 'css'})));

        // JS 참조 검증
        const jsIssues = validateReferences(references.jsReferences, baseDir, htmlFile);
        fileReport.issues.push(...jsIssues.map(issue => ({...issue, category: 'js'})));

        // 이미지 참조 검증
        const imgIssues = validateReferences(references.imageReferences, baseDir, htmlFile);
        fileReport.issues.push(...imgIssues.map(issue => ({...issue, category: 'image'})));

        // 아이콘 참조 검증
        const iconIssues = validateReferences(references.iconReferences, baseDir, htmlFile);
        fileReport.issues.push(...iconIssues.map(issue => ({...issue, category: 'icon'})));

        report.htmlFiles[htmlFile] = fileReport;
        report.summary.totalFiles++;
        report.summary.totalReferences += 
            references.cssReferences.length + 
            references.jsReferences.length + 
            references.imageReferences.length + 
            references.iconReferences.length;
        
        if (fileReport.issues.length > 0) {
            report.summary.filesWithIssues++;
            report.summary.brokenReferences += fileReport.issues.length;
            
            console.log(`❌ ${htmlFile}:`);
            fileReport.issues.forEach(issue => {
                console.log(`   └─ [${issue.category.upper}] ${issue.reference} → 파일 없음`);
            });
        } else {
            console.log(`✅ ${htmlFile}`);
        }
    }

    // dist/styles.css 참조 확인
    const distStylesExists = checkFileExists('dist/styles.css');
    const distStylesMinExists = checkFileExists('dist/styles.min.css');

    console.log('\n=== 번들 파일 상태 ===');
    console.log(`dist/styles.css: ${distStylesExists ? '✅ 존재' : '❌ 없음'}`);
    console.log(`dist/styles.min.css: ${distStylesMinExists ? '✅ 존재' : '❌ 없음'}`);

    // 권장사항 생성
    if (!distStylesExists) {
        report.recommendations.push({
            type: 'critical',
            message: 'dist/styles.css 번들 파일이 없습니다. npm run build:css를 실행하세요.'
        });
    }

    if (report.summary.brokenReferences > 0) {
        report.recommendations.push({
            type: 'high',
            message: `${report.summary.brokenReferences}개의 깨진 참조가 발견되었습니다. 경로를 수정하거나 파일을 생성하세요.`
        });
    }

    // 번들링 전환 감지
    let bundleTransitionNeeded = 0;
    Object.values(report.htmlFiles).forEach(file => {
        const needsTransition = file.cssReferences.some(ref => 
            ref.includes('css/') && !ref.includes('dist/styles')
        );
        if (needsTransition) bundleTransitionNeeded++;
    });

    if (bundleTransitionNeeded > 0) {
        report.recommendations.push({
            type: 'medium',
            message: `${bundleTransitionNeeded}개 파일이 개별 CSS를 참조합니다. 번들링 전환을 고려하세요.`
        });
    }

    console.log('\n=== 검증 결과 요약 ===');
    console.log(`전체 HTML 파일: ${report.summary.totalFiles}개`);
    console.log(`문제있는 파일: ${report.summary.filesWithIssues}개`);
    console.log(`전체 참조: ${report.summary.totalReferences}개`);
    console.log(`깨진 참조: ${report.summary.brokenReferences}개`);
    console.log(`성공률: ${(((report.summary.totalReferences - report.summary.brokenReferences) / report.summary.totalReferences) * 100).toFixed(1)}%`);

    // 리포트 저장
    const reportPath = `html-reference-validation-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 상세 리포트 저장: ${reportPath}`);

    return report;
};

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };