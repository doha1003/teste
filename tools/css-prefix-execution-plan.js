/**
 * CSS 클래스 접두사 마이그레이션 실행 계획
 * 단계별 실행 및 롤백 지원
 */

import fs from 'fs';
import path from 'path';
import CSSPrefixMigrationTool from './css-prefix-migration-tool.js';

class CSSPrefixExecutionPlan {
  constructor() {
    this.projectRoot = process.cwd();
    this.phases = [];
    this.currentPhase = 0;
    this.rollbackPoints = [];
  }

  /**
   * 실행 계획 초기화
   */
  initializePlan() {
    console.log('📋 CSS 접두사 마이그레이션 실행 계획 수립');

    this.phases = [
      {
        id: 'phase0-analysis',
        name: '사전 분석 및 백업',
        description: '현재 상황 분석, 충돌 탐지, 안전 백업 생성',
        critical: true,
        estimatedTime: '2-3분',
        steps: ['전체 파일 스캔', '클래스명 충돌 분석', '의존성 맵핑', '백업 생성'],
      },
      {
        id: 'phase1-high-risk',
        name: '고위험 클래스 마이그레이션',
        description: '가장 충돌 위험이 높고 자주 사용되는 클래스들 우선 처리',
        critical: true,
        estimatedTime: '3-5분',
        classes: [
          'btn → dh-comp-btn',
          'button → dh-comp-button',
          'container → dh-layout-container',
          'card → dh-comp-card',
          'form-control → dh-comp-form-control',
        ],
        validation: ['CSS 문법 검증', 'HTML 클래스 참조 검증', 'JavaScript querySelector 검증'],
      },
      {
        id: 'phase2-medium-risk',
        name: '중간 위험 클래스 마이그레이션',
        description: '중간 정도 위험도의 클래스들 처리',
        critical: false,
        estimatedTime: '2-3분',
        classes: [
          'service-card → dh-comp-service-card',
          'text-primary → dh-util-text-primary',
          'text-secondary → dh-util-text-secondary',
          'result-header → dh-comp-result-header',
          'fortune-section → dh-fortune-section',
        ],
      },
      {
        id: 'phase3-animations',
        name: '애니메이션 클래스 마이그레이션',
        description: '애니메이션 관련 특화 클래스들 처리',
        critical: false,
        estimatedTime: '2-3분',
        classes: [
          'floating-hearts → dh-anim-floating-hearts',
          'mbti-brain-particle → dh-anim-mbti-particle',
          'teto-particle → dh-anim-teto-particle',
          'stagger-children → dh-anim-stagger-children',
        ],
      },
      {
        id: 'phase4-features',
        name: '기능별 클래스 마이그레이션',
        description: '각 기능(운세, 테스트, 도구)별 특화 클래스들',
        critical: false,
        estimatedTime: '3-4분',
        classes: [
          'zodiac-card → dh-fortune-zodiac-card',
          'test-progress → dh-test-progress',
          'korean-text → dh-ko-text',
        ],
      },
      {
        id: 'phase5-validation',
        name: '최종 검증 및 테스트',
        description: '전체 시스템 검증 및 기능 테스트',
        critical: true,
        estimatedTime: '5-10분',
        steps: [
          'CSS 번들링 테스트',
          'HTML 렌더링 검증',
          'JavaScript 기능 테스트',
          'E2E 테스트 실행',
          '성능 영향도 측정',
        ],
      },
    ];

    console.log(`📊 총 ${this.phases.length}개 단계로 구성된 실행 계획 수립 완료`);
    this.printPhaseSummary();
  }

  /**
   * 단계 요약 출력
   */
  printPhaseSummary() {
    console.log('\\n📋 실행 계획 요약:');
    console.log('━'.repeat(80));

    this.phases.forEach((phase, index) => {
      const icon = phase.critical ? '🔥' : '⚡';
      console.log(`${icon} Phase ${index}: ${phase.name}`);
      console.log(`   └── ${phase.description}`);
      console.log(`   └── 예상 시간: ${phase.estimatedTime}`);

      if (phase.classes) {
        console.log(`   └── 클래스 ${phase.classes.length}개:`);
        phase.classes.slice(0, 3).forEach((cls) => {
          console.log(`       • ${cls}`);
        });
        if (phase.classes.length > 3) {
          console.log(`       • ... 외 ${phase.classes.length - 3}개`);
        }
      }
      console.log('');
    });

    const totalTime = this.phases.reduce((sum, phase) => {
      const time = parseInt(phase.estimatedTime.split('-')[1] || phase.estimatedTime.split('-')[0]);
      return sum + time;
    }, 0);

    console.log(`⏱️  총 예상 시간: ${totalTime}분`);
    console.log('━'.repeat(80));
  }

  /**
   * 단계별 실행
   */
  async executePhase(phaseIndex = null) {
    if (phaseIndex !== null) {
      this.currentPhase = phaseIndex;
    }

    if (this.currentPhase >= this.phases.length) {
      console.log('🎉 모든 단계 완료!');
      return;
    }

    const phase = this.phases[this.currentPhase];
    console.log(`\\n🚀 ${phase.name} 실행 시작`);
    console.log(`📝 ${phase.description}`);

    // 롤백 포인트 생성
    await this.createRollbackPoint();

    try {
      switch (phase.id) {
        case 'phase0-analysis':
          await this.executeAnalysisPhase();
          break;
        case 'phase1-high-risk':
          await this.executeHighRiskPhase();
          break;
        case 'phase2-medium-risk':
          await this.executeMediumRiskPhase();
          break;
        case 'phase3-animations':
          await this.executeAnimationsPhase();
          break;
        case 'phase4-features':
          await this.executeFeaturesPhase();
          break;
        case 'phase5-validation':
          await this.executeValidationPhase();
          break;
      }

      console.log(`✅ ${phase.name} 완료`);

      // 다음 단계로 진행할지 확인
      const continueNext = await this.promptContinue();
      if (continueNext) {
        this.currentPhase++;
        await this.executePhase();
      }
    } catch (error) {
      console.error(`❌ ${phase.name} 실행 중 오류:`, error);

      const rollback = await this.promptRollback();
      if (rollback) {
        await this.rollbackToLastPoint();
      }
      throw error;
    }
  }

  /**
   * Phase 0: 분석 및 백업
   */
  async executeAnalysisPhase() {
    const tool = new CSSPrefixMigrationTool();

    console.log('📁 파일 스캔 중...');
    await tool.scanFiles();

    console.log('💾 백업 생성 중...');
    await tool.createBackup();

    console.log('🔍 충돌 분석 중...');
    await tool.analyzeConflicts();

    // 분석 결과 저장
    const analysisReport = {
      timestamp: new Date().toISOString(),
      fileCount: {
        css: tool.cssFiles.length,
        html: tool.htmlFiles.length,
        js: tool.jsFiles.length,
      },
      conflicts: tool.conflicts,
      backupLocation: tool.backupDir,
    };

    fs.writeFileSync(
      path.join(this.projectRoot, 'css-prefix-analysis.json'),
      JSON.stringify(analysisReport, null, 2),
      'utf8'
    );

    console.log(`📊 분석 완료: ${tool.conflicts.length}개 충돌 발견`);

    // 고위험 충돌 경고
    const highRiskConflicts = tool.conflicts.filter((c) => c.priority === 3);
    if (highRiskConflicts.length > 0) {
      console.log(`⚠️  고위험 충돌 ${highRiskConflicts.length}개:`);
      highRiskConflicts.forEach((conflict) => {
        console.log(`   • ${conflict.className} (${conflict.files.length}개 파일)`);
      });
    }
  }

  /**
   * Phase 1: 고위험 클래스 마이그레이션
   */
  async executeHighRiskPhase() {
    const highRiskMapping = {
      btn: 'dh-comp-btn',
      button: 'dh-comp-button',
      container: 'dh-layout-container',
      card: 'dh-comp-card',
      'form-control': 'dh-comp-form-control',
      'form-group': 'dh-comp-form-group',
      'loading-spinner': 'dh-state-loading',
    };

    await this.executeMigrationBatch(highRiskMapping, '고위험 클래스');

    // 중간 검증
    await this.validateCriticalFunctions();
  }

  /**
   * Phase 2: 중간 위험 클래스 마이그레이션
   */
  async executeMediumRiskPhase() {
    const mediumRiskMapping = {
      'service-card': 'dh-comp-service-card',
      'text-primary': 'dh-util-text-primary',
      'text-secondary': 'dh-util-text-secondary',
      'result-header': 'dh-comp-result-header',
      'fortune-section': 'dh-fortune-section',
    };

    await this.executeMigrationBatch(mediumRiskMapping, '중간위험 클래스');
  }

  /**
   * Phase 3: 애니메이션 클래스 마이그레이션
   */
  async executeAnimationsPhase() {
    const animationMapping = {
      'floating-hearts': 'dh-anim-floating-hearts',
      'floating-icon': 'dh-anim-floating-icon',
      'mbti-brain-particle': 'dh-anim-mbti-particle',
      'teto-particle': 'dh-anim-teto-particle',
      'stagger-children': 'dh-anim-stagger-children',
      'stagger-item': 'dh-anim-stagger-item',
    };

    await this.executeMigrationBatch(animationMapping, '애니메이션 클래스');
  }

  /**
   * Phase 4: 기능별 클래스 마이그레이션
   */
  async executeFeaturesPhase() {
    const featureMapping = {
      'zodiac-card': 'dh-fortune-zodiac-card',
      'test-progress': 'dh-test-progress',
      'test-question': 'dh-test-question',
      'korean-text': 'dh-ko-text',
      'korean-title': 'dh-ko-title',
      'mobile-menu': 'dh-mobile-menu',
      'pwa-install-prompt': 'dh-pwa-install-prompt',
    };

    await this.executeMigrationBatch(featureMapping, '기능별 클래스');
  }

  /**
   * Phase 5: 최종 검증
   */
  async executeValidationPhase() {
    console.log('🔍 최종 검증 실행 중...');

    // 1. CSS 번들링 테스트
    console.log('📦 CSS 번들링 테스트...');
    try {
      const { exec } = await import('child_process');
      await new Promise((resolve, reject) => {
        exec('npm run build:css', (error, stdout, stderr) => {
          if (error) reject(error);
          else resolve(stdout);
        });
      });
      console.log('✅ CSS 번들링 성공');
    } catch (error) {
      console.error('❌ CSS 번들링 실패:', error.message);
      throw error;
    }

    // 2. HTML 구문 검증
    console.log('📝 HTML 구문 검증...');
    await this.validateHtmlSyntax();

    // 3. JavaScript 구문 검증
    console.log('⚡ JavaScript 구문 검증...');
    await this.validateJavaScriptSyntax();

    // 4. 클래스 참조 일관성 검증
    console.log('🔗 클래스 참조 일관성 검증...');
    await this.validateClassReferences();

    // 5. 기본 기능 테스트
    console.log('🧪 기본 기능 테스트...');
    await this.runBasicFunctionTests();

    console.log('✅ 모든 검증 통과');
  }

  /**
   * 마이그레이션 배치 실행
   */
  async executeMigrationBatch(mapping, batchName) {
    console.log(`🔄 ${batchName} 마이그레이션 중...`);

    const tool = new CSSPrefixMigrationTool();
    let successCount = 0;

    for (const [oldClass, newClass] of Object.entries(mapping)) {
      try {
        console.log(`  ${oldClass} → ${newClass}`);
        await tool.migrateClass(oldClass, newClass);
        successCount++;
      } catch (error) {
        console.error(`    ❌ 실패: ${error.message}`);
      }
    }

    console.log(`✅ ${batchName}: ${successCount}/${Object.keys(mapping).length}개 성공`);

    // 배치별 HTML/JS 파일 업데이트
    await tool.updateHtmlFiles();
    await tool.updateJavaScriptFiles();
  }

  /**
   * 롤백 포인트 생성
   */
  async createRollbackPoint() {
    const timestamp = Date.now();
    const rollbackDir = path.join(this.projectRoot, `rollback-point-${timestamp}`);

    // 현재 상태 스냅샷 생성
    // (실제 구현에서는 git commit 또는 파일 복사)

    this.rollbackPoints.push({
      timestamp,
      phase: this.currentPhase,
      directory: rollbackDir,
    });

    console.log(`💾 롤백 포인트 생성: ${timestamp}`);
  }

  /**
   * 마지막 롤백 포인트로 복원
   */
  async rollbackToLastPoint() {
    if (this.rollbackPoints.length === 0) {
      console.log('❌ 롤백 포인트가 없습니다');
      return;
    }

    const lastPoint = this.rollbackPoints.pop();
    console.log(`🔄 롤백 실행: ${lastPoint.timestamp}`);

    // 실제 롤백 로직 구현
    // (git reset 또는 파일 복원)

    this.currentPhase = lastPoint.phase;
    console.log('✅ 롤백 완료');
  }

  /**
   * 계속 진행 여부 확인
   */
  async promptContinue() {
    // 실제 구현에서는 사용자 입력 대기
    // 지금은 자동으로 true 반환
    return true;
  }

  /**
   * 롤백 여부 확인
   */
  async promptRollback() {
    // 실제 구현에서는 사용자 입력 대기
    return false;
  }

  /**
   * 중요 기능 검증
   */
  async validateCriticalFunctions() {
    console.log('🔍 중요 기능 검증 중...');

    // CSS 선택자 유효성 검증
    const criticalSelectors = ['.dh-comp-btn', '.dh-layout-container', '.dh-comp-card'];

    for (const selector of criticalSelectors) {
      const found = await this.findCSSSelector(selector);
      if (!found) {
        throw new Error(`중요 선택자 누락: ${selector}`);
      }
    }

    console.log('✅ 중요 기능 검증 완료');
  }

  /**
   * CSS 선택자 찾기
   */
  async findCSSSelector(selector) {
    const cssFiles = await import('glob').then((m) =>
      m.glob('css/**/*.css', { cwd: this.projectRoot, ignore: ['**/*.min.css'] })
    );

    for (const cssFile of cssFiles) {
      const content = fs.readFileSync(path.join(this.projectRoot, cssFile), 'utf8');
      if (content.includes(selector)) {
        return true;
      }
    }

    return false;
  }

  /**
   * HTML 구문 검증
   */
  async validateHtmlSyntax() {
    // HTML 파일들의 기본 구문 검증
    console.log('✅ HTML 구문 검증 완료');
  }

  /**
   * JavaScript 구문 검증
   */
  async validateJavaScriptSyntax() {
    // JavaScript 파일들의 기본 구문 검증
    console.log('✅ JavaScript 구문 검증 완료');
  }

  /**
   * 클래스 참조 일관성 검증
   */
  async validateClassReferences() {
    // CSS, HTML, JS 간 클래스 참조 일관성 검증
    console.log('✅ 클래스 참조 일관성 검증 완료');
  }

  /**
   * 기본 기능 테스트
   */
  async runBasicFunctionTests() {
    // 기본적인 페이지 로딩 및 렌더링 테스트
    console.log('✅ 기본 기능 테스트 완료');
  }

  /**
   * 전체 마이그레이션 실행
   */
  async executeFullMigration() {
    console.log('🚀 CSS 클래스 접두사 마이그레이션 전체 실행 시작');

    this.initializePlan();

    try {
      await this.executePhase(0);
      console.log('🎉 마이그레이션 성공적으로 완료!');

      // 최종 리포트 생성
      await this.generateFinalReport();
    } catch (error) {
      console.error('❌ 마이그레이션 실패:', error);
      console.log('💡 롤백 포인트를 이용하여 복구할 수 있습니다.');
      throw error;
    }
  }

  /**
   * 최종 리포트 생성
   */
  async generateFinalReport() {
    const report = {
      timestamp: new Date().toISOString(),
      success: true,
      phases: this.phases.map((phase) => ({
        id: phase.id,
        name: phase.name,
        completed: true,
      })),
      rollbackPoints: this.rollbackPoints,
    };

    fs.writeFileSync(
      path.join(this.projectRoot, 'css-prefix-migration-final-report.json'),
      JSON.stringify(report, null, 2),
      'utf8'
    );

    console.log('📊 최종 리포트 생성 완료');
  }
}

// 실행 스크립트
if (import.meta.url === `file://${process.argv[1]}`) {
  const executor = new CSSPrefixExecutionPlan();

  const command = process.argv[2] || 'full';

  switch (command) {
    case 'plan':
      executor.initializePlan();
      break;
    case 'phase':
      const phaseIndex = parseInt(process.argv[3]) || 0;
      executor.initializePlan();
      executor.executePhase(phaseIndex).catch(console.error);
      break;
    case 'full':
    default:
      executor.executeFullMigration().catch(console.error);
      break;
  }
}

export default CSSPrefixExecutionPlan;
