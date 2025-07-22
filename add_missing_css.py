#!/usr/bin/env python3
"""
23개 페이지에 누락된 mobile-fixes.css와 button-system.css를 추가하는 스크립트
styles.css 다음에 추가합니다.
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

def get_relative_path(file_path):
    """파일 경로에 따른 상대 경로 반환"""
    depth = file_path.count('/')
    if depth == 0:
        return ''
    else:
        return '../' * depth

def check_css_links(content, file_path):
    """CSS 링크 확인"""
    relative_path = get_relative_path(file_path)
    
    # styles.css 찾기 (minified 또는 일반 버전, 절대경로도 포함)
    styles_patterns = [
        rf'<link[^>]+href=["\']{relative_path}css/styles\.min\.css["\'][^>]*>',
        rf'<link[^>]+href=["\']{relative_path}css/styles\.css["\'][^>]*>',
        rf'<link[^>]+href=["\']/?css/styles\.min\.css["\'][^>]*>',
        rf'<link[^>]+href=["\']/?css/styles\.css["\'][^>]*>'
    ]
    
    styles_match = None
    for pattern in styles_patterns:
        match = re.search(pattern, content)
        if match:
            styles_match = match
            break
    
    # mobile-fixes.css 찾기
    mobile_patterns = [
        rf'<link[^>]+href=["\']{relative_path}css/mobile-fixes\.min\.css["\'][^>]*>',
        rf'<link[^>]+href=["\']{relative_path}css/mobile-fixes\.css["\'][^>]*>',
        rf'<link[^>]+href=["\']/?css/mobile-fixes\.min\.css["\'][^>]*>',
        rf'<link[^>]+href=["\']/?css/mobile-fixes\.css["\'][^>]*>'
    ]
    
    mobile_match = None
    for pattern in mobile_patterns:
        match = re.search(pattern, content)
        if match:
            mobile_match = match
            break
    
    # button-system.css 찾기
    button_patterns = [
        rf'<link[^>]+href=["\']{relative_path}css/button-system\.min\.css["\'][^>]*>',
        rf'<link[^>]+href=["\']{relative_path}css/button-system\.css["\'][^>]*>',
        rf'<link[^>]+href=["\']/?css/button-system\.min\.css["\'][^>]*>',
        rf'<link[^>]+href=["\']/?css/button-system\.css["\'][^>]*>'
    ]
    
    button_match = None
    for pattern in button_patterns:
        match = re.search(pattern, content)
        if match:
            button_match = match
            break
    
    return {
        'has_styles': styles_match is not None,
        'has_mobile': mobile_match is not None,
        'has_button': button_match is not None,
        'styles_pos': styles_match.end() if styles_match else -1
    }

def add_missing_css(content, file_path, check_result):
    """누락된 CSS 추가"""
    # 절대 경로 사용
    modified = False
    
    if check_result['has_styles'] and check_result['styles_pos'] > 0:
        # styles.css가 있는 경우, 그 다음에 추가
        insert_pos = check_result['styles_pos']
        
        # 다음 줄로 이동
        newline_pos = content.find('\n', insert_pos)
        if newline_pos != -1:
            insert_pos = newline_pos + 1
        
        css_to_add = []
        
        # mobile-fixes.css가 없으면 추가
        if not check_result['has_mobile']:
            css_to_add.append('    <link rel="stylesheet" href="/css/mobile-fixes.css">')
        
        # button-system.css가 없으면 추가
        if not check_result['has_button']:
            css_to_add.append('    <link rel="stylesheet" href="/css/button-system.css">')
        
        if css_to_add:
            css_lines = '\n'.join(css_to_add) + '\n'
            content = content[:insert_pos] + css_lines + content[insert_pos:]
            modified = True
    
    return content, modified

def process_pages():
    """모든 페이지 처리"""
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_pages': len(PAGES),
        'processed': 0,
        'modified': 0,
        'errors': 0,
        'details': []
    }
    
    for page in PAGES:
        page_path = os.path.join('C:\\Users\\pc\\teste', page)
        
        try:
            # 파일이 존재하는지 확인
            if not os.path.exists(page_path):
                report['errors'] += 1
                report['details'].append({
                    'page': page,
                    'status': 'error',
                    'message': 'File not found'
                })
                continue
            
            # 파일 읽기
            with open(page_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # CSS 링크 확인
            check_result = check_css_links(content, page)
            
            # 누락된 CSS 추가
            new_content, modified = add_missing_css(content, page, check_result)
            
            if modified:
                # 백업 생성
                backup_path = page_path + '.backup_css_fix'
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                # 수정된 내용 저장
                with open(page_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                report['modified'] += 1
                status = 'modified'
                message = f"Added {'mobile-fixes.css' if not check_result['has_mobile'] else ''} {'button-system.css' if not check_result['has_button'] else ''}"
            else:
                status = 'skipped'
                message = 'All CSS files already present'
            
            report['processed'] += 1
            report['details'].append({
                'page': page,
                'status': status,
                'has_styles': check_result['has_styles'],
                'has_mobile': check_result['has_mobile'],
                'has_button': check_result['has_button'],
                'message': message.strip()
            })
            
            print(f"{'✓' if status == 'modified' else '○'} {page}: {message}")
            
        except Exception as e:
            report['errors'] += 1
            report['details'].append({
                'page': page,
                'status': 'error',
                'message': str(e)
            })
            print(f"✗ {page}: Error - {str(e)}")
    
    # 리포트 저장
    with open('css_fix_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    # 요약 출력
    print("\n" + "="*60)
    print("CSS 추가 작업 완료")
    print("="*60)
    print(f"총 페이지: {report['total_pages']}")
    print(f"처리됨: {report['processed']}")
    print(f"수정됨: {report['modified']}")
    print(f"오류: {report['errors']}")
    print(f"\n리포트 저장됨: css_fix_report.json")

if __name__ == "__main__":
    print("23개 페이지에 누락된 CSS 파일 추가 시작...")
    print("="*60)
    process_pages()