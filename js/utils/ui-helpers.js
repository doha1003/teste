/**
 * UI 헬퍼 모듈
 * 모든 사용자 인터페이스 관련 공통 함수들
 */

// 모바일 메뉴 토글
export function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
    
    if (menuBtn) {
        menuBtn.classList.toggle('active');
    }
}

// 서비스 탭 필터링
export function showServices(category, event) {
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

// 알림 표시
export function showNotification(message, type = 'success') {
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

// 폼 유효성 검사
export function validateForm(formId) {
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

// 다크 모드 토글
export function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    return isDarkMode;
}

// 다크 모드 초기화
export function initDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

// 이미지 지연 로딩
export function lazyLoadImages() {
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