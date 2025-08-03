/**
 * 프로덕션 환경변수 검증 및 보안 점검 스크립트
 * doha.kr 배포 전 필수 검증 도구
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 필수 환경변수 정의
const REQUIRED_ENV_VARS = {
  // Vercel 배포 관련
  VERCEL_TOKEN: {
    required: true,
    sensitive: true,
    description: 'Vercel API 토큰 (배포 자동화)',
    validation: (value) => value && value.startsWith('VERCEL_') && value.length > 20,
  },
  VERCEL_ORG_ID: {
    required: true,
    sensitive: false,
    description: 'Vercel 조직 ID',
    validation: (value) => value && value.match(/^[a-z0-9_]{8,}$/),
  },
  PROJECT_ID: {
    required: true,
    sensitive: false,
    description: 'Vercel 프로젝트 ID',
    validation: (value) => value && value.match(/^[a-z0-9_-]{8,}$/),
  },

  // API 관련
  GEMINI_API_KEY: {
    required: true,
    sensitive: true,
    description: 'Google Gemini API 키 (운세 서비스)',
    validation: (value) => value && value.startsWith('AIza') && value.length > 30,
  },

  // CDN 및 DNS 관련
  CLOUDFLARE_API_TOKEN: {
    required: false,
    sensitive: true,
    description: 'Cloudflare API 토큰 (캐시 무효화)',
    validation: (value) => !value || (value.length === 40 && value.match(/^[a-zA-Z0-9_-]+$/)),
  },
  CLOUDFLARE_ZONE_ID: {
    required: false,
    sensitive: false,
    description: 'Cloudflare Zone ID',
    validation: (value) => !value || (value.length === 32 && value.match(/^[a-f0-9]+$/)),
  },

  // 모니터링 관련
  ANALYTICS_ID: {
    required: false,
    sensitive: false,
    description: 'Google Analytics ID',
    validation: (value) => !value || value.match(/^G-[A-Z0-9]{10}$/),
  },
  SLACK_WEBHOOK: {
    required: false,
    sensitive: true,
    description: 'Slack 웹훅 URL (알림)',
    validation: (value) => !value || value.startsWith('https://hooks.slack.com/'),
  },
};

// 보안 설정 검증
const SECURITY_CHECKS = {
  // CSP 헤더 검증
  cspPolicy: {
    name: 'Content Security Policy',
    check: () => checkCSPConfiguration(),
  },

  // HTTPS 설정
  httpsEnforcement: {
    name: 'HTTPS 강제 적용',
    check: () => checkHTTPSConfiguration(),
  },

  // API 보안
  apiSecurity: {
    name: 'API 보안 설정',
    check: () => checkAPISecurityConfiguration(),
  },

  // 파일 권한
  filePermissions: {
    name: '중요 파일 권한',
    check: () => checkFilePermissions(),
  },
};

class EnvironmentValidator {
  constructor() {
    this.results = {
      envVars: {},
      security: {},
      overall: false,
    };
  }

  /**
   * 전체 검증 실행
   */
  async validate() {
    console.log('🔍 doha.kr 프로덕션 환경 검증 시작\n');

    // 환경변수 검증
    await this.validateEnvironmentVariables();

    // 보안 설정 검증
    await this.validateSecurityConfiguration();

    // 결과 요약
    this.printSummary();

    return this.results.overall;
  }

  /**
   * 환경변수 검증
   */
  async validateEnvironmentVariables() {
    console.log('📋 환경변수 검증');
    console.log('='.repeat(50));

    let passed = 0;
    let failed = 0;

    for (const [name, config] of Object.entries(REQUIRED_ENV_VARS)) {
      const value = process.env[name];
      const result = this.validateSingleEnvVar(name, value, config);

      this.results.envVars[name] = result;

      if (result.status === 'pass') {
        passed++;
        console.log(`✅ ${name}: ${result.message}`);
      } else if (result.status === 'warning') {
        console.log(`⚠️ ${name}: ${result.message}`);
      } else {
        failed++;
        console.log(`❌ ${name}: ${result.message}`);
      }
    }

    console.log(`\n📊 환경변수 검증 결과: ${passed}개 통과, ${failed}개 실패\n`);
    return failed === 0;
  }

  /**
   * 단일 환경변수 검증
   */
  validateSingleEnvVar(name, value, config) {
    // 필수 변수 누락 체크
    if (config.required && !value) {
      return {
        status: 'fail',
        message: `필수 환경변수 누락 - ${config.description}`,
      };
    }

    // 선택적 변수가 없는 경우
    if (!config.required && !value) {
      return {
        status: 'warning',
        message: `선택적 환경변수 없음 - ${config.description}`,
      };
    }

    // 값이 있는 경우 유효성 검증
    if (value) {
      if (config.validation && !config.validation(value)) {
        return {
          status: 'fail',
          message: `형식 오류 - ${config.description}`,
        };
      }

      // 민감한 정보는 마스킹하여 표시
      const displayValue = config.sensitive
        ? `${value.slice(0, 4)}${'*'.repeat(Math.max(0, value.length - 8))}${value.slice(-4)}`
        : value;

      return {
        status: 'pass',
        message: `설정됨 (${displayValue}) - ${config.description}`,
        value: config.sensitive ? '[MASKED]' : value,
      };
    }

    return {
      status: 'warning',
      message: '값 없음',
    };
  }

  /**
   * 보안 설정 검증
   */
  async validateSecurityConfiguration() {
    console.log('🛡️ 보안 설정 검증');
    console.log('='.repeat(50));

    for (const [key, check] of Object.entries(SECURITY_CHECKS)) {
      try {
        const result = await check.check();
        this.results.security[key] = result;

        if (result.status === 'pass') {
          console.log(`✅ ${check.name}: ${result.message}`);
        } else if (result.status === 'warning') {
          console.log(`⚠️ ${check.name}: ${result.message}`);
        } else {
          console.log(`❌ ${check.name}: ${result.message}`);
        }
      } catch (error) {
        console.log(`❌ ${check.name}: 검증 실패 - ${error.message}`);
        this.results.security[key] = {
          status: 'fail',
          message: `검증 오류: ${error.message}`,
        };
      }
    }

    console.log('');
  }

  /**
   * 결과 요약 출력
   */
  printSummary() {
    console.log('📊 검증 결과 요약');
    console.log('='.repeat(50));

    // 환경변수 결과
    const envResults = Object.values(this.results.envVars);
    const envPassed = envResults.filter((r) => r.status === 'pass').length;
    const envFailed = envResults.filter((r) => r.status === 'fail').length;
    const envWarnings = envResults.filter((r) => r.status === 'warning').length;

    console.log(`🔧 환경변수: ${envPassed}개 통과, ${envFailed}개 실패, ${envWarnings}개 경고`);

    // 보안 설정 결과
    const secResults = Object.values(this.results.security);
    const secPassed = secResults.filter((r) => r.status === 'pass').length;
    const secFailed = secResults.filter((r) => r.status === 'fail').length;
    const secWarnings = secResults.filter((r) => r.status === 'warning').length;

    console.log(`🛡️ 보안 설정: ${secPassed}개 통과, ${secFailed}개 실패, ${secWarnings}개 경고`);

    // 전체 결과
    const hasCriticalFailures = envFailed > 0 || secFailed > 0;
    this.results.overall = !hasCriticalFailures;

    console.log('\n' + '='.repeat(50));
    if (this.results.overall) {
      console.log('🎉 전체 검증 통과! 프로덕션 배포 준비 완료');
    } else {
      console.log('❌ 검증 실패! 문제 해결 후 다시 시도하세요');
    }
    console.log('='.repeat(50) + '\n');

    // 권장사항 출력
    this.printRecommendations();
  }

  /**
   * 개선 권장사항 출력
   */
  printRecommendations() {
    const recommendations = [];

    // 환경변수 권장사항
    if (!process.env.CLOUDFLARE_API_TOKEN) {
      recommendations.push('🚀 Cloudflare API 토큰 설정으로 캐시 자동 무효화 기능 활성화');
    }

    if (!process.env.SLACK_WEBHOOK) {
      recommendations.push('📢 Slack 웹훅 설정으로 배포 알림 자동화');
    }

    if (!process.env.ANALYTICS_ID) {
      recommendations.push('📊 Google Analytics 설정으로 사용자 분석 활성화');
    }

    // 보안 권장사항
    const securityIssues = Object.values(this.results.security).filter((r) => r.status !== 'pass');

    if (securityIssues.length > 0) {
      recommendations.push('🛡️ 보안 설정 강화 필요');
    }

    if (recommendations.length > 0) {
      console.log('💡 개선 권장사항:');
      recommendations.forEach((rec) => console.log(`   ${rec}`));
      console.log('');
    }
  }
}

// 보안 검증 함수들
async function checkCSPConfiguration() {
  try {
    const vercelConfig = JSON.parse(readFileSync(join(projectRoot, 'vercel.json'), 'utf-8'));
    const headers = vercelConfig.headers || [];

    const cspHeader = headers.find((h) =>
      h.headers?.some((header) => header.key === 'Content-Security-Policy')
    );

    if (cspHeader) {
      const csp = cspHeader.headers.find((h) => h.key === 'Content-Security-Policy').value;

      // CSP 정책 검증
      if (
        csp.includes("default-src 'self'") &&
        csp.includes("object-src 'none'") &&
        csp.includes('upgrade-insecure-requests')
      ) {
        return { status: 'pass', message: 'CSP 정책이 올바르게 설정됨' };
      } else {
        return { status: 'warning', message: 'CSP 정책 개선 필요' };
      }
    } else {
      return { status: 'fail', message: 'CSP 헤더가 설정되지 않음' };
    }
  } catch (error) {
    return { status: 'fail', message: 'vercel.json 파일 읽기 실패' };
  }
}

async function checkHTTPSConfiguration() {
  try {
    const vercelConfig = JSON.parse(readFileSync(join(projectRoot, 'vercel.json'), 'utf-8'));
    const headers = vercelConfig.headers || [];

    const hstsHeader = headers.find((h) =>
      h.headers?.some((header) => header.key === 'Strict-Transport-Security')
    );

    if (hstsHeader) {
      return { status: 'pass', message: 'HTTPS 강제 적용(HSTS) 설정됨' };
    } else {
      return { status: 'warning', message: 'HSTS 헤더 설정 권장' };
    }
  } catch (error) {
    return { status: 'fail', message: 'HTTPS 설정 확인 실패' };
  }
}

async function checkAPISecurityConfiguration() {
  try {
    // API 파일들의 보안 설정 확인
    const apiFiles = ['fortune.js', 'manseryeok.js', 'health.js'];
    let secureCount = 0;

    for (const file of apiFiles) {
      const filePath = join(projectRoot, 'api', file);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8');

        // 기본 보안 요소 확인
        if (content.includes('setCorsHeaders') || content.includes('Access-Control-Allow-Origin')) {
          secureCount++;
        }
      }
    }

    if (secureCount === apiFiles.length) {
      return { status: 'pass', message: '모든 API 엔드포인트에 보안 설정 적용됨' };
    } else if (secureCount > 0) {
      return {
        status: 'warning',
        message: `${secureCount}/${apiFiles.length} API 파일에 보안 설정 적용됨`,
      };
    } else {
      return { status: 'fail', message: 'API 보안 설정 필요' };
    }
  } catch (error) {
    return { status: 'fail', message: 'API 보안 설정 확인 실패' };
  }
}

async function checkFilePermissions() {
  try {
    // 중요 파일들 존재 여부 확인
    const criticalFiles = ['vercel.json', 'package.json', '_headers', 'sw.js', 'manifest.json'];

    let existingFiles = 0;

    for (const file of criticalFiles) {
      if (existsSync(join(projectRoot, file))) {
        existingFiles++;
      }
    }

    if (existingFiles === criticalFiles.length) {
      return { status: 'pass', message: '모든 중요 파일 존재 확인됨' };
    } else {
      return {
        status: 'warning',
        message: `${existingFiles}/${criticalFiles.length} 중요 파일 존재`,
      };
    }
  } catch (error) {
    return { status: 'fail', message: '파일 권한 확인 실패' };
  }
}

// CLI 실행
async function main() {
  const validator = new EnvironmentValidator();
  const isValid = await validator.validate();

  // 검증 결과에 따른 종료 코드
  process.exit(isValid ? 0 : 1);
}

// 모듈 내보내기
export { EnvironmentValidator, REQUIRED_ENV_VARS, SECURITY_CHECKS };

// CLI에서 직접 실행시
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ 환경변수 검증 실패:', error);
    process.exit(1);
  });
}
