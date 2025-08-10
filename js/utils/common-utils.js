/**
 * Common Utilities Module
 * doha.kr 프로젝트의 공통 유틸리티 함수들을 통합
 * 중복 제거 및 성능 최적화된 버전
 *
 * @version 2.0.0
 * @author doha.kr
 */

/**
 * 날짜 포맷팅 유틸리티
 * @param {Date|string|number} date - 포맷할 날짜
 * @param {string} format - 포맷 문자열 (YYYY-MM-DD, HH:mm 등)
 * @returns {string} 포맷된 날짜 문자열
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return format;
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year.toString())
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return format;
  }
}

/**
 * 숫자 포맷팅 (천 단위 콤마)
 * @param {number|string} num - 포맷할 숫자
 * @returns {string} 포맫된 숫자 문자열
 */
export function formatNumber(num) {
  try {
    if (num === null || num === undefined || num === '') {
      return '0';
    }
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) {
      return '0';
    }
    return number.toLocaleString('ko-KR');
  } catch (error) {
    console.warn('Number formatting error:', error);
    return '0';
  }
}

/**
 * 쓰로틀 함수 (성능 최적화된 버전)
 * @param {Function} func - 쓰로틀할 함수
 * @param {number} limit - 제한 시간 (밀리초)
 * @returns {Function} 쓰로틀된 함수
 */
export function throttle(func, limit) {
  let inThrottle;
  let lastResult;

  const throttledFunc = function (...args) {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };

  // 쓰로틀 취소 기능
  throttledFunc.cancel = () => {
    inThrottle = false;
  };

  return throttledFunc;
}

/**
 * 디바운스 함수 (성능 최적화된 버전)
 * @param {Function} func - 디바운스할 함수
 * @param {number} wait - 대기 시간 (밀리초)
 * @param {boolean} immediate - 즉시 실행 여부
 * @returns {Function} 디바운스된 함수
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  let result;

  const debouncedFunc = function (...args) {
    const later = () => {
      timeout = null;
      if (!immediate) {
        result = func.apply(this, args);
      }
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      result = func.apply(this, args);
    }

    return result;
  };

  // 디바운스 취소 기능
  debouncedFunc.cancel = () => {
    clearTimeout(timeout);
    timeout = null;
  };

  // 즉시 실행 기능
  debouncedFunc.flush = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      return func.apply(this, arguments);
    }
  };

  return debouncedFunc;
}

/**
 * 로컬 스토리지 헬퍼 (에러 처리 강화)
 */
export const storage = {
  /**
   * 데이터 저장
   * @param {string} key - 저장할 키
   * @param {any} value - 저장할 값
   * @returns {boolean} 성공 여부
   */
  set(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.warn('Storage set error:', error);
      return false;
    }
  },

  /**
   * 데이터 가져오기
   * @param {string} key - 가져올 키
   * @param {any} defaultValue - 기본값
   * @returns {any} 저장된 값 또는 기본값
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }

      try {
        return JSON.parse(item);
      } catch (parseError) {
        // JSON 파싱 실패 시 원본 문자열 반환
        return item;
      }
    } catch (error) {
      console.warn('Storage get error:', error);
      return defaultValue;
    }
  },

  /**
   * 데이터 제거
   * @param {string} key - 제거할 키
   * @returns {boolean} 성공 여부
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Storage remove error:', error);
      return false;
    }
  },

  /**
   * 모든 데이터 제거
   * @returns {boolean} 성공 여부
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Storage clear error:', error);
      return false;
    }
  },

  /**
   * 키 존재 여부 확인
   * @param {string} key - 확인할 키
   * @returns {boolean} 존재 여부
   */
  has(key) {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.warn('Storage has error:', error);
      return false;
    }
  },
};

/**
 * URL 파라미터 헬퍼
 */
export const urlParams = {
  /**
   * URL 파라미터 가져오기
   * @param {string} name - 파라미터 이름
   * @returns {string|null} 파라미터 값
   */
  get(name) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    } catch (error) {
      console.warn('URL params get error:', error);
      return null;
    }
  },

  /**
   * 모든 URL 파라미터 가져오기
   * @returns {Object} 파라미터 객체
   */
  getAll() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const params = {};
      for (const [key, value] of urlParams.entries()) {
        params[key] = value;
      }
      return params;
    } catch (error) {
      console.warn('URL params getAll error:', error);
      return {};
    }
  },

  /**
   * URL 파라미터 설정 (페이지 새로고침 없이)
   * @param {string} name - 파라미터 이름
   * @param {string} value - 파라미터 값
   */
  set(name, value) {
    try {
      const url = new URL(window.location);
      url.searchParams.set(name, value);
      window.history.replaceState({}, '', url);
    } catch (error) {
      console.warn('URL params set error:', error);
    }
  },
};

/**
 * 클립보드 헬퍼 (최신 API 사용)
 */
export const clipboard = {
  /**
   * 텍스트를 클립보드에 복사
   * @param {string} text - 복사할 텍스트
   * @returns {Promise<boolean>} 성공 여부
   */
  async copy(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // 폴백: execCommand 사용
        return this.fallbackCopy(text);
      }
    } catch (error) {
      console.warn('Clipboard copy error:', error);
      return this.fallbackCopy(text);
    }
  },

  /**
   * 폴백 클립보드 복사 (구형 브라우저 지원)
   * @param {string} text - 복사할 텍스트
   * @returns {boolean} 성공 여부
   */
  fallbackCopy(text) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (error) {
      console.warn('Fallback clipboard copy error:', error);
      return false;
    }
  },
};

/**
 * DOM 헬퍼 유틸리티
 */
export const dom = {
  /**
   * 요소가 뷰포트에 보이는지 확인
   * @param {Element} element - 확인할 요소
   * @param {number} threshold - 임계값 (0-1)
   * @returns {boolean} 보이는지 여부
   */
  isInViewport(element, threshold = 0) {
    try {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;

      const vertInView =
        rect.top <= windowHeight * (1 - threshold) &&
        rect.top + rect.height >= windowHeight * threshold;
      const horInView =
        rect.left <= windowWidth * (1 - threshold) &&
        rect.left + rect.width >= windowWidth * threshold;

      return vertInView && horInView;
    } catch (error) {
      console.warn('Viewport check error:', error);
      return false;
    }
  },

  /**
   * 부드러운 스크롤
   * @param {string|Element} target - 스크롤할 대상 선택자 또는 요소
   * @param {number} offset - 오프셋 (기본값: 0)
   */
  smoothScroll(target, offset = 0) {
    try {
      const element = typeof target === 'string' ? document.querySelector(target) : target;
      if (!element) {
        console.warn('Smooth scroll target not found:', target);
        return;
      }

      const headerHeight = document.querySelector('.dh-l-header')?.offsetHeight || 0;
      const targetPosition = element.offsetTop - headerHeight - offset;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });

      // 접근성을 위한 포커스 설정
      element.setAttribute('tabindex', '-1');
      element.focus();
    } catch (error) {
      console.warn('Smooth scroll error:', error);
    }
  },
};

/**
 * 유효성 검사 헬퍼
 */
export const validate = {
  /**
   * 이메일 유효성 검사
   * @param {string} email - 검사할 이메일
   * @returns {boolean} 유효한지 여부
   */
  email(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * 전화번호 유효성 검사 (한국 형식)
   * @param {string} phone - 검사할 전화번호
   * @returns {boolean} 유효한지 여부
   */
  phone(phone) {
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  /**
   * 한글 이름 유효성 검사
   * @param {string} name - 검사할 이름
   * @returns {boolean} 유효한지 여부
   */
  koreanName(name) {
    const nameRegex = /^[가-힣]{2,5}$/;
    return nameRegex.test(name);
  },
};

/**
 * 성능 측정 헬퍼
 */
export const performance = {
  /**
   * 함수 실행 시간 측정
   * @param {Function} func - 측정할 함수
   * @param {string} label - 레이블
   * @returns {any} 함수 실행 결과
   */
  measure(func, label = 'Function') {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    console.log(`${label} took ${end - start} milliseconds`);
    return result;
  },

  /**
   * 현재 성능 메트릭 가져오기
   * @returns {Object} 성능 메트릭
   */
  getMetrics() {
    try {
      const navigation = window.performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
        renderTime: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
        interactionTime: navigation ? navigation.domInteractive - navigation.fetchStart : 0,
        memoryUsage: window.performance.memory?.usedJSHeapSize || 0,
        networkRequests: window.performance.getEntriesByType('resource').length,
      };
    } catch (error) {
      console.warn('Performance metrics error:', error);
      return {};
    }
  },
};

// 전역 호환성을 위한 폴백 (기존 코드와의 호환성 유지)
if (typeof window !== 'undefined') {
  // 기존 전역 함수들을 새로운 모듈로 점진적 마이그레이션
  window.formatDate = formatDate;
  window.formatNumber = formatNumber;
  window.throttle = throttle;
  window.debounce = debounce;

  // 새로운 유틸리티도 전역으로 노출 (선택적)
  window.CommonUtils = {
    formatDate,
    formatNumber,
    throttle,
    debounce,
    storage,
    urlParams,
    clipboard,
    dom,
    validate,
    performance,
  };
}

export default {
  formatDate,
  formatNumber,
  throttle,
  debounce,
  storage,
  urlParams,
  clipboard,
  dom,
  validate,
  performance,
};
