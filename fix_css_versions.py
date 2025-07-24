#!/usr/bin/env python3
"""
CSS 버전 참조 수정 스크립트
모든 HTML 파일에서 CSS 버전 쿼리 스트링(?v=숫자)을 제거합니다.
"""

import re
from pathlib import Path
from datetime import datetime
import shutil

def fix_css_versions(root_dir):
    """CSS 버전 참조 제거"""
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
            
            # 버전이 포함된 CSS 참조 찾기
            original_content = content
            
            # CSS 버전 제거 패턴
            # 1. href="/css/styles.css?v=1753150228" → href="/css/styles.css"
            content = re.sub(r'(href="[^"]*\.css)\?v=\d+(")', r'\1\2', content)
            
            # 변경사항이 있는지 확인
            if content != original_content:
                # 백업 생성
                backup_path = str(html_file) + '.backup_css_version'
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
        print(f"\n백업 파일이 생성되었습니다 (.backup_css_version)")
        print("원래 상태로 되돌리려면 백업 파일을 사용하세요.")
        
        # 수정 보고서 생성
        create_fix_report(root, fixed_count)

def create_fix_report(root_dir, fixed_count):
    """수정 보고서 생성"""
    report_content = f"""# CSS 버전 수정 보고서

생성일: {datetime.now().isoformat()}

## 수정 결과

- **수정된 파일 수**: {fixed_count}개
- **수정 내용**: CSS 파일 참조에서 버전 쿼리 스트링(?v=숫자) 제거

## 수정 예시

변경 전:
```html
<link rel="stylesheet" href="/css/styles.css?v=1753150228">
```

변경 후:
```html
<link rel="stylesheet" href="/css/styles.css">
```

## 백업 정보

모든 수정된 파일은 `.backup_css_version` 확장자로 백업되었습니다.

## 다음 단계

1. 웹사이트에서 CSS가 정상적으로 로드되는지 확인
2. 문제가 없다면 백업 파일 삭제 가능
3. 문제가 있다면 백업 파일로 복원

## 백업 파일 삭제 명령

```bash
# Windows
del /s *.backup_css_version

# Python
python -c "import os; [os.remove(f) for f in Path('.').rglob('*.backup_css_version')]"
```
"""
    
    report_path = root_dir / 'CSS_VERSION_FIX_REPORT.md'
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    print(f"\n보고서가 생성되었습니다: {report_path}")

if __name__ == "__main__":
    root_directory = r"C:\Users\pc\teste"
    fix_css_versions(root_directory)