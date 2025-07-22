// Unified AdSense Initialization Script
(function() {
    'use strict';
    
    // Global state to track AdSense initialization
    window.__adsenseState = {
        scriptLoaded: false,
        initialized: false,
        initializationAttempts: 0,
        maxAttempts: 10
    };
    
    // Load AdSense script
    function loadAdSenseScript() {
        if (window.__adsenseState.scriptLoaded) return;
        window.__adsenseState.scriptLoaded = true;
        
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7905640648499222';
        script.crossOrigin = 'anonymous';
        script.defer = true;
        script.async = true;
        
        script.onload = function() {
            console.log('AdSense script loaded');
            setTimeout(initializeAds, 100);
        };
        
        script.onerror = function() {
            console.error('Failed to load AdSense script');
            window.__adsenseState.scriptLoaded = false;
        };
        
        document.head.appendChild(script);
    }
    
    // Initialize ads
    function initializeAds() {
        if (window.__adsenseState.initialized) {
            console.log('AdSense already initialized');
            return;
        }
        
        if (typeof window.adsbygoogle === 'undefined') {
            window.__adsenseState.initializationAttempts++;
            if (window.__adsenseState.initializationAttempts < window.__adsenseState.maxAttempts) {
                setTimeout(initializeAds, 500);
            } else {
                console.error('AdSense failed to load after maximum attempts');
            }
            return;
        }
        
        window.__adsenseState.initialized = true;
        
        // Find all ad slots
        const ads = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status="done"])');
        console.log('Found ' + ads.length + ' ad slots to initialize');
        
        ads.forEach((ad, index) => {
            try {
                // Push the ad
                (adsbygoogle = window.adsbygoogle || []).push({});
                ad.setAttribute('data-adsbygoogle-status', 'done');
                console.log('Initialized ad slot ' + (index + 1));
            } catch (e) {
                console.warn('Failed to initialize ad slot ' + (index + 1), e.message);
            }
        });
    }
    
    // Handle dynamic ad loading (for ads loaded via IntersectionObserver)
    window.initializeDynamicAd = function(adElement) {
        if (!adElement || adElement.getAttribute('data-adsbygoogle-status') === 'done') {
            return;
        }
        
        if (typeof window.adsbygoogle === 'undefined') {
            console.warn('AdSense not loaded yet, queuing ad initialization');
            setTimeout(function() {
                window.initializeDynamicAd(adElement);
            }, 500);
            return;
        }
        
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
            adElement.setAttribute('data-adsbygoogle-status', 'done');
            console.log('Initialized dynamic ad');
        } catch (e) {
            console.warn('Failed to initialize dynamic ad', e.message);
        }
    };
    
    // Error handling to prevent duplicate initialization errors
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('adsbygoogle.push() error')) {
            e.preventDefault();
            e.stopPropagation();
            console.warn('Prevented duplicate AdSense initialization error');
            return false;
        }
    }, true);
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(loadAdSenseScript, 1000);
        });
    } else {
        setTimeout(loadAdSenseScript, 1000);
    }
    
    // Re-initialize ads when new content is loaded
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('adsbygoogle')) {
                        if (window.__adsenseState.initialized) {
                            window.initializeDynamicAd(node);
                        }
                    }
                });
            }
        });
    });
    
    // Start observing when DOM is ready
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }
})();