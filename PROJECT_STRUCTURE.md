# 📋 doha.kr 프로젝트 구조 및 파일 연결관계 작업서

**최종 업데이트: 2025-07-14**

## 🎯 프로젝트 개요

### 기본 정보
- **도메인**: https://doha.kr
- **GitHub**: https://github.com/doha1003/teste
- **호스팅**: GitHub Pages + Vercel
- **총 페이지 수**: 30+ HTML 파일
- **총 CSS 파일**: 15개 (1개 메인 + 14개 페이지별)
- **총 JavaScript 파일**: 50+ 파일

---

## 📁 파일 구조 (2025-07-14 현재)

```
doha.kr/
├── 📄 index.html                    # 메인 홈페이지
├── 📄 404.html                     # 에러 페이지
├── 📄 offline.html                 # 오프라인 페이지
├── 📄 manifest.json                # PWA 매니페스트
├── 📄 sw.js                        # Service Worker
├── 📄 sitemap.xml                  # SEO 사이트맵
├── 📄 robots.txt                   # 크롤링 설정
├── 📄 README.md                    # 프로젝트 문서 
├── 📄 CLAUDE.md                    # Claude 메모리 파일
├── 📄 CSS_STRUCTURE.md             # CSS 구조 문서
├── 📄 CSS_CONNECTION_CHECKLIST.md  # CSS 체크리스트
├── 📄 PROJECT_STRUCTURE.md         # 이 파일
│
├── 📁 css/                         # CSS 파일들
│   ├── styles.css                 # 메인 통합 CSS (92KB)
│   └── pages/                     # 페이지별 CSS (14개)
│       ├── about.css              # About 페이지
│       ├── bmi-calculator.css     # BMI 계산기
│       ├── contact.css            # Contact 페이지
│       ├── fortune-main.css       # 운세 메인
│       ├── fortune.css            # 운세 공통
│       ├── legal.css              # 법적 고지
│       ├── love-dna-test.css      # Love DNA 테스트
│       ├── mbti-intro.css         # MBTI 소개
│       ├── mbti-test.css          # MBTI 테스트
│       ├── result-detail.css      # 결과 상세
│       ├── salary-calculator.css  # 연봉 계산기
│       ├── teto-egen-intro.css    # 테토-에겐 소개
│       ├── teto-egen-test.css     # 테토-에겐 테스트
│       └── text-counter.css       # 글자수 세기
│
├── 📁 js/                          # JavaScript 파일들
│   ├── main.js                    # 컴포넌트 로딩
│   ├── gemini-api.js              # Gemini API 클라이언트
│   ├── api-config.js              # API 설정
│   ├── bundle.min.js              # 번들된 JS
│   ├── main.min.js                # 압축된 메인 JS
│   └── pages/                     # 페이지별 JavaScript
│
├── 📁 includes/                    # 공통 컴포넌트
│   ├── navbar.html                # 네비게이션 바
│   └── footer.html                # 푸터
│
├── 📁 tests/                       # 심리테스트 (3종)
│   ├── index.html                 # 테스트 목록
│   ├── mbti/
│   │   ├── index.html            # MBTI 소개
│   │   └── test.html             # MBTI 테스트
│   ├── teto-egen/
│   │   ├── index.html            # 테토-에겐 소개
│   │   ├── start.html            # 테스트 시작
│   │   └── test.html             # 테스트 진행
│   └── love-dna/
│       ├── index.html            # Love DNA 소개
│       ├── test.html             # 테스트 진행
│       └── result.html           # 결과 페이지
│
├── 📁 fortune/                     # AI 운세 (5종)
│   ├── index.html                 # 운세 메인 허브
│   ├── daily/index.html           # 일일 운세
│   ├── saju/index.html            # AI 사주팔자
│   ├── tarot/index.html           # AI 타로
│   ├── zodiac/index.html          # 별자리 운세
│   └── zodiac-animal/index.html   # 띠별 운세
│
├── 📁 tools/                       # 실용도구 (3종)
│   ├── index.html                 # 도구 목록
│   ├── text-counter.html          # 글자수 세기
│   ├── bmi-calculator.html        # BMI 계산기
│   └── salary-calculator.html     # 연봉 계산기
│
├── 📁 about/                       # 정보 페이지
│   ├── index.html                 # About 페이지
│   └── index-enhanced.html        # 향상된 About
│
├── 📁 contact/                     # 문의 페이지
│   └── index.html
│
├── 📁 privacy/                     # 개인정보처리방침
│   └── index.html
│
├── 📁 terms/                       # 이용약관
│   └── index.html
│
├── 📁 faq/                         # 자주묻는질문
│   └── index.html
│
├── 📁 community/                   # 커뮤니티 (준비중)
│   └── index.html
│
├── 📁 images/                      # 이미지 리소스
│   ├── mbti/                      # MBTI 유형별 이미지
│   ├── love-dna/                  # Love DNA 이미지
│   ├── teto-egen/                 # 테토-에겐 이미지
│   └── fortune/                   # 운세 관련 이미지
│
├── 📁 api/                         # Vercel 서버리스 함수
│   ├── fortune.js                 # Gemini API 운세 생성
│   └── saju.js                    # 만세력 연동 사주 계산
│
└── 📁 data/                        # 데이터 파일 (예정)
    ├── Lunar/                     # 음력 변환 데이터
    ├── saju/                      # 사주 계산 데이터
    │   └── mansearyeok.sql       # 만세력 데이터베이스
    └── mbti/                      # MBTI 유형 데이터
```

---

## 🔗 CSS 연결관계 매트릭스 (2025-07-14 현재)

### 메인 CSS 파일 사용 현황

| HTML 파일 | styles.css | 페이지별 CSS | 인라인 스타일 |
|-----------|------------|-------------|-------------|
| **메인 페이지** |
| index.html | ✅ | - | ❌ |
| 404.html | ✅ | - | ✅ (에러 페이지 스타일) |
| offline.html | ✅ | - | ❌ |
| **정보 페이지** |
| about/index.html | ✅ | pages/about.css | ✅ (hero 섹션) |
| about/index-enhanced.html | ✅ | - | ✅ (향상된 스타일) |
| contact/index.html | ✅ | pages/contact.css | ✅ (폼 스타일) |
| privacy/index.html | ✅ | pages/legal.css | ❌ |
| terms/index.html | ✅ | pages/legal.css | ❌ |
| faq/index.html | ✅ | - | ✅ (FAQ 아코디언) |
| **심리테스트** |
| tests/index.html | ✅ | - | ✅ (테스트 카드) |
| tests/mbti/index.html | ✅ | pages/mbti-intro.css | ❌ |
| tests/mbti/test.html | ✅ | pages/mbti-test.css | ❌ |
| tests/teto-egen/index.html | ✅ | pages/teto-egen-intro.css | ❌ |
| tests/teto-egen/start.html | ✅ | pages/teto-egen-intro.css | ❌ (정리 완료) |
| tests/teto-egen/test.html | ✅ | pages/teto-egen-test.css | ❌ |
| tests/love-dna/index.html | ✅ | - | ✅ (소개 스타일) |
| tests/love-dna/test.html | ✅ | pages/love-dna-test.css | ❌ |
| tests/love-dna/result.html | ✅ | pages/love-dna-test.css | ❌ |
| **AI 운세** |
| fortune/index.html | ✅ | pages/fortune-main.css | ✅ (운세 카드) |
| fortune/daily/index.html | ✅ | - | ✅ (입력 폼) |
| fortune/saju/index.html | ✅ | - | ✅ (사주 입력) |
| fortune/tarot/index.html | ✅ | - | ✅ (타로 카드) |
| fortune/zodiac/index.html | ✅ | - | ✅ (별자리) |
| fortune/zodiac-animal/index.html | ✅ | - | ✅ (띠별 스타일) |
| **실용도구** |
| tools/index.html | ✅ | - | ✅ (도구 카드) |
| tools/text-counter.html | ✅ | pages/text-counter.css | ❌ |
| tools/bmi-calculator.html | ✅ | pages/bmi-calculator.css | ✅ (작은 스타일) |
| tools/salary-calculator.html | ✅ | pages/salary-calculator.css | ❌ |

### CSS 로딩 순서
```html
<!-- 모든 페이지 공통 -->
<link rel="stylesheet" href="/css/styles.css">

<!-- 페이지별 CSS (필요시) -->
<link rel="stylesheet" href="/css/pages/[page-name].css">

<!-- 인라인 스타일 (최소화 진행중) -->
<style>/* 페이지 고유 스타일 */</style>
```

---

## 🧩 컴포넌트 시스템

### 동적 로딩 컴포넌트
```html
<!-- 모든 페이지에 적용 -->
<div id="navbar-placeholder"></div>
<!-- 페이지 콘텐츠 -->
<div id="footer-placeholder"></div>

<script src="/js/main.js"></script>
```

### 컴포넌트 로딩 프로세스
1. `main.js`에서 `DOMContentLoaded` 이벤트 감지
2. `/includes/navbar.html` fetch 및 삽입
3. `/includes/footer.html` fetch 및 삽입
4. 실패 시 fallback 콘텐츠 표시

---

## 📊 인라인 스타일 현황 (정리 필요)

### ✅ 정리 완료
- tests/teto-egen/start.html → pages/teto-egen-intro.css로 이동

### ⚠️ 정리 필요 (우선순위 순)
1. **fortune/ 페이지들** (5개 파일)
   - 운세 입력 폼 스타일
   - 카드 UI 스타일
   - 결과 표시 스타일

2. **404.html**
   - 에러 페이지 애니메이션
   - 플로팅 스타일

3. **about/index-enhanced.html**
   - 향상된 hero 섹션

4. **tools/bmi-calculator.html**
   - `.sr-only` 클래스 (이미 styles.css에 있을 가능성)

5. **기타 페이지들**
   - FAQ 아코디언 스타일
   - 폼 관련 스타일

---

## 🚀 JavaScript 연결관계

### 핵심 JavaScript 파일
```javascript
// 모든 페이지 공통
- /js/main.js (컴포넌트 로딩)
- /js/api-config.js (API 설정)
- Kakao SDK (공유 기능)
- Google AdSense (광고)

// AI 운세 페이지
- /js/gemini-api.js (Gemini API 클라이언트)

// 개별 페이지
- 각 테스트/도구 페이지별 전용 JS
```

---

## 🔧 즉시 해결 필요한 항목들

### 1. CSS 정리 작업
- [ ] fortune/ 페이지들 인라인 스타일 → CSS 파일로 이동
- [ ] 404.html 인라인 스타일 정리
- [ ] 사용하지 않는 CSS 파일 제거 (variables.css, base.css, components.css)

### 2. 파일 연결 확인
- [ ] 모든 HTML 파일이 styles.css를 올바르게 참조하는지 확인
- [ ] 페이지별 CSS 파일 연결 상태 점검
- [ ] JavaScript 파일 로딩 순서 최적화

### 3. 성능 최적화
- [ ] CSS 파일 크기 최적화 (현재 92KB)
- [ ] 불필요한 CSS 규칙 제거
- [ ] Critical CSS 추출

---

## 📋 작업 체크리스트 (2025-07-14)

### Phase 1: 인라인 스타일 정리 ⏳
- [x] teto-egen/start.html 정리 완료
- [ ] fortune/ 페이지들 (5개)
- [ ] 404.html 
- [ ] about/index-enhanced.html
- [ ] tools/bmi-calculator.html

### Phase 2: CSS 파일 최적화
- [x] 사용하지 않는 CSS 파일 제거 (base.css, components.css, variables.css 삭제)
- [x] 불필요한 백업/임시 파일 제거 (MD 파일 11개, JS 파일 2개 삭제)
- [ ] CSS 규칙 중복 제거
- [ ] 파일 크기 최적화

### Phase 3: 최종 검증
- [ ] 모든 페이지 로딩 테스트
- [ ] 콘솔 에러 확인
- [ ] 모바일 반응형 테스트
- [ ] 성능 점수 측정

---

## 📞 문제 발생 시 체크 포인트

1. **CSS 파일이 로드되지 않는 경우**
   - 파일 경로 확인: `/css/styles.css`
   - GitHub Pages 캐시 확인
   - 파일 존재 여부 확인

2. **컴포넌트가 로드되지 않는 경우**
   - `main.js` 로딩 확인
   - `/includes/` 파일 존재 확인
   - 네트워크 연결 상태 확인

3. **스타일이 적용되지 않는 경우**
   - CSS 선택자 우선순위 확인
   - 인라인 스타일과의 충돌 확인
   - 브라우저 캐시 삭제

---

*이 문서는 doha.kr 프로젝트의 전체 구조와 파일 연결관계를 관리하는 작업서입니다.*
*최종 업데이트: 2025-07-14*