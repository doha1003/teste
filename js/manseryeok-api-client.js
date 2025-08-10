// Browser-compatible version - no ES6 exports
/**
 * 만세력 API 클라이언트 (TypeScript)
 * 점진적 마이그레이션을 위한 하이브리드 접근법
 *
 * @version 3.0.0
 * @author doha.kr
 * 목표: 38MB → 500KB 초기 로드, API 응답 < 200ms
 */
/**
 * 만세력 API 클라이언트 클래스
 */
class ManseryeokAPIClient {
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
      localDataPath: '/js/manseryeok-database.js',
    };
    this.cache = new Map();
    this.isLocalDataLoaded = false;
    this.localData = null;
    // 성능 메트릭
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      fallbackUses: 0,
      averageResponseTime: 0,
    };
  }
  /**
   * 만세력 데이터 조회 (메인 인터페이스)
   */
  async getManseryeokData(year, month, day) {
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
      this.logError('getManseryeokData', error);
      this.logPerformance('error', performance.now() - startTime);
      throw error;
    }
  }
  /**
   * API에서 데이터 가져오기
   */
  async fetchFromAPI(year, month, day) {
    try {
      const payload = {
        action: 'getManseryeok',
        year,
        month,
        day,
      };
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout),
      });
      if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        return this.normalizeAPIResponse(data.data);
      }
      return null;
    } catch (error) {
      // API 실패 시 로그만 남기고 폴백으로 진행
      this.logError('fetchFromAPI', error);
      return null;
    }
  }
  /**
   * 로컬 데이터로 폴백
   */
  async fallbackToLocalData(year, month, day) {
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
      this.logError('fallbackToLocalData', error);
      return null;
    }
  }
  /**
   * 로컬 데이터 동적 로딩
   */
  async loadLocalData() {
    try {
      // 필요할 때만 로컬 데이터 로드 (지연 로딩)
      if (typeof window.ManseryeokDatabase !== 'undefined') {
        this.localData = window.ManseryeokDatabase;
        this.isLocalDataLoaded = true;
        return;
      }
      // 동적 스크립트 로딩
      const script = document.createElement('script');
      script.src = this.config.localDataPath;
      await new Promise((resolve, reject) => {
        script.onload = () => {
          this.localData = window.ManseryeokDatabase;
          this.isLocalDataLoaded = true;
          resolve();
        };
        script.onerror = () => reject(new Error('Failed to load local data'));
        document.head.appendChild(script);
      });
    } catch (error) {
      this.logError('loadLocalData', error);
      throw error;
    }
  }
  /**
   * API 응답 정규화
   */
  normalizeAPIResponse(data) {
    return {
      solar: {
        year: data.solarYear,
        month: data.solarMonth,
        day: data.solarDay,
      },
      lunar: {
        year: data.lunarYear,
        month: data.lunarMonth,
        day: data.lunarDay,
        isLeapMonth: data.isLeapMonth || false,
      },
      ganji: {
        year: data.yearGanji,
        day: data.dayGanji,
      },
      weekDay: data.weekDay,
      zodiac: data.zodiac,
      term: data.term,
      source: 'api',
    };
  }
  /**
   * 로컬 응답 정규화
   */
  normalizeLocalResponse(data) {
    return {
      solar: {
        year: data.solarYear,
        month: data.solarMonth,
        day: data.solarDay,
      },
      lunar: {
        year: data.lunarYear,
        month: data.lunarMonth,
        day: data.lunarDay,
        isLeapMonth: data.isLeapMonth || false,
      },
      ganji: {
        year: data.yearGanji,
        day: data.dayGanji,
      },
      weekDay: data.weekDay,
      zodiac: data.zodiac,
      term: data.term,
      source: 'local',
    };
  }
  /**
   * 캐시에서 데이터 가져오기
   */
  getCachedData(key) {
    if (!this.config.cacheEnabled) {
      return null;
    }
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }
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
  setCachedData(key, data) {
    if (!this.config.cacheEnabled) {
      return;
    }
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
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
  logPerformance(type, duration) {
    if (typeof window.Analytics !== 'undefined') {
      window.Analytics.trackEvent('ManseryeokAPI', type, {
        duration: Math.round(duration),
        metrics: this.getMetrics(),
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
  logError(method, error) {
    if (this.isDevelopmentEnvironment()) {
    }
    if (typeof window.Analytics !== 'undefined') {
      window.Analytics.trackEvent('ManseryeokAPI', 'error', {
        method,
        error: error.message,
      });
    }
  }
  /**
   * 개발 환경 확인
   */
  isDevelopmentEnvironment() {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'file:'
    );
  }
  /**
   * 성능 메트릭 반환
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      successRate: this.calculateSuccessRate(),
    };
  }
  /**
   * 성공률 계산
   */
  calculateSuccessRate() {
    const total = this.metrics.apiCalls + this.metrics.cacheHits + this.metrics.fallbackUses;
    return total > 0
      ? `${(((this.metrics.apiCalls + this.metrics.cacheHits) / total) * 100).toFixed(2)}%`
      : '0%';
  }
  /**
   * 캐시 클리어
   */
  clearCache() {
    this.cache.clear();
  }
  /**
   * 상태 리포트
   */
  getStatusReport() {
    return {
      config: this.config,
      metrics: this.getMetrics(),
      cacheStatus: {
        enabled: this.config.cacheEnabled,
        size: this.cache.size,
        maxSize: 1000,
      },
      localDataStatus: {
        loaded: this.isLocalDataLoaded,
        available: this.localData !== null,
      },
    };
  }
  /**
   * 설정 업데이트
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  /**
   * 메트릭 초기화
   */
  resetMetrics() {
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      fallbackUses: 0,
      averageResponseTime: 0,
    };
  }
}
// 전역 인스턴스 생성
const manseryeokAPI = new ManseryeokAPIClient();
// 전역 객체에 추가
window.ManseryeokAPI = manseryeokAPI;
// 기존 코드와의 호환성을 위한 래퍼 함수
window.getManseryeokData = async function (year, month, day) {
  return await window.ManseryeokAPI.getManseryeokData(year, month, day);
};
// 개발 도구
if (manseryeokAPI['isDevelopmentEnvironment']()) {
  window.manseryeokDebug = {
    getMetrics: () => window.ManseryeokAPI.getMetrics(),
    getStatus: () => window.ManseryeokAPI.getStatusReport(),
    clearCache: () => window.ManseryeokAPI.clearCache(),
    testAPI: async (year, month, day) => {
      const start = performance.now();
      const result = await window.ManseryeokAPI.getManseryeokData(year, month, day);
      const end = performance.now();
      console.log(`[ManseryeokAPI] API call took ${(end - start).toFixed(2)}ms`);
      return result;
    },
  };
}
// export { ManseryeokAPIClient, manseryeokAPI };
// export default manseryeokAPI;
//# sourceMappingURL=manseryeok-api-client.js.map
