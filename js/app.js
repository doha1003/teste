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

// 개발자 콘솔 메시지
