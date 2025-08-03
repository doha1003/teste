import fs from 'fs';

// Critical CSS 최적화 및 압축
function optimizeCriticalCSS() {
  try {
    const criticalCSS = fs.readFileSync('dist/critical-inline.css', 'utf8');
    
    // 중복 제거 및 필수 요소만 추출
    const essentialCSS = [
      // CSS 변수 (가장 중요)
      ':root{--color-primary:#5c5ce0;--color-white:#fff;--color-gray-900:#111827;--bg-primary:#fff;--text-primary:#1a1a1a;--font-family:"Pretendard",-apple-system,BlinkMacSystemFont,sans-serif;--font-size-base:1rem;--line-height-normal:1.7;--spacing-md:1rem;--radius-md:8px;--shadow-md:0 4px 6px -1px rgba(0,0,0,.1);--transition-base:200ms ease}',
      
      // 기본 리셋
      '*,*:before,*:after{box-sizing:border-box;margin:0;padding:0}',
      '*{word-break:keep-all;overflow-wrap:break-word}',
      
      // HTML/Body 기본 스타일
      'html{font-size:16px;-webkit-text-size-adjust:100%}',
      'body{font-family:var(--font-family);font-size:var(--font-size-base);line-height:var(--line-height-normal);color:var(--text-primary);background:var(--bg-primary);word-break:keep-all;margin:0;padding:0;min-height:100vh}',
      
      // 네비게이션 기본
      '.navbar{background:var(--bg-primary);position:sticky;top:0;z-index:1000}',
      
      // 헤더/히어로 기본
      '.header,.hero{text-align:center;padding:60px 20px}',
      '.header h1,.hero-title{font-size:3rem;font-weight:800;color:var(--text-primary);margin-bottom:20px}',
      '.header p,.hero-subtitle{font-size:1.25rem;color:var(--text-primary);margin-bottom:40px}',
      
      // 컨테이너
      '.container{max-width:1200px;margin:0 auto;padding:0 20px}',
      
      // 버튼 기본
      '.btn,.btn-primary{display:inline-flex;align-items:center;justify-content:center;padding:12px 24px;border-radius:var(--radius-md);font-family:inherit;font-size:var(--font-size-base);text-decoration:none;transition:var(--transition-base);cursor:pointer;border:none}',
      '.btn-primary{background:var(--color-primary);color:var(--color-white)}',
      
      // 카드 기본
      '.card{background:var(--bg-primary);border-radius:var(--radius-md);padding:var(--spacing-md);box-shadow:var(--shadow-md);transition:var(--transition-base)}',
      
      // 그리드
      '.grid{display:grid;gap:var(--spacing-md)}',
      
      // 모바일 반응형
      '@media (max-width:768px){.header h1,.hero-title{font-size:2rem}.header p,.hero-subtitle{font-size:1rem}.container{padding:0 16px}}'
    ].join('');
    
    // 최종 압축 (공백 제거)
    const minified = essentialCSS
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, '}')
      .replace(/:\s*/g, ':')
      .replace(/;\s*/g, ';')
      .trim();
    
    fs.writeFileSync('dist/critical-essential.css', minified);
    
    console.log('Essential Critical CSS created:');
    console.log('- Original critical size:', (criticalCSS.length / 1024).toFixed(1) + 'KB');
    console.log('- Essential size:', (minified.length / 1024).toFixed(1) + 'KB');
    console.log('- Reduction:', ((1 - minified.length/criticalCSS.length) * 100).toFixed(1) + '%');
    
    return minified;
  } catch (error) {
    console.error('Critical CSS optimization failed:', error.message);
    return '';
  }
}

optimizeCriticalCSS();