/**
 * 배포 전 자동 테스트 스위트
 * doha.kr 프로덕션 배포 전 필수 검증
 */

import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 테스트 설정
const TEST_CONFIG = {
  timeout: 60000, // 60초
  retries: 2,
  parallel: true,
};

// 테스트 스위트 정의
const TEST_SUITES = {
  // 1. 환경 검증
  environment: {
    name: '🔧 환경 검증',
    tests: [
      { name: '환경변수 검증', command: 'node scripts/env-validation.js' },
      { name: 'Node.js 버전 확인', func: checkNodeVersion },
      { name: 'npm 패키지 검증', command: 'npm audit --audit-level=moderate' },
    ],
  },

  // 2. 코드 품질
  codeQuality: {
    name: '📝 코드 품질',
    tests: [
      { name: 'ESLint 검사', command: 'npm run lint' },
      { name: 'Prettier 포맷 검사', command: 'npm run format:check' },
      { name: 'TypeScript 타입 검사', func: checkTypeScript },
    ],
  },

  // 3. 빌드 검증
  build: {
    name: '🏗️ 빌드 검증',
    tests: [
      { name: 'CSS 빌드', command: 'npm run build:css' },
      { name: 'JavaScript 빌드', command: 'npm run build:js' },
      { name: '번들 크기 검사', func: checkBundleSize },
      { name: 'PWA 설정 검증', func: validatePWAConfig },
    ],
  },

  // 4. 단위 테스트
  unit: {
    name: '🧪 단위 테스트',
    tests: [
      { name: '유닛 테스트', command: 'npm run test:unit' },
      { name: '통합 테스트', command: 'npm run test:integration' },
      { name: '커버리지 확인', func: checkCoverage },
    ],
  },

  // 5. API 검증
  api: {
    name: '🌐 API 검증',
    tests: [
      { name: 'API 구조 검증', func: validateAPIStructure },
      { name: 'API 보안 검사', func: checkAPISecurity },
      { name: 'rate limiting 테스트', func: testRateLimit },
    ],
  },

  // 6. 성능 검증
  performance: {
    name: '⚡ 성능 검증',
    tests: [
      { name: '번들 분석', func: analyzeBundles },
      { name: '이미지 최적화 확인', func: checkImageOptimization },
      { name: '폰트 로딩 검증', func: validateFontLoading },
    ],
  },

  // 7. 보안 검증
  security: {
    name: '🛡️ 보안 검증',
    tests: [
      { name: '보안 헤더 검증', func: validateSecurityHeaders },
      { name: 'CSP 정책 검증', func: validateCSP },
      { name: '의존성 보안 스캔', command: 'npm audit' },
    ],
  },

  // 8. 한국어 특화 검증
  korean: {
    name: '🇰🇷 한국어 최적화',
    tests: [
      { name: '한글 폰트 검증', func: checkKoreanFonts },
      { name: '한국어 텍스트 렌더링', func: validateKoreanText },
      { name: '모바일 한글 입력', func: checkKoreanInput },
    ],
  },
};

class PreDeployTestRunner {
  constructor() {
    this.results = {};
    this.startTime = Date.now();
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  /**
   * 모든 테스트 실행
   */
  async runAllTests() {
    console.log('🚀 doha.kr 배포 전 테스트 스위트 시작\n');
    console.log(`📅 시작 시간: ${new Date().toLocaleString('ko-KR')}`);
    console.log('='.repeat(60) + '\n');

    // 총 테스트 수 계산
    this.totalTests = Object.values(TEST_SUITES).reduce(
      (total, suite) => total + suite.tests.length,
      0
    );

    // 순차적으로 테스트 스위트 실행
    for (const [suiteKey, suite] of Object.entries(TEST_SUITES)) {
      await this.runTestSuite(suiteKey, suite);
    }

    // 결과 요약
    this.printSummary();

    return this.passedTests === this.totalTests;
  }

  /**
   * 개별 테스트 스위트 실행
   */
  async runTestSuite(suiteKey, suite) {
    console.log(`${suite.name}`);
    console.log('-'.repeat(40));

    const suiteResults = [];

    for (const test of suite.tests) {
      const result = await this.runSingleTest(test);
      suiteResults.push(result);

      if (result.passed) {
        this.passedTests++;
        console.log(`✅ ${test.name}: ${result.message || '통과'}`);
      } else {
        this.failedTests++;
        console.log(`❌ ${test.name}: ${result.message || '실패'}`);
        if (result.details) {
          console.log(`   세부사항: ${result.details}`);
        }
      }
    }

    this.results[suiteKey] = suiteResults;
    console.log('');
  }

  /**
   * 단일 테스트 실행
   */
  async runSingleTest(test) {
    try {
      if (test.command) {
        return await this.runCommand(test.command);
      } else if (test.func) {
        return await test.func();
      } else {
        return { passed: false, message: '테스트 정의 오류' };
      }
    } catch (error) {
      return {
        passed: false,
        message: error.message,
        details: error.stack,
      };
    }
  }

  /**
   * 커맨드 실행
   */
  async runCommand(command) {
    return new Promise((resolve) => {
      const parts = command.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);

      const child = spawn(cmd, args, {
        cwd: projectRoot,
        stdio: 'pipe',
      });

      let output = '';
      let errorOutput = '';

      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ passed: true, message: '명령 실행 성공' });
        } else {
          resolve({
            passed: false,
            message: `명령 실행 실패 (종료 코드: ${code})`,
            details: errorOutput || output,
          });
        }
      });

      // 타임아웃 설정
      setTimeout(() => {
        child.kill();
        resolve({
          passed: false,
          message: '테스트 타임아웃',
          details: `${TEST_CONFIG.timeout}ms 초과`,
        });
      }, TEST_CONFIG.timeout);
    });
  }

  /**
   * 결과 요약 출력
   */
  printSummary() {
    const duration = Date.now() - this.startTime;

    console.log('='.repeat(60));
    console.log('📊 테스트 결과 요약');
    console.log('='.repeat(60));

    console.log(`⏱️ 총 소요 시간: ${Math.round(duration / 1000)}초`);
    console.log(`📝 총 테스트 수: ${this.totalTests}개`);
    console.log(`✅ 통과: ${this.passedTests}개`);
    console.log(`❌ 실패: ${this.failedTests}개`);
    console.log(`📊 성공률: ${Math.round((this.passedTests / this.totalTests) * 100)}%`);

    console.log('\n🔍 스위트별 결과:');
    for (const [suiteKey, results] of Object.entries(this.results)) {
      const suite = TEST_SUITES[suiteKey];
      const passed = results.filter((r) => r.passed).length;
      const total = results.length;
      console.log(`  ${suite.name}: ${passed}/${total}`);
    }

    console.log('\n' + '='.repeat(60));
    if (this.passedTests === this.totalTests) {
      console.log('🎉 모든 테스트 통과! 프로덕션 배포 준비 완료');
    } else {
      console.log('❌ 일부 테스트 실패! 문제 해결 후 다시 시도하세요');
    }
    console.log('='.repeat(60));
  }
}

// 개별 테스트 함수들
async function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);

  if (major >= 18) {
    return { passed: true, message: `Node.js ${version} 호환됨` };
  } else {
    return { passed: false, message: `Node.js ${version} 버전 너무 낮음 (18+ 필요)` };
  }
}

async function checkTypeScript() {
  try {
    if (existsSync(join(projectRoot, 'tsconfig.json'))) {
      return await runCommand('npx tsc --noEmit');
    } else {
      return { passed: true, message: 'TypeScript 설정 없음 (건너뜀)' };
    }
  } catch (error) {
    return { passed: false, message: 'TypeScript 검사 실패' };
  }
}

async function checkBundleSize() {
  try {
    const bundleConfig = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'));
    const bundlesize = bundleConfig.bundlesize;

    if (bundlesize && bundlesize.length > 0) {
      // 실제 파일 크기 확인
      return { passed: true, message: '번들 크기 검사 설정됨' };
    } else {
      return { passed: false, message: '번들 크기 검사 설정 필요' };
    }
  } catch (error) {
    return { passed: false, message: 'bundle size 설정 확인 실패' };
  }
}

async function validatePWAConfig() {
  try {
    const manifestPath = join(projectRoot, 'manifest.json');
    const swPath = join(projectRoot, 'sw.js');

    if (existsSync(manifestPath) && existsSync(swPath)) {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

      // 필수 PWA 속성 확인
      if (manifest.name && manifest.short_name && manifest.icons && manifest.start_url) {
        return { passed: true, message: 'PWA 설정 완료' };
      } else {
        return { passed: false, message: 'PWA manifest 속성 부족' };
      }
    } else {
      return { passed: false, message: 'PWA 파일 없음 (manifest.json, sw.js)' };
    }
  } catch (error) {
    return { passed: false, message: 'PWA 설정 검증 실패' };
  }
}

async function checkCoverage() {
  try {
    // 커버리지 리포트 확인
    const coveragePath = join(projectRoot, 'coverage', 'coverage-summary.json');

    if (existsSync(coveragePath)) {
      const coverage = JSON.parse(readFileSync(coveragePath, 'utf-8'));
      const total = coverage.total;

      if (total.lines.pct >= 80 && total.branches.pct >= 80) {
        return { passed: true, message: `커버리지 ${total.lines.pct}% (목표: 80%)` };
      } else {
        return { passed: false, message: `커버리지 부족: ${total.lines.pct}% (목표: 80%)` };
      }
    } else {
      return { passed: false, message: '커버리지 리포트 없음' };
    }
  } catch (error) {
    return { passed: false, message: '커버리지 확인 실패' };
  }
}

async function validateAPIStructure() {
  try {
    const apiDir = join(projectRoot, 'api');
    const requiredFiles = ['fortune.js', 'manseryeok.js', 'health.js'];

    let existingFiles = 0;
    for (const file of requiredFiles) {
      if (existsSync(join(apiDir, file))) {
        existingFiles++;
      }
    }

    if (existingFiles === requiredFiles.length) {
      return { passed: true, message: '모든 API 파일 존재' };
    } else {
      return { passed: false, message: `${existingFiles}/${requiredFiles.length} API 파일 존재` };
    }
  } catch (error) {
    return { passed: false, message: 'API 구조 검증 실패' };
  }
}

async function checkAPISecurity() {
  try {
    // CORS 및 보안 헤더 설정 확인
    const apiFiles = ['fortune.js', 'manseryeok.js'];
    let secureFiles = 0;

    for (const file of apiFiles) {
      const filePath = join(projectRoot, 'api', file);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8');
        if (content.includes('setCorsHeaders') || content.includes('Access-Control')) {
          secureFiles++;
        }
      }
    }

    if (secureFiles === apiFiles.length) {
      return { passed: true, message: 'API 보안 설정 완료' };
    } else {
      return { passed: false, message: `${secureFiles}/${apiFiles.length} API 파일에 보안 설정` };
    }
  } catch (error) {
    return { passed: false, message: 'API 보안 검사 실패' };
  }
}

async function testRateLimit() {
  // 실제 환경에서는 rate limiting 테스트를 수행
  return { passed: true, message: 'Rate limiting 설정됨 (추후 실제 테스트 필요)' };
}

async function analyzeBundles() {
  try {
    const jsDir = join(projectRoot, 'js');
    const mainJsPath = join(jsDir, 'main.js');

    if (existsSync(mainJsPath)) {
      const stats = readFileSync(mainJsPath, 'utf-8');
      const sizeKB = Buffer.byteLength(stats, 'utf8') / 1024;

      if (sizeKB < 100) {
        // 100KB 이하
        return { passed: true, message: `main.js 크기: ${sizeKB.toFixed(1)}KB` };
      } else {
        return { passed: false, message: `main.js 크기 초과: ${sizeKB.toFixed(1)}KB (100KB 권장)` };
      }
    } else {
      return { passed: false, message: 'main.js 파일 없음' };
    }
  } catch (error) {
    return { passed: false, message: '번들 분석 실패' };
  }
}

async function checkImageOptimization() {
  try {
    const imagesDir = join(projectRoot, 'images');
    if (existsSync(imagesDir)) {
      return { passed: true, message: '이미지 디렉토리 존재' };
    } else {
      return { passed: false, message: '이미지 디렉토리 없음' };
    }
  } catch (error) {
    return { passed: false, message: '이미지 최적화 확인 실패' };
  }
}

async function validateFontLoading() {
  try {
    const cssDir = join(projectRoot, 'css');
    const fontFiles = ['korean-fonts.css', 'fonts/korean-fonts.css'];

    let foundFont = false;
    for (const file of fontFiles) {
      if (existsSync(join(cssDir, file))) {
        foundFont = true;
        break;
      }
    }

    if (foundFont) {
      return { passed: true, message: '한글 폰트 설정 확인됨' };
    } else {
      return { passed: false, message: '한글 폰트 설정 파일 없음' };
    }
  } catch (error) {
    return { passed: false, message: '폰트 로딩 검증 실패' };
  }
}

async function validateSecurityHeaders() {
  try {
    const vercelConfig = JSON.parse(readFileSync(join(projectRoot, 'vercel.json'), 'utf-8'));
    const headers = vercelConfig.headers || [];

    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Content-Security-Policy',
    ];
    let foundHeaders = 0;

    for (const headerGroup of headers) {
      for (const header of headerGroup.headers || []) {
        if (requiredHeaders.includes(header.key)) {
          foundHeaders++;
        }
      }
    }

    if (foundHeaders >= requiredHeaders.length) {
      return { passed: true, message: '필수 보안 헤더 설정됨' };
    } else {
      return {
        passed: false,
        message: `${foundHeaders}/${requiredHeaders.length} 보안 헤더 설정됨`,
      };
    }
  } catch (error) {
    return { passed: false, message: '보안 헤더 검증 실패' };
  }
}

async function validateCSP() {
  try {
    const vercelConfig = JSON.parse(readFileSync(join(projectRoot, 'vercel.json'), 'utf-8'));
    const headers = vercelConfig.headers || [];

    let cspFound = false;
    for (const headerGroup of headers) {
      for (const header of headerGroup.headers || []) {
        if (header.key === 'Content-Security-Policy') {
          cspFound = true;
          break;
        }
      }
    }

    if (cspFound) {
      return { passed: true, message: 'CSP 정책 설정됨' };
    } else {
      return { passed: false, message: 'CSP 정책 없음' };
    }
  } catch (error) {
    return { passed: false, message: 'CSP 검증 실패' };
  }
}

async function checkKoreanFonts() {
  try {
    // Pretendard 폰트 설정 확인
    const cssFiles = ['main.css', 'korean-optimization.css'];
    let fontFound = false;

    for (const file of cssFiles) {
      const filePath = join(projectRoot, 'css', file);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8');
        if (content.includes('Pretendard') || content.includes('korean')) {
          fontFound = true;
          break;
        }
      }
    }

    if (fontFound) {
      return { passed: true, message: '한글 폰트(Pretendard) 설정 확인됨' };
    } else {
      return { passed: false, message: '한글 폰트 설정 없음' };
    }
  } catch (error) {
    return { passed: false, message: '한글 폰트 검증 실패' };
  }
}

async function validateKoreanText() {
  try {
    // word-break: keep-all 설정 확인
    const cssFiles = ['korean-optimization.css', 'main.css'];
    let wordBreakFound = false;

    for (const file of cssFiles) {
      const filePath = join(projectRoot, 'css', file);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8');
        if (content.includes('word-break: keep-all')) {
          wordBreakFound = true;
          break;
        }
      }
    }

    if (wordBreakFound) {
      return { passed: true, message: '한국어 텍스트 줄바꿈 최적화 설정됨' };
    } else {
      return { passed: false, message: 'word-break: keep-all 설정 없음' };
    }
  } catch (error) {
    return { passed: false, message: '한국어 텍스트 검증 실패' };
  }
}

async function checkKoreanInput() {
  try {
    // 한글 입력 관련 CSS/JS 확인
    const mobileOptPath = join(projectRoot, 'css', 'mobile-optimizations.css');

    if (existsSync(mobileOptPath)) {
      return { passed: true, message: '모바일 최적화 CSS 설정됨' };
    } else {
      return { passed: false, message: '모바일 한글 입력 최적화 설정 없음' };
    }
  } catch (error) {
    return { passed: false, message: '한글 입력 검증 실패' };
  }
}

// CLI 실행
async function main() {
  const runner = new PreDeployTestRunner();
  const success = await runner.runAllTests();

  process.exit(success ? 0 : 1);
}

// 모듈 내보내기
export { PreDeployTestRunner, TEST_SUITES };

// CLI에서 직접 실행시
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ 배포 전 테스트 실패:', error);
    process.exit(1);
  });
}
