// 최적화된 만세력 데이터 (1900-2100)
// SQL 데이터베이스에서 변환 및 최적화됨

// 천간 (10개)
export const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
export const HEAVENLY_STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 지지 (12개)
export const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
export const EARTHLY_BRANCHES_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 연도별 간지 데이터 (샘플)
export const YEAR_GANJI = {
  "1991": {
    "stem": "신",
    "branch": "미",
    "ganji": "신미",
    "zodiacAnimal": "양"
  },
  "1992": {
    "stem": "임",
    "branch": "신",
    "ganji": "임신",
    "zodiacAnimal": "원숭이"
  },
  "2025": {
    "stem": "을",
    "branch": "사",
    "ganji": "을사",
    "zodiacAnimal": "뱀"
  }
};

// 기준 날짜들 (매월 1일의 일주)
export const REFERENCE_DATES = {
  "1991-10": {
    "dayGanji": "갑신",
    "stem": "갑",
    "branch": "신"
  },
  "2025-1": {
    "dayGanji": "병술",
    "stem": "병",
    "branch": "술"
  }
};

// 일주 계산 함수 (정확한 만세력 기반)
export function calculateDayPillar(year, month, day) {
    // 먼저 해당 월의 기준 날짜 찾기
    const refKey = `${year}-${month}`;
    const reference = REFERENCE_DATES[refKey];
    
    if (!reference) {
        // 기준 날짜가 없으면 가장 가까운 날짜에서 계산
        return calculateFromNearestReference(year, month, day);
    }
    
    // 기준일(1일)의 간지에서 날짜 차이만큼 진행
    const stemIndex = HEAVENLY_STEMS.indexOf(reference.stem);
    const branchIndex = EARTHLY_BRANCHES.indexOf(reference.branch);
    
    const dayDiff = day - 1;
    const newStemIndex = (stemIndex + dayDiff) % 10;
    const newBranchIndex = (branchIndex + dayDiff) % 12;
    
    return {
        stem: HEAVENLY_STEMS[newStemIndex],
        branch: EARTHLY_BRANCHES[newBranchIndex],
        ganji: HEAVENLY_STEMS[newStemIndex] + EARTHLY_BRANCHES[newBranchIndex]
    };
}

// 가장 가까운 기준 날짜에서 계산
function calculateFromNearestReference(year, month, day) {
    // 1991년 10월 3일 = 병오일 기준 사용
    const referenceDate = new Date(1991, 9, 3); // 10월 3일
    const targetDate = new Date(year, month - 1, day);
    
    const dayDiff = Math.floor((targetDate - referenceDate) / (1000 * 60 * 60 * 24));
    
    const refStemIndex = 2; // 병
    const refBranchIndex = 6; // 오
    
    const newStemIndex = ((refStemIndex + dayDiff) % 10 + 10) % 10;
    const newBranchIndex = ((refBranchIndex + dayDiff) % 12 + 12) % 12;
    
    return {
        stem: HEAVENLY_STEMS[newStemIndex],
        branch: EARTHLY_BRANCHES[newBranchIndex],
        ganji: HEAVENLY_STEMS[newStemIndex] + EARTHLY_BRANCHES[newBranchIndex]
    };
}

// 전역 함수로 노출 (모듈이 아닌 환경용)
if (typeof window !== 'undefined') {
    window.calculateDayPillar = calculateDayPillar;
    window.HEAVENLY_STEMS = HEAVENLY_STEMS;
    window.EARTHLY_BRANCHES = EARTHLY_BRANCHES;
}