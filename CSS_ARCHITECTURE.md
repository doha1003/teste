# doha.kr CSS 아키텍처 가이드

## 목차
1. [디자인 시스템 개요](#디자인-시스템-개요)
2. [CSS 파일 구조](#css-파일-구조)
3. [페이지별 CSS 연결 방식](#페이지별-css-연결-방식)
4. [충돌 방지 전략](#충돌-방지-전략)
5. [디자인 시스템 컴포넌트 사용 가이드](#디자인-시스템-컴포넌트-사용-가이드)

---

## 디자인 시스템 개요

### Linear.app 기반 디자인 시스템
- **파일**: `/css/design-system.css`
- **특징**: 모든 UI 컴포넌트의 기본 스타일 정의
- **장점**: 일관성, 재사용성, 유지보수성

### 디자인 토큰
```css
:root {
  /* 색상 */
  --color-primary: #5c5ce0;
  
  /* 간격 (8px 그리드) */
  --spacing-md: 16px;
  
  /* 타이포그래피 */
  --font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}
```

---

## CSS 파일 구조

### 새로운 구조 (권장)
```
css/
├── design-system.css      # 디자인 시스템 (필수)
├── main-new.css          # 메인 진입점
├── core/
│   └── reset.css         # CSS 리셋
├── layout/
│   ├── header.css        # 헤더/네비게이션
│   └── footer.css        # 푸터
└── pages/                # 페이지별 스타일 (스코프 적용)
    ├── home.css
    ├── mbti.css
    └── ...
```

---

## 페이지별 CSS 연결 방식

### 1. 홈페이지 (/)
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <!-- 단일 CSS 파일만 로드 -->
    <link rel="stylesheet" href="/css/main-new.css">
</head>
<body data-page="home">
    <!-- 컨텐츠 -->
</body>
</html>
```

**디자인 시스템 사용:**
- ✅ 버튼: `.btn`, `.btn-primary`
- ✅ 카드: `.card`
- ✅ 그리드: `.container`, `.row`, `.col`
- ✅ 유틸리티: `.text-center`, `.mt-4`

**페이지 전용 스타일:**
```css
/* pages/home.css */
[data-page="home"] .hero-section {
    background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
    padding: var(--spacing-3xl) 0;
}

[data-page="home"] .service-card {
    /* 디자인 시스템 .card 확장 */
    transition: transform var(--transition-base);
}
```

**충돌 없음!** `data-page` 스코프로 완전 격리

---

### 2. MBTI 테스트 (/tests/mbti/)
```html
<head>
    <link rel="stylesheet" href="/css/main-new.css">
    <link rel="stylesheet" href="/css/pages/mbti.css">
</head>
<body data-page="mbti-test">
```

**디자인 시스템 사용:**
- ✅ 폼: `.form-control`, `.form-group`
- ✅ 라디오: `.form-check`
- ✅ 프로그레스: 커스텀 (디자인 시스템 확장)
- ✅ 버튼: `.btn-block`

**페이지 전용 스타일:**
```css
/* pages/mbti.css */
[data-page="mbti-test"] .question-card {
    /* 디자인 시스템 .card 기반 */
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
}

[data-page="mbti-test"] .question-option {
    /* 커스텀 라디오 버튼 */
    display: block;
    width: 100%;
    margin-bottom: var(--spacing-sm);
}

/* 프로그레스 바 (디자인 시스템 확장) */
[data-page="mbti-test"] .progress {
    height: 8px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-full);
}

[data-page="mbti-test"] .progress-bar {
    background: var(--color-primary);
    transition: width var(--transition-slow);
}
```

---

### 3. 타로 운세 (/fortune/tarot/)
```html
<head>
    <link rel="stylesheet" href="/css/main-new.css">
    <link rel="stylesheet" href="/css/pages/tarot.css">
</head>
<body data-page="tarot">
```

**디자인 시스템 사용:**
- ✅ 폼: `.form-control` (텍스트에어리어)
- ✅ 라디오: `.form-check` (스프레드 선택)
- ✅ 버튼: `.btn-primary`
- ❌ 카드: 커스텀 (타로 카드는 특수한 디자인)

**페이지 전용 스타일:**
```css
/* pages/tarot.css */
[data-page="tarot"] .tarot-card {
    /* 타로 카드 전용 디자인 */
    width: 120px;
    height: 180px;
    background: linear-gradient(45deg, #1a1a2e, #16213e);
    border: 2px solid gold;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: transform 0.6s;
    transform-style: preserve-3d;
}

[data-page="tarot"] .tarot-card.flipped {
    transform: rotateY(180deg);
}

/* 카드 레이아웃 */
[data-page="tarot"] .card-spread {
    display: grid;
    gap: var(--spacing-lg);
}

[data-page="tarot"] .spread-one-card {
    grid-template-columns: 1fr;
    justify-items: center;
}

[data-page="tarot"] .spread-three-card {
    grid-template-columns: repeat(3, 1fr);
}
```

---

### 4. BMI 계산기 (/tools/bmi/)
```html
<head>
    <link rel="stylesheet" href="/css/main-new.css">
    <link rel="stylesheet" href="/css/pages/bmi.css">
</head>
<body data-page="bmi-calculator">
```

**디자인 시스템 사용:**
- ✅ 폼: `.form-control` (숫자 입력)
- ✅ 버튼: `.btn-primary`, `.btn-lg`
- ✅ 카드: `.card` (결과 표시)
- ✅ 유틸리티: `.text-center`, `.mb-3`

**페이지 전용 스타일:**
```css
/* pages/bmi.css */
[data-page="bmi-calculator"] .input-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

[data-page="bmi-calculator"] .input-unit {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

/* BMI 게이지 (커스텀) */
[data-page="bmi-calculator"] .bmi-gauge {
    position: relative;
    height: 200px;
    background: linear-gradient(to right, 
        #3b82f6 0%,    /* 저체중 */
        #10b981 25%,   /* 정상 */
        #f59e0b 50%,   /* 과체중 */
        #ef4444 75%    /* 비만 */
    );
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

[data-page="bmi-calculator"] .bmi-needle {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform-origin: bottom;
    transition: transform var(--transition-slow);
}
```

---

### 5. 오늘의 운세 (/fortune/daily/)
```html
<head>
    <link rel="stylesheet" href="/css/main-new.css">
    <link rel="stylesheet" href="/css/pages/daily-fortune.css">
</head>
<body data-page="daily-fortune">
```

**디자인 시스템 사용:**
- ✅ 폼: 날짜/시간 선택
- ✅ 버튼: `.btn-primary`
- ✅ 카드: `.card` (운세 결과)
- ✅ 그리드: 운세 카테고리 배치

**페이지 전용 스타일:**
```css
/* pages/daily-fortune.css */
[data-page="daily-fortune"] .birth-form {
    max-width: 500px;
    margin: 0 auto;
}

[data-page="daily-fortune"] .fortune-category {
    /* 디자인 시스템 .card 확장 */
    border-left: 4px solid var(--color-primary);
}

[data-page="daily-fortune"] .fortune-score {
    display: flex;
    gap: var(--spacing-xs);
}

[data-page="daily-fortune"] .score-star {
    color: var(--color-warning);
}
```

---

## 충돌 방지 전략

### 1. **페이지 스코프 사용**
```css
/* ❌ 나쁜 예 - 전역 스타일 */
.card { padding: 30px; }

/* ✅ 좋은 예 - 페이지 스코프 */
[data-page="home"] .card { padding: 30px; }
```

### 2. **BEM 네이밍 (선택적)**
```css
/* 컴포넌트별 고유 네이밍 */
.fortune-card { }
.fortune-card__title { }
.fortune-card--daily { }
```

### 3. **CSS 변수 활용**
```css
/* 디자인 시스템 변수 사용 */
.custom-component {
    padding: var(--spacing-lg);
    color: var(--text-primary);
    /* 하드코딩 대신 변수 사용! */
}
```

### 4. **!important 금지**
```css
/* ❌ 절대 사용 금지 */
.btn { color: red !important; }

/* ✅ 우선순위는 스코프로 해결 */
[data-page="special"] .btn { color: red; }
```

---

## 디자인 시스템 컴포넌트 사용 가이드

### 버튼
```html
<!-- 기본 버튼 -->
<button class="btn btn-primary">확인</button>
<button class="btn btn-secondary">취소</button>
<button class="btn btn-ghost">더보기</button>

<!-- 크기 변형 -->
<button class="btn btn-primary btn-sm">작은 버튼</button>
<button class="btn btn-primary btn-lg">큰 버튼</button>

<!-- 전체 너비 -->
<button class="btn btn-primary btn-block">전체 너비</button>
```

### 카드
```html
<div class="card">
    <div class="card-header">
        <h3 class="card-title">카드 제목</h3>
        <p class="card-subtitle">부제목</p>
    </div>
    <div class="card-body">
        카드 내용
    </div>
    <div class="card-footer">
        <button class="btn btn-primary">액션</button>
    </div>
</div>
```

### 폼
```html
<form>
    <div class="form-group">
        <label class="form-label">이름</label>
        <input type="text" class="form-control" placeholder="이름 입력">
        <span class="form-text">한글 이름을 입력하세요</span>
    </div>
    
    <div class="form-group">
        <div class="form-check">
            <input type="checkbox" class="form-check-input" id="agree">
            <label class="form-check-label" for="agree">동의합니다</label>
        </div>
    </div>
    
    <button type="submit" class="btn btn-primary">제출</button>
</form>
```

### 그리드
```html
<div class="container">
    <div class="row">
        <div class="col col-md-4">1/3</div>
        <div class="col col-md-4">1/3</div>
        <div class="col col-md-4">1/3</div>
    </div>
</div>
```

### 유틸리티 클래스
```html
<!-- 간격 -->
<div class="mt-4 mb-2 p-3">간격 조정</div>

<!-- 텍스트 -->
<p class="text-center text-secondary">중앙 정렬 보조 텍스트</p>

<!-- 배경 -->
<div class="bg-secondary p-3 rounded">배경색 적용</div>

<!-- 플렉스박스 -->
<div class="d-flex justify-between align-center">
    <span>왼쪽</span>
    <span>오른쪽</span>
</div>
```

---

## 마이그레이션 가이드

### 기존 코드를 새 구조로 변경하기

1. **HTML 수정**
```html
<!-- 변경 전 -->
<body>
    <link rel="stylesheet" href="/css/core/variables.css">
    <link rel="stylesheet" href="/css/core/reset.css">
    <!-- 10개 이상의 CSS 파일... -->

<!-- 변경 후 -->
<body data-page="page-name">
    <link rel="stylesheet" href="/css/main-new.css">
    <link rel="stylesheet" href="/css/pages/page-name.css">
```

2. **CSS 수정**
```css
/* 변경 전 - 전역 스타일 */
.btn { padding: 20px; }

/* 변경 후 - 스코프 적용 */
[data-page="page-name"] .custom-btn {
    /* 디자인 시스템 .btn 상속 */
    padding: var(--spacing-lg);
}
```

3. **클래스명 변경**
```html
<!-- 변경 전 -->
<button class="button">클릭</button>

<!-- 변경 후 -->
<button class="btn btn-primary">클릭</button>
```

---

## 성능 최적화

### 1. CSS 번들링
```bash
# PostCSS로 최적화
postcss css/main-new.css -o css/main.min.css
```

### 2. Critical CSS
```html
<head>
    <!-- Critical CSS 인라인 -->
    <style>
        /* 디자인 시스템 변수만 */
        :root { --color-primary: #5c5ce0; }
    </style>
    
    <!-- 나머지는 비동기 로드 -->
    <link rel="preload" href="/css/main.min.css" as="style">
</head>
```

### 3. 미사용 CSS 제거
```bash
# PurgeCSS 사용
purgecss --css css/main-new.css --content "**/*.html"
```

---

## 결론

이 새로운 CSS 아키텍처는:
1. **충돌 없음**: 페이지 스코프로 완전 격리
2. **일관성**: 디자인 시스템 사용
3. **성능**: 최소한의 CSS 로드
4. **유지보수**: 명확한 구조

모든 페이지가 디자인 시스템을 기반으로 하되, 필요시 안전하게 커스터마이징할 수 있습니다!