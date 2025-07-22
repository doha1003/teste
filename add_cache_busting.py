#!/usr/bin/env python3
"""
캐시 무효화를 위한 버전 파라미터 추가
- JavaScript와 CSS 파일에 ?v=timestamp 추가
- 브라우저 캐시 문제 해결
"""

import os
import re
import time
from pathlib import Path

def add_cache_busting():
    """HTML 파일들에 캐시 무효화 파라미터 추가"""
    
    # 현재 타임스탬프 생성
    version = str(int(time.time()))
    
    print(f"Adding cache busting version: v={version}")
    
    # HTML 파일들 찾기
    html_files = []
    for root, dirs, files in os.walk('.'):
        # 제외할 디렉토리
        dirs[:] = [d for d in dirs if d not in {'node_modules', '.git', 'teste_repo'}]
        
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    updated_count = 0
    
    for file_path in html_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # main.js에 버전 추가
            content = re.sub(
                r'<script src="/js/main\.js"([^>]*)>',
                f'<script src="/js/main.js?v={version}"\\1>',
                content
            )
            
            # api-config.js에 버전 추가
            content = re.sub(
                r'<script src="/js/api-config\.js"([^>]*)>',
                f'<script src="/js/api-config.js?v={version}"\\1>',
                content
            )
            
            # lunar-calendar-compact.js에 버전 추가
            content = re.sub(
                r'<script src="/js/lunar-calendar-compact\.js"([^>]*)>',
                f'<script src="/js/lunar-calendar-compact.js?v={version}"\\1>',
                content
            )
            
            # styles.css에 버전 추가
            content = re.sub(
                r'<link rel="stylesheet" href="/css/styles\.css"([^>]*)>',
                f'<link rel="stylesheet" href="/css/styles.css?v={version}"\\1>',
                content
            )
            
            # 변경사항이 있으면 파일 업데이트
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                updated_count += 1
                print(f"Updated: {file_path}")
        
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    print(f"\nCache busting applied to {updated_count} files")
    return updated_count

if __name__ == "__main__":
    add_cache_busting()