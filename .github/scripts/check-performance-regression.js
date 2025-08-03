/**
 * 성능 회귀 검사 스크립트
 * 이전 빌드와 현재 빌드의 성능을 비교하여 회귀를 감지합니다.
 */

import fs from 'fs/promises';
import path from 'path';

// 성능 회귀 임계값 설정
const REGRESSION_THRESHOLDS = {
  performance: -5, // 5점 이상 하락시 회귀
  accessibility: -3, // 3점 이상 하락시 회귀
  bestPractices: -5, // 5점 이상 하락시 회귀
  seo: -5, // 5점 이상 하락시 회귀
  pwa: -10, // 10점 이상 하락시 회귀

  // Core Web Vitals (증가는 나쁨)
  lcp: 500, // 500ms 이상 증가시 회귀
  fcp: 300, // 300ms 이상 증가시 회귀
  cls: 0.05, // 0.05 이상 증가시 회귀
  si: 500, // 500ms 이상 증가시 회귀
  tti: 1000, // 1초 이상 증가시 회귀
  tbt: 100, // 100ms 이상 증가시 회귀
};

// 중요도별 페이지 가중치
const PAGE_WEIGHTS = {
  '/': 1.0, // 홈페이지 (최고 중요도)
  '/tests/mbti/': 0.8, // MBTI 테스트 (높은 중요도)
  '/tests/love-dna/': 0.7, // 연애 DNA 테스트
  '/fortune/daily/': 0.8, // 일일 운세
  '/tools/bmi-calculator.html': 0.6, // BMI 계산기
  '/tools/salary-calculator.html': 0.6, // 급여 계산기
  '/tools/text-counter.html': 0.5, // 텍스트 카운터
};

async function loadLighthouseResults() {
  try {
    const lighthouseDir = '.lighthouseci';
    const files = await fs.readdir(lighthouseDir);

    const results = {};

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(lighthouseDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);

        if (data.lhr) {
          const url = new URL(data.lhr.finalUrl).pathname;
          results[url] = extractMetrics(data.lhr);
        }
      }
    }

    return results;
  } catch (error) {
    console.warn('Lighthouse 결과를 로드할 수 없습니다:', error.message);
    return {};
  }
}

function extractMetrics(lhr) {
  const { audits, categories } = lhr;

  return {
    scores: {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
      pwa: categories.pwa ? Math.round(categories.pwa.score * 100) : null,
    },
    vitals: {
      lcp: audits['largest-contentful-paint']?.numericValue || 0,
      fcp: audits['first-contentful-paint']?.numericValue || 0,
      cls: audits['cumulative-layout-shift']?.numericValue || 0,
      si: audits['speed-index']?.numericValue || 0,
      tti: audits['interactive']?.numericValue || 0,
      tbt: audits['total-blocking-time']?.numericValue || 0,
    },
    timestamp: new Date(lhr.fetchTime).toISOString(),
  };
}

async function loadHistoricalData() {
  try {
    const historyPath = '.github/performance-history.json';
    const content = await fs.readFile(historyPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.log('기존 성능 기록이 없습니다. 새로 생성합니다.');
    return { builds: [] };
  }
}

async function saveHistoricalData(data) {
  try {
    const historyPath = '.github/performance-history.json';
    await fs.writeFile(historyPath, JSON.stringify(data, null, 2));
    console.log('성능 기록이 저장되었습니다.');
  } catch (error) {
    console.error('성능 기록 저장 실패:', error.message);
  }
}

function calculateWeightedScore(pageResults, scoreType) {
  let totalWeight = 0;
  let weightedSum = 0;

  Object.entries(pageResults).forEach(([url, metrics]) => {
    const weight = PAGE_WEIGHTS[url] || 0.5; // 기본 가중치
    const score = metrics.scores[scoreType];

    if (score !== null && score !== undefined) {
      totalWeight += weight;
      weightedSum += score * weight;
    }
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

function calculateWeightedVitals(pageResults, vitalType) {
  let totalWeight = 0;
  let weightedSum = 0;

  Object.entries(pageResults).forEach(([url, metrics]) => {
    const weight = PAGE_WEIGHTS[url] || 0.5;
    const vital = metrics.vitals[vitalType];

    if (vital !== null && vital !== undefined) {
      totalWeight += weight;
      weightedSum += vital * weight;
    }
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

function detectRegressions(current, previous) {
  const regressions = [];

  // Lighthouse 점수 회귀 검사
  ['performance', 'accessibility', 'bestPractices', 'seo', 'pwa'].forEach((scoreType) => {
    const currentScore = current.weightedScores[scoreType];
    const previousScore = previous.weightedScores[scoreType];

    if (currentScore && previousScore) {
      const diff = currentScore - previousScore;
      const threshold = REGRESSION_THRESHOLDS[scoreType];

      if (diff < threshold) {
        regressions.push({
          type: 'score',
          metric: scoreType,
          current: currentScore,
          previous: previousScore,
          difference: diff,
          threshold,
          severity: diff < threshold * 1.5 ? 'critical' : 'warning',
        });
      }
    }
  });

  // Core Web Vitals 회귀 검사
  ['lcp', 'fcp', 'cls', 'si', 'tti', 'tbt'].forEach((vitalType) => {
    const currentVital = current.weightedVitals[vitalType];
    const previousVital = previous.weightedVitals[vitalType];

    if (currentVital && previousVital) {
      const diff = currentVital - previousVital;
      const threshold = REGRESSION_THRESHOLDS[vitalType];

      if (diff > threshold) {
        regressions.push({
          type: 'vitals',
          metric: vitalType,
          current: currentVital,
          previous: previousVital,
          difference: diff,
          threshold,
          severity: diff > threshold * 1.5 ? 'critical' : 'warning',
        });
      }
    }
  });

  return regressions;
}

function generateRegressionReport(regressions, currentBuild, previousBuild) {
  const criticalCount = regressions.filter((r) => r.severity === 'critical').length;
  const warningCount = regressions.filter((r) => r.severity === 'warning').length;

  let report = `# 성능 회귀 검사 보고서\n\n`;
  report += `**빌드 비교**: ${previousBuild.commitSha?.substring(0, 7)} → ${currentBuild.commitSha?.substring(0, 7)}\n`;
  report += `**검사 시간**: ${new Date().toLocaleString('ko-KR')}\n\n`;

  if (regressions.length === 0) {
    report += `✅ **성능 회귀가 감지되지 않았습니다!**\n\n`;
    report += `모든 지표가 허용 범위 내에서 유지되고 있습니다.\n\n`;
  } else {
    report += `🚨 **${regressions.length}개의 성능 회귀가 감지되었습니다**\n`;
    report += `- 심각: ${criticalCount}개\n`;
    report += `- 경고: ${warningCount}개\n\n`;

    // 심각한 회귀부터 정렬
    const sortedRegressions = regressions.sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (a.severity !== 'critical' && b.severity === 'critical') return 1;
      return Math.abs(b.difference) - Math.abs(a.difference);
    });

    report += `## 🔍 상세 분석\n\n`;

    sortedRegressions.forEach((regression, index) => {
      const icon = regression.severity === 'critical' ? '🚨' : '⚠️';
      const metricName = regression.metric.toUpperCase();

      report += `### ${icon} ${index + 1}. ${metricName} 회귀 (${regression.severity})\n\n`;

      if (regression.type === 'score') {
        report += `- **이전 점수**: ${regression.previous.toFixed(1)}\n`;
        report += `- **현재 점수**: ${regression.current.toFixed(1)}\n`;
        report += `- **변화량**: ${regression.difference.toFixed(1)}점\n`;
        report += `- **임계값**: ${regression.threshold}점\n\n`;
      } else {
        const unit = regression.metric === 'cls' ? '' : 'ms';
        report += `- **이전 값**: ${regression.previous.toFixed(1)}${unit}\n`;
        report += `- **현재 값**: ${regression.current.toFixed(1)}${unit}\n`;
        report += `- **증가량**: +${regression.difference.toFixed(1)}${unit}\n`;
        report += `- **임계값**: +${regression.threshold}${unit}\n\n`;
      }
    });
  }

  // 현재 성능 요약
  report += `## 📊 현재 성능 요약\n\n`;
  report += `### Lighthouse 점수 (가중 평균)\n`;
  report += `- **Performance**: ${currentBuild.weightedScores.performance?.toFixed(1) || 'N/A'}\n`;
  report += `- **Accessibility**: ${currentBuild.weightedScores.accessibility?.toFixed(1) || 'N/A'}\n`;
  report += `- **Best Practices**: ${currentBuild.weightedScores.bestPractices?.toFixed(1) || 'N/A'}\n`;
  report += `- **SEO**: ${currentBuild.weightedScores.seo?.toFixed(1) || 'N/A'}\n`;
  if (currentBuild.weightedScores.pwa) {
    report += `- **PWA**: ${currentBuild.weightedScores.pwa.toFixed(1)}\n`;
  }

  report += `\n### Core Web Vitals (가중 평균)\n`;
  report += `- **LCP**: ${currentBuild.weightedVitals.lcp?.toFixed(0) || 'N/A'}ms\n`;
  report += `- **FCP**: ${currentBuild.weightedVitals.fcp?.toFixed(0) || 'N/A'}ms\n`;
  report += `- **CLS**: ${currentBuild.weightedVitals.cls?.toFixed(3) || 'N/A'}\n`;
  report += `- **SI**: ${currentBuild.weightedVitals.si?.toFixed(0) || 'N/A'}ms\n`;
  report += `- **TTI**: ${currentBuild.weightedVitals.tti?.toFixed(0) || 'N/A'}ms\n`;
  report += `- **TBT**: ${currentBuild.weightedVitals.tbt?.toFixed(0) || 'N/A'}ms\n\n`;

  // 권장사항
  if (regressions.length > 0) {
    report += `## 💡 권장사항\n\n`;

    const hasPerformanceRegression = regressions.some((r) => r.metric === 'performance');
    const hasVitalsRegression = regressions.some((r) => r.type === 'vitals');

    if (hasPerformanceRegression) {
      report += `- JavaScript 번들 크기를 확인하고 불필요한 코드를 제거하세요\n`;
      report += `- 이미지 최적화 및 lazy loading을 확인하세요\n`;
      report += `- Critical CSS를 인라인으로 처리하세요\n`;
    }

    if (hasVitalsRegression) {
      report += `- 큰 콘텐츠 요소의 로딩 시간을 최적화하세요\n`;
      report += `- 레이아웃 이동을 유발하는 요소를 확인하세요\n`;
      report += `- 메인 스레드 블로킹 작업을 최소화하세요\n`;
    }

    report += `\n자세한 분석은 Lighthouse 보고서를 참조하세요.\n`;
  }

  return report;
}

async function main() {
  console.log('🔍 성능 회귀 검사 시작...');

  try {
    // 현재 빌드의 Lighthouse 결과 로드
    const currentResults = await loadLighthouseResults();

    if (Object.keys(currentResults).length === 0) {
      console.warn('⚠️  Lighthouse 결과가 없습니다. 회귀 검사를 건너뜁니다.');
      return;
    }

    // 현재 빌드 메트릭 계산
    const currentBuild = {
      timestamp: new Date().toISOString(),
      commitSha: process.env.GITHUB_SHA || 'unknown',
      runId: process.env.GITHUB_RUN_ID || 'unknown',
      branch: process.env.GITHUB_REF_NAME || 'unknown',
      weightedScores: {
        performance: calculateWeightedScore(currentResults, 'performance'),
        accessibility: calculateWeightedScore(currentResults, 'accessibility'),
        bestPractices: calculateWeightedScore(currentResults, 'bestPractices'),
        seo: calculateWeightedScore(currentResults, 'seo'),
        pwa: calculateWeightedScore(currentResults, 'pwa'),
      },
      weightedVitals: {
        lcp: calculateWeightedVitals(currentResults, 'lcp'),
        fcp: calculateWeightedVitals(currentResults, 'fcp'),
        cls: calculateWeightedVitals(currentResults, 'cls'),
        si: calculateWeightedVitals(currentResults, 'si'),
        tti: calculateWeightedVitals(currentResults, 'tti'),
        tbt: calculateWeightedVitals(currentResults, 'tbt'),
      },
      pageResults: currentResults,
    };

    console.log('📊 현재 빌드 메트릭:', {
      performance: currentBuild.weightedScores.performance?.toFixed(1),
      accessibility: currentBuild.weightedScores.accessibility?.toFixed(1),
      lcp: currentBuild.weightedVitals.lcp?.toFixed(0) + 'ms',
    });

    // 기존 성능 기록 로드
    const history = await loadHistoricalData();

    let regressions = [];
    let reportContent = '';

    if (history.builds.length > 0) {
      // 가장 최근 빌드와 비교
      const previousBuild = history.builds[history.builds.length - 1];
      console.log('🔄 이전 빌드와 비교 중...');

      regressions = detectRegressions(currentBuild, previousBuild);
      reportContent = generateRegressionReport(regressions, currentBuild, previousBuild);

      console.log(`📝 ${regressions.length}개의 회귀가 감지되었습니다.`);
    } else {
      reportContent = generateRegressionReport([], currentBuild, null);
      console.log('📝 기준선 빌드로 설정되었습니다.');
    }

    // 보고서 저장
    await fs.writeFile('performance-regression-report.md', reportContent);
    console.log('✅ 회귀 보고서가 생성되었습니다.');

    // 성능 기록 업데이트
    history.builds.push(currentBuild);

    // 최근 50개 빌드만 유지
    if (history.builds.length > 50) {
      history.builds = history.builds.slice(-50);
    }

    await saveHistoricalData(history);

    // 심각한 회귀가 있으면 실패로 처리
    const criticalRegressions = regressions.filter((r) => r.severity === 'critical');
    if (criticalRegressions.length > 0) {
      console.error('🚨 심각한 성능 회귀가 감지되었습니다!');
      console.error(
        `심각한 회귀 ${criticalRegressions.length}개:`,
        criticalRegressions.map((r) => `${r.metric} (${r.difference.toFixed(1)})`)
      );

      // GitHub Actions에서 실패로 표시
      process.exit(1);
    }

    console.log('✅ 성능 회귀 검사 완료');
  } catch (error) {
    console.error('❌ 성능 회귀 검사 실패:', error);
    process.exit(1);
  }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
