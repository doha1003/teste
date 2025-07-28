/**
 * Contact Page JavaScript
 * 문의하기 페이지 기능 구현
 */

(function() {
    'use strict';
    
    class ContactPage {
        constructor() {
            this.config = {
                animation: {
                    fadeDelay: 100,
                    observerThreshold: 0.1
                },
                validation: {
                    name: {
                        min: 2,
                        max: 50,
                        pattern: /^[가-힣a-zA-Z\s]+$/,
                        message: '이름은 2-50자의 한글/영문만 입력 가능합니다.'
                    },
                    email: {
                        max: 100,
                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: '올바른 이메일 주소를 입력해주세요.'
                    },
                    subject: {
                        min: 5,
                        max: 100,
                        message: '제목은 5-100자로 입력해주세요.'
                    },
                    message: {
                        min: 10,
                        max: 2000,
                        message: '문의 내용은 10-2000자로 입력해주세요.'
                    }
                },
                mailto: {
                    address: 'youtubdoha@gmail.com',
                    maxLength: 2000
                }
            };
            
            this.form = null;
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
            this.initForm();
            this.initFAQ();
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
         * 폼 초기화
         */
        initForm() {
            this.form = document.getElementById('contactForm');
            if (!this.form) return;
            
            // 폼 제출 이벤트
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // 입력 필드 유효성 검사
            const inputs = ['name', 'email', 'subject', 'message'];
            inputs.forEach(fieldName => {
                const field = document.getElementById(fieldName);
                if (!field) return;
                
                // 포커스 해제시 유효성 검사
                field.addEventListener('blur', () => this.validateField(fieldName, field));
                
                // 입력시 실시간 피드백
                field.addEventListener('input', () => {
                    this.clearFieldError(field);
                    
                    // 메시지 필드의 경우 글자수 표시
                    if (fieldName === 'message') {
                        this.updateCharCounter(field);
                    }
                });
            });
        }
        
        /**
         * FAQ 초기화
         */
        initFAQ() {
            const faqItems = document.querySelectorAll('.faq-item');
            
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                if (!question) return;
                
                question.addEventListener('click', () => {
                    // 현재 아이템 토글
                    item.classList.toggle('active');
                    
                    // 다른 아이템들 닫기
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // FAQ 클릭 추적
                    const faqId = item.dataset.faq;
                    this.trackEvent('faq_click', {
                        faq_id: faqId,
                        action: item.classList.contains('active') ? 'open' : 'close'
                    });
                });
            });
        }
        
        /**
         * 섹션 관찰자 초기화
         */
        initSectionObserver() {
            const sections = document.querySelectorAll('.contact-section[data-section], .faq-section[data-section]');
            
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const sectionName = entry.target.dataset.section;
                            this.trackSectionView(sectionName);
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
         * 폼 제출 처리
         */
        handleSubmit(e) {
            e.preventDefault();
            
            try {
                // 모든 필드 가져오기
                const formData = {
                    name: document.getElementById('name').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    subject: document.getElementById('subject').value.trim(),
                    message: document.getElementById('message').value.trim()
                };
                
                // 전체 유효성 검사
                let isValid = true;
                for (const [fieldName, value] of Object.entries(formData)) {
                    if (!this.validateInput(value, fieldName)) {
                        const field = document.getElementById(fieldName);
                        this.showFieldError(field, this.config.validation[fieldName].message);
                        isValid = false;
                    }
                }
                
                if (!isValid) return;
                
                // DOMPurify로 sanitize
                const sanitizedData = this.sanitizeFormData(formData);
                
                // mailto 링크 생성
                const mailtoLink = this.createMailtoLink(sanitizedData);
                
                if (mailtoLink.length > this.config.mailto.maxLength) {
                    this.showError('문의 내용이 너무 깁니다. 조금 더 간단하게 작성해주세요.');
                    return;
                }
                
                // 이메일 클라이언트 열기
                window.location.href = mailtoLink;
                
                // 폼 리셋
                this.form.reset();
                this.showSuccess('이메일 클라이언트가 열립니다. 전송 버튼을 눌러 문의를 완료해주세요.');
                
                // 제출 추적
                this.trackEvent('form_submit', {
                    form_type: 'contact',
                    subject_length: sanitizedData.subject.length,
                    message_length: sanitizedData.message.length
                });
                
            } catch (error) {
                console.error('Form submission error:', error);
                this.showError('문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        }
        
        /**
         * 입력값 유효성 검사
         */
        validateInput(value, type) {
            if (!value || typeof value !== 'string') return false;
            
            const rules = this.config.validation[type];
            if (!rules) return false;
            
            // 길이 검사
            if (rules.min && value.length < rules.min) return false;
            if (rules.max && value.length > rules.max) return false;
            
            // 패턴 검사
            if (rules.pattern && !rules.pattern.test(value)) return false;
            
            return true;
        }
        
        /**
         * 필드 유효성 검사
         */
        validateField(fieldName, field) {
            const value = field.value.trim();
            if (!value) return;
            
            const isValid = this.validateInput(value, fieldName);
            
            if (!isValid) {
                this.showFieldError(field, this.config.validation[fieldName].message);
            } else {
                this.showFieldSuccess(field);
            }
        }
        
        /**
         * 필드 에러 표시
         */
        showFieldError(field, message) {
            field.style.borderColor = '#ef4444';
            
            const existingError = field.parentElement.querySelector('.field-error');
            if (existingError) existingError.remove();
            
            const errorSpan = document.createElement('span');
            errorSpan.className = 'field-error';
            errorSpan.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; display: block;';
            errorSpan.textContent = message;
            field.parentElement.appendChild(errorSpan);
        }
        
        /**
         * 필드 성공 표시
         */
        showFieldSuccess(field) {
            field.style.borderColor = '#10b981';
            this.clearFieldError(field);
        }
        
        /**
         * 필드 에러 제거
         */
        clearFieldError(field) {
            field.style.borderColor = '';
            const error = field.parentElement.querySelector('.field-error');
            if (error) error.remove();
        }
        
        /**
         * 글자수 카운터 업데이트
         */
        updateCharCounter(field) {
            let counter = field.parentElement.querySelector('.char-counter');
            
            if (!counter) {
                counter = document.createElement('span');
                counter.className = 'char-counter';
                counter.style.cssText = 'font-size: 0.75rem; color: #666; float: right; margin-top: 0.25rem;';
                field.parentElement.appendChild(counter);
            }
            
            const max = this.config.validation.message.max;
            const current = field.value.length;
            counter.textContent = `${current}/${max}`;
            counter.style.color = current > max * 0.9 ? '#ef4444' : '#666';
        }
        
        /**
         * 폼 데이터 sanitize
         */
        sanitizeFormData(data) {
            const sanitized = {};
            
            for (const [key, value] of Object.entries(data)) {
                if (typeof DOMPurify !== 'undefined') {
                    sanitized[key] = DOMPurify.sanitize(value, {ALLOWED_TAGS: [], ALLOWED_ATTR: []});
                } else {
                    // DOMPurify가 아직 로드되지 않은 경우 기본 sanitization
                    sanitized[key] = value.replace(/[<>\"'&]/g, '');
                }
            }
            
            return sanitized;
        }
        
        /**
         * mailto 링크 생성
         */
        createMailtoLink(data) {
            const subject = encodeURIComponent(`[doha.kr 문의] ${data.subject}`);
            const body = encodeURIComponent(
                `이름: ${data.name}\n` +
                `이메일: ${data.email}\n\n` +
                `문의 내용:\n${data.message}`
            );
            
            return `mailto:${this.config.mailto.address}?subject=${subject}&body=${body}`;
        }
        
        /**
         * 에러 메시지 표시
         */
        showError(message) {
            this.showMessage(message, 'error');
        }
        
        /**
         * 성공 메시지 표시
         */
        showSuccess(message) {
            this.showMessage(message, 'success');
        }
        
        /**
         * 메시지 표시
         */
        showMessage(message, type) {
            const existingMessage = this.form.querySelector('.form-message');
            if (existingMessage) existingMessage.remove();
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `form-message ${type}-message`;
            
            const styles = {
                error: 'color: #e74c3c; background: #fadbd8;',
                success: 'color: #27ae60; background: #d5f4e6;'
            };
            
            messageDiv.style.cssText = `${styles[type]} padding: 10px; border-radius: 5px; margin: 10px 0; text-align: center;`;
            messageDiv.textContent = message;
            
            this.form.insertBefore(messageDiv, this.form.firstChild);
            
            setTimeout(() => messageDiv.remove(), 5000);
        }
        
        /**
         * 섹션 조회 추적
         */
        trackSectionView(sectionName) {
            this.trackEvent('section_view', {
                section_name: sectionName,
                page_type: 'contact'
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
                page_type: 'contact',
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
    window.contactPage = new ContactPage();
    
})();