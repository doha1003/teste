/**
 * iOS Safari PWA 최적화
 * iOS Safari의 PWA 특성을 고려한 최적화 및 호환성 처리
 * 
 * Features:
 * - iOS Safari 특화 터치 제스처
 * - Safe Area 대응
 * - iOS PWA 설치 안내
 * - 뷰포트 최적화
 * - 터치 반응성 개선
 */

class IOSSafariOptimizer {
  constructor() {
    this.config = {
      // iOS 감지 설정
      detection: {
        iOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        Safari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
        PWAMode: window.matchMedia('(display-mode: standalone)').matches,
        version: this.getIOSVersion(),
      },
      
      // 터치 제스처 설정
      touch: {
        maxTapDistance: 10,
        maxTapTime: 300,
        scrollThreshold: 5,
        swipeThreshold: 100,
        swipeMinVelocity: 0.3,
      },
      
      // 뷰포트 설정
      viewport: {
        safeAreaInsets: null,
        orientationChangeDelay: 500,
        scrollLockEnabled: false,
      },
      
      // 성능 설정
      performance: {
        passiveEventListeners: true,
        touchActionOptimization: true,
        scrollOptimization: true,
      },
      
      // UI 개선 설정
      ui: {
        bounceScrollDisabled: false,
        tapHighlightDisabled: true,
        userSelectOptimized: true,
        safariBarHiding: true,
      },
    };
    
    this.state = {
      isIOSDevice: false,
      isSafari: false,
      isPWAMode: false,
      orientation: null,
      safeAreaInsets: null,
      touchStartTime: 0,
      touchStartPos: null,
      scrollLocked: false,
    };
    
    this.init();
  }
  
  /**
   * 초기화
   */
  init() {
this.detectIOSEnvironment();

if (this.state.isIOSDevice) {
this.setupIOSOptimizations();
this.setupSafeAreaHandling();
this.setupTouchOptimization();
this.setupViewportHandling();
this.setupPWASpecificFeatures();
this.setupIOSInstallPrompt();

console.log('[iOS Safari] iOS 최적화 적용됨:', this.state);
}

// 모든 브라우저에서 공통 적용할 터치 개선사항
this.setupUniversalTouchImprovements();
}

/**
* iOS 환경 감지
*/
detectIOSEnvironment() {
this.state.isIOSDevice = this.config.detection.iOS;
this.state.isSafari = this.config.detection.Safari;
this.state.isPWAMode = this.config.detection.PWAMode;
this.state.orientation = this.getOrientation();

// iOS 버전별 특별 처리
const iosVersion = this.config.detection.version;
if (iosVersion) {
this.handleIOSVersionSpecifics(iosVersion);
}

// Body에 클래스 추가
document.body.classList.toggle('ios-device', this.state.isIOSDevice);
document.body.classList.toggle('safari-browser', this.state.isSafari);
document.body.classList.toggle('pwa-mode', this.state.isPWAMode);
}

/**
* iOS 최적화 설정
*/
setupIOSOptimizations() {
// CSS 변수 설정
this.setCSSOptimizations();

// 메타 태그 동적 설정
this.setIOSMetaTags();

// 스크롤 최적화
this.setupScrollOptimization();

// 터치 피드백 최적화
this.setupTouchFeedback();

// 키보드 처리
this.setupKeyboardHandling();
}

/**
* CSS 최적화 설정
*/
setCSSOptimizations() {
const style = document.createElement('style');
style.id = 'ios-safari-optimizations';
style.textContent = `
:root {
/* iOS Safe Area 변수 */
--safe-area-inset-top: env(safe-area-inset-top);
--safe-area-inset-right: env(safe-area-inset-right);
--safe-area-inset-bottom: env(safe-area-inset-bottom);
--safe-area-inset-left: env(safe-area-inset-left);
}

/* iOS 전용 최적화 */
.ios-device {
/* 터치 최적화 */
-webkit-touch-callout: none;
-webkit-text-size-adjust: 100%;
-webkit-tap-highlight-color: transparent;

/* 스크롤 최적화 */
-webkit-overflow-scrolling: touch;
overscroll-behavior: none;
}

/* PWA 모드 최적화 */
.pwa-mode {
/* 상태바 영역 고려 */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
}

/* 터치 타겟 최적화 */
.ios-device button,
.ios-device [role=\"button\"],
.ios-device .btn {
min-height: 44px;
min-width: 44px;
touch-action: manipulation;
}

/* 스크롤 영역 최적화 */
.ios-device .scroll-container {
-webkit-overflow-scrolling: touch;
overflow-scrolling: touch;
}

/* 입력 필드 최적화 */
.ios-device input,
.ios-device textarea,
.ios-device select {
-webkit-appearance: none;
-webkit-border-radius: 0;
border-radius: 8px;
font-size: 16px; /* 줌 방지 */
}

/* 터치 피드백 */
.ios-device .touch-feedback {
-webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
transition: background-color 0.1s ease;
}

.ios-device .touch-feedback:active {
background-color: rgba(0, 0, 0, 0.05);
}

/* 스크롤 락 */
.ios-device.scroll-locked {
position: fixed;
width: 100%;
overflow: hidden;
}

/* Safari 바 숨김 처리 */
.safari-browser.pwa-mode {
/* 전체 화면 활용 */
height: 100vh;
height: -webkit-fill-available;
}
`;

document.head.appendChild(style);
}

/**
* iOS 메타 태그 설정
*/
setIOSMetaTags() {
// 기존 메타 태그 확인 및 업데이트
this.updateMetaTag('apple-mobile-web-app-capable', 'yes');
this.updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');
this.updateMetaTag('apple-mobile-web-app-title', 'doha.kr');

// 뷰포트 최적화
const viewportMeta = document.querySelector('meta[name=\"viewport\"]');
if (viewportMeta) {
viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
}
}

/**
* Safe Area 처리
*/
setupSafeAreaHandling() {
// Safe Area Inset 값 계산
this.calculateSafeAreaInsets();

// 오리엔테이션 변경 감지
window.addEventListener('orientationchange', () => {
setTimeout(() => {
this.handleOrientationChange();
}, this.config.viewport.orientationChangeDelay);
});

// 리사이즈 이벤트
window.addEventListener('resize', this.debounce(() => {
this.calculateSafeAreaInsets();
}, 300));
}

/**
* 터치 최적화
*/
setupTouchOptimization() {
// 패시브 이벤트 리스너 설정
const passiveOptions = this.config.performance.passiveEventListeners ? 
{ passive: true } : false;

// 터치 이벤트 통합 처리
document.addEventListener('touchstart', (e) => {
this.handleTouchStart(e);
}, passiveOptions);

document.addEventListener('touchmove', (e) => {
this.handleTouchMove(e);
}, { passive: false }); // 스크롤 제어를 위해 passive: false

document.addEventListener('touchend', (e) => {
this.handleTouchEnd(e);
}, passiveOptions);

// 더블 탭 줌 방지
this.preventDoubleZoom();

// 스와이프 제스처 설정
this.setupSwipeGestures();
}

/**
* 터치 시작 처리
*/
handleTouchStart(e) {
this.state.touchStartTime = Date.now();
this.state.touchStartPos = {
x: e.touches[0].clientX,
y: e.touches[0].clientY,
};

// 터치 피드백 추가
this.addTouchFeedback(e.target);
}

/**
* 터치 이동 처리
*/
handleTouchMove(e) {
if (!this.state.touchStartPos) {return;}

const currentPos = {
x: e.touches[0].clientX,
y: e.touches[0].clientY,
};

const deltaX = Math.abs(currentPos.x - this.state.touchStartPos.x);
const deltaY = Math.abs(currentPos.y - this.state.touchStartPos.y);

// 스크롤이 감지되면 터치 피드백 제거
if (deltaX > this.config.touch.scrollThreshold || 
deltaY > this.config.touch.scrollThreshold) {
this.removeTouchFeedback();
}

// 바운스 스크롤 방지 (필요시)
if (this.config.ui.bounceScrollDisabled) {
this.preventBounceScroll(e);
}
}

/**
* 터치 종료 처리
*/
handleTouchEnd(e) {
const touchEndTime = Date.now();
const touchDuration = touchEndTime - this.state.touchStartTime;

// 터치 피드백 제거
setTimeout(() => {
this.removeTouchFeedback();
}, 100);

// 탭 제스처 감지
if (this.state.touchStartPos && touchDuration < this.config.touch.maxTapTime) {
const endPos = {
x: e.changedTouches[0].clientX,
y: e.changedTouches[0].clientY,
};

const distance = Math.sqrt(
Math.pow(endPos.x - this.state.touchStartPos.x, 2) +
Math.pow(endPos.y - this.state.touchStartPos.y, 2)
);

if (distance < this.config.touch.maxTapDistance) {
this.handleTap(e, endPos);
}
}

// 상태 초기화
this.state.touchStartTime = 0;
this.state.touchStartPos = null;
}

/**
* 뷰포트 처리 설정
*/
setupViewportHandling() {
// Visual Viewport API 지원 확인
if (window.visualViewport) {
window.visualViewport.addEventListener('resize', () => {
this.handleVisualViewportChange();
});
}

// 화면 크기 변경 대응
this.setupResponsiveHandling();
}

/**
* PWA 전용 기능 설정
*/
setupPWASpecificFeatures() {
if (this.state.isPWAMode) {
// PWA 모드에서의 특별 처리
this.setupPWAModeOptimizations();
} else {
// 브라우저 모드에서의 Safari 바 처리
this.setupSafariBarHiding();
}
}

/**
* iOS PWA 설치 안내
*/
setupIOSInstallPrompt() {
// iOS는 자동 설치 프롬프트가 없으므로 수동 안내
if (this.state.isIOSDevice && this.state.isSafari && !this.state.isPWAMode) {
this.showIOSInstallInstructions();
}
}

/**
* iOS 설치 안내 표시
*/
showIOSInstallInstructions() {
// 이미 안내를 본 사용자는 제외
const dismissed = localStorage.getItem('ios-install-instructions-dismissed');
if (dismissed && Date.now() - parseInt(dismissed) < 30 * 24 * 60 * 60 * 1000) {
return; // 30일 동안 표시하지 않음
}

// 페이지 로드 후 일정 시간 뒤 표시
setTimeout(() => {
this.createIOSInstallPrompt();
}, 3000);
}

/**
* iOS 설치 프롬프트 생성
*/
createIOSInstallPrompt() {
const prompt = document.createElement('div');
prompt.id = 'ios-install-prompt';
prompt.innerHTML = `
<div class=\"ios-install-content\">
<div class=\"ios-install-header\">
<div class=\"ios-install-icon\">📱</div>
<h3>홈 화면에 추가하기</h3>
<button class=\"ios-install-close\">&times;</button>
</div>

<div class=\"ios-install-body\">
<p>더 편리하게 이용하려면 홈 화면에 추가하세요!</p>

<div class=\"ios-install-steps\">
<div class=\"step\">
<div class=\"step-icon\">📤</div>
<div class=\"step-text\">하단의 공유 버튼을 누르세요</div>
</div>

<div class=\"step\">
<div class=\"step-icon\">➕</div>
<div class=\"step-text\">\"홈 화면에 추가\"를 선택하세요</div>
</div>

<div class=\"step\">
<div class=\"step-icon\">✅</div>
<div class=\"step-text\">\"추가\"를 눌러 완료하세요</div>
</div>
</div>
</div>

<div class=\"ios-install-footer\">
<button class=\"ios-install-dismiss\">나중에 하기</button>
</div>
</div>
`;

// 스타일 적용
this.applyIOSInstallPromptStyles(prompt);

// 이벤트 리스너
this.setupIOSInstallPromptEvents(prompt);

// DOM에 추가
document.body.appendChild(prompt);

// 애니메이션과 함께 표시
setTimeout(() => {
prompt.classList.add('visible');
}, 100);
}

/**
* 공통 터치 개선사항
*/
setupUniversalTouchImprovements() {
// 모든 브라우저에서 적용할 터치 개선사항
this.improveButtonTouchTargets();
this.setupTouchActionOptimization();
this.improveScrollPerformance();
}

/**
* 버튼 터치 타겟 개선
*/
improveButtonTouchTargets() {
const buttons = document.querySelectorAll('button, [role=\"button\"], .btn');

buttons.forEach(button => {
const rect = button.getBoundingClientRect();

// 44px 미만의 터치 타겟 개선
if (rect.width < 44 || rect.height < 44) {
button.style.minWidth = '44px';
button.style.minHeight = '44px';
button.style.padding = `${Math.max(
parseInt(getComputedStyle(button).padding) || 0,
8
)  }px`;
}

// 터치 액션 최적화
button.style.touchAction = 'manipulation';
});
}

/**
* 스크롤 성능 개선
*/
improveScrollPerformance() {
const scrollContainers = document.querySelectorAll(
'.scroll-container, [data-scroll], .overflow-auto, .overflow-scroll'
);

scrollContainers.forEach(container => {
if (this.state.isIOSDevice) {
container.style.webkitOverflowScrolling = 'touch';
}
container.style.overscrollBehavior = 'contain';
});
}

/**
* 키보드 처리
*/
setupKeyboardHandling() {
// iOS에서 키보드가 나타날 때 뷰포트 조정
if (window.visualViewport) {
window.visualViewport.addEventListener('resize', () => {
const currentHeight = window.visualViewport.height;
const fullHeight = window.screen.height;

// 키보드가 나타났는지 감지 (높이가 75% 미만으로 줄어들면)
const keyboardVisible = currentHeight < fullHeight * 0.75;

document.body.classList.toggle('keyboard-visible', keyboardVisible);

if (keyboardVisible) {
this.handleKeyboardShow(currentHeight);
} else {
this.handleKeyboardHide();
}
});
}
}

/**
* 키보드 표시 처리
*/
handleKeyboardShow(viewportHeight) {
// 활성 입력 필드가 키보드에 가려지지 않도록 스크롤
const {activeElement} = document;

if (activeElement && this.isInputElement(activeElement)) {
setTimeout(() => {
activeElement.scrollIntoView({
behavior: 'smooth',
block: 'center',
});
}, 300);
}
}

/**
* 키보드 숨김 처리
*/
handleKeyboardHide() {
// 키보드가 사라진 후 뷰포트 복원
window.scrollTo(0, 0);
}

/**
* 유틸리티 메서드들
*/

getIOSVersion() {
const match = navigator.userAgent.match(/OS (\\d+)_?(\\d+)?_?(\\d+)?/);
if (match) {
return {
major: parseInt(match[1], 10),
minor: parseInt(match[2] || '0', 10),
patch: parseInt(match[3] || '0', 10),
};
}
return null;
}

getOrientation() {
if (screen.orientation) {
return screen.orientation.type;
}
return window.orientation ? 'landscape' : 'portrait';
}

updateMetaTag(name, content) {
let meta = document.querySelector(`meta[name=\"${name}\"]`);
if (!meta) {
meta = document.createElement('meta');
meta.name = name;
document.head.appendChild(meta);
}
meta.content = content;
}

calculateSafeAreaInsets() {
if (CSS.supports('padding: env(safe-area-inset-top)')) {
// CSS 환경 변수로 자동 처리됨
return;
}

// 폴백: 수동 계산
this.state.safeAreaInsets = {
top: 0,
right: 0,
bottom: 0,
left: 0,
};

// iPhone X 이상에서 노치 영역 고려
if (this.hasNotch()) {
this.state.safeAreaInsets.top = 44;
this.state.safeAreaInsets.bottom = 34;
}
}

hasNotch() {
if (this.state.isIOSDevice) {
const iosVersion = this.config.detection.version;
if (iosVersion && iosVersion.major >= 11) {
// iPhone X 이상 감지 (대략적)
return window.screen.height >= 812;
}
}
return false;
}

isInputElement(element) {
const inputTypes = ['input', 'textarea', 'select'];
return inputTypes.includes(element.tagName.toLowerCase()) ||
element.contentEditable === 'true';
}

debounce(func, wait) {
let timeout;
return function executedFunction(...args) {
const later = () => {
clearTimeout(timeout);
func(...args);
};
clearTimeout(timeout);
timeout = setTimeout(later, wait);
};
}

// ... 기타 메서드들 계속 구현

addTouchFeedback(element) {
// 터치 피드백 추가 로직
}

removeTouchFeedback() {
// 터치 피드백 제거 로직
}

preventDoubleZoom() {
// 더블 탭 줌 방지 로직
}

// ... 나머지 메서드들
}

// 전역 인스턴스 생성
if (typeof window !== 'undefined') {
window.IOSSafariOptimizer = IOSSafariOptimizer;

// 자동 초기화
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => {
window.iosSafariOptimizer = new IOSSafariOptimizer();
});
} else {
window.iosSafariOptimizer = new IOSSafariOptimizer();
}
}

export default IOSSafariOptimizer;