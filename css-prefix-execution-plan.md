# CSS Prefix Migration Execution Plan

Generated: 2025. 8. 10. 오후 1:42:24

이 문서는 doha.kr 프로젝트의 CSS 클래스 접두사 마이그레이션을 단계별로 안전하게 수행하기 위한 실행 계획입니다.

## 📊 전체 개요

- 총 3단계로 구성
- 위험도별 점진적 적용
- 각 단계별 백업 및 롤백 지원
- 예상 총 소요시간: 3-4시간 (테스트 포함)

## 1단계: 저위험 유틸리티 클래스

**설명:** 사용 빈도가 낮고 충돌 위험이 적은 유틸리티 클래스들

**위험도:** low
**예상 소요시간:** 30분
**롤백 복잡도:** low

### 변경 대상 클래스 (6개)

- `loading` → `dh-u-loading`
- `hidden` → `dh-u-hidden`
- `visible` → `dh-u-visible`
- `text-center` → `dh-u-text-center`
- `text-left` → `dh-u-text-left`
- `text-right` → `dh-u-text-right`

### 실행 명령어
```bash
node tools/css-prefix-execution-plan.cjs --phase1
```

### 테스트 체크리스트
- [ ] 페이지 로딩 정상 확인
- [ ] 스타일 적용 정상 확인
- [ ] JavaScript 동작 정상 확인

### 롤백 명령어 (문제 발생 시)
```bash
node tools/css-prefix-execution-plan.cjs --rollback phase1
```

---

## 2단계: 레이아웃 기본 클래스

**설명:** 페이지 구조를 담당하는 기본 레이아웃 클래스들

**위험도:** medium
**예상 소요시간:** 45분
**롤백 복잡도:** medium

### 변경 대상 클래스 (7개)

- `wrapper` → `dh-l-wrapper`
- `section` → `dh-l-section`
- `grid` → `dh-l-grid`
- `flex` → `dh-l-flex`
- `grid-2` → `dh-l-grid-2`
- `grid-3` → `dh-l-grid-3`
- `grid-4` → `dh-l-grid-4`

### 실행 명령어
```bash
node tools/css-prefix-execution-plan.cjs --phase2
```

### 테스트 체크리스트
- [ ] 페이지 로딩 정상 확인
- [ ] 스타일 적용 정상 확인
- [ ] JavaScript 동작 정상 확인

### 롤백 명령어 (문제 발생 시)
```bash
node tools/css-prefix-execution-plan.cjs --rollback phase2
```

---

## 3단계: 핵심 컴포넌트 클래스

**설명:** 높은 사용 빈도와 JavaScript 결합이 있는 핵심 클래스들

**위험도:** high
**예상 소요시간:** 90분
**롤백 복잡도:** high

### 변경 대상 클래스 (10개)

- `header` → `dh-l-header`
- `footer` → `dh-l-footer`
- `main` → `dh-l-main`
- `content` → `dh-l-content`
- `btn` → `dh-c-btn`
- `button` → `dh-c-button`
- `card` → `dh-c-card`
- `modal` → `dh-c-modal`
- `active` → `dh-state-active`
- `disabled` → `dh-state-disabled`

### 실행 명령어
```bash
node tools/css-prefix-execution-plan.cjs --phase3
```

### 테스트 체크리스트
- [ ] 페이지 로딩 정상 확인
- [ ] 스타일 적용 정상 확인
- [ ] JavaScript 동작 정상 확인
- [ ] 인터랙션 기능 테스트
- [ ] 모바일 반응형 테스트
- [ ] 다양한 브라우저 테스트

### 롤백 명령어 (문제 발생 시)
```bash
node tools/css-prefix-execution-plan.cjs --rollback phase3
```

---

## 🔄 권장 워크플로우

### 사전 준비
1. 현재 사이트가 정상 동작하는지 확인
2. Git에 모든 변경사항 커밋
3. 검증 도구로 충돌 여부 재확인

```bash
# 사전 검증
node tools/css-prefix-validation.cjs --validate

# 실행 계획 확인
node tools/css-prefix-execution-plan.cjs --plan
```

### 단계별 실행

#### 1단계: 1단계: 저위험 유틸리티 클래스

```bash
# phase1 실행
node tools/css-prefix-execution-plan.cjs --phase1

# 기능 테스트 수행
# 문제없으면 다음 단계 진행
# 문제 있으면 롤백
node tools/css-prefix-execution-plan.cjs --rollback phase1
```

#### 2단계: 2단계: 레이아웃 기본 클래스

```bash
# phase2 실행
node tools/css-prefix-execution-plan.cjs --phase2

# 기능 테스트 수행
# 문제없으면 다음 단계 진행
# 문제 있으면 롤백
node tools/css-prefix-execution-plan.cjs --rollback phase2
```

#### 3단계: 3단계: 핵심 컴포넌트 클래스

```bash
# phase3 실행
node tools/css-prefix-execution-plan.cjs --phase3

# 기능 테스트 수행
# 문제없으면 다음 단계 진행
# 문제 있으면 롤백
node tools/css-prefix-execution-plan.cjs --rollback phase3
```

### 완료 후 검증

```bash
# 전체 기능 테스트
node test-doha-errors.js

# 성능 테스트
npm run test

# 상태 확인
node tools/css-prefix-execution-plan.cjs --status
```

