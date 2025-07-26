/**
 * 만세력 API 클라이언트 (TypeScript)
 * 점진적 마이그레이션을 위한 하이브리드 접근법
 * 
 * @version 3.0.0
 * @author doha.kr
 * 목표: 38MB → 500KB 초기 로드, API 응답 < 200ms
 */

import type { ManseryeokData, APIResponse, CacheEntry, Nullable } from '../types/global.js';

/**
 * API 클라이언트 설정 인터페이스
 */
interface ManseryeokConfig {
  apiEndpoint: string;
  cacheEnabled: boolean;
  cacheExpiry: number;
  timeout: number;
  maxRetries: number;
  fallbackToLocal: boolean;
  localDataPath: string;
}

/**
 * API 요청 페이로드 인터페이스
 */
interface ManseryeokRequest {
  action: 'getManseryeok';
  year: number;
  month: number;
  day: number;
}

/**
 * API 응답 데이터 인터페이스 (원시 형태)
 */
interface RawManseryeokData {
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth?: boolean;
  yearGanji: string;
  dayGanji: string;
  weekDay: string;
  zodiac: string;
  term?: string;
}

/**
 * 성능 메트릭 인터페이스
 */
interface ManseryeokMetrics {
  apiCalls: number;
  cacheHits: number;
  fallbackUses: number;
  averageResponseTime: number;
}

/**
 * 캐시 상태 인터페이스
 */
interface CacheStatus {
  enabled: boolean;
  size: number;
  maxSize: number;
}

/**
 * 로컬 데이터 상태 인터페이스
 */
interface LocalDataStatus {
  loaded: boolean;
  available: boolean;
}

/**
 * 상태 리포트 인터페이스
 */
interface StatusReport {
  config: ManseryeokConfig;
  metrics: ManseryeokMetrics & {
    cacheSize: number;
    successRate: string;
  };
  cacheStatus: CacheStatus;
  localDataStatus: LocalDataStatus;
}

/**
 * 만세력 API 클라이언트 클래스
 */
class ManseryeokAPIClient {
  private config: ManseryeokConfig;
  private cache: Map<string, CacheEntry<ManseryeokData>>;
  private isLocalDataLoaded: boolean;
  private localData: Record<string, RawManseryeokData> | null;
  private metrics: ManseryeokMetrics;

  constructor() {
    this.config = {
      // Vercel API 엔드포인트
      apiEndpoint: 'https://doha-kr-ap.vercel.app/api/manseryeok',
      
      // 로컬 캐시 설정
      cacheEnabled: true,
      cacheExpiry: 1000 * 60 * 60 * 24, // 24시간
      
      // 성능 설정
      timeout: 5000,
      maxRetries: 3,
      
      // 폴백 설정
      fallbackToLocal: true,
      localDataPath: '/js/manseryeok-database.js'
    };
    
    this.cache = new Map();
    this.isLocalDataLoaded = false;
    this.localData = null;
    
    // 성능 메트릭
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      fallbackUses: 0,
      averageResponseTime: 0
    };
  }

  /**
   * 만세력 데이터 조회 (메인 인터페이스)
   */
  public async getManseryeokData(year: number, month: number, day: number): Promise<ManseryeokData> {
    const startTime = performance.now();
    
    try {
      // 1차: 메모리 캐시 확인
      const cacheKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const cached = this.getCachedData(cacheKey);
      
      if (cached) {
        this.metrics.cacheHits++;
        this.logPerformance('cache_hit', performance.now() - startTime);
        return cached;
      }
      
      // 2차: API 요청 시도
      const apiResult = await this.fetchFromAPI(year, month, day);
      
      if (apiResult) {
        // API 성공 - 캐시에 저장
        this.setCachedData(cacheKey, apiResult);
        this.metrics.apiCalls++;
        this.logPerformance('api_success', performance.now() - startTime);
        return apiResult;
      }
      
      // 3차: 로컬 폴백
      const fallbackResult = await this.fallbackToLocalData(year, month, day);
      
      if (fallbackResult) {
        this.metrics.fallbackUses++;
        this.logPerformance('fallback_success', performance.now() - startTime);
        return fallbackResult;
      }
      
      throw new Error('만세력 데이터를 찾을 수 없습니다.');
      
    } catch (error) {
      this.logError('getManseryeokData', error as Error);
      this.logPerformance('error', performance.now() - startTime);
      throw error;
    }
  }

  /**
   * API에서 데이터 가져오기
   */
  private async fetchFromAPI(year: number, month: number, day: number): Promise<Nullable<ManseryeokData>> {
    try {
      const payload: ManseryeokRequest = {
        action: 'getManseryeok',
        year,
        month,
        day
      };

      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout)
      });
      
      if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status}`);
      }
      
      const data = await response.json() as APIResponse<RawManseryeokData>;
      
      if (data.success && data.data) {
        return this.normalizeAPIResponse(data.data);
      }
      
      return null;
      
    } catch (error) {
      // API 실패 시 로그만 남기고 폴백으로 진행
      this.logError('fetchFromAPI', error as Error);
      return null;
    }
  }

  /**
   * 로컬 데이터로 폴백
   */
  private async fallbackToLocalData(year: number, month: number, day: number): Promise<Nullable<ManseryeokData>> {
    try {
      // 로컬 데이터가 아직 로드되지 않았으면 로드
      if (!this.isLocalDataLoaded) {
        await this.loadLocalData();
      }
      
      if (!this.localData) {
        return null;
      }
      
      // 날짜 키 생성
      const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const result = this.localData[dateKey];
      
      if (result) {
        return this.normalizeLocalResponse(result);
      }
      
      return null;
      
    } catch (error) {
      this.logError('fallbackToLocalData', error as Error);
      return null;
    }
  }

  /**
   * 로컬 데이터 동적 로딩
   */
  private async loadLocalData(): Promise<void> {
    try {
      // 필요할 때만 로컬 데이터 로드 (지연 로딩)
      if (typeof (window as any).ManseryeokDatabase !== 'undefined') {
        this.localData = (window as any).ManseryeokDatabase;
        this.isLocalDataLoaded = true;
        return;
      }
      
      // 동적 스크립트 로딩
      const script = document.createElement('script');
      script.src = this.config.localDataPath;
      
      await new Promise<void>((resolve, reject) => {
        script.onload = () => {
          this.localData = (window as any).ManseryeokDatabase;
          this.isLocalDataLoaded = true;
          resolve();
        };
        script.onerror = () => reject(new Error('Failed to load local data'));
        document.head.appendChild(script);
      });
      
    } catch (error) {
      this.logError('loadLocalData', error as Error);
      throw error;
    }
  }

  /**
   * API 응답 정규화
   */
  private normalizeAPIResponse(data: RawManseryeokData): ManseryeokData {
    return {
      solar: {
        year: data.solarYear,
        month: data.solarMonth,
        day: data.solarDay
      },
      lunar: {
        year: data.lunarYear,
        month: data.lunarMonth,
        day: data.lunarDay,
        isLeapMonth: data.isLeapMonth || false
      },
      ganji: {
        year: data.yearGanji,
        day: data.dayGanji
      },
      weekDay: data.weekDay,
      zodiac: data.zodiac,
      term: data.term,
      source: 'api'
    };
  }

  /**
   * 로컬 응답 정규화
   */
  private normalizeLocalResponse(data: RawManseryeokData): ManseryeokData {
    return {
      solar: {
        year: data.solarYear,
        month: data.solarMonth,
        day: data.solarDay
      },
      lunar: {
        year: data.lunarYear,
        month: data.lunarMonth,
        day: data.lunarDay,
        isLeapMonth: data.isLeapMonth || false
      },
      ganji: {
        year: data.yearGanji,
        day: data.dayGanji
      },
      weekDay: data.weekDay,
      zodiac: data.zodiac,
      term: data.term,
      source: 'local'
    };
  }

  /**
   * 캐시에서 데이터 가져오기
   */
  private getCachedData(key: string): Nullable<ManseryeokData> {
    if (!this.config.cacheEnabled) return null;
    
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // 캐시 만료 확인
    if (Date.now() - cached.timestamp > this.config.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * 캐시에 데이터 저장
   */
  private setCachedData(key: string, data: ManseryeokData): void {
    if (!this.config.cacheEnabled) return;
    
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
    
    // 캐시 크기 제한 (최대 1000개)
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * 성능 로깅
   */
  private logPerformance(type: string, duration: number): void {
    if (typeof window.Analytics !== 'undefined') {
      window.Analytics.trackEvent('ManseryeokAPI', type, {
        duration: Math.round(duration),
        metrics: this.getMetrics()
      });
    }
    
    // 평균 응답 시간 업데이트
    const totalCalls = this.metrics.apiCalls + this.metrics.cacheHits + this.metrics.fallbackUses;
    if (totalCalls > 0) {
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime * (totalCalls - 1) + duration) / totalCalls;
    }
  }

  /**
   * 에러 로깅
   */
  private logError(method: string, error: Error): void {
    if (this.isDevelopmentEnvironment()) {
      console.warn(`ManseryeokAPI.${method}:`, error.message);
    }
    
    if (typeof window.Analytics !== 'undefined') {
      window.Analytics.trackEvent('ManseryeokAPI', 'error', {
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
  public getMetrics(): ManseryeokMetrics & { cacheSize: number; successRate: string } {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      successRate: this.calculateSuccessRate()
    };
  }

  /**
   * 성공률 계산
   */
  private calculateSuccessRate(): string {
    const total = this.metrics.apiCalls + this.metrics.cacheHits + this.metrics.fallbackUses;
    return total > 0 ? ((this.metrics.apiCalls + this.metrics.cacheHits) / total * 100).toFixed(2) + '%' : '0%';
  }

  /**
   * 캐시 클리어
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('ManseryeokAPI: Cache cleared');
  }

  /**
   * 상태 리포트
   */
  public getStatusReport(): StatusReport {
    return {
      config: this.config,
      metrics: this.getMetrics(),
      cacheStatus: {
        enabled: this.config.cacheEnabled,
        size: this.cache.size,
        maxSize: 1000
      },
      localDataStatus: {
        loaded: this.isLocalDataLoaded,
        available: this.localData !== null
      }
    };
  }

  /**
   * 설정 업데이트
   */
  public updateConfig(newConfig: Partial<ManseryeokConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 메트릭 초기화
   */
  public resetMetrics(): void {
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      fallbackUses: 0,
      averageResponseTime: 0
    };
  }
}

// 전역 인스턴스 생성
const manseryeokAPI = new ManseryeokAPIClient();

// 전역 객체에 추가
(window as any).ManseryeokAPI = manseryeokAPI;

// 기존 코드와의 호환성을 위한 래퍼 함수
(window as any).getManseryeokData = async function(year: number, month: number, day: number): Promise<ManseryeokData> {
  return await (window as any).ManseryeokAPI.getManseryeokData(year, month, day);
};

// 개발 도구
if (manseryeokAPI['isDevelopmentEnvironment']()) {
  (window as any).manseryeokDebug = {
    getMetrics: () => (window as any).ManseryeokAPI.getMetrics(),
    getStatus: () => (window as any).ManseryeokAPI.getStatusReport(),
    clearCache: () => (window as any).ManseryeokAPI.clearCache(),
    testAPI: async (year: number, month: number, day: number) => {
      const start = performance.now();
      const result = await (window as any).ManseryeokAPI.getManseryeokData(year, month, day);
      const end = performance.now();
      console.log('Test result:', result, `(${Math.round(end - start)}ms)`);
      return result;
    }
  };
}

export { ManseryeokAPIClient, manseryeokAPI };
export default manseryeokAPI;