import { rollup, watch } from 'rollup';
import { loadConfigFile } from 'rollup/loadConfigFile';
import { resolve } from 'path';
import { performance } from 'perf_hooks';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { gzipSync } from 'zlib';

const configPath = resolve('rollup.config.js');
const isWatch = process.argv.includes('--watch');
const isDev = process.argv.includes('--dev');

// 성능 측정
class BuildMetrics {
  constructor() {
    this.startTime = performance.now();
    this.bundles = [];
  }

  addBundle(name, size, gzipSize, buildTime) {
    this.bundles.push({ name, size, gzipSize, buildTime });
  }

  generateReport() {
    const totalTime = ((performance.now() - this.startTime) / 1000).toFixed(2);
    const totalSize = this.bundles.reduce((sum, b) => sum + b.size, 0);
    const totalGzipSize = this.bundles.reduce((sum, b) => sum + b.gzipSize, 0);

    console.log('\n========================================');
    console.log('📊 Build Report');
    console.log('========================================');
    console.log(`Total build time: ${totalTime}s`);
    console.log(`Total size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`Total gzipped: ${(totalGzipSize / 1024).toFixed(2)} KB`);
    console.log('\nBundle details:');

    this.bundles.forEach((bundle) => {
      console.log(`  - ${bundle.name}:`);
      console.log(`    Size: ${(bundle.size / 1024).toFixed(2)} KB`);
      console.log(`    Gzipped: ${(bundle.gzipSize / 1024).toFixed(2)} KB`);
      console.log(`    Build time: ${bundle.buildTime}s`);
    });

    // 성능 보고서 저장
    const report = {
      timestamp: new Date().toISOString(),
      totalTime,
      totalSize,
      totalGzipSize,
      bundles: this.bundles,
    };

    if (!existsSync('build-reports')) {
      mkdirSync('build-reports');
    }

    writeFileSync(`build-reports/build-${Date.now()}.json`, JSON.stringify(report, null, 2));
  }
}

// 파일 크기 계산
function getFileSize(filePath) {
  if (!existsSync(filePath)) return { size: 0, gzipSize: 0 };

  const content = readFileSync(filePath);
  const gzipped = gzipSync(content);

  return {
    size: content.length,
    gzipSize: gzipped.length,
  };
}

// 빌드 함수
async function build() {
  const metrics = new BuildMetrics();

  try {
    // Rollup 설정 로드
    const { options, warnings } = await loadConfigFile(configPath, {
      format: 'es',
    });

    warnings.flush();

    // 환경 변수 설정
    process.env.NODE_ENV = isDev ? 'development' : 'production';

    if (isWatch) {
      // Watch 모드
      console.log('👀 Starting watch mode...\n');

      const watcher = watch(options);

      watcher.on('event', (event) => {
        switch (event.code) {
          case 'START':
            console.log('🔄 Build started...');
            break;
          case 'BUNDLE_START':
            console.log(`📦 Building ${event.input}...`);
            break;
          case 'BUNDLE_END':
            console.log(`✅ Built ${event.input} in ${event.duration}ms`);
            break;
          case 'END':
            console.log('✨ Build completed!\n');
            break;
          case 'ERROR':
            console.error('❌ Build error:', event.error);
            break;
        }
      });

      // 프로세스 종료 시 watcher 정리
      process.on('SIGINT', () => {
        watcher.close();
        process.exit(0);
      });
    } else {
      // 일반 빌드
      console.log(`🏗️  Building in ${isDev ? 'development' : 'production'} mode...\n`);

      for (const optionSet of options) {
        const bundleStart = performance.now();
        const bundle = await rollup(optionSet);

        if (Array.isArray(optionSet.output)) {
          for (const outputOptions of optionSet.output) {
            await bundle.write(outputOptions);

            const { size, gzipSize } = getFileSize(outputOptions.file);
            const buildTime = ((performance.now() - bundleStart) / 1000).toFixed(2);

            metrics.addBundle(outputOptions.file, size, gzipSize, buildTime);
            console.log(`✅ Built ${outputOptions.file}`);
          }
        } else {
          await bundle.write(optionSet.output);

          const outputFile =
            optionSet.output.file ||
            `${optionSet.output.dir}/${Object.keys(optionSet.input)[0]}.js`;
          const { size, gzipSize } = getFileSize(outputFile);
          const buildTime = ((performance.now() - bundleStart) / 1000).toFixed(2);

          metrics.addBundle(outputFile, size, gzipSize, buildTime);
          console.log(`✅ Built ${outputFile}`);
        }

        await bundle.close();
      }

      // 성능 보고서 생성
      metrics.generateReport();

      // HTML 파일 업데이트 스크립트 생성
      await createHtmlUpdateScript();
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// HTML 업데이트 스크립트 생성
async function createHtmlUpdateScript() {
  const updateScript = `
// HTML 파일 업데이트를 위한 스크립트
// 번들된 JS 파일을 참조하도록 HTML 파일을 수정합니다.

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const htmlFiles = [];

// HTML 파일 찾기
function findHtmlFiles(dir) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = join(dir, file);
    
    if (file.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  });
}

// 루트 디렉토리의 HTML 파일
findHtmlFiles('.');

// 각 HTML 파일 업데이트
htmlFiles.forEach(htmlFile => {
  let content = readFileSync(htmlFile, 'utf8');
  let updated = false;
  
  // app.js를 bundle.min.js로 교체
  if (content.includes('js/app.js')) {
    content = content.replace(
      '<script type="module" src="js/app.js"></script>',
      '<script type="module" src="dist/js/bundle.min.js"></script>'
    );
    updated = true;
  }
  
  // 개별 페이지 스크립트 교체
  const pageScriptMatch = content.match(/<script type="module" src="js\\/pages\\/([^"]+)\\.js"><\\/script>/);
  if (pageScriptMatch) {
    const pageName = pageScriptMatch[1];
    content = content.replace(
      pageScriptMatch[0],
      \`<script type="module" src="dist/js/pages/\${pageName}.min.js"></script>\`
    );
    updated = true;
  }
  
  if (updated) {
    writeFileSync(htmlFile, content);
    console.log(\`Updated: \${htmlFile}\`);
  }
});

console.log('\\n✅ HTML files updated successfully!');
`;

  writeFileSync('update-html-references.js', updateScript);
  console.log('\n📝 Created update-html-references.js');
  console.log('   Run this script to update HTML file references to bundled JS files.');
}

// 빌드 실행
build();
