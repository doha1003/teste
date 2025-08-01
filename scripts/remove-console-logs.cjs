#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// console 문을 제거할 파일 패턴
const filePatterns = [
  'js/**/*.js',
  '!js/**/*.min.js',
  '!node_modules/**',
  '!dist/**'
];

// 제거할 console 메서드들
const consoleMethods = [
  'log', 'info', 'warn', 'error', 'debug', 
  'trace', 'table', 'time', 'timeEnd', 'group', 
  'groupEnd', 'groupCollapsed', 'dir'
];

async function findJSFiles(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // node_modules, dist 등 제외
      if (!['node_modules', 'dist', '.git', 'backup-manseryeok'].includes(entry.name)) {
        await findJSFiles(fullPath, files);
      }
    } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.min.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function removeConsoleLogs(content) {
  let modifiedContent = content;
  let removeCount = 0;
  
  // 정규식 패턴들
  const patterns = [
    // 단순 console.log() 패턴
    /console\s*\.\s*(log|info|warn|error|debug|trace|table|time|timeEnd|group|groupEnd|groupCollapsed|dir)\s*\([^)]*\)\s*;?/g,
    
    // 여러 줄에 걸친 console.log
    /console\s*\.\s*(log|info|warn|error|debug|trace|table|time|timeEnd|group|groupEnd|groupCollapsed|dir)\s*\([^)]*\n[^)]*\)\s*;?/g,
    
    // 조건부 console.log
    /if\s*\([^)]*\)\s*{\s*console\s*\.\s*(log|info|warn|error|debug|trace|table|time|timeEnd|group|groupEnd|groupCollapsed|dir)\s*\([^)]*\)\s*;?\s*}/g,
    
    // 삼항 연산자에서의 console.log
    /\?\s*console\s*\.\s*(log|info|warn|error|debug|trace|table|time|timeEnd|group|groupEnd|groupCollapsed|dir)\s*\([^)]*\)\s*:/g,
    
    // && 연산자와 함께 사용된 console.log
    /&&\s*console\s*\.\s*(log|info|warn|error|debug|trace|table|time|timeEnd|group|groupEnd|groupCollapsed|dir)\s*\([^)]*\)/g
  ];
  
  patterns.forEach(pattern => {
    const matches = modifiedContent.match(pattern);
    if (matches) {
      removeCount += matches.length;
      modifiedContent = modifiedContent.replace(pattern, '');
    }
  });
  
  // 빈 줄 정리 (연속된 빈 줄을 하나로)
  modifiedContent = modifiedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return { modifiedContent, removeCount };
}

async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const { modifiedContent, removeCount } = removeConsoleLogs(content);
    
    if (removeCount > 0) {
      // 프로덕션 환경에서만 console 제거하도록 조건부 처리
      let finalContent = modifiedContent;
      
      // 개발 환경에서는 console 유지하는 옵션 추가
      if (filePath.includes('logger') || filePath.includes('debug')) {
        // 로거나 디버그 관련 파일은 조건부로 처리
        const devCheckPrefix = "if (process.env.NODE_ENV !== 'production') {\n  ";
        const devCheckSuffix = "\n}";
        
        // 이미 조건부 처리가 되어있지 않은 경우만 추가
        if (!content.includes("process.env.NODE_ENV")) {
          console.log(`⚠️  ${path.basename(filePath)}: console 문을 조건부로 처리`);
          return { filePath, removeCount: 0, conditioned: true };
        }
      }
      
      await fs.writeFile(filePath, finalContent);
      return { filePath, removeCount };
    }
    
    return { filePath, removeCount: 0 };
  } catch (error) {
    console.error(`오류 발생 (${filePath}):`, error.message);
    return { filePath, removeCount: 0, error: true };
  }
}

async function main() {
  console.log('🧹 Console 문 제거 시작...\n');
  
  // JS 파일 찾기
  const jsDir = path.join(process.cwd(), 'js');
  const files = await findJSFiles(jsDir);
  
  console.log(`📁 검사할 파일 수: ${files.length}\n`);
  
  let totalRemoved = 0;
  let filesModified = 0;
  const results = [];
  
  // 파일 처리
  for (const file of files) {
    const result = await processFile(file);
    results.push(result);
    
    if (result.removeCount > 0) {
      totalRemoved += result.removeCount;
      filesModified++;
      console.log(`✓ ${path.relative(process.cwd(), file)}: ${result.removeCount}개 제거`);
    }
  }
  
  // 결과 요약
  console.log('\n📊 작업 완료:');
  console.log(`총 ${filesModified}개 파일에서 ${totalRemoved}개의 console 문 제거`);
  
  // 주의사항
  if (totalRemoved > 0) {
    console.log('\n⚠️  주의사항:');
    console.log('- 제거된 console 문을 복구하려면 Git을 사용하세요');
    console.log('- 일부 중요한 로그는 조건부로 유지하는 것을 권장합니다');
    console.log('- 프로덕션 빌드 도구 사용을 고려하세요 (webpack, rollup 등)');
  }
}

main().catch(console.error);