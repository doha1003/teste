/**
 * Create Missing PWA Icons
 * 누락된 아이콘들을 생성하는 스크립트
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 기존 아이콘을 복사하여 누락된 크기 생성
function createMissingIcons() {
  const iconsDir = path.join(__dirname, '..', 'images');
  const sourceIcon = path.join(iconsDir, 'icon-512x512.png');
  const targetIcon = path.join(iconsDir, 'icon-256x256.png');

  try {
    // 512x512 아이콘이 있으면 256x256으로 복사
    if (fs.existsSync(sourceIcon)) {
      fs.copyFileSync(sourceIcon, targetIcon);
      console.log('✅ Created icon-256x256.png from icon-512x512.png');
    } else {
      console.error('❌ Source icon icon-512x512.png not found');
      return false;
    }

    // manifest.json에서 참조하는 모든 아이콘 검증
    const manifestPath = path.join(__dirname, '..', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    const missingIcons = [];
    manifest.icons.forEach((icon) => {
      const iconPath = path.join(__dirname, '..', icon.src);
      if (!fs.existsSync(iconPath)) {
        missingIcons.push(icon.src);
      }
    });

    if (missingIcons.length > 0) {
      console.warn('⚠️ Still missing icons:', missingIcons);
      return false;
    }

    console.log('✅ All PWA icons are now available');
    return true;
  } catch (error) {
    console.error('❌ Error creating missing icons:', error);
    return false;
  }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔧 Creating missing PWA icons...');
  const success = createMissingIcons();
  process.exit(success ? 0 : 1);
}

export { createMissingIcons };
