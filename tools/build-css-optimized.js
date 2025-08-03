#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Worker } from 'worker_threads';
import crypto from 'crypto';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  entry: path.join(rootDir, 'css', 'main.css'),
  outputDir: path.join(rootDir, 'dist'),
  cacheDir: path.join(rootDir, '.cache', 'css'),
  outputDev: 'styles.css',
  outputProd: 'styles.min.css',
  outputOptimized: 'styles.optimized.css',
  sourceMap: true,
  browsers: ['> 1%', 'last 2 versions', 'not dead', 'not ie 11'],
  parallel: true,
  cache: true,
};

// Console colors
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  detail: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`),
  progress: (msg) => console.log(`${colors.cyan}⚡${colors.reset} ${msg}`),
};

/**
 * Ensure directories exist
 */
async function ensureDirectories() {
  await Promise.all([
    fs.mkdir(CONFIG.outputDir, { recursive: true }),
    fs.mkdir(CONFIG.cacheDir, { recursive: true }),
  ]);
}

/**
 * Get file size in KB
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return (stats.size / 1024).toFixed(2);
  } catch {
    return '0.00';
  }
}

/**
 * Generate cache key for CSS content
 */
function generateCacheKey(content, options) {
  const hash = crypto.createHash('md5');
  hash.update(content);
  hash.update(JSON.stringify(options));
  return hash.digest('hex');
}

/**
 * Check if cached result is valid
 */
async function getCachedResult(cacheKey) {
  if (!CONFIG.cache) return null;

  try {
    const cachePath = path.join(CONFIG.cacheDir, `${cacheKey}.json`);
    const cacheData = await fs.readFile(cachePath, 'utf8');
    const parsed = JSON.parse(cacheData);

    // Check if cache is still valid (less than 1 hour old)
    const cacheAge = Date.now() - parsed.timestamp;
    if (cacheAge < 3600000) {
      // 1 hour
      return parsed;
    }
  } catch {
    // Cache miss or invalid
  }

  return null;
}

/**
 * Save result to cache
 */
async function saveToCache(cacheKey, result) {
  if (!CONFIG.cache) return;

  try {
    const cachePath = path.join(CONFIG.cacheDir, `${cacheKey}.json`);
    const cacheData = {
      ...result,
      timestamp: Date.now(),
    };
    await fs.writeFile(cachePath, JSON.stringify(cacheData, null, 2));
  } catch (error) {
    log.warning(`Failed to save to cache: ${error.message}`);
  }
}

/**
 * Process CSS in worker thread for better performance
 */
async function processInWorker(css, options) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      `
      const { parentPort } = require('worker_threads');
      const postcss = require('postcss');
      const autoprefixer = require('autoprefixer');
      const cssnano = require('cssnano');
      
      parentPort.on('message', async ({ css, options }) => {
        try {
          const plugins = [autoprefixer({ overrideBrowserslist: options.browsers })];
          
          if (options.minify) {
            plugins.push(cssnano({
              preset: ['default', {
                discardComments: { removeAll: true },
                normalizeWhitespace: true,
                colormin: true,
                discardDuplicates: true,
                mergeRules: true,
                normalizeCharset: { add: true }
              }]
            }));
          }
          
          const result = await postcss(plugins).process(css, {
            from: undefined,
            map: options.sourceMap ? { inline: false } : false
          });
          
          parentPort.postMessage({
            success: true,
            css: result.css,
            map: result.map ? result.map.toString() : null
          });
        } catch (error) {
          parentPort.postMessage({
            success: false,
            error: error.message
          });
        }
      });
    `,
      { eval: true }
    );

    worker.postMessage({ css, options });

    worker.on('message', (result) => {
      worker.terminate();
      if (result.success) {
        resolve(result);
      } else {
        reject(new Error(result.error));
      }
    });

    worker.on('error', (error) => {
      worker.terminate();
      reject(error);
    });
  });
}

/**
 * Build CSS with caching and parallel processing
 */
async function buildCSSOptimized(isDevelopment = false) {
  const startTime = Date.now();
  const outputFile = isDevelopment ? CONFIG.outputDev : CONFIG.outputProd;
  const outputPath = path.join(CONFIG.outputDir, outputFile);

  try {
    // Read the main CSS file
    const mainCSS = await fs.readFile(CONFIG.entry, 'utf8');

    // Generate cache key
    const cacheKey = generateCacheKey(mainCSS, { isDevelopment, browsers: CONFIG.browsers });

    // Check cache first
    log.progress('Checking cache...');
    const cached = await getCachedResult(cacheKey);

    if (cached) {
      log.success('Using cached result');
      await fs.writeFile(outputPath, cached.css);
      if (cached.map && CONFIG.sourceMap) {
        await fs.writeFile(`${outputPath}.map`, cached.map);
      }

      const duration = Date.now() - startTime;
      const bundleSize = await getFileSize(outputPath);

      return {
        outputPath,
        outputFile,
        bundleSize,
        duration,
        cached: true,
      };
    }

    // Process imports
    log.progress('Processing @import statements...');
    const importResult = await postcss([
      postcssImport({
        root: path.join(rootDir, 'css'),
        resolve: (id, basedir) => {
          if (id.startsWith('./') || id.startsWith('../')) {
            return path.resolve(basedir, id);
          }
          return path.join(rootDir, 'css', id);
        },
      }),
    ]).process(mainCSS, { from: CONFIG.entry });

    let processedCSS;

    if (CONFIG.parallel && !isDevelopment) {
      // Use worker thread for heavy processing
      log.progress('Processing CSS in worker thread...');
      const workerResult = await processInWorker(importResult.css, {
        browsers: CONFIG.browsers,
        minify: true,
        sourceMap: CONFIG.sourceMap,
      });

      processedCSS = workerResult.css;

      if (workerResult.map && CONFIG.sourceMap) {
        await fs.writeFile(`${outputPath}.map`, workerResult.map);
      }
    } else {
      // Process in main thread
      log.progress('Processing CSS in main thread...');
      const plugins = [
        autoprefixer({
          overrideBrowserslist: CONFIG.browsers,
          grid: 'autoplace',
        }),
      ];

      if (!isDevelopment) {
        plugins.push(
          cssnano({
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
                normalizeWhitespace: true,
                colormin: true,
                discardDuplicates: true,
                mergeRules: true,
                normalizeCharset: { add: true },
              },
            ],
          })
        );
      }

      const result = await postcss(plugins).process(importResult.css, {
        from: CONFIG.entry,
        to: outputPath,
        map: CONFIG.sourceMap ? { inline: false } : false,
      });

      processedCSS = result.css;

      if (result.map && CONFIG.sourceMap) {
        await fs.writeFile(`${outputPath}.map`, result.map.toString());
      }
    }

    // Write output
    await fs.writeFile(outputPath, processedCSS);

    // Cache result
    await saveToCache(cacheKey, {
      css: processedCSS,
      map: CONFIG.sourceMap
        ? await fs.readFile(`${outputPath}.map`, 'utf8').catch(() => null)
        : null,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    const bundleSize = await getFileSize(outputPath);

    return {
      outputPath,
      outputFile,
      bundleSize,
      duration,
      cached: false,
    };
  } catch (error) {
    log.error(`Failed to build CSS: ${error.message}`);
    throw error;
  }
}

/**
 * Build all CSS variants in parallel
 */
async function buildAllVariants() {
  const startTime = Date.now();

  log.info('Building all CSS variants in parallel...');

  const tasks = [
    buildCSSOptimized(true).then((result) => ({ ...result, variant: 'development' })),
    buildCSSOptimized(false).then((result) => ({ ...result, variant: 'production' })),
  ];

  const results = await Promise.all(tasks);

  const totalDuration = Date.now() - startTime;

  return {
    results,
    totalDuration,
  };
}

/**
 * Analyze performance improvements
 */
function analyzePerformance(results, totalDuration) {
  const devResult = results.find((r) => r.variant === 'development');
  const prodResult = results.find((r) => r.variant === 'production');

  const totalSize = parseFloat(devResult.bundleSize) + parseFloat(prodResult.bundleSize);
  const cacheHits = results.filter((r) => r.cached).length;
  const avgBuildTime = totalDuration / results.length;

  const assessment = {
    totalDuration,
    avgBuildTime,
    cacheHits,
    speedImprovement: cacheHits > 0 ? 'Excellent (Cache utilized)' : 'Good',
    targetMet: totalDuration < 800, // Target: under 800ms total
    recommendations: [],
  };

  if (totalDuration > 1000) {
    assessment.recommendations.push('Consider enabling more aggressive caching');
  }

  if (avgBuildTime > 400) {
    assessment.recommendations.push('Consider reducing CSS complexity');
  }

  if (parseFloat(prodResult.bundleSize) > 150) {
    assessment.recommendations.push('CSS bundle size exceeds 150KB target');
  }

  return assessment;
}

/**
 * Main build function
 */
async function main() {
  console.log(`\n${colors.blue}Optimized CSS Build System${colors.reset}\n`);

  try {
    // Ensure directories exist
    await ensureDirectories();

    // Build all variants
    const { results, totalDuration } = await buildAllVariants();

    // Analyze performance
    const performance = analyzePerformance(results, totalDuration);

    // Display results
    console.log(`\n${colors.green}Build Results:${colors.reset}`);
    console.log('┌─────────────────────────────────────────────────┐');

    results.forEach((result) => {
      const cacheStatus = result.cached ? '(cached)' : '(fresh)';
      console.log(
        `│ ${result.variant.padEnd(12)}: ${result.bundleSize.padStart(8)} KB ${cacheStatus.padStart(8)} │`
      );
    });

    console.log(`│ Total time:       ${totalDuration.toString().padStart(8)}ms          │`);
    console.log(
      `│ Average time:     ${performance.avgBuildTime.toFixed(0).padStart(8)}ms          │`
    );
    console.log(
      `│ Cache hits:       ${performance.cacheHits.toString().padStart(8)}/2           │`
    );
    console.log('└─────────────────────────────────────────────────┘');

    // Performance assessment
    console.log(`\n${colors.blue}Performance Assessment:${colors.reset}`);
    console.log(`Speed: ${performance.speedImprovement}`);
    console.log(
      `Target met: ${performance.targetMet ? '✓ Yes' : '⚠ No'} (${totalDuration}ms < 800ms)`
    );

    if (performance.recommendations.length > 0) {
      console.log(`\n${colors.yellow}Recommendations:${colors.reset}`);
      performance.recommendations.forEach((rec) => {
        console.log(`  • ${rec}`);
      });
    }

    // Success message
    if (performance.targetMet) {
      console.log(`\n${colors.green}🎉 Build performance target achieved!${colors.reset}`);
    } else {
      console.log(`\n${colors.yellow}⚡ Build performance can be improved${colors.reset}`);
    }
  } catch (error) {
    log.error('Optimized build failed!');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});

export { buildCSSOptimized, buildAllVariants, analyzePerformance };
