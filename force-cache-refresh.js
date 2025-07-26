// 캐시를 무시하고 강제로 새로고침하는 스크립트
const timestamp = Date.now();
const jsFiles = [
    'main.js',
    'api-config.js',
    'gemini-api.js',
    'simple-loader.js',
    'daily-fortune-inline.js',
    'saju-fortune-inline.js',
    'tarot-fortune-inline.js',
    'bmi-calculator-inline.js',
    'security-config.js',
    'dom-security.js'
];

console.log('🔄 JavaScript 파일에 타임스탬프 추가하여 캐시 무효화...\n');

jsFiles.forEach(file => {
    console.log(`/js/${file}?v=${timestamp}`);
});

console.log('\n이 URL들을 HTML 파일에서 사용하면 캐시가 무효화됩니다.');