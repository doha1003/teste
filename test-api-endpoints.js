#!/usr/bin/env node

/**
 * API 엔드포인트 테스트 스크립트
 * 로컬에서 API 연결 상태 및 응답 시간을 확인합니다.
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

// 색상 코드
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.cyan}📋 ${msg}${colors.reset}`),
};

// 테스트할 API 엔드포인트
const endpoints = [
  {
    name: 'Health Check',
    method: 'GET',
    url: '/api/health',
    timeout: 5000,
  },
  {
    name: 'Manseryeok API',
    method: 'GET',
    url: '/api/manseryeok?year=2025&month=1&day=15',
    timeout: 8000,
  },
  {
    name: 'Fortune API (Daily)',
    method: 'POST',
    url: '/api/fortune',
    body: {
      type: 'daily',
      data: {
        name: '테스트',
        birthDate: '1990-01-01',
        gender: 'male',
      },
    },
    timeout: 15000,
  },
];

// HTTP 요청 함수
async function makeRequest(endpoint, baseUrl = 'http://localhost:3000') {
  const fullUrl = `${baseUrl}${endpoint.url}`;
  const startTime = Date.now();

  try {
    const requestOptions = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    if (endpoint.body) {
      requestOptions.body = JSON.stringify(endpoint.body);
    }

    // Dynamic import for node-fetch
    const { default: fetch } = await import('node-fetch');

    const response = await Promise.race([
      fetch(fullUrl, requestOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), endpoint.timeout)
      ),
    ]);

    const duration = Date.now() - startTime;
    const contentType = response.headers.get('content-type');

    let responseData;
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      duration,
      data: responseData,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      error: error.message,
      duration,
    };
  }
}

// 로컬 서버 시작 (Python HTTP Server)
async function startLocalServer() {
  log.info('로컬 HTTP 서버 시작 중... (포트 3000)');

  const server = spawn('python', ['-m', 'http.server', '3000'], {
    stdio: 'pipe',
    cwd: process.cwd(),
  });

  // 서버 시작 대기
  await setTimeout(2000);

  return server;
}

// 단일 엔드포인트 테스트
async function testEndpoint(endpoint) {
  log.info(`테스트 중: ${endpoint.name}`);

  const result = await makeRequest(endpoint);

  if (result.success) {
    log.success(`${endpoint.name} - ${result.status} (${result.duration}ms)`);

    // 응답 데이터 요약 출력
    if (result.data && typeof result.data === 'object') {
      if (result.data.success !== undefined) {
        console.log(`   응답: success=${result.data.success}`);
      }
      if (result.data.status) {
        console.log(`   상태: ${result.data.status}`);
      }
      if (result.data.error) {
        log.warning(`   오류: ${result.data.error}`);
      }
    }
  } else {
    log.error(`${endpoint.name} - FAILED`);
    if (result.error) {
      console.log(`   오류: ${result.error}`);
    }
    if (result.status) {
      console.log(`   HTTP 상태: ${result.status} ${result.statusText}`);
    }
    console.log(`   응답 시간: ${result.duration}ms`);
  }

  return result;
}

// 메인 테스트 실행
async function runTests() {
  log.header('doha.kr API 엔드포인트 테스트');

  let server;

  try {
    // 로컬 서버 시작
    server = await startLocalServer();

    const results = [];

    // 각 엔드포인트 테스트
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint);
      results.push({ endpoint: endpoint.name, ...result });

      // 테스트 간 잠시 대기
      await setTimeout(500);
    }

    // 결과 요약
    log.header('테스트 결과 요약');

    const successful = results.filter((r) => r.success).length;
    const total = results.length;

    console.log(`\n총 ${total}개 엔드포인트 중 ${successful}개 성공`);

    if (successful === total) {
      log.success('모든 API 엔드포인트가 정상 작동합니다!');
    } else {
      log.warning(`${total - successful}개의 엔드포인트에서 문제가 발생했습니다.`);
    }

    // 상세 결과
    console.log('\n상세 결과:');
    results.forEach((result) => {
      const status = result.success ? '✓' : '✗';
      const color = result.success ? colors.green : colors.red;
      console.log(`${color}${status} ${result.endpoint} - ${result.duration}ms${colors.reset}`);
    });
  } catch (error) {
    log.error(`테스트 실행 중 오류 발생: ${error.message}`);
  } finally {
    // 서버 종료
    if (server) {
      log.info('로컬 서버 종료 중...');
      server.kill();
    }
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests, testEndpoint, makeRequest };
