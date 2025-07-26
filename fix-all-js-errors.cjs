const fs = require('fs');
const path = require('path');

// JavaScript 구문 에러 수정
function fixJSErrors(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // 1. export 구문 주석 처리 (이미 주석이 아닌 경우만)
        if (content.includes('export {') && !content.includes('// export {')) {
            content = content.replace(/^export\s+{[^}]*}/gm, '// $&');
            modified = true;
        }
        
        if (content.includes('export default') && !content.includes('// export default')) {
            content = content.replace(/^export\s+default\s+.*/gm, '// $&');
            modified = true;
        }
        
        // 2. TypeScript 타입 주석 제거 (catch 블록)
        content = content.replace(/catch\s*\(\s*(\w+)\s*:\s*\w+\s*\)/g, 'catch ($1)');
        if (content.includes('catch (')) {
            modified = true;
        }
        
        // 3. 함수 매개변수의 타입 주석 제거
        content = content.replace(/function\s*\(([^)]*):([^)]*)\)/g, function(match, param, type) {
            return `function(${param})`;
        });
        
        // 4. arrow function의 타입 주석 제거
        content = content.replace(/\(([^)]*):([^)]*)\)\s*=>/g, function(match, param, type) {
            if (param.includes(',')) {
                // 여러 매개변수의 경우
                const params = param.split(',').map(p => p.split(':')[0].trim()).join(', ');
                return `(${params}) =>`;
            }
            return `(${param.split(':')[0].trim()}) =>`;
        });
        
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

// js 폴더의 모든 .js 파일 처리
function processAllJSFiles(dir) {
    const files = fs.readdirSync(dir);
    let modifiedCount = 0;
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !['node_modules', '.git'].includes(file)) {
            modifiedCount += processAllJSFiles(filePath);
        } else if (file.endsWith('.js') && !file.endsWith('.min.js')) {
            if (fixJSErrors(filePath)) {
                console.log(`✅ 수정됨: ${filePath}`);
                modifiedCount++;
            }
        }
    });
    
    return modifiedCount;
}

console.log('🔧 JavaScript 구문 에러 수정 시작...\n');

const jsDir = path.join(__dirname, 'js');
const apiDir = path.join(__dirname, 'api');

let total = 0;
total += processAllJSFiles(jsDir);
total += processAllJSFiles(apiDir);

console.log(`\n✅ 총 ${total}개 파일 수정 완료!`);