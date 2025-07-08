/**
 * 포맷팅 헬퍼 모듈
 * 날짜, 숫자, 텍스트 포맷팅 관련 함수들
 */

// 날짜 포맷팅
export function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

// 숫자 포맷팅 (천 단위 콤마)
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 한국어 날짜 포맷팅
export function formatKoreanDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[d.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${dayName})`;
}

// 시간 차이 계산 (상대적 시간)
export function getRelativeTime(date) {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now - targetDate) / 1000);
    
    if (diffInSeconds < 60) {
        return '방금 전';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}분 전`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}시간 전`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}일 전`;
    } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months}개월 전`;
    } else {
        const years = Math.floor(diffInSeconds / 31536000);
        return `${years}년 전`;
    }
}

// 텍스트 줄임 표시
export function truncateText(text, maxLength = 100, suffix = '...') {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + suffix;
}

// 바이트 크기 포맷팅
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// 퍼센트 포맷팅
export function formatPercentage(value, total, decimals = 1) {
    if (total === 0) return '0%';
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(decimals)}%`;
}

// 전화번호 포맷팅
export function formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    
    return phoneNumber;
}

// 이메일 마스킹
export function maskEmail(email) {
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;
    
    const maskedUsername = username.length > 2 
        ? username.substring(0, 2) + '*'.repeat(username.length - 2)
        : username;
    
    return `${maskedUsername}@${domain}`;
}

// URL 파라미터 파싱
export function parseUrlParams(url = window.location.href) {
    const urlObj = new URL(url);
    const params = {};
    
    for (const [key, value] of urlObj.searchParams) {
        params[key] = value;
    }
    
    return params;
}

// URL 파라미터 생성
export function buildUrlParams(params) {
    const searchParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined) {
            searchParams.append(key, value);
        }
    }
    
    return searchParams.toString();
}

// HTML 태그 제거
export function stripHtmlTags(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
}

// 문자열 캐피털라이즈
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// 카멜케이스를 케밥케이스로 변환
export function camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

// 케밥케이스를 카멜케이스로 변환
export function kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}