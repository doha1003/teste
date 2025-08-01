import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import filesize from 'rollup-plugin-filesize';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

// 페이지별 엔트리 포인트 찾기
function findPageEntries() {
  const pagesDir = './js/pages';
  const entries = {};
  
  try {
    const files = readdirSync(pagesDir);
    files.forEach(file => {
      if (file.endsWith('.js') && !file.includes('test')) {
        // Skip problematic file temporarily
        if (file === 'mbti-intro.js') {
          console.warn('Skipping mbti-intro.js due to parse error');
          return;
        }
        const name = file.replace('.js', '');
        entries[`pages/${name}`] = join(pagesDir, file);
      }
    });
  } catch (e) {
    console.warn('No pages directory found');
  }
  
  return entries;
}

// 기능별 엔트리 포인트 찾기
function findFeatureEntries() {
  const featuresDir = './js/features';
  const entries = {};
  
  const scanDir = (dir, prefix = '') => {
    try {
      const files = readdirSync(dir);
      files.forEach(file => {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath, prefix ? `${prefix}/${file}` : file);
        } else if (file.endsWith('.js') && !file.includes('test')) {
          const name = file.replace('.js', '');
          const key = prefix ? `features/${prefix}/${name}` : `features/${name}`;
          entries[key] = fullPath;
        }
      });
    } catch (e) {
      console.warn(`Error scanning ${dir}:`, e.message);
    }
  };
  
  scanDir(featuresDir);
  return entries;
}

// 공통 플러그인 설정
const createPlugins = (production = false) => [
  replace({
    'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
    preventAssignment: true
  }),
  nodeResolve({
    browser: true,
    preferBuiltins: false,
    extensions: ['.js', '.json']
  }),
  commonjs(),
  production && terser({
    compress: {
      drop_console: true,
      drop_debugger: true,
      passes: 2
    },
    mangle: {
      toplevel: true
    },
    format: {
      comments: false
    }
  }),
  filesize({
    showBrotliSize: true,
    showGzippedSize: true,
    showMinifiedSize: true
  })
].filter(Boolean);

// 모든 엔트리 포인트
const allEntries = {
  'app': './js/app.js',
  'main': './js/main.js',
  ...findPageEntries(),
  ...findFeatureEntries()
};

// 번들 설정 생성
function createBundleConfig(input, outputName) {
  return {
    input,
    output: [
      {
        file: `dist/js/${outputName}.js`,
        format: 'es',
        sourcemap: !isProduction
      },
      {
        file: `dist/js/${outputName}.min.js`,
        format: 'iife',
        name: outputName.replace(/[^a-zA-Z0-9]/g, '_'),
        sourcemap: !isProduction
      }
    ],
    plugins: createPlugins(isProduction),
    external: id => {
      // 외부 라이브러리는 번들에 포함하지 않음
      if (id.startsWith('@google/generative-ai')) return true;
      if (id.startsWith('openai')) return true;
      if (id.startsWith('node-fetch')) return true;
      return false;
    }
  };
}

// 메인 앱 번들 (모든 코드 포함)
const mainBundle = {
  input: './js/app.js',
  output: {
    file: isProduction ? 'dist/js/bundle.min.js' : 'dist/js/bundle.js',
    format: 'es',
    sourcemap: !isProduction,
    inlineDynamicImports: true
  },
  plugins: createPlugins(isProduction),
  external: id => {
    if (id.startsWith('@google/generative-ai')) return true;
    if (id.startsWith('openai')) return true;
    if (id.startsWith('node-fetch')) return true;
    return false;
  }
};

// 공통 코드 번들
const commonBundle = {
  input: {
    'common': './js/core/common-init.js',
    'service-base': './js/core/service-base.js',
    'mobile-menu': './js/core/mobile-menu.js',
    'pwa-helpers': './js/core/pwa-helpers.js'
  },
  output: {
    dir: 'dist/js/core',
    format: 'es',
    sourcemap: !isProduction,
    chunkFileNames: '[name]-[hash].js'
  },
  plugins: createPlugins(isProduction)
};

// 개별 번들 설정 (코드 스플리팅용)
const individualBundles = Object.entries(allEntries).map(([name, input]) => 
  createBundleConfig(input, name)
);

// 설정 내보내기
export default [
  mainBundle,
  commonBundle,
  ...individualBundles
];