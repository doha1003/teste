/**
 * Linear 시스템 마이그레이션 후 중복 클래스 정리 도구
 * 자동화 과정에서 생성된 중복 클래스들을 정리
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 중복 클래스 정리 규칙
 */
const CLEANUP_RULES = [
  // 중복된 linear- 접두사 제거
  [/linear-linear-/g, 'linear-'],

  // 중복된 text-korean 제거
  [/text-korean\s+text-korean/g, 'text-korean'],

  // 중복된 highlight 패턴 제거
  [
    /highlight-([a-z]+)\s+highlight-korean\s+([a-z]+)\s+highlight-([a-z]+)\s+highlight-korean\s+([a-z]+)/g,
    'highlight-$1 highlight-korean $2',
  ],

  // 기타 중복 패턴들
  [/linear-button\s+linear-button/g, 'linear-button'],
  [/linear-card\s+linear-card/g, 'linear-card'],
  [/linear-input\s+linear-input/g, 'linear-input'],
  [/linear-badge\s+linear-badge/g, 'linear-badge'],

  // 공백 정리
  [/\s{2,}/g, ' '],
  [/class="\s+/g, 'class="'],
  [/\s+"/g, '"'],
];

/**
 * HTML 파일의 중복 클래스들을 정리
 * @param {string} htmlContent - HTML 파일 내용
 * @param {string} filePath - 파일 경로 (로깅용)
 * @returns {string} - 정리된 HTML 내용
 */
function cleanupDuplicateClasses(htmlContent, filePath = '') {
  let cleanedContent = htmlContent;
  let changeCount = 0;
  const changes = [];

  console.log(`\n🧹 Cleaning: ${filePath}`);

  // 각 정리 규칙 적용
  CLEANUP_RULES.forEach(([regex, replacement], index) => {
    const matches = cleanedContent.match(regex);

    if (matches) {
      cleanedContent = cleanedContent.replace(regex, replacement);
      changeCount += matches.length;
      changes.push(`  ✅ Rule ${index + 1}: ${matches.length} duplicates cleaned`);
    }
  });

  // 결과 출력
  if (changes.length > 0) {
    console.log(`  📊 Total cleanups: ${changeCount}`);
    changes.forEach((change) => console.log(change));
  } else {
    console.log(`  ✨ Already clean`);
  }

  return cleanedContent;
}

/**
 * 디렉토리의 모든 HTML 파일을 재귀적으로 정리
 * @param {string} dirPath - 디렉토리 경로
 * @param {string[]} excludePaths - 제외할 경로들
 * @returns {Object} - 처리 결과 통계
 */
function cleanupDirectory(dirPath, excludePaths = []) {
  const stats = {
    processedFiles: 0,
    modifiedFiles: 0,
    totalChanges: 0,
    errors: [],
  };

  function processDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);

    items.forEach((item) => {
      const fullPath = path.join(currentPath, item);
      const relativePath = path.relative(dirPath, fullPath);

      // 제외 경로 확인
      if (excludePaths.some((excludePath) => relativePath.startsWith(excludePath))) {
        return;
      }

      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (path.extname(fullPath) === '.html') {
        try {
          const originalContent = fs.readFileSync(fullPath, 'utf8');
          const cleanedContent = cleanupDuplicateClasses(originalContent, relativePath);

          stats.processedFiles++;

          if (originalContent !== cleanedContent) {
            fs.writeFileSync(fullPath, cleanedContent, 'utf8');
            stats.modifiedFiles++;
            console.log(`  ✅ Cleaned: ${relativePath}`);
          }
        } catch (error) {
          stats.errors.push(`Error processing ${relativePath}: ${error.message}`);
          console.error(`❌ Error processing ${relativePath}:`, error.message);
        }
      }
    });
  }

  processDirectory(dirPath);
  return stats;
}

/**
 * 메인 실행 함수
 */
function main() {
  console.log('🧹 Linear System Cleanup Tool');
  console.log('============================\n');

  const projectRoot = path.resolve(__dirname, '..');
  const excludePaths = [
    'node_modules',
    'design-system/node_modules',
    '.git',
    'playwright-report',
    'test-reports',
    'coverage',
    'dist',
    '.backup',
  ];

  const stats = cleanupDirectory(projectRoot, excludePaths);

  // 통계 출력
  console.log('\n📊 Cleanup Complete!');
  console.log('====================');
  console.log(`📄 Files processed: ${stats.processedFiles}`);
  console.log(`✏️  Files modified: ${stats.modifiedFiles}`);
  console.log(`❌ Errors: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    stats.errors.forEach((error) => console.log(`  ${error}`));
  }

  console.log('\n✨ Linear System cleanup completed successfully!');
}

// 스크립트 실행
main();

export { cleanupDuplicateClasses, cleanupDirectory };
