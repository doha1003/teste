#!/usr/bin/env python3
"""
Fix Kakao SDK issues in doha.kr website
1. Remove duplicate Kakao SDK loads
2. Add safe initialization checks for Kakao.init
"""

import os
import re
from pathlib import Path
import json

# Base directories to search
BASE_DIRS = [
    "reports",
    "development/reports/page-reports"
]

# Files with duplicate Kakao SDK loads
DUPLICATE_SDK_FILES = [
    "reports/index/dom_snapshot.html",
    "reports/tests_teto-egen_test/dom_snapshot.html",
    "reports/tools_bmi-calculator/dom_snapshot.html",
    "reports/tools_text-counter/dom_snapshot.html",
    # development/reports/page-reports 디렉토리의 파일들
    "development/reports/page-reports/index/dom_snapshot.html",
    "development/reports/page-reports/tests_teto-egen_test/dom_snapshot.html",
    "development/reports/page-reports/tools_bmi-calculator/dom_snapshot.html",
    "development/reports/page-reports/tools_text-counter/dom_snapshot.html"
]

def fix_duplicate_kakao_sdk(file_path):
    """Remove duplicate Kakao SDK script tags"""
    print(f"\nProcessing {file_path} for duplicate SDK...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find all Kakao SDK script tags (updated pattern for new SDK URL)
        sdk_patterns = [
            r'<script\s+src="https://developers\.kakao\.com/sdk/js/kakao\.(?:min\.)?js"[^>]*>\s*</script>',
            r'<script\s+src="https://t1\.kakaocdn\.net/kakao_js_sdk/[^"]+/kakao\.(?:min\.)?js"[^>]*>\s*</script>'
        ]
        
        sdk_matches = []
        for pattern in sdk_patterns:
            sdk_matches.extend(list(re.finditer(pattern, content, re.IGNORECASE)))
        
        if len(sdk_matches) > 1:
            print(f"  Found {len(sdk_matches)} Kakao SDK loads, removing duplicates...")
            
            # Keep only the first occurrence
            for match in reversed(sdk_matches[1:]):
                content = content[:match.start()] + content[match.end():]
            
            # Write back
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"  [OK] Removed {len(sdk_matches) - 1} duplicate SDK loads")
            return True
        else:
            print(f"  No duplicates found ({len(sdk_matches)} SDK load)")
            return False
            
    except Exception as e:
        print(f"  [ERROR] {e}")
        return False

def fix_kakao_init_safety(file_path):
    """Add window.API_CONFIG check before Kakao.init"""
    print(f"\nProcessing {file_path} for Kakao init safety...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern to find Kakao.init without API_CONFIG check
        # Look for Kakao.init that's not already wrapped in safety check
        unsafe_init_pattern = r'(?<!if\s*\(\s*window\.API_CONFIG[^)]*\)\s*\{\s*)Kakao\.init\s*\([^)]+\)\s*;'
        
        matches = list(re.finditer(unsafe_init_pattern, content))
        
        if matches:
            print(f"  Found {len(matches)} unsafe Kakao.init calls")
            
            # Replace each unsafe init with safe version
            for match in reversed(matches):
                old_init = match.group(0)
                
                # Extract the key from the init call
                key_match = re.search(r'Kakao\.init\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)', old_init)
                if key_match:
                    key = key_match.group(1)
                    
                    # Create safe initialization
                    safe_init = f'''if (window.API_CONFIG && window.API_CONFIG.KAKAO_JS_KEY) {{
    if (!window.Kakao.isInitialized()) {{
        {old_init}
    }}
}}'''
                    
                    content = content[:match.start()] + safe_init + content[match.end():]
            
            # Write back
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"  [OK] Fixed {len(matches)} unsafe Kakao.init calls")
            return True
        else:
            print(f"  No unsafe Kakao.init calls found")
            return False
            
    except Exception as e:
        print(f"  [ERROR] {e}")
        return False

def find_files_with_kakao_init():
    """Find all files that have Kakao.init but no window.API_CONFIG check"""
    files_to_fix = []
    
    for base_dir in BASE_DIRS:
        if not os.path.exists(base_dir):
            continue
            
        for root, dirs, files in os.walk(base_dir):
            for file in files:
                if file.endswith('.html'):
                    file_path = os.path.join(root, file)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        # Check if file has Kakao.init
                        if 'Kakao.init' in content:
                            # Check if it has unsafe init
                            unsafe_pattern = r'(?<!if\s*\(\s*window\.API_CONFIG[^)]*\)\s*\{\s*)Kakao\.init\s*\([^)]+\)\s*;'
                            if re.search(unsafe_pattern, content):
                                files_to_fix.append(file_path)
                    except:
                        pass
    
    return files_to_fix

def main():
    print("=== Fixing Kakao SDK Issues ===")
    
    # Fix duplicate SDK loads
    print("\n1. Fixing duplicate Kakao SDK loads...")
    duplicate_fixed = 0
    for file_path in DUPLICATE_SDK_FILES:
        if os.path.exists(file_path):
            if fix_duplicate_kakao_sdk(file_path):
                duplicate_fixed += 1
        else:
            print(f"\n  File not found: {file_path}")
    
    print(f"\n  Total files with duplicates fixed: {duplicate_fixed}")
    
    # Find and fix unsafe Kakao.init calls
    print("\n2. Finding files with unsafe Kakao.init...")
    unsafe_files = find_files_with_kakao_init()
    print(f"  Found {len(unsafe_files)} files with unsafe Kakao.init")
    
    if unsafe_files:
        print("\n3. Fixing unsafe Kakao.init calls...")
        init_fixed = 0
        for file_path in unsafe_files:
            if fix_kakao_init_safety(file_path):
                init_fixed += 1
        
        print(f"\n  Total files with unsafe init fixed: {init_fixed}")
    
    # Summary
    print("\n=== Summary ===")
    print(f"Duplicate SDK loads fixed: {duplicate_fixed}")
    print(f"Unsafe Kakao.init fixed: {init_fixed if unsafe_files else 0}")
    
    # Create report
    report = {
        "duplicate_sdk_files": {
            "checked": DUPLICATE_SDK_FILES,
            "fixed": duplicate_fixed
        },
        "unsafe_init_files": {
            "found": unsafe_files,
            "fixed": init_fixed if unsafe_files else 0
        }
    }
    
    with open('kakao_fix_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print("\nReport saved to kakao_fix_report.json")

if __name__ == "__main__":
    main()