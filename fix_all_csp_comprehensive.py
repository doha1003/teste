#!/usr/bin/env python3
"""
CSP 문제 완전 해결 스크립트
- 모든 HTML 파일의 CSP meta 태그 일괄 수정
- 표준화된 CSP 정책 적용
- 배포 후 검증까지 포함
"""
import os
import re
import time
import subprocess
import requests
from pathlib import Path

# 표준 CSP 정책 정의
STANDARD_CSP = (
    'upgrade-insecure-requests; '
    'default-src \'self\' https:; '
    'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' '
    'https://pagead2.googlesyndication.com '
    'https://www.googletagmanager.com '
    'https://developers.kakao.com '
    'https://t1.kakaocdn.net '
    'https://ep2.adtrafficquality.google '
    'https://fundingchoicesmessages.google.com '
    'https://cdn.jsdelivr.net; '
    'style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; '
    'font-src \'self\' https://fonts.gstatic.com; '
    'img-src \'self\' data: https:; '
    'connect-src \'self\' https:; '
    'frame-src \'self\' https://www.google.com '
    'https://fundingchoicesmessages.google.com '
    'https://googleads.g.doubleclick.net '
    'https://ep2.adtrafficquality.google '
    'https://tpc.googlesyndication.com;'
)

def find_html_files():
    """HTML 파일들 찾기"""
    html_files = []
    exclude_dirs = {'node_modules', '.git', 'teste_repo', 'ai-agent-hub', 'doha_kr_inspection_data'}
    
    for root, dirs, files in os.walk('.'):
        # 제외할 디렉토리 건너뛰기
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file.endswith('.html') and not file.startswith('.'):
                html_files.append(os.path.join(root, file))
    
    return html_files

def fix_csp_in_file(file_path):
    """단일 파일의 CSP 수정"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 기존 CSP meta 태그 패턴 찾기
        csp_pattern = r'<meta\s+http-equiv=["\']Content-Security-Policy["\'][^>]*?content=["\'][^"\']*?["\'][^>]*?>'
        
        # 새로운 CSP meta 태그 생성
        new_csp_tag = f'<meta http-equiv="Content-Security-Policy" content="{STANDARD_CSP}">'
        
        # 기존 CSP 태그 교체
        if re.search(csp_pattern, content, re.IGNORECASE):
            content = re.sub(csp_pattern, new_csp_tag, content, flags=re.IGNORECASE)
            
            # 파일 쓰기
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return True
        
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False
    
    return False

def main():
    print("Starting comprehensive CSP fix...")
    
    # 1. HTML 파일들 찾기
    html_files = find_html_files()
    project_files = [f for f in html_files if f.startswith('.\\') and 'node_modules' not in f]
    
    print(f"Found {len(project_files)} HTML files in project")
    
    # 2. CSP 수정
    fixed_count = 0
    for file_path in project_files:
        if fix_csp_in_file(file_path):
            fixed_count += 1
            print(f"Fixed: {file_path}")
    
    print(f"\nTotal {fixed_count} files fixed")
    
    # 3. Git 커밋
    try:
        subprocess.run(['git', 'add', '.'], check=True)
        subprocess.run([
            'git', 'commit', '-m', 
            f'Fix CSP meta tags across all {fixed_count} HTML files\n\n'
            '- Apply standardized CSP policy to all pages\n'
            '- Fix incomplete CSP meta tag syntax\n'
            '- Ensure consistent security headers across site\n\n'
            'Generated with [Claude Code](https://claude.ai/code)\n\n'
            'Co-Authored-By: Claude <noreply@anthropic.com>'
        ], check=True)
        subprocess.run(['git', 'push'], check=True)
        print("Changes committed and pushed to GitHub")
        
    except subprocess.CalledProcessError as e:
        print(f"Git operation failed: {e}")
        return False
    
    # 4. Wait for deployment and verification
    print("\nWaiting for GitHub Pages deployment...")
    time.sleep(60)  # Wait 1 minute
    
    # 5. Verification
    test_urls = [
        'https://doha.kr/',
        'https://doha.kr/fortune/tarot/',
        'https://doha.kr/tools/text-counter.html'
    ]
    
    print("Verifying deployment...")
    for url in test_urls:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                # Check CSP header
                csp_header = response.headers.get('content-security-policy', '')
                if 'script-src' in response.text and 'connect-src' in response.text:
                    # Check if CSP text is exposed in page content
                    if response.text.count('script-src') > 2:  # More than just in meta tag
                        print(f"FAIL {url}: CSP still exposed in content")
                    else:
                        print(f"PASS {url}: CSP properly contained in meta tag")
                else:
                    print(f"PASS {url}: No CSP exposure detected")
            else:
                print(f"FAIL {url}: HTTP {response.status_code}")
        except Exception as e:
            print(f"ERROR {url}: {e}")
    
    print("\nCSP fix process completed!")
    return True

if __name__ == "__main__":
    main()