#!/usr/bin/env python3
"""
23개 페이지에 누락된 mobile-fixes.css와 button-system.css를 추가하는 스크립트
styles.css 다음에 추가합니다.
"""

import os
import re
from datetime import datetime
import json

# 모든 HTML 페이지 정의 (index.html 제외 - 이미 포함되어 있음)
PAGES = [
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

def add_css_after_styles(content):
    """styles.css 다음에 누락된 CSS 추가"""
    # styles.css 링크 찾기
    styles_pattern = r'(<link[^>]+href=["\'][^"\']*styles\.css[^"\']*["\'][^>]*>)'
    styles_match = re.search(styles_pattern, content)
    
    if not styles_match:
        print("    Warning: styles.css not found")
        return content, False
    
    # mobile-fixes.css와 button-system.css 확인
    has_mobile = 'mobile-fixes.css' in content
    has_button = 'button-system.css' in content
    
    if has_mobile and has_button:
        return content, False
    
    # styles.css 다음 위치 찾기
    insert_pos = styles_match.end()
    
    # 다음 줄로 이동
    newline_pos = content.find('\n', insert_pos)
    if newline_pos != -1:
        insert_pos = newline_pos
    
    # 추가할 CSS 링크들
    css_to_add = []
    if not has_mobile:
        css_to_add.append('\n<link rel="stylesheet" href="/css/mobile-fixes.css">')
    if not has_button:
        css_to_add.append('\n<link rel="stylesheet" href="/css/button-system.css">')
    
    # CSS 추가
    css_lines = ''.join(css_to_add)
    new_content = content[:insert_pos] + css_lines + content[insert_pos:]
    
    return new_content, True

def process_page(page_path):
    """페이지 처리"""
    try:
        # 파일 읽기
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # CSS 추가
        new_content, modified = add_css_after_styles(content)
        
        if modified:
            # 백업 생성
            backup_path = page_path + '.backup_css_fix_final'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            # 수정된 내용 저장
            with open(page_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            return 'modified', 'CSS files added successfully'
        else:
            return 'skipped', 'CSS files already present'
            
    except Exception as e:
        return 'error', str(e)

def main():
    """메인 실행"""
    print("누락된 CSS 파일 추가 시작...")
    print("="*60)
    
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_pages': len(PAGES),
        'modified': 0,
        'skipped': 0,
        'errors': 0,
        'details': []
    }
    
    for page in PAGES:
        page_path = os.path.join('C:\\Users\\pc\\teste', page)
        print(f"\nProcessing: {page}")
        
        status, message = process_page(page_path)
        
        if status == 'modified':
            report['modified'] += 1
            print(f"  [MODIFIED] {message}")
        elif status == 'skipped':
            report['skipped'] += 1
            print(f"  [SKIPPED] {message}")
        else:
            report['errors'] += 1
            print(f"  [ERROR] {message}")
        
        report['details'].append({
            'page': page,
            'status': status,
            'message': message
        })
    
    # 리포트 저장
    with open('css_fix_final_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    # 요약 출력
    print("\n" + "="*60)
    print("작업 완료!")
    print("="*60)
    print(f"총 페이지: {report['total_pages']}")
    print(f"수정됨: {report['modified']}")
    print(f"건너뜀: {report['skipped']}")
    print(f"오류: {report['errors']}")
    print(f"\n리포트 저장됨: css_fix_final_report.json")

if __name__ == "__main__":
    main()