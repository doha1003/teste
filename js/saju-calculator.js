// 향상된 사주팔자 계산기 (2025년 최신 버전)
// 16개 분야 전문 해석 시스템

const sajuCalculator = {
  // 천간 (10개)
  stems: ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'],

  // 지지 (12개)
  branches: ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'],

  // 천간 오행
  stemElements: {
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
  },

  // 지지 오행
  branchElements: {
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
  },

  // 십신 관계
  tenGods: {
    same: '비견',
    parallel: '겁재',
    food: '식신',
    injury: '상관',
    wealth: '정재',
    partialWealth: '편재',
    officer: '정관',
    partialOfficer: '편관',
    seal: '정인',
    partialSeal: '편인',
  },

  // 음양 구분
  getYinYang(index) {
    return index % 2 === 0 ? '양' : '음';
  },

  // 간단한 만세력 계산 (1900-2100년)
  calculateSaju(year, month, day, hour, isLunar = false) {
    try {
      // 양력 변환 (음력인 경우)
      if (isLunar) {
        // 간단한 음력-양력 변환 (실제로는 더 복잡함)
        // 여기서는 근사치 사용
        day += 10; // 대략적인 보정
        if (day > 28) {
          day -= 28;
          month += 1;
        }
        if (month > 12) {
          month -= 12;
          year += 1;
        }
      }

      // 연주 계산 (갑자년을 기준으로)
      const yearIndex = (year - 1984) % 60; // 1984년 갑자년 기준
      const yearStem = this.stems[yearIndex % 10];
      const yearBranch = this.branches[yearIndex % 12];

      // 월주 계산
      const monthIndex = ((year - 1984) * 12 + month - 1) % 60;
      const monthStem = this.stems[monthIndex % 10];
      const monthBranch = this.branches[monthIndex % 12];

      // 일주 계산 (간단한 방식)
      const totalDays = this.getTotalDays(year, month, day);
      const dayIndex = totalDays % 60;
      const dayStem = this.stems[dayIndex % 10];
      const dayBranch = this.branches[dayIndex % 12];

      // 시주 계산
      const hourIndex = Math.floor(hour / 2);
      const hourStem = this.stems[(this.stems.indexOf(dayStem) * 2 + hourIndex) % 10];
      const hourBranch = this.branches[hourIndex % 12];

      // 일주를 기준으로 십신 계산
      const dayMaster = dayStem;
      const dayMasterElement = this.stemElements[dayMaster];

      const tenGods = this.calculateTenGods(dayMaster, {
        year: yearStem,
        month: monthStem,
        day: dayStem,
        hour: hourStem,
      });

      // 오행 분석
      const elements = this.analyzeElements([
        yearStem,
        yearBranch,
        monthStem,
        monthBranch,
        dayStem,
        dayBranch,
        hourStem,
        hourBranch,
      ]);

      return {
        birthInfo: {
          year,
          month,
          day,
          hour,
          isLunar,
        },
        yearPillar: { stem: yearStem, branch: yearBranch },
        monthPillar: { stem: monthStem, branch: monthBranch },
        dayPillar: { stem: dayStem, branch: dayBranch },
        hourPillar: { stem: hourStem, branch: hourBranch },
        dayMaster,
        dayMasterElement,
        tenGods,
        elements,
      };
    } catch (error) {
      // console.error removed('사주 계산 오류:', error);
      throw new Error('사주 계산 중 오류가 발생했습니다.');
    }
  },

  // 총 일수 계산 (간단한 방식)
  getTotalDays(year, month, day) {
    const startYear = 1900;
    let totalDays = 0;

    // 연도별 일수 누적
    for (let y = startYear; y < year; y++) {
      totalDays += this.isLeapYear(y) ? 366 : 365;
    }

    // 월별 일수 누적
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (let m = 1; m < month; m++) {
      totalDays += daysInMonth[m - 1];
      if (m === 2 && this.isLeapYear(year)) {
        totalDays += 1;
      }
    }

    totalDays += day;
    return totalDays;
  },

  // 윤년 판별
  isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  },

  // 십신 계산
  calculateTenGods(dayMaster, stems) {
    const dayElement = this.stemElements[dayMaster];
    const result = {};

    Object.keys(stems).forEach((position) => {
      const stem = stems[position];
      const element = this.stemElements[stem];
      const relationship = this.getElementRelationship(dayElement, element);
      const isSameYinYang =
        this.getYinYang(this.stems.indexOf(dayMaster)) ===
        this.getYinYang(this.stems.indexOf(stem));

      if (position === 'day') {
        result[position] = '일주(본인)';
      } else {
        result[position] = this.getTenGod(relationship, isSameYinYang);
      }
    });

    return result;
  },

  // 오행 관계 분석
  getElementRelationship(dayElement, targetElement) {
    if (dayElement === targetElement) {
      return 'same';
    }

    const relationships = {
      목: {
        generates: '화',
        controls: '토',
        controlledBy: '금',
        generatedBy: '수',
      },
      화: {
        generates: '토',
        controls: '금',
        controlledBy: '수',
        generatedBy: '목',
      },
      토: {
        generates: '금',
        controls: '수',
        controlledBy: '목',
        generatedBy: '화',
      },
      금: {
        generates: '수',
        controls: '목',
        controlledBy: '화',
        generatedBy: '토',
      },
      수: {
        generates: '목',
        controls: '화',
        controlledBy: '토',
        generatedBy: '금',
      },
    };

    const rel = relationships[dayElement];
    if (rel.generates === targetElement) {
      return 'generates';
    }
    if (rel.controls === targetElement) {
      return 'controls';
    }
    if (rel.controlledBy === targetElement) {
      return 'controlledBy';
    }
    if (rel.generatedBy === targetElement) {
      return 'generatedBy';
    }

    return 'neutral';
  },

  // 십신 결정
  getTenGod(relationship, isSameYinYang) {
    switch (relationship) {
      case 'same':
        return isSameYinYang ? '비견' : '겁재';
      case 'generates':
        return isSameYinYang ? '식신' : '상관';
      case 'controls':
        return isSameYinYang ? '정재' : '편재';
      case 'controlledBy':
        return isSameYinYang ? '정관' : '편관';
      case 'generatedBy':
        return isSameYinYang ? '정인' : '편인';
      default:
        return '중신';
    }
  },

  // 오행 분석
  analyzeElements(characters) {
    const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

    characters.forEach((char) => {
      const element = this.stemElements[char] || this.branchElements[char];
      if (element) {
        counts[element]++;
      }
    });

    // 가장 강한/약한 오행 찾기
    let strongest = '목',
      weakest = '목';
    let maxCount = 0,
      minCount = Infinity;

    Object.entries(counts).forEach(([element, count]) => {
      if (count > maxCount) {
        maxCount = count;
        strongest = element;
      }
      if (count < minCount) {
        minCount = count;
        weakest = element;
      }
    });

    // 균형 분석
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const average = total / 5;
    const variance =
      Object.values(counts).reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / 5;

    let balanceLevel, balanceDescription;
    if (variance < 0.5) {
      balanceLevel = 'excellent';
      balanceDescription = '매우 균형적';
    } else if (variance < 1.0) {
      balanceLevel = 'good';
      balanceDescription = '균형적';
    } else if (variance < 2.0) {
      balanceLevel = 'fair';
      balanceDescription = '약간 불균형';
    } else {
      balanceLevel = 'poor';
      balanceDescription = '불균형';
    }

    return {
      counts,
      strongest,
      weakest,
      balance: {
        level: balanceLevel,
        description: balanceDescription,
        variance,
      },
    };
  },

  // 16개 분야 상세 해석 생성
  generateDetailedInterpretation(saju, gender = 'male') {
    const { dayMaster } = saju;
    const dayElement = saju.dayMasterElement;
    const strongestElement = saju.elements.strongest;
    const weakestElement = saju.elements.weakest;
    const balance = saju.elements.balance.level;

    return {
      dayMaster: this.interpretDayMaster(dayMaster),
      personality: this.interpretPersonality(dayMaster, strongestElement, balance),
      fortune: this.interpretFortune(dayMaster, strongestElement, balance),
      career: this.interpretCareer(dayMaster, strongestElement, saju.tenGods),
      health: this.interpretHealth(dayElement, strongestElement, weakestElement),
      relationship: this.interpretRelationship(dayMaster, saju.tenGods),
      wealth: this.interpretWealth(dayMaster, saju.tenGods, strongestElement),
      lifeCycle: this.interpretLifeCycle(dayMaster, saju.birthInfo.year),
      compatibility: this.interpretCompatibility(dayMaster, gender),
      yearlyFortune: this.interpretYearlyFortune(dayMaster, strongestElement),
      monthlyFortune: this.interpretMonthlyFortune(dayMaster, strongestElement),
      luckyItems: this.interpretLuckyItems(dayElement, strongestElement),
      cautions: this.interpretCautions(dayMaster, strongestElement),
      strengths: this.interpretStrengths(dayMaster, strongestElement),
      weaknesses: this.interpretWeaknesses(dayMaster, weakestElement, balance),
      growthPoints: this.interpretGrowthPoints(weakestElement, balance),
      tenGodsAnalysis: this.interpretTenGods(saju.tenGods),
    };
  },

  // 일주 해석
  interpretDayMaster(dayMaster) {
    const interpretations = {
      갑: '갑목일주는 큰 나무와 같이 곧고 굳센 성격을 지니고 있습니다. 리더십이 강하고 정의감이 넘치며, 새로운 일에 도전하는 것을 좋아합니다. 때로는 고집이 센 면이 있지만, 그만큼 신념이 확고하고 믿을 만한 사람입니다.',
      을: '을목일주는 유연한 나무처럼 상황에 잘 적응하는 능력을 가지고 있습니다. 섬세하고 감성적이며, 다른 사람의 마음을 잘 이해합니다. 협조적이고 배려심이 깊어 인간관계에서 조화를 중시합니다.',
      병: '병화일주는 태양과 같이 밝고 열정적인 성격을 지니고 있습니다. 외향적이고 활동적이며, 주변 사람들에게 에너지를 전해주는 능력이 있습니다. 창의적이고 표현력이 풍부하여 예술적 재능을 발휘할 수 있습니다.',
      정: '정화일주는 촛불처럼 따뜻하고 안정적인 에너지를 가지고 있습니다. 온화하고 친근한 성격으로 사람들에게 편안함을 줍니다. 꼼꼼하고 신중한 성향으로 맡은 일을 책임감 있게 처리합니다.',
      무: '무토일주는 산과 같이 든든하고 포용력이 큰 성격을 지니고 있습니다. 현실적이고 실용적인 사고를 하며, 안정을 추구합니다. 책임감이 강하고 믿음직스러워 주변 사람들의 신뢰를 받습니다.',
      기: '기토일주는 들판과 같이 너그럽고 포용적인 성격을 가지고 있습니다. 온순하고 겸손하며, 다른 사람을 배려하는 마음이 큽니다. 꾸준하고 성실한 노력으로 목표를 달성하는 타입입니다.',
      경: '경금일주는 칼과 같이 예리하고 결단력이 있는 성격을 지니고 있습니다. 정의롭고 원칙적이며, 옳고 그름을 명확히 구분합니다. 강한 의지력과 추진력으로 어려운 일도 해결해 나갑니다.',
      신: '신금일주는 보석과 같이 세련되고 품격 있는 성격을 가지고 있습니다. 예술적 감각이 뛰어나고 미적 센스가 좋습니다. 섬세하고 완벽주의적 성향으로 일의 품질을 중시합니다.',
      임: '임수일주는 바다와 같이 깊고 포용력이 큰 성격을 지니고 있습니다. 지혜롭고 통찰력이 뛰어나며, 상황을 전체적으로 파악하는 능력이 있습니다. 융통성이 있고 적응력이 좋습니다.',
      계: '계수일주는 이슬과 같이 순수하고 깨끗한 성격을 가지고 있습니다. 감성이 풍부하고 직감력이 뛰어나며, 예술적 재능을 지니고 있습니다. 온화하고 평화로운 성향으로 갈등을 피하려 합니다.',
    };
    return interpretations[dayMaster] || '특별한 운명을 지닌 분입니다.';
  },

  // 성격 분석
  interpretPersonality(dayMaster, strongestElement, balance) {
    const basePersonality = this.getBasePersonality(dayMaster);
    const elementInfluence = this.getElementPersonality(strongestElement);
    const balanceInfluence = this.getBalancePersonality(balance);

    return `${basePersonality} ${elementInfluence} ${balanceInfluence}`;
  },

  getBasePersonality(dayMaster) {
    const personalities = {
      갑: '당신은 천성적으로 리더의 기질을 가지고 있습니다. 정직하고 직선적인 성격으로 부정과 불의를 참지 못합니다.',
      을: '당신은 부드럽고 유연한 성격의 소유자입니다. 상대방의 입장을 이해하려 노력하고 조화를 중시합니다.',
      병: '당신은 밝고 낙천적인 성격으로 주변을 환하게 만듭니다. 열정적이고 창의적인 아이디어가 풍부합니다.',
      정: '당신은 온화하고 신중한 성격으로 사람들에게 안정감을 줍니다. 세심하고 배려심이 깊습니다.',
      무: '당신은 현실적이고 안정지향적인 성격입니다. 책임감이 강하고 일을 체계적으로 처리합니다.',
      기: '당신은 너그럽고 포용력이 큰 성격입니다. 겸손하고 성실하며 꾸준한 노력파입니다.',
      경: '당신은 예리하고 결단력 있는 성격입니다. 원칙을 중시하고 정의감이 강합니다.',
      신: '당신은 세련되고 품격 있는 성격입니다. 미적 감각이 뛰어나고 완벽을 추구합니다.',
      임: '당신은 깊이 있고 지혜로운 성격입니다. 포용력이 크고 상황 파악 능력이 뛰어납니다.',
      계: '당신은 순수하고 감성적인 성격입니다. 직감력이 뛰어나고 예술적 재능이 있습니다.',
    };
    return personalities[dayMaster] || '';
  },

  getElementPersonality(element) {
    const influences = {
      목: '목의 기운이 강해 성장 지향적이고 발전을 추구하는 성향이 있습니다.',
      화: '화의 기운이 강해 활동적이고 표현력이 풍부한 성향이 있습니다.',
      토: '토의 기운이 강해 안정을 추구하고 신뢰성 있는 성향이 있습니다.',
      금: '금의 기운이 강해 정확하고 체계적인 성향이 있습니다.',
      수: '수의 기운이 강해 유연하고 적응력이 뛰어난 성향이 있습니다.',
    };
    return influences[element] || '';
  },

  getBalancePersonality(balance) {
    const balanceEffects = {
      excellent: '오행의 균형이 매우 좋아 안정된 성격을 보입니다.',
      good: '오행이 균형을 이루어 조화로운 성격을 나타냅니다.',
      fair: '오행에 약간의 편중이 있어 때로는 극단적인 면을 보일 수 있습니다.',
      poor: '오행의 불균형으로 인해 감정의 기복이 클 수 있습니다.',
    };
    return balanceEffects[balance] || '';
  },

  // 운세 분석
  interpretFortune(dayMaster, strongestElement, balance) {
    const currentYear = new Date().getFullYear();
    const yearElement = this.getYearElement(currentYear);

    return `올해 ${currentYear}년은 ${yearElement} 기운이 강한 해입니다. ${dayMaster}일주인 당신에게는 ${this.getFortuneByElement(dayMaster, yearElement)} ${this.getBalanceFortune(balance)} 특히 ${strongestElement}의 기운이 강해 ${this.getElementFortune(strongestElement)} 전반적으로 꾸준한 노력이 결실을 맺는 시기가 될 것입니다.`;
  },

  getYearElement(year) {
    const elements = ['금', '수', '목', '화', '토'];
    return elements[year % 5];
  },

  getFortuneByElement(dayMaster, yearElement) {
    // 일주와 올해 오행의 관계 분석
    const dayElement = this.stemElements[dayMaster];
    const relationship = this.getElementRelationship(dayElement, yearElement);

    const fortunes = {
      same: '안정적인 운세가 예상됩니다.',
      generates: '발전과 성장의 기회가 많은 해입니다.',
      controls: '주도권을 잡고 성취를 이룰 수 있는 해입니다.',
      controlledBy: '도전이 있지만 극복하면 큰 성장을 이룰 수 있습니다.',
      generatedBy: '도움을 받고 지원을 얻기 좋은 해입니다.',
    };

    return fortunes[relationship] || '변화와 기회의 해입니다.';
  },

  getBalanceFortune(balance) {
    const balanceEffects = {
      excellent: '균형 잡힌 오행으로 인해 안정적인 운세를 보입니다.',
      good: '조화로운 기운으로 순조로운 진행이 예상됩니다.',
      fair: '약간의 변동은 있지만 전체적으로 무난한 운세입니다.',
      poor: '기복이 있을 수 있으니 신중한 판단이 필요합니다.',
    };
    return balanceEffects[balance] || '';
  },

  getElementFortune(element) {
    const elementFortunes = {
      목: '성장과 발전의 기운이 강해집니다.',
      화: '활동적이고 창의적인 일에서 좋은 성과를 거둘 수 있습니다.',
      토: '안정성을 바탕으로 꾸준한 발전을 이룰 수 있습니다.',
      금: '정확한 판단력으로 성공적인 결과를 얻을 수 있습니다.',
      수: '유연한 사고로 새로운 기회를 포착할 수 있습니다.',
    };
    return elementFortunes[element] || '';
  },

  // 직업 적성 (더 상세하게)
  interpretCareer(dayMaster, strongestElement, tenGods) {
    const baseCareer = this.getBaseCareer(dayMaster);
    const elementCareer = this.getElementCareer(strongestElement);
    const tenGodCareer = this.getTenGodCareer(tenGods);

    return `${baseCareer} ${elementCareer} ${tenGodCareer}`;
  },

  getBaseCareer(dayMaster) {
    const careers = {
      갑: '리더십이 요구되는 관리직, 경영직이 적합합니다. 교육자, 정치인, 군인 등의 분야에서도 능력을 발휘할 수 있습니다.',
      을: '상담, 서비스업, 예술 분야가 적합합니다. 사람과의 관계를 중시하는 직업에서 뛰어난 능력을 보입니다.',
      병: '방송, 연예, 광고, 마케팅 분야가 잘 맞습니다. 창의적이고 표현력이 중요한 직업이 적합합니다.',
      정: '요리, 의료, 교육, 상담 분야에서 능력을 발휘합니다. 꼼꼼함과 세심함이 필요한 직업이 좋습니다.',
      무: '건설, 부동산, 금융, 행정 분야가 적합합니다. 안정성과 신뢰성이 중요한 직업에서 성공할 수 있습니다.',
      기: '농업, 요리, 간호, 사회복지 분야에 적성이 있습니다. 봉사정신이 필요한 직업에서 보람을 느낍니다.',
      경: '법무, 군인, 경찰, 의사 등 정확성과 책임감이 필요한 직업이 적합합니다.',
      신: '보석, 디자인, 예술, 패션 분야에서 재능을 발휘합니다. 미적 감각이 중요한 직업이 좋습니다.',
      임: '연구, 학문, 철학, 종교 분야가 적합합니다. 깊이 있는 사고가 필요한 직업에서 성공할 수 있습니다.',
      계: '예술, 문학, 음악, 심리상담 분야에 적성이 있습니다. 감성과 직감이 중요한 직업이 좋습니다.',
    };
    return careers[dayMaster] || '';
  },

  getElementCareer(element) {
    const elementCareers = {
      목: '성장 산업, 교육, 출판, 환경 관련 분야에서 좋은 성과를 거둘 수 있습니다.',
      화: '에너지, IT, 미디어, 엔터테인먼트 분야에서 능력을 발휘할 수 있습니다.',
      토: '건설, 부동산, 농업, 금융 안정성을 바탕으로 한 사업이 적합합니다.',
      금: '제조업, 기계, 의료기기, 정밀기술 분야에서 전문성을 발휘할 수 있습니다.',
      수: '유통, 물류, 여행, 컨설팅 등 유연함이 필요한 분야가 좋습니다.',
    };
    return elementCareers[element] || '';
  },

  getTenGodCareer(tenGods) {
    // 십신 중 가장 많이 나타나는 것으로 판단
    const godCounts = {};
    Object.values(tenGods).forEach((god) => {
      if (god !== '일주(본인)') {
        godCounts[god] = (godCounts[god] || 0) + 1;
      }
    });

    const dominantGod = Object.keys(godCounts).reduce(
      (a, b) => (godCounts[a] > godCounts[b] ? a : b),
      Object.keys(godCounts)[0]
    );

    const godCareers = {
      정관: '공무원, 관리직, 법조인 등 질서와 규범이 중요한 직업이 좋습니다.',
      편관: '군인, 경찰, 보안 관련 직업에서 능력을 발휘할 수 있습니다.',
      정재: '회계, 금융, 은행 등 재정 관리가 중요한 직업이 적합합니다.',
      편재: '무역, 영업, 투자 등 변화가 많은 사업에서 성공할 수 있습니다.',
      식신: '요리, 예술, 문화 콘텐츠 제작 등 창조적인 직업이 좋습니다.',
      상관: '비평, 분석, 컨설팅 등 날카로운 판단력이 필요한 직업이 적합합니다.',
      정인: '교육, 연구, 학문 분야에서 뛰어난 능력을 보일 수 있습니다.',
      편인: '종교, 철학, 심리학 등 정신적 가치를 다루는 직업이 좋습니다.',
      비견: '동업, 협업이 중요한 사업에서 성공할 수 있습니다.',
      겁재: '경쟁이 치열한 분야에서 강한 승부욕으로 성취를 이룰 수 있습니다.',
    };

    return dominantGod ? godCareers[dominantGod] || '' : '';
  },

  // 건강 관리
  interpretHealth(dayElement, strongestElement, weakestElement) {
    const baseHealth = this.getElementHealth(dayElement);
    const strongHealth = this.getStrongElementHealth(strongestElement);
    const weakHealth = this.getWeakElementHealth(weakestElement);

    return `${baseHealth} ${strongHealth} ${weakHealth} 규칙적인 생활과 적절한 운동으로 건강을 유지하시기 바랍니다.`;
  },

  getElementHealth(element) {
    const healthMap = {
      목: '간, 담낭, 근육, 신경계 건강에 주의하시기 바랍니다. 스트레스 관리가 중요합니다.',
      화: '심장, 소장, 혈액순환 건강을 관리하세요. 과도한 흥분을 피하고 충분한 휴식을 취하세요.',
      토: '위, 비장, 소화기계 건강에 신경 쓰세요. 규칙적인 식사와 적절한 운동이 필요합니다.',
      금: '폐, 대장, 호흡기계 건강을 주의하세요. 공기가 좋은 곳에서 운동하는 것이 좋습니다.',
      수: '신장, 방광, 생식기계 건강에 주의하세요. 충분한 수분 섭취와 보온이 중요합니다.',
    };
    return healthMap[element] || '';
  },

  getStrongElementHealth(element) {
    const effects = {
      목: '목 기운이 강해 간 기능이 활발하지만 과도할 경우 스트레스에 민감할 수 있습니다.',
      화: '화 기운이 강해 에너지가 넘치지만 심장에 부담을 줄 수 있으니 주의하세요.',
      토: '토 기운이 강해 소화력이 좋지만 습한 환경을 피하는 것이 좋습니다.',
      금: '금 기운이 강해 면역력이 좋지만 너무 차가운 음식은 피하세요.',
      수: '수 기운이 강해 신진대사가 활발하지만 과로를 피하시기 바랍니다.',
    };
    return effects[element] || '';
  },

  getWeakElementHealth(element) {
    const supplements = {
      목: '목 기운이 부족하여 간 기능 강화에 도움이 되는 녹색 채소를 많이 드세요.',
      화: '화 기운이 부족하여 심장 건강에 좋은 붉은색 음식을 섭취하세요.',
      토: '토 기운이 부족하여 소화기 건강을 위해 노란색 음식을 드시면 좋습니다.',
      금: '금 기운이 부족하여 호흡기 건강을 위해 흰색 음식을 섭취하세요.',
      수: '수 기운이 부족하여 신장 건강을 위해 검은색 음식을 드시는 것이 좋습니다.',
    };
    return supplements[element] || '';
  },

  // 인간관계
  interpretRelationship(dayMaster, tenGods) {
    const baseRelation = this.getDayMasterRelation(dayMaster);
    const tenGodRelation = this.getTenGodRelation(tenGods);

    return `${baseRelation} ${tenGodRelation}`;
  },

  getDayMasterRelation(dayMaster) {
    const relations = {
      갑: '직선적이고 솔직한 성격으로 진실한 관계를 선호합니다. 리더십을 발휘하여 주변 사람들을 이끌어 갑니다.',
      을: '부드럽고 배려심 많은 성격으로 조화로운 관계를 만들어 갑니다. 상대방의 마음을 잘 이해합니다.',
      병: '밝고 활발한 성격으로 많은 사람들과 친분을 쌓습니다. 사교성이 좋아 인기가 많습니다.',
      정: '온화하고 신중한 성격으로 깊이 있는 관계를 선호합니다. 신뢰할 수 있는 친구가 많습니다.',
      무: '든든하고 믿음직한 성격으로 주변 사람들의 의지가 됩니다. 안정적인 관계를 유지합니다.',
      기: '너그럽고 포용적인 성격으로 다양한 사람들과 잘 어울립니다. 봉사정신으로 사랑받습니다.',
      경: '정의롭고 원칙적인 성격으로 옳고 그름이 분명한 관계를 선호합니다. 진실한 친구들이 있습니다.',
      신: '세련되고 품격 있는 성격으로 좋은 사람들과 교류합니다. 질 높은 관계를 중시합니다.',
      임: '깊이 있고 포용력 있는 성격으로 다양한 사람들을 이해합니다. 지혜로운 조언자 역할을 합니다.',
      계: '순수하고 감성적인 성격으로 진심어린 관계를 만듭니다. 예술적 감성을 공유하는 친구들이 많습니다.',
    };
    return relations[dayMaster] || '';
  },

  getTenGodRelation(tenGods) {
    // 십신별 인간관계 특성
    const relationMap = {
      정관: '상하관계에서 예의를 중시하고 질서 있는 관계를 선호합니다.',
      편관: '경쟁과 도전이 있는 관계에서 자극을 받고 성장합니다.',
      정재: '안정적이고 지속적인 관계를 중시하며 상호 이익을 추구합니다.',
      편재: '다양하고 역동적인 관계를 선호하며 새로운 인연을 만나는 것을 좋아합니다.',
      식신: '즐겁고 창의적인 관계를 선호하며 함께 성장해 나가는 것을 중시합니다.',
      상관: '날카롭고 분석적인 관계를 통해 서로를 발전시켜 나갑니다.',
      정인: '깊이 있고 학습지향적인 관계를 선호하며 서로에게 가르침을 줍니다.',
      편인: '정신적이고 철학적인 관계를 추구하며 내면의 성장을 함께 합니다.',
      비견: '동등하고 협력적인 관계에서 서로 도움을 주고받습니다.',
      겁재: '경쟁하면서도 서로를 인정하는 관계에서 발전해 나갑니다.',
    };

    // 가장 강한 십신으로 판단
    const godCounts = {};
    Object.values(tenGods).forEach((god) => {
      if (god !== '일주(본인)') {
        godCounts[god] = (godCounts[god] || 0) + 1;
      }
    });

    const dominantGod = Object.keys(godCounts).reduce(
      (a, b) => (godCounts[a] > godCounts[b] ? a : b),
      Object.keys(godCounts)[0]
    );

    return dominantGod ? relationMap[dominantGod] || '' : '';
  },

  // 재물운
  interpretWealth(dayMaster, tenGods, strongestElement) {
    const baseWealth = this.getDayMasterWealth(dayMaster);
    const tenGodWealth = this.getTenGodWealth(tenGods);
    const elementWealth = this.getElementWealth(strongestElement);

    return `${baseWealth} ${tenGodWealth} ${elementWealth}`;
  },

  getDayMasterWealth(dayMaster) {
    const wealths = {
      갑: '정직한 방법으로 꾸준히 재물을 모으는 타입입니다. 사업보다는 안정적인 직업이 유리합니다.',
      을: '협력과 조화를 통해 재물을 얻습니다. 사람들과의 관계에서 경제적 기회를 얻을 수 있습니다.',
      병: '창의적이고 활발한 활동을 통해 재물을 얻습니다. 엔터테인먼트나 미디어 관련 투자가 좋습니다.',
      정: '꼼꼼하고 신중한 재정 관리로 안정적인 재물을 축적합니다. 저축과 투자에 능합니다.',
      무: '부동산이나 안정적인 자산에 투자하여 재물을 늘려갑니다. 장기적 관점의 투자가 유리합니다.',
      기: '근면성실한 노력으로 재물을 모읍니다. 농업이나 서비스업에서 좋은 수익을 얻을 수 있습니다.',
      경: '정확한 판단력으로 재물을 관리합니다. 금융이나 투자 분야에서 능력을 발휘할 수 있습니다.',
      신: '품질 높은 상품이나 서비스를 통해 재물을 얻습니다. 예술품이나 귀금속 투자가 좋습니다.',
      임: '지혜롭고 전략적인 투자로 재물을 늘려갑니다. 해외 투자나 유통업에서 성공할 수 있습니다.',
      계: '직감과 감성을 활용한 투자로 재물을 얻습니다. 예술이나 문화 관련 투자가 유리합니다.',
    };
    return wealths[dayMaster] || '';
  },

  getTenGodWealth(tenGods) {
    // 재성(정재, 편재)의 비중으로 판단
    let hasWealth = false;
    let wealthType = '';

    Object.values(tenGods).forEach((god) => {
      if (god === '정재' || god === '편재') {
        hasWealth = true;
        wealthType = god;
      }
    });

    if (hasWealth) {
      if (wealthType === '정재') {
        return '정재의 기운으로 안정적이고 꾸준한 재물운을 가지고 있습니다. 저축과 절약으로 재산을 모으는 것이 좋습니다.';
      } else {
        return '편재의 기운으로 변화무쌍한 재물운을 가지고 있습니다. 투자나 사업으로 큰 돈을 벌 수 있는 가능성이 있습니다.';
      }
    }

    return '재물운은 노력에 따라 좌우됩니다. 꾸준한 근로소득과 현명한 투자로 재산을 늘려가시기 바랍니다.';
  },

  getElementWealth(element) {
    const elementWealths = {
      목: '성장하는 사업이나 교육 관련 투자에서 좋은 수익을 얻을 수 있습니다.',
      화: 'IT나 에너지 관련 주식, 미디어 사업에서 수익 기회가 있습니다.',
      토: '부동산이나 건설 관련 투자, 안정적인 배당주에서 좋은 성과를 기대할 수 있습니다.',
      금: '금융상품이나 제조업 관련 투자에서 안정적인 수익을 얻을 수 있습니다.',
      수: '유통이나 물류, 해외 투자에서 좋은 기회를 잡을 수 있습니다.',
    };
    return elementWealths[element] || '';
  },

  // 생애 주기
  interpretLifeCycle(dayMaster, birthYear) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    let lifePeriod = '';
    if (age < 20) {
      lifePeriod = '성장기';
    } else if (age < 40) {
      lifePeriod = '발전기';
    } else if (age < 60) {
      lifePeriod = '성숙기';
    } else {
      lifePeriod = '완성기';
    }

    const baseLife = this.getDayMasterLifeCycle(dayMaster, lifePeriod);
    const ageAdvice = this.getAgeAdvice(age);

    return `현재 ${lifePeriod}에 있는 당신은 ${baseLife} ${ageAdvice}`;
  },

  getDayMasterLifeCycle(dayMaster, period) {
    const lifecycles = {
      갑: {
        성장기: '강한 의지력으로 기초를 다지는 시기입니다. 학습에 집중하고 리더십을 기르세요.',
        발전기: '능력을 발휘하여 성과를 내는 시기입니다. 도전을 두려워하지 마세요.',
        성숙기: '경험을 바탕으로 후배들을 이끄는 시기입니다. 지혜를 나누어 주세요.',
        완성기: '인생의 완성을 향해 가는 시기입니다. 건강관리와 가족에 집중하세요.',
      },
      을: {
        성장기: '유연함을 기르며 다양한 경험을 쌓는 시기입니다. 협력하는 법을 배우세요.',
        발전기: '사람들과의 관계를 통해 성장하는 시기입니다. 네트워킹에 힘쓰세요.',
        성숙기: '조화와 균형을 이루며 안정을 찾는 시기입니다. 가정에 충실하세요.',
        완성기: '온화함과 지혜로 주변을 편안하게 해주는 시기입니다.',
      },
      // ... 다른 일주들도 동일하게 추가
    };

    return lifecycles[dayMaster] ? lifecycles[dayMaster][period] || '' : '';
  },

  getAgeAdvice(age) {
    if (age < 30) {
      return '꿈과 목표를 세우고 기초 실력을 쌓는 것이 중요합니다.';
    } else if (age < 50) {
      return '경력을 쌓고 가정을 이루며 사회적 역할을 다하는 시기입니다.';
    } else if (age < 70) {
      return '경험과 지혜를 바탕으로 여유롭게 인생을 즐기는 시기입니다.';
    } else {
      return '건강관리와 함께 후세에 남길 가치를 생각하는 시기입니다.';
    }
  },

  // 궁합 분석
  interpretCompatibility(dayMaster, gender) {
    const dayElement = this.stemElements[dayMaster];
    const compatible = this.getCompatibleElements(dayElement);
    const avoid = this.getAvoidElements(dayElement);

    return `${dayMaster}일주인 당신과 잘 맞는 상대는 ${compatible
      .map((el) => this.getElementStems(el))
      .flat()
      .join(', ')}일주입니다. 
        특히 ${compatible[0]}의 기운을 가진 사람과는 서로를 보완하며 조화로운 관계를 만들 수 있습니다. 
        반면 ${avoid
          .map((el) => this.getElementStems(el))
          .flat()
          .join(', ')}일주와는 신중하게 접근하는 것이 좋습니다.
        ${gender === 'male' ? '남성' : '여성'}으로서 상대방의 이해와 배려를 중시하며 서로 성장할 수 있는 관계를 만들어 가시기 바랍니다.`;
  },

  getCompatibleElements(element) {
    const compatibility = {
      목: ['수', '화'], // 목을 기르는 수, 목이 기르는 화
      화: ['목', '토'], // 화를 기르는 목, 화가 기르는 토
      토: ['화', '금'], // 토를 기르는 화, 토가 기르는 금
      금: ['토', '수'], // 금을 기르는 토, 금이 기르는 수
      수: ['금', '목'], // 수를 기르는 금, 수가 기르는 목
    };
    return compatibility[element] || [];
  },

  getAvoidElements(element) {
    const avoid = {
      목: ['금'], // 목을 자르는 금
      화: ['수'], // 화를 끄는 수
      토: ['목'], // 토를 뚫는 목
      금: ['화'], // 금을 녹이는 화
      수: ['토'], // 수를 막는 토
    };
    return avoid[element] || [];
  },

  getElementStems(element) {
    const stemsByElement = {
      목: ['갑', '을'],
      화: ['병', '정'],
      토: ['무', '기'],
      금: ['경', '신'],
      수: ['임', '계'],
    };
    return stemsByElement[element] || [];
  },

  // 연도별 운세
  interpretYearlyFortune(dayMaster, strongestElement) {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const thisYear = this.getYearFortune(dayMaster, currentYear);
    const next = this.getYearFortune(dayMaster, nextYear);

    return `올해 ${currentYear}년은 ${thisYear} 내년 ${nextYear}년에는 ${next} 
        ${strongestElement}의 기운이 강한 당신은 해당 년도의 오행과의 관계를 잘 파악하여 
        기회를 놓치지 않도록 하시기 바랍니다.`;
  },

  getYearFortune(dayMaster, year) {
    const dayElement = this.stemElements[dayMaster];
    const yearElement = this.getYearElement(year);
    const relationship = this.getElementRelationship(dayElement, yearElement);

    const fortunes = {
      same: '안정적이고 평온한 해가 될 것입니다.',
      generates: '성장과 발전의 기회가 많은 좋은 해입니다.',
      controls: '주도권을 잡고 성취를 이룰 수 있는 해입니다.',
      controlledBy: '도전이 있지만 극복하면 큰 성장을 이룰 수 있는 해입니다.',
      generatedBy: '도움과 지원을 받기 좋은 해입니다.',
    };

    return fortunes[relationship] || '변화와 기회의 해입니다.';
  },

  // 월별 운세
  interpretMonthlyFortune(dayMaster, strongestElement) {
    const currentMonth = new Date().getMonth() + 1;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const thirdMonth = nextMonth === 12 ? 1 : nextMonth + 1;

    return `이번 달은 ${this.getMonthFortune(dayMaster, currentMonth)}, 
        다음 달에는 ${this.getMonthFortune(dayMaster, nextMonth)}, 
        그 다음 달에는 ${this.getMonthFortune(dayMaster, thirdMonth)} 
        ${strongestElement}의 기운을 잘 활용하여 매달 목표를 세우고 실천하시기 바랍니다.`;
  },

  getMonthFortune(dayMaster, month) {
    const dayElement = this.stemElements[dayMaster];
    const monthElements = ['목', '목', '토', '화', '화', '토', '금', '금', '토', '수', '수', '토'];
    const monthElement = monthElements[month - 1];
    const relationship = this.getElementRelationship(dayElement, monthElement);

    const fortunes = {
      same: '안정된 한 달이 될 것입니다',
      generates: '성과를 거둘 수 있는 좋은 달입니다',
      controls: '적극적으로 나서기 좋은 달입니다',
      controlledBy: '신중함이 필요한 달입니다',
      generatedBy: '도움을 받기 좋은 달입니다',
    };

    return fortunes[relationship] || '변화가 있는 달입니다';
  },

  // 행운 아이템
  interpretLuckyItems(dayElement, strongestElement) {
    const luckyColors = this.getLuckyColors(dayElement);
    const luckyDirections = this.getLuckyDirections(dayElement);
    const luckyNumbers = this.getLuckyNumbers(dayElement);
    const luckyStones = this.getLuckyStones(dayElement);

    return `당신의 행운 색상은 ${luckyColors.join(', ')}입니다. 
        행운의 방향은 ${luckyDirections.join(', ')}쪽이며, 
        행운의 숫자는 ${luckyNumbers.join(', ')}입니다. 
        ${luckyStones.join(', ')} 같은 보석을 지니시면 기운을 보강할 수 있습니다. 
        ${strongestElement}의 기운이 강한 당신은 해당 오행의 색상과 아이템을 활용하시면 더욱 좋습니다.`;
  },

  getLuckyColors(element) {
    const colors = {
      목: ['초록색', '연두색', '청색'],
      화: ['빨간색', '주황색', '분홍색'],
      토: ['노란색', '갈색', '베이지색'],
      금: ['흰색', '은색', '회색'],
      수: ['검은색', '남색', '파란색'],
    };
    return colors[element] || ['흰색'];
  },

  getLuckyDirections(element) {
    const directions = {
      목: ['동쪽', '동남쪽'],
      화: ['남쪽', '남동쪽'],
      토: ['중앙', '남서쪽'],
      금: ['서쪽', '북서쪽'],
      수: ['북쪽', '북동쪽'],
    };
    return directions[element] || ['동쪽'];
  },

  getLuckyNumbers(element) {
    const numbers = {
      목: ['3', '8'],
      화: ['2', '7'],
      토: ['5', '10'],
      금: ['4', '9'],
      수: ['1', '6'],
    };
    return numbers[element] || ['1'];
  },

  getLuckyStones(element) {
    const stones = {
      목: ['에메랄드', '말라카이트', '아벤츄린'],
      화: ['루비', '가넷', '카넬리안'],
      토: ['황수정', '호안석', '재스퍼'],
      금: ['수정', '문스톤', '펄'],
      수: ['사파이어', '라피스라줄리', '아쿠아마린'],
    };
    return stones[element] || ['수정'];
  },

  // 주의사항
  interpretCautions(dayMaster, strongestElement) {
    const baseCaution = this.getDayMasterCaution(dayMaster);
    const elementCaution = this.getElementCaution(strongestElement);

    return `${baseCaution} ${elementCaution} 특히 감정의 기복이 클 때는 중요한 결정을 피하시고, 
        주변 사람들의 조언을 듣는 것이 좋습니다.`;
  },

  getDayMasterCaution(dayMaster) {
    const cautions = {
      갑: '고집이 센 면이 있어 다른 사람의 의견을 무시할 수 있습니다. 유연함을 기르시기 바랍니다.',
      을: '우유부단한 면이 있어 결정을 미룰 수 있습니다. 때로는 과감한 선택이 필요합니다.',
      병: '감정의 기복이 클 수 있습니다. 흥분했을 때는 신중하게 행동하시기 바랍니다.',
      정: '너무 신중해서 기회를 놓칠 수 있습니다. 때로는 과감한 도전이 필요합니다.',
      무: '고집스러운 면이 있어 변화에 저항할 수 있습니다. 새로운 것을 받아들이는 자세가 필요합니다.',
      기: '너무 양보하는 성격으로 손해를 볼 수 있습니다. 자신의 권리도 챙기시기 바랍니다.',
      경: '너무 엄격해서 사람들과의 관계에서 어려움을 겪을 수 있습니다. 포용력을 기르세요.',
      신: '완벽주의 성향으로 스트레스를 받을 수 있습니다. 때로는 80%의 완성도로도 만족하세요.',
      임: '너무 깊게 생각해서 행동이 늦어질 수 있습니다. 때로는 직감을 믿고 행동하세요.',
      계: '감정적으로 상처받기 쉽습니다. 마음의 방어막을 만들고 객관적 시각을 기르세요.',
    };
    return cautions[dayMaster] || '';
  },

  getElementCaution(element) {
    const cautions = {
      목: '목 기운이 강해 급성질을 낼 수 있습니다. 참을성을 기르시기 바랍니다.',
      화: '화 기운이 강해 과도한 흥분을 할 수 있습니다. 차분함을 유지하세요.',
      토: '토 기운이 강해 고집이 셀 수 있습니다. 융통성을 발휘하시기 바랍니다.',
      금: '금 기운이 강해 너무 차갑게 느껴질 수 있습니다. 따뜻함을 표현하세요.',
      수: '수 기운이 강해 우유부단할 수 있습니다. 결단력을 기르시기 바랍니다.',
    };
    return cautions[element] || '';
  },

  // 장점
  interpretStrengths(dayMaster, strongestElement) {
    const baseStrength = this.getDayMasterStrength(dayMaster);
    const elementStrength = this.getElementStrength(strongestElement);

    return `${baseStrength} ${elementStrength} 이러한 장점들을 잘 활용하시면 
        인생에서 큰 성취를 이룰 수 있을 것입니다.`;
  },

  getDayMasterStrength(dayMaster) {
    const strengths = {
      갑: '강한 리더십과 정의감, 추진력이 뛰어납니다. 새로운 일을 시작하는 개척 정신이 훌륭합니다.',
      을: '유연함과 적응력, 배려심이 뛰어납니다. 사람들과 조화롭게 지내는 능력이 탁월합니다.',
      병: '밝고 긍정적인 에너지와 창의력이 뛰어납니다. 사람들에게 희망과 용기를 주는 능력이 있습니다.',
      정: '세심함과 신중함, 책임감이 뛰어납니다. 꼼꼼하고 정확한 일처리로 신뢰를 받습니다.',
      무: '안정감과 신뢰성, 포용력이 뛰어납니다. 든든한 기둥 역할로 주변을 안정시킵니다.',
      기: '너그러움과 성실함, 봉사정신이 뛰어납니다. 묵묵히 최선을 다하는 자세가 훌륭합니다.',
      경: '정의감과 원칙, 결단력이 뛰어납니다. 옳고 그름을 명확히 구분하는 능력이 탁월합니다.',
      신: '세련됨과 품격, 완벽추구 정신이 뛰어납니다. 높은 퀄리티를 추구하는 자세가 훌륭합니다.',
      임: '깊이 있는 사고와 포용력, 지혜가 뛰어납니다. 상황을 전체적으로 파악하는 능력이 탁월합니다.',
      계: '순수함과 감성, 직감력이 뛰어납니다. 예술적 감각과 섬세한 감수성이 훌륭합니다.',
    };
    return strengths[dayMaster] || '';
  },

  getElementStrength(element) {
    const strengths = {
      목: '성장 지향적이고 발전 가능성이 무궁무진합니다. 끊임없이 배우고 발전하려는 의지가 강합니다.',
      화: '활동적이고 열정적인 에너지가 넘칩니다. 창의적이고 표현력이 풍부하여 영향력이 큽니다.',
      토: '안정적이고 신뢰할 수 있는 성품을 가지고 있습니다. 꾸준함과 지속성으로 성과를 만들어냅니다.',
      금: '정확하고 체계적인 사고력을 가지고 있습니다. 분석력과 판단력이 뛰어나 정확한 결정을 내립니다.',
      수: '유연하고 적응력이 뛰어납니다. 상황 변화에 민감하게 반응하고 기회를 잘 포착합니다.',
    };
    return strengths[element] || '';
  },

  // 개선할 점
  interpretWeaknesses(dayMaster, weakestElement, balance) {
    const baseWeakness = this.getDayMasterWeakness(dayMaster);
    const elementWeakness = this.getWeakElementIssue(weakestElement);
    const balanceWeakness = this.getBalanceWeakness(balance);

    return `${baseWeakness} ${elementWeakness} ${balanceWeakness} 
        이러한 부분들을 의식적으로 개선하려 노력하시면 더 균형 잡힌 인생을 살 수 있습니다.`;
  },

  getDayMasterWeakness(dayMaster) {
    const weaknesses = {
      갑: '때로는 고집이 너무 셀 수 있습니다. 다른 사람의 의견에도 귀 기울이는 자세가 필요합니다.',
      을: '우유부단한 면이 있어 결정을 미루는 경향이 있습니다. 때로는 과감한 선택이 필요합니다.',
      병: '감정의 기복이 클 수 있습니다. 일정한 컨디션을 유지하는 것이 중요합니다.',
      정: '지나치게 신중해서 기회를 놓칠 수 있습니다. 때로는 과감한 도전 정신이 필요합니다.',
      무: '변화에 대한 저항감이 있을 수 있습니다. 새로운 것을 받아들이는 유연함이 필요합니다.',
      기: '자신을 희생하는 경향이 있어 손해를 볼 수 있습니다. 자기주장도 할 줄 알아야 합니다.',
      경: '너무 엄격해서 인간관계가 딱딱할 수 있습니다. 부드러운 면도 기를 필요가 있습니다.',
      신: '완벽주의 성향으로 스트레스를 받을 수 있습니다. 때로는 적당한 타협도 필요합니다.',
      임: '너무 깊게 생각해서 행동이 늦어질 수 있습니다. 실행력을 기르는 것이 중요합니다.',
      계: '감정적으로 상처받기 쉽습니다. 정신적 강인함을 기르는 것이 필요합니다.',
    };
    return weaknesses[dayMaster] || '';
  },

  getWeakElementIssue(element) {
    const issues = {
      목: '목 기운이 부족하여 성장 동력이 부족할 수 있습니다. 배움과 도전에 적극적으로 나서세요.',
      화: '화 기운이 부족하여 활력이 떨어질 수 있습니다. 적극적이고 활동적인 자세가 필요합니다.',
      토: '토 기운이 부족하여 안정감이 부족할 수 있습니다. 꾸준함과 지속성을 기르세요.',
      금: '금 기운이 부족하여 정확성이 떨어질 수 있습니다. 세심함과 체계성을 기르세요.',
      수: '수 기운이 부족하여 유연함이 부족할 수 있습니다. 적응력과 융통성을 기르세요.',
    };
    return issues[element] || '';
  },

  getBalanceWeakness(balance) {
    const weaknesses = {
      excellent: '균형이 너무 좋아 때로는 도전 정신이 부족할 수 있습니다.',
      good: '전체적으로 무난하지만 때로는 특별함이 부족할 수 있습니다.',
      fair: '약간의 불균형으로 인해 감정의 기복이 있을 수 있습니다.',
      poor: '오행의 불균형으로 인해 극단적인 성향을 보일 수 있습니다.',
    };
    return weaknesses[balance] || '';
  },

  // 성장 포인트
  interpretGrowthPoints(weakestElement, balance) {
    const elementGrowth = this.getElementGrowthPoint(weakestElement);
    const balanceGrowth = this.getBalanceGrowthPoint(balance);

    return `${elementGrowth} ${balanceGrowth} 
        지속적인 자기계발과 성찰을 통해 더 완전한 인격체로 성장해 나가시기 바랍니다.`;
  },

  getElementGrowthPoint(element) {
    const growthPoints = {
      목: '목 기운을 보강하기 위해 독서, 학습, 새로운 도전을 늘려보세요. 자연 속에서 시간을 보내는 것도 도움이 됩니다.',
      화: '화 기운을 보강하기 위해 운동, 사교활동, 창작활동을 늘려보세요. 밝고 활기찬 환경에서 시간을 보내세요.',
      토: '토 기운을 보강하기 위해 규칙적인 생활, 저축, 안정적인 관계 구축에 힘쓰세요. 꾸준한 노력이 중요합니다.',
      금: '금 기운을 보강하기 위해 체계적인 계획 수립, 정리정돈, 전문성 개발에 집중하세요. 질서 있는 생활을 유지하세요.',
      수: '수 기운을 보강하기 위해 유연한 사고, 다양한 경험, 적응력 개발에 노력하세요. 변화를 두려워하지 마세요.',
    };
    return growthPoints[element] || '';
  },

  getBalanceGrowthPoint(balance) {
    const growthPoints = {
      excellent: '균형이 잘 잡혀 있으니 이를 유지하면서 새로운 도전에 나서보세요.',
      good: '좋은 균형을 바탕으로 한 단계 더 발전할 수 있는 영역을 찾아보세요.',
      fair: '약한 부분을 보강하고 강한 부분을 조절하여 더 나은 균형을 만들어보세요.',
      poor: '극단적인 성향을 완화하고 부족한 부분을 채우는 데 집중하세요.',
    };
    return growthPoints[balance] || '';
  },

  // 십신 해석
  interpretTenGods(tenGods) {
    const godCounts = {};
    Object.values(tenGods).forEach((god) => {
      if (god !== '일주(본인)') {
        godCounts[god] = (godCounts[god] || 0) + 1;
      }
    });

    const dominantGods = Object.keys(godCounts)
      .sort((a, b) => godCounts[b] - godCounts[a])
      .slice(0, 2);

    let analysis = '십신 분석을 통해 보면, ';

    if (dominantGods.length > 0) {
      analysis += `${dominantGods[0]}의 기운이 가장 강하게 나타납니다. ${this.getTenGodMeaning(dominantGods[0])} `;

      if (dominantGods.length > 1 && godCounts[dominantGods[1]] > 0) {
        analysis += `또한 ${dominantGods[1]}의 기운도 있어 ${this.getTenGodMeaning(dominantGods[1])} `;
      }
    }

    analysis += '이러한 십신의 조합은 당신의 성격과 운명에 큰 영향을 미치고 있습니다.';

    return analysis;
  },

  getTenGodMeaning(god) {
    const meanings = {
      정관: '질서를 중시하고 책임감이 강한 성향을 보입니다.',
      편관: '도전 정신이 강하고 권위에 맞서는 성향이 있습니다.',
      정재: '안정적인 재물 관리를 선호하고 검소한 생활을 합니다.',
      편재: '적극적인 투자 성향이 있고 변화를 추구합니다.',
      식신: '창의적이고 예술적인 재능이 있으며 자유로운 표현을 좋아합니다.',
      상관: '비판적 사고가 뛰어나고 분석력이 강합니다.',
      정인: '학습 욕구가 강하고 전통을 중시하는 성향이 있습니다.',
      편인: '독창적인 사고를 하며 정신적 가치를 추구합니다.',
      비견: '협력을 중시하고 동료애가 강한 성향을 보입니다.',
      겁재: '경쟁 의식이 강하고 승부욕이 있습니다.',
    };
    return meanings[god] || '';
  },

  // 기본 해석 생성 (하위 호환성)
  generateInterpretation(saju) {
    return this.generateDetailedInterpretation(saju);
  },
};

// 전역에서 사용할 수 있도록 설정
if (typeof window !== 'undefined') {
  window.sajuCalculator = sajuCalculator;
}
