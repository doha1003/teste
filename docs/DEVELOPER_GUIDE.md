# doha.kr 개발자 가이드

## 📚 목차
1. [프로젝트 구조](#프로젝트-구조)
2. [보안 구현](#보안-구현)
3. [SEO 최적화](#seo-최적화)
4. [API 문서](#api-문서)
5. [유지보수 가이드](#유지보수-가이드)
6. [배포 가이드](#배포-가이드)

---

## 프로젝트 구조

### 디렉토리 구조
```
doha.kr/
├── api/                    # PHP API 엔드포인트
│   └── fortune.php        # AI 운세 API (Gemini API 연동)
├── css/                   # 스타일시트
│   ├── core/             # 핵심 CSS 모듈
│   ├── components/       # 컴포넌트별 CSS
│   └── pages/           # 페이지별 CSS
├── js/                   # JavaScript 파일
│   ├── utils/           # 유틸리티 함수
│   ├── components/      # 컴포넌트 스크립트
│   └── pages/          # 페이지별 스크립트
├── includes/            # 재사용 컴포넌트
│   ├── navbar.html     # 네비게이션 바
│   └── footer.html     # 푸터
├── tests/              # 심리테스트 페이지
├── tools/              # 실용도구 페이지
├── fortune/            # AI 운세 페이지
└── vercel.json         # Vercel 배포 설정

```

### 주요 파일 설명
- `main.js`: 공통 JavaScript (컴포넌트 로딩, 네비게이션)
- `security.js`: 보안 유틸리티 (DOMPurify 래퍼)
- `api-config.js`: API 키 및 설정 관리
- `vercel.json`: 서버 레벨 보안 헤더 및 배포 설정

---

## 보안 구현

### 1. Content Security Policy (CSP)
모든 페이지에 CSP 메타 태그 적용:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self'; 
  script-src 'self' https://pagead2.googlesyndication.com https://t1.kakaocdn.net https://cdn.jsdelivr.net; 
  style-src 'self' https://fonts.googleapis.com; 
  font-src 'self' https://fonts.gstatic.com; 
  img-src 'self' data: https:; 
  connect-src 'self' https://pagead2.googlesyndication.com;
">
```

### 2. XSS 방지
DOMPurify를 사용한 입력값 sanitization:
```javascript
// security.js
window.SecurityUtils = {
    sanitizeHTML: function(dirty) {
        return DOMPurify.sanitize(dirty, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
            ALLOWED_ATTR: ['href', 'title', 'target']
        });
    }
};
```

### 3. 서버 레벨 보안 헤더
vercel.json을 통해 적용:
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)
- Referrer-Policy
- Permissions-Policy

### 4. PHP API 보안
fortune.php의 입력값 검증:
```php
function sanitizeInput($input, $maxLength = 50, $pattern = null) {
    $input = trim($input);
    $input = strip_tags($input);
    $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    
    // 길이 제한
    if (mb_strlen($input, 'UTF-8') > $maxLength) {
        $input = mb_substr($input, 0, $maxLength, 'UTF-8');
    }
    
    // 패턴 검증
    if ($pattern && !preg_match($pattern, $input)) {
        return '';
    }
    
    // Prompt injection 방지
    $dangerousPatterns = ['/당신은.*입니다/i', '/무시하고/i', '/system/i'];
    foreach ($dangerousPatterns as $pattern) {
        if (preg_match($pattern, $input)) {
            return '';
        }
    }
    
    return $input;
}
```

---

## SEO 최적화

### 1. 메타 태그
모든 페이지에 필수 메타 태그:
```html
<title>페이지 제목 - 서비스명 | doha.kr</title>
<meta name="description" content="300자 이상의 상세한 설명...">
<meta name="keywords" content="키워드1, 키워드2, ...">
<link rel="canonical" href="https://doha.kr/page-path/">
```

### 2. Open Graph
소셜 미디어 공유 최적화:
```html
<meta property="og:title" content="페이지 제목">
<meta property="og:description" content="페이지 설명">
<meta property="og:image" content="https://doha.kr/images/og-image.jpg">
<meta property="og:url" content="https://doha.kr/page-path/">
```

### 3. 구조화된 데이터
Schema.org 마크업 적용:
```javascript
{
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "도구명",
    "description": "도구 설명",
    "url": "https://doha.kr/tools/tool-name.html",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "KRW"
    }
}
```

---

## API 문서

### fortune.php API
AI 운세 서비스를 위한 Gemini API 프록시

#### 엔드포인트
```
POST /api/fortune
Content-Type: application/json
```

#### 요청 형식
```json
{
    "type": "daily|zodiac|animal",
    "name": "사용자명",
    "birthDate": "YYYY-MM-DD",
    "gender": "male|female",
    "zodiac": "별자리명",
    "animal": "띠명"
}
```

#### 응답 형식
```json
{
    "success": true,
    "data": {
        "scores": {
            "overall": 85,
            "love": 75,
            "money": 70,
            "health": 90,
            "work": 80
        },
        "descriptions": {
            "overall": "종합 운세 설명",
            "love": "애정운 설명",
            "money": "금전운 설명",
            "health": "건강운 설명",
            "work": "사업운 설명"
        },
        "luck": {
            "direction": "동쪽",
            "time": "오시(11-13시)",
            "color": "청색"
        }
    }
}
```

#### 에러 처리
- 405: Method not allowed (POST만 허용)
- 400: Invalid request (필수 파라미터 누락)
- 200 with backup data: API 키 없거나 외부 API 실패 시

---

## 유지보수 가이드

### 1. 새 페이지 추가 시
1. `/templates/page-template.html` 복사하여 시작
2. 메타 태그 업데이트 (title, description, keywords)
3. Open Graph 태그 추가
4. 구조화된 데이터 추가
5. navbar와 footer placeholder 추가
6. sitemap.xml 업데이트

### 2. CSS 수정 시
- 전역 변수는 `/css/core/variables.css`에서만 정의
- 페이지별 스타일은 `/css/pages/`에 별도 파일로
- 컴포넌트 스타일은 `/css/components/`에

### 3. JavaScript 수정 시
- 공통 함수는 `/js/utils/`에 모듈로 분리
- 페이지별 스크립트는 `/js/pages/`에
- ES6+ 문법 사용, IE11 지원 필요시 트랜스파일

### 4. 보안 업데이트
- DOMPurify 정기적 업데이트
- CSP 정책 검토 및 강화
- 의존성 취약점 스캔 (npm audit)

---

## 배포 가이드

### 1. Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결
vercel link

# 프로덕션 배포
vercel --prod
```

### 2. 환경 변수 설정
Vercel 대시보드에서 설정:
- `GEMINI_API_KEY`: Gemini API 키
- `KAKAO_API_KEY`: 카카오 JavaScript 키

### 3. 도메인 설정
1. Vercel 프로젝트 설정에서 도메인 추가
2. DNS 레코드 업데이트:
   - A 레코드: 76.76.21.21
   - CNAME: cname.vercel-dns.com

### 4. 배포 전 체크리스트
- [ ] 모든 링크 작동 확인
- [ ] 이미지 최적화 완료
- [ ] CSS/JS 압축
- [ ] 메타 태그 검증
- [ ] 구조화된 데이터 테스트
- [ ] 모바일 반응형 테스트
- [ ] 접근성 검사
- [ ] 보안 헤더 확인

---

## 문제 해결

### 일반적인 문제
1. **컴포넌트가 로드되지 않음**
   - main.js가 제대로 로드되었는지 확인
   - 네트워크 탭에서 404 에러 확인
   - placeholder ID 확인

2. **CSS가 적용되지 않음**
   - CSS 파일 경로 확인
   - 캐시 지우기
   - CSS 우선순위 충돌 확인

3. **API 호출 실패**
   - CORS 정책 확인
   - API 키 설정 확인
   - 네트워크 에러 로그 확인

### 디버깅 팁
```javascript
// 개발 모드 활성화
localStorage.setItem('debug', 'true');

// 콘솔에서 API 테스트
fetch('/api/fortune', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({type: 'daily', name: '테스트'})
}).then(r => r.json()).then(console.log);
```

---

마지막 업데이트: 2025-01-11