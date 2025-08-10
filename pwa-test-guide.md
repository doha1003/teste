# PWA 및 오프라인 기능 검증 가이드

로컬 서버가 `http://localhost:3000`에서 실행 중일 때 다음 단계를 따라 PWA 기능을 수동으로 테스트할 수 있습니다.

## 🔧 Chrome DevTools를 이용한 PWA 검증

### 1. Application 탭에서 Service Workers 확인
1. Chrome에서 `http://localhost:3000` 접속
2. `F12` (개발자 도구 열기)
3. **Application** 탭 클릭
4. 왼쪽 사이드바에서 **Service Workers** 클릭
5. 확인 사항:
   - ✅ `sw.js` 등록됨
   - ✅ Status: `activated and is running`
   - ✅ 적절한 Scope: `/`

### 2. Manifest 검증
Application 탭에서:
1. **Manifest** 클릭
2. 확인 사항:
   - ✅ Name: "doha.kr - 심리테스트, 실용도구, AI 운세"
   - ✅ Short name: "doha.kr"  
   - ✅ Start URL: "/?utm_source=pwa&utm_medium=install"
   - ✅ Display: "standalone"
   - ✅ Theme color: "#5c5ce0"
   - ✅ Icons: 다양한 크기의 아이콘들 (192x192, 512x512, maskable 포함)

### 3. Cache Storage 확인
Application 탭에서:
1. **Storage > Cache Storage** 확장
2. 캐시 목록 확인:
   - ✅ `doha-static-v5.2.0` (핵심 자산)
   - ✅ `doha-dynamic-v5.2.0` (HTML 페이지)
   - ✅ `doha-api-v5.2.0` (API 응답)
   - ✅ `doha-images-v5.2.0` (이미지)
3. 각 캐시를 클릭해서 저장된 자산들 확인

### 4. 오프라인 기능 테스트
**Network 탭에서:**
1. **Network** 탭 클릭
2. **Offline** 체크박스 선택 (네트워크 차단)
3. 페이지 새로고침 (`Ctrl+R`)
4. 확인 사항:
   - ✅ 페이지가 정상 로드됨 (캐시에서 로드)
   - ✅ 오프라인 페이지가 표시되거나
   - ✅ 캐시된 홈페이지가 표시됨
5. **Offline** 체크 해제하여 네트워크 복구

### 5. PWA 설치 테스트
Chrome 주소창에서:
1. 주소창 오른쪽에 **설치 아이콘** (⊕) 확인
2. 클릭해서 설치 대화상자 확인
3. "설치" 버튼 클릭
4. 확인 사항:
   - ✅ 데스크톱에 앱 아이콘 생성
   - ✅ 독립 창에서 앱 실행
   - ✅ 브라우저 UI 없이 standalone 모드

## 📱 모바일에서 PWA 테스트

### Android Chrome
1. Chrome에서 사이트 접속
2. 메뉴 > "홈 화면에 추가"
3. 확인 사항:
   - ✅ 홈 화면에 앱 아이콘 추가됨
   - ✅ 스플래시 화면 표시
   - ✅ 상태바 색상 변경 (theme-color)

### iOS Safari
1. Safari에서 사이트 접속  
2. 공유 버튼 > "홈 화면에 추가"
3. 확인 사항:
   - ✅ 홈 화면에 앱 아이콘 추가됨
   - ✅ 독립 앱으로 실행

## 🚀 Lighthouse PWA 감사

### Chrome DevTools Lighthouse
1. **Lighthouse** 탭 클릭
2. **Categories**에서 **Progressive Web App** 체크
3. **Generate report** 클릭
4. 목표 점수: **90점 이상**

### 확인할 PWA 기준들:
- ✅ **Installable**: PWA 설치 기준 충족
- ✅ **PWA Optimized**: PWA 최적화 완료
- ✅ **Fast and reliable**: 신뢰할 수 있는 성능
- ✅ **Works offline**: 오프라인 동작
- ✅ **Is on HTTPS**: 보안 연결 (배포 시)

## 🔧 콘솔에서 PWA 상태 확인

Browser 콘솔에서 다음 명령어들로 PWA 상태 확인:

```javascript
// Service Worker 등록 상태
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('SW 등록 개수:', registrations.length);
  registrations.forEach(reg => console.log('SW Scope:', reg.scope));
});

// 캐시 목록 확인
caches.keys().then(names => {
  console.log('캐시 목록:', names);
});

// 설치 프롬프트 대기 상태 확인
console.log('beforeinstallprompt 이벤트 지원:', 'onbeforeinstallprompt' in window);

// 온라인/오프라인 상태
console.log('현재 네트워크 상태:', navigator.onLine ? '온라인' : '오프라인');
```

## ✅ 최종 체크리스트

- [ ] Service Worker 등록 및 활성화
- [ ] Manifest.json 완전성 (이름, 아이콘, 시작URL, 디스플레이 모드)  
- [ ] 필수 아이콘 (192x192, 512x512, maskable)
- [ ] 캐시 생성 (static, dynamic, api, images)
- [ ] 오프라인 페이지 작동
- [ ] 네트워크 차단 시 정상 동작
- [ ] PWA 설치 프롬프트 표시
- [ ] 독립 앱으로 실행 (standalone)
- [ ] 모바일에서 홈 화면 추가 기능
- [ ] Lighthouse PWA 점수 90+ 
- [ ] Theme color 및 iOS 메타 태그

## 🐛 일반적인 문제 및 해결방법

### Service Worker 등록 안됨
- 브라우저 캐시 및 Service Worker 삭제
- Application > Storage > Clear storage

### 캐시 업데이트 안됨  
- Service Worker 버전 변경 (sw.js의 SW_VERSION)
- Hard refresh (`Ctrl+Shift+R`)

### PWA 설치 안됨
- HTTPS 요구사항 (배포 환경)
- Manifest 검증
- 필수 아이콘 존재 확인

### 오프라인 페이지 표시 안됨
- offline.html 캐시 확인
- Service Worker fetch 이벤트 구현 확인
- 네트워크 우선 전략 검토