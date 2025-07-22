#!/usr/bin/env python3
"""
26개 주요 페이지 완벽 검증 스크립트
CSS, 레이아웃, 중복 정의, 기능 등 모든 것을 체크
"""

import os
import re
import json
from collections import defaultdict

# 26개 주요 페이지 목록
MAIN_PAGES = [
    "index.html",
    "404.html",
    "about/index.html",
    "contact/index.html",
    "privacy/index.html",
    "terms/index.html",
    "faq/index.html",
    # 심리테스트
    "tests/index.html",
    "tests/mbti/index.html",
    "tests/mbti/test.html",
    "tests/teto-egen/index.html", 
    "tests/teto-egen/start.html",
    "tests/teto-egen/test.html",
    "tests/love-dna/index.html",
    "tests/love-dna/test.html",
    # 실용도구
    "tools/index.html",
    "tools/text-counter.html",
    "tools/bmi-calculator.html",
    "tools/salary-calculator.html",
    # AI 운세
    "fortune/index.html",
    "fortune/daily/index.html",
    "fortune/saju/index.html",
    "fortune/tarot/index.html",
    "fortune/zodiac/index.html",
    "fortune/zodiac-animal/index.html"
]

def check_page_issues(file_path):
    """페이지의 모든 문제점 체크"""
    issues = {
        'css_issues': [],
        'js_issues': [],
        'duplicate_definitions': [],
        'layout_issues': [],
        'missing_features': [],
        'console_errors': [],
        'accessibility': [],
        'seo_issues': []
    }
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. CSS 문제 체크
        # 인라인 스타일 체크
        inline_styles = len(re.findall(r'style=["\'](.*?)["\']', content))
        if inline_styles > 5:
            issues['css_issues'].append(f"과도한 인라인 스타일 사용: {inline_styles}개")
        
        # CSS 파일 로드 확인
        css_files = re.findall(r'<link[^>]*href=["\'](.*?\.css.*?)["\']', content)
        if not any('styles.css' in css for css in css_files):
            issues['css_issues'].append("메인 styles.css가 로드되지 않음")
        
        # 중복 CSS 파일 체크
        css_counts = defaultdict(int)
        for css in css_files:
            base_css = css.split('?')[0]
            css_counts[base_css] += 1
        for css, count in css_counts.items():
            if count > 1:
                issues['duplicate_definitions'].append(f"CSS 중복 로드: {css} ({count}회)")
        
        # 2. JavaScript 문제 체크
        # 중복 스크립트 체크
        script_files = re.findall(r'<script[^>]*src=["\'](.*?)["\']', content)
        script_counts = defaultdict(int)
        for script in script_files:
            base_script = script.split('?')[0]
            script_counts[base_script] += 1
        for script, count in script_counts.items():
            if count > 1:
                issues['duplicate_definitions'].append(f"JS 중복 로드: {script} ({count}회)")
        
        # 필수 스크립트 체크
        if 'navbar-placeholder' in content or 'footer-placeholder' in content:
            if not any('main.js' in s for s in script_files):
                issues['js_issues'].append("main.js 누락 - 네비게이션/푸터 로드 불가")
            if not any('api-config.js' in s for s in script_files):
                issues['js_issues'].append("api-config.js 누락 - API 기능 불가")
        
        # 3. 레이아웃 문제 체크
        # viewport 메타태그
        if not re.search(r'<meta[^>]*name=["\']*viewport["\']*', content):
            issues['layout_issues'].append("viewport 메타태그 누락 - 모바일 반응형 문제")
        
        # 컨테이너 구조
        if '<div class="container">' not in content and '<section' not in content:
            issues['layout_issues'].append("적절한 컨테이너 구조 없음")
        
        # 4. 기능 체크
        # 네비게이션/푸터
        if 'navbar-placeholder' in content and 'loadComponents' not in content:
            issues['missing_features'].append("네비게이션 로드 함수 누락")
        
        # 카카오 공유
        if any(btn in content for btn in ['shareKakao', 'share-kakao', '카카오톡']):
            if not any('kakao' in s.lower() for s in script_files):
                issues['missing_features'].append("카카오 SDK 누락 - 공유 기능 불가")
        
        # 5. SEO 체크
        if not re.search(r'<title>', content):
            issues['seo_issues'].append("title 태그 누락")
        if not re.search(r'<meta[^>]*name=["\']*description["\']*', content):
            issues['seo_issues'].append("description 메타태그 누락")
        
        # 6. 접근성 체크
        # 이미지 alt 텍스트
        imgs_without_alt = len(re.findall(r'<img(?![^>]*alt=)[^>]*>', content))
        if imgs_without_alt > 0:
            issues['accessibility'].append(f"alt 텍스트 없는 이미지: {imgs_without_alt}개")
        
        # 폼 라벨
        if '<input' in content:
            inputs = len(re.findall(r'<input[^>]*>', content))
            labels = len(re.findall(r'<label', content))
            if inputs > labels:
                issues['accessibility'].append(f"라벨 없는 입력 필드 가능성: {inputs - labels}개")
        
    except Exception as e:
        issues['console_errors'].append(f"파일 읽기 오류: {str(e)}")
    
    return issues

def generate_detailed_report():
    """26개 페이지 상세 검증 리포트"""
    print("=" * 80)
    print("🔍 doha.kr 26개 주요 페이지 완벽 검증 리포트")
    print("=" * 80)
    
    all_results = {}
    total_issues = 0
    perfect_pages = []
    problematic_pages = []
    
    for page in MAIN_PAGES:
        if os.path.exists(page):
            issues = check_page_issues(page)
            all_results[page] = issues
            
            # 문제 개수 계산
            page_issue_count = sum(len(v) for v in issues.values())
            total_issues += page_issue_count
            
            if page_issue_count == 0:
                perfect_pages.append(page)
            else:
                problematic_pages.append((page, page_issue_count))
            
            # 페이지별 결과 출력
            if page_issue_count > 0:
                print(f"\n❌ {page} - {page_issue_count}개 문제")
                for category, items in issues.items():
                    if items:
                        print(f"  [{category}]")
                        for item in items[:3]:  # 처음 3개만 표시
                            print(f"    • {item}")
        else:
            print(f"\n⚠️  {page} - 파일 없음")
    
    # 요약
    print("\n" + "=" * 80)
    print("📊 검증 결과 요약")
    print("=" * 80)
    print(f"✅ 완벽한 페이지: {len(perfect_pages)}개")
    print(f"❌ 문제 있는 페이지: {len(problematic_pages)}개")
    print(f"🚨 총 문제 개수: {total_issues}개")
    
    # 가장 문제가 많은 페이지
    if problematic_pages:
        print("\n🚨 가장 문제가 많은 페이지 TOP 5:")
        sorted_pages = sorted(problematic_pages, key=lambda x: x[1], reverse=True)
        for page, count in sorted_pages[:5]:
            print(f"  • {page}: {count}개 문제")
    
    # 카테고리별 문제 요약
    category_summary = defaultdict(int)
    for page_issues in all_results.values():
        for category, items in page_issues.items():
            category_summary[category] += len(items)
    
    print("\n📈 카테고리별 문제 분포:")
    for category, count in sorted(category_summary.items(), key=lambda x: x[1], reverse=True):
        if count > 0:
            print(f"  • {category}: {count}개")
    
    # JSON 저장
    with open('26page_verification_report.json', 'w', encoding='utf-8') as f:
        json.dump({
            'summary': {
                'total_pages': len(MAIN_PAGES),
                'perfect_pages': len(perfect_pages),
                'problematic_pages': len(problematic_pages),
                'total_issues': total_issues
            },
            'perfect_pages': perfect_pages,
            'problematic_pages': dict(problematic_pages),
            'detailed_results': all_results,
            'category_summary': dict(category_summary)
        }, f, ensure_ascii=False, indent=2)
    
    print("\n📁 상세 리포트가 26page_verification_report.json에 저장되었습니다.")

if __name__ == "__main__":
    import sys
    import io
    
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    generate_detailed_report()