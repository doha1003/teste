# doha.kr 로깅 시스템 가이드

## 개요

doha.kr의 종합적인 로깅 시스템은 클라이언트와 서버 양쪽에서 구조화된 로깅을 제공합니다. 이 시스템은 개발, 디버깅, 모니터링, 사용자 행동 분석을 위한 완전한 솔루션을 제공합니다.

## 시스템 구성 요소

### 1. 클라이언트 로깅 (`js/utils/logger.js`)

**기능:**
- 구조화된 JSON 로깅
- 환경별 로그 레벨 설정 (development, production, test)  
- 원격 로그 전송 (배치 처리)
- 성능 모니터링 (Web Vitals 포함)
- 자동 에러 캐치 및 로깅
- 사용자 행동 추적

**사용 예시:**
```javascript
// 기본 로깅
logger.info('User action completed', { 
  action: 'button_click', 
  userId: 'user123' 
});

// 성능 측정
const timer = logger.startTimer('API Call');
// ... API 호출
timer.end(); // 자동으로 성능 로그 생성

// 사용자 행동 로깅
logger.logUserAction('feature_usage', {
  feature: 'fortune_telling',
  type: 'daily'
});

// API 호출 로깅
logger.logApiCall('/api/fortune', 'POST', 200, 1500, {
  success: true,
  responseSize: 2048
});
```

### 2. 서버 로깅 (`api/logging-middleware.js`)

**기능:**
- 요청/응답 자동 로깅
- 에러 처리 및 로깅
- 성능 메트릭 수집
- 보안 이벤트 로깅
- 구조화된 서버 로그

**사용 예시:**
```javascript
import { withLogging, serverLogger } from './logging-middleware.js';

// API 핸들러에 로깅 미들웨어 적용
const handler = async (req, res) => {
  serverLogger.info('Processing request', { 
    endpoint: req.url,
    method: req.method 
  });
  
  // 비즈니스 로직...
};

export default withLogging(handler);
```

### 3. 로그 수집 API (`api/logs.js`)

**기능:**
- 클라이언트 로그 수신 및 검증
- 로그 정리 및 보안 처리
- 배치 로그 처리
- 에러 로그 특별 처리

**엔드포인트:**
- `POST /api/logs` - 로그 수집
- `GET /api/logs/stats` - 로깅 통계

### 4. 통합 에러 핸들러 (`js/error-handler.js`)

**기능:**
- 전역 JavaScript 에러 캐치
- Promise Rejection 처리
- 리소스 로딩 에러 처리
- 사용자 친화적 에러 메시지
- 자동 복구 시도

## 환경별 설정

### Development
```javascript
{
  minLevel: DEBUG,
  enableConsole: true,
  enableRemote: false,
  enablePerformance: true,
  enableUserTracking: false
}
```

### Production  
```javascript
{
  minLevel: INFO,
  enableConsole: false,
  enableRemote: true,
  enablePerformance: true,
  enableUserTracking: true
}
```

### Test
```javascript
{
  minLevel: WARN,
  enableConsole: false,
  enableRemote: false,
  enablePerformance: false,
  enableUserTracking: false
}
```

## 로그 레벨

| 레벨 | 값 | 용도 | 예시 |
|------|----|----- |------|
| DEBUG | 0 | 개발용 상세 정보 | `logger.debug('Variable value', { var: value })` |
| INFO | 1 | 일반 정보 로그 | `logger.info('User logged in', { userId })` |
| WARN | 2 | 경고 메시지 | `logger.warn('Deprecated API used')` |
| ERROR | 3 | 에러 상황 | `logger.error('API call failed', { error })` |
| CRITICAL | 4 | 심각한 시스템 오류 | `logger.critical('Service unavailable')` |

## 사용자 행동 추적

자동으로 추적되는 이벤트:
- 페이지 로드 성능
- 버튼/링크 클릭
- 폼 제출
- 스크롤 깊이 (50%, 75%, 90%)
- 페이지 이탈
- 에러 발생

수동 추적:
```javascript
logger.logUserAction('fortune_generated', {
  fortuneType: 'daily',
  hasCustomData: true,
  processingTime: 1500
});
```

## 성능 모니터링

### Web Vitals 자동 수집
- LCP (Largest Contentful Paint)
- FID (First Input Delay)  
- CLS (Cumulative Layout Shift)

### 커스텀 성능 측정
```javascript
const timer = logger.startTimer('Complex Operation');
// ... 복잡한 작업
const duration = timer.end(); // 자동 로깅
```

## 원격 로깅

### 배치 처리 설정
- 버퍼 크기: 100개 로그
- 전송 주기: 5초
- 최대 버퍼 크기 도달 시 즉시 전송

### 전송 보안
- CORS 설정으로 도메인 제한
- 요청 크기 제한 (1MB)
- 입력값 검증 및 정리
- Rate limiting 적용

## API 통합 예시  

### Fortune API에 로깅 적용
```javascript
// Before
async function callFortuneAPI(data) {
  const response = await fetch('/api/fortune', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}

// After  
async function callFortuneAPI(data) {
  const timer = logger.startTimer('Fortune API Call');
  
  try {
    const response = await fetch('/api/fortune', {
      method: 'POST', 
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    logger.logApiCall('/api/fortune', 'POST', response.status, 
      timer.end(), { success: true, dataSize: JSON.stringify(result).length });
    
    logger.logUserAction('fortune_generated', {
      type: data.type,
      hasResult: !!result.data
    });
    
    return result;
  } catch (error) {
    timer.end();
    logger.error('Fortune API failed', { error: error.message, data });
    throw error;
  }
}
```

## 테스트 및 디버깅

### 테스트 페이지
`/test-logging.html` 페이지에서 모든 로깅 기능을 테스트할 수 있습니다:

- 기본 로그 레벨 테스트
- 사용자 행동 로깅 테스트  
- API 호출 시뮬레이션
- 성능 모니터링 테스트
- 에러 시뮬레이션
- 원격 로그 전송 테스트

### 로그 확인 방법

**개발 환경:**
1. 브라우저 개발자 도구 콘솔 확인
2. 네트워크 탭에서 `/api/logs` 요청 확인

**프로덕션 환경:**  
1. Vercel 함수 로그 확인
2. `/api/logs/stats` 엔드포인트로 통계 확인

## 모범 사례

### 1. 로그 메시지 작성
```javascript
// Good
logger.info('User completed fortune analysis', {
  userId: user.id,
  fortuneType: 'daily', 
  processingTime: 1200,
  success: true
});

// Bad  
logger.info('Fortune done');
```

### 2. 에러 로깅
```javascript
// Good
try {
  await riskyOperation();
} catch (error) {
  logger.error('Risky operation failed', {
    operation: 'user_data_processing',
    error: error.message,
    stack: error.stack,
    userId: user.id,
    context: { /* relevant context */ }
  });
  throw error;
}

// Bad
try {
  await riskyOperation(); 
} catch (error) {
  logger.error('Error');
  throw error;
}
```

### 3. 성능 로깅
```javascript
// 중요한 작업에만 사용
const timer = logger.startTimer('Critical User Operation');
await criticalOperation();
timer.end();

// 너무 자주 사용하지 않기
// ❌ 모든 함수 호출마다 타이머 사용하지 말것
```

### 4. 민감한 정보 처리
```javascript
// Good - 민감한 정보 제거
logger.info('User login attempt', {
  userId: user.id,
  hasPassword: !!password, // 실제 비밀번호는 로깅 안함
  userAgent: req.headers['user-agent']
});

// Bad - 민감한 정보 노출
logger.info('User login', {
  password: password, // ❌ 민감한 정보
  creditCard: user.card // ❌ 민감한 정보
});
```

## 문제 해결

### 로거가 초기화되지 않는 경우
```javascript
// 로거 준비 확인
document.addEventListener('DohaLoggerReady', (event) => {
  const logger = event.detail.logger;
  // 로거 사용 가능
});

// 또는 폴백 사용
const safeLog = (level, message, data) => {
  if (window.DohaLogger) {
    window.DohaLogger[level](message, data);
  } else {
    console[level](`[${level.toUpperCase()}] ${message}`, data);
  }
};
```

### 로그가 전송되지 않는 경우
1. 네트워크 연결 확인
2. CORS 설정 확인
3. API 엔드포인트 상태 확인
4. 브라우저 콘솔에서 에러 메시지 확인

### 성능 영향 최소화
```javascript
// 조건부 상세 로깅
if (logger.config.minLevel <= LOG_LEVELS.DEBUG) {
  const expensiveData = computeExpensiveDebugData();
  logger.debug('Detailed debug info', expensiveData);
}
```

## 향후 확장 계획

1. **외부 로깅 서비스 연동** (Datadog, CloudWatch)
2. **실시간 대시보드** 구축
3. **알림 시스템** (Critical 로그 발생 시)
4. **로그 분석** 및 인사이트 도구
5. **A/B 테스트** 지원 로깅

## 라이센스 및 보안

- 사용자 개인정보는 익명화하여 처리
- 로그 데이터는 30일 후 자동 삭제
- GDPR 및 개인정보보호법 준수
- 보안 취약점 발견 시 즉시 보고