/**
 * 공통 초기화 스크립트
 * 모든 페이지에서 사용되는 공통 로직을 모듈화
 */

import { initMobileMenu } from './mobile-menu.js';
import * as PWAHelpers from './pwa-helpers.js';

// DohaKR 객체를 export
export const DohaKR = {
  utils: {},
  PWAHelpers,
};

/**
 * Google AdSense 초기화
 */
DohaKR.initAdsense = function () {
  if (typeof adsbygoogle === 'undefined') {
    
    return;
  }

  const ads = document.querySelectorAll('.adsbygoogle:not([data-ad-status])');
  ads.forEach((ad) => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      ad.setAttribute('data-ad-status', 'loaded');
    } catch (e) {
      
      ad.style.display = 'none';
    }
  });
};

/**
 * Kakao SDK 초기화
 */
DohaKR.initKakao = function () {
  if (typeof Kakao === 'undefined') {
    
    return;
  }

  if (!Kakao.isInitialized()) {
    // GitHub Actions에서 주입된 API 키 사용
    const apiKey = window.KAKAO_API_KEY || 'YOUR_JAVASCRIPT_KEY';
    Kakao.init(apiKey);
  }
};

/**
 * 네비게이션 및 푸터 로드
 */
DohaKR.loadIncludes = function () {
  // 네비게이션 로드
  const navPlaceholder = document.getElementById('navbar-placeholder');
  if (navPlaceholder) {
    const navXhr = new XMLHttpRequest();
    navXhr.open('GET', '/includes/navbar.html', true);
    navXhr.onreadystatechange = function () {
      if (navXhr.readyState === 4) {
        if (navXhr.status === 200 || navXhr.status === 0) {
          // 0은 file:// 프로토콜
          navPlaceholder.innerHTML = navXhr.responseText;
          DohaKR.initMobileMenu();
        } else {
          // file:// 프로토콜에서 실패하면 직접 삽입
          navPlaceholder.innerHTML = `<nav class="navbar navbar-fixed">
    <div class="navbar-container navbar-flex">
        <a href="/" class="logo navbar-logo">doha.kr</a>
        <ul class="nav-menu navbar-menu nav-flex" id="nav-menu">
            <li class="nav-item"><a href="/" class="nav-link nav-link-padded">홈</a></li>
            <li class="nav-item"><a href="/tests/" class="nav-link nav-link-padded">심리테스트</a></li>
            <li class="nav-item"><a href="/fortune/" class="nav-link nav-link-padded">운세</a></li>
            <li class="nav-item"><a href="/tools/" class="nav-link nav-link-padded">실용도구</a></li>
            <li class="nav-item"><a href="/contact/" class="nav-link nav-link-padded">문의</a></li>
            <li class="nav-item"><a href="/about/" class="nav-link nav-link-padded">소개</a></li>
        </ul>
        <button class="mobile-menu-btn navbar-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="메뉴 열기">
            <span class="menu-bar"></span>
            <span class="menu-bar"></span>
            <span class="menu-bar"></span>
        </button>
    </div>
</nav>`;
          DohaKR.initMobileMenu();
        }
      }
    };
    navXhr.send();
  }

  // 푸터 로드
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    const footerXhr = new XMLHttpRequest();
    footerXhr.open('GET', '/includes/footer.html', true);
    footerXhr.onreadystatechange = function () {
      if (footerXhr.readyState === 4) {
        if (footerXhr.status === 200 || footerXhr.status === 0) {
          footerPlaceholder.innerHTML = footerXhr.responseText;
        } else {
          // file:// 프로토콜에서 실패하면 직접 삽입
          footerPlaceholder.innerHTML = `<footer class="footer"> <div class="footer-content"> <div class="footer-section"> <h3>doha.kr</h3> <p class="text-gray-400 mt-8"> 일상을 더 재미있게 만드는 공간<br> 심리테스트, 운세, 실용도구의 만남 </p> <div class="footer-social"> <a href="mailto:youtubdoha@gmail.com" class="social-link">📧</a> </div> </div> <div class="footer-section"> <h3>서비스</h3> <ul class="footer-links"> <li><a href="/">홈</a></li> <li><a href="/tests/">심리테스트</a></li> <li><a href="/fortune/">운세</a></li> <li><a href="/tools/">실용도구</a></li> <li><a href="/about/">사이트 소개</a></li> </ul> </div> <div class="footer-section"> <h3>인기 콘텐츠</h3> <ul class="footer-links"> <li><a href="/tests/teto-egen/">테토-에겐 테스트</a></li> <li><a href="/tests/mbti/">MBTI 테스트</a></li> <li><a href="/fortune/daily/">오늘의 운세</a></li> <li><a href="/tools/text-counter.html">글자수 세기</a></li> </ul> </div> <div class="footer-section"> <h3>운세 서비스</h3> <ul class="footer-links"> <li><a href="/fortune/daily/">오늘의 운세</a></li> <li><a href="/fortune/zodiac/">별자리 운세</a></li> <li><a href="/fortune/zodiac-animal/">띠별 운세</a></li> <li><a href="/fortune/tarot/">AI 타로</a></li> </ul> </div> <div class="footer-section"> <h3>고객지원</h3> <ul class="footer-links"> <li><a href="/contact/">문의하기</a></li> <li><a href="/faq/">자주 묻는 질문</a></li> </ul> </div> </div> <div class="footer-bottom"> <div class="footer-legal"> <a href="/privacy/">개인정보처리방침</a> <a href="/terms/">이용약관</a> </div> <p>&copy; 2025 doha.kr. All rights reserved.</p> </div> </footer>`;
        }
      }
    };
    footerXhr.send();
  }
};

/**
 * 모바일 메뉴 초기화
 */
DohaKR.initMobileMenu = function () {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      mobileMenuBtn.classList.toggle('active');

      // 메뉴 열릴 때 body 스크롤 방지
      if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // 메뉴 외부 클릭 시 닫기
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.navbar')) {
        navMenu.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
};

/**
 * Google Analytics 초기화
 */
DohaKR.initAnalytics = function () {
  if (typeof gtag === 'undefined') {
    
    return;
  }

  // 페이지뷰 전송
  gtag('config', 'G-XXXXXXXXXX', {
    page_path: window.location.pathname,
  });
};

/**
 * 페이지별 초기화 함수 실행
 */
DohaKR.initPage = function () {
  const pageType = document.body.dataset.page;
  if (!pageType) {
    return;
  }

  // 페이지별 초기화 함수가 있으면 실행
  const initFunctionName = `${pageType.replace(/-/g, '')}Init`;
  if (typeof window[initFunctionName] === 'function') {
    window[initFunctionName]();
  }
};

/**
 * 공통 유틸리티 함수들
 */
DohaKR.utils = {
  // 쿠키 가져오기
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
  },

  // 쿠키 설정
  setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  },

  // 날짜 포맷
  formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
  },

  // 로딩 표시
  showLoading(element) {
    element.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>잠시만 기다려주세요...</p>
                </div>
            `;
  },

  // 에러 표시
  showError(element, message) {
    element.innerHTML = `
                <div class="error-message">
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">다시 시도</button>
                </div>
            `;
  },
};

/**
 * Service Worker 등록
 */
DohaKR.registerServiceWorker = function () {
  if ('serviceWorker' in navigator) {
    // Service Worker 등록
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {

        // 업데이트 체크
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 새 버전이 설치되었을 때 사용자에게 알림
              DohaKR.showUpdateNotification();
            }
          });
        });

        // 주기적으로 업데이트 체크 (1시간마다)
        setInterval(
          () => {
            registration.update();
          },
          60 * 60 * 1000
        );
      })
      .catch((error) => {
        
      });

    // Service Worker 메시지 리스너
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        
      }
    });
  }
};

/**
 * PWA 설치 프롬프트 초기화
 */
DohaKR.initPWAInstall = function () {
  let deferredPrompt = null;

  // beforeinstallprompt 이벤트 캐치
  window.addEventListener('beforeinstallprompt', (e) => {
    // 기본 브라우저 프롬프트 방지
    e.preventDefault();
    // 나중에 사용하기 위해 이벤트 저장
    deferredPrompt = e;

    // 설치 버튼 표시
    DohaKR.showInstallButton(deferredPrompt);
  });

  // 설치 상태 확인
  window.addEventListener('appinstalled', () => {
    
    deferredPrompt = null;

    // 설치 완료 메시지 표시
    DohaKR.showInstallSuccess();
  });

  // iOS 설치 안내
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

  if (isIOS && !isInStandaloneMode) {
    // iOS에서 설치 안내 표시
    setTimeout(() => {
      DohaKR.showiOSInstallPrompt();
    }, 5000);
  }
};

/**
 * 업데이트 알림 표시
 */
DohaKR.showUpdateNotification = function () {
  const notification = document.createElement('div');
  notification.className = 'pwa-update-notification';
  notification.innerHTML = `
            <div class="update-content">
                <p>새로운 버전이 준비되었습니다!</p>
                <button class="btn btn-primary btn-sm" onclick="window.location.reload()">새로고침</button>
            </div>
        `;
  document.body.appendChild(notification);

  // 10초 후 자동으로 제거
  setTimeout(() => {
    notification.remove();
  }, 10000);
};

/**
 * 네트워크 상태 모니터링
 */
DohaKR.initNetworkStatus = function () {
  let isOnline = navigator.onLine;

  // 네트워크 상태 표시기 생성
  const statusIndicator = document.createElement('div');
  statusIndicator.id = 'network-status';
  statusIndicator.className = isOnline ? 'network-online' : 'network-offline';
  statusIndicator.innerHTML = isOnline ? '' : '오프라인';
  document.body.appendChild(statusIndicator);

  // 온라인/오프라인 이벤트 리스너
  window.addEventListener('online', () => {
    isOnline = true;
    statusIndicator.className = 'network-online';
    statusIndicator.innerHTML = '';
    
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    statusIndicator.className = 'network-offline';
    statusIndicator.innerHTML = '오프라인';
    
  });
};

/**
 * PWA 설치 버튼 표시
 */
DohaKR.showInstallButton = function (deferredPrompt) {
  // 이미 설치된 경우 표시하지 않음
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }

  // 설치 배너 생성
  const installBanner = document.createElement('div');
  installBanner.className = 'pwa-install-banner';
  installBanner.innerHTML = `
            <div class="install-content">
                <div class="install-icon">📱</div>
                <div class="install-text">
                    <h4>doha.kr 앱 설치</h4>
                    <p>홈 화면에 추가하여 더 빠르게 접속하세요!</p>
                </div>
                <div class="install-actions">
                    <button class="btn btn-primary btn-sm" id="install-accept">설치</button>
                    <button class="btn btn-secondary btn-sm" id="install-dismiss">나중에</button>
                </div>
            </div>
        `;

  document.body.appendChild(installBanner);

  // 설치 버튼 클릭 이벤트
  document.getElementById('install-accept').addEventListener('click', async () => {
    installBanner.remove();

    // 설치 프롬프트 표시
    deferredPrompt.prompt();

    // 사용자 선택 대기
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      
    } else {
      
    }
  });

  // 나중에 버튼 클릭 이벤트
  document.getElementById('install-dismiss').addEventListener('click', () => {
    installBanner.remove();
    // 24시간 동안 다시 표시하지 않음
    DohaKR.utils.setCookie('pwa-install-dismissed', 'true', 1);
  });

  // 5초 후 자동으로 슬라이드 인
  setTimeout(() => {
    installBanner.classList.add('show');
  }, 100);
};

/**
 * iOS 설치 안내 표시
 */
DohaKR.showiOSInstallPrompt = function () {
  // 이미 닫았거나 설치된 경우 표시하지 않음
  if (DohaKR.utils.getCookie('ios-install-dismissed') || window.navigator.standalone) {
    return;
  }

  const iosPrompt = document.createElement('div');
  iosPrompt.className = 'ios-install-prompt';
  iosPrompt.innerHTML = `
            <div class="ios-prompt-content">
                <button class="ios-prompt-close" aria-label="닫기">×</button>
                <h4>홈 화면에 추가</h4>
                <p>Safari에서 <span class="ios-share-icon">⎙</span> 공유 버튼을 탭하고<br>
                "홈 화면에 추가"를 선택하세요</p>
                <div class="ios-arrow">↓</div>
            </div>
        `;

  document.body.appendChild(iosPrompt);

  // 닫기 버튼
  iosPrompt.querySelector('.ios-prompt-close').addEventListener('click', () => {
    iosPrompt.remove();
    DohaKR.utils.setCookie('ios-install-dismissed', 'true', 7);
  });

  // 10초 후 자동으로 제거
  setTimeout(() => {
    iosPrompt.remove();
  }, 10000);
};

/**
 * 설치 성공 메시지 표시
 */
DohaKR.showInstallSuccess = function () {
  const successMessage = document.createElement('div');
  successMessage.className = 'pwa-install-success';
  successMessage.innerHTML = `
            <div class="success-content">
                <span class="success-icon">✓</span>
                <p>doha.kr이 성공적으로 설치되었습니다!</p>
            </div>
        `;

  document.body.appendChild(successMessage);

  // 3초 후 페이드 아웃
  setTimeout(() => {
    successMessage.classList.add('fade-out');
    setTimeout(() => {
      successMessage.remove();
    }, 300);
  }, 3000);
};

// 초기화 함수 export
export function init() {
  // DOM 로드 완료 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll);
  } else {
    initializeAll();
  }
}

// 모든 초기화 실행
function initializeAll() {
  // 공통 컴포넌트 로드
  DohaKR.loadIncludes();

  // Service Worker 등록
  DohaKR.registerServiceWorker();

  // PWA 설치 초기화
  DohaKR.initPWAInstall();

  // 네트워크 상태 모니터링
  DohaKR.initNetworkStatus();

  // 광고 초기화 (1초 지연)
  setTimeout(() => {
    DohaKR.initAdsense();
  }, 1000);

  // Kakao SDK 초기화
  DohaKR.initKakao();

  // Analytics 초기화
  DohaKR.initAnalytics();

  // 페이지별 초기화
  DohaKR.initPage();

  // 모바일 메뉴 초기화
  initMobileMenu();

  // 이미지 지연 로딩 polyfill
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach((img) => {
      // Force reload by changing URL
                  img.src = `${img.src + (img.src.includes('?') ? '&' : '?')  }t=${  Date.now()}`;
    });
  } else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
  }
}
