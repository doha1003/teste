/**
 * 품질 보고서 생성 스크립트
 * 모든 테스트 결과를 수집하여 종합적인 품질 보고서를 생성합니다.
 */

import fs from 'fs/promises';
import path from 'path';

// 품질 기준
const QUALITY_STANDARDS = {
  lighthouse: {
    performance: { target: 95, warning: 90 },
    accessibility: { target: 95, warning: 90 },
    bestPractices: { target: 90, warning: 85 },
    seo: { target: 100, warning: 95 },
    pwa: { target: 85, warning: 80 },
  },
  vitals: {
    lcp: { target: 2500, warning: 3000 },
    fcp: { target: 1800, warning: 2200 },
    cls: { target: 0.1, warning: 0.15 },
    si: { target: 3400, warning: 4000 },
    tti: { target: 3800, warning: 4500 },
    tbt: { target: 300, warning: 500 },
  },
  coverage: {
    statements: { target: 80, warning: 70 },
    branches: { target: 75, warning: 65 },
    functions: { target: 80, warning: 70 },
    lines: { target: 80, warning: 70 },
  },
};

async function loadArtifactData(artifactPath) {
  try {
    const files = await fs.readdir(artifactPath, { recursive: true });
    const data = {};

    for (const file of files) {
      const fullPath = path.join(artifactPath, file);
      const stat = await fs.stat(fullPath);

      if (stat.isFile() && file.endsWith('.json')) {
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          const parsed = JSON.parse(content);

          // 파일 경로에 따라 카테고리 분류
          if (file.includes('lighthouse')) {
            data.lighthouse = data.lighthouse || [];
            data.lighthouse.push(parsed);
          } else if (file.includes('coverage')) {
            data.coverage = parsed;
          } else if (file.includes('test-results')) {
            data.testResults = data.testResults || [];
            data.testResults.push(parsed);
          }
        } catch (parseError) {
          console.warn(`JSON 파싱 실패: ${file}`, parseError.message);
        }
      } else if (stat.isFile() && file.endsWith('.html')) {
        // HTML 보고서 경로 저장
        data.reports = data.reports || [];
        data.reports.push({
          type: file.includes('lighthouse')
            ? 'lighthouse'
            : file.includes('coverage')
              ? 'coverage'
              : 'other',
          path: fullPath,
          name: file,
        });
      }
    }

    return data;
  } catch (error) {
    console.warn(`아티팩트 로드 실패: ${artifactPath}`, error.message);
    return {};
  }
}

function analyzeLighthouseData(lighthouseData) {
  if (!lighthouseData || lighthouseData.length === 0) {
    return null;
  }

  const results = {};

  lighthouseData.forEach((report) => {
    if (report.lhr) {
      const url = new URL(report.lhr.finalUrl).pathname;
      const { audits, categories } = report.lhr;

      results[url] = {
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
      };
    }
  });

  // 전체 평균 계산
  const urls = Object.keys(results);
  const averages = {
    scores: {},
    vitals: {},
  };

  ['performance', 'accessibility', 'bestPractices', 'seo', 'pwa'].forEach((scoreType) => {
    const validScores = urls
      .map((url) => results[url].scores[scoreType])
      .filter((score) => score !== null && score !== undefined);
    averages.scores[scoreType] =
      validScores.length > 0
        ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
        : null;
  });

  ['lcp', 'fcp', 'cls', 'si', 'tti', 'tbt'].forEach((vitalType) => {
    const validVitals = urls
      .map((url) => results[url].vitals[vitalType])
      .filter((vital) => vital !== null && vital !== undefined);
    averages.vitals[vitalType] =
      validVitals.length > 0
        ? validVitals.reduce((sum, vital) => sum + vital, 0) / validVitals.length
        : null;
  });

  return {
    byPage: results,
    averages,
    pageCount: urls.length,
  };
}

function calculateQualityScore(lighthouseAnalysis, coverageData, testResults) {
  let totalScore = 0;
  let maxScore = 0;

  // Lighthouse 점수 (60점 만점)
  if (lighthouseAnalysis) {
    const weights = { performance: 20, accessibility: 15, bestPractices: 10, seo: 10, pwa: 5 };

    Object.entries(weights).forEach(([metric, weight]) => {
      const score = lighthouseAnalysis.averages.scores[metric];
      if (score !== null && score !== undefined) {
        totalScore += (score / 100) * weight;
      }
      maxScore += weight;
    });
  }

  // 테스트 커버리지 (20점 만점)
  if (coverageData && coverageData.total) {
    const coverageScore =
      ((coverageData.total.statements.pct || 0) +
        (coverageData.total.branches.pct || 0) +
        (coverageData.total.functions.pct || 0) +
        (coverageData.total.lines.pct || 0)) /
      4;

    totalScore += (coverageScore / 100) * 20;
    maxScore += 20;
  }

  // 테스트 성공률 (20점 만점)
  if (testResults && testResults.length > 0) {
    const totalTests = testResults.reduce((sum, result) => sum + (result.total || 0), 0);
    const passedTests = testResults.reduce((sum, result) => sum + (result.passed || 0), 0);

    if (totalTests > 0) {
      const testSuccessRate = (passedTests / totalTests) * 100;
      totalScore += (testSuccessRate / 100) * 20;
    }
    maxScore += 20;
  }

  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
}

function getQualityGrade(score) {
  if (score >= 95) return { grade: 'A+', color: '#10b981', description: '최우수' };
  if (score >= 90) return { grade: 'A', color: '#059669', description: '우수' };
  if (score >= 85) return { grade: 'B+', color: '#34d399', description: '양호' };
  if (score >= 80) return { grade: 'B', color: '#fbbf24', description: '보통' };
  if (score >= 70) return { grade: 'C', color: '#f59e0b', description: '개선 필요' };
  if (score >= 60) return { grade: 'D', color: '#f97316', description: '미흡' };
  return { grade: 'F', color: '#ef4444', description: '불량' };
}

function generateQualityHTML(data) {
  const { qualityScore, qualityGrade, lighthouseAnalysis, coverageData, testResults, metadata } =
    data;

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>doha.kr 품질 보고서 - ${metadata.timestamp}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f9fafb;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .header p { opacity: 0.9; font-size: 1.1rem; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        
        .quality-overview {
            background: white;
            border-radius: 16px;
            padding: 3rem;
            margin-bottom: 2rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            text-align: center;
        }
        .quality-score {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            font-size: 2rem;
            font-weight: bold;
            color: white;
            margin-bottom: 1rem;
        }
        .quality-grade {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        .quality-description {
            font-size: 1.2rem;
            color: #6b7280;
            margin-bottom: 2rem;
        }
        
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }
        .card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            border-left: 4px solid #667eea;
        }
        .card h3 {
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
            color: #374151;
        }
        
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        .metric-item {
            text-align: center;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
        }
        .metric-value {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.25rem;
        }
        .metric-label {
            font-size: 0.875rem;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .score-good { color: #10b981; }
        .score-warning { color: #f59e0b; }
        .score-poor { color: #ef4444; }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            margin: 0.5rem 0;
        }
        .progress-fill {
            height: 100%;
            transition: width 0.3s ease;
            border-radius: 4px;
        }
        
        .page-results {
            margin-top: 2rem;
        }
        .page-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
        }
        .page-item:last-child { border-bottom: none; }
        .page-url {
            font-weight: 500;
            color: #374151;
        }
        .page-scores {
            display: flex;
            gap: 1rem;
        }
        .page-score {
            font-size: 0.875rem;
            font-weight: 500;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            background: #f3f4f6;
        }
        
        .vitals-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .coverage-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-top: 1rem;
        }
        .coverage-item {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
        }
        
        .test-summary {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 1.5rem;
            margin-top: 1rem;
        }
        .test-stats {
            display: flex;
            justify-content: space-around;
            margin-top: 1rem;
        }
        .test-stat {
            text-align: center;
        }
        .test-stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #0369a1;
        }
        .test-stat-label {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .metadata {
            background: #f8fafc;
            border-radius: 8px;
            padding: 1.5rem;
            margin-top: 2rem;
            font-size: 0.875rem;
            color: #6b7280;
        }
        .metadata-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .recommendations {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 1.5rem;
            margin-top: 2rem;
        }
        .recommendations h4 {
            color: #92400e;
            margin-bottom: 1rem;
        }
        .recommendations ul {
            color: #92400e;
            padding-left: 1.5rem;
        }
        .recommendations li {
            margin-bottom: 0.5rem;
        }
        
        @media (max-width: 768px) {
            .container { padding: 1rem; }
            .quality-overview { padding: 2rem 1rem; }
            .header h1 { font-size: 2rem; }
            .quality-score { width: 100px; height: 100px; font-size: 1.5rem; }
            .quality-grade { font-size: 2rem; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏆 doha.kr 품질 보고서</h1>
        <p>종합적인 웹사이트 품질 분석 결과</p>
        <p>${metadata.timestamp}</p>
    </div>

    <div class="container">
        <!-- 품질 개요 -->
        <div class="quality-overview">
            <div class="quality-score" style="background-color: ${qualityGrade.color};">
                ${qualityScore}
            </div>
            <div class="quality-grade" style="color: ${qualityGrade.color};">
                ${qualityGrade.grade}
            </div>
            <div class="quality-description">
                ${qualityGrade.description} (${qualityScore}/100점)
            </div>
            <p>이 점수는 성능, 접근성, 모범 사례, SEO, 테스트 커버리지 및 테스트 성공률을 종합한 결과입니다.</p>
        </div>

        <div class="grid">
            ${
              lighthouseAnalysis
                ? `
            <!-- Lighthouse 점수 -->
            <div class="card">
                <h3>📊 Lighthouse 점수 (평균)</h3>
                <div class="metric-grid">
                    ${Object.entries(lighthouseAnalysis.averages.scores)
                      .map(([key, score]) => {
                        if (score === null || score === undefined) return '';
                        const standard = QUALITY_STANDARDS.lighthouse[key];
                        const className =
                          score >= standard.target
                            ? 'score-good'
                            : score >= standard.warning
                              ? 'score-warning'
                              : 'score-poor';
                        return `
                        <div class="metric-item">
                            <div class="metric-value ${className}">${score.toFixed(1)}</div>
                            <div class="metric-label">${key}</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${score}%; background-color: ${score >= standard.target ? '#10b981' : score >= standard.warning ? '#f59e0b' : '#ef4444'};"></div>
                            </div>
                        </div>
                      `;
                      })
                      .join('')}
                </div>
                
                <div class="page-results">
                    <h4 style="margin-bottom: 1rem;">페이지별 세부 결과</h4>
                    ${Object.entries(lighthouseAnalysis.byPage)
                      .map(
                        ([url, data]) => `
                        <div class="page-item">
                            <div class="page-url">${url}</div>
                            <div class="page-scores">
                                ${Object.entries(data.scores)
                                  .map(([key, score]) => {
                                    if (score === null) return '';
                                    const standard = QUALITY_STANDARDS.lighthouse[key];
                                    const className =
                                      score >= standard.target
                                        ? 'score-good'
                                        : score >= standard.warning
                                          ? 'score-warning'
                                          : 'score-poor';
                                    return `<span class="page-score ${className}">${key}: ${score}</span>`;
                                  })
                                  .join('')}
                            </div>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            </div>

            <!-- Core Web Vitals -->
            <div class="card">
                <h3>⚡ Core Web Vitals (평균)</h3>
                <div class="vitals-grid">
                    ${Object.entries(lighthouseAnalysis.averages.vitals)
                      .map(([key, value]) => {
                        if (value === null || value === undefined) return '';
                        const standard = QUALITY_STANDARDS.vitals[key];
                        const className =
                          value <= standard.target
                            ? 'score-good'
                            : value <= standard.warning
                              ? 'score-warning'
                              : 'score-poor';
                        const unit = key === 'cls' ? '' : 'ms';
                        const displayValue = key === 'cls' ? value.toFixed(3) : Math.round(value);
                        return `
                        <div class="metric-item">
                            <div class="metric-value ${className}">${displayValue}${unit}</div>
                            <div class="metric-label">${key.toUpperCase()}</div>
                        </div>
                      `;
                      })
                      .join('')}
                </div>
            </div>
            `
                : ''
            }

            ${
              coverageData
                ? `
            <!-- 테스트 커버리지 -->
            <div class="card">
                <h3>🧪 테스트 커버리지</h3>
                <div class="coverage-details">
                    ${Object.entries(coverageData.total || {})
                      .map(([key, data]) => {
                        if (typeof data !== 'object' || !data.pct) return '';
                        const standard = QUALITY_STANDARDS.coverage[key];
                        const className =
                          data.pct >= standard.target
                            ? 'score-good'
                            : data.pct >= standard.warning
                              ? 'score-warning'
                              : 'score-poor';
                        return `
                        <div class="coverage-item">
                            <div class="metric-value ${className}">${data.pct.toFixed(1)}%</div>
                            <div class="metric-label">${key}</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${data.pct}%; background-color: ${data.pct >= standard.target ? '#10b981' : data.pct >= standard.warning ? '#f59e0b' : '#ef4444'};"></div>
                            </div>
                            <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">
                                ${data.covered}/${data.total}
                            </div>
                        </div>
                      `;
                      })
                      .join('')}
                </div>
            </div>
            `
                : ''
            }

            ${
              testResults && testResults.length > 0
                ? `
            <!-- 테스트 결과 -->
            <div class="card">
                <h3>✅ 테스트 실행 결과</h3>
                <div class="test-summary">
                    <div class="test-stats">
                        ${testResults
                          .map(
                            (result) => `
                            <div class="test-stat">
                                <div class="test-stat-value">${result.passed || 0}</div>
                                <div class="test-stat-label">성공</div>
                            </div>
                            <div class="test-stat">
                                <div class="test-stat-value">${result.failed || 0}</div>
                                <div class="test-stat-label">실패</div>
                            </div>
                            <div class="test-stat">
                                <div class="test-stat-value">${result.total || 0}</div>
                                <div class="test-stat-label">전체</div>
                            </div>
                        `
                          )
                          .join('')}
                    </div>
                </div>
            </div>
            `
                : ''
            }
        </div>

        <!-- 개선 권장사항 -->
        ${
          qualityScore < 90
            ? `
        <div class="recommendations">
            <h4>💡 개선 권장사항</h4>
            <ul>
                ${lighthouseAnalysis && lighthouseAnalysis.averages.scores.performance < 90 ? '<li>JavaScript 번들 크기 최적화 및 코드 분할 적용</li>' : ''}
                ${lighthouseAnalysis && lighthouseAnalysis.averages.scores.accessibility < 95 ? '<li>접근성 개선: 대체 텍스트, 색상 대비, 키보드 내비게이션 확인</li>' : ''}
                ${lighthouseAnalysis && lighthouseAnalysis.averages.vitals.lcp > 2500 ? '<li>이미지 최적화 및 Critical CSS 적용으로 LCP 개선</li>' : ''}
                ${lighthouseAnalysis && lighthouseAnalysis.averages.vitals.cls > 0.1 ? '<li>레이아웃 이동 최소화: 이미지 크기 사전 정의, 동적 콘텐츠 최적화</li>' : ''}
                ${coverageData && coverageData.total && coverageData.total.statements.pct < 80 ? '<li>테스트 커버리지 확대: 추가 단위 테스트 및 통합 테스트 작성</li>' : ''}
                <li>정기적인 성능 모니터링 및 회귀 테스트 실행</li>
                <li>사용자 피드백 수집을 통한 실사용성 개선</li>
            </ul>
        </div>
        `
            : ''
        }

        <!-- 메타데이터 -->
        <div class="metadata">
            <h4 style="margin-bottom: 1rem; color: #374151;">📋 빌드 정보</h4>
            <div class="metadata-grid">
                <div><strong>커밋:</strong> ${metadata.commitSha}</div>
                <div><strong>브랜치:</strong> ${metadata.branch}</div>
                <div><strong>빌드 번호:</strong> ${metadata.runNumber}</div>
                <div><strong>실행 ID:</strong> ${metadata.runId}</div>
                <div><strong>생성 시간:</strong> ${metadata.timestamp}</div>
                <div><strong>테스트 페이지:</strong> ${lighthouseAnalysis ? lighthouseAnalysis.pageCount : 0}개</div>
            </div>
        </div>
    </div>

    <script>
        // 페이지 로드 시 애니메이션
        document.addEventListener('DOMContentLoaded', function() {
            const progressBars = document.querySelectorAll('.progress-fill');
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 500);
            });
        });
    </script>
</body>
</html>
  `;
}

async function main() {
  console.log('📊 품질 보고서 생성 시작...');

  try {
    // 아티팩트 데이터 로드
    const artifactsPath = './artifacts';
    const allData = {};

    try {
      const artifactDirs = await fs.readdir(artifactsPath);

      for (const dir of artifactDirs) {
        const dirPath = path.join(artifactsPath, dir);
        const data = await loadArtifactData(dirPath);
        Object.assign(allData, data);
      }
    } catch (error) {
      console.warn('아티팩트 디렉토리를 찾을 수 없습니다:', error.message);
    }

    // Lighthouse 데이터 분석
    const lighthouseAnalysis = analyzeLighthouseData(allData.lighthouse);

    // 품질 점수 계산
    const qualityScore = calculateQualityScore(
      lighthouseAnalysis,
      allData.coverage,
      allData.testResults
    );

    const qualityGrade = getQualityGrade(qualityScore);

    // 메타데이터 생성
    const metadata = {
      timestamp: new Date().toLocaleString('ko-KR'),
      commitSha: process.env.COMMIT_SHA || process.env.GITHUB_SHA || 'unknown',
      branch: process.env.BRANCH_NAME || process.env.GITHUB_REF_NAME || 'unknown',
      runId: process.env.RUN_ID || process.env.GITHUB_RUN_ID || 'unknown',
      runNumber: process.env.RUN_NUMBER || process.env.GITHUB_RUN_NUMBER || 'unknown',
    };

    console.log('📈 품질 점수:', qualityScore, '(' + qualityGrade.grade + ')');

    // 품질 보고서 데이터 구성
    const reportData = {
      qualityScore,
      qualityGrade,
      lighthouseAnalysis,
      coverageData: allData.coverage,
      testResults: allData.testResults,
      metadata,
    };

    // HTML 보고서 생성
    const htmlReport = generateQualityHTML(reportData);
    await fs.writeFile('quality-report.html', htmlReport);

    // JSON 메트릭 생성
    const jsonMetrics = {
      score: qualityScore,
      grade: qualityGrade.grade,
      timestamp: metadata.timestamp,
      lighthouse: lighthouseAnalysis?.averages || null,
      coverage: allData.coverage?.total || null,
      metadata,
    };

    await fs.writeFile('quality-metrics.json', JSON.stringify(jsonMetrics, null, 2));

    console.log('✅ 품질 보고서 생성 완료');
    console.log('📄 HTML 보고서: quality-report.html');
    console.log('📊 JSON 메트릭: quality-metrics.json');

    // 품질 점수가 낮으면 경고
    if (qualityScore < 80) {
      console.warn('⚠️  품질 점수가 목표치(80점) 미만입니다.');
      console.warn('개선사항을 검토해주세요.');
    }
  } catch (error) {
    console.error('❌ 품질 보고서 생성 실패:', error);
    process.exit(1);
  }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
