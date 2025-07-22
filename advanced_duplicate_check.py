#!/usr/bin/env python3
"""
더 정밀한 중복 스크립트와 CSS 검사 및 제거
- 같은 파일의 다른 버전 (예: .js와 .min.js)
- 인라인 스크립트 중복
- 동일한 기능의 다른 라이브러리
"""

import os
import re
from bs4 import BeautifulSoup
from collections import defaultdict
import json
from datetime import datetime
import hashlib

def get_all_html_files():
    """모든 HTML 파일을 찾아서 반환"""
    html_files = []
    exclude_dirs = ['node_modules', 'dist', 'development', 'reports', 'sample_screenshots', '.git']
    
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file.endswith('.html') and not file.endswith('.backup'):
                html_files.append(os.path.join(root, file))
    
    return html_files

def normalize_url(url):
    """URL 정규화 (같은 파일의 다른 버전 감지)"""
    # 쿼리 스트링 제거
    url = re.sub(r'\?.*$', '', url)
    # .min.js -> .js로 변환
    url = re.sub(r'\.min\.(js|css)$', r'.\1', url)
    return url

def get_inline_script_hash(script_tag):
    """인라인 스크립트의 해시 생성"""
    if script_tag.string:
        # 공백 정규화
        content = re.sub(r'\s+', ' ', script_tag.string.strip())
        return hashlib.md5(content.encode()).hexdigest()
    return None

def check_advanced_duplicates(filepath):
    """고급 중복 검사"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    report = {
        'file': os.path.relpath(filepath),
        'exact_duplicates': [],
        'version_duplicates': [],
        'inline_duplicates': [],
        'potential_conflicts': []
    }
    
    # 1. 정확한 중복 검사
    resources = defaultdict(list)
    for tag in soup.find_all(['script', 'link']):
        if tag.name == 'script' and tag.get('src'):
            resources[('script', tag['src'])].append(tag)
        elif tag.name == 'link' and tag.get('rel') == ['stylesheet'] and tag.get('href'):
            resources[('css', tag['href'])].append(tag)
    
    for (res_type, url), tags in resources.items():
        if len(tags) > 1:
            report['exact_duplicates'].append({
                'type': res_type,
                'url': url,
                'count': len(tags)
            })
    
    # 2. 버전 중복 검사 (.js와 .min.js)
    normalized_resources = defaultdict(list)
    for (res_type, url), tags in resources.items():
        normalized_url = normalize_url(url)
        normalized_resources[(res_type, normalized_url)].extend([(url, tags)])
    
    for (res_type, norm_url), url_list in normalized_resources.items():
        if len(url_list) > 1:
            urls = [url for url, _ in url_list]
            if urls[0] != urls[-1]:  # 실제로 다른 버전인 경우
                report['version_duplicates'].append({
                    'type': res_type,
                    'normalized_url': norm_url,
                    'versions': urls
                })
    
    # 3. 인라인 스크립트 중복 검사
    inline_scripts = defaultdict(list)
    for script in soup.find_all('script'):
        if not script.get('src') and script.string:
            hash_val = get_inline_script_hash(script)
            if hash_val:
                inline_scripts[hash_val].append(script)
    
    for hash_val, scripts in inline_scripts.items():
        if len(scripts) > 1:
            preview = scripts[0].string[:100].strip() if scripts[0].string else ""
            report['inline_duplicates'].append({
                'count': len(scripts),
                'preview': preview + "..." if len(preview) == 100 else preview
            })
    
    # 4. 잠재적 충돌 검사 (같은 기능의 다른 라이브러리)
    script_urls = [url for (res_type, url), _ in resources.items() if res_type == 'script']
    
    # jQuery 여러 버전
    jquery_versions = [url for url in script_urls if 'jquery' in url.lower()]
    if len(jquery_versions) > 1:
        report['potential_conflicts'].append({
            'type': 'multiple_jquery',
            'urls': jquery_versions
        })
    
    # 분석 도구 중복 (Google Analytics, GTM 등)
    ga_scripts = [url for url in script_urls if 'google-analytics' in url or 'gtag' in url]
    if len(ga_scripts) > 1:
        report['potential_conflicts'].append({
            'type': 'multiple_analytics',
            'urls': ga_scripts
        })
    
    return report

def analyze_all_files():
    """모든 파일 분석"""
    html_files = get_all_html_files()
    timestamp = datetime.now().isoformat()
    
    print(f"고급 중복 검사 시작 - {len(html_files)}개 파일 분석 중...")
    
    all_reports = []
    files_with_issues = 0
    
    for filepath in html_files:
        report = check_advanced_duplicates(filepath)
        
        # 문제가 있는 경우만 기록
        has_issues = (
            report['exact_duplicates'] or 
            report['version_duplicates'] or 
            report['inline_duplicates'] or 
            report['potential_conflicts']
        )
        
        if has_issues:
            all_reports.append(report)
            files_with_issues += 1
            print(f"\n[ISSUE] {report['file']}:")
            
            if report['exact_duplicates']:
                print(f"  - 정확한 중복: {len(report['exact_duplicates'])}개")
                for dup in report['exact_duplicates']:
                    print(f"    * {dup['type']}: {dup['url']} ({dup['count']}번)")
            
            if report['version_duplicates']:
                print(f"  - 버전 중복: {len(report['version_duplicates'])}개")
                for dup in report['version_duplicates']:
                    print(f"    * {dup['type']}: {', '.join(dup['versions'])}")
            
            if report['inline_duplicates']:
                print(f"  - 인라인 스크립트 중복: {len(report['inline_duplicates'])}개")
                for dup in report['inline_duplicates']:
                    print(f"    * {dup['count']}번 중복: {dup['preview'][:50]}...")
            
            if report['potential_conflicts']:
                print(f"  - 잠재적 충돌: {len(report['potential_conflicts'])}개")
                for conflict in report['potential_conflicts']:
                    print(f"    * {conflict['type']}: {len(conflict['urls'])}개 파일")
    
    # 전체 보고서 생성
    final_report = {
        'timestamp': timestamp,
        'total_files': len(html_files),
        'files_with_issues': files_with_issues,
        'issue_summary': {
            'exact_duplicates': sum(len(r['exact_duplicates']) for r in all_reports),
            'version_duplicates': sum(len(r['version_duplicates']) for r in all_reports),
            'inline_duplicates': sum(len(r['inline_duplicates']) for r in all_reports),
            'potential_conflicts': sum(len(r['potential_conflicts']) for r in all_reports)
        },
        'details': all_reports
    }
    
    # 보고서 저장
    with open('advanced_duplicate_report.json', 'w', encoding='utf-8') as f:
        json.dump(final_report, f, indent=2, ensure_ascii=False)
    
    # 요약 출력
    print("\n" + "="*60)
    print("고급 중복 검사 완료!")
    print("="*60)
    print(f"총 검사 파일: {final_report['total_files']}개")
    print(f"문제가 있는 파일: {final_report['files_with_issues']}개")
    print(f"\n발견된 문제:")
    print(f"  - 정확한 중복: {final_report['issue_summary']['exact_duplicates']}개")
    print(f"  - 버전 중복: {final_report['issue_summary']['version_duplicates']}개")
    print(f"  - 인라인 스크립트 중복: {final_report['issue_summary']['inline_duplicates']}개")
    print(f"  - 잠재적 충돌: {final_report['issue_summary']['potential_conflicts']}개")
    print(f"\n상세 보고서: advanced_duplicate_report.json")
    
    return final_report

def check_25_pages():
    """주요 25개 페이지만 확인"""
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
    
    print("\n25개 주요 페이지 검사 중...")
    issues_found = False
    
    for page in pages:
        if os.path.exists(page):
            report = check_advanced_duplicates(page)
            has_issues = (
                report['exact_duplicates'] or 
                report['version_duplicates'] or 
                report['inline_duplicates'] or 
                report['potential_conflicts']
            )
            
            if has_issues:
                issues_found = True
                print(f"\n[ISSUE] {page}")
                if report['exact_duplicates']:
                    for dup in report['exact_duplicates']:
                        print(f"  - {dup['type']} 중복: {dup['url']}")
        else:
            print(f"\n[NOT FOUND] {page}")
    
    if not issues_found:
        print("\n[SUCCESS] 25개 페이지에서 중복 문제가 발견되지 않았습니다!")
    
    return not issues_found

if __name__ == "__main__":
    # 전체 분석
    print("="*60)
    print("고급 중복 검사 도구")
    print("="*60)
    
    # 전체 파일 분석
    final_report = analyze_all_files()
    
    # 25개 주요 페이지 확인
    print("\n" + "-"*60)
    check_25_pages()