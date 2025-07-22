#!/usr/bin/env python3
"""
doha.kr 정확한 구현 상태 확인
실제 HTML 구조를 파싱하여 정확한 구현 상태 확인
"""

import os
import re
import json
from datetime import datetime
from bs4 import BeautifulSoup

def check_actual_implementation(page_path):
    """실제 HTML을 파싱하여 구현 상태 확인"""
    if not os.path.exists(page_path):
        return None
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    result = {
        "exists": True,
        "title": soup.title.string if soup.title else "제목 없음",
        "forms": len(soup.find_all('form')),
        "inputs": len(soup.find_all('input')),
        "buttons": len(soup.find_all('button')),
        "textareas": len(soup.find_all('textarea')),
        "selects": len(soup.find_all('select')),
        "scripts": len(soup.find_all('script', src=True)),
        "has_navigation": bool(soup.find(id='navbar-placeholder')),
        "has_footer": bool(soup.find(id='footer-placeholder')),
        "special_elements": {}
    }
    
    # 페이지별 특수 요소 확인
    if 'index.html' in page_path:
        result['special_elements'] = {
            "service_cards": len(soup.find_all(class_='service-card')),
            "has_hero": bool(soup.find(class_='hero') or soup.find(class_='header')),
            "has_cta": bool(soup.find(class_='cta')),
            "has_stats": bool(soup.find(id='service-count')),
            "has_filter": bool(soup.find_all(class_='tab-button'))
        }
    
    elif 'teto-egen/test.html' in page_path:
        result['special_elements'] = {
            "has_gender_selection": bool(soup.find(id='gender-screen')),
            "has_intro": bool(soup.find(id='intro-screen')),
            "has_test": bool(soup.find(id='test-screen')),
            "has_result": bool(soup.find(id='result-screen')),
            "has_progress": bool(soup.find(id='progress')),
            "has_navigation_buttons": bool(soup.find(id='prev-btn') and soup.find(id='next-btn')),
            "has_share": 'shareKakao' in content
        }
    
    elif 'mbti/test.html' in page_path:
        result['special_elements'] = {
            "has_intro": bool(soup.find(id='intro-screen')),
            "has_questions": bool(soup.find(id='question')),
            "has_options": bool(soup.find(class_='option-btn')),
            "has_result": bool(soup.find(id='result-screen')),
            "has_progress": bool(soup.find(class_='progress-bar'))
        }
    
    elif 'text-counter.html' in page_path:
        result['special_elements'] = {
            "has_textarea": bool(soup.find(id='textInput')),
            "has_char_count": bool(soup.find(id='totalChars')),
            "has_word_count": bool(soup.find(id='words')),
            "has_clear_button": 'clearText' in content,
            "has_copy_button": 'copyText' in content,
            "has_realtime": 'oninput' in content
        }
    
    elif 'saju/index.html' in page_path:
        result['special_elements'] = {
            "has_form": bool(soup.find('form')),
            "has_name_input": bool(soup.find(id='userName')),
            "has_gender": bool(soup.find(id='gender')),
            "has_birth_inputs": bool(soup.find(id='birthYear')),
            "has_time_select": bool(soup.find(id='birthTime')),
            "has_lunar": bool(soup.find(id='isLunar')),
            "has_result_area": bool(soup.find(id='sajuResult'))
        }
    
    return result

def main():
    pages_to_check = [
        "index.html",
        "tests/teto-egen/test.html",
        "tests/mbti/test.html",
        "tools/text-counter.html",
        "fortune/saju/index.html"
    ]
    
    print("=" * 80)
    print("🔍 doha.kr 정확한 구현 상태 확인")
    print("=" * 80)
    print(f"확인 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    results = {}
    
    for page in pages_to_check:
        result = check_actual_implementation(page)
        if result:
            results[page] = result
            
            print(f"\n📄 {page}")
            print(f"제목: {result['title']}")
            print(f"기본 요소: 폼({result['forms']}), 입력({result['inputs']}), 버튼({result['buttons']})")
            print(f"네비게이션: {'✅' if result['has_navigation'] else '❌'}, 푸터: {'✅' if result['has_footer'] else '❌'}")
            
            if result['special_elements']:
                print("특수 요소:")
                for key, value in result['special_elements'].items():
                    if isinstance(value, bool):
                        print(f"  • {key}: {'✅' if value else '❌'}")
                    else:
                        print(f"  • {key}: {value}")
    
    # 정확한 완성도 계산
    print(f"\n\n{'='*80}")
    print("📊 정확한 구현 통계")
    print(f"{'='*80}")
    
    implementation_scores = {
        "index.html": {
            "name": "메인 페이지",
            "score": sum([
                results["index.html"]["special_elements"].get("service_cards", 0) > 0,
                results["index.html"]["special_elements"].get("has_hero", False),
                results["index.html"]["special_elements"].get("has_cta", False),
                results["index.html"]["special_elements"].get("has_stats", False),
                results["index.html"]["special_elements"].get("has_filter", False),
                results["index.html"]["has_navigation"],
                results["index.html"]["has_footer"]
            ]) / 7 * 100
        },
        "tests/teto-egen/test.html": {
            "name": "테토-에겐 테스트",
            "score": sum([
                results["tests/teto-egen/test.html"]["special_elements"].get("has_gender_selection", False),
                results["tests/teto-egen/test.html"]["special_elements"].get("has_intro", False),
                results["tests/teto-egen/test.html"]["special_elements"].get("has_test", False),
                results["tests/teto-egen/test.html"]["special_elements"].get("has_result", False),
                results["tests/teto-egen/test.html"]["special_elements"].get("has_progress", False),
                results["tests/teto-egen/test.html"]["special_elements"].get("has_navigation_buttons", False),
                results["tests/teto-egen/test.html"]["special_elements"].get("has_share", False)
            ]) / 7 * 100
        },
        "tools/text-counter.html": {
            "name": "글자수 세기",
            "score": sum([
                results["tools/text-counter.html"]["special_elements"].get("has_textarea", False),
                results["tools/text-counter.html"]["special_elements"].get("has_char_count", False),
                results["tools/text-counter.html"]["special_elements"].get("has_word_count", False),
                results["tools/text-counter.html"]["special_elements"].get("has_clear_button", False),
                results["tools/text-counter.html"]["special_elements"].get("has_copy_button", False),
                results["tools/text-counter.html"]["special_elements"].get("has_realtime", False)
            ]) / 6 * 100
        },
        "fortune/saju/index.html": {
            "name": "사주팔자",
            "score": sum([
                results["fortune/saju/index.html"]["special_elements"].get("has_form", False),
                results["fortune/saju/index.html"]["special_elements"].get("has_name_input", False),
                results["fortune/saju/index.html"]["special_elements"].get("has_gender", False),
                results["fortune/saju/index.html"]["special_elements"].get("has_birth_inputs", False),
                results["fortune/saju/index.html"]["special_elements"].get("has_time_select", False),
                results["fortune/saju/index.html"]["special_elements"].get("has_lunar", False),
                results["fortune/saju/index.html"]["special_elements"].get("has_result_area", False)
            ]) / 7 * 100
        }
    }
    
    for page, data in implementation_scores.items():
        if page in results:
            status = "🟢" if data["score"] >= 80 else "🟡" if data["score"] >= 60 else "🔴"
            print(f"{status} {data['name']}: {data['score']:.1f}%")
    
    avg_score = sum([data["score"] for data in implementation_scores.values()]) / len(implementation_scores)
    print(f"\n평균 구현율: {avg_score:.1f}%")
    
    # JSON 저장
    with open('accurate_implementation_check.json', 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'results': results,
            'scores': implementation_scores,
            'average_score': avg_score
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n📁 상세 리포트가 accurate_implementation_check.json에 저장되었습니다.")

if __name__ == "__main__":
    import sys
    import io
    
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    # BeautifulSoup 설치 확인
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        print("BeautifulSoup4가 설치되지 않았습니다.")
        print("정규식으로 대체 분석을 수행합니다.")
        # 정규식 기반 대체 구현
        import re
        
        class BeautifulSoup:
            def __init__(self, html, parser):
                self.html = html
                
            def find(self, **kwargs):
                if 'id' in kwargs:
                    pattern = f'id=["\']?{kwargs["id"]}["\']?'
                    return bool(re.search(pattern, self.html))
                return None
                
            def find_all(self, tag=None, **kwargs):
                if tag:
                    return re.findall(f'<{tag}[^>]*>', self.html)
                if 'class_' in kwargs:
                    pattern = f'class=["\'][^"\']*{kwargs["class_"]}[^"\']*["\']'
                    return re.findall(pattern, self.html)
                return []
            
            @property
            def title(self):
                match = re.search(r'<title[^>]*>(.*?)</title>', self.html)
                return type('', (), {'string': match.group(1) if match else None})()
    
    main()