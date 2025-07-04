// 메인 JavaScript 파일

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 컴포넌트 로드
    loadComponents();
    
    // 네비게이션 이벤트 초기화
    initializeNavigation();
    
    // FAQ 기능 초기화
    initializeFAQ();
    
    // 스크롤 효과 초기화
    initializeScrollEffects();
});

// 컴포넌트 로딩 함수
async function loadComponent(componentName, targetId) {
    try {
        const response = await fetch(`/_includes/${componentName}.html`);
        if (response.ok) {
            const html = await response.text();
            const target = document.getElementById(targetId);
            if (target) {
                target.innerHTML = html;
                
                // 네비게이션 로드 후 모바일 메뉴 초기화
                if (componentName === 'navbar') {
                    initializeMobileMenu();
                }
            }
        } else {
            console.warn(`Failed to load component: ${componentName}`);
        }
    } catch (error) {
        console.error(`Error loading component ${componentName}:`, error);
    }
}

// 모든 컴포넌트 로드
async function loadComponents() {
    const components = [
        { name: 'navbar', target: 'navbar-placeholder' },
        { name: 'footer', target: 'footer-placeholder' }
    ];
    
    // 병렬로 컴포넌트 로드
    await Promise.all(
        components.map(comp => loadComponent(comp.name, comp.target))
    );
}

// 네비게이션 초기화
function initializeNavigation() {
    // 현재 페이지에 따른 네비게이션 활성화
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath.includes(href) && href !== '/')) {
            link.classList.add('active');
        }
    });
}

// 모바일 메뉴 초기화
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // 메뉴 외부 클릭 시 닫기
        document.addEventListener('click', function(e) {
            if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// 모바일 메뉴 토글 (전역 함수로 노출)
function toggleMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    }
}

// FAQ 기능 초기화
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // 모든 FAQ 항목 닫기
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // 클릭한 항목이 닫혀있었다면 열기
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// 스크롤 효과 초기화
function initializeScrollEffects() {
    // 스크롤 시 네비게이션 배경 변경
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Intersection Observer로 애니메이션 효과
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // 애니메이션 대상 요소들 관찰
    const animateElements = document.querySelectorAll('.feature-card, .test-card, .tool-card, .stat-item');
    animateElements.forEach(el => observer.observe(el));
}

// 부드러운 스크롤
function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 폼 검증 유틸리티
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        const value = input.value.trim();
        const errorElement = input.parentElement.querySelector('.form-error');
        
        if (!value) {
            input.classList.add('error');
            if (errorElement) {
                errorElement.textContent = '이 필드는 필수입니다.';
            }
            isValid = false;
        } else {
            input.classList.remove('error');
            if (errorElement) {
                errorElement.textContent = '';
            }
        }
    });
    
    return isValid;
}

// 이메일 검증
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 로딩 상태 관리
function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="spinner"></div>';
        element.disabled = true;
    }
}

function hideLoading(element, originalText) {
    if (element) {
        element.innerHTML = originalText;
        element.disabled = false;
    }
}

// 알림 토스트 표시
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 토스트 스타일
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px'
    });
    
    // 타입별 배경색
    const colors = {
        info: '#6366f1',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
    };
    
    toast.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(toast);
    
    // 애니메이션으로 토스트 표시
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // 지정된 시간 후 토스트 제거
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// 쿠키 유틸리티
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = `${name}=; Max-Age=-99999999;`;
}

// 로컬스토리지 유틸리티
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

function getLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Failed to read from localStorage:', error);
        return null;
    }
}

// 디바운스 유틸리티
function debounce(func, wait) {
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

// 스로틀 유틸리티
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 브라우저 지원 체크
function checkBrowserSupport() {
    const features = {
        localStorage: typeof(Storage) !== 'undefined',
        fetch: typeof(fetch) !== 'undefined',
        promises: typeof(Promise) !== 'undefined',
        intersectionObserver: 'IntersectionObserver' in window
    };
    
    return features;
}

// 성능 측정
function measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
}

// 전역 함수로 노출
window.toggleMobileMenu = toggleMobileMenu;
window.smoothScrollTo = smoothScrollTo;
window.showToast = showToast;