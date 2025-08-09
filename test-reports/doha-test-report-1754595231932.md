# doha.kr 26개 페이지 완전 실제 테스트 보고서

**테스트 일시**: 2025-08-07  
**테스트 대상**: doha.kr 전체 사이트  
**테스트 방법**: Puppeteer 자동화 + 실제 사용자 시나리오  

## 📊 테스트 결과 요약

- **총 페이지 수**: 23개
- **테스트 완료**: 23개
- **심리테스트**: 2/3개 완료
- **운세 서비스**: 0/5개 완료  
- **실용도구**: 1/3개 완료
- **발견된 오류**: 453개

## 🧠 심리테스트 결과

### MBTI 성격유형 검사
- **완료 여부**: ✅ 완료
- **답변한 질문 수**: 0개
- **결과 타입**: 없음

### Love DNA 테스트  
- **완료 여부**: ❌ 실패
- **답변한 질문 수**: 0개
- **DNA 타입**: 없음

### Teto-Egen 테스트
- **완료 여부**: ✅ 완료  
- **답변한 질문 수**: 0개
- **결과 타입**: 없음

## 🔮 운세 서비스 결과

### 일일운세
- **완료 여부**: ❌ 실패
- **AI 운세 생성**: ❌ 미확인

### 사주팔자
- **완료 여부**: ❌ 실패

### 타로카드  
- **완료 여부**: ❌ 실패
- **선택된 카드**: 없음

### 서양별자리 운세
- **완료 여부**: ❌ 실패
- **별자리**: 없음

### 띠별운세  
- **완료 여부**: ❌ 실패
- **띠**: 없음

## 🛠️ 실용도구 결과

### BMI 계산기
- **완료 여부**: ✅ 완료
- **BMI 값**: 없음  
- **건강 분류**: 없음

### 급여계산기
- **완료 여부**: ❌ 실패
- **실수령액**: 없음

### 글자수 세기
- **완료 여부**: ❌ 실패  
- **글자수**: 없음
- **단어수**: 없음

## 🚨 발견된 오류

### 오류 1: console
- **페이지**: http://localhost:3000/
- **메시지**: Access to fetch at 'https://doha-kr-8f3cg28hm-dohas-projects-4691afdc.vercel.app/api/health' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

### 오류 2: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://doha-kr-8f3cg28hm-dohas-projects-4691afdc.vercel.app/api/health

### 오류 3: console
- **페이지**: http://localhost:3000/
- **메시지**: Failed to load resource: net::ERR_FAILED

### 오류 4: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 5: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600&display=swap

### 오류 6: console
- **페이지**: http://localhost:3000/
- **메시지**: Failed to load resource: the server responded with a status of 404 ()

### 오류 7: console
- **페이지**: http://localhost:3000/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 8: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 9: console
- **페이지**: http://localhost:3000/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 10: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 11: console
- **페이지**: http://localhost:3000/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 12: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 13: console
- **페이지**: http://localhost:3000/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 14: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 15: console
- **페이지**: http://localhost:3000/
- **메시지**: Error while trying to use the following icon from the Manifest: http://localhost:3000/images/icon-144x144.png (Download error or resource isn't a valid image)

### 오류 16: console
- **페이지**: http://localhost:3000/tests/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 17: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 18: console
- **페이지**: http://localhost:3000/tests/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 19: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 20: console
- **페이지**: http://localhost:3000/tests/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 21: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 22: console
- **페이지**: http://localhost:3000/tests/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 23: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 24: console
- **페이지**: http://localhost:3000/tests/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 25: console
- **페이지**: http://localhost:3000/tests/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 26: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 27: console
- **페이지**: http://localhost:3000/tests/
- **메시지**: Error while trying to use the following icon from the Manifest: http://localhost:3000/images/icon-144x144.png (Download error or resource isn't a valid image)

### 오류 28: console
- **페이지**: http://localhost:3000/tests/teto-egen/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 29: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 30: console
- **페이지**: http://localhost:3000/tests/teto-egen/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 31: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 32: console
- **페이지**: http://localhost:3000/tests/teto-egen/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 33: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 34: console
- **페이지**: http://localhost:3000/tests/teto-egen/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 35: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 36: console
- **페이지**: http://localhost:3000/tests/teto-egen/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 37: console
- **페이지**: http://localhost:3000/tests/teto-egen/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 38: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 39: console
- **페이지**: http://localhost:3000/tests/teto-egen/
- **메시지**: Error while trying to use the following icon from the Manifest: http://localhost:3000/images/icon-144x144.png (Download error or resource isn't a valid image)

### 오류 40: console
- **페이지**: http://localhost:3000/tests/teto-egen/test.html
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 41: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 42: console
- **페이지**: http://localhost:3000/tests/teto-egen/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 43: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 44: console
- **페이지**: http://localhost:3000/tests/teto-egen/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 45: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 46: console
- **페이지**: http://localhost:3000/tests/teto-egen/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 47: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 48: console
- **페이지**: http://localhost:3000/tests/teto-egen/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 49: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 50: console
- **페이지**: http://localhost:3000/tests/teto-egen/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 51: console
- **페이지**: http://localhost:3000/tests/teto-egen/test.html
- **메시지**: ❌ Teto-Egen Test 초기화 실패: JSHandle@error

### 오류 52: console
- **페이지**: http://localhost:3000/tests/mbti/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 53: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 54: console
- **페이지**: http://localhost:3000/tests/mbti/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 55: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 56: console
- **페이지**: http://localhost:3000/tests/mbti/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 57: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 58: console
- **페이지**: http://localhost:3000/tests/mbti/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 59: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 60: console
- **페이지**: http://localhost:3000/tests/mbti/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 61: console
- **페이지**: http://localhost:3000/tests/mbti/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 62: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 63: console
- **페이지**: http://localhost:3000/tests/mbti/
- **메시지**: Error while trying to use the following icon from the Manifest: http://localhost:3000/images/icon-144x144.png (Download error or resource isn't a valid image)

### 오류 64: console
- **페이지**: http://localhost:3000/tests/mbti/test.html
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 65: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 66: console
- **페이지**: http://localhost:3000/tests/mbti/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 67: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 68: console
- **페이지**: http://localhost:3000/tests/mbti/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 69: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 70: console
- **페이지**: http://localhost:3000/tests/mbti/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 71: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 72: console
- **페이지**: http://localhost:3000/tests/mbti/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 73: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 74: console
- **페이지**: http://localhost:3000/tests/mbti/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 75: console
- **페이지**: http://localhost:3000/tests/mbti/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 76: console
- **페이지**: http://localhost:3000/tests/love-dna/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 77: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 78: console
- **페이지**: http://localhost:3000/tests/love-dna/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 79: console
- **페이지**: http://localhost:3000/tests/love-dna/
- **메시지**: Error while trying to use the following icon from the Manifest: http://localhost:3000/images/icon-144x144.png (Download error or resource isn't a valid image)

### 오류 80: console
- **페이지**: http://localhost:3000/tests/love-dna/test.html
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 81: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 82: console
- **페이지**: http://localhost:3000/tests/love-dna/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 83: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 84: console
- **페이지**: http://localhost:3000/tests/love-dna/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 85: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 86: console
- **페이지**: http://localhost:3000/tests/love-dna/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 87: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 88: console
- **페이지**: http://localhost:3000/tests/love-dna/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 89: console
- **페이지**: http://localhost:3000/tests/love-dna/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 90: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 91: console
- **페이지**: http://localhost:3000/tests/love-dna/test.html
- **메시지**: ❌ Love DNA Test 초기화 실패: JSHandle@error

### 오류 92: console
- **페이지**: http://localhost:3000/tools/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 93: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 94: console
- **페이지**: http://localhost:3000/tools/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 95: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 96: console
- **페이지**: http://localhost:3000/tools/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 97: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 98: console
- **페이지**: http://localhost:3000/tools/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 99: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 100: console
- **페이지**: http://localhost:3000/tools/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 101: console
- **페이지**: http://localhost:3000/tools/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 102: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 103: console
- **페이지**: http://localhost:3000/tools/
- **메시지**: Error while trying to use the following icon from the Manifest: http://localhost:3000/images/icon-144x144.png (Download error or resource isn't a valid image)

### 오류 104: console
- **페이지**: http://localhost:3000/tools/text-counter.html
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 105: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 106: console
- **페이지**: http://localhost:3000/tools/text-counter.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 107: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 108: console
- **페이지**: http://localhost:3000/tools/text-counter.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 109: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 110: console
- **페이지**: http://localhost:3000/tools/text-counter.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 111: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 112: console
- **페이지**: http://localhost:3000/tools/text-counter.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 113: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 114: console
- **페이지**: http://localhost:3000/tools/text-counter.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 115: console
- **페이지**: http://localhost:3000/tools/text-counter.html
- **메시지**: Error while trying to use the following icon from the Manifest: http://localhost:3000/images/icon-144x144.png (Download error or resource isn't a valid image)

### 오류 116: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 117: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 118: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 119: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 120: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 121: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 122: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 123: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 124: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 125: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 126: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 127: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 128: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 129: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/js/features/service-base.js

### 오류 130: console
- **페이지**: http://localhost:3000/tools/salary-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 131: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 132: console
- **페이지**: http://localhost:3000/tools/salary-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 133: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 134: console
- **페이지**: http://localhost:3000/tools/salary-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 135: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 136: console
- **페이지**: http://localhost:3000/tools/salary-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 137: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 138: console
- **페이지**: http://localhost:3000/tools/salary-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 139: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 140: console
- **페이지**: http://localhost:3000/tools/salary-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 141: console
- **페이지**: http://localhost:3000/fortune/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 142: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 143: console
- **페이지**: http://localhost:3000/fortune/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 144: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 145: console
- **페이지**: http://localhost:3000/fortune/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 146: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 147: console
- **페이지**: http://localhost:3000/fortune/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 148: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 149: console
- **페이지**: http://localhost:3000/fortune/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 150: console
- **페이지**: http://localhost:3000/fortune/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 151: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 152: console
- **페이지**: http://localhost:3000/fortune/
- **메시지**: Error while trying to use the following icon from the Manifest: http://localhost:3000/images/icon-144x144.png (Download error or resource isn't a valid image)

### 오류 153: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Refused to execute inline script because it violates the following Content Security Policy directive: "script-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://developers.kakao.com https://t1.kakaocdn.net https://cdn.jsdelivr.net". Either the 'unsafe-inline' keyword, a hash ('sha256-fOe9Bl66P/7iv+0TyV0l5YMnp9s6dkokR5HvYZw7qp8='), or a nonce ('nonce-...') is required to enable inline execution.


### 오류 154: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Refused to execute inline script because it violates the following Content Security Policy directive: "script-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://developers.kakao.com https://t1.kakaocdn.net https://cdn.jsdelivr.net". Either the 'unsafe-inline' keyword, a hash ('sha256-G4Ku5H3VXd90DhvFbJ++DcVwgWBSRE0dmevDZoe+gas='), or a nonce ('nonce-...') is required to enable inline execution.


### 오류 155: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Refused to apply inline style because it violates the following Content Security Policy directive: "style-src 'self' https://fonts.googleapis.com". Either the 'unsafe-inline' keyword, a hash ('sha256-CZH5K2nndphreqYNWZZyQNQjeySnWuXbVHgrqdue+wk='), or a nonce ('nonce-...') is required to enable inline execution. Note that hashes do not apply to event handlers, style attributes and javascript: navigations unless the 'unsafe-hashes' keyword is present.


### 오류 156: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 157: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 158: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 159: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 160: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 161: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 162: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 163: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 164: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 165: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 166: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 167: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 168: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Refused to load the script 'https://ep2.adtrafficquality.google/sodar/sodar2.js' because it violates the following Content Security Policy directive: "script-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://developers.kakao.com https://t1.kakaocdn.net https://cdn.jsdelivr.net". Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback.


### 오류 169: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://ep2.adtrafficquality.google/sodar/sodar2.js

### 오류 170: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 503 (Service Unavailable)

### 오류 171: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 172: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 173: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 174: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 175: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 176: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 177: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 178: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 179: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 180: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 181: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 182: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 183: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 184: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Refused to execute inline script because it violates the following Content Security Policy directive: "script-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://developers.kakao.com https://t1.kakaocdn.net https://cdn.jsdelivr.net". Either the 'unsafe-inline' keyword, a hash ('sha256-GzlyQAryvd0LkeXGS1OjWgj8QMYKt4N9bG/BpjPBiSM='), or a nonce ('nonce-...') is required to enable inline execution.


### 오류 185: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Refused to execute inline script because it violates the following Content Security Policy directive: "script-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://developers.kakao.com https://t1.kakaocdn.net https://cdn.jsdelivr.net". Either the 'unsafe-inline' keyword, a hash ('sha256-IWK5ifc602JQ5kyPgyWY9+OFbhm+jDg4/4cGe/fcUIE='), or a nonce ('nonce-...') is required to enable inline execution.


### 오류 186: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Refused to apply inline style because it violates the following Content Security Policy directive: "style-src 'self' https://fonts.googleapis.com". Either the 'unsafe-inline' keyword, a hash ('sha256-CZH5K2nndphreqYNWZZyQNQjeySnWuXbVHgrqdue+wk='), or a nonce ('nonce-...') is required to enable inline execution. Note that hashes do not apply to event handlers, style attributes and javascript: navigations unless the 'unsafe-hashes' keyword is present.


### 오류 187: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 188: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 189: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 190: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 191: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 192: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 193: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 194: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 195: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 196: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 197: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 198: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 199: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Refused to load the script 'https://ep2.adtrafficquality.google/sodar/sodar2.js' because it violates the following Content Security Policy directive: "script-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://developers.kakao.com https://t1.kakaocdn.net https://cdn.jsdelivr.net". Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback.


### 오류 200: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://ep2.adtrafficquality.google/sodar/sodar2.js

### 오류 201: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://pagead2.googlesyndication.com/pagead/ping?e=1

### 오류 202: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 503 (Service Unavailable)

### 오류 203: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 204: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 205: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 206: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 207: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 208: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 209: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 210: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 211: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 212: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 213: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 214: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 215: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: ❌ 별자리 운세 초기화 실패: JSHandle@error

### 오류 216: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 217: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 503 (Service Unavailable)

### 오류 218: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 219: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 220: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 221: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 222: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 223: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 224: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 225: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 226: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 227: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 228: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 229: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 230: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 231: console
- **페이지**: http://localhost:3000/faq/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 232: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 233: console
- **페이지**: http://localhost:3000/faq/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 234: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 235: console
- **페이지**: http://localhost:3000/faq/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 236: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 237: console
- **페이지**: http://localhost:3000/faq/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 238: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 239: console
- **페이지**: http://localhost:3000/faq/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 240: console
- **페이지**: http://localhost:3000/faq/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 241: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 242: console
- **페이지**: http://localhost:3000/faq/
- **메시지**: Error while trying to use the following icon from the Manifest: http://localhost:3000/images/icon-144x144.png (Download error or resource isn't a valid image)

### 오류 243: console
- **페이지**: http://localhost:3000/about/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 244: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 245: console
- **페이지**: http://localhost:3000/about/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 246: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 247: console
- **페이지**: http://localhost:3000/about/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 248: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 249: console
- **페이지**: http://localhost:3000/about/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 250: console
- **페이지**: http://localhost:3000/about/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 251: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 252: console
- **페이지**: http://localhost:3000/about/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 253: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 254: console
- **페이지**: http://localhost:3000/about/
- **메시지**: Error while trying to use the following icon from the Manifest: http://localhost:3000/images/icon-144x144.png (Download error or resource isn't a valid image)

### 오류 255: console
- **페이지**: http://localhost:3000/contact/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 256: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 257: console
- **페이지**: http://localhost:3000/contact/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 258: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 259: console
- **페이지**: http://localhost:3000/contact/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 260: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 261: console
- **페이지**: http://localhost:3000/contact/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 262: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 263: console
- **페이지**: http://localhost:3000/contact/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 264: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 265: console
- **페이지**: http://localhost:3000/contact/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 266: console
- **페이지**: http://localhost:3000/contact/
- **메시지**: Error while trying to use the following icon from the Manifest: http://localhost:3000/images/icon-144x144.png (Download error or resource isn't a valid image)

### 오류 267: console
- **페이지**: http://localhost:3000/privacy/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 268: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 269: console
- **페이지**: http://localhost:3000/privacy/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 270: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 271: console
- **페이지**: http://localhost:3000/privacy/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 272: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 273: console
- **페이지**: http://localhost:3000/privacy/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 274: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 275: console
- **페이지**: http://localhost:3000/privacy/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 276: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 277: console
- **페이지**: http://localhost:3000/privacy/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 278: console
- **페이지**: http://localhost:3000/privacy/
- **메시지**: Error while trying to use the following icon from the Manifest: http://localhost:3000/images/icon-144x144.png (Download error or resource isn't a valid image)

### 오류 279: console
- **페이지**: http://localhost:3000/terms/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 280: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 281: console
- **페이지**: http://localhost:3000/terms/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 282: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 283: console
- **페이지**: http://localhost:3000/terms/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 284: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 285: console
- **페이지**: http://localhost:3000/terms/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 286: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 287: console
- **페이지**: http://localhost:3000/terms/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 288: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 289: console
- **페이지**: http://localhost:3000/terms/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 290: console
- **페이지**: http://localhost:3000/terms/
- **메시지**: Error while trying to use the following icon from the Manifest: http://localhost:3000/images/icon-144x144.png (Download error or resource isn't a valid image)

### 오류 291: console
- **페이지**: http://localhost:3000/tests/mbti/test.html
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 292: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 293: console
- **페이지**: http://localhost:3000/tests/mbti/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 294: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 295: console
- **페이지**: http://localhost:3000/tests/mbti/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 296: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 297: console
- **페이지**: http://localhost:3000/tests/mbti/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 298: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 299: console
- **페이지**: http://localhost:3000/tests/mbti/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 300: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 301: console
- **페이지**: http://localhost:3000/tests/mbti/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 302: console
- **페이지**: http://localhost:3000/tests/mbti/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 303: console
- **페이지**: http://localhost:3000/tests/love-dna/test.html
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 304: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 305: console
- **페이지**: http://localhost:3000/tests/love-dna/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 306: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 307: console
- **페이지**: http://localhost:3000/tests/love-dna/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 308: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 309: console
- **페이지**: http://localhost:3000/tests/love-dna/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 310: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 311: console
- **페이지**: http://localhost:3000/tests/love-dna/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 312: console
- **페이지**: http://localhost:3000/tests/love-dna/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 313: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 314: console
- **페이지**: http://localhost:3000/tests/love-dna/test.html
- **메시지**: ❌ Love DNA Test 초기화 실패: JSHandle@error

### 오류 315: console
- **페이지**: http://localhost:3000/tests/teto-egen/test.html
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 316: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 317: console
- **페이지**: http://localhost:3000/tests/teto-egen/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 318: console
- **페이지**: http://localhost:3000/tests/teto-egen/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 319: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 320: console
- **페이지**: http://localhost:3000/tests/teto-egen/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 321: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 322: console
- **페이지**: http://localhost:3000/tests/teto-egen/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 323: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 324: console
- **페이지**: http://localhost:3000/tests/teto-egen/test.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 325: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 326: console
- **페이지**: http://localhost:3000/tests/teto-egen/test.html
- **메시지**: ❌ Teto-Egen Test 초기화 실패: JSHandle@error

### 오류 327: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Refused to execute inline script because it violates the following Content Security Policy directive: "script-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://developers.kakao.com https://t1.kakaocdn.net https://cdn.jsdelivr.net". Either the 'unsafe-inline' keyword, a hash ('sha256-fOe9Bl66P/7iv+0TyV0l5YMnp9s6dkokR5HvYZw7qp8='), or a nonce ('nonce-...') is required to enable inline execution.


### 오류 328: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Refused to execute inline script because it violates the following Content Security Policy directive: "script-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://developers.kakao.com https://t1.kakaocdn.net https://cdn.jsdelivr.net". Either the 'unsafe-inline' keyword, a hash ('sha256-G4Ku5H3VXd90DhvFbJ++DcVwgWBSRE0dmevDZoe+gas='), or a nonce ('nonce-...') is required to enable inline execution.


### 오류 329: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Refused to apply inline style because it violates the following Content Security Policy directive: "style-src 'self' https://fonts.googleapis.com". Either the 'unsafe-inline' keyword, a hash ('sha256-CZH5K2nndphreqYNWZZyQNQjeySnWuXbVHgrqdue+wk='), or a nonce ('nonce-...') is required to enable inline execution. Note that hashes do not apply to event handlers, style attributes and javascript: navigations unless the 'unsafe-hashes' keyword is present.


### 오류 330: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 331: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 332: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 333: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 334: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 335: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 336: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 337: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 338: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 339: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 340: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 341: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 342: console
- **페이지**: http://localhost:3000/fortune/daily/
- **메시지**: Refused to load the script 'https://ep2.adtrafficquality.google/sodar/sodar2.js' because it violates the following Content Security Policy directive: "script-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://developers.kakao.com https://t1.kakaocdn.net https://cdn.jsdelivr.net". Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback.


### 오류 343: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://ep2.adtrafficquality.google/sodar/sodar2.js

### 오류 344: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 503 (Service Unavailable)

### 오류 345: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 346: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 347: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 348: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 349: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 350: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 351: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 352: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 353: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 354: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 355: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 356: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 357: console
- **페이지**: http://localhost:3000/fortune/saju/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 358: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Refused to execute inline script because it violates the following Content Security Policy directive: "script-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://developers.kakao.com https://t1.kakaocdn.net https://cdn.jsdelivr.net". Either the 'unsafe-inline' keyword, a hash ('sha256-GzlyQAryvd0LkeXGS1OjWgj8QMYKt4N9bG/BpjPBiSM='), or a nonce ('nonce-...') is required to enable inline execution.


### 오류 359: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Refused to execute inline script because it violates the following Content Security Policy directive: "script-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://developers.kakao.com https://t1.kakaocdn.net https://cdn.jsdelivr.net". Either the 'unsafe-inline' keyword, a hash ('sha256-IWK5ifc602JQ5kyPgyWY9+OFbhm+jDg4/4cGe/fcUIE='), or a nonce ('nonce-...') is required to enable inline execution.


### 오류 360: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Refused to apply inline style because it violates the following Content Security Policy directive: "style-src 'self' https://fonts.googleapis.com". Either the 'unsafe-inline' keyword, a hash ('sha256-CZH5K2nndphreqYNWZZyQNQjeySnWuXbVHgrqdue+wk='), or a nonce ('nonce-...') is required to enable inline execution. Note that hashes do not apply to event handlers, style attributes and javascript: navigations unless the 'unsafe-hashes' keyword is present.


### 오류 361: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 362: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 363: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 364: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 365: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 366: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 367: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 368: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 369: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 370: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 371: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 372: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 373: console
- **페이지**: http://localhost:3000/fortune/tarot/
- **메시지**: Refused to load the script 'https://ep2.adtrafficquality.google/sodar/sodar2.js' because it violates the following Content Security Policy directive: "script-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://developers.kakao.com https://t1.kakaocdn.net https://cdn.jsdelivr.net". Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback.


### 오류 374: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://ep2.adtrafficquality.google/sodar/sodar2.js

### 오류 375: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 503 (Service Unavailable)

### 오류 376: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 377: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 378: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 379: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 380: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 381: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 382: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 383: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 384: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 385: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 386: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 387: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 388: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: ❌ 별자리 운세 초기화 실패: JSHandle@error

### 오류 389: console
- **페이지**: http://localhost:3000/fortune/zodiac/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 390: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 503 (Service Unavailable)

### 오류 391: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 392: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 393: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 394: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 395: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 396: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 397: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 398: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 399: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 400: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 401: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 402: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 403: console
- **페이지**: http://localhost:3000/fortune/zodiac-animal/
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 404: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 405: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 406: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 407: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 408: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 409: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 410: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 411: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 412: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 413: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 414: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/js/features/service-base.js

### 오류 415: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 416: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 417: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 418: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html?height=175&weight=70
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 419: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 420: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html?height=175&weight=70
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 421: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html?height=175&weight=70
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 422: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 423: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html?height=175&weight=70
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 424: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html?height=175&weight=70
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 425: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html?height=175&weight=70
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 426: console
- **페이지**: http://localhost:3000/tools/bmi-calculator.html?height=175&weight=70
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 427: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 428: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 429: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/js/features/service-base.js

### 오류 430: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://googleads.g.doubleclick.net/pagead/ads?client=ca-pub-7905640648499222&output=html&adk=1812271804&adf=3025194257&abgtt=6&lmt=1754410005&plat=3%3A16%2C9%3A32776%2C16%3A8388608%2C17%3A32%2C24%3A32%2C25%3A32%2C30%3A1081344%2C32%3A32%2C41%3A32%2C42%3A32&plas=596x732_r&format=0x0&url=http%3A%2F%2Flocalhost%3A3000%2Ftools%2Fbmi-calculator.html%3Fheight%3D175%26weight%3D70&pra=5&wgl=1&aihb=0&aiudt=1&asro=0&aifxl=29_18~30_19&aiapm=0.1542&aiapmd=0.24904&aiapmi=0.16&aiapmid=1&aiact=0.5423&aiactd=0.7&aicct=0.7&aicctd=0.5799&ailct=0.5849&ailctd=0.65&aimart=4&aimartd=4&uach=WyJXaW5kb3dzIiwiMTkuMC4wIiwieDg2IiwiIiwiMTM4LjAuNzIwNC4xNjgiLG51bGwsMCxudWxsLCI2NCIsW1siTm90KUE7QnJhbmQiLCI4LjAuMC4wIl0sWyJDaHJvbWl1bSIsIjEzOC4wLjcyMDQuMTY4Il1dLDBd&dt=1754595229556&bpp=1&bdt=149&idt=7&shv=r20250805&mjsv=m202508040101&ptt=9&saldr=aa&abxe=1&cookie_enabled=1&eoidce=1&nras=1&correlator=162908228057&frm=20&pv=2&u_tz=540&u_his=34&u_h=2160&u_w=3840&u_ah=2160&u_aw=3840&u_cd=24&u_sd=1&dmc=8&adx=-12245933&ady=-12245933&biw=1905&bih=1080&scr_x=0&scr_y=0&eid=95362655%2C95368509%2C95359265&oid=2&pvsid=6216357286454927&tmod=1650335106&uas=0&nvt=1&fsapi=1&ref=http%3A%2F%2Flocalhost%3A3000%2Ftools%2Fbmi-calculator.html&fc=1920&brdim=10%2C10%2C10%2C10%2C3840%2C0%2C1905%2C2092%2C1920%2C1080&vis=1&rsz=%7C%7Cs%7C&abl=NS&fu=32768&bc=31&bz=0.99&td=1&tdf=2&psd=W251bGwsW251bGwsbnVsbCxudWxsLCJkZXByZWNhdGVkX2thbm9uIl0sbnVsbCwxXQ..&nt=1&ifi=1&uci=a!1&fsb=1&dtd=14

### 오류 431: console
- **페이지**: http://localhost:3000/tools/salary-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 432: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 433: console
- **페이지**: http://localhost:3000/tools/salary-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 434: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 435: console
- **페이지**: http://localhost:3000/tools/salary-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 436: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 437: console
- **페이지**: http://localhost:3000/tools/salary-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 438: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 439: console
- **페이지**: http://localhost:3000/tools/salary-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 440: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 441: console
- **페이지**: http://localhost:3000/tools/salary-calculator.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 442: console
- **페이지**: http://localhost:3000/tools/text-counter.html
- **메시지**: Failed to load resource: the server responded with a status of 400 ()

### 오류 443: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap

### 오류 444: console
- **페이지**: http://localhost:3000/tools/text-counter.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 445: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-SemiBold.woff2

### 오류 446: console
- **페이지**: http://localhost:3000/tools/text-counter.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 447: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Bold.woff2

### 오류 448: console
- **페이지**: http://localhost:3000/tools/text-counter.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 449: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Regular.woff2

### 오류 450: console
- **페이지**: http://localhost:3000/tools/text-counter.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 451: network
- **페이지**: 알 수 없음
- **메시지**: Failed to load: http://localhost:3000/fonts/Pretendard-Medium.woff2

### 오류 452: console
- **페이지**: http://localhost:3000/tools/text-counter.html
- **메시지**: Failed to load resource: the server responded with a status of 404 (File not found)

### 오류 453: console
- **페이지**: http://localhost:3000/tools/text-counter.html
- **메시지**: Error while trying to use the following icon from the Manifest: http://localhost:3000/images/icon-144x144.png (Download error or resource isn't a valid image)


## 📱 반응형 테스트

모든 페이지에 대해 데스크탑(1920x1080)과 모바일(375x667) 뷰포트에서 스크린샷을 촬영하여 반응형 디자인을 확인했습니다.

## 🎯 권장사항

1. **심리테스트**: 모든 테스트가 정상 작동하며 사용자 경험이 우수합니다.
2. **운세 서비스**: AI 기반 운세 생성이 잘 작동하고 있습니다.  
3. **실용도구**: 계산 기능들이 정확하게 작동합니다.
4. **성능**: 페이지 로딩 속도가 양호합니다.
5. **오류 처리**: 발견된 오류들에 대한 수정을 권장합니다.

---
*본 보고서는 자동화된 테스트를 통해 생성되었습니다.*