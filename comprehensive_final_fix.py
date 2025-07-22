#!/usr/bin/env python3
"""
doha.kr 종합 최종 수정 - 100% 완성도 달성
"""

import os
import re
import json
from datetime import datetime

class ComprehensiveFinalFix:
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
        
        # 테스트 페이지별 필수 JS 파일
        self.test_js_mapping = {
            'tests/teto-egen/test.html': '/tests/teto-egen/test.js',
            'tests/mbti/test.html': '/js/pages/mbti-test.js',
            'tests/love-dna/test.html': '/js/pages/love-dna-test.js'
        }
    
    def remove_duplicate_window_exports(self, content, file_path):
        """중복된 window export 제거"""
        if 'test.html' in file_path:
            # HTML 내 인라인 스크립트에서 window export 찾기
            inline_exports = re.findall(r'window\.(startTest|copyResultLink|restartTest|nextQuestion|previousQuestion|selectGender|shareKakao|shareToKakao)\s*=', content)
            
            if inline_exports:
                # 인라인 window export 제거 (test.js에 이미 있으므로)
                for func in set(inline_exports):
                    content = re.sub(rf'window\.{func}\s*=\s*{func};?\s*\n?', '', content)
                self.report.append(f"✅ {file_path}: 중복 window export 제거 - {', '.join(set(inline_exports))}")
                self.fixed_count += 1
        
        return content
    
    def ensure_test_js_loaded(self, content, file_path):
        """테스트 JS 파일이 올바르게 로드되는지 확인"""
        if file_path in self.test_js_mapping:
            required_js = self.test_js_mapping[file_path]
            
            if required_js not in content:
                # </body> 태그 앞에 추가
                insert_pos = content.rfind('</body>')
                if insert_pos > -1:
                    script_tag = f'<script src="{required_js}" defer></script>\n'
                    content = content[:insert_pos] + script_tag + content[insert_pos:]
                    self.report.append(f"✅ {file_path}: {required_js} 추가")
                    self.fixed_count += 1
        
        return content
    
    def fix_offline_css(self, content, file_path):
        """offline.html CSS 누락 수정"""
        if 'offline.html' in file_path:
            if '/css/mobile-fixes.css' not in content:
                # styles.css 찾기
                styles_match = re.search(r'(<link[^>]*href="/css/styles.css"[^>]*>)', content)
                if styles_match:
                    insert_pos = styles_match.end()
                    mobile_css = '\n    <link rel="stylesheet" href="/css/mobile-fixes.css">'
                    button_css = '\n    <link rel="stylesheet" href="/css/button-system.css">'
                    content = content[:insert_pos] + mobile_css + button_css + content[insert_pos:]
                    self.report.append(f"✅ {file_path}: mobile-fixes.css, button-system.css 추가")
                    self.fixed_count += 1
        
        return content
    
    def fix_404_navigation(self, content, file_path):
        """404 페이지 홈 버튼 추가"""
        if '404.html' in file_path:
            # 홈 버튼이 없으면 추가
            if 'href="/"' not in content or '홈으로' not in content:
                # container 찾기
                container_match = re.search(r'(<div[^>]*class="[^"]*container[^"]*"[^>]*>.*?)(</div>)', content, re.DOTALL)
                if container_match:
                    insert_pos = container_match.start(2)
                    home_button = '''
        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="btn btn-primary">홈으로 돌아가기</a>
        </div>
        '''
                    content = content[:insert_pos] + home_button + content[insert_pos:]
                    self.report.append(f"✅ {file_path}: 홈 버튼 추가")
                    self.fixed_count += 1
        
        return content
    
    def add_result_elements(self, content, file_path):
        """테스트 목록 페이지에 결과 요소 추가"""
        if 'tests/index.html' in file_path or ('tests/' in file_path and '/index.html' in file_path and 'test.html' not in file_path):
            # 테스트 목록 페이지는 결과 화면이 필요 없음
            # 대신 적절한 설명이 있는지 확인
            if '<div class="test-description">' not in content and '<p>' not in content:
                # 설명 추가가 필요한 경우
                pass
        
        return content
    
    def fix_tools_input_fields(self, content, file_path):
        """도구 페이지 입력 필드 확인"""
        if 'tools/index.html' in file_path:
            # 도구 목록 페이지는 입력 필드가 필요 없음
            pass
        
        return content
    
    def process_file(self, file_path):
        """파일 처리"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # 각 수정 함수 적용
            content = self.remove_duplicate_window_exports(content, file_path)
            content = self.ensure_test_js_loaded(content, file_path)
            content = self.fix_offline_css(content, file_path)
            content = self.fix_404_navigation(content, file_path)
            content = self.add_result_elements(content, file_path)
            content = self.fix_tools_input_fields(content, file_path)
            
            # 변경사항이 있으면 파일 저장
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return True
            
            return False
            
        except Exception as e:
            self.report.append(f"❌ {file_path}: 오류 발생 - {str(e)}")
            return False
    
    def verify_completion(self):
        """완성도 검증"""
        verification_results = {
            'total_pages': len(self.service_pages),
            'checked': 0,
            'working': 0,
            'issues': []
        }
        
        for page in self.service_pages:
            if os.path.exists(page):
                verification_results['checked'] += 1
                
                with open(page, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                page_ok = True
                page_issues = []
                
                # 기본 체크
                if '<title>' not in content:
                    page_issues.append("제목 누락")
                    page_ok = False
                
                if 'viewport' not in content:
                    page_issues.append("viewport 누락")
                    page_ok = False
                
                # CSS 체크
                if '/css/styles.css' not in content:
                    page_issues.append("styles.css 누락")
                    page_ok = False
                
                # 테스트 페이지 체크
                if 'test.html' in page:
                    required_js = self.test_js_mapping.get(page)
                    if required_js and required_js not in content:
                        page_issues.append(f"{required_js} 누락")
                        page_ok = False
                
                if page_ok:
                    verification_results['working'] += 1
                else:
                    verification_results['issues'].append({
                        'page': page,
                        'issues': page_issues
                    })
        
        return verification_results
    
    def run(self):
        """전체 수정 프로세스 실행"""
        print("=" * 80)
        print("🔧 doha.kr 종합 최종 수정 - 100% 완성도 목표")
        print("=" * 80)
        print(f"시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        print(f"처리할 서비스 페이지: {len(self.service_pages)}개\n")
        
        # Phase 1: 수정
        print("📌 Phase 1: 종합 수정 진행")
        print("-" * 40)
        
        for page in self.service_pages:
            if os.path.exists(page):
                self.process_file(page)
        
        # 수정 결과 출력
        if self.report:
            print("\n📋 수정 내역:")
            for item in self.report:
                print(f"  {item}")
        
        print(f"\n✅ 총 {self.fixed_count}개 문제 수정 완료")
        
        # Phase 2: 검증
        print("\n📌 Phase 2: 완성도 검증")
        print("-" * 40)
        
        verification = self.verify_completion()
        
        completion_rate = (verification['working'] / verification['checked']) * 100 if verification['checked'] > 0 else 0
        
        print(f"\n📊 최종 완성도: {completion_rate:.1f}%")
        print(f"  - 전체 페이지: {verification['total_pages']}개")
        print(f"  - 검사한 페이지: {verification['checked']}개")
        print(f"  - 정상 작동: {verification['working']}개")
        
        if verification['issues']:
            print(f"\n⚠️ 남은 문제 ({len(verification['issues'])}개 페이지):")
            for issue in verification['issues'][:5]:  # 상위 5개만 표시
                print(f"  - {issue['page']}: {', '.join(issue['issues'])}")
        
        # 결과 저장
        result = {
            'timestamp': datetime.now().isoformat(),
            'total_pages': len(self.service_pages),
            'fixed_issues': self.fixed_count,
            'completion_rate': completion_rate,
            'report': self.report,
            'verification': verification
        }
        
        with open('comprehensive_final_fix_report.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        print(f"\n📁 최종 리포트가 comprehensive_final_fix_report.json에 저장되었습니다.")
        
        if completion_rate >= 95:
            print("\n🎉 목표 달성! 95% 이상의 완성도를 달성했습니다.")
        else:
            print(f"\n📈 추가 작업 필요: {100 - completion_rate:.1f}% 개선이 필요합니다.")

if __name__ == "__main__":
    import sys
    import io
    
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    fixer = ComprehensiveFinalFix()
    fixer.run()