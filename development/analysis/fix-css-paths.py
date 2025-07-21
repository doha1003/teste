import os
import re

def fix_css_paths():
    """모든 HTML 파일의 CSS 경로를 수정"""
    
    # HTML 파일 목록
    html_files = []
    
    # 모든 디렉토리 검색
    for root, dirs, files in os.walk('.'):
        # .git 디렉토리 제외
        if '.git' in root:
            continue
        
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    print(f"총 {len(html_files)}개 HTML 파일 발견")
    
    # 각 파일 수정
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # CSS 경로 수정
            # 1. /css/styles.css?v=20250720_new -> /css/styles.css
            content = re.sub(r'/css/styles\.css\?v=[^"]*', '/css/styles.css', content)
            
            # 2. 존재하지 않는 page-specific CSS 제거
            patterns_to_remove = [
                r'<link[^>]*href="/css/pages/[^"]*"[^>]*>\s*\n?',
                r'<link[^>]*href="/css/saju-styles\.css[^"]*"[^>]*>\s*\n?'
            ]
            
            for pattern in patterns_to_remove:
                content = re.sub(pattern, '', content)
            
            # 3. dark-mode.js 경로 확인 및 수정
            content = re.sub(r'/js/dark-mode\.js\?v=[^"]*', '/js/dark-mode.js', content)
            
            # 변경사항이 있으면 저장
            if content != original_content:
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"[수정됨] {html_file}")
            else:
                print(f"[변경없음] {html_file}")
                
        except Exception as e:
            print(f"[오류] {html_file}: {str(e)}")
    
    print("\n모든 HTML 파일 수정 완료!")

if __name__ == "__main__":
    fix_css_paths()