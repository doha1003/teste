#!/usr/bin/env python3
"""
모든 페이지의 문제점을 정확히 체크하는 스크립트
"""

import os
import re
import json

def check_all_pages():
    """모든 HTML 페이지의 문제점 체크"""
    
    issues = {
        'kakao_sdk_versions': {},
        'integrity_issues': [],
        'components_js_refs': [],
        'kakao_init_issues': [],
        'missing_scripts': [],
        'duplicate_scripts': []
    }
    
    # HTML 파일들 찾기
    html_files = []
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in {'node_modules', '.git', 'teste_repo'}]
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    for file_path in html_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 1. Kakao SDK 버전 체크
            kakao_matches = re.findall(r'(https://(?:developers\.kakao\.com/sdk/js/kakao\.js|t1\.kakaocdn\.net/kakao_js_sdk/([^/]+)/kakao\.min\.js))', content)
            for match in kakao_matches:
                url = match[0]
                version = match[1] if match[1] else 'old'
                if version not in issues['kakao_sdk_versions']:
                    issues['kakao_sdk_versions'][version] = []
                issues['kakao_sdk_versions'][version].append(file_path)
            
            # 2. integrity 속성 체크
            if 'integrity=' in content and 'kakao' in content:
                issues['integrity_issues'].append(file_path)
            
            # 3. components.js 참조 체크
            if 'components.js' in content:
                issues['components_js_refs'].append(file_path)
            
            # 4. Kakao 초기화 체크
            if 'Kakao.init' in content and 'window.API_CONFIG' not in content:
                issues['kakao_init_issues'].append(file_path)
            
            # 5. 필수 스크립트 누락 체크
            if 'navbar-placeholder' in content or 'footer-placeholder' in content:
                if 'main.js' not in content:
                    issues['missing_scripts'].append((file_path, 'main.js'))
                if 'api-config.js' not in content:
                    issues['missing_scripts'].append((file_path, 'api-config.js'))
            
            # 6. 중복 스크립트 체크
            script_counts = {}
            scripts = re.findall(r'<script[^>]*src=["\'](.*?)["\']', content)
            for script in scripts:
                base_script = script.split('?')[0]
                script_counts[base_script] = script_counts.get(base_script, 0) + 1
            
            for script, count in script_counts.items():
                if count > 1:
                    issues['duplicate_scripts'].append((file_path, script, count))
        
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    return issues, len(html_files)

def print_report(issues, total_files):
    """문제점 리포트 출력"""
    
    print("=" * 70)
    print("🔍 doha.kr 전체 페이지 문제점 상세 분석")
    print("=" * 70)
    print(f"📄 총 검사한 파일: {total_files}개")
    print()
    
    # 1. Kakao SDK 버전 문제
    print("🚨 Kakao SDK 버전 불일치:")
    for version, files in issues['kakao_sdk_versions'].items():
        print(f"  버전 {version}: {len(files)}개 파일")
        if len(files) <= 5:
            for f in files:
                print(f"    - {f}")
    
    # 2. integrity 문제
    print(f"\n🚨 integrity 속성 문제: {len(issues['integrity_issues'])}개 파일")
    for f in issues['integrity_issues'][:5]:
        print(f"  - {f}")
    
    # 3. components.js 문제
    print(f"\n🚨 components.js 참조: {len(issues['components_js_refs'])}개 파일")
    for f in issues['components_js_refs'][:5]:
        print(f"  - {f}")
    
    # 4. Kakao 초기화 문제
    print(f"\n🚨 Kakao 초기화 문제: {len(issues['kakao_init_issues'])}개 파일")
    for f in issues['kakao_init_issues'][:5]:
        print(f"  - {f}")
    
    # 5. 누락된 스크립트
    print(f"\n🚨 누락된 필수 스크립트: {len(issues['missing_scripts'])}개")
    for f, script in issues['missing_scripts'][:5]:
        print(f"  - {f}: {script} 누락")
    
    # 6. 중복 스크립트
    print(f"\n🚨 중복 스크립트: {len(issues['duplicate_scripts'])}개")
    for f, script, count in issues['duplicate_scripts'][:5]:
        print(f"  - {f}: {script} ({count}회)")
    
    # JSON으로 저장
    with open('all_issues_report.json', 'w', encoding='utf-8') as f:
        json.dump(issues, f, ensure_ascii=False, indent=2)
    
    print("\n📁 상세 내용이 all_issues_report.json에 저장되었습니다.")

if __name__ == "__main__":
    import sys
    import io
    
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    issues, total_files = check_all_pages()
    print_report(issues, total_files)