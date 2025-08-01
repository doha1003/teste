import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // 테스트 환경 설정
    environment: 'jsdom',

    // 전역 설정
    globals: true,

    // 설정 파일
    setupFiles: ['./tests/setup.js'],

    // 테스트 파일 패턴
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],

    // 제외할 파일
    exclude: ['node_modules/**', 'tests/e2e/**', 'tests/fixtures/**', 'tests/utils/**'],

    // 커버리지 설정
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['js/**/*.js', 'api/**/*.js'],
      exclude: [
        'js/**/*.test.js',
        'js/**/*.spec.js',
        'tests/**',
        'tools/**',
        'node_modules/**',
        '**/*.config.js',
        'js/third-party/**',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },

    // 테스트 리포터
    reporters: ['default', 'html'],

    // 테스트 타임아웃
    testTimeout: 10000,

    // 병렬 실행
    threads: true,
    maxThreads: 4,
    minThreads: 1,

    // 파일 감시 설정
    watch: false,

    // 상세 로그
    logHeapUsage: true,

    // 모의 설정
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  },

  // 경로 별칭 설정
  resolve: {
    alias: {
      '@': resolve(__dirname, './js'),
      '@api': resolve(__dirname, './api'),
      '@css': resolve(__dirname, './css'),
      '@tests': resolve(__dirname, './tests'),
      '@utils': resolve(__dirname, './js/utils'),
      '@core': resolve(__dirname, './js/core'),
      '@features': resolve(__dirname, './js/features'),
      '@pages': resolve(__dirname, './js/pages'),
    },
  },
});
