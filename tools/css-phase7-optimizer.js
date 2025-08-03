#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration for Phase 7-2 CSS Optimization
const CONFIG = {
  input: {
    main: path.join(rootDir, 'css', 'main.css'),
    critical: path.join(rootDir, 'dist', 'critical', 'critical.css'),
  },
  output: {
    dir: path.join(rootDir, 'dist'),
    critical: 'critical.min.css', // Under 20KB target
    main: 'styles.ultra.css', // Under 130KB target
    combined: 'styles.phase7.css', // Under 150KB total
  },
  targets: {
    totalSize: 150, // KB
    criticalSize: 20, // KB
    mainSize: 130, // KB
    buildTime: 380, // ms
    reduction: 15, // %
  },
};

// Console colors
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  detail: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`),
  progress: (msg) => console.log(`${colors.cyan}⚡${colors.reset} ${msg}`),
  phase: (msg) => console.log(`${colors.magenta}🚀${colors.reset} ${msg}`),
};

/**
 * Get file size in KB
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return parseFloat((stats.size / 1024).toFixed(2));
  } catch {
    return 0;
  }
}

/**
 * Ultra-aggressive CSS minification
 */
async function ultraMinifyCSS(css) {
  // Remove excessive whitespace and comments
  let minified = css
    // Remove all comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove unnecessary whitespace
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*,\s*/g, ',')
    // Remove trailing semicolons
    .replace(/;}/g, '}')
    // Remove empty rules
    .replace(/[^{}]*{\s*}/g, '')
    // Compress colors
    .replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3')
    // Remove quotes from font names when possible
    .replace(/font-family:\s*["']([^"',]+)["']/g, 'font-family:$1')
    // Compress zero values
    .replace(/\b0px\b/g, '0')
    .replace(/\b0em\b/g, '0')
    .replace(/\b0rem\b/g, '0')
    .replace(/\b0%\b/g, '0')
    .replace(/:\s*0\s+0\s+0\s+0/g, ':0')
    .replace(/:\s*0\s+0\s+0/g, ':0')
    .replace(/:\s*0\s+0/g, ':0')
    // Remove unnecessary decimal places
    .replace(/(\d+)\.0+([^\d])/g, '$1$2')
    .trim();

  return minified;
}

/**
 * Remove duplicate CSS rules
 */
function removeDuplicateRules(css) {
  const rules = new Set();
  const lines = css.split('\n');
  const result = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !rules.has(trimmed)) {
      rules.add(trimmed);
      result.push(line);
    }
  }

  return result.join('\n');
}

/**
 * Extract only essential CSS for Korean typography
 */
function extractEssentialCSS(css) {
  const essentialPatterns = [
    // Root variables
    /:root\s*{[^}]*}/g,
    // Korean font definitions
    /font-family[^;]*korean[^;]*;?/gi,
    /word-break:\s*keep-all[^;]*;?/gi,
    // Critical layout
    /\.container[^{]*{[^}]*}/g,
    /\.grid[^{]*{[^}]*}/g,
    /\.flex[^{]*{[^}]*}/g,
    // Essential utilities
    /\.sr-only[^{]*{[^}]*}/g,
    /\.visually-hidden[^{]*{[^}]*}/g,
    // Critical components only
    /\.btn[^{]*{[^}]*}/g,
    /\.card[^{]*{[^}]*}/g,
    /\.nav[^{]*{[^}]*}/g,
  ];

  let essential = '';
  for (const pattern of essentialPatterns) {
    const matches = css.match(pattern);
    if (matches) {
      essential += matches.join('\n') + '\n';
    }
  }

  return essential;
}

/**
 * Phase 1: Critical CSS Ultra-Optimization
 */
async function optimizeCriticalCSS() {
  const startTime = Date.now();
  log.phase('Phase 1: Critical CSS Ultra-Optimization');

  try {
    const criticalCSS = await fs.readFile(CONFIG.input.critical, 'utf8');
    const originalSize = await getFileSize(CONFIG.input.critical);

    log.progress('Applying ultra-aggressive minification...');

    // Ultra-aggressive processing
    const processed = await postcss([
      cssnano({
        preset: [
          'default',
          {
            discardComments: { removeAll: true },
            normalizeWhitespace: true,
            discardDuplicates: true,
            mergeRules: true,
            minifySelectors: true,
            mergeIdents: true,
            minifyParams: true,
            normalizeUrl: true,
            discardEmpty: true,
            uniqueSelectors: true,
            colormin: true,
            convertValues: { length: false }, // Preserve some precision
            orderedValues: true,
            calc: { precision: 1 },
          },
        ],
      }),
    ]).process(criticalCSS, { from: undefined });

    // Apply custom ultra-minification
    let ultraMinified = await ultraMinifyCSS(processed.css);
    ultraMinified = removeDuplicateRules(ultraMinified);

    // Extract only essential parts
    const essential = extractEssentialCSS(ultraMinified);

    const outputPath = path.join(CONFIG.output.dir, CONFIG.output.critical);
    await fs.writeFile(outputPath, essential);

    const finalSize = await getFileSize(outputPath);
    const reduction = (((originalSize - finalSize) / originalSize) * 100).toFixed(1);
    const duration = Date.now() - startTime;

    log.success(`Critical CSS: ${originalSize}KB → ${finalSize}KB (${reduction}% reduction)`);
    log.detail(`Processing time: ${duration}ms`);

    return {
      originalSize,
      finalSize,
      reduction: parseFloat(reduction),
      duration,
      targetMet: finalSize <= CONFIG.targets.criticalSize,
    };
  } catch (error) {
    log.error(`Critical CSS optimization failed: ${error.message}`);
    throw error;
  }
}

/**
 * Phase 2: Main CSS Aggressive Optimization
 */
async function optimizeMainCSS() {
  const startTime = Date.now();
  log.phase('Phase 2: Main CSS Aggressive Optimization');

  try {
    const mainCSS = await fs.readFile(CONFIG.input.main, 'utf8');
    const originalSize = (mainCSS.length / 1024).toFixed(2);

    log.progress('Processing imports and applying optimizations...');

    // Process with imports and aggressive optimization
    const result = await postcss([
      postcssImport({
        root: path.join(rootDir, 'css'),
        filter: (url) => {
          // Skip non-essential CSS files to reduce bundle size
          const skipPatterns = ['animations.css', 'debug.css', 'print.css', 'ie.css'];
          return !skipPatterns.some((pattern) => url.includes(pattern));
        },
      }),
      autoprefixer({
        overrideBrowserslist: ['> 2%', 'last 2 versions', 'not dead'],
      }),
      cssnano({
        preset: [
          'default',
          {
            discardComments: { removeAll: true },
            normalizeWhitespace: true,
            discardDuplicates: true,
            mergeRules: true,
            minifySelectors: true,
            mergeIdents: true,
            minifyParams: true,
            normalizeUrl: true,
            discardEmpty: true,
            uniqueSelectors: true,
            colormin: true,
            convertValues: true,
            orderedValues: true,
            calc: { precision: 2 },
            mergeLonghand: true,
            discardUnused: true,
            normalizeCharset: { add: true },
            svgo: true,
          },
        ],
      }),
    ]).process(mainCSS, { from: CONFIG.input.main });

    // Apply additional ultra-minification
    let ultraOptimized = await ultraMinifyCSS(result.css);
    ultraOptimized = removeDuplicateRules(ultraOptimized);

    const outputPath = path.join(CONFIG.output.dir, CONFIG.output.main);
    await fs.writeFile(outputPath, ultraOptimized);

    const finalSize = await getFileSize(outputPath);
    const reduction = (
      ((parseFloat(originalSize) - finalSize) / parseFloat(originalSize)) *
      100
    ).toFixed(1);
    const duration = Date.now() - startTime;

    log.success(`Main CSS: ${originalSize}KB → ${finalSize}KB (${reduction}% reduction)`);
    log.detail(`Processing time: ${duration}ms`);

    return {
      originalSize: parseFloat(originalSize),
      finalSize,
      reduction: parseFloat(reduction),
      duration,
      targetMet: finalSize <= CONFIG.targets.mainSize,
    };
  } catch (error) {
    log.error(`Main CSS optimization failed: ${error.message}`);
    throw error;
  }
}

/**
 * Phase 3: Combined Bundle Creation
 */
async function createCombinedBundle(criticalResult, mainResult) {
  const startTime = Date.now();
  log.phase('Phase 3: Combined Bundle Creation');

  try {
    const criticalCSS = await fs.readFile(
      path.join(CONFIG.output.dir, CONFIG.output.critical),
      'utf8'
    );
    const mainCSS = await fs.readFile(path.join(CONFIG.output.dir, CONFIG.output.main), 'utf8');

    // Create optimized combined bundle
    const combined = `/* Phase 7-2 Optimized CSS Bundle */\n/* Critical Above-the-fold CSS */\n${criticalCSS}\n\n/* Main CSS */\n${mainCSS}`;

    const outputPath = path.join(CONFIG.output.dir, CONFIG.output.combined);
    await fs.writeFile(outputPath, combined);

    const finalSize = await getFileSize(outputPath);
    const duration = Date.now() - startTime;

    log.success(`Combined bundle created: ${finalSize}KB`);
    log.detail(`Processing time: ${duration}ms`);

    return {
      finalSize,
      duration,
      targetMet: finalSize <= CONFIG.targets.totalSize,
    };
  } catch (error) {
    log.error(`Combined bundle creation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Generate performance report
 */
function generateReport(criticalResult, mainResult, combinedResult) {
  const totalDuration = criticalResult.duration + mainResult.duration + combinedResult.duration;
  const totalReduction = (
    ((criticalResult.originalSize +
      mainResult.originalSize -
      criticalResult.finalSize -
      mainResult.finalSize) /
      (criticalResult.originalSize + mainResult.originalSize)) *
    100
  ).toFixed(1);

  const report = {
    critical: criticalResult,
    main: mainResult,
    combined: combinedResult,
    summary: {
      totalDuration,
      totalReduction: parseFloat(totalReduction),
      targetsAchieved: {
        buildTime: totalDuration <= CONFIG.targets.buildTime,
        totalSize: combinedResult.finalSize <= CONFIG.targets.totalSize,
        reduction: parseFloat(totalReduction) >= CONFIG.targets.reduction,
        criticalSize: criticalResult.finalSize <= CONFIG.targets.criticalSize,
        mainSize: mainResult.finalSize <= CONFIG.targets.mainSize,
      },
    },
  };

  return report;
}

/**
 * Main optimization function
 */
async function main() {
  console.log(`\n${colors.magenta}=== Phase 7-2 CSS Optimization Pipeline ===${colors.reset}\n`);
  console.log(
    `${colors.blue}Target: 150KB bundle, 380ms build time, 15% size reduction${colors.reset}\n`
  );

  const totalStartTime = Date.now();

  try {
    // Ensure output directory exists
    await fs.mkdir(CONFIG.output.dir, { recursive: true });

    // Run optimization phases
    const criticalResult = await optimizeCriticalCSS();
    const mainResult = await optimizeMainCSS();
    const combinedResult = await createCombinedBundle(criticalResult, mainResult);

    // Generate report
    const report = generateReport(criticalResult, mainResult, combinedResult);
    const totalDuration = Date.now() - totalStartTime;

    // Display final results
    console.log(`\n${colors.green}=== Phase 7-2 Optimization Results ===${colors.reset}`);
    console.log('┌─────────────────────────────────────────────────┐');
    console.log(
      `│ Critical CSS:     ${criticalResult.finalSize.toString().padStart(8)} KB          │`
    );
    console.log(`│ Main CSS:         ${mainResult.finalSize.toString().padStart(8)} KB          │`);
    console.log(
      `│ Combined:         ${combinedResult.finalSize.toString().padStart(8)} KB          │`
    );
    console.log(
      `│ Total reduction:  ${report.summary.totalReduction.toString().padStart(8)}%           │`
    );
    console.log(`│ Build time:       ${totalDuration.toString().padStart(8)}ms          │`);
    console.log('└─────────────────────────────────────────────────┘');

    // Target assessment
    console.log(`\n${colors.blue}Target Achievement:${colors.reset}`);
    const targets = report.summary.targetsAchieved;

    console.log(
      `Bundle Size:  ${targets.totalSize ? '✓' : '✗'} ${combinedResult.finalSize}KB ${targets.totalSize ? '≤' : '>'} ${CONFIG.targets.totalSize}KB`
    );
    console.log(
      `Build Time:   ${targets.buildTime ? '✓' : '✗'} ${totalDuration}ms ${targets.buildTime ? '≤' : '>'} ${CONFIG.targets.buildTime}ms`
    );
    console.log(
      `Size Reduction: ${targets.reduction ? '✓' : '✗'} ${report.summary.totalReduction}% ${targets.reduction ? '≥' : '<'} ${CONFIG.targets.reduction}%`
    );
    console.log(
      `Critical Size: ${targets.criticalSize ? '✓' : '✗'} ${criticalResult.finalSize}KB ${targets.criticalSize ? '≤' : '>'} ${CONFIG.targets.criticalSize}KB`
    );

    // Overall assessment
    const allTargetsMet = Object.values(targets).every(Boolean);

    if (allTargetsMet) {
      console.log(`\n${colors.green}🎉 ALL PHASE 7-2 TARGETS ACHIEVED! 🎉${colors.reset}`);
      console.log(`${colors.green}Ready for Lighthouse 95+ performance validation.${colors.reset}`);
    } else {
      console.log(
        `\n${colors.yellow}⚡ Partial success - some targets need refinement${colors.reset}`
      );
    }

    // Output files
    console.log(`\n${colors.blue}Output Files:${colors.reset}`);
    console.log(`Critical: ${path.join(CONFIG.output.dir, CONFIG.output.critical)}`);
    console.log(`Main:     ${path.join(CONFIG.output.dir, CONFIG.output.main)}`);
    console.log(`Combined: ${path.join(CONFIG.output.dir, CONFIG.output.combined)}`);

    return report;
  } catch (error) {
    log.error('Phase 7-2 optimization failed!');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});

export { optimizeCriticalCSS, optimizeMainCSS, createCombinedBundle };
