# AdSense 광고 단위 생성 및 적용 가이드

## 📋 현재 상태
- AdSense 계정: ✅ 준비됨 (승인 완료)
- Publisher ID: `ca-pub-7905640648499222`
- 문제: 가짜 광고 슬롯 ID 사용 중

## 🎯 즉시 실행 단계

### Step 1: 광고 단위 생성 (5분 소요)

1. [Google AdSense](https://www.google.com/adsense/) 로그인
2. 왼쪽 메뉴에서 **"광고"** 클릭
3. **"광고 단위"** 탭 선택
4. **"새 광고 단위 만들기"** 클릭

### Step 2: 광고 유형별 생성 권장

#### 1. 메인 페이지용 (반응형)
- 이름: `doha.kr - Main Responsive`
- 유형: 디스플레이 광고
- 크기: 반응형
- → 생성 후 `data-ad-slot` 번호 기록

#### 2. 콘텐츠 페이지용 (인피드)
- 이름: `doha.kr - Content Feed`
- 유형: 인피드 광고
- 스타일: 텍스트 및 이미지
- → 생성 후 `data-ad-slot` 번호 기록

#### 3. 모바일 최적화용
- 이름: `doha.kr - Mobile`
- 유형: 디스플레이 광고
- 크기: 모바일 배너 (320x50)
- → 생성 후 `data-ad-slot` 번호 기록

### Step 3: 코드 수정 위치

```bash
# 가짜 ID "1234567890"을 사용하는 파일들 (14개):
- index.html
- 404.html
- offline.html
- tests/index.html
- tests/mbti/index.html
- tests/teto-egen/index.html
- tests/love-dna/index.html
- fortune/index.html
- fortune/daily/index.html
- fortune/saju/index.html
- fortune/tarot/index.html
- fortune/zodiac/index.html
- fortune/zodiac-animal/index.html
- tools/index.html

# 기타 페이지들:
- about/index.html (5432167890)
- privacy/index.html (6789012345)
- terms/index.html (2468013579)
- contact/index.html (9876543210)
- faq/index.html (3892514725)
```

### Step 4: 빠른 수정 스크립트

```javascript
// 일괄 수정용 (Node.js)
const fs = require('fs');
const path = require('path');

const OLD_SLOT = '1234567890';
const NEW_SLOT = '실제_광고_슬롯_ID'; // 여기에 실제 ID 입력

const files = [
  'index.html',
  '404.html',
  'offline.html',
  // ... 나머지 파일들
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(new RegExp(OLD_SLOT, 'g'), NEW_SLOT);
  fs.writeFileSync(filePath, content);
});
```

### Step 5: CSP 헤더 통일

모든 HTML 파일의 CSP를 다음으로 통일:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://adsbygoogle.js https://www.googletagmanager.com https://www.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://fundingchoicesmessages.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://pagead2.googlesyndication.com https://www.google-analytics.com https://identitytoolkit.googleapis.com https://doha-kr-api.vercel.app https://generativelanguage.googleapis.com;">
```

## 📊 예상 수익 (MAU 10만 기준)

| 광고 유형 | CTR | CPC | 일 수익 | 월 수익 |
|---------|-----|-----|--------|---------|
| 반응형 | 1.5% | $0.25 | $125 | $3,750 |
| 인피드 | 2.0% | $0.20 | $133 | $4,000 |
| 모바일 | 1.0% | $0.15 | $50 | $1,500 |
| **합계** | - | - | **$308** | **$9,250** |

## ✅ 체크리스트

- [ ] AdSense에서 광고 단위 3개 생성
- [ ] 각 광고 단위의 슬롯 ID 기록
- [ ] 모든 HTML 파일의 가짜 ID 교체
- [ ] CSP 헤더 업데이트
- [ ] 배포 후 광고 표시 확인
- [ ] 24시간 후 수익 리포트 확인

## 🚀 다음 단계

1. 광고 최적화
   - A/B 테스트
   - 광고 위치 조정
   - 사용자 경험 모니터링

2. 수익 극대화
   - 고가 키워드 타겟팅
   - 콘텐츠 최적화
   - 트래픽 증대

---

**작성일**: 2025년 1월 21일
**긴급도**: 🔴 매우 높음 (즉시 실행 필요)