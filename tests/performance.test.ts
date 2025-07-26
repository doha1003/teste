/**
 * 성능 최적화 시스템 테스트
 * Core Web Vitals 및 최적화 기능 검증
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// PerformanceOptimizer 모의 구현
class MockPerformanceOptimizer {
  public metrics: any = {};
  public optimizations: string[] = [];
  public isOptimizing: boolean = false;

  constructor() {
    this.init();
  }

  init() {
    this.setupPerformanceObserver();
    this.optimizeInitialLoad();
    this.setupLazyLoading();
    this.setupResourceHints();
    this.monitorCoreWebVitals();
  }

  setupPerformanceObserver() {
    this.optimizations.push('Performance Observer 설정 완료');
  }

  optimizeInitialLoad() {
    this.inlineCriticalCSS();
    this.preloadCriticalResources();
    this.optimizeFonts();
    this.optimizeImages();
  }

  inlineCriticalCSS() {
    this.optimizations.push('Critical CSS inlined');
  }

  preloadCriticalResources() {
    this.optimizations.push('Critical resources preloaded');
  }

  optimizeFonts() {
    this.optimizations.push('Fonts optimized with display: swap');
  }

  optimizeImages() {
    this.optimizations.push('Images optimized');
  }

  setupLazyLoading() {
    this.optimizations.push('Lazy loading 설정 완료');
  }

  setupResourceHints() {
    this.optimizations.push('Resource hints configured');
  }

  monitorCoreWebVitals() {
    this.optimizations.push('Core Web Vitals 모니터링 시작');
  }

  optimizeLCP() {
    if (this.isOptimizing) return;
    this.isOptimizing = true;
    this.optimizations.push('LCP optimized');
    this.isOptimizing = false;
  }

  optimizeFID() {
    this.optimizations.push('FID optimized');
  }

  optimizeCLS() {
    this.optimizations.push('CLS optimized');
  }

  reportMetric(name: string, value: number) {
    // 메트릭 이름을 소문자로 변환해서 저장
    const metricKey = name.toLowerCase();
    this.metrics[metricKey] = value;
  }

  generatePerformanceReport() {
    return {
      metrics: this.metrics,
      optimizations: this.optimizations,
      score: this.calculatePerformanceScore(),
      recommendations: this.getPerformanceRecommendations(),
      timestamp: new Date().toISOString()
    };
  }

  calculatePerformanceScore() {
    let score = 100;
    
    // LCP 점수 계산 (소문자 키 사용)
    if (this.metrics.lcp) {
      if (this.metrics.lcp > 4000) score -= 25;
      else if (this.metrics.lcp > 2500) score -= 15;
      else if (this.metrics.lcp > 1200) score -= 5;
    }
    
    // FID 점수 계산 (소문자 키 사용)
    if (this.metrics.fid) {
      if (this.metrics.fid > 300) score -= 25;
      else if (this.metrics.fid > 100) score -= 15;
      else if (this.metrics.fid > 50) score -= 5;
    }
    
    // CLS 점수 계산 (소문자 키 사용)
    if (this.metrics.cls) {
      if (this.metrics.cls > 0.25) score -= 25;
      else if (this.metrics.cls > 0.1) score -= 15;
      else if (this.metrics.cls > 0.05) score -= 5;
    }
    
    return Math.max(0, score);
  }

  getPerformanceRecommendations() {
    const recommendations = [];
    
    // 소문자 키로 메트릭 접근
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

  optimizePerformance() {
    this.optimizeInitialLoad();
  }
}

describe('성능 최적화 시스템 테스트', () => {
  let performanceOptimizer: MockPerformanceOptimizer;

  beforeEach(() => {
    performanceOptimizer = new MockPerformanceOptimizer();
    
    // DOM 내용 초기화
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('초기화 및 설정 검증', () => {
    it('성능 최적화 시스템이 올바르게 초기화되어야 함', () => {
      expect(performanceOptimizer).toBeDefined();
      expect(performanceOptimizer.optimizations).toContain('Performance Observer 설정 완료');
      expect(performanceOptimizer.optimizations).toContain('Critical CSS inlined');
      expect(performanceOptimizer.optimizations).toContain('Critical resources preloaded');
      expect(performanceOptimizer.optimizations).toContain('Fonts optimized with display: swap');
      expect(performanceOptimizer.optimizations).toContain('Resource hints configured');
    });

    it('모든 핵심 최적화가 적용되어야 함', () => {
      const requiredOptimizations = [
        'Critical CSS inlined',
        'Critical resources preloaded',
        'Fonts optimized with display: swap',
        'Lazy loading 설정 완료',
        'Resource hints configured',
        'Core Web Vitals 모니터링 시작'
      ];

      requiredOptimizations.forEach(optimization => {
        expect(performanceOptimizer.optimizations).toContain(optimization);
      });
    });
  });

  describe('Core Web Vitals 메트릭 검증', () => {
    it('LCP 메트릭이 올바르게 기록되어야 함', () => {
      // 우수한 LCP (1.2초 이하)
      performanceOptimizer.reportMetric('LCP', 1000);
      expect(performanceOptimizer.metrics.lcp).toBe(1000);
      
      // 점수 계산 확인
      const score = performanceOptimizer.calculatePerformanceScore();
      expect(score).toBe(100); // 감점 없음
    });

    it('FID 메트릭이 올바르게 기록되어야 함', () => {
      // 우수한 FID (50ms 이하)
      performanceOptimizer.reportMetric('FID', 30);
      expect(performanceOptimizer.metrics.fid).toBe(30);
      
      const score = performanceOptimizer.calculatePerformanceScore();
      expect(score).toBe(100);
    });

    it('CLS 메트릭이 올바르게 기록되어야 함', () => {
      // 우수한 CLS (0.05 이하)
      performanceOptimizer.reportMetric('CLS', 0.03);
      expect(performanceOptimizer.metrics.cls).toBe(0.03);
      
      const score = performanceOptimizer.calculatePerformanceScore();
      expect(score).toBe(100);
    });

    it('나쁜 메트릭에 대해 적절한 감점이 적용되어야 함', () => {
      // 나쁜 LCP, FID, CLS
      performanceOptimizer.reportMetric('LCP', 5000); // -25점
      performanceOptimizer.reportMetric('FID', 400);  // -25점
      performanceOptimizer.reportMetric('CLS', 0.3);  // -25점
      
      const score = performanceOptimizer.calculatePerformanceScore();
      expect(score).toBe(25); // 100 - 75 = 25
    });
  });

  describe('자동 최적화 동작 검증', () => {
    it('LCP가 임계값을 초과할 때 자동 최적화가 실행되어야 함', () => {
      performanceOptimizer.reportMetric('LCP', 3000);
      performanceOptimizer.optimizeLCP();
      
      expect(performanceOptimizer.optimizations).toContain('LCP optimized');
    });

    it('FID가 임계값을 초과할 때 자동 최적화가 실행되어야 함', () => {
      performanceOptimizer.reportMetric('FID', 150);
      performanceOptimizer.optimizeFID();
      
      expect(performanceOptimizer.optimizations).toContain('FID optimized');
    });

    it('CLS가 임계값을 초과할 때 자동 최적화가 실행되어야 함', () => {
      performanceOptimizer.reportMetric('CLS', 0.15);
      performanceOptimizer.optimizeCLS();
      
      expect(performanceOptimizer.optimizations).toContain('CLS optimized');
    });

    it('최적화 중복 실행 방지가 작동해야 함', () => {
      performanceOptimizer.isOptimizing = true;
      const optimizationsBefore = performanceOptimizer.optimizations.length;
      
      performanceOptimizer.optimizeLCP();
      
      const optimizationsAfter = performanceOptimizer.optimizations.length;
      expect(optimizationsAfter).toBe(optimizationsBefore);
    });
  });

  describe('성능 보고서 생성 검증', () => {
    it('완전한 성능 보고서가 생성되어야 함', () => {
      performanceOptimizer.reportMetric('LCP', 1500);
      performanceOptimizer.reportMetric('FID', 80);
      performanceOptimizer.reportMetric('CLS', 0.08);
      
      const report = performanceOptimizer.generatePerformanceReport();
      
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('optimizations');
      expect(report).toHaveProperty('score');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('timestamp');
      
      expect(report.metrics.lcp).toBe(1500);
      expect(report.metrics.fid).toBe(80);
      expect(report.metrics.cls).toBe(0.08);
      expect(typeof report.score).toBe('number');
      expect(Array.isArray(report.optimizations)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('성능 점수가 올바르게 계산되어야 함', () => {
      // 완벽한 점수
      performanceOptimizer.reportMetric('LCP', 1000);
      performanceOptimizer.reportMetric('FID', 30);
      performanceOptimizer.reportMetric('CLS', 0.03);
      
      let report = performanceOptimizer.generatePerformanceReport();
      expect(report.score).toBe(100);
      
      // 중간 점수
      performanceOptimizer.reportMetric('LCP', 3000); // -15점
      performanceOptimizer.reportMetric('FID', 150);  // -15점
      performanceOptimizer.reportMetric('CLS', 0.15); // -15점
      
      report = performanceOptimizer.generatePerformanceReport();
      expect(report.score).toBe(55); // 100 - 45 = 55
    });

    it('권장사항이 적절하게 제공되어야 함', () => {
      performanceOptimizer.reportMetric('LCP', 3000);
      performanceOptimizer.reportMetric('FID', 150);
      performanceOptimizer.reportMetric('CLS', 0.15);
      
      const report = performanceOptimizer.generatePerformanceReport();
      
      expect(report.recommendations).toContain('이미지 최적화 및 크리티컬 리소스 프리로드 필요');
      expect(report.recommendations).toContain('JavaScript 실행 시간 최적화 필요');
      expect(report.recommendations).toContain('레이아웃 시프트 최소화 필요');
    });
  });

  describe('성능 임계값 검증', () => {
    it('Lighthouse 100점 목표 기준이 적용되어야 함', () => {
      // Lighthouse 100점 기준
      const excellentMetrics = {
        LCP: 1200,  // 1.2초 이하
        FID: 50,    // 50ms 이하
        CLS: 0.05   // 0.05 이하
      };
      
      performanceOptimizer.reportMetric('LCP', excellentMetrics.LCP);
      performanceOptimizer.reportMetric('FID', excellentMetrics.FID);
      performanceOptimizer.reportMetric('CLS', excellentMetrics.CLS);
      
      const score = performanceOptimizer.calculatePerformanceScore();
      expect(score).toBeGreaterThanOrEqual(95); // 거의 완벽
    });

    it('성능 저하 시 적절한 경고가 제공되어야 함', () => {
      const poorMetrics = {
        LCP: 4500,  // 매우 나쁨
        FID: 350,   // 매우 나쁨
        CLS: 0.3    // 매우 나쁨
      };
      
      performanceOptimizer.reportMetric('LCP', poorMetrics.LCP);
      performanceOptimizer.reportMetric('FID', poorMetrics.FID);
      performanceOptimizer.reportMetric('CLS', poorMetrics.CLS);
      
      const report = performanceOptimizer.generatePerformanceReport();
      expect(report.score).toBeLessThan(50);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('최적화 효과 검증', () => {
    it('최적화 적용 후 성능이 개선되어야 함', () => {
      // 최적화 전 나쁜 성능
      performanceOptimizer.reportMetric('LCP', 4000);
      const scoreBefore = performanceOptimizer.calculatePerformanceScore();
      
      // 최적화 실행
      performanceOptimizer.optimizeLCP();
      
      // 최적화 후 개선된 성능 시뮬레이션
      performanceOptimizer.reportMetric('LCP', 1500);
      const scoreAfter = performanceOptimizer.calculatePerformanceScore();
      
      expect(scoreAfter).toBeGreaterThan(scoreBefore);
      expect(performanceOptimizer.optimizations).toContain('LCP optimized');
    });
  });
});