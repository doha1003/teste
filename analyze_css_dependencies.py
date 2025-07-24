#!/usr/bin/env python3
"""
CSS 의존성 분석 스크립트
모든 HTML 파일의 CSS 참조를 분석하고 문제점을 찾습니다.
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple
from bs4 import BeautifulSoup
import glob

class CSSAnalyzer:
    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.report = {
            "analyzed_at": datetime.now().isoformat(),
            "html_files": {},
            "css_files": {},
            "issues": {
                "missing_css": [],
                "incorrect_paths": [],
                "duplicate_definitions": {},
                "unused_css": [],
                "conflicting_rules": []
            },
            "css_class_locations": {},
            "summary": {}
        }
        
    def find_all_files(self):
        """모든 HTML과 CSS 파일 찾기"""
        # HTML 파일 찾기 (node_modules, reports 제외)
        html_files = []
        for pattern in ['*.html', '**/*.html']:
            for file in self.root_dir.glob(pattern):
                if ('node_modules' not in str(file) and 
                    'reports' not in str(file) and
                    'dom_snapshot' not in str(file) and
                    not str(file).endswith('.backup')):
                    html_files.append(file)
                    
        # CSS 파일 찾기
        css_files = []
        for pattern in ['css/*.css', 'css/**/*.css']:
            for file in self.root_dir.glob(pattern):
                if not str(file).endswith('.min.css'):
                    css_files.append(file)
                    
        return html_files, css_files
        
    def analyze_html_css_references(self, html_file: Path) -> Dict:
        """HTML 파일에서 CSS 참조 분석"""
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
                soup = BeautifulSoup(content, 'html.parser')
                
            # 상대 경로 계산을 위한 HTML 파일의 디렉토리
            html_dir = html_file.parent
            relative_path = html_file.relative_to(self.root_dir)
            
            css_refs = []
            
            # link 태그로 참조된 CSS
            for link in soup.find_all('link', rel='stylesheet'):
                href = link.get('href', '')
                if href and not href.startswith(('http://', 'https://', '//')):
                    css_refs.append({
                        'type': 'link',
                        'path': href,
                        'resolved_path': self._resolve_path(html_dir, href),
                        'exists': False,
                        'line': self._find_line_number(content, str(link))
                    })
                    
            # style 태그 내용
            style_tags = soup.find_all('style')
            if style_tags:
                css_refs.append({
                    'type': 'inline',
                    'count': len(style_tags),
                    'total_size': sum(len(tag.string or '') for tag in style_tags)
                })
                
            # 인라인 스타일
            inline_styles = soup.find_all(style=True)
            if inline_styles:
                css_refs.append({
                    'type': 'inline_style',
                    'count': len(inline_styles)
                })
                
            return {
                'path': str(relative_path),
                'css_references': css_refs,
                'classes_used': self._extract_classes_used(soup)
            }
            
        except Exception as e:
            return {
                'path': str(html_file.relative_to(self.root_dir)),
                'error': str(e)
            }
            
    def _resolve_path(self, html_dir: Path, css_path: str) -> str:
        """CSS 경로를 절대 경로로 변환"""
        if css_path.startswith('/'):
            # 루트 기준 절대 경로
            resolved = self.root_dir / css_path[1:]
        else:
            # 상대 경로
            resolved = (html_dir / css_path).resolve()
            
        try:
            return str(resolved.relative_to(self.root_dir))
        except:
            return str(resolved)
            
    def _find_line_number(self, content: str, search_str: str) -> int:
        """문자열이 나타나는 줄 번호 찾기"""
        lines = content.split('\n')
        for i, line in enumerate(lines, 1):
            if search_str in line:
                return i
        return -1
        
    def _extract_classes_used(self, soup: BeautifulSoup) -> Set[str]:
        """HTML에서 사용된 클래스 추출"""
        classes = set()
        for elem in soup.find_all(class_=True):
            if isinstance(elem['class'], list):
                classes.update(elem['class'])
            else:
                classes.add(elem['class'])
        return list(classes)
        
    def analyze_css_file(self, css_file: Path) -> Dict:
        """CSS 파일 분석"""
        try:
            with open(css_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # CSS 클래스 추출
            classes = set()
            class_pattern = r'\.([a-zA-Z0-9_-]+)\s*[{,:]'
            for match in re.finditer(class_pattern, content):
                classes.add(match.group(1))
                
            # ID 선택자 추출
            ids = set()
            id_pattern = r'#([a-zA-Z0-9_-]+)\s*[{,:]'
            for match in re.finditer(id_pattern, content):
                ids.add(match.group(1))
                
            # 중요한 CSS 속성 추출
            important_props = []
            important_pattern = r'([^{};]+):\s*([^;]+)\s*!important'
            for match in re.finditer(important_pattern, content):
                important_props.append({
                    'property': match.group(1).strip(),
                    'value': match.group(2).strip()
                })
                
            return {
                'path': str(css_file.relative_to(self.root_dir)),
                'size': len(content),
                'classes': list(classes),
                'ids': list(ids),
                'important_count': len(important_props),
                'important_props': important_props[:10]  # 처음 10개만
            }
            
        except Exception as e:
            return {
                'path': str(css_file.relative_to(self.root_dir)),
                'error': str(e)
            }
            
    def check_css_existence(self):
        """CSS 파일 존재 여부 확인"""
        for html_path, html_data in self.report['html_files'].items():
            if 'css_references' in html_data:
                for ref in html_data['css_references']:
                    if ref.get('type') == 'link':
                        css_path = ref['resolved_path']
                        full_path = self.root_dir / css_path
                        ref['exists'] = full_path.exists()
                        
                        if not ref['exists']:
                            self.report['issues']['missing_css'].append({
                                'html': html_path,
                                'css': ref['path'],
                                'resolved': css_path,
                                'line': ref.get('line', -1)
                            })
                            
    def find_class_definitions(self):
        """특정 클래스들이 정의된 위치 찾기"""
        target_classes = [
            'btn', 'btn-primary', 'btn-secondary',
            'zodiac-card', 'fortune-card',
            'test-start-btn', 'calculate-btn',
            'card', 'fortune-grid'
        ]
        
        for target in target_classes:
            locations = []
            for css_path, css_data in self.report['css_files'].items():
                if 'classes' in css_data and target in css_data['classes']:
                    locations.append(css_path)
                    
            self.report['css_class_locations'][target] = locations
            
    def find_duplicate_definitions(self):
        """중복 정의된 클래스 찾기"""
        class_files = {}
        
        for css_path, css_data in self.report['css_files'].items():
            if 'classes' in css_data:
                for class_name in css_data['classes']:
                    if class_name not in class_files:
                        class_files[class_name] = []
                    class_files[class_name].append(css_path)
                    
        # 여러 파일에 정의된 클래스
        for class_name, files in class_files.items():
            if len(files) > 1:
                self.report['issues']['duplicate_definitions'][class_name] = files
                
    def analyze_specific_pages(self):
        """특정 페이지들의 CSS 상태 분석"""
        target_pages = [
            'tests/mbti/index.html',
            'tests/mbti/test.html',
            'tests/teto-egen/index.html',
            'tests/teto-egen/test.html',
            'tests/love-dna/index.html',
            'fortune',  # fortune 하위 모든 페이지
            'tools'     # tools 하위 모든 페이지
        ]
        
        specific_analysis = {}
        
        for html_path, html_data in self.report['html_files'].items():
            for target in target_pages:
                if target in html_path:
                    specific_analysis[html_path] = {
                        'css_count': len([r for r in html_data.get('css_references', []) if r.get('type') == 'link']),
                        'missing_css': [r for r in html_data.get('css_references', []) if r.get('type') == 'link' and not r.get('exists', True)],
                        'classes_used': len(html_data.get('classes_used', [])),
                        'has_inline_styles': any(r.get('type') in ['inline', 'inline_style'] for r in html_data.get('css_references', []))
                    }
                    
        self.report['specific_pages_analysis'] = specific_analysis
        
    def generate_summary(self):
        """요약 정보 생성"""
        self.report['summary'] = {
            'total_html_files': len(self.report['html_files']),
            'total_css_files': len(self.report['css_files']),
            'missing_css_count': len(self.report['issues']['missing_css']),
            'duplicate_classes_count': len(self.report['issues']['duplicate_definitions']),
            'pages_with_issues': len([h for h, d in self.report['html_files'].items() 
                                     if any(not r.get('exists', True) for r in d.get('css_references', []) if r.get('type') == 'link')])
        }
        
    def run_analysis(self):
        """전체 분석 실행"""
        print("CSS 의존성 분석 시작...")
        
        # 파일 찾기
        html_files, css_files = self.find_all_files()
        print(f"발견된 파일: {len(html_files)} HTML, {len(css_files)} CSS")
        
        # HTML 분석
        print("\nHTML 파일 분석 중...")
        for html_file in html_files:
            result = self.analyze_html_css_references(html_file)
            self.report['html_files'][result['path']] = result
            
        # CSS 분석
        print("\nCSS 파일 분석 중...")
        for css_file in css_files:
            result = self.analyze_css_file(css_file)
            self.report['css_files'][result['path']] = result
            
        # 추가 분석
        print("\n추가 분석 수행 중...")
        self.check_css_existence()
        self.find_class_definitions()
        self.find_duplicate_definitions()
        self.analyze_specific_pages()
        self.generate_summary()
        
        # 보고서 저장
        output_file = 'css_dependency_analysis.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.report, f, indent=2, ensure_ascii=False)
            
        print(f"\n분석 완료! 결과가 {output_file}에 저장되었습니다.")
        
        # 주요 결과 출력
        self.print_key_findings()
        
    def print_key_findings(self):
        """주요 발견사항 출력"""
        print("\n=== 주요 발견사항 ===")
        print(f"\n1. 전체 현황:")
        print(f"   - HTML 파일: {self.report['summary']['total_html_files']}개")
        print(f"   - CSS 파일: {self.report['summary']['total_css_files']}개")
        print(f"   - 누락된 CSS 참조: {self.report['summary']['missing_css_count']}개")
        print(f"   - 문제가 있는 페이지: {self.report['summary']['pages_with_issues']}개")
        
        if self.report['issues']['missing_css']:
            print(f"\n2. 누락된 CSS 파일 (상위 10개):")
            for issue in self.report['issues']['missing_css'][:10]:
                print(f"   - {issue['html']} → {issue['css']}")
                
        print(f"\n3. 주요 클래스 위치:")
        for class_name, locations in self.report['css_class_locations'].items():
            if locations:
                print(f"   - .{class_name}: {', '.join(locations)}")
            else:
                print(f"   - .{class_name}: [정의되지 않음]")
                
        if self.report['issues']['duplicate_definitions']:
            print(f"\n4. 중복 정의된 클래스 (상위 10개):")
            for class_name, files in list(self.report['issues']['duplicate_definitions'].items())[:10]:
                print(f"   - .{class_name}: {len(files)}개 파일에서 정의")
                
        print(f"\n5. 특정 페이지 분석:")
        for page, analysis in list(self.report.get('specific_pages_analysis', {}).items())[:5]:
            if analysis['missing_css']:
                print(f"   - {page}: CSS {analysis['css_count']}개 중 {len(analysis['missing_css'])}개 누락")

if __name__ == "__main__":
    analyzer = CSSAnalyzer(r"C:\Users\pc\teste")
    analyzer.run_analysis()