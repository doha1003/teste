#!/usr/bin/env python3
"""
중복된 스크립트와 CSS 링크를 찾아서 제거하는 스크립트
"""

import os
import re
from bs4 import BeautifulSoup
from collections import defaultdict
import json
from datetime import datetime
import shutil

def get_all_html_files():
    """모든 HTML 파일을 찾아서 반환"""
    html_files = []
    exclude_dirs = ['node_modules', 'dist', 'development', 'reports', 'sample_screenshots', '.git']
    
    for root, dirs, files in os.walk('.'):
        # 제외할 디렉토리 건너뛰기
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file.endswith('.html') and not file.endswith('.backup'):
                html_files.append(os.path.join(root, file))
    
    return html_files

def extract_resource_info(tag):
    """스크립트나 링크 태그에서 리소스 정보 추출"""
    if tag.name == 'script':
        src = tag.get('src', '')
        return ('script', src, str(tag))
    elif tag.name == 'link' and tag.get('rel') == ['stylesheet']:
        href = tag.get('href', '')
        return ('css', href, str(tag))
    return None

def find_duplicates_in_file(filepath):
    """파일 내에서 중복된 리소스 찾기"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    resources = defaultdict(list)
    duplicates = []
    
    # 모든 script와 CSS link 태그 찾기
    for tag in soup.find_all(['script', 'link']):
        info = extract_resource_info(tag)
        if info and info[1]:  # src나 href가 있는 경우만
            resource_type, resource_url, tag_str = info
            resources[(resource_type, resource_url)].append(tag)
    
    # 중복 찾기
    for (resource_type, resource_url), tags in resources.items():
        if len(tags) > 1:
            duplicates.append({
                'type': resource_type,
                'url': resource_url,
                'count': len(tags),
                'tags': [str(tag) for tag in tags]
            })
    
    return duplicates, soup, content

def remove_duplicates(soup, duplicates):
    """중복된 태그 제거 (첫 번째만 남기고)"""
    removed_count = 0
    
    for dup in duplicates:
        resource_type = dup['type']
        resource_url = dup['url']
        
        # 해당 리소스의 모든 태그 찾기
        if resource_type == 'script':
            tags = soup.find_all('script', src=resource_url)
        else:  # css
            tags = soup.find_all('link', rel='stylesheet', href=resource_url)
        
        # 첫 번째를 제외하고 모두 제거
        for i, tag in enumerate(tags):
            if i > 0:  # 첫 번째가 아닌 경우
                tag.decompose()
                removed_count += 1
    
    return removed_count

def fix_duplicate_resources():
    """모든 HTML 파일에서 중복 리소스 제거"""
    html_files = get_all_html_files()
    report = {
        'timestamp': datetime.now().isoformat(),
        'files_processed': 0,
        'files_with_duplicates': 0,
        'total_duplicates_removed': 0,
        'details': []
    }
    
    print(f"총 {len(html_files)}개의 HTML 파일을 검사합니다...")
    
    for filepath in html_files:
        relative_path = os.path.relpath(filepath)
        print(f"\n검사 중: {relative_path}")
        
        try:
            duplicates, soup, original_content = find_duplicates_in_file(filepath)
            
            if duplicates:
                print(f"  - {len(duplicates)}개의 중복 리소스 발견")
                
                # 백업 생성
                backup_path = filepath + '.backup_before_duplicate_fix'
                shutil.copy2(filepath, backup_path)
                
                # 중복 제거
                removed_count = remove_duplicates(soup, duplicates)
                
                # 파일 저장
                new_content = str(soup.prettify())
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                file_report = {
                    'file': relative_path,
                    'duplicates_found': len(duplicates),
                    'duplicates_removed': removed_count,
                    'details': duplicates
                }
                
                report['files_with_duplicates'] += 1
                report['total_duplicates_removed'] += removed_count
                report['details'].append(file_report)
                
                print(f"  - {removed_count}개의 중복 태그 제거됨")
                
                # 상세 정보 출력
                for dup in duplicates:
                    print(f"    • {dup['type']}: {dup['url']} ({dup['count']}번 중복)")
            else:
                print("  - 중복 없음")
        
        except Exception as e:
            print(f"  - 오류 발생: {str(e)}")
            report['details'].append({
                'file': relative_path,
                'error': str(e)
            })
        
        report['files_processed'] += 1
    
    # 보고서 저장
    report_path = 'duplicate_fix_report.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    # 요약 출력
    print("\n" + "="*60)
    print("중복 리소스 제거 완료!")
    print("="*60)
    print(f"검사한 파일: {report['files_processed']}개")
    print(f"중복이 있던 파일: {report['files_with_duplicates']}개")
    print(f"제거된 중복 태그: {report['total_duplicates_removed']}개")
    print(f"\n상세 보고서: {report_path}")
    
    return report

def verify_fix():
    """수정 후 검증"""
    print("\n수정 결과 검증 중...")
    html_files = get_all_html_files()
    issues = []
    
    for filepath in html_files:
        try:
            duplicates, _, _ = find_duplicates_in_file(filepath)
            if duplicates:
                issues.append({
                    'file': os.path.relpath(filepath),
                    'remaining_duplicates': len(duplicates)
                })
        except Exception as e:
            issues.append({
                'file': os.path.relpath(filepath),
                'error': str(e)
            })
    
    if issues:
        print(f"\n[WARNING] {len(issues)}개 파일에 여전히 문제가 있습니다:")
        for issue in issues[:5]:  # 처음 5개만 표시
            print(f"  - {issue['file']}")
    else:
        print("\n[SUCCESS] 모든 파일에서 중복이 성공적으로 제거되었습니다!")
    
    return len(issues) == 0

if __name__ == "__main__":
    # 현재 디렉토리가 맞는지 확인
    if not os.path.exists('index.html'):
        print("[WARNING] index.html이 없습니다. 프로젝트 루트 디렉토리에서 실행해주세요.")
        exit(1)
    
    # 중복 리소스 제거 실행
    report = fix_duplicate_resources()
    
    # 검증
    success = verify_fix()
    
    if success:
        print("\n[SUCCESS] 중복 스크립트와 CSS 문제가 모두 해결되었습니다!")
    else:
        print("\n[WARNING] 일부 문제가 남아있습니다. 보고서를 확인해주세요.")