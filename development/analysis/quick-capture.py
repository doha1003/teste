from playwright.sync_api import sync_playwright
import os

def quick_capture():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 로컬 파일로 직접 접근
        file_path = f"file:///{os.getcwd()}/index.html".replace("\\", "/")
        
        print(f"캡처 중: {file_path}")
        page.goto(file_path)
        page.wait_for_timeout(2000)
        
        # 라이트모드
        page.screenshot(path="new_design_light.png", full_page=True)
        print("[OK] 라이트모드 캡처 완료")
        
        # 다크모드 활성화
        page.evaluate("""
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'dark');
        """)
        page.wait_for_timeout(500)
        
        # 다크모드
        page.screenshot(path="new_design_dark.png", full_page=True)
        print("[OK] 다크모드 캡처 완료")
        
        # 모바일 뷰
        page.set_viewport_size({'width': 375, 'height': 812})
        page.wait_for_timeout(500)
        page.screenshot(path="new_design_mobile.png")
        print("[OK] 모바일 캡처 완료")
        
        browser.close()

if __name__ == "__main__":
    quick_capture()