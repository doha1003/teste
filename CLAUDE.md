# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

doha.kr - Korean-language web platform providing psychological tests, fortune-telling services, and utility tools. Built as a static website with Vercel serverless backend, optimized for Korean users with PWA features.

## Key Commands

### Development
```bash
# Quick start (no build required)
python -m http.server 3000              # Static file server
vercel dev                               # With API endpoints

# Build commands
npm run build                            # Build CSS and JS bundles
npm run build:css:watch                 # Watch CSS changes
npm run build:js:watch                  # Watch JS changes
```

### Testing
```bash
# Unit/Integration Tests (Vitest)
npm run test                            # Run all tests
npm run test:watch                      # Watch mode
npm run test:coverage                   # Coverage report (80% threshold)
npx vitest run tests/unit/specific.test.js  # Run specific test

# E2E Tests (Playwright)
npm run playwright:install              # First-time setup
npm run test:e2e                       # Run E2E tests
npm run test:e2e:ui                    # Interactive UI mode
npm run test:e2e:debug                 # Debug mode
npm run playwright:report              # View test report

# Comprehensive Testing
npm run test:all                       # Lint + Coverage + E2E
node test-doha-errors.js               # Puppeteer error detection
```

### Code Quality
```bash
npm run lint                           # ESLint check
npm run lint:fix                       # Auto-fix issues
npm run format                          # Prettier formatting
```

### Performance Analysis
```bash
node run-lighthouse-audit.js           # Lighthouse audit
node analyze-performance-metrics.js    # Bundle analysis
npm run build:css:measure             # CSS build performance
```

### Deployment
```bash
npm run deploy                         # Deploy to Vercel
# GitHub Pages auto-deploys on push to main
```

## Architecture

### Tech Stack
- **Frontend**: Static HTML/CSS/JavaScript (ES6 modules)
- **Backend**: Vercel serverless functions (Node.js)
- **APIs**: Gemini API (AI fortunes), Custom Manseryeok API
- **Deployment**: GitHub Pages (static) + Vercel (API)
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **Build Tools**: PostCSS (CSS), Rollup (JS)
- **Node Version**: 20.11.0 (managed by Volta)

### Directory Structure
```
├── api/                # Vercel serverless functions
│   ├── fortune.js     # AI-powered fortune API
│   └── manseryeok.js  # Korean calendar API
├── css/               # Modular CSS architecture
│   ├── core/          # Reset, typography, variables
│   ├── components/    # Reusable UI components  
│   ├── features/      # Feature-specific styles
│   └── pages/         # Page-specific styles
├── js/                # ES6 modules
│   ├── core/          # Base utilities
│   ├── features/      # Feature implementations
│   └── pages/         # Page-specific scripts
├── tests/             # Test suites
│   ├── unit/          # Vitest unit tests
│   ├── integration/   # API tests
│   └── e2e/           # Playwright E2E tests
└── tools/             # Build and utility scripts
```

## CSS/JS Build System

### CSS Pipeline
- Entry: `css/main.css` imports all CSS files
- PostCSS with `postcss-import` resolves @import statements  
- Output: `dist/styles.css` (dev) or `dist/styles.min.css` (prod)
- 52+ individual CSS files bundled into single file for production

### JavaScript Pipeline
- Rollup bundles ES6 modules with tree shaking
- Multiple entry points for different features
- Terser minification for production
- Source maps for development

## API Development

### Vercel Functions Configuration
- Functions in `/api/` directory
- Environment variables in Vercel dashboard
- Rate limiting: 60 requests/minute per IP
- CORS configured in `vercel.json`

### Key API Endpoints
- `/api/fortune` - AI fortune generation (POST)
- `/api/manseryeok` - Korean calendar conversion (POST)
- `/api/health` - Health check endpoint (GET)
- `/api/analytics` - Analytics collection (POST)

## Multi-Agent Collaboration

### Required Process
For all tasks involving multiple agents:

1. **Always start with doha-project-lead**
   - Analyzes requirements
   - Creates detailed instructions for sub-agents
   - Orchestrates execution order

2. **Execute sub-agents as directed**
   - Follow project lead's instructions
   - Stay within assigned scope
   - Report results back

3. **Project lead validates integration**
   - Verifies all work is compatible
   - Ensures file references are consistent
   - Performs final checks

### Available Agents
- `doha-project-lead` - Strategic oversight and coordination
- `doha-architect` - System design and specifications
- `frontend-engineer` - HTML/CSS/JS implementation
- `serverless-backend-engineer` - API development
- `qa-test-automation` - Testing and quality assurance
- `pwa-optimization-specialist` - PWA features and performance
- `devops-deployment-engineer` - CI/CD and deployment
- `fortune-content-strategist` - Fortune content planning
- `psychological-test-strategist` - Test design and content
- `utility-tools-ux-writer` - Korean UX copy for tools

## Korean Language Considerations

### Typography
- Font: Pretendard Variable
- Line height: 1.7 for readability
- `word-break: keep-all` for proper Korean text wrapping
- Prevent text/emoji overlap with `flex-shrink: 0`

### Date/Time Formatting
- Format: YYYY년 MM월 DD일
- Timezone: Asia/Seoul
- Lunar calendar support via Manseryeok API

### Fortune Content
- Maintain traditional 사주 (Saju) accuracy
- Use appropriate honorifics
- Respect cultural symbolism
- Validate 60갑자 calculations

## Security Configuration

### Content Security Policy
- Configured in `vercel.json` and meta tags
- Allows required external resources
- Report URI: `/api/csp-report`

### API Security
- Environment variables for sensitive data
- Input validation in `api/validation.js`
- Rate limiting per IP address
- CORS restricted to allowed origins

## Performance Targets

### Lighthouse Scores
- Performance: 90+
- Accessibility: 95+
- SEO: 100
- PWA: 100

### Optimization Strategies
- CSS bundling reduces requests by 96%
- Service worker for offline functionality
- Lazy loading for images and non-critical JS
- Critical CSS inlined in HTML

## Common Development Patterns

### Adding New Features
1. Create feature module in `js/features/`
2. Add styles in `css/features/`
3. Import in relevant page scripts
4. Update service worker cache if critical
5. Add tests for functionality

### API Gateway Pattern
All API calls go through `js/api-config.js`:
```javascript
const result = await window.APIManager.callAPI('fortune', requestData);
```

### Error Handling
Centralized via `js/error-handler.js`:
```javascript
try {
  // Your code
} catch (error) {
  window.ErrorHandler.handle(error, 'Feature Name');
}
```

## Testing Strategy

### Test Types
- **Unit Tests**: Business logic in `tests/unit/`
- **Integration Tests**: API endpoints in `tests/integration/`
- **E2E Tests**: User flows in `tests/e2e/`
- **Accessibility Tests**: WCAG compliance
- **Performance Tests**: Load times and metrics
- **Localization Tests**: Korean language features

### Coverage Requirements
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Environment Variables

### Required for Development
```bash
GEMINI_API_KEY=your_api_key_here  # In .env.local for local testing
```

### Vercel Environment
- `GEMINI_API_KEY` - Required for fortune API
- `NODE_ENV` - Set to 'production' in Vercel
- `VERCEL_URL` - Automatically set by Vercel

## Common Issues and Solutions

### CSS not updating
- Clear browser cache (Ctrl+Shift+R)
- Check if CSS build completed
- Verify HTML references correct CSS file

### API rate limiting
- 60 requests/minute per IP
- Implement client-side caching
- Use different fortune types to spread requests

### Korean text encoding
- Save all files as UTF-8
- Add `<meta charset="UTF-8">` in HTML
- Check Content-Type headers

### Service Worker issues
- Update version in `sw.js`
- Clear browser cache and service worker
- Use "Update on reload" in DevTools

### Test failures
- Run `npm install` to ensure dependencies
- Check Node version (should be 20.11.0)
- For E2E: run `npm run playwright:install` first

## Critical Files

### Core Configuration
- `vercel.json` - Deployment and serverless configuration
- `manifest.json` - PWA configuration
- `sw.js` - Service worker for offline functionality
- `api-config.js` - Central API configuration

### Build Configuration
- `rollup.config.js` - JavaScript bundling
- `tools/build-css.js` - CSS bundling logic
- `vitest.config.js` - Unit test configuration
- `playwright.config.js` - E2E test configuration