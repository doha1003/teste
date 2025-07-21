# 실제 AdSense ID 적용 가이드

## 🎉 발견된 실제 광고 단위들

| 광고 유형 | 실제 ID | 생성일 | 용도 |
|----------|---------|--------|------|
| **디스플레이광고** | `3911401606` | 2021.03.14 | 메인 페이지에 최적 |
| **인피드** | `5784361252` | 2021.03.14 | 목록 페이지에 최적 |
| **콘텐츠 내 광고** | `2789891628` | 2021.03.14 | 콘텐츠 페이지에 최적 |
| **인아티클** | `8912541604` | 2022.11.04 | 기사형 콘텐츠에 최적 |
| **검색엔진** | `8e7498690b4b6559b` | 2021.03.14 | 검색 결과용 |

## 📝 교체 계획

### 1. 메인 페이지 및 주요 페이지 (디스플레이 광고)
```javascript
// 현재 (가짜)
data-ad-slot="1234567890"

// 변경 후 (실제)
data-ad-slot="3911401606"
```

적용 파일:
- index.html
- 404.html
- offline.html
- about/index.html
- contact/index.html

### 2. 목록형 페이지 (인피드 광고)
```javascript
// 변경 후
data-ad-slot="5784361252"
```

적용 파일:
- tests/index.html
- fortune/index.html
- tools/index.html

### 3. 콘텐츠 페이지 (콘텐츠 내 광고)
```javascript
// 변경 후
data-ad-slot="2789891628"
```

적용 파일:
- tests/mbti/index.html
- tests/teto-egen/index.html
- tests/love-dna/index.html
- fortune/daily/index.html
- fortune/saju/index.html
- fortune/tarot/index.html
- fortune/zodiac/index.html
- fortune/zodiac-animal/index.html

### 4. 도구 페이지 (인아티클 광고)
```javascript
// 변경 후
data-ad-slot="8912541604"
```

적용 파일:
- tools/text-counter.html
- tools/bmi-calculator.html
- tools/salary-calculator.html

## 🚀 일괄 적용 스크립트

### PowerShell 스크립트
```powershell
# 1. 디스플레이 광고 적용 (메인 페이지들)
$files1 = @("index.html", "404.html", "offline.html")
foreach ($file in $files1) {
    $path = "C:\Users\pc\teste\$file"
    (Get-Content $path) -replace '1234567890', '3911401606' | Set-Content $path
}

# 2. 인피드 광고 적용 (목록 페이지들)
$files2 = @("tests\index.html", "fortune\index.html", "tools\index.html")
foreach ($file in $files2) {
    $path = "C:\Users\pc\teste\$file"
    (Get-Content $path) -replace '1234567890', '5784361252' | Set-Content $path
}

# 3. 콘텐츠 내 광고 적용 (테스트/운세 페이지들)
$contentFiles = Get-ChildItem -Path "C:\Users\pc\teste\tests\*\index.html", "C:\Users\pc\teste\fortune\*\index.html"
foreach ($file in $contentFiles) {
    (Get-Content $file.FullName) -replace '1234567890', '2789891628' | Set-Content $file.FullName
}

# 4. 특수 페이지들 개별 처리
(Get-Content "C:\Users\pc\teste\about\index.html") -replace '5432167890', '3911401606' | Set-Content "C:\Users\pc\teste\about\index.html"
(Get-Content "C:\Users\pc\teste\privacy\index.html") -replace '6789012345', '3911401606' | Set-Content "C:\Users\pc\teste\privacy\index.html"
```

### Git 커밋 및 배포
```bash
cd C:\Users\pc\teste
git add -A
git commit -m "feat: Apply real AdSense ad unit IDs for monetization"
git push origin main
```

## ✅ 적용 후 확인사항

1. **즉시 확인**
   - 브라우저 개발자 도구에서 403/400 오류 사라짐
   - 광고 공간이 예약됨 (처음엔 빈 공간)

2. **몇 시간 후**
   - 실제 광고 표시 시작
   - AdSense 대시보드에서 노출수 확인

3. **24시간 후**
   - 수익 리포트 확인
   - 페이지별 성과 분석

## 📊 예상 결과

- **오류 해결**: 403/400 오류 완전 해결
- **광고 표시**: 2-4시간 내 광고 표시 시작
- **수익 발생**: 24시간 내 첫 수익 확인

지금 바로 적용하시겠습니까?