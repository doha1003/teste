#!/usr/bin/env node

console.log('Starting CSS build script...');

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

// Configuration
const CONFIG = {
  entry: path.join(rootDir, 'css', 'main.css'),
  outputDir: path.join(rootDir, 'dist'),
  outputDev: 'styles.css',
  outputProd: 'styles.min.css',
  sourceMap: true,
  browsers: ['> 1%', 'last 2 versions', 'not dead', 'not ie 11']
};

// Console colors for better output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  reset: '\x1b[0m'
};

// Logger functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  detail: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`)
};

/**
 * Ensure output directory exists
 */
async function ensureOutputDir() {
  try {
    await fs.access(CONFIG.outputDir);
  } catch (error) {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    log.info(`Created output directory: ${CONFIG.outputDir}`);
  }
}

/**
 * Get file size in KB
 */
async function getFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return (stats.size / 1024).toFixed(2);
}

/**
 * Count number of @import statements in CSS
 */
function countImports(css) {
  const importRegex = /@import\s+["']([^"']+)["']/g;
  const imports = css.match(importRegex);
  return imports ? imports.length : 0;
}

/**
 * Build CSS bundle
 */
async function buildCSS(isDevelopment = false) {
  const startTime = Date.now();
  const outputFile = isDevelopment ? CONFIG.outputDev : CONFIG.outputProd;
  const outputPath = path.join(CONFIG.outputDir, outputFile);

  try {
    // Read the main CSS file
    const mainCSS = await fs.readFile(CONFIG.entry, 'utf8');
    const importCount = countImports(mainCSS);
    log.info(`Processing ${importCount} @import statements from main.css`);

    // Configure PostCSS plugins
    const plugins = [
      // Import plugin to inline all @import statements
      postcssImport({
        root: path.join(rootDir, 'css'),
        resolve: (id, basedir) => {
          // Handle relative imports
          if (id.startsWith('./') || id.startsWith('../')) {
            return path.resolve(basedir, id);
          }
          // Handle absolute imports from css directory
          return path.join(rootDir, 'css', id);
        },
        onImport: (files) => {
          files.forEach(file => {
            if (file !== CONFIG.entry) {
              log.detail(`Importing: ${path.relative(rootDir, file)}`);
            }
          });
        }
      }),
      // Autoprefixer for browser compatibility
      autoprefixer({
        overrideBrowserslist: CONFIG.browsers,
        grid: 'autoplace'
      })
    ];

    // Add minification for production
    if (!isDevelopment) {
      plugins.push(cssnano({
        preset: ['default', {
          discardComments: {
            removeAll: true
          },
          normalizeWhitespace: true,
          colormin: true,
          convertValues: true,
          discardDuplicates: true,
          discardEmpty: true,
          mergeIdents: true,
          mergeLonghand: true,
          mergeRules: true,
          minifyFontValues: true,
          minifyGradients: true,
          minifyParams: true,
          minifySelectors: true,
          normalizeCharset: true,
          normalizeDisplayValues: true,
          normalizePositions: true,
          normalizeRepeatStyle: true,
          normalizeString: true,
          normalizeTimingFunctions: true,
          normalizeUnicode: true,
          normalizeUrl: true,
          orderedValues: true,
          reduceIdents: true,
          reduceInitial: true,
          reduceTransforms: true,
          svgo: true,
          uniqueSelectors: true,
          // Preserve Korean characters
          normalizeCharset: {
            add: true
          }
        }]
      }));
    }

    // Process CSS
    const result = await postcss(plugins)
      .process(mainCSS, {
        from: CONFIG.entry,
        to: outputPath,
        map: CONFIG.sourceMap ? { inline: false } : false
      });

    // Write output files
    await fs.writeFile(outputPath, result.css);
    if (result.map && CONFIG.sourceMap) {
      await fs.writeFile(`${outputPath}.map`, result.map.toString());
    }

    // Calculate stats
    const endTime = Date.now();
    const duration = endTime - startTime;
    const originalSize = await getFileSize(CONFIG.entry);
    const bundleSize = await getFileSize(outputPath);

    // Log results
    log.success(`CSS bundle created successfully!`);
    log.detail(`Output: ${outputFile}`);
    log.detail(`Size: ${originalSize} KB → ${bundleSize} KB`);
    log.detail(`Time: ${duration}ms`);
    
    if (!isDevelopment) {
      const reduction = ((1 - bundleSize / originalSize) * 100).toFixed(1);
      log.detail(`Compression: ${reduction}% reduction`);
    }

    return {
      outputPath,
      outputFile,
      bundleSize,
      duration,
      importCount
    };

  } catch (error) {
    log.error(`Failed to build CSS: ${error.message}`);
    if (error.file) {
      log.error(`File: ${error.file}`);
    }
    throw error;
  }
}

/**
 * Generate HTML snippet for including bundled CSS
 */
function generateHTMLSnippet(devFile, prodFile) {
  return `
<!-- CSS Bundle Integration -->
<!-- Replace the existing main.css link with one of these: -->

<!-- Development (with source maps): -->
<link rel="stylesheet" href="/dist/${devFile}">

<!-- Production (minified): -->
<link rel="stylesheet" href="/dist/${prodFile}">

<!-- Or use environment-based loading: -->
<script>
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const cssFile = isDev ? '/dist/${devFile}' : '/dist/${prodFile}';
  document.write('<link rel="stylesheet" href="' + cssFile + '">');
</script>
`;
}

/**
 * Main build function
 */
async function main() {
  console.log(`\n${colors.blue}CSS Bundle Builder${colors.reset}\n`);

  try {
    // Ensure output directory exists
    await ensureOutputDir();

    // Build development bundle
    log.info('Building development bundle...');
    const devResult = await buildCSS(true);

    // Build production bundle
    log.info('\nBuilding production bundle...');
    const prodResult = await buildCSS(false);

    // Summary
    console.log(`\n${colors.green}Build Summary:${colors.reset}`);
    console.log('┌─────────────────────────────────────────────────┐');
    console.log(`│ Development:  ${devResult.outputFile.padEnd(20)} ${devResult.bundleSize.padStart(8)} KB │`);
    console.log(`│ Production:   ${prodResult.outputFile.padEnd(20)} ${prodResult.bundleSize.padStart(8)} KB │`);
    console.log(`│ Imports bundled: ${prodResult.importCount.toString().padEnd(30)} │`);
    console.log(`│ Total time: ${(devResult.duration + prodResult.duration).toString().padEnd(32)}ms │`);
    console.log('└─────────────────────────────────────────────────┘');

    // Show HTML integration snippet
    console.log(`\n${colors.blue}HTML Integration:${colors.reset}`);
    console.log(generateHTMLSnippet(devResult.outputFile, prodResult.outputFile));

    // Performance improvement estimate
    const networkRequests = prodResult.importCount + 1; // +1 for main.css
    console.log(`\n${colors.green}Performance Improvement:${colors.reset}`);
    console.log(`Network requests reduced from ${networkRequests} to 1`);
    console.log(`Estimated load time improvement: ~${(networkRequests - 1) * 50}ms`);
    console.log(`(Based on 50ms average per HTTP request)\n`);

  } catch (error) {
    log.error('Build failed!');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
console.log('Checking if script is called directly...');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);

main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});

export { buildCSS, ensureOutputDir };