/**
 * Love DNA Introduction Page JavaScript
 * 러브 DNA 테스트 소개 페이지 기능 구현
 */

(function() {
    'use strict';
    
    class LoveDnaIntroPage {
        constructor() {
            this.config = {
                animation: {
                    fadeDelay: 200,
                    observerThreshold: 0.1,
                    heartAnimationSpeed: 3000,
                    dnaItemDelay: 150
                },
                analytics: {
                    trackClicks: true,
                    trackDnaViews: true,
                    trackFAQ: true
                }
            };
            
            this.heartAnimationInterval = null;
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
            this.initFAQ();
            this.initDnaItems();
            this.initCTAButtons();
            this.initSectionObserver();
            this.initHeartAnimation();
        }
        
        /**
         * 페이지 로드 완료시 실행
         */
        onPageLoad() {
            this.initAdSense();
            this.initKakaoSDK();
            this.trackPageView();
            this.initFeatureCards();
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
         * 하트 애니메이션 초기화
         */
        initHeartAnimation() {
            const floatingHearts = document.querySelector('.floating-hearts');
            if (!floatingHearts) return;
            
            const hearts = floatingHearts.querySelectorAll('.heart');
            
            // 각 하트에 초기 위치와 애니메이션 설정
            hearts.forEach((heart, index) => {
                this.animateHeart(heart, index);
            });
            
            // 주기적으로 하트 위치 변경
            this.heartAnimationInterval = setInterval(() => {
                hearts.forEach((heart, index) => {
                    this.animateHeart(heart, index);
                });
            }, this.config.animation.heartAnimationSpeed);
        }
        
        /**
         * 개별 하트 애니메이션
         */
        animateHeart(heart, index) {
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 100;
            const randomDelay = index * 200;
            const randomDuration = 2000 + Math.random() * 2000;
            
            heart.style.left = randomX + '%';
            heart.style.top = randomY + '%';
            heart.style.animationDelay = randomDelay + 'ms';
            heart.style.animationDuration = randomDuration + 'ms';
        }
        
        /**
         * FAQ 기능 초기화
         */
        initFAQ() {
            const faqQuestions = document.querySelectorAll('.faq-question');
            
            faqQuestions.forEach(question => {
                question.addEventListener('click', () => {
                    const faqItem = question.parentElement;
                    const wasActive = faqItem.classList.contains('active');
                    
                    // 다른 FAQ 항목들 닫기
                    document.querySelectorAll('.faq-item.active').forEach(item => {
                        if (item !== faqItem) {
                            item.classList.remove('active');
                        }
                    });
                    
                    // 현재 항목 토글
                    if (wasActive) {
                        faqItem.classList.remove('active');
                    } else {
                        faqItem.classList.add('active');
                    }
                    
                    // FAQ 클릭 추적
                    if (this.config.analytics.trackFAQ) {
                        const faqId = faqItem.dataset.faq;
                        this.trackEvent('faq_click', {
                            faq_id: faqId,
                            action: wasActive ? 'close' : 'open',
                            page_type: 'love_dna_intro'
                        });
                    }
                });
            });
        }
        
        /**
         * DNA 분석 항목 초기화
         */
        initDnaItems() {
            const dnaItems = document.querySelectorAll('.love-dna-item[data-axis]');
            
            dnaItems.forEach(item => {
                // 호버 효과
                item.addEventListener('mouseenter', () => {
                    item.style.transform = 'translateY(-8px) scale(1.05)';
                    item.style.boxShadow = '0 15px 35px rgba(255, 105, 180, 0.3)';
                });
                
                item.addEventListener('mouseleave', () => {
                    item.style.transform = '';
                    item.style.boxShadow = '';
                });
                
                // 클릭 이벤트
                item.addEventListener('click', () => {
                    const axis = item.dataset.axis;
                    
                    // DNA 축 클릭 추적
                    if (this.config.analytics.trackDnaViews) {
                        this.trackEvent('dna_axis_click', {
                            axis: axis,
                            page_type: 'love_dna_intro'
                        });
                    }
                    
                    // 클릭 애니메이션
                    item.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        item.style.transform = 'translateY(-8px) scale(1.05)';
                    }, 150);
                    
                    // 상세 정보 표시
                    this.showDnaAxisDetails(axis);
                });
            });
        }
        
        /**
         * DNA 축 상세 정보 표시
         */
        showDnaAxisDetails(axis) {
            const dnaDetails = {
                'love-language': {
                    name: 'Love Language (사랑 언어)',
                    description: '사랑을 표현하고 받는 방식의 선호도를 분석합니다.',
                    examples: ['말로 표현 vs 행동으로 표현', '직접적 vs 간접적']
                },
                'ownership': {
                    name: 'Ownership (관계 소유욕)',
                    description: '관계에서의 독립성과 밀착도의 균형을 분석합니다.',
                    examples: ['개인 시간 중시 vs 함께 시간 중시', '자유로운 관계 vs 깊은 유대감']
                },
                'value-priority': {
                    name: 'Value Priority (가치 우선순위)',
                    description: '연애에서 중요하게 생각하는 가치의 우선순위를 분석합니다.',
                    examples: ['감정적 만족 vs 현실적 안정', '로맨스 vs 실용성']
                },
                'energy-flow': {
                    name: 'Energy Flow (에너지 흐름)',
                    description: '관계에서의 주도성과 수용성의 패턴을 분석합니다.',
                    examples: ['리드하는 스타일 vs 따라가는 스타일', '적극적 vs 수동적']
                },
                'resolution': {
                    name: 'Resolution (갈등 해결)',
                    description: '갈등 상황에서의 대처 방식과 해결 패턴을 분석합니다.',
                    examples: ['직접 대화 vs 시간으로 해결', '논리적 해결 vs 감정적 해결']
                }
            };
            
            const detail = dnaDetails[axis];
            if (detail) {
                console.log(`${detail.name} 상세 정보:`, detail);
                // 향후 모달이나 툴팁 구현시 활용
            }
        }
        
        /**
         * 특징 카드 초기화
         */
        initFeatureCards() {
            const featureCards = document.querySelectorAll('.love-feature-card');
            
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry, index) => {
                        if (entry.isIntersecting) {
                            setTimeout(() => {
                                entry.target.style.opacity = '1';
                                entry.target.style.transform = 'translateY(0)';
                            }, index * 100);
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0.3
                });
                
                // 초기 스타일 설정
                featureCards.forEach(card => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                });
                
                featureCards.forEach(card => observer.observe(card));
            }
        }
        
        /**
         * CTA 버튼 초기화
         */
        initCTAButtons() {
            const ctaButtons = document.querySelectorAll('[data-action]');
            
            ctaButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const action = button.dataset.action;
                    
                    // 버튼 클릭 애니메이션
                    button.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        button.style.transform = '';
                    }, 150);
                    
                    // CTA 클릭 추적
                    if (this.config.analytics.trackClicks) {
                        this.trackEvent('cta_click', {
                            action: action,
                            button_text: button.textContent.trim(),
                            section: this.getButtonSection(button),
                            page_type: 'love_dna_intro'
                        });
                    }
                });
            });
        }
        
        /**
         * 버튼이 속한 섹션 확인
         */
        getButtonSection(button) {
            const section = button.closest('section');
            if (section) {
                if (section.classList.contains('hero') || section.classList.contains('love-hero')) return 'hero';
                if (section.classList.contains('cta') || section.classList.contains('love-cta-section')) return 'cta';
            }
            return 'unknown';
        }
        
        /**
         * 섹션 관찰자 초기화
         */
        initSectionObserver() {
            const sections = document.querySelectorAll('section[class]');
            
            if ('IntersectionObserver' in window && this.config.analytics.trackDnaViews) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const sectionClass = Array.from(entry.target.classList)[0];
                            this.trackSectionView(sectionClass);
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0.5
                });
                
                sections.forEach(section => observer.observe(section));
            }
        }
        
        /**
         * 섹션 조회 추적
         */
        trackSectionView(sectionName) {
            this.trackEvent('section_view', {
                section_name: sectionName,
                page_type: 'love_dna_intro'
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
                page_type: 'love_dna_intro',
                page_url: window.location.pathname,
                content_type: 'test_introduction'
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
         * 정리 함수 (페이지 이탈시)
         */
        destroy() {
            if (this.heartAnimationInterval) {
                clearInterval(this.heartAnimationInterval);
                this.heartAnimationInterval = null;
            }
        }
    }
    
    // 페이지 이탈시 정리
    window.addEventListener('beforeunload', () => {
        if (window.loveDnaIntroPage) {
            window.loveDnaIntroPage.destroy();
        }
    });
    
    // 전역 인스턴스 생성
    window.loveDnaIntroPage = new LoveDnaIntroPage();
    
})();