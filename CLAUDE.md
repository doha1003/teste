# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment Overview

This is doha.kr - a Korean-language web platform offering psychological tests, fortune-telling services, and utility tools. Built as a static website with serverless backend, optimized for Korean users with PWA features.

## Quick Start

```bash
# Install dependencies
npm install

# Start local development (no build required)
python -m http.server 3000
# Then open http://localhost:3000

# Or use Vercel dev server (includes API endpoints)
npm run dev
```

## Architecture

### Technology Stack
- **Frontend**: Static HTML/CSS/JavaScript (ES6 modules), no build required for basic development
- **Backend**: Vercel serverless functions (Node.js)
- **APIs**: Gemini API for AI fortunes, custom Manseryeok API for Korean calendar
- **Deployment**: GitHub Pages (static site) + Vercel (API endpoints)
- **Design System**: Linear.app-inspired v2.0 with Korean typography optimization
- **Build Tools**: PostCSS for CSS bundling, Rollup for JS bundling (optional)
- **Testing**: Vitest (unit/integration), Playwright (E2E), Puppeteer (error detection)
- **Node Version**: 20.11.0 (managed by Volta)

### Project Structure
```
├── api/                    # Vercel serverless functions
│   ├── fortune.js         # AI-powered fortune API with rate limiting
│   └── manseryeok.js      # Korean calendar conversion API
├── css/                    # Modular CSS architecture
│   ├── core/              # Reset, typography, variables
│   ├── components/        # Reusable UI components
│   ├── features/          # Feature-specific styles
│   ├── pages/             # Page-specific styles
│   └── design-system/     # Design tokens and showcase
├── js/                     # ES6 modules
│   ├── core/              # Core utilities and base classes
│   ├── features/          # Feature implementations
│   ├── pages/             # Page-specific scripts
│   └── utils/             # Utility functions
├── tests/                  # Test suites
│   ├── unit/              # Vitest unit tests
│   ├── integration/       # API integration tests
│   └── e2e/               # Playwright E2E tests
├── fortune/                # Fortune-telling features
├── tests/                  # Psychological test pages
├── tools/                  # Utility tools pages
└── design-system/          # Design system documentation
```

## Key Commands

### Development
```bash
# Direct file editing (no build required)
python -m http.server 3000        # Serve locally

# Development with build tools
npm run dev                       # Vercel dev server (includes API)
npm run build                     # Build CSS and JS bundles
npm run build:css:watch          # Watch CSS changes
npm run build:js:watch           # Watch JS changes
```

### Code Quality
```bash
npm run format                    # Format all files with Prettier
npm run lint                     # Run ESLint
npm run lint:fix                # Fix ESLint issues
```

### Testing
```bash
# Unit and Integration Tests (Vitest)
npm run test                     # Run all Vitest tests
npm run test:watch              # Watch mode for development
npm run test:coverage           # Generate coverage report (80% threshold)
npm run test:unit               # Run only unit tests
npm run test:integration        # Run only integration tests
npx vitest run js/features/fortune/daily-fortune.test.js  # Run specific test file

# E2E Tests (Playwright)
npm run playwright:install      # Install browsers (first time setup)
npm run test:e2e                # Run all E2E tests
npm run test:e2e:ui             # Interactive UI mode
npm run test:e2e:debug          # Debug mode with inspector
npm run test:e2e:headed         # Run with browser visible
npm run playwright:report       # View test report

# Error Detection
node test-doha-errors.js        # Puppeteer-based comprehensive error scan

# Full Test Suite
npm run test:all                # Lint + Coverage + E2E
```

### Performance Analysis
```bash
# Lighthouse Audits
node run-lighthouse-audit.js     # Basic Lighthouse audit
node run-lighthouse-puppeteer.js # Lighthouse with Puppeteer
node run-lighthouse-cli.js       # Lighthouse CLI version

# Performance Metrics
node analyze-performance-metrics.js  # Bundle size and performance analysis
npm run build:css:measure       # Measure CSS build performance
npm run build:js:analyze        # Analyze JS bundle with source maps

# Bundle Size Checks
npx bundlesize                  # Check bundle sizes against limits
gzip-size dist/styles.css       # Check gzipped CSS size
```

### Deployment
```bash
npm run deploy                   # Deploy to Vercel
# GitHub Pages auto-deploys on push to main branch
```

### CSS Management
```bash
# CSS Build Pipeline
npm run build:css               # Build CSS bundle (PostCSS with imports)
npm run build:css:watch         # Watch mode for CSS development
npm run minify:css              # Minify all CSS files
npm run build:css:measure       # Measure CSS build performance

# CSS Architecture:
# - 52+ individual CSS files organized by type
# - Bundled into single dist/styles.css for production
# - Uses PostCSS with postcss-import for @import resolution
# - Production build includes cssnano for minification
```

### Image Optimization
```bash
npm run optimize:images         # Optimize images with sharp
```

## API Development

### Vercel Functions
- Located in `/api/` directory
- Environment variables set in Vercel dashboard
- Rate limiting implemented per IP
- CORS configuration in `api/cors-config.js`

### Key APIs
1. **Fortune API** (`/api/fortune`)
   - POST request with `type` and `userData`
   - Uses Gemini API for AI responses
   - Rate limited to 60 requests/minute per IP

2. **Manseryeok API** (`/api/manseryeok`)
   - POST request with date parameters
   - Returns 60갑자 and lunar calendar data
   - Custom Korean calendar calculations

## Design System Usage

### Theme Implementation
- Import tokens: `css/design-system/tokens.css`
- Use CSS variables: `var(--color-primary)`, `var(--spacing-md)`
- Theme switching via localStorage
- Dark/light/system modes supported

### Korean Typography
- Font: Pretendard Variable
- Apply `word-break: keep-all` for proper Korean text wrapping
- Line height: 1.7 for readability
- Prevent text/emoji overlap with `flex-shrink: 0`

### Component Guidelines
- Follow BEM methodology for CSS classes
- Use semantic HTML elements
- Ensure WCAG 2.1 AA compliance
- Test on mobile devices (Korean keyboards)

## Testing Strategy

### Unit Tests (Vitest)
- Test files: `*.test.js` in unit/integration folders
- Run specific test: `npx vitest run path/to/test.js`
- Coverage threshold: 80% for all metrics

### E2E Tests (Playwright)
- Critical user flows in `tests/e2e/`
- Multi-browser testing (Chrome, Firefox, Safari, Mobile)
- Korean locale settings applied

### Manual Testing Checklist
- Korean text rendering and encoding (UTF-8)
- PWA installation on mobile devices
- Offline functionality with service worker
- API rate limiting behavior
- Theme switching persistence
- Fortune interpretations cultural accuracy

## Security Considerations

### Content Security Policy
- Configured in `vercel.json` and meta tags
- Report URI: `/api/csp-report`
- Allows required external resources (Google Analytics, fonts, etc.)

### API Security
- Environment variables for sensitive data
- Input validation in `api/validation.js`
- Rate limiting per IP address
- CORS restricted to allowed origins

### Client-Side Security
- DOM sanitization with DOMPurify
- Secure localStorage handling
- No inline scripts in production

## Performance Optimization

### CSS Bundling
- Development: Individual files for easier debugging
- Production: Single minified bundle
- Critical CSS inlined in HTML
- 96% reduction in network requests

### JavaScript Optimization
- ES6 modules with lazy loading
- Service worker for offline caching
- Code splitting for large features
- Rollup bundling for production

### Lighthouse Targets
- Performance: 90+
- Accessibility: 95+
- SEO: 100
- PWA: 100

## JavaScript Architecture

### Service-Based Pattern
Each feature has a dedicated service class in `js/features/*/`:
```javascript
// Example: js/features/fortune/daily-fortune.js
class DailyFortuneService {
  constructor() {
    this.apiManager = window.APIManager;
  }
  async generateFortune(userData) {
    // Implementation
  }
}
```

### API Gateway Pattern
All API calls go through `js/api-config.js`:
```javascript
// Use APIManager for all external calls
const result = await window.APIManager.callAPI('fortune', requestData);
```

### Error Handling
Centralized error handling via `js/error-handler.js`:
```javascript
try {
  // Your code
} catch (error) {
  window.ErrorHandler.handle(error, 'Feature Name');
}
```

## Common Development Patterns

### Adding a New Feature
1. Create feature module in `js/features/`
2. Add corresponding styles in `css/features/`
3. Import in relevant page scripts
4. Update service worker cache list if critical
5. Add tests for new functionality

### Creating a New Test/Tool
1. Create HTML page following existing structure
2. Add page-specific JS in `js/pages/`
3. Style with modular CSS approach
4. Ensure Korean language considerations
5. Update navigation and sitemap.xml

### API Endpoint Addition
1. Create new file in `api/` directory
2. Implement rate limiting and validation
3. Add CORS configuration
4. Update `vercel.json` if needed
5. Document in API section above

## Korean Cultural Considerations

### Date/Time
- Format: YYYY년 MM월 DD일
- Support lunar calendar conversions
- Time zone: Asia/Seoul

### Fortune Content
- Maintain traditional 사주 (Saju) accuracy
- Use appropriate honorifics
- Respect cultural symbolism
- Validate 60갑자 calculations

### UI/UX
- Right-to-left reading patterns
- Larger touch targets for Korean input
- Test with Korean IME keyboards
- Avoid Western-centric assumptions

## Build System Details

### CSS Build Process
1. **Entry Point**: `css/main.css` imports all other CSS files
2. **Build Tool**: PostCSS with `postcss-import` plugin
3. **Output**: `dist/styles.css` (development) or `dist/styles.min.css` (production)
4. **Source Maps**: Generated for development builds
5. **Performance**: ~480ms faster page loads with bundling

### JavaScript Build Process
1. **Entry Points**: Multiple entry points for different features
2. **Build Tool**: Rollup with ES6 module support
3. **Tree Shaking**: Automatic dead code elimination
4. **Code Splitting**: Supported for large features
5. **Minification**: Terser for production builds

### HTML Updates
After building CSS/JS bundles:
```bash
npm run update:html         # Update HTML files for production bundles
npm run update:html:dev     # Update HTML files for development
```

## Environment Variables

### Vercel Environment
- `GEMINI_API_KEY`: Required for fortune API
- `NODE_ENV`: Set to 'production' in Vercel
- `VERCEL_URL`: Automatically set by Vercel

### Local Development
Create `.env.local` for local API testing:
```
GEMINI_API_KEY=your_api_key_here
```

## Common Issues and Solutions

### CSS not updating
- Clear browser cache or hard refresh (Ctrl+Shift+R)
- Check if CSS build completed successfully
- Verify HTML references correct CSS file

### API rate limiting in development
- Rate limits are per IP (60 req/min)
- Use different fortune types to spread requests
- Implement client-side caching

### Korean text encoding issues
- Ensure all files saved as UTF-8
- Add `<meta charset="UTF-8">` in HTML
- Check Content-Type headers in responses

### Service Worker cache issues
- Update version number in `sw.js`
- Clear browser cache and service worker
- Use "Update on reload" in DevTools

### Test failures
- Run `npm install` to ensure dependencies
- Check Node version (should be 20.11.0)
- For E2E tests, run `npm run playwright:install` first