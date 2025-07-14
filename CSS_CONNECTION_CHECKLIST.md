# doha.kr CSS 연결 관계 체크리스트

## 🔴 즉시 해결 완료
- [x] **mobile-fixes.css 404 오류** - main.css와 styles.css에서 import 문 제거 완료

## 🟡 주요 문제점

### 1. CSS 파일 중복 문제
- [ ] **main.css (89KB)** - 23개 페이지에서 사용
  - 404.html, about-enhanced.html, fortune 관련 페이지들
  - tests 관련 페이지들
  - offline.html 등

- [ ] **styles.css (92KB)** - 15개 페이지에서 사용  
  - index.html (메인 페이지)
  - about/, contact/, privacy/, terms/ 등 기본 페이지들
  - FAQ 페이지

**문제**: 두 파일이 거의 동일한 내용을 담고 있어 중복 관리

### 2. CSS 구조 문제
- [ ] base.css, components.css, variables.css가 직접 참조되지 않음
- [ ] 인라인 스타일 사용 페이지: 17개
- [ ] 페이지별 CSS는 잘 분리되어 있으나 메인 CSS와의 관계 불명확

## 📋 페이지별 CSS 사용 현황

### main.css 사용 페이지 (23개)
```
404.html
about-enhanced.html
community/index.html
fortune/*.html (모든 운세 페이지)
offline.html
tests/*.html (모든 테스트 페이지)
tools/*.html (도구 페이지들)
```

### styles.css 사용 페이지 (15개)
```
index.html (홈페이지)
about/index.html
contact/index.html
faq/index.html
privacy/index.html
terms/index.html
```

### 페이지별 전용 CSS
```
/css/pages/
├── about.css
├── bmi-calculator.css
├── contact.css
├── fortune-main.css
├── legal.css
├── love-dna-test.css
├── mbti-intro.css
├── mbti-test.css
├── salary-calculator.css
├── teto-egen-intro.css
├── teto-egen-test.css
└── text-counter.css
```

## ✅ 권장 해결 방안

### 1단계: CSS 통합
- [ ] main.css와 styles.css 내용 비교
- [ ] 중복 제거 후 하나의 파일로 통합
- [ ] 모든 HTML 파일에서 통합된 CSS 파일 참조하도록 수정

### 2단계: CSS 모듈화
- [ ] variables.css를 최상단에 import
- [ ] base.css로 기본 스타일 정의
- [ ] components.css로 공통 컴포넌트 관리
- [ ] 페이지별 CSS는 현재대로 유지

### 3단계: 인라인 스타일 정리
- [ ] 17개 페이지의 인라인 스타일 확인
- [ ] 공통 스타일은 CSS 파일로 이동
- [ ] 페이지 특화 스타일만 인라인 유지

## 🚀 추천 최종 구조
```
/css/
├── main.css (통합된 메인 CSS)
├── core/
│   ├── variables.css (CSS 변수)
│   ├── base.css (리셋, 기본 스타일)
│   └── components.css (버튼, 카드 등)
└── pages/ (페이지별 CSS 유지)
```

## 📊 예상 효과
- 404 오류 제거 ✓
- CSS 파일 크기 50% 감소 (중복 제거)
- 유지보수성 향상
- 페이지 로딩 속도 개선