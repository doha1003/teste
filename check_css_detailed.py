#!/usr/bin/env python3
"""
모든 페이지의 CSS 포함 상태를 자세히 확인하는 스크립트
"""

import os
import re
from datetime import datetime
import json

# 모든 HTML 페이지 정의
PAGES = [
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
    'tools/text-counter.html'
]

def find_all_css_links(content):
    """모든 CSS 링크 찾기"""
    css_pattern = r'<link[^>]+href=["\']([^"\']+\.css[^"\']*)["\'][^>]*>'
    matches = re.findall(css_pattern, content, re.IGNORECASE)
    return matches

def check_page_css(page_path):
    """페이지의 CSS 상태 확인"""
    try:
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 모든 CSS 링크 찾기
        css_links = find_all_css_links(content)
        
        # 특정 CSS 파일 확인
        has_styles = any('styles.css' in link or 'styles.min.css' in link for link in css_links)
        has_mobile = any('mobile-fixes.css' in link or 'mobile-fixes.min.css' in link for link in css_links)
        has_button = any('button-system.css' in link or 'button-system.min.css' in link for link in css_links)
        
        return {
            'exists': True,
            'all_css_links': css_links,
            'has_styles': has_styles,
            'has_mobile': has_mobile,
            'has_button': has_button,
            'needs_update': has_styles and (not has_mobile or not has_button)
        }
    except FileNotFoundError:
        return {
            'exists': False,
            'error': 'File not found'
        }
    except Exception as e:
        return {
            'exists': False,
            'error': str(e)
        }

def main():
    """메인 실행 함수"""
    print("CSS 파일 포함 상태 자세히 확인")
    print("="*80)
    
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_pages': len(PAGES),
        'pages_needing_update': [],
        'pages_ok': [],
        'pages_error': [],
        'details': {}
    }
    
    for page in PAGES:
        page_path = os.path.join('C:\\Users\\pc\\teste', page)
        result = check_page_css(page_path)
        
        print(f"\n{page}:")
        
        if not result['exists']:
            print(f"  X 오류: {result.get('error', 'Unknown error')}")
            report['pages_error'].append(page)
        else:
            print(f"  CSS 파일들:")
            for css in result['all_css_links']:
                print(f"    - {css}")
            
            print(f"  상태:")
            print(f"    styles.css: {'YES' if result['has_styles'] else 'NO'}")
            print(f"    mobile-fixes.css: {'YES' if result['has_mobile'] else 'NO'}")
            print(f"    button-system.css: {'YES' if result['has_button'] else 'NO'}")
            
            if result['needs_update']:
                print(f"  -> 업데이트 필요!")
                report['pages_needing_update'].append(page)
            else:
                report['pages_ok'].append(page)
        
        report['details'][page] = result
    
    # 요약 출력
    print("\n" + "="*80)
    print("요약:")
    print(f"  총 페이지: {report['total_pages']}")
    print(f"  정상: {len(report['pages_ok'])}")
    print(f"  업데이트 필요: {len(report['pages_needing_update'])}")
    print(f"  오류: {len(report['pages_error'])}")
    
    if report['pages_needing_update']:
        print(f"\n업데이트가 필요한 페이지:")
        for page in report['pages_needing_update']:
            print(f"  - {page}")
    
    # 리포트 저장
    with open('css_detailed_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n상세 리포트 저장됨: css_detailed_report.json")

if __name__ == "__main__":
    main()