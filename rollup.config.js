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
    files.forEach((file) => {
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
      files.forEach((file) => {
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
const createPlugins = (production = false) =>
  [
    replace({
      'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
      preventAssignment: true,
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      extensions: ['.js', '.json'],
    }),
    commonjs(),
    production &&
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 3,
          pure_funcs: ['console.log', 'console.warn', 'console.error'],
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          unsafe_math: true,
          unsafe_methods: true,
          keep_fargs: false,
          dead_code: true,
          conditionals: true,
          evaluate: true,
          booleans: true,
          loops: true,
          unused: true,
          hoist_funs: true,
          hoist_vars: true,
          if_return: true,
          join_vars: true,
          collapse_vars: true,
          reduce_vars: true,
          warnings: false,
          negate_iife: true,
          side_effects: false,
        },
        mangle: {
          toplevel: true,
          safari10: true,
        },
        format: {
          comments: false,
          ascii_only: true,
          beautify: false,
          webkit: true,
        },
      }),
    filesize({
      showBrotliSize: true,
      showGzippedSize: true,
      showMinifiedSize: true,
    }),
  ].filter(Boolean);

// 모든 엔트리 포인트
const allEntries = {
  app: './js/app.js',
  main: './js/main.js',
  ...findPageEntries(),
  ...findFeatureEntries(),
};

// 번들 설정 생성 (최적화된 버전)
function createBundleConfig(input, outputName) {
  return {
    input,
    output: {
      file: isProduction ? `dist/js/${outputName}.min.js` : `dist/js/${outputName}.js`,
      format: 'es',
      sourcemap: !isProduction,
      generatedCode: {
        constBindings: true,
        objectShorthand: true,
        arrowFunctions: true,
      },
    },
    plugins: createPlugins(isProduction),
    external: (id) => {
      // 외부 라이브러리는 번들에 포함하지 않음
      if (id.startsWith('@google/generative-ai')) return true;
      if (id.startsWith('openai')) return true;
      if (id.startsWith('node-fetch')) return true;
      return false;
    },
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      unknownGlobalSideEffects: false,
    },
  };
}

// 메인 앱 번들 (최적화된 버전)
const mainBundle = {
  input: './js/app.js',
  output: {
    file: isProduction ? 'dist/js/bundle.min.js' : 'dist/js/bundle.js',
    format: 'es',
    sourcemap: !isProduction,
    inlineDynamicImports: true, // 단일 번들로 인라인
    generatedCode: {
      constBindings: true,
      objectShorthand: true,
      arrowFunctions: true,
    },
  },
  plugins: createPlugins(isProduction),
  external: (id) => {
    if (id.startsWith('node-fetch')) return true;
    return false;
  },
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false,
  },
};

// 공통 코드 번들
const commonBundle = {
  input: {
    common: './js/core/common-init.js',
    'service-base': './js/core/service-base.js',
    'mobile-menu': './js/core/mobile-menu.js',
    'pwa-helpers': './js/core/pwa-helpers.js',
  },
  output: {
    dir: 'dist/js/core',
    format: 'es',
    sourcemap: !isProduction,
    chunkFileNames: '[name]-[hash].js',
  },
  plugins: createPlugins(isProduction),
};

// 핵심 기능별 번들만 생성 (최적화)
const coreEntries = {
  'fortune-core': './js/features/fortune/fortune-service.js',
  'tools-core': './js/features/tools/tool-service.js',
  'pages-core': './js/pages/home.js',
};

const coreBundles = Object.entries(coreEntries).map(([name, input]) =>
  createBundleConfig(input, name)
);

// 최적화된 설정 내보내기
export default isProduction
  ? [
      mainBundle, // 프로덕션에서는 메인 번들만
    ]
  : [mainBundle, commonBundle];
