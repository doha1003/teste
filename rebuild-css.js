#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CSS_DIR = './css';
const OUTPUT_FILE = './css/styles-complete.css';
const OUTPUT_MIN_FILE = './css/styles-complete.min.css';

// CSS 파일들의 순서 정의 (의존성 고려)
const CSS_FILES = [
    // 기본 스타일
    'css/base/variables.css',
    'css/base/reset.css',
    'css/base/typography.css',
    
    // 레이아웃
    'css/layout/containers.css',
    'css/layout/grid.css',
    
    // 컴포넌트 (새로 생성한 파일들 포함)
    'css/components/navbar.css',
    'css/components/footer.css',
    'css/components/buttons.css',
    'css/components/cards.css',
    'css/components/forms.css',
    
    // 페이지별 스타일
    'css/pages/home.css',
    'css/pages/tests.css',
    'css/pages/tools.css',
    'css/pages/fortune.css',
    'css/pages/about.css',
    'css/pages/contact.css',
    
    // 유틸리티
    'css/utilities/helpers.css',
    'css/utilities/animations.css',
    'css/utilities/responsive.css'
];

// CSS 압축 함수
function minifyCSS(css) {
    return css
        // 주석 제거
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // 불필요한 공백 제거
        .replace(/\s+/g, ' ')
        // 세미콜론 앞 공백 제거
        .replace(/\s*;\s*/g, ';')
        // 중괄호 앞뒤 공백 제거
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        // 콜론 앞뒤 공백 제거
        .replace(/\s*:\s*/g, ':')
        // 콤마 뒤 공백 정리
        .replace(/\s*,\s*/g, ',')
        // 맨 앞뒤 공백 제거
        .trim();
}

async function buildCSS() {
    console.log('🔧 CSS 파일 빌드 시작...\n');
    
    let combinedCSS = '';
    let processedFiles = 0;
    let skippedFiles = 0;
    
    // 헤더 추가
    combinedCSS += `/* =========================================================================
   doha.kr 통합 CSS 파일
   빌드 시간: ${new Date().toLocaleString('ko-KR')}
   ========================================================================= */\n\n`;
    
    for (const file of CSS_FILES) {
        const filePath = path.join(file);
        
        if (fs.existsSync(filePath)) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                console.log(`✅ ${file} (${content.length} 문자)`);
                
                combinedCSS += `/* === ${file} === */\n`;
                combinedCSS += content + '\n\n';
                processedFiles++;
            } catch (error) {
                console.log(`❌ 오류: ${file} - ${error.message}`);
                skippedFiles++;
            }
        } else {
            console.log(`⚠️  파일 없음: ${file}`);
            skippedFiles++;
        }
    }
    
    // 통합 파일 저장
    fs.writeFileSync(OUTPUT_FILE, combinedCSS);
    
    // 압축 파일 생성
    const minifiedCSS = minifyCSS(combinedCSS);
    fs.writeFileSync(OUTPUT_MIN_FILE, minifiedCSS);
    
    const originalSize = combinedCSS.length;
    const minifiedSize = minifiedCSS.length;
    const compressionRatio = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);
    
    console.log('\n📊 빌드 완료 통계:');
    console.log(`✅ 처리된 파일: ${processedFiles}개`);
    console.log(`⚠️  건너뛴 파일: ${skippedFiles}개`);
    console.log(`📁 ${OUTPUT_FILE} 생성: ${originalSize.toLocaleString()} 문자`);
    console.log(`📁 ${OUTPUT_MIN_FILE} 생성: ${minifiedSize.toLocaleString()} 문자`);
    console.log(`💾 압축률: ${compressionRatio}%`);
}

buildCSS().catch(error => {
    console.error('❌ 빌드 오류:', error);
    process.exit(1);
});