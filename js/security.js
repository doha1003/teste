// =============================================
// SECURITY UTILITIES FOR XSS PREVENTION
// =============================================
// Created: 2025-01-10
// Purpose: Comprehensive security utilities for doha.kr

(function () {
  'use strict';

  // XSS Prevention utilities
  const Security = {
    // Sanitize HTML input to prevent XSS
    sanitizeHTML(str) {
      if (!str) {
        return '';
      }

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
    sanitizeAttr(str) {
      if (!str) {
        return '';
      }

      return String(str).replace(/['"<>&]/g, (match) => {
        const escapes = {
          '"': '&quot;',
          "'": '&#x27;',
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
        };
        return escapes[match];
      });
    },

    // Sanitize URL to prevent javascript: and data: schemes
    sanitizeURL(url) {
      if (!url) {
        return '';
      }

      try {
        const parsed = new URL(url, window.location.href);
        const allowedProtocols = ['http:', 'https:', 'mailto:'];

        if (!allowedProtocols.includes(parsed.protocol)) {
          return '';
        }

        return parsed.href;
      } catch (e) {
        // console.error removed('Invalid URL:', url);
        return '';
      }
    },

    // Sanitize input based on type
    sanitizeInput(input, type = 'text') {
      if (!input) {
        return '';
      }

      const str = String(input);

      switch (type) {
        case 'number':
          // Remove non-numeric characters except decimal point
          return str.replace(/[^0-9.-]/g, '');

        case 'email':
          // Basic email character sanitization
          return str.toLowerCase().replace(/[^a-z0-9@._-]/g, '');

        case 'phone':
          // Keep only numbers and hyphens
          return str.replace(/[^0-9-]/g, '');

        case 'text':
        default:
          // General text sanitization
          return this.sanitizeHTML(str);
      }
    },

    // Validate and sanitize numeric input
    validateNumber(input, min = 0, max = Infinity) {
      const num = parseFloat(input);

      if (isNaN(num) || !isFinite(num)) {
        return min;
      }

      return Math.max(min, Math.min(max, num));
    },

    // Validate email format
    validateEmail(email) {
      if (!email) {
        return false;
      }

      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(email).toLowerCase());
    },

    // Validate Korean phone number
    validatePhone(phone) {
      if (!phone) {
        return false;
      }

      const cleaned = phone.replace(/\D/g, '');
      const re = /^(01[0-9]{8,9}|02[0-9]{7,8}|0[3-9][0-9]{7,8})$/;
      return re.test(cleaned);
    },

    // Generate CSRF token
    generateCSRFToken() {
      if (window.crypto && window.crypto.getRandomValues) {
        return [...crypto.getRandomValues(new Uint8Array(32))]
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      }

      // Fallback for older browsers
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Validate CSRF token
    validateCSRFToken(token, storedToken) {
      if (!token || !storedToken) {
        return false;
      }
      return token === storedToken;
    },

    // Escape special regex characters
    escapeRegex(str) {
      if (!str) {
        return '';
      }
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    // Check for potentially dangerous content
    containsDangerousContent(str) {
      if (!str) {
        return false;
      }

      const dangerousPatterns = [
        /<script[^>]*>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi, // Event handlers
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
        /eval\s*\(/gi,
        /expression\s*\(/gi,
      ];

      return dangerousPatterns.some((pattern) => pattern.test(str));
    },

    // Safe JSON parsing
    safeJSONParse(str, defaultValue = null) {
      try {
        return JSON.parse(str);
      } catch (e) {
        // console.error removed('JSON parse error:', e);
        return defaultValue;
      }
    },

    // Validate allowed characters (Korean, English, numbers, basic punctuation)
    validateAllowedChars(str, allowSpecial = false) {
      if (!str) {
        return true;
      }

      const basicPattern = /^[가-힣a-zA-Z0-9\s\-\_\.\,\!\?]+$/;
      const specialPattern = /^[가-힣a-zA-Z0-9\s\-\_\.\,\!\?\@\#\$\%\&\*\(\)\[\]\{\}]+$/;

      const pattern = allowSpecial ? specialPattern : basicPattern;
      return pattern.test(str);
    },

    // Create safe element with text content
    createSafeElement(tagName, textContent, attributes = {}) {
      const element = document.createElement(tagName);

      if (textContent) {
        element.textContent = textContent;
      }

      // Safely set attributes
      Object.keys(attributes).forEach((key) => {
        if (key.toLowerCase().startsWith('on')) {
          return;
        }

        const value = this.sanitizeAttr(attributes[key]);
        element.setAttribute(key, value);
      });

      return element;
    },

    // Content Security Policy helper
    getCSPNonce() {
      const meta = document.querySelector('meta[name="csp-nonce"]');
      return meta ? meta.content : '';
    },

    // Rate limiting helper
    createRateLimiter(maxCalls, timeWindow) {
      const calls = [];

      return function () {
        const now = Date.now();
        const cutoff = now - timeWindow;

        // Remove old calls
        while (calls.length > 0 && calls[0] < cutoff) {
          calls.shift();
        }

        if (calls.length >= maxCalls) {
          return false;
        }

        calls.push(now);
        return true;
      };
    },
  };

  // Expose to global scope
  window.Security = Security;

  // Automatically sanitize common input events
  document.addEventListener('DOMContentLoaded', () => {
    // Auto-sanitize form inputs
    document.addEventListener('input', (e) => {
      if (e.target.matches('input[type="text"], input[type="email"], textarea')) {
        const maxLength = e.target.maxLength || 1000;

        if (e.target.value.length > maxLength) {
          e.target.value = e.target.value.substring(0, maxLength);
        }

        // Check for dangerous content
        if (Security.containsDangerousContent(e.target.value)) {
          e.target.value = Security.sanitizeHTML(e.target.value);
        }
      }
    });

    // Prevent form submission with dangerous content
    document.addEventListener('submit', (e) => {
      const form = e.target;
      const inputs = form.querySelectorAll('input, textarea, select');

      for (const input of inputs) {
        if (Security.containsDangerousContent(input.value)) {
          e.preventDefault();
          // console.error removed('Form submission blocked: dangerous content detected');

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
})();
