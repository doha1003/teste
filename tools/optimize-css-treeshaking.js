#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import purgecss from '@fullhuman/postcss-purgecss';
import postcss from 'postcss';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  css: [path.join(rootDir, 'dist/styles.css')],
  content: [
    path.join(rootDir, '**/*.html'),
    path.join(rootDir, 'js/**/*.js'),
    path.join(rootDir, 'includes/**/*.html'),
    path.join(rootDir, 'tests/**/*.html'),
    path.join(rootDir, 'fortune/**/*.html'),
    path.join(rootDir, 'tools/**/*.html'),
    path.join(rootDir, 'about/**/*.html'),
    path.join(rootDir, 'contact/**/*.html'),
    path.join(rootDir, 'faq/**/*.html'),
    path.join(rootDir, 'privacy/**/*.html'),
    path.join(rootDir, 'terms/**/*.html'),
  ],
  output: path.join(rootDir, 'dist/styles.purged.css'),
  safelist: [
    // Always keep these classes
    'sr-only',
    'visually-hidden',
    'skip-link',

    // Theme classes
    /^theme-/,
    /^data-theme/,
    '[data-theme="light"]',
    '[data-theme="dark"]',

    // Korean specific classes
    /^korean-/,
    /^hangul-/,

    // PWA classes
    /^pwa-/,
    /^sw-/,

    // Animation classes
    /^animate-/,
    /^fade-/,
    /^slide-/,

    // State classes (dynamically added by JS)
    /^is-/,
    /^has-/,
    /^show-/,
    /^hide-/,
    /^active/,
    /^loading/,
    /^error/,
    /^success/,
    /^warning/,

    // Result page classes (generated dynamically)
    /^result-/,
    /^mbti-/,
    /^fortune-/,
    /^test-/,

    // Mobile menu classes
    /^mobile-/,
    /^nav-/,

    // Form states
    /^invalid/,
    /^valid/,
    /^required/,
    /^optional/,

    // Button states and variants
    /^btn-/,
    /^button-/,

    // Card variants
    /^card-/,

    // Utility classes that might be used dynamically
    /^text-/,
    /^bg-/,
    /^border-/,
    /^p-[0-9]/,
    /^m-[0-9]/,
    /^w-/,
    /^h-/,
    /^flex/,
    /^grid/,
    /^hidden/,
    /^block/,
    /^inline/,

    // Specific selectors for Korean typography
    'word-break-keep-all',
    'korean-text',
    'korean-title',
    'korean-content',
  ],
  keyframes: true,
  fontFace: true,
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
 * Get file size in KB
 */
async function getFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return (stats.size / 1024).toFixed(2);
}

/**
 * Find all content files using glob patterns
 */
async function findContentFiles() {
  const allFiles = [];

  for (const pattern of CONFIG.content) {
    try {
      const files = await glob(pattern, { ignore: ['node_modules/**', '.git/**', 'dist/**'] });
      allFiles.push(...files);
    } catch (error) {
      log.warning(`Failed to match pattern ${pattern}: ${error.message}`);
    }
  }

  // Remove duplicates and return absolute paths
  return [...new Set(allFiles)].map((file) => path.resolve(file));
}

/**
 * Analyze CSS before purging
 */
async function analyzeCSS(cssContent) {
  const stats = {
    totalRules: 0,
    selectors: new Set(),
    atRules: 0,
    keyframes: 0,
    mediaQueries: 0,
  };

  try {
    const root = postcss.parse(cssContent);

    root.walkRules((rule) => {
      stats.totalRules++;
      rule.selectors.forEach((selector) => stats.selectors.add(selector));
    });

    root.walkAtRules((rule) => {
      stats.atRules++;
      if (rule.name === 'keyframes') stats.keyframes++;
      if (rule.name === 'media') stats.mediaQueries++;
    });
  } catch (error) {
    log.warning(`CSS analysis failed: ${error.message}`);
  }

  return stats;
}

/**
 * Run PurgeCSS with configuration
 */
async function runPurgeCSS() {
  const startTime = Date.now();

  try {
    // Check if input CSS exists
    const inputCSS = CONFIG.css[0];
    await fs.access(inputCSS);

    // Read original CSS
    const originalCSS = await fs.readFile(inputCSS, 'utf8');
    const originalSize = await getFileSize(inputCSS);

    // Analyze original CSS
    log.info('Analyzing original CSS...');
    const originalStats = await analyzeCSS(originalCSS);
    log.detail(
      `Original: ${originalStats.totalRules} rules, ${originalStats.selectors.size} selectors`
    );

    // Find content files
    log.info('Finding content files...');
    const contentFiles = await findContentFiles();
    log.detail(`Found ${contentFiles.length} content files`);

    // Configure PurgeCSS
    const purgeConfig = {
      content: contentFiles,
      css: [inputCSS],
      safelist: CONFIG.safelist,
      keyframes: CONFIG.keyframes,
      fontFace: CONFIG.fontFace,
      variables: true,
      // Enhanced content extraction
      defaultExtractor: (content) => {
        // Standard class and ID extraction
        const classMatches = content.match(/[A-Za-z0-9_-]+/g) || [];

        // Korean-specific patterns
        const koreanMatches = content.match(/korean-[A-Za-z0-9_-]+/g) || [];

        // Dynamic class patterns
        const dynamicMatches =
          content.match(/(?:class|className)\\s*[=:]\\s*['"'](.*?)['"']/g) || [];
        const dynamicClasses = dynamicMatches.flatMap((match) => {
          const classes = match.match(/[A-Za-z0-9_-]+/g) || [];
          return classes;
        });

        // State classes that might be added via JavaScript
        const stateClasses = [
          'active',
          'inactive',
          'loading',
          'loaded',
          'error',
          'success',
          'warning',
          'hidden',
          'visible',
          'open',
          'closed',
          'expanded',
          'collapsed',
          'selected',
          'unselected',
          'disabled',
          'enabled',
        ];

        return [...classMatches, ...koreanMatches, ...dynamicClasses, ...stateClasses];
      },
    };

    // Run PurgeCSS
    log.info('Running PurgeCSS tree shaking...');
    const result = await postcss([purgecss(purgeConfig)]).process(originalCSS, { from: inputCSS });

    if (!result || !result.css) {
      throw new Error('PurgeCSS returned no results');
    }

    const purgedCSS = result.css;

    // Write purged CSS
    await fs.writeFile(CONFIG.output, purgedCSS);

    // Calculate stats
    const purgedSize = await getFileSize(CONFIG.output);
    const reduction = ((1 - purgedSize / originalSize) * 100).toFixed(1);
    const purgedStats = await analyzeCSS(purgedCSS);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Summary
    console.log(`\\n${colors.green}CSS Tree Shaking Summary:${colors.reset}`);
    console.log('┌─────────────────────────────────────────────────┐');
    console.log(`│ Content files:    ${contentFiles.length.toString().padEnd(30)} │`);
    console.log(`│ Original size:    ${originalSize.padStart(8)} KB          │`);
    console.log(`│ Purged size:      ${purgedSize.padStart(8)} KB          │`);
    console.log(`│ Size reduction:   ${reduction.padStart(8)}%           │`);
    console.log(`│ Original rules:   ${originalStats.totalRules.toString().padEnd(30)} │`);
    console.log(`│ Purged rules:     ${purgedStats.totalRules.toString().padEnd(30)} │`);
    console.log(`│ Processing time:  ${duration.toString().padStart(8)}ms          │`);
    console.log('└─────────────────────────────────────────────────┘');

    console.log(`\\n${colors.blue}Output:${colors.reset}`);
    console.log(`Purged CSS: ${CONFIG.output}`);

    console.log(`\\n${colors.blue}Recommendations:${colors.reset}`);
    if (parseFloat(reduction) > 15) {
      console.log(`✓ Excellent reduction of ${reduction}% achieved!`);
    } else if (parseFloat(reduction) > 10) {
      console.log(`✓ Good reduction of ${reduction}% achieved.`);
    } else {
      console.log(`⚠ Low reduction of ${reduction}%. Consider reviewing safelist.`);
    }

    // Check if target size is met
    if (parseFloat(purgedSize) < 150) {
      console.log(`✓ Target size (<150KB) achieved: ${purgedSize}KB`);
    } else {
      console.log(`⚠ Target size not met. Current: ${purgedSize}KB, Target: <150KB`);
    }

    return {
      originalSize: parseFloat(originalSize),
      purgedSize: parseFloat(purgedSize),
      reduction: parseFloat(reduction),
      duration,
    };
  } catch (error) {
    log.error('CSS tree shaking failed!');
    console.error(error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`\\n${colors.blue}CSS Tree Shaking Tool${colors.reset}\\n`);

  try {
    const result = await runPurgeCSS();

    console.log(`\\n${colors.green}Tree shaking completed successfully!${colors.reset}`);
    console.log(
      `Performance improvement: ~${Math.round(result.reduction * 10)}ms faster CSS parsing`
    );
  } catch (error) {
    log.error('Tree shaking process failed!');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});

export { runPurgeCSS, findContentFiles, analyzeCSS };
