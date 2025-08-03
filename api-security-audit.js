/**
 * API 보안 검증 및 취약점 스캔 스크립트
 * 코드 정적 분석 및 보안 설정 검증
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class APISecurityAuditor {
  constructor() {
    this.findings = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: [],
    };
    this.checkedFiles = [];
  }

  /**
   * API 파일들 검사
   */
  async auditAPIFiles() {
    console.log('🔒 API 보안 검증 시작\n');

    const apiFiles = [
      'api/fortune.js',
      'api/manseryeok.js',
      'api/validation.js',
      'api/cors-config.js',
      'api/logging-middleware.js',
      'api/cache-manager.js',
      'vercel.json',
    ];

    for (const file of apiFiles) {
      await this.auditFile(file);
    }
  }

  /**
   * 개별 파일 검사
   */
  async auditFile(filePath) {
    const fullPath = path.join(__dirname, filePath);

    if (!fs.existsSync(fullPath)) {
      this.addFinding('medium', `Missing file: ${filePath}`, 'File not found');
      return;
    }

    console.log(`📁 Auditing: ${filePath}`);

    const content = fs.readFileSync(fullPath, 'utf8');
    this.checkedFiles.push(filePath);

    // 파일별 검사
    if (filePath.endsWith('.js')) {
      this.auditJavaScriptFile(filePath, content);
    } else if (filePath.endsWith('.json')) {
      this.auditConfigurationFile(filePath, content);
    }
  }

  /**
   * JavaScript 파일 보안 검사
   */
  auditJavaScriptFile(filePath, content) {
    // 1. Input Validation 검사
    this.checkInputValidation(filePath, content);

    // 2. SQL Injection 취약점 검사
    this.checkSQLInjection(filePath, content);

    // 3. XSS 취약점 검사
    this.checkXSS(filePath, content);

    // 4. 인증/인가 검사
    this.checkAuthentication(filePath, content);

    // 5. 민감한 정보 노출 검사
    this.checkSensitiveDataExposure(filePath, content);

    // 6. 에러 처리 검사
    this.checkErrorHandling(filePath, content);

    // 7. Rate Limiting 검사
    this.checkRateLimiting(filePath, content);

    // 8. CORS 설정 검사
    this.checkCORSConfiguration(filePath, content);
  }

  /**
   * 설정 파일 보안 검사
   */
  auditConfigurationFile(filePath, content) {
    try {
      const config = JSON.parse(content);

      if (filePath.includes('vercel.json')) {
        this.checkVercelSecurity(config);
      }
    } catch (error) {
      this.addFinding('medium', `Invalid JSON in ${filePath}`, error.message);
    }
  }

  /**
   * Input Validation 검사
   */
  checkInputValidation(filePath, content) {
    // 사용자 입력 검증 패턴 확인
    const patterns = [
      /req\.body(?!\s*&&|\s*\?)/g, // 직접적인 req.body 사용
      /req\.query(?!\s*&&|\s*\?)/g, // 직접적인 req.query 사용
      /req\.params(?!\s*&&|\s*\?)/g, // 직접적인 req.params 사용
    ];

    patterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        // validation.js 파일은 예외
        if (!filePath.includes('validation.js') && !content.includes('validateFortuneRequest')) {
          this.addFinding(
            'high',
            `Unvalidated user input in ${filePath}`,
            `Found ${matches.length} direct usage of user input without validation`
          );
        }
      }
    });

    // 입력 검증 함수 존재 확인
    if (filePath.includes('fortune.js') || filePath.includes('manseryeok.js')) {
      if (!content.includes('validateFortuneRequest') && !content.includes('validateRequest')) {
        this.addFinding(
          'critical',
          `Missing input validation in ${filePath}`,
          'API endpoints should validate all user inputs'
        );
      }
    }

    // SQL Injection 패턴 검사
    const sqlPatterns = [
      /\$\{[^}]*req\./g, // Template literals with req
      /`[^`]*\$\{[^}]*req\./g, // Template strings with user input
      /query.*\+.*req\./g, // String concatenation in queries
    ];

    sqlPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        this.addFinding(
          'critical',
          `Potential SQL injection in ${filePath}`,
          `Found ${matches.length} instances of dangerous query construction`
        );
      }
    });
  }

  /**
   * SQL Injection 검사
   */
  checkSQLInjection(filePath, content) {
    // 데이터베이스 쿼리 패턴 확인
    const dbPatterns = [/SELECT.*\+/gi, /INSERT.*\+/gi, /UPDATE.*\+/gi, /DELETE.*\+/gi];

    dbPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        this.addFinding(
          'critical',
          `SQL injection vulnerability in ${filePath}`,
          'Use parameterized queries instead of string concatenation'
        );
      }
    });
  }

  /**
   * XSS 취약점 검사
   */
  checkXSS(filePath, content) {
    // innerHTML, outerHTML 등 DOM 조작 패턴
    const xssPatterns = [/innerHTML\s*=/gi, /outerHTML\s*=/gi, /document\.write/gi, /eval\s*\(/gi];

    xssPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        this.addFinding(
          'high',
          `XSS vulnerability in ${filePath}`,
          'Direct DOM manipulation can lead to XSS attacks'
        );
      }
    });

    // 응답에 사용자 입력이 그대로 반영되는지 확인
    if (content.includes('res.json') && content.includes('req.body')) {
      if (!content.includes('sanitizeInput') && !content.includes('DOMPurify')) {
        this.addFinding(
          'medium',
          `Potential XSS in response in ${filePath}`,
          'User input in response should be sanitized'
        );
      }
    }
  }

  /**
   * 인증/인가 검사
   */
  checkAuthentication(filePath, content) {
    // API 키 검증 확인
    if (filePath.includes('fortune.js')) {
      if (!content.includes('GEMINI_API_KEY')) {
        this.addFinding(
          'medium',
          `Missing API key validation in ${filePath}`,
          'External API calls should validate API keys'
        );
      }
    }

    // 레이트 리미팅 확인
    if (
      content.includes('api/') &&
      !content.includes('checkRateLimit') &&
      !filePath.includes('validation.js')
    ) {
      this.addFinding(
        'medium',
        `Missing rate limiting in ${filePath}`,
        'API endpoints should implement rate limiting'
      );
    }
  }

  /**
   * 민감한 정보 노출 검사
   */
  checkSensitiveDataExposure(filePath, content) {
    // 하드코딩된 시크릿 패턴
    const secretPatterns = [
      /['"]\w*(?:password|secret|key|token|api_key)\w*['"]:\s*['"][^'"]+['"]/gi,
      /['"]\w*(?:sk-|pk_|ghp_|glpat-)/gi, // API key patterns
      /mongodb:\/\/[^'"]+/gi, // MongoDB connection strings
      /postgres:\/\/[^'"]+/gi, // PostgreSQL connection strings
    ];

    secretPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        this.addFinding(
          'critical',
          `Hardcoded secrets in ${filePath}`,
          'Use environment variables for sensitive data'
        );
      }
    });

    // 에러 메시지에서 민감한 정보 노출
    if (content.includes('error.stack') && content.includes('res.json')) {
      if (!content.includes('NODE_ENV') || !content.includes('development')) {
        this.addFinding(
          'medium',
          `Stack trace exposure in ${filePath}`,
          'Stack traces should only be shown in development environment'
        );
      }
    }
  }

  /**
   * 에러 처리 검사
   */
  checkErrorHandling(filePath, content) {
    // try-catch 블록 확인
    const asyncFunctions = content.match(/async\s+(?:function|\w+\s*=>)/g) || [];
    const tryBlocks = content.match(/try\s*\{/g) || [];

    if (asyncFunctions.length > tryBlocks.length) {
      this.addFinding(
        'medium',
        `Insufficient error handling in ${filePath}`,
        `Found ${asyncFunctions.length} async functions but only ${tryBlocks.length} try blocks`
      );
    }

    // 빈 catch 블록 확인
    if (
      content.includes('catch()') ||
      content.includes('catch(e){}') ||
      content.includes('catch(error){}')
    ) {
      this.addFinding(
        'low',
        `Empty catch blocks in ${filePath}`,
        'Catch blocks should handle errors appropriately'
      );
    }
  }

  /**
   * Rate Limiting 검사
   */
  checkRateLimiting(filePath, content) {
    if (filePath.includes('validation.js')) {
      // 레이트 리미팅 구현 검사
      if (content.includes('checkRateLimit')) {
        // 적절한 제한값 확인
        const limitMatch = content.match(/maxRequests\s*=\s*(\d+)/);
        if (limitMatch) {
          const limit = parseInt(limitMatch[1]);
          if (limit > 100) {
            this.addFinding(
              'medium',
              `High rate limit in ${filePath}`,
              `Rate limit of ${limit} requests may be too high`
            );
          }
        }

        // 시간 윈도우 확인
        const windowMatch = content.match(/windowMs\s*=\s*(\d+)/);
        if (windowMatch) {
          const window = parseInt(windowMatch[1]);
          if (window < 60000) {
            // 1분 미만
            this.addFinding(
              'medium',
              `Short rate limit window in ${filePath}`,
              `Rate limit window of ${window}ms may be too short`
            );
          }
        }
      }
    }
  }

  /**
   * CORS 설정 검사
   */
  checkCORSConfiguration(filePath, content) {
    if (filePath.includes('cors-config.js')) {
      // 와일드카드 Origin 확인
      if (content.includes("'*'") || content.includes('"*"')) {
        this.addFinding(
          'high',
          `Wildcard CORS origin in ${filePath}`,
          'Wildcard origins should be avoided in production'
        );
      }

      // localhost 설정 확인
      if (content.includes('localhost') && !content.includes('development')) {
        this.addFinding(
          'low',
          `Localhost in CORS config ${filePath}`,
          'Ensure localhost is only allowed in development'
        );
      }
    }
  }

  /**
   * Vercel 설정 보안 검사
   */
  checkVercelSecurity(config) {
    // 보안 헤더 확인
    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Content-Security-Policy',
    ];

    const headers = config.headers || [];
    const foundHeaders = new Set();

    headers.forEach((headerConfig) => {
      if (headerConfig.headers) {
        headerConfig.headers.forEach((header) => {
          foundHeaders.add(header.key);
        });
      }
    });

    requiredHeaders.forEach((requiredHeader) => {
      if (!foundHeaders.has(requiredHeader)) {
        this.addFinding(
          'medium',
          `Missing security header: ${requiredHeader}`,
          'All security headers should be configured'
        );
      }
    });

    // CSP 검사
    const cspHeader = Array.from(foundHeaders).find((h) => h === 'Content-Security-Policy');
    if (cspHeader) {
      const cspConfig = headers.find(
        (h) => h.headers && h.headers.find((header) => header.key === 'Content-Security-Policy')
      );

      if (cspConfig) {
        const cspValue = cspConfig.headers.find((h) => h.key === 'Content-Security-Policy').value;

        // unsafe-inline, unsafe-eval 검사
        if (cspValue.includes("'unsafe-inline'") || cspValue.includes("'unsafe-eval'")) {
          this.addFinding(
            'medium',
            'Weak CSP configuration',
            'CSP should avoid unsafe-inline and unsafe-eval directives'
          );
        }
      }
    }

    // Function 설정 검사
    if (config.functions) {
      Object.entries(config.functions).forEach(([funcName, funcConfig]) => {
        // 메모리 설정 확인
        if (funcConfig.memory && funcConfig.memory > 1024) {
          this.addFinding(
            'info',
            `High memory allocation for ${funcName}`,
            'Consider if high memory allocation is necessary'
          );
        }

        // 타임아웃 설정 확인
        if (funcConfig.maxDuration && funcConfig.maxDuration > 30) {
          this.addFinding(
            'info',
            `Long timeout for ${funcName}`,
            'Long timeouts may impact user experience'
          );
        }
      });
    }
  }

  /**
   * 보안 이슈 추가
   */
  addFinding(severity, title, description) {
    this.findings[severity].push({
      title,
      description,
      severity,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 보안 점수 계산
   */
  calculateSecurityScore() {
    const weights = {
      critical: -20,
      high: -10,
      medium: -5,
      low: -2,
      info: -1,
    };

    let score = 100;

    Object.entries(this.findings).forEach(([severity, findings]) => {
      score += findings.length * weights[severity];
    });

    return Math.max(0, score);
  }

  /**
   * 검사 결과 출력
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🔒 API 보안 검증 결과');
    console.log('='.repeat(60));

    const totalFindings = Object.values(this.findings).reduce((sum, arr) => sum + arr.length, 0);
    const securityScore = this.calculateSecurityScore();

    console.log(`\n📊 요약:`);
    console.log(`   검사 파일: ${this.checkedFiles.length}개`);
    console.log(`   총 발견 사항: ${totalFindings}개`);
    console.log(`   보안 점수: ${securityScore}/100`);

    // 심각도별 결과
    Object.entries(this.findings).forEach(([severity, findings]) => {
      if (findings.length > 0) {
        const icon = {
          critical: '🚨',
          high: '⚠️',
          medium: '⚡',
          low: '💡',
          info: 'ℹ️',
        }[severity];

        console.log(`\n${icon} ${severity.toUpperCase()} (${findings.length}개):`);
        findings.forEach((finding, index) => {
          console.log(`   ${index + 1}. ${finding.title}`);
          console.log(`      ${finding.description}`);
        });
      }
    });

    // 전체 평가
    console.log('\n🏆 종합 평가:');
    const grade =
      securityScore >= 90
        ? '🥇 A (우수)'
        : securityScore >= 80
          ? '🥈 B (양호)'
          : securityScore >= 70
            ? '🥉 C (보통)'
            : securityScore >= 60
              ? '📊 D (개선 필요)'
              : '🚨 F (취약)';

    console.log(`   등급: ${grade}`);

    // 권장 사항
    this.printRecommendations();

    console.log('\n' + '='.repeat(60));
  }

  /**
   * 권장 사항 출력
   */
  printRecommendations() {
    console.log('\n📝 권장 사항:');

    const recommendations = [];

    if (this.findings.critical.length > 0) {
      recommendations.push('🚨 Critical 이슈를 즉시 해결하세요');
    }

    if (this.findings.high.length > 0) {
      recommendations.push('⚠️ High 우선순위 이슈를 우선 해결하세요');
    }

    // 구체적인 권장사항
    const specificRecommendations = [
      '🔐 모든 사용자 입력에 대해 검증과 sanitization 적용',
      '🚫 민감한 정보는 환경 변수로 관리',
      '⏱️ 모든 API 엔드포인트에 rate limiting 적용',
      '🛡️ 보안 헤더 강화 (CSP, HSTS 등)',
      '📝 에러 메시지에서 민감한 정보 노출 방지',
      '🔍 정기적인 보안 감사 수행',
    ];

    recommendations.push(...specificRecommendations);

    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }

  /**
   * 전체 검사 실행
   */
  async runAudit() {
    await this.auditAPIFiles();
    this.printResults();

    return {
      score: this.calculateSecurityScore(),
      findings: this.findings,
      checkedFiles: this.checkedFiles,
    };
  }
}

// 스크립트 실행
const auditor = new APISecurityAuditor();
auditor.runAudit().catch(console.error);

export default APISecurityAuditor;
