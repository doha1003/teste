const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 HTML 파일의 CSS 링크를 수정합니다...\n');

// 모든 HTML 파일 찾기
const htmlFiles = glob.sync('**/*.html', {
  ignore: ['node_modules/**', 'design-system/**', 'html/**']
});

let updatedCount = 0;

htmlFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // 존재하지 않는 CSS 파일 링크 제거 패턴들
    const patternsToRemove = [
      /<link[^>]*href="[^"]*browser-fixes\.css[^"]*"[^>]*>/g,
      /<link[^>]*href="[^"]*mobile-menu-fixes\.css[^"]*"[^>]*>/g,
      /<link[^>]*href="[^"]*design-system-fixes\.css[^"]*"[^>]*>/g,
      /<link[^>]*href="[^"]*complete-overlap-elimination\.css[^"]*"[^>]*>/g,
      /<link[^>]*href="[^"]*text-overlap-fixes\.css[^"]*"[^>]*>/g,
      /<link[^>]*href="[^"]*critical-overlap-fixes\.css[^"]*"[^>]*>/g,
      /<link[^>]*href="[^"]*korean-optimized-nav\.css[^"]*"[^>]*>/g,
      /<link[^>]*href="[^"]*emergency-fixes\.css[^"]*"[^>]*>/g,
      /<link[^>]*href="[^"]*navbar-structure-fix\.css[^"]*"[^>]*>/g
    ];
    
    // 패턴 제거
    patternsToRemove.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, '');
        modified = true;
      }
    });
    
    // 로컬 폰트 참조를 CDN으로 변경
    if (content.includes('/fonts/Pretendard')) {
      // 로컬 폰트 preload 제거
      content = content.replace(
        /<link[^>]*href="\/fonts\/Pretendard[^"]*"[^>]*>/g,
        ''
      );
      
      // 폰트가 없으면 Google Fonts 추가
      if (!content.includes('fonts.googleapis.com') && content.includes('<head>')) {
        const fontLinks = `    <!-- 폰트 프리로드 (CDN) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap" rel="stylesheet">`;
        
        content = content.replace('<head>', '<head>\n' + fontLinks);
      }
      modified = true;
    }
    
    // 중복된 CSS 링크를 번들로 교체
    const cssPattern = /<link[^>]*href="\/css\/(components|pages|features|layout|foundation|core)\/[^"]*\.css[^"]*"[^>]*>/g;
    const hasMultipleCSSFiles = (content.match(cssPattern) || []).length > 3;
    
    if (hasMultipleCSSFiles) {
      // 기존 CSS 링크들 제거
      content = content.replace(cssPattern, '');
      
      // 번들 CSS 추가 (이미 있지 않은 경우)
      if (!content.includes('/dist/styles')) {
        // </head> 태그 앞에 추가
        const bundleCSS = `    <!-- Main CSS Bundle (모든 CSS 포함) -->
    <link rel="stylesheet" href="/dist/styles.min.css" id="main-styles">
`;
        content = content.replace('</head>', bundleCSS + '</head>');
      }
      modified = true;
    }
    
    // CSS Bundle 관련 스크립트 제거 (더 이상 필요없음)
    const scriptPattern = /<script>\s*\/\/\s*Automatically load minified CSS[\s\S]*?<\/script>/g;
    if (scriptPattern.test(content)) {
      content = content.replace(scriptPattern, '');
      modified = true;
    }
    
    // korean-optimization.css 개별 링크 제거 (번들에 포함됨)
    content = content.replace(/<link[^>]*href="\/css\/korean-optimization\.css"[^>]*>\s*/g, '');
    
    // 빈 줄 정리
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`✅ ${file} 수정됨`);
      updatedCount++;
    }
  } catch (error) {
    console.error(`❌ ${file} 처리 중 오류:`, error.message);
  }
});

console.log(`\n✨ 총 ${updatedCount}개의 HTML 파일이 수정되었습니다.`);