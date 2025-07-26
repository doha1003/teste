/**
 * 테스트 환경 설정
 * doha.kr 프로젝트를 위한 Vitest 설정
 */

import { vi } from 'vitest';
import { JSDOM } from 'jsdom';

// JSDOM 환경 설정
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
  url: 'https://doha.kr',
  pretendToBeVisual: true,
  resources: 'usable'
});

// Global 객체들 설정
global.window = dom.window as any;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLImageElement = dom.window.HTMLImageElement;
global.HTMLScriptElement = dom.window.HTMLScriptElement;
global.HTMLAnchorElement = dom.window.HTMLAnchorElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;

// Location 객체는 JSDOM에서 자동으로 설정됨 (https://doha.kr)

// Performance API 모킹
if (!global.window.performance) {
  Object.defineProperty(global.window, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByType: vi.fn(() => []),
      getEntriesByName: vi.fn(() => [])
    },
    writable: true,
    configurable: true
  });
} else {
  // 기존 performance 객체에 mock 메서드 추가
  global.window.performance.now = vi.fn(() => Date.now());
  global.window.performance.mark = vi.fn();
  global.window.performance.measure = vi.fn();
  global.window.performance.getEntriesByType = vi.fn(() => []);
  global.window.performance.getEntriesByName = vi.fn(() => []);
}

// IntersectionObserver 모킹
global.IntersectionObserver = vi.fn().mockImplementation((callback, options) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: options?.rootMargin || '0px',
  thresholds: Array.isArray(options?.threshold) ? options.threshold : [options?.threshold || 0]
}));

// 브라우저 API 모킹
if (!global.window.fetch) {
  Object.defineProperty(global.window, 'fetch', {
    value: vi.fn(),
    writable: true,
    configurable: true
  });
}

// Image 생성자 모킹
global.Image = class {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src: string = '';
  
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
};

// URL 생성자 모킹 (필요한 경우)
if (!global.URL) {
  global.URL = class {
    pathname: string;
    origin: string;
    searchParams: URLSearchParams;
    
    constructor(url: string, base?: string) {
      const baseUrl = base || 'https://doha.kr';
      this.pathname = url.startsWith('/') ? url : `/${url}`;
      this.origin = baseUrl;
      this.searchParams = new URLSearchParams();
    }
    
    toString() {
      return this.origin + this.pathname;
    }
  };
}

// AbortSignal 모킹
if (!global.AbortSignal) {
  global.AbortSignal = class {
    static timeout(delay: number) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), delay);
      return controller.signal;
    }
    
    aborted = false;
    reason: any = null;
    
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return true; }
  };
}

if (!global.AbortController) {
  global.AbortController = class {
    signal = new AbortSignal();
    
    abort() {
      this.signal.aborted = true;
    }
  };
}

// Console 경고 억제 (테스트 중)
const originalWarn = console.warn;
console.warn = (...args) => {
  if (!args[0]?.includes?.('Test warning')) {
    originalWarn.apply(console, args);
  }
};

// 만세력 데이터 검증을 위한 기준 데이터 설정
export const MANSERYEOK_TEST_DATA = {
  // 2024년 1월 1일 (신정) 검증 데이터
  '2024-01-01': {
    solar: { year: 2024, month: 1, day: 1 },
    lunar: { year: 2023, month: 11, day: 20, isLeapMonth: false },
    ganji: { year: '계묘', day: '신유' },
    weekDay: '월요일',
    zodiac: '물병자리'
  },
  
  // 2024년 2월 10일 (설날) 검증 데이터
  '2024-02-10': {
    solar: { year: 2024, month: 2, day: 10 },
    lunar: { year: 2024, month: 1, day: 1, isLeapMonth: false },
    ganji: { year: '갑진', day: '무인' },
    weekDay: '토요일',
    zodiac: '물병자리'
  },
  
  // 2024년 9월 17일 (추석) 검증 데이터
  '2024-09-17': {
    solar: { year: 2024, month: 9, day: 17 },
    lunar: { year: 2024, month: 8, day: 15, isLeapMonth: false },
    ganji: { year: '갑진', day: '정유' },
    weekDay: '화요일',
    zodiac: '처녀자리'
  }
};

// 테스트 완료 후 정리
afterEach(() => {
  vi.clearAllMocks();
});

beforeEach(() => {
  // 각 테스트 전에 DOM 초기화
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});