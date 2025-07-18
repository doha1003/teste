// 긴급 CSS 수정 스크립트
// doha.kr 사이트의 CSS 문제를 즉시 해결하기 위한 스크립트

console.log('🚨 긴급 CSS 수정 스크립트 실행 중...');

// 1. 기존 CSS 파일 확인
const checkCSS = () => {
    const cssFiles = document.querySelectorAll('link[rel="stylesheet"]');
    console.log(`발견된 CSS 파일: ${cssFiles.length}개`);
    
    cssFiles.forEach((css, index) => {
        console.log(`CSS ${index + 1}: ${css.href}`);
        
        // styles-complete.min.css가 제대로 로드되었는지 확인
        if (css.href.includes('styles-complete.min.css')) {
            fetch(css.href)
                .then(response => {
                    if (response.ok) {
                        console.log('✅ styles-complete.min.css 로드 성공');
                        return response.text();
                    } else {
                        console.error('❌ styles-complete.min.css 로드 실패:', response.status);
                    }
                })
                .then(content => {
                    if (content && content.includes('navbar')) {
                        console.log('✅ CSS 내용 확인: navbar 클래스 포함');
                    } else {
                        console.error('❌ CSS 내용에 navbar 클래스 없음');
                    }
                })
                .catch(err => console.error('CSS 확인 오류:', err));
        }
    });
};

// 2. 긴급 CSS 주입
const injectEmergencyCSS = () => {
    console.log('💉 긴급 CSS 주입 시작...');
    
    const emergencyStyle = document.createElement('style');
    emergencyStyle.id = 'emergency-css';
    emergencyStyle.textContent = `
        /* ============ 긴급 수정 CSS ============ */
        
        /* 네비게이션 수정 */
        .navbar {
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 50 !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
        
        .navbar-container {
            max-width: 1280px !important;
            margin: 0 auto !important;
            padding: 0 1.5rem !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            height: 72px !important;
        }
        
        .logo {
            font-size: 1.875rem !important;
            font-weight: 900 !important;
            background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
            text-decoration: none !important;
        }
        
        /* 히어로 섹션 */
        .hero {
            padding: 8rem 0 !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            text-align: center !important;
            overflow: hidden !important;
        }
        
        /* CTA 섹션 - 보라색 배경! */
        .cta {
            padding: 6rem 0 !important;
            background: linear-gradient(135deg, #f3e7ff 0%, #e7d5ff 100%) !important;
            color: #5b21b6 !important;
            overflow: hidden !important;
            max-width: 100vw !important;
        }
        
        .cta h2,
        .cta p,
        .cta-title,
        .cta-description {
            color: #5b21b6 !important;
        }
        
        .cta-btn {
            background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%) !important;
            color: white !important;
            padding: 1rem 2rem !important;
            border-radius: 0.5rem !important;
            text-decoration: none !important;
            display: inline-block !important;
            font-weight: 600 !important;
            transition: all 0.3s !important;
        }
        
        .cta-btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 20px rgba(147, 51, 234, 0.3) !important;
        }
        
        /* 버튼 스타일 수정 */
        .btn {
            opacity: 1 !important;
            background: var(--primary-gradient, linear-gradient(135deg, #2563eb 0%, #9333ea 100%)) !important;
            color: white !important;
            border: none !important;
            cursor: pointer !important;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%) !important;
        }
        
        .btn-tools {
            background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%) !important;
        }
        
        .btn-fortune {
            background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%) !important;
        }
        
        /* 컨테이너 */
        .container {
            max-width: 1280px !important;
            margin: 0 auto !important;
            padding: 0 1.5rem !important;
        }
        
        /* 푸터 */
        .footer {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%) !important;
            color: #f9fafb !important;
            padding: 4rem 0 2rem !important;
        }
        
        /* 오버플로우 방지 */
        html, body {
            overflow-x: hidden !important;
            max-width: 100% !important;
        }
        
        section {
            max-width: 100vw !important;
            overflow-x: hidden !important;
        }
        
        /* 모바일 메뉴 버튼 */
        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                gap: 4px !important;
                background: transparent !important;
                border: none !important;
                cursor: pointer !important;
                padding: 0.5rem !important;
            }
            
            .mobile-menu-btn span {
                display: block !important;
                width: 24px !important;
                height: 2px !important;
                background: #374151 !important;
                border-radius: 2px !important;
                transition: all 0.3s !important;
            }
            
            .nav-menu {
                display: none !important;
            }
            
            .nav-menu.active {
                display: flex !important;
                position: fixed !important;
                top: 72px !important;
                left: 0 !important;
                right: 0 !important;
                background: rgba(255, 255, 255, 0.98) !important;
                flex-direction: column !important;
                padding: 2rem !important;
                box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                z-index: 40 !important;
            }
        }
        
        /* 한글 줄바꿈 */
        body, h1, h2, h3, h4, h5, h6, p, li, td, th {
            word-break: keep-all !important;
            overflow-wrap: break-word !important;
        }
    `;
    
    // 기존 긴급 CSS가 있으면 제거
    const existing = document.getElementById('emergency-css');
    if (existing) {
        existing.remove();
    }
    
    // head 맨 끝에 추가
    document.head.appendChild(emergencyStyle);
    console.log('✅ 긴급 CSS 주입 완료!');
};

// 3. CSS 클래스 확인
const verifyClasses = () => {
    const testClasses = ['navbar', 'hero', 'container', 'btn', 'cta', 'footer'];
    console.log('\n📋 CSS 클래스 확인:');
    
    testClasses.forEach(className => {
        const elements = document.getElementsByClassName(className);
        if (elements.length > 0) {
            console.log(`✅ .${className} - ${elements.length}개 발견`);
            
            // 첫 번째 요소의 스타일 확인
            const style = window.getComputedStyle(elements[0]);
            const bg = style.background || style.backgroundColor;
            console.log(`   배경: ${bg}`);
        } else {
            console.error(`❌ .${className} - 요소 없음`);
        }
    });
};

// 4. 실행
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료, CSS 수정 시작...');
    
    // CSS 파일 확인
    checkCSS();
    
    // 긴급 CSS 주입
    setTimeout(() => {
        injectEmergencyCSS();
        
        // 클래스 확인
        setTimeout(() => {
            verifyClasses();
            console.log('\n✅ 긴급 수정 완료! 페이지를 새로고침하세요.');
        }, 500);
    }, 1000);
});

// 5. 수동 실행 함수
window.fixCSS = () => {
    console.log('수동 CSS 수정 실행...');
    injectEmergencyCSS();
    verifyClasses();
};