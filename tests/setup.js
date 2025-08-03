/**
 * Vitest 전역 설정 파일
 * 모든 테스트 실행 전에 한 번 실행됩니다.
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// DOM 환경 설정
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
  resources: 'usable',
  runScripts: 'dangerously',
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.location = dom.window.location;
global.localStorage = dom.window.localStorage;
global.sessionStorage = dom.window.sessionStorage;

// Fetch API 모킹
global.fetch = vi.fn();

// Vi를 전역으로 노출
global.vi = vi;

// 전역 설정
beforeAll(() => {
  // 콘솔 스파이
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

// 각 테스트 전 초기화
beforeEach(() => {
  // LocalStorage 초기화
  localStorage.clear();
  sessionStorage.clear();

  // Fetch 모킹 초기화
  fetch.mockClear();

  // DOM 초기화
  document.body.innerHTML = '';
  document.head.innerHTML = '<title>Test</title>';

  // 날짜 모킹 (필요한 경우)
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-07-31T00:00:00.000Z'));

  // 전역 객체 초기화
  delete window.ErrorHandler;
  delete window.gtag;
  delete window.DohaLogger;

  // 기본 window 메서드들 모킹
  window.alert = vi.fn();
  window.confirm = vi.fn().mockReturnValue(true);
  window.prompt = vi.fn().mockReturnValue('test');
});

// 각 테스트 후 정리
afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// 전역 정리
afterAll(() => {
  dom.window.close();
});

// Mock 시스템 import (try-catch로 안전하게)
let mockHelpers, fetchMocks;
try {
  const apiMocks = await import('./mocks/api-mocks.js');
  mockHelpers = apiMocks.mockHelpers;
  fetchMocks = apiMocks.setupFetchMocks();
} catch (error) {
  console.warn('API mocks not available:', error);
  mockHelpers = {};
  fetchMocks = {};
}

// 전역 헬퍼 함수
global.createMockResponse = (data, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers({
      'content-type': 'application/json',
    }),
  });
};

// API Mock 헬퍼들을 전역으로 노출
global.mockHelpers = mockHelpers;
global.fetchMocks = fetchMocks;

// 한국어 테스트를 위한 헬퍼
global.expectKoreanText = (element, text) => {
  const normalizedElementText = element.textContent.replace(/\s+/g, ' ').trim();
  const normalizedExpectedText = text.replace(/\s+/g, ' ').trim();
  expect(normalizedElementText).toBe(normalizedExpectedText);
};

// 비동기 지연 헬퍼
global.delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 이벤트 발생 헬퍼
global.fireEvent = (element, eventType, eventData = {}) => {
  const event = new Event(eventType, { bubbles: true, cancelable: true });
  Object.assign(event, eventData);
  element.dispatchEvent(event);
};
