#!/usr/bin/env python3
"""
doha.kr 전체 페이지 철저한 검토
모든 페이지의 실제 작동 여부와 문제점 파악
"""

import os
import re
import json
from datetime import datetime

def find_all_html_files():
    """모든 HTML 파일 찾기"""
    html_files = []
    for root, dirs, files in os.walk('.'):
        # 백업 파일과 node_modules 제외
        if 'backup' in root or 'node_modules' in root:
            continue
        for file in files:
            if file.endswith('.html') and not file.endswith('.backup.html'):
                html_files.append(os.path.join(root, file))
    return sorted(html_files)

def check_page_issues(file_path):
    """각 페이지의 문제점 체크"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    issues = []
    
    # 1. CSS 파일 체크
    css_files = re.findall(r'<link[^>]*href=["\']([^"\']*\.css[^"\']*)["\']', content)
    missing_css = []
    
    # 필수 CSS 체크
    if '/css/styles.css' not in str(css_files):
        missing_css.append('styles.css')
    if '/css/mobile-fixes.css' not in str(css_files):
        missing_css.append('mobile-fixes.css')
    if '/css/button-system.css' not in str(css_files):
        missing_css.append('button-system.css')
    
    if missing_css:
        issues.append(f"CSS 누락: {', '.join(missing_css)}")
    
    # 2. JavaScript 에러 가능성
    js_errors = []
    
    # onclick에서 호출하는 함수들
    onclick_funcs = re.findall(r'onclick=["\'](\w+)\(', content)
    # script 태그 내 정의된 함수들
    defined_funcs = re.findall(r'function\s+(\w+)\s*\(', content)
    defined_funcs += re.findall(r'window\.(\w+)\s*=', content)
    
    # 정의되지 않은 함수 찾기
    for func in set(onclick_funcs):
        if func not in defined_funcs and func not in ['alert', 'confirm', 'location']:
            js_errors.append(f"정의되지 않은 함수: {func}()")
    
    if js_errors:
        issues.append(f"JS 에러: {', '.join(js_errors)}")
    
    # 3. 결과 표시 체크
    if 'test' in file_path.lower():
        if 'result' not in content.lower() and 'result-screen' not in content:
            issues.append("결과 화면 없음")
        if 'id="result-' not in content and 'class="result' not in content:
            issues.append("결과 표시 요소 없음")
    
    # 4. 네비게이션/푸터 체크
    if 'navbar-placeholder' not in content:
        issues.append("네비게이션 누락")
    if 'footer-placeholder' not in content:
        issues.append("푸터 누락")
    
    # 5. API/스크립트 체크
    if 'api-config.js' not in content:
        issues.append("api-config.js 누락")
    if 'main.js' not in content:
        issues.append("main.js 누락")
    
    # 6. 입력 필드 체크
    if 'tools' in file_path:
        inputs = re.findall(r'<(?:input|textarea)[^>]*>', content)
        if not inputs:
            issues.append("입력 필드 없음")
        # disabled 체크
        disabled_inputs = [inp for inp in inputs if 'disabled' in inp]
        if disabled_inputs:
            issues.append(f"비활성화된 입력: {len(disabled_inputs)}개")
    
    # 7. 폼 제출 체크
    if '<form' in content:
        forms = re.findall(r'<form[^>]*>', content)
        for form in forms:
            if 'onsubmit' not in form and 'action' not in form:
                issues.append("폼 제출 처리 없음")
    
    # 8. 모바일 반응형
    if 'viewport' not in content:
        issues.append("viewport 메타 태그 없음")
    
    # 9. 페이지별 특수 체크
    if 'saju' in file_path:
        if 'calculateSaju' not in content and 'generateSaju' not in content:
            issues.append("사주 계산 함수 없음")
    
    if 'mbti' in file_path:
        if 'calculateMBTI' not in content and 'result-type' not in content:
            issues.append("MBTI 계산 로직 없음")
    
    if 'text-counter' in file_path:
        if 'updateCount' not in content and 'handleTextInput' not in content:
            issues.append("글자수 계산 함수 없음")
    
    # 10. 중복된 클래스 속성 (에러 원인)
    double_class = re.findall(r'class=["\'][^"\']*["\'][^>]*class=["\']', content)
    if double_class:
        issues.append(f"중복 class 속성: {len(double_class)}개")
    
    return issues

def main():
    print("=" * 80)
    print("🔍 doha.kr 전체 페이지 철저한 검토")
    print("=" * 80)
    print(f"검토 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    html_files = find_all_html_files()
    print(f"총 {len(html_files)}개 HTML 파일 발견\n")
    
    total_issues = 0
    problematic_pages = []
    all_results = []
    
    for file_path in html_files:
        issues = check_page_issues(file_path)
        
        # 상대 경로로 변환
        rel_path = file_path.replace('.\\', '').replace('\\', '/')
        
        result = {
            'path': rel_path,
            'issues': issues,
            'issue_count': len(issues)
        }
        all_results.append(result)
        
        if issues:
            total_issues += len(issues)
            problematic_pages.append(rel_path)
            print(f"❌ {rel_path}: {len(issues)}개 문제")
            for issue in issues:
                print(f"   • {issue}")
        else:
            print(f"✅ {rel_path}: 정상")
    
    # 통계
    print("\n" + "=" * 80)
    print("📊 전체 통계")
    print("=" * 80)
    print(f"검사한 페이지: {len(html_files)}개")
    print(f"문제 있는 페이지: {len(problematic_pages)}개")
    print(f"발견된 문제: {total_issues}개")
    print(f"문제 비율: {len(problematic_pages) / len(html_files) * 100:.1f}%")
    
    # 주요 문제 유형 분석
    issue_types = {}
    for result in all_results:
        for issue in result['issues']:
            issue_type = issue.split(':')[0]
            issue_types[issue_type] = issue_types.get(issue_type, 0) + 1
    
    if issue_types:
        print("\n주요 문제 유형:")
        for issue_type, count in sorted(issue_types.items(), key=lambda x: x[1], reverse=True):
            print(f"  • {issue_type}: {count}건")
    
    # 심각한 페이지 (3개 이상 문제)
    serious_pages = [r for r in all_results if r['issue_count'] >= 3]
    if serious_pages:
        print(f"\n⚠️ 심각한 문제 페이지 ({len(serious_pages)}개):")
        for page in sorted(serious_pages, key=lambda x: x['issue_count'], reverse=True)[:10]:
            print(f"  • {page['path']}: {page['issue_count']}개 문제")
    
    # 완성도 계산
    pages_without_issues = len(html_files) - len(problematic_pages)
    completeness = (pages_without_issues / len(html_files)) * 100
    
    print(f"\n🎯 전체 완성도: {completeness:.1f}%")
    print(f"   (문제 없는 페이지 비율 기준)")
    
    # 실제 기능 완성도 추정
    critical_issues = sum(1 for r in all_results if any(
        'JS 에러' in i or '결과' in i or '계산' in i or '제출' in i 
        for i in r['issues']
    ))
    functional_completeness = ((len(html_files) - critical_issues) / len(html_files)) * 100
    
    print(f"\n🔧 기능적 완성도: {functional_completeness:.1f}%")
    print(f"   (치명적 문제가 없는 페이지 비율)")
    
    # JSON 저장
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_pages': len(html_files),
        'problematic_pages': len(problematic_pages),
        'total_issues': total_issues,
        'completeness': completeness,
        'functional_completeness': functional_completeness,
        'issue_types': issue_types,
        'all_results': all_results
    }
    
    with open('thorough_page_audit.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n📁 상세 리포트가 thorough_page_audit.json에 저장되었습니다.")

if __name__ == "__main__":
    import sys
    import io
    
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    main()