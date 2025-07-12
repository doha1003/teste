#!/usr/bin/env python3
"""
Quick validation script for doha.kr without external dependencies
"""

import os
import re
import json
from pathlib import Path

def validate_website():
    """Run comprehensive validation without external dependencies"""
    
    print("🔍 doha.kr 전체 사이트 검증 시작...")
    print("=" * 60)
    
    issues = []
    
    # 1. HTML 파일 CSS 링크 검증
    print("\n📄 HTML 파일 CSS 링크 검증")
    print("-" * 30)
    
    html_files = list(Path('.').rglob('*.html'))
    print(f"총 {len(html_files)}개 HTML 파일 발견")
    
    for html_file in html_files:
        if 'backup' in str(html_file) or 'temp' in str(html_file):
            continue
            
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # CSS 링크 찾기
            css_links = re.findall(r'<link[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\']', content)
            
            for css_link in css_links:
                # 절대 경로를 상대 경로로 변환
                if css_link.startswith('/'):
                    css_path = Path('.' + css_link)
                else:
                    css_path = html_file.parent / css_link
                
                if not css_path.exists():
                    issue = f"❌ {html_file}: CSS 파일 없음 - {css_link}"
                    print(issue)
                    issues.append({
                        'type': 'missing_css',
                        'file': str(html_file),
                        'missing_path': css_link,
                        'severity': 'high'
                    })
                else:
                    print(f"✅ {html_file}: {css_link}")
        
        except Exception as e:
            print(f"⚠️  {html_file}: 읽기 오류 - {e}")
    
    # 2. JavaScript 파일 검증
    print(f"\n🔧 JavaScript 파일 검증")
    print("-" * 30)
    
    for html_file in html_files:
        if 'backup' in str(html_file) or 'temp' in str(html_file):
            continue
            
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # JS 파일 링크 찾기
            js_links = re.findall(r'<script[^>]*src=["\']([^"\']+)["\']', content)
            
            for js_link in js_links:
                # 외부 URL 건너뛰기
                if js_link.startswith('http'):
                    continue
                    
                # 절대 경로를 상대 경로로 변환
                if js_link.startswith('/'):
                    js_path = Path('.' + js_link)
                else:
                    js_path = html_file.parent / js_link
                
                if not js_path.exists():
                    issue = f"❌ {html_file}: JS 파일 없음 - {js_link}"
                    print(issue)
                    issues.append({
                        'type': 'missing_js',
                        'file': str(html_file),
                        'missing_path': js_link,
                        'severity': 'high'
                    })
                else:
                    print(f"✅ {html_file}: {js_link}")
        
        except Exception as e:
            print(f"⚠️  {html_file}: 읽기 오류 - {e}")
    
    # 3. CSP 헤더 검증
    print(f"\n🔒 CSP 헤더 검증")
    print("-" * 30)
    
    for html_file in html_files:
        if 'backup' in str(html_file) or 'temp' in str(html_file):
            continue
            
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # CSP 헤더 찾기 (긴 CSP를 위해 개선된 정규표현식)
            csp_match = re.search(r'Content-Security-Policy.*?content=["\']([^"\']*unsafe-inline[^"\']*)["\']', content, re.DOTALL)
            
            if not csp_match:
                issue = f"❌ {html_file}: CSP 헤더 없음"
                print(issue)
                issues.append({
                    'type': 'missing_csp',
                    'file': str(html_file),
                    'severity': 'medium'
                })
            else:
                csp_content = csp_match.group(1)
                # 두 곳 모두에 unsafe-inline이 있는지 확인
                script_unsafe = "'unsafe-inline'" in csp_content and 'script-src' in csp_content
                style_unsafe = "'unsafe-inline'" in csp_content and 'style-src' in csp_content
                
                if not (script_unsafe and style_unsafe):
                    issue = f"⚠️  {html_file}: CSP에 unsafe-inline 부족"
                    print(issue)
                    issues.append({
                        'type': 'incomplete_csp',
                        'file': str(html_file),
                        'severity': 'medium'
                    })
                else:
                    print(f"✅ {html_file}: CSP 정상")
        
        except Exception as e:
            print(f"⚠️  {html_file}: 읽기 오류 - {e}")
    
    # 4. 컴포넌트 placeholder 검증
    print(f"\n🧩 컴포넌트 Placeholder 검증")
    print("-" * 30)
    
    for html_file in html_files:
        if 'backup' in str(html_file) or 'temp' in str(html_file):
            continue
            
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            has_navbar = 'navbar-placeholder' in content
            has_footer = 'footer-placeholder' in content
            
            if not has_navbar and 'navbar' not in str(html_file):
                print(f"⚠️  {html_file}: navbar-placeholder 없음")
            elif has_navbar:
                print(f"✅ {html_file}: navbar-placeholder 있음")
                
            if not has_footer and 'footer' not in str(html_file):
                print(f"⚠️  {html_file}: footer-placeholder 없음")
            elif has_footer:
                print(f"✅ {html_file}: footer-placeholder 있음")
        
        except Exception as e:
            print(f"⚠️  {html_file}: 읽기 오류 - {e}")
    
    # 5. 컴포넌트 파일 검증
    print(f"\n🔗 컴포넌트 파일 검증")
    print("-" * 30)
    
    component_files = [
        'includes/navbar.html',
        'includes/footer.html'
    ]
    
    for component in component_files:
        if Path(component).exists():
            print(f"✅ {component}: 존재함")
        else:
            issue = f"❌ {component}: 컴포넌트 파일 없음"
            print(issue)
            issues.append({
                'type': 'missing_component',
                'file': component,
                'severity': 'critical'
            })
    
    # 6. 주요 CSS 파일 검증
    print(f"\n🎨 주요 CSS 파일 검증")
    print("-" * 30)
    
    important_css = [
        'css/styles.css',
        'css/navbar-fix.css'
    ]
    
    for css_file in important_css:
        if Path(css_file).exists():
            print(f"✅ {css_file}: 존재함")
        else:
            issue = f"❌ {css_file}: 중요 CSS 파일 없음"
            print(issue)
            issues.append({
                'type': 'missing_critical_css',
                'file': css_file,
                'severity': 'critical'
            })
    
    # 7. main.js 컴포넌트 로딩 함수 검증
    print(f"\n⚙️  main.js 컴포넌트 로딩 검증")
    print("-" * 30)
    
    main_js_path = Path('js/main.js')
    if main_js_path.exists():
        try:
            with open(main_js_path, 'r', encoding='utf-8') as f:
                js_content = f.read()
                
            if 'loadComponent' in js_content:
                print("✅ main.js: loadComponent 함수 있음")
            else:
                issue = "❌ main.js: loadComponent 함수 없음"
                print(issue)
                issues.append({
                    'type': 'missing_js_function',
                    'file': 'js/main.js',
                    'function': 'loadComponent',
                    'severity': 'high'
                })
                
            if 'DOMContentLoaded' in js_content:
                print("✅ main.js: DOMContentLoaded 이벤트 있음")
            else:
                issue = "❌ main.js: DOMContentLoaded 이벤트 없음"
                print(issue)
                issues.append({
                    'type': 'missing_js_event',
                    'file': 'js/main.js',
                    'event': 'DOMContentLoaded',
                    'severity': 'high'
                })
        except Exception as e:
            print(f"⚠️  main.js: 읽기 오류 - {e}")
    else:
        print("❌ main.js: 파일 없음")
        issues.append({
            'type': 'missing_file',
            'file': 'js/main.js',
            'severity': 'critical'
        })
    
    # 결과 요약
    print(f"\n📊 검증 결과 요약")
    print("=" * 60)
    
    critical_issues = [i for i in issues if i['severity'] == 'critical']
    high_issues = [i for i in issues if i['severity'] == 'high']
    medium_issues = [i for i in issues if i['severity'] == 'medium']
    
    print(f"🚨 Critical 문제: {len(critical_issues)}개")
    print(f"⚠️  High 문제: {len(high_issues)}개")
    print(f"ℹ️  Medium 문제: {len(medium_issues)}개")
    print(f"📄 총 문제: {len(issues)}개")
    
    # 상세 문제 리스트
    if issues:
        print(f"\n🔍 발견된 문제들:")
        print("-" * 40)
        for i, issue in enumerate(issues, 1):
            severity_emoji = {'critical': '🚨', 'high': '⚠️', 'medium': 'ℹ️'}[issue['severity']]
            print(f"{i}. {severity_emoji} [{issue['type']}] {issue['file']}")
            if 'missing_path' in issue:
                print(f"   누락 파일: {issue['missing_path']}")
            if 'function' in issue:
                print(f"   누락 함수: {issue['function']}")
            if 'event' in issue:
                print(f"   누락 이벤트: {issue['event']}")
    else:
        print(f"\n🎉 모든 검증 통과! 문제가 발견되지 않았습니다.")
    
    # JSON 리포트 저장
    with open('validation_report.json', 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': str(Path.cwd()),
            'total_issues': len(issues),
            'critical_issues': len(critical_issues),
            'high_issues': len(high_issues),
            'medium_issues': len(medium_issues),
            'issues': issues
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 상세 리포트가 validation_report.json에 저장되었습니다.")
    
    return len(issues) == 0

if __name__ == "__main__":
    success = validate_website()
    exit(0 if success else 1)