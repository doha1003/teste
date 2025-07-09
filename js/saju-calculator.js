// 사주 계산기 모듈
// lunar-calendar-optimized.js와 함께 사용

// 모듈 임포트 (브라우저 환경)
if (typeof window !== 'undefined') {
    window.SajuCalculator = window.SajuCalculator || {};
}

// 사주 계산 클래스
class SajuCalculator {
    constructor() {
        // 천간 (Heavenly Stems)
        this.HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
        this.HEAVENLY_STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        
        // 지지 (Earthly Branches)
        this.EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
        this.EARTHLY_BRANCHES_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        
        // 오행
        this.FIVE_ELEMENTS = {
            '갑': '목', '을': '목',
            '병': '화', '정': '화',
            '무': '토', '기': '토',
            '경': '금', '신': '금',
            '임': '수', '계': '수'
        };
        
        // 음양
        this.YIN_YANG = {
            '갑': '양', '을': '음',
            '병': '양', '정': '음',
            '무': '양', '기': '음',
            '경': '양', '신': '음',
            '임': '양', '계': '음'
        };
    }

    // 일주 계산 (기준일 방식)
    calculateDayPillar(year, month, day) {
        // 1991년 10월 3일 = 병오일 (확인된 기준)
        const referenceDate = new Date(1991, 9, 3); // 월은 0부터
        const targetDate = new Date(year, month - 1, day);
        
        const daysDiff = Math.floor((targetDate - referenceDate) / (1000 * 60 * 60 * 24));
        
        // 병(2)부터 시작
        let stemIndex = (2 + daysDiff) % 10;
        if (stemIndex < 0) stemIndex += 10;
        
        // 오(6)부터 시작
        let branchIndex = (6 + daysDiff) % 12;
        if (branchIndex < 0) branchIndex += 12;
        
        return {
            stem: this.HEAVENLY_STEMS[stemIndex],
            branch: this.EARTHLY_BRANCHES[branchIndex],
            stemHanja: this.HEAVENLY_STEMS_HANJA[stemIndex],
            branchHanja: this.EARTHLY_BRANCHES_HANJA[branchIndex],
            pillar: this.HEAVENLY_STEMS[stemIndex] + this.EARTHLY_BRANCHES[branchIndex],
            pillarHanja: this.HEAVENLY_STEMS_HANJA[stemIndex] + this.EARTHLY_BRANCHES_HANJA[branchIndex]
        };
    }

    // 년주 계산
    calculateYearPillar(year) {
        // 갑자년(1984)을 기준으로 계산
        const baseYear = 1984;
        const diff = year - baseYear;
        
        let stemIndex = diff % 10;
        let branchIndex = diff % 12;
        
        if (stemIndex < 0) stemIndex += 10;
        if (branchIndex < 0) branchIndex += 12;
        
        return {
            stem: this.HEAVENLY_STEMS[stemIndex],
            branch: this.EARTHLY_BRANCHES[branchIndex],
            stemHanja: this.HEAVENLY_STEMS_HANJA[stemIndex],
            branchHanja: this.EARTHLY_BRANCHES_HANJA[branchIndex],
            pillar: this.HEAVENLY_STEMS[stemIndex] + this.EARTHLY_BRANCHES[branchIndex]
        };
    }

    // 월주 계산
    calculateMonthPillar(year, month, day) {
        const yearStem = this.calculateYearPillar(year).stem;
        const yearStemIndex = this.HEAVENLY_STEMS.indexOf(yearStem);
        
        // 월지 (인월부터 시작)
        const monthBranches = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
        const monthBranch = monthBranches[month - 1];
        
        // 월간 계산
        const monthStemStart = [2, 4, 6, 8, 0]; // 병, 무, 경, 임, 갑
        const startIndex = monthStemStart[yearStemIndex % 5];
        const monthStemIndex = (startIndex + month - 1) % 10;
        
        return {
            stem: this.HEAVENLY_STEMS[monthStemIndex],
            branch: monthBranch,
            stemHanja: this.HEAVENLY_STEMS_HANJA[monthStemIndex],
            branchHanja: this.EARTHLY_BRANCHES_HANJA[this.EARTHLY_BRANCHES.indexOf(monthBranch)],
            pillar: this.HEAVENLY_STEMS[monthStemIndex] + monthBranch
        };
    }

    // 시주 계산
    calculateHourPillar(dayPillar, hour) {
        const dayStem = dayPillar.stem;
        const dayStemIndex = this.HEAVENLY_STEMS.indexOf(dayStem);
        
        // 시지 결정
        const hourBranches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
        const hourIndex = Math.floor((hour + 1) / 2) % 12;
        const hourBranch = hourBranches[hourIndex];
        
        // 시간 결정
        const hourStemStart = [0, 2, 4, 6, 8]; // 갑, 병, 무, 경, 임
        const startIndex = hourStemStart[dayStemIndex % 5];
        const hourStemIndex = (startIndex + hourIndex) % 10;
        
        return {
            stem: this.HEAVENLY_STEMS[hourStemIndex],
            branch: hourBranch,
            stemHanja: this.HEAVENLY_STEMS_HANJA[hourStemIndex],
            branchHanja: this.EARTHLY_BRANCHES_HANJA[this.EARTHLY_BRANCHES.indexOf(hourBranch)],
            pillar: this.HEAVENLY_STEMS[hourStemIndex] + hourBranch
        };
    }

    // 전체 사주 계산
    calculate(year, month, day, hour, gender) {
        const yearPillar = this.calculateYearPillar(year);
        const monthPillar = this.calculateMonthPillar(year, month, day);
        const dayPillar = this.calculateDayPillar(year, month, day);
        const hourPillar = this.calculateHourPillar(dayPillar, hour);
        
        return {
            year: yearPillar,
            month: monthPillar,
            day: dayPillar,
            hour: hourPillar,
            gender: gender,
            summary: {
                korean: `${yearPillar.pillar} ${monthPillar.pillar} ${dayPillar.pillar} ${hourPillar.pillar}`,
                hanja: `${yearPillar.pillarHanja} ${monthPillar.pillarHanja} ${dayPillar.pillarHanja} ${hourPillar.pillarHanja}`
            },
            dayPillar: dayPillar.pillar,
            dayMaster: dayPillar.stem,
            dayElement: this.FIVE_ELEMENTS[dayPillar.stem],
            dayYinYang: this.YIN_YANG[dayPillar.stem]
        };
    }

    // 오행 분석
    analyzeElements(saju) {
        const elementCount = {
            '목': 0, '화': 0, '토': 0, '금': 0, '수': 0
        };
        
        // 천간 오행
        elementCount[this.FIVE_ELEMENTS[saju.year.stem]]++;
        elementCount[this.FIVE_ELEMENTS[saju.month.stem]]++;
        elementCount[this.FIVE_ELEMENTS[saju.day.stem]]++;
        elementCount[this.FIVE_ELEMENTS[saju.hour.stem]]++;
        
        // 지지 오행 (간단화)
        const branchElements = {
            '자': '수', '축': '토', '인': '목', '묘': '목',
            '진': '토', '사': '화', '오': '화', '미': '토',
            '신': '금', '유': '금', '술': '토', '해': '수'
        };
        
        elementCount[branchElements[saju.year.branch]]++;
        elementCount[branchElements[saju.month.branch]]++;
        elementCount[branchElements[saju.day.branch]]++;
        elementCount[branchElements[saju.hour.branch]]++;
        
        return elementCount;
    }
}

// 전역 객체로 내보내기
if (typeof window !== 'undefined') {
    window.SajuCalculator = new SajuCalculator();
}

// CommonJS 내보내기 (Node.js 환경)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SajuCalculator;
}