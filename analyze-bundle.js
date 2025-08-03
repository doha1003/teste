import { statSync, existsSync } from 'fs';
import { join } from 'path';

// 번들 크기 분석 도구
function analyzeBundleSize() {
  const bundlePaths = [
    'dist/js/bundle.min.js',
    'dist/js/bundle.js',
    'dist/styles.min.css',
    'dist/styles.css'
  ];

  console.log('\n📊 번들 크기 분석 결과\n');
  console.log('─'.repeat(50));

  for (const bundlePath of bundlePaths) {
    if (existsSync(bundlePath)) {
      const stats = statSync(bundlePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`${bundlePath}: ${sizeKB} KB`);
    } else {
      console.log(`${bundlePath}: 파일 없음`);
    }
  }

  console.log('─'.repeat(50));
  console.log('✅ 번들 분석 완료\n');
}

analyzeBundleSize();