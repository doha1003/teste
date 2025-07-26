// Security configuration and DOMPurify wrapper
// 보안 설정 및 DOMPurify 래퍼

// DOMPurify 설정
const securityConfig = {
    // DOMPurify 기본 설정
    ALLOWED_TAGS: [
        'a', 'b', 'i', 'em', 'strong', 'span', 'div', 'p', 'br', 'hr',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        'img', 'figure', 'figcaption',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'blockquote', 'code', 'pre',
        'button', 'form', 'input', 'label', 'select', 'option', 'textarea'
    ],
    ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id', 'style',
        'target', 'rel', 'type', 'name', 'value', 'placeholder',
        'data-*', 'aria-*', 'role', 'tabindex'
    ],
    ALLOW_DATA_ATTR: true,
    KEEP_CONTENT: true
};

// 안전한 HTML 삽입 함수
function safeHTML(dirty, options = {}) {
    if (typeof DOMPurify === 'undefined') {
        console.error('DOMPurify가 로드되지 않았습니다.');
        return '';
    }
    
    const config = { ...securityConfig, ...options };
    return DOMPurify.sanitize(dirty, config);
}

// 안전한 텍스트 삽입 함수
function safeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// localStorage 암호화 래퍼
const secureStorage = {
    // 간단한 XOR 암호화 (프로덕션에서는 더 강력한 암호화 필요)
    encrypt: function(text) {
        const key = 'doha-kr-2025';
        let encrypted = '';
        for (let i = 0; i < text.length; i++) {
            encrypted += String.fromCharCode(
                text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return btoa(encrypted);
    },
    
    decrypt: function(encrypted) {
        const key = 'doha-kr-2025';
        const text = atob(encrypted);
        let decrypted = '';
        for (let i = 0; i < text.length; i++) {
            decrypted += String.fromCharCode(
                text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return decrypted;
    },
    
    setItem: function(key, value) {
        try {
            const encrypted = this.encrypt(JSON.stringify(value));
            localStorage.setItem(key, encrypted);
        } catch (e) {
            console.error('저장 실패:', e);
        }
    },
    
    getItem: function(key) {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return null;
            return JSON.parse(this.decrypt(encrypted));
        } catch (e) {
            console.error('읽기 실패:', e);
            return null;
        }
    },
    
    removeItem: function(key) {
        localStorage.removeItem(key);
    },
    
    clear: function() {
        localStorage.clear();
    }
};

// CSP 보고 함수
function reportCSPViolation(violation) {
    console.warn('CSP 위반 감지:', violation);
    // 프로덕션에서는 서버로 전송
}

// CSP 위반 이벤트 리스너
if (typeof document !== 'undefined') {
    document.addEventListener('securitypolicyviolation', reportCSPViolation);
}

// 입력값 검증 헬퍼
const inputValidation = {
    // 이름 검증 (한글, 영문만)
    validateName: function(name) {
        const pattern = /^[가-힣a-zA-Z\s]+$/;
        return pattern.test(name) && name.length >= 2 && name.length <= 20;
    },
    
    // 숫자 검증
    validateNumber: function(num, min, max) {
        const n = parseInt(num);
        return !isNaN(n) && n >= min && n <= max;
    },
    
    // 날짜 검증
    validateDate: function(year, month, day) {
        const date = new Date(year, month - 1, day);
        return date.getFullYear() == year && 
               date.getMonth() == month - 1 && 
               date.getDate() == day;
    },
    
    // XSS 위험 문자 제거
    sanitizeInput: function(input) {
        return input.replace(/[<>\"'&]/g, function(match) {
            const escapes = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '&': '&amp;'
            };
            return escapes[match];
        });
    }
};

// 전역으로 사용 가능하게 export
if (typeof window !== 'undefined') {
    window.safeHTML = safeHTML;
    window.safeText = safeText;
    window.secureStorage = secureStorage;
    window.inputValidation = inputValidation;
}