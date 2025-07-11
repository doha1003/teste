/**
 * Service Worker for doha.kr
 * Provides offline functionality, caching, and performance optimization
 * Version: 2.0.0
 */

const CACHE_NAME = 'doha-kr-v2.0.0';
const STATIC_CACHE = 'doha-static-v2.0.0';
const DYNAMIC_CACHE = 'doha-dynamic-v2.0.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/css/main.min.css',
    '/css/critical.css',
    '/js/app.min.js',
    '/images/logo.svg',
    '/images/placeholder-favicon.svg',
    '/manifest.json',
    '/offline.html',
    // Critical pages
    '/tests/',
    '/tools/',
    '/about/',
    '/contact/'
];

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
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE &&
                            cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activation complete');
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
        console.error('Service Worker: Request failed', error);
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
        console.log('Service Worker: Analytics synced');
    } catch (error) {
        console.error('Service Worker: Analytics sync failed', error);
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
        console.log('Service Worker: Form submissions synced');
    } catch (error) {
        console.error('Service Worker: Form submission sync failed', error);
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
        console.log('Performance Report:', event.data.payload);
    }
});

// Error reporting
self.addEventListener('error', (event) => {
    console.error('Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker Unhandled Rejection:', event.reason);
});

console.log('Service Worker: Script loaded successfully');