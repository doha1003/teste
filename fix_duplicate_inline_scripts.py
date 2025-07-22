#!/usr/bin/env python3
"""
인라인 스크립트 중복 제거
"""

import os
import re
from bs4 import BeautifulSoup
import shutil
from datetime import datetime

def remove_duplicate_inline_scripts(filepath):
    """인라인 스크립트 중복 제거"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # 모든 인라인 스크립트 찾기
    inline_scripts = soup.find_all('script', src=False)
    
    # 스크립트 내용별로 그룹화
    script_groups = {}
    for script in inline_scripts:
        if script.string:
            # 공백 정규화
            normalized = re.sub(r'\s+', ' ', script.string.strip())
            if len(normalized) > 50:  # 의미있는 크기만
                if normalized not in script_groups:
                    script_groups[normalized] = []
                script_groups[normalized].append(script)
    
    # 중복 제거
    removed_count = 0
    for normalized, scripts in script_groups.items():
        if len(scripts) > 1:
            # 첫 번째를 제외하고 나머지 제거
            for i, script in enumerate(scripts):
                if i > 0:
                    script.decompose()
                    removed_count += 1
    
    return soup, removed_count

def fix_specific_file():
    """특정 파일의 중복 스크립트 수정"""
    filepath = 'tests/teto-egen/start.html'
    
    if not os.path.exists(filepath):
        print(f"[ERROR] {filepath} 파일을 찾을 수 없습니다.")
        return
    
    print(f"[INFO] {filepath} 파일의 중복 인라인 스크립트 제거 중...")
    
    # 백업 생성
    backup_path = filepath + '.backup_inline_fix'
    shutil.copy2(filepath, backup_path)
    
    # 중복 제거
    soup, removed_count = remove_duplicate_inline_scripts(filepath)
    
    if removed_count > 0:
        # 파일 저장
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(str(soup.prettify()))
        
        print(f"[SUCCESS] {removed_count}개의 중복 인라인 스크립트를 제거했습니다.")
        print(f"백업 파일: {backup_path}")
    else:
        print("[INFO] 제거할 중복 스크립트가 없습니다.")
    
    # 검증
    print("\n검증 중...")
    with open(filepath, 'r', encoding='utf-8') as f:
        new_content = f.read()
    
    new_soup = BeautifulSoup(new_content, 'html.parser')
    inline_scripts = new_soup.find_all('script', src=False)
    
    # IntersectionObserver 스크립트 개수 확인
    intersection_observer_count = 0
    for script in inline_scripts:
        if script.string and 'IntersectionObserver' in script.string:
            intersection_observer_count += 1
    
    print(f"[VERIFY] IntersectionObserver 스크립트 개수: {intersection_observer_count}개")
    
    if intersection_observer_count == 1:
        print("[SUCCESS] 중복이 성공적으로 제거되었습니다!")
    else:
        print(f"[WARNING] 아직 {intersection_observer_count}개의 IntersectionObserver 스크립트가 있습니다.")

def check_all_pages_inline_duplicates():
    """모든 페이지의 인라인 스크립트 중복 확인 및 수정"""
    pages = [
        'index.html',
        'about/index.html',
        'contact/index.html',
        'faq/index.html',
        'privacy/index.html',
        'terms/index.html',
        'fortune/index.html',
        'fortune/daily/index.html',
        'fortune/saju/index.html',
        'fortune/tarot/index.html',
        'fortune/zodiac/index.html',
        'fortune/zodiac-animal/index.html',
        'tests/index.html',
        'tests/mbti/index.html',
        'tests/mbti/test.html',
        'tests/love-dna/index.html',
        'tests/love-dna/test.html',
        'tests/teto-egen/index.html',
        'tests/teto-egen/start.html',
        'tests/teto-egen/test.html',
        'tools/index.html',
        'tools/bmi-calculator.html',
        'tools/salary-calculator.html',
        'tools/text-counter.html',
        '404.html'
    ]
    
    print("="*60)
    print("모든 페이지 인라인 스크립트 중복 확인")
    print("="*60)
    
    total_fixed = 0
    
    for page in pages:
        if os.path.exists(page):
            with open(page, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            inline_scripts = soup.find_all('script', src=False)
            
            # 중복 확인
            script_contents = {}
            duplicates = []
            
            for script in inline_scripts:
                if script.string:
                    normalized = re.sub(r'\s+', ' ', script.string.strip())
                    if len(normalized) > 50:
                        if normalized in script_contents:
                            duplicates.append(normalized[:50] + '...')
                        else:
                            script_contents[normalized] = 1
            
            if duplicates:
                print(f"\n[DUPLICATE FOUND] {page}")
                for dup in set(duplicates):
                    print(f"  - {dup}")
                
                # 수정
                soup, removed = remove_duplicate_inline_scripts(page)
                if removed > 0:
                    # 백업
                    backup_path = page + '.backup_inline_fix'
                    shutil.copy2(page, backup_path)
                    
                    # 저장
                    with open(page, 'w', encoding='utf-8') as f:
                        f.write(str(soup.prettify()))
                    
                    print(f"  [FIXED] {removed}개의 중복 제거됨")
                    total_fixed += removed
    
    print("\n" + "="*60)
    print(f"총 {total_fixed}개의 중복 인라인 스크립트가 제거되었습니다.")
    
    return total_fixed

if __name__ == "__main__":
    # 1. 특정 파일 수정
    fix_specific_file()
    
    # 2. 전체 페이지 검사 (옵션)
    print("\n" + "-"*60)
    response = input("모든 페이지를 검사하고 수정하시겠습니까? (y/n): ")
    if response.lower() == 'y':
        check_all_pages_inline_duplicates()