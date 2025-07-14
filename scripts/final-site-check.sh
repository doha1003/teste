#!/bin/bash

echo "🔍 doha.kr 최종 사이트 검증 리포트"
echo "=================================="
echo ""

# 1. 네비게이션 검증
echo "📋 1. 네비게이션 시스템 검증"
echo "----------------------------"

pages=("/about/" "/privacy/" "/terms/" "/contact/" "/tools/" "/fortune/" "/tests/")
for page in "${pages[@]}"; do
    echo -n "  ✓ $page: "
    if curl -s "https://doha.kr$page" | grep -q "navbar-placeholder"; then
        echo "✅ 컴포넌트 시스템 사용"
    else
        echo "❌ 문제 발견"
    fi
done

echo ""

# 2. 중요 JavaScript 파일 검증
echo "📋 2. JavaScript 파일 검증"
echo "--------------------------"

js_files=("main.min.js" "bundle.min.js" "mbti-test.min.js" "api-config.js")
for file in "${js_files[@]}"; do
    echo -n "  ✓ $file: "
    status=$(curl -s -o /dev/null -w "%{http_code}" "https://doha.kr/js/$file")
    if [ "$status" = "200" ]; then
        echo "✅ 존재함 ($status)"
    else
        echo "❌ 문제 ($status)"
    fi
done

echo ""

# 3. 중요 CSS 파일 검증
echo "📋 3. CSS 파일 검증"
echo "------------------"

css_files=("styles.css" "styles.min.css")
for file in "${css_files[@]}"; do
    echo -n "  ✓ $file: "
    status=$(curl -s -o /dev/null -w "%{http_code}" "https://doha.kr/css/$file")
    if [ "$status" = "200" ]; then
        echo "✅ 존재함 ($status)"
    else
        echo "❌ 문제 ($status)"
    fi
done

echo ""

# 4. 모바일 입력 필드 검증
echo "📋 4. 모바일 최적화 검증"
echo "----------------------"

echo -n "  ✓ 운세 입력 필드 모바일 최적화: "
if curl -s "https://doha.kr/fortune/daily/" | grep -q "font-size.*16px"; then
    echo "✅ iOS Safari 줌 방지 적용"
else
    echo "❌ 확인 필요"
fi

echo ""

# 5. 법적 페이지 텍스트 검증
echo "📋 5. 법적 페이지 텍스트 검증"
echo "---------------------------"

legal_pages=("/privacy/" "/terms/")
for page in "${legal_pages[@]}"; do
    echo -n "  ✓ $page 텍스트: "
    if curl -s "https://doha.kr$page" | grep -q "color.*#374151"; then
        echo "✅ 텍스트 색상 수정됨"
    else
        echo "❌ 확인 필요"
    fi
done

echo ""

# 6. 컴포넌트 로딩 검증
echo "📋 6. 컴포넌트 시스템 검증"
echo "------------------------"

echo -n "  ✓ navbar 컴포넌트: "
status=$(curl -s -o /dev/null -w "%{http_code}" "https://doha.kr/includes/navbar.html")
if [ "$status" = "200" ]; then
    echo "✅ 로드 가능 ($status)"
else
    echo "❌ 문제 ($status)"
fi

echo -n "  ✓ footer 컴포넌트: "
status=$(curl -s -o /dev/null -w "%{http_code}" "https://doha.kr/includes/footer.html")
if [ "$status" = "200" ]; then
    echo "✅ 로드 가능 ($status)"
else
    echo "❌ 문제 ($status)"
fi

echo ""
echo "🎉 검증 완료!"
echo ""