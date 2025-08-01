/**
 * 이벤트 버스 시스템 테스트
 * 컴포넌트 간 통신을 위한 이벤트 시스템을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Event Bus Mock Implementation
class EventBus {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Set();
    this.maxListeners = 10;
  }

  // 이벤트 리스너 등록
  on(eventName, listener, options = {}) {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }

    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    const listeners = this.events.get(eventName);
    
    // 최대 리스너 수 확인
    if (listeners.length >= this.maxListeners) {
      console.warn(`Maximum listeners (${this.maxListeners}) exceeded for event: ${eventName}`);
    }

    const listenerInfo = {
      fn: listener,
      once: options.once || false,
      priority: options.priority || 0,
      context: options.context || null
    };

    listeners.push(listenerInfo);
    
    // 우선순위에 따라 정렬 (높은 숫자가 먼저 실행)
    listeners.sort((a, b) => b.priority - a.priority);

    return this;
  }

  // 일회성 이벤트 리스너 등록
  once(eventName, listener, options = {}) {
    return this.on(eventName, listener, { ...options, once: true });
  }

  // 이벤트 발생
  emit(eventName, ...args) {
    if (!this.events.has(eventName)) {
      return false;
    }

    const listeners = this.events.get(eventName).slice(); // 복사본 생성
    let hasListeners = false;

    for (let i = 0; i < listeners.length; i++) {
      const listenerInfo = listeners[i];
      hasListeners = true;

      try {
        if (listenerInfo.context) {
          listenerInfo.fn.apply(listenerInfo.context, args);
        } else {
          listenerInfo.fn(...args);
        }
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }

      // once 리스너는 실행 후 제거
      if (listenerInfo.once) {
        this.off(eventName, listenerInfo.fn);
      }
    }

    return hasListeners;
  }

  // 이벤트 리스너 제거
  off(eventName, listener) {
    if (!this.events.has(eventName)) {
      return this;
    }

    if (!listener) {
      // 리스너가 없으면 해당 이벤트의 모든 리스너 제거
      this.events.delete(eventName);
      return this;
    }

    const listeners = this.events.get(eventName);
    const index = listeners.findIndex(l => l.fn === listener);
    
    if (index !== -1) {
      listeners.splice(index, 1);
      
      // 리스너가 없으면 이벤트 완전 제거
      if (listeners.length === 0) {
        this.events.delete(eventName);
      }
    }

    return this;
  }

  // 모든 이벤트 리스너 제거
  removeAllListeners(eventName) {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
    return this;
  }

  // 이벤트 리스너 목록 조회
  listeners(eventName) {
    if (!this.events.has(eventName)) {
      return [];
    }
    return this.events.get(eventName).map(l => l.fn);
  }

  // 이벤트 리스너 수 조회
  listenerCount(eventName) {
    if (!this.events.has(eventName)) {
      return 0;
    }
    return this.events.get(eventName).length;
  }

  // 등록된 이벤트 이름 목록
  eventNames() {
    return Array.from(this.events.keys());
  }

  // 최대 리스너 수 설정
  setMaxListeners(n) {
    this.maxListeners = n;
    return this;
  }

  // 최대 리스너 수 조회
  getMaxListeners() {
    return this.maxListeners;
  }

  // 네임스페이스 지원
  namespace(name) {
    return new NamespacedEventBus(this, name);
  }
}

// 네임스페이스 이벤트 버스
class NamespacedEventBus {
  constructor(eventBus, namespace) {
    this.eventBus = eventBus;
    this.namespace = namespace;
  }

  _getEventName(eventName) {
    return `${this.namespace}:${eventName}`;
  }

  on(eventName, listener, options = {}) {
    return this.eventBus.on(this._getEventName(eventName), listener, options);
  }

  once(eventName, listener, options = {}) {
    return this.eventBus.once(this._getEventName(eventName), listener, options);
  }

  emit(eventName, ...args) {
    return this.eventBus.emit(this._getEventName(eventName), ...args);
  }

  off(eventName, listener) {
    return this.eventBus.off(this._getEventName(eventName), listener);
  }

  removeAllListeners(eventName) {
    if (eventName) {
      return this.eventBus.removeAllListeners(this._getEventName(eventName));
    } else {
      // 네임스페이스의 모든 이벤트 제거
      const allEvents = this.eventBus.eventNames();
      const namespaceEvents = allEvents.filter(name => name.startsWith(`${this.namespace}:`));
      namespaceEvents.forEach(name => this.eventBus.removeAllListeners(name));
      return this.eventBus;
    }
  }

  listeners(eventName) {
    return this.eventBus.listeners(this._getEventName(eventName));
  }

  listenerCount(eventName) {
    return this.eventBus.listenerCount(this._getEventName(eventName));
  }
}

describe('Event Bus System', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  afterEach(() => {
    eventBus.removeAllListeners();
  });

  describe('기본 이벤트 등록 및 발생', () => {
    it('이벤트 리스너를 등록하고 실행할 수 있어야 함', () => {
      const listener = vi.fn();
      
      eventBus.on('test-event', listener);
      eventBus.emit('test-event', 'test-data');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('test-data');
    });

    it('여러 개의 인자를 전달할 수 있어야 함', () => {
      const listener = vi.fn();
      
      eventBus.on('multi-args', listener);
      eventBus.emit('multi-args', 'arg1', 'arg2', 'arg3');

      expect(listener).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('존재하지 않는 이벤트 발생 시 false를 반환해야 함', () => {
      const result = eventBus.emit('non-existent-event');
      expect(result).toBe(false);
    });

    it('리스너가 있는 이벤트 발생 시 true를 반환해야 함', () => {
      eventBus.on('existing-event', () => {});
      const result = eventBus.emit('existing-event');
      expect(result).toBe(true);
    });
  });

  describe('여러 리스너 관리', () => {
    it('같은 이벤트에 여러 리스너를 등록할 수 있어야 함', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      eventBus.on('multi-listener', listener1);
      eventBus.on('multi-listener', listener2);
      eventBus.on('multi-listener', listener3);

      eventBus.emit('multi-listener', 'data');

      expect(listener1).toHaveBeenCalledWith('data');
      expect(listener2).toHaveBeenCalledWith('data');
      expect(listener3).toHaveBeenCalledWith('data');
    });

    it('리스너 실행 순서가 우선순위에 따라 결정되어야 함', () => {
      const executionOrder = [];
      
      const listener1 = () => executionOrder.push('listener1');
      const listener2 = () => executionOrder.push('listener2');
      const listener3 = () => executionOrder.push('listener3');

      eventBus.on('priority-test', listener1, { priority: 1 });
      eventBus.on('priority-test', listener2, { priority: 3 });
      eventBus.on('priority-test', listener3, { priority: 2 });

      eventBus.emit('priority-test');

      expect(executionOrder).toEqual(['listener2', 'listener3', 'listener1']);
    });

    it('리스너 수를 조회할 수 있어야 함', () => {
      eventBus.on('count-test', () => {});
      eventBus.on('count-test', () => {});
      eventBus.on('count-test', () => {});

      expect(eventBus.listenerCount('count-test')).toBe(3);
      expect(eventBus.listenerCount('non-existent')).toBe(0);
    });
  });

  describe('일회성 이벤트 리스너', () => {
    it('once 리스너는 한 번만 실행되어야 함', () => {
      const listener = vi.fn();
      
      eventBus.once('once-event', listener);
      
      eventBus.emit('once-event', 'first');
      eventBus.emit('once-event', 'second');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('first');
    });

    it('once 리스너는 실행 후 자동으로 제거되어야 함', () => {
      eventBus.once('auto-remove', () => {});
      
      expect(eventBus.listenerCount('auto-remove')).toBe(1);
      
      eventBus.emit('auto-remove');
      
      expect(eventBus.listenerCount('auto-remove')).toBe(0);
    });

    it('on과 once 리스너를 함께 사용할 수 있어야 함', () => {
      const onListener = vi.fn();
      const onceListener = vi.fn();

      eventBus.on('mixed-listeners', onListener);
      eventBus.once('mixed-listeners', onceListener);

      eventBus.emit('mixed-listeners');
      eventBus.emit('mixed-listeners');

      expect(onListener).toHaveBeenCalledTimes(2);
      expect(onceListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('리스너 제거', () => {
    it('특정 리스너를 제거할 수 있어야 함', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventBus.on('remove-test', listener1);
      eventBus.on('remove-test', listener2);

      eventBus.off('remove-test', listener1);
      eventBus.emit('remove-test');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('이벤트의 모든 리스너를 제거할 수 있어야 함', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventBus.on('remove-all-test', listener1);
      eventBus.on('remove-all-test', listener2);

      eventBus.off('remove-all-test');
      eventBus.emit('remove-all-test');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
      expect(eventBus.listenerCount('remove-all-test')).toBe(0);
    });

    it('모든 이벤트의 모든 리스너를 제거할 수 있어야 함', () => {
      eventBus.on('event1', () => {});
      eventBus.on('event2', () => {});
      eventBus.on('event3', () => {});

      expect(eventBus.eventNames()).toHaveLength(3);

      eventBus.removeAllListeners();

      expect(eventBus.eventNames()).toHaveLength(0);
    });
  });

  describe('컨텍스트 바인딩', () => {
    it('리스너를 특정 컨텍스트로 실행할 수 있어야 함', () => {
      const context = { name: 'test-context', value: 42 };
      const listener = function(data) {
        expect(this).toBe(context);
        expect(this.name).toBe('test-context');
        expect(this.value).toBe(42);
      };

      eventBus.on('context-test', listener, { context });
      eventBus.emit('context-test', 'data');
    });
  });

  describe('에러 처리', () => {
    it('리스너에서 발생한 에러가 다른 리스너 실행을 방해하지 않아야 함', () => {
      const workingListener = vi.fn();
      const errorListener = () => {
        throw new Error('Test error');
      };

      vi.spyOn(console, 'error').mockImplementation(() => {});

      eventBus.on('error-test', errorListener);
      eventBus.on('error-test', workingListener);

      eventBus.emit('error-test');

      expect(workingListener).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('잘못된 리스너 타입은 에러를 발생시켜야 함', () => {
      expect(() => {
        eventBus.on('invalid-listener', 'not a function');
      }).toThrow('Listener must be a function');
    });
  });

  describe('최대 리스너 수 제한', () => {
    it('최대 리스너 수를 설정하고 조회할 수 있어야 함', () => {
      eventBus.setMaxListeners(5);
      expect(eventBus.getMaxListeners()).toBe(5);
    });

    it('최대 리스너 수 초과 시 경고를 출력해야 함', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      eventBus.setMaxListeners(2);
      
      eventBus.on('max-test', () => {});
      eventBus.on('max-test', () => {});
      eventBus.on('max-test', () => {}); // 초과

      expect(console.warn).toHaveBeenCalledWith(
        'Maximum listeners (2) exceeded for event: max-test'
      );
    });
  });

  describe('이벤트 정보 조회', () => {
    it('등록된 이벤트 이름 목록을 조회할 수 있어야 함', () => {
      eventBus.on('event-a', () => {});
      eventBus.on('event-b', () => {});
      eventBus.on('event-c', () => {});

      const eventNames = eventBus.eventNames();
      expect(eventNames).toContain('event-a');
      expect(eventNames).toContain('event-b');
      expect(eventNames).toContain('event-c');
      expect(eventNames).toHaveLength(3);
    });

    it('특정 이벤트의 리스너 목록을 조회할 수 있어야 함', () => {
      const listener1 = () => {};
      const listener2 = () => {};

      eventBus.on('listeners-test', listener1);
      eventBus.on('listeners-test', listener2);

      const listeners = eventBus.listeners('listeners-test');
      expect(listeners).toContain(listener1);
      expect(listeners).toContain(listener2);
      expect(listeners).toHaveLength(2);
    });
  });

  describe('네임스페이스 지원', () => {
    it('네임스페이스를 생성할 수 있어야 함', () => {
      const testNamespace = eventBus.namespace('test');
      expect(testNamespace).toBeInstanceOf(NamespacedEventBus);
    });

    it('네임스페이스별로 이벤트를 분리할 수 있어야 함', () => {
      const globalListener = vi.fn();
      const testListener = vi.fn();
      const adminListener = vi.fn();

      const testNamespace = eventBus.namespace('test');
      const adminNamespace = eventBus.namespace('admin');

      eventBus.on('message', globalListener);
      testNamespace.on('message', testListener);
      adminNamespace.on('message', adminListener);

      // 전역 이벤트 발생
      eventBus.emit('message', 'global');
      expect(globalListener).toHaveBeenCalledWith('global');
      expect(testListener).not.toHaveBeenCalled();
      expect(adminListener).not.toHaveBeenCalled();

      // 테스트 네임스페이스 이벤트 발생
      testNamespace.emit('message', 'test');
      expect(testListener).toHaveBeenCalledWith('test');
      expect(adminListener).not.toHaveBeenCalled();

      // 어드민 네임스페이스 이벤트 발생
      adminNamespace.emit('message', 'admin');
      expect(adminListener).toHaveBeenCalledWith('admin');
    });

    it('네임스페이스의 모든 이벤트를 제거할 수 있어야 함', () => {
      const testNamespace = eventBus.namespace('test');
      
      testNamespace.on('event1', () => {});
      testNamespace.on('event2', () => {});
      eventBus.on('global-event', () => {});

      expect(eventBus.eventNames()).toHaveLength(3);

      testNamespace.removeAllListeners();

      const remainingEvents = eventBus.eventNames();
      expect(remainingEvents).toContain('global-event');
      expect(remainingEvents).not.toContain('test:event1');
      expect(remainingEvents).not.toContain('test:event2');
    });
  });

  describe('실제 사용 시나리오', () => {
    it('테스트 진행 상태 이벤트를 처리할 수 있어야 함', () => {
      const progressListener = vi.fn();
      const completeListener = vi.fn();

      eventBus.on('test:progress', progressListener);
      eventBus.once('test:complete', completeListener);

      // 테스트 진행
      eventBus.emit('test:progress', { step: 1, total: 10 });
      eventBus.emit('test:progress', { step: 5, total: 10 });
      eventBus.emit('test:progress', { step: 10, total: 10 });
      
      // 테스트 완료
      eventBus.emit('test:complete', { type: 'mbti', result: 'ENFP' });
      eventBus.emit('test:complete', { type: 'love-dna', result: 'Type A' }); // 무시됨

      expect(progressListener).toHaveBeenCalledTimes(3);
      expect(completeListener).toHaveBeenCalledTimes(1);
      expect(completeListener).toHaveBeenCalledWith({ type: 'mbti', result: 'ENFP' });
    });

    it('테마 변경 이벤트를 처리할 수 있어야 함', () => {
      const themeListener = vi.fn();
      const storageListener = vi.fn();

      eventBus.on('theme:change', themeListener);
      eventBus.on('theme:change', storageListener);

      eventBus.emit('theme:change', { 
        from: 'light', 
        to: 'dark',
        timestamp: new Date().toISOString()
      });

      expect(themeListener).toHaveBeenCalled();
      expect(storageListener).toHaveBeenCalled();
      
      const [eventData] = themeListener.mock.calls[0];
      expect(eventData.from).toBe('light');
      expect(eventData.to).toBe('dark');
    });

    it('API 요청 상태 이벤트를 처리할 수 있어야 함', () => {
      const loadingListener = vi.fn();
      const errorListener = vi.fn();
      const successListener = vi.fn();

      eventBus.on('api:loading', loadingListener);
      eventBus.on('api:error', errorListener);
      eventBus.on('api:success', successListener);

      // API 요청 시작
      eventBus.emit('api:loading', { endpoint: '/api/fortune' });
      
      // API 에러 발생
      eventBus.emit('api:error', { 
        endpoint: '/api/fortune',
        error: 'Network error',
        status: 500 
      });

      expect(loadingListener).toHaveBeenCalledWith({ endpoint: '/api/fortune' });
      expect(errorListener).toHaveBeenCalledWith({
        endpoint: '/api/fortune',
        error: 'Network error',
        status: 500
      });
      expect(successListener).not.toHaveBeenCalled();
    });

    it('사용자 인터랙션 이벤트를 추적할 수 있어야 함', () => {
      const analyticsListener = vi.fn();
      
      eventBus.on('user:interaction', analyticsListener);

      // 버튼 클릭
      eventBus.emit('user:interaction', {
        type: 'click',
        element: 'start-test-button',
        testType: 'mbti'
      });

      // 폼 제출
      eventBus.emit('user:interaction', {
        type: 'form-submit',
        form: 'user-info',
        data: { age: 25, gender: 'female' }
      });

      expect(analyticsListener).toHaveBeenCalledTimes(2);
      
      const [clickEvent] = analyticsListener.mock.calls[0];
      expect(clickEvent.type).toBe('click');
      expect(clickEvent.testType).toBe('mbti');
    });
  });
});