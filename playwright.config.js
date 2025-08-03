import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 테스트 디렉토리 (모든 테스트 포함)
  testDir: './tests',

  // 테스트 실행 설정
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  // 테스트 파일 패턴
  testMatch: [
    'tests/e2e/**/*.spec.js',
    'tests/accessibility/**/*.test.js',
    'tests/security/**/*.test.js',
    'tests/performance/**/*.test.js',
    'tests/localization/**/*.test.js',
    'tests/cross-browser/**/*.test.js',
  ],

  // 리포터 설정
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  // 전역 설정
  use: {
    // 기본 URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // 스크린샷 설정
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },

    // 비디오 녹화
    video: process.env.CI ? 'off' : 'retain-on-failure',

    // 추적
    trace: 'on-first-retry',

    // 뷰포트
    viewport: { width: 1280, height: 720 },

    // 액션 타임아웃
    actionTimeout: 15000,

    // 네비게이션 타임아웃
    navigationTimeout: 30000,

    // 한국어 로케일
    locale: 'ko-KR',

    // 타임존
    timezoneId: 'Asia/Seoul',

    // 권한
    // permissions: ['clipboard-read', 'clipboard-write'], // Firefox/Safari에서 지원하지 않음

    // 오프라인 모드 테스트
    offline: false,

    // JavaScript 활성화
    javaScriptEnabled: true,

    // 사용자 에이전트
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },

  // 프로젝트 설정 (브라우저별)
  projects: [
    // 데스크톱 브라우저
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
      },
      testDir: './tests',
      testMatch: [
        'tests/e2e/**/*.spec.js',
        'tests/accessibility/**/*.test.js',
        'tests/security/**/*.test.js',
        'tests/cross-browser/**/*.test.js',
      ],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
      },
      testDir: './tests',
      testMatch: ['tests/e2e/**/*.spec.js', 'tests/cross-browser/**/*.test.js'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
      },
      testDir: './tests',
      testMatch: ['tests/e2e/**/*.spec.js', 'tests/cross-browser/**/*.test.js'],
    },

    // 모바일 디바이스
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
      },
      testDir: './tests',
      testMatch: [
        'tests/e2e/**/*.spec.js',
        'tests/accessibility/**/*.test.js',
        'tests/cross-browser/**/*.test.js',
      ],
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
      },
      testDir: './tests',
      testMatch: ['tests/e2e/**/*.spec.js', 'tests/cross-browser/**/*.test.js'],
    },
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 768 },
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
      },
      testDir: './tests',
      testMatch: ['tests/e2e/**/*.spec.js', 'tests/cross-browser/**/*.test.js'],
    },

    // 성능 테스트 (Chrome만)
    {
      name: 'performance',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
      },
      testDir: './tests',
      testMatch: ['tests/performance/**/*.test.js'],
    },

    // 한국어 특화 테스트
    {
      name: 'localization',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
      },
      testDir: './tests',
      testMatch: ['tests/localization/**/*.test.js'],
    },
  ],

  // 웹 서버 설정 (로컬 개발용)
  webServer: process.env.CI
    ? undefined
    : {
        command: 'python -m http.server 3000',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      },

  // 테스트 출력 폴더
  outputDir: 'test-results/',

  // 전역 설정 파일
  globalSetup: './tests/e2e/global-setup.js',
  globalTeardown: './tests/e2e/global-teardown.js',
});
