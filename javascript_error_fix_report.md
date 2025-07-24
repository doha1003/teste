# JavaScript 오류 분석 및 수정 보고서

## 개요
doha.kr 사이트의 JavaScript 오류와 중복 정의 문제를 체계적으로 분석하고 수정했습니다.

## 발견된 문제들

### 1. Security 객체 관련 오류

#### 문제점
- `Security.sanitizeInput` 메서드가 여러 파일에서 호출되고 있으나, `security.js`에 정의되어 있지 않았습니다.
- 영향받는 파일:
  - `/faq/index.html` (550번째 줄)
  - `/tools/bmi-calculator.html` (백업 파일들)

#### 해결책
`/js/security.js` 파일에 `sanitizeInput` 메서드를 추가했습니다:

```javascript
// Sanitize input based on type
sanitizeInput: function(input, type = 'text') {
    if (!input) return '';
    
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
```

### 2. API_CONFIG 관련 문제

#### 문제점
- 일부 파일들이 `API_CONFIG.KAKAO_APP_KEY`를 참조하고 있으나, 실제로는 `API_CONFIG.KAKAO_JS_KEY`로 정의되어 있었습니다.
- API_CONFIG가 로드되지 않은 경우를 처리하지 않는 파일들이 있었습니다.

#### 수정된 파일들
1. `/tools/text-counter.html`
2. `/tools/index.html`
3. `/tools/salary-calculator.html`
4. `/tools/bmi-calculator.html`

#### 변경 내용
```javascript
// 변경 전
if (typeof Kakao !== 'undefined' && window.API_CONFIG && window.API_CONFIG.KAKAO_APP_KEY) {
    Kakao.init(window.API_CONFIG.KAKAO_APP_KEY);

// 변경 후
if (typeof Kakao !== 'undefined' && window.API_CONFIG && window.API_CONFIG.KAKAO_JS_KEY) {
    Kakao.init(window.API_CONFIG.KAKAO_JS_KEY);
```

### 3. API_CONFIG 로드 오류 처리

#### 문제점
`/tests/mbti/test.html` 파일이 API_CONFIG가 정의되지 않았을 때 즉시 반환하여 Kakao SDK 초기화를 시도하지 않았습니다.

#### 해결책
조건문을 개선하여 여러 fallback 옵션을 시도하도록 수정:

```javascript
if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
    try {
        if (typeof API_CONFIG !== 'undefined' && API_CONFIG.kakao && API_CONFIG.kakao.appKey) {
            Kakao.init(API_CONFIG.kakao.appKey);
        } else if (typeof API_CONFIG !== 'undefined' && API_CONFIG.KAKAO_JS_KEY) {
            Kakao.init(API_CONFIG.KAKAO_JS_KEY);
        } else if (window.initKakao) {
            window.initKakao();
        } else {
            console.warn('API 설정을 로드할 수 없습니다. 일부 기능이 제한될 수 있습니다.');
        }
    } catch (error) {
        console.error('Kakao SDK 초기화 실패:', error);
    }
}
```

### 4. 중복 정의 및 기타 발견사항

#### window.initKakao 함수
- `/js/api-config.js`에서 전역으로 정의됨
- 여러 HTML 파일에서 안전하게 호출되고 있음
- 중복 정의는 없음

#### showNotification, formatNumber 등
- `/js/main.js`에서 정의됨
- 중복 정의는 발견되지 않음

## 권장사항

### 1. 일관성 개선
- 모든 HTML 파일이 동일한 방식으로 API 설정을 처리하도록 통일
- Kakao SDK 초기화 코드를 중앙화된 파일로 관리

### 2. 오류 처리 강화
- API_CONFIG 로드 실패 시 graceful degradation 구현
- 사용자에게 영향을 주지 않도록 조용히 실패하도록 처리

### 3. 보안 강화
- Security 객체의 메서드들을 모든 사용자 입력에 적용
- XSS 및 기타 보안 취약점 방지

### 4. 코드 정리
- 백업 파일들 정리 (*.backup, *.backup_*_version 등)
- 사용하지 않는 코드 제거

## 결론
주요 JavaScript 오류들이 수정되었으며, 사이트의 안정성과 보안성이 향상되었습니다. 특히 Security.sanitizeInput 메서드 추가와 API_CONFIG 참조 오류 수정으로 런타임 오류가 해결되었습니다.