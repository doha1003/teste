from playwright.sync_api import sync_playwright
import time
import os

def capture_live_site():
    print("GitHub Pages 배포 대기 중... (2분)")
    time.sleep(120)  # 2분 대기
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 실제 사이트 접속
        url = "https://doha.kr"
        print(f"\n접속 중: {url}")
        
        page.goto(url, wait_until='networkidle')
        page.wait_for_timeout(3000)
        
        # 스크린샷 디렉토리 설정
        screenshots_dir = os.path.join(os.path.dirname(__file__), "screenshots")
        os.makedirs(screenshots_dir, exist_ok=True)
        
        # 라이트모드 캡처
        page.screenshot(path=os.path.join(screenshots_dir, "live_site_light.png"), full_page=True)
        print("[OK] 라이트모드 캡처 완료")
        
        # 다크모드 토글 클릭
        try:
            page.click('.dark-mode-toggle', timeout=5000)
            page.wait_for_timeout(500)
            print("[OK] 다크모드 토글 완료")
        except:
            print("[WARN] 다크모드 토글 버튼을 찾을 수 없음")
        
        # 다크모드 캡처
        page.screenshot(path=os.path.join(screenshots_dir, "live_site_dark.png"), full_page=True)
        print("[OK] 다크모드 캡처 완료")
        
        # 다른 페이지들도 확인
        pages_to_check = [
            "/tests/mbti/test.html",
            "/tools/text-counter.html",
            "/fortune/saju/"
        ]
        
        for path in pages_to_check:
            page.goto(f"{url}{path}", wait_until='networkidle')
            page.wait_for_timeout(2000)
            filename = f"live_{path.replace('/', '_').replace('.html', '')}.png"
            page.screenshot(path=os.path.join(screenshots_dir, filename))
            print(f"[OK] {path} 캡처 완료")
        
        browser.close()
        print("\n실제 사이트 캡처 완료!")

if __name__ == "__main__":
    capture_live_site()