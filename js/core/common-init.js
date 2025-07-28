/**
 * 공통 초기화 스크립트
 * 모든 페이지에서 사용되는 공통 로직을 모듈화
 */

(function() {
    'use strict';
    
    // 전역 네임스페이스
    window.DohaKR = window.DohaKR || {};
    
    /**
     * Google AdSense 초기화
     */
    DohaKR.initAdsense = function() {
        if (typeof adsbygoogle === 'undefined') {
            console.warn('AdSense 스크립트가 로드되지 않았습니다.');
            return;
        }
        
        const ads = document.querySelectorAll('.adsbygoogle:not([data-ad-status])');
        ads.forEach((ad) => {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
                ad.setAttribute('data-ad-status', 'loaded');
            } catch (e) {
                console.error('AdSense 초기화 실패:', e);
                ad.style.display = 'none';
            }
        });
    };
    
    /**
     * Kakao SDK 초기화
     */
    DohaKR.initKakao = function() {
        if (typeof Kakao === 'undefined') {
            console.warn('Kakao SDK가 로드되지 않았습니다.');
            return;
        }
        
        if (!Kakao.isInitialized()) {
            // GitHub Actions에서 주입된 API 키 사용
            const apiKey = window.KAKAO_API_KEY || 'YOUR_JAVASCRIPT_KEY';
            Kakao.init(apiKey);
            console.log('Kakao SDK 초기화 완료');
        }
    };
    
    /**
     * 네비게이션 및 푸터 로드
     */
    DohaKR.loadIncludes = function() {
        // 네비게이션 로드
        const navPlaceholder = document.getElementById('navbar-placeholder');
        if (navPlaceholder) {
            fetch('/includes/navbar.html')
                .then(response => response.text())
                .then(data => {
                    navPlaceholder.innerHTML = data;
                    DohaKR.initMobileMenu();
                })
                .catch(error => {
                    console.error('네비게이션 로드 실패:', error);
                });
        }
        
        // 푸터 로드
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            fetch('/includes/footer.html')
                .then(response => response.text())
                .then(data => {
                    footerPlaceholder.innerHTML = data;
                })
                .catch(error => {
                    console.error('푸터 로드 실패:', error);
                });
        }
    };
    
    /**
     * 모바일 메뉴 초기화
     */
    DohaKR.initMobileMenu = function() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
                
                // 메뉴 열릴 때 body 스크롤 방지
                if (navMenu.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            });
            
            // 메뉴 외부 클릭 시 닫기
            document.addEventListener('click', function(event) {
                if (!event.target.closest('.navbar')) {
                    navMenu.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    };
    
    /**
     * Google Analytics 초기화
     */
    DohaKR.initAnalytics = function() {
        if (typeof gtag === 'undefined') {
            console.warn('Google Analytics가 로드되지 않았습니다.');
            return;
        }
        
        // 페이지뷰 전송
        gtag('config', 'G-XXXXXXXXXX', {
            page_path: window.location.pathname
        });
    };
    
    /**
     * 페이지별 초기화 함수 실행
     */
    DohaKR.initPage = function() {
        const pageType = document.body.dataset.page;
        if (!pageType) return;
        
        // 페이지별 초기화 함수가 있으면 실행
        const initFunctionName = pageType.replace(/-/g, '') + 'Init';
        if (typeof window[initFunctionName] === 'function') {
            window[initFunctionName]();
        }
    };
    
    /**
     * 공통 유틸리티 함수들
     */
    DohaKR.utils = {
        // 쿠키 가져오기
        getCookie: function(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        },
        
        // 쿠키 설정
        setCookie: function(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${date.toUTCString()}`;
            document.cookie = `${name}=${value};${expires};path=/`;
        },
        
        // 날짜 포맷
        formatDate: function(date) {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}년 ${month}월 ${day}일`;
        },
        
        // 로딩 표시
        showLoading: function(element) {
            element.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>잠시만 기다려주세요...</p>
                </div>
            `;
        },
        
        // 에러 표시
        showError: function(element, message) {
            element.innerHTML = `
                <div class="error-message">
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">다시 시도</button>
                </div>
            `;
        }
    };
    
    /**
     * DOM 로드 완료 시 초기화
     */
    document.addEventListener('DOMContentLoaded', function() {
        // 공통 컴포넌트 로드
        DohaKR.loadIncludes();
        
        // 광고 초기화 (1초 지연)
        setTimeout(() => {
            DohaKR.initAdsense();
        }, 1000);
        
        // Kakao SDK 초기화
        DohaKR.initKakao();
        
        // Analytics 초기화
        DohaKR.initAnalytics();
        
        // 페이지별 초기화
        DohaKR.initPage();
        
        // 이미지 지연 로딩 polyfill
        if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                img.src = img.src;
            });
        } else {
            // Fallback for browsers that don't support lazy loading
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
            document.body.appendChild(script);
        }
    });
    
})();