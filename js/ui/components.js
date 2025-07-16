/**
 * DOHA.KR - UI Components Loader
 * Safe component loading and management system
 */

import errorHandler from '../core/error-handler.js';

export class ComponentLoader {
    constructor() {
        this.loadedComponents = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * Load component safely with caching
     * @param {string} componentName - Component file name (without .html)
     * @param {string} targetId - Target element ID
     * @param {string} fallbackContent - Fallback content if loading fails
     * @returns {Promise<boolean>} Success status
     */
    async loadComponent(componentName, targetId, fallbackContent = '') {
        const cacheKey = `${componentName}:${targetId}`;
        
        // Return existing promise if already loading
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }

        const loadPromise = errorHandler.safeExecuteAsync(async () => {
            const target = document.getElementById(targetId);
            if (!target) {
                throw new Error(`Target element with ID '${targetId}' not found`);
            }

            // Use cached content if available
            if (this.loadedComponents.has(componentName)) {
                target.innerHTML = this.loadedComponents.get(componentName);
                this.dispatchComponentEvent('componentLoaded', { componentName, targetId, cached: true });
                return true;
            }

            const response = await fetch(`/includes/${componentName}.html`);
            
            if (!response.ok) {
                throw new Error(`Failed to load component: ${response.status} ${response.statusText}`);
            }
            
            const html = await response.text();
            
            // Cache the component
            this.loadedComponents.set(componentName, html);
            
            // Insert into target
            target.innerHTML = html;
            
            // Dispatch loaded event
            this.dispatchComponentEvent('componentLoaded', { componentName, targetId, cached: false });
            
            // Initialize any scripts in the loaded component
            this.initializeComponentScripts(target);
            
            return true;
        }, `loadComponent:${componentName}`, false);

        // Cache the promise
        this.loadingPromises.set(cacheKey, loadPromise);

        try {
            const result = await loadPromise;
            return result;
        } catch (error) {
            // Use fallback content on error
            if (fallbackContent) {
                const target = document.getElementById(targetId);
                if (target) {
                    target.innerHTML = fallbackContent;
                }
            }
            return false;
        } finally {
            // Clean up promise cache
            this.loadingPromises.delete(cacheKey);
        }
    }

    /**
     * Load multiple components concurrently
     * @param {Array} components - Array of {name, targetId, fallback} objects
     * @returns {Promise<Object>} Results object with component names as keys
     */
    async loadComponents(components) {
        const promises = components.map(comp => 
            this.loadComponent(comp.name, comp.targetId, comp.fallback || '')
                .then(success => ({ [comp.name]: success }))
        );

        const results = await Promise.all(promises);
        return Object.assign({}, ...results);
    }

    /**
     * Initialize scripts within a loaded component
     * @param {HTMLElement} container - Container element
     */
    initializeComponentScripts(container) {
        errorHandler.safeExecute(() => {
            const scripts = container.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.src) {
                    // External script
                    const newScript = document.createElement('script');
                    newScript.src = script.src;
                    newScript.async = script.async;
                    newScript.defer = script.defer;
                    document.head.appendChild(newScript);
                } else if (script.textContent.trim()) {
                    // Inline script
                    try {
                        new Function(script.textContent)();
                    } catch (error) {
                        console.warn('Failed to execute component script:', error);
                    }
                }
            });
        }, 'initializeComponentScripts');
    }

    /**
     * Dispatch component-related events
     * @param {string} eventName - Event name
     * @param {Object} detail - Event detail data
     */
    dispatchComponentEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Clear component cache
     * @param {string} componentName - Optional component name to clear
     */
    clearCache(componentName = null) {
        if (componentName) {
            this.loadedComponents.delete(componentName);
        } else {
            this.loadedComponents.clear();
        }
    }

    /**
     * Preload components for better performance
     * @param {Array} componentNames - Array of component names to preload
     */
    async preloadComponents(componentNames) {
        const promises = componentNames.map(async name => {
            try {
                const response = await fetch(`/includes/${name}.html`);
                if (response.ok) {
                    const html = await response.text();
                    this.loadedComponents.set(name, html);
                    return true;
                }
            } catch (error) {
                console.warn(`Failed to preload component ${name}:`, error);
            }
            return false;
        });

        return Promise.all(promises);
    }
}

/**
 * Navigation utilities
 */
export class Navigation {
    constructor() {
        this.mobileMenuOpen = false;
        this.init();
    }

    init() {
        // Mobile menu toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('.mobile-menu-btn') || e.target.closest('.mobile-menu-btn')) {
                e.preventDefault();
                this.toggleMobileMenu();
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.mobileMenuOpen && !e.target.closest('.navbar')) {
                this.closeMobileMenu();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        const navbar = document.querySelector('.navbar');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (navbar) {
            navbar.classList.toggle('mobile-open', this.mobileMenuOpen);
        }
        
        if (mobileMenu) {
            mobileMenu.classList.toggle('open', this.mobileMenuOpen);
        }

        // Update button state
        const btn = document.querySelector('.mobile-menu-btn');
        if (btn) {
            btn.classList.toggle('open', this.mobileMenuOpen);
            btn.setAttribute('aria-expanded', this.mobileMenuOpen);
        }

        // Prevent body scroll when menu is open
        document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
    }

    closeMobileMenu() {
        if (this.mobileMenuOpen) {
            this.toggleMobileMenu();
        }
    }

    showServices(event = null) {
        if (event) {
            event.preventDefault();
        }
        
        errorHandler.safeExecute(() => {
            const servicesSection = document.getElementById('services');
            if (servicesSection) {
                servicesSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 'showServices');
    }
}

// Create instances
const componentLoader = new ComponentLoader();
const navigation = new Navigation();

// Export for module use
export { componentLoader, navigation };

// Global access for legacy compatibility
window.ComponentLoader = componentLoader;
window.Navigation = navigation;
window.loadComponentSafe = (name, targetId, fallback) => componentLoader.loadComponent(name, targetId, fallback);
window.toggleMobileMenu = () => navigation.toggleMobileMenu();
window.showServices = (event) => navigation.showServices(event);