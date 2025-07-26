import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixCSPHeaders() {
    console.log('🔧 CSP 헤더 수정 시작...\n');
    
    // HTML 파일 찾기
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
        'tests/personality/index.html',
        'tests/love-style/index.html',
        'tools/bmi-calculator.html',
        'tools/text-counter.html',
        'tools/salary-calculator.html',
        'tools/age-calculator.html',
        'tools/word-cloud.html',
        'tools/unit-converter.html',
        'about/index.html',
        'contact/index.html',
        'privacy/index.html',
        'terms/index.html',
        'portfolio/index.html',
        'insights/index.html',
        'community/index.html'
    ];
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const file of htmlFiles) {
        const filePath = path.join(__dirname, file);
        
        try {
            let content = await fs.readFile(filePath, 'utf8');
            const originalContent = content;
            
            // CSP 헤더 찾기 및 수정
            const cspRegex = /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/g;
            
            content = content.replace(cspRegex, (match, cspContent) => {
                // script-src에 cdnjs.cloudflare.com 추가
                let newCsp = cspContent;
                
                // script-src 섹션 찾기
                const scriptSrcMatch = newCsp.match(/script-src\s+([^;]+)/);
                if (scriptSrcMatch) {
                    const scriptSrcValue = scriptSrcMatch[1];
                    
                    // cdnjs.cloudflare.com이 없으면 추가
                    if (!scriptSrcValue.includes('cdnjs.cloudflare.com')) {
                        const updatedScriptSrc = scriptSrcValue.trim() + ' https://cdnjs.cloudflare.com';
                        newCsp = newCsp.replace(/script-src\s+[^;]+/, `script-src ${updatedScriptSrc}`);
                    }
                    
                    // cdn.jsdelivr.net도 확인하고 추가
                    if (!newCsp.includes('cdn.jsdelivr.net')) {
                        const scriptSrcMatch2 = newCsp.match(/script-src\s+([^;]+)/);
                        if (scriptSrcMatch2) {
                            const updatedScriptSrc = scriptSrcMatch2[1].trim() + ' https://cdn.jsdelivr.net';
                            newCsp = newCsp.replace(/script-src\s+[^;]+/, `script-src ${updatedScriptSrc}`);
                        }
                    }
                }
                
                return `<meta http-equiv="Content-Security-Policy" content="${newCsp}"`;
            });
            
            // 변경사항이 있으면 저장
            if (content !== originalContent) {
                await fs.writeFile(filePath, content, 'utf8');
                console.log(`✅ 수정됨: ${file}`);
                fixedCount++;
            } else {
                console.log(`⏭️  변경 없음: ${file}`);
            }
            
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log(`⚠️  파일 없음: ${file}`);
            } else {
                console.error(`❌ 오류: ${file} - ${error.message}`);
                errorCount++;
            }
        }
    }
    
    console.log(`\n📊 결과: ${fixedCount}개 파일 수정, ${errorCount}개 오류`);
}

// 실행
fixCSPHeaders().catch(console.error);