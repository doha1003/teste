#!/usr/bin/env python3
"""
CSS 추가 작업 검증 스크립트
"""

import os
import re

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

def check_css_files(page_path):
    """페이지의 CSS 파일 확인"""
    try:
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # CSS 파일 포함 여부 확인
        has_styles = bool(re.search(r'<link[^>]+href=["\'][^"\']*styles\.css[^"\']*["\'][^>]*>', content))
        has_mobile = bool(re.search(r'<link[^>]+href=["\'][^"\']*mobile-fixes\.css[^"\']*["\'][^>]*>', content))
        has_button = bool(re.search(r'<link[^>]+href=["\'][^"\']*button-system\.css[^"\']*["\'][^>]*>', content))
        
        return {
            'exists': True,
            'has_styles': has_styles,
            'has_mobile': has_mobile,
            'has_button': has_button,
            'all_present': has_styles and has_mobile and has_button
        }
    except Exception as e:
        return {
            'exists': False,
            'error': str(e)
        }

def main():
    """메인 실행"""
    total = len(PAGES)
    all_ok = 0
    missing_css = []
    errors = []
    
    print("CSS 파일 추가 확인")
    print("="*60)
    
    for page in PAGES:
        page_path = os.path.join('C:\\Users\\pc\\teste', page)
        result = check_css_files(page_path)
        
        if not result['exists']:
            errors.append(page)
            print(f"[ERROR] {page}: 파일 오류")
        elif result['all_present']:
            all_ok += 1
            print(f"[OK] {page}")
        else:
            missing = []
            if not result['has_styles']:
                missing.append('styles.css')
            if not result['has_mobile']:
                missing.append('mobile-fixes.css')
            if not result['has_button']:
                missing.append('button-system.css')
            missing_css.append({'page': page, 'missing': missing})
            print(f"[MISSING] {page}: {', '.join(missing)}")
    
    print("\n" + "="*60)
    print("검증 결과:")
    print(f"  총 페이지: {total}")
    print(f"  정상: {all_ok}")
    print(f"  누락: {len(missing_css)}")
    print(f"  오류: {len(errors)}")
    
    if missing_css:
        print(f"\n누락된 CSS가 있는 페이지:")
        for item in missing_css:
            print(f"  - {item['page']}: {', '.join(item['missing'])}")
    
    if all_ok == total:
        print(f"\n[SUCCESS] 모든 페이지에 필요한 CSS 파일이 포함되었습니다!")
    else:
        print(f"\n[WARNING] 일부 페이지에 CSS 파일이 누락되었습니다.")

if __name__ == "__main__":
    main()