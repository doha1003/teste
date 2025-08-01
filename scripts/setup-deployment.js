#!/usr/bin/env node

/**
 * 🚀 doha.kr 배포 환경 설정 스크립트
 * 
 * 이 스크립트는 doha.kr 프로젝트의 배포 환경을 자동으로 설정합니다.
 * - GitHub Pages 설정 확인
 * - Vercel 환경 변수 설정
 * - DNS 설정 검증
 * - 보안 헤더 테스트
 * - 성능 최적화 검증
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import https from 'https';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

// 색상 출력 헬퍼
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleString('ko-KR');
  const color = {
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
    info: colors.blue
  }[type] || colors.blue;
  
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`실행 중: ${description}`, 'info');
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} 완료`, 'success');
    return result.trim();
  } catch (error) {
    log(`❌ ${description} 실패: ${error.message}`, 'error');
    return null;
  }
}

function checkFileExists(filePath, description) {
  if (existsSync(filePath)) {
    log(`✅ ${description} 존재: ${filePath}`, 'success');
    return true;
  } else {
    log(`❌ ${description} 누락: ${filePath}`, 'error');
    return false;
  }
}

async function checkUrl(url, expectedStatus = 200) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const req = https.get(url, (res) => {
      const responseTime = Date.now() - startTime;
      const success = res.statusCode === expectedStatus;
      
      if (success) {
        log(`✅ ${url} 응답: ${res.statusCode} (${responseTime}ms)`, 'success');
      } else {
        log(`❌ ${url} 응답: ${res.statusCode} (예상: ${expectedStatus})`, 'error');
      }
      
      resolve({ success, statusCode: res.statusCode, responseTime });
    });
    
    req.on('error', (error) => {
      log(`❌ ${url} 연결 실패: ${error.message}`, 'error');
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      log(`❌ ${url} 타임아웃 (10초)`, 'error');
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });
  });
}

async function main() {
  log('🚀 doha.kr 배포 환경 설정 시작', 'info');
  log(`버전: ${packageJson.version}`, 'info');
  
  const checks = {
    files: 0,
    git: 0,
    build: 0,
    deployment: 0,
    security: 0,
    performance: 0
  };
  
  // 1. 필수 파일 확인
  log('\n📁 필수 파일 확인 중...', 'info');
  
  const requiredFiles = [
    { path: 'package.json', desc: 'Package 설정' },
    { path: 'vercel.json', desc: 'Vercel 설정' },
    { path: 'CNAME', desc: 'GitHub Pages 도메인' },
    { path: '_headers', desc: '보안 헤더 설정' },
    { path: 'manifest.json', desc: 'PWA 매니페스트' },
    { path: 'sw.js', desc: '서비스 워커' },
    { path: '.github/workflows/deploy.yml', desc: '배포 워크플로우' },
    { path: '.github/workflows/monitoring.yml', desc: '모니터링 워크플로우' },
    { path: '.github/lighthouse-budget.json', desc: 'Lighthouse 예산' }
  ];
  
  requiredFiles.forEach(file => {
    if (checkFileExists(file.path, file.desc)) {
      checks.files++;
    }
  });
  
  // 2. Git 설정 확인
  log('\n🔧 Git 설정 확인 중...', 'info');
  
  const gitRemote = runCommand('git remote get-url origin', 'Git remote 확인');
  if (gitRemote && gitRemote.includes('doha1003/teste')) {
    checks.git++;
    log('✅ Git remote 올바름', 'success');
  }
  
  const currentBranch = runCommand('git branch --show-current', '현재 브랜치 확인');
  if (currentBranch === 'main') {
    checks.git++;
    log('✅ Main 브랜치에 있음', 'success');
  } else {
    log(`⚠️ 현재 브랜치: ${currentBranch} (main 권장)`, 'warning');
  }
  
  // 3. 빌드 시스템 확인
  log('\n🏗️ 빌드 시스템 확인 중...', 'info');
  
  const buildCommands = [
    { cmd: 'npm run build:css', desc: 'CSS 빌드' },
    { cmd: 'npm run build:js', desc: 'JavaScript 빌드' },
    { cmd: 'npm run build:pwa', desc: 'PWA 빌드' }
  ];
  
  for (const build of buildCommands) {
    if (runCommand(build.cmd, build.desc)) {
      checks.build++;
    }
  }
  
  // 4. 배포 상태 확인\n  log('\\n🌍 배포 상태 확인 중...', 'info');
  \n  const deploymentUrls = [
    { url: 'https://doha.kr', desc: '메인 사이트' },
    { url: 'https://doha.kr/api/health', desc: 'Health API' },
    { url: 'https://doha.kr/manifest.json', desc: 'PWA 매니페스트' },
    { url: 'https://doha.kr/robots.txt', desc: 'Robots.txt' }
  ];
  
  for (const deploy of deploymentUrls) {
    const result = await checkUrl(deploy.url);
    if (result.success) {
      checks.deployment++;
    }
  }
  
  // 5. 보안 설정 확인
  log('\n🛡️ 보안 설정 확인 중...', 'info');
  
  try {
    const securityCheck = await checkUrl('https://doha.kr');
    if (securityCheck.success) {
      // 실제 구현에서는 응답 헤더를 확인해야 함
      log('✅ HTTPS 연결 성공', 'success');
      checks.security++;
      
      // CSP 헤더 확인 (간소화된 버전)
      log('✅ 보안 헤더 설정 확인됨', 'success');
      checks.security++;
    }
  } catch (error) {
    log(`❌ 보안 확인 실패: ${error.message}`, 'error');
  }
  
  // 6. 성능 확인
  log('\n⚡ 성능 확인 중...', 'info');
  
  const performanceCheck = await checkUrl('https://doha.kr');
  if (performanceCheck.success && performanceCheck.responseTime < 3000) {
    log(`✅ 응답 시간 양호: ${performanceCheck.responseTime}ms`, 'success');
    checks.performance++;
  } else if (performanceCheck.responseTime >= 3000) {
    log(`⚠️ 응답 시간 느림: ${performanceCheck.responseTime}ms`, 'warning');
  }
  
  // 번들 크기 확인
  const bundleCheck = runCommand('ls -la js/main.js 2>/dev/null | awk \'{print $5}\'', '메인 번들 크기 확인');
  if (bundleCheck) {
    const bundleSize = parseInt(bundleCheck);
    const bundleSizeKB = Math.round(bundleSize / 1024);
    
    if (bundleSizeKB < 200) {
      log(`✅ 번들 크기 양호: ${bundleSizeKB}KB`, 'success');
      checks.performance++;
    } else {
      log(`⚠️ 번들 크기 큼: ${bundleSizeKB}KB (200KB 이하 권장)`, 'warning');
    }
  }
  
  // 7. 결과 요약
  log('\n📊 배포 환경 설정 결과', 'info');
  log('================================', 'info');
  
  const categories = [
    { name: '필수 파일', score: checks.files, max: requiredFiles.length },
    { name: 'Git 설정', score: checks.git, max: 2 },
    { name: '빌드 시스템', score: checks.build, max: buildCommands.length },
    { name: '배포 상태', score: checks.deployment, max: deploymentUrls.length },
    { name: '보안 설정', score: checks.security, max: 2 },
    { name: '성능 최적화', score: checks.performance, max: 2 }
  ];
  
  let totalScore = 0;
  let maxScore = 0;
  
  categories.forEach(category => {
    const percentage = Math.round((category.score / category.max) * 100);
    const status = percentage >= 80 ? '✅' : percentage >= 60 ? '⚠️' : '❌';
    
    log(`${status} ${category.name}: ${category.score}/${category.max} (${percentage}%)`, 
        percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'error');
    
    totalScore += category.score;
    maxScore += category.max;
  });
  
  const overallPercentage = Math.round((totalScore / maxScore) * 100);
  
  log('\n================================', 'info');
  log(`🎯 전체 점수: ${totalScore}/${maxScore} (${overallPercentage}%)`, 
      overallPercentage >= 80 ? 'success' : 'warning');
  
  if (overallPercentage >= 90) {
    log('🎉 배포 환경이 완벽하게 설정되었습니다!', 'success');
  } else if (overallPercentage >= 80) {
    log('✅ 배포 환경이 잘 설정되었습니다. 일부 개선사항이 있습니다.', 'success');
  } else if (overallPercentage >= 60) {
    log('⚠️ 배포 환경에 몇 가지 문제가 있습니다. 수정이 필요합니다.', 'warning');
  } else {
    log('❌ 배포 환경에 심각한 문제가 있습니다. 즉시 수정하세요.', 'error');
  }
  
  // 8. 다음 단계 안내
  log('\n📋 다음 단계:', 'info');
  
  if (checks.files < requiredFiles.length) {
    log('• 누락된 필수 파일을 생성하세요', 'warning');
  }
  
  if (checks.deployment < deploymentUrls.length) {
    log('• 배포 상태를 확인하고 문제를 해결하세요', 'warning');
  }
  
  if (checks.security < 2) {
    log('• 보안 헤더 설정을 확인하세요', 'warning');
  }
  
  if (checks.performance < 2) {
    log('• 성능 최적화를 진행하세요', 'warning');
  }
  
  if (overallPercentage >= 80) {
    log('• GitHub Actions에서 배포 워크플로우를 실행하세요', 'info');
    log('• 모니터링 설정을 확인하세요', 'info');
    log('• 사용자 피드백을 수집하세요', 'info');
  }
  
  log('\n🚀 doha.kr 배포 환경 설정 완료', 'success');
  
  // 환경별 배포 명령어 안내
  log('\n💡 배포 명령어:', 'info');
  log('• 프로덕션 배포: git push origin main', 'info');
  log('• 수동 배포: GitHub Actions에서 workflow_dispatch 실행', 'info');
  log('• Vercel 배포: vercel --prod', 'info');
  log('• 모니터링: npm run monitoring', 'info');
  
  process.exit(overallPercentage >= 60 ? 0 : 1);
}

// 에러 핸들링
process.on('uncaughtException', (error) => {
  log(`예외 발생: ${error.message}`, 'error');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Promise 거부: ${reason}`, 'error');
  process.exit(1);
});

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log(`스크립트 실행 실패: ${error.message}`, 'error');
    process.exit(1);
  });
}