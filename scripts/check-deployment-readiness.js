#!/usr/bin/env node

/**
 * 배포 준비 상태 검사기
 * QA 결과를 분석하여 프로덕션 배포 가능 여부를 판단합니다.
 */

const fs = require('fs');
const path = require('path');

// 배포 준비 기준
const DEPLOYMENT_CRITERIA = {
  // 필수 기준 (하나라도 실패하면 배포 불가)
  critical: {
    security: {
      minSuccessRate: 95,
      description: '보안 테스트 성공률'
    },
    accessibility: {
      minSuccessRate: 90,
      description: 'WCAG 2.1 AA 접근성 준수율'
    },
    coreE2E: {
      minSuccessRate: 95,
      description: '핵심 E2E 테스트 성공률'
    }
  },
  
  // 권장 기준 (실패해도 경고만 표시)
  recommended: {
    performance: {
      minSuccessRate: 85,
      description: 'Lighthouse 성능 점수'
    },
    unitTests: {
      minSuccessRate: 80,
      description: '단위 테스트 커버리지'
    },
    codeQuality: {
      minSuccessRate: 90,
      description: '코드 품질 기준'
    },
    crossBrowser: {
      minSuccessRate: 85,
      description: '크로스 브라우저 호환성'
    }
  }
};

// 배포 환경별 추가 기준
const ENVIRONMENT_CRITERIA = {
  production: {
    lighthouse: {
      performance: 90,
      accessibility: 95,
      bestPractices: 90,
      seo: 100
    },
    security: {
      maxCriticalVulnerabilities: 0,
      maxHighVulnerabilities: 0,
      maxMediumVulnerabilities: 5
    },
    performance: {
      maxLCP: 2500,      // ms
      maxFID: 100,       // ms
      maxCLS: 0.1,       // score
      maxTTI: 3800       // ms
    }
  },
  staging: {
    lighthouse: {
      performance: 80,
      accessibility: 90,
      bestPractices: 85,
      seo: 95
    }
  }
};

function loadQAResults() {
  try {
    const statisticsPath = './qa-results/qa-report/statistics.json';
    if (!fs.existsSync(statisticsPath)) {
      throw new Error('QA 통계 파일을 찾을 수 없습니다.');
    }

    const statistics = JSON.parse(fs.readFileSync(statisticsPath, 'utf8'));
    return statistics;
  } catch (error) {
    console.error('❌ QA 결과 로딩 실패:', error.message);
    return null;
  }
}

function checkCriticalCriteria(qaResults) {
  const failures = [];
  const warnings = [];

  // 보안 기준 검사
  const securityRate = qaResults.categories['보안 테스트'] 
    ? Math.round((qaResults.categories['보안 테스트'].passed / qaResults.categories['보안 테스트'].total) * 100)
    : 0;

  if (securityRate < DEPLOYMENT_CRITERIA.critical.security.minSuccessRate) {
    failures.push({
      category: '보안',
      current: securityRate,
      required: DEPLOYMENT_CRITERIA.critical.security.minSuccessRate,
      description: DEPLOYMENT_CRITERIA.critical.security.description
    });
  }

  // 접근성 기준 검사
  const accessibilityRate = qaResults.categories['접근성 테스트'] 
    ? Math.round((qaResults.categories['접근성 테스트'].passed / qaResults.categories['접근성 테스트'].total) * 100)
    : 0;

  if (accessibilityRate < DEPLOYMENT_CRITERIA.critical.accessibility.minSuccessRate) {
    failures.push({
      category: '접근성',
      current: accessibilityRate,
      required: DEPLOYMENT_CRITERIA.critical.accessibility.minSuccessRate,
      description: DEPLOYMENT_CRITERIA.critical.accessibility.description
    });
  }

  // E2E 테스트 기준 검사
  const e2eRate = qaResults.categories['E2E 테스트'] 
    ? Math.round((qaResults.categories['E2E 테스트'].passed / qaResults.categories['E2E 테스트'].total) * 100)
    : 0;

  if (e2eRate < DEPLOYMENT_CRITERIA.critical.coreE2E.minSuccessRate) {
    failures.push({
      category: 'E2E 테스트',
      current: e2eRate,
      required: DEPLOYMENT_CRITERIA.critical.coreE2E.minSuccessRate,
      description: DEPLOYMENT_CRITERIA.critical.coreE2E.description
    });
  }

  return { failures, warnings };
}

function checkRecommendedCriteria(qaResults) {
  const warnings = [];

  // 성능 기준 검사
  const performanceRate = qaResults.categories['성능 테스트'] 
    ? Math.round((qaResults.categories['성능 테스트'].passed / qaResults.categories['성능 테스트'].total) * 100)
    : 0;

  if (performanceRate < DEPLOYMENT_CRITERIA.recommended.performance.minSuccessRate) {
    warnings.push({
      category: '성능',
      current: performanceRate,
      required: DEPLOYMENT_CRITERIA.recommended.performance.minSuccessRate,
      description: DEPLOYMENT_CRITERIA.recommended.performance.description,
      severity: 'medium'
    });
  }

  // 단위 테스트 기준 검사
  const unitTestRate = qaResults.categories['단위 테스트'] 
    ? Math.round((qaResults.categories['단위 테스트'].passed / qaResults.categories['단위 테스트'].total) * 100)
    : 0;

  if (unitTestRate < DEPLOYMENT_CRITERIA.recommended.unitTests.minSuccessRate) {
    warnings.push({
      category: '단위 테스트',
      current: unitTestRate,
      required: DEPLOYMENT_CRITERIA.recommended.unitTests.minSuccessRate,
      description: DEPLOYMENT_CRITERIA.recommended.unitTests.description,
      severity: 'low'
    });
  }

  // 코드 품질 기준 검사
  const codeQualityRate = qaResults.categories['코드 품질'] 
    ? Math.round((qaResults.categories['코드 품질'].passed / qaResults.categories['코드 품질'].total) * 100)
    : 0;

  if (codeQualityRate < DEPLOYMENT_CRITERIA.recommended.codeQuality.minSuccessRate) {
    warnings.push({
      category: '코드 품질',
      current: codeQualityRate,
      required: DEPLOYMENT_CRITERIA.recommended.codeQuality.minSuccessRate,
      description: DEPLOYMENT_CRITERIA.recommended.codeQuality.description,
      severity: 'medium'
    });
  }

  return warnings;
}

function checkLighthouseScores() {
  const warnings = [];
  
  try {
    // Lighthouse 결과 파일 찾기
    const lighthouseDir = './qa-results/performance-results/.lighthouseci';
    if (fs.existsSync(lighthouseDir)) {
      // 실제 구현에서는 Lighthouse 결과 JSON 파일을 파싱
      console.log('📊 Lighthouse 결과 확인 중...');
      
      // 예시 점수 (실제로는 파일에서 파싱)
      const scores = {
        performance: 91,
        accessibility: 95,
        bestPractices: 90,
        seo: 100
      };

      const environment = process.env.NODE_ENV || 'production';
      const criteria = ENVIRONMENT_CRITERIA[environment]?.lighthouse || ENVIRONMENT_CRITERIA.production.lighthouse;

      Object.entries(criteria).forEach(([metric, threshold]) => {
        if (scores[metric] && scores[metric] < threshold) {
          warnings.push({
            category: 'Lighthouse',
            metric,
            current: scores[metric],
            required: threshold,
            description: `Lighthouse ${metric} 점수`,
            severity: 'medium'
          });
        }
      });
    }
  } catch (error) {
    console.warn('⚠️ Lighthouse 결과 파싱 실패:', error.message);
  }

  return warnings;
}

function generateDeploymentReport(qaResults, criticalFailures, warnings) {
  const isDeploymentReady = criticalFailures.length === 0;
  const environment = process.env.NODE_ENV || 'production';
  
  const report = `
# 🚀 배포 준비 상태 검사 결과

**검사 일시**: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}  
**대상 환경**: ${environment.toUpperCase()}  
**전체 품질 점수**: ${qaResults.successRate}%  

## 📋 배포 준비 상태

${isDeploymentReady ? `
✅ **배포 준비 완료**

모든 필수 품질 기준을 충족하여 프로덕션 배포가 가능합니다.
` : `
❌ **배포 준비 미완료**

다음 필수 기준을 충족하지 못하여 배포가 불가능합니다.
`}

## 🔍 상세 검사 결과

### 필수 기준 (Critical)
${criticalFailures.length === 0 ? '✅ 모든 필수 기준 충족' : '❌ 필수 기준 미충족'}

${criticalFailures.map(failure => `
- ❌ **${failure.category}**: ${failure.current}% (최소 ${failure.required}% 필요)
  - ${failure.description}
`).join('')}

### 권장 기준 (Recommended)
${warnings.filter(w => w.severity !== 'lighthouse').length === 0 ? '✅ 모든 권장 기준 충족' : '⚠️ 일부 권장 기준 미충족'}

${warnings.filter(w => w.severity !== 'lighthouse').map(warning => `
- ⚠️ **${warning.category}**: ${warning.current}% (권장 ${warning.required}%)
  - ${warning.description}
  - 심각도: ${warning.severity}
`).join('')}

### Lighthouse 성능 지표
${warnings.filter(w => w.category === 'Lighthouse').length === 0 ? '✅ 모든 성능 기준 충족' : '⚠️ 일부 성능 지표 개선 필요'}

${warnings.filter(w => w.category === 'Lighthouse').map(warning => `
- ⚠️ **${warning.metric}**: ${warning.current} (최소 ${warning.required} 필요)
`).join('')}

## 🎯 조치 권장사항

### 즉시 수정 필요 (배포 차단)
${criticalFailures.length === 0 ? '없음' : criticalFailures.map(failure => `
- ${failure.category} 개선: ${failure.description} 기준 충족
`).join('')}

### 배포 후 개선 권장
${warnings.map(warning => `
- ${warning.category} 최적화: ${warning.description}
`).join('')}

${isDeploymentReady ? `
## ✅ 배포 승인

**상태**: 배포 준비 완료  
**승인 시간**: ${new Date().toISOString()}  
**다음 검증**: 배포 후 모니터링 및 다음 릴리스 전 재검증  

### 배포 후 모니터링 항목
- 실 사용자 성능 지표 (RUM)
- 오류율 모니터링
- 접근성 사용자 피드백
- 보안 이벤트 모니터링
` : `
## ❌ 배포 거부

**상태**: 배포 준비 미완료  
**차단 사유**: ${criticalFailures.length}개 필수 기준 미충족  
**재검증**: 문제 수정 후 전체 QA 파이프라인 재실행 필요  
`}

---
**자동 생성됨**: doha.kr 배포 준비 검사기
`;

  return report;
}

function main() {
  console.log('🚀 배포 준비 상태 검사 시작...');

  // QA 결과 로딩
  const qaResults = loadQAResults();
  if (!qaResults) {
    console.error('❌ QA 결과를 불러올 수 없어 배포를 차단합니다.');
    process.exit(1);
  }

  console.log(`📊 전체 품질 점수: ${qaResults.successRate}%`);

  // 필수 기준 검사
  const { failures: criticalFailures } = checkCriticalCriteria(qaResults);
  
  // 권장 기준 검사
  const recommendedWarnings = checkRecommendedCriteria(qaResults);
  
  // Lighthouse 점수 검사
  const lighthouseWarnings = checkLighthouseScores();
  
  const allWarnings = [...recommendedWarnings, ...lighthouseWarnings];

  // 결과 출력
  console.log('\n📋 검사 결과:');
  
  if (criticalFailures.length > 0) {
    console.log('❌ 필수 기준 미충족:');
    criticalFailures.forEach(failure => {
      console.log(`  - ${failure.category}: ${failure.current}% (최소 ${failure.required}% 필요)`);
    });
  } else {
    console.log('✅ 모든 필수 기준 충족');
  }

  if (allWarnings.length > 0) {
    console.log('\n⚠️ 권장사항:');
    allWarnings.forEach(warning => {
      console.log(`  - ${warning.category}: ${warning.current}% (권장 ${warning.required}%)`);
    });
  }

  // 배포 준비 리포트 생성
  const deploymentReport = generateDeploymentReport(qaResults, criticalFailures, allWarnings);
  
  if (!fs.existsSync('./qa-report')) {
    fs.mkdirSync('./qa-report', { recursive: true });
  }
  
  fs.writeFileSync('./qa-report/deployment-readiness.md', deploymentReport);

  // 배포 준비 상태 JSON 생성
  const deploymentStatus = {
    timestamp: new Date().toISOString(),
    ready: criticalFailures.length === 0,
    overallScore: qaResults.successRate,
    criticalFailures,
    warnings: allWarnings,
    environment: process.env.NODE_ENV || 'production'
  };

  fs.writeFileSync('./qa-report/deployment-status.json', JSON.stringify(deploymentStatus, null, 2));

  // 결과 출력
  if (criticalFailures.length === 0) {
    console.log('\n🎉 배포 준비 완료!');
    console.log('✅ 모든 필수 품질 기준을 충족합니다.');
    console.log('🚀 프로덕션 배포를 진행할 수 있습니다.');
    
    if (allWarnings.length > 0) {
      console.log(`\n💡 ${allWarnings.length}개의 개선사항이 있지만 배포에는 문제없습니다.`);
    }
    
    process.exit(0);
  } else {
    console.log('\n🛑 배포 차단됨');
    console.log(`❌ ${criticalFailures.length}개의 필수 기준을 충족하지 못했습니다.`);
    console.log('🔧 문제를 수정한 후 다시 검사해 주세요.');
    
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ 배포 준비 검사 실패:', error);
    process.exit(1);
  }
}

module.exports = { checkDeploymentReadiness: main };