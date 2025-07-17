const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');

async function updateCSSLinks() {
    console.log('📝 CSS 링크 업데이트 시작...\n');
    
    // HTML 파일 찾기
    const htmlFiles = glob.sync('**/*.html', {
        ignore: ['node_modules/**', 'backup/**', 'old/**']
    });
    
    let updatedCount = 0;
    
    for (const file of htmlFiles) {
        try {
            let content = await fs.readFile(file, 'utf8');
            let updated = false;
            
            // 기존 CSS 링크들을 찾아서 교체
            const patterns = [
                // styles.css 참조
                /<link\s+rel="stylesheet"\s+href="\/css\/styles\.css"[^>]*>/gi,
                // styles-combined.css 참조
                /<link\s+rel="stylesheet"\s+href="\/css\/styles-combined\.css"[^>]*>/gi,
                // 여러 개의 CSS 파일 참조 (base, layout, components 등)
                /<!-- Base styles -->[\s\S]*?<!-- Utilities -->\s*<link[^>]*>[\s\S]*?<link[^>]*responsive\.css">/gi,
                // 개별 CSS 모듈 참조
                /<link\s+rel="stylesheet"\s+href="\/css\/base\/[^"]+\.css"[^>]*>\s*/gi,
                /<link\s+rel="stylesheet"\s+href="\/css\/layout\/[^"]+\.css"[^>]*>\s*/gi,
                /<link\s+rel="stylesheet"\s+href="\/css\/components\/[^"]+\.css"[^>]*>\s*/gi,
                /<link\s+rel="stylesheet"\s+href="\/css\/utilities\/[^"]+\.css"[^>]*>\s*/gi
            ];
            
            // 모든 패턴에 대해 교체 시도
            for (const pattern of patterns) {
                if (pattern.test(content)) {
                    content = content.replace(pattern, '<link rel="stylesheet" href="/css/styles-complete.css">');
                    updated = true;
                }
            }
            
            // 페이지별 CSS는 그대로 유지 (styles-complete.css 다음에 로드)
            // 예: pages/mbti-intro.css 등
            
            if (updated) {
                // 중복 제거
                const lines = content.split('\n');
                const uniqueLines = [];
                let lastCSSLine = '';
                
                for (const line of lines) {
                    if (line.includes('styles-complete.css')) {
                        if (lastCSSLine !== line) {
                            uniqueLines.push(line);
                            lastCSSLine = line;
                        }
                    } else {
                        uniqueLines.push(line);
                    }
                }
                
                content = uniqueLines.join('\n');
                
                await fs.writeFile(file, content);
                updatedCount++;
                console.log(`✅ ${file} 업데이트됨`);
            }
        } catch (error) {
            console.error(`❌ ${file} 오류: ${error.message}`);
        }
    }
    
    console.log(`\n✨ 완료! ${updatedCount}개 파일 업데이트됨`);
}

// glob 패키지 없이 실행
const { execSync } = require('child_process');

async function updateCSSLinksSimple() {
    console.log('📝 CSS 링크 업데이트 시작...\n');
    
    // 주요 HTML 파일들만 직접 지정
    const htmlFiles = [
        'index.html',
        'contact/index.html',
        'fortune/daily/index.html',
        'fortune/saju/index.html',
        'fortune/tarot/index.html',
        'fortune/zodiac/index.html',
        'fortune/zodiac-animal/index.html',
        'fortune/index.html',
        'tests/mbti/index.html',
        'tests/mbti/test.html',
        'tests/teto-egen/index.html',
        'tests/love-dna/index.html',
        'tests/index.html',
        'tools/text-counter.html',
        'tools/bmi-calculator.html',
        'tools/salary-calculator.html',
        'tools/index.html',
        'about/index.html',
        'privacy/index.html',
        'terms/index.html',
        'faq/index.html'
    ];
    
    let updatedCount = 0;
    
    for (const file of htmlFiles) {
        try {
            let content = await fs.readFile(file, 'utf8');
            const originalContent = content;
            
            // CSS 링크 교체
            content = content.replace(/<link\s+rel="stylesheet"\s+href="\/css\/styles\.css"[^>]*>/gi, 
                                    '<link rel="stylesheet" href="/css/styles-complete.css">');
            content = content.replace(/<link\s+rel="stylesheet"\s+href="\/css\/styles-combined\.css"[^>]*>/gi, 
                                    '<link rel="stylesheet" href="/css/styles-complete.css">');
            
            if (content !== originalContent) {
                await fs.writeFile(file, content);
                updatedCount++;
                console.log(`✅ ${file} 업데이트됨`);
            }
        } catch (error) {
            // 파일이 없으면 무시
            if (error.code !== 'ENOENT') {
                console.error(`❌ ${file} 오류: ${error.message}`);
            }
        }
    }
    
    console.log(`\n✨ 완료! ${updatedCount}개 파일 업데이트됨`);
}

// 실행
updateCSSLinksSimple().catch(console.error);