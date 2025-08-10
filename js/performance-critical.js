/**
 * 크리티컬 성능 최적화 코드
 * 초기 로드에 필수적인 최소한의 코드만 포함
 */

// 크리티컬 CSS 인라인화
(function () {
  'use strict';

  // 웹폰트 최적화
  if ('fonts' in document) {
    document.fonts.load('400 14px "Noto Sans KR"');
    document.fonts.load('600 16px "Noto Sans KR"');
  }

  // 이미지 지연 로딩 설정
  if ('dh-u-loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => {
      img.loading = 'lazy';
      if (img.dataset.src) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
    });
  }

  // 크리티컬 리소스 프리로드
  const criticalResources = [
    { href: '/css/styles.css', as: 'style' },
    { href: '/js/main.js', as: 'script' },
  ];

  criticalResources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    document.head.appendChild(link);
  });

  // 레이아웃 시프트 방지
  document.addEventListener('DOMContentLoaded', () => {
    // 광고 컨테이너 크기 예약
    const adContainers = document.querySelectorAll('.ad-container');
    adContainers.forEach((container) => {
      container.style.minHeight = '250px';
    });

    // 이미지 크기 예약
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach((img) => {
      const parent = img.parentElement;
      if (parent) {
        img.style.aspectRatio = '16/9';
        img.style.width = '100%';
        img.style.height = 'auto';
      }
    });
  });

  // 스크립트 지연 로딩
  window.addEventListener('load', () => {
    // 비필수 스크립트 지연 로딩
    const deferredScripts = ['/js/analytics.js', '/js/storage.js', '/js/performance-optimizer.js'];

    deferredScripts.forEach((src, index) => {
      setTimeout(() => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
      }, index * 100);
    });
  });
})();
