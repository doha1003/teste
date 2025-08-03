#!/usr/bin/env node
/**
 * doha.kr Deployment Readiness Checker
 * Comprehensive pre-deployment validation script
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class DeploymentChecker {
  constructor() {
    this.results = {
      critical: [],
      warnings: [],
      passed: [],
    };
  }

  async run() {
    log('🔍 doha.kr Deployment Readiness Check', 'cyan');

    await this.checkEnvironment();
    await this.checkCodeQuality();
    await this.checkBuildSystem();
    await this.displaySummary();
  }

  async checkEnvironment() {
    log('\n📋 Environment Checks', 'yellow');

    const essentialFiles = [
      'index.html',
      'manifest.json',
      'sw.js',
      'vercel.json',
      'css/main.css',
      'js/main.js',
    ];

    for (const file of essentialFiles) {
      try {
        await fs.access(path.join(ROOT_DIR, file));
        this.pass(`Essential file exists: ${file}`);
      } catch {
        this.critical(`Missing essential file: ${file}`);
      }
    }
  }

  async checkCodeQuality() {
    log('\n🔍 Code Quality Checks', 'yellow');

    try {
      await execAsync('npm run lint', { cwd: ROOT_DIR });
      this.pass('ESLint validation passed');
    } catch (error) {
      this.critical(`ESLint errors found: ${error.message}`);
    }
  }

  async checkBuildSystem() {
    log('\n🔨 Build System Checks', 'yellow');

    try {
      await execAsync('npm run build:css', { cwd: ROOT_DIR, timeout: 30000 });
      this.pass('CSS build successful');
    } catch (error) {
      this.critical(`CSS build failed: ${error.message}`);
    }
  }

  critical(message) {
    this.results.critical.push(message);
    log(`  ❌ ${message}`, 'red');
  }

  warning(message) {
    this.results.warnings.push(message);
    log(`  ⚠️  ${message}`, 'yellow');
  }

  pass(message) {
    this.results.passed.push(message);
    log(`  ✅ ${message}`, 'green');
  }

  displaySummary() {
    log('\n📊 DEPLOYMENT READINESS SUMMARY', 'cyan');
    log(`✅ Passed: ${this.results.passed.length}`, 'green');
    log(`⚠️  Warnings: ${this.results.warnings.length}`, 'yellow');
    log(`❌ Critical Issues: ${this.results.critical.length}`, 'red');

    if (this.results.critical.length === 0) {
      log('\n🎉 DEPLOYMENT READY!', 'green');
    } else {
      log('\n🚫 NOT DEPLOYMENT READY', 'red');
    }
  }
}

async function main() {
  const checker = new DeploymentChecker();
  await checker.run();
  process.exit(checker.results.critical.length > 0 ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
