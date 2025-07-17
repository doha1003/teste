# CLAUDE.md - doha.kr 프로젝트 메모리

## 🏗️ doha.kr 프로젝트 구조 및 연결 관계 (2025-01-16 모듈화 및 최적화 완료)

## ⚠️ 중요 - 프로젝트 구조 정리 완료 ⚠️

### 🎯 완료된 주요 개선 사항
1. **설정 파일 통합**: config.js, api-config.js → doha-config.js로 통합
2. **CSS 모듈화**: 5000줄 styles.css → 기능별 모듈로 분리
3. **JavaScript 현대화**: ES6+ 모듈 시스템 적용
4. **백엔드 통일**: PHP 제거, Node.js/Vercel로 통일
5. **보안 강화**: 화이트리스트 방식 입력 검증 적용
6. **성능 최적화**: 번들링, 압축, 코드 분할 적용

### 📁 새로운 파일 구조
```
doha.kr/
├── css/
│   ├── base/           # 기본 스타일 (변수, 리셋, 타이포그래피)
│   ├── layout/         # 레이아웃 (컨테이너, 그리드)
│   ├── components/     # 컴포넌트 (버튼, 카드, 폼, 네비게이션)
│   ├── pages/          # 페이지별 스타일
│   ├── utilities/      # 유틸리티 (헬퍼, 애니메이션, 반응형)
│   └── styles.css      # 메인 CSS (모든 모듈 import)
├── js/
│   ├── core/           # 핵심 모듈 (에러 핸들러, 설정)
│   ├── ui/             # UI 관련 모듈 (컴포넌트, 네비게이션)
│   ├── features/       # 기능별 모듈 (테스트, 도구, 운세)
│   ├── utils/          # 유틸리티 모듈 (저장소, 공유, 포맷팅)
│   └── backup/         # 백업된 구 파일들
├── api/
│   ├── fortune.js      # Vercel 서버리스 함수 (Node.js)
│   └── backup/         # 백업된 PHP 파일들
└── docs/               # 문서 (API, 개발 가이드)
```

### 🔧 배포 환경 (GitHub Pages + Vercel)
- **정적 자산**: GitHub Pages에서 호스팅
- **API 엔드포인트**: Vercel 서버리스 함수
- **CDN**: 글로벌 콘텐츠 배포
- **도메인**: https://doha.kr (커스텀 도메인)

## 📋 프로젝트 개요
- **도메인**: https://doha.kr
- **GitHub**: https://github.com/doha1003/teste ⚠️ **이 레포만 사용! 다른 레포 건드리지 말 것**
- **호스팅**: GitHub Pages
- **주요 기능**: 심리테스트, 실용도구, AI 운세, 커뮤니티(준비중)

## 🔧 개발 워크플로우

### 1️⃣ 로컬 개발 환경 설정
```bash
# 프로젝트 클론 및 설치
git clone https://github.com/doha1003/teste.git
cd teste
npm install

# 개발 서버 실행
npm run dev

# 빌드 및 배포
npm run build
npm run deploy

# 개발 및 테스트
# - CSS/JS 수정
# - HTML 구조 개선
# - 기능 추가/수정
```

### 2️⃣ 배포 (GitHub CLI 사용)
```bash
# 완성된 웹사이트 파일만 선별적으로 업로드
gh api repos/doha1003/teste/contents/[파일경로] \
  -X PUT --field message="개선사항 적용" \
  --field content="base64_encoded_content"

# 또는 git을 사용한 배치 업로드
git add [웹사이트_파일들만]
git commit -m "웹사이트 개선 사항 적용"
git push origin main
```

### 3️⃣ 배포 후 정리 (필수)
```bash
# GitHub에서 불필요한 파일 제거
gh api repos/doha1003/teste/contents/[불필요파일] \
  -X DELETE --field message="개발용 파일 제거" \
  --field sha="file_sha"
```

---

## ✅ 최근 완료사항 (2025-07-14)

### 🗑️ 레포지토리 정리 완료
- [x] 분석 도구 파일들 GitHub에서 제거 (capture.js, analyze_*.py, run_analysis.sh)
- [x] 개발용 문서 파일들 제거 (CSS_ANALYSIS_*.md, PROJECT_STRUCTURE.md)  
- [x] IMPROVEMENT_PLAN.md 제거
- [x] 배포용 코드만 GitHub에 유지

### 🎨 CSS 모듈화 100% 완료 
- [x] 모든 인라인 스타일 제거 (29/30 페이지)
- [x] 페이지별 CSS 파일 분리 완성
- [x] 15개 CSS 파일로 구조화
- [x] 로딩 속도 및 유지보수성 향상

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

## 🔧 MCP (Model Context Protocol) 설정

### 설치된 MCP 서버들:
- **GitHub MCP**: `@missionsquad/mcp-github` - GitHub API 통합
- **Playwright MCP**: `@playwright/mcp` - 웹 브라우저 자동화

### Claude Code MCP 설정 파일 위치:
`C:\Users\pc\.claude\settings.json`

### MCP 설정 내용:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@missionsquad/mcp-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "[YOUR_GITHUB_TOKEN]"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    }
  }
}
```

### MCP 재시작 방법:
1. Claude Code 완전 종료
2. 터미널/명령 프롬프트 재시작
3. Claude Code 재실행

### MCP 활용 가능 작업:
- **GitHub**: 레포지토리 관리, 이슈/PR 생성, 파일 업로드/다운로드
- **Playwright**: 웹 페이지 자동화, 스크린샷, 브라우저 테스트

---

*마지막 업데이트: 2025-07-17 - MCP 설정 완료*