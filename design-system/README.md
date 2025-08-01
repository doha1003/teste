# Doha Design System v2.0

> 세계 최고 수준의 디자인 시스템 - Linear, Vercel, Stripe 벤치마킹

React + TypeScript + Tailwind CSS + Radix UI를 기반으로 한 완전한 디자인 시스템입니다.

## ✨ 주요 특징

- 🎨 **세계 최고 수준의 완성도** - Linear, Vercel, Stripe의 디자인을 벤치마킹
- 🌓 **독립적인 테마 시스템** - 시스템 설정과 무관한 라이트/다크/고대비 모드
- ♿ **100% 접근성 준수** - ARIA 표준 완전 구현
- 📱 **완벽한 반응형** - 모바일부터 데스크톱까지 일관된 경험
- 🧩 **아토믹 컴포넌트** - 재사용 가능한 최소 단위 컴포넌트
- 📚 **Storybook 통합** - 모든 컴포넌트의 문서화 및 테스트
- 🚀 **TypeScript 완전 지원** - 타입 안전성과 IntelliSense
- 🎯 **성능 최적화** - Tree shaking 및 번들 최적화

## 🏗️ 아키텍처

```
design-system/
├── src/
│   ├── tokens/           # 디자인 토큰 (색상, 타이포그래피, 간격 등)
│   ├── components/       # 컴포넌트 라이브러리
│   │   ├── ui/          # 기본 UI 컴포넌트
│   │   ├── form/        # 폼 관련 컴포넌트
│   │   ├── feedback/    # 피드백 컴포넌트 (Toast, Alert 등)
│   │   ├── navigation/  # 네비게이션 컴포넌트
│   │   └── data-display/ # 데이터 표시 컴포넌트
│   ├── layout/          # 레이아웃 컴포넌트
│   ├── utils/           # 유틸리티 함수
│   ├── styles/          # 글로벌 스타일
│   └── demo/            # 데모 및 Showcase
├── stories/             # Storybook 스토리
└── docs/               # 문서
```

## 🚀 빠른 시작

### 설치

```bash
npm install @doha/design-system
```

### 기본 설정

1. **CSS 가져오기**
```tsx
import '@doha/design-system/styles'
```

2. **테마 프로바이더 설정**
```tsx
import { ThemeProvider } from '@doha/design-system'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="your-theme-key">
      {/* 앱 컨텐츠 */}
    </ThemeProvider>
  )
}
```

3. **Tailwind CSS 설정**
```js
// tailwind.config.js
const dohaConfig = require('@doha/design-system/tailwind')

module.exports = {
  presets: [dohaConfig],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@doha/design-system/**/*.{js,ts,jsx,tsx}'
  ]
}
```

## 📖 컴포넌트 사용법

### 기본 컴포넌트

```tsx
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@doha/design-system'

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>로그인</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          label="이메일"
          type="email"
          placeholder="example@domain.com"
          leftIcon={<Mail />}
        />
        <Input
          label="패스워드"
          type="password"
          leftIcon={<Lock />}
        />
        <Button className="w-full">
          로그인
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 테마 토글

```tsx
import { ThemeToggle } from '@doha/design-system'

function Header() {
  return (
    <header className="flex justify-between items-center">
      <h1>My App</h1>
      <ThemeToggle variant="segmented" showLabel />
    </header>
  )
}
```

## 🎨 디자인 토큰

### 색상 시스템

```tsx
// 기본 색상
bg-primary-500        // Primary 색상
text-neutral-700      // 중립 텍스트
border-success-300    // 성공 테두리

// 시맨틱 색상 (테마별 자동 변경)
bg-background         // 배경색
text-foreground       // 전경색
border-border         // 테두리색
```

### 타이포그래피

```tsx
// 텍스트 크기
text-xs    // 12px
text-sm    // 14px
text-base  // 16px
text-lg    // 18px
text-xl    // 20px

// 폰트 가중치
font-normal    // 400
font-medium    // 500
font-semibold  // 600
font-bold      // 700
```

### 간격 시스템

```tsx
// Spacing (4px 기준)
p-1   // 4px
p-2   // 8px
p-4   // 16px
p-6   // 24px
p-8   // 32px
```

## 📋 컴포넌트 목록

### 🔧 기본 UI 컴포넌트
- [x] Button (6개 variant, 5개 size, 로딩/아이콘 지원)
- [x] Input (라벨, 에러, 아이콘 지원)
- [x] Card (4개 variant, 4개 size, 3개 hover 효과)
- [x] ThemeToggle (시스템 독립적 테마 전환)
- [ ] Select
- [ ] Checkbox
- [ ] Radio
- [ ] Switch
- [ ] Slider
- [ ] Textarea
- [ ] Label

### 📄 레이아웃 컴포넌트
- [x] Header (검색, 네비게이션, 모바일 메뉴)
- [ ] Footer
- [ ] Sidebar
- [ ] Container
- [ ] Grid
- [ ] Spacer

### 💬 피드백 컴포넌트
- [ ] Toast
- [ ] Alert
- [ ] Dialog
- [ ] Modal
- [ ] Popover
- [ ] Tooltip
- [ ] Progress
- [ ] Loading
- [ ] Skeleton

### 🧭 네비게이션 컴포넌트
- [ ] Breadcrumb
- [ ] Pagination
- [ ] Tabs
- [ ] MenuBar
- [ ] DropdownMenu
- [ ] NavigationMenu

### 📊 데이터 표시 컴포넌트
- [ ] Table
- [ ] Badge
- [ ] Avatar
- [ ] Calendar
- [ ] DatePicker
- [ ] Accordion
- [ ] Collapsible

## 🛠️ 개발 환경

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# Storybook 실행
npm run storybook

# 빌드
npm run build

# 테스트
npm run test
```

### 스크립트

- `npm run dev` - Next.js 데모 환경 실행
- `npm run storybook` - Storybook 개발 서버
- `npm run build` - 프로덕션 빌드
- `npm run lint` - ESLint 검사
- `npm run type-check` - TypeScript 타입 검사
- `npm run test` - 단위 테스트 실행

## 📚 문서 및 데모

- **🎨 Live Demo**: [https://design.doha.kr](https://design.doha.kr)
- **📖 Storybook**: [https://storybook.doha.kr](https://storybook.doha.kr)
- **📝 문서**: [https://docs.doha.kr](https://docs.doha.kr)
- **🔧 GitHub**: [https://github.com/doha1003/design-system](https://github.com/doha1003/design-system)

## 🎯 로드맵

### v2.0 (현재)
- [x] 기본 컴포넌트 시스템
- [x] 테마 시스템
- [x] 토큰 시스템
- [x] Storybook 기본 설정

### v2.1 (예정)
- [ ] 모든 기본 컴포넌트 완성
- [ ] 접근성 테스트 100% 커버리지
- [ ] 성능 최적화
- [ ] 고급 애니메이션

### v2.2 (예정)
- [ ] 고급 데이터 컴포넌트
- [ ] 차트 및 시각화
- [ ] 폼 유효성 검사 시스템
- [ ] 다국어 지원

## 🤝 기여하기

1. 레포지토리 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

### 개발 가이드라인

- TypeScript 사용 필수
- 모든 컴포넌트에 Storybook 스토리 작성
- 접근성 가이드라인 준수
- 테스트 커버리지 80% 이상 유지

## 📄 라이선스

MIT License - [LICENSE](LICENSE) 파일 참조

## 🙏 크레딧

- **디자인 영감**: Linear, Vercel, Stripe
- **기술 스택**: React, TypeScript, Tailwind CSS, Radix UI
- **도구**: Storybook, Vitest, Playwright

---

**Made with ❤️ by Doha Design Team** 