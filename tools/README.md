# 🎨 CSS Prefix Migration Tools for doha.kr

doha.kr 프로젝트의 CSS 클래스에 체계적으로 접두사를 적용하기 위한 통합 도구 모음입니다.

## 📋 도구 개요

### 🎯 접두사 체계
```
dh-{category}-{component}
```

- **컴포넌트**: `dh-c-*` (btn, card, form 등)
- **레이아웃**: `dh-l-*` (container, grid, row 등)  
- **유틸리티**: `dh-u-*` (text-center, mt-4 등)
- **페이지**: `dh-p-*` (page-header, page-main 등)
- **테스트**: `dh-test-*` (test-card, test-button 등)
- **운세**: `dh-fortune-*` (fortune-card, fortune-result 등)
- **상태**: `dh-state-*` (active, disabled 등)

## 🛠️ 도구 목록

### 1. 마스터 컨트롤러 (`css-prefix-master.cjs`)
**모든 도구를 통합 관리하는 메인 도구**

```bash
# 대화형 메뉴 실행
node tools/css-prefix-master.cjs

# 설정 마법사
node tools/css-prefix-master.cjs --wizard

# 전체 스캔 및 분석
node tools/css-prefix-master.cjs --full-scan

# 가이드 모드 마이그레이션
node tools/css-prefix-master.cjs --guided-migration
```

**특징:**
- 🧙‍♂️ 설정 마법사로 프로젝트 맞춤 설정
- 📊 통합 분석 및 리포트 생성
- 🚀 가이드 모드로 안전한 마이그레이션
- 🎛️ 직관적인 대화형 인터페이스

### 2. 마이그레이션 도구 (`css-prefix-migration.cjs`)
**CSS 클래스 스캔 및 마이그레이션 계획 생성**

```bash
# 프로젝트 스캔만 실행
node tools/css-prefix-migration.cjs --scan

# 실제 마이그레이션 실행 (백업 포함)
node tools/css-prefix-migration.cjs --migrate

# 마이그레이션 리포트 생성
node tools/css-prefix-migration.cjs --report

# 백업에서 복원
node tools/css-prefix-migration.cjs --rollback
```

**주요 기능:**
- 📊 2,000+ 클래스 자동 분석
- 🗂️ 카테고리별 자동 분류
- 📋 상세 마이그레이션 리포트
- 💾 자동 백업 및 롤백

### 3. 검증 도구 (`css-prefix-validation.cjs`)
**마이그레이션 전 위험 요소 분석 및 검증**

```bash
# 전체 검증 실행
node tools/css-prefix-validation.cjs --validate

# 충돌 분석만 실행
node tools/css-prefix-validation.cjs --conflicts

# 변경사항 미리보기 생성
node tools/css-prefix-validation.cjs --preview
```

**검증 항목:**
- ⚠️ 네이밍 충돌 검출
- 🚨 고위험 클래스 식별 (93개)
- 🔗 CSS-JS 결합 클래스 분석
- 📊 프레임워크 유사성 검사

### 4. 실행 계획 도구 (`css-prefix-execution-plan.cjs`)
**단계별 안전한 마이그레이션 실행**

```bash
# 실행 계획 생성
node tools/css-prefix-execution-plan.cjs --plan

# 단계별 실행
node tools/css-prefix-execution-plan.cjs --phase1  # 저위험 (6개 클래스)
node tools/css-prefix-execution-plan.cjs --phase2  # 중간위험 (7개 클래스)  
node tools/css-prefix-execution-plan.cjs --phase3  # 고위험 (10개 클래스)

# 특정 단계 롤백
node tools/css-prefix-execution-plan.cjs --rollback phase1

# 현재 상태 확인
node tools/css-prefix-execution-plan.cjs --status
```

**단계별 계획:**
- 🟢 **1단계**: 유틸리티 클래스 (30분, 저위험)
- 🟡 **2단계**: 레이아웃 기본 클래스 (45분, 중간위험)
- 🔴 **3단계**: 핵심 컴포넌트 클래스 (90분, 고위험)

## 🚀 빠른 시작 가이드

### 1. 초기 설정 및 분석
```bash
# 1. 마스터 컨트롤러 실행
node tools/css-prefix-master.cjs --wizard

# 2. 전체 프로젝트 분석
node tools/css-prefix-master.cjs --full-scan
```

### 2. 검증 및 미리보기
```bash
# 검증 실행
node tools/css-prefix-validation.cjs --validate

# 미리보기 확인 (브라우저에서 열기)
node tools/css-prefix-validation.cjs --preview
```

### 3. 단계별 마이그레이션
```bash
# 실행 계획 확인
node tools/css-prefix-execution-plan.cjs --plan

# 1단계 실행 (가장 안전)
node tools/css-prefix-execution-plan.cjs --phase1

# 테스트 후 문제없으면 2단계 진행
node tools/css-prefix-execution-plan.cjs --phase2

# 테스트 후 문제없으면 3단계 진행
node tools/css-prefix-execution-plan.cjs --phase3
```

### 4. 문제 발생 시 롤백
```bash
# 특정 단계 롤백
node tools/css-prefix-execution-plan.cjs --rollback phase3

# 전체 롤백
node tools/css-prefix-migration.cjs --rollback
```

## 📊 프로젝트 현황

### 스캔 결과 (2025-08-10 기준)
- **총 발견 클래스**: 2,034개
- **CSS 파일**: 167개
- **HTML 파일**: 51개  
- **JavaScript 파일**: 104개

### 카테고리별 분포
- **컴포넌트**: 1,505개 (74%)
- **레이아웃**: 149개 (7%)
- **테스트**: 233개 (11%)
- **운세**: 109개 (5%)
- **상태**: 19개 (1%)
- **페이지**: 16개 (1%)
- **유틸리티**: 3개 (0.1%)

### 위험도 분석
- **충돌**: 0개 ✅
- **중요 클래스**: 93개 ⚠️
- **경고사항**: 289개 📋
- **전체 위험도**: 고위험 🚨

## ⚠️ 주의사항

### 마이그레이션 전 필수 작업
1. **백업 생성**: 모든 파일 백업 필수
2. **Git 커밋**: 현재 작업 상태 커밋
3. **기능 테스트**: 현재 사이트 정상 동작 확인
4. **검증 실행**: 충돌 및 위험 요소 확인

### 각 단계 완료 후 테스트 필수
- [ ] 페이지 로딩 정상 확인
- [ ] 스타일 적용 정상 확인  
- [ ] JavaScript 동작 정상 확인
- [ ] 인터랙션 기능 테스트 (3단계)
- [ ] 모바일 반응형 테스트 (3단계)

### 롤백 준비
- 각 단계마다 자동 백업 생성
- 문제 발생 시 즉시 롤백 가능
- 백업 파일 위치: `backups/css-prefix-*`

## 🎯 권장 마이그레이션 전략

### 보수적 접근 (안전 최우선)
```bash
# 1단계만 먼저 적용
node tools/css-prefix-execution-plan.cjs --phase1

# 충분한 테스트 후 2단계
# (1-2주 후)
node tools/css-prefix-execution-plan.cjs --phase2
```

### 균형 접근 (권장)
```bash
# 1, 2단계 연속 적용
node tools/css-prefix-master.cjs --guided-migration

# 3단계는 별도 계획으로 진행
```

### 적극적 접근 (빠른 완료)
```bash
# 전체 자동 진행 (위험 감수)
node tools/css-prefix-master.cjs --guided-migration
# -> 설정에서 "적극적" 선택 -> 자동 진행
```

## 📈 생성되는 리포트

### 1. 마이그레이션 리포트 (`migration-report.md`)
- 전체 마이그레이션 계획
- 카테고리별 상세 정보
- 파일별 영향도 분석

### 2. 검증 리포트 (`css-prefix-validation-report.md`)  
- 충돌 및 위험 요소 분석
- 중요 클래스 목록
- 권장사항 및 주의점

### 3. 실행 계획 (`css-prefix-execution-plan.md`)
- 단계별 실행 가이드  
- 테스트 체크리스트
- 롤백 절차

### 4. 미리보기 (`css-prefix-preview.html`)
- 시각적 변경사항 미리보기
- 브라우저에서 확인 가능

### 5. 설정 파일 (`css-prefix-config.json`)
- 프로젝트 맞춤 설정
- 위험 허용도 및 목표 설정

## 🆘 문제 해결

### 도구 실행 오류
```bash
# Node.js 버전 확인 (20.11.0 권장)
node --version

# 의존성 설치
npm install glob

# 권한 문제 시 관리자 모드 실행
```

### 백업 복원 실패
```bash
# 수동 백업 확인
ls backups/css-prefix-*

# Git으로 복원
git checkout -- .
git clean -fd
```

### 부분 마이그레이션 상태
```bash
# 현재 상태 확인
node tools/css-prefix-execution-plan.cjs --status

# 특정 단계만 롤백
node tools/css-prefix-execution-plan.cjs --rollback phase2
```

## 📞 지원 및 문의

마이그레이션 과정에서 문제가 발생하면:

1. **상태 확인**: `--status` 명령어로 현재 상황 파악
2. **로그 확인**: 콘솔 출력 및 리포트 파일 검토  
3. **롤백 실행**: 문제 발생 즉시 해당 단계 롤백
4. **백업 활용**: 자동 생성된 백업 파일 활용

---

**⚠️ 중요**: 이 도구들은 대규모 코드 변경을 수행합니다. 반드시 백업을 생성하고 테스트 환경에서 먼저 실행해보시기 바랍니다.

**🎯 목표**: doha.kr 프로젝트의 CSS 클래스 체계를 modernize하여 유지보수성과 확장성을 크게 향상시키는 것입니다.