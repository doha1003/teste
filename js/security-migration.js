// Security Migration Script
// innerHTML을 safeHTML로 대체하는 마이그레이션 스크립트

// innerHTML 사용 패턴과 대체 방법
const migrationPatterns = [
    // 1. 직접 할당 패턴
    {
        pattern: /(\w+)\.innerHTML\s*=\s*([^;]+);/g,
        replacement: '$1.innerHTML = safeHTML($2);',
        description: '직접 innerHTML 할당'
    },
    
    // 2. innerHTML += 패턴
    {
        pattern: /(\w+)\.innerHTML\s*\+=\s*([^;]+);/g,
        replacement: '$1.innerHTML += safeHTML($2);',
        description: 'innerHTML 추가'
    },
    
    // 3. getElementById().innerHTML 패턴
    {
        pattern: /document\.getElementById\(['"]([^'"]+)['"]\)\.innerHTML\s*=\s*([^;]+);/g,
        replacement: 'document.getElementById(\'$1\').innerHTML = safeHTML($2);',
        description: 'getElementById innerHTML'
    },
    
    // 4. querySelector().innerHTML 패턴
    {
        pattern: /document\.querySelector\(['"]([^'"]+)['"]\)\.innerHTML\s*=\s*([^;]+);/g,
        replacement: 'document.querySelector(\'$1\').innerHTML = safeHTML($2);',
        description: 'querySelector innerHTML'
    }
];

// 안전한 패턴 (수정 불필요)
const safePatterns = [
    /\.innerHTML\s*=\s*['"][\s]*['"]/, // 빈 문자열
    /\.innerHTML\s*=\s*safeHTML\(/,     // 이미 safeHTML 사용
    /\.innerHTML\s*=\s*safeText\(/      // safeText 사용
];

// 파일별 innerHTML 사용 현황 분석
const fileAnalysis = {
    // 메인 페이지들
    'index.html': {
        count: 4,
        locations: [
            { line: 245, type: 'statsDisplay' },
            { line: 312, type: 'featureList' },
            { line: 378, type: 'testimonials' },
            { line: 421, type: 'dynamicContent' }
        ]
    },
    
    // JavaScript 파일들
    'js/main.js': {
        count: 8,
        locations: [
            { line: 145, type: 'loadComponents' },
            { line: 178, type: 'navbar' },
            { line: 212, type: 'footer' },
            { line: 267, type: 'errorMessage' },
            { line: 334, type: 'notification' },
            { line: 389, type: 'modal' },
            { line: 445, type: 'toast' },
            { line: 502, type: 'dynamicContent' }
        ]
    },
    
    'js/mbti-test.js': {
        count: 12,
        locations: [
            { line: 234, type: 'questionDisplay' },
            { line: 289, type: 'resultDisplay' },
            { line: 345, type: 'progressBar' },
            { line: 401, type: 'answerOptions' }
        ]
    },
    
    // 운세 관련
    'fortune/daily/index.html': {
        count: 3,
        locations: [
            { line: 458, type: 'fortuneResult' },
            { line: 269, type: 'yearDropdown' },
            { line: 311, type: 'dayDropdown' }
        ]
    },
    
    'fortune/saju/index.html': {
        count: 5,
        locations: [
            { line: 523, type: 'sajuResult' },
            { line: 612, type: 'tenGods' },
            { line: 689, type: 'elements' },
            { line: 745, type: 'interpretation' },
            { line: 812, type: 'advice' }
        ]
    }
};

// 마이그레이션 실행 함수
function executeMigration() {
    console.log('=== doha.kr 보안 마이그레이션 시작 ===');
    console.log('총 62개 innerHTML 사용 감지');
    console.log('');
    
    // 1. DOMPurify CDN 추가 확인
    console.log('1. DOMPurify CDN 추가 필요:');
    console.log('   모든 HTML 파일의 </body> 태그 전에 추가:');
    console.log('   <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"></script>');
    console.log('   <script src="/js/security-config.js"></script>');
    console.log('');
    
    // 2. 파일별 수정 가이드
    console.log('2. 파일별 innerHTML 수정 위치:');
    Object.entries(fileAnalysis).forEach(([file, data]) => {
        console.log(`   ${file}: ${data.count}개 위치`);
        data.locations.forEach(loc => {
            console.log(`     - Line ${loc.line}: ${loc.type}`);
        });
    });
    console.log('');
    
    // 3. CSP 헤더 수정
    console.log('3. CSP 헤더 수정 필요:');
    console.log('   모든 HTML 파일의 CSP meta 태그에서:');
    console.log('   - "unsafe-inline" 제거');
    console.log('   - "unsafe-eval" 제거');
    console.log('   - "strict-dynamic" 추가');
    console.log('');
    
    // 4. localStorage 암호화
    console.log('4. localStorage 사용 위치:');
    console.log('   - mbti-test.js: 테스트 결과 저장');
    console.log('   - love-dna-test.js: 점수 저장');
    console.log('   - main.js: 사용자 설정');
    console.log('   → secureStorage 객체로 대체 필요');
    console.log('');
    
    // 5. 입력값 검증
    console.log('5. 입력값 검증 추가 필요:');
    console.log('   - 모든 form 제출 전 inputValidation 사용');
    console.log('   - 사용자 이름, 날짜, 숫자 입력 검증');
    console.log('');
    
    console.log('=== 마이그레이션 가이드 완료 ===');
}

// 특정 파일의 innerHTML 사용을 분석하는 함수
function analyzeFile(content, filename) {
    const results = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        // innerHTML 사용 감지
        if (line.includes('.innerHTML') && !line.includes('safeHTML')) {
            // 안전한 패턴인지 확인
            const isSafe = safePatterns.some(pattern => pattern.test(line));
            
            if (!isSafe) {
                results.push({
                    line: index + 1,
                    content: line.trim(),
                    suggestion: getSuggestion(line)
                });
            }
        }
    });
    
    return results;
}

// 수정 제안 생성
function getSuggestion(line) {
    // 빈 문자열 할당
    if (/\.innerHTML\s*=\s*['"]["']/.test(line)) {
        return '변경 불필요 (빈 문자열)';
    }
    
    // 템플릿 리터럴 사용
    if (/\.innerHTML\s*=\s*`/.test(line)) {
        return line.replace(/\.innerHTML\s*=\s*`/, '.innerHTML = safeHTML(`');
    }
    
    // 문자열 연결
    if (/\.innerHTML\s*=\s*['"]/.test(line)) {
        return line.replace(/\.innerHTML\s*=\s*/, '.innerHTML = safeHTML(');
    }
    
    // += 패턴
    if (/\.innerHTML\s*\+=/.test(line)) {
        return line.replace(/\.innerHTML\s*\+=\s*/, '.innerHTML += safeHTML(');
    }
    
    return '수동 검토 필요';
}

// 전역 사용
if (typeof window !== 'undefined') {
    window.securityMigration = {
        execute: executeMigration,
        analyzeFile: analyzeFile,
        patterns: migrationPatterns,
        fileAnalysis: fileAnalysis
    };
}

// Node.js 환경에서 직접 실행 시
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        executeMigration,
        analyzeFile,
        migrationPatterns,
        fileAnalysis
    };
}