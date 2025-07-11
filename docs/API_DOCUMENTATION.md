# doha.kr API 문서

## 개요
doha.kr에서 제공하는 API 서비스에 대한 기술 문서입니다.

---

## Fortune API (AI 운세 서비스)

### 기본 정보
- **Base URL**: `https://doha.kr/api`
- **인증**: 불필요 (공개 API)
- **Rate Limiting**: IP당 분당 60회
- **응답 형식**: JSON

### 엔드포인트

#### POST /fortune
AI 기반 운세 정보를 생성합니다.

##### 요청 헤더
```http
Content-Type: application/json
Origin: https://doha.kr
```

##### 요청 본문

###### 일일 운세 (daily)
```json
{
    "type": "daily",
    "name": "홍길동",
    "birthDate": "1990-01-01",
    "gender": "male"
}
```

###### 별자리 운세 (zodiac)
```json
{
    "type": "zodiac",
    "zodiac": "물병자리"
}
```

###### 띠별 운세 (animal)
```json
{
    "type": "animal",
    "animal": "호랑이띠"
}
```

##### 요청 파라미터 상세

| 파라미터 | 타입 | 필수 | 설명 | 제약사항 |
|---------|------|------|------|----------|
| type | string | ✓ | 운세 타입 | "daily", "zodiac", "animal" 중 하나 |
| name | string | ✓* | 사용자 이름 | 최대 20자, 한글/영문만 허용 |
| birthDate | string | ✓* | 생년월일 | YYYY-MM-DD 형식 |
| gender | string | ✓* | 성별 | "male" 또는 "female" |
| zodiac | string | ✓** | 별자리명 | 한글 별자리명 |
| animal | string | ✓*** | 띠 이름 | 한글 띠 이름 |

\* type이 "daily"인 경우 필수
\** type이 "zodiac"인 경우 필수
\*** type이 "animal"인 경우 필수

##### 응답 예시

###### 성공 응답 (200 OK)
```json
{
    "success": true,
    "data": {
        "scores": {
            "overall": 85,
            "love": 75,
            "money": 70,
            "health": 90,
            "work": 80
        },
        "descriptions": {
            "overall": "오늘은 전체적으로 안정되고 평온한 하루가 될 것입니다. 특히 오후 시간대에 좋은 기회가 찾아올 수 있으니 주의 깊게 살펴보세요.",
            "love": "연인과의 관계에서 소통이 중요한 시기입니다. 서로의 마음을 열고 대화를 나누면 더욱 돈독한 관계로 발전할 수 있습니다.",
            "money": "금전운이 평탄합니다. 큰 수입은 없지만 안정적인 재정 상태를 유지할 수 있습니다. 충동구매는 자제하세요.",
            "health": "건강 상태가 양호합니다. 규칙적인 운동과 충분한 수면을 유지하면 더욱 활력 있는 하루를 보낼 수 있습니다.",
            "work": "업무에서 꾸준한 성과를 거둘 수 있는 날입니다. 동료들과의 협업이 중요하니 팀워크에 신경 쓰세요."
        },
        "luck": {
            "direction": "동쪽",
            "time": "오시(11:00-13:00)",
            "color": "청색",
            "number": "3, 7"
        }
    }
}
```

###### 에러 응답

**400 Bad Request**
```json
{
    "error": "Invalid request",
    "message": "필수 파라미터가 누락되었습니다."
}
```

**405 Method Not Allowed**
```json
{
    "error": "Method not allowed",
    "message": "POST 메소드만 허용됩니다."
}
```

**500 Internal Server Error**
```json
{
    "error": "Internal server error",
    "message": "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
}
```

### 보안 고려사항

#### 입력값 검증
- 모든 입력값은 서버에서 sanitization 처리
- SQL Injection, XSS, Prompt Injection 방지
- 최대 길이 제한 적용

#### Rate Limiting
- IP당 분당 60회 제한
- 초과 시 429 Too Many Requests 반환

#### CORS 정책
- Origin 헤더 검증
- https://doha.kr 도메인만 허용

### 사용 예제

#### JavaScript (Fetch API)
```javascript
async function getDailyFortune(name, birthDate, gender) {
    try {
        const response = await fetch('https://doha.kr/api/fortune', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'daily',
                name: name,
                birthDate: birthDate,
                gender: gender
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('운세 조회 실패:', error);
        throw error;
    }
}

// 사용 예
getDailyFortune('홍길동', '1990-01-01', 'male')
    .then(result => {
        console.log('종합운:', result.data.scores.overall);
        console.log('오늘의 운세:', result.data.descriptions.overall);
    });
```

#### Python
```python
import requests
import json

def get_daily_fortune(name, birth_date, gender):
    url = 'https://doha.kr/api/fortune'
    headers = {
        'Content-Type': 'application/json',
        'Origin': 'https://doha.kr'
    }
    data = {
        'type': 'daily',
        'name': name,
        'birthDate': birth_date,
        'gender': gender
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"운세 조회 실패: {e}")
        return None

# 사용 예
result = get_daily_fortune('홍길동', '1990-01-01', 'male')
if result and result['success']:
    print(f"종합운: {result['data']['scores']['overall']}")
    print(f"오늘의 운세: {result['data']['descriptions']['overall']}")
```

#### cURL
```bash
curl -X POST https://doha.kr/api/fortune \
  -H "Content-Type: application/json" \
  -H "Origin: https://doha.kr" \
  -d '{
    "type": "daily",
    "name": "홍길동",
    "birthDate": "1990-01-01",
    "gender": "male"
  }'
```

### 응답 데이터 구조

#### FortuneResponse
```typescript
interface FortuneResponse {
    success: boolean;
    data?: FortuneData;
    error?: string;
    message?: string;
}

interface FortuneData {
    scores: FortuneScores;
    descriptions: FortuneDescriptions;
    luck: FortuneLuck;
}

interface FortuneScores {
    overall: number;  // 70-95
    love: number;     // 60-90
    money: number;    // 55-90
    health: number;   // 65-95
    work: number;     // 60-90
}

interface FortuneDescriptions {
    overall: string;
    love: string;
    money: string;
    health: string;
    work: string;
}

interface FortuneLuck {
    direction: string;  // 방위
    time: string;       // 길한 시간
    color: string;      // 행운의 색
    number?: string;    // 행운의 숫자 (선택적)
}
```

### 에러 처리 가이드

1. **네트워크 에러**: 재시도 로직 구현 권장 (최대 3회)
2. **400 에러**: 입력값 검증 후 재요청
3. **429 에러**: Rate limit 초과, 1분 후 재시도
4. **500 에러**: 백업 데이터 사용 또는 사용자에게 안내

### 변경 이력

| 버전 | 날짜 | 변경사항 |
|------|------|----------|
| 1.0.0 | 2025-01-11 | 초기 버전 릴리즈 |

---

## 향후 추가 예정 API

### 1. Text Analysis API
글자수 세기 도구의 고급 분석 기능 API

### 2. BMI Calculation API
BMI 계산 및 건강 조언 API

### 3. Test Results API
심리테스트 결과 저장 및 조회 API

---

마지막 업데이트: 2025-01-11