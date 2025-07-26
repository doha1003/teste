// 모든 HTML 파일에 JavaScript 파일 로드 시 캐시 버스팅 추가
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

const timestamp = Date.now();
let totalFixed = 0;

htmlFiles.forEach(file => {
    const filePath = path.join('C:', 'Users', 'pc', 'teste', file);
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // JavaScript 파일 경로에 타임스탬프 추가
        // 이미 버전이 있으면 업데이트, 없으면 추가
        content = content.replace(
            /(<script[^>]*src=")(\/js\/[^"?]+)(\.js)("[^>]*>)/g,
            (match, p1, p2, p3, p4) => {
                modified = true;
                return `${p1}${p2}${p3}?v=${timestamp}${p4}`;
            }
        );
        
        // 이미 버전이 있는 경우 업데이트
        content = content.replace(
            /(<script[^>]*src=")(\/js\/[^"?]+\.js)\?v=\d+/g,
            (match, p1, p2) => {
                modified = true;
                return `${p1}${p2}?v=${timestamp}`;
            }
        );
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${file} - 캐시 버스팅 추가됨`);
            totalFixed++;
        }
    }
});

console.log(`\n총 ${totalFixed}개 파일에 캐시 버스팅 추가 완료`);