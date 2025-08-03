import fs from 'fs';
import postcss from 'postcss';

// Above-the-fold CSS 선택자들
const criticalSelectors = [
  'html', 'body', '*',
  '.header', '.nav', '.hero',
  '.container', '.main',
  '.btn-primary', '.btn-secondary',
  '.card', '.grid',
  '.korean-text', '.pretendard',
  '@font-face', '@import',
  // 한국어 최적화
  '.word-break-keep-all',
  '.line-height-korean',
  // Linear 디자인 시스템
  ':root', '[data-theme]',
  '.theme-light', '.theme-dark'
];

async function extractCriticalCSS() {
  try {
    const cssContent = fs.readFileSync('dist/styles.min.css', 'utf8');
    const criticalRules = [];
    
    // 기본 리셋 및 변수들
    const baseRules = cssContent.match(/:root[^}]+}|@import[^;]+;|\*[^}]*{[^}]*}/g) || [];
    criticalRules.push(...baseRules);
    
    // Critical 선택자들
    criticalSelectors.forEach(selector => {
      const regex = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^}]*{[^}]*}', 'g');
      const matches = cssContent.match(regex) || [];
      criticalRules.push(...matches);
    });
    
    // 한국어 폰트 선언 추출
    const fontRules = cssContent.match(/@font-face[^}]+}|font-family[^}]+}/g) || [];
    criticalRules.push(...fontRules);
    
    const criticalCSS = [...new Set(criticalRules)].join('\n');
    
    // 압축된 Critical CSS 생성
    const minifiedCritical = criticalCSS
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, '}')
      .replace(/:\s*/g, ':')
      .replace(/;\s*/g, ';')
      .trim();
    
    fs.writeFileSync('dist/critical-inline.css', minifiedCritical);
    
    console.log('Critical CSS extracted:');
    console.log('- Original size:', (cssContent.length / 1024).toFixed(1) + 'KB');
    console.log('- Critical size:', (minifiedCritical.length / 1024).toFixed(1) + 'KB');
    console.log('- Reduction:', ((1 - minifiedCritical.length/cssContent.length) * 100).toFixed(1) + '%');
    
    return minifiedCritical;
  } catch (error) {
    console.error('Critical CSS extraction failed:', error.message);
    return '';
  }
}

extractCriticalCSS();