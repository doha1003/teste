// Prevent multiple declarations
(function () {
  'use strict';

  // Check if SecureDOM already exists
  if (window.SecureDOM) {
    
    return;
  }

  // Original code
  // Browser-compatible version - no ES6 exports
  /**
   * SecureDOM - XSS 방어를 위한 안전한 DOM 조작 래퍼 클래스
   * DOMPurify 기반으로 모든 innerHTML 사용을 안전하게 처리
   *
   * 사용법:
   * SecureDOM.setInnerHTML(element, content) - innerHTML 대신 사용
   * SecureDOM.setTextContent(element, content) - textContent 설정
   * SecureDOM.setAttribute(element, name, value) - 안전한 속성 설정
   */

  class SecureDOM {
    // 보안 설정
    static config = {
      allowedTags: [
        'b',
        'i',
        'em',
        'strong',
        'br',
        'p',
        'div',
        'span',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'img',
      ],
      allowedAttributes: ['class', 'id', 'style', 'src', 'alt', 'href', 'title', 'data-*'],
      forbiddenTags: ['script', 'iframe', 'object', 'embed', 'link', 'meta', 'style'],
      forbiddenAttributes: [
        'onload',
        'onerror',
        'onclick',
        'onmouseover',
        'onfocus',
        'onblur',
        'onchange',
        'onsubmit',
      ],
      maxContentLength: 50000, // 50KB 제한
    };

    // 통계 및 로깅
    static stats = {
      totalCalls: 0,
      sanitizedCalls: 0,
      blockedCalls: 0,
      averageProcessingTime: 0,
    };

    /**
     * 안전한 innerHTML 설정 (핵심 메서드)
     * @param {HTMLElement} element - 대상 엘리먼트
     * @param {string} dh-l-content - 설정할 HTML 콘텐츠
     * @param {Object} options - 추가 옵션
     */
    static setInnerHTML(element, content, options = {}) {
      const startTime = performance.now();

      try {
        // 1차 검증: 파라미터 유효성 검사
        if (!element || !(element instanceof HTMLElement)) {
          throw new Error('SecureDOM: Invalid element parameter');
        }

        if (typeof dh-l-content !== 'string') {
          
          dh-l-content = String(content);
        }

        // 2차 검증: 길이 제한 확인
        if (content.length > this.config.maxContentLength) {
          console.warn(`Content length exceeds limit (${this.config.maxContentLength})`); // eslint-disable-line no-console
          dh-l-content = `${content.substring(0, this.config.maxContentLength)  }...`;
        }

        // 3차 검증: DOMPurify 라이브러리 확인
        if (typeof DOMPurify === 'undefined') {
          
          this.setTextContent(element, content);
          return false;
        }

        // DOMPurify 설정
        const purifyConfig = {
          ALLOWED_TAGS: options.allowedTags || this.config.allowedTags,
          ALLOWED_ATTR: options.allowedAttributes || this.config.allowedAttributes,
          FORBID_TAGS: this.config.forbiddenTags,
          FORBID_ATTR: this.config.forbiddenAttributes,
          USE_PROFILES: { html: true },
          WHOLE_DOCUMENT: false,
          RETURN_DOM: false,
          RETURN_DOM_FRAGMENT: false,
          RETURN_DOM_IMPORT: false,
          SANITIZE_DOM: true,
          SAFE_FOR_TEMPLATES: true,
        };

        // 실제 sanitization 수행
        const originalLength = content.length;
        const sanitized = DOMPurify.sanitize(content, purifyConfig);
        const sanitizedLength = sanitized.length;

        // 변화가 있었다면 로그 기록
        if (originalLength !== sanitizedLength) {
          this.logSecurityEvent('content_sanitized', {
            originalLength,
            sanitizedLength,
            element: element.tagName || 'unknown',
            blocked: originalLength - sanitizedLength,
          });
          this.stats.sanitizedCalls++;
        }

        // 안전한 콘텐츠 설정
        element.innerHTML = sanitized;

        // 성능 통계 업데이트
        this.updateStats(performance.now() - startTime);

        return true;
      } catch (error) {
        // 에러 발생 시 안전한 폴백
        
        this.logSecurityEvent('sanitization_error', {
          error: error.message,
          element: element.tagName || 'unknown',
        });

        // 폴백: textContent 사용
        this.setTextContent(element, dh-l-content);
        this.stats.blockedCalls++;
        return false;
      }
    }

    /**
     * 안전한 textContent 설정
     * @param {HTMLElement} element - 대상 엘리먼트
     * @param {string} content - 설정할 텍스트
     */
    static setTextContent(element, content) {
      if (!element || !(element instanceof HTMLElement)) {
        throw new Error('SecureDOM: Invalid element parameter');
      }

      if (typeof dh-l-content !== 'string') {
        dh-l-content = String(content);
      }

      // XSS 위험 문자 제거 (textContent도 안전을 위해)
      const cleaned = content.replace(/[<>]/g, '');
      element.textContent = cleaned;

      this.logSecurityEvent('text_content_set', {
        length: cleaned.length,
        element: element.tagName || 'unknown',
      });
    }

    /**
     * 안전한 속성 설정
     * @param {HTMLElement} element - 대상 엘리먼트
     * @param {string} name - 속성명
     * @param {string} value - 속성값
     */
    static setAttribute(element, name, value) {
      if (!element || !(element instanceof HTMLElement)) {
        throw new Error('SecureDOM: Invalid element parameter');
      }

      const lowerName = name.toLowerCase();

      // 위험한 속성 차단
      if (this.config.forbiddenAttributes.includes(lowerName)) {
        
        this.logSecurityEvent('dangerous_attribute_blocked', {
          attribute: name,
          value,
          element: element.tagName || 'unknown',
        });
        return false;
      }

      // JavaScript URL 차단
      if (typeof value === 'string' && value.toLowerCase().includes('javascript:')) {
        
        this.logSecurityEvent('javascript_url_blocked', {
          attribute: name,
          value,
          element: element.tagName || 'unknown',
        });
        return false;
      }

      // 안전한 속성 설정
      try {
        if (typeof DOMPurify !== 'undefined') {
          const sanitizedValue = DOMPurify.sanitize(String(value));
          element.setAttribute(name, sanitizedValue);
        } else {
          element.setAttribute(name, String(value));
        }
        return true;
      } catch (error) {
        
        return false;
      }
    }

    /**
     * 기존 innerHTML 사용 감지 및 경고
     */
    static detectDangerousPatterns() {
      const scripts = document.querySelectorAll('script');
      let dangerousPatterns = 0;

      scripts.forEach((script) => {
        const content = script.textContent || script.innerHTML || '';

        // innerHTML 패턴 감지
        const innerHTMLMatches = content.match(/\.innerHTML\s*=/g);
        if (innerHTMLMatches) {
          dangerousPatterns += innerHTMLMatches.length;
          
        }

        // document.write 패턴 감지
        const documentWriteMatches = content.match(/document\.write/g);
        if (documentWriteMatches) {
          dangerousPatterns += documentWriteMatches.length;
          
        }
      });

      if (dangerousPatterns > 0) {
        this.showSecurityWarning(dangerousPatterns);
      }

      return dangerousPatterns;
    }

    /**
     * 보안 경고 표시 (개발 환경)
     */
    static showSecurityWarning(count) {
      if (this.isDevelopmentEnvironment()) {
        console.warn(`[Security] 잠재적으로 위험한 DOM 조작 패턴이 ${count}개 감지되었습니다. 더 안전한 방법으로 리팩터링하세요.`);
      }
    }

    /**
     * 개발 환경 감지
     */
    static isDevelopmentEnvironment() {
      return (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:' ||
        window.location.hostname.includes('test') ||
        window.location.hostname.includes('dev')
      );
    }

    /**
     * 보안 이벤트 로깅
     */
    static logSecurityEvent(type, data) {
      this.stats.totalCalls++;

      // 개발 환경에서만 상세 로그
      if (this.isDevelopmentEnvironment()) {
        
      }

      // 보안 로거가 있으면 전송
      if (typeof SecurityLogger !== 'undefined') {
        const severity = this.getSeverityLevel(type);
        SecurityLogger.log(type, data, severity);
      }

      // 심각한 이벤트는 사용자에게 알림 (프로덕션에서도)
      if (this.isCriticalEvent(type)) {
        this.handleCriticalSecurityEvent(type, data);
      }
    }

    /**
     * 심각도 레벨 결정
     */
    static getSeverityLevel(type) {
      const criticalEvents = [
        'sanitization_error',
        'dangerous_attribute_blocked',
        'javascript_url_blocked',
      ];
      const highEvents = ['content_sanitized'];
      const mediumEvents = ['text_content_set'];

      if (criticalEvents.includes(type)) {return 'critical';}
      if (highEvents.includes(type)) {return 'high';}
      if (mediumEvents.includes(type)) {return 'medium';}
      return 'low';
    }

    /**
     * 심각한 이벤트 처리
     */
    static handleCriticalSecurityEvent(type, data) {
      // 프로덕션 환경에서 심각한 보안 이벤트 발생 시
      if (!this.isDevelopmentEnvironment()) {
        // 에러 리포팅 서비스로 전송
        if (typeof gtag !== 'undefined') {
          gtag('event', 'security_event', {
            event_category: 'Security',
            event_label: type,
            value: 1,
          });
        }

        // 사용자에게 알림 (선택사항)
        if (type === 'sanitization_error') {
          
        }
      }
    }

    /**
     * 심각한 이벤트 여부 확인
     */
    static isCriticalEvent(type) {
      return [
        'sanitization_error',
        'dangerous_attribute_blocked',
        'javascript_url_blocked',
      ].includes(type);
    }

    /**
     * 성능 통계 업데이트
     */
    static updateStats(processingTime) {
      const totalTime =
        this.stats.averageProcessingTime * (this.stats.totalCalls - 1) + processingTime;
      this.stats.averageProcessingTime = totalTime / this.stats.totalCalls;
    }

    /**
     * 보안 통계 조회
     */
    static getSecurityStats() {
      return {
        ...this.stats,
        successRate:
          this.stats.totalCalls > 0
            ? `${(
                ((this.stats.totalCalls - this.stats.blockedCalls) / this.stats.totalCalls) *
                100
              ).toFixed(2)  }%`
            : '0%',
        timestamp: new Date().toISOString(),
      };
    }

    /**
     * 자동 마이그레이션 도우미 - 기존 innerHTML을 SecureDOM으로 교체
     */
    static autoMigrate() {
      if (!this.isDevelopmentEnvironment()) {
        throw new Error('autoMigrate()는 개발 환경에서만 사용해야 합니다.');
      }

      // 모든 스크립트 검사
      const migrationSuggestions = [];
      const scripts = document.querySelectorAll('script');

      scripts.forEach((script, index) => {
        const content = script.textContent || script.innerHTML || '';
        const innerHTMLMatches = content.match(/(\w+)\.innerHTML\s*=\s*([^;]+);?/g);

        if (innerHTMLMatches) {
          innerHTMLMatches.forEach((match) => {
            migrationSuggestions.push({
              original: match,
              secure: match.replace(
                /(\w+)\.innerHTML\s*=\s*([^;]+);?/,
                'SecureDOM.setInnerHTML($1, $2);'
              ),
              scriptIndex: index,
            });
          });
        }
      });

      if (migrationSuggestions.length > 0) {
        
        migrationSuggestions.forEach((suggestion, i) => {

        });
        
      } else {
        
      }

      return migrationSuggestions;
    }

    /**
     * 폼 입력값 검증 시스템
     */
    static validateFormInput(input, type = 'text') {
      if (typeof Security !== 'undefined') {
        return Security.sanitizeInput(input, type);
      }

      // Security 모듈이 없으면 기본 검증
      return this.basicInputValidation(input, type);
    }

    /**
     * 기본 입력값 검증 (Security 모듈 폴백)
     */
    static basicInputValidation(input, type) {
      if (!input) {return '';}

      const str = String(input);

      switch (type) {
        case 'number':
          return str.replace(/[^0-9.-]/g, '');
        case 'email':
          return str.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
        default:
          return str.replace(/[<>&"']/g, (match) => {
            const entityMap = {
              '<': '&lt;',
              '>': '&gt;',
              '&': '&amp;',
              '"': '&quot;',
              "'": '&#39;',
            };
            return entityMap[match];
          });
      }
    }

    /**
     * 폼 자동 보안 검증 설정
     */
    static secureForm(formElement) {
      if (!formElement || !(formElement instanceof HTMLFormElement)) {
        
        return false;
      }

      const inputs = formElement.querySelectorAll('input, textarea, select');

      inputs.forEach((input) => {
        // 입력값 실시간 검증
        input.addEventListener('input', (e) => {
          const type = e.target.type || 'text';
          const validated = this.validateFormInput(e.target.value, type);

          if (validated !== e.target.value) {
            this.logSecurityEvent('input_sanitized', {
              element: e.target.tagName,
              type,
              original: e.target.value,
              sanitized: validated,
            });
            e.target.value = validated;
          }
        });

        // CSRF 토큰 자동 추가 (hidden input이 있으면)
        if (input.name === 'csrf_token' && input.type === 'dh-u-hidden') {
          if (typeof Security !== 'undefined' && Security.generateCSRFToken) {
            input.value = Security.generateCSRFToken();
          }
        }
      });

      // 폼 제출 시 최종 검증
      formElement.addEventListener('submit', (e) => {
        const formData = new FormData(formElement);
        let hasIssues = false;

        for (const [key, value] of formData.entries()) {
          if (typeof Security !== 'undefined' && Security.containsDangerousContent) {
            if (Security.containsDangerousContent(value)) {
              hasIssues = true;
              this.logSecurityEvent('dangerous_content_blocked', {
                field: key,
                value,
              });
            }
          }
        }

        if (hasIssues) {
          e.preventDefault();
          alert('보안상의 이유로 일부 입력이 차단되었습니다. 입력 내용을 확인해주세요.');
          return false;
        }
      });

      return true;
    }

    /**
     * 초기화 및 설정
     */
    static init(customConfig = {}) {
      // 설정 병합
      this.config = { ...this.config, ...customConfig };

      // DOMPurify 라이브러리 확인
      if (typeof DOMPurify === 'undefined') {

        return false;
      }

      // 모든 폼에 자동 보안 검증 적용
      const forms = document.querySelectorAll('form');
      forms.forEach((form) => this.secureForm(form));

      // 개발 환경에서 자동 패턴 검사
      if (this.isDevelopmentEnvironment()) {
        // DOM 로드 완료 후 검사
        if (document.readyState === 'dh-u-loading') {
          document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => this.detectDangerousPatterns(), 1000);
          });
        } else {
          setTimeout(() => this.detectDangerousPatterns(), 1000);
        }
      }

      return true;
    }
  }

  // 전역 접근 가능하도록 등록
  window.SecureDOM = SecureDOM;

  // 기존 innerHTML 사용 감지 (개발 환경에서만)
  if (SecureDOM.isDevelopmentEnvironment()) {
    // innerHTML 접근 감지를 위한 프록시 (선택사항)
    const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');

    Object.defineProperty(Element.prototype, 'innerHTML', {
      get: originalInnerHTML.get,
      set (value) {
        console.warn('[SecureDOM] innerHTML 직접 대입이 감지되었습니다. 가능한 경우 safeHTML과 setHTML을 사용하세요.');
        originalInnerHTML.set.call(this, value);
      },
      configurable: true,
    });
  }

  // 자동 초기화
  document.addEventListener('DOMContentLoaded', () => {
    SecureDOM.init();
  });

  // export default SecureDOM;
  // Safe HTML helper function
  window.safeHTML = function (html) {
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(html);
    }
    // Fallback: just return the HTML if DOMPurify is not loaded
    return html;
  };

  // Export to global scope
  window.SecureDOM = SecureDOM;
})();
