#!/usr/bin/env python3
"""
doha.kr 실제 서비스 페이지만 수정
"""

import os
import re
import json
from datetime import datetime

class ServicePageFixer:
    def __init__(self):
        self.fixed_count = 0
        self.report = []
        
        # 실제 서비스 페이지 목록
        self.service_pages = [
            'index.html', '404.html', 'offline.html',
            'about/index.html', 'contact/index.html', 'faq/index.html',
            'privacy/index.html', 'terms/index.html',
            'tests/index.html', 'tests/teto-egen/index.html', 'tests/teto-egen/start.html',
            'tests/teto-egen/test.html', 'tests/mbti/index.html', 'tests/mbti/test.html',
            'tests/love-dna/index.html', 'tests/love-dna/test.html',
            'tools/index.html', 'tools/text-counter.html', 'tools/bmi-calculator.html',
            'tools/salary-calculator.html',
            'fortune/index.html', 'fortune/daily/index.html', 'fortune/saju/index.html',
            'fortune/tarot/index.html', 'fortune/zodiac/index.html', 'fortune/zodiac-animal/index.html'
        ]
        
    def fix_test_page_functions(self, content, file_path):
        """테스트 페이지 JavaScript 함수 연결 수정"""
        fixes = []
        
        if 'test.html' in file_path:
            # 테스트 페이지에 필요한 전역 함수 등록
            functions_to_add = []
            
            # onclick에서 호출하는 함수들 찾기
            onclick_funcs = re.findall(r'onclick=["\']([\w]+)\(', content)
            
            # 이미 정의되어 있는지 확인
            for func in set(onclick_funcs):
                if f'window.{func}' not in content and func not in ['alert', 'confirm', 'location']:
                    functions_to_add.append(func)
            
            if functions_to_add:
                # 스크립트 태그에 window 등록 추가
                script_pattern = r'(<script[^>]*>[\s\S]*?)(</script>)'
                
                def add_window_exports(match):
                    script_content = match.group(1)
                    script_end = match.group(2)
                    
                    # 이미 정의된 함수들 찾기
                    defined_funcs = re.findall(r'function\s+(\w+)\s*\(', script_content)
                    
                    exports = []
                    for func in functions_to_add:
                        if func in defined_funcs:
                            exports.append(f'window.{func} = {func};')
                    
                    if exports:
                        export_block = '\n// 전역 함수로 등록\n' + '\n'.join(exports) + '\n'
                        return script_content + export_block + script_end
                    
                    return match.group(0)
                
                content = re.sub(script_pattern, add_window_exports, content)
                fixes.append(f"전역 함수 등록: {', '.join(functions_to_add)}")
        
        if fixes:
            self.fixed_count += len(fixes)
            self.report.append(f"✅ {file_path}: JavaScript 함수 연결 수정 - {', '.join(fixes)}")
        
        return content
    
    def add_missing_scripts(self, content, file_path):
        """누락된 스크립트 추가"""
        fixes = []
        
        # test.js 파일 경로 확인 및 추가
        if 'test.html' in file_path:
            if 'teto-egen' in file_path and '/tests/teto-egen/test.js' not in content:
                # </body> 태그 앞에 스크립트 추가
                insert_pos = content.rfind('</body>')
                if insert_pos > -1:
                    script_tag = '<script src="/tests/teto-egen/test.js" defer></script>\n'
                    content = content[:insert_pos] + script_tag + content[insert_pos:]
                    fixes.append("teto-egen test.js 추가")
            
            elif 'mbti' in file_path and '/js/pages/mbti-test.js' not in content:
                insert_pos = content.rfind('</body>')
                if insert_pos > -1:
                    script_tag = '<script src="/js/pages/mbti-test.js" defer></script>\n'
                    content = content[:insert_pos] + script_tag + content[insert_pos:]
                    fixes.append("mbti-test.js 추가")
            
            elif 'love-dna' in file_path and '/js/pages/love-dna-test.js' not in content:
                insert_pos = content.rfind('</body>')
                if insert_pos > -1:
                    script_tag = '<script src="/js/pages/love-dna-test.js" defer></script>\n'
                    content = content[:insert_pos] + script_tag + content[insert_pos:]
                    fixes.append("love-dna-test.js 추가")
        
        if fixes:
            self.fixed_count += len(fixes)
            self.report.append(f"✅ {file_path}: 스크립트 추가 - {', '.join(fixes)}")
        
        return content
    
    def fix_css_paths(self, content, file_path):
        """CSS 경로 문제 수정"""
        fixes = []
        
        # offline.html에 누락된 CSS 추가
        if 'offline.html' in file_path:
            if '/css/mobile-fixes.css' not in content:
                # styles.css 뒤에 추가
                styles_pos = content.find('<link rel="stylesheet" href="/css/styles.css">')
                if styles_pos > -1:
                    end_pos = content.find('>', styles_pos) + 1
                    mobile_css = '\n    <link rel="stylesheet" href="/css/mobile-fixes.css">'
                    button_css = '\n    <link rel="stylesheet" href="/css/button-system.css">'
                    content = content[:end_pos] + mobile_css + button_css + content[end_pos:]
                    fixes.append("mobile-fixes.css, button-system.css 추가")
        
        if fixes:
            self.fixed_count += len(fixes)
            self.report.append(f"✅ {file_path}: CSS 수정 - {', '.join(fixes)}")
        
        return content
    
    def fix_404_page(self, content, file_path):
        """404 페이지 특별 처리"""
        if '404.html' in file_path:
            fixes = []
            
            # 네비게이션/푸터는 404 페이지에 필요 없으므로 스킵
            # 대신 홈으로 가는 버튼 확인
            if '홈으로' not in content and 'href="/"' not in content:
                # 메인 콘텐츠에 홈 버튼 추가
                main_content = re.search(r'(<div[^>]*class="[^"]*container[^"]*"[^>]*>)', content)
                if main_content:
                    insert_pos = main_content.end()
                    home_button = '''
        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="btn btn-primary">홈으로 돌아가기</a>
        </div>
'''
                    content = content[:insert_pos] + home_button + content[insert_pos:]
                    fixes.append("홈 버튼 추가")
            
            if fixes:
                self.fixed_count += len(fixes)
                self.report.append(f"✅ {file_path}: {', '.join(fixes)}")
        
        return content
    
    def process_file(self, file_path):
        """파일 처리"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # 각 수정 함수 적용
            content = self.fix_test_page_functions(content, file_path)
            content = self.add_missing_scripts(content, file_path)
            content = self.fix_css_paths(content, file_path)
            content = self.fix_404_page(content, file_path)
            
            # 변경사항이 있으면 파일 저장
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return True
            
            return False
            
        except Exception as e:
            self.report.append(f"❌ {file_path}: 오류 발생 - {str(e)}")
            return False
    
    def run(self):
        """전체 수정 프로세스 실행"""
        print("=" * 80)
        print("🔧 doha.kr 서비스 페이지 집중 수정")
        print("=" * 80)
        print(f"시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        print(f"처리할 서비스 페이지: {len(self.service_pages)}개\n")
        
        for page in self.service_pages:
            if os.path.exists(page):
                self.process_file(page)
        
        # 리포트 출력
        print("\n📋 수정 결과:")
        for item in self.report:
            print(f"  {item}")
        
        print(f"\n✅ 총 {self.fixed_count}개 문제 수정 완료")
        
        # 결과 저장
        result = {
            'timestamp': datetime.now().isoformat(),
            'total_files': len(self.service_pages),
            'fixed_issues': self.fixed_count,
            'report': self.report
        }
        
        with open('service_pages_fix_report.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        print(f"\n📁 수정 리포트가 service_pages_fix_report.json에 저장되었습니다.")

if __name__ == "__main__":
    import sys
    import io
    
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    fixer = ServicePageFixer()
    fixer.run()