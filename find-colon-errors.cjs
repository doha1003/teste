const fs = require('fs');
const path = require('path');

// 콜론(:) 관련 에러 찾기
function findColonErrors(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const errors = [];
        
        lines.forEach((line, index) => {
            // catch 블록에서 타입 주석
            if (line.match(/catch\s*\([^)]*:[^)]*\)/)) {
                errors.push({ line: index + 1, content: line.trim(), type: 'catch with type' });
            }
            
            // 함수 매개변수에서 타입 주석
            if (line.match(/function\s*\([^)]*:[^)]*\)/) && !line.includes('://')) {
                errors.push({ line: index + 1, content: line.trim(), type: 'function param type' });
            }
            
            // arrow function에서 타입 주석
            if (line.match(/\([^)]*:\s*[^,)]+\)\s*=>/) && !line.includes('://')) {
                errors.push({ line: index + 1, content: line.trim(), type: 'arrow function type' });
            }
            
            // const/let/var에서 타입 주석
            if (line.match(/(const|let|var)\s+\w+\s*:\s*\w+\s*=/) && !line.includes('://')) {
                errors.push({ line: index + 1, content: line.trim(), type: 'variable type' });
            }
        });
        
        return errors;
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return [];
    }
}

// 디렉토리 재귀적으로 검색
function scanDirectory(dir) {
    const results = [];
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (!['node_modules', '.git', 'backup_before_cleanup', 'development'].includes(file)) {
                results.push(...scanDirectory(filePath));
            }
        } else if (file.endsWith('.js') && !file.endsWith('.min.js')) {
            const errors = findColonErrors(filePath);
            if (errors.length > 0) {
                results.push({ file: filePath, errors });
            }
        }
    });
    
    return results;
}

console.log('🔍 JavaScript 콜론(:) 에러 검색 시작...\n');

const results = scanDirectory('.');

if (results.length === 0) {
    console.log('✅ 콜론(:) 관련 에러를 찾을 수 없습니다.');
} else {
    results.forEach(result => {
        console.log(`\n📄 ${result.file}`);
        result.errors.forEach(error => {
            console.log(`   Line ${error.line}: ${error.type}`);
            console.log(`   > ${error.content}`);
        });
    });
    
    console.log(`\n총 ${results.length}개 파일에서 에러 발견`);
}