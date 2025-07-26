// Browser-compatible version - no ES6 exports
/**
 * 이미지 최적화 및 지연 로딩 시스템 (TypeScript)
 * 성능 최적화를 위한 포괄적 이미지 관리
 *
 * @version 3.0.0
 * @author doha.kr
 * 목표: 이미지 로딩 시간 70% 단축, 대역폭 60% 절약
 */
/**
 * 이미지 최적화 클래스
 */
class ImageOptimizer {
    constructor() {
        this.config = {
            // 지연 로딩 설정
            lazyLoadEnabled: true,
            rootMargin: '50px',
            threshold: 0.1,
            // 이미지 최적화 설정
            webpSupported: this.checkWebPSupport(),
            avifSupported: this.checkAVIFSupport(),
            // 성능 설정
            maxConcurrentLoads: 6,
            retryAttempts: 3,
            loadTimeout: 10000,
            // 품질 설정
            compressionLevels: {
                hero: 90, // 히어로 이미지
                content: 80, // 일반 콘텐츠
                thumbnail: 70, // 썸네일
                background: 60 // 배경 이미지
            }
        };
        this.observers = new Map();
        this.loadedImages = new Set();
        this.loadingQueue = [];
        this.currentLoads = 0;
        // 성능 메트릭
        this.metrics = {
            totalImages: 0,
            imagesLoaded: 0,
            imagesOptimized: 0,
            bytesSaved: 0,
            averageLoadTime: 0,
            errors: 0
        };
        this.init();
    }
    /**
     * 초기화
     */
    init() {
        // IntersectionObserver 지원 확인
        if (!('IntersectionObserver' in window)) {
            this.fallbackToImmediate();
            return;
        }
        // 지연 로딩 관찰자 설정
        this.setupLazyLoadObserver();
        // 기존 이미지 최적화
        this.optimizeExistingImages();
        // DOM 변화 감지
        this.observeDOMChanges();
        console.log('🖼️ ImageOptimizer initialized');
    }
    /**
     * 지연 로딩 관찰자 설정
     */
    setupLazyLoadObserver() {
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadLazyImage(entry.target);
                    lazyObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: this.config.rootMargin,
            threshold: this.config.threshold
        });
        this.observers.set('lazy', lazyObserver);
        // 지연 로딩 대상 이미지 찾기
        this.findAndObserveLazyImages();
    }
    /**
     * 지연 로딩 대상 이미지 찾기 및 관찰 시작
     */
    findAndObserveLazyImages() {
        const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]');
        const lazyObserver = this.observers.get('lazy');
        lazyImages.forEach(img => {
            const imageElement = img;
            // 이미 처리된 이미지는 건너뛰기
            if (this.loadedImages.has(imageElement))
                return;
            // 플레이스홀더 설정
            this.setPlaceholder(imageElement);
            // 관찰 시작
            lazyObserver.observe(imageElement);
            this.metrics.totalImages++;
        });
    }
    /**
     * 지연 로딩 이미지 로드
     */
    async loadLazyImage(img) {
        if (this.loadedImages.has(img))
            return;
        const startTime = performance.now();
        try {
            // 로딩 큐에 추가
            if (this.currentLoads >= this.config.maxConcurrentLoads) {
                await this.addToQueue(img);
            }
            else {
                await this.performImageLoad(img, startTime);
            }
        }
        catch (error) {
            this.handleImageError(img, error);
        }
    }
    /**
     * 실제 이미지 로딩 수행
     */
    async performImageLoad(img, startTime) {
        this.currentLoads++;
        try {
            // 최적화된 이미지 URL 생성
            const optimizedSrc = this.getOptimizedImageUrl(img);
            // 이미지 프리로드
            await this.preloadImage(optimizedSrc);
            // 실제 이미지 교체
            img['src'] = optimizedSrc;
            // data-src 정리
            if (img.dataset['src']) {
                img.removeAttribute('data-src');
            }
            // 로딩 완료 처리
            this.handleImageLoaded(img, performance.now() - startTime);
        }
        finally {
            this.currentLoads--;
            this.processQueue();
        }
    }
    /**
     * 이미지 로딩 큐에 추가
     */
    addToQueue(img) {
        return new Promise((resolve) => {
            this.loadingQueue.push({ img, resolve });
        });
    }
    /**
     * 큐 처리
     */
    processQueue() {
        if (this.loadingQueue.length > 0 && this.currentLoads < this.config.maxConcurrentLoads) {
            const { img, resolve } = this.loadingQueue.shift();
            this.performImageLoad(img, performance.now()).then(resolve);
        }
    }
    /**
     * 최적화된 이미지 URL 생성
     */
    getOptimizedImageUrl(img) {
        const originalSrc = img.dataset['src'] || img['src'];
        if (!originalSrc)
            return '';
        // 이미 최적화된 URL이면 그대로 반환
        if (originalSrc.includes('.webp') || originalSrc.includes('.avif')) {
            return originalSrc;
        }
        // 이미지 타입별 최적화
        const imageType = this.detectImageType(img);
        const quality = this.config.compressionLevels[imageType] || 80;
        // 차세대 포맷 지원 확인
        if (this.config.avifSupported && this.isLocalImage(originalSrc)) {
            return this.generateAVIFUrl(originalSrc, quality);
        }
        else if (this.config.webpSupported && this.isLocalImage(originalSrc)) {
            return this.generateWebPUrl(originalSrc, quality);
        }
        return originalSrc;
    }
    /**
     * 이미지 타입 감지
     */
    detectImageType(img) {
        const classList = img.classList;
        const parent = img.parentElement;
        if (classList.contains('hero-image') || parent?.classList.contains('hero')) {
            return 'hero';
        }
        else if (classList.contains('thumbnail') || parent?.classList.contains('thumbnail')) {
            return 'thumbnail';
        }
        else if (classList.contains('background') || img.style.objectFit === 'cover') {
            return 'background';
        }
        return 'content';
    }
    /**
     * 로컬 이미지 여부 확인
     */
    isLocalImage(src) {
        try {
            const url = new URL(src, window.location.href);
            return url.origin === window.location.origin;
        }
        catch {
            return false;
        }
    }
    /**
     * WebP URL 생성
     */
    generateWebPUrl(originalSrc, quality) {
        try {
            const url = new URL(originalSrc, window.location.href);
            const extension = url.pathname.split('.').pop();
            if (extension && ['jpg', 'jpeg', 'png'].includes(extension.toLowerCase())) {
                return url.pathname.replace(`.${extension}`, '.webp') + `?q=${quality}`;
            }
        }
        catch (error) {
            console.warn('Error generating WebP URL:', error);
        }
        return originalSrc;
    }
    /**
     * AVIF URL 생성
     */
    generateAVIFUrl(originalSrc, quality) {
        try {
            const url = new URL(originalSrc, window.location.href);
            const extension = url.pathname.split('.').pop();
            if (extension && ['jpg', 'jpeg', 'png', 'webp'].includes(extension.toLowerCase())) {
                return url.pathname.replace(`.${extension}`, '.avif') + `?q=${quality}`;
            }
        }
        catch (error) {
            console.warn('Error generating AVIF URL:', error);
        }
        return originalSrc;
    }
    /**
     * 이미지 프리로드
     */
    preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const timeout = setTimeout(() => {
                reject(new Error('Image load timeout'));
            }, this.config.loadTimeout);
            img.onload = () => {
                clearTimeout(timeout);
                resolve(img);
            };
            img.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Image load failed'));
            };
            img.src = src;
        });
    }
    /**
     * 플레이스홀더 설정
     */
    setPlaceholder(img) {
        if (img.src && img.src !== window.location.href)
            return;
        // 블러 플레이스홀더 생성
        const width = img.getAttribute('width') || '300';
        const height = img.getAttribute('height') || '200';
        // SVG 플레이스홀더
        const placeholder = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='14'%3E로딩 중...%3C/text%3E%3C/svg%3E`;
        img.src = placeholder;
        img.classList.add('lazy-loading');
    }
    /**
     * 이미지 로딩 완료 처리
     */
    handleImageLoaded(img, loadTime) {
        this.loadedImages.add(img);
        img.classList.remove('lazy-loading');
        img.classList.add('lazy-loaded');
        // 페이드인 애니메이션
        this.addFadeInAnimation(img);
        // 메트릭 업데이트
        this.metrics.imagesLoaded++;
        this.updateAverageLoadTime(loadTime);
        // 성능 로깅
        this.logImagePerformance(img, loadTime);
    }
    /**
     * 페이드인 애니메이션 추가
     */
    addFadeInAnimation(img) {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease-in-out';
        requestAnimationFrame(() => {
            img.style.opacity = '1';
        });
    }
    /**
     * 이미지 에러 처리
     */
    handleImageError(img, error) {
        this.metrics.errors++;
        // 에러 플레이스홀더 설정
        const width = img.getAttribute('width') || '300';
        const height = img.getAttribute('height') || '200';
        const errorPlaceholder = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='100%25' height='100%25' fill='%23ffebee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23c62828' font-size='14'%3E이미지 로드 실패%3C/text%3E%3C/svg%3E`;
        img.src = errorPlaceholder;
        img.classList.add('lazy-error');
        this.logError('handleImageError', error);
    }
    /**
     * 기존 이미지 최적화
     */
    optimizeExistingImages() {
        const existingImages = document.querySelectorAll('img:not([data-src]):not([loading="lazy"])');
        existingImages.forEach(img => {
            const imageElement = img;
            if (imageElement.complete && imageElement.naturalHeight !== 0) {
                this.loadedImages.add(imageElement);
                this.metrics.totalImages++;
                this.metrics.imagesLoaded++;
            }
        });
    }
    /**
     * DOM 변화 감지
     */
    observeDOMChanges() {
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node;
                        const newLazyImages = element.querySelectorAll?.('img[data-src], img[loading="lazy"]') || [];
                        const lazyObserver = this.observers.get('lazy');
                        newLazyImages.forEach(img => {
                            lazyObserver?.observe(img);
                            this.metrics.totalImages++;
                        });
                    }
                });
            });
        });
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        this.observers.set('mutation', mutationObserver);
    }
    /**
     * WebP 지원 확인
     */
    checkWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').startsWith('data:image/webp');
    }
    /**
     * AVIF 지원 확인
     */
    checkAVIFSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/avif').startsWith('data:image/avif');
    }
    /**
     * 평균 로딩 시간 업데이트
     */
    updateAverageLoadTime(loadTime) {
        const totalLoaded = this.metrics.imagesLoaded;
        this.metrics.averageLoadTime =
            (this.metrics.averageLoadTime * (totalLoaded - 1) + loadTime) / totalLoaded;
    }
    /**
     * 이미지 성능 로깅
     */
    logImagePerformance(img, loadTime) {
        if (typeof window.Analytics !== 'undefined') {
            window.Analytics.trackEvent('ImageOptimizer', 'image_loaded', {
                src: img.src,
                loadTime: Math.round(loadTime),
                type: this.detectImageType(img),
                optimized: img.src.includes('.webp') || img.src.includes('.avif')
            });
        }
    }
    /**
     * 에러 로깅
     */
    logError(method, error) {
        if (this.isDevelopmentEnvironment()) {
            console.warn(`ImageOptimizer.${method}:`, error.message);
        }
        if (typeof window.Analytics !== 'undefined') {
            window.Analytics.trackEvent('ImageOptimizer', 'error', {
                method: method,
                error: error.message
            });
        }
    }
    /**
     * 개발 환경 확인
     */
    isDevelopmentEnvironment() {
        return window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.protocol === 'file:';
    }
    /**
     * 폴백 (즉시 로딩)
     */
    fallbackToImmediate() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            const imageElement = img;
            if (imageElement.dataset['src']) {
                imageElement.src = imageElement.dataset['src'];
                imageElement.removeAttribute('data-src');
            }
        });
        console.warn('ImageOptimizer: IntersectionObserver not supported, using immediate loading');
    }
    /**
     * 성능 메트릭 반환
     */
    getMetrics() {
        return {
            ...this.metrics,
            loadingProgress: this.metrics.totalImages > 0 ?
                (this.metrics.imagesLoaded / this.metrics.totalImages * 100).toFixed(2) + '%' : '0%',
            optimizationRate: this.metrics.imagesLoaded > 0 ?
                (this.metrics.imagesOptimized / this.metrics.imagesLoaded * 100).toFixed(2) + '%' : '0%'
        };
    }
    /**
     * 모든 지연 로딩 이미지 강제 로딩 (개발용)
     */
    forceLoadAll() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            this.loadLazyImage(img);
        });
    }
    /**
     * 리소스 정리
     */
    destroy() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        this.loadedImages.clear();
        this.loadingQueue = [];
    }
}
// 전역 인스턴스 생성
const imageOptimizer = new ImageOptimizer();
// 전역 객체에 추가
window.ImageOptimizer = imageOptimizer;
// 개발 도구
if (imageOptimizer['isDevelopmentEnvironment']()) {
    window.imageOptimizerDebug = {
        getMetrics: () => window.ImageOptimizer.getMetrics(),
        forceLoadAll: () => window.ImageOptimizer.forceLoadAll(),
        destroy: () => window.ImageOptimizer.destroy()
    };
}
// export { ImageOptimizer, imageOptimizer };
// export default imageOptimizer;
//# sourceMappingURL=image-optimizer.js.map