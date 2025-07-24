# CSS 의존성 상세 분석 보고서

생성일: 2025-07-24T11:00:55.643067

## 1. 전체 요약

- **분석된 HTML 파일**: 36개
- **버전이 포함된 CSS 참조**: 32개
- **영향받는 HTML 파일**: 28개
- **분석된 CSS 파일**: 28개

## 2. 주요 문제: 버전이 포함된 CSS 참조

대부분의 HTML 파일이 CSS 파일을 참조할 때 버전 쿼리 스트링을 포함하고 있습니다.
예: `/css/styles.css?v=1753150228`

### 영향받는 파일 목록:

#### 404.html
- `/css/styles.css?v=1753150228`
- `/css/styles.css?v=1753150228`

#### about\index-enhanced.html
- `/css/styles.css?v=1753283465`

#### about\index.html
- `/css/styles.css?v=1753150228`

#### contact\index.html
- `/css/styles.css?v=1753150228`

#### faq\index.html
- `/css/styles.css?v=1753150228`

#### fortune\daily\index.html
- `/css/styles.css?v=1753150228`

#### fortune\index.html
- `/css/styles.css?v=1753150228`

#### fortune\saju\index.html
- `/css/styles.css?v=1753150228`

#### fortune\tarot\index.html
- `/css/styles.css?v=1753150228`

#### fortune\zodiac-animal\index.html
- `/css/styles.css?v=1753150228`

#### fortune\zodiac\index.html
- `/css/styles.css?v=1753150228`

#### index.html
- `/css/styles.css?v=1753150228`
- `/css/styles.css?v=1753150228`

#### offline.html
- `/css/styles.css?v=1753150228`
- `/css/styles.css?v=1753150228`

#### privacy\index.html
- `/css/styles.css?v=1753150228`

#### problematic_section.html
- `/css/styles.css?v=1753283465`
- `/css/styles.css?v=1753283465`

#### terms\index.html
- `/css/styles.css?v=1753150228`

#### tests\index.html
- `/css/styles.css?v=1753150228`

#### tests\love-dna\index.html
- `/css/styles.css?v=1753150228`

#### tests\love-dna\test.html
- `/css/styles.css?v=1753150228`

#### tests\mbti\index.html
- `/css/styles.css?v=1753150228`

... 외 8개 파일


## 3. 특정 페이지별 CSS 분석

### tests/mbti/index.html
- CSS 링크 수: 2
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 2개

### tests/mbti/test.html
- CSS 링크 수: 2
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 14개

### tests/teto-egen/index.html
- CSS 링크 수: 2
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 14개

### tests/teto-egen/test.html
- CSS 링크 수: 4
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 14개

### tests/love-dna/index.html
- CSS 링크 수: 2
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 3개

### tests/love-dna/test.html
- CSS 링크 수: 2
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 5개

### fortune/index.html
- CSS 링크 수: 2
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 3개

### fortune/saju/index.html
- CSS 링크 수: 2
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 7개

### fortune/tarot/index.html
- CSS 링크 수: 2
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 8개

### fortune/zodiac/index.html
- CSS 링크 수: 2
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 9개

### fortune/zodiac-animal/index.html
- CSS 링크 수: 3
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 5개

### fortune/daily/index.html
- CSS 링크 수: 3
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 13개

### tools/index.html
- CSS 링크 수: 3
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 18개

### tools/bmi-calculator.html
- CSS 링크 수: 2
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 5개

### tools/salary-calculator.html
- CSS 링크 수: 2
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 3개

### tools/text-counter.html
- CSS 링크 수: 2
- 버전 포함 CSS: 1개
- 인라인 스타일 태그: 0개
- 인라인 스타일 속성: 7개

## 4. CSS 클래스 위치

주요 클래스들이 정의된 파일:

### .btn
- css\button-system.css
- css\mobile-fixes.css
- css\styles.css
- css\pages\404.css
- css\pages\fortune-common.css

### .btn-primary
- css\button-system.css
- css\styles.css
- css\pages\404.css
- css\pages\fortune-common.css

### .btn-secondary
- css\button-system.css
- css\styles.css
- css\pages\404.css

### .calculate-btn
- css\pages\salary-calculator.css

### .card
- css\layout-fixes.css
- css\styles.css

### .fortune-card
- css\pages\fortune-main.css
- css\pages\fortune-styles.css

### .fortune-grid
- css\pages\fortune-main.css
- css\pages\fortune-styles.css

### .test-start-btn
- css\pages\mbti-intro.css
- css\pages\teto-egen-intro.css

### .zodiac-card
- css\pages\fortune.css
- css\pages\zodiac.css

## 5. 해결 방안

### 즉시 적용 가능한 수정

1. **버전 쿼리 스트링 제거**
   ```python
   # 모든 HTML 파일에서 ?v=숫자 패턴 제거
   content = re.sub(r'(\.css)\?v=\d+', r'\1', content)
   ```

2. **수정 스크립트 실행**
   ```bash
   python fix_css_versions.py
   ```

### 장기적 개선 사항

1. **빌드 시스템 도입**
   - Webpack, Vite 등을 사용한 자동 버전 관리
   - CSS 번들링 및 최적화

2. **캐시 버스팅 전략**
   - 파일명에 해시 포함 (예: styles.abc123.css)
   - 서비스워커를 통한 캐시 관리

3. **CSS 구조 개선**
   - 중복 클래스 정의 통합
   - 모듈별 CSS 분리 유지
   - Critical CSS 인라인화

## 6. 중복 클래스 정의

다음 클래스들이 여러 파일에 중복 정의되어 있습니다:

- **.btn**: 5개 파일에서 정의됨
  - css\button-system.css
  - css\mobile-fixes.css
  - css\styles.css
  - css\pages\404.css
  - css\pages\fortune-common.css

- **.btn-primary**: 4개 파일에서 정의됨
  - css\button-system.css
  - css\styles.css
  - css\pages\404.css
  - css\pages\fortune-common.css

- **.btn-secondary**: 3개 파일에서 정의됨
  - css\button-system.css
  - css\styles.css
  - css\pages\404.css

- **.card**: 2개 파일에서 정의됨
  - css\layout-fixes.css
  - css\styles.css

- **.fortune-card**: 2개 파일에서 정의됨
  - css\pages\fortune-main.css
  - css\pages\fortune-styles.css

- **.fortune-grid**: 2개 파일에서 정의됨
  - css\pages\fortune-main.css
  - css\pages\fortune-styles.css

- **.zodiac-card**: 2개 파일에서 정의됨
  - css\pages\fortune.css
  - css\pages\zodiac.css

- **.test-start-btn**: 2개 파일에서 정의됨
  - css\pages\mbti-intro.css
  - css\pages\teto-egen-intro.css


## 7. 권장 사항

1. **즉시 수정**: 버전 쿼리 스트링 제거로 CSS 로딩 문제 해결
2. **단기 개선**: 중복 클래스 정리 및 CSS 구조 최적화
3. **장기 계획**: 빌드 시스템 도입 및 자동화된 버전 관리
