/**
 * 음력 달력 스텁 모듈
 * 실제 만세력 데이터가 로드되기 전까지 사용되는 임시 모듈
 *
 * 실제 데이터는 lunar-calendar-compact.js에 있으며,
 * 이 스텁은 기본적인 계산만 제공합니다.
 */

// 간지 데이터
const YG = [
  '庚子',
  '辛丑',
  '壬寅',
  '癸卯',
  '甲辰',
  '乙巳',
  '丙午',
  '丁未',
  '戊申',
  '己酉',
  '庚戌',
  '辛亥',
  '壬子',
  '癸丑',
  '甲寅',
  '乙卯',
  '丙辰',
  '丁巳',
  '戊午',
  '己未',
  '庚申',
  '辛酉',
  '壬戌',
  '癸亥',
  '甲子',
  '乙丑',
  '丙寅',
  '丁卯',
  '戊辰',
  '己巳',
  '庚午',
  '辛未',
  '壬申',
  '癸酉',
  '甲戌',
  '乙亥',
  '丙子',
  '丁丑',
  '戊寅',
  '己卯',
  '庚辰',
  '辛巳',
  '壬午',
  '癸未',
  '甲申',
  '乙酉',
  '丙戌',
  '丁亥',
  '戊子',
  '己丑',
  '庚寅',
  '辛卯',
  '壬辰',
  '癸巳',
  '甲午',
  '乙未',
  '丙申',
  '丁酉',
  '戊戌',
  '己亥',
];
const YGK = [
  '경자',
  '신축',
  '임인',
  '계묘',
  '갑진',
  '을사',
  '병오',
  '정미',
  '무신',
  '기유',
  '경술',
  '신해',
  '임자',
  '계축',
  '갑인',
  '을묘',
  '병진',
  '정사',
  '무오',
  '기미',
  '경신',
  '신유',
  '임술',
  '계해',
  '갑자',
  '을축',
  '병인',
  '정묘',
  '무진',
  '기사',
  '경오',
  '신미',
  '임신',
  '계유',
  '갑술',
  '을해',
  '병자',
  '정축',
  '무인',
  '기묘',
  '경진',
  '신사',
  '임오',
  '계미',
  '갑신',
  '을유',
  '병술',
  '정해',
  '무자',
  '기축',
  '경인',
  '신묘',
  '임진',
  '계사',
  '갑오',
  '을미',
  '병신',
  '정유',
  '무술',
  '기해',
];
const DG = [
  '乙丑',
  '丙寅',
  '丁卯',
  '戊辰',
  '己巳',
  '庚午',
  '辛未',
  '壬申',
  '癸酉',
  '甲戌',
  '乙亥',
  '丙子',
  '丁丑',
  '戊寅',
  '己卯',
  '庚辰',
  '辛巳',
  '壬午',
  '癸未',
  '甲申',
  '乙酉',
  '丙戌',
  '丁亥',
  '戊子',
  '己丑',
  '庚寅',
  '辛卯',
  '壬辰',
  '癸巳',
  '甲午',
  '乙未',
  '丙申',
  '丁酉',
  '戊戌',
  '己亥',
  '庚子',
  '辛丑',
  '癸卯',
  '甲辰',
  '乙巳',
  '丙午',
  '丁未',
  '戊申',
  '己酉',
  '庚戌',
  '辛亥',
  '壬子',
  '癸丑',
  '甲寅',
  '乙卯',
  '丙辰',
  '丁巳',
  '戊午',
  '己未',
  '庚申',
  '辛酉',
  '壬戌',
  '癸亥',
  '甲子',
  '壬寅',
];
const DGK = [
  '을축',
  '병인',
  '정묘',
  '무진',
  '기사',
  '경오',
  '신미',
  '임신',
  '계유',
  '갑술',
  '을해',
  '병자',
  '정축',
  '무인',
  '기묘',
  '경진',
  '신사',
  '임오',
  '계미',
  '갑신',
  '을유',
  '병술',
  '정해',
  '무자',
  '기축',
  '경인',
  '신묘',
  '임진',
  '계사',
  '갑오',
  '을미',
  '병신',
  '정유',
  '무술',
  '기해',
  '경자',
  '신축',
  '계묘',
  '갑진',
  '을사',
  '병오',
  '정미',
  '무신',
  '기유',
  '경술',
  '신해',
  '임자',
  '계축',
  '갑인',
  '을묘',
  '병진',
  '정사',
  '무오',
  '기미',
  '경신',
  '신유',
  '임술',
  '계해',
  '갑자',
  '임인',
];

// 천간과 지지
const HEAVENLY_STEMS = [
  '갑',
  '을',
  '병',
  '정',
  '무',
  '기',
  '경',
  '신',
  '임',
  '계',
];
const EARTHLY_BRANCHES = [
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

/**
 * 기본적인 음력 날짜 계산 (간단한 공식 사용)
 */
function getLunarDate(year, month, day) {
  // 기준일: 1991년 10월 3일 = 병오일
  const referenceDate = new Date(1991, 9, 3);
  const targetDate = new Date(year, month - 1, day);

  const daysDiff = Math.floor(
    (targetDate - referenceDate) / (1000 * 60 * 60 * 24)
  );

  // 일간지 계산
  let dayStemIndex = (2 + daysDiff) % 10; // 병(2)부터 시작
  let dayBranchIndex = (6 + daysDiff) % 12; // 오(6)부터 시작

  if (dayStemIndex < 0) dayStemIndex += 10;
  if (dayBranchIndex < 0) dayBranchIndex += 12;

  const dayStem = HEAVENLY_STEMS[dayStemIndex];
  const dayBranch = EARTHLY_BRANCHES[dayBranchIndex];

  // 년간지 계산 (갑자년 1984 기준)
  const yearDiff = year - 1984;
  let yearGanjiIndex = yearDiff % 60;
  if (yearGanjiIndex < 0) yearGanjiIndex += 60;

  // 간단한 음력 날짜 추정 (실제로는 복잡한 계산 필요)
  const lunarYear = year;
  const lunarMonth = month;
  const lunarDay = day;

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    yearGanji: {
      hanja: YG[yearGanjiIndex],
      korean: YGK[yearGanjiIndex],
    },
    dayGanji: {
      hanja: dayStem + dayBranch,
      korean: dayStem + dayBranch,
    },
  };
}

/**
 * 지원되는 년도 범위
 */
function getSupportedYearRange() {
  return {
    min: 1841,
    max: 2110,
  };
}

// 브라우저 환경에서 전역으로 노출
if (typeof window !== 'undefined') {
  window.LunarCalendarCompact = {
    getLunarDate,
    getSupportedYearRange,
  };
}
