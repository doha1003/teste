/**
 * Service Base Module
 * 각 서비스의 공통 기능 제공 (고유 기능은 유지)
 */

(function() {
    'use strict';
    
    /**
     * 기본 서비스 클래스
     * 각 서비스가 상속받아 확장
     */
    class ServiceBase {
        constructor(config) {
            this.config = {
                serviceType: '', // fortune, test, tool
                serviceName: '', // daily, mbti, text-counter 등
                resultContainer: '#result-container',
                loadingText: '분석 중...',
                errorText: '오류가 발생했습니다.',
                ...config
            };
            
            this.state = {
                isLoading: false,
                result: null,
                error: null
            };
            
            this.init();
        }
        
        /**
         * 초기화 - 하위 클래스에서 재정의 가능
         */
        init() {
            this.bindCommonEvents();
            this.initializeService();
        }
        
        /**
         * 공통 이벤트 바인딩
         */
        bindCommonEvents() {
            // 공유 버튼
            document.addEventListener('click', (e) => {
                if (e.target.matches('[data-action="share-kakao"]')) {
                    this.shareKakao();
                }
                if (e.target.matches('[data-action="copy-link"]')) {
                    this.copyLink();
                }
                if (e.target.matches('[data-action="retry"]')) {
                    this.retry();
                }
            });
        }
        
        /**
         * 서비스별 초기화 - 하위 클래스에서 구현
         */
        initializeService() {
            // Override in subclass
        }
        
        /**
         * 로딩 표시
         */
        showLoading(text) {
            this.state.isLoading = true;
            const container = document.querySelector(this.config.resultContainer);
            if (container) {
                container.innerHTML = this.createLoadingHTML(text || this.config.loadingText);
                container.style.display = 'block';
            }
        }
        
        /**
         * 에러 표시
         */
        showError(message) {
            this.state.isLoading = false;
            this.state.error = message;
            const container = document.querySelector(this.config.resultContainer);
            if (container) {
                container.innerHTML = this.createErrorHTML(message || this.config.errorText);
            }
        }
        
        /**
         * 결과 표시 - 각 서비스에서 재정의
         */
        showResult(result) {
            this.state.isLoading = false;
            this.state.result = result;
            const container = document.querySelector(this.config.resultContainer);
            if (container) {
                container.innerHTML = this.createResultHTML(result);
                container.style.display = 'block';
                this.afterShowResult();
            }
        }
        
        /**
         * 결과 표시 후 처리
         */
        afterShowResult() {
            // 애니메이션 효과
            this.animateResult();
            
            // 광고 초기화
            this.initializeAds();
        }
        
        /**
         * 로딩 HTML 생성
         */
        createLoadingHTML(text) {
            return `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">${this.escapeHtml(text)}</p>
                </div>
            `;
        }
        
        /**
         * 에러 HTML 생성
         */
        createErrorHTML(message) {
            return `
                <div class="error-container">
                    <div class="error-icon">⚠️</div>
                    <p class="error-message">${this.escapeHtml(message)}</p>
                    <button class="btn btn-primary" data-action="retry">
                        다시 시도
                    </button>
                </div>
            `;
        }
        
        /**
         * 결과 HTML 생성 - 하위 클래스에서 구현
         */
        createResultHTML(result) {
            // Override in subclass
            return '';
        }
        
        /**
         * 카카오톡 공유
         */
        shareKakao() {
            if (!window.Kakao || !window.Kakao.isInitialized()) {
                this.showNotification('카카오 SDK가 초기화되지 않았습니다.', 'error');
                return;
            }
            
            const shareData = this.getShareData();
            
            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: shareData.title,
                    description: shareData.description,
                    imageUrl: shareData.imageUrl,
                    link: {
                        mobileWebUrl: shareData.url,
                        webUrl: shareData.url
                    }
                },
                buttons: [{
                    title: shareData.buttonText || '결과 보기',
                    link: {
                        mobileWebUrl: shareData.url,
                        webUrl: shareData.url
                    }
                }]
            });
        }
        
        /**
         * 공유 데이터 가져오기 - 하위 클래스에서 구현
         */
        getShareData() {
            return {
                title: document.title,
                description: '결과를 확인해보세요!',
                imageUrl: 'https://doha.kr/images/og-image.jpg',
                url: window.location.href
            };
        }
        
        /**
         * 링크 복사
         */
        copyLink() {
            const url = window.location.href;
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url)
                    .then(() => this.showNotification('링크가 복사되었습니다!'))
                    .catch(() => this.fallbackCopyToClipboard(url));
            } else {
                this.fallbackCopyToClipboard(url);
            }
        }
        
        /**
         * 클립보드 복사 폴백
         */
        fallbackCopyToClipboard(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showNotification('링크가 복사되었습니다!');
            } catch (err) {
                this.showNotification('복사에 실패했습니다.', 'error');
            }
            
            document.body.removeChild(textArea);
        }
        
        /**
         * 다시 시도
         */
        retry() {
            location.reload();
        }
        
        /**
         * 알림 표시
         */
        showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
        
        /**
         * 결과 애니메이션
         */
        animateResult() {
            const elements = document.querySelectorAll('.result-section, .result-stat, .result-item');
            elements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    el.style.transition = 'all 0.5s ease-out';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
        
        /**
         * 광고 초기화
         */
        initializeAds() {
            if ('IntersectionObserver' in window) {
                const adContainers = document.querySelectorAll('.ad-container:not([data-loaded])');
                
                const adObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !entry.target.dataset.loaded) {
                            this.loadAd(entry.target);
                            entry.target.dataset.loaded = 'true';
                            adObserver.unobserve(entry.target);
                        }
                    });
                }, { rootMargin: '50px' });
                
                adContainers.forEach(container => {
                    adObserver.observe(container);
                });
            }
        }
        
        /**
         * 광고 로드
         */
        loadAd(container) {
            const adSlot = container.dataset.adSlot || '1234567890';
            container.innerHTML = `
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-7905640648499222"
                     data-ad-slot="${adSlot}"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            `;
            
            if (typeof adsbygoogle !== 'undefined') {
                try {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                } catch (e) {
                    console.warn('AdSense error:', e);
                }
            }
        }
        
        /**
         * HTML 이스케이프
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        /**
         * 숫자 포맷팅
         */
        formatNumber(num) {
            return new Intl.NumberFormat('ko-KR').format(num);
        }
        
        /**
         * 날짜 포맷팅
         */
        formatDate(date) {
            return new Intl.DateTimeFormat('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        }
    }
    
    // 전역으로 내보내기
    window.ServiceBase = ServiceBase;
    
})();