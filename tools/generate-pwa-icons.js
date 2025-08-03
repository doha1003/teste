/**
 * PWA 아이콘 생성 스크립트
 * 기본 아이콘에서 모든 필요한 크기의 아이콘을 생성
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 생성할 아이콘 크기 목록
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  // 특수 아이콘
  { size: 72, name: 'badge-72x72.png', badge: true },
  { size: 192, name: 'icon-maskable-192x192.png', maskable: true },
  { size: 512, name: 'icon-maskable-512x512.png', maskable: true },
];

async function generateIcons() {
  const sourceIcon = path.join(__dirname, '../images/icon-512x512.png');
  const outputDir = path.join(__dirname, '../images');

  try {
    // 원본 아이콘 확인
    await fs.access(sourceIcon);
    console.log('원본 아이콘 파일을 찾았습니다:', sourceIcon);

    // 각 크기별로 아이콘 생성
    for (const icon of iconSizes) {
      const outputPath = path.join(outputDir, icon.name);

      try {
        if (icon.maskable) {
          // Maskable 아이콘: 여백 추가
          const padding = Math.floor(icon.size * 0.1); // 10% 패딩
          const imageSize = icon.size - padding * 2;

          await sharp(sourceIcon)
            .resize(imageSize, imageSize, {
              fit: 'contain',
              background: { r: 99, g: 102, b: 241, alpha: 1 }, // Primary color
            })
            .extend({
              top: padding,
              bottom: padding,
              left: padding,
              right: padding,
              background: { r: 99, g: 102, b: 241, alpha: 1 },
            })
            .toFile(outputPath);

          console.log(`✓ Maskable 아이콘 생성: ${icon.name}`);
        } else if (icon.badge) {
          // Badge 아이콘: 더 단순한 버전
          await sharp(sourceIcon)
            .resize(icon.size, icon.size, {
              fit: 'contain',
              background: { r: 255, g: 255, b: 255, alpha: 0 },
            })
            .toFile(outputPath);

          console.log(`✓ Badge 아이콘 생성: ${icon.name}`);
        } else {
          // 일반 아이콘
          await sharp(sourceIcon)
            .resize(icon.size, icon.size, {
              fit: 'contain',
              background: { r: 255, g: 255, b: 255, alpha: 0 },
            })
            .toFile(outputPath);

          console.log(`✓ 아이콘 생성: ${icon.name}`);
        }
      } catch (error) {
        console.error(`✗ ${icon.name} 생성 실패:`, error.message);
      }
    }

    // Apple Touch Icon 생성
    const appleTouchIcon = path.join(outputDir, 'apple-touch-icon.png');
    await sharp(sourceIcon)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toFile(appleTouchIcon);
    console.log('✓ Apple Touch 아이콘 생성: apple-touch-icon.png');

    // Favicon 생성 (32x32)
    const favicon = path.join(outputDir, 'favicon-32x32.png');
    await sharp(sourceIcon).resize(32, 32).toFile(favicon);
    console.log('✓ Favicon 생성: favicon-32x32.png');

    console.log('\n모든 아이콘이 성공적으로 생성되었습니다!');
  } catch (error) {
    console.error('오류 발생:', error.message);

    // 원본 아이콘이 없는 경우 기본 아이콘 생성
    if (error.code === 'ENOENT') {
      console.log('\n원본 아이콘이 없습니다. 기본 아이콘을 생성합니다...');
      await createDefaultIcon(outputDir);
    }
  }
}

/**
 * 기본 아이콘 생성 (원본이 없을 경우)
 */
async function createDefaultIcon(outputDir) {
  // SVG로 기본 아이콘 생성
  const svgIcon = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" rx="100" fill="#6366f1"/>
        <text x="256" y="320" font-family="Arial, sans-serif" font-size="200" font-weight="bold" 
              text-anchor="middle" fill="white">DK</text>
    </svg>
    `;

  // 각 크기별로 아이콘 생성
  for (const icon of iconSizes) {
    const outputPath = path.join(outputDir, icon.name);

    try {
      if (icon.maskable) {
        // Maskable 아이콘
        await sharp(Buffer.from(svgIcon)).resize(icon.size, icon.size).png().toFile(outputPath);
      } else {
        // 일반 아이콘
        await sharp(Buffer.from(svgIcon)).resize(icon.size, icon.size).png().toFile(outputPath);
      }

      console.log(`✓ 기본 아이콘 생성: ${icon.name}`);
    } catch (error) {
      console.error(`✗ ${icon.name} 생성 실패:`, error.message);
    }
  }
}

// 스크립트 실행
generateIcons().catch(console.error);
