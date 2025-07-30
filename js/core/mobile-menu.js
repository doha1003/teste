/**
 * Mobile Menu Handler
 * 모바일 메뉴 토글 기능
 */

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        // 모바일 메뉴 토글 버튼 생성
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        // 기존 메뉴 토글이 없으면 생성
        let menuToggle = navbar.querySelector('.mobile-menu-toggle');
        if (!menuToggle) {
            menuToggle = document.createElement('button');
            menuToggle.className = 'mobile-menu-toggle';
            menuToggle.setAttribute('aria-label', '메뉴 열기');
            menuToggle.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 12h18M3 6h18M3 18h18"></path>
                </svg>
            `;
            
            // 네비게이션 바에 추가
            const navContainer = navbar.querySelector('.nav-container') || navbar;
            navContainer.appendChild(menuToggle);
        }
        
        // 모바일 메뉴 생성
        let mobileMenu = document.querySelector('.mobile-menu');
        if (!mobileMenu) {
            mobileMenu = document.createElement('div');
            mobileMenu.className = 'mobile-menu';
            
            // 기존 메뉴 복사
            const navMenu = navbar.querySelector('.nav-menu');
            if (navMenu) {
                mobileMenu.innerHTML = `
                    <div class="mobile-menu-header">
                        <span class="mobile-menu-title">메뉴</span>
                        <button class="mobile-menu-close" aria-label="메뉴 닫기">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="mobile-menu-content">
                        ${navMenu.innerHTML}
                    </div>
                `;
            }
            
            document.body.appendChild(mobileMenu);
        }
        
        // 오버레이 생성
        let overlay = document.querySelector('.mobile-menu-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'mobile-menu-overlay';
            document.body.appendChild(overlay);
        }
        
        // 이벤트 핸들러
        const closeMenu = () => {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            menuToggle.setAttribute('aria-label', '메뉴 열기');
        };
        
        const openMenu = () => {
            mobileMenu.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            menuToggle.setAttribute('aria-label', '메뉴 닫기');
        };
        
        // 토글 버튼 클릭
        menuToggle.addEventListener('click', () => {
            if (mobileMenu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        // 닫기 버튼 클릭
        const closeButton = mobileMenu.querySelector('.mobile-menu-close');
        if (closeButton) {
            closeButton.addEventListener('click', closeMenu);
        }
        
        // 오버레이 클릭
        overlay.addEventListener('click', closeMenu);
        
        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMenu();
            }
        });
        
        // 링크 클릭 시 메뉴 닫기
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        
        // 리사이즈 시 메뉴 닫기
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
                    closeMenu();
                }
            }, 250);
        });
    });
})();