/**
 * doha.kr 메인 애플리케이션 모듈 (TypeScript)
 * 전체 사이트의 핵심 기능들을 관리하는 TypeScript 버전
 *
 * @version 3.0.0
 * @author doha.kr
 */
import type { PerformanceMetrics, Nullable } from '../types/global.js';
/**
 * 메인 애플리케이션 클래스
 */
declare class DohaMainApp {
    private config;
    private initialized;
    private components;
    private eventListeners;
    constructor();
    /**
     * 애플리케이션 초기화
     */
    init(): Promise<void>;
    /**
     * 환경 감지
     */
    private detectEnvironment;
    /**
     * 모바일 메뉴 토글
     */
    toggleMobileMenu(): void;
    /**
     * 서비스 탭 필터링
     */
    showServices(category: string, event?: Event): void;
    /**
     * 탭 버튼 상태 업데이트
     */
    private updateTabButtons;
    /**
     * 스크롤 애니메이션 처리
     */
    private handleScrollAnimation;
    /**
     * 부드러운 스크롤
     */
    smoothScroll(target: string): void;
    /**
     * 페이지 애니메이션 초기화
     */
    private initPageAnimations;
    /**
     * 쓰로틀 함수
     */
    private throttle;
    /**
     * 폼 유효성 검사
     */
    validateForm(formId: string): boolean;
    /**
     * 쿠키 설정
     */
    setCookie(name: string, value: string, days: number): void;
    /**
     * 쿠키 가져오기
     */
    getCookie(name: string): Nullable<string>;
    /**
     * 결과 공유 기능
     */
    shareResult(platform: string, title?: string, url?: string): void;
    /**
     * 클립보드에 복사
     */
    private copyToClipboard;
    /**
     * 클립보드 복사 폴백
     */
    private fallbackCopyToClipboard;
    /**
     * 알림 표시
     */
    showNotification(message: string, type?: 'success' | 'error'): void;
    /**
     * 로컬 스토리지 헬퍼
     */
    readonly storage: {
        set: (key: string, value: any) => boolean;
        get: <T = any>(key: string) => Nullable<T>;
        remove: (key: string) => boolean;
        clear: () => boolean;
    };
    /**
     * 디바운스 함수
     */
    debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
    /**
     * 날짜 포맷팅
     */
    formatDate(date: Date | string | number, format?: string): string;
    /**
     * 숫자 포맷팅 (천 단위 콤마)
     */
    formatNumber(num: number | string | null | undefined): string;
    /**
     * URL 파라미터 가져오기
     */
    getUrlParam(name: string): Nullable<string>;
    /**
     * 이미지 지연 로딩
     */
    private initLazyLoading;
    /**
     * 다크 모드 토글
     */
    toggleDarkMode(): boolean;
    /**
     * 다크 모드 초기화
     */
    private initDarkMode;
    /**
     * 운세 관련 함수들
     */
    readonly fortuneHelpers: {
        save: (type: string, data: any) => void;
        load: <T = any>(type: string) => Nullable<T>;
        share: (platform: string, fortuneType: string, result: any) => void;
    };
    /**
     * 스타일 삽입
     */
    private injectStyles;
    /**
     * 컴포넌트 로드 (ID 기반)
     */
    private loadComponentById;
    /**
     * 폴백 컴포넌트 로드
     */
    private loadFallbackComponent;
    /**
     * 네비게이션과 푸터 컴포넌트 로드
     */
    private loadComponents;
    /**
     * AdSense 반응형 수정
     */
    private fixAdSenseResponsive;
    /**
     * AdSense 초기화
     */
    initAdSense(): void;
    /**
     * 데이터 시스템 로드
     */
    private loadDataSystems;
    /**
     * 성능 최적화 시스템 로드
     */
    private loadPerformanceOptimizer;
    /**
     * 스크립트 동적 로딩
     */
    private loadScript;
    /**
     * 성능 메트릭 수집
     */
    getPerformanceMetrics(): PerformanceMetrics;
    /**
     * 애플리케이션 정리
     */
    destroy(): void;
}
declare const dohaApp: DohaMainApp;
declare global {
    interface Window {
        dohaApp: DohaMainApp;
        toggleMobileMenu: () => void;
        showServices: (category: string, event?: Event) => void;
        shareResult: (platform: string, title?: string, url?: string) => void;
        showNotification: (message: string, type?: 'success' | 'error') => void;
        validateForm: (formId: string) => boolean;
        storage: DohaMainApp['storage'];
        formatDate: (date: Date | string | number, format?: string) => string;
        formatNumber: (num: number | string | null | undefined) => string;
        toggleDarkMode: () => boolean;
        fortuneHelpers: DohaMainApp['fortuneHelpers'];
        loadComponents: () => Promise<void>;
        loadComponentById: (componentName: string, targetId: string) => Promise<void>;
        loadDataSystems: () => Promise<void>;
        loadPerformanceOptimizer: () => Promise<void>;
    }
}
export default dohaApp;
//# sourceMappingURL=main.d.ts.map