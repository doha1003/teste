#!/usr/bin/env python3
"""
doha.kr 설계/기획 대비 구현 검토
각 페이지가 원래 기획대로 제대로 구현되었는지 확인
"""

import os
import re
import json
from datetime import datetime

# 페이지별 기획 요구사항 정의
PAGE_REQUIREMENTS = {
    "index.html": {
        "name": "메인 페이지",
        "purpose": "사이트 전체 서비스 소개 및 네비게이션",
        "required_features": {
            "hero_section": "히어로 섹션 (사이트 소개)",
            "service_grid": "서비스 카드 그리드",
            "category_filter": "카테고리별 필터 기능",
            "stats_counter": "활성 서비스 카운터",
            "cta_section": "행동 유도 섹션",
            "navigation": "전체 네비게이션",
            "footer": "푸터"
        },
        "required_functionality": {
            "filter_works": "카테고리 필터가 실제로 작동",
            "links_work": "모든 서비스 링크가 올바른 페이지로 연결",
            "responsive": "모바일 반응형 디자인",
            "counter_animation": "카운터 애니메이션"
        }
    },
    
    "tests/teto-egen/test.html": {
        "name": "테토-에겐 테스트",
        "purpose": "성격을 테토형/에겐형으로 분류하는 심리테스트",
        "required_features": {
            "gender_selection": "성별 선택 화면",
            "intro_screen": "테스트 소개 화면",
            "question_display": "질문 표시 영역",
            "option_selection": "선택지 버튼 (각 질문당 2-3개)",
            "progress_bar": "진행률 표시",
            "navigation_buttons": "이전/다음 버튼",
            "result_screen": "결과 화면",
            "result_analysis": "상세 분석 (성격, 강점, 약점)",
            "share_function": "카카오톡 공유"
        },
        "required_functionality": {
            "gender_affects_result": "성별에 따라 다른 결과 (테토남/테토녀/에겐남/에겐녀)",
            "score_calculation": "점수 계산 로직",
            "progress_tracking": "진행 상태 추적",
            "result_storage": "결과 localStorage 저장",
            "share_works": "실제 카카오톡 공유 작동"
        }
    },
    
    "tests/mbti/test.html": {
        "name": "MBTI 테스트",
        "purpose": "16가지 MBTI 성격 유형 진단",
        "required_features": {
            "intro_screen": "MBTI 소개 화면",
            "question_display": "질문 표시 (24문항)",
            "binary_choice": "A/B 선택지",
            "progress_indicator": "진행 상황 표시",
            "result_display": "MBTI 유형 결과 (예: INTJ)",
            "type_description": "유형별 상세 설명",
            "cognitive_functions": "인지기능 설명",
            "share_buttons": "공유 기능"
        },
        "required_functionality": {
            "type_calculation": "E/I, S/N, T/F, J/P 계산",
            "accurate_typing": "정확한 MBTI 유형 도출",
            "detailed_analysis": "유형별 맞춤 분석",
            "share_works": "공유 기능 작동"
        }
    },
    
    "tools/text-counter.html": {
        "name": "글자수 세기",
        "purpose": "텍스트 글자수, 단어수, 바이트 계산",
        "required_features": {
            "text_input": "텍스트 입력창 (textarea)",
            "realtime_count": "실시간 카운트 업데이트",
            "multiple_metrics": "글자수, 공백제외, 바이트, 원고지",
            "character_analysis": "한글/영문/숫자/특수문자 구분",
            "clear_button": "지우기 버튼",
            "copy_button": "복사 버튼",
            "paste_button": "붙여넣기 버튼"
        },
        "required_functionality": {
            "realtime_update": "입력 즉시 업데이트",
            "accurate_counting": "정확한 카운트",
            "large_text_handling": "대용량 텍스트 처리",
            "clipboard_access": "클립보드 접근"
        }
    },
    
    "fortune/saju/index.html": {
        "name": "사주팔자",
        "purpose": "생년월일시로 사주팔자 분석",
        "required_features": {
            "input_form": "생년월일시 입력 폼",
            "lunar_toggle": "음력/양력 전환",
            "gender_selection": "성별 선택",
            "time_selection": "시간 선택 (12시진)",
            "result_display": "사주팔자 표시",
            "element_analysis": "오행 분석",
            "personality_analysis": "성격 분석",
            "fortune_telling": "운세 해석"
        },
        "required_functionality": {
            "manseryeok_calculation": "만세력 기반 정확한 계산",
            "lunar_conversion": "음력/양력 변환",
            "tenGods_analysis": "십신 분석",
            "element_balance": "오행 균형 분석"
        }
    }
}

def check_page_implementation(page_path, requirements):
    """페이지의 실제 구현 상태 확인"""
    result = {
        "page": page_path,
        "name": requirements["name"],
        "purpose": requirements["purpose"],
        "features": {"implemented": [], "missing": []},
        "functionality": {"working": [], "not_working": [], "unknown": []},
        "completeness": 0
    }
    
    if not os.path.exists(page_path):
        result["features"]["missing"] = list(requirements["required_features"].keys())
        result["functionality"]["not_working"] = list(requirements["required_functionality"].keys())
        return result
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. 필수 기능 구현 확인
    for feature_id, feature_desc in requirements["required_features"].items():
        found = False
        
        # 각 기능별 구현 패턴 확인
        if feature_id == "hero_section" and ("hero" in content or "header-content" in content):
            found = True
        elif feature_id == "service_grid" and ("service-card" in content or "services-grid" in content):
            found = True
        elif feature_id == "category_filter" and ("showServices" in content or "tab-button" in content):
            found = True
        elif feature_id == "gender_selection" and ("gender-screen" in content or "selectGender" in content):
            found = True
        elif feature_id == "intro_screen" and ("intro-screen" in content or "test-intro" in content):
            found = True
        elif feature_id == "question_display" and ("question" in content and ("id=\"question\"" in content or "class=\"question" in content)):
            found = True
        elif feature_id == "option_selection" and ("option" in content or "selectOption" in content):
            found = True
        elif feature_id == "progress_bar" and ("progress" in content):
            found = True
        elif feature_id == "result_screen" and ("result-screen" in content or "result-container" in content):
            found = True
        elif feature_id == "text_input" and ("<textarea" in content):
            found = True
        elif feature_id == "realtime_count" and ("oninput" in content or "handleTextInput" in content):
            found = True
        elif feature_id == "input_form" and ("<form" in content and "birthYear" in content):
            found = True
        elif feature_id == "lunar_toggle" and ("isLunar" in content or "음력" in content):
            found = True
        elif feature_id == "share_function" and ("shareKakao" in content or "Kakao.Share" in content):
            found = True
        elif feature_id in content.lower().replace("-", "").replace("_", ""):
            found = True
        
        if found:
            result["features"]["implemented"].append(f"{feature_id}: {feature_desc}")
        else:
            result["features"]["missing"].append(f"{feature_id}: {feature_desc}")
    
    # 2. 기능 작동 여부 추정
    for func_id, func_desc in requirements["required_functionality"].items():
        # JavaScript 함수 존재 여부로 추정
        if func_id == "filter_works" and "showServices" in content:
            result["functionality"]["working"].append(f"{func_id}: {func_desc}")
        elif func_id == "score_calculation" and ("score" in content or "totalScore" in content):
            result["functionality"]["working"].append(f"{func_id}: {func_desc}")
        elif func_id == "realtime_update" and "oninput" in content:
            result["functionality"]["working"].append(f"{func_id}: {func_desc}")
        elif func_id == "manseryeok_calculation" and "getManseryeokData" in content:
            result["functionality"]["working"].append(f"{func_id}: {func_desc}")
        else:
            result["functionality"]["unknown"].append(f"{func_id}: {func_desc}")
    
    # 완성도 계산
    total_features = len(requirements["required_features"]) + len(requirements["required_functionality"])
    implemented = len(result["features"]["implemented"]) + len(result["functionality"]["working"])
    result["completeness"] = round((implemented / total_features) * 100, 1)
    
    return result

def generate_implementation_report():
    """전체 구현 리포트 생성"""
    print("=" * 80)
    print("🔍 doha.kr 설계/기획 대비 구현 검토")
    print("=" * 80)
    print(f"검토 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    all_results = []
    total_completeness = 0
    
    for page_path, requirements in PAGE_REQUIREMENTS.items():
        result = check_page_implementation(page_path, requirements)
        all_results.append(result)
        total_completeness += result["completeness"]
        
        print(f"\n{'='*60}")
        print(f"📄 {result['name']} ({page_path})")
        print(f"목적: {result['purpose']}")
        print(f"완성도: {result['completeness']}%")
        print(f"{'='*60}")
        
        # 구현된 기능
        print("\n✅ 구현된 기능:")
        if result["features"]["implemented"]:
            for feature in result["features"]["implemented"]:
                print(f"  • {feature}")
        else:
            print("  (없음)")
        
        # 누락된 기능
        print("\n❌ 누락된 기능:")
        if result["features"]["missing"]:
            for feature in result["features"]["missing"]:
                print(f"  • {feature}")
        else:
            print("  (없음)")
        
        # 작동 확인된 기능
        print("\n🟢 작동 확인:")
        if result["functionality"]["working"]:
            for func in result["functionality"]["working"]:
                print(f"  • {func}")
        else:
            print("  (없음)")
        
        # 작동 미확인 기능
        print("\n🟡 작동 미확인:")
        if result["functionality"]["unknown"]:
            for func in result["functionality"]["unknown"]:
                print(f"  • {func}")
    
    # 전체 통계
    avg_completeness = total_completeness / len(all_results)
    print(f"\n\n{'='*80}")
    print("📊 전체 구현 통계")
    print(f"{'='*80}")
    print(f"검토한 페이지: {len(all_results)}개")
    print(f"평균 완성도: {avg_completeness:.1f}%")
    print("\n페이지별 완성도:")
    for result in all_results:
        status = "🟢" if result["completeness"] >= 80 else "🟡" if result["completeness"] >= 60 else "🔴"
        print(f"  {status} {result['name']}: {result['completeness']}%")
    
    # 리포트 저장
    report = {
        'timestamp': datetime.now().isoformat(),
        'average_completeness': avg_completeness,
        'pages': all_results
    }
    
    with open('design_implementation_audit.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n📁 상세 리포트가 design_implementation_audit.json에 저장되었습니다.")
    
    # 개선 제안
    print(f"\n\n{'='*80}")
    print("💡 개선 제안")
    print(f"{'='*80}")
    
    for result in all_results:
        if result["features"]["missing"]:
            print(f"\n{result['name']}:")
            print("  누락된 핵심 기능 구현 필요:")
            for feature in result["features"]["missing"][:3]:  # 상위 3개만
                print(f"    - {feature}")

if __name__ == "__main__":
    import sys
    import io
    
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    generate_implementation_report()