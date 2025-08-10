/**
 * CSS 클래스 중복 분석 도구
 * doha.kr 프로젝트의 모든 CSS 파일에서 중복 클래스를 분석하고 리네임 전략 수립
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class CSSAnalyzer {
  constructor() {
    this.cssFiles = [];
    this.classDefinitions = new Map(); // 클래스명 -> { files: [파일경로들], definitions: [정의들] }
    this.duplicates = new Map();
    this.renamingStrategy = new Map();
    this.stats = {
      totalFiles: 0,
      totalClasses: 0,
      duplicateClasses: 0,
      conflictingClasses: 0
    };
  }

  /**
   * CSS 파일들을 찾아서 수집
   */
  async collectCSSFiles() {
    const cssPattern = 'css/**/*.css';
    const excludePatterns = [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.min.css' // 압축된 CSS 제외
    ];

    try {
      const files = await new Promise((resolve, reject) => {
        glob(cssPattern, {
          ignore: excludePatterns,
          cwd: process.cwd()
        }, (err, matches) => {
          if (err) reject(err);
          else resolve(matches);
        });
      });

      this.cssFiles = files;
      this.stats.totalFiles = files.length;
      console.log(`📁 Found ${files.length} CSS files`);
      
      return files;
    } catch (error) {
      console.error('❌ Error collecting CSS files:', error);
      return [];
    }
  }

  /**
   * CSS 파일에서 클래스 정의 추출
   */
  extractClassDefinitions(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const classes = [];
      
      // CSS 클래스 선택자 매칭 (정규식)
      const classRegex = /\.([a-zA-Z][a-zA-Z0-9_-]*)\s*\{/g;
      let match;
      
      while ((match = classRegex.exec(content)) !== null) {
        const className = match[1];
        const position = match.index;
        
        // 해당 위치의 라인 번호 계산
        const lineNumber = content.substring(0, position).split('\n').length;
        
        classes.push({
          name: className,
          file: filePath,
          line: lineNumber,
          context: this.getContext(content, position, 100)
        });
      }
      
      return classes;
    } catch (error) {
      console.error(`❌ Error reading ${filePath}:`, error.message);
      return [];
    }
  }

  /**
   * 클래스 정의 주변 컨텍스트 추출
   */
  getContext(content, position, length = 50) {
    const start = Math.max(0, position - length);
    const end = Math.min(content.length, position + length);
    return content.substring(start, end).replace(/\s+/g, ' ').trim();
  }

  /**
   * 모든 CSS 파일 분석
   */
  async analyzeAllFiles() {
    console.log('\n🔍 Analyzing CSS class definitions...');
    
    for (const filePath of this.cssFiles) {
      const classes = this.extractClassDefinitions(filePath);
      
      for (const classInfo of classes) {
        const className = classInfo.name;
        
        if (!this.classDefinitions.has(className)) {
          this.classDefinitions.set(className, {
            files: [],
            definitions: []
          });
        }
        
        const classData = this.classDefinitions.get(className);
        
        // 파일이 이미 등록되지 않았다면 추가
        if (!classData.files.includes(filePath)) {
          classData.files.push(filePath);
        }
        
        classData.definitions.push(classInfo);
      }
    }
    
    this.stats.totalClasses = this.classDefinitions.size;
    console.log(`📊 Found ${this.stats.totalClasses} unique class names`);
  }

  /**
   * 중복 클래스 식별
   */
  identifyDuplicates() {
    console.log('\n🔍 Identifying duplicate classes...');
    
    for (const [className, data] of this.classDefinitions) {
      if (data.files.length > 1) {
        this.duplicates.set(className, data);
        this.stats.duplicateClasses++;
        
        // 다른 파일에서 다른 정의를 가진 경우 충돌로 분류
        if (this.hasConflictingDefinitions(data.definitions)) {
          this.stats.conflictingClasses++;
        }
      }
    }
    
    console.log(`🔍 Found ${this.stats.duplicateClasses} duplicate classes`);
    console.log(`⚠️ Found ${this.stats.conflictingClasses} conflicting definitions`);
  }

  /**
   * 정의가 충돌하는지 확인
   */
  hasConflictingDefinitions(definitions) {
    // 간단한 휴리스틱: 서로 다른 파일에서 크게 다른 컨텍스트를 가진 경우
    const contexts = definitions.map(def => def.context);
    
    // 컨텍스트가 50% 이하로만 유사하면 충돌로 간주
    for (let i = 0; i < contexts.length - 1; i++) {
      for (let j = i + 1; j < contexts.length; j++) {
        const similarity = this.calculateSimilarity(contexts[i], contexts[j]);
        if (similarity < 0.5) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * 문자열 유사도 계산 (간단한 Levenshtein 기반)
   */
  calculateSimilarity(str1, str2) {
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1.0;
    
    const distance = this.levenshteinDistance(str1, str2);
    return (maxLen - distance) / maxLen;
  }

  /**
   * Levenshtein 거리 계산
   */
  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator,
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * 리네임 전략 수립
   */
  developRenamingStrategy() {
    console.log('\n🎯 Developing renaming strategy...');
    
    const prefixMap = new Map([
      // 기존 Linear 시스템은 그대로 유지
      ['linear-', 'modern'],
      
      // 파일/기능별 접두사 매핑
      ['components/', 'comp-'],
      ['features/', 'feat-'],
      ['pages/', 'page-'],
      ['core/', 'core-'],
      ['design-system/', 'ds-'],
      
      // 특정 페이지별
      ['contact', 'contact-'],
      ['fortune', 'fortune-'],
      ['test', 'test-'],
      ['tools', 'tool-'],
      ['bmi', 'bmi-'],
      ['mbti', 'mbti-'],
      ['tarot', 'tarot-'],
      ['saju', 'saju-']
    ]);

    for (const [className, data] of this.duplicates) {
      const strategies = [];
      
      for (const filePath of data.files) {
        let prefix = this.determinePrefix(filePath, className, prefixMap);
        const newName = `${prefix}${className}`;
        
        strategies.push({
          originalFile: filePath,
          originalClass: className,
          newClass: newName,
          priority: this.calculateRenamePriority(filePath, className)
        });
      }
      
      // 우선순위에 따라 정렬 (낮은 우선순위 = 먼저 리네임)
      strategies.sort((a, b) => a.priority - b.priority);
      
      this.renamingStrategy.set(className, strategies);
    }
  }

  /**
   * 파일 경로와 클래스명을 기반으로 접두사 결정
   */
  determinePrefix(filePath, className, prefixMap) {
    // 이미 linear- 접두사가 있으면 그대로 유지
    if (className.startsWith('linear-')) {
      return '';
    }
    
    // 파일 경로 기반 접두사 결정
    for (const [pathPattern, prefix] of prefixMap) {
      if (filePath.includes(pathPattern)) {
        return prefix;
      }
    }
    
    // 기본값: 레거시 접두사
    return 'legacy-';
  }

  /**
   * 리네임 우선순위 계산 (낮을수록 먼저 리네임)
   */
  calculateRenamePriority(filePath, className) {
    let priority = 50; // 기본 우선순위
    
    // Linear 시스템은 절대 리네임하지 않음
    if (className.startsWith('linear-') || filePath.includes('design-system')) {
      return 100;
    }
    
    // 레거시 파일들은 우선순위 높임 (먼저 리네임)
    if (filePath.includes('pages/') || filePath.includes('features/')) {
      priority -= 20;
    }
    
    // 중요한 공통 컴포넌트는 나중에 리네임
    if (filePath.includes('components/') || filePath.includes('core/')) {
      priority += 20;
    }
    
    return priority;
  }

  /**
   * 분석 리포트 생성
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      summary: {
        filesAnalyzed: this.stats.totalFiles,
        totalClasses: this.stats.totalClasses,
        duplicateClasses: this.stats.duplicateClasses,
        conflictingClasses: this.stats.conflictingClasses,
        duplicatePercentage: ((this.stats.duplicateClasses / this.stats.totalClasses) * 100).toFixed(2)
      },
      duplicateDetails: [],
      renamingPlan: []
    };

    // 중복 클래스 상세 정보
    for (const [className, data] of this.duplicates) {
      report.duplicateDetails.push({
        className,
        occurrences: data.files.length,
        files: data.files,
        hasConflicts: this.hasConflictingDefinitions(data.definitions),
        definitions: data.definitions.map(def => ({
          file: def.file,
          line: def.line,
          context: def.context
        }))
      });
    }

    // 리네임 계획
    for (const [className, strategies] of this.renamingStrategy) {
      report.renamingPlan.push({
        originalClass: className,
        strategies: strategies
      });
    }

    return report;
  }

  /**
   * 리포트를 파일로 저장
   */
  saveReport(report) {
    const filename = `css-duplicate-analysis-${Date.now()}.json`;
    const filePath = path.join(process.cwd(), filename);
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
      console.log(`💾 Report saved to: ${filename}`);
      return filePath;
    } catch (error) {
      console.error('❌ Error saving report:', error);
      return null;
    }
  }

  /**
   * 콘솔에 요약 리포트 출력
   */
  printSummaryReport() {
    console.log('\n📊 === CSS DUPLICATE ANALYSIS SUMMARY ===');
    console.log(`📁 Files analyzed: ${this.stats.totalFiles}`);
    console.log(`📝 Total classes: ${this.stats.totalClasses}`);
    console.log(`🔄 Duplicate classes: ${this.stats.duplicateClasses}`);
    console.log(`⚠️ Conflicting classes: ${this.stats.conflictingClasses}`);
    console.log(`📈 Duplicate percentage: ${((this.stats.duplicateClasses / this.stats.totalClasses) * 100).toFixed(2)}%`);
    
    console.log('\n🏷️ === TOP DUPLICATE CLASSES ===');
    const sortedDuplicates = Array.from(this.duplicates.entries())
      .sort((a, b) => b[1].files.length - a[1].files.length)
      .slice(0, 10);
    
    sortedDuplicates.forEach(([className, data], index) => {
      const hasConflicts = this.hasConflictingDefinitions(data.definitions);
      const conflictIcon = hasConflicts ? '⚠️' : '✅';
      console.log(`${index + 1}. ${conflictIcon} .${className} (${data.files.length} files)`);
      data.files.forEach(file => console.log(`   📁 ${file}`));
    });
  }

  /**
   * 전체 분석 프로세스 실행
   */
  async runFullAnalysis() {
    console.log('🚀 Starting CSS Duplicate Analysis for doha.kr');
    
    try {
      // 1. CSS 파일 수집
      await this.collectCSSFiles();
      
      // 2. 클래스 정의 분석
      await this.analyzeAllFiles();
      
      // 3. 중복 클래스 식별
      this.identifyDuplicates();
      
      // 4. 리네임 전략 수립
      this.developRenamingStrategy();
      
      // 5. 리포트 생성 및 저장
      const report = this.generateReport();
      this.saveReport(report);
      
      // 6. 요약 출력
      this.printSummaryReport();
      
      console.log('\n✅ Analysis completed successfully!');
      return report;
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw error;
    }
  }
}

// 실행
if (require.main === module) {
  const analyzer = new CSSAnalyzer();
  analyzer.runFullAnalysis().catch(console.error);
}

module.exports = { CSSAnalyzer };