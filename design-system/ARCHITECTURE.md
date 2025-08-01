# Doha Design System v2.0 - 아키텍처 가이드

## 🏗️ 전체 아키텍처

Doha Design System v2.0은 **아토믹 디자인 방법론**과 **디자인 토큰 시스템**을 기반으로 설계되었습니다.

```
design-system/
├── 📁 src/
│   ├── 🎨 tokens/              # 디자인 토큰 (최하위 레벨)
│   │   └── index.ts           # 색상, 타이포그래피, 간격 등
│   ├── 🛠️ utils/               # 공통 유틸리티
│   │   ├── cn.ts              # 클래스명 병합
│   │   └── theme.ts           # 테마 시스템
│   ├── 🎨 styles/              # 글로벌 스타일
│   │   └── globals.css        # CSS 변수, 기본 스타일
│   ├── 🧩 components/          # 컴포넌트 라이브러리
│   │   ├── ui/                # 기본 UI 컴포넌트 (atoms)
│   │   ├── form/              # 폼 관련 컴포넌트 (molecules)
│   │   ├── feedback/          # 피드백 컴포넌트
│   │   ├── navigation/        # 네비게이션 컴포넌트
│   │   └── data-display/      # 데이터 표시 컴포넌트
│   ├── 📄 layout/              # 레이아웃 컴포넌트 (organisms)
│   ├── 🎪 demo/                # 데모 및 Showcase (pages/templates)
│   └── 📑 app/                 # Next.js App Router
├── 📚 stories/                 # Storybook 스토리
├── 🧪 tests/                   # 테스트 파일
└── 📖 docs/                    # 문서
```

## 🎯 설계 원칙

### 1. **Atomic Design Pattern**

#### Atoms (원자) - `src/components/ui/`
가장 기본적인 UI 요소들. 더 이상 분해할 수 없는 최소 단위.

```tsx
// Button, Input, Label, Icon 등
<Button variant="primary" size="lg">
  Click me
</Button>
```

#### Molecules (분자) - `src/components/form/`, `src/components/feedback/`
Atoms을 조합한 간단한 UI 그룹.

```tsx
// InputGroup, SearchBox, AlertDialog 등
<InputGroup>
  <Label>Email</Label>
  <Input type="email" />
  <HelperText>Enter your email</HelperText>
</InputGroup>
```

#### Organisms (유기체) - `src/layout/`
Molecules와 Atoms을 조합한 복잡한 UI 섹션.

```tsx
// Header, Footer, Sidebar 등
<Header>
  <Logo />
  <Navigation />
  <SearchBox />
  <UserMenu />
</Header>
```

#### Templates & Pages - `src/demo/`
Organisms을 조합한 페이지 레이아웃.

```tsx
// Dashboard, LoginPage, Showcase 등
<DashboardTemplate>
  <Header />
  <Sidebar />
  <MainContent />
  <Footer />
</DashboardTemplate>
```

### 2. **Design Token System**

디자인 토큰을 통해 일관된 디자인 언어를 구축합니다.

```typescript
// src/tokens/index.ts
export const tokens = {
  colors: {
    primary: { 50: '#f0f7ff', 500: '#0ea5e9', 900: '#082f49' },
    // ...
  },
  typography: {
    fontSize: { xs: '0.75rem', base: '1rem', xl: '1.25rem' },
    // ...
  },
  spacing: { 1: '0.25rem', 4: '1rem', 8: '2rem' },
  // ...
};
```

### 3. **Theme System Architecture**

시스템 설정과 독립적인 테마 전환을 지원합니다.

```typescript
// 3가지 테마 지원
type Theme = 'light' | 'dark' | 'high-contrast';

// CSS 변수를 통한 테마 적용
:root { --background: 0 0% 100%; }
.dark { --background: 0 0% 3.9%; }
.high-contrast { --background: 0 0% 100%; }
```

## 🔧 컴포넌트 설계 패턴

### 1. **Compound Component Pattern**

관련된 컴포넌트들을 논리적으로 그룹화합니다.

```tsx
// Card 컴포넌트 예시
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
  </CardHeader>
  <CardContent>내용</CardContent>
  <CardFooter>
    <Button>액션</Button>
  </CardFooter>
</Card>
```

### 2. **Variant-based Design**

`class-variance-authority`를 사용한 체계적인 variant 관리:

```tsx
const buttonVariants = cva(
  'doha-button', // base classes
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        base: 'h-10 px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'base',
    },
  }
);
```

### 3. **Props API Design**

일관된 Props 인터페이스를 제공합니다:

```tsx
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  asChild?: boolean; // Radix UI 패턴
}

interface ComponentProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'base' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}
```

## 🎨 스타일링 전략

### 1. **Utility-First CSS (Tailwind)**

```tsx
// ✅ 권장: Tailwind 유틸리티 사용
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">

// ❌ 비권장: 인라인 스타일
<div style={{ display: 'flex', padding: '1rem' }}>
```

### 2. **Component Classes**

공통 패턴은 컴포넌트 클래스로 정의:

```css
@layer components {
  .doha-button {
    @apply inline-flex items-center justify-center rounded-md text-sm font-medium;
    @apply transition-colors focus-visible:outline-none focus-visible:ring-2;
  }
}
```

### 3. **CSS 변수 활용**

테마별 색상은 CSS 변수로 관리:

```css
.card {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border-color: hsl(var(--border));
}
```

## ♿ 접근성 (A11y) 전략

### 1. **ARIA 패턴 준수**

```tsx
<Button
  role="button"
  aria-label="메뉴 열기"
  aria-expanded={isOpen}
  aria-controls="menu-content"
>
  Menu
</Button>
```

### 2. **키보드 네비게이션**

```tsx
// focus-visible을 활용한 키보드 포커스
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
```

### 3. **스크린 리더 지원**

```tsx
<span className="sr-only">현재 페이지:</span>
<span aria-current="page">홈</span>
```

## 📦 번들링 & 배포 전략

### 1. **Tree Shaking 최적화**

```typescript
// 개별 컴포넌트 export
export { Button } from './components/ui/button';
export { Input } from './components/ui/input';

// 사용자는 필요한 컴포넌트만 import
import { Button, Input } from '@doha/design-system';
```

### 2. **다중 빌드 포맷**

```json
{
  "main": "./dist/index.js",      // CommonJS
  "module": "./dist/index.mjs",   // ES Modules
  "types": "./dist/index.d.ts"    // TypeScript
}
```

### 3. **CSS 분리**

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./styles": "./dist/styles.css"
  }
}
```

## 🧪 테스팅 전략

### 1. **Component Testing**

```tsx
// Vitest + Testing Library
test('Button renders correctly', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

### 2. **Visual Regression Testing**

```typescript
// Chromatic (Storybook 기반)
test('Button visual regression', async () => {
  await page.goto('/storybook?path=/story/button--primary');
  await expect(page).toHaveScreenshot();
});
```

### 3. **Accessibility Testing**

```typescript
// jest-axe
test('Button is accessible', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 📚 Documentation Strategy

### 1. **Storybook Integration**

모든 컴포넌트는 Storybook 스토리를 가집니다:

```typescript
export default {
  title: 'UI/Button',
  component: Button,
  parameters: {
    docs: { autodocs: true },
  },
} satisfies Meta<typeof Button>;
```

### 2. **Type Documentation**

TypeScript 인터페이스로 문서화:

```typescript
interface ButtonProps {
  /** 버튼의 시각적 스타일 */
  variant?: 'primary' | 'secondary';
  /** 버튼의 크기 */
  size?: 'sm' | 'base' | 'lg';
  /** 로딩 상태 표시 */
  loading?: boolean;
}
```

### 3. **Usage Examples**

실제 사용 예시를 포함:

```tsx
// ✅ 올바른 사용법
<Button variant="primary" size="lg" leftIcon={<Plus />}>
  새로 만들기
</Button>

// ❌ 잘못된 사용법
<Button variant="primary" size="lg">
  <Plus /> 새로 만들기  {/* leftIcon prop 사용 권장 */}
</Button>
```

## 🔄 버전 관리 & 마이그레이션

### 1. **Semantic Versioning**

- **Major (2.0.0)**: Breaking changes
- **Minor (2.1.0)**: New features (backward compatible)
- **Patch (2.1.1)**: Bug fixes

### 2. **Migration Guides**

버전 업그레이드 시 상세한 마이그레이션 가이드 제공:

```diff
// v1.x → v2.x
- <Button type="primary">
+ <Button variant="primary">
```

### 3. **Deprecation Warnings**

```typescript
/**
 * @deprecated Use `variant` prop instead. Will be removed in v3.0.0
 */
type?: 'primary' | 'secondary';
```

---

**이 아키텍처를 통해 확장 가능하고 유지보수가 용이한 디자인 시스템을 구축할 수 있습니다.** 