/**
 * Maskable 아이콘 생성 도구
 * 기존 아이콘을 활용해 Android Adaptive Icon용 maskable 아이콘을 생성합니다.
 */

import fs from 'fs';

// SVG 기반 maskable 아이콘 생성
function createMaskableIconSVG(size, iconPath = '/images/icon-192x192.png') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Safe zone background (20% padding) -->
  <rect width="${size}" height="${size}" fill="#6366f1" rx="${size * 0.1}"/>
  
  <!-- Icon in center (80% of size) -->
  <foreignObject x="${size * 0.1}" y="${size * 0.1}" width="${size * 0.8}" height="${size * 0.8}">
    <div xmlns="http://www.w3.org/1999/xhtml" 
         style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: transparent;">
      <div style="width: 80%; height: 80%; background: white; border-radius: 20%; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif; font-weight: bold; font-size: ${size * 0.15}px; color: #6366f1;">
        도하
      </div>
    </div>
  </foreignObject>
</svg>`;
}

// 192x192 maskable 아이콘 생성
const maskable192 = createMaskableIconSVG(192);
fs.writeFileSync('images/icon-maskable-192x192.svg', maskable192);

// 512x512 maskable 아이콘 생성
const maskable512 = createMaskableIconSVG(512);
fs.writeFileSync('images/icon-maskable-512x512.svg', maskable512);

console.log('✅ Maskable 아이콘 (SVG) 생성 완료');
console.log('📝 참고: PNG 변환이 필요한 경우 온라인 도구 사용 권장');
console.log('   - squoosh.app');
console.log('   - cloudconvert.com');
console.log('   - convertio.co');

// 임시로 기존 아이콘을 복사해서 maskable 용으로 사용
try {
  if (fs.existsSync('images/icon-192x192.png')) {
    fs.copyFileSync('images/icon-192x192.png', 'images/icon-maskable-192x192.png');
    console.log('✅ icon-maskable-192x192.png 임시 생성 (기존 아이콘 복사)');
  }

  if (fs.existsSync('images/icon-512x512.png')) {
    fs.copyFileSync('images/icon-512x512.png', 'images/icon-maskable-512x512.png');
    console.log('✅ icon-maskable-512x512.png 임시 생성 (기존 아이콘 복사)');
  }
} catch (error) {
  console.error('아이콘 복사 중 오류:', error.message);
}
