#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import postcss from 'postcss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  pages: [
    '/',
    '/fortune/',
    '/tests/',
    '/tools/',
    '/tests/mbti/',
    '/tests/love-dna/',
    '/fortune/daily/',
    '/fortune/saju/',
    '/tools/bmi-calculator.html',
  ],
  cssFile: path.join(rootDir, 'dist/styles.css'),
  outputDir: path.join(rootDir, 'dist/critical'),
  viewport: {
    width: 1200,
    height: 800,
  },
  mobileViewport: {
    width: 375,
    height: 667,
  },
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
 * Extract critical CSS for a specific page
 */
async function extractCriticalCSS(page, url, viewport) {
  try {
    await page.setViewport(viewport);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Get all CSS rules used in the current viewport
    const criticalCSS = await page.evaluate(() => {
      const usedSelectors = new Set();
      const sheets = Array.from(document.styleSheets);

      // Function to check if element is in viewport
      function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
          rect.top < window.innerHeight &&
          rect.bottom > 0 &&
          rect.left < window.innerWidth &&
          rect.right > 0
        );
      }

      // Get all elements in viewport
      const allElements = document.querySelectorAll('*');
      const viewportElements = Array.from(allElements).filter(isInViewport);

      // Extract selectors for viewport elements
      viewportElements.forEach((element) => {
        // Add tag selectors
        usedSelectors.add(element.tagName.toLowerCase());

        // Add class selectors
        if (element.className && typeof element.className === 'string') {
          element.className.split(' ').forEach((className) => {
            if (className.trim()) {
              usedSelectors.add(`.${className.trim()}`);
            }
          });
        }

        // Add ID selectors
        if (element.id) {
          usedSelectors.add(`#${element.id}`);
        }

        // Add attribute selectors for common patterns
        if (element.hasAttribute('data-theme')) {
          usedSelectors.add(`[data-theme="${element.getAttribute('data-theme')}"]`);
        }
      });

      // Always include critical base styles
      const criticalSelectors = [
        ':root',
        'html',
        'body',
        '*',
        '*::before',
        '*::after',
        '@media',
        '@keyframes',
        '.sr-only',
        '.visually-hidden',
        '[data-theme="light"]',
        '[data-theme="dark"]',
      ];

      criticalSelectors.forEach((selector) => usedSelectors.add(selector));

      return Array.from(usedSelectors);
    });

    return criticalCSS;
  } catch (error) {
    log.error(`Failed to extract critical CSS for ${url}: ${error.message}`);
    return [];
  }
}

/**
 * Filter CSS rules based on selectors
 */
async function filterCSSRules(cssContent, selectors) {
  const selectorSet = new Set(selectors);
  const criticalRules = [];

  try {
    const root = postcss.parse(cssContent);

    root.walkRules((rule) => {
      const shouldInclude = rule.selectors.some((selector) => {
        // Direct match
        if (selectorSet.has(selector)) return true;

        // Check for partial matches (for complex selectors)
        const cleanSelector = selector.replace(/::?[a-z-]+(\([^)]*\))?/g, '').trim();
        if (selectorSet.has(cleanSelector)) return true;

        // Check for class and ID matches within complex selectors
        for (const usedSelector of selectorSet) {
          if (usedSelector.startsWith('.') || usedSelector.startsWith('#')) {
            if (selector.includes(usedSelector)) return true;
          }
        }

        return false;
      });

      if (shouldInclude) {
        criticalRules.push(rule.toString());
      }
    });

    // Include all @rules (keyframes, media queries, etc.)
    root.walkAtRules((rule) => {
      if (rule.name === 'media' || rule.name === 'keyframes' || rule.name === 'supports') {
        // Check if the at-rule contains any used selectors
        const hasUsedSelectors =
          rule.toString().includes('.') ||
          rule.toString().includes('#') ||
          rule.name === 'keyframes'; // Always include keyframes

        if (hasUsedSelectors) {
          criticalRules.push(rule.toString());
        }
      } else {
        // Include other at-rules like @charset, @import, etc.
        criticalRules.push(rule.toString());
      }
    });

    return criticalRules.join('\n');
  } catch (error) {
    log.error(`Failed to filter CSS rules: ${error.message}`);
    return '';
  }
}

/**
 * Optimize critical CSS
 */
async function optimizeCriticalCSS(css) {
  try {
    const result = await postcss([
      (await import('cssnano')).default({
        preset: [
          'default',
          {
            discardComments: { removeAll: true },
            normalizeWhitespace: true,
            discardDuplicates: true,
            mergeRules: true,
          },
        ],
      }),
    ]).process(css, { from: undefined });

    return result.css;
  } catch (error) {
    log.warning(`CSS optimization failed: ${error.message}`);
    return css;
  }
}

/**
 * Generate inline CSS for HTML
 */
function generateInlineCSS(criticalCSS) {
  return `<style>
${criticalCSS}
</style>

<script>
// Load non-critical CSS asynchronously
function loadCSS(href) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.media = 'print';
  link.onload = function() { this.media = 'all'; };
  document.head.appendChild(link);
}

// Load main CSS after critical CSS
loadCSS('/dist/styles.min.css');
</script>`;
}

/**
 * Main extraction function
 */
async function main() {
  console.log(`\n${colors.blue}Critical CSS Extraction Tool${colors.reset}\n`);

  const startTime = Date.now();
  let browser;

  try {
    // Check if CSS file exists
    await fs.access(CONFIG.cssFile);
    const cssContent = await fs.readFile(CONFIG.cssFile, 'utf8');
    const originalSize = (cssContent.length / 1024).toFixed(2);

    // Ensure output directory exists
    await ensureOutputDir();

    // Launch browser
    log.info('Starting browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Collect selectors from all pages
    const allSelectors = new Set();
    const pageResults = [];

    for (const pagePath of CONFIG.pages) {
      const url = `${CONFIG.baseUrl}${pagePath}`;
      log.info(`Analyzing page: ${pagePath}`);

      // Extract for desktop
      const desktopSelectors = await extractCriticalCSS(page, url, CONFIG.viewport);
      // Extract for mobile
      const mobileSelectors = await extractCriticalCSS(page, url, CONFIG.mobileViewport);

      const pageSelectors = [...desktopSelectors, ...mobileSelectors];
      pageSelectors.forEach((selector) => allSelectors.add(selector));

      pageResults.push({
        path: pagePath,
        selectors: pageSelectors.length,
        url,
      });

      log.detail(`Found ${pageSelectors.length} selectors`);
    }

    log.info(`\nTotal unique selectors found: ${allSelectors.size}`);

    // Filter CSS based on collected selectors
    log.info('Filtering CSS rules...');
    const criticalCSS = await filterCSSRules(cssContent, Array.from(allSelectors));

    // Optimize critical CSS
    log.info('Optimizing critical CSS...');
    const optimizedCSS = await optimizeCriticalCSS(criticalCSS);

    // Calculate sizes
    const criticalSize = (optimizedCSS.length / 1024).toFixed(2);
    const reduction = ((1 - criticalSize / originalSize) * 100).toFixed(1);

    // Save critical CSS
    const criticalPath = path.join(CONFIG.outputDir, 'critical.css');
    await fs.writeFile(criticalPath, optimizedCSS);

    // Generate inline version
    const inlineCSS = generateInlineCSS(optimizedCSS);
    const inlinePath = path.join(CONFIG.outputDir, 'critical-inline.html');
    await fs.writeFile(inlinePath, inlineCSS);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Summary
    console.log(`\n${colors.green}Critical CSS Extraction Summary:${colors.reset}`);
    console.log('┌─────────────────────────────────────────────────┐');
    console.log(`│ Pages analyzed:   ${CONFIG.pages.length.toString().padEnd(30)} │`);
    console.log(`│ Selectors found:  ${allSelectors.size.toString().padEnd(30)} │`);
    console.log(`│ Original CSS:     ${originalSize.padStart(8)} KB          │`);
    console.log(`│ Critical CSS:     ${criticalSize.padStart(8)} KB          │`);
    console.log(`│ Size reduction:   ${reduction.padStart(8)}%           │`);
    console.log(`│ Processing time:  ${duration.toString().padStart(8)}ms          │`);
    console.log('└─────────────────────────────────────────────────┘');

    console.log(`\n${colors.blue}Output files:${colors.reset}`);
    console.log(`Critical CSS: ${criticalPath}`);
    console.log(`Inline HTML:  ${inlinePath}`);

    console.log(`\n${colors.blue}Implementation:${colors.reset}`);
    console.log('1. Include critical.css inline in <head>');
    console.log('2. Load main CSS asynchronously');
    console.log('3. Expected performance improvement: ~500-1000ms faster rendering');
  } catch (error) {
    log.error('Critical CSS extraction failed!');
    console.error(error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run if called directly
main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});

export { extractCriticalCSS, filterCSSRules };
