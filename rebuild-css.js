const fs = require('fs');
const path = require('path');

// CSS 파일들을 순서대로 읽어서 합치기
const cssFiles = [
    'css/base/variables.css',
    'css/base/reset.css',
    'css/base/typography.css',
    'css/layout/containers.css',
    'css/layout/grid.css',
    'css/components/navbar.css',
    'css/components/buttons.css',
    'css/components/forms.css',
    'css/components/cards.css',
    'css/pages/home.css',
    'css/pages/tests.css',
    'css/pages/fortune.css',
    'css/pages/tools.css',
    'css/pages/legal.css',
    'css/pages/text-counter.css',
    'css/pages/bmi-calculator.css',
    'css/pages/contact.css',
    'css/utilities/animations.css',
    'css/utilities/helpers.css',
    'css/utilities/responsive.css'
];

let combinedCSS = `/* =========================================================================
   DOHA.KR - COMPLETE COMBINED STYLESHEET
   All CSS modules combined into one file
   Generated: ${new Date().toISOString()}
   ========================================================================= */

/* CRITICAL: Ensure body has proper width */
html, body {
    width: 100%;
    max-width: 100%;
}

body {
    width: 100% !important;
    max-width: 100% !important;
}

`;

// 각 CSS 파일 읽어서 합치기
cssFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        combinedCSS += `\n/* ========================================================================= */\n/* ${file} */\n/* ========================================================================= */\n\n`;
        combinedCSS += content + '\n';
    } else {
        console.log(`⚠️  파일 없음: ${file}`);
    }
});

// styles-complete.css 업데이트
fs.writeFileSync(path.join(__dirname, 'css/styles-complete.css'), combinedCSS);

// CSS 압축 함수
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // 주석 제거
        .replace(/\s+/g, ' ')              // 공백 압축
        .replace(/\s*([{}:;,])\s*/g, '$1') // 구분자 주변 공백 제거
        .replace(/;\s*}/g, '}')            // 세미콜론 정리
        .trim();
}

// 압축된 버전 생성
const minified = minifyCSS(combinedCSS);
fs.writeFileSync(path.join(__dirname, 'css/styles-complete.min.css'), minified);

console.log('✅ CSS 파일 재빌드 완료');
console.log(`📦 원본: ${(combinedCSS.length / 1024).toFixed(2)} KB`);
console.log(`🗜️  압축: ${(minified.length / 1024).toFixed(2)} KB`);
console.log(`💾 절약: ${((combinedCSS.length - minified.length) / 1024).toFixed(2)} KB`);