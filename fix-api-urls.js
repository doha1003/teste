import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 정확한 Vercel 프로젝트 URL로 변경
const OLD_URLS = [
    'https://doha-kr-ap.vercel.app/api/fortune',
    'https://doha-kr-api.vercel.app/api/fortune'
];

// doha.kr의 /api 경로를 사용하도록 변경
const NEW_URL = '/api/fortune';

const files = [
    'js/gemini-api.js',
    'js/fortune.js',
    'js/api-config.js',
    'js/tarot.js'
];

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        OLD_URLS.forEach(oldUrl => {
            if (content.includes(oldUrl)) {
                content = content.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), NEW_URL);
                modified = true;
            }
        });
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${file}`);
        } else {
            console.log(`⏭️ Skipped: ${file} (no changes needed)`);
        }
    } else {
        console.log(`❌ Not found: ${file}`);
    }
});

// api-config.js의 manseryeok API도 수정
const apiConfigPath = path.join(__dirname, 'js/api-config.js');
if (fs.existsSync(apiConfigPath)) {
    let content = fs.readFileSync(apiConfigPath, 'utf8');
    
    // manseryeok API URL도 수정
    content = content.replace(
        /https:\/\/doha-kr-api\.vercel\.app\/api\/manseryeok/g,
        '/api/manseryeok'
    );
    
    fs.writeFileSync(apiConfigPath, content, 'utf8');
    console.log('✅ Updated manseryeok API URL in api-config.js');
}

console.log('\n📝 API URLs updated to use relative paths (/api/...)');
console.log('This will work for both doha.kr and Vercel deployments.');