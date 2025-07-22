#!/usr/bin/env python3
"""
최종 중복 검사 - 모든 가능한 중복 패턴 검사
"""

import os
import re
from bs4 import BeautifulSoup, Comment
from collections import defaultdict
import json
from datetime import datetime

def deep_duplicate_check(filepath):
    """깊은 중복 검사"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    issues = []
    
    # 1. 외부 리소스 중복 검사
    scripts = soup.find_all('script', src=True)
    css_links = soup.find_all('link', rel='stylesheet')
    
    # URL 정규화하여 검사
    script_urls = defaultdict(list)
    css_urls = defaultdict(list)
    
    for script in scripts:
        src = script.get('src', '').strip()
        if src:
            # 쿼리 파라미터 제거하여 비교
            normalized = re.sub(r'\?.*$', '', src)
            script_urls[normalized].append(src)
    
    for link in css_links:
        href = link.get('href', '').strip()
        if href:
            normalized = re.sub(r'\?.*$', '', href)
            css_urls[normalized].append(href)
    
    # 같은 파일의 다른 버전 확인
    for normalized, urls in script_urls.items():
        if len(urls) > 1:
            issues.append({
                'type': 'script_version_duplicate',
                'file': normalized,
                'versions': urls
            })
    
    for normalized, urls in css_urls.items():
        if len(urls) > 1:
            issues.append({
                'type': 'css_version_duplicate', 
                'file': normalized,
                'versions': urls
            })
    
    # 2. 인라인 스크립트/스타일 중복
    inline_scripts = soup.find_all('script', src=False)
    inline_styles = soup.find_all('style')
    
    # 인라인 스크립트 내용 비교
    script_contents = defaultdict(int)
    for script in inline_scripts:
        if script.string:
            content = script.string.strip()
            if content and len(content) > 50:  # 의미있는 크기만
                script_contents[content[:100]] += 1
    
    for content, count in script_contents.items():
        if count > 1:
            issues.append({
                'type': 'inline_script_duplicate',
                'preview': content[:50] + '...',
                'count': count
            })
    
    # 3. 메타 태그 중복
    meta_tags = soup.find_all('meta')
    meta_dict = defaultdict(list)
    
    for meta in meta_tags:
        if meta.get('name'):
            key = ('name', meta.get('name'))
        elif meta.get('property'):
            key = ('property', meta.get('property'))
        else:
            continue
        meta_dict[key].append(meta)
    
    for key, tags in meta_dict.items():
        if len(tags) > 1:
            issues.append({
                'type': 'meta_duplicate',
                'key': f"{key[0]}={key[1]}",
                'count': len(tags)
            })
    
    # 4. 주석 내 스크립트/링크 (비활성화된 중복)
    comments = soup.find_all(string=lambda text: isinstance(text, Comment))
    commented_resources = []
    
    for comment in comments:
        if '<script' in comment or '<link' in comment:
            commented_resources.append(comment.strip()[:100])
    
    if commented_resources:
        issues.append({
            'type': 'commented_resources',
            'count': len(commented_resources),
            'examples': commented_resources[:3]
        })
    
    return {
        'file': os.path.relpath(filepath),
        'issues': issues,
        'stats': {
            'total_scripts': len(scripts),
            'total_css': len(css_links),
            'inline_scripts': len(inline_scripts),
            'meta_tags': len(meta_tags)
        }
    }

def final_duplicate_check():
    """최종 중복 검사"""
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
    print("최종 중복 검사 시작")
    print("="*60)
    
    all_results = []
    pages_with_issues = 0
    total_issues = 0
    
    for page in pages:
        if os.path.exists(page):
            result = deep_duplicate_check(page)
            all_results.append(result)
            
            if result['issues']:
                pages_with_issues += 1
                total_issues += len(result['issues'])
                
                print(f"\n[ISSUES FOUND] {page}")
                for issue in result['issues']:
                    if issue['type'] == 'script_version_duplicate':
                        print(f"  - 스크립트 버전 중복: {issue['file']}")
                        for v in issue['versions']:
                            print(f"    * {v}")
                    elif issue['type'] == 'css_version_duplicate':
                        print(f"  - CSS 버전 중복: {issue['file']}")
                        for v in issue['versions']:
                            print(f"    * {v}")
                    elif issue['type'] == 'inline_script_duplicate':
                        print(f"  - 인라인 스크립트 중복 ({issue['count']}번): {issue['preview']}")
                    elif issue['type'] == 'meta_duplicate':
                        print(f"  - 메타 태그 중복: {issue['key']} ({issue['count']}개)")
                    elif issue['type'] == 'commented_resources':
                        print(f"  - 주석 처리된 리소스: {issue['count']}개")
            else:
                print(f"[CLEAN] {page} - Scripts: {result['stats']['total_scripts']}, CSS: {result['stats']['total_css']}")
    
    # 최종 보고서
    report = {
        'timestamp': datetime.now().isoformat(),
        'pages_checked': len(all_results),
        'pages_with_issues': pages_with_issues,
        'total_issues': total_issues,
        'results': all_results
    }
    
    with open('complete_duplicate_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*60)
    print("최종 검사 완료!")
    print("="*60)
    print(f"검사한 페이지: {len(all_results)}개")
    print(f"문제가 있는 페이지: {pages_with_issues}개")
    print(f"총 발견된 문제: {total_issues}개")
    print("\n상세 보고서: complete_duplicate_report.json")
    
    if pages_with_issues == 0:
        print("\n[SUCCESS] 모든 페이지가 깨끗합니다! 중복 문제가 없습니다.")
    else:
        print("\n[INFO] 일부 페이지에서 잠재적 문제가 발견되었습니다.")
    
    return pages_with_issues == 0

if __name__ == "__main__":
    success = final_duplicate_check()
    
    if not success:
        print("\n다음 단계:")
        print("1. complete_duplicate_report.json 파일을 확인하세요")
        print("2. 발견된 문제들을 검토하고 필요한 경우 수정하세요")
        print("3. 주석 처리된 리소스는 제거를 고려하세요")