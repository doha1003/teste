#!/usr/bin/env python3
"""
doha.kr 전체 페이지 기능 체크리스트 및 테스트
각 페이지의 실제 기능이 작동하는지 확인
"""

import os
import re
import json
from datetime import datetime

# 페이지별 기능 체크리스트 정의
PAGE_REQUIREMENTS = {
    "index.html": {
        "name": "메인 페이지",
        "features": [
            {"id": "nav", "desc": "네비게이션 메뉴 표시", "selector": "#navbar-placeholder"},
            {"id": "hero", "desc": "히어로 섹션 표시", "selector": ".hero"},
            {"id": "links", "desc": "모든 내부 링크 작동", "selector": "a[href^='/']"},
            {"id": "footer", "desc": "푸터 표시", "selector": "#footer-placeholder"},
            {"id": "stats", "desc": "통계 카운터 표시", "selector": ".stats-container"}
        ],
        "scripts": ["main.js", "api-config.js"],
        "critical_css": ["styles.css", "mobile-fixes.css", "button-system.css"]
    },
    
    "tests/teto-egen/test.html": {
        "name": "테토-에겐 테스트",
        "features": [
            {"id": "gender_select", "desc": "성별 선택 화면", "selector": "#gender-screen"},
            {"id": "test_start", "desc": "테스트 시작 버튼", "selector": "button[onclick*='startTest']"},
            {"id": "questions", "desc": "질문 표시 영역", "selector": "#question"},
            {"id": "options", "desc": "선택지 버튼들", "selector": "#options"},
            {"id": "progress", "desc": "진행률 표시", "selector": "#progress"},
            {"id": "result", "desc": "결과 화면", "selector": "#result-screen"},
            {"id": "share", "desc": "카카오 공유 버튼", "selector": "button[onclick='shareKakao()']"}
        ],
        "scripts": ["test.js", "api-config.js", "main.js"],
        "critical_css": ["styles.css", "teto-egen-test.css"],
        "interactive": True
    },
    
    "tests/mbti/test.html": {
        "name": "MBTI 테스트",
        "features": [
            {"id": "intro", "desc": "테스트 소개 화면", "selector": "#intro-screen"},
            {"id": "start_btn", "desc": "시작 버튼 클릭 가능", "selector": ".test-btn"},
            {"id": "questions", "desc": "MBTI 질문 표시", "selector": "#question"},
            {"id": "options", "desc": "A/B 선택지", "selector": ".option-btn"},
            {"id": "result_type", "desc": "MBTI 유형 결과", "selector": "#result-type"},
            {"id": "share", "desc": "공유 기능", "selector": ".share-btn"}
        ],
        "scripts": ["mbti-test.js", "api-config.js"],
        "critical_css": ["styles.css", "mbti-test.css"],
        "interactive": True
    },
    
    "tools/text-counter.html": {
        "name": "글자수 세기",
        "features": [
            {"id": "textarea", "desc": "텍스트 입력창", "selector": "#text-input"},
            {"id": "counter", "desc": "실시간 글자수 표시", "selector": "#char-count"},
            {"id": "word_count", "desc": "단어수 표시", "selector": "#word-count"},
            {"id": "clear_btn", "desc": "지우기 버튼", "selector": "#clear-btn"},
            {"id": "copy_btn", "desc": "복사 버튼", "selector": "#copy-btn"}
        ],
        "scripts": ["text-counter.js"],
        "critical_css": ["styles.css", "text-counter.css"],
        "input_required": True
    },
    
    "tools/bmi-calculator.html": {
        "name": "BMI 계산기",
        "features": [
            {"id": "height_input", "desc": "키 입력창", "selector": "#height"},
            {"id": "weight_input", "desc": "몸무게 입력창", "selector": "#weight"},
            {"id": "calc_btn", "desc": "계산 버튼", "selector": "#calculate-btn"},
            {"id": "result", "desc": "BMI 결과 표시", "selector": "#bmi-result"},
            {"id": "status", "desc": "비만도 상태 표시", "selector": "#bmi-status"}
        ],
        "scripts": ["bmi-calculator.js"],
        "critical_css": ["styles.css", "bmi-calculator.css"],
        "input_required": True
    },
    
    "fortune/saju/index.html": {
        "name": "사주팔자",
        "features": [
            {"id": "date_input", "desc": "생년월일 입력", "selector": "input[type='date']"},
            {"id": "time_select", "desc": "생시 선택", "selector": "select#birth-time"},
            {"id": "gender_select", "desc": "성별 선택", "selector": "input[name='gender']"},
            {"id": "lunar_toggle", "desc": "음력/양력 전환", "selector": "#calendar-type"},
            {"id": "calc_btn", "desc": "운세보기 버튼", "selector": "#calculate-btn"},
            {"id": "result", "desc": "사주 결과 표시", "selector": "#saju-result"}
        ],
        "scripts": ["saju.js", "lunar-calendar-compact.js"],
        "critical_css": ["styles.css", "saju.css"],
        "interactive": True
    }
}

def check_page_functionality(page_path, requirements):
    """페이지의 실제 기능 체크"""
    results = {
        "page": page_path,
        "name": requirements["name"],
        "passed": 0,
        "failed": 0,
        "issues": []
    }
    
    if not os.path.exists(page_path):
        results["issues"].append(f"페이지 파일이 존재하지 않음: {page_path}")
        results["failed"] = len(requirements["features"])
        return results
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. 필수 스크립트 확인
    for script in requirements["scripts"]:
        if script not in content:
            results["issues"].append(f"필수 스크립트 누락: {script}")
            results["failed"] += 1
        else:
            results["passed"] += 1
    
    # 2. 필수 CSS 확인
    for css in requirements["critical_css"]:
        if css not in content:
            results["issues"].append(f"필수 CSS 누락: {css}")
            results["failed"] += 1
        else:
            results["passed"] += 1
    
    # 3. 기능 요소 확인
    for feature in requirements["features"]:
        if feature["selector"] in content:
            results["passed"] += 1
        else:
            results["issues"].append(f"기능 요소 누락: {feature['desc']} ({feature['selector']})")
            results["failed"] += 1
    
    # 4. 특수 체크
    if requirements.get("input_required"):
        # 입력 필드가 disabled되어 있는지 확인
        disabled_inputs = re.findall(r'<(?:input|textarea)[^>]*disabled[^>]*>', content)
        if disabled_inputs:
            results["issues"].append(f"입력 필드가 비활성화됨: {len(disabled_inputs)}개")
            results["failed"] += 1
    
    if requirements.get("interactive"):
        # onclick 이벤트가 제대로 연결되어 있는지 확인
        onclick_errors = re.findall(r'onclick=["\']([^"\']*)["\']', content)
        for onclick in onclick_errors:
            if 'undefined' in onclick or 'null' in onclick:
                results["issues"].append(f"잘못된 onclick 이벤트: {onclick}")
                results["failed"] += 1
    
    return results

def generate_fix_script(all_results):
    """문제 해결을 위한 스크립트 생성"""
    fixes = []
    
    for result in all_results:
        if result["issues"]:
            fixes.append(f"\n# {result['name']} ({result['page']}) 수정사항:")
            for issue in result["issues"]:
                if "스크립트 누락" in issue:
                    script_name = issue.split(": ")[1]
                    fixes.append(f"  - <script src='/js/{script_name}'></script> 추가 필요")
                elif "CSS 누락" in issue:
                    css_name = issue.split(": ")[1]
                    fixes.append(f"  - <link rel='stylesheet' href='/css/{css_name}'> 추가 필요")
                elif "입력 필드가 비활성화됨" in issue:
                    fixes.append(f"  - input/textarea 태그에서 disabled 속성 제거")
                elif "기능 요소 누락" in issue:
                    fixes.append(f"  - {issue}")
    
    return "\n".join(fixes)

def main():
    print("=" * 80)
    print("🔍 doha.kr 페이지별 기능 체크리스트 검증")
    print("=" * 80)
    print(f"검증 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    all_results = []
    total_passed = 0
    total_failed = 0
    
    for page, requirements in PAGE_REQUIREMENTS.items():
        result = check_page_functionality(page, requirements)
        all_results.append(result)
        total_passed += result["passed"]
        total_failed += result["failed"]
        
        if result["failed"] > 0:
            print(f"❌ {result['name']}: {result['failed']}개 문제")
            for issue in result["issues"]:
                print(f"   • {issue}")
        else:
            print(f"✅ {result['name']}: 모든 기능 정상")
    
    # 통계
    print("\n" + "=" * 80)
    print("📊 전체 통계")
    print("=" * 80)
    print(f"검사한 페이지: {len(all_results)}개")
    print(f"통과한 항목: {total_passed}개")
    print(f"실패한 항목: {total_failed}개")
    print(f"성공률: {(total_passed / (total_passed + total_failed) * 100):.1f}%")
    
    # 수정 스크립트 생성
    if total_failed > 0:
        print("\n" + "=" * 80)
        print("🔧 필요한 수정사항")
        print("=" * 80)
        print(generate_fix_script(all_results))
    
    # 결과 저장
    report = {
        'timestamp': datetime.now().isoformat(),
        'summary': {
            'total_pages': len(all_results),
            'total_passed': total_passed,
            'total_failed': total_failed,
            'success_rate': total_passed / (total_passed + total_failed) * 100
        },
        'details': all_results
    }
    
    with open('page_functionality_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n📁 상세 리포트가 page_functionality_report.json에 저장되었습니다.")

if __name__ == "__main__":
    import sys
    import io
    
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    main()