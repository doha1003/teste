#!/usr/bin/env python3
"""
의존성 체인 분석기 - 테토-에겐 20개 질문 변경시 영향받는 모든 파일/텍스트 자동 탐지 및 수정
"""

import os
import re
import json
from pathlib import Path

class DependencyChainAnalyzer:
    def __init__(self):
        self.changes_log = []
        self.teto_related_files = []
        self.inconsistencies = []
        
    def find_all_teto_references(self):
        """테토-에겐과 관련된 모든 파일과 텍스트 찾기"""
        
        # 검색할 패턴들
        patterns = [
            r'테토.*에겐',
            r'teto.*egen', 
            r'10개.*질문',
            r'질문.*10',
            r'50개.*질문',
            r'질문.*50',
            r'8가지.*유형',
            r'유형.*8',
            r'성격.*유형.*테스트',
            r'personality.*test',
            r'테토형|에겐형'
        ]
        
        # 검색할 파일 확장자
        extensions = ['.html', '.js', '.css', '.md', '.json', '.txt']
        
        results = {}
        
        for root, dirs, files in os.walk('.'):
            # 불필요한 디렉토리 제외
            if any(x in root for x in ['node_modules', '.git', '__pycache__', 'backup']):
                continue
                
            for file in files:
                if any(file.endswith(ext) for ext in extensions):
                    file_path = os.path.join(root, file)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            
                        matches = []
                        for pattern in patterns:
                            found = re.finditer(pattern, content, re.IGNORECASE)
                            for match in found:
                                # 앞뒤 컨텍스트 포함
                                start = max(0, match.start() - 50)
                                end = min(len(content), match.end() + 50)
                                context = content[start:end].replace('\n', '\\n')
                                
                                matches.append({
                                    'pattern': pattern,
                                    'match_text': match.group(),
                                    'position': match.span(),
                                    'context': context,
                                    'line_number': content[:match.start()].count('\n') + 1
                                })
                        
                        if matches:
                            results[file_path] = {
                                'total_matches': len(matches),
                                'matches': matches,
                                'file_size': len(content),
                                'modification_needed': True
                            }
                            
                    except Exception as e:
                        print(f"파일 읽기 오류 {file_path}: {e}")
                        
        return results
    
    def analyze_inconsistencies(self, references):
        """일관성 없는 부분들 찾기"""
        inconsistencies = []
        
        # 질문 개수 관련 불일치
        question_counts = {}
        for file_path, data in references.items():
            for match in data['matches']:
                if re.search(r'\d+개.*질문|\d+.*질문|질문.*\d+', match['match_text']):
                    numbers = re.findall(r'\d+', match['match_text'])
                    if numbers:
                        count = int(numbers[0])
                        if count not in question_counts:
                            question_counts[count] = []
                        question_counts[count].append({
                            'file': file_path,
                            'context': match['context'],
                            'line': match['line_number']
                        })
        
        if len(question_counts) > 1:
            inconsistencies.append({
                'type': 'question_count_mismatch',
                'description': '질문 개수가 파일마다 다름',
                'details': question_counts
            })
        
        # 결과 유형 개수 불일치
        result_counts = {}
        for file_path, data in references.items():
            for match in data['matches']:
                if re.search(r'\d+가지.*유형|\d+.*유형|유형.*\d+', match['match_text']):
                    numbers = re.findall(r'\d+', match['match_text'])
                    if numbers:
                        count = int(numbers[0])
                        if count not in result_counts:
                            result_counts[count] = []
                        result_counts[count].append({
                            'file': file_path,
                            'context': match['context'],
                            'line': match['line_number']
                        })
        
        if len(result_counts) > 1:
            inconsistencies.append({
                'type': 'result_count_mismatch', 
                'description': '결과 유형 개수가 파일마다 다름',
                'details': result_counts
            })
        
        return inconsistencies
    
    def generate_synchronized_content(self):
        """20개 질문, 4가지 결과에 맞는 일관된 콘텐츠 생성"""
        
        # 새로운 표준 텍스트들
        standard_texts = {
            'test_description_short': "20개의 핵심 질문으로 당신의 성격을 분석하는 테토-에겐 테스트",
            'test_description_long': "테토형과 에겐형, 당신은 어느 쪽일까요? 20개의 다양한 상황별 질문을 통해 당신의 사회성, 활동성, 감정 표현 방식을 분석하고 4가지 세분화된 유형으로 결과를 제공합니다.",
            'question_count_text': "20개 질문",
            'result_count_text': "4가지 결과 유형", 
            'test_time_estimate': "약 5-7분 소요",
            'result_types': [
                "슈퍼 테토형 - 완전 인싸 에너지",
                "마일드 테토형 - 적당한 인싸력", 
                "마일드 에겐형 - 조용한 매력",
                "슈퍼 에겐형 - 완전 내향형"
            ]
        }
        
        return standard_texts
    
    def create_update_plan(self, references, inconsistencies):
        """수정 계획 생성"""
        
        update_plan = {
            'summary': {
                'total_files': len(references),
                'total_matches': sum(data['total_matches'] for data in references.values()),
                'inconsistency_count': len(inconsistencies)
            },
            'high_priority_files': [],
            'medium_priority_files': [],
            'low_priority_files': [],
            'text_replacements': {},
            'new_content_needed': []
        }
        
        standard_texts = self.generate_synchronized_content()
        
        # 파일 우선순위 분류
        for file_path, data in references.items():
            priority = 'low'
            
            # HTML 테스트 페이지들은 최우선
            if 'test.html' in file_path or 'index.html' in file_path:
                priority = 'high'
            # JavaScript 파일들은 중간 우선순위  
            elif file_path.endswith('.js'):
                priority = 'medium'
            # README, 설명 파일들은 중간 우선순위
            elif any(x in file_path.lower() for x in ['readme', 'description', 'about']):
                priority = 'medium'
            
            update_plan[f'{priority}_priority_files'].append({
                'file': file_path,
                'matches': data['total_matches'],
                'modifications_needed': [
                    '질문 개수를 10/50개 → 20개로 변경',
                    '결과 유형을 8가지 → 4가지로 변경',
                    '테스트 설명 텍스트 업데이트',
                    '소요 시간 정보 업데이트'
                ]
            })
        
        # 텍스트 교체 규칙 생성
        update_plan['text_replacements'] = {
            r'10개.*질문|질문.*10개': standard_texts['question_count_text'],
            r'50개.*질문|질문.*50개': standard_texts['question_count_text'], 
            r'8가지.*유형|유형.*8가지': standard_texts['result_count_text'],
            r'약 3-5분|3-5분 소요': standard_texts['test_time_estimate'],
            # 기존 설명을 새로운 설명으로
            r'10개의.*질문을.*통해.*분석': standard_texts['test_description_long']
        }
        
        return update_plan
    
    def execute_updates(self, update_plan, dry_run=True):
        """실제 파일 수정 실행"""
        
        if dry_run:
            print("DRY RUN 모드 - 실제 파일은 수정하지 않음")
        
        results = {
            'updated_files': [],
            'errors': [],
            'total_changes': 0
        }
        
        # 우선순위 순으로 처리
        all_files = (update_plan['high_priority_files'] + 
                    update_plan['medium_priority_files'] + 
                    update_plan['low_priority_files'])
        
        for file_info in all_files:
            file_path = file_info['file']
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    original_content = f.read()
                
                modified_content = original_content
                changes_made = 0
                
                # 각 교체 규칙 적용
                for pattern, replacement in update_plan['text_replacements'].items():
                    matches = re.findall(pattern, modified_content, re.IGNORECASE)
                    if matches:
                        modified_content = re.sub(pattern, replacement, modified_content, flags=re.IGNORECASE)
                        changes_made += len(matches)
                
                if changes_made > 0:
                    if not dry_run:
                        # 백업 생성
                        backup_path = f"{file_path}.backup"
                        with open(backup_path, 'w', encoding='utf-8') as f:
                            f.write(original_content)
                        
                        # 수정된 내용 저장
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(modified_content)
                    
                    results['updated_files'].append({
                        'file': file_path,
                        'changes': changes_made,
                        'status': 'updated' if not dry_run else 'would_update'
                    })
                    results['total_changes'] += changes_made
                    
            except Exception as e:
                results['errors'].append({
                    'file': file_path,
                    'error': str(e)
                })
        
        return results
    
    def run_full_analysis(self):
        """전체 분석 실행"""
        
        print("테토-에겐 관련 모든 파일 스캔 중...")
        references = self.find_all_teto_references()
        
        print("일관성 문제 분석 중...")
        inconsistencies = self.analyze_inconsistencies(references)
        
        print("업데이트 계획 생성 중...")
        update_plan = self.create_update_plan(references, inconsistencies)
        
        print("실행 계획 검토 (DRY RUN)...")
        dry_run_results = self.execute_updates(update_plan, dry_run=True)
        
        # 결과 저장
        full_analysis = {
            'timestamp': '2025-07-23',
            'references_found': references,
            'inconsistencies': inconsistencies,
            'update_plan': update_plan,
            'dry_run_results': dry_run_results
        }
        
        with open('teto_dependency_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(full_analysis, f, ensure_ascii=False, indent=2)
        
        return full_analysis

if __name__ == "__main__":
    analyzer = DependencyChainAnalyzer()
    analysis = analyzer.run_full_analysis()
    
    print(f"\n분석 완료!")
    print(f"발견된 관련 파일: {len(analysis['references_found'])}개")
    print(f"일관성 문제: {len(analysis['inconsistencies'])}개") 
    print(f"수정 예정 파일: {len(analysis['dry_run_results']['updated_files'])}개")
    print(f"예상 변경사항: {analysis['dry_run_results']['total_changes']}개")
    print(f"\n상세 분석 결과: teto_dependency_analysis.json")