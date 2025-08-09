/**
 * 26개 페이지의 CSS/JS 참조 시스템 완전 검증
 * 실제 404 오류 발생 페이지 식별 및 수정 방안 제시
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 doha.kr 전체 페이지 CSS/JS 참조 검증 시작\n');

// HTML 파일 찾기
function findAllHtmlFiles(dir, basePath = '') {
    const files = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(basePath, item).replace(/\\/g, '/');
        
        if (fs.statSync(fullPath).isDirectory()) {
            // 제외할 디렉토리들
            if (!['node_modules', '.git', '.backup', 'playwright-report', 'design-system'].includes(item)) {
                files.push(...findAllHtmlFiles(fullPath, relativePath));
            }
        } else if (item.endsWith('.html') && !item.startsWith('test-') && !item.includes('debug')) {
            files.push({
                path: fullPath,
                relativePath: relativePath,
                webPath: relativePath.startsWith('/') ? relativePath : '/' + relativePath
            });
        }
    });
    
    return files;
}

// CSS/JS 참조 추출
function extractReferences(htmlContent, filePath) {
    const cssRefs = [];
    const jsRefs = [];
    
    // CSS 참조 찾기
    const cssMatches = htmlContent.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/g) || [];
    cssMatches.forEach(match => {
        const hrefMatch = match.match(/href=["']([^"']+)["']/);
        if (hrefMatch) {
            cssRefs.push(hrefMatch[1]);
        }
    });
    
    // JS 참조 찾기  
    const jsMatches = htmlContent.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/g) || [];
    jsMatches.forEach(match => {
        const srcMatch = match.match(/src=["']([^"']+)["']/);
        if (srcMatch) {
            jsRefs.push(srcMatch[1]);
        }
    });
    
    return { cssRefs, jsRefs };
}

// 파일 존재 여부 확인
function checkFileExists(refPath, htmlFilePath) {
    let resolvedPath;
    
    if (refPath.startsWith('http') || refPath.startsWith('//')) {
        return { exists: true, type: 'external' };
    }
    
    if (refPath.startsWith('/')) {
        // 절대 경로
        resolvedPath = path.join(__dirname, refPath.substring(1));
    } else {
        // 상대 경로
        resolvedPath = path.resolve(path.dirname(htmlFilePath), refPath);
    }
    
    const exists = fs.existsSync(resolvedPath);
    return {
        exists,
        type: 'local',
        resolvedPath,
        size: exists ? fs.statSync(resolvedPath).size : 0
    };
}

// 메인 검증 함수
function verifyAllPages() {
    const htmlFiles = findAllHtmlFiles(__dirname);
    console.log(`📋 총 ${htmlFiles.length}개 HTML 페이지 발견\n`);
    
    const results = [];
    let totalErrors = 0;
    
    htmlFiles.forEach((file, index) => {
        console.log(`[${index + 1}/${htmlFiles.length}] 검증 중: ${file.relativePath}`);
        
        try {
            const content = fs.readFileSync(file.path, 'utf8');
            const { cssRefs, jsRefs } = extractReferences(content, file.path);
            
            const pageResult = {
                file: file.relativePath,
                webPath: file.webPath,
                css: [],
                js: [],
                errors: []
            };
            
            // CSS 참조 검증
            cssRefs.forEach(ref => {
                const check = checkFileExists(ref, file.path);
                pageResult.css.push({
                    path: ref,
                    exists: check.exists,
                    type: check.type,
                    size: check.size || 0
                });
                
                if (!check.exists && check.type === 'local') {
                    pageResult.errors.push(`CSS 404: ${ref}`);
                    totalErrors++;
                }
            });
            
            // JS 참조 검증
            jsRefs.forEach(ref => {
                const check = checkFileExists(ref, file.path);
                pageResult.js.push({
                    path: ref,
                    exists: check.exists,
                    type: check.type,
                    size: check.size || 0
                });
                
                if (!check.exists && check.type === 'local') {
                    pageResult.errors.push(`JS 404: ${ref}`);
                    totalErrors++;
                }
            });
            
            results.push(pageResult);
            
        } catch (error) {
            console.error(`❌ 오류: ${file.relativePath} - ${error.message}`);
            results.push({
                file: file.relativePath,
                webPath: file.webPath,
                css: [],
                js: [],
                errors: [`파일 읽기 오류: ${error.message}`]
            });
        }
    });
    
    return { results, totalErrors };
}

// 결과 분석 및 보고서 생성
function generateReport(results, totalErrors) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 doha.kr CSS/JS 참조 시스템 검증 결과');
    console.log('='.repeat(80));
    
    if (totalErrors === 0) {
        console.log('🎉 모든 페이지의 CSS/JS 참조가 정상입니다!');
    } else {
        console.log(`🚨 총 ${totalErrors}개의 404 오류 발견`);
    }
    
    console.log('\n📁 페이지별 상세 분석:');
    
    results.forEach(result => {
        if (result.errors.length > 0) {
            console.log(`\n❌ ${result.file}`);
            result.errors.forEach(error => {
                console.log(`   ${error}`);
            });
        } else {
            console.log(`✅ ${result.file} (CSS: ${result.css.length}, JS: ${result.js.length})`);
        }
    });
    
    // CSS 번들 상태 확인
    console.log('\n📦 CSS 번들 시스템 상태:');
    const cssBundle = path.join(__dirname, 'dist', 'styles.min.css');
    if (fs.existsSync(cssBundle)) {
        const size = (fs.statSync(cssBundle).size / 1024).toFixed(1);
        console.log(`✅ dist/styles.min.css 존재 (${size}KB)`);
    } else {
        console.log('❌ dist/styles.min.css 없음 - 번들링 필요');
    }
    
    // JS 번들 상태 확인  
    console.log('\n📦 JavaScript 시스템 상태:');
    const jsCore = path.join(__dirname, 'js', 'core', 'service-base.js');
    if (fs.existsSync(jsCore)) {
        console.log('✅ js/core/service-base.js 존재');
    } else {
        console.log('❌ js/core/service-base.js 없음');
    }
    
    // 해결 방안 제시
    if (totalErrors > 0) {
        console.log('\n💡 즉시 해결 방안:');
        console.log('1. 브라우저 캐시 클리어: Ctrl+Shift+R');
        console.log('2. 번들 재생성: npm run build');  
        console.log('3. 개발 서버 재시작: npm run dev 또는 python -m http.server 3000');
        console.log('4. HTML 참조 경로 수정 (필요시)');
    }
    
    // JSON 보고서 저장
    const reportPath = path.join(__dirname, `css-js-reference-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        totalPages: results.length,
        totalErrors: totalErrors,
        results: results
    }, null, 2));
    
    console.log(`\n📄 상세 보고서 저장: ${path.basename(reportPath)}`);
}

// 실행
const { results, totalErrors } = verifyAllPages();
generateReport(results, totalErrors);

console.log('\n🔍 실제 404 오류를 확인하려면:');
console.log('1. 브라우저에서 각 페이지 방문');
console.log('2. F12 → Network 탭에서 실패한 요청 확인');  
console.log('3. Console 탭에서 JavaScript 오류 확인');
console.log('\n또는 urgent-css-js-verification.html을 브라우저에서 열어 실시간 테스트 수행');