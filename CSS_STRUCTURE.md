# doha.kr CSS 구조 (2025-01-14 업데이트)

## 📁 현재 CSS 파일 구조

```
/css/
├── styles.css (92KB) - 통합된 메인 CSS 파일 ✅
├── base.css (4KB) - 기본 스타일 (현재 미사용)
├── components.css (8KB) - 컴포넌트 스타일 (현재 미사용)
├── variables.css (4.5KB) - CSS 변수 (현재 미사용)
└── pages/
    ├── about.css - About 페이지 전용
    ├── bmi-calculator.css - BMI 계산기 전용
    ├── contact.css - Contact 페이지 전용
    ├── fortune-main.css - 운세 메인 페이지 전용
    ├── legal.css - 법적 고지 페이지 전용
    ├── love-dna-test.css - Love DNA 테스트 전용
    ├── mbti-intro.css - MBTI 소개 페이지 전용
    ├── mbti-test.css - MBTI 테스트 전용
    ├── salary-calculator.css - 연봉 계산기 전용
    ├── teto-egen-intro.css - 테토-에겐 소개 페이지 전용
    ├── teto-egen-test.css - 테토-에겐 테스트 전용
    └── text-counter.css - 글자수 세기 전용
```

## 🎯 통합 완료 사항

### ✅ 완료된 작업
1. **CSS 파일 통합**
   - `main.css` (89KB) + `styles.css` (92KB) → `styles.css` (92KB)로 통합
   - 중복 제거 및 Stats Section 포함된 완전한 버전 사용
   - 모든 HTML 파일이 `styles.css` 하나만 참조하도록 수정

2. **404 오류 해결**
   - `mobile-fixes.css` import 문 제거
   - 존재하지 않는 파일 참조 제거

3. **파일 정리**
   - `main.css` 삭제
   - 백업 파일들 삭제
   - 깔끔한 구조 유지

## 📊 CSS 사용 현황

### 메인 CSS
- **파일**: `/css/styles.css`
- **크기**: 92KB
- **사용**: 모든 HTML 페이지 (28개+)
- **내용**: 
  - CSS 변수 정의
  - 기본 리셋 및 타이포그래피
  - 레이아웃 (navbar, footer)
  - 컴포넌트 (buttons, cards, forms)
  - 섹션별 스타일 (hero, features, stats)
  - 반응형 미디어 쿼리

### 페이지별 CSS
- **위치**: `/css/pages/`
- **사용**: 각 페이지에서 추가로 로드
- **특징**: 페이지 고유의 스타일만 포함

## 🚀 향후 최적화 방안

### Phase 1: CSS 모듈화
```css
/* styles.css를 다음과 같이 분리 */
@import url('/css/core/variables.css');
@import url('/css/core/reset.css');
@import url('/css/core/typography.css');
@import url('/css/layout/navbar.css');
@import url('/css/layout/footer.css');
@import url('/css/components/buttons.css');
@import url('/css/components/cards.css');
@import url('/css/components/forms.css');
```

### Phase 2: 성능 최적화
1. Critical CSS 인라인화
2. 페이지별 CSS 번들링
3. 사용하지 않는 CSS 제거 (PurgeCSS)
4. CSS 압축 (minification)

### Phase 3: 현대적 CSS 구조
1. CSS Custom Properties 활용 확대
2. CSS Grid/Flexbox 최적화
3. CSS-in-JS 고려 (필요시)
4. PostCSS 도입 검토

## 📋 현재 상태 요약
- ✅ 하나의 통합된 메인 CSS 파일 (`styles.css`)
- ✅ 페이지별 CSS 분리 유지
- ✅ 404 오류 없음
- ✅ 모든 페이지에서 일관된 스타일 적용
- ⚠️ 92KB로 다소 큰 파일 크기 (최적화 필요)
- ⚠️ 인라인 스타일 정리 필요 (17개 파일)