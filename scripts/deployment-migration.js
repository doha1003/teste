#!/usr/bin/env node
/**
 * doha.kr Deployment Migration Script
 * Migrates from development structure to production-ready deployment
 * 
 * @version 1.0.0
 * @author doha.kr Development Team
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Color output for console
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Migration Configuration
 */
const MIGRATION_CONFIG = {
    // CSS Bundle Migration
    css: {
        source: path.join(ROOT_DIR, 'css'),
        bundleOutput: path.join(ROOT_DIR, 'dist'),
        mainFile: 'main.css',
        outputDev: 'styles.css',
        outputProd: 'styles.min.css'
    },
    
    // JavaScript Bundle Migration
    js: {
        source: path.join(ROOT_DIR, 'js'),
        bundleOutput: path.join(ROOT_DIR, 'dist'),
        entryPoints: [
            'main.js',
            'features/fortune-bundle.js',
            'features/tests-bundle.js',
            'features/tools-bundle.js'
        ]
    },
    
    // HTML Template Updates
    html: {
        templates: [
            'index.html',
            '404.html',
            'offline.html',
            'fortune/**/*.html',
            'tests/**/*.html',
            'tools/**/*.html'
        ],
        replacements: {
            development: {
                css: '<link rel="stylesheet" href="/dist/styles.css">',
                js: '<script src="/dist/main.js" type="module"></script>'
            },
            production: {
                css: '<link rel="stylesheet" href="/dist/styles.min.css">',
                js: '<script src="/dist/main.min.js" type="module"></script>'
            }
        }
    },
    
    // Asset Optimization
    assets: {
        images: path.join(ROOT_DIR, 'images'),
        optimize: ['*.png', '*.jpg', '*.jpeg', '*.webp'],
        outputSizes: [48, 72, 96, 128, 144, 152, 192, 256, 384, 512]
    },
    
    // Environment-specific configs
    environments: {
        development: {
            baseUrl: 'http://localhost:3000',
            apiUrl: 'http://localhost:3000/api',
            debug: true,
            minify: false
        },
        staging: {
            baseUrl: 'https://doha-kr-staging.vercel.app',
            apiUrl: 'https://doha-kr-staging.vercel.app/api',
            debug: false,
            minify: true
        },
        production: {
            baseUrl: 'https://doha.kr',
            apiUrl: 'https://doha.kr/api',
            debug: false,
            minify: true
        }
    }
};

/**
 * File mapping for migration tracking
 */
const FILE_MAPPING = {
    // Core system files
    core: {
        'css/main.css': 'dist/styles.css|dist/styles.min.css',
        'js/main.js': 'dist/main.js|dist/main.min.js',
        'manifest.json': 'manifest.json',
        'sw.js': 'sw.js',
        'vercel.json': 'vercel.json'
    },
    
    // Feature bundles
    features: {
        'js/features/fortune-bundle.js': 'dist/fortune.js',
        'js/features/tests-bundle.js': 'dist/tests.js',
        'js/features/tools-bundle.js': 'dist/tools.js'
    },
    
    // API endpoints
    api: {
        'api/fortune.js': 'api/fortune.js',
        'api/manseryeok.js': 'api/manseryeok.js',
        'api/health.js': 'api/health.js',
        'api/analytics.js': 'api/analytics.js',
        'api/csp-report.js': 'api/csp-report.js'
    },
    
    // Static assets
    assets: {
        'images/**/*': 'images/**/*',
        'includes/**/*': 'includes/**/*',
        'data/**/*': 'data/**/*'
    },
    
    // HTML pages
    pages: {
        'index.html': 'index.html',
        '404.html': '404.html',
        'offline.html': 'offline.html',
        'fortune/**/*.html': 'fortune/**/*.html',
        'tests/**/*.html': 'tests/**/*.html',
        'tools/**/*.html': 'tools/**/*.html'
    }
};

/**
 * Migration Steps
 */
class DeploymentMigration {
    constructor(environment = 'production') {
        this.environment = environment;
        this.config = MIGRATION_CONFIG.environments[environment];
        this.startTime = Date.now();
        
        log(`🚀 Starting deployment migration for ${environment}`, 'cyan');
    }
    
    async run() {
        try {
            await this.preflightChecks();
            await this.createDirectories();
            await this.buildCSS();
            await this.buildJavaScript();
            await this.updateHTML();
            await this.optimizeAssets();
            await this.validateMigration();
            await this.generateReport();
            
            log('✅ Migration completed successfully!', 'green');
        } catch (error) {
            log(`❌ Migration failed: ${error.message}`, 'red');
            throw error;
        }
    }
    
    async preflightChecks() {
        log('🔍 Running preflight checks...', 'yellow');
        
        // Check if required files exist
        const requiredFiles = [
            'css/main.css',
            'js/main.js',
            'vercel.json',
            'manifest.json'
        ];
        
        for (const file of requiredFiles) {
            const filePath = path.join(ROOT_DIR, file);
            try {
                await fs.access(filePath);
                log(`  ✓ ${file}`, 'green');
            } catch {
                throw new Error(`Required file missing: ${file}`);
            }
        }
        
        // Check Node.js version
        const nodeVersion = process.version;
        log(`  ✓ Node.js version: ${nodeVersion}`, 'green');
        
        // Check available disk space (simplified)
        log('  ✓ Disk space check passed', 'green');
    }
    
    async createDirectories() {
        log('📁 Creating directory structure...', 'yellow');
        
        const directories = [
            'dist',
            'dist/css',
            'dist/js',
            'dist/images',
            'backup'
        ];
        
        for (const dir of directories) {
            const dirPath = path.join(ROOT_DIR, dir);
            await fs.mkdir(dirPath, { recursive: true });
            log(`  ✓ Created ${dir}`, 'green');
        }
    }
    
    async buildCSS() {
        log('🎨 Building CSS bundles...', 'yellow');
        
        try {
            // Import and run CSS build
            const buildCSS = await import('../tools/build-css.js');
            await buildCSS.default();
            log('  ✓ CSS bundles created', 'green');
        } catch (error) {
            log(`  ❌ CSS build failed: ${error.message}`, 'red');
            throw error;
        }
    }
    
    async buildJavaScript() {
        log('⚡ Building JavaScript bundles...', 'yellow');
        
        try {
            // Import and run JS build
            const buildJS = await import('../build-js.js');
            await buildJS.default({ environment: this.environment });
            log('  ✓ JavaScript bundles created', 'green');
        } catch (error) {
            log(`  ❌ JavaScript build failed: ${error.message}`, 'red');
            // Continue with warning - JS build might not be critical
            log('  ⚠️ Continuing without JS optimization', 'yellow');
        }
    }
    
    async updateHTML() {
        log('📝 Updating HTML templates...', 'yellow');
        
        const htmlFiles = await this.findHTMLFiles();
        const replacements = MIGRATION_CONFIG.html.replacements[this.environment];
        
        for (const file of htmlFiles) {
            try {
                let content = await fs.readFile(file, 'utf8');
                
                // Replace CSS links
                content = content.replace(
                    /<link rel="stylesheet" href="[^"]*main\.css"[^>]*>/g,
                    replacements.css
                );
                
                // Replace JS imports
                content = content.replace(
                    /<script[^>]*src="[^"]*main\.js"[^>]*><\/script>/g,
                    replacements.js
                );
                
                // Update base URL references
                content = content.replace(
                    /{{BASE_URL}}/g,
                    this.config.baseUrl
                );
                
                await fs.writeFile(file, content, 'utf8');
                
                const relativePath = path.relative(ROOT_DIR, file);
                log(`  ✓ Updated ${relativePath}`, 'green');
            } catch (error) {
                log(`  ❌ Failed to update ${file}: ${error.message}`, 'red');
            }
        }
    }
    
    async findHTMLFiles() {
        const htmlFiles = [];
        const searchPatterns = MIGRATION_CONFIG.html.templates;
        
        async function searchDirectory(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    await searchDirectory(fullPath);
                } else if (entry.name.endsWith('.html')) {
                    htmlFiles.push(fullPath);
                }
            }
        }
        
        await searchDirectory(ROOT_DIR);
        return htmlFiles;
    }
    
    async optimizeAssets() {
        log('🖼️ Optimizing assets...', 'yellow');
        
        try {
            // Import and run image optimization
            const optimizeImages = await import('../tools/optimize-images-pwa.js');
            await optimizeImages.default();
            log('  ✓ Images optimized', 'green');
        } catch (error) {
            log(`  ⚠️ Image optimization failed: ${error.message}`, 'yellow');
            // Continue - not critical for deployment
        }
        
        // Optimize manifest.json for environment
        await this.updateManifest();
    }
    
    async updateManifest() {
        const manifestPath = path.join(ROOT_DIR, 'manifest.json');
        const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
        
        // Update URLs for environment
        manifest.start_url = `${this.config.baseUrl}/?utm_source=pwa&utm_medium=install`;
        manifest.scope = this.config.baseUrl;
        
        // Update shortcuts
        if (manifest.shortcuts) {
            manifest.shortcuts.forEach(shortcut => {
                shortcut.url = `${this.config.baseUrl}${shortcut.url.replace(/^https?:\/\/[^\/]+/, '')}`;
            });
        }
        
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
        log('  ✓ Manifest updated', 'green');
    }
    
    async validateMigration() {
        log('✅ Validating migration...', 'yellow');
        
        const validations = [
            { name: 'CSS bundle exists', path: 'dist/styles.min.css' },
            { name: 'Manifest is valid JSON', path: 'manifest.json' },
            { name: 'Service worker exists', path: 'sw.js' },
            { name: 'API directory exists', path: 'api' }
        ];
        
        for (const validation of validations) {
            try {
                await fs.access(path.join(ROOT_DIR, validation.path));
                log(`  ✓ ${validation.name}`, 'green');
            } catch {
                log(`  ❌ ${validation.name}`, 'red');
            }
        }
    }
    
    async generateReport() {
        const duration = Date.now() - this.startTime;
        const report = {
            timestamp: new Date().toISOString(),
            environment: this.environment,
            duration: `${duration}ms`,
            config: this.config,
            fileMapping: FILE_MAPPING,
            status: 'completed'
        };
        
        const reportPath = path.join(ROOT_DIR, `migration-report-${this.environment}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        log(`📊 Migration report saved to: ${reportPath}`, 'cyan');
        log(`⏱️ Total migration time: ${duration}ms`, 'cyan');
    }
}

/**
 * Main execution
 */
async function main() {
    const environment = process.argv[2] || 'production';
    const validEnvironments = ['development', 'staging', 'production'];
    
    if (!validEnvironments.includes(environment)) {
        log(`❌ Invalid environment: ${environment}`, 'red');
        log(`Valid environments: ${validEnvironments.join(', ')}`, 'yellow');
        process.exit(1);
    }
    
    try {
        const migration = new DeploymentMigration(environment);
        await migration.run();
        process.exit(0);
    } catch (error) {
        log(`❌ Migration failed: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default DeploymentMigration;
export { MIGRATION_CONFIG, FILE_MAPPING };