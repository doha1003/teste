// Form Validation Module
// 폼 입력값 검증 모듈

// 폼별 검증 규칙
const validationRules = {
    // 오늘의 운세 폼
    dailyFortune: {
        userName: {
            required: true,
            minLength: 2,
            maxLength: 20,
            pattern: /^[가-힣a-zA-Z\s]+$/,
            message: '이름은 2-20자의 한글 또는 영문만 입력 가능합니다.'
        },
        birthYear: {
            required: true,
            min: 1920,
            max: new Date().getFullYear(),
            message: '올바른 출생년도를 선택해주세요.'
        },
        birthMonth: {
            required: true,
            min: 1,
            max: 12,
            message: '올바른 월을 선택해주세요.'
        },
        birthDay: {
            required: true,
            min: 1,
            max: 31,
            message: '올바른 일을 선택해주세요.'
        }
    },
    
    // 사주팔자 폼
    sajuFortune: {
        userName: {
            required: true,
            minLength: 2,
            maxLength: 20,
            pattern: /^[가-힣a-zA-Z\s]+$/,
            message: '이름은 2-20자의 한글 또는 영문만 입력 가능합니다.'
        },
        gender: {
            required: true,
            options: ['male', 'female'],
            message: '성별을 선택해주세요.'
        },
        birthYear: {
            required: true,
            min: 1920,
            max: new Date().getFullYear(),
            message: '올바른 출생년도를 선택해주세요.'
        },
        birthMonth: {
            required: true,
            min: 1,
            max: 12,
            message: '올바른 월을 선택해주세요.'
        },
        birthDay: {
            required: true,
            min: 1,
            max: 31,
            message: '올바른 일을 선택해주세요.'
        },
        birthTime: {
            required: false,
            min: -1,
            max: 22,
            message: '올바른 시간을 선택해주세요.'
        }
    },
    
    // 타로 폼
    tarotFortune: {
        tarotQuestion: {
            required: true,
            minLength: 5,
            maxLength: 200,
            pattern: /^[가-힣a-zA-Z0-9\s\?\.\,\!\-]+$/,
            message: '질문은 5-200자로 입력해주세요. 특수문자는 ?,.,!,-만 사용 가능합니다.'
        },
        spreadType: {
            required: true,
            options: ['simple', 'love', 'career'],
            message: '스프레드 타입을 선택해주세요.'
        }
    },
    
    // MBTI 테스트 답변
    mbtiAnswer: {
        answer: {
            required: true,
            options: ['1', '2', '3', '4', '5'],
            message: '답변을 선택해주세요.'
        }
    },
    
    // Love DNA 테스트 답변
    loveDnaAnswer: {
        answer: {
            required: true,
            options: ['A', 'B', 'C', 'D'],
            message: '답변을 선택해주세요.'
        }
    },
    
    // BMI 계산기
    bmiCalculator: {
        height: {
            required: true,
            min: 50,
            max: 250,
            type: 'number',
            message: '키는 50-250cm 범위로 입력해주세요.'
        },
        weight: {
            required: true,
            min: 20,
            max: 300,
            type: 'number',
            message: '몸무게는 20-300kg 범위로 입력해주세요.'
        }
    },
    
    // 연봉 계산기
    salaryCalculator: {
        salary: {
            required: true,
            min: 0,
            max: 1000000000,
            type: 'number',
            message: '올바른 연봉을 입력해주세요.'
        }
    }
};

// 검증 함수들
const validators = {
    // 필수값 검증
    required: (value) => {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },
    
    // 최소 길이 검증
    minLength: (value, min) => {
        return value && value.toString().length >= min;
    },
    
    // 최대 길이 검증
    maxLength: (value, max) => {
        return !value || value.toString().length <= max;
    },
    
    // 패턴 검증
    pattern: (value, regex) => {
        return !value || regex.test(value.toString());
    },
    
    // 최소값 검증
    min: (value, min) => {
        const num = Number(value);
        return !isNaN(num) && num >= min;
    },
    
    // 최대값 검증
    max: (value, max) => {
        const num = Number(value);
        return !isNaN(num) && num <= max;
    },
    
    // 옵션 검증
    options: (value, options) => {
        return options.includes(value);
    },
    
    // 타입 검증
    type: (value, type) => {
        if (type === 'number') {
            return !isNaN(Number(value));
        }
        return true;
    },
    
    // 날짜 유효성 검증
    validDate: (year, month, day) => {
        const date = new Date(year, month - 1, day);
        return date.getFullYear() == year && 
               date.getMonth() == month - 1 && 
               date.getDate() == day;
    }
};

// 폼 검증 클래스
class FormValidator {
    constructor(formId, rules) {
        this.form = document.getElementById(formId);
        this.rules = rules;
        this.errors = {};
        
        if (this.form) {
            this.attachEventListeners();
        }
    }
    
    // 이벤트 리스너 등록
    attachEventListeners() {
        // 실시간 검증
        this.form.addEventListener('input', (e) => {
            if (e.target.name && this.rules[e.target.name]) {
                this.validateField(e.target.name, e.target.value);
                this.updateFieldUI(e.target.name);
            }
        });
        
        // 폼 제출 시 전체 검증
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateAll()) {
                // 검증 통과 시 원래 제출 함수 호출
                const submitEvent = new Event('validatedSubmit', { bubbles: true });
                this.form.dispatchEvent(submitEvent);
            }
        });
    }
    
    // 개별 필드 검증
    validateField(fieldName, value) {
        const rules = this.rules[fieldName];
        if (!rules) return true;
        
        // XSS 방지를 위한 기본 sanitization
        const sanitizedValue = this.sanitize(value);
        
        // 각 규칙 검사
        if (rules.required && !validators.required(sanitizedValue)) {
            this.errors[fieldName] = '필수 입력 항목입니다.';
            return false;
        }
        
        if (rules.minLength && !validators.minLength(sanitizedValue, rules.minLength)) {
            this.errors[fieldName] = rules.message || `최소 ${rules.minLength}자 이상 입력해주세요.`;
            return false;
        }
        
        if (rules.maxLength && !validators.maxLength(sanitizedValue, rules.maxLength)) {
            this.errors[fieldName] = rules.message || `최대 ${rules.maxLength}자까지 입력 가능합니다.`;
            return false;
        }
        
        if (rules.pattern && !validators.pattern(sanitizedValue, rules.pattern)) {
            this.errors[fieldName] = rules.message || '올바른 형식으로 입력해주세요.';
            return false;
        }
        
        if (rules.min !== undefined && !validators.min(sanitizedValue, rules.min)) {
            this.errors[fieldName] = rules.message || `최소값은 ${rules.min}입니다.`;
            return false;
        }
        
        if (rules.max !== undefined && !validators.max(sanitizedValue, rules.max)) {
            this.errors[fieldName] = rules.message || `최대값은 ${rules.max}입니다.`;
            return false;
        }
        
        if (rules.options && !validators.options(sanitizedValue, rules.options)) {
            this.errors[fieldName] = rules.message || '올바른 옵션을 선택해주세요.';
            return false;
        }
        
        if (rules.type && !validators.type(sanitizedValue, rules.type)) {
            this.errors[fieldName] = rules.message || '올바른 형식으로 입력해주세요.';
            return false;
        }
        
        // 검증 통과
        delete this.errors[fieldName];
        return true;
    }
    
    // 전체 폼 검증
    validateAll() {
        this.errors = {};
        let isValid = true;
        
        // 모든 필드 검증
        Object.keys(this.rules).forEach(fieldName => {
            const field = this.form.elements[fieldName];
            if (field) {
                const fieldValid = this.validateField(fieldName, field.value);
                if (!fieldValid) {
                    isValid = false;
                }
                this.updateFieldUI(fieldName);
            }
        });
        
        // 날짜 유효성 추가 검증 (사주/운세용)
        if (this.form.elements.birthYear && this.form.elements.birthMonth && this.form.elements.birthDay) {
            const year = this.form.elements.birthYear.value;
            const month = this.form.elements.birthMonth.value;
            const day = this.form.elements.birthDay.value;
            
            if (year && month && day && !validators.validDate(year, month, day)) {
                this.errors.birthDay = '유효하지 않은 날짜입니다.';
                isValid = false;
                this.updateFieldUI('birthDay');
            }
        }
        
        return isValid;
    }
    
    // UI 업데이트
    updateFieldUI(fieldName) {
        const field = this.form.elements[fieldName];
        if (!field) return;
        
        const errorElement = this.form.querySelector(`[data-error-for="${fieldName}"]`);
        
        if (this.errors[fieldName]) {
            field.classList.add('error');
            field.setAttribute('aria-invalid', 'true');
            
            if (errorElement) {
                errorElement.textContent = this.errors[fieldName];
                errorElement.style.display = 'block';
            }
        } else {
            field.classList.remove('error');
            field.setAttribute('aria-invalid', 'false');
            
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        }
    }
    
    // XSS 방지 sanitization
    sanitize(value) {
        if (typeof value !== 'string') return value;
        
        // HTML 태그 제거
        value = value.replace(/<[^>]*>/g, '');
        
        // 위험한 문자 이스케이프
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        };
        
        return value.replace(/[&<>"'\/]/g, (char) => escapeMap[char]);
    }
    
    // 에러 메시지 가져오기
    getErrors() {
        return this.errors;
    }
    
    // 특정 필드 에러 가져오기
    getFieldError(fieldName) {
        return this.errors[fieldName] || null;
    }
    
    // 에러 초기화
    clearErrors() {
        this.errors = {};
        Object.keys(this.rules).forEach(fieldName => {
            this.updateFieldUI(fieldName);
        });
    }
}

// 전역 사용을 위한 초기화 함수
function initializeFormValidation() {
    // 오늘의 운세
    if (document.getElementById('fortuneForm')) {
        window.dailyFortuneValidator = new FormValidator('fortuneForm', validationRules.dailyFortune);
    }
    
    // 사주팔자
    if (document.getElementById('sajuForm')) {
        window.sajuValidator = new FormValidator('sajuForm', validationRules.sajuFortune);
    }
    
    // 타로
    if (document.getElementById('tarotForm')) {
        window.tarotValidator = new FormValidator('tarotForm', validationRules.tarotFortune);
    }
    
    // BMI 계산기
    if (document.getElementById('bmiForm')) {
        window.bmiValidator = new FormValidator('bmiForm', validationRules.bmiCalculator);
    }
    
    // 연봉 계산기
    if (document.getElementById('salaryForm')) {
        window.salaryValidator = new FormValidator('salaryForm', validationRules.salaryCalculator);
    }
}

// DOMContentLoaded 시 자동 초기화
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeFormValidation);
}

// Export
if (typeof window !== 'undefined') {
    window.FormValidator = FormValidator;
    window.validationRules = validationRules;
    window.validators = validators;
}