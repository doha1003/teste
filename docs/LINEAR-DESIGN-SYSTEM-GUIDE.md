# doha.kr Linear Design System 재설계 가이드

## 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [현재 상태 분석](#2-현재-상태-분석)
3. [디자인 시스템 아키텍처](#3-디자인-시스템-아키텍처)
4. [구현 가이드라인](#4-구현-가이드라인)
5. [서비스별 구현 전략](#5-서비스별-구현-전략)
6. [마이그레이션 로드맵](#6-마이그레이션-로드맵)
7. [코드 표준화 규칙](#7-코드-표준화-규칙)
8. [체크리스트](#8-체크리스트)

---

## 1. 프로젝트 개요

### 목표
- Linear.app 디자인 언어를 기반으로 한 현대적이고 일관된 UI 시스템 구축
- 각 서비스의 고유한 특성을 유지하면서 통일된 사용자 경험 제공
- 확장 가능하고 유지보수가 쉬운 컴포넌트 기반 아키텍처

### 핵심 원칙
1. **일관성**: 모든 서비스에서 동일한 디자인 언어 사용
2. **모듈성**: 재사용 가능한 컴포넌트와 독립적인 서비스 모듈
3. **유연성**: 각 서비스의 고유한 요구사항 수용
4. **성능**: 최적화된 로딩과 렌더링
5. **접근성**: 모든 사용자를 위한 포용적 디자인

---

## 2. 현재 상태 분석

### 서비스 구조
```
doha.kr
├── 심리테스트 (3개 - 각각 다른 구조)
│   ├── MBTI: 60개 질문, 16가지 결과
│   ├── 사랑 DNA: 20개 질문, 4가지 유형
│   └── 테토-에겐: 12개 질문, 4가지 캐릭터
│
├── 운세 (5개 - 각각 다른 형식)
│   ├── 일일 운세: AI 기반 개인화
│   ├── 사주: 생년월일시 기반 복잡한 계산
│   ├── 타로: 카드 선택 인터랙션
│   ├── 별자리: 12개 별자리별 운세
│   └── 띠 운세: 12띠별 연간 운세
│
└── 실용도구 (3개 - 완전히 다른 기능)
    ├── BMI 계산기: 시각적 건강 지표
    ├── 연봉 계산기: 한국 세금 계산
    └── 글자수 세기: 실시간 텍스트 분석
```

---

## 3. 디자인 시스템 아키텍처

### 3.1 디렉토리 구조
```
doha-linear/
├── core/                           # 핵심 디자인 시스템
│   ├── tokens/
│   │   ├── colors.css             # 색상 토큰
│   │   ├── typography.css         # 타이포그래피 토큰
│   │   ├── spacing.css            # 간격 시스템
│   │   ├── shadows.css            # 그림자 효과
│   │   ├── animations.css         # 애니메이션
│   │   └── index.css              # 토큰 통합
│   │
│   ├── components/
│   │   ├── base/                  # 기본 컴포넌트
│   │   │   ├── button.css
│   │   │   ├── card.css
│   │   │   ├── input.css
│   │   │   └── index.css
│   │   ├── layout/                # 레이아웃 컴포넌트
│   │   │   ├── navigation.css
│   │   │   ├── container.css
│   │   │   └── grid.css
│   │   └── patterns/              # 복합 패턴
│   │       ├── service-card.css
│   │       └── result-display.css
│   │
│   └── utilities/
│       ├── reset.css              # CSS 리셋
│       ├── helpers.css            # 유틸리티 클래스
│       └── korean.css             # 한국어 최적화
│
├── services/                       # 서비스별 모듈
│   ├── tests/
│   │   ├── shared/                # 테스트 공통 요소
│   │   │   ├── test-interface.js
│   │   │   └── test-styles.css
│   │   ├── mbti/
│   │   ├── love-dna/
│   │   └── teto-egen/
│   │
│   ├── fortune/
│   │   ├── shared/                # 운세 공통 요소
│   │   ├── daily/
│   │   ├── saju/
│   │   ├── tarot/
│   │   ├── zodiac/
│   │   └── animal/
│   │
│   └── tools/
│       ├── bmi/
│       ├── salary/
│       └── text-counter/
│
├── shared/                         # 공유 리소스
│   ├── js/
│   │   ├── theme-manager.js      # 테마 관리
│   │   ├── api-client.js         # API 통신
│   │   └── analytics.js          # 분석 도구
│   └── assets/
│       ├── fonts/
│       └── images/
│
└── pages/                          # 실제 HTML 페이지
    ├── index.html                 # 홈페이지
    ├── tests/
    ├── fortune/
    └── tools/
```

### 3.2 CSS 아키텍처 (BEM + Atomic Design)
```css
/* 컴포넌트 명명 규칙 */
.linear-[component]                 /* 기본 컴포넌트 */
.linear-[component]--[modifier]     /* 변형 */
.linear-[component]__[element]      /* 하위 요소 */

/* 서비스별 명명 규칙 */
.service-[name]                     /* 서비스 컨테이너 */
.service-[name]__[element]          /* 서비스 요소 */

/* 예시 */
.linear-button
.linear-button--primary
.linear-button__icon

.service-mbti
.service-mbti__question-slider
```

---

## 4. 구현 가이드라인

### 4.1 HTML 구조 표준
```html
<!DOCTYPE html>
<html lang="ko" data-theme="system">
<head>
    <!-- 필수 메타 태그 -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO -->
    <title>[서비스명] - doha.kr</title>
    <meta name="description" content="[서비스 설명]">
    
    <!-- 디자인 시스템 CSS -->
    <link rel="stylesheet" href="/core/tokens/index.css">
    <link rel="stylesheet" href="/core/components/base/index.css">
    
    <!-- 서비스별 CSS -->
    <link rel="stylesheet" href="/services/[service]/styles.css">
</head>
<body>
    <!-- 공통 네비게이션 -->
    <nav class="linear-nav" data-include="/shared/navigation.html"></nav>
    
    <!-- 서비스 컨텐츠 -->
    <main class="service-[name]">
        <!-- 서비스별 콘텐츠 -->
    </main>
    
    <!-- 공통 푸터 -->
    <footer class="linear-footer" data-include="/shared/footer.html"></footer>
    
    <!-- 공통 JS -->
    <script type="module" src="/shared/js/core.js"></script>
    
    <!-- 서비스별 JS -->
    <script type="module" src="/services/[service]/app.js"></script>
</body>
</html>
```

### 4.2 CSS 작성 규칙
```css
/* 1. CSS Custom Properties 활용 */
.service-mbti {
    background: var(--color-bg-primary);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
}

/* 2. 모바일 우선 반응형 */
.service-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
}

@media (min-width: 768px) {
    .service-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .service-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* 3. 한국어 최적화 */
.korean-text {
    word-break: keep-all;
    line-height: 1.7;
    font-feature-settings: 'kern' 1;
}

/* 4. 애니메이션 성능 최적화 */
.animated-element {
    will-change: transform;
    transform: translateZ(0); /* GPU 가속 */
}
```

### 4.3 JavaScript 모듈 구조
```javascript
// core/js/base-component.js
export class BaseComponent {
    constructor(element, options = {}) {
        this.element = element;
        this.options = { ...this.defaultOptions, ...options };
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.render();
    }
    
    bindEvents() {
        // 이벤트 바인딩
    }
    
    render() {
        // 렌더링 로직
    }
}

// services/tests/mbti/components/question-card.js
import { BaseComponent } from '/core/js/base-component.js';

export class MBTIQuestionCard extends BaseComponent {
    get defaultOptions() {
        return {
            animationDuration: 300,
            questionType: 'scale' // scale, binary
        };
    }
    
    render() {
        this.element.innerHTML = `
            <div class="mbti-question">
                <h3 class="mbti-question__text">${this.options.question}</h3>
                <div class="mbti-question__scale">
                    <!-- 슬라이더 UI -->
                </div>
            </div>
        `;
    }
}
```

---

## 5. 서비스별 구현 전략

### 5.1 심리테스트 구현
```javascript
// services/tests/shared/test-interface.js
export class TestInterface {
    constructor(config) {
        this.questions = config.questions;
        this.currentQuestion = 0;
        this.answers = [];
        this.resultCalculator = config.resultCalculator;
        this.ui = config.ui;
    }
    
    start() {
        this.ui.showQuestion(this.questions[0]);
    }
    
    answerQuestion(answer) {
        this.answers.push(answer);
        this.currentQuestion++;
        
        if (this.currentQuestion < this.questions.length) {
            this.ui.showQuestion(this.questions[this.currentQuestion]);
        } else {
            this.showResult();
        }
    }
    
    showResult() {
        const result = this.resultCalculator(this.answers);
        this.ui.showResult(result);
    }
}

// services/tests/mbti/app.js
import { TestInterface } from '../shared/test-interface.js';
import { mbtiQuestions } from './data/questions.js';
import { calculateMBTI } from './logic/calculator.js';
import { MBTIUI } from './ui/mbti-ui.js';

const mbtiTest = new TestInterface({
    questions: mbtiQuestions,
    resultCalculator: calculateMBTI,
    ui: new MBTIUI()
});

// 시작
document.getElementById('start-test').addEventListener('click', () => {
    mbtiTest.start();
});
```

### 5.2 운세 서비스 구현
```javascript
// services/fortune/daily/app.js
export class DailyFortune {
    constructor() {
        this.form = document.getElementById('fortune-form');
        this.resultArea = document.getElementById('fortune-result');
    }
    
    async getFortune(userData) {
        try {
            const response = await fetch('/api/fortune', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            const fortune = await response.json();
            this.displayFortune(fortune);
        } catch (error) {
            this.handleError(error);
        }
    }
    
    displayFortune(fortune) {
        this.resultArea.innerHTML = `
            <div class="fortune-result">
                <h2 class="fortune-result__title">오늘의 운세</h2>
                <div class="fortune-result__content">${fortune.content}</div>
                <div class="fortune-result__advice">${fortune.advice}</div>
            </div>
        `;
    }
}
```

### 5.3 도구 서비스 구현
```javascript
// services/tools/bmi/app.js
export class BMICalculator {
    constructor() {
        this.heightInput = document.getElementById('height');
        this.weightInput = document.getElementById('weight');
        this.resultDisplay = document.getElementById('bmi-result');
        this.chart = null;
        
        this.init();
    }
    
    init() {
        // 실시간 계산
        [this.heightInput, this.weightInput].forEach(input => {
            input.addEventListener('input', () => this.calculate());
        });
    }
    
    calculate() {
        const height = parseFloat(this.heightInput.value) / 100;
        const weight = parseFloat(this.weightInput.value);
        
        if (height && weight) {
            const bmi = weight / (height * height);
            this.displayResult(bmi);
            this.updateChart(bmi);
        }
    }
    
    displayResult(bmi) {
        const category = this.getCategory(bmi);
        this.resultDisplay.innerHTML = `
            <div class="bmi-result">
                <div class="bmi-result__number">${bmi.toFixed(1)}</div>
                <div class="bmi-result__category ${category.class}">
                    ${category.text}
                </div>
            </div>
        `;
    }
}
```

---

## 6. 마이그레이션 로드맵

### Phase 1: 기초 설정 (1주차)
- [ ] 디자인 토큰 정의 (colors, typography, spacing)
- [ ] 기본 컴포넌트 개발 (button, card, input)
- [ ] 레이아웃 시스템 구축
- [ ] 스타일 가이드 문서 작성

### Phase 2: 공통 요소 (2주차)
- [ ] 네비게이션 컴포넌트
- [ ] 푸터 컴포넌트
- [ ] 테마 전환 시스템
- [ ] 공통 유틸리티 함수

### Phase 3: 서비스 마이그레이션 (3-5주차)
#### 3.1 심리테스트
- [ ] 테스트 공통 인터페이스 개발
- [ ] MBTI 테스트 마이그레이션
- [ ] 사랑 DNA 테스트 마이그레이션
- [ ] 테토-에겐 테스트 마이그레이션

#### 3.2 운세
- [ ] 운세 공통 레이아웃
- [ ] 일일 운세 (AI 통합)
- [ ] 타로 카드 (인터랙션)
- [ ] 사주 (계산 로직)
- [ ] 별자리/띠 운세

#### 3.3 도구
- [ ] BMI 계산기 (차트 UI)
- [ ] 연봉 계산기 (테이블)
- [ ] 글자수 세기 (실시간)

### Phase 4: 최적화 (6주차)
- [ ] 성능 최적화
- [ ] SEO 최적화
- [ ] 접근성 검증
- [ ] 크로스 브라우저 테스트

---

## 7. 코드 표준화 규칙

### 7.1 명명 규칙
```javascript
// JavaScript
// 클래스: PascalCase
class ServiceManager {}

// 함수/변수: camelCase
function calculateResult() {}
const userAnswer = 5;

// 상수: UPPER_SNAKE_CASE
const MAX_QUESTIONS = 60;

// 파일명: kebab-case
// mbti-calculator.js
// test-interface.js
```

### 7.2 파일 구조 템플릿
```javascript
// 모든 JS 파일 상단
/**
 * @file [파일 설명]
 * @module [모듈명]
 * @version 1.0.0
 */

// 모든 CSS 파일 상단
/**
 * [컴포넌트/페이지명] 스타일
 * 
 * 구조:
 * - [설명]
 */
```

### 7.3 컴포넌트 문서화
```javascript
/**
 * MBTI 질문 카드 컴포넌트
 * @class MBTIQuestionCard
 * @extends BaseComponent
 * 
 * @param {HTMLElement} element - 컴포넌트 루트 요소
 * @param {Object} options - 설정 옵션
 * @param {string} options.question - 질문 텍스트
 * @param {string} options.type - 질문 유형 (scale|binary)
 * 
 * @example
 * const card = new MBTIQuestionCard(element, {
 *   question: "사람들과 어울리는 것을 좋아하나요?",
 *   type: "scale"
 * });
 */
```

---

## 8. 체크리스트

### 개발 전 체크리스트
- [ ] 디자인 토큰이 정의되어 있는가?
- [ ] 컴포넌트가 이미 존재하는가?
- [ ] 재사용 가능한 구조인가?
- [ ] 한국어 최적화가 필요한가?

### 개발 중 체크리스트
- [ ] BEM 명명 규칙을 따르고 있는가?
- [ ] CSS Custom Properties를 사용하는가?
- [ ] 모바일 우선 반응형인가?
- [ ] 적절히 주석이 달려 있는가?

### 개발 후 체크리스트
- [ ] 크로스 브라우저 테스트 완료
- [ ] 접근성 검증 완료
- [ ] 성능 최적화 완료
- [ ] 문서화 완료

### 품질 기준
- Lighthouse 점수: 90+ (모든 카테고리)
- 모바일 반응 속도: < 3초
- 접근성: WCAG 2.1 AA 준수
- 브라우저 지원: Chrome, Safari, Firefox, Edge 최신 2개 버전

---

## 부록: 자주 사용하는 코드 스니펫

### A. 서비스 페이지 템플릿
```html
<!-- services/[service-name]/index.html -->
<!DOCTYPE html>
<html lang="ko" data-theme="system">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[서비스명] - doha.kr</title>
    
    <!-- Core CSS -->
    <link rel="stylesheet" href="/core/index.css">
    <!-- Service CSS -->
    <link rel="stylesheet" href="./styles.css">
</head>
<body>
    <div id="app" class="service-[name]">
        <!-- Content -->
    </div>
    
    <!-- Core JS -->
    <script type="module" src="/core/app.js"></script>
    <!-- Service JS -->
    <script type="module" src="./app.js"></script>
</body>
</html>
```

### B. 컴포넌트 템플릿
```javascript
// components/[component-name].js
import { BaseComponent } from '/core/base-component.js';

export class ComponentName extends BaseComponent {
    static get selector() {
        return '[data-component="component-name"]';
    }
    
    get defaultOptions() {
        return {
            // 기본 옵션
        };
    }
    
    init() {
        super.init();
        // 초기화 로직
    }
    
    bindEvents() {
        // 이벤트 바인딩
    }
    
    render() {
        // 렌더링 로직
    }
}

// 자동 초기화
document.querySelectorAll(ComponentName.selector).forEach(el => {
    new ComponentName(el);
});
```

### C. API 호출 템플릿
```javascript
// services/[service]/api.js
export class ServiceAPI {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
    }
    
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }
}
```

이 가이드를 따라 개발하면 일관성 있고 확장 가능한 Linear Design System 기반의 doha.kr을 구축할 수 있습니다.