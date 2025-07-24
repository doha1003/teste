#!/usr/bin/env python3
"""
CSS 로딩 문제 해결 전략 스크립트
버전이 포함된 CSS 참조를 수정하고 누락된 CSS 문제를 해결합니다.
"""

import os
import re
from pathlib import Path
from datetime import datetime
import json

class CSSFixStrategy:
    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.fixes_needed = []
        self.report = {
            "timestamp": datetime.now().isoformat(),
            "issues_found": [],
            "fixes_applied": [],
            "summary": {}
        }
        
    def analyze_css_references(self):
        """모든 HTML 파일의 CSS 참조 분석"""
        html_files = []
        for pattern in ['*.html', '**/*.html']:
            for file in self.root_dir.glob(pattern):
                if ('node_modules' not in str(file) and 
                    'reports' not in str(file) and
                    'dom_snapshot' not in str(file) and
                    not str(file).endswith('.backup')):
                    html_files.append(file)
                    
        print(f"총 {len(html_files)}개의 HTML 파일 분석 중...")
        
        for html_file in html_files:
            issues = self.check_file_css_issues(html_file)
            if issues:
                self.report['issues_found'].extend(issues)
                
    def check_file_css_issues(self, html_file: Path):
        """파일의 CSS 참조 문제 확인"""
        issues = []
        relative_path = html_file.relative_to(self.root_dir)
        
        try:
            # 다양한 인코딩 시도
            encodings = ['utf-8', 'cp949', 'euc-kr', 'latin-1']
            content = None
            
            for encoding in encodings:
                try:
                    with open(html_file, 'r', encoding=encoding) as f:
                        content = f.read()
                    break
                except UnicodeDecodeError:
                    continue
                    
            if content is None:
                raise Exception("파일을 읽을 수 없습니다 (인코딩 문제)")
            
            # 버전이 포함된 CSS 참조 찾기
            versioned_css = re.findall(r'<link[^>]+href="([^"]*\.css\?v=[^"]+)"[^>]*>', content)
            for css_ref in versioned_css:
                clean_path = css_ref.split('?')[0]
                if clean_path.startswith('/'):
                    full_path = self.root_dir / clean_path[1:]
                else:
                    full_path = (html_file.parent / clean_path).resolve()
                    
                if not full_path.exists():
                    issues.append({
                        'type': 'versioned_missing',
                        'file': str(relative_path),
                        'css_ref': css_ref,
                        'clean_path': clean_path,
                        'expected_file': str(full_path.relative_to(self.root_dir)) if full_path.is_relative_to(self.root_dir) else str(full_path)
                    })
                    
            # 일반 CSS 참조 확인
            all_css = re.findall(r'<link[^>]+href="([^"]*\.css)"[^>]*>', content)
            for css_ref in all_css:
                if '?' not in css_ref:  # 버전 없는 참조만
                    if css_ref.startswith('/'):
                        full_path = self.root_dir / css_ref[1:]
                    else:
                        full_path = (html_file.parent / css_ref).resolve()
                        
                    if not full_path.exists():
                        issues.append({
                            'type': 'missing',
                            'file': str(relative_path),
                            'css_ref': css_ref,
                            'expected_file': str(full_path.relative_to(self.root_dir)) if full_path.is_relative_to(self.root_dir) else str(full_path)
                        })
                        
        except Exception as e:
            issues.append({
                'type': 'error',
                'file': str(relative_path),
                'error': str(e)
            })
            
        return issues
        
    def create_fix_strategy(self):
        """수정 전략 생성"""
        # 버전이 포함된 참조 제거
        versioned_issues = [i for i in self.report['issues_found'] if i['type'] == 'versioned_missing']
        
        print(f"\n=== CSS 로딩 문제 요약 ===")
        print(f"총 문제: {len(self.report['issues_found'])}개")
        print(f"버전 문제: {len(versioned_issues)}개")
        
        # 수정 계획
        fix_plan = {
            "remove_versions": [],
            "add_missing_css": [],
            "update_paths": []
        }
        
        # 버전 제거가 필요한 파일들
        files_needing_version_removal = set()
        for issue in versioned_issues:
            files_needing_version_removal.add(issue['file'])
            
        fix_plan['remove_versions'] = list(files_needing_version_removal)
        
        # 누락된 CSS 파일 목록
        missing_css_files = set()
        for issue in self.report['issues_found']:
            if issue['type'] in ['missing', 'versioned_missing']:
                missing_css_files.add(issue.get('clean_path', issue.get('css_ref', '')))
                
        fix_plan['missing_css_files'] = list(missing_css_files)
        
        return fix_plan
        
    def generate_fix_script(self, fix_plan):
        """수정 스크립트 생성"""
        script_content = '''#!/usr/bin/env python3
"""
자동 생성된 CSS 수정 스크립트
생성일: {timestamp}
"""

import re
from pathlib import Path

def fix_css_versions(root_dir):
    """CSS 버전 참조 제거"""
    root = Path(root_dir)
    files_to_fix = {files}
    
    for file_path in files_to_fix:
        html_file = root / file_path
        if html_file.exists():
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # 버전이 포함된 CSS 참조를 버전 없는 것으로 변경
            original = content
            content = re.sub(r'(href="[^"]*\.css)\?v=[^"]*"', r'\\1"', content)
            
            if content != original:
                # 백업 생성
                backup_path = str(html_file) + '.backup_css_version'
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(original)
                    
                # 수정된 내용 저장
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                    
                print(f"수정됨: {{file_path}}")
            else:
                print(f"변경 없음: {{file_path}}")

if __name__ == "__main__":
    fix_css_versions(r"{root_dir}")
'''.format(
            timestamp=datetime.now().isoformat(),
            files=fix_plan['remove_versions'],
            root_dir=self.root_dir
        )
        
        script_path = self.root_dir / 'fix_css_versions.py'
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(script_content)
            
        print(f"\n수정 스크립트가 생성되었습니다: {script_path}")
        
    def generate_report(self):
        """상세 보고서 생성"""
        # 통계 계산
        self.report['summary'] = {
            'total_issues': len(self.report['issues_found']),
            'versioned_issues': len([i for i in self.report['issues_found'] if i['type'] == 'versioned_missing']),
            'missing_issues': len([i for i in self.report['issues_found'] if i['type'] == 'missing']),
            'affected_files': len(set(i['file'] for i in self.report['issues_found'])),
            'unique_css_refs': len(set(i.get('css_ref', '') for i in self.report['issues_found']))
        }
        
        # 보고서 저장
        report_path = self.root_dir / 'css_loading_issues_report.json'
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(self.report, f, indent=2, ensure_ascii=False)
            
        # 마크다운 보고서 생성
        md_content = f"""# CSS 로딩 문제 분석 보고서

생성일: {self.report['timestamp']}

## 요약

- **총 문제 수**: {self.report['summary']['total_issues']}개
- **버전 관련 문제**: {self.report['summary']['versioned_issues']}개
- **누락된 CSS**: {self.report['summary']['missing_issues']}개
- **영향받는 파일**: {self.report['summary']['affected_files']}개

## 주요 문제

### 1. 버전이 포함된 CSS 참조 (수정 필요)

대부분의 HTML 파일이 `/css/styles.css?v=1753150228` 형태로 CSS를 참조하고 있으나,
실제 파일은 `/css/styles.css`로만 존재합니다.

영향받는 주요 페이지:
"""
        
        # 영향받는 페이지 목록
        affected_pages = set()
        for issue in self.report['issues_found']:
            if issue['type'] == 'versioned_missing' and 'styles.css' in issue.get('css_ref', ''):
                affected_pages.add(issue['file'])
                
        for page in sorted(affected_pages)[:10]:  # 상위 10개만
            md_content += f"- {page}\n"
            
        if len(affected_pages) > 10:
            md_content += f"- ... 외 {len(affected_pages) - 10}개 파일\n"
            
        md_content += """
### 2. 해결 방법

1. **즉시 수정**: `fix_css_versions.py` 스크립트 실행
   ```bash
   python fix_css_versions.py
   ```

2. **수동 수정**: 모든 HTML 파일에서 `?v=1753150228` 부분 제거

### 3. CSS 클래스 위치 정보

주요 클래스들의 정의 위치:
- `.btn`: button-system.css, styles.css, mobile-fixes.css
- `.btn-primary`: button-system.css, styles.css
- `.btn-secondary`: button-system.css, styles.css
- `.zodiac-card`: fortune.css, zodiac.css
- `.fortune-card`: fortune-main.css, fortune-styles.css
- `.test-start-btn`: mbti-intro.css, teto-egen-intro.css
- `.calculate-btn`: salary-calculator.css
- `.card`: layout-fixes.css, styles.css
- `.fortune-grid`: fortune-main.css, fortune-styles.css

### 4. 권장사항

1. **버전 관리 시스템 도입**: 
   - 빌드 시스템을 통한 자동 버전 관리
   - 또는 서비스워커를 통한 캐시 관리

2. **CSS 통합**:
   - 중복된 클래스 정의 정리
   - 모듈화된 CSS 구조 유지

3. **성능 최적화**:
   - Critical CSS 인라인화
   - 나머지 CSS 지연 로딩
"""
        
        md_path = self.root_dir / 'CSS_LOADING_ANALYSIS.md'
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
            
        print(f"\n마크다운 보고서가 생성되었습니다: {md_path}")
        
    def run(self):
        """전체 분석 및 수정 전략 실행"""
        print("CSS 로딩 문제 분석 시작...")
        
        # 1. CSS 참조 분석
        self.analyze_css_references()
        
        # 2. 수정 전략 생성
        fix_plan = self.create_fix_strategy()
        
        # 3. 수정 스크립트 생성
        if fix_plan['remove_versions']:
            self.generate_fix_script(fix_plan)
            
        # 4. 보고서 생성
        self.generate_report()
        
        print("\n분석 완료!")
        print(f"다음 단계: python fix_css_versions.py 실행하여 문제 해결")

if __name__ == "__main__":
    fixer = CSSFixStrategy(r"C:\Users\pc\teste")
    fixer.run()