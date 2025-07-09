/**
 * 음력 달력 로더 모듈
 * lunar-calendar-compact.js의 큰 용량 문제를 해결하기 위한 래퍼
 * 
 * 이 모듈은 필요시 동적으로 lunar-calendar-compact.js를 로드합니다.
 */

// 음력 모듈 로드 상태
let lunarModule = null;
let loadingPromise = null;

/**
 * 음력 모듈을 동적으로 로드
 */
async function loadLunarModule() {
    if (lunarModule) return lunarModule;
    
    if (loadingPromise) return loadingPromise;
    
    loadingPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/js/lunar-calendar-compact.js';
        script.type = 'module';
        
        script.onload = () => {
            // 모듈이 로드되면 전역 객체 또는 ES6 모듈로 접근
            if (window.LunarCalendarCompact) {
                lunarModule = window.LunarCalendarCompact;
                resolve(lunarModule);
            } else {
                reject(new Error('음력 모듈을 찾을 수 없습니다.'));
            }
        };
        
        script.onerror = () => {
            reject(new Error('음력 모듈 로드 실패'));
        };
        
        document.head.appendChild(script);
    });
    
    return loadingPromise;
}

/**
 * 양력을 음력으로 변환 (프록시 함수)
 * @param {number} year - 양력 년도
 * @param {number} month - 양력 월
 * @param {number} day - 양력 일
 * @returns {Promise<Object>} 음력 정보
 */
export async function getLunarDate(year, month, day) {
    const module = await loadLunarModule();
    return module.getLunarDate(year, month, day);
}

/**
 * 지원되는 년도 범위 조회 (프록시 함수)
 * @returns {Promise<Object>} 최소/최대 년도
 */
export async function getSupportedYearRange() {
    const module = await loadLunarModule();
    return module.getSupportedYearRange();
}

// 전역 객체로도 노출 (하위 호환성)
if (typeof window !== 'undefined') {
    window.LunarCalendarLoader = {
        getLunarDate,
        getSupportedYearRange,
        loadLunarModule
    };
}