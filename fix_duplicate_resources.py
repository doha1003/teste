#!/usr/bin/env python3
"""
중복 스크립트와 CSS 로드 문제를 해결하는 스크립트
"""

import os
import re
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup, Comment
from collections import defaultdict
import json

class DuplicateResourceFixer:
    def __init__(self, root_dir):
        self.root_dir = Path(root_dir)
        self.fixes_made = []
        self.all_resources = defaultdict(lambda: defaultdict(list))
        
    def find_html_files(self):
        """모든 HTML 파일 찾기"""
        html_files = []
        for file_path in self.root_dir.rglob('*.html'):
            # node_modules, backup 파일 제외
            if 'node_modules' in str(file_path) or file_path.name.endswith('.backup'):
                continue
            html_files.append(file_path)
        return html_files
    
    def normalize_resource_path(self, path, base_path):
        """리소스 경로를 정규화"""
        # 버전 파라미터 제거
        path_without_version = re.sub(r'\?v=[\d.]+', '', path)
        path_without_version = re.sub(r'\?ver=[\d.]+', '', path_without_version)
        path_without_version = re.sub(r'\?version=[\d.]+', '', path_without_version)
        
        # 상대 경로를 절대 경로로 변환
        if path_without_version.startswith('/'):
            return path_without_version
        elif path_without_version.startswith('http'):
            return path_without_version
        else:
            # 상대 경로 처리
            base_dir = os.path.dirname(base_path)
            normalized = os.path.normpath(os.path.join(base_dir, path_without_version))
            return normalized.replace('\\', '/')
    
    def extract_version(self, src):
        """버전 파라미터 추출"""
        version_match = re.search(r'[?&](v|ver|version)=([\d.]+)', src)
        if version_match:
            return version_match.group(2)
        return None
    
    def fix_duplicate_resources(self, file_path):
        """한 파일에서 중복 리소스 제거"""
        print(f"\n처리 중: {file_path}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            changes_made = False
            
            # CSS 링크 처리
            css_resources = defaultdict(list)
            link_tags = soup.find_all('link', rel='stylesheet')
            
            for link in link_tags:
                href = link.get('href')
                if href:
                    normalized = self.normalize_resource_path(href, file_path)
                    version = self.extract_version(href)
                    css_resources[normalized].append({
                        'tag': link,
                        'original': href,
                        'version': version
                    })
            
            # 중복 CSS 제거
            for normalized_path, resources in css_resources.items():
                if len(resources) > 1:
                    print(f"  중복 CSS 발견: {normalized_path} ({len(resources)}개)")
                    
                    # 버전이 있는 것을 우선으로 유지
                    resources_with_version = [r for r in resources if r['version']]
                    resources_without_version = [r for r in resources if not r['version']]
                    
                    if resources_with_version:
                        # 가장 높은 버전 유지
                        keep = max(resources_with_version, key=lambda x: x['version'])
                        remove = [r for r in resources if r != keep]
                    else:
                        # 첫 번째 것만 유지
                        keep = resources[0]
                        remove = resources[1:]
                    
                    for r in remove:
                        print(f"    제거: {r['original']}")
                        r['tag'].decompose()
                        changes_made = True
                    
                    self.fixes_made.append({
                        'file': str(file_path),
                        'type': 'css',
                        'resource': normalized_path,
                        'removed': len(remove),
                        'kept': keep['original']
                    })
            
            # JavaScript 스크립트 처리
            js_resources = defaultdict(list)
            script_tags = soup.find_all('script', src=True)
            
            for script in script_tags:
                src = script.get('src')
                if src:
                    normalized = self.normalize_resource_path(src, file_path)
                    version = self.extract_version(src)
                    js_resources[normalized].append({
                        'tag': script,
                        'original': src,
                        'version': version
                    })
            
            # 중복 스크립트 제거
            for normalized_path, resources in js_resources.items():
                if len(resources) > 1:
                    print(f"  중복 Script 발견: {normalized_path} ({len(resources)}개)")
                    
                    # 버전이 있는 것을 우선으로 유지
                    resources_with_version = [r for r in resources if r['version']]
                    resources_without_version = [r for r in resources if not r['version']]
                    
                    if resources_with_version:
                        # 가장 높은 버전 유지
                        keep = max(resources_with_version, key=lambda x: x['version'])
                        remove = [r for r in resources if r != keep]
                    else:
                        # 첫 번째 것만 유지
                        keep = resources[0]
                        remove = resources[1:]
                    
                    for r in remove:
                        print(f"    제거: {r['original']}")
                        r['tag'].decompose()
                        changes_made = True
                    
                    self.fixes_made.append({
                        'file': str(file_path),
                        'type': 'js',
                        'resource': normalized_path,
                        'removed': len(remove),
                        'kept': keep['original']
                    })
            
            # 변경사항이 있으면 파일 저장
            if changes_made:
                # 백업 생성
                backup_path = file_path.with_suffix('.html.backup_duplicates')
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                # 수정된 내용 저장
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(str(soup))
                
                print(f"  ✓ 수정 완료 (백업: {backup_path})")
            else:
                print(f"  - 중복 없음")
                
        except Exception as e:
            print(f"  ✗ 오류 발생: {e}")
    
    def analyze_all_resources(self):
        """전체 사이트의 리소스 사용 분석"""
        html_files = self.find_html_files()
        
        for file_path in html_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                soup = BeautifulSoup(content, 'html.parser')
                
                # CSS 분석
                for link in soup.find_all('link', rel='stylesheet'):
                    href = link.get('href')
                    if href:
                        normalized = self.normalize_resource_path(href, file_path)
                        self.all_resources['css'][normalized].append({
                            'file': str(file_path),
                            'original': href,
                            'version': self.extract_version(href)
                        })
                
                # JS 분석
                for script in soup.find_all('script', src=True):
                    src = script.get('src')
                    if src:
                        normalized = self.normalize_resource_path(src, file_path)
                        self.all_resources['js'][normalized].append({
                            'file': str(file_path),
                            'original': src,
                            'version': self.extract_version(src)
                        })
                        
            except Exception as e:
                print(f"분석 오류 {file_path}: {e}")
    
    def run(self):
        """메인 실행 함수"""
        print("=== 중복 리소스 제거 시작 ===")
        print(f"디렉토리: {self.root_dir}")
        
        # HTML 파일 찾기
        html_files = self.find_html_files()
        print(f"\n발견된 HTML 파일: {len(html_files)}개")
        
        # 전체 리소스 분석
        print("\n전체 리소스 사용 분석 중...")
        self.analyze_all_resources()
        
        # 분석 결과 출력
        print("\n=== 리소스 사용 현황 ===")
        for resource_type, resources in self.all_resources.items():
            print(f"\n{resource_type.upper()} 리소스:")
            for path, usages in sorted(resources.items()):
                if len(usages) > 5:  # 5개 이상 파일에서 사용되는 주요 리소스
                    versions = set(u['version'] for u in usages if u['version'])
                    version_str = f" (버전: {', '.join(sorted(versions))})" if versions else ""
                    print(f"  {path}: {len(usages)}개 파일에서 사용{version_str}")
        
        # 각 파일에서 중복 제거
        print("\n=== 중복 제거 시작 ===")
        for file_path in html_files:
            self.fix_duplicate_resources(file_path)
        
        # 결과 요약
        self.print_summary()
        
        # 결과 저장
        self.save_report()
    
    def print_summary(self):
        """수정 결과 요약"""
        print("\n=== 수정 결과 요약 ===")
        
        if not self.fixes_made:
            print("중복된 리소스가 발견되지 않았습니다.")
            return
        
        # 타입별 집계
        css_fixes = [f for f in self.fixes_made if f['type'] == 'css']
        js_fixes = [f for f in self.fixes_made if f['type'] == 'js']
        
        print(f"\n총 수정 사항: {len(self.fixes_made)}건")
        print(f"- CSS 중복 제거: {len(css_fixes)}건")
        print(f"- JavaScript 중복 제거: {len(js_fixes)}건")
        
        # 파일별 집계
        files_modified = set(f['file'] for f in self.fixes_made)
        print(f"\n수정된 파일: {len(files_modified)}개")
        
        # 가장 많이 중복된 리소스
        resource_counts = defaultdict(int)
        for fix in self.fixes_made:
            resource_counts[fix['resource']] += fix['removed']
        
        if resource_counts:
            print("\n가장 많이 중복된 리소스 TOP 5:")
            for resource, count in sorted(resource_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
                print(f"  {resource}: {count}개 제거")
    
    def save_report(self):
        """상세 보고서 저장"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_fixes': len(self.fixes_made),
                'css_fixes': len([f for f in self.fixes_made if f['type'] == 'css']),
                'js_fixes': len([f for f in self.fixes_made if f['type'] == 'js']),
                'files_modified': len(set(f['file'] for f in self.fixes_made))
            },
            'fixes': self.fixes_made,
            'resource_usage': {
                resource_type: {
                    path: len(usages) 
                    for path, usages in resources.items()
                }
                for resource_type, resources in self.all_resources.items()
            }
        }
        
        report_path = self.root_dir / 'duplicate_resources_report.json'
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n상세 보고서 저장: {report_path}")

def main():
    # 현재 디렉토리에서 실행
    root_dir = Path(__file__).parent
    
    fixer = DuplicateResourceFixer(root_dir)
    fixer.run()

if __name__ == "__main__":
    main()