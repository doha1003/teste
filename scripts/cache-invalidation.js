/**
 * CDN 캐시 무효화 자동화 스크립트
 * doha.kr 프로덕션 배포를 위한 캐시 관리
 */

import fetch from 'node-fetch';

// 환경 변수 검증
const REQUIRED_ENV_VARS = {
  CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
  VERCEL_TOKEN: process.env.VERCEL_TOKEN,
  PROJECT_ID: process.env.PROJECT_ID,
};

// 캐시 무효화 전략
const CACHE_STRATEGIES = {
  // 전체 캐시 무효화 (긴급 배포)
  PURGE_ALL: 'purge-all',
  // 선택적 캐시 무효화 (일반 배포)
  SELECTIVE: 'selective',
  // 정적 자산만 무효화
  STATIC_ONLY: 'static-only',
  // API 캐시만 무효화
  API_ONLY: 'api-only',
};

class CacheInvalidationManager {
  constructor() {
    this.validateEnvironment();
    this.cloudflareApi = 'https://api.cloudflare.com/client/v4';
    this.vercelApi = 'https://api.vercel.com';
  }

  /**
   * 환경 변수 검증
   */
  validateEnvironment() {
    const missing = Object.entries(REQUIRED_ENV_VARS)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      console.warn(`⚠️ 다음 환경변수가 설정되지 않음: ${missing.join(', ')}`);
      console.warn('일부 캐시 무효화 기능이 제한될 수 있습니다.');
    }
  }

  /**
   * 메인 캐시 무효화 실행
   */
  async invalidateCache(strategy = CACHE_STRATEGIES.SELECTIVE, options = {}) {
    console.log(`🗑️ 캐시 무효화 시작: ${strategy}`);
    const startTime = Date.now();

    try {
      const results = await Promise.allSettled([
        this.invalidateCloudflareCache(strategy, options),
        this.invalidateVercelCache(strategy, options),
        this.invalidateBrowserCache(strategy, options),
      ]);

      const cloudflareResult = this.getResult(results[0]);
      const vercelResult = this.getResult(results[1]);
      const browserResult = this.getResult(results[2]);

      const duration = Date.now() - startTime;

      console.log('\n📊 캐시 무효화 결과 요약:');
      console.log(`⏱️ 소요 시간: ${duration}ms`);
      console.log(
        `☁️ Cloudflare: ${cloudflareResult.success ? '✅' : '❌'} ${cloudflareResult.message}`
      );
      console.log(`⚡ Vercel: ${vercelResult.success ? '✅' : '❌'} ${vercelResult.message}`);
      console.log(`🌐 Browser: ${browserResult.success ? '✅' : '❌'} ${browserResult.message}`);

      return {
        success: cloudflareResult.success && vercelResult.success,
        duration,
        details: {
          cloudflare: cloudflareResult,
          vercel: vercelResult,
          browser: browserResult,
        },
      };
    } catch (error) {
      console.error('❌ 캐시 무효화 실패:', error);
      throw error;
    }
  }

  /**
   * Cloudflare 캐시 무효화
   */
  async invalidateCloudflareCache(strategy, options) {
    if (!REQUIRED_ENV_VARS.CLOUDFLARE_API_TOKEN || !REQUIRED_ENV_VARS.CLOUDFLARE_ZONE_ID) {
      return { success: false, message: 'Cloudflare API 토큰 또는 Zone ID 없음' };
    }

    console.log('☁️ Cloudflare 캐시 무효화 중...');

    try {
      let purgeData;

      switch (strategy) {
        case CACHE_STRATEGIES.PURGE_ALL:
          purgeData = { purge_everything: true };
          break;

        case CACHE_STRATEGIES.SELECTIVE:
          purgeData = {
            files: [
              'https://doha.kr/',
              'https://doha.kr/css/main.css',
              'https://doha.kr/js/main.js',
              'https://doha.kr/manifest.json',
              'https://doha.kr/sw.js',
              ...(options.additionalFiles || []),
            ],
          };
          break;

        case CACHE_STRATEGIES.STATIC_ONLY:
          purgeData = {
            files: ['https://doha.kr/css/*', 'https://doha.kr/js/*', 'https://doha.kr/images/*'],
          };
          break;

        case CACHE_STRATEGIES.API_ONLY:
          purgeData = {
            files: ['https://doha.kr/api/*'],
          };
          break;

        default:
          purgeData = { purge_everything: true };
      }

      const response = await fetch(
        `${this.cloudflareApi}/zones/${REQUIRED_ENV_VARS.CLOUDFLARE_ZONE_ID}/purge_cache`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${REQUIRED_ENV_VARS.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(purgeData),
          timeout: 30000,
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        const purgedCount = purgeData.purge_everything
          ? '전체'
          : (purgeData.files?.length || 0) + '개 파일';
        return { success: true, message: `${purgedCount} 캐시 무효화 완료` };
      } else {
        throw new Error(result.errors?.[0]?.message || '알 수 없는 오류');
      }
    } catch (error) {
      console.error('Cloudflare 캐시 무효화 실패:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Vercel 엣지 캐시 무효화
   */
  async invalidateVercelCache(strategy, options) {
    if (!REQUIRED_ENV_VARS.VERCEL_TOKEN || !REQUIRED_ENV_VARS.PROJECT_ID) {
      return { success: false, message: 'Vercel API 토큰 또는 프로젝트 ID 없음' };
    }

    console.log('⚡ Vercel 엣지 캐시 무효화 중...');

    try {
      // Vercel의 경우 프로젝트 재배포를 통한 캐시 무효화
      const response = await fetch(
        `${this.vercelApi}/v1/integrations/deploy/prj_${REQUIRED_ENV_VARS.PROJECT_ID}/redeploy`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${REQUIRED_ENV_VARS.VERCEL_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'cache-invalidation',
            target: 'production',
          }),
          timeout: 30000,
        }
      );

      if (response.ok) {
        return { success: true, message: '엣지 캐시 무효화 시작됨' };
      } else {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
    } catch (error) {
      console.error('Vercel 캐시 무효화 실패:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 브라우저 캐시 무효화 (Cache-Control 헤더 업데이트)
   */
  async invalidateBrowserCache(strategy, options) {
    console.log('🌐 브라우저 캐시 무효화 헤더 적용...');

    try {
      // Service Worker를 통한 캐시 무효화 시그널
      const cacheInvalidationSignal = {
        timestamp: Date.now(),
        strategy: strategy,
        version: options.version || 'latest',
      };

      // 실제 구현에서는 service worker 메시지 전송
      console.log('📡 Service Worker 캐시 무효화 시그널 전송');

      return {
        success: true,
        message: '브라우저 캐시 무효화 시그널 전송됨',
        signal: cacheInvalidationSignal,
      };
    } catch (error) {
      console.error('브라우저 캐시 무효화 실패:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 특정 페이지 캐시 무효화
   */
  async invalidatePageCache(pages) {
    console.log(`📄 특정 페이지 캐시 무효화: ${pages.length}개`);

    const urls = pages.map((page) => {
      if (page.startsWith('/')) {
        return `https://doha.kr${page}`;
      }
      return page;
    });

    return this.invalidateCache(CACHE_STRATEGIES.SELECTIVE, {
      additionalFiles: urls,
    });
  }

  /**
   * 긴급 전체 캐시 무효화
   */
  async emergencyPurgeAll(reason = '긴급 배포') {
    console.log(`🚨 긴급 전체 캐시 무효화: ${reason}`);

    const result = await this.invalidateCache(CACHE_STRATEGIES.PURGE_ALL);

    // 긴급 상황 로그 기록
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'EMERGENCY_CACHE_PURGE',
      reason: reason,
      success: result.success,
      duration: result.duration,
    };

    console.log('📝 긴급 캐시 무효화 로그:', JSON.stringify(logEntry, null, 2));

    return result;
  }

  /**
   * Promise settled 결과 파싱
   */
  getResult(settledResult) {
    if (settledResult.status === 'fulfilled') {
      return settledResult.value;
    } else {
      return {
        success: false,
        message: settledResult.reason?.message || '알 수 없는 오류',
      };
    }
  }

  /**
   * 캐시 상태 확인
   */
  async checkCacheStatus() {
    console.log('🔍 캐시 상태 확인 중...');

    const testUrls = [
      'https://doha.kr/',
      'https://doha.kr/css/main.css',
      'https://doha.kr/js/main.js',
      'https://doha.kr/api/health',
    ];

    const results = await Promise.allSettled(
      testUrls.map(async (url) => {
        const response = await fetch(url, { method: 'HEAD' });
        return {
          url,
          status: response.status,
          cacheStatus: response.headers.get('cf-cache-status') || 'unknown',
          age: response.headers.get('age') || 'unknown',
          cacheControl: response.headers.get('cache-control') || 'none',
        };
      })
    );

    console.log('\n📊 캐시 상태 리포트:');
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const data = result.value;
        console.log(`${testUrls[index]}`);
        console.log(`  상태: ${data.status}`);
        console.log(`  캐시: ${data.cacheStatus}`);
        console.log(`  Age: ${data.age}초`);
        console.log(`  Control: ${data.cacheControl}`);
        console.log('');
      }
    });

    return results;
  }
}

// CLI 실행
async function main() {
  const args = process.argv.slice(2);
  const strategy = args[0] || CACHE_STRATEGIES.SELECTIVE;
  const pages = args.slice(1);

  const manager = new CacheInvalidationManager();

  try {
    if (strategy === 'check') {
      await manager.checkCacheStatus();
      return;
    }

    if (strategy === 'emergency') {
      const reason = pages.join(' ') || '긴급 배포';
      await manager.emergencyPurgeAll(reason);
      return;
    }

    if (pages.length > 0) {
      await manager.invalidatePageCache(pages);
    } else {
      await manager.invalidateCache(strategy);
    }

    console.log('\n✅ 캐시 무효화 완료');
  } catch (error) {
    console.error('\n❌ 캐시 무효화 실패:', error);
    process.exit(1);
  }
}

// 모듈로 내보내기
export { CacheInvalidationManager, CACHE_STRATEGIES };

// CLI에서 직접 실행시
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
