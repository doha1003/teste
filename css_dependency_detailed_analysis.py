#!/usr/bin/env python3
"""
CSS 의존성 상세 분석 및 보고서 생성
"""

import os
import re
from pathlib import Path
from datetime import datetime
import json

def analyze_css_dependencies():
    """CSS 의존성 문제 상세 분석"""
    root_dir = Path(r"C:\Users\pc\teste")
    report = {
        "timestamp": datetime.now().isoformat(),
        "versioned_css_issues": [],
        "missing_css_files": [],
        "duplicate_classes": {},
        "css_class_locations": {},
        "summary": {}
    }
    
    # 1. HTML 파일에서 CSS 참조 분석
    print("1. HTML 파일의 CSS 참조 분석 중...")
    html_files = []
    for pattern in ['*.html', '**/*.html']:
        for file in root_dir.glob(pattern):
            if ('node_modules' not in str(file) and 
                'reports' not in str(file) and
                'dom_snapshot' not in str(file) and
                '.backup' not in str(file)):
                html_files.append(file)
    
    print(f"   발견된 HTML 파일: {len(html_files)}개")
    
    # 각 HTML 파일 분석
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            relative_path = html_file.relative_to(root_dir)
            
            # 버전이 포함된 CSS 찾기
            versioned_matches = re.findall(r'href="([^"]*\.css\?v=[^"]+)"', content)
            for match in versioned_matches:
                clean_path = match.split('?')[0]
                if clean_path.startswith('/'):
                    actual_file = root_dir / clean_path[1:]
                else:
                    actual_file = (html_file.parent / clean_path).resolve()
                
                exists = actual_file.exists()
                
                report['versioned_css_issues'].append({
                    'html_file': str(relative_path),
                    'css_reference': match,
                    'clean_path': clean_path,
                    'actual_file_exists': exists,
                    'actual_file_path': str(actual_file.relative_to(root_dir)) if actual_file.is_relative_to(root_dir) else str(actual_file)
                })
                
        except Exception as e:
            print(f"   오류 발생 ({html_file}): {e}")
    
    # 2. CSS 파일에서 클래스 분석
    print("\n2. CSS 파일의 클래스 정의 분석 중...")
    css_files = list(root_dir.glob('css/**/*.css'))
    css_files = [f for f in css_files if not str(f).endswith('.min.css')]
    
    print(f"   발견된 CSS 파일: {len(css_files)}개")
    
    # 주요 클래스 찾기
    target_classes = [
        'btn', 'btn-primary', 'btn-secondary',
        'zodiac-card', 'fortune-card',
        'test-start-btn', 'calculate-btn',
        'card', 'fortune-grid'
    ]
    
    for css_file in css_files:
        try:
            with open(css_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            relative_path = css_file.relative_to(root_dir)
            
            # 클래스 정의 찾기
            for target_class in target_classes:
                pattern = rf'\.{re.escape(target_class)}\s*[{{,:]'
                if re.search(pattern, content):
                    if target_class not in report['css_class_locations']:
                        report['css_class_locations'][target_class] = []
                    report['css_class_locations'][target_class].append(str(relative_path))
                    
        except Exception as e:
            print(f"   오류 발생 ({css_file}): {e}")
    
    # 3. 특정 페이지 분석
    print("\n3. 특정 페이지의 CSS 상태 분석 중...")
    specific_pages = [
        'tests/mbti/index.html',
        'tests/mbti/test.html',
        'tests/teto-egen/index.html',
        'tests/teto-egen/test.html',
        'tests/love-dna/index.html',
        'tests/love-dna/test.html',
        'fortune/index.html',
        'fortune/saju/index.html',
        'fortune/tarot/index.html',
        'fortune/zodiac/index.html',
        'fortune/zodiac-animal/index.html',
        'fortune/daily/index.html',
        'tools/index.html',
        'tools/bmi-calculator.html',
        'tools/salary-calculator.html',
        'tools/text-counter.html'
    ]
    
    specific_analysis = {}
    
    for page_path in specific_pages:
        full_path = root_dir / page_path
        if full_path.exists():
            try:
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                # CSS 참조 분석
                css_links = re.findall(r'<link[^>]+href="([^"]+\.css[^"]*)"[^>]*>', content)
                versioned_css = [link for link in css_links if '?v=' in link]
                clean_css = [link for link in css_links if '?v=' not in link]
                
                # 인라인 스타일 확인
                inline_styles = len(re.findall(r'<style[^>]*>', content))
                inline_style_attrs = len(re.findall(r'style="[^"]*"', content))
                
                specific_analysis[page_path] = {
                    'total_css_links': len(css_links),
                    'versioned_css': versioned_css,
                    'clean_css': clean_css,
                    'inline_style_tags': inline_styles,
                    'inline_style_attributes': inline_style_attrs
                }
                
            except Exception as e:
                specific_analysis[page_path] = {'error': str(e)}
    
    report['specific_pages'] = specific_analysis
    
    # 4. 요약 정보 생성
    report['summary'] = {
        'total_html_files': len(html_files),
        'total_versioned_issues': len(report['versioned_css_issues']),
        'affected_html_files': len(set(issue['html_file'] for issue in report['versioned_css_issues'])),
        'total_css_files': len(css_files),
        'classes_with_locations': len(report['css_class_locations'])
    }
    
    # 보고서 저장
    with open(root_dir / 'css_detailed_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    # 마크다운 보고서 생성
    create_markdown_report(report, root_dir)
    
    print("\n분석 완료!")
    print(f"보고서 생성됨: css_detailed_report.json, CSS_DEPENDENCY_REPORT.md")

def create_markdown_report(report, root_dir):
    """마크다운 보고서 생성"""
    md_content = f"""# CSS 의존성 상세 분석 보고서

생성일: {report['timestamp']}

## 1. 전체 요약

- **분석된 HTML 파일**: {report['summary']['total_html_files']}개
- **버전이 포함된 CSS 참조**: {report['summary']['total_versioned_issues']}개
- **영향받는 HTML 파일**: {report['summary']['affected_html_files']}개
- **분석된 CSS 파일**: {report['summary']['total_css_files']}개

## 2. 주요 문제: 버전이 포함된 CSS 참조

대부분의 HTML 파일이 CSS 파일을 참조할 때 버전 쿼리 스트링을 포함하고 있습니다.
예: `/css/styles.css?v=1753150228`

### 영향받는 파일 목록:
"""
    
    # 버전 문제가 있는 파일들을 그룹화
    versioned_by_file = {}
    for issue in report['versioned_css_issues']:
        html_file = issue['html_file']
        if html_file not in versioned_by_file:
            versioned_by_file[html_file] = []
        versioned_by_file[html_file].append(issue['css_reference'])
    
    for html_file, css_refs in sorted(versioned_by_file.items())[:20]:
        md_content += f"\n#### {html_file}\n"
        for ref in css_refs:
            md_content += f"- `{ref}`\n"
    
    if len(versioned_by_file) > 20:
        md_content += f"\n... 외 {len(versioned_by_file) - 20}개 파일\n"
    
    md_content += """

## 3. 특정 페이지별 CSS 분석

"""
    
    for page, analysis in report['specific_pages'].items():
        if 'error' not in analysis:
            md_content += f"""### {page}
- CSS 링크 수: {analysis['total_css_links']}
- 버전 포함 CSS: {len(analysis['versioned_css'])}개
- 인라인 스타일 태그: {analysis['inline_style_tags']}개
- 인라인 스타일 속성: {analysis['inline_style_attributes']}개

"""
    
    md_content += """## 4. CSS 클래스 위치

주요 클래스들이 정의된 파일:

"""
    
    for class_name, locations in sorted(report['css_class_locations'].items()):
        md_content += f"### .{class_name}\n"
        for location in locations:
            md_content += f"- {location}\n"
        md_content += "\n"
    
    md_content += """## 5. 해결 방안

### 즉시 적용 가능한 수정

1. **버전 쿼리 스트링 제거**
   ```python
   # 모든 HTML 파일에서 ?v=숫자 패턴 제거
   content = re.sub(r'(\\.css)\\?v=\\d+', r'\\1', content)
   ```

2. **수정 스크립트 실행**
   ```bash
   python fix_css_versions.py
   ```

### 장기적 개선 사항

1. **빌드 시스템 도입**
   - Webpack, Vite 등을 사용한 자동 버전 관리
   - CSS 번들링 및 최적화

2. **캐시 버스팅 전략**
   - 파일명에 해시 포함 (예: styles.abc123.css)
   - 서비스워커를 통한 캐시 관리

3. **CSS 구조 개선**
   - 중복 클래스 정의 통합
   - 모듈별 CSS 분리 유지
   - Critical CSS 인라인화

## 6. 중복 클래스 정의

다음 클래스들이 여러 파일에 중복 정의되어 있습니다:
"""
    
    # 중복 정의 찾기
    for class_name, locations in report['css_class_locations'].items():
        if len(locations) > 1:
            md_content += f"\n- **.{class_name}**: {len(locations)}개 파일에서 정의됨\n"
            for loc in locations:
                md_content += f"  - {loc}\n"
    
    md_content += """

## 7. 권장 사항

1. **즉시 수정**: 버전 쿼리 스트링 제거로 CSS 로딩 문제 해결
2. **단기 개선**: 중복 클래스 정리 및 CSS 구조 최적화
3. **장기 계획**: 빌드 시스템 도입 및 자동화된 버전 관리
"""
    
    with open(root_dir / 'CSS_DEPENDENCY_REPORT.md', 'w', encoding='utf-8') as f:
        f.write(md_content)

if __name__ == "__main__":
    analyze_css_dependencies()