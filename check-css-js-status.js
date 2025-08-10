#!/usr/bin/env node

/**
 * doha.kr CSS/JS 상태 빠른 체크
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 doha.kr CSS/JS 구조 상태 체크\n');

// 1. CSS 클래스 중복 체크
console.log('📋 CSS 클래스 상태:');
const cssFiles = [
  'css/components/buttons.css',
  'css/design-system/linear-components.css',
  'css/core/typography.css'
];

const foundClasses = new Map();

cssFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const classMatches = content.match(/\.[a-z][a-z0-9-_]*/gi) || [];
    
    classMatches.forEach(cls => {
      if (!foundClasses.has(cls)) {
        foundClasses.set(cls, []);
      }
      foundClasses.get(cls).push(file);
    });
  }
});

// 중복 찾기
let duplicates = 0;
foundClasses.forEach((files, className) => {
  if (files.length > 1) {
    console.log(`  ⚠️  ${className} - ${files.length}개 파일에서 정의됨`);
    duplicates++;
  }
});

if (duplicates === 0) {
  console.log('  ✅ CSS 클래스 중복 없음');
}

// 2. JS 전역 변수 체크
console.log('\n📋 JS 전역 변수 상태:');
const jsFiles = [
  'js/app.js',
  'js/api-config.js',
  'js/error-handler.js'
];

const globalVars = [];

jsFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const windowMatches = content.match(/window\.[A-Z][a-zA-Z]*/g) || [];
    globalVars.push(...windowMatches);
  }
});

const uniqueGlobals = [...new Set(globalVars)];
console.log(`  📌 발견된 전역 변수: ${uniqueGlobals.length}개`);
uniqueGlobals.slice(0, 5).forEach(v => {
  console.log(`     - ${v}`);
});

// 3. z-index 사용 체크
console.log('\n📋 z-index 사용 현황:');
const zIndexUsage = new Map();

['css/core/variables.css', 'css/korean-optimization.css'].forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const zIndexMatches = content.match(/z-index:\s*\d+/g) || [];
    
    zIndexMatches.forEach(match => {
      const value = match.match(/\d+/)[0];
      if (!zIndexUsage.has(value)) {
        zIndexUsage.set(value, 0);
      }
      zIndexUsage.set(value, zIndexUsage.get(value) + 1);
    });
  }
});

const sortedZIndex = Array.from(zIndexUsage.entries()).sort((a, b) => Number(b[0]) - Number(a[0]));
console.log(`  📌 사용된 z-index 값: ${sortedZIndex.length}개`);
sortedZIndex.slice(0, 5).forEach(([value, count]) => {
  console.log(`     - z-index: ${value} (${count}회 사용)`);
});

// 4. Linear 디자인 시스템 적용 확인
console.log('\n📋 Linear 디자인 시스템 적용:');
const htmlFiles = [
  'index.html',
  'tests/mbti/index.html',
  'fortune/daily/index.html',
  'tools/bmi-calculator.html'
];

let linearUsageCount = 0;
htmlFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const linearClasses = content.match(/linear-[a-z]+/g) || [];
    if (linearClasses.length > 0) {
      console.log(`  ✅ ${path.basename(file)} - ${linearClasses.length}개 Linear 클래스 사용`);
      linearUsageCount++;
    }
  }
});

console.log(`\n📊 최종 상태:`);
console.log(`  - CSS 중복: ${duplicates > 0 ? `⚠️ ${duplicates}개` : '✅ 없음'}`);
console.log(`  - JS 전역 변수: ${uniqueGlobals.length}개`);
console.log(`  - Linear 적용: ${linearUsageCount}/${htmlFiles.length} 페이지`);

// 5. 권장사항
console.log('\n💡 권장사항:');
if (duplicates > 0) {
  console.log('  1. CSS 클래스 중복을 접두사로 구분 (legacy-, linear-, page-)');
}
if (uniqueGlobals.length > 10) {
  console.log('  2. JS 전역 변수를 DohaKR 네임스페이스로 통합');
}
if (sortedZIndex.length > 5) {
  console.log('  3. z-index를 CSS 변수로 체계화');
}

console.log('\n✨ 체크 완료!');