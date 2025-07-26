/**
 * Service Worker for doha.kr - Performance Optimized
 * 향상된 캐싱, 오프라인 지원, 성능 최적화
 * Version: 3.0.0 - Phase 2 Performance Upgrade
 */

const CACHE_NAME = 'doha-kr-v3.0.0';
const STATIC_CACHE = 'doha-static-v3.0.0';
const DYNAMIC_CACHE = 'doha-dynamic-v3.0.0';
const API_CACHE = 'doha-api-v3.0.0';

// 성능 메트릭
let performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    offlineRequests: 0,
    apiCacheHits: 0
};

// 성능 최적화된 정적 자산 목록
const STATIC_ASSETS = [
    '/',
    '/css/styles-cleaned.css',
    '/css/mobile-fixes.css', 
    '/css/button-system-cleaned.css',
    '/js/main.js',
    '/js/dom-security.js',
    '/js/api-config.js',
    '/js/manseryeok-api-client.js',
    '/js/image-optimizer.js',
    '/js/bundle-optimizer.js',
    '/images/logo.svg',
    '/manifest.json',
    '/offline.html',
    // 필수 페이지만 사전 캐시
    '/tests/',
    '/tools/',
    '/fortune/'
];

// 만세력 API 캐시 전략
const MANSERYEOK_API_CONFIG = {
    maxEntries: 1000,
    maxAgeSeconds: 60 * 60 * 24 * 7, // 1주일
    cacheName: 'manseryeok-api-cache'
};

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
    // Cache first for static assets
    static: [
        /\.(?:css|js|woff2?|svg|png|jpg|jpeg|webp)$/,
        /^\/css\//,
        /^\/js\//,
        /^\/images\//,
        /^\/fonts\//
    ],
    
    // Network first for HTML pages
    pages: [
        /^\/$/,
        /^\/tests\//,
        /^\/tools\//,
        /^\/about/,
        /^\/contact/,
        /^\/privacy/,
        /^\/terms/
    ],
    
    // Stale while revalidate for API calls
    api: [
        /^\/api\//
    ]
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
    // Service Worker: Installing...
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                // Service Worker: Caching static assets
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                // Service Worker: Installation complete
                return self.skipWaiting();
            })
            .catch((error) => {
                // Service Worker: Installation failed
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    // Service Worker: Activating...
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE &&
                            cacheName !== CACHE_NAME) {
                            // Service Worker: Deleting old cache
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                // Service Worker: Activation complete
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-HTTP requests
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Skip external domains (except Google Fonts)
    if (url.origin !== location.origin && 
        !url.hostname.includes('fonts.googleapis.com') &&
        !url.hostname.includes('fonts.gstatic.com')) {
        return;
    }
    
    event.respondWith(handleRequest(request));
});

/**
 * Main request handler with different caching strategies
 */
async function handleRequest(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    try {
        // Determine cache strategy based on request type
        if (isStaticAsset(pathname)) {
            return await cacheFirst(request);
        } else if (isPageRequest(request)) {
            return await networkFirst(request);
        } else if (isApiRequest(pathname)) {
            return await staleWhileRevalidate(request);
        } else {
            return await networkFirst(request);
        }
    } catch (error) {
        // Service Worker: Request failed
        return await handleFailure(request);
    }
}

/**
 * Cache First Strategy - for static assets
 */
async function cacheFirst(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Optionally update cache in background
        fetch(request).then(response => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
        }).catch(() => {
            // Ignore network errors for background updates
        });
        
        return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

/**
 * Network First Strategy - for HTML pages
 */
async function networkFirst(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Only cache successful responses
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return await caches.match('/offline.html') || 
                   new Response('Offline - Please check your connection', {
                       status: 503,
                       statusText: 'Service Unavailable'
                   });
        }
        
        throw error;
    }
}

/**
 * Stale While Revalidate Strategy - for API calls
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        // Return cached version if network fails
        return cachedResponse;
    });
    
    // Return cached version immediately if available, otherwise wait for network
    return cachedResponse || await fetchPromise;
}

/**
 * Handle request failures
 */
async function handleFailure(request) {
    if (request.mode === 'navigate') {
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }
    }
    
    // Return a basic error response
    return new Response('Network error occurred', {
        status: 408,
        statusText: 'Network Error'
    });
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(pathname) {
    return CACHE_STRATEGIES.static.some(pattern => pattern.test(pathname));
}

/**
 * Check if request is for a page
 */
function isPageRequest(request) {
    return request.mode === 'navigate' || 
           request.headers.get('accept')?.includes('text/html');
}

/**
 * Check if request is for an API endpoint
 */
function isApiRequest(pathname) {
    return CACHE_STRATEGIES.api.some(pattern => pattern.test(pathname));
}

// Background sync for analytics and form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'analytics-sync') {
        event.waitUntil(syncAnalytics());
    } else if (event.tag === 'form-sync') {
        event.waitUntil(syncFormSubmissions());
    }
});

/**
 * Sync analytics data when connection is restored
 */
async function syncAnalytics() {
    try {
        const analytics = await getStoredAnalytics();
        
        for (const data of analytics) {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
        
        await clearStoredAnalytics();
        // Service Worker: Analytics synced
    } catch (error) {
        // Service Worker: Analytics sync failed
    }
}

/**
 * Sync form submissions when connection is restored
 */
async function syncFormSubmissions() {
    try {
        const submissions = await getStoredFormSubmissions();
        
        for (const submission of submissions) {
            await fetch(submission.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submission.data)
            });
        }
        
        await clearStoredFormSubmissions();
        // Service Worker: Form submissions synced
    } catch (error) {
        // Service Worker: Form submission sync failed
    }
}

// Push notification handling
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/images/icon-192x192.png',
        badge: '/images/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: data.primaryKey
        },
        actions: [
            {
                action: 'explore',
                title: '확인하기',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: '닫기',
                icon: '/images/xmark.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.matchAll().then((clientsList) => {
                if (clientsList.length > 0) {
                    return clientsList[0].focus();
                }
                return clients.openWindow('/');
            })
        );
    }
});

// Utility functions for IndexedDB operations
async function getStoredAnalytics() {
    // Implementation would use IndexedDB to retrieve stored analytics
    return [];
}

async function clearStoredAnalytics() {
    // Implementation would clear analytics from IndexedDB
}

async function getStoredFormSubmissions() {
    // Implementation would use IndexedDB to retrieve stored form submissions
    return [];
}

async function clearStoredFormSubmissions() {
    // Implementation would clear form submissions from IndexedDB
}

// Performance monitoring
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PERFORMANCE_REPORT') {
        // Handle performance reports from main thread
        // Performance Report received
    }
});

// Error reporting
self.addEventListener('error', (event) => {
    // Service Worker Error occurred
});

self.addEventListener('unhandledrejection', (event) => {
    // Service Worker Unhandled Rejection occurred
});

// Service Worker: Script loaded successfully