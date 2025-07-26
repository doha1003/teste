import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function moveAllInlineScripts() {
    console.log('🔧 모든 인라인 스크립트를 외부 파일로 이동 중...\n');
    
    // 처리할 파일들
    const filesToFix = [
        { file: 'fortune/daily/index.html', name: 'daily-fortune' },
        { file: 'fortune/tarot/index.html', name: 'tarot-fortune' },
        { file: 'fortune/saju/index.html', name: 'saju-fortune' },
        { file: 'tools/bmi-calculator.html', name: 'bmi-calculator' }
    ];
    
    for (const { file, name } of filesToFix) {
        console.log(`📄 ${file} 처리 중...`);
        const fullPath = path.join(__dirname, file);
        let content = await fs.readFile(fullPath, 'utf8');
        
        // 모든 인라인 스크립트를 외부 파일로 추출
        const scripts = [];
        let scriptIndex = 0;
        
        // onsubmit, onclick 등의 인라인 이벤트 핸들러 처리
        content = content.replace(/onsubmit="([^"]+)"/g, (match, handler) => {
            scripts.push(`\n// Form submit handler\ndocument.addEventListener('DOMContentLoaded', function() {\n    const form = document.querySelector('form');\n    if (form) {\n        form.addEventListener('submit', function(event) {\n            ${handler.replace('event', 'event')}\n        });\n    }\n});`);
            return 'data-form="true"';
        });
        
        content = content.replace(/onclick="([^"]+)"/g, (match, handler) => {
            const id = `btn-${name}-${scriptIndex++}`;
            scripts.push(`\n// Button click handler\ndocument.addEventListener('DOMContentLoaded', function() {\n    const btn = document.querySelector('[data-btn-id="${id}"]');\n    if (btn) {\n        btn.addEventListener('click', function() {\n            ${handler}\n        });\n    }\n});`);
            return `data-btn-id="${id}"`;
        });
        
        // 모든 <script> 태그 내용을 외부 파일로
        const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
        let match;
        while ((match = scriptRegex.exec(content)) !== null) {
            const scriptContent = match[1].trim();
            if (scriptContent && !match[0].includes('src=') && !scriptContent.includes('src=')) {
                scripts.push(scriptContent);
            }
        }
        
        // 외부 스크립트 파일 생성
        if (scripts.length > 0) {
            const scriptFileName = `${name}-inline.js`;
            const scriptPath = path.join(__dirname, 'js', scriptFileName);
            await fs.writeFile(scriptPath, scripts.join('\n\n'), 'utf8');
            console.log(`  ✅ ${scriptFileName} 생성됨`);
            
            // HTML에서 인라인 스크립트 제거 및 외부 파일 참조 추가
            content = content.replace(/<script[^>]*>([\s\S]*?)<\/script>/g, (match) => {
                if (match.includes('src=')) return match;
                return '';
            });
            
            // body 끝에 외부 스크립트 추가
            content = content.replace('</body>', `    <script src="/js/${scriptFileName}"></script>\n</body>`);
        }
        
        await fs.writeFile(fullPath, content, 'utf8');
        console.log(`  ✅ ${file} 수정 완료`);
    }
    
    console.log('\n✅ 모든 인라인 스크립트 이동 완료!');
}

moveAllInlineScripts().catch(console.error);