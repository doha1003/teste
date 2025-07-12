// 컴포넌트 로딩 함수
async function loadComponent(componentPath, placeholderId) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = html;
        }
    } catch (error) {
        console.error(`Failed to load component ${componentPath}:`, error);
        // 폴백 처리
        if (placeholderId === 'footer-placeholder') {
            const placeholder = document.getElementById(placeholderId);
            if (placeholder) {
                placeholder.innerHTML = `
                    <footer class="footer">
                        <div class="container">
                            <p>&copy; 2025 doha.kr. All rights reserved.</p>
                        </div>
                    </footer>
                `;
            }
        }
    }
}

// 네비게이션 로드
async function loadNavbar() {
    await loadComponent('/includes/navbar.html', 'navbar-placeholder');
}

// 푸터 로드
async function loadFooter() {
    await loadComponent('/includes/footer.html', 'footer-placeholder');
}

// 모바일 메뉴 토글
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (navMenu) {
        const isOpen = navMenu.classList.toggle('active');
        
        // ARIA 속성 업데이트
        if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', isOpen.toString());
            menuBtn.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
        }
    }
    
    if (menuBtn) {
        menuBtn.classList.toggle('active');
    }
}

// 모바일 메뉴 외부 클릭 시 닫기
function initMobileMenuHandlers() {
    // 외부 클릭 시 메뉴 닫기
    document.addEventListener('click', function(event) {
        const navMenu = document.querySelector('.nav-menu');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        
        if (navMenu && navMenu.classList.contains('active')) {
            if (!navMenu.contains(event.target) && !menuBtn.contains(event.target)) {
                navMenu.classList.remove('active');
                if (menuBtn) {
                    menuBtn.setAttribute('aria-expanded', 'false');
                    menuBtn.setAttribute('aria-label', '메뉴 열기');
                    menuBtn.classList.remove('active');
                }
            }
        }
    });
    
    // 페이지 로드 시 메뉴가 닫혀있도록 보장
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.remove('active');
    }
}

// 서비스 탭 필터링 (이벤트 파라미터 추가로 오류 수정)
function showServices(category, event) {
    // 이벤트 객체가 없으면 전역 이벤트 사용
    if (!event) {
        event = window.event;
    }
    
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

// 스크롤 애니메이션 - 인라인 스타일 제거하여 CSS 애니메이션과 충돌 방지
function handleScrollAnimation() {
    const elements = document.querySelectorAll('.fade-in');
    
    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible && !element.classList.contains('animated')) {
            element.classList.add('animated');
            // 인라인 스타일 제거 - CSS에서 처리하도록 함
            // element.style.opacity = '1';
            // element.style.transform = 'translateY(0)';
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

// 네비게이션과 푸터 컴포넌트 로드
async function loadComponents() {
    const navTarget = document.getElementById('navbar-placeholder');
    const footerTarget = document.getElementById('footer-placeholder');
    
    if (navTarget) {
        await loadComponent('/includes/navbar.html', 'navbar-placeholder');
    }
    
    if (footerTarget) {
        await loadComponent('/includes/footer.html', 'footer-placeholder');
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
    // 컴포넌트 로드
    await loadComponents();
    
    // 모바일 메뉴 핸들러 초기화
    initMobileMenuHandlers();
    
    // 스타일 삽입
    injectStyles();
    
    // 페이지 애니메이션 초기화
    initPageAnimations();
    
    // 이미지 지연 로딩
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

// 컴포넌트 로드 함수들을 전역으로 내보내기
window.loadNavbar = loadNavbar;
window.loadFooter = loadFooter;
window.loadComponent = loadComponent;