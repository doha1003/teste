const fs = require('fs');
const path = require('path');

// 모든 HTML 파일에 캐시 버스팅 추가
const htmlFiles = [
    'index.html',
    'tests/mbti/index.html',
    'tests/teto-egen/index.html',
    'tests/love-dna/index.html',
    'fortune/daily/index.html',
    'fortune/saju/index.html',
    'fortune/tarot/index.html',
    'fortune/zodiac/index.html',
    'fortune/zodiac-animal/index.html',
    'tools/text-counter.html',
    'tools/bmi-calculator.html',
    'tools/salary-calculator.html',
    'about/index.html',
    'contact/index.html',
    'privacy/index.html',
    'terms/index.html'
];

const version = '20250718';
let updatedCount = 0;

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 캐시 버스팅 추가
        if (content.includes('styles-complete.min.css') && !content.includes('?v=')) {
            content = content.replace(/styles-complete\.min\.css/g, `styles-complete.min.css?v=${version}`);
            
            // 백업 CSS 추가 (아직 없다면)
            if (!content.includes('styles-complete.css') || !content.includes('media="print"')) {
                content = content.replace(
                    /(<link rel="stylesheet" href="[^"]*styles-complete\.min\.css[^"]*">)/,
                    '$1\n    <!-- Backup CSS -->\n    <link rel="stylesheet" href="/css/styles-complete.css" media="print" onload="this.media=\'all\'; this.onload=null;">'
                );
            }
            
            fs.writeFileSync(filePath, content);
            updatedCount++;
            console.log(`✅ 업데이트: ${file}`);
        }
    }
});

console.log(`\n총 ${updatedCount}개 파일 업데이트 완료 (캐시 버스팅 적용)`);