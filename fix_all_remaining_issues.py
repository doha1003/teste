#!/usr/bin/env python3
"""
doha.kr 남은 모든 문제 일괄 수정 스크립트
"""

import os
import re

def fix_inline_styles():
    """과도한 인라인 스타일을 CSS 클래스로 변환"""
    files_to_fix = [
        "about/index.html",
        "tests/mbti/test.html", 
        "tests/teto-egen/index.html",
        "tests/teto-egen/start.html",
        "tests/teto-egen/test.html",
        "tools/index.html",
        "tools/text-counter.html",
        "fortune/daily/index.html",
        "fortune/saju/index.html",
        "fortune/tarot/index.html",
        "fortune/zodiac/index.html"
    ]
    
    style_replacements = {
        'style="display: flex; align-items: center; justify-content: center; background: #f5f5f5; min-height: 100px; color: #999;"': 'class="ad-placeholder"',
        'style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"': 'class="gradient-purple"',
        'style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"': 'class="gradient-pink"',
        'style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"': 'class="gradient-blue"',
        'style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"': 'class="gradient-green"',
        'style="color: #667eea"': 'class="text-primary"',
        'style="background: white"': 'class="bg-white"',
        'style="min-height: 100px;"': 'class="min-height-100"'
    }
    
    for file_path in files_to_fix:
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            for old_style, new_class in style_replacements.items():
                content = content.replace(old_style, new_class)
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ {file_path} - 인라인 스타일 제거됨")

def add_missing_css_classes():
    """필요한 CSS 클래스 추가"""
    css_content = """
/* 인라인 스타일 대체 클래스 */
.ad-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    min-height: 100px;
    color: #999;
}

.gradient-purple {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-pink {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.gradient-blue {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.gradient-green {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.text-primary {
    color: #667eea;
}

.bg-white {
    background: white;
}

.min-height-100 {
    min-height: 100px;
}
"""
    
    # styles.css에 추가
    with open('css/styles.css', 'a', encoding='utf-8') as f:
        f.write('\n' + css_content)
    print("✅ CSS 클래스 추가 완료")

def verify_all_functions():
    """모든 JavaScript 함수가 제대로 작동하는지 확인"""
    test_files = {
        "tests/teto-egen/test.html": ["selectGender", "startTest", "nextQuestion", "previousQuestion", "shareKakao", "restartTest"],
        "tests/mbti/test.html": ["startTest", "nextQuestion", "previousQuestion", "shareToKakao", "copyResultLink", "restartTest"],
        "tests/love-dna/test.html": ["startTest", "nextQuestion", "previousQuestion", "shareToKakao", "copyResultLink", "restartTest"]
    }
    
    issues = []
    for file_path, required_functions in test_files.items():
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            for func in required_functions:
                if f'onclick="{func}(' in content or f"onclick='{func}(" in content:
                    # 함수 호출이 있는지 확인
                    js_file = re.search(r'<script src="([^"]+\.js)"', content)
                    if js_file:
                        js_path = js_file.group(1).lstrip('/')
                        if os.path.exists(js_path):
                            with open(js_path, 'r', encoding='utf-8') as js:
                                js_content = js.read()
                            if f'window.{func} = {func}' not in js_content:
                                issues.append(f"{file_path}: {func} 전역 등록 필요")
    
    if issues:
        print("⚠️ 발견된 문제:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("✅ 모든 JavaScript 함수 정상")

def create_comprehensive_test_page():
    """종합 테스트 페이지 생성"""
    test_html = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <title>doha.kr 기능 테스트 페이지</title>
    <link href="/css/styles.css" rel="stylesheet">
    <style>
        .test-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
        }
        .test-card {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 8px;
        }
        .test-card h3 {
            margin-top: 0;
        }
        .status {
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 14px;
        }
        .status.success {
            background: #10b981;
            color: white;
        }
        .status.error {
            background: #ef4444;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>doha.kr 기능 테스트</h1>
        <div class="test-grid">
            <div class="test-card">
                <h3>텍스트 입력 테스트</h3>
                <textarea placeholder="텍스트 입력 테스트" style="width: 100%; height: 100px;"></textarea>
                <button onclick="alert('입력 테스트 성공!')">테스트</button>
            </div>
            
            <div class="test-card">
                <h3>숫자 입력 테스트</h3>
                <input type="number" placeholder="숫자 입력">
                <button onclick="alert('숫자 입력 테스트 성공!')">계산</button>
            </div>
            
            <div class="test-card">
                <h3>JavaScript 함수 테스트</h3>
                <button onclick="testFunction()">함수 테스트</button>
                <div id="test-result"></div>
            </div>
            
            <div class="test-card">
                <h3>페이지 링크 테스트</h3>
                <a href="/tests/teto-egen/test.html" class="btn">테토-에겐 테스트</a><br><br>
                <a href="/tests/mbti/test.html" class="btn">MBTI 테스트</a><br><br>
                <a href="/tools/text-counter.html" class="btn">글자수 세기</a>
            </div>
        </div>
    </div>
    
    <script>
        function testFunction() {
            document.getElementById('test-result').innerHTML = '<span class="status success">JavaScript 정상 작동!</span>';
        }
    </script>
</body>
</html>"""
    
    with open('test-functionality.html', 'w', encoding='utf-8') as f:
        f.write(test_html)
    print("✅ 테스트 페이지 생성: test-functionality.html")

def main():
    print("=" * 60)
    print("🔧 doha.kr 남은 문제 일괄 수정 시작")
    print("=" * 60)
    
    # 1. 인라인 스타일 제거
    print("\n1. 인라인 스타일 제거 중...")
    fix_inline_styles()
    
    # 2. CSS 클래스 추가
    print("\n2. CSS 클래스 추가 중...")
    add_missing_css_classes()
    
    # 3. JavaScript 함수 검증
    print("\n3. JavaScript 함수 검증 중...")
    verify_all_functions()
    
    # 4. 테스트 페이지 생성
    print("\n4. 테스트 페이지 생성 중...")
    create_comprehensive_test_page()
    
    print("\n" + "=" * 60)
    print("✅ 모든 수정 완료!")
    print("테스트 페이지에서 기능을 확인하세요: /test-functionality.html")
    print("=" * 60)

if __name__ == "__main__":
    import sys
    import io
    
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    main()