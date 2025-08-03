#!/usr/bin/env node

/**
 * PWA 빌드 스크립트 - Doha.kr
 * 서비스 워커, 매니페스트, PWA 아이콘 최적화
 */

const fs = require('fs').promises;
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';
const isWatch = process.argv.includes('--watch');

console.log(`🚀 PWA 빌드 시작 (${isDev ? 'development' : 'production'})`);

async function buildPWA() {
  try {
    // 1. 서비스 워커 검증
    await validateServiceWorker();
    
    // 2. 매니페스트 검증
    await validateManifest();
    
    // 3. PWA 아이콘 확인
    await validatePWAIcons();
    
    // 4. 오프라인 페이지 확인
    await validateOfflinePage();
    
    console.log('✅ PWA 빌드 완료');
    
    if (isWatch) {
      console.log('👀 Watch 모드 활성화 - 변경사항 감지 중...');
      setupWatch();
    }
    
  } catch (error) {
    console.error('❌ PWA 빌드 실패:', error.message);
    process.exit(1);
  }
}

async function validateServiceWorker() {
  console.log('🔍 서비스 워커 검증 중...');
  
  const swPath = path.join(__dirname, 'sw.js');
  
  try {
    const swContent = await fs.readFile(swPath, 'utf-8');
    
    // 필수 기능 확인
    const requiredFeatures = [
      'self.addEventListener',
      'fetch',
      'install',
      'activate'
    ];
    
    for (const feature of requiredFeatures) {
      if (!swContent.includes(feature)) {
        throw new Error(`서비스 워커에서 ${feature} 기능이 누락됨`);
      }
    }
    
    console.log('✅ 서비스 워커 검증 완료');
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('⚠️ 서비스 워커가 없음 - 기본 서비스 워커 생성');
      await createDefaultServiceWorker();
    } else {
      throw error;
    }
  }
}

async function createDefaultServiceWorker() {
  const defaultSW = `// PWA 서비스 워커 - 자동 생성됨
const CACHE_NAME = 'doha-kr-v1';
const urlsToCache = [
  '/',
  '/css/main.css',
  '/js/main.js',
  '/manifest.json',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
`;

  await fs.writeFile(path.join(__dirname, 'sw.js'), defaultSW);
  console.log('✅ 기본 서비스 워커 생성 완료');
}

async function validateManifest() {
  console.log('🔍 PWA 매니페스트 검증 중...');
  
  const manifestPath = path.join(__dirname, 'manifest.json');
  
  try {
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);
    
    // 필수 필드 확인
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    
    for (const field of requiredFields) {
      if (!manifest[field]) {
        throw new Error(`매니페스트에서 ${field} 필드가 누락됨`);
      }
    }
    
    // 아이콘 확인
    if (!manifest.icons || manifest.icons.length === 0) {
      throw new Error('매니페스트에 아이콘이 정의되지 않음');
    }
    
    console.log('✅ PWA 매니페스트 검증 완료');
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('manifest.json 파일이 존재하지 않음');
    } else if (error instanceof SyntaxError) {
      throw new Error('manifest.json 파일 형식이 잘못됨');
    } else {
      throw error;
    }
  }
}

async function validatePWAIcons() {
  console.log('🔍 PWA 아이콘 확인 중...');
  
  const requiredIcons = [
    { path: 'images/icon-192x192.png', size: '192x192' },
    { path: 'images/icon-512x512.png', size: '512x512' },
    { path: 'images/icon-maskable-192x192.png', size: '192x192 maskable' },
    { path: 'images/icon-maskable-512x512.png', size: '512x512 maskable' }
  ];
  
  for (const icon of requiredIcons) {
    const iconPath = path.join(__dirname, icon.path);
    
    try {
      await fs.access(iconPath);
      console.log(`✅ ${icon.size} 아이콘 확인됨`);
    } catch (error) {
      console.log(`⚠️ ${icon.size} 아이콘 누락: ${icon.path}`);
    }
  }
}

async function validateOfflinePage() {
  console.log('🔍 오프라인 페이지 확인 중...');
  
  const offlinePath = path.join(__dirname, 'offline.html');
  
  try {
    await fs.access(offlinePath);
    console.log('✅ 오프라인 페이지 확인됨');
  } catch (error) {
    console.log('⚠️ 오프라인 페이지 누락 - 기본 페이지 생성');
    await createDefaultOfflinePage();
  }
}

async function createDefaultOfflinePage() {
  const defaultOffline = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>오프라인 - doha.kr</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
            text-align: center;
            padding: 50px;
            background-color: #f5f5f5;
        }
        .offline-container {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; }
        .retry-btn {
            background: #007AFF;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <h1>🌐 오프라인 상태</h1>
        <p>현재 인터넷에 연결되지 않았습니다.<br>
           연결을 확인한 후 다시 시도해주세요.</p>
        <button class="retry-btn" onclick="window.location.reload()">다시 시도</button>
    </div>
</body>
</html>`;

  await fs.writeFile(path.join(__dirname, 'offline.html'), defaultOffline);
  console.log('✅ 기본 오프라인 페이지 생성 완료');
}

function setupWatch() {
  const chokidar = require('chokidar');
  
  const watcher = chokidar.watch([
    'sw.js',
    'manifest.json',
    'offline.html',
    'images/icon-*.png'
  ], {
    ignored: /node_modules/,
    persistent: true
  });
  
  watcher.on('change', async (filePath) => {
    console.log(`📝 변경 감지: ${filePath}`);
    await buildPWA();
  });
}

// 빌드 실행
if (require.main === module) {
  buildPWA();
}

module.exports = { buildPWA };