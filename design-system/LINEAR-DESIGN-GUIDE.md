# Linear Design System for doha.kr

## 개요

Linear.app에서 영감을 받은 현대적이고 우아한 디자인 시스템으로, 한국어 최적화와 접근성을 고려하여 doha.kr에 맞게 특별히 제작되었습니다.

## 🎨 주요 특징

### 1. **Linear.app 기반 디자인 언어**
- 미니멀하고 현대적인 디자인 철학
- 충분한 여백(Plenty of space) 강조
- 중성적이고 전문적인 외관
- 시각적 노이즈 최소화

### 2. **한국어 최적화**
- `word-break: keep-all` 적용으로 자연스러운 한글 줄바꿈
- `line-height: 1.7` 설정으로 한국어 가독성 향상
- Pretendard Variable 폰트 사용
- 한국 사용자 UX 패턴 반영

### 3. **접근성 우선 설계**
- WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 고대비 모드 지원
- 스크린 리더 친화적
- 동작 감소 모드 지원

### 4. **반응형 디자인**
- 모바일 퍼스트 접근
- 유동적 타이포그래피 (clamp 함수)
- 8px 그리드 시스템
- 컨테이너 기반 레이아웃

## 📁 파일 구조

```
design-system/
├── linear-design-tokens.json    # 전체 디자인 토큰 정의
├── tokens.css                   # CSS 커스텀 프로퍼티
├── linear-components.css        # Linear 스타일 컴포넌트
└── LINEAR-DESIGN-GUIDE.md       # 이 문서
```

## 🔧 사용법

### 1. 기본 설정

```html
<!-- HTML 헤드에 추가 -->
<link rel="stylesheet" href="./design-system/tokens.css">
<link rel="stylesheet" href="./design-system/linear-components.css">

<!-- 테마 설정 -->
<html data-theme="system"> <!-- light, dark, system -->
```

### 2. 테마 시스템

```javascript
// 테마 변경
document.documentElement.setAttribute('data-theme', 'dark');

// 로컬스토리지에 저장
localStorage.setItem('theme', 'dark');

// 시스템 테마 감지
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

## 🎨 디자인 토큰

### 색상 시스템

```css
/* Primary Colors */
--color-primary-500: #5e6ad2;  /* Magic Blue */
--color-primary-600: #4f5bb3;
--color-primary-400: #7f7eff;

/* Semantic Colors */
--color-semantic-success: #10b981;
--color-semantic-warning: #f59e0b;
--color-semantic-error: #ef4444;
--color-semantic-info: #3b82f6;

/* Background */
--color-bg-primary: #ffffff;    /* Light mode */
--color-bg-secondary: #f9fafb;
--color-bg-tertiary: #f4f5f8;

/* Text */
--color-text-primary: #111827;
--color-text-secondary: #4b5563;
--color-text-tertiary: #6b7280;
```

### 타이포그래피

```css
/* Display Typography */
--display-1-size: clamp(2.5rem, 4vw, 4rem);
--display-2-size: clamp(2rem, 3.5vw, 3rem);

/* Title Typography */
--title-1-size: clamp(1.75rem, 3vw, 2.25rem);
--title-2-size: clamp(1.5rem, 2.5vw, 1.875rem);
--title-3-size: clamp(1.25rem, 2vw, 1.5rem);

/* Text Typography */
--text-lg-size: 1.125rem;
--text-base-size: 1rem;
--text-sm-size: 0.875rem;
--text-xs-size: 0.75rem;

/* Korean Optimization */
--text-base-line-height: 1.7;
```

### 간격 시스템

```css
/* 8px 기반 그리드 시스템 */
--spacing-1: 0.25rem;    /* 4px */
--spacing-2: 0.5rem;     /* 8px */
--spacing-4: 1rem;       /* 16px */
--spacing-6: 1.5rem;     /* 24px */
--spacing-8: 2rem;       /* 32px */
--spacing-12: 3rem;      /* 48px */
--spacing-16: 4rem;      /* 64px */
```

## 🧩 컴포넌트 사용법

### 버튼 컴포넌트

```html
<!-- 기본 버튼 -->
<button class="linear-button linear-button--primary">
    Primary Button
</button>

<!-- 아이콘이 있는 버튼 -->
<button class="linear-button linear-button--primary">
    <span class="icon">✨</span>
    아이콘 버튼
</button>

<!-- 크기 변형 -->
<button class="linear-button linear-button--primary linear-button--sm">Small</button>
<button class="linear-button linear-button--primary">Medium</button>
<button class="linear-button linear-button--primary linear-button--lg">Large</button>

<!-- 변형 스타일 -->
<button class="linear-button linear-button--secondary">Secondary</button>
<button class="linear-button linear-button--ghost">Ghost</button>
<button class="linear-button linear-button--danger">Danger</button>
```

### 카드 컴포넌트

```html
<!-- 기본 카드 -->
<div class="linear-card">
    <div class="linear-card__header">
        <h3 class="linear-card__title">카드 제목</h3>
        <p class="linear-card__description">카드 설명</p>
    </div>
    <div class="linear-card__body">
        <p>카드 내용</p>
    </div>
    <div class="linear-card__footer">
        <button class="linear-button linear-button--primary">Action</button>
    </div>
</div>

<!-- 인터랙티브 카드 -->
<div class="linear-card linear-card--interactive linear-card--elevated">
    <div class="linear-card__body">
        <h4>클릭 가능한 카드</h4>
        <p>이 카드는 호버 효과와 상호작용이 가능합니다.</p>
    </div>
</div>
```

### 폼 컴포넌트

```html
<!-- 입력 필드 -->
<div class="linear-input-group">
    <label class="linear-input-group__label">이름</label>
    <input type="text" class="linear-input" placeholder="이름을 입력하세요">
    <p class="linear-input-group__help">도움말 텍스트</p>
</div>

<!-- 오류 상태 -->
<div class="linear-input-group">
    <label class="linear-input-group__label">이메일</label>
    <input type="email" class="linear-input linear-input--error" value="잘못된 이메일">
    <p class="linear-input-group__error">유효한 이메일을 입력해주세요.</p>
</div>

<!-- 텍스트 에어리어 -->
<div class="linear-input-group">
    <label class="linear-input-group__label">메시지</label>
    <textarea class="linear-input linear-textarea" placeholder="메시지를 입력하세요"></textarea>
</div>
```

### 네비게이션

```html
<nav class="linear-nav">
    <div class="linear-nav__container">
        <a href="/" class="linear-nav__brand">
            <span class="icon">🔮</span>
            doha.kr
        </a>
        <ul class="linear-nav__menu">
            <li class="linear-nav__item">
                <a href="/" class="linear-nav__link linear-nav__link--active">홈</a>
            </li>
            <li class="linear-nav__item">
                <a href="/tests/" class="linear-nav__link">테스트</a>
            </li>
        </ul>
        <button class="linear-nav__mobile-toggle">☰</button>
    </div>
</nav>
```

### 레이아웃 유틸리티

```html
<!-- 컨테이너 -->
<div class="linear-container">
    <div class="linear-container--lg">최대 폭 제한</div>
</div>

<!-- 그리드 -->
<div class="linear-grid linear-grid--3">
    <div>그리드 아이템 1</div>
    <div>그리드 아이템 2</div>
    <div>그리드 아이템 3</div>
</div>

<!-- 스택 (수직 간격) -->
<div class="linear-stack">
    <div>스택 아이템 1</div>
    <div>스택 아이템 2</div>
    <div>스택 아이템 3</div>
</div>

<!-- 인라인 (수평 간격) -->
<div class="linear-inline">
    <button class="linear-button">버튼 1</button>
    <button class="linear-button">버튼 2</button>
</div>
```

## 🌓 다크 모드 구현

### CSS 변수 오버라이드

```css
[data-theme="dark"] {
    --color-bg-primary: #111827;
    --color-bg-secondary: #222326;
    --color-text-primary: #f4f5f8;
    --color-text-secondary: #d1d5dc;
    /* ... 다른 다크 모드 변수들 */
}
```

### JavaScript 테마 토글

```javascript
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}
```

## 🇰🇷 한국어 최적화 가이드

### 텍스트 처리

```css
.korean-text {
    word-break: keep-all;        /* 한글 단어 단위 줄바꿈 */
    word-wrap: break-word;       /* 긴 단어 적절히 자르기 */
    line-height: 1.7;           /* 한국어 최적 줄간격 */
    hanging-punctuation: force-end; /* 구두점 최적화 */
}
```

### 아이콘과 텍스트 정렬

```css
.icon-text-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.icon {
    flex-shrink: 0;  /* 아이콘 크기 고정 - 텍스트 겹침 방지 */
}
```

## ♿ 접근성 가이드

### 키보드 네비게이션

```css
.linear-button:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
}
```

### 스크린 리더 지원

```html
<!-- 시각적으로 숨김, 스크린 리더는 읽음 -->
<span class="sr-only">추가 설명</span>

<!-- ARIA 라벨 -->
<button aria-label="메뉴 열기" class="linear-nav__mobile-toggle">
    ☰
</button>
```

### 고대비 모드

```css
@media (prefers-contrast: high) {
    :root {
        --color-border-subtle: var(--color-border-default);
        --color-text-tertiary: var(--color-text-secondary);
    }
}
```

### 모션 감소

```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

## 📱 반응형 가이드

### 브레이크포인트

```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### 유동적 타이포그래피

```css
.responsive-title {
    font-size: clamp(1.5rem, 4vw, 3rem);
    /* 최소: 1.5rem, 선호: 4vw, 최대: 3rem */
}
```

## 🎯 Best Practices

### 1. **컴포넌트 조합**
```html
<!-- 좋은 예: 의미있는 조합 -->
<div class="linear-card linear-card--interactive">
    <div class="linear-card__body">
        <div class="linear-stack linear-stack--sm">
            <h3 class="linear-card__title">제목</h3>
            <p class="linear-card__description">설명</p>
            <div class="linear-inline">
                <span class="linear-badge linear-badge--primary">태그</span>
                <button class="linear-button linear-button--sm">액션</button>
            </div>
        </div>
    </div>
</div>
```

### 2. **색상 사용**
```css
/* 좋은 예: 의미있는 색상 사용 */
.success-message {
    color: var(--color-semantic-success);
    background: rgba(16, 185, 129, 0.1);
}

.primary-action {
    background: var(--color-primary-500);
    color: white;
}
```

### 3. **간격 일관성**
```css
/* 좋은 예: 8px 그리드 시스템 준수 */
.component {
    padding: var(--spacing-4);      /* 16px */
    margin-bottom: var(--spacing-6); /* 24px */
    gap: var(--spacing-3);          /* 12px */
}
```

## 🔄 업데이트 및 확장

### 새로운 컴포넌트 추가

1. `linear-components.css`에 새 컴포넌트 추가
2. BEM 명명 규칙 준수: `.linear-component__element--modifier`
3. 접근성 고려사항 포함
4. 다크 모드 지원 확인

### 색상 토큰 추가

1. `tokens.css`에 새 색상 변수 추가
2. 라이트/다크 모드 모두 정의
3. 의미있는 이름 사용 (용도 기반)

## 📚 참고 자료

- [Linear.app Design System](https://linear.app/design)
- [Pretendard Font](https://github.com/orioncactus/pretendard)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [BEM Methodology](https://getbem.com/)

## 🐛 문제 해결

### 일반적인 문제들

1. **텍스트 겹침**: `.icon { flex-shrink: 0; }` 추가
2. **다크 모드 깜빡임**: HTML에 `data-theme` 속성을 초기에 설정
3. **모바일 레이아웃 깨짐**: `linear-grid` 클래스의 반응형 규칙 확인
4. **폰트 로딩 지연**: `preload` 링크 태그 사용

### 성능 최적화

1. **CSS 최적화**: 사용하지 않는 컴포넌트는 임포트하지 않기
2. **폰트 최적화**: Variable 폰트 사용으로 요청 수 줄이기
3. **이미지 최적화**: WebP 형식 사용, 적절한 크기 조정

---

이 디자인 시스템은 doha.kr의 사용자 경험을 향상시키고, 일관성 있는 브랜드 아이덴티티를 구축하기 위해 지속적으로 발전하고 있습니다.