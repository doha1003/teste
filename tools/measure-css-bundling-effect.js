/**
 * 📊 CSS 번들링 효과 측정 도구
 * Phase 7 CSS 최적화 효과를 정량적으로 분석
 */

import { promises as fs } from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CSSBundlingAnalyzer {
  constructor() {
    this.cssDir = path.join(__dirname, '..', 'css');
    this.distDir = path.join(__dirname, '..', 'dist');
    this.results = {
      timestamp: new Date().toISOString(),
      phase6: {
        // 번들링 전 상태 (시뮬레이션)
        fileCount: 0,
        totalSize: 0,
        estimatedLoadTime: 0,
        httpRequests: 0,
        cacheEfficiency: 'low',
      },
      phase7: {
        // 현재 번들링 상태
        fileCount: 0,
        totalSize: 0,
        estimatedLoadTime: 0,
        httpRequests: 0,
        cacheEfficiency: 'high',
      },
      improvements: {},
      korean: {},
    };
  }

  // CSS 파일 스캔
  async scanCSSFiles() {
    console.log('📂 CSS 파일 구조 분석 중...');

    const cssFiles = await this.getAllCSSFiles(this.cssDir);
    const minifiedFiles = cssFiles.filter((file) => file.endsWith('.min.css'));
    const originalFiles = cssFiles.filter((file) => !file.endsWith('.min.css'));

    console.log(`📋 발견된 CSS 파일:`);
    console.log(`  - 원본 파일: ${originalFiles.length}개`);
    console.log(`  - 압축 파일: ${minifiedFiles.length}개`);

    return { originalFiles, minifiedFiles, allFiles: cssFiles };
  }

  // 재귀적으로 CSS 파일 찾기
  async getAllCSSFiles(dir) {
    const files = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.getAllCSSFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.name.endsWith('.css')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️ 디렉토리 읽기 실패: ${dir}`);
    }

    return files;
  }

  // 파일 크기 계산
  async calculateFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      console.warn(`⚠️ 파일 크기 확인 실패: ${filePath}`);
      return 0;
    }
  }

  // Phase 6 상태 시뮬레이션 (번들링 전)
  async analyzePhase6() {
    console.log('\n📊 Phase 6 상태 분석 (번들링 전)...');

    const { originalFiles } = await this.scanCSSFiles();

    let totalSize = 0;
    for (const file of originalFiles) {
      const size = await this.calculateFileSize(file);
      totalSize += size;
    }

    // HTTP/1.1 기준 동시 연결 제한 고려 (6개)
    const maxConcurrent = 6;
    const avgLatency = 100; // ms
    const avgDownloadTime = 20; // ms per file

    // 순차 로딩 시간 계산
    const batches = Math.ceil(originalFiles.length / maxConcurrent);
    const estimatedLoadTime = batches * (avgLatency + avgDownloadTime);

    this.results.phase6 = {
      fileCount: originalFiles.length,
      totalSize: totalSize,
      estimatedLoadTime: estimatedLoadTime,
      httpRequests: originalFiles.length,
      cacheEfficiency: 'low', // 파일이 많아 캐시 효율성 낮음
      networkOverhead: originalFiles.length * 500, // 헤더 오버헤드
      parallelBatches: batches,
    };

    console.log(`✅ Phase 6 분석 완료:`);
    console.log(`  - 파일 수: ${originalFiles.length}개`);
    console.log(`  - 총 크기: ${(totalSize / 1024).toFixed(1)}KB`);
    console.log(`  - 예상 로딩 시간: ${estimatedLoadTime}ms`);
    console.log(`  - HTTP 요청: ${originalFiles.length}개`);
  }

  // Phase 7 상태 분석 (번들링 후)
  async analyzePhase7() {
    console.log('\n📊 Phase 7 상태 분석 (번들링 후)...');

    // 번들 파일 확인
    const bundlePath = path.join(this.distDir, 'styles.min.css');
    const bundleExists = await this.fileExists(bundlePath);

    if (bundleExists) {
      const bundleSize = await this.calculateFileSize(bundlePath);
      const avgLatency = 100; // ms
      const downloadTime = Math.ceil(bundleSize / 10000); // 10KB/ms 가정

      this.results.phase7 = {
        fileCount: 1,
        totalSize: bundleSize,
        estimatedLoadTime: avgLatency + downloadTime,
        httpRequests: 1,
        cacheEfficiency: 'high', // 단일 파일로 캐시 효율성 높음
        networkOverhead: 500, // 단일 헤더
        parallelBatches: 1,
      };

      console.log(`✅ Phase 7 분석 완료:`);
      console.log(`  - 파일 수: 1개 (번들)`);
      console.log(`  - 총 크기: ${(bundleSize / 1024).toFixed(1)}KB`);
      console.log(`  - 예상 로딩 시간: ${avgLatency + downloadTime}ms`);
      console.log(`  - HTTP 요청: 1개`);
    } else {
      // 개별 압축 파일들 분석
      const { minifiedFiles } = await this.scanCSSFiles();

      let totalSize = 0;
      for (const file of minifiedFiles) {
        const size = await this.calculateFileSize(file);
        totalSize += size;
      }

      const avgLatency = 100;
      const avgDownloadTime = 15; // 압축으로 더 빠름
      const batches = Math.ceil(minifiedFiles.length / 6);
      const estimatedLoadTime = batches * (avgLatency + avgDownloadTime);

      this.results.phase7 = {
        fileCount: minifiedFiles.length,
        totalSize: totalSize,
        estimatedLoadTime: estimatedLoadTime,
        httpRequests: minifiedFiles.length,
        cacheEfficiency: 'medium',
        networkOverhead: minifiedFiles.length * 500,
        parallelBatches: batches,
      };

      console.log(`✅ Phase 7 분석 완료 (압축 파일):`);
      console.log(`  - 파일 수: ${minifiedFiles.length}개`);
      console.log(`  - 총 크기: ${(totalSize / 1024).toFixed(1)}KB`);
    }
  }

  // 개선 효과 계산
  calculateImprovements() {
    console.log('\n📈 개선 효과 계산 중...');

    const phase6 = this.results.phase6;
    const phase7 = this.results.phase7;

    // 파일 수 감소
    const fileReduction = ((phase6.fileCount - phase7.fileCount) / phase6.fileCount) * 100;

    // 크기 개선
    const sizeReduction = ((phase6.totalSize - phase7.totalSize) / phase6.totalSize) * 100;

    // 로딩 시간 개선
    const timeImprovement =
      ((phase6.estimatedLoadTime - phase7.estimatedLoadTime) / phase6.estimatedLoadTime) * 100;

    // HTTP 요청 감소
    const requestReduction =
      ((phase6.httpRequests - phase7.httpRequests) / phase6.httpRequests) * 100;

    // 네트워크 오버헤드 감소
    const overheadReduction =
      ((phase6.networkOverhead - phase7.networkOverhead) / phase6.networkOverhead) * 100;

    this.results.improvements = {
      fileReduction: Math.round(fileReduction * 10) / 10,
      sizeReduction: Math.round(sizeReduction * 10) / 10,
      timeImprovement: Math.round(timeImprovement * 10) / 10,
      requestReduction: Math.round(requestReduction * 10) / 10,
      overheadReduction: Math.round(overheadReduction * 10) / 10,

      // 절대값
      fileDelta: phase6.fileCount - phase7.fileCount,
      sizeDelta: phase6.totalSize - phase7.totalSize,
      timeDelta: phase6.estimatedLoadTime - phase7.estimatedLoadTime,
      requestDelta: phase6.httpRequests - phase7.httpRequests,
    };

    console.log(`✅ 개선 효과:`);
    console.log(
      `  - 파일 수 감소: ${fileReduction.toFixed(1)}% (${phase6.fileCount} → ${phase7.fileCount}개)`
    );
    console.log(
      `  - 크기 감소: ${sizeReduction.toFixed(1)}% (${(phase6.totalSize / 1024).toFixed(1)} → ${(phase7.totalSize / 1024).toFixed(1)}KB)`
    );
    console.log(
      `  - 로딩 시간 개선: ${timeImprovement.toFixed(1)}% (${phase6.estimatedLoadTime} → ${phase7.estimatedLoadTime}ms)`
    );
    console.log(
      `  - HTTP 요청 감소: ${requestReduction.toFixed(1)}% (${phase6.httpRequests} → ${phase7.httpRequests}개)`
    );
  }

  // 한국어 요약 생성
  generateKoreanSummary() {
    const improvements = this.results.improvements;

    let grade = '';
    if (improvements.timeImprovement >= 50) {
      grade = '탁월한';
    } else if (improvements.timeImprovement >= 30) {
      grade = '우수한';
    } else if (improvements.timeImprovement >= 10) {
      grade = '양호한';
    } else {
      grade = '제한적인';
    }

    this.results.korean = {
      title: `CSS 번들링 ${grade} 성과`,
      summary: `Phase 7에서 CSS 번들링을 통해 로딩 시간을 ${improvements.timeImprovement.toFixed(1)}% 개선했습니다.`,

      highlights: [
        `파일 수를 ${this.results.phase6.fileCount}개에서 ${this.results.phase7.fileCount}개로 ${improvements.fileReduction.toFixed(1)}% 감소`,
        `전체 크기를 ${improvements.sizeReduction.toFixed(1)}% 압축하여 ${(improvements.sizeDelta / 1024).toFixed(1)}KB 절약`,
        `네트워크 요청을 ${improvements.requestReduction.toFixed(1)}% 줄여 ${improvements.timeDelta}ms 단축`,
        `캐시 효율성을 ${this.results.phase6.cacheEfficiency}에서 ${this.results.phase7.cacheEfficiency}로 개선`,
      ],

      businessImpact: [
        '사용자 이탈률 감소 예상',
        'SEO 점수 향상 기여',
        '모바일 사용자 경험 개선',
        '서버 부하 경감',
      ],

      technicalBenefits: [
        'HTTP/2 Push 최적화 가능',
        'Service Worker 캐싱 효율성 증대',
        'Critical CSS 인라인화 용이',
        '번들 분석 도구 활용 가능',
      ],
    };
  }

  // 상세 리포트 생성
  generateDetailedReport() {
    const report = {
      ...this.results,
      metadata: {
        analyzer: 'CSS Bundling Effect Analyzer',
        version: '1.0.0',
        generatedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        methodology: 'File system analysis + Network simulation',
      },
      assumptions: {
        networkLatency: '100ms (average)',
        downloadSpeed: '10KB/ms (fast 3G)',
        concurrentConnections: 6,
        cacheHitRate: {
          phase6: '30% (multiple files)',
          phase7: '80% (single bundle)',
        },
      },
    };

    return report;
  }

  // JSON 리포트 저장
  async saveReport() {
    const report = this.generateDetailedReport();
    const reportPath = path.join(__dirname, '..', 'css-bundling-effect-report.json');

    try {
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n💾 상세 리포트 저장: ${reportPath}`);
    } catch (error) {
      console.error(`❌ 리포트 저장 실패:`, error);
    }
  }

  // Markdown 리포트 생성
  async generateMarkdownReport() {
    const improvements = this.results.improvements;
    const korean = this.results.korean;

    const markdown = `# 📊 CSS 번들링 효과 분석 리포트

**분석일시**: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
**분석 대상**: doha.kr CSS 최적화 (Phase 6 → Phase 7)

## 🎯 핵심 성과

### ${korean.title}
${korean.summary}

## 📈 정량적 개선 효과

| 지표 | Phase 6 | Phase 7 | 개선율 |
|------|---------|---------|--------|
| 파일 수 | ${this.results.phase6.fileCount}개 | ${this.results.phase7.fileCount}개 | **${improvements.fileReduction.toFixed(1)}%** ⬇️ |
| 총 크기 | ${(this.results.phase6.totalSize / 1024).toFixed(1)}KB | ${(this.results.phase7.totalSize / 1024).toFixed(1)}KB | **${improvements.sizeReduction.toFixed(1)}%** ⬇️ |
| 로딩 시간 | ${this.results.phase6.estimatedLoadTime}ms | ${this.results.phase7.estimatedLoadTime}ms | **${improvements.timeImprovement.toFixed(1)}%** ⬆️ |
| HTTP 요청 | ${this.results.phase6.httpRequests}개 | ${this.results.phase7.httpRequests}개 | **${improvements.requestReduction.toFixed(1)}%** ⬇️ |

## 🌟 주요 개선사항

${korean.highlights.map((highlight) => `- ${highlight}`).join('\n')}

## 💼 비즈니스 임팩트

${korean.businessImpact.map((impact) => `- ${impact}`).join('\n')}

## 🔧 기술적 이점

${korean.technicalBenefits.map((benefit) => `- ${benefit}`).join('\n')}

## 📊 상세 분석

### Phase 6 (번들링 전)
- **파일 구조**: 분산된 ${this.results.phase6.fileCount}개 CSS 파일
- **네트워크 효율성**: 낮음 (다중 요청)
- **캐시 전략**: 개별 파일 캐싱
- **병렬 로딩**: ${this.results.phase6.parallelBatches}배치

### Phase 7 (번들링 후)  
- **파일 구조**: 통합된 ${this.results.phase7.fileCount}개 번들
- **네트워크 효율성**: 높음 (단일 요청)
- **캐시 전략**: 번들 단위 캐싱
- **병렬 로딩**: ${this.results.phase7.parallelBatches}배치

## 🔮 예상 효과

### 사용자 경험
- **첫 화면 표시 시간**: ${improvements.timeDelta}ms 단축
- **누적 레이아웃 이동**: 감소 예상
- **체감 성능**: 향상

### SEO 및 성능
- **Lighthouse 점수**: +2~3점 예상
- **Core Web Vitals**: FCP/LCP 개선
- **모바일 성능**: 특히 개선

## 📋 결론

CSS 번들링을 통해 **${improvements.timeImprovement.toFixed(1)}%의 로딩 시간 개선**을 달성했습니다. 
이는 사용자 경험과 SEO 성능 향상에 직접적으로 기여할 것으로 예상됩니다.

---
*이 리포트는 자동화된 분석 도구에 의해 생성되었습니다.*`;

    const reportPath = path.join(__dirname, '..', 'css-bundling-effect-report.md');

    try {
      await fs.writeFile(reportPath, markdown);
      console.log(`📄 Markdown 리포트 저장: ${reportPath}`);
    } catch (error) {
      console.error(`❌ Markdown 리포트 저장 실패:`, error);
    }
  }

  // 파일 존재 여부 확인
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // 메인 분석 실행
  async analyze() {
    console.log('🚀 CSS 번들링 효과 분석 시작\n');

    const startTime = performance.now();

    try {
      await this.analyzePhase6();
      await this.analyzePhase7();
      this.calculateImprovements();
      this.generateKoreanSummary();

      await this.saveReport();
      await this.generateMarkdownReport();

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      console.log(`\n✅ 분석 완료! (${duration}ms 소요)`);
      console.log(`\n📋 요약:`);
      console.log(`${this.results.korean.summary}`);
      console.log(
        `주요 개선: 로딩 시간 ${this.results.improvements.timeImprovement.toFixed(1)}% 향상`
      );
    } catch (error) {
      console.error(`❌ 분석 실패:`, error);
      throw error;
    }
  }
}

// 직접 실행 시
const analyzer = new CSSBundlingAnalyzer();
analyzer.analyze().catch(console.error);

export default CSSBundlingAnalyzer;
