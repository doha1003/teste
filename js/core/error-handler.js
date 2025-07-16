/**
 * DOHA.KR - Core Error Handler
 * Centralized error handling and logging system
 */

export class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50;
        this.isProduction = !window.location.hostname.includes('localhost');
        this.init();
    }

    init() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript',
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * Safe execution wrapper
     * @param {Function} fn - Function to execute safely
     * @param {string} context - Context name for error logging
     * @param {*} fallback - Fallback value if function fails
     * @returns {*} Function result or fallback
     */
    safeExecute(fn, context = 'Unknown', fallback = null) {
        try {
            return fn();
        } catch (error) {
            this.logError({
                type: 'safe-execute',
                context,
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            return fallback;
        }
    }

    /**
     * Async safe execution wrapper
     * @param {Function} fn - Async function to execute safely
     * @param {string} context - Context name for error logging
     * @param {*} fallback - Fallback value if function fails
     * @returns {Promise<*>} Function result or fallback
     */
    async safeExecuteAsync(fn, context = 'Unknown', fallback = null) {
        try {
            return await fn();
        } catch (error) {
            this.logError({
                type: 'async-safe-execute',
                context,
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            return fallback;
        }
    }

    /**
     * Log error with context
     * @param {Object} errorInfo - Error information
     */
    logError(errorInfo) {
        // Add to local error log
        this.errors.push(errorInfo);
        
        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }

        // Console logging (development only)
        if (!this.isProduction) {
            console.group(`🚨 Error in ${errorInfo.context || errorInfo.type}`);
            console.error('Message:', errorInfo.message);
            console.error('Stack:', errorInfo.stack);
            console.error('Full Error:', errorInfo);
            console.groupEnd();
        }

        // Send to analytics (production only)
        if (this.isProduction && window.gtag) {
            window.gtag('event', 'exception', {
                description: `${errorInfo.context}: ${errorInfo.message}`,
                fatal: false
            });
        }
    }

    /**
     * Get recent errors
     * @param {number} limit - Number of recent errors to return
     * @returns {Array} Recent errors
     */
    getRecentErrors(limit = 10) {
        return this.errors.slice(-limit);
    }

    /**
     * Clear error log
     */
    clearErrors() {
        this.errors = [];
    }

    /**
     * Validate form safely
     * @param {HTMLFormElement} form - Form element to validate
     * @param {Object} rules - Validation rules
     * @returns {Object} Validation result
     */
    validateForm(form, rules = {}) {
        return this.safeExecute(() => {
            const errors = {};
            const data = new FormData(form);
            
            for (const [field, rule] of Object.entries(rules)) {
                const value = data.get(field);
                
                if (rule.required && (!value || value.trim() === '')) {
                    errors[field] = rule.requiredMessage || `${field}은(는) 필수 항목입니다.`;
                    continue;
                }
                
                if (value && rule.pattern && !rule.pattern.test(value)) {
                    errors[field] = rule.patternMessage || `${field} 형식이 올바르지 않습니다.`;
                }
                
                if (value && rule.minLength && value.length < rule.minLength) {
                    errors[field] = rule.minLengthMessage || `${field}은(는) 최소 ${rule.minLength}자 이상이어야 합니다.`;
                }
                
                if (value && rule.maxLength && value.length > rule.maxLength) {
                    errors[field] = rule.maxLengthMessage || `${field}은(는) 최대 ${rule.maxLength}자까지 입력 가능합니다.`;
                }
            }
            
            return {
                isValid: Object.keys(errors).length === 0,
                errors,
                data: Object.fromEntries(data)
            };
        }, 'validateForm', { isValid: false, errors: {}, data: {} });
    }
}

// Create global instance
const errorHandler = new ErrorHandler();

// Export for module use
export default errorHandler;

// Global access for legacy compatibility
window.ErrorHandler = errorHandler;