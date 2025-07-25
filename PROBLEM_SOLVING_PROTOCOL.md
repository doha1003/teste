# 🔧 문제 해결 표준 프로토콜

## 📋 체크리스트: 문제 발생 시 반드시 따를 절차

### 1단계: 문제 범위 파악 (5분)
```bash
# 전체 영향도 파악
□ 어떤 페이지들이 영향을 받는가?
□ 언제부터 문제가 시작되었는가?
□ 유사한 문제가 다른 곳에도 있는가?

# 빠른 스캔 실행
python comprehensive_site_check.py
```

### 2단계: 근본 원인 식별 (10분)
```bash
# 로그 및 콘솔 확인
□ 브라우저 개발자 도구 콘솔 에러
□ 네트워크 탭에서 실패한 요청
□ GitHub Actions 빌드 로그

# 최근 변경사항 검토
git log --oneline -10
git diff HEAD~1
```

### 3단계: 종합적 해결책 수립 (15분)
```bash
# 표준화된 솔루션 준비
□ 모든 영향받는 파일 리스트 작성
□ 일관된 수정 규칙 정의
□ 배포 후 검증 계획 수립

# 테스트 스크립트 준비
□ 수정 전 현재 상태 캡처
□ 수정 후 예상 결과 정의
```

### 4단계: 일괄 수정 실행 (20분)
```python
# 예시: CSP 문제 해결
def fix_problem_systematically():
    # 1. 모든 대상 파일 식별
    affected_files = find_all_affected_files()
    
    # 2. 표준 솔루션 적용
    for file in affected_files:
        apply_standard_fix(file)
    
    # 3. 일괄 커밋
    commit_all_changes()
    
    # 4. 배포 대기
    wait_for_deployment()
    
    # 5. 검증
    verify_all_fixes()
```

### 5단계: 배포 및 검증 (15분)
```bash
# 자동 검증 실행
python deployment_verification.py

# 수동 확인
□ 메인 페이지 접속 확인
□ 핵심 기능 동작 확인
□ 콘솔 에러 제로 확인
```

### 6단계: 문서화 및 예방책 (10분)
```markdown
# 문제 리포트 작성
□ 문제 원인
□ 해결 과정
□ 재발 방지책
□ 학습한 교훈
```

## 🚫 절대 하지 말아야 할 것들

### ❌ 점진적/부분적 수정
- **하지 마세요**: 한 번에 한 파일씩 수정
- **대신 하세요**: 전체 범위 파악 후 일괄 수정

### ❌ 수정 후 바로 다음 작업
- **하지 마세요**: 커밋 후 바로 다른 작업 시작
- **대신 하세요**: 반드시 배포 완료 및 검증 후 진행

### ❌ 추측에 의한 수정
- **하지 마세요**: 원인 파악 없이 증상만 수정
- **대신 하세요**: 근본 원인 분석 후 체계적 해결

## ✅ 모범 사례

### 🎯 Always Do This
1. **문제 범위를 먼저 파악**하라
2. **표준화된 솔루션을 적용**하라  
3. **배포 후 반드시 검증**하라
4. **재발 방지책을 수립**하라

### 📊 품질 메트릭
- **해결 시간**: 1시간 이내
- **재발률**: 0% 목표
- **영향 범위**: 최소화
- **검증 완료율**: 100%

## 🔄 지속적 개선

### 매주 리뷰
- 발생한 문제들 분석
- 프로세스 개선점 도출
- 예방책 효과성 검토

### 분기별 업데이트
- 새로운 패턴 문제 대응책
- 자동화 도구 개선
- 검증 범위 확대

---
*이 프로토콜을 따르면 기획 설계대로 안정적인 사이트 운영이 가능합니다.*