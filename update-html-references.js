
// HTML 파일 업데이트를 위한 스크립트
// 번들된 JS 파일을 참조하도록 HTML 파일을 수정합니다.

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const htmlFiles = [];

// HTML 파일 찾기
function findHtmlFiles(dir) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = join(dir, file);
    
    if (file.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  });
}

// 루트 디렉토리의 HTML 파일
findHtmlFiles('.');

// 각 HTML 파일 업데이트
htmlFiles.forEach(htmlFile => {
  let content = readFileSync(htmlFile, 'utf8');
  let updated = false;
  
  // app.js를 bundle.min.js로 교체
  if (content.includes('js/app.js')) {
    content = content.replace(
      '<script type="module" src="js/app.js"></script>',
      '<script type="module" src="dist/js/bundle.min.js"></script>'
    );
    updated = true;
  }
  
  // 개별 페이지 스크립트 교체
  const pageScriptMatch = content.match(/<script type="module" src="js\/pages\/([^"]+)\.js"><\/script>/);
  if (pageScriptMatch) {
    const pageName = pageScriptMatch[1];
    content = content.replace(
      pageScriptMatch[0],
      `<script type="module" src="dist/js/pages/${pageName}.min.js"></script>`
    );
    updated = true;
  }
  
  if (updated) {
    writeFileSync(htmlFile, content);
    console.log(`Updated: ${htmlFile}`);
  }
});

console.log('\n✅ HTML files updated successfully!');
