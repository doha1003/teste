/**
 * Performance Monitor for Core Web Vitals
 * LCP, FID, CLS, INP 측정 및 최적화
 */

// 개발 환경 감지 및 안전한 로깅
const isDevelopment = () => {
  return (
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.protocol === 'file:' ||
    location.search.includes('debug=true')
  );
};

const safeLog = {
  log: (...args) => isDevelopment() && console.log(...args), // eslint-disable-line no-console
  warn: (...args) => isDevelopment() && console.warn(...args), // eslint-disable-line no-console
  info: (...args) => isDevelopment() && console.info(...args), // eslint-disable-line no-console
  error: (...args) => console.error(...args), // eslint-disable-line no-console
  group: (...args) => isDevelopment() && console.group(...args), // eslint-disable-line no-console
  groupEnd: () => isDevelopment() && console.groupEnd(), // eslint-disable-line no-console
};

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      lcp: null,
      fid: null,
      cls: null,
      inp: null,
      ttfb: null,
      fcp: null,
    };

    this.thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      inp: { good: 200, poor: 500 },
      ttfb: { good: 800, poor: 1800 },
      fcp: { good: 1800, poor: 3000 },
    };

    this.observers = new Map();
    this.isMonitoring = false;

    // 한국어 메시지
    this.messages = {
      lcp: {
        good: '페이지 로딩 속도가 우수합니다',
        poor: '페이지 로딩 속도 개선이 필요합니다',
      },
      fid: {
        good: '사용자 입력 반응성이 우수합니다',
        poor: '사용자 입력 반응성 개선이 필요합니다',
      },
      cls: {
        good: '레이아웃 안정성이 우수합니다',
        poor: '레이아웃 이동이 너무 많습니다',
      },
      inp: {
        good: '상호작용 반응성이 우수합니다',
        poor: '상호작용 반응성 개선이 필요합니다',
      },
    };
  }

  // 성능 모니터링 시작
  start() {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;

    // Core Web Vitals 측정
    this.measureLCP();
    this.measureFID();
    this.measureCLS();
    this.measureINP();

    // 추가 메트릭
    this.measureTTFB();
    this.measureFCP();

    // 리소스 타이밍 모니터링
    this.monitorResourceTiming();

    // 메모리 사용량 모니터링 (가능한 경우)
    this.monitorMemoryUsage();

    // 주기적 보고
    this.startPeriodicReporting();
  }

  // Largest Contentful Paint 측정
  measureLCP() {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      this.metrics.lcp = Math.round(lastEntry.startTime);
      this.evaluateMetric('lcp', this.metrics.lcp);

      // LCP 요소 정보 수집
      if (lastEntry.element) {
        this.collectLCPElementInfo(lastEntry.element);
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', observer);
    } catch (error) {
      safeLog.warn('PerformanceObserver not supported:', error.message);
    }
  }

  // First Input Delay 측정
  measureFID() {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.metrics.fid = Math.round(entry.processingStart - entry.startTime);
        this.evaluateMetric('fid', this.metrics.fid);
      });
    });

    try {
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', observer);
    } catch (error) {
      safeLog.warn('PerformanceObserver not supported:', error.message);
    }
  }

  // Cumulative Layout Shift 측정
  measureCLS() {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        // 예상치 못한 레이아웃 시프트만 측정
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          // 새 세션 시작 조건
          if (
            !firstSessionEntry ||
            entry.startTime - lastSessionEntry.startTime > 1000 ||
            entry.startTime - firstSessionEntry.startTime > 5000
          ) {
            sessionValue = entry.value;
            sessionEntries = [entry];
          } else {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            this.metrics.cls = Math.round(clsValue * 10000) / 10000;
            this.evaluateMetric('cls', this.metrics.cls);

            // CLS 원인 요소 수집
            this.collectCLSElementInfo(entry);
          }
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', observer);
    } catch (error) {
      safeLog.warn('PerformanceObserver not supported:', error.message);
    }
  }

  // Interaction to Next Paint 측정
  measureINP() {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    let maxINP = 0;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        // Event Timing API를 사용한 INP 계산
        const inp = entry.processingEnd - entry.startTime;

        if (inp > maxINP) {
          maxINP = inp;
          this.metrics.inp = Math.round(inp);
          this.evaluateMetric('inp', this.metrics.inp);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['event'] });
      this.observers.set('inp', observer);
    } catch (error) {
      // Event Timing API가 지원되지 않는 경우 대체 측정
      this.measureINPFallback();
    }
  }

  // Time to First Byte 측정
  measureTTFB() {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          this.metrics.ttfb = Math.round(entry.responseStart - entry.requestStart);
          this.evaluateMetric('ttfb', this.metrics.ttfb);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.set('ttfb', observer);
    } catch (error) {
      safeLog.warn('PerformanceObserver not supported:', error.message);
    }
  }

  // First Contentful Paint 측정
  measureFCP() {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = Math.round(entry.startTime);
          this.evaluateMetric('fcp', this.metrics.fcp);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
      this.observers.set('fcp', observer);
    } catch (error) {
      safeLog.warn('PerformanceObserver not supported:', error.message);
    }
  }

  // INP 대체 측정 (Event Timing API 미지원 시)
  measureINPFallback() {
    let startTime;
    const events = ['click', 'keydown', 'pointerdown'];

    events.forEach((eventType) => {
      document.addEventListener(
        eventType,
        () => {
          startTime = performance.now();
        },
        { passive: true }
      );

      document.addEventListener(
        eventType,
        () => {
          if (startTime) {
            const inp = Math.round(performance.now() - startTime);
            if (inp > (this.metrics.inp || 0)) {
              this.metrics.inp = inp;
              this.evaluateMetric('inp', inp);
            }
            startTime = null;
          }
        },
        { passive: true, capture: false }
      );
    });
  }

  // 리소스 타이밍 모니터링
  monitorResourceTiming() {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        // 느린 리소스 감지
        const duration = entry.responseEnd - entry.startTime;

        if (duration > 3000) {
          // 3초 이상
          safeLog.warn(`느린 리소스 감지: ${entry.name} (${duration.toFixed(2)}ms)`);

          // 성능 개선 제안
          this.suggestResourceOptimization(entry);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', observer);
    } catch (error) {
      safeLog.warn('PerformanceObserver not supported:', error.message);
    }
  }

  // 메모리 사용량 모니터링
  monitorMemoryUsage() {
    if (!('memory' in performance)) {
      return;
    }

    setInterval(() => {
      const { memory } = performance;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      const usage = (usedMB / limitMB) * 100;

      if (usage > 80) {
        // 80% 이상 사용 시
        safeLog.warn(`메모리 사용량 높음: ${usage.toFixed(1)}% (${usedMB}MB/${limitMB}MB)`);
        this.suggestMemoryOptimization();
      }
    }, 30000); // 30초마다 체크
  }

  // 메트릭 평가
  evaluateMetric(metricName, value) {
    const threshold = this.thresholds[metricName];
    if (!threshold) {
      return;
    }

    let status = 'good';
    if (value > threshold.poor) {
      status = 'poor';
    } else if (value > threshold.good) {
      status = 'needs-improvement';
    }

    const message = this.messages[metricName]?.[status === 'good' ? 'good' : 'poor'];

    safeLog.log(
      `성능 메트릭 ${metricName.toUpperCase()}: ${value}${this.getUnit(metricName)} (${status})`
    );

    if (message) {
      safeLog.info(message);
    }

    // 성능 문제 시 최적화 제안
    if (status === 'poor') {
      this.suggestOptimization(metricName, value);
    }

    // 메트릭을 Service Worker로 전송
    this.reportToServiceWorker(metricName, value, status);
  }

  // 단위 반환
  getUnit(metricName) {
    switch (metricName) {
      case 'lcp':
      case 'fid':
      case 'inp':
      case 'ttfb':
      case 'fcp':
        return 'ms';
      case 'cls':
        return '';
      default:
        return '';
    }
  }

  // LCP 요소 정보 수집
  collectLCPElementInfo(element) {
    const elementInfo = {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      src: element.src || element.href,
      text: element.textContent?.substring(0, 100),
    };

    // LCP 요소 정보를 성능 메트릭에 저장
    this.performanceMetrics.lcpElement = elementInfo;

    // LCP 최적화 제안
    if (element.tagName === 'IMG') {
      this.suggestImageOptimization(element);
    }
  }

  // CLS 요소 정보 수집
  collectCLSElementInfo(entry) {
    entry.sources?.forEach((source) => {
      if (source.node) {
        safeLog.log('CLS element:', source.node.tagName, source.node.className);
      }
    });
  }

  // 최적화 제안
  suggestOptimization(metricName, _value) {
    const suggestions = {
      lcp: [
        '이미지를 WebP 형식으로 변환하세요',
        '중요한 리소스를 preload하세요',
        '불필요한 JavaScript를 제거하세요',
        'CDN을 사용하여 리소스 로딩을 가속화하세요',
      ],
      fid: [
        'JavaScript 실행 시간을 줄이세요',
        'long task를 작은 단위로 분할하세요',
        'Web Worker를 사용하세요',
        '불필요한 폴리필을 제거하세요',
      ],
      cls: [
        '이미지에 width와 height를 지정하세요',
        '폰트 로딩 중 레이아웃 시프트를 방지하세요',
        '동적 콘텐츠 삽입을 최소화하세요',
        'aspect-ratio CSS 속성을 사용하세요',
      ],
      inp: [
        '이벤트 핸들러 실행 시간을 줄이세요',
        'requestIdleCallback을 사용하세요',
        'debounce/throttle을 적용하세요',
        '복잡한 DOM 조작을 최소화하세요',
      ],
    };

    const metricSuggestions = suggestions[metricName];
    if (metricSuggestions) {
      safeLog.group(`${metricName.toUpperCase()} 개선 제안:`);
      metricSuggestions.forEach((suggestion, index) => {
        safeLog.log(`${index + 1}. ${suggestion}`);
      });
      safeLog.groupEnd();
    }
  }

  // 이미지 최적화 제안
  suggestImageOptimization(img) {
    const suggestions = [];

    if (!img.loading || img.loading !== 'lazy') {
      suggestions.push('loading="lazy" 속성을 추가하세요');
    }

    if (!img.decoding || img.decoding !== 'async') {
      suggestions.push('decoding="async" 속성을 추가하세요');
    }

    if (img.src && !img.src.includes('.webp')) {
      suggestions.push('WebP 형식을 사용하세요');
    }

    if (!img.sizes && img.srcset) {
      suggestions.push('sizes 속성을 추가하세요');
    }

    if (suggestions.length > 0) {
      safeLog.group('이미지 최적화 제안:');
      suggestions.forEach((suggestion) => safeLog.log(`• ${suggestion}`));
      safeLog.groupEnd();
    }
  }

  // 리소스 최적화 제안
  suggestResourceOptimization(entry) {
    const url = new URL(entry.name);
    const extension = url.pathname.split('.').pop()?.toLowerCase();

    const suggestions = {
      js: ['코드 분할을 고려하세요', '불필요한 코드를 제거하세요', '압축을 적용하세요'],
      css: ['중요한 CSS를 인라인으로 처리하세요', '사용하지 않는 CSS를 제거하세요'],
      png: ['WebP 형식으로 변환하세요', '이미지를 압축하세요'],
      jpg: ['WebP 형식으로 변환하세요', '적절한 품질로 압축하세요'],
      jpeg: ['WebP 형식으로 변환하세요', '적절한 품질로 압축하세요'],
    };

    const resourceSuggestions = suggestions[extension];
    if (resourceSuggestions) {
      safeLog.group(`리소스 최적화 제안 (${extension}):`);
      resourceSuggestions.forEach((suggestion) => safeLog.log(`• ${suggestion}`));
      safeLog.groupEnd();
    }
  }

  // 메모리 최적화 제안
  suggestMemoryOptimization() {
    const suggestions = [
      '사용하지 않는 이벤트 리스너를 제거하세요',
      'DOM 요소 참조를 적절히 해제하세요',
      '큰 객체나 배열을 정리하세요',
      '메모리 누수를 확인하세요',
    ];

    safeLog.group('메모리 최적화 제안:');
    suggestions.forEach((suggestion) => safeLog.log(`• ${suggestion}`));
    safeLog.groupEnd();
  }

  // Service Worker로 메트릭 전송
  reportToServiceWorker(metricName, value, status) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PERFORMANCE_REPORT',
        metrics: {
          [metricName]: { value, status, timestamp: Date.now() },
        },
      });
    }
  }

  // 주기적 보고
  startPeriodicReporting() {
    setInterval(() => {
      this.generateReport();
    }, 60000); // 1분마다
  }

  // 성능 보고서 생성
  generateReport() {
    const report = {
      timestamp: Date.now(),
      url: location.href,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      metrics: { ...this.metrics },
      scores: this.calculateScores(),
    };

    // 로컬 스토리지에 저장
    this.saveReportToStorage(report);

    // 서버로 전송 (가능한 경우)
    this.sendReportToServer(report);

    return report;
  }

  // 연결 정보 수집
  getConnectionInfo() {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData,
      };
    }
    return null;
  }

  // 점수 계산
  calculateScores() {
    const scores = {};

    Object.keys(this.metrics).forEach((metricName) => {
      const value = this.metrics[metricName];
      const threshold = this.thresholds[metricName];

      if (value !== null && threshold) {
        if (value <= threshold.good) {
          scores[metricName] = 'good';
        } else if (value <= threshold.poor) {
          scores[metricName] = 'needs-improvement';
        } else {
          scores[metricName] = 'poor';
        }
      }
    });

    return scores;
  }

  // 보고서를 로컬 스토리지에 저장
  saveReportToStorage(report) {
    try {
      const reports = JSON.parse(localStorage.getItem('performance_reports') || '[]');
      reports.push(report);

      // 최근 10개만 보관
      if (reports.length > 10) {
        reports.shift();
      }

      localStorage.setItem('performance_reports', JSON.stringify(reports));
    } catch (error) {
      safeLog.warn('PerformanceObserver not supported:', error.message);
    }
  }

  // 서버로 보고서 전송
  async sendReportToServer(report) {
    try {
      // 필요시 서버 엔드포인트로 전송
      if (typeof window.sendPerformanceReport === 'function') {
        await window.sendPerformanceReport(report);
      }
    } catch (error) {
      safeLog.warn('PerformanceObserver not supported:', error.message);
    }
  }

  // 현재 메트릭 반환
  getMetrics() {
    return { ...this.metrics };
  }

  // 모니터링 중지
  stop() {
    this.isMonitoring = false;

    // 모든 옵저버 해제
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }

  // 실시간 성능 대시보드 표시 (개발 모드)
  showDebugDashboard() {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const dashboard = document.createElement('div');
    dashboard.id = 'performance-dashboard';
    dashboard.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      min-width: 200px;
    `;

    document.body.appendChild(dashboard);

    // 주기적 업데이트
    setInterval(() => {
      const scores = this.calculateScores();
      const html = Object.keys(this.metrics)
        .map((key) => {
          const value = this.metrics[key];
          const score = scores[key];
          const colorMap = {
            good: '#4ade80',
            'needs-improvement': '#fbbf24',
            poor: '#ef4444',
          };
          const color = colorMap[score] || '#ef4444';

          return `<div style="color: ${color}">
            ${key.toUpperCase()}: ${value !== null ? value + this.getUnit(key) : 'N/A'}
          </div>`;
        })
        .join('');

      dashboard.innerHTML = `<strong>성능 지표</strong><br>${html}`;
    }, 1000);
  }
}

// 전역으로 내보내기
window.PerformanceMonitor = PerformanceMonitor;

// 자동 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const monitor = new PerformanceMonitor();
    monitor.start();
    window.performanceMonitor = monitor;

    // 개발 모드에서 대시보드 표시
    if (process.env.NODE_ENV === 'development') {
      monitor.showDebugDashboard();
    }
  });
} else {
  const monitor = new PerformanceMonitor();
  monitor.start();
  window.performanceMonitor = monitor;
}

export default PerformanceMonitor;
