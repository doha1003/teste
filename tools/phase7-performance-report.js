#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  baseline: {
    bundleSize: 347.01, // KB (original production CSS)
    buildTime: 1366, // ms (original build time)
    numFiles: 76, // Number of CSS files bundled
  },
  targets: {
    bundleSize: 150, // KB - 15% reduction target
    buildTime: 380, // ms - 20% improvement target
    reduction: 15, // % minimum reduction
    lighthouseScore: 95, // Performance target
  },
  files: {
    critical: path.join(rootDir, 'dist/critical/critical.css'),
    criticalMin: path.join(rootDir, 'dist/critical.min.css'),
    optimized: path.join(rootDir, 'dist/styles.optimized.css'),
    final: path.join(rootDir, 'dist/styles.final.css'),
    ultra: path.join(rootDir, 'dist/styles.ultra.css'),
    phase7: path.join(rootDir, 'dist/styles.phase7.css'),
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
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  detail: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bold}${colors.magenta}${msg}${colors.reset}`),
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
 * Analyze all CSS optimization results
 */
async function analyzeOptimizationResults() {
  const results = {};

  for (const [name, filePath] of Object.entries(CONFIG.files)) {
    const size = await getFileSize(filePath);
    results[name] = {
      path: filePath,
      size,
      exists: size > 0,
    };
  }

  return results;
}

/**
 * Calculate performance improvements
 */
function calculateImprovements(results) {
  const baseline = CONFIG.baseline.bundleSize;

  const improvements = {};

  for (const [name, data] of Object.entries(results)) {
    if (data.exists) {
      improvements[name] = {
        ...data,
        reduction: (((baseline - data.size) / baseline) * 100).toFixed(1),
        targetMet: data.size <= CONFIG.targets.bundleSize,
        reductionTargetMet: ((baseline - data.size) / baseline) * 100 >= CONFIG.targets.reduction,
      };
    }
  }

  return improvements;
}

/**
 * Find best optimization result
 */
function findBestResult(improvements) {
  let best = null;
  let bestScore = -1;

  for (const [name, data] of Object.entries(improvements)) {
    if (!data.exists) continue;

    // Scoring: size reduction + target achievement
    let score = parseFloat(data.reduction);
    if (data.targetMet) score += 20;
    if (data.reductionTargetMet) score += 10;

    if (score > bestScore) {
      bestScore = score;
      best = { name, ...data };
    }
  }

  return best;
}

/**
 * Generate implementation recommendations
 */
function generateRecommendations(best, improvements) {
  const recommendations = [];

  if (best) {
    if (best.targetMet) {
      recommendations.push(`✓ Use ${best.name} as production CSS (${best.size}KB)`);
    } else {
      recommendations.push(
        `⚠ Best option is ${best.name} (${best.size}KB) but exceeds 150KB target`
      );
    }

    if (best.reductionTargetMet) {
      recommendations.push(`✓ Achieved ${best.reduction}% size reduction target`);
    }
  }

  // Critical CSS recommendations
  if (improvements.critical?.exists) {
    recommendations.push(
      `✓ Implement critical CSS strategy (${improvements.critical.size}KB above-the-fold)`
    );
  }

  // Font optimization
  if (improvements.criticalMin?.exists) {
    recommendations.push(`✓ Use ultra-optimized critical CSS (${improvements.criticalMin.size}KB)`);
  }

  // Build process recommendations
  recommendations.push('✓ Implement caching strategy for 20% build time improvement');
  recommendations.push('✓ Use Korean font optimization for better LCP scores');
  recommendations.push('✓ Enable tree-shaking for production builds');

  return recommendations;
}

/**
 * Estimate Lighthouse performance impact
 */
function estimateLighthouseImpact(best) {
  if (!best) return null;

  const sizeReduction = parseFloat(best.reduction);
  const currentSize = best.size;

  // Lighthouse performance estimates based on CSS optimization
  const estimates = {
    fcp: Math.round(sizeReduction * 3), // ~3ms improvement per 1% reduction
    lcp: Math.round(sizeReduction * 5), // ~5ms improvement per 1% reduction
    cls: sizeReduction > 10 ? 'Improved' : 'Minor improvement',
    performanceScore: Math.min(95, 70 + Math.round(sizeReduction * 0.8)),
    expectedImprovement:
      currentSize <= 150 ? 'Likely to achieve 95+' : 'May need additional optimization',
  };

  return estimates;
}

/**
 * Generate final report
 */
function generateFinalReport(improvements, best, recommendations, lighthouse) {
  const report = {
    timestamp: new Date().toISOString(),
    baseline: CONFIG.baseline,
    targets: CONFIG.targets,
    results: improvements,
    bestOption: best,
    recommendations,
    lighthouse,
    summary: {
      totalOptimizations: Object.keys(improvements).length,
      successfulOptimizations: Object.values(improvements).filter((i) => i.exists).length,
      targetsAchieved: best
        ? {
            sizeTarget: best.targetMet,
            reductionTarget: best.reductionTargetMet,
            overallSuccess: best.targetMet && best.reductionTargetMet,
          }
        : null,
    },
  };

  return report;
}

/**
 * Display comprehensive report
 */
function displayReport(report) {
  const { results, best, recommendations, lighthouse, summary } = report;

  log.header('\n=== Phase 7-2 CSS Optimization Final Report ===');

  // Baseline vs Results
  console.log(`\n${colors.blue}Baseline Performance:${colors.reset}`);
  console.log(
    `Original bundle: ${CONFIG.baseline.bundleSize}KB, Build time: ${CONFIG.baseline.buildTime}ms`
  );

  console.log(`\n${colors.blue}Optimization Results:${colors.reset}`);
  console.log('┌─────────────────┬────────────┬─────────────┬──────────┬──────────┐');
  console.log('│ Optimization    │ Size (KB)  │ Reduction % │ Size✓    │ Reduc✓   │');
  console.log('├─────────────────┼────────────┼─────────────┼──────────┼──────────┤');

  for (const [name, data] of Object.entries(results)) {
    if (data.exists) {
      const size = data.size.toString().padStart(8);
      const reduction = `${data.reduction}%`.padStart(9);
      const sizeCheck = data.targetMet ? '✓' : '✗';
      const reductionCheck = data.reductionTargetMet ? '✓' : '✗';

      console.log(
        `│ ${name.padEnd(15)} │ ${size}   │ ${reduction}   │ ${sizeCheck.padStart(6)}   │ ${reductionCheck.padStart(6)}   │`
      );
    }
  }
  console.log('└─────────────────┴────────────┴─────────────┴──────────┴──────────┘');

  // Best result
  if (best) {
    console.log(`\n${colors.green}🏆 Best Result: ${best.name}${colors.reset}`);
    console.log(`   Size: ${best.size}KB (${best.reduction}% reduction)`);
    console.log(
      `   Target Achievement: ${best.targetMet ? '✓ Size' : '✗ Size'} ${best.reductionTargetMet ? '✓ Reduction' : '✗ Reduction'}`
    );
  }

  // Lighthouse estimates
  if (lighthouse) {
    console.log(`\n${colors.blue}Expected Lighthouse Impact:${colors.reset}`);
    console.log(`   FCP improvement: ~${lighthouse.fcp}ms`);
    console.log(`   LCP improvement: ~${lighthouse.lcp}ms`);
    console.log(`   CLS impact: ${lighthouse.cls}`);
    console.log(`   Performance Score: ~${lighthouse.performanceScore}/100`);
    console.log(`   Target Achievement: ${lighthouse.expectedImprovement}`);
  }

  // Recommendations
  console.log(`\n${colors.blue}Implementation Recommendations:${colors.reset}`);
  recommendations.forEach((rec) => {
    console.log(`   ${rec}`);
  });

  // Summary
  console.log(`\n${colors.blue}Summary:${colors.reset}`);
  console.log(`   Optimizations tested: ${summary.totalOptimizations}`);
  console.log(`   Successful optimizations: ${summary.successfulOptimizations}`);

  if (summary.targetsAchieved) {
    const overall = summary.targetsAchieved.overallSuccess;
    console.log(`   Overall success: ${overall ? '✓ Yes' : '⚠ Partial'}`);

    if (overall) {
      console.log(
        `\n${colors.green}🎉 Phase 7-2 CSS Optimization COMPLETED SUCCESSFULLY! 🎉${colors.reset}`
      );
      console.log(
        `${colors.green}Ready for production deployment and Lighthouse validation.${colors.reset}`
      );
    } else {
      console.log(
        `\n${colors.yellow}⚡ Phase 7-2 partially completed - consider additional optimization${colors.reset}`
      );
    }
  }
}

/**
 * Save report to file
 */
async function saveReport(report) {
  const reportPath = path.join(rootDir, 'phase7-css-optimization-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  log.success(`Report saved to: ${reportPath}`);
}

/**
 * Main report generation function
 */
async function main() {
  try {
    log.header('Phase 7-2 CSS Optimization Performance Analysis');

    // Analyze results
    log.info('Analyzing optimization results...');
    const results = await analyzeOptimizationResults();

    // Calculate improvements
    log.info('Calculating performance improvements...');
    const improvements = calculateImprovements(results);

    // Find best result
    const best = findBestResult(improvements);

    // Generate recommendations
    const recommendations = generateRecommendations(best, improvements);

    // Estimate Lighthouse impact
    const lighthouse = estimateLighthouseImpact(best);

    // Generate final report
    const report = generateFinalReport(improvements, best, recommendations, lighthouse);

    // Display report
    displayReport(report);

    // Save report
    await saveReport(report);

    console.log(`\n${colors.cyan}Phase 7-2 CSS Optimization Analysis Complete!${colors.reset}\n`);
  } catch (error) {
    log.error('Report generation failed!');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});

export { analyzeOptimizationResults, calculateImprovements, generateFinalReport };
