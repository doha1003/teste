#!/usr/bin/env python3
"""
심리테스트 기능 구현 상태 확인
MBTI, 테토-에겐, 러브DNA 테스트 기능 검증
"""

import os
import re
import json

def check_mbti_functions():
    """MBTI 테스트 기능 확인"""
    results = {
        'index': {'exists': False, 'issues': []},
        'test': {'exists': False, 'issues': []}
    }
    
    # MBTI index.html 확인
    mbti_index = 'tests/mbti/index.html'
    if os.path.exists(mbti_index):
        results['index']['exists'] = True
        with open(mbti_index, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 필수 요소 체크
        checks = {
            'start_button': 'href="test.html"' in content or 'href="./test.html"' in content,
            'description': 'MBTI' in content and ('16가지' in content or '성격' in content),
            'navigation': 'navbar-placeholder' in content
        }
        
        for check, passed in checks.items():
            if not passed:
                results['index']['issues'].append(f"{check} 누락")
    
    # MBTI test.html 확인
    mbti_test = 'tests/mbti/test.html'
    if os.path.exists(mbti_test):
        results['test']['exists'] = True
        with open(mbti_test, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 필수 기능 체크
        checks = {
            'questions_data': 'questions' in content or 'mbtiQuestions' in content,
            'answer_buttons': 'button' in content and ('답변' in content or 'answer' in content),
            'progress_bar': 'progress' in content,
            'result_calculation': 'calculateResult' in content or 'getMBTIType' in content,
            'result_display': 'showResult' in content or 'displayResult' in content,
            'mbti_script': 'mbti-test.js' in content
        }
        
        for check, passed in checks.items():
            if not passed:
                results['test']['issues'].append(f"{check} 누락")
    
    return results

def check_teto_egen_functions():
    """테토-에겐 테스트 기능 확인"""
    results = {
        'index': {'exists': False, 'issues': []},
        'start': {'exists': False, 'issues': []},
        'test': {'exists': False, 'issues': []}
    }
    
    # 각 페이지 확인
    pages = {
        'index': 'tests/teto-egen/index.html',
        'start': 'tests/teto-egen/start.html',
        'test': 'tests/teto-egen/test.html'
    }
    
    for page_type, path in pages.items():
        if os.path.exists(path):
            results[page_type]['exists'] = True
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if page_type == 'index':
                checks = {
                    'start_link': 'href="start.html"' in content or 'href="./start.html"' in content,
                    'description': '테토' in content and '에겐' in content
                }
            elif page_type == 'start':
                checks = {
                    'gender_selection': 'selectGender' in content or 'gender' in content,
                    'test_link': 'test.html' in content
                }
            else:  # test
                checks = {
                    'questions': 'questions' in content or 'tetoQuestions' in content,
                    'answer_buttons': 'selectAnswer' in content or 'chooseAnswer' in content,
                    'result_calculation': 'calculateType' in content or 'getResult' in content,
                    'teto_egen_script': 'teto-egen-test.js' in content or 'test.js' in content
                }
            
            for check, passed in checks.items():
                if not passed:
                    results[page_type]['issues'].append(f"{check} 누락")
    
    return results

def check_love_dna_functions():
    """러브 DNA 테스트 기능 확인"""
    results = {
        'index': {'exists': False, 'issues': []},
        'test': {'exists': False, 'issues': []}
    }
    
    # 각 페이지 확인
    pages = {
        'index': 'tests/love-dna/index.html',
        'test': 'tests/love-dna/test.html'
    }
    
    for page_type, path in pages.items():
        if os.path.exists(path):
            results[page_type]['exists'] = True
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if page_type == 'index':
                checks = {
                    'start_link': 'href="test.html"' in content or 'href="./test.html"' in content,
                    'description': 'DNA' in content or '연애' in content
                }
            else:  # test
                checks = {
                    'dna_axes': 'dnaAxes' in content or 'loveDNA' in content,
                    'questions': 'questions' in content,
                    'chart_display': 'canvas' in content or 'Chart' in content,
                    'result_analysis': 'analyzeDNA' in content or 'analyzeResult' in content,
                    'love_dna_script': 'love-dna-test.js' in content
                }
            
            for check, passed in checks.items():
                if not passed:
                    results[page_type]['issues'].append(f"{check} 누락")
    
    return results

def check_test_scripts():
    """테스트별 스크립트 파일 존재 확인"""
    scripts = {
        'MBTI': 'js/mbti-test.js',
        '테토-에겐': 'tests/teto-egen/test.js',
        '러브DNA': 'js/love-dna-test.js'
    }
    
    results = {}
    for test_name, script_path in scripts.items():
        if os.path.exists(script_path):
            with open(script_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            results[test_name] = {
                'exists': True,
                'size': len(content),
                'has_questions': 'questions' in content,
                'has_results': 'result' in content.lower(),
                'has_functions': 'function' in content
            }
        else:
            results[test_name] = {'exists': False}
    
    return results

def generate_test_function_report():
    """심리테스트 기능 상세 리포트 생성"""
    print("=" * 80)
    print("🧠 심리테스트 기능 구현 상태 검증")
    print("=" * 80)
    
    # MBTI 체크
    print("\n📊 MBTI 테스트")
    mbti_results = check_mbti_functions()
    for page, data in mbti_results.items():
        if data['exists']:
            if data['issues']:
                print(f"  ❌ {page}.html - {len(data['issues'])}개 문제")
                for issue in data['issues']:
                    print(f"     • {issue}")
            else:
                print(f"  ✅ {page}.html - 정상")
        else:
            print(f"  ⚠️  {page}.html - 파일 없음")
    
    # 테토-에겐 체크
    print("\n🦋 테토-에겐 테스트")
    teto_results = check_teto_egen_functions()
    for page, data in teto_results.items():
        if data['exists']:
            if data['issues']:
                print(f"  ❌ {page}.html - {len(data['issues'])}개 문제")
                for issue in data['issues']:
                    print(f"     • {issue}")
            else:
                print(f"  ✅ {page}.html - 정상")
        else:
            print(f"  ⚠️  {page}.html - 파일 없음")
    
    # 러브 DNA 체크
    print("\n💕 러브 DNA 테스트")
    love_results = check_love_dna_functions()
    for page, data in love_results.items():
        if data['exists']:
            if data['issues']:
                print(f"  ❌ {page}.html - {len(data['issues'])}개 문제")
                for issue in data['issues']:
                    print(f"     • {issue}")
            else:
                print(f"  ✅ {page}.html - 정상")
        else:
            print(f"  ⚠️  {page}.html - 파일 없음")
    
    # 스크립트 파일 체크
    print("\n📄 테스트 스크립트 파일")
    script_results = check_test_scripts()
    for test_name, data in script_results.items():
        if data['exists']:
            print(f"  ✅ {test_name}: 존재 ({data['size']} bytes)")
            if data.get('has_questions'):
                print(f"     • 질문 데이터: ✅")
            if data.get('has_results'):
                print(f"     • 결과 처리: ✅")
            if data.get('has_functions'):
                print(f"     • 함수 정의: ✅")
        else:
            print(f"  ❌ {test_name}: 파일 없음")
    
    # 전체 요약
    total_issues = 0
    for results in [mbti_results, teto_results, love_results]:
        for page_data in results.values():
            total_issues += len(page_data.get('issues', []))
    
    print("\n" + "=" * 80)
    print("📊 요약")
    print("=" * 80)
    print(f"총 문제 개수: {total_issues}개")
    
    # JSON 저장
    report_data = {
        'mbti': mbti_results,
        'teto_egen': teto_results,
        'love_dna': love_results,
        'scripts': script_results,
        'total_issues': total_issues
    }
    
    with open('test_functions_report.json', 'w', encoding='utf-8') as f:
        json.dump(report_data, f, ensure_ascii=False, indent=2)
    
    print("\n📁 상세 리포트가 test_functions_report.json에 저장되었습니다.")

if __name__ == "__main__":
    import sys
    import io
    
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    generate_test_function_report()