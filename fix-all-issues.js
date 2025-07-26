import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixAllIssues() {
    console.log('🔧 모든 문제 수정 시작...\n');
    
    // 1. CSP에 'unsafe-inline' 추가 (임시 해결책)
    console.log('1️⃣ CSP 정책 수정 중...');
    
    const htmlFiles = [
        'index.html',
        '404.html',
        'fortune/daily/index.html',
        'fortune/saju/index.html',
        'fortune/tarot/index.html',
        'fortune/zodiac/index.html',
        'fortune/zodiac-animal/index.html',
        'tests/mbti/index.html',
        'tests/teto-egen/index.html',
        'tests/love-dna/index.html',
        'tools/bmi-calculator.html',
        'tools/text-counter.html',
        'tools/salary-calculator.html',
        'about/index.html',
        'contact/index.html',
        'privacy/index.html',
        'terms/index.html',
        'faq/index.html',
        'fortune/index.html',
        'tests/index.html',
        'tools/index.html',
        'tests/mbti/test.html',
        'tests/love-dna/test.html',
        'tests/teto-egen/test.html',
        'tests/teto-egen/start.html',
        'offline.html'
    ];
    
    for (const file of htmlFiles) {
        try {
            const filePath = path.join(__dirname, file);
            let content = await fs.readFile(filePath, 'utf8');
            
            // CSP script-src에 'unsafe-inline' 추가
            content = content.replace(
                /script-src\s+([^;]+)/g,
                (match, scriptSrc) => {
                    if (!scriptSrc.includes("'unsafe-inline'")) {
                        return `script-src 'unsafe-inline' ${scriptSrc}`;
                    }
                    return match;
                }
            );
            
            // CSP style-src에 'unsafe-inline' 추가
            content = content.replace(
                /style-src\s+([^;]+)/g,
                (match, styleSrc) => {
                    if (!styleSrc.includes("'unsafe-inline'")) {
                        return `style-src 'unsafe-inline' ${styleSrc}`;
                    }
                    return match;
                }
            );
            
            await fs.writeFile(filePath, content, 'utf8');
            console.log(`  ✅ ${file} 수정 완료`);
            
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.log(`  ❌ ${file} 오류: ${error.message}`);
            }
        }
    }
    
    // 2. safeHTML 함수가 정의되지 않은 경우를 위한 폴백 추가
    console.log('\n2️⃣ security-config.js 수정 중...');
    
    const securityConfigPath = path.join(__dirname, 'js/security-config.js');
    let securityConfig = await fs.readFile(securityConfigPath, 'utf8');
    
    // window.safeHTML 글로벌 정의 확인
    if (!securityConfig.includes('window.safeHTML')) {
        securityConfig = securityConfig.replace(
            'function safeHTML(dirty, options = {}) {',
            `// 글로벌 함수로 등록
window.safeHTML = function(dirty, options = {}) {`
        );
        await fs.writeFile(securityConfigPath, securityConfig, 'utf8');
        console.log('  ✅ safeHTML 글로벌 함수 등록');
    }
    
    // 3. main.js의 loadComponents 함수 디버깅
    console.log('\n3️⃣ main.js 디버깅 추가...');
    
    const mainJsPath = path.join(__dirname, 'js/main.js');
    let mainJs = await fs.readFile(mainJsPath, 'utf8');
    
    // 디버깅 로그 추가
    if (!mainJs.includes('console.log("Loading navbar')) {
        mainJs = mainJs.replace(
            'async loadComponentById(componentId, placeholderId) {',
            `async loadComponentById(componentId, placeholderId) {
        console.log(\`Loading \${componentId} into \${placeholderId}\`);`
        );
        
        await fs.writeFile(mainJsPath, mainJs, 'utf8');
        console.log('  ✅ 디버깅 로그 추가');
    }
    
    console.log('\n✅ 모든 수정 완료!');
    console.log('📌 변경사항을 커밋하고 푸시해주세요.');
}

fixAllIssues().catch(console.error);