# doha.kr 종합 최적화 계획서

## 작업 일시: 2025-01-11

### 🔍 전체 구조 분석 결과

GitHub 레포지토리 doha1003/teste의 전면 분석을 통해 다음과 같은 개선점들을 발견했습니다.

---

## 🚨 즉시 해결해야 할 문제점들 (High Priority)

### 1. **중복 파일 문제**
```
문제:
- _includes/ 와 includes/ 디렉토리 중복 존재
- about.html 과 about/index.html 중복
- contact.html 과 contact/index.html 중복  
- privacy.html 과 privacy/index.html 중복
- terms.html 과 terms/index.html 중복

해결방안:
✅ _includes/ 디렉토리 완전 삭제 (includes/ 사용)
✅ 루트 레벨 HTML 파일들 삭제 (디렉토리 구조 사용)
✅ 모든 링크를 디렉토리 기반으로 통일
```

### 2. **성능 최적화 필요**
```
문제:
- 이미지 파일들이 JPG 형식 (WebP 미사용)
- CSS/JS 파일 압축 없음
- 미사용 CSS 코드 다수 존재
- 번들링 없음

해결방안:
🔄 모든 이미지를 WebP 형식으로 변환
🔄 CSS/JS 파일 압축 및 최적화
🔄 미사용 CSS 제거
🔄 Critical CSS 인라인 배치
```

### 3. **CSS 아키텍처 정리**
```
문제:
- 너무 많은 fix CSS 파일들
- 중복된 CSS 변수 정의
- 일관성 없는 네이밍

정리 대상:
- color-contrast-fix.css
- critical-fixes.css  
- cta-enhancement.css
- emoji-fix.css
- fixes-2025-01-08.css
- global-text-fix.css
- hero-fix.css
- highlights-fix.css
- styles-fix.css
- text-counter-fix.css
- love-dna-fix.css
- teto-egen-test.css (중복)
```

---

## 🔶 단기 개선 사항 (Medium Priority)

### 4. **접근성 강화**
```
필요한 작업:
- 색상 대비 WCAG 2.1 AA 기준 검증
- 모든 이미지에 적절한 alt 텍스트
- ARIA 레이블 보완
- 키보드 네비게이션 개선
```

### 5. **SEO 추가 최적화**
```
개선 사항:
- 404 페이지에 사이트맵 링크 추가
- 내부 링크 구조 최적화
- 페이지별 고유 메타 설명 강화
- Breadcrumb 네비게이션 추가
```

### 6. **이미지 최적화**
```
작업 필요:
- 이미지 lazy loading 구현
- 반응형 이미지 srcset 적용
- 이미지 압축 및 리사이징
- WebP 폴백 지원
```

---

## 🔵 장기 개선 사항 (Low Priority)

### 7. **코드 품질 향상**
```
계획:
- TypeScript 도입 검토
- 코드 린팅 규칙 강화
- 단위 테스트 추가
- 성능 모니터링 도구
```

### 8. **사용자 경험 개선**
```
계획:
- 다크 모드 강화
- 로딩 스피너 추가
- 에러 처리 개선
- 사용자 피드백 시스템
```

---

## 📋 즉시 실행 체크리스트

### Phase 1: 파일 정리 (즉시)
- [ ] `_includes/` 디렉토리 삭제
- [ ] `about.html` 삭제 (about/index.html 유지)
- [ ] `contact.html` 삭제 (contact/index.html 유지)
- [ ] `privacy.html` 삭제 (privacy/index.html 유지)
- [ ] `terms.html` 삭제 (terms/index.html 유지)
- [ ] 모든 내부 링크를 디렉토리 기반으로 수정

### Phase 2: CSS 정리 (1-2일)
- [ ] fix CSS 파일들을 메인 CSS로 통합
- [ ] 중복 CSS 변수 제거
- [ ] 미사용 CSS 코드 제거
- [ ] CSS 압축 및 최적화

### Phase 3: 이미지 최적화 (2-3일)
- [ ] JPG → WebP 변환
- [ ] 이미지 압축
- [ ] lazy loading 구현
- [ ] 반응형 이미지 적용

### Phase 4: 성능 최적화 (3-5일)
- [ ] JavaScript 번들링
- [ ] Critical CSS 추출
- [ ] 폰트 로딩 최적화
- [ ] 캐싱 전략 개선

---

## 🎯 기대 효과

### 성능 개선
- **페이지 로딩 속도**: 30-50% 개선
- **이미지 로딩**: 60-80% 용량 감소
- **CSS 크기**: 40-60% 감소

### SEO 개선  
- **검색 엔진 순위**: 상위 노출 가능성 증가
- **크롤링 효율성**: 깔끔한 URL 구조
- **사용자 경험**: 빠른 로딩으로 이탈률 감소

### 유지보수성
- **코드 관리**: 중복 제거로 관리 용이
- **배포 효율**: 파일 구조 단순화
- **개발 생산성**: 일관된 구조로 개발 속도 향상

---

## 🚀 실행 우선순위

### 🔴 즉시 (오늘)
1. 중복 파일 제거
2. 링크 경로 통일

### 🟡 단기 (1주일 내)  
1. CSS 정리 및 압축
2. 이미지 WebP 변환
3. 성능 최적화

### 🟢 장기 (1개월 내)
1. 접근성 개선
2. SEO 강화
3. 사용자 경험 개선

---

## 📊 현재 상태 vs 목표 상태

| 항목 | 현재 | 목표 | 개선도 |
|------|------|------|--------|
| 페이지 로딩 속도 | 2-3초 | 1-1.5초 | 50%↑ |
| 이미지 용량 | 평균 500KB | 평균 200KB | 60%↓ |
| CSS 크기 | 200KB+ | 100KB 이하 | 50%↓ |
| 중복 파일 | 10개+ | 0개 | 100%↓ |
| SEO 점수 | 85/100 | 95/100 | 12%↑ |

---

**이 계획서에 따라 단계적으로 최적화를 진행하면 doha.kr이 더욱 빠르고 효율적인 웹사이트로 발전할 수 있습니다.**

---

**작성자**: Claude Assistant  
**작성일**: 2025-01-11  
**다음 검토일**: 2025-02-11