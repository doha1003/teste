# 기여 가이드 (Contributing Guide)

Doha Design System v2.0에 기여해주셔서 감사합니다! 이 가이드는 효과적인 협업을 위한 규칙과 절차를 설명합니다.

## 🚀 빠른 시작

### 개발 환경 설정

1. **레포지토리 포크 및 클론**
```bash
git clone https://github.com/YOUR_USERNAME/doha-design-system.git
cd doha-design-system/design-system
```

2. **의존성 설치**
```bash
npm install
```

3. **개발 서버 실행**
```bash
# Storybook 실행
npm run storybook

# Next.js 데모 실행
npm run dev
```

4. **브랜치 생성**
```bash
git checkout -b feature/amazing-feature
```

## 📋 기여 유형

### 🐛 버그 수정
- 기존 기능의 오류 수정
- 접근성 문제 해결
- 성능 최적화

### ✨ 새로운 기능
- 새로운 컴포넌트 추가
- 기존 컴포넌트의 기능 확장
- 새로운 디자인 토큰

### 📚 문서화
- README, 가이드 개선
- Storybook 스토리 추가/개선
- 코드 주석 개선

### 🧪 테스트
- 단위 테스트 추가
- 시각적 회귀 테스트
- 접근성 테스트

## 🏗️ 개발 워크플로

### 1. 이슈 생성 또는 선택

새로운 기능이나 버그 수정을 시작하기 전에 GitHub 이슈를 생성하거나 기존 이슈를 선택하세요.

**이슈 템플릿:**
- 🐛 **Bug Report**: 버그 신고
- ✨ **Feature Request**: 새로운 기능 제안
- 📚 **Documentation**: 문서 개선
- 🧩 **Component Request**: 새로운 컴포넌트 요청

### 2. 브랜치 네이밍 규칙

```bash
# 기능 추가
feature/component-name
feature/button-loading-state

# 버그 수정
fix/component-name
fix/button-focus-ring

# 문서 개선
docs/component-guide
docs/accessibility-guide

# 테스트 추가
test/button-component
test/accessibility-tests
```

### 3. 커밋 메시지 규칙

**Conventional Commits** 형식을 따릅니다:

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**타입:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드/도구 변경

**예시:**
```bash
feat(button): add loading state with spinner
fix(input): resolve focus ring visibility issue
docs(readme): update installation guide
test(button): add accessibility tests
```

### 4. 코드 스타일 가이드

#### TypeScript
```typescript
// ✅ 올바른 예시
interface ButtonProps {
  /** 버튼의 시각적 스타일을 결정합니다 */
  variant?: 'primary' | 'secondary' | 'destructive';
  /** 버튼의 크기를 설정합니다 */
  size?: 'sm' | 'base' | 'lg';
  /** 로딩 상태를 표시합니다 */
  loading?: boolean;
  /** 버튼 내용 */
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'base', loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }))}
        disabled={loading}
        {...props}
      >
        {loading && <Spinner className="mr-2" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

#### CSS/Tailwind
```css
/* ✅ 컴포넌트 기본 클래스 */
@layer components {
  .doha-button {
    @apply inline-flex items-center justify-center rounded-md text-sm font-medium;
    @apply ring-offset-background transition-colors;
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
    @apply disabled:pointer-events-none disabled:opacity-50;
  }
}

/* ✅ 유틸리티 클래스 정렬 순서 */
className={cn(
  "flex items-center justify-center", // layout
  "px-4 py-2 rounded-md", // spacing & borders  
  "text-sm font-medium", // typography
  "bg-primary text-primary-foreground", // colors
  "hover:bg-primary/90", // interactions
  "transition-colors duration-200", // animations
  className // custom overrides
)}
```

### 5. 컴포넌트 개발 체크리스트

#### 새로운 컴포넌트 생성 시:

- [ ] **기본 구조**
  - [ ] 컴포넌트 파일 생성 (`src/components/ui/component-name.tsx`)
  - [ ] Props 인터페이스 정의
  - [ ] forwardRef 사용 (DOM 요소인 경우)
  - [ ] displayName 설정

- [ ] **스타일링**
  - [ ] CVA (class-variance-authority) 사용
  - [ ] Tailwind 클래스 활용
  - [ ] 테마 토큰 준수
  - [ ] 반응형 디자인 고려

- [ ] **접근성**
  - [ ] 적절한 ARIA 속성
  - [ ] 키보드 네비게이션 지원
  - [ ] 스크린 리더 호환성
  - [ ] 색상 대비 충족

- [ ] **Storybook 스토리**
  - [ ] 기본 스토리 작성
  - [ ] 모든 variant 표시
  - [ ] 인터랙션 예시
  - [ ] 문서화 (JSDoc)

- [ ] **테스트**
  - [ ] 단위 테스트 작성
  - [ ] 접근성 테스트
  - [ ] 시각적 회귀 테스트

- [ ] **문서화**
  - [ ] TypeScript 주석
  - [ ] 사용 예시
  - [ ] Props 설명

### 6. 테스트 가이드

#### 단위 테스트
```typescript
// src/components/ui/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

#### 접근성 테스트
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<Button>Accessible button</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 7. Pull Request 가이드

#### PR 제목
```
<type>(<scope>): <description>

feat(button): add loading state animation
fix(input): resolve accessibility focus issues
docs(components): update button component guide
```

#### PR 설명 템플릿
```markdown
## 📋 변경사항 요약
<!-- 무엇을 변경했는지 간단히 설명 -->

## 🎯 변경 이유
<!-- 왜 이 변경이 필요한지 설명 -->

## 🧪 테스트
- [ ] 단위 테스트 통과
- [ ] 접근성 테스트 통과
- [ ] 시각적 회귀 테스트 통과
- [ ] 브라우저 호환성 확인

## 📸 스크린샷/데모
<!-- Storybook 링크 또는 스크린샷 첨부 -->

## ✅ 체크리스트
- [ ] 코드가 스타일 가이드를 준수함
- [ ] 적절한 테스트가 추가됨
- [ ] 문서가 업데이트됨
- [ ] 접근성 가이드라인을 준수함
- [ ] Breaking changes가 있다면 CHANGELOG에 기록됨
```

#### PR 리뷰 기준
- **기능성**: 의도한 대로 작동하는가?
- **코드 품질**: 가독성, 유지보수성
- **접근성**: WCAG 2.1 AA 기준 준수
- **성능**: 불필요한 렌더링 없음
- **테스트**: 적절한 테스트 커버리지
- **문서**: 충분한 문서화

## 🛡️ 접근성 가이드라인

### 필수 요구사항
1. **키보드 네비게이션**: 모든 인터랙티브 요소가 키보드로 접근 가능
2. **포커스 표시**: 명확한 포커스 링 제공
3. **ARIA 라벨**: 스크린 리더를 위한 적절한 라벨
4. **색상 대비**: WCAG AA 기준 (4.5:1) 준수
5. **의미적 HTML**: 적절한 HTML 요소 사용

### 테스트 도구
- **eslint-plugin-jsx-a11y**: 개발 중 접근성 검사
- **@axe-core/react**: 자동화된 접근성 테스트
- **Screen reader**: NVDA, JAWS, VoiceOver로 실제 테스트

## 🔄 릴리스 프로세스

### 1. Changesets 사용
```bash
# 변경사항 기록
npx changeset

# 버전 업데이트
npx changeset version

# 릴리스 발행
npx changeset publish
```

### 2. 릴리스 노트
각 릴리스는 다음을 포함합니다:
- **새로운 기능**: 추가된 컴포넌트/기능
- **개선사항**: 기존 기능 향상
- **버그 수정**: 해결된 문제들
- **Breaking Changes**: 호환성이 깨지는 변경사항
- **마이그레이션 가이드**: 업그레이드 방법

## ❓ 도움이 필요한가요?

- **Discord**: [디자인 시스템 채널](https://discord.gg/doha-design)
- **GitHub Discussions**: [질문 & 토론](https://github.com/doha1003/design-system/discussions)
- **이메일**: design-system@doha.kr

## 🙏 감사의 말

모든 기여자들께 진심으로 감사드립니다. 여러분의 기여가 더 나은 디자인 시스템을 만들어갑니다!

---

**함께 만드는 세계 최고 수준의 디자인 시스템** 🎨✨ 