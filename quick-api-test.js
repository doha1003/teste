/**
 * Quick API Test Script
 * API 엔드포인트가 올바르게 설정되었는지 빠르게 확인
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 doha.kr API 설정 검증 시작\n');

// 1. 필요한 파일들 존재 확인
const requiredFiles = [
  'api/cors-config.js',
  'api/cache-manager.js',
  'api/logging-middleware.js',
  'api/validation.js',
  'api/fortune.js',
  'api/manseryeok.js',
  'api/health.js',
  'data/manseryeok-compact.json',
  'vercel.json',
  '.env.local'
];

console.log('📁 필수 파일 존재 확인:');
let missingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  
  if (!exists) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log(`\n⚠️  누락된 파일: ${missingFiles.join(', ')}`);
} else {
  console.log('\n✅ 모든 필수 파일이 존재합니다.');
}

// 2. API 파일 import 테스트
console.log('\n📦 API 모듈 import 테스트:');

const apiModules = [
  'cors-config.js',
  'cache-manager.js',
  'logging-middleware.js',
  'validation.js'
];

let importErrors = [];

for (const moduleName of apiModules) {
  try {
    const modulePath = `./api/${moduleName}`;
    await import(modulePath);
    console.log(`  ✅ ${moduleName} - import 성공`);
  } catch (error) {
    console.log(`  ❌ ${moduleName} - import 실패: ${error.message}`);
    importErrors.push({ module: moduleName, error: error.message });
  }
}

// 3. 환경 설정 확인
console.log('\n🔧 환경 설정 확인:');

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const hasNodeEnv = envContent.includes('NODE_ENV=development');
  const hasVercelEnv = envContent.includes('VERCEL_ENV=development');
  const hasGeminiKey = envContent.includes('GEMINI_API_KEY=');
  
  console.log(`  ${hasNodeEnv ? '✅' : '❌'} NODE_ENV 설정`);
  console.log(`  ${hasVercelEnv ? '✅' : '❌'} VERCEL_ENV 설정`);
  console.log(`  ${hasGeminiKey ? '✅' : '❌'} GEMINI_API_KEY 설정`);
} catch (error) {
  console.log('  ❌ .env.local 파일 읽기 실패');
}

// 4. vercel.json CORS 설정 확인
console.log('\n🌐 CORS 설정 확인:');

try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  
  // API 헤더 확인 - CORS 중복 제거 되었는지 확인
  const apiHeaders = vercelConfig.headers.find(h => h.source === '/api/(.*)');
  
  if (apiHeaders) {
    const corsHeaders = apiHeaders.headers.filter(h => 
      h.key.startsWith('Access-Control-')
    );
    
    if (corsHeaders.length > 0) {
      console.log('  ⚠️  vercel.json에 정적 CORS 헤더가 여전히 존재함 (충돌 가능)');
      corsHeaders.forEach(h => {
        console.log(`     - ${h.key}: ${h.value}`);
      });
    } else {
      console.log('  ✅ vercel.json CORS 헤더 정리 완료 (동적 CORS 사용)');
    }
  }
} catch (error) {
  console.log('  ❌ vercel.json 파일 읽기/파싱 실패');
}

// 5. 만세력 데이터 확인
console.log('\n📊 만세력 데이터 확인:');

try {
  const dataPath = path.join(__dirname, 'data/manseryeok-compact.json');
  const stats = fs.statSync(dataPath);
  const sizeKB = Math.round(stats.size / 1024);
  
  console.log(`  ✅ 만세력 데이터 파일 존재 (${sizeKB}KB)`);
  console.log(`  ✅ 마지막 수정: ${stats.mtime.toLocaleDateString('ko-KR')}`);
  
  // 데이터 유효성 간단 확인
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const years = Object.keys(data);
  
  console.log(`  ✅ 데이터 범위: ${Math.min(...years)} ~ ${Math.max(...years)} (${years.length}년)`);
} catch (error) {
  console.log('  ❌ 만세력 데이터 확인 실패:', error.message);
}

// 6. 최종 요약
console.log('\n📋 최종 요약:');

const issues = [
  ...missingFiles.map(f => `누락된 파일: ${f}`),
  ...importErrors.map(e => `모듈 오류: ${e.module} - ${e.error}`)
];

if (issues.length === 0) {
  console.log('🎉 모든 검증 통과! API가 정상 작동할 준비가 되었습니다.');
  console.log('\n다음 단계:');
  console.log('1. .env.local에서 실제 GEMINI_API_KEY 설정');
  console.log('2. 브라우저에서 test-api-endpoints.html 열기');
  console.log('3. 각 API 엔드포인트 테스트 실행');
  console.log('4. Vercel에 배포 후 production 환경 테스트');
} else {
  console.log('⚠️  다음 문제들을 해결해야 합니다:');
  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue}`);
  });
}

console.log('\n완료! 🚀');