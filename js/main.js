// Main JavaScript for doha.kr

// Component loading function
async function loadComponent(componentName, targetId) {
    try {
        const response = await fetch(`/includes/${componentName}.html`);
        if (response.ok) {
            const html = await response.text();
            const target = document.getElementById(targetId);
            if (target) {
                target.innerHTML = html;
                console.log(`✅ Loaded ${componentName} component`);
            } else {
                console.warn(`❌ Target element ${targetId} not found`);
            }
        } else {
            console.error(`❌ Failed to load ${componentName}: ${response.status}`);
            // Fallback: create basic components inline
            createFallbackComponent(componentName, targetId);
        }
    } catch (error) {
        console.error(`❌ Error loading component ${componentName}:`, error);
        // Fallback: create basic components inline
        createFallbackComponent(componentName, targetId);
    }
}

// Fallback component creation
function createFallbackComponent(componentName, targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;

    if (componentName === 'navbar') {
        target.innerHTML = `
            <nav class="navbar">
                <div class="navbar-container">
                    <a href="/" class="logo">doha.kr</a>
                    <ul class="nav-menu" id="nav-menu">
                        <li><a href="/" class="nav-link">홈</a></li>
                        <li><a href="/tests/" class="nav-link">심리테스트</a></li>
                        <li><a href="/tools/" class="nav-link">실용도구</a></li>
                        <li><a href="/contact/" class="nav-link">문의</a></li>
                        <li><a href="/about/" class="nav-link">소개</a></li>
                    </ul>
                    <button class="mobile-menu-btn" onclick="toggleMobileMenu()">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </nav>
        `;
    } else if (componentName === 'footer') {
        target.innerHTML = `
            <footer class="footer">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>doha.kr</h3>
                        <p style="color: var(--gray-400); margin-top: 8px;">
                            일상을 더 재미있게 만드는 공간<br>
                            심리테스트와 실용도구의 만남
                        </p>
                        <div class="footer-social">
                            <a href="mailto:youtubdoha@gmail.com" class="social-link">📧</a>
                        </div>
                    </div>
                    
                    <div class="footer-section">
                        <h3>서비스</h3>
                        <ul class="footer-links">
                            <li><a href="/">홈</a></li>
                            <li><a href="/tests/">심리테스트</a></li>
                            <li><a href="/tools/">실용도구</a></li>
                            <li><a href="/about/">사이트 소개</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h3>인기 콘텐츠</h3>
                        <ul class="footer-links">
                            <li><a href="/tests/teto-egen/start.html">테토-에겐 테스트</a></li>
                            <li><a href="/tests/mbti/">MBTI 테스트</a></li>
                            <li><a href="/tools/text-counter.html">글자수 세기</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h3>고객지원</h3>
                        <ul class="footer-links">
                            <li><a href="/contact/">문의하기</a></li>
                            <li><a href="/faq/">자주 묻는 질문</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <div class="footer-legal">
                        <a href="/privacy/">개인정보처리방침</a>
                        <a href="/terms/">이용약관</a>
                    </div>
                    <p>&copy; 2025 doha.kr. All rights reserved.</p>
                </div>
            </footer>
        `;
    }
    console.log(`✅ Created fallback ${componentName} component`);
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
    
    if (mobileBtn) {
        mobileBtn.classList.toggle('active');
    }
}

// FAQ toggle functionality
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    faqItem.classList.toggle('active');
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.feature-card, .test-card, .tool-card, .section').forEach(el => {
        observer.observe(el);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing doha.kr...');
    
    // Load components
    loadComponent('navbar', 'navbar-placeholder');
    loadComponent('footer', 'footer-placeholder');
    
    // Initialize other features
    initSmoothScroll();
    
    // Initialize animations after a short delay
    setTimeout(initAnimations, 500);
    
    console.log('✅ doha.kr initialized successfully');
});

// Handle window resize for mobile menu
window.addEventListener('resize', function() {
    const navMenu = document.getElementById('nav-menu');
    if (window.innerWidth > 768 && navMenu) {
        navMenu.classList.remove('active');
        document.querySelector('.mobile-menu-btn')?.classList.remove('active');
    }
});

// Add fade-in animation CSS
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.6s forwards;
    }
    
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }
`;
document.head.appendChild(style);