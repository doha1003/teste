/**
 * Fortune Index Page JavaScript
 * 운세 목록 페이지 기능 구현
 */

(function() {
    'use strict';
    
    class FortuneIndexPage {
        constructor() {
            this.config = {
                animation: {
                    fadeDelay: 100,
                    observerThreshold: 0.1
                },
                services: [
                    {
                        id: 'saju',
                        name: 'AI 사주팔자',
                        icon: '🔮',
                        url: '/fortune/saju/',
                        description: '정확한 만세력 기반 사주팔자 분석',
                        badge: '전문',
                        badgeClass: 'premium'
                    },
                    {
                        id: 'daily',
                        name: '일일운세',
                        icon: '🌅',
                        url: '/fortune/daily/',
                        description: '사주팔자 기반 오늘의 운세',
                        badge: '업데이트',
                        badgeClass: 'new'
                    },
                    {
                        id: 'tarot',
                        name: 'AI 타로 리딩',
                        icon: '🃏',
                        url: '/fortune/tarot/',
                        description: 'AI가 해석하는 타로 카드',
                        badge: '인기',
                        badgeClass: 'hot'
                    },
                    {
                        id: 'zodiac',
                        name: '별자리 운세',
                        icon: '♈',
                        url: '/fortune/zodiac/',
                        description: '12개 별자리별 오늘의 운세',
                        badge: '정확',
                        badgeClass: ''
                    },
                    {
                        id: 'zodiac-animal',
                        name: '띠별 운세',
                        icon: '🐅',
                        url: '/fortune/zodiac-animal/',
                        description: '12지신 동물별 운세',
                        badge: '전통',
                        badgeClass: 'traditional'
                    }
                ]
            };
            
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
            this.initServiceCards();
            this.initHeroAnimation();
        }
        
        /**
         * 페이지 로드 완료시 실행
         */
        onPageLoad() {
            this.initAdSense();
            this.initKakaoSDK();
            this.trackPageView();
        }
        
        /**
         * 스크롤 애니메이션 초기화
         */
        initScrollAnimations() {
            const animatedElements = document.querySelectorAll('.fade-in');
            
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
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
         * 서비스 카드 초기화
         */
        initServiceCards() {
            const serviceCards = document.querySelectorAll('.fortune-card');
            
            serviceCards.forEach((card, index) => {
                // 호버 효과 강화
                card.addEventListener('mouseenter', (e) => {
                    this.handleCardHover(e.currentTarget, true);
                });
                
                card.addEventListener('mouseleave', (e) => {
                    this.handleCardHover(e.currentTarget, false);
                });
                
                // 클릭 추적
                card.addEventListener('click', (e) => {
                    const service = card.dataset.service;
                    this.trackServiceClick(service);
                });
                
                // 순차적 애니메이션
                setTimeout(() => {
                    card.classList.add('animated');
                }, index * this.config.animation.fadeDelay);
            });
        }
        
        /**
         * 카드 호버 효과
         */
        handleCardHover(card, isHovering) {
            const icon = card.querySelector('.fortune-card-icon');
            if (icon) {
                if (isHovering) {
                    icon.style.transform = 'scale(1.2) rotate(10deg)';
                } else {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            }
        }
        
        /**
         * 히어로 섹션 애니메이션
         */
        initHeroAnimation() {
            const hero = document.querySelector('.fortune-hero');
            if (!hero) return;
            
            // 배경 그래디언트 애니메이션
            let gradientAngle = 135;
            const animateGradient = () => {
                gradientAngle = (gradientAngle + 0.5) % 360;
                hero.style.background = `linear-gradient(${gradientAngle}deg, #667eea 0%, #764ba2 100%)`;
            };
            
            // 부드러운 애니메이션을 위해 requestAnimationFrame 사용
            const animate = () => {
                animateGradient();
                requestAnimationFrame(animate);
            };
            
            // 애니메이션 시작 (선택적)
            // animate();
        }
        
        /**
         * 서비스 클릭 추적
         */
        trackServiceClick(serviceId) {
            const service = this.config.services.find(s => s.id === serviceId);
            if (!service) return;
            
            this.trackEvent('fortune_service_click', {
                service_id: serviceId,
                service_name: service.name,
                service_url: service.url
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
                page_type: 'fortune_index',
                page_url: window.location.pathname
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
    }
    
    // 전역 인스턴스 생성
    window.fortuneIndexPage = new FortuneIndexPage();
    
})();