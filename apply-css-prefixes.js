#!/usr/bin/env node

/**
 * CSS 클래스 접두사 적용 스크립트
 * 중복된 클래스들을 체계적으로 정리
 */

import fs from 'fs';
import path from 'path';

console.log('🎨 CSS 클래스 접두사 적용 시작\n');

// 변경 규칙 정의
const renamingRules = {
  // 레거시 버튼 클래스
  'class="btn ': 'class="legacy-btn ',
  'class="btn-': 'class="legacy-btn-',
  'class=\'btn ': 'class=\'legacy-btn ',
  'class=\'btn-': 'class=\'legacy-btn-',
  
  // 레거시 카드 클래스
  'class="card ': 'class="legacy-card ',
  'class="card-': 'class="legacy-card-',
  'class=\'card ': 'class=\'legacy-card ',
  'class=\'card-': 'class=\'legacy-card-',
  
  // 페이지별 클래스
  'class="service-card': 'class="home-service-card',
  'class="test-card': 'class="page-test-card',
  'class="fortune-card': 'class="page-fortune-card',
  'class="tool-card': 'class="page-tool-card',
  
  // 중복 버튼 클래스 정리
  'class="cta-button': 'class="home-cta-button',
  'class="share-btn': 'class="feat-share-btn',
  'class="btn-tools': 'class="tool-btn',
  'class="btn-fortune': 'class="fortune-btn',
  
  // 기타 공통 클래스
  'class="app ': 'class="legacy-app ',
  'class="container ': 'class="layout-container ',
  'class="wrapper ': 'class="layout-wrapper ',
};

// CSS 파일 변경 규칙
const cssRenamingRules = {
  // 레거시 버튼
  '.btn {': '.legacy-btn {',
  '.btn-': '.legacy-btn-',
  '.btn.': '.legacy-btn.',
  '.btn:': '.legacy-btn:',
  
  // 레거시 카드
  '.card {': '.legacy-card {',
  '.card-': '.legacy-card-',
  '.card.': '.legacy-card.',
  '.card:': '.legacy-card:',
  
  // 페이지별 클래스
  '.service-card': '.home-service-card',
  '.test-card': '.page-test-card',
  '.fortune-card': '.page-fortune-card',
  '.tool-card': '.page-tool-card',
  
  // 중복 버튼
  '.cta-button': '.home-cta-button',
  '.share-btn': '.feat-share-btn',
  '.btn-tools': '.tool-btn',
  '.btn-fortune': '.fortune-btn',
  
  // 기타
  '.app {': '.legacy-app {',
  '.container {': '.layout-container {',
  '.wrapper {': '.layout-wrapper {',
};

// Linear 클래스는 건드리지 않음 (이미 접두사 있음)
const preservePatterns = [
  'linear-',
  'highlight-',
  'text-korean'
];

// 파일 처리 함수
function processFile(filePath, rules, fileType) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changesMade = 0;
    
    // 보존해야 할 패턴 체크
    const shouldPreserve = (text) => {
      return preservePatterns.some(pattern => text.includes(pattern));
    };
    
    // 규칙 적용
    Object.entries(rules).forEach(([oldPattern, newPattern]) => {
      if (!shouldPreserve(oldPattern)) {
        const regex = new RegExp(escapeRegex(oldPattern), 'g');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, newPattern);
          changesMade += matches.length;
        }
      }
    });
    
    if (changesMade > 0) {
      // 백업 생성
      const backupPath = filePath + '.backup';
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(filePath, backupPath);
      }
      
      // 변경사항 저장
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${path.basename(filePath)}: ${changesMade}개 변경`);
      return changesMade;
    } else {
      console.log(`⏭️  ${path.basename(filePath)}: 변경 없음`);
      return 0;
    }
  } catch (error) {
    console.error(`❌ ${filePath} 처리 실패:`, error.message);
    return 0;
  }
}

// 정규식 이스케이프
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// HTML 파일 처리
console.log('📄 HTML 파일 처리 중...');
const htmlFiles = [
  'index.html',
  'tests/index.html',
  'tests/mbti/index.html',
  'tests/mbti/test.html',
  'tests/teto-egen/index.html',
  'tests/teto-egen/test.html',
  'tests/love-dna/index.html',
  'fortune/index.html',
  'fortune/daily/index.html',
  'fortune/saju/index.html',
  'fortune/tarot/index.html',
  'fortune/zodiac/index.html',
  'fortune/zodiac-animal/index.html',
  'tools/index.html',
  'tools/bmi-calculator.html',
  'tools/text-counter.html',
  'tools/salary-calculator.html',
  'about/index.html',
  'contact/index.html',
  'faq/index.html',
  'privacy/index.html',
  'terms/index.html',
  'offline.html',
  '404.html'
];

let totalHtmlChanges = 0;
htmlFiles.forEach(file => {
  if (fs.existsSync(file)) {
    totalHtmlChanges += processFile(file, renamingRules, 'HTML');
  }
});

// CSS 파일 처리
console.log('\n📄 CSS 파일 처리 중...');
const cssFiles = [
  'css/components/buttons.css',
  'css/components/cards.css',
  'css/core/typography.css',
  'css/pages/home.css',
  'css/pages/fortune.css',
  'css/pages/tests-index.css',
  'css/features/test-common.css',
  'css/features/fortune-common.css',
  'css/features/tool-common.css'
];

let totalCssChanges = 0;
cssFiles.forEach(file => {
  if (fs.existsSync(file)) {
    totalCssChanges += processFile(file, cssRenamingRules, 'CSS');
  }
});

// CSS 번들 재생성 알림
console.log('\n📦 CSS 번들 재생성 필요');
console.log('  다음 명령어를 실행하세요:');
console.log('  npm run build:css');

// 결과 요약
console.log('\n📊 작업 완료 요약:');
console.log(`  - HTML 파일: ${totalHtmlChanges}개 변경`);
console.log(`  - CSS 파일: ${totalCssChanges}개 변경`);
console.log(`  - 백업 파일 생성됨 (.backup)`);

// 권장사항
console.log('\n💡 다음 단계:');
console.log('  1. 브라우저에서 페이지 확인');
console.log('  2. CSS 번들 재생성: npm run build:css');
console.log('  3. 문제 발생시 백업 파일로 복구');

console.log('\n✨ 접두사 적용 완료!');

// 클래스 매핑 문서 생성
const mappingDoc = `
# CSS 클래스 접두사 매핑 가이드

## 변경된 클래스 매핑

### 레거시 클래스
- \`.btn\` → \`.legacy-btn\`
- \`.card\` → \`.legacy-card\`
- \`.app\` → \`.legacy-app\`
- \`.container\` → \`.layout-container\`
- \`.wrapper\` → \`.layout-wrapper\`

### 페이지별 클래스
- \`.service-card\` → \`.home-service-card\`
- \`.test-card\` → \`.page-test-card\`
- \`.fortune-card\` → \`.page-fortune-card\`
- \`.tool-card\` → \`.page-tool-card\`

### 기능별 클래스
- \`.cta-button\` → \`.home-cta-button\`
- \`.share-btn\` → \`.feat-share-btn\`
- \`.btn-tools\` → \`.tool-btn\`
- \`.btn-fortune\` → \`.fortune-btn\`

### 유지된 클래스 (Linear 시스템)
- \`.linear-button\`
- \`.linear-card\`
- \`.linear-input\`
- \`.highlight-*\`
- \`.text-korean\`

## 복구 방법
모든 파일은 \`.backup\` 확장자로 백업되어 있습니다.
문제 발생시 백업 파일을 원본으로 복구하세요.

생성일: ${new Date().toISOString()}
`;

fs.writeFileSync('css-prefix-mapping.md', mappingDoc);
console.log('\n📝 매핑 문서 생성: css-prefix-mapping.md');