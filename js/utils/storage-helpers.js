/**
 * 스토리지 헬퍼 모듈
 * 로컬 스토리지, 쿠키 관련 공통 함수들
 */

// 로컬 스토리지 헬퍼
export const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },
    
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage clear error:', e);
            return false;
        }
    }
};

// 쿠키 관련 함수들
export function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

export function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// 운세 관련 스토리지 함수들
export function fortuneHelpers() {
    // 운세 결과 저장
    function saveFortune(type, data) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
        const fortuneKey = `fortune_${type}_${today}`;
        storage.set(fortuneKey, data);
    }
    
    // 운세 결과 불러오기
    function loadFortune(type) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
        const fortuneKey = `fortune_${type}_${today}`;
        return storage.get(fortuneKey);
    }
    
    // 운세 기록 삭제
    function clearFortune(type) {
        const today = new Date().toISOString().split('T')[0];
        const fortuneKey = `fortune_${type}_${today}`;
        storage.remove(fortuneKey);
    }
    
    return {
        save: saveFortune,
        load: loadFortune,
        clear: clearFortune
    };
}