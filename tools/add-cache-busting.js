import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const timestamp = new Date().getTime();

async function addCacheBusting() {
  console.log('CSS 캐시 버스팅 추가 시작...');

  // 모든 디렉토리에서 HTML 파일 찾기
  const directories = [
    '.',
    'about',
    'contact',
    'faq',
    'privacy',
    'terms',
    'tests',
    'tests/mbti',
    'tests/love-dna',
    'tests/teto-egen',
    'tools',
    'tools/bmi',
    'tools/text-counter',
    'tools/salary',
    'fortune',
    'fortune/daily',
    'fortune/saju',
    'fortune/tarot',
    'fortune/zodiac',
    'fortune/zodiac-animal',
  ];

  for (const dir of directories) {
    try {
      const fullPath = join('C:/Users/pc/teste', dir);
      const files = await readdir(fullPath);

      for (const file of files) {
        if (file.endsWith('.html')) {
          const filePath = join(fullPath, file);
          let content = await readFile(filePath, 'utf-8');

          // main.css에 캐시 버스팅 추가
          content = content.replace(
            /<link\s+rel="stylesheet"\s+href="(\/css\/main\.css)">/g,
            `<link rel="stylesheet" href="$1?v=${timestamp}">`
          );

          // 다른 CSS 파일들에도 추가
          content = content.replace(
            /<link\s+rel="stylesheet"\s+href="(\/css\/[^"]+\.css)"(?!.*\?v=)/g,
            `<link rel="stylesheet" href="$1?v=${timestamp}"`
          );

          await writeFile(filePath, content, 'utf-8');
          console.log(`✅ ${filePath} 업데이트 완료`);
        }
      }
    } catch (error) {
      // 디렉토리가 없을 수 있음
      if (error.code !== 'ENOENT') {
        console.error(`❌ ${dir} 처리 중 오류:`, error.message);
      }
    }
  }

  console.log(`\n✨ 캐시 버스팅 완료! 타임스탬프: ${timestamp}`);
}

addCacheBusting().catch(console.error);
