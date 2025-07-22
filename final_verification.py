#!/usr/bin/env python3
"""
doha.kr 최종 검증 스크립트
- 모든 HTML 페이지의 기본 구조 검증
- CSS/JS 파일 참조 확인
- 주요 기능 요소 존재 확인
"""

import os
import re
import json
from pathlib import Path

def verify_all_pages():
    """모든 HTML 페이지 검증"""
    
    results = {
        'total_pages': 0,
        'verified_pages': 0,
        'issues': [],
        'pages_checked': []
    }
    
    # HTML 파일들 찾기
    html_files = []
    for root, dirs, files in os.walk('.'):
        # 제외할 디렉토리
        dirs[:] = [d for d in dirs if d not in {'node_modules', '.git', 'teste_repo'}]
        
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    results['total_pages'] = len(html_files)
    
    for file_path in html_files:
        try:
            page_result = verify_single_page(file_path)
            results['pages_checked'].append(page_result)
            
            if page_result['has_issues']:
                results['issues'].extend(page_result['issues'])
            else:
                results['verified_pages'] += 1
                
        except Exception as e:
            results['issues'].append({
                'file': file_path,
                'type': 'file_error',
                'message': f"파일 읽기 오류: {str(e)}"
            })
    
    return results

def verify_single_page(file_path):
    """단일 페이지 검증"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    page_result = {
        'file': file_path,
        'has_issues': False,
        'issues': []
    }
    
    # 1. 기본 HTML 구조 확인
    if not re.search(r'<!DOCTYPE html>', content, re.IGNORECASE):
        page_result['issues'].append({
            'type': 'missing_doctype',
            'message': 'DOCTYPE 선언이 없습니다'
        })
    
    if not re.search(r'<html[^>]*lang=', content, re.IGNORECASE):
        page_result['issues'].append({
            'type': 'missing_lang',
            'message': 'html lang 속성이 없습니다'
        })
    
    # 2. 메타태그 확인
    if not re.search(r'<meta[^>]*charset=', content, re.IGNORECASE):
        page_result['issues'].append({
            'type': 'missing_charset',
            'message': 'charset 메타태그가 없습니다'
        })
    
    if not re.search(r'<meta[^>]*name=["\']viewport["\']', content, re.IGNORECASE):
        page_result['issues'].append({
            'type': 'missing_viewport',
            'message': 'viewport 메타태그가 없습니다'
        })
    
    # 3. CSS/JS 파일 참조 확인
    css_refs = re.findall(r'<link[^>]*href=["\']([^"\']*\.css[^"\']*)["\']', content, re.IGNORECASE)
    js_refs = re.findall(r'<script[^>]*src=["\']([^"\']*\.js[^"\']*)["\']', content, re.IGNORECASE)
    
    for css_ref in css_refs:
        if css_ref.startswith('/'):
            css_path = css_ref[1:]  # / 제거
            if not os.path.exists(css_path):
                page_result['issues'].append({
                    'type': 'missing_css',
                    'message': f'CSS 파일이 존재하지 않습니다: {css_ref}'
                })
    
    for js_ref in js_refs:
        if js_ref.startswith('/'):
            js_path = js_ref[1:].split('?')[0]  # / 제거하고 쿼리 파라미터 제거
            if not os.path.exists(js_path):
                page_result['issues'].append({
                    'type': 'missing_js',
                    'message': f'JS 파일이 존재하지 않습니다: {js_ref}'
                })
    
    # 4. 네비게이션/푸터 확인
    if 'navbar-placeholder' in content and 'main.js' not in content:
        page_result['issues'].append({
            'type': 'missing_main_js',
            'message': 'navbar-placeholder가 있지만 main.js가 없습니다'
        })
    
    if 'footer-placeholder' in content and 'main.js' not in content:
        page_result['issues'].append({
            'type': 'missing_main_js',
            'message': 'footer-placeholder가 있지만 main.js가 없습니다'
        })
    
    # 5. CSP 메타태그 확인
    csp_matches = re.findall(r'<meta[^>]*Content-Security-Policy[^>]*content=["\']([^"\']*)["\']', content, re.IGNORECASE)
    for csp in csp_matches:
        if csp.endswith(';') and not csp.endswith('";'):
            page_result['issues'].append({
                'type': 'csp_syntax_error',
                'message': 'CSP 메타태그 문법 오류가 있을 수 있습니다'
            })
    
    # 6. JavaScript 문법 오류 기본 확인
    script_contents = re.findall(r'<script[^>]*>(.*?)</script>', content, re.DOTALL | re.IGNORECASE)
    for script in script_contents:
        if 'export ' in script and 'type="module"' not in content:
            page_result['issues'].append({
                'type': 'js_module_error',
                'message': 'ES6 export 구문이 있지만 type="module"이 없습니다'
            })
    
    page_result['has_issues'] = len(page_result['issues']) > 0
    return page_result

def generate_report(results):
    """검증 결과 리포트 생성"""
    
    print("=" * 60)
    print("📋 doha.kr 최종 검증 결과")
    print("=" * 60)
    print(f"전체 페이지: {results['total_pages']}개")
    print(f"검증 통과: {results['verified_pages']}개")
    print(f"문제 있는 페이지: {results['total_pages'] - results['verified_pages']}개")
    print(f"총 이슈: {len(results['issues'])}개")
    print()
    
    if results['issues']:
        print("🚨 발견된 이슈들:")
        print("-" * 40)
        
        # 파일별로 그룹화
        issues_by_file = {}
        for issue in results['issues']:
            file_path = issue.get('file', 'Unknown')
            if file_path not in issues_by_file:
                issues_by_file[file_path] = []
            issues_by_file[file_path].append(issue)
        
        for file_path, file_issues in issues_by_file.items():
            print(f"\n📄 {file_path}")
            for issue in file_issues:
                print(f"  ⚠️  {issue.get('type', 'unknown')}: {issue.get('message', 'No message')}")
    
    else:
        print("✅ 모든 페이지가 검증을 통과했습니다!")
    
    print("\n" + "=" * 60)
    
    # 상세 결과를 JSON 파일로 저장
    with open('verification_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print("📄 상세 결과가 verification_results.json에 저장되었습니다.")

if __name__ == "__main__":
    import sys
    import io
    
    # Windows 콘솔 인코딩 문제 해결
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    print("doha.kr 전체 사이트 검증을 시작합니다...")
    print()
    
    results = verify_all_pages()
    generate_report(results)