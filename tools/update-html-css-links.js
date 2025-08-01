#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  htmlPattern: '**/*.html',
  excludeDirs: ['node_modules', 'dist', '.git', 'design-system'],
  cssLinkRegex: /<link\s+rel="stylesheet"\s+href="\/css\/main\.css[^"]*"\s*\/?>/gi,
  replacement: `<!-- CSS Bundle - Automatically selects development or production version -->
    <link rel="stylesheet" href="/dist/styles.css" id="main-styles">
    <script>
      // Automatically load minified CSS in production
      (function() {
        const link = document.getElementById('main-styles');
        const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        if (isProd && link) {
          link.href = '/dist/styles.min.css';
        }
      })();
    </script>`
};

// Console colors
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
 * Find all HTML files
 */
async function findHtmlFiles() {
  const htmlFiles = [];
  
  async function walkDir(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Skip excluded directories
        if (entry.isDirectory()) {
          if (!CONFIG.excludeDirs.includes(entry.name)) {
            await walkDir(fullPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          htmlFiles.push(fullPath);
        }
      }
    } catch (error) {
      log.warning(`Cannot read directory ${dir}: ${error.message}`);
    }
  }
  
  await walkDir(rootDir);
  return htmlFiles;
}

/**
 * Update CSS links in HTML file
 */
async function updateHtmlFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Check if file contains main.css link
    if (!CONFIG.cssLinkRegex.test(content)) {
      return { updated: false, reason: 'No main.css link found' };
    }

    // Reset regex lastIndex
    CONFIG.cssLinkRegex.lastIndex = 0;

    // Replace main.css link with bundled CSS
    const updatedContent = content.replace(CONFIG.cssLinkRegex, CONFIG.replacement);

    // Check if content actually changed
    if (content === updatedContent) {
      return { updated: false, reason: 'No changes made' };
    }

    // Write updated content
    await fs.writeFile(filePath, updatedContent, 'utf8');

    return { updated: true };
  } catch (error) {
    return { updated: false, reason: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`\n${colors.blue}HTML CSS Link Updater${colors.reset}\n`);

  try {
    // Find all HTML files
    log.info('Finding HTML files...');
    const htmlFiles = await findHtmlFiles();
    
    if (htmlFiles.length === 0) {
      log.warning('No HTML files found');
      return;
    }

    log.info(`Found ${htmlFiles.length} HTML files`);

    // Update each file
    let updatedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const filePath of htmlFiles) {
      const relativePath = path.relative(rootDir, filePath);
      const result = await updateHtmlFile(filePath);

      if (result.updated) {
        log.success(`Updated: ${relativePath}`);
        updatedCount++;
      } else if (result.reason === 'No main.css link found') {
        // Don't log files without main.css links
        skippedCount++;
      } else {
        log.warning(`Skipped: ${relativePath} (${result.reason})`);
        if (result.reason !== 'No changes made') {
          errors.push({ file: relativePath, reason: result.reason });
        }
      }
    }

    // Summary
    console.log(`\n${colors.green}Update Summary:${colors.reset}`);
    console.log(`Total files scanned: ${htmlFiles.length}`);
    console.log(`Files updated: ${updatedCount}`);
    console.log(`Files skipped: ${skippedCount}`);
    
    if (errors.length > 0) {
      console.log(`\n${colors.red}Errors:${colors.reset}`);
      errors.forEach(({ file, reason }) => {
        console.log(`  ${file}: ${reason}`);
      });
    }

    // Next steps
    if (updatedCount > 0) {
      console.log(`\n${colors.blue}Next Steps:${colors.reset}`);
      console.log('1. Test the website locally to ensure CSS loads correctly');
      console.log('2. Check browser console for any 404 errors');
      console.log('3. Verify that styles appear correctly in both dev and production');
      console.log('4. Commit the changes with: git add -A && git commit -m "refactor: implement CSS bundling for performance"');
    }

  } catch (error) {
    log.error('Update failed!');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});

export default main;