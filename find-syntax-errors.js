const fs = require('fs');
const path = require('path');

function findSyntaxErrors(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (!['node_modules', '.git'].includes(file)) {
                findSyntaxErrors(filePath);
            }
        } else if (file.endsWith('.js')) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                
                // 찾을 패턴들
                const patterns = [
                    /catch\s*\([^)]*:[^)]*\)/g,  // catch(error:any) 형태
                    /function\s*\([^)]*:[^)]*\)/g,  // function(param:type) 형태
                    /\([^)]*:\s*[^,)]+\s*\)/g,  // 일반적인 타입 주석
                    /export\s+{[^}]*}/g,  // export 구문
                    /export\s+default/g,  // export default
                ];
                
                patterns.forEach(pattern => {
                    const matches = content.match(pattern);
                    if (matches) {
                        console.log(`\n📁 ${filePath}`);
                        matches.forEach(match => {
                            console.log(`   ❌ 발견: ${match}`);
                        });
                    }
                });
                
            } catch (error) {
                console.error(`Error reading ${filePath}:`, error.message);
            }
        }
    });
}

console.log('🔍 JavaScript 구문 에러 검사 시작...\n');
findSyntaxErrors('.');
console.log('\n✅ 검사 완료!');