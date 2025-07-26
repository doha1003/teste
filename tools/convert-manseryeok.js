// Convert manseryeok-database.js to compact JSON format
// 만세력 데이터베이스를 컴팩트 JSON 형식으로 변환

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 만세력 데이터 읽기
function convertManseryeokToJSON() {
    console.log('만세력 데이터베이스 변환 시작...');
    
    try {
        // manseryeok-database.js 파일 읽기
        const dbPath = path.join(__dirname, '../js/manseryeok-database.js');
        const dbContent = fs.readFileSync(dbPath, 'utf8');
        
        // window.ManseryeokDatabase 추출
        const dataMatch = dbContent.match(/window\.ManseryeokDatabase\s*=\s*({[\s\S]+});/);
        
        if (!dataMatch) {
            throw new Error('만세력 데이터를 찾을 수 없습니다.');
        }
        
        // eval 대신 Function 생성자 사용 (더 안전)
        const dataString = dataMatch[1];
        const dataFunction = new Function('return ' + dataString);
        const flatData = dataFunction();
        
        // 데이터 구조 변환 (flat -> nested)
        const compactData = {};
        let totalEntries = 0;
        
        // 날짜별 데이터 처리
        for (const dateKey in flatData) {
            const data = flatData[dateKey];
            const year = data.solarYear.toString();
            const month = data.solarMonth.toString();
            const day = data.solarDay.toString();
            
            // 년도별 객체 생성
            if (!compactData[year]) {
                compactData[year] = {};
            }
            
            // 월별 객체 생성
            if (!compactData[year][month]) {
                compactData[year][month] = {};
            }
            
            // 간지 분리 함수
            const splitGanji = (ganji) => {
                if (!ganji || ganji.length !== 2) return { stem: '', branch: '' };
                return { stem: ganji[0], branch: ganji[1] };
            };
            
            // 년/월 간지 추출 (세간법 고려)
            const yearGanji = splitGanji(data.yearGanji);
            const dayGanji = splitGanji(data.dayGanji);
            
            // 월간지는 절기에 따라 결정되므로 복잡한 계산 필요
            // 간단히 년도와 월로부터 추정
            const monthStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
            const monthBranches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
            
            // 필수 데이터만 추출
            compactData[year][month][day] = {
                yg: data.yearGanji,      // 년간지
                dg: data.dayGanji,       // 일간지
                ys: yearGanji.stem,      // 년간
                yb: yearGanji.branch,    // 년지
                ds: dayGanji.stem,       // 일간
                db: dayGanji.branch,     // 일지
                lm: data.lunarMonth,     // 음력월
                ld: data.lunarDay,       // 음력일
                lp: data.isLeapMonth || false  // 윤달여부
            };
            
            totalEntries++;
        }
        
        // JSON 파일로 저장
        const outputPath = path.join(__dirname, '../data/manseryeok-compact.json');
        const outputDir = path.dirname(outputPath);
        
        // 디렉토리 생성
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // JSON 저장
        fs.writeFileSync(outputPath, JSON.stringify(compactData), 'utf8');
        
        // 파일 크기 비교
        const originalSize = fs.statSync(dbPath).size;
        const compactSize = fs.statSync(outputPath).size;
        
        console.log(`✅ 변환 완료!`);
        console.log(`   - 총 데이터 수: ${totalEntries}개`);
        console.log(`   - 원본 크기: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`   - 압축 크기: ${(compactSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`   - 압축률: ${((1 - compactSize / originalSize) * 100).toFixed(1)}%`);
        console.log(`   - 저장 위치: ${outputPath}`);
        
        // 테스트 데이터 출력
        console.log('\n📋 샘플 데이터 (2024년 1월 1일):');
        console.log(JSON.stringify(compactData['2024']['1']['1'], null, 2));
        
    } catch (error) {
        console.error('❌ 변환 실패:', error.message);
        console.error(error.stack);
    }
}

// 실행
convertManseryeokToJSON();