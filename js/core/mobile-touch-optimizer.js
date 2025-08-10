/**
 * 모바일 터치 최적화
 * 모바일 기기에서의 터치 인터랙션과 성능을 최적화
 * 
 * Features:
 * - 터치 제스처 개선
 * - 스크롤 성능 최적화
 * - 터치 지연 제거
 * - 모바일 키보드 대응
 * - 터치 피드백 향상
 */

class MobileTouchOptimizer {
  constructor() {
    this.config = {
      // 터치 설정
      touch: {
        fastTapDelay: 300, // 빠른 탭 인식 시간
        longTapDelay: 500, // 롱 탭 인식 시간
        maxTapDistance: 10, // 탭 최대 이동 거리
        swipeThreshold: 50, // 스와이프 최소 거리
        swipeMaxTime: 1000, // 스와이프 최대 시간
        preventDoubleZoom: true, // 더블 탭 줌 방지
      },
      
      // 스크롤 최적화
      scroll: {
        enablePassive: true, // 패시브 스크롤
        improveInertia: true, // 관성 스크롤 개선
        preventOverscroll: true, // 오버스크롤 방지
        enableSnapPoints: false, // 스냅 포인트 (필요시)
      },
      
      // 성능 최적화
      performance: {
        enableTouchActionOptimization: true,
        improveRenderingPerformance: true,
        optimizeEventListeners: true,
        enableVirtualizedScrolling: false, // 큰 리스트용
      },
      
      // 키보드 대응
      keyboard: {
        enableViewportResize: true,
        preventZoomOnFocus: true,
        improveInputExperience: true,
        enableSmartScrolling: true,
      },
      
      // 피드백 설정
      feedback: {
        enableTouchRipple: true,
        enableHapticFeedback: false, // 진동 피드백
        improveVisualFeedback: true,
        customTouchStates: true,
      },
    };
    
    this.state = {
      isMobile: false,
      isTouch: false,
      currentTouch: null,
      touchStartTime: 0,
      touchStartPos: null,
      isScrolling: false,
      keyboardVisible: false,
      lastTouchEnd: 0,
      gestureRecognizers: new Map(),
    };
    
    this.elements = {
      activeElements: new Set(),
      scrollContainers: new Set(),
      inputElements: new Set(),
    };
    
    this.init();
  }
  /**
   * 초기화
   */
  init() {
    this.detectMobileEnvironment();
    
    if (this.state.isMobile || this.state.isTouch) {
      this.setupTouchOptimizations();
      this.setupScrollOptimizations();
      this.setupKeyboardHandling();
      this.setupTouchFeedback();
      this.setupPerformanceOptimizations();
      this.setupGestureRecognition();
      
      console.log('[Mobile Touch] 모바일 터치 최적화 활성화됨');
    }
    
    // 터치 지원 여부와 관계없이 적용할 최적화
    this.setupUniversalOptimizations();
  }
  /**
   * 모바일 환경 감지
   */
  detectMobileEnvironment() {
    // 모바일 기기 감지
    this.state.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      .test(navigator.userAgent);
    
    // 터치 지원 감지
    this.state.isTouch = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
    
    // CSS 클래스 추가
    document.body.classList.toggle('mobile-device', this.state.isMobile);
    document.body.classList.toggle('touch-device', this.state.isTouch);
    
    // 뷰포트 메타 태그 최적화
    this.optimizeViewportMeta();
  }
  /**
   * 터치 최적화 설정
   */
  setupTouchOptimizations() {
    // 터치 이벤트 등록
    this.setupTouchEventListeners();
    
    // 더블 탭 줌 방지
    if (this.config.touch.preventDoubleZoom) {
      this.preventDoubleZoom();
    }
    
    // 터치 액션 최적화
    if (this.config.performance.enableTouchActionOptimization) {
      this.optimizeTouchActions();
    }
    
    // 빠른 탭 구현
    this.setupFastTap();
  }
  /**
   * 터치 이벤트 리스너 설정
   */
  setupTouchEventListeners() {
    const options = this.config.performance.optimizeEventListeners ? 
      { passive: false, capture: true } : {};
    
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), options);
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), options);
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), options);
    document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), options);
    
    // 포인터 이벤트 지원시 추가 최적화
    if ('PointerEvent' in window) {
      this.setupPointerEventOptimizations();
    }
  }
  /**
   * 터치 시작 처리
   */
  handleTouchStart(e) {
    this.state.currentTouch = e.touches[0];
    this.state.touchStartTime = Date.now();
    this.state.touchStartPos = {
      x: this.state.currentTouch.clientX,
      y: this.state.currentTouch.clientY,
    };
    
    const {target} = e;
    
    // 터치 피드백 시작
    this.startTouchFeedback(target);
    
    // 제스처 인식 시작
    this.startGestureRecognition(e);
    
    // 활성 요소로 등록
    this.elements.activeElements.add(target);
  }
  /**
   * 터치 이동 처리
   */
  handleTouchMove(e) {
    if (!this.state.currentTouch) {return;}
    
    const currentPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    
    const deltaX = currentPos.x - this.state.touchStartPos.x;
    const deltaY = currentPos.y - this.state.touchStartPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // 스크롤 감지
    if (!this.state.isScrolling && distance > this.config.touch.maxTapDistance) {
      this.state.isScrolling = true;
      this.stopTouchFeedback();
    }
    
    // 제스처 업데이트
    this.updateGestureRecognition(e, { deltaX, deltaY, distance });
    
    // 스크롤 최적화
    this.optimizeScrolling(e, deltaY);
  }
  /**
   * 터치 종료 처리
   */
  handleTouchEnd(e) {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - this.state.touchStartTime;
    
    // 빠른 탭 처리
    if (!this.state.isScrolling && touchDuration < this.config.touch.fastTapDelay) {
      this.handleFastTap(e);
    }
    
    // 롱 탭 처리
    if (touchDuration > this.config.touch.longTapDelay && !this.state.isScrolling) {
      this.handleLongTap(e);
    }
    
    // 제스처 완료 처리
    this.completeGestureRecognition(e);
    
    // 터치 피드백 종료
    this.stopTouchFeedback();
    
    // 상태 초기화
    this.resetTouchState();
    
    // 더블 탭 방지를 위한 시간 기록
    this.state.lastTouchEnd = touchEndTime;
  }
  /**
   * 터치 취소 처리
   */
  handleTouchCancel(e) {
    this.stopTouchFeedback();
    this.cancelGestureRecognition();
    this.resetTouchState();
  }
  /**
   * 스크롤 최적화 설정
   */
  setupScrollOptimizations() {
    // 패시브 스크롤 활성화
    if (this.config.scroll.enablePassive) {
      this.enablePassiveScrolling();
    }
    
    // 관성 스크롤 개선
    if (this.config.scroll.improveInertia) {
      this.improveScrollInertia();
    }
    
    // 오버스크롤 방지
    if (this.config.scroll.preventOverscroll) {
      this.preventOverscroll();
    }
    
    // 스크롤 컨테이너 최적화
    this.optimizeScrollContainers();
  }
  /**
   * 키보드 처리 설정
   */
  setupKeyboardHandling() {
    if (!this.config.keyboard.enableViewportResize) {return;}
    
    // Visual Viewport API 사용 (지원시)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        this.handleViewportResize();
      });
    } else {
      // 폴백: 윈도우 리사이즈 이벤트
      window.addEventListener('resize', this.debounce(() => {
        this.handleLegacyViewportResize();
      }, 100));
    }
    
    // 입력 필드 포커스 처리
    this.setupInputFocusHandling();
  }
  /**
   * 입력 필드 포커스 처리
   */
  setupInputFocusHandling() {
    const inputSelectors = 'input, textarea, select, [contenteditable]';
    
    document.addEventListener('focusin', (e) => {
      if (e.target.matches(inputSelectors)) {
        this.handleInputFocus(e.target);
      }
    });
    
    document.addEventListener('focusout', (e) => {
      if (e.target.matches(inputSelectors)) {
        this.handleInputBlur(e.target);
      }
    });
  }
  /**
   * 입력 필드 포커스 처리
   */
  handleInputFocus(input) {
    this.state.keyboardVisible = true;
    document.body.classList.add('keyboard-visible');
    
    // 줌 방지
    if (this.config.keyboard.preventZoomOnFocus) {
      this.preventZoomOnFocus(input);
    }
    
    // 스마트 스크롤링
    if (this.config.keyboard.enableSmartScrolling) {
      this.scrollInputIntoView(input);
    }
    
    this.elements.inputElements.add(input);
  }
  /**
   * 입력 필드 블러 처리
   */
  handleInputBlur(input) {
    // 약간의 지연 후 키보드 상태 업데이트 (키보드 애니메이션 고려)
    setTimeout(() => {
      if (!document.activeElement || !document.activeElement.matches('input, textarea, select, [contenteditable]')) {
        this.state.keyboardVisible = false;
        document.body.classList.remove('keyboard-visible');
      }
    }, 100);
    
    this.elements.inputElements.delete(input);
  }
  /**
   * 터치 피드백 설정
   */
  setupTouchFeedback() {
    if (!this.config.feedback.improveVisualFeedback) {return;}
    
    // CSS 스타일 적용
    this.applyTouchFeedbackStyles();
    
    // 햅틱 피드백 설정 (지원시)
    if (this.config.feedback.enableHapticFeedback && 'vibrate' in navigator) {
      this.setupHapticFeedback();
    }
  }
  /**
   * 터치 피드백 시작
   */
  startTouchFeedback(element) {
    if (!this.config.feedback.improveVisualFeedback) {return;}
    
    // 터치 상태 클래스 추가
    element.classList.add('touch-active');
    
    // 리플 효과 (옵션)
    if (this.config.feedback.enableTouchRipple) {
      this.createRippleEffect(element, this.state.touchStartPos);
    }
    
    // 햅틱 피드백
    if (this.config.feedback.enableHapticFeedback) {
      this.triggerHapticFeedback('light');
    }
  }
  /**
   * 터치 피드백 중지
   */
  stopTouchFeedback() {
    // 모든 활성 요소에서 터치 상태 제거
    this.elements.activeElements.forEach(element => {
      element.classList.remove('touch-active');
    });
    
    this.elements.activeElements.clear();
  }
  /**
   * 리플 효과 생성
   */
  createRippleEffect(element, position) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('div');
    
    ripple.className = 'touch-ripple';
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple-animation 0.6s linear;
      pointer-events: none;
      left: ${position.x - rect.left - 10}px;
      top: ${position.y - rect.top - 10}px;
      width: 20px;
      height: 20px;
    `;
    
    // 상대적 포지셔닝을 위해 부모 요소 설정
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    
    element.appendChild(ripple);
    
    // 애니메이션 완료 후 제거
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }
  /**
   * 성능 최적화 설정
   */
  setupPerformanceOptimizations() {
    if (this.config.performance.improveRenderingPerformance) {
      this.optimizeRendering();
    }
    
    // 가상화된 스크롤링 (큰 리스트용)
    if (this.config.performance.enableVirtualizedScrolling) {
      this.setupVirtualizedScrolling();
    }
  }
  /**
   * 렌더링 최적화
   */
  optimizeRendering() {
    // will-change 속성 자동 적용
    const animatedElements = document.querySelectorAll(
      '.animated, .transition, [data-animate]'
    );
    
    animatedElements.forEach(element => {
      element.style.willChange = 'transform, opacity';
    });
    
    // 스크롤 컨테이너 최적화
    const scrollContainers = document.querySelectorAll(
      '.scroll-container, .overflow-auto, .overflow-scroll'
    );
    
    scrollContainers.forEach(container => {
      container.style.contain = 'layout style paint';
      container.style.willChange = 'scroll-position';
    });
  }
  /**
   * 제스처 인식 설정
   */
  setupGestureRecognition() {
    // 스와이프 제스처
    this.addGestureRecognizer('swipe', {
      minDistance: this.config.touch.swipeThreshold,
      maxTime: this.config.touch.swipeMaxTime,
      callback: this.handleSwipeGesture.bind(this),
    });
    
    // 핀치 제스처 (멀티터치)
    if ('TouchEvent' in window) {
      this.addGestureRecognizer('pinch', {
        minScale: 0.5,
        maxScale: 3.0,
        callback: this.handlePinchGesture.bind(this),
      });
    }
  }
  /**
   * 스와이프 제스처 처리
   */
  handleSwipeGesture(gesture) {
    const { direction, distance, velocity } = gesture;
    
    // 커스텀 스와이프 이벤트 발송
    const swipeEvent = new CustomEvent('swipe', {
      detail: { direction, distance, velocity },
      bubbles: true,
    });
    
    gesture.target.dispatchEvent(swipeEvent);
    
    console.log(`[Mobile Touch] 스와이프 제스처: ${direction}, 거리: ${distance}px`);
  }
  /**
   * 빠른 탭 처리
   */
  handleFastTap(e) {
    // 더블 탭 방지
    const timeSinceLastTap = Date.now() - this.state.lastTouchEnd;
    if (timeSinceLastTap < 300) {
      e.preventDefault();
      return;
    }
    
    // 빠른 탭 이벤트 발송
    const fastTapEvent = new CustomEvent('fasttap', {
      detail: {
        originalEvent: e,
        position: this.state.touchStartPos,
      },
      bubbles: true,
    });
    
    e.target.dispatchEvent(fastTapEvent);
  }
  /**
   * 더블 탭 줌 방지
   */
  preventDoubleZoom() {
    let lastTouchEnd = 0;
    
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  }
  /**
   * 터치 액션 최적화
   */
  optimizeTouchActions() {
    // 버튼 요소들에 manipulation 적용
    const interactiveElements = document.querySelectorAll(
      'button, [role="dh-c-button"], a, input, textarea, select'
    );
    
    interactiveElements.forEach(element => {
      element.style.touchAction = 'manipulation';
    });
    
    // 스크롤 컨테이너에 pan 적용
    const scrollContainers = document.querySelectorAll(
      '.scroll-container, .overflow-auto, .overflow-scroll'
    );
    
    scrollContainers.forEach(container => {
      container.style.touchAction = 'pan-y';
    });
  }
  /**
   * 뷰포트 메타 최적화
   */
  optimizeViewportMeta() {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport && this.state.isMobile) {
      // 모바일 최적화된 뷰포트 설정
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    }
  }
  /**
   * 공통 최적화 설정
   */
  setupUniversalOptimizations() {
    // 터치 지연 제거 CSS 적용
    this.applyTouchOptimizationStyles();
    
    // 스크롤 성능 개선
    this.improveScrollPerformance();
    
    // 이미지 로딩 최적화
    this.optimizeImageLoading();
  }
  /**
   * 터치 최적화 스타일 적용
   */
  applyTouchOptimizationStyles() {
    if (document.getElementById('mobile-touch-optimization')) {return;}
    
    const style = document.createElement('style');
    style.id = 'mobile-touch-optimization';
    style.textContent = `
      /* 모바일 터치 최적화 */
      .mobile-device,
      .touch-device {
        -webkit-touch-callout: none;
        -webkit-text-size-adjust: 100%;
        -webkit-tap-highlight-color: transparent;
        -ms-touch-action: manipulation;
        touch-action: manipulation;
      }
      
      /* 터치 피드백 */
      .touch-active {
        transform: scale(0.98);
        opacity: 0.8;
        transition: transform 0.1s ease, opacity 0.1s ease;
      }
      
      /* 리플 애니메이션 */
      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      /* 터치 타겟 최적화 */
      .mobile-device button,
      .mobile-device [role="dh-c-button"],
      .mobile-device a,
      .touch-device button,
      .touch-device [role="dh-c-button"],
      .touch-device a {
        min-height: 44px;
        min-width: 44px;
        padding: 8px 12px;
        touch-action: manipulation;
      }
      
      /* 스크롤 최적화 */
      .mobile-device .scroll-container,
      .touch-device .scroll-container {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        scroll-behavior: smooth;
      }
      
      /* 입력 필드 최적화 */
      .mobile-device input,
      .mobile-device textarea,
      .touch-device input,
      .touch-device textarea {
        font-size: 16px; /* 줌 방지 */
        -webkit-appearance: none;
        border-radius: 4px;
      }
      
      /* 키보드 활성화시 */
      .keyboard-visible {
        /* 뷰포트 조정을 위한 스타일 */
      }
      
      /* 터치 제스처 최적화 */
      .swipe-container {
        touch-action: pan-x;
        overflow-x: auto;
        overflow-y: hidden;
      }
      
      .pinch-zoom {
        touch-action: pinch-zoom;
      }
      
      /* 성능 최적화 */
      .will-change-transform {
        will-change: transform;
      }
      
      .will-change-scroll {
        will-change: scroll-position;
      }
      
      /* iOS 전용 최적화 */
      @supports (-webkit-touch-callout: none) {
        .ios-scroll-fix {
          -webkit-overflow-scrolling: touch;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  /**
   * 유틸리티 메서드들
   */
  
  resetTouchState() {
    this.state.currentTouch = null;
    this.state.touchStartTime = 0;
    this.state.touchStartPos = null;
    this.state.isScrolling = false;
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // ... 기타 유틸리티 메서드들
  
  /**
   * 정리 함수
   */
  destroy() {
    // 이벤트 리스너 제거
    this.removeEventListeners();
    
    // 스타일 제거
    const style = document.getElementById('mobile-touch-optimization');
    if (style) {
      style.remove();
    }
    
    // 상태 초기화
    this.elements.activeElements.clear();
    this.elements.scrollContainers.clear();
    this.elements.inputElements.clear();
    this.state.gestureRecognizers.clear();
  }
}

// 전역 인스턴스 생성
if (typeof window !== 'undefined') {
  window.MobileTouchOptimizer = MobileTouchOptimizer;
  
  // 자동 초기화
  if (document.readyState === 'dh-u-loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.mobileTouchOptimizer = new MobileTouchOptimizer();
    });
  } else {
    window.mobileTouchOptimizer = new MobileTouchOptimizer();
  }
}

export default MobileTouchOptimizer;