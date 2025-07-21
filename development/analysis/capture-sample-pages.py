from playwright.sync_api import sync_playwright
import os

# 샘플 페이지만 캡처 (대표적인 페이지들)
sample_pages = [
    ('/', 'home'),
    ('/tests/mbti/test.html', 'mbti-test'),
    ('/tools/text-counter.html', 'text-counter'),
    ('/fortune/saju/', 'saju'),
    ('/about/', 'about')
]

def capture_sample_pages():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 스크린샷 저장 디렉토리
        os.makedirs('sample_screenshots', exist_ok=True)
        
        for path, name in sample_pages:
            url = f'https://doha.kr{path}'
            
            try:
                print(f"캡처 중: {url}")
                page.goto(url, wait_until='networkidle', timeout=30000)
                page.wait_for_timeout(3000)  # 페이지 로딩 대기
                
                # 라이트모드 캡처
                light_file = f"sample_screenshots/{name}_light.png"
                page.screenshot(path=light_file, full_page=True)
                print(f"[OK] 라이트모드: {light_file}")
                
                # 다크모드 토글
                try:
                    # 다크모드 토글 버튼 클릭
                    page.click('.dark-mode-toggle')
                    page.wait_for_timeout(500)
                except:
                    # 토글 버튼이 없으면 직접 클래스 추가
                    page.evaluate("document.body.classList.add('dark-mode')")
                    page.wait_for_timeout(500)
                
                # 다크모드 캡처
                dark_file = f"sample_screenshots/{name}_dark.png"
                page.screenshot(path=dark_file, full_page=True)
                print(f"[OK] 다크모드: {dark_file}")
                
                # 뷰포트만 캡처 (모바일 사이즈)
                page.set_viewport_size({'width': 375, 'height': 812})
                page.wait_for_timeout(500)
                mobile_file = f"sample_screenshots/{name}_mobile.png"
                page.screenshot(path=mobile_file)
                print(f"[OK] 모바일: {mobile_file}")
                
                # 데스크톱 사이즈로 복귀
                page.set_viewport_size({'width': 1920, 'height': 1080})
                
                print("-" * 50)
                
            except Exception as e:
                print(f"[ERROR] {url}: {str(e)}")
        
        browser.close()
        print("\n샘플 스크린샷 캡처 완료!")

if __name__ == "__main__":
    capture_sample_pages()