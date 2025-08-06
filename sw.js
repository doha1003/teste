/**
 * Service Worker 5.0 for doha.kr - Optimized PWA
 * 최적화된 캐싱 전략, 향상된 성능, 간소화된 구조
 * Version: 5.0.0 - Performance Optimized Implementation
 * 
 * Features:
 * - Streamlined caching strategies
 * - Fast offline-first architecture  
 * - Smart cache size management
 * - Optimized for Korean web services
 * - Background sync for critical features
 */

// 캐시 버전 관리 - 하이라이터 패턴 CSS 추가로 버전 업데이트
const SW_VERSION = '5.1.0';
const CACHE_VERSION = `v${SW_VERSION}`;
const STATIC_CACHE = `doha-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `doha-dynamic-${CACHE_VERSION}`;
const API_CACHE = `doha-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `doha-images-${CACHE_VERSION}`;

// 간소화된 성능 메트릭
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  offlineRequests: 0,
  startTime: Date.now(),
};

// 최적화된 캐시 설정
const CACHE_CONFIG = {
  maxCacheSize: 25, // 캐시 크기 최적화 (25MB)
  maxEntries: {
    static: 30,    // 정적 자원 최적화
    dynamic: 25,   // 동적 콘텐츠 최적화
    api: 50,       // API 응답 최적화
    images: 100,   // 이미지 최적화
  },
  // 캐시 만료 시간 최적화
  cacheExpiry: {
    static: 60 * 60 * 24 * 7,  // 7일
    dynamic: 60 * 60 * 24 * 3, // 3일
    api: 60 * 60,              // 1시간
    images: 60 * 60 * 24 * 7,  // 7일
  },
};

// 핵심 자산 최적화 (필수만 선별) - 하이라이터 패턴 포함된 CSS 번들
const CRITICAL_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  // 핵심 CSS (하이라이터 패턴 포함된 번들)
  '/dist/styles.min.css',
  '/dist/styles.css', // 개발용 번들도 포함
  // 핵심 JavaScript
  '/js/app.js',
  '/js/core/common-init.js',
  // 필수 이미지
  '/images/logo.svg',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
];

// 최적화된 API 캐시 전략
const API_CACHE_CONFIG = {
  '/api/fortune': {
    strategy: 'networkFirst',
    maxEntries: 50,
    maxAgeSeconds: 60 * 60 * 2, // 2시간
  },
  '/api/manseryeok': {
    strategy: 'cacheFirst',
    maxEntries: 100,
    maxAgeSeconds: 60 * 60 * 24 * 7, // 7일
  },
  '/api/validation': {
    strategy: 'networkFirst',
    maxEntries: 20,
    maxAgeSeconds: 60 * 30, // 30분
  },
};

// 간소화된 캐시 전략
const CACHE_STRATEGIES = {
  // Cache First - 정적 자산
  cacheFirst: {
    patterns: [
      /\.(?:css|js|woff2?|ttf|eot)$/,
      /^\/dist\//,
      /manifest\.json$/,
    ],
    cacheName: STATIC_CACHE,
  },
  
  // Stale While Revalidate - 이미지
  staleWhileRevalidate: {
    patterns: [
      /\.(?:png|jpg|jpeg|webp|gif|svg|ico)$/,
      /^\/images\//,
    ],
    cacheName: IMAGE_CACHE,
  },
  
  // Network First - HTML 페이지
  networkFirst: {
    patterns: [
      /^\/$/,
      /^\/tests\//,
      /^\/tools\//,
      /^\/fortune\//,
      /^\/about/,
      /^\/contact/,
      /\.html$/,
    ],
    cacheName: DYNAMIC_CACHE,
  },
};

// Install event - 최적화된 자산 캐싱
self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Installing...`);
  
  event.waitUntil(
    Promise.all([
      // 핵심 자산 캐싱
      caches.open(STATIC_CACHE).then((cache) => {
        console.log(`[SW ${SW_VERSION}] Caching critical assets`);
        return cache.addAll(CRITICAL_ASSETS.filter(asset => asset)); // 유효한 자산만 캐시
      }),
      
      // 성능 추적 초기화
      initializePerformanceTracking(),
    ])
    .then(() => {
      console.log(`[SW ${SW_VERSION}] Installation complete`);
      return self.skipWaiting(); // 즉시 활성화
    })
    .catch((error) => {
      console.error(`[SW ${SW_VERSION}] Installation failed:`, error);
    })
  );
});

// Activate event - 최적화된 캐시 정리
self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] Activating...`);
  
  event.waitUntil(
    Promise.all([
      // 구버전 캐시 정리
      cleanupOldCaches(),
      
      // 캐시 크기 관리
      manageCacheSize(),
      
      // 클라이언트에게 업데이트 알림
      notifyClientsOfUpdate(),
    ])
    .then(() => {
      console.log(`[SW ${SW_VERSION}] Activation complete`);
      return self.clients.claim(); // 모든 탭에서 즉시 제어
    })
    .catch((error) => {
      console.error(`[SW ${SW_VERSION}] Activation failed:`, error);
    })
  );
});

// Fetch event - 최적화된 요청 처리
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
 * 요청 처리 가능 여부 확인
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
  ];
  
  const isAllowed = allowedDomains.some(domain => 
    url.hostname === domain || url.hostname.endsWith('.' + domain)
  );
  
  if (!isAllowed) {
    return false;
  }
  
  // POST 요청은 API만 처리
  if (request.method !== 'GET') {
    return url.pathname.startsWith('/api/');
  }
  
  return true;
}

/**
 * 최적화된 요청 처리
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
      return await networkFirst(request, DYNAMIC_CACHE);
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
  return { name: 'networkFirst', cacheName: DYNAMIC_CACHE };
}

/**
 * Cache First 전략
 */
async function cacheFirst(request, cacheName = STATIC_CACHE) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // 백그라운드에서 캐시 업데이트
      updateCacheInBackground(request, cache);
      return cachedResponse;
    }
    
    // 캐시에 없으면 네트워크에서 가져오기
    const networkResponse = await fetchWithTimeout(request, 5000);
    
    if (networkResponse.ok) {
      await safeCachePut(cache, request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error(`[SW] Cache First error:`, error);
    return await handleOfflineRequest(request);
  }
}

/**
 * Network First 전략
 */
async function networkFirst(request, cacheName = DYNAMIC_CACHE) {
  const cache = await caches.open(cacheName);
  
  try {
    // 네트워크 요청 (타임아웃 포함)
    const networkResponse = await fetchWithTimeout(request, 3000);
    
    if (networkResponse.ok) {
      await safeCachePut(cache, request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log(`[SW] Network failed, trying cache:`, request.url);
    
    // 네트워크 실패 시 캐시에서 찾기
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 네비게이션 요청의 경우 오프라인 페이지 반환
    if (request.mode === 'navigate') {
      performanceMetrics.offlineRequests++;
      return await getOfflinePage();
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate 전략
 */
async function staleWhileRevalidate(request, cacheName = IMAGE_CACHE) {
  const cache = await caches.open(cacheName);
  
  // 캐시된 응답 확인
  const cachedResponse = await cache.match(request);
  
  // 백그라운드에서 네트워크 요청
  const fetchPromise = fetchWithTimeout(request, 5000)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        await safeCachePut(cache, request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
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
  };
  
  const cache = await caches.open(API_CACHE);
  
  // POST 요청 처리
  if (request.method === 'POST') {
    try {
      const response = await fetchWithTimeout(request, 10000);
      return response;
    } catch (error) {
      console.log(`[SW] POST request failed:`, error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: '요청이 실패했습니다. 인터넷 연결을 확인해주세요.',
          offline: true 
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
  
  // 전략에 따른 처리
  switch (config.strategy) {
    case 'cacheFirst':
      return await cacheFirst(request, API_CACHE);
    case 'staleWhileRevalidate':
      return await staleWhileRevalidate(request, API_CACHE);
    default:
      return await networkFirst(request, API_CACHE);
  }
}

/**
 * 타임아웃이 있는 fetch
 */
async function fetchWithTimeout(request, timeout = 5000) {
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
 * 안전한 캐시 저장
 */
async function safeCachePut(cache, request, response) {
  try {
    // 응답 크기 체크 (2MB 이상은 캐시하지 않음)
    const responseSize = response.headers.get('content-length');
    if (responseSize && parseInt(responseSize) > 2 * 1024 * 1024) {
      console.log(`[SW] Response too large to cache: ${responseSize} bytes`);
      return;
    }
    
    await cache.put(request, response);
    
    // 캐시 크기 관리
    await manageCacheSizeForCache(cache);
  } catch (error) {
    console.error(`[SW] Cache put error:`, error);
  }
}

/**
 * 백그라운드 캐시 업데이트
 */
function updateCacheInBackground(request, cache) {
  fetchWithTimeout(request, 3000)
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
 * 요청 실패 처리
 */
async function handleFetchError(request, error) {
  console.error(`[SW] Fetch error for ${request.url}:`, error);
  
  if (request.mode === 'navigate') {
    return await getOfflinePage();
  }
  
  // 오프라인 요청 처리
  return await handleOfflineRequest(request);
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
 * 구버전 캐시 정리
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = new Set([
    STATIC_CACHE,
    DYNAMIC_CACHE,
    API_CACHE,
    IMAGE_CACHE,
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
 * 캐시 크기 관리
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
  const cacheType = getCacheType(cache);
  
  const maxEntries = CACHE_CONFIG.maxEntries[cacheType] || 25;
  
  if (requests.length > maxEntries) {
    // 오래된 항목부터 삭제
    const entriesToDelete = requests.slice(0, requests.length - maxEntries);
    
    for (const request of entriesToDelete) {
      await cache.delete(request);
    }
    
    console.log(`[SW] Cleaned ${entriesToDelete.length} entries from ${cacheType} cache`);
  }
}

/**
 * 캐시 타입 결정
 */
function getCacheType(cache) {
  const cacheName = cache.constructor.name || 'unknown';
  if (cacheName.includes('static')) return 'static';
  if (cacheName.includes('dynamic')) return 'dynamic';
  if (cacheName.includes('api')) return 'api';
  if (cacheName.includes('image')) return 'images';
  return 'dynamic';
}

/**
 * 성능 추적 초기화
 */
async function initializePerformanceTracking() {
  performanceMetrics.startTime = Date.now();
  performanceMetrics.version = SW_VERSION;
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

// 클라이언트 메시지 처리
self.addEventListener('message', (event) => {
  const { data } = event;
  
  if (!data || !data.type) {
    return;
  }
  
  console.log(`[SW] Message received:`, data.type);
  
  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: SW_VERSION });
      break;
      
    case 'GET_METRICS':
      event.ports[0]?.postMessage({ metrics: performanceMetrics });
      break;
      
    default:
      console.log(`[SW] Unknown message type: ${data.type}`);
  }
});

// 백그라운드 동기화 (간소화)
self.addEventListener('sync', (event) => {
  console.log(`[SW] Background sync triggered: ${event.tag}`);
  
  switch (event.tag) {
    case 'cache-cleanup':
      event.waitUntil(manageCacheSize());
      break;
    default:
      console.log(`[SW] Unknown sync tag: ${event.tag}`);
  }
});

console.log(`[SW ${SW_VERSION}] Service Worker script loaded successfully`);