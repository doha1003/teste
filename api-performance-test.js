/**
 * API 성능 테스트 및 벤치마킹 도구
 * - 부하 테스트
 * - 응답 시간 측정
 * - 캐시 효율성 검증
 * - 동시 요청 처리 테스트
 */

import https from 'https';
import http from 'http';
import { performance } from 'perf_hooks';

class APIPerformanceTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = {
      fortune: { requests: [], errors: [], cacheHits: 0 },
      manseryeok: { requests: [], errors: [], cacheHits: 0 },
      health: { requests: [], errors: [] },
    };
    this.isRunning = false;
  }

  /**
   * HTTP 요청 실행
   */
  async makeRequest(endpoint, data = null, method = 'GET') {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseUrl);
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'API-Performance-Tester/1.0',
        },
        timeout: 15000, // 15초 타임아웃
      };

      const protocol = url.protocol === 'https:' ? https : http;
      const startTime = performance.now();

      const req = protocol.request(url, options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          const endTime = performance.now();
          const duration = endTime - startTime;

          try {
            const parsed = responseData ? JSON.parse(responseData) : {};
            resolve({
              statusCode: res.statusCode,
              duration,
              data: parsed,
              headers: res.headers,
              size: responseData.length,
              cached: parsed.cached || res.headers['x-cache-status'] === 'HIT',
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              duration,
              data: responseData,
              headers: res.headers,
              size: responseData.length,
              parseError: error.message,
            });
          }
        });
      });

      req.on('error', (error) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        reject({
          error: error.message,
          duration,
          code: error.code,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        const endTime = performance.now();
        const duration = endTime - startTime;
        reject({
          error: 'Request timeout',
          duration,
          code: 'TIMEOUT',
        });
      });

      if (data && method === 'POST') {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * Fortune API 테스트
   */
  async testFortuneAPI(concurrent = 10, total = 100) {
    console.log(`\n🔮 Fortune API 테스트 시작 (동시: ${concurrent}, 총: ${total})`);

    const testData = {
      type: 'daily',
      data: {
        name: '테스트',
        birthDate: '1990-01-01',
        gender: 'male',
        birthTime: '12:00',
      },
      todayDate: new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }),
    };

    const results = await this.runConcurrentTest(
      '/api/fortune-optimized',
      testData,
      'POST',
      concurrent,
      total
    );

    this.results.fortune = results;
    this.analyzeResults('Fortune API', results);

    return results;
  }

  /**
   * Manseryeok API 테스트
   */
  async testManseryeokAPI(concurrent = 10, total = 100) {
    console.log(`\n📅 Manseryeok API 테스트 시작 (동시: ${concurrent}, 총: ${total})`);

    const testDates = [
      { year: 2024, month: 1, day: 1, hour: 12 },
      { year: 2024, month: 6, day: 15, hour: 18 },
      { year: 2023, month: 12, day: 25, hour: 9 },
      { year: 2025, month: 3, day: 10, hour: 15 },
      { year: 2024, month: 8, day: 20, hour: 21 },
    ];

    const results = await this.runConcurrentTest(
      '/api/manseryeok-optimized',
      testDates,
      'POST',
      concurrent,
      total
    );

    this.results.manseryeok = results;
    this.analyzeResults('Manseryeok API', results);

    return results;
  }

  /**
   * Health API 테스트
   */
  async testHealthAPI(concurrent = 5, total = 50) {
    console.log(`\n🏥 Health API 테스트 시작 (동시: ${concurrent}, 총: ${total})`);

    const results = await this.runConcurrentTest(
      '/api/health?type=metrics',
      null,
      'GET',
      concurrent,
      total
    );

    this.results.health = results;
    this.analyzeResults('Health API', results);

    return results;
  }

  /**
   * 동시 요청 테스트 실행
   */
  async runConcurrentTest(endpoint, testData, method, concurrent, total) {
    const results = { requests: [], errors: [], cacheHits: 0 };
    const batches = Math.ceil(total / concurrent);

    for (let batch = 0; batch < batches; batch++) {
      const batchSize = Math.min(concurrent, total - batch * concurrent);
      const promises = [];

      for (let i = 0; i < batchSize; i++) {
        const requestData = Array.isArray(testData) ? testData[i % testData.length] : testData;

        promises.push(
          this.makeRequest(endpoint, requestData, method)
            .then((result) => {
              results.requests.push(result);
              if (result.cached) {
                results.cacheHits++;
              }
              return result;
            })
            .catch((error) => {
              results.errors.push(error);
              return error;
            })
        );
      }

      // 배치별로 실행하고 잠시 대기
      await Promise.all(promises);

      if (batch < batches - 1) {
        await this.sleep(100); // 100ms 대기
      }

      // 진행률 표시
      const progress = Math.min(100, (((batch + 1) * concurrent) / total) * 100);
      process.stdout.write(`\r진행률: ${progress.toFixed(1)}%`);
    }

    console.log('\n테스트 완료!');
    return results;
  }

  /**
   * 결과 분석
   */
  analyzeResults(apiName, results) {
    const { requests, errors, cacheHits } = results;
    const successfulRequests = requests.filter((r) => r.statusCode < 400);

    if (successfulRequests.length === 0) {
      console.log(`❌ ${apiName}: 성공한 요청이 없습니다.`);
      return;
    }

    const durations = successfulRequests.map((r) => r.duration);
    const sizes = successfulRequests.map((r) => r.size);

    const stats = {
      totalRequests: requests.length,
      successfulRequests: successfulRequests.length,
      errors: errors.length,
      successRate: ((successfulRequests.length / requests.length) * 100).toFixed(2),

      avgResponseTime: this.average(durations).toFixed(2),
      minResponseTime: Math.min(...durations).toFixed(2),
      maxResponseTime: Math.max(...durations).toFixed(2),
      p95ResponseTime: this.percentile(durations, 95).toFixed(2),
      p99ResponseTime: this.percentile(durations, 99).toFixed(2),

      avgResponseSize: Math.round(this.average(sizes)),
      totalDataTransferred: Math.round(sizes.reduce((a, b) => a + b, 0) / 1024), // KB

      cacheHitRate: requests.length > 0 ? ((cacheHits / requests.length) * 100).toFixed(2) : 0,

      throughput: (successfulRequests.length / (Math.max(...durations) / 1000)).toFixed(2),
    };

    console.log(`\n📊 ${apiName} 성능 분석 결과:`);
    console.log(
      `   요청 성공률: ${stats.successRate}% (${stats.successfulRequests}/${stats.totalRequests})`
    );
    console.log(`   평균 응답시간: ${stats.avgResponseTime}ms`);
    console.log(`   최소/최대: ${stats.minResponseTime}ms / ${stats.maxResponseTime}ms`);
    console.log(`   95%ile: ${stats.p95ResponseTime}ms, 99%ile: ${stats.p99ResponseTime}ms`);
    console.log(`   캐시 히트율: ${stats.cacheHitRate}%`);
    console.log(`   평균 응답크기: ${stats.avgResponseSize} bytes`);
    console.log(`   총 데이터 전송: ${stats.totalDataTransferred} KB`);
    console.log(`   처리량: ${stats.throughput} req/s`);

    if (errors.length > 0) {
      console.log(`   에러: ${errors.length}개`);
      const errorTypes = {};
      errors.forEach((e) => {
        errorTypes[e.code || e.error] = (errorTypes[e.code || e.error] || 0) + 1;
      });
      Object.entries(errorTypes).forEach(([type, count]) => {
        console.log(`     ${type}: ${count}개`);
      });
    }

    return stats;
  }

  /**
   * 전체 성능 테스트 실행
   */
  async runFullPerformanceTest() {
    console.log('🚀 API 성능 최적화 검증 테스트 시작');
    console.log('='.repeat(50));

    const testStartTime = performance.now();

    try {
      // 각 API 테스트 실행
      const fortuneResults = await this.testFortuneAPI(20, 200);
      const manseryeokResults = await this.testManseryeokAPI(30, 300);
      const healthResults = await this.testHealthAPI(10, 100);

      // 종합 분석
      const totalTestTime = performance.now() - testStartTime;
      this.generateSummaryReport(totalTestTime);

      return {
        fortune: fortuneResults,
        manseryeok: manseryeokResults,
        health: healthResults,
        totalTestTime,
      };
    } catch (error) {
      console.error('테스트 실행 중 오류:', error);
      throw error;
    }
  }

  /**
   * 종합 보고서 생성
   */
  generateSummaryReport(totalTestTime) {
    console.log('\n' + '='.repeat(50));
    console.log('📈 성능 최적화 검증 결과 종합');
    console.log('='.repeat(50));

    const allRequests = [
      ...this.results.fortune.requests,
      ...this.results.manseryeok.requests,
      ...this.results.health.requests,
    ];

    const allErrors = [
      ...this.results.fortune.errors,
      ...this.results.manseryeok.errors,
      ...this.results.health.errors,
    ];

    const successfulRequests = allRequests.filter((r) => r.statusCode < 400);
    const durations = successfulRequests.map((r) => r.duration);

    // 목표 달성 여부 확인
    const avgFortuneTime = this.average(this.results.fortune.requests.map((r) => r.duration));
    const avgManseryeokTime = this.average(this.results.manseryeok.requests.map((r) => r.duration));
    const overallCacheHitRate =
      ((this.results.fortune.cacheHits + this.results.manseryeok.cacheHits) /
        (this.results.fortune.requests.length + this.results.manseryeok.requests.length)) *
      100;

    console.log('🎯 최적화 목표 달성 현황:');
    console.log(
      `   Fortune API 응답시간: ${avgFortuneTime.toFixed(2)}ms ${avgFortuneTime <= 400 ? '✅' : '❌'} (목표: 400ms)`
    );
    console.log(
      `   Manseryeok API 응답시간: ${avgManseryeokTime.toFixed(2)}ms ${avgManseryeokTime <= 300 ? '✅' : '❌'} (목표: 300ms)`
    );
    console.log(
      `   캐시 히트율: ${overallCacheHitRate.toFixed(2)}% ${overallCacheHitRate >= 90 ? '✅' : '❌'} (목표: 90%)`
    );

    const overallThroughput = successfulRequests.length / (totalTestTime / 1000);
    console.log(
      `   처리량: ${overallThroughput.toFixed(2)} req/s ${overallThroughput >= 150 ? '✅' : '❌'} (목표: 150 req/s)`
    );

    const errorRate = (allErrors.length / allRequests.length) * 100;
    console.log(
      `   에러율: ${errorRate.toFixed(2)}% ${errorRate <= 1 ? '✅' : '❌'} (목표: 1% 이하)`
    );

    console.log('\n📊 전체 통계:');
    console.log(`   총 요청수: ${allRequests.length}`);
    console.log(`   성공 요청수: ${successfulRequests.length}`);
    console.log(`   전체 테스트 시간: ${(totalTestTime / 1000).toFixed(2)}초`);
    console.log(`   평균 응답시간: ${this.average(durations).toFixed(2)}ms`);
    console.log(`   95%ile 응답시간: ${this.percentile(durations, 95).toFixed(2)}ms`);

    // 최적화 권장사항
    console.log('\n💡 최적화 권장사항:');
    if (avgFortuneTime > 400) {
      console.log('   - Fortune API: 캐시 TTL 연장 또는 프롬프트 최적화 필요');
    }
    if (avgManseryeokTime > 300) {
      console.log('   - Manseryeok API: 데이터 사전 로딩 또는 인덱싱 개선 필요');
    }
    if (overallCacheHitRate < 90) {
      console.log('   - 캐시 전략 재검토: TTL 조정 또는 캐시 키 최적화 필요');
    }
    if (overallThroughput < 150) {
      console.log('   - 서버리스 함수 동시성 설정 확인 또는 병렬 처리 개선 필요');
    }
  }

  /**
   * 유틸리티 함수들
   */
  average(numbers) {
    return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
  }

  percentile(numbers, p) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 결과를 JSON 파일로 저장
   */
  saveResults(filename = 'api-performance-results.json') {
    const fs = require('fs');
    const results = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      results: this.results,
      summary: this.generateSummaryData(),
    };

    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`\n💾 결과가 ${filename}에 저장되었습니다.`);
  }

  generateSummaryData() {
    const allRequests = [
      ...this.results.fortune.requests,
      ...this.results.manseryeok.requests,
      ...this.results.health.requests,
    ];

    const successfulRequests = allRequests.filter((r) => r.statusCode < 400);
    const durations = successfulRequests.map((r) => r.duration);

    return {
      totalRequests: allRequests.length,
      successfulRequests: successfulRequests.length,
      avgResponseTime: this.average(durations),
      p95ResponseTime: this.percentile(durations, 95),
      p99ResponseTime: this.percentile(durations, 99),
      cacheHitRate:
        ((this.results.fortune.cacheHits + this.results.manseryeok.cacheHits) /
          (this.results.fortune.requests.length + this.results.manseryeok.requests.length)) *
        100,
    };
  }
}

// 스크립트 직접 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new APIPerformanceTester(process.argv[2] || 'http://localhost:3000');

  tester
    .runFullPerformanceTest()
    .then((results) => {
      tester.saveResults();
      console.log('\n✅ 성능 테스트가 완료되었습니다.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 성능 테스트 실패:', error);
      process.exit(1);
    });
}

export { APIPerformanceTester };
