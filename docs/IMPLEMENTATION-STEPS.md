# Linear Design System 구현 단계별 가이드

## 🎯 목표: 일관성 있는 HTML/JS/CSS 재구축

이 문서는 doha.kr을 Linear Design System으로 재구축하기 위한 구체적인 구현 단계를 제공합니다.

---

## 📋 목차
1. [Step 1: 프로젝트 초기 설정](#step-1-프로젝트-초기-설정)
2. [Step 2: 디자인 토큰 구축](#step-2-디자인-토큰-구축)
3. [Step 3: 기본 컴포넌트 개발](#step-3-기본-컴포넌트-개발)
4. [Step 4: 레이아웃 시스템 구축](#step-4-레이아웃-시스템-구축)
5. [Step 5: 서비스 모듈 개발](#step-5-서비스-모듈-개발)
6. [Step 6: 페이지 통합](#step-6-페이지-통합)
7. [Step 7: 테스트 및 최적화](#step-7-테스트-및-최적화)

---

## Step 1: 프로젝트 초기 설정

### 1.1 디렉토리 생성
```bash
# 프로젝트 루트에서 실행
mkdir -p doha-linear/{core,services,shared,pages,docs}
mkdir -p doha-linear/core/{tokens,components,utilities}
mkdir -p doha-linear/services/{tests,fortune,tools}
mkdir -p doha-linear/shared/{js,assets}
```

### 1.2 기본 설정 파일

**package.json**
```json
{
  "name": "doha-linear",
  "version": "2.0.0",
  "description": "doha.kr with Linear Design System",
  "scripts": {
    "dev": "live-server --port=3000",
    "build:css": "postcss core/**/*.css -d dist/css",
    "build:js": "rollup -c",
    "build": "npm run build:css && npm run build:js",
    "format": "prettier --write '**/*.{html,css,js}'",
    "lint": "eslint '**/*.js'"
  },
  "devDependencies": {
    "postcss": "^8.4.31",
    "postcss-cli": "^10.1.0",
    "postcss-import": "^15.1.0",
    "postcss-preset-env": "^9.3.0",
    "rollup": "^4.6.0",
    "prettier": "^3.1.0",
    "eslint": "^8.54.0",
    "live-server": "^1.2.2"
  }
}
```

**postcss.config.js**
```javascript
module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-preset-env')({
      stage: 2,
      features: {
        'custom-properties': {
          preserve: false
        },
        'custom-media-queries': true,
        'nesting-rules': true
      }
    })
  ]
}
```

---

## Step 2: 디자인 토큰 구축

### 2.1 색상 토큰
**core/tokens/colors.css**
```css
:root {
  /* Primary Colors */
  --color-primary-50: #f0f4ff;
  --color-primary-100: #e0e8ff;
  --color-primary-200: #c7d2fe;
  --color-primary-300: #a5b3fc;
  --color-primary-400: #818cf8;
  --color-primary-500: #5e6ad2;
  --color-primary-600: #4c57b6;
  --color-primary-700: #404593;
  --color-primary-800: #333872;
  --color-primary-900: #2a2f5a;
  
  /* Semantic Colors */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #fafbfc;
  --color-bg-tertiary: #f4f5f8;
  
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  
  --color-border-subtle: #e5e7eb;
  --color-border-default: #d1d5db;
  --color-border-strong: #9ca3af;
  
  /* Status Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}

/* Dark Theme */
[data-theme="dark"] {
  --color-bg-primary: #0d0e11;
  --color-bg-secondary: #16181d;
  --color-bg-tertiary: #1e2028;
  
  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
  --color-text-tertiary: #9ca3af;
  
  --color-border-subtle: #2a2b34;
  --color-border-default: #3f4048;
  --color-border-strong: #6b6c77;
}
```

### 2.2 타이포그래피 토큰
**core/tokens/typography.css**
```css
:root {
  /* Font Family */
  --font-sans: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, 
               system-ui, Roboto, "Helvetica Neue", "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", Consolas, monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 1.75;
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Letter Spacing */
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
}

/* Korean Text Optimization */
.korean-text {
  word-break: keep-all;
  line-height: var(--leading-relaxed);
  font-feature-settings: 'kern' 1;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 2.3 간격 시스템
**core/tokens/spacing.css**
```css
:root {
  /* Spacing Scale */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  
  /* Container */
  --container-max: 1280px;
  --container-padding: var(--space-4);
  
  /* Grid */
  --grid-gap: var(--space-4);
}
```

---

## Step 3: 기본 컴포넌트 개발

### 3.1 Button 컴포넌트
**core/components/button.css**
```css
/* Button Base */
.linear-button {
  /* Structure */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  
  /* Typography */
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  
  /* Spacing */
  padding: var(--space-2) var(--space-4);
  
  /* Visual */
  border: 1px solid transparent;
  border-radius: 0.5rem;
  background: transparent;
  
  /* Interaction */
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;
  
  /* States */
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
}

/* Button Variants */
.linear-button--primary {
  background: var(--color-primary-500);
  color: white;
  
  &:hover {
    background: var(--color-primary-600);
  }
}

.linear-button--secondary {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border-color: var(--color-border-default);
  
  &:hover {
    background: var(--color-bg-secondary);
    border-color: var(--color-border-strong);
  }
}

/* Button Sizes */
.linear-button--sm {
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-3);
}

.linear-button--lg {
  font-size: var(--text-base);
  padding: var(--space-3) var(--space-6);
}
```

### 3.2 Card 컴포넌트
**core/components/card.css**
```css
.linear-card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-subtle);
  border-radius: 1rem;
  padding: var(--space-6);
  transition: all 0.2s ease;
}

.linear-card--interactive {
  cursor: pointer;
  
  &:hover {
    border-color: var(--color-border-default);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

.linear-card__header {
  margin-bottom: var(--space-4);
}

.linear-card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.linear-card__description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}
```

### 3.3 컴포넌트 JavaScript 기반 클래스
**core/components/base-component.js**
```javascript
/**
 * Base Component Class
 * 모든 컴포넌트의 기반이 되는 클래스
 */
export class BaseComponent {
  constructor(element, options = {}) {
    if (!element) {
      throw new Error('Component requires an element');
    }
    
    this.element = element;
    this.options = { ...this.constructor.defaultOptions, ...options };
    this.state = {};
    
    this.init();
  }
  
  static get defaultOptions() {
    return {};
  }
  
  init() {
    this.setupDOM();
    this.bindEvents();
    this.render();
  }
  
  setupDOM() {
    // DOM 참조 설정
  }
  
  bindEvents() {
    // 이벤트 리스너 바인딩
  }
  
  render() {
    // 초기 렌더링
  }
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }
  
  destroy() {
    // 클린업
  }
}
```

---

## Step 4: 레이아웃 시스템 구축

### 4.1 Container
**core/components/container.css**
```css
.linear-container {
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.linear-container--fluid {
  max-width: none;
}

.linear-container--narrow {
  max-width: 960px;
}

.linear-container--wide {
  max-width: 1440px;
}
```

### 4.2 Grid System
**core/components/grid.css**
```css
.linear-grid {
  display: grid;
  gap: var(--grid-gap);
}

/* Auto-fit Grid */
.linear-grid--auto {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

/* Responsive Grid */
.linear-grid--responsive {
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .linear-grid--responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .linear-grid--responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Fixed Columns */
.linear-grid--2 { grid-template-columns: repeat(2, 1fr); }
.linear-grid--3 { grid-template-columns: repeat(3, 1fr); }
.linear-grid--4 { grid-template-columns: repeat(4, 1fr); }
```

### 4.3 Navigation Component
**core/components/navigation.js**
```javascript
import { BaseComponent } from './base-component.js';

export class Navigation extends BaseComponent {
  static get defaultOptions() {
    return {
      mobileBreakpoint: 768,
      animationDuration: 300
    };
  }
  
  setupDOM() {
    this.toggle = this.element.querySelector('.linear-nav__toggle');
    this.menu = this.element.querySelector('.linear-nav__menu');
    this.links = this.element.querySelectorAll('.linear-nav__link');
  }
  
  bindEvents() {
    // Mobile toggle
    this.toggle?.addEventListener('click', () => this.toggleMenu());
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.element.contains(e.target)) {
        this.closeMenu();
      }
    });
    
    // Active link
    this.updateActiveLink();
  }
  
  toggleMenu() {
    this.menu.classList.toggle('linear-nav__menu--open');
  }
  
  closeMenu() {
    this.menu.classList.remove('linear-nav__menu--open');
  }
  
  updateActiveLink() {
    const currentPath = window.location.pathname;
    
    this.links.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('linear-nav__link--active');
      }
    });
  }
}
```

---

## Step 5: 서비스 모듈 개발

### 5.1 테스트 인터페이스
**services/tests/shared/test-interface.js**
```javascript
export class TestInterface {
  constructor(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.calculator = config.calculator;
    this.renderer = config.renderer;
    
    this.currentQuestion = 0;
    this.answers = [];
    
    this.init();
  }
  
  init() {
    this.render();
    this.bindEvents();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="test-interface">
        <div class="test-interface__progress">
          <div class="progress-bar">
            <div class="progress-bar__fill" style="width: 0%"></div>
          </div>
          <span class="progress-text">0 / ${this.questions.length}</span>
        </div>
        
        <div class="test-interface__content">
          <!-- Question will be rendered here -->
        </div>
        
        <div class="test-interface__navigation">
          <button class="linear-button linear-button--secondary" 
                  data-action="prev" disabled>
            이전
          </button>
          <button class="linear-button linear-button--primary" 
                  data-action="next">
            다음
          </button>
        </div>
      </div>
    `;
    
    this.showQuestion(0);
  }
  
  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      
      if (action === 'next') this.nextQuestion();
      if (action === 'prev') this.prevQuestion();
      if (action === 'answer') {
        this.selectAnswer(e.target.dataset.value);
      }
    });
  }
  
  showQuestion(index) {
    const question = this.questions[index];
    const content = this.container.querySelector('.test-interface__content');
    
    content.innerHTML = this.renderer.renderQuestion(question, index);
    this.updateProgress();
  }
  
  selectAnswer(value) {
    this.answers[this.currentQuestion] = value;
    
    // Auto-advance for better UX
    setTimeout(() => this.nextQuestion(), 300);
  }
  
  nextQuestion() {
    if (this.currentQuestion < this.questions.length - 1) {
      this.currentQuestion++;
      this.showQuestion(this.currentQuestion);
    } else {
      this.showResult();
    }
  }
  
  prevQuestion() {
    if (this.currentQuestion > 0) {
      this.currentQuestion--;
      this.showQuestion(this.currentQuestion);
    }
  }
  
  updateProgress() {
    const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
    const progressBar = this.container.querySelector('.progress-bar__fill');
    const progressText = this.container.querySelector('.progress-text');
    
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${this.currentQuestion + 1} / ${this.questions.length}`;
    
    // Update navigation buttons
    const prevBtn = this.container.querySelector('[data-action="prev"]');
    const nextBtn = this.container.querySelector('[data-action="next"]');
    
    prevBtn.disabled = this.currentQuestion === 0;
    nextBtn.textContent = this.currentQuestion === this.questions.length - 1 ? '결과 보기' : '다음';
  }
  
  showResult() {
    const result = this.calculator(this.answers);
    const content = this.container.querySelector('.test-interface__content');
    
    content.innerHTML = this.renderer.renderResult(result);
  }
}
```

### 5.2 MBTI 구현 예시
**services/tests/mbti/app.js**
```javascript
import { TestInterface } from '../shared/test-interface.js';
import { mbtiQuestions } from './data/questions.js';
import { MBTICalculator } from './logic/calculator.js';
import { MBTIRenderer } from './ui/renderer.js';

// MBTI 테스트 초기화
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('mbti-test');
  
  if (container) {
    new TestInterface({
      container,
      questions: mbtiQuestions,
      calculator: MBTICalculator.calculate,
      renderer: new MBTIRenderer()
    });
  }
});
```

---

## Step 6: 페이지 통합

### 6.1 HTML 템플릿 구조
**pages/index.html**
```html
<!DOCTYPE html>
<html lang="ko" data-theme="system">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>doha.kr - 일상을 더 재미있게</title>
    
    <!-- Preload Critical Resources -->
    <link rel="preload" href="/core/tokens/index.css" as="style">
    <link rel="preload" href="/shared/assets/fonts/pretendard.woff2" as="font" crossorigin>
    
    <!-- CSS -->
    <link rel="stylesheet" href="/core/index.css">
    <link rel="stylesheet" href="/pages/home.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="linear-nav" id="main-nav">
        <!-- Navigation content -->
    </nav>
    
    <!-- Main Content -->
    <main>
        <!-- Hero Section -->
        <section class="hero">
            <div class="linear-container">
                <!-- Hero content -->
            </div>
        </section>
        
        <!-- Services Grid -->
        <section class="services">
            <div class="linear-container">
                <div class="linear-grid linear-grid--responsive">
                    <!-- Service cards -->
                </div>
            </div>
        </section>
    </main>
    
    <!-- Footer -->
    <footer class="linear-footer">
        <!-- Footer content -->
    </footer>
    
    <!-- JavaScript -->
    <script type="module">
        import { Navigation } from '/core/components/navigation.js';
        import { ThemeManager } from '/shared/js/theme-manager.js';
        
        // Initialize components
        const nav = new Navigation(document.getElementById('main-nav'));
        const theme = new ThemeManager();
    </script>
</body>
</html>
```

### 6.2 모듈화된 JavaScript 로딩
**shared/js/app.js**
```javascript
// Core App Initialization
export class App {
  constructor() {
    this.components = new Map();
    this.init();
  }
  
  init() {
    // Initialize global components
    this.initNavigation();
    this.initTheme();
    this.initAnalytics();
    
    // Page-specific initialization
    this.initPage();
  }
  
  initNavigation() {
    const nav = document.querySelector('.linear-nav');
    if (nav) {
      import('/core/components/navigation.js').then(({ Navigation }) => {
        this.components.set('navigation', new Navigation(nav));
      });
    }
  }
  
  initTheme() {
    import('/shared/js/theme-manager.js').then(({ ThemeManager }) => {
      this.components.set('theme', new ThemeManager());
    });
  }
  
  initAnalytics() {
    // Analytics initialization
  }
  
  initPage() {
    // Detect current page and load specific modules
    const page = document.body.dataset.page;
    
    switch(page) {
      case 'mbti':
        import('/services/tests/mbti/app.js');
        break;
      case 'fortune-daily':
        import('/services/fortune/daily/app.js');
        break;
      // ... other pages
    }
  }
}

// Auto-initialize
new App();
```

---

## Step 7: 테스트 및 최적화

### 7.1 성능 최적화 체크리스트
```javascript
// build-config.js
export default {
  optimization: {
    // CSS 최적화
    css: {
      purge: true,           // 사용하지 않는 CSS 제거
      minify: true,          // 압축
      criticalInline: true   // Critical CSS 인라인
    },
    
    // JavaScript 최적화
    js: {
      minify: true,          // 압축
      bundle: true,          // 번들링
      treeshake: true,       // 사용하지 않는 코드 제거
      splitting: true        // 코드 스플리팅
    },
    
    // 이미지 최적화
    images: {
      formats: ['webp', 'avif'],
      sizes: [320, 640, 1280, 1920],
      lazy: true
    }
  }
};
```

### 7.2 테스트 스크립트
**tests/integration.test.js**
```javascript
// 페이지 로딩 테스트
describe('Page Loading', () => {
  test('Homepage loads successfully', async () => {
    const response = await fetch('/');
    expect(response.status).toBe(200);
  });
  
  test('Critical CSS is inlined', async () => {
    const html = await fetch('/').then(r => r.text());
    expect(html).toContain('<style>');
  });
});

// 컴포넌트 테스트
describe('Components', () => {
  test('Navigation toggles mobile menu', () => {
    const nav = document.createElement('nav');
    nav.innerHTML = navHTML;
    const navigation = new Navigation(nav);
    
    const toggle = nav.querySelector('.linear-nav__toggle');
    toggle.click();
    
    expect(nav.querySelector('.linear-nav__menu')).toHaveClass('linear-nav__menu--open');
  });
});
```

### 7.3 접근성 검증
```javascript
// accessibility-audit.js
import { AxePuppeteer } from '@axe-core/puppeteer';
import puppeteer from 'puppeteer';

async function auditPage(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  const results = await new AxePuppeteer(page).analyze();
  
  console.log(`Accessibility violations for ${url}:`);
  console.log(results.violations);
  
  await browser.close();
}

// Audit all pages
const pages = [
  'http://localhost:3000/',
  'http://localhost:3000/tests/mbti/',
  // ... other pages
];

pages.forEach(auditPage);
```

---

## 🎯 최종 체크리스트

### 개발 완료 기준
- [ ] 모든 디자인 토큰이 CSS 변수로 정의됨
- [ ] 모든 컴포넌트가 BEM 명명 규칙을 따름
- [ ] JavaScript 모듈이 ES6 문법으로 작성됨
- [ ] 모바일 우선 반응형 디자인 적용
- [ ] 한국어 텍스트 최적화 완료
- [ ] 다크 모드 지원
- [ ] 키보드 네비게이션 지원
- [ ] WCAG 2.1 AA 준수
- [ ] Lighthouse 점수 90+ (모든 카테고리)
- [ ] 크로스 브라우저 테스트 완료

### 배포 준비
- [ ] Production 빌드 최적화
- [ ] CDN 설정
- [ ] 캐싱 전략 수립
- [ ] 모니터링 도구 설정
- [ ] 에러 추적 시스템 구성

이 가이드를 따라 단계별로 구현하면 일관성 있고 확장 가능한 Linear Design System 기반의 doha.kr을 구축할 수 있습니다.