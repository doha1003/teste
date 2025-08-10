#!/bin/bash
# API 상태 모니터링 스크립트

echo "======================================="
echo "    API 상태 모니터링"
echo "    $(date '+%Y-%m-%d %H:%M:%S')"
echo "======================================="

# 환경 설정
if [ "$1" == "production" ]; then
    BASE_URL="https://doha.kr"
    echo "🌍 프로덕션 환경 테스트"
else
    BASE_URL="http://localhost:3000"
    echo "🏠 로컬 환경 테스트"
fi

# API 엔드포인트 목록
declare -a endpoints=(
    "/api/health"
    "/api/fortune"
    "/api/manseryeok"
)

# 결과 저장
REPORT=""
SUCCESS_COUNT=0
FAIL_COUNT=0

echo ""
echo "API 엔드포인트 상태 확인:"
echo "-----------------------"

# 각 엔드포인트 테스트
for endpoint in "${endpoints[@]}"; do
    echo -n "Testing $endpoint... "
    
    if [[ "$endpoint" == "/api/health" ]]; then
        # GET 요청
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint" 2>/dev/null)
    elif [[ "$endpoint" == "/api/fortune" ]]; then
        # POST 요청 - fortune API
        response=$(curl -s -o /dev/null -w "%{http_code}" \
            -X POST \
            -H "Content-Type: application/json" \
            -d '{"type":"daily","data":{"name":"테스트","birthDate":"1990-01-01","gender":"male"}}' \
            "$BASE_URL$endpoint" 2>/dev/null)
    elif [[ "$endpoint" == "/api/manseryeok" ]]; then
        # GET 요청 - manseryeok API
        response=$(curl -s -o /dev/null -w "%{http_code}" \
            "$BASE_URL$endpoint?year=2024&month=8&day=11&hour=12" 2>/dev/null)
    fi
    
    # 상태 코드 확인
    if [ "$response" == "200" ]; then
        echo "✅ OK (HTTP $response)"
        REPORT="$REPORT\n$endpoint: ✅ 정상 (HTTP $response)"
        ((SUCCESS_COUNT++))
    elif [ "$response" == "404" ]; then
        echo "❌ NOT FOUND (HTTP $response)"
        REPORT="$REPORT\n$endpoint: ❌ 찾을 수 없음 (HTTP $response)"
        ((FAIL_COUNT++))
    elif [ "$response" == "500" ] || [ "$response" == "502" ] || [ "$response" == "503" ]; then
        echo "🔥 SERVER ERROR (HTTP $response)"
        REPORT="$REPORT\n$endpoint: 🔥 서버 오류 (HTTP $response)"
        ((FAIL_COUNT++))
    elif [ "$response" == "429" ]; then
        echo "⚠️ RATE LIMITED (HTTP $response)"
        REPORT="$REPORT\n$endpoint: ⚠️ 요청 제한 (HTTP $response)"
        ((FAIL_COUNT++))
    else
        echo "⚠️ UNEXPECTED (HTTP $response)"
        REPORT="$REPORT\n$endpoint: ⚠️ 예상치 못한 응답 (HTTP $response)"
        ((FAIL_COUNT++))
    fi
done

# 성능 테스트 (fortune API)
echo ""
echo "성능 테스트 (Fortune API):"
echo "-----------------------"
TOTAL_TIME=0
TEST_COUNT=3

for i in $(seq 1 $TEST_COUNT); do
    echo -n "Test $i: "
    TIME_START=$(date +%s%N)
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"type":"daily","data":{"name":"테스트","birthDate":"1990-01-01","gender":"male"}}' \
        "$BASE_URL/api/fortune" 2>/dev/null)
    
    TIME_END=$(date +%s%N)
    TIME_DIFF=$((($TIME_END - $TIME_START) / 1000000))
    TOTAL_TIME=$(($TOTAL_TIME + $TIME_DIFF))
    
    echo "${TIME_DIFF}ms"
done

AVG_TIME=$(($TOTAL_TIME / $TEST_COUNT))
echo "평균 응답 시간: ${AVG_TIME}ms"

# 결과 요약
echo ""
echo "======================================="
echo "        테스트 결과 요약"
echo "======================================="
echo -e "$REPORT"
echo ""
echo "총 ${#endpoints[@]}개 엔드포인트 중:"
echo "✅ 성공: $SUCCESS_COUNT"
echo "❌ 실패: $FAIL_COUNT"
echo ""
echo "Fortune API 평균 응답 시간: ${AVG_TIME}ms"

# 상태 판정
if [ $FAIL_COUNT -eq 0 ]; then
    echo ""
    echo "🎉 모든 API가 정상 작동 중입니다!"
    exit 0
else
    echo ""
    echo "⚠️ 일부 API에 문제가 있습니다. 확인이 필요합니다."
    
    # Gemini CLI로 분석 (선택적)
    if command -v gemini &> /dev/null; then
        echo ""
        echo "Gemini CLI로 문제 분석 중..."
        echo -e "$REPORT" | gemini --prompt "이 API 상태를 분석하고 문제 해결 방법을 제시해주세요."
    fi
    
    exit 1
fi