/**
 * 테스트 실행 헬퍼 스크립트
 * 테스트 환경을 확인하고 적절한 테스트를 실행합니다.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { createServer } from 'http';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// 로그 함수
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}━━━ ${msg} ━━━${colors.reset}\n`),
};

// 명령 실행 함수
function runCommand(command, options = {}) {
  try {
    log.info(`실행: ${command}`);
    execSync(command, {
      stdio: 'inherit',
      cwd: rootDir,
      ...options,
    });
    return true;
  } catch (error) {
    log.error(`명령 실행 실패: ${command}`);
    return false;
  }
}

// 포트 확인 함수
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(port, () => {
      server.close();
      resolve(true);
    });
    server.on('error', () => {
      resolve(false);
    });
  });
}

// 의존성 확인
function checkDependencies() {
  log.section('의존성 확인');

  const requiredFiles = [
    'node_modules',
    'package.json',
    'vitest.config.js',
    'playwright.config.js',
  ];

  let allPresent = true;

  for (const file of requiredFiles) {
    const path = join(rootDir, file);
    if (existsSync(path)) {
      log.success(`${file} 확인됨`);
    } else {
      log.error(`${file} 없음`);
      allPresent = false;
    }
  }

  if (!allPresent) {
    log.warn('필요한 파일이 없습니다. npm install을 실행해주세요.');
    return false;
  }

  return true;
}

// 테스트 서버 시작
async function startTestServer() {
  log.section('테스트 서버 확인');

  const port = 3000;
  const available = await isPortAvailable(port);

  if (!available) {
    log.warn(`포트 ${port}이 이미 사용 중입니다.`);
    return true; // 이미 실행 중이므로 OK
  }

  log.info('테스트 서버 시작 중...');

  // Python HTTP 서버 백그라운드 실행
  const command =
    process.platform === 'win32'
      ? `start /B python -m http.server ${port}`
      : `python -m http.server ${port} &`;

  runCommand(command);

  // 서버 시작 대기
  await new Promise((resolve) => setTimeout(resolve, 2000));

  log.success('테스트 서버가 시작되었습니다.');
  return true;
}

// 단위 테스트 실행
function runUnitTests() {
  log.section('단위 테스트 실행');
  return runCommand('npm run test:unit');
}

// 통합 테스트 실행
function runIntegrationTests() {
  log.section('통합 테스트 실행');
  return runCommand('npm run test:integration');
}

// E2E 테스트 실행
function runE2ETests() {
  log.section('E2E 테스트 실행');

  // Playwright 브라우저 설치 확인
  const playwrightPath = join(rootDir, 'node_modules', '.cache', 'ms-playwright');
  if (!existsSync(playwrightPath)) {
    log.warn('Playwright 브라우저가 설치되지 않았습니다.');
    log.info('브라우저 설치 중...');
    if (!runCommand('npm run playwright:install')) {
      return false;
    }
  }

  return runCommand('npm run test:e2e');
}

// 커버리지 리포트 생성
function generateCoverageReport() {
  log.section('커버리지 리포트 생성');

  if (runCommand('npm run test:coverage')) {
    log.success('커버리지 리포트가 생성되었습니다.');
    log.info('리포트 보기: npm run serve:coverage');
    return true;
  }

  return false;
}

// 메인 실행 함수
async function main() {
  console.log(`
${colors.cyan}╔══════════════════════════════════════╗
║     doha.kr 테스트 실행 스크립트     ║
╚══════════════════════════════════════╝${colors.reset}
`);

  // 1. 의존성 확인
  if (!checkDependencies()) {
    log.error('의존성 확인 실패. 프로그램을 종료합니다.');
    process.exit(1);
  }

  // 2. 린트 실행
  log.section('코드 품질 검사');
  runCommand('npm run lint');

  // 3. 테스트 서버 시작
  await startTestServer();

  // 4. 테스트 실행
  const results = {
    unit: runUnitTests(),
    integration: runIntegrationTests(),
    e2e: runE2ETests(),
    coverage: generateCoverageReport(),
  };

  // 5. 결과 요약
  log.section('테스트 결과 요약');

  const passed = Object.values(results).filter((r) => r).length;
  const total = Object.keys(results).length;

  console.log(`
테스트 유형        | 결과
------------------|-------
단위 테스트       | ${results.unit ? '✅ 성공' : '❌ 실패'}
통합 테스트       | ${results.integration ? '✅ 성공' : '❌ 실패'}
E2E 테스트        | ${results.e2e ? '✅ 성공' : '❌ 실패'}
커버리지 리포트   | ${results.coverage ? '✅ 생성됨' : '❌ 실패'}

전체: ${passed}/${total} 성공
`);

  if (passed === total) {
    log.success('모든 테스트가 성공적으로 완료되었습니다! 🎉');
  } else {
    log.error('일부 테스트가 실패했습니다. 로그를 확인해주세요.');
    process.exit(1);
  }
}

// 스크립트 실행
main().catch((error) => {
  log.error(`예상치 못한 오류: ${error.message}`);
  process.exit(1);
});
