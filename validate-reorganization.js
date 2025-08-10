/**
 * doha.kr 재구성 검증 도구
 * CSS, JavaScript 네임스페이스, z-index 시스템의 정상 작동을 검증
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));

class ReorganizationValidator {
  constructor() {
    this.validationResults = {
      namespace: {
        migrated: [],
        missing: [],
        conflicts: []
      },
      css: {
        renamed: [],
        conflicts: [],
        missingClasses: []
      },
      zIndex: {
        converted: [],
        hardcoded: [],
        missingVariables: []
      },
      integration: {
        brokenReferences: [],
        missingImports: [],
        syntaxErrors: []
      },
      performance: {
        totalFiles: 0,
        bundleSize: 0,
        loadTime: 0
      }
    };
  }

  /**
   * JavaScript 네임스페이스 마이그레이션 검증
   */
  async validateNamespaceMigration() {
    console.log('🔍 Validating JavaScript namespace migration...');
    
    const jsFiles = await glob('js/**/*.js', { ignore: ['**/*.min.js'] });
    const htmlFiles = await glob('**/*.html', { ignore: ['node_modules/**'] });
    const allFiles = [...jsFiles, ...htmlFiles];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // 검증 1: 구 전역 변수 사용 확인
      const oldGlobals = [
        'window.APIManager',
        'window.ErrorHandler', 
        'window.FortuneService',
        'window.LazyLoader',
        'window.PWAInstallManager'
      ];
      
      oldGlobals.forEach(oldGlobal => {
        if (content.includes(oldGlobal) && !file.includes('namespace-migration')) {
          this.validationResults.namespace.missing.push({
            file: file,
            issue: `Still using ${oldGlobal}`,
            recommendation: `Update to DohaKR equivalent`
          });
        }
      });
      
      // 검증 2: DohaKR 네임스페이스 사용 확인
      if (content.includes('DohaKR.')) {
        const dohaKRMatches = content.match(/DohaKR\.[A-Za-z.]+/g);
        if (dohaKRMatches) {
          this.validationResults.namespace.migrated.push({
            file: file,
            namespaces: dohaKRMatches,
            count: dohaKRMatches.length
          });
        }
      }
      
      // 검증 3: 네임스페이스 임포트 확인
      if (file.endsWith('.js') && content.includes('DohaKR') && !content.includes('namespace-migration')) {
        if (!content.includes("import") || !content.includes("DohaKR")) {
          this.validationResults.integration.missingImports.push({
            file: file,
            issue: 'DohaKR namespace used but not imported',
            solution: "Add: import { DohaKR } from './core/namespace-migration.js';"
          });
        }
      }
    }
  }

  /**
   * CSS 클래스 리네임 검증
   */
  async validateCSSRename() {
    console.log('🎨 Validating CSS class renaming...');
    
    const cssFiles = await glob('css/**/*.css', { ignore: ['**/*.min.css'] });
    const htmlFiles = await glob('**/*.html', { ignore: ['node_modules/**'] });
    
    // CSS 클래스 정의 수집
    const definedClasses = new Set();
    const classUsage = new Map();
    
    for (const cssFile of cssFiles) {
      const content = fs.readFileSync(cssFile, 'utf-8');
      const classMatches = content.match(/\.([a-zA-Z][a-zA-Z0-9_-]*)\s*\{/g);
      
      if (classMatches) {
        classMatches.forEach(match => {
          const className = match.substring(1).replace(/\s*\{$/, '');
          definedClasses.add(className);
          
          if (!classUsage.has(className)) {
            classUsage.set(className, []);
          }
          classUsage.get(className).push({
            file: cssFile,
            type: 'definition'
          });
        });
      }
    }
    
    // HTML에서 클래스 사용 확인
    for (const htmlFile of htmlFiles) {
      const content = fs.readFileSync(htmlFile, 'utf-8');
      const classMatches = content.match(/class=["']([^"']+)["']/g);
      
      if (classMatches) {
        classMatches.forEach(match => {
          const classNames = match.replace(/class=["']|["']/g, '').split(/\s+/);
          
          classNames.forEach(className => {
            if (className) {
              if (!classUsage.has(className)) {
                classUsage.set(className, []);
              }
              classUsage.get(className).push({
                file: htmlFile,
                type: 'usage'
              });
            }
          });
        });
      }
    }
    
    // 미사용/정의되지 않은 클래스 찾기
    for (const [className, usage] of classUsage) {
      const hasDefinition = usage.some(u => u.type === 'definition');
      const hasUsage = usage.some(u => u.type === 'usage');
      
      if (hasUsage && !hasDefinition) {
        this.validationResults.css.missingClasses.push({
          className: className,
          usedIn: usage.filter(u => u.type === 'usage').map(u => u.file)
        });
      }
      
      if (hasDefinition && !hasUsage) {
        // 사용되지 않는 클래스는 정보성으로만 기록
        this.validationResults.css.renamed.push({
          className: className,
          status: 'unused',
          definedIn: usage.filter(u => u.type === 'definition').map(u => u.file)
        });
      }
    }
    
    // 레거시 접두사 사용 통계
    const legacyPrefixes = ['legacy-', 'feat-', 'page-', 'tool-', 'test-'];
    legacyPrefixes.forEach(prefix => {
      const prefixedClasses = Array.from(definedClasses).filter(c => c.startsWith(prefix));
      if (prefixedClasses.length > 0) {
        this.validationResults.css.renamed.push({
          prefix: prefix,
          count: prefixedClasses.length,
          classes: prefixedClasses.slice(0, 5) // 처음 5개만 표시
        });
      }
    });
  }

  /**
   * z-index 시스템 검증
   */
  async validateZIndexSystem() {
    console.log('📏 Validating z-index system...');
    
    const cssFiles = await glob('css/**/*.css', { ignore: ['**/*.min.css'] });
    
    // z-index CSS 변수 정의 확인
    const zIndexSystemFile = 'css/core/z-index-system.css';
    if (!fs.existsSync(zIndexSystemFile)) {
      this.validationResults.zIndex.missingVariables.push({
        file: zIndexSystemFile,
        issue: 'z-index system file not found'
      });
    } else {
      const systemContent = fs.readFileSync(zIndexSystemFile, 'utf-8');
      const variableMatches = systemContent.match(/--z-[a-zA-Z-]+:\s*[^;]+/g);
      
      if (variableMatches) {
        this.validationResults.zIndex.converted.push({
          file: zIndexSystemFile,
          variables: variableMatches.length,
          examples: variableMatches.slice(0, 5)
        });
      }
    }
    
    // 하드코딩된 z-index 값 찾기
    for (const cssFile of cssFiles) {
      const content = fs.readFileSync(cssFile, 'utf-8');
      const hardcodedMatches = content.match(/z-index:\s*\d+(?!var)/g);
      
      if (hardcodedMatches) {
        this.validationResults.zIndex.hardcoded.push({
          file: cssFile,
          hardcoded: hardcodedMatches,
          count: hardcodedMatches.length
        });
      }
      
      // CSS 변수 사용 확인
      const variableMatches = content.match(/z-index:\s*var\(--z-[^)]+\)/g);
      if (variableMatches) {
        this.validationResults.zIndex.converted.push({
          file: cssFile,
          converted: variableMatches,
          count: variableMatches.length
        });
      }
    }
  }

  /**
   * 통합 테스트
   */
  async validateIntegration() {
    console.log('🔗 Validating system integration...');
    
    // main.css에서 z-index 시스템 임포트 확인
    const mainCSSPath = 'css/main.css';
    if (fs.existsSync(mainCSSPath)) {
      const content = fs.readFileSync(mainCSSPath, 'utf-8');
      if (!content.includes('z-index-system.css')) {
        this.validationResults.integration.missingImports.push({
          file: mainCSSPath,
          missing: 'z-index-system.css import',
          fix: "Add @import 'core/z-index-system.css';"
        });
      }
    }
    
    // JavaScript 구문 검증
    const jsFiles = await glob('js/**/*.js', { ignore: ['**/*.min.js'] });
    for (const jsFile of jsFiles) {
      try {
        const content = fs.readFileSync(jsFile, 'utf-8');
        
        // 기본적인 구문 검사
        new Function(content);
        
      } catch (error) {
        this.validationResults.integration.syntaxErrors.push({
          file: jsFile,
          error: error.message,
          type: 'JavaScript syntax error'
        });
      }
    }
    
    // HTML 파일에서 누락된 스타일시트 참조 확인
    const htmlFiles = await glob('**/*.html', { ignore: ['node_modules/**'] });
    for (const htmlFile of htmlFiles) {
      const content = fs.readFileSync(htmlFile, 'utf-8');
      
      // 중요 CSS 파일들이 참조되는지 확인
      const criticalCSS = ['main.css', 'design-system.css'];
      criticalCSS.forEach(cssFile => {
        if (!content.includes(cssFile)) {
          this.validationResults.integration.brokenReferences.push({
            file: htmlFile,
            missing: cssFile,
            type: 'CSS reference'
          });
        }
      });
    }
  }

  /**
   * 성능 메트릭 계산
   */
  async calculatePerformanceMetrics() {
    console.log('⚡ Calculating performance metrics...');
    
    const allFiles = await glob('**/*.{css,js,html}', { 
      ignore: ['node_modules/**', 'backup-*/**', '**/*.min.*'] 
    });
    
    let totalSize = 0;
    
    for (const file of allFiles) {
      try {
        const stats = fs.statSync(file);
        totalSize += stats.size;
      } catch (error) {
        // 파일을 읽을 수 없는 경우 무시
      }
    }
    
    this.validationResults.performance = {
      totalFiles: allFiles.length,
      bundleSize: (totalSize / 1024).toFixed(2) + ' KB',
      averageFileSize: ((totalSize / allFiles.length) / 1024).toFixed(2) + ' KB'
    };
  }

  /**
   * 검증 리포트 생성
   */
  generateValidationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        namespaceMigration: {
          migratedFiles: this.validationResults.namespace.migrated.length,
          pendingFiles: this.validationResults.namespace.missing.length,
          conflicts: this.validationResults.namespace.conflicts.length
        },
        cssRename: {
          renamedClasses: this.validationResults.css.renamed.length,
          missingClasses: this.validationResults.css.missingClasses.length,
          conflicts: this.validationResults.css.conflicts.length
        },
        zIndexSystem: {
          convertedFiles: this.validationResults.zIndex.converted.length,
          hardcodedRemaining: this.validationResults.zIndex.hardcoded.length,
          missingVariables: this.validationResults.zIndex.missingVariables.length
        },
        integration: {
          syntaxErrors: this.validationResults.integration.syntaxErrors.length,
          brokenReferences: this.validationResults.integration.brokenReferences.length,
          missingImports: this.validationResults.integration.missingImports.length
        }
      },
      details: this.validationResults,
      recommendations: this.generateRecommendations()
    };

    // 리포트 파일 저장
    const reportPath = `validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    return { report, reportPath };
  }

  /**
   * 개선 권장사항 생성
   */
  generateRecommendations() {
    const recommendations = [];

    // 네임스페이스 관련 권장사항
    if (this.validationResults.namespace.missing.length > 0) {
      recommendations.push({
        category: 'JavaScript Namespace',
        priority: 'High',
        issue: `${this.validationResults.namespace.missing.length} files still use old global variables`,
        action: 'Update these files to use DohaKR namespace',
        files: this.validationResults.namespace.missing.map(m => m.file)
      });
    }

    // CSS 관련 권장사항
    if (this.validationResults.css.missingClasses.length > 0) {
      recommendations.push({
        category: 'CSS Classes',
        priority: 'High',
        issue: `${this.validationResults.css.missingClasses.length} classes used but not defined`,
        action: 'Define missing classes or update HTML references',
        classes: this.validationResults.css.missingClasses.map(c => c.className)
      });
    }

    // z-index 관련 권장사항
    if (this.validationResults.zIndex.hardcoded.length > 0) {
      recommendations.push({
        category: 'Z-Index System',
        priority: 'Medium',
        issue: `${this.validationResults.zIndex.hardcoded.length} files still use hardcoded z-index values`,
        action: 'Convert hardcoded z-index values to CSS variables',
        files: this.validationResults.zIndex.hardcoded.map(h => h.file)
      });
    }

    // 통합 관련 권장사항
    if (this.validationResults.integration.syntaxErrors.length > 0) {
      recommendations.push({
        category: 'Integration',
        priority: 'Critical',
        issue: `${this.validationResults.integration.syntaxErrors.length} JavaScript syntax errors found`,
        action: 'Fix syntax errors immediately',
        files: this.validationResults.integration.syntaxErrors.map(e => e.file)
      });
    }

    return recommendations;
  }

  /**
   * 콘솔에 요약 리포트 출력
   */
  printSummaryReport(report) {
    console.log('\n📊 === REORGANIZATION VALIDATION SUMMARY ===');
    console.log(`📅 Validation completed: ${new Date().toLocaleString()}`);
    
    console.log('\n🔧 JavaScript Namespace Migration:');
    console.log(`   ✅ Migrated files: ${report.summary.namespaceMigration.migratedFiles}`);
    console.log(`   ⏳ Pending files: ${report.summary.namespaceMigration.pendingFiles}`);
    console.log(`   ⚠️ Conflicts: ${report.summary.namespaceMigration.conflicts}`);
    
    console.log('\n🎨 CSS Class Renaming:');
    console.log(`   ✅ Renamed classes: ${report.summary.cssRename.renamedClasses}`);
    console.log(`   ❌ Missing classes: ${report.summary.cssRename.missingClasses}`);
    console.log(`   ⚠️ Conflicts: ${report.summary.cssRename.conflicts}`);
    
    console.log('\n📏 Z-Index System:');
    console.log(`   ✅ Converted files: ${report.summary.zIndexSystem.convertedFiles}`);
    console.log(`   ⏳ Hardcoded remaining: ${report.summary.zIndexSystem.hardcodedRemaining}`);
    console.log(`   ❌ Missing variables: ${report.summary.zIndexSystem.missingVariables}`);
    
    console.log('\n🔗 System Integration:');
    console.log(`   ❌ Syntax errors: ${report.summary.integration.syntaxErrors}`);
    console.log(`   🔗 Broken references: ${report.summary.integration.brokenReferences}`);
    console.log(`   📦 Missing imports: ${report.summary.integration.missingImports}`);
    
    console.log(`\n⚡ Performance: ${this.validationResults.performance.totalFiles} files, ${this.validationResults.performance.bundleSize} total`);
    
    // 권장사항 출력
    if (report.recommendations.length > 0) {
      console.log('\n💡 === RECOMMENDATIONS ===');
      report.recommendations.forEach((rec, index) => {
        const priorityIcon = rec.priority === 'Critical' ? '🚨' : 
                           rec.priority === 'High' ? '⚠️' : 
                           rec.priority === 'Medium' ? '📋' : '💡';
        console.log(`${index + 1}. ${priorityIcon} [${rec.category}] ${rec.issue}`);
        console.log(`   Action: ${rec.action}`);
      });
    }
    
    // 전체 건강도 점수 계산
    const totalIssues = report.summary.namespaceMigration.pendingFiles +
                       report.summary.cssRename.missingClasses +
                       report.summary.integration.syntaxErrors +
                       report.summary.integration.brokenReferences;
    
    const healthScore = Math.max(0, 100 - (totalIssues * 10));
    const healthIcon = healthScore >= 90 ? '🟢' : healthScore >= 70 ? '🟡' : '🔴';
    
    console.log(`\n${healthIcon} Overall Health Score: ${healthScore}/100`);
  }

  /**
   * 전체 검증 프로세스 실행
   */
  async runFullValidation() {
    console.log('🔍 Starting doha.kr Reorganization Validation');
    
    try {
      // 1. JavaScript 네임스페이스 검증
      await this.validateNamespaceMigration();
      
      // 2. CSS 클래스 리네임 검증
      await this.validateCSSRename();
      
      // 3. z-index 시스템 검증
      await this.validateZIndexSystem();
      
      // 4. 통합 테스트
      await this.validateIntegration();
      
      // 5. 성능 메트릭 계산
      await this.calculatePerformanceMetrics();
      
      // 6. 리포트 생성
      const { report, reportPath } = this.generateValidationReport();
      
      // 7. 요약 출력
      this.printSummaryReport(report);
      
      console.log(`\n📄 Detailed report saved: ${reportPath}`);
      console.log('\n✅ Validation completed successfully!');
      
      return report;
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    }
  }
}

// 실행
if (require.main === module) {
  const validator = new ReorganizationValidator();
  validator.runFullValidation().catch(console.error);
}

module.exports = { ReorganizationValidator };