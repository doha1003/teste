/**
 * API 설정 및 보안 관리 모듈 (TypeScript)
 * 안전한 API 호출과 환경별 설정을 관리합니다
 *
 * @version 3.0.0
 * @author doha.kr
 * @warning 이 파일은 민감한 정보를 포함하므로 절대 공개 저장소에 올리지 마세요!
 */
import type { APIResponse, Optional } from '../types/global.js';
/**
 * 환경 타입 정의
 */
type Environment = 'development' | 'production' | 'test';
/**
 * API 설정 인터페이스
 */
interface APIConfig {
    gemini: {
        endpoint: string;
        timeout: number;
    };
    kakao: {
        appKey: string;
    };
    KAKAO_JS_KEY: string;
    adsense: {
        client: string;
    };
    VERCEL_API_BASE: string;
}
/**
 * 보안 설정 인터페이스
 */
interface SecurityConfig {
    csrf: {
        enabled: boolean;
        headerName: string;
    };
    rateLimit: {
        maxRequests: number;
        windowMs: number;
    };
    allowedOrigins: string[];
}
/**
 * Rate Limit 정보 인터페이스
 */
interface RateLimit {
    count: number;
    resetTime: number;
}
/**
 * API 헬퍼 클래스
 */
declare class APIManager {
    private config;
    private securityConfig;
    private rateLimits;
    constructor(config: APIConfig, securityConfig: SecurityConfig);
    /**
     * 안전한 API 호출
     */
    secureRequest<T = any>(url: string, options?: RequestInit): Promise<APIResponse<T>>;
    /**
     * Rate Limiting 체크
     */
    checkRateLimit(key: string): void;
    /**
     * 현재 환경 감지
     */
    detectEnvironment(): Environment;
    /**
     * 도메인 검증
     */
    isOriginAllowed(origin: string): boolean;
    /**
     * 카카오 SDK 초기화
     */
    initKakao(): void;
    /**
     * 카카오 키 가져오기
     */
    private getKakaoKey;
    /**
     * Fortune API 호출
     */
    callFortuneAPI<T = any>(payload: any): Promise<APIResponse<T>>;
    /**
     * 설정 정보 반환
     */
    getConfig(): Readonly<APIConfig>;
    /**
     * 보안 설정 정보 반환
     */
    getSecurityConfig(): Readonly<SecurityConfig>;
    /**
     * Rate Limit 상태 반환
     */
    getRateLimitStatus(key: string): Optional<RateLimit>;
    /**
     * Rate Limit 초기화
     */
    clearRateLimit(key?: string): void;
}
/**
 * API 설정 객체
 */
declare const API_CONFIG: APIConfig;
/**
 * API 보안 설정
 */
declare const SECURITY_CONFIG: SecurityConfig;
/**
 * API 매니저 인스턴스 생성
 */
declare const apiManager: APIManager;
declare global {
    interface Window {
        API_CONFIG: APIConfig;
        ApiHelper: APIManager;
        initKakao: () => void;
        csrfToken?: string;
        KAKAO_APP_KEY?: string;
    }
}
/**
 * 타입 안전 API 헬퍼 함수들
 */
export declare const apiHelpers: {
    /**
     * Fortune API 호출
     */
    fortune: <T = any>(payload: any) => Promise<APIResponse<T>>;
    /**
     * 일반 API 호출
     */
    request: <T = any>(url: string, options?: RequestInit) => Promise<APIResponse<T>>;
    /**
     * Rate Limit 체크
     */
    checkRateLimit: (key: string) => void;
    /**
     * 설정 가져오기
     */
    getConfig: () => Readonly<APIConfig>;
    /**
     * 환경 감지
     */
    getEnvironment: () => Environment;
};
export { APIManager, API_CONFIG, SECURITY_CONFIG, apiManager };
export default apiManager;
//# sourceMappingURL=api-config.d.ts.map