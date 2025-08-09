/**
 * 만세력 최적화된 로더
 * 34MB 파일을 필요할 때만 로드하도록 변경
 */

class ManseryeokOptimizedLoader {
  constructor() {
    this.cache = new Map();
    this.loading = false;
    this.loadPromise = null;
    this.initialized = false;
  }

  /**
   * API를 통해 날짜 데이터 가져오기
   */
  async getDateData(dateString) {
    // 캐시 확인
    if (this.cache.has(dateString)) {
      return this.cache.get(dateString);
    }

    try {
      // API 호출로 변경 (서버에서 처리)
      const response = await fetch('/api/manseryeok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: dateString })
      });

      if (!response.ok) {
        throw new Error('만세력 API 오류');
      }

      const data = await response.json();
      
      // 캐시에 저장
      if (data) {
        this.cache.set(dateString, data);
      }

      return data;
    } catch (error) {
      
      // 폴백: 현재 날짜 기준으로 대략적인 음력 계산
      return this.fallbackCalculation(dateString);
    }
  }

  /**
   * 폴백: 간단한 음력 계산 (정확도 낮음)
   */
  fallbackCalculation(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 간단한 음력 변환 (실제로는 매우 복잡함)
    // 이것은 임시 폴백일 뿐입니다
    const lunarYear = year;
    const lunarMonth = month;
    const lunarDay = day;

    // 60갑자 계산
    const heavenlyStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
    const earthlyBranches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
    const zodiacAnimals = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];

    const yearIndex = (year - 4) % 60;
    const yearStem = heavenlyStems[yearIndex % 10];
    const yearBranch = earthlyBranches[yearIndex % 12];
    const zodiac = zodiacAnimals[yearIndex % 12];

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekDay = weekDays[date.getDay()];

    return {
      solarYear: year,
      solarMonth: month,
      solarDay: day,
      lunarYear: lunarYear,
      lunarMonth: lunarMonth,
      lunarDay: lunarDay,
      yearGanji: yearStem + yearBranch,
      dayGanji: '계산중',
      weekDay: weekDay,
      zodiac: zodiac,
      isLeapMonth: false,
      isFallback: true // 폴백 데이터임을 표시
    };
  }

  /**
   * 날짜 범위 데이터 가져오기 (API 사용)
   */
  async getDateRange(startDate, endDate) {
    try {
      const response = await fetch('/api/manseryeok/range', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ startDate, endDate })
      });

      if (!response.ok) {
        throw new Error('만세력 범위 API 오류');
      }

      return await response.json();
    } catch (error) {
      
      return {};
    }
  }

  /**
   * 특정 연도 데이터 가져오기
   */
  async getYearData(year) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    return this.getDateRange(startDate, endDate);
  }
}

// 전역 인스턴스 생성
window.ManseryeokDatabase = new ManseryeokOptimizedLoader();

// 하위 호환성을 위한 프록시 설정
window.ManseryeokDatabase = new Proxy(window.ManseryeokDatabase, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    
    // 기존 코드가 직접 날짜를 접근하려고 할 때
    if (typeof prop === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(prop)) {
      console.warn('ManseryeokDatabase: 직접 날짜 키 접근 대신 비동기 메서드 사용을 권장합니다.');
      // 비동기를 동기로 변환할 수 없으므로 null 반환
      return null;
    }
    
    return undefined;
  }
});

