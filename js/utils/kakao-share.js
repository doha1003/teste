/**
 * 카카오톡 공유 기능 통합 모듈
 * doha.kr - 모든 페이지에서 사용할 수 있는 카카오톡 공유 유틸리티
 */

// 카카오 앱 키는 Config 객체에서 가져옵니다
// config.js 파일이 먼저 로드되어야 합니다

// 카카오 SDK 초기화 상태
let kakaoInitialized = false;

/**
 * 카카오 SDK 초기화
 * @returns {boolean} 초기화 성공 여부
 */
function initializeKakaoSDK() {
    if (typeof Kakao === 'undefined') {
        console.error('Kakao SDK가 로드되지 않았습니다.');
        return false;
    }

    if (typeof Config === 'undefined' || !Config.kakao || !Config.kakao.appKey) {
        console.error('Config.js가 로드되지 않았거나 API 키가 설정되지 않았습니다.');
        return false;
    }

    if (!Config.validateDomain()) {
        console.warn('허용되지 않은 도메인에서 접근하고 있습니다.');
        return false;
    }

    if (kakaoInitialized || Kakao.isInitialized()) {
        console.log('Kakao SDK가 이미 초기화되었습니다.');
        return true;
    }

    try {
        Kakao.init(Config.kakao.appKey);
        kakaoInitialized = true;
        console.log('Kakao SDK 초기화 성공');
        
        // 초기화 확인
        if (!Kakao.isInitialized()) {
            console.error('Kakao SDK 초기화 확인 실패');
            kakaoInitialized = false;
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Kakao SDK 초기화 오류:', error);
        
        // 오류 코드 4011 처리 (잘못된 앱 키)
        if (error.message && error.message.includes('4011')) {
            alert('카카오톡 공유 기능에 문제가 있습니다. 관리자에게 문의해주세요.\n(오류 코드: 4011 - 앱 키 오류)');
        }
        
        return false;
    }
}

/**
 * 카카오톡 공유하기
 * @param {Object} options - 공유 옵션
 * @param {string} options.title - 제목
 * @param {string} options.description - 설명
 * @param {string} options.imageUrl - 이미지 URL
 * @param {string} options.webUrl - 웹 URL
 * @param {string} options.mobileWebUrl - 모바일 웹 URL (선택)
 * @param {string} options.buttonTitle - 버튼 텍스트 (기본값: '자세히 보기')
 */
function shareToKakao(options) {
    // SDK 초기화 확인
    if (!initializeKakaoSDK()) {
        console.error('카카오 SDK 초기화 실패로 공유할 수 없습니다.');
        showShareFallback(options.webUrl);
        return;
    }

    // 필수 파라미터 확인
    if (!options.title || !options.webUrl) {
        console.error('필수 파라미터가 누락되었습니다.');
        return;
    }

    // 공유 옵션 설정
    const shareConfig = {
        objectType: 'feed',
        content: {
            title: options.title,
            description: options.description || '',
            imageUrl: options.imageUrl || 'https://doha.kr/images/og-default.png',
            link: {
                webUrl: options.webUrl,
                mobileWebUrl: options.mobileWebUrl || options.webUrl
            }
        }
    };

    // 버튼 추가 (선택사항)
    if (options.buttonTitle) {
        shareConfig.buttons = [{
            title: options.buttonTitle,
            link: {
                webUrl: options.webUrl,
                mobileWebUrl: options.mobileWebUrl || options.webUrl
            }
        }];
    }

    // 카카오톡 공유 실행
    try {
        Kakao.Share.sendDefault(shareConfig);
    } catch (error) {
        console.error('카카오톡 공유 오류:', error);
        
        // 에러 처리
        if (error.code === -606) {
            alert('카카오톡이 설치되어 있지 않습니다.');
        } else if (error.code === 4011) {
            alert('카카오톡 공유 기능에 문제가 있습니다.\n앱 키를 확인해주세요.');
        } else {
            alert('카카오톡 공유 중 오류가 발생했습니다.');
        }
        
        // 폴백: 링크 복사
        showShareFallback(options.webUrl);
    }
}

/**
 * 공유 폴백 (링크 복사)
 * @param {string} url - 복사할 URL
 */
function showShareFallback(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            alert('링크가 복사되었습니다!\n카카오톡에 붙여넣어 공유해주세요.');
        }).catch(() => {
            prompt('링크를 복사해서 공유해주세요:', url);
        });
    } else {
        prompt('링크를 복사해서 공유해주세요:', url);
    }
}

/**
 * MBTI 테스트 결과 공유
 * @param {string} mbtiType - MBTI 유형 (예: 'INTJ')
 * @param {string} title - MBTI 유형 제목
 * @param {string} description - MBTI 유형 설명
 */
function shareMBTIResult(mbtiType, title, description) {
    const url = `https://doha.kr/tests/mbti/test.html?result=${mbtiType}`;
    
    shareToKakao({
        title: `나의 MBTI는 ${mbtiType} - ${title}`,
        description: description || `${mbtiType} 유형의 특징을 확인해보세요!`,
        imageUrl: `https://doha.kr/images/mbti/${mbtiType.toLowerCase()}.png`,
        webUrl: url,
        buttonTitle: '나도 테스트하기'
    });
}

/**
 * 테토-에겐 테스트 결과 공유
 * @param {string} typeCode - 유형 코드
 * @param {string} typeName - 유형 이름
 * @param {string} typeDescription - 유형 설명
 */
function shareTetoEgenResult(typeCode, typeName, typeDescription) {
    const url = `https://doha.kr/tests/teto-egen/test.html?result=${typeCode}`;
    
    shareToKakao({
        title: `나의 테토-에겐 유형은 ${typeName}`,
        description: typeDescription || '당신의 숨겨진 성격을 발견해보세요!',
        imageUrl: 'https://doha.kr/images/teto-egen-og.png',
        webUrl: url,
        buttonTitle: '나도 테스트하기'
    });
}

/**
 * Love DNA 테스트 결과 공유
 * @param {string} dnaType - DNA 유형
 * @param {string} dnaName - DNA 이름
 * @param {string} dnaDescription - DNA 설명
 */
function shareLoveDNAResult(dnaType, dnaName, dnaDescription) {
    const url = `https://doha.kr/tests/love-dna/result.html?type=${dnaType}`;
    
    shareToKakao({
        title: `나의 러브 DNA는 ${dnaName}`,
        description: dnaDescription || '당신의 연애 스타일을 확인해보세요!',
        imageUrl: 'https://doha.kr/images/love-dna-og.png',
        webUrl: url,
        buttonTitle: '나도 테스트하기'
    });
}

/**
 * 일반 페이지 공유
 * @param {string} title - 페이지 제목
 * @param {string} description - 페이지 설명
 * @param {string} url - 페이지 URL
 */
function shareGeneralPage(title, description, url) {
    shareToKakao({
        title: title,
        description: description,
        webUrl: url || window.location.href,
        buttonTitle: '자세히 보기'
    });
}

// DOM 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 카카오 SDK 로드 확인 (1초 대기)
    setTimeout(() => {
        if (typeof Kakao !== 'undefined') {
            initializeKakaoSDK();
        } else {
            console.warn('Kakao SDK가 아직 로드되지 않았습니다.');
        }
    }, 1000);
});

// 전역 함수로 내보내기 (기존 코드 호환성)
window.shareToKakao = shareToKakao;
window.shareMBTIResult = shareMBTIResult;
window.shareTetoEgenResult = shareTetoEgenResult;
window.shareLoveDNAResult = shareLoveDNAResult;
window.shareGeneralPage = shareGeneralPage;

// 모듈 내보내기 (ES6 모듈 지원)
export {
    initializeKakaoSDK,
    shareToKakao,
    shareMBTIResult,
    shareTetoEgenResult,
    shareLoveDNAResult,
    shareGeneralPage
};