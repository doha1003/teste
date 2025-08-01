/**
 * Validate all JavaScript files and fix common syntax errors
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const filesWithErrors = [];
const fixedFiles = [];

console.log('🔍 모든 JavaScript 파일 검증 시작...\n');

// Function to validate JavaScript syntax
function validateJavaScript(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Try to create a script to validate syntax
    try {
      new vm.Script(content, { filename: filePath });
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message,
        line: error.stack.match(/:(\d+):/) ? error.stack.match(/:(\d+):/)[1] : null
      };
    }
  } catch (error) {
    return { valid: false, error: `File read error: ${error.message}` };
  }
}

// Function to fix common JavaScript errors
function fixCommonErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Count braces
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    
    if (openBraces < closeBraces) {
      // Too many closing braces
      console.log(`  → 중괄호 불균형 감지: 닫는 중괄호가 ${closeBraces - openBraces}개 더 많음`);
      
      // Remove extra closing braces at the end of file
      const lines = content.split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim() === '}' && closeBraces > openBraces) {
          lines.splice(i, 1);
          closeBraces--;
          modified = true;
          if (closeBraces === openBraces) break;
        }
      }
      
      if (modified) {
        content = lines.join('\n');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  → 불필요한 중괄호 제거됨`);
        return true;
      }
    }
    
    // Fix other common issues
    const originalContent = content;
    
    // Fix window.adsbygoogle assignment
    content = content.replace(
      /(\s*)\(window\.adsbygoogle\s*=\s*window\.adsbygoogle\s*\|\|\s*\[\];\)\.push/g,
      '$1(window.adsbygoogle = window.adsbygoogle || []).push'
    );
    
    // Fix destructuring in fortune-daily.js
    if (filePath.includes('fortune-daily.js')) {
      content = content.replace(
        /const year = parts\[0\];\s*const month = parts\[1\];\s*const day = parts\[2\];/g,
        'const [year, month, day] = parts;'
      );
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  → 일반적인 구문 오류 수정됨`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`  ❌ 수정 실패: ${error.message}`);
    return false;
  }
}

// Recursively check all JS files
function checkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
      checkDirectory(filePath);
    } else if (file.endsWith('.js') && !file.endsWith('.min.js')) {
      const relativePath = path.relative(process.cwd(), filePath);
      const result = validateJavaScript(filePath);
      
      if (!result.valid) {
        console.log(`\n❌ 오류 발견: ${relativePath}`);
        console.log(`   ${result.error}`);
        filesWithErrors.push({ path: relativePath, error: result.error });
        
        // Try to fix the error
        console.log(`   수정 시도 중...`);
        if (fixCommonErrors(filePath)) {
          // Re-validate after fix
          const revalidate = validateJavaScript(filePath);
          if (revalidate.valid) {
            console.log(`   ✅ 수정 완료!`);
            fixedFiles.push(relativePath);
            // Remove from errors list
            filesWithErrors.pop();
          } else {
            console.log(`   ⚠️  여전히 오류 존재: ${revalidate.error}`);
          }
        }
      }
    }
  });
}

// Start checking from js directory
if (fs.existsSync('js')) {
  checkDirectory('js');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 검증 결과 요약\n');

if (fixedFiles.length > 0) {
  console.log(`✅ 수정된 파일 (${fixedFiles.length}개):`);
  fixedFiles.forEach(file => console.log(`   - ${file}`));
  console.log('');
}

if (filesWithErrors.length > 0) {
  console.log(`❌ 여전히 오류가 있는 파일 (${filesWithErrors.length}개):`);
  filesWithErrors.forEach(({ path, error }) => {
    console.log(`\n   ${path}:`);
    console.log(`   ${error.substring(0, 100)}...`);
  });
  
  console.log('\n💡 권장사항:');
  console.log('1. 위 파일들을 수동으로 검토하세요');
  console.log('2. 중괄호 균형을 확인하세요');
  console.log('3. 세미콜론과 구문을 확인하세요');
} else {
  console.log('✨ 모든 JavaScript 파일이 유효합니다!');
}

// Special check for specific error files
console.log('\n🔧 특정 오류 파일 집중 수정...\n');

const specificFiles = [
  'js/features/fortune/zodiac-fortune.js',
  'js/features/tests/love-dna-test.js', 
  'js/features/tests/mbti-test.js',
  'js/features/tests/teto-egen-test.js',
  'js/utils/logger.js'
];

specificFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`검사 중: ${file}`);
    const result = validateJavaScript(file);
    if (!result.valid) {
      console.log(`  오류: ${result.error}`);
      
      // Read the file and show context around the error
      if (result.line) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        const errorLine = parseInt(result.line) - 1;
        
        console.log(`\n  문제 부분 (라인 ${result.line} 주변):`);
        for (let i = Math.max(0, errorLine - 2); i <= Math.min(lines.length - 1, errorLine + 2); i++) {
          const marker = i === errorLine ? ' → ' : '   ';
          console.log(`  ${marker}${i + 1}: ${lines[i]}`);
        }
      }
    } else {
      console.log(`  ✅ 유효함`);
    }
  }
});

console.log('\n완료!');