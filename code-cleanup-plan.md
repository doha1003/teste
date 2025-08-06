# doha.kr 코드 정리 및 최적화 계획

## 현재 상황 분석

### CSS 파일 현황
- **총 CSS 파일**: 120+ 개
- **압축 파일**: 79개 (.min.css)
- **번들 파일**: 11개 (dist 폴더)
- **!important 사용**: 40개 파일에서 104회
- **중복 선택자**: fade-in 등 14개 파일에서 중복

### JavaScript 파일 현황
- **총 JS 파일**: 80+ 개
- **대용량 파일**: main.js (931줄), mbti-test-data.js (1291줄)
- **모듈 시스템**: ES6 import/export와 전역 변수 혼재
- **중복 함수**: 유틸리티 함수들이 여러 파일에 분산

### 파일 크기 현황
- **styles.css**: 554KB (압축 전)
- **styles.min.css**: 381KB (압축 후)
- **중복 번들**: 11개 버전이 존재

## 정리 및 최적화 계획

### 1단계: 불필요한 파일 정리

#### 제거 대상 파일 (79개)
```bash
# CSS 압축 파일들 (원본이 있으므로 제거 가능)
css/**/*.min.css

# 중복 번들 파일들 (최신 버전만 유지)
dist/styles.final.css
dist/styles.optimized.css
dist/styles.phase7.css
dist/styles.ultra.css
```

#### 보관할 파일
```bash
# 개발용
css/main.css
dist/styles.css

# 프로덕션용
dist/styles.min.css
```

### 2단계: CSS 최적화

#### A. !important 제거 (104개 → 10개 이하 목표)
- 대부분의 !important는 CSS 선택자 우선순위 재구성으로 해결 가능
- 진짜 필요한 것만 유지 (유틸리티 클래스, 오버라이드 등)

#### B. 중복 선택자 통합
```css
/* 현재: 14개 파일에 분산 */
.fade-in { ... }

/* 개선: 하나의 파일로 통합 */
/* css/components/animations.css */
.fade-in { ... }
```

#### C. 미디어쿼리 통합
```css
/* 현재: 파일별로 분산된 미디어쿼리 */
@media (max-width: 768px) { ... }

/* 개선: 미디어쿼리별로 그룹화 */
@media (max-width: 768px) {
  /* 모든 모바일 스타일 */
}
```

### 3단계: JavaScript 최적화

#### A. 중복 함수 제거
```javascript
// 현재: 여러 파일에 분산
function formatDate() { ... }
function throttle() { ... }
function debounce() { ... }

// 개선: utils 모듈로 통합
// js/utils/common-utils.js
export { formatDate, throttle, debounce };
```

#### B. ES6+ 현대화
```javascript
// 현재: ES5/ES6 혼재
var self = this;
function() { ... }

// 개선: ES6+ 통일
const self = this;
() => { ... }
```

#### C. 모듈 의존성 정리
```javascript
// 현재: 전역 변수 의존
window.DohaApp = { ... }

// 개선: 명시적 import/export
import { DohaApp } from './core/app.js';
export default DohaApp;
```

### 4단계: 성능 최적화

#### A. 번들 크기 감소
- **현재**: 554KB → **목표**: 400KB 이하 (28% 감소)
- Critical CSS 분리로 초기 로딩 최적화
- 사용하지 않는 CSS 제거

#### B. 로딩 순서 최적화
```html
<!-- 현재: 모든 CSS 동시 로딩 -->
<link rel="stylesheet" href="styles.css">

<!-- 개선: Critical CSS 인라인 + 지연 로딩 -->
<style>/* Critical CSS */</style>
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

#### C. 지연 로딩 적용
```javascript
// 필수 기능만 초기 로딩
import('./core/essential.js');

// 선택적 기능은 필요 시 로딩
const loadAdvancedFeatures = () => import('./features/advanced.js');
```

## 예상 효과

### 파일 개수 감소
- **CSS**: 120+ → 60개 (50% 감소)
- **JS**: 80+ → 50개 (37% 감소)

### 번들 크기 감소
- **개발용**: 554KB → 400KB (28% 감소)
- **프로덕션**: 381KB → 280KB (27% 감소)

### 성능 개선
- **초기 로딩**: ~40% 개선 (Critical CSS 분리)
- **캐시 효율성**: ~60% 개선 (파일 수 감소)
- **유지보수성**: ~70% 개선 (중복 제거)

### 코드 품질 개선
- **!important 사용**: 104개 → 10개 이하 (90% 감소)
- **중복 코드**: ~80% 감소
- **ES6+ 적용**: 100% 현대화

## 실행 우선순위

### 높음 (즉시 실행)
1. 중복 .min.css 파일 79개 제거
2. 중복 번들 파일 7개 제거
3. !important 남용 해결 (104개 → 20개)

### 중간 (2-3일 내)
4. JavaScript 중복 함수 통합
5. ES6+ 문법 현대화
6. 모듈 의존성 정리

### 낮음 (1주일 내)
7. Critical CSS 분리
8. 지연 로딩 구현
9. 성능 모니터링 설정

## 백업 및 안전성

### 백업 전략
- Git 브랜치로 원본 보존
- 단계별 커밋으로 롤백 가능
- 테스트 자동화로 품질 보장

### 호환성 보장
- 기존 HTML 파일 수정 없이 진행
- 전역 함수 유지로 하위 호환성 보장
- 점진적 마이그레이션

## 구현 일정

- **1일차**: 불필요한 파일 제거 (79개 파일)
- **2일차**: CSS 최적화 (!important 해결)
- **3일차**: JavaScript 현대화
- **4일차**: 성능 최적화
- **5일차**: 테스트 및 검증

이 계획을 통해 코드베이스를 30% 이상 경량화하고 유지보수성을 크게 개선할 수 있습니다.