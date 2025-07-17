const fs = require('fs').promises;
const path = require('path');

async function buildCSS() {
    console.log('🔧 CSS 빌드 시작...\n');
    
    // CSS 파일 순서 (의존성 순서대로)
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
        
        // Page-specific styles
        'css/pages/homepage.css',
        
        // Utilities (마지막에 로드)
        'css/utilities/helpers.css',
        'css/utilities/animations.css',
        'css/utilities/responsive.css',
        'css/utilities/print.css'
    ];
    
    let combinedCSS = `/* =========================================================================
   DOHA.KR - COMBINED STYLESHEET
   Auto-generated from modular CSS files
   Generated: ${new Date().toISOString()}
   ========================================================================= */\n\n`;
    
    // 각 파일을 읽어서 합치기
    for (const file of cssFiles) {
        try {
            const content = await fs.readFile(file, 'utf8');
            
            // @import 구문 제거 (이미 합쳐지므로 불필요)
            const cleanContent = content.replace(/@import\s+['"](.*?)['"]\s*;/g, '');
            
            // 파일 구분 주석 추가
            combinedCSS += `\n/* ========================================================================= */\n`;
            combinedCSS += `/* ${file} */\n`;
            combinedCSS += `/* ========================================================================= */\n\n`;
            combinedCSS += cleanContent;
            combinedCSS += '\n';
            
            console.log(`✅ ${file} 추가됨`);
        } catch (error) {
            console.error(`❌ ${file} 읽기 실패:`, error.message);
        }
    }
    
    // 통합된 CSS 파일 저장
    const outputPath = 'css/styles-combined.css';
    await fs.writeFile(outputPath, combinedCSS);
    
    console.log(`\n✨ CSS 빌드 완료!`);
    console.log(`📄 출력 파일: ${outputPath}`);
    console.log(`📏 파일 크기: ${(combinedCSS.length / 1024).toFixed(2)}KB`);
    
    // 기존 styles.css와 비교
    try {
        const oldStyles = await fs.readFile('css/styles.css', 'utf8');
        console.log(`\n📊 비교:`);
        console.log(`   기존 styles.css: ${oldStyles.length}자`);
        console.log(`   새 styles-combined.css: ${combinedCSS.length}자`);
    } catch (e) {}
}

// 실행
buildCSS().catch(console.error);