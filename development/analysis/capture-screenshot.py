from playwright.sync_api import sync_playwright
import os

def capture_screenshots():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 메인 페이지 캡처
        print("메인 페이지 캡처 중...")
        page.goto('https://doha.kr', wait_until='networkidle')
        page.wait_for_timeout(3000)  # 3초 대기
        page.screenshot(path='main-page.png', full_page=True)
        
        # 뷰포트 크기도 캡처
        viewport_screenshot = page.screenshot(path='main-viewport.png')
        
        browser.close()
        print("스크린샷 저장 완료\!")

if __name__ == "__main__":
    capture_screenshots()
