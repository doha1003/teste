/**
 * CSS 클래스 접두사 마이그레이션 영향도 분석 도구
 * HTML과 JavaScript 참조 영향도 상세 분석
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class CSSPrefixImpactAnalysis {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      cssFiles: [],
      htmlFiles: [],
      jsFiles: [],
      classUsage: new Map(),
      jsReferences: new Map(),
      htmlReferences: new Map(),
      riskAssessment: [],
    };
  }

  /**
   * 전체 영향도 분석 실행
   */
  async analyze() {
    console.log('🔍 CSS 클래스 접두사 마이그레이션 영향도 분석 시작');

    try {
      // 1. 파일 스캔
      await this.scanAllFiles();

      // 2. CSS 클래스 사용처 분석
      await this.analyzeCSSClassUsage();

      // 3. HTML 클래스 참조 분석
      await this.analyzeHTMLReferences();

      // 4. JavaScript 클래스 참조 분석
      await this.analyzeJavaScriptReferences();

      // 5. 위험도 평가
      await this.assessRisks();

      // 6. 리포트 생성
      await this.generateImpactReport();

      console.log('✅ 영향도 분석 완료!');
    } catch (error) {
      console.error('❌ 영향도 분석 중 오류:', error);
      throw error;
    }
  }

  /**
   * 모든 관련 파일 스캔
   */
  async scanAllFiles() {
    console.log('📁 파일 스캔 중...');

    // CSS 파일들 (minified 제외)
    this.results.cssFiles = await glob('css/**/*.css', {
      cwd: this.projectRoot,
      ignore: ['**/*.min.css', '**/node_modules/**'],
    });

    // HTML 파일들
    this.results.htmlFiles = await glob('**/*.html', {
      cwd: this.projectRoot,
      ignore: [
        'node_modules/**',
        '.backup/**',
        'dist/**',
        'test-results/**',
        'playwright-report/**',
      ],
    });

    // JavaScript 파일들
    this.results.jsFiles = await glob('js/**/*.js', {
      cwd: this.projectRoot,
      ignore: ['**/*.min.js', '**/node_modules/**'],
    });

    console.log(
      `📊 파일 스캔 완료: CSS ${this.results.cssFiles.length}개, HTML ${this.results.htmlFiles.length}개, JS ${this.results.jsFiles.length}개`
    );
  }

  /**
   * CSS 클래스 사용처 분석
   */
  async analyzeCSSClassUsage() {
    console.log('🎨 CSS 클래스 사용처 분석 중...');

    for (const cssFile of this.results.cssFiles) {
      const filePath = path.join(this.projectRoot, cssFile);
      const content = fs.readFileSync(filePath, 'utf8');

      // CSS 클래스 선택자 추출
      const classMatches = content.match(/\\.([a-zA-Z][a-zA-Z0-9_-]*(?:-[a-zA-Z0-9_-]*)*)/g);

      if (classMatches) {
        for (const match of classMatches) {
          const className = match.substring(1); // Remove leading dot

          if (!this.results.classUsage.has(className)) {
            this.results.classUsage.set(className, {
              cssFiles: [],
              htmlFiles: [],
              jsFiles: [],
              totalOccurrences: 0,
            });
          }

          const usage = this.results.classUsage.get(className);
          usage.cssFiles.push(cssFile);
          usage.totalOccurrences++;
        }
      }
    }

    console.log(`🔍 ${this.results.classUsage.size}개의 고유 클래스명 발견`);
  }

  /**
   * HTML 클래스 참조 분석
   */
  async analyzeHTMLReferences() {
    console.log('📄 HTML 클래스 참조 분석 중...');

    for (const htmlFile of this.results.htmlFiles) {
      const filePath = path.join(this.projectRoot, htmlFile);
      const content = fs.readFileSync(filePath, 'utf8');

      // class 속성에서 클래스명 추출
      const classAttributeRegex = /class=["']([^"']+)["']/g;
      let match;

      while ((match = classAttributeRegex.exec(content)) !== null) {
        const classNames = match[1].split(/\\s+/).filter((name) => name.length > 0);

        for (const className of classNames) {
          if (!this.results.htmlReferences.has(className)) {
            this.results.htmlReferences.set(className, []);
          }
          this.results.htmlReferences.get(className).push({
            file: htmlFile,
            line: this.getLineNumber(content, match.index),
            context: this.getContext(content, match.index, 50),
          });

          // classUsage 맵 업데이트
          if (this.results.classUsage.has(className)) {
            this.results.classUsage.get(className).htmlFiles.push(htmlFile);
          }
        }
      }
    }

    console.log(`🔗 ${this.results.htmlReferences.size}개 클래스의 HTML 참조 발견`);
  }

  /**
   * JavaScript 클래스 참조 분석
   */
  async analyzeJavaScriptReferences() {
    console.log('⚡ JavaScript 클래스 참조 분석 중...');

    const jsPatterns = [
      // querySelector patterns
      /querySelector(?:All)?\\s*\\(\\s*['"`]([^'"`]+)['"`]/g,
      // getElementsByClassName patterns
      /getElementsByClassName\\s*\\(\\s*['"`]([^'"`]+)['"`]/g,
      // classList patterns
      /classList\\.(?:add|remove|contains|toggle)\\s*\\(\\s*['"`]([^'"`]+)['"`]/g,
    ];

    for (const jsFile of this.results.jsFiles) {
      const filePath = path.join(this.projectRoot, jsFile);
      const content = fs.readFileSync(filePath, 'utf8');

      for (const pattern of jsPatterns) {
        let match;
        pattern.lastIndex = 0; // Reset regex

        while ((match = pattern.exec(content)) !== null) {
          const selector = match[1];

          // Extract class names from selectors
          const classNames = this.extractClassNamesFromSelector(selector);

          for (const className of classNames) {
            if (!this.results.jsReferences.has(className)) {
              this.results.jsReferences.set(className, []);
            }

            this.results.jsReferences.get(className).push({
              file: jsFile,
              line: this.getLineNumber(content, match.index),
              context: this.getContext(content, match.index, 80),
              selector: selector,
              method: this.getMethodName(content, match.index),
            });

            // classUsage 맵 업데이트
            if (this.results.classUsage.has(className)) {
              this.results.classUsage.get(className).jsFiles.push(jsFile);
            }
          }
        }
      }
    }

    console.log(`🔗 ${this.results.jsReferences.size}개 클래스의 JavaScript 참조 발견`);
  }

  /**
   * 선택자에서 클래스명 추출
   */
  extractClassNamesFromSelector(selector) {
    const classNames = [];

    // CSS 선택자에서 클래스명 추출 (.class-name)
    const classMatches = selector.match(/\\.([a-zA-Z][a-zA-Z0-9_-]*)/g);

    if (classMatches) {
      classNames.push(...classMatches.map((match) => match.substring(1)));
    }

    // getElementById의 경우 ID이므로 제외
    // getElementsByClassName의 경우 클래스명 직접 사용
    if (!selector.includes('.') && !selector.includes('#') && !selector.includes('[')) {
      classNames.push(selector);
    }

    return [...new Set(classNames)]; // 중복 제거
  }

  /**
   * 위험도 평가
   */
  async assessRisks() {
    console.log('⚠️ 위험도 평가 중...');

    // 고위험 클래스명 패턴
    const highRiskPatterns = [
      /^btn$/,
      /^button$/,
      /^container$/,
      /^card$/,
      /^form-control$/,
      /^form-group$/,
      /^loading$/,
    ];

    // 중위험 클래스명 패턴
    const mediumRiskPatterns = [
      /^text-(primary|secondary)$/,
      /^service-card$/,
      /^result-/,
      /^nav-/,
      /^menu-/,
    ];

    for (const [className, usage] of this.results.classUsage) {
      const riskLevel = this.calculateRiskLevel(
        className,
        usage,
        highRiskPatterns,
        mediumRiskPatterns
      );

      if (riskLevel > 1) {
        this.results.riskAssessment.push({
          className,
          riskLevel,
          usage,
          htmlReferences: this.results.htmlReferences.get(className) || [],
          jsReferences: this.results.jsReferences.get(className) || [],
          recommendedAction: this.getRecommendedAction(className, riskLevel),
          estimatedEffort: this.estimateChangeEffort(usage),
        });
      }
    }

    // 위험도 순으로 정렬
    this.results.riskAssessment.sort((a, b) => b.riskLevel - a.riskLevel);

    console.log(`⚠️ ${this.results.riskAssessment.length}개의 위험 요소 식별`);
  }

  /**
   * 위험도 계산
   */
  calculateRiskLevel(className, usage, highRiskPatterns, mediumRiskPatterns) {
    let riskLevel = 0;

    // 패턴 기반 위험도
    if (highRiskPatterns.some((pattern) => pattern.test(className))) {
      riskLevel += 3;
    } else if (mediumRiskPatterns.some((pattern) => pattern.test(className))) {
      riskLevel += 2;
    }

    // 사용 빈도 기반 위험도
    const totalFiles = [...new Set([...usage.cssFiles, ...usage.htmlFiles, ...usage.jsFiles])]
      .length;
    if (totalFiles >= 10) riskLevel += 2;
    else if (totalFiles >= 5) riskLevel += 1;

    // JavaScript 참조 가중치
    if (usage.jsFiles.length > 0) {
      riskLevel += 1;
    }

    // 일반적인 이름일수록 위험
    if (className.length <= 3) {
      riskLevel += 1;
    }

    return riskLevel;
  }

  /**
   * 권장 조치 사항 결정
   */
  getRecommendedAction(className, riskLevel) {
    if (riskLevel >= 5) {
      return '즉시 마이그레이션 필요 - 최우선 작업';
    } else if (riskLevel >= 3) {
      return '우선 마이그레이션 권장 - 1차 작업';
    } else if (riskLevel >= 2) {
      return '계획적 마이그레이션 - 2차 작업';
    } else {
      return '선택적 마이그레이션 - 필요시 작업';
    }
  }

  /**
   * 변경 작업량 추정
   */
  estimateChangeEffort(usage) {
    const totalFiles = [...new Set([...usage.cssFiles, ...usage.htmlFiles, ...usage.jsFiles])]
      .length;

    if (totalFiles >= 15) return '대규모 (4-6시간)';
    if (totalFiles >= 8) return '중규모 (2-3시간)';
    if (totalFiles >= 3) return '소규모 (30분-1시간)';
    return '미세 (10-20분)';
  }

  /**
   * 텍스트에서 줄 번호 계산
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\\n').length;
  }

  /**
   * 컨텍스트 추출
   */
  getContext(content, index, length) {
    const start = Math.max(0, index - length);
    const end = Math.min(content.length, index + length);
    return content.substring(start, end).replace(/\\n/g, ' ').trim();
  }

  /**
   * JavaScript 메소드명 추출
   */
  getMethodName(content, index) {
    const beforeMatch = content.substring(Math.max(0, index - 50), index);
    const methodMatch = beforeMatch.match(
      /(querySelector(?:All)?|getElementsByClassName|classList\\.(add|remove|contains|toggle))$/
    );
    return methodMatch ? methodMatch[0] : 'unknown';
  }

  /**
   * 영향도 분석 리포트 생성
   */
  async generateImpactReport() {
    console.log('📊 영향도 분석 리포트 생성 중...');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalClassesFound: this.results.classUsage.size,
        highRiskClasses: this.results.riskAssessment.filter((r) => r.riskLevel >= 5).length,
        mediumRiskClasses: this.results.riskAssessment.filter(
          (r) => r.riskLevel >= 3 && r.riskLevel < 5
        ).length,
        lowRiskClasses: this.results.riskAssessment.filter((r) => r.riskLevel < 3).length,
        totalFilesScanned:
          this.results.cssFiles.length +
          this.results.htmlFiles.length +
          this.results.jsFiles.length,
      },
      fileCounts: {
        css: this.results.cssFiles.length,
        html: this.results.htmlFiles.length,
        js: this.results.jsFiles.length,
      },
      riskAssessment: this.results.riskAssessment,
      topConflicts: this.results.riskAssessment.slice(0, 20),
      migrationPlan: this.generateMigrationPlan(),
    };

    // JSON 리포트 저장
    const jsonReportPath = path.join(
      this.projectRoot,
      `css-prefix-impact-analysis-${Date.now()}.json`
    );
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2), 'utf8');

    // 마크다운 요약 리포트 생성
    const mdReportPath = path.join(this.projectRoot, `css-prefix-impact-summary-${Date.now()}.md`);
    const mdContent = this.generateMarkdownReport(report);
    fs.writeFileSync(mdReportPath, mdContent, 'utf8');

    // 콘솔 출력용 요약
    this.printSummary(report);

    console.log(`✅ 리포트 생성 완료:`);
    console.log(`  - 상세 리포트: ${jsonReportPath}`);
    console.log(`  - 요약 리포트: ${mdReportPath}`);

    return report;
  }

  /**
   * 마이그레이션 계획 생성
   */
  generateMigrationPlan() {
    const plan = {
      phase1: {
        name: '긴급 대응 (즉시 실행)',
        classes: this.results.riskAssessment
          .filter((r) => r.riskLevel >= 5)
          .map((r) => ({
            old: r.className,
            new: this.suggestNewClassName(r.className),
            files: [...new Set([...r.usage.cssFiles, ...r.usage.htmlFiles, ...r.usage.jsFiles])]
              .length,
          })),
      },
      phase2: {
        name: '우선 처리 (1주일 내)',
        classes: this.results.riskAssessment
          .filter((r) => r.riskLevel >= 3 && r.riskLevel < 5)
          .map((r) => ({
            old: r.className,
            new: this.suggestNewClassName(r.className),
            files: [...new Set([...r.usage.cssFiles, ...r.usage.htmlFiles, ...r.usage.jsFiles])]
              .length,
          })),
      },
      phase3: {
        name: '계획적 처리 (1개월 내)',
        classes: this.results.riskAssessment
          .filter((r) => r.riskLevel < 3 && r.riskLevel >= 2)
          .map((r) => ({
            old: r.className,
            new: this.suggestNewClassName(r.className),
            files: [...new Set([...r.usage.cssFiles, ...r.usage.htmlFiles, ...r.usage.jsFiles])]
              .length,
          })),
      },
    };

    return plan;
  }

  /**
   * 새 클래스명 제안
   */
  suggestNewClassName(oldClassName) {
    // 기능별 접두사 매핑
    const prefixMapping = {
      // 컴포넌트
      btn: 'dh-comp-btn',
      button: 'dh-comp-button',
      card: 'dh-comp-card',
      'form-control': 'dh-comp-form-control',
      'form-group': 'dh-comp-form-group',

      // 레이아웃
      container: 'dh-layout-container',
      grid: 'dh-layout-grid',
      row: 'dh-layout-row',

      // 상태
      loading: 'dh-state-loading',
      active: 'dh-state-active',
      disabled: 'dh-state-disabled',

      // 유틸리티
      'text-primary': 'dh-util-text-primary',
      'text-secondary': 'dh-util-text-secondary',

      // 기능별
      'service-card': 'dh-comp-service-card',
      'result-header': 'dh-comp-result-header',
    };

    if (prefixMapping[oldClassName]) {
      return prefixMapping[oldClassName];
    }

    // 패턴 기반 제안
    if (oldClassName.includes('card')) return `dh-comp-${oldClassName}`;
    if (oldClassName.includes('btn') || oldClassName.includes('button'))
      return `dh-comp-${oldClassName}`;
    if (oldClassName.includes('form')) return `dh-comp-${oldClassName}`;
    if (oldClassName.includes('nav') || oldClassName.includes('menu'))
      return `dh-comp-${oldClassName}`;
    if (oldClassName.includes('text-')) return `dh-util-${oldClassName}`;
    if (oldClassName.includes('loading') || oldClassName.includes('spinner'))
      return `dh-state-${oldClassName}`;

    // 기본 접두사
    return `dh-comp-${oldClassName}`;
  }

  /**
   * 마크다운 리포트 생성
   */
  generateMarkdownReport(report) {
    return `# CSS 클래스 접두사 마이그레이션 영향도 분석 리포트

## 📊 분석 개요

- **분석 시간**: ${report.timestamp}
- **스캔 파일 수**: ${report.summary.totalFilesScanned}개
- **발견된 총 클래스**: ${report.summary.totalClassesFound}개
- **고위험 클래스**: ${report.summary.highRiskClasses}개
- **중위험 클래스**: ${report.summary.mediumRiskClasses}개
- **저위험 클래스**: ${report.summary.lowRiskClasses}개

## 🚨 최고 우선순위 클래스 (즉시 처리 필요)

${report.topConflicts
  .slice(0, 10)
  .map(
    (item) =>
      `### \`${item.className}\` (위험도: ${item.riskLevel})

- **사용 파일**: ${[...new Set([...item.usage.cssFiles, ...item.usage.htmlFiles, ...item.usage.jsFiles])].length}개
- **CSS 파일**: ${item.usage.cssFiles.length}개
- **HTML 파일**: ${item.usage.htmlFiles.length}개  
- **JS 파일**: ${item.usage.jsFiles.length}개
- **권장 조치**: ${item.recommendedAction}
- **예상 작업량**: ${item.estimatedEffort}
- **제안 클래스명**: \`${this.suggestNewClassName(item.className)}\`

#### JavaScript 참조:
${
  item.jsReferences.length > 0
    ? item.jsReferences.map((ref) => `- ${ref.file}:${ref.line} - ${ref.method}`).join('\\n')
    : '없음'
}
`
  )
  .join('\\n')}

## 📋 단계별 마이그레이션 계획

### Phase 1: 긴급 대응 (즉시 실행)
${
  report.migrationPlan.phase1.classes
    .map((cls) => `- \`${cls.old}\` → \`${cls.new}\` (${cls.files}개 파일)`)
    .join('\\n') || '해당 없음'
}

### Phase 2: 우선 처리 (1주일 내)
${
  report.migrationPlan.phase2.classes
    .map((cls) => `- \`${cls.old}\` → \`${cls.new}\` (${cls.files}개 파일)`)
    .join('\\n') || '해당 없음'
}

### Phase 3: 계획적 처리 (1개월 내)
${
  report.migrationPlan.phase3.classes
    .map((cls) => `- \`${cls.old}\` → \`${cls.new}\` (${cls.files}개 파일)`)
    .join('\\n') || '해당 없음'
}

## 🛠️ 다음 단계

1. **자동화 도구 실행**: \`node tools/css-prefix-migration-tool.js\`
2. **Phase 1 클래스 우선 마이그레이션**
3. **테스트 및 검증**: 각 단계마다 기능 테스트 실행
4. **점진적 Phase 2, 3 진행**

## ⚠️ 주의사항

- JavaScript 참조가 있는 클래스는 특별히 주의
- 테스트 후 바로 배포하여 문제 조기 발견
- 백업은 필수: 마이그레이션 전 전체 백업 생성

---

*이 리포트는 자동으로 생성되었습니다. 상세한 정보는 JSON 리포트를 참조하세요.*
`;
  }

  /**
   * 콘솔 요약 출력
   */
  printSummary(report) {
    console.log('\\n📊 === CSS 클래스 접두사 마이그레이션 영향도 분석 요약 ===');
    console.log(`🔍 총 ${report.summary.totalClassesFound}개 클래스 발견`);
    console.log(`🚨 고위험: ${report.summary.highRiskClasses}개`);
    console.log(`⚠️  중위험: ${report.summary.mediumRiskClasses}개`);
    console.log(`✅ 저위험: ${report.summary.lowRiskClasses}개`);

    console.log('\\n🔥 최우선 처리 대상 (Top 10):');
    report.topConflicts.slice(0, 10).forEach((item, index) => {
      const totalFiles = [
        ...new Set([...item.usage.cssFiles, ...item.usage.htmlFiles, ...item.usage.jsFiles]),
      ].length;
      console.log(
        `${index + 1}. ${item.className} (위험도: ${item.riskLevel}, 파일: ${totalFiles}개)`
      );
    });

    console.log('\\n📋 단계별 작업 계획:');
    console.log(`⚡ Phase 1 (즉시): ${report.migrationPlan.phase1.classes.length}개 클래스`);
    console.log(`🔄 Phase 2 (1주일): ${report.migrationPlan.phase2.classes.length}개 클래스`);
    console.log(`📅 Phase 3 (1개월): ${report.migrationPlan.phase3.classes.length}개 클래스`);
    console.log('');
  }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new CSSPrefixImpactAnalysis();

  analyzer.analyze().catch((error) => {
    console.error('Analysis failed:', error);
    process.exit(1);
  });
}

export default CSSPrefixImpactAnalysis;
