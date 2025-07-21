from playwright.sync_api import sync_playwright
import os
from datetime import datetime

# 캡처할 페이지 목록
pages_to_capture = [
    ('/', 'home'),
    ('/tests/', 'tests-index'),
    ('/tests/mbti/', 'tests-mbti-index'),
    ('/tests/mbti/test.html', 'tests-mbti-test'),
    ('/tests/teto-egen/', 'tests-teto-index'),
    ('/tests/teto-egen/test.html', 'tests-teto-test'),
    ('/tests/love-dna/', 'tests-love-index'),
    ('/tests/love-dna/test.html', 'tests-love-test'),
    ('/tools/', 'tools-index'),
    ('/tools/text-counter.html', 'tools-text-counter'),
    ('/tools/bmi-calculator.html', 'tools-bmi'),
    ('/tools/salary-calculator.html', 'tools-salary'),
    ('/fortune/', 'fortune-index'),
    ('/fortune/daily/', 'fortune-daily'),
    ('/fortune/saju/', 'fortune-saju'),
    ('/fortune/tarot/', 'fortune-tarot'),
    ('/fortune/zodiac/', 'fortune-zodiac'),
    ('/fortune/zodiac-animal/', 'fortune-zodiac-animal'),
    ('/about/', 'about'),
    ('/contact/', 'contact'),
    ('/faq/', 'faq'),
    ('/privacy/', 'privacy'),
    ('/terms/', 'terms'),
    ('/404.html', '404')
]

def capture_all_pages():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # 데스크톱 및 모바일 뷰포트
        viewports = [
            {'name': 'desktop', 'width': 1920, 'height': 1080},
            {'name': 'mobile', 'width': 375, 'height': 812}
        ]
        
        # 스크린샷 저장 디렉토리 생성
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        screenshot_dir = f'screenshots_{timestamp}'
        os.makedirs(screenshot_dir, exist_ok=True)
        
        for viewport in viewports:
            print(f"\n{viewport['name'].upper()} 뷰포트 캡처 시작...")
            
            page = browser.new_page()
            page.set_viewport_size({'width': viewport['width'], 'height': viewport['height']})
            
            for path, name in pages_to_capture:
                url = f'https://doha.kr{path}'
                filename = f"{screenshot_dir}/{viewport['name']}_{name}.png"
                
                try:
                    print(f"캡처 중: {url}")
                    page.goto(url, wait_until='networkidle', timeout=60000)
                    page.wait_for_timeout(2000)  # 애니메이션 완료 대기
                    
                    # 전체 페이지 스크린샷
                    page.screenshot(path=filename, full_page=True)
                    print(f"[OK] 저장됨: {filename}")
                    
                    # 다크모드 토글 후 캡처
                    dark_filename = f"{screenshot_dir}/{viewport['name']}_{name}_dark.png"
                    page.evaluate("document.body.classList.add('dark-mode')")
                    page.wait_for_timeout(500)
                    page.screenshot(path=dark_filename, full_page=True)
                    print(f"[OK] 다크모드 저장됨: {dark_filename}")
                    
                    # 라이트모드로 복귀
                    page.evaluate("document.body.classList.remove('dark-mode')")
                    
                except Exception as e:
                    print(f"[ERROR] 오류 발생 ({url}): {str(e)}")
            
            page.close()
        
        browser.close()
        print(f"\n모든 스크린샷이 {screenshot_dir} 디렉토리에 저장되었습니다!")
        print(f"총 {len(pages_to_capture) * len(viewports) * 2}개의 스크린샷 생성 완료")

if __name__ == "__main__":
    capture_all_pages()