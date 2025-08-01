import * as React from 'react';
import { 
  Heart, 
  Star, 
  Download, 
  Plus, 
  Search, 
  Settings,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Header } from '@/layout/header';
import { cn } from '@/utils/cn';

interface ShowcaseProps {
  className?: string;
}

const Showcase = React.forwardRef<HTMLDivElement, ShowcaseProps>(
  ({ className, ...props }, ref) => {
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);

    const navigation = [
      { label: '컴포넌트', href: '#components' },
      { label: '가이드', href: '#guide' },
      { label: '토큰', href: '#tokens' },
      { label: 'Storybook', href: '/storybook', external: true },
    ];

    return (
      <div ref={ref} className={cn('min-h-screen bg-background', className)} {...props}>
        {/* Header */}
        <Header
          navigation={navigation}
          logoText="Doha Design System v2.0"
        />

        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="doha-container text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                세계 최고 수준의
                <br />
                <span className="text-primary">디자인 시스템</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Linear, Vercel, Stripe의 완성도를 벤치마킹한 React + TypeScript + Tailwind 기반 디자인 시스템
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" leftIcon={<Download />}>
                시작하기
              </Button>
              <Button variant="outline" size="lg" leftIcon={<Star />}>
                GitHub에서 보기
              </Button>
            </div>

            {/* Theme Toggle Demo */}
            <div className="flex items-center justify-center space-x-4 pt-8 border-t border-border/40">
              <span className="text-sm text-muted-foreground">테마 변경:</span>
              <ThemeToggle variant="segmented" showLabel />
            </div>
          </div>
        </section>

        {/* Components Showcase */}
        <section className="py-20" id="components">
          <div className="doha-container space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">컴포넌트 라이브러리</h2>
              <p className="text-muted-foreground">
                완벽한 접근성과 사용성을 갖춘 아토믹 컴포넌트들
              </p>
            </div>

            {/* Button Showcase */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>
                  다양한 variant, size, state를 지원하는 버튼 컴포넌트
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Variants */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Variants</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Sizes</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="base">Base</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                  </div>
                </div>

                {/* With Icons */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">With Icons</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button leftIcon={<Plus />}>Add Item</Button>
                    <Button rightIcon={<Download />}>Download</Button>
                    <Button variant="outline" leftIcon={<Heart />} rightIcon={<Star />}>
                      Like & Star
                    </Button>
                    <Button size="icon" variant="outline">
                      <Settings />
                    </Button>
                  </div>
                </div>

                {/* States */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">States</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button loading>Loading</Button>
                    <Button disabled>Disabled</Button>
                    <Button variant="destructive" loading>
                      Processing
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Input Showcase */}
            <Card>
              <CardHeader>
                <CardTitle>Inputs</CardTitle>
                <CardDescription>
                  폼 입력을 위한 다양한 스타일과 상태의 인풋 컴포넌트
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Inputs */}
                  <div className="space-y-4">
                    <Input
                      label="이름"
                      placeholder="홍길동"
                      helperText="실명을 입력해주세요"
                    />
                    
                    <Input
                      label="이메일"
                      type="email"
                      placeholder="example@domain.com"
                      leftIcon={<Mail className="h-4 w-4" />}
                    />
                    
                    <Input
                      label="패스워드"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      leftIcon={<Lock className="h-4 w-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                    />
                  </div>

                  {/* Input Variants */}
                  <div className="space-y-4">
                    <Input
                      label="검색"
                      placeholder="컴포넌트 검색..."
                      leftIcon={<Search className="h-4 w-4" />}
                      size="sm"
                    />
                    
                    <Input
                      label="오류 상태"
                      placeholder="잘못된 입력"
                      error="이 필드는 필수입니다"
                      leftIcon={<User className="h-4 w-4" />}
                    />
                    
                    <Input
                      label="큰 사이즈"
                      placeholder="Large input"
                      size="lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Showcase */}
            <Card>
              <CardHeader>
                <CardTitle>Cards</CardTitle>
                <CardDescription>
                  콘텐츠를 구조화하기 위한 카드 컴포넌트 및 하위 요소들
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Default Card */}
                  <Card variant="default" hover="lift">
                    <CardHeader>
                      <CardTitle>기본 카드</CardTitle>
                      <CardDescription>
                        기본 스타일의 카드입니다
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        이 카드는 기본 variant를 사용하며 hover 시 lift 효과가 적용됩니다.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm">자세히 보기</Button>
                    </CardFooter>
                  </Card>

                  {/* Elevated Card */}
                  <Card variant="elevated" hover="glow">
                    <CardHeader>
                      <CardTitle>Elevated 카드</CardTitle>
                      <CardDescription>
                        그림자가 강조된 카드입니다
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        elevated variant로 더 강한 그림자를 가지며 glow 효과가 있습니다.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm" variant="secondary">
                        액션
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Outlined Card */}
                  <Card variant="outlined" hover="scale">
                    <CardHeader>
                      <CardTitle>Outlined 카드</CardTitle>
                      <CardDescription>
                        테두리가 강조된 카드입니다
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        outlined variant로 두꺼운 테두리를 가지며 hover 시 scale 효과가 적용됩니다.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm" variant="outline">
                        확인
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Color Palette */}
            <Card>
              <CardHeader>
                <CardTitle>컬러 시스템</CardTitle>
                <CardDescription>
                  디자인 토큰 기반의 일관된 컬러 팔레트
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Primary Colors */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Primary</h4>
                    <div className="space-y-2">
                      {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                        <div
                          key={shade}
                          className={`h-8 rounded flex items-center px-3 text-xs bg-primary-${shade} ${shade > 400 ? 'text-white' : 'text-gray-900'}`}
                        >
                          {shade}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Neutral Colors */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Neutral</h4>
                    <div className="space-y-2">
                      {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                        <div
                          key={shade}
                          className={`h-8 rounded flex items-center px-3 text-xs bg-neutral-${shade} ${shade > 400 ? 'text-white' : 'text-gray-900'}`}
                        >
                          {shade}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Success Colors */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Success</h4>
                    <div className="space-y-2">
                      {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                        <div
                          key={shade}
                          className={`h-8 rounded flex items-center px-3 text-xs bg-success-${shade} ${shade > 400 ? 'text-white' : 'text-gray-900'}`}
                        >
                          {shade}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Error Colors */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Error</h4>
                    <div className="space-y-2">
                      {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                        <div
                          key={shade}
                          className={`h-8 rounded flex items-center px-3 text-xs bg-error-${shade} ${shade > 400 ? 'text-white' : 'text-gray-900'}`}
                        >
                          {shade}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-12 bg-muted/20">
          <div className="doha-container text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Doha Design System. Built with React, TypeScript, and Tailwind CSS.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Storybook
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  문서
                </a>
              </Button>
            </div>
          </div>
        </footer>
      </div>
    );
  }
);

Showcase.displayName = 'Showcase';

export { Showcase }; 