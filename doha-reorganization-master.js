/**
 * doha.kr 마스터 재구성 관리 도구
 * 전체 재구성 프로세스를 통합 관리하는 마스터 스크립트
 */

const { CSSAnalyzer } = require('./analyze-css-duplicates');
const { DohaKRReorganizer } = require('./rename-duplicates');
const { ReorganizationValidator } = require('./validate-reorganization');
const fs = require('fs');
const readline = require('readline');

class DohaKRMasterReorganizer {
  constructor() {
    this.processSteps = [
      { id: 'analysis', name: 'CSS Duplicate Analysis', completed: false },
      { id: 'reorganization', name: 'Full System Reorganization', completed: false },
      { id: 'validation', name: 'System Validation', completed: false },
      { id: 'testing', name: 'Manual Testing Guide', completed: false }
    ];
    
    this.results = {
      analysis: null,
      reorganization: null,
      validation: null,
      finalReport: null
    };
  }

  /**
   * 사용자 확인 프롬프트
   */
  async promptUser(message) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(`${message} (y/N): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  /**
   * 진행상황 표시
   */
  displayProgress() {
    console.log('\n📋 === DOHA.KR REORGANIZATION PROGRESS ===');
    this.processSteps.forEach((step, index) => {
      const status = step.completed ? '✅' : '⏳';
      const current = this.currentStep === step.id ? '👉 ' : '   ';
      console.log(`${current}${index + 1}. ${status} ${step.name}`);
    });
    console.log('='.repeat(45));
  }

  /**
   * 단계 완료 표시
   */
  markStepCompleted(stepId) {
    const step = this.processSteps.find(s => s.id === stepId);
    if (step) {
      step.completed = true;
    }
  }

  /**
   * Step 1: CSS 중복 분석
   */
  async runCSSAnalysis() {
    this.currentStep = 'analysis';
    this.displayProgress();
    
    console.log('\n🔍 Starting CSS Duplicate Analysis...');
    console.log('This will analyze all CSS files for duplicate classes and naming conflicts.');
    
    if (!(await this.promptUser('Proceed with CSS analysis?'))) {
      console.log('❌ Analysis cancelled by user');
      return false;
    }

    try {
      const analyzer = new CSSAnalyzer();
      this.results.analysis = await analyzer.runFullAnalysis();
      
      this.markStepCompleted('analysis');
      console.log('✅ CSS Analysis completed successfully');
      
      return true;
    } catch (error) {
      console.error('❌ CSS Analysis failed:', error);
      return false;
    }
  }

  /**
   * Step 2: 전체 시스템 재구성
   */
  async runSystemReorganization() {
    this.currentStep = 'reorganization';
    this.displayProgress();
    
    console.log('\n🔄 Starting System Reorganization...');
    console.log('This will:');
    console.log('• Rename duplicate CSS classes with appropriate prefixes');
    console.log('• Migrate JavaScript globals to DohaKR namespace');
    console.log('• Convert hardcoded z-index values to CSS variables');
    console.log('• Update all HTML references');
    console.log('• Create automatic backups');
    
    console.log('\n⚠️  IMPORTANT: This will modify your files!');
    console.log('   A backup will be created, but please ensure you have committed your changes.');
    
    if (!(await this.promptUser('Proceed with system reorganization?'))) {
      console.log('❌ Reorganization cancelled by user');
      return false;
    }

    try {
      const reorganizer = new DohaKRReorganizer();
      this.results.reorganization = await reorganizer.executeFullReorganization();
      
      if (this.results.reorganization.success) {
        this.markStepCompleted('reorganization');
        console.log('✅ System Reorganization completed successfully');
        return true;
      } else {
        console.log('❌ System Reorganization failed - rollback attempted');
        return false;
      }
    } catch (error) {
      console.error('❌ System Reorganization failed:', error);
      return false;
    }
  }

  /**
   * Step 3: 시스템 검증
   */
  async runSystemValidation() {
    this.currentStep = 'validation';
    this.displayProgress();
    
    console.log('\n✅ Starting System Validation...');
    console.log('This will validate the reorganization results:');
    console.log('• Check JavaScript namespace migration');
    console.log('• Verify CSS class renaming');
    console.log('• Validate z-index system integration');
    console.log('• Test system integration');
    
    try {
      const validator = new ReorganizationValidator();
      this.results.validation = await validator.runFullValidation();
      
      this.markStepCompleted('validation');
      console.log('✅ System Validation completed successfully');
      
      return true;
    } catch (error) {
      console.error('❌ System Validation failed:', error);
      return false;
    }
  }

  /**
   * Step 4: 수동 테스팅 가이드 생성
   */
  async generateTestingGuide() {
    this.currentStep = 'testing';
    this.displayProgress();
    
    console.log('\n📋 Generating Manual Testing Guide...');
    
    const testingGuide = {
      timestamp: new Date().toISOString(),
      priority: 'HIGH',
      testingSteps: [
        {
          category: 'Basic Functionality',
          tests: [
            {
              name: 'Homepage Load',
              steps: [
                '1. Open index.html in browser',
                '2. Check for console errors (F12)',
                '3. Verify all CSS styles load correctly',
                '4. Test responsive layout'
              ],
              expectedResult: 'No errors, proper styling'
            },
            {
              name: 'JavaScript Services',
              steps: [
                '1. Open browser console',
                '2. Type: DohaKR',
                '3. Verify namespace structure',
                '4. Test: DohaKR.API.Manager'
              ],
              expectedResult: 'DohaKR namespace accessible'
            }
          ]
        },
        {
          category: 'Feature Testing',
          tests: [
            {
              name: 'Fortune Services',
              steps: [
                '1. Navigate to fortune pages',
                '2. Test daily fortune generation',
                '3. Check modal/popup z-index',
                '4. Verify API calls work'
              ],
              expectedResult: 'All fortune features functional'
            },
            {
              name: 'Psychological Tests',
              steps: [
                '1. Start MBTI test',
                '2. Complete test flow',
                '3. Check result display',
                '4. Verify CSS classes applied'
              ],
              expectedResult: 'Tests complete successfully'
            },
            {
              name: 'Tools',
              steps: [
                '1. Test BMI calculator',
                '2. Test salary calculator',
                '3. Test text counter',
                '4. Verify all calculations'
              ],
              expectedResult: 'All tools work correctly'
            }
          ]
        },
        {
          category: 'Design System',
          tests: [
            {
              name: 'Theme Switching',
              steps: [
                '1. Switch to dark mode',
                '2. Check z-index layering',
                '3. Verify color variables',
                '4. Test responsive breakpoints'
              ],
              expectedResult: 'Smooth theme transitions'
            },
            {
              name: 'Component Styling',
              steps: [
                '1. Check button variants',
                '2. Test card components',
                '3. Verify form elements',
                '4. Test navigation menu'
              ],
              expectedResult: 'All components properly styled'
            }
          ]
        },
        {
          category: 'Mobile Testing',
          tests: [
            {
              name: 'Mobile Navigation',
              steps: [
                '1. Open on mobile device',
                '2. Test mobile menu',
                '3. Check z-index stacking',
                '4. Test touch interactions'
              ],
              expectedResult: 'Mobile experience smooth'
            },
            {
              name: 'PWA Features',
              steps: [
                '1. Test PWA install prompt',
                '2. Check service worker',
                '3. Test offline functionality',
                '4. Verify manifest.json'
              ],
              expectedResult: 'PWA features working'
            }
          ]
        }
      ],
      rollbackInstructions: {
        title: 'If Issues Are Found',
        steps: [
          '1. Stop using the reorganized version immediately',
          '2. Run: node doha-reorganization-master.js --rollback',
          '3. Or manually restore from backup directory',
          '4. Report issues with specific error messages',
          '5. Wait for fixes before retrying reorganization'
        ]
      },
      performanceChecklist: [
        'Run Lighthouse audit (target: 90+ all categories)',
        'Check bundle sizes (CSS should be smaller)',
        'Test page load times',
        'Verify no console errors or warnings',
        'Check mobile performance metrics'
      ]
    };

    // 테스팅 가이드 파일 저장
    const guideFilename = `manual-testing-guide-${Date.now()}.json`;
    fs.writeFileSync(guideFilename, JSON.stringify(testingGuide, null, 2));
    
    // 사용자 친화적인 마크다운 가이드도 생성
    const markdownGuide = this.generateMarkdownGuide(testingGuide);
    const mdFilename = `TESTING-GUIDE-${Date.now()}.md`;
    fs.writeFileSync(mdFilename, markdownGuide);
    
    console.log(`📋 Testing guide generated:`);
    console.log(`   📄 JSON: ${guideFilename}`);
    console.log(`   📝 Markdown: ${mdFilename}`);
    
    this.markStepCompleted('testing');
    return true;
  }

  /**
   * 마크다운 테스팅 가이드 생성
   */
  generateMarkdownGuide(guide) {
    let markdown = `# doha.kr Reorganization Testing Guide\n\n`;
    markdown += `*Generated on: ${new Date().toLocaleString()}*\n\n`;
    markdown += `## 🚨 Priority: ${guide.priority}\n\n`;
    markdown += `This guide helps you manually test the reorganized doha.kr system to ensure everything works correctly.\n\n`;

    // 테스트 카테고리별 섹션
    guide.testingSteps.forEach(category => {
      markdown += `## ${category.category}\n\n`;
      
      category.tests.forEach(test => {
        markdown += `### ${test.name}\n\n`;
        markdown += `**Steps:**\n`;
        test.steps.forEach(step => {
          markdown += `${step}\n`;
        });
        markdown += `\n**Expected Result:** ${test.expectedResult}\n\n`;
        markdown += `---\n\n`;
      });
    });

    // 롤백 지침
    markdown += `## 🔄 ${guide.rollbackInstructions.title}\n\n`;
    guide.rollbackInstructions.steps.forEach(step => {
      markdown += `${step}\n`;
    });
    markdown += `\n`;

    // 성능 체크리스트
    markdown += `## ⚡ Performance Checklist\n\n`;
    guide.performanceChecklist.forEach(item => {
      markdown += `- [ ] ${item}\n`;
    });
    markdown += `\n`;

    return markdown;
  }

  /**
   * 최종 리포트 생성
   */
  generateFinalReport() {
    const report = {
      timestamp: new Date().toISOString(),
      processComplete: this.processSteps.every(step => step.completed),
      summary: {
        analysisResults: this.results.analysis ? {
          totalFiles: this.results.analysis.summary.filesAnalyzed,
          duplicateClasses: this.results.analysis.summary.duplicateClasses,
          duplicatePercentage: this.results.analysis.summary.duplicatePercentage
        } : null,
        
        reorganizationResults: this.results.reorganization ? {
          cssFilesRenamed: this.results.reorganization.report.summary.cssFilesRenamed,
          jsFilesUpdated: this.results.reorganization.report.summary.jsFilesUpdated,
          htmlFilesUpdated: this.results.reorganization.report.summary.htmlFilesUpdated,
          errorsEncountered: this.results.reorganization.report.summary.errorsEncountered
        } : null,
        
        validationResults: this.results.validation ? {
          healthScore: this.calculateHealthScore(this.results.validation),
          criticalIssues: this.results.validation.recommendations.filter(r => r.priority === 'Critical').length,
          totalRecommendations: this.results.validation.recommendations.length
        } : null
      },
      nextSteps: this.generateNextSteps(),
      completedSteps: this.processSteps.filter(step => step.completed).map(step => step.name),
      pendingSteps: this.processSteps.filter(step => !step.completed).map(step => step.name)
    };

    const reportFilename = `final-reorganization-report-${Date.now()}.json`;
    fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));

    return { report, filename: reportFilename };
  }

  /**
   * 건강도 점수 계산
   */
  calculateHealthScore(validationResults) {
    const totalIssues = validationResults.summary.namespaceMigration.pendingFiles +
                       validationResults.summary.cssRename.missingClasses +
                       validationResults.summary.integration.syntaxErrors +
                       validationResults.summary.integration.brokenReferences;
    
    return Math.max(0, 100 - (totalIssues * 10));
  }

  /**
   * 다음 단계 제안
   */
  generateNextSteps() {
    const nextSteps = [];
    
    if (this.processSteps.every(step => step.completed)) {
      nextSteps.push('✅ All reorganization steps completed successfully!');
      nextSteps.push('🔧 Follow the manual testing guide to verify functionality');
      nextSteps.push('📊 Run performance audits to measure improvements');
      nextSteps.push('🚀 Deploy to staging environment for further testing');
      nextSteps.push('📝 Update team documentation with new structure');
    } else {
      const pendingSteps = this.processSteps.filter(step => !step.completed);
      nextSteps.push(`⏳ ${pendingSteps.length} steps remaining:`);
      pendingSteps.forEach(step => {
        nextSteps.push(`   • ${step.name}`);
      });
    }
    
    if (this.results.validation && this.results.validation.recommendations.length > 0) {
      const criticalIssues = this.results.validation.recommendations.filter(r => r.priority === 'Critical');
      if (criticalIssues.length > 0) {
        nextSteps.push(`🚨 ${criticalIssues.length} critical issues need immediate attention`);
      }
    }
    
    return nextSteps;
  }

  /**
   * 롤백 기능
   */
  async rollback() {
    console.log('🔄 Starting rollback process...');
    
    if (this.results.reorganization && this.results.reorganization.report) {
      const backupDir = this.results.reorganization.report.backupLocation;
      if (fs.existsSync(backupDir)) {
        const reorganizer = new DohaKRReorganizer();
        const success = await reorganizer.rollback();
        
        if (success) {
          console.log('✅ Rollback completed successfully');
          return true;
        } else {
          console.log('❌ Rollback failed');
          return false;
        }
      }
    }
    
    console.log('❌ No backup found for rollback');
    return false;
  }

  /**
   * 전체 마스터 프로세스 실행
   */
  async runMasterProcess() {
    console.log('🌟 === DOHA.KR MASTER REORGANIZATION PROCESS ===\n');
    console.log('This process will comprehensively reorganize the doha.kr project:');
    console.log('• Analyze and resolve CSS class duplicates');
    console.log('• Migrate JavaScript to unified namespace');
    console.log('• Implement centralized z-index system');
    console.log('• Validate all changes');
    console.log('• Generate testing guidelines\n');

    const startTime = Date.now();

    try {
      // Step 1: CSS 분석
      console.log('📋 Step 1/4: CSS Duplicate Analysis');
      const analysisSuccess = await this.runCSSAnalysis();
      if (!analysisSuccess) {
        console.log('❌ Process stopped due to analysis failure');
        return false;
      }

      // Step 2: 시스템 재구성
      console.log('\n📋 Step 2/4: System Reorganization');
      const reorganizationSuccess = await this.runSystemReorganization();
      if (!reorganizationSuccess) {
        console.log('❌ Process stopped due to reorganization failure');
        return false;
      }

      // Step 3: 시스템 검증
      console.log('\n📋 Step 3/4: System Validation');
      const validationSuccess = await this.runSystemValidation();
      if (!validationSuccess) {
        console.log('⚠️ Validation failed, but process continues');
      }

      // Step 4: 테스팅 가이드 생성
      console.log('\n📋 Step 4/4: Testing Guide Generation');
      await this.generateTestingGuide();

      // 최종 리포트
      const { report, filename } = this.generateFinalReport();
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log('\n🎉 === MASTER PROCESS COMPLETED ===');
      console.log(`⏱️  Total time: ${duration} seconds`);
      console.log(`📄 Final report: ${filename}`);
      
      // 최종 상태 표시
      this.displayProgress();
      
      console.log('\n🚀 Next Steps:');
      report.nextSteps.forEach(step => console.log(`   ${step}`));
      
      return true;

    } catch (error) {
      console.error('❌ Master process failed:', error);
      console.log('\n🔄 Consider running rollback if partial changes were made');
      return false;
    }
  }
}

// 명령행 인터페이스
async function main() {
  const args = process.argv.slice(2);
  const master = new DohaKRMasterReorganizer();

  if (args.includes('--rollback')) {
    await master.rollback();
  } else if (args.includes('--analysis-only')) {
    await master.runCSSAnalysis();
  } else if (args.includes('--validation-only')) {
    await master.runSystemValidation();
  } else if (args.includes('--help')) {
    console.log(`
doha.kr Master Reorganization Tool

Usage:
  node doha-reorganization-master.js           # Run full process
  node doha-reorganization-master.js --rollback    # Rollback changes
  node doha-reorganization-master.js --analysis-only   # CSS analysis only
  node doha-reorganization-master.js --validation-only # Validation only
  node doha-reorganization-master.js --help           # Show this help

The full process includes:
1. CSS duplicate analysis
2. System reorganization (CSS + JS + z-index)
3. System validation
4. Testing guide generation
    `);
  } else {
    await master.runMasterProcess();
  }
}

// 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DohaKRMasterReorganizer };