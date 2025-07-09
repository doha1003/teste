// 사주팔자 계산 전용 라이브러리
// 만세력 기반 정확한 사주팔자 계산

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

// 오행 정보
const FIVE_ELEMENTS = {
    '갑': '목', '을': '목',
    '병': '화', '정': '화',
    '무': '토', '기': '토',
    '경': '금', '신': '금',
    '임': '수', '계': '수'
};

// 십이지지 오행
const BRANCH_ELEMENTS = {
    '자': '수', '축': '토', '인': '목', '묘': '목',
    '진': '토', '사': '화', '오': '화', '미': '토',
    '신': '금', '유': '금', '술': '토', '해': '수'
};

// 십신 계산
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

    // 연주 계산
    calculateYearPillar(year) {
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

    // 월주 계산
    calculateMonthPillar(year, month, day) {
        const yearPillar = this.calculateYearPillar(year);
        
        // 절기에 따른 월주 조정
        const seasonal = SEASONAL_DIVISIONS[month];
        let adjustedMonth = month;
        
        if (seasonal && day < seasonal.start) {
            adjustedMonth = month - 1;
            if (adjustedMonth <= 0) adjustedMonth = 12;
        }

        // 월주 계산 공식
        const monthStemBase = (yearPillar.stemIndex % 5) * 2;
        const monthStemIndex = (monthStemBase + adjustedMonth - 1) % 10;
        const monthBranchIndex = (adjustedMonth + 1) % 12;

        return {
            stem: HEAVENLY_STEMS[monthStemIndex],
            branch: EARTHLY_BRANCHES[monthBranchIndex],
            stemIndex: monthStemIndex,
            branchIndex: monthBranchIndex
        };
    }

    // 일주 계산 (가장 복잡한 부분)
    calculateDayPillar(year, month, day) {
        // 기준일(1900년 1월 1일)부터의 총 일수 계산
        const baseDate = new Date(1900, 0, 1);
        const targetDate = new Date(year, month - 1, day);
        const diffTime = targetDate.getTime() - baseDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // 1900년 1월 1일은 경자일
        const dayStemIndex = (6 + diffDays) % 10; // 경=6 기준
        const dayBranchIndex = (0 + diffDays) % 12; // 자=0 기준

        return {
            stem: HEAVENLY_STEMS[dayStemIndex],
            branch: EARTHLY_BRANCHES[dayBranchIndex],
            stemIndex: dayStemIndex,
            branchIndex: dayBranchIndex
        };
    }

    // 시주 계산
    calculateHourPillar(dayPillar, hour) {
        // 시간을 지지로 변환
        const hourBranch = Math.floor(hour / 2) % 12;
        
        // 시주 천간 계산 (일주에 따라 결정)
        const hourStemBase = (dayPillar.stemIndex % 5) * 2;
        const hourStemIndex = (hourStemBase + hourBranch) % 10;

        return {
            stem: HEAVENLY_STEMS[hourStemIndex],
            branch: EARTHLY_BRANCHES[hourBranch],
            stemIndex: hourStemIndex,
            branchIndex: hourBranch
        };
    }

    // 십신 계산
    calculateTenGods(dayMaster, otherStem) {
        const dayElement = FIVE_ELEMENTS[dayMaster.stem];
        const otherElement = FIVE_ELEMENTS[otherStem];
        
        const dayYinYang = dayMaster.stemIndex % 2; // 0=양, 1=음
        const otherYinYang = HEAVENLY_STEMS.indexOf(otherStem) % 2;

        // 오행 관계 계산
        const elementRelation = this.getElementRelation(dayElement, otherElement);
        const isSameYinYang = dayYinYang === otherYinYang;

        return this.getTenGodName(elementRelation, isSameYinYang);
    }

    // 오행 관계 계산
    getElementRelation(dayElement, otherElement) {
        const generateCycle = { '목': '화', '화': '토', '토': '금', '금': '수', '수': '목' };
        const destructCycle = { '목': '토', '토': '수', '수': '화', '화': '금', '금': '목' };

        if (dayElement === otherElement) return 'same';
        if (generateCycle[dayElement] === otherElement) return 'generate';
        if (generateCycle[otherElement] === dayElement) return 'generated';
        if (destructCycle[dayElement] === otherElement) return 'destroy';
        if (destructCycle[otherElement] === dayElement) return 'destroyed';
        
        return 'neutral';
    }

    // 십신명 결정
    getTenGodName(relation, isSameYinYang) {
        switch (relation) {
            case 'same':
                return isSameYinYang ? '비견' : '겁재';
            case 'generate':
                return isSameYinYang ? '식신' : '상관';
            case 'destroy':
                return isSameYinYang ? '편재' : '정재';
            case 'destroyed':
                return isSameYinYang ? '편관' : '정관';
            case 'generated':
                return isSameYinYang ? '편인' : '정인';
            default:
                return '기타';
        }
    }

    // 사주팔자 완전 계산
    calculateSaju(birthYear, birthMonth, birthDay, birthHour = 12, isLunar = false) {
        let year = birthYear;
        let month = birthMonth;
        let day = birthDay;

        // 음력이면 양력으로 변환
        if (isLunar) {
            const solar = this.lunarToSolar(year, month, day);
            year = solar.year;
            month = solar.month;
            day = solar.day;
        }

        // 사주팔자 계산
        const yearPillar = this.calculateYearPillar(year);
        const monthPillar = this.calculateMonthPillar(year, month, day);
        const dayPillar = this.calculateDayPillar(year, month, day);
        const hourPillar = this.calculateHourPillar(dayPillar, birthHour);

        // 십신 계산
        const tenGods = {
            year: this.calculateTenGods(dayPillar, yearPillar.stem),
            month: this.calculateTenGods(dayPillar, monthPillar.stem),
            day: '일주(본인)',
            hour: this.calculateTenGods(dayPillar, hourPillar.stem)
        };

        // 오행 분석
        const elements = this.analyzeElements([
            yearPillar.stem, monthPillar.stem, dayPillar.stem, hourPillar.stem
        ]);

        return {
            yearPillar,
            monthPillar,
            dayPillar,
            hourPillar,
            tenGods,
            elements,
            dayMaster: dayPillar.stem,
            dayMasterElement: FIVE_ELEMENTS[dayPillar.stem],
            birthInfo: {
                year, month, day, hour: birthHour,
                isLunar
            }
        };
    }

    // 음력을 양력으로 변환 (간단한 근사치)
    lunarToSolar(year, month, day) {
        // 실제로는 정확한 음력-양력 변환 테이블 필요
        const lunarOffset = Math.floor((year - 1900) * 0.03) + Math.floor(month * 0.9) + 20;
        let solarDay = day + lunarOffset;
        let solarMonth = month;
        let solarYear = year;

        // 간단한 월별 일수 조정
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
            daysInMonth[1] = 29; // 윤년
        }

        if (solarDay > daysInMonth[solarMonth - 1]) {
            solarDay -= daysInMonth[solarMonth - 1];
            solarMonth++;
            if (solarMonth > 12) {
                solarMonth = 1;
                solarYear++;
            }
        }

        return {
            year: solarYear,
            month: solarMonth,
            day: solarDay
        };
    }

    // 오행 분석
    analyzeElements(stems) {
        const elementCount = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
        
        stems.forEach(stem => {
            const element = FIVE_ELEMENTS[stem];
            elementCount[element]++;
        });

        // 가장 많은/적은 오행 찾기
        const sortedElements = Object.entries(elementCount)
            .sort((a, b) => b[1] - a[1]);

        return {
            counts: elementCount,
            strongest: sortedElements[0][0],
            weakest: sortedElements[sortedElements.length - 1][0],
            balance: this.calculateBalance(elementCount)
        };
    }

    // 오행 균형 계산
    calculateBalance(elementCount) {
        const total = Object.values(elementCount).reduce((sum, count) => sum + count, 0);
        const average = total / 5;
        const variance = Object.values(elementCount)
            .reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / 5;
        
        return {
            variance: Math.round(variance * 100) / 100,
            balance: variance < 0.5 ? '균형' : variance < 1.5 ? '보통' : '불균형'
        };
    }

    // 사주 해석 생성
    generateInterpretation(saju) {
        const interpretation = {
            dayMaster: this.interpretDayMaster(saju.dayMaster),
            personality: this.interpretPersonality(saju),
            fortune: this.interpretFortune(saju),
            career: this.interpretCareer(saju),
            health: this.interpretHealth(saju),
            relationship: this.interpretRelationship(saju)
        };

        return interpretation;
    }

    // 일주 해석
    interpretDayMaster(dayMaster) {
        const interpretations = {
            '갑': '큰 나무처럼 곧고 굳건한 성격. 리더십이 강하고 정의감이 뛰어남.',
            '을': '꽃과 같이 섬세하고 아름다운 성격. 예술적 재능과 배려심이 풍부.',
            '병': '태양과 같이 밝고 활발한 성격. 열정적이고 사교적임.',
            '정': '촛불과 같이 따뜻하고 온화한 성격. 봉사정신과 인내심이 강함.',
            '무': '높은 산과 같이 안정적이고 신뢰할 수 있는 성격. 책임감이 강함.',
            '기': '기름진 땅과 같이 포용력이 큰 성격. 현실적이고 실용적임.',
            '경': '쇠와 같이 강하고 예리한 성격. 의지가 강하고 결단력이 있음.',
            '신': '보석과 같이 세련되고 품격 있는 성격. 완벽주의 성향이 강함.',
            '임': '바다와 같이 포용력이 크고 유연한 성격. 지혜롭고 통찰력이 뛰어남.',
            '계': '이슬과 같이 순수하고 깨끗한 성격. 섬세하고 직관력이 뛰어남.'
        };

        return interpretations[dayMaster] || '특별한 기운을 가진 분입니다.';
    }

    // 성격 해석
    interpretPersonality(saju) {
        const dayElement = FIVE_ELEMENTS[saju.dayMaster];
        const strongElement = saju.elements.strongest;
        
        let personality = '';
        
        if (dayElement === strongElement) {
            personality = '자신의 본성이 강하게 드러나는 타입입니다. ';
        } else {
            personality = `${strongElement} 기운의 영향을 많이 받는 타입입니다. `;
        }

        // 십신 분석 추가
        const tenGodCounts = Object.values(saju.tenGods).reduce((acc, god) => {
            acc[god] = (acc[god] || 0) + 1;
            return acc;
        }, {});

        const dominantGod = Object.entries(tenGodCounts)
            .sort((a, b) => b[1] - a[1])[0][0];

        personality += this.getTenGodPersonality(dominantGod);

        return personality;
    }

    // 십신별 성격 해석
    getTenGodPersonality(tenGod) {
        const personalities = {
            '비견': '독립적이고 자주적인 성격입니다.',
            '겁재': '협력적이고 사교적인 성격입니다.',
            '식신': '창의적이고 예술적인 성격입니다.',
            '상관': '표현력이 뛰어나고 개성이 강합니다.',
            '편재': '활동적이고 적극적인 성격입니다.',
            '정재': '신중하고 안정을 추구하는 성격입니다.',
            '편관': '도전적이고 역동적인 성격입니다.',
            '정관': '책임감이 강하고 질서를 중시합니다.',
            '편인': '직관적이고 신비로운 면이 있습니다.',
            '정인': '학구적이고 지적인 성격입니다.'
        };

        return personalities[tenGod] || '균형잡힌 성격을 가지고 있습니다.';
    }

    // 운세 해석
    interpretFortune(saju) {
        const balance = saju.elements.balance.balance;
        const dayElement = FIVE_ELEMENTS[saju.dayMaster];
        
        let fortune = '';
        
        if (balance === '균형') {
            fortune = '오행이 균형잡혀 있어 안정된 운세를 보입니다. ';
        } else if (balance === '불균형') {
            fortune = '오행의 편차가 있어 기복이 있는 운세입니다. ';
        }

        // 계절별 운세 (간단한 예시)
        const currentMonth = new Date().getMonth() + 1;
        const seasonFortune = this.getSeasonFortune(dayElement, currentMonth);
        
        return fortune + seasonFortune;
    }

    // 계절별 운세
    getSeasonFortune(dayElement, month) {
        const seasons = {
            '봄': [3, 4, 5],
            '여름': [6, 7, 8],
            '가을': [9, 10, 11],
            '겨울': [12, 1, 2]
        };

        let currentSeason = '';
        for (const [season, months] of Object.entries(seasons)) {
            if (months.includes(month)) {
                currentSeason = season;
                break;
            }
        }

        const seasonElements = {
            '봄': '목',
            '여름': '화',
            '가을': '금',
            '겨울': '수'
        };

        const seasonElement = seasonElements[currentSeason];
        
        if (dayElement === seasonElement) {
            return `현재 ${currentSeason}철은 당신의 본래 기운과 잘 맞아 좋은 운세입니다.`;
        } else {
            const relation = this.getElementRelation(dayElement, seasonElement);
            if (relation === 'generate') {
                return `현재 ${currentSeason}철은 당신의 기운을 북돋아주는 시기입니다.`;
            } else if (relation === 'destroy') {
                return `현재 ${currentSeason}철은 조금 신중하게 행동하는 것이 좋겠습니다.`;
            }
        }
        
        return `현재 ${currentSeason}철은 평온한 운세를 보입니다.`;
    }

    // 직업 해석
    interpretCareer(saju) {
        const dayElement = FIVE_ELEMENTS[saju.dayMaster];
        const strongElement = saju.elements.strongest;
        
        const careerByElement = {
            '목': '교육, 출판, 환경, 농업, 섬유 관련 분야',
            '화': '요식업, 전기, 에너지, 엔터테인먼트, 광고 분야',
            '토': '부동산, 건설, 농업, 세라믹, 보험 분야',
            '금': '금융, 기계, 자동차, 의료, 법률 분야',
            '수': '운송, 물류, 화학, 통신, 수산업 분야'
        };

        return `${careerByElement[dayElement]} 또는 ${careerByElement[strongElement]}에 적성이 있습니다.`;
    }

    // 건강 해석
    interpretHealth(saju) {
        const dayElement = FIVE_ELEMENTS[saju.dayMaster];
        const weakElement = saju.elements.weakest;
        
        const healthByElement = {
            '목': '간, 담낭, 근육, 신경계',
            '화': '심장, 소장, 혈관, 정신',
            '토': '위, 비장, 소화기, 근육',
            '금': '폐, 대장, 호흡기, 피부',
            '수': '신장, 방광, 생식기, 골수'
        };

        return `${healthByElement[dayElement]} 건강에 특히 신경쓰시고, ${healthByElement[weakElement]} 부분을 보강하시면 좋겠습니다.`;
    }

    // 인간관계 해석
    interpretRelationship(saju) {
        const tenGods = Object.values(saju.tenGods);
        const hasJeongja = tenGods.includes('정재');
        const hasGeopjae = tenGods.includes('겁재');
        
        let relationship = '';
        
        if (hasJeongja) {
            relationship += '배우자와의 인연이 깊고 안정적인 관계를 유지할 수 있습니다. ';
        }
        
        if (hasGeopjae) {
            relationship += '친구들과의 우정이 돈독하고 협력적인 관계를 잘 만들어갑니다. ';
        }
        
        return relationship || '균형잡힌 인간관계를 유지하시는 분입니다.';
    }
}

// 전역 인스턴스 생성
const sajuCalculator = new SajuCalculator();