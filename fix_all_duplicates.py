#!/usr/bin/env python3
"""
모든 중복 문제를 자동으로 수정하는 스크립트
"""

import os
import re
from pathlib import Path
from bs4 import BeautifulSoup, Comment
import json
from datetime import datetime

class DuplicateFixer:
    def __init__(self, root_dir):
        self.root_dir = Path(root_dir)
        self.fixes_made = []
        
        # 실제 웹 페이지들
        self.web_pages = [
            'index.html',
            '404.html',
            'offline.html',
            'about/index.html',
            'contact/index.html',
            'faq/index.html',
            'fortune/index.html',
            'fortune/daily/index.html',
            'fortune/saju/index.html',
            'fortune/tarot/index.html',
            'fortune/zodiac/index.html',
            'fortune/zodiac-animal/index.html',
            'privacy/index.html',
            'terms/index.html',
            'tests/index.html',
            'tests/love-dna/index.html',
            'tests/love-dna/test.html',
            'tests/mbti/index.html',
            'tests/mbti/test.html',
            'tests/teto-egen/index.html',
            'tests/teto-egen/start.html',
            'tests/teto-egen/test.html',
            'tools/index.html',
            'tools/bmi-calculator.html',
            'tools/salary-calculator.html',
            'tools/text-counter.html'
        ]
    
    def fix_page(self, file_path):
        """한 페이지의 중복 문제 수정"""
        full_path = self.root_dir / file_path
        
        if not full_path.exists():
            print(f"[SKIP] 파일 없음: {file_path}")
            return
        
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
                original_content = content
            
            soup = BeautifulSoup(content, 'html.parser')
            fixes = {
                'file': file_path,
                'meta_tags_removed': 0,
                'fonts_fixed': 0,
                'other_fixes': 0
            }
            
            # 1. X-Content-Type-Options 메타 태그 중복 제거
            meta_tags = soup.find_all('meta', attrs={'http-equiv': 'X-Content-Type-Options'})
            if len(meta_tags) > 1:
                # 첫 번째만 남기고 나머지 제거
                for tag in meta_tags[1:]:
                    tag.decompose()
                    fixes['meta_tags_removed'] += 1
            
            # 2. Google Fonts 중복 수정
            font_links = []
            preconnect_links = []
            
            for link in soup.find_all('link'):
                href = link.get('href', '')
                
                # Google Fonts 찾기
                if 'fonts.googleapis.com/css' in href:
                    font_links.append(link)
                
                # Preconnect 링크 찾기
                if link.get('rel') and 'preconnect' in str(link.get('rel')):
                    preconnect_links.append(link)
            
            # Google Fonts 중복 제거 (가장 많은 폰트 웨이트를 가진 것만 유지)
            if len(font_links) > 1:
                # 각 링크의 폰트 웨이트 수 계산
                best_link = None
                max_weights = 0
                
                for link in font_links:
                    href = link.get('href', '')
                    # wght 파라미터에서 웨이트 수 계산
                    weights = re.findall(r'wght@[\d;]+', href)
                    if weights:
                        weight_count = len(weights[0].split(';'))
                        if weight_count > max_weights:
                            max_weights = weight_count
                            best_link = link
                
                # 가장 좋은 것만 남기고 나머지 제거
                if best_link:
                    for link in font_links:
                        if link != best_link:
                            link.decompose()
                            fixes['fonts_fixed'] += 1
            
            # 3. 잘못된 preconnect 링크 수정
            for link in preconnect_links:
                # 잘못된 rel 속성 수정
                tag_str = str(link)
                if 'crossorigin' in tag_str and 'rel=' in tag_str:
                    # crossorigin 속성이 rel 속성 앞에 있는 경우
                    if tag_str.find('crossorigin') < tag_str.find('rel='):
                        # 올바른 순서로 재구성
                        link['rel'] = 'preconnect'
                        if 'crossorigin' in link.attrs:
                            link['crossorigin'] = True
                        fixes['other_fixes'] += 1
            
            # 4. 중복된 rel 속성 제거
            for link in soup.find_all('link'):
                if link.has_attr('rel'):
                    # rel 속성이 리스트인 경우 첫 번째 값만 사용
                    if isinstance(link['rel'], list):
                        link['rel'] = link['rel'][0]
                        fixes['other_fixes'] += 1
            
            # 변경사항이 있으면 저장
            if fixes['meta_tags_removed'] > 0 or fixes['fonts_fixed'] > 0 or fixes['other_fixes'] > 0:
                # 백업 생성
                backup_path = full_path.with_suffix('.html.backup_before_fix')
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(original_content)
                
                # 수정된 내용 저장
                # BeautifulSoup의 prettify 대신 str()을 사용하여 원본 형식 유지
                fixed_content = str(soup)
                
                # 일부 BeautifulSoup 버그 수정
                # 빈 줄이 과도하게 생기는 문제 수정
                fixed_content = re.sub(r'\n\s*\n\s*\n', '\n\n', fixed_content)
                
                with open(full_path, 'w', encoding='utf-8') as f:
                    f.write(fixed_content)
                
                self.fixes_made.append(fixes)
                print(f"[FIXED] {file_path}: 메타태그 {fixes['meta_tags_removed']}개, 폰트 {fixes['fonts_fixed']}개, 기타 {fixes['other_fixes']}개 수정")
            else:
                print(f"[OK] {file_path}: 수정 필요 없음")
                
        except Exception as e:
            print(f"[ERROR] {file_path}: {e}")
    
    def run(self):
        """모든 페이지 수정 실행"""
        print("=== 중복 문제 자동 수정 시작 ===")
        print(f"수정할 페이지: {len(self.web_pages)}개\n")
        
        for page in self.web_pages:
            self.fix_page(page)
        
        self.print_summary()
        self.save_report()
    
    def print_summary(self):
        """수정 요약"""
        if not self.fixes_made:
            print("\n[COMPLETE] 수정할 내용이 없습니다.")
            return
        
        total_meta = sum(f['meta_tags_removed'] for f in self.fixes_made)
        total_fonts = sum(f['fonts_fixed'] for f in self.fixes_made)
        total_other = sum(f['other_fixes'] for f in self.fixes_made)
        
        print(f"\n[SUMMARY] 수정 완료:")
        print(f"  - 수정된 페이지: {len(self.fixes_made)}개")
        print(f"  - 제거된 중복 메타 태그: {total_meta}개")
        print(f"  - 수정된 폰트 링크: {total_fonts}개")
        print(f"  - 기타 수정: {total_other}개")
        print(f"  - 총 수정 사항: {total_meta + total_fonts + total_other}개")
    
    def save_report(self):
        """수정 보고서 저장"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_pages': len(self.web_pages),
            'pages_fixed': len(self.fixes_made),
            'fixes': self.fixes_made,
            'summary': {
                'total_meta_tags_removed': sum(f['meta_tags_removed'] for f in self.fixes_made),
                'total_fonts_fixed': sum(f['fonts_fixed'] for f in self.fixes_made),
                'total_other_fixes': sum(f['other_fixes'] for f in self.fixes_made)
            }
        }
        
        report_path = self.root_dir / 'duplicate_fix_report.json'
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n[REPORT] 수정 보고서 저장: {report_path}")

def main():
    root_dir = Path(__file__).parent
    fixer = DuplicateFixer(root_dir)
    fixer.run()

if __name__ == "__main__":
    main()