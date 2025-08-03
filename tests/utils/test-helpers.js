/**
 * 테스트 유틸리티 함수 모음
 */

import { vi } from 'vitest';

/**
 * API 응답 모킹 헬퍼
 */
export const mockApiResponse = (url, response, options = {}) => {
  const { status = 200, delay = 0, headers = {} } = options;

  global.fetch.mockImplementationOnce((fetchUrl) => {
    if (fetchUrl.includes(url)) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: status >= 200 && status < 300,
            status,
            headers: new Headers({
              'content-type': 'application/json',
              ...headers,
            }),
            json: () => Promise.resolve(response),
            text: () => Promise.resolve(JSON.stringify(response)),
          });
        }, delay);
      });
    }
    return Promise.reject(new Error(`Unexpected URL: ${fetchUrl}`));
  });
};

/**
 * LocalStorage 모킹 헬퍼
 */
export const mockLocalStorage = (data = {}) => {
  const storage = {
    ...data,
  };

  global.localStorage.getItem = vi.fn((key) => storage[key] || null);
  global.localStorage.setItem = vi.fn((key, value) => {
    storage[key] = value;
  });
  global.localStorage.removeItem = vi.fn((key) => {
    delete storage[key];
  });
  global.localStorage.clear = vi.fn(() => {
    Object.keys(storage).forEach((key) => delete storage[key]);
  });

  return storage;
};

/**
 * DOM 요소 생성 헬퍼
 */
export const createTestElement = (html) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
};

/**
 * 폼 데이터 생성 헬퍼
 */
export const createFormData = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

/**
 * 이벤트 대기 헬퍼
 */
export const waitForEvent = (element, eventType, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for ${eventType} event`));
    }, timeout);

    const handler = (event) => {
      clearTimeout(timer);
      element.removeEventListener(eventType, handler);
      resolve(event);
    };

    element.addEventListener(eventType, handler);
  });
};

/**
 * 비동기 렌더링 대기 헬퍼
 */
export const waitForRender = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};

/**
 * 한국어 날짜 포맷 검증 헬퍼
 */
export const expectKoreanDateFormat = (dateString) => {
  const pattern = /^\d{4}년 \d{1,2}월 \d{1,2}일/;
  expect(dateString).toMatch(pattern);
};

/**
 * 테마 변경 시뮬레이션
 */
export const simulateThemeChange = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  window.dispatchEvent(new Event('theme-changed'));
};

/**
 * API 에러 응답 모킹
 */
export const mockApiError = (url, status = 500, message = 'Internal Server Error') => {
  global.fetch.mockImplementationOnce((fetchUrl) => {
    if (fetchUrl.includes(url)) {
      return Promise.resolve({
        ok: false,
        status,
        statusText: message,
        json: () => Promise.resolve({ error: message }),
        text: () => Promise.resolve(message),
      });
    }
  });
};

/**
 * 네트워크 오류 시뮬레이션
 */
export const mockNetworkError = (url) => {
  global.fetch.mockImplementationOnce((fetchUrl) => {
    if (fetchUrl.includes(url)) {
      return Promise.reject(new Error('Network error'));
    }
  });
};

/**
 * 쿠키 모킹 헬퍼
 */
export const mockCookie = {
  set: (name, value, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },

  get: (name) => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length);
      }
    }
    return null;
  },

  clear: () => {
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  },
};
