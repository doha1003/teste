#!/bin/bash
# doha.kr 일일 품질 검증 스크립트
# Gemini CLI를 활용한 자동화 검증

echo "======================================="
echo "   doha.kr 일일 품질 검증 시작"
echo "   $(date '+%Y-%m-%d %H:%M:%S')"
echo "======================================="

# 결과 저장 디렉토리 생성
REPORT_DIR="daily-reports/$(date '+%Y%m%d')"
mkdir -p $REPORT_DIR

# 1. 코드 품질 검사
echo ""
echo "[1/5] 코드 품질 검사 실행중..."
echo "-------------------------------"
npm run lint 2>&1 | tee $REPORT_DIR/lint-report.txt
LINT_EXIT_CODE=${PIPESTATUS[0]}

if [ $LINT_EXIT_CODE -eq 0 ]; then
    echo "✅ ESLint 검사 통과"
else
    echo "⚠️ ESLint 오류 발견 - 자동 수정 시도중..."
    npm run lint:fix
fi

# 2. 코드 포맷팅 검사
echo ""
echo "[2/5] 코드 포맷팅 검사..."
echo "-------------------------------"
npm run format:check 2>&1 | tee $REPORT_DIR/format-report.txt
FORMAT_EXIT_CODE=${PIPESTATUS[0]}

if [ $FORMAT_EXIT_CODE -ne 0 ]; then
    echo "⚠️ 포맷팅 이슈 발견 - 자동 수정 중..."
    npm run format
fi

# 3. 테스트 실행
echo ""
echo "[3/5] 테스트 스위트 실행..."
echo "-------------------------------"
npm run test 2>&1 | tee $REPORT_DIR/test-report.txt
TEST_EXIT_CODE=${PIPESTATUS[0]}

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ 모든 테스트 통과"
else
    echo "❌ 테스트 실패 - 자세한 내용은 $REPORT_DIR/test-report.txt 확인"
fi

# 4. 빌드 검증
echo ""
echo "[4/5] 프로덕션 빌드 검증..."
echo "-------------------------------"
npm run build 2>&1 | tee $REPORT_DIR/build-report.txt
BUILD_EXIT_CODE=${PIPESTATUS[0]}

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ 빌드 성공"
else
    echo "❌ 빌드 실패 - $REPORT_DIR/build-report.txt 확인"
fi

# 5. 26페이지 오류 검증
echo ""
echo "[5/5] 26개 페이지 오류 검증..."
echo "-------------------------------"
if [ -f "comprehensive-26-page-validator.js" ]; then
    node comprehensive-26-page-validator.js 2>&1 | tee $REPORT_DIR/26pages-report.txt
else
    echo "⚠️ 26페이지 검증 스크립트가 없습니다."
fi

# 결과 요약 생성
echo ""
echo "======================================="
echo "        검증 결과 요약"
echo "======================================="
echo "날짜: $(date '+%Y-%m-%d %H:%M:%S')" > $REPORT_DIR/summary.txt
echo "" >> $REPORT_DIR/summary.txt
echo "검사 결과:" >> $REPORT_DIR/summary.txt
echo "- Lint: $([ $LINT_EXIT_CODE -eq 0 ] && echo '✅ 통과' || echo '❌ 실패')" >> $REPORT_DIR/summary.txt
echo "- Format: $([ $FORMAT_EXIT_CODE -eq 0 ] && echo '✅ 통과' || echo '⚠️ 수정필요')" >> $REPORT_DIR/summary.txt
echo "- Tests: $([ $TEST_EXIT_CODE -eq 0 ] && echo '✅ 통과' || echo '❌ 실패')" >> $REPORT_DIR/summary.txt
echo "- Build: $([ $BUILD_EXIT_CODE -eq 0 ] && echo '✅ 성공' || echo '❌ 실패')" >> $REPORT_DIR/summary.txt

cat $REPORT_DIR/summary.txt

# Gemini CLI로 결과 분석 (선택적)
if command -v gemini &> /dev/null; then
    echo ""
    echo "Gemini CLI로 결과 분석 중..."
    cat $REPORT_DIR/summary.txt | gemini --prompt "이 검증 결과를 분석하고 우선적으로 해결해야 할 문제를 3가지 제시해주세요."
fi

echo ""
echo "📁 상세 보고서 위치: $REPORT_DIR/"
echo "======================================="