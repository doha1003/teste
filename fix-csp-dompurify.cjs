// CSP 문제 해결 - DOMPurify를 cdn.jsdelivr.net에서 로드하도록 변경
const fs = require('fs');
const path = require('path');

const htmlFiles = [
    'index.html',
    'about/index.html',
    'contact/index.html',
    'faq/index.html',
    'fortune/daily/index.html',
    'fortune/saju/index.html',
    'fortune/tarot/index.html',
    'fortune/zodiac/index.html',
    'fortune/zodiac-animal/index.html',
    'fortune/index.html',
    'privacy/index.html',
    'terms/index.html',
    'tests/love-dna/index.html',
    'tests/love-dna/test.html',
    'tests/mbti/test.html',
    'tests/mbti/index.html',
    'tests/teto-egen/test.html',
    'tests/teto-egen/start.html',
    'tests/teto-egen/index.html',
    'tests/index.html',
    'tools/text-counter.html',
    'tools/index.html',
    'tools/salary-calculator.html',
    'tools/bmi-calculator.html',
    'offline.html',
    '404.html'
];

let totalFixed = 0;

htmlFiles.forEach(file => {
    const filePath = path.join('C:', 'Users', 'pc', 'teste', file);
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // cdnjs.cloudflare.com을 cdn.jsdelivr.net으로 변경
        if (content.includes('cdnjs.cloudflare.com')) {
            content = content.replace(
                /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/dompurify\/3\.0\.6\/purify\.min\.js/g,
                'https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js'
            );
            
            // integrity hash도 업데이트
            content = content.replace(
                /sha512-H\+rglffZ6f5gF7UJgvH4Naa\+fGCgjrHKMgoFOGmcPTRwR6oILo5R\+gtzNrpDp7iMV3udbymBVjkeZGNz1Em4rQ==/g,
                'sha512-H+rglffZ6f5gF7UJgvH4Naa+fGCgjrHKMgoFOGmcPTRwR6oILo5R+gtzNrpDp7iMV3udbymBVjkeZGNz1Em4rQ=='
            );
            
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${file} - DOMPurify CDN 변경됨`);
            totalFixed++;
        }
    }
});

console.log(`\n총 ${totalFixed}개 파일 수정 완료`);