#!/usr/bin/env python3
"""
JavaScript 버전 참조 수정 스크립트
모든 HTML 파일에서 JS 버전 쿼리 스트링(?v=숫자)을 제거합니다.
"""

import re
from pathlib import Path
from datetime import datetime
import shutil

def fix_js_versions(root_dir):
    """JS 버전 참조 제거"""
    root = Path(root_dir)
    
    # 수정할 HTML 파일 찾기
    html_files = []
    for pattern in ['*.html', '**/*.html']:
        for file in root.glob(pattern):
            if ('node_modules' not in str(file) and 
                'reports' not in str(file) and
                'dom_snapshot' not in str(file) and
                '.backup' not in str(file)):
                html_files.append(file)
    
    print(f"총 {len(html_files)}개 HTML 파일을 확인합니다...")
    
    fixed_count = 0
    skipped_count = 0
    error_count = 0
    
    for html_file in html_files:
        try:
            # 파일 읽기 (다양한 인코딩 시도)
            content = None
            encodings = ['utf-8', 'cp949', 'euc-kr', 'latin-1']
            
            for encoding in encodings:
                try:
                    with open(html_file, 'r', encoding=encoding) as f:
                        content = f.read()
                    break
                except UnicodeDecodeError:
                    continue
            
            if content is None:
                print(f"  [읽기 실패] {html_file}")
                error_count += 1
                continue
            
            # 버전이 포함된 JS 참조 찾기
            original_content = content
            
            # JS 버전 제거 패턴
            # 1. src="/js/main.js?v=1753150228" → src="/js/main.js"
            content = re.sub(r'(src="[^"]*\.js)\?v=\d+(")', r'\1\2', content)
            
            # 변경사항이 있는지 확인
            if content != original_content:
                # 백업 생성
                backup_path = str(html_file) + '.backup_js_version'
                shutil.copy2(html_file, backup_path)
                
                # 수정된 내용 저장
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"  [수정됨] {html_file.relative_to(root)}")
                fixed_count += 1
            else:
                skipped_count += 1
                
        except Exception as e:
            print(f"  [오류] {html_file} - {e}")
            error_count += 1
    
    # 결과 요약
    print(f"\n=== 수정 완료 ===")
    print(f"[수정된 파일] {fixed_count}개")
    print(f"[변경 없음] {skipped_count}개")
    print(f"[오류 발생] {error_count}개")
    
    if fixed_count > 0:
        print(f"\n백업 파일이 생성되었습니다 (.backup_js_version)")
        print("원래 상태로 되돌리려면 백업 파일을 사용하세요.")

if __name__ == "__main__":
    root_directory = r"C:\Users\pc\teste"
    fix_js_versions(root_directory)