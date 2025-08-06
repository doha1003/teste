#!/usr/bin/env node

/**
 * CSS/JS 중복 파일 정리 스크립트
 * doha.kr 코드베이스 최적화를 위한 자동화 도구
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 doha.kr 코드 정리 시작...\n');

// 삭제할 파일 패턴들
const CLEANUP_PATTERNS = {
  // 중복된 압축 CSS 파일들 (원본이 있으므로 안전하게 제거 가능)
  minifiedCSS: [
    'css/**/*.min.css'
  ],
  
  // 중복된 번들 파일들 (최신 버전만 유지)
  duplicatedBundles: [
    'dist/styles.final.css',
    'dist/styles.optimized.css', 
    'dist/styles.phase7.css',
    'dist/styles.ultra.css'
  ],
  
  // 임시 파일들
  tempFiles: [
    '**/*.tmp',
    '**/*.bak',
    '**/.*~'
  ]
};

// 통계 추적
let stats = {
  deletedFiles: 0,
  savedBytes: 0,
  processedDirs: 0
};

/**
 * 파일 크기 가져오기
 */
function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (err) {
    return 0;
  }
}

/**
 * 파일 삭제 (안전하게)
 */
function safeDelete(filePath) {
  try {
    const size = getFileSize(filePath);
    fs.unlinkSync(filePath);
    stats.deletedFiles++;
    stats.savedBytes += size;
    console.log(`  ✅ 삭제: ${path.relative(process.cwd(), filePath)} (${Math.round(size/1024)}KB)`);
    return true;
  } catch (err) {
    console.log(`  ❌ 삭제 실패: ${filePath} - ${err.message}`);
    return false;
  }
}

/**
 * 글로브 패턴으로 파일 찾기
 */
function findFiles(pattern, baseDir = process.cwd()) {
  try {
    // Windows에서 파일 경로 이스케이프 처리
    const escapedPattern = pattern.replace(/\\/g, '/');
    const command = `find "${baseDir}" -name "${escapedPattern.split('/').pop()}" -type f 2>/dev/null || echo ""`;
    const result = execSync(command, { encoding: 'utf8' }).trim();
    
    if (!result) return [];
    
    return result.split('\n').filter(line => {
      if (!line.trim()) return false;
      
      // 패턴 매칭 검증
      const relativePath = path.relative(baseDir, line).replace(/\\/g, '/');
      return relativePath.includes(escapedPattern.replace('**/', '').replace('*', ''));
    });
  } catch (err) {
    console.log(`패턴 검색 실패: ${pattern} - ${err.message}`);
    return [];
  }
}

/**
 * 중복 CSS 파일 제거
 */
function cleanupMinifiedCSS() {
  console.log('📂 중복된 압축 CSS 파일 제거 중...');
  
  const minFiles = findFiles('*.min.css', path.join(process.cwd(), 'css'));
  console.log(`발견된 .min.css 파일: ${minFiles.length}개`);
  
  minFiles.forEach(filePath => {
    // 원본 파일이 존재하는지 확인
    const originalPath = filePath.replace('.min.css', '.css');
    if (fs.existsSync(originalPath)) {
      safeDelete(filePath);
    } else {
      console.log(`  ⚠️  보존: ${path.relative(process.cwd(), filePath)} (원본 없음)`);
    }
  });
}

/**
 * 중복 번들 파일 제거
 */
function cleanupDuplicatedBundles() {
  console.log('\n📂 중복된 번들 파일 제거 중...');
  
  CLEANUP_PATTERNS.duplicatedBundles.forEach(pattern => {
    const filePath = path.join(process.cwd(), pattern);
    if (fs.existsSync(filePath)) {
      safeDelete(filePath);
    }
  });
}

/**
 * 빈 디렉토리 제거
 */
function cleanupEmptyDirectories() {
  console.log('\n📂 빈 디렉토리 제거 중...');
  
  function removeEmptyDirs(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      
      if (files.length === 0) {
        fs.rmdirSync(dirPath);
        console.log(`  ✅ 빈 디렉토리 삭제: ${path.relative(process.cwd(), dirPath)}`);
        return true;
      }
      
      // 하위 디렉토리 재귀 처리
      let hasContent = false;
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!removeEmptyDirs(fullPath)) {
            hasContent = true;
          }
        } else {
          hasContent = true;
        }
      });
      
      // 모든 하위 디렉토리가 제거되었다면 현재 디렉토리도 제거
      if (!hasContent) {
        fs.rmdirSync(dirPath);
        console.log(`  ✅ 빈 디렉토리 삭제: ${path.relative(process.cwd(), dirPath)}`);
        return true;
      }
      
      return false;
    } catch (err) {
      return false;
    }
  }
  
  // css 디렉토리 하위만 체크
  const cssDir = path.join(process.cwd(), 'css');
  if (fs.existsSync(cssDir)) {
    const subdirs = fs.readdirSync(cssDir).filter(item => {
      return fs.statSync(path.join(cssDir, item)).isDirectory();
    });
    
    subdirs.forEach(subdir => {
      removeEmptyDirs(path.join(cssDir, subdir));
    });
  }
}

/**
 * CSS 파일에서 !important 사용량 체크
 */
function analyzeImportantUsage() {
  console.log('\n📊 !important 사용량 분석 중...');
  
  const cssFiles = findFiles('*.css', path.join(process.cwd(), 'css'));
  let totalImportant = 0;
  let filesWithImportant = 0;
  
  cssFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const importantCount = (content.match(/!important/g) || []).length;
      
      if (importantCount > 0) {
        filesWithImportant++;
        totalImportant += importantCount;
        
        if (importantCount > 5) {
          console.log(`  ⚠️  ${path.relative(process.cwd(), filePath)}: ${importantCount}개`);
        }
      }
    } catch (err) {
      // 파일 읽기 실패는 무시
    }
  });
  
  console.log(`  📈 총 !important 사용: ${totalImportant}개 (${filesWithImportant}개 파일)`);
  if (totalImportant > 50) {
    console.log(`  💡 권장: !important 사용을 ${Math.floor(totalImportant * 0.7)}개 이하로 줄이세요`);
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const startTime = Date.now();
  
  try {
    // 1단계: 중복 파일 제거
    cleanupMinifiedCSS();
    cleanupDuplicatedBundles();
    
    // 2단계: 빈 디렉토리 정리
    cleanupEmptyDirectories();
    
    // 3단계: 코드 품질 분석
    analyzeImportantUsage();
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n✨ 정리 완료!');
    console.log(`📊 통계:`);
    console.log(`  - 삭제된 파일: ${stats.deletedFiles}개`);
    console.log(`  - 절약된 공간: ${Math.round(stats.savedBytes / 1024 / 1024 * 100) / 100}MB`);
    console.log(`  - 소요 시간: ${duration}초`);
    
    if (stats.deletedFiles > 0) {
      console.log('\n💡 다음 단계:');
      console.log('  1. git status로 변경사항 확인');
      console.log('  2. npm run test로 기능 테스트');
      console.log('  3. git commit으로 변경사항 저장');
    }
    
  } catch (err) {
    console.error('❌ 정리 중 오류 발생:', err.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { main, stats };