// 모바일 메뉴 토글 - DohaApp의 기능 사용
function toggleMobileMenu() {
    if (window.DohaApp && DohaApp.components && DohaApp.components.mobileMenu) {
        DohaApp.components.mobileMenu.toggle();
    } else {
        // 폴백: DohaApp이 없을 경우 기본 동작
        const navMenu = document.querySelector('.nav-menu, .nav');
        const menuBtn = document.querySelector('.mobile-menu-btn, .header__menu-toggle');
        
        if (navMenu) {
            const isOpen = navMenu.classList.toggle('active');
            navMenu.classList.toggle('nav--open');
            
            if (menuBtn) {
                menuBtn.setAttribute('aria-expanded', isOpen.toString());
                menuBtn.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
            }
        }
        
        if (menuBtn) {
            menuBtn.classList.toggle('active');
        }
    }
}

// 서비스 탭 필터링 - DohaApp의 기능과 호환
function showServices(category, event) {
    // DohaApp의 tabs 컴포넌트가 있으면 사용
    if (window.DohaApp && DohaApp.components && DohaApp.components.tabs) {
        DohaApp.components.tabs.filterServices(category);
        
        // 버튼 상태 업데이트
        const buttons = document.querySelectorAll('.tab-button, [role="tab"]');
        buttons.forEach(btn => {
            btn.classList.remove('active', 'tabs__button--active');
            btn.setAttribute('aria-selected', 'false');
            
            if ((category === 'all' && btn.textContent.includes('전체')) ||
                (category === 'tests' && btn.textContent.includes('심리테스트')) ||
                (category === 'tools' && btn.textContent.includes('실용도구')) ||
                (category === 'fortune' && btn.textContent.includes('운세')) ||
                (category === 'new' && btn.textContent.includes('최신'))) {
                btn.classList.add('active', 'tabs__button--active');
                btn.setAttribute('aria-selected', 'true');
            }
        });
    } else {
        // 폴백: 기본 필터링 로직
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            if (!card) return;
            
            if (category === 'all') {
                card.style.display = 'block';
            } else {
                const cardCategories = card.getAttribute('data-category');
                if (cardCategories && cardCategories.includes(category)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    }
}

// 스크롤 애니메이션 - 인라인 스타일 제거하여 CSS 애니메이션과 충돌 방지
function handleScrollAnimation() {
    try {
        const elements = document.querySelectorAll('.fade-in');
        
        elements.forEach(element => {
            if (!element) return;
            
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible && !element.classList.contains('animated')) {
                element.classList.add('animated');
                // 인라인 스타일 제거 - CSS에서 처리하도록 함
                // element.style.opacity = '1';
                // element.style.transform = 'translateY(0)';
            }
        });
    } catch (error) {
        console.error('스크롤 애니메이션 처리 중 오류:', error);
    }
}

// 부드러운 스크롤 - DohaApp과 호환
function smoothScroll(target) {
    try {
        const element = document.querySelector(target);
        if (element) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const targetPosition = element.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // 접근성을 위한 포커스 설정
            element.setAttribute('tabindex', '-1');
            element.focus();
        }
    } catch (error) {
        console.error('스크롤 처리 중 오류:', error);
    }
}

// 페이지 로드 시 애니메이션
function initPageAnimations() {
    // 초기 애니메이션 트리거
    handleScrollAnimation();
    
    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', throttle(handleScrollAnimation, 100));
}

// 쓰로틀 함수 - DohaApp.utils.throttle 사용 가능
function throttle(func, limit) {
    if (window.DohaApp && DohaApp.utils && DohaApp.utils.throttle) {
        return DohaApp.utils.throttle(func, limit);
    }
    
    // 폴백: 기본 쓰로틀 구현
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 폼 유효성 검사
function validateForm(formId) {
    try {
        const form = document.getElementById(formId);
        if (!form) return true;
        
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input) return;
            
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });
        
        return isValid;
    } catch (error) {
        console.error('폼 유효성 검사 중 오류:', error);
        return false;
    }
}

// 쿠키 관련 함수들
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// 결과 공유 기능
function shareResult(platform, title, url) {
    try {
        const text = encodeURIComponent(title || '');
        const encodedUrl = encodeURIComponent(url || window.location.href);
        
        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
            kakao: `https://story.kakao.com/share?url=${encodedUrl}`,
            line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
            copylink: null
        };
        
        if (platform === 'copylink') {
            copyToClipboard(url || window.location.href);
            showNotification('링크가 복사되었습니다!');
        } else if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    } catch (error) {
        console.error('공유 기능 오류:', error);
        showNotification('공유 중 오류가 발생했습니다.', 'error');
    }
}

// 클립보드에 복사
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('복사 실패:', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// 클립보드 복사 폴백
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('복사 실패:', err);
    }
    
    document.body.removeChild(textArea);
}

// 알림 표시
function showNotification(message, type = 'success') {
    try {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 스타일 추가
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    } catch (error) {
        console.error('알림 표시 중 오류:', error);
    }
}

// 로컬 스토리지 헬퍼 - DohaApp.utils.storage 우선 사용
const storage = (window.DohaApp && DohaApp.utils && DohaApp.utils.storage) || {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },
    
    get(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;
            
            // Try to parse as JSON, fallback to raw string
            try {
                return JSON.parse(item);
            } catch (parseError) {
                // If JSON parsing fails, return the raw value
                return item;
            }
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage clear error:', e);
            return false;
        }
    }
};

// 디바운스 함수 - DohaApp.utils.debounce 사용 가능
function debounce(func, wait) {
    if (window.DohaApp && DohaApp.utils && DohaApp.utils.debounce) {
        return DohaApp.utils.debounce(func, wait);
    }
    
    // 폴백: 기본 디바운스 구현
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

// 날짜 포맷팅
function formatDate(date, format = 'YYYY-MM-DD') {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            console.error('잘못된 날짜 형식:', date);
            return format;
        }
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes);
    } catch (error) {
        console.error('날짜 포맷팅 오류:', error);
        return format;
    }
}

// 숫자 포맷팅 (천 단위 콤마)
function formatNumber(num) {
    try {
        if (num === null || num === undefined) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } catch (error) {
        console.error('숫자 포맷팅 오류:', error);
        return '0';
    }
}

// URL 파라미터 가져오기
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 이미지 지연 로딩 - DohaApp.components.lazyLoad와 호환
function lazyLoadImages() {
    try {
        // data-src 속성 사용하는 이미지 처리
        const images = document.querySelectorAll('img[data-src]:not(.lazy)');
        
        if (!images.length) return;
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img && img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            });
            
            images.forEach(img => {
                if (img) imageObserver.observe(img);
            });
        } else {
            // 폴백: 즉시 로드
            images.forEach(img => {
                if (img && img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
        }
    } catch (error) {
        console.error('이미지 지연 로딩 오류:', error);
    }
}

// 다크 모드 토글
function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    storage.set('darkMode', isDarkMode);
    return isDarkMode;
}

// 다크 모드 초기화
function initDarkMode() {
    const isDarkMode = storage.get('darkMode');
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

// 운세 관련 함수들
function fortuneHelpers() {
    // 운세 결과 저장
    function saveFortune(type, data) {
        const today = formatDate(new Date(), 'YYYY-MM-DD');
        const fortuneKey = `fortune_${type}_${today}`;
        storage.set(fortuneKey, data);
    }
    
    // 운세 결과 불러오기
    function loadFortune(type) {
        const today = formatDate(new Date(), 'YYYY-MM-DD');
        const fortuneKey = `fortune_${type}_${today}`;
        return storage.get(fortuneKey);
    }
    
    // 운세 공유하기
    function shareFortune(platform, fortuneType, result) {
        const title = `doha.kr에서 ${fortuneType} 결과를 확인했어요!`;
        const url = window.location.href;
        shareResult(platform, title, url);
    }
    
    return {
        save: saveFortune,
        load: loadFortune,
        share: shareFortune
    };
}

// 애니메이션 클래스 추가를 위한 CSS
const animationStyles = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

/* animated 클래스가 추가되면 CSS 애니메이션이 작동하도록 함 */
.fade-in.animated {
    opacity: 1 !important;
    transform: translateY(0) !important;
}

input.error, textarea.error {
    border-color: #ef4444 !important;
}

.dark-mode {
    --gray-50: #111827;
    --gray-100: #1f2937;
    --gray-200: #374151;
    --gray-300: #4b5563;
    --gray-400: #6b7280;
    --gray-500: #9ca3af;
    --gray-600: #d1d5db;
    --gray-700: #e5e7eb;
    --gray-800: #f3f4f6;
    --gray-900: #f9fafb;
}

/* Responsive AdSense Styles - Global Fix */
.ad-container {
    min-height: 250px !important;
    margin: 40px auto !important;
    max-width: 1200px !important;
    padding: 0 20px !important;
    text-align: center !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

.ad-label {
    font-size: 12px !important;
    color: #666 !important;
    margin-bottom: 8px !important;
    text-align: center !important;
}

.adsbygoogle {
    min-height: 90px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
    display: block !important;
}

/* Ensure ads have minimum width on mobile */
@media (max-width: 320px) {
    .ad-container {
        min-width: 300px !important;
        padding: 0 10px !important;
    }
}

/* Small mobile devices */
@media (max-width: 480px) {
    .ad-container {
        min-height: 100px !important;
        padding: 0 15px !important;
    }
}

/* Tablet and desktop responsive sizes */
@media (min-width: 768px) {
    .ad-container {
        min-height: 100px !important;
    }
}

@media (min-width: 1024px) {
    .ad-container {
        min-height: 90px !important;
    }
}
`;

// 스타일 삽입
function injectStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = animationStyles;
    document.head.appendChild(styleElement);
}

// 컴포넌트 로더 (ID 기반)
async function loadComponentById(componentName, targetId) {
    try {
        const response = await fetch(`/includes/${componentName}.html`);
        if (response.ok) {
            const html = await response.text();
            const target = document.getElementById(targetId);
            if (target) {
                target.innerHTML = html;
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error(`Failed to load component ${componentName}:`, error);
        
        // Fallback content
        const target = document.getElementById(targetId);
        if (!target) return;
        
        if (componentName === 'navbar') {
            target.innerHTML = `
                <nav class="navbar">
                    <div class="navbar-container">
                        <a href="/" class="logo">doha.kr</a>
                        <ul class="nav-menu">
                            <li><a href="/" class="nav-link">홈</a></li>
                            <li><a href="/tests/" class="nav-link">심리테스트</a></li>
                            <li><a href="/tools/" class="nav-link">실용도구</a></li>
                            <li><a href="/fortune/" class="nav-link">운세</a></li>
                            <li><a href="/contact/" class="nav-link">문의</a></li>
                            <li><a href="/about/" class="nav-link">소개</a></li>
                        </ul>
                        <button class="mobile-menu-btn" onclick="toggleMobileMenu()">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </nav>
            `;
        } else if (componentName === 'footer') {
            target.innerHTML = `
                <footer class="footer">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h3>doha.kr</h3>
                            <p style="color: var(--gray-400); margin-top: 8px;">
                                일상을 더 재미있게 만드는 공간<br>
                                심리테스트, 실용도구, 운세의 만남
                            </p>
                            <div class="footer-social">
                                <a href="mailto:youtubdoha@gmail.com" class="social-link">📧</a>
                            </div>
                        </div>
                        
                        <div class="footer-section">
                            <h3>서비스</h3>
                            <ul class="footer-links">
                                <li><a href="/">홈</a></li>
                                <li><a href="/tests/">심리테스트</a></li>
                                <li><a href="/tools/">실용도구</a></li>
                                <li><a href="/fortune/">운세</a></li>
                                <li><a href="/about/">사이트 소개</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer-section">
                            <h3>인기 콘텐츠</h3>
                            <ul class="footer-links">
                                <li><a href="/tests/teto-egen/">테토-에겐 테스트</a></li>
                                <li><a href="/tests/mbti/">MBTI 테스트</a></li>
                                <li><a href="/fortune/daily/">오늘의 운세</a></li>
                                <li><a href="/tools/text-counter.html">글자수 세기</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer-section">
                            <h3>운세 & 고객지원</h3>
                            <ul class="footer-links">
                                <li><a href="/fortune/daily/">오늘의 운세</a></li>
                                <li><a href="/fortune/tarot/">타로 카드</a></li>
                                <li><a href="/fortune/zodiac/">별자리 운세</a></li>
                                <li><a href="/contact/">문의하기</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <div class="footer-legal">
                            <a href="/privacy/">개인정보처리방침</a>
                            <a href="/terms/">이용약관</a>
                        </div>
                        <p>&copy; 2025 doha.kr. All rights reserved.</p>
                    </div>
                </footer>
            `;
        }
    }
}

// 컴포넌트 로더 (클래스 기반 - 하위 호환성)
async function loadComponent(componentName, targetClass) {
    try {
        const response = await fetch(`/includes/${componentName}.html`);
        if (response.ok) {
            const html = await response.text();
            const target = document.querySelector(`.${targetClass}`);
            if (target) {
                target.innerHTML = html;
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error(`Failed to load component ${componentName}:`, error);
        
        // Fallback content
        const target = document.querySelector(`.${targetClass}`);
        if (!target) return;
        
        if (componentName === 'navbar') {
            target.innerHTML = `
                <nav class="navbar">
                    <div class="navbar-container">
                        <a href="/" class="logo">doha.kr</a>
                        <ul class="nav-menu">
                            <li><a href="/" class="nav-link">홈</a></li>
                            <li><a href="/tests/" class="nav-link">심리테스트</a></li>
                            <li><a href="/tools/" class="nav-link">실용도구</a></li>
                            <li><a href="/fortune/" class="nav-link">운세</a></li>
                            <li><a href="/contact/" class="nav-link">문의</a></li>
                            <li><a href="/about/" class="nav-link">소개</a></li>
                        </ul>
                        <button class="mobile-menu-btn" onclick="toggleMobileMenu()">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </nav>
            `;
        } else if (componentName === 'footer') {
            target.innerHTML = `
                <footer class="footer">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h3>doha.kr</h3>
                            <p style="color: var(--gray-400); margin-top: 8px;">
                                일상을 더 재미있게 만드는 공간<br>
                                심리테스트, 실용도구, 운세의 만남
                            </p>
                            <div class="footer-social">
                                <a href="mailto:youtubdoha@gmail.com" class="social-link">📧</a>
                            </div>
                        </div>
                        
                        <div class="footer-section">
                            <h3>서비스</h3>
                            <ul class="footer-links">
                                <li><a href="/">홈</a></li>
                                <li><a href="/tests/">심리테스트</a></li>
                                <li><a href="/tools/">실용도구</a></li>
                                <li><a href="/fortune/">운세</a></li>
                                <li><a href="/about/">사이트 소개</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer-section">
                            <h3>인기 콘텐츠</h3>
                            <ul class="footer-links">
                                <li><a href="/tests/teto-egen/">테토-에겐 테스트</a></li>
                                <li><a href="/tests/mbti/">MBTI 테스트</a></li>
                                <li><a href="/fortune/daily/">오늘의 운세</a></li>
                                <li><a href="/tools/text-counter.html">글자수 세기</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer-section">
                            <h3>운세 & 고객지원</h3>
                            <ul class="footer-links">
                                <li><a href="/fortune/daily/">오늘의 운세</a></li>
                                <li><a href="/fortune/tarot/">타로 카드</a></li>
                                <li><a href="/fortune/zodiac/">별자리 운세</a></li>
                                <li><a href="/contact/">문의하기</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <div class="footer-legal">
                            <a href="/privacy/">개인정보처리방침</a>
                            <a href="/terms/">이용약관</a>
                        </div>
                        <p>&copy; 2025 doha.kr. All rights reserved.</p>
                    </div>
                </footer>
            `;
        }
    }
}

// 네비게이션과 푸터 컴포넌트 로드
async function loadComponents() {
    const navTarget = document.querySelector('#navbar-placeholder');
    const footerTarget = document.querySelector('#footer-placeholder');
    
    if (navTarget) {
        await loadComponentById('navbar', 'navbar-placeholder');
    }
    
    if (footerTarget) {
        await loadComponentById('footer', 'footer-placeholder');
    }
}

// Global AdSense responsive fix
function fixAdSenseResponsive() {
    // Find all AdSense containers
    const adContainers = document.querySelectorAll('.ad-container');
    
    adContainers.forEach(container => {
        // Ensure minimum width to prevent "availableWidth=29" error
        container.style.minWidth = '300px';
        container.style.width = '100%';
        container.style.boxSizing = 'border-box';
        container.style.padding = '0 20px';
        container.style.margin = '40px auto';
        container.style.maxWidth = '1200px';
        
        // Find AdSense ins element
        const ins = container.querySelector('.adsbygoogle');
        if (ins) {
            ins.style.minHeight = '90px';
            ins.style.width = '100%';
            ins.style.maxWidth = '100%';
            ins.style.overflow = 'hidden';
            ins.style.display = 'block';
            
            // Ensure responsive attribute is set
            if (!ins.hasAttribute('data-full-width-responsive')) {
                ins.setAttribute('data-full-width-responsive', 'true');
            }
        }
    });
    
    // Monitor viewport width and adjust padding
    function checkAdContainers() {
        const width = window.innerWidth;
        adContainers.forEach(container => {
            if (width < 320) {
                container.style.padding = '0 10px';
                container.style.minWidth = '300px';
            } else if (width < 480) {
                container.style.padding = '0 15px';
            } else {
                container.style.padding = '0 20px';
            }
        });
    }
    
    // Check on load and resize
    checkAdContainers();
    window.addEventListener('resize', debounce(checkAdContainers, 250));
}

// AdSense 초기화 함수 (수정된 버전)
function initAdSense() {
    try {
        // Apply responsive fix first
        fixAdSenseResponsive();
        
        // 이미 처리된 광고 슬롯은 제외
        const adSlots = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
        
        if (adSlots.length === 0) {
            return; // 처리할 광고가 없음
        }
        
        // 각 광고 슬롯 크기 검증
        adSlots.forEach((slot, index) => {
            const rect = slot.getBoundingClientRect();
            
            // 크기가 너무 작은 경우 최소 크기 설정
            if (rect.width < 50) {
                slot.style.minWidth = '320px';
                slot.style.width = '100%';
            }
            
            if (rect.height < 50) {
                slot.style.minHeight = '100px';
            }
            
            // 상태 표시하여 중복 처리 방지
            slot.setAttribute('data-adsbygoogle-status', 'processing');
        });
        
        // AdSense 스크립트가 로드되었는지 확인
        if (typeof adsbygoogle !== 'undefined') {
            adSlots.forEach((slot, index) => {
                try {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                    slot.setAttribute('data-adsbygoogle-status', 'loaded');
                } catch (error) {
                    console.error(`AdSense 슬롯 ${index} 로딩 오류:`, error);
                    slot.setAttribute('data-adsbygoogle-status', 'error');
                }
            });
        } else {
            console.warn('AdSense 스크립트가 아직 로드되지 않음');
            // 나중에 다시 시도
            setTimeout(initAdSense, 2000);
        }
        
    } catch (error) {
        console.error('AdSense 초기화 전체 오류:', error);
    }
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', async function() {
    // DohaApp이 이미 초기화되었는지 확인
    const isDohaAppInitialized = window.DohaApp && typeof DohaApp.init === 'function';
    
    if (!isDohaAppInitialized) {
        // DohaApp이 없을 때만 컴포넌트 로드
        await loadComponents();
    }
    
    // 스타일 삽입
    injectStyles();
    
    // 페이지 애니메이션 초기화
    initPageAnimations();
    
    // 이미지 지연 로딩 (DohaApp과 별도로 data-src 이미지 처리)
    lazyLoadImages();
    
    // 다크 모드 초기화
    initDarkMode();
    
    // Apply AdSense responsive fix immediately
    fixAdSenseResponsive();
});

// 윈도우 로드 완료 후 AdSense 초기화
window.addEventListener('load', function() {
    setTimeout(initAdSense, 1000);
});

// 전역 함수로 내보내기
window.toggleMobileMenu = toggleMobileMenu;
window.showServices = showServices;
window.shareResult = shareResult;
window.showNotification = showNotification;
window.validateForm = validateForm;
window.storage = storage;
window.formatDate = formatDate;
window.formatNumber = formatNumber;
window.toggleDarkMode = toggleDarkMode;
window.fortuneHelpers = fortuneHelpers();