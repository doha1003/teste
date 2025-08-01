# CORS 및 보안 설정 가이드

## 개요

doha.kr 프로젝트는 보안을 최우선으로 하여 엄격한 CORS(Cross-Origin Resource Sharing) 정책과 보안 헤더를 구현합니다.

## CORS 설정

### 허용된 도메인

프로덕션 환경에서는 다음 도메인만 API 접근이 허용됩니다:

- `https://doha.kr` - 메인 도메인
- `https://www.doha.kr` - www 서브도메인
- `https://sunro76.github.io` - GitHub Pages 배포

### 환경별 설정

#### 개발 환경 (NODE_ENV=development)
추가로 허용되는 도메인:
- `http://localhost:5173` - Vite 개발 서버
- `http://localhost:3000` - 기타 개발 서버
- `http://127.0.0.1:5173` - IP 주소 접근

#### 스테이징 환경 (VERCEL_ENV=preview)
- Vercel 프리뷰 배포 URL 자동 허용
- `https://*.vercel.app` 패턴 매칭

## 보안 헤더

모든 응답에 다음 보안 헤더가 포함됩니다:

### 1. X-Content-Type-Options: nosniff
- MIME 타입 스니핑 방지
- 브라우저가 선언된 Content-Type을 변경하지 못하도록 함

### 2. X-Frame-Options: SAMEORIGIN
- 클릭재킹 공격 방지
- 같은 도메인에서만 iframe 사용 허용

### 3. X-XSS-Protection: 1; mode=block
- XSS 공격 감지 시 페이지 로드 차단
- 구형 브라우저의 XSS 필터 활성화

### 4. Referrer-Policy: strict-origin-when-cross-origin
- 다른 도메인으로 요청 시 전체 URL 대신 origin만 전송
- 민감한 정보 유출 방지

### 5. Strict-Transport-Security
- HTTPS 강제 사용
- 중간자 공격(MITM) 방지

### 6. Content-Security-Policy (API용)
- API 응답에 대한 엄격한 CSP 정책
- 기본적으로 모든 리소스 차단

### 7. Permissions-Policy
- 브라우저 기능 접근 제한
- 카메라, 마이크, 위치정보 등 차단

## API 보안

### 요청 검증
1. **Content-Type 검증**: POST 요청 시 `application/json` 필수
2. **메소드 제한**: 각 엔드포인트별 허용 메소드 명시
3. **Rate Limiting**: IP 기반 요청 제한
4. **입력 검증**: 모든 사용자 입력 sanitize

### Rate Limiting 설정
- 기본값: 15분당 10회 요청
- IP별 추적
- 초과 시 429 상태 코드와 재시도 시간 반환

## 구현 가이드

### 1. 로컬 개발 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local

# 환경 변수 설정
NODE_ENV=development
GEMINI_API_KEY=your_api_key_here
```

### 2. Vercel 배포 설정

Vercel 대시보드에서 환경 변수 설정:
- `NODE_ENV`: production
- `GEMINI_API_KEY`: 실제 API 키
- 기타 필요한 환경 변수

### 3. 커스텀 도메인 추가

추가 도메인을 허용하려면:

1. `api/cors-config.js`의 `getAllowedOrigins` 함수 수정
2. 또는 환경 변수 `ADDITIONAL_ALLOWED_ORIGINS` 사용 (구현 필요)

```javascript
// 예시
const customOrigins = process.env.ADDITIONAL_ALLOWED_ORIGINS?.split(',') || [];
allowedOrigins.push(...customOrigins);
```

## 테스트

### CORS 동작 확인

```bash
# 허용된 도메인에서 요청
curl -H "Origin: https://doha.kr" \
     -H "Content-Type: application/json" \
     -X POST \
     https://doha.kr/api/fortune \
     -d '{"type":"daily","data":{"name":"테스트"}}'

# 허용되지 않은 도메인에서 요청 (CORS 에러 발생)
curl -H "Origin: https://malicious-site.com" \
     -H "Content-Type: application/json" \
     -X POST \
     https://doha.kr/api/fortune \
     -d '{"type":"daily","data":{"name":"테스트"}}'
```

### 보안 헤더 확인

```bash
# 응답 헤더 확인
curl -I https://doha.kr

# 예상 출력:
# X-Content-Type-Options: nosniff
# X-Frame-Options: SAMEORIGIN
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
# ...
```

## 문제 해결

### CORS 에러 발생 시

1. 브라우저 개발자 도구에서 실제 origin 확인
2. `cors-config.js`의 허용 도메인 목록 확인
3. 프로토콜(http/https) 일치 여부 확인
4. 포트 번호 포함 여부 확인

### 로컬 개발 시 CORS 문제

1. `NODE_ENV=development` 설정 확인
2. localhost와 127.0.0.1 모두 시도
3. 정확한 포트 번호 사용

## 보안 모범 사례

1. **최소 권한 원칙**: 필요한 도메인만 허용
2. **환경 분리**: 개발/스테이징/프로덕션 환경 구분
3. **정기적 검토**: 허용 도메인 목록 주기적 검토
4. **로깅 및 모니터링**: 비정상적인 요청 패턴 감지
5. **보안 업데이트**: 의존성 정기적 업데이트

## 참고 자료

- [MDN CORS 문서](https://developer.mozilla.org/ko/docs/Web/HTTP/CORS)
- [OWASP 보안 헤더](https://owasp.org/www-project-secure-headers/)
- [Vercel 보안 헤더 가이드](https://vercel.com/docs/concepts/functions/serverless-functions/edge-middleware/security-headers)