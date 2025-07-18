const fs = require('fs');
const path = require('path');

// CSS 파일들을 읽어서 하나로 통합
const cssFiles = [
  'css/base/variables.css',
  'css/base/reset.css', 
  'css/base/typography.css',
  'css/layout/container.css',
  'css/layout/grid.css',
  'css/components/navigation.css',
  'css/components/buttons.css',
  'css/components/forms.css',
  'css/pages/homepage.css',
  'css/pages/test-pages.css',
  'css/pages/fortune-pages.css',
  'css/pages/tools-pages.css',
  'css/utilities/helpers.css',
  'css/utilities/animations.css',
  'css/utilities/responsive.css',
  'css/utilities/fixes.css',
  'css/utilities/print.css'
];

let combinedCSS = '/* DOHA.KR - Complete CSS Bundle */\n\n';

cssFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    combinedCSS += `/* ===== ${file} ===== */\n${content}\n\n`;
    console.log(`✓ Added: ${file}`);
  } else {
    console.log(`✗ Missing: ${file}`);
  }
});

// 통합된 CSS 저장
fs.writeFileSync('css/styles-complete.css', combinedCSS);
console.log('\n✓ CSS 통합 완료: css/styles-complete.css');

// 간단한 압축 (공백 제거)
const minified = combinedCSS
  .replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '') // 주석 제거
  .replace(/\s+/g, ' ') // 여러 공백을 하나로
  .replace(/\s*:\s*/g, ':') // 콜론 주변 공백 제거
  .replace(/\s*\{\s*/g, '{') // 중괄호 주변 공백 제거
  .replace(/\s*\}\s*/g, '}')
  .replace(/\s*;\s*/g, ';')
  .trim();

fs.writeFileSync('css/styles-complete.min.css', minified);
console.log('✓ CSS 압축 완료: css/styles-complete.min.css');

// 파일 크기 출력
const originalSize = Buffer.byteLength(combinedCSS, 'utf8');
const minifiedSize = Buffer.byteLength(minified, 'utf8');
const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);

console.log(`\n파일 크기:`);
console.log(`Original: ${(originalSize / 1024).toFixed(2)} KB`);
console.log(`Minified: ${(minifiedSize / 1024).toFixed(2)} KB`);
console.log(`Reduction: ${reduction}%`);