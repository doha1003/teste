/**
 * FAQ Page JavaScript
 * 자주 묻는 질문 페이지 기능 구현
 */

(function() {
    'use strict';
    
    class FAQPage {
        constructor() {
            this.config = {
                animation: {
                    fadeDelay: 100,
                    observerThreshold: 0.1
                },
                search: {
                    debounceDelay: 300
                },
                analytics: {
                    sectionViewThreshold: 0.5
                }
            };
            
            this.searchDebounceTimer = null;
            this.activeCategory = 'all';
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
            this.initFAQItems();
            this.initSearch();
            this.initCategoryFilters();
            this.initSectionObserver();
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
         * FAQ 아이템 초기화
         */
        initFAQItems() {
            const faqItems = document.querySelectorAll('.faq-item');
            
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                if (!question) return;
                
                question.addEventListener('click', () => {
                    const wasOpen = item.classList.contains('open');
                    
                    // 다른 열린 아이템들 닫기
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('open')) {
                            otherItem.classList.remove('open');
                        }
                    });
                    
                    // 현재 아이템 토글
                    if (wasOpen) {
                        item.classList.remove('open');
                    } else {
                        item.classList.add('open');
                    }
                    
                    // FAQ 클릭 추적
                    const faqId = item.dataset.faqId;
                    this.trackEvent('faq_toggle', {
                        faq_id: faqId,
                        action: wasOpen ? 'close' : 'open',
                        category: item.closest('.faq-category')?.dataset.category
                    });
                });
            });
        }
        
        /**
         * 검색 기능 초기화
         */
        initSearch() {
            const searchInput = document.getElementById('searchInput');
            if (!searchInput) return;
            
            searchInput.addEventListener('input', (e) => {
                // 디바운스 처리
                clearTimeout(this.searchDebounceTimer);
                this.searchDebounceTimer = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, this.config.search.debounceDelay);
            });
            
            // 검색 시작 추적
            searchInput.addEventListener('focus', () => {
                this.trackEvent('search_focus', {
                    page_type: 'faq'
                });
            });
        }
        
        /**
         * 카테고리 필터 초기화
         */
        initCategoryFilters() {
            const filterBtns = document.querySelectorAll('.filter-btn');
            
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const category = btn.dataset.category;
                    
                    // 활성 버튼 업데이트
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // 카테고리 필터링
                    this.activeCategory = category;
                    this.filterByCategory(category);
                    
                    // 필터 클릭 추적
                    this.trackEvent('category_filter', {
                        category: category,
                        page_type: 'faq'
                    });
                });
            });
        }
        
        /**
         * 섹션 관찰자 초기화
         */
        initSectionObserver() {
            const categories = document.querySelectorAll('.faq-category[data-category]');
            
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const categoryName = entry.target.dataset.category;
                            this.trackEvent('category_view', {
                                category_name: categoryName,
                                page_type: 'faq'
                            });
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: this.config.analytics.sectionViewThreshold
                });
                
                categories.forEach(category => observer.observe(category));
            }
        }
        
        /**
         * 검색 처리
         */
        handleSearch(query) {
            const searchTerm = this.sanitizeSearchInput(query).toLowerCase();
            
            // 검색어가 있으면 전체 카테고리로 변경
            if (searchTerm) {
                const allBtn = document.querySelector('.filter-btn[data-category="all"]');
                if (allBtn && !allBtn.classList.contains('active')) {
                    allBtn.click();
                }
            }
            
            this.performSearch(searchTerm);
            
            // 검색 추적
            if (searchTerm.length > 2) {
                this.trackEvent('search_query', {
                    query_length: searchTerm.length,
                    has_results: this.hasVisibleItems()
                });
            }
        }
        
        /**
         * 검색어 sanitize
         */
        sanitizeSearchInput(input) {
            if (typeof DOMPurify !== 'undefined') {
                return DOMPurify.sanitize(input, {ALLOWED_TAGS: [], ALLOWED_ATTR: []});
            }
            // DOMPurify가 아직 로드되지 않은 경우 기본 sanitization
            return input.replace(/[<>\"'&]/g, '');
        }
        
        /**
         * 검색 수행
         */
        performSearch(searchTerm) {
            const categories = document.querySelectorAll('.faq-category');
            let hasVisibleItems = false;
            
            categories.forEach(category => {
                const categoryData = category.dataset.category;
                let categoryHasVisibleItems = false;
                
                // 현재 활성 카테고리와 일치하거나 전체 카테고리인 경우에만 표시
                if (this.activeCategory === 'all' || this.activeCategory === categoryData) {
                    const faqItems = category.querySelectorAll('.faq-item');
                    
                    faqItems.forEach(item => {
                        const question = item.querySelector('.faq-question')?.textContent.toLowerCase() || '';
                        const answer = item.querySelector('.faq-answer')?.textContent.toLowerCase() || '';
                        
                        if (!searchTerm || question.includes(searchTerm) || answer.includes(searchTerm)) {
                            item.style.display = 'block';
                            categoryHasVisibleItems = true;
                            hasVisibleItems = true;
                        } else {
                            item.style.display = 'none';
                            item.classList.remove('open'); // 숨겨지는 항목은 닫기
                        }
                    });
                    
                    category.style.display = categoryHasVisibleItems ? 'block' : 'none';
                } else {
                    category.style.display = 'none';
                }
            });
            
            // 검색 결과 없음 메시지 표시
            const noResults = document.getElementById('noResults');
            if (noResults) {
                noResults.style.display = hasVisibleItems ? 'none' : 'block';
            }
        }
        
        /**
         * 카테고리 필터링
         */
        filterByCategory(category) {
            const searchInput = document.getElementById('searchInput');
            const searchTerm = searchInput ? this.sanitizeSearchInput(searchInput.value).toLowerCase() : '';
            
            const categories = document.querySelectorAll('.faq-category');
            let hasVisibleItems = false;
            
            categories.forEach(categoryEl => {
                const categoryData = categoryEl.dataset.category;
                
                if (category === 'all' || category === categoryData) {
                    categoryEl.style.display = 'block';
                    
                    // 검색어가 있으면 검색 적용
                    if (searchTerm) {
                        const faqItems = categoryEl.querySelectorAll('.faq-item');
                        let categoryHasVisibleItems = false;
                        
                        faqItems.forEach(item => {
                            const question = item.querySelector('.faq-question')?.textContent.toLowerCase() || '';
                            const answer = item.querySelector('.faq-answer')?.textContent.toLowerCase() || '';
                            
                            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                                item.style.display = 'block';
                                categoryHasVisibleItems = true;
                                hasVisibleItems = true;
                            } else {
                                item.style.display = 'none';
                                item.classList.remove('open');
                            }
                        });
                        
                        categoryEl.style.display = categoryHasVisibleItems ? 'block' : 'none';
                    } else {
                        // 검색어가 없으면 모든 아이템 표시
                        const faqItems = categoryEl.querySelectorAll('.faq-item');
                        faqItems.forEach(item => {
                            item.style.display = 'block';
                        });
                        hasVisibleItems = true;
                    }
                } else {
                    categoryEl.style.display = 'none';
                }
            });
            
            // 검색 결과 없음 메시지 표시
            const noResults = document.getElementById('noResults');
            if (noResults) {
                noResults.style.display = hasVisibleItems ? 'none' : 'block';
            }
        }
        
        /**
         * 표시된 아이템이 있는지 확인
         */
        hasVisibleItems() {
            const visibleItems = document.querySelectorAll('.faq-item[style*="block"]');
            return visibleItems.length > 0;
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
                page_type: 'faq',
                page_url: window.location.pathname,
                content_type: 'support'
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
    window.faqPage = new FAQPage();
    
})();