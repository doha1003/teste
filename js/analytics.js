// =============================================
// ANALYTICS AND BOT DETECTION SYSTEM
// =============================================
// Created: 2025-01-11
// Purpose: Traffic monitoring, bot detection, and user analytics for doha.kr

(function() {
    'use strict';
    
    // Analytics configuration
    const Analytics = {
        config: {
            enableBotDetection: true,
            enableUserTracking: true,
            enablePerformanceTracking: true,
            enableErrorTracking: true,
            maxEventsPerSession: 100,
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            apiEndpoint: '/api/analytics' // For custom analytics if needed
        },
        
        sessionId: null,
        userId: null,
        events: [],
        botDetected: false,
        lastActivity: Date.now(),
        
        // Initialize analytics
        init: function() {
            this.sessionId = this.generateSessionId();
            this.userId = this.getUserId();
            this.detectBot();
            this.setupEventListeners();
            this.startSessionTracking();
            
            console.log('Analytics system initialized', {
                sessionId: this.sessionId,
                botDetected: this.botDetected
            });
        },
        
        // Generate unique session ID
        generateSessionId: function() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },
        
        // Get or create user ID
        getUserId: function() {
            let userId = localStorage.getItem('userId');
            if (!userId) {
                userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
                localStorage.setItem('userId', userId);
            }
            return userId;
        },
        
        // Bot detection system
        detectBot: function() {
            if (!this.config.enableBotDetection) return;
            
            const indicators = {
                userAgent: this.checkUserAgentForBot(),
                webdriver: this.checkWebDriver(),
                plugins: this.checkPlugins(),
                languages: this.checkLanguages(),
                screen: this.checkScreenProperties(),
                mouse: this.checkMouseBehavior(),
                timing: this.checkTimingBehavior()
            };
            
            // Calculate bot score (0-100)
            let botScore = 0;
            let totalChecks = 0;
            
            Object.keys(indicators).forEach(key => {
                if (indicators[key] !== null) {
                    totalChecks++;
                    botScore += indicators[key] ? 15 : 0;
                }
            });
            
            // Additional suspicious behavior checks
            botScore += this.checkSuspiciousBehavior();
            
            this.botDetected = botScore > 30; // Threshold for bot detection
            
            this.trackEvent('bot_detection', {
                score: botScore,
                detected: this.botDetected,
                indicators: indicators
            });
            
            return this.botDetected;
        },
        
        // Check user agent for bot patterns
        checkUserAgentForBot: function() {
            const userAgent = navigator.userAgent.toLowerCase();
            const botPatterns = [
                /bot/i, /crawl/i, /spider/i, /scraper/i,
                /facebookexternalhit/i, /whatsapp/i, /telegram/i,
                /linkedinbot/i, /twitterbot/i, /googlebot/i,
                /bingbot/i, /yandexbot/i, /baiduspider/i,
                /phantom/i, /selenium/i, /headless/i,
                /automated/i, /testing/i
            ];
            
            return botPatterns.some(pattern => pattern.test(userAgent));
        },
        
        // Check for webdriver presence
        checkWebDriver: function() {
            return !!(window.navigator.webdriver ||
                     window.callPhantom ||
                     window._phantom ||
                     window.phantom ||
                     window.Buffer ||
                     window.emit ||
                     window.spawn);
        },
        
        // Check browser plugins
        checkPlugins: function() {
            if (!navigator.plugins) return true;
            
            // Real browsers usually have some plugins
            if (navigator.plugins.length === 0) return true;
            
            // Check for typical bot plugin patterns
            const pluginNames = Array.from(navigator.plugins).map(p => p.name.toLowerCase());
            const suspiciousPlugins = ['headless', 'phantom', 'selenium'];
            
            return suspiciousPlugins.some(name => 
                pluginNames.some(plugin => plugin.includes(name))
            );
        },
        
        // Check languages
        checkLanguages: function() {
            if (!navigator.languages || navigator.languages.length === 0) return true;
            
            // Check for inconsistent language settings
            const browserLang = navigator.language;
            const acceptedLangs = navigator.languages;
            
            return !acceptedLangs.includes(browserLang);
        },
        
        // Check screen properties
        checkScreenProperties: function() {
            // Common headless browser screen sizes
            const suspiciousSizes = [
                '1024x768', '800x600', '1280x1024',
                '1366x768', '1920x1080'
            ];
            
            const currentSize = `${screen.width}x${screen.height}`;
            
            // Check for exactly matching common bot sizes
            if (suspiciousSizes.includes(currentSize)) {
                return true;
            }
            
            // Check for impossible screen configurations
            if (screen.width === 0 || screen.height === 0) return true;
            if (screen.colorDepth === 0) return true;
            
            return false;
        },
        
        // Track mouse behavior for bot detection
        checkMouseBehavior: function() {
            let mouseEvents = 0;
            let perfectLines = 0;
            let lastX = 0, lastY = 0;
            
            const mouseTracker = function(e) {
                mouseEvents++;
                
                // Check for perfect straight line movements (bot behavior)
                if (mouseEvents > 1) {
                    const deltaX = Math.abs(e.clientX - lastX);
                    const deltaY = Math.abs(e.clientY - lastY);
                    
                    if ((deltaX === 0 && deltaY > 10) || (deltaY === 0 && deltaX > 10)) {
                        perfectLines++;
                    }
                }
                
                lastX = e.clientX;
                lastY = e.clientY;
                
                // Remove listener after 50 events
                if (mouseEvents >= 50) {
                    document.removeEventListener('mousemove', mouseTracker);
                }
            };
            
            document.addEventListener('mousemove', mouseTracker);
            
            // Return bot score after 5 seconds
            setTimeout(() => {
                const botScore = mouseEvents === 0 ? 1 : (perfectLines / mouseEvents > 0.8 ? 1 : 0);
                Analytics.updateBotScore('mouse', botScore);
            }, 5000);
            
            return null; // Will be updated asynchronously
        },
        
        // Check timing behavior
        checkTimingBehavior: function() {
            const startTime = performance.now();
            let interactions = 0;
            
            const interactionTypes = ['click', 'scroll', 'keydown', 'touchstart'];
            
            const interactionHandler = function() {
                interactions++;
            };
            
            interactionTypes.forEach(type => {
                document.addEventListener(type, interactionHandler);
            });
            
            // Check after 10 seconds
            setTimeout(() => {
                const elapsed = performance.now() - startTime;
                const interactionsPerSecond = interactions / (elapsed / 1000);
                
                // Too many interactions per second suggests bot
                const isBotLike = interactionsPerSecond > 10 || 
                                 (elapsed > 5000 && interactions === 0);
                
                Analytics.updateBotScore('timing', isBotLike ? 1 : 0);
                
                // Cleanup
                interactionTypes.forEach(type => {
                    document.removeEventListener(type, interactionHandler);
                });
            }, 10000);
            
            return null; // Will be updated asynchronously
        },
        
        // Check for suspicious behavior patterns
        checkSuspiciousBehavior: function() {
            let score = 0;
            
            // Check for missing touch support on mobile-like user agents
            if (/mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
                if (!('ontouchstart' in window)) score += 20;
            }
            
            // Check for disabled images
            if (typeof Image !== 'undefined') {
                const img = new Image();
                img.style.display = 'none';
                document.body.appendChild(img);
                
                setTimeout(() => {
                    if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
                        score += 15;
                    }
                    document.body.removeChild(img);
                }, 1000);
            }
            
            // Check for automated keyboard events
            let keyEvents = 0;
            const keyHandler = function(e) {
                keyEvents++;
                // Rapid keyboard events might indicate automation
                if (keyEvents > 100) {
                    score += 10;
                    document.removeEventListener('keydown', keyHandler);
                }
            };
            
            document.addEventListener('keydown', keyHandler);
            
            return score;
        },
        
        // Update bot score asynchronously
        updateBotScore: function(category, score) {
            this.trackEvent('bot_score_update', {
                category: category,
                score: score
            });
        },
        
        // Setup event listeners for tracking
        setupEventListeners: function() {
            const self = this;
            
            // Track page views
            this.trackPageView();
            
            // Track user interactions
            if (this.config.enableUserTracking && !this.botDetected) {
                this.setupUserInteractionTracking();
            }
            
            // Track performance metrics
            if (this.config.enablePerformanceTracking) {
                this.setupPerformanceTracking();
            }
            
            // Track errors
            if (this.config.enableErrorTracking) {
                this.setupErrorTracking();
            }
            
            // Track visibility changes
            document.addEventListener('visibilitychange', function() {
                self.trackEvent('visibility_change', {
                    hidden: document.hidden,
                    timestamp: Date.now()
                });
            });
            
            // Track beforeunload
            window.addEventListener('beforeunload', function() {
                self.sendSessionData();
            });
        },
        
        // Track page views
        trackPageView: function() {
            const pageData = {
                url: window.location.href,
                title: document.title,
                referrer: document.referrer,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                screenResolution: `${screen.width}x${screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
                colorDepth: screen.colorDepth,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language
            };
            
            this.trackEvent('page_view', pageData);
        },
        
        // Setup user interaction tracking
        setupUserInteractionTracking: function() {
            const self = this;
            
            // Track clicks
            document.addEventListener('click', function(e) {
                self.trackInteraction('click', e);
            });
            
            // Track form submissions
            document.addEventListener('submit', function(e) {
                self.trackInteraction('form_submit', e);
            });
            
            // Track scroll behavior
            let scrollTimeout;
            window.addEventListener('scroll', function() {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    self.trackEvent('scroll', {
                        scrollY: window.scrollY,
                        scrollPercent: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
                    });
                }, 250);
            });
            
            // Track time spent on page
            this.startTimeTracking();
        },
        
        // Track user interactions
        trackInteraction: function(type, event) {
            if (this.botDetected) return;
            
            const target = event.target;
            const data = {
                type: type,
                tagName: target.tagName,
                id: target.id,
                className: target.className,
                text: target.textContent ? target.textContent.substring(0, 100) : '',
                x: event.clientX,
                y: event.clientY,
                timestamp: Date.now()
            };
            
            // Add specific data for forms
            if (type === 'form_submit') {
                data.formAction = target.action;
                data.formMethod = target.method;
                data.formElements = target.elements.length;
            }
            
            this.trackEvent(type, data);
        },
        
        // Setup performance tracking
        setupPerformanceTracking: function() {
            const self = this;
            
            // Track page load performance
            window.addEventListener('load', function() {
                setTimeout(() => {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    const paint = performance.getEntriesByType('paint');
                    
                    const performanceData = {
                        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                        transferSize: navigation.transferSize,
                        domElements: document.getElementsByTagName('*').length
                    };
                    
                    self.trackEvent('performance', performanceData);
                }, 0);
            });
            
            // Track resource loading errors
            window.addEventListener('error', function(e) {
                if (e.target !== window) {
                    self.trackEvent('resource_error', {
                        type: e.target.tagName,
                        src: e.target.src || e.target.href,
                        message: e.message
                    });
                }
            }, true);
        },
        
        // Setup error tracking
        setupErrorTracking: function() {
            const self = this;
            
            // This will work with the global error handler
            if (typeof ErrorHandler !== 'undefined') {
                const originalHandleError = ErrorHandler.handleError;
                ErrorHandler.handleError = function(errorInfo) {
                    // Call original handler
                    originalHandleError.call(this, errorInfo);
                    
                    // Track in analytics
                    self.trackError(errorInfo);
                };
            }
        },
        
        // Start time tracking
        startTimeTracking: function() {
            this.pageStartTime = Date.now();
            
            // Track active time (when page is visible and user is active)
            let lastActivity = Date.now();
            let totalActiveTime = 0;
            let isActive = true;
            
            const updateActivity = () => {
                const now = Date.now();
                if (isActive && !document.hidden) {
                    totalActiveTime += now - lastActivity;
                }
                lastActivity = now;
            };
            
            // Track user activity
            ['click', 'scroll', 'keydown', 'mousemove', 'touchstart'].forEach(event => {
                document.addEventListener(event, updateActivity);
            });
            
            // Track visibility changes
            document.addEventListener('visibilitychange', () => {
                isActive = !document.hidden;
                updateActivity();
            });
            
            // Send time data periodically
            setInterval(() => {
                updateActivity();
                this.trackEvent('time_on_page', {
                    totalTime: Date.now() - this.pageStartTime,
                    activeTime: totalActiveTime
                });
            }, 30000); // Every 30 seconds
        },
        
        // Start session tracking
        startSessionTracking: function() {
            const self = this;
            
            // Update last activity time
            const updateActivity = () => {
                self.lastActivity = Date.now();
            };
            
            ['click', 'scroll', 'keydown', 'mousemove', 'touchstart'].forEach(event => {
                document.addEventListener(event, updateActivity);
            });
            
            // Check for session timeout
            setInterval(() => {
                if (Date.now() - self.lastActivity > self.config.sessionTimeout) {
                    self.trackEvent('session_timeout', {
                        duration: Date.now() - self.lastActivity
                    });
                }
            }, 60000); // Check every minute
        },
        
        // Track custom events
        trackEvent: function(eventName, data = {}) {
            if (this.events.length >= this.config.maxEventsPerSession) {
                return; // Prevent memory issues
            }
            
            const event = {
                name: eventName,
                data: data,
                timestamp: Date.now(),
                sessionId: this.sessionId,
                userId: this.userId,
                url: window.location.href,
                botDetected: this.botDetected
            };
            
            this.events.push(event);
            
            // Send to Google Analytics if available
            this.sendToGoogleAnalytics(eventName, data);
            
            // Send to custom analytics if needed
            this.sendToCustomAnalytics(event);
        },
        
        // Track errors
        trackError: function(errorInfo) {
            this.trackEvent('javascript_error', {
                message: errorInfo.message,
                type: errorInfo.type,
                filename: errorInfo.filename,
                line: errorInfo.lineno,
                stack: errorInfo.stack ? errorInfo.stack.substring(0, 500) : null
            });
        },
        
        // Send to Google Analytics
        sendToGoogleAnalytics: function(eventName, data) {
            try {
                if (typeof gtag !== 'undefined' && !this.botDetected) {
                    gtag('event', eventName, {
                        custom_parameter: JSON.stringify(data).substring(0, 100),
                        session_id: this.sessionId,
                        user_id: this.userId
                    });
                }
            } catch (error) {
                console.warn('Failed to send to Google Analytics:', error);
            }
        },
        
        // Send to custom analytics
        sendToCustomAnalytics: function(event) {
            // Implement custom analytics endpoint if needed
            try {
                if (this.config.apiEndpoint && !this.botDetected) {
                    // Queue for batch sending to avoid too many requests
                    this.queueForBatchSend(event);
                }
            } catch (error) {
                console.warn('Failed to send to custom analytics:', error);
            }
        },
        
        // Queue events for batch sending
        queueForBatchSend: function(event) {
            if (!this.sendQueue) {
                this.sendQueue = [];
                
                // Send batch every 10 seconds or when queue reaches 10 events
                setInterval(() => {
                    if (this.sendQueue.length > 0) {
                        this.sendBatch();
                    }
                }, 10000);
            }
            
            this.sendQueue.push(event);
            
            if (this.sendQueue.length >= 10) {
                this.sendBatch();
            }
        },
        
        // Send batch of events
        sendBatch: function() {
            if (!this.sendQueue || this.sendQueue.length === 0) return;
            
            const batch = this.sendQueue.splice(0, 10); // Send up to 10 events at once
            
            fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    events: batch,
                    sessionId: this.sessionId,
                    timestamp: Date.now()
                })
            }).catch(error => {
                console.warn('Failed to send analytics batch:', error);
            });
        },
        
        // Send session data on page unload
        sendSessionData: function() {
            const sessionData = {
                sessionId: this.sessionId,
                userId: this.userId,
                duration: Date.now() - this.lastActivity,
                eventsCount: this.events.length,
                botDetected: this.botDetected,
                url: window.location.href
            };
            
            // Use sendBeacon for reliable delivery
            if (navigator.sendBeacon && this.config.apiEndpoint) {
                navigator.sendBeacon(
                    this.config.apiEndpoint + '/session',
                    JSON.stringify(sessionData)
                );
            }
        },
        
        // Get analytics data
        getAnalyticsData: function() {
            return {
                sessionId: this.sessionId,
                userId: this.userId,
                botDetected: this.botDetected,
                eventsCount: this.events.length,
                events: this.events.slice(-10) // Last 10 events
            };
        },
        
        // Clear analytics data
        clearData: function() {
            this.events = [];
            localStorage.removeItem('userId');
        }
    };
    
    // Expose to global scope
    window.Analytics = Analytics;
    
    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            Analytics.init();
        });
    } else {
        Analytics.init();
    }
    
    console.log('Analytics and bot detection system loaded successfully');
})();