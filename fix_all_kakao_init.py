#!/usr/bin/env python3
"""
Fix all Kakao.init calls to include window.API_CONFIG check
"""

import os
import re
import json

def fix_kakao_init_in_file(file_path):
    """Add window.API_CONFIG check to Kakao.init calls"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Pattern to find Kakao SDK initialization blocks
        # Look for the typical pattern with isInitialized check
        pattern1 = r'(if\s*\(\s*window\.Kakao\s*&&\s*!window\.Kakao\.isInitialized\(\)\s*\)\s*{\s*Kakao\.init\s*\([^)]+\)\s*;\s*})'
        
        # Replacement with API_CONFIG check
        replacement1 = r'''if (window.API_CONFIG && window.API_CONFIG.KAKAO_JS_KEY) {
    if (window.Kakao && !window.Kakao.isInitialized()) {
        Kakao.init(window.API_CONFIG.KAKAO_JS_KEY);
    }
}'''
        
        # Replace pattern 1
        content = re.sub(pattern1, replacement1, content, flags=re.MULTILINE | re.DOTALL)
        
        # Pattern to find standalone Kakao.init without any checks
        pattern2 = r'(?<!\w)Kakao\.init\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)\s*;'
        
        # Check if we need to handle standalone inits
        standalone_matches = list(re.finditer(pattern2, content))
        for match in standalone_matches:
            # Check if this is already inside a safe block
            start = max(0, match.start() - 200)
            context = content[start:match.start()]
            
            if 'window.API_CONFIG' not in context and 'window.Kakao' not in context:
                # Replace with safe initialization
                old_text = match.group(0)
                new_text = f'''if (window.API_CONFIG && window.API_CONFIG.KAKAO_JS_KEY) {{
    if (window.Kakao && !window.Kakao.isInitialized()) {{
        {old_text}
    }}
}}'''
                content = content[:match.start()] + new_text + content[match.end():]
        
        # Check if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"  [ERROR] {file_path}: {e}")
        return False

def main():
    print("=== Fixing All Kakao.init Issues ===\n")
    
    # Load the comprehensive report
    with open('comprehensive_kakao_report.json', 'r', encoding='utf-8') as f:
        report = json.load(f)
    
    unsafe_files = report['issues_by_type'].get('unsafe_init', [])
    
    print(f"Found {len(unsafe_files)} files with unsafe Kakao.init\n")
    
    fixed_count = 0
    for file_path in unsafe_files:
        print(f"Processing: {file_path}")
        if fix_kakao_init_in_file(file_path):
            print(f"  [OK] Fixed unsafe Kakao.init")
            fixed_count += 1
        else:
            print(f"  [SKIP] No changes needed or error occurred")
    
    print(f"\n=== Summary ===")
    print(f"Total files processed: {len(unsafe_files)}")
    print(f"Files fixed: {fixed_count}")
    
    # Save fix report
    fix_report = {
        'total_unsafe_files': len(unsafe_files),
        'files_fixed': fixed_count,
        'processed_files': unsafe_files
    }
    
    with open('kakao_init_fix_report.json', 'w', encoding='utf-8') as f:
        json.dump(fix_report, f, indent=2, ensure_ascii=False)
    
    print("\nFix report saved to kakao_init_fix_report.json")

if __name__ == "__main__":
    main()