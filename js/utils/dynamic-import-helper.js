/**
 * 동적 임포트 헬퍼
 * 코드 스플리팅과 지연 로딩을 위한 유틸리티
 */

// 프리로드된 모듈 캐시
const moduleCache = new Map();

// 프리로드 상태 추적
const preloadStatus = new Map();

/**
 * 모듈을 동적으로 임포트하고 캐시합니다
 * @param {string} modulePath - 모듈 경로
 * @param {Object} options - 옵션
 * @returns {Promise<any>} 로드된 모듈
 */
export async function dynamicImport(modulePath, options = {}) {
  const {
    // preload = false,
    // priority = 'low',
    timeout = 10000,
  } = options;

  // 캐시 확인
  if (moduleCache.has(modulePath)) {
    return moduleCache.get(modulePath);
  }

  // 타임아웃 처리
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Module load timeout: ${modulePath}`)), timeout);
  });

  // 모듈 로드
  const modulePromise = import(modulePath);
  const module = await Promise.race([modulePromise, timeoutPromise]);

  // 캐시에 저장
  moduleCache.set(modulePath, module);

  return module;
}

/**
 * 모듈을 프리로드합니다 (백그라운드에서 로드)
 * @param {string} modulePath - 모듈 경로
 * @param {string} priority - 우선순위 ('high', 'low')
 */
export function preloadModule(modulePath, priority = 'low') {
  if (preloadStatus.has(modulePath)) {
    return preloadStatus.get(modulePath);
  }

  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = modulePath;

  if (priority === 'high') {
    link.fetchpriority = 'high';
  }

  document.head.appendChild(link);

  // 프리로드 상태 저장
  const promise = dynamicImport(modulePath, { preload: true });
  preloadStatus.set(modulePath, promise);

  return promise;
}

/**
 * 여러 모듈을 병렬로 프리로드합니다
 * @param {string[]} modulePaths - 모듈 경로 배열
 */
export function preloadModules(modulePaths) {
  return Promise.all(modulePaths.map((path) => preloadModule(path)));
}

/**
 * Intersection Observer를 사용한 지연 로딩
 * @param {HTMLElement} element - 관찰할 요소
 * @param {Function} loadCallback - 로드 콜백
 * @param {Object} options - Intersection Observer 옵션
 */
export function lazyLoad(element, loadCallback, options = {}) {
  const defaultOptions = {
    rootMargin: '50px',
    threshold: 0.01,
    ...options,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadCallback();
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);

  observer.observe(element);

  return observer;
}

/**
 * 네트워크 상태에 따른 조건부 프리로드
 */
export function conditionalPreload(modulePath) {
  if ('connection' in navigator) {
    const { connection } = navigator;

    // 느린 연결에서는 프리로드 건너뛰기
    if (connection.saveData || connection.effectiveType === 'slow-2g') {
      return Promise.resolve(null);
    }

    // 빠른 연결에서는 높은 우선순위로 프리로드
    if (connection.effectiveType === '4g') {
      return preloadModule(modulePath, 'high');
    }
  }

  // 기본적으로 낮은 우선순위로 프리로드
  return preloadModule(modulePath, 'low');
}

/**
 * 라우트 기반 프리로드
 */
export class RoutePreloader {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
  }

  /**
   * 라우트와 관련 모듈 등록
   */
  register(route, modules) {
    this.routes.set(route, modules);
  }

  /**
   * 현재 라우트에 따른 모듈 프리로드
   */
  preloadForRoute(route) {
    const modules = this.routes.get(route);
    if (modules) {
      return preloadModules(modules);
    }
    return Promise.resolve([]);
  }

  /**
   * 인접 라우트의 모듈 프리로드
   */
  preloadAdjacentRoutes(currentRoute) {
    const adjacentModules = [];

    // 현재 라우트와 관련된 라우트의 모듈 수집
    this.routes.forEach((modules, route) => {
      if (route !== currentRoute && this.isAdjacent(currentRoute, route)) {
        adjacentModules.push(...modules);
      }
    });

    return preloadModules(adjacentModules);
  }

  /**
   * 라우트가 인접한지 확인
   */
  isAdjacent(route1, route2) {
    // 간단한 예시: 같은 카테고리인지 확인
    const category1 = route1.split('/')[0];
    const category2 = route2.split('/')[0];
    return category1 === category2;
  }
}

// 전역 프리로더 인스턴스
export const routePreloader = new RoutePreloader();

// 페이지별 모듈 등록
routePreloader.register('/', ['./pages/home.js']);
routePreloader.register('/tests', ['./pages/tests-index.js']);
routePreloader.register('/tests/mbti', ['./features/tests/mbti-test.js']);
routePreloader.register('/tests/teto-egen', ['./features/tests/teto-egen-test.js']);
routePreloader.register('/tests/love-dna', ['./features/tests/love-dna-test.js']);
routePreloader.register('/fortune', ['./pages/fortune-index.js']);
routePreloader.register('/tools', ['./pages/tools-index.js']);

// 유틸리티 함수들 내보내기
export default {
  dynamicImport,
  preloadModule,
  preloadModules,
  lazyLoad,
  conditionalPreload,
  routePreloader,
};
