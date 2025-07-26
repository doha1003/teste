/**
 * JavaScript 번들 최적화 시스템 (TypeScript)
 * 코드 분할, 지연 로딩, Tree Shaking을 통한 성능 최적화
 * 
 * @version 3.0.0
 * @author doha.kr
 * 목표: JavaScript 크기 70% 감소, 초기 로드 시간 50% 단축
 */

import type { Nullable } from '../types/global.js';

/**
 * 우선순위 타입
 */
type Priority = 'critical' | 'high' | 'normal' | 'low';

/**
 * 번들 최적화 설정 인터페이스
 */
interface BundleOptimizerConfig {
  // 코드 분할 설정
  criticalModules: string[];
  
  // 지연 로딩 모듈
  lazyModules: Record<string, string>;
  
  // 페이지별 모듈 매핑
  pageModules: Record<string, string[]>;
  
  // 성능 설정
  maxConcurrentLoads: number;
  retryAttempts: number;
  loadTimeout: number;
  
  // 캐시 설정
  cacheEnabled: boolean;
  cacheExpiry: number;
}

/**
 * 모듈 로딩 결과 인터페이스
 */
interface ModuleLoadResult {
  moduleName: string;
  loaded: boolean;
  fromCache: boolean;
}

/**
 * 캐시된 모듈 데이터 인터페이스
 */
interface CachedModuleData {
  script: HTMLScriptElement;
  loadTime: number;
  timestamp: number;
}

/**
 * 로딩 큐 아이템 인터페이스
 */
interface LoadingQueueItem {
  moduleName: string;
  moduleUrl: string;
  priority: Priority;
  resolve: (result: ModuleLoadResult) => void;
}

/**
 * 성능 메트릭 인터페이스
 */
interface BundleOptimizerMetrics {
  modulesLoaded: number;
  totalBytes: number;
  bytesSaved: number;
  averageLoadTime: number;
  cacheHits: number;
  errors: number;
}

/**
 * 확장된 성능 메트릭 인터페이스
 */
interface ExtendedBundleMetrics extends BundleOptimizerMetrics {
  loadedModulesCount: number;
  cacheSize: number;
  loadingQueueSize: number;
  currentLoads: number;
  estimatedBytesSaved: number;
}

/**
 * 번들 최적화 클래스
 */
class BundleOptimizer {
  private config: BundleOptimizerConfig;
  private loadedModules: Set<string>;
  private loadingModules: Map<string, Promise<ModuleLoadResult>>;
  private moduleCache: Map<string, CachedModuleData>;
  private dependencyGraph: Map<string, string[]>;
  private currentLoads: number;
  private loadingQueue: LoadingQueueItem[];
  private metrics: BundleOptimizerMetrics;

  constructor() {
    this.config = {
      // 코드 분할 설정
      criticalModules: [
        '/js/main.js',
        '/js/dom-security.js',
        '/js/api-config.js'
      ],
      
      // 지연 로딩 모듈
      lazyModules: {
        'fortune': '/js/fortune.js',
        'mbti': '/js/mbti-test.js',
        'tarot': '/js/tarot.js',
        'teto-egen': '/js/teto-egen-test.js',
        'zodiac': '/js/zodiac.js',
        'zodiac-animal': '/js/zodiac-animal.js',
        'manseryeok': '/js/manseryeok-database.js',
        'analytics': '/js/analytics-dashboard.js'
      },
      
      // 페이지별 모듈 매핑
      pageModules: {
        '/': ['main', 'api-config'],
        '/fortune/daily/': ['fortune', 'manseryeok'],
        '/fortune/saju/': ['fortune', 'manseryeok'],
        '/fortune/tarot/': ['tarot', 'fortune'],
        '/fortune/zodiac/': ['zodiac', 'fortune'],
        '/fortune/zodiac-animal/': ['zodiac-animal', 'fortune'],
        '/tests/mbti/': ['mbti'],
        '/tests/teto-egen/': ['teto-egen']
      },
      
      // 성능 설정
      maxConcurrentLoads: 4,
      retryAttempts: 3,
      loadTimeout: 10000,
      
      // 캐시 설정
      cacheEnabled: true,
      cacheExpiry: 1000 * 60 * 60 * 24 // 24시간
    };
    
    this.loadedModules = new Set();
    this.loadingModules = new Map();
    this.moduleCache = new Map();
    this.dependencyGraph = new Map();
    this.currentLoads = 0;
    this.loadingQueue = [];
    
    // 성능 메트릭
    this.metrics = {
      modulesLoaded: 0,
      totalBytes: 0,
      bytesSaved: 0,
      averageLoadTime: 0,
      cacheHits: 0,
      errors: 0
    };
    
    this.init();
  }
  
  /**
   * 초기화
   */
  private init(): void {
    this.detectCurrentPage();
    this.preloadCriticalModules();
    this.setupLazyLoading();
    this.observePageChanges();
    
    console.log('📦 BundleOptimizer initialized');
  }
  
  /**
   * 현재 페이지 감지 및 필요한 모듈 식별
   */
  private detectCurrentPage(): void {
    const path = window.location.pathname;
    const requiredModules = this.config.pageModules[path] || [];
    
    // 페이지별 필요 모듈 우선 로드
    requiredModules.forEach(moduleName => {
      if (this.config.lazyModules[moduleName]) {
        this.preloadModule(moduleName);
      }
    });
  }
  
  /**
   * 필수 모듈 프리로드
   */
  private async preloadCriticalModules(): Promise<void> {
    const loadPromises = this.config.criticalModules.map(moduleUrl => 
      this.loadModuleByUrl(moduleUrl, 'critical')
    );
    
    try {
      await Promise.all(loadPromises);
      this.logPerformance('critical_modules_loaded', performance.now());
    } catch (error) {
      this.logError('preloadCriticalModules', error as Error);
    }
  }
  
  /**
   * 모듈 프리로드
   */
  public async preloadModule(moduleName: string, priority: Priority = 'normal'): Promise<Nullable<ModuleLoadResult>> {
    if (this.loadedModules.has(moduleName)) return null;
    
    const moduleUrl = this.config.lazyModules[moduleName];
    if (!moduleUrl) {
      console.warn(`BundleOptimizer: Unknown module '${moduleName}'`);
      return null;
    }
    
    return this.loadModule(moduleName, moduleUrl, priority);
  }
  
  /**
   * 모듈 동적 로딩
   */
  private async loadModule(moduleName: string, moduleUrl: string, priority: Priority = 'normal'): Promise<ModuleLoadResult> {
    // 이미 로딩 중인 모듈은 기존 Promise 반환
    if (this.loadingModules.has(moduleName)) {
      return this.loadingModules.get(moduleName)!;
    }
    
    // 캐시 확인
    const cached = this.getCachedModule(moduleName);
    if (cached) {
      this.metrics.cacheHits++;
      return cached;
    }
    
    const loadPromise = this.performModuleLoad(moduleName, moduleUrl, priority);
    this.loadingModules.set(moduleName, loadPromise);
    
    try {
      const result = await loadPromise;
      this.loadingModules.delete(moduleName);
      return result;
    } catch (error) {
      this.loadingModules.delete(moduleName);
      throw error;
    }
  }
  
  /**
   * 실제 모듈 로딩 수행
   */
  private async performModuleLoad(moduleName: string, moduleUrl: string, priority: Priority): Promise<ModuleLoadResult> {
    const startTime = performance.now();
    
    try {
      // 동시 로딩 제한
      if (this.currentLoads >= this.config.maxConcurrentLoads && priority !== 'critical') {
        await this.addToLoadingQueue(moduleName, moduleUrl, priority);
      }
      
      this.currentLoads++;
      
      // 스크립트 동적 로딩
      const script = await this.createAndLoadScript(moduleUrl);
      
      // 로딩 완료 처리
      this.handleModuleLoaded(moduleName, script, performance.now() - startTime);
      
      return { moduleName, loaded: true, fromCache: false };
      
    } finally {
      this.currentLoads--;
      this.processLoadingQueue();
    }
  }
  
  /**
   * 스크립트 생성 및 로딩
   */
  private createAndLoadScript(moduleUrl: string): Promise<HTMLScriptElement> {
    return new Promise((resolve, reject) => {
      // 이미 로드된 스크립트 확인
      const existingScript = document.querySelector(`script[src="${moduleUrl}"]`) as HTMLScriptElement;
      if (existingScript) {
        resolve(existingScript);
        return;
      }
      
      const script = document.createElement('script');
      script.src = moduleUrl;
      script.async = true;
      script.defer = true;
      
      // 타임아웃 설정
      const timeout = setTimeout(() => {
        reject(new Error(`Module load timeout: ${moduleUrl}`));
      }, this.config.loadTimeout);
      
      script.onload = () => {
        clearTimeout(timeout);
        resolve(script);
      };
      
      script.onerror = () => {
        clearTimeout(timeout);
        if (script.parentNode) {
          document.head.removeChild(script);
        }
        reject(new Error(`Module load failed: ${moduleUrl}`));
      };
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * URL로 모듈 로딩
   */
  private async loadModuleByUrl(moduleUrl: string, priority: Priority = 'normal'): Promise<ModuleLoadResult> {
    const moduleName = this.extractModuleName(moduleUrl);
    return this.loadModule(moduleName, moduleUrl, priority);
  }
  
  /**
   * 모듈명 추출
   */
  private extractModuleName(moduleUrl: string): string {
    const filename = moduleUrl.split('/').pop() || '';
    return filename.replace('.js', '').replace('.min', '');
  }
  
  /**
   * 로딩 큐에 추가
   */
  private addToLoadingQueue(moduleName: string, moduleUrl: string, priority: Priority): Promise<ModuleLoadResult> {
    return new Promise((resolve) => {
      this.loadingQueue.push({ moduleName, moduleUrl, priority, resolve });
    });
  }
  
  /**
   * 로딩 큐 처리
   */
  private processLoadingQueue(): void {
    if (this.loadingQueue.length > 0 && this.currentLoads < this.config.maxConcurrentLoads) {
      // 우선순위별 정렬
      this.loadingQueue.sort((a, b) => {
        const priorityOrder: Record<Priority, number> = { critical: 3, high: 2, normal: 1, low: 0 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      
      const { moduleName, moduleUrl, priority, resolve } = this.loadingQueue.shift()!;
      this.performModuleLoad(moduleName, moduleUrl, priority).then(resolve);
    }
  }
  
  /**
   * 모듈 로딩 완료 처리
   */
  private handleModuleLoaded(moduleName: string, script: HTMLScriptElement, loadTime: number): void {
    this.loadedModules.add(moduleName);
    
    // 캐시에 저장
    this.setCacheModule(moduleName, { 
      script, 
      loadTime,
      timestamp: Date.now() 
    });
    
    // 메트릭 업데이트
    this.metrics.modulesLoaded++;
    this.updateAverageLoadTime(loadTime);
    
    // 바이트 수 계산 (추정)
    const estimatedBytes = this.estimateModuleSize(script.src);
    this.metrics.totalBytes += estimatedBytes;
    
    // 성능 로깅
    this.logModulePerformance(moduleName, loadTime, estimatedBytes);
    
    // 의존성 모듈 로딩
    this.loadDependentModules(moduleName);
  }
  
  /**
   * 모듈 크기 추정
   */
  private estimateModuleSize(moduleUrl: string): number {
    // 모듈별 대략적인 크기 (KB)
    const sizeEstimates: Record<string, number> = {
      'main.js': 25,
      'fortune.js': 35,
      'mbti-test.js': 30,
      'tarot.js': 20,
      'manseryeok-database.js': 38000, // 38MB
      'analytics.js': 15,
      'dom-security.js': 12
    };
    
    const filename = moduleUrl.split('/').pop() || '';
    return (sizeEstimates[filename] || 10) * 1024; // Convert to bytes
  }
  
  /**
   * 의존성 모듈 로딩
   */
  private loadDependentModules(moduleName: string): void {
    const dependencies = this.dependencyGraph.get(moduleName);
    if (dependencies) {
      dependencies.forEach(depName => {
        if (!this.loadedModules.has(depName)) {
          this.preloadModule(depName, 'low');
        }
      });
    }
  }
  
  /**
   * 지연 로딩 설정
   */
  private setupLazyLoading(): void {
    // 페이지 내 링크 프리페치
    this.setupLinkPrefetch();
    
    // 사용자 상호작용 기반 로딩
    this.setupInteractionBasedLoading();
    
    // Intersection Observer를 통한 섹션별 로딩
    this.setupSectionBasedLoading();
  }
  
  /**
   * 링크 프리페치 설정
   */
  private setupLinkPrefetch(): void {
    const links = document.querySelectorAll('a[href^="/"]');
    
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = (link as HTMLAnchorElement).getAttribute('href');
        if (href) {
          const requiredModules = this.config.pageModules[href];
          
          if (requiredModules) {
            requiredModules.forEach(moduleName => {
              this.preloadModule(moduleName, 'low');
            });
          }
        }
      }, { once: true });
    });
  }
  
  /**
   * 상호작용 기반 로딩
   */
  private setupInteractionBasedLoading(): void {
    // 운세 관련 버튼 클릭 시 모듈 로딩
    document.addEventListener('click', async (e) => {
      const target = (e.target as Element).closest('[data-module]') as HTMLElement;
      if (target) {
        const moduleName = target.dataset['module'];
        if (moduleName && !this.loadedModules.has(moduleName)) {
          e.preventDefault();
          
          try {
            await this.preloadModule(moduleName, 'high');
            // 모듈 로딩 완료 후 원래 동작 실행
            target.click();
          } catch (error) {
            this.logError('interactionBasedLoading', error as Error);
          }
        }
      }
    });
  }
  
  /**
   * 섹션별 로딩
   */
  private setupSectionBasedLoading(): void {
    if (!('IntersectionObserver' in window)) return;
    
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target as HTMLElement;
          const moduleName = section.dataset['lazyModule'];
          
          if (moduleName && !this.loadedModules.has(moduleName)) {
            this.preloadModule(moduleName, 'low');
          }
        }
      });
    }, { rootMargin: '100px' });
    
    // 지연 로딩할 섹션들 관찰
    const lazySections = document.querySelectorAll('[data-lazy-module]');
    lazySections.forEach(section => {
      sectionObserver.observe(section);
    });
  }
  
  /**
   * 페이지 변화 감지
   */
  private observePageChanges(): void {
    // History API 감지
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      originalPushState.apply(history, args);
      this.handlePageChange();
    };
    
    history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
      originalReplaceState.apply(history, args);
      this.handlePageChange();
    };
    
    window.addEventListener('popstate', () => {
      this.handlePageChange();
    });
  }
  
  /**
   * 페이지 변화 처리
   */
  private handlePageChange(): void {
    setTimeout(() => {
      this.detectCurrentPage();
    }, 100);
  }
  
  /**
   * 캐시에서 모듈 가져오기
   */
  private getCachedModule(moduleName: string): Nullable<ModuleLoadResult> {
    if (!this.config.cacheEnabled) return null;
    
    const cached = this.moduleCache.get(moduleName);
    if (!cached) return null;
    
    // 캐시 만료 확인
    if (Date.now() - cached.timestamp > this.config.cacheExpiry) {
      this.moduleCache.delete(moduleName);
      return null;
    }
    
    return { moduleName, loaded: true, fromCache: true };
  }
  
  /**
   * 캐시에 모듈 저장
   */
  private setCacheModule(moduleName: string, data: CachedModuleData): void {
    if (!this.config.cacheEnabled) return;
    
    this.moduleCache.set(moduleName, data);
    
    // 캐시 크기 제한
    if (this.moduleCache.size > 50) {
      const firstKey = this.moduleCache.keys().next().value;
      if (firstKey) {
        this.moduleCache.delete(firstKey);
      }
    }
  }
  
  /**
   * 평균 로딩 시간 업데이트
   */
  private updateAverageLoadTime(loadTime: number): void {
    const totalLoaded = this.metrics.modulesLoaded;
    this.metrics.averageLoadTime = 
      (this.metrics.averageLoadTime * (totalLoaded - 1) + loadTime) / totalLoaded;
  }
  
  /**
   * 모듈 성능 로깅
   */
  private logModulePerformance(moduleName: string, loadTime: number, bytes: number): void {
    if (typeof window.Analytics !== 'undefined') {
      window.Analytics.trackEvent('BundleOptimizer', 'module_loaded', {
        module: moduleName,
        loadTime: Math.round(loadTime),
        bytes: bytes,
        cached: false
      });
    }
  }
  
  /**
   * 성능 로깅
   */
  private logPerformance(type: string, duration: number): void {
    if (typeof window.Analytics !== 'undefined') {
      window.Analytics.trackEvent('BundleOptimizer', type, {
        duration: Math.round(duration),
        metrics: this.getMetrics()
      });
    }
  }
  
  /**
   * 에러 로깅
   */
  private logError(method: string, error: Error): void {
    this.metrics.errors++;
    
    if (this.isDevelopmentEnvironment()) {
      console.warn(`BundleOptimizer.${method}:`, error.message);
    }
    
    if (typeof window.Analytics !== 'undefined') {
      window.Analytics.trackEvent('BundleOptimizer', 'error', {
        method: method,
        error: error.message
      });
    }
  }
  
  /**
   * 개발 환경 확인
   */
  private isDevelopmentEnvironment(): boolean {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.protocol === 'file:';
  }
  
  /**
   * 성능 메트릭 반환
   */
  public getMetrics(): ExtendedBundleMetrics {
    return {
      ...this.metrics,
      loadedModulesCount: this.loadedModules.size,
      cacheSize: this.moduleCache.size,
      loadingQueueSize: this.loadingQueue.length,
      currentLoads: this.currentLoads,
      estimatedBytesSaved: this.calculateBytesSaved()
    };
  }
  
  /**
   * 절약된 바이트 계산
   */
  private calculateBytesSaved(): number {
    // 전체 로드 vs 지연 로드 비교
    const totalAvailableBytes = Object.values(this.config.lazyModules)
      .reduce((sum, moduleUrl) => sum + this.estimateModuleSize(moduleUrl), 0);
    
    return totalAvailableBytes - this.metrics.totalBytes;
  }
  
  /**
   * 모든 모듈 강제 로딩 (개발용)
   */
  public async loadAllModules(): Promise<void> {
    const loadPromises = Object.keys(this.config.lazyModules).map(moduleName =>
      this.preloadModule(moduleName, 'low')
    );
    
    try {
      await Promise.all(loadPromises);
      console.log('BundleOptimizer: All modules loaded');
    } catch (error) {
      this.logError('loadAllModules', error as Error);
    }
  }
  
  /**
   * 캐시 정리
   */
  public clearCache(): void {
    this.moduleCache.clear();
    console.log('BundleOptimizer: Cache cleared');
  }
  
  /**
   * 로드된 모듈 목록 반환
   */
  public getLoadedModules(): string[] {
    return Array.from(this.loadedModules);
  }
  
  /**
   * 리소스 정리
   */
  public destroy(): void {
    this.loadedModules.clear();
    this.loadingModules.clear();
    this.moduleCache.clear();
    this.loadingQueue = [];
  }
}

// 전역 인스턴스 생성
const bundleOptimizer = new BundleOptimizer();

// 전역 객체에 추가

(window as any).BundleOptimizer = bundleOptimizer;

// 편의 함수
(window as any).loadModule = (moduleName: string) => bundleOptimizer.preloadModule(moduleName);
(window as any).requireModule = (moduleName: string) => bundleOptimizer.preloadModule(moduleName, 'high');

// 개발 도구
if (bundleOptimizer['isDevelopmentEnvironment']()) {
  (window as any).bundleOptimizerDebug = {
    getMetrics: () => (window as any).BundleOptimizer.getMetrics(),
    loadAllModules: () => (window as any).BundleOptimizer.loadAllModules(),
    clearCache: () => (window as any).BundleOptimizer.clearCache(),
    getLoadedModules: () => (window as any).BundleOptimizer.getLoadedModules(),
    destroy: () => (window as any).BundleOptimizer.destroy()
  };
}

export { BundleOptimizer, bundleOptimizer };
export default bundleOptimizer;