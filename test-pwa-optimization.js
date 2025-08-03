/**
 * PWA 최적화 테스트 스크립트
 * Service Worker, 캐시 전략, PWA 기능을 검증합니다.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PWAOptimizationTest {
  constructor() {
    this.results = {
      serviceWorker: {},
      manifest: {},
      cacheStrategy: {},
      offlineSupport: {},
      performance: {},
    };
  }

  /**
   * 전체 PWA 최적화 테스트 실행
   */
  async runAllTests() {
    console.log('🚀 PWA 최적화 테스트 시작...\n');

    try {
      await this.testServiceWorker();
      await this.testManifest();
      await this.testCacheStrategy();
      await this.testOfflineSupport();
      await this.testPerformanceOptimizations();

      this.generateReport();
    } catch (error) {
      console.error('❌ 테스트 실행 중 오류:', error.message);
    }
  }

  /**
   * Service Worker 파일 테스트
   */
  async testServiceWorker() {
    console.log('📱 Service Worker 테스트...');

    const swPath = path.join(__dirname, 'sw.js');

    try {
      if (!fs.existsSync(swPath)) {
        throw new Error('Service Worker 파일이 존재하지 않습니다');
      }

      const swContent = fs.readFileSync(swPath, 'utf8');

      // 기본 기능 체크
      const checks = {
        hasInstallEvent: swContent.includes("addEventListener('install'"),
        hasActivateEvent: swContent.includes("addEventListener('activate'"),
        hasFetchEvent: swContent.includes("addEventListener('fetch'"),
        hasVersionControl: swContent.includes('SW_VERSION'),
        hasCacheManagement: swContent.includes('cleanupOldCaches'),
        hasOfflineSupport: swContent.includes('/offline.html'),
        hasApiCaching: swContent.includes('API_CACHE'),
        hasErrorHandling: swContent.includes('catch('),
      };

      // 최적화 기능 체크
      const optimizations = {
        hasTimeoutFetch: swContent.includes('fetchWithTimeout'),
        hasCacheSizeManagement: swContent.includes('manageCacheSize'),
        hasBackgroundSync: swContent.includes("addEventListener('sync'"),
        hasSmartCaching: swContent.includes('determineStrategy'),
        hasPerformanceMetrics: swContent.includes('performanceMetrics'),
      };

      this.results.serviceWorker = {
        exists: true,
        size: (fs.statSync(swPath).size / 1024).toFixed(2) + ' KB',
        basicFeatures: checks,
        optimizations: optimizations,
        score: this.calculateScore([...Object.values(checks), ...Object.values(optimizations)]),
      };

      console.log(`   ✅ Service Worker 파일 크기: ${this.results.serviceWorker.size}`);
      console.log(`   ✅ 기본 기능: ${Object.values(checks).filter(Boolean).length}/8`);
      console.log(`   ✅ 최적화 기능: ${Object.values(optimizations).filter(Boolean).length}/5`);
    } catch (error) {
      this.results.serviceWorker = { exists: false, error: error.message, score: 0 };
      console.log(`   ❌ ${error.message}`);
    }
  }

  /**
   * Manifest 파일 테스트
   */
  async testManifest() {
    console.log('📋 PWA Manifest 테스트...');

    const manifestPath = path.join(__dirname, 'manifest.json');

    try {
      if (!fs.existsSync(manifestPath)) {
        throw new Error('Manifest 파일이 존재하지 않습니다');
      }

      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);

      // 필수 속성 체크
      const requiredFields = {
        hasName: !!manifest.name,
        hasShortName: !!manifest.short_name,
        hasStartUrl: !!manifest.start_url,
        hasDisplay: !!manifest.display,
        hasIcons: !!manifest.icons && manifest.icons.length > 0,
        hasThemeColor: !!manifest.theme_color,
        hasBackgroundColor: !!manifest.background_color,
      };

      // 고급 기능 체크
      const advancedFeatures = {
        hasScreenshots: !!manifest.screenshots && manifest.screenshots.length > 0,
        hasShortcuts: !!manifest.shortcuts && manifest.shortcuts.length > 0,
        hasCategories: !!manifest.categories && manifest.categories.length > 0,
        hasShareTarget: !!manifest.share_target,
        hasFileHandlers: !!manifest.file_handlers,
        hasMaskableIcons: manifest.icons?.some((icon) => icon.purpose?.includes('maskable')),
      };

      this.results.manifest = {
        exists: true,
        size: (fs.statSync(manifestPath).size / 1024).toFixed(2) + ' KB',
        requiredFields: requiredFields,
        advancedFeatures: advancedFeatures,
        iconCount: manifest.icons?.length || 0,
        score: this.calculateScore([
          ...Object.values(requiredFields),
          ...Object.values(advancedFeatures),
        ]),
      };

      console.log(`   ✅ Manifest 파일 크기: ${this.results.manifest.size}`);
      console.log(`   ✅ 필수 속성: ${Object.values(requiredFields).filter(Boolean).length}/7`);
      console.log(`   ✅ 고급 기능: ${Object.values(advancedFeatures).filter(Boolean).length}/6`);
      console.log(`   ✅ 아이콘 개수: ${this.results.manifest.iconCount}`);
    } catch (error) {
      this.results.manifest = { exists: false, error: error.message, score: 0 };
      console.log(`   ❌ ${error.message}`);
    }
  }

  /**
   * 캐시 전략 테스트
   */
  async testCacheStrategy() {
    console.log('💾 캐시 전략 테스트...');

    const swPath = path.join(__dirname, 'sw.js');

    try {
      const swContent = fs.readFileSync(swPath, 'utf8');

      // 캐시 전략 체크
      const strategies = {
        hasCacheFirst: swContent.includes('cacheFirst'),
        hasNetworkFirst: swContent.includes('networkFirst'),
        hasStaleWhileRevalidate: swContent.includes('staleWhileRevalidate'),
        hasApiCaching: swContent.includes('API_CACHE'),
        hasImageCaching: swContent.includes('IMAGE_CACHE'),
        hasStaticCaching: swContent.includes('STATIC_CACHE'),
      };

      // 최적화 체크
      const optimizations = {
        hasCacheSizeLimit: swContent.includes('maxEntries'),
        hasTimeoutHandling: swContent.includes('timeout'),
        hasCacheCleanup: swContent.includes('cleanupOldCaches'),
        hasVersioning: swContent.includes('CACHE_VERSION'),
        hasErrorFallback: swContent.includes('handleFetchError'),
      };

      this.results.cacheStrategy = {
        strategies: strategies,
        optimizations: optimizations,
        score: this.calculateScore([...Object.values(strategies), ...Object.values(optimizations)]),
      };

      console.log(`   ✅ 캐시 전략: ${Object.values(strategies).filter(Boolean).length}/6`);
      console.log(`   ✅ 캐시 최적화: ${Object.values(optimizations).filter(Boolean).length}/5`);
    } catch (error) {
      this.results.cacheStrategy = { error: error.message, score: 0 };
      console.log(`   ❌ ${error.message}`);
    }
  }

  /**
   * 오프라인 지원 테스트
   */
  async testOfflineSupport() {
    console.log('🔌 오프라인 지원 테스트...');

    try {
      // 오프라인 페이지 체크
      const offlinePath = path.join(__dirname, 'offline.html');
      const offlineJsPath = path.join(__dirname, 'js/pages/offline.js');

      const checks = {
        hasOfflinePage: fs.existsSync(offlinePath),
        hasOfflineJs: fs.existsSync(offlineJsPath),
        hasOfflineInSW: false,
        hasNetworkDetection: false,
        hasRetryMechanism: false,
      };

      // Service Worker에서 오프라인 지원 체크
      if (fs.existsSync(path.join(__dirname, 'sw.js'))) {
        const swContent = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');
        checks.hasOfflineInSW = swContent.includes('/offline.html');
      }

      // 오프라인 JavaScript 기능 체크
      if (checks.hasOfflineJs) {
        const offlineJsContent = fs.readFileSync(offlineJsPath, 'utf8');
        checks.hasNetworkDetection = offlineJsContent.includes('navigator.onLine');
        checks.hasRetryMechanism = offlineJsContent.includes('retryConnection');
      }

      this.results.offlineSupport = {
        checks: checks,
        score: this.calculateScore(Object.values(checks)),
      };

      console.log(`   ✅ 오프라인 기능: ${Object.values(checks).filter(Boolean).length}/5`);
    } catch (error) {
      this.results.offlineSupport = { error: error.message, score: 0 };
      console.log(`   ❌ ${error.message}`);
    }
  }

  /**
   * 성능 최적화 테스트
   */
  async testPerformanceOptimizations() {
    console.log('⚡ 성능 최적화 테스트...');

    try {
      const swPath = path.join(__dirname, 'sw.js');
      const appJsPath = path.join(__dirname, 'js/app.js');
      const pwaHelpersPath = path.join(__dirname, 'js/core/pwa-helpers.js');

      const optimizations = {
        hasServiceWorkerOptimization: false,
        hasPWAHelpers: fs.existsSync(pwaHelpersPath),
        hasInstallPrompt: false,
        hasUpdateNotifications: false,
        hasPerformanceTracking: false,
      };

      // Service Worker 최적화 체크
      if (fs.existsSync(swPath)) {
        const swContent = fs.readFileSync(swPath, 'utf8');
        optimizations.hasServiceWorkerOptimization =
          swContent.includes('performanceMetrics') && swContent.includes('manageCacheSize');
      }

      // PWA 헬퍼 기능 체크
      if (optimizations.hasPWAHelpers) {
        const helpersContent = fs.readFileSync(pwaHelpersPath, 'utf8');
        optimizations.hasInstallPrompt = helpersContent.includes('setupInstallPrompt');
        optimizations.hasUpdateNotifications = helpersContent.includes('showUpdateAvailable');
        optimizations.hasPerformanceTracking = helpersContent.includes('trackEvent');
      }

      // App.js PWA 초기화 체크
      if (fs.existsSync(appJsPath)) {
        const appContent = fs.readFileSync(appJsPath, 'utf8');
        optimizations.hasPWAInit = appContent.includes('initializePWA');
      }

      this.results.performance = {
        optimizations: optimizations,
        score: this.calculateScore(Object.values(optimizations)),
      };

      console.log(`   ✅ 성능 최적화: ${Object.values(optimizations).filter(Boolean).length}/5`);
    } catch (error) {
      this.results.performance = { error: error.message, score: 0 };
      console.log(`   ❌ ${error.message}`);
    }
  }

  /**
   * 점수 계산
   */
  calculateScore(checks) {
    const passed = checks.filter(Boolean).length;
    const total = checks.length;
    return Math.round((passed / total) * 100);
  }

  /**
   * 테스트 결과 보고서 생성
   */
  generateReport() {
    console.log('\n📊 PWA 최적화 테스트 결과 보고서');
    console.log('='.repeat(50));

    const overallScore = Math.round(
      (this.results.serviceWorker.score +
        this.results.manifest.score +
        this.results.cacheStrategy.score +
        this.results.offlineSupport.score +
        this.results.performance.score) /
        5
    );

    console.log(`\n🎯 전체 점수: ${overallScore}/100`);

    console.log('\n📱 세부 점수:');
    console.log(`   Service Worker: ${this.results.serviceWorker.score || 0}/100`);
    console.log(`   Manifest: ${this.results.manifest.score || 0}/100`);
    console.log(`   캐시 전략: ${this.results.cacheStrategy.score || 0}/100`);
    console.log(`   오프라인 지원: ${this.results.offlineSupport.score || 0}/100`);
    console.log(`   성능 최적화: ${this.results.performance.score || 0}/100`);

    // 등급 결정
    let grade = 'F';
    if (overallScore >= 90) grade = 'A+';
    else if (overallScore >= 80) grade = 'A';
    else if (overallScore >= 70) grade = 'B';
    else if (overallScore >= 60) grade = 'C';
    else if (overallScore >= 50) grade = 'D';

    console.log(`\n🏆 PWA 최적화 등급: ${grade}`);

    // 개선 제안
    this.generateRecommendations(overallScore);

    // 결과를 JSON 파일로 저장
    const reportPath = path.join(__dirname, 'pwa-optimization-report.json');
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          overallScore: overallScore,
          grade: grade,
          results: this.results,
        },
        null,
        2
      )
    );

    console.log(`\n📄 상세 보고서가 저장되었습니다: ${reportPath}`);
  }

  /**
   * 개선 제안 생성
   */
  generateRecommendations(score) {
    console.log('\n💡 개선 제안:');

    if (score >= 90) {
      console.log('   🎉 훌륭합니다! PWA 최적화가 잘 되어 있습니다.');
      console.log('   🔍 정기적인 성능 모니터링을 권장합니다.');
    } else {
      if (this.results.serviceWorker.score < 80) {
        console.log('   📱 Service Worker 최적화가 필요합니다.');
      }
      if (this.results.manifest.score < 80) {
        console.log('   📋 Manifest 파일 개선이 필요합니다.');
      }
      if (this.results.cacheStrategy.score < 80) {
        console.log('   💾 캐시 전략 최적화가 필요합니다.');
      }
      if (this.results.offlineSupport.score < 80) {
        console.log('   🔌 오프라인 지원 기능 향상이 필요합니다.');
      }
      if (this.results.performance.score < 80) {
        console.log('   ⚡ 성능 최적화 작업이 필요합니다.');
      }
    }
  }
}

// 테스트 실행
const tester = new PWAOptimizationTest();
tester.runAllTests().catch(console.error);
