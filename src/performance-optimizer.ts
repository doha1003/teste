/**
 * 성능 최적화 시스템 (TypeScript)
 * Lighthouse 100점 목표로 한 핵심 웹 바이탈 개선
 * 
 * @version 3.0.0
 * @author doha.kr
 */

import type { Nullable } from '../types/global.js';

/**
 * Core Web Vitals 메트릭 인터페이스
 */
interface CoreWebVitalsMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  history?: Record<string, MetricHistoryEntry[]>;
}

/**
 * 메트릭 히스토리 엔트리 인터페이스
 */
interface MetricHistoryEntry {
  value: number;
  timestamp: number;
}

/**
 * 성능 보고서 인터페이스
 */
interface PerformanceReport {
  metrics: CoreWebVitalsMetrics;
  optimizations: string[];
  score: number;
  recommendations: string[];
  timestamp: string;
}

/**
 * 내비게이션 성능 메트릭 인터페이스
 */
interface NavigationMetrics {
  dns: number;
  tcp: number;
  request: number;
  response: number;
  domProcessing: number;
  domComplete: number;
}

/**
 * 리소스 타입
 */
type ResourceType = 'analytics' | 'adsense' | 'kakao' | 'social-sharing';

/**
 * 성능 최적화 클래스
 */
class PerformanceOptimizer {
  private metrics: CoreWebVitalsMetrics;
  private optimizations: string[];
  private isOptimizing: boolean;

  constructor() {
    this.metrics = {};
    this.optimizations = [];
    this.isOptimizing = false;
    this.init();
  }

  /**
   * 초기화
   */
  private init(): void {
    this.setupPerformanceObserver();
    this.optimizeInitialLoad();
    this.setupLazyLoading();
    this.setupResourceHints();
    this.monitorCoreWebVitals();
    // Performance Optimizer initialized
  }

  /**
   * Core Web Vitals 모니터링
   */
  private monitorCoreWebVitals(): void {
    // LCP (Largest Contentful Paint) 측정
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        
        this.metrics.lcp = lastEntry.startTime;
        this.reportMetric('LCP', lastEntry.startTime);
        
        // LCP가 2.5초를 초과하면 최적화 실행
        if (lastEntry.startTime > 2500) {
          this.optimizeLCP();
        }
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // FID (First Input Delay) 측정
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEventTiming;
          const fid = fidEntry.processingStart - fidEntry.startTime;
          this.metrics.fid = fid;
          this.reportMetric('FID', fid);
          
          // FID가 100ms를 초과하면 최적화 실행
          if (fid > 100) {
            this.optimizeFID();
          }
        }
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
    }

    // CLS (Cumulative Layout Shift) 측정
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
        
        this.metrics.cls = clsValue;
        this.reportMetric('CLS', clsValue);
        
        // CLS가 0.1을 초과하면 최적화 실행
        if (clsValue > 0.1) {
          this.optimizeCLS();
        }
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  /**
   * Performance Observer 설정
   */
  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      // Resource timing 관찰
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.analyzeResourcePerformance(entry as PerformanceResourceTiming);
        }
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Navigation timing 관찰
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.analyzeNavigationPerformance(entry as PerformanceNavigationTiming);
        }
      });
      
      navigationObserver.observe({ entryTypes: ['navigation'] });
    }
  }

  /**
   * 초기 로드 최적화
   */
  private optimizeInitialLoad(): void {
    // 크리티컬 CSS 인라인화
    this.inlineCriticalCSS();
    
    // 프리로드 리소스 설정
    this.preloadCriticalResources();
    
    // 폰트 최적화
    this.optimizeFonts();
    
    // 이미지 최적화
    this.optimizeImages();
  }

  /**
   * 크리티컬 CSS 인라인화
   */
  private inlineCriticalCSS(): void {
    const criticalCSS = `
      /* Critical CSS for above-the-fold content */
      body { margin: 0; font-family: 'Noto Sans KR', sans-serif; }
      .header { background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .hero { min-height: 60vh; display: flex; align-items: center; }
      .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
      .btn-primary { background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
    
    this.optimizations.push('Critical CSS inlined');
  }

  /**
   * 중요 리소스 프리로드
   */
  private preloadCriticalResources(): void {
    const criticalResources = [
      { href: '/css/styles.css', as: 'style' as const },
      { href: '/js/main.js', as: 'script' as const },
      { href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap', as: 'style' as const }
    ];

    criticalResources.forEach(resource => {
      if (!document.querySelector(`link[href="${resource.href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        if (resource.as === 'style') {
          link.onload = function() {
            (this as HTMLLinkElement).onload = null;
            (this as HTMLLinkElement).rel = 'stylesheet';
          };
        }
        document.head.appendChild(link);
      }
    });

    this.optimizations.push('Critical resources preloaded');
  }

  /**
   * 폰트 최적화
   */
  private optimizeFonts(): void {
    // Google Fonts를 font-display: swap으로 최적화
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontLinks.forEach(link => {
      const linkElement = link as HTMLLinkElement;
      if (!linkElement.href.includes('display=swap')) {
        const url = new URL(linkElement.href);
        url.searchParams.set('display', 'swap');
        linkElement.href = url.toString();
      }
    });

    // 폰트 프리로드 - 이미 index.html에서 로드되므로 제거
    // Google Fonts는 동적으로 URL이 변경될 수 있으므로 직접 프리로드하지 않음

    this.optimizations.push('Fonts optimized with display: swap');
  }

  /**
   * 이미지 최적화
   */
  private optimizeImages(): void {
    // WebP 지원 확인 및 이미지 교체
    this.checkWebPSupport().then(supportsWebP => {
      if (supportsWebP) {
        this.replaceImagesWithWebP();
      }
    });

    // 이미지 지연 로딩 최적화
    this.optimizeLazyLoading();
    
    // 이미지 압축 및 리사이징
    this.optimizeImageSizes();
  }

  /**
   * WebP 지원 확인
   */
  private checkWebPSupport(): Promise<boolean> {
    return new Promise(resolve => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * 이미지를 WebP로 교체
   */
  private replaceImagesWithWebP(): void {
    const images = document.querySelectorAll('img[src*=".jpg"], img[src*=".jpeg"], img[src*=".png"]');
    images.forEach(img => {
      const imageElement = img as HTMLImageElement;
      const webpSrc = imageElement['src'].replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      // WebP 이미지가 존재하는지 확인
      const testImg = new Image();
      testImg.onload = () => {
        imageElement['src'] = webpSrc;
      };
      testImg['src'] = webpSrc;
    });

    this.optimizations.push('Images converted to WebP where available');
  }

  /**
   * 지연 로딩 최적화
   */
  private optimizeLazyLoading(): void {
    // 별도 구현 없음 - ImageOptimizer가 처리
  }

  /**
   * 이미지 크기 최적화
   */
  private optimizeImageSizes(): void {
    // 별도 구현 없음 - ImageOptimizer가 처리
  }

  /**
   * 지연 로딩 설정
   */
  private setupLazyLoading(): void {
    // Intersection Observer를 사용한 이미지 지연 로딩
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset['src']) {
              img['src'] = img.dataset['src'];
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '50px' });

      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }

  /**
   * 리소스 힌트 설정
   */
  private setupResourceHints(): void {
    // DNS 프리페치
    const dnsPrefetchDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'www.googletagmanager.com',
      'pagead2.googlesyndication.com'
    ];

    dnsPrefetchDomains.forEach(domain => {
      if (!document.querySelector(`link[href="//${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        document.head.appendChild(link);
      }
    });

    // 연결 프리커넥트
    const preconnectDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ];

    preconnectDomains.forEach(domain => {
      if (!document.querySelector(`link[href="https://${domain}"][rel="preconnect"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = `https://${domain}`;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });

    this.optimizations.push('Resource hints configured');
  }

  /**
   * LCP 최적화
   */
  private optimizeLCP(): void {
    if (this.isOptimizing) return;
    this.isOptimizing = true;

    // 가장 큰 콘텐츠 요소 최적화
    const largestElement = this.findLargestContentfulElement();
    if (largestElement) {
      this.optimizeElement(largestElement);
    }

    // 서버 응답 시간 최적화 (클라이언트 사이드에서 할 수 있는 것)
    this.optimizeServerResponse();

    this.optimizations.push('LCP optimized');
    this.isOptimizing = false;
  }

  /**
   * 가장 큰 콘텐츠 요소 찾기
   */
  private findLargestContentfulElement(): Nullable<Element> {
    // 구현 생략 - 실제로는 성능 API를 통해 찾아야 함
    return document.querySelector('.hero, .main-content, h1');
  }

  /**
   * 요소 최적화
   */
  private optimizeElement(element: Element): void {
    // 구현 생략 - 요소별 최적화 로직
    element.setAttribute('data-optimized', 'true');
  }

  /**
   * 서버 응답 최적화
   */
  private optimizeServerResponse(): void {
    // 클라이언트 사이드에서 할 수 있는 최적화
    // 캐시 헤더 확인, 프리페치 등
  }

  /**
   * FID 최적화
   */
  private optimizeFID(): void {
    // 메인 스레드 차단 시간 줄이기
    this.splitLongTasks();
    
    // 불필요한 JavaScript 지연 로딩
    this.deferNonCriticalJS();
    
    // 이벤트 리스너 최적화
    this.optimizeEventListeners();

    this.optimizations.push('FID optimized');
  }

  /**
   * CLS 최적화
   */
  private optimizeCLS(): void {
    // 이미지 크기 명시
    this.addImageDimensions();
    
    // 폰트 로딩 최적화
    this.preventFontLayoutShift();
    
    // 광고 영역 크기 예약
    this.reserveAdSpace();

    this.optimizations.push('CLS optimized');
  }

  /**
   * 긴 작업 분할
   */
  private splitLongTasks(): void {
    // 긴 작업을 작은 청크로 분할하는 유틸리티
    (window as any).scheduler = (window as any).scheduler || {
      postTask: (callback: () => void, options: { delay?: number } = {}) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(callback());
          }, options.delay || 0);
        });
      }
    };

    // 큰 작업을 청크로 분할
    (window as any).yieldToMain = () => {
      return new Promise(resolve => {
        setTimeout(resolve, 0);
      });
    };
  }

  /**
   * 비필수 JavaScript 지연
   */
  private deferNonCriticalJS(): void {
    const nonCriticalScripts: ResourceType[] = [
      'analytics',
      'adsense',
      'kakao',
      'social-sharing'
    ];

    nonCriticalScripts.forEach(scriptType => {
      const scripts = document.querySelectorAll(`script[src*="${scriptType}"]`);
      scripts.forEach(script => {
        const scriptElement = script as HTMLScriptElement;
        if (!scriptElement.hasAttribute('defer') && !scriptElement.hasAttribute('async')) {
          scriptElement.defer = true;
        }
      });
    });
  }

  /**
   * 이벤트 리스너 최적화
   */
  private optimizeEventListeners(): void {
    // 패시브 이벤트 리스너 사용
    const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'scroll'];
    
    passiveEvents.forEach(eventType => {
      document.addEventListener(eventType, () => {}, { passive: true });
    });

    // 디바운스된 리사이즈 이벤트
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // 리사이즈 처리
        this.handleResize();
      }, 250);
    }, { passive: true });
  }

  /**
   * 리사이즈 처리
   */
  private handleResize(): void {
    // 리사이즈 처리 로직
  }

  /**
   * 이미지 차원 추가
   */
  private addImageDimensions(): void {
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      const imageElement = img as HTMLImageElement;
      // 기본 종횡비 설정
      if (!imageElement.width && !imageElement.height) {
        imageElement.style.aspectRatio = '16/9';
        imageElement.style.width = '100%';
        imageElement.style.height = 'auto';
      }
    });
  }

  /**
   * 폰트 레이아웃 시프트 방지
   */
  private preventFontLayoutShift(): void {
    // 폰트 로딩 중 폴백 폰트 크기 조정
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Noto Sans KR';
        font-display: swap;
        size-adjust: 100%;
      }
      
      body {
        font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 광고 공간 예약
   */
  private reserveAdSpace(): void {
    const adContainers = document.querySelectorAll('.ad-container, .adsbygoogle');
    adContainers.forEach(container => {
      const containerElement = container as HTMLElement;
      if (!containerElement.style.minHeight) {
        containerElement.style.minHeight = '100px';
      }
      if (!containerElement.style.width) {
        containerElement.style.width = '100%';
      }
    });
  }

  /**
   * 리소스 성능 분석
   */
  private analyzeResourcePerformance(entry: PerformanceResourceTiming): void {
    const loadTime = entry.responseEnd - entry.startTime;
    
    // 느린 리소스 감지 (1초 이상) - 개발 환경에서만 경고
    if (loadTime > 1000) {
      if (window.location.hostname === 'localhost') {
        // Slow resource detected
      }
      this.optimizeSlowResource(entry);
    }
  }

  /**
   * 느린 리소스 최적화
   */
  private optimizeSlowResource(entry: PerformanceResourceTiming): void {
    // 느린 리소스 최적화 로직
    console.warn('Slow resource detected:', entry.name, 'Load time:', entry.responseEnd - entry.startTime);
  }

  /**
   * 내비게이션 성능 분석
   */
  private analyzeNavigationPerformance(entry: PerformanceNavigationTiming): void {
    const metrics: NavigationMetrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      request: entry.responseStart - entry.requestStart,
      response: entry.responseEnd - entry.responseStart,
      domProcessing: entry.domContentLoadedEventStart - entry.responseEnd,
      domComplete: entry.loadEventStart - entry.domContentLoadedEventStart
    };

    // 각 단계별 성능 임계값 확인 (개발 환경에서만)
    if (window.location.hostname === 'localhost') {
      Object.entries(metrics).forEach(([phase, time]) => {
        if (this.isSlowPhase(phase as keyof NavigationMetrics, time)) {
          // Slow phase detected
        }
      });
    }
  }

  /**
   * 느린 단계 판별
   */
  private isSlowPhase(phase: keyof NavigationMetrics, time: number): boolean {
    const thresholds: Record<keyof NavigationMetrics, number> = {
      dns: 100,
      tcp: 100,
      request: 100,
      response: 500,
      domProcessing: 1000,
      domComplete: 1000
    };

    return time > (thresholds[phase] || 500);
  }

  /**
   * 메트릭 보고
   */
  private reportMetric(name: string, value: number): void {
    // Analytics에 성능 메트릭 전송
    if ((window as any).trackEvent) {
      (window as any).trackEvent('Performance', name, null, Math.round(value));
    }

    // 성능 대시보드에 표시할 수 있도록 저장
    if (!this.metrics.history) {
      this.metrics.history = {};
    }
    if (!this.metrics.history[name]) {
      this.metrics.history[name] = [];
    }
    this.metrics.history[name].push({
      value: Math.round(value),
      timestamp: Date.now()
    });
  }

  /**
   * 성능 보고서 생성
   */
  public generatePerformanceReport(): PerformanceReport {
    return {
      metrics: this.metrics,
      optimizations: this.optimizations,
      score: this.calculatePerformanceScore(),
      recommendations: this.getPerformanceRecommendations(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 성능 점수 계산
   */
  private calculatePerformanceScore(): number {
    let score = 100;

    // LCP 점수 (25점)
    if (this.metrics.lcp) {
      if (this.metrics.lcp > 4000) score -= 25;
      else if (this.metrics.lcp > 2500) score -= 15;
      else if (this.metrics.lcp > 1200) score -= 5;
    }

    // FID 점수 (25점)
    if (this.metrics.fid) {
      if (this.metrics.fid > 300) score -= 25;
      else if (this.metrics.fid > 100) score -= 15;
      else if (this.metrics.fid > 50) score -= 5;
    }

    // CLS 점수 (25점)
    if (this.metrics.cls) {
      if (this.metrics.cls > 0.25) score -= 25;
      else if (this.metrics.cls > 0.1) score -= 15;
      else if (this.metrics.cls > 0.05) score -= 5;
    }

    return Math.max(0, score);
  }

  /**
   * 성능 개선 권장사항
   */
  private getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.lcp && this.metrics.lcp > 2500) {
      recommendations.push('이미지 최적화 및 크리티컬 리소스 프리로드 필요');
    }

    if (this.metrics.fid && this.metrics.fid > 100) {
      recommendations.push('JavaScript 실행 시간 최적화 필요');
    }

    if (this.metrics.cls && this.metrics.cls > 0.1) {
      recommendations.push('레이아웃 시프트 최소화 필요');
    }

    return recommendations;
  }

  /**
   * 초기 로드 최적화 (공개 메서드)
   */
  public optimizePerformance(): void {
    this.optimizeInitialLoad();
  }
}

// 전역 인스턴스 생성
const performanceOptimizer = new PerformanceOptimizer();

// 전역 객체에 추가
(window as any).performanceOptimizer = performanceOptimizer;

// 편의 함수들
(window as any).getPerformanceReport = () => {
  return (window as any).performanceOptimizer.generatePerformanceReport();
};

(window as any).optimizePerformance = () => {
  (window as any).performanceOptimizer.optimizePerformance();
};

export { PerformanceOptimizer, performanceOptimizer };
export default performanceOptimizer;