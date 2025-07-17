const fs = require('fs').promises;
const path = require('path');

async function buildCompleteCSS() {
    console.log('🔧 완전한 CSS 빌드 시작...\n');
    
    // 모든 CSS 파일 순서 (의존성 순서대로)
    const cssFiles = [
        // Base styles (먼저 로드되어야 함)
        'css/base/variables.css',
        'css/base/reset.css',
        'css/base/typography.css',
        
        // Layout components
        'css/layout/container.css',
        'css/layout/grid.css',
        
        // Components
        'css/components/navigation.css',
        'css/components/buttons.css',
        'css/components/forms.css',
        
        // 모든 페이지 스타일 (순서 중요)
        'css/pages/homepage.css',
        'css/pages/about.css',
        'css/pages/contact.css',
        'css/pages/faq.css',
        'css/pages/legal.css',
        'css/pages/test-pages.css',
        'css/pages/tests-index.css',
        'css/pages/mbti-intro.css',
        'css/pages/mbti-test.css',
        'css/pages/teto-egen-intro.css',
        'css/pages/teto-egen-test.css',
        'css/pages/love-dna-test.css',
        'css/pages/fortune-common.css',
        'css/pages/fortune-pages.css',
        'css/pages/saju.css',
        'css/pages/tarot.css',
        'css/pages/zodiac.css',
        'css/pages/zodiac-animal.css',
        'css/pages/tools-pages.css',
        'css/pages/tools-index.css',
        'css/pages/text-counter.css',
        'css/pages/bmi-calculator.css',
        'css/pages/salary-calculator.css',
        
        // Utilities (마지막에 로드 - 오버라이드 가능)
        'css/utilities/helpers.css',
        'css/utilities/animations.css',
        'css/utilities/responsive.css',
        'css/utilities/print.css'
    ];
    
    let combinedCSS = `/* =========================================================================
   DOHA.KR - COMPLETE COMBINED STYLESHEET
   All CSS modules combined into one file
   Generated: ${new Date().toISOString()}
   ========================================================================= */

/* CRITICAL: Ensure body has proper width */
html, body {
    width: 100%;
    max-width: 100%;
}

body {
    width: 100% !important;
    max-width: 100% !important;
}

`;
    
    let totalSize = 0;
    let successCount = 0;
    let failCount = 0;
    
    // 각 파일을 읽어서 합치기
    for (const file of cssFiles) {
        try {
            const content = await fs.readFile(file, 'utf8');
            
            // @import 구문 제거 (이미 합쳐지므로 불필요)
            const cleanContent = content
                .replace(/@import\s+['"](.*?)['"]\s*;/g, '')
                .trim();
            
            if (cleanContent) {
                // 파일 구분 주석 추가
                combinedCSS += `\n/* ========================================================================= */\n`;
                combinedCSS += `/* ${file} */\n`;
                combinedCSS += `/* ========================================================================= */\n\n`;
                combinedCSS += cleanContent;
                combinedCSS += '\n\n';
                
                totalSize += content.length;
                successCount++;
                console.log(`✅ ${file} 추가됨 (${content.length}자)`);
            }
        } catch (error) {
            failCount++;
            console.log(`⚠️  ${file} 건너뜀 - ${error.message}`);
        }
    }
    
    // 추가 보정: 중요한 스타일 강제 적용
    combinedCSS += `
/* ========================================================================= */
/* CRITICAL OVERRIDES - 레이아웃 문제 해결 */
/* ========================================================================= */

/* Body width 강제 설정 */
body {
    width: 100% !important;
    max-width: 100% !important;
}

/* Container 최대 너비 */
.container {
    width: 100%;
    max-width: var(--container-max-width, 1280px);
    margin: 0 auto;
    padding: 0 var(--spacing-4, 1rem);
}

/* Navbar full width */
.navbar {
    width: 100%;
}

/* Service cards grid */
.services-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-6, 1.5rem);
}

.service-card {
    display: block !important;
}
`;
    
    // 통합된 CSS 파일 저장
    const outputPath = 'css/styles-complete.css';
    await fs.writeFile(outputPath, combinedCSS);
    
    console.log(`\n✨ CSS 빌드 완료!`);
    console.log(`📄 출력 파일: ${outputPath}`);
    console.log(`📏 파일 크기: ${(combinedCSS.length / 1024).toFixed(2)}KB`);
    console.log(`📊 통계: ${successCount}개 성공, ${failCount}개 실패`);
    console.log(`💾 총 처리량: ${(totalSize / 1024).toFixed(2)}KB`);
}

// 실행
buildCompleteCSS().catch(console.error);