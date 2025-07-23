#!/usr/bin/env python3
import os
import re

# 메인 태그를 추가해야 할 페이지들
pages_to_fix = [
    'tests/teto-egen/start.html',
    'tests/teto-egen/test.html', 
    'tests/love-dna/test.html',
    'tools/text-counter.html',
    'tools/bmi-calculator.html',
    'tools/salary-calculator.html'
]

def add_main_tags(file_path):
    """HTML 파일에 main 태그를 추가"""
    if not os.path.exists(file_path):
        print(f"⚠️ 파일 없음: {file_path}")
        return False
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 이미 main 태그가 있는지 확인
        if '<main' in content:
            print(f"✅ 이미 main 태그 있음: {file_path}")
            return True
            
        # <body> 태그 다음에 <main> 추가
        body_pattern = r'(<body[^>]*>)'
        if re.search(body_pattern, content):
            content = re.sub(body_pattern, r'\1\n    <main class="page-main">', content)
            
            # </body> 태그 앞에 </main> 추가
            content = re.sub(r'</body>', '    </main>\n</body>', content)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ main 태그 추가 완료: {file_path}")
            return True
        else:
            print(f"⚠️ body 태그 찾을 수 없음: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ 에러 발생 {file_path}: {e}")
        return False

def main():
    print("🔧 HTML 페이지에 main 태그 추가 시작...\n")
    
    success_count = 0
    total_count = len(pages_to_fix)
    
    for page in pages_to_fix:
        if add_main_tags(page):
            success_count += 1
        print()
    
    print(f"📊 작업 완료: {success_count}/{total_count} 페이지 수정됨")

if __name__ == "__main__":
    main()