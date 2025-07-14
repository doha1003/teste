#!/usr/bin/env python3
import base64
import json
import os
import sys
from openai import OpenAI

def encode_image(image_path):
    """이미지를 base64로 인코딩"""
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except FileNotFoundError:
        print(f"❌ 이미지 파일을 찾을 수 없습니다: {image_path}")
        sys.exit(1)

def analyze_website_screenshot(api_key, image_path="screenshot.png"):
    """GPT-4o Vision API로 웹사이트 스크린샷 분석"""
    
    # OpenAI 클라이언트 초기화
    client = OpenAI(api_key=api_key)
    
    # 이미지 인코딩
    print("🔍 이미지 인코딩 중...")
    base64_image = encode_image(image_path)
    
    print("🤖 GPT-4o Vision API 분석 시작...")
    
    try:
        response = client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """
이 웹사이트 스크린샷을 분석하고 다음 관점에서 개선점을 제안해주세요:

1. 🎨 **디자인 & UI/UX**:
   - 레이아웃, 색상, 타이포그래피
   - 버튼, 카드, 네비게이션 요소
   - 반응형 디자인 고려사항

2. 🚀 **성능 & 접근성**:
   - 로딩 속도에 영향을 주는 요소
   - 접근성 개선점
   - 모바일 친화성

3. 📱 **사용자 경험**:
   - 사용자 흐름의 문제점
   - 클릭/터치하기 어려운 요소
   - 정보 구조의 개선점

4. 🔧 **기술적 개선**:
   - CSS/HTML 구조 개선
   - JavaScript 최적화 제안
   - SEO 관련 개선점

분석 결과를 ClaudeCode CLI에 전달할 수 있는 구체적인 개선 지시사항으로 정리해주세요.
                            """
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64_image}",
                                "detail": "high"
                            }
                        }
                    ]
                }
            ],
            max_tokens=2000,
            temperature=0.1
        )
        
        analysis = response.choices[0].message.content
        
        print("=" * 60)
        print("🎯 GPT-4o Vision 분석 결과")
        print("=" * 60)
        print(analysis)
        print("=" * 60)
        
        # 분석 결과를 파일로 저장
        with open('analysis_result.txt', 'w', encoding='utf-8') as f:
            f.write(analysis)
        
        print("💾 분석 결과가 analysis_result.txt에 저장되었습니다.")
        
        return analysis
        
    except Exception as e:
        print(f"❌ API 요청 실패: {e}")
        return None

def main():
    # OpenAI API 키 (환경변수에서 가져오기)
    api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        print("❌ OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
        print("💡 다음 명령으로 API 키를 설정하세요:")
        print("   export OPENAI_API_KEY=your_api_key_here")
        sys.exit(1)
    
    # 스크린샷 파일 확인
    if not os.path.exists("screenshot.png"):
        print("❌ screenshot.png 파일이 없습니다. 먼저 capture.js를 실행하세요.")
        print("💡 실행 방법: node capture.js")
        sys.exit(1)
    
    # 분석 실행
    analysis = analyze_website_screenshot(api_key)
    
    if analysis:
        print("\n✅ 분석 완료! ClaudeCode CLI에 결과를 전달할 수 있습니다.")
        print("\n📋 다음 단계:")
        print("1. analysis_result.txt 파일 내용 확인")
        print("2. ClaudeCode CLI에 개선 지시사항 전달")
        print("3. 단계별 개선 작업 진행")
    else:
        print("❌ 분석 실패")
        sys.exit(1)

if __name__ == "__main__":
    main()