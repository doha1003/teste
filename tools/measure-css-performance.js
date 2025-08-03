#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Console colors
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
};

// Logger functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  detail: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`),
};

/**
 * Count CSS imports in main.css
 */
async function countCSSImports() {
  const mainCSSPath = path.join(rootDir, 'css', 'main.css');
  const content = await fs.readFile(mainCSSPath, 'utf8');

  const importRegex = /@import\s+["']([^"']+)["']/g;
  const fontImportRegex = /@import\s+url\(["']https:\/\/fonts[^"']+["']\)/g;

  const fileImports = content.match(importRegex) || [];
  const fontImports = content.match(fontImportRegex) || [];

  // Filter out font imports from file imports
  const localImports = fileImports.filter((imp) => !imp.includes('fonts.googleapis.com'));

  return {
    total: localImports.length + fontImports.length,
    files: localImports.length,
    fonts: fontImports.length,
  };
}

/**
 * Get file sizes
 */
async function getFileSizes() {
  const files = {
    original: path.join(rootDir, 'css', 'main.css'),
    devBundle: path.join(rootDir, 'dist', 'styles.css'),
    prodBundle: path.join(rootDir, 'dist', 'styles.min.css'),
  };

  const sizes = {};

  for (const [key, filePath] of Object.entries(files)) {
    try {
      const stats = await fs.stat(filePath);
      sizes[key] = {
        bytes: stats.size,
        kb: (stats.size / 1024).toFixed(2),
        mb: (stats.size / 1024 / 1024).toFixed(3),
      };
    } catch (error) {
      sizes[key] = null;
    }
  }

  return sizes;
}

/**
 * Calculate network impact
 */
function calculateNetworkImpact(importCount) {
  // Assumptions based on average network conditions
  const avgRTT = 50; // Average Round Trip Time in ms
  const concurrentRequests = 6; // Browser concurrent request limit
  const setupTime = 10; // TCP handshake, DNS, etc per request

  const parallelBatches = Math.ceil(importCount / concurrentRequests);
  const totalTime = parallelBatches * (avgRTT + setupTime);

  return {
    requests: importCount,
    parallelBatches,
    estimatedTime: totalTime,
    timeReduction: totalTime - (avgRTT + setupTime), // Single request time
  };
}

/**
 * Generate performance report
 */
async function generateReport() {
  console.log(`\n${colors.blue}CSS Bundle Performance Analysis${colors.reset}\n`);

  try {
    // Get import counts
    const imports = await countCSSImports();
    log.info(`Analyzing CSS structure...`);

    // Get file sizes
    const sizes = await getFileSizes();

    // Calculate network impact
    const networkImpact = calculateNetworkImpact(imports.files);

    // Display results
    console.log(`\n${colors.green}1. Network Requests${colors.reset}`);
    console.log('┌─────────────────────────────────────────────────┐');
    console.log(`│ Before bundling:                                │`);
    console.log(`│   - CSS files: ${imports.files.toString().padEnd(32)} │`);
    console.log(`│   - Font imports: ${imports.fonts.toString().padEnd(29)} │`);
    console.log(`│   - Total requests: ${imports.total.toString().padEnd(27)} │`);
    console.log(`│                                                 │`);
    console.log(`│ After bundling:                                 │`);
    console.log(`│   - CSS files: 1                                │`);
    console.log(`│   - Font imports: ${imports.fonts.toString().padEnd(29)} │`);
    console.log(`│   - Total requests: ${(1 + imports.fonts).toString().padEnd(27)} │`);
    console.log(`│                                                 │`);
    console.log(`│ Reduction: ${(imports.files - 1).toString().padEnd(36)} │`);
    console.log('└─────────────────────────────────────────────────┘');

    console.log(`\n${colors.green}2. File Sizes${colors.reset}`);
    console.log('┌─────────────────────────────────────────────────┐');
    if (sizes.original) {
      console.log(`│ Original (main.css): ${sizes.original.kb.padEnd(26)} KB │`);
    }
    if (sizes.devBundle) {
      console.log(`│ Development bundle: ${sizes.devBundle.kb.padEnd(27)} KB │`);
    }
    if (sizes.prodBundle) {
      console.log(`│ Production bundle: ${sizes.prodBundle.kb.padEnd(28)} KB │`);
      if (sizes.devBundle) {
        const compression = ((1 - sizes.prodBundle.bytes / sizes.devBundle.bytes) * 100).toFixed(1);
        console.log(`│ Compression ratio: ${compression.padEnd(28)} % │`);
      }
    }
    console.log('└─────────────────────────────────────────────────┘');

    console.log(`\n${colors.green}3. Load Time Impact${colors.reset}`);
    console.log('┌─────────────────────────────────────────────────┐');
    console.log(`│ Estimated time savings:                         │`);
    console.log(`│   - Parallel batches: ${networkImpact.parallelBatches} → 1                   │`);
    console.log(`│   - Time reduction: ~${networkImpact.timeReduction.toString().padEnd(25)} ms │`);
    console.log(
      `│   - Percentage: ~${((networkImpact.timeReduction / networkImpact.estimatedTime) * 100).toFixed(0).padEnd(29)} % │`
    );
    console.log('└─────────────────────────────────────────────────┘');

    console.log(`\n${colors.green}4. Browser Benefits${colors.reset}`);
    console.log('• Reduced HTTP overhead');
    console.log('• Better cache efficiency');
    console.log('• Simplified debugging in production');
    console.log('• Consistent load order');
    console.log('• Reduced chance of partial CSS loads');

    console.log(`\n${colors.blue}Recommendations:${colors.reset}`);
    console.log('1. Use production bundle (styles.min.css) for live site');
    console.log('2. Enable gzip compression on server for additional 60-70% reduction');
    console.log('3. Set long cache headers (1 year) with versioning');
    console.log('4. Consider critical CSS inlining for above-the-fold content');
    console.log('5. Monitor real user metrics with Web Vitals\n');
  } catch (error) {
    log.error('Failed to generate report');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
generateReport().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});

export default generateReport;
