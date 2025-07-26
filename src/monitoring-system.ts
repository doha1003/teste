/**
 * 실시간 모니터링 시스템
 * 성능 메트릭, 오류 추적, 사용자 행동 분석
 * 
 * @version 3.0.0
 * @author doha.kr
 */

import type { Nullable } from '../types/global.js';

/**
 * 성능 메트릭 인터페이스
 */
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

/**
 * 오류 정보 인터페이스
 */
interface ErrorInfo {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
}

/**
 * 사용자 행동 이벤트 인터페이스
 */
interface UserEvent {
  type: string;
  target: string;
  timestamp: number;
  url: string;
  metadata?: Record<string, any>;
}

/**
 * 만세력 API 모니터링 인터페이스
 */
interface ManseryeokAPIEvent {
  action: 'request' | 'response' | 'error' | 'cache_hit' | 'fallback';
  duration?: number;
  success: boolean;
  source: 'api' | 'local' | 'cache';
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * 모니터링 설정 인터페이스
 */
interface MonitoringConfig {
  // 데이터 수집 설정
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  enableUserTracking: boolean;
  enableManseryeokMonitoring: boolean;
  
  // 샘플링 설정
  performanceSampleRate: number;
  errorSampleRate: number;
  userEventSampleRate: number;
  
  // 버퍼 설정
  maxBufferSize: number;
  flushInterval: number;
  
  // API 설정
  reportingEndpoint: string;
  enableLocalStorage: boolean;
  enableConsoleLogging: boolean;
}

/**
 * 실시간 모니터링 시스템 클래스
 */
class MonitoringSystem {
  private config: MonitoringConfig;
  private metricsBuffer: PerformanceMetric[];
  private errorsBuffer: ErrorInfo[];
  private eventsBuffer: UserEvent[];
  private manseryeokBuffer: ManseryeokAPIEvent[];
  private flushTimer: Nullable<NodeJS.Timeout>;
  private sessionId: string;
  private userId: Nullable<string>;
  private startTime: number;

  constructor(config?: Partial<MonitoringConfig>) {
    this.config = {
      enablePerformanceMonitoring: true,
      enableErrorTracking: true,
      enableUserTracking: true,
      enableManseryeokMonitoring: true,
      performanceSampleRate: 1.0,
      errorSampleRate: 1.0,
      userEventSampleRate: 0.1,
      maxBufferSize: 100,
      flushInterval: 30000, // 30초
      reportingEndpoint: '/api/monitoring',
      enableLocalStorage: true,
      enableConsoleLogging: false,
      ...config
    };

    this.metricsBuffer = [];
    this.errorsBuffer = [];
    this.eventsBuffer = [];
    this.manseryeokBuffer = [];
    this.flushTimer = null;
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.startTime = performance.now();

    this.init();
  }

  /**
   * 초기화
   */
  private init(): void {
    this.setupPerformanceMonitoring();
    this.setupErrorTracking();
    this.setupUserTracking();
    this.setupManseryeokMonitoring();
    this.startPeriodicFlush();
    
    // 페이지 언로드 시 데이터 전송
    window.addEventListener('beforeunload', () => {
      this.flush(true);
    });
    
    // 가시성 변경 시 데이터 전송
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush();
      }
    });

    if (this.config.enableConsoleLogging) {
      console.log('🔍 Monitoring System initialized');
    }
  }

  /**
   * 성능 모니터링 설정
   */
  private setupPerformanceMonitoring(): void {
    if (!this.config.enablePerformanceMonitoring) return;

    // Core Web Vitals 모니터링
    this.observeWebVitals();
    
    // Resource Timing 모니터링
    this.observeResourceTiming();
    
    // Navigation Timing 모니터링
    this.observeNavigationTiming();
  }

  /**
   * Core Web Vitals 관찰
   */
  private observeWebVitals(): void {
    if (!('PerformanceObserver' in window)) return;

    // LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry) {
        this.recordMetric({
          name: 'LCP',
          value: lastEntry.startTime,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        });
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID (First Input Delay)
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const fidEntry = entry as PerformanceEventTiming;
        const fid = fidEntry.processingStart - fidEntry.startTime;
        
        this.recordMetric({
          name: 'FID',
          value: fid,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const layoutShiftEntry = entry as PerformanceEntry;
        if (!(layoutShiftEntry as any).hadRecentInput) {
          clsValue += (layoutShiftEntry as any).value;
        }
      });
      
      this.recordMetric({
        name: 'CLS',
        value: clsValue,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * 리소스 타이밍 관찰
   */
  private observeResourceTiming(): void {
    if (!('PerformanceObserver' in window)) return;

    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;
        
        // 느린 리소스만 기록 (1초 이상)
        const loadTime = resource.responseEnd - resource.startTime;
        if (loadTime > 1000) {
          this.recordMetric({
            name: 'slow_resource',
            value: loadTime,
            timestamp: Date.now(),
            url: resource.name,
            userAgent: navigator.userAgent
          });
        }
      });
    }).observe({ entryTypes: ['resource'] });
  }

  /**
   * 네비게이션 타이밍 관찰
   */
  private observeNavigationTiming(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        this.recordMetric({
          name: 'page_load_time',
          value: perfData.loadEventEnd - perfData.fetchStart,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        });

        this.recordMetric({
          name: 'dom_content_loaded',
          value: perfData.domContentLoadedEventEnd - perfData.fetchStart,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        });
      }, 0);
    });
  }

  /**
   * 오류 추적 설정
   */
  private setupErrorTracking(): void {
    if (!this.config.enableErrorTracking) return;

    // JavaScript 오류 추적
    window.addEventListener('error', (event) => {
      this.recordError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.userId || undefined
      });
    });

    // Promise 거부 추적
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.userId || undefined
      });
    });
  }

  /**
   * 사용자 추적 설정
   */
  private setupUserTracking(): void {
    if (!this.config.enableUserTracking) return;

    // 클릭 이벤트 추적
    document.addEventListener('click', (event) => {
      if (Math.random() > this.config.userEventSampleRate) return;

      const target = event.target as HTMLElement;
      this.recordUserEvent({
        type: 'click',
        target: this.getElementSelector(target),
        timestamp: Date.now(),
        url: window.location.href,
        metadata: {
          x: event.clientX,
          y: event.clientY,
          button: event.button
        }
      });
    });

    // 페이지 뷰 추적
    this.recordUserEvent({
      type: 'page_view',
      target: window.location.pathname,
      timestamp: Date.now(),
      url: window.location.href,
      metadata: {
        referrer: document.referrer,
        sessionId: this.sessionId
      }
    });
  }

  /**
   * 만세력 API 모니터링 설정
   */
  private setupManseryeokMonitoring(): void {
    if (!this.config.enableManseryeokMonitoring) return;

    // 만세력 API 이벤트 리스너 설정
    document.addEventListener('manseryeok:request', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.recordManseryeokEvent({
        action: 'request',
        success: true,
        source: 'api',
        timestamp: Date.now(),
        metadata: customEvent.detail
      });
    });

    document.addEventListener('manseryeok:response', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.recordManseryeokEvent({
        action: 'response',
        duration: customEvent.detail.duration,
        success: customEvent.detail.success,
        source: customEvent.detail.source,
        timestamp: Date.now(),
        metadata: customEvent.detail
      });
    });

    document.addEventListener('manseryeok:error', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.recordManseryeokEvent({
        action: 'error',
        success: false,
        source: customEvent.detail.source || 'api',
        timestamp: Date.now(),
        metadata: customEvent.detail
      });
    });

    document.addEventListener('manseryeok:cache_hit', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.recordManseryeokEvent({
        action: 'cache_hit',
        success: true,
        source: 'cache',
        timestamp: Date.now(),
        metadata: customEvent.detail
      });
    });

    document.addEventListener('manseryeok:fallback', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.recordManseryeokEvent({
        action: 'fallback',
        success: true,
        source: 'local',
        timestamp: Date.now(),
        metadata: customEvent.detail
      });
    });
  }

  /**
   * 성능 메트릭 기록
   */
  private recordMetric(metric: PerformanceMetric): void {
    if (Math.random() > this.config.performanceSampleRate) return;

    this.metricsBuffer.push(metric);
    this.checkBufferSize();

    if (this.config.enableConsoleLogging) {
      console.log('📊 Performance Metric:', metric);
    }
  }

  /**
   * 오류 기록
   */
  private recordError(error: ErrorInfo): void {
    if (Math.random() > this.config.errorSampleRate) return;

    this.errorsBuffer.push(error);
    this.checkBufferSize();

    if (this.config.enableConsoleLogging) {
      console.error('🚨 Error Tracked:', error);
    }
  }

  /**
   * 사용자 이벤트 기록
   */
  private recordUserEvent(event: UserEvent): void {
    this.eventsBuffer.push(event);
    this.checkBufferSize();

    if (this.config.enableConsoleLogging) {
      console.log('👤 User Event:', event);
    }
  }

  /**
   * 만세력 API 이벤트 기록
   */
  private recordManseryeokEvent(event: ManseryeokAPIEvent): void {
    this.manseryeokBuffer.push(event);
    this.checkBufferSize();

    if (this.config.enableConsoleLogging) {
      console.log('🗓️ Manseryeok Event:', event);
    }
  }

  /**
   * 버퍼 크기 확인 및 자동 플러시
   */
  private checkBufferSize(): void {
    const totalBufferSize = 
      this.metricsBuffer.length + 
      this.errorsBuffer.length + 
      this.eventsBuffer.length + 
      this.manseryeokBuffer.length;

    if (totalBufferSize >= this.config.maxBufferSize) {
      this.flush();
    }
  }

  /**
   * 주기적 플러시 시작
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * 데이터 플러시 (서버로 전송)
   */
  public async flush(isBeforeUnload = false): Promise<void> {
    const data = {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: [...this.metricsBuffer],
      errors: [...this.errorsBuffer],
      events: [...this.eventsBuffer],
      manseryeokEvents: [...this.manseryeokBuffer]
    };

    // 버퍼 초기화
    this.metricsBuffer = [];
    this.errorsBuffer = [];
    this.eventsBuffer = [];
    this.manseryeokBuffer = [];

    // 데이터가 없으면 전송하지 않음
    if (data.metrics.length === 0 && data.errors.length === 0 && 
        data.events.length === 0 && data.manseryeokEvents.length === 0) {
      return;
    }

    try {
      // 로컬 스토리지에 백업
      if (this.config.enableLocalStorage) {
        this.saveToLocalStorage(data);
      }

      // 서버로 전송
      if (isBeforeUnload && 'sendBeacon' in navigator) {
        navigator.sendBeacon(this.config.reportingEndpoint, JSON.stringify(data));
      } else {
        await fetch(this.config.reportingEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      }

      if (this.config.enableConsoleLogging) {
        console.log('📤 Monitoring data sent:', data);
      }
    } catch (error) {
      if (this.config.enableConsoleLogging) {
        console.error('❌ Failed to send monitoring data:', error);
      }
      
      // 전송 실패 시 버퍼에 다시 추가
      this.metricsBuffer.unshift(...data.metrics);
      this.errorsBuffer.unshift(...data.errors);
      this.eventsBuffer.unshift(...data.events);
      this.manseryeokBuffer.unshift(...data.manseryeokEvents);
    }
  }

  /**
   * 로컬 스토리지에 데이터 저장
   */
  private saveToLocalStorage(data: any): void {
    try {
      const key = `monitoring_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(data));
      
      // 오래된 데이터 정리 (10개까지만 보관)
      const keys = Object.keys(localStorage)
        .filter(k => k.startsWith('monitoring_'))
        .sort()
        .slice(0, -10);
      
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      // localStorage 용량 초과 등의 오류 무시
    }
  }

  /**
   * 세션 ID 생성
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 사용자 ID 가져오기
   */
  private getUserId(): Nullable<string> {
    try {
      return localStorage.getItem('doha_user_id');
    } catch {
      return null;
    }
  }

  /**
   * 요소 선택자 생성
   */
  private getElementSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      return `.${element.className.split(' ').join('.')}`;
    }
    
    return element.tagName.toLowerCase();
  }

  /**
   * 사용자 ID 설정
   */
  public setUserId(userId: string): void {
    this.userId = userId;
    try {
      localStorage.setItem('doha_user_id', userId);
    } catch {
      // localStorage 접근 실패 무시
    }
  }

  /**
   * 커스텀 메트릭 기록
   */
  public recordCustomMetric(name: string, value: number, _metadata?: Record<string, any>): void {
    this.recordMetric({
      name: `custom_${name}`,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }

  /**
   * 커스텀 이벤트 기록
   */
  public recordCustomEvent(type: string, target: string, metadata?: Record<string, any>): void {
    this.recordUserEvent({
      type: `custom_${type}`,
      target,
      timestamp: Date.now(),
      url: window.location.href,
      metadata
    });
  }

  /**
   * 설정 업데이트
   */
  public updateConfig(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 모니터링 시스템 종료
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    this.flush();
  }

  /**
   * 현재 세션 정보 반환
   */
  public getSessionInfo(): { sessionId: string; userId: Nullable<string>; startTime: number } {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: this.startTime
    };
  }

  /**
   * 버퍼 상태 반환
   */
  public getBufferStatus(): {
    metrics: number;
    errors: number;
    events: number;
    manseryeokEvents: number;
    total: number;
  } {
    return {
      metrics: this.metricsBuffer.length,
      errors: this.errorsBuffer.length,
      events: this.eventsBuffer.length,
      manseryeokEvents: this.manseryeokBuffer.length,
      total: this.metricsBuffer.length + this.errorsBuffer.length + 
             this.eventsBuffer.length + this.manseryeokBuffer.length
    };
  }
}

// 전역 인스턴스 생성
const monitoring = new MonitoringSystem();

// 전역 객체에 추가
(window as any).MonitoringSystem = monitoring;

// 개발 도구
if (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:') {
  (window as any).monitoringDebug = {
    getSessionInfo: () => monitoring.getSessionInfo(),
    getBufferStatus: () => monitoring.getBufferStatus(),
    flush: () => monitoring.flush(),
    setUserId: (id: string) => monitoring.setUserId(id),
    recordCustomMetric: (name: string, value: number) => monitoring.recordCustomMetric(name, value),
    recordCustomEvent: (type: string, target: string) => monitoring.recordCustomEvent(type, target)
  };
}

export { MonitoringSystem, monitoring };
export default monitoring;