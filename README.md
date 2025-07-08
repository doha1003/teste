# doha.kr - 일상을 더 재미있게 만드는 공간

## 프로젝트 설정

### Vercel 배포 설정

1. [Vercel](https://vercel.com)에 GitHub 계정으로 로그인
2. New Project → Import Git Repository → doha1003/teste 선택
3. Environment Variables 설정:
   - `GEMINI_API_KEY`: Google Gemini API 키 입력
4. Deploy 클릭

### 환경 변수 설정 방법

1. Vercel 대시보드 → Settings → Environment Variables
2. 다음 환경 변수 추가:
   ```
   GEMINI_API_KEY=your-actual-gemini-api-key-here
   ```
3. 모든 환경(Production, Preview, Development)에 적용
4. 재배포 실행

### Google Gemini API 키 발급

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 방문
2. "Create API Key" 클릭
3. 발급된 API 키를 Vercel 환경 변수에 설정

## 기능

- 심리테스트 (MBTI, 테토-에겐, Love DNA)
- 실용도구 (글자수 세기, BMI 계산기)
- AI 운세 (일일운세, 사주, 타로)

## 기술 스택

- Frontend: HTML, CSS, JavaScript
- AI: Google Gemini API
- Hosting: Vercel (서버리스 함수 포함)
- Analytics: Google AdSense

## 로컬 개발

```bash
npm install
vercel dev
```

## 라이선스

© 2025 doha.kr. All rights reserved.