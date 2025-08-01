# 📚 doha.kr 배포 가이드

doha.kr 프로젝트의 완전한 배포 및 운영 가이드입니다.

## 🏗️ 배포 아키텍처

### 하이브리드 배포 전략
- **GitHub Pages**: 정적 사이트 호스팅 (HTML/CSS/JS)
- **Vercel**: API 엔드포인트 및 서버리스 함수
- **Custom Domain**: doha.kr (Cloudflare DNS)

### 배포 환경
- **Production**: `main` 브랜치 → 자동 배포
- **Preview**: PR 생성 시 → 자동 미리보기 배포
- **Development**: 로컬 개발환경

---

## 🚀 자동 배포 프로세스

### 1. GitHub Actions 워크플로우

#### 주요 배포 단계
```yaml
1. 변경사항 감지 (Path Filtering)
2. 빌드 및 최적화 (CSS/JS 번들링)
3. 품질 검증 (Lint, Format, Security)
4. 테스트 실행 (Unit, Integration, E2E)
5. 성능 검사 (Lighthouse)
6. 프로덕션 배포
7. 배포 후 검증
8. 모니터링 알림
```

#### 배포 트리거
- **자동**: `main` 브랜치 push
- **수동**: GitHub Actions 워크플로우 디스패치
- **미리보기**: Pull Request 생성/업데이트

### 2. 빌드 프로세스

#### CSS 번들링
```bash
npm run build:css
# 52개 CSS 파일 → 1개 압축 번들
# 28.7% 크기 감소, ~480ms 로딩 향상
```

#### JavaScript 최적화
```bash
npm run build:js
# ES6 모듈 번들링
# Tree shaking 및 압축
# 브라우저별 호환성 보장
```

#### PWA 빌드
```bash
npm run build:pwa
# 서비스 워커 생성
# 매니페스트 최적화
# 아이콘 생성 (여러 해상도)
```

---

## 🔧 환경 설정

### 필수 환경 변수

#### Vercel 환경 변수
```bash
# API 키
GEMINI_API_KEY=your_gemini_api_key

# 애널리틱스
ANALYTICS_ID=your_analytics_id

# 환경 구분
VERCEL_ENV=production
NODE_ENV=production
```

#### GitHub Secrets
```bash
# Vercel 배포용
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_vercel_org_id
PROJECT_ID=your_vercel_project_id

# GitHub Pages
GITHUB_TOKEN=자동_제공됨
```

### DNS 설정 (Cloudflare)

#### A Records
```
Type: A
Name: doha.kr
Value: 185.199.108.153
TTL: Auto

Type: A  
Name: doha.kr
Value: 185.199.109.153
TTL: Auto

Type: A
Name: doha.kr
Value: 185.199.110.153
TTL: Auto

Type: A
Name: doha.kr
Value: 185.199.111.153
TTL: Auto
```

#### CNAME Records
```
Type: CNAME
Name: www
Value: doha.kr
TTL: Auto

Type: CNAME
Name: api
Value: doha-kr-production.vercel.app
TTL: Auto
```

---

## 📊 모니터링 및 알림

### 실시간 모니터링

#### 자동 체크 (15분 간격)
- **업타임 모니터링**: 사이트 접근성 확인
- **성능 모니터링**: 응답 시간 측정 (3초 임계값)
- **보안 체크**: SSL 인증서, 보안 헤더 확인
- **API 기능 테스트**: Fortune, Manseryeok API 동작 확인

#### 알림 시스템
- **성공**: 자동으로 기존 이슈 닫기
- **실패**: GitHub Issue 자동 생성
- **긴급**: High-priority 라벨 자동 할당

### 성능 예산 (Lighthouse)

#### Core Web Vitals
```json
{
  "first-contentful-paint": "2000ms",
  "largest-contentful-paint": "3000ms", 
  "cumulative-layout-shift": "0.1",
  "total-blocking-time": "400ms"
}
```

#### 리소스 예산
- **JavaScript**: 200KB (tolerance: 50KB)
- **CSS**: 100KB (tolerance: 25KB)
- **Images**: 500KB (tolerance: 100KB)
- **Fonts**: 150KB (Pretendard Variable 포함)

---

## 🛡️ 보안 설정

### CSP (Content Security Policy)
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' 
  https://cdn.jsdelivr.net 
  https://www.google-analytics.com
  https://vitals.vercel-insights.com;
style-src 'self' 'unsafe-inline' 
  https://fonts.googleapis.com;
connect-src 'self' 
  https://generativelanguage.googleapis.com
  https://www.google-analytics.com;
```

### 보안 헤더
- **HSTS**: 31536000초 (1년)
- **X-Frame-Options**: SAMEORIGIN
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin

### API 보안
- **Rate Limiting**: 60 요청/분 per IP
- **CORS**: doha.kr 도메인만 허용
- **Input Validation**: 모든 사용자 입력 검증

---

## 🚨 장애 대응

### 1. 사이트 접근 불가

#### 즉시 확인사항
1. **DNS 상태**: Cloudflare 대시보드 확인
2. **GitHub Pages**: Repository Settings → Pages
3. **SSL 인증서**: 만료일 및 상태 확인

#### 복구 절차
```bash
# 1. DNS 플러시
dig doha.kr
nslookup doha.kr

# 2. GitHub Pages 재배포
git push --force-with-lease origin main

# 3. Vercel 상태 확인
vercel --version
vercel ls
```

### 2. API 응답 실패

#### 디버깅 단계
```bash
# Health Check
curl https://doha.kr/api/health

# Fortune API 테스트
curl -X POST https://doha.kr/api/fortune \
  -H "Content-Type: application/json" \
  -d '{"type":"daily","userData":{"name":"test"}}'

# Vercel 로그 확인
vercel logs doha-kr-production
```

#### 일반적인 해결책
1. **환경 변수 확인**: Vercel 대시보드
2. **API 키 갱신**: Gemini API 콘솔
3. **Rate Limit 초과**: IP 기반 제한 확인

### 3. 성능 문제

#### 성능 분석
```bash
# Lighthouse 감사
npm run lighthouse:audit

# 번들 크기 분석
npm run build:js:analyze

# 성능 모니터링
node analyze-performance-metrics.js
```

#### 최적화 방법
1. **이미지 압축**: WebP 형식 사용
2. **CSS/JS 번들링**: 불필요한 코드 제거
3. **CDN 최적화**: Cloudflare 캐시 설정
4. **Lazy Loading**: 이미지 지연 로딩

---

## 📋 배포 체크리스트

### Pre-deployment (배포 전)
- [ ] 코드 리뷰 완료
- [ ] 로컬 테스트 통과
- [ ] 린팅 오류 수정
- [ ] 보안 취약점 확인
- [ ] 성능 최적화 적용

### Deployment (배포 중)
- [ ] 자동 테스트 통과
- [ ] 빌드 성공 확인
- [ ] 배포 로그 모니터링
- [ ] 헬스체크 통과

### Post-deployment (배포 후)
- [ ] 사이트 접근성 확인
- [ ] 주요 기능 테스트
- [ ] 성능 지표 확인
- [ ] 에러 로그 모니터링
- [ ] 사용자 피드백 수집

---

## 🔄 롤백 절차

### 자동 롤백
GitHub Actions에서 배포 실패 시 자동으로 이전 버전으로 롤백됩니다.

### 수동 롤백
```bash
# 1. 이전 커밋 확인
git log --oneline -10

# 2. 롤백 커밋 생성
git revert <commit-hash>

# 3. 강제 배포
git push origin main
```

### Vercel 롤백
```bash
# 이전 배포로 롤백
vercel rollback doha-kr-production
```

---

## 📈 성능 최적화

### 한국어 최적화
- **폰트**: Pretendard Variable (가변 폰트)
- **텍스트**: `word-break: keep-all` 적용
- **인코딩**: UTF-8 강제 적용
- **언어**: `lang="ko"` 속성 설정

### 모바일 최적화
- **뷰포트**: 반응형 메타태그
- **터치**: 44px 이상 터치 영역
- **키보드**: 한글 입력 최적화
- **네트워크**: 느린 연결 대응

### PWA 최적화
- **오프라인**: 핵심 페이지 캐시
- **설치**: 설치 프롬프트 최적화
- **백그라운드**: 백그라운드 동기화
- **푸시**: 알림 시스템 (계획 중)

---

## 🛠️ 개발 환경 설정

### 로컬 개발
```bash
# 의존성 설치
npm install

# 개발 서버 시작 (정적 파일)
npm run serve

# Vercel 개발 서버 (API 포함)
npm run dev

# 빌드 및 테스트
npm run build
npm run test
```

### 테스트 환경
```bash
# 전체 테스트 스위트
npm run test:all

# E2E 테스트
npm run test:e2e

# 성능 테스트
npm run test:performance

# 접근성 테스트
npm run test:accessibility
```

---

## 📞 지원 및 문의

### 긴급 상황
1. **GitHub Issues**: 버그 리포트 및 기능 요청
2. **모니터링 알림**: 자동 이슈 생성
3. **개발팀 연락**: 운영진 직접 연락

### 정기 점검
- **주간**: 성능 및 보안 점검
- **월간**: 전체 시스템 감사
- **분기**: 아키텍처 리뷰

---

## 📚 관련 문서

- [API 문서](../api/README.md)
- [테스트 가이드](../tests/README.md)
- [보안 정책](./SECURITY.md)
- [성능 최적화](./PERFORMANCE.md)
- [Linear 디자인 시스템](../design-system/README.md)

---

*마지막 업데이트: 2025-07-31*
*작성자: DevOps Team*