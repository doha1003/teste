/**
 * 에러 핸들러 모듈 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ErrorHandler', () => {
  let ErrorHandler;
  let originalConsoleError;
  let originalGtag;

  beforeEach(async () => {
    // 전역 safeHTML 함수 모킹
    global.safeHTML = (html) => html;

    // 에러 핸들러 모듈 로드
    await import('../../js/error-handler.js');
    ErrorHandler = window.ErrorHandler;

    // 에러 캐시 초기화
    ErrorHandler.clearErrorCache();

    // console.error 캡처
    originalConsoleError = console.error;
    console.error = vi.fn();

    // gtag 모킹
    originalGtag = window.gtag;
    window.gtag = vi.fn();
  });

  afterEach(() => {
    // 원래 함수들 복원
    console.error = originalConsoleError;
    window.gtag = originalGtag;

    // 생성된 노티피케이션 제거
    document.querySelectorAll('.notification').forEach((el) => el.remove());

    vi.clearAllMocks();
  });

  describe('초기화', () => {
    it('ErrorHandler가 전역에 정의되어야 함', () => {
      expect(window.ErrorHandler).toBeDefined();
      expect(window.ErrorHandler.init).toBeInstanceOf(Function);
    });

    it('초기 설정이 올바르게 되어야 함', () => {
      expect(ErrorHandler.config.maxErrorsPerSession).toBe(50);
      expect(ErrorHandler.config.retryAttempts).toBe(3);
      expect(ErrorHandler.config.retryDelay).toBe(1000);
    });
  });

  describe('handleError', () => {
    it('에러 정보를 처리해야 함', () => {
      const errorInfo = {
        type: 'javascript',
        message: 'Test error',
        filename: 'test.js',
        lineno: 10,
      };

      ErrorHandler.handleError(errorInfo);

      expect(ErrorHandler.errorCount).toBe(1);
      expect(ErrorHandler.errorCache.size).toBe(1);
    });

    it('중복 에러는 무시해야 함', () => {
      const errorInfo = {
        type: 'javascript',
        message: 'Duplicate error',
        filename: 'test.js',
        lineno: 20,
      };

      ErrorHandler.handleError(errorInfo);
      ErrorHandler.handleError(errorInfo);

      expect(ErrorHandler.errorCount).toBe(1);
      expect(ErrorHandler.errorCache.size).toBe(1);
    });

    it('최대 에러 수를 초과하면 처리하지 않아야 함', () => {
      ErrorHandler.errorCount = ErrorHandler.config.maxErrorsPerSession;

      const errorInfo = {
        type: 'javascript',
        message: 'Exceeded error',
      };

      ErrorHandler.handleError(errorInfo);

      expect(ErrorHandler.errorCount).toBe(ErrorHandler.config.maxErrorsPerSession);
    });

    it('크리티컬 에러에 대해 사용자 메시지를 표시해야 함', () => {
      const errorInfo = {
        type: 'javascript',
        message: 'Network error occurred',
      };

      ErrorHandler.handleError(errorInfo);

      const notification = document.querySelector('.notification');
      expect(notification).toBeTruthy();
      expect(notification.textContent).toContain('네트워크 연결을 확인해 주세요');
    });
  });

  describe('handleResourceError', () => {
    it('리소스 로딩 에러를 처리해야 함', () => {
      ErrorHandler.handleResourceError('image', 'test.jpg');

      expect(ErrorHandler.errorCount).toBe(1);
      const errorInfo = Array.from(ErrorHandler.errorCache)[0];
      expect(errorInfo).toContain('resource');
      expect(errorInfo).toContain('image');
    });
  });

  describe('handleImageError', () => {
    it('이미지 로딩 실패 시 플레이스홀더를 설정해야 함', () => {
      const img = document.createElement('img');
      img.src = 'broken.jpg';

      ErrorHandler.handleImageError(img);

      expect(img.dataset.errorHandled).toBe('true');
      expect(img.src).toContain('data:image/svg+xml');
      expect(img.alt).toBe('Image not found');
    });

    it('이미 처리된 이미지는 다시 처리하지 않아야 함', () => {
      const img = document.createElement('img');
      img.dataset.errorHandled = 'true';
      const originalSrc = img.src;

      ErrorHandler.handleImageError(img);

      expect(img.src).toBe(originalSrc);
    });
  });

  describe('createErrorSignature', () => {
    it('에러 시그니처를 생성해야 함', () => {
      const errorInfo = {
        type: 'javascript',
        message: 'Test error',
        filename: 'test.js',
        lineno: 10,
      };

      const signature = ErrorHandler.createErrorSignature(errorInfo);

      expect(signature).toBe('javascript_Test error_test.js_10');
    });

    it('누락된 필드는 빈 문자열로 처리해야 함', () => {
      const errorInfo = {
        type: 'promise',
        message: 'Promise error',
      };

      const signature = ErrorHandler.createErrorSignature(errorInfo);

      expect(signature).toBe('promise_Promise error__');
    });
  });

  describe('isCriticalError', () => {
    it('크리티컬 키워드가 포함된 에러를 감지해야 함', () => {
      const criticalErrors = [
        { message: 'Network connection failed' },
        { message: 'Failed to fetch data' },
        { message: 'API request failed' },
        { message: 'Security error' },
        { message: 'Permission denied' },
        { message: 'Storage quota exceeded' },
      ];

      criticalErrors.forEach((error) => {
        expect(ErrorHandler.isCriticalError(error)).toBe(true);
      });
    });

    it('일반 에러는 크리티컬로 분류하지 않아야 함', () => {
      const normalErrors = [
        { message: 'Undefined variable' },
        { message: 'Type error' },
        { message: 'Syntax error' },
      ];

      normalErrors.forEach((error) => {
        expect(ErrorHandler.isCriticalError(error)).toBe(false);
      });
    });
  });

  describe('showUserErrorMessage', () => {
    it('적절한 사용자 메시지를 표시해야 함', () => {
      const errorCases = [
        {
          message: 'network error',
          expected: '네트워크 연결을 확인해 주세요.',
        },
        {
          message: 'fetch failed',
          expected: '데이터를 불러오는 중 문제가 발생했습니다',
        },
        {
          message: 'api error',
          expected: '서비스에 일시적인 문제가 발생했습니다',
        },
        { message: 'security violation', expected: '보안 오류가 발생했습니다' },
        { message: 'permission denied', expected: '권한 오류가 발생했습니다.' },
        { message: 'quota exceeded', expected: '저장 공간이 부족합니다' },
      ];

      errorCases.forEach(({ message, expected }) => {
        ErrorHandler.showUserErrorMessage({ message });

        const notification = document.querySelector('.notification:last-child');
        expect(notification.textContent).toContain(expected);

        // 클린업
        notification.remove();
      });
    });

    it('알 수 없는 에러에 대해 기본 메시지를 표시해야 함', () => {
      ErrorHandler.showUserErrorMessage({ message: 'Unknown error' });

      const notification = document.querySelector('.notification');
      expect(notification.textContent).toContain('일시적인 오류가 발생했습니다');
    });
  });

  describe('showNotification', () => {
    it('노티피케이션을 생성해야 함', () => {
      ErrorHandler.showNotification('테스트 메시지', 'error');

      const notification = document.querySelector('.notification-error');
      expect(notification).toBeTruthy();
      expect(notification.textContent).toContain('테스트 메시지');
      expect(notification.textContent).toContain('⚠️');
    });

    it('info 타입 노티피케이션을 생성해야 함', () => {
      ErrorHandler.showNotification('정보 메시지', 'info');

      const notification = document.querySelector('.notification-info');
      expect(notification).toBeTruthy();
      expect(notification.textContent).toContain('ℹ️');
    });

    it('5초 후 자동으로 제거되어야 함', async () => {
      ErrorHandler.showNotification('임시 메시지');

      const notification = document.querySelector('.notification');
      expect(notification).toBeTruthy();

      // 시간 이동
      vi.advanceTimersByTime(5001);
      await vi.runAllTimers();

      expect(document.querySelector('.notification')).toBeFalsy();
    });
  });

  describe('sendToAnalytics', () => {
    it('gtag가 있을 때 에러를 전송해야 함', () => {
      const errorInfo = {
        type: 'javascript',
        message: 'Test error',
        filename: 'test.js',
        lineno: 10,
      };

      ErrorHandler.sendToAnalytics(errorInfo);

      expect(window.gtag).toHaveBeenCalledWith('event', 'exception', {
        description: 'Test error',
        fatal: false,
        error_type: 'javascript',
        file: 'test.js',
        line: 10,
      });
    });

    it('크리티컬 에러는 fatal로 표시해야 함', () => {
      const errorInfo = {
        type: 'javascript',
        message: 'Network error',
      };

      ErrorHandler.sendToAnalytics(errorInfo);

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'exception',
        expect.objectContaining({
          fatal: true,
        })
      );
    });

    it('analytics 에러는 무시해야 함', () => {
      window.gtag = vi.fn().mockImplementation(() => {
        throw new Error('Analytics error');
      });

      expect(() => ErrorHandler.sendToAnalytics({ message: 'test' })).not.toThrow();
    });
  });

  describe('safeExecute', () => {
    it('함수를 안전하게 실행해야 함', () => {
      const fn = vi.fn().mockReturnValue('success');
      const result = ErrorHandler.safeExecute(fn, null, [1, 2, 3]);

      expect(fn).toHaveBeenCalledWith(1, 2, 3);
      expect(result).toBe('success');
    });

    it('에러 발생 시 처리하고 null을 반환해야 함', () => {
      const fn = vi.fn().mockImplementation(() => {
        throw new Error('Function error');
      });

      const result = ErrorHandler.safeExecute(fn);

      expect(result).toBe(null);
      expect(ErrorHandler.errorCount).toBe(1);
    });
  });

  describe('safeExecuteAsync', () => {
    it('비동기 함수를 안전하게 실행해야 함', async () => {
      const asyncFn = vi.fn().mockResolvedValue('async success');
      const result = await ErrorHandler.safeExecuteAsync(asyncFn);

      expect(result).toBe('async success');
    });

    it('비동기 에러를 처리하고 null을 반환해야 함', async () => {
      const asyncFn = vi.fn().mockRejectedValue(new Error('Async error'));
      const result = await ErrorHandler.safeExecuteAsync(asyncFn);

      expect(result).toBe(null);
      expect(ErrorHandler.errorCount).toBe(1);
    });
  });

  describe('reportError', () => {
    it('수동으로 에러를 보고할 수 있어야 함', () => {
      ErrorHandler.reportError('Manual error', { extra: 'data' });

      expect(ErrorHandler.errorCount).toBe(1);
      const errorCache = Array.from(ErrorHandler.errorCache)[0];
      expect(errorCache).toContain('manual');
      expect(errorCache).toContain('Manual error');
    });
  });

  describe('getErrorStats', () => {
    it('에러 통계를 반환해야 함', () => {
      ErrorHandler.handleError({ type: 'test', message: 'Error 1' });
      ErrorHandler.handleError({ type: 'test', message: 'Error 2' });

      const stats = ErrorHandler.getErrorStats();

      expect(stats.totalErrors).toBe(2);
      expect(stats.cachedErrors).toBe(2);
      expect(stats.maxErrors).toBe(50);
    });
  });

  describe('clearErrorCache', () => {
    it('에러 캐시를 초기화해야 함', () => {
      ErrorHandler.handleError({ type: 'test', message: 'Error 1' });
      ErrorHandler.handleError({ type: 'test', message: 'Error 2' });

      ErrorHandler.clearErrorCache();

      expect(ErrorHandler.errorCount).toBe(0);
      expect(ErrorHandler.errorCache.size).toBe(0);
    });
  });
});
