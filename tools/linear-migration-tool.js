/**
 * Linear 디자인 시스템 마이그레이션 도구
 * doha.kr 프로젝트의 모든 HTML 페이지를 Linear 시스템으로 전환
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 클래스 매핑 테이블
 * 기존 클래스 → Linear 클래스
 */
const CLASS_MAPPINGS = {
  // 버튼 시스템
  'btn btn-primary': 'linear-button linear-button--primary text-korean',
  'btn btn-secondary': 'linear-button linear-button--secondary text-korean',
  'btn btn-outline': 'linear-button linear-button--outline text-korean',
  'btn btn-ghost': 'linear-button linear-button--ghost text-korean',
  'btn btn-danger': 'linear-button linear-button--danger text-korean',
  'btn btn-lg': 'linear-button linear-button--large text-korean',
  'btn btn-sm': 'linear-button linear-button--small text-korean',
  'btn btn--primary': 'linear-button linear-button--primary text-korean',
  'btn btn--secondary': 'linear-button linear-button--secondary text-korean',
  'btn btn--ghost': 'linear-button linear-button--ghost text-korean',
  'tab-button': 'linear-button linear-button--tab text-korean',
  'cta-button': 'linear-button linear-button--primary linear-button--large text-korean',
  
  // 카드 시스템
  'service-card': 'linear-card service-card',
  'feature-card': 'linear-card feature-card',
  'result-card': 'linear-card result-card',
  'test-card': 'linear-card test-card',
  'tool-card': 'linear-card tool-card',
  'fortune-card': 'linear-card fortune-card',
  'info-card': 'linear-card info-card',
  'card': 'linear-card',
  
  // 입력 필드
  'form-control': 'linear-input text-korean',
  'form-input': 'linear-input text-korean',
  'form-select': 'linear-select text-korean',
  'form-textarea': 'linear-textarea text-korean',
  'input': 'linear-input text-korean',
  'select': 'linear-select text-korean',
  'textarea': 'linear-textarea text-korean',
  
  // 알림 시스템
  'alert': 'linear-alert',
  'alert-success': 'linear-alert linear-alert--success',
  'alert-warning': 'linear-alert linear-alert--warning',
  'alert-danger': 'linear-alert linear-alert--danger',
  'alert-info': 'linear-alert linear-alert--info',
  
  // 배지 시스템
  'badge': 'linear-badge',
  'service-badge': 'linear-badge linear-badge--popular',
  'service-badge fortune-gradient': 'linear-badge linear-badge--popular',
  'service-badge new-pink': 'linear-badge linear-badge--new',
  'service-badge new-green': 'linear-badge linear-badge--new',
  'new-badge': 'linear-badge linear-badge--new',
  'hot-badge': 'linear-badge linear-badge--hot',
  'popular-badge': 'linear-badge linear-badge--popular',
  
  // 아이콘 시스템
  'service-emoji': 'service-emoji icon',
  'feature-icon': 'feature-icon icon',
  'tool-icon': 'tool-icon icon',
  'test-icon': 'test-icon icon',
  'result-icon': 'result-icon icon',
  'btn-icon': 'icon',
  
  // 타이포그래피 (한국어 최적화)
  'service-name': 'service-name text-subheading text-korean',
  'service-desc': 'service-desc text-body text-korean',
  'feature-title': 'feature-title text-heading-3 text-korean',
  'feature-description': 'feature-description text-body text-korean',
  'test-title': 'test-title text-heading-2 text-korean',
  'test-description': 'test-description text-body text-korean',
  'result-title': 'result-title text-heading-2 text-korean',
  'result-text': 'result-text text-body text-korean',
  'tool-title': 'tool-title text-heading-2 text-korean',
  'tool-description': 'tool-description text-body text-korean',
  'page-title': 'page-title text-heading-1 text-korean',
  'section-title': 'section-title text-heading-2 text-korean',
  'section-subtitle': 'section-subtitle text-subheading text-korean',
};

/**
 * 한국어 텍스트가 있는 요소에 자동으로 text-korean 클래스 추가
 */
const KOREAN_TEXT_PATTERNS = [
  // 한글이 포함된 텍스트 요소들
  { tag: 'h1', hasKorean: true, addClass: 'text-heading-1 text-korean' },
  { tag: 'h2', hasKorean: true, addClass: 'text-heading-2 text-korean' },
  { tag: 'h3', hasKorean: true, addClass: 'text-heading-3 text-korean' },
  { tag: 'h4', hasKorean: true, addClass: 'text-subheading text-korean' },
  { tag: 'h5', hasKorean: true, addClass: 'text-subheading text-korean' },
  { tag: 'h6', hasKorean: true, addClass: 'text-label text-korean' },
  { tag: 'p', hasKorean: true, addClass: 'text-body text-korean' },
  { tag: 'span', hasKorean: true, addClass: 'text-korean' },
  { tag: 'div', hasKorean: true, addClass: 'text-korean' },
  { tag: 'label', hasKorean: true, addClass: 'text-label text-korean' },
  { tag: 'button', hasKorean: true, addClass: 'text-korean' },
  { tag: 'a', hasKorean: true, addClass: 'text-korean' },
];

/**
 * 하이라이터 패턴 추가 규칙
 */
const HIGHLIGHTER_PATTERNS = {
  'feature-title': 'highlight-dots highlight-korean subtle',
  'service-name': 'highlight-grid highlight-korean subtle',
  'test-title': 'highlight-diagonal highlight-korean animated',
  'result-title': 'highlight-noise highlight-korean subtle',
  'hero-title-highlight': 'highlight-diagonal highlight-korean animated',
  'cta-title': 'highlight-geometric highlight-korean animated',
};

/**
 * HTML 파일의 클래스를 Linear 시스템으로 변환
 * @param {string} htmlContent - HTML 파일 내용
 * @param {string} filePath - 파일 경로 (로깅용)
 * @returns {string} - 변환된 HTML 내용
 */
function migrateHtmlToLinear(htmlContent, filePath = '') {
  let modifiedContent = htmlContent;
  let changeCount = 0;
  const changes = [];

  console.log(`\n🔄 Processing: ${filePath}`);

  // 1. 클래스 매핑 적용
  Object.entries(CLASS_MAPPINGS).forEach(([oldClass, newClass]) => {
    const regex = new RegExp(`class="${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
    const matches = modifiedContent.match(regex);
    
    if (matches) {
      modifiedContent = modifiedContent.replace(regex, `class="${newClass}"`);
      changeCount += matches.length;
      changes.push(`  ✅ ${oldClass} → ${newClass} (${matches.length}x)`);
    }
  });

  // 2. 부분 클래스 매핑 (더 복잡한 패턴)
  const partialMappings = [
    // btn이 포함된 클래스들
    [/class="([^"]*\b)btn(\b[^"]*)"/g, (match, prefix, suffix) => {
      if (prefix.includes('linear-button')) return match; // 이미 변환된 경우 스킵
      const newClass = `${prefix}linear-button${suffix} text-korean`.trim();
      changeCount++;
      changes.push(`  🔄 btn pattern: ${match} → class="${newClass}"`);
      return `class="${newClass}"`;
    }],
    
    // card가 포함된 클래스들
    [/class="([^"]*\b)card(\b[^"]*)"/g, (match, prefix, suffix) => {
      if (prefix.includes('linear-card')) return match;
      const newClass = `${prefix}linear-card${suffix}`.trim();
      changeCount++;
      changes.push(`  🔄 card pattern: ${match} → class="${newClass}"`);
      return `class="${newClass}"`;
    }],
  ];

  partialMappings.forEach(([regex, replacer]) => {
    modifiedContent = modifiedContent.replace(regex, replacer);
  });

  // 3. 한국어 텍스트 최적화 (기본적인 한글 감지)
  const koreanTextRegex = />[^<]*[가-힣][^<]*</g;
  const koreanMatches = modifiedContent.match(koreanTextRegex);
  
  if (koreanMatches) {
    console.log(`  🇰🇷 Korean text detected: ${koreanMatches.length} instances`);
  }

  // 4. 하이라이터 패턴 추가
  Object.entries(HIGHLIGHTER_PATTERNS).forEach(([className, highlighterClass]) => {
    const regex = new RegExp(`class="([^"]*\\b)${className}(\\b[^"]*)"`, 'g');
    const replacement = `class="$1${className}$2 ${highlighterClass}"`;
    
    if (modifiedContent.match(regex)) {
      modifiedContent = modifiedContent.replace(regex, replacement);
      changes.push(`  ✨ Added highlighter: ${className} + ${highlighterClass}`);
      changeCount++;
    }
  });

  // 결과 출력
  if (changes.length > 0) {
    console.log(`  📊 Total changes: ${changeCount}`);
    changes.slice(0, 10).forEach(change => console.log(change)); // 최대 10개만 표시
    if (changes.length > 10) {
      console.log(`  ... and ${changes.length - 10} more changes`);
    }
  } else {
    console.log(`  ⏭️  No changes needed`);
  }

  return modifiedContent;
}

/**
 * 디렉토리의 모든 HTML 파일을 재귀적으로 처리
 * @param {string} dirPath - 디렉토리 경로
 * @param {string[]} excludePaths - 제외할 경로들
 * @returns {Object} - 처리 결과 통계
 */
function migrateDirectory(dirPath, excludePaths = []) {
  const stats = {
    processedFiles: 0,
    modifiedFiles: 0,
    totalChanges: 0,
    errors: []
  };

  function processDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const relativePath = path.relative(dirPath, fullPath);
      
      // 제외 경로 확인
      if (excludePaths.some(excludePath => relativePath.startsWith(excludePath))) {
        console.log(`⏭️  Skipping excluded: ${relativePath}`);
        return;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (path.extname(fullPath) === '.html') {
        try {
          const originalContent = fs.readFileSync(fullPath, 'utf8');
          const modifiedContent = migrateHtmlToLinear(originalContent, relativePath);
          
          stats.processedFiles++;
          
          if (originalContent !== modifiedContent) {
            fs.writeFileSync(fullPath, modifiedContent, 'utf8');
            stats.modifiedFiles++;
            console.log(`  ✅ Modified: ${relativePath}`);
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
 * 특정 HTML 파일들만 처리
 * @param {string[]} filePaths - 처리할 파일 경로들
 * @returns {Object} - 처리 결과 통계
 */
function migrateSpecificFiles(filePaths) {
  const stats = {
    processedFiles: 0,
    modifiedFiles: 0,
    totalChanges: 0,
    errors: []
  };

  filePaths.forEach(filePath => {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return;
      }

      const originalContent = fs.readFileSync(filePath, 'utf8');
      const modifiedContent = migrateHtmlToLinear(originalContent, filePath);
      
      stats.processedFiles++;
      
      if (originalContent !== modifiedContent) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        stats.modifiedFiles++;
        console.log(`✅ Modified: ${filePath}`);
      }
    } catch (error) {
      stats.errors.push(`Error processing ${filePath}: ${error.message}`);
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });

  return stats;
}

/**
 * 메인 실행 함수
 */
function main() {
  console.log('🚀 Linear Design System Migration Tool');
  console.log('=====================================\n');

  const projectRoot = path.resolve(__dirname, '..');
  const excludePaths = [
    'node_modules',
    'design-system/node_modules',
    '.git',
    'playwright-report',
    'test-reports',
    'coverage',
    'dist'
  ];

  // 주요 페이지들 우선 처리
  const majorPages = [
    path.join(projectRoot, 'tests/mbti/index.html'),
    path.join(projectRoot, 'tests/teto-egen/index.html'),
    path.join(projectRoot, 'tests/love-dna/index.html'),
    path.join(projectRoot, 'tools/bmi-calculator.html'),
    path.join(projectRoot, 'tools/salary-calculator.html'),
    path.join(projectRoot, 'tools/text-counter.html'),
    path.join(projectRoot, 'fortune/daily/index.html'),
    path.join(projectRoot, 'fortune/saju/index.html'),
    path.join(projectRoot, 'fortune/tarot/index.html'),
    path.join(projectRoot, 'about/index.html'),
    path.join(projectRoot, 'contact/index.html'),
    path.join(projectRoot, 'faq/index.html'),
  ];

  console.log('📝 Phase 1: Processing Major Pages');
  console.log('==================================');
  const majorStats = migrateSpecificFiles(majorPages);

  console.log('\n📁 Phase 2: Processing All Remaining Files');
  console.log('==========================================');
  const allStats = migrateDirectory(projectRoot, excludePaths);

  // 통계 출력
  console.log('\n📊 Migration Complete!');
  console.log('=====================');
  console.log(`📄 Total files processed: ${majorStats.processedFiles + allStats.processedFiles}`);
  console.log(`✏️  Files modified: ${majorStats.modifiedFiles + allStats.modifiedFiles}`);
  console.log(`❌ Errors: ${majorStats.errors.length + allStats.errors.length}`);

  if (majorStats.errors.length + allStats.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    [...majorStats.errors, ...allStats.errors].forEach(error => console.log(`  ${error}`));
  }

  console.log('\n🎉 Linear Design System migration completed successfully!');
}

// 스크립트 실행
main();

export {
  migrateHtmlToLinear,
  migrateDirectory,
  migrateSpecificFiles,
  CLASS_MAPPINGS,
  KOREAN_TEXT_PATTERNS,
  HIGHLIGHTER_PATTERNS
};