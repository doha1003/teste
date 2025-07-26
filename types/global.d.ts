/**
 * doha.kr 프로젝트 전역 타입 정의
 * TypeScript 전환을 위한 기본 타입들
 */

// 전역 변수들
declare global {
  interface Window {
    // API 설정
    API_CONFIG: {
      gemini: {
        endpoint: string;
        timeout: number;
      };
      kakao: {
        appKey: string;
      };
      KAKAO_JS_KEY: string;
      adsense: {
        client: string;
      };
      VERCEL_API_BASE: string;
    };
    
    // 카카오 SDK
    Kakao: any;
    
    // Google AdSense
    adsbygoogle: any[];
    
    // 성능 최적화 시스템 (구체적 타입은 각 모듈에서 선언)
    BundleOptimizer?: any;
    ImageOptimizer?: any;
    ManseryeokAPI?: any;
    performanceOptimizer?: any;
    imageOptimizerDebug?: any;
    manseryeokDebug?: any;
    bundleOptimizerDebug?: any;
    
    // DohaApp 시스템 (기존 호환성)
    DohaApp?: {
      init?: () => void;
      components?: {
        mobileMenu?: { toggle: () => void };
        tabs?: { filterServices: (category: string) => void };
      };
      utils?: {
        throttle?: <T extends (...args: any[]) => any>(func: T, limit: number) => T;
        debounce?: <T extends (...args: any[]) => any>(func: T, wait: number) => (...args: Parameters<T>) => void;
        storage?: any;
      };
    };
    
    // 보안 DOM 조작
    SecureDOM?: {
      setInnerHTML: (element: Element, html: string) => void;
    };
    
    // 편의 함수들
    loadModule: (moduleName: string) => Promise<any>;
    requireModule: (moduleName: string) => Promise<any>;
    getManseryeokData: (year: number, month: number, day: number) => Promise<ManseryeokData>;
    
    // 애널리틱스
    Analytics?: any;
    gtag?: (...args: any[]) => void;
    
    // 개발 도구
    bundleOptimizerDebug?: any;
    imageOptimizerDebug?: any;
    manseryeokDebug?: any;
    
    // 기타 전역 변수들
    userDataManager?: any;
    analyticsDashboard?: any;
    performanceOptimizer?: any;
    csrfToken?: string;
    KAKAO_APP_KEY?: string;
    
    // PWA
    navigator: Navigator & {
      standalone?: boolean;
    };
  }
}

// 공통 유틸리티 타입들
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// 이벤트 타입들
export interface CustomEventData {
  type: string;
  data?: any;
  timestamp?: number;
}

// 성능 메트릭 타입들
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  networkRequests: number;
}

// API 응답 기본 타입
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: number;
}

// 캐시 관련 타입들
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiry?: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultExpiry: number;
  enabled: boolean;
}

// 만세력 데이터 타입들
export interface ManseryeokData {
  solar: {
    year: number;
    month: number;
    day: number;
  };
  lunar: {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
  };
  ganji: {
    year: string;
    day: string;
  };
  weekDay: string;
  zodiac: string;
  term?: string;
  source: 'api' | 'local' | 'cache';
}

// MBTI 관련 타입들
export type MBTIType = 
  | 'ENFJ' | 'ENFP' | 'ENTJ' | 'ENTP'
  | 'ESFJ' | 'ESFP' | 'ESTJ' | 'ESTP'
  | 'INFJ' | 'INFP' | 'INTJ' | 'INTP'
  | 'ISFJ' | 'ISFP' | 'ISTJ' | 'ISTP';

export interface MBTIQuestion {
  id: number;
  question: string;
  options: [string, string];
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
}

export interface MBTIResult {
  type: MBTIType;
  scores: {
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  };
  confidence: number;
  description: string;
}

// 테토-에겐 관련 타입들
export type TetoEgenType = 'teto' | 'egen';

export interface TetoEgenQuestion {
  id: number;
  question: string;
  options: [string, string];
  type: 'teto' | 'egen';
}

export interface TetoEgenResult {
  type: TetoEgenType;
  score: number;
  confidence: number;
  description: string;
}

// 러브 DNA 관련 타입들
export interface LoveDNADimension {
  name: string;
  score: number;
  description: string;
}

export interface LoveDNAResult {
  dimensions: LoveDNADimension[];
  overallType: string;
  compatibility: string[];
  description: string;
}

// 운세 관련 타입들
export interface FortuneRequest {
  type: 'daily' | 'saju' | 'tarot' | 'zodiac' | 'zodiac-animal';
  birthDate?: Date;
  question?: string;
  zodiacSign?: string;
  zodiacAnimal?: string;
}

export interface FortuneResult {
  type: string;
  content: string;
  lucky: {
    color?: string;
    number?: number;
    direction?: string;
  };
  advice: string;
  rating: number;
  generated: Date;
}

// 이미지 최적화 관련 타입들
export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  lazy?: boolean;
}

export interface ImageMetrics {
  originalSize: number;
  optimizedSize: number;
  savings: number;
  loadTime: number;
  format: string;
}

// 번들 최적화 관련 타입들
export interface ModuleConfig {
  name: string;
  url: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  dependencies?: string[];
  size?: number;
}

export interface BundleMetrics {
  totalModules: number;
  loadedModules: number;
  totalSize: number;
  savings: number;
  loadTime: number;
}

// DOM 보안 관련 타입들
export interface SecurityConfig {
  allowedTags: string[];
  allowedAttributes: string[];
  sanitizeOptions: any;
}

export interface SecurityViolation {
  type: 'xss' | 'injection' | 'unauthorized';
  element: string;
  content: string;
  blocked: boolean;
  timestamp: Date;
}

// 유틸리티 함수 타입들
export type EventHandler<T = Event> = (event: T) => void | Promise<void>;
export type AsyncFunction<T = any, R = any> = (args: T) => Promise<R>;
export type ThrottledFunction<T extends (...args: any[]) => any> = T & {
  cancel: () => void;
};

// 에러 타입들
export interface ApplicationErrorInterface extends Error {
  code?: string;
  details?: any;
  timestamp?: Date;
  context?: string;
}

export class ApplicationError extends Error implements ApplicationErrorInterface {
  code?: string;
  details?: any;
  timestamp?: Date;
  context?: string;

  constructor(message: string, options?: { cause?: any; code?: string; details?: any; context?: string }) {
    super(message);
    this.name = 'ApplicationError';
    this.code = options?.code;
    this.details = options?.details;
    this.context = options?.context;
    this.timestamp = new Date();
    
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

// 설정 타입들
export interface AppConfig {
  version: string;
  environment: 'development' | 'production' | 'test';
  features: {
    analytics: boolean;
    adsense: boolean;
    pwa: boolean;
    darkMode: boolean;
  };
  performance: {
    lazyLoading: boolean;
    bundleOptimization: boolean;
    imageOptimization: boolean;
    caching: boolean;
  };
  security: {
    domSanitization: boolean;
    cspEnabled: boolean;
    xssProtection: boolean;
  };
}

export {};