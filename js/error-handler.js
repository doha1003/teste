// =============================================
// GLOBAL ERROR HANDLING SYSTEM
// =============================================
// Created: 2025-01-11
// Purpose: Comprehensive error handling and logging for doha.kr

(function() {
    'use strict';
    
    // Error handler configuration
    const ErrorHandler = {
        config: {
            enableConsoleLog: true,
            enableAnalytics: true,
            maxErrorsPerSession: 50,
            retryAttempts: 3,
            retryDelay: 1000
        },
        
        errorCount: 0,
        errorCache: new Set(),
        
        // Initialize error handling
        init: function() {
            this.setupGlobalErrorHandlers();
            this.setupPromiseRejectionHandler();
            this.setupResourceErrorHandlers();
            },
        
        // Setup global error handlers
        setupGlobalErrorHandlers: function() {
            const self = this;
            
            // Global JavaScript error handler
            window.addEventListener('error', function(event) {
                self.handleError({
                    type: 'javascript',
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error,
                    stack: event.error ? event.error.stack : null
                });
            });
        },
        
        // Setup promise rejection handler
        setupPromiseRejectionHandler: function() {
            const self = this;
            
            window.addEventListener('unhandledrejection', function(event) {
                self.handleError({
                    type: 'promise',
                    message: 'Unhandled Promise Rejection',
                    reason: event.reason,
                    promise: event.promise,
                    stack: event.reason && event.reason.stack ? event.reason.stack : null
                });
                
                // Prevent the default browser behavior
                event.preventDefault();
            });
        },
        
        // Setup resource error handlers
        setupResourceErrorHandlers: function() {
            const self = this;
            
            // Image loading errors
            document.addEventListener('error', function(event) {
                if (event.target.tagName === 'IMG') {
                    self.handleResourceError('image', event.target.src);
                    self.handleImageError(event.target);
                }
            }, true);
            
            // Script loading errors
            document.addEventListener('error', function(event) {
                if (event.target.tagName === 'SCRIPT') {
                    self.handleResourceError('script', event.target.src);
                }
            }, true);
            
            // CSS loading errors
            document.addEventListener('error', function(event) {
                if (event.target.tagName === 'LINK' && event.target.rel === 'stylesheet') {
                    self.handleResourceError('stylesheet', event.target.href);
                }
            }, true);
        },
        
        // Handle JavaScript errors
        handleError: function(errorInfo) {
            // Prevent error flooding
            if (this.errorCount >= this.config.maxErrorsPerSession) {
                return;
            }
            
            // Create error signature for deduplication
            const signature = this.createErrorSignature(errorInfo);
            if (this.errorCache.has(signature)) {
                return; // Already logged this error
            }
            
            this.errorCount++;
            this.errorCache.add(signature);
            
            // Log to console if enabled
            if (this.config.enableConsoleLog) {
                // console.error removed('🚨 Error caught by global handler:', errorInfo);
            }
            
            // Send to analytics if enabled
            if (this.config.enableAnalytics) {
                this.sendToAnalytics(errorInfo);
            }
            
            // Show user-friendly message for critical errors
            if (this.isCriticalError(errorInfo)) {
                this.showUserErrorMessage(errorInfo);
            }
            
            // Attempt automatic recovery for certain errors
            this.attemptRecovery(errorInfo);
        },
        
        // Handle resource loading errors
        handleResourceError: function(type, src) {
            const errorInfo = {
                type: 'resource',
                resourceType: type,
                src: src,
                message: `Failed to load ${type}: ${src}`
            };
            
            this.handleError(errorInfo);
        },
        
        // Handle image loading errors with fallback
        handleImageError: function(imgElement) {
            // Try fallback image
            if (!imgElement.dataset.errorHandled) {
                imgElement.dataset.errorHandled = 'true';
                
                // Use placeholder image
                imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                imgElement.alt = 'Image not found';
            }
        },
        
        // Create error signature for deduplication
        createErrorSignature: function(errorInfo) {
            return `${errorInfo.type}_${errorInfo.message}_${errorInfo.filename || ''}_${errorInfo.lineno || ''}`;
        },
        
        // Check if error is critical
        isCriticalError: function(errorInfo) {
            const criticalKeywords = [
                'network',
                'fetch',
                'api',
                'security',
                'permission',
                'quota'
            ];
            
            const message = (errorInfo.message || '').toLowerCase();
            return criticalKeywords.some(keyword => message.includes(keyword));
        },
        
        // Show user-friendly error message
        showUserErrorMessage: function(errorInfo) {
            const userMessages = {
                network: '네트워크 연결을 확인해 주세요.',
                fetch: '데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
                api: '서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
                security: '보안 오류가 발생했습니다. 페이지를 새로고침해 주세요.',
                permission: '권한 오류가 발생했습니다.',
                quota: '저장 공간이 부족합니다. 브라우저 캐시를 정리해 주세요.'
            };
            
            const message = (errorInfo.message || '').toLowerCase();
            let userMessage = '일시적인 오류가 발생했습니다. 페이지를 새로고침해 주세요.';
            
            // Find appropriate message
            for (const [key, msg] of Object.entries(userMessages)) {
                if (message.includes(key)) {
                    userMessage = msg;
                    break;
                }
            }
            
            this.showNotification(userMessage, 'error');
        },
        
        // Show notification to user
        showNotification: function(message, type = 'info') {
            // Try to use existing notification system
            if (typeof showNotification === 'function') {
                showNotification(message, type);
                return;
            }
            
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = safeHTML(`
                <div class="notification-content">
                    <span class="notification-icon">${type === 'error' ? '⚠️' : 'ℹ️'}</span>
                    <span class="notification-message">${this.escapeHtml(message)}</span>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `);
            
            document.body.appendChild(notification);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        },
        
        // Escape HTML for safe display
        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        // Send error to analytics
        sendToAnalytics: function(errorInfo) {
            try {
                // Google Analytics 4
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'exception', {
                        description: errorInfo.message,
                        fatal: this.isCriticalError(errorInfo),
                        error_type: errorInfo.type,
                        file: errorInfo.filename || 'unknown',
                        line: errorInfo.lineno || 0
                    });
                }
                
                // Custom analytics endpoint (if available)
                if (typeof Analytics !== 'undefined' && Analytics.trackError) {
                    Analytics.trackError(errorInfo);
                }
                
            } catch (analyticsError) {
                }
        },
        
        // Attempt automatic recovery
        attemptRecovery: function(errorInfo) {
            // Retry failed API calls
            if (errorInfo.type === 'promise' && errorInfo.message.includes('fetch')) {
                this.retryFailedRequest(errorInfo);
            }
            
            // Reload critical resources
            if (errorInfo.type === 'resource') {
                this.retryResourceLoad(errorInfo);
            }
        },
        
        // Retry failed requests
        retryFailedRequest: function(errorInfo) {
            if (errorInfo.retryCount >= this.config.retryAttempts) {
                return;
            }
            
            errorInfo.retryCount = (errorInfo.retryCount || 0) + 1;
            
            setTimeout(() => {
                // Trigger retry logic here
            }, this.config.retryDelay * errorInfo.retryCount);
        },
        
        // Retry resource loading
        retryResourceLoad: function(errorInfo) {
            // Only retry critical resources
            if (errorInfo.resourceType === 'script' && errorInfo.src.includes('main')) {
                setTimeout(() => {
                    const script = document.createElement('script');
                    script.src = errorInfo.src;
                    document.head.appendChild(script);
                }, 2000);
            }
        },
        
        // Safe function wrapper
        safeExecute: function(fn, context = null, args = []) {
            try {
                return fn.apply(context, args);
            } catch (error) {
                this.handleError({
                    type: 'wrapped_function',
                    message: error.message,
                    stack: error.stack,
                    functionName: fn.name || 'anonymous'
                });
                return null;
            }
        },
        
        // Safe async function wrapper
        safeExecuteAsync: async function(asyncFn, context = null, args = []) {
            try {
                return await asyncFn.apply(context, args);
            } catch (error) {
                this.handleError({
                    type: 'wrapped_async_function',
                    message: error.message,
                    stack: error.stack,
                    functionName: asyncFn.name || 'anonymous'
                });
                return null;
            }
        },
        
        // Manual error reporting
        reportError: function(message, details = {}) {
            this.handleError({
                type: 'manual',
                message: message,
                details: details,
                stack: new Error().stack
            });
        },
        
        // Clear error cache
        clearErrorCache: function() {
            this.errorCache.clear();
            this.errorCount = 0;
        },
        
        // Get error statistics
        getErrorStats: function() {
            return {
                totalErrors: this.errorCount,
                cachedErrors: this.errorCache.size,
                maxErrors: this.config.maxErrorsPerSession
            };
        }
    };
    
    // CSS for notifications
    const style = document.createElement('style');
    style.textContent = 
        '@keyframes slideIn {' +
            'from {' +
                'transform: translateX(100%);' +
                'opacity: 0;' +
            '}' +
            'to {' +
                'transform: translateX(0);' +
                'opacity: 1;' +
            '}' +
        '}' +
        
        '.error-notification .notification-content {' +
            'display: flex;' +
            'align-items: center;' +
            'gap: 10px;' +
        '}' +
        
        '.error-notification .notification-close {' +
            'background: none;' +
            'border: none;' +
            'color: white;' +
            'font-size: 18px;' +
            'cursor: pointer;' +
            'padding: 0;' +
            'margin-left: auto;' +
        '}' +
        
        '.error-notification .notification-close:hover {' +
            'opacity: 0.7;' +
        '}';
    document.head.appendChild(style);
    
    // Expose to global scope
    window.ErrorHandler = ErrorHandler;
    
    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            ErrorHandler.init();
        });
    } else {
        ErrorHandler.init();
    }
    
    // Log successful initialization
    })();