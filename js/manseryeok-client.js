// Manseryeok API Client
// 만세력 API 클라이언트 - 서버에서 데이터를 가져오는 모듈

class ManseryeokClient {
  constructor() {
    // API 엔드포인트 설정
    this.apiUrl =
      window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api/manseryeok'
        : 'https://doha-kr-api.vercel.app/api/manseryeok';

    // 캐시 설정 (메모리 캐시)
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24시간
  }

  // 캐시 키 생성
  getCacheKey(year, month, day, hour = null) {
    return `${year}-${month}-${day}${hour !== null ? `-${hour}` : ''}`;
  }

  // 캐시에서 데이터 가져오기
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    // 만료 확인
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // 캐시에 데이터 저장
  saveToCache(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheExpiry,
    });
  }

  // 단일 날짜 조회
  async getDate(year, month, day, hour = null) {
    const cacheKey = this.getCacheKey(year, month, day, hour);

    // 캐시 확인
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // API 호출
      const params = new URLSearchParams({
        year,
        month,
        day,
      });

      if (hour !== null) {
        params.append('hour', hour);
      }

      const response = await fetch(`${this.apiUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // 캐시 저장
        this.saveToCache(cacheKey, result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      // 폴백: 로컬 데이터 사용 (있는 경우)
      if (window.getManseryeokData) {
        return window.getManseryeokData(year, month, day);
      }

      throw error;
    }
  }

  // 여러 날짜 일괄 조회
  async getDates(dates) {
    // 캐시되지 않은 날짜만 필터링
    const uncachedDates = [];
    const results = new Map();

    for (const date of dates) {
      const cacheKey = this.getCacheKey(date.year, date.month, date.day, date.hour);
      const cached = this.getFromCache(cacheKey);

      if (cached) {
        results.set(cacheKey, cached);
      } else {
        uncachedDates.push(date);
      }
    }

    // 캐시되지 않은 날짜가 있으면 API 호출
    if (uncachedDates.length > 0) {
      try {
        const response = await fetch(`${this.apiUrl}/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dates: uncachedDates }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          // 결과를 캐시에 저장하고 반환 맵에 추가
          result.data.forEach((data, index) => {
            if (!data.error) {
              const date = uncachedDates[index];
              const cacheKey = this.getCacheKey(date.year, date.month, date.day, date.hour);
              this.saveToCache(cacheKey, data);
              results.set(cacheKey, data);
            }
          });
        }
      } catch (error) {
        // 개별 조회로 폴백
        for (const date of uncachedDates) {
          try {
            const data = await this.getDate(date.year, date.month, date.day, date.hour);
            const cacheKey = this.getCacheKey(date.year, date.month, date.day, date.hour);
            results.set(cacheKey, data);
          } catch (err) {}
        }
      }
    }

    // 결과를 원래 순서대로 정렬
    return dates.map((date) => {
      const cacheKey = this.getCacheKey(date.year, date.month, date.day, date.hour);
      return results.get(cacheKey) || null;
    });
  }

  // 캐시 초기화
  clearCache() {
    this.cache.clear();
  }

  // 캐시 크기 확인
  getCacheSize() {
    return this.cache.size;
  }
}

// 전역 인스턴스 생성
window.manseryeokClient = new ManseryeokClient();

// 기존 getManseryeokData 함수 대체
window.getManseryeokDataAsync = async function (year, month, day) {
  try {
    return await window.manseryeokClient.getDate(year, month, day);
  } catch (error) {
    return null;
  }
};

// 동기 버전 (기존 코드 호환성을 위해)
window.getManseryeokData = function (year, month, day) {
  // 캐시 확인
  const cacheKey = window.manseryeokClient.getCacheKey(year, month, day);
  const cached = window.manseryeokClient.getFromCache(cacheKey);

  if (cached) {
    return cached;
  }

  // 동기 호출은 캐시된 데이터만 반환
  return null;
};
