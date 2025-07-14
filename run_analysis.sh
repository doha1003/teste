#!/bin/bash

echo "🎯 doha.kr 웹사이트 분석 및 개선 파이프라인 시작"
echo "=================================================="

# 환경변수 확인
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY 환경변수가 설정되지 않았습니다."
    echo "💡 다음 명령으로 API 키를 설정하세요:"
    echo "   export OPENAI_API_KEY=your_api_key_here"
    echo ""
    echo "🔍 구조 기반 분석만 진행할까요? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "📊 구조 기반 분석 진행..."
        python3 analyze_without_image.py
        exit $?
    else
        exit 1
    fi
fi

# 1단계: 의존성 설치
echo "📦 1단계: 의존성 설치 중..."
npm install

# 2단계: 웹사이트 캡처
echo "📸 2단계: 웹사이트 스크린샷 캡처 중..."
node capture.js

# 3단계: 캡처 결과 확인
if [ ! -f "screenshot.png" ]; then
    echo "❌ 스크린샷 캡처 실패"
    exit 1
fi

echo "✅ 스크린샷 캡처 완료: screenshot.png"

# 4단계: OpenAI 라이브러리 설치 (Python)
echo "🐍 4단계: Python 의존성 확인 중..."
pip3 install openai --quiet

# 5단계: GPT-4o Vision API 분석
echo "🤖 5단계: GPT-4o Vision API 분석 중..."
python3 analyze_image.py

# 6단계: 구조 기반 분석
echo "📊 6단계: 구조 기반 개선 방안 생성 중..."
python3 analyze_without_image.py

# 7단계: 분석 결과 확인
echo ""
echo "🎉 분석 파이프라인 완료!"
echo "=========================="

if [ -f "analysis_result.txt" ]; then
    echo "✅ GPT-4o Vision 분석 결과: analysis_result.txt"
fi

if [ -f "improvement_plan.txt" ]; then
    echo "✅ 구조 기반 개선 방안: improvement_plan.txt"
fi

if [ -f "IMPROVEMENT_PLAN.md" ]; then
    echo "✅ 상세 개선 계획서: IMPROVEMENT_PLAN.md"
fi

echo ""
echo "📋 다음 단계:"
echo "1. 분석 결과 파일들을 확인하세요"
echo "2. ClaudeCode CLI에 개선 지시사항을 전달하세요"
echo "3. 우선순위에 따라 개선 작업을 진행하세요"