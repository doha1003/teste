# CSS Architecture Documentation

## Overview
The CSS architecture has been completely restructured from a single monolithic `styles.css` file into a modular, maintainable system.

## Directory Structure

```
css/
├── main.css              # Main entry point that imports all modules
├── base/                 # Foundation styles
│   ├── reset.css        # CSS reset and normalization
│   ├── variables.css    # CSS custom properties (colors, spacing, etc.)
│   └── typography.css   # Font and text styles
├── layout/              # Major layout components
│   ├── header.css       # Navigation bar styles
│   └── footer.css       # Footer styles
├── sections/            # Page section styles
│   ├── hero.css         # Hero section with animations
│   ├── features.css     # Features section
│   ├── services.css     # Services grid and tabs
│   └── cta.css          # Call-to-action section
├── components/          # Reusable UI components
│   ├── buttons.css      # Button styles and variants
│   ├── cards.css        # Card components
│   └── badges.css       # Badge styles
├── utilities/           # Utility classes
│   ├── animations.css   # Animation keyframes and classes
│   └── responsive.css   # Responsive utilities and helpers
└── styles.css          # DEPRECATED - Old monolithic file (backup only)
```

## Usage

### In HTML files:
```html
<!-- Load the main CSS file -->
<link rel="stylesheet" href="/css/main.css">

<!-- Additional specific fixes (to be integrated) -->
<link rel="stylesheet" href="/css/global-text-fix.css">
<link rel="stylesheet" href="/css/highlights-fix.css">
<!-- etc... -->
```

### CSS Variables
All design tokens are defined in `base/variables.css`:
- Colors: `--color-primary`, `--color-secondary`, etc.
- Spacing: `--space-1` through `--space-32`
- Typography: `--text-xs` through `--text-6xl`
- Shadows: `--shadow-sm` through `--shadow-2xl`
- Transitions: `--transition-fast`, `--transition-base`, etc.

## Benefits

1. **Maintainability**: Each file has a single responsibility
2. **Performance**: Potential for selective loading
3. **Development**: Easier to find and modify specific styles
4. **Collaboration**: Reduced merge conflicts
5. **Debugging**: Clear separation of concerns

## Migration Notes

- The old `styles.css` is preserved but no longer loaded
- All styles have been carefully extracted and organized
- No visual changes - just better organization
- Fix files (global-text-fix.css, etc.) will be integrated into modules in Phase 2

## Future Improvements

1. Integrate fix files into appropriate modules
2. Add CSS minification build process
3. Implement critical CSS extraction
4. Add CSS linting and formatting rules
5. Create component documentation with examples