import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function addSimpleLoader() {
    console.log('🔧 simple-loader.js 추가 중...\n');
    
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
    
    const scriptTag = '<script src="/js/simple-loader.js"></script>';
    
    for (const file of htmlFiles) {
        try {
            const filePath = path.join(__dirname, file);
            let content = await fs.readFile(filePath, 'utf8');
            
            // 이미 추가되었는지 확인
            if (content.includes('simple-loader.js')) {
                console.log(`  ⏭️  ${file} - 이미 추가됨`);
                continue;
            }
            
            // main.js 다음에 추가
            if (content.includes('<script src="/js/main.js"></script>')) {
                content = content.replace(
                    '<script src="/js/main.js"></script>',
                    `<script src="/js/main.js"></script>\n    ${scriptTag}`
                );
                await fs.writeFile(filePath, content, 'utf8');
                console.log(`  ✅ ${file} - 추가 완료`);
            } else {
                // main.js가 없으면 </body> 전에 추가
                content = content.replace(
                    '</body>',
                    `    ${scriptTag}\n</body>`
                );
                await fs.writeFile(filePath, content, 'utf8');
                console.log(`  ✅ ${file} - 추가 완료 (body 끝)`);
            }
            
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.log(`  ❌ ${file} 오류: ${error.message}`);
            }
        }
    }
    
    console.log('\n✅ 완료!');
}

addSimpleLoader().catch(console.error);