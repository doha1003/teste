#!/usr/bin/env node

/**
 * CSS Minifier Script
 * Minifies all CSS files in the project
 */

const fs = require('fs').promises;
const path = require('path');

// Simple CSS minification function
function minifyCSS(css) {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove unnecessary whitespace
        .replace(/\s+/g, ' ')
        // Remove space around selectors
        .replace(/\s*([{}:;,])\s*/g, '$1')
        // Remove trailing semicolon before closing brace
        .replace(/;}/g, '}')
        // Remove quotes from url()
        .replace(/url\((['"])([^'"]+)\1\)/g, 'url($2)')
        // Remove empty rules
        .replace(/[^{}]+\{\s*\}/g, '')
        // Trim
        .trim();
}

async function processCSS(filePath) {
    try {
        const css = await fs.readFile(filePath, 'utf8');
        const minified = minifyCSS(css);
        
        // Calculate compression ratio
        const originalSize = Buffer.byteLength(css, 'utf8');
        const minifiedSize = Buffer.byteLength(minified, 'utf8');
        const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        // Create minified filename
        const dir = path.dirname(filePath);
        const basename = path.basename(filePath, '.css');
        const minPath = path.join(dir, `${basename}.min.css`);
        
        // Write minified file
        await fs.writeFile(minPath, minified);
        
        // console.log removed(`✓ ${path.basename(filePath)} → ${path.basename(minPath)} (${reduction}% reduction)`);
        
        return { original: originalSize, minified: minifiedSize };
    } catch (error) {
        // console.error removed(`✗ Error processing ${filePath}:`, error.message);
        return { original: 0, minified: 0 };
    }
}

async function findCSSFiles(dir, files = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            // Skip node_modules and other unnecessary directories
            if (!['node_modules', '.git', 'backup'].includes(entry.name)) {
                await findCSSFiles(fullPath, files);
            }
        } else if (entry.isFile() && entry.name.endsWith('.css') && !entry.name.endsWith('.min.css')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

async function main() {
    // console.log removed('🔄 Starting CSS minification...\n');
    
    const cssDir = path.join(__dirname, '..', 'css');
    const cssFiles = await findCSSFiles(cssDir);
    
    // console.log removed(`Found ${cssFiles.length} CSS files to minify\n`);
    
    let totalOriginal = 0;
    let totalMinified = 0;
    
    for (const file of cssFiles) {
        const result = await processCSS(file);
        totalOriginal += result.original;
        totalMinified += result.minified;
    }
    
    const totalReduction = ((totalOriginal - totalMinified) / totalOriginal * 100).toFixed(1);
    
    // console.log removed('\n📊 Summary:');
    // console.log removed(`Original size: ${(totalOriginal / 1024).toFixed(1)} KB`);
    // console.log removed(`Minified size: ${(totalMinified / 1024).toFixed(1)} KB`);
    // console.log removed(`Total reduction: ${totalReduction}%`);
    // console.log removed('\n✅ CSS minification complete!');
}

// Run the script
main().catch(err => {
        // Error handling
    });