# 도하 프로젝트 디자인 감사 체크리스트

## 26개 주요 페이지 목록

### 메인 페이지 (1개)
1. **홈페이지** (`index.html`) ✅

### 심리테스트 (6개)
2. **심리테스트 메인** (`tests/index.html`)
3. **MBTI 소개** (`tests/mbti/index.html`) ✅
4. **MBTI 테스트** (`tests/mbti/test.html`)
5. **Love DNA 소개** (`tests/love-dna/index.html`)
6. **Love DNA 테스트** (`tests/love-dna/test.html`)
7. **Teto-Egen 소개** (`tests/teto-egen/index.html`)
8. **Teto-Egen 테스트** (`tests/teto-egen/test.html`)

### 운세 서비스 (6개)
9. **운세 메인** (`fortune/index.html`)
10. **일일 운세** (`fortune/daily/index.html`)
11. **사주** (`fortune/saju/index.html`)
12. **타로** (`fortune/tarot/index.html`)
13. **서양 별자리** (`fortune/zodiac/index.html`)
14. **띠별 운세** (`fortune/zodiac-animal/index.html`)

### 실용 도구 (4개)
15. **도구 메인** (`tools/index.html`)
16. **BMI 계산기** (`tools/bmi-calculator.html`)
17. **연봉 계산기** (`tools/salary-calculator.html`)
18. **글자수 세기** (`tools/text-counter.html`)

### 기타 페이지 (9개)
19. **소개** (`about/index.html`)
20. **문의** (`contact/index.html`)
21. **FAQ** (`faq/index.html`)
22. **개인정보처리방침** (`privacy/index.html`)
23. **이용약관** (`terms/index.html`)
24. **404 오류** (`404.html`)
25. **오프라인** (`offline.html`)
26. **결과 상세** (`result-detail.html`)

## 디자인 문제점 체크리스트

### 🚨 High Priority (긴급)
- [ ] **버튼 vs 텍스트 구분**: 클릭 가능한 요소의 시각적 구분
- [ ] **한글 줄바꿈**: word-break: keep-all 적용 여부
- [ ] **페이지 로딩 실패**: `.page-header` 선택자 문제

### 🔍 Medium Priority (중요)
- [ ] **레이아웃 정렬**: 요소들의 일관된 정렬
- [ ] **여백 일관성**: 8px 그리드 시스템 준수
- [ ] **테마 전환**: 다크/라이트 모드 정상 작동

### 📱 Mobile Priority (모바일)
- [ ] **터치 영역**: 44px 이상 버튼 크기
- [ ] **한글 입력**: 키보드 대응 최적화
- [ ] **스크롤 최적화**: iOS 사파리 대응

### 🎨 Design System Priority (디자인)
- [ ] **색상 일관성**: CSS 변수 적용 여부
- [ ] **타이포그래피**: Pretendard 폰트 적용
- [ ] **컴포넌트 통일성**: 카드, 버튼 스타일 일관성

## 진행 상황
- ✅ 보라색 배경 문제 해결
- 🔄 페이지별 스크린샷 캡처 중
- ⏳ 버튼/텍스트 구분 분석 예정
- ⏳ 한글 줄바꿈 수정 예정