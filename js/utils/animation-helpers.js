/**
 * 애니메이션 헬퍼 모듈
 * 스크롤 애니메이션, 성능 최적화 관련 함수들
 */

// 스크롤 애니메이션 처리
export function handleScrollAnimation() {
    const elements = document.querySelectorAll('.fade-in');
    
    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible && !element.classList.contains('animated')) {
            element.classList.add('animated');
        }
    });
}

// 쓰로틀 함수 (성능 최적화)
export function throttle(func, wait) {
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

// 디바운스 함수
export function debounce(func, wait) {
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

// 페이지 로드 시 애니메이션 초기화
export function initPageAnimations() {
    // 초기 애니메이션 트리거
    handleScrollAnimation();
    
    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', throttle(handleScrollAnimation, 100));
}

// 부드러운 스크롤
export function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 요소가 뷰포트에 들어오는지 감지하는 Intersection Observer
export function createIntersectionObserver(callback, options = {}) {
    const defaultOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observerOptions = { ...defaultOptions, ...options };
    
    return new IntersectionObserver(callback, observerOptions);
}

// 스크롤 진행률 계산
export function getScrollProgress() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    return (winScroll / height) * 100;
}

// 요소가 뷰포트에 보이는지 확인
export function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// CSS 애니메이션 완료 대기
export function waitForAnimationEnd(element, animationName) {
    return new Promise((resolve) => {
        const handleAnimationEnd = (event) => {
            if (event.animationName === animationName) {
                element.removeEventListener('animationend', handleAnimationEnd);
                resolve();
            }
        };
        element.addEventListener('animationend', handleAnimationEnd);
    });
}

// 트랜지션 완료 대기
export function waitForTransitionEnd(element, propertyName) {
    return new Promise((resolve) => {
        const handleTransitionEnd = (event) => {
            if (event.propertyName === propertyName) {
                element.removeEventListener('transitionend', handleTransitionEnd);
                resolve();
            }
        };
        element.addEventListener('transitionend', handleTransitionEnd);
    });
}

// requestAnimationFrame을 사용한 부드러운 값 변경
export function animateValue(element, start, end, duration, callback) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 이징 함수 (ease-out)
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = start + (end - start) * easedProgress;
        
        if (callback) {
            callback(currentValue, progress);
        } else if (element) {
            element.textContent = Math.round(currentValue);
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// 숫자 카운트업 애니메이션
export function countUpNumber(element, endValue, duration = 1000) {
    const startValue = 0;
    animateValue(element, startValue, endValue, duration, (currentValue) => {
        element.textContent = Math.round(currentValue).toLocaleString();
    });
}

// 진행 바 애니메이션
export function animateProgressBar(element, targetPercent, duration = 1000) {
    animateValue(element, 0, targetPercent, duration, (currentValue) => {
        element.style.width = `${currentValue}%`;
    });
}

// 패럴랙스 효과
export function initParallax(element, speed = 0.5) {
    window.addEventListener('scroll', throttle(() => {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * speed;
        element.style.transform = `translateY(${parallax}px)`;
    }, 16)); // ~60fps
}

// 스크롤 트리거 애니메이션
export function createScrollTrigger(element, animationClass, threshold = 0.1) {
    const observer = createIntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(animationClass);
                }
            });
        },
        { threshold }
    );
    
    observer.observe(element);
    return observer;
}