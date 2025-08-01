import * as React from 'react';
import { Search, Menu, X, Github, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/utils/cn';

interface HeaderProps {
  className?: string;
  showSearch?: boolean;
  showThemeToggle?: boolean;
  logoHref?: string;
  logoText?: string;
  navigation?: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
  actions?: React.ReactNode;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  (
    {
      className,
      showSearch = true,
      showThemeToggle = true,
      logoHref = '/',
      logoText = 'Doha Design System',
      navigation = [],
      actions,
      ...props
    },
    ref
  ) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
      <header
        ref={ref}
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          className
        )}
        {...props}
      >
        <div className="doha-container flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a
              href={logoHref}
              className="flex items-center space-x-2 transition-opacity hover:opacity-80"
            >
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">D</span>
              </div>
              <span className="hidden font-bold sm:inline-block">
                {logoText}
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground/80 text-foreground/60',
                  'flex items-center space-x-1'
                )}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
              >
                <span>{item.label}</span>
                {item.external && <ExternalLink className="h-3 w-3" />}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            {showSearch && (
              <div className="hidden lg:block">
                <Input
                  type="search"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  className="w-64"
                  size="sm"
                />
              </div>
            )}

            {/* Theme Toggle */}
            {showThemeToggle && (
              <ThemeToggle size="sm" />
            )}

            {/* Custom Actions */}
            {actions}

            {/* GitHub Link */}
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a
                href="https://github.com/doha1003/design-system"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            >
              {isMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t bg-background md:hidden">
            <div className="doha-container py-4 space-y-3">
              {/* Mobile Search */}
              {showSearch && (
                <Input
                  type="search"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  size="sm"
                />
              )}

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col space-y-2">
                {navigation.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 text-sm transition-colors hover:text-foreground/80 text-foreground/60 rounded-md hover:bg-accent',
                      'flex items-center justify-between'
                    )}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    {item.external && <ExternalLink className="h-3 w-3" />}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>
    );
  }
);

Header.displayName = 'Header';

export { Header }; 