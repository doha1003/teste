#!/usr/bin/env python3
"""
전체 사이트 포괄적 검증 스크립트
- 모든 HTML 페이지 확인
- 카카오 API 설정 상태 확인
- 주요 기능 및 링크 검증
"""

import os
import re
import json
from pathlib import Path

def find_all_html_pages():
    """모든 HTML 페이지 찾기"""
    html_pages = []
    
    # 주요 디렉토리 구조 매핑
    important_pages = [
        "index.html",  # 메인 페이지
        "404.html",
        "about/index.html",
        "contact/index.html",
        "privacy/index.html", 
        "terms/index.html",
        # 심리테스트
        "tests/index.html",
        "tests/mbti/index.html",
        "tests/teto-egen/index.html", 
        "tests/love-dna/index.html",
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
    
    # 실제 존재하는 파일만 확인
    existing_pages = []
    for page in important_pages:
        if os.path.exists(page):
            existing_pages.append(page)
        else:
            print(f"⚠️  중요 페이지 누락: {page}")
    
    # 추가로 HTML 파일들 전체 스캔
    for root, dirs, files in os.walk('.'):
        # 제외할 디렉토리
        dirs[:] = [d for d in dirs if d not in {'node_modules', '.git', 'teste_repo', 'development'}]
        
        for file in files:
            if file.endswith('.html'):
                full_path = os.path.join(root, file).replace('\\', '/').lstrip('./')
                if full_path not in existing_pages:
                    existing_pages.append(full_path)
    
    return sorted(existing_pages)

def check_kakao_api_setup(content):
    """카카오 API 설정 확인"""
    issues = []
    
    # 카카오 SDK 스크립트 확인
    if 'developers.kakao.com' not in content:
        issues.append("카카오 SDK 스크립트가 없습니다")
    
    # api-config.js 확인
    if 'api-config.js' not in content:
        issues.append("api-config.js가 로드되지 않습니다")
    
    # 카카오 초기화 관련
    if 'initKakao' not in content and 'Kakao.init' not in content:
        issues.append("카카오 초기화 코드가 없습니다")
    
    return issues

def check_essential_files(content, file_path):
    """필수 파일 참조 확인"""
    issues = []
    
    # CSS 파일 확인
    if '/css/styles.css' not in content:
        issues.append("메인 CSS 파일(styles.css)이 로드되지 않습니다")
    
    # 네비게이션/푸터가 있는 페이지에서 main.js 확인
    if ('navbar-placeholder' in content or 'footer-placeholder' in content):
        if 'main.js' not in content:
            issues.append("네비게이션/푸터가 있지만 main.js가 없습니다")
    
    # 특정 페이지별 필수 스크립트 확인
    if 'fortune/saju' in file_path:
        if 'manseryeok-database.js' not in content:
            issues.append("사주 페이지에 만세력 데이터베이스가 없습니다")
    
    if 'tests/mbti' in file_path:
        if 'mbti-test' not in content:
            issues.append("MBTI 테스트 스크립트가 없습니다")
    
    return issues

def check_page_structure(content):
    """페이지 기본 구조 확인"""
    issues = []
    
    # 기본 HTML 구조
    if not re.search(r'<!DOCTYPE html>', content, re.IGNORECASE):
        issues.append("DOCTYPE 선언이 없습니다")
    
    if not re.search(r'<meta[^>]*charset', content, re.IGNORECASE):
        issues.append("charset 메타태그가 없습니다")
    
    if not re.search(r'<meta[^>]*viewport', content, re.IGNORECASE):
        issues.append("viewport 메타태그가 없습니다")
    
    if not re.search(r'<title>', content, re.IGNORECASE):
        issues.append("title 태그가 없습니다")
    
    return issues

def analyze_single_page(file_path):
    """단일 페이지 분석"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {
            'file': file_path,
            'status': 'error',
            'issues': [f"파일 읽기 오류: {str(e)}"]
        }
    
    issues = []
    
    # 각종 검사 실행
    issues.extend(check_page_structure(content))
    issues.extend(check_essential_files(content, file_path))
    issues.extend(check_kakao_api_setup(content))
    
    return {
        'file': file_path,
        'status': 'ok' if not issues else 'issues',
        'issues': issues,
        'has_kakao': 'developers.kakao.com' in content,
        'has_main_js': 'main.js' in content,
        'has_api_config': 'api-config.js' in content
    }

def generate_comprehensive_report():
    """포괄적 리포트 생성"""
    print("=" * 70)
    print("🔍 doha.kr 전체 사이트 포괄적 검증")
    print("=" * 70)
    
    # 모든 페이지 찾기
    pages = find_all_html_pages()
    print(f"📄 총 {len(pages)}개 페이지 발견")
    print()
    
    # 각 페이지 분석
    results = []
    ok_count = 0
    issue_count = 0
    
    for page in pages:
        result = analyze_single_page(page)
        results.append(result)
        
        if result['status'] == 'ok':
            ok_count += 1
            print(f"✅ {page}")
        else:
            issue_count += 1
            print(f"❌ {page}")
            for issue in result['issues']:
                print(f"   ⚠️  {issue}")
    
    print()
    print("=" * 70)
    print("📊 검증 결과 요약")
    print("=" * 70)
    print(f"✅ 정상 페이지: {ok_count}개")
    print(f"❌ 문제 있는 페이지: {issue_count}개")
    print(f"📈 전체 정상률: {(ok_count / len(pages) * 100):.1f}%")
    
    # 카카오 API 설정 상태 요약
    kakao_pages = sum(1 for r in results if r.get('has_kakao', False))
    print(f"🔗 카카오 SDK 있는 페이지: {kakao_pages}개")
    
    # 주요 이슈 패턴 분석
    print()
    print("🚨 주요 문제 패턴:")
    all_issues = []
    for result in results:
        all_issues.extend(result.get('issues', []))
    
    issue_count_map = {}
    for issue in all_issues:
        issue_count_map[issue] = issue_count_map.get(issue, 0) + 1
    
    for issue, count in sorted(issue_count_map.items(), key=lambda x: x[1], reverse=True):
        if count > 1:
            print(f"   • {issue}: {count}회")
    
    # JSON 파일로 상세 결과 저장
    with open('comprehensive_check_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print()
    print("📁 상세 결과가 comprehensive_check_results.json에 저장되었습니다.")
    print("=" * 70)

if __name__ == "__main__":
    import sys
    import io
    
    # Windows 콘솔 인코딩 문제 해결
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    generate_comprehensive_report()