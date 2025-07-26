import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixFormIssues() {
    console.log('🔧 폼 관련 문제 수정 중...\n');
    
    // 1. 일일 운세 - safeHTML 대신 직접 DOM 조작으로 수정
    console.log('1️⃣ 일일 운세 드롭다운 초기화 수정...');
    const dailyPath = path.join(__dirname, 'fortune/daily/index.html');
    let dailyContent = await fs.readFile(dailyPath, 'utf8');
    
    // safeHTML 사용 부분을 직접 DOM 조작으로 변경
    dailyContent = dailyContent.replace(
        `yearSelect.innerHTML = safeHTML('<option value="">연도 선택</option>');`,
        `yearSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '연도 선택';
        yearSelect.appendChild(defaultOption);`
    );
    
    dailyContent = dailyContent.replace(
        `daySelect.innerHTML = safeHTML('<option value="">일 선택</option>');`,
        `daySelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '일 선택';
        daySelect.appendChild(defaultOption);`
    );
    
    await fs.writeFile(dailyPath, dailyContent, 'utf8');
    console.log('  ✅ 일일 운세 수정 완료');
    
    // 2. BMI 계산기에 카드 디자인 적용 확인
    console.log('\n2️⃣ BMI 계산기 결과 카드 디자인 확인...');
    const bmiPath = path.join(__dirname, 'tools/bmi-calculator.html');
    let bmiContent = await fs.readFile(bmiPath, 'utf8');
    
    // fortune-result-cards.css가 포함되어 있는지 확인
    if (!bmiContent.includes('fortune-result-cards.css')) {
        // </head> 전에 추가
        bmiContent = bmiContent.replace(
            '</head>',
            '    <link rel="stylesheet" href="/css/fortune-result-cards.css">\n</head>'
        );
        await fs.writeFile(bmiPath, bmiContent, 'utf8');
        console.log('  ✅ BMI 계산기에 카드 CSS 추가');
    } else {
        console.log('  ℹ️  BMI 계산기에 이미 카드 CSS 있음');
    }
    
    // 3. 타로 운세 결과 표시 문제 확인
    console.log('\n3️⃣ 타로 운세 페이지 확인...');
    const tarotPath = path.join(__dirname, 'fortune/tarot/index.html');
    let tarotContent = await fs.readFile(tarotPath, 'utf8');
    
    if (!tarotContent.includes('fortune-result-cards.css')) {
        tarotContent = tarotContent.replace(
            '</head>',
            '    <link rel="stylesheet" href="/css/fortune-result-cards.css">\n</head>'
        );
        await fs.writeFile(tarotPath, tarotContent, 'utf8');
        console.log('  ✅ 타로 운세에 카드 CSS 추가');
    }
    
    // 4. MBTI 테스트 결과 표시 문제 확인
    console.log('\n4️⃣ MBTI 테스트 페이지 확인...');
    const mbtiPath = path.join(__dirname, 'tests/mbti/index.html');
    let mbtiContent = await fs.readFile(mbtiPath, 'utf8');
    
    if (!mbtiContent.includes('fortune-result-cards.css')) {
        mbtiContent = mbtiContent.replace(
            '</head>',
            '    <link rel="stylesheet" href="/css/fortune-result-cards.css">\n</head>'
        );
        await fs.writeFile(mbtiPath, mbtiContent, 'utf8');
        console.log('  ✅ MBTI 테스트에 카드 CSS 추가');
    }
    
    // MBTI test.html도 확인
    const mbtiTestPath = path.join(__dirname, 'tests/mbti/test.html');
    if (await fs.access(mbtiTestPath).then(() => true).catch(() => false)) {
        let mbtiTestContent = await fs.readFile(mbtiTestPath, 'utf8');
        if (!mbtiTestContent.includes('fortune-result-cards.css')) {
            mbtiTestContent = mbtiTestContent.replace(
                '</head>',
                '    <link rel="stylesheet" href="/css/fortune-result-cards.css">\n</head>'
            );
            await fs.writeFile(mbtiTestPath, mbtiTestContent, 'utf8');
            console.log('  ✅ MBTI test.html에도 카드 CSS 추가');
        }
    }
    
    // 5. 전체 페이지에 fortune-result-cards.css 추가
    console.log('\n5️⃣ 모든 테스트/도구 페이지에 카드 CSS 추가...');
    
    const pagesToCheck = [
        'tests/love-dna/index.html',
        'tests/love-dna/test.html',
        'tests/teto-egen/index.html',
        'tests/teto-egen/test.html',
        'tests/teto-egen/start.html',
        'tools/salary-calculator.html',
        'tools/text-counter.html',
        'fortune/zodiac/index.html',
        'fortune/zodiac-animal/index.html'
    ];
    
    for (const pagePath of pagesToCheck) {
        try {
            const fullPath = path.join(__dirname, pagePath);
            let content = await fs.readFile(fullPath, 'utf8');
            
            if (!content.includes('fortune-result-cards.css')) {
                content = content.replace(
                    '</head>',
                    '    <link rel="stylesheet" href="/css/fortune-result-cards.css">\n</head>'
                );
                await fs.writeFile(fullPath, content, 'utf8');
                console.log(`  ✅ ${pagePath} 수정 완료`);
            }
        } catch (error) {
            console.log(`  ⚠️  ${pagePath} 접근 실패: ${error.message}`);
        }
    }
    
    console.log('\n✅ 폼 관련 문제 수정 완료!');
}

fixFormIssues().catch(console.error);