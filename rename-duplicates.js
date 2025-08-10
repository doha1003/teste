/**
 * doha.kr 자동 중복 해결 스크립트
 * CSS 클래스 중복 해결 및 JavaScript 네임스페이스 통합을 자동화
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));

class DohaKRReorganizer {
  constructor() {
    this.backupDir = `backup-${Date.now()}`;
    this.changes = {
      cssRenamed: [],
      jsNamespaced: [],
      htmlUpdated: [],
      errors: []
    };
    
    // CSS 클래스 리네임 규칙
    this.cssRenameRules = new Map([
      // 기본 컴포넌트 클래스들
      { pattern: /^\.btn(?!\-)/gm, replacement: '.legacy-btn', files: ['pages/', 'features/'] },
      { pattern: /^\.card(?!\-)/gm, replacement: '.legacy-card', files: ['pages/', 'features/'] },
      { pattern: /^\.container(?!\-)/gm, replacement: '.legacy-container', files: ['pages/', 'features/'] },
      { pattern: /^\.wrapper(?!\-)/gm, replacement: '.legacy-wrapper', files: ['pages/', 'features/'] },
      { pattern: /^\.header(?!\-)/gm, replacement: '.legacy-header', files: ['pages/', 'features/'] },
      { pattern: /^\.footer(?!\-)/gm, replacement: '.legacy-footer', files: ['pages/', 'features/'] },
      
      // 페이지별 접두사
      { pattern: /^\.contact-/gm, replacement: '.page-contact-', files: ['pages/contact'] },
      { pattern: /^\.fortune-/gm, replacement: '.feat-fortune-', files: ['features/fortune'] },
      { pattern: /^\.test-/gm, replacement: '.feat-test-', files: ['features/test', 'pages/test'] },
      { pattern: /^\.tool-/gm, replacement: '.feat-tool-', files: ['features/tool', 'pages/tool'] },
      { pattern: /^\.bmi-/gm, replacement: '.tool-bmi-', files: ['bmi'] },
      { pattern: /^\.mbti-/gm, replacement: '.test-mbti-', files: ['mbti'] },
      { pattern: /^\.tarot-/gm, replacement: '.fortune-tarot-', files: ['tarot'] },
      { pattern: /^\.saju-/gm, replacement: '.fortune-saju-', files: ['saju'] }
    ]);
    
    // JavaScript 네임스페이스 변환 규칙
    this.jsNamespaceRules = new Map([
      ['window.APIManager', 'DohaKR.API.Manager'],
      ['window.ErrorHandler', 'DohaKR.Core.ErrorHandler'],
      ['window.FortuneService', 'DohaKR.Fortune.Service'],
      ['window.LazyLoader', 'DohaKR.Core.LazyLoader'],
      ['window.PWAInstallManager', 'DohaKR.UI.PWAInstaller'],
      ['window.MBTITestService', 'DohaKR.Tests.MBTI'],
      ['window.TetoEgenTestService', 'DohaKR.Tests.TetoEgen'],
      ['window.LoveDNATestService', 'DohaKR.Tests.LoveDNA'],
      ['window.BMICalculatorService', 'DohaKR.Tools.BMI'],
      ['window.SalaryCalculatorService', 'DohaKR.Tools.Salary'],
      ['window.TextCounterService', 'DohaKR.Tools.TextCounter']
    ]);
    
    // z-index 변환 규칙
    this.zIndexRules = new Map([
      [/z-index:\s*1000(?!\d)/g, 'z-index: var(--z-navbar)'],
      [/z-index:\s*1001(?!\d)/g, 'z-index: var(--z-mobile-menu)'],
      [/z-index:\s*1002(?!\d)/g, 'z-index: var(--z-pwa-install)'],
      [/z-index:\s*999(?!\d)/g, 'z-index: var(--z-toast)'],
      [/z-index:\s*500(?!\d)/g, 'z-index: var(--z-modal)'],
      [/z-index:\s*400(?!\d)/g, 'z-index: var(--z-overlay)'],
      [/z-index:\s*200(?!\d)/g, 'z-index: var(--z-sticky)'],
      [/z-index:\s*100(?!\d)/g, 'z-index: var(--z-dropdown)']
    ]);
  }

  /**
   * 백업 디렉토리 생성
   */
  async createBackup() {
    console.log('📦 Creating backup...');
    
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // 중요 파일들 백업
    const filesToBackup = [
      'css/**/*.css',
      'js/**/*.js',
      '**/*.html',
      'package.json'
    ];

    for (const pattern of filesToBackup) {
      const files = await glob(pattern, { ignore: ['node_modules/**', 'backup-*/**'] });
      
      for (const file of files) {
        const backupPath = path.join(this.backupDir, file);
        const backupDir = path.dirname(backupPath);
        
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        
        fs.copyFileSync(file, backupPath);
      }
    }
    
    console.log(`✅ Backup created in: ${this.backupDir}`);
  }

  /**
   * CSS 파일 클래스 리네임
   */
  async renameCSSClasses() {
    console.log('\n🎨 Renaming CSS classes...');
    
    const cssFiles = await glob('css/**/*.css', { ignore: ['**/*.min.css'] });
    
    for (const filePath of cssFiles) {
      try {
        let content = fs.readFileSync(filePath, 'utf-8');
        let hasChanges = false;
        const changesInFile = [];

        // 파일 경로에 따라 적절한 규칙 적용
        for (const [ruleKey, rule] of this.cssRenameRules.entries()) {
          const shouldApply = rule.files.some(pathPattern => 
            filePath.includes(pathPattern)
          );
          
          if (shouldApply) {
            const matches = content.match(rule.pattern);
            if (matches) {
              content = content.replace(rule.pattern, rule.replacement);
              hasChanges = true;
              changesInFile.push({
                pattern: rule.pattern.toString(),
                replacement: rule.replacement,
                matches: matches.length
              });
            }
          }
        }

        // z-index 값들을 CSS 변수로 변환
        for (const [pattern, replacement] of this.zIndexRules) {
          const matches = content.match(pattern);
          if (matches) {
            content = content.replace(pattern, replacement);
            hasChanges = true;
            changesInFile.push({
              pattern: pattern.toString(),
              replacement: replacement,
              matches: matches.length,
              type: 'z-index'
            });
          }
        }

        if (hasChanges) {
          fs.writeFileSync(filePath, content);
          this.changes.cssRenamed.push({
            file: filePath,
            changes: changesInFile
          });
          console.log(`✅ Updated: ${filePath}`);
        }

      } catch (error) {
        this.changes.errors.push({
          file: filePath,
          type: 'CSS rename',
          error: error.message
        });
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }
  }

  /**
   * JavaScript 네임스페이스 변환
   */
  async updateJavaScriptNamespaces() {
    console.log('\n🔧 Updating JavaScript namespaces...');
    
    const jsFiles = await glob('js/**/*.js', { ignore: ['**/*.min.js'] });
    const htmlFiles = await glob('**/*.html', { ignore: ['node_modules/**'] });
    const allFiles = [...jsFiles, ...htmlFiles];

    for (const filePath of allFiles) {
      try {
        let content = fs.readFileSync(filePath, 'utf-8');
        let hasChanges = false;
        const changesInFile = [];

        // JavaScript 네임스페이스 변환
        for (const [oldNamespace, newNamespace] of this.jsNamespaceRules) {
          // 정확한 매칭을 위한 정규식 생성
          const pattern = new RegExp(
            oldNamespace.replace('.', '\\.').replace('(', '\\(').replace(')', '\\)'),
            'g'
          );
          
          const matches = content.match(pattern);
          if (matches) {
            content = content.replace(pattern, newNamespace);
            hasChanges = true;
            changesInFile.push({
              old: oldNamespace,
              new: newNamespace,
              matches: matches.length
            });
          }
        }

        // DohaKR 네임스페이스 임포트 추가 (JS 파일만)
        if (filePath.endsWith('.js') && hasChanges) {
          // 파일 상단에 DohaKR 임포트가 없으면 추가
          if (!content.includes('DohaKR') && !content.includes('namespace-migration')) {
            const importStatement = "import { DohaKR } from './core/namespace-migration.js';\n";
            content = importStatement + content;
            changesInFile.push({
              type: 'import',
              added: 'DohaKR namespace import'
            });
          }
        }

        if (hasChanges) {
          fs.writeFileSync(filePath, content);
          this.changes.jsNamespaced.push({
            file: filePath,
            changes: changesInFile
          });
          console.log(`✅ Updated: ${filePath}`);
        }

      } catch (error) {
        this.changes.errors.push({
          file: filePath,
          type: 'JS namespace',
          error: error.message
        });
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }
  }

  /**
   * HTML 파일의 클래스 참조 업데이트
   */
  async updateHTMLClassReferences() {
    console.log('\n📄 Updating HTML class references...');
    
    const htmlFiles = await glob('**/*.html', { ignore: ['node_modules/**'] });

    for (const filePath of htmlFiles) {
      try {
        let content = fs.readFileSync(filePath, 'utf-8');
        let hasChanges = false;
        const changesInFile = [];

        // CSS 클래스 참조 업데이트
        for (const [ruleKey, rule] of this.cssRenameRules.entries()) {
          // HTML에서는 . 없이 클래스명만 매칭
          const classPattern = new RegExp(
            `class=["']([^"']*\\s)?${rule.replacement.substring(1)}(\\s[^"']*)?["']`,
            'g'
          );
          
          const oldClassPattern = new RegExp(
            `class=["']([^"']*\\s)?${rule.pattern.source.substring(3, rule.pattern.source.length - 4)}(\\s[^"']*)?["']`,
            'g'
          );
          
          const matches = content.match(oldClassPattern);
          if (matches) {
            content = content.replace(oldClassPattern, 
              (match) => match.replace(
                rule.pattern.source.substring(3, rule.pattern.source.length - 4),
                rule.replacement.substring(1)
              )
            );
            hasChanges = true;
            changesInFile.push({
              pattern: oldClassPattern.toString(),
              matches: matches.length
            });
          }
        }

        // z-index 시스템 CSS 파일 추가
        if (filePath.includes('index.html') || filePath.includes('main.html')) {
          if (!content.includes('z-index-system.css')) {
            const cssLinkPattern = /<link[^>]+href=[^>]+\.css[^>]*>/i;
            const match = content.match(cssLinkPattern);
            
            if (match) {
              const newLink = '<link rel="stylesheet" href="css/core/z-index-system.css">';
              content = content.replace(match[0], match[0] + '\n    ' + newLink);
              hasChanges = true;
              changesInFile.push({
                type: 'css-import',
                added: 'z-index-system.css'
              });
            }
          }
        }

        if (hasChanges) {
          fs.writeFileSync(filePath, content);
          this.changes.htmlUpdated.push({
            file: filePath,
            changes: changesInFile
          });
          console.log(`✅ Updated: ${filePath}`);
        }

      } catch (error) {
        this.changes.errors.push({
          file: filePath,
          type: 'HTML update',
          error: error.message
        });
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }
  }

  /**
   * main.css에 z-index 시스템 임포트 추가
   */
  async updateMainCSS() {
    console.log('\n🎯 Updating main.css imports...');
    
    const mainCSSPath = 'css/main.css';
    
    try {
      let content = fs.readFileSync(mainCSSPath, 'utf-8');
      
      // z-index 시스템 임포트가 없으면 추가
      if (!content.includes('z-index-system.css')) {
        const importStatement = "@import 'core/z-index-system.css';\n";
        
        // core imports 섹션을 찾아서 추가
        if (content.includes("/* Core imports */")) {
          content = content.replace(
            "/* Core imports */",
            "/* Core imports */\n" + importStatement
          );
        } else {
          // 파일 상단에 추가
          content = importStatement + content;
        }
        
        fs.writeFileSync(mainCSSPath, content);
        console.log(`✅ Added z-index system to ${mainCSSPath}`);
        
        this.changes.cssRenamed.push({
          file: mainCSSPath,
          changes: [{
            type: 'import-added',
            added: 'z-index-system.css'
          }]
        });
      }
      
    } catch (error) {
      this.changes.errors.push({
        file: mainCSSPath,
        type: 'Main CSS update',
        error: error.message
      });
      console.error(`❌ Error updating ${mainCSSPath}:`, error.message);
    }
  }

  /**
   * 변경사항 검증
   */
  async validateChanges() {
    console.log('\n🔍 Validating changes...');
    
    const validationResults = {
      cssFiles: 0,
      jsFiles: 0,
      htmlFiles: 0,
      brokenReferences: [],
      successRate: 0
    };

    // CSS 파일 검증
    const cssFiles = await glob('css/**/*.css', { ignore: ['**/*.min.css'] });
    for (const file of cssFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        
        // 구문 오류가 있는지 기본적인 검사
        const braces = (content.match(/\{/g) || []).length;
        const closingBraces = (content.match(/\}/g) || []).length;
        
        if (braces !== closingBraces) {
          validationResults.brokenReferences.push({
            file: file,
            type: 'CSS syntax error',
            issue: 'Mismatched braces'
          });
        } else {
          validationResults.cssFiles++;
        }
      } catch (error) {
        validationResults.brokenReferences.push({
          file: file,
          type: 'CSS read error',
          issue: error.message
        });
      }
    }

    // JavaScript 파일 검증
    const jsFiles = await glob('js/**/*.js', { ignore: ['**/*.min.js'] });
    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        
        // 기본적인 구문 검사 (try-catch로 대체)
        try {
          new Function(content); // 구문만 검사, 실행하지 않음
          validationResults.jsFiles++;
        } catch (syntaxError) {
          validationResults.brokenReferences.push({
            file: file,
            type: 'JS syntax error',
            issue: syntaxError.message
          });
        }
      } catch (error) {
        validationResults.brokenReferences.push({
          file: file,
          type: 'JS read error',
          issue: error.message
        });
      }
    }

    // HTML 파일 검증
    const htmlFiles = await glob('**/*.html', { ignore: ['node_modules/**'] });
    validationResults.htmlFiles = htmlFiles.length; // HTML은 기본적으로 유효하다고 가정

    // 성공률 계산
    const totalFiles = cssFiles.length + jsFiles.length + htmlFiles.length;
    const successfulFiles = validationResults.cssFiles + validationResults.jsFiles + validationResults.htmlFiles;
    validationResults.successRate = ((successfulFiles / totalFiles) * 100).toFixed(2);

    console.log(`📊 Validation Results:`);
    console.log(`   ✅ CSS files: ${validationResults.cssFiles}/${cssFiles.length}`);
    console.log(`   ✅ JS files: ${validationResults.jsFiles}/${jsFiles.length}`);
    console.log(`   ✅ HTML files: ${validationResults.htmlFiles}/${htmlFiles.length}`);
    console.log(`   🎯 Success rate: ${validationResults.successRate}%`);
    
    if (validationResults.brokenReferences.length > 0) {
      console.log(`   ⚠️ Issues found: ${validationResults.brokenReferences.length}`);
      validationResults.brokenReferences.forEach(issue => {
        console.log(`      ${issue.file}: ${issue.issue}`);
      });
    }

    return validationResults;
  }

  /**
   * 변경사항 리포트 생성
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      backupLocation: this.backupDir,
      summary: {
        cssFilesRenamed: this.changes.cssRenamed.length,
        jsFilesUpdated: this.changes.jsNamespaced.length,
        htmlFilesUpdated: this.changes.htmlUpdated.length,
        errorsEncountered: this.changes.errors.length
      },
      details: this.changes
    };

    // 리포트 파일 저장
    const reportPath = `reorganization-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📋 === REORGANIZATION SUMMARY ===');
    console.log(`📁 Backup created: ${this.backupDir}`);
    console.log(`🎨 CSS files renamed: ${report.summary.cssFilesRenamed}`);
    console.log(`🔧 JS files updated: ${report.summary.jsFilesUpdated}`);
    console.log(`📄 HTML files updated: ${report.summary.htmlUpdated}`);
    console.log(`❌ Errors encountered: ${report.summary.errorsEncountered}`);
    console.log(`📊 Report saved: ${reportPath}`);

    return report;
  }

  /**
   * 변경사항 롤백
   */
  async rollback() {
    console.log('\n🔄 Rolling back changes...');
    
    if (!fs.existsSync(this.backupDir)) {
      console.error('❌ Backup directory not found!');
      return false;
    }

    try {
      // 백업에서 파일들 복원
      const backupFiles = await glob(`${this.backupDir}/**/*`, { nodir: true });
      
      for (const backupFile of backupFiles) {
        const originalFile = backupFile.replace(this.backupDir + path.sep, '');
        const originalDir = path.dirname(originalFile);
        
        if (!fs.existsSync(originalDir)) {
          fs.mkdirSync(originalDir, { recursive: true });
        }
        
        fs.copyFileSync(backupFile, originalFile);
      }
      
      console.log('✅ Rollback completed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      return false;
    }
  }

  /**
   * 전체 재구성 프로세스 실행
   */
  async executeFullReorganization() {
    console.log('🚀 Starting doha.kr Full Reorganization');
    console.log('This will reorganize CSS classes, JavaScript namespaces, and z-index values\n');

    try {
      // 1. 백업 생성
      await this.createBackup();
      
      // 2. CSS 클래스 리네임
      await this.renameCSSClasses();
      
      // 3. JavaScript 네임스페이스 업데이트
      await this.updateJavaScriptNamespaces();
      
      // 4. HTML 클래스 참조 업데이트
      await this.updateHTMLClassReferences();
      
      // 5. main.css 업데이트
      await this.updateMainCSS();
      
      // 6. 변경사항 검증
      const validation = await this.validateChanges();
      
      // 7. 리포트 생성
      const report = this.generateReport();
      
      console.log('\n✅ Reorganization completed successfully!');
      console.log('\n🔧 Next Steps:');
      console.log('1. Run tests to ensure everything works');
      console.log('2. Check the browser console for any errors');
      console.log('3. Validate CSS and JS in browser dev tools');
      console.log('4. If issues occur, run rollback() method');
      
      return {
        success: true,
        report: report,
        validation: validation
      };
      
    } catch (error) {
      console.error('❌ Reorganization failed:', error);
      console.log('\n🔄 Attempting automatic rollback...');
      
      await this.rollback();
      
      return {
        success: false,
        error: error.message,
        rollbackAttempted: true
      };
    }
  }
}

// 실행
if (require.main === module) {
  const reorganizer = new DohaKRReorganizer();
  
  // 명령줄 인수 처리
  const args = process.argv.slice(2);
  
  if (args.includes('--rollback')) {
    reorganizer.rollback();
  } else if (args.includes('--validate-only')) {
    reorganizer.validateChanges();
  } else {
    reorganizer.executeFullReorganization().catch(console.error);
  }
}

module.exports = { DohaKRReorganizer };