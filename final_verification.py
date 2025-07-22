#!/usr/bin/env python3
"""
doha.kr 최종 검증 스크립트
모든 수정사항 적용 후 최종 상태 확인
"""

import os
import re
import json
from datetime import datetime

def final_verification():
    """최종 검증 수행"""
    
    # 26개 주요 페이지
    pages = [
        "index.html", "404.html", "about/index.html", "contact/index.html",
        "privacy/index.html", "terms/index.html", "faq/index.html",
        "tests/index.html", "tests/mbti/index.html", "tests/mbti/test.html",
        "tests/teto-egen/index.html", "tests/teto-egen/start.html", "tests/teto-egen/test.html",
        "tests/love-dna/index.html", "tests/love-dna/test.html",
        "tools/index.html", "tools/text-counter.html", "tools/bmi-calculator.html",
        "tools/salary-calculator.html", "fortune/index.html", "fortune/daily/index.html",
        "fortune/saju/index.html", "fortune/tarot/index.html", "fortune/zodiac/index.html",
        "fortune/zodiac-animal/index.html"
    ]
    
    results = {
        'timestamp': datetime.now().isoformat(),
        'total_pages': len(pages),
        'passed_pages': 0,
        'issues': [],
        'statistics': {
            'css_loaded': 0,
            'js_loaded': 0,
            'kakao_sdk': 0,
            'navigation': 0,
            'mobile_css': 0,
            'button_css': 0,
            'inline_styles': 0
        }
    }
    
    print("=" * 80)
    print("🔍 doha.kr 최종 검증")
    print("=" * 80)
    print(f"검증 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    for page in pages:
        if os.path.exists(page):
            with open(page, 'r', encoding='utf-8') as f:
                content = f.read()
            
            page_issues = []
            
            # CSS 체크
            if '/css/styles.css' in content:
                results['statistics']['css_loaded'] += 1
            else:
                page_issues.append("메인 CSS 누락")
            
            if '/css/mobile-fixes.css' in content:
                results['statistics']['mobile_css'] += 1
            else:
                page_issues.append("모바일 CSS 누락")
            
            if '/css/button-system.css' in content:
                results['statistics']['button_css'] += 1
            else:
                page_issues.append("버튼 시스템 CSS 누락")
            
            # JS 체크
            if '/js/main.js' in content and '/js/api-config.js' in content:
                results['statistics']['js_loaded'] += 1
            else:
                page_issues.append("필수 JS 누락")
            
            # 카카오 SDK
            if 'kakao_js_sdk/2.7.4' in content:
                results['statistics']['kakao_sdk'] += 1
            else:
                page_issues.append("카카오 SDK 누락")
            
            # 네비게이션
            if 'navbar-placeholder' in content and 'loadComponents' in content:
                results['statistics']['navigation'] += 1
            elif 'navbar-placeholder' not in content:
                # 404 페이지 등은 네비게이션 없을 수 있음
                pass
            else:
                page_issues.append("네비게이션 로드 누락")
            
            # 인라인 스타일 체크
            inline_count = len(re.findall(r'style=["\'](.*?)["\']', content))
            if inline_count <= 5:
                results['statistics']['inline_styles'] += 1
            else:
                page_issues.append(f"과도한 인라인 스타일: {inline_count}개")
            
            # 중복 체크
            css_files = re.findall(r'<link[^>]*href=["\'](.*?\.css.*?)["\']', content)
            css_base = [f.split('?')[0] for f in css_files]
            if len(css_base) != len(set(css_base)):
                page_issues.append("CSS 중복 로드")
            
            js_files = re.findall(r'<script[^>]*src=["\'](.*?)["\']', content)
            js_base = [f.split('?')[0] for f in js_files]
            if len(js_base) != len(set(js_base)):
                page_issues.append("JS 중복 로드")
            
            if page_issues:
                results['issues'].append({
                    'page': page,
                    'issues': page_issues
                })
                print(f"❌ {page}: {len(page_issues)}개 문제")
                for issue in page_issues:
                    print(f"   • {issue}")
            else:
                results['passed_pages'] += 1
                print(f"✅ {page}: 정상")
    
    # 통계
    print("\n" + "=" * 80)
    print("📊 최종 통계")
    print("=" * 80)
    print(f"전체 페이지: {results['total_pages']}개")
    print(f"정상 페이지: {results['passed_pages']}개")
    print(f"문제 페이지: {results['total_pages'] - results['passed_pages']}개")
    print(f"통과율: {(results['passed_pages'] / results['total_pages'] * 100):.1f}%")
    print()
    print("세부 통계:")
    print(f"  • CSS 로드: {results['statistics']['css_loaded']}/{results['total_pages']}")
    print(f"  • 모바일 CSS: {results['statistics']['mobile_css']}/{results['total_pages']}")
    print(f"  • 버튼 CSS: {results['statistics']['button_css']}/{results['total_pages']}")
    print(f"  • JS 로드: {results['statistics']['js_loaded']}/{results['total_pages']}")
    print(f"  • 카카오 SDK: {results['statistics']['kakao_sdk']}/{results['total_pages']}")
    print(f"  • 네비게이션: {results['statistics']['navigation']}/{results['total_pages']-1}")  # 404 제외
    print(f"  • 인라인 스타일 적정: {results['statistics']['inline_styles']}/{results['total_pages']}")
    
    # 결과 저장
    with open('final_verification_report.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print("\n📁 최종 검증 리포트가 final_verification_report.json에 저장되었습니다.")
    
    return results

if __name__ == "__main__":
    import sys
    import io
    
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    final_verification()