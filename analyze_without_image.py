#!/usr/bin/env python3
import json
import sys
import os
from openai import OpenAI

def analyze_website_structure():
    """doha.kr 웹사이트 구조 분석 (이미지 없이)"""
    
    # OpenAI 클라이언트 초기화 (환경변수에서 API 키 가져오기)
    api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        print("❌ OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
        print("💡 다음 명령으로 API 키를 설정하세요:")
        print("   export OPENAI_API_KEY=your_api_key_here")
        return None
        
    client = OpenAI(api_key=api_key)
    
    # doha.kr 웹사이트 정보
    website_info = """
    웹사이트: https://doha.kr
    
    현재 구조:
    - 메인 페이지: 심리테스트, AI 운세, 실용도구 3개 섹션
    - 심리테스트: MBTI, 테토-에겐, Love DNA (3종)
    - AI 운세: 일일운세, 사주팔자, 타로, 별자리, 띠별 (5종)
    - 실용도구: 글자수세기, BMI계산기, 연봉계산기 (3종)
    
    최근 완료한 CSS 최적화:
    - 모든 인라인 스타일 제거 (29/30 페이지 완료)
    - 페이지별 CSS 모듈화 완성
    - 15개 CSS 파일로 구조화
    - 로딩 속도 및 유지보수성 향상
    
    기술 스택:
    - Frontend: HTML5, CSS3, JavaScript ES6+
    - API: Google Gemini AI, Kakao SDK
    - 호스팅: GitHub Pages + Vercel
    - PWA: Service Worker, 오프라인 지원
    
    현재 문제점 및 개선 필요 사항:
    1. 모바일 반응형 최적화
    2. 접근성 개선
    3. SEO 추가 최적화
    4. 성능 최적화 (이미지, CSS, JS)
    5. 사용자 경험 개선
    """
    
    print("🤖 GPT-4o를 사용한 웹사이트 구조 분석 시작...")
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "당신은 웹사이트 UX/UI 및 성능 최적화 전문가입니다. 주어진 웹사이트 정보를 바탕으로 구체적이고 실행 가능한 개선 방안을 제시해주세요."
                },
                {
                    "role": "user",
                    "content": f"""
다음 웹사이트 정보를 분석하고 개선 방안을 제시해주세요:

{website_info}

다음 관점에서 구체적인 개선 지시사항을 작성해주세요:

1. 🎨 **UI/UX 개선**:
   - 메인 페이지 레이아웃 최적화
   - 네비게이션 개선
   - 카드/버튼 디자인 업그레이드
   - 색상 및 타이포그래피 개선

2. 📱 **모바일 최적화**:
   - 반응형 디자인 개선점
   - 터치 인터페이스 최적화
   - 모바일 성능 향상

3. ⚡ **성능 최적화**:
   - CSS/JS 번들링 및 압축
   - 이미지 최적화
   - 로딩 속도 개선
   - 캐싱 전략

4. 🔍 **SEO & 접근성**:
   - 메타데이터 최적화
   - 구조화된 데이터 개선
   - 접근성 향상
   - Core Web Vitals 최적화

5. 🚀 **기능 개선**:
   - 사용자 흐름 최적화
   - 인터랙션 개선
   - 오류 처리 강화
   - PWA 기능 향상

각 개선사항을 구체적인 코드 수정 지시사항으로 작성해주세요.
                    """
                }
            ],
            max_tokens=3000,
            temperature=0.2
        )
        
        analysis = response.choices[0].message.content
        
        print("=" * 80)
        print("🎯 GPT-4o 웹사이트 분석 및 개선 방안")
        print("=" * 80)
        print(analysis)
        print("=" * 80)
        
        # 분석 결과를 파일로 저장
        with open('improvement_plan.txt', 'w', encoding='utf-8') as f:
            f.write(analysis)
        
        print("\n💾 개선 방안이 improvement_plan.txt에 저장되었습니다.")
        
        return analysis
        
    except Exception as e:
        print(f"❌ API 요청 실패: {e}")
        return None

def main():
    print("🎯 doha.kr 웹사이트 개선 방안 분석")
    print("=" * 50)
    
    # 분석 실행
    analysis = analyze_website_structure()
    
    if analysis:
        print("\n✅ 분석 완료! 개선 방안을 확인하고 적용하세요.")
        print("\n📋 다음 단계:")
        print("1. improvement_plan.txt 파일 내용 확인")
        print("2. 우선순위에 따라 개선사항 적용")
        print("3. 테스트 및 검증")
    else:
        print("❌ 분석 실패")
        sys.exit(1)

if __name__ == "__main__":
    main()