/**
 * 404 Error Page JavaScript
 * 404 오류 페이지 기능 구현
 */

(function() {
    'use strict';
    
    class ErrorPage {
        constructor() {
            this.config = {
                animation: {
                    fadeDelay: 200,
                    observerThreshold: 0.1
                },
                analytics: {
                    trackError: true,
                    trackClicks: true
                },
                suggestions: {
                    rotate: true,
                    interval: 5000 // 5초마다 회전
                }
            };
            
            this.suggestionTimer = null;
            this.init();
        }
        
        /**
         * 초기화
         */
        init() {
            // DOM이 준비되면 실행
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
            } else {
                this.onDOMReady();
            }
            
            // 페이지 로드 완료시 실행
            window.addEventListener('load', () => this.onPageLoad());
        }
        
        /**
         * DOM 준비 완료시 실행
         */
        onDOMReady() {
            this.initScrollAnimations();
            this.initActionButtons();
            this.initPopularLinks();
            this.trackErrorOccurrence();
        }
        
        /**
         * 페이지 로드 완료시 실행
         */
        onPageLoad() {
            this.initAdSense();
            this.initKakaoSDK();
            this.trackPageView();
            this.startSuggestionRotation();
        }
        
        /**
         * 스크롤 애니메이션 초기화
         */
        initScrollAnimations() {
            const animatedElements = document.querySelectorAll('.fade-in');
            
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry, index) => {
                        if (entry.isIntersecting) {
                            // 순차적 애니메이션을 위한 지연
                            setTimeout(() => {
                                entry.target.classList.add('visible');
                            }, index * this.config.animation.fadeDelay);
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: this.config.animation.observerThreshold,
                    rootMargin: '0px 0px -50px 0px'
                });
                
                animatedElements.forEach(el => observer.observe(el));
            } else {
                // 폴백: 모든 요소 즉시 표시
                animatedElements.forEach(el => el.classList.add('visible'));
            }
        }
        
        /**
         * 액션 버튼 초기화
         */
        initActionButtons() {
            const actionButtons = document.querySelectorAll('.error-actions .btn[data-action]');
            
            actionButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const action = button.dataset.action;
                    
                    // 클릭 추적
                    this.trackEvent('404_action_click', {
                        action: action,
                        href: button.href,
                        text: button.textContent.trim()
                    });
                    
                    // 버튼 클릭 효과
                    this.addButtonClickEffect(button);
                });
            });
        }
        
        /**
         * 인기 링크 초기화
         */
        initPopularLinks() {
            const popularLinks = document.querySelectorAll('.popular-link[data-link]');
            
            popularLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const linkType = link.dataset.link;
                    
                    // 클릭 추적
                    this.trackEvent('404_popular_link_click', {
                        link_type: linkType,
                        href: link.href,
                        text: link.querySelector('.popular-link-text')?.textContent.trim()
                    });
                    
                    // 링크 클릭 효과
                    this.addLinkClickEffect(link);
                });
            });
        }
        
        /**
         * 버튼 클릭 효과
         */
        addButtonClickEffect(button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        }
        
        /**
         * 링크 클릭 효과
         */
        addLinkClickEffect(link) {
            link.style.transform = 'translateY(-2px)';
            setTimeout(() => {
                link.style.transform = '';
            }, 200);
        }
        
        /**
         * 제안 회전 시작
         */
        startSuggestionRotation() {
            if (!this.config.suggestions.rotate) return;
            
            const popularLinks = document.querySelectorAll('.popular-link');
            if (popularLinks.length === 0) return;
            
            let currentIndex = 0;
            
            this.suggestionTimer = setInterval(() => {
                // 모든 링크에서 highlight 클래스 제거
                popularLinks.forEach(link => link.classList.remove('highlight'));
                
                // 현재 링크에 highlight 클래스 추가
                popularLinks[currentIndex].classList.add('highlight');
                
                // 다음 인덱스로 이동
                currentIndex = (currentIndex + 1) % popularLinks.length;
            }, this.config.suggestions.interval);
        }
        
        /**
         * 404 오류 발생 추적
         */
        trackErrorOccurrence() {
            if (!this.config.analytics.trackError) return;
            
            const referrer = document.referrer || 'direct';
            const currentUrl = window.location.href;
            const userAgent = navigator.userAgent;
            
            this.trackEvent('404_error', {
                url: currentUrl,
                referrer: referrer,
                user_agent: userAgent,
                timestamp: new Date().toISOString()
            });
        }
        
        /**
         * AdSense 초기화
         */
        initAdSense() {
            if (window.__adsenseInitialized) return;
            window.__adsenseInitialized = true;
            
            setTimeout(() => this.loadAds(), 1000);
        }
        
        /**
         * 광고 로드
         */
        loadAds() {
            const adContainers = document.querySelectorAll('[data-ad-slot]');
            
            adContainers.forEach(container => {
                if (container.querySelector('.adsbygoogle')) return;
                
                const adSlot = container.dataset.adSlot;
                const ins = document.createElement('ins');
                ins.className = 'adsbygoogle';
                ins.style.display = 'block';
                ins.setAttribute('data-ad-client', 'ca-pub-7905640648499222');
                ins.setAttribute('data-ad-slot', adSlot);
                ins.setAttribute('data-ad-format', 'auto');
                ins.setAttribute('data-full-width-responsive', 'true');
                
                container.innerHTML = '';
                container.appendChild(ins);
                
                try {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                } catch (e) {
                    console.warn('AdSense load error:', e);
                }
            });
        }
        
        /**
         * 카카오 SDK 초기화
         */
        initKakaoSDK() {
            if (typeof Kakao === 'undefined') return;
            
            if (!window.API_CONFIG || !window.API_CONFIG.KAKAO_JS_KEY) {
                console.warn('Kakao API key not found');
                return;
            }
            
            if (!Kakao.isInitialized()) {
                try {
                    Kakao.init(window.API_CONFIG.KAKAO_JS_KEY);
                    console.log('Kakao SDK initialized');
                } catch (e) {
                    console.error('Kakao SDK init error:', e);
                }
            }
        }
        
        /**
         * 페이지뷰 추적
         */
        trackPageView() {
            this.trackEvent('page_view', {
                page_type: '404',
                page_url: window.location.pathname,
                content_type: 'error'
            });
        }
        
        /**
         * 이벤트 추적
         */
        trackEvent(eventName, eventData) {
            // Google Analytics 또는 다른 분석 도구로 이벤트 전송
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, eventData);
            }
            
            // 개발 환경에서 로그
            if (window.location.hostname === 'localhost') {
                console.log('Track event:', eventName, eventData);
            }
        }
        
        /**
         * 정리 함수
         */
        destroy() {
            if (this.suggestionTimer) {
                clearInterval(this.suggestionTimer);
                this.suggestionTimer = null;
            }
        }
    }
    
    // 전역 인스턴스 생성
    window.errorPage = new ErrorPage();
    
    // 페이지 언로드시 정리
    window.addEventListener('beforeunload', () => {
        if (window.errorPage) {
            window.errorPage.destroy();
        }
    });
    
})();