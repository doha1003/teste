/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 브라우저 환경 시뮬레이션
    environment: 'jsdom',
    
    // 글로벌 설정
    globals: true,
    
    // 테스트 파일 패턴
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    
    // 테스트 타임아웃 설정
    testTimeout: 10000,
    
    // 커버리지 설정
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'js/',
        'css/',
        'images/',
        '*.config.*',
        'tools/',
        'types/'
      ]
    },
    
    // 셋업 파일
    setupFiles: ['./tests/setup.ts'],
    
    // 병렬 실행 설정
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    }
  },
  
  // TypeScript 해결
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@types': new URL('./types', import.meta.url).pathname
    }
  }
});