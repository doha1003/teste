const fs = require('fs');
const path = require('path');

console.log('🔍 전체 26개 페이지 HTML 검사 시작...\n');

// 메인 페이지 목록 (node_modules 제외)
const mainPages = [
    'index.html',
    'about/index.html',
    'contact/index.html',
    'privacy/index.html',
    'terms/index.html',
    'faq/index.html',
    'tests/index.html',
    'tests/mbti/index.html',
    'tests/mbti/test.html',
    'tests/teto-egen/index.html',
    'tests/teto-egen/test.html',
    'tests/love-dna/index.html',
    'tests/love-dna/test.html',
    'tools/index.html',
    'tools/text-counter.html',
    'tools/bmi-calculator.html',
    'tools/salary-calculator.html',
    'fortune/index.html',
    'fortune/daily/index.html',
    'fortune/saju/index.html',
    'fortune/tarot/index.html',
    'fortune/zodiac/index.html',
    'fortune/zodiac-animal/index.html',
    '404.html'
];

let totalPages = 0;
let errorPages = 0;
let cssErrors = 0;
let htmlErrors = 0;

console.log('='.repeat(80));
console.log('📋 전체 페이지 검사 결과');
console.log('='.repeat(80));

mainPages.forEach((pagePath, index) => {
    const fullPath = path.join(__dirname, pagePath);
    const pageNum = index + 1;
    
    console.log(`\n${pageNum}. 📄 ${pagePath}`);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`   ❌ 파일이 존재하지 않음`);
        errorPages++;
        return;
    }
    
    totalPages++;
    let pageErrors = 0;
    
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // HTML 구조 검사
        if (!content.includes('<!DOCTYPE html>')) {
            console.log(`   ❌ DOCTYPE 선언 없음`);
            pageErrors++;
            htmlErrors++;
        }
        
        if (!content.includes('<html lang="ko">')) {
            console.log(`   ❌ HTML lang 속성 없음`);
            pageErrors++;
            htmlErrors++;
        }
        
        if (!content.includes('<meta charset="UTF-8">')) {
            console.log(`   ❌ 문자 인코딩 없음`);
            pageErrors++;
            htmlErrors++;
        }
        
        if (!content.includes('<meta name="viewport"')) {
            console.log(`   ❌ 뷰포트 메타태그 없음`);
            pageErrors++;
            htmlErrors++;
        }
        
        if (!content.includes('<title>') || content.includes('<title></title>')) {
            console.log(`   ❌ 타이틀 태그 없음 또는 비어있음`);
            pageErrors++;
            htmlErrors++;
        }
        
        // CSS 연결 검사
        const cssLinks = content.match(/href="[^"]*\.css[^"]*"/g) || [];
        let foundFinalCleanCSS = false;
        
        cssLinks.forEach(link => {
            console.log(`   📎 CSS: ${link}`);
            if (link.includes('final-clean.css')) {
                foundFinalCleanCSS = true;
            }
            if (link.includes('styles-complete.min.css')) {
                console.log(`   ⚠️  잘못된 CSS 파일: ${link}`);
                pageErrors++;
                cssErrors++;
            }
        });
        
        if (!foundFinalCleanCSS && !pagePath.includes('404.html')) {
            console.log(`   ❌ final-clean.css 연결 없음`);
            pageErrors++;
            cssErrors++;
        }
        
        // JavaScript 연결 검사
        const jsLinks = content.match(/src="[^"]*\.js[^"]*"/g) || [];
        jsLinks.forEach(link => {
            if (link.includes('fix-css-connection.js') || link.includes('emergency-fix.js')) {
                console.log(`   ⚠️  삭제된 JS 파일 참조: ${link}`);
                pageErrors++;
            }
        });
        
        // 중복 body 태그 검사
        const bodyTags = content.match(/<body[^>]*>/g) || [];
        if (bodyTags.length > 1) {
            console.log(`   ❌ 중복 body 태그 ${bodyTags.length}개 발견`);
            pageErrors++;
            htmlErrors++;
        }
        
        // 닫히지 않은 태그 검사 (간단한 체크)
        const openTags = content.match(/<[^/][^>]*>/g) || [];
        const closeTags = content.match(/<\/[^>]*>/g) || [];
        
        // 자체 닫힌 태그 제외
        const selfClosing = ['meta', 'link', 'img', 'br', 'hr', 'input', 'source'];
        const filteredOpenTags = openTags.filter(tag => {
            const tagName = tag.match(/<([^\s>]+)/)[1].toLowerCase();
            return !selfClosing.includes(tagName);
        });
        
        if (Math.abs(filteredOpenTags.length - closeTags.length) > 3) {
            console.log(`   ⚠️  태그 불균형 의심: 열린태그 ${filteredOpenTags.length}개, 닫힌태그 ${closeTags.length}개`);
        }
        
        if (pageErrors === 0) {
            console.log(`   ✅ 페이지 정상`);
        } else {
            console.log(`   ❌ 총 ${pageErrors}개 오류 발견`);
            errorPages++;
        }
        
    } catch (error) {
        console.log(`   ❌ 파일 읽기 오류: ${error.message}`);
        errorPages++;
    }
});

console.log('\n' + '='.repeat(80));
console.log('📊 최종 검사 결과');
console.log('='.repeat(80));
console.log(`총 페이지 수: ${totalPages}개`);
console.log(`정상 페이지: ${totalPages - errorPages}개`);
console.log(`오류 페이지: ${errorPages}개`);
console.log(`CSS 오류: ${cssErrors}개`);
console.log(`HTML 오류: ${htmlErrors}개`);

if (errorPages > 0) {
    console.log('\n🚨 수정이 필요한 페이지들이 있습니다!');
} else {
    console.log('\n✅ 모든 페이지가 정상입니다!');
}

console.log('\n' + '='.repeat(80));