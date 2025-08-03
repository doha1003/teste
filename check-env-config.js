#!/usr/bin/env node

/**
 * 환경 변수 및 API 설정 검증 스크립트
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(level, message) {
  const prefix = {
    info: `${colors.blue}ℹ`,
    success: `${colors.green}✓`,
    warning: `${colors.yellow}⚠`,
    error: `${colors.red}✗`,
  };

  console.log(`${prefix[level]} ${message}${colors.reset}`);
}

console.log(`\n${colors.blue}🔍 doha.kr API 환경 설정 검증${colors.reset}\n`);

// 1. 환경 변수 확인
console.log('1. 환경 변수 확인:');
const envVars = ['NODE_ENV', 'GEMINI_API_KEY', 'VERCEL_ENV', 'VERCEL_URL'];

envVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    if (varName.includes('KEY') || varName.includes('SECRET')) {
      log('success', `${varName}: [CONFIGURED]`);
    } else {
      log('success', `${varName}: ${value}`);
    }
  } else {
    log('warning', `${varName}: 설정되지 않음`);
  }
});

// 2. 설정 파일 확인
console.log('\n2. 설정 파일 확인:');
const configFiles = ['vercel.json', 'package.json', 'data/manseryeok-compact.json'];

configFiles.forEach((file) => {
  const filePath = join(process.cwd(), file);
  if (existsSync(filePath)) {
    log('success', `${file}: 존재함`);

    // 파일 크기 체크
    try {
      const stats = readFileSync(filePath, 'utf8');
      if (file === 'data/manseryeok-compact.json') {
        const data = JSON.parse(stats);
        const years = Object.keys(data).length;
        log('info', `  - 만세력 데이터: ${years}년간 데이터 포함`);
      }
    } catch (error) {
      log('warning', `  - 파일 읽기 오류: ${error.message}`);
    }
  } else {
    log('error', `${file}: 존재하지 않음`);
  }
});

// 3. API 엔드포인트 파일 확인
console.log('\n3. API 엔드포인트 확인:');
const apiFiles = [
  'api/fortune.js',
  'api/manseryeok.js',
  'api/health.js',
  'api/cors-config.js',
  'api/validation.js',
  'api/logging-middleware.js',
];

apiFiles.forEach((file) => {
  const filePath = join(process.cwd(), file);
  if (existsSync(filePath)) {
    log('success', `${file}: 존재함`);

    // 기본 문법 검사
    try {
      const content = readFileSync(filePath, 'utf8');

      // ES6 모듈 검사
      if (content.includes('export default') || content.includes('import ')) {
        log('info', `  - ES6 모듈 형식 사용`);
      } else if (content.includes('module.exports') || content.includes('require(')) {
        log('warning', `  - CommonJS 형식 사용`);
      }

      // 타임아웃 설정 검사 (fortune.js)
      if (file === 'api/fortune.js') {
        const timeoutMatch = content.match(/timeoutMs\s*=\s*(\d+)/);
        if (timeoutMatch) {
          const timeout = parseInt(timeoutMatch[1]);
          log('info', `  - AI 타임아웃: ${timeout}ms`);
          if (timeout > 15000) {
            log('warning', `  - 타임아웃이 Vercel 제한(15초)을 초과함`);
          }
        }
      }
    } catch (error) {
      log('warning', `  - 파일 분석 오류: ${error.message}`);
    }
  } else {
    log('error', `${file}: 존재하지 않음`);
  }
});

// 4. Vercel 설정 분석
console.log('\n4. Vercel 설정 분석:');
try {
  const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));

  // Functions 설정 확인
  if (vercelConfig.functions) {
    Object.entries(vercelConfig.functions).forEach(([path, config]) => {
      log('info', `${path}:`);
      console.log(`     - maxDuration: ${config.maxDuration}s`);
      console.log(`     - memory: ${config.memory}MB`);
      console.log(`     - runtime: ${config.runtime}`);
    });
  }

  // Headers 설정 확인
  if (vercelConfig.headers) {
    log('success', `보안 헤더: ${vercelConfig.headers.length}개 규칙 설정됨`);
  }
} catch (error) {
  log('error', `Vercel 설정 분석 오류: ${error.message}`);
}

// 5. 권장사항
console.log(`\n${colors.blue}📋 권장사항:${colors.reset}`);
console.log('• API 타임아웃을 Vercel 제한(15초) 미만으로 설정');
console.log('• 모든 API 파일을 ES6 모듈 형식으로 통일');
console.log('• GEMINI_API_KEY 환경변수 설정 확인');
console.log('• 만세력 데이터 파일 무결성 검증');
console.log('• CORS 설정에서 허용 도메인 확인');

console.log(`\n${colors.green}✅ 환경 설정 검증 완료${colors.reset}\n`);
