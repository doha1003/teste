/**
 * CSS 클래스 접두사 마이그레이션 도구
 * doha.kr 프로젝트의 체계적인 클래스명 정리
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class CSSPrefixMigrationTool {
  constructor() {
    this.projectRoot = process.cwd();
    this.cssDir = path.join(this.projectRoot, 'css');
    this.jsDir = path.join(this.projectRoot, 'js');
    this.htmlFiles = [];
    
    // 접두사 매핑 테이블
    this.prefixMapping = {
      // 레이아웃 & 공통
      'container': 'dh-layout-container',
      'grid': 'dh-layout-grid',
      'row': 'dh-layout-row',
      'col': 'dh-layout-col',
      
      // 컴포넌트
      'btn': 'dh-comp-btn',
      'button': 'dh-comp-button',
      'card': 'dh-comp-card',
      'service-card': 'dh-comp-service-card',
      'result-card': 'dh-comp-result-card',
      
      // 폼 컴포넌트
      'form-control': 'dh-comp-form-control',
      'form-group': 'dh-comp-form-group',
      'form-input': 'dh-comp-form-input',
      'form-select': 'dh-comp-form-select',
      'form-range': 'dh-comp-form-range',
      'form-check-input': 'dh-comp-form-check-input',
      
      // 상태 & 로딩
      'loading-spinner': 'dh-state-loading',
      'active': 'dh-state-active',
      'disabled': 'dh-state-disabled',
      'hidden': 'dh-state-hidden',
      
      // 애니메이션
      'floating-hearts': 'dh-anim-floating-hearts',
      'floating-icon': 'dh-anim-floating-icon',
      'mbti-brain-particle': 'dh-anim-mbti-particle',
      'teto-particle': 'dh-anim-teto-particle',
      'stagger-children': 'dh-anim-stagger-children',
      'stagger-item': 'dh-anim-stagger-item',
      
      // 운세 관련
      'fortune-section': 'dh-fortune-section',
      'zodiac-card': 'dh-fortune-zodiac-card',
      
      // 테스트 관련
      'test-progress': 'dh-test-progress',
      'test-question': 'dh-test-question',
      'test-option': 'dh-test-option',
      
      // 유틸리티
      'text-primary': 'dh-util-text-primary',
      'text-secondary': 'dh-util-text-secondary',
      'text-center': 'dh-util-text-center',
      'text-left': 'dh-util-text-left',
      'text-right': 'dh-util-text-right',
      
      // 한국어 최적화
      'korean-text': 'dh-ko-text',
      'korean-title': 'dh-ko-title',
      
      // PWA 관련
      'pwa-install-prompt': 'dh-pwa-install-prompt',
      'pwa-offline-indicator': 'dh-pwa-offline-indicator',
      
      // 모바일 최적화
      'mobile-menu': 'dh-mobile-menu',
      'mobile-nav': 'dh-mobile-nav',
      'mobile-only': 'dh-mobile-only',
      'desktop-only': 'dh-desktop-only'
    };
    
    this.migrationLog = [];
    this.conflicts = [];
  }
  
  /**
   * 전체 마이그레이션 프로세스 실행
   */
  async migrate() {
    console.log('🚀 CSS 클래스 접두사 마이그레이션 시작');
    
    try {
      // 1. 파일 스캔
      await this.scanFiles();
      
      // 2. 백업 생성
      await this.createBackup();
      
      // 3. 충돌 분석
      await this.analyzeConflicts();
      
      // 4. Phase 1: 고위험 클래스 마이그레이션
      await this.migratePhase1();
      
      // 5. Phase 2: 중간 위험 클래스 마이그레이션
      await this.migratePhase2();
      
      // 6. Phase 3: 기능별 클래스 마이그레이션
      await this.migratePhase3();
      
      // 7. HTML 파일 업데이트
      await this.updateHtmlFiles();
      
      // 8. JavaScript 파일 업데이트
      await this.updateJavaScriptFiles();
      
      // 9. 검증
      await this.validateMigration();
      
      // 10. 리포트 생성
      await this.generateReport();
      
      console.log('✅ 마이그레이션 완료!');
      
    } catch (error) {
      console.error('❌ 마이그레이션 중 오류 발생:', error);
      throw error;
    }
  }
  
  /**
   * 프로젝트 파일들 스캔
   */
  async scanFiles() {
    console.log('📁 파일 스캔 중...');
    
    // CSS 파일들 찾기 (minified 제외)
    this.cssFiles = await glob('css/**/*.css', {
      cwd: this.projectRoot,
      ignore: ['**/*.min.css']
    });
    
    // HTML 파일들 찾기  
    this.htmlFiles = await glob('**/*.html', {
      cwd: this.projectRoot,
      ignore: ['node_modules/**', 'dist/**', 'test-results/**']
    });
    
    // JavaScript 파일들 찾기
    this.jsFiles = await glob('js/**/*.js', {
      cwd: this.projectRoot,
      ignore: ['**/*.min.js', '**/node_modules/**']
    });
    
    console.log(`📊 스캔 완료: CSS ${this.cssFiles.length}개, HTML ${this.htmlFiles.length}개, JS ${this.jsFiles.length}개`);
  }
  
  /**
   * 백업 생성
   */
  async createBackup() {
    console.log('💾 백업 생성 중...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.projectRoot, `backup-before-prefix-migration-${timestamp}`);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // CSS 백업
    const cssBackupDir = path.join(backupDir, 'css');
    fs.mkdirSync(cssBackupDir, { recursive: true });
    
    for (const cssFile of this.cssFiles) {
      const srcPath = path.join(this.projectRoot, cssFile);
      const destPath = path.join(cssBackupDir, cssFile.replace('css/', ''));
      const destDir = path.dirname(destPath);
      
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      fs.copyFileSync(srcPath, destPath);
    }
    
    console.log(`✅ 백업 완료: ${backupDir}`);
    this.backupDir = backupDir;
  }
  
  /**
   * 충돌 분석
   */
  async analyzeConflicts() {
    console.log('🔍 클래스명 충돌 분석 중...');
    
    const classUsage = new Map();
    
    // CSS 파일에서 클래스 추출
    for (const cssFile of this.cssFiles) {
      const content = fs.readFileSync(path.join(this.projectRoot, cssFile), 'utf8');
      const classMatches = content.match(/\\.([a-zA-Z][a-zA-Z0-9_-]*)/g);
      
      if (classMatches) {
        for (const match of classMatches) {
          const className = match.substring(1); // Remove leading dot
          
          if (!classUsage.has(className)) {
            classUsage.set(className, []);
          }
          classUsage.get(className).push(cssFile);
        }
      }
    }
    
    // 중복 발견된 클래스들 저장
    for (const [className, files] of classUsage) {
      if (files.length > 1) {
        this.conflicts.push({
          className,
          files: [...new Set(files)], // 중복 제거
          priority: this.getConflictPriority(className)
        });
      }
    }
    
    // 우선순위별 정렬
    this.conflicts.sort((a, b) => b.priority - a.priority);
    
    console.log(`⚠️  충돌 발견: ${this.conflicts.length}개 클래스`);
  }
  
  /**
   * 충돌 우선순위 결정
   */
  getConflictPriority(className) {
    const highRisk = ['btn', 'button', 'container', 'card', 'form-control', 'form-group'];
    const mediumRisk = ['service-card', 'text-primary', 'text-secondary', 'result-header'];
    
    if (highRisk.includes(className)) return 3;
    if (mediumRisk.includes(className)) return 2;
    return 1;
  }
  
  /**
   * Phase 1: 고위험 클래스 마이그레이션
   */
  async migratePhase1() {
    console.log('🔥 Phase 1: 고위험 클래스 마이그레이션');
    
    const highRiskClasses = this.conflicts.filter(c => c.priority === 3);
    
    for (const conflict of highRiskClasses) {
      if (this.prefixMapping[conflict.className]) {
        await this.migrateClass(conflict.className, this.prefixMapping[conflict.className]);
      }
    }
  }
  
  /**
   * Phase 2: 중간 위험 클래스 마이그레이션
   */
  async migratePhase2() {
    console.log('⚡ Phase 2: 중간 위험 클래스 마이그레이션');
    
    const mediumRiskClasses = this.conflicts.filter(c => c.priority === 2);
    
    for (const conflict of mediumRiskClasses) {
      if (this.prefixMapping[conflict.className]) {
        await this.migrateClass(conflict.className, this.prefixMapping[conflict.className]);
      }
    }
  }
  
  /**
   * Phase 3: 기능별 클래스 마이그레이션
   */
  async migratePhase3() {
    console.log('🎯 Phase 3: 기능별 클래스 마이그레이션');
    
    const remainingClasses = Object.keys(this.prefixMapping).filter(className => {
      return !this.conflicts.some(c => c.className === className);
    });
    
    for (const className of remainingClasses) {
      await this.migrateClass(className, this.prefixMapping[className]);
    }
  }
  
  /**
   * 개별 클래스 마이그레이션
   */
  async migrateClass(oldClass, newClass) {
    console.log(`🔄 ${oldClass} → ${newClass}`);
    
    let filesChanged = 0;
    
    // CSS 파일들 업데이트
    for (const cssFile of this.cssFiles) {
      const filePath = path.join(this.projectRoot, cssFile);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 클래스 선택자 패턴 매칭
      const patterns = [
        new RegExp(`\\.${this.escapeRegex(oldClass)}(?![a-zA-Z0-9_-])`, 'g'),
        new RegExp(`\\.${this.escapeRegex(oldClass)}:`, 'g'),
        new RegExp(`\\.${this.escapeRegex(oldClass)}\\s`, 'g'),
        new RegExp(`\\.${this.escapeRegex(oldClass)}\\{`, 'g'),
        new RegExp(`\\.${this.escapeRegex(oldClass)},`, 'g')
      ];
      
      let hasChanges = false;
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          content = content.replace(pattern, (match) => {
            return match.replace(oldClass, newClass);
          });
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        filesChanged++;
      }
    }
    
    this.migrationLog.push({
      oldClass,
      newClass,
      filesChanged,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * HTML 파일 업데이트
   */
  async updateHtmlFiles() {
    console.log('📝 HTML 파일 업데이트 중...');
    
    let totalChanges = 0;
    
    for (const htmlFile of this.htmlFiles) {
      const filePath = path.join(this.projectRoot, htmlFile);
      let content = fs.readFileSync(filePath, 'utf8');
      let hasChanges = false;
      
      for (const [oldClass, newClass] of Object.entries(this.prefixMapping)) {
        // class="..." 속성 내의 클래스명 교체
        const classPattern = new RegExp(`(class=["'][^"']*\\s?)${this.escapeRegex(oldClass)}(\\s[^"']*["']|["'])`, 'g');
        
        if (classPattern.test(content)) {
          content = content.replace(classPattern, (match, prefix, suffix) => {
            return prefix + newClass + suffix;
          });
          hasChanges = true;
          totalChanges++;
        }
      }
      
      if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
    
    console.log(`✅ HTML 업데이트 완료: ${totalChanges}개 변경사항`);
  }
  
  /**
   * JavaScript 파일 업데이트
   */
  async updateJavaScriptFiles() {
    console.log('⚡ JavaScript 파일 업데이트 중...');
    
    let totalChanges = 0;
    
    for (const jsFile of this.jsFiles) {
      const filePath = path.join(this.projectRoot, jsFile);
      let content = fs.readFileSync(filePath, 'utf8');
      let hasChanges = false;
      
      for (const [oldClass, newClass] of Object.entries(this.prefixMapping)) {
        // querySelector, querySelectorAll 내의 클래스 선택자 교체
        const patterns = [
          new RegExp(`(querySelector(?:All)?\\s*\\(\\s*['"\`][^'"\`]*\\.)${this.escapeRegex(oldClass)}([^'"\`]*['"\`]\\s*\\))`, 'g'),
          new RegExp(`(getElementsByClassName\\s*\\(\\s*['"\`])${this.escapeRegex(oldClass)}(['"\`]\\s*\\))`, 'g'),
          new RegExp(`(classList\\.(?:add|remove|contains|toggle)\\s*\\(\\s*['"\`])${this.escapeRegex(oldClass)}(['"\`]\\s*\\))`, 'g')
        ];
        
        for (const pattern of patterns) {
          if (pattern.test(content)) {
            content = content.replace(pattern, (match, prefix, suffix) => {
              return prefix + newClass + suffix;
            });
            hasChanges = true;
            totalChanges++;
          }
        }
      }
      
      if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
    
    console.log(`✅ JavaScript 업데이트 완료: ${totalChanges}개 변경사항`);
  }
  
  /**
   * 마이그레이션 검증
   */
  async validateMigration() {
    console.log('🔍 마이그레이션 검증 중...');
    
    const issues = [];
    
    // 이전 클래스명이 남아있는지 확인
    for (const [oldClass] of Object.entries(this.prefixMapping)) {
      const remaining = await this.findRemainingReferences(oldClass);
      if (remaining.length > 0) {
        issues.push({
          type: 'remaining_old_class',
          className: oldClass,
          files: remaining
        });
      }
    }
    
    // 새 클래스명이 제대로 적용되었는지 확인
    for (const [, newClass] of Object.entries(this.prefixMapping)) {
      const usage = await this.findClassUsage(newClass);
      if (usage.length === 0) {
        issues.push({
          type: 'missing_new_class',
          className: newClass
        });
      }
    }
    
    if (issues.length > 0) {
      console.warn(`⚠️  검증 이슈 ${issues.length}개 발견`);
      for (const issue of issues) {
        console.warn(`  - ${issue.type}: ${issue.className}`);
      }
    } else {
      console.log('✅ 검증 완료: 모든 마이그레이션이 성공적으로 적용됨');
    }
    
    this.validationIssues = issues;
  }
  
  /**
   * 클래스 사용처 찾기
   */
  async findClassUsage(className) {
    const usage = [];
    
    // CSS 파일에서 찾기
    for (const cssFile of this.cssFiles) {
      const content = fs.readFileSync(path.join(this.projectRoot, cssFile), 'utf8');
      if (content.includes(`.${className}`)) {
        usage.push({ file: cssFile, type: 'css' });
      }
    }
    
    // HTML 파일에서 찾기
    for (const htmlFile of this.htmlFiles) {
      const content = fs.readFileSync(path.join(this.projectRoot, htmlFile), 'utf8');
      if (content.includes(className)) {
        usage.push({ file: htmlFile, type: 'html' });
      }
    }
    
    return usage;
  }
  
  /**
   * 남은 이전 클래스 참조 찾기
   */
  async findRemainingReferences(className) {
    const remaining = [];
    
    // 모든 파일 유형에서 확인
    const allFiles = [...this.cssFiles, ...this.htmlFiles, ...this.jsFiles];
    
    for (const file of allFiles) {
      const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
      
      // 정확한 클래스명 매칭 (단어 경계 사용)
      const patterns = [
        new RegExp(`\\.${this.escapeRegex(className)}(?![a-zA-Z0-9_-])`, 'g'), // CSS 선택자
        new RegExp(`\\b${this.escapeRegex(className)}\\b`, 'g') // 일반적인 매칭
      ];
      
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          remaining.push(file);
          break;
        }
      }
    }
    
    return remaining;
  }
  
  /**
   * 정규식용 문자열 이스케이프
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
  }
  
  /**
   * 마이그레이션 리포트 생성
   */
  async generateReport() {
    console.log('📊 마이그레이션 리포트 생성 중...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalClassesMigrated: this.migrationLog.length,
        totalFilesScanned: this.cssFiles.length + this.htmlFiles.length + this.jsFiles.length,
        conflictsResolved: this.conflicts.length,
        validationIssues: this.validationIssues.length
      },
      prefixMapping: this.prefixMapping,
      migrationLog: this.migrationLog,
      conflicts: this.conflicts,
      validationIssues: this.validationIssues,
      backupLocation: this.backupDir
    };
    
    const reportPath = path.join(this.projectRoot, `css-prefix-migration-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    // 요약 리포트도 생성
    const summaryPath = path.join(this.projectRoot, `css-prefix-migration-summary-${Date.now()}.md`);
    const summaryContent = this.generateSummaryReport(report);
    fs.writeFileSync(summaryPath, summaryContent, 'utf8');
    
    console.log(`✅ 리포트 생성 완료:`);
    console.log(`  - 상세 리포트: ${reportPath}`);
    console.log(`  - 요약 리포트: ${summaryPath}`);
    
    return report;
  }
  
  /**
   * 요약 리포트 생성
   */
  generateSummaryReport(report) {
    return `# CSS 클래스 접두사 마이그레이션 요약 리포트

## 📊 마이그레이션 개요

- **실행 시간**: ${report.timestamp}
- **총 마이그레이션된 클래스**: ${report.summary.totalClassesMigrated}개
- **스캔된 파일 수**: ${report.summary.totalFilesScanned}개
- **해결된 충돌**: ${report.summary.conflictsResolved}개
- **검증 이슈**: ${report.summary.validationIssues}개

## 🔄 주요 클래스 변경사항

${Object.entries(report.prefixMapping).map(([old, new_]) => 
  `- \`${old}\` → \`${new_}\``
).join('\\n')}

## ⚠️ 검증 이슈

${report.validationIssues.length > 0 ? 
  report.validationIssues.map(issue => 
    `- **${issue.type}**: ${issue.className}${issue.files ? ` (${issue.files.join(', ')})` : ''}`
  ).join('\\n') : 
  '검증 이슈 없음 ✅'
}

## 💾 백업 위치

\`${report.backupLocation}\`

## 📝 다음 단계

1. **테스트 실행**: 모든 기능이 정상 작동하는지 확인
2. **빌드 실행**: CSS/JS 번들링 정상 작동 확인
3. **브라우저 테스트**: 실제 페이지 렌더링 확인
4. **백업 정리**: 문제없으면 백업 파일 정리

## ⚡ 성능 개선 효과

- 클래스명 충돌 위험 제거
- CSS 특이성(Specificity) 일관성 확보
- 유지보수성 대폭 개선
- 팀 협업 효율성 증대
`;
  }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const tool = new CSSPrefixMigrationTool();
  
  tool.migrate().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

export default CSSPrefixMigrationTool;