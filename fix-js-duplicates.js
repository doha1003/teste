const fs = require('fs');
const path = require('path');

// 중복 JavaScript 로딩 문제 해결
const htmlFiles = [
    'tests/mbti/index.html',
    'tests/teto-egen/index.html',
    'tests/love-dna/index.html'
];

let fixedCount = 0;

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // main.js와 main.min.js 모두 있는 경우, main.js 제거
        if (content.includes('/js/main.js') && content.includes('/js/main.min.js')) {
            content = content.replace(/<script src="\/js\/main\.js"[^>]*><\/script>\s*/g, '');
            fs.writeFileSync(filePath, content);
            fixedCount++;
            console.log(`✅ ${file}: main.js 중복 제거 완료`);
        }
        
        // love-dna 페이지에 main.min.js 추가 (main.js만 있음)
        if (file === 'tests/love-dna/index.html' && content.includes('/js/main.js') && !content.includes('/js/main.min.js')) {
            content = content.replace('/js/main.js', '/js/main.min.js');
            fs.writeFileSync(filePath, content);
            fixedCount++;
            console.log(`✅ ${file}: main.js를 main.min.js로 변경`);
        }
    }
});

console.log(`\n총 ${fixedCount}개 파일 수정 완료`);