#!/usr/bin/env python3
"""
이 스크립트는 모든 HTML 파일을 검사하여 main.js가 제대로 로드되고 있는지 확인하고,
필요한 경우 loadComponents() 호출을 추가합니다.
"""

import os
import re
from pathlib import Path
from datetime import datetime

# 검사할 디렉토리와 제외할 디렉토리
ROOT_DIR = r"C:\Users\pc\teste"
EXCLUDE_DIRS = {'node_modules', 'reports', 'development', '.git', 'includes'}
EXCLUDE_FILES = {'problematic_section.html', 'index-enhanced.html'}

# 검사할 HTML 파일들의 경로 패턴
TARGET_PATHS = [
    'index.html',
    '404.html', 
    'offline.html',
    'about/index.html',
    'contact/index.html',
    'faq/index.html',
    'fortune/index.html',
    'fortune/daily/index.html',
    'fortune/saju/index.html',
    'fortune/tarot/index.html',
    'fortune/zodiac/index.html',
    'fortune/zodiac-animal/index.html',
    'privacy/index.html',
    'terms/index.html',
    'tests/index.html',
    'tests/mbti/index.html',
    'tests/mbti/test.html',
    'tests/teto-egen/index.html',
    'tests/teto-egen/start.html',
    'tests/teto-egen/test.html',
    'tests/love-dna/index.html',
    'tests/love-dna/test.html',
    'tools/index.html',
    'tools/bmi-calculator.html',
    'tools/salary-calculator.html',
    'tools/text-counter.html'
]

def check_file(filepath):
    """파일을 검사하고 필요한 정보를 반환"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 필요한 요소들이 있는지 확인
        has_navbar_placeholder = 'navbar-placeholder' in content
        has_footer_placeholder = 'footer-placeholder' in content
        has_main_js = 'main.js' in content
        has_loadcomponents_call = 'loadComponents()' in content
        
        # main.js 버전 확인
        main_js_match = re.search(r'main\.js\?v=(\d+)', content)
        main_js_version = main_js_match.group(1) if main_js_match else None
        
        return {
            'path': filepath,
            'has_navbar_placeholder': has_navbar_placeholder,
            'has_footer_placeholder': has_footer_placeholder,
            'has_main_js': has_main_js,
            'has_loadcomponents_call': has_loadcomponents_call,
            'main_js_version': main_js_version,
            'needs_fix': (has_navbar_placeholder or has_footer_placeholder) and has_main_js and not has_loadcomponents_call
        }
    except Exception as e:
        return {
            'path': filepath,
            'error': str(e)
        }

def fix_file(filepath):
    """main.js는 있지만 loadComponents() 호출이 없는 파일 수정"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 이미 loadComponents() 호출이 있으면 skip
        if 'loadComponents()' in content:
            return {'status': 'already_fixed', 'path': filepath}
            
        # </body> 태그 찾기
        body_close_match = re.search(r'(</body>)', content, re.IGNORECASE)
        if not body_close_match:
            return {'status': 'no_body_tag', 'path': filepath}
            
        # loadComponents 호출 코드 추가
        insert_code = """
<script>
// 네비게이션 및 푸터 로드 - main.js의 loadComponents가 실행되지 않은 경우를 위한 폴백
document.addEventListener('DOMContentLoaded', function() {
    // main.js가 로드되었고 loadComponents 함수가 있는지 확인
    if (typeof loadComponents === 'function') {
        // main.js의 DOMContentLoaded가 이미 실행되었을 수 있으므로 
        // navbar-placeholder가 비어있으면 다시 실행
        const navPlaceholder = document.getElementById('navbar-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');
        
        if ((navPlaceholder && !navPlaceholder.innerHTML.trim()) || 
            (footerPlaceholder && !footerPlaceholder.innerHTML.trim())) {
            console.log('Loading components...');
            loadComponents().catch(function(error) {
                console.error('Failed to load components:', error);
            });
        }
    }
});
</script>
"""
        
        # </body> 태그 바로 앞에 코드 삽입
        new_content = content[:body_close_match.start()] + insert_code + content[body_close_match.start():]
        
        # 백업 생성
        backup_path = filepath + '.backup_' + datetime.now().strftime('%Y%m%d_%H%M%S')
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        # 수정된 내용 저장
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        return {
            'status': 'fixed',
            'path': filepath,
            'backup': backup_path
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'path': filepath,
            'error': str(e)
        }

def main():
    print("=" * 80)
    print("HTML 파일 loadComponents 검사 및 수정 스크립트")
    print("=" * 80)
    
    # 모든 대상 파일 검사
    results = []
    for target_path in TARGET_PATHS:
        filepath = os.path.join(ROOT_DIR, target_path)
        if os.path.exists(filepath):
            result = check_file(filepath)
            results.append(result)
        else:
            results.append({
                'path': filepath,
                'error': 'File not found'
            })
    
    # 결과 출력
    print("\n검사 결과:")
    print("-" * 80)
    
    total_files = len(results)
    needs_fix = [r for r in results if r.get('needs_fix', False)]
    errors = [r for r in results if 'error' in r]
    
    print(f"총 검사 파일 수: {total_files}")
    print(f"수정이 필요한 파일 수: {len(needs_fix)}")
    print(f"오류 발생 파일 수: {len(errors)}")
    
    if needs_fix:
        print("\n수정이 필요한 파일 목록:")
        for r in needs_fix:
            print(f"  - {r['path']}")
            
    if errors:
        print("\n오류 발생 파일:")
        for r in errors:
            print(f"  - {r['path']}: {r['error']}")
    
    # 수정 진행
    if needs_fix:
        print("\n" + "=" * 80)
        # 자동으로 수정 진행 (input 대신)
        print(f"\n{len(needs_fix)}개 파일을 자동으로 수정합니다...")
        
        if True:  # response.lower() == 'y':
            print("\n수정 진행 중...")
            fix_results = []
            
            for r in needs_fix:
                fix_result = fix_file(r['path'])
                fix_results.append(fix_result)
                
                if fix_result['status'] == 'fixed':
                    print(f"  [OK] {fix_result['path']} - 수정 완료")
                elif fix_result['status'] == 'already_fixed':
                    print(f"  [-] {fix_result['path']} - 이미 수정됨")
                else:
                    print(f"  [X] {fix_result['path']} - 실패: {fix_result.get('status', 'unknown')}")
                    if 'error' in fix_result:
                        print(f"    오류: {fix_result['error']}")
            
            # 수정 결과 요약
            fixed_count = len([r for r in fix_results if r['status'] == 'fixed'])
            print(f"\n수정 완료: {fixed_count}개 파일")
            
            if fixed_count > 0:
                print("\n백업 파일이 생성되었습니다:")
                for r in fix_results:
                    if r['status'] == 'fixed' and 'backup' in r:
                        print(f"  - {r['backup']}")
    else:
        print("\n[OK] 모든 파일이 정상입니다. 수정이 필요한 파일이 없습니다.")
    
    print("\n" + "=" * 80)
    print("검사 완료")

if __name__ == "__main__":
    main()