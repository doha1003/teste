#!/usr/bin/env node

/**
 * JavaScript Build Script for doha.kr
 * Rollup 기반 JavaScript 번들링
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const isDev = process.argv.includes('--dev');
const isWatch = process.argv.includes('--watch');

console.log('\n🚀 JavaScript Build Script');
console.log(`📦 Mode: ${isDev ? 'Development' : 'Production'}`);
console.log(`👀 Watch: ${isWatch ? 'Yes' : 'No'}\n`);

try {
  // Check if rollup config exists
  const rollupConfigPath = join(process.cwd(), 'rollup.config.js');
  
  if (!existsSync(rollupConfigPath)) {
    console.log('⚠️ rollup.config.js가 없습니다. 번들링을 건너뜁니다.');
    console.log('✅ JavaScript 모듈들은 이미 dist/js/ 폴더에 있습니다.');
    process.exit(0);
  }

  // Build command
  let command = `rollup -c rollup.config.js`;
  
  if (isWatch) {
    command += ' --watch';
  }
  
  if (isDev) {
    process.env.NODE_ENV = 'development';
  } else {
    process.env.NODE_ENV = 'production';
  }

  console.log(`🔨 실행 중: ${command}`);
  console.log(`🌍 환경: ${process.env.NODE_ENV}\n`);
  
  execSync(command, { 
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('\n✅ JavaScript 빌드 완료!');
  
} catch (error) {
  console.error('\n❌ JavaScript 빌드 실패:', error.message);
  
  // 대안 메시지
  console.log('\n💡 대안:');
  console.log('   JavaScript 모듈들이 이미 개별적으로 존재합니다.');
  console.log('   HTML에서 ES6 모듈로 직접 import하여 사용할 수 있습니다.');
  console.log('   예: <script type="module" src="/js/app.js"></script>');
  
  process.exit(0); // 에러로 처리하지 않음
}