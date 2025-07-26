#!/usr/bin/env python3
"""
doha.kr 프로젝트 빠른 분석 및 AI 리뷰 준비
실제 파일을 분석하여 AI에게 전달할 수 있는 형태로 정리
"""

import os
import sys
import json
import re
from pathlib import Path
from collections import defaultdict
import hashlib

# Windows 콘솔 UTF-8 설정
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

class QuickProjectAnalyzer:
    def __init__(self):
        self.root = Path('C:/Users/pc/teste')
        self.issues = defaultdict(list)
        self.stats = defaultdict(int)
        
    def analyze_html_file(self, file_path):
        """HTML 파일 분석"""
        content = file_path.read_text(encoding='utf-8', errors='ignore')
        rel_path = file_path.relative_to(self.root)
        
        # 인라인 스타일 검사
        inline_styles = len(re.findall(r'style=["\'](.*?)["\']', content))
        if inline_styles > 5:
            self.issues['HTML'].append(f"{rel_path}: 인라인 스타일 {inline_styles}개 발견")
        
        # 인라인 스크립트 검사
        inline_scripts = len(re.findall(r'<script[^>]*>(?!.*src=)[\s\S]*?</script>', content))
        if inline_scripts > 0:
            self.issues['HTML'].append(f"{rel_path}: 인라인 스크립트 {inline_scripts}개")
        
        # 중복 스크립트/CSS 로드
        scripts = re.findall(r'<script[^>]*src=["\'](.*?)["\']', content)
        css_files = re.findall(r'<link[^>]*href=["\'](.*?\.css)["\']', content)
        
        # SEO 메타 태그
        if '<meta name="description"' not in content:
            self.issues['SEO'].append(f"{rel_path}: description 메타 태그 누락")
        
        # 접근성
        imgs_without_alt = len(re.findall(r'<img(?![^>]*alt=)[^>]*>', content))
        if imgs_without_alt > 0:
            self.issues['접근성'].append(f"{rel_path}: alt 속성 없는 이미지 {imgs_without_alt}개")
            
        self.stats['html_files'] += 1
        
    def analyze_css_file(self, file_path):
        """CSS 파일 분석"""
        content = file_path.read_text(encoding='utf-8', errors='ignore')
        rel_path = file_path.relative_to(self.root)
        
        # !important 사용
        important_count = content.count('!important')
        if important_count > 20:
            self.issues['CSS'].append(f"{rel_path}: !important {important_count}개 (과다)")
        
        # 중복 선택자 간단 체크
        selectors = re.findall(r'([.#]?[a-zA-Z0-9-_]+)\s*{', content)
        duplicates = [s for s in selectors if selectors.count(s) > 3]
        if duplicates:
            self.issues['CSS'].append(f"{rel_path}: 중복 선택자 의심")
        
        # 벤더 프리픽스
        if '-webkit-' in content or '-moz-' in content:
            self.issues['CSS'].append(f"{rel_path}: 오래된 벤더 프리픽스 사용")
            
        self.stats['css_files'] += 1
        self.stats['css_size'] += len(content)
        
    def analyze_js_file(self, file_path):
        """JavaScript 파일 분석"""
        content = file_path.read_text(encoding='utf-8', errors='ignore')
        rel_path = file_path.relative_to(self.root)
        
        # console.log 체크
        console_logs = len(re.findall(r'console\.log', content))
        if console_logs > 0:
            self.issues['JavaScript'].append(f"{rel_path}: console.log {console_logs}개")
        
        # var 사용
        var_usage = len(re.findall(r'\bvar\s+', content))
        if var_usage > 0:
            self.issues['JavaScript'].append(f"{rel_path}: var 키워드 {var_usage}개 (let/const 권장)")
        
        # 전역 변수 의심
        global_vars = re.findall(r'^(?!function|const|let|var|class|import|export)\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=', content, re.MULTILINE)
        if global_vars:
            self.issues['JavaScript'].append(f"{rel_path}: 전역 변수 의심 {len(global_vars)}개")
        
        # TODO/FIXME 주석
        todos = len(re.findall(r'//\s*(TODO|FIXME|HACK|XXX)', content))
        if todos > 0:
            self.issues['유지보수'].append(f"{rel_path}: TODO/FIXME 주석 {todos}개")
            
        self.stats['js_files'] += 1
        self.stats['js_size'] += len(content)
        
    def analyze_project(self):
        """전체 프로젝트 분석"""
        print("🔍 프로젝트 구조 분석 중...\n")
        
        # HTML 파일 분석
        for html_file in self.root.rglob('*.html'):
            if 'node_modules' not in str(html_file) and 'old_reports' not in str(html_file):
                self.analyze_html_file(html_file)
        
        # CSS 파일 분석
        for css_file in self.root.rglob('*.css'):
            if 'node_modules' not in str(css_file):
                self.analyze_css_file(css_file)
        
        # JS 파일 분석
        for js_file in self.root.rglob('*.js'):
            if 'node_modules' not in str(js_file) and '.min.js' not in str(js_file):
                self.analyze_js_file(js_file)
        
        # 특수 파일 체크
        self.check_special_files()
        
    def check_special_files(self):
        """특수 파일 및 설정 체크"""
        # robots.txt
        robots_file = self.root / 'robots.txt'
        if robots_file.exists():
            content = robots_file.read_text(encoding='utf-8', errors='ignore')
            if 'Sitemap:' not in content:
                self.issues['SEO'].append("robots.txt: 사이트맵 참조 누락")
        
        # manifest.json
        manifest_file = self.root / 'manifest.json'
        if manifest_file.exists():
            try:
                manifest = json.loads(manifest_file.read_text(encoding='utf-8'))
                if not manifest.get('icons'):
                    self.issues['PWA'].append("manifest.json: 아이콘 정의 누락")
            except Exception as e:
                self.issues['설정'].append(f"manifest.json: 파싱 오류 - {str(e)}")
                
    def generate_ai_review_data(self):
        """AI 리뷰를 위한 데이터 생성"""
        review_data = {
            "project_stats": dict(self.stats),
            "issues_found": dict(self.issues),
            "file_structure": self.get_file_structure(),
            "key_files_content": self.get_key_files_content(),
            "recommendations": self.generate_recommendations()
        }
        
        return review_data
        
    def get_file_structure(self):
        """파일 구조 요약"""
        structure = {
            "pages": [],
            "styles": [],
            "scripts": [],
            "api": [],
            "assets": []
        }
        
        for html in self.root.rglob('*.html'):
            if 'node_modules' not in str(html):
                structure['pages'].append(str(html.relative_to(self.root)))
                
        for css in self.root.glob('css/*.css'):
            structure['styles'].append(str(css.relative_to(self.root)))
            
        for js in self.root.glob('js/*.js'):
            if '.min.js' not in str(js):
                structure['scripts'].append(str(js.relative_to(self.root)))
                
        return structure
        
    def get_key_files_content(self):
        """주요 파일 내용 샘플"""
        key_files = {
            "main.js": (self.root / 'js/main.js', 2000),
            "styles.css": (self.root / 'css/styles.css', 1500),
            "index.html": (self.root / 'index.html', 1500),
            "api/fortune.js": (self.root / 'api/fortune.js', 1000)
        }
        
        contents = {}
        for name, (path, limit) in key_files.items():
            if path.exists():
                content = path.read_text(encoding='utf-8', errors='ignore')
                contents[name] = content[:limit] + "..." if len(content) > limit else content
                
        return contents
        
    def generate_recommendations(self):
        """기본 권장사항 생성"""
        recommendations = {
            "immediate": [],
            "short_term": [],
            "long_term": []
        }
        
        # 즉시 수정
        if self.issues['JavaScript']:
            recommendations['immediate'].append("console.log 제거 및 프로덕션 빌드 프로세스 구축")
        if self.issues['접근성']:
            recommendations['immediate'].append("이미지 alt 속성 추가로 접근성 개선")
            
        # 단기 개선
        if self.issues['CSS']:
            recommendations['short_term'].append("CSS 리팩토링 - !important 사용 최소화")
        if self.issues['HTML']:
            recommendations['short_term'].append("인라인 스타일/스크립트를 외부 파일로 분리")
            
        # 장기 계획
        recommendations['long_term'].append("모듈 번들러 도입 (Webpack/Vite)")
        recommendations['long_term'].append("TypeScript 마이그레이션 검토")
        recommendations['long_term'].append("자동화된 테스트 스위트 구축")
        
        return recommendations
        
    def print_summary(self):
        """분석 요약 출력"""
        print("\n" + "="*60)
        print("📊 doha.kr 프로젝트 빠른 분석 결과")
        print("="*60)
        
        print(f"\n📈 프로젝트 통계:")
        print(f"- HTML 파일: {self.stats['html_files']}개")
        print(f"- CSS 파일: {self.stats['css_files']}개 (총 {self.stats['css_size']:,} bytes)")
        print(f"- JS 파일: {self.stats['js_files']}개 (총 {self.stats['js_size']:,} bytes)")
        
        print(f"\n⚠️ 발견된 이슈 요약:")
        for category, issues in self.issues.items():
            if issues:
                print(f"\n{category} ({len(issues)}개):")
                for issue in issues[:3]:  # 각 카테고리별 상위 3개만
                    print(f"  - {issue}")
                if len(issues) > 3:
                    print(f"  ... 외 {len(issues)-3}개")
                    
    def save_results(self):
        """결과 저장"""
        from datetime import datetime
        timestamp = f'project_analysis_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        
        results = {
            "analysis_date": datetime.now().isoformat(),
            "project_path": str(self.root),
            "statistics": dict(self.stats),
            "issues": dict(self.issues),
            "ai_review_data": self.generate_ai_review_data()
        }
        
        with open(timestamp, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
            
        print(f"\n💾 분석 결과 저장: {timestamp}")
        return timestamp

def main():
    analyzer = QuickProjectAnalyzer()
    analyzer.analyze_project()
    analyzer.print_summary()
    result_file = analyzer.save_results()
    
    print("\n🤖 AI 리뷰를 위한 프롬프트:")
    print("-" * 60)
    print(f"""
다음은 doha.kr 웹 프로젝트의 분석 결과입니다. 
30년 경력의 웹 아키텍트 관점에서 심층 리뷰해주세요:

1. 발견된 주요 이슈들의 비즈니스 임팩트
2. 한국 시장에서의 경쟁력 강화 방안
3. 기술 부채 해결 우선순위
4. 투자 대비 효과가 높은 개선사항
5. 장기적 확장성을 위한 아키텍처 제안

분석 데이터는 {result_file} 파일을 참조하세요.
""")

if __name__ == "__main__":
    main()