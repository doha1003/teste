#!/usr/bin/env node
/**
 * API 부하 테스트 및 안정성 검증 스크립트
 * 동시 요청 100+, 응답 시간 측정, 레이트 리미팅 검증
 */

const { performance } = require('perf_hooks');

const BASE_URL = 'https://doha.kr';
// 로컬 테스트 시 사용: 'http://localhost:3000';

class APILoadTester {
  constructor() {
    this.results = {
      fortune: [],
      manseryeok: [],
      errors: [],
      rateLimitTests: [],
      summary: {},
    };
  }

  /**
   * Fortune API 부하 테스트
   */
  async testFortuneAPI(concurrentRequests = 100) {
    console.log(`\n🔥 Fortune API 부하 테스트 시작 (동시 ${concurrentRequests}개 요청)`);

    const testData = {
      type: 'daily',
      data: {
        name: '테스트',
        birthDate: '1990-01-01',
        gender: 'male',
        birthTime: '14:30',
      },
      todayDate: '2025-08-02',
    };

    const requests = Array.from({ length: concurrentRequests }, (_, i) =>
      this.makeSingleFortuneRequest(testData, i + 1)
    );

    const startTime = performance.now();
    const results = await Promise.allSettled(requests);
    const totalTime = performance.now() - startTime;

    // 결과 분석
    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success);
    const failed = results.filter((r) => r.status === 'rejected' || !r.value?.success);
    const rateLimited = results.filter(
      (r) => r.status === 'fulfilled' && r.value.statusCode === 429
    );

    console.log(`✅ Fortune API 테스트 완료:`);
    console.log(`   전체 요청: ${concurrentRequests}개`);
    console.log(`   성공: ${successful.length}개`);
    console.log(`   실패: ${failed.length}개`);
    console.log(`   레이트 리미트: ${rateLimited.length}개`);
    console.log(`   총 소요 시간: ${Math.round(totalTime)}ms`);
    console.log(`   평균 응답 시간: ${Math.round(totalTime / concurrentRequests)}ms`);

    // 응답 시간 분석
    const responseTimes = successful.map((r) => r.value.responseTime);
    if (responseTimes.length > 0) {
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);

      console.log(`   최소 응답 시간: ${Math.round(minTime)}ms`);
      console.log(`   최대 응답 시간: ${Math.round(maxTime)}ms`);
      console.log(`   평균 응답 시간: ${Math.round(avgTime)}ms`);

      this.results.fortune = {
        total: concurrentRequests,
        successful: successful.length,
        failed: failed.length,
        rateLimited: rateLimited.length,
        avgResponseTime: avgTime,
        maxResponseTime: maxTime,
        minResponseTime: minTime,
        totalTime,
      };
    }

    return {
      total: concurrentRequests,
      successful: successful.length,
      failed: failed.length,
      rateLimited: rateLimited.length,
    };
  }

  /**
   * 단일 Fortune API 요청
   */
  async makeSingleFortuneRequest(testData, requestId) {
    const startTime = performance.now();

    try {
      const response = await fetch(`${BASE_URL}/api/fortune`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `LoadTest-${requestId}`,
        },
        body: JSON.stringify(testData),
        timeout: 15000, // 15초 타임아웃
      });

      const responseTime = performance.now() - startTime;
      const data = await response.json();

      return {
        success: response.ok,
        statusCode: response.status,
        responseTime,
        requestId,
        data,
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      return {
        success: false,
        error: error.message,
        responseTime,
        requestId,
      };
    }
  }

  /**
   * Manseryeok API 부하 테스트
   */
  async testManseryeokAPI(concurrentRequests = 50) {
    console.log(`\n📅 Manseryeok API 부하 테스트 시작 (동시 ${concurrentRequests}개 요청)`);

    const testDates = [
      { year: 2025, month: 8, day: 2, hour: 14 },
      { year: 1990, month: 1, day: 1, hour: 12 },
      { year: 2000, month: 12, day: 31, hour: 23 },
      { year: 1985, month: 6, day: 15, hour: 9 },
      { year: 2010, month: 3, day: 20, hour: 18 },
    ];

    const requests = Array.from({ length: concurrentRequests }, (_, i) => {
      const testData = testDates[i % testDates.length];
      return this.makeSingleManseryeokRequest(testData, i + 1);
    });

    const startTime = performance.now();
    const results = await Promise.allSettled(requests);
    const totalTime = performance.now() - startTime;

    // 결과 분석
    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success);
    const failed = results.filter((r) => r.status === 'rejected' || !r.value?.success);

    console.log(`✅ Manseryeok API 테스트 완료:`);
    console.log(`   전체 요청: ${concurrentRequests}개`);
    console.log(`   성공: ${successful.length}개`);
    console.log(`   실패: ${failed.length}개`);
    console.log(`   총 소요 시간: ${Math.round(totalTime)}ms`);

    // 응답 시간 분석
    const responseTimes = successful.map((r) => r.value.responseTime);
    if (responseTimes.length > 0) {
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);

      console.log(`   최소 응답 시간: ${Math.round(minTime)}ms`);
      console.log(`   최대 응답 시간: ${Math.round(maxTime)}ms`);
      console.log(`   평균 응답 시간: ${Math.round(avgTime)}ms`);

      // 500ms 목표 달성 여부 확인
      const under500ms = responseTimes.filter((t) => t < 500).length;
      const over500ms = responseTimes.length - under500ms;

      console.log(
        `   500ms 미만: ${under500ms}개 (${Math.round((under500ms / responseTimes.length) * 100)}%)`
      );
      console.log(
        `   500ms 이상: ${over500ms}개 (${Math.round((over500ms / responseTimes.length) * 100)}%)`
      );

      this.results.manseryeok = {
        total: concurrentRequests,
        successful: successful.length,
        failed: failed.length,
        avgResponseTime: avgTime,
        maxResponseTime: maxTime,
        minResponseTime: minTime,
        under500ms,
        over500ms,
        totalTime,
      };
    }

    return {
      total: concurrentRequests,
      successful: successful.length,
      failed: failed.length,
      avgResponseTime:
        responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0,
    };
  }

  /**
   * 단일 Manseryeok API 요청
   */
  async makeSingleManseryeokRequest(testData, requestId) {
    const startTime = performance.now();

    try {
      const response = await fetch(`${BASE_URL}/api/manseryeok`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `LoadTest-${requestId}`,
        },
        body: JSON.stringify(testData),
        timeout: 8000, // 8초 타임아웃
      });

      const responseTime = performance.now() - startTime;
      const data = await response.json();

      return {
        success: response.ok,
        statusCode: response.status,
        responseTime,
        requestId,
        data,
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      return {
        success: false,
        error: error.message,
        responseTime,
        requestId,
      };
    }
  }

  /**
   * 레이트 리미팅 테스트
   */
  async testRateLimit() {
    console.log(`\n⏱️  레이트 리미팅 테스트 시작`);

    const testData = {
      type: 'zodiac',
      data: { zodiac: 'aries' },
    };

    // 빠른 연속 요청으로 레이트 리미트 유발
    const rapidRequests = Array.from({ length: 70 }, (_, i) =>
      this.makeSingleFortuneRequest(testData, `rate-${i + 1}`)
    );

    const results = await Promise.allSettled(rapidRequests);

    const rateLimited = results.filter(
      (r) => r.status === 'fulfilled' && r.value.statusCode === 429
    );
    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success);

    console.log(`✅ 레이트 리미팅 테스트 완료:`);
    console.log(`   전체 요청: ${rapidRequests.length}개`);
    console.log(`   성공: ${successful.length}개`);
    console.log(`   레이트 리미트 적용: ${rateLimited.length}개`);

    const rateLimitWorking = rateLimited.length > 0;
    console.log(`   레이트 리미팅 동작: ${rateLimitWorking ? '✅ 정상' : '❌ 비정상'}`);

    this.results.rateLimitTests = {
      total: rapidRequests.length,
      successful: successful.length,
      rateLimited: rateLimited.length,
      isWorking: rateLimitWorking,
    };

    return rateLimitWorking;
  }

  /**
   * 에러 시나리오 테스트
   */
  async testErrorHandling() {
    console.log(`\n❌ 에러 핸들링 테스트 시작`);

    const errorTests = [
      {
        name: '잘못된 타입',
        data: { type: 'invalid', data: {} },
      },
      {
        name: '필수 필드 누락',
        data: { data: {} },
      },
      {
        name: '잘못된 데이터 형식',
        data: { type: 'daily', data: 'invalid' },
      },
      {
        name: '빈 요청',
        data: {},
      },
    ];

    const results = [];

    for (const test of errorTests) {
      try {
        const response = await fetch(`${BASE_URL}/api/fortune`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(test.data),
          timeout: 5000,
        });

        const data = await response.json();

        results.push({
          test: test.name,
          statusCode: response.status,
          success: !response.ok, // 에러가 예상되므로 실패가 성공
          error: data.error || 'Unknown error',
        });

        console.log(`   ${test.name}: ${response.status} - ${data.error || 'OK'}`);
      } catch (error) {
        results.push({
          test: test.name,
          success: false,
          error: error.message,
        });
        console.log(`   ${test.name}: 네트워크 에러 - ${error.message}`);
      }
    }

    const properErrors = results.filter((r) => r.success).length;
    console.log(`✅ 에러 핸들링: ${properErrors}/${errorTests.length}개 적절히 처리됨`);

    this.results.errors = results;
    return results;
  }

  /**
   * 보안 헤더 검증
   */
  async testSecurityHeaders() {
    console.log(`\n🔒 보안 헤더 검증 시작`);

    try {
      const response = await fetch(`${BASE_URL}/api/fortune`, {
        method: 'OPTIONS',
      });

      const headers = response.headers;
      const securityHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security',
        'Content-Security-Policy',
        'Referrer-Policy',
      ];

      const results = {};

      console.log(`✅ 보안 헤더 검사 결과:`);
      securityHeaders.forEach((header) => {
        const value = headers.get(header);
        results[header] = !!value;
        console.log(
          `   ${header}: ${value ? '✅ 적용됨' : '❌ 누락'} ${value ? `(${value})` : ''}`
        );
      });

      const appliedHeaders = Object.values(results).filter(Boolean).length;
      console.log(`\n   총 ${appliedHeaders}/${securityHeaders.length}개 헤더 적용됨`);

      return results;
    } catch (error) {
      console.error(`❌ 보안 헤더 검사 실패: ${error.message}`);
      return null;
    }
  }

  /**
   * 전체 테스트 실행
   */
  async runAllTests() {
    console.log('🚀 API 안정성 및 보안 검증 시작\n');
    console.log('=' * 50);

    const startTime = performance.now();

    try {
      // 1. Fortune API 부하 테스트
      await this.testFortuneAPI(100);

      // 2. Manseryeok API 부하 테스트
      await this.testManseryeokAPI(50);

      // 3. 레이트 리미팅 테스트
      await this.testRateLimit();

      // 4. 에러 핸들링 테스트
      await this.testErrorHandling();

      // 5. 보안 헤더 검증
      await this.testSecurityHeaders();

      const totalTime = performance.now() - startTime;

      // 종합 결과 출력
      this.printSummary(totalTime);
    } catch (error) {
      console.error(`\n❌ 테스트 실행 중 오류 발생: ${error.message}`);
    }
  }

  /**
   * 테스트 결과 요약 출력
   */
  printSummary(totalTime) {
    console.log('\n' + '=' * 60);
    console.log('📊 API 안정성 검증 결과 요약');
    console.log('=' * 60);

    // Fortune API 결과
    if (this.results.fortune) {
      const { fortune } = this.results;
      console.log(`\n🔮 Fortune API:`);
      console.log(
        `   성공률: ${Math.round((fortune.successful / fortune.total) * 100)}% (${fortune.successful}/${fortune.total})`
      );
      console.log(`   평균 응답 시간: ${Math.round(fortune.avgResponseTime)}ms`);
      console.log(`   최대 응답 시간: ${Math.round(fortune.maxResponseTime)}ms`);

      const fortuneGrade =
        fortune.avgResponseTime < 1000 && fortune.successful / fortune.total > 0.9
          ? '✅ 우수'
          : fortune.avgResponseTime < 2000 && fortune.successful / fortune.total > 0.8
            ? '⚠️ 보통'
            : '❌ 개선 필요';
      console.log(`   평가: ${fortuneGrade}`);
    }

    // Manseryeok API 결과
    if (this.results.manseryeok) {
      const { manseryeok } = this.results;
      console.log(`\n📅 Manseryeok API:`);
      console.log(
        `   성공률: ${Math.round((manseryeok.successful / manseryeok.total) * 100)}% (${manseryeok.successful}/${manseryeok.total})`
      );
      console.log(`   평균 응답 시간: ${Math.round(manseryeok.avgResponseTime)}ms`);
      console.log(
        `   500ms 미만: ${Math.round((manseryeok.under500ms / manseryeok.successful) * 100)}%`
      );

      const manseryeokGrade =
        manseryeok.avgResponseTime < 500 && manseryeok.successful / manseryeok.total > 0.95
          ? '✅ 우수'
          : manseryeok.avgResponseTime < 1000 && manseryeok.successful / manseryeok.total > 0.9
            ? '⚠️ 보통'
            : '❌ 개선 필요';
      console.log(`   평가: ${manseryeokGrade}`);
    }

    // 레이트 리미팅 결과
    if (this.results.rateLimitTests) {
      const { rateLimitTests } = this.results;
      console.log(`\n⏱️  레이트 리미팅:`);
      console.log(`   동작 상태: ${rateLimitTests.isWorking ? '✅ 정상' : '❌ 비정상'}`);
      console.log(
        `   차단 비율: ${Math.round((rateLimitTests.rateLimited / rateLimitTests.total) * 100)}%`
      );
    }

    // 전체 평가
    console.log(`\n🏆 종합 평가:`);
    console.log(`   전체 테스트 시간: ${Math.round(totalTime / 1000)}초`);

    const overallScore = this.calculateOverallScore();
    console.log(`   종합 점수: ${overallScore}/100점`);

    const grade =
      overallScore >= 90
        ? '🥇 A'
        : overallScore >= 80
          ? '🥈 B'
          : overallScore >= 70
            ? '🥉 C'
            : '📉 D';
    console.log(`   등급: ${grade}`);

    console.log('\n' + '=' * 60);
  }

  /**
   * 종합 점수 계산
   */
  calculateOverallScore() {
    let score = 0;
    let maxScore = 0;

    // Fortune API 점수 (40점)
    if (this.results.fortune) {
      const { fortune } = this.results;
      const successRate = fortune.successful / fortune.total;
      const responseScore =
        fortune.avgResponseTime < 1000
          ? 20
          : fortune.avgResponseTime < 2000
            ? 15
            : fortune.avgResponseTime < 5000
              ? 10
              : 5;
      score += successRate * 20 + responseScore;
      maxScore += 40;
    }

    // Manseryeok API 점수 (30점)
    if (this.results.manseryeok) {
      const { manseryeok } = this.results;
      const successRate = manseryeok.successful / manseryeok.total;
      const responseScore =
        manseryeok.avgResponseTime < 500
          ? 15
          : manseryeok.avgResponseTime < 1000
            ? 10
            : manseryeok.avgResponseTime < 2000
              ? 5
              : 0;
      score += successRate * 15 + responseScore;
      maxScore += 30;
    }

    // 레이트 리미팅 점수 (20점)
    if (this.results.rateLimitTests) {
      score += this.results.rateLimitTests.isWorking ? 20 : 0;
      maxScore += 20;
    }

    // 에러 핸들링 점수 (10점)
    if (this.results.errors) {
      const errorHandlingScore =
        (this.results.errors.filter((e) => e.success).length / this.results.errors.length) * 10;
      score += errorHandlingScore;
      maxScore += 10;
    }

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }
}

// 테스트 실행
if (require.main === module) {
  const tester = new APILoadTester();
  tester.runAllTests().catch(console.error);
}

module.exports = APILoadTester;
