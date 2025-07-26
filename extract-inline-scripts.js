import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractInlineScripts() {
    console.log('🔧 인라인 스크립트 추출 및 CSP 해시 생성...\n');
    
    const htmlFiles = [
        'index.html',
        'fortune/daily/index.html',
        'fortune/saju/index.html',
        'fortune/tarot/index.html'
    ];
    
    const results = [];
    
    for (const file of htmlFiles) {
        const filePath = path.join(__dirname, file);
        console.log(`\n📄 처리 중: ${file}`);
        
        try {
            let content = await fs.readFile(filePath, 'utf8');
            
            // 인라인 스크립트 찾기
            const scriptRegex = /<script(?:\s+[^>]*)?>([^<]+)<\/script>/g;
            const inlineScripts = [];
            let match;
            
            while ((match = scriptRegex.exec(content)) !== null) {
                const scriptContent = match[1].trim();
                
                // src 속성이 없는 경우만 (인라인 스크립트)
                if (!match[0].includes('src=') && scriptContent.length > 0) {
                    // SHA-256 해시 생성
                    const hash = crypto
                        .createHash('sha256')
                        .update(scriptContent, 'utf8')
                        .digest('base64');
                    
                    inlineScripts.push({
                        content: scriptContent.substring(0, 50) + '...',
                        hash: hash,
                        fullMatch: match[0]
                    });
                }
            }
            
            if (inlineScripts.length > 0) {
                console.log(`  ✅ ${inlineScripts.length}개의 인라인 스크립트 발견`);
                
                // CSP 헤더 업데이트
                const cspRegex = /(script-src[^;]+)/;
                const cspMatch = content.match(cspRegex);
                
                if (cspMatch) {
                    let scriptSrc = cspMatch[1];
                    
                    // 해시 추가
                    for (const script of inlineScripts) {
                        const hashString = `'sha256-${script.hash}'`;
                        if (!scriptSrc.includes(hashString)) {
                            scriptSrc += ` ${hashString}`;
                        }
                    }
                    
                    content = content.replace(cspRegex, scriptSrc);
                    
                    // 파일 저장
                    await fs.writeFile(filePath, content, 'utf8');
                    console.log(`  ✅ CSP 헤더 업데이트 완료`);
                }
                
                results.push({
                    file,
                    scripts: inlineScripts
                });
            } else {
                console.log(`  ℹ️  인라인 스크립트 없음`);
            }
            
        } catch (error) {
            console.error(`  ❌ 오류: ${error.message}`);
        }
    }
    
    // 결과 저장
    const report = {
        timestamp: new Date().toISOString(),
        files: results,
        cspHashes: results.flatMap(r => 
            r.scripts.map(s => `'sha256-${s.hash}'`)
        )
    };
    
    await fs.writeFile(
        'inline-scripts-report.json',
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n📊 결과 요약:');
    console.log(`총 ${results.reduce((sum, r) => sum + r.scripts.length, 0)}개의 인라인 스크립트 처리됨`);
    console.log('\n생성된 CSP 해시들:');
    report.cspHashes.forEach(hash => console.log(hash));
}

extractInlineScripts().catch(console.error);