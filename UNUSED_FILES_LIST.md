# 🗑️ 미사용 파일 목록

## JavaScript 파일 (22개)

### 1. 압축 파일 (.min.js) - 원본 사용 중
- `js/api-config.min.js`
- `js/main.min.js`
- `js/mbti-test.min.js`
- `js/saju-calculator.min.js`
- `js/gemini-api.min.js`
- `js/error-handler.min.js`
- `js/zodiac.min.js`
- `js/analytics.min.js`
- `js/tarot.min.js`
- `js/bundle.min.js`

### 2. 미사용 기능 파일
- `js/tarot.js` - 타로 기능 (HTML에서 미참조)
- `js/zodiac-animal.js` - 띠별 운세 (HTML에서 미참조)
- `js/mbti-test-enhanced.js` - 개선된 MBTI (원본 사용 중)
- `js/teto-egen-test.js` - 테토에겐 테스트 (HTML에서 미참조)
- `js/teto-egen-test-fix.js` - 테토에겐 수정본 (HTML에서 미참조)
- `js/lunar-calendar-loader.js` - 음력 달력 로더 (미사용)
- `js/performance-critical.js` - 성능 최적화 (미사용)
- `js/performance-optimizer.js` - 성능 최적화 (미사용)
- `js/analytics-dashboard.js` - 분석 대시보드 (미사용)
- `js/saju-calculator-enhanced.js` - 개선된 사주계산기 (원본 사용 중)
- `js/fortune.js` - 운세 기능 (HTML에서 미참조)
- `js/storage.js` - 저장소 관리 (미사용)
- `js/config.js` - 설정 파일 (미사용)
- `js/analytics.js` - 분석 기능 (미사용)
- `js/error-handler.js` - 에러 처리 (미사용)
- `js/zodiac.js` - 별자리 운세 (미사용)

### 3. 개발/테스트 파일
- `verify_all_fixes.js` - 검증 스크립트
- `final_site_verification_playwright.js` - Playwright 테스트
- `optimize-images.js` - 이미지 최적화 스크립트

## CSS 파일 (4개)
- `css/button-system.css` - button-system-cleaned.css 사용 중
- `css/styles.css` - styles-cleaned.css 사용 중
- `css/styles.min.css` - styles-cleaned.css 사용 중
- `css/pages/fortune-main.css` - 미사용

## HTML 파일 (2개)
- `problematic_section.html` - 임시/테스트 파일
- `about/index-enhanced.html` - 개선 버전 테스트 파일

## 디렉토리
- `empty_temp/` - 빈 임시 디렉토리
- `images/images_new/` - 중복 이미지 디렉토리

## 개발 관련 파일 (보관 권장)
- `development/` - 개발 도구 및 분석 스크립트
- `tests/` - 테스트 파일들
- `tools/` - 도구 스크립트
- 각종 .md, .json, .txt 문서 파일들

## 삭제 우선순위

### 1순위 (즉시 삭제 가능)
- 모든 .min.js 파일 (원본 사용 중)
- problematic_section.html
- empty_temp/ 디렉토리

### 2순위 (확인 후 삭제)
- 미사용 JS 파일들 (fortune.js, tarot.js 등)
- 중복 CSS 파일들
- images/images_new/ (중복 확인 후)

### 3순위 (보관 검토)
- development/ 디렉토리
- 검증/테스트 스크립트
- 문서 파일들

## 예상 절감 효과
- 약 30-40개 파일 제거
- 프로젝트 구조 단순화
- 유지보수성 향상