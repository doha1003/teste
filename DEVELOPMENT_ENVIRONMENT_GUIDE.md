# 🛠️ doha.kr 개발 환경 구축 가이드

**작성일**: 2025-01-25  
**버전**: 1.0  
**대상**: Windows 10/11 개발 환경

---

## 🎯 구축 목표

현재 정적 웹사이트에서 → 모던 개발 환경으로 전환
- **보안**: XSS 방어, CSP 강화, 입력값 검증
- **성능**: 번들링 최적화, 이미지 최적화, 캐싱
- **품질**: TypeScript, 린팅, 테스트 자동화
- **배포**: CI/CD 파이프라인, 자동화된 품질 검증

---

## 📋 설치 순서 체크리스트

### ✅ Phase 1: 기본 도구 설치 (30분)
- [ ] Node.js 18+ LTS 버전
- [ ] Git 설정 및 GitHub CLI
- [ ] Visual Studio Code + 필수 확장
- [ ] Chrome/Edge DevTools 설정

### ✅ Phase 2: 개발 도구 설치 (20분)
- [ ] 패키지 관리자 설정 (npm/yarn)
- [ ] 빌드 도구 (Webpack, Babel)
- [ ] TypeScript 환경
- [ ] 코드 품질 도구 (ESLint, Prettier)

### ✅ Phase 3: 보안 도구 설치 (15분)
- [ ] DOMPurify, Joi 검증 라이브러리
- [ ] 취약점 스캐너 (npm audit, Snyk)
- [ ] CSP 헤더 검증 도구

### ✅ Phase 4: 성능 도구 설치 (25분)
- [ ] Lighthouse CI
- [ ] Webpack Bundle Analyzer
- [ ] 이미지 최적화 도구
- [ ] Service Worker 도구

### ✅ Phase 5: 테스트 환경 구축 (20분)
- [ ] Jest 테스트 프레임워크
- [ ] Playwright E2E 테스트
- [ ] 테스트 커버리지 도구

---

## 🔧 상세 설치 가이드

### Phase 1: 기본 도구 설치

#### 1.1 Node.js 설치
```bash
# Option 1: 공식 사이트에서 LTS 버전 다운로드
# https://nodejs.org/ko/download/

# Option 2: Chocolatey 사용 (Windows)
choco install nodejs

# Option 3: nvm 사용 (권장)
# https://github.com/coreybutler/nvm-windows
nvm install 18.19.0
nvm use 18.19.0

# 설치 확인
node --version  # v18.19.0+
npm --version   # 10.2.0+
```

#### 1.2 Git 및 GitHub CLI
```bash
# Git 설치 (이미 설치되어 있다면 생략)
git --version

# GitHub CLI 설치
# https://cli.github.com/
gh --version

# GitHub 로그인
gh auth login

# 레포지토리 클론
gh repo clone doha1003/teste
cd teste
```

#### 1.3 Visual Studio Code 설정
```bash
# 필수 확장 프로그램 설치
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension ms-playwright.playwright
code --install-extension humao.rest-client
```

### Phase 2: 개발 도구 설정

#### 2.1 프로젝트 초기화
```bash
# 패키지 초기화 (기존 package.json이 없다면)
npm init -y

# 또는 기존 package.json 업데이트
npm install
```

#### 2.2 빌드 도구 설치
```bash
# Webpack 및 관련 도구
npm install --save-dev \
  webpack@5 \
  webpack-cli@5 \
  webpack-dev-server@4 \
  webpack-merge@5 \
  html-webpack-plugin@5 \
  mini-css-extract-plugin@2 \
  css-loader@6 \
  style-loader@3 \
  terser-webpack-plugin@5 \
  css-minimizer-webpack-plugin@5 \
  clean-webpack-plugin@4

# Babel 트랜스파일러
npm install --save-dev \
  @babel/core@7 \
  @babel/preset-env@7 \
  @babel/preset-typescript@7 \
  babel-loader@9

# 개발 서버 및 핫 리로드
npm install --save-dev \
  webpack-dev-server@4 \
  webpack-hot-middleware@2
```

#### 2.3 TypeScript 설정
```bash
# TypeScript 설치
npm install --save-dev \
  typescript@5 \
  @types/node@20 \
  @types/dom@20 \
  ts-loader@9

# tsconfig.json 생성
npx tsc --init
```

#### 2.4 코드 품질 도구
```bash
# ESLint 및 설정
npm install --save-dev \
  eslint@8 \
  @typescript-eslint/parser@6 \
  @typescript-eslint/eslint-plugin@6 \
  eslint-config-prettier@9 \
  eslint-plugin-prettier@5

# Prettier 포맷터
npm install --save-dev \
  prettier@3

# Husky (Git hooks)
npm install --save-dev \
  husky@8 \
  lint-staged@15
```

### Phase 3: 보안 도구 설치

#### 3.1 입력값 검증 라이브러리
```bash
# 클라이언트/서버 검증
npm install \
  dompurify@3 \
  joi@17 \
  validator@13

# TypeScript 타입 정의
npm install --save-dev \
  @types/dompurify@3 \
  @types/validator@13
```

#### 3.2 보안 검사 도구
```bash
# 취약점 스캐너
npm install --save-dev \
  audit-ci@6 \
  retire@4

# Snyk 보안 스캐너 (선택사항)
npm install -g snyk
snyk auth  # 회원가입 필요
```

#### 3.3 CSP 및 보안 헤더 도구
```bash
# 보안 헤더 검증
npm install --save-dev \
  csp-header-validator@1

# 런타임 보안
npm install \
  helmet@7 \
  rate-limiter-flexible@3
```

### Phase 4: 성능 도구 설치

#### 4.1 Lighthouse 및 성능 측정
```bash
# Lighthouse CI
npm install --save-dev \
  @lhci/cli@0.12 \
  lighthouse@11

# 글로벌 설치 (선택사항)
npm install -g @lhci/cli
```

#### 4.2 번들 분석 도구
```bash
# Webpack 번들 분석
npm install --save-dev \
  webpack-bundle-analyzer@4 \
  size-limit@8 \
  bundlesize@0.18

# 성능 모니터링
npm install \
  web-vitals@3
```

#### 4.3 이미지 최적화 도구
```bash
# 이미지 압축
npm install --save-dev \
  imagemin@8 \
  imagemin-mozjpeg@10 \
  imagemin-pngquant@9 \
  imagemin-webp@7 \
  sharp@0.32

# Webpack 플러그인
npm install --save-dev \
  image-webpack-loader@8
```

#### 4.4 Service Worker 도구
```bash
# Workbox (PWA)
npm install --save-dev \
  workbox-webpack-plugin@7 \
  workbox-precaching@7 \
  workbox-runtime-caching@7
```

### Phase 5: 테스트 환경 구축

#### 5.1 Jest 테스트 프레임워크
```bash
# Jest 및 관련 도구
npm install --save-dev \
  jest@29 \
  @types/jest@29 \
  ts-jest@29 \
  jest-environment-jsdom@29

# 테스트 유틸리티
npm install --save-dev \
  @testing-library/jest-dom@6 \
  @testing-library/dom@9
```

#### 5.2 Playwright E2E 테스트
```bash
# Playwright 설치
npm install --save-dev \
  @playwright/test@1.40

# 브라우저 설치
npx playwright install
```

#### 5.3 커버리지 도구
```bash
# 코드 커버리지
npm install --save-dev \
  nyc@15 \
  c8@8

# 커버리지 리포터
npm install --save-dev \
  jest-html-reporters@3
```

---

## ⚙️ 설정 파일 생성

### 1. package.json 스크립트 설정
```json
{
  "scripts": {
    "dev": "webpack serve --mode development --open",
    "build": "webpack --mode production",
    "build:analyze": "npm run build && npx webpack-bundle-analyzer dist/stats.json",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext .ts,.js",
    "lint:fix": "eslint src --ext .ts,.js --fix",
    "format": "prettier --write \"src/**/*.{ts,js,css,html}\"",
    "security:audit": "npm audit --audit-level high",
    "security:scan": "retire --path src",
    "performance:lighthouse": "lhci autorun",
    "performance:size": "size-limit",
    "clean": "rimraf dist",
    "deploy": "npm run build && gh-pages -d dist",
    "validate": "npm run lint && npm run test && npm run security:audit"
  }
}
```

### 2. webpack.config.js
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      main: './src/js/main.ts',
      'api-config': './src/js/api-config.ts'
    },
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
      clean: true
    },
    
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[contenthash][ext]'
          }
        }
      ]
    },
    
    plugins: [
      new CleanWebpackPlugin(),
      
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        chunks: ['main', 'api-config'],
        minify: isProduction
      }),
      
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: 'css/[name].[contenthash].css'
        })
      ] : []),
      
      ...(process.env.ANALYZE ? [
        new BundleAnalyzerPlugin()
      ] : [])
    ],
    
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: { drop_console: true }
          }
        }),
        new CssMinimizerPlugin()
      ],
      
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    
    devServer: {
      contentBase: './dist',
      port: 3000,
      hot: true,
      open: true,
      historyApiFallback: true
    },
    
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  };
};
```

### 3. tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts"
  ]
}
```

### 4. .eslintrc.js
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn'
  }
};
```

### 5. .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf"
}
```

### 6. jest.config.js
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.(ts|js)',
    '**/*.(test|spec).(ts|js)'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts']
};
```

### 7. playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    }
  ],

  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});
```

---

## 🚀 환경 검증

### 1. 설치 확인 스크립트
```bash
# create-verification-script.js
const fs = require('fs');
const { execSync } = require('child_process');

const checks = [
  { name: 'Node.js', command: 'node --version', required: 'v18.' },
  { name: 'npm', command: 'npm --version', required: '9.' },
  { name: 'Git', command: 'git --version', required: 'git version' },
  { name: 'GitHub CLI', command: 'gh --version', required: 'gh version' },
  { name: 'TypeScript', command: 'npx tsc --version', required: 'Version 5' },
  { name: 'Webpack', command: 'npx webpack --version', required: 'webpack 5' }
];

console.log('🔍 개발 환경 검증 중...\n');

checks.forEach(check => {
  try {
    const output = execSync(check.command, { encoding: 'utf8' });
    const isValid = output.includes(check.required);
    console.log(`${isValid ? '✅' : '❌'} ${check.name}: ${output.trim()}`);
  } catch (error) {
    console.log(`❌ ${check.name}: 설치되지 않음`);
  }
});

console.log('\n📦 패키지 의존성 확인...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const devDeps = Object.keys(packageJson.devDependencies || {});
  const deps = Object.keys(packageJson.dependencies || {});
  
  console.log(`✅ 개발 의존성: ${devDeps.length}개`);
  console.log(`✅ 런타임 의존성: ${deps.length}개`);
} catch (error) {
  console.log('❌ package.json을 찾을 수 없습니다.');
}
```

### 2. 환경 테스트 실행
```bash
# 환경 검증
node create-verification-script.js

# 빌드 테스트
npm run build

# 테스트 실행
npm test

# 린팅 검사
npm run lint

# 보안 검사
npm run security:audit
```

---

## 📁 프로젝트 구조 재편성

### 현재 구조
```
teste/
├── css/              # 기존 CSS 파일들
├── js/               # 기존 JavaScript 파일들
├── images/           # 이미지 파일들
├── *.html           # HTML 페이지들
└── api/             # Vercel API 함수들
```

### 새로운 구조 (마이그레이션 후)
```
teste/
├── src/                    # 소스 코드
│   ├── js/
│   │   ├── main.ts
│   │   ├── api-config.ts
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   ├── css/
│   │   ├── styles.css
│   │   ├── components/
│   │   └── pages/
│   ├── images/
│   ├── templates/
│   │   └── *.html
│   └── types/
│       └── index.ts
├── dist/                   # 빌드된 파일들 (자동 생성)
├── tests/
│   ├── unit/
│   └── e2e/
├── api/                    # Vercel API (기존 유지)
├── docs/                   # 문서
├── scripts/                # 빌드/배포 스크립트
└── config files           # 설정 파일들
```

---

## ⏰ 예상 소요 시간

### 초기 설치 (총 2시간)
- **Phase 1**: 30분 (기본 도구)
- **Phase 2**: 20분 (개발 도구)
- **Phase 3**: 15분 (보안 도구)
- **Phase 4**: 25분 (성능 도구)
- **Phase 5**: 20분 (테스트 환경)
- **설정 파일**: 30분

### 마이그레이션 작업 (총 1주)
- **파일 구조 재편성**: 1일
- **TypeScript 변환**: 2일
- **테스트 코드 작성**: 2일
- **CI/CD 설정**: 2일

---

## 🎯 다음 단계

환경 구축 완료 후:
1. **보안 모듈 설계서** 검토
2. **성능 최적화 설계서** 검토  
3. **만세력 DB API 설계서** 검토
4. 실제 구현 시작

---

**완료 체크**: 모든 Phase 완료 후 `npm run validate` 명령어로 최종 검증