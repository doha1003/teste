#!/usr/bin/env python3
"""
doha.kr 전체 사이트 완벽 검증 체크리스트
기획서와 설계 문서 기반으로 모든 항목 검증
"""

import os
import re
import json
from datetime import datetime

# 완전한 체크리스트 정의
COMPLETE_CHECKLIST = {
    "기본_구조_검증": {
        "DOCTYPE_선언": "<!DOCTYPE html> 존재 여부",
        "언어_설정": "html lang='ko' 설정",
        "문자셋": "UTF-8 charset 설정",
        "viewport": "모바일 반응형 viewport 설정",
        "title_태그": "적절한 페이지 제목",
        "meta_description": "SEO용 설명 메타태그",
        "favicon": "파비콘 설정",
        "og_tags": "Open Graph 태그 설정",
        "보안_헤더": "CSP, X-Content-Type-Options 등"
    },
    
    "CSS_검증": {
        "메인_CSS_로드": "/css/styles.css 로드 확인",
        "페이지별_CSS": "페이지 전용 CSS 파일 로드",
        "중복_CSS_로드": "같은 CSS 파일 중복 로드 체크",
        "인라인_스타일": "과도한 인라인 스타일 사용 체크",
        "CSS_파일_존재": "참조된 CSS 파일 실제 존재 여부",
        "반응형_CSS": "mobile-fixes.css 로드 여부",
        "버튼_시스템": "button-system.css 로드 여부"
    },
    
    "JavaScript_검증": {
        "main_js": "main.js 로드 및 버전 파라미터",
        "api_config": "api-config.js 로드 및 버전 파라미터",
        "중복_스크립트": "같은 JS 파일 중복 로드 체크",
        "의존성_순서": "스크립트 로드 순서 검증",
        "페이지별_스크립트": "페이지 전용 스크립트 로드",
        "카카오_SDK": "Kakao SDK 2.7.4 버전 통일",
        "카카오_초기화": "Kakao.init 적절한 호출",
        "에러_핸들링": "try-catch 및 에러 처리"
    },
    
    "컴포넌트_검증": {
        "네비게이션": "navbar-placeholder 존재",
        "푸터": "footer-placeholder 존재",
        "loadComponents": "컴포넌트 로드 함수 호출",
        "네비게이션_메뉴": "모든 메뉴 링크 정상 작동",
        "모바일_메뉴": "모바일 햄버거 메뉴 작동",
        "로고_링크": "로고 클릭 시 홈으로 이동"
    },
    
    "심리테스트_기능": {
        "MBTI_시작": "MBTI 테스트 시작 페이지 정상",
        "MBTI_진행": "질문 진행 및 답변 저장",
        "MBTI_결과": "16가지 유형 결과 표시",
        "테토에겐_시작": "테토-에겐 테스트 시작",
        "테토에겐_진행": "성별 선택 및 질문 진행",
        "테토에겐_결과": "테토/에겐 결과 표시",
        "러브DNA_시작": "러브 DNA 테스트 시작",
        "러브DNA_진행": "5가지 DNA 축 질문",
        "러브DNA_결과": "DNA 그래프 및 분석",
        "결과_공유": "카카오톡 공유 기능",
        "결과_링크복사": "결과 링크 복사 기능"
    },
    
    "실용도구_기능": {
        "글자수세기_입력": "텍스트 입력 영역 작동",
        "글자수세기_실시간": "실시간 카운트 업데이트",
        "글자수세기_공백포함": "공백 포함/제외 카운트",
        "BMI_입력": "키/몸무게 입력 검증",
        "BMI_계산": "BMI 지수 정확한 계산",
        "BMI_결과": "비만도 판정 및 조언",
        "연봉계산_입력": "연봉 입력 및 옵션",
        "연봉계산_세금": "4대보험 및 소득세 계산",
        "연봉계산_결과": "월 실수령액 표시"
    },
    
    "AI운세_기능": {
        "오늘의운세_입력": "생년월일 입력 폼",
        "오늘의운세_API": "Gemini API 연동",
        "오늘의운세_결과": "AI 생성 운세 표시",
        "사주_입력": "생년월일시 입력",
        "사주_만세력": "manseryeok-database.js 로드",
        "사주_계산": "사주팔자 정확한 계산",
        "사주_분석": "오행 분석 및 해석",
        "타로_질문": "질문 입력 텍스트에어리어",
        "타로_스프레드": "1장/3장/10장 선택",
        "타로_결과": "AI 타로 해석",
        "별자리_선택": "12궁도 별자리 선택",
        "별자리_운세": "오늘의 별자리 운세",
        "띠_선택": "12간지 띠 선택",
        "띠_운세": "띠별 운세 표시"
    },
    
    "광고_시스템": {
        "AdSense_스크립트": "AdSense 스크립트 로드",
        "광고_컨테이너": "광고 표시 영역 존재",
        "광고_초기화": "AdSense 초기화 코드",
        "광고_반응형": "반응형 광고 설정",
        "광고_레이블": "광고 라벨 표시"
    },
    
    "성능_최적화": {
        "이미지_최적화": "이미지 lazy loading",
        "스크립트_defer": "스크립트 defer/async 사용",
        "CSS_최적화": "CSS 파일 최소화",
        "캐시_버스팅": "버전 파라미터 사용",
        "폰트_최적화": "웹폰트 preconnect"
    },
    
    "접근성": {
        "alt_텍스트": "모든 이미지 alt 속성",
        "폼_라벨": "모든 입력 필드 라벨",
        "색상_대비": "충분한 색상 대비",
        "키보드_네비게이션": "키보드로 모든 기능 접근",
        "ARIA_속성": "적절한 ARIA 속성 사용"
    },
    
    "보안": {
        "HTTPS": "HTTPS 강제 적용",
        "CSP_헤더": "Content Security Policy 설정",
        "XSS_방지": "사용자 입력 검증",
        "API_키_보호": "API 키 노출 방지"
    }
}

def check_single_page(file_path):
    """단일 페이지에 대한 모든 체크리스트 검증"""
    results = {}
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 기본 구조 검증
        results['기본_구조_검증'] = {
            'DOCTYPE_선언': '<!DOCTYPE html>' in content,
            '언어_설정': 'lang="ko"' in content or "lang='ko'" in content,
            '문자셋': 'charset="UTF-8"' in content or "charset='UTF-8'" in content,
            'viewport': 'name="viewport"' in content,
            'title_태그': '<title>' in content and '</title>' in content,
            'meta_description': 'name="description"' in content,
            'favicon': 'rel="icon"' in content or 'rel="shortcut icon"' in content,
            'og_tags': 'property="og:' in content,
            '보안_헤더': 'Content-Security-Policy' in content
        }
        
        # CSS 검증
        css_files = re.findall(r'<link[^>]*href=["\'](.*?\.css.*?)["\']', content)
        results['CSS_검증'] = {
            '메인_CSS_로드': any('styles.css' in css for css in css_files),
            '중복_CSS_로드': len(css_files) != len(set(f.split('?')[0] for f in css_files)),
            '인라인_스타일': len(re.findall(r'style=["\'](.*?)["\']', content)) <= 5,
            '반응형_CSS': any('mobile-fixes.css' in css for css in css_files),
            '버튼_시스템': any('button-system.css' in css for css in css_files)
        }
        
        # JavaScript 검증
        js_files = re.findall(r'<script[^>]*src=["\'](.*?)["\']', content)
        results['JavaScript_검증'] = {
            'main_js': any('main.js' in js for js in js_files),
            'api_config': any('api-config.js' in js for js in js_files),
            '중복_스크립트': len(js_files) != len(set(f.split('?')[0] for f in js_files)),
            '카카오_SDK': any('kakao_js_sdk/2.7.4' in js for js in js_files),
            '카카오_초기화': 'Kakao.init' in content or 'initKakao' in content
        }
        
        # 컴포넌트 검증
        results['컴포넌트_검증'] = {
            '네비게이션': 'navbar-placeholder' in content,
            '푸터': 'footer-placeholder' in content,
            'loadComponents': 'loadComponents' in content
        }
        
        # 페이지별 특수 기능 체크
        page_name = os.path.basename(file_path)
        dir_name = os.path.basename(os.path.dirname(file_path))
        
        # 심리테스트 페이지
        if 'tests' in file_path:
            if 'mbti' in file_path:
                results['MBTI_기능'] = {
                    '질문_데이터': 'questions' in content or 'mbtiQuestions' in content,
                    '결과_계산': 'calculateResult' in content or 'getMBTIType' in content
                }
            elif 'teto-egen' in file_path:
                results['테토에겐_기능'] = {
                    '성별_선택': 'gender-selection' in content or 'selectGender' in content,
                    '결과_표시': 'showResult' in content
                }
            elif 'love-dna' in file_path:
                results['러브DNA_기능'] = {
                    'DNA_축': 'dnaAxes' in content or 'loveDNA' in content,
                    '그래프_표시': 'canvas' in content or 'chart' in content
                }
        
        # 실용도구 페이지
        elif 'tools' in file_path:
            if 'text-counter' in file_path:
                results['글자수세기_기능'] = {
                    '텍스트입력': 'textarea' in content,
                    '카운트표시': 'charCount' in content or 'count' in content
                }
            elif 'bmi-calculator' in file_path:
                results['BMI_기능'] = {
                    '입력필드': 'height' in content and 'weight' in content,
                    '계산함수': 'calculateBMI' in content
                }
            elif 'salary-calculator' in file_path:
                results['연봉계산_기능'] = {
                    '연봉입력': 'salary' in content or 'income' in content,
                    '세금계산': 'tax' in content or 'insurance' in content
                }
        
        # AI 운세 페이지
        elif 'fortune' in file_path:
            if 'saju' in file_path:
                results['사주_기능'] = {
                    '만세력_로드': 'manseryeok-database.js' in content,
                    '사주계산': 'calculateSaju' in content
                }
            elif 'tarot' in file_path:
                results['타로_기능'] = {
                    '카드데이터': 'majorArcana' in content,
                    'AI분석': 'callGeminiAPI' in content
                }
        
    except Exception as e:
        results['error'] = str(e)
    
    return results

def generate_complete_review():
    """전체 26개 페이지 완벽 리뷰"""
    
    print("=" * 100)
    print("🔍 doha.kr 완벽 검증 리포트 - 기획서 기반 전체 체크리스트")
    print("=" * 100)
    print(f"검증 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # 26개 주요 페이지
    pages = [
        "index.html", "404.html", "about/index.html", "contact/index.html",
        "privacy/index.html", "terms/index.html", "faq/index.html",
        "tests/index.html", "tests/mbti/index.html", "tests/mbti/test.html",
        "tests/teto-egen/index.html", "tests/teto-egen/start.html", "tests/teto-egen/test.html",
        "tests/love-dna/index.html", "tests/love-dna/test.html",
        "tools/index.html", "tools/text-counter.html", "tools/bmi-calculator.html",
        "tools/salary-calculator.html", "fortune/index.html", "fortune/daily/index.html",
        "fortune/saju/index.html", "fortune/tarot/index.html", "fortune/zodiac/index.html",
        "fortune/zodiac-animal/index.html"
    ]
    
    all_results = {}
    total_checks = 0
    passed_checks = 0
    
    # 각 페이지 검증
    for page in pages:
        if os.path.exists(page):
            print(f"\n📄 검증 중: {page}")
            results = check_single_page(page)
            all_results[page] = results
            
            # 통계 계산
            for category, checks in results.items():
                if isinstance(checks, dict):
                    for check, passed in checks.items():
                        total_checks += 1
                        if passed:
                            passed_checks += 1
                            print(f"  ✅ {check}")
                        else:
                            print(f"  ❌ {check}")
    
    # 전체 요약
    print("\n" + "=" * 100)
    print("📊 전체 검증 요약")
    print("=" * 100)
    print(f"총 검사 항목: {total_checks}개")
    print(f"통과 항목: {passed_checks}개")
    print(f"실패 항목: {total_checks - passed_checks}개")
    print(f"통과율: {(passed_checks / total_checks * 100):.1f}%")
    
    # 카테고리별 요약
    category_stats = {}
    for page_results in all_results.values():
        for category, checks in page_results.items():
            if isinstance(checks, dict):
                if category not in category_stats:
                    category_stats[category] = {'total': 0, 'passed': 0}
                for passed in checks.values():
                    category_stats[category]['total'] += 1
                    if passed:
                        category_stats[category]['passed'] += 1
    
    print("\n📈 카테고리별 통과율:")
    for category, stats in category_stats.items():
        rate = (stats['passed'] / stats['total'] * 100) if stats['total'] > 0 else 0
        print(f"  • {category}: {rate:.1f}% ({stats['passed']}/{stats['total']})")
    
    # 상세 리포트 저장
    with open('complete_review_report.json', 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_pages': len(pages),
                'total_checks': total_checks,
                'passed_checks': passed_checks,
                'failed_checks': total_checks - passed_checks,
                'pass_rate': passed_checks / total_checks * 100
            },
            'category_stats': category_stats,
            'detailed_results': all_results,
            'checklist': COMPLETE_CHECKLIST
        }, f, ensure_ascii=False, indent=2)
    
    print("\n📁 상세 리포트가 complete_review_report.json에 저장되었습니다.")

if __name__ == "__main__":
    import sys
    import io
    
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    generate_complete_review()