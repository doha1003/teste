/**
 * CSS 클래스명 복구 스크립트
 *
 * 문제: HTML 파일들의 CSS 클래스명이 잘못된 프리픽스로 변경됨
 * - dh-l- (layout prefix) → 제거
 * - dh-c- (component prefix) → 제거
 * - dh-u- (utility prefix) → 제거
 * - dh-state- → 제거
 * - linear-dh-c- → linear- 또는 해당 클래스로 복구
 * - 복합 클래스명 패턴도 수정
 *
 * 해결: 원래 클래스명으로 복구
 */

const fs = require('fs');
const path = require('path');

// glob 모듈이 없으면 기본 파일 시스템으로 처리
let glob;
try {
  glob = require('glob');
} catch (error) {
  console.log('glob 패키지가 없어서 기본 파일 시스템을 사용합니다.');
  glob = null;
}

// 클래스명 매핑 룰 정의
const classNameMappings = [
  // Layout 프리픽스 제거
  { pattern: /\bdh-l-footer\b/g, replacement: 'footer' },
  { pattern: /\bdh-l-header\b/g, replacement: 'header' },
  { pattern: /\bdh-l-section\b/g, replacement: 'section' },
  { pattern: /\bdh-l-content\b/g, replacement: 'content' },
  { pattern: /\bdh-l-main\b/g, replacement: 'main' },
  { pattern: /\bdh-l-grid\b/g, replacement: 'grid' },
  { pattern: /\bdh-l-wrapper\b/g, replacement: 'wrapper' },
  { pattern: /\bdh-l-container\b/g, replacement: 'container' },
  { pattern: /\bdh-l-flex\b/g, replacement: 'flex' },

  // Component 프리픽스 제거
  { pattern: /\bdh-c-card\b/g, replacement: 'card' },
  { pattern: /\bdh-c-btn\b/g, replacement: 'btn' },
  { pattern: /\bdh-c-button\b/g, replacement: 'button' },
  { pattern: /\bdh-c-form\b/g, replacement: 'form' },
  { pattern: /\bdh-c-modal\b/g, replacement: 'modal' },
  { pattern: /\bdh-c-nav\b/g, replacement: 'nav' },
  { pattern: /\bdh-c-menu\b/g, replacement: 'menu' },

  // State 프리픽스 제거
  { pattern: /\bdh-state-active\b/g, replacement: 'active' },
  { pattern: /\bdh-state-hidden\b/g, replacement: 'hidden' },
  { pattern: /\bdh-state-disabled\b/g, replacement: 'disabled' },
  { pattern: /\bdh-state-loading\b/g, replacement: 'loading' },

  // Utility 프리픽스 제거
  { pattern: /\bdh-u-hidden\b/g, replacement: 'hidden' },
  { pattern: /\bdh-u-visible\b/g, replacement: 'visible' },
  { pattern: /\bdh-u-center\b/g, replacement: 'center' },
  { pattern: /\bdh-u-left\b/g, replacement: 'left' },
  { pattern: /\bdh-u-right\b/g, replacement: 'right' },

  // 복합 패턴들
  { pattern: /\bpage-dh-l-header\b/g, replacement: 'page-header' },
  { pattern: /\bpage-dh-l-main\b/g, replacement: 'page-main' },
  { pattern: /\bpage-dh-l-footer\b/g, replacement: 'page-footer' },
  { pattern: /\bpage-dh-l-section\b/g, replacement: 'page-section' },
  { pattern: /\bpage-dh-l-content\b/g, replacement: 'page-content' },

  // 특정 컴포넌트 패턴
  { pattern: /\bhero-dh-l-content\b/g, replacement: 'hero-content' },
  { pattern: /\bnavbar-dh-l-flex\b/g, replacement: 'navbar-flex' },
  { pattern: /\bnav-dh-l-flex\b/g, replacement: 'nav-flex' },
  { pattern: /\bfeatures-dh-l-grid\b/g, replacement: 'features-grid' },
  { pattern: /\bservices-dh-l-grid\b/g, replacement: 'services-grid' },
  { pattern: /\bstats-dh-l-grid\b/g, replacement: 'stats-grid' },
  { pattern: /\btools-dh-l-grid\b/g, replacement: 'tools-grid' },
  { pattern: /\btools-dh-l-section\b/g, replacement: 'tools-section' },
  { pattern: /\btypes-dh-l-grid\b/g, replacement: 'types-grid' },
  { pattern: /\bdimensions-dh-l-grid\b/g, replacement: 'dimensions-grid' },
  { pattern: /\bcognitive-dh-l-grid\b/g, replacement: 'cognitive-grid' },

  // Linear 컴포넌트 패턴 수정
  { pattern: /\blinear-dh-c-button\b/g, replacement: 'linear-button' },
  { pattern: /\blinear-dh-c-card\b/g, replacement: 'linear-card' },
  { pattern: /\bmobile-menu-linear-dh-c-button\b/g, replacement: 'mobile-menu-linear-button' },
  { pattern: /\btest-start-linear-dh-c-button\b/g, replacement: 'test-start-linear-button' },
  { pattern: /\bcta-linear-dh-c-button-primary\b/g, replacement: 'cta-linear-button-primary' },
  { pattern: /\bcta-linear-dh-c-button-secondary\b/g, replacement: 'cta-linear-button-secondary' },
  { pattern: /\blinear-dh-c-button--primary\b/g, replacement: 'linear-button--primary' },
  { pattern: /\blinear-dh-c-button--secondary\b/g, replacement: 'linear-button--secondary' },
  { pattern: /\blinear-dh-c-button--tab\b/g, replacement: 'linear-button--tab' },
  { pattern: /\blinear-dh-c-button--large\b/g, replacement: 'linear-button--large' },
  { pattern: /\blinear-dh-c-button-text\b/g, replacement: 'linear-button-text' },

  // 특수 컴포넌트 패턴들
  { pattern: /\bservice-dh-c-card\b/g, replacement: 'service-card' },
  { pattern: /\bfeature-dh-c-card\b/g, replacement: 'feature-card' },
  { pattern: /\btool-linear-dh-c-card\b/g, replacement: 'tool-linear-card' },
  { pattern: /\btype-linear-dh-c-card\b/g, replacement: 'type-linear-card' },
  { pattern: /\bdimension-linear-dh-c-card\b/g, replacement: 'dimension-linear-card' },
  { pattern: /\bfunction-linear-dh-c-card\b/g, replacement: 'function-linear-card' },
  { pattern: /\bstat-linear-dh-c-card\b/g, replacement: 'stat-linear-card' },

  // Footer 관련 패턴들
  { pattern: /\bdh-l-footer-dh-l-content\b/g, replacement: 'footer-content' },
  { pattern: /\bdh-l-footer-dh-l-section\b/g, replacement: 'footer-section' },
  { pattern: /\bfooter-dh-l-section\b/g, replacement: 'footer-section' },
  { pattern: /\bdh-l-footer-brand\b/g, replacement: 'footer-brand' },
  { pattern: /\bdh-l-footer-services\b/g, replacement: 'footer-services' },
  { pattern: /\bdh-l-footer-popular\b/g, replacement: 'footer-popular' },
  { pattern: /\bdh-l-footer-support\b/g, replacement: 'footer-support' },
  { pattern: /\bdh-l-footer-links\b/g, replacement: 'footer-links' },
  { pattern: /\bdh-l-footer-social\b/g, replacement: 'footer-social' },
  { pattern: /\bdh-l-footer-bottom\b/g, replacement: 'footer-bottom' },
  { pattern: /\bdh-l-footer-legal\b/g, replacement: 'footer-legal' },
  { pattern: /\bdh-l-footer-description\b/g, replacement: 'footer-description' },

  // Header 관련 패턴들
  { pattern: /\bdh-l-header-dh-l-content\b/g, replacement: 'header-content' },
  { pattern: /\bdh-l-header-title\b/g, replacement: 'header-title' },
  { pattern: /\bdh-l-header-subtitle\b/g, replacement: 'header-subtitle' },

  // 섹션 타이틀 패턴들
  { pattern: /\bdh-l-section-title\b/g, replacement: 'section-title' },
  { pattern: /\bdh-l-section-subtitle\b/g, replacement: 'section-subtitle' },

  // 콘텐츠 래퍼 패턴들
  { pattern: /\bdh-l-content-dh-l-wrapper\b/g, replacement: 'content-wrapper' },

  // PWA 관련 패턴들
  { pattern: /\bpwa-install-dh-l-section\b/g, replacement: 'pwa-install-section' },
  { pattern: /\bpwa-install-linear-dh-c-card\b/g, replacement: 'pwa-install-linear-card' },
  { pattern: /\bpwa-install-dh-l-content\b/g, replacement: 'pwa-install-content' },
  { pattern: /\bpwa-install-dh-c-button\b/g, replacement: 'pwa-install-button' },
  { pattern: /\bpwa-close-dh-c-button\b/g, replacement: 'pwa-close-button' },

  // 하이라이트 관련 패턴들
  { pattern: /\bhighlight-dh-l-grid\b/g, replacement: 'highlight-grid' },

  // 버튼 관련 패턴들
  { pattern: /\btool-dh-c-button\b/g, replacement: 'tool-button' },

  // 가이드 관련 패턴들
  { pattern: /\btool-guide-dh-l-content\b/g, replacement: 'tool-guide-content' },
  { pattern: /\btool-guide-dh-l-section-title\b/g, replacement: 'tool-guide-section-title' },

  // 기타 남은 dh- 프리픽스들 일반적으로 제거
  { pattern: /\bdh-l-([a-zA-Z0-9-]+)\b/g, replacement: '$1' },
  { pattern: /\bdh-c-([a-zA-Z0-9-]+)\b/g, replacement: '$1' },
  { pattern: /\bdh-u-([a-zA-Z0-9-]+)\b/g, replacement: '$1' },
  { pattern: /\bdh-state-([a-zA-Z0-9-]+)\b/g, replacement: '$1' },

  // visually-hidden 패턴 수정
  { pattern: /\bvisually-dh-u-hidden\b/g, replacement: 'visually-hidden' },
];

// HTML 파일 찾기 패턴
const htmlFilePatterns = [
  '*.html',
  '**/*.html',
  '!node_modules/**',
  '!dist/**',
  '!design-system/node_modules/**',
  '!playwright-report/**',
];

// glob 없이 HTML 파일 찾기
function findHtmlFiles(dir = '.', files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // 제외할 디렉토리들
    if (entry.isDirectory()) {
      if (
        ['node_modules', 'dist', 'playwright-report', 'test-reports', 'design-system'].some(
          (excluded) => fullPath.includes(excluded)
        )
      ) {
        continue;
      }
      findHtmlFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

// 파일 내용 수정 함수
function fixCSSClasses(content) {
  let fixedContent = content;
  let changesCount = 0;

  classNameMappings.forEach((mapping) => {
    const matches = fixedContent.match(mapping.pattern);
    if (matches) {
      changesCount += matches.length;
      fixedContent = fixedContent.replace(mapping.pattern, mapping.replacement);
    }
  });

  return { content: fixedContent, changes: changesCount };
}

// 메인 실행 함수
async function main() {
  console.log('🔧 CSS 클래스명 복구 스크립트 시작...\n');

  let totalFiles = 0;
  let totalChanges = 0;
  const results = [];

  try {
    // HTML 파일들 찾기
    let uniqueFiles;

    if (glob) {
      const files = [];
      for (const pattern of htmlFilePatterns) {
        const foundFiles = glob.sync(pattern, {
          cwd: process.cwd(),
          ignore: [
            'node_modules/**',
            'dist/**',
            'design-system/node_modules/**',
            'playwright-report/**',
          ],
        });
        files.push(...foundFiles);
      }
      uniqueFiles = [...new Set(files)];
    } else {
      // glob 없이 파일 찾기
      const allFiles = findHtmlFiles();
      uniqueFiles = allFiles.map((f) => path.relative(process.cwd(), f));
    }

    console.log(`📁 ${uniqueFiles.length}개의 HTML 파일을 찾았습니다.`);
    console.log('파일 목록:');
    uniqueFiles.forEach((file) => console.log(`  - ${file}`));
    console.log('');

    // 각 파일 처리
    for (const filePath of uniqueFiles) {
      const fullPath = path.resolve(filePath);

      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  파일을 찾을 수 없습니다: ${filePath}`);
        continue;
      }

      try {
        const originalContent = fs.readFileSync(fullPath, 'utf8');
        const result = fixCSSClasses(originalContent);

        if (result.changes > 0) {
          // 백업 생성
          const backupPath = `${fullPath}.backup.${Date.now()}`;
          fs.writeFileSync(backupPath, originalContent);

          // 수정된 내용 저장
          fs.writeFileSync(fullPath, result.content);

          console.log(`✅ ${filePath}: ${result.changes}개 클래스명 수정 완료`);
          results.push({ file: filePath, changes: result.changes, status: 'success' });
          totalChanges += result.changes;
        } else {
          console.log(`ℹ️  ${filePath}: 수정할 클래스명 없음`);
          results.push({ file: filePath, changes: 0, status: 'no-changes' });
        }

        totalFiles++;
      } catch (error) {
        console.error(`❌ ${filePath} 처리 중 오류: ${error.message}`);
        results.push({ file: filePath, changes: 0, status: 'error', error: error.message });
      }
    }

    // 결과 요약
    console.log('\n📊 수정 완료 결과:');
    console.log(`총 ${totalFiles}개 파일 처리`);
    console.log(`총 ${totalChanges}개 클래스명 수정`);

    const successCount = results.filter((r) => r.status === 'success').length;
    const noChangesCount = results.filter((r) => r.status === 'no-changes').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    console.log(`\n상세 결과:`);
    console.log(`✅ 수정 완료: ${successCount}개`);
    console.log(`ℹ️  변경 없음: ${noChangesCount}개`);
    console.log(`❌ 오류 발생: ${errorCount}개`);

    if (errorCount > 0) {
      console.log('\n❌ 오류 발생 파일들:');
      results
        .filter((r) => r.status === 'error')
        .forEach((r) => {
          console.log(`  - ${r.file}: ${r.error}`);
        });
    }

    if (successCount > 0) {
      console.log('\n🔄 수정된 파일들:');
      results
        .filter((r) => r.status === 'success')
        .forEach((r) => {
          console.log(`  - ${r.file}: ${r.changes}개 변경`);
        });
    }

    console.log('\n✨ CSS 클래스명 복구가 완료되었습니다!');
    console.log('💡 원본 파일은 .backup 확장자로 백업되었습니다.');
  } catch (error) {
    console.error('❌ 전체 프로세스 오류:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixCSSClasses, classNameMappings };
