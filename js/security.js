// =============================================
// SECURITY UTILITIES FOR XSS PREVENTION
// =============================================
// Created: 2025-01-10
// Purpose: Comprehensive security utilities for doha.kr

(function() {
    'use strict';
    
    // XSS Prevention utilities
    const Security = {
        // Sanitize HTML input to prevent XSS
        sanitizeHTML: function(str) {
            if (!str) return '';
            
            // Check if DOMPurify is available (recommended)
            if (typeof DOMPurify !== 'undefined') {
                return DOMPurify.sanitize(str);
            }
            
            // Fallback basic sanitization
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },
        
        // Sanitize string for use in HTML attributes
        sanitizeAttr: function(str) {
            if (!str) return '';
            
            return String(str)
                .replace(/['"<>&]/g, function(match) {
                    const escapes = {
                        '"': '&quot;',
                        "'": '&#x27;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '&': '&amp;'
                    };
                    return escapes[match];
                });
        },
        
        // Sanitize URL to prevent javascript: and data: schemes
        sanitizeURL: function(url) {
            if (!url) return '';
            
            try {
                const parsed = new URL(url, window.location.href);
                const allowedProtocols = ['http:', 'https:', 'mailto:'];
                
                if (!allowedProtocols.includes(parsed.protocol)) {
                    // console.warn('Blocked potentially dangerous URL:', url);
                    return '';
                }
                
                return parsed.href;
            } catch (e) {
                // console.error('Invalid URL:', url);
                return '';
            }
        },
        
        // Validate and sanitize numeric input
        validateNumber: function(input, min = 0, max = Infinity) {
            const num = parseFloat(input);
            
            if (isNaN(num) || !isFinite(num)) {
                return min;
            }
            
            return Math.max(min, Math.min(max, num));
        },
        
        // Validate email format
        validateEmail: function(email) {
            if (!email) return false;
            
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(String(email).toLowerCase());
        },
        
        // Validate Korean phone number
        validatePhone: function(phone) {
            if (!phone) return false;
            
            const cleaned = phone.replace(/\D/g, '');
            const re = /^(01[0-9]{8,9}|02[0-9]{7,8}|0[3-9][0-9]{7,8})$/;
            return re.test(cleaned);
        },
        
        // Generate CSRF token
        generateCSRFToken: function() {
            if (window.crypto && window.crypto.getRandomValues) {
                return [...crypto.getRandomValues(new Uint8Array(32))]
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            }
            
            // Fallback for older browsers
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },
        
        // Validate CSRF token
        validateCSRFToken: function(token, storedToken) {
            if (!token || !storedToken) return false;
            return token === storedToken;
        },
        
        // Escape special regex characters
        escapeRegex: function(str) {
            if (!str) return '';
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        },
        
        // Check for potentially dangerous content
        containsDangerousContent: function(str) {
            if (!str) return false;
            
            const dangerousPatterns = [
                /<script[^>]*>/gi,
                /javascript:/gi,
                /on\w+\s*=/gi,  // Event handlers
                /<iframe/gi,
                /<object/gi,
                /<embed/gi,
                /eval\s*\(/gi,
                /expression\s*\(/gi
            ];
            
            return dangerousPatterns.some(pattern => pattern.test(str));
        },
        
        // Safe JSON parsing
        safeJSONParse: function(str, defaultValue = null) {
            try {
                return JSON.parse(str);
            } catch (e) {
                // console.error('JSON parse error:', e);
                return defaultValue;
            }
        },
        
        // Validate allowed characters (Korean, English, numbers, basic punctuation)
        validateAllowedChars: function(str, allowSpecial = false) {
            if (!str) return true;
            
            const basicPattern = /^[가-힣a-zA-Z0-9\s\-\_\.\,\!\?]+$/;
            const specialPattern = /^[가-힣a-zA-Z0-9\s\-\_\.\,\!\?\@\#\$\%\&\*\(\)\[\]\{\}]+$/;
            
            const pattern = allowSpecial ? specialPattern : basicPattern;
            return pattern.test(str);
        },
        
        // Create safe element with text content
        createSafeElement: function(tagName, textContent, attributes = {}) {
            const element = document.createElement(tagName);
            
            if (textContent) {
                element.textContent = textContent;
            }
            
            // Safely set attributes
            Object.keys(attributes).forEach(key => {
                if (key.toLowerCase().startsWith('on')) {
                    // console.warn('Event handler attributes not allowed');
                    return;
                }
                
                const value = this.sanitizeAttr(attributes[key]);
                element.setAttribute(key, value);
            });
            
            return element;
        },
        
        // Content Security Policy helper
        getCSPNonce: function() {
            const meta = document.querySelector('meta[name="csp-nonce"]');
            return meta ? meta.content : '';
        },
        
        // Rate limiting helper
        createRateLimiter: function(maxCalls, timeWindow) {
            const calls = [];
            
            return function() {
                const now = Date.now();
                const cutoff = now - timeWindow;
                
                // Remove old calls
                while (calls.length > 0 && calls[0] < cutoff) {
                    calls.shift();
                }
                
                if (calls.length >= maxCalls) {
                    // console.warn('Rate limit exceeded');
                    return false;
                }
                
                calls.push(now);
                return true;
            };
        }
    };
    
    // Expose to global scope
    window.Security = Security;
    
    // Automatically sanitize common input events
    document.addEventListener('DOMContentLoaded', function() {
        // Auto-sanitize form inputs
        document.addEventListener('input', function(e) {
            if (e.target.matches('input[type="text"], input[type="email"], textarea')) {
                const maxLength = e.target.maxLength || 1000;
                
                if (e.target.value.length > maxLength) {
                    e.target.value = e.target.value.substring(0, maxLength);
                }
                
                // Check for dangerous content
                if (Security.containsDangerousContent(e.target.value)) {
                    e.target.value = Security.sanitizeHTML(e.target.value);
                    // console.warn('Potentially dangerous content sanitized');
                }
            }
        });
        
        // Prevent form submission with dangerous content
        document.addEventListener('submit', function(e) {
            const form = e.target;
            const inputs = form.querySelectorAll('input, textarea, select');
            
            for (let input of inputs) {
                if (Security.containsDangerousContent(input.value)) {
                    e.preventDefault();
                    // console.error('Form submission blocked: dangerous content detected');
                    
                    // Show user-friendly error
                    if (typeof showNotification === 'function') {
                        showNotification('입력 내용에 허용되지 않는 문자가 포함되어 있습니다.', 'error');
                    } else {
                        alert('입력 내용에 허용되지 않는 문자가 포함되어 있습니다.');
                    }
                    
                    return false;
                }
            }
        });
    });
    
    // Log successful initialization
    // console.log('Security utilities loaded successfully');
})();