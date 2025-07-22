#!/usr/bin/env python3
"""
doha.kr 실제 기능 테스트 - HTML 구조를 실제로 파싱해서 확인
"""

import os
import re
import json
from datetime import datetime
from collections import defaultdict

def extract_interactive_elements(html_content):
    """HTML에서 상호작용 가능한 요소들 추출"""
    elements = {
        'inputs': [],
        'buttons': [],
        'textareas': [],
        'selects': [],
        'onclick_functions': [],
        'forms': [],
        'ids': [],
        'classes': []
    }
    
    # Input 요소 추출
    inputs = re.findall(r'<input[^>]*>', html_content, re.IGNORECASE)
    for inp in inputs:
        inp_type = re.search(r'type=["\']([^"\']*)["\']', inp)
        inp_id = re.search(r'id=["\']([^"\']*)["\']', inp)
        inp_disabled = 'disabled' in inp
        elements['inputs'].append({
            'type': inp_type.group(1) if inp_type else 'text',
            'id': inp_id.group(1) if inp_id else None,
            'disabled': inp_disabled,
            'html': inp
        })
    
    # Button 요소 추출
    buttons = re.findall(r'<button[^>]*>.*?</button>', html_content, re.IGNORECASE | re.DOTALL)
    for btn in buttons:
        btn_onclick = re.search(r'onclick=["\']([^"\']*)["\']', btn)
        btn_id = re.search(r'id=["\']([^"\']*)["\']', btn)
        btn_disabled = 'disabled' in btn
        elements['buttons'].append({
            'onclick': btn_onclick.group(1) if btn_onclick else None,
            'id': btn_id.group(1) if btn_id else None,
            'disabled': btn_disabled,
            'text': re.sub(r'<[^>]+>', '', btn).strip()
        })
    
    # Textarea 요소 추출
    textareas = re.findall(r'<textarea[^>]*>.*?</textarea>', html_content, re.IGNORECASE | re.DOTALL)
    for ta in textareas:
        ta_id = re.search(r'id=["\']([^"\']*)["\']', ta)
        ta_disabled = 'disabled' in ta
        elements['textareas'].append({
            'id': ta_id.group(1) if ta_id else None,
            'disabled': ta_disabled
        })
    
    # Select 요소 추출
    selects = re.findall(r'<select[^>]*>.*?</select>', html_content, re.IGNORECASE | re.DOTALL)
    for sel in selects:
        sel_id = re.search(r'id=["\']([^"\']*)["\']', sel)
        elements['selects'].append({
            'id': sel_id.group(1) if sel_id else None
        })
    
    # onclick 함수들 추출
    onclick_funcs = re.findall(r'onclick=["\']([^"\']*)\([^)]*\)["\']', html_content)
    elements['onclick_functions'] = list(set(onclick_funcs))
    
    # ID와 Class 추출
    ids = re.findall(r'id=["\']([^"\']*)["\']', html_content)
    elements['ids'] = list(set(ids))
    
    classes = re.findall(r'class=["\']([^"\']*)["\']', html_content)
    all_classes = []
    for cls in classes:
        all_classes.extend(cls.split())
    elements['classes'] = list(set(all_classes))
    
    return elements

def check_javascript_functions(html_content):
    """JavaScript 함수 정의 확인"""
    functions = {
        'defined': [],
        'called': [],
        'missing': []
    }
    
    # 함수 정의 찾기
    func_defs = re.findall(r'function\s+(\w+)\s*\(', html_content)
    functions['defined'].extend(func_defs)
    
    # 화살표 함수 찾기
    arrow_funcs = re.findall(r'(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=])\s*=>', html_content)
    functions['defined'].extend(arrow_funcs)
    
    # onclick에서 호출되는 함수 찾기
    onclick_calls = re.findall(r'onclick=["\'](\w+)\(', html_content)
    functions['called'].extend(onclick_calls)
    
    # 호출되지만 정의되지 않은 함수 찾기
    functions['missing'] = list(set(functions['called']) - set(functions['defined']))
    
    return functions

def analyze_page(page_path):
    """페이지 상세 분석"""
    result = {
        'path': page_path,
        'exists': os.path.exists(page_path),
        'issues': [],
        'warnings': [],
        'info': {}
    }
    
    if not result['exists']:
        result['issues'].append("파일이 존재하지 않음")
        return result
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. 상호작용 요소 분석
    elements = extract_interactive_elements(content)
    result['info']['elements'] = elements
    
    # 2. 비활성화된 입력 요소 확인
    disabled_count = sum(1 for inp in elements['inputs'] if inp['disabled'])
    disabled_count += sum(1 for btn in elements['buttons'] if btn['disabled'])
    disabled_count += sum(1 for ta in elements['textareas'] if ta['disabled'])
    
    if disabled_count > 0:
        result['issues'].append(f"{disabled_count}개의 입력 요소가 비활성화됨")
    
    # 3. JavaScript 함수 확인
    js_functions = check_javascript_functions(content)
    result['info']['javascript'] = js_functions
    
    if js_functions['missing']:
        result['issues'].append(f"정의되지 않은 함수 호출: {', '.join(js_functions['missing'])}")
    
    # 4. 필수 스크립트 로드 확인
    scripts = re.findall(r'<script[^>]*src=["\']([^"\']*)["\']', content)
    result['info']['scripts'] = scripts
    
    # 5. CSS 파일 로드 확인
    stylesheets = re.findall(r'<link[^>]*href=["\']([^"\']*\.css[^"\']*)["\']', content)
    result['info']['stylesheets'] = stylesheets
    
    # 6. 콘솔 에러 가능성 확인
    if 'charAt' in content and 'pillar' in content:
        result['warnings'].append("charAt 에러 가능성 (pillar 객체)")
    
    if 'Kakao.init' in content and 'api-config.js' not in str(scripts):
        result['warnings'].append("Kakao SDK 초기화에 필요한 api-config.js 누락")
    
    return result

def generate_detailed_report(pages_to_check):
    """상세 리포트 생성"""
    report = {
        'timestamp': datetime.now().isoformat(),
        'pages': []
    }
    
    print("=" * 80)
    print("🔍 doha.kr 실제 기능 상세 분석")
    print("=" * 80)
    print(f"분석 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    for page in pages_to_check:
        analysis = analyze_page(page)
        report['pages'].append(analysis)
        
        print(f"\n📄 {page}")
        print("-" * 40)
        
        if not analysis['exists']:
            print("❌ 파일이 존재하지 않음")
            continue
        
        # 요소 정보
        elements = analysis['info']['elements']
        print(f"📋 상호작용 요소:")
        print(f"   • Input: {len(elements['inputs'])}개")
        print(f"   • Button: {len(elements['buttons'])}개")
        print(f"   • Textarea: {len(elements['textareas'])}개")
        print(f"   • Select: {len(elements['selects'])}개")
        
        # JavaScript 정보
        js_info = analysis['info']['javascript']
        print(f"\n🔧 JavaScript:")
        print(f"   • 정의된 함수: {len(js_info['defined'])}개")
        print(f"   • onclick 호출: {len(js_info['called'])}개")
        if js_info['missing']:
            print(f"   • ⚠️ 누락된 함수: {', '.join(js_info['missing'])}")
        
        # 문제점
        if analysis['issues']:
            print(f"\n❌ 문제점:")
            for issue in analysis['issues']:
                print(f"   • {issue}")
        
        # 경고
        if analysis['warnings']:
            print(f"\n⚠️ 경고:")
            for warning in analysis['warnings']:
                print(f"   • {warning}")
        
        # 주요 버튼 정보
        if elements['buttons']:
            print(f"\n🔘 주요 버튼:")
            for btn in elements['buttons'][:5]:  # 최대 5개만
                if btn['onclick']:
                    print(f"   • {btn['text']}: {btn['onclick']}")
    
    # 리포트 저장
    with open('real_functionality_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n\n📁 상세 리포트가 real_functionality_report.json에 저장되었습니다.")
    return report

# 체크할 페이지 목록
PAGES_TO_CHECK = [
    "index.html",
    "tests/teto-egen/test.html",
    "tests/mbti/test.html",
    "tests/love-dna/test.html",
    "tools/text-counter.html",
    "tools/bmi-calculator.html",
    "tools/salary-calculator.html",
    "fortune/saju/index.html",
    "fortune/tarot/index.html",
    "fortune/daily/index.html"
]

if __name__ == "__main__":
    import sys
    import io
    
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    generate_detailed_report(PAGES_TO_CHECK)