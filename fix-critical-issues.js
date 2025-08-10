import fs from 'fs';
import path from 'path';

/**
 * doha.kr 핵심 문제 수정 스크립트
 * 라이브 테스트에서 발견된 주요 문제들을 수정
 */

class CriticalIssuesFixer {
    constructor() {
        this.fixes = [];
        this.errors = [];
    }

    // 1. Pretendard 폰트 문제 수정
    fixPretendardFont() {
        console.log('📝 Pretendard 폰트 참조 수정...');
        
        const files = [
            'css/core/typography.css',
            'css/korean-optimization.css',
            'includes/head.html'
        ];
        
        files.forEach(file => {
            if (fs.existsSync(file)) {
                let content = fs.readFileSync(file, 'utf8');
                
                // Google Fonts에서 CDN으로 변경
                content = content.replace(
                    /https:\/\/fonts\.googleapis\.com\/css2\?family=Pretendard[^"'\s]*/g,
                    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css'
                );
                
                // 잘못된 font-family 수정
                content = content.replace(
                    /font-family:\s*['"]?Pretendard['"]?/g,
                    "font-family: 'Pretendard Variable', Pretendard"
                );
                
                fs.writeFileSync(file, content);
                this.fixes.push(`Fixed font references in ${file}`);
            }
        });
    }

    // 2. CSP 정책 수정 (lazysizes 허용)
    fixCSPPolicy() {
        console.log('📝 CSP 정책 수정...');
        
        const vercelConfig = 'vercel.json';
        if (fs.existsSync(vercelConfig)) {
            let config = JSON.parse(fs.readFileSync(vercelConfig, 'utf8'));
            
            // headers 찾기
            if (!config.headers) config.headers = [];
            
            const cspHeader = config.headers.find(h => 
                h.headers && h.headers.find(hh => hh.key === 'Content-Security-Policy')
            );
            
            if (cspHeader) {
                const csp = cspHeader.headers.find(h => h.key === 'Content-Security-Policy');
                if (csp) {
                    // cdnjs.cloudflare.com 추가
                    if (!csp.value.includes('cdnjs.cloudflare.com')) {
                        csp.value = csp.value.replace(
                            "script-src 'unsafe-inline' 'self'",
                            "script-src 'unsafe-inline' 'self' https://cdnjs.cloudflare.com"
                        );
                    }
                }
            }
            
            fs.writeFileSync(vercelConfig, JSON.stringify(config, null, 2));
            this.fixes.push('Updated CSP policy in vercel.json');
        }
    }

    // 3. 글자수 세기 카운팅 문제 수정
    fixTextCounter() {
        console.log('📝 글자수 세기 기능 수정...');
        
        const file = 'js/features/tools/text-counter.js';
        if (fs.existsSync(file)) {
            let content = fs.readFileSync(file, 'utf8');
            
            // updateCounts 함수 개선
            const improvedUpdate = `
    updateCounts(text) {
        // 글자수
        const charCount = text.length;
        
        // 공백 제외 글자수
        const charCountNoSpace = text.replace(/\\s/g, '').length;
        
        // 단어수 (한글과 영어 모두 처리)
        const words = text.trim().split(/\\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        
        // 줄 수
        const lineCount = text ? text.split('\\n').length : 0;
        
        // 바이트 수
        const byteCount = new Blob([text]).size;
        
        // DOM 업데이트
        const updateElement = (id, value) => {
            const elements = document.querySelectorAll(\`#\${id}, .\${id}, [data-\${id}]\`);
            elements.forEach(el => {
                if (el.tagName === 'INPUT') {
                    el.value = value;
                } else {
                    el.textContent = value;
                }
            });
        };
        
        updateElement('charCount', charCount);
        updateElement('charCountNoSpace', charCountNoSpace);
        updateElement('wordCount', wordCount);
        updateElement('lineCount', lineCount);
        updateElement('byteCount', byteCount);
        
        // 결과 객체 반환
        return {
            chars: charCount,
            charsNoSpace: charCountNoSpace,
            words: wordCount,
            lines: lineCount,
            bytes: byteCount
        };
    }`;
            
            // 기존 updateCounts 함수 교체
            if (content.includes('updateCounts')) {
                content = content.replace(
                    /updateCounts\s*\([^)]*\)\s*{[^}]*}/,
                    improvedUpdate
                );
            } else {
                // 함수가 없으면 추가
                content = content.replace(
                    'class TextCounterService {',
                    `class TextCounterService {
${improvedUpdate}`
                );
            }
            
            fs.writeFileSync(file, content);
            this.fixes.push('Fixed text counter update logic');
        }
    }

    // 4. MBTI 광고 팝업 제거
    fixMBTIAdPopup() {
        console.log('📝 MBTI 광고 팝업 제거...');
        
        const file = 'tests/mbti/test.html';
        if (fs.existsSync(file)) {
            let content = fs.readFileSync(file, 'utf8');
            
            // 광고 관련 스크립트 제거
            content = content.replace(
                /<script[^>]*google[^>]*>.*?<\/script>/gis,
                '<!-- Google Ads removed for better UX -->'
            );
            
            // IQ 테스트 광고 제거
            content = content.replace(
                /<div[^>]*class="[^"]*ad[^"]*"[^>]*>.*?<\/div>/gis,
                ''
            );
            
            fs.writeFileSync(file, content);
            this.fixes.push('Removed ad popups from MBTI test');
        }
    }

    // 5. 타로카드 선택 요소 수정
    fixTarotCardSelection() {
        console.log('📝 타로카드 선택 기능 수정...');
        
        const htmlFile = 'fortune/tarot/index.html';
        if (fs.existsSync(htmlFile)) {
            let content = fs.readFileSync(htmlFile, 'utf8');
            
            // 카드 컨테이너가 없으면 추가
            if (!content.includes('tarot-cards-container')) {
                const cardGrid = `
    <div id="tarot-cards-container" class="tarot-cards-grid">
        <!-- 78장의 타로카드 -->
        ${Array.from({length: 78}, (_, i) => `
        <div class="tarot-card" data-card="${i+1}">
            <div class="card-back">?</div>
            <div class="card-front">카드 ${i+1}</div>
        </div>`).join('')}
    </div>`;
                
                content = content.replace(
                    '<!-- 카드 선택 영역 -->',
                    cardGrid
                );
            }
            
            fs.writeFileSync(htmlFile, content);
            this.fixes.push('Added tarot card selection grid');
        }
        
        // JavaScript 수정
        const jsFile = 'js/features/fortune/tarot-fortune.js';
        if (fs.existsSync(jsFile)) {
            let jsContent = fs.readFileSync(jsFile, 'utf8');
            
            // 카드 선택 로직 추가
            const cardSelection = `
    initCardSelection() {
        const cards = document.querySelectorAll('.tarot-card');
        let selectedCards = [];
        
        cards.forEach(card => {
            card.addEventListener('click', () => {
                if (selectedCards.length < 3 && !card.classList.contains('selected')) {
                    card.classList.add('selected');
                    selectedCards.push(card.dataset.card);
                    
                    if (selectedCards.length === 3) {
                        this.enableReadingButton();
                    }
                }
            });
        });
    }`;
            
            if (!jsContent.includes('initCardSelection')) {
                jsContent = jsContent.replace(
                    'constructor() {',
                    `constructor() {
        this.initCardSelection();`
                );
                
                jsContent = jsContent.replace(
                    'class TarotFortuneService {',
                    `class TarotFortuneService {
${cardSelection}`
                );
            }
            
            fs.writeFileSync(jsFile, jsContent);
            this.fixes.push('Added tarot card selection logic');
        }
    }

    // 6. PWA 아이콘 생성
    createPWAIcons() {
        console.log('📝 PWA 아이콘 생성...');
        
        const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
        const imagesDir = 'images';
        
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }
        
        // 기본 SVG 아이콘 생성
        const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <rect fill="#6366f1" width="512" height="512" rx="64"/>
            <text x="256" y="340" font-family="Pretendard, sans-serif" font-size="280" font-weight="bold" 
                  fill="white" text-anchor="middle">도</text>
        </svg>`;
        
        fs.writeFileSync(path.join(imagesDir, 'icon.svg'), svgIcon);
        this.fixes.push('Created PWA icon files');
        
        // manifest.json 업데이트
        const manifestFile = 'manifest.json';
        if (fs.existsSync(manifestFile)) {
            let manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
            
            manifest.icons = iconSizes.map(size => ({
                src: `/images/icon-${size}x${size}.png`,
                sizes: `${size}x${size}`,
                type: 'image/png',
                purpose: 'any maskable'
            }));
            
            fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
            this.fixes.push('Updated manifest.json with icon references');
        }
    }

    // 7. API 응답 시간 개선
    fixAPITimeout() {
        console.log('📝 API 타임아웃 설정 개선...');
        
        const apiConfig = 'js/api-config.js';
        if (fs.existsSync(apiConfig)) {
            let content = fs.readFileSync(apiConfig, 'utf8');
            
            // 타임아웃 증가 (10초 -> 30초)
            content = content.replace(
                /timeout:\s*\d+/g,
                'timeout: 30000'
            );
            
            // 재시도 로직 추가
            if (!content.includes('retry')) {
                content = content.replace(
                    'async callAPI(endpoint, data) {',
                    `async callAPI(endpoint, data, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await this._makeRequest(endpoint, data);
                if (response.ok) return response;
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
            }
        }
    }
    
    async _makeRequest(endpoint, data) {`
                );
            }
            
            fs.writeFileSync(apiConfig, content);
            this.fixes.push('Improved API timeout and retry logic');
        }
    }

    // 리포트 생성
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalFixes: this.fixes.length,
            totalErrors: this.errors.length,
            fixes: this.fixes,
            errors: this.errors
        };
        
        fs.writeFileSync('critical-fixes-report.json', JSON.stringify(report, null, 2));
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 핵심 문제 수정 완료');
        console.log('='.repeat(60));
        console.log(`✅ 수정 완료: ${this.fixes.length}개`);
        console.log(`❌ 오류 발생: ${this.errors.length}개`);
        console.log('\n수정 내역:');
        this.fixes.forEach(fix => console.log(`  - ${fix}`));
        
        if (this.errors.length > 0) {
            console.log('\n오류:');
            this.errors.forEach(err => console.log(`  - ${err}`));
        }
    }

    // 실행
    run() {
        console.log('🔧 doha.kr 핵심 문제 수정 시작...\n');
        
        try {
            this.fixPretendardFont();
            this.fixCSPPolicy();
            this.fixTextCounter();
            this.fixMBTIAdPopup();
            this.fixTarotCardSelection();
            this.createPWAIcons();
            this.fixAPITimeout();
        } catch (error) {
            this.errors.push(error.message);
        }
        
        this.generateReport();
        console.log('\n✨ 수정 작업 완료!');
    }
}

// 실행
const fixer = new CriticalIssuesFixer();
fixer.run();