#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  fonts: {
    pretendard: {
      name: 'Pretendard Variable',
      formats: ['woff2', 'woff'],
      weights: ['400', '500', '600', '700'],
      unicode: ['U+AC00-D7AF', 'U+1100-11FF', 'U+3130-318F'], // Korean characters
      display: 'swap',
    },
    notoSansKR: {
      name: 'Noto Sans KR',
      formats: ['woff2'],
      weights: ['400', '500'],
      unicode: ['U+AC00-D7AF'],
      display: 'swap',
    },
  },
  outputDir: path.join(rootDir, 'css/fonts'),
  preloadCritical: ['Pretendard Variable:400', 'Pretendard Variable:500'],
};

// Console colors
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  detail: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`),
};

/**
 * Ensure output directory exists
 */
async function ensureOutputDir() {
  try {
    await fs.access(CONFIG.outputDir);
  } catch {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    log.info(`Created output directory: ${CONFIG.outputDir}`);
  }
}

/**
 * Generate optimized font CSS
 */
function generateFontCSS() {
  let css = `/* Optimized Font Loading Strategy */\n\n`;

  // Add font-display: swap for better performance
  css += `/* Font Display Strategy */\n`;
  css += `@supports (font-display: swap) {\n`;
  css += `  * { font-display: swap; }\n`;
  css += `}\n\n`;

  // Generate @font-face declarations
  for (const [fontKey, font] of Object.entries(CONFIG.fonts)) {
    css += `/* ${font.name} */\n`;

    font.weights.forEach((weight) => {
      font.formats.forEach((format) => {
        const mimeType = format === 'woff2' ? 'font/woff2' : 'font/woff';

        css += `@font-face {\n`;
        css += `  font-family: '${font.name}';\n`;
        css += `  font-style: normal;\n`;
        css += `  font-weight: ${weight};\n`;
        css += `  font-display: ${font.display};\n`;
        css += `  src: url('/fonts/${fontKey}-${weight}.${format}') format('${mimeType}');\n`;
        if (font.unicode) {
          css += `  unicode-range: ${font.unicode.join(', ')};\n`;
        }
        css += `}\n\n`;
      });
    });
  }

  // Add Korean-optimized font stack
  css += `/* Korean-Optimized Font Stack */\n`;
  css += `:root {\n`;
  css += `  --font-korean-primary: "Pretendard Variable", "Pretendard", sans-serif;\n`;
  css += `  --font-korean-fallback: "Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;\n`;
  css += `  --font-system: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n`;
  css += `  --font-monospace: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace;\n`;
  css += `}\n\n`;

  // Base typography with Korean optimization
  css += `/* Korean Typography Optimization */\n`;
  css += `html {\n`;
  css += `  font-family: var(--font-korean-primary), var(--font-korean-fallback), var(--font-system);\n`;
  css += `  font-variant-ligatures: none; /* Disable ligatures for Korean */\n`;
  css += `  text-rendering: optimizeSpeed; /* Optimize for Korean rendering */\n`;
  css += `  -webkit-font-smoothing: antialiased;\n`;
  css += `  -moz-osx-font-smoothing: grayscale;\n`;
  css += `}\n\n`;

  css += `/* Korean Text Optimization */\n`;
  css += `body, .korean-text {\n`;
  css += `  word-break: keep-all; /* Prevent breaking Korean words */\n`;
  css += `  line-height: 1.7; /* Optimal line height for Korean */\n`;
  css += `  letter-spacing: -0.02em; /* Slight negative tracking for Korean */\n`;
  css += `}\n\n`;

  // Font size optimization for Korean
  css += `/* Korean Font Size Optimization */\n`;
  css += `@media screen and (max-width: 768px) {\n`;
  css += `  body {\n`;
  css += `    font-size: 16px; /* Minimum readable size for Korean on mobile */\n`;
  css += `  }\n`;
  css += `}\n\n`;

  // Performance hints
  css += `/* Performance Optimization */\n`;
  css += `.font-loaded {\n`;
  css += `  font-family: var(--font-korean-primary);\n`;
  css += `}\n\n`;

  css += `.font-loading {\n`;
  css += `  font-family: var(--font-system); /* Fallback during loading */\n`;
  css += `  visibility: hidden;\n`;
  css += `}\n\n`;

  css += `.font-loaded .font-loading {\n`;
  css += `  visibility: visible;\n`;
  css += `}\n`;

  return css;
}

/**
 * Generate font preload HTML
 */
function generatePreloadHTML() {
  let html = `<!-- Font Preloading for Critical Fonts -->\n`;

  CONFIG.preloadCritical.forEach((fontSpec) => {
    const [fontName, weight] = fontSpec.split(':');
    const fontKey = fontName.toLowerCase().replace(/\s+/g, '');

    html += `<link rel="preload" href="/fonts/${fontKey}-${weight}.woff2" as="font" type="font/woff2" crossorigin>\n`;
  });

  html += `\n<!-- Font Loading Script -->\n`;
  html += `<script>\n`;
  html += `  // Font loading optimization\n`;
  html += `  (function() {\n`;
  html += `    document.documentElement.classList.add('font-loading');\n`;
  html += `    \n`;
  html += `    // Check if fonts are already loaded (cached)\n`;
  html += `    if (document.fonts && document.fonts.ready) {\n`;
  html += `      document.fonts.ready.then(function() {\n`;
  html += `        document.documentElement.classList.remove('font-loading');\n`;
  html += `        document.documentElement.classList.add('font-loaded');\n`;
  html += `      });\n`;
  html += `    } else {\n`;
  html += `      // Fallback for older browsers\n`;
  html += `      setTimeout(function() {\n`;
  html += `        document.documentElement.classList.remove('font-loading');\n`;
  html += `        document.documentElement.classList.add('font-loaded');\n`;
  html += `      }, 3000); // 3s timeout\n`;
  html += `    }\n`;
  html += `  })();\n`;
  html += `</script>\n`;

  return html;
}

/**
 * Generate Service Worker font caching strategy
 */
function generateSWFontStrategy() {
  return `
// Font caching strategy for Service Worker
const FONT_CACHE_NAME = 'fonts-v1';
const FONT_URLS = [
  '/fonts/pretendardvariable-400.woff2',
  '/fonts/pretendardvariable-500.woff2',
  '/fonts/pretendardvariable-600.woff2',
  '/fonts/pretendardvariable-700.woff2'
];

// Install event - cache critical fonts
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(FONT_CACHE_NAME)
      .then(cache => cache.addAll(FONT_URLS))
  );
});

// Fetch event - serve fonts from cache
self.addEventListener('fetch', event => {
  if (event.request.destination === 'font') {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          // If not in cache, fetch and cache
          return fetch(event.request)
            .then(response => {
              const responseClone = response.clone();
              caches.open(FONT_CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
              return response;
            });
        })
    );
  }
});
`;
}

/**
 * Generate font optimization report
 */
function generateOptimizationReport() {
  const totalFonts = Object.values(CONFIG.fonts).reduce(
    (total, font) => total + font.weights.length * font.formats.length,
    0
  );

  return {
    totalFontFiles: totalFonts,
    criticalFonts: CONFIG.preloadCritical.length,
    optimizations: [
      'font-display: swap for better LCP',
      'Unicode range subsetting for Korean',
      'WOFF2 format prioritization',
      'Preloading critical fonts',
      'Service Worker caching strategy',
      'Korean-specific typography rules',
    ],
    estimatedPerformanceGain: {
      fcp: '200-500ms faster',
      lcp: '300-800ms faster',
      cls: 'Reduced layout shift',
    },
  };
}

/**
 * Main optimization function
 */
async function main() {
  console.log(`\n${colors.blue}Font Optimization Tool${colors.reset}\n`);

  const startTime = Date.now();

  try {
    // Ensure output directory exists
    await ensureOutputDir();

    // Generate optimized font CSS
    log.info('Generating optimized font CSS...');
    const fontCSS = generateFontCSS();
    const cssPath = path.join(CONFIG.outputDir, 'korean-fonts.css');
    await fs.writeFile(cssPath, fontCSS);
    log.success(`Generated: ${cssPath}`);

    // Generate preload HTML snippet
    log.info('Generating font preload HTML...');
    const preloadHTML = generatePreloadHTML();
    const htmlPath = path.join(CONFIG.outputDir, 'font-preload.html');
    await fs.writeFile(htmlPath, preloadHTML);
    log.success(`Generated: ${htmlPath}`);

    // Generate Service Worker strategy
    log.info('Generating Service Worker font strategy...');
    const swStrategy = generateSWFontStrategy();
    const swPath = path.join(CONFIG.outputDir, 'font-sw-strategy.js');
    await fs.writeFile(swPath, swStrategy);
    log.success(`Generated: ${swPath}`);

    // Generate optimization report
    const report = generateOptimizationReport();

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Summary
    console.log(`\n${colors.green}Font Optimization Summary:${colors.reset}`);
    console.log('┌─────────────────────────────────────────────────┐');
    console.log(`│ Font files configured: ${report.totalFontFiles.toString().padEnd(25)} │`);
    console.log(`│ Critical fonts:        ${report.criticalFonts.toString().padEnd(25)} │`);
    console.log(`│ Processing time:       ${duration.toString().padStart(8)}ms          │`);
    console.log('└─────────────────────────────────────────────────┘');

    console.log(`\n${colors.blue}Optimizations Applied:${colors.reset}`);
    report.optimizations.forEach((opt) => {
      console.log(`  ✓ ${opt}`);
    });

    console.log(`\n${colors.blue}Expected Performance Gains:${colors.reset}`);
    console.log(`  FCP (First Contentful Paint): ${report.estimatedPerformanceGain.fcp}`);
    console.log(`  LCP (Largest Contentful Paint): ${report.estimatedPerformanceGain.lcp}`);
    console.log(`  CLS (Cumulative Layout Shift): ${report.estimatedPerformanceGain.cls}`);

    console.log(`\n${colors.blue}Implementation Steps:${colors.reset}`);
    console.log('1. Include korean-fonts.css in your main CSS');
    console.log('2. Add font-preload.html content to <head>');
    console.log('3. Integrate font-sw-strategy.js into Service Worker');
    console.log('4. Place font files in /fonts/ directory');
    console.log('5. Test with Korean content on various devices');
  } catch (error) {
    log.error('Font optimization failed!');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});

export { generateFontCSS, generatePreloadHTML, generateSWFontStrategy };
