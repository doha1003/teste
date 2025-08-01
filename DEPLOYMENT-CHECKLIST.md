# 🚀 doha.kr 최종 배포 체크리스트

## 📅 배포 날짜: 2025-08-01

## ✅ 프리플라이트 체크 (Pre-flight Check)

### 1. 빌드 시스템 ✅
- [x] CSS 빌드 성공 (52개 파일 → 1개 번들)
- [x] JavaScript 빌드 성공 (모든 파싱 오류 해결)
- [x] 이미지 최적화 완료
- [x] PWA 파일 준비 완료

### 2. 코드 품질 ✅
- [x] ESLint 오류 0개
- [x] Prettier 포맷팅 완료
- [x] TypeScript 컴파일 성공
- [x] 모든 console.log 제거

### 3. 테스트 통과 ✅
- [x] 단위 테스트 통과
- [x] 통합 테스트 통과
- [x] E2E 테스트 통과
- [x] 브라우저 호환성 확인

### 4. 성능 최적화 ✅
- [x] Lighthouse 점수 90+ 달성
- [x] 번들 크기 최적화
- [x] 이미지 지연 로딩 구현
- [x] Critical CSS 인라인화

### 5. 보안 설정 ✅
- [x] CSP 헤더 구성
- [x] HTTPS 강제 적용
- [x] 환경 변수 보호
- [x] API 키 암호화

## 🔧 환경 설정

### Vercel 환경 변수 (확인 필요)
```
GEMINI_API_KEY=***
ANALYTICS_ID=***
NODE_ENV=production
```

### GitHub Secrets (확인 필요)
```
VERCEL_TOKEN=***
ORG_ID=***
PROJECT_ID=***
```

## 📋 배포 절차

### 1단계: 로컬 검증
```bash
# 빌드 테스트
npm run build

# 로컬 서버 실행
npm run serve

# 브라우저에서 확인
# http://localhost:3000
```

### 2단계: Git 커밋
```bash
# 변경사항 스테이징
git add .

# 커밋 메시지
git commit -m "🚀 Production deployment - Linear Design v2.0"

# 메인 브랜치로 푸시
git push origin main
```

### 3단계: 배포 모니터링
1. GitHub Actions 워크플로우 확인
2. Vercel 배포 로그 확인
3. 프로덕션 사이트 테스트

## 🔍 배포 후 검증

### 필수 확인 사항
- [ ] 메인 페이지 로딩 (https://doha.kr)
- [ ] API 엔드포인트 동작 (/api/health)
- [ ] PWA 설치 가능
- [ ] 한글 폰트 렌더링
- [ ] 모바일 반응형 디자인
- [ ] 운세 서비스 동작
- [ ] 테스트 기능 동작
- [ ] 도구 기능 동작

### 성능 확인
- [ ] TTFB < 600ms
- [ ] FCP < 1.8s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1

### SEO 확인
- [ ] robots.txt 접근 가능
- [ ] sitemap.xml 접근 가능
- [ ] 메타 태그 정상 렌더링
- [ ] Open Graph 태그 확인

## 🚨 롤백 계획

만약 문제 발생 시:
```bash
# 이전 커밋으로 롤백
git revert HEAD
git push origin main

# Vercel에서 이전 배포로 롤백
# Vercel Dashboard > Deployments > Rollback
```

## 📊 모니터링

### 실시간 모니터링
- Vercel Analytics: https://vercel.com/[team]/doha-kr/analytics
- Google Analytics: 실시간 보고서 확인
- 에러 로그: /api/logs 엔드포인트

### 알림 설정
- [ ] Vercel 배포 알림 활성화
- [ ] GitHub Actions 실패 알림
- [ ] 다운타임 모니터링 설정

## 📝 배포 완료 후 작업

1. [ ] 배포 성공 공지
2. [ ] 모니터링 대시보드 확인 (24시간)
3. [ ] 사용자 피드백 수집
4. [ ] 성능 리포트 작성
5. [ ] 다음 스프린트 계획

## ⚡ 빠른 참조

### 주요 URL
- 프로덕션: https://doha.kr
- API 헬스체크: https://doha.kr/api/health
- Vercel 대시보드: https://vercel.com/dashboard
- GitHub Actions: https://github.com/[username]/doha-kr/actions

### 긴급 연락처
- 개발팀 리드: [연락처]
- DevOps 엔지니어: [연락처]
- 프로젝트 매니저: [연락처]

---

## ✅ 최종 승인

- [ ] 개발팀 리드 승인
- [ ] QA 팀 승인
- [ ] 프로젝트 매니저 승인
- [ ] 배포 실행

**배포 담당자**: _______________
**배포 시간**: _______________
**서명**: _______________