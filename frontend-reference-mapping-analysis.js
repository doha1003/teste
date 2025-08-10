/**
 * doha.kr 프론트엔드 파일 간 참조 관계 완전 매핑 및 검증 도구
 * 
 * 이 스크립트는 다음과 같은 분석을 수행합니다:
 * 1. CSS 번들링 시스템 검증 (main.css → dist/styles.css)
 * 2. HTML-CSS-JS 참조 관계 추적
 * 3. JavaScript 모듈 의존성 그래프
 * 4. 리소스 파일 참조 검증
 * 5. 디자인 시스템 통합 분석
 */

import fs from 'fs';
import path from 'path';

class FrontendReferenceMapper {
  constructor() {
    this.baseDir = process.cwd();
    this.analysis = {
      css: {
        imports: [],
        bundles: [],
        references: [],
        missingFiles: []
      },
      html: {
        pages: [],
        cssLinks: [],
        jsReferences: [],
        imageReferences: [],
        missingReferences: []
      },
      js: {
        modules: [],
        imports: [],
        exports: [],
        dependencies: [],
        missingFiles: []
      },
      resources: {
        images: [],
        fonts: [],
        icons: [],
        missingFiles: []
      },
      designSystem: {
        tokens: [],
        components: [],
        themes: [],
        patterns: []
      }
    };
  }

  // 파일 존재 여부 확인
  fileExists(filePath) {
    try {
      return fs.existsSync(path.join(this.baseDir, filePath));
    } catch (error) {
      return false;
    }
  }

  // 파일 읽기 (안전)
  safeReadFile(filePath) {
    try {
      const fullPath = path.join(this.baseDir, filePath);
      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, 'utf8');
      }
      return null;
    } catch (error) {
      console.warn(`파일 읽기 실패: ${filePath} - ${error.message}`);
      return null;
    }
  }

  // CSS 참조 분석
  analyzeCSSReferences() {
    console.log('🎨 CSS 참조 관계 분석 시작...');

    // 1. main.css 분석 - @import 구문 추출
    const mainCss = this.safeReadFile('css/main.css');
    if (mainCss) {
      const importMatches = mainCss.match(/@import\s+["']([^"']+)["']/g) || [];
      importMatches.forEach(match => {
        const importPath = match.match(/@import\s+["']([^"']+)["']/)[1];
        const resolvedPath = importPath.startsWith('http') 
          ? importPath 
          : path.join('css', importPath).replace(/\\/g, '/');
        
        this.analysis.css.imports.push({
          path: importPath,
          resolvedPath: resolvedPath,
          exists: importPath.startsWith('http') || this.fileExists(resolvedPath),
          source: 'css/main.css'
        });
      });
    }

    // 2. 개별 CSS 파일 검사
    const cssDirectories = ['css/core', 'css/components', 'css/features', 'css/pages', 'css/layout', 'css/design-system'];
    cssDirectories.forEach(dir => {
      if (fs.existsSync(path.join(this.baseDir, dir))) {
        const files = fs.readdirSync(path.join(this.baseDir, dir));
        files.filter(file => file.endsWith('.css')).forEach(file => {
          const filePath = `${dir}/${file}`;
          const content = this.safeReadFile(filePath);
          if (content) {
            // CSS 내부의 @import 구문도 분석
            const innerImports = content.match(/@import\s+["']([^"']+)["']/g) || [];
            innerImports.forEach(match => {
              const importPath = match.match(/@import\s+["']([^"']+)["']/)[1];
              this.analysis.css.imports.push({
                path: importPath,
                resolvedPath: path.join(dir, importPath).replace(/\\/g, '/'),
                exists: this.fileExists(path.join(dir, importPath)),
                source: filePath
              });
            });

            // CSS 변수 사용 분석
            const cssVars = content.match(/var\(--[^)]+\)/g) || [];
            cssVars.forEach(variable => {
              this.analysis.designSystem.tokens.push({
                variable: variable,
                file: filePath,
                type: 'css-variable'
              });
            });
          }
        });
      }
    });

    // 3. 번들 파일 검증
    const bundleFiles = ['dist/styles.css', 'dist/styles.min.css'];
    bundleFiles.forEach(bundlePath => {
      const exists = this.fileExists(bundlePath);
      this.analysis.css.bundles.push({
        path: bundlePath,
        exists: exists,
        size: exists ? this.getFileSize(bundlePath) : 0
      });
    });

    console.log(`✅ CSS 임포트 ${this.analysis.css.imports.length}개 분석 완료`);
  }

  // HTML 참조 분석
  analyzeHTMLReferences() {
    console.log('📄 HTML 참조 관계 분석 시작...');

    // HTML 파일 목록 수집
    const htmlFiles = this.findHTMLFiles(this.baseDir);
    
    htmlFiles.forEach(filePath => {
      const relativePath = path.relative(this.baseDir, filePath).replace(/\\/g, '/');
      const content = this.safeReadFile(relativePath);
      
      if (content) {
        const pageAnalysis = {
          path: relativePath,
          title: this.extractTitle(content),
          cssLinks: this.extractCSSLinks(content, relativePath),
          jsReferences: this.extractJSReferences(content, relativePath),
          imageReferences: this.extractImageReferences(content, relativePath),
          fontReferences: this.extractFontReferences(content),
          metaTags: this.extractMetaTags(content)
        };

        this.analysis.html.pages.push(pageAnalysis);
      }
    });

    console.log(`✅ HTML 페이지 ${this.analysis.html.pages.length}개 분석 완료`);
  }

  // JavaScript 의존성 분석
  analyzeJSReferences() {
    console.log('⚡ JavaScript 의존성 분석 시작...');

    // JavaScript 파일 목록 수집
    const jsFiles = this.findJSFiles(path.join(this.baseDir, 'js'));
    
    jsFiles.forEach(filePath => {
      const relativePath = path.relative(this.baseDir, filePath).replace(/\\/g, '/');
      const content = this.safeReadFile(relativePath);
      
      if (content) {
        const jsAnalysis = {
          path: relativePath,
          imports: this.extractJSImports(content, relativePath),
          exports: this.extractJSExports(content),
          dependencies: this.extractJSDependencies(content),
          type: this.getJSModuleType(content)
        };

        this.analysis.js.modules.push(jsAnalysis);
      }
    });

    console.log(`✅ JavaScript 모듈 ${this.analysis.js.modules.length}개 분석 완료`);
  }

  // 리소스 파일 분석
  analyzeResourceReferences() {
    console.log('🖼️ 리소스 파일 분석 시작...');

    // 이미지 파일 분석
    const imageDir = path.join(this.baseDir, 'images');
    if (fs.existsSync(imageDir)) {
      const imageFiles = this.findImageFiles(imageDir);
      imageFiles.forEach(filePath => {
        const relativePath = path.relative(this.baseDir, filePath).replace(/\\/g, '/');
        this.analysis.resources.images.push({
          path: relativePath,
          size: this.getFileSize(relativePath),
          referencedBy: this.findImageReferences(relativePath)
        });
      });
    }

    // 폰트 파일 분석
    const fontDir = path.join(this.baseDir, 'fonts');
    if (fs.existsSync(fontDir)) {
      const fontFiles = this.findFontFiles(fontDir);
      fontFiles.forEach(filePath => {
        const relativePath = path.relative(this.baseDir, filePath).replace(/\\/g, '/');
        this.analysis.resources.fonts.push({
          path: relativePath,
          size: this.getFileSize(relativePath),
          type: path.extname(filePath)
        });
      });
    }

    console.log(`✅ 리소스 파일 분석 완료`);
  }

  // 디자인 시스템 분석
  analyzeDesignSystem() {
    console.log('🎨 디자인 시스템 분석 시작...');

    // Linear 테마 파일 분석
    const themeFile = this.safeReadFile('design-system/linear-theme.json');
    if (themeFile) {
      try {
        const themeData = JSON.parse(themeFile);
        this.analysis.designSystem.themes.push({
          file: 'design-system/linear-theme.json',
          tokens: Object.keys(themeData).length,
          data: themeData
        });
      } catch (error) {
        console.warn('Linear 테마 파일 파싱 실패:', error.message);
      }
    }

    // CSS 토큰 파일 분석
    const tokensFile = this.safeReadFile('css/design-system/tokens.css');
    if (tokensFile) {
      const cssVariables = tokensFile.match(/--[\w-]+:[^;]+/g) || [];
      cssVariables.forEach(variable => {
        this.analysis.designSystem.tokens.push({
          variable: variable,
          file: 'css/design-system/tokens.css',
          type: 'design-token'
        });
      });
    }

    // 하이라이터 패턴 분석
    const highlighterFile = this.safeReadFile('css/design-system/highlighter-patterns.css');
    if (highlighterFile) {
      const patterns = highlighterFile.match(/\.highlight-[\w-]+/g) || [];
      patterns.forEach(pattern => {
        this.analysis.designSystem.patterns.push({
          pattern: pattern,
          file: 'css/design-system/highlighter-patterns.css'
        });
      });
    }

    console.log(`✅ 디자인 시스템 분석 완료`);
  }

  // 유틸리티 메서드들
  findHTMLFiles(dir) {
    const files = [];
    
    const scan = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);
        items.forEach(item => {
          const itemPath = path.join(currentDir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scan(itemPath);
          } else if (stat.isFile() && item.endsWith('.html')) {
            files.push(itemPath);
          }
        });
      } catch (error) {
        console.warn(`디렉토리 스캔 실패: ${currentDir} - ${error.message}`);
      }
    };
    
    scan(dir);
    return files;
  }

  findJSFiles(dir) {
    const files = [];
    
    const scan = (currentDir) => {
      try {
        if (!fs.existsSync(currentDir)) return;
        
        const items = fs.readdirSync(currentDir);
        items.forEach(item => {
          const itemPath = path.join(currentDir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory() && !item.startsWith('.')) {
            scan(itemPath);
          } else if (stat.isFile() && item.endsWith('.js') && !item.endsWith('.min.js')) {
            files.push(itemPath);
          }
        });
      } catch (error) {
        console.warn(`JS 파일 스캔 실패: ${currentDir} - ${error.message}`);
      }
    };
    
    scan(dir);
    return files;
  }

  findImageFiles(dir) {
    const files = [];
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
    
    const scan = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);
        items.forEach(item => {
          const itemPath = path.join(currentDir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            scan(itemPath);
          } else if (stat.isFile() && imageExtensions.includes(path.extname(item).toLowerCase())) {
            files.push(itemPath);
          }
        });
      } catch (error) {
        console.warn(`이미지 파일 스캔 실패: ${currentDir} - ${error.message}`);
      }
    };
    
    scan(dir);
    return files;
  }

  findFontFiles(dir) {
    const files = [];
    const fontExtensions = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];
    
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isFile() && fontExtensions.includes(path.extname(item).toLowerCase())) {
          files.push(itemPath);
        }
      });
    } catch (error) {
      console.warn(`폰트 파일 스캔 실패: ${dir} - ${error.message}`);
    }
    
    return files;
  }

  extractTitle(content) {
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1] : '';
  }

  extractCSSLinks(content, htmlPath) {
    const links = [];
    const linkMatches = content.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
    
    linkMatches.forEach(match => {
      const hrefMatch = match.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        const href = hrefMatch[1];
        const resolvedPath = this.resolveRelativePath(href, htmlPath);
        
        links.push({
          href: href,
          resolvedPath: resolvedPath,
          exists: href.startsWith('http') || this.fileExists(resolvedPath),
          htmlFile: htmlPath
        });
      }
    });
    
    return links;
  }

  extractJSReferences(content, htmlPath) {
    const scripts = [];
    const scriptMatches = content.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
    
    scriptMatches.forEach(match => {
      const srcMatch = match.match(/src=["']([^"']+)["']/i);
      if (srcMatch) {
        const src = srcMatch[1];
        const resolvedPath = this.resolveRelativePath(src, htmlPath);
        
        scripts.push({
          src: src,
          resolvedPath: resolvedPath,
          exists: src.startsWith('http') || this.fileExists(resolvedPath),
          type: match.includes('type="module"') ? 'module' : 'script',
          htmlFile: htmlPath
        });
      }
    });
    
    return scripts;
  }

  extractImageReferences(content, htmlPath) {
    const images = [];
    const imgMatches = content.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
    
    imgMatches.forEach(match => {
      const srcMatch = match.match(/src=["']([^"']+)["']/i);
      if (srcMatch) {
        const src = srcMatch[1];
        const resolvedPath = this.resolveRelativePath(src, htmlPath);
        
        images.push({
          src: src,
          resolvedPath: resolvedPath,
          exists: src.startsWith('http') || src.startsWith('data:') || this.fileExists(resolvedPath),
          htmlFile: htmlPath
        });
      }
    });
    
    return images;
  }

  extractFontReferences(content) {
    const fonts = [];
    
    // Google Fonts 링크
    const googleFontMatches = content.match(/fonts\.googleapis\.com[^"']+/g) || [];
    googleFontMatches.forEach(match => {
      fonts.push({
        type: 'google-fonts',
        url: match
      });
    });

    // 로컬 폰트 프리로드
    const preloadMatches = content.match(/<link[^>]*rel=["']preload["'][^>]*as=["']font["'][^>]*>/gi) || [];
    preloadMatches.forEach(match => {
      const hrefMatch = match.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        fonts.push({
          type: 'preload',
          href: hrefMatch[1]
        });
      }
    });
    
    return fonts;
  }

  extractMetaTags(content) {
    const meta = {};
    
    // OG 태그
    const ogMatches = content.match(/<meta[^>]*property=["']og:[^"']+["'][^>]*>/gi) || [];
    ogMatches.forEach(match => {
      const propertyMatch = match.match(/property=["']og:([^"']+)["']/i);
      const contentMatch = match.match(/content=["']([^"']+)["']/i);
      
      if (propertyMatch && contentMatch) {
        meta[`og:${propertyMatch[1]}`] = contentMatch[1];
      }
    });

    return meta;
  }

  extractJSImports(content, jsPath) {
    const imports = [];
    
    // ES6 import 구문
    const importMatches = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
    importMatches.forEach(match => {
      const pathMatch = match.match(/from\s+['"]([^'"]+)['"]/);
      if (pathMatch) {
        const importPath = pathMatch[1];
        const resolvedPath = this.resolveJSPath(importPath, jsPath);
        
        imports.push({
          path: importPath,
          resolvedPath: resolvedPath,
          exists: this.fileExists(resolvedPath),
          type: 'es6-import',
          source: jsPath
        });
      }
    });

    // require 구문
    const requireMatches = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
    requireMatches.forEach(match => {
      const pathMatch = match.match(/require\(['"]([^'"]+)['"]\)/);
      if (pathMatch) {
        const requirePath = pathMatch[1];
        const resolvedPath = this.resolveJSPath(requirePath, jsPath);
        
        imports.push({
          path: requirePath,
          resolvedPath: resolvedPath,
          exists: this.fileExists(resolvedPath),
          type: 'commonjs-require',
          source: jsPath
        });
      }
    });
    
    return imports;
  }

  extractJSExports(content) {
    const exports = [];
    
    // export 구문
    const exportMatches = content.match(/export\s+(default\s+)?(class|function|const|let|var)\s+(\w+)/g) || [];
    exportMatches.forEach(match => {
      const nameMatch = match.match(/export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/);
      if (nameMatch) {
        exports.push({
          name: nameMatch[1],
          type: match.includes('default') ? 'default' : 'named',
          kind: match.match(/(class|function|const|let|var)/)[1]
        });
      }
    });
    
    return exports;
  }

  extractJSDependencies(content) {
    const dependencies = [];
    
    // window 객체 사용
    const windowMatches = content.match(/window\.(\w+)/g) || [];
    windowMatches.forEach(match => {
      const property = match.replace('window.', '');
      dependencies.push({
        type: 'global',
        name: property
      });
    });

    // 전역 함수 호출
    const globalFunctions = ['fetch', 'localStorage', 'sessionStorage', 'console'];
    globalFunctions.forEach(func => {
      if (content.includes(func)) {
        dependencies.push({
          type: 'global-api',
          name: func
        });
      }
    });
    
    return dependencies;
  }

  getJSModuleType(content) {
    if (content.includes('import ') || content.includes('export ')) {
      return 'es6-module';
    } else if (content.includes('module.exports') || content.includes('require(')) {
      return 'commonjs';
    } else {
      return 'script';
    }
  }

  resolveRelativePath(href, htmlPath) {
    if (href.startsWith('http') || href.startsWith('//') || href.startsWith('data:')) {
      return href;
    }
    
    const htmlDir = path.dirname(htmlPath);
    const resolved = path.join(htmlDir, href).replace(/\\/g, '/');
    
    // 정규화
    return resolved.startsWith('./') ? resolved.slice(2) : resolved;
  }

  resolveJSPath(importPath, jsPath) {
    if (importPath.startsWith('http') || importPath.startsWith('//')) {
      return importPath;
    }
    
    const jsDir = path.dirname(jsPath);
    let resolved = path.join(jsDir, importPath).replace(/\\/g, '/');
    
    // .js 확장자 추가 (필요시)
    if (!path.extname(resolved)) {
      resolved += '.js';
    }
    
    return resolved;
  }

  getFileSize(filePath) {
    try {
      const fullPath = path.join(this.baseDir, filePath);
      const stats = fs.statSync(fullPath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  findImageReferences(imagePath) {
    const references = [];
    
    // HTML 파일에서 이미지 참조 찾기
    this.analysis.html.pages.forEach(page => {
      page.imageReferences.forEach(img => {
        if (img.resolvedPath === imagePath) {
          references.push({
            type: 'html',
            file: page.path
          });
        }
      });
    });
    
    return references;
  }

  // 누락된 파일 검증
  validateReferences() {
    console.log('🔍 참조 검증 시작...');

    // CSS 임포트 검증
    this.analysis.css.imports.forEach(imp => {
      if (!imp.exists && !imp.path.startsWith('http')) {
        this.analysis.css.missingFiles.push(imp);
      }
    });

    // HTML 참조 검증
    this.analysis.html.pages.forEach(page => {
      page.cssLinks.forEach(link => {
        if (!link.exists) {
          this.analysis.html.missingReferences.push({
            type: 'css',
            file: page.path,
            reference: link.href
          });
        }
      });

      page.jsReferences.forEach(script => {
        if (!script.exists) {
          this.analysis.html.missingReferences.push({
            type: 'js',
            file: page.path,
            reference: script.src
          });
        }
      });

      page.imageReferences.forEach(img => {
        if (!img.exists) {
          this.analysis.html.missingReferences.push({
            type: 'image',
            file: page.path,
            reference: img.src
          });
        }
      });
    });

    // JS 임포트 검증
    this.analysis.js.modules.forEach(module => {
      module.imports.forEach(imp => {
        if (!imp.exists) {
          this.analysis.js.missingFiles.push(imp);
        }
      });
    });

    console.log(`✅ 참조 검증 완료`);
  }

  // 분석 실행
  async runAnalysis() {
    console.log('🚀 doha.kr 프론트엔드 참조 관계 분석 시작...\n');

    try {
      await this.analyzeCSSReferences();
      await this.analyzeHTMLReferences();
      await this.analyzeJSReferences();
      await this.analyzeResourceReferences();
      await this.analyzeDesignSystem();
      await this.validateReferences();

      console.log('\n✅ 모든 분석 완료!');
      return this.generateReport();
    } catch (error) {
      console.error('❌ 분석 중 오류 발생:', error);
      throw error;
    }
  }

  // 보고서 생성
  generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportData = {
      timestamp: timestamp,
      summary: this.generateSummary(),
      analysis: this.analysis,
      recommendations: this.generateRecommendations()
    };

    // JSON 보고서 저장
    const jsonReport = `css-js-reference-report-${Date.now()}.json`;
    fs.writeFileSync(jsonReport, JSON.stringify(reportData, null, 2));

    // HTML 보고서 생성
    const htmlReport = this.generateHTMLReport(reportData);
    const htmlReportPath = 'css-js-reference-system-final-report.html';
    fs.writeFileSync(htmlReportPath, htmlReport);

    console.log(`📊 보고서 생성 완료:`);
    console.log(`   - JSON: ${jsonReport}`);
    console.log(`   - HTML: ${htmlReportPath}`);

    return reportData;
  }

  generateSummary() {
    return {
      css: {
        totalImports: this.analysis.css.imports.length,
        missingFiles: this.analysis.css.missingFiles.length,
        bundleFiles: this.analysis.css.bundles.length
      },
      html: {
        totalPages: this.analysis.html.pages.length,
        totalCSSLinks: this.analysis.html.pages.reduce((sum, page) => sum + page.cssLinks.length, 0),
        totalJSReferences: this.analysis.html.pages.reduce((sum, page) => sum + page.jsReferences.length, 0),
        missingReferences: this.analysis.html.missingReferences.length
      },
      js: {
        totalModules: this.analysis.js.modules.length,
        totalImports: this.analysis.js.modules.reduce((sum, mod) => sum + mod.imports.length, 0),
        missingFiles: this.analysis.js.missingFiles.length
      },
      resources: {
        totalImages: this.analysis.resources.images.length,
        totalFonts: this.analysis.resources.fonts.length
      },
      designSystem: {
        totalTokens: this.analysis.designSystem.tokens.length,
        totalPatterns: this.analysis.designSystem.patterns.length,
        totalThemes: this.analysis.designSystem.themes.length
      }
    };
  }

  generateRecommendations() {
    const recommendations = [];

    // CSS 번들 권장사항
    if (this.analysis.css.bundles.filter(b => b.exists).length === 0) {
      recommendations.push({
        type: 'critical',
        category: 'css-bundling',
        title: 'CSS 번들 파일이 존재하지 않습니다',
        description: 'npm run build:css 명령어를 실행하여 CSS 번들을 생성하세요.',
        action: 'npm run build:css'
      });
    }

    // 누락된 파일 권장사항
    if (this.analysis.css.missingFiles.length > 0) {
      recommendations.push({
        type: 'error',
        category: 'missing-css',
        title: `${this.analysis.css.missingFiles.length}개의 CSS 파일이 누락되었습니다`,
        description: '참조되었지만 존재하지 않는 CSS 파일들을 생성하거나 참조를 수정하세요.',
        files: this.analysis.css.missingFiles.map(f => f.resolvedPath)
      });
    }

    if (this.analysis.js.missingFiles.length > 0) {
      recommendations.push({
        type: 'error',
        category: 'missing-js',
        title: `${this.analysis.js.missingFiles.length}개의 JavaScript 파일이 누락되었습니다`,
        description: '참조되었지만 존재하지 않는 JavaScript 파일들을 생성하거나 참조를 수정하세요.',
        files: this.analysis.js.missingFiles.map(f => f.resolvedPath)
      });
    }

    if (this.analysis.html.missingReferences.length > 0) {
      recommendations.push({
        type: 'warning',
        category: 'missing-resources',
        title: `${this.analysis.html.missingReferences.length}개의 리소스 참조가 누락되었습니다`,
        description: 'HTML에서 참조하는 파일들이 존재하지 않습니다.',
        files: this.analysis.html.missingReferences
      });
    }

    // 성능 권장사항
    const largeImages = this.analysis.resources.images.filter(img => img.size > 500 * 1024); // 500KB 이상
    if (largeImages.length > 0) {
      recommendations.push({
        type: 'optimization',
        category: 'image-optimization',
        title: '큰 이미지 파일들이 발견되었습니다',
        description: '이미지 최적화를 통해 로딩 성능을 향상시키세요.',
        files: largeImages.map(img => ({ path: img.path, size: img.size }))
      });
    }

    return recommendations;
  }

  generateHTMLReport(reportData) {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>doha.kr 프론트엔드 참조 관계 분석 보고서</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .summary-number {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .section {
            background: white;
            margin-bottom: 30px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section-header {
            background: #667eea;
            color: white;
            padding: 15px 20px;
            font-weight: bold;
            font-size: 1.2em;
        }
        .section-content {
            padding: 20px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .table th,
        .table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .table th {
            background: #f8f9fa;
            font-weight: 600;
        }
        .status-ok { color: #28a745; font-weight: bold; }
        .status-error { color: #dc3545; font-weight: bold; }
        .status-warning { color: #ffc107; font-weight: bold; }
        .code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 0.9em;
        }
        .recommendation {
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 5px;
        }
        .recommendation.critical {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
        }
        .recommendation.error {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
        }
        .recommendation.warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
        }
        .recommendation.optimization {
            background: #d1ecf1;
            border-left: 4px solid #17a2b8;
        }
        .file-list {
            max-height: 200px;
            overflow-y: auto;
            background: #f8f9fa;
            padding: 10px;
            border-radius: 3px;
            margin-top: 10px;
        }
        .collapse-toggle {
            background: none;
            border: none;
            color: #667eea;
            cursor: pointer;
            text-decoration: underline;
            font-size: 0.9em;
        }
        .collapsible {
            display: none;
        }
        .collapsible.show {
            display: block;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 doha.kr 프론트엔드 참조 관계 분석 보고서</h1>
        <p>생성일: ${new Date(reportData.timestamp).toLocaleString('ko-KR')}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <div class="summary-number">${reportData.summary.html.totalPages}</div>
            <div>HTML 페이지</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${reportData.summary.css.totalImports}</div>
            <div>CSS 임포트</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${reportData.summary.js.totalModules}</div>
            <div>JavaScript 모듈</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${reportData.summary.resources.totalImages}</div>
            <div>이미지 파일</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${reportData.summary.designSystem.totalTokens}</div>
            <div>디자인 토큰</div>
        </div>
    </div>

    ${reportData.recommendations.length > 0 ? `
    <div class="section">
        <div class="section-header">⚠️ 권장사항</div>
        <div class="section-content">
            ${reportData.recommendations.map(rec => `
                <div class="recommendation ${rec.type}">
                    <strong>${rec.title}</strong><br>
                    ${rec.description}
                    ${rec.action ? `<br><code class="code">${rec.action}</code>` : ''}
                    ${rec.files ? `
                        <button class="collapse-toggle" onclick="toggleCollapse(this)">
                            파일 목록 보기 (${Array.isArray(rec.files) ? rec.files.length : 0}개)
                        </button>
                        <div class="file-list collapsible">
                            ${Array.isArray(rec.files) ? rec.files.map(file => 
                                typeof file === 'string' ? `<div class="code">${file}</div>` :
                                `<div class="code">${file.path || file.reference || JSON.stringify(file)}</div>`
                            ).join('') : ''}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-header">🎨 CSS 번들링 상태</div>
        <div class="section-content">
            <table class="table">
                <thead>
                    <tr>
                        <th>번들 파일</th>
                        <th>존재</th>
                        <th>크기</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.analysis.css.bundles.map(bundle => `
                        <tr>
                            <td><code class="code">${bundle.path}</code></td>
                            <td><span class="${bundle.exists ? 'status-ok' : 'status-error'}">${bundle.exists ? '✓' : '✗'}</span></td>
                            <td>${bundle.exists ? (bundle.size / 1024).toFixed(2) + ' KB' : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>

    <div class="section">
        <div class="section-header">📄 HTML 페이지 분석</div>
        <div class="section-content">
            <p>총 ${reportData.summary.html.totalPages}개 페이지 분석</p>
            <button class="collapse-toggle" onclick="toggleCollapse(this)">상세 정보 보기</button>
            <div class="collapsible">
                <table class="table">
                    <thead>
                        <tr>
                            <th>페이지</th>
                            <th>CSS 링크</th>
                            <th>JS 참조</th>
                            <th>이미지</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.analysis.html.pages.map(page => `
                            <tr>
                                <td><code class="code">${page.path}</code></td>
                                <td>${page.cssLinks.length}</td>
                                <td>${page.jsReferences.length}</td>
                                <td>${page.imageReferences.length}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">⚡ JavaScript 모듈 의존성</div>
        <div class="section-content">
            <p>총 ${reportData.summary.js.totalModules}개 모듈, ${reportData.summary.js.totalImports}개 임포트</p>
            <button class="collapse-toggle" onclick="toggleCollapse(this)">모듈 목록 보기</button>
            <div class="collapsible">
                <table class="table">
                    <thead>
                        <tr>
                            <th>모듈</th>
                            <th>타입</th>
                            <th>임포트 수</th>
                            <th>익스포트 수</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.analysis.js.modules.map(module => `
                            <tr>
                                <td><code class="code">${module.path}</code></td>
                                <td>${module.type}</td>
                                <td>${module.imports.length}</td>
                                <td>${module.exports.length}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">🎨 디자인 시스템</div>
        <div class="section-content">
            <p>디자인 토큰: ${reportData.summary.designSystem.totalTokens}개</p>
            <p>하이라이터 패턴: ${reportData.summary.designSystem.totalPatterns}개</p>
            <p>테마: ${reportData.summary.designSystem.totalThemes}개</p>
            
            ${reportData.analysis.designSystem.patterns.length > 0 ? `
                <button class="collapse-toggle" onclick="toggleCollapse(this)">하이라이터 패턴 보기</button>
                <div class="collapsible">
                    <div class="file-list">
                        ${reportData.analysis.designSystem.patterns.map(pattern => 
                            `<div class="code">${pattern.pattern}</div>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    </div>

    <script>
        function toggleCollapse(button) {
            const content = button.nextElementSibling;
            if (content.classList.contains('show')) {
                content.classList.remove('show');
                button.textContent = button.textContent.replace('숨기기', '보기');
            } else {
                content.classList.add('show');
                button.textContent = button.textContent.replace('보기', '숨기기');
            }
        }
    </script>
</body>
</html>`;
  }
}

// 실행
async function main() {
  const mapper = new FrontendReferenceMapper();
  try {
    const result = await mapper.runAnalysis();
    
    console.log('\n📊 분석 결과 요약:');
    console.log(`   CSS: ${result.summary.css.totalImports}개 임포트, ${result.summary.css.missingFiles}개 누락`);
    console.log(`   HTML: ${result.summary.html.totalPages}개 페이지, ${result.summary.html.missingReferences}개 누락 참조`);
    console.log(`   JS: ${result.summary.js.totalModules}개 모듈, ${result.summary.js.missingFiles}개 누락`);
    console.log(`   리소스: ${result.summary.resources.totalImages}개 이미지, ${result.summary.resources.totalFonts}개 폰트`);
    console.log(`   디자인시스템: ${result.summary.designSystem.totalTokens}개 토큰, ${result.summary.designSystem.totalPatterns}개 패턴`);
    
    if (result.recommendations.length > 0) {
      console.log(`\n⚠️  ${result.recommendations.length}개 권장사항이 있습니다. HTML 보고서를 확인하세요.`);
    }

  } catch (error) {
    console.error('❌ 실행 실패:', error);
    process.exit(1);
  }
}

// ES 모듈에서 실행
main();

export default FrontendReferenceMapper;