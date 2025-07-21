# AdSense 광고 단위 생성 빠른 가이드

## 현재 상황
- ✅ AdSense 계정: 준비됨
- ✅ Publisher ID: `ca-pub-7905640648499222` (실제 ID)
- ❌ Ad Slot ID: `1234567890` (가짜 플레이스홀더)

## 5분 안에 수익화 시작하기

### 1. AdSense 대시보드 접속
https://www.google.com/adsense/

### 2. 광고 단위 생성
1. 왼쪽 메뉴 → **"광고"**
2. **"광고 단위"** 탭
3. **"코드 가져오기"** 버튼 클릭

### 3. 광고 단위가 없다면 새로 생성
1. **"새 광고 단위"** 클릭
2. **디스플레이 광고** 선택
3. 이름: `doha.kr 메인`
4. 크기: **반응형** (권장)
5. **"만들기"** 클릭

### 4. 실제 코드 확인
생성된 코드에서 이 부분 찾기:
```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7905640648499222"
     data-ad-slot="2847593021"  <!-- 이게 실제 번호! -->
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
```

### 5. 가짜 ID를 실제 ID로 교체

현재 코드:
```html
data-ad-slot="1234567890"  <!-- 가짜 -->
```

실제 코드로 변경:
```html
data-ad-slot="2847593021"  <!-- 실제 광고 단위 ID -->
```

## 일괄 수정 명령어

```bash
# PowerShell에서 실행
$oldSlot = "1234567890"
$newSlot = "실제광고단위ID"  # 여기에 실제 ID 입력

Get-ChildItem -Path "C:\Users\pc\teste" -Filter "*.html" -Recurse | 
ForEach-Object {
    (Get-Content $_.FullName) -replace $oldSlot, $newSlot | 
    Set-Content $_.FullName
}
```

## 확인 방법

1. 브라우저에서 doha.kr 접속
2. F12 (개발자 도구)
3. Console 탭에서 오류 확인
4. 광고가 표시되면 성공!

## FAQ

**Q: 광고가 바로 안 보여요**
A: 처음에는 빈 공간으로 보일 수 있습니다. 몇 시간 후 광고가 채워집니다.

**Q: 여전히 오류가 나요**
A: 실제 광고 단위 ID인지 다시 확인하세요. 연속된 숫자면 가짜입니다.

---

지금 바로 AdSense 대시보드에서 확인해보세요!