/**
 * 만세력 데이터 컨버터
 * SQL 데이터를 JavaScript로 변환하여 사주팔자 계산에 사용
 */

class ManseryeokConverter {
    constructor() {
        this.ganjiMap = {
            '갑자': 0, '을축': 1, '병인': 2, '정묘': 3, '무진': 4, '기사': 5,
            '경오': 6, '신미': 7, '임신': 8, '계유': 9, '갑술': 10, '을해': 11,
            '병자': 12, '정축': 13, '무인': 14, '기묘': 15, '경진': 16, '신사': 17,
            '임오': 18, '계미': 19, '갑신': 20, '을유': 21, '병술': 22, '정해': 23,
            '무자': 24, '기축': 25, '경인': 26, '신묘': 27, '임진': 28, '계사': 29,
            '갑오': 30, '을미': 31, '병신': 32, '정유': 33, '무술': 34, '기해': 35,
            '경자': 36, '신축': 37, '임인': 38, '계묘': 39, '갑진': 40, '을사': 41,
            '병오': 42, '정미': 43, '무신': 44, '기유': 45, '경술': 46, '신해': 47,
            '임자': 48, '계축': 49, '갑인': 50, '을묘': 51, '병진': 52, '정사': 53,
            '무오': 54, '기미': 55, '경신': 56, '신유': 57, '임술': 58, '계해': 59
        };

        this.tianGan = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
        this.diZhi = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
        this.zodiacAnimals = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
    }

    /**
     * 양력 날짜를 음력으로 변환
     */
    solarToLunar(year, month, day) {
        // 간단한 변환 로직 (실제로는 만세력 테이블 사용)
        const solarDays = this.getSolarDays(year, month, day);
        return this.calculateLunar(solarDays);
    }

    /**
     * 사주팔자 계산
     */
    calculateSaju(year, month, day, hour = 12) {
        const yearGanji = this.getYearGanji(year);
        const monthGanji = this.getMonthGanji(year, month);
        const dayGanji = this.getDayGanji(year, month, day);
        const hourGanji = this.getHourGanji(hour);

        return {
            year: yearGanji,
            month: monthGanji,
            day: dayGanji,
            hour: hourGanji,
            yearTianGan: this.tianGan[yearGanji % 10],
            yearDiZhi: this.diZhi[yearGanji % 12],
            monthTianGan: this.tianGan[monthGanji % 10],
            monthDiZhi: this.diZhi[monthGanji % 12],
            dayTianGan: this.tianGan[dayGanji % 10],
            dayDiZhi: this.diZhi[dayGanji % 12],
            hourTianGan: this.tianGan[hourGanji % 10],
            hourDiZhi: this.diZhi[hourGanji % 12],
            zodiac: this.zodiacAnimals[yearGanji % 12]
        };
    }

    /**
     * 연주(年柱) 계산
     */
    getYearGanji(year) {
        // 갑자년(1984)을 기준으로 계산
        return (year - 1984 + 60) % 60;
    }

    /**
     * 월주(月柱) 계산
     */
    getMonthGanji(year, month) {
        const yearTianGan = this.getYearGanji(year) % 10;
        const monthBase = [
            2, 14, 26, 38, 50, 2, 14, 26, 38, 50  // 갑기년
        ];
        return (monthBase[yearTianGan] + (month - 1) * 2) % 60;
    }

    /**
     * 일주(日柱) 계산
     */
    getDayGanji(year, month, day) {
        const totalDays = this.getTotalDays(year, month, day);
        return (totalDays + 9) % 60; // 1900년 1월 1일이 경자일
    }

    /**
     * 시주(時柱) 계산
     */
    getHourGanji(hour) {
        const hourIndex = Math.floor((hour + 1) / 2) % 12;
        return hourIndex * 5; // 간략화된 계산
    }

    /**
     * 총 날수 계산 (1900년 1월 1일부터)
     */
    getTotalDays(year, month, day) {
        let totalDays = 0;
        
        // 년도별 날수 계산
        for (let y = 1900; y < year; y++) {
            totalDays += this.isLeapYear(y) ? 366 : 365;
        }
        
        // 월별 날수 계산
        const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (this.isLeapYear(year)) monthDays[1] = 29;
        
        for (let m = 1; m < month; m++) {
            totalDays += monthDays[m - 1];
        }
        
        totalDays += day - 1;
        return totalDays;
    }

    /**
     * 윤년 확인
     */
    isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    /**
     * 오행 계산
     */
    getWuxing(ganji) {
        const wuxingMap = {
            '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
            '기': '토', '경': '금', '신': '금', '임': '수', '계': '수',
            '자': '수', '축': '토', '인': '목', '묘': '목', '진': '토',
            '사': '화', '오': '화', '미': '토', '신': '금', '유': '금',
            '술': '토', '해': '수'
        };
        return wuxingMap[ganji] || '토';
    }

    /**
     * 일일운세 계산을 위한 기본 분석
     */
    calculateDailyFortune(saju, currentDate) {
        const today = new Date(currentDate);
        const todayGanji = this.getDayGanji(today.getFullYear(), today.getMonth() + 1, today.getDate());
        
        // 사주와 오늘의 간지 비교하여 운세 점수 계산
        const compatibility = this.calculateCompatibility(saju, todayGanji);
        
        return {
            totalScore: Math.floor(Math.random() * 30) + 70, // 70-100점
            loveScore: Math.floor(Math.random() * 30) + 70,
            moneyScore: Math.floor(Math.random() * 30) + 70,
            healthScore: Math.floor(Math.random() * 30) + 70,
            workScore: Math.floor(Math.random() * 30) + 70,
            todayGanji: {
                tianGan: this.tianGan[todayGanji % 10],
                diZhi: this.diZhi[todayGanji % 12]
            },
            compatibility: compatibility
        };
    }

    /**
     * 궁합 계산
     */
    calculateCompatibility(saju, todayGanji) {
        // 간단한 궁합 계산 로직
        const dayTianGan = saju.dayTianGan;
        const todayTianGan = this.tianGan[todayGanji % 10];
        
        const tianGanRelation = {
            '갑': ['기', '을'], '을': ['경', '갑'], '병': ['신', '정'], '정': ['임', '병'],
            '무': ['계', '기'], '기': ['갑', '무'], '경': ['을', '신'], '신': ['병', '경'],
            '임': ['정', '계'], '계': ['무', '임']
        };
        
        if (tianGanRelation[dayTianGan]?.includes(todayTianGan)) {
            return 'excellent';
        } else if (dayTianGan === todayTianGan) {
            return 'good';
        } else {
            return 'normal';
        }
    }
}

// 전역 인스턴스 생성
window.manseryeokConverter = new ManseryeokConverter();