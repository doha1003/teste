/**
 * 향상된 사주 계산기 모듈
 * 정확한 만세력 데이터베이스를 사용하여 사주팔자를 계산
 */

// 사주 계산 클래스
class SajuCalculatorEnhanced {
  constructor() {
    // 천간 (Heavenly Stems)
    this.HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
    this.HEAVENLY_STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

    // 지지 (Earthly Branches)
    this.EARTHLY_BRANCHES = [
      '자',
      '축',
      '인',
      '묘',
      '진',
      '사',
      '오',
      '미',
      '신',
      '유',
      '술',
      '해',
    ];
    this.EARTHLY_BRANCHES_HANJA = [
      '子',
      '丑',
      '寅',
      '卯',
      '辰',
      '巳',
      '午',
      '未',
      '申',
      '酉',
      '戌',
      '亥',
    ];

    // 오행
    this.FIVE_ELEMENTS = {
      갑: '목',
      을: '목',
      병: '화',
      정: '화',
      무: '토',
      기: '토',
      경: '금',
      신: '금',
      임: '수',
      계: '수',
    };

    // 음양
    this.YIN_YANG = {
      갑: '양',
      을: '음',
      병: '양',
      정: '음',
      무: '양',
      기: '음',
      경: '양',
      신: '음',
      임: '양',
      계: '음',
    };

    // 지지의 오행
    this.BRANCH_ELEMENTS = {
      자: '수',
      축: '토',
      인: '목',
      묘: '목',
      진: '토',
      사: '화',
      오: '화',
      미: '토',
      신: '금',
      유: '금',
      술: '토',
      해: '수',
    };

    // 십신 관계
    this.TEN_GODS = {
      same: { same: '비견', different: '겁재' },
      generate: { same: '식신', different: '상관' },
      generated: { same: '편인', different: '정인' },
      control: { same: '편재', different: '정재' },
      controlled: { same: '편관', different: '정관' },
    };
  }

  /**
   * 음력 변환을 고려한 사주 계산
   * @param {number} year - 년도
   * @param {number} month - 월
   * @param {number} day - 일
   * @param {number} hour - 시간 (0-23)
   * @param {boolean} isLunar - 음력 여부
   * @returns {Object} 사주 정보
   */
  calculateSaju(year, month, day, hour, isLunar = false) {
    let solarDate = { year, month, day };

    // 음력인 경우 양력으로 변환 (간단한 버전)
    if (isLunar) {
      solarDate = this.lunarToSolar(year, month, day);
    }

    // 음력 데이터 조회 시도
    let lunarInfo = null;
    try {
      if (window.LunarCalendarCompact && window.LunarCalendarCompact.getLunarDate) {
        lunarInfo = window.LunarCalendarCompact.getLunarDate(
          solarDate.year,
          solarDate.month,
          solarDate.day
        );
      }
    } catch (e) {
      // console.log removed('음력 데이터 로드 실패, 기본 계산 사용');
    }

    // 각 기둥 계산
    const yearPillar = this.calculateYearPillar(solarDate.year, solarDate.month, solarDate.day);
    const monthPillar = this.calculateMonthPillar(solarDate.year, solarDate.month, solarDate.day);
    const dayPillar =
      lunarInfo && lunarInfo.dayGanji
        ? {
            stem: lunarInfo.dayGanji.korean.charAt(0),
            branch: lunarInfo.dayGanji.korean.charAt(1),
            stemHanja: lunarInfo.dayGanji.hanja.charAt(0),
            branchHanja: lunarInfo.dayGanji.hanja.charAt(1),
            pillar: lunarInfo.dayGanji.korean,
          }
        : this.calculateDayPillar(solarDate.year, solarDate.month, solarDate.day);
    const hourPillar = this.calculateHourPillar(dayPillar, hour);

    // 십신 계산
    const tenGods = this.calculateTenGods(
      dayPillar.stem,
      yearPillar.stem,
      monthPillar.stem,
      hourPillar.stem
    );

    // 오행 분석
    const elements = this.analyzeElements(yearPillar, monthPillar, dayPillar, hourPillar);

    return {
      birthInfo: {
        year: solarDate.year,
        month: solarDate.month,
        day: solarDate.day,
        hour,
        isLunar,
      },
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
      dayMaster: dayPillar.stem,
      dayMasterElement: this.FIVE_ELEMENTS[dayPillar.stem],
      tenGods,
      elements,
      lunarInfo: lunarInfo || null,
    };
  }

  /**
   * 년주 계산 (절기 고려)
   */
  calculateYearPillar(year, month, day) {
    // 입춘 전후 고려 (대략 2월 4일 기준)
    let adjustedYear = year;
    if (month === 1 || (month === 2 && day < 4)) {
      adjustedYear = year - 1;
    }

    // 갑자년(1984)을 기준으로 계산
    const baseYear = 1984;
    const diff = adjustedYear - baseYear;

    let stemIndex = diff % 10;
    let branchIndex = diff % 12;

    if (stemIndex < 0) {
      stemIndex += 10;
    }
    if (branchIndex < 0) {
      branchIndex += 12;
    }

    return {
      stem: this.HEAVENLY_STEMS[stemIndex],
      branch: this.EARTHLY_BRANCHES[branchIndex],
      stemHanja: this.HEAVENLY_STEMS_HANJA[stemIndex],
      branchHanja: this.EARTHLY_BRANCHES_HANJA[branchIndex],
      pillar: this.HEAVENLY_STEMS[stemIndex] + this.EARTHLY_BRANCHES[branchIndex],
    };
  }

  /**
   * 월주 계산 (절기 고려)
   */
  calculateMonthPillar(year, month, day) {
    const yearPillar = this.calculateYearPillar(year, month, day);
    const yearStem = yearPillar.stem;
    const yearStemIndex = this.HEAVENLY_STEMS.indexOf(yearStem);

    // 절기에 따른 월지 결정 (간단화)
    const monthBranches = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
    let monthIndex = month - 1;

    // 절기 보정 (대략적)
    if (day < 5) {
      monthIndex = (monthIndex - 1 + 12) % 12;
    }

    const monthBranch = monthBranches[monthIndex];

    // 월간 계산
    const monthStemStart = [2, 4, 6, 8, 0]; // 병, 무, 경, 임, 갑
    const startIndex = monthStemStart[yearStemIndex % 5];
    const monthStemIndex = (startIndex + monthIndex) % 10;

    return {
      stem: this.HEAVENLY_STEMS[monthStemIndex],
      branch: monthBranch,
      stemHanja: this.HEAVENLY_STEMS_HANJA[monthStemIndex],
      branchHanja: this.EARTHLY_BRANCHES_HANJA[this.EARTHLY_BRANCHES.indexOf(monthBranch)],
      pillar: this.HEAVENLY_STEMS[monthStemIndex] + monthBranch,
    };
  }

  /**
   * 일주 계산 (만세력 데이터 없을 때 fallback)
   */
  calculateDayPillar(year, month, day) {
    // 1991년 10월 3일 = 병오일 (확인된 기준)
    const referenceDate = new Date(1991, 9, 3);
    const targetDate = new Date(year, month - 1, day);

    const daysDiff = Math.floor((targetDate - referenceDate) / (1000 * 60 * 60 * 24));

    let stemIndex = (2 + daysDiff) % 10;
    if (stemIndex < 0) {
      stemIndex += 10;
    }

    let branchIndex = (6 + daysDiff) % 12;
    if (branchIndex < 0) {
      branchIndex += 12;
    }

    return {
      stem: this.HEAVENLY_STEMS[stemIndex],
      branch: this.EARTHLY_BRANCHES[branchIndex],
      stemHanja: this.HEAVENLY_STEMS_HANJA[stemIndex],
      branchHanja: this.EARTHLY_BRANCHES_HANJA[branchIndex],
      pillar: this.HEAVENLY_STEMS[stemIndex] + this.EARTHLY_BRANCHES[branchIndex],
    };
  }

  /**
   * 시주 계산
   */
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
      pillar: this.HEAVENLY_STEMS[hourStemIndex] + hourBranch,
    };
  }

  /**
   * 십신 계산
   */
  calculateTenGods(dayMaster, yearStem, monthStem, hourStem) {
    const calculate = (stem) => {
      const dayElement = this.FIVE_ELEMENTS[dayMaster];
      const stemElement = this.FIVE_ELEMENTS[stem];
      const dayYinYang = this.YIN_YANG[dayMaster];
      const stemYinYang = this.YIN_YANG[stem];

      const isSameYinYang = dayYinYang === stemYinYang;

      // 오행 관계 판단
      if (dayElement === stemElement) {
        return isSameYinYang ? '비견' : '겁재';
      }

      const relations = {
        목: {
          generate: '화',
          control: '토',
          generated: '수',
          controlled: '금',
        },
        화: {
          generate: '토',
          control: '금',
          generated: '목',
          controlled: '수',
        },
        토: {
          generate: '금',
          control: '수',
          generated: '화',
          controlled: '목',
        },
        금: {
          generate: '수',
          control: '목',
          generated: '토',
          controlled: '화',
        },
        수: {
          generate: '목',
          control: '화',
          generated: '금',
          controlled: '토',
        },
      };

      const rel = relations[dayElement];

      if (rel.generate === stemElement) {
        return isSameYinYang ? '식신' : '상관';
      } else if (rel.generated === stemElement) {
        return isSameYinYang ? '편인' : '정인';
      } else if (rel.control === stemElement) {
        return isSameYinYang ? '편재' : '정재';
      } else if (rel.controlled === stemElement) {
        return isSameYinYang ? '편관' : '정관';
      }

      return '?';
    };

    return {
      year: calculate(yearStem),
      month: calculate(monthStem),
      day: '일주',
      hour: calculate(hourStem),
    };
  }

  /**
   * 오행 분석
   */
  analyzeElements(yearPillar, monthPillar, dayPillar, hourPillar) {
    const counts = {
      목: 0,
      화: 0,
      토: 0,
      금: 0,
      수: 0,
    };

    // 천간 오행
    [yearPillar, monthPillar, dayPillar, hourPillar].forEach((pillar) => {
      counts[this.FIVE_ELEMENTS[pillar.stem]]++;
      counts[this.BRANCH_ELEMENTS[pillar.branch]]++;
    });

    // 가장 많은/적은 오행 찾기
    let strongest = '';
    let weakest = '';
    let maxCount = 0;
    let minCount = 8;

    for (const [element, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        strongest = element;
      }
      if (count < minCount) {
        minCount = count;
        weakest = element;
      }
    }

    // 균형 판단
    const balance = maxCount - minCount <= 2 ? '균형' : '불균형';

    return {
      counts,
      strongest,
      weakest,
      balance: {
        balance,
        description:
          balance === '균형'
            ? '오행이 비교적 균형잡혀 있습니다.'
            : `${strongest}이(가) 강하고 ${weakest}이(가) 약합니다.`,
      },
    };
  }

  /**
   * 사주 해석 생성
   */
  generateInterpretation(saju) {
    const { dayMaster } = saju;
    const element = saju.dayMasterElement;

    // 일주별 기본 성격
    const dayMasterTraits = {
      갑: '리더십이 강하고 진취적이며 정의감이 강합니다.',
      을: '유연하고 적응력이 뛰어나며 협조적입니다.',
      병: '열정적이고 활발하며 표현력이 풍부합니다.',
      정: '섬세하고 예술적 감각이 뛰어나며 온화합니다.',
      무: '신뢰감이 있고 포용력이 크며 안정적입니다.',
      기: '실용적이고 꼼꼼하며 책임감이 강합니다.',
      경: '결단력이 있고 추진력이 강하며 정의롭습니다.',
      신: '예리하고 분석적이며 완벽주의 성향이 있습니다.',
      임: '지혜롭고 통찰력이 있으며 유연합니다.',
      계: '총명하고 직관력이 뛰어나며 적응력이 좋습니다.',
    };

    return {
      dayMaster: dayMasterTraits[dayMaster] || '독특한 개성을 가지고 있습니다.',
      personality: this.generatePersonalityAnalysis(saju),
      fortune: this.generateFortuneAnalysis(saju),
      career: this.generateCareerAnalysis(saju),
      health: this.generateHealthAnalysis(saju),
      relationship: this.generateRelationshipAnalysis(saju),
    };
  }

  generatePersonalityAnalysis(saju) {
    const element = saju.dayMasterElement;
    const elementTraits = {
      목: '성장과 발전을 추구하며, 인자하고 관대한 성품을 지녔습니다.',
      화: '열정적이고 활동적이며, 밝고 긍정적인 에너지를 발산합니다.',
      토: '신뢰할 수 있고 안정적이며, 중재자 역할을 잘 수행합니다.',
      금: '원칙과 정의를 중시하며, 결단력과 추진력이 뛰어납니다.',
      수: '지혜롭고 유연하며, 상황에 대한 적응력이 뛰어납니다.',
    };

    const { balance } = saju.elements.balance;
    const balanceDesc =
      balance === '균형'
        ? '균형 잡힌 성격으로 다양한 상황에서 안정적입니다.'
        : `${saju.elements.strongest} 기운이 강해 해당 특성이 두드러지게 나타납니다.`;

    return `${elementTraits[element]} ${balanceDesc}`;
  }

  generateFortuneAnalysis(saju) {
    const { tenGods } = saju;
    const godCounts = {};

    // 십신 개수 세기
    Object.values(tenGods).forEach((god) => {
      if (god !== '일주') {
        godCounts[god] = (godCounts[god] || 0) + 1;
      }
    });

    // 주요 십신에 따른 운세 분석
    let fortuneDesc = '전반적으로 안정적인 운세를 가지고 있습니다. ';

    if (godCounts['정관'] || godCounts['편관']) {
      fortuneDesc += '명예와 지위를 얻을 수 있는 운이 있습니다. ';
    }
    if (godCounts['정재'] || godCounts['편재']) {
      fortuneDesc += '재물운이 좋아 경제적 안정을 이룰 수 있습니다. ';
    }
    if (godCounts['정인'] || godCounts['편인']) {
      fortuneDesc += '학문과 지혜의 운이 강해 배움에서 성취를 얻을 수 있습니다. ';
    }

    return fortuneDesc;
  }

  generateCareerAnalysis(saju) {
    const element = saju.dayMasterElement;
    const careerByElement = {
      목: '교육, 의료, 예술, 디자인, 환경 관련 분야',
      화: '엔터테인먼트, 마케팅, 홍보, 요리, 미용 분야',
      토: '부동산, 건설, 농업, 행정, 중재 관련 분야',
      금: '금융, 법률, 제조업, 군인, 경찰 분야',
      수: 'IT, 물류, 무역, 컨설팅, 연구 분야',
    };

    return `${element} 기운의 특성상 ${careerByElement[element]}에서 두각을 나타낼 수 있습니다. 
                십신 구성을 보면 ${this.getCareerDirection(saju.tenGods)}`;
  }

  getCareerDirection(tenGods) {
    const godCounts = {};
    Object.values(tenGods).forEach((god) => {
      if (god !== '일주') {
        godCounts[god] = (godCounts[god] || 0) + 1;
      }
    });

    if (godCounts['정관'] || godCounts['편관']) {
      return '조직이나 공직에서 리더십을 발휘할 수 있습니다.';
    } else if (godCounts['식신'] || godCounts['상관']) {
      return '창의적이고 자유로운 분야에서 능력을 발휘할 수 있습니다.';
    } else if (godCounts['정재'] || godCounts['편재']) {
      return '사업이나 투자 분야에서 성공할 가능성이 높습니다.';
    } else {
      return '다양한 분야에서 균형잡힌 능력을 발휘할 수 있습니다.';
    }
  }

  generateHealthAnalysis(saju) {
    const element = saju.dayMasterElement;
    const weakElement = saju.elements.weakest;

    const organsByElement = {
      목: '간과 담낭',
      화: '심장과 소장',
      토: '비장과 위장',
      금: '폐와 대장',
      수: '신장과 방광',
    };

    return `${element} 일주로서 ${organsByElement[element]}이 중요합니다. 
                ${weakElement} 기운이 약하므로 ${organsByElement[weakElement]}에 주의가 필요합니다. 
                규칙적인 생활과 균형잡힌 식사가 건강 유지에 도움이 됩니다.`;
  }

  generateRelationshipAnalysis(saju) {
    const { dayMaster } = saju;
    const yinYang = this.YIN_YANG[dayMaster];

    let relationshipDesc =
      yinYang === '양'
        ? '적극적이고 주도적인 관계를 선호합니다. '
        : '조화롭고 수용적인 관계를 선호합니다. ';

    const tenGods = Object.values(saju.tenGods);
    if (tenGods.includes('비견') || tenGods.includes('겁재')) {
      relationshipDesc += '동료나 친구 관계가 중요한 역할을 합니다. ';
    }
    if (tenGods.includes('정인') || tenGods.includes('편인')) {
      relationshipDesc += '연장자나 스승과의 인연이 깊습니다. ';
    }

    return `${relationshipDesc}서로를 이해하고 존중하는 관계를 구축하는 것이 중요합니다.`;
  }

  /**
   * 음력을 양력으로 변환 (간단한 버전)
   */
  lunarToSolar(year, month, day) {
    // 실제로는 복잡한 변환 로직이 필요
    // 여기서는 간단히 그대로 반환
    return { year, month, day };
  }
}

// 전역 객체로 내보내기
if (typeof window !== 'undefined') {
  window.SajuCalculatorEnhanced = SajuCalculatorEnhanced;
  // 기존 SajuCalculator도 향상된 버전으로 교체
  window.SajuCalculator = new SajuCalculatorEnhanced();
}

// CommonJS 내보내기 (Node.js 환경)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SajuCalculatorEnhanced;
}
