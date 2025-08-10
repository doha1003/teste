/**
 * Lazy Loading Manager
 * doha.kr 성능 최적화를 위한 지연 로딩 시스템
 * 
 * @version 1.0.0
 * @author doha.kr
 */

class LazyLoader {
  constructor() {
    this.loadedModules = new Set();
    this.pendingModules = new Map();
    this.intersectionObserver = null;
    this.init();
  }

  /**
   * 지연 로딩 시스템 초기화
   */
  init() {
    // Intersection Observer 설정 (이미지 지연 로딩용)
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          root: null,
          rootMargin: '50px',
          threshold: 0.1
        }
      );
    }

    // 초기 지연 로딩 요소들 관찰 시작
    this.observeElements();
    
    // DOM 변경 감지해서 새로운 요소들도 관찰
    this.setupMutationObserver();
  }

  /**
   * 지연 로딩 대상 요소들 관찰 시작
   */
  observeElements() {
    // 이미지 지연 로딩
    const lazyImages = document.querySelectorAll('img[data-src]:not(.lazy-observed)');
    lazyImages.forEach(img => {
      img.classList.add('lazy-observed');
      if (this.intersectionObserver) {
        this.intersectionObserver.observe(img);
      } else {
        // 폴백: 즉시 로드
        this.loadImage(img);
      }
    });

    // iframe 지연 로딩
    const lazyIframes = document.querySelectorAll('iframe[data-src]:not(.lazy-observed)');
    lazyIframes.forEach(iframe => {
      iframe.classList.add('lazy-observed');
      if (this.intersectionObserver) {
        this.intersectionObserver.observe(iframe);
      }
    });

    // 컴포넌트 지연 로딩
    const lazyComponents = document.querySelectorAll('[data-lazy-component]:not(.lazy-observed)');
    lazyComponents.forEach(component => {
      component.classList.add('lazy-observed');
      if (this.intersectionObserver) {
        this.intersectionObserver.observe(component);
      }
    });
  }

  /**
   * DOM 변경 감지 설정
   */
  setupMutationObserver() {
    if ('MutationObserver' in window) {
      const observer = new MutationObserver(mutations => {
        let hasNewElements = false;
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            hasNewElements = true;
          }
        });
        
        if (hasNewElements) {
          // 새로운 요소들에 대해 지연 로딩 적용
          setTimeout(() => this.observeElements(), 100);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  /**
   * Intersection Observer 콜백
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        if (element.tagName === 'IMG') {
          this.loadImage(element);
        } else if (element.tagName === 'IFRAME') {
          this.loadIframe(element);
        } else if (element.hasAttribute('data-lazy-component')) {
          this.loadComponent(element);
        }
        
        this.intersectionObserver.unobserve(element);
      }
    });
  }

  /**
   * 이미지 로딩
   */
  loadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) {return;}

    // 로딩 스피너 추가
    img.classList.add('loading');
    
    const newImg = new Image();
    newImg.onload = () => {
      img.src = src;
      img.removeAttribute('data-src');
      img.classList.remove('loading');
      img.classList.add('loaded');
      
      // 페이드인 효과
      if (img.style.opacity !== undefined) {
        img.style.opacity = '1';
      }
    };
    
    newImg.onerror = () => {
      img.classList.remove('loading');
      img.classList.add('error');
      console.warn('Image loading failed:', src);
    };
    
    newImg.src = src;
  }

  /**
   * iframe 로딩
   */
  loadIframe(iframe) {
    const src = iframe.getAttribute('data-src');
    if (!src) {return;}

    iframe.src = src;
    iframe.removeAttribute('data-src');
    iframe.classList.add('loaded');
  }

  /**
   * 컴포넌트 지연 로딩
   */
  async loadComponent(element) {
    const componentName = element.getAttribute('data-lazy-component');
    if (!componentName) {return;}

    try {
      // 로딩 상태 표시
      element.classList.add('component-loading');
      
      // 컴포넌트 스크립트 로딩
      await this.loadScript(`/js/features/${componentName}.js`);
      
      // 컴포넌트 초기화
      const ComponentClass = window[componentName];
      if (ComponentClass && typeof ComponentClass === 'function') {
        new ComponentClass(element);
      }
      
      element.classList.remove('component-loading');
      element.classList.add('component-loaded');
      
    } catch (error) {
      console.error(`Failed to load component: ${componentName}`, error);
      element.classList.remove('component-loading');
      element.classList.add('component-error');
    }
  }

  /**
   * 스크립트 동적 로딩 (캐시 지원)
   */
  async loadScript(src) {
    // 이미 로드된 모듈인지 확인
    if (this.loadedModules.has(src)) {
      return Promise.resolve();
    }

    // 현재 로딩 중인 모듈인지 확인
    if (this.pendingModules.has(src)) {
      return this.pendingModules.get(src);
    }

    // 새로운 스크립트 로딩
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'module'; // ES6 모듈 지원
      
      script.onload = () => {
        this.loadedModules.add(src);
        this.pendingModules.delete(src);
        resolve();
      };
      
      script.onerror = () => {
        this.pendingModules.delete(src);
        reject(new Error(`Failed to load script: ${src}`));
      };
      
      document.head.appendChild(script);
    });

    this.pendingModules.set(src, promise);
    return promise;
  }

  /**
   * CSS 동적 로딩
   */
  async loadCSS(href) {
    return new Promise((resolve, reject) => {
      // 이미 로드된 CSS인지 확인
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (existingLink) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
      
      document.head.appendChild(link);
    });
  }

  /**
   * 모듈 지연 로딩 (Promise 기반)
   */
  async loadModule(modulePath) {
    try {
      const module = await import(modulePath);
      this.loadedModules.add(modulePath);
      return module;
    } catch (error) {
      console.error(`Failed to load module: ${modulePath}`, error);
      throw error;
    }
  }

  /**
   * 우선순위별 리소스 로딩
   */
  loadResourcesByPriority() {
    // 높은 우선순위: 필수 기능
    const highPriorityResources = [
      '/js/utils/common-utils.js',
      '/js/error-handler.js'
    ];

    // 중간 우선순위: 주요 기능
    const mediumPriorityResources = [
      '/js/features/fortune/daily-fortune.js',
      '/js/features/tests/mbti-test.js'
    ];

    // 낮은 우선순위: 부가 기능
    const lowPriorityResources = [
      '/js/features/tools/text-counter.js',
      '/js/analytics.js'
    ];

    // 순차적 로딩
    Promise.all(highPriorityResources.map(src => this.loadScript(src)))
      .then(() => {
        // 높은 우선순위 로딩 완료 후 중간 우선순위 로딩
        return Promise.all(mediumPriorityResources.map(src => this.loadScript(src)));
      })
      .then(() => {
        // 사용자 상호작용 후 낮은 우선순위 로딩
        const loadLowPriority = () => {
          lowPriorityResources.forEach(src => this.loadScript(src));
        };

        // 2초 후 또는 사용자 상호작용 시 로딩
        setTimeout(loadLowPriority, 2000);
        ['click', 'scroll', 'keydown'].forEach(event => {
          document.addEventListener(event, loadLowPriority, { once: true });
        });
      })
      .catch(error => {
        console.error('Resource loading failed:', error);
      });
  }

  /**
   * 지연 로딩 통계
   */
  getStats() {
    return {
      loadedModules: this.loadedModules.size,
      pendingModules: this.pendingModules.size,
      observedElements: document.querySelectorAll('.lazy-observed').length,
      loadedElements: document.querySelectorAll('.loaded').length
    };
  }

  /**
   * 정리
   */
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    this.loadedModules.clear();
    this.pendingModules.clear();
  }
}

// 전역 인스턴스 생성
const lazyLoader = new LazyLoader();

// DOM 로드 완료 후 우선순위별 리소스 로딩 시작
document.addEventListener('DOMContentLoaded', () => {
  lazyLoader.loadResourcesByPriority();
});

// 전역 접근 가능하도록 설정
if (typeof window !== 'undefined') {
  window.LazyLoader = LazyLoader;
  window.lazyLoader = lazyLoader;
}

export default LazyLoader;