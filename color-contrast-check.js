// WCAG 대비비 계산 함수
function luminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrast(color1, color2) {
  const l1 = luminance(...color1);
  const l2 = luminance(...color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

// 색상 대비비 검증
const colors = {
  'Hero Background (Dark)': '#3730a3',
  'Hero Background (Light)': '#4f46e5', 
  'Primary Button': '#5c5ce0',
  'Primary Button Hover': '#4f46e5',
  'Secondary Text': '#6b7280',
  'Border Color': '#e5e7eb'
};

const white = [255, 255, 255];
const black = [0, 0, 0];

console.log('=== 색상 대비비 검증 (WCAG AA 기준: 4.5:1) ===');
console.log('');

for (const [name, hex] of Object.entries(colors)) {
  const rgb = hexToRgb(hex);
  
  // 흰색 배경과의 대비
  const ratioWhite = contrast(rgb, white);
  const passWhite = ratioWhite >= 4.5 ? '✅ PASS' : '❌ FAIL';
  
  // 검은색 배경과의 대비 (다크모드용)
  const ratioBlack = contrast(rgb, black);
  const passBlack = ratioBlack >= 4.5 ? '✅ PASS' : '❌ FAIL';
  
  console.log(`${name}: ${hex}`);
  console.log(`  vs 흰색: ${ratioWhite.toFixed(2)}:1 ${passWhite}`);
  console.log(`  vs 검은색: ${ratioBlack.toFixed(2)}:1 ${passBlack}`);
  console.log('');
}

// 특별 검증: 텍스트 색상들
const textColors = {
  'Primary Text': '#1a1a1a',
  'Secondary Text': '#6b7280',
  'Muted Text': '#9ca3af'
};

console.log('=== 텍스트 색상 대비비 검증 ===');
console.log('');

for (const [name, hex] of Object.entries(textColors)) {
  const rgb = hexToRgb(hex);
  const ratio = contrast(rgb, white);
  const pass = ratio >= 4.5 ? '✅ PASS' : '❌ FAIL';
  
  console.log(`${name}: ${hex}`);
  console.log(`  대비비: ${ratio.toFixed(2)}:1 ${pass}`);
  console.log('');
}