/**
 * Fix remaining JavaScript errors
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 남은 JavaScript 오류 수정 시작...\n');

// Fix adsbygoogle assignments
const filesToFixAdsbygoogle = [
  'js/core/common-init.js',
  'js/core/service-base.js', 
  'js/features/fortune-daily.js'
];

filesToFixAdsbygoogle.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  파일 없음: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix adsbygoogle = window.adsbygoogle || []
    content = content.replace(
      /(\s*)adsbygoogle\s*=\s*(window\.)?adsbygoogle\s*\|\|\s*\[\];?/g,
      '$1window.adsbygoogle = window.adsbygoogle || [];'
    );
    
    // Check if modified
    if (content.includes('window.adsbygoogle = window.adsbygoogle || []')) {
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ adsbygoogle 수정: ${file}`);
    }
    
  } catch (error) {
    console.error(`❌ 오류 (${file}): ${error.message}`);
  }
});

// Fix event handler references
console.log('\n🔧 이벤트 핸들러 참조 수정...\n');

const eventFixFiles = [
  'js/core/korean-optimizer.js',
  'js/pages/404.js',
  'js/pages/fortune-index.js',
  'js/pages/home.js',
  'js/pages/love-dna-intro.js',
  'js/pages/mbti-intro.js',
  'js/pages/tests-index.js',
  'js/pages/teto-egen-intro.js',
  'js/pages/tools-index.js'
];

eventFixFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix event references in arrow functions
    content = content.replace(/\(_event\)\s*=>\s*{([^}]+)event\./g, (match, body) => {
      modified = true;
      return '(event) => {' + body + 'event.';
    });
    
    // Fix _event references that should be event
    content = content.replace(/\(_event\)\s*=>\s*{([^}]+)_event\./g, (match, body) => {
      modified = true;
      return '(event) => {' + body + 'event.';
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 이벤트 참조 수정: ${file}`);
    }
    
  } catch (error) {
    console.error(`❌ 오류 (${file}): ${error.message}`);
  }
});

// Fix destructuring in fortune-daily.js
console.log('\n🔧 구조 분해 할당 수정...\n');

const fortuneDailyPath = path.join(process.cwd(), 'js/features/fortune-daily.js');
if (fs.existsSync(fortuneDailyPath)) {
  try {
    let content = fs.readFileSync(fortuneDailyPath, 'utf8');
    
    // Fix destructuring assignment
    content = content.replace(
      /const year = parts\[0\];\s*const month = parts\[1\];\s*const day = parts\[2\];/g,
      'const [year, month, day] = parts;'
    );
    
    fs.writeFileSync(fortuneDailyPath, content, 'utf8');
    console.log('✅ 구조 분해 할당 수정: js/features/fortune-daily.js');
  } catch (error) {
    console.error('❌ 오류 (fortune-daily.js):', error.message);
  }
}

// Fix no-nested-ternary in performance-monitor.js
console.log('\n🔧 중첩 삼항 연산자 수정...\n');

const perfMonitorPath = path.join(process.cwd(), 'js/core/performance-monitor.js');
if (fs.existsSync(perfMonitorPath)) {
  try {
    let content = fs.readFileSync(perfMonitorPath, 'utf8');
    
    // Replace nested ternary with if-else logic
    content = content.replace(
      /value < threshold\.good \? 'good' : value < threshold\.needsImprovement \? 'needs-improvement' : 'poor'/g,
      `(() => {
          if (value < threshold.good) return 'good';
          if (value < threshold.needsImprovement) return 'needs-improvement';
          return 'poor';
        })()`
    );
    
    fs.writeFileSync(perfMonitorPath, content, 'utf8');
    console.log('✅ 중첩 삼항 연산자 수정: js/core/performance-monitor.js');
  } catch (error) {
    console.error('❌ 오류 (performance-monitor.js):', error.message);
  }
}

// Fix empty block in home.js
console.log('\n🔧 빈 블록 수정...\n');

const homeJsPath = path.join(process.cwd(), 'js/pages/home.js');
if (fs.existsSync(homeJsPath)) {
  try {
    let content = fs.readFileSync(homeJsPath, 'utf8');
    
    // Fix empty catch block
    content = content.replace(
      /} catch \(error\) {\s*}/g,
      '} catch (error) {\n        // Silently fail for non-critical operations\n      }'
    );
    
    fs.writeFileSync(homeJsPath, content, 'utf8');
    console.log('✅ 빈 블록 수정: js/pages/home.js');
  } catch (error) {
    console.error('❌ 오류 (home.js):', error.message);
  }
}

// Fix FAQ escape character
console.log('\n🔧 이스케이프 문자 수정...\n');

const faqPath = path.join(process.cwd(), 'js/pages/faq.js');
if (fs.existsSync(faqPath)) {
  try {
    let content = fs.readFileSync(faqPath, 'utf8');
    
    // Fix unnecessary escape
    content = content.replace(/id=\\"faq-/g, 'id="faq-');
    
    fs.writeFileSync(faqPath, content, 'utf8');
    console.log('✅ 이스케이프 문자 수정: js/pages/faq.js');
  } catch (error) {
    console.error('❌ 오류 (faq.js):', error.message);
  }
}

console.log('\n✨ JavaScript 오류 수정 완료!');
console.log('\n📝 다음 단계:');
console.log('1. npm run build - 빌드 재시도');
console.log('2. npm run lint - ESLint 확인');
console.log('3. npm test - 테스트 실행');