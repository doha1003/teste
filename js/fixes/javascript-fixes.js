// JavaScript Fixes - Comprehensive error handling and improvements

// Error handling wrapper
function safeExecute(fn, context = 'Unknown') {
    try {
        return fn();
    } catch (error) {
        console.error(`Error in ${context}:`, error);
        return null;
    }
}

// Fix showServices function parameter issue
function showServices(event = null) {
    if (event) {
        event.preventDefault();
    }
    
    safeExecute(() => {
        // Your services display logic here
        const servicesSection = document.getElementById('services');
        if (servicesSection) {
            servicesSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, 'showServices');
}

// Enhanced component loading with better error handling
function loadComponentSafe(componentName, targetId, fallbackContent = '') {
    return safeExecute(async () => {
        try {
            const response = await fetch(`/includes/${componentName}.html`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            const target = document.getElementById(targetId);
            
            if (target) {
                target.innerHTML = html;
                
                // Trigger custom event for component loaded
                const event = new CustomEvent('componentLoaded', {
                    detail: { componentName, targetId }
                });
                document.dispatchEvent(event);
                
                return true;
            } else {
                console.warn(`Target element #${targetId} not found`);
                return false;
            }
        } catch (error) {
            console.error(`Failed to load component ${componentName}:`, error);
            
            // Load fallback content if provided
            if (fallbackContent) {
                const target = document.getElementById(targetId);
                if (target) {
                    target.innerHTML = fallbackContent;
                }
            }
            
            return false;
        }
    }, `loadComponent-${componentName}`);
}

// Form validation helpers
function validateForm(formId) {
    return safeExecute(() => {
        const form = document.getElementById(formId);
        if (!form) {
            console.warn(`Form #${formId} not found`);
            return false;
        }
        
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        return isValid;
    }, `validateForm-${formId}`);
}

// Safe event listener addition
function addSafeEventListener(element, event, handler, context = 'Unknown') {
    if (typeof element === 'string') {
        element = document.getElementById(element) || document.querySelector(element);
    }
    
    if (element) {
        element.addEventListener(event, (e) => {
            safeExecute(() => handler(e), `${context}-${event}`);
        });
    } else {
        console.warn(`Element not found for event listener: ${context}`);
    }
}

// Improved loading state management
function setLoadingState(element, isLoading, loadingText = 'Loading...') {
    safeExecute(() => {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }
        
        if (!element) return;
        
        if (isLoading) {
            element.dataset.originalText = element.textContent;
            element.textContent = loadingText;
            element.disabled = true;
            element.classList.add('btn-loading');
        } else {
            element.textContent = element.dataset.originalText || element.textContent;
            element.disabled = false;
            element.classList.remove('btn-loading');
            delete element.dataset.originalText;
        }
    }, 'setLoadingState');
}

// Enhanced scroll functionality
function smoothScrollTo(target, offset = 0) {
    safeExecute(() => {
        let element = target;
        
        if (typeof target === 'string') {
            element = document.getElementById(target) || document.querySelector(target);
        }
        
        if (element) {
            const elementTop = element.offsetTop - offset;
            window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
            });
        }
    }, 'smoothScrollTo');
}

// URL parameter helpers
function getUrlParameter(name) {
    return safeExecute(() => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }, 'getUrlParameter');
}

function setUrlParameter(name, value) {
    safeExecute(() => {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    }, 'setUrlParameter');
}

// Local storage helpers with error handling
function safeLocalStorage(action, key, value = null) {
    return safeExecute(() => {
        if (!window.localStorage) {
            console.warn('localStorage not available');
            return null;
        }
        
        switch (action) {
            case 'get':
                const item = localStorage.getItem(key);
                try {
                    return JSON.parse(item);
                } catch {
                    return item;
                }
                
            case 'set':
                const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
                localStorage.setItem(key, valueToStore);
                return true;
                
            case 'remove':
                localStorage.removeItem(key);
                return true;
                
            default:
                console.warn(`Unknown localStorage action: ${action}`);
                return null;
        }
    }, `localStorage-${action}`);
}

// Mobile detection
function isMobile() {
    return safeExecute(() => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }, 'isMobile') || false;
}

// Enhanced copy to clipboard
function copyToClipboard(text, successCallback = null, errorCallback = null) {
    safeExecute(async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                if (successCallback) successCallback();
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                document.execCommand('copy');
                textArea.remove();
                
                if (successCallback) successCallback();
            }
        } catch (error) {
            console.error('Failed to copy text:', error);
            if (errorCallback) errorCallback(error);
        }
    }, 'copyToClipboard');
}

// Image loading with error handling
function loadImageSafe(src, onLoad = null, onError = null) {
    return safeExecute(() => {
        const img = new Image();
        
        img.onload = () => {
            if (onLoad) onLoad(img);
        };
        
        img.onerror = (error) => {
            console.error(`Failed to load image: ${src}`, error);
            if (onError) onError(error);
        };
        
        img.src = src;
        return img;
    }, 'loadImageSafe');
}

// Debounce function for performance
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) safeExecute(() => func(...args), 'debounced-function');
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) safeExecute(() => func(...args), 'debounced-function-immediate');
    };
}

// Initialize common fixes on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript fixes loaded');
    
    // Fix common issues
    safeExecute(() => {
        // Add error class styling if not present
        if (!document.querySelector('style[data-js-fixes]')) {
            const style = document.createElement('style');
            style.setAttribute('data-js-fixes', 'true');
            style.textContent = `
                .error {
                    border-color: #dc3545 !important;
                    background-color: #fff5f5 !important;
                }
                .btn-loading {
                    position: relative;
                    pointer-events: none;
                }
                .btn-loading::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 16px;
                    height: 16px;
                    margin: -8px 0 0 -8px;
                    border: 2px solid transparent;
                    border-top: 2px solid currentColor;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }, 'initialize-styles');
    
    // Add global error handler
    window.addEventListener('error', (event) => {
        console.error('Global error caught:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
    });
});

// Export functions for global use
window.JSFixes = {
    safeExecute,
    showServices,
    loadComponentSafe,
    validateForm,
    addSafeEventListener,
    setLoadingState,
    smoothScrollTo,
    getUrlParameter,
    setUrlParameter,
    safeLocalStorage,
    isMobile,
    copyToClipboard,
    loadImageSafe,
    debounce
};