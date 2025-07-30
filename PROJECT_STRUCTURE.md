# doha.kr 프로젝트 구조 및 페이지별 상세 분석

## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [디렉토리 구조](#디렉토리-구조)
4. [디자인 시스템](#디자인-시스템)
5. [페이지별 상세 분석](#페이지별-상세-분석)
6. [공통 컴포넌트](#공통-컴포넌트)
7. [API 및 서버리스 함수](#api-및-서버리스-함수)
8. [배포 및 호스팅](#배포-및-호스팅)

---

## 프로젝트 개요

**doha.kr**은 한국어 사용자를 위한 종합 엔터테인먼트 및 유틸리티 웹사이트입니다.

### 주요 서비스
- **심리테스트**: MBTI, 테토-에겐, 러브DNA
- **AI 운세**: 사주팔자, 타로, 별자리, 띠별 운세
- **실용도구**: BMI 계산기, 글자수 세기, 연봉 계산기

### 핵심 특징
- 모바일 우선 반응형 디자인
- PWA (Progressive Web App) 지원
- 한국어 최적화 (Pretendard 폰트, word-break: keep-all)
- AI 통합 (Gemini API)
- 광고 수익화 (Google AdSense)

---

## 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: 모듈형 아키텍처, CSS Variables
- **JavaScript**: ES6+, 모듈 시스템
- **폰트**: Noto Sans KR, Pretendard

### Backend
- **Vercel Functions**: 서버리스 API
- **API**: 
  - Gemini API (AI 운세)
  - 자체 개발 만세력 계산 API

### 인프라
- **호스팅**: GitHub Pages (정적 사이트)
- **API**: Vercel (서버리스 함수)
- **도메인**: doha.kr
- **SSL**: Let's Encrypt

### 분석 및 모니터링
- Google Analytics
- Google Search Console
- Vercel Analytics

---

## 디렉토리 구조

```
C:\Users\pc\teste\
├── api/                    # Vercel 서버리스 함수
│   ├── fortune.js         # AI 운세 API
│   └── manseryeok.js      # 만세력 계산 API
├── css/                   # 스타일시트
│   ├── main.css          # 메인 진입점
│   ├── core/             # 기본 설정
│   ├── layout/           # 레이아웃
│   ├── components/       # 재사용 컴포넌트
│   ├── features/         # 기능별 스타일
│   └── pages/            # 페이지별 스타일
├── js/                    # JavaScript
│   ├── core/             # 핵심 기능
│   ├── features/         # 기능별 모듈
│   ├── pages/            # 페이지별 스크립트
│   └── utils/            # 유틸리티
├── images/                # 이미지 리소스
├── design-system/         # 디자인 시스템 문서
├── tests/                 # 테스트 페이지
├── tools/                 # 도구 페이지
├── fortune/               # 운세 페이지
└── [기타 정적 파일]
```

---

## 디자인 시스템

### Linear.app 기반 디자인 시스템 v2.0

**위치**: `/design-system/`

#### 핵심 파일
- `linear-theme.json`: 디자인 토큰
- `comprehensive-demo.html`: 컴포넌트 데모
- `demo.html`: 통합 데모

#### 디자인 토큰
```css
/* 색상 시스템 */
--color-primary: #5c5ce0;
--color-primary-dark: #4646d3;
--color-primary-light: #7373e7;
--color-primary-lighter: #e8e8ff;

/* 텍스트 색상 */
--text-primary: #1a1a1a;
--text-secondary: #666666;
--text-tertiary: #999999;

/* 배경 색상 */
--bg-primary: #ffffff;
--bg-secondary: #f8f9fa;
--bg-tertiary: #f1f3f5;

/* 간격 시스템 (8px 그리드) */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;

/* 그림자 */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);

/* 반경 */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

#### 컴포넌트 시스템
1. **버튼**: Primary, Secondary, Ghost, Danger
2. **카드**: 서비스 카드, 결과 카드
3. **폼**: 입력 필드, 라디오, 체크박스
4. **네비게이션**: 반응형 메뉴
5. **모달 및 알림**
6. **탭 인터페이스**
7. **진행 표시기**

---

## 페이지별 상세 분석

### 1. 홈페이지 (/)
**파일**: `index.html`

#### 특징
- 히어로 섹션 (gradient background)
- 서비스 카테고리 카드 (3개)
- 인기 서비스 캐러셀
- 최신 업데이트 섹션

#### 연결된 CSS
```css
- /css/main.css (전체 스타일)
- /css/pages/home.css (홈 전용)
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/pages/home.js
- /js/features/service-carousel.js
```

#### 디자인 시스템 사용
- ✅ 카드 컴포넌트
- ✅ 버튼 시스템
- ✅ 그리드 레이아웃
- ✅ 애니메이션 (fade-in, slide-up)

---

### 2. 소개 페이지 (/about/)
**파일**: `about/index.html`

#### 특징
- 사이트 소개 텍스트
- 미션 및 비전
- 팀 소개 (옵션)
- 연혁

#### 연결된 CSS
```css
- /css/main.css
- /css/pages/about.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
```

#### 디자인 시스템 사용
- ✅ 타이포그래피 시스템
- ✅ 컨테이너 레이아웃
- ⭕ 타임라인 컴포넌트 (커스텀)

---

### 3. 문의하기 (/contact/)
**파일**: `contact/index.html`

#### 특징
- 문의 폼 (이름, 이메일, 제목, 내용)
- 이메일 검증
- reCAPTCHA 통합 (옵션)

#### 연결된 CSS
```css
- /css/main.css
- /css/pages/contact.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/features/contact-form.js
- /js/utils/form-validator.js
```

#### 디자인 시스템 사용
- ✅ 폼 컴포넌트
- ✅ 버튼 시스템
- ✅ 검증 상태 표시

---

### 4. 개인정보처리방침 (/privacy/)
**파일**: `privacy/index.html`

#### 특징
- 법적 문서 형식
- 목차 네비게이션
- 섹션별 앵커 링크

#### 연결된 CSS
```css
- /css/main.css
- /css/pages/legal.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/features/toc-navigation.js
```

#### 디자인 시스템 사용
- ✅ 타이포그래피
- ✅ 리스트 스타일
- ⭕ 목차 네비게이션 (커스텀)

---

### 5. 이용약관 (/terms/)
**파일**: `terms/index.html`

#### 특징
- 법적 문서 형식
- 섹션별 구분
- 동의 체크박스 (회원가입 연동 시)

#### 연결된 CSS
```css
- /css/main.css
- /css/pages/legal.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
```

#### 디자인 시스템 사용
- ✅ 타이포그래피
- ✅ 섹션 구분자

---

### 6. FAQ (/faq/)
**파일**: `faq/index.html`

#### 특징
- 아코디언 인터페이스
- 카테고리별 분류
- 검색 기능

#### 연결된 CSS
```css
- /css/main.css
- /css/pages/faq.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/features/accordion.js
- /js/features/faq-search.js
```

#### 디자인 시스템 사용
- ✅ 아코디언 컴포넌트
- ✅ 검색 폼
- ✅ 아이콘 시스템

---

### 7. 테스트 메인 (/tests/)
**파일**: `tests/index.html`

#### 특징
- 테스트 목록 그리드
- 각 테스트 소개 카드
- 인기 테스트 표시

#### 연결된 CSS
```css
- /css/main.css
- /css/pages/tests-index.css
- /css/features/tests-common.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/features/test-cards.js
```

#### 디자인 시스템 사용
- ✅ 카드 그리드
- ✅ 뱃지 (인기, 신규)
- ✅ 호버 효과

---

### 8. MBTI 테스트 (/tests/mbti/)
**파일**: `tests/mbti/index.html`

#### 특징
- 60문항 성격 테스트
- 진행률 표시
- 결과 저장 및 공유

#### 연결된 CSS
```css
- /css/main.css
- /css/features/mbti-test.css
- /css/features/test-result.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/core/service-base.js
- /js/features/tests/test-service.js
- /js/features/tests/mbti-test.js
```

#### 디자인 시스템 사용
- ✅ 진행 바
- ✅ 라디오 버튼 (커스텀)
- ✅ 결과 카드
- ✅ 공유 버튼

#### 데이터 구조
```javascript
{
  questions: [
    {
      id: 1,
      text: "새로운 사람들과 만나는 것이 즐겁다",
      dimension: "E-I",
      direction: "E"
    }
    // ... 60개 문항
  ],
  results: {
    "INTJ": {
      title: "전략가",
      description: "...",
      traits: ["독립적", "분석적", "목표지향적"],
      careers: ["과학자", "엔지니어", "전략기획자"]
    }
    // ... 16개 유형
  }
}
```

---

### 9. 러브DNA 테스트 (/tests/love-dna/)
**파일**: `tests/love-dna/index.html`

#### 특징
- 30문항 연애 스타일 테스트
- 4가지 DNA 유형 분류
- 궁합 매칭 기능

#### 연결된 CSS
```css
- /css/main.css
- /css/features/love-dna-test.css
- /css/features/test-result.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/core/service-base.js
- /js/features/tests/test-service.js
- /js/features/tests/love-dna-test.js
```

#### 디자인 시스템 사용
- ✅ 스텝 인디케이터
- ✅ 선택 카드
- ✅ DNA 시각화 (커스텀)
- ✅ 매칭 결과 표시

---

### 10. 테토-에겐 테스트 (/tests/teto-egen/)
**파일**: `tests/teto-egen/index.html`

#### 특징
- 10문항 간단 성격 테스트
- 2가지 유형 분류
- 캐릭터 기반 결과

#### 연결된 CSS
```css
- /css/main.css
- /css/features/teto-egen-test.css
- /css/features/test-result.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/core/service-base.js
- /js/features/tests/test-service.js
- /js/features/tests/teto-egen-test.js
```

#### 디자인 시스템 사용
- ✅ 프로그레스 링
- ✅ 이미지 선택 버튼
- ✅ 캐릭터 애니메이션

---

### 11. 도구 메인 (/tools/)
**파일**: `tools/index.html`

#### 특징
- 도구 목록 카드
- 실시간 사용 예시
- 인기 도구 표시

#### 연결된 CSS
```css
- /css/main.css
- /css/pages/tools-index.css
- /css/features/tool-common.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
```

#### 디자인 시스템 사용
- ✅ 아이콘 카드
- ✅ 데모 프리뷰

---

### 12. BMI 계산기 (/tools/bmi/)
**파일**: `tools/bmi/index.html`

#### 특징
- 키/몸무게 입력
- 실시간 계산
- BMI 등급 표시
- 건강 조언

#### 연결된 CSS
```css
- /css/main.css
- /css/features/bmi-calculator.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/core/service-base.js
- /js/features/tools/tool-service.js
- /js/features/tools/bmi-calculator.js
```

#### 디자인 시스템 사용
- ✅ 숫자 입력 필드
- ✅ 슬라이더 (옵션)
- ✅ 결과 게이지
- ✅ 등급 색상 시스템

---

### 13. 글자수 세기 (/tools/text-counter/)
**파일**: `tools/text-counter/index.html`

#### 특징
- 텍스트 입력 영역
- 실시간 카운팅
- 공백 포함/제외
- 바이트 계산
- 원고지 환산

#### 연결된 CSS
```css
- /css/main.css
- /css/features/text-counter.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/core/service-base.js
- /js/features/tools/tool-service.js
- /js/features/tools/text-counter.js
```

#### 디자인 시스템 사용
- ✅ 텍스트에어리어
- ✅ 통계 카드
- ✅ 복사 버튼

---

### 14. 연봉 계산기 (/tools/salary/)
**파일**: `tools/salary/index.html`

#### 특징
- 연봉/월급 입력
- 4대보험 자동 계산
- 소득세 계산
- 실수령액 표시

#### 연결된 CSS
```css
- /css/main.css
- /css/features/salary-calculator.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/core/service-base.js
- /js/features/tools/tool-service.js
- /js/features/tools/salary-calculator.js
- /js/utils/tax-calculator.js
```

#### 디자인 시스템 사용
- ✅ 숫자 입력 (포맷팅)
- ✅ 계산 결과 테이블
- ✅ 상세 내역 아코디언

---

### 15. 운세 메인 (/fortune/)
**파일**: `fortune/index.html`

#### 특징
- 운세 서비스 목록
- AI 운세 소개
- 인기 운세 표시

#### 연결된 CSS
```css
- /css/main.css
- /css/pages/fortune-index.css
- /css/features/fortune-common.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
```

#### 디자인 시스템 사용
- ✅ 서비스 카드
- ✅ AI 뱃지
- ✅ 아이콘 시스템

---

### 16. 오늘의 운세 (/fortune/daily/)
**파일**: `fortune/daily/index.html`

#### 특징
- 생년월일시 입력
- 음력/양력 선택
- AI 기반 운세 생성
- 분야별 운세 (총운, 애정, 재물, 건강)

#### 연결된 CSS
```css
- /css/main.css
- /css/features/daily-fortune.css
- /css/features/fortune-result.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/core/service-base.js
- /js/features/fortune/fortune-service.js
- /js/features/fortune/daily-fortune.js
- /js/api-config.js
```

#### 디자인 시스템 사용
- ✅ 날짜 선택기
- ✅ 시간 선택기
- ✅ 결과 섹션 카드
- ✅ 운세 점수 표시

#### API 연동
```javascript
// Gemini API 호출
POST /api/fortune
{
  type: "daily",
  userData: {
    year, month, day, hour,
    isLunar: boolean
  }
}
```

---

### 17. 사주팔자 (/fortune/saju/)
**파일**: `fortune/saju/index.html`

#### 특징
- 생년월일시 필수 입력
- 만세력 계산
- 오행 분석
- 십신 해석

#### 연결된 CSS
```css
- /css/main.css
- /css/features/saju-fortune.css
- /css/features/fortune-result.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/core/service-base.js
- /js/features/fortune/fortune-service.js
- /js/features/fortune/saju-fortune.js
- /js/utils/manseryeok.js
```

#### 디자인 시스템 사용
- ✅ 생년월일시 폼
- ✅ 사주 팔자 표
- ✅ 오행 차트
- ✅ 해석 아코디언

#### API 연동
```javascript
// 만세력 계산 API
POST /api/manseryeok
{
  year, month, day, hour,
  isLunar: boolean
}

// AI 해석 API
POST /api/fortune
{
  type: "saju",
  userData: { ... },
  sajuData: { ... }
}
```

---

### 18. AI 타로 (/fortune/tarot/)
**파일**: `fortune/tarot/index.html`

#### 특징
- 질문 입력
- 스프레드 선택 (1장, 3장, 켈틱크로스)
- 카드 선택 애니메이션
- AI 해석

#### 연결된 CSS
```css
- /css/main.css
- /css/features/tarot-fortune.css
- /css/features/tarot-specific.css
- /css/features/fortune-result.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/core/service-base.js
- /js/features/fortune/fortune-service.js
- /js/features/fortune/tarot-fortune.js
```

#### 디자인 시스템 사용
- ✅ 텍스트 입력
- ✅ 라디오 선택
- ✅ 카드 뒤집기 애니메이션
- ✅ 카드 레이아웃 (스프레드별)

#### 데이터 구조
```javascript
{
  majorArcana: [
    {
      id: 0,
      name: "바보",
      emoji: "🤡",
      meaning: {
        upright: "새로운 시작...",
        reversed: "무모함..."
      }
    }
    // ... 22장
  ]
}
```

---

### 19. 별자리 운세 (/fortune/zodiac/)
**파일**: `fortune/zodiac/index.html`

#### 특징
- 12개 별자리 선택
- 오늘의 별자리 운세
- 행운의 색상/숫자
- 궁합 별자리

#### 연결된 CSS
```css
- /css/main.css
- /css/features/zodiac-fortune.css
- /css/features/fortune-result.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/core/service-base.js
- /js/features/fortune/fortune-service.js
- /js/features/fortune/zodiac-fortune.js
```

#### 디자인 시스템 사용
- ✅ 별자리 선택 그리드
- ✅ 아이콘 버튼
- ✅ 운세 결과 카드
- ✅ 궁합 표시

---

### 20. 띠별 운세 (/fortune/zodiac-animal/)
**파일**: `fortune/zodiac-animal/index.html`

#### 특징
- 12지신 동물 선택
- 띠별 운세
- 연도별 자동 계산
- 띠별 특성

#### 연결된 CSS
```css
- /css/main.css
- /css/features/zodiac-animal-fortune.css
- /css/features/fortune-result.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
- /js/core/service-base.js
- /js/features/fortune/fortune-service.js
- /js/features/fortune/zodiac-animal-fortune.js
```

#### 디자인 시스템 사용
- ✅ 동물 이모지 버튼
- ✅ 연도 입력 (자동 띠 계산)
- ✅ 운세 결과 카드

---

### 21. 404 에러 페이지 (/404.html)
**파일**: `404.html`

#### 특징
- 친근한 에러 메시지
- 홈으로 돌아가기 버튼
- 인기 서비스 추천

#### 연결된 CSS
```css
- /css/main.css
- /css/pages/404.css
```

#### 연결된 JavaScript
```javascript
- /js/core/common-init.js
```

#### 디자인 시스템 사용
- ✅ 일러스트레이션
- ✅ CTA 버튼
- ✅ 추천 카드

---

### 22. 서비스 워커 (sw.js)
**파일**: `sw.js`

#### 특징
- 오프라인 지원
- 캐시 전략
- 백그라운드 동기화

#### 캐시 전략
```javascript
const CACHE_NAME = 'doha-kr-v1';
const urlsToCache = [
  '/',
  '/css/main.css',
  '/js/core/common-init.js',
  '/offline.html'
];
```

---

### 23. 오프라인 페이지 (/offline.html)
**파일**: `offline.html`

#### 특징
- 오프라인 상태 안내
- 캐시된 페이지 목록
- 연결 재시도 버튼

#### 연결된 CSS
```css
- /css/main.css (캐시된 버전)
- /css/pages/offline.css
```

---

### 24. 매니페스트 (manifest.json)
**파일**: `manifest.json`

#### PWA 설정
```json
{
  "name": "doha.kr - 일상을 더 재미있게",
  "short_name": "doha.kr",
  "description": "심리테스트, AI운세, 실용도구",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#5c5ce0",
  "icons": [
    {
      "src": "/images/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/images/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

### 25. 로봇 파일 (robots.txt)
**파일**: `robots.txt`

#### SEO 설정
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /tools/*.js
Disallow: /tests/backup/

Sitemap: https://doha.kr/sitemap.xml
```

---

### 26. 사이트맵 (sitemap.xml)
**파일**: `sitemap.xml`

#### 구조
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://doha.kr/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://doha.kr/tests/mbti/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- ... 모든 페이지 ... -->
</urlset>
```

---

## 공통 컴포넌트

### 네비게이션 바
**파일**: `/js/features/navigation.js`

#### 구조
```html
<nav class="navbar">
  <div class="navbar-container">
    <a href="/" class="navbar-brand">doha.kr</a>
    <button class="navbar-toggle">메뉴</button>
    <ul class="navbar-nav">
      <li><a href="/">홈</a></li>
      <li class="dropdown">
        <a href="/tests/">심리테스트</a>
        <ul class="dropdown-menu">
          <li><a href="/tests/mbti/">MBTI</a></li>
          <!-- ... -->
        </ul>
      </li>
      <!-- ... -->
    </ul>
  </div>
</nav>
```

### 푸터
**파일**: `/js/features/footer.js`

#### 구조
```html
<footer class="footer">
  <div class="footer-container">
    <div class="footer-grid">
      <div class="footer-section">
        <h3>서비스</h3>
        <!-- 링크 목록 -->
      </div>
      <!-- ... -->
    </div>
    <div class="footer-bottom">
      <p>© 2025 doha.kr. All rights reserved.</p>
    </div>
  </div>
</footer>
```

---

## API 및 서버리스 함수

### 1. Fortune API
**파일**: `/api/fortune.js`

#### 엔드포인트
```
POST https://doha.kr/api/fortune
```

#### 요청 형식
```javascript
{
  type: "daily" | "saju" | "tarot" | "zodiac" | "zodiac-animal",
  userData: {
    // 타입별 필요 데이터
  }
}
```

#### 응답 형식
```javascript
{
  success: boolean,
  data: {
    fortune: string,
    details: object
  },
  error?: string
}
```

### 2. 만세력 API
**파일**: `/api/manseryeok.js`

#### 엔드포인트
```
POST https://doha.kr/api/manseryeok
```

#### 요청 형식
```javascript
{
  year: number,
  month: number,
  day: number,
  hour: number,
  isLunar: boolean
}
```

---

## 배포 및 호스팅

### GitHub Pages (정적 사이트)
- 저장소: `doha1003/teste`
- 브랜치: `main`
- 도메인: `doha.kr`
- SSL: 자동 (Let's Encrypt)

### Vercel (API)
- 프로젝트: `doha-kr`
- 리전: `icn1` (서울)
- 환경변수:
  - `GEMINI_API_KEY`
  - `ALLOWED_ORIGINS`

### GitHub Actions
- 자동 배포 워크플로우
- Lighthouse CI 통합
- 의존성 업데이트 자동화

---

## 성능 최적화

### 이미지 최적화
- WebP 형식 사용
- 반응형 이미지 (`srcset`)
- Lazy loading

### CSS 최적화
- Critical CSS 인라인
- 미사용 CSS 제거
- Minification

### JavaScript 최적화
- 코드 분할
- Tree shaking
- 지연 로딩

### 캐싱 전략
- Service Worker 캐싱
- HTTP 캐시 헤더
- CDN 활용

---

## 접근성

### WCAG 2.1 AA 준수
- 적절한 색상 대비
- 키보드 네비게이션
- 스크린 리더 지원
- ARIA 레이블

### 한국어 최적화
- Pretendard 폰트
- `word-break: keep-all`
- 적절한 줄 높이 (1.7)
- 한국어 문맥 고려

---

## 보안

### Content Security Policy
```
default-src 'self' https:;
script-src 'self' https://pagead2.googlesyndication.com;
style-src 'self' https://fonts.googleapis.com;
```

### 기타 보안 헤더
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin

### API 보안
- Rate limiting
- CORS 설정
- API 키 환경변수

---

## 모니터링 및 분석

### Google Analytics
- 페이지뷰 추적
- 이벤트 추적
- 사용자 흐름 분석

### 에러 모니터링
- JavaScript 에러 로깅
- API 에러 추적
- 성능 메트릭

### A/B 테스팅
- Google Optimize 통합
- 변환율 최적화
- 사용자 경험 개선