/**
 * 공유 기능 헬퍼 모듈
 * 소셜 공유, 클립보드 복사 관련 함수들
 */

// 결과 공유 기능
export function shareResult(platform, title, url) {
    const text = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url || window.location.href);
    
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
        kakao: `https://story.kakao.com/share?url=${encodedUrl}`,
        line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
        copylink: null
    };
    
    if (platform === 'copylink') {
        copyToClipboard(url || window.location.href);
        showNotification('링크가 복사되었습니다!');
    } else if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

// 클립보드에 복사
export function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('복사 실패:', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// 클립보드 복사 폴백
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('복사 실패:', err);
    }
    
    document.body.removeChild(textArea);
}

// 카카오 공유하기 (SDK 사용)
export function shareKakao(options) {
    if (typeof Kakao === 'undefined') {
        console.error('카카오 SDK가 로드되지 않았습니다.');
        return;
    }

    if (!Kakao.isInitialized()) {
        console.error('카카오 SDK가 초기화되지 않았습니다.');
        return;
    }

    try {
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: options.title || '재미있는 테스트 결과를 확인해보세요!',
                description: options.description || 'doha.kr에서 다양한 심리테스트와 운세를 경험해보세요.',
                imageUrl: options.imageUrl || 'https://doha.kr/images/og-default.png',
                link: {
                    mobileWebUrl: options.url || window.location.href,
                    webUrl: options.url || window.location.href
                }
            },
            buttons: [
                {
                    title: '테스트 하러가기',
                    link: {
                        mobileWebUrl: options.url || window.location.href,
                        webUrl: options.url || window.location.href
                    }
                }
            ]
        });
    } catch (error) {
        console.error('카카오 공유 실패:', error);
        // 폴백으로 링크 복사
        copyToClipboard(options.url || window.location.href);
        showNotification('링크가 복사되었습니다!');
    }
}

// 운세 공유하기
export function shareFortune(platform, fortuneType, result) {
    const title = `doha.kr에서 ${fortuneType} 결과를 확인했어요!`;
    const description = result ? `${result.slice(0, 50)}...` : '';
    const url = window.location.href;
    
    if (platform === 'kakao') {
        shareKakao({
            title: title,
            description: description,
            url: url
        });
    } else {
        shareResult(platform, title, url);
    }
}

// 테스트 결과 공유하기
export function shareTestResult(platform, testName, resultTitle, description) {
    const title = `${testName}: ${resultTitle}`;
    const url = window.location.href;
    
    if (platform === 'kakao') {
        shareKakao({
            title: title,
            description: description,
            url: url
        });
    } else {
        shareResult(platform, title, url);
    }
}

// 알림 표시 함수 (다른 모듈에서 import하는 경우를 위해)
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 스타일 추가
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}