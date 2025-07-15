# 🎯 doha.kr - 일상을 더 재미있게 만드는 공간

[![Website](https://img.shields.io/badge/Website-doha.kr-blue)](https://doha.kr)
[![GitHub Pages](https://img.shields.io/badge/Powered%20by-GitHub%20Pages-green)](https://pages.github.com/)
[![Vercel](https://img.shields.io/badge/API-Vercel-black)](https://vercel.com)
[![Last Updated](https://img.shields.io/badge/Last%20Updated-2025--07--14-brightgreen)](https://github.com/doha1003/teste)

> 심리테스트, AI 운세, 실용도구가 한곳에! 재미있고 유용한 무료 서비스를 제공하는 종합 엔터테인먼트 플랫폼입니다.

## 🔧 웹사이트 분석 도구

이 프로젝트에는 GPT-4o Vision API를 사용한 웹사이트 분석 도구가 포함되어 있습니다.

### 사용법
```bash
# 1. OpenAI API 키 설정
export OPENAI_API_KEY=your_api_key_here

# 2. 전체 분석 파이프라인 실행
bash run_analysis.sh

# 또는 개별 실행
npm run capture              # 웹사이트 스크린샷 캡처
python3 analyze_image.py    # GPT-4o Vision 이미지 분석
python3 analyze_without_image.py  # 구조 기반 개선 방안 생성
```

### 분석 결과 파일
- `screenshot.png`: 웹사이트 전체 스크린샷
- `analysis_result.txt`: GPT-4o Vision API 분석 결과
- `improvement_plan.txt`: 구조 기반 개선 방안
- `IMPROVEMENT_PLAN.md`: 단계별 상세 개선 계획서

## 📋 목차

- [웹사이트 분석 도구](#-웹사이트-분석-도구)
- [주요 기능](#-주요-기능)
- [프로젝트 구조](#-프로젝트-구조)
- [기술 스택](#-기술-스택)
- [만세력 데이터베이스](#-만세력-데이터베이스)
- [설치 및 실행](#-설치-및-실행)
- [배포 설정](#-배포-설정)
- [CSS 아키텍처](#-css-아키텍처)
- [API 문서](#-api-문서)
- [성능 지표](#-성능-지표)
- [기여하기](#-기여하기)

## 🌟 주요 기능

### 🧠 심리테스트 (3종)
- **MBTI 성격유형 검사**: 24문항 + 상세 결과 (16개 유형별 맞춤 분석)
- **테토-에겐 테스트**: 일본의 인기 성격유형 검사 (4가지 유형)
- **Love DNA 테스트**: 5축 연애 성향 분석 (DNA 방식 결과)

### 🔮 AI 운세 (5종) - Gemini API 활용
- **🌅 일일 운세**: 생년월일 기반 개인 맞춤 운세 (만세력 연동)
- **🎴 AI 사주팔자**: 생년월일시 + 만세력 SQL로 정확한 사주 분석
- **🃏 AI 타로**: 3장/5장 카드 스프레드 타로 점술
- **⭐ 별자리 운세**: 12개 별자리별 맞춤 운세
- **🐲 띠별 운세**: 12지신 동물별 년간/월간 운세

### 🛠 실용도구 (3종)
- **📝 글자수 세기**: 실시간 문자/단어/문단/바이트 카운팅
- **🏃 BMI 계산기**: 체질량지수 + 건강 상태 분석 + 권장사항
- **💰 연봉 계산기**: 2025년 세법 기준 실수령액 계산

### 📱 PWA & 추가 기능
- **오프라인 지원**: Service Worker 캐싱
- **앱 설치 가능**: 모바일 홈화면 추가
- **카카오톡 공유**: 결과 공유 기능
- **반응형 디자인**: 모든 기기 최적화

## 🏗 프로젝트 구조

```
doha.kr/ (총 30+ 페이지, 50+ JS 파일, 18개 CSS 파일)
├── 📁 api/                      # Vercel 서버리스 함수
│   ├── fortune.js              # Gemini API 운세 생성 엔진
│   └── saju.js                 # 만세력 연동 사주 계산 API
├── 📁 css/                     # 통합 CSS 아키텍처
│   ├── styles.css             # 통합 메인 스타일시트 (92KB)
│   ├── variables.css          # CSS 변수 및 테마
│   ├── base.css              # 기본 리셋 스타일
│   ├── components.css        # 공통 컴포넌트
│   └── pages/                # 페이지별 전용 CSS (12개)
│       ├── mbti-test.css    # MBTI 테스트 전용
│       ├── love-dna-test.css # Love DNA 테스트 전용
│       ├── teto-egen-test.css # 테토-에겐 테스트 전용
│       ├── fortune-main.css  # 운세 메인 페이지
│       ├── text-counter.css  # 글자수 세기 도구
│       ├── bmi-calculator.css # BMI 계산기
│       └── salary-calculator.css # 연봉 계산기
├── 📁 js/                      # JavaScript 모듈
│   ├── main.js               # 컴포넌트 로딩 & 공통 기능
│   ├── gemini-api.js         # Gemini API 클라이언트
│   ├── api-config.js         # API 설정 관리
│   ├── pages/                # 페이지별 스크립트
│   │   ├── mbti-test.js     # MBTI 테스트 로직
│   │   ├── love-dna-test.js # Love DNA 테스트 로직
│   │   └── fortune.js       # 운세 공통 기능
│   └── utils/               # 유틸리티 함수
├── 📁 tests/                   # 심리테스트 모음
│   ├── index.html           # 테스트 목록 페이지
│   ├── mbti/               # MBTI 성격유형 검사
│   │   ├── index.html      # 테스트 소개
│   │   └── test.html       # 테스트 진행
│   ├── teto-egen/          # 테토-에겐 테스트
│   │   ├── index.html      # 테스트 소개
│   │   ├── start.html      # 테스트 시작
│   │   └── test.html       # 테스트 진행
│   └── love-dna/           # Love DNA 테스트
│       ├── index.html      # 테스트 소개
│       ├── test.html       # 테스트 진행
│       └── result.html     # 결과 페이지
├── 📁 fortune/                 # AI 운세 서비스
│   ├── index.html          # 운세 메인 허브
│   ├── daily/              # 오늘의 운세 (만세력 연동)
│   │   └── index.html
│   ├── saju/               # AI 사주팔자 (만세력 SQL)
│   │   └── index.html
│   ├── tarot/              # AI 타로 리딩
│   │   └── index.html
│   ├── zodiac/             # 별자리 운세
│   │   └── index.html
│   └── zodiac-animal/      # 띠별 운세
│       └── index.html
├── 📁 tools/                   # 실용도구 모음
│   ├── index.html          # 도구 목록 페이지
│   ├── text-counter.html   # 글자수 세기 도구
│   ├── bmi-calculator.html # BMI 계산기
│   └── salary-calculator.html # 연봉 계산기
├── 📁 data/                    # 데이터 파일
│   ├── Lunar/              # 음력 변환 데이터
│   │   ├── lunar.js       # 음력 변환 알고리즘
│   │   └── calendar.json  # 음력 달력 데이터
│   ├── saju/               # 사주 계산 데이터
│   │   ├── mansearyeok.sql # 만세력 데이터베이스
│   │   ├── cheongan.js    # 천간 데이터
│   │   ├── jigan.js       # 지간 데이터
│   │   └── saju-calc.js   # 사주 계산 로직
│   └── mbti/               # MBTI 유형 데이터
│       └── types.json     # 16개 유형별 상세 정보
├── 📁 images/                  # 이미지 리소스
│   ├── mbti/               # MBTI 유형별 이미지
│   ├── love-dna/           # Love DNA 결과 이미지
│   ├── teto-egen/          # 테토-에겐 유형 이미지
│   └── fortune/            # 운세 관련 이미지
├── 📁 includes/                # 공통 컴포넌트
│   ├── navbar.html         # 네비게이션 바
│   └── footer.html         # 푸터
├── 📁 about/                   # 정보 페이지
├── 📁 contact/                 # 문의 페이지
├── 📁 privacy/                 # 개인정보처리방침
├── 📁 terms/                   # 이용약관
├── index.html                  # 메인 홈페이지
├── 404.html                   # 에러 페이지
├── offline.html               # 오프라인 페이지
├── manifest.json              # PWA 매니페스트
├── sw.js                      # Service Worker
├── sitemap.xml                # SEO 사이트맵
├── robots.txt                 # 검색엔진 크롤링 설정
└── package.json               # 프로젝트 설정
```

## 💻 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업, PWA 매니페스트, Open Graph
- **CSS3**: CSS Grid/Flexbox, CSS Variables, 모듈식 아키텍처
- **JavaScript (ES6+)**: 모듈 시스템, Fetch API, Local Storage
- **PWA**: Service Worker, Web App Manifest, 오프라인 지원

### AI & 데이터
- **🤖 Google Gemini API**: AI 운세 생성 엔진 (GPT 대안)
- **📊 만세력 SQL 데이터베이스**: 정확한 사주팔자 계산
- **🗓️ 음력 변환**: 양력↔음력 변환 알고리즘
- **📈 Kakao SDK**: 소셜 공유 기능

### 호스팅 & 인프라
- **GitHub Pages**: 정적 사이트 호스팅 (CDN)
- **Vercel**: 서버리스 함수 (API 엔드포인트)
- **Custom Domain**: doha.kr (SSL 인증서 포함)

### 개발 & 분석 도구
- **Google Analytics**: 사용자 행동 분석
- **Google AdSense**: 수익화
- **Lighthouse**: 성능 최적화 (90+ 점수)

## 🔮 만세력 데이터베이스

### 사주팔자 계산 시스템
doha.kr의 AI 사주팔자는 정통 만세력 데이터베이스를 기반으로 합니다:

```sql
-- 만세력 핵심 테이블 구조
CREATE TABLE mansearyeok (
    year INT,           -- 서기 년도
    month INT,          -- 월
    day INT,            -- 일
    hour INT,           -- 시간
    year_cheongan CHAR(1),   -- 년간
    year_jigan CHAR(1),      -- 년지
    month_cheongan CHAR(1),  -- 월간
    month_jigan CHAR(1),     -- 월지
    day_cheongan CHAR(1),    -- 일간
    day_jigan CHAR(1),       -- 일지
    hour_cheongan CHAR(1),   -- 시간
    hour_jigan CHAR(1)       -- 시지
);
```

### 주요 데이터 구성요소

1. **천간(天干) 10개**: 갑(甲), 을(乙), 병(丙), 정(丁), 무(戊), 기(己), 경(庚), 신(辛), 임(壬), 계(癸)
2. **지지(地支) 12개**: 자(子), 축(丑), 인(寅), 묘(卯), 진(辰), 사(巳), 오(午), 미(未), 신(申), 유(酉), 술(戌), 해(亥)
3. **60갑자**: 천간과 지지의 조합으로 60년 주기
4. **24절기**: 정확한 절입 시간 계산
5. **음력 데이터**: 양력↔음력 변환 알고리즘

### AI 연동 프로세스

```javascript
// 사주 계산 흐름
1. 생년월일시 입력 받기
2. 만세력 SQL에서 해당 날짜의 간지 조회
3. 4주(년주, 월주, 일주, 시주) 추출
4. 오행(五行) 분석: 목(木), 화(火), 토(土), 금(金), 수(水)
5. 십신(十神) 분석: 비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인
6. Gemini API로 종합 해석 생성
```

## 🚀 설치 및 실행

### 필수 요구사항
- **Node.js 18+** (LTS 버전 권장)
- **npm 또는 yarn**
- **Google Gemini API 키** (무료 할당량: 60 요청/분)

### 로컬 개발 환경 설정

```bash
# 1. 저장소 클론
git clone https://github.com/doha1003/teste.git
cd teste

# 2. 의존성 설치 (선택사항)
npm install

# 3. 환경 변수 설정
echo "GEMINI_API_KEY=your-gemini-api-key" > .env.local

# 4. 개발 서버 실행
# Option A: Vercel 개발 서버 (API 포함)
npx vercel dev

# Option B: 간단한 정적 서버
npx http-server -p 3000

# Option C: Python 서버
python -m http.server 3000

# 5. 브라우저에서 확인
# http://localhost:3000
```

## 🌐 배포 설정

### GitHub Pages 설정
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Replace API key
      run: |
        sed -i "s/PLACEHOLDER/${{ secrets.GEMINI_API_KEY }}/g" js/gemini-api.js
    - name: Deploy to Pages
      uses: actions/deploy-pages@v4
```

### Vercel 환경 변수
```bash
# Vercel Dashboard → Settings → Environment Variables
GEMINI_API_KEY=your-actual-gemini-api-key
NODE_ENV=production
```

## 🎨 CSS 아키텍처

### 통합 CSS 시스템 (2025-07-14 업데이트)
```css
/* 메인 CSS 로딩 순서 */
1. styles.css (92KB) - 통합 메인 스타일시트
   ├── CSS Variables (색상, 폰트, 간격)
   ├── Reset & Base Styles
   ├── Layout (navbar, footer, grid)
   ├── Components (buttons, cards, forms)
   ├── Sections (hero, features, stats)
   └── Responsive Media Queries

2. 페이지별 CSS (필요시)
   └── css/pages/[page-name].css
```

### CSS 변수 시스템
```css
:root {
  /* 브랜드 컬러 */
  --primary-color: #2563eb;
  --secondary-color: #10b981;
  --accent-color: #8b5cf6;
  
  /* 텍스트 컬러 */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  
  /* 레이아웃 */
  --container-max-width: 1280px;
  --section-padding: 80px 20px;
  
  /* 그라데이션 */
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
```

### 컴포넌트 시스템
- **동적 로딩**: navbar.html, footer.html
- **모듈식 CSS**: 페이지별 충돌 방지
- **반응형 우선**: Mobile-first 접근

## 📚 API 문서

### Fortune API (`/api/fortune`)

#### 일일 운세 요청
```javascript
POST /api/fortune
{
  "type": "daily",
  "data": {
    "birth": "1990-12-25",
    "gender": "male|female"
  }
}
```

#### 사주팔자 요청
```javascript
POST /api/fortune
{
  "type": "saju",
  "data": {
    "birth": "1990-12-25",
    "time": "14:30",
    "lunar": false,
    "gender": "male"
  }
}
```

#### 타로 요청
```javascript
POST /api/fortune
{
  "type": "tarot",
  "data": {
    "question": "연애운이 궁금해요",
    "spread": "3card|5card"
  }
}
```

#### 응답 형식
```javascript
{
  "success": true,
  "data": {
    "title": "오늘의 운세",
    "content": "AI 생성 운세 내용...",
    "lucky_number": [7, 23],
    "lucky_color": "파란색",
    "timestamp": "2025-01-14T12:00:00Z"
  }
}
```

## 📊 성능 지표

### 파일 구성
- **HTML 페이지**: 30개
- **JavaScript 파일**: 50개 (모듈화 완료)
- **CSS 파일**: 18개 (통합 아키텍처)
- **이미지**: 50+ (WebP 최적화)

### Lighthouse 성능 점수
- **Performance**: 92/100
- **SEO**: 98/100
- **Accessibility**: 91/100
- **Best Practices**: 96/100

### 로딩 속도
- **First Contentful Paint**: 1.2초
- **Largest Contentful Paint**: 2.1초
- **Cumulative Layout Shift**: 0.05

## 🤝 기여하기

### 개발 워크플로우
```bash
# 1. Fork & Clone
git clone https://github.com/your-username/teste.git

# 2. Feature 브랜치 생성
git checkout -b feature/새로운-기능

# 3. 개발 & 테스트
npm run dev
npm run test

# 4. 커밋 & 푸시
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin feature/새로운-기능

# 5. Pull Request 생성
```

### 코딩 규칙
- **CSS**: 페이지별 전용 CSS 파일 사용
- **JavaScript**: ES6+ 모듈 문법 준수
- **HTML**: 시맨틱 마크업 & 접근성 고려
- **커밋**: Conventional Commits 규칙 따르기

## 📄 라이선스 & 연락처

**© 2025 doha.kr. All rights reserved.**

- **🌐 웹사이트**: [https://doha.kr](https://doha.kr)
- **📧 문의**: [contact 페이지](https://doha.kr/contact/)
- **🐙 GitHub**: [doha1003/teste](https://github.com/doha1003/teste)

---

*마지막 업데이트: 2025-07-14 - CSS 통합 아키텍처 완료, 만세력 SQL 문서화*