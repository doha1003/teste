# doha.kr - 일상을 더 재미있게 만드는 공간

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/deployed-GitHub%20Pages-green.svg)](https://doha.kr)
[![PWA](https://img.shields.io/badge/PWA-ready-orange.svg)](https://doha.kr)

한국어 사용자를 위한 종합 엔터테인먼트 및 유틸리티 웹 플랫폼입니다. 심리테스트, AI 운세, 실용적인 도구들을 제공합니다.

## 🌟 주요 기능

### 🧩 심리테스트
- **MBTI 성격유형 검사** - 60문항 정밀 분석
- **테토-에겐 테스트** - 10문항 간단 성격 테스트
- **러브 DNA 테스트** - 30문항 연애 스타일 분석

### 🔮 AI 운세
- **오늘의 운세** - 생년월일시 기반 AI 분석
- **사주팔자** - 전통 만세력 + AI 해석
- **타로 카드** - 1장/3장/켈틱크로스 스프레드
- **별자리 운세** - 12별자리별 일일 운세
- **띠별 운세** - 12지신 동물별 운세

### 🛠️ 실용 도구
- **글자수 세기** - 공백 포함/제외, 바이트 계산
- **BMI 계산기** - 체질량지수 분석 및 건강 조언
- **연봉 계산기** - 4대보험, 세금 계산 (2025년 기준)

## 🚀 기술 스택

### Frontend
- **HTML5** - 시맨틱 마크업, 접근성 준수
- **CSS3** - 모듈형 아키텍처, CSS Variables
- **JavaScript** - ES6+, 모듈 시스템
- **PWA** - Service Worker, 오프라인 지원

### Backend & API
- **Vercel Functions** - 서버리스 API
- **Gemini API** - AI 운세 생성
- **자체 만세력 API** - 정확한 사주 계산

### 인프라
- **GitHub Pages** - 정적 사이트 호스팅
- **Vercel** - API 및 서버리스 함수
- **Cloudflare** - DNS 및 보안
- **Google Analytics** - 사용자 분석

## 📁 프로젝트 구조

```
doha.kr/
├── 📄 index.html              # 메인 페이지
├── 📁 api/                    # Vercel 서버리스 함수
│   ├── fortune.js            # AI 운세 API
│   └── manseryeok.js         # 만세력 계산 API
├── 📁 css/                    # 스타일시트
│   ├── main.css              # 메인 진입점
│   ├── korean-optimization.css # 한글 최적화
│   ├── core/                 # 기본 스타일
│   ├── layout/               # 레이아웃
│   ├── components/           # 재사용 컴포넌트
│   └── features/             # 기능별 스타일
├── 📁 js/                     # JavaScript
│   ├── core/                 # 핵심 기능
│   ├── features/             # 기능별 모듈
│   └── pages/                # 페이지별 스크립트
├── 📁 tests/                  # 심리테스트 페이지
├── 📁 fortune/                # 운세 페이지
├── 📁 tools/                  # 도구 페이지
├── 📄 manifest.json           # PWA 설정
├── 📄 sw.js                   # Service Worker
└── 📄 sitemap.xml             # SEO 사이트맵
```

## 🎨 디자인 시스템

### Linear.app 기반 디자인 언어 v2.0
모던하고 깔끔한 UI/UX를 위해 Linear.app의 디자인 철학을 적용했습니다.

#### 핵심 원칙
- **명확성** - 직관적이고 이해하기 쉬운 인터페이스
- **일관성** - 통일된 디자인 토큰과 컴포넌트
- **반응성** - 모든 기기에서 완벽한 경험
- **접근성** - WCAG 2.1 AA 준수

#### 디자인 토큰
```css
/* 색상 시스템 */
--color-primary: #5c5ce0;
--color-secondary: #3b82f6;

/* 간격 (8px 그리드) */
--spacing-md: 16px;
--spacing-lg: 24px;

/* 타이포그래피 */
--font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
```

## 🇰🇷 한글 최적화

### 타이포그래피
- **Pretendard** 폰트 - 가독성 최적화
- **word-break: keep-all** - 자연스러운 줄바꿈
- **line-height: 1.7** - 편안한 읽기 경험

### 문화적 고려사항
- 한국식 날짜 형식 (YYYY년 MM월 DD일)
- 음력/양력 변환 지원
- 전통 사주팔자 체계 적용

## 🚀 빠른 시작

### 개발 환경 설정
```bash
# 저장소 클론
git clone https://github.com/doha1003/teste.git
cd teste

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 주요 명령어
```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run format       # 코드 포맷팅
npm run lint         # 코드 품질 검사
npm run test         # 테스트 실행
```

## 📊 성능 최적화

### Lighthouse 점수 (목표)
- ⚡ **Performance**: 90+
- ♿ **Accessibility**: 95+
- 🔍 **SEO**: 100
- 📱 **PWA**: 100

### 최적화 전략

#### CSS 번들링 (2025년 7월 구현)
- **이전**: 52개의 개별 CSS 파일 요청
- **이후**: 1개의 번들 파일로 통합
- **개선 효과**:
  - 네트워크 요청 96% 감소 (52 → 2)
  - 로딩 시간 ~480ms 단축
  - 프로덕션 빌드 28.7% 압축

```bash
# CSS 번들 생성
npm run build:css

# 생성되는 파일
dist/styles.css      # 개발용 (소스맵 포함)
dist/styles.min.css  # 프로덕션용 (최적화됨)
```

#### 기타 최적화
- Critical CSS 인라인 처리
- 이미지 지연 로딩 (Lazy Loading)
- Service Worker 캐싱
- 코드 분할 및 번들 최적화
- CDN 활용

## 🛡️ 보안

### Content Security Policy
```
default-src 'self' https:;
script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
```

### API 보안
- Rate Limiting - IP당 분당 60회 제한
- CORS 설정 - 허용된 도메인만 접근
- 환경 변수 - 민감한 정보 보호

## 🤝 기여하기

프로젝트에 기여하고 싶으신가요? 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 코드 스타일 가이드
- **HTML**: 시맨틱 태그 사용, 접근성 속성 필수
- **CSS**: BEM 방법론, 모듈형 구조
- **JavaScript**: ES6+, 함수형 프로그래밍 선호
- **한글**: 맞춤법 검사, 적절한 존댓말 사용

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👥 팀

- **개발** - [@doha1003](https://github.com/doha1003)
- **디자인** - Linear.app 디자인 시스템 기반
- **AI 지원** - Claude (Anthropic)

## 📞 문의

- **이메일**: youtubdoha@gmail.com
- **웹사이트**: [https://doha.kr](https://doha.kr)
- **이슈**: [GitHub Issues](https://github.com/doha1003/teste/issues)

---

<div align="center">
  Made with ❤️ in Korea
</div>