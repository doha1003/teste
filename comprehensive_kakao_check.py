#!/usr/bin/env python3
"""
Comprehensive check for Kakao SDK issues across all HTML files
"""

import os
import re
from pathlib import Path
import json

def check_kakao_issues(file_path):
    """Check for Kakao SDK issues in a file"""
    issues = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Check for duplicate SDK loads
        sdk_patterns = [
            r'<script\s+src="https://developers\.kakao\.com/sdk/js/kakao\.(?:min\.)?js"[^>]*>\s*</script>',
            r'<script\s+src="https://t1\.kakaocdn\.net/kakao_js_sdk/[^"]+/kakao\.(?:min\.)?js"[^>]*>\s*</script>'
        ]
        
        sdk_matches = []
        for pattern in sdk_patterns:
            sdk_matches.extend(list(re.finditer(pattern, content, re.IGNORECASE)))
        
        if len(sdk_matches) > 1:
            issues.append({
                'type': 'duplicate_sdk',
                'count': len(sdk_matches),
                'description': f'Found {len(sdk_matches)} Kakao SDK loads'
            })
        
        # 2. Check for Kakao.init without window.API_CONFIG check
        # Find all Kakao.init calls
        init_pattern = r'Kakao\.init\s*\([^)]+\)'
        init_matches = list(re.finditer(init_pattern, content))
        
        unsafe_inits = []
        for match in init_matches:
            # Get context around the init call (100 chars before and after)
            start = max(0, match.start() - 200)
            end = min(len(content), match.end() + 200)
            context = content[start:end]
            
            # Check if this init is wrapped in API_CONFIG check
            if 'window.API_CONFIG' not in context:
                unsafe_inits.append(match)
        
        if unsafe_inits:
            issues.append({
                'type': 'unsafe_init',
                'count': len(unsafe_inits),
                'description': f'Found {len(unsafe_inits)} Kakao.init without API_CONFIG check'
            })
        
        # 3. Check for multiple Kakao initializations
        if len(init_matches) > 1:
            issues.append({
                'type': 'multiple_init',
                'count': len(init_matches),
                'description': f'Found {len(init_matches)} Kakao.init calls'
            })
        
        return issues
        
    except Exception as e:
        return [{'type': 'error', 'description': str(e)}]

def main():
    print("=== Comprehensive Kakao SDK Check ===\n")
    
    all_issues = {}
    total_files = 0
    files_with_issues = 0
    
    # Search all HTML files
    for root, dirs, files in os.walk('.'):
        # Skip node_modules and other irrelevant directories
        if 'node_modules' in root or '.git' in root:
            continue
            
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                total_files += 1
                
                issues = check_kakao_issues(file_path)
                if issues:
                    all_issues[file_path] = issues
                    files_with_issues += 1
                    
                    print(f"Issues found in: {file_path}")
                    for issue in issues:
                        print(f"  - {issue['description']}")
                    print()
    
    print(f"\n=== Summary ===")
    print(f"Total HTML files checked: {total_files}")
    print(f"Files with issues: {files_with_issues}")
    
    # Group issues by type
    issue_types = {}
    for file_path, issues in all_issues.items():
        for issue in issues:
            issue_type = issue['type']
            if issue_type not in issue_types:
                issue_types[issue_type] = []
            issue_types[issue_type].append(file_path)
    
    print(f"\nIssues by type:")
    for issue_type, files in issue_types.items():
        print(f"  {issue_type}: {len(files)} files")
    
    # Save detailed report
    report = {
        'total_files': total_files,
        'files_with_issues': files_with_issues,
        'issues_by_file': all_issues,
        'issues_by_type': issue_types
    }
    
    with open('comprehensive_kakao_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print("\nDetailed report saved to comprehensive_kakao_report.json")

if __name__ == "__main__":
    main()