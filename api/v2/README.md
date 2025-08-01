# doha.kr API v2 Documentation

doha.kr의 새로운 백엔드 API 시스템입니다. Vercel Serverless Functions 기반으로 구축되었으며, 한국어 사용자를 위한 운세, 심리테스트, 실용도구 서비스를 제공합니다.

## 📋 목차

- [아키텍처](#아키텍처)
- [API 엔드포인트](#api-엔드포인트)
- [인증 및 보안](#인증-및-보안)
- [Rate Limiting](#rate-limiting)
- [에러 처리](#에러-처리)
- [사용 예제](#사용-예제)

## 🏗️ 아키텍처

```
api/v2/
├── core/           # 핵심 유틸리티
│   ├── middleware.js    # 공통 미들웨어
│   ├── validation.js    # 입력 검증
│   ├── rate-limiter.js  # 속도 제한
│   ├── cache.js         # 캐싱 시스템
│   └── logger.js        # 로깅 시스템
│
├── services/       # 비즈니스 로직
│   ├── fortune/    # 운세 서비스
│   ├── psychology/ # 심리테스트 서비스
│   └── tools/      # 실용도구 서비스
│
└── endpoints/      # API 엔드포인트
    ├── fortune.js      # /api/v2/fortune
    ├── psychology.js   # /api/v2/psychology
    └── tools.js        # /api/v2/tools
```

## 🔗 API 엔드포인트

### 운세 API (`/api/v2/fortune`)

#### 일일 운세
```http
POST /api/v2/fortune
Content-Type: application/json

{
  "type": "daily",
  "data": {
    "name": "홍길동",
    "birthDate": "1990-01-01",
    "gender": "male",
    "birthTime": "14"
  },
  "options": {
    "includeDetailed": true,
    "includeLucky": true
  }
}
```

#### 사주 분석
```http
POST /api/v2/fortune
Content-Type: application/json

{
  "type": "saju",
  "data": {
    "yearPillar": "경자",
    "monthPillar": "무인",
    "dayPillar": "정해",
    "hourPillar": "신축"
  }
}
```

#### 타로 카드
```http
POST /api/v2/fortune
Content-Type: application/json

{
  "type": "tarot",
  "data": {
    "cardNumbers": [15, 42, 77],
    "question": "내 연애운은 어떨까요?",
    "spread": "three-card"
  }
}
```

#### 별자리 운세
```http
POST /api/v2/fortune
Content-Type: application/json

{
  "type": "zodiac",
  "data": {
    "zodiac": "leo"
  },
  "options": {
    "includeWeekly": true
  }
}
```

#### 12띠 운세
```http
POST /api/v2/fortune
Content-Type: application/json

{
  "type": "animal",
  "data": {
    "animal": "dragon"
  },
  "options": {
    "includeYearly": true
  }
}
```

### 심리테스트 API (`/api/v2/psychology`)

#### MBTI 검사
```http
POST /api/v2/psychology
Content-Type: application/json

{
  "type": "mbti",
  "data": {
    "answers": [3, 4, 2, 5, 1, ...] // 60개 답변 (1-5 스케일)
  },
  "options": {
    "includeDetailedAnalysis": true,
    "includeCareerAdvice": true
  }
}
```

#### MBTI 궁합 분석
```http
POST /api/v2/psychology/mbti-compatibility
Content-Type: application/json

{
  "type1": "ENFP",
  "type2": "INTJ"
}
```

### 실용도구 API (`/api/v2/tools`)

#### BMI 계산
```http
POST /api/v2/tools
Content-Type: application/json

{
  "type": "bmi",
  "data": {
    "height": 170,
    "weight": 65
  }
}
```

#### 연봉 계산 (한국 세법)
```http
POST /api/v2/tools
Content-Type: application/json

{
  "type": "salary",
  "data": {
    "annualSalary": 50000000,
    "dependents": 2,
    "isMarried": true
  }
}
```

#### 텍스트 분석
```http
POST /api/v2/tools
Content-Type: application/json

{
  "type": "text-counter",
  "data": {
    "text": "분석할 텍스트 내용입니다..."
  }
}
```

## 🔐 인증 및 보안

### CORS 설정
- 허용 도메인: `doha.kr`, `www.doha.kr`
- 개발 환경: `localhost:3000`, `localhost:8080`

### 보안 헤더
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy: ...`

### 입력 검증
- 모든 사용자 입력 데이터 검증
- SQL Injection, XSS 방지
- 한글 이름 및 날짜 형식 검증

## ⚡ Rate Limiting

| 서비스 | 제한 | 기간 |
|--------|------|------|
| 운세 API | 30 requests | 1분 |
| 심리테스트 API | 20 requests | 1분 |
| 실용도구 API | 100 requests | 1분 |

### Rate Limit 헤더
```http
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 2025-07-31T12:00:00.000Z
Retry-After: 45
```

## 🚨 에러 처리

### 표준 에러 응답
```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "입력 데이터가 올바르지 않습니다.",
    "timestamp": "2025-07-31T12:00:00.000Z"
  }
}
```

### HTTP 상태 코드
- `200` - 성공
- `400` - 잘못된 요청
- `429` - Rate Limit 초과
- `500` - 서버 내부 오류
- `503` - 서비스 이용 불가

### 한국어 에러 메시지
- 모든 에러 메시지는 한국어로 제공
- 사용자 친화적인 메시지
- 기술적 세부사항은 개발 환경에서만 노출

## 🎯 사용 예제

### JavaScript (Fetch API)
```javascript
// 일일 운세 조회
const response = await fetch('/api/v2/fortune', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'daily',
    data: {
      name: '홍길동',
      birthDate: '1990-01-01',
      gender: 'male'
    }
  })
});

const result = await response.json();
if (result.success) {
  console.log('오늘의 운세:', result.data);
} else {
  console.error('에러:', result.error.message);
}
```

### cURL
```bash
# MBTI 테스트 실행
curl -X POST https://doha.kr/api/v2/psychology \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mbti",
    "data": {
      "answers": [3,4,2,5,1,4,3,2,5,1,4,3,2,5,1,4,3,2,5,1,4,3,2,5,1,4,3,2,5,1,4,3,2,5,1,4,3,2,5,1,4,3,2,5,1,4,3,2,5,1,4,3,2,5,1,4,3,2,5,1]
    }
  }'
```

## 🔧 설정

### 환경변수
```bash
# Gemini API 설정
GEMINI_API_KEY=your_gemini_api_key

# 로깅 레벨 (0=ERROR, 1=WARN, 2=INFO, 3=DEBUG)
LOG_LEVEL=2

# Node.js 환경
NODE_ENV=production
```

### 캐싱 정책
- **운세**: 캐시 안함 (개인화됨)
- **심리테스트**: 캐시 안함 (개인화됨)
- **실용도구**: 5분 캐시
- **정적 데이터**: 24시간 캐시

## 🚀 성능 최적화

### Edge Runtime
- Vercel Edge Runtime 사용
- 전 세계 CDN 배포
- Cold Start 최소화

### 압축
- Gzip 응답 압축
- JSON 응답 최적화
- 불필요한 데이터 제거

### 메모리 관리
- LRU 캐시 구현
- 메모리 사용량 모니터링
- 가비지 컬렉션 최적화

## 📊 모니터링

### 로그 구조
```json
{
  "timestamp": "2025-07-31T12:00:00.000Z",
  "level": "INFO",
  "namespace": "fortune-api",
  "message": "Request completed",
  "requestId": "req_1234567890_abc123",
  "duration": 250,
  "success": true
}
```

### 메트릭
- 요청 수/응답 시간
- 에러율/성공률
- Rate Limit 히트율
- 캐시 히트율

## 🧪 테스트

### Health Check
```http
GET /api/v2/fortune/health
GET /api/v2/psychology/health  
GET /api/v2/tools/health
```

### 응답 예시
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "daily": { "status": "healthy", "model": "gemini-1.5-flash" },
      "saju": { "status": "healthy", "model": "gemini-1.5-flash" },
      "tarot": { "status": "healthy", "totalCards": 78 }
    },
    "timestamp": "2025-07-31T12:00:00.000Z"
  }
}
```

## 📝 라이센스

Copyright (c) 2025 doha.kr. All rights reserved.

---

**⚠️ 중요사항**
- 이 API는 doha.kr 웹사이트 전용입니다
- API 키나 제한 없이 무료로 사용 가능합니다
- Rate Limiting을 준수해주세요
- 문제 발생 시 GitHub Issues를 통해 신고해주세요