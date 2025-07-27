// Prevent multiple declarations
(function() {
  'use strict';

  // Check if DohaMainApp already exists
  if (window.DohaMainApp) {
    console.log('DohaMainApp already initialized, skipping...');
    return;
  }

  // Original code
  // Browser-compatible version - no ES6 exports
  /**
   * doha.kr 메인 애플리케이션 모듈 (TypeScript)
   * 전체 사이트의 핵심 기능들을 관리하는 TypeScript 버전
   *
   * @version 3.0.0
   * @author doha.kr
   */
  // Type definitions imported during build process
  /**
   * 메인 애플리케이션 클래스
   */
  class DohaMainApp {
      constructor() {
          this.initialized = false;
          this.components = new Map();
          this.eventListeners = new Map();
          /**
           * 로컬 스토리지 헬퍼
           */
          this.storage = {
              set: (key, value) => {
                  try {
                      localStorage.setItem(key, JSON.stringify(value));
                      return true;
                  }
                  catch (e) {
                      console.warn('Storage set error:', e);
                      return false;
                  }
              },
              get: (key) => {
                  try {
                      const item = localStorage.getItem(key);
                      if (!item)
                          return null;
                      try {
                          return JSON.parse(item);
                      }
                      catch (parseError) {
                          return item;
                      }
                  }
                  catch (e) {
                      console.warn('Storage get error:', e);
                      return null;
                  }
              },
              remove: (key) => {
                  try {
                      localStorage.removeItem(key);
                      return true;
                  }
                  catch (e) {
                      console.warn('Storage remove error:', e);
                      return false;
                  }
              },
              clear: () => {
                  try {
                      localStorage.clear();
                      return true;
                  }
                  catch (e) {
                      console.warn('Storage clear error:', e);
                      return false;
                  }
              }
          };
          /**
           * 운세 관련 함수들
           */
          this.fortuneHelpers = {
              save: (type, data) => {
                  const today = this.formatDate(new Date(), 'YYYY-MM-DD');
                  const fortuneKey = `fortune_${type}_${today}`;
                  this.storage.set(fortuneKey, data);
              },
              load: (type) => {
                  const today = this.formatDate(new Date(), 'YYYY-MM-DD');
                  const fortuneKey = `fortune_${type}_${today}`;
                  return this.storage.get(fortuneKey);
              },
              share: (platform, fortuneType, _result) => {
                  const title = `doha.kr에서 ${fortuneType} 결과를 확인했어요!`;
                  const url = window.location.href;
                  this.shareResult(platform, title, url);
              }
          };
          // 초기화 로직은 init() 메서드에서 수행
      }
      /**
       * 애플리케이션 초기화
       */
      async init() {
          if (this.initialized)
              return;
          try {
              // DohaApp이 이미 초기화되었는지 확인
              const isDohaAppInitialized = window.DohaApp && typeof window.DohaApp.init === 'function';
              if (!isDohaAppInitialized) {
                  await this.loadComponents();
              }
              this.injectStyles();
              this.initPageAnimations();
              this.initLazyLoading();
              this.initDarkMode();
              this.fixAdSenseResponsive();
              await this.loadDataSystems();
              await this.loadPerformanceOptimizer();
              this.initialized = true;
              console.log('🚀 DohaMainApp v3.0.0 initialized successfully');
          }
          catch (error) {
              console.error('❌ Failed to initialize DohaMainApp:', error);
              throw new ApplicationError('Initialization failed', { cause: error });
          }
      }
      /**
       * 환경 감지 (개발 목적용 유틸리티)
       */
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      detectEnvironment() {
          const hostname = window.location.hostname;
          if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('test')) {
              return 'development';
          }
          else if (hostname.includes('staging')) {
              return 'test';
          }
          return 'production';
      }
      /**
       * 모바일 메뉴 토글
       */
      toggleMobileMenu() {
          if (window.DohaApp?.components?.mobileMenu) {
              window.DohaApp.components.mobileMenu.toggle();
              return;
          }
          // 폴백: DohaApp이 없을 경우 기본 동작
          const navMenu = document.querySelector('.nav-menu, .nav');
          const menuBtn = document.querySelector('.mobile-menu-btn, .header__menu-toggle');
          if (navMenu) {
              const isOpen = navMenu.classList.toggle('active');
              navMenu.classList.toggle('nav--open');
              if (menuBtn) {
                  menuBtn.setAttribute('aria-expanded', isOpen.toString());
                  menuBtn.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
              }
          }
          if (menuBtn) {
              menuBtn.classList.toggle('active');
          }
      }
      /**
       * 서비스 탭 필터링
       */
      showServices(category, _event) {
          // DohaApp의 tabs 컴포넌트가 있으면 사용
          if (window.DohaApp?.components?.tabs) {
              window.DohaApp.components.tabs.filterServices(category);
              this.updateTabButtons(category);
              return;
          }
          // 폴백: 기본 필터링 로직
          const cards = document.querySelectorAll('.service-card');
          cards.forEach(card => {
              if (!card)
                  return;
              if (category === 'all') {
                  card.style.display = 'block';
              }
              else {
                  const cardCategories = card.getAttribute('data-category');
                  if (cardCategories?.includes(category)) {
                      card.style.display = 'block';
                  }
                  else {
                      card.style.display = 'none';
                  }
              }
          });
      }
      /**
       * 탭 버튼 상태 업데이트
       */
      updateTabButtons(category) {
          const buttons = document.querySelectorAll('.tab-button, [role="tab"]');
          buttons.forEach(btn => {
              btn.classList.remove('active', 'tabs__button--active');
              btn.setAttribute('aria-selected', 'false');
              const shouldActivate = ((category === 'all' && btn.textContent?.includes('전체')) ||
                  (category === 'tests' && btn.textContent?.includes('심리테스트')) ||
                  (category === 'tools' && btn.textContent?.includes('실용도구')) ||
                  (category === 'fortune' && btn.textContent?.includes('운세')) ||
                  (category === 'new' && btn.textContent?.includes('최신')));
              if (shouldActivate) {
                  btn.classList.add('active', 'tabs__button--active');
                  btn.setAttribute('aria-selected', 'true');
              }
          });
      }
      /**
       * 스크롤 애니메이션 처리
       */
      handleScrollAnimation() {
          try {
              const elements = document.querySelectorAll('.fade-in');
              elements.forEach(element => {
                  if (!element)
                      return;
                  const rect = element.getBoundingClientRect();
                  const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                  if (isVisible && !element.classList.contains('animated')) {
                      element.classList.add('animated');
                  }
              });
          }
          catch (error) {
              console.warn('스크롤 애니메이션 처리 중 오류:', error);
          }
      }
      /**
       * 부드러운 스크롤
       */
      smoothScroll(target) {
          try {
              const element = document.querySelector(target);
              if (!element)
                  return;
              const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
              const targetPosition = element.offsetTop - headerHeight - 20;
              window.scrollTo({
                  top: targetPosition,
                  behavior: 'smooth'
              });
              // 접근성을 위한 포커스 설정
              element.setAttribute('tabindex', '-1');
              element.focus();
          }
          catch (error) {
              console.warn('스크롤 처리 중 오류:', error);
          }
      }
      /**
       * 페이지 애니메이션 초기화
       */
      initPageAnimations() {
          this.handleScrollAnimation();
          const throttledHandler = this.throttle(() => this.handleScrollAnimation(), 100);
          window.addEventListener('scroll', throttledHandler);
      }
      /**
       * 쓰로틀 함수
       */
      throttle(func, limit) {
          if (window.DohaApp?.utils?.throttle) {
              return window.DohaApp.utils.throttle(func, limit);
          }
          let inThrottle;
          const throttledFunc = function (...args) {
              if (!inThrottle) {
                  func.apply(this, args);
                  inThrottle = true;
                  setTimeout(() => inThrottle = false, limit);
              }
          };
          throttledFunc.cancel = () => {
              inThrottle = false;
          };
          return throttledFunc;
      }
      /**
       * 폼 유효성 검사
       */
      validateForm(formId) {
          try {
              const form = document.getElementById(formId);
              if (!form)
                  return true;
              const inputs = form.querySelectorAll('input[required], textarea[required]');
              let isValid = true;
              inputs.forEach(input => {
                  if (!input)
                      return;
                  if (!input.value.trim()) {
                      input.classList.add('error');
                      isValid = false;
                  }
                  else {
                      input.classList.remove('error');
                  }
              });
              return isValid;
          }
          catch (error) {
              console.warn('폼 유효성 검사 중 오류:', error);
              return false;
          }
      }
      /**
       * 쿠키 설정
       */
      setCookie(name, value, days) {
          const expires = new Date();
          expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
          document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
      }
      /**
       * 쿠키 가져오기
       */
      getCookie(name) {
          const nameEQ = name + "=";
          const ca = document.cookie.split(';');
          for (let i = 0; i < ca.length; i++) {
              let c = ca[i];
              if (!c)
                  continue;
              while (c.charAt(0) === ' ') {
                  c = c.substring(1, c.length);
              }
              if (c.indexOf(nameEQ) === 0) {
                  return c.substring(nameEQ.length, c.length);
              }
          }
          return null;
      }
      /**
       * 결과 공유 기능
       */
      shareResult(platform, title, url) {
          try {
              const text = encodeURIComponent(title || '');
              const encodedUrl = encodeURIComponent(url || window.location.href);
              const shareUrls = {
                  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
                  twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
                  kakao: `https://story.kakao.com/share?url=${encodedUrl}`,
                  line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
                  copylink: null
              };
              if (platform === 'copylink') {
                  this.copyToClipboard(url || window.location.href);
                  this.showNotification('링크가 복사되었습니다!');
              }
              else if (shareUrls[platform]) {
                  window.open(shareUrls[platform], '_blank', 'width=600,height=400');
              }
          }
          catch (error) {
              console.warn('공유 기능 오류:', error);
              this.showNotification('공유 중 오류가 발생했습니다.', 'error');
          }
      }
      /**
       * 클립보드에 복사
       */
      async copyToClipboard(text) {
          if (navigator.clipboard?.writeText) {
              try {
                  await navigator.clipboard.writeText(text);
              }
              catch (err) {
                  this.fallbackCopyToClipboard(text);
              }
          }
          else {
              this.fallbackCopyToClipboard(text);
          }
      }
      /**
       * 클립보드 복사 폴백
       */
      fallbackCopyToClipboard(text) {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
              document.execCommand('copy');
          }
          catch (err) {
              console.warn('복사 실패:', err);
          }
          document.body.removeChild(textArea);
      }
      /**
       * 알림 표시
       */
      showNotification(message, type = 'success') {
          try {
              const notification = document.createElement('div');
              notification.className = `notification notification-${type}`;
              notification.textContent = message;
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
                  setTimeout(() => {
                      if (notification?.parentNode) {
                          notification.remove();
                      }
                  }, 300);
              }, 3000);
          }
          catch (error) {
              console.warn('알림 표시 중 오류:', error);
          }
      }
      /**
       * 디바운스 함수
       */
      debounce(func, wait) {
          if (window.DohaApp?.utils?.debounce) {
              return window.DohaApp.utils.debounce(func, wait);
          }
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
      /**
       * 날짜 포맷팅
       */
      formatDate(date, format = 'YYYY-MM-DD') {
          try {
              const d = new Date(date);
              if (isNaN(d.getTime())) {
                  console.warn('잘못된 날짜 형식:', date);
                  return format;
              }
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              const hours = String(d.getHours()).padStart(2, '0');
              const minutes = String(d.getMinutes()).padStart(2, '0');
              return format
                  .replace('YYYY', year.toString())
                  .replace('MM', month)
                  .replace('DD', day)
                  .replace('HH', hours)
                  .replace('mm', minutes);
          }
          catch (error) {
              console.warn('날짜 포맷팅 오류:', error);
              return format;
          }
      }
      /**
       * 숫자 포맷팅 (천 단위 콤마)
       */
      formatNumber(num) {
          try {
              if (num === null || num === undefined)
                  return '0';
              return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }
          catch (error) {
              console.warn('숫자 포맷팅 오류:', error);
              return '0';
          }
      }
      /**
       * URL 파라미터 가져오기
       */
      getUrlParam(name) {
          const urlParams = new URLSearchParams(window.location.search);
          return urlParams.get(name);
      }
      /**
       * 이미지 지연 로딩
       */
      initLazyLoading() {
          try {
              const images = document.querySelectorAll('img[data-src]:not(.lazy)');
              if (!images.length)
                  return;
              if ('IntersectionObserver' in window) {
                  const imageObserver = new IntersectionObserver((entries, observer) => {
                      entries.forEach(entry => {
                          if (entry.isIntersecting) {
                              const img = entry.target;
                              if (img && img.dataset && 'src' in img.dataset) {
                                  img.src = img.dataset['src'];
                                  img.removeAttribute('data-src');
                                  observer.unobserve(img);
                              }
                          }
                      });
                  });
                  images.forEach(img => {
                      if (img)
                          imageObserver.observe(img);
                  });
              }
              else {
                  // 폴백: 즉시 로드
                  images.forEach(img => {
                      if (img && img.dataset && 'src' in img.dataset) {
                          img.src = img.dataset['src'];
                          img.removeAttribute('data-src');
                      }
                  });
              }
          }
          catch (error) {
              console.warn('이미지 지연 로딩 오류:', error);
          }
      }
      /**
       * 다크 모드 토글
       */
      toggleDarkMode() {
          const isDarkMode = document.body.classList.toggle('dark-mode');
          this.storage.set('darkMode', isDarkMode);
          return isDarkMode;
      }
      /**
       * 다크 모드 초기화
       */
      initDarkMode() {
          const isDarkMode = this.storage.get('darkMode');
          if (isDarkMode) {
              document.body.classList.add('dark-mode');
          }
      }
      /**
       * 스타일 삽입
       */
      injectStyles() {
          const animationStyles = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .fade-in.animated {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
  
  input.error, textarea.error {
    border-color: #ef4444 !important;
  }
  
  .dark-mode {
    --gray-50: #111827;
    --gray-100: #1f2937;
    --gray-200: #374151;
    --gray-300: #4b5563;
    --gray-400: #6b7280;
    --gray-500: #9ca3af;
    --gray-600: #d1d5db;
    --gray-700: #e5e7eb;
    --gray-800: #f3f4f6;
    --gray-900: #f9fafb;
  }
  
  .ad-container {
    min-height: 250px !important;
    margin: 40px auto !important;
    max-width: 1200px !important;
    padding: 0 20px !important;
    text-align: center !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  
  .ad-label {
    font-size: 12px !important;
    color: #666 !important;
    margin-bottom: 8px !important;
    text-align: center !important;
  }
  
  .adsbygoogle {
    min-height: 90px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
    display: block !important;
  }
  
  @media (max-width: 320px) {
    .ad-container {
      min-width: 300px !important;
      padding: 0 10px !important;
    }
  }
  
  @media (max-width: 480px) {
    .ad-container {
      min-height: 100px !important;
      padding: 0 15px !important;
    }
  }
  
  @media (min-width: 768px) {
    .ad-container {
      min-height: 100px !important;
    }
  }
  
  @media (min-width: 1024px) {
    .ad-container {
      min-height: 90px !important;
    }
  }
  `;
          const styleElement = document.createElement('style');
          styleElement.textContent = animationStyles;
          document.head.appendChild(styleElement);
      }
      /**
       * 컴포넌트 로드 (ID 기반)
       */
      async loadComponentById(componentName, targetId) {
          console.log(`Loading ${componentName} into ${targetId}`);
          try {
              const response = await fetch(`/includes/${componentName}.html`);
              if (response.ok) {
                  const html = await response.text();
                  const target = document.getElementById(targetId);
                  if (target) {
                      // SecureDOM이 있으면 사용, 없으면 직접 innerHTML 사용
                      if (window.SecureDOM && window.SecureDOM.setInnerHTML) {
                          window.SecureDOM.setInnerHTML(target, html);
                      } else {
                          target.innerHTML = html;
                      }
                      this.components.set(componentName, target);
                      console.log(`✅ ${componentName} loaded successfully`);
                  } else {
                      console.error(`Target element ${targetId} not found`);
                  }
              }
              else {
                  throw new Error(`HTTP ${response.status}`);
              }
          }
          catch (error) {
              console.error(`Failed to load component ${componentName}:`, error);
              this.loadFallbackComponent(componentName, targetId);
          }
      }
      /**
       * 폴백 컴포넌트 로드
       */
      loadFallbackComponent(componentName, targetId) {
          const target = document.getElementById(targetId);
          if (!target)
              return;
          if (componentName === 'navbar') {
              const navbarHtml = `
          <nav class="navbar">
            <div class="navbar-container">
              <a href="/" class="logo">doha.kr</a>
              <ul class="nav-menu">
                <li><a href="/" class="nav-link">홈</a></li>
                <li><a href="/tests/" class="nav-link">심리테스트</a></li>
                <li><a href="/tools/" class="nav-link">실용도구</a></li>
                <li><a href="/fortune/" class="nav-link">운세</a></li>
                <li><a href="/contact/" class="nav-link">문의</a></li>
                <li><a href="/about/" class="nav-link">소개</a></li>
              </ul>
              <button class="mobile-menu-btn" onclick="window.dohaApp?.toggleMobileMenu()">
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </nav>
        `;
              if (window.SecureDOM) {
                  window.SecureDOM.setInnerHTML(target, navbarHtml);
              }
              else if (typeof safeHTML === 'function') {
                  target.innerHTML = safeHTML(navbarHtml);
              }
              else {
                  target.innerHTML = navbarHtml;
              }
          }
          else if (componentName === 'footer') {
              const footerHtml = `
          <footer class="footer">
            <div class="footer-content">
              <div class="footer-section">
                <h3>doha.kr</h3>
                <p style="color: var(--gray-400); margin-top: 8px;">
                  일상을 더 재미있게 만드는 공간<br>
                  심리테스트, 실용도구, 운세의 만남
                </p>
                <div class="footer-social">
                  <a href="mailto:youtubdoha@gmail.com" class="social-link">📧</a>
                </div>
              </div>
              
              <div class="footer-section">
                <h3>서비스</h3>
                <ul class="footer-links">
                  <li><a href="/">홈</a></li>
                  <li><a href="/tests/">심리테스트</a></li>
                  <li><a href="/tools/">실용도구</a></li>
                  <li><a href="/fortune/">운세</a></li>
                  <li><a href="/about/">사이트 소개</a></li>
                </ul>
              </div>
              
              <div class="footer-section">
                <h3>인기 콘텐츠</h3>
                <ul class="footer-links">
                  <li><a href="/tests/teto-egen/">테토-에겐 테스트</a></li>
                  <li><a href="/tests/mbti/">MBTI 테스트</a></li>
                  <li><a href="/fortune/daily/">오늘의 운세</a></li>
                  <li><a href="/tools/text-counter.html">글자수 세기</a></li>
                </ul>
              </div>
              
              <div class="footer-section">
                <h3>운세 & 고객지원</h3>
                <ul class="footer-links">
                  <li><a href="/fortune/daily/">오늘의 운세</a></li>
                  <li><a href="/fortune/tarot/">타로 카드</a></li>
                  <li><a href="/fortune/zodiac/">별자리 운세</a></li>
                  <li><a href="/contact/">문의하기</a></li>
                </ul>
              </div>
            </div>
            
            <div class="footer-bottom">
              <div class="footer-legal">
                <a href="/privacy/">개인정보처리방침</a>
                <a href="/terms/">이용약관</a>
              </div>
              <p>&copy; 2025 doha.kr. All rights reserved.</p>
            </div>
          </footer>
        `;
              if (window.SecureDOM) {
                  window.SecureDOM.setInnerHTML(target, footerHtml);
              }
              else if (typeof safeHTML === 'function') {
                  target.innerHTML = safeHTML(footerHtml);
              }
              else {
                  target.innerHTML = footerHtml;
              }
          }
      }
      /**
       * 네비게이션과 푸터 컴포넌트 로드
       */
      async loadComponents() {
          const promises = [];
          if (document.querySelector('#navbar-placeholder')) {
              promises.push(this.loadComponentById('navbar', 'navbar-placeholder'));
          }
          if (document.querySelector('#footer-placeholder')) {
              promises.push(this.loadComponentById('footer', 'footer-placeholder'));
          }
          await Promise.allSettled(promises);
      }
      /**
       * AdSense 반응형 수정
       */
      fixAdSenseResponsive() {
          const adContainers = document.querySelectorAll('.ad-container');
          adContainers.forEach(container => {
              container.style.minWidth = '300px';
              container.style.width = '100%';
              container.style.boxSizing = 'border-box';
              container.style.padding = '0 20px';
              container.style.margin = '40px auto';
              container.style.maxWidth = '1200px';
              const ins = container.querySelector('.adsbygoogle');
              if (ins) {
                  ins.style.minHeight = '90px';
                  ins.style.width = '100%';
                  ins.style.maxWidth = '100%';
                  ins.style.overflow = 'hidden';
                  ins.style.display = 'block';
                  if (!ins.hasAttribute('data-full-width-responsive')) {
                      ins.setAttribute('data-full-width-responsive', 'true');
                  }
              }
          });
          const checkAdContainers = () => {
              const width = window.innerWidth;
              adContainers.forEach(container => {
                  if (width < 320) {
                      container.style.padding = '0 10px';
                      container.style.minWidth = '300px';
                  }
                  else if (width < 480) {
                      container.style.padding = '0 15px';
                  }
                  else {
                      container.style.padding = '0 20px';
                  }
              });
          };
          checkAdContainers();
          window.addEventListener('resize', this.debounce(checkAdContainers, 250));
      }
      /**
       * AdSense 초기화
       */
      initAdSense() {
          try {
              this.fixAdSenseResponsive();
              const adSlots = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
              if (adSlots.length === 0)
                  return;
              adSlots.forEach((slot) => {
                  const rect = slot.getBoundingClientRect();
                  if (rect.width < 50) {
                      slot.style.minWidth = '320px';
                      slot.style.width = '100%';
                  }
                  if (rect.height < 50) {
                      slot.style.minHeight = '100px';
                  }
                  slot.setAttribute('data-adsbygoogle-status', 'processing');
              });
              if (typeof window.adsbygoogle !== 'undefined') {
                  adSlots.forEach((slot) => {
                      try {
                          (window.adsbygoogle = window.adsbygoogle || []).push({});
                          slot.setAttribute('data-adsbygoogle-status', 'loaded');
                      }
                      catch (error) {
                          console.warn('AdSense 슬롯 로딩 오류:', error);
                          slot.setAttribute('data-adsbygoogle-status', 'error');
                      }
                  });
              }
              else {
                  setTimeout(() => this.initAdSense(), 2000);
              }
          }
          catch (error) {
              console.warn('AdSense 초기화 전체 오류:', error);
          }
      }
      /**
       * 데이터 시스템 로드
       */
      async loadDataSystems() {
          try {
              if (!window.userDataManager) {
                  await this.loadScript('/js/storage.js');
              }
              if (window.Analytics && typeof window.Analytics.init === 'function') {
                  window.Analytics.init();
              }
              if (!window.analyticsDashboard) {
                  await this.loadScript('/js/analytics-dashboard.js');
              }
          }
          catch (error) {
              console.warn('Failed to load data systems:', error);
          }
      }
      /**
       * 성능 최적화 시스템 로드
       */
      async loadPerformanceOptimizer() {
          try {
              if (!window.performanceOptimizer) {
                  await this.loadScript('/js/performance-optimizer.js');
              }
          }
          catch (error) {
              console.warn('Failed to load Performance Optimizer:', error);
          }
      }
      /**
       * 스크립트 동적 로딩
       */
      loadScript(src) {
          return new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = src;
              script.onload = () => resolve();
              script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
              document.head.appendChild(script);
          });
      }
      /**
       * 성능 메트릭 수집
       */
      getPerformanceMetrics() {
          const navigation = performance.getEntriesByType('navigation')[0];
          return {
              loadTime: navigation ? (navigation.loadEventEnd - navigation.fetchStart) : 0,
              renderTime: navigation ? (navigation.domContentLoadedEventEnd - navigation.fetchStart) : 0,
              interactionTime: navigation ? (navigation.domInteractive - navigation.fetchStart) : 0,
              memoryUsage: performance.memory?.usedJSHeapSize || 0,
              networkRequests: performance.getEntriesByType('resource').length
          };
      }
      /**
       * 애플리케이션 정리
       */
      destroy() {
          this.eventListeners.clear();
          this.components.clear();
          this.initialized = false;
      }
  }
  // 전역 인스턴스 생성 및 초기화
  const dohaApp = new DohaMainApp();
  // DOM 로드 완료 시 초기화
  document.addEventListener('DOMContentLoaded', () => {
      dohaApp.init();
  });
  // 윈도우 로드 완료 후 AdSense 초기화
  window.addEventListener('load', () => {
      setTimeout(() => dohaApp.initAdSense(), 1000);
  });
  // 전역 할당
  window.dohaApp = dohaApp;
  window.toggleMobileMenu = () => dohaApp.toggleMobileMenu();
  window.showServices = (category, event) => dohaApp.showServices(category, event);
  window.shareResult = (platform, title, url) => dohaApp.shareResult(platform, title, url);
  window.showNotification = (message, type) => dohaApp.showNotification(message, type);
  window.validateForm = (formId) => dohaApp.validateForm(formId);
  window.storage = dohaApp.storage;
  window.formatDate = (date, format) => dohaApp.formatDate(date, format);
  window.formatNumber = (num) => dohaApp.formatNumber(num);
  window.toggleDarkMode = () => dohaApp.toggleDarkMode();
  window.fortuneHelpers = dohaApp.fortuneHelpers;
  // export default dohaApp;
  //# sourceMappingURL=main.js.map

  // Export to global scope
  window.DohaMainApp = DohaMainApp;

})();
