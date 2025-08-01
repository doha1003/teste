# Content Security Policy (CSP) 정책 문서

## 개요

doha.kr 웹사이트의 보안을 강화하기 위해 Content Security Policy (CSP)를 구현했습니다. CSP는 XSS(Cross-Site Scripting), 데이터 인젝션 공격 등 다양한 웹 보안 위협으로부터 웹사이트를 보호합니다.

## CSP 정책 구성

### 1. default-src 'self'
- **목적**: 기본적으로 모든 리소스를 같은 출처(doha.kr)에서만 로드하도록 제한
- **보안 효과**: 알 수 없는 외부 소스로부터의 리소스 로드 차단

### 2. script-src
- **정책**: `'self' 'unsafe-inline' 'unsafe-eval'` + 허용된 외부 도메인
- **허용된 외부 스크립트**:
  - Kakao SDK: `t1.kakaocdn.net`, `developers.kakao.com`
  - Google AdSense: `pagead2.googlesyndication.com`
  - Google Analytics: `www.googletagmanager.com`, `www.google-analytics.com`
  - CDN 라이브러리: `cdn.jsdelivr.net`, `unpkg.com`, `cdnjs.cloudflare.com`
  - Tailwind CSS: `cdn.tailwindcss.com`
- **주의사항**: `'unsafe-inline'`과 `'unsafe-eval'`은 보안 위험이 있으나, 현재 코드 구조상 필요

### 3. style-src
- **정책**: `'self' 'unsafe-inline'` + 허용된 외부 도메인
- **허용된 외부 스타일**:
  - Google Fonts: `fonts.googleapis.com`
  - CDN 스타일시트: `cdn.jsdelivr.net`
- **이유**: 인라인 스타일 사용 및 Google Fonts 지원

### 4. font-src
- **정책**: `'self' data:` + 허용된 외부 도메인
- **허용된 폰트 소스**:
  - Google Fonts: `fonts.gstatic.com`
  - CDN 폰트: `cdn.jsdelivr.net`
  - Base64 인코딩 폰트: `data:` URI

### 5. img-src
- **정책**: `'self' data: https: blob:`
- **설명**: 
  - 모든 HTTPS 이미지 허용 (사용자 생성 콘텐츠 지원)
  - Base64 인코딩 이미지 지원
  - Blob URL 이미지 지원 (파일 업로드 미리보기 등)

### 6. connect-src
- **정책**: `'self'` + API 및 분석 서비스
- **허용된 연결**:
  - Gemini API: `api.gemini.com`, `generativelanguage.googleapis.com`
  - Google 서비스: `accounts.google.com`, `www.google-analytics.com`
  - Kakao API: `t1.kakaocdn.net`
  - WebSocket: `wss://ws.example.com` (향후 실시간 기능용)

### 7. frame-src
- **정책**: `'self'` + 허용된 외부 iframe
- **허용된 iframe**:
  - YouTube 동영상: `www.youtube.com`
  - Google Ads: `googleads.g.doubleclick.net`

### 8. 기타 보안 지시어
- **object-src 'none'**: Flash, Java 등 플러그인 완전 차단
- **base-uri 'self'**: base 태그 URL 제한
- **form-action 'self'**: 폼 제출 대상 제한
- **frame-ancestors 'self'**: clickjacking 방지
- **upgrade-insecure-requests**: HTTP를 HTTPS로 자동 업그레이드

## CSP 위반 모니터링

### Report URI
- **엔드포인트**: `/api/csp-report`
- **목적**: CSP 위반 사항을 서버로 보고하여 모니터링
- **활용**: 
  - 정책 위반 패턴 분석
  - 누락된 허용 목록 발견
  - 보안 위협 감지

## 예외 사항 및 제한사항

### 1. unsafe-inline 및 unsafe-eval
- **이유**: 
  - 레거시 코드의 인라인 이벤트 핸들러 사용
  - 일부 서드파티 라이브러리의 eval() 사용
  - 동적 스타일 적용
- **개선 방향**: 
  - 점진적으로 인라인 스크립트를 외부 파일로 이동
  - 이벤트 리스너 방식으로 전환
  - CSP nonce 또는 hash 방식 도입 검토

### 2. 광범위한 이미지 소스 허용
- **이유**: 사용자가 다양한 소스의 이미지를 볼 수 있도록 지원
- **보안 고려사항**: HTTPS 프로토콜로 제한하여 중간자 공격 방지

### 3. Google AdSense 요구사항
- **필수 허용 도메인**: 
  - `pagead2.googlesyndication.com`
  - `googleads.g.doubleclick.net`
- **이유**: 광고 수익 모델 지원

## 개발 및 테스트

### 개발 환경 테스트
1. `csp-meta-tag.html` 파일의 meta 태그를 복사하여 HTML에 추가
2. 브라우저 개발자 도구 콘솔에서 CSP 위반 확인
3. 필요시 정책 조정

### CSP 검증 도구
- Google CSP Evaluator: https://csp-evaluator.withgoogle.com/
- Mozilla Observatory: https://observatory.mozilla.org/
- Security Headers: https://securityheaders.com/

### Report-Only 모드
테스트 시 `Content-Security-Policy-Report-Only` 헤더를 사용하여 차단 없이 위반 사항만 보고할 수 있습니다.

## 유지보수 가이드

### 새로운 외부 리소스 추가 시
1. 리소스의 필요성 검토
2. HTTPS 지원 확인
3. 해당 CSP 지시어에 도메인 추가
4. 개발 환경에서 테스트
5. `vercel.json` 업데이트 및 배포

### 정기적인 검토
- 월 1회 CSP 위반 로그 분석
- 분기별 정책 강화 검토
- 연간 보안 감사 시 CSP 정책 평가

## 향후 개선 계획

1. **단계적 강화**
   - unsafe-inline 제거를 위한 코드 리팩토링
   - CSP nonce 구현
   - 더 구체적인 소스 목록 지정

2. **모니터링 강화**
   - CSP 위반 대시보드 구축
   - 실시간 알림 시스템
   - 자동화된 정책 최적화

3. **성능 최적화**
   - 불필요한 외부 리소스 제거
   - 자체 호스팅으로 전환 검토
   - 리소스 로딩 최적화