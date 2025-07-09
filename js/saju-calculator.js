// 사주팔자 계산 전용 라이브러리
// 만세력 기반 정확한 사주팔자 계산
// SQL 데이터베이스 기반 정확한 일주 계산

// 만세력 데이터 로드
const manseryeokScript = document.createElement('script');
manseryeokScript.src = '/js/manseryeok-data.js';
document.head.appendChild(manseryeokScript);

// 최적화된 만세력 데이터도 로드
const lunarScript = document.createElement('script');
lunarScript.src = '/js/lunar-calendar-optimized.js';
lunarScript.type = 'module';
document.head.appendChild(lunarScript);

// 천간 (10개)
const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const HEAVENLY_STEMS_ENG = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 지지 (12개)
const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const EARTHLY_BRANCHES_ENG = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 월별 절기 정보 (대략적인 날짜 - 실제로는 매년 다름)
const SEASONAL_DIVISIONS = {
    1: { start: 4, name: '입춘' },  // 2월 4일경 입춘
    2: { start: 6, name: '경칩' },  // 3월 6일경 경칩
    3: { start: 5, name: '청명' },  // 4월 5일경 청명
    4: { start: 5, name: '입하' },  // 5월 5일경 입하
    5: { start: 6, name: '망종' },  // 6월 6일경 망종
    6: { start: 7, name: '소서' },  // 7월 7일경 소서
    7: { start: 8, name: '입추' },  // 8월 8일경 입추
    8: { start: 8, name: '백로' },  // 9월 8일경 백로
    9: { start: 8, name: '한로' },  // 10월 8일경 한로
    10: { start: 8, name: '입동' }, // 11월 8일경 입동
    11: { start: 7, name: '대설' }, // 12월 7일경 대설
    12: { start: 6, name: '소한' }  // 1월 6일경 소한
};

// 오행 관계
const FIVE_ELEMENTS = {
    '갑': '목', '을': '목',
    '병': '화', '정': '화',
    '무': '토', '기': '토',
    '경': '금', '신': '금',
    '임': '수', '계': '수'
};

// 십신 정보
const TEN_GODS = {
    '비견': '자신과 같은 오행',
    '겁재': '자신과 같은 오행(음양 다름)',
    '식신': '자신이 생하는 오행(같은 음양)',
    '상관': '자신이 생하는 오행(다른 음양)',
    '편재': '자신이 극하는 오행(같은 음양)',
    '정재': '자신이 극하는 오행(다른 음양)',
    '편관': '자신을 극하는 오행(같은 음양)',
    '정관': '자신을 극하는 오행(다른 음양)',
    '편인': '자신을 생하는 오행(같은 음양)',
    '정인': '자신을 생하는 오행(다른 음양)'
};

class SajuCalculator {
    constructor() {
        this.baseYear = 1900;
        this.baseYearStem = 6; // 경자년 기준
        this.baseYearBranch = 0;
    }

    // 양력을 음력으로 변환 (간단한 근사치)
    solarToLunar(year, month, day) {
        // 실제 구현에서는 정확한 음력 변환 알고리즘 필요
        // 현재는 대략적인 계산만 수행
        const lunarOffset = Math.floor((year - 1900) * 0.03) + Math.floor(month * 0.9) - 20;
        let lunarDay = day - lunarOffset;
        let lunarMonth = month;
        let lunarYear = year;

        if (lunarDay <= 0) {
            lunarMonth--;
            if (lunarMonth <= 0) {
                lunarMonth = 12;
                lunarYear--;
            }
            lunarDay += 30; // 임시로 30일 가정
        }

        return {
            year: lunarYear,
            month: lunarMonth,
            day: lunarDay
        };
    }

    // 연주 계산 (정확한 만세력 데이터 사용)
    calculateYearPillar(year) {
        // 만세력 데이터에서 직접 가져오기
        if (typeof YEAR_PILLARS !== 'undefined' && YEAR_PILLARS[year]) {
            const yearData = YEAR_PILLARS[year];
            const stemIndex = HEAVENLY_STEMS.indexOf(yearData.stem);
            const branchIndex = EARTHLY_BRANCHES.indexOf(yearData.branch);
            
            return {
                stem: yearData.stem,
                branch: yearData.branch,
                stemIndex,
                branchIndex
            };
        }
        
        // Fallback: 기존 계산 방식
        const yearDiff = year - this.baseYear;
        const stemIndex = (this.baseYearStem + yearDiff) % 10;
        const branchIndex = (this.baseYearBranch + yearDiff) % 12;
        
        return {
            stem: HEAVENLY_STEMS[stemIndex],
            branch: EARTHLY_BRANCHES[branchIndex],
            stemIndex,
            branchIndex
        };
    }

    // 월주 계산 (정확한 절기 고려)
    calculateMonthPillar(year, month, day) {
        const yearPillar = this.calculateYearPillar(year);
        const yearStem = yearPillar.stem;
        
        // 절기에 따른 월주 조정
        let adjustedMonth = month;
        
        // 절기 확인 (실제 절기 데이터가 있으면 사용)
        if (typeof SOLAR_TERMS_2025 !== 'undefined' && year === 2025) {
            // 2025년 절기 데이터 사용
            const targetDate = new Date(year, month - 1, day);
            const terms = Object.entries(SOLAR_TERMS_2025);
            
            for (let i = 0; i < terms.length; i++) {
                const [termName, termDate] = terms[i];
                const nextTermDate = i < terms.length - 1 ? terms[i + 1][1] : new Date(2026, 0, 1);
                
                if (targetDate >= termDate && targetDate < nextTermDate) {
                    // 절기에 따른 월 결정
                    adjustedMonth = Math.floor(i / 2) + 1;
                    if (adjustedMonth > 12) adjustedMonth = 1;
                    break;
                }
            }
        } else {
            // 대략적인 절기 기준
            const seasonalDiv = SEASONAL_DIVISIONS[month - 1] || SEASONAL_DIVISIONS[11];
            if (day < seasonalDiv.start) {
                adjustedMonth = month - 1;
                if (adjustedMonth < 1) adjustedMonth = 12;
            }
        }
        
        // 월간 계산 (연간에 따라 결정)
        const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);
        let monthStemIndex;
        
        if (yearStemIndex % 5 === 0) monthStemIndex = 2; // 갑,기년 - 병인월부터
        else if (yearStemIndex % 5 === 1) monthStemIndex = 4; // 을,경년 - 무인월부터
        else if (yearStemIndex % 5 === 2) monthStemIndex = 6; // 병,신년 - 경인월부터
        else if (yearStemIndex % 5 === 3) monthStemIndex = 8; // 정,임년 - 임인월부터
        else monthStemIndex = 0; // 무,계년 - 갑인월부터
        
        monthStemIndex = (monthStemIndex + adjustedMonth - 1) % 10;
        
        // 월지는 고정 (인월부터 시작)
        const monthBranchIndex = (adjustedMonth + 1) % 12;
        
        return {
            stem: HEAVENLY_STEMS[monthStemIndex],
            branch: EARTHLY_BRANCHES[monthBranchIndex],
            stemIndex: monthStemIndex,
            branchIndex: monthBranchIndex
        };
    }

    // 일주 계산 (정확한 만세력 데이터 사용)
    calculateDayPillar(year, month, day) {
        // 만세력 데이터에서 정확한 일주 계산
        if (typeof calculateAccurateDayPillar === 'function') {
            return calculateAccurateDayPillar(year, month, day);
        }
        
        // 최적화된 만세력 데이터 사용
        if (typeof window.calculateDayPillar === 'function') {
            const result = window.calculateDayPillar(year, month, day);
            if (result) {
                const stemIndex = HEAVENLY_STEMS.indexOf(result.stem);
                const branchIndex = EARTHLY_BRANCHES.indexOf(result.branch);
                return {
                    stem: result.stem,
                    branch: result.branch,
                    stemIndex,
                    branchIndex
                };
            }
        }
        
        // Fallback: 기준일 기반 계산
        // 1991년 10월 3일 = 병오일 (丙午日) 확인된 기준
        const referenceDate = new Date(1991, 9, 3); // 월은 0부터 시작
        const targetDate = new Date(year, month - 1, day);
        
        // 날짜 차이 계산
        const dayDiff = Math.floor((targetDate - referenceDate) / (1000 * 60 * 60 * 24));
        
        // 기준일의 간지 인덱스
        const refStemIndex = 2;   // 병(丙)
        const refBranchIndex = 6; // 오(午)
        
        // 새로운 간지 계산
        const stemIndex = ((refStemIndex + dayDiff) % 10 + 10) % 10;
        const branchIndex = ((refBranchIndex + dayDiff) % 12 + 12) % 12;
        
        return {
            stem: HEAVENLY_STEMS[stemIndex],
            branch: EARTHLY_BRANCHES[branchIndex],
            stemIndex,
            branchIndex
        };
    }

    // 시주 계산
    calculateHourPillar(dayPillar, hour) {
        const dayStem = dayPillar.stem;
        const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem);
        
        // 시간별 지지 (0시부터 2시간 단위)
        const hourBranchIndex = Math.floor((hour + 1) % 24 / 2);
        
        // 일간에 따른 시간 계산
        let hourStemIndex;
        if (dayStemIndex % 5 === 0) hourStemIndex = 0; // 갑,기일
        else if (dayStemIndex % 5 === 1) hourStemIndex = 2; // 을,경일
        else if (dayStemIndex % 5 === 2) hourStemIndex = 4; // 병,신일
        else if (dayStemIndex % 5 === 3) hourStemIndex = 6; // 정,임일
        else hourStemIndex = 8; // 무,계일
        
        hourStemIndex = (hourStemIndex + hourBranchIndex) % 10;
        
        return {
            stem: HEAVENLY_STEMS[hourStemIndex],
            branch: EARTHLY_BRANCHES[hourBranchIndex],
            stemIndex: hourStemIndex,
            branchIndex: hourBranchIndex
        };
    }

    // 십신 계산
    calculateTenGod(myStem, targetStem) {
        const myElement = FIVE_ELEMENTS[myStem];
        const targetElement = FIVE_ELEMENTS[targetStem];
        const myStemIndex = HEAVENLY_STEMS.indexOf(myStem);
        const targetStemIndex = HEAVENLY_STEMS.indexOf(targetStem);
        const isMyYang = myStemIndex % 2 === 0;
        const isTargetYang = targetStemIndex % 2 === 0;
        
        if (myElement === targetElement) {
            if (myStem === targetStem) return '비견';
            return isMyYang === isTargetYang ? '비견' : '겁재';
        }
        
        // 오행 관계에 따른 십신 판단
        const relations = {
            '목': { generate: '화', control: '토', generated: '수', controlled: '금' },
            '화': { generate: '토', control: '금', generated: '목', controlled: '수' },
            '토': { generate: '금', control: '수', generated: '화', controlled: '목' },
            '금': { generate: '수', control: '목', generated: '토', controlled: '화' },
            '수': { generate: '목', control: '화', generated: '금', controlled: '토' }
        };
        
        if (relations[myElement].generate === targetElement) {
            return isMyYang === isTargetYang ? '식신' : '상관';
        }
        if (relations[myElement].control === targetElement) {
            return isMyYang === isTargetYang ? '편재' : '정재';
        }
        if (relations[myElement].controlled === targetElement) {
            return isMyYang === isTargetYang ? '편관' : '정관';
        }
        if (relations[myElement].generated === targetElement) {
            return isMyYang === isTargetYang ? '편인' : '정인';
        }
        
        return '비견';
    }

    // 오행 분석
    analyzeElements(saju) {
        const elements = {
            '목': 0, '화': 0, '토': 0, '금': 0, '수': 0
        };
        
        // 천간 오행
        elements[FIVE_ELEMENTS[saju.yearPillar.stem]]++;
        elements[FIVE_ELEMENTS[saju.monthPillar.stem]]++;
        elements[FIVE_ELEMENTS[saju.dayPillar.stem]]++;
        elements[FIVE_ELEMENTS[saju.hourPillar.stem]]++;
        
        // 지지 오행 (복잡한 계산 - 단순화)
        const branchElements = {
            '자': ['수'], '축': ['토', '금', '수'], '인': ['목', '화', '토'],
            '묘': ['목'], '진': ['토', '목', '수'], '사': ['화', '토', '금'],
            '오': ['화', '토'], '미': ['토', '목', '화'], '신': ['금', '수', '토'],
            '유': ['금'], '술': ['토', '금', '화'], '해': ['수', '목']
        };
        
        [saju.yearPillar.branch, saju.monthPillar.branch, saju.dayPillar.branch, saju.hourPillar.branch]
            .forEach(branch => {
                branchElements[branch].forEach(element => {
                    elements[element] += 0.5;
                });
            });
        
        // 가장 많은/적은 오행 찾기
        let maxElement = '목';
        let minElement = '목';
        let maxCount = elements['목'];
        let minCount = elements['목'];
        
        Object.entries(elements).forEach(([element, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxElement = element;
            }
            if (count < minCount) {
                minCount = count;
                minElement = element;
            }
        });
        
        return {
            elements,
            strongest: maxElement,
            weakest: minElement,
            balance: maxCount - minCount < 3 ? '균형' : '불균형'
        };
    }

    // 전체 사주 계산
    calculateSaju(year, month, day, hour, isLunar = false) {
        let solarDate = { year, month, day };
        
        if (isLunar) {
            // 음력을 양력으로 변환 필요
            console.log('음력 변환은 아직 구현되지 않았습니다.');
        }
        
        const yearPillar = this.calculateYearPillar(solarDate.year);
        const monthPillar = this.calculateMonthPillar(solarDate.year, solarDate.month, solarDate.day);
        const dayPillar = this.calculateDayPillar(solarDate.year, solarDate.month, solarDate.day);
        const hourPillar = this.calculateHourPillar(dayPillar, hour);
        
        // 일주를 기준으로 십신 계산
        const dayMaster = dayPillar.stem;
        const tenGods = {
            year: this.calculateTenGod(dayMaster, yearPillar.stem),
            month: this.calculateTenGod(dayMaster, monthPillar.stem),
            hour: this.calculateTenGod(dayMaster, hourPillar.stem)
        };
        
        const saju = {
            yearPillar,
            monthPillar,
            dayPillar,
            hourPillar,
            tenGods,
            dayMaster
        };
        
        // 오행 분석 추가
        saju.elements = this.analyzeElements(saju);
        
        return saju;
    }
}

// 전역 사용을 위한 인스턴스 생성
const sajuCalculator = new SajuCalculator();