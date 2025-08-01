import * as React from 'react';
import { Monitor, Moon, Sun, Contrast } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/utils/cn';

type Theme = 'light' | 'dark' | 'high-contrast';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'base' | 'lg';
  showLabel?: boolean;
  variant?: 'button' | 'segmented' | 'dropdown';
}

const ThemeToggle = ({ 
  className, 
  size = 'base', 
  showLabel = false, 
  variant = 'button' 
}: ThemeToggleProps) => {
    const [theme, setTheme] = React.useState<Theme>('light');

    React.useEffect(() => {
      // 로컬 스토리지에서 테마 로드
      const savedTheme = localStorage?.getItem('doha-ui-theme') as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
        applyTheme(savedTheme);
      }
    }, []);

    const applyTheme = (newTheme: Theme) => {
      const root = document.documentElement;
      
      // 모든 테마 클래스 제거
      root.classList.remove('light', 'dark', 'high-contrast');
      
      // 새 테마 적용
      if (newTheme !== 'light') {
        root.classList.add(newTheme);
      }
      
      // 로컬 스토리지에 저장
      localStorage?.setItem('doha-ui-theme', newTheme);
      setTheme(newTheme);
    };

    const cycleTheme = () => {
      const themes: Theme[] = ['light', 'dark', 'high-contrast'];
      const currentIndex = themes.indexOf(theme);
      const nextIndex = (currentIndex + 1) % themes.length;
      applyTheme(themes[nextIndex]);
    };

    const getThemeIcon = (themeType: Theme) => {
      switch (themeType) {
        case 'light':
          return <Sun className="h-4 w-4" />;
        case 'dark':
          return <Moon className="h-4 w-4" />;
        case 'high-contrast':
          return <Contrast className="h-4 w-4" />;
        default:
          return <Monitor className="h-4 w-4" />;
      }
    };

    const getThemeLabel = (themeType: Theme) => {
      switch (themeType) {
        case 'light':
          return '라이트 모드';
        case 'dark':
          return '다크 모드';
        case 'high-contrast':
          return '고대비 모드';
        default:
          return '시스템 모드';
      }
    };

    if (variant === 'button') {
      return (
        <Button
          variant="ghost"
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'icon'}
          onClick={cycleTheme}
          className={cn(
            'transition-all duration-200',
            showLabel && 'w-auto px-3',
            className
          )}
          aria-label={`현재 테마: ${getThemeLabel(theme)}. 클릭하여 변경`}
        >
          {getThemeIcon(theme)}
          {showLabel && (
            <span className="ml-2 text-sm">
              {getThemeLabel(theme)}
            </span>
          )}
        </Button>
      );
    }

    if (variant === 'segmented') {
      return (
        <div
          className={cn(
            'inline-flex items-center rounded-lg bg-muted p-1',
            className
          )}
          role="radiogroup"
          aria-label="테마 선택"
        >
          {(['light', 'dark', 'high-contrast'] as Theme[]).map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => applyTheme(themeOption)}
              className={cn(
                'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                theme === themeOption
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              role="radio"
              aria-checked={theme === themeOption}
              aria-label={getThemeLabel(themeOption)}
            >
              {getThemeIcon(themeOption)}
              {showLabel && (
                <span className="ml-2">
                  {getThemeLabel(themeOption)}
                </span>
              )}
            </button>
          ))}
        </div>
      );
    }

    // dropdown variant는 추후 구현
      return null;
};

ThemeToggle.displayName = 'ThemeToggle';

export { ThemeToggle }; 