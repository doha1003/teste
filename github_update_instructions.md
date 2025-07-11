# GitHub 파일 업데이트 지침

doha1003/teste 레포지토리의 tools 디렉토리 파일들과 vercel.json을 업데이트하기 위한 지침입니다.

## 업데이트가 필요한 파일들

1. **vercel.json** - CSP 헤더 및 보안 설정 추가
2. **tools/text-counter.html** - DOMPurify, 보안, SEO, 접근성 개선
3. **tools/bmi-calculator.html** - DOMPurify, 보안, SEO, 접근성 개선
4. **tools/salary-calculator.html** - DOMPurify, 보안, SEO, 접근성 개선
5. **tools/index.html** - SEO, 구조화된 데이터, 접근성 개선

## 업데이트된 주요 내용

### 1. 보안 강화
- ✅ DOMPurify 라이브러리 추가 (모든 도구 페이지)
- ✅ 입력값 검증 및 sanitization 함수 구현
- ✅ CSP 헤더 설정 (vercel.json)
- ✅ XSS, clickjacking 방지 헤더 추가

### 2. SEO 최적화
- ✅ 상세한 메타 태그 (description, keywords, author)
- ✅ Open Graph 태그
- ✅ Twitter Card 태그
- ✅ canonical URL
- ✅ Schema.org 구조화된 데이터

### 3. 접근성 개선
- ✅ ARIA 레이블 추가 (모든 입력 필드)
- ✅ 의미있는 alt 텍스트
- ✅ 키보드 네비게이션 지원

### 4. 광고 라벨
- ✅ 모든 광고 영역에 "광고" 라벨 추가
- ✅ 명확한 시각적 구분

## 파일 위치

업데이트된 파일들은 다음 위치에 있습니다:
- /tmp/vercel.json
- /tmp/text-counter.html
- /tmp/bmi-calculator.html
- /tmp/salary-calculator.html
- /tmp/tools-index.html

## GitHub에 업데이트하는 방법

### 방법 1: GitHub 웹 인터페이스 사용
1. https://github.com/doha1003/teste 접속
2. 각 파일로 이동하여 "Edit" 버튼 클릭
3. 위 경로의 파일 내용을 복사하여 붙여넣기
4. 커밋 메시지 작성 후 저장

### 방법 2: Git 명령어 사용
```bash
# 레포지토리 클론
git clone https://github.com/doha1003/teste.git
cd teste

# 파일 복사
cp /tmp/vercel.json ./vercel.json
cp /tmp/text-counter.html ./tools/text-counter.html
cp /tmp/bmi-calculator.html ./tools/bmi-calculator.html
cp /tmp/salary-calculator.html ./tools/salary-calculator.html
cp /tmp/tools-index.html ./tools/index.html

# 커밋 및 푸시
git add .
git commit -m "Add security enhancements, SEO optimization, and accessibility improvements to tools"
git push origin main
```

### 방법 3: GitHub API 사용 (토큰 필요)
GitHub Personal Access Token이 있다면 API를 통해 직접 업데이트할 수 있습니다.

## 검증 체크리스트

업데이트 후 다음 사항을 확인하세요:
- [ ] 모든 도구 페이지가 정상 작동하는지 확인
- [ ] DOMPurify가 제대로 로드되는지 확인
- [ ] 입력값 검증이 작동하는지 테스트
- [ ] 광고 라벨이 표시되는지 확인
- [ ] 모바일에서도 정상 작동하는지 확인
- [ ] CSP 헤더가 적용되었는지 확인 (개발자 도구 > Network > Headers)