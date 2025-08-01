/**
 * Service Worker 2.0 for doha.kr - PWA Excellence
 * 고급 캐싱 전략, 백그라운드 동기화, 푸시 알림
 * Version: 4.0.0 - Professional PWA Implementation
 * 
 * Features:
 * - Workbox-style caching strategies
 * - Background sync for offline actions
 * - Push notifications with Korean localization
 * - Performance monitoring and analytics
 * - Smart cache management with cleanup
 * - Offline-first architecture
 */

// 캐시 버전 관리 (semantic versioning)
const SW_VERSION = '4.0.0';
const CACHE_VERSION = `v${SW_VERSION}`;
const STATIC_CACHE = `doha-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `doha-dynamic-${CACHE_VERSION}`;
const API_CACHE = `doha-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `doha-images-${CACHE_VERSION}`;
const FONT_CACHE = `doha-fonts-${CACHE_VERSION}`;
const RUNTIME_CACHE = `doha-runtime-${CACHE_VERSION}`;

// 성능 메트릭 및 분석
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  offlineRequests: 0,
  apiCacheHits: 0,
  backgroundSync: 0,
  pushNotifications: 0,
  installPrompts: 0,
  startTime: Date.now(),
};

// 캐시 설정
const CACHE_CONFIG = {
  // 최대 캐시 크기 (MB)
  maxCacheSize: 50,
  // 캐시 만료 시간 (초)
  cacheExpiry: {
    static: 60 * 60 * 24 * 30, // 30일
    dynamic: 60 * 60 * 24 * 7, // 7일
    api: 60 * 60 * 2, // 2시간
    images: 60 * 60 * 24 * 14, // 14일
    fonts: 60 * 60 * 24 * 365, // 1년
  },
  // 최대 항목 수
  maxEntries: {
    static: 60,
    dynamic: 50,
    api: 100,
    images: 200,
    fonts: 30,
    runtime: 30,
  },
};

// 스마트 정적 자산 관리
const CRITICAL_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  // Critical CSS (bundled)
  '/dist/styles.css',
  '/css/korean-optimization.css',
  // Critical JavaScript
  '/js/app.js',
  '/js/core/common-init.js',
  '/js/core/error-handler.js',
  // Essential images
  '/images/logo.svg',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
];

const STATIC_ROUTES = [
  '/',
  '/tests/',
  '/tools/',
  '/fortune/',
  '/about/',
  '/contact/',
  '/privacy/',
  '/terms/',
  '/faq/',
];

// Font preloading
const FONT_ASSETS = [
  '/fonts/Pretendard-Regular.woff2',
  '/fonts/Pretendard-Medium.woff2',
  '/fonts/Pretendard-Bold.woff2',
];

// API 별 캐시 전략
const API_CACHE_CONFIG = {
  '/api/fortune': {
    strategy: 'staleWhileRevalidate',
    maxEntries: 500,
    maxAgeSeconds: 60 * 60 * 6, // 6시간
    cacheName: 'fortune-api-cache',
  },
  '/api/manseryeok': {
    strategy: 'cacheFirst',
    maxEntries: 1000,
    maxAgeSeconds: 60 * 60 * 24 * 30, // 30일 (달력 데이터는 변하지 않음)
    cacheName: 'manseryeok-api-cache',
  },
  '/api/validation': {
    strategy: 'networkFirst',
    maxEntries: 100,
    maxAgeSeconds: 60 * 60, // 1시간
    cacheName: 'validation-api-cache',
  },
};

// 고급 캐시 전략 매핑
const CACHE_STRATEGIES = {
  // Cache First - 정적 자산 (변경 빈도 낮음)
  cacheFirst: {
    patterns: [
      /\.(?:css|js|woff2?|ttf|eot)$/,
      /^\/fonts\//,
      /^\/dist\//,
      /manifest\.json$/,
    ],
    cacheName: STATIC_CACHE,
  },

  // Stale While Revalidate - 이미지 및 아이콘
  staleWhileRevalidate: {
    patterns: [
      /\.(?:png|jpg|jpeg|webp|gif|svg|ico)$/,
      /^\/images\//,
    ],
    cacheName: IMAGE_CACHE,
  },

  // Network First - HTML 페이지 (최신 콘텐츠 우선)
  networkFirst: {
    patterns: [
      /^\/$/,
      /^\/tests\//,
      /^\/tools\//,
      /^\/fortune\//,
      /^\/about/,
      /^\/contact/,
      /^\/privacy/,
      /^\/terms/,
      /^\/faq/,
      /\.html$/,
    ],
    cacheName: DYNAMIC_CACHE,
  },

  // 특별 처리 - API 엔드포인트
  api: {
    patterns: [/^\/api\//],
    cacheName: API_CACHE,
  },

  // Runtime - 동적으로 생성되는 콘텐츠
  runtime: {
    patterns: [],
    cacheName: RUNTIME_CACHE,
  },
};

// Install event - 스마트 자산 캐싱
self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Installing...`);
  
  event.waitUntil(
    Promise.all([
      // Critical assets caching
      caches.open(STATIC_CACHE).then((cache) => {
        console.log(`[SW ${SW_VERSION}] Caching critical assets`);
        return cache.addAll(CRITICAL_ASSETS);
      }),
      
      // Font preloading
      caches.open(FONT_CACHE).then((cache) => {
        console.log(`[SW ${SW_VERSION}] Preloading fonts`);
        return cache.addAll(FONT_ASSETS.map(font => new Request(font, { mode: 'cors' })));
      }),
      
      // Initialize performance tracking
      initializePerformanceTracking(),
    ])
    .then(() => {
      console.log(`[SW ${SW_VERSION}] Installation complete`);
      // 즉시 활성화
      return self.skipWaiting();
    })
    .catch((error) => {
      console.error(`[SW ${SW_VERSION}] Installation failed:`, error);
      // 설치 실패 시 메트릭 기록
      performanceMetrics.installationErrors = (performanceMetrics.installationErrors || 0) + 1;
    })
  );
});

// Activate event - 고급 캐시 정리 및 클라이언트 관리
self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] Activating...`);
  
  event.waitUntil(
    Promise.all([
      // 구버전 캐시 정리
      cleanupOldCaches(),
      
      // 캐시 크기 관리
      manageCacheSize(),
      
      // 클라이언트 업데이트 알림
      notifyClientsOfUpdate(),
      
      // 성능 메트릭 초기화
      resetPerformanceMetrics(),
    ])
    .then(() => {
      console.log(`[SW ${SW_VERSION}] Activation complete`);
      // 모든 탭에서 즉시 제어
      return self.clients.claim();
    })
    .catch((error) => {
      console.error(`[SW ${SW_VERSION}] Activation failed:`, error);
    })
  );
});

// Fetch event - 지능형 요청 처리
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 성능 메트릭 업데이트
  performanceMetrics.networkRequests++;
  
  // 처리할 수 없는 요청 필터링
  if (!shouldHandleRequest(url, request)) {
    return;
  }
  
  // 요청 타입별 처리
  event.respondWith(
    handleRequestWithStrategy(request)
      .then(response => {
        // 성공적인 응답 메트릭
        if (response && response.ok) {
          performanceMetrics.cacheHits++;
        } else {
          performanceMetrics.cacheMisses++;
        }
        return response;
      })
      .catch(error => {
        console.error(`[SW ${SW_VERSION}] Fetch error:`, error);
        performanceMetrics.cacheMisses++;
        return handleFetchError(request, error);
      })
  );
});

/**
 * 요청이 처리 가능한지 확인
 */
function shouldHandleRequest(url, request) {
  // Non-HTTP 요청 제외
  if (!request.url.startsWith('http')) {
    return false;
  }
  
  // Chrome extension 요청 제외
  if (url.protocol === 'chrome-extension:') {
    return false;
  }
  
  // 외부 도메인 제외 (허용된 도메인 제외)
  const allowedDomains = [
    location.origin,
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.jsdelivr.net',
    'unpkg.com',
  ];
  
  const isAllowed = allowedDomains.some(domain => 
    url.hostname === domain || url.hostname.endsWith('.' + domain)
  );
  
  if (!isAllowed) {
    return false;
  }
  
  // POST 요청은 특별 처리
  if (request.method !== 'GET') {
    return url.pathname.startsWith('/api/');
  }
  
  return true;
}

/**
 * 전략 기반 요청 처리
 */
async function handleRequestWithStrategy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // API 요청 처리
  if (pathname.startsWith('/api/')) {
    return await handleApiRequest(request);
  }
  
  // 전략 결정
  const strategy = determineStrategy(pathname);
  
  switch (strategy.name) {
    case 'cacheFirst':
      return await cacheFirst(request, strategy.cacheName);
    case 'networkFirst':
      return await networkFirst(request, strategy.cacheName);
    case 'staleWhileRevalidate':
      return await staleWhileRevalidate(request, strategy.cacheName);
    default:
      return await networkFirst(request, RUNTIME_CACHE);
  }
}

/**
 * 캐시 전략 결정
 */
function determineStrategy(pathname) {
  for (const [strategyName, config] of Object.entries(CACHE_STRATEGIES)) {
    if (config.patterns.some(pattern => pattern.test(pathname))) {
      return { name: strategyName, cacheName: config.cacheName };
    }
  }
  return { name: 'networkFirst', cacheName: RUNTIME_CACHE };
}

/**
 * Cache First - 정적 자산 우선 전략
 */
async function cacheFirst(request, cacheName = STATIC_CACHE) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // 백그라운드에서 캐시 업데이트 (stale-while-revalidate 방식)
      updateCacheInBackground(request, cache);
      return cachedResponse;
    }
    
    // 캐시에 없으면 네트워크에서 가져오기
    const networkResponse = await fetchWithTimeout(request);
    
    if (networkResponse.ok) {
      // 응답 크기 체크 후 캐시에 저장
      await safeCachePut(cache, request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error(`[SW] Cache First error:`, error);
    // 캐시와 네트워크 모두 실패 시 오프라인 처리
    return await handleOfflineRequest(request);
  }
}

/**
 * 백그라운드 캐시 업데이트
 */
function updateCacheInBackground(request, cache) {
  fetchWithTimeout(request, 5000) // 5초 타임아웃
    .then(response => {
      if (response.ok) {
        return safeCachePut(cache, request, response);
      }
    })
    .catch(() => {
      // 백그라운드 업데이트 실패는 무시
    });
}

/**
 * Network First - HTML 페이지 우선 전략
 */
async function networkFirst(request, cacheName = DYNAMIC_CACHE) {
  const cache = await caches.open(cacheName);
  
  try {
    // 네트워크 요청 (타임아웃 포함)
    const networkResponse = await fetchWithTimeout(request, 3000);
    
    if (networkResponse.ok) {
      // 성공적인 응답만 캐시
      await safeCachePut(cache, request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log(`[SW] Network failed, trying cache:`, request.url);
    
    // 네트워크 실패 시 캐시에서 찾기
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // 오프라인 헤더 추가
      const response = cachedResponse.clone();
      response.headers.set('X-Served-By', 'ServiceWorker-Cache');
      return response;
    }
    
    // 네비게이션 요청의 경우 오프라인 페이지 반환
    if (request.mode === 'navigate') {
      performanceMetrics.offlineRequests++;
      return await getOfflinePage();
    }
    
    // API 요청의 경우 저장된 데이터 확인
    if (request.url.includes('/api/')) {
      return await handleOfflineApiRequest(request);
    }
    
    throw error;
  }
}

/**
 * 오프라인 페이지 반환
 */
async function getOfflinePage() {
  const offlinePage = await caches.match('/offline.html');
  if (offlinePage) {
    return offlinePage;
  }
  
  // 오프라인 페이지도 없으면 기본 응답
  return new Response(
    createOfflineHTML(),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}

/**
 * 기본 오프라인 HTML 생성
 */
function createOfflineHTML() {
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>오프라인 - doha.kr</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
               text-align: center; padding: 50px; background: #f5f5f5; }
        .offline-msg { background: white; padding: 40px; border-radius: 8px; 
                      box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; 
                      margin: 0 auto; }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; }
        button { background: #6366f1; color: white; border: none; 
                padding: 12px 24px; border-radius: 6px; cursor: pointer; 
                font-size: 16px; margin-top: 20px; }
        button:hover { background: #5856eb; }
      </style>
    </head>
    <body>
      <div class="offline-msg">
        <h1>🔌 인터넷 연결 없음</h1>
        <p>현재 오프라인 상태입니다.<br>연결을 확인한 후 다시 시도해주세요.</p>
        <button onclick="window.location.reload()">다시 시도</button>
      </div>
    </body>
    </html>
  `;
}

/**
 * Stale While Revalidate - 즉시 응답, 백그라운드 업데이트
 */
async function staleWhileRevalidate(request, cacheName = DYNAMIC_CACHE) {
  const cache = await caches.open(cacheName);
  
  // 캐시된 응답 확인
  const cachedResponse = await cache.match(request);
  
  // 백그라운드에서 네트워크 요청
  const fetchPromise = fetchWithTimeout(request, 5000)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        // 캐시 업데이트
        await safeCachePut(cache, request, networkResponse.clone());
        
        // 클라이언트에게 업데이트 알림
        notifyClientsOfCacheUpdate(request.url);
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log(`[SW] Stale revalidate network error:`, error);
      return cachedResponse;
    });
  
  // 캐시된 응답이 있으면 즉시 반환, 없으면 네트워크 대기
  return cachedResponse || await fetchPromise;
}

/**
 * API 요청 처리
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // API별 캐시 설정 확인
  const config = API_CACHE_CONFIG[pathname] || {
    strategy: 'networkFirst',
    cacheName: API_CACHE,
  };
  
  const cache = await caches.open(config.cacheName);
  
  // POST 요청의 경우 특별 처리
  if (request.method === 'POST') {
    return await handlePostRequest(request, cache);
  }
  
  // 전략에 따른 처리
  switch (config.strategy) {
    case 'cacheFirst':
      return await cacheFirst(request, config.cacheName);
    case 'staleWhileRevalidate':
      return await staleWhileRevalidate(request, config.cacheName);
    default:
      return await networkFirst(request, config.cacheName);
  }
}

/**
 * POST 요청 처리 (백그라운드 동기화 포함)
 */
async function handlePostRequest(request, cache) {
  try {
    const response = await fetchWithTimeout(request, 10000);
    
    if (response.ok) {
      performanceMetrics.apiCacheHits++;
    }
    
    return response;
  } catch (error) {
    console.log(`[SW] POST request failed, queuing for background sync`);
    
    // 오프라인 상태에서 요청 큐에 저장
    await queueRequestForSync(request);
    
    // 백그라운드 동기화 등록
    await registerBackgroundSync('api-requests');
    
    // 임시 응답 반환
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: '요청이 대기열에 추가되었습니다. 온라인 상태가 되면 자동으로 처리됩니다.',
        queued: true 
      }),
      {
        status: 202,
        statusText: 'Accepted',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * 타임아웃이 있는 fetch
 */
async function fetchWithTimeout(request, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(request, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * 안전한 캐시 저장 (크기 체크 포함)
 */
async function safeCachePut(cache, request, response) {
  try {
    // 응답 크기 체크 (5MB 이상은 캐시하지 않음)
    const responseSize = response.headers.get('content-length');
    if (responseSize && parseInt(responseSize) > 5 * 1024 * 1024) {
      console.log(`[SW] Response too large to cache: ${responseSize} bytes`);
      return;
    }
    
    // 캐시에 저장
    await cache.put(request, response);
    
    // 캐시 크기 관리
    await manageCacheSizeForCache(cache);
  } catch (error) {
    console.error(`[SW] Cache put error:`, error);
  }
}

/**
 * 요청 실패 처리
 */
async function handleFetchError(request, error) {
  console.error(`[SW] Fetch error for ${request.url}:`, error);
  
  if (request.mode === 'navigate') {
    return await getOfflinePage();
  }
  
  if (request.url.includes('/api/')) {
    return await handleOfflineApiRequest(request);
  }
  
  return new Response(
    JSON.stringify({ error: 'Network error occurred', offline: true }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * 오프라인 API 요청 처리
 */
async function handleOfflineApiRequest(request) {
  // 캐시된 응답 찾기
  const caches = await self.caches.keys();
  
  for (const cacheName of caches) {
    if (cacheName.includes('api')) {
      const cache = await self.caches.open(cacheName);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        // 오프라인 헤더 추가
        const response = cachedResponse.clone();
        response.headers.set('X-Served-By', 'ServiceWorker-Offline');
        return response;
      }
    }
  }
  
  // 캐시된 데이터가 없으면 오프라인 응답
  return new Response(
    JSON.stringify({ 
      error: '오프라인 상태입니다', 
      message: '인터넷 연결을 확인해주세요',
      offline: true 
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }
  );
}

/**
 * 오프라인 요청 처리
 */
async function handleOfflineRequest(request) {
  if (request.mode === 'navigate') {
    return await getOfflinePage();
  }
  
  // 모든 캐시에서 검색
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  
  // 아무것도 찾을 수 없으면 기본 오프라인 응답
  return new Response('Offline - Content not available', {
    status: 503,
    statusText: 'Service Unavailable',
  });
}

/**
 * 캐시 관리 및 정리 함수들
 */

/**
 * 구버전 캐시 정리
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = new Set([
    STATIC_CACHE,
    DYNAMIC_CACHE,
    API_CACHE,
    IMAGE_CACHE,
    FONT_CACHE,
    RUNTIME_CACHE,
  ]);
  
  const deletionPromises = cacheNames
    .filter(cacheName => !currentCaches.has(cacheName))
    .map(cacheName => {
      console.log(`[SW] Deleting old cache: ${cacheName}`);
      return caches.delete(cacheName);
    });
  
  await Promise.all(deletionPromises);
  console.log(`[SW] Cleaned up ${deletionPromises.length} old caches`);
}

/**
 * 전체 캐시 크기 관리
 */
async function manageCacheSize() {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    await manageCacheSizeForCache(await caches.open(cacheName));
  }
}

/**
 * 개별 캐시 크기 관리
 */
async function manageCacheSizeForCache(cache) {
  const requests = await cache.keys();
  const cacheName = cache.constructor.name;
  
  // 캐시별 최대 항목 수 확인
  const maxEntries = CACHE_CONFIG.maxEntries[getCacheType(cacheName)] || 50;
  
  if (requests.length > maxEntries) {
    // 오래된 항목부터 삭제 (FIFO)
    const entriesToDelete = requests.slice(0, requests.length - maxEntries);
    
    for (const request of entriesToDelete) {
      await cache.delete(request);
    }
    
    console.log(`[SW] Cleaned ${entriesToDelete.length} entries from cache`);
  }
}

/**
 * 캐시 타입 결정
 */
function getCacheType(cacheName) {
  if (cacheName.includes('static')) return 'static';
  if (cacheName.includes('dynamic')) return 'dynamic';
  if (cacheName.includes('api')) return 'api';
  if (cacheName.includes('image')) return 'images';
  if (cacheName.includes('font')) return 'fonts';
  return 'runtime';
}

// 고급 백그라운드 동기화
self.addEventListener('sync', (event) => {
  console.log(`[SW] Background sync triggered: ${event.tag}`);
  performanceMetrics.backgroundSync++;
  
  switch (event.tag) {
    case 'analytics-sync':
      event.waitUntil(syncAnalytics());
      break;
    case 'form-sync':
      event.waitUntil(syncFormSubmissions());
      break;
    case 'api-requests':
      event.waitUntil(syncQueuedRequests());
      break;
    case 'performance-metrics':
      event.waitUntil(syncPerformanceMetrics());
      break;
    case 'cache-cleanup':
      event.waitUntil(performScheduledCacheCleanup());
      break;
    default:
      console.log(`[SW] Unknown sync tag: ${event.tag}`);
  }
});

/**
 * 분석 데이터 동기화
 */
async function syncAnalytics() {
  try {
    const analytics = await getStoredAnalytics();
    
    if (analytics.length === 0) {
      return;
    }
    
    console.log(`[SW] Syncing ${analytics.length} analytics events`);
    
    // 배치 처리로 성능 향상
    const batchSize = 10;
    for (let i = 0; i < analytics.length; i += batchSize) {
      const batch = analytics.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (data) => {
          const response = await fetchWithTimeout(
            new Request('/api/analytics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            }),
            5000
          );
          
          if (!response.ok) {
            throw new Error(`Analytics sync failed: ${response.status}`);
          }
          
          return response;
        })
      );
      
      // 배치 간 지연
      if (i + batchSize < analytics.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    await clearStoredAnalytics();
    console.log(`[SW] Analytics sync completed`);
    
    // 클라이언트에게 완료 알림
    notifyClientsOfSyncComplete('analytics');
  } catch (error) {
    console.error(`[SW] Analytics sync failed:`, error);
    throw error;
  }
}

/**
 * 폼 제출 동기화
 */
async function syncFormSubmissions() {
  try {
    const submissions = await getStoredFormSubmissions();
    
    if (submissions.length === 0) {
      return;
    }
    
    console.log(`[SW] Syncing ${submissions.length} form submissions`);
    
    for (const submission of submissions) {
      try {
        const response = await fetchWithTimeout(
          new Request(submission.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submission.data),
          }),
          10000
        );
        
        if (!response.ok) {
          throw new Error(`Form sync failed: ${response.status}`);
        }
        
        // 성공한 제출은 저장소에서 제거
        await removeFormSubmission(submission.id);
        
      } catch (error) {
        console.error(`[SW] Form submission sync failed:`, error);
        // 실패한 제출은 다음 동기화까지 유지
      }
    }
    
    console.log(`[SW] Form submissions sync completed`);
    notifyClientsOfSyncComplete('forms');
  } catch (error) {
    console.error(`[SW] Form submissions sync failed:`, error);
    throw error;
  }
}

/**
 * 대기열에 있는 요청 동기화
 */
async function syncQueuedRequests() {
  try {
    const queuedRequests = await getQueuedRequests();
    
    if (queuedRequests.length === 0) {
      return;
    }
    
    console.log(`[SW] Syncing ${queuedRequests.length} queued requests`);
    
    for (const queuedRequest of queuedRequests) {
      try {
        const request = new Request(queuedRequest.url, {
          method: queuedRequest.method,
          headers: queuedRequest.headers,
          body: queuedRequest.body,
        });
        
        const response = await fetchWithTimeout(request, 15000);
        
        if (response.ok) {
          // 성공한 요청은 큐에서 제거
          await removeQueuedRequest(queuedRequest.id);
          
          // 클라이언트에게 결과 전송
          notifyClientsOfRequestComplete(queuedRequest.id, response);
        }
      } catch (error) {
        console.error(`[SW] Queued request sync failed:`, error);
        // 실패한 요청은 재시도를 위해 큐에 유지
      }
    }
    
    console.log(`[SW] Queued requests sync completed`);
  } catch (error) {
    console.error(`[SW] Queued requests sync failed:`, error);
    throw error;
  }
}

// 고급 푸시 알림 처리
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('[SW] Push event received without data');
    return;
  }
  
  performanceMetrics.pushNotifications++;
  
  try {
    const data = event.data.json();
    console.log('[SW] Push notification received:', data);
    
    const options = {
      body: data.body || '새로운 알림이 있습니다',
      icon: data.icon || '/images/icon-192x192.png',
      badge: data.badge || '/images/icon-72x72.png',
      image: data.image,
      tag: data.tag || 'default',
      renotify: data.renotify || false,
      silent: data.silent || false,
      vibrate: data.vibrate || [100, 50, 100],
      timestamp: Date.now(),
      requireInteraction: data.requireInteraction || false,
      
      data: {
        url: data.url || '/',
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey,
        category: data.category || 'general',
        ...data.customData,
      },
      
      actions: [
        {
          action: 'open',
          title: data.openActionTitle || '확인하기',
          icon: '/images/icon-check.png',
        },
        {
          action: 'dismiss',
          title: data.dismissActionTitle || '닫기',
          icon: '/images/icon-close.png',
        },
      ],
    };
    
    // 카테고리별 커스터마이징
    if (data.category === 'fortune') {
      options.actions.unshift({
        action: 'fortune',
        title: '운세 보기',
        icon: '/images/icon-fortune.png',
      });
    } else if (data.category === 'test') {
      options.actions.unshift({
        action: 'test',
        title: '테스트 하기',
        icon: '/images/icon-test.png',
      });
    }
    
    event.waitUntil(
      Promise.all([
        // 알림 표시
        self.registration.showNotification(data.title || 'doha.kr', options),
        
        // 알림 기록 저장
        storeNotificationRecord(data),
        
        // 분석 데이터 기록
        storeAnalytics({
          type: 'push_notification_received',
          category: data.category,
          timestamp: Date.now(),
        }),
      ])
    );
  } catch (error) {
    console.error('[SW] Push notification handling error:', error);
    
    // 오류 발생 시 기본 알림
    event.waitUntil(
      self.registration.showNotification('doha.kr', {
        body: '새로운 알림이 있습니다',
        icon: '/images/icon-192x192.png',
        badge: '/images/icon-72x72.png',
        tag: 'error-fallback',
      })
    );
  }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  const notification = event.notification;
  const data = notification.data;
  
  notification.close();
  
  // 분석 데이터 기록
  storeAnalytics({
    type: 'notification_clicked',
    action: event.action || 'default',
    category: data?.category,
    timestamp: Date.now(),
  });
  
  let targetUrl = '/';
  
  // 액션별 처리
  switch (event.action) {
    case 'open':
      targetUrl = data?.url || '/';
      break;
    case 'fortune':
      targetUrl = '/fortune/';
      break;
    case 'test':
      targetUrl = '/tests/';
      break;
    case 'dismiss':
      // 단순히 알림만 닫기
      return;
    default:
      // 기본 클릭 (액션 버튼이 아닌 알림 본체 클릭)
      targetUrl = data?.url || '/';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientsList) => {
        // 이미 열린 탭이 있으면 해당 탭으로 이동
        for (const client of clientsList) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // 열린 탭이 없으면 새 탭 열기
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
      .catch((error) => {
        console.error('[SW] Notification click handling error:', error);
      })
  );
});

// 알림 닫기 처리
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
  
  storeAnalytics({
    type: 'notification_closed',
    tag: event.notification.tag,
    timestamp: Date.now(),
  });
});

// IndexedDB 고급 설정
const DB_NAME = 'doha-offline-db';
const DB_VERSION = 2; // 버전 업데이트
const ANALYTICS_STORE = 'analytics';
const FORM_STORE = 'form-submissions';
const REQUEST_QUEUE_STORE = 'request-queue';
const NOTIFICATION_STORE = 'notifications';
const PERFORMANCE_STORE = 'performance';
const CACHE_METADATA_STORE = 'cache-metadata';

/**
 * 고급 IndexedDB 초기화
 */
async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[SW] IndexedDB open error:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      console.log('[SW] IndexedDB opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log(`[SW] IndexedDB upgrade from version ${event.oldVersion} to ${event.newVersion}`);

      // Analytics 스토어 생성/업그레이드
      if (!db.objectStoreNames.contains(ANALYTICS_STORE)) {
        const analyticsStore = db.createObjectStore(ANALYTICS_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        analyticsStore.createIndex('type', 'type', { unique: false });
        analyticsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Form submissions 스토어 생성/업그레이드
      if (!db.objectStoreNames.contains(FORM_STORE)) {
        const formStore = db.createObjectStore(FORM_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        formStore.createIndex('timestamp', 'timestamp', { unique: false });
        formStore.createIndex('url', 'url', { unique: false });
      }
      
      // 요청 큐 스토어 생성 (v2에서 추가)
      if (!db.objectStoreNames.contains(REQUEST_QUEUE_STORE)) {
        const queueStore = db.createObjectStore(REQUEST_QUEUE_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        queueStore.createIndex('url', 'url', { unique: false });
        queueStore.createIndex('method', 'method', { unique: false });
      }
      
      // 알림 스토어 생성 (v2에서 추가)
      if (!db.objectStoreNames.contains(NOTIFICATION_STORE)) {
        const notificationStore = db.createObjectStore(NOTIFICATION_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        notificationStore.createIndex('timestamp', 'timestamp', { unique: false });
        notificationStore.createIndex('category', 'category', { unique: false });
      }
      
      // 성능 데이터 스토어 생성 (v2에서 추가)
      if (!db.objectStoreNames.contains(PERFORMANCE_STORE)) {
        const performanceStore = db.createObjectStore(PERFORMANCE_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        performanceStore.createIndex('timestamp', 'timestamp', { unique: false });
        performanceStore.createIndex('type', 'type', { unique: false });
      }
      
      // 캐시 메타데이터 스토어 생성 (v2에서 추가)
      if (!db.objectStoreNames.contains(CACHE_METADATA_STORE)) {
        const cacheMetaStore = db.createObjectStore(CACHE_METADATA_STORE, {
          keyPath: 'url',
        });
        cacheMetaStore.createIndex('timestamp', 'timestamp', { unique: false });
        cacheMetaStore.createIndex('size', 'size', { unique: false });
      }
    };
  });
}

/**
 * 고급 Analytics 데이터 저장
 */
async function storeAnalytics(data) {
  try {
    const db = await initDB();
    const tx = db.transaction([ANALYTICS_STORE], 'readwrite');
    const store = tx.objectStore(ANALYTICS_STORE);

    const record = {
      ...data,
      timestamp: Date.now(),
      iso_timestamp: new Date().toISOString(),
      sw_version: SW_VERSION,
      url: data.url || self.location.href,
      user_agent: navigator.userAgent,
    };

    await new Promise((resolve, reject) => {
      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // 저장소 크기 관리
    await cleanupAnalyticsStore(store);
    
  } catch (error) {
    console.error('[SW] Analytics storage error:', error);
  }
}

/**
 * Analytics 저장소 정리
 */
async function cleanupAnalyticsStore(store) {
  try {
    const count = await new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // 5000개 이상이면 오래된 것부터 삭제
    if (count > 5000) {
      const index = store.index('timestamp');
      const request = index.openCursor();
      let deleted = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && deleted < 1000) {
          cursor.delete();
          cursor.continue();
          deleted++;
        }
      };
    }
  } catch (error) {
    console.error('[SW] Analytics cleanup error:', error);
  }
}

/**
 * 저장된 Analytics 데이터 가져오기
 */
async function getStoredAnalytics() {
  try {
    const db = await initDB();
    const tx = db.transaction([ANALYTICS_STORE], 'readonly');
    const store = tx.objectStore(ANALYTICS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Analytics 데이터 읽기 실패:', error);
    return [];
  }
}

/**
 * Analytics 데이터 삭제
 */
async function clearStoredAnalytics() {
  try {
    const db = await initDB();
    const tx = db.transaction([ANALYTICS_STORE], 'readwrite');
    const store = tx.objectStore(ANALYTICS_STORE);

    return store.clear();
  } catch (error) {
    console.error('Analytics 데이터 삭제 실패:', error);
  }
}

/**
 * 고급 Form submission 데이터 저장
 */
async function storeFormSubmission(url, data, options = {}) {
  try {
    const db = await initDB();
    const tx = db.transaction([FORM_STORE], 'readwrite');
    const store = tx.objectStore(FORM_STORE);

    const record = {
      url,
      data,
      timestamp: Date.now(),
      iso_timestamp: new Date().toISOString(),
      retry_count: 0,
      max_retries: options.maxRetries || 3,
      priority: options.priority || 'normal',
      expires_at: Date.now() + (options.expiresIn || 7 * 24 * 60 * 60 * 1000), // 7일
    };

    await new Promise((resolve, reject) => {
      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    console.log('[SW] Form submission queued:', url);
    
  } catch (error) {
    console.error('[SW] Form submission storage error:', error);
  }
}

/**
 * Form submission 삭제
 */
async function removeFormSubmission(id) {
  try {
    const db = await initDB();
    const tx = db.transaction([FORM_STORE], 'readwrite');
    const store = tx.objectStore(FORM_STORE);

    await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
  } catch (error) {
    console.error('[SW] Form submission removal error:', error);
  }
}

/**
 * 저장된 Form submission 데이터 가져오기 (만료되지 않은 것만)
 */
async function getStoredFormSubmissions() {
  try {
    const db = await initDB();
    const tx = db.transaction([FORM_STORE], 'readonly');
    const store = tx.objectStore(FORM_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const now = Date.now();
        // 만료되지 않고 재시도 횟수를 초과하지 않은 것만 반환
        const validSubmissions = request.result.filter(submission => 
          submission.expires_at > now && 
          submission.retry_count < submission.max_retries
        );
        resolve(validSubmissions);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[SW] Form submission retrieval error:', error);
    return [];
  }
}

/**
 * 요청을 큐에 추가
 */
async function queueRequestForSync(request) {
  try {
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text(),
      timestamp: Date.now(),
      retry_count: 0,
      max_retries: 3,
    };
    
    const db = await initDB();
    const tx = db.transaction([REQUEST_QUEUE_STORE], 'readwrite');
    const store = tx.objectStore(REQUEST_QUEUE_STORE);

    await new Promise((resolve, reject) => {
      const request = store.add(requestData);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    console.log('[SW] Request queued for sync:', requestData.url);
    
  } catch (error) {
    console.error('[SW] Request queuing error:', error);
  }
}

/**
 * 큐에 있는 요청들 가져오기
 */
async function getQueuedRequests() {
  try {
    const db = await initDB();
    const tx = db.transaction([REQUEST_QUEUE_STORE], 'readonly');
    const store = tx.objectStore(REQUEST_QUEUE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[SW] Queued requests retrieval error:', error);
    return [];
  }
}

/**
 * 큐에서 요청 제거
 */
async function removeQueuedRequest(id) {
  try {
    const db = await initDB();
    const tx = db.transaction([REQUEST_QUEUE_STORE], 'readwrite');
    const store = tx.objectStore(REQUEST_QUEUE_STORE);

    await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
  } catch (error) {
    console.error('[SW] Queued request removal error:', error);
  }
}

/**
 * 알림 기록 저장
 */
async function storeNotificationRecord(data) {
  try {
    const db = await initDB();
    const tx = db.transaction([NOTIFICATION_STORE], 'readwrite');
    const store = tx.objectStore(NOTIFICATION_STORE);

    const record = {
      title: data.title,
      body: data.body,
      category: data.category || 'general',
      timestamp: Date.now(),
      delivered: true,
    };

    await new Promise((resolve, reject) => {
      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
  } catch (error) {
    console.error('[SW] Notification record storage error:', error);
  }
}

/**
 * 성능 메트릭 동기화
 */
async function syncPerformanceMetrics() {
  try {
    const db = await initDB();
    const tx = db.transaction([PERFORMANCE_STORE], 'readwrite');
    const store = tx.objectStore(PERFORMANCE_STORE);

    const record = {
      ...performanceMetrics,
      timestamp: Date.now(),
      uptime: Date.now() - performanceMetrics.startTime,
    };

    await new Promise((resolve, reject) => {
      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    console.log('[SW] Performance metrics synced');
    
  } catch (error) {
    console.error('[SW] Performance metrics sync error:', error);
  }
}

/**
 * 예약된 캐시 정리
 */
async function performScheduledCacheCleanup() {
  try {
    console.log('[SW] Performing scheduled cache cleanup');
    
    // 캐시 크기 관리
    await manageCacheSize();
    
    // 만료된 데이터 정리
    await cleanupExpiredData();
    
    console.log('[SW] Scheduled cache cleanup completed');
    
  } catch (error) {
    console.error('[SW] Scheduled cache cleanup error:', error);
  }
}

/**
 * 만료된 데이터 정리
 */
async function cleanupExpiredData() {
  try {
    const db = await initDB();
    const now = Date.now();
    
    // 만료된 form submissions 정리
    const formTx = db.transaction([FORM_STORE], 'readwrite');
    const formStore = formTx.objectStore(FORM_STORE);
    
    const formCursor = await new Promise((resolve, reject) => {
      const request = formStore.openCursor();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    let cursor = formCursor;
    while (cursor) {
      if (cursor.value.expires_at < now) {
        cursor.delete();
      }
      cursor = await new Promise((resolve) => {
        cursor.continue();
        cursor.onsuccess = () => resolve(cursor.result);
      });
    }
    
    console.log('[SW] Expired data cleanup completed');
    
  } catch (error) {
    console.error('[SW] Expired data cleanup error:', error);
  }
}

/**
 * 건강 상태 체크
 */
async function performHealthCheck() {
  try {
    console.log('[SW] Performing health check');
    
    const healthData = {
      timestamp: Date.now(),
      version: SW_VERSION,
      caches: await caches.keys(),
      metrics: performanceMetrics,
    };
    
    // 건강 상태 데이터 저장
    await storeAnalytics({
      type: 'health_check',
      data: healthData,
    });
    
    console.log('[SW] Health check completed');
    
  } catch (error) {
    console.error('[SW] Health check error:', error);
  }
}

/**
 * 캐시 상태 조회
 */
async function getCacheStatus() {
  try {
    const cacheNames = await caches.keys();
    const status = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      status[cacheName] = {
        entries: keys.length,
        type: getCacheType(cacheName),
      };
    }
    
    return status;
  } catch (error) {
    console.error('[SW] Cache status error:', error);
    return {};
  }
}

/**
 * 특정 캐시 삭제
 */
async function clearSpecificCache(cacheName) {
  try {
    const deleted = await caches.delete(cacheName);
    console.log(`[SW] Cache ${cacheName} deleted: ${deleted}`);
    return deleted;
  } catch (error) {
    console.error(`[SW] Cache deletion error:`, error);
    return false;
  }
}

/**
 * Form submission 데이터 삭제
 */
async function clearStoredFormSubmissions() {
  try {
    const db = await initDB();
    const tx = db.transaction([FORM_STORE], 'readwrite');
    const store = tx.objectStore(FORM_STORE);

    await new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    console.log('[SW] Form submissions cleared');
    
  } catch (error) {
    console.error('[SW] Form submission clear error:', error);
  }
}

// 클라이언트 메시지 처리
self.addEventListener('message', (event) => {
  const { data } = event;
  
  if (!data || !data.type) {
    return;
  }
  
  console.log(`[SW] Message received:`, data.type);
  
  switch (data.type) {
    case 'SKIP_WAITING':
      // 즉시 활성화
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      // 버전 정보 반환
      event.ports[0]?.postMessage({ version: SW_VERSION });
      break;
      
    case 'PERFORMANCE_REPORT':
      // 성능 리포트 처리
      handlePerformanceReport(data.metrics);
      break;
      
    case 'CACHE_STATUS':
      // 캐시 상태 반환
      getCacheStatus().then(status => {
        event.ports[0]?.postMessage({ cacheStatus: status });
      });
      break;
      
    case 'CLEAR_CACHE':
      // 캐시 삭제
      clearSpecificCache(data.cacheName).then(result => {
        event.ports[0]?.postMessage({ cleared: result });
      });
      break;
      
    case 'QUEUE_REQUEST':
      // 요청을 큐에 추가
      queueRequestForSync(data.request).then(() => {
        event.ports[0]?.postMessage({ queued: true });
      });
      break;
      
    case 'GET_METRICS':
      // 성능 메트릭 반환
      event.ports[0]?.postMessage({ metrics: performanceMetrics });
      break;
      
    default:
      console.log(`[SW] Unknown message type: ${data.type}`);
  }
});

/**
 * 성능 리포트 처리
 */
function handlePerformanceReport(metrics) {
  // 성능 메트릭 병합
  Object.assign(performanceMetrics, {
    clientMetrics: metrics,
    reportTime: Date.now(),
  });
  
  // 중요한 성능 문제 감지
  if (metrics.lcp > 2500) {
    console.warn(`[SW] Poor LCP detected: ${metrics.lcp}ms`);
  }
  
  if (metrics.fid > 100) {
    console.warn(`[SW] Poor FID detected: ${metrics.fid}ms`);
  }
  
  if (metrics.cls > 0.1) {
    console.warn(`[SW] Poor CLS detected: ${metrics.cls}`);
  }
  
  // 성능 데이터 저장
  storeAnalytics({
    type: 'performance_metrics',
    metrics: metrics,
    timestamp: Date.now(),
  });
}

// 에러 보고 및 모니터링
self.addEventListener('error', (event) => {
  console.error(`[SW] Error occurred:`, event.error);
  
  // 에러 분석 데이터 저장
  storeAnalytics({
    type: 'service_worker_error',
    error: {
      message: event.error?.message || 'Unknown error',
      stack: event.error?.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    },
    timestamp: Date.now(),
  });
  
  // 에러 메트릭 업데이트
  performanceMetrics.errors = (performanceMetrics.errors || 0) + 1;
});

self.addEventListener('unhandledrejection', (event) => {
  console.error(`[SW] Unhandled rejection:`, event.reason);
  
  // Promise rejection 분석 데이터 저장
  storeAnalytics({
    type: 'service_worker_unhandled_rejection',
    reason: event.reason?.toString() || 'Unknown rejection',
    timestamp: Date.now(),
  });
  
  // Promise rejection 메트릭 업데이트
  performanceMetrics.unhandledRejections = (performanceMetrics.unhandledRejections || 0) + 1;
  
  // 중요한 rejection은 처리
  event.preventDefault();
});

// 주기적 백그라운드 동기화 (Periodic Background Sync)
self.addEventListener('periodicsync', (event) => {
  console.log(`[SW] Periodic sync triggered: ${event.tag}`);
  
  switch (event.tag) {
    case 'cache-cleanup':
      event.waitUntil(performScheduledCacheCleanup());
      break;
    case 'metrics-sync':
      event.waitUntil(syncPerformanceMetrics());
      break;
    case 'health-check':
      event.waitUntil(performHealthCheck());
      break;
    default:
      console.log(`[SW] Unknown periodic sync tag: ${event.tag}`);
  }
});

/**
 * 추가 유틸리티 함수들
 */

/**
 * 성능 추적 초기화
 */
async function initializePerformanceTracking() {
  performanceMetrics.startTime = Date.now();
  performanceMetrics.version = SW_VERSION;
  
  // 주기적 백그라운드 동기화 등록 (지원되는 경우)
  if ('serviceWorker' in self && 'sync' in self.registration) {
    try {
      // 캐시 정리를 위한 주기적 동기화 등록
      await registerPeriodicBackgroundSync('cache-cleanup', 24 * 60 * 60 * 1000); // 24시간
      await registerPeriodicBackgroundSync('metrics-sync', 60 * 60 * 1000); // 1시간
    } catch (error) {
      console.log(`[SW] Periodic sync not supported:`, error);
    }
  }
}

/**
 * 성능 메트릭 리셋
 */
function resetPerformanceMetrics() {
  const startTime = performanceMetrics.startTime;
  const version = performanceMetrics.version;
  
  performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    offlineRequests: 0,
    apiCacheHits: 0,
    backgroundSync: 0,
    pushNotifications: 0,
    installPrompts: 0,
    errors: 0,
    unhandledRejections: 0,
    startTime,
    version,
  };
}

/**
 * 클라이언트 업데이트 알림
 */
async function notifyClientsOfUpdate() {
  const clients = await self.clients.matchAll();
  
  clients.forEach(client => {
    client.postMessage({
      type: 'SW_UPDATED',
      version: SW_VERSION,
      timestamp: Date.now(),
    });
  });
}

/**
 * 캐시 업데이트 알림
 */
function notifyClientsOfCacheUpdate(url) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'CACHE_UPDATED',
        url,
        timestamp: Date.now(),
      });
    });
  });
}

/**
 * 동기화 완료 알림
 */
function notifyClientsOfSyncComplete(type) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        syncType: type,
        timestamp: Date.now(),
      });
    });
  });
}

/**
 * 요청 완료 알림
 */
function notifyClientsOfRequestComplete(requestId, response) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'REQUEST_COMPLETE',
        requestId,
        success: response.ok,
        timestamp: Date.now(),
      });
    });
  });
}

/**
 * 백그라운드 동기화 등록
 */
async function registerBackgroundSync(tag) {
  try {
    await self.registration.sync.register(tag);
    console.log(`[SW] Background sync registered: ${tag}`);
  } catch (error) {
    console.error(`[SW] Background sync registration failed:`, error);
  }
}

/**
 * 주기적 백그라운드 동기화 등록
 */
async function registerPeriodicBackgroundSync(tag, minInterval) {
  try {
    if ('periodicSync' in self.registration) {
      await self.registration.periodicSync.register(tag, {
        minInterval,
      });
      console.log(`[SW] Periodic background sync registered: ${tag}`);
    }
  } catch (error) {
    console.error(`[SW] Periodic background sync registration failed:`, error);
  }
}

console.log(`[SW ${SW_VERSION}] Service Worker script loaded successfully`);
