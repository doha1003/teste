#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  inputDir: path.join(rootDir, 'images'),
  outputDir: path.join(rootDir, 'images/optimized'),
  formats: ['webp', 'avif'], // Modern formats
  fallbackFormat: 'jpeg',
  quality: {
    jpeg: 85,
    webp: 80,
    avif: 75,
  },
  resize: {
    // Common responsive sizes
    small: 480,
    medium: 768,
    large: 1200,
    xlarge: 1920,
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
 * Get file size in KB
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return (stats.size / 1024).toFixed(2);
  } catch {
    return 0;
  }
}

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
 * Check if file is an image
 */
function isImage(filename) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];
  return imageExtensions.includes(path.extname(filename).toLowerCase());
}

/**
 * Get all image files from input directory
 */
async function getImageFiles() {
  try {
    const files = await fs.readdir(CONFIG.inputDir, { recursive: true });
    return files
      .filter((file) => isImage(file))
      .map((file) => ({
        name: file,
        inputPath: path.join(CONFIG.inputDir, file),
        relativePath: file,
      }));
  } catch (error) {
    log.error(`Failed to read input directory: ${error.message}`);
    return [];
  }
}

/**
 * Optimize single image
 */
async function optimizeImage(imageFile) {
  const { name, inputPath, relativePath } = imageFile;
  const basename = path.parse(name).name;
  const outputBase = path.join(CONFIG.outputDir, path.dirname(relativePath));

  const results = [];

  try {
    // Ensure output directory exists
    await fs.mkdir(outputBase, { recursive: true });

    // Get original image info
    const originalSize = await getFileSize(inputPath);
    const metadata = await sharp(inputPath).metadata();

    log.detail(
      `Processing: ${relativePath} (${originalSize} KB, ${metadata.width}x${metadata.height})`
    );

    // Create base sharp instance
    let image = sharp(inputPath);

    // Generate responsive sizes
    for (const [sizeName, width] of Object.entries(CONFIG.resize)) {
      if (metadata.width && metadata.width > width) {
        // Generate WebP
        const webpPath = path.join(outputBase, `${basename}-${sizeName}.webp`);
        await image
          .clone()
          .resize(width, null, { withoutEnlargement: true })
          .webp({ quality: CONFIG.quality.webp, effort: 6 })
          .toFile(webpPath);

        const webpSize = await getFileSize(webpPath);
        results.push({
          format: 'webp',
          size: sizeName,
          path: webpPath,
          sizeKB: webpSize,
          compression: (((originalSize - webpSize) / originalSize) * 100).toFixed(1),
        });

        // Generate AVIF (if supported)
        try {
          const avifPath = path.join(outputBase, `${basename}-${sizeName}.avif`);
          await image
            .clone()
            .resize(width, null, { withoutEnlargement: true })
            .avif({ quality: CONFIG.quality.avif, effort: 6 })
            .toFile(avifPath);

          const avifSize = await getFileSize(avifPath);
          results.push({
            format: 'avif',
            size: sizeName,
            path: avifPath,
            sizeKB: avifSize,
            compression: (((originalSize - avifSize) / originalSize) * 100).toFixed(1),
          });
        } catch (avifError) {
          log.warning(`AVIF generation failed for ${basename}-${sizeName}: ${avifError.message}`);
        }

        // Generate fallback JPEG
        const jpegPath = path.join(outputBase, `${basename}-${sizeName}.jpg`);
        await image
          .clone()
          .resize(width, null, { withoutEnlargement: true })
          .jpeg({ quality: CONFIG.quality.jpeg, progressive: true })
          .toFile(jpegPath);

        const jpegSize = await getFileSize(jpegPath);
        results.push({
          format: 'jpeg',
          size: sizeName,
          path: jpegPath,
          sizeKB: jpegSize,
          compression: (((originalSize - jpegSize) / originalSize) * 100).toFixed(1),
        });
      }
    }

    // Generate full-size optimized versions
    const webpFullPath = path.join(outputBase, `${basename}.webp`);
    await image.clone().webp({ quality: CONFIG.quality.webp, effort: 6 }).toFile(webpFullPath);

    const webpFullSize = await getFileSize(webpFullPath);
    results.push({
      format: 'webp',
      size: 'full',
      path: webpFullPath,
      sizeKB: webpFullSize,
      compression: (((originalSize - webpFullSize) / originalSize) * 100).toFixed(1),
    });

    log.success(`Optimized: ${relativePath} → ${results.length} variants`);

    return {
      original: { name: relativePath, sizeKB: originalSize },
      optimized: results,
      totalSaved: results.reduce((sum, r) => sum + (originalSize - parseFloat(r.sizeKB)), 0),
    };
  } catch (error) {
    log.error(`Failed to optimize ${relativePath}: ${error.message}`);
    return null;
  }
}

/**
 * Generate HTML picture element for responsive images
 */
function generatePictureHTML(basename, sizes = ['small', 'medium', 'large']) {
  const sources = [];

  // AVIF sources
  sources.push(
    `  <source media="(max-width: 480px)" srcset="/images/optimized/${basename}-small.avif" type="image/avif">`
  );
  sources.push(
    `  <source media="(max-width: 768px)" srcset="/images/optimized/${basename}-medium.avif" type="image/avif">`
  );
  sources.push(`  <source srcset="/images/optimized/${basename}-large.avif" type="image/avif">`);

  // WebP sources
  sources.push(
    `  <source media="(max-width: 480px)" srcset="/images/optimized/${basename}-small.webp" type="image/webp">`
  );
  sources.push(
    `  <source media="(max-width: 768px)" srcset="/images/optimized/${basename}-medium.webp" type="image/webp">`
  );
  sources.push(`  <source srcset="/images/optimized/${basename}-large.webp" type="image/webp">`);

  return `<picture>
${sources.join('\n')}
  <img src="/images/optimized/${basename}-large.jpg" alt="Your image description" loading="lazy">
</picture>`;
}

/**
 * Main optimization function
 */
async function main() {
  console.log(`\n${colors.blue}Image Optimization Tool${colors.reset}\n`);

  const startTime = Date.now();

  try {
    // Ensure output directory exists
    await ensureOutputDir();

    // Get all image files
    const imageFiles = await getImageFiles();

    if (imageFiles.length === 0) {
      log.warning('No image files found in the input directory');
      return;
    }

    log.info(`Found ${imageFiles.length} image(s) to optimize`);

    // Optimize all images
    const results = [];
    for (const imageFile of imageFiles) {
      const result = await optimizeImage(imageFile);
      if (result) {
        results.push(result);
      }
    }

    // Calculate total savings
    const totalOriginal = results.reduce((sum, r) => sum + parseFloat(r.original.sizeKB), 0);
    const totalOptimized = results.reduce(
      (sum, r) => sum + r.optimized.reduce((s, o) => s + parseFloat(o.sizeKB), 0),
      0
    );
    const totalSaved = totalOriginal - totalOptimized;
    const compressionRatio = ((totalSaved / totalOriginal) * 100).toFixed(1);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Summary
    console.log(`\n${colors.green}Optimization Summary:${colors.reset}`);
    console.log('┌─────────────────────────────────────────────────┐');
    console.log(`│ Images processed: ${results.length.toString().padEnd(30)} │`);
    console.log(`│ Original size:    ${totalOriginal.toFixed(2).padStart(8)} KB          │`);
    console.log(`│ Optimized size:   ${totalOptimized.toFixed(2).padStart(8)} KB          │`);
    console.log(`│ Space saved:      ${totalSaved.toFixed(2).padStart(8)} KB          │`);
    console.log(`│ Compression:      ${compressionRatio.padStart(8)}%           │`);
    console.log(`│ Processing time:  ${duration.toString().padStart(8)}ms          │`);
    console.log('└─────────────────────────────────────────────────┘');

    // Show HTML usage example
    if (results.length > 0) {
      const firstImage = path.parse(results[0].original.name).name;
      console.log(`\n${colors.blue}HTML Usage Example:${colors.reset}`);
      console.log(generatePictureHTML(firstImage));
    }
  } catch (error) {
    log.error('Optimization failed!');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { optimizeImage, generatePictureHTML };
