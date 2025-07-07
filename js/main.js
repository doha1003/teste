// 모바일 메뉴 토글
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
    
    if (menuBtn) {
        menuBtn.classList.toggle('active');
    }
}

// 서비스 탭 필터링 (운세 탭 포함)
function showServices(category) {
    const cards = document.querySelectorAll('.service-card');
    const buttons = document.querySelectorAll('.tab-button');
    
    // 버튼 활성화 상태 변경
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 클릭된 버튼 찾아서 활성화
    buttons.forEach(btn => {
        if ((category === 'all' && btn.textContent.includes('전체')) ||
            (category === 'tests' && btn.textContent.includes('심리테스트')) ||
            (category === 'tools' && btn.textContent.includes('실용도구')) ||
            (category === 'fortune' && btn.textContent.includes('운세')) ||
            (category === 'new' && btn.textContent.includes('최신'))) {
            btn.classList.add('active');
        }
    });
    
    // 카드 필터링
    cards.forEach(card => {
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

// 스크롤 애니메이션
function handleScrollAnimation() {
    const elements = document.querySelectorAll('.fade-in');
    
    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible && !element.classList.contains('animated')) {
            element.classList.add('animated');
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// 부드러운 스크롤
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 페이지 로드 시 애니메이션
function initPageAnimations() {
    // 초기 애니메이션 트리거
    handleScrollAnimation();
    
    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', throttle(handleScrollAnimation, 100));
}

// 쓰로틀 함수 (성능 최적화)
function throttle(func, wait) {
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

// 폼 유효성 검사
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;
    
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
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
    const text = encodeURIComponent(title);
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
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 로컬 스토리지 헬퍼
const storage = {
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
            return item ? JSON.parse(item) : null;
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

// 디바운스 함수
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

// 날짜 포맷팅
function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
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
}

// 숫자 포맷팅 (천 단위 콤마)
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// URL 파라미터 가져오기
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 이미지 지연 로딩
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
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

.animated {
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
`;

// 스타일 삽입
function injectStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = animationStyles;
    document.head.appendChild(styleElement);
}

// 컴포넌트 로더
async function loadComponent(componentName, targetId) {
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

// 네비게이션과 푸터 컴포넌트 로드
async function loadComponents() {
    const navTarget = document.getElementById('navbar-placeholder');
    const footerTarget = document.getElementById('footer-placeholder');
    
    if (navTarget) {
        await loadComponent('navbar', 'navbar-placeholder');
    }
    
    if (footerTarget) {
        await loadComponent('footer', 'footer-placeholder');
    }
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', async function() {
    // 컴포넌트 로드
    await loadComponents();
    
    // 스타일 삽입
    injectStyles();
    
    // 페이지 애니메이션 초기화
    initPageAnimations();
    
    // 이미지 지연 로딩
    lazyLoadImages();
    
    // 다크 모드 초기화
    initDarkMode();
    
    // AdSense 광고 로드
    if (typeof adsbygoogle !== 'undefined') {
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }
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