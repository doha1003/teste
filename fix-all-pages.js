#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// 수정할 모든 페이지 목록
const PAGES_TO_FIX = [
    // 404 페이지들 (CSS 경로 수정 필요)
    { file: 'tools/age-calculator.html', type: '404' },
    { file: 'tools/percentage-calculator.html', type: '404' },
    { file: 'tools/discount-calculator.html', type: '404' },
    { file: 'tools/unit-converter.html', type: '404' },
    { file: 'tools/loan-calculator.html', type: '404' },
    { file: 'community/index.html', type: '404' },
    { file: 'search/index.html', type: '404' },
    
    // CSS 중복 로딩 페이지들
    { file: 'tests/index.html', type: 'duplicate' },
    { file: 'tools/index.html', type: 'duplicate' },
    { file: 'tools/salary-calculator.html', type: 'duplicate' },
    { file: 'tools/bmi-calculator.html', type: 'duplicate' },
    { file: 'about/index.html', type: 'duplicate' },
    { file: 'contact/index.html', type: 'duplicate' },
    
    // 나머지 모든 페이지들 (인라인 스타일 제거)
    { file: 'index.html', type: 'inline' },
    { file: 'tests/mbti/index.html', type: 'inline' },
    { file: 'tests/teto-egen/index.html', type: 'inline' },
    { file: 'tests/love-dna/index.html', type: 'inline' },
    { file: 'fortune/index.html', type: 'inline' },
    { file: 'fortune/daily/index.html', type: 'inline' },
    { file: 'fortune/saju/index.html', type: 'inline' },
    { file: 'fortune/tarot/index.html', type: 'inline' },
    { file: 'fortune/zodiac/index.html', type: 'inline' },
    { file: 'fortune/zodiac-animal/index.html', type: 'inline' },
    { file: 'tools/text-counter.html', type: 'inline' },
    { file: 'privacy/index.html', type: 'inline' },
    { file: 'terms/index.html', type: 'inline' }
];

async function fixPage(filePath, type) {
    try {
        const fullPath = path.join('.', filePath);
        let content = await fs.readFile(fullPath, 'utf8');
        let modified = false;
        
        console.log(`\n📄 ${filePath} 수정 중...`);
        
        // 1. 404 페이지 CSS 경로 수정
        if (type === '404') {
            // 잘못된 CSS 경로 수정
            content = content.replace('/css/styles.css', '/css/styles-complete.min.css?v=20250718');
            content = content.replace('/css/pages/404.css', '');
            
            // 빈 줄 정리
            content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
            
            console.log('   ✅ CSS 경로 수정 완료');
            modified = true;
        }
        
        // 2. CSS 중복 제거
        if (type === 'duplicate' || type === '404') {
            // 중복된 CSS 링크 찾기
            const cssPattern = /<link[^>]*href="([^"]*\.css[^"]*)"[^>]*>/g;
            const cssLinks = [];
            let match;
            
            while ((match = cssPattern.exec(content)) !== null) {
                cssLinks.push({ full: match[0], href: match[1] });
            }
            
            // 중복 제거
            const seen = new Set();
            const toRemove = [];
            
            cssLinks.forEach(link => {
                const cleanHref = link.href.split('?')[0]; // 쿼리 파라미터 제거
                if (seen.has(cleanHref)) {
                    toRemove.push(link.full);
                } else {
                    seen.add(cleanHref);
                }
            });
            
            // 중복 링크 제거
            toRemove.forEach(link => {
                content = content.replace(link + '\n', '');
                content = content.replace(link, '');
            });
            
            if (toRemove.length > 0) {
                console.log(`   ✅ CSS 중복 ${toRemove.length}개 제거`);
                modified = true;
            }
        }
        
        // 3. 인라인 스타일 제거 및 정리
        // style 속성 제거 (광고 제외)
        const styleAttrCount = (content.match(/style="[^"]*"/g) || []).length;
        content = content.replace(/(<(?!ins)[^>]+)style="[^"]*"([^>]*>)/g, '$1$2');
        
        // 불필요한 공백 정리
        content = content.replace(/\s+>/g, '>');
        content = content.replace(/>\s+</g, '><');
        
        if (styleAttrCount > 0) {
            console.log(`   ✅ style 속성 ${styleAttrCount}개 제거`);
            modified = true;
        }
        
        // 4. CSS 파일 통일 (min 버전으로)
        content = content.replace('/css/styles-complete.css', '/css/styles-complete.min.css?v=20250718');
        
        // 5. 빈 줄 정리
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // 6. 줄바꿈 정리 (태그 사이)
        content = content.replace(/>\s*\n\s*</g, '>\n<');
        
        if (modified) {
            await fs.writeFile(fullPath, content);
            console.log('   ✅ 저장 완료');
        } else {
            console.log('   ℹ️  수정 사항 없음');
        }
        
        return { success: true, file: filePath };
        
    } catch (error) {
        console.error(`   ❌ 오류: ${error.message}`);
        return { success: false, file: filePath, error: error.message };
    }
}

async function fixAllPages() {
    console.log('🔧 전체 페이지 일괄 수정 시작...\n');
    console.log('수정 내용:');
    console.log('1. 404 페이지 CSS 경로 수정');
    console.log('2. CSS 중복 로딩 제거');
    console.log('3. 인라인 스타일 제거');
    console.log('4. CSS 파일명 통일 (.min.css)');
    console.log('5. 줄바꿈 정리\n');
    
    const results = {
        success: [],
        failed: []
    };
    
    // 순차적으로 처리
    for (const page of PAGES_TO_FIX) {
        const result = await fixPage(page.file, page.type);
        if (result.success) {
            results.success.push(result.file);
        } else {
            results.failed.push(result);
        }
    }
    
    // 결과 보고
    console.log('\n' + '='.repeat(60));
    console.log('📊 수정 완료 보고서');
    console.log('='.repeat(60));
    console.log(`✅ 성공: ${results.success.length}개`);
    console.log(`❌ 실패: ${results.failed.length}개`);
    
    if (results.failed.length > 0) {
        console.log('\n실패한 파일:');
        results.failed.forEach(({ file, error }) => {
            console.log(`- ${file}: ${error}`);
        });
    }
    
    console.log('\n✨ 모든 작업 완료!');
}

// CSS 재빌드
async function rebuildCSS() {
    console.log('\n🔧 CSS 재빌드 중...');
    const { exec } = require('child_process').promises;
    
    try {
        await exec('node rebuild-css.js');
        console.log('✅ CSS 재빌드 완료');
    } catch (error) {
        console.error('❌ CSS 재빌드 실패:', error.message);
    }
}

// 실행
fixAllPages()
    .then(() => rebuildCSS())
    .catch(console.error);