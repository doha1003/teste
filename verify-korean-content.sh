#\!/bin/bash

# 한국어 콘텐츠 품질 자동 검증 스크립트
echo "=== 한국어 콘텐츠 품질 검증 시작 ==="

# 1. 모든 질문 파일 추출 및 분석
echo "[Step 1] 심리테스트 질문 파일 수집..."
find js -name "*questions.js" -type f > question-files.txt

# 2. Gemini CLI로 언어적 일관성 검사
echo "[Step 2] 언어적 일관성 검사..."
cat js/mbti-questions.js js/teto-egen-questions.js js/love-dna-questions.js | gemini --prompt "다음 한국어 텍스트를 분석하여 검사해주세요:
1. 존댓말 일관성 (해요체/습니다체 혼용 여부)
2. 문법 오류나 맞춤법 오류
3. 어색한 번역투 표현
4. 각 문제점에 대한 구체적인 위치와 수정 제안을 제시해주세요." > korean-consistency-report.txt

# 3. 문화적 민감성 검사
echo "[Step 3] 문화적 민감성 검사..."
echo "
검사 항목:
- 성별 고정관념이나 차별적 표현
- 연령 차별적 표현  
- 외모나 신체에 대한 부적절한 언급
- 특정 직업이나 계층에 대한 편견
- 한국 문화에 부적합한 서구적 표현
" | cat - js/*questions.js | gemini --prompt "위 검사 항목을 기준으로 한국 문화에서 문제가 될 수 있는 표현을 찾아주세요." > cultural-sensitivity-report.txt

# 4. 테스트별 톤 일관성 검사
echo "[Step 4] 테스트별 톤 일관성 검사..."
for file in js/mbti-questions.js js/teto-egen-questions.js js/love-dna-questions.js; do
  echo "Checking $file..."
  cat $file | gemini --prompt "이 파일 내의 모든 질문과 답변 선택지의 어조가 일관되는지 검사하고, 불일치하는 부분을 찾아주세요. 예: 반말/존댓말 혼용, 문체 불일치 등" >> tone-consistency-report.txt
done

# 5. 종합 보고서 생성
echo "[Step 5] 종합 보고서 생성..."
echo "한국어 콘텐츠 품질 검증 종합 보고서" > final-korean-content-report.md
echo "=================================" >> final-korean-content-report.md
echo "" >> final-korean-content-report.md
echo "## 1. 언어적 일관성" >> final-korean-content-report.md
cat korean-consistency-report.txt >> final-korean-content-report.md
echo "" >> final-korean-content-report.md
echo "## 2. 문화적 민감성" >> final-korean-content-report.md
cat cultural-sensitivity-report.txt >> final-korean-content-report.md
echo "" >> final-korean-content-report.md
echo "## 3. 톤 일관성" >> final-korean-content-report.md
cat tone-consistency-report.txt >> final-korean-content-report.md

echo "=== 검증 완료\! final-korean-content-report.md 파일을 확인하세요. ==="
