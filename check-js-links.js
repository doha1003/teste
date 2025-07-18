const fs = require('fs');
const path = require('path');

// 모든 HTML 파일 체크
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

let issues = [];

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 파일별 체크
        const checks = {
            hasMainJS: content.includes('main.min.js') || content.includes('main.js'),
            hasNavbarPlaceholder: content.includes('navbar-placeholder'),
            hasFooterPlaceholder: content.includes('footer-placeholder'),
            hasCSS: content.includes('styles-complete.min.css') || content.includes('styles-complete.css'),
            hasJSErrors: false
        };
        
        // JavaScript 링크 패턴 확인
        const jsLinks = content.match(/<script[^>]*src="[^"]*"[^>]*>/g) || [];
        const brokenJSLinks = jsLinks.filter(link => {
            return link.includes('../js/') || link.includes('./js/') || link.includes('undefined');
        });
        
        if (brokenJSLinks.length > 0) {
            checks.hasJSErrors = true;
            checks.brokenLinks = brokenJSLinks;
        }
        
        // CSS 링크 확인
        const cssLinks = content.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || [];
        const relativeCSSLinks = cssLinks.filter(link => {
            return link.includes('../css/') || link.includes('./css/');
        });
        
        if (relativeCSSLinks.length > 0) {
            checks.hasCSSErrors = true;
            checks.relativeCSSLinks = relativeCSSLinks;
        }
        
        // 모든 체크 결과
        checks.allJSLinks = jsLinks;
        checks.allCSSLinks = cssLinks;
        
        console.log(`\n📄 ${file}:`);
        console.log(`  ✅ CSS: ${checks.hasCSS ? '있음' : '❌ 없음'}`);
        console.log(`  ✅ Main JS: ${checks.hasMainJS ? '있음' : '❌ 없음'}`);
        console.log(`  ✅ Navbar: ${checks.hasNavbarPlaceholder ? '있음' : '❌ 없음'}`);
        console.log(`  ✅ Footer: ${checks.hasFooterPlaceholder ? '있음' : '❌ 없음'}`);
        
        if (checks.hasJSErrors) {
            console.log(`  ❌ JS 문제: ${checks.brokenLinks.join(', ')}`);
            issues.push({ file, type: 'JS', links: checks.brokenLinks });
        }
        
        if (checks.hasCSSErrors) {
            console.log(`  ❌ CSS 상대경로: ${checks.relativeCSSLinks.join(', ')}`);
            issues.push({ file, type: 'CSS', links: checks.relativeCSSLinks });
        }
        
        // JS 파일 목록
        if (jsLinks.length > 0) {
            console.log(`  📝 JS 파일들: ${jsLinks.length}개`);
            jsLinks.forEach(link => {
                const src = link.match(/src="([^"]*)"/) ;
                if (src) console.log(`    - ${src[1]}`);
            });
        }
        
    } else {
        console.log(`❌ 파일 없음: ${file}`);
        issues.push({ file, type: 'MISSING' });
    }
});

console.log('\n📊 요약:');
console.log(`총 ${htmlFiles.length}개 파일 중 ${htmlFiles.length - issues.filter(i => i.type === 'MISSING').length}개 존재`);
console.log(`문제 발견: ${issues.length}개`);

if (issues.length > 0) {
    console.log('\n🚨 문제 목록:');
    issues.forEach(issue => {
        console.log(`  - ${issue.file}: ${issue.type} 문제`);
        if (issue.links) {
            issue.links.forEach(link => console.log(`    ${link}`));
        }
    });
}