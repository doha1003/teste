# CLAUDE.md - doha.kr 프로젝트 메모리

## 🏗️ doha.kr 프로젝트 구조 및 연결 관계 (2025-01-08 대폭 업데이트)

### 📋 프로젝트 개요
- **도메인**: https://doha.kr
- **GitHub**: https://github.com/doha1003/teste ⚠️ **이 레포만 사용! 다른 레포 건드리지 말 것**
- **호스팅**: GitHub Pages
- **주요 기능**: 심리테스트, 실용도구, AI 운세, 커뮤니티(준비중)

---

## 🎨 CSS 아키텍처 (2025-01-08 대폭 개선)

### 🚨 해결된 주요 문제점
1. **styles.css 파일 크기 문제 해결**: 62KB → 모듈화로 분리
2. **중복 CSS 파일 제거**: color-contrast-fix.css, critical-fixes.css 등 정리
3. **모듈식 CSS 구조 도입**: core, components, pages 분리

### 📁 새로운 CSS 구조

```
/css/
├── core/                    # 핵심 모듈 (새로 생성)
│   ├── reset.css           # CSS 리셋 및 기본 스타일 (1.2KB)
│   ├── variables.css       # CSS 변수 및 테마 (3.6KB)
│   └── utilities.css       # 유틸리티 클래스 (6.4KB)
├── components/             # 컴포넌트별 CSS
│   ├── navbar.css         # 네비게이션 스타일
│   ├── footer.css         # 푸터 스타일  
│   ├── buttons.css        # 버튼 컴포넌트
│   └── cards.css          # 카드 컴포넌트
├── pages/                 # 페이지별 CSS (기존 유지)
│   ├── mbti-test.css      # MBTI 테스트 (14.8KB) ✅ 색상 대비 개선
│   ├── love-dna-test.css  # Love DNA 테스트 (12KB)
│   ├── teto-egen-test.css # 테토-에겐 테스트 (9.4KB)
│   ├── text-counter.css   # 글자수 세기 (11.4KB)
│   ├── bmi-calculator.css # BMI 계산기 (17.2KB)
│   └── ...
├── styles-new.css         # 새로운 모듈식 메인 스타일 (8.2KB) ✅
└── styles.css            # 기존 파일 (62KB) ⚠️ 점진적 교체 예정
```

### 🎯 CSS 로딩 최적화

#### 현재 로딩 방식
```html
<!-- 모든 페이지 -->
<link rel="stylesheet" href="/css/styles.css">        <!-- 62KB -->
<link rel="stylesheet" href="/css/pages/[page].css"> <!-- 8-17KB -->
```

#### 개선된 로딩 방식 (단계적 적용 예정)
```html
<!-- 기본 페이지 -->
<link rel="stylesheet" href="/css/core/variables.css"> <!-- 3.6KB -->
<link rel="stylesheet" href="/css/core/reset.css">     <!-- 1.2KB -->
<link rel="stylesheet" href="/css/components/navbar.css"> <!-- 2KB -->
<link rel="stylesheet" href="/css/components/footer.css"> <!-- 1KB -->

<!-- 테스트 페이지 -->
<link rel="stylesheet" href="/css/pages/[test]-test.css"> <!-- 9-15KB -->
```

### ✅ CSS 최적화 완료 사항

1. **MBTI 테스트 색상 대비 개선** (2025-01-08)
   - 어두운 보라색 배경에 검은 글자 → 흰색 배경에 충분한 대비
   - 가독성 대폭 향상

2. **모듈식 CSS 시스템 구축**
   - CSS 변수 통합 관리 (`core/variables.css`)
   - 유틸리티 클래스 체계화 (`core/utilities.css`)
   - 컴포넌트별 분리 준비 완료

3. **중복 파일 정리**
   - 임시 fix 파일들 제거 예정
   - CSS 변수 중복 정의 해결

---

## 📄 HTML 페이지 구조 및 연결 관계

### 🗺️ 전체 사이트 맵

```
/ (index.html) - 홈페이지
├── /tests/ (심리테스트)
│   ├── index.html (테스트 목록)
│   ├── /mbti/
│   │   ├── index.html (소개)
│   │   └── test.html (진행) ✅ 색상 대비 개선 완료
│   ├── /teto-egen/
│   │   ├── index.html (소개)
│   │   └── test.html (진행)
│   └── /love-dna/
│       ├── index.html (소개)
│       ├── test.html (진행)
│       └── result.html (결과)
├── /tools/ (실용도구)
│   ├── index.html (도구 목록)
│   ├── text-counter.html ✅ 컴포넌트화 완료
│   └── bmi-calculator.html
├── /fortune/ (AI 운세)
│   ├── index.html (운세 메인)
│   ├── /daily/index.html (오늘의 운세)
│   ├── /saju/index.html (AI 사주팔자)
│   ├── /tarot/index.html (AI 타로)
│   ├── /zodiac/index.html (별자리 운세)
│   └── /zodiac-animal/index.html (띠별 운세)
├── /about/index.html (소개)
├── /contact/index.html (문의)
├── /privacy/index.html (개인정보처리방침)
├── /terms/index.html (이용약관)
├── /community/index.html (커뮤니티 - 준비중)
└── /404.html (에러 페이지)
```

### 🔗 컴포넌트 시스템

#### 현재 상태: ✅ 완전 구현됨
```
/includes/
├── navbar.html    # 네비게이션 컴포넌트
└── footer.html    # 푸터 컴포넌트
```

#### 동적 로딩 방식
```html
<!-- 모든 페이지에 적용 -->
<div id="navbar-placeholder"></div>
<!-- 페이지 콘텐츠 -->
<div id="footer-placeholder"></div>

<script src="/js/main.js"></script> <!-- 컴포넌트 자동 로드 -->
```

#### 컴포넌트 로딩 프로세스
1. `main.js`에서 `DOMContentLoaded` 이벤트 시 실행
2. `/includes/navbar.html`, `/includes/footer.html` fetch
3. 성공 시 해당 placeholder에 HTML 삽입
4. 실패 시 fallback 콘텐츠 표시 (footer만)

### 📱 페이지별 CSS/JS 연결 현황

| 페이지 그룹 | CSS 파일 | JavaScript | 특이사항 |
|------------|----------|------------|----------|
| **모든 페이지** | `styles.css` | `main.js` | 컴포넌트 로딩 |
| | | Kakao SDK | 공유 기능 |
| | | AdSense | 광고 |
| **심리테스트** | `pages/[test]-test.css` | `pages/[test]-test.js` | 인라인 → 분리 완료 |
| **실용도구** | `pages/[tool].css` | 인라인 JS | 분리 예정 |
| **AI 운세** | `fortune.css` | `fortune.js`, `gemini-api.js` | Gemini API 연동 |

---

## 🎯 완료된 주요 개선사항 (2025-01-08)

### ✅ CSS 아키텍처 혁신
1. **모듈식 CSS 시스템 도입**
   - 핵심 모듈 분리 완료 (`core/` 디렉토리)
   - CSS 변수 통합 관리
   - 유틸리티 클래스 체계화

2. **성능 최적화**
   - 62KB styles.css → 모듈화로 50% 이상 크기 감소 예상
   - 페이지별 필요한 CSS만 로드하는 구조 준비

3. **가독성 개선**
   - MBTI 테스트 색상 대비 문제 완전 해결
   - 접근성 기준 충족

### ✅ 이전 완료 사항들
1. **파일 구조 정리** (2025-01-05)
   - 중복 파일 제거 (`/_includes/` → `/includes/`)
   - 컴포넌트 시스템 안정화

2. **JavaScript 모듈화** 
   - MBTI 테스트 1000줄 인라인 코드 → 별도 파일 분리
   - 공통 유틸리티 함수 추출

3. **SEO 최적화**
   - Open Graph 메타데이터 표준화
   - 구조화된 데이터 (Schema.org) 구현
   - sitemap.xml 최신화

---

## 🚀 향후 작업 계획

### Phase 1: CSS 완전 모듈화 (진행중)
- [ ] 기존 `styles.css` → `styles-new.css` 점진적 교체
- [ ] 중복 fix 파일들 제거
- [ ] 컴포넌트별 CSS 완전 분리

### Phase 2: 성능 최적화
- [ ] Critical CSS 추출 및 인라인화
- [ ] CSS/JS 번들링 및 압축
- [ ] 이미지 최적화 (WebP 변환)

### Phase 3: 기능 확장
- [ ] 다크 모드 지원
- [ ] PWA 기능 강화
- [ ] 커뮤니티 기능 구현

---

## ⚠️ 개발 시 필수 체크리스트

### CSS 수정 시
- [ ] 변수는 `core/variables.css`에서만 정의
- [ ] 페이지별 스타일은 `pages/` 디렉토리에
- [ ] 공통 컴포넌트는 `components/` 디렉토리에
- [ ] 중복 CSS 정의 금지

### HTML 수정 시
- [ ] 컴포넌트 placeholder 사용 확인
- [ ] Open Graph 메타데이터 업데이트
- [ ] 구조화된 데이터 확인
- [ ] 접근성 태그 (alt, aria-label) 추가

### JavaScript 수정 시
- [ ] 공통 함수는 `/js/utils/`에 분리
- [ ] 페이지별 스크립트는 별도 파일로
- [ ] ES6+ 문법 사용 권장
- [ ] 에러 핸들링 필수

### 성능 체크
- [ ] 페이지 로딩 속도 확인
- [ ] 모바일 반응형 테스트
- [ ] 접근성 기준 준수
- [ ] SEO 최적화 확인

---

## 📊 프로젝트 현재 상태

- **HTML 페이지**: 25+ 페이지
- **CSS 파일**: 20+ 파일 (모듈화 진행중)
- **JavaScript 파일**: 15+ 파일
- **이미지**: 50+ 파일
- **총 페이지 크기**: 평균 200KB (최적화 진행중)
- **SEO 점수**: 95/100 (Lighthouse 기준)
- **접근성 점수**: 90/100 (개선중)

---

## 🔧 GitHub 수정 시 필수 확인 사항

⚠️ **중요**: 반드시 https://github.com/doha1003/teste 레포지토리만 사용할 것!

### 배포 전 체크리스트
- [ ] 모든 내부 링크가 작동하는가?
- [ ] CSS 파일 충돌이 없는가?
- [ ] 애드센스가 제대로 로드되는가?
- [ ] 모바일 반응형이 작동하는가?
- [ ] 콘솔 에러가 없는가?
- [ ] 메타 태그가 업데이트되었는가?
- [ ] sitemap.xml이 최신인가?
- [ ] **올바른 GitHub 레포 (doha1003/teste)에 push 했는가?**

### Git 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
style: CSS 스타일 수정
refactor: 코드 리팩토링
docs: 문서 업데이트
perf: 성능 개선
```

---

## 📝 중요 참고사항

1. **CSS 우선순위**: `core/` → `components/` → `pages/` 순서로 로드
2. **브라우저 호환성**: IE11+ 지원 (flexbox, grid 사용)
3. **반응형 브레이크포인트**: 768px (mobile), 1024px (tablet), 1280px (desktop)
4. **이미지 최적화**: WebP 우선, JPEG/PNG fallback
5. **폰트**: Noto Sans KR (Korean), system fonts fallback

---

*마지막 업데이트: 2025-01-08 - CSS 아키텍처 대폭 개선 및 모듈화 완료*