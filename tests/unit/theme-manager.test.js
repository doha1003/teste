/**
 * 테마 관리자 테스트
 * 다크/라이트 테마 전환 및 사용자 설정 저장을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Theme Manager Mock Implementation
class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.systemPreference = 'light';
    this.userPreference = null;
    this.listeners = [];
    this.mediaQuery = null;
    
    this.themes = {
      light: {
        name: 'light',
        displayName: '라이트 모드',
        colors: {
          background: '#ffffff',
          text: '#111827',
          primary: '#6366f1',
          secondary: '#8b5cf6'
        }
      },
      dark: {
        name: 'dark',
        displayName: '다크 모드',
        colors: {
          background: '#111827',
          text: '#f9fafb',
          primary: '#818cf8',
          secondary: '#a78bfa'
        }
      },
      system: {
        name: 'system',
        displayName: '시스템 설정',
        followSystem: true
      }
    };

    this.init();
  }

  init() {
    // 시스템 다크 모드 감지
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPreference = this.mediaQuery.matches ? 'dark' : 'light';
      
      // 시스템 테마 변경 감지
      this.mediaQuery.addEventListener('change', (e) => {
        this.systemPreference = e.matches ? 'dark' : 'light';
        if (this.userPreference === 'system') {
          this.applyTheme();
        }
      });
    }

    // 저장된 사용자 설정 로드
    this.loadUserPreference();
    
    // 초기 테마 적용
    this.applyTheme();
  }

  loadUserPreference() {
    try {
      const saved = localStorage.getItem('doha_theme_preference');
      if (saved && this.themes[saved]) {
        this.userPreference = saved;
      }
    } catch (error) {
      console.warn('테마 설정 로드 실패:', error);
    }
  }

  saveUserPreference() {
    try {
      if (this.userPreference) {
        localStorage.setItem('doha_theme_preference', this.userPreference);
      } else {
        localStorage.removeItem('doha_theme_preference');
      }
    } catch (error) {
      console.warn('테마 설정 저장 실패:', error);
    }
  }

  setTheme(themeName) {
    if (!this.themes[themeName]) {
      throw new Error(`알 수 없는 테마: ${themeName}`);\n    }\n\n    const previousTheme = this.currentTheme;\n    this.userPreference = themeName;\n    this.saveUserPreference();\n    this.applyTheme();\n\n    // 테마 변경 이벤트 발생\n    this.notifyListeners({\n      type: 'theme-changed',\n      from: previousTheme,\n      to: this.currentTheme,\n      userPreference: this.userPreference\n    });\n  }\n\n  applyTheme() {\n    const effectiveTheme = this.getEffectiveTheme();\n    \n    if (effectiveTheme !== this.currentTheme) {\n      const previousTheme = this.currentTheme;\n      this.currentTheme = effectiveTheme;\n      \n      // DOM에 테마 적용\n      if (typeof document !== 'undefined') {\n        document.documentElement.classList.remove('theme-light', 'theme-dark');\n        document.documentElement.classList.add(`theme-${this.currentTheme}`);\n        \n        // CSS 변수 업데이트\n        this.updateCSSVariables();\n      }\n\n      // 자동 테마 변경 이벤트 (시스템 테마 변경 시)\n      if (this.userPreference === 'system') {\n        this.notifyListeners({\n          type: 'theme-auto-changed',\n          from: previousTheme,\n          to: this.currentTheme,\n          reason: 'system-preference'\n        });\n      }\n    }\n  }\n\n  getEffectiveTheme() {\n    if (!this.userPreference || this.userPreference === 'system') {\n      return this.systemPreference;\n    }\n    return this.userPreference;\n  }\n\n  updateCSSVariables() {\n    if (typeof document === 'undefined') return;\n\n    const theme = this.themes[this.currentTheme];\n    if (!theme || !theme.colors) return;\n\n    const root = document.documentElement;\n    Object.entries(theme.colors).forEach(([key, value]) => {\n      root.style.setProperty(`--color-${key}`, value);\n    });\n  }\n\n  getCurrentTheme() {\n    return this.currentTheme;\n  }\n\n  getUserPreference() {\n    return this.userPreference;\n  }\n\n  getSystemPreference() {\n    return this.systemPreference;\n  }\n\n  getAvailableThemes() {\n    return Object.keys(this.themes);\n  }\n\n  getThemeInfo(themeName) {\n    return this.themes[themeName] || null;\n  }\n\n  toggleTheme() {\n    const currentEffective = this.getEffectiveTheme();\n    const newTheme = currentEffective === 'light' ? 'dark' : 'light';\n    this.setTheme(newTheme);\n  }\n\n  // 이벤트 리스너 관리\n  addEventListener(listener) {\n    if (typeof listener !== 'function') {\n      throw new Error('리스너는 함수여야 합니다');\n    }\n    this.listeners.push(listener);\n  }\n\n  removeEventListener(listener) {\n    const index = this.listeners.indexOf(listener);\n    if (index !== -1) {\n      this.listeners.splice(index, 1);\n    }\n  }\n\n  notifyListeners(event) {\n    this.listeners.forEach(listener => {\n      try {\n        listener(event);\n      } catch (error) {\n        console.error('테마 이벤트 리스너 오류:', error);\n      }\n    });\n  }\n\n  // 접근성 지원\n  getAccessibilityInfo() {\n    return {\n      currentTheme: this.currentTheme,\n      userPreference: this.userPreference,\n      systemPreference: this.systemPreference,\n      highContrast: this.isHighContrastMode(),\n      reducedMotion: this.isPrefersReducedMotion()\n    };\n  }\n\n  isHighContrastMode() {\n    if (typeof window === 'undefined' || !window.matchMedia) return false;\n    return window.matchMedia('(prefers-contrast: high)').matches;\n  }\n\n  isPrefersReducedMotion() {\n    if (typeof window === 'undefined' || !window.matchMedia) return false;\n    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;\n  }\n\n  // 테마 복원\n  reset() {\n    this.userPreference = null;\n    localStorage.removeItem('doha_theme_preference');\n    this.applyTheme();\n  }\n\n  // 디버그 정보\n  getDebugInfo() {\n    return {\n      currentTheme: this.currentTheme,\n      userPreference: this.userPreference,\n      systemPreference: this.systemPreference,\n      effectiveTheme: this.getEffectiveTheme(),\n      listenerCount: this.listeners.length,\n      mediaQuerySupported: !!this.mediaQuery,\n      localStorageAvailable: typeof localStorage !== 'undefined'\n    };\n  }\n}\n\ndescribe('Theme Manager', () => {\n  let themeManager;\n  let mockLocalStorage;\n  let mockMatchMedia;\n\n  beforeEach(() => {\n    // localStorage 모킹\n    mockLocalStorage = {\n      data: {},\n      getItem: vi.fn((key) => mockLocalStorage.data[key] || null),\n      setItem: vi.fn((key, value) => {\n        mockLocalStorage.data[key] = value;\n      }),\n      removeItem: vi.fn((key) => {\n        delete mockLocalStorage.data[key];\n      })\n    };\n\n    Object.defineProperty(window, 'localStorage', {\n      value: mockLocalStorage,\n      writable: true\n    });\n\n    // matchMedia 모킹\n    mockMatchMedia = vi.fn((query) => ({\n      matches: query.includes('dark') ? false : true,\n      media: query,\n      onchange: null,\n      addEventListener: vi.fn(),\n      removeEventListener: vi.fn(),\n      dispatchEvent: vi.fn()\n    }));\n\n    Object.defineProperty(window, 'matchMedia', {\n      value: mockMatchMedia,\n      writable: true\n    });\n\n    // document 모킹\n    Object.defineProperty(document, 'documentElement', {\n      value: {\n        classList: {\n          add: vi.fn(),\n          remove: vi.fn(),\n          contains: vi.fn()\n        },\n        style: {\n          setProperty: vi.fn()\n        }\n      },\n      writable: true\n    });\n\n    themeManager = new ThemeManager();\n  });\n\n  afterEach(() => {\n    vi.clearAllMocks();\n  });\n\n  describe('초기화', () => {\n    it('기본 테마가 라이트 모드여야 함', () => {\n      expect(themeManager.getCurrentTheme()).toBe('light');\n    });\n\n    it('시스템 테마 선호도를 감지해야 함', () => {\n      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');\n    });\n\n    it('저장된 사용자 설정을 로드해야 함', () => {\n      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('doha_theme_preference');\n    });\n\n    it('DOM에 초기 테마 클래스를 적용해야 함', () => {\n      expect(document.documentElement.classList.add).toHaveBeenCalledWith('theme-light');\n    });\n  });\n\n  describe('테마 설정', () => {\n    it('유효한 테마로 변경할 수 있어야 함', () => {\n      themeManager.setTheme('dark');\n      \n      expect(themeManager.getCurrentTheme()).toBe('dark');\n      expect(themeManager.getUserPreference()).toBe('dark');\n    });\n\n    it('잘못된 테마명은 에러를 발생시켜야 함', () => {\n      expect(() => {\n        themeManager.setTheme('invalid-theme');\n      }).toThrow('알 수 없는 테마: invalid-theme');\n    });\n\n    it('테마 변경 시 localStorage에 저장해야 함', () => {\n      themeManager.setTheme('dark');\n      \n      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('doha_theme_preference', 'dark');\n    });\n\n    it('테마 변경 시 DOM 클래스를 업데이트해야 함', () => {\n      themeManager.setTheme('dark');\n      \n      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('theme-light', 'theme-dark');\n      expect(document.documentElement.classList.add).toHaveBeenCalledWith('theme-dark');\n    });\n\n    it('테마 변경 시 CSS 변수를 업데이트해야 함', () => {\n      themeManager.setTheme('dark');\n      \n      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--color-background', '#111827');\n      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--color-text', '#f9fafb');\n    });\n  });\n\n  describe('시스템 테마 추적', () => {\n    it('시스템 설정을 선택하면 시스템 테마를 따라야 함', () => {\n      // 시스템이 다크 모드\n      mockMatchMedia.mockReturnValue({\n        matches: true,\n        addEventListener: vi.fn(),\n        removeEventListener: vi.fn()\n      });\n      \n      const newThemeManager = new ThemeManager();\n      newThemeManager.setTheme('system');\n      \n      expect(newThemeManager.getCurrentTheme()).toBe('dark');\n    });\n\n    it('시스템 테마 변경을 감지해야 함', () => {\n      const listener = vi.fn();\n      themeManager.addEventListener(listener);\n      themeManager.setTheme('system');\n      \n      // 시스템 테마 변경 시뮬레이션\n      themeManager.systemPreference = 'dark';\n      themeManager.applyTheme();\n      \n      expect(listener).toHaveBeenCalledWith(\n        expect.objectContaining({\n          type: 'theme-auto-changed',\n          from: 'light',\n          to: 'dark',\n          reason: 'system-preference'\n        })\n      );\n    });\n  });\n\n  describe('테마 토글', () => {\n    it('라이트에서 다크로 토글해야 함', () => {\n      expect(themeManager.getCurrentTheme()).toBe('light');\n      \n      themeManager.toggleTheme();\n      \n      expect(themeManager.getCurrentTheme()).toBe('dark');\n    });\n\n    it('다크에서 라이트로 토글해야 함', () => {\n      themeManager.setTheme('dark');\n      \n      themeManager.toggleTheme();\n      \n      expect(themeManager.getCurrentTheme()).toBe('light');\n    });\n  });\n\n  describe('이벤트 리스너', () => {\n    it('테마 변경 이벤트를 발생시켜야 함', () => {\n      const listener = vi.fn();\n      themeManager.addEventListener(listener);\n      \n      themeManager.setTheme('dark');\n      \n      expect(listener).toHaveBeenCalledWith(\n        expect.objectContaining({\n          type: 'theme-changed',\n          from: 'light',\n          to: 'dark',\n          userPreference: 'dark'\n        })\n      );\n    });\n\n    it('여러 리스너를 등록할 수 있어야 함', () => {\n      const listener1 = vi.fn();\n      const listener2 = vi.fn();\n      \n      themeManager.addEventListener(listener1);\n      themeManager.addEventListener(listener2);\n      \n      themeManager.setTheme('dark');\n      \n      expect(listener1).toHaveBeenCalled();\n      expect(listener2).toHaveBeenCalled();\n    });\n\n    it('리스너를 제거할 수 있어야 함', () => {\n      const listener = vi.fn();\n      \n      themeManager.addEventListener(listener);\n      themeManager.removeEventListener(listener);\n      \n      themeManager.setTheme('dark');\n      \n      expect(listener).not.toHaveBeenCalled();\n    });\n\n    it('잘못된 리스너 타입은 에러를 발생시켜야 함', () => {\n      expect(() => {\n        themeManager.addEventListener('not a function');\n      }).toThrow('리스너는 함수여야 합니다');\n    });\n\n    it('리스너에서 발생한 에러를 안전하게 처리해야 함', () => {\n      const errorListener = () => {\n        throw new Error('리스너 에러');\n      };\n      const normalListener = vi.fn();\n      \n      vi.spyOn(console, 'error').mockImplementation(() => {});\n      \n      themeManager.addEventListener(errorListener);\n      themeManager.addEventListener(normalListener);\n      \n      themeManager.setTheme('dark');\n      \n      expect(normalListener).toHaveBeenCalled();\n      expect(console.error).toHaveBeenCalled();\n    });\n  });\n\n  describe('테마 정보 조회', () => {\n    it('사용 가능한 테마 목록을 반환해야 함', () => {\n      const themes = themeManager.getAvailableThemes();\n      \n      expect(themes).toContain('light');\n      expect(themes).toContain('dark');\n      expect(themes).toContain('system');\n    });\n\n    it('특정 테마 정보를 반환해야 함', () => {\n      const darkTheme = themeManager.getThemeInfo('dark');\n      \n      expect(darkTheme.name).toBe('dark');\n      expect(darkTheme.displayName).toBe('다크 모드');\n      expect(darkTheme.colors.background).toBe('#111827');\n    });\n\n    it('존재하지 않는 테마는 null을 반환해야 함', () => {\n      const invalidTheme = themeManager.getThemeInfo('invalid');\n      \n      expect(invalidTheme).toBeNull();\n    });\n  });\n\n  describe('접근성 지원', () => {\n    it('접근성 정보를 제공해야 함', () => {\n      const accessibilityInfo = themeManager.getAccessibilityInfo();\n      \n      expect(accessibilityInfo).toHaveProperty('currentTheme');\n      expect(accessibilityInfo).toHaveProperty('userPreference');\n      expect(accessibilityInfo).toHaveProperty('systemPreference');\n      expect(accessibilityInfo).toHaveProperty('highContrast');\n      expect(accessibilityInfo).toHaveProperty('reducedMotion');\n    });\n\n    it('고대비 모드를 감지해야 함', () => {\n      mockMatchMedia.mockImplementation((query) => {\n        if (query.includes('prefers-contrast: high')) {\n          return { matches: true };\n        }\n        return { matches: false };\n      });\n      \n      expect(themeManager.isHighContrastMode()).toBe(true);\n    });\n\n    it('모션 감소 설정을 감지해야 함', () => {\n      mockMatchMedia.mockImplementation((query) => {\n        if (query.includes('prefers-reduced-motion: reduce')) {\n          return { matches: true };\n        }\n        return { matches: false };\n      });\n      \n      expect(themeManager.isPrefersReducedMotion()).toBe(true);\n    });\n  });\n\n  describe('저장소 처리', () => {\n    it('localStorage 사용 불가 시 안전하게 처리해야 함', () => {\n      mockLocalStorage.setItem.mockImplementation(() => {\n        throw new Error('Storage not available');\n      });\n      \n      vi.spyOn(console, 'warn').mockImplementation(() => {});\n      \n      expect(() => {\n        themeManager.setTheme('dark');\n      }).not.toThrow();\n      \n      expect(console.warn).toHaveBeenCalledWith('테마 설정 저장 실패:', expect.any(Error));\n    });\n\n    it('저장된 설정 로드 실패 시 기본값을 사용해야 함', () => {\n      mockLocalStorage.getItem.mockImplementation(() => {\n        throw new Error('Storage read error');\n      });\n      \n      vi.spyOn(console, 'warn').mockImplementation(() => {});\n      \n      const newThemeManager = new ThemeManager();\n      \n      expect(newThemeManager.getUserPreference()).toBeNull();\n      expect(console.warn).toHaveBeenCalledWith('테마 설정 로드 실패:', expect.any(Error));\n    });\n  });\n\n  describe('테마 복원', () => {\n    it('테마 설정을 초기화할 수 있어야 함', () => {\n      themeManager.setTheme('dark');\n      expect(themeManager.getUserPreference()).toBe('dark');\n      \n      themeManager.reset();\n      \n      expect(themeManager.getUserPreference()).toBeNull();\n      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('doha_theme_preference');\n    });\n  });\n\n  describe('디버그 정보', () => {\n    it('디버그 정보를 제공해야 함', () => {\n      const debugInfo = themeManager.getDebugInfo();\n      \n      expect(debugInfo).toHaveProperty('currentTheme');\n      expect(debugInfo).toHaveProperty('userPreference');\n      expect(debugInfo).toHaveProperty('systemPreference');\n      expect(debugInfo).toHaveProperty('effectiveTheme');\n      expect(debugInfo).toHaveProperty('listenerCount');\n      expect(debugInfo).toHaveProperty('mediaQuerySupported');\n      expect(debugInfo).toHaveProperty('localStorageAvailable');\n    });\n  });\n\n  describe('실제 사용 시나리오', () => {\n    it('사용자가 테마를 변경하는 플로우를 처리해야 함', () => {\n      const themeChangeListener = vi.fn();\n      themeManager.addEventListener(themeChangeListener);\n      \n      // 1. 다크 모드로 변경\n      themeManager.setTheme('dark');\n      expect(themeManager.getCurrentTheme()).toBe('dark');\n      expect(themeChangeListener).toHaveBeenCalledTimes(1);\n      \n      // 2. 시스템 설정으로 변경\n      themeManager.setTheme('system');\n      expect(themeManager.getUserPreference()).toBe('system');\n      expect(themeChangeListener).toHaveBeenCalledTimes(2);\n      \n      // 3. 시스템 테마 변경\n      themeManager.systemPreference = 'dark';\n      themeManager.applyTheme();\n      expect(themeManager.getCurrentTheme()).toBe('dark');\n      \n      // 4. 토글로 라이트 모드\n      themeManager.toggleTheme();\n      expect(themeManager.getCurrentTheme()).toBe('light');\n      expect(themeChangeListener).toHaveBeenCalledTimes(4);\n    });\n\n    it('페이지 새로고침 후 설정이 유지되어야 함', () => {\n      // 테마 설정\n      themeManager.setTheme('dark');\n      \n      // 새로운 인스턴스 생성 (새로고침 시뮬레이션)\n      mockLocalStorage.data['doha_theme_preference'] = 'dark';\n      const newThemeManager = new ThemeManager();\n      \n      expect(newThemeManager.getUserPreference()).toBe('dark');\n      expect(newThemeManager.getCurrentTheme()).toBe('dark');\n    });\n\n    it('테마 선택 UI 컴포넌트와 연동되어야 함', () => {\n      const uiUpdateListener = vi.fn();\n      themeManager.addEventListener(uiUpdateListener);\n      \n      // 테마 변경 시뮬레이션\n      ['light', 'dark', 'system'].forEach(theme => {\n        themeManager.setTheme(theme);\n        \n        const lastCall = uiUpdateListener.mock.calls[uiUpdateListener.mock.calls.length - 1][0];\n        expect(lastCall.userPreference).toBe(theme);\n      });\n      \n      expect(uiUpdateListener).toHaveBeenCalledTimes(3);\n    });\n  });\n});"