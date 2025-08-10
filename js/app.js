/**
 * Main Application Entry Point
 * 모든 모듈을 통합하고 초기화하는 메인 파일
 */

import { DohaKR, init } from './core/common-init.js';
import { initializePWA } from './core/pwa-helpers.js';

// 전역으로 필요한 객체들을 window에 연결 (레거시 코드 호환성)
window.DohaKR = DohaKR;

// 애플리케이션 초기화
init();

// PWA 기능 초기화
initializePWA();

// 개발자 콘솔 메시지 - DohaKR 초기화 후 실행
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof DohaKR !== 'undefined' && DohaKR.utils && typeof DohaKR.utils.isDevelopment === 'function' && DohaKR.utils.isDevelopment()) {
      console.log('%c🎯 doha.kr Application Ready!', 'color: #3B82F6; font-size: 16px; font-weight: bold;');
      console.log('🔧 Development mode enabled');
    }
  }, 100);
});

// 전역 에러 핸들러 - 안전한 체크
window.addEventListener('error', (event) => {
  if (typeof DohaKR !== 'undefined' && DohaKR.utils && typeof DohaKR.utils.isDevelopment === 'function' && DohaKR.utils.isDevelopment()) {
    console.error('🚨 Global Error:', event.error);
  }
});

// 처리되지 않은 Promise 거부 핸들러 - 안전한 체크
window.addEventListener('unhandledrejection', (event) => {
  if (typeof DohaKR !== 'undefined' && DohaKR.utils && typeof DohaKR.utils.isDevelopment === 'function' && DohaKR.utils.isDevelopment()) {
    console.error('🚨 Unhandled Promise Rejection:', event.reason);
  }
});
