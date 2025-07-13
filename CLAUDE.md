# CLAUDE.md - doha.kr 프로젝트 메모리

## ⚠️ 중요 - GitHub 토큰 정보 ⚠️

**반드시 지정된 GitHub 토큰만 사용할 것**

## 🏗️ doha.kr 프로젝트 구조 및 연결 관계 (2025-01-14 긴급 업데이트)

### 📋 프로젝트 개요
- **도메인**: https://doha.kr
- **GitHub**: https://github.com/doha1003/teste ⚠️ **이 레포만 사용! 다른 레포 건드리지 말 것**
- **호스팅**: GitHub Pages
- **주요 기능**: 심리테스트, 실용도구, AI 운세, 커뮤니티(준비중)

---

## 🚨 현재 상황 및 긴급 해결사항 (2025-01-14)

### 발견된 문제점들:
1. **CSS 로딩 문제**: main.css 파일이 존재하지 않아 404 오류 발생
2. **하얀 배경에 하얀 글자**: 메인 페이지 stats 섹션 가독성 문제
3. **인라인 컴포넌트**: navbar/footer가 제대로 로드되지 않음
4. **띠별 운세 페이지**: 완전히 깨진 상태

### 현재 진행 중인 수정사항:
- [x] stats 섹션 CSS 추가 (하얀 글자 문제 해결)
- [x] 모든 main.css 참조를 styles.css로 변경  
- [x] fortune/zodiac-animal/index.html CSS 참조 수정
- [x] GitHub에 모든 수정사항 커밋 완료

---

## 🔍 GitHub 레포지토리 전체 파일 현황

### 루트 디렉토리 주요 파일들:
- `index.html` - 메인 페이지 
- `CLAUDE.md` - 이 파일 (업데이트 필요)
- `CNAME` - 도메인 설정
- `404.html` - 에러 페이지
- 다수의 리포트 파일들 (.md)

### 주요 디렉토리 구조:
```
/
├── css/                 # CSS 파일들
├── js/                  # JavaScript 파일들  
├── images/              # 이미지 파일들
├── includes/            # 공통 컴포넌트 (navbar, footer)
├── tests/               # 심리테스트 페이지들
├── tools/               # 실용도구 페이지들
├── fortune/             # AI 운세 페이지들
├── about/               # 소개 페이지
├── contact/             # 문의 페이지
├── privacy/             # 개인정보처리방침
└── terms/               # 이용약관
```

---

## 🎯 현재 진행 중인 검수 계획

### Phase 1: 긴급 수정사항 GitHub 반영 ✅ 완료
- CSS 문제 해결
- 파일 참조 오류 수정
- 커밋 및 푸시 완료

### Phase 2: 전체 사이트 검증 (진행 중)
1. **메인 페이지 (doha.kr)** 
   - CSS 로딩 확인
   - stats 섹션 가독성 확인
   - 모든 링크 작동 확인

2. **운세 페이지들**
   - `/fortune/saju/` - 사주팔자
   - `/fortune/daily/` - 오늘의 운세  
   - `/fortune/tarot/` - AI 타로
   - `/fortune/zodiac/` - 별자리 운세
   - `/fortune/zodiac-animal/` - 띠별 운세

3. **심리테스트 페이지들**
   - `/tests/mbti/` - MBTI 테스트
   - `/tests/teto-egen/` - 테토-에겐 테스트
   - `/tests/love-dna/` - 러브 DNA 테스트

4. **실용도구 페이지들**
   - `/tools/text-counter.html` - 글자수 세기
   - `/tools/bmi-calculator.html` - BMI 계산기
   - `/tools/salary-calculator.html` - 연봉계산기

5. **기타 페이지들**
   - `/about/` - 소개
   - `/contact/` - 문의  
   - `/privacy/` - 개인정보처리방침
   - `/terms/` - 이용약관

### Phase 3: 문제 발견 시 즉시 수정
- 각 페이지 접속하여 콘솔 오류 확인
- CSS/JavaScript 로딩 문제 해결
- 기능 작동 여부 테스트
- 수정 후 GitHub 커밋

---

## 📝 검수 체크리스트

### 각 페이지별 확인사항:
- [ ] 페이지 정상 로드
- [ ] CSS 파일 정상 로드 (404 오류 없음)
- [ ] JavaScript 파일 정상 로드
- [ ] 콘솔에 오류 없음
- [ ] 모든 기능 정상 작동
- [ ] 모바일 반응형 정상
- [ ] 네비게이션/푸터 정상 표시
- [ ] 광고 정상 로드
- [ ] 메타데이터 정상

### 수정 후 프로세스:
1. 로컬에서 수정
2. GitHub에 커밋 및 푸시  
3. 2분 대기 (GitHub Pages 배포)
4. 실제 사이트에서 재검증
5. 문제 없을 때까지 반복

---

## 🔧 개발 도구 정보

### GitHub API 사용법:
```bash
curl -H "Authorization: token [GitHub-Token]" \
     https://api.github.com/repos/doha1003/teste/contents/[파일경로]
```

### Git 명령어:
```bash
git add -A
git commit -m "메시지"  
git push origin master
```

---

## ⚠️ 절대 규칙

1. **GitHub 토큰**: 지정된 토큰만 사용
2. **레포지토리**: `https://github.com/doha1003/teste` 만 사용
3. **수정 후 반드시**: GitHub 커밋 → 배포 대기 → 실사이트 검증
4. **문제 발견 시**: 거짓말 하지 말고 정확한 상황 보고
5. **검수 완료까지**: 10번이라도 반복해서 완벽하게 수정

---

*마지막 업데이트: 2025-01-14 - 긴급 검수 및 수정 진행 중*