
# CSS 클래스 접두사 매핑 가이드

## 변경된 클래스 매핑

### 레거시 클래스
- `.btn` → `.legacy-btn`
- `.card` → `.legacy-card`
- `.app` → `.legacy-app`
- `.container` → `.layout-container`
- `.wrapper` → `.layout-wrapper`

### 페이지별 클래스
- `.service-card` → `.home-service-card`
- `.test-card` → `.page-test-card`
- `.fortune-card` → `.page-fortune-card`
- `.tool-card` → `.page-tool-card`

### 기능별 클래스
- `.cta-button` → `.home-cta-button`
- `.share-btn` → `.feat-share-btn`
- `.btn-tools` → `.tool-btn`
- `.btn-fortune` → `.fortune-btn`

### 유지된 클래스 (Linear 시스템)
- `.linear-button`
- `.linear-card`
- `.linear-input`
- `.highlight-*`
- `.text-korean`

## 복구 방법
모든 파일은 `.backup` 확장자로 백업되어 있습니다.
문제 발생시 백업 파일을 원본으로 복구하세요.

생성일: 2025-08-10T04:18:18.076Z
