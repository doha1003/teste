# AdSense 설정 수정 가이드

## 현재 문제점
- 테스트용 가짜 광고 슬롯 ID 사용 중
- CSP 헤더에 필수 도메인 누락

## 수정 절차

### 1. AdSense 계정 상태 확인
1. [Google AdSense](https://www.google.com/adsense/) 로그인
2. 계정 상태 확인:
   - ✅ 승인됨: 2단계로 진행
   - ⏳ 검토 중: 승인 대기
   - ❌ 거부됨: 재신청 필요

### 2. 실제 광고 단위 생성 (승인된 경우)
1. AdSense 대시보드 → "광고" → "광고 단위"
2. "디스플레이 광고" 선택
3. 광고 단위 이름 입력 (예: "doha.kr 메인")
4. 광고 크기: "반응형" 선택
5. "만들기" 클릭
6. 생성된 코드에서 `data-ad-slot="실제숫자"` 복사

### 3. 코드 수정 위치

#### 가짜 ID를 실제 ID로 교체할 파일들:
```
# 메인 광고 (14개 파일)
data-ad-slot="1234567890" → data-ad-slot="실제ID"

# 특수 페이지 광고
about/index.html: "5432167890" → "실제ID"
privacy/index.html: "6789012345" → "실제ID"
faq/index.html: "3892514725" → "실제ID"
```

### 4. CSP 헤더 수정

모든 HTML 파일의 CSP에 다음 도메인 추가:
```html
<meta http-equiv="Content-Security-Policy" content="
  script-src 'self' 'unsafe-inline' 'unsafe-eval' 
  https://pagead2.googlesyndication.com 
  https://adsbygoogle.js 
  https://www.googleadservices.com 
  https://googleads.g.doubleclick.net 
  https://tpc.googlesyndication.com 
  https://fundingchoicesmessages.google.com;
">
```

### 5. 테스트 및 확인

1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭에서 오류 확인
3. Network 탭에서 광고 요청 상태 확인

## 예상 결과

### 승인 전
- 광고 공간은 비어있음 (정상)
- 403/400 오류 없어짐

### 승인 후 + 실제 ID 적용
- 광고 정상 표시
- 수익 발생 시작

## 체크리스트

- [ ] AdSense 계정 상태 확인
- [ ] 실제 광고 단위 생성 (승인된 경우)
- [ ] 모든 가짜 광고 ID 교체
- [ ] CSP 헤더 업데이트
- [ ] 브라우저에서 테스트
- [ ] 24시간 후 AdSense 리포트 확인