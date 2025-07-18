// HTML과 CSS 연결 상태 전체 분석 및 수정 스크립트

console.log('🔍 HTML-CSS 연결 상태 전체 분석 시작...');

// 1. 현재 로드된 CSS 파일들 확인
const analyzeCSSFiles = () => {
    console.log('\n=== CSS 파일 로드 분석 ===');
    const cssFiles = document.querySelectorAll('link[rel="stylesheet"]');
    
    cssFiles.forEach((css, index) => {
        console.log(`CSS ${index + 1}: ${css.href}`);
        console.log(`  - media: ${css.media || 'all'}`);
        console.log(`  - disabled: ${css.disabled}`);
        
        // CSS 파일 실제 로드 확인
        fetch(css.href, { method: 'HEAD' })
            .then(response => {
                console.log(`  - 상태: ${response.ok ? '✅ 로드됨' : '❌ 실패'} (${response.status})`);
                console.log(`  - 크기: ${response.headers.get('content-length')} bytes`);
            })
            .catch(err => {
                console.error(`  - 오류: ${err.message}`);
            });
    });
    
    // 스타일시트 규칙 수 확인
    let totalRules = 0;
    let accessibleSheets = 0;
    
    for (const sheet of document.styleSheets) {
        try {
            const rules = sheet.cssRules.length;
            totalRules += rules;
            accessibleSheets++;
            console.log(`  - 시트 ${accessibleSheets}: ${rules}개 규칙`);
        } catch (e) {
            console.log(`  - 시트 접근 불가: ${sheet.href || '인라인'} (${e.message})`);
        }
    }
    
    console.log(`\n총 ${totalRules}개 CSS 규칙이 ${accessibleSheets}개 시트에서 로드됨`);
};

// 2. HTML 클래스 vs CSS 클래스 매칭 분석
const analyzeClassMatching = () => {
    console.log('\n=== HTML-CSS 클래스 매칭 분석 ===');
    
    // HTML에서 사용된 모든 클래스 수집
    const allElements = document.querySelectorAll('*[class]');
    const usedClasses = new Set();
    
    allElements.forEach(el => {
        el.className.split(' ').forEach(cls => {
            if (cls.trim()) usedClasses.add(cls.trim());
        });
    });
    
    console.log(`HTML에서 사용된 클래스: ${usedClasses.size}개`);
    
    // CSS에서 정의된 클래스 확인
    const definedClasses = new Set();
    
    for (const sheet of document.styleSheets) {
        try {
            for (const rule of sheet.cssRules) {
                if (rule.type === CSSRule.STYLE_RULE) {
                    const selectors = rule.selectorText.split(',');
                    selectors.forEach(selector => {
                        const classMatches = selector.match(/\\.([a-zA-Z0-9_-]+)/g);
                        if (classMatches) {
                            classMatches.forEach(match => {
                                definedClasses.add(match.substring(1)); // . 제거
                            });
                        }
                    });
                }
            }
        } catch (e) {
            console.log(`시트 분석 실패: ${e.message}`);
        }
    }
    
    console.log(`CSS에서 정의된 클래스: ${definedClasses.size}개`);
    
    // 불일치 분석
    const unmatchedHTML = [...usedClasses].filter(cls => !definedClasses.has(cls));
    const unmatchedCSS = [...definedClasses].filter(cls => !usedClasses.has(cls));
    
    console.log('\n🚨 HTML에서 사용했지만 CSS에 없는 클래스:');
    unmatchedHTML.slice(0, 20).forEach(cls => {
        const count = document.getElementsByClassName(cls).length;
        console.log(`  - .${cls} (${count}개 요소)`);
    });
    
    console.log('\n💡 CSS에 정의되었지만 HTML에서 사용하지 않는 클래스:');
    unmatchedCSS.slice(0, 20).forEach(cls => {
        console.log(`  - .${cls}`);
    });
    
    return { usedClasses, definedClasses, unmatchedHTML, unmatchedCSS };
};

// 3. 주요 컴포넌트 스타일 확인
const checkCriticalComponents = () => {
    console.log('\n=== 주요 컴포넌트 스타일 확인 ===');
    
    const criticalSelectors = [
        { name: 'navbar', selector: '.navbar' },
        { name: 'hero', selector: '.hero' },
        { name: 'container', selector: '.container' },
        { name: 'btn', selector: '.btn' },
        { name: 'cta', selector: '.cta' },
        { name: 'footer', selector: '.footer' },
        { name: 'mobile-menu-btn', selector: '.mobile-menu-btn' }
    ];
    
    criticalSelectors.forEach(comp => {
        const elements = document.querySelectorAll(comp.selector);
        console.log(`\n${comp.name.toUpperCase()}: ${elements.length}개 요소`);
        
        if (elements.length > 0) {
            const style = window.getComputedStyle(elements[0]);
            console.log(`  - display: ${style.display}`);
            console.log(`  - background: ${style.background || style.backgroundColor}`);
            console.log(`  - color: ${style.color}`);
            
            if (comp.name === 'navbar') {
                console.log(`  - position: ${style.position}`);
                console.log(`  - z-index: ${style.zIndex}`);
            }
            
            if (comp.name === 'mobile-menu-btn') {
                console.log(`  - visibility: ${style.visibility}`);
                console.log(`  - opacity: ${style.opacity}`);
                console.log(`  - flex-direction: ${style.flexDirection}`);
            }
        } else {
            console.log(`  ❌ 요소를 찾을 수 없음`);
        }
    });
};

// 4. 긴급 수정 적용
const applyEmergencyFixes = () => {
    console.log('\n=== 긴급 수정 적용 ===');
    
    // 기존 긴급 스타일 제거
    const existingFix = document.getElementById('emergency-css-fix');
    if (existingFix) existingFix.remove();
    
    // 새 긴급 스타일 생성
    const style = document.createElement('style');
    style.id = 'emergency-css-fix';
    style.textContent = `
        /* 긴급 CSS 수정 - 전체 재정의 */
        
        /* 기본 초기화 */
        * {
            box-sizing: border-box;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: 'Noto Sans KR', sans-serif !important;
            line-height: 1.6;
            color: #333;
            overflow-x: hidden;
        }
        
        /* 네비게이션 강제 스타일 */
        .navbar {
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 50 !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
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
            text-decoration: none !important;
        }
        
        .nav-menu {
            display: flex !important;
            gap: 2rem !important;
            list-style: none !important;
            align-items: center !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        
        .nav-link {
            color: #374151 !important;
            text-decoration: none !important;
            font-weight: 500 !important;
            font-size: 1rem !important;
            transition: all 0.3s !important;
        }
        
        .nav-link:hover {
            color: #2563eb !important;
        }
        
        /* 히어로 섹션 */
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            padding: 8rem 0 !important;
            text-align: center !important;
            min-height: 80vh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        
        .hero-content {
            max-width: 800px !important;
            margin: 0 auto !important;
            padding: 0 1.5rem !important;
        }
        
        .hero-title {
            font-size: clamp(2.5rem, 6vw, 4.5rem) !important;
            font-weight: 900 !important;
            margin-bottom: 1.5rem !important;
            line-height: 1.1 !important;
        }
        
        .hero-subtitle {
            font-size: clamp(1.125rem, 2vw, 1.5rem) !important;
            margin-bottom: 2rem !important;
            opacity: 0.9 !important;
        }
        
        .hero-buttons {
            display: flex !important;
            gap: 1rem !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
        }
        
        /* 버튼 스타일 */
        .btn {
            display: inline-block !important;
            padding: 0.75rem 1.5rem !important;
            border-radius: 0.5rem !important;
            text-decoration: none !important;
            font-weight: 600 !important;
            transition: all 0.3s !important;
            border: none !important;
            cursor: pointer !important;
            opacity: 1 !important;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%) !important;
            color: white !important;
        }
        
        .btn-tools {
            background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%) !important;
            color: white !important;
        }
        
        .btn-fortune {
            background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%) !important;
            color: white !important;
        }
        
        .btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
        }
        
        /* 컨테이너 */
        .container {
            max-width: 1280px !important;
            margin: 0 auto !important;
            padding: 0 1.5rem !important;
        }
        
        /* 섹션 공통 */
        section {
            padding: 4rem 0 !important;
            overflow: hidden !important;
        }
        
        .section-title {
            font-size: clamp(2rem, 4vw, 3rem) !important;
            font-weight: 700 !important;
            text-align: center !important;
            margin-bottom: 1rem !important;
            color: #1f2937 !important;
        }
        
        .section-subtitle {
            font-size: 1.25rem !important;
            text-align: center !important;
            color: #6b7280 !important;
            margin-bottom: 3rem !important;
            max-width: 600px !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }
        
        /* 특징 섹션 */
        .features {
            background: #f8fafc !important;
        }
        
        .features-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
            gap: 2rem !important;
            margin-top: 2rem !important;
        }
        
        .feature-card {
            background: white !important;
            padding: 2rem !important;
            border-radius: 1rem !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
            text-align: center !important;
            transition: all 0.3s !important;
        }
        
        .feature-card:hover {
            transform: translateY(-4px) !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
        }
        
        .feature-icon {
            font-size: 3rem !important;
            margin-bottom: 1rem !important;
        }
        
        .feature-title {
            font-size: 1.5rem !important;
            font-weight: 600 !important;
            margin-bottom: 1rem !important;
            color: #1f2937 !important;
        }
        
        .feature-description {
            color: #6b7280 !important;
            margin-bottom: 1.5rem !important;
        }
        
        .feature-link {
            color: #2563eb !important;
            text-decoration: none !important;
            font-weight: 500 !important;
        }
        
        /* CTA 섹션 - 파란색-보라색 그라데이션 */
        .cta {
            background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%) !important;
            color: white !important;
            text-align: center !important;
            padding: 6rem 0 !important;
        }
        
        .cta h2,
        .cta-title {
            color: white !important;
            font-size: clamp(2rem, 4vw, 3rem) !important;
            font-weight: 700 !important;
            margin-bottom: 1rem !important;
        }
        
        .cta p,
        .cta-description {
            color: rgba(255, 255, 255, 0.9) !important;
            font-size: 1.25rem !important;
            margin-bottom: 2rem !important;
        }
        
        .cta-btn {
            background: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
            padding: 1rem 2rem !important;
            border-radius: 0.5rem !important;
            text-decoration: none !important;
            font-weight: 600 !important;
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
            transition: all 0.3s !important;
            backdrop-filter: blur(10px) !important;
            display: inline-block !important;
        }
        
        .cta-btn:hover {
            background: rgba(255, 255, 255, 0.3) !important;
            transform: translateY(-2px) !important;
        }
        
        /* 푸터 */
        .footer {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%) !important;
            color: #f9fafb !important;
            padding: 4rem 0 2rem !important;
        }
        
        .footer-content {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
            gap: 2rem !important;
            margin-bottom: 2rem !important;
        }
        
        .footer-section h3 {
            color: white !important;
            margin-bottom: 1rem !important;
        }
        
        .footer-links {
            list-style: none !important;
            padding: 0 !important;
        }
        
        .footer-links li {
            margin-bottom: 0.5rem !important;
        }
        
        .footer-links a {
            color: #d1d5db !important;
            text-decoration: none !important;
            transition: color 0.3s !important;
        }
        
        .footer-links a:hover {
            color: white !important;
        }
        
        /* 모바일 메뉴 */
        .mobile-menu-btn {
            display: none !important;
        }
        
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
                position: fixed !important;
                top: 72px !important;
                left: 0 !important;
                right: 0 !important;
                background: rgba(255, 255, 255, 0.98) !important;
                backdrop-filter: blur(20px) !important;
                flex-direction: column !important;
                padding: 2rem !important;
                box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                z-index: 40 !important;
            }
            
            .nav-menu.active {
                display: flex !important;
            }
            
            .hero {
                padding: 4rem 0 !important;
                min-height: 60vh !important;
            }
            
            .hero-buttons {
                flex-direction: column !important;
                align-items: center !important;
            }
            
            .btn {
                width: 100% !important;
                max-width: 300px !important;
            }
        }
        
        /* 오버플로우 방지 */
        html, body {
            overflow-x: hidden !important;
            max-width: 100% !important;
        }
        
        * {
            max-width: 100% !important;
        }
        
        img {
            max-width: 100% !important;
            height: auto !important;
        }
    `;
    
    document.head.appendChild(style);
    console.log('✅ 긴급 CSS 수정 적용 완료!');
};

// 전체 실행
const runCompleteAnalysis = () => {
    console.log('🚀 HTML-CSS 연결 상태 전체 분석 및 수정 시작');
    console.log('='.repeat(60));
    
    // 1초 간격으로 순차 실행
    setTimeout(analyzeCSSFiles, 100);
    setTimeout(analyzeClassMatching, 1000);
    setTimeout(checkCriticalComponents, 2000);
    setTimeout(applyEmergencyFixes, 3000);
    
    setTimeout(() => {
        console.log('\n' + '='.repeat(60));
        console.log('✅ 전체 분석 및 수정 완료!');
        console.log('페이지를 새로고침하여 변경사항을 확인하세요.');
    }, 4000);
};

// DOM 로드 후 자동 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runCompleteAnalysis);
} else {
    runCompleteAnalysis();
}

// 수동 실행 함수
window.fixAllCSS = runCompleteAnalysis;
window.analyzeCSS = analyzeClassMatching;