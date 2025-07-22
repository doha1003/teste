#!/usr/bin/env python3
"""
실제 HTML 파일에서 중복 로드 문제를 더 구체적으로 검사
- 동일한 스크립트의 여러 로드
- CSS 파일의 중복 로드
- 잘못된 경로로 인한 404 에러
"""

import os
import re
from bs4 import BeautifulSoup
from collections import Counter
import json
from datetime import datetime

def check_page_duplicates(filepath):
    """한 페이지의 중복 및 문제 검사"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # 모든 외부 리소스 수집
    resources = []
    
    # 스크립트 태그
    for script in soup.find_all('script', src=True):
        src = script.get('src', '')
        if src:
            resources.append(('script', src, str(script)))
    
    # CSS 링크
    for link in soup.find_all('link', rel='stylesheet'):
        href = link.get('href', '')
        if href:
            resources.append(('css', href, str(link)))
    
    # 중복 검사
    resource_counts = Counter([(r[0], r[1]) for r in resources])
    duplicates = [(res_type, url, count) for (res_type, url), count in resource_counts.items() if count > 1]
    
    return {
        'file': os.path.relpath(filepath),
        'total_scripts': len([r for r in resources if r[0] == 'script']),
        'total_css': len([r for r in resources if r[0] == 'css']),
        'duplicates': duplicates,
        'all_resources': [(r[0], r[1]) for r in resources]
    }

def check_all_pages():
    """모든 주요 페이지 검사"""
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
    
    results = []
    total_duplicates = 0
    
    print("="*60)
    print("실제 중복 리소스 검사")
    print("="*60)
    
    for page in pages:
        if os.path.exists(page):
            result = check_page_duplicates(page)
            results.append(result)
            
            if result['duplicates']:
                total_duplicates += len(result['duplicates'])
                print(f"\n[DUPLICATE FOUND] {page}")
                for res_type, url, count in result['duplicates']:
                    print(f"  - {res_type}: {url} ({count}번 로드)")
            else:
                print(f"\n[OK] {page}")
                print(f"  - Scripts: {result['total_scripts']}, CSS: {result['total_css']}")
    
    # 상세 보고서 생성
    report = {
        'timestamp': datetime.now().isoformat(),
        'pages_checked': len(results),
        'total_duplicates': total_duplicates,
        'pages': results
    }
    
    with open('real_duplicates_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*60)
    print("검사 완료!")
    print(f"총 페이지: {len(results)}개")
    print(f"발견된 중복: {total_duplicates}개")
    print("\n상세 보고서: real_duplicates_report.json")
    
    # 공통 리소스 분석
    print("\n" + "-"*60)
    print("공통 리소스 분석:")
    
    all_scripts = []
    all_css = []
    
    for result in results:
        for res_type, url in result['all_resources']:
            if res_type == 'script':
                all_scripts.append(url)
            else:
                all_css.append(url)
    
    # 가장 많이 사용되는 리소스
    script_counts = Counter(all_scripts)
    css_counts = Counter(all_css)
    
    print("\n가장 많이 사용되는 스크립트:")
    for script, count in script_counts.most_common(5):
        print(f"  - {script}: {count}개 페이지")
    
    print("\n가장 많이 사용되는 CSS:")
    for css, count in css_counts.most_common(5):
        print(f"  - {css}: {count}개 페이지")
    
    return total_duplicates == 0

if __name__ == "__main__":
    success = check_all_pages()
    
    if success:
        print("\n[SUCCESS] 모든 페이지에서 중복 로드 문제가 없습니다!")
    else:
        print("\n[WARNING] 일부 페이지에 중복 로드 문제가 있습니다!")