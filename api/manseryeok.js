// Manseryeok API endpoint for Vercel
// This file should be in /api/manseryeok.js for Vercel to recognize it

const manseryeokData = require('../data/manseryeok-compact.json');

// 날짜 유효성 검사
function isValidDate(year, month, day) {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() == year && 
           date.getMonth() == month - 1 && 
           date.getDate() == day;
}

// 월간지 계산
function calculateMonthGanji(year, month, yearStem) {
    const monthStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
    const monthBranches = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
    
    // 절기 기준 월
    const solarMonth = month <= 2 ? month + 10 : month - 2;
    
    // 년간에 따른 월간 계산
    const yearStemIndex = monthStems.indexOf(yearStem);
    const monthStemIndex = (yearStemIndex * 2 + Math.floor((solarMonth - 1) / 2)) % 10;
    
    const monthStem = monthStems[monthStemIndex];
    const monthBranch = monthBranches[(solarMonth - 1) % 12];
    
    return monthStem + monthBranch;
}

// 시간 간지 계산
function getHourGanji(hour, dayStem) {
    const hourBranches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
    const hourStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
    
    const hourIndex = Math.floor((hour + 1) / 2) % 12;
    const hourBranch = hourBranches[hourIndex];
    
    const dayStemIndex = hourStems.indexOf(dayStem);
    const hourStemStartIndex = (dayStemIndex % 5) * 2;
    const hourStemIndex = (hourStemStartIndex + hourIndex) % 10;
    const hourStem = hourStems[hourStemIndex];
    
    return {
        stem: hourStem,
        branch: hourBranch,
        ganji: hourStem + hourBranch
    };
}

// 만세력 데이터 조회
function getManseryeokData(year, month, day, hour) {
    try {
        if (!manseryeokData[year] || !manseryeokData[year][month] || !manseryeokData[year][month][day]) {
            return null;
        }
        
        const dayData = manseryeokData[year][month][day];
        const monthGanji = calculateMonthGanji(year, month, dayData.ys);
        
        const result = {
            year,
            month,
            day,
            yearGanji: dayData.yg || '',
            monthGanji: monthGanji,
            dayGanji: dayData.dg || '',
            yearStem: dayData.ys || '',
            yearBranch: dayData.yb || '',
            monthStem: monthGanji.charAt(0) || '',
            monthBranch: monthGanji.charAt(1) || '',
            dayStem: dayData.ds || '',
            dayBranch: dayData.db || '',
            lunarMonth: dayData.lm || 0,
            lunarDay: dayData.ld || 0,
            isLeapMonth: dayData.lp || false
        };
        
        // 시간이 제공된 경우 시간 간지 추가
        if (hour !== null && hour !== undefined && hour >= 0 && hour <= 23) {
            const hourGanji = getHourGanji(hour, dayData.ds);
            result.hourStem = hourGanji.stem;
            result.hourBranch = hourGanji.branch;
            result.hourGanji = hourGanji.ganji;
            result.hour = hour;
        }
        
        return result;
        
    } catch (error) {
        console.error('Manseryeok data error:', error);
        return null;
    }
}

// API 핸들러
export default function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // GET 요청만 허용
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // 쿼리 파라미터 추출
        const { year, month, day, hour } = req.query;
        
        // 필수 파라미터 검증
        if (!year || !month || !day) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['year', 'month', 'day']
            });
        }
        
        // 숫자 변환 및 검증
        const y = parseInt(year);
        const m = parseInt(month);
        const d = parseInt(day);
        const h = hour ? parseInt(hour) : null;
        
        // 날짜 범위 검증
        if (y < 1841 || y > 2100) {
            return res.status(400).json({
                error: 'Year must be between 1841 and 2100'
            });
        }
        
        if (m < 1 || m > 12) {
            return res.status(400).json({
                error: 'Month must be between 1 and 12'
            });
        }
        
        if (d < 1 || d > 31) {
            return res.status(400).json({
                error: 'Day must be between 1 and 31'
            });
        }
        
        if (!isValidDate(y, m, d)) {
            return res.status(400).json({
                error: 'Invalid date'
            });
        }
        
        // 만세력 데이터 조회
        const manseryeok = getManseryeokData(y, m, d, h);
        
        if (!manseryeok) {
            return res.status(404).json({
                error: 'Manseryeok data not found for this date'
            });
        }
        
        // 캐시 헤더 설정 (1일)
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
        
        return res.status(200).json({
            success: true,
            data: manseryeok
        });
        
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}