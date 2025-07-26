const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 올바른 DOMPurify 3.0.6 SHA-512 해시
const CORRECT_INTEGRITY = 'sha512-H+rglffZ6f5gF7UJgvH4Naa+fGCgjrHKMgoFOGmcPTRwR6oILo5R+gtzNrpDp7iMV3udbymBVjkeZGNz1Em4rQ==';

function fixDOMPurifyIntegrity(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // 잘못된 integrity 해시를 올바른 것으로 변경
        const wrongIntegrityPattern = /integrity="sha256-[^"]+"/g;
        if (content.match(wrongIntegrityPattern)) {
            content = content.replace(wrongIntegrityPattern, `integrity="${CORRECT_INTEGRITY}"`);
            modified = true;
        }
        
        // DOMPurify URL 패턴 확인 (3.0.6 버전)
        const dompurifyPattern = /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/dompurify\/3\.0\.6\/purify\.min\.js/;
        if (content.match(dompurifyPattern) && !content.includes(CORRECT_INTEGRITY)) {
            // DOMPurify script 태그 찾아서 integrity 수정
            content = content.replace(
                /<script[^>]+dompurify[^>]+>/g,
                (match) => {
                    if (!match.includes('integrity=')) {
                        return match.replace('>', ` integrity="${CORRECT_INTEGRITY}" crossorigin="anonymous" referrerpolicy="no-referrer">`);
                    } else {
                        return match.replace(/integrity="[^"]+"/g, `integrity="${CORRECT_INTEGRITY}"`);
                    }
                }
            );
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

function processAllHTMLFiles(dir) {
    const files = fs.readdirSync(dir);
    let modifiedCount = 0;
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !['node_modules', '.git', 'backup_before_cleanup', 'development'].includes(file)) {
            modifiedCount += processAllHTMLFiles(filePath);
        } else if (file.endsWith('.html')) {
            if (fixDOMPurifyIntegrity(filePath)) {
                console.log(`✅ 수정됨: ${filePath}`);
                modifiedCount++;
            }
        }
    });
    
    return modifiedCount;
}

console.log('🔧 DOMPurify integrity 해시 수정 시작...\n');
console.log(`올바른 SHA-512 해시: ${CORRECT_INTEGRITY}\n`);

const total = processAllHTMLFiles('.');

console.log(`\n✅ 총 ${total}개 파일 수정 완료!`);